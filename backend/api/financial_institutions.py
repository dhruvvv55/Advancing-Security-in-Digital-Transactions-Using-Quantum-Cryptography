from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from datetime import datetime
from typing import Optional
import random
import asyncio
from models.database import transactions_collection
from api.auth import get_current_user
from services.encryption import encrypt_password
from quantum_simulation.quantum_encrypt import encrypt_message

router = APIRouter()

BANKS = [
    {"name": "HDFC Bank", "code": "HDFC123"},
    {"name": "State Bank of India", "code": "SBI456"},
    {"name": "ICICI Bank", "code": "ICICI789"},
    {"name": "Axis Bank", "code": "AXIS321"},
    {"name": "Kotak Mahindra Bank", "code": "KOTAK654"},
    {"name": "Punjab National Bank", "code": "PNB987"},
]

class TransactionRequest(BaseModel):
    amount: float
    payment_method: str  # Card, UPI, Net Banking
    card_number: Optional[str] = None
    upi_id: Optional[str] = None
    bank_code: Optional[str] = None
    status: Optional[str] = "Pending"  # ✅ Default status to "Pending"

@router.get("/list")
async def get_banks():
    return {"banks": BANKS}

@router.post("/process")
async def process_payment(transaction: TransactionRequest, current_user: dict = Depends(get_current_user)):
    if transaction.amount > 100000:
        raise HTTPException(status_code=403, detail="High-Risk Transaction! Manual Verification Required.")

    if transaction.payment_method == "netbanking" and not transaction.bank_code:
        raise HTTPException(status_code=400, detail="Bank code required for Net Banking.")
    if transaction.payment_method == "card" and not transaction.card_number:
        raise HTTPException(status_code=400, detail="Card number required for Card Payments.")
    if transaction.payment_method == "upi" and not transaction.upi_id:
        raise HTTPException(status_code=400, detail="UPI ID required for UPI Payments.")

    processing_time = random.randint(3, 7)
    await asyncio.sleep(processing_time)

    encrypted_data = encrypt_message(f"{transaction.amount} INR via {transaction.payment_method}", "quantumSecureKey")
    
    encrypted_string = str(encrypted_data)

    status = "Success" if random.random() > 0.2 else "Failed"

    transaction_record = {
        "user_email": current_user["email"],
        "amount": transaction.amount,
        "payment_method": transaction.payment_method,
        "status": status,
        "timestamp": datetime.utcnow(),
        "bank_code": transaction.bank_code,
        "transaction_id": encrypt_password(f"{transaction.amount}-{datetime.utcnow()}"),
        "encrypted_data": encrypted_string
    }
    transactions_collection.insert_one(transaction_record)

    if status == "Failed":
        raise HTTPException(status_code=400, detail="Transaction Failed! Try Again.")

    return {
        "message": "Transaction Processed Successfully!",
        "transaction_id": transaction_record["transaction_id"],
        "processing_time": f"{processing_time} seconds"
    }
