"use server";

import { randomUUID } from "node:crypto";

import { redirect } from "next/navigation";

import { getPersonaAndFailure } from "@/lib/data";
import { getMockSessionId } from "@/lib/mock-auth";
import {
  getTrackerRecord,
  markTrackerDone,
  saveTrackerReminder,
  type TrackerRecord,
} from "@/lib/tracker-api";


export type TrackerMutationResult =
  | { ok: true; record: TrackerRecord }
  | { ok: false; message: string };


function formString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}


async function trackerContext(formData: FormData) {
  const regNo = formString(formData, "regNo");
  const match = getPersonaAndFailure(regNo);
  if (!match) redirect("/");

  const sessionId = await getMockSessionId();
  if (!sessionId) redirect(`/status/${encodeURIComponent(regNo)}`);
  return { regNo, sessionId, ...match };
}


export async function markActionDone(formData: FormData): Promise<TrackerMutationResult> {
  const context = await trackerContext(formData);
  try {
    const record = await markTrackerDone(
      context.sessionId,
      context.regNo,
      context.failure.code,
    );
    if (!record) {
      return { ok: false, message: "काम सेव नहीं हुआ। बदलाव वापस कर दिया गया—फिर कोशिश करें।" };
    }
    return { ok: true, record };
  } catch {
    return { ok: false, message: "काम सेव नहीं हुआ। बदलाव वापस कर दिया गया—फिर कोशिश करें।" };
  }
}


export async function setReminder(formData: FormData): Promise<TrackerMutationResult> {
  const context = await trackerContext(formData);
  const reminderDate = formString(formData, "reminderDate");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(reminderDate)) {
    return { ok: false, message: "याद दिलाने की सही तारीख़ चुनें।" };
  }

  const reminderAt = new Date(`${reminderDate}T09:00:00+05:30`);
  if (Number.isNaN(reminderAt.getTime())) {
    return { ok: false, message: "याद दिलाने की सही तारीख़ चुनें।" };
  }

  try {
    const record = await saveTrackerReminder(
      context.sessionId,
      context.regNo,
      context.failure.code,
      reminderAt.toISOString(),
    );
    if (!record) {
      return { ok: false, message: "तारीख़ सेव नहीं हुई। पुरानी तारीख़ वापस रख दी गई—फिर कोशिश करें।" };
    }
    return { ok: true, record };
  } catch {
    return { ok: false, message: "तारीख़ सेव नहीं हुई। पुरानी तारीख़ वापस रख दी गई—फिर कोशिश करें।" };
  }
}


export async function mockSubmitGrievance(formData: FormData) {
  const context = await trackerContext(formData);
  const requiredFields = ["category", "subject", "situation", "reason", "dates", "attempts"];
  if (requiredFields.some((field) => !formString(formData, field))) {
    redirect(`/tracker/${encodeURIComponent(context.regNo)}/escalate?error=incomplete`);
  }

  let record;
  try {
    record = await getTrackerRecord(context.sessionId, context.regNo);
  } catch {
    redirect(`/tracker/${encodeURIComponent(context.regNo)}/escalate?error=storage`);
  }
  if (!record || record.markedDoneAt) {
    redirect(`/tracker/${encodeURIComponent(context.regNo)}`);
  }

  const expectedAt = new Date(record.createdAt);
  expectedAt.setUTCDate(expectedAt.getUTCDate() + context.failure.typicalDays);
  if (expectedAt.getTime() > Date.now()) {
    redirect(`/tracker/${encodeURIComponent(context.regNo)}?error=not-ready`);
  }

  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const suffix = randomUUID().slice(0, 6).toUpperCase();
  const mockId = `CPGRAMS-MOCK-${date}-${suffix}`;
  redirect(
    `/tracker/${encodeURIComponent(context.regNo)}/escalate?submitted=${encodeURIComponent(mockId)}`,
  );
}
