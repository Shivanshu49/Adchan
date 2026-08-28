import type { Metadata } from "next";
import Link from "@/components/PlainLink";

import MockBadge from "@/components/MockBadge";
import failures from "@/types/failures";


export const metadata: Metadata = {
  title: "शोध और साक्षात्कार",
  description: "किसान साक्षात्कार, failure frequency और methodology के लिए ईमानदार placeholder structure।",
};


export default function ResearchPage() {
  return (
    <main id="main-content" className="page-shell">
      <Link href="/" prefetch={false} className="touch-link">← होम पर वापस</Link>

      <header className="mt-8">
        <div className="flex flex-wrap items-center gap-2">
          <p className="section-label">क्षेत्र-अध्ययन बाकी</p>
          <MockBadge hi="निष्कर्ष बाकी" en="FIELDWORK PENDING" />
        </div>
        <h1 className="mt-3 text-[32px] font-semibold leading-[1.35]">शोध, अभी खाली</h1>
        <p className="mt-4 text-[19px] leading-[1.6]">
          यह प्रमाण रखने का ढाँचा है, प्रमाण नहीं। किसान साक्षात्कार होने तक हम कथन, आवृत्ति या सटीकता का दावा नहीं करेंगे।
        </p>
      </header>

      <section className="mt-8" aria-labelledby="quotes-title">
        <p className="section-label">साक्षात्कार के कथन</p>
        <h2 id="quotes-title" className="mt-2 text-[28px] font-semibold">किसानों की आवाज़ें यहाँ आएँगी</h2>
        <p className="secondary-copy mt-1" lang="en">Interview quotes</p>
        <div className="mt-5 grid gap-4">
          {[1, 2, 3, 4].map((number) => (
            <blockquote key={number} className="document-card p-5 sm:p-6">
              <MockBadge hi={`कथन ${number} बाकी`} en="PENDING QUOTE" />
              <p className="mt-4 text-[22px] font-semibold leading-[1.5]">[सहमति के बाद किसान का सटीक कथन यहाँ]</p>
              <footer className="mt-4 text-[19px]">जिला: __ · तारीख़: __ · माध्यम: __</footer>
            </blockquote>
          ))}
        </div>
      </section>

      <section className="mt-8" aria-labelledby="frequency-title">
        <div className="flex flex-wrap items-center gap-2">
          <h2 id="frequency-title" className="text-[28px] font-semibold">कौन-सी अड़चन कितनी बार मिली?</h2>
          <MockBadge hi="गिनती बाकी" en="PENDING" />
        </div>
        <p className="secondary-copy mt-1" lang="en">Failure frequency</p>
        <p className="mt-3 text-[19px] leading-[1.6]">
          सभी गिनतियाँ जानबूझकर खाली हैं। Synthetic नमूना लाभार्थी इस table में नहीं गिने जाएँगे।
        </p>
        <div className="mt-5 overflow-x-auto rounded-[14px] border-2 border-[var(--c-ink)] bg-[var(--c-card-bg)]">
          <table className="w-full min-w-[720px] border-collapse text-left text-[19px]">
            <thead className="border-b-2 border-[var(--c-ink)]">
              <tr>
                <th className="p-4">कारण कोड<span className="secondary-copy block" lang="en">FailureCode</span></th>
                <th className="p-4">नागरिक के लिए कारण</th>
                <th className="p-4">क्षेत्र में गिनती<span className="secondary-copy block" lang="en">Field count</span></th>
                <th className="p-4">हिस्सा<span className="secondary-copy block" lang="en">Share</span></th>
              </tr>
            </thead>
            <tbody>
              {failures.map((failure) => (
                <tr key={failure.code} className="border-b border-[var(--c-sage)] align-top last:border-b-0">
                  <th className="p-4 font-mono text-[15px]" scope="row">{failure.code}</th>
                  <td className="p-4">{failure.plain.hi}</td>
                  <td className="p-4 text-[24px] font-semibold">—</td>
                  <td className="p-4 text-[24px] font-semibold">— %</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="document-card mt-8 p-5 sm:p-6" aria-labelledby="method-title">
        <div className="flex flex-wrap items-center gap-2">
          <h2 id="method-title" className="text-[28px] font-semibold">कैसे दर्ज करेंगे</h2>
          <MockBadge hi="तरीका अभी मसौदा" en="DRAFT" />
        </div>
        <p className="secondary-copy mt-1" lang="en">Methodology note</p>
        <dl className="mt-5 grid gap-4">
          {[
            ["भाग लेने वाले किसान", "Participants", "__ किसान"],
            ["जिले", "Districts", "__"],
            ["फोन के प्रकार", "Device types", "__"],
            ["साक्षात्कार की तारीख़ें", "Interview dates", "__ से __"],
          ].map(([hi, en, value]) => (
            <div key={en} className="border-t border-[var(--c-sage)] pt-4 first:border-t-0 first:pt-0">
              <dt className="text-[19px] font-semibold">{hi}<span className="secondary-copy block" lang="en">{en}</span></dt>
              <dd className="mt-2 text-[22px] font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-5 border-t border-[var(--c-sage)] pt-5 text-[19px] font-semibold leading-[1.6]">
          हर कथन के लिए सूचित सहमति, कोई आधार या खाता नंबर नहीं, field और synthetic स्रोत अलग, और नकारात्मक निष्कर्ष भी प्रकाशित होंगे। Sample और भर्ती की योजना fieldwork से पहले दर्ज होगी।
        </p>
      </section>
    </main>
  );
}
