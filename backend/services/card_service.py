from pymongo import MongoClient

# Connect to MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["secure_payment_db"]
cardholders_collection = db["cardholders"]

# Ensure indexing on card_number for fast lookups
cardholders_collection.create_index("card_number")

def get_registered_mobile(card_number):
    """
    Fetch the registered mobile number linked to a card number.
    Accepts both formatted (with spaces) and unformatted (without spaces) versions.
    """
    if not card_number:
        return None

    # Normalize Card Number (Remove Spaces)
    formatted_card_number = card_number.replace(" ", "").strip()

    # Query MongoDB for the cardholder data
    card_data = cardholders_collection.find_one(
        {
            "$or": [
                {"card_number": formatted_card_number},  # Match non-spaced version
                {"card_number": card_number}            # Match as entered
            ]
        }
    )

    if not card_data:
        return None 

    # Validate Mobile Number Field
    mobile_number = card_data.get("mobile_number")
    if not mobile_number:
        return None

    return mobile_number
