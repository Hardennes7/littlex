from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Any

from .llm_adapter import llm

router = APIRouter()


class SuggestRequest(BaseModel):
    prompt: str
    style: str = "viral"


class SummarizeRequest(BaseModel):
    messages: List[str]


@router.post("/api/ai/suggest")
async def suggest(req: SuggestRequest):
    try:
        out = llm.suggest(req.prompt, req.style)
        return {"success": True, "suggestions": out}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/api/ai/summarize")
async def summarize(req: SummarizeRequest):
    try:
        out = llm.summarize(req.messages)
        return {"success": True, "summary": out}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/api/ai/analyze")
async def analyze(req: SuggestRequest):
    try:
        out = llm.analyze_viral(req.prompt)
        return {"success": True, "analysis": out}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
