import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";

// ✅ Se você NÃO tem "@/config", crie /config.ts na raiz
// export const locales = ["pt","en"] as const;
// export const defaultLocale = "pt";
import { locales, defaultLocale } from "@/config";

const i18n = createMiddleware({
  locales: [...locales],
  defaultLocale,
});

// rotas públicas (sem auth)
function isPublicPath(pathname: string) {
  // aceita /pt/login, /en/login, /login, etc.
  return (
    pathname === "/" ||
    pathname.endsWith("/login") ||
    pathname.includes("/login?") ||
    pathname.endsWith("/set-password") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"
  );
}

// ✅ cookies reais do next-auth v5 (Auth.js)
function hasAuthSessionCookie(req: NextRequest) {
  const names = [
    "authjs.session-token",
    "__Secure-authjs.session-token",
    "next-auth.session-token",
    "__Secure-next-auth.session-token",
  ];
  return names.some((n) => !!req.cookies.get(n)?.value);
}

// ✅ remove locale duplicado: /en/pt/x -> /en/x
function normalizeDoubleLocale(pathname: string) {
  const parts = pathname.split("/").filter(Boolean); // remove vazios
  if (parts.length >= 2) {
    const first = parts[0];
    const second = parts[1];
    if (locales.includes(first as any) && locales.includes(second as any)) {
      // mantém o primeiro e remove o segundo
      const fixed = `/${[first, ...parts.slice(2)].join("/")}`;
      return fixed === "/" ? "/" : fixed;
    }
  }
  return pathname;
}

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ✅ nunca mexer nas rotas de API do NextAuth / Next
  if (pathname.startsWith("/api") || pathname.startsWith("/_next")) {
    return NextResponse.next();
  }

  // ✅ normaliza “/en/pt/...”
  const normalized = normalizeDoubleLocale(pathname);
  if (normalized !== pathname) {
    const url = req.nextUrl.clone();
    url.pathname = normalized;
    return NextResponse.redirect(url);
  }

  // ✅ aplica i18n
  const res = i18n(req);

  // ✅ libera rotas públicas
  if (isPublicPath(req.nextUrl.pathname)) return res;

  // ✅ detecta locale atual
  const seg = req.nextUrl.pathname.split("/")[1];
  const locale = locales.includes(seg as any) ? seg : defaultLocale;

  // ✅ auth guard: se não tem cookie de sessão do Auth.js, manda pro login
  if (!hasAuthSessionCookie(req)) {
    const url = req.nextUrl.clone();
    url.pathname = `/${locale}/login`;
    url.searchParams.set("next", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
