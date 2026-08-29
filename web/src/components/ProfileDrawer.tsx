"use client";

import React from "react";
import { useApp, ServiceKey } from "@/context/AppContext";

export default function ProfileDrawer() {
  const { isDrawerOpen, closeDrawer, openServiceModal } = useApp();

  if (!isDrawerOpen) return null;

  const handleToolClick = (key: ServiceKey) => {
    closeDrawer();
    openServiceModal(key);
  };

  return (
    <>
      <div
        className="drawer-backdrop active"
        id="drawer-backdrop"
        onClick={closeDrawer}
        aria-hidden="true"
      />
      <aside
        className="profile-drawer open"
        id="profile-drawer"
        aria-label="प्रोफाइल एवं सभी सेवाएं"
      >
        <div className="drawer-header">
          <h3 className="drawer-title">मेरा प्रोफ़ाइल एवं सेवाएं</h3>
          <button
            type="button"
            className="drawer-close"
            id="drawer-close"
            onClick={closeDrawer}
            aria-label="ड्रॉवर बंद करें"
          >
            ×
          </button>
        </div>

        <div className="drawer-user-box">
          <div className="user-avatar-circle" aria-hidden="true">
            <span>क</span>
          </div>
          <div className="user-meta">
            <strong>किसान साथी</strong>
            <small>अपना खाता बनाएं / विवरण देखें</small>
          </div>
        </div>

        {/* All 12 Icons & Features */}
        <div className="drawer-12-container">
          <h4 className="drawer-subhead">सभी 12 सेवाएं</h4>

          <div className="drawer-grid-12">
            {/* 1. स्थिति */}
            <button
              type="button"
              className="d-tool-btn"
              onClick={() => handleToolClick("status")}
            >
              <div className="d-icon-box" aria-hidden="true">
                <svg className="d-svg" viewBox="0 0 100 100">
                  <path
                    d="M38 18 C38 14, 62 14, 62 18 C65 24, 69 28, 73 28 C78 28, 78 33, 75 37 C82 48, 85 64, 78 78 C71 90, 29 90, 22 78 C15 64, 18 48, 25 37 C22 33, 22 28, 27 28 C31 28, 35 24, 38 18 Z"
                    fill="#CCD5C0"
                    stroke="#38422B"
                    strokeWidth="4.5"
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
              <span>स्थिति</span>
            </button>

            {/* 2. e-KYC */}
            <button
              type="button"
              className="d-tool-btn"
              onClick={() => handleToolClick("ekyc")}
            >
              <div className="d-icon-box" aria-hidden="true">
                <svg className="d-svg" viewBox="0 0 100 100">
                  <path
                    d="M50 14 L78 26 C78 52, 68 76, 50 86 C32 76, 22 52, 22 26 Z"
                    fill="#CCD5C0"
                    stroke="#38422B"
                    strokeWidth="4.5"
                  />
                  <path
                    d="M36 50 L46 60 L65 38"
                    stroke="#38422B"
                    strokeWidth="5.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <span>e-KYC</span>
            </button>

            {/* 3. पंजीकरण */}
            <button
              type="button"
              className="d-tool-btn"
              onClick={() => handleToolClick("registration")}
            >
              <div className="d-icon-box" aria-hidden="true">
                <svg className="d-svg" viewBox="0 0 100 100">
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
                  <line x1="34" y1="32" x2="56" y2="32" stroke="#38422B" strokeWidth="4" />
                  <line x1="34" y1="44" x2="54" y2="44" stroke="#38422B" strokeWidth="4" />
                  <path
                    d="M56 78 L78 54 L84 60 L62 84 L54 86 Z"
                    fill="#9FB873"
                    stroke="#38422B"
                    strokeWidth="3"
                  />
                </svg>
              </div>
              <span>पंजीकरण</span>
            </button>

            {/* 4. योजनाएं */}
            <button
              type="button"
              className="d-tool-btn"
              onClick={() => handleToolClick("schemes")}
            >
              <div className="d-icon-box" aria-hidden="true">
                <svg className="d-svg" viewBox="0 0 100 100">
                  <path d="M50 16 L50 24" stroke="#38422B" strokeWidth="3" />
                  <path
                    d="M30 38 C30 25, 70 25, 70 38 Z"
                    fill="#CCD5C0"
                    stroke="#38422B"
                    strokeWidth="4"
                  />
                  <rect x="22" y="38" width="56" height="5" fill="#38422B" />
                  <rect x="14" y="76" width="72" height="7" fill="#38422B" rx="2" />
                </svg>
              </div>
              <span>योजनाएं</span>
            </button>

            {/* 5. फसल */}
            <button
              type="button"
              className="d-tool-btn"
              onClick={() => handleToolClick("crops")}
            >
              <div className="d-icon-box" aria-hidden="true">
                <svg className="d-svg" viewBox="0 0 100 100">
                  <path d="M50 82 L50 48" stroke="#38422B" strokeWidth="5" strokeLinecap="round" />
                  <path
                    d="M50 56 C32 56 22 42 22 28 C38 28 50 40 50 56 Z"
                    fill="#9FB873"
                    stroke="#38422B"
                    strokeWidth="4"
                  />
                  <path
                    d="M50 48 C68 48 78 34 78 20 C62 20 50 32 50 48 Z"
                    fill="#9FB873"
                    stroke="#38422B"
                    strokeWidth="4"
                  />
                  <ellipse cx="50" cy="84" rx="28" ry="6" fill="#38422B" />
                </svg>
              </div>
              <span>फसल</span>
            </button>

            {/* 6. मौसम */}
            <button
              type="button"
              className="d-tool-btn"
              onClick={() => handleToolClick("weather")}
            >
              <div className="d-icon-box" aria-hidden="true">
                <svg className="d-svg" viewBox="0 0 100 100">
                  <circle cx="62" cy="38" r="16" fill="#9AA458" stroke="#38422B" strokeWidth="3.5" />
                  <path
                    d="M32 72 C22 72 16 64 16 54 C16 45 23 38 32 38 C35 30 43 24 53 24 C65 24 74 33 74 45 C78 45 82 49 82 55 C82 64 74 72 65 72 Z"
                    fill="#CCD5C0"
                    stroke="#38422B"
                    strokeWidth="4.5"
                  />
                </svg>
              </div>
              <span>मौसम</span>
            </button>

            {/* 7. उर्वरक */}
            <button
              type="button"
              className="d-tool-btn"
              onClick={() => handleToolClick("fertilizer")}
            >
              <div className="d-icon-box" aria-hidden="true">
                <svg className="d-svg" viewBox="0 0 100 100">
                  <path
                    d="M34 22 C34 16 66 16 66 22 L76 34 L76 80 C76 86 66 88 50 88 C34 88 24 86 24 80 L24 34 Z"
                    fill="#CCD5C0"
                    stroke="#38422B"
                    strokeWidth="4.5"
                  />
                  <ellipse cx="50" cy="56" rx="14" ry="18" fill="#9FB873" stroke="#38422B" strokeWidth="3.5" />
                </svg>
              </div>
              <span>उर्वरक</span>
            </button>

            {/* 8. कैलकुलेटर */}
            <button
              type="button"
              className="d-tool-btn"
              onClick={() => handleToolClick("calculator")}
            >
              <div className="d-icon-box" aria-hidden="true">
                <svg className="d-svg" viewBox="0 0 100 100">
                  <rect
                    x="24"
                    y="16"
                    width="52"
                    height="68"
                    rx="10"
                    fill="#CCD5C0"
                    stroke="#38422B"
                    strokeWidth="4.5"
                  />
                  <rect x="32" y="25" width="36" height="15" rx="4" fill="#38422B" />
                  <circle cx="37" cy="50" r="4" fill="#38422B" />
                  <circle cx="50" cy="50" r="4" fill="#38422B" />
                  <circle cx="63" cy="50" r="4" fill="#38422B" />
                  <circle cx="50" cy="62" r="4" fill="#38422B" />
                  <circle cx="63" cy="74" r="4" fill="#9FB873" />
                </svg>
              </div>
              <span>कैलकुलेटर</span>
            </button>

            {/* 9. सूचनाएं */}
            <button
              type="button"
              className="d-tool-btn"
              onClick={() => handleToolClick("notifications")}
            >
              <div className="d-icon-box" aria-hidden="true">
                <svg className="d-svg" viewBox="0 0 100 100">
                  <path
                    d="M22 42 L38 34 L66 22 L66 78 L38 66 L22 58 Z"
                    fill="#CCD5C0"
                    stroke="#38422B"
                    strokeWidth="4.5"
                  />
                  <path
                    d="M38 66 L38 84 C38 86 34 88 30 88 L26 88 L26 60"
                    stroke="#38422B"
                    strokeWidth="4"
                  />
                </svg>
              </div>
              <span>सूचनाएं</span>
            </button>

            {/* 10. सहायता */}
            <button
              type="button"
              className="d-tool-btn"
              onClick={() => handleToolClick("help")}
            >
              <div className="d-icon-box" aria-hidden="true">
                <svg className="d-svg" viewBox="0 0 100 100">
                  <path
                    d="M24 55 C24 35 34 22 50 22 C66 22 76 35 76 55"
                    stroke="#38422B"
                    strokeWidth="5"
                    fill="none"
                  />
                  <rect x="18" y="52" width="12" height="22" rx="6" fill="#38422B" />
                  <rect x="70" y="52" width="12" height="22" rx="6" fill="#38422B" />
                </svg>
              </div>
              <span>सहायता</span>
            </button>

            {/* 11. वीडियो */}
            <button
              type="button"
              className="d-tool-btn"
              onClick={() => handleToolClick("videos")}
            >
              <div className="d-icon-box" aria-hidden="true">
                <svg className="d-svg" viewBox="0 0 100 100">
                  <rect x="18" y="26" width="64" height="48" rx="12" fill="#38422B" />
                  <polygon points="44,38 64,50 44,62" fill="#FFFFFF" />
                </svg>
              </div>
              <span>वीडियो</span>
            </button>

            {/* 12. प्रोफाइल */}
            <button
              type="button"
              className="d-tool-btn"
              onClick={() => handleToolClick("profile")}
            >
              <div className="d-icon-box" aria-hidden="true">
                <svg className="d-svg" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="36" fill="#CCD5C0" stroke="#38422B" strokeWidth="4.5" />
                  <circle cx="50" cy="40" r="14" fill="#38422B" />
                  <path d="M26 74 C28 60 38 56 50 56 C62 56 72 60 74 74" fill="#38422B" />
                </svg>
              </div>
              <span>प्रोफाइल</span>
            </button>
          </div>
        </div>

        <div className="drawer-bottom-action">
          <button
            type="button"
            className="drawer-login-btn"
            onClick={() => {
              alert("लॉग इन / साइन अप प्रोटोटाइप डेमो");
            }}
          >
            लॉग इन / साइन अप
          </button>
        </div>
      </aside>
    </>
  );
}
