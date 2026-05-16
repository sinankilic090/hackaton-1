"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { loginEDevlet } from "@/lib/api";

export default function LoginPage() {
  const [tckn, setTckn] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (tckn.length !== 11 || !/^\d+$/.test(tckn)) {
      setError("TCKN 11 haneli rakamdan oluşmalıdır.");
      return;
    }
    setLoading(true);
    try {
      const data = await loginEDevlet(tckn, fullName);
      login(data);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Giriş başarısız");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "calc(100vh - 100px)", display: "flex", background: "#f9fafb" }}>
      {/* Left panel — red, Decidim style */}
      <div style={{
        flex: "0 0 420px",
        background: "#E31F26",
        color: "#fff",
        padding: "60px 48px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}>
        <div style={{ fontSize: "3rem", marginBottom: "20px" }}>🏛️</div>
        <h1 style={{ fontSize: "2rem", fontWeight: 900, color: "#fff", marginBottom: "16px", lineHeight: 1.2 }}>
          e-Devlet Entegrasyon Girişi
        </h1>
        <p style={{ opacity: 0.85, lineHeight: 1.7, marginBottom: "36px", fontSize: "1rem" }}>
          TC Kimlik Numaranız ile güvenli giriş yapın. Gerçek kimlik doğrulama
          için e-Devlet altyapısı kullanılmaktadır.
        </p>

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.2)", paddingTop: "28px" }}>
          {[
            "🔒 Güvenli kimlik doğrulama",
            "📋 Şikayet takip sistemi",
            "🗳️ Demokratik katılım araçları",
            "🤖 Yapay zeka destekli analiz",
          ].map((f) => (
            <div key={f} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px", fontSize: "0.9rem", opacity: 0.9 }}>
              <span>{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px" }}>
        <div style={{ width: "100%", maxWidth: "420px" }}>
          <div className="fade-up">
            <div style={{ marginBottom: "8px" }}>
              <div className="section-divider" />
            </div>
            <h2 style={{ fontSize: "1.7rem", fontWeight: 900, marginBottom: "6px" }}>Giriş Yap</h2>
            <p style={{ color: "#6b7280", marginBottom: "32px", fontSize: "0.95rem" }}>
              TC Kimlik bilgilerinizi girin.
            </p>
          </div>

          {/* Demo notice */}
          <div style={{
            background: "#fef3c7",
            border: "1px solid #f59e0b",
            borderLeft: "4px solid #f59e0b",
            borderRadius: "4px",
            padding: "12px 16px",
            marginBottom: "24px",
            fontSize: "0.85rem",
            color: "#92400e",
          }}>
            <strong>🧪 Geliştirme Modu:</strong> Herhangi bir 11 haneli rakam ve isim girebilirsiniz.
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <label style={{ fontSize: "0.875rem", fontWeight: 700, color: "#374151", display: "block", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                TC Kimlik Numarası
              </label>
              <input
                id="tckn-input"
                className="input-field"
                type="text"
                placeholder="12345678901"
                value={tckn}
                onChange={(e) => setTckn(e.target.value.replace(/\D/g, "").slice(0, 11))}
                maxLength={11}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: "0.875rem", fontWeight: 700, color: "#374151", display: "block", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Ad Soyad
              </label>
              <input
                id="fullname-input"
                className="input-field"
                type="text"
                placeholder="Ahmet Yılmaz"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            {error && (
              <div style={{
                background: "#fee2e2",
                border: "1px solid #E31F26",
                borderLeft: "4px solid #E31F26",
                borderRadius: "4px",
                padding: "12px 16px",
                color: "#991b1b",
                fontSize: "0.875rem",
              }}>
                ⚠️ {error}
              </div>
            )}

            <button
              id="login-btn"
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ padding: "14px", fontSize: "1rem", justifyContent: "center" }}
            >
              {loading ? "Giriş Yapılıyor..." : "Giriş Yap →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
