"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getMyComplaints, getPolls } from "@/lib/api";
import Link from "next/link";

const STATUS_CONFIG: Record<string, { label: string; cls: string; icon: string }> = {
  Beklemede:   { label: "Beklemede",   cls: "badge-pending",    icon: "⏳" },
  İnceleniyor: { label: "İnceleniyor", cls: "badge-processing", icon: "🔍" },
  Çözüldü:     { label: "Çözüldü",     cls: "badge-resolved",   icon: "✅" },
};

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [polls, setPolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user) {
      Promise.all([getMyComplaints(user.token), getPolls(user.token)])
        .then(([c, p]) => { setComplaints(c); setPolls(p); })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (isLoading || !user) return null;

  const stats = [
    { label: "Toplam Şikayet", value: complaints.length, icon: "📋", border: "#E31F26" },
    { label: "Çözülen", value: complaints.filter(c => c.status === "Çözüldü").length, icon: "✅", border: "#059669" },
    { label: "Bekleyen", value: complaints.filter(c => c.status === "Beklemede").length, icon: "⏳", border: "#d97706" },
    { label: "Aktif Anket", value: polls.filter(p => p.is_active).length, icon: "🗳️", border: "#2563eb" },
  ];

  return (
    <div style={{ background: "#f9fafb", minHeight: "calc(100vh - 100px)" }}>
      {/* Page header */}
      <div style={{ background: "#111111", color: "#fff", padding: "36px 0" }}>
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <h1 style={{ fontSize: "1.7rem", fontWeight: 900, color: "#fff", marginBottom: "4px" }}>
                Hoş Geldiniz, {user.full_name.split(" ")[0]}
              </h1>
              <p style={{ color: "#9ca3af", fontSize: "0.95rem" }}>Şikayet ve katılım geçmişinizi buradan takip edebilirsiniz.</p>
            </div>
            <Link href="/complaints/new">
              <button className="btn-primary" style={{ padding: "12px 26px" }}>+ Şikayet Oluştur</button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: "36px 24px" }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "18px", marginBottom: "40px" }}>
          {stats.map((s) => (
            <div key={s.label} className="card" style={{ padding: "24px", borderLeft: `4px solid ${s.border}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ color: "#6b7280", fontSize: "0.82rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>{s.label}</p>
                  <p style={{ fontSize: "2.2rem", fontWeight: 900, color: "#111", lineHeight: 1 }}>{loading ? "—" : s.value}</p>
                </div>
                <span style={{ fontSize: "2rem" }}>{s.icon}</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "28px" }}>
          {/* Recent Complaints */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div>
                <div className="section-divider" style={{ marginBottom: "8px" }} />
                <h2 style={{ fontSize: "1.1rem", fontWeight: 800 }}>Son Şikayetler</h2>
              </div>
              <Link href="/complaints/my" className="link-red" style={{ fontSize: "0.875rem" }}>Tümünü gör →</Link>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {loading ? (
                <p style={{ color: "#6b7280" }}>Yükleniyor...</p>
              ) : complaints.length === 0 ? (
                <div className="card" style={{ padding: "36px", textAlign: "center" }}>
                  <p style={{ fontSize: "2.5rem", marginBottom: "12px" }}>📋</p>
                  <p style={{ color: "#6b7280", marginBottom: "20px" }}>Henüz şikayetiniz yok.</p>
                  <Link href="/complaints/new"><button className="btn-primary">İlk Şikayeti Oluştur</button></Link>
                </div>
              ) : (
                complaints.slice(0, 4).map((c) => {
                  const sc = STATUS_CONFIG[c.status] || STATUS_CONFIG["Beklemede"];
                  return (
                    <div key={c.id} className="card" style={{ padding: "18px 20px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", flexWrap: "wrap", gap: "6px" }}>
                        <span className={`badge ${sc.cls}`}>{sc.icon} {sc.label}</span>
                        {c.gemini_urgency >= 7 && (
                          <span style={{ fontSize: "0.75rem", color: "#E31F26", fontWeight: 700 }}>🔴 Acil ({c.gemini_urgency}/10)</span>
                        )}
                      </div>
                      <p style={{ fontSize: "0.875rem", color: "#374151", lineHeight: 1.6 }}>
                        {c.gemini_summary || c.description.slice(0, 90) + "..."}
                      </p>
                      {c.gemini_category && (
                        <p style={{ fontSize: "0.75rem", color: "#E31F26", fontWeight: 700, marginTop: "8px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                          🏷️ {c.gemini_category}
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Active Polls */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div>
                <div className="section-divider" style={{ marginBottom: "8px" }} />
                <h2 style={{ fontSize: "1.1rem", fontWeight: 800 }}>Aktif Anketler</h2>
              </div>
              <Link href="/polls" className="link-red" style={{ fontSize: "0.875rem" }}>Tümünü gör →</Link>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {loading ? (
                <p style={{ color: "#6b7280" }}>Yükleniyor...</p>
              ) : polls.filter(p => p.is_active).length === 0 ? (
                <div className="card" style={{ padding: "36px", textAlign: "center" }}>
                  <p style={{ color: "#6b7280" }}>Aktif anket bulunmuyor.</p>
                </div>
              ) : (
                polls.filter(p => p.is_active).slice(0, 3).map((p) => (
                  <div key={p.id} className="card" style={{ padding: "18px 20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <h3 style={{ fontSize: "0.9rem", fontWeight: 700, flex: 1 }}>{p.title}</h3>
                      <span className="badge badge-active">Aktif</span>
                    </div>
                    <p style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                      {p.total_votes} oy{p.user_voted ? ` · Seçiminiz: "${p.user_voted}"` : ""}
                    </p>
                    {!p.user_voted && (
                      <Link href="/polls">
                        <button className="btn-outline" style={{ marginTop: "12px", padding: "7px 16px", fontSize: "0.82rem" }}>
                          Oy Kullan →
                        </button>
                      </Link>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
