"""
BMTC Bus GPS Data Service
Fetches live bus data from BMTC API
"""

import requests
import random
from datetime import datetime
from typing import Dict, Optional
from app.utils.constants import ZONES


async def fetch_bmtc_bus_data() -> Optional[Dict]:
    """
    Fetch live BMTC bus GPS data from unofficial API
    Based on: https://github.com/iotakodali/bmtc-realtime-api
    Returns bus locations with coordinates and route info
    """
    try:
        # BMTC API endpoint (unofficial)
        url = "http://bmtcmob.hostg.in/api/itsroutewise/details"
        
        # Request payload - try popular routes around Bengaluru
        popular_routes = ["356", "500", "G4", "335E", "KIA-9"]
        
        headers = {
            "Content-Type": "application/json",
            "Host": "bmtcmob.hostg.in",
            "Connection": "Keep-Alive",
            "User-Agent": "Apache-HttpClient/UNAVAILABLE (java 1.4)"
        }
        
        all_buses = []
        
        # Try a couple of routes (don't overload the API)
        for route in popular_routes[:2]:
            try:
                payload = {
                    "direction": "UP",
                    "routeNO": route
                }
                
                response = requests.post(url, json=payload, headers=headers, timeout=5)
        
                if response.status_code == 200:
                    data = response.json()
                    
                    if isinstance(data, list):
                        for bus in data[:10]:
                            try:
                                lat = float(bus.get("latitude", 0))
                                lon = float(bus.get("longitude", 0))
                                
                                if lat != 0 and lon != 0:
                                    all_buses.append({
                                        "id": bus.get("busId", bus.get("vehicleNo", f"bus_{len(all_buses)}")),
                                        "route": route,
                                        "lat": lat,
                                        "lon": lon,
                                        "speed": bus.get("speed", 0),
                                        "timestamp": datetime.now().isoformat()
                                    })
                            except (ValueError, TypeError, KeyError):
                                continue
                                
            except requests.exceptions.Timeout:
                continue
            except Exception:
                continue
        
        if all_buses:
            return {
                "type": "gps_update",
                "count": len(all_buses),
                "buses": all_buses,
                "timestamp": datetime.now().isoformat(),
                "status": "success"
            }
        else:
            print("BMTC: No live data, using demo buses")
            return _get_demo_buses()
            
    except requests.exceptions.Timeout:
        print("BMTC API timeout")
        return None
    except requests.exceptions.RequestException as e:
        print(f"BMTC API request error: {e}")
        return None
    except Exception as e:
        print(f"BMTC data processing error: {e}")
        return None


def _get_demo_buses() -> Dict:
    """
    Return demo bus data for testing when BMTC API is unavailable
    Places buses across all monitored zones in Bengaluru
    """
    demo_buses = []
    base_routes = ["356", "500", "G4", "335E", "KIA-9", "41C", "201A", "283D", "K-2", "V-500", "AS-1", "MF-1"]
    
    # Convert zones to list for easier access
    zone_list = list(ZONES.values())
    
    # Distribute buses across all zones
    for i, route in enumerate(base_routes):
        # Assign bus to a zone (cycle through zones)
        zone = zone_list[i % len(zone_list)]
        
        # Place bus near zone center with some random offset (within zone radius)
        radius_offset = zone["radius"] / 111000  # Convert meters to degrees (approx)
        lat_offset = random.uniform(-radius_offset, radius_offset)
        lon_offset = random.uniform(-radius_offset, radius_offset)
        
        demo_buses.append({
            "id": f"KA01AB{1000 + i}",
            "route": route,
            "lat": zone["center"][0] + lat_offset,
            "lon": zone["center"][1] + lon_offset,
            "speed": random.randint(10, 40),
            "zone": zone["name"],
            "timestamp": datetime.now().isoformat()
        })
    
    return {
        "type": "gps_update",
        "count": len(demo_buses),
        "buses": demo_buses,
        "timestamp": datetime.now().isoformat(),
        "status": "demo"
    }


def format_bus_summary(bus_data: Dict) -> str:
    """Format bus data for logging"""
    if bus_data and bus_data.get("buses"):
        count = bus_data.get("count", 0)
        return f"Fetched {count} buses"
    return "No bus data"
