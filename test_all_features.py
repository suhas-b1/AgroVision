import requests
import json
import time

BASE_URL = "http://127.0.0.1:8000"

def test_fertilizer():
    print("\n--- Testing Fertilizer Calc ---")
    resp = requests.get(f"{BASE_URL}/fertilizer-calc?crop=Rice&acreage=2.5")
    if resp.status_code == 200:
        data = resp.json()
        print(f"✅ Success: {data}")
    else:
        print(f"❌ Failed: {resp.status_code} - {resp.text}")

def test_weather():
    print("\n--- Testing Weather ---")
    resp = requests.get(f"{BASE_URL}/weather?lat=12.97&lng=77.59")
    if resp.status_code == 200:
        data = resp.json()
        print(f"✅ Success: {data}")
    else:
        print(f"❌ Failed: {resp.status_code} - {resp.text}")

def test_alerts():
    print("\n--- Testing Nearby Alerts ---")
    resp = requests.get(f"{BASE_URL}/alerts/nearby?lat=12.97&lng=77.59")
    if resp.status_code == 200:
        data = resp.json()
        print(f"✅ Success: Found {len(data)} alerts")
    else:
        print(f"❌ Failed: {resp.status_code} - {resp.text}")

def test_community_public():
    print("\n--- Testing Community Feed (Public) ---")
    resp = requests.get(f"{BASE_URL}/community/posts")
    if resp.status_code == 200:
        data = resp.json()
        print(f"✅ Success: Found {len(data)} posts")
    else:
        print(f"❌ Failed: {resp.status_code} - {resp.text}")

if __name__ == "__main__":
    test_fertilizer()
    test_weather()
    test_alerts()
    test_community_public()
