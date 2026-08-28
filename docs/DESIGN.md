# Adchan — Design Spec

For the second teammate. Build against this, not against taste.

---

## Who you are designing for

Not "a user." One specific person:

> A 54-year-old farmer in western UP. ₹4,000 phone, cracked screen, 2GB RAM.
> Reads Hindi slowly, does not read English. Standing outdoors in bright sun,
> holding the phone at arm's length because of long-sightedness. Has already
> been to two offices this month and been sent away from both. His son is not
> here right now.

Every design decision answers to him. If a choice would look better in a
portfolio but be worse for him, it loses.

**The single job of every screen:** turn "my money didn't come" into "here is
exactly where to go and what to say."

---

## The design thesis

The government portal fails not because it is ugly but because it is **mute**.
It shows the system's internal state and stops.

So Adchan's design cannot be decorative. It has one job: **make the broken thing
obvious, and the next action unmissable.**

That produces one hard rule that governs everything:

> **Color carries meaning or it is not used.**

Exactly two colors in this entire product mean something: one for *broken*, one
for *working*. Every other surface is ink on paper. No brand gradients, no
accent colors on buttons "for interest," no decorative illustration. If a farmer
sees red, something is broken. That signal must never be diluted.

This is a real constraint, not minimalism as a style. Spend the boldness on the
signature element below.

---

## Signature element: the chain

The one thing this product is remembered by.

PM-KISAN payment is a chain of four links: **आधार → बैंक → ज़मीन → eKYC**.
A payment fails when exactly one link breaks. Nobody has ever shown a farmer
that picture.

Make it physical and large — not four small status pills. Full-width, tall
enough to read at arm's length in sunlight, with the broken link visually
*severed*, not merely tinted red.

```
  आधार            बैंक             ज़मीन            eKYC
 ┌──────┐   ╳   ┌──────┐  ───  ┌──────┐  ───  ┌──────┐
 │  ✓   │ ─   ─ │  ✗   │       │  ✓   │       │  ✓   │
 └──────┘       └──────┘       └──────┘       └──────┘
   जुड़ा          टूटा           जुड़ा           जुड़ा
```

The connector between links is solid where the chain holds and visibly broken
where it doesn't. On a phone this stacks vertically — the break is even clearer
as a gap in a vertical line.

**Special case that matters:** when `brokenLink` is `eligibility`, all four links
are intact and the farmer is still blocked. Show the chain fully connected, then
a separate block below it: *"आपकी सारी कड़ियाँ जुड़ी हैं। दिक्कत कहीं और है।"*
That distinction is real and no other product makes it.

---

## Tokens

### Color

```css
--c-dark-olive: #38422B;
--c-moss:       #6E7753;
--c-sage:       #CCD5C0;
--c-leaf:       #9FB873;
--c-olive:      #9AA458;
--c-bg:         #F2F4ED;
--c-card-bg:    #FFFFFF;
--c-card-tint:  #FBFDF6;
--c-ink:        #21291B;
--c-muted:      #56644D;

--c-linkage-broken:  #C1272D; /* broken linkage node/connector only */
--c-linkage-working: #1B7A3D; /* working linkage node/connector only */
```

Notes:
- **No saffron, no white-green-saffron combinations, no Ashoka blue.** That is
  the Indian flag palette and the brief bans looking like an official product.
- Contrast: `--c-ink` on `--c-bg` is 13.55:1. Well past WCAG AAA. That is
  deliberate — this screen is read outdoors.
- Mocked badges use dark olive with a visible `MOCKED` or equivalent label;
  colour is never their only signal.

### Type

**One family: Noto Sans Devanagari.** It's already subsetted to 29KB and it sets
both scripts. Adding a display face costs bandwidth this user pays for. Get
personality from *weight and scale contrast*, not from a second font.

```
Diagnosis sentence   32px / 1.35 / 600    ← the largest text on any screen
Section label        13px / 1.2  / 600    uppercase, letter-spacing 0.08em
Body                 19px / 1.6  / 400    ← note: 19, not 16
Script (to speak)    24px / 1.5  / 500
Caption / technical  15px / 1.5  / 400
```

**19px body minimum, no exceptions.** Standard 16px is designed for people with
good vision holding a phone at reading distance. He isn't.

Hindi first, always. English is secondary and smaller — never the other way
round, and never English-only.

### Layout

```
Outer shell and reading content max width 560px, centered. Content stays a
single readable column at every breakpoint; the linkage chain is the only
element that switches from stacked on mobile to inline on wider screens.
Vertical rhythm: 8px base. Sections separated by 32px.
Side padding: 20px.
Touch targets: 56px minimum height. (48 is the accessibility floor; he has
  thick fingers and a cracked screen.)
Border radius: 4px. Nearly square. Rounded corners read as "app"; this should
  read as "document."
```

---

## Screen specs

### 1. Landing (`/`)

The whole screen answers one question. No hero, no feature grid, no logo lockup.

