import type { Metadata } from "next";
import localFont from "next/font/local";
import { Hind } from "next/font/google";

import { AppProvider } from "@/context/AppContext";
import SiteHeader from "@/components/SiteHeader";
import ProfileDrawer from "@/components/ProfileDrawer";
import ServiceModal from "@/components/ServiceModal";
import VoiceModal from "@/components/VoiceModal";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import "./globals.css";

const hind = Hind({
  weight: ["400", "500", "600", "700"],
  subsets: ["devanagari", "latin"],
  display: "swap",
  variable: "--font-hind",
});

const notoSansDevanagari = localFont({
  src: "../../public/fonts/noto-hi-subset.woff2",
  variable: "--font-noto-hi",
  display: "swap",
  weight: "400 700",
  style: "normal",
  fallback: ["system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  title: {
    default: "adchan — किसान सेवा पोर्टल",
    template: "%s · adchan",
  },
  description: "PM-KISAN की रुकी किस्त का कारण और अगला कदम, साफ़ हिंदी में जानिए।",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/image.png", type: "image/png" },
      { url: "/icon.png", type: "image/png" },
    ],
    apple: "/image.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hi" className={`${notoSansDevanagari.variable} ${hind.variable}`}>
      <body>
        <AppProvider>
          <a
            href="#main-content"
            className="sr-only z-50 rounded-[14px] bg-white p-3 text-[var(--c-ink)] focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
          >
            मुख्य सामग्री पर जाएँ
          </a>

          <div className="site-wrapper">
            <SiteHeader />

            <div className="main-card">
              <div className="site-content">{children}</div>

              {/* Site Footer & Disclaimer */}
              <footer className="site-footer">
                <div className="footer-disclaimer-bar">
                  <div className="disclaimer-badge">
                    <span className="material-symbols-outlined disc-ico" aria-hidden="true">
                      info
                    </span>
                    <span>स्वतंत्र प्रोटोटाइप — किसी सरकारी संस्था से संबंधित नहीं।</span>
                  </div>
                  <p className="copyright-text">© 2026 adchan. सभी अधिकार सुरक्षित।</p>
                </div>
              </footer>
            </div>
          </div>

          {/* Interactive Drawers & Modals */}
          <ProfileDrawer />
          <ServiceModal />
          <VoiceModal />
          <ServiceWorkerRegistration />
        </AppProvider>
      </body>
    </html>
  );
}
