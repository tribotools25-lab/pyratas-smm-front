import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;

function buildTargetUrl(req: NextRequest, path: string) {
  if (!BASE_URL) throw new Error('Missing BACKEND_URL env');
  const url = new URL(req.url);
  const target = new URL(path, BASE_URL);
  target.search = url.search;
  return target;
}

async function handler(req: NextRequest, ctx: { params: { path: string[] } }) {
  const path = ctx.params.path.join('/');
  const targetUrl = buildTargetUrl(req, path);

  const headers = new Headers(req.headers);
  headers.delete('host');

  const res = await fetch(targetUrl, {
    method: req.method,
    headers,
    body: ['GET', 'HEAD'].includes(req.method) ? undefined : await req.arrayBuffer(),
    redirect: 'manual'
  });

  return new NextResponse(res.body, {
    status: res.status,
    headers: res.headers
  });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
