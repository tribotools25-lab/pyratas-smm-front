const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function setToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("token", token);
}

export function logout(redirectTo: string = "/login") {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
  window.location.href = redirectTo;
}

export function isLoggedIn() {
  return !!getToken();
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handle(res: Response) {
  if (res.status === 401) {
    // opcional: desloga automático se expirar
    logout("/login");
    throw new Error("Não autenticado");
  }
  if (!res.ok) {
    throw new Error(await res.text());
  }
  return res.json();
}

export async function apiGet(path: string) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    cache: "no-store",
  });

  return handle(res);
}

export async function apiPost(path: string, body?: any) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(body ?? {}),
  });

  return handle(res);
}
