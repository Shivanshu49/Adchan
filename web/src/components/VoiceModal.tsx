"use client";

import React, { useEffect, useState, useRef } from "react";
import { useApp } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import personas from "@/types/personas";

export default function VoiceModal() {
  const { isVoiceOpen, closeVoice, openCustomModal } = useApp();
  const router = useRouter();

  const [statusText, setStatusText] = useState("आपकी बात सुनी जा रही है...");
  const [transcript, setTranscript] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  const handleSpokenIntent = React.useCallback(
    (text: string) => {
      closeVoice();
      const lower = text.toLowerCase();

      // Check if user spoke a demo number
      const demoMatch = text.match(/(UP-DEMO-000[1-8]|DEMO\s*[1-8]|[1-8])/i);
      if (demoMatch) {
        const num = demoMatch[0].replace(/\D/g, "");
        if (num && parseInt(num, 10) >= 1 && parseInt(num, 10) <= 8) {
          const reg = `UP-DEMO-000${num}`;
          router.push(`/status/${reg}`);
          return;
        }
      }

      // Check keywords for failure categories
      if (lower.includes("kyc") || lower.includes("आधार") || lower.includes("केवाईसी")) {
        router.push("/status/UP-DEMO-0001");
        return;
      } else if (lower.includes("बैंक") || lower.includes("खाता") || lower.includes("dbt") || lower.includes("npci")) {
        router.push("/status/UP-DEMO-0002");
        return;
      } else if (lower.includes("जमीन") || lower.includes("भूलेख") || lower.includes("land") || lower.includes("खतौनी")) {
        router.push("/status/UP-DEMO-0003");
        return;
      } else if (lower.includes("नाम") || lower.includes("स्पेलिंग")) {
        router.push("/status/UP-DEMO-0004");
        return;
      }

      // Default response modal
      openCustomModal(
        "आवाज़ से खोजी गई जानकारी",
        <div className="flex flex-col gap-3">
          <p className="text-[17px]">
            <strong>आपका सवाल:</strong> &ldquo;{text}&rdquo;
          </p>
          <div className="rounded-xl border border-[var(--c-sage)] bg-[#F2F5EB] p-4 text-[var(--c-ink)]">
            <p className="text-[#287C49] font-bold text-[18px]">
              ✓ कृषि सहायता एवं PM-KISAN मार्गदर्शन उपलब्ध है।
            </p>
            <p className="mt-2 text-sm text-[var(--c-muted)]">
              आप सीधे नीचे दिए गए नमूना किसान रिकॉर्ड्स को छूकर या अपना रजिस्ट्रेशन नंबर डालकर स्थिति देख सकते हैं।
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {personas.slice(0, 4).map((p) => (
                <button
                  key={p.regNo}
                  type="button"
                  className="rounded-lg border border-[var(--c-sage)] bg-white px-2.5 py-1 text-xs font-semibold text-[var(--c-dark-olive)]"
                  onClick={() => router.push(`/status/${p.regNo}`)}
                >
                  {p.name.hi} ({p.regNo})
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-[var(--c-muted)]">
              अधिक जानकारी हेतु किसान कॉल सेंटर <strong>1800-180-1551</strong> पर भी निःशुल्क संपर्क कर सकते हैं।
            </p>
          </div>
        </div>
      );
    },
    [closeVoice, openCustomModal, router]
  );

  useEffect(() => {
    if (!isVoiceOpen) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
        recognitionRef.current = null;
      }
      setTranscript("");
      setStatusText("आपकी बात सुनी जा रही है...");
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRec) {
      setStatusText("आपका ब्राउज़र वॉयस इनपुट को सपोर्ट नहीं करता। कृपया लिखकर खोजें।");
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.lang = "hi-IN";
      recognition.interimResults = true;
      recognition.continuous = false;

      recognition.onstart = () => {
        setStatusText("सुन रहे हैं... कृपया बोलिए 🎙️");
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        const spoken = event.results[0][0].transcript;
        setTranscript(spoken);
        setStatusText(`आपने कहा: "${spoken}"`);

        setTimeout(() => {
          if (spoken.length > 2) {
            handleSpokenIntent(spoken);
          }
        }, 1500);
      };

      recognition.onerror = () => {
        setStatusText("आवाज़ स्पष्ट नहीं आई, कृपया पुनः बोलें।");
      };

      recognition.onend = () => {
        // ended
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err) {
      console.warn("Speech API Error:", err);
      setStatusText("वॉयस असिस्टेंट शुरू करने में असमर्थ।");
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
        recognitionRef.current = null;
      }
    };
  }, [isVoiceOpen, handleSpokenIntent]);

  if (!isVoiceOpen) return null;

  return (
    <div
      className="voice-backdrop active"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeVoice();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="voice-heading"
    >
      <div className="voice-popup">
        <button
          type="button"
          className="voice-close-btn"
          onClick={closeVoice}
          aria-label="बंद करें"
        >
          ×
        </button>

        <div className="voice-orb" id="voice-orb" aria-hidden="true">
          <div className="v-ring v-ring-1"></div>
          <div className="v-ring v-ring-2"></div>
          <div className="v-orb-center">
            <span className="material-symbols-outlined text-3xl">mic</span>
          </div>
        </div>

        <h3 className="voice-modal-heading" id="voice-heading">
          बोलकर बताइए
        </h3>
        <p className="voice-modal-sub" id="voice-sub">
          {statusText}
        </p>

        {transcript && (
          <div className="mt-3 rounded-lg bg-[var(--c-card-tint)] border border-[var(--c-sage)] px-3 py-2 text-sm text-[var(--c-dark-olive)] font-medium">
            &ldquo;{transcript}&rdquo;
          </div>
        )}

        <div className="mt-4 flex flex-wrap justify-center gap-1.5 text-xs text-[var(--c-muted)]">
          <span>बोल कर देखें:</span>
          <span className="rounded bg-[#F2F5EB] px-2 py-0.5">&ldquo;मेरी किस्त क्यों नहीं आई&rdquo;</span>
          <span className="rounded bg-[#F2F5EB] px-2 py-0.5">&ldquo;e-KYC कैसे करें&rdquo;</span>
        </div>
      </div>
    </div>
  );
}
