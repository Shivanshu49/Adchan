"use client";

import { useEffect } from "react";


const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
const WARMUP_TIMEOUT_MS = 60_000;


export default function ApiWarmup() {
  useEffect(() => {
    if (!API_URL) return;

    void fetch(`${API_URL}/health`, {
      method: "GET",
      cache: "no-store",
      credentials: "omit",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(WARMUP_TIMEOUT_MS),
    }).catch(() => {
      // This is speculative: user actions keep their own visible error handling.
    });
  }, []);

  return null;
}
