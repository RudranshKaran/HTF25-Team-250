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

# Import from restructured app
from app.services import (
    fetch_bmtc_bus_data, fetch_weather_data, 
    format_bus_summary, format_weather_summary,
    simulate_metro_flow, simulate_all_metro_stations, simulate_crowd_density, 
    check_alerts, format_metro_summary, format_density_summary,
    history_manager, ai_service
)
from app.services.first_responders_service import (
    get_first_responders_data, format_responders_summary
)
from app.services.multi_zone_simulation import (
    simulate_all_zones_density, check_multi_zone_alerts
)
from app.config import config_manager

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
        self._lock = asyncio.Lock()
    
    async def connect(self, websocket: WebSocket):
        """Accept and register a new WebSocket connection"""
        await websocket.accept()
        async with self._lock:
            self.active_connections.add(websocket)
        print(f"Client connected. Total connections: {len(self.active_connections)}")
        
        # Send welcome message to the newly connected client
        await self.send_personal_message({
            "type": "connection",
            "message": "Successfully connected to Crowd Safety Intelligence System",
            "timestamp": datetime.now().isoformat()
        }, websocket)
    
    async def disconnect(self, websocket: WebSocket):
        """Remove a WebSocket connection"""
        async with self._lock:
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
        # Create a snapshot of connections under lock to ensure thread-safe iteration
        async with self._lock:
            connections_snapshot = list(self.active_connections)
        
        # Send to all connections (without lock to allow concurrent operations)
        for connection in connections_snapshot:
            try:
                await connection.send_text(json.dumps(message))
            except RuntimeError as e:
                # Handle "websocket.close" and other closed connection errors
                if "websocket.close" in str(e) or "websocket.send" in str(e) or "already completed" in str(e):
                    disconnected.add(connection)
                else:
                    print(f"Error broadcasting to client: {e}")
            except Exception as e:
                print(f"Error broadcasting to client: {e}")
                disconnected.add(connection)
        
        # Clean up disconnected clients
        if disconnected:
            async with self._lock:
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
    await asyncio.sleep(1)  # Minimal initial delay for immediate weather display
    
    print("Weather data task started")
    
    while True:
        if manager.active_connections:
            try:
                weather_data = await fetch_weather_data()
                
                # weather_data should always return something (simulated fallback)
                if weather_data:
                    await manager.broadcast(weather_data)
                    print(f"🌦️ Weather broadcast: {format_weather_summary(weather_data)}")
                else:
                    print("⚠️ Weather: No data received (unexpected)")
                    
            except Exception as e:
                print(f"❌ Weather task error: {e}")
        
        await asyncio.sleep(300)  # Fetch every 5 minutes (300 seconds)


# Background task for metro flow simulation
async def metro_simulation_task():
    """Generate and broadcast metro flow data every 60 seconds"""
    global latest_metro_data
    await asyncio.sleep(7)  # Initial delay
    
    print("Metro simulation task started - ALL STATIONS")
    
    while True:
        if manager.active_connections and not config_manager.simulations_paused:
            try:
                # Get single-station data for backward compatibility
                metro_data = simulate_metro_flow()
                latest_metro_data = metro_data
                config_manager.increment_message_count()
                
                # Add to history
                history_manager.add_metro_data(metro_data)
                
                # Add trend to data
                metro_data['trend'] = history_manager.get_metro_trend()
                
                # Broadcast single-station data (legacy)
                await manager.broadcast(metro_data)
                print(f"🚇 Metro (MG Road): {format_metro_summary(metro_data)}")
                
                # Get multi-station data
                multi_metro_data = simulate_all_metro_stations()
                config_manager.increment_message_count()
                
                # Broadcast multi-station data
                await manager.broadcast(multi_metro_data)
                summary = multi_metro_data['summary']
                print(f"🚇 Multi-Metro: {summary['total_stations']} stations, Total Flow: {summary['total_flow']}/min, Phase: {summary['crowd_phase']}")
                
                # Check alerts (using MG Road data for now)
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
    """Generate and broadcast multi-zone crowd density data every 30 seconds"""
    global latest_density_data
    await asyncio.sleep(10)  # Initial delay
    
    print("Multi-zone crowd density simulation task started")
    
    while True:
        if manager.active_connections and not config_manager.simulations_paused:
            try:
                # Get multi-zone density data
                multi_zone_data = await simulate_all_zones_density()
                
                # Also keep single-zone data for backwards compatibility
                # Use stadium zone as the "main" zone for legacy components
                if "stadium" in multi_zone_data.get("zones", {}):
                    stadium_data = multi_zone_data["zones"]["stadium"]
                    legacy_density_data = {
                        "type": "density_update",
                        "grid": stadium_data["grid"],
                        "hotspots": stadium_data["hotspots"],
                        "avg_density": stadium_data["avg_density"],
                        "max_density": stadium_data["max_density"],
                        "phase": stadium_data["phase"],
                        "center_location": stadium_data["center"],
                        "grid_size": 10,
                        "timestamp": multi_zone_data["timestamp"]
                    }
                    latest_density_data = legacy_density_data
                    history_manager.add_density_data(legacy_density_data)
                    legacy_density_data['trend'] = history_manager.get_density_trend()
                    legacy_density_data['prediction'] = history_manager.predict_next_alert()
                    
                    # Broadcast legacy format first for old components
                    await manager.broadcast(legacy_density_data)
                
                # Broadcast multi-zone data
                config_manager.increment_message_count()
                await manager.broadcast(multi_zone_data)
                
                # Print summary
                summary = multi_zone_data.get("summary", {})
                critical = summary.get("critical_zones", [])
                warning = summary.get("warning_zones", [])
                status_msg = f"Zones: {summary.get('total_zones', 0)}"
                if critical:
                    status_msg += f" | CRITICAL: {', '.join(critical)}"
                if warning:
                    status_msg += f" | WARNING: {', '.join(warning)}"
                print(f"🔥 Multi-Zone Density: {status_msg}")
                
                # Check multi-zone alerts
                if latest_metro_data:
                    alerts = check_multi_zone_alerts(multi_zone_data, latest_metro_data)
                    for alert in alerts:
                        history_manager.add_alert(alert)
                        config_manager.increment_alert_count()
                        await manager.broadcast(alert)
                        print(f"⚠️  [{alert.get('zone', 'Unknown')}] {alert['level'].upper()}: {alert['message']}")
                        
            except Exception as e:
                print(f"❌ Density task error: {e}")
                import traceback
                traceback.print_exc()
        
        await asyncio.sleep(30)  # Update every 30 seconds


