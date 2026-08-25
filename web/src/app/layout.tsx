import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Adchan",
  description: "Plain-language PM-KISAN diagnosis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hi">
      <body>{children}</body>
    </html>
  );
}
