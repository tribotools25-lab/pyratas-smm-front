// lib/api.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

type ApiError = {
  ok: false;
  status: number;
  method: string;
  path: string;
  message: string;
  detail?: any;
};

function mustBase() {
  const base =
    process.env.NEXT_PUBLIC_API_BASE ||
    process.env.NEXT_PUBLIC_API_URL ||
    "";
  if (!base) throw new Error("NEXT_PUBLIC_API_BASE não configurado");
  return base.replace(/\/+$/, "");
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem("token");
  } catch {
    return null;
  }
}

function authHeader(): Record<string, string> {
  const token = getToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

async function safeJson(res: Response) {
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { detail: text };
  }
}

async function handle(res: Response, method: string, path: string) {
  if (res.ok) return safeJson(res);

  const data = await safeJson(res);
  const message =
    (data && (data.detail || data.message)) ||
    `HTTP ${res.status}`;

  const err: ApiError = {
    ok: false,
    status: res.status,
    method,
    path,
    message: String(message),
    detail: data,
  };

  throw err;
}

// ====================== GET / POST helpers ======================

export async function apiGet(path: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...authHeader(),
  };

  const res = await fetch(`${mustBase()}${path}`, {
    method: "GET",
    headers,
    cache: "no-store",
  });

  return handle(res, "GET", path);
}

export async function apiPost(path: string, body?: any) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...authHeader(),
  };

  const res = await fetch(`${mustBase()}${path}`, {
    method: "POST",
    headers,
    body: body ? JSON.stringify(body) : "{}",
    cache: "no-store",
  });

  return handle(res, "POST", path);
}

// ====================== Auth helpers ======================

export async function login(email: string, password: string) {
  // você pode trocar aqui pra /api/auth/login se preferir
  const res = await fetch(`${mustBase()}/api/auth/login-json`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });

  const data = await handle(res, "POST", "/api/auth/login-json");

  // tenta pegar token em formatos comuns
  const token =
    (data && (data.token || data.access_token)) ||
    null;

  if (typeof window !== "undefined" && token) {
    localStorage.setItem("token", token);
  }

  return data;
}

export function logout() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
}
