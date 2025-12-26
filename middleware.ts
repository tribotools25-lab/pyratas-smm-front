import createMiddleware from "next-intl/middleware";
import { NextRequest } from "next/server";
import { locales } from "@/config";

// ✅ Ajuste aqui seu padrão
const DEFAULT_LOCALE = "pt";

export default function middleware(request: NextRequest) {
  // Se você quiser continuar aceitando o header, ok — mas com fallback pro padrão real
  const headerLocale = request.headers.get("dashcode-locale");
  const defaultLocale =
    (headerLocale && locales.includes(headerLocale as any) ? headerLocale : null) ||
    DEFAULT_LOCALE;

  const handleI18nRouting = createMiddleware({
    locales,
    defaultLocale,
  });

  const response = handleI18nRouting(request);

  // mantém o header (opcional)
  response.headers.set("dashcode-locale", defaultLocale);

  return response;
}

export const config = {
  matcher: [
    // Rotas sem arquivo/extensão
    "/((?!api|_next|.*\\..*).*)",
  ],
};
