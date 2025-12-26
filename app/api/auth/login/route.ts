import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  const base = process.env.NEXT_PUBLIC_API_BASE;
  if (!base) {
    return NextResponse.json({ ok: false, error: "NEXT_PUBLIC_API_BASE não definido" }, { status: 500 });
  }

  // chama seu backend (pyratas-smm-api) e pega access_token
  const r = await fetch(`${base}/api/auth/login-json`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const data = await r.json().catch(() => ({}));

  if (!r.ok || !data?.access_token) {
    return NextResponse.json(
      { ok: false, error: data?.detail || "Login inválido" },
      { status: 401 }
    );
  }

  const res = NextResponse.json({ ok: true });

  // cookie HttpOnly (token não fica acessível no JS)
  res.cookies.set("pyratas_token", data.access_token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    // opcional: 7 dias
    maxAge: 60 * 60 * 24 * 7,
  });

  return res;
}
