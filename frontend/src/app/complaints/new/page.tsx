"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { createComplaint } from "@/lib/api";

export default function NewComplaintPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return router.push("/login");
    setError("");
    setLoading(true);
    try {
      await createComplaint(description, user.token);
      router.push("/complaints/my");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const charCount = description.length;

  return (
    <div style={{ background: "#f9fafb", minHeight: "calc(100vh - 100px)" }}>
      {/* Page header */}
      <div style={{ background: "#111111", color: "#fff", padding: "36px 0" }}>
        <div className="container">
          <h1 style={{ fontSize: "1.7rem", fontWeight: 900, color: "#fff", marginBottom: "4px" }}>Şikayet Oluştur</h1>
          <p style={{ color: "#9ca3af", fontSize: "0.95rem" }}>Sorununuzu detaylıca açıklayın. Yapay zeka sisteminizi analiz edecektir.</p>
        </div>
      </div>

      <div className="container" style={{ padding: "40px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "32px", maxWidth: "900px" }}>
          {/* Form */}
          <div>
            <div className="card" style={{ padding: "36px" }}>
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
                <div>
                  <label style={{ fontSize: "0.875rem", fontWeight: 700, color: "#374151", display: "block", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    Şikayet Açıklaması *
                  </label>
                  <textarea
                    id="complaint-textarea"
                    className="input-field"
                    placeholder="Örn: Mahallemizin 3. sokağındaki yolda büyük çukurlar var, araçlar zarar görüyor ve trafik tehlikesi oluşturuyor..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={{ minHeight: "180px" }}
                    required
                  />
                  <div style={{
                    display: "flex", justifyContent: "space-between",
                    marginTop: "6px", fontSize: "0.8rem",
                    color: charCount < 10 ? "#E31F26" : "#6b7280",
                  }}>
                    <span>{charCount < 10 ? `En az 10 karakter gerekli (${10 - charCount} daha)` : "✓ Geçerli uzunluk"}</span>
                    <span>{charCount} / 2000</span>
                  </div>
                </div>

                {error && (
                  <div style={{
                    background: "#fee2e2", border: "1px solid #E31F26",
                    borderLeft: "4px solid #E31F26", borderRadius: "4px",
                    padding: "12px 16px", color: "#991b1b", fontSize: "0.875rem",
                  }}>
                    ⚠️ {error}
                  </div>
                )}

                <div style={{ display: "flex", gap: "12px" }}>
                  <button
                    id="submit-complaint-btn"
                    type="submit"
                    className="btn-primary"
                    disabled={loading || charCount < 10}
                    style={{ padding: "13px 28px", fontSize: "0.95rem", flex: 1, justifyContent: "center" }}
                  >
                    {loading ? "Gönderiliyor..." : "📤 Şikayeti Gönder"}
                  </button>
                  <button type="button" className="btn-ghost" onClick={() => router.back()} style={{ padding: "13px 20px" }}>
                    İptal
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Info sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            {/* AI info */}
            <div style={{ background: "#111111", color: "#fff", borderRadius: "6px", padding: "24px" }}>
              <div style={{ fontSize: "1.8rem", marginBottom: "12px" }}>🤖</div>
              <h3 style={{ fontWeight: 800, fontSize: "1rem", color: "#fff", marginBottom: "10px" }}>Yapay Zeka Analizi</h3>
              <p style={{ color: "#9ca3af", fontSize: "0.875rem", lineHeight: 1.65 }}>
                Şikayetiniz gönderilir gönderilmez <strong style={{ color: "#E31F26" }}>Google Gemini</strong> arka planda analiz yapacak:
              </p>
              <ul style={{ marginTop: "12px", paddingLeft: "0", listStyle: "none", display: "flex", flexDirection: "column", gap: "8px" }}>
                {["🏷️ Kategori belirleme", "🔴 Aciliyet skoru (1-10)", "💬 Duygu analizi", "📝 Tek cümle özet"].map(f => (
                  <li key={f} style={{ color: "#9ca3af", fontSize: "0.82rem" }}>{f}</li>
                ))}
              </ul>
            </div>

            {/* Tips */}
            <div className="card" style={{ padding: "20px" }}>
              <h3 style={{ fontWeight: 800, fontSize: "0.95rem", marginBottom: "12px" }}>💡 İyi Şikayet Nasıl Yazılır?</h3>
              <ul style={{ paddingLeft: "0", listStyle: "none", display: "flex", flexDirection: "column", gap: "8px" }}>
                {[
                  "Yer bilgisi ekleyin (sokak, mahalle)",
                  "Ne zaman fark ettiğinizi belirtin",
                  "Sorunu net ve anlaşılır tanımlayın",
                  "Varsa fotoğraf linkini paylaşın",
                ].map(t => (
                  <li key={t} style={{ fontSize: "0.82rem", color: "#6b7280", display: "flex", gap: "6px" }}>
                    <span style={{ color: "#E31F26", fontWeight: 700 }}>→</span> {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
