import type { FailureCode } from "@/types/failures";


export interface TrackerRecord {
  readonly sessionId: string;
  readonly regNo: string;
  readonly failureCode: FailureCode;
  readonly markedDoneAt: string | null;
  readonly reminderAt: string | null;
  readonly createdAt: string;
}


export class TrackerApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}


function apiBaseUrl() {
  return (
    process.env.API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://127.0.0.1:8000"
  ).replace(/\/$/, "");
}


async function trackerRequest(
  path: string,
  sessionId: string,
  init?: RequestInit,
): Promise<TrackerRecord | null> {
  const response = await fetch(`${apiBaseUrl()}${path}`, {
    ...init,
    cache: "no-store",
    signal: init?.signal ?? AbortSignal.timeout(5_000),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Session-ID": sessionId,
      ...init?.headers,
    },
  });

  if (response.status === 404) return null;
  if (!response.ok) {
    throw new TrackerApiError("Tracker request failed", response.status);
  }
  return response.json() as Promise<TrackerRecord>;
}


export function createTrackerRecord(
  sessionId: string,
  regNo: string,
  failureCode: FailureCode,
) {
  return trackerRequest(`/tracker/${encodeURIComponent(regNo)}`, sessionId, {
    method: "POST",
    body: JSON.stringify({ failureCode }),
  });
}


export function getTrackerRecord(sessionId: string, regNo: string) {
  return trackerRequest(`/tracker/${encodeURIComponent(regNo)}`, sessionId);
}


export function markTrackerDone(
  sessionId: string,
  regNo: string,
  failureCode: FailureCode,
) {
  return trackerRequest(`/tracker/${encodeURIComponent(regNo)}/done`, sessionId, {
    method: "POST",
    body: JSON.stringify({ failureCode }),
  });
}


export function saveTrackerReminder(
  sessionId: string,
  regNo: string,
  failureCode: FailureCode,
  reminderAt: string,
) {
  return trackerRequest(`/tracker/${encodeURIComponent(regNo)}/reminder`, sessionId, {
    method: "POST",
    body: JSON.stringify({ failureCode, reminderAt }),
  });
}


export async function deleteTrackerSession(sessionId: string) {
  const response = await fetch(`${apiBaseUrl()}/tracker/session`, {
    method: "DELETE",
    cache: "no-store",
    signal: AbortSignal.timeout(5_000),
    headers: {
      Accept: "application/json",
      "X-Session-ID": sessionId,
    },
  });

  if (!response.ok) {
    throw new TrackerApiError("Tracker reset failed", response.status);
  }
  return response.json() as Promise<{ cleared: number }>;
}
