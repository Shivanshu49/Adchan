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

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/$/, "");
const MAX_RECORDING_MS = 59_000;


export default function VoiceComplaint({ matches }: VoiceComplaintProps) {
  const router = useRouter();
  const [state, setState] = useState<State>("idle");
  const [complaint, setComplaint] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [message, setMessage] = useState("");
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef(0);
  const stopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tickTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
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

  useEffect(() => () => {
    clearTimers();
    stopTracks();
  }, []);

  const diagnose = async (text: string) => {
    setState("diagnosing");
    const response = await fetch(`${API_URL}/diagnose`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ complaint: text, lang: "hi" }),
    });
    if (!response.ok) throw new Error("diagnose failed");
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
  };

  const sendRecording = async (blob: Blob, durationSeconds: number) => {
    setState("transcribing");
    setMessage("");
    const extension = blob.type.includes("ogg") ? "ogg" : blob.type.includes("mp4") ? "m4a" : "webm";
    const formData = new FormData();
    formData.append("audio", blob, `recording.${extension}`);
    formData.append("duration_seconds", String(Math.min(60, Math.max(0.1, durationSeconds))));
    const response = await fetch(`${API_URL}/transcribe`, { method: "POST", body: formData });
    if (!response.ok) throw new Error("transcription failed");
    const result = (await response.json()) as { text: string; provider: string };
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
        void sendRecording(blob, duration).catch(() => {
          setMessage("आवाज़ समझ नहीं आई। नीचे अपनी परेशानी लिखकर भेजें।");
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
      // Permission denial is deliberately quiet: focus the equivalent text path.
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
    } catch {
      setMessage("अभी जाँच नहीं हो पाई। थोड़ी देर बाद फिर कोशिश करें।");
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
