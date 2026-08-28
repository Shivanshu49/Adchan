"use client";

import MockBadge from "@/components/MockBadge";
import { useOptimisticTracker } from "@/components/TrackerOptimisticProvider";


function formatDoneAt(value: string) {
  return new Intl.DateTimeFormat("hi-IN", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(new Date(value));
}


export default function OptimisticDoneControl() {
  const { record, doneMessage, doneError, markDone } = useOptimisticTracker();

  return (
    <div>
      <MockBadge hi="नमूना tracker" />
      {record.markedDoneAt ? (
        <>
          <p className="status-working mt-3 text-[26px] font-semibold">आपने यह कदम पूरा किया</p>
          <p className="mt-2 text-[19px]">दर्ज समय: {formatDoneAt(record.markedDoneAt)}</p>
        </>
      ) : (
        <>
          <h3 className="mt-3 text-[26px] font-semibold">दफ़्तर वाला काम पूरा हो गया?</h3>
          <p className="mt-2 text-[19px]">पूरा होने पर तारीख़ प्रगति में जुड़ जाएगी।</p>
          <button type="button" onClick={markDone} className="primary-action mt-5 w-full">
            मैंने कर लिया
          </button>
        </>
      )}
      {doneMessage && (
        <p
          role="status"
          aria-live="polite"
          className={`${doneError ? "state-broken" : "state-working"} mt-4 p-3 text-[17px] font-semibold`}
        >
          {doneMessage}
        </p>
      )}
    </div>
  );
}
