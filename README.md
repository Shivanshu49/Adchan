# अड़चन / Adchan

> Independent prototype. Not affiliated with any government body.
> All beneficiary data is synthetic. See [What's real](https://adchan-web.vercel.app/whats-real) for exactly what is mocked.

**Live:** [adchan-web.vercel.app](https://adchan-web.vercel.app)

---

PM-KISAN sends ₹2,000 to a farmer's bank account three times a year. When it does not arrive, he opens the portal and gets this:

```
Aadhaar not seeded in bank account / PFMS rejected
```

That is the whole answer. No explanation he can read, no next step, no idea whether to go to the bank, the CSC or the land records office.

Adchan turns that error into an instruction.

```
आपका बैंक खाता आधार से जुड़ा नहीं है।
Your bank account is not linked to Aadhaar.

कहाँ जाना है:   अपनी बैंक शाखा
क्या ले जाना है:  पासबुक, आधार कार्ड
क्या बोलना है:   "मुझे अपना आधार NPCI से लिंक करवाना है।"   [ ▶ सुनिए ]
आमतौर पर ~7 दिन लगते हैं।
```

It prints, it shares on WhatsApp, and it reads itself aloud, because many beneficiaries cannot read. If the fix stalls past the 21 day norm, it drafts the CPGRAMS grievance.

## Why this is not a redesign

The portal is not ugly. It is mute. It reports the system's internal state and then stops, and never translates that state into an action a person can take. Adchan is that missing translation layer.

And it is not one failure. The same red cross hides twelve of them. eKYC pending is a job the farmer does himself in a day. Land record not seeded means the patwari and roughly a month. Wrongly flagged as an income tax payer means the block office, and nobody tells him he can contest it. Same screen, three completely different days of his life. Telling them apart is the product.

## The rule that shaped the build

> **The model handles language. A hand-written rulebook handles facts.**

The model classifies a spoken or typed complaint into one of twelve `FailureCode` values. That is all it does. It never writes the remedy. Every office, every document and every spoken script comes from [`shared/failures.json`](shared/failures.json), which is written by hand.

This is enforced in three places:

1. Strict JSON schema on the API call, constrained to the twelve-value enum
2. A Pydantic `FailureCode` enum that raises before an invalid value can be used
3. An explicit server-side check: if the code is not in `FAILURES`, return `UNKNOWN` and ask a clarifying question in Hindi

A hallucinated "go to the patwari" when the answer is "go to your bank" costs a farmer a day's wage and his bus fare. That is not an acceptable error, so it is made structurally impossible rather than discouraged by a prompt.

## Try it

No login is required to get a diagnosis. Eight demo beneficiaries, each stuck on a different failure:

| Registration number | Failure | Sends you to |
| --- | --- | --- |
| `UP-DEMO-0001` | Aadhaar not seeded / NPCI not mapped | Bank branch |
| `UP-DEMO-0002` | eKYC pending | Your own phone, or a CSC |
| `UP-DEMO-0003` | Land record not seeded | Patwari, then tehsil |
| `UP-DEMO-0004` | Invalid account number | CSC |
| `UP-DEMO-0005` | Physical verification pending | Block agriculture office |
| `UP-DEMO-0006` | Wrongly flagged as income tax payer | Block office, contestable |
| `UP-DEMO-0007` | Flagged as institutional landholder | Tehsil, then block office |
| `UP-DEMO-0008` | Declared ineligible, recovery notice issued | Block office, contestable |

To try the tracker and the grievance draft: any 10 digit phone number, OTP `123456`.

## Architecture

| Layer | Choice | Why |
| --- | --- | --- |
| Frontend | Next.js 15 App Router, TypeScript, Tailwind, on Vercel | Server components ship almost no JS. The hardest constraint here is a low literacy user on a slow connection. |
| Backend | FastAPI on Render, Singapore | Pydantic makes the enum constraint a type level guarantee, not a convention. |
| Contract | `shared/failures.json` | One hand-edited source. Codegen produces TypeScript types, Pydantic models, a Postgres enum and `api/failure_data.py`. |
| Database | Neon Postgres | Tracker state only. It is never touched on the diagnosis path. |
| Speech to text | Sarvam Saarika | Trained on Indian languages. Verified working in production. |
| Text to speech | Sarvam Bulbul, generated at build time | 24 committed MP3s. Zero runtime latency, works offline, works if the provider is down. |
| Classification | OpenAI compatible endpoint, configured by env | See "What is not working" below. |
| Build agent | Codex CLI, driven by `AGENTS.md` | |

The diagnosis page makes zero database calls and zero API calls. It imports the taxonomy directly and renders on the server. This was verified by stopping both FastAPI and Postgres: all eight personas still returned 200 with the correct Hindi diagnosis in 16 to 62 ms.

## Measured

| Metric | Result |
| --- | --- |
| Lighthouse performance, mobile | 99 to 100 |
| Lighthouse accessibility | 100 |
| LCP, Slow 4G with 4x CPU throttle | 1.93 s |
| Status page HTML, gzipped | ~9 KB |
| Devanagari font, subsetted | 193,496 B to 29,688 B (84.7% smaller) |
| Tracker query, before and after connection pooling | 4.6 s to ~600 ms |
| API test suite | 37 passing |

The font subset costs a measured 325 ms of LCP against relying on system Devanagari. We ship it anyway, because the failure mode of a missing system font is not "slower", it is tofu boxes where the diagnosis sentence should be. The full measurement table is in [`docs/BUILD.md`](docs/BUILD.md).

The connection pooling number came from instrumenting a single query: 2.15 s of it was statement preparation and type discovery being thrown away on every call, because each tracker operation opened a fresh connection. Postgres execution itself was about 0.1 ms.

## What is not working

Stated plainly, because a reviewer should not have to discover this themselves.

**Classification is offline.** Speech to text works in production. The classifier that maps a spoken complaint to a failure code does not, because our LLM gateway account was blocked mid build and we could not fund a direct provider before the deadline. The system degrades as designed: it returns a Hindi clarifying question instead of guessing a code. Classifier accuracy is therefore unmeasured. The eval harness (60 cases, 12 codes, a misroute rate gate) is built and runs on demand.

**The taxonomy is not field verified.** The `office`, `documents` and `typicalDays` fields are our best inference. They have not been corrected by a CSC operator and may be wrong in some states.

**Farmer interviews: 0. Real device tests: 0.** Neither has happened yet.

**Free tier cold start.** The API sleeps after 15 minutes idle and the first request afterwards can take around 50 seconds. A scheduled ping mitigates this but does not eliminate it.

## Repo layout

```
shared/failures.json     the twelve failures. hand-edited, single source of truth
shared/personas.json     eight mock beneficiaries
scripts/codegen.py       generates TS types, Pydantic models, Postgres enum
scripts/generate_audio.py  build-time Hindi TTS, run once, output committed
web/                     Next.js frontend
api/                     FastAPI service, engine, evals
docs/BUILD.md            phase by phase build log and measurements
docs/DESIGN.md           design tokens, screen specs, copy rules
ui/                      original static design prototype
AGENTS.md                constraints read by Codex and Claude Code
```

Generated files carry a `DO NOT EDIT` header. Editing them is a mistake; edit `shared/failures.json` and re-run codegen.

## Local setup

```bash
git clone https://github.com/Shivanshu49/Adchan.git && cd Adchan

# frontend
cd web && npm install && cp .env.example .env.local
npm run dev

# backend
cd ../api && uv sync && cp .env.example .env
uv run uvicorn main:app --reload
```

Fill in `.env` from `.env.example`. The diagnosis journey works with no API keys at all; you only need them for classification, speech to text and the tracker.

```bash
python scripts/codegen.py          # after any taxonomy edit
python scripts/generate_audio.py   # regenerates the 24 Hindi MP3s
```

## Built by

**Shivanshu Dixit** ([@Shivanshu49](https://github.com/Shivanshu49)) backend, architecture, infrastructure, evals
**Aman** design system, frontend, Hindi content
**Prayag Singh Kushwaha** video

Built in five days for [Build What Moves India](https://buildwhatmovesindia.com), driven with OpenAI Codex.

## The bigger point

The real fix is not an app. A citizen facing portal should never show a citizen an internal error code. Publish a standard error taxonomy so that every failure returns a plain language reason and a resolution path, and every department's portal improves at once. Adchan is the demonstration. The recommendation is the product.
