import MockBadge from "@/components/MockBadge";
import Link from "@/components/PlainLink";
import personas from "@/types/personas";


interface DemoRegistrationListProps {
  compact?: boolean;
}


export default function DemoRegistrationList({ compact = false }: DemoRegistrationListProps) {
  return (
    <ul className={compact ? "demo-quick-grid" : "grid gap-3"} aria-label="नमूना रजिस्ट्रेशन नंबर">
      {personas.map((persona) => (
        <li key={persona.regNo}>
          <Link
            href={`/status/${persona.regNo}`}
            prefetch={false}
            className={compact ? "demo-quick-link" : "flex min-h-14 items-center justify-between gap-4 rounded-[4px] border-2 border-[var(--ink)] bg-[var(--surface)] px-4 py-3 text-[var(--ink)] focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[var(--ink)]"}
            aria-label={compact ? `${persona.regNo}, ${persona.name.hi}, ${persona.district.hi}` : undefined}
          >
            <span className="min-w-0">
              <span className={compact ? "block font-mono text-[15px] font-semibold tracking-tight" : "block font-mono text-[19px] font-semibold tracking-tight"}>
                {compact ? persona.regNo.slice(-4) : persona.regNo}
              </span>
              <span className={compact ? "sr-only" : "mt-1 block text-[19px] leading-snug"}>
                {persona.name.hi} · {persona.district.hi}
              </span>
            </span>
            {!compact && <MockBadge hi="नमूना" />}
          </Link>
        </li>
      ))}
    </ul>
  );
}
