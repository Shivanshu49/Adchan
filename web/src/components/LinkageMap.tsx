import type { Linkage } from "@/types/personas";


interface LinkageMapProps {
  linkage: Linkage;
}

const LINKAGES: ReadonlyArray<{
  key: keyof Linkage;
  hi: string;
  en: string;
}> = [
  { key: "aadhaarSeeded", hi: "आधार", en: "Aadhaar" },
  { key: "bankLinked", hi: "बैंक", en: "Bank" },
  { key: "landSeeded", hi: "ज़मीन", en: "Land" },
  { key: "ekycDone", hi: "eKYC", en: "eKYC" },
];


export default function LinkageMap({ linkage }: LinkageMapProps) {
  const allLinked = LINKAGES.every(({ key }) => linkage[key]);

  return (
    <section className="print-card" aria-labelledby="linkage-title">
      <div className="mb-4">
        <p className="font-mono text-[18px] font-black uppercase tracking-[0.12em] text-[#8f2d24]">
          रिकॉर्ड की कड़ियाँ
        </p>
        <h2 id="linkage-title" className="mt-1 text-3xl font-black text-[#1d2330]">
          कहाँ जुड़ाव टूटा है?
        </h2>
        <p className="mt-1 text-[18px] text-[#555149]" lang="en">
          Which record link needs attention?
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {LINKAGES.map(({ key, hi, en }) => {
          const linked = linkage[key];
          return (
            <div
              key={key}
              className={`min-h-32 border-2 p-4 ${
                linked
                  ? "border-[#14633f] bg-[#eaf7ef] text-[#0d4d31]"
                  : "border-[#a52a25] bg-[#fff0ed] text-[#7e1e1a]"
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`h-4 w-4 shrink-0 rounded-full ${
                    linked ? "bg-[#14633f]" : "bg-[#a52a25]"
                  }`}
                  aria-hidden="true"
                />
                <span className="text-[22px] font-black">{hi}</span>
              </div>
              <p className="mt-1 text-[18px]" lang="en">
                {en}
              </p>
              <p className="mt-3 text-[18px] font-bold">
                {linked ? "जुड़ा है · Linked" : "ध्यान दें · Not linked"}
              </p>
            </div>
          );
        })}
      </div>

      {allLinked ? (
        <div className="mt-4 border-l-4 border-[#1d2330] bg-[#ece8df] px-4 py-3">
          <p className="text-[18px] font-bold text-[#1d2330]">
            चारों रिकॉर्ड जुड़े हैं। इस डेमो में रुकावट पात्रता की जाँच में है।
          </p>
          <p className="mt-1 text-[18px] text-[#514e48]" lang="en">
            All four records are linked; this demo case is blocked by an eligibility flag.
          </p>
        </div>
      ) : null}
    </section>
  );
}
