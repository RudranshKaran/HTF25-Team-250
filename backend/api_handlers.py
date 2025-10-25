"""
API Handlers for External Data Sources
- BMTC Bus GPS Data
- OpenWeatherMap Weather Data
"""

import requests
import os
from datetime import datetime
from typing import Dict, List, Optional

# Bengaluru coordinates
BENGALURU_LAT = 12.9716
BENGALURU_LON = 77.5946


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
        # Using route-based approach from GitHub repo
        popular_routes = ["356", "500", "G4", "335E", "KIA-9"]  # Popular Bengaluru routes
        
        headers = {
            "Content-Type": "application/json",
            "Host": "bmtcmob.hostg.in",
            "Connection": "Keep-Alive",
            "User-Agent": "Apache-HttpClient/UNAVAILABLE (java 1.4)"
        }
        
        all_buses = []
        
        # Try a couple of routes (don't overload the API)
        for route in popular_routes[:2]:  # Only try first 2 routes
            try:
                payload = {
                    "direction": "UP",
                    "routeNO": route
                }
                
                # Make request with shorter timeout
                response = requests.post(url, json=payload, headers=headers, timeout=5)
        
                if response.status_code == 200:
                    data = response.json()
                    
                    # Parse bus data (response structure from GitHub repo)
                    if isinstance(data, list):
                        for bus in data[:10]:  # Limit per route
                            try:
                                # Extract coordinates
                                lat = float(bus.get("latitude", 0))
                                lon = float(bus.get("longitude", 0))
                                
                                # Only add valid coordinates
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
                continue  # Try next route
            except Exception:
                continue  # Try next route
        
        # If we got any buses, return them
        if all_buses:
            return {
                "type": "gps_update",
                "count": len(all_buses),
                "buses": all_buses,
                "timestamp": datetime.now().isoformat(),
                "status": "success"
            }
        else:
            # Return simulated data for demo purposes
            print("BMTC: No live data, using demo buses")
            return get_demo_buses()
            
    except requests.exceptions.Timeout:
        print("BMTC API timeout")
        return None
    except requests.exceptions.RequestException as e:
        print(f"BMTC API request error: {e}")
        return None
    except Exception as e:
        print(f"BMTC data processing error: {e}")
        return None


async def fetch_weather_data() -> Optional[Dict]:
    """
    Fetch current weather data for Bengaluru from OpenWeatherMap
    Requires OPENWEATHER_API_KEY in environment variables
    """
    try:
        api_key = os.getenv("7411714f5e7fc080249fdc1141a6a519")
        
        # If no API key, return simulated data for testing
        if not api_key or api_key == "7411714f5e7fc080249fdc1141a6a519":
            print("No OpenWeather API key found - using simulated data")
            return {
                "type": "weather_update",
                "city": "Bengaluru",
                "temperature": 28,
                "feels_like": 30,
                "humidity": 65,
                "wind_speed": 3.5,
                "description": "Clear sky",
                "icon": "01d",
                "timestamp": datetime.now().isoformat(),
                "status": "simulated"
            }
        
        # OpenWeatherMap API endpoint
        url = "https://api.openweathermap.org/data/2.5/weather"
        
        params = {
            "lat": BENGALURU_LAT,
            "lon": BENGALURU_LON,
            "appid": api_key,
            "units": "metric"  # Celsius
        }
        
        response = requests.get(url, params=params, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            
            # Parse weather data
            return {
                "type": "weather_update",
                "city": data.get("name", "Bengaluru"),
                "temperature": round(data["main"]["temp"], 1),
                "feels_like": round(data["main"]["feels_like"], 1),
                "humidity": data["main"]["humidity"],
                "wind_speed": round(data["wind"]["speed"], 1),
                "description": data["weather"][0]["description"].capitalize(),
                "icon": data["weather"][0]["icon"],
                "timestamp": datetime.now().isoformat(),
                "status": "success"
            }
        else:
            print(f"OpenWeather API error: Status {response.status_code}")
            return None
            
    except requests.exceptions.Timeout:
        print("OpenWeather API timeout")
        return None
    except requests.exceptions.RequestException as e:
        print(f"OpenWeather API request error: {e}")
        return None
    except Exception as e:
        print(f"Weather data processing error: {e}")
        return None


def format_bus_summary(bus_data: Dict) -> str:
    """Format bus data for logging"""
    if bus_data and bus_data.get("buses"):
        count = bus_data.get("count", 0)
        return f"Fetched {count} buses"
    return "No bus data"


def format_weather_summary(weather_data: Dict) -> str:
    """Format weather data for logging"""
    if weather_data:
        temp = weather_data.get("temperature", "N/A")
        desc = weather_data.get("description", "N/A")
        return f"{temp}°C, {desc}"
    return "No weather data"


def get_demo_buses() -> Dict:
    """
    Return demo bus data for testing when BMTC API is unavailable
    Places buses around Bengaluru city center
    """
    import random
    
    # Generate 8-10 demo buses around Bengaluru
    demo_buses = []
    base_routes = ["356", "500", "G4", "335E", "KIA-9", "41C", "201A", "283D"]
    
    for i, route in enumerate(base_routes):
        # Random positions around Bengaluru (within ~5km of center)
        lat_offset = random.uniform(-0.05, 0.05)
        lon_offset = random.uniform(-0.05, 0.05)
        
        demo_buses.append({
            "id": f"KA01AB{1000 + i}",
            "route": route,
            "lat": BENGALURU_LAT + lat_offset,
            "lon": BENGALURU_LON + lon_offset,
            "speed": random.randint(10, 40),
            "timestamp": datetime.now().isoformat()
        })
    
    return {
        "type": "gps_update",
        "count": len(demo_buses),
        "buses": demo_buses,
        "timestamp": datetime.now().isoformat(),
        "status": "demo"  # Indicates this is demo data
    }

