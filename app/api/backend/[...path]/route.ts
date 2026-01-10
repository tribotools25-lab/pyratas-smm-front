import { NextRequest, NextResponse } from "next/server";

const BACKEND_BASE =
  process.env.BACKEND_BASE || "https://pyratas-smm-api.onrender.com";

async function proxy(req: NextRequest, ctx: { params: { path: string[] } }) {
  const { path } = ctx.params;

  const url = new URL(req.url);
  const targetUrl = `${BACKEND_BASE}/${path.join("/")}${url.search}`;

  const headers = new Headers(req.headers);
  headers.delete("host");

  const method = req.method.toUpperCase();
  const body =
    method === "GET" || method === "HEAD" ? undefined : await req.arrayBuffer();

  const upstream = await fetch(targetUrl, {
    method,
    headers,
    body,
    redirect: "manual",
  });

  const resHeaders = new Headers(upstream.headers);
  resHeaders.delete("content-encoding"); // evita bug de gzip/brotli em alguns hosts

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: resHeaders,
  });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;

export const runtime = "nodejs";
