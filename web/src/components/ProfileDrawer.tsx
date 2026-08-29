"use client";

import { useEffect, useRef } from "react";

import MockBadge from "@/components/MockBadge";
import Link from "@/components/PlainLink";
import ServiceIcon, { type ServiceIconName } from "@/components/ServiceIcon";
import { useLanguage } from "@/context/LanguageContext";


interface ProfileDrawerProps {
  open: boolean;
  onClose: () => void;
}

interface DrawerService {
  icon: ServiceIconName;
  labelKey: string;
  fallback: string;
  href: string;
}

const services: DrawerService[] = [
  { icon: "money", labelKey: "service.status.title", fallback: "स्थिति", href: "/#registration" },
  { icon: "shield", labelKey: "service.ekyc.title", fallback: "e-KYC", href: "/#registration" },
  { icon: "register", labelKey: "service.registration.title", fallback: "पंजीकरण", href: "/#registration" },
  { icon: "building", labelKey: "service.schemes.title", fallback: "योजनाएं", href: "/#schemes" },
  { icon: "crops", labelKey: "service.crops.title", fallback: "फसल", href: "/#services" },
  { icon: "weather", labelKey: "service.weather.title", fallback: "मौसम", href: "/#services" },
  { icon: "fertilizer", labelKey: "service.fertilizer.title", fallback: "उर्वरक", href: "/#services" },
  { icon: "calculator", labelKey: "service.calculator.title", fallback: "कैलकुलेटर", href: "/#services" },
  { icon: "notifications", labelKey: "service.notifications.title", fallback: "सूचनाएं", href: "/#help" },
  { icon: "help", labelKey: "service.help.title", fallback: "सहायता", href: "/#help" },
  { icon: "video", labelKey: "service.video.title", fallback: "वीडियो", href: "/how-it-works" },
  { icon: "profile", labelKey: "service.profile.title", fallback: "प्रोफाइल", href: "/status/UP-DEMO-0001/login/start" },
];


export default function ProfileDrawer({ open, onClose }: ProfileDrawerProps) {
  const { t } = useLanguage();
  const drawerRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const previousFocus = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const focusFrame = window.requestAnimationFrame(() => closeButtonRef.current?.focus());

    document.body.classList.add("drawer-open");

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !drawerRef.current) return;
      const focusable = Array.from(
        drawerRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.classList.remove("drawer-open");
      previousFocus?.focus();
    };
  }, [open, onClose]);

  return (
    <>
      <div
        className={`profile-drawer-backdrop${open ? " is-visible" : ""}`}
        aria-hidden="true"
        onClick={onClose}
      />
      <aside
        ref={drawerRef}
        id="profile-services-drawer"
        className={`profile-drawer${open ? " is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
        aria-labelledby="profile-drawer-title"
        inert={!open}
      >
        <div className="profile-drawer-header">
          <h2 id="profile-drawer-title">{t("drawer.title")}</h2>
          <button
            ref={closeButtonRef}
            type="button"
            className="profile-drawer-close"
            onClick={onClose}
            aria-label={t("drawer.close")}
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <div className="profile-drawer-user">
          <span className="profile-drawer-avatar" aria-hidden="true">क</span>
          <div>
            <strong>{t("drawer.user")}</strong>
            <span>{t("drawer.userSubtitle")}</span>
          </div>
          <MockBadge hi={t("drawer.sampleProfile")} en="MOCKED" />
        </div>

        <section className="profile-drawer-services" aria-labelledby="drawer-services-title">
          <div className="profile-drawer-section-heading">
            <h3 id="drawer-services-title">{t("drawer.allServices")}</h3>
            <MockBadge hi={t("drawer.sampleServices")} en="MOCKED" />
          </div>
          <div className="profile-drawer-grid">
            {services.map((service) => (
              <Link
                key={service.labelKey}
                href={service.href}
                prefetch={false}
                className="profile-drawer-service"
                onClick={onClose}
              >
                <span className="profile-drawer-service-icon" aria-hidden="true">
                  <ServiceIcon name={service.icon} />
                </span>
                <span>{t(service.labelKey) || service.fallback}</span>
              </Link>
            ))}
          </div>
        </section>

        <div className="profile-drawer-action">
          <MockBadge hi={t("drawer.sampleLogin")} en="MOCK AUTH" />
          <Link
            href="/status/UP-DEMO-0001/login/start"
            prefetch={false}
            className="profile-drawer-login"
            onClick={onClose}
          >
            {t("drawer.login")}
          </Link>
        </div>
      </aside>
    </>
  );
}
