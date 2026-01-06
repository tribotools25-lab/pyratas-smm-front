const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "https://pyratas-smm-api.onrender.com";

export async function apiPost(path: string, body: any) {
  const url = `${API_BASE}${path}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(txt || `HTTP ${res.status}`);
  }

  return res.json();
}

export async function apiGet(path: string) {
  const url = `${API_BASE}${path}`;

  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(txt || `HTTP ${res.status}`);
  }

  return res.json();
}
