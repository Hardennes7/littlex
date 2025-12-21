import os
from typing import List, Dict, Any

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY") or os.getenv("OPENAI_API_KEY")

try:
    import openai
    if OPENAI_API_KEY:
        openai.api_key = OPENAI_API_KEY
except Exception:
    openai = None


class LLMAdapter:
    def __init__(self):
        self.provider = os.getenv("LLM_PROVIDER", "openai")

    def suggest(self, prompt: str, style: str = "viral") -> List[str]:
        if openai and OPENAI_API_KEY:
            try:
                resp = openai.ChatCompletion.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": "You are a creative social media assistant."},
                        {"role": "user", "content": f"Generate 3 short content suggestions for: {prompt} (style: {style})"}
                    ],
                    max_tokens=200,
                    n=1,
                    temperature=0.8,
                )
                text = resp.choices[0].message.content.strip()
                # try parse lines
                lines = [l.strip() for l in text.split('\n') if l.strip()]
                if len(lines) >= 3:
                    return lines[:3]
                return [text]
            except Exception:
                pass

        # Fallback heuristic
        parts = [p.strip() for p in prompt.split('.') if p.strip()]
        suggestions = []
        for p in parts[:3]:
            suggestions.append((p[:140] + ("..." if len(p) > 140 else "")))
        if not suggestions:
            suggestions = [prompt[:140]]
        return suggestions

    def summarize(self, messages: List[str]) -> str:
        combined = "\n".join(messages)
        if openai and OPENAI_API_KEY:
            try:
                resp = openai.ChatCompletion.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": "You are a helpful assistant that summarizes conversations."},
                        {"role": "user", "content": f"Summarize the following messages in one short paragraph:\n{combined}"}
                    ],
                    max_tokens=200,
                    temperature=0.3,
                )
                return resp.choices[0].message.content.strip()
            except Exception:
                pass

        # simple heuristic: first 50 words
        words = combined.split()
        return " ".join(words[:50]) + ("..." if len(words) > 50 else "")

    def analyze_viral(self, text: str) -> Dict[str, Any]:
        # lightweight scoring fallback
        words = len(text.split())
        score = min(1.0, 0.2 + (words / 200.0))
        if "!" in text:
            score += 0.05
        return {"viral_score": round(min(score, 1.0), 2)}


llm = LLMAdapter()
