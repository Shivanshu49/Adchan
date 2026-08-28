import MockBadge from "@/components/MockBadge";
import type { Failure } from "@/types/failures";


interface DiagnosisCardProps {
  failure: Failure;
}


export default function DiagnosisCard({ failure }: DiagnosisCardProps) {
  return (
    <section className="document-card print-card" aria-labelledby="diagnosis-title">
      <div className="border-b border-[var(--c-sage)] px-5 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <p className="section-label">किस्त क्यों रुकी</p>
          <MockBadge hi="नमूना निदान" />
        </div>
        <p className="secondary-copy mt-1" lang="en">Why the payment stopped</p>
      </div>

      <div className="p-5 sm:p-6">
        <h2
          id="diagnosis-title"
          className="text-[32px] font-semibold leading-[1.35] tracking-[-0.01em] text-[var(--c-ink)]"
        >
          {failure.plain.hi}
        </h2>
        <p className="secondary-copy mt-3" lang="en">{failure.plain.en}</p>

        <div className="no-print mt-6 border-t border-[var(--c-sage)] pt-5">
          <p className="text-[19px] font-semibold">▶ कारण सुनिए</p>
          <p className="secondary-copy mt-1" lang="en">Listen to the diagnosis</p>
          <audio
            controls
            preload="none"
            className="mt-3 w-full"
            aria-label="कारण सुनिए"
          >
            <source src={`/audio/${failure.code}_plain.mp3`} type="audio/mpeg" />
            आपका ब्राउज़र ऑडियो नहीं चला सकता।
          </audio>
        </div>

        <details className="mt-6 border-t border-[var(--c-sage)]">
          <summary className="flex min-h-14 cursor-pointer items-center text-[19px] font-semibold">
            तकनीकी जानकारी
            <span className="secondary-copy ml-2" lang="en">/ Technical details</span>
          </summary>
          <div className="mb-4 border-l-4 border-[var(--c-sage)] pl-4">
            <p className="text-[15px] leading-[1.5]">{failure.portalText}</p>
            <code className="mt-2 block break-all font-mono text-[15px] font-semibold">
              {failure.code}
            </code>
          </div>
        </details>
      </div>
    </section>
  );
}
