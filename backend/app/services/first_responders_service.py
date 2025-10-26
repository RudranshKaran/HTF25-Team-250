"""
First Responders Service
Simulates emergency vehicles (Police, Ambulance, Fire Trucks) moving through Bengaluru
Based on BMTC bus movement patterns but representing emergency response vehicles
"""

import random
from datetime import datetime
from typing import Dict, List
from app.utils.constants import ZONES


# First Responder Types with their properties
RESPONDER_TYPES = {
    "police": {
        "icon": "🚓",
        "color": "#0066cc",
        "name": "Police Patrol",
        "count": 8,  # Increased to cover more zones
        "speed_range": (30, 60)
    },
    "ambulance": {
        "icon": "🚑",
        "color": "#ff3333",
        "name": "Ambulance",
        "count": 6,  # Increased
        "speed_range": (40, 80)
    },
    "fire": {
        "icon": "🚒",
        "color": "#ff6600",
        "name": "Fire Truck",
        "count": 5,  # Increased
        "speed_range": (35, 70)
    },
    "emergency": {
        "icon": "🚨",
        "color": "#ff00ff",
        "name": "Emergency Response",
        "count": 3,  # Increased
        "speed_range": (45, 85)
    }
}

# Convert ZONES to patrol zones format
def get_patrol_zones():
    """Convert constants.ZONES to patrol zones with priority based on capacity"""
    patrol_zones = []
    for zone_id, zone_config in ZONES.items():
        # Assign priority based on zone type and capacity
        if zone_config["type"] in ["event_venue", "transit"]:
            priority = "high"
        elif zone_config["capacity"] > 50000:
            priority = "high"
        elif zone_config["capacity"] > 30000:
            priority = "medium"
        else:
            priority = "low"
        
        patrol_zones.append({
            "id": zone_id,
            "name": zone_config["name"],
            "lat": zone_config["center"][0],
            "lon": zone_config["center"][1],
            "priority": priority,
            "type": zone_config["type"]
        })
    return patrol_zones

PATROL_ZONES = get_patrol_zones()

# Global state to track responder positions (simulates continuous movement)
_responder_state = {}


def initialize_responders():
    """Initialize responder positions if not already done"""
    global _responder_state
    
    if not _responder_state:
        responder_id = 0
        for responder_type, config in RESPONDER_TYPES.items():
            for i in range(config["count"]):
                responder_id += 1
                # Assign each responder to a patrol zone
                zone = PATROL_ZONES[responder_id % len(PATROL_ZONES)]
                
                _responder_state[f"{responder_type}_{i+1}"] = {
                    "id": f"{responder_type.upper()}-{str(i+1).zfill(2)}",
                    "type": responder_type,
                    "vehicle_id": f"KA01-{responder_type[:2].upper()}-{1000 + responder_id}",
                    "lat": zone["lat"] + random.uniform(-0.01, 0.01),
                    "lon": zone["lon"] + random.uniform(-0.01, 0.01),
                    "target_zone": zone,
                    "status": "patrolling",
                    "speed": random.randint(*config["speed_range"]),
                    "last_update": datetime.now()
                }


def update_responder_positions():
    """Update responder positions to simulate realistic movement"""
    global _responder_state
    
    for key, responder in _responder_state.items():
        # Simulate movement towards target zone with some randomness
        target = responder["target_zone"]
        current_lat = responder["lat"]
        current_lon = responder["lon"]
        
        # Calculate direction to target with drift
        lat_diff = target["lat"] - current_lat
        lon_diff = target["lon"] - current_lon
        
        # Add random patrol movement (0.001 degrees ≈ 100 meters)
        move_distance = 0.002
        
        # If far from target, move towards it; otherwise patrol randomly
        if abs(lat_diff) > 0.02 or abs(lon_diff) > 0.02:
            # Move towards target
            responder["lat"] += lat_diff * 0.1 + random.uniform(-move_distance, move_distance)
            responder["lon"] += lon_diff * 0.1 + random.uniform(-move_distance, move_distance)
        else:
            # Random patrol within zone
            responder["lat"] += random.uniform(-move_distance, move_distance)
            responder["lon"] += lon_diff * random.uniform(-move_distance, move_distance)
        
        # Randomly change target zone (simulates responding to calls)
        if random.random() < 0.05:  # 5% chance to change zone
            responder["target_zone"] = random.choice(PATROL_ZONES)
            responder["status"] = random.choice(["patrolling", "responding", "on-scene", "available"])
        
        # Vary speed slightly
        config = RESPONDER_TYPES[responder["type"]]
        responder["speed"] = random.randint(*config["speed_range"])
        
        responder["last_update"] = datetime.now()


async def get_first_responders_data() -> Dict:
    """
    Get current first responders positions and status
    Returns data in format compatible with map display
    """
    initialize_responders()
    update_responder_positions()
    
    responders_list = []
    
    for key, responder in _responder_state.items():
        config = RESPONDER_TYPES[responder["type"]]
        
        responders_list.append({
            "id": responder["id"],
            "vehicle_id": responder["vehicle_id"],
            "type": responder["type"],
            "icon": config["icon"],
            "color": config["color"],
            "name": config["name"],
            "lat": responder["lat"],
            "lon": responder["lon"],
            "speed": responder["speed"],
            "status": responder["status"],
            "zone": responder["target_zone"]["name"],
            "timestamp": datetime.now().isoformat()
        })
    
    # Sort by type for better organization
    responders_list.sort(key=lambda x: (x["type"], x["id"]))
    
    return {
        "type": "first_responders_update",
        "count": len(responders_list),
        "responders": responders_list,
        "timestamp": datetime.now().isoformat(),
        "active_units": {
            "police": sum(1 for r in responders_list if r["type"] == "police"),
            "ambulance": sum(1 for r in responders_list if r["type"] == "ambulance"),
            "fire": sum(1 for r in responders_list if r["type"] == "fire"),
            "emergency": sum(1 for r in responders_list if r["type"] == "emergency")
        }
    }


def format_responders_summary(responder_data: Dict) -> str:
    """Format responder data for logging"""
    if responder_data and responder_data.get("responders"):
        active = responder_data.get("active_units", {})
        return (f"👮 Police: {active.get('police', 0)}, "
                f"🚑 Ambulance: {active.get('ambulance', 0)}, "
                f"🚒 Fire: {active.get('fire', 0)}, "
                f"🚨 Emergency: {active.get('emergency', 0)}")
    return "No responder data"


def get_responders_near_location(lat: float, lon: float, radius: float = 0.01) -> List[Dict]:
    """
    Get first responders within a certain radius of a location
    Useful for alert responses
    radius in degrees (0.01 ≈ 1km)
    """
    initialize_responders()
    nearby = []
    
    for key, responder in _responder_state.items():
        distance = ((responder["lat"] - lat) ** 2 + (responder["lon"] - lon) ** 2) ** 0.5
        if distance <= radius:
            config = RESPONDER_TYPES[responder["type"]]
            nearby.append({
                "id": responder["id"],
                "type": responder["type"],
                "name": config["name"],
                "icon": config["icon"],
                "distance_km": distance * 111,  # Rough conversion to km
                "eta_minutes": (distance * 111) / (responder["speed"] / 60),
                "status": responder["status"]
            })
    
    # Sort by distance
    nearby.sort(key=lambda x: x["distance_km"])
    return nearby

