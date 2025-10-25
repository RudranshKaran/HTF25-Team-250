"""
Simulation Functions for Phase 3
- Metro Flow Simulation
- Crowd Density Simulation (with gradual accumulation)
- Alert Logic
"""

import random
import math
from datetime import datetime
from typing import Dict, List, Tuple

# Bengaluru coordinates
BENGALURU_CENTER = [12.9716, 77.5946]
STADIUM_LOCATION = [12.9789, 77.5993]
METRO_LOCATION = [12.9756, 77.6057]

# Alert thresholds
DENSITY_THRESHOLD_HIGH = 150
DENSITY_THRESHOLD_CRITICAL = 200
METRO_FLOW_THRESHOLD = 80  # passengers/min

# Global state for crowd accumulation (persists between calls)
_crowd_state = {
    'phase': 'building',  # building, peak, dispersing, low
    'base_intensity': 20,  # starts low
    'hotspot_centers': [],
    'cycle_count': 0,
    'phase_duration': 0
}


def simulate_metro_flow() -> Dict:
    """
    Simulate metro passenger flow for MG Road station
    Flow SYNCHRONIZED with crowd density phase for realistic correlation:
    - BUILDING phase: High exits (people arriving at stadium)
    - PEAK phase: Moderate flow (people already there)
    - DISPERSING phase: High exits again (people leaving stadium)
    - LOW phase: Minimal flow
    """
    global _crowd_state
    
    current_hour = datetime.now().hour
    current_phase = _crowd_state.get('phase', 'low')
    base_intensity = _crowd_state.get('base_intensity', 20)
    
    # Metro flow correlates with crowd phase
    if current_phase == 'building':
        # BUILDING: Many people arriving via metro → HIGH EXIT RATE
        base_entry = random.randint(30, 45)
        # Exit rate increases with crowd intensity
        exit_multiplier = min(base_intensity / 180, 1.0)  # 0.0 to 1.0
        base_exit = int(50 + (exit_multiplier * 50))  # 50-100
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
        # Exit rate decreases as dispersal progresses
        dispersal_progress = _crowd_state.get('phase_duration', 0) / 8.0  # 0.0 to 1.0
        base_entry = random.randint(20, 35)
        base_exit = int(90 - (dispersal_progress * 40))  # 90 down to 50
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
    entry_rate = base_entry + random.randint(-5, 5)
    exit_rate = base_exit + random.randint(-5, 5)
    
    # Ensure positive values
    entry_rate = max(10, entry_rate)
    exit_rate = max(10, exit_rate)
    
    # Calculate capacity percentage (assuming 100 passengers/min per direction is max)
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


