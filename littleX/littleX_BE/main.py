from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"])

class AIRequest(BaseModel):
    prompt: str

@app.get("/")
def root():
    return {"message": "littleX Backend", "port": 8001}

@app.post("/api/login")
async def login(email: str, password: str):
    if email == "hargreavesgito@gmail.com" and password == "correct123":
        return {"success": True, "user": {"email": email}}
    return {"success": False, "error": "Invalid"}

@app.post("/api/ai/hype")
async def ai_hype(request: AIRequest):
    return {
        "success": True,
        "original": request.prompt,
        "enhanced": f"✨ {request.prompt} ✨",
        "hashtags": ["#AI", "#littleX"]
    }

if __name__ == "__main__":
    import uvicorn
    print("✅ Backend on PORT 8001 (8000 was blocked)")
    uvicorn.run(app, host="0.0.0.0", port=8001)
