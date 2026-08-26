import type { Metadata } from "next";
import Link from "next/link";

import MockBadge from "@/components/MockBadge";


export const metadata: Metadata = {
  title: "यह कैसे काम करता है",
  description: "अड़चन का integration path, policy argument, scale, privacy और last-mile योजना।",
};

const SYSTEMS = [
  {
    hi: "PM-KISAN लाभार्थी स्थिति",
    en: "PM-KISAN beneficiary status",
    accessHi: "API और समझौता",
    accessEn: "API + MoU",
    detail: "नागरिक lookup सार्वजनिक है; भरोसेमंद server-to-server स्थिति और सहमति वाले lookup के लिए अधिकृत API चाहिए।",
  },
  {
    hi: "PFMS भुगतान-अस्वीकृति के कारण",
    en: "PFMS rejection reasons",
    accessHi: "API और समझौता",
    accessEn: "API + MoU",
    detail: "भुगतान रुकने का संरचित कारण सार्वजनिक पन्ने से नहीं मिलता; PFMS integration और विभागीय सहमति चाहिए।",
  },
  {
    hi: "NPCI mapper",
    en: "NPCI mapper",
    accessHi: "API और समझौता",
    accessEn: "API + MoU",
    detail: "व्यक्ति सीमित माध्यमों में seeding स्थिति देख सकता है; product-level mapping जाँच के लिए नियंत्रित integration चाहिए।",
  },
  {
    hi: "राज्य भूमि-अभिलेख",
    en: "State land records",
    accessHi: "सार्वजनिक पन्ने और राज्य API/समझौता",
    accessEn: "Public + state API/MoU",
    detail: "भूलेख जैसे नागरिक portal सार्वजनिक हैं, लेकिन एक-जैसी machine access के लिए हर राज्य की अलग अनुमति और schema चाहिए।",
  },
  {
    hi: "CPGRAMS शिकायत व्यवस्था",
    en: "CPGRAMS",
    accessHi: "सार्वजनिक portal; जमा करने के लिए API/समझौता",
    accessEn: "Public portal; API/MoU for submission",
    detail: "नागरिक portal सार्वजनिक है; अड़चन से सीधे शिकायत दाखिल करने के लिए अधिकृत programmatic integration चाहिए।",
  },
] as const;


export default function HowItWorksPage() {
  return (
    <main id="main-content" className="page-shell">
      <Link href="/" prefetch={false} className="touch-link">← होम पर वापस</Link>

      <header className="mt-8">
        <p className="section-label">व्यवस्था और प्रक्रिया</p>
        <h1 className="mt-3 text-[32px] font-semibold leading-[1.35]">यह असल में कैसे काम करेगा</h1>
        <p className="mt-4 text-[19px] leading-[1.6]">
          अड़चन सिर्फ़ एक interface नहीं है। यह विभागों के अंदरूनी error को नागरिक के लिए वजह और समाधान के रास्ते में बदलने का नमूना है।
        </p>
      </header>

      <section className="mt-8" aria-labelledby="integration-title">
        <p className="section-label">जुड़ने का रास्ता</p>
        <h2 id="integration-title" className="mt-2 text-[28px] font-semibold leading-[1.35]">पाँच असली व्यवस्थाएँ, पाँच पहुँच के रास्ते</h2>
        <p className="secondary-copy mt-1" lang="en">Integration path</p>
        <div className="mt-5 overflow-x-auto rounded-[4px] border-2 border-[var(--ink)] bg-[var(--surface)]">
          <table className="w-full min-w-[720px] border-collapse text-left text-[19px]">
            <thead className="border-b-2 border-[var(--ink)]">
              <tr>
                <th className="p-4">व्यवस्था<span className="secondary-copy block" lang="en">System</span></th>
                <th className="p-4">ज़रूरी पहुँच<span className="secondary-copy block" lang="en">Access needed</span></th>
                <th className="p-4">क्यों</th>
              </tr>
            </thead>
            <tbody>
              {SYSTEMS.map((row) => (
                <tr key={row.en} className="border-b border-[var(--rule)] align-top last:border-b-0">
                  <th className="p-4 font-semibold" scope="row">{row.hi}<span className="secondary-copy block" lang="en">{row.en}</span></th>
                  <td className="p-4 font-semibold">{row.accessHi}<span className="secondary-copy block" lang="en">{row.accessEn}</span></td>
                  <td className="p-4 leading-[1.6]">{row.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="document-card mt-8 border-[3px] p-5 sm:p-6" aria-labelledby="process-title">
        <p className="section-label">प्रक्रिया का तर्क</p>
        <h2 id="process-title" className="mt-2 text-[28px] font-semibold leading-[1.4]">नागरिक को अंदरूनी error code कभी नहीं दिखना चाहिए।</h2>
        <p className="mt-4 text-[21px] font-semibold leading-[1.6]">
          असली सुधार upstream है: एक standard error taxonomy प्रकाशित हो, ताकि हर विभाग का portal नागरिक को पढ़ने लायक वजह और समाधान का रास्ता लौटाए। अड़चन उसका प्रदर्शन है; नीति-सिफ़ारिश ही असली product है।
        </p>
      </section>

      <section className="document-card mt-8 p-5 sm:p-6" aria-labelledby="scale-title">
        <p className="section-label">बढ़े हुए बोझ की तैयारी</p>
        <h2 id="scale-title" className="mt-2 text-[28px] font-semibold">भीड़ बराबर नहीं आती</h2>
        <p className="mt-3 text-[19px] leading-[1.6]">
          किस्तें साल में तीन बार एक साथ आती हैं। Status endpoint पर अचानक भारी भीड़ होगी—steady traffic नहीं। Edge caching, queued writes और degraded-mode reads पहले दिन से design का हिस्सा हैं।
        </p>
      </section>

      <section className="document-card mt-8 p-5 sm:p-6" aria-labelledby="privacy-title">
        <p className="section-label">निजता</p>
        <h2 id="privacy-title" className="mt-2 text-[28px] font-semibold">कम डेटा रखकर सुरक्षा</h2>
        <p className="mt-3 text-[19px] leading-[1.6]">
          Production लक्ष्य: DPDP Act के अनुसार स्थायी रूप से कोई PII नहीं, state केवल session तक, साफ़ सहमति, न्यूनतम fields और भारत में data residency। यह prototype केवल synthetic records रखता है; यह कानूनी compliance certificate नहीं है।
        </p>
      </section>

      <section className="document-card mt-8 p-5 sm:p-6" aria-labelledby="last-mile-title">
        <div className="flex flex-wrap items-center gap-2">
          <h2 id="last-mile-title" className="text-[28px] font-semibold">आख़िरी दूरी फोन से आगे है</h2>
          <MockBadge hi="वर्णित, बनाया नहीं" en="NOT BUILT" />
        </div>
        <p className="mt-3 text-[19px] leading-[1.6]">
          हर लाभार्थी के पास smartphone नहीं है। आगे के रास्ते: CSC संचालक mode, परिवार के लिए WhatsApp bot और feature phone के लिए IVR। ये roadmap हैं, बनी हुई सुविधाएँ नहीं।
        </p>
      </section>
    </main>
  );
}
