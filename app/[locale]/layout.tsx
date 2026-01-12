import {NextIntlClientProvider} from "next-intl";
import {getMessages, unstable_setRequestLocale} from "next-intl/server";

export function generateStaticParams() {
  return [{locale: "pt"}, {locale: "en"}];
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: {locale: string};
}) {
  unstable_setRequestLocale(params.locale);
  const messages = await getMessages();

  return (
    <html lang={params.locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
