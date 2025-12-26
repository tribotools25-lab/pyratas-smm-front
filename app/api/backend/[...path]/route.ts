import { cookies } from "next/headers";
import { NextResponse } from "next/server";

async function handler(req: Request, ctx: { params: { path: string[] } }) {
  const base = process.env.NEXT_PUBLIC_API_BASE;
  if (!base) return NextResponse.json({ ok: false, error: "NEXT_PUBLIC_API_BASE não definido" }, { status: 500 });

  const token = cookies().get("pyratas_token")?.value;
  if (!token) return NextResponse.json({ ok: false, error: "Não autenticado" }, { status: 401 });

  const path = ctx.params.path.join("/");
  const url = new URL(req.url);
  const targetUrl = `${base}/${path}${url.search}`;

  const headers = new Headers(req.headers);
  headers.set("Authorization", `Bearer ${token}`);
  headers.delete("host");

  // se for multipart/form-data, não setar content-type na mão
  const contentType = headers.get("content-type") || "";
  const isForm = contentType.includes("multipart/form-data");

  const r = await fetch(targetUrl, {
    method: req.method,
    headers,
    body: req.method === "GET" || req.method === "HEAD" ? undefined : (isForm ? await req.formData() : await req.text()),
    cache: "no-store",
  });

  const ct = r.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    const data = await r.json().catch(() => ({}));
    return NextResponse.json(data, { status: r.status });
  }

  const text = await r.text();
  return new NextResponse(text, { status: r.status, headers: { "content-type": ct || "text/plain" } });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
