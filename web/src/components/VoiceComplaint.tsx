"use client";

import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type State = "idle" | "diagnosing";

interface DemoMatch {
  code: string;
  regNo: string;
}

interface VoiceComplaintProps {
  matches: readonly DemoMatch[];
}

interface DiagnosePayload {
  code: string;
  needsClarification: boolean;
  clarifyingQuestion?: string | null;
}

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
const ONLINE_REQUEST_TIMEOUT_MS = 60_000;
const WAKE_NOTICE_DELAY_MS = 3_000;


class ReviewApiError extends Error {
  constructor(readonly status: number) {
    super("diagnose request failed");
  }
}


function failureMessage(error: unknown) {
  if (error instanceof ReviewApiError && error.status === 429) {
    return "एक मिनट में बहुत ज़्यादा कोशिशें हुईं। थोड़ी देर रुकें; ऊपर के आठ नमूना निदान अभी भी पूरी तरह काम करते हैं।";
  }
  return "ऑनलाइन जाँच सेवा तक अभी पहुँचा नहीं जा सका। ऊपर के आठ नमूना नंबरों से तैयार निदान और अगला कदम अभी भी काम करते हैं।";
}


export default function VoiceComplaint({ matches }: VoiceComplaintProps) {
  const router = useRouter();
  const [state, setState] = useState<State>("idle");
  const [complaint, setComplaint] = useState("");
  const [message, setMessage] = useState("");
  const [showWakeNotice, setShowWakeNotice] = useState(false);
  const wakeNoticeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const complaintRef = useRef<HTMLTextAreaElement | null>(null);

  const startOnlineWait = () => {
    if (wakeNoticeTimerRef.current) clearTimeout(wakeNoticeTimerRef.current);
    setShowWakeNotice(false);
    wakeNoticeTimerRef.current = setTimeout(
      () => setShowWakeNotice(true),
      WAKE_NOTICE_DELAY_MS,
    );
  };

  const finishOnlineWait = () => {
    if (wakeNoticeTimerRef.current) clearTimeout(wakeNoticeTimerRef.current);
    wakeNoticeTimerRef.current = null;
    setShowWakeNotice(false);
  };

  const diagnose = async (text: string) => {
    setState("diagnosing");
    startOnlineWait();
    try {
      const response = await fetch(`${API_URL}/diagnose`, {
        method: "POST",
        signal: AbortSignal.timeout(ONLINE_REQUEST_TIMEOUT_MS),
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ complaint: text, lang: "hi" }),
      });
      if (!response.ok) throw new ReviewApiError(response.status);
      const result = (await response.json()) as DiagnosePayload;
      if (result.needsClarification) {
        setMessage(result.clarifyingQuestion ?? "कृपया अपनी परेशानी थोड़ी और साफ़ बताएँ।");
        setState("idle");
        complaintRef.current?.focus();
        return;
      }
      const match = matches.find((item) => item.code === result.code);
      if (!match) {
        setMessage("इस समस्या का डेमो रिकॉर्ड अभी उपलब्ध नहीं है। नीचे दिया कोई डेमो नंबर चुनें।");
        setState("idle");
        return;
      }
      router.push(`/status/${match.regNo}`);
    } finally {
      finishOnlineWait();
    }
  };

  const submitText = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = complaint.trim();
    if (!text) return complaintRef.current?.focus();
    setMessage("");
    try {
      await diagnose(text);
    } catch (error) {
      setMessage(failureMessage(error));
      setState("idle");
    }
  };

  const busy = state === "diagnosing";

  return (
    <div className="complaint-shell">
      <div className="complaint-panel">
        {showWakeNotice && (
          <div
            role="status"
            aria-live="polite"
            className="state-working mt-4 border-l-[8px] p-4"
          >
            <p className="section-label">ऑनलाइन सेवा शुरू हो रही है…</p>
            <p className="mt-2 text-[19px] font-semibold leading-[1.55]">
              मुफ़्त सेवा कुछ देर खाली रहने पर सो जाती है। पन्ना खुला रखें—
              आपकी बात मिल गई है और जाँच जारी है।
            </p>
            <p className="secondary-copy mt-2" lang="en">
              The free server is waking up. Keep this page open; you do not need to try again.
            </p>
          </div>
        )}

        <form onSubmit={submitText}>
          <label htmlFor="complaint" className="block text-[24px] font-semibold leading-[1.4]">
            अपनी परेशानी लिखें
            <span className="secondary-copy ml-2" lang="en">/ Type instead</span>
          </label>
          <textarea
            ref={complaintRef}
            id="complaint"
            value={complaint}
            onChange={(event) => setComplaint(event.target.value)}
            rows={4}
            maxLength={4000}
            placeholder="जैसे: पोर्टल पर eKYC बाकी दिखा रहा है…"
            className="complaint-textarea mt-3 w-full rounded-[14px] border-[3px] border-[var(--c-dark-olive)] bg-[var(--c-card-bg)] px-4 py-3 text-[19px] leading-[1.6] focus:outline-none"
          />
          <button
            type="submit"
            disabled={busy}
            className="primary-action mt-3 w-full disabled:cursor-wait disabled:opacity-60"
          >
            परेशानी की वजह खोजें
          </button>
        </form>
        {message && (
          <p className="state-working mt-4 p-4 text-[19px] font-semibold" role="status" aria-live="polite">
            {message}
          </p>
        )}
      </div>

      <button type="button" disabled className="voice-card">
        <span className="voice-mic" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="2" width="6" height="12" rx="3" />
            <path d="M5 10a7 7 0 0 0 14 0M12 17v5M8 22h8" />
          </svg>
        </span>
        <span>आवाज़ सेवा अभी उपलब्ध नहीं — नीचे लिखकर बताइए</span>
      </button>
    </div>
  );
}
