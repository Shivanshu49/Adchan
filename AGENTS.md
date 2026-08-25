# Adchan

Diagnoses why a farmer's PM-KISAN installment failed, in plain Hindi, with the
exact office, documents and script to fix it.

## Hard rules
- The model NEVER generates a fix. It returns only a FailureCode.
  All user-facing remedy text comes from shared/failures.json.
- No real Aadhaar/PAN/account numbers anywhere, including tests.
- Hindi is primary, English secondary.
- Mobile-first. <100KB first load. Server components by default.
- Anything mocked carries a visible badge in the UI.

## Stack
web/ Next.js 15 App Router + TS + Tailwind → Vercel
api/ FastAPI → Fly.io (bom region, min_machines_running = 1)
shared/failures.json is the single source of truth for both.
