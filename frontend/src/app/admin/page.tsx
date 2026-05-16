"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getAdminSummary, getAllComplaints, updateComplaintStatus, getWeeklySummary, createPoll } from "@/lib/api";

const STATUS_MAP: Record<string, { cls: string; icon: string }> = {
  Beklemede:   { cls: "badge-pending",    icon: "⏳" },
  İnceleniyor: { cls: "badge-processing", icon: "🔍" },
  Çözüldü:     { cls: "badge-resolved",   icon: "✅" },
};

export default function AdminPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [summary, setSummary] = useState<any>(null);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [weeklySummary, setWeeklySummary] = useState<string | null>(null);
  const [loadingWeekly, setLoadingWeekly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "complaints" | "polls">("overview");

  // Poll Form
  const [pollTitle, setPollTitle] = useState("");
  const [pollDesc, setPollDesc] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [pollLoading, setPollLoading] = useState(false);
  const [pollSuccess, setPollSuccess] = useState(false);

  useEffect(() => {
    if (!isLoading && (!user || !user.is_admin)) router.push("/dashboard");
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user?.is_admin) {
      Promise.all([getAdminSummary(user.token), getAllComplaints(user.token)])
        .then(([s, c]) => { setSummary(s); setComplaints(c); })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user]);

  const handleStatusChange = async (id: number, status: string) => {
    if (!user) return;
    await updateComplaintStatus(id, status, user.token);
    const updated = await getAllComplaints(user.token);
    setComplaints(updated);
    const s = await getAdminSummary(user.token);
    setSummary(s);
  };

  const fetchWeeklySummary = async () => {
    if (!user) return;
    setLoadingWeekly(true);
    try {
      const data = await getWeeklySummary(user.token);
      setWeeklySummary(data.summary);
    } finally {
      setLoadingWeekly(false);
    }
  };

  const handleCreatePoll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setPollLoading(true);
    try {
      await createPoll(pollTitle, pollDesc, pollOptions.filter(Boolean), user.token);
      setPollTitle(""); setPollDesc(""); setPollOptions(["", ""]); 
      setPollSuccess(true);
      setTimeout(() => setPollSuccess(false), 4000);
    } finally {
      setPollLoading(false);
    }
  };

  if (isLoading || !user?.is_admin) return null;

  const STAT_CARDS = summary ? [
    { label: "Toplam Şikayet", value: summary.total_complaints, color: "#111" },
    { label: "Çözülen", value: summary.resolved_complaints, color: "#059669" },
    { label: "Bekleyen", value: summary.pending_complaints, color: "#d97706" },
    { label: "🔴 Acil Şikayet", value: summary.urgent_complaints, color: "#E31F26" },
    { label: "Aktif Anket", value: summary.active_polls, color: "#2563eb" },
    { label: "Kayıtlı Vatandaş", value: summary.total_users, color: "#111" },
  ] : [];

  return (
    <div style={{ background: "#f9fafb", minHeight: "calc(100vh - 100px)" }}>
      {/* Header */}
      <div style={{ background: "#E31F26", color: "#fff", padding: "40px 0" }}>
        <div className="container">
          <div style={{ display: "inline-block", background: "#fff", color: "#E31F26", padding: "4px 12px", borderRadius: "4px", fontSize: "0.8rem", fontWeight: 800, marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Yetkili Alanı
          </div>
          <h1 style={{ fontSize: "2rem", fontWeight: 900, color: "#fff", marginBottom: "8px", lineHeight: 1.1 }}>Yönetim Paneli</h1>
          <p style={{ color: "#fee2e2", fontSize: "1.05rem", maxWidth: "600px" }}>Şikayetleri yönetin, anketler oluşturun ve şehrinizin verilerini analiz edin.</p>
        </div>
      </div>

      <div className="container" style={{ padding: "40px 24px" }}>
        
        {/* Tab Navigation */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "32px", borderBottom: "2px solid #e5e7eb" }}>
          {[
            { id: "overview", label: "Genel Bakış" },
            { id: "complaints", label: "Şikayet Yönetimi" },
            { id: "polls", label: "Anket Oluştur" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              style={{
                padding: "12px 24px",
                border: "none",
                background: "transparent",
                color: activeTab === tab.id ? "#E31F26" : "#6b7280",
                fontWeight: 800,
                fontSize: "0.95rem",
                cursor: "pointer",
                borderBottom: activeTab === tab.id ? "3px solid #E31F26" : "3px solid transparent",
                marginBottom: "-2px",
                transition: "all 0.15s ease",
                fontFamily: "inherit",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="fade-up">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "40px" }}>
              {STAT_CARDS.map((s) => (
                <div key={s.label} className="card" style={{ padding: "24px", borderTop: `4px solid ${s.color}` }}>
                  <p style={{ color: "#6b7280", fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>{s.label}</p>
                  <p style={{ fontSize: "2.4rem", fontWeight: 900, color: "#111", lineHeight: 1 }}>{loading ? "—" : s.value}</p>
                </div>
              ))}
            </div>

            {/* AI Summary */}
            <div className="card" style={{ padding: "32px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                    <span style={{ fontSize: "1.5rem" }}>🤖</span>
                    <h2 style={{ fontWeight: 900, fontSize: "1.2rem" }}>Haftalık Yapay Zeka Özeti</h2>
                  </div>
                  <p style={{ color: "#6b7280", fontSize: "0.95rem" }}>Google Gemini, bu haftanın tüm şikayetlerini analiz edip 3 maddelik bir özet çıkarır.</p>
                </div>
                <button className="btn-primary" onClick={fetchWeeklySummary} disabled={loadingWeekly}>
                  {loadingWeekly ? "Analiz Ediliyor..." : "Rapor Oluştur"}
                </button>
              </div>

              {weeklySummary ? (
                <div style={{ background: "#f3f4f6", borderLeft: "4px solid #111", padding: "24px", borderRadius: "0 4px 4px 0", color: "#111", lineHeight: 1.8, fontSize: "1.05rem", fontWeight: 600 }}>
                  <div style={{ whiteSpace: "pre-line" }}>{weeklySummary}</div>
                </div>
              ) : (
                <div style={{ background: "#f9fafb", border: "2px dashed #e5e7eb", padding: "40px", textAlign: "center", color: "#9ca3af", borderRadius: "6px" }}>
                  <p style={{ fontWeight: 600 }}>Özet oluşturmak için yukarıdaki butona tıklayın.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Complaints Tab */}
        {activeTab === "complaints" && (
          <div className="fade-up">
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {loading ? <p style={{ color: "#6b7280" }}>Yükleniyor...</p> : 
               complaints.length === 0 ? <p style={{ color: "#6b7280" }}>Henüz şikayet yok.</p> : 
               complaints.map((c) => {
                const sc = STATUS_MAP[c.status] || STATUS_MAP["Beklemede"];
                return (
                  <div key={c.id} className="card" style={{ padding: "24px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "24px", flexWrap: "wrap" }}>
                      
                      <div style={{ flex: 1, minWidth: "300px" }}>
                        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "12px", alignItems: "center" }}>
                          <span className={`badge ${sc.cls}`}>{sc.icon} {c.status}</span>
                          {c.gemini_category && (
                            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#111", background: "#e5e7eb", padding: "4px 10px", borderRadius: "4px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                              {c.gemini_category}
                            </span>
                          )}
                          {c.gemini_urgency >= 7 && (
                            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#E31F26", background: "#fee2e2", padding: "4px 10px", borderRadius: "4px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                              Acil ({c.gemini_urgency}/10)
                            </span>
                          )}
                        </div>
                        
                        <p style={{ color: "#111", fontSize: "1rem", lineHeight: 1.6, marginBottom: c.gemini_summary ? "16px" : "12px" }}>
                          {c.description}
                        </p>
                        
                        {c.gemini_summary && (
                          <div style={{ background: "#f9fafb", padding: "12px 16px", borderLeft: "3px solid #E31F26", marginBottom: "16px" }}>
                            <p style={{ fontSize: "0.85rem", color: "#E31F26", fontWeight: 800, marginBottom: "4px", textTransform: "uppercase" }}>AI Özeti</p>
                            <p style={{ fontSize: "0.9rem", color: "#374151" }}>{c.gemini_summary}</p>
                          </div>
                        )}
                        
                        <div style={{ fontSize: "0.8rem", color: "#6b7280", fontWeight: 600 }}>
                          Gönderen: {c.owner?.full_name || "Bilinmeyen"} — #{c.id}
                        </div>
                      </div>

                      {/* Status Actions */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: "160px", background: "#f9fafb", padding: "16px", borderRadius: "6px", border: "1px solid #e5e7eb" }}>
                        <p style={{ fontSize: "0.75rem", fontWeight: 800, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "4px" }}>Durum Güncelle</p>
                        {["Beklemede", "İnceleniyor", "Çözüldü"].map((status) => {
                          const isActive = c.status === status;
                          return (
                            <button
                              key={status}
                              onClick={() => handleStatusChange(c.id, status)}
                              style={{
                                padding: "8px 12px",
                                background: isActive ? "#111" : "#fff",
                                color: isActive ? "#fff" : "#374151",
                                border: `1px solid ${isActive ? "#111" : "#d1d5db"}`,
                                borderRadius: "4px",
                                fontSize: "0.85rem",
                                fontWeight: 700,
                                cursor: isActive ? "default" : "pointer",
                                textAlign: "left",
                                fontFamily: "inherit",
                                transition: "all 0.1s"
                              }}
                            >
                              {status === "Beklemede" ? "⏳" : status === "İnceleniyor" ? "🔍" : "✅"} {status}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Create Poll Tab */}
        {activeTab === "polls" && (
          <div className="fade-up" style={{ maxWidth: "700px" }}>
            <div className="card" style={{ padding: "40px" }}>
              <div style={{ marginBottom: "28px" }}>
                <h2 style={{ fontWeight: 900, fontSize: "1.4rem", marginBottom: "8px" }}>Yeni Oylama Başlat</h2>
                <p style={{ color: "#6b7280", fontSize: "0.95rem" }}>Vatandaşların katılımı için yeni bir anket oluşturun.</p>
              </div>
              
              {pollSuccess && (
                <div style={{ background: "#d1fae5", border: "1px solid #059669", borderLeft: "4px solid #059669", padding: "16px", color: "#065f46", marginBottom: "24px", fontWeight: 700, borderRadius: "4px" }}>
                  ✅ Anket başarıyla yayınlandı!
                </div>
              )}

              <form onSubmit={handleCreatePoll} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                <div>
                  <label style={{ fontSize: "0.875rem", fontWeight: 800, color: "#111", display: "block", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Anket Başlığı *</label>
                  <input className="input-field" value={pollTitle} onChange={(e) => setPollTitle(e.target.value)} placeholder="Örn: Yeni meydanın konsepti ne olsun?" required />
                </div>
                <div>
                  <label style={{ fontSize: "0.875rem", fontWeight: 800, color: "#111", display: "block", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Açıklama (opsiyonel)</label>
                  <textarea className="input-field" value={pollDesc} onChange={(e) => setPollDesc(e.target.value)} placeholder="Anket hakkında ek bilgi..." style={{ minHeight: "80px" }} />
                </div>
                
                <div style={{ background: "#f9fafb", padding: "20px", borderRadius: "6px", border: "1px solid #e5e7eb" }}>
                  <label style={{ fontSize: "0.875rem", fontWeight: 800, color: "#111", display: "block", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Seçenekler</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {pollOptions.map((opt, i) => (
                      <div key={i} style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                        <span style={{ fontWeight: 800, color: "#9ca3af", width: "20px" }}>{i+1}.</span>
                        <input
                          className="input-field"
                          value={opt}
                          onChange={(e) => {
                            const updated = [...pollOptions];
                            updated[i] = e.target.value;
                            setPollOptions(updated);
                          }}
                          placeholder={`Seçenek ${i + 1}`}
                          required={i < 2}
                        />
                        {i >= 2 && (
                          <button type="button" onClick={() => setPollOptions(pollOptions.filter((_, j) => j !== i))} style={{ background: "none", border: "none", color: "#E31F26", fontSize: "1.2rem", cursor: "pointer", padding: "4px" }}>✕</button>
                        )}
                      </div>
                    ))}
                  </div>
                  {pollOptions.length < 6 && (
                    <button type="button" className="btn-ghost" style={{ marginTop: "16px" }} onClick={() => setPollOptions([...pollOptions, ""])}>
                      + Seçenek Ekle
                    </button>
                  )}
                </div>

                <div style={{ paddingTop: "12px", borderTop: "1px solid #e5e7eb" }}>
                  <button type="submit" className="btn-primary" disabled={pollLoading} style={{ padding: "16px", fontSize: "1.05rem", width: "100%", justifyContent: "center" }}>
                    {pollLoading ? "Oluşturuluyor..." : "Anketi Yayınla"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
