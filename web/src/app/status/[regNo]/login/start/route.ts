import { NextRequest, NextResponse } from "next/server";

import { getPersonaAndFailure } from "@/lib/data";
import {
  DIAGNOSIS_COOKIE,
  MOCK_COOKIE_OPTIONS,
  SESSION_COOKIE,
} from "@/lib/mock-auth";
import { createTrackerRecord } from "@/lib/tracker-api";


interface StartLoginRouteContext {
  params: Promise<{ regNo: string }>;
}


function browserOrigin(request: Request) {
  const requestUrl = new URL(request.url);
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const protocol = request.headers.get("x-forwarded-proto") ?? requestUrl.protocol.slice(0, -1);
  return host ? `${protocol}://${host}` : requestUrl.origin;
}


export async function GET(request: NextRequest, { params }: StartLoginRouteContext) {
  const { regNo } = await params;
  const origin = browserOrigin(request);
  const match = getPersonaAndFailure(regNo);
  if (!match) {
    return NextResponse.redirect(new URL("/", origin), { status: 303 });
  }

  const existingSession = request.cookies.get(SESSION_COOKIE)?.value;
  const validSession = existingSession && /^[0-9a-f-]{36}$/i.test(existingSession)
    ? existingSession
    : null;

  let storage = "ready";
  if (validSession) {
    try {
      await createTrackerRecord(validSession, regNo, match.failure.code);
    } catch {
      storage = "unavailable";
    }
  }

  const response = NextResponse.redirect(
    new URL(
      validSession
        ? `/tracker/${encodeURIComponent(regNo)}?storage=${storage}`
        : `/status/${encodeURIComponent(regNo)}/login`,
      origin,
    ),
    { status: 303 },
  );
  response.cookies.set(DIAGNOSIS_COOKIE, regNo, {
    ...MOCK_COOKIE_OPTIONS,
    maxAge: 60 * 60,
  });
  return response;
}
