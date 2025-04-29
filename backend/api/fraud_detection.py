from fastapi import APIRouter, HTTPException, Depends
from models.fraud_logs import log_fraud_attempt
from services.ml_fraud_detection import detect_fraud
from models.database import fraud_logs_collection
from api.auth import get_current_user
from pydantic import BaseModel
import logging
from datetime import datetime

router = APIRouter()

# ✅ Fraud Check Model
class FraudCheckRequest(BaseModel):
    amount: float
    payment_method: str
    location: str
    device: str
    ip_address: str

logger = logging.getLogger("fraud_detection")
logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s:%(message)s')

def log_payment_event(user_identifier: str, transaction_id: str, event: str, details: str = ""):
    logger.info(f"User: {user_identifier}, Transaction: {transaction_id}, Event: {event}, Details: {details}")

# ✅ Fraud Detection API    
@router.post("/check")
async def check_fraudulent_transaction(request: FraudCheckRequest, current_user: dict = Depends(get_current_user)):
    """
    ✅ Uses ML-based fraud detection and predefined rules to check for fraudulent transactions.
    """
    transaction_data = {
        "amount": request.amount,
        "payment_method": request.payment_method,
        "status": "Success",
        "user_email": current_user["email"],
        "location": request.location,
        "device": request.device,
        "ip_address": request.ip_address
    }

    # ✅ Use ML Model for Fraud Detection
    is_fraudulent = detect_fraud(transaction_data)

    # ✅ Apply Additional Rules for Fraud Detection
    reason = []
    if request.amount > 10000:
        is_fraudulent = True
        reason.append("High transaction amount")
    
    suspicious_locations = ["Russia", "North Korea", "Iran"]
    if request.location in suspicious_locations:
        is_fraudulent = True
        reason.append("Unusual location")
    
    if request.device == "Unknown":
        is_fraudulent = True
        reason.append("Unrecognized device")

    # ✅ If Fraud Detected, Log It and Block Transaction
    if is_fraudulent:
        log_fraud_attempt(current_user["email"], transaction_data)
        fraud_logs_collection.insert_one({
            "user_email": current_user["email"],
            "amount": request.amount,
            "payment_method": request.payment_method,
            "location": request.location,
            "device": request.device,
            "ip_address": request.ip_address,
            "is_fraud": True,
            "reason": ", ".join(reason),
            "timestamp": datetime.utcnow()
        })
        raise HTTPException(status_code=403, detail=f"Potential Fraud Detected! Reason: {', '.join(reason)}")

    return {"message": "Transaction is Secure!"}
