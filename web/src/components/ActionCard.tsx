import { markActionDone } from "@/actions/tracker";
import MockBadge from "@/components/MockBadge";
import type { Failure } from "@/types/failures";
import type { Persona } from "@/types/personas";

interface ActionCardProps {
  failure: Failure;
  persona: Persona;
  mode?: "diagnosis" | "tracker";
  markedDoneAt?: string | null;
}


export default function ActionCard({
  failure,
  persona,
  mode = "diagnosis",
  markedDoneAt = null,
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
    <section
      className="print-card overflow-hidden border-2 border-[#1d2330] bg-[#fffdf7] shadow-[5px_5px_0_#8f2d24]"
      aria-labelledby="action-title"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#1d2330] bg-[#1d2330] px-5 py-4 text-white">
        <div>
          <p className="font-mono text-[18px] font-black uppercase tracking-[0.12em] text-[#f0c95a]">
            अगला कदम
          </p>
          <h2 id="action-title" className="mt-1 text-3xl font-black">
            अब क्या करना है
          </h2>
        </div>
        <span className="border border-[#f0c95a] bg-[#342d38] px-3 py-1 text-[18px] font-black text-[#fff3c7]">
          ड्राफ़्ट मार्गदर्शन
        </span>
      </div>

      <div className="grid gap-0 lg:grid-cols-2">
        <div className="border-b-2 border-[#1d2330] p-5 sm:p-7 lg:border-b-0 lg:border-r-2">
          <p className="font-mono text-[18px] font-black uppercase tracking-[0.1em] text-[#8f2d24]">
            1 · कहाँ जाएँ / Office
          </p>
          <p className="mt-2 text-3xl font-black leading-tight text-[#1d2330]">
            {failure.office.hi}
          </p>
          <p className="mt-2 text-[18px] text-[#555149]" lang="en">
            {failure.office.en}
          </p>

          <div className="mt-8">
            <p className="font-mono text-[18px] font-black uppercase tracking-[0.1em] text-[#8f2d24]">
              2 · साथ ले जाएँ / Documents
            </p>
            <ol className="mt-3 space-y-3">
              {failure.documents.map((document, index) => (
                <li key={document.hi} className="flex gap-3 text-[18px] leading-relaxed">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f0c95a] font-mono text-[18px] font-black text-[#1d2330]">
                    {index + 1}
                  </span>
                  <span>
                    <strong className="block text-[#1d2330]">{document.hi}</strong>
                    <span className="text-[#5a554d]" lang="en">
                      {document.en}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="p-5 sm:p-7">
          <p className="font-mono text-[18px] font-black uppercase tracking-[0.1em] text-[#8f2d24]">
            3 · काउंटर पर यही कहें
          </p>
          <p className="mt-1 text-[18px] text-[#5a554d]" lang="en">
            Say this sentence at the counter
          </p>
          <blockquote className="mt-4 border-l-8 border-[#f0c95a] bg-[#292232] p-5 text-white sm:p-6">
            <p className="text-[clamp(1.45rem,5vw,2rem)] font-black leading-snug">
              “{failure.script.hi}”
            </p>
            <p className="mt-4 border-t border-[#766d7c] pt-4 text-[18px] leading-relaxed text-[#eee8ef]" lang="en">
              “{failure.script.en}”
            </p>
          </blockquote>

          {failure.script.hi !== "—" && (
            <div className="no-print mt-4 border-4 border-[#f0c95a] bg-[#fff3c7] p-4 shadow-[4px_4px_0_#1d2330]">
              <p className="text-[22px] font-black text-[#1d2330]">
                🔊 काउंटर पर कहने वाली बात सुनें
              </p>
              <p className="mt-1 text-[18px] text-[#514a3d]" lang="en">
                Play and repeat this sentence
              </p>
              <audio
                controls
                preload="none"
                className="mt-3 min-h-12 w-full"
                aria-label="काउंटर पर कहने वाली बात सुनें"
              >
                <source src={`/audio/${failure.code}_script.mp3`} type="audio/mpeg" />
                आपका ब्राउज़र ऑडियो नहीं चला सकता।
              </audio>
            </div>
          )}

          <div className="no-print mt-6 grid gap-3 sm:flex">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="flex min-h-14 w-full items-center justify-center bg-[#14633f] px-5 py-3 text-center text-[18px] font-black text-white shadow-[3px_3px_0_#0b3b25] hover:bg-[#0d4d31] focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#8f2d24] sm:w-auto"
            >
              WhatsApp पर भेजें
            </a>
          </div>
        </div>
      </div>

      {mode === "diagnosis" ? (
        <a href={`/status/${persona.regNo}/login/start`} className="no-print tracker-login-cta">
          नमूना tracker · MOCKED — प्रगति सेव करें →
        </a>
      ) : (
        <div className="no-print border-t-2 border-[#1d2330] bg-[#fff3c7] p-5 sm:p-7">
          {markedDoneAt ? (
          <div>
            <MockBadge hi="नमूना tracker" en="MOCKED" tone="ink" />
            <p className="mt-3 text-3xl font-black text-[#14633f]">✓ आपने यह कदम पूरा किया</p>
            <p className="mt-2 text-[18px] text-[#4d4942]">
              दर्ज समय: {new Intl.DateTimeFormat("hi-IN", { dateStyle: "long", timeStyle: "short", timeZone: "Asia/Kolkata" }).format(new Date(markedDoneAt))}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <MockBadge hi="नमूना tracker" en="MOCKED" tone="ink" />
              <h3 className="mt-3 text-3xl font-black">दफ़्तर वाला काम पूरा हो गया?</h3>
              <p className="mt-2 text-[18px] text-[#4d4942]">पूरा होने पर तारीख tracker timeline में जुड़ जाएगी।</p>
            </div>
            <form action={markActionDone}>
              <input type="hidden" name="regNo" value={persona.regNo} />
              <button
                type="submit"
                className="flex min-h-16 w-full min-w-64 items-center justify-center bg-[#14633f] px-6 py-3 text-[22px] font-black text-white shadow-[4px_4px_0_#1d2330] hover:bg-[#0d4d31] focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#8f2d24]"
              >
                मैंने कर लिया ✓
              </button>
            </form>
          </div>
          )}
        </div>
      )}
    </section>
  );
}
