export const metadata = {
  title: "Pyratas SMM",
  description: "Pyratas SMM Front",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
