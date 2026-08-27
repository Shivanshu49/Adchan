import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { completeMockLogin } from "@/actions/mock-auth";
import MockBadge from "@/components/MockBadge";
import Link from "@/components/PlainLink";
import { getPersonaAndFailure } from "@/lib/data";
import { getMockSessionId, hasDiagnosisReceipt } from "@/lib/mock-auth";


export const metadata: Metadata = { title: "प्रगति सेव करें — नमूना लॉगिन" };

interface LoginPageProps {
  params: Promise<{ regNo: string }>;
  searchParams: Promise<{ error?: string }>;
}

const ERRORS: Record<string, string> = {
  phone: "10 अंकों का कोई भी नमूना मोबाइल नंबर डालें।",
  otp: "इस नमूने का OTP 123456 है। वही छह अंक डालें।",
};


export default async function LoginPage({ params, searchParams }: LoginPageProps) {
  const { regNo } = await params;
  const { error } = await searchParams;
  const match = getPersonaAndFailure(regNo);
  if (!match) redirect("/");

  if (await getMockSessionId()) {
    redirect(`/status/${encodeURIComponent(regNo)}/login/start`);
  }
  if (!(await hasDiagnosisReceipt(regNo))) redirect(`/status/${encodeURIComponent(regNo)}`);

  return (
    <main id="main-content" className="page-shell">
      <Link href={`/status/${regNo}`} prefetch={false} className="touch-link">
        ← निदान पर वापस
      </Link>

      <header className="mt-7">
        <div className="flex flex-wrap items-center gap-2">
          <p className="section-label">जवाब पहले, लॉगिन बाद में</p>
          <MockBadge hi="नमूना लॉगिन" en="MOCK AUTH" />
        </div>
        <h1 className="mt-3 text-[32px] font-semibold leading-[1.35]">जवाब मिल गया। अब प्रगति बचाएँ।</h1>
        <p className="mt-4 text-[19px] leading-[1.6]">
          निदान देखने के लिए लॉगिन नहीं माँगा गया। यह नमूना लॉगिन केवल प्रगति, याद दिलाने और शिकायत के मसौदे के लिए है।
        </p>
      </header>

      <section className="document-card mt-8 p-5 sm:p-6" aria-labelledby="seen-diagnosis">
        <div className="flex flex-wrap items-center gap-2">
          <h2 id="seen-diagnosis" className="text-[21px] font-semibold">आपका देखा हुआ निदान</h2>
          <MockBadge hi="नमूना डेटा" />
        </div>
        <p className="mt-3 text-[24px] font-semibold leading-[1.5]">{match.failure.plain.hi}</p>
        <p className="mt-2 font-mono text-[19px] font-semibold">{regNo}</p>
      </section>

      <section className="document-card mt-8 p-5 sm:p-6" aria-labelledby="login-form-title">
        <div className="flex flex-wrap items-center gap-2">
          <h2 id="login-form-title" className="text-[28px] font-semibold">फोन और OTP</h2>
          <MockBadge hi="असली प्रमाणीकरण नहीं" />
        </div>
        <p className="mt-3 text-[19px] leading-[1.6]">
          कोई भी 10 अंकों का काल्पनिक नंबर चलेगा। नंबर सेव नहीं होगा और कोई SMS नहीं भेजा जाएगा।
        </p>

        <div className="mt-6 border-2 border-[var(--ink)] p-5">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[19px] font-semibold">नमूना OTP स्क्रीन पर है</p>
            <MockBadge hi="नमूना OTP" />
          </div>
          <p className="mt-2 font-mono text-[40px] font-semibold tracking-[0.15em]">123456</p>
        </div>

        {error && ERRORS[error] && (
          <p role="alert" className="state-broken mt-5 p-4 text-[19px] font-semibold">{ERRORS[error]}</p>
        )}

        <form action={completeMockLogin} className="mt-7 space-y-6">
          <input type="hidden" name="regNo" value={regNo} />
          <div>
            <label htmlFor="phone" className="block text-[19px] font-semibold">मोबाइल नंबर</label>
            <span className="secondary-copy block" lang="en">Any fictional 10-digit number</span>
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
              className="mt-3 min-h-14 w-full rounded-[4px] border-2 border-[var(--ink)] bg-[var(--surface)] px-4 py-3 font-mono text-[21px] font-semibold"
            />
          </div>
          <div>
            <label htmlFor="otp" className="block text-[19px] font-semibold">OTP</label>
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
              className="mt-3 min-h-14 w-full rounded-[4px] border-2 border-[var(--ink)] bg-[var(--surface)] px-4 py-3 font-mono text-[21px] font-semibold tracking-[0.15em]"
            />
          </div>
          <button type="submit" className="primary-action w-full">नमूना लॉगिन करें</button>
        </form>
      </section>
    </main>
  );
}
