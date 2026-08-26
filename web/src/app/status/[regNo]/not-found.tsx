import Link from "next/link";

import DemoRegistrationList from "@/components/DemoRegistrationList";
import MockBadge from "@/components/MockBadge";


export default function StatusNotFound() {
  return (
    <main id="main-content" className="page-shell">
      <section className="document-card p-5 sm:p-6">
        <p className="section-label">नंबर पहचान में नहीं आया</p>
        <h1 className="mt-3 text-[32px] font-semibold leading-[1.35]">
          ये नंबर हमारे डेमो में नहीं है।
        </h1>
        <p className="mt-4 text-[19px] leading-[1.6]">
          नीचे दिए नंबरों में से कोई आज़माइए। ये सभी काल्पनिक नमूना रिकॉर्ड हैं।
        </p>
        <p className="secondary-copy mt-1" lang="en">
          This prototype only contains the eight fictional demo records listed below.
        </p>
        <Link
          href="/"
          className="touch-link mt-5"
        >
          ← नंबर दोबारा डालें
        </Link>
      </section>

      <section className="mt-8" aria-labelledby="not-found-demos">
        <div className="flex flex-wrap items-center gap-2">
          <h2 id="not-found-demos" className="text-[28px] font-semibold leading-[1.3]">
          इनमें से कोई नंबर चुनें
          </h2>
          <MockBadge />
        </div>
        <div className="mt-5"><DemoRegistrationList /></div>
      </section>
    </main>
  );
}
