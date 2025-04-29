from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from services.otp_service import send_otp, verify_otp
from services.card_service import get_registered_mobile
import uuid

router = APIRouter()

class OTPSendRequest(BaseModel):
    card_number: str = Field(..., min_length=16, max_length=19)
    transaction_id: str | None = None  # Optionally provided by the client

class OTPVerifyRequest(BaseModel):
    transaction_id: str
    mobile_number: str
    otp: str

@router.post("/send")
async def send_otp_api(request: OTPSendRequest):
    """
    Fetch the registered mobile number linked to the card and send an OTP.
    Ensure that the transaction ID is included in the process.
    """
    formatted_card_number = request.card_number.replace(" ", "").strip()  # Ensure no extra spaces
    mobile_number = get_registered_mobile(formatted_card_number)

    if not mobile_number:
        raise HTTPException(status_code=400, detail="Card not registered or mobile number missing.")

    # Generate a new transaction_id if not provided
    transaction_id = request.transaction_id or str(uuid.uuid4())
    response = send_otp(mobile_number, transaction_id)

    if "error" in response:
        raise HTTPException(status_code=500, detail=response["error"])

    return {
        "message": "OTP sent successfully",
        "mobile_number": mobile_number,
        "transaction_id": transaction_id
    }

@router.post("/verify")
async def verify_otp_api(request: OTPVerifyRequest):
    """
    Verify the OTP using the registered mobile number and the transaction ID.
    """
    is_valid = verify_otp(request.mobile_number, request.otp, request.transaction_id)

    if is_valid["status"] == "failed":
        raise HTTPException(status_code=400, detail=is_valid["message"])

    return {
        "message": "OTP verified successfully",
        "transaction_id": request.transaction_id
    }
