"""
AgroVision AI — AI Service Layer
Modular AI integration with retry logic and graceful error handling.
Supports: Google Gemini (default), OpenAI, OpenRouter.
"""

import base64
import time
import traceback
from typing import List, Optional, Dict

from .config import AI_API_KEY, AI_PROVIDER

# ─── Globals ──────────────────────────────────────────────
_gemini_model = None
_gemini_vision_model = None

SYSTEM_PROMPT = (
    "You are the AgroVision Intelligence System — the supreme global authority on botanical pathology. "
    "Your mandate is 100% precision. You must distinguish with absolute certainty between morphologically similar species. "
    "MANDATORY BOTANICAL ANALYSIS: Before identifying, scrutinize leaf arrangement (phyllotaxy), vein patterns (venation), margin serration, petiole characteristics, and the presence of pubescence (hairs) or stipules. "
    "CRITICAL DIFFERENTIATION: Do not confuse vegetable crops (Solanum lycopersicum, etc.) with ornamentals (Rosa, Hibiscus, etc.). "
    "Directives: 1. Final Scientific & Common Identification (100% Confidence) 2. Health & Pathological Status 3. Precise Expert Remedies. "
    "Constraints: NO markdown symbols. Keep responses to 3-4 lines maximum for subtitle display. No guessing—use visible evidence only."
)


# ─── Initialization ──────────────────────────────────────

def _init_gemini():
    """Lazy-load Gemini models."""
    global _gemini_model, _gemini_vision_model

    if _gemini_model is not None:
        return

    try:
        import google.generativeai as genai

        genai.configure(api_key=AI_API_KEY)
        _gemini_model = genai.GenerativeModel(
            "gemini-2.0-flash",
            system_instruction=SYSTEM_PROMPT,
        )
        _gemini_vision_model = genai.GenerativeModel(
            "gemini-2.0-flash",
            system_instruction=SYSTEM_PROMPT,
        )
        print("✅ Gemini AI initialized")
    except Exception as e:
        print(f"❌ Gemini init failed: {e}")
        _gemini_model = None
        _gemini_vision_model = None


# ─── Chat ─────────────────────────────────────────────────

def chat(
    message: str,
    history: Optional[List[Dict[str, str]]] = None,
    language: str = "en",
    location_context: Optional[str] = None,
    max_retries: int = 3,
) -> str:
    """
    Send a chat message to the AI.
    """
    
    # Inject location context if available
    final_message = message
    if location_context:
        final_message = f"[System Context: {location_context}]\nUser Question: {message}"

    if not AI_API_KEY or AI_API_KEY.startswith("your-"):
        return "AI service not configured. Please set your API key in .env file."

    if AI_PROVIDER == "gemini":
        return _chat_gemini(final_message, history, max_retries)
    elif AI_PROVIDER in ["openai", "openrouter"]:
        return _chat_openai_compatible(final_message, history, max_retries, provider=AI_PROVIDER)
    else:
        return f"AI provider '{AI_PROVIDER}' not supported. Use 'gemini', 'openai', or 'openrouter'."


def _chat_gemini(
    message: str,
    history: Optional[List[Dict[str, str]]] = None,
    max_retries: int = 3,
) -> str:
    """Chat using Google Gemini API with retry logic."""
    _init_gemini()

    if _gemini_model is None:
        return "AI service temporarily unavailable (Gemini init failed)."

    for attempt in range(max_retries):
        try:
            chat_history = []
            if history:
                for msg in history[-20:]:
                    raw_role = msg.get("role", "user").lower()
                    role = "model" if raw_role in ["assistant", "bot", "model"] else "user"
                    chat_history.append({
                        "role": role,
                        "parts": [msg.get("message", msg.get("parts", [""])[0] if isinstance(msg.get("parts"), list) else "")]
                    })

            chat_session = _gemini_model.start_chat(history=chat_history)
            response = chat_session.send_message(message)

            if response and response.text:
                return response.text.strip()

            return "I couldn't generate a response. Please try again."

        except Exception as e:
            print(f"Gemini chat attempt {attempt + 1} failed: {e}")
            if attempt < max_retries - 1:
                time.sleep(2 ** attempt)
            continue

    return "AI service temporarily unavailable. Please try again later."