```
┌────────────────────────────────┐
│ अड़चन          [स्वतंत्र प्रोटोटाइप] │
├────────────────────────────────┤
│                                │
│   आपका ₹2000                   │  ← 32px, 600
│   नहीं आया?                     │
│                                │
│   ┌──────────────────────────┐ │
│   │ अपनी परेशानी लिखें          │ │  ← large text area. PRIMARY.
│   └──────────────────────────┘ │
│                                │
│   [आवाज़ सेवा अभी उपलब्ध नहीं — │  ← 56px. SECONDARY.
│    नीचे लिखकर बताइए]             │
│                                │
│   ┌──────────────────────────┐ │
│   │ रजिस्ट्रेशन नंबर डालिए      │ │  ← 56px
│   └──────────────────────────┘ │
│                                │
│   कोई लॉगिन नहीं। कोई कैप्चा नहीं।│  ← this line is the product claim
│                                │
├────────────────────────────────┤
│ डेमो नंबर (जाँचने के लिए):        │
│ UP-DEMO-0001 … 0008            │  ← visible, tappable, not hidden
└────────────────────────────────┘
```

The complaint text field is the primary action while voice classification is
unavailable. The voice control sits below it and carries the single unavailable
message. Do not repeat that message elsewhere on the screen.

Demo numbers on the page, tappable. A reviewer must never hunt for credentials.

### 2. Status (`/status/[regNo]`)

Order is fixed. Answer first, evidence second, action third.

```
1. DIAGNOSIS      the plain sentence, 32px, on --surface
                  ▸ तकनीकी जानकारी    ← <details>, collapsed, 15px
                    "PFMS rejected / Aadhaar not seeded"

2. THE CHAIN      the signature element. full width.

3. ACTION         ┌ कहाँ जाना है ────────────┐
                  │ अपनी बैंक शाखा            │  19px
                  ├ क्या ले जाना है ──────────┤
                  │ • पासबुक                 │
                  │ • आधार कार्ड             │
                  ├ क्या बोलना है ───────────┤
                  │ ┌────────────────────┐  │  ← visually distinct.
                  │ │ "मुझे अपना आधार     │  │    bordered, --surface,
                  │ │  NPCI से लिंक       │  │    24px. This is the
                  │ │  करवाना है।"        │  │    single most important
                  │ │      [ ▶ सुनिए ]    │  │    block on the screen.
                  │ └────────────────────┘  │
                  └ आमतौर पर ~7 दिन लगते हैं ─┘

4. SHARE          [ WhatsApp पर भेजिए ]   ← full width, 56px
```

**The "what to say" block gets the most visual weight after the diagnosis.**
That sentence is what he repeats at a counter to a clerk who may try to send him
away. Border it, raise it, make the play button large. Everything else on this
screen is preparation for that one block.

**Audio buttons must look pressable, not like a thin icon.** Label them in Hindi
(`▶ सुनिए`), never a bare speaker glyph.

### 3. Mock badges

Every mocked element carries one. Inline, not a footer disclaimer.

```
[ नमूना डेटा ]   ← --mock, 13px, 2px radius, sits adjacent to the element
```

Consistent placement everywhere. A reviewer should be able to scan any screen
and instantly separate real from mocked. This is a scored criterion — treat the
badge as a first-class component, not an afterthought.

### 4. Empty, error, offline

Three states, three jobs. None of them apologise, none are vague.

- **Unknown reg number** — not "not found." Say what to do:
  *"ये नंबर हमारे डेमो में नहीं है। नीचे दिए नंबरों में से कोई आज़माइए।"* + the list.
- **Offline** — say what still works:
  *"इंटरनेट नहीं है। आपकी पिछली जानकारी नीचे मौजूद है।"*
- **Classifier unsure** — this is a feature, not a failure. Ask one specific
  question, don't guess. Show it in the same voice as everything else.

---

## Rules that override taste

1. **19px body minimum.** No exceptions, no "but it looks tighter at 16."
2. **56px touch targets.**
3. **Hindi first on every screen.** English never appears alone.
4. **Color only for meaning.** Two semantic colors. No decorative accents.
5. **No icon without a text label.** Icon-only buttons fail for this user.
6. **No animation on the diagnosis path.** No skeleton loaders, no fades,
   no scroll reveals. It's static HTML — let it be instant.
7. **Nothing government.** No Ashoka emblem, no ministry logos, no flag palette.
   Disclaimer line in the header AND footer of every page.
8. **Test in sunlight.** Take the phone outside. If you can't read it standing
   in a field at noon, the contrast is wrong.

---

## Deliverables for the second teammate

In priority order:

- [ ] The chain component — both states (one broken / all connected-but-blocked)
- [ ] Diagnosis card with collapsed technical detail
- [ ] Action card with the emphasised "what to say" block
- [ ] Mock badge component, used consistently everywhere
- [ ] The three empty/error/offline states
- [ ] Print stylesheet — the action card must print cleanly on A4. He may carry
      the paper rather than the phone.
- [ ] Copy pass on `/whats-real`, `/how-it-works`, `/research`

## Copy rules

Write from his side of the screen, not the system's.

- **"आपका बैंक खाता आधार से जुड़ा नहीं है"** — not "NPCI mapping incomplete"
- Name what he controls, never how the system is built
- Active voice, one job per element
- Errors explain what happened and what to do — never apologise, never vague
- Same word for the same thing everywhere. If a button says *सुनिए*, nothing
  else in the product says *चलाइए* for the same action.

---

## The test

Hand the phone to someone who has never seen this and say only: *"आपका ₹2000
नहीं आया। पता कीजिए क्या करना है।"* Then stay silent and watch.

Every place they hesitate is a bug. Do this with five different people before
the 28th. It will find more than any review will.
