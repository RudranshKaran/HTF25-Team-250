"""
Multi-Zone Crowd Simulation Service
Simulates crowd density across all monitored zones in Bengaluru
Each zone has independent crowd dynamics with zone-specific characteristics
"""

import random
import math
from datetime import datetime
from typing import Dict, List
from app.utils.constants import ZONES, DENSITY_THRESHOLD_HIGH, DENSITY_THRESHOLD_CRITICAL

# Global state for each zone's crowd accumulation
_zone_states = {}


def initialize_zone_states():
    """Initialize crowd states for all zones"""
    global _zone_states
    
    if not _zone_states:
        for zone_id, zone_config in ZONES.items():
            # Different zones start at different phases for variety
            phases = ['low', 'building', 'peak', 'dispersing']
            initial_phase = random.choice(phases)
            
            # Base intensity correlates with zone capacity
            capacity_factor = zone_config["capacity"] / 50000  # Normalize
            base_intensity = random.randint(10, int(30 * capacity_factor))
            
            _zone_states[zone_id] = {
                'zone_id': zone_id,
                'zone_name': zone_config["name"],
                'phase': initial_phase,
                'base_intensity': base_intensity,
                'hotspot_centers': [],
                'cycle_count': 0,
                'phase_duration': 0,
                'capacity': zone_config["capacity"],
                'type': zone_config["type"]
            }


def update_zone_phase(zone_state: Dict):
    """Update the crowd phase for a single zone"""
    zone_state['cycle_count'] += 1
    zone_state['phase_duration'] += 1
    
    current_phase = zone_state['phase']
    zone_type = zone_state['type']
    
    # Zone-specific buildup rates based on type
    if zone_type == "event_venue":
        buildup_rate = random.uniform(10, 18)  # Fast buildup for events
        dispersal_rate = random.uniform(12, 22)  # Moderate dispersal
        peak_duration = random.randint(8, 12)  # Longer peaks
    elif zone_type == "transit":
        buildup_rate = random.uniform(8, 14)  # Moderate buildup
        dispersal_rate = random.uniform(10, 18)  # Fast dispersal
        peak_duration = random.randint(5, 8)  # Medium peaks
    elif zone_type == "commercial":
        buildup_rate = random.uniform(6, 12)  # Steady buildup
        dispersal_rate = random.uniform(8, 15)  # Steady dispersal
        peak_duration = random.randint(10, 15)  # Long peaks
    elif zone_type == "mixed":
        buildup_rate = random.uniform(7, 13)  # Balanced
        dispersal_rate = random.uniform(9, 16)  # Balanced
        peak_duration = random.randint(6, 10)  # Medium peaks
    else:  # tourist
        buildup_rate = random.uniform(5, 10)  # Slow buildup
        dispersal_rate = random.uniform(7, 14)  # Moderate dispersal
        peak_duration = random.randint(7, 11)  # Medium peaks
    
    # Capacity factor (larger zones build up slower but to higher densities)
    capacity_factor = zone_state['capacity'] / 50000
    max_intensity = int(200 * capacity_factor)
    
    # Phase transitions
    if current_phase == 'building':
        zone_state['base_intensity'] += buildup_rate
        
        if zone_state['base_intensity'] > max_intensity * 0.9:
            zone_state['phase'] = 'peak'
            zone_state['phase_duration'] = 0
            print(f"🔥 {zone_state['zone_name']}: BUILDING → PEAK (Density: {int(zone_state['base_intensity'])})")
    
    elif current_phase == 'peak':
        zone_state['base_intensity'] += random.uniform(-8, 8)
        zone_state['base_intensity'] = min(max_intensity, zone_state['base_intensity'])
        
        if zone_state['phase_duration'] > peak_duration:
            zone_state['phase'] = 'dispersing'
            zone_state['phase_duration'] = 0
            print(f"⚠️ {zone_state['zone_name']}: PEAK → DISPERSING")
    
    elif current_phase == 'dispersing':
        zone_state['base_intensity'] -= dispersal_rate
        zone_state['base_intensity'] = max(0, zone_state['base_intensity'])
        
        if zone_state['base_intensity'] < 30:
            zone_state['phase'] = 'low'
            zone_state['phase_duration'] = 0
            zone_state['hotspot_centers'] = []
            print(f"✅ {zone_state['zone_name']}: DISPERSING → LOW")
    
    elif current_phase == 'low':
        zone_state['base_intensity'] = max(5, zone_state['base_intensity'] - 2)
        
        low_duration = random.randint(4, 10)
        if zone_state['phase_duration'] > low_duration:
            zone_state['phase'] = 'building'
            zone_state['phase_duration'] = 0
            # Create new hotspots
            num_hotspots = random.randint(2, 4)
            grid_size = 10
            zone_state['hotspot_centers'] = [
                {
                    'i': random.randint(2, grid_size - 3),
                    'j': random.randint(2, grid_size - 3),
                }
                for _ in range(num_hotspots)
            ]
            print(f"🟢 {zone_state['zone_name']}: LOW → BUILDING")


