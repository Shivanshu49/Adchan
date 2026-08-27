"use server";

import { randomUUID } from "node:crypto";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getPersonaAndFailure } from "@/lib/data";
import {
  DIAGNOSIS_COOKIE,
  MOCK_COOKIE_OPTIONS,
  SESSION_COOKIE,
  getMockSessionId,
  hasDiagnosisReceipt,
} from "@/lib/mock-auth";
import { createTrackerRecord, deleteTrackerSession } from "@/lib/tracker-api";


function formString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}


export async function completeMockLogin(formData: FormData) {
  const regNo = formString(formData, "regNo");
  const phone = formString(formData, "phone");
  const otp = formString(formData, "otp");
  const match = getPersonaAndFailure(regNo);

  if (!match || !(await hasDiagnosisReceipt(regNo))) {
    redirect(`/status/${encodeURIComponent(regNo)}`);
  }
  if (!/^\d{10}$/.test(phone)) {
    redirect(`/status/${encodeURIComponent(regNo)}/login?error=phone`);
  }
  if (otp !== "123456") {
    redirect(`/status/${encodeURIComponent(regNo)}/login?error=otp`);
  }

  const sessionId = randomUUID();
  (await cookies()).set(SESSION_COOKIE, sessionId, {
    ...MOCK_COOKIE_OPTIONS,
    maxAge: 60 * 60 * 24 * 7,
  });

  let storage = "ready";
  try {
    await createTrackerRecord(sessionId, regNo, match.failure.code);
  } catch {
    storage = "unavailable";
  }

  redirect(`/tracker/${encodeURIComponent(regNo)}?storage=${storage}`);
}


export async function resetDemoState() {
  const sessionId = await getMockSessionId();
  if (sessionId) {
    try {
      await deleteTrackerSession(sessionId);
    } catch {
      // Removing the httpOnly cookie still makes old state unreachable if the API is down.
    }
  }

  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  cookieStore.delete(DIAGNOSIS_COOKIE);
  redirect("/?reset=done");
}
