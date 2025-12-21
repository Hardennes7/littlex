from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

# CORS Configuration - ONLY ONCE!
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define request model for AI endpoint
class AIRequest(BaseModel):
    raw_text: str

class AIContext(BaseModel):
    ctx: AIRequest

# ROUTES
@app.get("/")
def root():
    return {"message": "littleX Backend Running", "port": 8000}

@app.post("/api/login")
def login():
    return {"success": True, "user": {"email": "hargreavesgito@gmail.com"}}

# ADD THIS ENDPOINT - THIS IS WHAT'S MISSING!
@app.post("/api/ai/hype")
def ai_hype(request: AIContext):
    text = request.ctx.raw_text
    return {
        "success": True,
        "status": "success",
        "hyped_text": f"🔥 {text.upper()} 🔥 - GOING VIRAL!",
        "original_text": text,
        "enhanced": f"{text.upper()}!!!",
        "emoji_blast": "🔥🚀✨"
    }

if __name__ == "__main__":
    import uvicorn
    print("✅ Backend starting on http://0.0.0.0:8000")
    print("✅ Endpoints: /, /api/login, /api/ai/hype")
    uvicorn.run(app, host="0.0.0.0", port=8000)