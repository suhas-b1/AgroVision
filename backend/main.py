"""
AgroVision AI — Main Application
FastAPI app with authentication, disease prediction, AI chat, vision, and heatmap.
"""

import os
import shutil
import traceback
from typing import Optional, List

from fastapi import FastAPI, UploadFile, File, Depends, Form, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .config import validate_config, UPLOAD_DIR
from .database import get_db, create_tables
from .auth import router as auth_router, get_current_user, get_optional_user
from .models import User, DiseaseLog, ChatHistory, CommunityPost, Comment, FinanceEntry
from .schemas import (
    UserCreate, UserLogin, Token, UserResponse, UserProfileUpdate,
    ChatRequest, ChatResponse, ChatHistoryResponse,
    PredictResponse, DiseaseLogResponse,
    CommunityPostCreate, CommunityPostResponse, CommentResponse,
    FinanceCreate, FinanceResponse
)
from .preprocess import preprocess_image
from .model import predict_plant, predict_disease
from .advisory import get_advisory
from .alerts import log_disease, get_heatmap_data
from . import ai_service
from . import weather_service
from . import fertilizer_service




# ─── App ──────────────────────────────────────────────────
app = FastAPI(
    title="AgroVision AI",
    description="Smart Agricultural AI Assistant",
    version="2.0.0",
)

# ─── CORS ─────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Include Auth Router ─────────────────────────────────
from .auth import router as auth_router, get_current_user, get_optional_user, hash_password, verify_password

app.include_router(auth_router)


# ─── User Profile ─────────────────────────────────────────

