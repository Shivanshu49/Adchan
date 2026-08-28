"use client";

import MockBadge from "@/components/MockBadge";
import { useOptimisticTracker } from "@/components/TrackerOptimisticProvider";


function formatReminder(value: string) {
  return new Intl.DateTimeFormat("hi-IN", {
    dateStyle: "long",
    timeZone: "Asia/Kolkata",
  }).format(new Date(value));
}


export default function OptimisticReminder({ defaultDate }: { defaultDate: string }) {
  const {
    record,
    reminderPending,
    reminderMessage,
    reminderError,
    saveReminder,
  } = useOptimisticTracker();

  return (
    <section className="document-card mt-8 p-5 sm:p-6" aria-labelledby="reminder-title">
      <div className="flex flex-wrap items-center gap-2">
        <h2 id="reminder-title" className="text-[28px] font-semibold">कब दोबारा देखना है?</h2>
        <MockBadge hi="नमूना reminder" />
      </div>
      <p className="mt-3 text-[19px] leading-[1.6]">
        यह केवल तारीख़ रखता है; SMS या WhatsApp संदेश नहीं भेजता।
      </p>
      {record.reminderAt && (
        <p className="status-working mt-3 text-[19px] font-semibold">
          सेव तारीख़: {formatReminder(record.reminderAt)}
        </p>
      )}
      <form onSubmit={saveReminder} className="mt-5 grid gap-4">
        <label className="text-[19px] font-semibold">
          तारीख़
          <input
            type="date"
            name="reminderDate"
            required
            defaultValue={defaultDate}
            className="mt-2 block min-h-14 w-full rounded-[14px] border-2 border-[var(--c-ink)] bg-[var(--c-card-bg)] px-3 py-2 text-[19px]"
          />
        </label>
        <button type="submit" disabled={reminderPending} className="primary-action w-full disabled:cursor-wait disabled:opacity-75">
          {reminderPending ? "सेव हो रहा है…" : "तारीख़ याद रखें"}
        </button>
      </form>
      {reminderMessage && (
        <p
          role="status"
          aria-live="polite"
          className={`${reminderError ? "state-broken" : "state-working"} mt-4 p-3 text-[17px] font-semibold`}
        >
          {reminderMessage}
        </p>
      )}
    </section>
  );
}
