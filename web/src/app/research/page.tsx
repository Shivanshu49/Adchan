import type { Metadata } from "next";
import Link from "next/link";

import failures from "@/types/failures";


export const metadata: Metadata = {
  title: "शोध और साक्षात्कार",
  description: "किसान interviews, failure frequency और methodology के लिए ईमानदार placeholder structure।",
};


export default function ResearchPage() {
  return (
    <main id="main-content" className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <Link
        href="/"
        prefetch={false}
        className="inline-flex min-h-12 items-center border-b-2 border-[#1d2330] text-[18px] font-black focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#8f2d24]"
      >
        ← होम पर वापस
      </Link>

      <header className="mt-7 border-4 border-dashed border-[#8f2d24] bg-[#fffdf7] p-6 sm:p-9">
        <span className="inline-block bg-[#8f2d24] px-3 py-1 text-[18px] font-black text-white">FIELDWORK PENDING · कोई findings नहीं</span>
        <h1 className="mt-4 text-[clamp(2.6rem,10vw,5.5rem)] font-black leading-none tracking-[-0.04em]">शोध, अभी खाली</h1>
        <p className="mt-5 max-w-3xl text-[20px] font-bold leading-relaxed">यह evidence का ढाँचा है, evidence नहीं। किसान interviews होने तक हम quote, frequency या accuracy का कोई दावा नहीं करेंगे।</p>
      </header>

      <section className="mt-12" aria-labelledby="quotes-title">
        <p className="text-[16px] font-black tracking-[0.12em] text-[#8f2d24]" lang="en">INTERVIEW QUOTES</p>
        <h2 id="quotes-title" className="mt-1 text-4xl font-black">आवाज़ें यहाँ आएँगी</h2>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          {[1, 2, 3, 4].map((number) => (
            <blockquote key={number} className="border-l-8 border-[#827b6d] bg-[#ece8df] p-6">
              <span className="inline-block bg-[#5a554d] px-2 py-1 text-[16px] font-black text-white">PENDING QUOTE {number}</span>
              <p className="mt-4 text-2xl font-black text-[#5a554d]">[सहमति के बाद किसान का सटीक कथन यहाँ]</p>
              <footer className="mt-4 text-[18px]">जिला: __ · तारीख़: __ · channel: __</footer>
            </blockquote>
          ))}
        </div>
      </section>

      <section className="mt-12" aria-labelledby="frequency-title">
        <p className="text-[16px] font-black tracking-[0.12em] text-[#8f2d24]" lang="en">FAILURE FREQUENCY</p>
        <h2 id="frequency-title" className="mt-1 text-4xl font-black">कौन-सी अड़चन कितनी बार मिली?</h2>
        <p className="mt-3 text-[18px] leading-relaxed">सभी counts जानबूझकर खाली हैं। Synthetic demo personas इस table में नहीं गिने जाएँगे।</p>
        <div className="mt-5 overflow-x-auto border-2 border-[#1d2330] bg-[#fffdf7]">
          <table className="w-full min-w-[720px] border-collapse text-left text-[18px]">
            <thead className="bg-[#1d2330] text-white">
              <tr>
                <th className="p-4">FailureCode</th>
                <th className="p-4">नागरिक के लिए कारण</th>
                <th className="p-4">Field count</th>
                <th className="p-4">Share</th>
              </tr>
            </thead>
            <tbody>
              {failures.map((failure) => (
                <tr key={failure.code} className="border-b border-[#827b6d] align-top last:border-b-0">
                  <th className="p-4 font-mono text-[16px]" scope="row">{failure.code}</th>
                  <td className="p-4">{failure.plain.hi}</td>
                  <td className="p-4 text-2xl font-black">—</td>
                  <td className="p-4 text-2xl font-black">— %</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-12 border-2 border-[#1d2330] bg-[#f0c95a] p-6 shadow-[6px_6px_0_#1d2330]" aria-labelledby="method-title">
        <span className="inline-block bg-[#1d2330] px-3 py-1 text-[16px] font-black text-white">METHODOLOGY NOTE · DRAFT</span>
        <h2 id="method-title" className="mt-3 text-4xl font-black">कैसे दर्ज करेंगे</h2>
        <dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Participants", "__ किसान"],
            ["Districts", "__"],
            ["Device types", "__"],
            ["Interview dates", "__ से __"],
          ].map(([term, value]) => (
            <div key={term} className="border-2 border-[#1d2330] bg-[#fffdf7] p-4">
              <dt className="text-[18px] font-bold">{term}</dt>
              <dd className="mt-2 text-2xl font-black">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-5 text-[18px] font-bold leading-relaxed">हर quote के लिए informed consent, कोई Aadhaar/account number नहीं, field और synthetic sources अलग, और negative findings भी publish होंगे। Sample और recruitment strategy fieldwork से पहले दर्ज की जाएगी।</p>
      </section>
    </main>
  );
}
