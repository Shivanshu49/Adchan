import type { Metadata } from "next";
import { redirect } from "next/navigation";

import ActionCard from "@/components/ActionCard";
import MockBadge from "@/components/MockBadge";
import OptimisticDoneControl from "@/components/OptimisticDoneControl";
import OptimisticReminder from "@/components/OptimisticReminder";
import OptimisticTrackerTimeline from "@/components/OptimisticTrackerTimeline";
import Link from "@/components/PlainLink";
import TrackerOptimisticProvider from "@/components/TrackerOptimisticProvider";
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
  if (!match) redirect("/");

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
            आपकी प्रगति अभी पढ़ी या सेव नहीं हो सकती। निदान, अगला दफ़्तर, कागज़ और बोलने की पंक्ति अभी भी काम करते हैं।
          </p>
        </section>
      ) : (
        <TrackerOptimisticProvider initialRecord={record}>
          <div className="mt-8"><OptimisticTrackerTimeline failure={match.failure} /></div>

          <OptimisticReminder defaultDate={defaultReminderDate()} />

          <div className="mt-8">
            <ActionCard
              failure={match.failure}
              persona={match.persona}
              mode="tracker"
              trackerControl={<OptimisticDoneControl />}
            />
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
        </TrackerOptimisticProvider>
      )}
    </main>
  );
}