# Background task for first responders
async def first_responders_task():
    """Update and broadcast first responders positions every 15 seconds"""
    await asyncio.sleep(3)  # Initial delay
    
    print("First responders tracking task started")
    
    while True:
        if manager.active_connections:
            try:
                responders_data = await get_first_responders_data()
                config_manager.increment_message_count()
                
                await manager.broadcast(responders_data)
                print(f"🚨 First Responders: {format_responders_summary(responders_data)}")
                        
            except Exception as e:
                print(f"❌ First responders task error: {e}")
        
        await asyncio.sleep(15)  # Update every 15 seconds (more frequent for emergency vehicles)

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
    """System status endpoint with history stats"""
    history_stats = history_manager.get_history_summary()['stats']
    
    return {
        "backend_status": "operational",
        "websocket_connections": len(manager.active_connections),
        "timestamp": datetime.now().isoformat(),
        "history_stats": history_stats,
        "alert_count": history_stats['total_alerts'],
        "trends": {
            "density": history_manager.get_density_trend(),
            "metro": history_manager.get_metro_trend()
        }
    }

@app.get("/api/history")
async def get_history():
    """Get historical data for analytics"""
    return history_manager.get_history_summary()

@app.get("/api/charts")
async def get_chart_data():
    """Get data formatted for charts"""
    return history_manager.get_chart_data()

@app.get("/api/export")
async def export_data():
    """Export all current data as JSON"""
    history = history_manager.get_history_summary()
    
    return {
        "export_time": datetime.now().isoformat(),
        "system_info": {
            "name": "Crowd Safety Intelligence System",
            "location": "Bengaluru - M. Chinnaswamy Stadium",
            "version": "1.0.0"
        },
        "current_state": {
            "density": latest_density_data,
            "metro": latest_metro_data
        },
        "history": history
    }

@app.get("/api/settings")
async def get_settings():
    """Get current system settings"""
    return config_manager.get_settings()

@app.post("/api/settings/thresholds")
async def update_thresholds(warning: int = None, critical: int = None, metro: int = None):
    """Update alert thresholds"""
    config_manager.update_thresholds(warning, critical, metro)
    return {"status": "success", "thresholds": config_manager.get_settings()["thresholds"]}

@app.post("/api/control/pause")
async def pause_simulations():
    """Pause all simulations"""
    config_manager.pause_simulations()
    return {"status": "paused", "paused": True}

@app.post("/api/control/resume")
async def resume_simulations():
    """Resume all simulations"""
    config_manager.resume_simulations()
    return {"status": "resumed", "paused": False}

@app.post("/api/control/toggle")
async def toggle_simulations():
    """Toggle pause/resume"""
    paused = config_manager.toggle_simulations()
    return {"status": "toggled", "paused": paused}

@app.post("/api/control/reset-history")
async def reset_history():
    """Clear all history data"""
    history_manager.clear_history()
    return {"status": "history_cleared"}

@app.post("/api/control/reset-stats")
async def reset_stats():
    """Reset statistics"""
    config_manager.reset_stats()
    return {"status": "stats_reset"}

@app.post("/api/settings/display")
async def update_display(heatmap: bool = None, hotspots: bool = None, badge: bool = None):
    """Update display settings"""
    config_manager.update_display_settings(heatmap, hotspots, badge)
    return {"status": "success", "display": config_manager.get_settings()["display"]}

