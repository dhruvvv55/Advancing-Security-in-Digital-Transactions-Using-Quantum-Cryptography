from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from datetime import datetime, timedelta
from passlib.context import CryptContext
from jose import JWTError, jwt
from fastapi.security import OAuth2PasswordBearer
from models.database import users_collection
from services.encryption import encrypt_password, decrypt_password
from typing import Optional

router = APIRouter()

SECRET_KEY = "supersecurekey"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class UserRegister(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    email: str
    mobile_number: str = Field(..., pattern=r"^[6-9]\d{9}$")
    password: str = Field(..., min_length=6, max_length=20)


class UserLogin(BaseModel):
    identifier: str  # Can be email or mobile number
    password: str


def create_access_token(identifier: str):
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    data = {"sub": identifier, "exp": expire}
    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)


async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        identifier: str = payload.get("sub")

        if not identifier:
            raise HTTPException(status_code=401, detail="Invalid token")

        user = users_collection.find_one(
            {"$or": [{"email": identifier}, {"mobile_number": identifier}]}
        )
        if not user:
            raise HTTPException(status_code=401, detail="User not found")

        return {"identifier": identifier, "name": user["name"], "mobile_number": user["mobile_number"]}
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


@router.post("/register")
async def register_user(user: UserRegister):
    existing_user = users_collection.find_one(
        {"$or": [{"email": user.email}, {"mobile_number": user.mobile_number}]}
    )
    if existing_user:
        raise HTTPException(status_code=400, detail="Email or Mobile Number already registered")

    encrypted_password, nonce, encryption_key = encrypt_password(user.password)

    users_collection.insert_one({
        "name": user.name,
        "email": user.email,
        "password": encrypted_password,
        "nonce": nonce,
        "encryption_key": encryption_key,
        "mobile_number": user.mobile_number,
        "created_at": datetime.utcnow(),
    })

    return {"message": "User registered successfully! You can now log in."}


@router.post("/login")
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

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "message": "Login successful",
        "user": {
            "name": db_user["name"],
            "identifier": user.identifier,
            "mobile_number": db_user["mobile_number"],
        }
    }
