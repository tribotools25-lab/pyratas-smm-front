import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { locales } from "@/config";
import { getToken } from "next-auth/jwt";

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

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1) nunca interceptar rotas do Next /api
  if (pathname.startsWith("/api")) return NextResponse.next();

  // 2) aplica i18n só em páginas
  const response = i18n(request);

  // 3) libera rotas públicas
  if (isPublicPath(pathname)) return response;

  // 4) auth guard (NextAuth)
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

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
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
