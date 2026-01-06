// app/api/backend/[...path]/route.ts
import { NextRequest, NextResponse } from "next/server";

const BACKEND =
  process.env.BACKEND_BASE ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://pyratas-smm-api.onrender.com";

function buildTarget(req: NextRequest, pathParts: string[]) {
  const target = new URL(BACKEND.replace(/\/$/, "") + "/" + pathParts.join("/"));

  // repassa querystring
  req.nextUrl.searchParams.forEach((v, k) => target.searchParams.set(k, v));
  return target;
}

async function handler(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  const url = buildTarget(req, path);

  // copia headers relevantes (sem host)
  const headers = new Headers(req.headers);
  headers.delete("host");

  const hasBody = !["GET", "HEAD"].includes(req.method);
  const body = hasBody ? await req.arrayBuffer() : undefined;

  const upstream = await fetch(url, {
    method: req.method,
    headers,
    body,
    redirect: "manual",
  });

  const respHeaders = new Headers(upstream.headers);

  // garante que não quebra com encoding
  respHeaders.delete("content-encoding");

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: respHeaders,
  });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const OPTIONS = handler;
