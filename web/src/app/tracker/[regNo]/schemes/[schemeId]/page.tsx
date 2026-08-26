import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import MockBadge from "@/components/MockBadge";
import { getPersonaAndFailure } from "@/lib/data";
import { getMockSessionId } from "@/lib/mock-auth";
import schemes from "@/lib/schemes";


export const metadata: Metadata = {
  title: "नमूना application packet",
};


interface SchemePacketPageProps {
  params: Promise<{ regNo: string; schemeId: string }>;
}


export default async function SchemePacketPage({ params }: SchemePacketPageProps) {
  const { regNo, schemeId } = await params;
  const match = getPersonaAndFailure(regNo);
  const scheme = schemes.find((item) => item.id === schemeId);
  if (!match || !scheme) notFound();
  if (!(await getMockSessionId())) redirect(`/status/${encodeURIComponent(regNo)}`);

  const packetFields = [
    ["योजना", scheme.name.hi, scheme.name.en],
    ["आवेदक", match.persona.name.hi, match.persona.name.en],
    ["PM-KISAN संदर्भ", match.persona.regNo, "Fictional demo registration"],
    ["गाँव", match.persona.village.hi, match.persona.village.en],
    ["ज़िला", match.persona.district.hi, match.persona.district.en],
    ["आधार/बैंक विवरण", "जानबूझकर शामिल नहीं", "Not stored in this prototype"],
    ["अतिरिक्त पात्रता", "उपलब्ध नहीं—सत्यापन बाकी", "Not available — verification required"],
  ] as const;

  return (
    <main id="main-content" className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <nav className="no-print flex flex-wrap gap-5" aria-label="Packet navigation">
        <Link
          href={`/tracker/${regNo}/schemes`}
          prefetch={false}
          className="inline-flex min-h-12 items-center border-b-2 border-[#1d2330] text-[18px] font-black focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#8f2d24]"
        >
          ← योजनाओं पर वापस
        </Link>
        <Link
          href={`/tracker/${regNo}`}
          prefetch={false}
          className="inline-flex min-h-12 items-center border-b-2 border-[#1d2330] text-[18px] font-black focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#8f2d24]"
        >
          tracker देखें
        </Link>
      </nav>

      <header className="print-card mt-7 border-4 border-[#1d2330] bg-[#292232] p-6 text-white shadow-[7px_7px_0_#f0c95a] sm:p-9">
        <MockBadge hi="नमूना application packet" en="NOT SUBMITTED" tone="ochre" />
        <p className="mt-5 font-mono text-[16px] font-black tracking-[0.12em] text-[#f0c95a]">PREFILLED FROM SYNTHETIC PM-KISAN DATA</p>
        <h1 className="mt-3 text-[clamp(2.6rem,8vw,5rem)] font-black leading-none tracking-[-0.04em]">{scheme.name.hi}</h1>
        <p className="mt-2 text-[20px] text-[#eee8ef]" lang="en">{scheme.name.en}</p>
      </header>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="print-card border-2 border-[#1d2330] bg-[#fffdf7] shadow-[5px_5px_0_#1d2330]" aria-labelledby="packet-title">
          <div className="border-b-2 border-[#1d2330] bg-[#f0c95a] px-5 py-4">
            <h2 id="packet-title" className="text-3xl font-black">पहले से भरा packet</h2>
          </div>
          <dl>
            {packetFields.map(([label, hi, en]) => (
              <div key={label} className="grid border-b border-[#827b6d] p-5 last:border-b-0 sm:grid-cols-[12rem_1fr] sm:gap-5">
                <dt className="text-[18px] font-black text-[#8f2d24]">{label}</dt>
                <dd>
                  <p className="text-[20px] font-black">{hi}</p>
                  <p className="mt-1 text-[16px] text-[#5a554d]" lang="en">{en}</p>
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="print-card border-2 border-[#1d2330] bg-[#fff3c7] shadow-[5px_5px_0_#8f2d24]" aria-labelledby="checklist-title">
          <div className="border-b-2 border-[#1d2330] bg-[#8f2d24] px-5 py-4 text-white">
            <h2 id="checklist-title" className="text-3xl font-black">दस्तावेज़ checklist</h2>
          </div>
          <ol className="p-5 sm:p-6">
            {scheme.documents.map((document, index) => (
              <li key={document.en} className="flex gap-4 border-b border-[#827b6d] py-4 first:pt-0 last:border-b-0 last:pb-0">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-[#1d2330] bg-white font-mono text-[18px] font-black">{index + 1}</span>
                <span>
                  <strong className="block text-[18px]">{document.hi}</strong>
                  <span className="text-[16px] text-[#5a554d]" lang="en">{document.en}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <section className="print-card mt-8 grid border-2 border-[#1d2330] bg-[#e5ded1] lg:grid-cols-2">
        <div className="border-b-2 border-[#1d2330] p-5 sm:p-6 lg:border-b-0 lg:border-r-2">
          <h2 className="text-2xl font-black">कहाँ ले जाएँ</h2>
          <p className="mt-3 text-[20px] font-bold leading-relaxed">{scheme.applyAt.hi}</p>
          <p className="mt-2 text-[18px] text-[#5a554d]" lang="en">{scheme.applyAt.en}</p>
        </div>
        <div className="p-5 sm:p-6">
          <h2 className="text-2xl font-black text-[#8f2d24]">जो अभी पक्का नहीं</h2>
          <p className="mt-3 text-[18px] leading-relaxed">{scheme.uncertainty.hi}</p>
          <p className="mt-2 text-[16px] text-[#5a554d]" lang="en">{scheme.uncertainty.en}</p>
        </div>
      </section>

      <section className="no-print mt-8 border-2 border-[#1d2330] bg-[#fffdf7] p-5 sm:p-6">
        <MockBadge hi="जमा नहीं हुआ" en="PACKET ONLY" />
        <p className="mt-3 text-[20px] font-black">इस page पर कोई submit button जानबूझकर नहीं है। Browser के print menu से packet रखें, फिर official channel पर eligibility जाँचें।</p>
        <a
          href={scheme.source.url}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex min-h-12 items-center border-b-2 border-[#8f2d24] text-[18px] font-black text-[#8f2d24] focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#1d2330]"
        >
          आधिकारिक source खोलें: {scheme.source.label} ↗
        </a>
      </section>
    </main>
  );
}
