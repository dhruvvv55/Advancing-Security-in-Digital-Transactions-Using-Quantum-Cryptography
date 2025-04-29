from api.payment_gateway import store_transaction_on_blockchain
from services.ml_fraud_detection import detect_fraud
from services.encryption import encrypt_data
from datetime import datetime
from models.database import transactions_collection

def process_transaction(user_email, amount, payment_method):
    """
    Processes a secure transaction with fraud detection, encryption, and blockchain.

    :param user_email: Email of the user making the transaction
    :param amount: Transaction amount
    :param payment_method: Payment method (card, UPI, netbanking)
    :return: Transaction response
    """
    transaction_data = {
        "user_email": user_email,
        "amount": amount,
        "payment_method": payment_method,
        "timestamp": datetime.utcnow()
    }

    # ✅ Check for Fraud
    is_fraud = detect_fraud(transaction_data)
    if is_fraud:
        return {"status": "Failed", "reason": "Fraudulent transaction detected"}

    # ✅ Encrypt Transaction Data
    encrypted_data, nonce, key = encrypt_data(f"{amount} INR via {payment_method}")

    # ✅ Store Transaction on Blockchain
    blockchain_tx = store_transaction_on_blockchain(int(amount), payment_method, "Success")

    # ✅ Save transaction in MongoDB
    transaction = {
        "user_email": user_email,
        "amount": amount,
        "payment_method": payment_method,
        "status": "Success",
        "timestamp": datetime.utcnow(),
        "transaction_id": blockchain_tx,
        "encrypted_data": encrypted_data,
    }
    transactions_collection.insert_one(transaction)

    return {
        "message": "Transaction processed securely",
        "transaction_id": blockchain_tx,
        "encrypted_data": encrypted_data
    }
