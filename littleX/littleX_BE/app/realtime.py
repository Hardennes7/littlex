from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict, List


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, room: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.setdefault(room, []).append(websocket)

    def disconnect(self, room: str, websocket: WebSocket):
        conns = self.active_connections.get(room, [])
        if websocket in conns:
            conns.remove(websocket)

    async def broadcast(self, room: str, message: str):
        for ws in list(self.active_connections.get(room, [])):
            try:
                await ws.send_text(message)
            except Exception:
                pass


manager = ConnectionManager()
