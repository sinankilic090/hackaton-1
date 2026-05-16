"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getPolls, castVote } from "@/lib/api";

export default function PollsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [polls, setPolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<number, string>>({});

  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user) {
      getPolls(user.token).then(setPolls).catch(console.error).finally(() => setLoading(false));
    }
  }, [user]);

  const handleVote = async (pollId: number, choice: string) => {
    if (!user) return;
    setVoting(pollId);
    setErrors((prev) => ({ ...prev, [pollId]: "" }));
    try {
      await castVote(pollId, choice, user.token);
      const updated = await getPolls(user.token);
      setPolls(updated);
    } catch (err: unknown) {
      setErrors((prev) => ({ ...prev, [pollId]: err instanceof Error ? err.message : "Hata" }));
    } finally {
      setVoting(null);
    }
  };

  if (isLoading || !user) return null;

  const activePools = polls.filter((p) => p.is_active);
  const closedPools = polls.filter((p) => !p.is_active);

  return (
    <div style={{ background: "#f9fafb", minHeight: "calc(100vh - 100px)" }}>
      {/* Page header */}
      <div style={{ background: "#111111", color: "#fff", padding: "36px 0" }}>
        <div className="container" style={{ maxWidth: "860px" }}>
          <h1 style={{ fontSize: "1.7rem", fontWeight: 900, color: "#fff", marginBottom: "4px" }}>Kararlara Katılın</h1>
          <p style={{ color: "#9ca3af", fontSize: "0.95rem" }}>Belediye anketlerine katılarak doğrudan oy verin.</p>
        </div>
      </div>

      <div className="container" style={{ padding: "40px 24px", maxWidth: "860px", margin: "0 auto" }}>
        {loading ? (
          <p style={{ color: "#6b7280" }}>Yükleniyor...</p>
        ) : (
          <>
            {/* Active polls */}
            {activePools.length > 0 && (
              <div style={{ marginBottom: "48px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                  <div className="section-divider" style={{ margin: 0 }} />
                  <h2 style={{ fontWeight: 900, fontSize: "1.2rem", color: "#111" }}>Aktif Anketler ({activePools.length})</h2>
                </div>
                
                <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  {activePools.map((poll) => {
                    const options: string[] = JSON.parse(poll.options);
                    const totalVotes = poll.total_votes || 0;
                    const hasVoted = !!poll.user_voted;
                    
                    return (
                      <div key={poll.id} className="card" style={{ padding: "32px", borderTop: "4px solid #E31F26" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", alignItems: "flex-start" }}>
                          <h3 style={{ fontWeight: 800, fontSize: "1.1rem", color: "#111", lineHeight: 1.4 }}>{poll.title}</h3>
                          <span className="badge badge-active">AKTİF</span>
                        </div>
                        
                        {poll.description && (
                          <p style={{ color: "#374151", fontSize: "0.95rem", marginBottom: "24px", lineHeight: 1.6 }}>{poll.description}</p>
                        )}

                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                          {options.map((opt) => {
                            const count = poll.vote_counts?.[opt] || 0;
                            const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                            const isChosen = poll.user_voted === opt;
                            
                            return (
                              <div key={opt}>
                                {hasVoted ? (
                                  <div style={{
                                    position: "relative",
                                    borderRadius: "4px",
                                    overflow: "hidden",
                                    background: "#f3f4f6",
                                    border: `2px solid ${isChosen ? "#E31F26" : "#e5e7eb"}`,
                                  }}>
                                    {/* Progress Bar */}
                                    <div style={{
                                      position: "absolute", left: 0, top: 0, bottom: 0,
                                      width: `${pct}%`,
                                      background: isChosen ? "#fee2e2" : "#e5e7eb",
                                      transition: "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                                      zIndex: 1
                                    }} />
                                    
                                    <div style={{ 
                                      position: "relative", zIndex: 2, 
                                      padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" 
                                    }}>
                                      <span style={{ fontWeight: isChosen ? 800 : 600, color: isChosen ? "#b91c1c" : "#374151", fontSize: "0.95rem" }}>
                                        {isChosen && "✓ "}{opt}
                                      </span>
                                      <span style={{ fontWeight: 700, color: "#111", fontSize: "0.9rem" }}>{pct}% <span style={{ color: "#6b7280", fontWeight: 400, fontSize: "0.8rem" }}>({count})</span></span>
                                    </div>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => handleVote(poll.id, opt)}
                                    disabled={voting === poll.id}
                                    style={{
                                      width: "100%", textAlign: "left",
                                      background: "#fff",
                                      border: "2px solid #e5e7eb",
                                      borderRadius: "4px",
                                      padding: "14px 16px",
                                      color: "#111",
                                      fontWeight: 600,
                                      fontSize: "0.95rem",
                                      cursor: voting === poll.id ? "not-allowed" : "pointer",
                                      opacity: voting === poll.id ? 0.7 : 1,
                                      transition: "all 0.15s ease",
                                      fontFamily: "inherit",
                                    }}
                                    onMouseEnter={(e) => {
                                      if (voting !== poll.id) {
                                        (e.target as HTMLElement).style.borderColor = "#E31F26";
                                        (e.target as HTMLElement).style.color = "#E31F26";
                                        (e.target as HTMLElement).style.background = "#fffafa";
                                      }
                                    }}
                                    onMouseLeave={(e) => {
                                      (e.target as HTMLElement).style.borderColor = "#e5e7eb";
                                      (e.target as HTMLElement).style.color = "#111";
                                      (e.target as HTMLElement).style.background = "#fff";
                                    }}
                                  >
                                    {voting === poll.id ? "Gönderiliyor..." : opt}
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {errors[poll.id] && (
                          <div style={{ background: "#fee2e2", color: "#b91c1c", padding: "10px 14px", borderRadius: "4px", marginTop: "16px", fontSize: "0.85rem", fontWeight: 600 }}>
                            ⚠️ {errors[poll.id]}
                          </div>
                        )}
                        
                        <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #e5e7eb", paddingTop: "16px", marginTop: "20px" }}>
                          <span style={{ color: "#6b7280", fontSize: "0.85rem", fontWeight: 600 }}>Toplam {totalVotes} Oy</span>
                          <span style={{ color: "#9ca3af", fontSize: "0.8rem" }}>Oluşturulma: {new Date(poll.created_at).toLocaleDateString("tr-TR")}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Closed polls */}
            {closedPools.length > 0 && (
              <div>
                 <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                  <div className="section-divider" style={{ margin: 0, background: "#9ca3af" }} />
                  <h2 style={{ fontWeight: 900, fontSize: "1.2rem", color: "#6b7280" }}>Kapanmış Anketler ({closedPools.length})</h2>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {closedPools.map((poll) => (
                    <div key={poll.id} className="card" style={{ padding: "20px 24px", background: "#f9fafb", borderStyle: "dashed" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <h3 style={{ fontWeight: 700, fontSize: "1rem", color: "#374151" }}>{poll.title}</h3>
                        <span className="badge badge-closed">KAPALI</span>
                      </div>
                      <p style={{ color: "#6b7280", fontSize: "0.85rem", marginTop: "8px", fontWeight: 600 }}>{poll.total_votes} toplam oy</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {polls.length === 0 && (
              <div className="card" style={{ padding: "60px 24px", textAlign: "center" }}>
                <p style={{ fontSize: "3rem", marginBottom: "16px" }}>🗳️</p>
                <p style={{ color: "#6b7280", fontSize: "1.05rem", fontWeight: 600 }}>Henüz anket bulunmuyor.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
