"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type State = "idle" | "recording" | "transcribing" | "diagnosing";

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
const MAX_RECORDING_MS = 59_000;
const ONLINE_REQUEST_TIMEOUT_MS = 60_000;
const WAKE_NOTICE_DELAY_MS = 3_000;


class ReviewApiError extends Error {
  constructor(readonly status: number, readonly stage: "diagnose" | "transcribe") {
    super(`${stage} request failed`);
  }
}


function failureMessage(error: unknown, stage: "diagnose" | "transcribe") {
  if (error instanceof ReviewApiError && error.status === 429) {
    return "एक मिनट में बहुत ज़्यादा कोशिशें हुईं। थोड़ी देर रुकें; ऊपर के आठ नमूना निदान अभी भी पूरी तरह काम करते हैं।";
  }
  if (stage === "transcribe") {
    return "आवाज़ की ऑनलाइन सेवा अभी उपलब्ध नहीं है। नीचे लिखकर कोशिश करें; ऊपर के आठ नमूना निदान भी काम करते हैं।";
  }
  return "ऑनलाइन जाँच सेवा तक अभी पहुँचा नहीं जा सका। ऊपर के आठ नमूना नंबरों से तैयार निदान और अगला कदम अभी भी काम करते हैं।";
}


export default function VoiceComplaint({ matches }: VoiceComplaintProps) {
  const router = useRouter();
  const [state, setState] = useState<State>("idle");
  const [complaint, setComplaint] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [message, setMessage] = useState("");
  const [showWakeNotice, setShowWakeNotice] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef(0);
  const stopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tickTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wakeNoticeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const complaintRef = useRef<HTMLTextAreaElement | null>(null);

  const clearTimers = () => {
    if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
    if (tickTimerRef.current) clearInterval(tickTimerRef.current);
    stopTimerRef.current = null;
    tickTimerRef.current = null;
  };

  const stopTracks = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

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

  useEffect(() => () => {
    clearTimers();
    if (wakeNoticeTimerRef.current) clearTimeout(wakeNoticeTimerRef.current);
    stopTracks();
  }, []);

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
      if (!response.ok) throw new ReviewApiError(response.status, "diagnose");
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

  const sendRecording = async (blob: Blob, durationSeconds: number) => {
    setState("transcribing");
    setMessage("");
    startOnlineWait();
    const extension = blob.type.includes("ogg") ? "ogg" : blob.type.includes("mp4") ? "m4a" : "webm";
    const formData = new FormData();
    formData.append("audio", blob, `recording.${extension}`);
    formData.append("duration_seconds", String(Math.min(60, Math.max(0.1, durationSeconds))));
    let result: { text: string; provider: string };
    try {
      const response = await fetch(`${API_URL}/transcribe`, {
        method: "POST",
        body: formData,
        signal: AbortSignal.timeout(ONLINE_REQUEST_TIMEOUT_MS),
      });
      if (!response.ok) throw new ReviewApiError(response.status, "transcribe");
      result = (await response.json()) as { text: string; provider: string };
    } finally {
      finishOnlineWait();
    }
    setComplaint(result.text);
    await diagnose(result.text);
  };

  const stopRecording = () => {
    clearTimers();
    const recorder = recorderRef.current;
    if (recorder?.state === "recording") recorder.stop();
    stopTracks();
  };

  const startRecording = async () => {
    setMessage("");
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setMessage("इस ब्राउज़र में माइक्रोफ़ोन रिकॉर्डिंग उपलब्ध नहीं है। नीचे लिखें; ऊपर के आठ नमूना निदान भी काम करते हैं।");
      complaintRef.current?.focus();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const preferredTypes = ["audio/webm;codecs=opus", "audio/ogg;codecs=opus", "audio/mp4"];
      const mimeType = preferredTypes.find((type) => MediaRecorder.isTypeSupported(type));
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      recorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const duration = (Date.now() - startedAtRef.current) / 1000;
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        recorderRef.current = null;
        void sendRecording(blob, duration).catch((error: unknown) => {
          const stage = error instanceof ReviewApiError ? error.stage : "transcribe";
          setMessage(failureMessage(error, stage));
          setState("idle");
          complaintRef.current?.focus();
        });
      };
      startedAtRef.current = Date.now();
      setSeconds(0);
      setState("recording");
      recorder.start(500);
      tickTimerRef.current = setInterval(
        () => setSeconds(Math.floor((Date.now() - startedAtRef.current) / 1000)),
        1000,
      );
      stopTimerRef.current = setTimeout(stopRecording, MAX_RECORDING_MS);
    } catch {
      setMessage("माइक्रोफ़ोन की अनुमति नहीं मिली। नीचे लिखकर बताएँ; ऊपर के आठ नमूना निदान भी काम करते हैं।");
      setState("idle");
      complaintRef.current?.focus();
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
      setMessage(failureMessage(error, "diagnose"));
      setState("idle");
    }
  };

  const busy = state === "transcribing" || state === "diagnosing";
  const buttonText = state === "recording"
    ? `रिकॉर्डिंग रोकें · ${seconds}s`
    : state === "transcribing"
      ? "आवाज़ लिखी जा रही है…"
      : state === "diagnosing"
        ? "अड़चन खोजी जा रही है…"
        : "बोलकर परेशानी बताएँ";

  return (
    <div className="document-card p-5 sm:p-6">
      <button
        type="button"
        onClick={state === "recording" ? stopRecording : startRecording}
        disabled={busy}
        className="flex min-h-[72px] w-full items-center justify-center gap-3 rounded-[4px] border-2 border-[var(--ink)] bg-[var(--ink)] px-5 py-4 text-[21px] font-semibold text-[var(--surface)] disabled:cursor-wait disabled:opacity-60"
        aria-pressed={state === "recording"}
      >
        <span aria-hidden="true" className="text-[26px]">{state === "recording" ? "■" : "●"}</span>
        {buttonText}
      </button>
      <p className="mt-3 text-[19px] leading-[1.6]">
        अधिकतम 60 सेकंड। माइक्रोफ़ोन न चले तो नीचे लिखें।
      </p>

      {showWakeNotice && (
        <div
          role="status"
          aria-live="polite"
          className="state-working mt-4 border-l-[8px] p-4"
        >
          <p className="section-label text-[var(--working)]">ऑनलाइन सेवा शुरू हो रही है…</p>
          <p className="mt-2 text-[19px] font-semibold leading-[1.55]">
            मुफ़्त सेवा कुछ देर खाली रहने पर सो जाती है। पन्ना खुला रखें—
            {state === "transcribing"
              ? "आपकी आवाज़ भेजी जा रही है, दोबारा बोलने की ज़रूरत नहीं।"
              : "आपकी बात मिल गई है और जाँच जारी है।"}
          </p>
          <p className="secondary-copy mt-2" lang="en">
            The free server is waking up. Keep this page open; you do not need to try again.
          </p>
        </div>
      )}

      <form onSubmit={submitText} className="mt-5 border-t border-[var(--rule)] pt-5">
        <label htmlFor="complaint" className="block text-[19px] font-semibold">
          या अपनी परेशानी लिखें
          <span className="secondary-copy ml-2" lang="en">/ Type instead</span>
        </label>
        <textarea
          ref={complaintRef}
          id="complaint"
          value={complaint}
          onChange={(event) => setComplaint(event.target.value)}
          rows={3}
          maxLength={4000}
          placeholder="जैसे: पोर्टल पर eKYC बाकी दिखा रहा है…"
          className="mt-3 w-full rounded-[4px] border-2 border-[var(--ink)] bg-[var(--surface)] px-4 py-3 text-[19px] leading-[1.6] placeholder:text-[var(--ink)] placeholder:opacity-60"
        />
        <button
          type="submit"
          disabled={busy || state === "recording"}
          className="mt-3 flex min-h-14 w-full items-center justify-center rounded-[4px] border-2 border-[var(--ink)] bg-[var(--surface)] px-5 py-3 text-[19px] font-semibold text-[var(--ink)] disabled:cursor-wait disabled:opacity-60"
        >
          परेशानी की वजह खोजें
        </button>
      </form>
      <p className="mt-3 min-h-8 text-[19px] font-semibold" role="status" aria-live="polite">
        {message}
      </p>
    </div>
  );
}
