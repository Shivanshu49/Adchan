import type { Failure } from "@/types/failures";


interface DiagnosisCardProps {
  failure: Failure;
}


export default function DiagnosisCard({ failure }: DiagnosisCardProps) {
  return (
    <section
      className="print-card border-2 border-[#1d2330] bg-[#fffdf7] shadow-[5px_5px_0_#1d2330]"
      aria-labelledby="diagnosis-title"
    >
      <div className="border-b-2 border-[#1d2330] bg-[#f0c95a] px-5 py-3">
        <p className="font-mono text-[18px] font-black uppercase tracking-[0.12em] text-[#1d2330]">
          किस्त क्यों रुकी
          <span className="ml-2 normal-case tracking-normal" lang="en">
            / Why it stopped
          </span>
        </p>
      </div>
      <div className="p-5 sm:p-7">
        <h2
          id="diagnosis-title"
          className="max-w-3xl text-[clamp(1.75rem,6vw,3.2rem)] font-black leading-[1.15] tracking-[-0.025em] text-[#1d2330]"
        >
          {failure.plain.hi}
        </h2>
        <p className="mt-4 max-w-3xl text-[18px] leading-relaxed text-[#504c45]" lang="en">
          {failure.plain.en}
        </p>

        <div className="no-print mt-6 border-l-4 border-[#8f2d24] bg-[#f5eee4] p-4">
          <p className="mb-2 text-[18px] font-black text-[#1d2330]">
            🔊 कारण सुनें
            <span className="ml-2 font-normal text-[#5a554d]" lang="en">
              / Listen
            </span>
          </p>
          <audio
            controls
            preload="none"
            className="min-h-12 w-full max-w-md"
            aria-label="किस्त रुकने का कारण सुनें"
          >
            <source src={`/audio/${failure.code}_plain.mp3`} type="audio/mpeg" />
            आपका ब्राउज़र ऑडियो नहीं चला सकता।
          </audio>
        </div>

        <details className="mt-6 border-t border-dashed border-[#827b6d] pt-2">
          <summary className="flex min-h-12 cursor-pointer items-center text-[18px] font-bold text-[#4a302d] focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#8f2d24]">
            तकनीकी जानकारी
            <span className="ml-2 font-normal text-[#5c574f]" lang="en">
              / Technical details
            </span>
          </summary>
          <div className="mb-2 border-l-4 border-[#8f2d24] bg-[#f5eee4] p-4">
            <p className="text-[18px] leading-relaxed text-[#1d2330]">
              {failure.portalText}
            </p>
            <code className="mt-2 block break-all font-mono text-[18px] font-bold text-[#6f261f]">
              {failure.code}
            </code>
          </div>
        </details>
      </div>
    </section>
  );
}
