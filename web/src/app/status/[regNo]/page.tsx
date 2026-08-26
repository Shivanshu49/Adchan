import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import ActionCard from "@/components/ActionCard";
import DiagnosisCard from "@/components/DiagnosisCard";
import LinkageMap from "@/components/LinkageMap";
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
    <main id="main-content" className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <nav className="no-print mb-6" aria-label="वापस जाएँ">
        <Link
          href="/"
          prefetch={false}
          className="inline-flex min-h-12 items-center border-b-2 border-[#1d2330] text-[18px] font-black text-[#1d2330] hover:border-[#8f2d24] hover:text-[#8f2d24] focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#8f2d24]"
        >
          ← दूसरा नंबर देखें
        </Link>
      </nav>

      <section className="print-card mb-8 border-2 border-[#1d2330] bg-[#e5ded1] p-5 sm:p-7" aria-labelledby="beneficiary-title">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <span className="inline-block bg-[#292232] px-3 py-1 text-[18px] font-black text-white">
              डेमो रिकॉर्ड · MOCKED
            </span>
            <h1 id="beneficiary-title" className="mt-3 text-4xl font-black text-[#1d2330] sm:text-5xl">
              {persona.name.hi}
            </h1>
            <p className="mt-1 text-[18px] text-[#555149]" lang="en">
              {persona.name.en}
            </p>
            <p className="mt-3 text-[20px] font-bold text-[#34312d]">
              {persona.village.hi}, {persona.district.hi}
            </p>
            <p className="text-[18px] text-[#5a554d]" lang="en">
              {persona.village.en}, {persona.district.en}
            </p>
          </div>

          <dl className="grid shrink-0 gap-3 border-t-2 border-[#1d2330] pt-4 sm:min-w-72 sm:border-l-2 sm:border-t-0 sm:pl-6 sm:pt-0">
            <div>
              <dt className="text-[18px] font-bold text-[#5a554d]">रजिस्ट्रेशन नंबर</dt>
              <dd className="font-mono text-[20px] font-black text-[#1d2330]">{persona.regNo}</dd>
            </div>
            <div>
              <dt className="text-[18px] font-bold text-[#5a554d]">मिली हुई किस्तें</dt>
              <dd className="text-[20px] font-black text-[#1d2330]">
                {persona.installmentsReceived}
                <span className="ml-2 text-[18px] font-normal" lang="en">
                  installments
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-[18px] font-bold text-[#5a554d]">आख़िरी किस्त</dt>
              <dd className="text-[18px] font-black text-[#1d2330]">
                {formatHindiDate(persona.lastInstallmentDate)}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <div className="space-y-10">
        <DiagnosisCard failure={failure} />
        <LinkageMap linkage={persona.linkage} />
        <ActionCard failure={failure} persona={persona} />
      </div>
    </main>
  );
}
