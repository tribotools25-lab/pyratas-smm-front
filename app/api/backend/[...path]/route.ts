import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "https://pyratas-smm-api.onrender.com";

async function handler(req: NextRequest, ctx: { params: { path: string[] } }) {
  const { path } = ctx.params;
  const url = new URL(req.url);

  // Monta URL final no back
  const target = `${BACKEND_URL}/${path.join("/")}${url.search}`;

  const headers = new Headers(req.headers);
  headers.delete("host");

  // Se estiver usando cookie httpOnly do painel, mantém cookies
  // (Next já encaminha cookie do mesmo domínio automaticamente; aqui só garante o header)
  const init: RequestInit = {
    method: req.method,
    headers,
    body: req.method === "GET" || req.method === "HEAD" ? undefined : await req.text(),
    redirect: "manual",
  };

  const resp = await fetch(target, init);

  const respHeaders = new Headers(resp.headers);
  // Evita cache agressivo
  respHeaders.set("cache-control", "no-store");

  return new NextResponse(await resp.arrayBuffer(), {
    status: resp.status,
    headers: respHeaders,
  });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const OPTIONS = handler;
