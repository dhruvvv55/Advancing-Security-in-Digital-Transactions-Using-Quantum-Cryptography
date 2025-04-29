from models.database import db

# ✅ MongoDB Collection for Users
users_collection = db["users"]

def create_user(user_data):
    """
    ✅ Saves a new user in the database.
    """
    return users_collection.insert_one(user_data)

def find_user_by_email_or_mobile(identifier):
    """
    ✅ Retrieves a user by email or mobile number.
    """
    return users_collection.find_one({"$or": [{"email": identifier}, {"mobile_number": identifier}]})
