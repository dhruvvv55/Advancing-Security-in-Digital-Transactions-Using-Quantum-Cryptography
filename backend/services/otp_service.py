import os
import random
from twilio.rest import Client
from pymongo import MongoClient
from datetime import datetime, timedelta
import uuid
from pydantic import BaseModel, Field

# Load Twilio credentials from environment variables
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID", "your_account_sid_here")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN", "your_account_auth_token_here")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER", "your_twilio_number_here")

# Initialize Twilio Client
client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

# Connect to MongoDB
client_mongo = MongoClient("mongodb://localhost:27017/")
db = client_mongo["secure_payment_db"]
otp_collection = db["otp_storage"]

# Pydantic model for sending OTP
class OTPSendRequest(BaseModel):
    card_number: str = Field(..., min_length=16, max_length=19)
    transaction_id: str | None = None  # Optionally provided by the client
    transaction_amount: str | None = "0"  # Default to "0" if not provided
    merchant_name: str | None = "Your Merchant"  # Default merchant name
    validity: str | None = "5 minutes"  # Default validity period

# Pydantic model for verifying OTP
class OTPVerifyRequest(BaseModel):
    transaction_id: str
    mobile_number: str
    otp: str

# Generate a random 6-digit OTP
def generate_otp():
    return str(random.randint(100000, 999999))

# Send OTP via Twilio SMS with rate limiting
def send_otp(mobile_number, transaction_id, transaction_amount="totalAmount", merchant_name="ShopFusion", validity="5 minutes"):
    if not mobile_number:
        return {"status": "failed", "error": "Mobile number is required"}

    # Check if OTP was sent within the last 60 seconds for the given mobile & transaction
    last_otp_entry = otp_collection.find_one({"mobile_number": mobile_number, "transaction_id": transaction_id})
    if last_otp_entry:
        last_sent_time = last_otp_entry.get("timestamp")
        if isinstance(last_sent_time, str):
            last_sent_time = datetime.strptime(last_sent_time, "%Y-%m-%d %H:%M:%S.%f")
        if (datetime.utcnow() - last_sent_time).total_seconds() < 60:
            return {"status": "failed", "message": "Please wait before requesting a new OTP"}

    # Generate a new OTP
    otp = generate_otp()
    try:
        message = client.messages.create(
            body=f"Your OTP for online transaction at {merchant_name} is {otp}. Valid for {validity}. Do not share it.",
            from_=TWILIO_PHONE_NUMBER,
            to=mobile_number
        )
        # Store OTP in MongoDB with expiry and transaction ID
        otp_collection.update_one(
            {"mobile_number": mobile_number, "transaction_id": transaction_id},
            {"$set": {
                "otp": otp,
                "timestamp": datetime.utcnow()
            }},
            upsert=True
        )
        # Generate a new transaction_id if not provided
        final_txn_id = transaction_id or str(uuid.uuid4())
        return {
            "status": "success",
            "message": "OTP sent successfully",
            "mobile_number": mobile_number,
            "transaction_id": final_txn_id
        }
    except Exception as e:
        return {"status": "failed", "error": str(e)}

# Verify OTP Function
def verify_otp(mobile_number, user_otp, transaction_id):
    """Verify OTP using the registered mobile number and transaction ID."""
    if not mobile_number or not transaction_id:
        print("❌ Missing mobile number or transaction ID")
        return {"status": "failed", "message": "Missing mobile number or transaction ID"}

    # Retrieve the OTP entry from the database using both mobile_number and transaction_id
    stored_otp_info = otp_collection.find_one({
        "mobile_number": mobile_number,
        "transaction_id": transaction_id
    })

    if not stored_otp_info:
        print(f"❌ No OTP found for Mobile: {mobile_number} and Transaction ID: {transaction_id}")
        return {"status": "failed", "message": "Invalid OTP or expired"}

    stored_otp = stored_otp_info["otp"]
    timestamp = stored_otp_info["timestamp"]
    print(f"✔ Retrieved OTP: {stored_otp} at Time: {timestamp}")

    if isinstance(timestamp, str):
        timestamp = datetime.strptime(timestamp, "%Y-%m-%d %H:%M:%S.%f")

    if not isinstance(timestamp, datetime):
        print("❌ Invalid timestamp format")
        return {"status": "failed", "message": "Invalid timestamp format"}

    # OTP Expiry Check (5 minutes)
    if (datetime.utcnow() - timestamp) > timedelta(minutes=5):
        otp_collection.delete_one({"mobile_number": mobile_number})
        print("❌ OTP expired")
        return {"status": "failed", "message": "OTP expired"}
    
    if str(user_otp) == str(stored_otp):
        otp_collection.delete_one({"mobile_number": mobile_number})
        print("✅ OTP verified successfully")
        return {"status": "success", "message": "OTP verified successfully"}
    
    print(f"❌ Invalid OTP entered: {user_otp} expected: {stored_otp}")
    return {"status": "failed", "message": "Invalid OTP"}
