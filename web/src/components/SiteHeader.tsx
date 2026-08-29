"use client";

import Image from "next/image";

import Link from "@/components/PlainLink";
import { type SupportedLanguage, useLanguage } from "@/context/LanguageContext";


export default function SiteHeader() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="site-header">
      <div className="topbar">
        <Link href="/" prefetch={false} className="brand-link" aria-label="Adchan home">
          <Image
            src="/adchan-logo-horizontal.webp"
            alt="Adchan"
            width={220}
            height={74}
            sizes="(max-width: 640px) 150px, 220px"
            className="brand-logo"
            priority
          />
        </Link>

        <nav className="primary-nav" aria-label="Main navigation">
          <Link href="/" prefetch={false} className="active">{t("nav.home")}</Link>
          <Link href="/#services" prefetch={false}>{t("nav.services")}</Link>
          <Link href="/#schemes" prefetch={false}>{t("nav.schemes")}</Link>
          <Link href="/#help" prefetch={false}>{t("nav.help")}</Link>
        </nav>

        <div className="header-actions">
          <label>
            <span className="sr-only">{t("nav.language")}</span>
            <select
              className="language-select"
              value={language}
              aria-label={t("nav.language")}
              onChange={(event) => setLanguage(event.target.value as SupportedLanguage)}
            >
              <option value="hi">हिंदी</option>
              <option value="en">English</option>
              <option value="mr">मराठी</option>
              <option value="gu">ગુજરાતી</option>
            </select>
          </label>
          <button type="button" className="profile-button" aria-label={t("nav.profile")} title={t("nav.profile")}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="8" r="4" />
              <path d="M5 21a7 7 0 0 1 14 0" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
