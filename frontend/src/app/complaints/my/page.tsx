"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getMyComplaints } from "@/lib/api";
import Link from "next/link";

const STATUS_MAP: Record<string, { label: string; cls: string; icon: string }> = {
  Beklemede:   { label: "Beklemede",   cls: "badge-pending",    icon: "⏳" },
  İnceleniyor: { label: "İnceleniyor", cls: "badge-processing", icon: "🔍" },
  Çözüldü:     { label: "Çözüldü",     cls: "badge-resolved",   icon: "✅" },
};

export default function MyComplaintsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Tümü");

  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user) {
      getMyComplaints(user.token)
        .then(setComplaints)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (isLoading || !user) return null;

  const filtered = filter === "Tümü" ? complaints : complaints.filter((c) => c.status === filter);

  return (
    <div style={{ background: "#f9fafb", minHeight: "calc(100vh - 100px)" }}>
      {/* Page header */}
      <div style={{ background: "#111111", color: "#fff", padding: "36px 0" }}>
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <h1 style={{ fontSize: "1.7rem", fontWeight: 900, color: "#fff", marginBottom: "4px" }}>Şikayetlerim</h1>
              <p style={{ color: "#9ca3af", fontSize: "0.95rem" }}>Tüm bildirimlerinizi ve süreçlerini takip edin.</p>
            </div>
            <Link href="/complaints/new">
              <button className="btn-primary" style={{ padding: "12px 26px" }}>+ Yeni Şikayet</button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: "40px 24px", maxWidth: "900px", margin: "0 auto" }}>
        
        {/* Filters */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "32px", overflowX: "auto", paddingBottom: "8px" }}>
          {["Tümü", "Beklemede", "İnceleniyor", "Çözüldü"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "8px 20px",
                borderRadius: "4px",
                border: "2px solid",
                borderColor: filter === f ? "#E31F26" : "#e5e7eb",
                background: filter === f ? "#E31F26" : "#fff",
                color: filter === f ? "#fff" : "#374151",
                fontSize: "0.875rem",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.15s ease",
                whiteSpace: "nowrap",
                fontFamily: "inherit",
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Complaints List */}
        {loading ? (
          <p style={{ color: "#6b7280" }}>Yükleniyor...</p>
        ) : filtered.length === 0 ? (
          <div className="card" style={{ padding: "60px 24px", textAlign: "center" }}>
            <p style={{ fontSize: "3rem", marginBottom: "16px" }}>📋</p>
            <p style={{ color: "#6b7280", marginBottom: "20px", fontSize: "1.05rem" }}>Bu kategoride şikayet bulunamadı.</p>
            <Link href="/complaints/new">
              <button className="btn-primary">Şikayet Oluştur</button>
            </Link>
          </div>
        ) : (
          <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {filtered.map((c) => {
              const sc = STATUS_MAP[c.status] || STATUS_MAP["Beklemede"];
              return (
                <div key={c.id} className="card" style={{ padding: "24px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                      <span className={`badge ${sc.cls}`}>{sc.icon} {sc.label}</span>
                      {c.gemini_category && (
                        <span style={{ 
                          fontSize: "0.75rem", fontWeight: 700, color: "#E31F26", 
                          background: "#fee2e2", padding: "4px 10px", borderRadius: "4px",
                          textTransform: "uppercase", letterSpacing: "0.04em"
                        }}>
                          🏷️ {c.gemini_category}
                        </span>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                      {c.gemini_urgency && (
                        <span style={{ fontSize: "0.85rem", fontWeight: 700, color: c.gemini_urgency >= 7 ? "#E31F26" : "#6b7280" }}>
                          {c.gemini_urgency >= 7 ? "🔴" : "🟡"} Aciliyet: {c.gemini_urgency}/10
                        </span>
                      )}
                      <span style={{ fontSize: "0.8rem", color: "#9ca3af", fontWeight: 600 }}>#{c.id}</span>
                    </div>
                  </div>

                  <p style={{ color: "#111", marginBottom: "16px", lineHeight: 1.6, fontSize: "0.95rem" }}>
                    {c.description}
                  </p>

                  {/* AI Summary Block */}
                  {c.gemini_summary && c.gemini_summary !== c.description && (
                    <div style={{ 
                      background: "#f9fafb", 
                      borderLeft: "4px solid #111111", 
                      padding: "16px 20px", 
                      marginBottom: "16px",
                      borderRadius: "0 4px 4px 0"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                        <span style={{ fontSize: "1.1rem" }}>🤖</span>
                        <p style={{ fontSize: "0.85rem", color: "#111", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.04em" }}>Yapay Zeka Özeti</p>
                      </div>
                      <p style={{ fontSize: "0.9rem", color: "#374151", lineHeight: 1.5 }}>{c.gemini_summary}</p>
                    </div>
                  )}

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #e5e7eb", paddingTop: "16px", marginTop: "8px" }}>
                    {c.gemini_sentiment ? (
                      <p style={{ fontSize: "0.8rem", color: "#6b7280", fontWeight: 600 }}>
                        Duygu Durumu: <span style={{ 
                          color: c.gemini_sentiment === "Negatif" ? "#E31F26" : c.gemini_sentiment === "Pozitif" ? "#059669" : "#6b7280" 
                        }}>{c.gemini_sentiment}</span>
                      </p>
                    ) : <span />}
                    <span style={{ fontSize: "0.8rem", color: "#9ca3af" }}>
                      Tarih: {new Date(c.created_at).toLocaleDateString("tr-TR")}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
