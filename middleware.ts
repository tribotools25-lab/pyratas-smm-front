import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { locales } from "@/config";

const DEFAULT_LOCALE = "pt";

const i18n = createMiddleware({
  locales,
  defaultLocale: DEFAULT_LOCALE,
});

function isPublicPath(pathname: string) {
  return (
    pathname.includes("/login") ||
    pathname.includes("/set-password") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"
  );
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ✅ 0) nunca tocar em rotas /api (NextAuth e proxies)
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // ✅ 1) corrigir loop de locale duplicado: /pt/pt/... , /en/en/...
  const parts = pathname.split("/").filter(Boolean);
  const first = parts[0];
  const second = parts[1];

  if (first && second && locales.includes(first as any) && locales.includes(second as any)) {
    const url = request.nextUrl.clone();
    // mantém só o primeiro locale e remove o duplicado
    url.pathname = `/${first}/${parts.slice(2).join("/")}`;
    return NextResponse.redirect(url);
  }

  // ✅ 2) aplica i18n nas páginas
  const response = i18n(request);

  // ✅ 3) libera rotas públicas (login, etc)
  if (isPublicPath(pathname)) return response;

  // ✅ 4) auth guard
  // IMPORTANTE: com NextAuth v5, o cookie não é "pyratas_token".
  // O padrão é "authjs.session-token" (ou "__Secure-authjs.session-token" em https).
  const cookie =
    request.cookies.get("__Secure-authjs.session-token")?.value ||
    request.cookies.get("authjs.session-token")?.value;

  if (!cookie) {
    // pega locale do path, senão usa default
    const locale = parts[0];
    const safeLocale = locales.includes(locale as any) ? locale : DEFAULT_LOCALE;

    const url = request.nextUrl.clone();
    url.pathname = `/${safeLocale}/login`;
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
