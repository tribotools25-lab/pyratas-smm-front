import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { locales, defaultLocale } from "./config";

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
});

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 🔴 NUNCA intercepta API
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // aplica i18n
  const response = intlMiddleware(req);

  // páginas públicas
  if (pathname.includes("/login")) return response;

  return response;
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|.*\\..*).*)"],
};
