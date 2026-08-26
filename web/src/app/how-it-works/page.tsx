import type { Metadata } from "next";
import Link from "next/link";


export const metadata: Metadata = {
  title: "यह कैसे काम करता है",
  description: "अड़चन का integration path, policy argument, scale, privacy और last-mile योजना।",
};


const SYSTEMS = [
  {
    system: "PM-KISAN beneficiary status",
    access: "API + MoU",
    detail: "Citizen lookup public है; reliable server-to-server status और consented lookup के लिए अधिकृत API चाहिए।",
  },
  {
    system: "PFMS rejection reasons",
    access: "API + MoU",
    detail: "Payment rejection का structured reason public page से नहीं मिलता; PFMS integration और departmental agreement चाहिए।",
  },
  {
    system: "NPCI mapper",
    access: "API + MoU",
    detail: "व्यक्ति अपना seeding status सीमित channels में देख सकता है; product-level mapping check regulated integration है।",
  },
  {
    system: "State land records",
    access: "Public + state API/MoU",
    detail: "Bhulekh जैसे citizen portals public हैं, लेकिन normalized machine access हर राज्य में अलग permission और schema मांगता है।",
  },
  {
    system: "CPGRAMS",
    access: "Public portal; API/MoU for submission",
    detail: "Citizen grievance portal public है; Adchan से सीधे case दाखिल करने के लिए authorized programmatic integration चाहिए।",
  },
] as const;


export default function HowItWorksPage() {
  return (
    <main id="main-content" className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <Link
        href="/"
        prefetch={false}
        className="inline-flex min-h-12 items-center border-b-2 border-[#1d2330] text-[18px] font-black focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#8f2d24]"
      >
        ← होम पर वापस
      </Link>

      <header className="mt-7 grid border-4 border-[#1d2330] bg-[#fffdf7] shadow-[7px_7px_0_#f0c95a] md:grid-cols-[1fr_auto]">
        <div className="p-6 sm:p-9">
          <span className="inline-block bg-[#292232] px-3 py-1 text-[16px] font-black text-white">SYSTEM + PROCESS</span>
          <h1 className="mt-4 text-[clamp(2.5rem,9vw,5rem)] font-black leading-[0.95] tracking-[-0.04em]">
            यह असल में कैसे काम करेगा
          </h1>
          <p className="mt-5 max-w-3xl text-[20px] font-bold leading-relaxed">
            अड़चन सिर्फ़ एक interface नहीं है। यह दिखाता है कि विभागों के internal errors को नागरिक के लिए reason और resolution path में कैसे बदला जाए।
          </p>
        </div>
        <div className="flex min-h-40 items-center justify-center border-t-4 border-[#1d2330] bg-[#8f2d24] p-8 text-7xl text-white md:border-l-4 md:border-t-0" aria-hidden="true">
          01→05
        </div>
      </header>

      <section className="mt-12" aria-labelledby="integration-title">
        <p className="text-[16px] font-black tracking-[0.12em] text-[#8f2d24]" lang="en">INTEGRATION PATH</p>
        <h2 id="integration-title" className="mt-1 text-4xl font-black">पाँच असली systems, पाँच access paths</h2>
        <div className="mt-5 overflow-x-auto border-2 border-[#1d2330] bg-[#fffdf7]">
          <table className="w-full min-w-[760px] border-collapse text-left text-[18px]">
            <thead className="bg-[#1d2330] text-white">
              <tr>
                <th className="p-4">System</th>
                <th className="p-4">Access needed</th>
                <th className="p-4">क्यों</th>
              </tr>
            </thead>
            <tbody>
              {SYSTEMS.map((row) => (
                <tr key={row.system} className="border-b border-[#827b6d] align-top last:border-b-0">
                  <th className="p-4 font-black" scope="row">{row.system}</th>
                  <td className="p-4"><span className="inline-block bg-[#f0c95a] px-2 py-1 font-black">{row.access}</span></td>
                  <td className="p-4 leading-relaxed">{row.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-12 border-l-8 border-[#f0c95a] bg-[#292232] p-6 text-white sm:p-9" aria-labelledby="process-title">
        <p className="text-[16px] font-black tracking-[0.12em] text-[#f0c95a]" lang="en">THE PROCESS ARGUMENT</p>
        <h2 id="process-title" className="mt-2 text-4xl font-black">नागरिक को internal error code कभी नहीं दिखना चाहिए।</h2>
        <p className="mt-5 max-w-4xl text-[22px] font-bold leading-relaxed">
          असली सुधार upstream है: एक standard error taxonomy प्रकाशित हो, ताकि हर विभाग का portal नागरिक को पढ़ने लायक वजह और समाधान का रास्ता लौटाए। अड़चन उसका demonstration है; policy recommendation ही असली product है।
        </p>
      </section>

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        <section className="border-2 border-[#1d2330] bg-[#fffdf7] p-6 shadow-[5px_5px_0_#1d2330]" aria-labelledby="scale-title">
          <span className="text-5xl font-black text-[#8f2d24]">3×</span>
          <h2 id="scale-title" className="mt-3 text-3xl font-black">Scale comes in spikes</h2>
          <p className="mt-3 text-[18px] leading-relaxed">किस्तें साल में तीन बार एक साथ आती हैं। Status endpoint पर thundering herd होगा—steady traffic नहीं। Edge caching, queued writes और degraded-mode reads पहले दिन से design का हिस्सा हैं।</p>
        </section>
        <section className="border-2 border-[#1d2330] bg-[#eaf7ef] p-6 shadow-[5px_5px_0_#14633f]" aria-labelledby="privacy-title">
          <span className="inline-block bg-[#14633f] px-3 py-1 text-[16px] font-black text-white">DPDP-AWARE DESIGN</span>
          <h2 id="privacy-title" className="mt-3 text-3xl font-black">Privacy by refusal</h2>
          <p className="mt-3 text-[18px] leading-relaxed">Production design target: PII at rest नहीं, state केवल session तक, स्पष्ट consent, minimum fields और भारत में data residency। यह prototype केवल synthetic records रखता है; यह कानूनी compliance certification नहीं है।</p>
        </section>
        <section className="border-2 border-[#1d2330] bg-[#fff3c7] p-6 shadow-[5px_5px_0_#8f2d24]" aria-labelledby="last-mile-title">
          <span className="inline-block bg-[#8f2d24] px-3 py-1 text-[16px] font-black text-white">DESCRIBED · NOT BUILT</span>
          <h2 id="last-mile-title" className="mt-3 text-3xl font-black">Last mile फोन से आगे है</h2>
          <p className="mt-3 text-[18px] leading-relaxed">हर beneficiary के पास smartphone नहीं है। अगला channel set: CSC operator mode, परिवार के लिए WhatsApp bot, और feature phones के लिए IVR। ये roadmap हैं, shipped features नहीं।</p>
        </section>
      </div>
    </main>
  );
}
