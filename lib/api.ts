const API_BASE = process.env.NEXT_PUBLIC_API_URL;

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export async function apiGet(path: string) {
  const token = getToken();

  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return res.json();
}

export async function apiPost(path: string, body?: any) {
  const token = getToken();

  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body ?? {}),
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return res.json();
}
