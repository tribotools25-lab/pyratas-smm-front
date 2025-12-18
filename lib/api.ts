const API_BASE = process.env.NEXT_PUBLIC_API_URL;

function mustBase() {
  if (!API_BASE) throw new Error("NEXT_PUBLIC_API_URL não definido");
  return API_BASE.replace(/\/$/, "");
}

function authHeader() {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("access_token") || localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handle(res: Response, method: string, path: string) {
  if (res.ok) return res.json().catch(() => ({}));
  let detail = "";
  try {
    const data = await res.json();
    detail = data?.detail ? ` | ${data.detail}` : ` | ${JSON.stringify(data)}`;
  } catch {
    try {
      detail = ` | ${await res.text()}`;
    } catch {}
  }
  throw new Error(`Erro API ${method} ${path} -> ${res.status}${detail}`);
}

export async function apiGet(path: string) {
  const res = await fetch(`${mustBase()}${path}`, {
    headers: { "Content-Type": "application/json", ...authHeader() },
    cache: "no-store",
  });
  return handle(res, "GET", path);
}

export async function apiPost(path: string, body?: any) {
  const res = await fetch(`${mustBase()}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: body ? JSON.stringify(body) : "{}",
    cache: "no-store",
  });
  return handle(res, "POST", path);
}
