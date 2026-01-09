import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { locales } from "@/config";

const DEFAULT_LOCALE = "pt";

const intl = createMiddleware({
  locales,
  defaultLocale: DEFAULT_LOCALE,
});

function getLocaleFromPath(pathname: string) {
  const seg = pathname.split("/")[1];
  return locales.includes(seg as any) ? seg : DEFAULT_LOCALE;
}

function isPublicPath(pathname: string) {
  // aceita /login e /{locale}/login
  if (pathname === "/login") return true;
  const locale = getLocaleFromPath(pathname);
  return (
    pathname === `/${locale}/login` ||
    pathname.startsWith(`/${locale}/login/`) ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"
  );
}

export default auth((request) => {
  const { pathname } = request.nextUrl;

  // nunca interceptar API/next static
  if (pathname.startsWith("/api") || pathname.startsWith("/_next") || pathname.includes(".")) {
    return NextResponse.next();
  }

  // aplica i18n primeiro
  const intlResponse = intl(request);

  // se o next-intl quiser redirecionar, respeita (evita loop)
  const location = intlResponse.headers.get("location");
  if (location) return intlResponse;

  // libera públicas
  if (isPublicPath(pathname)) return intlResponse;

  // protege privadas usando sessão do NextAuth (não cookie manual)
  if (!request.auth?.user) {
    const locale = getLocaleFromPath(pathname);
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
