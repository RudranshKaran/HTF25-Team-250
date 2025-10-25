"""
Weather Data Service
Fetches weather data from OpenWeatherMap API
"""

import requests
import os
from datetime import datetime
from typing import Dict, Optional
from app.utils.constants import BENGALURU_LAT, BENGALURU_LON


def _get_simulated_weather() -> Dict:
    """
    Return simulated weather data as fallback when API is unavailable.
    Varies slightly by time of day for realism.
    """
    hour = datetime.now().hour
    
    # Time-based weather variation
    if 6 <= hour < 12:
        temp, desc, icon = 26, "Clear morning", "01d"
    elif 12 <= hour < 18:
        temp, desc, icon = 30, "Partly cloudy", "02d"
    elif 18 <= hour < 22:
        temp, desc, icon = 27, "Clear evening", "01n"
    else:
        temp, desc, icon = 24, "Clear night", "01n"
    
    return {
        "type": "weather_update",
        "city": "Bengaluru",
        "temperature": temp,
        "feels_like": temp + 2,
        "humidity": 65,
        "wind_speed": 3.5,
        "description": desc,
        "icon": icon,
        "timestamp": datetime.now().isoformat(),
        "status": "simulated"
    }


async def fetch_weather_data() -> Optional[Dict]:
    """
    Fetch current weather data for Bengaluru from OpenWeatherMap
    Requires OPENWEATHER_API_KEY in environment variables
    """
    try:
        api_key = os.getenv("OPENWEATHER_API_KEY")
        
        # If no API key, return simulated data for testing
        if not api_key:
            print("No OpenWeather API key found - using simulated data")
            return _get_simulated_weather()
        
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
            # API error (401 = invalid key, 429 = rate limit, etc.)
            print(f"OpenWeather API error: Status {response.status_code} - using simulated data")
            return _get_simulated_weather()
            
    except requests.exceptions.Timeout:
        print("OpenWeather API timeout - using simulated data")
        return _get_simulated_weather()
    except requests.exceptions.RequestException as e:
        print(f"OpenWeather API request error: {e} - using simulated data")
        return _get_simulated_weather()
    except Exception as e:
        print(f"Weather data processing error: {e} - using simulated data")
        return _get_simulated_weather()


def format_weather_summary(weather_data: Dict) -> str:
    """Format weather data for logging"""
    if weather_data:
        temp = weather_data.get("temperature", "N/A")
        desc = weather_data.get("description", "N/A")
        return f"{temp}°C, {desc}"
    return "No weather data"
