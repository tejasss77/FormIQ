from typing import Dict, List
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, workout_id: int, websocket: WebSocket):
        await websocket.accept()
        if workout_id not in self.active_connections:
            self.active_connections[workout_id] = []
        self.active_connections[workout_id].append(websocket)

    def disconnect(self, workout_id: int, websocket: WebSocket):
        if workout_id in self.active_connections:
            if websocket in self.active_connections[workout_id]:
                self.active_connections[workout_id].remove(websocket)
            if not self.active_connections[workout_id]:
                del self.active_connections[workout_id]

    async def send_json(self, websocket: WebSocket, data: dict):
        try:
            await websocket.send_json(data)
        except Exception:
            pass

manager = ConnectionManager()
