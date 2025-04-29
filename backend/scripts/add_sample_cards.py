from pymongo import MongoClient

# ✅ Connect to MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["secure_payment_db"]
cardholders_collection = db["cardholders"]

# ✅ Sample Card Data (Card Number, Cardholder Name, Expiry Date, Registered Mobile Number, User Email)
sample_cards = [
    {"card_number": "1234567812345678", "cardholder_name": "Dhruv Patel", "expiry": "12/25", "mobile_number": "+918850220781", "user_email": "dhruv@example.com"},
    {"card_number": "9876543298765432", "cardholder_name": "Satyam Pandey", "expiry": "05/27", "mobile_number": "+918177912103", "user_email": "satyam@example.com"},
    {"card_number": "1111222233334444", "cardholder_name": "Yesh Dahiya", "expiry": "03/26", "mobile_number": "+917742558899", "user_email": "yesh@example.com"},
]

# ✅ Insert Data
for card in sample_cards:
    if not cardholders_collection.find_one({"card_number": card["card_number"]}):
        cardholders_collection.insert_one(card)
        print(f"✅ Inserted card: {card['card_number']}")

print("✅ Sample Cards Added Successfully!")
