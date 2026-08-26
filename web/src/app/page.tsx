import DemoRegistrationList from "@/components/DemoRegistrationList";
import MockBadge from "@/components/MockBadge";
import VoiceComplaint from "@/components/VoiceComplaint";
import personas from "@/types/personas";


export default function Home() {
  return (
    <main id="main-content" className="page-shell">
      <section aria-labelledby="landing-question">
        <p className="section-label">PM-KISAN किस्त सहायता</p>
        <h1
          id="landing-question"
          className="mt-3 max-w-[12ch] text-[32px] font-semibold leading-[1.35] text-[var(--ink)]"
        >
          आपका ₹2000 नहीं आया?
        </h1>
        <p className="mt-3 text-[19px] leading-[1.6]">
          अपनी परेशानी बोलिए। हम बताएँगे पैसा कहाँ अटका और आगे क्या करना है।
        </p>
        <p className="secondary-copy mt-1" lang="en">
          Describe the problem to find the broken step and the next action.
        </p>

        <div className="mt-6">
          <VoiceComplaint
            matches={personas.map((persona) => ({
              code: persona.failureCode,
              regNo: persona.regNo,
            }))}
          />
        </div>
      </section>

      <div className="my-8 flex items-center gap-3" aria-hidden="true">
        <span className="h-px flex-1 bg-[var(--rule)]" />
        <span className="text-[19px] font-semibold">या</span>
        <span className="h-px flex-1 bg-[var(--rule)]" />
      </div>

      <form action="/status" method="get" className="document-card p-5 sm:p-6">
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

      <section aria-labelledby="demo-title">
        <div className="flex flex-wrap items-center gap-2">
          <h2 id="demo-title" className="text-[28px] font-semibold leading-[1.3]">जाँचने के लिए नमूना नंबर</h2>
          <MockBadge />
        </div>
        <p className="mt-3 text-[19px]">सभी नाम और रिकॉर्ड काल्पनिक हैं। हर नंबर अलग अड़चन दिखाता है।</p>
        <p className="secondary-copy mt-1" lang="en">Eight fictional records; each shows a different failure.</p>
        <div className="mt-5"><DemoRegistrationList /></div>
      </section>
    </main>
  );
}
