# Adchan — Build Guide

Repo: https://github.com/Shivanshu49/Adchan

---

## What makes this better than pmkisan.gov.in

Fill the right column with real numbers as you build. This table is your
video, your README, and your 250-word summary.

| | pmkisan.gov.in today | Adchan |
|---|---|---|
| Get a diagnosis | Reg. no + captcha + navigate | 2 taps, no login, no captcha |
| What it tells you | `PFMS rejected` | "Your bank account isn't linked to Aadhaar" |
| What to do next | Nothing | Office + documents + the sentence to say |
| Language | English, dense | Hindi first, voice in and out |
| If you can't read | Unusable | Fully usable — speak and listen |
| On 2G | Heavy, often times out | < 100KB first load |
| No signal at the bank | Nothing | Works offline (service worker) |
| Wrongly declared ineligible | Recovery notice, no guidance | Tells you that you can contest, drafts the response |
| When self-service fails | Dead end | Pre-filled CPGRAMS grievance |

**The framing that matters:** the portal isn't ugly, it's **mute**. It reports
the system's internal state and never translates it into a human action.
Adchan is that missing translation layer. Say this in the video.

---

## Architecture rule (non-negotiable)

> **The model handles language. A hand-written rulebook handles facts.**

The LLM classifies a complaint into one of 12 `FailureCode`s. It never writes
the remedy. Every word of advice comes from `shared/failures.json`.

Enforced at three layers:
1. Strict JSON schema on the API call (enum-constrained)
2. Pydantic `FailureCode` enum — invalid value raises before use
3. Explicit `if code not in FAILURES` server-side check

Because hallucinating "go to the patwari" when the answer is "go to your bank"
costs a farmer a day's wage and his bus fare.

---

## Phase 0 — Scaffold (2h)

```bash
git clone https://github.com/Shivanshu49/Adchan.git && cd Adchan

npx create-next-app@latest web --typescript --tailwind --app --eslint --src-dir --use-npm
uv init api && cd api
uv add fastapi uvicorn openai pydantic-settings slowapi httpx asyncpg sqlalchemy
cd ..

mkdir -p shared scripts docs api/evals web/public/audio web/public/fonts
```

`.gitignore` — verify before first push:
```bash
printf '.env\n.env*.local\n__pycache__/\n.venv/\nnode_modules/\n.next/\n' >> .gitignore
git check-ignore -v .env.local   # must print a match
```

`AGENTS.md` at repo root (Codex reads this automatically — and your video
claims Codex was meaningfully involved, so this file is part of the proof):

```markdown
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
api/ FastAPI → Render (Singapore, free Docker service)
shared/failures.json is the single source of truth for both.
```

**Deploy both with hello-world today.** A live URL on day one means the
submission link is never a last-minute panic.

```bash
npx vercel --prod
```

The Render service builds with `api/` as its root and `api/Dockerfile`. On the
free tier it sleeps after roughly 15 idle minutes. Budget about **50 seconds**
for the first cold request; observed wake-up times vary, and subsequent requests
are fast. The landing page starts a speculative `/health` request immediately.
Voice and text checks wait up to 60 seconds, tracker calls wait up to 30 seconds,
and user actions still in flight after three seconds explain in Hindi that the
service is waking. The judging warm-up below reduces, but does not eliminate,
that first-request delay.

---

## Phase 1 — Shared contract (3h)

`shared/failures.json` is written (12 entries). Two jobs now:

**1. Field-correct it.** The `office`, `documents` and `typicalDays` fields are
inference, not verified fact. Which office fixes what varies by state. Print it,
take it to a CSC operator, mark it up. Expect a third to change. This correction
is your moat — nobody else will have it.

**2. Codegen.** One source, three consumers:

```bash
# scripts/codegen.py — run after every taxonomy edit
# → web/src/types/failures.ts   (TS union + typed import)
# → api/models.py               (Pydantic FailureCode enum)
# → api/schema.sql              (Postgres enum)
```

Never hand-maintain a second copy. Drift between frontend and backend copies is
the one real risk of a split stack; codegen kills it.

`shared/personas.json` — 8 mock beneficiaries, `UP-DEMO-0001`…`0008`, one per
failure code, each with the 4 linkage booleans (aadhaar/bank/land/ekyc).

---

## Phase 2 — Field research (parallel, partner-led)

6 farmers + 2 CSC operators. Consent on camera. No passbooks or Aadhaar in frame.

Three engineering outputs:
- **Corrected `failures.json`**
- **`api/evals/cases.jsonl`** — hand-labelled complaints → expected code
- **`api/evals/audio/`** — 30 clips + hand-corrected transcripts for the WER benchmark

Ask about what they *did*, never what they *would* do.

