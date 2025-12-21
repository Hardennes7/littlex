Write-Host "🚀 Launching LittleX AI Playground" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Yellow

# Paths
$backend = "C:\Users\hargreaves\Desktop\littlex\littleX\littleX_BE"
$frontend = "C:\Users\hargreaves\Desktop\littlex\littleX\littleX_FE"

# Kill existing processes
Write-Host "1. Cleaning up..." -ForegroundColor Yellow
taskkill /f /im python.exe 2>$null
taskkill /f /im node.exe 2>$null
Start-Sleep -Seconds 2

# Create backend file if missing
Write-Host "2. Setting up backend..." -ForegroundColor Green
if (-not (Test-Path "$backend\proxy_server.py")) {
    Write-Host "   Creating proxy_server.py..." -ForegroundColor Yellow
    @"
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any
import random
from datetime import datetime

app = FastAPI(title="LittleX AI Playground")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class WalkerRequest(BaseModel):
    ctx: Dict[str, Any] = {}

@app.get("/")
def root():
    return {"message": "✨ LittleX Backend Running!", "status": "ready"}

@app.post("/walker/hype_man_pro")
def hype_man_pro(request: WalkerRequest):
    text = request.ctx.get("raw_text", "Awesome!")
    hype = f"🔥 {text.upper()} IS ABSOLUTELY FIRE! 🔥"
    return {
        "report": [{
            "status": "success",
            "hyped_text": hype,
            "original_text": text,
            "emoji_blast": "🔥🚀✨🎯💥"
        }],
        "success": True
    }

@app.post("/walker/get_profile")
def get_profile(request: WalkerRequest):
    username = request.ctx.get("username", "hargreaves")
    return {
        "report": [{
            "username": username,
            "email": f"{username}@example.com",
            "bio": "Building amazing things with AI!"
        }],
        "success": True
    }

@app.post("/walker/load_feed")
def load_feed(request: WalkerRequest):
    return {
        "report": [{
            "feed": [{"id": 1, "text": "LittleX is amazing!", "user": "ai_explorer"}],
            "page": 1,
            "has_more": False
        }],
        "success": True
    }

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting LittleX Backend on http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)
"@ | Out-File -FilePath "$backend\proxy_server.py" -Encoding utf8
}

# Start Backend
Write-Host "3. Starting Backend (port 8000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backend'; .venv\Scripts\Activate.ps1; python proxy_server.py" -WindowStyle Normal

Write-Host "   Waiting for backend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Test backend
Write-Host "4. Testing backend..." -ForegroundColor Yellow
try {
    $test = Invoke-RestMethod -Uri "http://localhost:8000/" -Method Get -TimeoutSec 3
    Write-Host "   ✅ Backend ready: $($test.message)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Backend failed to start" -ForegroundColor Red
    exit
}

# Start Frontend
Write-Host "5. Starting Frontend (port 3000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontend'; if (-not (Test-Path 'node_modules')) { npm install }; npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 8

# Open browser
Write-Host "6. Opening browser..." -ForegroundColor Magenta
Start-Process "http://localhost:3000"
Start-Process "http://localhost:8000/docs"

Write-Host "`n✅ LittleX is running!" -ForegroundColor Green -BackgroundColor DarkBlue
Write-Host "==================================" -ForegroundColor Yellow
Write-Host "🌐 URLs:" -ForegroundColor Cyan
Write-Host "   App:      http://localhost:3000" -ForegroundColor White
Write-Host "   API:      http://localhost:8000" -ForegroundColor White
Write-Host "   API Docs: http://localhost:8000/docs" -ForegroundColor White
Write-Host "`n🛠️  To stop: Close all PowerShell windows" -ForegroundColor Yellow
Write-Host "==================================" -ForegroundColor Yellow
