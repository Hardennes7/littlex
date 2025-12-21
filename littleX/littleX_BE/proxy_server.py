from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import random
from datetime import datetime

# ========== CREATE FASTAPI APP ==========
app = FastAPI(
    title="LittleX AI Playground",
    description="✨ FastAPI Backend for LittleX",
    version="1.0.0"
)

# Enable CORS (IMPORTANT for frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (for development)
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

# ========== DATA MODELS ==========
class WalkerRequest(BaseModel):
    ctx: Dict[str, Any] = {}

# ========== MOCK DATABASE ==========
users_db = {
    "hargreaves": {
        "username": "hargreaves",
        "email": "user@example.com",
        "bio": "Building amazing AI projects with LittleX!",
        "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=hargreaves",
        "followers": 42,
        "following": 23,
        "created_at": "2024-01-01"
    }
}

feed_items = [
    {
        "id": 1,
        "user": "ai_explorer",
        "text": "Just deployed my first AI model with LittleX! 🚀",
        "likes": 24,
        "comments": 5,
        "timestamp": "2 hours ago"
    },
    {
        "id": 2,
        "user": "tech_guru",
        "text": "LittleX makes AI development so much fun!",
        "likes": 56,
        "comments": 12,
        "timestamp": "5 hours ago"
    }
]

# ========== ROOT ENDPOINT ==========
@app.get("/")
def root():
    return {
        "message": "✨ LittleX AI Playground Backend",
        "status": "running",
        "endpoints": {
            "hype_man": "POST /walker/hype_man_pro",
            "get_profile": "POST /walker/get_profile",
            "load_feed": "POST /walker/load_feed",
            "update_profile": "POST /walker/update_profile",
            "api_docs": "/docs"
        }
    }

# ========== HYPE MAN PRO ==========
@app.post("/walker/hype_man_pro")
def walker_hype_man_pro(request: WalkerRequest):
    """Generate hype for any text!"""
    raw_text = request.ctx.get("raw_text", "LittleX is awesome!")
    
    hype_options = [
        f"🔥 HOLY SMOKES! '{raw_text}' is ON FIRE! 🔥",
        f"🚀 WOWZA! '{raw_text}' is LAUNCHING TO THE MOON! 🚀",
        f"✨ UNBELIEVABLE! '{raw_text}' is PURE MAGIC! ✨",
        f"🎯 BULLSEYE! '{raw_text}' is HITTING THE TARGET! 🎯",
        f"💥 KABOOM! '{raw_text}' is EXPLODING WITH AWESOME! 💥"
    ]
    
    chosen = random.choice(hype_options)
    
    return {
        "report": [{
            "status": "success",
            "success": True,
            "hyped_text": chosen,
            "original_text": raw_text,
            "enhanced": raw_text.upper() + "!!!",
            "emoji_blast": "🔥🚀✨🎯💥🌟⚡️🌈🎉",
            "timestamp": datetime.now().isoformat()
        }],
        "success": True
    }

# ========== GET PROFILE ==========
@app.post("/walker/get_profile")
def walker_get_profile(request: WalkerRequest):
    """Get user profile"""
    username = request.ctx.get("username", "hargreaves")
    
    if username in users_db:
        profile = users_db[username]
    else:
        profile = {
            "username": username,
            "email": f"{username}@example.com",
            "bio": "New LittleX user!",
            "avatar": f"https://api.dicebear.com/7.x/avataaars/svg?seed={username}",
            "followers": 0,
            "following": 0,
            "created_at": datetime.now().strftime("%Y-%m-%d")
        }
    
    return {
        "report": [profile],
        "success": True
    }

# ========== LOAD FEED ==========
@app.post("/walker/load_feed")
def walker_load_feed(request: WalkerRequest):
    """Load social feed"""
    page = request.ctx.get("page", 1)
    
    return {
        "report": [{
            "status": "success",
            "page": page,
            "feed": feed_items,
            "has_more": False
        }],
        "success": True
    }

# ========== UPDATE PROFILE ==========
@app.post("/walker/update_profile")
def walker_update_profile(request: WalkerRequest):
    """Update user profile"""
    username = request.ctx.get("username", "hargreaves")
    email = request.ctx.get("email", f"{username}@example.com")
    
    # Update or create user
    users_db[username] = {
        "username": username,
        "email": email,
        "bio": request.ctx.get("bio", "AI enthusiast"),
        "avatar": f"https://api.dicebear.com/7.x/avataaars/svg?seed={username}",
        "followers": users_db.get(username, {}).get("followers", 0),
        "following": users_db.get(username, {}).get("following", 0),
        "created_at": users_db.get(username, {}).get("created_at", datetime.now().strftime("%Y-%m-%d"))
    }
    
    return {
        "report": [{
            "status": "success",
            "message": "Profile updated successfully!",
            "username": username,
            "email": email,
            "updated_at": datetime.now().isoformat()
        }],
        "success": True
    }

# ========== HEALTH CHECK ==========
@app.get("/health")
def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

# ========== AI HYPE ENDPOINT ==========
@app.post("/api/ai/hype")
def api_ai_hype(request: WalkerRequest):
    """Generate hype text for frontend / AI features"""
    raw_text = request.ctx.get("raw_text", "LittleX is awesome!")

    hype_options = [
        f"🔥 HOLY SMOKES! '{raw_text}' is ON FIRE! 🔥",
        f"🚀 WOWZA! '{raw_text}' is LAUNCHING TO THE MOON! 🚀",
        f"✨ UNBELIEVABLE! '{raw_text}' is PURE MAGIC! ✨",
        f"🎯 BULLSEYE! '{raw_text}' is HITTING THE TARGET! 🎯",
        f"💥 KABOOM! '{raw_text}' is EXPLODING WITH AWESOME! 💥"
    ]

    chosen = random.choice(hype_options)

    return {
        "report": [{
            "status": "success",
            "success": True,
            "hyped_text": chosen,
            "original_text": raw_text,
            "enhanced": raw_text.upper() + "!!!",
            "emoji_blast": "🔥🚀✨🎯💥🌟⚡️🌈🎉",
            "timestamp": datetime.now().isoformat()
        }],
        "success": True
    }


# ========== START SERVER ==========
if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting LittleX Backend Server...")
    print("   URL: http://localhost:8000")
    print("   Docs: http://localhost:8000/docs")
    print("   Press Ctrl+C to stop\n")
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=False)