---

## Phase 3 — Core journey (10h)

**Backend — 3 routes, that's the whole API:**

```
api/
  main.py          # FastAPI app, CORS locked to your Vercel domain
  engine.py        # pure functions — classification logic, no framework imports
  models.py        # generated Pydantic models
  routes/
    diagnose.py    # complaint text → {code, confidence, needs_clarification}
    transcribe.py  # audio → Hindi text (Sarvam Saarika)
    track.py       # tracker state (Postgres, post-login only)
```

`diagnose` must:
- use strict JSON schema, enum-constrained to the 12 codes
- validate `code in FAILURES` server-side before returning
- return `needs_clarification: true` below ~0.7 confidence instead of guessing
- be rate limited (slowapi) — your link is public and judges will hammer it

**Test the failure path deliberately.** Force a bad model response and confirm
you get the clarification flow, not a crash and not garbage advice.

**Frontend:**

```
web/src/app/
  page.tsx                 # reg. no input + demo numbers listed on the page
  status/[regNo]/page.tsx  # SERVER COMPONENT — static import, zero API call, zero DB
```

`/status/[regNo]` imports the taxonomy directly and renders on the server. No
fetch, no round trip, edge cached. **This is what lets you say "there's no
database call in the diagnosis path."**

Three components:
- **Diagnosis card** — plain sentence large; raw error code collapsed under
  "technical detail" (that's your honesty marker, not your headline)
- **Linkage map** — 4 boxes (Aadhaar / bank / land / eKYC), red dot on the
  broken one. Plain CSS divs, no chart library.
- **Action card** — office, documents, spoken script. Print + WhatsApp share,
  because the person who fixes it is usually the son or the CSC operator.

**Demoable product ends here.** Everything after is upgrade.

---

## Phase 4 — Voice (6h)

**TTS is build-time, not runtime.** 12 explanations + 12 scripts = 24 MP3s,
generated once with Bulbul, committed to `web/public/audio/`.

```bash
python scripts/generate_audio.py   # run once, commit output
```

Zero runtime cost, zero latency, works offline, works if Sarvam is down during
judging. Mention this in the video.

**STT is runtime** — Sarvam Saarika primary, `gpt-4o-transcribe` fallback on
timeout. Mic capture → `/transcribe` → classify → same status page.

---

## Phase 5 — Evidence (6h) ← your differentiator

Nobody else will have measured anything on real users.

```
api/evals/
  cases.jsonl      # from your interviews
  run.py           # accuracy + confusion matrix + MISROUTE RATE
  wer.py           # Saarika vs Whisper on the 30 farmer clips
```

Wire `run.py` into CI on every prompt change.

Then your video says **"94% accuracy on 60 real farmer complaints, 3% misroute
rate — here's the confusion matrix, and here's the confidence threshold below
which we ask instead of guess."** That is a number no competitor has.

**If Whisper beats Saarika on your clips, switch and publish that.** The number
is only worth something if you were willing to be surprised by it.

---

## Phase 6 — Performance & offline (5h)

**Font subsetting** — the Hindi vocabulary is bounded by the shared taxonomy and
demo personas, so the shipped font contains only the Devanagari glyphs used by
those contracts plus digits, ₹ and basic punctuation.

```bash
pip install fonttools brotli
python scripts/extract_hindi_chars.py

# The development machine has Google's Noto variable font installed. Pin it to
# Regular first; a downloaded NotoSansDevanagari-Regular.ttf can be used directly.
fonttools varLib.instancer \
  '/usr/share/fonts/google-noto-vf/NotoSansDevanagari[wght].ttf' \
  wght=400 --output=/tmp/NotoSansDevanagari-Regular.ttf

pyftsubset /tmp/NotoSansDevanagari-Regular.ttf \
  --text-file=hindi-chars.txt --flavor=woff2 --layout-features='*' \
  --output-file=web/public/fonts/noto-hi-subset.woff2
```

The source variable TTF is 276,816 bytes; its Regular instance is 193,496
bytes; the shipped WOFF2 subset is 29,688 bytes (84.7% smaller than the Regular
TTF). `next/font/local` loads it with `font-display: swap`.

**Regeneration rule:** rerun the extractor and `pyftsubset` whenever text in
`shared/failures.json` or `shared/personas.json` changes. Otherwise a newly
introduced Devanagari character may render as tofu (□) on devices without a
suitable fallback font. Also bump `CACHE_NAME` in `web/public/sw.js` whenever
the worker's cache schema or versioned content changes, so existing
installations replace stale assets.

**Service worker** — hand-rolled, no PWA plugin. Keep install-time transfer
small for metered connections, then cache the status case the citizen actually
opens. A farmer standing in a bank with no signal still gets that action card.
For this user that isn't a nice-to-have, it's the point.

The implemented worker installs only `public/offline.html`. After the window
`load` event, the server-rendered registration script caches the current status
HTML, its hashed Next CSS/font and the two MP3s present on that page. For demo
0001 that is 184,704 audio bytes, rather than downloading roughly 2.47MB of all
24 recordings. Audio for another failure is cached lazily on its first request
or when that status page is visited. These resources use cache-first.
`/diagnose` and `/transcribe` use network-first and return a Hindi 503
explanation when the network is absent. An uncached navigation receives
`public/offline.html`. Session-specific `/status/*/login` and `/tracker/*`
routes bypass the worker completely and are never written to Cache Storage.

**Performance targets:**

- Core diagnosis remains fully readable with JavaScript disabled.
- Status-route HTML document is under 10KB gzip.
- LCP is under 2.5 seconds on Slow 4G with 4x CPU throttling.

**Baseline — 2026-08-26, `/status/UP-DEMO-0001`:**

- Diagnosis, linkage map and action card render completely without JavaScript.
- HTML document: 8,497 bytes gzip (49,718 bytes uncompressed).
- Lighthouse 13.4.1 mobile, simulated Slow 4G + 4x CPU: LCP 1.662s,
  FCP 0.892s, Speed Index 0.892s, TBT 31.5ms, performance score 100.
- Route-specific output is a 170-byte Next.js stub with no Adchan React client
  logic; the only authored browser code is the after-load inline service-worker
  registrar. The shared Next.js runtime remains approximately 103KB gzip.

**Font/offline verification — 2026-08-26:**

We ship a 29KB subsetted font despite a measured 325ms median LCP regression
under Lighthouse Slow 4G, because the failure mode of relying on system
Devanagari is not "slower" but "unreadable." Devanagari coverage on low-end
Android is inconsistent, and missing glyphs render the diagnosis as tofu (□).
We accept a measured 325ms cost to eliminate an unmeasured but catastrophic
failure. Lighthouse's simulated link is also more favourable than real rural
connections, where controlling total bytes matters more than the simulation
suggests. The regression is reported explicitly because it is evidence that we
measured the decision rather than assuming the subset would be faster.

Five Lighthouse 13.4.1 runs per variant used the same mobile, simulated Slow 4G
and 4x CPU configuration:

| Variant | Run 1 LCP | Run 2 LCP | Run 3 LCP | Run 4 LCP | Run 5 LCP | Median LCP | Median FCP | CLS (all runs) |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 29KB local subset | 1.587s | 1.818s | 1.894s | 1.944s | 1.792s | 1.818s | 0.837s | 0 |
| System Devanagari fallback | 1.453s | 1.664s | 1.492s | 1.494s | 1.664s | 1.494s | 0.842s | 0 |
| Measured difference | +0.135s | +0.154s | +0.402s | +0.450s | +0.129s | **+0.325s** | -0.006s | 0 |

`next/font/local` emits a WOFF2 preload in the generated status document's
`<head>`; the request is initiated by that link, not discovered late from CSS.
A separate transport-throttled browser trace saw fallback text paint before the
WOFF2 completed, so `font-display: swap` does not create an invisible-text
period. The subsequent swap caused a small horizontal reflow in the header
disclaimer and village label (CLS 0.00139); the diagnosis headline's box did not
move.

- The rebuilt status HTML is 53,528 bytes raw and 9,757 bytes with gzip, still
  inside the 10KB document target after adding footer links and SW registration.
- After visiting demo 0001, cache inventory contains six responses: that status
  HTML, one CSS file, one hashed font, `offline.html`, and only the two
  `NPCI_NOT_MAPPED` MP3s. With the production origin fully stopped, the worker
  served those resources from cache: diagnosis, linkage map and action card
  rendered, and both recordings remained available. Visiting demo 0002 then
  added exactly its status HTML and two `EKYC_PENDING` recordings; the other 20
  MP3s remained uncached.
- Offline limitations: speech transcription, free-text LLM diagnosis,
  WhatsApp/external links, and live government status cannot work. They require
  a network; an uncached navigation receives the Hindi offline explanation.

---

## Phase 7 — Depth (8h)

**Login** — mock OTP (`123456`), visibly badged. Only after diagnosis. Progressive
disclosure is a scored product-thinking point: *we show you the answer before we
ask who you are.*

**Tracker** — mark done, set reminder, check back. Postgres, post-login only.

### Judging window only — keep Render and Neon awake

Neon Free suspends a compute after about five idle minutes. During the judging
window, `.github/workflows/keep-neon-warm.yml` invokes
the Render `/health` route and then `/api/cron/keep-neon-warm` every ten minutes.
The health request wakes the API before the protected route sends a synthetic,
read-only tracker lookup through it. The row is intentionally absent, but its
indexed `SELECT` resets Neon's idle timer. No farmer identifier is used and no
row is written.

Before the judging window:

1. In the Vercel project, set `API_BASE_URL` and `NEXT_PUBLIC_API_URL` to
   `https://adchan.onrender.com`.
2. Generate a random value of at least 16 characters and set it as
   `CRON_SECRET` in Vercel so the route can verify its Bearer token.
3. Add the same value as the GitHub repository Actions secret `CRON_SECRET`.
4. Confirm scheduled runs in GitHub → Actions → **Keep Render and Neon warm
   during judging**. An absent or wrong secret returns 401; an unreachable
   API/database returns 503.
5. Before a demo or submission, open that workflow and choose **Run workflow**.
   The `workflow_dispatch` trigger performs the same warm-up immediately.

GitHub Actions cron is best-effort and can drift when runners are under load.
At a ten-minute cadence this reduces first-hit risk but cannot guarantee that a
Neon compute with a five-minute idle window remains continuously awake. Use the
manual trigger just before a high-stakes demo. This is deliberately a
**judging-window measure, not a production pattern**: it consumes Neon compute
and should be disabled after judging. At real scale, use paid service tiers
instead of manufacturing traffic. See the current
[GitHub scheduled-workflow behavior](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule)
and [Neon scale-to-zero behavior](https://neon.com/docs/introduction/scale-to-zero).

**Adjacent schemes** — 5–6 only (PMFBY, KCC, PM-KMY, Soil Health Card). Argument:
*you already proved your land and identity for PM-KISAN — why prove it again for
every other scheme?* "Apply" generates a **pre-filled packet + document checklist**,
never a fake submission. Badge it.

**Escalation** — when self-service fails, draft the CPGRAMS grievance with all
context pre-filled. This is what earns "end-to-end thinking".

**Three pages that carry the unscored weight:**

- `/whats-real` — three columns: Works today / Mocked / Needs government access.
  Plus known limitations *with your own numbers attached*. Volunteering a weakness
  with a number reads as rigor.
- `/research` — interview clips, failure frequencies, CSC quotes. Unlimited length.
  This is where the footage that doesn't fit in 2 minutes lives.
- `/how-it-works` — PFMS, NPCI mapper, state land records: which need API access,
  which need an MoU. Thundering-herd on installment day (spiky 3x/year traffic,
  not steady). DPDP compliance, no PII at rest. Last-mile: CSC operator mode,
  WhatsApp bot, IVR for feature phones.

---

## Phase 8 — Submission (Aug 26–28)

- [ ] **Aug 26:** switch `LLM_BASE_URL` to OpenAI direct (~₹450). Not the 28th.
- [ ] Rate limit `/diagnose`, $20 hard cap, `/health` + UptimeRobot every 5 min
- [ ] Hand the phone to 5 people who've never seen it. Say nothing. Every
      hesitation is a bug.
- [ ] Header + footer: **"स्वतंत्र प्रोटोटाइप — किसी सरकारी संस्था से संबंधित नहीं।"**
      No government logos, no Ashoka emblem, no ministry colour palette.
- [ ] Demo reg. numbers listed on the landing page — don't make reviewers hunt
- [ ] **Video, 1:55 hard stopwatch.** Farmer cold open (0:06) → demo (0:12–0:55)
      → 6 steps vs 2 taps (0:55) → Codex (1:00) → the rulebook rule (1:14–1:34)
      → end-to-end (1:34) → honesty (1:50). Burned-in English subtitles on all Hindi.
      Loom-style: screen full frame, webcam bubble swaps at the 1:00 handoff.
- [ ] 250-word summary opening with the farmer's quote, linking `/research`
- [ ] **Submit by 4PM on Aug 28.** Form closes 8PM, no grace period.

---

## Phase 9 — Aug 29 → Sept 7 (the top-10 push)

The 28th only needs to land you in the top 250. The mentorship week is where the
win is decided.

- Build **one** last-mile channel for real instead of describing it (WhatsApp is
  easiest)
- Film farmers **using** the build — that footage belongs in the resubmission video
- Deepen the integration architecture with mentor input
- Resubmit Sept 7, same email addresses

---

## Team split

**You:** `api/`, engine, evals, infra, deployment.
**Partner:** `shared/failures.json`, field research, Hindi content, `/whats-real`,
`/research`, video.

Content is half this product. One clear Hindi sentence explaining NPCI mapping is
worth more than any component.

`main` only, small commits, pull before push. No branch protection at this size.
