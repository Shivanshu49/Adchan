import type { Metadata } from "next";
import Link from "next/link";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "अड़चन — PM-KISAN किस्त की साफ़ जानकारी",
    template: "%s · अड़चन",
  },
  description: "PM-KISAN की रुकी किस्त का कारण और अगला कदम, साफ़ हिंदी में।",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hi">
      <body>
        <a
          href="#main-content"
          className="sr-only z-50 bg-white p-3 text-[#1d2330] focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
        >
          मुख्य सामग्री पर जाएँ
        </a>
        <div className="flex min-h-svh flex-col">
          <header className="border-b-4 border-[#f0c95a] bg-[#1d2330] text-white">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <Link
                href="/"
                prefetch={false}
                className="flex min-h-12 w-fit items-center gap-3 focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#f0c95a]"
              >
                <span className="border-2 border-[#f0c95a] px-2 py-1 font-mono text-[18px] font-black tracking-[0.12em] text-[#f0c95a]">
                  ADCHAN
                </span>
                <span className="text-[22px] font-black">अड़चन</span>
              </Link>
              <p className="max-w-xl text-[18px] font-bold leading-relaxed text-[#f5f0e7]">
                स्वतंत्र प्रोटोटाइप — किसी सरकारी संस्था से संबंधित नहीं।
              </p>
            </div>
          </header>

          <div className="flex-1">{children}</div>

          <footer className="mt-auto border-t-2 border-[#1d2330] bg-[#e5ded1]">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-6 text-[#1d2330] sm:px-6">
              <p className="text-[18px] font-black">
                स्वतंत्र प्रोटोटाइप — किसी सरकारी संस्था से संबंधित नहीं।
              </p>
              <p className="text-[18px] leading-relaxed text-[#514e48]" lang="en">
                Independent prototype — not affiliated with any government body.
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
