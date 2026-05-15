from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_db
from models import User
from schemas import EDevletLoginRequest, TokenResponse
from auth import create_access_token
from dependencies import get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/edevlet", response_model=TokenResponse)
async def edevlet_login(payload: EDevletLoginRequest, db: AsyncSession = Depends(get_db)):
    """
    Mock e-Devlet girişi. TCKN + Ad Soyad ile kullanıcı oluşturur ya da mevcut olanı döndürür.
    İlk kayıt olan kişi admin olur (demo amaçlı).
    """
    result = await db.execute(select(User).where(User.tckn == payload.tckn))
    user = result.scalar_one_or_none()

    if user is None:
        # İlk kullanıcı admin olsun (demo)
        total = await db.execute(select(User))
        is_first = total.scalars().first() is None

        user = User(
            tckn=payload.tckn,
            full_name=payload.full_name,
            is_admin=is_first,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    token = create_access_token(data={"sub": str(user.id)})

    return TokenResponse(
        token=token,
        token_type="bearer",
        is_admin=user.is_admin,
        full_name=user.full_name,
        user_id=user.id,
    )


@router.get("/me", response_model=dict)
async def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "tckn": current_user.tckn,
        "full_name": current_user.full_name,
        "is_admin": current_user.is_admin,
    }
