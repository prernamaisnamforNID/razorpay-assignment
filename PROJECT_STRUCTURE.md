# Myra · Family Trip Planner — Project Structure

Razorpay × NID Design Assignment · Prerna
AI travel planning journey for the **MakeMyTrip app**, built around its AI assistant **Myra**.

This repo contains **two things**:

1. **Documentation site** (opens first) — the case study.
2. **Coded prototype** — a simulated environment with the MMT app inside a phone mockup.

Plain **HTML + CSS + JS**. No framework, no build step. Hosted on **GitHub Pages**.
Files are created as we build — this document defines the folders and what goes in each.

---

## 1. Live URLs

| Page | URL |
|---|---|
| Documentation | `https://<username>.github.io/razorpay-assignment/` |
| Prototype | `https://<username>.github.io/razorpay-assignment/prototype/` |

GitHub Pages settings: **Settings → Pages → Deploy from a branch → `main` / `(root)`**.

---

## 2. Folder structure

```
razorpay-assignment/
│
├── (root)                 ← Documentation page (opens first), README, this file
│
├── docs/                  ← Styles and scripts for the documentation page only
│
├── assets/                ← Everything visual used by the documentation
│   ├── screens/           ← Hi-fi screen exports (PNG @2x)
│   ├── research/          ← Persona, framework, insights, journey map, Myra test
│   ├── flows/             ← User-flow diagrams V1 → V4
│   ├── lofi/              ← Lo-fi screens (to show iteration)
│   ├── clips/             ← Micro-interaction recordings (MP4, 3–6 s, < 2 MB each)
│   └── video/             ← Full recorded walkthrough (backup deliverable)
│
└── prototype/             ← The coded prototype (entry page lives here)
    ├── css/               ← Tokens, page shell, app chrome, components, motion
    ├── js/                ← Boot, state, screen router, scripted Myra, panels, components
    │   └── screens/       ← One module per screen / step of the journey
    ├── data/              ← Fake trip data (family, beaches, modes, prices, times)
    └── assets/
        ├── icons/         ← Lucide SVGs used in the app
        ├── brand/         ← MMT logo, Myra wordmark, Myra button, Speak button, service icons
        ├── photos/        ← Pondicherry + beach photos (or gradient placeholders)
        └── mockup/        ← Phone frame drawn around the app on desktop
```

### What each part of `prototype/` is responsible for

| Area | Responsibility |
|---|---|
| **Tokens** | MMT + Myra colours, type, radius, spacing, shadows as CSS variables |
| **Shell** | Page layout: scenario panel + phone mockup + prompt panel; mobile fallback |
| **App chrome** | Status bar, header, input bar, screen stack container |
| **Components** | Chips, bubbles, cards, fit tags, sheets, meters, map pins, toasts |
| **Motion** | Transitions + keyframes (typing dots, spring, slide, fade) |
| **State** | One state object (step, scenario, saved beaches, chosen mode) + update helpers |
| **Router** | Screen stack: push / pop / replace with slide transitions |
| **Myra engine** | Typing delay, reply rendering, "Working on your request…" loader |
| **Script** | All conversation copy: steps, Myra replies, prompts per step |
| **Scenarios** | Happy path + edge cases (over budget, over capacity, nothing saved, error) |
| **Panels** | Scenario switcher, journey tracker, "Try saying" prompts, restart |
| **Sheet** | Draggable bottom sheet (pointer events, snap, close) |
| **Screens** | Home, Myra home, chat steps, destination sheet, beaches fit, map, travel |

> Keep the **script** and **scenarios** separate from everything else — that's the part you'll edit most.

---

## 3. Documentation page

One long scrolling page, sticky nav, sections in this order:

| # | Section | Content |
|---|---|---|
| 1 | **Hero** | Title, one-line problem, buttons: *Try the prototype · Watch walkthrough · Figma file* |
| 2 | **The brief** | Razorpay × NID brief, 4 design areas, constraints |
| 3 | **Research** | 3 conversations (who, what learned, how it shaped design), Myra test findings, current behaviour |
| 4 | **Insights** | 7 insights, persona *"The Family Trip Planner"*, fixed vs flexible framework |
| 5 | **Principles + HMWs** | 5 principles, overall HMW + 5 supporting HMWs |
| 6 | **Directions explored** | 2–3 directions (flows), why Flow B was chosen — show V1 → V4 |
| 7 | **Solution** | Hi-fi screens H01–H07 + **big button → prototype** + embedded prototype (iframe) |
| 8 | **How AI works** | What Myra does, how the parent controls it, how trust is built (checked-against, left-out reasons, nothing removed without asking) |
| 9 | **Micro-interactions** | MP4 loops with one line on *why* each exists |
| 10 | **States** | Loading, empty, error, edge cases (over budget, over capacity) |
| 11 | **AI in my process** | One example AI improved discovery, one it improved the solution — accepted / changed / rejected |
| 12 | **Decisions & tradeoffs** | Key decisions, what I'd do next with more time |

