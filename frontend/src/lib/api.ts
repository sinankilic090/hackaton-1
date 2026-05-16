const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8009";

function getHeaders(token?: string | null): HeadersInit {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export async function loginEDevlet(tckn: string, full_name: string) {
  const res = await fetch(`${API_URL}/api/auth/edevlet`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ tckn, full_name }),
  });
  if (!res.ok) throw new Error((await res.json()).detail || "Giriş başarısız");
  return res.json();
}

// ── Complaints ────────────────────────────────────────────────────────────────
export async function createComplaint(description: string, token: string) {
  const res = await fetch(`${API_URL}/api/complaints/`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify({ description }),
  });
  if (!res.ok) throw new Error((await res.json()).detail || "Şikayet gönderilemedi");
  return res.json();
}

export async function getMyComplaints(token: string) {
  const res = await fetch(`${API_URL}/api/complaints/my`, {
    headers: getHeaders(token),
  });
  if (!res.ok) throw new Error("Şikayetler yüklenemedi");
  return res.json();
}

export async function getAllComplaints(token: string) {
  const res = await fetch(`${API_URL}/api/complaints/all`, {
    headers: getHeaders(token),
  });
  if (!res.ok) throw new Error("Şikayetler yüklenemedi");
  return res.json();
}

export async function updateComplaintStatus(id: number, status: string, token: string) {
  const res = await fetch(`${API_URL}/api/complaints/${id}/status`, {
    method: "PATCH",
    headers: getHeaders(token),
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Durum güncellenemedi");
  return res.json();
}

// ── Polls ─────────────────────────────────────────────────────────────────────
export async function getPolls(token: string) {
  const res = await fetch(`${API_URL}/api/polls/`, {
    headers: getHeaders(token),
  });
  if (!res.ok) throw new Error("Anketler yüklenemedi");
  return res.json();
}

export async function castVote(pollId: number, choice: string, token: string) {
  const res = await fetch(`${API_URL}/api/polls/${pollId}/vote`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify({ choice }),
  });
  if (!res.ok) throw new Error((await res.json()).detail || "Oy kullanılamadı");
  return res.json();
}

export async function createPoll(
  title: string,
  description: string,
  options: string[],
  token: string
) {
  const res = await fetch(`${API_URL}/api/polls/`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify({ title, description, options }),
  });
  if (!res.ok) throw new Error((await res.json()).detail || "Anket oluşturulamadı");
  return res.json();
}

// ── Admin ─────────────────────────────────────────────────────────────────────
export async function getAdminSummary(token: string) {
  const res = await fetch(`${API_URL}/api/admin/summary`, {
    headers: getHeaders(token),
  });
  if (!res.ok) throw new Error("Özet alınamadı");
  return res.json();
}

export async function getWeeklySummary(token: string) {
  const res = await fetch(`${API_URL}/api/admin/weekly-summary`, {
    headers: getHeaders(token),
  });
  if (!res.ok) throw new Error("Haftalık özet alınamadı");
  return res.json();
}
