# Akıllı Belediye - Vatandaş Etkileşim Platformu

> Yapay zeka destekli modern belediyecilik platformu

---

## 🚀 Hızlı Başlangıç (Git Bash / WSL)

> ⚠️ Tüm komutlar **Git Bash** terminalinde çalıştırılmalıdır. Her adımı sırayla uygulayın.

---

### Adım 1 — PostgreSQL Veritabanı Oluştur

PostgreSQL'i PATH'e eklemek için önce bu komutu çalıştırın (Git Bash'te):

```bash
export PATH="/c/Program Files/PostgreSQL/17/bin:$PATH"
```

> 💡 Sürüm numarasını kontrol edin: `ls "/c/Program Files/PostgreSQL/"` — çıkan klasör adına göre `17` yerine kendi sürümünüzü yazın.

Ardından veritabanını oluşturun:

```bash
psql -U postgres -c "CREATE DATABASE belediye_db;"
```

> Şifre sorulursa PostgreSQL kurulumunda belirlediğiniz şifreyi girin.

---

### Adım 2 — Backend Kurulumu

```bash
cd backend
pip install -r requirements.txt
```

---

### Adım 3 — `.env` Dosyasını Oluştur

```bash
cp .env.example .env
```

Düzenlemek için:

```bash
notepad .env
```

`.env` içeriği (kendi değerlerinizi girin):

```
DATABASE_URL=postgresql+asyncpg://postgres:ŞIFRENIZ@localhost:5432/belediye_db
SECRET_KEY=gizli-bir-anahtar-buraya-yazin
GEMINI_API_KEY=AIza...
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

> 💡 Gemini API anahtarı → https://aistudio.google.com/app/apikey  
> Gemini olmadan da çalışır, AI analizi fallback değer döndürür.

---

### Adım 4 — Backend'i Başlat

```bash
uvicorn main:app --reload --port 8000
```

✅ Başarılıysa → **http://localhost:8000/docs**

---

### Adım 5 — Frontend (Yeni Terminal Sekmesi)

```bash
cd frontend
npm run dev
```

✅ Başarılıysa → **http://localhost:3000**

---

## 🔑 İlk Giriş

Sisteme **ilk giriş yapan kullanıcı otomatik olarak admin** olur.

- **TCKN**: Herhangi 11 haneli rakam (örn: `12345678901`)
- **Ad Soyad**: Herhangi bir isim (örn: `Admin Kullanıcı`)

---

## 📋 Özellikler

| Modül | Özellikler |
|-------|-----------|
| 🔐 e-Devlet Girişi | Mock TCKN girişi, JWT token, admin rolü |
| 📢 Şikayet | Form, durum takibi, AI analizi |
| 🤖 Gemini AI | Kategori, aciliyet (1-10), duygu durumu, özet |
| 🗳️ Anketler | Oy kullan, sonuçları gör, çift oy engeli |
| ⚡ Admin | Dashboard, şikayet yönetimi, haftalık AI özeti, anket oluştur |

---

## 🏗️ Proje Yapısı

```
├── backend/
│   ├── main.py              # FastAPI uygulaması
│   ├── models.py            # SQLAlchemy ORM modelleri
│   ├── schemas.py           # Pydantic şemaları
│   ├── database.py          # DB bağlantısı
│   ├── auth.py              # JWT yardımcıları
│   ├── dependencies.py      # Auth guard'ları
│   ├── routers/
│   │   ├── auth.py          # /api/auth/edevlet
│   │   ├── complaints.py    # /api/complaints/
│   │   ├── polls.py         # /api/polls/
│   │   └── admin.py         # /api/admin/
│   └── services/
│       └── gemini.py        # Google Gemini entegrasyonu
└── frontend/
    └── src/
        ├── app/
        │   ├── page.tsx           # Landing
        │   ├── login/page.tsx     # e-Devlet giriş
        │   ├── dashboard/page.tsx # Ana panel
        │   ├── complaints/        # Şikayet sayfaları
        │   ├── polls/page.tsx     # Anketler
        │   └── admin/page.tsx     # Yönetim paneli
        ├── components/Navbar.tsx
        ├── context/AuthContext.tsx
        └── lib/api.ts             # API istemcisi
```

---

## ❓ Sık Karşılaşılan Sorunlar

**`psql` bulunamıyorsa sürümü kontrol edin:**
```bash
ls "/c/Program Files/PostgreSQL/"
# Çıkan sürüm numarasını export satırında kullanın (14, 15, 16, 17...)
export PATH="/c/Program Files/PostgreSQL/17/bin:$PATH"
```

**`pip` bulunamadıysa:**
```bash
python -m pip install -r requirements.txt
```

**Port 8000 kullanımdaysa:**
```bash
uvicorn main:app --reload --port 8001
```
Sonra `frontend/.env.local` dosyasında:
```
NEXT_PUBLIC_API_URL=http://localhost:8001
```

**PostgreSQL bağlantı hatası:**
`.env` dosyasındaki `ŞIFRENIZ` kısmını PostgreSQL kurulum şifrenizle değiştirin.
