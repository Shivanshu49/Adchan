import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { completeMockLogin } from "@/actions/mock-auth";
import MockBadge from "@/components/MockBadge";
import { getPersonaAndFailure } from "@/lib/data";
import { getMockSessionId, hasDiagnosisReceipt } from "@/lib/mock-auth";


export const metadata: Metadata = {
  title: "प्रगति सेव करें — नमूना लॉगिन",
};


interface LoginPageProps {
  params: Promise<{ regNo: string }>;
  searchParams: Promise<{ error?: string }>;
}


const ERRORS: Record<string, string> = {
  phone: "10 अंकों का कोई भी नमूना मोबाइल नंबर डालें।",
  otp: "इस डेमो का OTP 123456 है। वही छह अंक डालें।",
};


export default async function LoginPage({ params, searchParams }: LoginPageProps) {
  const { regNo } = await params;
  const { error } = await searchParams;
  const match = getPersonaAndFailure(regNo);
  if (!match) notFound();

  if (await getMockSessionId()) redirect(`/tracker/${encodeURIComponent(regNo)}`);
  if (!(await hasDiagnosisReceipt(regNo))) {
    redirect(`/status/${encodeURIComponent(regNo)}`);
  }

  return (
    <main id="main-content" className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <Link
        href={`/status/${regNo}`}
        prefetch={false}
        className="inline-flex min-h-12 items-center border-b-2 border-[#1d2330] text-[18px] font-black focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#8f2d24]"
      >
        ← निदान पर वापस
      </Link>

      <div className="mt-7 grid border-2 border-[#1d2330] bg-[#fffdf7] shadow-[7px_7px_0_#8f2d24] lg:grid-cols-[0.85fr_1.15fr]">
        <section className="border-b-2 border-[#1d2330] bg-[#f0c95a] p-6 sm:p-9 lg:border-b-0 lg:border-r-2">
          <MockBadge hi="नमूना लॉगिन" en="MOCK AUTH" tone="ink" />
          <p className="mt-6 font-mono text-[16px] font-black tracking-[0.12em]">ANSWER FIRST → LOGIN SECOND</p>
          <h1 className="mt-3 text-[clamp(2.6rem,8vw,5rem)] font-black leading-[0.95] tracking-[-0.04em]">
            जवाब मिल गया। अब प्रगति बचाएँ।
          </h1>
          <p className="mt-6 text-[20px] font-bold leading-relaxed">
            निदान देखने के लिए लॉगिन नहीं माँगा गया। यह नमूना लॉगिन सिर्फ़ tracker, reminder और grievance draft के लिए है।
          </p>
          <div className="mt-7 border-2 border-[#1d2330] bg-[#fffdf7] p-4">
            <p className="text-[16px] font-black text-[#8f2d24]">आपका देखा हुआ निदान</p>
            <p className="mt-2 text-[22px] font-black leading-snug">{match.failure.plain.hi}</p>
            <p className="mt-2 font-mono text-[18px] font-black">{regNo}</p>
          </div>
        </section>

        <section className="p-6 sm:p-9" aria-labelledby="login-form-title">
          <MockBadge hi="असली प्रमाणीकरण नहीं" en="MOCKED" />
          <h2 id="login-form-title" className="mt-4 text-4xl font-black">फोन और OTP</h2>
          <p className="mt-3 text-[18px] leading-relaxed text-[#4d4942]">
            कोई भी 10 अंकों का नंबर चलेगा। नंबर सेव नहीं किया जाता। कोई SMS नहीं भेजा जाएगा।
          </p>

          <div className="mt-6 border-4 border-[#1d2330] bg-[#292232] p-5 text-white shadow-[4px_4px_0_#f0c95a]">
            <p className="text-[18px] font-black text-[#f0c95a]">डेमो OTP स्क्रीन पर ही है</p>
            <p className="mt-2 font-mono text-5xl font-black tracking-[0.18em]">123456</p>
          </div>

          {error && ERRORS[error] && (
            <p role="alert" className="mt-5 border-2 border-[#8f2d24] bg-[#fff0ed] p-4 text-[18px] font-black text-[#7c211b]">
              {ERRORS[error]}
            </p>
          )}

          <form action={completeMockLogin} className="mt-7 space-y-6">
            <input type="hidden" name="regNo" value={regNo} />
            <div>
              <label htmlFor="phone" className="block text-[20px] font-black">मोबाइल नंबर</label>
              <span className="block text-[18px] text-[#5a554d]" lang="en">Any fictional 10-digit number</span>
              <input
                id="phone"
                name="phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                pattern="[0-9]{10}"
                maxLength={10}
                required
                placeholder="0000000000"
                className="mt-3 min-h-16 w-full border-2 border-[#1d2330] bg-white px-4 py-3 font-mono text-[22px] font-black focus:outline-4 focus:outline-offset-2 focus:outline-[#8f2d24]"
              />
            </div>
            <div>
              <label htmlFor="otp" className="block text-[20px] font-black">OTP</label>
              <input
                id="otp"
                name="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                maxLength={6}
                required
                defaultValue="123456"
                className="mt-3 min-h-16 w-full border-2 border-[#1d2330] bg-white px-4 py-3 font-mono text-[22px] font-black tracking-[0.15em] focus:outline-4 focus:outline-offset-2 focus:outline-[#8f2d24]"
              />
            </div>
            <button
              type="submit"
              className="flex min-h-16 w-full items-center justify-center bg-[#8f2d24] px-5 py-3 text-[22px] font-black text-white shadow-[4px_4px_0_#1d2330] hover:bg-[#74231d] focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#1d2330]"
            >
              नमूना लॉगिन करें →
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
