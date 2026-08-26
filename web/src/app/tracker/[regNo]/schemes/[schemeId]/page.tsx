import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import MockBadge from "@/components/MockBadge";
import { getPersonaAndFailure } from "@/lib/data";
import { getMockSessionId } from "@/lib/mock-auth";
import schemes from "@/lib/schemes";


export const metadata: Metadata = { title: "नमूना आवेदन-पैकेट" };

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
    ["आधार और बैंक का विवरण", "जानबूझकर शामिल नहीं", "Not stored in this prototype"],
    ["अतिरिक्त पात्रता", "उपलब्ध नहीं—जाँच बाकी", "Not available — verification required"],
  ] as const;

  return (
    <main id="main-content" className="page-shell">
      <nav className="no-print grid gap-2" aria-label="आवेदन-पैकेट के दूसरे पन्ने">
        <Link href={`/tracker/${regNo}/schemes`} prefetch={false} className="touch-link">← योजनाओं पर वापस</Link>
        <Link href={`/tracker/${regNo}`} prefetch={false} className="touch-link">प्रगति देखें</Link>
      </nav>

      <header className="print-card mt-8">
        <div className="flex flex-wrap items-center gap-2">
          <p className="section-label">नमूना जानकारी से पहले से भरा</p>
          <MockBadge hi="नमूना आवेदन-पैकेट" en="NOT SUBMITTED" />
        </div>
        <h1 className="mt-3 text-[32px] font-semibold leading-[1.35]">{scheme.name.hi}</h1>
        <p className="secondary-copy mt-1" lang="en">{scheme.name.en}</p>
      </header>

      <section className="document-card print-card mt-8" aria-labelledby="packet-title">
        <div className="border-b border-[var(--rule)] p-5 sm:p-6">
          <h2 id="packet-title" className="text-[28px] font-semibold">पहले से भरा पैकेट</h2>
        </div>
        <dl>
          {packetFields.map(([label, hi, en]) => (
            <div key={label} className="border-b border-[var(--rule)] p-5 last:border-b-0 sm:p-6">
              <dt className="section-label">{label}</dt>
              <dd className="mt-2">
                <p className="text-[20px] font-semibold">{hi}</p>
                <p className="secondary-copy mt-1" lang="en">{en}</p>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="document-card print-card mt-8" aria-labelledby="checklist-title">
        <div className="border-b border-[var(--rule)] p-5 sm:p-6">
          <h2 id="checklist-title" className="text-[28px] font-semibold">दस्तावेज़ों की सूची</h2>
        </div>
        <ol className="p-5 sm:p-6">
          {scheme.documents.map((document, index) => (
            <li key={document.en} className="flex gap-4 border-b border-[var(--rule)] py-4 first:pt-0 last:border-b-0 last:pb-0">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-[var(--ink)] font-semibold" aria-hidden="true">{index + 1}</span>
              <span>
                <strong className="block text-[19px] font-semibold">{document.hi}</strong>
                <span className="secondary-copy" lang="en">{document.en}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="document-card print-card mt-8 p-5 sm:p-6">
        <h2 className="text-[26px] font-semibold">कहाँ ले जाएँ</h2>
        <p className="mt-3 text-[20px] font-semibold leading-[1.6]">{scheme.applyAt.hi}</p>
        <p className="secondary-copy mt-1" lang="en">{scheme.applyAt.en}</p>
        <div className="mt-6 border-t border-[var(--rule)] pt-5">
          <h2 className="text-[26px] font-semibold">जो अभी पक्का नहीं</h2>
          <p className="mt-3 text-[19px] leading-[1.6]">{scheme.uncertainty.hi}</p>
          <p className="secondary-copy mt-1" lang="en">{scheme.uncertainty.en}</p>
        </div>
      </section>

      <section className="no-print document-card mt-8 p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[19px] font-semibold">यह जमा नहीं हुआ</p>
          <MockBadge hi="सिर्फ़ नमूना पैकेट" en="PACKET ONLY" />
        </div>
        <p className="mt-3 text-[19px] leading-[1.6]">
          इस पन्ने पर जमा करने का बटन जानबूझकर नहीं है। ब्राउज़र के प्रिंट मेनू से पैकेट रखें, फिर आधिकारिक माध्यम पर पात्रता जाँचें।
        </p>
        <a href={scheme.source.url} target="_blank" rel="noreferrer" className="touch-link mt-5">
          आधिकारिक स्रोत खोलें: {scheme.source.label}
        </a>
      </section>
    </main>
  );
}
