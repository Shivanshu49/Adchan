import ApiWarmup from "@/components/ApiWarmup";
import HeroSection from "@/components/HeroSection";
import PrimaryServicesGrid from "@/components/PrimaryServicesGrid";
import InfoShowcase from "@/components/InfoShowcase";
import QuickInsightsBar from "@/components/QuickInsightsBar";
import DemoRegistrationList from "@/components/DemoRegistrationList";
import MockBadge from "@/components/MockBadge";

interface HomeProps {
  searchParams: Promise<{ reset?: string }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const { reset } = await searchParams;

  return (
    <main id="main-content" className="home-main">
      <ApiWarmup />
      {reset === "done" && (
        <div role="status" className="state-working mb-6 p-4 text-[19px] font-semibold rounded-xl border border-[#9FB873] bg-[#F2F5EB] text-[#287C49]">
          ✓ इस ब्राउज़र का डेमो डेटा साफ़ हो गया। अब किसी भी नमूना नंबर से फिर शुरू करें।
        </div>
      )}

      {/* 1. Hero Section (2-Column Desktop & Mobile Optimized) */}
      <HeroSection />

      {/* 2. Primary 8 Services Grid */}
      <PrimaryServicesGrid />

      {/* 3. Detailed Schemes & Eligibility Showcase Cards */}
      <InfoShowcase />

      {/* 4. Eight Demo Farmers for Instant Testing */}
      <section id="demo-numbers" className="demo-panel mt-6 scroll-mt-4" aria-labelledby="demo-title">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="demo-title" className="text-[22px] font-semibold text-[var(--c-dark-olive)]">
            आठ नमूना किसान (डेमो टेस्ट)
          </h2>
          <MockBadge hi="काल्पनिक डेटा" />
        </div>
        <p className="mt-1 text-[17px] text-[var(--c-muted)]">
          किसी भी नंबर को छूकर उस समस्या का पूरा कारण व समाधान देखें:
        </p>
        <p className="mt-2 font-mono text-[17px] font-semibold text-[var(--c-dark-olive)]">
          UP-DEMO- <span className="font-sans text-sm font-normal text-[var(--c-muted)]">0001 से 0008 चुनें</span>
        </p>
        <div className="mt-3">
          <DemoRegistrationList />
        </div>
      </section>

      {/* 5. Quick Insights Bar */}
      <div className="mt-8">
        <QuickInsightsBar />
      </div>
    </main>
  );
}
