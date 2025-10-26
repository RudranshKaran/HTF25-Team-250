"""
Constants for the application
Location coordinates, thresholds, and configuration values
"""

# Bengaluru coordinates
BENGALURU_CENTER = [12.9716, 77.5946]
BENGALURU_LAT = 12.9716
BENGALURU_LON = 77.5946

# Key locations (for backward compatibility)
STADIUM_LOCATION = [12.9789, 77.5993]
METRO_LOCATION = [12.9756, 77.6057]

# Multi-Zone Configuration
ZONES = {
    "stadium": {
        "id": "stadium",
        "name": "Chinnaswamy Stadium",
        "center": [12.9789, 77.5993],
        "radius": 1000,  # meters
        "capacity": 40000,
        "type": "event_venue",
        "icon": "🏟️",
        "color": "#ff4444",
        "monitoring": True
    },
    "mg_road_metro": {
        "id": "mg_road_metro",
        "name": "MG Road Metro",
        "center": [12.9756, 77.6057],
        "radius": 500,
        "capacity": 15000,
        "type": "transit",
        "icon": "🚇",
        "color": "#4169e1",
        "monitoring": True
    },
    "majestic": {
        "id": "majestic",
        "name": "Majestic Bus Stand",
        "center": [12.9767, 77.5713],
        "radius": 800,
        "capacity": 50000,
        "type": "transit",
        "icon": "🚌",
        "color": "#ff8c00",
        "monitoring": True
    },
    "electronic_city": {
        "id": "electronic_city",
        "name": "Electronic City",
        "center": [12.8450, 77.6628],
        "radius": 2000,
        "capacity": 100000,
        "type": "commercial",
        "icon": "💼",
        "color": "#32cd32",
        "monitoring": True
    },
    "koramangala": {
        "id": "koramangala",
        "name": "Koramangala",
        "center": [12.9352, 77.6245],
        "radius": 1500,
        "capacity": 60000,
        "type": "mixed",
        "icon": "🛍️",
        "color": "#ffd700",
        "monitoring": True
    },
    "indiranagar": {
        "id": "indiranagar",
        "name": "Indiranagar",
        "center": [12.9784, 77.6408],
        "radius": 1200,
        "capacity": 45000,
        "type": "mixed",
        "icon": "🏠",
        "color": "#9370db",
        "monitoring": True
    },
    "cubbon_park": {
        "id": "cubbon_park",
        "name": "Cubbon Park Area",
        "center": [12.9762, 77.5929],
        "radius": 1000,
        "capacity": 30000,
        "type": "tourist",
        "icon": "🏛️",
        "color": "#20b2aa",
        "monitoring": True
    }
}

# Alert thresholds
DENSITY_THRESHOLD_HIGH = 150
DENSITY_THRESHOLD_CRITICAL = 200
METRO_FLOW_THRESHOLD = 80  # passengers/min
