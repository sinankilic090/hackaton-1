AKILLI BELEDİYE - VATANDAŞ ETKİLEŞİM PLATFORMU
Teknik Gereksinim ve Sistem Mimarisi Dokümanı (Güncel Tech Stack)

1. Proje Özeti
Vatandaşların e-Devlet altyapısı ile güvenli giriş yapıp şikayet, yorum ve oylamalara katılabildiği platform. Arka planda Google Gemini kullanılarak gelen veriler analiz edilir ve belediye yetkililerine Next.js ile hazırlanmış basit, anlaşılır bir dashboard üzerinden sunulur.

2. Teknoloji Yığını (Tech Stack)
Backend (API & İş Mantığı): Python (FastAPI önerilir; asenkron yapısı sayesinde Gemini API çağrılarında bekleme süresini optimize eder. Alternatif olarak Flask da kullanılabilir).

Frontend (Vatandaş & Admin Paneli): Next.js (React) + Tailwind CSS.

Strateji: Karmaşık mobil uygulama süreçlerine (App Store vb.) girmeden, Next.js uygulamasını mobil uyumlu (Responsive/PWA) yaparak vatandaşların tarayıcıdan hızlıca erişmesini sağlarız. Admin paneli de /admin rotası altında çalışır.

Yapay Zeka (LLM): Google Gemini (Python google-generativeai SDK'sı üzerinden).

Veri Tabanı: PostgreSQL (Python tarafında SQLAlchemy ORM veya doğrudan asyncpg kullanılarak yönetilecek).

3. Sistem Mimarisi ve Veri Akışı
İstemci (Next.js): Vatandaş şikayetini/yorumunu yazar.

Backend (Python): Veriyi alır, önce PostgreSQL'e "işleniyor" statüsüyle kaydeder.

AI Entegrasyonu (Gemini): Python, arka plan görevi (Background Task) olarak metni Gemini API'sine yollar. "Bu metnin aciliyeti nedir, kategorisi nedir, duygu durumu nasıldır?" şeklinde JSON formatında yanıt ister.

Güncelleme: Gemini'den dönen JSON yanıtı ayrıştırılır, PostgreSQL'deki ilgili şikayet/yorum kaydı güncellenir.

Admin Paneli: Next.js, Python üzerinden veritabanındaki Gemini analizlerini çekip grafiklere ve listelere döker.

4. Modül 1: Kimlik Doğrulama (e-Devlet)
Python Backend: /api/auth/edevlet endpoint'i. (Geliştirme aşamasında mock/sahte bir e-Devlet giriş ekranı simüle edilir).

TCKN, Ad, Soyad alınarak veritabanında kullanıcı oluşturulur ve Next.js tarafına bir JWT (JSON Web Token) dönülür.

Kullanıcı rolleri is_admin: true/false olarak PostgreSQL'de tutulur.

5. Modül 2: Arka Plan Yapay Zeka (Google Gemini) Modülü
FastAPI içinde arka planda çalışacak Gemini fonksiyonunun görevleri:

Sınıflandırma Promptu: Gelen vatandaş şikayetini şu kategorilerden birine ata: [Fen İşleri, Park ve Bahçeler, Temizlik, Zabıta, Su ve Kanalizasyon]. Sadece kategori adını dön.

Aciliyet Analizi Promptu: Metni analiz et ve aciliyet skorunu (1-10) ve aciliyet nedenini JSON olarak dön.

Özetleme (Admin için): Admin panelinde "Bu haftanın özeti" istendiğinde, Python o haftanın verilerini toplayıp Gemini'ye yollar ve "Belediye başkanı için bu verileri 3 maddede özetle" komutunu çalıştırır.

6. Modül 3: Next.js Frontend (Basit & Fonksiyonel)
Vatandaş Ekranları (/app/...):

Ana Sayfa (Aktif anketler ve duyurular).

Şikayet Oluştur (Basit bir form: Metin alanı, opsiyonel konum, Gönder butonu).

Durum Takibi (Geçmiş şikayetlerin listesi ve belediyenin/Gemini'nin atadığı durum).

Admin Dashboard (/app/admin/...):

Özet Ekranı: Toplam şikayet sayısı, çözülenler, Gemini tarafından tespit edilen "Kırmızı Alarm / Acil" şikayetler.

Şikayet Yönetimi: Gelen şikayeti okuma, Gemini'nin analizini görme ve duruma "Çözüldü" atama.

7. Veri Tabanı Şeması (Tablolar ve Alanlar)

Tablo 1: Kullanıcılar (Users)
Sisteme giriş yapan vatandaşları ve belediye yetkililerini tutar.

ID: Kullanıcının sistemdeki benzersiz kimlik numarası.

TCKN: Vatandaşın TC Kimlik Numarası (Sistemde benzersiz olmalı).

Ad Soyad: Kullanıcının tam adı.

Yönetici Mi?: Bu hesabın belediye yetkilisi olup olmadığını belirten doğru/yanlış değeri.

Kayıt Tarihi: Sisteme ilk giriş zamanı.

Tablo 2: Şikayetler (Complaints)
Vatandaşların taleplerini ve arka planda Gemini'nin ürettiği analiz verilerini aynı yerde tutar.

ID: Şikayetin benzersiz numarası.

Kullanıcı ID: Şikayeti oluşturan vatandaşın numarası (Kullanıcılar tablosuna bağlı).

Açıklama: Vatandaşın yazdığı orijinal şikayet metni.

Durum: Şikayetin aşaması (Örn: Beklemede, İnceleniyor, Çözüldü).

Gemini Kategorisi: Yapay zekanın şikayeti yönlendirdiği birim (Örn: Fen İşleri, Park ve Bahçeler).

Gemini Duygu Durumu: Yapay zekanın tespit ettiği ton (Pozitif, Negatif, Nötr).

Gemini Aciliyet Skoru: Yapay zekanın belirlediği 1 ile 10 arasındaki öncelik puanı.

Gemini Özeti: Yapay zekanın uzun mesajlardan çıkardığı tek cümlelik özet.

Oluşturulma Tarihi: Şikayetin sisteme girildiği tarih.

Tablo 3: Anketler (Polls)
Belediyenin vatandaşlar için oluşturduğu oylamaları tutar.

ID: Anketin benzersiz numarası.

Başlık: Anketin ana sorusu (Örn: Yeni meydanın konsepti ne olsun?).

Açıklama: Anketin detayları.

Aktif Mi?: Oylamanın hala açık olup olmadığını belirten doğru/yanlış değeri.

Tablo 4: Oylar (Votes)
Vatandaşların anketlere verdiği cevapları tutar.

ID: Verilen oyun benzersiz numarası.

Anket ID: Hangi ankete oy verildiği (Anketler tablosuna bağlı).

Kullanıcı ID: Oyu hangi vatandaşın verdiği (Kullanıcılar tablosuna bağlı).

Seçim: Vatandaşın ankette işaretlediği şık.

Kural: Aynı Anket ID ve Kullanıcı ID eşleşmesi sistemde sadece bir kez bulunabilir (Bir vatandaş bir ankete sadece bir defa oy kullanabilir).