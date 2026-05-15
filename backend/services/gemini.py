import os
import json
import logging
from typing import Optional
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel("gemini-1.5-flash")
else:
    model = None
    logger.warning("GEMINI_API_KEY bulunamadı. AI analizi devre dışı.")

CATEGORIES = ["Fen İşleri", "Park ve Bahçeler", "Temizlik", "Zabıta", "Su ve Kanalizasyon"]


async def analyze_complaint(description: str) -> dict:
    """
    Vatandaş şikayetini Gemini ile analiz eder.
    Kategori, duygu durumu, aciliyet skoru ve özet döndürür.
    """
    if model is None:
        return {
            "category": "Fen İşleri",
            "sentiment": "Nötr",
            "urgency": 5.0,
            "summary": description[:100] + "..." if len(description) > 100 else description,
        }

    prompt = f"""
Sen bir belediye şikayet analiz sistemisin. Aşağıdaki vatandaş şikayetini analiz et ve SADECE JSON formatında yanıt ver.

Şikayet: "{description}"

Yapman gerekenler:
1. Şikayeti şu kategorilerden birine ata: {CATEGORIES}
2. Metnin duygu durumunu belirle: Pozitif, Negatif veya Nötr
3. Aciliyetini 1-10 arasında puan ver (10 en acil)
4. Tek cümlelik bir Türkçe özet yaz

SADECE şu formatta JSON döndür, başka hiçbir şey yazma:
{{
  "category": "kategori adı",
  "sentiment": "Pozitif|Negatif|Nötr",
  "urgency": 7.5,
  "summary": "tek cümlelik özet"
}}
"""

    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
        # Markdown kod bloğu varsa temizle
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        result = json.loads(text.strip())
        return {
            "category": result.get("category", "Fen İşleri"),
            "sentiment": result.get("sentiment", "Nötr"),
            "urgency": float(result.get("urgency", 5.0)),
            "summary": result.get("summary", description[:100]),
        }
    except Exception as e:
        logger.error(f"Gemini analiz hatası: {e}")
        return {
            "category": "Fen İşleri",
            "sentiment": "Nötr",
            "urgency": 5.0,
            "summary": description[:100] + "..." if len(description) > 100 else description,
        }


async def generate_weekly_summary(complaints_text: str) -> Optional[str]:
    """
    Admin için haftalık özet üretir.
    """
    if model is None:
        return "Gemini API bağlantısı yok. Lütfen API anahtarınızı ayarlayın."

    prompt = f"""
Sen bir belediye başkanı asistanısın. Aşağıda bu haftanın vatandaş şikayetleri var.
Belediye başkanı için bu verileri 3 maddede özetle. Türkçe yaz, kısa ve net ol.

Şikayet verileri:
{complaints_text}

Format:
1. [Birinci madde]
2. [İkinci madde]  
3. [Üçüncü madde]
"""

    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        logger.error(f"Gemini haftalık özet hatası: {e}")
        return "Özet oluşturulamadı."
