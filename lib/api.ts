// lib/api.ts

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "/api/backend";

async function parseError(res: Response) {
  try {
    const j = await res.json();
    return j?.detail || j?.msg || JSON.stringify(j);
  } catch {
    const txt = await res.text().catch(() => "");
    return txt || `HTTP ${res.status}`;
  }
}

export async function apiPost(path: string, body: any) {
  const url = `${API_BASE}${path}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function apiGet(path: string) {
  const url = `${API_BASE}${path}`;

  const res = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}
