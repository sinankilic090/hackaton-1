from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from database import get_db
from models import Complaint, Poll, User
from schemas import AdminSummaryResponse
from dependencies import get_admin_user
from services.gemini import generate_weekly_summary

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/summary", response_model=AdminSummaryResponse)
async def get_admin_summary(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    total = (await db.execute(select(func.count()).select_from(Complaint))).scalar()
    resolved = (await db.execute(
        select(func.count()).select_from(Complaint).where(Complaint.status == "Çözüldü")
    )).scalar()
    pending = (await db.execute(
        select(func.count()).select_from(Complaint).where(Complaint.status == "Beklemede")
    )).scalar()
    urgent = (await db.execute(
        select(func.count()).select_from(Complaint).where(Complaint.gemini_urgency >= 7)
    )).scalar()
    active_polls = (await db.execute(
        select(func.count()).select_from(Poll).where(Poll.is_active == True)
    )).scalar()
    total_users = (await db.execute(select(func.count()).select_from(User))).scalar()

    return AdminSummaryResponse(
        total_complaints=total,
        resolved_complaints=resolved,
        pending_complaints=pending,
        urgent_complaints=urgent,
        active_polls=active_polls,
        total_users=total_users,
    )


@router.get("/weekly-summary")
async def get_weekly_summary(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    one_week_ago = datetime.now(timezone.utc) - timedelta(days=7)
    result = await db.execute(
        select(Complaint).where(Complaint.created_at >= one_week_ago)
    )
    complaints = result.scalars().all()

    if not complaints:
        return {"summary": "Bu hafta hiç şikayet gelmemiş."}

    complaints_text = "\n".join([
        f"- Kategori: {c.gemini_category or 'Belirsiz'}, Aciliyet: {c.gemini_urgency or '?'}/10, Özet: {c.gemini_summary or c.description[:80]}"
        for c in complaints
    ])

    summary = await generate_weekly_summary(complaints_text)
    return {"summary": summary, "complaint_count": len(complaints)}
