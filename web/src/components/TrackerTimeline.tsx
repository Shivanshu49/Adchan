import Link from "next/link";

import MockBadge from "@/components/MockBadge";
import type { TrackerRecord } from "@/lib/tracker-api";
import type { Failure } from "@/types/failures";


interface TrackerTimelineProps {
  record: TrackerRecord;
  failure: Failure;
}


function addDays(value: string, days: number) {
  const date = new Date(value);
  date.setUTCDate(date.getUTCDate() + days);
  return date;
}


function formatDate(value: string | Date) {
  return new Intl.DateTimeFormat("hi-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(typeof value === "string" ? new Date(value) : value);
}


export function escalationIsAvailable(record: TrackerRecord, failure: Failure) {
  return !record.markedDoneAt && addDays(record.createdAt, failure.typicalDays).getTime() <= Date.now();
}


export default function TrackerTimeline({ record, failure }: TrackerTimelineProps) {
  const expectedDate = addDays(record.markedDoneAt ?? record.createdAt, failure.typicalDays);
  const canEscalate = escalationIsAvailable(record, failure);
  const steps = [
    {
      label: "निदान मिला",
      en: "Diagnosed",
      detail: formatDate(record.createdAt),
      state: "done",
    },
    {
      label: "कदम पूरा",
      en: "Action taken",
      detail: record.markedDoneAt ? formatDate(record.markedDoneAt) : "अभी दर्ज नहीं",
      state: record.markedDoneAt ? "done" : "current",
    },
    {
      label: "अपेक्षित समाधान",
      en: `Typical: ${failure.typicalDays} days`,
      detail: formatDate(expectedDate),
      state: "future",
    },
    {
      label: "अब भी अटका है?",
      en: "Still stuck?",
      detail: canEscalate ? "शिकायत draft तैयार है" : `इस तारीख़ के बाद escalation खुलेगा`,
      state: canEscalate ? "alert" : "future",
    },
  ] as const;

  return (
    <section className="border-2 border-[#1d2330] bg-[#fffdf7] shadow-[6px_6px_0_#1d2330]" aria-labelledby="timeline-title">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#1d2330] bg-[#f0c95a] px-5 py-4">
        <div>
          <p className="font-mono text-[16px] font-black tracking-[0.12em]">DIAGNOSED → RESOLVED</p>
          <h2 id="timeline-title" className="mt-1 text-3xl font-black">आपकी प्रगति</h2>
        </div>
        <MockBadge hi="नमूना tracker" en="MOCKED" tone="ink" />
      </div>

      <ol className="grid gap-0 md:grid-cols-4">
        {steps.map((step, index) => (
          <li key={step.en} className="relative border-b-2 border-[#1d2330] p-5 last:border-b-0 md:border-b-0 md:border-r-2 md:last:border-r-0">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#1d2330] font-mono text-[18px] font-black ${
                step.state === "done"
                  ? "bg-[#14633f] text-white"
                  : step.state === "alert"
                    ? "bg-[#8f2d24] text-white"
                    : step.state === "current"
                      ? "bg-[#f0c95a] text-[#1d2330]"
                      : "bg-[#e5ded1] text-[#1d2330]"
              }`}
            >
              {step.state === "done" ? "✓" : index + 1}
            </div>
            <h3 className="mt-4 text-[22px] font-black leading-tight">{step.label}</h3>
            <p className="mt-1 text-[16px] font-bold text-[#5a554d]" lang="en">{step.en}</p>
            <p className="mt-3 text-[18px] leading-relaxed">{step.detail}</p>
            {index === 3 && canEscalate && (
              <Link
                href={`/tracker/${record.regNo}/escalate`}
                prefetch={false}
                className="mt-4 flex min-h-12 items-center justify-center bg-[#8f2d24] px-4 py-2 text-center text-[18px] font-black text-white shadow-[3px_3px_0_#1d2330] focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#f0c95a]"
              >
                शिकायत draft बनाएँ →
              </Link>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
