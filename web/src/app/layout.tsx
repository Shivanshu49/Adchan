import type { Metadata } from "next";
import Link from "next/link";
import localFont from "next/font/local";

import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import "./globals.css";


const notoSansDevanagari = localFont({
  src: "../../public/fonts/noto-hi-subset.woff2",
  variable: "--font-noto-hi",
  display: "swap",
  weight: "400",
  style: "normal",
  fallback: ["system-ui", "sans-serif"],
});


export const metadata: Metadata = {
  title: {
    default: "अड़चन — PM-KISAN किस्त की साफ़ जानकारी",
    template: "%s · अड़चन",
  },
  description: "PM-KISAN की रुकी किस्त का कारण और अगला कदम, साफ़ हिंदी में।",
  manifest: "/manifest.json",
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hi" className={notoSansDevanagari.variable}>
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
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-6 text-[#1d2330] sm:px-6">
              <nav aria-label="परियोजना के बारे में" className="grid gap-2 sm:grid-cols-3">
                <Link
                  href="/whats-real"
                  prefetch={false}
                  className="flex min-h-12 items-center border-b-2 border-[#1d2330] text-[18px] font-black hover:text-[#8f2d24] focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#8f2d24]"
                >
                  क्या असली है?
                </Link>
                <Link
                  href="/how-it-works"
                  prefetch={false}
                  className="flex min-h-12 items-center border-b-2 border-[#1d2330] text-[18px] font-black hover:text-[#8f2d24] focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#8f2d24]"
                >
                  यह कैसे काम करता है
                </Link>
                <Link
                  href="/research"
                  prefetch={false}
                  className="flex min-h-12 items-center border-b-2 border-[#1d2330] text-[18px] font-black hover:text-[#8f2d24] focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#8f2d24]"
                >
                  शोध और साक्षात्कार
                </Link>
              </nav>
              <p className="text-[18px] font-black">
                स्वतंत्र प्रोटोटाइप — किसी सरकारी संस्था से संबंधित नहीं।
              </p>
              <p className="text-[18px] leading-relaxed text-[#514e48]" lang="en">
                Independent prototype — not affiliated with any government body.
              </p>
            </div>
          </footer>
        </div>
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
