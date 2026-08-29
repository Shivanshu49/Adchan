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


function FooterIcon({ name }: { name: "verified" | "help" | "research" | "reset" }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {name === "verified" && (
        <>
          <path d="m12 3 7 3v5c0 5-2.6 8.4-7 10-4.4-1.6-7-5-7-10V6l7-3Z" />
          <path d="m9 12 2 2 4-5" />
        </>
      )}
      {name === "help" && (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M9.8 9a2.4 2.4 0 1 1 3.4 2.2c-.8.4-1.2.9-1.2 1.8M12 17h.01" />
        </>
      )}
      {name === "research" && (
        <>
          <path d="M4 5.5A3.5 3.5 0 0 1 7.5 4H11v15H7.5A3.5 3.5 0 0 0 4 20.5v-15ZM20 5.5A3.5 3.5 0 0 0 16.5 4H13v15h3.5a3.5 3.5 0 0 1 3.5 1.5v-15Z" />
        </>
      )}
      {name === "reset" && (
        <>
          <path d="M5 8V3m0 5h5" />
          <path d="M5.8 7A8 8 0 1 1 4 14" />
        </>
      )}
    </svg>
  );
}

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
                  <Link href="/whats-real" prefetch={false} className="bottom-link-btn">
                    <span className="bottom-link-icon"><FooterIcon name="verified" /></span>
                    <span data-i18n="footer.real">क्या असली है?</span>
                  </Link>
                  <Link href="/how-it-works" prefetch={false} className="bottom-link-btn">
                    <span className="bottom-link-icon"><FooterIcon name="help" /></span>
                    <span data-i18n="footer.how">कैसे काम करता है</span>
                  </Link>
                  <Link href="/research" prefetch={false} className="bottom-link-btn">
                    <span className="bottom-link-icon"><FooterIcon name="research" /></span>
                    <span data-i18n="footer.research">शोध एवं सलाह</span>
                  </Link>
                  <form action={resetDemoState}>
                    <button type="submit" className="bottom-link-btn w-full">
                      <span className="bottom-link-icon"><FooterIcon name="reset" /></span>
                      <span data-i18n="footer.reset">डेमो रीसेट करें</span>
                    </button>
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
