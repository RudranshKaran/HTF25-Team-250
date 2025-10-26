"""
Metro Flow Simulation Service
Simulates passenger flow at ALL metro stations
"""

import random
from datetime import datetime
from typing import Dict, List
from app.utils.constants import METRO_LOCATION


# Global state for crowd phases (shared with density service)
_crowd_state = {
    'phase': 'building',
    'base_intensity': 20,
    'hotspot_centers': [],
    'cycle_count': 0,
    'phase_duration': 0
}

# Metro Stations Configuration (Based on Namma Metro lines)
METRO_STATIONS = {
    "mg_road": {
        "id": "mg_road",
        "name": "MG Road Metro",
        "location": [12.9756, 77.6057],
        "line": "Blue Line",
        "color": "#28458C",
        "capacity": 15000,
        "icon": "🚇"
    },
    "majestic": {
        "id": "majestic",
        "name": "Majestic Metro",
        "location": [12.9767, 77.5713],
        "line": "Green Line",
        "color": "#009933",
        "capacity": 20000,
        "icon": "🚇"
    },
    "indiranagar": {
        "id": "indiranagar",
        "name": "Indiranagar Metro",
        "location": [12.9784, 77.6408],
        "line": "Purple Line",
        "color": "#8C2877",
        "capacity": 12000,
        "icon": "🚇"
    },
    "electronic_city": {
        "id": "electronic_city",
        "name": "Electronic City Metro",
        "location": [12.8450, 77.6628],
        "line": "Yellow Line",
        "color": "#FFDF00",
        "capacity": 18000,
        "icon": "🚇"
    }
}


def get_crowd_state() -> Dict:
    """Get current crowd state"""
    return _crowd_state


def simulate_station_flow(station_id: str, station_config: Dict) -> Dict:
    """
    Simulate metro passenger flow for a specific station
    Flow SYNCHRONIZED with crowd density phase for realistic correlation
    """
    global _crowd_state
    
    current_hour = datetime.now().hour
    current_phase = _crowd_state.get('phase', 'low')
    base_intensity = _crowd_state.get('base_intensity', 20)
    capacity = station_config.get('capacity', 15000)
    
    # Metro flow correlates with crowd phase
    if current_phase == 'building':
        # BUILDING: Many people arriving via metro → HIGH EXIT RATE
        base_entry = random.randint(30, 45)
        exit_multiplier = min(base_intensity / 180, 1.0)
        base_exit = int(50 + (exit_multiplier * 50))
        status = "high"
        flow_reason = "Arrivals"
        
    elif current_phase == 'peak':
        # PEAK: Most people already at event → MODERATE FLOW
        base_entry = random.randint(25, 40)
        base_exit = random.randint(35, 55)
        status = "moderate"
        flow_reason = "Stable"
        
    elif current_phase == 'dispersing':
        # DISPERSING: Event ending, people leaving → HIGH EXIT RATE
        dispersal_progress = _crowd_state.get('phase_duration', 0) / 8.0
        base_entry = random.randint(20, 35)
        base_exit = int(90 - (dispersal_progress * 40))
        status = "high"
        flow_reason = "Departures"
        
    elif current_phase == 'low':
        # LOW: Minimal crowd → LOW FLOW
        base_entry = random.randint(15, 25)
        base_exit = random.randint(15, 25)
        status = "low"
        flow_reason = "Normal"
        
    else:
        # Fallback to time-based patterns
        if 8 <= current_hour <= 10:  # Morning rush
            base_entry = random.randint(60, 90)
            base_exit = random.randint(30, 50)
            status = "high"
            flow_reason = "Morning Rush"
        elif 17 <= current_hour <= 20:  # Evening rush
            base_entry = random.randint(40, 60)
            base_exit = random.randint(70, 100)
            status = "high"
            flow_reason = "Evening Rush"
        else:
            base_entry = random.randint(20, 35)
            base_exit = random.randint(20, 35)
            status = "moderate"
            flow_reason = "Normal"
    
    # Add station-specific variation based on capacity
    capacity_factor = capacity / 15000  # Normalize to base capacity
    base_entry = int(base_entry * capacity_factor)
    base_exit = int(base_exit * capacity_factor)
    
    # Add natural variation
    entry_rate = max(10, base_entry + random.randint(-5, 5))
    exit_rate = max(10, base_exit + random.randint(-5, 5))
    
    # Calculate capacity percentage
    total_flow = entry_rate + exit_rate
    max_flow = capacity // 100  # Assume ~1% of capacity per minute is max
    capacity_percent = min(int((total_flow / max_flow) * 100), 100)
    
    return {
        "id": station_id,
        "station": station_config['name'],
        "location": station_config['location'],
        "line": station_config['line'],
        "color": station_config['color'],
        "entry_rate": entry_rate,
        "exit_rate": exit_rate,
        "total_flow": total_flow,
        "capacity": capacity,
        "capacity_percent": capacity_percent,
        "status": status,
        "flow_reason": flow_reason,
        "crowd_phase": current_phase,
        "timestamp": datetime.now().isoformat()
    }


def simulate_all_metro_stations() -> Dict:
    """
    Simulate all metro stations and return aggregated data
    """
    stations = []
    total_entry = 0
    total_exit = 0
    
    for station_id, station_config in METRO_STATIONS.items():
        station_data = simulate_station_flow(station_id, station_config)
        stations.append(station_data)
        total_entry += station_data['entry_rate']
        total_exit += station_data['exit_rate']
    
    return {
        "type": "multi_metro_update",
        "stations": stations,
        "summary": {
            "total_stations": len(stations),
            "total_entry_rate": total_entry,
            "total_exit_rate": total_exit,
            "total_flow": total_entry + total_exit,
            "crowd_phase": _crowd_state.get('phase', 'low')
        },
        "timestamp": datetime.now().isoformat()
    }


def simulate_metro_flow() -> Dict:
    """
    LEGACY: Simulate metro passenger flow for MG Road station only
    For backward compatibility
    """
    mg_road_data = simulate_station_flow("mg_road", METRO_STATIONS["mg_road"])
    
    return {
        "type": "metro_update",
        "station": mg_road_data['station'],
        "location": mg_road_data['location'],
        "entry_rate": mg_road_data['entry_rate'],
        "exit_rate": mg_road_data['exit_rate'],
        "total_flow": mg_road_data['total_flow'],
        "capacity_percent": mg_road_data['capacity_percent'],
        "status": mg_road_data['status'],
        "flow_reason": mg_road_data['flow_reason'],
        "crowd_phase": mg_road_data['crowd_phase'],
        "timestamp": mg_road_data['timestamp']
    }


def format_metro_summary(metro_data: Dict) -> str:
    """Format metro data for logging"""
    if metro_data:
        entry = metro_data.get("entry_rate", 0)
        exit_rate = metro_data.get("exit_rate", 0)
        status = metro_data.get("status", "unknown")
        flow_reason = metro_data.get("flow_reason", "")
        crowd_phase = metro_data.get("crowd_phase", "")
        return f"Entry: {entry}/min, Exit: {exit_rate}/min ({status}) - {flow_reason} [Phase: {crowd_phase}]"
    return "No metro data"
