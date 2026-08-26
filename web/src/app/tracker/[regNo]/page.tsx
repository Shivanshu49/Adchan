import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { setReminder } from "@/actions/tracker";
import ActionCard from "@/components/ActionCard";
import MockBadge from "@/components/MockBadge";
import TrackerTimeline from "@/components/TrackerTimeline";
import { getPersonaAndFailure } from "@/lib/data";
import { getMockSessionId } from "@/lib/mock-auth";
import { getTrackerRecord, type TrackerRecord } from "@/lib/tracker-api";


export const metadata: Metadata = { title: "काम की प्रगति" };

interface TrackerPageProps {
  params: Promise<{ regNo: string }>;
  searchParams: Promise<{ saved?: string; error?: string; storage?: string }>;
}

function defaultReminderDate() {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}


export default async function TrackerPage({ params, searchParams }: TrackerPageProps) {
  const { regNo } = await params;
  const query = await searchParams;
  const match = getPersonaAndFailure(regNo);
  if (!match) notFound();

  const sessionId = await getMockSessionId();
  if (!sessionId) redirect(`/status/${encodeURIComponent(regNo)}`);

  let record: TrackerRecord | null = null;
  let storageUnavailable = query.storage === "unavailable";
  if (!storageUnavailable) {
    try {
      record = await getTrackerRecord(sessionId, regNo);
    } catch {
      storageUnavailable = true;
    }
  }

  return (
    <main id="main-content" className="page-shell">
      <nav className="grid gap-2" aria-label="प्रगति के दूसरे पन्ने">
        <Link href={`/status/${regNo}`} prefetch={false} className="touch-link">← निदान देखें</Link>
        <Link href={`/tracker/${regNo}/schemes`} prefetch={false} className="touch-link">दूसरी किसान योजनाएँ</Link>
      </nav>

      <header className="mt-8">
        <div className="flex flex-wrap items-center gap-2">
          <p className="section-label">निदान के बाद का निजी हिस्सा</p>
          <MockBadge hi="नमूना निजी क्षेत्र" en="MOCK SESSION" />
        </div>
        <h1 className="mt-3 text-[32px] font-semibold leading-[1.35]">{match.persona.name.hi} का काम</h1>
        <p className="mt-4 text-[19px] leading-[1.6]">
          यह हिस्सा निदान के बाद खुलता है। नमूना फोन नंबर सेव नहीं हुआ; सत्र केवल सुरक्षित cookie में है।
        </p>
      </header>

      {(query.saved || query.error) && (
        <p role="status" className={`${query.error ? "state-broken" : "state-working"} mt-7 p-4 text-[19px] font-semibold`}>
          {query.saved === "done" && "काम पूरा दर्ज हो गया। प्रगति अपडेट हो गई है।"}
          {query.saved === "reminder" && "याद दिलाने की तारीख़ नमूना tracker में सेव हो गई।"}
          {query.error === "reminder" && "याद दिलाने के लिए सही तारीख़ चुनें।"}
          {query.error === "not-ready" && "समाधान का सामान्य समय पूरा होने के बाद शिकायत का मसौदा खुलेगा।"}
          {query.error === "storage" && "Tracker अभी डेटाबेस तक नहीं पहुँच पा रहा। दोबारा कोशिश करें।"}
        </p>
      )}

      {storageUnavailable || !record ? (
        <section className="state-broken mt-8 p-5 sm:p-6" aria-labelledby="storage-title">
          <div className="flex flex-wrap items-center gap-2">
            <h2 id="storage-title" className="text-[28px] font-semibold">प्रगति का डेटाबेस उपलब्ध नहीं है</h2>
            <MockBadge hi="नमूना tracker" />
          </div>
          <p className="mt-3 text-[19px] leading-[1.6]">
            निदान और अगला कदम अभी भी काम करते हैं। प्रगति सेव करने के लिए API में DATABASE_URL और बनाया गया schema चाहिए।
          </p>
        </section>
      ) : (
        <>
          <div className="mt-8"><TrackerTimeline record={record} failure={match.failure} /></div>

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
                सेव तारीख़: {new Intl.DateTimeFormat("hi-IN", { dateStyle: "long", timeZone: "Asia/Kolkata" }).format(new Date(record.reminderAt))}
              </p>
            )}
            <form action={setReminder} className="mt-5 grid gap-4">
              <input type="hidden" name="regNo" value={regNo} />
              <label className="text-[19px] font-semibold">
                तारीख़
                <input
                  type="date"
                  name="reminderDate"
                  required
                  defaultValue={defaultReminderDate()}
                  className="mt-2 block min-h-14 w-full rounded-[4px] border-2 border-[var(--ink)] bg-[var(--surface)] px-3 py-2 text-[19px]"
                />
              </label>
              <button type="submit" className="primary-action w-full">तारीख़ याद रखें</button>
            </form>
          </section>

          <div className="mt-8">
            <ActionCard failure={match.failure} persona={match.persona} mode="tracker" markedDoneAt={record.markedDoneAt} />
          </div>

          <section className="document-card mt-8 p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-2">
              <p className="section-label">एक प्रमाण, दूसरी योजनाएँ</p>
              <MockBadge hi="नमूना packet" />
            </div>
            <h2 className="mt-3 text-[28px] font-semibold leading-[1.35]">ज़मीन और पहचान फिर से क्यों साबित करें?</h2>
            <p className="mt-3 text-[19px] leading-[1.6]">
              PM-KISAN की नमूना जानकारी से चार दूसरी योजनाओं के आवेदन-पैकेट तैयार करें। कोई आवेदन जमा नहीं होगा।
            </p>
            <Link href={`/tracker/${regNo}/schemes`} prefetch={false} className="primary-action mt-5 w-full">
              योजनाएँ और पैकेट देखें
            </Link>
          </section>
        </>
      )}
    </main>
  );
}
