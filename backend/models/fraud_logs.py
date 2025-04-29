from pymongo import MongoClient
from datetime import datetime

# ✅ Connect to MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["secure_payment_db"]
fraud_logs_collection = db["fraud_logs"]

# ✅ Function to Log Fraud Attempts
def log_fraud_attempt(user_email: str, transaction_data: dict):
    """
    Logs a fraud attempt in the database.

    :param user_email: Email of the user associated with the fraudulent transaction
    :param transaction_data: Transaction details (amount, payment method, etc.)
    """
    fraud_log = {
        "user_email": user_email,
        "amount": transaction_data.get("amount"),
        "payment_method": transaction_data.get("payment_method"),
        "status": transaction_data.get("status"),
        "timestamp": datetime.utcnow(),
        "reason": "Fraudulent transaction detected",
    }
    
    fraud_logs_collection.insert_one(fraud_log)
    print(f"Fraud attempt logged for {user_email}")
    