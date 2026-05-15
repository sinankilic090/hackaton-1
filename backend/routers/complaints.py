from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from database import get_db
from models import Complaint, User
from schemas import ComplaintCreate, ComplaintOut, ComplaintStatusUpdate
from dependencies import get_current_user, get_admin_user
from services.gemini import analyze_complaint

router = APIRouter(prefix="/api/complaints", tags=["complaints"])


async def run_gemini_analysis(complaint_id: int, description: str):
    """Arka planda Gemini analizi çalıştırır."""
    from database import AsyncSessionLocal
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Complaint).where(Complaint.id == complaint_id))
        complaint = result.scalar_one_or_none()
        if complaint:
            analysis = await analyze_complaint(description)
            complaint.gemini_category = analysis["category"]
            complaint.gemini_sentiment = analysis["sentiment"]
            complaint.gemini_urgency = analysis["urgency"]
            complaint.gemini_summary = analysis["summary"]
            complaint.ai_analyzed = True
            await db.commit()


@router.post("/", response_model=ComplaintOut, status_code=status.HTTP_201_CREATED)
async def create_complaint(
    payload: ComplaintCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    complaint = Complaint(
        user_id=current_user.id,
        description=payload.description,
        status="Beklemede",
    )
    db.add(complaint)
    await db.commit()
    await db.refresh(complaint)

    # Gemini analizi arka planda başlat
    background_tasks.add_task(run_gemini_analysis, complaint.id, payload.description)

    return complaint


@router.get("/my", response_model=list[ComplaintOut])
async def get_my_complaints(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Complaint)
        .where(Complaint.user_id == current_user.id)
        .order_by(Complaint.created_at.desc())
    )
    return result.scalars().all()


@router.get("/all", response_model=list[ComplaintOut])
async def get_all_complaints(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    result = await db.execute(
        select(Complaint)
        .options(selectinload(Complaint.owner))
        .order_by(Complaint.created_at.desc())
    )
    return result.scalars().all()


@router.patch("/{complaint_id}/status", response_model=ComplaintOut)
async def update_complaint_status(
    complaint_id: int,
    payload: ComplaintStatusUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    result = await db.execute(select(Complaint).where(Complaint.id == complaint_id))
    complaint = result.scalar_one_or_none()
    if not complaint:
        raise HTTPException(status_code=404, detail="Şikayet bulunamadı")
    complaint.status = payload.status
    await db.commit()
    await db.refresh(complaint)
    return complaint


@router.get("/{complaint_id}", response_model=ComplaintOut)
async def get_complaint(
    complaint_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Complaint)
        .options(selectinload(Complaint.owner))
        .where(Complaint.id == complaint_id)
    )
    complaint = result.scalar_one_or_none()
    if not complaint:
        raise HTTPException(status_code=404, detail="Şikayet bulunamadı")
    if not current_user.is_admin and complaint.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Bu şikayete erişim izniniz yok")
    return complaint
