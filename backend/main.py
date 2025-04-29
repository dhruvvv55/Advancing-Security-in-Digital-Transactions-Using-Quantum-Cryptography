from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from datetime import datetime, timedelta
from jose import JWTError, jwt
from pymongo import MongoClient
from passlib.context import CryptContext
import time
import uvicorn
from pydantic import BaseModel, Field
from api.auth import router as auth_router, get_current_user
from api.transactions import router as transactions_router
from api.fraud_detection import router as fraud_router
from api.payment_gateway import store_transaction_on_blockchain
from api.otp import router as otp_router
from api.card import router as card_router
from api.financial_institutions import router as financial_router
from security.firewalls.ddos_protection import RateLimitMiddleware
from security.ssl_config import SSL_CERT_FILE, SSL_KEY_FILE
from monitoring.prometheus_metrics import setup_metrics
from quantum_simulation.quantum_encrypt import encrypt_message
from services.encryption import encrypt_password, decrypt_password
from models.fraud_logs import log_fraud_attempt

app = FastAPI()

app.include_router(transactions_router, prefix="/transactions", tags=["Transactions"])
app.include_router(fraud_router, prefix="/fraud", tags=["Fraud Detection"])
app.include_router(financial_router, prefix="/banks", tags=["Banks"])
app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(otp_router, prefix="/otp", tags=["OTP"])
app.include_router(card_router, prefix="/card", tags=["Card Management"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(RateLimitMiddleware, limit_per_minute=30)

setup_metrics(app)

client = MongoClient("mongodb://localhost:27017/")
db = client["secure_payment_db"]
users_collection = db["users"]
transactions_collection = db["transactions"]

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = "supersecurekey"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password, hashed_password) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(identifier: str):
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    data = {"sub": identifier, "exp": expire}
    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)


async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        identifier: str = payload.get("sub")
        if identifier is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return {"identifier": identifier}
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


@app.post("/auth/register")
async def register_user(
    name: str,
    email: str,
    mobile_number: str,
    password: str
):
    existing_user = users_collection.find_one(
        {"$or": [{"email": email}, {"mobile_number": mobile_number}]}
    )
    if existing_user:
        raise HTTPException(status_code=400, detail="Email or Mobile Number already registered")

    encrypted_password, nonce, encryption_key = encrypt_password(password)

    new_user = {
        "name": name,
        "email": email,
        "mobile_number": mobile_number,
        "password": encrypted_password,
        "nonce": nonce,
        "encryption_key": encryption_key,
        "created_at": datetime.utcnow(),
    }
    users_collection.insert_one(new_user)
    return {"message": "User registered successfully"}


class UserLogin(BaseModel):
    identifier: str
    password: str


@app.post("/auth/login")
async def login_user(user: UserLogin):
    db_user = users_collection.find_one(
        {"$or": [{"email": user.identifier}, {"mobile_number": user.identifier}]}
    )

    if not db_user:
        raise HTTPException(status_code=400, detail="User not found")

    if "nonce" not in db_user or "encryption_key" not in db_user:
        raise HTTPException(status_code=500, detail="Encryption data missing")

    decrypted_password = decrypt_password(
        db_user["password"], db_user["nonce"], db_user["encryption_key"]
    )

    if decrypted_password != user.password:
        raise HTTPException(status_code=400, detail="Incorrect password")

    access_token = create_access_token(user.identifier)

    return {"access_token": access_token, "token_type": "bearer", "message": "Login successful"}


@app.post("/payments/secure-process")
async def secure_payment(
    amount: float,
    payment_method: str,
    card_number: str = None,
    upi_id: str = None,
    bank_code: str = None,
    user=Depends(get_current_user)
):
    if payment_method not in ["card", "upi", "netbanking"]:
        raise HTTPException(status_code=400, detail="Invalid payment method")

    if payment_method == "card" and (not card_number or len(card_number.replace(" ", "")) != 16):
        raise HTTPException(status_code=400, detail="Invalid card details")

    if payment_method == "upi" and (not upi_id or "@" not in upi_id):
        raise HTTPException(status_code=400, detail="Invalid UPI ID")

    if payment_method == "netbanking" and (not bank_code or not bank_code.strip()):
        raise HTTPException(status_code=400, detail="Bank code required for Net Banking")

    time.sleep(6)

    encrypted_data = encrypt_message(f"{amount} INR via {payment_method}", "quantumSecureKey")

    blockchain_tx = store_transaction_on_blockchain(int(amount), payment_method, "Success")

    if "identifier" not in user:
        raise HTTPException(status_code=401, detail="User authentication failed")

    transaction = {
        "user_identifier": user["identifier"],
        "amount": amount,
        "payment_method": payment_method,
        "status": "Success",
        "timestamp": datetime.utcnow(),
        "transaction_id": blockchain_tx
    }
    transactions_collection.insert_one(transaction)

    return {
        "message": "Secure Payment Processed",
        "transaction_id": blockchain_tx,
        "encrypted_data": encrypted_data
    }


@app.get("/health")
async def health_check():
    return {"status": "running", "timestamp": datetime.utcnow()}


if not SSL_CERT_FILE or not SSL_KEY_FILE:
    raise RuntimeError("SSL certificate or key file is missing!")


if __name__ == "__main__":
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        ssl_keyfile=SSL_KEY_FILE,
        ssl_certfile=SSL_CERT_FILE
    )
