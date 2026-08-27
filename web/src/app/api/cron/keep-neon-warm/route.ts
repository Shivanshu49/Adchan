import type { NextRequest } from "next/server";

import { getTrackerRecord } from "@/lib/tracker-api";


const WARMUP_SESSION_ID = "00000000-0000-4000-8000-000000000099";
const WARMUP_REG_NO = "ADCHAN-JUDGING-WARMUP";


export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ ok: false }, { status: 401 });
  }

  try {
    // A missing synthetic record is expected; the indexed SELECT itself is the ping.
    await getTrackerRecord(WARMUP_SESSION_ID, WARMUP_REG_NO);
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false }, { status: 503 });
  }
}
