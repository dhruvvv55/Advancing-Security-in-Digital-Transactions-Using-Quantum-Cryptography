from pymongo import MongoClient

# ✅ Connect to MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["secure_payment_db"]
cardholders_collection = db["cardholders"]

# ✅ Function to Register Card and Mobile Number
def register_card(card_number, cardholder_name, expiry, mobile_number, user_email):
    """Stores card details with a registered mobile number"""
    existing_card = cardholders_collection.find_one({"card_number": card_number})
    if existing_card:
        return {"error": "Card already registered!"}

    card_data = {
        "card_number": card_number,
        "cardholder_name": cardholder_name,
        "expiry": expiry,
        "mobile_number": mobile_number,
        "user_email": user_email,
    }
    cardholders_collection.insert_one(card_data)
    return {"message": "Card registered successfully"}