def simulate_crowd_density() -> Dict:
    """
    Simulate crowd density with REALISTIC GRADUAL ACCUMULATION
    - People slowly arrive (building phase)
    - Density gradually increases to critical levels
    - Peak maintained for a period
    - Then people gradually leave (dispersing phase)
    - Cycle repeats
    """
    global _crowd_state
    
    current_hour = datetime.now().hour
    grid_size = 10
    grid = []
    hotspots = []
    
    # Event simulation (6 PM - 10 PM)
    is_event_time = 18 <= current_hour <= 22
    
    # ===== PHASE MANAGEMENT (Realistic Crowd Lifecycle) =====
    _crowd_state['cycle_count'] += 1
    _crowd_state['phase_duration'] += 1
    
    current_phase = _crowd_state['phase']
    
    # Phase transitions (each phase lasts ~5-10 updates = 2.5-5 minutes)
    if current_phase == 'building':
        # BUILDING: Gradually increase density
        _crowd_state['base_intensity'] += random.uniform(8, 15)  # Slow buildup
        
        if _crowd_state['base_intensity'] > 180:
            _crowd_state['phase'] = 'peak'
            _crowd_state['phase_duration'] = 0
            print(f"🔥 CROWD PHASE: BUILDING → PEAK (Density: {int(_crowd_state['base_intensity'])})")
    
    elif current_phase == 'peak':
        # PEAK: Maintain high density with small variations
        _crowd_state['base_intensity'] += random.uniform(-10, 10)
        _crowd_state['base_intensity'] = min(250, _crowd_state['base_intensity'])
        
        if _crowd_state['phase_duration'] > random.randint(6, 10):  # Stay at peak for 3-5 min
            _crowd_state['phase'] = 'dispersing'
            _crowd_state['phase_duration'] = 0
            print(f"⚠️ CROWD PHASE: PEAK → DISPERSING (Density: {int(_crowd_state['base_intensity'])})")
    
    elif current_phase == 'dispersing':
        # DISPERSING: Gradually decrease as people leave
        _crowd_state['base_intensity'] -= random.uniform(10, 20)  # Faster dispersal
        
        if _crowd_state['base_intensity'] < 40:
            _crowd_state['phase'] = 'low'
            _crowd_state['phase_duration'] = 0
            _crowd_state['hotspot_centers'] = []  # Reset hotspots
            print(f"✅ CROWD PHASE: DISPERSING → LOW (Density: {int(_crowd_state['base_intensity'])})")
    
    elif current_phase == 'low':
        # LOW: Minimal crowd, preparing for next buildup
        _crowd_state['base_intensity'] = max(10, _crowd_state['base_intensity'] - 2)
        
        if _crowd_state['phase_duration'] > random.randint(4, 8):  # Low period 2-4 min
            _crowd_state['phase'] = 'building'
            _crowd_state['phase_duration'] = 0
            # Create new hotspot locations for next cycle
            num_hotspots = random.randint(2, 4)
            _crowd_state['hotspot_centers'] = [
                {
                    'i': random.randint(2, grid_size - 3),
                    'j': random.randint(2, grid_size - 3),
                }
                for _ in range(num_hotspots)
            ]
            print(f"🟢 CROWD PHASE: LOW → BUILDING (Starting new cycle with {num_hotspots} hotspots)")
    
    # ===== GENERATE DENSITY GRID =====
    
    # Ensure we have hotspot centers
    if not _crowd_state['hotspot_centers']:
        num_hotspots = random.randint(2, 3)
        _crowd_state['hotspot_centers'] = [
            {
                'i': random.randint(2, grid_size - 3),
                'j': random.randint(2, grid_size - 3),
            }
            for _ in range(num_hotspots)
        ]
    
    # Calculate intensity for each hotspot based on phase
    base_intensity = _crowd_state['base_intensity']
    
    for i in range(grid_size):
        row = []
        for j in range(grid_size):
            # Start with very low ambient density
            density = random.randint(0, 5)
            
            # Add influence from each hotspot
            for hotspot in _crowd_state['hotspot_centers']:
                distance = math.sqrt((i - hotspot['i'])**2 + (j - hotspot['j'])**2)
                
                # Intensity decreases with distance (inverse square law)
                if distance < 0.5:
                    density += base_intensity
                elif distance < 2:
                    falloff = base_intensity * (1 - distance / 2) ** 2
                    density += int(falloff * random.uniform(0.7, 1.0))
                elif distance < 4:
                    falloff = base_intensity * (1 - distance / 4) ** 1.5
                    density += int(falloff * random.uniform(0.3, 0.6))
                elif distance < 6:
                    falloff = base_intensity * (1 - distance / 6)
                    density += int(falloff * random.uniform(0.1, 0.3))
            
            # Add natural variation
            density = int(density * random.uniform(0.9, 1.1))
            density = max(0, min(300, density))
            
            row.append(density)
            
            # Track significant hotspots
            if density > 80:
                center_i, center_j = grid_size // 2, grid_size // 2
                lat_offset = (i - center_i) * 0.002
                lon_offset = (j - center_j) * 0.002
                hotspots.append({
                    "lat": STADIUM_LOCATION[0] + lat_offset,
                    "lon": STADIUM_LOCATION[1] + lon_offset,
                    "density": density
                })
        
        grid.append(row)
    
    # Calculate statistics
    flat_grid = [val for row in grid for val in row]
    max_density = max(flat_grid)
    avg_density = int(sum(flat_grid) / len(flat_grid))
    
    # Sort hotspots by density
    hotspots_sorted = sorted(hotspots, key=lambda x: x['density'], reverse=True)[:5]
    
    # Phase-based status
    status = {
        'building': 'Crowd Accumulating',
        'peak': 'CRITICAL - Peak Density',
        'dispersing': 'Crowd Dispersing',
        'low': 'Normal - Low Density'
    }[current_phase]
    
    return {
        "type": "density_update",
        "grid": grid,
        "grid_size": grid_size,
        "center_location": STADIUM_LOCATION,
        "max_density": max_density,
        "avg_density": avg_density,
        "hotspots": hotspots_sorted,
        "is_event_time": is_event_time,
        "phase": current_phase,
        "status": status,
        "timestamp": datetime.now().isoformat()
    }