@app.put("/user/profile", response_model=UserResponse)
def update_profile(
    data: UserProfileUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    if data.username:
        # Check if username taken
        existing = db.query(User).filter(User.username == data.username).first()
        if existing and existing.id != user.id:
            raise HTTPException(status_code=400, detail="Username already taken")
        user.username = data.username
    
    if data.email:
        user.email = data.email
    
    if data.settings_json:
        user.settings_json = data.settings_json
        
    if data.password and data.newPassword:
        if not verify_password(data.password, user.hashed_password):
            raise HTTPException(status_code=400, detail="Current password incorrect")
        user.hashed_password = hash_password(data.newPassword)
        
    db.commit()
    db.refresh(user)
    return user

@app.post("/community/posts", response_model=CommunityPostResponse)
def create_post(
    data: CommunityPostCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    post = CommunityPost(
        user_id=user.id,
        title=data.title,
        content=data.content,
        image_url=data.image_url
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    
    return {
        "id": post.id,
        "title": post.title,
        "content": post.content,
        "image_url": post.image_url,
        "username": user.username,
        "created_at": post.created_at,
        "comment_count": 0
    }

@app.get("/community/posts", response_model=List[CommunityPostResponse])
def get_posts(db: Session = Depends(get_db)):
    posts = db.query(CommunityPost).order_by(CommunityPost.created_at.desc()).all()
    res = []
    for p in posts:
        res.append({
            "id": p.id,
            "title": p.title,
            "content": p.content,
            "image_url": p.image_url,
            "username": p.author.username,
            "created_at": p.created_at,
            "comment_count": len(p.comments)
        })
    return res

@app.get("/community/posts/{post_id}/comments", response_model=List[CommentResponse])
def get_comments(post_id: int, db: Session = Depends(get_db)):
    comments = db.query(Comment).filter(Comment.post_id == post_id).order_by(Comment.created_at.asc()).all()
    return [{
        "id": c.id,
        "content": c.content,
        "username": c.author.username,
        "is_expert": bool(c.is_expert),
        "created_at": c.created_at
    } for c in comments]

@app.post("/community/posts/{post_id}/comments")
def add_comment(
    post_id: int,
    content: str = Form(...),
    is_expert: int = Form(0),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    comment = Comment(
        post_id=post_id,
        user_id=user.id,
        content=content,
        is_expert=is_expert
    )
    db.add(comment)
    db.commit()
    return {"status": "success"}


# ══════════════════════════════════════════════════════════
# 💰 FINANCE TRACKER
# ══════════════════════════════════════════════════════════

@app.post("/finance", response_model=FinanceResponse)
def add_finance_entry(
    data: FinanceCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    entry = FinanceEntry(
        user_id=user.id,
        crop=data.crop,
        amount=data.amount,
        entry_type=data.entry_type,
        description=data.description
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry

@app.get("/finance", response_model=List[FinanceResponse])
def get_finance_entries(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    return db.query(FinanceEntry).filter(FinanceEntry.user_id == user.id).order_by(FinanceEntry.date.desc()).all()


@app.get("/alerts/nearby")
def get_nearby_alerts(lat: float, lng: float, db: Session = Depends(get_db)):
    """Find diseases logged within ~10km (0.1 degree) radius."""
    delta = 0.1
    logs = (
        db.query(DiseaseLog)
        .filter(
            DiseaseLog.lat.between(lat - delta, lat + delta),
            DiseaseLog.lng.between(lng - delta, lng + delta)
        )
        .order_by(DiseaseLog.created_at.desc())
        .limit(10)
        .all()
    )
    
    return [{
        "plant": log.plant,
        "disease": log.disease,
        "severity": log.severity,
        "distance": "Near you",
        "created_at": log.created_at
    } for log in logs]


# ─── Startup ─────────────────────────────────────────────
@app.on_event("startup")
def on_startup():
    validate_config()
    create_tables()
    print("🌱 AgroVision AI backend started")


# ─── Root ─────────────────────────────────────────────────
@app.get("/")
def root():
    return {"message": "AgroVision AI backend running", "version": "2.0.0"}


# ══════════════════════════════════════════════════════════
# 🌿 PREDICT — Disease Detection
# ══════════════════════════════════════════════════════════

@app.post("/predict")
async def predict(
    file: UploadFile = File(...),
    location: str = Query("Unknown"),
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_optional_user),
):
    try:
        if file.content_type not in ["image/jpeg", "image/png"]:
            return {"error": "Upload JPG or PNG image"}

        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        image = preprocess_image(file_path)
        
        # 1️⃣ Predict plant
        plant, plant_conf = predict_plant(image)

        # 2️⃣ Predict disease
        disease, disease_conf = predict_disease(plant, image)

        # 3️⃣ Get advisory
        advice = get_advisory(plant, disease)

        # 4️⃣ Severity
        if disease_conf > 0.75:
            severity = "High"
        elif disease_conf > 0.4:
            severity = "Medium"
        else:
            severity = "Low"

        warning = None
        if disease_conf < 0.4:
            warning = "Low confidence prediction. Please upload a clearer leaf image."

        # 5️⃣ Log to database
        log_disease(
            db=db,
            plant=plant,
            disease=disease,
            confidence=disease_conf,
            severity=severity,
            location=location,
            user_id=user.id if user else None,
        )

        # 6️⃣ AI explanation
        try:
            ai_explanation = ai_service.explain_disease(plant, disease)
        except Exception as e:
            print(f"AI explanation failed: {e}")
            ai_explanation = "AI explanation currently unavailable."

        return {
            "plant": plant,
            "plant_confidence": round(plant_conf * 100, 2),
            "disease": disease,
            "confidence": round(disease_conf * 100, 2),
            "severity": severity,
            "warning": warning,
            "advice": advice,
            "ai_explanation": ai_explanation,
        }

    except Exception as e:
        traceback.print_exc()
        return {"error": "Internal server error"}


# ══════════════════════════════════════════════════════════
# 🗺️ HEATMAP — Disease Spread Map
# ══════════════════════════════════════════════════════════

@app.get("/heatmap")
def heatmap(db: Session = Depends(get_db)):
    return get_heatmap_data(db)


@app.get("/weather")
def get_weather(lat: float, lng: float):
    """Get live weather for specific coordinates."""
    data = weather_service.get_weather(lat, lng)
    if data["success"]:
        data["condition"] = weather_service.get_weather_description(data["condition_code"])
        return data
    return {"error": "Weather data unavailable"}


@app.get("/fertilizer-calc")
def fertilizer_calc(crop: str, acreage: float):
    """Calculate fertilizer needs."""
    return fertilizer_service.calculate_fertilizer(crop, acreage)


# ══════════════════════════════════════════════════════════
# 💬 AI CHAT — Conversational Assistant
# ══════════════════════════════════════════════════════════

@app.post("/ai-chat", response_model=ChatResponse)
def ai_chat(
    data: ChatRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Chat with AI assistant. Requires authentication."""

    # Load last 20 messages from DB for context
    history_records = (
        db.query(ChatHistory)
        .filter(ChatHistory.user_id == user.id)
        .order_by(ChatHistory.created_at.desc())
        .limit(20)
        .all()
    )
    history_records.reverse()  # Oldest first

    # Build history for AI
    chat_history = []
    for record in history_records:
        role = "model" if record.role == "assistant" else record.role
        chat_history.append({
            "role": role,
            "parts": [record.message],
        })

    # Detect language
    detected_lang = data.language or "en"
    if not data.language:
        try:
            from langdetect import detect
            detected_lang = detect(data.message)
        except Exception:
            detected_lang = "en"

    # Get weather context if location provided
    location_context = None
    if data.lat is not None and data.lng is not None:
        weather = weather_service.get_weather(data.lat, data.lng)
        if weather["success"]:
            condition = weather_service.get_weather_description(weather["condition_code"])
            location_context = f"Current Location: {data.lat}, {data.lng}. Weather: {weather['temp']}°C, {condition}, Wind: {weather['wind']} km/h."

    # Get AI response
    reply = ai_service.chat(
        message=data.message,
        history=chat_history,
        language=detected_lang,
        location_context=location_context,
    )

    # Save user message to DB
    db.add(ChatHistory(
        user_id=user.id,
        role="user",
        message=data.message,
        language=detected_lang,
    ))

    # Save AI reply to DB
    db.add(ChatHistory(
        user_id=user.id,
        role="assistant",
        message=reply,
        language=detected_lang,
    ))
    db.commit()

    return ChatResponse(reply=reply, language=detected_lang)


# ══════════════════════════════════════════════════════════
# 👁️ AI VISION — Image Analysis
# ══════════════════════════════════════════════════════════

@app.post("/ai-vision")
async def ai_vision(
    file: UploadFile = File(...),
    user: Optional[User] = Depends(get_optional_user),
):
    """Analyze a plant image using AI vision."""

    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    result = ai_service.analyze_image(file_path)
    return {"analysis": result}


# ══════════════════════════════════════════════════════════
# 🎤 ASSISTANT — Combined Voice + Vision
# ══════════════════════════════════════════════════════════

@app.post("/assistant")
async def assistant(
    message: str = Form(...),
    file: UploadFile = File(None),
    lat: Optional[float] = Form(None),
    lng: Optional[float] = Form(None),
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_optional_user),
):
    """Combined assistant: text + optional image."""

    image_path = None

    if file:
        image_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(image_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

    # Get weather context if location provided
    location_context = None
    if lat is not None and lng is not None:
        weather = weather_service.get_weather(lat, lng)
        if weather["success"]:
            condition = weather_service.get_weather_description(weather["condition_code"])
            location_context = f"Current Location: {lat}, {lng}. Weather: {weather['temp']}°C, {condition}, Wind: {weather['wind']} km/h."

    # Load history
    history_records = (
        db.query(ChatHistory)
        .filter(ChatHistory.user_id == user.id)
        .order_by(ChatHistory.created_at.desc())
        .limit(10)
        .all()
    )
    history_records.reverse()
    chat_history = []
    for record in history_records:
        role = "model" if record.role == "assistant" else record.role
        chat_history.append({"role": role, "parts": [record.message]})

    if image_path:
        vision_text = ai_service.analyze_image(image_path)
        final_prompt = f"User said: {message}. Camera shows: {vision_text}"
    else:
        final_prompt = message

    reply = ai_service.chat(
        message=final_prompt,
        history=chat_history,
        location_context=location_context
    )
    
    # Persist
    db.add(ChatHistory(user_id=user.id, role="user", message=message))
    db.add(ChatHistory(user_id=user.id, role="assistant", message=reply))
    db.commit()
    
    return {"reply": reply}


# ══════════════════════════════════════════════════════════
# 👤 USER PROFILE & HISTORY
# ══════════════════════════════════════════════════════════

@app.get("/me", response_model=UserResponse)
def get_profile(user: User = Depends(get_current_user)):
    """Get current user's profile."""
    return user


@app.get("/chat-history", response_model=list[ChatHistoryResponse])
def get_chat_history(
    limit: int = Query(50, le=200),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Get current user's chat history."""
    records = (
        db.query(ChatHistory)
        .filter(ChatHistory.user_id == user.id)
        .order_by(ChatHistory.created_at.desc())
        .limit(limit)
        .all()
    )
    records.reverse()
    return records


@app.get("/my-predictions", response_model=list[DiseaseLogResponse])
def get_my_predictions(
    limit: int = Query(50, le=200),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Get current user's disease prediction history."""
    records = (
        db.query(DiseaseLog)
        .filter(DiseaseLog.user_id == user.id)
        .order_by(DiseaseLog.created_at.desc())
        .limit(limit)
        .all()
    )
    records.reverse()
    return records
