from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# ── Auth ──────────────────────────────────────────────────────────────────────
class EDevletLoginRequest(BaseModel):
    tckn: str = Field(..., min_length=11, max_length=11, pattern=r"^\d{11}$")
    full_name: str = Field(..., min_length=2, max_length=100)


class TokenResponse(BaseModel):
    token: str
    token_type: str
    is_admin: bool
    full_name: str
    user_id: int


# ── User ──────────────────────────────────────────────────────────────────────
class UserOut(BaseModel):
    id: int
    tckn: str
    full_name: str
    is_admin: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Complaint ─────────────────────────────────────────────────────────────────
class ComplaintCreate(BaseModel):
    description: str = Field(..., min_length=10, max_length=2000)


class ComplaintOut(BaseModel):
    id: int
    user_id: int
    description: str
    status: str
    gemini_category: Optional[str] = None
    gemini_sentiment: Optional[str] = None
    gemini_urgency: Optional[float] = None
    gemini_summary: Optional[str] = None
    ai_analyzed: bool
    created_at: datetime
    owner: Optional[UserOut] = None

    model_config = {"from_attributes": True}


class ComplaintStatusUpdate(BaseModel):
    status: str = Field(..., pattern=r"^(Beklemede|İnceleniyor|Çözüldü)$")


# ── Poll ──────────────────────────────────────────────────────────────────────
class PollCreate(BaseModel):
    title: str = Field(..., min_length=5, max_length=255)
    description: Optional[str] = None
    options: List[str] = Field(..., min_length=2)


class PollOut(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    options: str  # JSON string
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class PollWithResults(PollOut):
    vote_counts: dict  # {"Seçenek A": 5, "Seçenek B": 3}
    total_votes: int
    user_voted: Optional[str] = None  # What the current user chose


# ── Vote ──────────────────────────────────────────────────────────────────────
class VoteCreate(BaseModel):
    choice: str = Field(..., min_length=1)


# ── Admin ─────────────────────────────────────────────────────────────────────
class AdminSummaryResponse(BaseModel):
    total_complaints: int
    resolved_complaints: int
    pending_complaints: int
    urgent_complaints: int  # urgency >= 7
    active_polls: int
    total_users: int
    gemini_weekly_summary: Optional[str] = None
