from fastapi import APIRouter
from pydantic import BaseModel
import random

router = APIRouter()

class InputText(BaseModel):
    input_text: str

@router.post("/hype_man_pro")
async def hype_man_pro(input_data: InputText):
    # Generate hype response
    hype_responses = [
        f"🔥 {input_data.input_text}? That's absolutely FIRE! 🔥",
        f"🚀 HOLY MOLY! {input_data.input_text} is NEXT LEVEL! 🚀",
        f"✨ {input_data.input_text} just blew my mind! UNREAL! ✨",
        f"🎯 {input_data.input_text} is hitting DIFFERENT! Pure genius! 🎯",
        f"💥 WOW! {input_data.input_text} is changing the game! 💥"
    ]
    
    hype = random.choice(hype_responses)
    
    return {
        "success": True,
        "input": input_data.input_text,
        "hype_response": hype,
        "enhanced": f"{input_data.input_text.upper()}!!!",
        "emoji_blast": "🔥🚀✨🎯💥🎉🤯👑"
    }

@router.get("/")
async def walker_root():
    return {"message": "Walker router is working!"}

@router.get("/test")
async def test():
    return {"status": "ok"}
