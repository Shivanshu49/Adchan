import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { mockSubmitGrievance } from "@/actions/tracker";
import MockBadge from "@/components/MockBadge";
import { escalationIsAvailable } from "@/components/TrackerTimeline";
import { getPersonaAndFailure } from "@/lib/data";
import { getMockSessionId } from "@/lib/mock-auth";
import { getTrackerRecord } from "@/lib/tracker-api";


export const metadata: Metadata = {
  title: "CPGRAMS शिकायत draft",
};


interface EscalationPageProps {
  params: Promise<{ regNo: string }>;
  searchParams: Promise<{ submitted?: string; error?: string }>;
}


function englishDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(new Date(value));
}


export default async function EscalationPage({ params, searchParams }: EscalationPageProps) {
  const { regNo } = await params;
  const query = await searchParams;
  const match = getPersonaAndFailure(regNo);
  if (!match) notFound();

  const sessionId = await getMockSessionId();
  if (!sessionId) redirect(`/status/${encodeURIComponent(regNo)}`);

  let record;
  try {
    record = await getTrackerRecord(sessionId, regNo);
  } catch {
    redirect(`/tracker/${encodeURIComponent(regNo)}?error=storage`);
  }
  if (!record || !escalationIsAvailable(record, match.failure)) {
    redirect(`/tracker/${encodeURIComponent(regNo)}?error=not-ready`);
  }

  const expectedDate = new Date(record.createdAt);
  expectedDate.setUTCDate(expectedDate.getUTCDate() + match.failure.typicalDays);
  const category = "Department of Agriculture and Farmers Welfare / PM-KISAN / Beneficiary payment grievance";
  const subject = `PM-KISAN instalment unresolved — ${match.failure.code}`;
  const situation = `${match.persona.name.en} is a fictional demo beneficiary with registration ${regNo}. The PM-KISAN instalment has not been received.`;
  const reason = `The recorded failure reason is: ${match.failure.plain.en} Portal reference: ${match.failure.portalText}.`;
  const dates = `Last recorded instalment: ${englishDate(match.persona.lastInstallmentDate)}. Diagnosis tracked: ${englishDate(record.createdAt)}. Typical resolution period: ${match.failure.typicalDays} days. Expected resolution date: ${englishDate(expectedDate.toISOString())}.`;
  const attempts = `The beneficiary reviewed the diagnosed reason and the prescribed resolution path for ${match.failure.office.en}, then waited through the stated typical resolution period. Please verify and edit this field if any office visit or document submission should be described more precisely.`;

  return (
    <main id="main-content" className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <Link
        href={`/tracker/${regNo}`}
        prefetch={false}
        className="inline-flex min-h-12 items-center border-b-2 border-[#1d2330] text-[18px] font-black focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#8f2d24]"
      >
        ← tracker पर वापस
      </Link>

      <header className="mt-7 border-4 border-[#1d2330] bg-[#8f2d24] px-5 py-8 text-white shadow-[7px_7px_0_#f0c95a] sm:px-8">
        <MockBadge hi="नमूना शिकायत" en="MOCK SUBMISSION" tone="ochre" />
        <h1 className="mt-4 text-[clamp(2.7rem,9vw,5.5rem)] font-black leading-none tracking-[-0.04em]">
          अब चुप नहीं—लिखित शिकायत।
        </h1>
        <p className="mt-5 max-w-4xl text-[20px] font-bold leading-relaxed text-[#fff3ef]">
          सिस्टम के लिए formal English draft बाईं ओर है। दाईं ओर साफ़ हिंदी में वही अर्थ है, ताकि आपके नाम से क्या कहा जा रहा है आप समझ सकें।
        </p>
      </header>

      {query.submitted && (
        <section className="mt-8 border-4 border-[#14633f] bg-[#eaf7ef] p-6 shadow-[5px_5px_0_#14633f]" aria-labelledby="mock-registration-title">
          <MockBadge hi="जमा नहीं हुआ" en="MOCK RESULT" />
          <h2 id="mock-registration-title" className="mt-3 text-3xl font-black text-[#0d4d31]">नमूना registration number</h2>
          <p className="mt-3 break-all font-mono text-[clamp(1.25rem,5vw,2rem)] font-black">{query.submitted}</p>
          <p className="mt-3 text-[18px] font-bold">यह CPGRAMS से मिला असली नंबर नहीं है और कोई शिकायत सरकारी सिस्टम में जमा नहीं हुई।</p>
        </section>
      )}

      {query.error && (
        <p role="alert" className="mt-8 border-2 border-[#8f2d24] bg-[#fff0ed] p-4 text-[18px] font-black text-[#7c211b]">
          {query.error === "incomplete" ? "हर English field भरना ज़रूरी है।" : "Tracker storage अभी उपलब्ध नहीं है।"}
        </p>
      )}

      <form action={mockSubmitGrievance} className="mt-10">
        <input type="hidden" name="regNo" value={regNo} />
        <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
          <section className="border-2 border-[#1d2330] bg-[#fffdf7] shadow-[6px_6px_0_#1d2330]" aria-labelledby="english-draft-title">
            <div className="border-b-2 border-[#1d2330] bg-[#1d2330] px-5 py-4 text-white">
              <p className="font-mono text-[16px] font-black tracking-[0.12em] text-[#f0c95a]">EDITABLE · FORMAL ENGLISH</p>
              <h2 id="english-draft-title" className="mt-1 text-3xl font-black">CPGRAMS grievance draft</h2>
            </div>
            <div className="space-y-5 p-5 sm:p-7" lang="en">
              {[
                ["category", "Category", category],
                ["subject", "Subject", subject],
              ].map(([name, label, value]) => (
                <label key={name} className="block text-[18px] font-black">
                  {label}
                  <input
                    name={name}
                    required
                    defaultValue={value}
                    className="mt-2 min-h-14 w-full border-2 border-[#1d2330] bg-white px-3 py-2 text-[18px] font-normal focus:outline-4 focus:outline-offset-2 focus:outline-[#8f2d24]"
                  />
                </label>
              ))}
              {[
                ["situation", "Farmer's situation", situation],
                ["reason", "Recorded failure reason", reason],
                ["dates", "Relevant dates", dates],
                ["attempts", "Steps already tried", attempts],
              ].map(([name, label, value]) => (
                <label key={name} className="block text-[18px] font-black">
                  {label}
                  <textarea
                    name={name}
                    required
                    rows={name === "attempts" ? 6 : 4}
                    defaultValue={value}
                    className="mt-2 w-full border-2 border-[#1d2330] bg-white px-3 py-3 text-[18px] font-normal leading-relaxed focus:outline-4 focus:outline-offset-2 focus:outline-[#8f2d24]"
                  />
                </label>
              ))}
            </div>
          </section>

          <aside className="border-2 border-[#1d2330] bg-[#fff3c7] shadow-[6px_6px_0_#8f2d24]" aria-labelledby="hindi-summary-title">
            <div className="border-b-2 border-[#1d2330] bg-[#f0c95a] px-5 py-4">
              <p className="font-mono text-[16px] font-black tracking-[0.12em]">आपके नाम से क्या कहा जाएगा</p>
              <h2 id="hindi-summary-title" className="mt-1 text-3xl font-black">साफ़ हिंदी सार</h2>
            </div>
            <div className="space-y-6 p-5 text-[20px] leading-relaxed sm:p-7">
              <p><strong>विभाग से माँग:</strong> PM-KISAN की रुकी किस्त और beneficiary payment status की जाँच।</p>
              <p><strong>आपकी स्थिति:</strong> {match.failure.plain.hi}</p>
              <p><strong>तारीख़ें:</strong> आख़िरी दर्ज किस्त {new Intl.DateTimeFormat("hi-IN", { dateStyle: "long", timeZone: "UTC" }).format(new Date(`${match.persona.lastInstallmentDate}T00:00:00Z`))} थी। निदान के बाद {match.failure.typicalDays} दिन का सामान्य समय पूरा हो चुका है।</p>
              <p><strong>अब तक:</strong> शिकायत में लिखा है कि आपने कारण और {match.failure.office.hi} वाला रास्ता देखा और सामान्य समय तक इंतज़ार किया। अगर आपने वास्तव में कुछ अलग किया है तो बाईं ओर English text बदलें।</p>
              <div className="border-l-8 border-[#8f2d24] bg-[#fffdf7] p-4">
                <p className="font-black">महत्वपूर्ण</p>
                <p className="mt-2 text-[18px]">English draft editable है। यह हिंदी सार अपने-आप edit नहीं होता; submit से पहले दोनों को मिलाकर पढ़ें।</p>
              </div>
            </div>
          </aside>
        </div>

        <section className="mt-8 border-2 border-[#1d2330] bg-[#e5ded1] p-5 sm:p-7">
          <MockBadge hi="नमूना submit" en="NO GOVERNMENT WRITE" />
          <p className="mt-3 text-[20px] font-black leading-relaxed">
            Production में यह consent के बाद अधिकृत CPGRAMS API से submit होगा। इस prototype में button सिर्फ़ नकली registration number लौटाता है।
          </p>
          <p className="mt-2 text-[18px]">
            Integration की सीमा <Link href="/whats-real" prefetch={false} className="font-black text-[#8f2d24] underline underline-offset-4">क्या असली है?</Link> पन्ने पर पढ़ें।
          </p>
          <button
            type="submit"
            className="mt-6 flex min-h-16 w-full items-center justify-center bg-[#8f2d24] px-6 py-3 text-[22px] font-black text-white shadow-[4px_4px_0_#1d2330] hover:bg-[#74231d] focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#f0c95a] sm:w-auto"
          >
            नमूना शिकायत जमा करें
          </button>
        </section>
      </form>
    </main>
  );
}
