from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(
    prefix="/walker",
    tags=["Walker APIs"]
)

class WalkerMessage(BaseModel):
    content: str

@router.post("/hype_man")
def hype_man(data: WalkerMessage):
    return {
        "agent": "Hype Man",
        "response": f"🔥 LET’S GO! {data.content.upper()} 🔥"
    }
