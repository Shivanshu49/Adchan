"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "@/components/PlainLink";
import { usePathname } from "next/navigation";
import { useApp, SupportedLang } from "@/context/AppContext";

export default function SiteHeader() {
  const { openDrawer, openServiceModal, lang, setLang } = useApp();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 15);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleDocumentClick = () => setIsLangOpen(false);
    if (isLangOpen) {
      document.addEventListener("click", handleDocumentClick);
    }
    return () => document.removeEventListener("click", handleDocumentClick);
  }, [isLangOpen]);

  const langNames: Record<SupportedLang, { label: string; full: string }> = {
    hi: { label: "Hindi", full: "Hindi (हिंदी)" },
    en: { label: "English", full: "English" },
    mr: { label: "Marathi", full: "Marathi (मराठी)" },
    gu: { label: "Gujarati", full: "Gujarati (ગુજરાતી)" },
  };

  const navTranslations: Record<SupportedLang, { home: string; services: string; plans: string; help: string }> = {
    hi: { home: "होम", services: "सेवाएं", plans: "योजनाएं", help: "सहायता" },
    en: { home: "Home", services: "Services", plans: "Plans", help: "Help" },
    mr: { home: "मुख्यपृष्ठ", services: "सेवा", plans: "योजना", help: "मदत" },
    gu: { home: "હોમ", services: "સેવાઓ", plans: "યોજનાઓ", help: "સહાય" },
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    if (pathname === "/") {
      const el = document.getElementById(targetId);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  return (
    <header className={`site-header ${isScrolled ? "scrolled" : ""}`} id="top-header">
      <div className="header-inner">
        {/* Logo & Brand */}
        <Link href="/" prefetch={false} className="logo-link" aria-label="adchan होम">
          <Image
            src="/logo.png"
            alt="adchan"
            width={160}
            height={48}
            className="logo-img"
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="desktop-nav" aria-label="Main Navigation">
          <Link
            href="/#home"
            prefetch={false}
            className="nav-item active"
            onClick={(e) => handleNavClick(e, "home")}
          >
            {navTranslations[lang].home}
          </Link>
          <Link
            href="/#services"
            prefetch={false}
            className="nav-item"
            onClick={(e) => handleNavClick(e, "services")}
          >
            {navTranslations[lang].services}
          </Link>
          <Link
            href="/#schemes-section"
            prefetch={false}
            className="nav-item"
            onClick={(e) => handleNavClick(e, "schemes-section")}
          >
            {navTranslations[lang].plans}
          </Link>
          <button
            type="button"
            className="nav-item-btn"
            onClick={() => openServiceModal("help")}
          >
            {navTranslations[lang].help}
          </button>
        </nav>

        {/* Topbar Actions */}
        <div className="topbar-actions">
          {/* Language Switcher */}
          <div className={`lang-dropdown-box ${isLangOpen ? "open" : ""}`} id="lang-box">
            <button
              type="button"
              className="lang-btn"
              onClick={(e) => {
                e.stopPropagation();
                setIsLangOpen(!isLangOpen);
              }}
              aria-haspopup="true"
              aria-expanded={isLangOpen}
              aria-label="भाषा / Language"
            >
              <span id="cur-lang">{langNames[lang].label}</span>
              <span className="dropdown-arrow">⌄</span>
            </button>

            {isLangOpen && (
              <div className="lang-menu" role="menu">
                {(["hi", "en", "mr", "gu"] as SupportedLang[]).map((l) => (
                  <button
                    key={l}
                    type="button"
                    className={`lang-opt ${lang === l ? "active" : ""}`}
                    onClick={() => {
                      setLang(l);
                      setIsLangOpen(false);
                    }}
                    role="menuitem"
                  >
                    {langNames[l].full}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Profile Circle Button */}
          <button
            type="button"
            className="profile-circle-btn"
            id="profile-toggle-btn"
            onClick={openDrawer}
            aria-label="प्रोफाइल व सभी 12 सेवाएं खोलें"
          >
            <span className="material-symbols-outlined" aria-hidden="true">person</span>
          </button>
        </div>
      </div>
    </header>
  );
}
