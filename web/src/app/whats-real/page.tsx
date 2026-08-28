import type { Metadata } from "next";
import Link from "@/components/PlainLink";

import MockBadge from "@/components/MockBadge";


export const metadata: Metadata = {
  title: "क्या असली है?",
  description: "अड़चन प्रोटोटाइप में क्या काम करता है, क्या नकली है और किस सरकारी पहुँच की ज़रूरत है।",
};

const WORKS_TODAY = [
  "स्थिर कारण-सूची से निदान",
  "आठ नमूना लाभार्थी और जुड़ाव की कड़ी",
  "निदान और अगला-कदम कार्ड",
  "पहले से बनी हिंदी आवाज़",
  "आवाज़-से-हिंदी लिखाई (Sarvam Saarika)—प्रोडक्शन में जाँचकर चालू पाई गई",
  "ऑफलाइन चलने वाले स्थिति पन्ने",
  "निदान के बाद सुरक्षित नमूना session और Postgres tracker",
  "कारण-सूची से CPGRAMS मसौदा और चार स्रोत-समर्थित योजना पैकेट",
] as const;

const MOCKED = [
  "सभी लाभार्थी नाम और गाँव",
  "UP-DEMO रजिस्ट्रेशन नंबर",
  "नमूना OTP: 123456",
  "भुगतान और आधार का पूरा डेटा",
  "CPGRAMS जमा और लौटाया गया शिकायत नंबर",
  "दूसरी योजनाओं के पैकेट—कोई आवेदन सरकारी व्यवस्था में नहीं जाता",
  "कोई असली सरकारी रिकॉर्ड कहीं नहीं",
] as const;

const NEEDS_ACCESS = [
  "PM-KISAN लाभार्थी स्थिति API",
  "PFMS भुगतान-अस्वीकृति के कारण",
  "NPCI आधार-बैंक mapping की स्थिति",
  "राज्यों के भूमि-अभिलेख database",
  "CPGRAMS शिकायत जमा करना",
] as const;

const LIMITATIONS = [
  "दफ़्तर, दस्तावेज़ और सामान्य दिनों की जानकारी अभी CSC संचालक से क्षेत्र में सत्यापित नहीं हुई। यह हमारा सबसे अच्छा अनुमान है और कुछ राज्यों में गलत हो सकता है।",
  "आवाज़-से-हिंदी लिखाई (Sarvam Saarika) प्रोडक्शन में जाँचकर चालू पाई गई, लेकिन बोली गई शिकायत को कारण-कोड में बदलने वाला classifier अभी उपलब्ध नहीं है—हमारा LLM gateway खाता ब्लॉक हो गया और डेडलाइन से पहले किसी सीधे provider के लिए भुगतान नहीं हो सका। सिस्टम डिज़ाइन के मुताबिक ही व्यवहार करता है: कारण-कोड का अंदाज़ा लगाने की बजाय हिंदी में स्पष्ट करने वाला सवाल पूछता है। इसलिए classifier की सटीकता अभी मापी नहीं जा सकी है; हमारा eval harness—60 मामले, 12 कोड, misroute rate की सीमा सहित—बना हुआ है और माँगने पर चलता है।",
  "Sarvam STT 30 सेकंड तक सीमित है; लंबी recording OpenAI fallback पर जाती है।",
  "Render के मुफ्त API पर 15 मिनट से ज़्यादा निष्क्रिय रहने के बाद पहला अनुरोध लगभग 50 सेकंड ले सकता है; उसके बाद सेवा सामान्य गति पर लौटती है।",
  "किसानों के असली फोन और network conditions पर usability test अभी नहीं हुआ।",
] as const;


export default function WhatsRealPage() {
  return (
    <main id="main-content" className="page-shell">
      <Link href="/" prefetch={false} className="touch-link">← होम पर वापस</Link>

      <header className="mt-8">
        <p className="section-label">परियोजना की ईमानदार स्थिति</p>
        <h1 className="mt-3 text-[32px] font-semibold leading-[1.35]">क्या असली है?</h1>
        <p className="mt-4 text-[19px] leading-[1.6]">
          डेमो में जो चलता दिखता है, उसका हर हिस्सा असली डेटा नहीं है। यहाँ दोनों के बीच साफ़ रेखा है।
        </p>
      </header>

      <section className="mt-8 grid gap-6" aria-label="प्रोटोटाइप की स्थिति">
        <article className="document-card border-[3px] border-[var(--c-moss)] p-5 sm:p-6">
          <p className="section-label">आज काम करता है</p>
          <p className="secondary-copy mt-1" lang="en">Works today</p>
          <ul className="mt-5 list-disc space-y-3 pl-6 text-[19px] leading-[1.6]">
            {WORKS_TODAY.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </article>

        <article className="document-card p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-[28px] font-semibold">नमूना या नकली</h2>
            <MockBadge />
          </div>
          <p className="secondary-copy mt-1" lang="en">Mocked</p>
          <ul className="mt-5 list-disc space-y-3 pl-6 text-[19px] leading-[1.6]">
            {MOCKED.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </article>

        <article className="document-card p-5 sm:p-6">
          <h2 className="text-[28px] font-semibold">सरकारी पहुँच चाहिए</h2>
          <p className="secondary-copy mt-1" lang="en">Needs government access</p>
          <ul className="mt-5 list-disc space-y-3 pl-6 text-[19px] leading-[1.6]">
            {NEEDS_ACCESS.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </article>
      </section>

      <section className="document-card mt-8" aria-labelledby="limitations-title">
        <div className="border-b border-[var(--c-sage)] p-5 sm:p-6">
          <p className="section-label">ज्ञात सीमाएँ</p>
          <h2 id="limitations-title" className="mt-2 text-[28px] font-semibold">जो हमें अभी नहीं पता</h2>
          <p className="secondary-copy mt-1" lang="en">Known limitations</p>
        </div>
        <ol>
          {LIMITATIONS.map((limitation, index) => (
            <li key={limitation} className="border-b border-[var(--c-sage)] p-5 text-[19px] leading-[1.6] last:border-b-0 sm:p-6">
              <strong>{index + 1}.</strong> {limitation}
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-8" aria-labelledby="numbers-title">
        <div className="flex flex-wrap items-center gap-2">
          <h2 id="numbers-title" className="text-[28px] font-semibold">मापे जाने वाले आँकड़े</h2>
          <MockBadge hi="माप बाकी" en="PENDING" />
        </div>
        <dl className="mt-5 grid gap-3">
          {[
            ["वर्गीकरण की सटीकता", "Classifier accuracy", "__ %"],
            ["गलत दफ़्तर भेजने की दर", "Misroute rate", "__ %"],
            ["किसान साक्षात्कार", "Farmer interviews", "__"],
            ["असली फोन पर जाँच", "Real-device tests", "__"],
          ].map(([hi, en, value]) => (
            <div key={en} className="document-card p-4">
              <dt className="text-[19px] font-semibold">{hi}<span className="secondary-copy block" lang="en">{en}</span></dt>
              <dd className="mt-2 text-[30px] font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>
    </main>
  );
}
