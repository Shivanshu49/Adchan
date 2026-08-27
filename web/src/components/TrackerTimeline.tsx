import MockBadge from "@/components/MockBadge";
import Link from "@/components/PlainLink";
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
    { label: "निदान मिला", en: "Diagnosed", detail: formatDate(record.createdAt), state: "done" },
    { label: "कदम पूरा", en: "Action taken", detail: record.markedDoneAt ? formatDate(record.markedDoneAt) : "अभी दर्ज नहीं", state: record.markedDoneAt ? "done" : "current" },
    { label: "समाधान की सामान्य तारीख़", en: `Usually ${failure.typicalDays} days`, detail: formatDate(expectedDate), state: "future" },
    { label: "अब भी अटका है?", en: "Still stuck?", detail: canEscalate ? "शिकायत का मसौदा तैयार है" : "इस तारीख़ के बाद शिकायत का रास्ता खुलेगा", state: canEscalate ? "alert" : "future" },
  ] as const;

  return (
    <section className="document-card" aria-labelledby="timeline-title">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--rule)] p-5 sm:p-6">
        <div>
          <p className="section-label">निदान से समाधान तक</p>
          <h2 id="timeline-title" className="mt-2 text-[28px] font-semibold">आपकी प्रगति</h2>
        </div>
        <MockBadge hi="नमूना tracker" />
      </div>

      <ol>
        {steps.map((step, index) => (
          <li key={step.en} className="grid grid-cols-[44px_1fr] gap-4 border-b border-[var(--rule)] p-5 last:border-b-0 sm:p-6">
            <span
              className={`flex h-11 w-11 items-center justify-center border-2 font-semibold ${
                step.state === "done"
                  ? "status-working"
                  : step.state === "alert"
                    ? "status-broken"
                    : "border-[var(--ink)]"
              }`}
              aria-hidden="true"
            >
              {step.state === "done" ? "✓" : index + 1}
            </span>
            <div>
              <h3 className="text-[22px] font-semibold leading-[1.4]">{step.label}</h3>
              <p className="secondary-copy mt-1" lang="en">{step.en}</p>
              <p className="mt-2 text-[19px]">{step.detail}</p>
              {index === 3 && canEscalate && (
                <Link href={`/tracker/${record.regNo}/escalate`} prefetch={false} className="primary-action mt-4 w-full">
                  शिकायत का मसौदा बनाएँ
                </Link>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
