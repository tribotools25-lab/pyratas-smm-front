import {NextRequest, NextResponse} from "next/server";

const BACKEND_URL = process.env.BACKEND_URL; // ex: https://investbonus-api.onrender.com

function buildTargetUrl(req: NextRequest, path: string[]) {
  const url = new URL(req.url);
  const target = new URL(path.join("/"), BACKEND_URL);
  target.search = url.search; // preserva querystring
  return target;
}

async function proxy(req: NextRequest, ctx: {params: {path: string[]}}) {
  if (!BACKEND_URL) {
    return NextResponse.json(
      {error: "BACKEND_URL is not set"},
      {status: 500}
    );
  }

  const target = buildTargetUrl(req, ctx.params.path);

  // Copia headers úteis
  const headers = new Headers(req.headers);
  headers.delete("host");

  const init: RequestInit = {
    method: req.method,
    headers,
    body: req.method === "GET" || req.method === "HEAD" ? undefined : await req.arrayBuffer(),
    redirect: "manual"
  };

  const res = await fetch(target.toString(), init);

  // Retorna status + headers + body
  const resHeaders = new Headers(res.headers);
  return new NextResponse(res.body, {
    status: res.status,
    headers: resHeaders
  });
}

export async function GET(req: NextRequest, ctx: any) { return proxy(req, ctx); }
export async function POST(req: NextRequest, ctx: any) { return proxy(req, ctx); }
export async function PUT(req: NextRequest, ctx: any) { return proxy(req, ctx); }
export async function PATCH(req: NextRequest, ctx: any) { return proxy(req, ctx); }
export async function DELETE(req: NextRequest, ctx: any) { return proxy(req, ctx); }
