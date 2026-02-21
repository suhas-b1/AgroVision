import requests
import os
from .config import AI_API_KEY, AI_PROVIDER

def get_weather(lat, lng):
    """
    Fetch weather for a given lat/lng.
    Since we don't have a dedicated OpenWeather key yet, we'll use 
    a public API (wttr.in) or Open-Meteo for free data.
    """
    try:
        # Using Open-Meteo (Free, no key needed)
        url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lng}&current_weather=true"
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            data = response.json()
            current = data.get("current_weather", {})
            return {
                "temp": current.get("temperature"),
                "wind": current.get("windspeed"),
                "condition_code": current.get("weathercode"),
                "success": True
            }
        return {"success": False, "error": "Weather service unreachable"}
    except Exception as e:
        print(f"Weather Fetch Error: {e}")
        return {"success": False, "error": str(e)}

def get_weather_description(code):
    """Convert WMO weather codes to text."""
    codes = {
        0: "Clear sky",
        1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
        45: "Fog", 48: "Depositing rime fog",
        51: "Light drizzle", 53: "Moderate drizzle", 55: "Dense drizzle",
        61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain",
        71: "Slight snow fall", 73: "Moderate snow fall", 75: "Heavy snow fall",
        77: "Snow grains",
        80: "Slight rain showers", 81: "Moderate rain showers", 82: "Violent rain showers",
        95: "Thunderstorm", 96: "Thunderstorm with light hail", 99: "Thunderstorm with heavy hail"
    }
    return codes.get(code, "Unknown")
