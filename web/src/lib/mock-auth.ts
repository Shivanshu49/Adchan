import { cookies } from "next/headers";


export const DIAGNOSIS_COOKIE = "adchan_diagnosed";
export const SESSION_COOKIE = "adchan_session";


export const MOCK_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};


export async function getMockSessionId() {
  const value = (await cookies()).get(SESSION_COOKIE)?.value;
  return value && /^[0-9a-f-]{36}$/i.test(value) ? value : null;
}


export async function hasDiagnosisReceipt(regNo: string) {
  return (await cookies()).get(DIAGNOSIS_COOKIE)?.value === regNo;
}
