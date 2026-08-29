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
  const [expanded, setExpanded] = useState(false);
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
      <button
        type="button"
        className="voice-card voice-launch"
        aria-expanded={expanded}
        aria-controls="complaint-panel"
        onClick={() => {
          setExpanded((value) => !value);
          window.setTimeout(() => complaintRef.current?.focus(), 0);
        }}
      >
        <span className="voice-orbit" aria-hidden="true">
          <span className="voice-mic">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 18.5A3.5 3.5 0 0 1 8.5 15H16l3-3v8l-3-3H8.5A3.5 3.5 0 0 1 5 13.5v5Z" />
              <path d="m8 9 2 2 5-6" />
            </svg>
          </span>
        </span>
        <span className="voice-copy">
          <strong>अपनी परेशानी बताइए</strong>
          <span>टैप करें और हिंदी में लिखें</span>
        </span>
        <span className="voice-cta">{expanded ? "बंद करें" : "लिखें ✎"}</span>
      </button>

      {expanded && (
        <div id="complaint-panel" className="complaint-panel">
          {showWakeNotice && (
            <div role="status" aria-live="polite" className="state-working complaint-notice">
              <p className="section-label">ऑनलाइन सेवा शुरू हो रही है…</p>
              <p>पन्ना खुला रखें—आपकी बात मिल गई है और जाँच जारी है।</p>
            </div>
          )}

          <form onSubmit={submitText}>
            <label htmlFor="complaint">अपनी परेशानी लिखें</label>
            <textarea
              ref={complaintRef}
              id="complaint"
              value={complaint}
              onChange={(event) => setComplaint(event.target.value)}
              rows={3}
              maxLength={4000}
              placeholder="जैसे: पोर्टल पर eKYC बाकी दिखा रहा है…"
              className="complaint-textarea"
            />
            <button type="submit" disabled={busy} className="primary-action complaint-submit">
              {busy ? "जाँच हो रही है…" : "परेशानी की वजह खोजें"}
            </button>
          </form>
          {message && (
            <p className="state-working complaint-message" role="status" aria-live="polite">
              {message}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
