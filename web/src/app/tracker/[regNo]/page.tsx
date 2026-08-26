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


export const metadata: Metadata = {
  title: "काम की प्रगति",
};


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
    <main id="main-content" className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <nav className="flex flex-wrap gap-5" aria-label="Tracker navigation">
        <Link
          href={`/status/${regNo}`}
          prefetch={false}
          className="inline-flex min-h-12 items-center border-b-2 border-[#1d2330] text-[18px] font-black focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#8f2d24]"
        >
          ← निदान देखें
        </Link>
        <Link
          href={`/tracker/${regNo}/schemes`}
          prefetch={false}
          className="inline-flex min-h-12 items-center border-b-2 border-[#1d2330] text-[18px] font-black focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#8f2d24]"
        >
          दूसरी किसान योजनाएँ
        </Link>
      </nav>

      <header className="mt-7 border-y-4 border-[#1d2330] bg-[#292232] px-5 py-8 text-white sm:px-8">
        <MockBadge hi="नमूना निजी क्षेत्र" en="MOCK SESSION" tone="ochre" />
        <h1 className="mt-4 text-[clamp(2.7rem,9vw,5.5rem)] font-black leading-none tracking-[-0.04em]">
          {match.persona.name.hi} का काम
        </h1>
        <p className="mt-4 max-w-3xl text-[20px] font-bold leading-relaxed text-[#eee8ef]">
          यह हिस्सा निदान के बाद खुलता है। Session एक httpOnly cookie में है; नमूना फोन नंबर कहीं सेव नहीं हुआ।
        </p>
      </header>

      {(query.saved || query.error) && (
        <p
          role="status"
          className={`mt-7 border-2 p-4 text-[18px] font-black ${query.error ? "border-[#8f2d24] bg-[#fff0ed] text-[#7c211b]" : "border-[#14633f] bg-[#eaf7ef] text-[#0d4d31]"}`}
        >
          {query.saved === "done" && "काम पूरा दर्ज हो गया। Timeline अपडेट हो गई है।"}
          {query.saved === "reminder" && "याद दिलाने की तारीख़ नमूना tracker में सेव हो गई।"}
          {query.error === "reminder" && "याद दिलाने के लिए सही तारीख़ चुनें।"}
          {query.error === "not-ready" && "Typical resolution समय पूरा होने के बाद grievance draft खुलेगा।"}
          {query.error === "storage" && "Tracker अभी Postgres तक नहीं पहुँच पा रहा। दोबारा कोशिश करें।"}
        </p>
      )}

      {storageUnavailable || !record ? (
        <section className="mt-8 border-2 border-[#8f2d24] bg-[#fff0ed] p-6 shadow-[5px_5px_0_#8f2d24]" aria-labelledby="storage-title">
          <MockBadge hi="नमूना tracker" en="MOCKED" />
          <h2 id="storage-title" className="mt-3 text-3xl font-black">Tracker database उपलब्ध नहीं है</h2>
          <p className="mt-3 text-[18px] leading-relaxed">
            निदान और action card अभी भी काम करते हैं। Progress सेव करने के लिए API में `DATABASE_URL` और generated schema चाहिए।
          </p>
        </section>
      ) : (
        <>
          <div className="mt-8">
            <TrackerTimeline record={record} failure={match.failure} />
          </div>

          <section className="mt-10 grid gap-6 border-2 border-[#1d2330] bg-[#e5ded1] p-5 sm:p-7 lg:grid-cols-[1fr_auto] lg:items-end" aria-labelledby="reminder-title">
            <div>
              <MockBadge hi="नमूना reminder" en="MOCKED" tone="ink" />
              <h2 id="reminder-title" className="mt-3 text-3xl font-black">कब दोबारा देखना है?</h2>
              <p className="mt-2 text-[18px] leading-relaxed text-[#4d4942]">
                यह अभी केवल तारीख़ tracker में रखता है; SMS या WhatsApp notification नहीं भेजता।
              </p>
              {record.reminderAt && (
                <p className="mt-3 text-[18px] font-black text-[#14633f]">
                  सेव तारीख़: {new Intl.DateTimeFormat("hi-IN", { dateStyle: "long", timeZone: "Asia/Kolkata" }).format(new Date(record.reminderAt))}
                </p>
              )}
            </div>
            <form action={setReminder} className="grid gap-3 sm:grid-cols-[auto_auto] sm:items-end">
              <input type="hidden" name="regNo" value={regNo} />
              <label className="text-[18px] font-black">
                तारीख़
                <input
                  type="date"
                  name="reminderDate"
                  required
                  defaultValue={defaultReminderDate()}
                  className="mt-2 block min-h-14 w-full border-2 border-[#1d2330] bg-white px-3 py-2 text-[18px] focus:outline-4 focus:outline-offset-2 focus:outline-[#8f2d24]"
                />
              </label>
              <button type="submit" className="min-h-14 bg-[#1d2330] px-5 py-3 text-[18px] font-black text-white shadow-[3px_3px_0_#8f2d24] focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#f0c95a]">
                याद रखें
              </button>
            </form>
          </section>

          <div className="mt-10">
            <ActionCard
              failure={match.failure}
              persona={match.persona}
              mode="tracker"
              markedDoneAt={record.markedDoneAt}
            />
          </div>

          <section className="mt-10 border-2 border-[#1d2330] bg-[#f0c95a] p-6 shadow-[6px_6px_0_#1d2330] sm:p-8">
            <p className="font-mono text-[16px] font-black tracking-[0.12em]">ONE PROOF, MORE SCHEMES</p>
            <h2 className="mt-2 text-4xl font-black">ज़मीन और पहचान फिर से क्यों साबित करें?</h2>
            <p className="mt-3 max-w-3xl text-[20px] font-bold leading-relaxed">
              PM-KISAN के लिए जो नमूना जानकारी पहले से है, उससे चार दूसरी योजनाओं के application packets तैयार करें। कोई आवेदन जमा नहीं होगा।
            </p>
            <Link
              href={`/tracker/${regNo}/schemes`}
              prefetch={false}
              className="mt-6 inline-flex min-h-14 items-center bg-[#8f2d24] px-6 py-3 text-[20px] font-black text-white shadow-[4px_4px_0_#1d2330] focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#1d2330]"
            >
              योजनाएँ और packets देखें →
            </Link>
          </section>
        </>
      )}
    </main>
  );
}
