import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { mockSubmitGrievance } from "@/actions/tracker";
import MockBadge from "@/components/MockBadge";
import { escalationIsAvailable } from "@/components/TrackerTimeline";
import { getPersonaAndFailure } from "@/lib/data";
import { getMockSessionId } from "@/lib/mock-auth";
import { getTrackerRecord } from "@/lib/tracker-api";


export const metadata: Metadata = { title: "CPGRAMS शिकायत का मसौदा" };

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

  const fields = [
    ["category", "शिकायत की श्रेणी", "Category", category, "input"],
    ["subject", "विषय", "Subject", subject, "input"],
    ["situation", "किसान की स्थिति", "Farmer's situation", situation, "textarea"],
    ["reason", "दर्ज विफलता का कारण", "Recorded failure reason", reason, "textarea"],
    ["dates", "ज़रूरी तारीख़ें", "Relevant dates", dates, "textarea"],
    ["attempts", "अब तक किए गए कदम", "Steps already tried", attempts, "textarea"],
  ] as const;

  return (
    <main id="main-content" className="page-shell">
      <Link href={`/tracker/${regNo}`} prefetch={false} className="touch-link">← प्रगति पर वापस</Link>

      <header className="mt-8">
        <div className="flex flex-wrap items-center gap-2">
          <p className="section-label">लिखित शिकायत</p>
          <MockBadge hi="नमूना शिकायत" en="MOCK SUBMISSION" />
        </div>
        <h1 className="mt-3 text-[32px] font-semibold leading-[1.35]">अब चुप नहीं—लिखित शिकायत।</h1>
        <p className="mt-4 text-[19px] leading-[1.6]">
          पहले साफ़ हिंदी में पढ़ें कि आपके नाम से क्या कहा जाएगा। उसके बाद सरकारी व्यवस्था के लिए औपचारिक अंग्रेज़ी मसौदा देखें और बदलें।
        </p>
      </header>

      {query.submitted && (
        <section className="state-working mt-8 p-5 sm:p-6" aria-labelledby="mock-registration-title">
          <div className="flex flex-wrap items-center gap-2">
            <h2 id="mock-registration-title" className="text-[28px] font-semibold">नमूना शिकायत नंबर</h2>
            <MockBadge hi="जमा नहीं हुआ" en="MOCK RESULT" />
          </div>
          <p className="mt-3 break-all font-mono text-[24px] font-semibold">{query.submitted}</p>
          <p className="mt-3 text-[19px] font-semibold">यह CPGRAMS का असली नंबर नहीं है। कोई शिकायत सरकारी व्यवस्था में जमा नहीं हुई।</p>
        </section>
      )}

      {query.error && (
        <p role="alert" className="state-broken mt-8 p-4 text-[19px] font-semibold">
          {query.error === "incomplete" ? "अंग्रेज़ी मसौदे का हर हिस्सा भरना ज़रूरी है।" : "प्रगति का डेटाबेस अभी उपलब्ध नहीं है।"}
        </p>
      )}

      <form action={mockSubmitGrievance} className="mt-8">
        <input type="hidden" name="regNo" value={regNo} />

        <section className="document-card" aria-labelledby="hindi-summary-title">
          <div className="border-b border-[var(--rule)] p-5 sm:p-6">
            <p className="section-label">आपके नाम से क्या कहा जाएगा</p>
            <h2 id="hindi-summary-title" className="mt-2 text-[28px] font-semibold">साफ़ हिंदी सार</h2>
          </div>
          <div className="space-y-5 p-5 text-[19px] leading-[1.6] sm:p-6">
            <p><strong>विभाग से माँग:</strong> PM-KISAN की रुकी किस्त और लाभार्थी भुगतान की स्थिति की जाँच।</p>
            <p><strong>आपकी स्थिति:</strong> {match.failure.plain.hi}</p>
            <p><strong>तारीख़ें:</strong> आख़िरी दर्ज किस्त {new Intl.DateTimeFormat("hi-IN", { dateStyle: "long", timeZone: "UTC" }).format(new Date(`${match.persona.lastInstallmentDate}T00:00:00Z`))} थी। निदान के बाद {match.failure.typicalDays} दिन का सामान्य समय पूरा हो चुका है।</p>
            <p><strong>अब तक:</strong> मसौदे में लिखा है कि आपने कारण और {match.failure.office.hi} वाला रास्ता देखा और सामान्य समय तक इंतज़ार किया। अगर आपने कुछ अलग किया है तो नीचे अंग्रेज़ी लिखावट बदलें।</p>
            <p className="border-l-4 border-[var(--ink)] pl-4 font-semibold">
              हिंदी सार अपने-आप नहीं बदलता। जमा करने से पहले इसे अंग्रेज़ी मसौदे से मिलाकर पढ़ें।
            </p>
          </div>
        </section>

        <section className="document-card mt-8" aria-labelledby="english-draft-title">
          <div className="border-b border-[var(--rule)] p-5 sm:p-6">
            <p className="section-label">बदलने योग्य औपचारिक अंग्रेज़ी</p>
            <h2 id="english-draft-title" className="mt-2 text-[28px] font-semibold">CPGRAMS शिकायत का मसौदा</h2>
            <p className="secondary-copy mt-1" lang="en">Editable formal English required by the receiving system</p>
          </div>
          <div className="space-y-5 p-5 sm:p-6">
            {fields.map(([name, hiLabel, enLabel, value, kind]) => (
              <label key={name} className="block text-[19px] font-semibold">
                {hiLabel}
                <span className="secondary-copy block" lang="en">{enLabel}</span>
                {kind === "input" ? (
                  <input
                    name={name}
                    required
                    defaultValue={value}
                    lang="en"
                    className="mt-2 min-h-14 w-full rounded-[4px] border-2 border-[var(--ink)] bg-[var(--surface)] px-3 py-2 text-[19px] font-normal"
                  />
                ) : (
                  <textarea
                    name={name}
                    required
                    rows={name === "attempts" ? 6 : 4}
                    defaultValue={value}
                    lang="en"
                    className="mt-2 w-full rounded-[4px] border-2 border-[var(--ink)] bg-[var(--surface)] px-3 py-3 text-[19px] font-normal leading-[1.6]"
                  />
                )}
              </label>
            ))}
          </div>
        </section>

        <section className="document-card mt-8 p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[19px] font-semibold">यह सरकारी जमा नहीं है</p>
            <MockBadge hi="नमूना जमा" en="NO GOVERNMENT WRITE" />
          </div>
          <p className="mt-3 text-[19px] leading-[1.6]">
            असली सेवा में सहमति के बाद अधिकृत CPGRAMS API से शिकायत जाएगी। यहाँ बटन केवल काल्पनिक नंबर लौटाता है।
          </p>
          <Link href="/whats-real" prefetch={false} className="touch-link mt-3">पूरी सीमा पढ़ें: क्या असली है?</Link>
          <button type="submit" className="primary-action mt-5 w-full">नमूना शिकायत जमा करें</button>
        </section>
      </form>
    </main>
  );
}
