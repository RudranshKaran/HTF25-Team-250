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
from api_handlers import fetch_bmtc_bus_data, fetch_weather_data, format_bus_summary, format_weather_summary
from simulations import (
    simulate_metro_flow, simulate_crowd_density, check_alerts,
    format_metro_summary, format_density_summary
)

# Load environment variables
load_dotenv()

# Store latest data for alert checking
latest_density_data = None
latest_metro_data = None

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


# Background task for BMTC bus GPS data
async def bmtc_data_task():
    """Fetch and broadcast BMTC bus GPS data every 30 seconds"""
    await asyncio.sleep(5)  # Initial delay
    
    print("BMTC data task started")
    
    while True:
        if manager.active_connections:
            try:
                bus_data = await fetch_bmtc_bus_data()
                
                if bus_data:
                    await manager.broadcast(bus_data)
                    print(f"📍 BMTC broadcast: {format_bus_summary(bus_data)}")
                else:
                    print("⚠️ BMTC: No data received")
                    
            except Exception as e:
                print(f"❌ BMTC task error: {e}")
        
        await asyncio.sleep(30)  # Fetch every 30 seconds


# Background task for weather data
async def weather_data_task():
    """Fetch and broadcast weather data every 5 minutes"""
    await asyncio.sleep(3)  # Initial delay
    
    print("Weather data task started")
    
    while True:
        if manager.active_connections:
            try:
                weather_data = await fetch_weather_data()
                
                if weather_data:
                    await manager.broadcast(weather_data)
                    print(f"🌦️ Weather broadcast: {format_weather_summary(weather_data)}")
                else:
                    print("⚠️ Weather: No data received")
                    
            except Exception as e:
                print(f"❌ Weather task error: {e}")
        
        await asyncio.sleep(300)  # Fetch every 5 minutes (300 seconds)


# Background task for metro flow simulation
async def metro_simulation_task():
    """Generate and broadcast metro flow data every 60 seconds"""
    global latest_metro_data
    await asyncio.sleep(7)  # Initial delay
    
    print("Metro simulation task started")
    
    while True:
        if manager.active_connections:
            try:
                metro_data = simulate_metro_flow()
                latest_metro_data = metro_data
                
                await manager.broadcast(metro_data)
                print(f"🚇 Metro broadcast: {format_metro_summary(metro_data)}")
                
                # Check alerts
                if latest_density_data:
                    alerts = check_alerts(latest_density_data, metro_data)
                    for alert in alerts:
                        await manager.broadcast(alert)
                        print(f"⚠️  Alert: {alert['level'].upper()} - {alert['message']}")
                        
            except Exception as e:
                print(f"❌ Metro task error: {e}")
        
        await asyncio.sleep(60)  # Update every 60 seconds


# Background task for crowd density simulation
async def density_simulation_task():
    """Generate and broadcast crowd density data every 30 seconds"""
    global latest_density_data
    await asyncio.sleep(10)  # Initial delay
    
    print("Crowd density simulation task started")
    
    while True:
        if manager.active_connections:
            try:
                density_data = simulate_crowd_density()
                latest_density_data = density_data
                
                await manager.broadcast(density_data)
                print(f"🔥 Density broadcast: {format_density_summary(density_data)}")
                
                # Check alerts
                if latest_metro_data:
                    alerts = check_alerts(density_data, latest_metro_data)
                    for alert in alerts:
                        await manager.broadcast(alert)
                        print(f"⚠️  Alert: {alert['level'].upper()} - {alert['message']}")
                        
            except Exception as e:
                print(f"❌ Density task error: {e}")
        
        await asyncio.sleep(30)  # Update every 30 seconds

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
    print("=" * 60)
    print("🚨 Crowd Safety Intelligence System - Backend Starting...")
    print("=" * 60)
    print("WebSocket endpoint: ws://localhost:8000/ws")
    print("Health check: http://localhost:8000")
    print("Status API: http://localhost:8000/api/status")
    print("=" * 60)
    
    # Start all background tasks
    asyncio.create_task(test_broadcast_task())
    asyncio.create_task(bmtc_data_task())
    asyncio.create_task(weather_data_task())
    asyncio.create_task(metro_simulation_task())
    asyncio.create_task(density_simulation_task())
    
    print("✅ Background tasks started:")
    print("   - Test messages (every 10s)")
    print("   - BMTC bus GPS (every 30s)")
    print("   - Weather data (every 5min)")
    print("   - Metro flow simulation (every 60s)")
    print("   - Crowd density simulation (every 30s)")
    print("=" * 60)

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)

