"use client";

import { type FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { useLanguage } from "@/context/LanguageContext";


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

interface SpeechAlternativeLike {
  transcript: string;
}

interface SpeechResultLike {
  readonly isFinal: boolean;
  readonly 0: SpeechAlternativeLike;
}

interface SpeechResultListLike {
  readonly length: number;
  readonly [index: number]: SpeechResultLike;
}

interface SpeechResultEventLike extends Event {
  readonly resultIndex: number;
  readonly results: SpeechResultListLike;
}

interface SpeechErrorEventLike extends Event {
  readonly error: string;
}

interface BrowserSpeechRecognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onresult: ((event: SpeechResultEventLike) => void) | null;
  onerror: ((event: SpeechErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

type SpeechRecognitionConstructor = new () => BrowserSpeechRecognition;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
const ONLINE_REQUEST_TIMEOUT_MS = 60_000;
const WAKE_NOTICE_DELAY_MS = 3_000;


class ReviewApiError extends Error {
  constructor(readonly status: number) {
    super("diagnose request failed");
  }
}


export default function VoiceComplaint({ matches }: VoiceComplaintProps) {
  const router = useRouter();
  const { classifierLanguage, speechLocale, t } = useLanguage();
  const [state, setState] = useState<State>("idle");
  const [complaint, setComplaint] = useState("");
  const [message, setMessage] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceStatusKey, setVoiceStatusKey] = useState("voice.ready");
  const [showWakeNotice, setShowWakeNotice] = useState(false);
  const wakeNoticeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
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
        body: JSON.stringify({ complaint: text, lang: classifierLanguage }),
      });
      if (!response.ok) throw new ReviewApiError(response.status);
      const result = (await response.json()) as DiagnosePayload;
      if (result.needsClarification) {
        setMessage(result.clarifyingQuestion ?? t("voice.clarify"));
        setState("idle");
        complaintRef.current?.focus();
        return;
      }
      const match = matches.find((item) => item.code === result.code);
      if (!match) {
        setMessage(t("voice.noDemo"));
        setState("idle");
        return;
      }
      router.push(`/status/${match.regNo}`);
    } finally {
      finishOnlineWait();
    }
  };

  const stopListening = useCallback(() => {
    try {
      recognitionRef.current?.stop();
    } catch {
      // The browser may already have ended the recognition session.
    }
    recognitionRef.current = null;
    setListening(false);
  }, []);

  const startListening = () => {
    setExpanded(true);
    setMessage("");

    const Recognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Recognition) {
      setVoiceStatusKey("voice.unsupported");
      window.setTimeout(() => complaintRef.current?.focus(), 0);
      return;
    }

    stopListening();
    const recognition = new Recognition();
    recognition.lang = speechLocale;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setListening(true);
      setVoiceStatusKey("voice.listening");
    };

    recognition.onresult = (event) => {
      let spoken = "";
      let hasFinalResult = false;

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        spoken += result[0]?.transcript ?? "";
        hasFinalResult ||= result.isFinal;
      }

      const normalized = spoken.trim();
      if (normalized) setComplaint(normalized);
      if (hasFinalResult) {
        setVoiceStatusKey("voice.heard");
        setListening(false);
        window.setTimeout(() => complaintRef.current?.focus(), 0);
      }
    };

    recognition.onerror = (event) => {
      setListening(false);
      setVoiceStatusKey(
        event.error === "not-allowed" || event.error === "service-not-allowed"
          ? "voice.permission"
          : "voice.noSpeech",
      );
    };

    recognition.onend = () => {
      recognitionRef.current = null;
      setListening(false);
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      recognitionRef.current = null;
      setListening(false);
      setVoiceStatusKey("voice.noSpeech");
    }
  };

  useEffect(() => {
    return () => {
      try {
        recognitionRef.current?.abort();
      } catch {
        // Nothing to clean up when the browser has already stopped listening.
      }
      if (wakeNoticeTimerRef.current) clearTimeout(wakeNoticeTimerRef.current);
    };
  }, []);

  useEffect(() => {
    stopListening();
    setVoiceStatusKey("voice.ready");
  }, [speechLocale, stopListening]);

  const submitText = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = complaint.trim();
    if (!text) return complaintRef.current?.focus();
    setMessage("");
    try {
      await diagnose(text);
    } catch (error) {
      setMessage(
        error instanceof ReviewApiError && error.status === 429
          ? t("voice.rateLimit")
          : t("voice.serviceError"),
      );
      setState("idle");
    }
  };

  const busy = state === "diagnosing";

  return (
    <div className="complaint-shell">
      <button
        type="button"
        className={`voice-card voice-launch${listening ? " is-listening" : ""}`}
        aria-expanded={expanded}
        aria-controls="complaint-panel"
        onClick={listening ? stopListening : startListening}
      >
        <span className="voice-orbit" aria-hidden="true">
          <span className="voice-mic">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="2" width="6" height="12" rx="3" />
              <path d="M5 10a7 7 0 0 0 14 0M12 17v5M8 22h8" />
            </svg>
          </span>
        </span>
        <span className="voice-copy">
          <strong>{t("voice.heading")}</strong>
          <span>{t("voice.subtitle")}</span>
        </span>
        <span className="voice-cta">{listening ? t("voice.stop") : t("voice.start")}</span>
      </button>

      {expanded && (
        <div id="complaint-panel" className="complaint-panel" role="region" aria-label={t("voice.heading")}>
          <div className={`voice-input-status${listening ? " is-listening" : ""}`} role="status" aria-live="polite">
            <span className="voice-live-dot" aria-hidden="true" />
            <p>{t(voiceStatusKey)}</p>
            <button type="button" className="voice-retry-button" onClick={listening ? stopListening : startListening}>
              {listening ? t("voice.stop") : t("voice.retry")}
            </button>
            <button
              type="button"
              className="voice-close-button"
              onClick={() => {
                stopListening();
                setExpanded(false);
              }}
              aria-label={t("voice.close")}
              title={t("voice.close")}
            >
              ×
            </button>
          </div>

          {showWakeNotice && (
            <div role="status" aria-live="polite" className="state-working complaint-notice">
              <p className="section-label">{t("voice.waking")}</p>
              <p>{t("voice.wakingDetail")}</p>
            </div>
          )}

          <form onSubmit={submitText}>
            <label htmlFor="complaint">{t("voice.textLabel")}</label>
            <textarea
              ref={complaintRef}
              id="complaint"
              value={complaint}
              onChange={(event) => setComplaint(event.target.value)}
              rows={3}
              maxLength={4000}
              placeholder={t("voice.placeholder")}
              className="complaint-textarea"
            />
            <button type="submit" disabled={busy} className="primary-action complaint-submit">
              {busy ? t("voice.submitting") : t("voice.submit")}
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
