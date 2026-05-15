from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, ForeignKey, Text, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    tckn = Column(String(11), unique=True, nullable=False, index=True)
    full_name = Column(String(100), nullable=False)
    is_admin = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    complaints = relationship("Complaint", back_populates="owner")
    votes = relationship("Vote", back_populates="voter")


class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String(50), default="Beklemede")  # Beklemede, İnceleniyor, Çözüldü

    # Gemini AI analysis fields
    gemini_category = Column(String(100), nullable=True)
    gemini_sentiment = Column(String(50), nullable=True)   # Pozitif, Negatif, Nötr
    gemini_urgency = Column(Float, nullable=True)           # 1-10
    gemini_summary = Column(Text, nullable=True)
    ai_analyzed = Column(Boolean, default=False)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    owner = relationship("User", back_populates="complaints")


class Poll(Base):
    __tablename__ = "polls"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    options = Column(Text, nullable=False)  # JSON string: ["Seçenek A", "Seçenek B"]
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    votes = relationship("Vote", back_populates="poll")


class Vote(Base):
    __tablename__ = "votes"

    id = Column(Integer, primary_key=True, index=True)
    poll_id = Column(Integer, ForeignKey("polls.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    choice = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        UniqueConstraint("poll_id", "user_id", name="uq_vote_poll_user"),
    )

    poll = relationship("Poll", back_populates="votes")
    voter = relationship("User", back_populates="votes")
