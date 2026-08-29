import type { Metadata } from "next";
import Image from "next/image";
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
          className="sr-only z-50 rounded-[14px] bg-white p-3 text-[var(--c-ink)] focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
        >
          मुख्य सामग्री पर जाएँ
        </a>
        <div className="site-wrapper">
          <div className="main-card">
            <header className="site-header">
              <div className="topbar">
                <Link href="/" prefetch={false} className="brand-link" aria-label="अड़चन होम">
                  <Image
                    src="/adchan-logo-horizontal.webp"
                    alt="अड़चन"
                    width={220}
                    height={74}
                    sizes="(max-width: 640px) 150px, 220px"
                    className="brand-logo"
                    priority
                  />
                </Link>
                <nav className="primary-nav" aria-label="मुख्य नेविगेशन">
                  <Link href="/" prefetch={false} className="active">होम</Link>
                  <Link href="/#services" prefetch={false}>सेवाएं</Link>
                  <Link href="/#schemes" prefetch={false}>योजनाएं</Link>
                  <Link href="/#help" prefetch={false}>सहायता</Link>
                </nav>
                <div className="header-actions">
                  <label>
                    <span className="sr-only">भाषा चुनें</span>
                    <select className="language-select" defaultValue="hi" aria-label="भाषा चुनें">
                      <option value="hi">हिंदी</option>
                      <option value="en">English</option>
                    </select>
                  </label>
                  <button type="button" className="profile-button" aria-label="प्रोफाइल">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <circle cx="12" cy="8" r="4" />
                      <path d="M5 21a7 7 0 0 1 14 0" />
                    </svg>
                  </button>
                </div>
              </div>
            </header>

            <div className="site-content">{children}</div>

            <footer className="site-footer">
              <nav aria-label="परियोजना के बारे में" className="bottom-links">
                <Link href="/whats-real" prefetch={false} className="bottom-link-btn">
                  क्या असली है?
                </Link>
                <Link href="/how-it-works" prefetch={false} className="bottom-link-btn">
                  कैसे काम करता है
                </Link>
                <Link href="/research" prefetch={false} className="bottom-link-btn">
                  शोध और साक्षात्कार
                </Link>
                <form action={resetDemoState}>
                  <button type="submit" className="bottom-link-btn w-full">डेमो रीसेट करें</button>
                </form>
              </nav>
              <p className="footer-note" lang="en">
                Independent prototype — not affiliated with any government body.
              </p>
            </footer>
          </div>
        </div>
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
