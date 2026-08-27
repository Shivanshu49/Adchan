import type { Metadata } from "next";
import localFont from "next/font/local";

import { resetDemoState } from "@/actions/mock-auth";
import Link from "@/components/PlainLink";
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
          className="sr-only z-50 bg-white p-3 text-[var(--ink)] focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
        >
          मुख्य सामग्री पर जाएँ
        </a>
        <div className="flex min-h-svh flex-col">
          <header className="border-b border-[var(--rule)] bg-[var(--surface)]">
            <div className="mx-auto w-full max-w-[560px] px-5 py-3">
              <div className="flex items-center justify-between gap-3">
                <Link
                  href="/"
                  prefetch={false}
                  className="flex min-h-12 w-fit items-center text-[var(--ink)] focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[var(--ink)]"
                >
                  <span className="text-[24px] font-semibold">अड़चन</span>
                </Link>
                <div className="flex items-center gap-3 text-[15px] font-semibold">
                  <Link href="/whats-real" prefetch={false} className="header-action">
                    क्या असली है?
                  </Link>
                  <form action={resetDemoState}>
                    <button type="submit" className="header-action">डेमो रीसेट करें</button>
                  </form>
                </div>
              </div>
              <p className="text-[15px] leading-[1.5] text-[var(--ink)]">
                स्वतंत्र प्रोटोटाइप — किसी सरकारी संस्था से संबंधित नहीं।
              </p>
            </div>
          </header>

          <div className="flex-1">{children}</div>

          <footer className="mt-auto border-t border-[var(--rule)] bg-[var(--paper)]">
            <div className="mx-auto flex w-full max-w-[560px] flex-col gap-5 px-5 py-6 text-[var(--ink)]">
              <nav aria-label="परियोजना के बारे में" className="grid gap-2">
                <Link
                  href="/whats-real"
                  prefetch={false}
                  className="touch-link"
                >
                  क्या असली है?
                </Link>
                <Link
                  href="/how-it-works"
                  prefetch={false}
                  className="touch-link"
                >
                  यह कैसे काम करता है
                </Link>
                <Link
                  href="/research"
                  prefetch={false}
                  className="touch-link"
                >
                  शोध और साक्षात्कार
                </Link>
              </nav>
              <p className="text-[19px] font-semibold">
                स्वतंत्र प्रोटोटाइप — किसी सरकारी संस्था से संबंधित नहीं।
              </p>
              <p className="secondary-copy" lang="en">
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
