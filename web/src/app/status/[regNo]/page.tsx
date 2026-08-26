import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import ActionCard from "@/components/ActionCard";
import DiagnosisCard from "@/components/DiagnosisCard";
import LinkageChain from "@/components/LinkageChain";
import MockBadge from "@/components/MockBadge";
import failures from "@/types/failures";
import personas from "@/types/personas";


interface StatusPageProps {
  params: Promise<{ regNo: string }>;
}


export function generateStaticParams() {
  return personas.map((persona) => ({ regNo: persona.regNo }));
}


export async function generateMetadata({ params }: StatusPageProps): Promise<Metadata> {
  const { regNo } = await params;
  const persona = personas.find((item) => item.regNo === regNo);

  return persona
    ? { title: `${persona.name.hi} की किस्त` }
    : { title: "रिकॉर्ड नहीं मिला" };
}


function formatHindiDate(value: string) {
  return new Intl.DateTimeFormat("hi-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}


export default async function StatusPage({ params }: StatusPageProps) {
  const { regNo } = await params;
  const persona = personas.find((item) => item.regNo === regNo);

  if (!persona) {
    notFound();
  }

  const failure = failures.find((item) => item.code === persona.failureCode);
  if (!failure) {
    notFound();
  }

  return (
    <main id="main-content" className="page-shell status-page">
      <nav className="no-print mb-6" aria-label="वापस जाएँ">
        <Link
          href="/"
          prefetch={false}
          className="touch-link"
        >
          ← दूसरा नंबर देखें
        </Link>
      </nav>

      <section className="document-card print-card mb-8 p-5 sm:p-6" aria-labelledby="beneficiary-title">
        <div className="flex flex-wrap items-center gap-2">
          <p className="section-label">लाभार्थी का रिकॉर्ड</p>
          <MockBadge hi="नमूना डेटा" />
        </div>
        <div className="mt-4">
          <div>
            <h1 id="beneficiary-title" className="text-[30px] font-semibold leading-[1.3] text-[var(--ink)]">
              {persona.name.hi}
            </h1>
            <p className="secondary-copy mt-1" lang="en">
              {persona.name.en}
            </p>
            <p className="mt-3 text-[19px] font-semibold">
              {persona.village.hi}, {persona.district.hi}
            </p>
            <p className="secondary-copy" lang="en">
              {persona.village.en}, {persona.district.en}
            </p>
          </div>

          <dl className="mt-5 grid gap-4 border-t border-[var(--rule)] pt-4">
            <div className="grid gap-1">
              <dt className="text-[19px] font-semibold">रजिस्ट्रेशन नंबर</dt>
              <dd className="font-mono text-[19px] font-semibold">{persona.regNo}</dd>
            </div>
            <div className="grid gap-1">
              <dt className="text-[19px] font-semibold">मिली हुई किस्तें</dt>
              <dd className="text-[19px] font-semibold">
                {persona.installmentsReceived}
                <span className="secondary-copy ml-2" lang="en">
                  installments
                </span>
              </dd>
            </div>
            <div className="grid gap-1">
              <dt className="text-[19px] font-semibold">आख़िरी किस्त</dt>
              <dd className="text-[19px] font-semibold">
                {formatHindiDate(persona.lastInstallmentDate)}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <div className="status-results space-y-8">
        <DiagnosisCard failure={failure} />
        <LinkageChain linkage={persona.linkage} brokenLink={failure.brokenLink} />
        <ActionCard failure={failure} persona={persona} />
      </div>
    </main>
  );
}
