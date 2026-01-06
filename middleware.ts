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
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"
  );
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ✅ 1) NUNCA interceptar rotas do Next /api
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // ✅ 2) aplica i18n só em páginas
  const response = i18n(request);

  // ✅ 3) libera rotas públicas
  if (isPublicPath(pathname)) return response;

  // ✅ 4) auth guard
  const token = request.cookies.get("pyratas_token")?.value;

  if (!token) {
    const locale = pathname.split("/")[1];
    const safeLocale = locales.includes(locale as any) ? locale : DEFAULT_LOCALE;

    const url = request.nextUrl.clone();
    url.pathname = `/${safeLocale}/login`;
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  // ✅ IMPORTANTÍSSIMO: exclui /api do matcher
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
