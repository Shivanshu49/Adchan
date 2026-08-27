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
      {reset === "done" && (
        <p role="status" className="state-working mb-6 p-4 text-[17px] font-semibold">
          इस ब्राउज़र का डेमो साफ़ हो गया। अब किसी भी नमूना नंबर से फिर शुरू करें।
        </p>
      )}

      <section aria-labelledby="landing-question">
        <p className="section-label">PM-KISAN किस्त सहायता</p>
        <h1
          id="landing-question"
          className="mt-3 max-w-[12ch] text-[32px] font-semibold leading-[1.35] text-[var(--ink)]"
        >
          आपका ₹2000 नहीं आया?
        </h1>
        <p className="mt-3 text-[19px] leading-[1.6]">
          अड़चन बताता है पैसा कहाँ रुका, किस दफ़्तर जाना है, कौन-से कागज़ ले जाने हैं और क्या कहना है।
        </p>
        <p className="secondary-copy mt-1" lang="en">
          Find the failed step, exact office, documents and words to use.
        </p>

        <div className="mt-5 flex items-start gap-2 border-l-4 border-[var(--mock)] pl-3">
          <MockBadge hi="काल्पनिक डेटा" en="SYNTHETIC" />
          <p className="text-[15px] font-semibold leading-[1.45]">
            स्वतंत्र प्रोटोटाइप; कोई सरकारी संबंध या असली किसान रिकॉर्ड नहीं।
          </p>
        </div>

        <div id="demo-numbers" className="mt-5 scroll-mt-4" aria-labelledby="demo-title">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 id="demo-title" className="text-[21px] font-semibold">अभी आज़माएँ — नंबर छुएँ</h2>
            <MockBadge />
          </div>
          <p className="mt-1 font-mono text-[15px] font-semibold">UP-DEMO- <span className="secondary-copy font-sans" lang="en">Tap 0001–0008</span></p>
          <div className="mt-3"><DemoRegistrationList compact /></div>
        </div>
      </section>

      <div className="my-8 flex items-center gap-3" aria-hidden="true">
        <span className="h-px flex-1 bg-[var(--rule)]" />
        <span className="text-[19px] font-semibold">अपनी बात बताएँ</span>
        <span className="h-px flex-1 bg-[var(--rule)]" />
      </div>

      <VoiceComplaint
        matches={personas.map((persona) => ({
          code: persona.failureCode,
          regNo: persona.regNo,
        }))}
      />

      <form action="/status" method="get" className="document-card mt-8 p-5 sm:p-6">
        <label htmlFor="regNo" className="block text-[21px] font-semibold">
          रजिस्ट्रेशन नंबर डालिए
        </label>
        <span className="secondary-copy mt-1 block" lang="en">Enter a registration number</span>
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
          className="mt-4 min-h-14 w-full rounded-[4px] border-2 border-[var(--ink)] bg-[var(--surface)] px-4 py-3 font-mono text-[19px] font-semibold uppercase"
        />
        <p id="reg-help" className="mt-2 text-[19px]">नीचे दिए किसी भी नमूना नंबर को चुन सकते हैं।</p>
        <button type="submit" className="primary-action mt-5 w-full">मेरी किस्त देखें</button>
      </form>

      <p className="my-8 border-y border-[var(--rule)] py-4 text-center text-[19px] font-semibold">
        कोई लॉगिन नहीं। कोई कैप्चा नहीं।
        <span className="secondary-copy mt-1 block" lang="en">No login. No captcha.</span>
      </p>
    </main>
  );
}
