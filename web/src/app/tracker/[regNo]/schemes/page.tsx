import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import MockBadge from "@/components/MockBadge";
import { getPersonaAndFailure } from "@/lib/data";
import { getMockSessionId } from "@/lib/mock-auth";
import schemes from "@/lib/schemes";


export const metadata: Metadata = {
  title: "दूसरी किसान योजनाएँ",
};


interface SchemesPageProps {
  params: Promise<{ regNo: string }>;
}


export default async function SchemesPage({ params }: SchemesPageProps) {
  const { regNo } = await params;
  const match = getPersonaAndFailure(regNo);
  if (!match) notFound();
  if (!(await getMockSessionId())) redirect(`/status/${encodeURIComponent(regNo)}`);

  return (
    <main id="main-content" className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <Link
        href={`/tracker/${regNo}`}
        prefetch={false}
        className="inline-flex min-h-12 items-center border-b-2 border-[#1d2330] text-[18px] font-black focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#8f2d24]"
      >
        ← tracker पर वापस
      </Link>

      <header className="mt-7 grid border-4 border-[#1d2330] bg-[#f0c95a] shadow-[7px_7px_0_#8f2d24] md:grid-cols-[1fr_auto]">
        <div className="p-6 sm:p-9">
          <MockBadge hi="नमूना packet" en="NOT AN APPLICATION" tone="ink" />
          <h1 className="mt-4 text-[clamp(2.7rem,9vw,5.5rem)] font-black leading-[0.95] tracking-[-0.04em]">
            एक बार प्रमाण। चार रास्ते।
          </h1>
          <p className="mt-5 max-w-3xl text-[22px] font-bold leading-relaxed">
            PM-KISAN के लिए आपने ज़मीन और पहचान पहले ही साबित की। हर योजना में शून्य से वही काम क्यों?
          </p>
          <p className="mt-3 max-w-3xl text-[18px] leading-relaxed">
            अड़चन सिर्फ़ पहले से मौजूद नमूना जानकारी भरकर packet बनाता है। पात्रता जाँच और सरकारी submission नहीं करता।
          </p>
        </div>
        <div className="flex min-h-40 items-center justify-center border-t-4 border-[#1d2330] bg-[#292232] p-8 font-mono text-7xl font-black text-white md:border-l-4 md:border-t-0" aria-hidden="true">
          1→4
        </div>
      </header>

      <section className="mt-10 grid gap-6 md:grid-cols-2" aria-label="Adjacent schemes">
        {schemes.map((scheme, index) => (
          <article key={scheme.id} className="flex flex-col border-2 border-[#1d2330] bg-[#fffdf7] shadow-[5px_5px_0_#1d2330]">
            <div className="flex items-start justify-between gap-3 border-b-2 border-[#1d2330] p-5">
              <span className="font-mono text-5xl font-black text-[#8f2d24]">0{index + 1}</span>
              <MockBadge hi="नमूना packet" en="MOCKED" />
            </div>
            <div className="flex flex-1 flex-col p-5 sm:p-6">
              <h2 className="text-3xl font-black leading-tight">{scheme.name.hi}</h2>
              <p className="mt-1 text-[18px] text-[#5a554d]" lang="en">{scheme.name.en}</p>
              <p className="mt-5 text-[18px] font-bold leading-relaxed">{scheme.purpose.hi}</p>
              <div className="mt-5 border-l-8 border-[#f0c95a] bg-[#fff3c7] p-4">
                <p className="text-[16px] font-black text-[#8f2d24]">सिर्फ़ documented eligibility</p>
                <p className="mt-2 text-[18px] leading-relaxed">{scheme.documentedEligibility.hi}</p>
              </div>
              <p className="mt-4 text-[18px] leading-relaxed text-[#5a554d]">
                <strong className="text-[#1d2330]">अनिश्चित:</strong> {scheme.uncertainty.hi}
              </p>
              <div className="mt-auto pt-6">
                <Link
                  href={`/tracker/${regNo}/schemes/${scheme.id}`}
                  prefetch={false}
                  className="flex min-h-14 w-full items-center justify-center bg-[#8f2d24] px-5 py-3 text-center text-[20px] font-black text-white shadow-[3px_3px_0_#1d2330] focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#f0c95a]"
                >
                  Apply नहीं—packet बनाएँ →
                </Link>
              </div>
            </div>
          </article>
        ))}
      </section>

      <p className="mt-10 border-2 border-[#1d2330] bg-[#e5ded1] p-5 text-[18px] leading-relaxed">
        <strong>ईमानदार सीमा:</strong> अभी केवल ये चार चुनी हुई योजनाएँ शामिल हैं। कोई अतिरिक्त eligibility rule अनुमान से नहीं जोड़ा गया; हर card का official source उसके packet पर खुलता है।
      </p>
    </main>
  );
}
