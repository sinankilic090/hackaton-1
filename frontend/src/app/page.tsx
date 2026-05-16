"use client";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) router.push("/dashboard");
  }, [user, isLoading, router]);

  if (isLoading) return null;

  return (
    <div>
      {/* Hero Section — Decidim style: red background, bold typography */}
      <section style={{
        background: "#E31F26",
        color: "#ffffff",
        padding: "80px 0 72px",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorative circles */}
        <div style={{
          position: "absolute", right: "-80px", top: "-80px",
          width: "360px", height: "360px",
          borderRadius: "50%", border: "2px solid rgba(255,255,255,0.1)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", right: "40px", top: "40px",
          width: "200px", height: "200px",
          borderRadius: "50%", border: "2px solid rgba(255,255,255,0.08)",
          pointerEvents: "none",
        }} />

        <div className="container fade-up">
          <div style={{ maxWidth: "700px" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: "4px", padding: "5px 14px",
              fontSize: "0.8rem", fontWeight: 700,
              letterSpacing: "0.06em", textTransform: "uppercase",
              marginBottom: "28px",
            }}>
              🤖 Yapay Zeka Destekli Platform
            </div>

            <h1 style={{ fontSize: "clamp(2.4rem, 5vw, 3.6rem)", fontWeight: 900, marginBottom: "20px", color: "#fff", letterSpacing: "-0.02em" }}>
              Sesinizi Duyurun,<br />Şehrinizi Şekillendirin
            </h1>

            <p style={{ fontSize: "1.15rem", opacity: 0.9, maxWidth: "560px", marginBottom: "40px", lineHeight: 1.7 }}>
              Şikayetlerinizi bildirin, anketlere katılın. Yapay zeka analizleriyle belediyenizin
              hizmet kalitesini birlikte iyileştirelim.
            </p>

            <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
              <Link href="/login">
                <button style={{
                  background: "#fff", color: "#E31F26",
                  border: "2px solid #fff", borderRadius: "4px",
                  padding: "14px 32px", fontWeight: 800,
                  fontSize: "1rem", cursor: "pointer",
                  fontFamily: "inherit", transition: "all 0.18s",
                  display: "flex", alignItems: "center", gap: "8px",
                }}>
                  e-Devlet ile Giriş Yap →
                </button>
              </Link>
              <Link href="/login">
                <button style={{
                  background: "transparent", color: "#fff",
                  border: "2px solid rgba(255,255,255,0.5)", borderRadius: "4px",
                  padding: "14px 32px", fontWeight: 700,
                  fontSize: "1rem", cursor: "pointer",
                  fontFamily: "inherit", transition: "all 0.18s",
                }}>
                  Nasıl Çalışır?
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar — Decidim style */}
      <section style={{ background: "#111111", color: "#fff", padding: "24px 0" }}>
        <div className="container" style={{ display: "flex", gap: "0", justifyContent: "space-around", flexWrap: "wrap" }}>
          {[
            { value: "7/24", label: "Erişim" },
            { value: "5", label: "Hizmet Kategorisi" },
            { value: "AI", label: "Destekli Analiz" },
            { value: "100%", label: "Şeffaf Süreç" },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: "center", padding: "8px 24px" }}>
              <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "#E31F26" }}>{s.value}</div>
              <div style={{ fontSize: "0.82rem", color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: "80px 0", background: "#f9fafb" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "52px" }}>
            <div className="section-divider" style={{ margin: "0 auto 16px" }} />
            <h2 style={{ fontSize: "2rem", fontWeight: 900, marginBottom: "12px" }}>
              Neler Yapabilirsiniz?
            </h2>
            <p style={{ color: "#6b7280", maxWidth: "520px", margin: "0 auto", fontSize: "1.05rem" }}>
              Dijital demokrasi araçlarıyla şehrinizin yönetimine aktif olarak katılın.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "24px" }}>
            {[
              {
                icon: "📢",
                title: "Şikayet Bildirin",
                desc: "Sorunlarınızı kolayca iletin. Her şikayet kayıt altına alınır ve takip edilir.",
                color: "#E31F26",
              },
              {
                icon: "🤖",
                title: "Yapay Zeka Analizi",
                desc: "Google Gemini şikayetleri kategorize eder, aciliyet puanı ve özet üretir.",
                color: "#111111",
              },
              {
                icon: "🗳️",
                title: "Anketlere Katılın",
                desc: "Belediye kararlarına oy vererek doğrudan demokrasiye katkıda bulunun.",
                color: "#E31F26",
              },
              {
                icon: "📊",
                title: "Şeffaf Takip",
                desc: "Şikayetinizin durumunu anlık takip edin, bildirim alın.",
                color: "#111111",
              },
            ].map((f, i) => (
              <div key={f.title} className={`card fade-up-${i + 1}`} style={{ padding: "32px" }}>
                <div style={{
                  width: "52px", height: "52px",
                  background: f.color,
                  borderRadius: "6px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "22px",
                  marginBottom: "18px",
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, marginBottom: "10px" }}>{f.title}</h3>
                <p style={{ color: "#6b7280", lineHeight: 1.65, fontSize: "0.95rem" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ background: "#111111", color: "#fff", padding: "72px 0" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: "2.2rem", fontWeight: 900, color: "#fff", marginBottom: "16px" }}>
            Hemen Başlayın
          </h2>
          <p style={{ color: "#9ca3af", maxWidth: "480px", margin: "0 auto 36px", fontSize: "1.05rem" }}>
            TC Kimlik Numaranızla saniyeler içinde giriş yapın.
          </p>
          <Link href="/login">
            <button className="btn-primary" style={{ padding: "16px 40px", fontSize: "1.05rem" }}>
              e-Devlet ile Giriş Yap →
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: "#1a1a1a", color: "#6b7280", padding: "24px 0", borderTop: "1px solid #333" }}>
        <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", fontSize: "0.82rem" }}>
          <span>© 2026 Akıllı Belediye — Vatandaş Etkileşim Platformu</span>
          <span>Yapay Zeka Destekli · Google Gemini</span>
        </div>
      </footer>
    </div>
  );
}
