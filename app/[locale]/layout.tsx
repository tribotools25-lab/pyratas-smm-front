import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Providers
import { ThemeProvider } from "@/providers/theme-provider";
import MountedProvider from "@/providers/mounted.provider";
import DirectionProvider from "@/providers/direction-provider";
import AuthProvider from "@/providers/auth.provider";

// UI
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

// i18n
import { getLangDir } from "rtl-detect";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Pyratas — Social Media Marketing",
  description: "created by codeshaper",
};

export default async function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages();
  const direction = getLangDir(locale);

  return (
    <html lang={locale} dir={direction}>
      <body className={`${inter.className} dashcode-app`}>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <AuthProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <MountedProvider>
                <DirectionProvider direction={direction}>
                  {children}
                </DirectionProvider>
              </MountedProvider>

              {/* Notifications */}
              <Toaster />
              <SonnerToaster />
            </ThemeProvider>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
