import Link from "next/link";

import MockBadge from "@/components/MockBadge";
import personas from "@/types/personas";


export default function DemoRegistrationList() {
  return (
    <ul className="grid gap-3" aria-label="नमूना रजिस्ट्रेशन नंबर">
      {personas.map((persona) => (
        <li key={persona.regNo}>
          <Link
            href={`/status/${persona.regNo}`}
            prefetch={false}
            className="flex min-h-14 items-center justify-between gap-4 rounded-[4px] border-2 border-[var(--ink)] bg-[var(--surface)] px-4 py-3 text-[var(--ink)] focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[var(--ink)]"
          >
            <span className="min-w-0">
              <span className="block font-mono text-[19px] font-semibold tracking-tight">
                {persona.regNo}
              </span>
              <span className="mt-1 block text-[19px] leading-snug">
                {persona.name.hi} · {persona.district.hi}
              </span>
            </span>
            <MockBadge hi="नमूना" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
