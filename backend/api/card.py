from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from models.database import cardholders_collection

router = APIRouter()

# Request Model for Card Registration
class CardRegisterRequest(BaseModel):
    card_number: str
    cardholder_name: str
    expiry: str
    mobile_number: str
    user_email: str

# Request Model for Fetching Mobile Number
class CardNumberRequest(BaseModel):
    card_number: str

# ✅ Register a New Card
@router.post("/register")
async def register_card_api(request: CardRegisterRequest):
    existing_card = cardholders_collection.find_one({"card_number": request.card_number})

    if existing_card:
        raise HTTPException(status_code=400, detail="Card is already registered")

    cardholders_collection.insert_one({
        "card_number": request.card_number,
        "cardholder_name": request.cardholder_name,
        "expiry": request.expiry,
        "mobile_number": request.mobile_number,
        "user_email": request.user_email,
    })

    return {"message": "Card registered successfully"}

# ✅ Get Registered Mobile Number (Fixed API Route)
@router.post("/get-mobile-number")
async def get_mobile_number(request: CardNumberRequest):
    """
    Fetch the registered mobile number linked to the card number.
    """
    formatted_card_number = request.card_number.replace(" ", "").strip()

    card_data = cardholders_collection.find_one({"card_number": formatted_card_number})

    if not card_data:
        raise HTTPException(status_code=404, detail="Card not found")

    mobile_number = card_data.get("mobile_number")
    if not mobile_number:
        raise HTTPException(status_code=400, detail="Mobile number not linked to this card")

    return {"mobile_number": mobile_number}
