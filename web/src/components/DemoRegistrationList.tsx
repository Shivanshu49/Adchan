import Link from "next/link";

import personas from "@/types/personas";


export default function DemoRegistrationList() {
  return (
    <ul className="grid gap-3 sm:grid-cols-2" aria-label="डेमो रजिस्ट्रेशन नंबर">
      {personas.map((persona) => (
        <li key={persona.regNo}>
          <Link
            href={`/status/${persona.regNo}`}
            className="group flex min-h-20 items-center justify-between gap-4 border-2 border-[#1d2330] bg-[#fffdf7] px-4 py-3 shadow-[3px_3px_0_#1d2330] transition-transform hover:-translate-y-0.5 focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#8f2d24]"
          >
            <span className="min-w-0">
              <span className="block font-mono text-[18px] font-black tracking-tight text-[#1d2330]">
                {persona.regNo}
              </span>
              <span className="mt-1 block text-[18px] leading-snug text-[#4c4a45]">
                {persona.name.hi} · {persona.district.hi}
              </span>
            </span>
            <span className="shrink-0 border border-[#8f2d24] bg-[#fff0eb] px-2 py-1 text-[18px] font-black tracking-wide text-[#7c211b]">
              डेमो
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
