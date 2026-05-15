import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from database import get_db
from models import Poll, Vote, User
from schemas import PollCreate, PollOut, PollWithResults, VoteCreate
from dependencies import get_current_user, get_admin_user

router = APIRouter(prefix="/api/polls", tags=["polls"])


@router.get("/", response_model=list[PollWithResults])
async def get_polls(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Poll).order_by(Poll.created_at.desc()))
    polls = result.scalars().all()

    enriched = []
    for poll in polls:
        options = json.loads(poll.options)
        vote_counts = {opt: 0 for opt in options}

        votes_result = await db.execute(select(Vote).where(Vote.poll_id == poll.id))
        votes = votes_result.scalars().all()
        for vote in votes:
            if vote.choice in vote_counts:
                vote_counts[vote.choice] += 1

        user_vote_result = await db.execute(
            select(Vote).where(Vote.poll_id == poll.id, Vote.user_id == current_user.id)
        )
        user_vote = user_vote_result.scalar_one_or_none()

        enriched.append(PollWithResults(
            **{c.name: getattr(poll, c.name) for c in poll.__table__.columns},
            vote_counts=vote_counts,
            total_votes=sum(vote_counts.values()),
            user_voted=user_vote.choice if user_vote else None,
        ))
    return enriched


@router.post("/", response_model=PollOut, status_code=status.HTTP_201_CREATED)
async def create_poll(
    payload: PollCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    poll = Poll(
        title=payload.title,
        description=payload.description,
        options=json.dumps(payload.options, ensure_ascii=False),
    )
    db.add(poll)
    await db.commit()
    await db.refresh(poll)
    return poll


@router.post("/{poll_id}/vote", response_model=dict)
async def cast_vote(
    poll_id: int,
    payload: VoteCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    poll_result = await db.execute(select(Poll).where(Poll.id == poll_id))
    poll = poll_result.scalar_one_or_none()
    if not poll:
        raise HTTPException(status_code=404, detail="Anket bulunamadı")
    if not poll.is_active:
        raise HTTPException(status_code=400, detail="Bu anket artık aktif değil")

    options = json.loads(poll.options)
    if payload.choice not in options:
        raise HTTPException(status_code=400, detail="Geçersiz seçenek")

    existing = await db.execute(
        select(Vote).where(Vote.poll_id == poll_id, Vote.user_id == current_user.id)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Bu ankete zaten oy kullandınız")

    vote = Vote(poll_id=poll_id, user_id=current_user.id, choice=payload.choice)
    db.add(vote)
    await db.commit()
    return {"message": "Oyunuz başarıyla kaydedildi", "choice": payload.choice}


@router.patch("/{poll_id}/toggle", response_model=PollOut)
async def toggle_poll(
    poll_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    result = await db.execute(select(Poll).where(Poll.id == poll_id))
    poll = result.scalar_one_or_none()
    if not poll:
        raise HTTPException(status_code=404, detail="Anket bulunamadı")
    poll.is_active = not poll.is_active
    await db.commit()
    await db.refresh(poll)
    return poll
