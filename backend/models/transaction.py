from models.database import db

# ✅ MongoDB Collection for Transactions
transactions_collection = db["transactions"]

def save_transaction(transaction):
    """
    ✅ Saves a transaction in the database.
    """
    return transactions_collection.insert_one(transaction).inserted_id

def get_transaction(transaction_id):
    """
    ✅ Retrieves a transaction by ID.
    """
    return transactions_collection.find_one({"_id": transaction_id})