@app.post("/api/settings/sound")
async def update_sound(enabled: bool = None, volume: float = None, critical: bool = None, warning: bool = None):
    """Update sound settings"""
    config_manager.update_sound_settings(enabled, volume, critical, warning)
    return {"status": "success", "notifications": config_manager.get_settings()["notifications"]}

@app.post("/api/control/demo-mode")
async def toggle_demo_mode():
    """Toggle demo mode"""
    demo_mode = config_manager.toggle_demo_mode()
    return {"status": "toggled", "demo_mode": demo_mode}

# ===== AI INFERENCE ENDPOINTS =====

@app.post("/api/ai/insights")
async def get_crowd_insights(data: dict = None):
    """Generate AI insights for crowd management"""
    try:
        crowd_data = data or latest_density_data or {}
        # Run blocking AI call in thread pool to avoid blocking event loop
        insights = await asyncio.to_thread(ai_service.generate_crowd_insights, crowd_data)
        return {"status": "success", "insights": insights}
    except Exception as e:
        print(f"❌ AI Insights Error: {e}")
        return {"status": "error", "message": str(e)}, 500

@app.post("/api/ai/action-plan")
async def get_action_plan(zone: str = "all", data: dict = None):
    """Generate action plan to ease crowd"""
    try:
        crowd_data = data or latest_density_data or {}
        summary = crowd_data.get('summary', {})
        alert_zones = summary.get('critical_zones', []) + summary.get('warning_zones', [])
        
        # Run blocking AI call in thread pool to avoid blocking event loop
        action_plan = await asyncio.to_thread(ai_service.generate_action_plan, crowd_data, alert_zones or [zone])
        return {"status": "success", "action_plan": action_plan}
    except Exception as e:
        print(f"❌ Action Plan Error: {e}")
        return {"status": "error", "message": str(e)}, 500

@app.get("/api/ai/nearest-transportation")
async def get_nearest_transportation(zone: str = "all"):
    """Get nearest transportation options"""
    try:
        crowd_data = latest_density_data or {}
        # Run blocking AI call in thread pool to avoid blocking event loop
        transport = await asyncio.to_thread(ai_service.find_nearest_transportation, zone, crowd_data)
        return {"status": "success", "transportation": transport}
    except Exception as e:
        print(f"❌ Transportation Error: {e}")
        return {"status": "error", "message": str(e)}, 500

@app.post("/api/ai/traffic-diversion")
async def suggest_traffic_diversion(zone: str = "all", data: dict = None):
    """Get traffic diversion recommendations"""
    try:
        crowd_data = data or latest_density_data or {}
        # Run blocking AI call in thread pool to avoid blocking event loop
        diversion = await asyncio.to_thread(ai_service.suggest_traffic_diversion, zone, crowd_data)
        return {"status": "success", "diversion": diversion}
    except Exception as e:
        print(f"❌ Diversion Error: {e}")
        return {"status": "error", "message": str(e)}, 500

@app.get("/api/ai/report")
async def generate_crowd_report(period: str = "1hour"):
    """Generate crowd management report"""
    try:
        crowd_data = latest_density_data or {}
        alerts = history_manager.get_history_summary().get('alerts', [])
        # Run blocking AI call in thread pool to avoid blocking event loop
        report = await asyncio.to_thread(ai_service.generate_report, crowd_data, alerts, period)
        return {"status": "success", "report": report}
    except Exception as e:
        print(f"❌ Report Error: {e}")
        return {"status": "error", "message": str(e)}, 500

@app.post("/api/ai/zone-specific-plan")
async def get_zone_specific_plan(data: dict = None):
    """
    Generate detailed zone-specific plans with analysis, risk assessment, and reasoning
    Returns comprehensive action plans for each zone including:
    - Detailed analysis with risk factors and bottleneck identification
    - Crowd management recommendations with reasoning
    - Transportation routing strategies
    - Traffic diversion plans
    - Expected outcomes and monitoring priorities
    """
    try:
        crowd_data = data or latest_density_data or {}
        if not crowd_data:
            return {"status": "warning", "message": "No crowd data available", "plan": {}}
        
        # Run blocking AI call in thread pool to avoid blocking event loop
        zone_plan = await asyncio.to_thread(ai_service.generate_zone_specific_plan, crowd_data)
        return {"status": "success", "zone_specific_plan": zone_plan}
    except Exception as e:
        print(f"❌ Zone-Specific Plan Error: {e}")
        return {"status": "error", "message": str(e)}, 500

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
        await manager.disconnect(websocket)
        print("Client disconnected normally")
    except Exception as e:
        print(f"WebSocket error: {e}")
        await manager.disconnect(websocket)

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
    asyncio.create_task(first_responders_task())
    
    print("✅ Background tasks started:")
    print("   - Test messages (every 10s)")
    print("   - BMTC bus GPS (every 30s)")
    print("   - Weather data (every 5min)")
    print("   - Metro flow simulation (every 60s)")
    print("   - Crowd density simulation (every 30s)")
    print("   - First Responders tracking (every 15s)")
    print("=" * 60)

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)

