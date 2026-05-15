from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from database import init_db
from routers import auth, complaints, polls, admin


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Uygulama başlarken veritabanı tablolarını oluştur
    await init_db()
    yield
    # Kapanırken temizlik (gerekirse eklenebilir)


app = FastAPI(
    title="Akıllı Belediye API",
    description="Vatandaş şikayet, anket ve yapay zeka analiz platformu",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS - Next.js frontend için
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Router'ları kaydet
app.include_router(auth.router)
app.include_router(complaints.router)
app.include_router(polls.router)
app.include_router(admin.router)


@app.get("/", tags=["health"])
async def root():
    return {
        "status": "ok",
        "message": "Akıllı Belediye API'ye hoş geldiniz!",
        "docs": "/docs",
    }


@app.get("/health", tags=["health"])
async def health():
    return {"status": "healthy"}
