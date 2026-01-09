import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { locales } from "@/config";

const DEFAULT_LOCALE = "pt";

// garante que não tem duplicado tipo ["pt","pt","en"]
const LOCALES = Array.from(new Set(locales));

const intl = createMiddleware({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
});

function isLocale(v: string) {
  return LOCALES.includes(v as any);
}

function normalizeLocalePath(pathname: string) {
  // exemplos que aparecem no seu log:
  // /pt/pt/pt/...  -> /pt/...
  // /en/pt/login   -> /en/login   (mantém o primeiro locale)
  const parts = pathname.split("/").filter(Boolean); // ["pt","pt","login"]

  if (parts.length >= 2 && isLocale(parts[0]) && isLocale(parts[1])) {
    // remove o segundo locale
    const fixed = [parts[0], ...parts.slice(2)];
    return "/" + fixed.join("/");
  }

  if (parts.length >= 3 && isLocale(parts[0]) && parts[1] === parts[0]) {
    // caso /pt/pt/...
    const fixed = [parts[0], ...parts.slice(2)];
    return "/" + fixed.join("/");
  }

  return pathname;
}

function isPublicPath(pathname: string) {
  // deixa público login em qualquer locale
  if (pathname === "/login") return true;

  const parts = pathname.split("/").filter(Boolean);
  const first = parts[0];
  const afterLocale = isLocale(first) ? "/" + parts.slice(1).join("/") : pathname;

  return (
    afterLocale === "/login" ||
    afterLocale.startsWith("/login/") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"
  );
}

export default auth((request) => {
  const { pathname } = request.nextUrl;

  // não mexe em /api, assets e arquivos
  if (pathname.startsWith("/api") || pathname.startsWith("/_next") || pathname.includes(".")) {
    return NextResponse.next();
  }

  // ✅ 1) NORMALIZA antes de qualquer coisa (mata /pt/pt e /en/pt)
  const normalized = normalizeLocalePath(pathname);
  if (normalized !== pathname) {
    const url = request.nextUrl.clone();
    url.pathname = normalized;
    return NextResponse.redirect(url);
  }

  // ✅ 2) roda next-intl
  const intlResponse = intl(request);

  // se next-intl quer redirecionar, respeita
  const location = intlResponse.headers.get("location");
  if (location) return intlResponse;

  // ✅ 3) libera rotas públicas
  if (isPublicPath(pathname)) return intlResponse;

  // ✅ 4) protege rotas privadas pelo NextAuth
  if (!request.auth?.user) {
    const parts = pathname.split("/").filter(Boolean);
    const locale = isLocale(parts[0]) ? parts[0] : DEFAULT_LOCALE;

    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/login`;
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return intlResponse;
});

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