def generate_zone_density_grid(zone_state: Dict) -> tuple:
    """Generate density grid for a single zone"""
    grid_size = 10
    grid = []
    hotspots = []
    
    # Ensure hotspots exist
    if not zone_state['hotspot_centers']:
        num_hotspots = random.randint(2, 3)
        zone_state['hotspot_centers'] = [
            {
                'i': random.randint(2, grid_size - 3),
                'j': random.randint(2, grid_size - 3),
            }
            for _ in range(num_hotspots)
        ]
    
    base_intensity = zone_state['base_intensity']
    
    for i in range(grid_size):
        row = []
        for j in range(grid_size):
            density = random.randint(0, 5)
            
            # Add hotspot influence
            for hotspot in zone_state['hotspot_centers']:
                distance = math.sqrt((i - hotspot['i'])**2 + (j - hotspot['j'])**2)
                
                if distance < 0.5:
                    contribution = base_intensity
                elif distance < 1.5:
                    contribution = base_intensity * 0.7
                elif distance < 3.0:
                    contribution = base_intensity * 0.4
                elif distance < 5.0:
                    contribution = base_intensity * 0.15
                else:
                    contribution = 0
                
                density += contribution
            
            # Add noise
            density += random.uniform(-5, 5)
            density = max(0, int(density))
            
            row.append(density)
            
            # Track hotspots
            if density > base_intensity * 0.7:
                lat_offset = (i - grid_size/2) * 0.002
                lon_offset = (j - grid_size/2) * 0.002
                hotspots.append({
                    "lat": ZONES[zone_state['zone_id']]["center"][0] + lat_offset,
                    "lon": ZONES[zone_state['zone_id']]["center"][1] + lon_offset,
                    "intensity": density
                })
        
        grid.append(row)
    
    return grid, hotspots


