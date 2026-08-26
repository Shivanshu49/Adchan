import Link from "next/link";

import DemoRegistrationList from "@/components/DemoRegistrationList";


export default function StatusNotFound() {
  return (
    <main id="main-content" className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-16">
      <section className="border-2 border-[#1d2330] bg-[#fffdf7] p-6 shadow-[6px_6px_0_#8f2d24] sm:p-10">
        <span className="inline-block bg-[#8f2d24] px-3 py-1 text-[18px] font-black text-white">
          रिकॉर्ड नहीं मिला
        </span>
        <h1 className="mt-5 text-[clamp(2.5rem,9vw,5rem)] font-black leading-none tracking-tight text-[#1d2330]">
          यह नंबर हमारे डेमो में नहीं है।
        </h1>
        <p className="mt-5 text-[20px] leading-relaxed text-[#3f3c37]">
          घबराइए नहीं—यह अभी स्वतंत्र प्रोटोटाइप है। नीचे दिए आठ काल्पनिक नंबरों में से कोई एक चुनें।
        </p>
        <p className="mt-2 text-[18px] leading-relaxed text-[#5a554d]" lang="en">
          This prototype only contains the eight fictional demo records listed below.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex min-h-12 items-center border-b-2 border-[#1d2330] text-[18px] font-black text-[#1d2330] focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#8f2d24]"
        >
          ← नंबर दोबारा डालें
        </Link>
      </section>

      <section className="mt-10" aria-labelledby="not-found-demos">
        <span className="inline-block bg-[#292232] px-3 py-1 text-[18px] font-black text-white">
          डेमो डेटा · MOCKED
        </span>
        <h2 id="not-found-demos" className="mb-5 mt-3 text-3xl font-black text-[#1d2330]">
          इनमें से कोई नंबर चुनें
        </h2>
        <DemoRegistrationList />
      </section>
    </main>
  );
}
