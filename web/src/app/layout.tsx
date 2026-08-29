import type { Metadata } from "next";
import localFont from "next/font/local";

import { resetDemoState } from "@/actions/mock-auth";
import { LanguageProvider } from "@/context/LanguageContext";
import Link from "@/components/PlainLink";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import SiteHeader from "@/components/SiteHeader";
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
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hi-IN" className={notoSansDevanagari.variable}>
      <body>
        <LanguageProvider>
          <a
            href="#main-content"
            data-i18n="skip.main"
            className="sr-only z-50 rounded-[14px] bg-white p-3 text-[var(--c-ink)] focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
          >
            मुख्य सामग्री पर जाएँ
          </a>
          <div className="site-wrapper">
            <div className="main-card">
              <SiteHeader />

              <div className="site-content">{children}</div>

              <footer className="site-footer">
                <nav aria-label="परियोजना के बारे में" className="bottom-links">
                  <Link href="/whats-real" prefetch={false} className="bottom-link-btn" data-i18n="footer.real">
                    क्या असली है?
                  </Link>
                  <Link href="/how-it-works" prefetch={false} className="bottom-link-btn" data-i18n="footer.how">
                    कैसे काम करता है
                  </Link>
                  <Link href="/research" prefetch={false} className="bottom-link-btn" data-i18n="footer.research">
                    शोध और साक्षात्कार
                  </Link>
                  <form action={resetDemoState}>
                    <button type="submit" className="bottom-link-btn w-full" data-i18n="footer.reset">डेमो रीसेट करें</button>
                  </form>
                </nav>
                <p className="footer-note" data-i18n="footer.disclaimer">
                  स्वतंत्र प्रोटोटाइप — किसी सरकारी संस्था से संबंधित नहीं।
                </p>
              </footer>
            </div>
          </div>
          <ServiceWorkerRegistration />
        </LanguageProvider>
      </body>
    </html>
  );
}
