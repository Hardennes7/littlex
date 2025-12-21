# debug_server.py
from fastapi import FastAPI, Request
from pydantic import BaseModel
import random

app = FastAPI()

class InputText(BaseModel):
    input_text: str

@app.post("/walker/hype_man_pro")
async def hype_man_pro(input_data: InputText, request: Request):
    # Log the request
    print(f"\n{'='*60}")
    print(f"📨 REQUEST RECEIVED:")
    print(f"   Method: {request.method}")
    print(f"   Headers: {dict(request.headers)}")
    print(f"   Client: {request.client}")
    print(f"   Body: {await request.body()}")
    print(f"{'='*60}\n")
    
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

@app.get("/walker/hype_man_pro")
async def get_hype_man_pro(request: Request):
    # Log GET requests too
    print(f"\n{'='*60}")
    print(f"⚠️  GET REQUEST RECEIVED (WRONG METHOD!):")
    print(f"   Method: {request.method}")
    print(f"   Headers: {dict(request.headers)}")
    print(f"   Client: {request.client}")
    print(f"{'='*60}\n")
    
    return {
        "error": "Method Not Allowed",
        "message": "This endpoint requires POST method",
        "correct_usage": {
            "method": "POST",
            "url": "/walker/hype_man_pro",
            "body": {"input_text": "Your text here"}
        }
    }

@app.get("/")
async def root():
    return {
        "message": "✨ LittleX AI Playground",
        "description": "🚀 Hype It Up!",
        "endpoints": {
            "hype_man_pro": "POST /walker/hype_man_pro",
            "docs": "/docs",
            "redoc": "/redoc"
        }
    }
