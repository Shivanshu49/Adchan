"use client";

import React from "react";
import { useApp } from "@/context/AppContext";

export default function PrimaryServicesGrid() {
  const { openDrawer, openServiceModal } = useApp();

  return (
    <section className="services-section" id="services" aria-label="मुख्य किसान सेवाएं">
      <div className="section-header-row">
        <div>
          <h2 className="section-title">मुख्य किसान सेवाएं</h2>
          <p className="section-subtitle">अपनी आवश्यकता अनुसार सेवा चुनें और तुरंत विवरण देखें</p>
        </div>
        <button
          type="button"
          className="view-all-link"
          id="all-services-link"
          onClick={openDrawer}
        >
          सभी 12 सेवाएं देखें <span>→</span>
        </button>
      </div>

      <div className="primary-tools-grid">
        {/* 1. स्थिति (Status) */}
        <button
          type="button"
          className="tool-btn"
          onClick={() => openServiceModal("status")}
          aria-label="स्थिति - किस्त व आवेदन स्थिति जांचें"
        >
          <div className="tool-icon-wrap" aria-hidden="true">
            <svg className="tool-svg" viewBox="0 0 100 100">
              <path
                d="M38 18 C38 14, 62 14, 62 18 C65 24, 69 28, 73 28 C78 28, 78 33, 75 37 C82 48, 85 64, 78 78 C71 90, 29 90, 22 78 C15 64, 18 48, 25 37 C22 33, 22 28, 27 28 C31 28, 35 24, 38 18 Z"
                fill="#CCD5C0"
                stroke="#38422B"
                strokeWidth="4.5"
                strokeLinejoin="round"
              />
              <path
                d="M33 30 Q50 35 67 30"
                stroke="#38422B"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <text
                x="50"
                y="65"
                fontFamily="'Hind', sans-serif"
                fontSize="34"
                fontWeight="700"
                textAnchor="middle"
                fill="#38422B"
              >
                ₹
              </text>
            </svg>
          </div>
          <span className="tool-label">स्थिति</span>
          <span className="tool-desc">किस्त व आवेदन स्थिति</span>
        </button>

        {/* 2. e-KYC */}
        <button
          type="button"
          className="tool-btn"
          onClick={() => openServiceModal("ekyc")}
          aria-label="e-KYC - आधार सत्यापन"
        >
          <div className="tool-icon-wrap" aria-hidden="true">
            <svg className="tool-svg" viewBox="0 0 100 100">
              <path
                d="M50 14 L78 26 C78 52, 68 76, 50 86 C32 76, 22 52, 22 26 Z"
                fill="#CCD5C0"
                stroke="#38422B"
                strokeWidth="4.5"
                strokeLinejoin="round"
              />
              <path
                d="M36 50 L46 60 L65 38"
                stroke="#38422B"
                strokeWidth="5.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="tool-label">e-KYC</span>
          <span className="tool-desc">आधार OTP सत्यापन</span>
        </button>

        {/* 3. पंजीकरण (Registration) */}
        <button
          type="button"
          className="tool-btn"
          onClick={() => openServiceModal("registration")}
          aria-label="पंजीकरण - नया किसान आवेदन"
        >
          <div className="tool-icon-wrap" aria-hidden="true">
            <svg className="tool-svg" viewBox="0 0 100 100">
              <rect
                x="24"
                y="16"
                width="46"
                height="66"
                rx="8"
                fill="#CCD5C0"
                stroke="#38422B"
                strokeWidth="4.5"
              />
              <line x1="34" y1="32" x2="56" y2="32" stroke="#38422B" strokeWidth="4" strokeLinecap="round" />
              <line x1="34" y1="44" x2="54" y2="44" stroke="#38422B" strokeWidth="4" strokeLinecap="round" />
              <path
                d="M56 78 L78 54 L84 60 L62 84 L54 86 Z"
                fill="#9FB873"
                stroke="#38422B"
                strokeWidth="3.5"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="tool-label">पंजीकरण</span>
          <span className="tool-desc">नया किसान पंजीकरण</span>
        </button>

        {/* 4. योजनाएं (Schemes) */}
        <button
          type="button"
          className="tool-btn"
          onClick={() => openServiceModal("schemes")}
          aria-label="योजनाएं - सरकारी योजनाएं"
        >
          <div className="tool-icon-wrap" aria-hidden="true">
            <svg className="tool-svg" viewBox="0 0 100 100">
              <path d="M50 16 L50 24" stroke="#38422B" strokeWidth="3" />
              <path
                d="M50 16 C55 14, 60 18, 64 16 L64 22 C60 24, 55 20, 50 22 Z"
                fill="#9FB873"
                stroke="#38422B"
                strokeWidth="2.5"
              />
              <path
                d="M30 38 C30 25, 70 25, 70 38 Z"
                fill="#CCD5C0"
                stroke="#38422B"
                strokeWidth="4.5"
              />
              <rect x="22" y="38" width="56" height="6" rx="2" fill="#38422B" />
              <rect x="27" y="44" width="8" height="26" fill="#38422B" />
              <rect x="41" y="44" width="8" height="26" fill="#38422B" />
              <rect x="53" y="44" width="8" height="26" fill="#38422B" />
              <rect x="67" y="44" width="8" height="26" fill="#38422B" />
              <rect x="14" y="76" width="72" height="7" rx="2" fill="#38422B" />
            </svg>
          </div>
          <span className="tool-label">योजनाएं</span>
          <span className="tool-desc">पीएम किसान व अन्य</span>
        </button>

        {/* 5. भुगतान स्थिति (Payment) */}
        <button
          type="button"
          className="tool-btn"
          onClick={() => openServiceModal("payment")}
          aria-label="भुगतान स्थिति - बैंक खाता विवरण"
        >
          <div className="tool-icon-wrap" aria-hidden="true">
            <svg className="tool-svg" viewBox="0 0 100 100">
              <rect
                x="18"
                y="24"
                width="64"
                height="52"
                rx="10"
                fill="#CCD5C0"
                stroke="#38422B"
                strokeWidth="4.5"
              />
              <line x1="18" y1="40" x2="82" y2="40" stroke="#38422B" strokeWidth="5" />
              <circle cx="36" cy="58" r="8" fill="#9FB873" stroke="#38422B" strokeWidth="3" />
              <path d="M52 58 L72 58" stroke="#38422B" strokeWidth="4" strokeLinecap="round" />
              <path d="M52 66 L66 66" stroke="#38422B" strokeWidth="3.5" strokeLinecap="round" />
            </svg>
          </div>
          <span className="tool-label">भुगतान स्थिति</span>
          <span className="tool-desc">डीबीटी व बैंक ट्रांसफर</span>
        </button>

        {/* 6. पात्रता (Eligibility) */}
        <button
          type="button"
          className="tool-btn"
          onClick={() => openServiceModal("eligibility")}
          aria-label="पात्रता - नियम व शर्तें जांचें"
        >
          <div className="tool-icon-wrap" aria-hidden="true">
            <svg className="tool-svg" viewBox="0 0 100 100">
              <rect
                x="22"
                y="16"
                width="56"
                height="68"
                rx="8"
                fill="#CCD5C0"
                stroke="#38422B"
                strokeWidth="4.5"
              />
              <circle cx="36" cy="34" r="6" fill="#9FB873" stroke="#38422B" strokeWidth="3" />
              <line x1="48" y1="34" x2="68" y2="34" stroke="#38422B" strokeWidth="4" strokeLinecap="round" />
              <circle cx="36" cy="50" r="6" fill="#9FB873" stroke="#38422B" strokeWidth="3" />
              <line x1="48" y1="50" x2="68" y2="50" stroke="#38422B" strokeWidth="4" strokeLinecap="round" />
              <path
                d="M30 68 L36 74 L48 62"
                stroke="#38422B"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <line x1="56" y1="68" x2="68" y2="68" stroke="#38422B" strokeWidth="4" strokeLinecap="round" />
            </svg>
          </div>
          <span className="tool-label">पात्रता</span>
          <span className="tool-desc">शर्तें व जरूरी दस्तावेज</span>
        </button>

        {/* 7. सहायता (Help) */}
        <button
          type="button"
          className="tool-btn"
          onClick={() => openServiceModal("help")}
          aria-label="सहायता - किसान कॉल सेंटर हेल्पलाइन"
        >
          <div className="tool-icon-wrap" aria-hidden="true">
            <svg className="tool-svg" viewBox="0 0 100 100">
              <path
                d="M24 55 C24 32 34 20 50 20 C66 20 76 32 76 55"
                stroke="#38422B"
                strokeWidth="5"
                fill="none"
                strokeLinecap="round"
              />
              <rect
                x="18"
                y="50"
                width="12"
                height="24"
                rx="6"
                fill="#CCD5C0"
                stroke="#38422B"
                strokeWidth="4"
              />
              <rect
                x="70"
                y="50"
                width="12"
                height="24"
                rx="6"
                fill="#CCD5C0"
                stroke="#38422B"
                strokeWidth="4"
              />
              <path
                d="M76 68 C76 78 68 84 54 84 L50 84"
                stroke="#38422B"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />
              <circle cx="46" cy="84" r="4" fill="#9FB873" stroke="#38422B" strokeWidth="2" />
            </svg>
          </div>
          <span className="tool-label">सहायता</span>
          <span className="tool-desc">टोल-फ्री 1800-180-1551</span>
        </button>

        {/* 8. मौसम (Weather) */}
        <button
          type="button"
          className="tool-btn"
          onClick={() => openServiceModal("weather")}
          aria-label="मौसम - 7 दिवस मौसम पूर्वानुमान"
        >
          <div className="tool-icon-wrap" aria-hidden="true">
            <svg className="tool-svg" viewBox="0 0 100 100">
              <circle cx="62" cy="38" r="16" fill="#9AA458" stroke="#38422B" strokeWidth="3.5" />
              <path
                d="M32 72 C22 72 16 64 16 54 C16 45 23 38 32 38 C35 30 43 24 53 24 C65 24 74 33 74 45 C78 45 82 49 82 55 C82 64 74 72 65 72 Z"
                fill="#CCD5C0"
                stroke="#38422B"
                strokeWidth="4.5"
              />
            </svg>
          </div>
          <span className="tool-label">मौसम</span>
          <span className="tool-desc">7 दिवस पूर्वानुमान</span>
        </button>
      </div>
    </section>
  );
}
