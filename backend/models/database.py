from pymongo import MongoClient

MONGO_URI = "mongodb://localhost:27017/"
client = MongoClient(MONGO_URI)
db = client["secure_payment_db"]

users_collection = db["users"]
transactions_collection = db["transactions"]
fraud_logs_collection = db["fraud_logs"]
cardholders_collection = db["cardholders"]
banks_collection = db["banks"]

print("Connected to MongoDB - Database Initialized")
