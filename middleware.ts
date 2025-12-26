import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { locales } from "@/config";

const DEFAULT_LOCALE = "pt";

const i18n = createMiddleware({
  locales,
  defaultLocale: DEFAULT_LOCALE,
});

function isPublicPath(pathname: string) {
  // libera login e auth endpoints
  return (
    pathname.includes("/login") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"
  );
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // primeiro aplica i18n (garante /pt/..., /en/..., etc)
  const response = i18n(request);

  if (isPublicPath(pathname)) return response;

  // token no cookie (HttpOnly)
  const token = request.cookies.get("pyratas_token")?.value;

  // se não tem token, manda pra /{locale}/login
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
  matcher: ["/((?!_next|.*\\..*).*)"],
};
