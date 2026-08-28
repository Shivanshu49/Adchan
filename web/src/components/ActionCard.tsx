import type { ReactNode } from "react";

import MockBadge from "@/components/MockBadge";
import type { Failure } from "@/types/failures";
import type { Persona } from "@/types/personas";

interface ActionCardProps {
  failure: Failure;
  persona: Persona;
  mode?: "diagnosis" | "tracker";
  trackerControl?: ReactNode;
}


export default function ActionCard({
  failure,
  persona,
  mode = "diagnosis",
  trackerControl,
}: ActionCardProps) {
  const shareText = [
    `PM-KISAN डेमो रिकॉर्ड: ${persona.regNo}`,
    failure.plain.hi,
    `कहाँ जाएँ: ${failure.office.hi}`,
    `साथ ले जाएँ: ${failure.documents.map((document) => document.hi).join(", ")}`,
    `काउंटर पर कहें: “${failure.script.hi}”`,
    "स्वतंत्र प्रोटोटाइप — किसी सरकारी संस्था से संबंधित नहीं।",
  ].join("\n\n");
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  return (
    <section className="action-card document-card print-card" aria-labelledby="action-title">
      <div className="print-only action-card-section border-b-2 border-[var(--c-ink)]">
        <p className="text-[14pt] font-semibold">अड़चन · करने का पर्चा</p>
        <p>{persona.name.hi} · {persona.regNo}</p>
        <p className="mt-1 text-[10pt]">स्वतंत्र प्रोटोटाइप — किसी सरकारी संस्था से संबंधित नहीं।</p>
      </div>

      <header className="action-card-section flex flex-wrap items-start justify-between gap-3 border-b border-[var(--c-sage)] p-5 sm:p-6">
        <div>
          <p className="section-label">अगला कदम</p>
          <h2 id="action-title" className="mt-2 text-[28px] font-semibold leading-[1.3]">अब क्या करना है</h2>
        </div>
        <MockBadge hi="नमूना मार्गदर्शन" />
      </header>

      <div className="action-card-section border-b border-[var(--c-sage)] p-5 sm:p-6">
        <p className="section-label">1 · कहाँ जाएँ</p>
        <p className="mt-2 text-[26px] font-semibold leading-[1.35]">{failure.office.hi}</p>
        <p className="secondary-copy mt-1" lang="en">{failure.office.en}</p>
      </div>

      <div className="action-card-section border-b border-[var(--c-sage)] p-5 sm:p-6">
        <p className="section-label">2 · साथ क्या ले जाएँ</p>
        <ol className="mt-4 space-y-4">
          {failure.documents.map((document, index) => (
            <li key={document.hi} className="flex gap-4 text-[19px] leading-[1.6]">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-[var(--c-ink)] font-semibold" aria-hidden="true">
                {index + 1}
              </span>
              <span>
                <strong className="block font-semibold">{document.hi}</strong>
                <span className="secondary-copy" lang="en">{document.en}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>

      <div className="action-card-section p-5 sm:p-6">
        <p className="section-label">3 · काउंटर पर क्या कहें</p>
        <p className="secondary-copy mt-1" lang="en">Say this at the counter</p>

        <blockquote className="action-script mt-4 border-4 border-[var(--c-ink)] bg-[var(--c-card-bg)] p-5 sm:p-6">
          <p className="text-[24px] font-medium leading-[1.5]">“{failure.script.hi}”</p>
          <p className="secondary-copy mt-4 border-t border-[var(--c-sage)] pt-3" lang="en">
            “{failure.script.en}”
          </p>

          {failure.script.hi !== "—" && (
            <div className="no-print mt-5 border-t-2 border-[var(--c-ink)] pt-4">
              <p className="text-[21px] font-semibold">▶ यही वाक्य सुनिए</p>
              <p className="secondary-copy mt-1" lang="en">Listen and repeat</p>
              <audio
                controls
                preload="none"
                className="mt-3 w-full"
                aria-label="काउंटर पर बोलने वाला वाक्य सुनिए"
              >
                <source src={`/audio/${failure.code}_script.mp3`} type="audio/mpeg" />
                आपका ब्राउज़र ऑडियो नहीं चला सकता।
              </audio>
            </div>
          )}
        </blockquote>

        <p className="mt-5 text-[19px]">
          आम तौर पर लगभग <strong>{failure.typicalDays} दिन</strong> लगते हैं।
          <span className="secondary-copy ml-2" lang="en">Typically about {failure.typicalDays} days.</span>
        </p>

        <a
          href={whatsappHref}
          target="_blank"
          rel="noreferrer"
          className="primary-action no-print mt-6 w-full"
        >
          WhatsApp पर परिवार या CSC को भेजें
        </a>
      </div>

      {mode === "diagnosis" ? (
        <a href={`/status/${persona.regNo}/login/start`} className="no-print tracker-login-cta">
          <MockBadge hi="नमूना tracker" />
          प्रगति सेव करें
        </a>
      ) : (
        <div className="no-print border-t border-[var(--c-sage)] p-5 sm:p-6">
          {trackerControl}
        </div>
      )}

      <p className="print-only action-card-section border-t border-[var(--c-ink)] text-[10pt]">
        यह नमूना मार्गदर्शन है। दफ़्तर और दस्तावेज़ की जानकारी अभी क्षेत्र में सत्यापित नहीं हुई है।
      </p>
    </section>
  );
}
