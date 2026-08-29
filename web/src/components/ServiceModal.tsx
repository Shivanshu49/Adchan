"use client";

import React, { useState } from "react";
import { useApp, ServiceKey } from "@/context/AppContext";
import { useRouter } from "next/navigation";

export default function ServiceModal() {
  const { modalData, closeModal } = useApp();
  const router = useRouter();

  const [aadhaarInput, setAadhaarInput] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [statusInput, setStatusInput] = useState("");

  if (!modalData.isOpen) return null;

  const handleStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (statusInput.trim()) {
      closeModal();
      router.push(`/status/${encodeURIComponent(statusInput.trim().toUpperCase())}`);
    }
  };

  const renderServiceContent = (key?: ServiceKey) => {
    switch (key) {
      case "status":
        return (
          <div className="modal-inner-content">
            <p className="mb-3 text-[18px]">
              अपनी पिछली एवं आगामी किस्तों का विवरण व बैंक अंतरण स्थिति जांचें।
            </p>
            <form onSubmit={handleStatusSubmit} className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="रजिस्ट्रेशन नंबर दर्ज करें (उदा. UP-DEMO-0001)"
                value={statusInput}
                onChange={(e) => setStatusInput(e.target.value)}
                className="modal-input"
                autoFocus
              />
              <button type="submit" className="modal-primary-btn">
                किस्त स्थिति देखें
              </button>
            </form>
            <div className="mt-4 rounded-xl border border-[var(--c-sage)] bg-[var(--c-card-tint)] p-3.5">
              <p className="font-semibold text-[var(--c-dark-olive)]">त्वरित नमूना नंबर:</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {["UP-DEMO-0001", "UP-DEMO-0002", "UP-DEMO-0003", "UP-DEMO-0004"].map((n) => (
                  <button
                    key={n}
                    type="button"
                    className="rounded-lg border border-[var(--c-sage)] bg-white px-2.5 py-1 text-sm font-mono font-semibold text-[var(--c-dark-olive)] hover:bg-[var(--c-leaf)]/20"
                    onClick={() => {
                      closeModal();
                      router.push(`/status/${n}`);
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case "ekyc":
        return (
          <div className="modal-inner-content">
            <p className="mb-3 text-[18px]">
              अपने 12 अंकों के आधार नंबर द्वारा OTP आधारित निःशुल्क e-KYC पूरा करें।
            </p>
            {!otpSent ? (
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  maxLength={12}
                  placeholder="12 अंकों का आधार नंबर दर्ज करें"
                  value={aadhaarInput}
                  onChange={(e) => setAadhaarInput(e.target.value.replace(/\D/g, ""))}
                  className="modal-input"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (aadhaarInput.length === 12) {
                      setOtpSent(true);
                    } else {
                      alert("कृपया 12 अंकों का वैध आधार नंबर दर्ज करें।");
                    }
                  }}
                  className="modal-primary-btn"
                >
                  OTP भेजें
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="rounded-xl border border-[#9FB873] bg-[#F2F5EB] p-3 text-center text-[#287C49] font-medium">
                  ✓ आधार लिंक्ड मोबाइल (******1234) पर 6-अंकों का OTP भेजा गया है।
                </div>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="6 अंकों का OTP दर्ज करें"
                  className="modal-input text-center font-mono tracking-widest text-xl"
                />
                <button
                  type="button"
                  onClick={() => {
                    alert("e-KYC सत्यापन सफल रहा! आपकी PM-KISAN किस्त सक्रिय है।");
                    closeModal();
                  }}
                  className="modal-primary-btn"
                >
                  सत्यापित करें
                </button>
              </div>
            )}
            <p className="mt-3 text-xs text-[var(--c-muted)]">
              * यदि बायोमेट्रिक से करना है तो नजदीकी जन सेवा केंद्र (CSC) पर संपर्क करें।
            </p>
          </div>
        );

      case "registration":
        return (
          <div className="modal-inner-content">
            <p className="mb-3 text-[18px]">
              नए किसान साथी PM-KISAN सम्मान निधि पोर्टल पर अपना पंजीकरण कराएं।
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert("पंजीकरण अनुरोध स्वीकार कर लिया गया है। राजस्व विभाग द्वारा सत्यापन किया जाएगा।");
                closeModal();
              }}
              className="flex flex-col gap-3"
            >
              <input
                type="text"
                required
                placeholder="किसान का पूरा नाम (आधार अनुसार)"
                className="modal-input"
              />
              <input
                type="tel"
                required
                placeholder="10 अंकों का मोबाइल नंबर"
                className="modal-input"
              />
              <input
                type="text"
                required
                placeholder="राज्य एवं जिला (उदा. उत्तर प्रदेश, लखनऊ)"
                className="modal-input"
              />
              <button type="submit" className="modal-primary-btn">
                पंजीकरण आगे बढ़ाएं
              </button>
            </form>
          </div>
        );

      case "schemes":
        return (
          <div className="modal-inner-content flex flex-col gap-3">
            <div className="rounded-xl border border-[var(--c-sage)] bg-[var(--c-card-tint)] p-3">
              <strong className="text-[var(--c-dark-olive)] text-[17px]">
                1. प्रधानमंत्री किसान सम्मान निधि (PM-KISAN)
              </strong>
              <p className="mt-1 text-sm text-[var(--c-muted)]">
                ₹6,000 प्रति वर्ष (₹2,000 की 3 समान किस्तों में) सीधे बैंक खाते में DBT द्वारा।
              </p>
            </div>
            <div className="rounded-xl border border-[var(--c-sage)] bg-[var(--c-card-tint)] p-3">
              <strong className="text-[var(--c-dark-olive)] text-[17px]">
                2. प्रधानमंत्री फसल बीमा योजना (PMFBY)
              </strong>
              <p className="mt-1 text-sm text-[var(--c-muted)]">
                बाढ़, सूखा व कीट प्रकोप से फसल क्षति पर न्यूनतम प्रीमियम में संपूर्ण बीमा सुरक्षा।
              </p>
            </div>
            <div className="rounded-xl border border-[var(--c-sage)] bg-[var(--c-card-tint)] p-3">
              <strong className="text-[var(--c-dark-olive)] text-[17px]">
                3. किसान क्रेडिट कार्ड (KCC)
              </strong>
              <p className="mt-1 text-sm text-[var(--c-muted)]">
                4% की सस्ती ब्याज दर पर ₹3 लाख तक कृषि कार्य हेतु आसान बैंक ऋण।
              </p>
            </div>
            <div className="rounded-xl border border-[var(--c-sage)] bg-[var(--c-card-tint)] p-3">
              <strong className="text-[var(--c-dark-olive)] text-[17px]">
                4. प्रधानमंत्री कृषि सिंचाई योजना
              </strong>
              <p className="mt-1 text-sm text-[var(--c-muted)]">
                ड्रिप व स्प्रिंकलर सूक्ष्म सिंचाई यंत्रों पर 55% तक सरकारी सब्सिडी।
              </p>
            </div>
          </div>
        );

      case "payment":
        return (
          <div className="modal-inner-content flex flex-col gap-3">
            <p className="text-[18px]">
              अपने बैंक खाते में भेजी गई सरकारी सहायता राशि का विवरण देखें।
            </p>
            <div className="rounded-xl border border-[var(--c-sage)] bg-[#F2F5EB] p-4 flex flex-col gap-2">
              <p>
                <strong>डीबीटी स्थिति:</strong>{" "}
                <span className="text-[#287C49] font-bold">सफल (Payment Success)</span>
              </p>
              <p>
                <strong>बैंक का नाम:</strong> स्टेट बैंक ऑफ इंडिया (SBI)
              </p>
              <p>
                <strong>खाता संख्या:</strong> ******3842
              </p>
              <p>
                <strong>NPCI मैपिंग:</strong> आधार लिंक्ड बैंक खाता
              </p>
              <p>
                <strong>अंतिम किस्त:</strong> ₹2,000 (17वीं किस्त जारी)
              </p>
            </div>
          </div>
        );

      case "eligibility":
        return (
          <div className="modal-inner-content flex flex-col gap-3">
            <p className="text-[18px]">
              PM-KISAN योजना के तहत लाभ पाने हेतु 3 अनिवार्य शर्तें:
            </p>
            <div className="rounded-xl border border-[var(--c-sage)] bg-[var(--c-card-tint)] p-3">
              <strong className="text-[var(--c-dark-olive)]">1. आधार e-KYC सत्यापन</strong>
              <p className="text-sm text-[var(--c-muted)] mt-1">
                OTP या बायोमेट्रिक द्वारा आधार सत्यापन अनिवार्य है।
              </p>
            </div>
            <div className="rounded-xl border border-[var(--c-sage)] bg-[var(--c-card-tint)] p-3">
              <strong className="text-[var(--c-dark-olive)]">2. भूमि रिकॉर्ड (Land Seeding)</strong>
              <p className="text-sm text-[var(--c-muted)] mt-1">
                जमीन की खतौनी भूलेख पोर्टल पर किसान के नाम दर्ज होनी चाहिए।
              </p>
            </div>
            <div className="rounded-xl border border-[var(--c-sage)] bg-[var(--c-card-tint)] p-3">
              <strong className="text-[var(--c-dark-olive)]">3. बैंक NPCI / DBT लिंकिंग</strong>
              <p className="text-sm text-[var(--c-muted)] mt-1">
                बैंक खाता आधार से NPCI मैपर पर सक्रिय रूप से जुड़ा होना चाहिए।
              </p>
            </div>
          </div>
        );

      case "help":
        return (
          <div className="modal-inner-content flex flex-col gap-3">
            <p className="text-[18px]">
              किसी भी सहायता, शिकायत या मार्गदर्शन हेतु सरकारी हेल्पलाइन:
            </p>
            <div className="rounded-xl border border-[var(--c-sage)] bg-[#F2F5EB] p-4 text-center">
              <span className="text-xs uppercase font-bold text-[var(--c-muted)] tracking-wider">
                किसान कॉल सेंटर (टोल-फ्री)
              </span>
              <p className="mt-1 text-2xl font-bold text-[var(--c-dark-olive)]">
                1800-180-1551
              </p>
              <p className="text-xs text-[var(--c-muted)] mt-1">सुबह 6:00 से रात 10:00 बजे तक</p>
              <a
                href="tel:18001801551"
                className="mt-3 inline-block rounded-lg bg-[var(--c-dark-olive)] px-4 py-2 text-white font-medium text-sm"
              >
                📞 तुरंत कॉल करें
              </a>
            </div>
            <div className="rounded-xl border border-[var(--c-sage)] bg-white p-3 text-sm">
              <p>
                <strong>PM-KISAN हेल्पलाइन:</strong> 155261 / 011-24300606
              </p>
              <p className="mt-1">
                <strong>ईमेल:</strong> pmkisan-ict@gov.in
              </p>
            </div>
          </div>
        );

      case "weather":
        return (
          <div className="modal-inner-content flex flex-col gap-3">
            <p className="text-[18px]">कृषि मौसम पूर्वानुमान (अगले 7 दिन):</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { day: "आज", temp: "31°C", cond: "धूप", rain: "0%" },
                { day: "कल", temp: "29°C", cond: "बादल", rain: "20%" },
                { day: "गुरु", temp: "27°C", cond: "हल्की बारिश", rain: "65%" },
                { day: "शुक्र", temp: "28°C", cond: "धूप", rain: "10%" },
              ].map((w) => (
                <div
                  key={w.day}
                  className="rounded-xl border border-[var(--c-sage)] bg-[var(--c-card-tint)] p-2.5 text-center"
                >
                  <p className="font-semibold text-sm">{w.day}</p>
                  <p className="text-lg font-bold text-[var(--c-dark-olive)]">{w.temp}</p>
                  <p className="text-xs text-[var(--c-muted)]">{w.cond}</p>
                  <p className="text-xs text-[#287C49] font-medium">वर्षा {w.rain}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-[var(--c-muted)] text-center">
              सलाह: गुरुवार को कीटनाशक छिड़काव से बचें।
            </p>
          </div>
        );

      case "crops":
        return (
          <div className="modal-inner-content flex flex-col gap-3">
            <p className="text-[18px]">वर्तमान ऋतु के प्रमुख फसल सुझाव:</p>
            <div className="rounded-xl border border-[var(--c-sage)] bg-[var(--c-card-tint)] p-3">
              <strong className="text-[var(--c-dark-olive)]">रबी फसलें (गेहूं, सरसों, चना)</strong>
              <p className="text-sm text-[var(--c-muted)] mt-1">
                उचित सिंचाई प्रबंधन और खरपतवार नियंत्रण समय पर करें।
              </p>
            </div>
            <div className="rounded-xl border border-[var(--c-sage)] bg-[var(--c-card-tint)] p-3">
              <strong className="text-[var(--c-dark-olive)]">जायद फसलें (मूंग, उड़द, सब्जियां)</strong>
              <p className="text-sm text-[var(--c-muted)] mt-1">
                उन्नत बीजों का चयन कर बुवाई शुरू करें।
              </p>
            </div>
          </div>
        );

      case "fertilizer":
        return (
          <div className="modal-inner-content flex flex-col gap-3">
            <p className="text-[18px]">उर्वरक एवं मृदा स्वास्थ्य प्रबंधन:</p>
            <div className="rounded-xl border border-[var(--c-sage)] bg-[#F2F5EB] p-3 text-sm">
              <p><strong>मृदा स्वास्थ्य कार्ड (Soil Health Card):</strong> मिट्टी जांच कराकर संतुलित मात्रा में ही यूरिया, डीएपी व पोटाश का उपयोग करें।</p>
              <p className="mt-2"><strong>नैनो यूरिया (Nano Urea):</strong> स्प्रे द्वारा छिड़काव से लागत कम व पैदावार अधिक मिलती है।</p>
            </div>
          </div>
        );

      case "calculator":
        return (
          <div className="modal-inner-content flex flex-col gap-3">
            <p className="text-[18px]">किसान सब्सिडी व किस्त कैलकुलेटर:</p>
            <div className="rounded-xl border border-[var(--c-sage)] bg-[var(--c-card-tint)] p-3 text-sm">
              <p>✓ <strong>PM-KISAN:</strong> ₹2,000 × 3 = ₹6,000 प्रति वर्ष</p>
              <p className="mt-1">✓ <strong>KCC लोन छूट:</strong> समय पर भुगतान पर 3% ब्याज अनुदान</p>
              <p className="mt-1">✓ <strong>ड्रिप सिंचाई यंत्र:</strong> 55% तक सरकारी सब्सिडी</p>
            </div>
          </div>
        );

      case "notifications":
        return (
          <div className="modal-inner-content flex flex-col gap-2 text-sm">
            <div className="rounded-xl border border-[var(--c-sage)] bg-[var(--c-card-tint)] p-3">
              <span className="text-xs font-bold text-[#287C49]">नया अपडेट</span>
              <p className="font-semibold text-[var(--c-dark-olive)]">18वीं किस्त के लिए e-KYC अनिवार्य</p>
              <p className="text-xs text-[var(--c-muted)]">सभी किसान अपना e-KYC समय रहते पूरा कराएं।</p>
            </div>
          </div>
        );

      case "videos":
        return (
          <div className="modal-inner-content flex flex-col gap-3 text-sm">
            <p className="text-[18px]">कृषि मार्गदर्शन वीडियो:</p>
            <div className="rounded-xl border border-[var(--c-sage)] bg-[var(--c-card-tint)] p-3">
              <strong className="text-[var(--c-dark-olive)]">1. घर बैठे मोबाइल से e-KYC कैसे करें</strong>
              <p className="text-xs text-[var(--c-muted)] mt-1">2 मिनट में आधार OTP द्वारा सत्यापन सीखें।</p>
            </div>
            <div className="rounded-xl border border-[var(--c-sage)] bg-[var(--c-card-tint)] p-3">
              <strong className="text-[var(--c-dark-olive)]">2. बैंक खाते में DBT चालू कराने का तरीका</strong>
              <p className="text-xs text-[var(--c-muted)] mt-1">NPCI मैपर पर बैंक खाता जोड़ने की पूरी प्रक्रिया।</p>
            </div>
          </div>
        );

      case "profile":
        return (
          <div className="modal-inner-content flex flex-col gap-3">
            <div className="flex items-center gap-3 rounded-xl border border-[var(--c-sage)] bg-[#F2F5EB] p-3">
              <div className="h-12 w-12 rounded-full bg-[var(--c-dark-olive)] text-white flex items-center justify-center font-bold text-xl">
                क
              </div>
              <div>
                <p className="font-bold text-[var(--c-dark-olive)]">किसान साथी</p>
                <p className="text-xs text-[var(--c-muted)]">पंजीकृत खाता विवरण</p>
              </div>
            </div>
            <p className="text-sm text-[var(--c-muted)]">
              अपने जमीन के दस्तावेज, बैंक खाता एवं परिवार के सदस्यों के आवेदन प्रबंधित करें।
            </p>
          </div>
        );

      default:
        return modalData.customContent;
    }
  };

  const getServiceTitle = (key?: ServiceKey) => {
    switch (key) {
      case "status":
        return "किस्त एवं आवेदन स्थिति";
      case "ekyc":
        return "आधार e-KYC सत्यापन";
      case "registration":
        return "नया किसान पंजीकरण";
      case "schemes":
        return "प्रमुख सरकारी कृषि योजनाएं";
      case "payment":
        return "भुगतान स्थिति एवं डीबीटी";
      case "eligibility":
        return "पात्रता एवं जरूरी दस्तावेज";
      case "help":
        return "किसान सहायता एवं हेल्पलाइन";
      case "weather":
        return "मौसम पूर्वानुमान";
      case "crops":
        return "फसल सलाह व मार्गदर्शन";
      case "fertilizer":
        return "उर्वरक एवं मृदा स्वास्थ्य";
      case "calculator":
        return "किसान कैलकुलेटर";
      case "notifications":
        return "नवीनतम सूचनाएं";
      case "videos":
        return "कृषि वीडियो ट्यूटोरियल";
      case "profile":
        return "मेरा किसान प्रोफाइल";
      default:
        return modalData.title || "विवरण";
    }
  };

  return (
    <div
      className="modal-backdrop active"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeModal();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="modal-window">
        <div className="modal-head">
          <h3 id="modal-title" className="text-xl font-bold text-[var(--c-dark-olive)]">
            {getServiceTitle(modalData.serviceKey)}
          </h3>
          <button
            type="button"
            className="modal-close-btn"
            onClick={closeModal}
            aria-label="बंद करें"
          >
            ×
          </button>
        </div>
        <div className="modal-body" id="modal-body">
          {renderServiceContent(modalData.serviceKey)}
        </div>
      </div>
    </div>
  );
}
