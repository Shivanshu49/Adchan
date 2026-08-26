import { NextResponse } from "next/server";

import { getPersonaAndFailure } from "@/lib/data";
import { DIAGNOSIS_COOKIE, MOCK_COOKIE_OPTIONS } from "@/lib/mock-auth";


interface StartLoginRouteContext {
  params: Promise<{ regNo: string }>;
}


function browserOrigin(request: Request) {
  const requestUrl = new URL(request.url);
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const protocol = request.headers.get("x-forwarded-proto") ?? requestUrl.protocol.slice(0, -1);
  return host ? `${protocol}://${host}` : requestUrl.origin;
}


export async function GET(request: Request, { params }: StartLoginRouteContext) {
  const { regNo } = await params;
  const origin = browserOrigin(request);
  if (!getPersonaAndFailure(regNo)) {
    return NextResponse.redirect(new URL("/", origin), { status: 303 });
  }

  const response = NextResponse.redirect(
    new URL(`/status/${encodeURIComponent(regNo)}/login`, origin),
    { status: 303 },
  );
  response.cookies.set(DIAGNOSIS_COOKIE, regNo, {
    ...MOCK_COOKIE_OPTIONS,
    maxAge: 60 * 60,
  });
  return response;
}
