import type { Metadata } from "next";
import Link from "next/link";


export const metadata: Metadata = {
  title: "क्या असली है?",
  description: "अड़चन प्रोटोटाइप में क्या काम करता है, क्या नकली है और किस सरकारी पहुँच की ज़रूरत है।",
};


const COLUMNS = [
  {
    label: "आज काम करता है",
    en: "WORKS TODAY",
    tone: "border-[#14633f] bg-[#eaf7ef]",
    badge: "bg-[#14633f] text-white",
    items: [
      "स्थिर taxonomy से निदान",
      "आठ डेमो personas और linkage map",
      "निदान और action cards",
      "पहले से बने हिंदी audio",
      "ऑफलाइन चलने वाले status pages",
      "खुली शिकायत का LLM classification pipeline — जब configured gateway जवाब दे",
    ],
  },
  {
    label: "नमूना / नकली",
    en: "MOCKED",
    tone: "border-[#8f2d24] bg-[#fff0ed]",
    badge: "bg-[#8f2d24] text-white",
    items: [
      "सभी लाभार्थी नाम और गांव",
      "UP-DEMO registration numbers",
      "डेमो OTP: 123456",
      "सभी payment और Aadhaar data",
      "कोई असली सरकारी record कहीं भी नहीं",
    ],
  },
  {
    label: "सरकारी पहुँच चाहिए",
    en: "NEEDS GOVERNMENT ACCESS",
    tone: "border-[#1d2330] bg-[#ece8df]",
    badge: "bg-[#292232] text-white",
    items: [
      "PM-KISAN beneficiary status API",
      "PFMS rejection reasons",
      "NPCI Aadhaar–bank mapping status",
      "राज्यों के land-record databases",
      "CPGRAMS grievance submission",
    ],
  },
] as const;


const LIMITATIONS = [
  "office, documents और typicalDays अभी CSC operator से field-verified नहीं हैं। ये हमारी सबसे अच्छी inference है और कुछ राज्यों में गलत हो सकती है।",
  "Classifier accuracy अभी unmeasured है; working gateway पर eval baseline बाकी है।",
  "Sarvam STT 30 सेकंड तक सीमित है; लंबी recording OpenAI fallback पर जाती है।",
  "अभी तक किसानों के असली फोन और network conditions पर usability test नहीं हुआ है।",
] as const;


export default function WhatsRealPage() {
  return (
    <main id="main-content" className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <Link
        href="/"
        prefetch={false}
        className="inline-flex min-h-12 items-center border-b-2 border-[#1d2330] text-[18px] font-black focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#8f2d24]"
      >
        ← होम पर वापस
      </Link>

      <header className="mt-7 border-y-4 border-[#1d2330] bg-[#f0c95a] px-5 py-8 sm:px-8">
        <span className="inline-block bg-[#1d2330] px-3 py-1 text-[18px] font-black text-white">
          ईमानदार स्थिति · PROJECT STATUS
        </span>
        <h1 className="mt-4 text-[clamp(2.5rem,9vw,5.5rem)] font-black leading-none tracking-[-0.04em]">
          क्या असली है?
        </h1>
        <p className="mt-4 max-w-3xl text-[20px] font-bold leading-relaxed">
          डेमो में जो चलता दिखता है, उसका हर हिस्सा production data नहीं है। यह पन्ना दोनों के बीच साफ़ रेखा खींचता है।
        </p>
      </header>

      <section className="mt-10 grid gap-6 lg:grid-cols-3" aria-label="प्रोटोटाइप की स्थिति">
        {COLUMNS.map((column) => (
          <article key={column.en} className={`border-2 p-5 shadow-[5px_5px_0_#1d2330] ${column.tone}`}>
            <span className={`inline-block px-3 py-1 text-[16px] font-black ${column.badge}`} lang="en">
              {column.en}
            </span>
            <h2 className="mt-3 text-3xl font-black">{column.label}</h2>
            <ul className="mt-5 space-y-4">
              {column.items.map((item) => (
                <li key={item} className="flex gap-3 text-[18px] leading-relaxed">
                  <span aria-hidden="true" className="font-black">—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section className="mt-12 border-2 border-[#1d2330] bg-[#fffdf7] shadow-[6px_6px_0_#8f2d24]" aria-labelledby="limitations-title">
        <div className="border-b-2 border-[#1d2330] bg-[#1d2330] px-5 py-4 text-white">
          <p className="text-[16px] font-black tracking-[0.12em] text-[#f0c95a]" lang="en">KNOWN LIMITATIONS</p>
          <h2 id="limitations-title" className="mt-1 text-3xl font-black">जो हमें अभी नहीं पता</h2>
        </div>
        <ol className="grid gap-0 md:grid-cols-2">
          {LIMITATIONS.map((limitation, index) => (
            <li key={limitation} className="border-b border-[#827b6d] p-5 text-[18px] leading-relaxed md:odd:border-r">
              <span className="mr-2 font-black text-[#8f2d24]">{index + 1}.</span>
              {limitation}
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-10" aria-labelledby="numbers-title">
        <span className="inline-block bg-[#8f2d24] px-3 py-1 text-[16px] font-black text-white">माप बाकी · PENDING</span>
        <h2 id="numbers-title" className="mt-3 text-3xl font-black">Evidence slots</h2>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Classifier accuracy", "__ %"],
            ["Misroute rate", "__ %"],
            ["Farmer interviews", "__"],
            ["Real-device tests", "__"],
          ].map(([label, value]) => (
            <div key={label} className="border-2 border-dashed border-[#5a554d] bg-[#ece8df] p-4">
              <dt className="text-[18px] font-bold">{label}</dt>
              <dd className="mt-2 text-4xl font-black">{value}</dd>
            </div>
          ))}
        </dl>
      </section>
    </main>
  );
}
