"""
Metro Flow Simulation Service
Simulates passenger flow at metro stations
"""

import random
from datetime import datetime
from typing import Dict
from app.utils.constants import METRO_LOCATION


# Global state for crowd phases (shared with density service)
_crowd_state = {
    'phase': 'building',
    'base_intensity': 20,
    'hotspot_centers': [],
    'cycle_count': 0,
    'phase_duration': 0
}


def get_crowd_state() -> Dict:
    """Get current crowd state"""
    return _crowd_state


def simulate_metro_flow() -> Dict:
    """
    Simulate metro passenger flow for MG Road station
    Flow SYNCHRONIZED with crowd density phase for realistic correlation
    """
    global _crowd_state
    
    current_hour = datetime.now().hour
    current_phase = _crowd_state.get('phase', 'low')
    base_intensity = _crowd_state.get('base_intensity', 20)
    
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
    
    # Add natural variation
    entry_rate = max(10, base_entry + random.randint(-5, 5))
    exit_rate = max(10, base_exit + random.randint(-5, 5))
    
    # Calculate capacity percentage
    total_flow = entry_rate + exit_rate
    capacity_percent = min(int((total_flow / 200) * 100), 100)
    
    return {
        "type": "metro_update",
        "station": "MG Road Metro",
        "location": METRO_LOCATION,
        "entry_rate": entry_rate,
        "exit_rate": exit_rate,
        "total_flow": total_flow,
        "capacity_percent": capacity_percent,
        "status": status,
        "flow_reason": flow_reason,
        "crowd_phase": current_phase,
        "timestamp": datetime.now().isoformat()
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
