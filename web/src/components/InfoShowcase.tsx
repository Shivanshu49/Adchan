"use client";

import React from "react";
import { useApp } from "@/context/AppContext";

export default function InfoShowcase() {
  const { openServiceModal } = useApp();

  return (
    <section
      className="info-showcase-section"
      id="schemes-section"
      aria-label="योजनाएं एवं किसान मार्गदर्शन"
    >
      <div className="info-grid desktop-details">
        {/* Card 1: Featured Schemes */}
        <div className="info-card">
          <div className="info-card-header">
            <span className="material-symbols-outlined info-card-ico" aria-hidden="true">
              account_balance
            </span>
            <h3 className="info-card-title">प्रमुख योजनाएं</h3>
          </div>
          <ul className="info-card-list">
            <li>
              <strong>प्रधानमंत्री किसान सम्मान निधि</strong>
              <span>₹6,000 प्रति वर्ष 3 बराबर किस्तों में सीधे खाते में।</span>
            </li>
            <li>
              <strong>प्रधानमंत्री फसल बीमा योजना</strong>
              <span>प्राकृतिक आपदा से फसल सुरक्षा व तुरंत दावा निपटान।</span>
            </li>
            <li>
              <strong>किसान क्रेडिट कार्ड (KCC)</strong>
              <span>कम ब्याज पर ₹3 लाख तक आसान ऋण सुविधा।</span>
            </li>
          </ul>
          <button
            type="button"
            className="info-card-action"
            onClick={() => openServiceModal("schemes")}
          >
            सभी योजनाएं देखें →
          </button>
        </div>

        {/* Card 2: Eligibility & Checklist */}
        <div className="info-card">
          <div className="info-card-header">
            <span className="material-symbols-outlined info-card-ico" aria-hidden="true">
              fact_check
            </span>
            <h3 className="info-card-title">पात्रता एवं जरूरी दस्तावेज</h3>
          </div>
          <ul className="info-card-list">
            <li>
              <strong>आधार कार्ड लिंक</strong>
              <span>मोबाइल नंबर से जुड़ा सक्रिय आधार कार्ड आवश्यक है।</span>
            </li>
            <li>
              <strong>जमीन की खतौनी / दस्तावेज</strong>
              <span>कृषि योग्य भूमि का सही व अद्यतन भू-अभिलेख।</span>
            </li>
            <li>
              <strong>बैंक खाता (NPCI एक्टिव)</strong>
              <span>DBT सक्रिय बैंक खाता ताकि राशि समय पर पहुंचे।</span>
            </li>
          </ul>
          <button
            type="button"
            className="info-card-action"
            onClick={() => openServiceModal("eligibility")}
          >
            पात्रता जांचें →
          </button>
        </div>
      </div>
    </section>
  );
}