async def simulate_all_zones_density() -> Dict:
    """
    Simulate crowd density for all zones
    Returns comprehensive multi-zone data
    """
    global _zone_states
    
    initialize_zone_states()
    
    zones_data = {}
    all_hotspots = []
    total_people = 0
    max_density_overall = 0
    critical_zones = []
    warning_zones = []
    
    for zone_id, zone_state in _zone_states.items():
        # Update phase
        update_zone_phase(zone_state)
        
        # Generate grid
        grid, hotspots = generate_zone_density_grid(zone_state)
        
        # Calculate statistics
        flat_densities = [d for row in grid for d in row]
        avg_density = sum(flat_densities) / len(flat_densities)
        max_density = max(flat_densities)
        
        total_people += int(avg_density * 100)  # Rough estimate
        max_density_overall = max(max_density_overall, max_density)
        
        # Track zone status
        if max_density > DENSITY_THRESHOLD_CRITICAL:
            critical_zones.append(zone_state['zone_name'])
        elif max_density > DENSITY_THRESHOLD_HIGH:
            warning_zones.append(zone_state['zone_name'])
        
        zones_data[zone_id] = {
            "zone_id": zone_id,
            "zone_name": zone_state['zone_name'],
            "grid": grid,
            "hotspots": hotspots,
            "avg_density": round(avg_density, 2),
            "max_density": int(max_density),
            "phase": zone_state['phase'],
            "center": ZONES[zone_id]["center"],
            "capacity": zone_state['capacity'],
            "occupancy_percent": round((avg_density / (zone_state['capacity'] / 100)) * 100, 1),
            "status": "critical" if max_density > DENSITY_THRESHOLD_CRITICAL else 
                     "warning" if max_density > DENSITY_THRESHOLD_HIGH else "normal"
        }
        
        all_hotspots.extend(hotspots)
    
    return {
        "type": "multi_zone_density_update",
        "timestamp": datetime.now().isoformat(),
        "zones": zones_data,
        "summary": {
            "total_zones": len(zones_data),
            "total_people_estimate": total_people,
            "max_density_overall": max_density_overall,
            "critical_zones": critical_zones,
            "warning_zones": warning_zones,
            "all_hotspots": all_hotspots[:50]  # Limit for performance
        }
    }


def check_multi_zone_alerts(zone_density_data: Dict, metro_data: Dict) -> List[Dict]:
    """
    Check alerts for all zones
    Returns list of zone-specific alerts
    """
    alerts = []
    
    if not zone_density_data or "zones" not in zone_density_data:
        return alerts
    
    zones = zone_density_data["zones"]
    
    for zone_id, zone_data in zones.items():
        max_density = zone_data.get("max_density", 0)
        zone_name = zone_data.get("zone_name", zone_id)
        zone_center = zone_data.get("center", [0, 0])
        
        # Critical density alert
        if max_density > DENSITY_THRESHOLD_CRITICAL:
            alerts.append({
                "type": "alert",
                "level": "critical",
                "category": "crowd_density",
                "zone": zone_name,
                "zone_id": zone_id,
                "message": f"Critical crowd density in {zone_name}: {max_density} people",
                "value": max_density,
                "threshold": DENSITY_THRESHOLD_CRITICAL,
                "recommendation": "Immediate crowd control measures required",
                "location": zone_center,
                "timestamp": datetime.now().isoformat()
            })
        
        # Warning density alert
        elif max_density > DENSITY_THRESHOLD_HIGH:
            alerts.append({
                "type": "alert",
                "level": "warning",
                "category": "crowd_density",
                "zone": zone_name,
                "zone_id": zone_id,
                "message": f"High crowd density in {zone_name}: {max_density} people",
                "value": max_density,
                "threshold": DENSITY_THRESHOLD_HIGH,
                "recommendation": "Monitor situation closely",
                "location": zone_center,
                "timestamp": datetime.now().isoformat()
            })
    
    # Metro-specific alerts (if MG Road Metro has high exit rate)
    if metro_data and "mg_road_metro" in zones:
        exit_rate = metro_data.get("exit_rate", 0)
        mg_road_density = zones["mg_road_metro"].get("max_density", 0)
        
        if exit_rate > 70 and mg_road_density > DENSITY_THRESHOLD_HIGH:
            alerts.append({
                "type": "alert",
                "level": "critical",
                "category": "combined",
                "zone": "MG Road Metro",
                "zone_id": "mg_road_metro",
                "message": f"High metro exit rate + High crowd density at MG Road",
                "value": f"Density: {mg_road_density}, Exit: {exit_rate}/min",
                "threshold": "Multiple thresholds exceeded",
                "recommendation": "Deploy crowd management personnel immediately",
                "location": ZONES["mg_road_metro"]["center"],
                "timestamp": datetime.now().isoformat()
            })
    
    return alerts

