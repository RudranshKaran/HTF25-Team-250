"""
Crowd Safety Intelligence System - Backend Server
FastAPI backend with WebSocket support for real-time data streaming
"""

import asyncio
import json
from datetime import datetime
from typing import Set
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(title="Crowd Safety Intelligence System")

# CORS middleware to allow frontend connections
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:3000")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# WebSocket connection manager
class ConnectionManager:
    """Manages WebSocket connections and broadcasts messages to all connected clients"""
    
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()
    
    async def connect(self, websocket: WebSocket):
        """Accept and register a new WebSocket connection"""
        await websocket.accept()
        self.active_connections.add(websocket)
        print(f"Client connected. Total connections: {len(self.active_connections)}")
        
        # Send welcome message to the newly connected client
        await self.send_personal_message({
            "type": "connection",
            "message": "Successfully connected to Crowd Safety Intelligence System",
            "timestamp": datetime.now().isoformat()
        }, websocket)
    
    def disconnect(self, websocket: WebSocket):
        """Remove a WebSocket connection"""
        self.active_connections.discard(websocket)
        print(f"Client disconnected. Total connections: {len(self.active_connections)}")
    
    async def send_personal_message(self, message: dict, websocket: WebSocket):
        """Send a message to a specific client"""
        try:
            await websocket.send_text(json.dumps(message))
        except Exception as e:
            print(f"Error sending personal message: {e}")
    
    async def broadcast(self, message: dict):
        """Broadcast a message to all connected clients"""
        disconnected = set()
        for connection in self.active_connections:
            try:
                await connection.send_text(json.dumps(message))
            except Exception as e:
                print(f"Error broadcasting to client: {e}")
                disconnected.add(connection)
        
        # Clean up disconnected clients
        for conn in disconnected:
            self.active_connections.discard(conn)

# Initialize connection manager
manager = ConnectionManager()

# Background task to send test messages
async def test_broadcast_task():
    """Background task that sends test messages every 10 seconds"""
    await asyncio.sleep(2)  # Wait 2 seconds before first message
    
    while True:
        if manager.active_connections:
            test_message = {
                "type": "test",
                "message": "Backend WebSocket is working!",
                "timestamp": datetime.now().isoformat(),
                "active_connections": len(manager.active_connections)
            }
            await manager.broadcast(test_message)
            print(f"Test broadcast sent to {len(manager.active_connections)} clients")
        
        await asyncio.sleep(10)  # Send every 10 seconds

# Routes
@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "online",
        "service": "Crowd Safety Intelligence System",
        "version": "1.0.0-alpha",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/status")
async def status():
    """System status endpoint"""
    return {
        "backend_status": "operational",
        "websocket_connections": len(manager.active_connections),
        "timestamp": datetime.now().isoformat()
    }

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time bidirectional communication"""
    await manager.connect(websocket)
    
    try:
        # Keep connection alive and listen for messages from client
        while True:
            data = await websocket.receive_text()
            print(f"Received from client: {data}")
            
            # Echo back or handle client messages if needed
            try:
                client_message = json.loads(data)
                response = {
                    "type": "echo",
                    "received": client_message,
                    "timestamp": datetime.now().isoformat()
                }
                await manager.send_personal_message(response, websocket)
            except json.JSONDecodeError:
                pass
                
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        print("Client disconnected normally")
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(websocket)

@app.on_event("startup")
async def startup_event():
    """Start background tasks when the application starts"""
    print("Starting Crowd Safety Intelligence System backend...")
    print("WebSocket endpoint available at: ws://localhost:8000/ws")
    
    # Start the test broadcast task
    asyncio.create_task(test_broadcast_task())

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)

