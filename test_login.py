import requests

url = "http://127.0.0.1:8000/auth/login"
data = {
    "username": "suhas_b1",
    "password": "password123" # I'll try the common password or it might fail
}

print(f"Testing login for {data['username']}...")
try:
    response = requests.post(url, json=data)
    print("Status:", response.status_code)
    print("Response:", response.json())
except Exception as e:
    print("Error:", e)
