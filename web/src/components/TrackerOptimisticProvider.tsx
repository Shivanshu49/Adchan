"use client";

import {
  createContext,
  type FormEvent,
  type ReactNode,
  startTransition,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import { markActionDone, setReminder } from "@/actions/tracker";
import type { TrackerRecord } from "@/lib/tracker-api";


interface TrackerOptimisticContextValue {
  record: TrackerRecord;
  donePending: boolean;
  doneMessage: string | null;
  doneError: boolean;
  reminderPending: boolean;
  reminderMessage: string | null;
  reminderError: boolean;
  markDone: () => void;
  saveReminder: (event: FormEvent<HTMLFormElement>) => void;
}

const TrackerOptimisticContext = createContext<TrackerOptimisticContextValue | null>(null);


export function useOptimisticTracker() {
  const context = useContext(TrackerOptimisticContext);
  if (!context) throw new Error("Optimistic tracker controls require their provider");
  return context;
}


export default function TrackerOptimisticProvider({
  initialRecord,
  children,
}: {
  initialRecord: TrackerRecord;
  children: ReactNode;
}) {
  const router = useRouter();
  const [record, setRecord] = useState(initialRecord);
  const [donePending, setDonePending] = useState(false);
  const [doneMessage, setDoneMessage] = useState<string | null>(null);
  const [doneError, setDoneError] = useState(false);
  const [reminderPending, setReminderPending] = useState(false);
  const [reminderMessage, setReminderMessage] = useState<string | null>(null);
  const [reminderError, setReminderError] = useState(false);

  const markDone = useCallback(() => {
    if (donePending || record.markedDoneAt) return;

    const previousMarkedDoneAt = record.markedDoneAt;
    const optimisticMarkedDoneAt = new Date().toISOString();
    setRecord((current) => ({ ...current, markedDoneAt: optimisticMarkedDoneAt }));
    setDoneMessage("काम पूरा मान लिया गया—पृष्ठभूमि में सेव हो रहा है…");
    setDoneError(false);
    setDonePending(true);

    const formData = new FormData();
    formData.set("regNo", record.regNo);
    void markActionDone(formData)
      .then((result) => {
        if (!result.ok) {
          setRecord((current) => ({ ...current, markedDoneAt: previousMarkedDoneAt }));
          setDoneMessage(result.message);
          setDoneError(true);
          return;
        }
        setRecord((current) => ({ ...current, markedDoneAt: result.record.markedDoneAt }));
        setDoneMessage("काम पूरा सेव हो गया।");
        setDoneError(false);
        startTransition(() => router.refresh());
      })
      .catch(() => {
        setRecord((current) => ({ ...current, markedDoneAt: previousMarkedDoneAt }));
        setDoneMessage("काम सेव नहीं हुआ। बदलाव वापस कर दिया गया—फिर कोशिश करें।");
        setDoneError(true);
      })
      .finally(() => setDonePending(false));
  }, [donePending, record.markedDoneAt, record.regNo, router]);

  const saveReminder = useCallback((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (reminderPending) return;

    const formData = new FormData(event.currentTarget);
    const reminderDate = formData.get("reminderDate");
    if (typeof reminderDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(reminderDate)) {
      setReminderMessage("याद दिलाने की सही तारीख़ चुनें।");
      setReminderError(true);
      return;
    }

    const optimisticReminderAt = new Date(`${reminderDate}T09:00:00+05:30`);
    if (Number.isNaN(optimisticReminderAt.getTime())) {
      setReminderMessage("याद दिलाने की सही तारीख़ चुनें।");
      setReminderError(true);
      return;
    }

    const previousReminderAt = record.reminderAt;
    setRecord((current) => ({ ...current, reminderAt: optimisticReminderAt.toISOString() }));
    setReminderMessage("नई तारीख़ रख ली गई—पृष्ठभूमि में सेव हो रही है…");
    setReminderError(false);
    setReminderPending(true);
    formData.set("regNo", record.regNo);

    void setReminder(formData)
      .then((result) => {
        if (!result.ok) {
          setRecord((current) => ({ ...current, reminderAt: previousReminderAt }));
          setReminderMessage(result.message);
          setReminderError(true);
          return;
        }
        setRecord((current) => ({ ...current, reminderAt: result.record.reminderAt }));
        setReminderMessage("याद दिलाने की तारीख़ सेव हो गई।");
        setReminderError(false);
        startTransition(() => router.refresh());
      })
      .catch(() => {
        setRecord((current) => ({ ...current, reminderAt: previousReminderAt }));
        setReminderMessage("तारीख़ सेव नहीं हुई। पुरानी तारीख़ वापस रख दी गई—फिर कोशिश करें।");
        setReminderError(true);
      })
      .finally(() => setReminderPending(false));
  }, [record.regNo, record.reminderAt, reminderPending, router]);

  const value = useMemo(() => ({
    record,
    donePending,
    doneMessage,
    doneError,
    reminderPending,
    reminderMessage,
    reminderError,
    markDone,
    saveReminder,
  }), [
    record,
    donePending,
    doneMessage,
    doneError,
    reminderPending,
    reminderMessage,
    reminderError,
    markDone,
    saveReminder,
  ]);

  return (
    <TrackerOptimisticContext.Provider value={value}>
      {children}
    </TrackerOptimisticContext.Provider>
  );
}
