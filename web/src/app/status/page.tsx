import { redirect } from "next/navigation";


interface StatusLookupProps {
  searchParams: Promise<{ regNo?: string | string[] }>;
}


export default async function StatusLookup({ searchParams }: StatusLookupProps) {
  const { regNo } = await searchParams;
  const value = Array.isArray(regNo) ? regNo[0] : regNo;
  const normalized = value?.trim().toUpperCase();

  if (!normalized) {
    redirect("/");
  }

  redirect(`/status/${encodeURIComponent(normalized)}`);
}