def check_alerts(density_data: Dict, metro_data: Dict) -> List[Dict]:
    """
    Check if any alerts should be triggered based on thresholds
    Returns list of alerts (can be empty)
    """
    alerts = []
    
    # Check crowd density
    if density_data:
        max_density = density_data.get("max_density", 0)
        avg_density = density_data.get("avg_density", 0)
        
        if max_density > DENSITY_THRESHOLD_CRITICAL:
            alerts.append({
                "type": "alert",
                "level": "critical",
                "category": "crowd_density",
                "zone": "Stadium Area",
                "message": f"Critical crowd density detected: {max_density} people",
                "value": max_density,
                "threshold": DENSITY_THRESHOLD_CRITICAL,
                "recommendation": "Immediate crowd control measures required",
                "location": STADIUM_LOCATION,
                "timestamp": datetime.now().isoformat()
            })
        elif max_density > DENSITY_THRESHOLD_HIGH:
            alerts.append({
                "type": "alert",
                "level": "warning",
                "category": "crowd_density",
                "zone": "Stadium Area",
                "message": f"High crowd density: {max_density} people",
                "value": max_density,
                "threshold": DENSITY_THRESHOLD_HIGH,
                "recommendation": "Monitor situation closely",
                "location": STADIUM_LOCATION,
                "timestamp": datetime.now().isoformat()
            })
    
    # Check metro flow
    if metro_data:
        exit_rate = metro_data.get("exit_rate", 0)
        
        if exit_rate > METRO_FLOW_THRESHOLD:
            alerts.append({
                "type": "alert",
                "level": "warning",
                "category": "metro_flow",
                "zone": "MG Road Metro",
                "message": f"High metro exit rate: {exit_rate} passengers/min",
                "value": exit_rate,
                "threshold": METRO_FLOW_THRESHOLD,
                "recommendation": "Prepare for crowd influx near metro",
                "location": METRO_LOCATION,
                "timestamp": datetime.now().isoformat()
            })
    
    # Combined alert: high metro exit + nearby high density
    if (density_data and metro_data and 
        density_data.get("max_density", 0) > DENSITY_THRESHOLD_HIGH and 
        metro_data.get("exit_rate", 0) > METRO_FLOW_THRESHOLD):
        alerts.append({
            "type": "alert",
            "level": "critical",
            "category": "combined",
            "zone": "Metro-Stadium Corridor",
            "message": "High metro exit rate + High crowd density",
            "value": f"Density: {density_data.get('max_density')}, Exit: {metro_data.get('exit_rate')}/min",
            "threshold": "Multiple thresholds exceeded",
            "recommendation": "Deploy crowd management personnel immediately",
            "location": STADIUM_LOCATION,
            "timestamp": datetime.now().isoformat()
        })
    
    return alerts


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


def format_density_summary(density_data: Dict) -> str:
    """Format density data for logging"""
    if density_data:
        max_d = density_data.get("max_density", 0)
        avg_d = density_data.get("avg_density", 0)
        hotspots = len(density_data.get("hotspots", []))
        phase = density_data.get("phase", "unknown").upper()
        status = density_data.get("status", "")
        
        # Add emoji for phase
        phase_emoji = {
            'LOW': '🟢',
            'BUILDING': '🟡',
            'PEAK': '🔴',
            'DISPERSING': '🔵'
        }.get(phase, '⚪')
        
        return f"{phase_emoji} {phase}: Max: {max_d}, Avg: {avg_d}, Hotspots: {hotspots}"
    return "No density data"