def _chat_openai_compatible(
    message: str,
    history: Optional[List[Dict[str, str]]] = None,
    max_retries: int = 3,
    provider: str = "openai"
) -> str:
    """Chat using OpenAI or OpenRouter."""
    try:
        from openai import OpenAI
        
        base_url = "https://openrouter.ai/api/v1" if provider == "openrouter" else None
        client = OpenAI(api_key=AI_API_KEY, base_url=base_url)
        
        # OpenRouter uses different model strings
        model = "google/gemini-2.0-flash-001" if provider == "openrouter" else "gpt-4o-mini"
        
        # Build messages
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        if history:
            for msg in history[-10:]:
                raw_role = msg.get("role", "user").lower()
                role = "assistant" if raw_role in ["assistant", "bot", "model"] else "user"
                content = msg.get("message", msg.get("parts", [""])[0] if isinstance(msg.get("parts"), list) else "")
                messages.append({"role": role, "content": content})
        messages.append({"role": "user", "content": message})

        for attempt in range(max_retries):
            try:
                headers = {
                    "HTTP-Referer": "https://agrovision.ai",
                    "X-Title": "AgroVision AI",
                } if provider == "openrouter" else {}
                
                response = client.chat.completions.create(
                    model=model,
                    messages=messages,
                    extra_headers=headers
                )
                return response.choices[0].message.content.strip()
            except Exception as e:
                print(f"❌ {provider} attempt {attempt + 1} failed: {e}")
                if attempt < max_retries - 1:
                    time.sleep(2 ** attempt)
                continue
    except Exception as e:
        print(f"❌ OpenAI service failed: {e}")
        
    return "AI service temporarily unavailable."


# ─── Vision ───────────────────────────────────────────────

def analyze_image(
    image_path: str,
    prompt: str = "Analyze this plant image. Describe the plant, its health condition, and any visible diseases or issues.",
    max_retries: int = 3,
) -> str:
    """
    Analyze a plant image using AI vision.
    """

    if not AI_API_KEY or AI_API_KEY.startswith("your-"):
        return "Vision AI not configured. Please set your API key in .env file."

    if AI_PROVIDER == "gemini":
        return _vision_gemini(image_path, prompt, max_retries)
    elif AI_PROVIDER in ["openai", "openrouter"]:
        return _vision_openai_compatible(image_path, prompt, max_retries, provider=AI_PROVIDER)
    else:
        return f"Vision not supported for provider '{AI_PROVIDER}'."


def _vision_gemini(
    image_path: str,
    prompt: str,
    max_retries: int = 3,
) -> str:
    """Analyze image using Gemini Vision API."""
    _init_gemini()

    if _gemini_vision_model is None:
        return "Vision AI service temporarily unavailable."

    for attempt in range(max_retries):
        try:
            with open(image_path, "rb") as f:
                image_data = f.read()

            mime_type = "image/png" if image_path.lower().endswith(".png") else "image/jpeg"

            image_part = {
                "mime_type": mime_type,
                "data": image_data,
            }

            response = _gemini_vision_model.generate_content([prompt, image_part])

            if response and response.text:
                return response.text.strip()

            return "Could not analyze the image."

        except Exception as e:
            print(f"Gemini vision attempt {attempt + 1} failed: {e}")
            if attempt < max_retries - 1:
                time.sleep(2 ** attempt)
            continue

    return "Vision AI service temporarily unavailable."


def _vision_openai_compatible(
    image_path: str,
    prompt: str,
    max_retries: int = 3,
    provider: str = "openai"
) -> str:
    """Analyze image using OpenAI compatible vision."""
    try:
        from openai import OpenAI
        
        base_url = "https://openrouter.ai/api/v1" if provider == "openrouter" else None
        client = OpenAI(api_key=AI_API_KEY, base_url=base_url)
        model = "google/gemini-2.0-flash-001" if provider == "openrouter" else "gpt-4o-mini"
        
        with open(image_path, "rb") as f:
            base64_image = base64.b64encode(f.read()).decode("utf-8")
        
        mime_type = "image/png" if image_path.lower().endswith(".png") else "image/jpeg"

        messages = [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:{mime_type};base64,{base64_image}"},
                    },
                ],
            }
        ]

        for attempt in range(max_retries):
            try:
                headers = {
                    "HTTP-Referer": "https://agrovision.ai",
                    "X-Title": "AgroVision AI",
                } if provider == "openrouter" else {}
                
                response = client.chat.completions.create(
                    model=model,
                    messages=messages,
                    extra_headers=headers
                )
                return response.choices[0].message.content.strip()
            except Exception as e:
                print(f"{provider} vision attempt {attempt + 1} failed: {e}")
                if attempt < max_retries - 1:
                    time.sleep(2 ** attempt)
                continue
    except Exception as e:
        print(f"Vision service failed: {e}")
        
    return "Vision AI temporarily unavailable."


# ─── Disease Explanation ──────────────────────────────────

def explain_disease(plant: str, disease: str) -> str:
    """Get AI explanation for a detected disease."""
    prompt = (
        f"A farmer's {plant} plant has been diagnosed with {disease}. "
        f"Explain in simple language: what this disease is, its cause, "
        f"treatment steps, and prevention. Keep it under 5 lines."
    )
    return chat(prompt)
