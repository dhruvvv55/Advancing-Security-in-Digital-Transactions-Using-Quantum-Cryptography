from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from datetime import datetime
import random
import time
from models.database import transactions_collection
from api.auth import get_current_user
from services.encryption import encrypt_password
from quantum_simulation.quantum_encrypt import encrypt_message

router = APIRouter()


class TransactionRequest(BaseModel):
    amount: float
    payment_method: str
    bank_code: str | None = None
    card_number: str | None = None
    upi_id: str | None = None
    status: str = "Pending"


@router.post("/process")
async def process_payment(transaction: TransactionRequest, current_user: dict = Depends(get_current_user)):
    """
    Simulates a financial transaction with fraud detection and quantum encryption.
    """
    print("Received Transaction Data:", transaction.dict())

    if transaction.amount <= 0:
        raise HTTPException(status_code=400, detail="Invalid transaction amount")

    if transaction.payment_method == "netbanking" and (not transaction.bank_code or not transaction.bank_code.strip()):
        raise HTTPException(status_code=400, detail="Bank code required for Net Banking.")

    if transaction.payment_method == "card" and (not transaction.card_number or not transaction.card_number.strip()):
        raise HTTPException(status_code=400, detail="Card number required for Card Payments.")

    if transaction.payment_method == "upi" and (not transaction.upi_id or not transaction.upi_id.strip()):
        raise HTTPException(status_code=400, detail="UPI ID required for UPI Payments.")

    processing_time = random.randint(3, 7)
    time.sleep(processing_time)

    encrypted_data = encrypt_message(f"{transaction.amount} INR via {transaction.payment_method}", "quantumSecureKey")
    status = "Success" if random.random() > 0.2 else "Failed"

    if "identifier" not in current_user:
        raise HTTPException(status_code=401, detail="User authentication failed")

    transaction_record = {
        "user_identifier": current_user["identifier"],
        "amount": transaction.amount,
        "payment_method": transaction.payment_method,
        "status": status,
        "timestamp": datetime.utcnow(),
        "bank_code": transaction.bank_code,
        "transaction_id": encrypt_password(f"{transaction.amount}-{datetime.utcnow()}"),
        "encrypted_data": encrypted_data
    }

    transactions_collection.insert_one(transaction_record)

    if status == "Failed":
        raise HTTPException(status_code=400, detail="Transaction Failed! Try Again.")

    return {
        "message": "Transaction Processed Successfully!",
        "transaction_id": transaction_record["transaction_id"],
        "processing_time": f"{processing_time} seconds"
    }
