import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function isPublicPath(pathname: string) {
  // libera assets e rotas públicas
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/assets") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/api")
  ) return true;

  // libera login em qualquer locale: /pt/login, /en/login, etc
  if (/^\/[^\/]+\/login(\/|$)/.test(pathname)) return true;

  return false;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // se for público, deixa passar
  if (isPublicPath(pathname)) return NextResponse.next();

  // pega token do localStorage não dá aqui (middleware roda no server)
  // então usamos cookie. (abaixo eu te digo como setar)
  const token = req.cookies.get("token")?.value;

  // Se cair na raiz "/": manda pro login (locale padrão pt)
  if (pathname === "/") {
    const url = req.nextUrl.clone();
    url.pathname = "/pt/login";
    return NextResponse.redirect(url);
  }

  // Se não tem token, manda pro login do locale atual
  if (!token) {
    const locale = pathname.split("/")[1] || "pt";
    const url = req.nextUrl.clone();
    url.pathname = `/${locale}/login`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
