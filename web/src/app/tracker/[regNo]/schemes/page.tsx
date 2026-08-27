import type { Metadata } from "next";
import { redirect } from "next/navigation";

import MockBadge from "@/components/MockBadge";
import Link from "@/components/PlainLink";
import { getPersonaAndFailure } from "@/lib/data";
import { getMockSessionId } from "@/lib/mock-auth";
import schemes from "@/lib/schemes";


export const metadata: Metadata = { title: "दूसरी किसान योजनाएँ" };

interface SchemesPageProps {
  params: Promise<{ regNo: string }>;
}


export default async function SchemesPage({ params }: SchemesPageProps) {
  const { regNo } = await params;
  const match = getPersonaAndFailure(regNo);
  if (!match) redirect("/");
  if (!(await getMockSessionId())) redirect(`/status/${encodeURIComponent(regNo)}`);

  return (
    <main id="main-content" className="page-shell">
      <Link href={`/tracker/${regNo}`} prefetch={false} className="touch-link">← प्रगति पर वापस</Link>

      <header className="mt-8">
        <div className="flex flex-wrap items-center gap-2">
          <p className="section-label">एक प्रमाण, दूसरी योजनाएँ</p>
          <MockBadge hi="नमूना packet" en="NOT AN APPLICATION" />
        </div>
        <h1 className="mt-3 text-[32px] font-semibold leading-[1.35]">एक बार प्रमाण। चार रास्ते।</h1>
        <p className="mt-4 text-[21px] font-semibold leading-[1.6]">
          PM-KISAN के लिए आपने ज़मीन और पहचान पहले ही साबित की। हर योजना में शून्य से वही काम क्यों?
        </p>
        <p className="mt-3 text-[19px] leading-[1.6]">
          अड़चन केवल पहले से मौजूद नमूना जानकारी भरकर पैकेट बनाता है। पात्रता की जाँच या सरकारी जमा नहीं करता।
        </p>
      </header>

      <section className="mt-8 grid gap-6" aria-label="दूसरी किसान योजनाएँ">
        {schemes.map((scheme) => (
          <article key={scheme.id} className="document-card">
            <div className="border-b border-[var(--rule)] p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-[28px] font-semibold leading-[1.35]">{scheme.name.hi}</h2>
                <MockBadge hi="नमूना packet" />
              </div>
              <p className="secondary-copy mt-1" lang="en">{scheme.name.en}</p>
            </div>
            <div className="p-5 sm:p-6">
              <p className="text-[19px] font-semibold leading-[1.6]">{scheme.purpose.hi}</p>
              <p className="secondary-copy mt-1" lang="en">{scheme.purpose.en}</p>

              <div className="mt-5 border-l-4 border-[var(--ink)] pl-4">
                <p className="section-label">सिर्फ़ प्रकाशित पात्रता</p>
                <p className="mt-2 text-[19px] leading-[1.6]">{scheme.documentedEligibility.hi}</p>
              </div>
              <p className="mt-5 text-[19px] leading-[1.6]">
                <strong>जो अभी पक्का नहीं:</strong> {scheme.uncertainty.hi}
              </p>
              <Link href={`/tracker/${regNo}/schemes/${scheme.id}`} prefetch={false} className="primary-action mt-5 w-full">
                आवेदन नहीं—पैकेट बनाएँ
              </Link>
            </div>
          </article>
        ))}
      </section>

      <p className="mt-8 border-t border-[var(--rule)] pt-5 text-[19px] leading-[1.6]">
        <strong>ईमानदार सीमा:</strong> केवल ये चार योजनाएँ शामिल हैं। कोई पात्रता नियम अनुमान से नहीं जोड़ा गया; आधिकारिक स्रोत हर पैकेट पर दिया है।
      </p>
    </main>
  );
}
