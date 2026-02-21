import requests

OPENROUTER_API_KEY = "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"

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

MODEL = "openai/gpt-3.5-turbo"


def chat_with_ai(message):

    try:

        headers = {
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost",
            "X-Title": "AgroVision"
        }

        data = {
            "model": MODEL,
            "messages": [
                {
                    "role": "system",
                    "content": "You are a calm agricultural assistant. Answer only what the user asks. Keep answers short and simple."
                },
                {
                    "role": "user",
                    "content": message
                }
            ]
        }

        response = requests.post(
            OPENROUTER_URL,
            headers=headers,
            json=data,
            timeout=20
        )

        print("Status Code:", response.status_code)
        print("Response:", response.text)

        if response.status_code != 200:
            return "AI service temporarily unavailable."

        result = response.json()

        if "choices" not in result:
            return "AI did not return proper response."

        return result["choices"][0]["message"]["content"]

    except Exception as e:
        print("OpenRouter Error:", e)
        return "AI service temporarily unavailable."


def analyze_image_with_ai(image_path):
    return "Live camera analysis uses your trained disease model."
