import Image from "next/image";

import ApiWarmup from "@/components/ApiWarmup";
import DemoRegistrationList from "@/components/DemoRegistrationList";
import MockBadge from "@/components/MockBadge";
import VoiceComplaint from "@/components/VoiceComplaint";
import personas from "@/types/personas";


interface HomeProps {
  searchParams: Promise<{ reset?: string }>;
}


export default async function Home({ searchParams }: HomeProps) {
  const { reset } = await searchParams;

  return (
    <main id="main-content" className="page-shell">
      <ApiWarmup />
      {reset === "done" && (
        <p role="status" className="state-working mb-6 p-4 text-[17px] font-semibold">
          इस ब्राउज़र का डेमो साफ़ हो गया। अब किसी भी नमूना नंबर से फिर शुरू करें।
        </p>
      )}

      <section className="landing-hero" aria-labelledby="landing-question">
        <div className="landing-hero-copy">
          <p className="section-label">नमस्ते किसान!</p>
          <h1
            id="landing-question"
            className="mt-3 max-w-[13ch] text-[36px] font-semibold leading-[1.22] text-[var(--c-ink)]"
          >
            आपका ₹2000 नहीं आया?
          </h1>
          <p className="mt-3 max-w-[30ch] text-[19px] font-medium leading-[1.5]">
            पैसा कहाँ रुका और अब क्या करना है—साफ़ हिंदी में जानिए।
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <MockBadge hi="काल्पनिक डेटा" en="SYNTHETIC" />
          </div>
        </div>
        <div className="landing-hero-art" aria-hidden="true">
          <Image
            src="/kishan-banner.webp"
            alt=""
            fill
            sizes="(max-width: 430px) 32vw, (max-width: 760px) 38vw, 320px"
            priority
          />
        </div>
      </section>

      <div className="mt-6">
        <VoiceComplaint
          matches={personas.map((persona) => ({
            code: persona.failureCode,
            regNo: persona.regNo,
          }))}
        />
      </div>

      <form action="/status" method="get" className="registration-card mt-6 p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="text-[25px] text-[var(--c-dark-olive)]">⌕</span>
          <label htmlFor="regNo" className="block text-[22px] font-semibold text-[var(--c-dark-olive)]">
            रजिस्ट्रेशन नंबर से देखें
          </label>
        </div>
        <span className="secondary-copy mt-1 block" lang="en">Check with a registration number</span>
        <div className="registration-form-row mt-4">
          <input
            id="regNo"
            name="regNo"
            type="text"
            required
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            placeholder="UP-DEMO-0001"
            aria-describedby="reg-help"
            className="min-w-0 flex-1 rounded-[14px] border-2 border-[var(--c-moss)] bg-[var(--c-card-bg)] px-4 py-3 font-mono text-[19px] font-semibold uppercase focus:border-[var(--c-dark-olive)] focus:outline-none"
          />
          <button type="submit" className="primary-action registration-submit">देखें</button>
        </div>
        <p id="reg-help" className="mt-2 text-[17px] text-[var(--c-muted)]">🔒 कोई लॉगिन नहीं। कोई कैप्चा नहीं।</p>
      </form>

      <section id="demo-numbers" className="demo-panel mt-6 scroll-mt-4" aria-labelledby="demo-title">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="demo-title" className="text-[22px] font-semibold">आठ नमूना किसान</h2>
          <MockBadge />
        </div>
        <p className="mt-1 text-[17px] text-[var(--c-muted)]">किसी नंबर को छूकर पूरा निदान देखें।</p>
        <p className="mt-2 font-mono text-[15px] font-semibold">UP-DEMO- <span className="secondary-copy font-sans" lang="en">Tap 0001–0008</span></p>
        <div className="mt-3"><DemoRegistrationList compact /></div>
      </section>
    </main>
  );
}
