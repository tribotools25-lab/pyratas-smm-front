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
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"
  );
}

function getLocaleFromPath(pathname: string) {
  const seg = pathname.split("/")[1] || "";
  return locales.includes(seg as any) ? seg : DEFAULT_LOCALE;
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1) deixa o next-intl cuidar da rota de locale
  const i18nResponse = i18n(request);

  // ✅ Se o next-intl quiser redirecionar (ex: / -> /pt), NÃO mexe em mais nada.
  const location = i18nResponse.headers.get("location");
  if (location) return i18nResponse;

  // 2) libera rotas públicas
  if (isPublicPath(pathname)) return i18nResponse;

  // 3) valida cookie
  const token = request.cookies.get("pyratas_token")?.value;

  if (!token) {
    const locale = getLocaleFromPath(pathname);

    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/login`;
    url.searchParams.set("next", pathname); // se quiser preservar query, me fala que eu ajusto
    return NextResponse.redirect(url);
  }

  return i18nResponse;
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
