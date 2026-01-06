// lib/api.ts
type ApiError = {
  status: number;
  message: string;
  body?: string;
};

function isBrowser() {
  return typeof window !== "undefined";
}

function getBase() {
  // No browser: SEMPRE usa proxy do Next (evita CORS)
  if (isBrowser()) return "/api/backend";

  // No server (SSR): pode usar env, senão cai no proxy também
  return process.env.BACKEND_BASE || process.env.NEXT_PUBLIC_BACKEND_BASE || "/api/backend";
}

async function parseError(res: Response) {
  const txt = await res.text().catch(() => "");
  let msg = txt || `HTTP ${res.status}`;

  // tenta extrair FastAPI {"detail": "..."}
  try {
    const j = JSON.parse(txt);
    if (j?.detail) msg = typeof j.detail === "string" ? j.detail : JSON.stringify(j.detail);
    if (j?.message) msg = j.message;
  } catch {}

  const err: ApiError = { status: res.status, message: msg, body: txt };
  return err;
}

export async function apiPost(path: string, body: any, opts?: RequestInit) {
  const base = getBase();
  const url = path.startsWith("http") ? path : `${base}${path}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(opts?.headers || {}),
    },
    body: JSON.stringify(body),
    credentials: "include",
    ...opts,
  });

  if (!res.ok) throw await parseError(res);
  return res.json();
}

export async function apiGet(path: string, opts?: RequestInit) {
  const base = getBase();
  const url = path.startsWith("http") ? path : `${base}${path}`;

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(opts?.headers || {}),
    },
    cache: "no-store",
    credentials: "include",
    ...opts,
  });

  if (!res.ok) throw await parseError(res);
  return res.json();
}
