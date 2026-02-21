"""
AgroVision AI — Pydantic Schemas
Request/response validation models for the API.
"""

from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


# ─── Auth ─────────────────────────────────────────────────

class UserCreate(BaseModel):
    username: str
    email: str
    password: str


class UserLogin(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    profile_image: Optional[str] = None
    settings_json: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class UserProfileUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    newPassword: Optional[str] = None
    settings_json: Optional[str] = None


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ─── Chat ─────────────────────────────────────────────────

class ChatRequest(BaseModel):
    message: str
    language: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None


class ChatResponse(BaseModel):
    reply: str
    language: str


# ─── Predict ──────────────────────────────────────────────

class PredictResponse(BaseModel):
    plant: str
    plant_confidence: float
    disease: str
    confidence: float
    severity: str
    warning: Optional[str] = None
    advice: str
    ai_explanation: str


# ─── Disease Log ──────────────────────────────────────────

class DiseaseLogResponse(BaseModel):
    id: int
    plant: str
    disease: str
    confidence: float
    severity: Optional[str] = None
    location: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Chat History ─────────────────────────────────────────

class ChatHistoryResponse(BaseModel):
    id: int
    role: str
    message: str
    language: str
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Community Hub ────────────────────────────────────────

class CommentResponse(BaseModel):
    id: int
    content: str
    username: str
    is_expert: bool
    created_at: datetime

    class Config:
        from_attributes = True


class CommunityPostCreate(BaseModel):
    title: str
    content: str
    image_url: Optional[str] = None


class CommunityPostResponse(BaseModel):
    id: int
    title: str
    content: str
    image_url: Optional[str] = None
    username: str
    created_at: datetime
    comment_count: int

    class Config:
        from_attributes = True


# ─── Finance ──────────────────────────────────────────────

class FinanceCreate(BaseModel):
    crop: str
    amount: float
    entry_type: str
    description: Optional[str] = None

class FinanceResponse(FinanceCreate):
    id: int
    date: datetime

    class Config:
        from_attributes = True
