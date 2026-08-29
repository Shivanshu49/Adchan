export type ServiceIconName =
  | "money"
  | "shield"
  | "register"
  | "building"
  | "card"
  | "checklist"
  | "help"
  | "weather"
  | "crops"
  | "fertilizer"
  | "calculator"
  | "notifications"
  | "video"
  | "profile";


export default function ServiceIcon({ name }: { name: ServiceIconName }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  return (
    <svg viewBox="0 0 48 48" role="presentation">
      {name === "money" && (
        <>
          <path {...common} d="M18 8c0-3 12-3 12 0 1 3 3 5 6 7 5 4 7 10 6 16-1 7-6 10-18 10S7 38 6 31c-1-6 1-12 6-16 3-2 5-4 6-7Z" fill="var(--c-sage)" />
          <path {...common} d="M15 15c6 2 12 2 18 0" />
          <path {...common} d="M20 22h9M20 26h9M22 22c5 0 5 8 0 8l8 6" />
        </>
      )}
      {name === "shield" && (
        <>
          <path {...common} d="m24 5 14 6v10c0 10-5 17-14 22-9-5-14-12-14-22V11l14-6Z" fill="var(--c-sage)" />
          <path {...common} d="m16 24 5 5 11-12" strokeWidth="3" />
        </>
      )}
      {name === "register" && (
        <>
          <rect {...common} x="10" y="5" width="23" height="35" rx="4" fill="var(--c-sage)" />
          <path {...common} d="M16 14h11M16 20h9M27 36l11-12 4 4-11 12-6 2 2-6Z" fill="var(--c-leaf)" />
        </>
      )}
      {name === "building" && (
        <>
          <path {...common} d="M7 18h34L24 6 7 18ZM10 37h28M6 42h36M12 18v19M20 18v19M28 18v19M36 18v19" />
          <path {...common} d="M21 8h6" stroke="var(--c-leaf)" strokeWidth="3" />
        </>
      )}
      {name === "card" && (
        <>
          <rect {...common} x="5" y="11" width="38" height="27" rx="5" fill="var(--c-sage)" />
          <path {...common} d="M5 19h38M11 30h7M23 30h11" />
        </>
      )}
      {name === "checklist" && (
        <>
          <rect {...common} x="8" y="5" width="32" height="38" rx="4" fill="var(--c-sage)" />
          <circle {...common} cx="16" cy="15" r="3" />
          <circle {...common} cx="16" cy="25" r="3" />
          <path {...common} d="M22 15h11M22 25h11m-19 9 3 3 6-7m3 5h7" />
        </>
      )}
      {name === "help" && (
        <>
          <path {...common} d="M8 29V23a16 16 0 0 1 32 0v6" />
          <rect {...common} x="5" y="25" width="8" height="13" rx="4" fill="var(--c-sage)" />
          <rect {...common} x="35" y="25" width="8" height="13" rx="4" fill="var(--c-sage)" />
          <path {...common} d="M39 38c-2 4-5 5-10 5" />
        </>
      )}
      {name === "weather" && (
        <>
          <path {...common} d="M13 37h24a8 8 0 0 0 1-16 13 13 0 0 0-24-5 10 10 0 0 0-1 21Z" fill="var(--c-sage)" />
          <path {...common} d="M13 12 9 8m29 4 4-4M25 6V1" stroke="var(--c-leaf)" />
        </>
      )}
      {name === "crops" && (
        <>
          <path {...common} d="M24 42V22" strokeWidth="2.5" />
          <path {...common} d="M24 28C14 28 9 20 9 12c9 0 15 6 15 16ZM24 23c10 0 16-8 16-16-9 0-16 6-16 16Z" fill="var(--c-leaf)" />
          <path {...common} d="M11 42h26" strokeWidth="3" />
        </>
      )}
      {name === "fertilizer" && (
        <>
          <path {...common} d="M17 8h14l5 7v25c-7 3-17 3-24 0V15l5-7Z" fill="var(--c-sage)" />
          <path {...common} d="M17 8h14M16 17h16" />
          <path {...common} d="M24 22c6 3 7 10 0 14-7-4-6-11 0-14Z" fill="var(--c-leaf)" />
        </>
      )}
      {name === "calculator" && (
        <>
          <rect {...common} x="9" y="4" width="30" height="40" rx="5" fill="var(--c-sage)" />
          <rect {...common} x="14" y="9" width="20" height="8" rx="2" />
          <path {...common} d="M16 24h2m6 0h2m6 0h1M16 31h2m6 0h2m6 0h1M16 38h2m6 0h2m6 0h1" strokeWidth="3" />
        </>
      )}
      {name === "notifications" && (
        <>
          <path {...common} d="m7 19 13-5 16-8v31l-16-8-13-5v-5Z" fill="var(--c-sage)" />
          <path {...common} d="M14 27v14h7V30M40 15c3 4 3 9 0 13" />
        </>
      )}
      {name === "video" && (
        <>
          <rect {...common} x="5" y="10" width="38" height="28" rx="7" fill="var(--c-dark-olive)" />
          <path d="m20 18 13 6-13 7Z" fill="white" />
        </>
      )}
      {name === "profile" && (
        <>
          <circle {...common} cx="24" cy="24" r="20" fill="var(--c-sage)" />
          <circle cx="24" cy="18" r="7" fill="currentColor" />
          <path d="M11 38c1-9 7-13 13-13s12 4 13 13" fill="currentColor" />
        </>
      )}
    </svg>
  );
}
