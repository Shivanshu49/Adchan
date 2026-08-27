"use client";

import Link from "@/components/PlainLink";


export default function RouteError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main id="main-content" className="page-shell">
      <section className="state-broken p-5 sm:p-6" aria-labelledby="route-error-title">
        <p className="section-label">पन्ना पूरा नहीं खुला</p>
        <h1 id="route-error-title" className="mt-3 text-[32px] font-semibold leading-[1.35]">
          अभी कुछ तकनीकी अड़चन आई है
        </h1>
        <p className="mt-4 text-[19px] leading-[1.6]">
          इस पन्ने की कोई जानकारी बदली या जमा नहीं हुई। दोबारा कोशिश कर सकते हैं। तैयार नमूना निदान ऑनलाइन सेवा बंद होने पर भी काम करते हैं।
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={reset} className="primary-action w-full">पन्ना फिर खोलें</button>
          <Link href="/#demo-numbers" className="touch-link justify-center">नमूना निदान देखें</Link>
        </div>
      </section>
    </main>
  );
}
