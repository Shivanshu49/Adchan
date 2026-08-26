import DemoRegistrationList from "@/components/DemoRegistrationList";
import VoiceComplaint from "@/components/VoiceComplaint";
import personas from "@/types/personas";


export default function Home() {
  return (
    <main id="main-content" className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-14">
      <section className="grid gap-8 border-b-2 border-[#1d2330] pb-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14 lg:pb-14">
        <div>
          <p className="inline-block border border-[#8f2d24] bg-[#fff0eb] px-3 py-1 text-[18px] font-black tracking-wide text-[#7c211b]">
            PM-KISAN किस्त सहायता
          </p>
          <h1 className="mt-5 max-w-[11ch] text-[clamp(3.2rem,12vw,7.5rem)] font-black leading-[0.95] tracking-[-0.055em] text-[#1d2330]">
            आपका ₹2000 नहीं आया?
          </h1>
          <p className="mt-5 max-w-xl text-[22px] font-bold leading-relaxed text-[#3d3a36]">
            रजिस्ट्रेशन नंबर डालिए। दो कदम में जानिए किस्त क्यों रुकी और अब कहाँ जाना है।
          </p>
          <p className="mt-2 max-w-xl text-[18px] leading-relaxed text-[#5a554d]" lang="en">
            Enter a registration number to see why the installment stopped and what to do next.
          </p>
        </div>

        <form
          action="/status"
          method="get"
          className="self-end border-2 border-[#1d2330] bg-[#fffdf7] p-5 shadow-[6px_6px_0_#8f2d24] sm:p-7"
        >
          <label htmlFor="regNo" className="block text-[22px] font-black text-[#1d2330]">
            PM-KISAN रजिस्ट्रेशन नंबर
          </label>
          <span className="mt-1 block text-[18px] text-[#5a554d]" lang="en">
            Registration number
          </span>
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
            className="mt-4 min-h-16 w-full border-2 border-[#1d2330] bg-white px-4 py-3 font-mono text-[20px] font-bold uppercase text-[#1d2330] placeholder:text-[#736e65] focus:outline-4 focus:outline-offset-2 focus:outline-[#8f2d24]"
          />
          <p id="reg-help" className="mt-2 text-[18px] leading-relaxed text-[#5a554d]">
            नीचे दिए किसी भी डेमो नंबर को कॉपी कर सकते हैं।
          </p>
          <button
            type="submit"
            className="mt-5 flex min-h-16 w-full items-center justify-center bg-[#8f2d24] px-5 py-3 text-[22px] font-black text-white shadow-[3px_3px_0_#1d2330] hover:bg-[#74231d] focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#1d2330]"
          >
            मेरी किस्त देखें
          </button>
          <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 border-t border-dashed border-[#827b6d] pt-4 text-[18px] font-bold text-[#3f3c37]">
            <span>लॉगिन नहीं</span>
            <span>कैप्चा नहीं</span>
            <span lang="en">No login · No captcha</span>
          </div>
        </form>
      </section>

      <section className="grid gap-6 border-b-2 border-[#1d2330] py-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:py-14" aria-labelledby="voice-title">
        <div>
          <span className="inline-block bg-[#14633f] px-3 py-1 text-[18px] font-black text-white">
            आवाज़ से जाँच
          </span>
          <h2 id="voice-title" className="mt-3 text-4xl font-black tracking-tight text-[#1d2330] sm:text-5xl">
            नंबर याद नहीं? परेशानी बोलिए।
          </h2>
          <p className="mt-3 max-w-lg text-[18px] leading-relaxed text-[#4d4942]">
            जो संदेश पोर्टल पर दिखा, वही अपनी भाषा में बोलें। हम उसे डेमो रिकॉर्ड से मिलाएँगे।
          </p>
          <p className="mt-2 text-[18px] text-[#5a554d]" lang="en">
            Describe the portal message in Hindi. Voice is transcribed, then matched to the demo taxonomy.
          </p>
        </div>
        <VoiceComplaint
          matches={personas.map((persona) => ({
            code: persona.failureCode,
            regNo: persona.regNo,
          }))}
        />
      </section>

      <section className="pt-10 sm:pt-14" aria-labelledby="demo-title">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="inline-block bg-[#292232] px-3 py-1 text-[18px] font-black text-white">
              डेमो डेटा · MOCKED
            </span>
            <h2 id="demo-title" className="mt-3 text-4xl font-black tracking-tight text-[#1d2330]">
              तुरंत आज़माएँ
            </h2>
            <p className="mt-2 text-[18px] text-[#555149]" lang="en">
              Choose any fictional registration number. No credentials needed.
            </p>
          </div>
          <p className="max-w-sm text-[18px] leading-relaxed text-[#3f3c37]">
            ये सभी नाम और रिकॉर्ड काल्पनिक हैं। हर नंबर एक अलग तरह की रुकावट दिखाता है।
          </p>
        </div>
        <DemoRegistrationList />
      </section>
    </main>
  );
}