Embedding the prototype in the Solution section:

```html
<iframe src="prototype/?embed=1" title="Myra prototype" loading="lazy"></iframe>
```

Micro-interaction clips play like GIFs:

```html
<video src="…" autoplay muted loop playsinline></video>
```

---

## 4. Prototype page

### Layout (desktop ≥ 1024 px)

```
┌───────────────────────────────────────────────────────────────┐
│  ← Back to case study        Myra · Family trip prototype      │
├──────────────────┬──────────────────────┬─────────────────────┤
│  SCENARIO        │                      │  TRY SAYING          │
│  ● Happy path    │   ┌──────────────┐   │  Prompts for the     │
│  ○ Over budget   │   │              │   │  current step.       │
│  ○ Too many      │   │  App inside  │   │  Tap = sent as if    │
│    beaches       │   │  phone       │   │  typed / spoken.     │
│  ○ Prices failed │   │  mockup      │   │                      │
│                  │   │  390 × 844   │   │                      │
│  JOURNEY         │   │              │   │                      │
│  1 Home ✓        │   └──────────────┘   │                      │
│  2 Myra ●  …     │      ↺ Restart       │                      │
└──────────────────┴──────────────────────┴─────────────────────┘
```

### Layout (phone < 600 px)

- No mockup — app fills the screen (`100dvh`, safe-area insets).
- Side panels collapse into a floating **"Try saying…"** button → bottom drawer.
- `?embed=1` hides side panels (used by the docs iframe).

### Interaction rules

- **Prompt panel = the keyboard / mic.** Tapping a prompt types it into the input, sends it, Myra replies.
- **Everything else is tapped inside the app:** chips, cards, hearts, tabs, sheets, map pins, back.
- Tapping the app's input bar **pulses the prompt panel** (shows where to "type").
- Journey tracker lets reviewers **jump to any step**.
- Scenario switcher **restarts at the step where that edge case happens**.

---

## 5. Journey (screens + steps)

| Step | Screen | What happens | In-app actions |
|---|---|---|---|
| 1 | H01 Home | MMT home, Myra nudge above nav | Tap **Myra** nav button |
| 2 | H02 Myra home | "Hi, Anjali", *Plan a family trip*, empty *Your trips* | Tap card or send prompt |
| 3 | H03 Chat | Trip summary carousel (When / Where / Who / Budget) → daughter question | Swipe cards, chips, **Skip for now** |
| 3b | H03 Chat | Mum & Papa question → answers | Chips |
| 4 | H04 Chat | "Planning around" strip, Pondicherry card, rain note | Tap card / **Explore beaches** |
| 5 | H05 Sheet | Pondicherry page, Beaches tab, fit tags, *Left out: Paradise* | Save ♥, tabs, drag sheet down |
| 6 | H06a Chat | Fit meter (3 of 4 windows), inline map, stay hint | **Open map**, Share |
| 6b | H06b Map | Full-screen map, filters, pin card | Tap pins, back |
| 7 | H07a Chat | Session 2: travel modes compared (Drive best fit, Fly 96 % budget, Bus left out) | Ask-about chips |
| 7b | H07b Chat | "What about the train?" → train card + side-by-side | Chips |
| 7c | H07c Chat | Drive chosen → sleep-timed timeline, cab card, budget bar | **Lock in cab** |
| End | — | Toast: *"Cab locked in. Next: where to stay"* + restart | — |

---

## 6. Scenarios (edge cases + states)

| Scenario | Starts at | What changes | Brief requirement |
|---|---|---|---|
| Happy path | Step 1 | — | One well-crafted journey |
| **Over budget** | Step 7 | Parent picks **Fly** → Myra flags 96 % of ₹45K, offers drive / cheaper dates | Edge case: over budget |
| **Too many beaches** | Step 6 | 5 saved → meter shows +1 → *Pair two* / *Keep best 4* | Edge case / plans change |
| **Nothing saved** | Step 6 | H06c — map of all beaches, *Skip for now* | Empty state |
| **Prices didn't load** | Step 7c | Cab card errors → *Retry · Continue without* | Error state |

Loading state everywhere: Myra's own **"Working on your request…"** card + typing dots (800–1500 ms).

