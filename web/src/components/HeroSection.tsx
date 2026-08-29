"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";

export default function HeroSection() {
  const [regNo, setRegNo] = useState("");
  const router = useRouter();
  const { openVoice } = useApp();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = regNo.trim().toUpperCase();
    if (query) {
      router.push(`/status/${encodeURIComponent(query)}`);
    }
  };

  return (
    <section className="hero-section" id="home" aria-label="मुख्य परिचय">
      <div className="hero-grid">
        {/* Left Column: Heading, Subtitle & Search Form */}
        <div className="hero-left-col">
          <div className="hero-welcome-badge">
            <span className="badge-dot" aria-hidden="true"></span>
            <span>डिजिटल किसान सेवा केंद्र</span>
          </div>

          <h1 className="hero-title">
            नमस्ते किसान! <span className="wave-emoji" aria-hidden="true">👋</span>
          </h1>
          <p className="hero-subtext">
            PM-KISAN किस्त कहाँ रुकी और अब क्या करना है—साफ़ हिंदी में जानिए।
          </p>

          {/* Compact Registration Search Area */}
          <div className="registration-card">
            <div className="reg-title-row">
              <span className="material-symbols-outlined reg-icon" aria-hidden="true">
                badge
              </span>
              <h2 className="reg-title">रजिस्ट्रेशन नंबर डालिए</h2>
            </div>

            <form className="reg-form" onSubmit={handleSearch}>
              <div className="reg-input-wrapper">
                <span className="material-symbols-outlined reg-search-ico" aria-hidden="true">
                  search
                </span>
                <input
                  type="text"
                  id="reg-input"
                  className="reg-input"
                  placeholder="रजिस्ट्रेशन नंबर (उदा. UP-DEMO-0001)"
                  value={regNo}
                  onChange={(e) => setRegNo(e.target.value)}
                  autoComplete="off"
                  spellCheck={false}
                  aria-label="रजिस्ट्रेशन नंबर दर्ज करें"
                />
              </div>
              <button type="submit" className="reg-submit-btn">
                खोजें
              </button>
            </form>

            <div className="reg-footer-note">
              <span className="material-symbols-outlined lock-ico" aria-hidden="true">
                verified_user
              </span>
              <span id="form-note">🔒 कोई लॉगिन नहीं। कोई कैप्चा नहीं। आपकी जानकारी सुरक्षित है।</span>
            </div>
          </div>
        </div>

        {/* Right Column: Visual Banner + Compact Prominent Voice Card */}
        <div className="hero-right-col">
          <div className="hero-banner-box">
            <Image
              src="/kishan-banner-250px.png"
              alt="नमस्ते किसान! आसान जानकारी, सही समय पर"
              width={280}
              height={220}
              className="hero-banner-img"
              priority
            />
          </div>

          {/* Prominent Voice Action Card */}
          <button
            type="button"
            className="voice-card"
            id="voice-btn"
            onClick={openVoice}
            aria-label="बोलकर बताइए - आवाज से सहायता प्राप्त करें"
          >
            <div className="voice-waves-icon" aria-hidden="true">
              <span className="v-wave"></span>
              <span className="v-wave"></span>
              <div className="v-mic">
                <span className="material-symbols-outlined">mic</span>
              </div>
            </div>
            <div className="voice-copy">
              <span className="voice-heading">बोलकर बताइए</span>
              <span className="voice-subheading">माइक दबाएं और अपनी समस्या बोलें</span>
            </div>
            <div className="voice-badge-action" aria-hidden="true">
              <span>बोलें 🎙️</span>
            </div>
          </button>
        </div>
      </div>
    </section>
  );
}