---

## 7. Micro-interactions checklist

- [ ] Screen push / pop — slide 280 ms, `cubic-bezier(.2,.8,.2,1)`
- [ ] Myra typing dots → reply fades + rises 8 px
- [ ] Prompt / chip → becomes user bubble (scale-in from the input)
- [ ] Summary + beach carousels — `scroll-snap-type: x mandatory`
- [ ] Heart save — spring scale 1 → 1.25 → 1 + fill
- [ ] Fit meter — segment fills with width transition when a beach is saved
- [ ] Bottom sheet — slides up, drag down to close, dimmed backdrop
- [ ] Press state on all tappables — `transform: scale(.97)`
- [ ] Over-capacity — extra segment pops in orange with a small shake
- [ ] Toast on lock-in — slides up from input bar, auto-hides

Respect `prefers-reduced-motion` (disable spring/slide, keep fades).

---

## 8. Design tokens

```css
:root {
  /* MMT */
  --blue: #008CFF;          --blue-light: #EAF5FF;
  --text: #000000;          --text-body: #222222;
  --text-2: #4A4A4A;        --text-3: #9B9B9B;
  --bg: #F2F2F2;            --surface: #FFFFFF;     --border: #E7E7E7;
  --red: #EB2026;
  /* Myra */
  --myra-navy: #0B1C36;     --myra-indigo: #4665AC;  --myra-blue: #4093EC;
  --myra-grad: linear-gradient(90deg, #4665AC, #4093EC);
  --myra-bubble: #F2F6FD;   --myra-bubble-border: #DCE6F5;  --myra-chip-border: #94BCF0;
  /* Fit tags */
  --good-bg: #E8F6EE;  --good: #1A7F4B;
  --warn-bg: #FFF4E0;  --warn: #8A5300;
  --bad-bg:  #FDECEC;  --bad:  #B42318;
  /* Type */
  --font-app: "Lato", system-ui, sans-serif;      /* MMT home */
  --font-myra: "Poppins", system-ui, sans-serif;  /* Myra screens */
  /* Shape */
  --r-sm: 8px; --r-md: 14px; --r-lg: 18px; --r-xl: 24px; --r-pill: 999px;
  --shadow: 0 2px 10px rgba(0,0,0,.10);
  /* Phone */
  --phone-w: 390px; --phone-h: 844px;
}
```

---

## 9. Conversation script format

Keep all copy in one place so it's easy to edit:

```js
export const steps = {
  h03_intro: {
    screen: "h03",
    prompts: [
      "Weekend in Pondicherry with my husband, our 3-year-old and my parents. Leave Friday, back Sunday night. Around ₹45K."
    ],
    myra: [
      { type: "text", text: "Got it. Here's what I'm planning with — swipe to check, tap any card to change it." },
      { type: "summaryCarousel" },
      { type: "text", text: "Now, the people I should plan around. Let's start with your daughter." },
      { type: "questionCard", person: "daughter", skippable: true }
    ],
    next: "h03_daughter"
  },
  // …
};
```

---

## 10. Fake data

Family, dates, budget, beaches (name, drive time, rating, fit tags, left-out reason),
travel modes (time, cost for 5, % of budget, fit tags), cab, timeline.

> ⚠️ Prices, drive times and train details are **placeholders** — verify on MMT / Google Maps
> before presenting. Only the flight price (₹4,302 onwards) comes from an MMT screenshot.

---

## 11. Run locally (Simple Web Server)

1. Open **Simple Web Server** (Windows app). It serves the repo root
   `C:\Users\prern\OneDrive\Documents\GitHub\razorpay-assignment` on port **8083**.
2. Documentation: http://127.0.0.1:8083/
3. Prototype: http://127.0.0.1:8083/prototype/
4. Test phone layout: Chrome DevTools → device toolbar (Ctrl/Cmd + Shift + M) → iPhone 14.

ES modules (`type="module"`) need a server — opening the file directly won't work.
Use relative paths only (no leading `/`) so the same files work locally and on GitHub Pages.

---

## 12. Deploy

```bash
git add .
git commit -m "Add prototype and case study"
git push
```

Wait ~1 min → check both URLs in an **incognito** window and on your **phone**.

---

## 13. Before submitting

- [ ] Both URLs open in incognito
- [ ] Prototype works on a real phone (and "Add to Home Screen" opens full-screen)
- [ ] Every scenario reachable from the switcher
- [ ] No console errors
- [ ] Walkthrough video uploaded (backup deliverable)
- [ ] Placeholder numbers checked or labelled "est."
- [ ] README links to documentation, prototype and video
