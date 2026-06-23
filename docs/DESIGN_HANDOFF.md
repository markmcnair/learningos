# LearningOS — Claude Design handoff

> The surface of the iceberg. Paste these prompts into Claude Design to build the app you'll actually open every day. The engine (FSRS-6 scheduling, BKT mastery, the knowledge graph) gets wired in underneath afterward.

## The one rule everything serves

Show the learner exactly one thing to do right now, and make doing it feel calm, finite, and worth it. Every screen answers a single question and offers a single next move. The learning engine (FSRS-6 scheduling, BKT mastery, the prerequisite graph, relearning, refutation, calibration) is invisible infrastructure: it decides what to surface, never what to display. We translate machinery into plain human language and a small set of warm, concrete signals (a streak, a "you're getting this," a one-line nudge). If a 7-year-old can't understand a screen and an expert isn't insulted by it, it isn't done. When in doubt, remove something. The reward is momentum, not metrics: the user should close the app feeling they moved the ball forward today.

## How to use this pack

Work in Claude Design one prompt at a time. Start by pasting prompt 1 — that's the foundation. It establishes the visual system (tokens, type scale, spacing, color, base components) plus the Today home screen, so everything after it inherits a consistent look. Wait for it to render, glance at it, and nudge anything that feels off before moving on.

Then paste each follow-up prompt one at a time, in the build order below. Each one adds a single screen on top of the system already in the canvas, so don't paste them all at once — let each screen generate, eyeball it, and keep going. If a screen needs tweaking, just chat with the tool in plain language ("make the card spacing tighter", "this CTA should be the accent color", "show the empty state instead"). Iterate by conversation, not by re-pasting the whole prompt. By the end you'll have all seven screens sharing one coherent design.

**Generate the screens in this order:**

1. App foundation + Today (home)
2. First-run + profile picker
3. Session player
4. Brain dump / end-of-session reflection
5. How you're doing (Progress map + calibration)
6. Pack Library
7. Settings

## The look & feel (design language)

**Vibe.** A small packet of ice: clear, cool, and quietly substantial. LearningOS opens like a still room with one lamp on — a single calm surface that says "do this one thing now" and nothing else. The mood is unhurried and confident: lots of white space, one focal object at a time, soft edges, and a single warm accent that marks the one action worth taking today. It should feel like a beautifully made physical tool — a fountain pen, a folded map, a clean index card — friendly enough that a 7-year-old leans in without instruction, and restrained enough that a fund manager never feels condescended to. The serious machinery (spaced repetition, mastery modeling, the prerequisite graph) stays fully submerged; the surface only ever shows clarity, momentum, and a quiet sense of "you moved the ball forward." Nothing sparkles, nothing celebrates loudly, nothing is cartoonish — calm is the reward.

**Color.** #F7F8FA Frost, #FFFFFF Snow, #E8743B Ember accent, #1C2530 Ink — full set in the structured palette field below

**Type.** Fraunces (Google) for headlines/titles, opsz on, weights 400–560; Inter (Google) for body/UI/numerals. Full scale in the typography field.

**Spacing & motion.** 4px base / 8px rhythm; card padding 24–32; radii 8/14/20/pill; 1px hairlines; one soft shadow on focal card only. Motion 120/200/320ms ease-out, one thing moves at a time, ≤12px travel, no confetti, honor prefers-reduced-motion. Full detail in the spacingMotion field.

**One design, child to expert.** One identical shell for all ages; range carried by pack content + a per-profile copy/tone field and a single root readingScale token, never by separate modes or chrome. Full detail in the dualAudience field.

## The 10 simplicity guardrails (every screen obeys these)

- Today shows at most ONE primary button. The whole screen resolves to a single action: 'Start today's session' (or 'Done for today' once finished). No second call-to-action competes with it.
- Never show a raw engine number to the user. No FSRS intervals, BKT probabilities, ease factors, retrievability percentages, or queue counts. Internal numbers may exist in the data layer but are translated to words, a streak, or a simple 3-state signal (New / Getting it / Solid) before they reach a screen.
- One screen, one job, one question. If a screen is trying to answer two questions, split it or cut one. No dashboards, no tabs-within-tabs, no settings bleeding into the daily loop.
- A session is a fixed, finite path of 10-20 minutes that always ends. Show progress as position-in-session (e.g. a quiet dots/segment bar), never as an open-ended backlog or 'cards remaining: 247'. The user must always feel the end is near.
- During a review item, the user sees the prompt and at most a single reveal action, then a small fixed set of plain self-rating choices. No numeric grades, no sliders of options, no jargon. Grading vocabulary is human ('Missed it' / 'Tough' / 'Got it' / 'Easy'), and confidence is captured as a light tap, never required text.
- The machinery is never named on screen. Words like FSRS, BKT, spaced repetition, prerequisite graph, retrievability, calibration, and refutation never appear in primary UI. They may live only in an optional, tucked-away 'How this works' explainer the daily loop never routes to.
- The same components serve a child and an expert with zero mode switches. No 'kid mode' / 'pro mode' toggle, no difficulty selector on the surface. Tone is set by the active Pack's content and a single optional per-profile reading-level flag in data, not by a separate UI.
- Every session ends with exactly one reflection step: a single open brain-dump field with a soft prompt. It is always skippable in one tap, never gated, never graded, never required to mark the day done.
- No infinite or optional content on the daily path. The user cannot 'do more' or 'add cards' from inside Today; when the session is finished, the app says done and gently stops. Extra practice, if it ever exists, lives outside the loop and is never the suggested action.
- Nothing leaves the device by default and the UI never implies it does. No login screen, no account, no sync prompts, no cloud iconography. AI features appear only after the user explicitly adds their own key, and are clearly optional and off until then.

## The data contract (the quiet, critical part)

Every prompt below tells Claude Design to shape its mock data to these types. That's the seam: when you bring the UI back, my engine produces these exact shapes, so it snaps in underneath without a redesign.

```typescript
// === LearningOS core data contract ===
// The UI codes its mock data against these shapes. A real TypeScript engine
// replaces the mock module later by producing the SAME shapes. No UI changes.

// ---- Identity & content ----

type ID = string;
type ISODate = string;      // "2026-06-23"
type ISODateTime = string;  // "2026-06-23T08:14:00"

type ReadingLevel = "child" | "general" | "expert"; // optional tone hint only

interface Profile {
  id: ID;
  displayName: string;        // "Mara", "Dad", "Sage (age 7)"
  avatarSeed: string;         // deterministic avatar/color, no upload
  readingLevel: ReadingLevel; // soft content/tone hint, never a UI mode
  activePackIds: ID[];        // packs this profile is currently learning
  streakDays: number;         // consecutive days a session was completed
  lastCompletedDate: ISODate | null;
  aiEnabled: boolean;         // true only if user added their own API key
  createdAt: ISODateTime;
}

interface Pack {
  id: ID;
  title: string;              // "Options Trading Basics", "Money & Business for Kids"
  description: string;        // one calm sentence
  emoji: string;              // single friendly glyph for the surface
  conceptIds: ID[];           // ordered roughly by intended learning path
  version: string;            // swappable/upgradable content
}

// A Concept is a node in the prerequisite knowledge graph.
interface Concept {
  id: ID;
  packId: ID;
  title: string;              // "What a call option is"
  prerequisiteIds: ID[];      // edges in the prereq graph (engine-only signal)
  itemIds: ID[];              // the items that teach/test this concept
  // Surface-safe mastery signal ONLY. No BKT probability on screen.
  mastery: "new" | "getting-it" | "solid";
}

// ---- Items: the atomic things a session is made of ----

type ItemType =
  | "fact"                 // a single thing to know (front/back recall)
  | "cloze"               // fill-in-the-blank within a sentence
  | "concept-explanation" // short teaching card, often no grading
  | "worked-example"      // step-by-step solved example to study
  | "application"         // apply the idea to a small scenario/problem
  | "refutation";         // names a common misconception, then corrects it

interface Item {
  id: ID;
  conceptId: ID;
  type: ItemType;
  prompt: string;             // question / scenario / teaching headline
  body?: string;              // explanation, worked steps, or scenario detail
  clozeMask?: string[];       // hidden spans for "cloze"
  answer?: string;            // canonical answer for recall/cloze/application
  choices?: string[];         // optional multiple choice (application/refutation)
  misconception?: string;     // the wrong belief being refuted (refutation)
  correction?: string;        // the corrected belief (refutation)
  // Engine-owned scheduling fields. NEVER rendered. Mock fills with plausible
  // values; real engine (FSRS-6 + BKT + relearning) overwrites them.
  scheduling?: {
    due: ISODate;
    stability?: number;       // FSRS internal
    difficulty?: number;      // FSRS internal
    reps?: number;
    lapses?: number;
    learningState?: "new" | "learning" | "review" | "relearning";
  };
}

// ---- The daily session: one finite path ----

type SessionState = "ready" | "in-progress" | "complete";

interface Session {
  id: ID;
  profileId: ID;
  date: ISODate;
  state: SessionState;
  itemIds: ID[];              // ordered path the engine chose for "today"
  currentIndex: number;       // position-in-session for the quiet progress bar
  estMinutes: number;         // 10-20, shown as a soft promise
  reflection?: Reflection;    // captured at the end, optional
  // Surface summary the "Done" screen reads from. Plain language only.
  summary?: {
    itemsDone: number;
    headline: string;         // "You moved 3 ideas closer to solid."
    newStreakDays: number;
  };
}

// ---- Reviews: one per graded interaction ----

type Grade = "missed" | "tough" | "got-it" | "easy"; // human words, not 0-3
type Confidence = "guessed" | "unsure" | "sure";      // light, optional tap

interface Review {
  id: ID;
  sessionId: ID;
  itemId: ID;
  grade: Grade;
  confidence: Confidence | null; // null if skipped
  responseMs?: number;           // engine signal, never shown
  reviewedAt: ISODateTime;
}

// ---- Progress & calibration (for the optional, tucked-away view) ----

interface ProgressSnapshot {
  profileId: ID;
  date: ISODate;
  conceptsSolid: number;       // count, plain
  conceptsGettingIt: number;
  conceptsNew: number;
  streakDays: number;
  // For a calm trend sparkline; raw, no engine internals.
  solidByDay: { date: ISODate; count: number }[];
}

// A CalibrationPoint compares stated confidence to actual correctness.
// Used only in an optional "How well do you know what you know?" view.
interface CalibrationPoint {
  profileId: ID;
  confidence: Confidence;       // bucket
  statedCount: number;          // times this confidence was claimed
  correctCount: number;         // times it was actually right
  // accuracy = correctCount / statedCount; rendered as a simple bar, no %
  // jargon, with a one-line plain reading ("When you say 'sure', you're right
  // most of the time — trust that.").
}
```

---

# The prompts

Copy each block in full. Paste **Prompt 1 first** (it sets up the whole design system). Then paste the rest one at a time, generating a screen, then chatting with Claude Design to refine before moving on.

## Prompt 1 — App foundation + Today (home)

```text
Build the FIRST screen of LearningOS — a local-first, open-source learning app — as a clickable React + TypeScript prototype with mock data. This prompt establishes the GLOBAL DESIGN SYSTEM and the core "Today" home screen. Every later screen builds on what you set up here, so lay the foundation carefully and cleanly. When in doubt, remove something.

=== THE ONE IDEA ===
LearningOS shows a learner exactly ONE thing to do right now and makes doing it feel calm, finite, and worth it. The surface is dead simple; a serious learning engine lives underneath but is NEVER visible. This screen answers one question — "What do I do today?" — and offers one move: Start today's session. Design like a small packet of ice: minimal, calm, warm, elegant. Friendly enough for a 7-year-old, dignified enough for a fund manager. Never cartoonish, gamified, toy-like, or childish. A 7-year-old and a 47-year-old should each understand this screen in two seconds, press one button, and feel the day's ball moved forward.

=== HARD GUARDRAILS (do not violate) ===
- At most ONE primary (accent-colored) button anywhere on screen — "Start today's session". No second competing call-to-action. (Two screens have NO accent button at all: see EMPTY and ERROR states.)
- NEVER show a raw engine number: no intervals, probabilities, percentages, ease factors, stability/difficulty values, or "247 cards remaining". Counts become words or the 3-state signal (New / Getting it / Solid).
- One screen, one job. No dashboards, no grids of metrics, no tabs, no settings bleeding in.
- Show the session as finite: a soft "about 12 min" promise, never an open-ended backlog or a "X of Y" counter.
- Never name the machinery on screen (no "spaced repetition", "FSRS", "BKT", "mastery model", "calibration", "graph", "algorithm"). Plain human language only.
- Same components for child and expert — NO mode toggle, no difficulty selector, no age switch. Tone comes ONLY from pack content plus the per-profile readingLevel field in data, surfaced through a copyFor() helper. The component tree is identical for Sage (child) and Mara (general).
- Nothing leaves the device. No login, no account, no password, no email, no sync, no cloud iconography. AI is off and unmentioned on this screen.
- No badges, no unread counts, no notification dots anywhere — not in the nav, not on the cards.

=== ARCHITECTURE (critical for handoff — read carefully) ===
Put 100% of data and all data-shaped logic in a SINGLE module `src/mockData.ts`. Components NEVER import raw arrays, NEVER filter/sort/derive, and NEVER touch scheduling internals. They receive already-shaped, display-ready values via props. A real TypeScript engine must later replace ONLY this module — producing the exact same types and the exact same query-function signatures — with ZERO changes to any component. Treat `src/mockData.ts` as a swappable adapter behind a frozen interface.

1) TYPES — copy the canonical data contract VERBATIM into `src/types.ts` and import from there. Do not redefine, rename, narrow, or "tidy" any field. The full contract (Profile, Pack, Concept, Item, ItemType, Session, SessionState, Review, Grade, Confidence, Reflection, ProgressSnapshot, CalibrationPoint, and the ID/ISODate aliases) is authoritative; this screen only RENDERS a subset, but every type must exist so later screens compile against the same source. Engine-owned fields (Item.scheduling, prerequisiteIds, responseMs, and all FSRS/BKT internals) exist in data and are NEVER rendered. `Reflection` is opaque here — define it as the contract specifies (or as an empty/extensible interface if unspecified), store it, never render it on this screen.

2) READ API — expose ONLY these pure functions from `src/mockData.ts`. Components call these; they never reach past them. The mock does ALL translation from engine internals to surface-safe values inside these functions, so the UI stays dumb:
   - getProfiles(): Profile[]
   - getActiveProfile(id: ID): Profile | null            // null when the id is unknown/missing
   - getPacksForProfile(id: ID): Pack[]
   - getTodaySession(profileId: ID): Session | null       // null is a valid result → ERROR state; do not throw for "no session"
   - getDueGlance(profileId: ID): { label: string; mastery: Mastery }[]   // the 3–4 "what today touches" lines as PLAIN human labels + a 3-state signal; the mock translates concept/item internals here. Mastery = "new" | "getting-it" | "solid".
   - copyFor(profile: Profile): Copy                       // ALL readingLevel-dependent strings live here (greeting, subline, glance phrasings, done summary, empty/error copy). Tone is data-driven, never branched in components.
   Mutations for this prototype are also confined to the module: addProfile(name: string): Profile (generates id + avatarSeed, no upload) and completeToday(profileId: ID): Session (advances state to "complete", fills summary, ticks streak). Components call these, then re-read.

3) COMPONENT BOUNDARIES — keep each presentational and prop-driven (no data fetching inside leaf components):
   <AppShell> (frame + theme + nav) › <ProfilePicker> › <TodayScreen> composed of <GreetingHeader>, <StreakChip>, <SessionCard> (which renders <DueGlance> + <PrimaryButton>). <TodayScreen> is the only place that calls the read API; it passes plain values down. Every component must render correctly from props alone in a Storybook-style isolation (assume a reviewer will mount <SessionCard> with hand-written props).

=== DESIGN SYSTEM (CSS variables, ship light + dark) ===
Fonts (Google Fonts): titles/headlines "Fraunces" (opsz on; weights 400–560, never above 600); everything else "Inter" with tabular numerals on. Type scale (drive every size from ONE --reading-scale token, default 1.0): Display 36 / lh 1.15 Fraunces 480; Title 24 / lh 1.25 Fraunces 460; Heading 18 Inter 600; Body 16 / lh 1.55 Inter 400; Button/Label 14 Inter 560; Caption 13 Inter 450 in --ink-muted.
Light: --bg:#F7F8FA; --surface:#FFFFFF; --surface-sunken:#EEF1F5; --hairline:#E2E6EC; --ink:#1C2530; --ink-muted:#5B6675; --ink-faint:#9AA4B2; --accent:#E8743B; --accent-pressed:#C95E2A; --calm:#4E7CA8; --grow:#5E9A78; --care:#C26D5A.
Dark: --bg:#0F141A; --surface:#161D26; --surface-sunken:#11171E; --hairline:#2A3340; --ink:#EAEEF3; --ink-muted:#9BA7B5; --ink-faint:#5E6B7A; --accent:#F2864B; --accent-pressed:#D86C34; --calm:#6FA0CC; --grow:#74B48E; --care:#D8806C.
COLOR RULE: the Ember accent appears AT MOST ONCE per screen — only on the primary button. Everything else is neutral ink on frost. Color always carries meaning. No gradients except an optional barely-there 2% frost wash. The 3-state signal is a small 8px filled circle + the word, NO bars, NO percentages: New = --ink-faint dot, "Getting it" = --calm dot, Solid = --grow dot.
LAYOUT: single centered column, max-width 560px; ≥64px breathing room around the focal card on desktop. One focal object per screen. Flat by default; elevation ONLY on the SessionCard and modal sheets. Spacing: 4px base, 8px rhythm. Card padding 24–32px (SessionCard 28–32). Radius: 8px controls/chips, 14px cards, 20px focal card/sheets, pill for the primary button. 1px hairline borders. Focal card/sheet shadow: 0 1px 2px rgba(20,30,45,.05), 0 8px 24px rgba(20,30,45,.06). Flat everywhere else.
MOTION (restrained, physical, never bouncy): 120ms press, 200ms content, 320ms screen/sheet enter; ease-out cubic-bezier(0.22,1,0.36,1). One thing moves at a time; ≤12px translate + gentle fade. Fully honor prefers-reduced-motion with instant cross-fades and a static skeleton. Idle is perfectly still. NO confetti, NO sound, NO looping animation anywhere.
ICONS: simple geometric line glyphs, 1.5px stroke, abstract — never mascots or emoji-art. The pack emoji (from data) is the ONLY glyph exception.
Add a small, quiet light/dark toggle in the shell (line sun/moon glyph, neutral ink, never accent). Default to system preference; persist the choice.

=== APP SHELL & NAVIGATION ===
<AppShell> frames every screen. Desktop: a slim left rail (~64px) with 3 abstract line-glyph icons — Today (active home), a Library/packs glyph, a Profile glyph — all neutral ink; the active item is marked by a quiet 2px left indicator in --ink, NEVER accent. Mobile (<600px): collapse to a bottom bar with the same 3 items. The rail/bar is whisper-quiet: glyphs only, no text labels, but every glyph has an accessible aria-label. Today is the only wired destination; the Library and Profile glyphs show a calm placeholder card "Coming soon — this prototype focuses on Today." (Profile glyph ALSO offers a quiet way back to the ProfilePicker). Top-left of the shell: a tiny wordmark "LearningOS" in Fraunces 460, --ink-muted. NO badges, NO counts, NO dots.

=== PROFILE PICKER (entry, local-first multi-profile) ===
On first load (no persisted profile id) show <ProfilePicker> as the entry screen, centered column. Heading in Fraunces: "Who's learning?" Below it, a calm row/grid of profile tiles from getProfiles(): each tile is a deterministic colored avatar disk derived from avatarSeed showing initials, displayName below, and a soft one-line subtitle drawn from the profile's active pack (subtitle phrasing comes through copyFor so Sage's reads at a child's level). Seed exactly these three mock profiles to prove the "one app, every age" claim:
  1. Mara — readingLevel "general", pack "Options Trading Basics", streakDays 12
  2. Dad — readingLevel "general", pack "Spanish, Slowly", streakDays 4
  3. Sage — readingLevel "child", pack "Money & Business for Kids", streakDays 3
A quiet ghost "+ Add profile" tile (hairline border, --ink-muted, NOT accent) opens a simple inline sheet with one text field "Name" and a Save button, wired to addProfile() (generated avatarSeed, NO avatar upload ever). Tapping a profile does a 320ms cross-fade into the Today screen for that profile. NO login, NO password, NO email — the local-first nature is self-evident through the ABSENCE of any account UI. Persist the chosen profile id and the theme in localStorage so reload returns to Today; the Profile nav glyph returns to the picker.

=== TODAY SCREEN (the focal deliverable) ===
Single centered column, ≥64px air around the focal SessionCard. <TodayScreen> calls the read API once and passes plain values to children.
1) <GreetingHeader>: time-aware greeting in Fraunces Display from copyFor(profile). Mock to morning. Mara → "Good morning, Mara." / sub (Body, --ink-muted, ONE warm line): "One short session today — about 12 minutes." Sage → "Morning, Sage!" / sub: "Here's your one fun thing for today." Identical component; the tone difference comes ONLY from the data field via copyFor.
2) <StreakChip>: small pill, --surface-sunken, a 1.5px line "spark/leaf" glyph (NOT a fire emoji or flame mascot), text "12-day streak" in Inter tabular numerals. Quiet, --ink-muted, NEVER accent. If streakDays === 0, render "Fresh start" instead of "0-day streak". Place top-right of the greeting block or just beneath it — secondary, never shouting.
3) <SessionCard> (THE focal object, the ONLY elevated card: radius 20, padding 28–32, soft shadow):
   - Small eyebrow caption in --ink-muted: active pack emoji + title, e.g. "📈 Options Trading Basics".
   - Title in Fraunces Title: "Today's session".
   - <DueGlance>: render exactly the 3–4 items returned by getDueGlance(profileId), each a short human phrase + an 8px mastery dot + the word signal. NO numbers, NO "3 of 12 cards". Example lines for Mara (these phrasings live in the mock, NOT hard-coded in the component):
       • "Revisit: what a call option is" — Getting it (--calm dot)
       • "New idea: intrinsic vs. time value" — New (--ink-faint dot)
       • "Lock in: strike price basics" — Solid (--grow dot)
     Sage's lines read child-friendly from data, e.g. "What is profit?" — New. The component maps mastery→dot color via a single shared lookup; it does not know what a concept is.
   - A soft finite-promise line beneath the glance: "About 12 minutes." in Caption, --ink-faint, with a tiny line-clock glyph. (Derive the minutes from session.estMinutes via copy, never show the raw number alongside engine data.)
   - The single <PrimaryButton> (pill, --accent, white ink — the ONLY accent on screen): "Start today's session". 120ms press to --accent-pressed. On click, call completeToday() and cross-fade the card to the COMPLETE state. DO NOT build the in-session flow here (that is a later screen) — just simulate completion so the rest state is reachable and clickable.
4) STATES — build all of these and make each reachable for a reviewer WITHOUT adding any visible control to the calm surface. Drive state from the data the read API returns (session.state, lastCompletedDate, empty activePackIds, null session). For demo reachability, allow selecting a state via a URL query param (e.g. ?state=complete) or a single keyboard shortcut that is invisible by default — NEVER a visible toggle, tab, or dev panel on screen.
   - LOADING: SessionCard shows a calm skeleton — 3 shimmer lines + a muted disabled button shape. No spinner. Slow ~1s ease shimmer; with reduced-motion, a static muted skeleton.
   - READY (default, as above).
   - COMPLETE / rest state (after Start, or when lastCompletedDate === today): the focal card cross-fades to a quiet done card — a ~200–400ms line-checkmark DRAW in --grow (no fill burst, no confetti), Fraunces line "Nice — that's today done.", a plain summary from session.summary.headline, e.g. "You moved 3 ideas closer to solid.", and the streak ticked up (e.g. "13-day streak"). The primary button is REPLACED (not duplicated) by a calm, NON-accent "Done for today" resting label — the app gently stops. Add ONE quiet secondary text-link far below in --ink-muted: "See how you're doing" (opens the coming-soon card). It must NOT read as a CTA and must NOT invite "do more". NO "practice more" affordance anywhere.
   - EMPTY (profile has no active pack): SessionCard becomes a calm empty state — Fraunces line "Nothing scheduled yet." + Body "Add a pack to start learning." + a single NEUTRAL (non-accent) "Browse packs" button that opens the coming-soon card. This is one of only two screens with no accent button, because there is no session to start.
   - ERROR (getTodaySession returns null): a gentle card — "We couldn't load today's session." + a quiet "Try again" text button that re-runs the query. Calm, small --care glyph. No red alarm, no stack trace. No accent button here either.

=== COPY (use verbatim where given; plain, short, warm; dignified for a child and an expert) ===
Greeting (Mara): "Good morning, Mara." / sub: "One short session today — about 12 minutes."
Greeting (Sage): "Morning, Sage!" / sub: "Here's your one fun thing for today."
Primary CTA: "Start today's session"
Done headline: "Nice — that's today done." / summary: "You moved 3 ideas closer to solid."
Resting label (replaces CTA when done): "Done for today"
Secondary link (done state): "See how you're doing"
Empty: "Nothing scheduled yet." / "Add a pack to start learning." / button "Browse packs"
Error: "We couldn't load today's session." / "Try again"
Picker heading: "Who's learning?" / add tile "+ Add profile" / field "Name" / "Save"
Coming-soon placeholder: "Coming soon — this prototype focuses on Today."
Streak: "{n}-day streak" (tabular) / streakDays 0 → "Fresh start"
ALL of these strings that vary by readingLevel must be produced by copyFor(profile), not branched inside components.

=== ACCESSIBILITY & FINISH ===
Full keyboard nav. Visible 2px focus ring in --calm (NEVER accent) on the hairline. aria-label on every glyph-only control. Contrast AA in both themes. Min tap target 44px. Tabular numerals for the streak. Default --reading-scale 1.0. The only motion permitted is: the entrance cross-fade, the 120ms button press, the ~200–400ms checkmark draw, and the skeleton shimmer — everything else is still. NO confetti, NO sound. When in doubt, remove something.

=== DATA CONTRACT (paste verbatim into src/types.ts; the mock and every later engine produce these exact shapes) ===
type ID = string;
type ISODate = string;      // "2026-06-23"
type ISODateTime = string;  // "2026-06-23T08:14:00"
type ReadingLevel = "child" | "general" | "expert";
interface Profile { id: ID; displayName: string; avatarSeed: string; readingLevel: ReadingLevel; activePackIds: ID[]; streakDays: number; lastCompletedDate: ISODate | null; aiEnabled: boolean; createdAt: ISODateTime; }
interface Pack { id: ID; title: string; description: string; emoji: string; conceptIds: ID[]; version: string; }
interface Concept { id: ID; packId: ID; title: string; prerequisiteIds: ID[]; itemIds: ID[]; mastery: "new" | "getting-it" | "solid"; }
type ItemType = "fact" | "cloze" | "concept-explanation" | "worked-example" | "application" | "refutation";
interface Item { id: ID; conceptId: ID; type: ItemType; prompt: string; body?: string; clozeMask?: string[]; answer?: string; choices?: string[]; misconception?: string; correction?: string; scheduling?: { due: ISODate; stability?: number; difficulty?: number; reps?: number; lapses?: number; learningState?: "new" | "learning" | "review" | "relearning"; }; }
type SessionState = "ready" | "in-progress" | "complete";
interface Session { id: ID; profileId: ID; date: ISODate; state: SessionState; itemIds: ID[]; currentIndex: number; estMinutes: number; reflection?: Reflection; summary?: { itemsDone: number; headline: string; newStreakDays: number; }; }
type Grade = "missed" | "tough" | "got-it" | "easy";
type Confidence = "guessed" | "unsure" | "sure";
interface Review { id: ID; sessionId: ID; itemId: ID; grade: Grade; confidence: Confidence | null; responseMs?: number; reviewedAt: ISODateTime; }
interface ProgressSnapshot { profileId: ID; date: ISODate; conceptsSolid: number; conceptsGettingIt: number; conceptsNew: number; streakDays: number; solidByDay: { date: ISODate; count: number }[]; }
interface CalibrationPoint { profileId: ID; confidence: Confidence; statedCount: number; correctCount: number; }
// Reflection is captured at session end and is opaque on this screen; define as the engine specifies, render nothing here.
interface Reflection { [k: string]: unknown }
// Surface-only helper types used by the read API:
type Mastery = Concept["mastery"];
interface Copy { greetingTitle: string; greetingSub: string; doneHeadline: string; doneSummary: string; emptyTitle: string; emptyBody: string; errorTitle: string; estMinutesLabel: string; /* plus any readingLevel-dependent label used on screen */ }

Engine-owned fields (Item.scheduling, Concept.prerequisiteIds, Review.responseMs, every FSRS/BKT internal) live in the data but are NEVER rendered on this screen. A real engine replaces src/mockData.ts ONLY, emitting these same shapes and the same read-API signatures, with zero UI changes.
```

_Clean seams this screen preserves (so the engine wires in later):_

- src/types.ts — canonical data contract pasted VERBATIM (Profile, Pack, Concept, Item/ItemType, Session/SessionState, Review/Grade/Confidence, Reflection, ProgressSnapshot, CalibrationPoint, ID/ISODate aliases, plus surface-only Mastery and Copy). Single source of truth; the real engine compiles against this unchanged.
- src/mockData.ts — the ONLY swappable module. A real TypeScript engine (FSRS-6 + BKT + relearning) replaces this file alone, emitting identical shapes and identical read-API signatures, with zero component changes. All engine→surface translation happens here.
- Read API (frozen signatures): getProfiles(): Profile[]; getActiveProfile(id): Profile | null; getPacksForProfile(id): Pack[]; getTodaySession(profileId): Session | null; getDueGlance(profileId): { label: string; mastery: Mastery }[]; copyFor(profile): Copy. Components call ONLY these and never touch raw arrays, sorting, or scheduling fields.
- getDueGlance is the key abstraction seam: it converts concept/item/scheduling internals into 3–4 plain human labels + a 3-state mastery signal, so the UI stays dumb. The engine reimplements this body; <DueGlance> never changes.
- copyFor(profile) is the tone seam: ALL readingLevel-dependent strings (greeting, subline, due-glance phrasings, done summary, empty/error copy, picker subtitles) resolve here. child vs general/expert differ in DATA only — the component tree is identical, with no mode toggle.
- Mutation seam (prototype-local): addProfile(name) and completeToday(profileId) live in mockData.ts; a real engine swaps their bodies for persistence/scheduling writes while keeping signatures. Components call then re-read.
- Null/empty/error are data-driven, not exception-driven: getTodaySession returns null (not throw) to reach ERROR; empty activePackIds reaches EMPTY; getActiveProfile returns null for unknown ids. This keeps the four+ states reachable purely by swapping mock data.
- Engine-owned fields (Item.scheduling{due,stability,difficulty,reps,lapses,learningState}, Concept.prerequisiteIds, Review.responseMs and all FSRS/BKT internals) exist in data but are guaranteed never rendered — verify no component imports or reads them.
- Component contract: <AppShell> › <ProfilePicker> / <TodayScreen> › <GreetingHeader>, <StreakChip>, <SessionCard> (renders <DueGlance> + <PrimaryButton>). Every component is prop-driven and mountable in isolation from hand-written props; only <TodayScreen> calls the read API.
- Design-system seam: CSS variables for light+dark, one --reading-scale token driving the type scale, and a single mastery→dot-color lookup ({new:--ink-faint, getting-it:--calm, solid:--grow}) shared by <DueGlance>. Later screens consume the same tokens and lookup so the system scales without a redesign.
- Demo/state-reachability seam: state is selected via URL query param (?state=) or an invisible keyboard shortcut — never a visible toggle/tab/dev-panel — so LOADING/READY/COMPLETE/EMPTY/ERROR are demoable without adding clutter to the calm surface.

## Prompt 2 — First-run + profile picker

```text
Extend the existing LearningOS Claude Design project. REUSE the established design system already in this project — do not redefine or duplicate any of it. Reuse: the "small packet of ice" visual style; the Fraunces / Inter type scale; the light + dark CSS color variables (--bg, --surface, --surface-sunken, --hairline, --ink, --ink-muted, --ink-faint, --accent, --accent-pressed, --calm, --grow, --care); the single-centered-column 560px daily-loop layout; the existing button / card / sheet components; the existing motion timings; and the existing `mockData.ts` module and its TypeScript contract shapes. Do NOT redefine fonts, colors, tokens, or navigation. Build ONLY the new "First-run + profile picker" screen below and wire it in as the app's entry point that routes into the existing Today screen.

ONE JOB, ONE QUESTION — "Who's learning today?"
This screen does exactly one thing. On the first ever open it warmly welcomes and helps make the first profile. On every later open it is the calm profile switcher. Zero account, zero login, zero sync — nothing leaves the device. It always resolves into picking or creating a local profile and landing on that profile's existing Today screen. If an element does not serve "who's learning?", remove it.

NON-NEGOTIABLE ANTI-CLUTTER RULES (these override anything below if they ever conflict):
- AT MOST ONE primary action (one Ember --accent element) visible per state, and only ever on the single primary action of the active state. If two things want the accent, one of them is wrong.
- NO dashboard of numbers. Never render a raw count, interval, percentage, streak number, or queue size. Momentum is words only.
- Generous whitespace: >=64px of breathing room around the focal area on desktop. Flat surfaces on --bg; elevation only on the focal card and the create sheet.
- Simple enough that a 7-year-old can navigate it with no instruction, and dignified enough that an expert feels respected. Same components serve both — zero mode switches, no kid/pro toggle, no difficulty selector.
- One thing moves at a time; when idle the screen is perfectly still.

LAYOUT
Single centered column, max-width 560px. A small wordmark "LearningOS" in Fraunces 460 at the top (title size), with a one-line caption beneath in --ink-muted Inter: "On this device. Nothing leaves it." Below it, the focal card. The Ember --accent appears AT MOST ONCE on this screen, on the single primary action of whatever state is active. No cloud icons, no "sign in", no sync language anywhere — the only device language is the reassuring "Nothing leaves it." line.

COPY (warm, plain, finite — equally right for a child and an expert; use exactly these words)
- Wordmark: "LearningOS"
- Header caption: "On this device. Nothing leaves it."
- Returning-user card title: "Who's learning today?"
- Add row: "Add someone"
- First-run welcome title: "Welcome."
- First-run welcome line: "Let's set up who's learning."
- First-run primary button: "Create your first profile"
- Error line: "Couldn't read this device's profiles."
- Error retry button: "Try again"
- Sheet title: "Who's learning?"
- Name field label: "Your name" — placeholder "e.g. Mara"
- Goal field label: "What are you here for? (optional)" — placeholder "Get comfortable with options"
- Sheet primary button: "Start learning"
- Sheet footer caption: "Lives only on this device."
Keep all copy calm and dignified. No exclamation beyond "Welcome.", no marketing tone, no jargon.

DATA — ONE SWAPPABLE MODULE, PROPS DOWN
Extend the existing `mockData.ts` only. Do NOT invent parallel shapes — use the contract's `Profile` and `Pack` exactly. Expose from the module a clean async interface so a real TypeScript engine can replace the file later with ZERO UI changes:
- `getProfiles(): Promise<Profile[]>`
- `getPacks(): Promise<Pack[]>`
- `createProfile(input): Promise<Profile>` where input is `Pick<Profile,'displayName'|'activePackIds'|'readingLevel'|'aiEnabled'>`; the module itself fills `id`, `avatarSeed` (derived deterministically from displayName), `streakDays: 0`, `lastCompletedDate: null`, and `createdAt`. The UI never invents engine-owned fields.
Keep ALL seed data and ALL simulated latency / error toggles INSIDE the module, behind a small internal `_sim` config (e.g. `{ latencyMs, failNext }`) that only the module reads. No component imports anything from the module except those three functions and the contract types.

MOCK DATA (seed exactly this content)
Packs (getPacks):
- { id: "pack-options", title: "Options Trading Basics", description: "Calls, puts, and the handful of ideas that actually matter.", emoji: "▲", conceptIds: ["c1","c2","c3"], version: "1.0.0" }
- { id: "pack-anything", title: "A Little of Everything", description: "A gentle mix to find what you love learning.", emoji: "◇", conceptIds: ["c4","c5"], version: "1.0.0" }
- { id: "pack-kids-money", title: "Money & Business for Kids", description: "How money, saving, and small businesses work.", emoji: "○", conceptIds: ["c6","c7"], version: "1.0.0" }
Profiles (getProfiles), three existing local profiles:
- { id: "p-mara", displayName: "Mara", avatarSeed: "mara-07", readingLevel: "general", activePackIds: ["pack-anything"], streakDays: 12, lastCompletedDate: "2026-06-22", aiEnabled: false, createdAt: "2026-05-01T08:00:00" }
- { id: "p-dad", displayName: "Dad", avatarSeed: "dad-22", readingLevel: "expert", activePackIds: ["pack-options"], streakDays: 5, lastCompletedDate: "2026-06-23", aiEnabled: true, createdAt: "2026-04-15T07:30:00" }
- { id: "p-sage", displayName: "Sage (age 7)", avatarSeed: "sage-13", readingLevel: "child", activePackIds: ["pack-kids-money"], streakDays: 0, lastCompletedDate: null, aiEnabled: false, createdAt: "2026-06-20T17:45:00" }

COMPONENTS (pure, props-down; one stateful container)
One container, `FirstRunScreen`, is the ONLY stateful component: it calls `mockData`, owns the view-state (loading | returning | empty | error) and sheet open/closed, and passes plain data + callbacks down. Every other component is pure and receives data via props; none of them fetch data or import `mockData`.
1. AppHeader — wordmark + the "On this device. Nothing leaves it." caption. No props.
2. ProfileList(profiles, onPick) — vertical stack of ProfileRow items inside the focal card.
3. ProfileRow(profile, onPick) — one tappable row, the whole row is a single tap target: a deterministic Avatar, the displayName in Fraunces 460 (18–20px), and ONE quiet momentum line in Inter caption --ink-muted. 120ms press; on tap calls `onPick(profile.id)`. No badges, no stats grid, no streak fireballs.
4. Avatar(seed, letter, size) — a deterministic geometric disc: a soft solid fill chosen from a calm rotation of --calm / --grow / --care tints keyed off the seed, with the initial letter centered in Fraunces. NEVER an uploaded image, never a cartoon or mascot.
5. AddProfileRow(onAdd) — a final low-emphasis NEUTRAL row at the bottom of the list: a thin "+" line glyph and "Add someone" in --ink-muted. NOT the Ember accent — it must not compete with the one accent.
6. CreateProfileSheet(packs, onCreate, onDismiss) — the only elevated surface besides the card. See SHEET below.
7. PackPicker(packs, selectedId, onSelect) — exactly one pack selected at a time.
8. PackCard(pack, selected, onSelect) — emoji glyph, title in Fraunces, one-line description in --ink-muted. Selected = 1px --accent hairline + subtle --surface-sunken fill; unselected = neutral hairline.

MOMENTUM LINE — WORDS ONLY (pure helper `momentumLine(profile, today)`, today = "2026-06-23")
Translate the data into plain words; NEVER a raw number, interval, or queue count.
- streakDays >= 2 -> "{streakDays} days in a row"
- streakDays === 1 -> "Started yesterday"
- streakDays === 0 AND lastCompletedDate === null -> "Ready to begin"
- Append a soft " · done today" ONLY when lastCompletedDate === today.
So Mara reads "12 days in a row", Dad reads "5 days in a row · done today", Sage reads "Ready to begin". (The streak number inside a phrase is allowed; a bare number is not.)

SHEET (CreateProfileSheet)
A 20px-radius modal sheet that slides up 320ms with ease-out cubic-bezier(0.22,1,0.36,1), used for both first-run and "Add someone". Top to bottom:
- Soft title in Fraunces: "Who's learning?"
- A single text input "Your name" (placeholder "e.g. Mara") that LIVE-updates a preview Avatar beside it using the typed first letter.
- PackPicker: the three PackCard tiles, exactly one selected at a time.
- An OPTIONAL goal input labeled "What are you here for? (optional)" (placeholder "Get comfortable with options"). Never required, never blocks.
- The single primary pill button "Start learning" in Ember --accent — the one accent on the sheet. DISABLED (reduced opacity, not tappable) until the name has >=1 non-space character AND a pack is selected.
- Below the button, one caption in --ink-faint: "Lives only on this device."
No reading-level selector, no kid/pro toggle, no difficulty selector — tone comes only from pack content and the data's readingLevel, never a UI control.

STATES (implement all four, switchable so a reviewer can step through each)
- LOADING: on mount, the ProfileList area shows 3 calm skeleton rows (avatar disc + two hairline text bars in --surface-sunken). No spinner. Perfectly still except a 200ms cross-fade in. Honor prefers-reduced-motion with an instant fade.
- RETURNING (profiles exist) — DEFAULT: AppHeader + focal card titled "Who's learning today?" containing ProfileList (Mara, Dad, Sage) then AddProfileRow. NO competing primary button — picking a row IS the action. The only Ember accent in this state is held back and appears solely on "Start learning" inside the sheet once it opens.
- FIRST RUN (no profiles): the focal card shows the warm welcome — Fraunces title "Welcome." + the calm line "Let's set up who's learning." + ONE primary Ember pill button "Create your first profile" that opens the sheet. This single button is the lone accent. The only decoration allowed is one simple geometric line glyph — no illustration.
- ERROR (mock load fails via `_sim.failNext`): the card shows a quiet inline message in --care tone (NOT red-alarm): "Couldn't read this device's profiles." with one neutral secondary text button "Try again" that re-runs getProfiles. No modal, no scary icon, no technical detail.

INTERACTIONS (wire every one; navigation is a single seam)
The screen has exactly ONE exit: a callback `onPickProfile(profileId)` passed in from the parent router. The screen never imports the Today screen directly.
- Tap a ProfileRow -> 120ms press -> `onPickProfile(profile.id)` -> existing router renders that profile's Today screen.
- Tap AddProfileRow (returning) or "Create your first profile" (first run) -> CreateProfileSheet slides up.
- In the sheet: typing the name live-updates the preview Avatar's letter; selecting a PackCard moves the single selection; the optional goal never blocks. "Start learning" enables only when name has >=1 non-space char AND a pack is selected. Tapping it calls `createProfile({ displayName, activePackIds: [selectedPackId], readingLevel: "general", aiEnabled: false })`, plays a quiet 200ms checkmark draw on the button (no confetti, no sound), then calls `onPickProfile(newProfile.id)` into that profile's Today screen.
- Dismiss the sheet via a tap on the dimmed backdrop or a small top-corner close glyph -> 200ms fade back to the list; nothing is saved.
- "Try again" -> re-runs the loader back into LOADING then RETURNING.

GUARDRAILS (honor strictly)
- One screen, one question ("who's learning?").
- At most one Ember accent per state, only on the single primary action.
- No raw engine numbers anywhere — no FSRS intervals, no BKT / retrievability, no "cards remaining", no percentages. Momentum is words only.
- No machinery vocabulary ON SCREEN — never the words spaced repetition, FSRS, BKT, prerequisite, retrievability, calibration, or refutation.
- No login, account, sync, or cloud iconography; the only device language is "Nothing leaves it."
- AI stays invisible and OFF — no AI affordance on this screen at all; aiEnabled defaults false.
- Same components serve a child and an expert with zero mode switches.
- If something can be removed, remove it.

STYLE / MOTION (reuse the existing system; define nothing new)
- Fraunces for the wordmark, card titles, profile names, and sheet title; Inter for everything else, with tabular numerals in the momentum lines. 14px Inter 560 buttons.
- Card radius 14px; focal card + sheet radius 20px; primary buttons are pills. 1px hairline borders.
- The one soft shadow appears ONLY on the focal card and the sheet: `0 1px 2px rgba(20,30,45,.05), 0 8px 24px rgba(20,30,45,.06)`.
- Motion restrained and physical: 120ms press, 200ms content cross-fades, 320ms sheet enter, ease-out cubic-bezier(0.22,1,0.36,1), <=12px translate + gentle fade, one thing moves at a time, idle perfectly still.
- Fully honor prefers-reduced-motion with instant cross-fades.
- Ship both light and dark using ONLY the existing variables.

ARCHITECTURE (modular, swappable — state it plainly)
- Clean component boundaries: FirstRunScreen (stateful container) + pure children AppHeader, ProfileList, ProfileRow, Avatar, AddProfileRow, CreateProfileSheet, PackPicker, PackCard.
- ALL data and ALL loading / error / latency simulation live behind the single existing `mockData.ts` module exposing the typed `getProfiles` / `getPacks` / `createProfile` async interface. Pure helpers `momentumLine(profile, today)` and `avatarTint(seed)` translate data to display and are unit-testable in isolation.
- Components receive data via props and never call `mockData` themselves; only FirstRunScreen does. A real TypeScript engine drops in later by re-implementing those three functions with the same contract shapes — no component, helper, or style touched.
- Reuse the existing Today screen and its navigation as the destination after a profile is chosen or created, reached only through the `onPickProfile(profileId)` seam.
```

_Clean seams this screen preserves (so the engine wires in later):_

- mockData.ts is the single swappable data module: it exposes getProfiles(): Promise<Profile[]>, getPacks(): Promise<Pack[]>, and createProfile(input: CreateProfileInput): Promise<Profile>, plus an internal _sim config object ({ latencyMs, failNext }) that ONLY this module reads. All latency and error simulation lives here. A real TypeScript engine replaces this file by exporting the same three async functions returning the same Profile/Pack shapes from the data contract — no UI file imports anything else from it, so the swap touches zero components.
- Type shapes are imported from the existing contract, never redefined. Profile and Pack come from the contract as-is. The only new local type is CreateProfileInput = Pick<Profile,'displayName'|'activePackIds'|'readingLevel'|'aiEnabled'> (or a narrower input type); createProfile fills id, avatarSeed (derived from displayName), streakDays:0, lastCompletedDate:null, and createdAt server-side/in-module so the UI never invents engine fields.
- Navigation seam: a single onPickProfile(profileId: ID) callback is the ONLY exit from this screen. The screen never imports the Today screen directly; the parent router passes onPickProfile down. Both 'tap a ProfileRow' and 'finish CreateProfileSheet' call this same callback with the chosen/created profile id, then the existing router renders that profile's Today screen. This is the entry point wired ahead of the existing Today route.
- Component data flow is props-down only. FirstRunScreen (the one stateful container) calls mockData, owns view-state (loading | returning | empty | error) and sheet open/closed, and passes plain data + callbacks to pure children: AppHeader (no props), ProfileList(profiles, onPick), ProfileRow(profile, onPick), Avatar(seed, letter, size), AddProfileRow(onAdd), CreateProfileSheet(packs, onCreate, onDismiss), PackPicker(packs, selectedId, onSelect), PackCard(pack, selected, onSelect). No child fetches data or knows about mockData; the engine swap and any future router change stay isolated to the container.
- Momentum-line + avatar logic are pure helpers (e.g. momentumLine(profile, today): string and avatarTint(seed): cssVar) that take contract data and return display strings/tokens. They render words only (streak phrases, 'Ready to begin', soft '· done today'), never raw streakDays/intervals/counts, so engine internals stay off-screen and the helpers are unit-testable in isolation.
- Theming + motion read only the existing CSS variables and shared components (button/card/sheet, type scale, timings). The screen defines no new tokens, fonts, or colors; light/dark and prefers-reduced-motion are inherited from the established system, so a system-wide token change propagates without editing this screen.

## Prompt 3 — Session player

```text
Extend the existing LearningOS Claude Design project. REUSE the design system already defined in this project and do not redefine it: the same CSS color variables (light + dark), the Fraunces/Inter type scale, the 4px/8px spacing rhythm, the single-centered-column (max-width 560px) daily-loop layout, the restrained ease-out motion, the iconography (1.5px geometric line glyphs), the single mock-data module (mockData.ts), and the established Today -> session -> reflection -> Done navigation. Do NOT touch fonts, colors, tokens, or routing. Build ONE new screen: the Session player — the core learning loop, one card at a time, full focus.

NON-NEGOTIABLE RULES (apply to every state and every card; if a choice conflicts with these, these win)
1. ONE focal object on screen at a time. One elevated card (the project's single soft shadow, 20px radius); everything else flat.
2. ONE primary action visible at a time, and the Ember --accent appears at most ONCE per screen — on that single action only. Two accent elements at once is a bug.
3. NO numbers a learner could read as a dashboard. No "12 of 18", no "cards remaining", no percentages, no scores, no live ticking timer, no streak counters on this screen. Progress is positional and wordy only.
4. NEVER expose the engine. The words FSRS, BKT, spaced repetition, prerequisite graph, retrievability, calibration, and refutation NEVER appear in the UI. No scheduling field, BKT/FSRS value, retrievability, queue count, or responseMs ever reaches the DOM.
5. A 7-year-old must be able to navigate it: one thing to read, one thing to do, plain warm words, generous whitespace.

GOAL OF THIS SCREEN
The learner taps "Start today's session" on Today and lands here. The player walks them through the finite, ordered path the engine chose (Session.itemIds), ONE card at a time, in about 10-20 minutes, then hands off to the existing reflection step via onSessionComplete(). It weaves two flavors with zero mode switch: LEARN cards (study a worked example or clear explanation -> an optional soft "why" self-explanation -> a first retrieval question) and REVIEW cards (prompt -> recall -> reveal -> rate honestly -> immediate kind feedback). The same components must serve a child and an expert with no UI change — tone comes only from content.

LAYOUT & CHROME (reuse the system)
- Single centered column, max-width 560px. Generous empty space (at least 64px around the focal card on desktop). One elevated focal card; everything else flat.
- A quiet session header in one calm row above the card:
  - Left: a "Leave" affordance — a 1.5px line back-chevron + the word "Leave" in Caption/--ink-muted (no color). Opens the Leave sheet.
  - Center: ProgressSegments — a row of small quiet segments, one per item in Session.itemIds. Done = filled --ink-faint; current = a slightly taller filled --calm segment; upcoming = hairline outline. NO numbers, NO counts, NO labels. It silently says "the end is near." Fill animates ~400ms ease-out when advancing. Beneath it, ONE soft promise line in Caption derived from estMinutes and position — words only, e.g. "About 12 minutes left". Never a live timer.
  - Right: empty. Nothing competes.

CARD RENDERER (switch on Item.type; one sub-component per type, one shared shell)
Shared CardShell: an optional tiny eyebrow in Caption/--ink-muted naming the concept in plain words (Concept.title, e.g. "What a call option is"), and a 3-state mastery chip mapping Concept.mastery to WORDS ONLY — "New" (--ink-faint dot), "Getting it" (--calm dot), "Solid" (--grow dot). Never a percentage. Title in Fraunces Title. Body in Inter Body, measure <=62ch.

1) concept-explanation (LEARN, ungraded): Title from Item.prompt, teaching text from Item.body. One primary continue button "Got it - next" (the one accent element). No grading.
2) worked-example (LEARN, study): Item.prompt as headline; Item.body split on line breaks into numbered quiet steps in --surface-sunken blocks. Below, a soft self-explanation prompt in --ink-muted: "In a sentence, why does this work?" with one optional one-line input (placeholder "Type a few words... (optional)"). Never required, never graded, never blocks. Primary button "Makes sense - next" (accent).
3) fact (REVIEW recall): Item.prompt as the question. One RevealButton "Show answer" (accent, pill). On tap, a quiet 200ms fade reveals Item.answer in a --surface-sunken block; the RevealButton is replaced by GradeBar + ConfidenceTap (accent now lives only on the pressed grade).
4) cloze (REVIEW fill-in-the-blank): Render Item.prompt with Item.clozeMask spans as soft underlined gaps. "Show answer" reveals the filled sentence (masked spans now in --ink, emphasized). Then GradeBar + ConfidenceTap.
5) application (REVIEW apply): Item.prompt is a short scenario (Item.body for detail). If Item.choices exist, show up to 4 quiet selectable option chips (8px radius, hairline, --surface); selecting one reveals correctness. If no choices, behaves like recall ("Show answer" reveals Item.answer). After reveal, one kind one-liner ("That's right - nicely reasoned." for correct / "Close - here's the key bit:" + the answer for missed), then GradeBar + ConfidenceTap.
6) refutation (REVIEW misconception correction): Lead with Item.misconception, framed gently as "A lot of people think:" in --care, in a --surface-sunken block. "Show answer" reveals Item.correction in --grow-tinted emphasis with a plain lead-in ("Here's the truer picture:"). Then GradeBar + ConfidenceTap. The word "refutation" NEVER appears.

GRADEBAR (the only grading control; human words, never numbers)
One fixed row of exactly four chips, left-to-right hard-to-easy: "Missed it" / "Tough" / "Got it" / "Easy". Inter Label, 8px radius, hairline, --surface. Press state uses --accent briefly (120ms) then settles. No sliders, no 0-3, no jargon. Tapping a grade is what advances; it emits a Review with grade in {"missed","tough","got-it","easy"}.

CONFIDENCETAP (light, optional, never required)
A quiet one-line tap above or beside the GradeBar: three tiny pills "Guessed / Unsure / Sure" in --ink-muted, prefaced by faint Caption "How sure were you?". Tapping one selects it (subtle --calm outline); leaving it untapped is fine (confidence is null). Never text, never blocks advancing. Maps to Confidence in {"guessed","unsure","sure"}.

INTERACTIONS & FLOW
- When a card is shown, start an invisible timer; the time-to-grade fills Review.responseMs (captured, NEVER shown).
- LEARN cards advance on the single continue button. REVIEW cards advance when a grade is tapped (confidence captured if tapped first).
- Advancing: the finished card does a gentle <=12px translate + fade out; the next fades in (200ms content / 320ms feel); ProgressSegments ease forward ~400ms; the "About N minutes left" line updates in words. ONE thing moves at a time. Idle is perfectly still.
- For missed/tough on a REVIEW card, show the kind corrective feedback inline before the next card (one warm line + the answer already visible). No red X, no score, never punishing.
- Completing the LAST item draws the project's quiet 200ms checkmark on the finished card, soft-fades it, and routes to the existing reflection step via onSessionComplete() — do not rebuild reflection or Done. No confetti, no sound.
- Fully honor prefers-reduced-motion: replace all translate/fade with instant cross-fades and instant segment fill.

LEAVE SHEET (the only secondary surface; gentle, not a trap)
Tapping "Leave" opens a modal sheet (20px radius, the project's modal shadow) with one calm line "Leave for now? Your progress is saved." and two buttons: a neutral "Keep going" (ghost) and a quiet "Leave" (text button, no accent). No guilt, no streak-loss threat. "Leave" returns to Today; "Keep going" dismisses.

STATES (build all four, togglable in the prototype, defaulting to SUCCESS at currentIndex 2)
- LOADING: the card shell as a calm skeleton — hairline-outlined title and 3 body lines as --surface-sunken blocks with a 200ms fade-in (no shimmer). ProgressSegments render as faint outlines. No spinner.
- EMPTY (no items, rare edge case): one centered Fraunces Title "Nothing due right now." + Caption "You're caught up - come back tomorrow." + one ghost button "Back to Today".
- ERROR (a card failed to load): the card shell shows "Couldn't load this card." in --care + one "Try again" ghost button that retries; the rest of the session is untouched and the user can continue.
- SUCCESS (default, in-progress): the live one-card-at-a-time flow. Provide a visible-in-prototype way to step through every Item.type so a reviewer can click the whole arc: concept-explanation -> worked-example -> fact -> cloze -> application -> refutation -> handoff.

MOCK DATA (single mockData.ts, typed strictly to the LearningOS data contract; reuse/extend the existing module, do not fork it)
All data lives in mockData.ts and flows to components via props only. No component fetches or hardcodes data. To swap in a real engine later, replace this module with one exporting the SAME shapes — no component or layout change. Build one realistic in-progress session mixing all six item types across two packs/audiences.

Session:
{ id: "sess_2026_06_23_mara", profileId: "p_mara", date: "2026-06-23", state: "in-progress", currentIndex: 2, estMinutes: 15,
  itemIds: ["it_call_def","it_call_we","it_call_fact","it_premium_cloze","it_breakeven_app","it_call_refute"] }

Concepts (mastery is the ONLY surfaced signal):
- { id:"c_call_option", packId:"pk_options", title:"What a call option is", prerequisiteIds:[], itemIds:["it_call_def","it_call_we","it_call_fact"], mastery:"getting-it" }
- { id:"c_premium", packId:"pk_options", title:"What the premium is", prerequisiteIds:["c_call_option"], itemIds:["it_premium_cloze"], mastery:"new" }
- { id:"c_breakeven", packId:"pk_options", title:"Finding the break-even price", prerequisiteIds:["c_call_option","c_premium"], itemIds:["it_breakeven_app"], mastery:"new" }
- { id:"c_call_myth", packId:"pk_options", title:"Owning a call vs owning the stock", prerequisiteIds:["c_call_option"], itemIds:["it_call_refute"], mastery:"getting-it" }

Items (scheduling is present in data but NEVER rendered):
- { id:"it_call_def", conceptId:"c_call_option", type:"concept-explanation", prompt:"A call option, in one breath", body:"A call option is the right - not the obligation - to BUY something at a set price before a set date. You pay a small amount up front for that right. If the price climbs, your right becomes worth more. If it doesn't, the most you lose is what you paid.", scheduling:{ due:"2026-06-23", learningState:"new", reps:0, lapses:0 } }
- { id:"it_call_we", conceptId:"c_call_option", type:"worked-example", prompt:"Walking through one call, step by step", body:"A stock trades at $100.\nYou buy a call with a $105 strike for $2.\nThe stock rises to $112 before expiry.\nYou can buy at $105 and it's worth $112 - that's $7 of value.\nSubtract the $2 you paid: $5 net per share.", answer:"$5 net per share", scheduling:{ due:"2026-06-23", learningState:"learning", reps:1, lapses:0 } }
- { id:"it_call_fact", conceptId:"c_call_option", type:"fact", prompt:"What's the MOST a call buyer can lose?", answer:"Only the premium they paid up front.", scheduling:{ due:"2026-06-23", stability:3.2, difficulty:5.1, reps:2, lapses:0, learningState:"review" } }
- { id:"it_premium_cloze", conceptId:"c_premium", type:"cloze", prompt:"The price you pay up front for an option is called the ____, and it's the maximum a buyer can ____.", clozeMask:["premium","lose"], answer:"The price you pay up front for an option is called the premium, and it's the maximum a buyer can lose.", scheduling:{ due:"2026-06-23", learningState:"learning", reps:1, lapses:0 } }
- { id:"it_breakeven_app", conceptId:"c_breakeven", type:"application", prompt:"You buy a $105-strike call for $2. At what stock price do you break even at expiry?", body:"Think: you only start making money once the stock covers BOTH the strike you buy at and the premium you paid.", choices:["$103","$105","$107","$112"], answer:"$107 - the $105 strike plus the $2 premium.", scheduling:{ due:"2026-06-23", learningState:"new", reps:0, lapses:0 } }
- { id:"it_call_refute", conceptId:"c_call_myth", type:"refutation", prompt:"Owning a call vs owning the stock", misconception:"Buying a call is basically the same as owning the stock - you just pay less.", correction:"Not quite. A call is a time-limited right that can expire worthless, while a share is yours indefinitely. You trade smaller cost for a deadline and the risk of losing the whole premium.", scheduling:{ due:"2026-06-23", stability:1.8, difficulty:6.0, reps:1, lapses:1, learningState:"relearning" } }

Include ONE alternate child-audience item in the mock array (NOT in this session's path, present only to prove tone comes from content, not UI):
- { id:"it_kid_save", conceptId:"c_saving", type:"concept-explanation", prompt:"Why a piggy bank grows", body:"When you keep money instead of spending it, you can buy bigger things later. Saving a little each week adds up - that's how a small jar becomes a big one." }

Reviews start as an empty array []. Each graded card appends a Review { id, sessionId:"sess_2026_06_23_mara", itemId, grade, confidence, responseMs, reviewedAt }.

COMPONENT BOUNDARIES (so a real TS engine swaps the mock cleanly; keep everything modular, data via props)
- <SessionPlayer session profile onAdvance onGrade onSessionComplete /> owns position + the card state machine. NO scheduling logic.
- <ProgressSegments total currentIndex /> — pure, position only.
- <CardRenderer item concept onReveal onContinue onGrade onConfidence /> switches on item.type and renders the matching sub-card (ConceptExplanationCard, WorkedExampleCard, FactCard, ClozeCard, ApplicationCard, RefutationCard), all sharing one CardShell.
- <RevealButton onReveal />, <GradeBar onGrade />, <ConfidenceTap value onChange />, <LeaveSheet open onKeepGoing onLeave />.
- ALL data flows from mockData.ts via props. No component fetches or hardcodes content. No engine numbers (scheduling.*, any BKT/FSRS value, retrievability, queue counts, responseMs) ever reach the DOM. The words FSRS, BKT, spaced repetition, prerequisite graph, retrievability, calibration, and refutation do NOT appear anywhere in the UI.

COPY GUARDRAILS
Plain, short, warm, dignified for both a child and an expert. Never baby-talk, never jargon. Grading is exactly "Missed it / Tough / Got it / Easy". Confidence is exactly "Guessed / Unsure / Sure". Continue buttons read human ("Got it - next", "Makes sense - next", "Show answer"). Progress reads in words ("About 12 minutes left"), never a count. One primary accent action per screen, always.

Deliver this as a clickable prototype I can step through end to end, with the four states (loading / empty / error / success) togglable, defaulting to the in-progress success flow at currentIndex 2, with a visible way to click the full arc concept-explanation -> worked-example -> fact -> cloze -> application -> refutation -> handoff.
```

_Clean seams this screen preserves (so the engine wires in later):_

- <SessionPlayer session={Session} profile={Profile} onAdvance={(index:number)=>void} onGrade={(review:Review)=>void} onSessionComplete={()=>void} /> — owns position + the card state machine ONLY. No scheduling, no FSRS/BKT math, no Review.responseMs computation logic beyond capturing wall-clock ms. It reads Session.itemIds + Session.currentIndex and walks the path; the real engine supplies a Session with the same shape and the player behaves identically.
- <ProgressSegments total={number} currentIndex={number} /> — pure presentational, position-only. Receives counts, never the item array, never any scheduling field. Renders done/current/upcoming segments. Swappable with zero changes when the engine produces a longer or shorter itemIds path.
- <CardRenderer item={Item} concept={Concept} onReveal={()=>void} onContinue={()=>void} onGrade={(g:Grade)=>void} onConfidence={(c:Confidence|null)=>void} /> — switches on item.type and delegates to one of six sub-cards (ConceptExplanationCard, WorkedExampleCard, FactCard, ClozeCard, ApplicationCard, RefutationCard), all wrapping a shared <CardShell eyebrow concept title>{children}</CardShell>. Every sub-card reads ONLY from the typed Item/Concept props it is handed — it must work unchanged whether the data came from the mock or the engine.
- <RevealButton onReveal /> · <GradeBar onGrade={(g:Grade)=>void} /> · <ConfidenceTap value={Confidence|null} onChange={(c:Confidence|null)=>void} /> · <LeaveSheet open onKeepGoing onLeave /> — small leaf components, all stateless-by-props, no data fetching, no engine awareness.
- mockData.ts is the SINGLE source of all data, typed strictly to the LearningOS data contract (Profile, Pack, Concept, Item, Session, Review, Grade, Confidence). It exports the in-progress Session (sess_2026_06_23_mara at currentIndex 2), the Concept[] and Item[] arrays, the Profile, and an empty reviews array. Nothing in the component tree imports anything other than typed shapes from this one module. To plug in a real engine: replace mockData.ts with a module exporting the SAME shapes from the FSRS-6 + BKT engine — no component, prop, or layout change required.
- Data-flow firewall: scheduling.* (due, stability, difficulty, reps, lapses, learningState), any BKT probability, retrievability, queue counts, and Review.responseMs NEVER reach the DOM. responseMs is captured into the emitted Review object and passed up via onGrade only. A reviewer reading the DOM must find zero engine numbers.
- onGrade(review) emits a fully-formed Review { id, sessionId, itemId, grade, confidence, responseMs, reviewedAt } appended to the reviews array — the exact contract a real engine consumes to reschedule. onSessionComplete() is the handoff boundary to the existing reflection step; the player neither renders nor rebuilds reflection or Done.

## Prompt 4 — Brain dump / end-of-session reflection

```text
Extend the EXISTING LearningOS Claude Design project. Reuse the already-established design system: the tokens, the Fraunces + Inter type pairing, the full color variable set (light + dark), the motion rules, the navigation/router seam, and the shared components already built — PrimaryButton, Card, the quiet progress/segment bar, and the 3-state Concept mastery pill. Do NOT redefine the design system, theme, type scale, or global layout. Do NOT add a new entry to the nav: this "Brain dump" reflection is the quiet step that sits BETWEEN the in-session card flow and the "Done for today" rest state, on the same route the session already lives on. Pull ALL data from the single existing mock-data module (mockData.ts) and its existing typed shapes (Profile, Pack, Concept, Item, Session, Reflection). Invent NO new data shapes and add NO new fields.

==================================================
BUILD THIS SCREEN: "Brain dump" — the end-of-session free-recall reflection.
==================================================

PURPOSE — one job, one question. The session is finished. Before the app rests, it asks the learner ONE calm question — "What do you remember?" — captures a free-recall brain dump, then shows a short warm recap of what was covered and one thing worth revisiting. Nothing is graded. Nothing is required. The reward is momentum, not metrics.

--------------------------------------------------
THE THREE LAWS (read these first; if any instruction below ever conflicts with these, these win)
--------------------------------------------------
LAW 1 — ONE FOCAL OBJECT, ONE ACCENT, ONE PRIMARY ACTION PER STATE. Each of the two states has exactly one focal card, exactly one primary button, and the Ember accent (--accent) appears AT MOST ONCE on that single button. If you are ever about to add a second primary button, a second accent, a toolbar, a second card competing for focus, or "one more useful thing" — STOP. It does not belong on this screen.
LAW 2 — NO DASHBOARD OF NUMBERS. The ONLY numeral allowed to render anywhere on this screen is the single streak integer inside the momentum sentence (set in Inter tabular numerals). NO percentages, NO counts of items/cards/concepts, NO queue sizes, NO intervals, NO due dates, NO timers, NO progress "X of Y", NO character counter. If a number is not the streak day-count woven into a warm sentence, it must not appear.
LAW 3 — A 7-YEAR-OLD MUST UNDERSTAND EVERY WORD; AN EXPERT MUST NOT FEEL TALKED DOWN TO. Plain, short, warm. Never name or imply the machinery. These words and their kin are BANNED from all rendered copy, placeholders, labels, and tooltips: spaced repetition, FSRS, BKT, retrievability, stability, difficulty, calibration, refutation, queue, due, interval, algorithm, scheduling, review-count, probability, mastery-score. Translate everything into human words, the 3-state pill signal, and one warm momentum line.

--------------------------------------------------
LAYOUT — reuse the daily-loop frame
--------------------------------------------------
Single centered column, max-width 560px. ≥64px breathing room around the focal element on desktop. Lots of deliberate empty space. Flat by default — elevation appears ONLY on the one focal card. One focal object on screen at a time. Everything that is not the focal card or the one primary button is neutral ink on frost. Ship light + dark; verify both.

This screen is ONE route with TWO sequential states, joined by a single 200ms content cross-fade. Honor prefers-reduced-motion with an instant (0ms) cross-fade. Only one thing moves at a time; idle is perfectly still.

--------------------------------------------------
STATE A — "Brain dump" (the input)
--------------------------------------------------
- Eyebrow: quiet caption in --ink-muted (Inter Caption 13): "Last step".
- Headline: Fraunces Title (24 / line-height 1.25 / weight 460): "What do you remember?"
- One Body line (Inter 16 / lh 1.55 / --ink-muted / measure ≤62ch): "Jot down anything that stuck. No pressure, nothing's graded."
- THE FOCAL OBJECT: a single large, borderless-feeling free-recall textarea. Full column width; min-height ~200px; generous padding 24–28px; radius 20px; the one soft focal shadow (0 1px 2px rgba(20,30,45,.05), 0 8px 24px rgba(20,30,45,.06)); --surface background; 1px --hairline border that warms to --calm on focus. Placeholder in --ink-faint: "A call option is the right to buy at a set price... and time decay hurts the buyer." Autofocus on enter. NO character counter, NO toolbar, NO formatting controls, NO AI buttons, NO send icon inside the field.
- THE ONE PRIMARY ACTION: the shared PrimaryButton (pill, --accent, Inter Label 14 / 560) reading "Save & finish". This is the ONLY accent and ONLY primary CTA in State A. It is enabled by default.
- EXACTLY ONE secondary, low-emphasis affordance: a plain ghost text link in --ink-muted reading "Skip for now" placed below/beside the primary. One tap, never gated, always allowed, never penalized — advances straight to State B.
- WRITE BEHAVIOR (single seam): pressing "Save & finish" calls onReflectionSaved(reflection) where reflection is a Reflection { id, sessionId, text, skipped, durationMs, createdAt }. If the textarea has non-whitespace text → skipped:false. If it is empty/whitespace → treat it as a soft skip: skipped:true, text:"". "Skip for now" always writes skipped:true, text:"". The parent owns persistence; this screen persists nothing.
- AI HINT (off by default, inert): tucked at the very bottom in Caption 13 / --ink-faint, shown ONLY when profile.aiEnabled === false (it is false in mock): "Want this checked for gaps later? Add your own AI key in Settings — it's off until you do." Render as plain inert text, NO button, NO accent. Never imply anything leaves the device. If profile.aiEnabled were true, this slot would instead render an optional, off-by-default "Go deeper" ghost toggle — but the component reads profile.aiEnabled and in mock it stays the off hint. Drive this off the prop; do not hardcode the branch away.

--------------------------------------------------
STATE B — "Recap & rest" (the gentle close — this IS the Done-for-today rest state)
--------------------------------------------------
The focal card cross-fades in (200ms; instant under reduced-motion).
- Eyebrow caption (--ink-muted): "Today, done".
- Headline: Fraunces Title, read verbatim from session.summary.headline (mock: "You moved 3 ideas closer to solid."). Never compute or rewrite it on screen.
- ONE momentum line, Body / --ink-muted, that translates session.summary.newStreakDays into warm words — NO fireball, NO badge, NO trophy: "That's 6 days in a row. Nice momentum." The streak integer is the ONLY numeral on the whole screen; render it in Inter tabular numerals. Never show queue counts, intervals, or percentages.
- "What you covered": a small, quiet cluster (NOT a dashboard, NOT a table, NOT a grid of stats) of up to 4 concept chips derived ONLY from the session's items' Concepts. Each chip is Concept.title plus the existing 3-state mastery pill mapped from Concept.mastery: "new" → "New" / --ink-faint, "getting-it" → "Getting it" / --calm, "solid" → "Solid" / --grow. Chips are flat: radius 8px, 1px --hairline, NO accent, NO shadow. Example chips: "What a call option is — Solid", "Strike price — Getting it", "Time decay — Getting it", "Intrinsic vs. extrinsic value — New".
- "Worth revisiting": ONE short warm line (one concept, at most two), in --ink with a small --care dot — a gentle nudge, NOT a warning, NOT an error: "We'll circle back to time decay tomorrow — it's almost there." Derive it from the lowest-mastery concept(s) in the session (the "getting-it"/"new" ones); surface ONE, at most two, as a single human sentence. No "fix this", no error tone, no count.
- IF the learner wrote a brain dump in State A (skipped:false), show a single soft collapsed line: "Your note is saved." in Caption / --ink-muted. Do NOT re-display their text and do NOT critique it. If they skipped, OMIT this line entirely.
- THE ONE PRIMARY ACTION: the shared PrimaryButton (pill, --accent) reading "Close for today". Pressing it calls onContinue() (the existing router seam) to route to the calm idle/home rest state (or back to the profile picker). This is the ONLY accent and ONLY CTA in State B.
- ABSENT BY DESIGN: NO "do more", NO "add cards", NO "practice again", NO "start another session", NO "see all progress", NO infinite content. When this screen says done, the app gently stops.

--------------------------------------------------
CLICKABLE STATES — wire real transitions, no dead ends (this is a prototype)
--------------------------------------------------
- LOADING (default): if the completed session isn't resolved yet, show a still, centered skeleton of the focal card (no spinner, no shimmer theatrics) for ~300ms, then State A. Idle is perfectly still.
- TYPED / SUCCESS path: type → press "Save & finish" → quiet 200ms checkmark draw on the card + soft fade of the input → cross-fade to State B with the "Your note is saved." line present.
- SKIP path: "Skip for now" (or "Save & finish" on an empty field) → immediate cross-fade to State B (skipped:true) → State B is identical except the "Your note is saved." line is omitted.
- EMPTY-RECAP edge: if no concepts resolve from the session, State B still renders the headline + momentum line + "Close for today". Degrade gracefully to just the warm close — never a broken or empty "What you covered" block; hide the cluster entirely if there's nothing in it.
- ERROR edge: if onReflectionSaved throws (mock simulates via a flag), STAY in State A, keep the typed text fully intact, and show ONE quiet inline line in --care directly under the button: "Couldn't save that just now — your note's still here. Try again?" The primary button text becomes "Try again". No modal, no toast, no second error surface. Never lose typed text.
- COMPLETION reward: ONLY the quiet 200ms checkmark draw + soft card fade. NO confetti, NO sound, NO streak fireball, NO badge, NO score reveal.

--------------------------------------------------
COPY / TONE
--------------------------------------------------
Plain, short, warm, encouraging. Never baby-talk, never jargon. Apply the dual-reader test to EVERY string you render: would a 7-year-old understand it, and would an expert feel respected? Tone comes ONLY from pack content and the per-profile readingLevel field — NEVER a UI mode toggle, NEVER a different layout. The same components must read just as comfortably for "Sage (age 7)" and for an expert profile. Obey LAW 3's banned-word list everywhere, including placeholders and any future copy.

--------------------------------------------------
VISUAL STYLE — "a small packet of ice"
--------------------------------------------------
Minimal, calm, warm, elegant, uncluttered, dignified. Single centered 560px column, one focal object, ≥64px breathing room, flat except the one focal card shadow. Fraunces for the headline only; Inter for everything else (tabular numerals for the streak integer). Ember accent exactly once per state, on the single primary button. Color carries meaning ONLY: --ink-faint / --calm / --grow for the New / Getting it / Solid pills, --care for the gentle "worth revisiting" dot and the error line, neutral ink on frost everywhere else. Motion: 120ms press, 200ms content cross-fade, 320ms enter, ease-out cubic-bezier(0.22,1,0.36,1), ≤12px translate + gentle fade, one thing moves at a time, full prefers-reduced-motion support (instant cross-fades), idle perfectly still. Ship light + dark.

--------------------------------------------------
ARCHITECTURE — modular, props-only, one swappable data module
--------------------------------------------------
Clean component boundaries so a real TypeScript engine replaces the mock layer later with ZERO UI changes:
- ReflectionScreen (container): owns the A→B state machine and the loading/error states; resolves the session from mockData; passes data DOWN as props; owns the onReflectionSaved / onContinue seams. It is the ONLY component that touches mockData.
- BrainDumpInput (State A): a pure presentational component. Receives { profile, sessionId, onSave, saveError } via props. Holds only local textarea/draft state. Reads profile.aiEnabled to decide hint vs. toggle. Renders NO literals it could receive as props.
- SessionRecap (State B): a pure presentational component. Receives { summary, concepts, hadNote, onContinue } via props. Renders the headline, momentum line, chips, the one "worth revisiting" line, and the optional saved-note line. Owns no data fetching.
HARD RULE: every concrete value — profile name, streak count, headline string, concept titles, mastery values, the simulate-error flag, the completed Session — lives in mockData.ts ONLY. Components receive data via props and NEVER import or hardcode domain literals. No component reads engine internals (no FSRS / BKT / due dates / stability / retrievability — none of those words appear in code OR UI). Swapping the mock module for a real engine that emits the SAME typed shapes must require no change to BrainDumpInput or SessionRecap.

--------------------------------------------------
MOCK DATA — code against the existing typed shapes; add a realistic completed session if absent
--------------------------------------------------
- Active profile (existing): e.g. { displayName:"Dad", readingLevel:"general", streakDays:5, aiEnabled:false }. Keep it so the same components also read comfortably for the child profile "Sage (age 7)" and an expert profile.
- Completed session (add if not present), matching the Session shape exactly:
  { id, profileId, date:"2026-06-23", state:"complete", itemIds:[...], currentIndex:8, estMinutes:14, reflection: undefined, summary:{ itemsDone:8, headline:"You moved 3 ideas closer to solid.", newStreakDays:6 } }
  from the "Options Trading Basics" pack.
- Recap chips read from these existing Concepts (note the exact union spellings from the contract): { title:"What a call option is", mastery:"solid" }, { title:"Strike price", mastery:"getting-it" }, { title:"Time decay", mastery:"getting-it" }, { title:"Intrinsic vs. extrinsic value", mastery:"new" }. "Worth revisiting" = the lowest-mastery one(s) ("getting-it"/"new"), surfaced as ONE warm sentence.
- The Reflection write target is session.reflection. The screen exposes only onReflectionSaved(reflection) and onContinue(); a real engine/parent owns persistence and routing. Include a mock-only simulateSaveError flag so the ERROR edge is clickable.
- Use ONLY the contract's enum spellings: mastery ∈ "new" | "getting-it" | "solid"; Reflection.skipped is a boolean; state:"complete". Do not invent variants.
```

_Clean seams this screen preserves (so the engine wires in later):_

- onReflectionSaved(reflection: Reflection): void — single write seam; parent/engine owns persistence. Called by BrainDumpInput via the container. Reflection = { id, sessionId, text, skipped, durationMs, createdAt }; skipped:false only when textarea has non-whitespace text, otherwise skipped:true with text:"". Writes to session.reflection. May throw to drive the ERROR edge.
- onContinue(): void — single routing seam; reuses the existing nav/router to leave for the calm idle/home rest state (or profile picker). Called only by the State B 'Close for today' primary button. Adds no new nav entry.
- mockData.ts — the single swappable data module. Sole source of every domain literal (active Profile incl. readingLevel + aiEnabled + streakDays, the completed Session with summary{ itemsDone, headline, newStreakDays }, the session's Concepts with mastery values, and a mock-only simulateSaveError flag). A real TypeScript engine replaces this module by emitting the SAME contract shapes (Profile, Pack, Concept, Item, Session, Reflection) with ZERO changes to BrainDumpInput or SessionRecap.
- ReflectionScreen container props/seams — resolves the completed Session from mockData, owns the A→B state machine + loading(~300ms skeleton)/error states, and passes data down as props. The ONLY component that imports mockData.
- BrainDumpInput props — { profile, sessionId, onSave, saveError }. Pure/presentational; local textarea draft state only; reads profile.aiEnabled to choose the inert off-hint (false in mock) vs. the off-by-default 'Go deeper' ghost toggle.
- SessionRecap props — { summary, concepts, hadNote, onContinue }. Pure/presentational; renders headline (verbatim from summary.headline), momentum line (from summary.newStreakDays, tabular numerals), up to 4 mastery chips (from concepts), ONE 'worth revisiting' line (lowest-mastery concept[s]), and the optional 'Your note is saved.' line when hadNote is true.
- Shared design-system components reused (not redefined): PrimaryButton (pill, --accent — the one accent per state), Card (focal elevation), the quiet progress/segment bar, and the 3-state Concept mastery pill mapped new→--ink-faint / getting-it→--calm / solid→--grow.
- Token/CSS-variable contract: --accent (one button per state), --surface/--hairline (focal textarea, warms to --calm on focus), --ink/--ink-muted/--ink-faint (neutral text), --calm/--grow/--ink-faint (mastery pills), --care (worth-revisiting dot + error line). Light + dark both shipped.

## Prompt 5 — How you're doing (Progress map + calibration)

```text
FOLLOW-UP PROMPT — extends the existing LearningOS Claude Design project. REUSE everything already established and do NOT redefine it: the design system, fonts (Fraunces titles / Inter body), the CSS-variable color tokens (--bg, --surface, --surface-sunken, --hairline, --ink, --ink-muted, --ink-faint, --accent, --accent-pressed, --calm, --grow, --care), the spacing scale, radii, motion rules, the soft focal shadow, light + dark themes, prefers-reduced-motion handling, and the app shell / router. If a token, mixin, or shell primitive already exists, import it — never re-declare a color, shadow, or font. Build ONE new screen as a clickable prototype with mock data.

GOAL
A calm, encouraging "How you're doing" screen that lives ONLY in the tucked-away profile area and is NEVER routed to from the Today daily loop. It informs and reassures; it offers NO learning action. Two stacked sections in a single centered column (max-width 560px, ≥64px breathing room around the content, body measure ≤62ch): (1) a friendly picture of the knowledge built so far and what is opening up next, and (2) a gentle "how sure you felt vs. how it actually went" view. Visual and warm — never a wall of numbers, never a dashboard.

THE ONE RULE THAT OUTRANKS EVERYTHING: this screen cannot be allowed to become cluttered. If a choice adds density, drop it. A seven-year-old must be able to glance at this and walk away with two feelings — "the filled dots are mine" and "the line went up" — without reading a single number. An expert must not feel talked down to. When in doubt, remove.

GUARDRAILS (honor strictly — these are hard constraints, not preferences)
- NO raw engine numbers anywhere: no intervals, probabilities, ease, stability, difficulty, retrievability, due dates, reps, lapses, queue counts, response times, or percentages. Mastery is ONLY ever the three worded states: New / Getting it / Solid. The confidence-vs-correctness view is shown ONLY as plain bars with one plain-English sentence — never a "%", never a fraction, never a count of "right out of N".
- The machinery is NEVER named. These words must NOT appear anywhere on screen, in any label, caption, tooltip, or aria-label: FSRS, BKT, spaced repetition, scheduler, prerequisite / prereq, knowledge graph, retrievability, stability, calibration, refutation, algorithm, model. Human section titles only (e.g. "What you know" and "How well you know it").
- AT MOST ONE PRIMARY ACTION ON THE WHOLE SCREEN — and in truth there is none: this view has no learning CTA and must never compete with Today. Provide exactly one quiet affordance: a single back / "Done" text link to return. It is plain ink, never the ember accent, never a filled button. No tabs, no secondary CTA, no "start learning", no link into Today.
- The ember accent (--accent) appears AT MOST ONCE on this entire screen. Use it sparingly on the single "opening up next" highlight (a thin accent ring or dot on those chips) OR not at all. If accent is used there, NO other element on the screen may use it. Everything else is neutral ink on frost, with --grow / --calm / --ink-faint / --care carrying meaning.
- COLOR CARRIES MEANING, NEVER DECORATION: --grow = solid, --calm = getting-it, --ink-faint = new, --care = the low confidence-accuracy warning. No other color usage.

ANTI-CLUTTER CONSTRAINTS (make density structurally impossible)
- Flat by default. Elevation (the established soft focal shadow) appears in exactly TWO places and nowhere else: the single "Opening up next" card, and the concept detail sheet. No nested cards, no card-inside-card, no boxes around the totals row or the bars.
- Dividers are hairlines (--hairline, ≤1px) only. No heavy rules, no full-width section boxes.
- Each section gets generous vertical space (use the established large spacing step between the totals, the constellation, the unlock card, the trend line, and the confidence section). Idle is perfectly still — no looping or ambient animation ever.
- One number-bearing element max per row. The totals row shows three small counts; nothing else on the screen renders a number. The trend line and the bars are purely shape — zero axes, zero labels, zero gridlines, zero tick numbers.
- Every caption is one short warm line. No paragraphs, no stacked helper text, no legends.

MODULARITY & DATA OWNERSHIP (so a real engine drops in later with ZERO UI changes)
- ALL mock data lives in the existing single mockData.ts module. Do NOT scatter literals, counts, copy strings tied to data, or arrays inside components. Components receive everything via typed props and render only.
- The page component is the ONLY place that reads from mockData (via the typed selectors below). It passes plain typed props down. Child components have NO global reach-in, no imports from mockData, no context lookups for data — typed props in, JSX out. This is the seam: replacing mockData.ts with a real TypeScript engine that returns the SAME shapes requires touching ZERO component files.
- All shapes conform to the LearningOS core data contract already defined in the project (Profile, Pack, Concept, ProgressSnapshot, CalibrationPoint, Confidence). Do not invent fields; do not drop required ones.

DATA — add these typed selectors to mockData.ts (return values must satisfy the existing contract interfaces exactly, including every required field):

- getProgressSnapshot(profileId: ID): ProgressSnapshot
  = { profileId:"p_mara", date:"2026-06-23", conceptsSolid:7, conceptsGettingIt:4, conceptsNew:5, streakDays:12,
      solidByDay:[{date:"2026-06-09",count:2},{date:"2026-06-11",count:3},{date:"2026-06-13",count:3},{date:"2026-06-15",count:4},{date:"2026-06-17",count:5},{date:"2026-06-19",count:6},{date:"2026-06-21",count:6},{date:"2026-06-23",count:7}] }

- getConcepts(packId: ID): Concept[] — the 16 concepts of pack "Options Trading Basics" (pk_options). Each object MUST include EVERY required Concept field from the contract: id, packId:"pk_options", title, prerequisiteIds (the contract requires this array — supply it on ALL 16, using [] where empty; it is an ENGINE-ONLY signal, used only by the unlock selector and NEVER rendered), itemIds (required by the contract — supply a small plausible array per concept, e.g. ["i_call_1","i_call_2"]; NEVER rendered), and mastery. Concepts and their prerequisiteIds:
  c_call "What a call option is" [] solid
  c_put "What a put option is" [] solid
  c_strike "Strike price" [] solid
  c_expiry "Expiration & time value" [] solid
  c_intrinsic "Intrinsic vs extrinsic value" [c_strike] solid
  c_moneyness "In/at/out of the money" [c_strike] solid
  c_payoff "Reading a payoff diagram" [c_call,c_put] solid
  c_premium "Why premiums move" [c_intrinsic] getting-it
  c_iv "Implied volatility, plainly" [c_premium] getting-it
  c_theta "Time decay" [c_expiry] getting-it
  c_covered "The covered call" [c_call] getting-it
  c_spread_v "Vertical spreads" [c_payoff] new
  c_greeks_delta "Delta as a probability feel" [c_moneyness] new
  c_assignment "Assignment & early exercise" [c_covered] new
  c_calendar "Calendar spreads" [c_theta] new
  c_risk "Defining your max loss" [c_spread_v] new

- getUnlockingNext(profileId: ID): { id: ID; title: string }[] — returns up to 2 "new" concepts whose prerequisiteIds are ALL currently "solid" or "getting-it". The selector computes this from getConcepts; do not hardcode the result. For this data it yields exactly [{id:"c_spread_v",title:"Vertical spreads"},{id:"c_greeks_delta",title:"Delta as a probability feel"}].

- getCalibrationPoints(profileId: ID): CalibrationPoint[] — each point MUST include the contract's required profileId, confidence (Confidence bucket), statedCount, correctCount:
  [ {profileId:"p_mara", confidence:"guessed", statedCount:9,  correctCount:4},
    {profileId:"p_mara", confidence:"unsure",  statedCount:18, correctCount:12},
    {profileId:"p_mara", confidence:"sure",    statedCount:31, correctCount:29} ]

- accuracyRatio(point: CalibrationPoint): number — a PURE helper in the data/util layer, NOT inline in JSX. Returns point.statedCount > 0 ? point.correctCount / point.statedCount : 0. This ratio is used ONLY to size a bar's width and to pick its color band; it is NEVER rendered as text, a number, a fraction, or a percentage.

COMPONENTS (clean boundaries, typed props only, no data imports in children)
<ProgressMapView> (page; the only data reader) composes:
  <MasteryTotalsRow totals={...} streakLine={...} />
  <ConceptConstellation concepts={...} onSelect={...} />
  <UnlockingNextCard items={...} useAccent={boolean} />
  <SolidTrendSparkline points={...} />
  <ConfidenceView points={...} reading={...} /> which renders <ConfidenceBar ratio band /> ×3
  plus a quiet header and the single back link.

LAYOUT & CONTENT
1) Header: Fraunces Title "How you're doing"; one Caption line in --ink-muted: "A quiet look at what you've built." A plain back / "Done" text link (ink, not accent) top-left returns via the existing router. Nothing else in the header.
2) <MasteryTotalsRow>: three small stat cells on ONE flat row, hairline dividers only, NO cards: "7 Solid" (dot in --grow), "4 Getting it" (dot in --calm), "5 New" (dot in --ink-faint). Numbers in Inter tabular numerals; labels in Caption. One line below in --ink-muted: "12-day streak — nice and steady." No fire glyph, no badge, no flame.
3) <ConceptConstellation>: a friendly, NON-grid scatter of the 16 concepts as small soft-radius chips in three gentle horizontal bands, top to bottom — Solid (soft --grow tint fill), Getting it (soft --calm tint), New (faint --ink-faint outline, no fill). Each chip = a 1.5px geometric line dot + the concept title (truncate gracefully, never wrap to a third line). Faint connecting hairlines (--hairline, ≤1px) MAY hint at flow between bands but stay decorative-calm — never a labeled graph, never arrows with words. One caption: "Each dot is an idea. The filled ones are yours."
4) <UnlockingNextCard>: ONE elevated focal card (radius 20, the established soft focal shadow) titled "Opening up next" with the two unlock concepts as chips. This is the SINGLE place --accent may appear — a thin accent ring or dot on these two chips when useAccent is true, OR keep them neutral for zero accent. One body line: "You're close on these — your next sessions will start bringing them in." NO button; Today decides what is next.
5) <SolidTrendSparkline>: one calm line from solidByDay (8 points), stroke --grow, easing in over ~400ms (instant under prefers-reduced-motion). No axes, no numbers, no gridlines, no dots-with-values. One caption: "Two weeks ago this line started low. Look at it now."
6) <ConfidenceView>: section heading (Fraunces, smaller Title) "How well you know it"; Caption "When you said how sure you were, here's how it actually went." Then three <ConfidenceBar> rows, top to bottom, labeled in human words only: "When you guessed" / "When you were unsure" / "When you were sure". Each bar is a horizontal track (--surface-sunken) with a fill whose WIDTH comes from accuracyRatio(point) (compute width from the ratio; render NO % and NO number). Fill color encodes health by band: low ratio → --care, mid → --calm, high → --grow. Beneath all three bars, ONE shared plain-English reading line in --ink (NOT a per-bar number): "When you say you're sure, you're right almost every time — trust that. When you guess, it's closer to a coin flip — slow down on those." End with the single quiet back / "Done" link.

STATES (implement all four; switch via a tiny dev toggle in mockData or a prototype query param — never visible chrome in the real shell)
- LOADING: soft skeleton — three muted pill placeholders for the totals row, one faint block where the constellation sits, two skeleton bars. Gentle 200ms cross-fade. Under prefers-reduced-motion: static muted blocks, no shimmer motion.
- EMPTY (brand-new profile, nothing learned yet): no constellation, no bars. One centered calm message — Fraunces line "Nothing here yet, and that's fine." + Caption "Do today's session and this map starts filling in." NO CTA button and NO route into Today; only the back link.
- ERROR (mock selector failed): one calm inline message in a --care tint, line "We couldn't load your map just now." + a plain "Try again" text link (ink) that re-runs the selectors. No scary icon, no stack trace.
- SUCCESS: the full layout above with the mock data.

INTERACTIONS
- Tapping any constellation chip opens a small bottom sheet / popover (established sheet style, radius 20, soft focal shadow, 320ms ease-out enter; cross-fade instead of slide under prefers-reduced-motion) showing: the concept title; its mastery as ONE worded line — "You've got this." (solid) / "You're getting this." (getting-it) / "Not started yet." (new); and one Caption "Part of Options Trading Basics." NO grade, NO number, NO prerequisite list, NO item list. Dismiss by tap-outside or a plain "Close" link. The page passes the chip's data into the sheet via props; the sheet imports no data.
- Hover/focus on a <ConfidenceBar> does nothing numeric — at most a gentle 120ms lift of the row background. The meaning stays in the one shared reading line.
- The back / "Done" link returns to the previous screen via the existing router. No other navigation.
- Respect prefers-reduced-motion everywhere: sparkline draws instantly, sheet cross-fades, no shimmer.

STYLE
"A small packet of ice" — minimal, calm, warm, dignified. Friendly enough for a seven-year-old, respectful enough for a fund manager. Flat by default; the only elevation is the "Opening up next" card and the concept sheet, with the one established soft shadow. Color carries meaning, never decoration. Ember accent at most once. Plain warm copy throughout — short sentences a child can read and an expert won't resent.

ACCEPTANCE (all must hold)
- A seven-year-old can tell, without reading a number, that the filled dots are theirs and the line went up.
- An expert is not insulted: nothing is dumbed-down or padded.
- No engine number and no banned machinery word appears anywhere on screen or in any aria-label.
- The ember accent is used at most once, and if used it is only on the unlock chips.
- There is exactly one quiet affordance (back / "Done"); no learning action competes with Today.
- The screen reads as calm and uncluttered: flat surfaces, two elevations max, generous whitespace, one number-bearing row.
- Every value flows from the typed selectors in mockData.ts; child components take typed props only and import no data — so a real TypeScript engine returning the same contract shapes replaces the mock layer with ZERO UI changes.
```

_Clean seams this screen preserves (so the engine wires in later):_

- DATA SEAM — single swappable module: every value (snapshot totals, streak, solidByDay trend, the 16 concepts, unlock list, confidence points) is produced by typed selectors in the existing mockData.ts: getProgressSnapshot, getConcepts, getUnlockingNext, getCalibrationPoints, plus the pure helper accuracyRatio. A real TypeScript engine replaces mockData.ts by exporting the same selector signatures returning the same contract shapes; no component changes.
- CONTRACT-SHAPE SEAM — all returned objects satisfy the established LearningOS interfaces exactly: ProgressSnapshot (incl. profileId, date, the three counts, streakDays, solidByDay[]), Concept (incl. required packId, prerequisiteIds, itemIds, mastery), CalibrationPoint (incl. required profileId, confidence, statedCount, correctCount). No invented fields, no dropped required fields, so the engine's emitted types line up 1:1.
- ENGINE-ONLY FIELDS SEAM — prerequisiteIds and itemIds are carried in the data but NEVER rendered; prerequisiteIds is consumed only inside getUnlockingNext to compute which 'new' concepts have all prerequisites at solid/getting-it. The real engine's prereq graph plugs into this same selector boundary without surfacing anything new.
- PROPS-DOWN SEAM — <ProgressMapView> is the ONLY data reader; it passes plain typed props to <MasteryTotalsRow>, <ConceptConstellation>, <UnlockingNextCard>, <SolidTrendSparkline>, <ConfidenceView>/<ConfidenceBar>, and the concept sheet. Children import no data, hold no global/context lookups, and render from props only — the swap point stays at the page boundary.
- MASTERY-SIGNAL SEAM — mastery is surfaced only as the 3-state New/Getting it/Solid signal mapped to --ink-faint/--calm/--grow; the engine can compute it from BKT internally and emit just the worded state, so the UI never sees a probability.
- CONFIDENCE-ACCURACY SEAM — accuracyRatio(point)=correctCount/statedCount (guarded for statedCount=0) is the only computation, used solely to size bar width and pick a --care/--calm/--grow band; never rendered as text. A real engine emits the same CalibrationPoint counts and the bar logic is unchanged.
- ROUTER/SHELL SEAM — the screen mounts in the existing tucked-away profile route only (never linked from Today) and returns via the established router with the single back/'Done' link; it reuses the established design tokens, fonts, soft focal shadow, sheet style, theme handling, and prefers-reduced-motion rules without redefining any of them.
- STATE SEAM — LOADING/EMPTY/ERROR/SUCCESS are driven by the selector layer (dev toggle in mockData or a prototype query param), so when the real engine reports loading/empty/failure the same four UI states render with no structural change.

## Prompt 6 — Pack Library

```text
This is a FOLLOW-UP prompt that EXTENDS our existing LearningOS Claude Design project. Reuse everything already established and do NOT redefine it: the "small packet of ice" visual system, the Fraunces/Inter type scale, the CSS color variables (light + dark) — --accent (Ember), --ink, --ink-muted, --ink-faint, --surface, --surface-sunken, --hairline, --calm, --grow, --care — the centered 560px daily-loop column, the motion rules, the navigation shell, and the existing mockData.ts module. Do NOT redefine tokens, fonts, colors, or the app frame. Add ONE new screen: the Pack Library. Keep it dead simple and elegant. Every guardrail below is a hard constraint, not a preference.

=== THE ONE JOB (one screen, one question) ===
Answer only: "What am I learning, and how far along am I?" The user can browse content packs, see in plain words what each teaches and how far they've come, add a pack, and switch which packs are active. This is the ONLY place the "learn anything" nature of the app is visible. It is NOT part of the daily loop. It must never start a session, never say "do more," and never compete with Today's single primary action.

=== THE ANTI-CLUTTER LAW (read first; it overrides any temptation) ===
If a choice would add visual weight, a number, a second primary action, or a decision a 7-year-old couldn't make, do NOT add it. Concretely:
- At most ONE primary (Ember / --accent) action can exist on screen, and on this screen there is ZERO at rest — the only Ember appears inside the Add-pack sheet while it is open.
- No dashboard of numbers anywhere. No percentages, no "X/Y", no counts, no intervals, no probabilities, no "concepts remaining". Progress is ALWAYS words plus a quiet 3-color bar — nothing else.
- One thing moves at a time. No tabs, no filters, no search bar, no sort, no settings on this screen. The catalog is short on purpose.
- Whitespace is a feature: ≥64px around content on desktop, generous gaps between the two sections. Flat by default. A child should be able to point at the screen and read what they're learning out loud.

=== WHERE IT LIVES (routing) ===
- Reached from a quiet, secondary affordance in the existing shell — a small line-glyph "library" icon or a "Your packs" text link in the header/menu. NEVER from a primary button on Today.
- The back chevron (line glyph, top-left) returns to Today (the existing screen).
- This screen owns no Ember action at rest. Ember stays reserved for "Start today's session" on Today.

=== LAYOUT ===
- Same centered single column, max-width 560px. Generous whitespace.
- Header row: back chevron on the left; Title "Your packs" in Fraunces Title (24). One-line Caption beneath it in --ink-muted: "What you're learning. Add or switch anytime."
- Two calm sections, separated by lots of space, each with a small Heading (18, Inter 600) label in --ink-muted:
  1. "Learning now"
  2. "Add a pack"

=== COMPONENTS (build as clean, separately-named, prop-driven components) ===
Build: PackLibraryScreen, PackCard, ProgressSignal, AvailablePackRow, AddPackSheet, RemoveActionSheet, WhatsInsideSheet (optional peek), plus LoadingState, EmptyState, ErrorState. Every component receives its data via props. NO component reads the mock module directly except PackLibraryScreen, which fetches once and passes data down. This is what lets a real engine replace the mock layer with no redesign.

1) PackCard (an active pack) — radius 14, --surface, 1px --hairline border, FLAT (no shadow; the focal-card shadow stays unique to the session card on Today). Padding 24.
   - Left: a 40px round --surface-sunken tile holding the pack's single calm glyph (abstract, not toy-like).
   - Right of the tile: pack title in Fraunces 18–20; one-sentence description in Body 16, --ink-muted, measure ≤62ch.
   - Below: a ProgressSignal row.
   - Far right of the title row: a quiet line-glyph "•••" menu button opening RemoveActionSheet (one item only).
   - Tapping the card body is never destructive — it opens the optional read-only WhatsInsideSheet. Nothing on this card can start a session.

2) ProgressSignal — the ONLY progress UI in the whole app surface. It translates mastery into WORDS plus a quiet 3-segment bar. NEVER numbers, NEVER percentages, NEVER "X/Y concepts".
   - Three thin segments (stacked or inline) in semantic colors sized proportionally to the count of concepts in each state: --ink-faint = New, --calm = Getting it, --grow = Solid.
   - One plain-language line under the bar, e.g. "Mostly solid — a few ideas still new." or "Just getting started."
   - A tiny 3-dot legend with the words "New · Getting it · Solid" in Caption 13, --ink-muted.
   - "New / Getting it / Solid" are the ONLY mastery words allowed anywhere. Derive segment sizes by counting Concept.mastery across the pack's conceptIds, but render only the bar and the words. The component receives three counts as props (new, gettingIt, solid) — it never sees a percentage and never computes one.

3) AvailablePackRow (a not-yet-active pack) — lighter than PackCard: one row, --surface, 1px hairline, radius 14, padding 16–20.
   - Glyph tile + title (Fraunces 18) + one-line description (Body, --ink-muted).
   - Right side: a quiet NEUTRAL "Add" pill — hairline/ghost button with --ink text. NOT Ember; Ember is reserved.
   - Community-authored packs show a tiny neutral Caption tag "Community" in --ink-faint with a simple line glyph — but NO cloud / sync / login / upload iconography. Local-first: nothing leaves the device.

4) AddPackSheet — a modal bottom sheet (radius 20, the ONE allowed soft shadow, 320ms ease-out enter, honors prefers-reduced-motion with an instant cross-fade), opened by an AvailablePackRow's "Add".
   - Shows the pack's glyph, title, full description, a plain "What you'll learn" list of 3–5 concept titles (the pack's first few conceptIds), and the version as quiet Caption, e.g. "Pack v1.2".
   - Primary confirm: a single Ember pill "Add to learning" (the only Ember on this screen, and only while the sheet is open). Secondary: a ghost "Maybe later" that dismisses with no change.
   - On confirm: one quiet 200ms checkmark draw, sheet fades, the pack animates (≤12px translate + fade) from "Add a pack" up into "Learning now" with a fresh ProgressSignal reading "Just getting started." (all mastery "new").

5) RemoveActionSheet — a tiny ActionSheet from the PackCard menu with a SINGLE item: "Remove from learning" in --care text. No other actions.
   - Confirming moves the pack back down to "Add a pack" and removes it from activePackIds. Copy reassures, implying no data loss: "You can add it back anytime."
   - Show a quiet inline undo for 5s: "Removed Trading Foundations. Undo." Tapping Undo restores it instantly.

6) WhatsInsideSheet (optional, read-only peek) — opened by tapping a PackCard body. Lists concept titles grouped only by the three plain words (New / Getting it / Solid). Still no numbers. Dismiss on tap-away.

=== COPY VOICE ===
Warm, plain, dignified for BOTH a 7-year-old and an expert. No hype, no jargon, no exclamation marks. The same words work for child and adult — tone differences come ONLY from pack content, never from a kid/pro toggle or difficulty selector. Sentences a child can read aloud and an expert won't find condescending. Examples of the register: "What you're learning. Add or switch anytime.", "Just getting started.", "You can add it back anytime."

=== STATES (build all four; switchable via a tiny dev toggle or by editing the mock module) ===
- LOADING: skeleton — 2 shimmer PackCard placeholders and 2 shimmer rows, hairline-only, no spinner, no text. Calm, near-still shimmer; reduced-motion shows static muted blocks. Driven by a status prop, not internal component state.
- EMPTY (no active packs): "Learning now" shows a calm card, --surface-sunken, no border, centered: a small abstract line glyph, a line in Fraunces "No packs yet", and Body "Pick one below to start learning." The "Add a pack" list below is full. No Ember, no nagging. EMPTY is derived from activePackIds.length === 0, not a separate status.
- ERROR (packs failed to load): a single calm inline card, --care hairline, Body "Couldn't load your packs.", and a quiet ghost "Try again" (not Ember). No stack traces, no codes.
- SUCCESS (default): the seed data below.

=== MOCK DATA (extend the EXISTING mockData.ts — do NOT create a second data module) ===
Shape everything to the established LearningOS data contract (Profile, Pack, Concept with mastery: "new" | "getting-it" | "solid"). The Pack Library reads packs via a typed selector getPacks() and the active profile via getActiveProfile(); it derives each pack's progress by counting Concept.mastery across pack.conceptIds. NEVER store a percentage. Active vs. available is driven SOLELY by Profile.activePackIds.

Active profile: Profile "Dad", readingLevel "expert", with activePackIds = ["pack-trading", "pack-biz-kids"].

LEARNING NOW (in activePackIds):
- Pack { id:"pack-trading", emoji: an abstract line-chart glyph (calm, not a toy), title:"Trading Foundations", description:"How options really work — calls, puts, and the few ideas that matter.", version:"1.4" }. Concept mastery mix across its conceptIds: 9 solid, 5 getting-it, 3 new. ProgressSignal line: "Mostly solid — a few ideas still new."
- Pack { id:"pack-biz-kids", emoji: a calm abstract glyph, title:"Business for Kids", description:"Where money comes from and why people trade — explained simply.", version:"1.1" }. Mastery mix: 2 solid, 4 getting-it, 8 new. ProgressSignal line: "Just getting going."

ADD A PACK (NOT in activePackIds):
- Pack { id:"pack-stats", title:"Everyday Statistics", description:"Read the world's numbers without being fooled by them.", version:"1.0", community:false }.
- Pack { id:"pack-cooking", title:"Kitchen Confidence", description:"The handful of techniques behind most home cooking.", version:"2.0", community:true }.
- Pack { id:"pack-spanish", title:"Spanish, Spoken First", description:"Useful phrases before grammar — talk from week one.", version:"0.9", community:true }.
(Represent "community" as a mock-only catalog flag carried alongside the Pack — it is a local catalog attribute, not anything that implies a network. If the data contract has no such field, attach it in the mock catalog layer, not on the rendered Pack props beyond a boolean.)

Give EACH pack 12–17 Concept records with realistic titles so the "What you'll learn" list and the bar derive from real shapes. Examples — Trading: "What a call option is", "Intrinsic vs time value", "Why selling premium has an edge"; Business for Kids: "What a trade is", "Why people want different things", "Where a profit comes from". For pack-trading make the mastery counts total to the 9/5/3 split; for pack-biz-kids total to the 2/4/8 split; for the available packs, all concepts are mastery "new". Fill engine-only fields (Concept.prerequisiteIds, Concept.itemIds, and any Item.scheduling such as FSRS/BKT internals) with plausible values, but NEVER render them and NEVER pass them into a visual component.

=== INTERACTIONS (every one works in the prototype) ===
- Back chevron → return to Today.
- AvailablePackRow "Add" → AddPackSheet opens with that pack's details.
- In the sheet, "Add to learning" → 200ms checkmark draw, sheet closes, pack moves into "Learning now" with a fresh ProgressSignal "Just getting started.", and the profile's activePackIds updates in the mock module. "Maybe later" → dismiss, no change.
- PackCard menu → RemoveActionSheet with "Remove from learning" (--care). Confirm → pack moves down to "Add a pack", removed from activePackIds, with the 5s "Removed [title]. Undo." affordance. Undo restores it.
- Optional: tapping a PackCard body → WhatsInsideSheet (read-only, grouped by the three words, no numbers).
- Reduced-motion: every sheet and movement transition becomes an instant cross-fade.

=== GUARDRAILS (do not violate any) ===
- No raw engine numbers anywhere: no percentages, no "X/Y", no intervals, no probabilities, no "concepts remaining". Progress = words + the 3-color bar only.
- The machinery is never named: no FSRS, BKT, spaced repetition, prerequisite graph, retrievability, calibration, or refutation in any visible copy.
- This screen is NOT the daily loop: no "do a session", no "do more". Ember appears at most once, only inside the open Add-pack sheet.
- Local-first: no login, no account, no sync/cloud icons, no "upload". Community packs are plain local catalog entries; nothing implies data leaves the device.
- Same components for child and expert: no kid/pro toggle, no difficulty selector. Tone differences come only from pack content.
- Calm motion only: one thing moves at a time, ≤12px translate + fade, the single quiet 200ms checkmark on add. No confetti, no sound.

=== MODULARITY & SWAPPABILITY (so a real engine plugs in later with no redesign) ===
- ALL mock data and selectors live in the single existing mockData.ts. Expose typed selectors: getPacks(): Pack[], getActiveProfile(): Profile, getConceptsForPack(packId): Concept[], plus mutators addPackToProfile(profileId, packId) and removePackFromProfile(profileId, packId). A real engine implements the SAME signatures and shapes; the UI does not change.
- Keep one pure UI helper, deriveProgress(concepts): { new, gettingIt, solid, line }, in mockData.ts so the plain-language sentence can change without touching components. The engine supplies mastery only; it never writes the sentence.
- Components are prop-driven and pure: PackCard, ProgressSignal, AvailablePackRow, AddPackSheet, RemoveActionSheet, and WhatsInsideSheet receive plain data (title, description, glyph, version, the three mastery counts, a community boolean) and callbacks (onAdd, onRemove, onOpenSheet). They never import the mock module and never see engine internals.
- LOADING and ERROR are driven by a status prop on PackLibraryScreen ("loading" | "error" | "ready") so an async engine can drive them later; EMPTY is derived from data. This keeps state logic out of the leaf components.
Build it so swapping mockData.ts for a real TypeScript engine (FSRS-6 + BKT producing the same Profile / Pack / Concept shapes) requires zero changes to any visual component.
```

_Clean seams this screen preserves (so the engine wires in later):_

- getPacks(): Pack[] — returns the full local catalog. Mock reads from mockData.ts; real engine returns identical Pack[] shape. The screen never fetches; PackLibraryScreen calls this once and passes results down as props.
- getActiveProfile(): Profile — returns the current profile (seeded as "Dad", readingLevel "expert"). active-vs-available is derived SOLELY from profile.activePackIds; no "isActive" flag is ever stored on a Pack.
- getConceptsForPack(packId: ID): Concept[] — returns Concept[] for a pack's conceptIds in path order. ProgressSignal counts mastery ("new" | "getting-it" | "solid") across these; it never receives or stores a percentage. "What you'll learn" reads the first 3–5 concept.title values from this same source.
- deriveProgress(concepts: Concept[]): { new: number; gettingIt: number; solid: number; line: string } — pure UI-side helper in mockData.ts that turns mastery counts into the 3 segment sizes plus the plain-language line. Engine never produces the sentence; it only supplies mastery. Swap this helper to change copy without touching components.
- addPackToProfile(profileId: ID, packId: ID): void — appends to activePackIds in the mock store and re-emits the profile. Real engine implements the same signature (persist locally, return/emit updated Profile). The new pack's concepts are all mastery "new", so ProgressSignal renders "Just getting started."
- removePackFromProfile(profileId: ID, packId: ID): void — removes from activePackIds. No concept/review data is deleted (copy: "You can add it back anytime."). Undo simply re-calls addPackToProfile with the same id within the 5s window.
- Load/Error states map to the data layer's request status, not component logic: PackLibraryScreen takes a status prop ("loading" | "error" | "ready") so a real async engine can drive LOADING/ERROR without component rewrites. EMPTY is data-driven (activePackIds.length === 0), not a separate status.
- Engine-only fields (Concept.prerequisiteIds, Concept.itemIds, Item.scheduling, FSRS/BKT internals) are present in the mock for shape-fidelity but are NEVER passed to a visual component — props are limited to title, description, emoji, version, and the 3 mastery counts. This is the guarantee that lets the real engine overwrite internals with zero UI change.

## Prompt 7 — Settings

```text
FOLLOW-UP PROMPT — extends the existing LearningOS Claude Design project. Reuse everything already established: the design-system tokens, Fraunces/Inter type scale, CSS color variables (light + dark palettes), radii, spacing rhythm, motion tokens, the single `mockData.ts` module, and the existing navigation/app-shell. Do NOT redefine the theme, re-import fonts, restyle existing components, or add a second data source. This prompt adds exactly ONE new screen: Settings.

Read this whole prompt before building. Two invariants below (ONE-ACTION and the GUARDRAILS block) override any detail that seems to conflict with them.

========================================================
INVARIANT 1 — ONE ACTION, ONE ACCENT, ZERO CLUTTER
========================================================
- The resting Settings screen has NO primary button and ZERO instances of the Ember accent (--accent). It is neutral ink on frost.
- The Ember accent appears AT MOST ONCE on the entire screen, and ONLY transiently: on the single confirm button of whichever modal sheet is currently open ("Save key", "Create profile", "Delete", "Import", "Reset"). Close the sheet → the accent is gone. Never two accent elements at once. Never an accent control in the resting layout.
- Generous whitespace, one focal idea per group, flat by default. No dashboards, no grids of numbers, no badges, no gamification, no streak fireworks. Every screen and every sheet has at most one primary action.
- The bar: nothing here should be navigable only by an expert. A calm 7-year-old and a busy adult should both move through it without instruction. Favor plain words and empty space over controls.

========================================================
INVARIANT 2 — GUARDRAILS (the screen is not done unless ALL pass)
========================================================
G1. At most one --accent on screen, only on the open sheet's confirm button; resting screen has zero accent.
G2. No raw engine numbers anywhere on the surface: no retention %, no FSRS/BKT internals, no ease, no stability/difficulty, no reps/lapses, no queue or card counts, no due dates. Momentum is shown only as plain words (a streak phrase or a calm one-liner). These fields may EXIST in data; they are NEVER rendered.
G3. No mode toggles. No kid/pro switch, no difficulty selector on the surface. Tone lives only in the per-profile `readingLevel` field, set inside a sheet, labeled in plain words.
G4. No login, no account, no sign-in, no sync, no cloud copy or iconography. AI is OFF by default and only ever uses a key the user pasted themselves, stored locally.
G5. The learning machinery is never named in the primary UI. Only the tucked-away "How this works" explainer may mention it, in plain passing language.
G6. Settings lives OUTSIDE the daily loop: never the suggested next action, never auto-routed to, never interrupting a session.
G7. "A small packet of ice" — minimal, calm, lots of breathing room.

========================================================
ENTRY & SHELL
========================================================
Add a route/view "settings". It is reachable ONLY from a quiet line-glyph gear icon in the app-shell header (1.5px stroke, --ink-muted, top-right). The gear is never shown inside an active session and is never highlighted as a next step. Today's single primary action elsewhere is untouched.

Entering "settings": 320ms screen enter (≤12px translate + gentle fade, ease-out cubic-bezier(0.22,1,0.36,1)); instant cross-fade under prefers-reduced-motion. Single centered column, max-width 560px, ≥64px breathing room at top.
- Top-left: a quiet back affordance "← Settings" (chevron + word) in --ink-muted that returns to the prior view.
- Header title "Settings" in Fraunces Title (24 / lh 1.25 / weight 460).
- One caption beneath, --ink-muted Caption (13): "Everything here is optional. Nothing leaves this device."

========================================================
LAYOUT — a vertical stack of flat, hairline setting groups
========================================================
Each group is a flat card: --surface background, 1px --hairline border, 14px radius, 24px padding, 16px vertical gap between groups, NO shadow (elevation is reserved for the focal session card and modal sheets only). Each group opens with a small Heading (Inter 18 / 600) and, where useful, one Caption line of plain helper copy.

Render groups in this order:
1) Profiles
2) Intensity
3) Smarter practice with AI
4) Appearance
5) Your data
6) About

--- GROUP 1: PROFILES ---
Heading "Profiles". Caption: "Switch any time. Each profile keeps its own progress on this device."
List the profiles from `mockData.ts` as rows. Each row, left → right:
- A deterministic avatar token: a 36px rounded square, fill chosen from {--calm, --grow, --care, --ink-muted} by hashing `avatarSeed`, with the displayName's first initial in Inter 560 centered on it. NEVER an uploaded photo, NEVER an emoji mascot.
- `displayName` in Body (16).
- One muted Caption momentum line derived ONLY from surface-safe fields: if `streakDays` > 0 → "{streakDays}-day streak"; else → "Ready when you are". Never show `lastCompletedDate`, pack counts, queue counts, or any engine number (G2).
The active profile row shows a tiny 1.5px line-glyph check at the right in --grow and a faint --surface-sunken row background. Tapping a non-active row makes it active: 120ms press, the --grow check draws onto the newly active row over 200ms, the previous row fades its check out. Switching active profile updates the AI toggle, Intensity, and Theme controls below to reflect THAT profile's stored settings.
Each row also has a quiet trailing "⋯" line-glyph (--ink-faint) opening the Edit-profile sheet.
Below the rows: one ghost/tertiary text button "+ Add profile" (Inter 560, --ink — NOT accent) opening the Add-profile sheet.

Seed at least three profiles (active = Mara), shaped exactly against the contract `Profile`:
- { id:"p_mara", displayName:"Mara", avatarSeed:"mara-cal", readingLevel:"general", activePackIds:["pk_options"], streakDays:12, lastCompletedDate:"2026-06-22", aiEnabled:false, createdAt:"2026-04-02T08:10:00" }
- { id:"p_dad", displayName:"Dad", avatarSeed:"dad-grow", readingLevel:"general", activePackIds:["pk_options","pk_money_kids"], streakDays:4, lastCompletedDate:"2026-06-23", aiEnabled:true, createdAt:"2026-05-19T19:40:00" }
- { id:"p_sage", displayName:"Sage (age 7)", avatarSeed:"sage-care", readingLevel:"child", activePackIds:["pk_money_kids"], streakDays:0, lastCompletedDate:null, aiEnabled:false, createdAt:"2026-06-20T17:05:00" }

READING-LEVEL CONTROL (only inside the Add/Edit sheet — never on the surface; G3):
A 3-option segmented control "Reading level": "Simple" / "Standard" / "In-depth", mapping to `readingLevel` "child" | "general" | "expert". Caption beneath: "Just changes the wording. It's the same app for everyone." This is the ONLY place tone is set.

--- GROUP 2: INTENSITY ---
Heading "Intensity". Caption: "How hard should practice push? Most people leave this in the middle."
A single horizontal slider, 5 stops. Left label "Gentle", right label "Intense" (both Caption, --ink-muted). Thumb in --ink (NOT accent). Track in --surface-sunken; filled portion in --calm. Below the slider, ONE live plain-language reading (Body, --ink-muted) that updates as the thumb moves:
- 1 (Gentle): "Lighter days, more room to breathe."
- 2: "Easygoing — steady but relaxed."
- 3 (default, centered): "Balanced. The setting we suggest."
- 4: "A little more challenge each day."
- 5 (Intense): "Push hard. Expect tougher sessions."
Never show a percentage, an FSRS parameter, a card count, or any jargon (G2). The stop maps internally to a hidden `retentionTarget` in data (e.g. 0.80→0.95) that is NEVER rendered. Default thumb to stop 3. Changing it persists to the active profile's stored settings.

--- GROUP 3: SMARTER PRACTICE WITH AI ---
Heading "Smarter practice with AI". Caption: "Optional. Off until you add your own key. Your key stays on this device."
A single row: a plain toggle (track --hairline when off, --calm when on — NOT accent) labeled "Use AI to sharpen practice".
- OFF (default, e.g. Mara): toggle off, and NOTHING else — no key field, no cloud icon, no sync/account language. Just the calm caption above (G4).
- Tapping ON does NOT flip silently; it opens the "Add your AI key" sheet, because a key is required. Cancel without saving → toggle returns to OFF.
- After a key is saved: toggle shows ON and the row gains a Caption "Connected. Your key is stored only on this device." plus a quiet text link "Remove key" (--ink-muted) that flips it OFF and clears the stored value.
Maps to `aiEnabled`. Reflect each profile's own `aiEnabled` when switching active profile (Dad = ON/connected; Mara, Sage = OFF). No login, no provider account UI — only a bare key field the user fills in (G4).

--- GROUP 4: APPEARANCE ---
Heading "Appearance". A 3-option segmented control "Theme": "Light" / "Dark" / "Auto" (default "Auto"). Light/Dark live-apply the project's existing light/dark CSS-variable palettes; "Auto" follows the system. Caption: "Auto matches your device." No other appearance knobs.

--- GROUP 5: YOUR DATA ---
Heading "Your data". Caption: "Your learning lives on this device. Keep your own copy."
Three quiet full-width rows, each a flat row of [1.5px line glyph] + label + trailing chevron. NONE in accent. Local-first copy only — no "sync", "cloud", or "upload to server".
- "Export a backup" (download glyph) → on tap, mock-create a file and show a calm inline note under the row: "Backup ready — learningos-backup-2026-06-23.json" with a tiny --grow check drawn over 200ms. No real file.
- "Import a backup" (upload glyph) → opens the "Import a backup" sheet.
- "Reset this profile" (rotate/refresh glyph, label in --care) → opens the destructive confirm sheet. This is the ONLY --care-tinted control in the group.

--- GROUP 6: ABOUT ---
Heading "About". Plain rows: "LearningOS" + Caption "Version 0.4.0 · Local-first · Open source". Below it, one very quiet, tucked-away text link "How this works" (--ink-faint, Caption). This link is the ONLY place the engine may be named, and only inside the explainer it opens (G5). Tapping opens a "How this works" sheet: 3–4 short, plain paragraphs that may gently mention in passing that the app uses proven spaced-repetition and mastery techniques to choose what to show — written for a curious human, never a dashboard, never with live numbers. The daily loop never routes here.

========================================================
MODAL SHEETS — the only elevated surfaces on this screen
========================================================
All sheets: centered modal on desktop / bottom sheet on narrow widths. --surface, 20px radius, 32px padding, the project's one soft shadow (0 1px 2px rgba(20,30,45,.05), 0 8px 24px rgba(20,30,45,.06)), 320ms enter, dim scrim behind. Esc / scrim-tap / "Cancel" closes. Each sheet has EXACTLY ONE primary confirm button in --accent (the single permitted accent instance) plus a neutral "Cancel" text button. Disabled primary = reduced opacity, not clickable.

1) ADD / EDIT PROFILE
- Title in Fraunces 24 ("Add profile" / "Edit profile").
- Text input "Name" (placeholder "e.g. Mara").
- The "Reading level" segmented control + its "same app for everyone" caption.
- Add → primary "Create profile". Edit → primary "Save", plus a quiet "Delete profile" --care text link at the bottom that swaps the sheet into the delete-confirm state.
- Validation: empty name disables the primary button.
- Guard (G-last): you cannot delete the only remaining profile. If just one exists, hide Delete and show a Caption "Add another profile first."

2) ADD YOUR AI KEY
- Title "Add your AI key".
- Caption: "Paste a key from your own AI provider. It's stored only on this device and used just to sharpen your practice. You can remove it any time."
- One password-style input "API key" (masked, with a show/hide line-glyph eye).
- Primary "Save key", disabled until non-empty.
- Save → close, toggle flips ON, "Connected." caption appears; store the masked value on the profile. No network call — purely mock. Cancel → toggle returns to OFF.

3) IMPORT A BACKUP
- Title "Import a backup".
- A dashed-hairline drop target: line glyph + "Choose a backup file (.json)" and a faux "Browse" control.
- Caption: "This replaces what's on this device for this profile."
- Primary "Import". Confirm → close + inline note "Backup imported." with a 200ms --grow check. Mock only; no real file parsing.

4) RESET / DELETE (destructive confirm)
- Title "Reset this profile?" or "Delete {name}?".
- Body warning: "This clears this profile's progress on this device. It can't be undone."
- Primary in --accent labeled "Reset" / "Delete" (tints toward --accent-pressed on press).
- Neutral "Cancel".
- Same last-profile guard as above.

========================================================
STATES — build all four, switchable for the prototype
========================================================
- LOADING: a calm skeleton — group cards render as --surface-sunken blocks with motionless placeholder bars (no shimmer; respect prefers-reduced-motion). ~400ms, then resolves to SUCCESS. No spinners.
- EMPTY: rare first-run, no profiles exist. The Profiles group shows one calm centered prompt: a small line glyph, the line "No profiles yet.", and the "+ Add profile" button (neutral ink, not accent). All other groups hidden until at least one profile exists.
- ERROR: if the mock layer reports it can't read local data, show one quiet inline panel at the top in a --care-tinted hairline: "Couldn't read saved data on this device." + one neutral "Try again" text button that re-runs the mock load. No stack traces, no codes.
- SUCCESS: the full populated screen — active profile = Mara, AI off, Intensity centered (stop 3), Theme Auto.
Add a tiny, unobtrusive, clearly-labeled dev-only state switcher (e.g. a corner control marked "prototype") to demo loading / empty / error / success. It must read as scaffolding, visually separate from the real UI.

========================================================
INTERACTIONS — wire all of these as clickable
========================================================
- Tap a profile row → set active; draw the --grow check (200ms); update AI toggle + Intensity + Theme to that profile's settings.
- Tap "⋯" → Edit sheet. Rename + Save updates the row live. Delete → confirm → row removed (last-profile guard).
- Tap "+ Add profile" → Add sheet → Create → new row appended and becomes active.
- Drag Intensity → live reading updates; persists to active profile's hidden `retentionTarget`.
- Toggle AI on → key sheet → Save → ON + "Connected" caption; "Remove key" → OFF + cleared.
- Theme control → live light/dark palette swap.
- Export → inline mock note + filename. Import → sheet → mock success. Reset/Delete → destructive confirm.
- "How this works" → explainer sheet (only place the machinery is named, in passing).
- Back → return to prior view.
- Motion everywhere: ≤12px translate + fade, one thing moves at a time, 120ms press / 200ms content / 320ms sheet enter. Full prefers-reduced-motion support: instant cross-fades, no draw animation, show final state immediately.

========================================================
DATA & ARCHITECTURE — must follow (this is what lets a real engine drop in)
========================================================
- ALL data lives in the single existing `mockData.ts`. Do NOT create a second data source.
- Shape every profile against the contract `Profile` EXACTLY: { id, displayName, avatarSeed, readingLevel, activePackIds, streakDays, lastCompletedDate, aiEnabled, createdAt }. Invent NO new on-screen engine fields.
- Extend `mockData.ts` only with a typed, per-profile `settings` object for what this screen needs: { intensityStop: 1|2|3|4|5; retentionTarget: number; theme: "light"|"dark"|"auto"; apiKeyMasked: string | null }. `retentionTarget` and any scheduling fields are internal and NEVER rendered (G2). Type everything.
- Component boundaries (each reused, each reads via typed props, emits events up — no component reaches into the data module directly except through typed selectors):
    SettingsScreen
      → SettingGroup            (the flat card shell, reused 6×)
        → ProfileRow            (avatar, name, momentum line, active check, ⋯)
        → IntensityDial         (5-stop slider + live reading)
        → AiKeyToggle           (toggle + connected caption + remove link)
        → ThemeToggle           (3-option segmented control)
        → DataRow               (glyph + label + chevron, reused 3×)
      → Sheet                   (primitive: scrim, card, one accent confirm, neutral cancel)
        → AddEditProfileSheet, AiKeySheet, ImportSheet, ConfirmSheet (compose Sheet)
- Selectors/handlers (typed, the swap seam): `getProfiles()`, `getActiveProfileId()`, `getProfileSettings(id)`, `setActiveProfile(id)`, `upsertProfile(p)`, `deleteProfile(id)` [guarded], `setIntensity(id, stop)`, `setTheme(id, theme)`, `saveApiKey(id, masked)`, `removeApiKey(id)`, `exportBackup(id)`, `importBackup(id)`, `resetProfile(id)`, `loadState()` [drives loading/error]. The mock implements these today; a real TypeScript engine (FSRS-6 + BKT + relearning) implements the SAME signatures and shapes later, with ZERO UI changes.
- Reuse only the already-defined CSS variables, Fraunces/Inter scale, radii, spacing, and motion tokens. Introduce no new colors or fonts.

Before you call it done, re-check INVARIANT 1 and every line G1–G7. If any sheet leaves an accent on the resting screen, or any engine number reaches the surface, or any mode/login/sync/cloud appears, fix it before finishing.
```

_Clean seams this screen preserves (so the engine wires in later):_

- Single data module: ALL state lives in the existing mockData.ts. The Settings screen adds no second data source — it extends the same module the daily loop already reads, so swapping the mock for the real engine is one file's concern.
- Profile shape is the contract verbatim: { id, displayName, avatarSeed, readingLevel, activePackIds, streakDays, lastCompletedDate, aiEnabled, createdAt }. No new on-screen engine fields are invented; the screen only renders surface-safe fields (displayName, avatarSeed, streakDays, aiEnabled) and never lastCompletedDate or activePackIds counts.
- settings extension is additive and typed: per-profile { intensityStop: 1|2|3|4|5; retentionTarget: number; theme: 'light'|'dark'|'auto'; apiKeyMasked: string|null }. intensityStop is the only surface-rendered field (as words); retentionTarget is the hidden engine value the real scheduler will own and is never rendered.
- Typed selector/handler seam (the swap point): getProfiles, getActiveProfileId, getProfileSettings, setActiveProfile, upsertProfile, deleteProfile (guarded against last profile), setIntensity, setTheme, saveApiKey, removeApiKey, exportBackup, importBackup, resetProfile, loadState. The mock implements them now; a real FSRS-6 + BKT engine implements the identical signatures later with zero UI changes.
- Components receive data via props and emit events upward — none reach into mockData.ts directly, only through the typed selectors. Component tree: SettingsScreen → SettingGroup (×6) → {ProfileRow, IntensityDial, AiKeyToggle, ThemeToggle, DataRow} and Sheet primitive → {AddEditProfileSheet, AiKeySheet, ImportSheet, ConfirmSheet}. Replacing the data layer touches no component.
- intensityStop → retentionTarget mapping (e.g. stop 3 → 0.875) lives in the mock as a pure function the engine can override. The UI passes the stop; the engine decides the target. The percentage never crosses into the view layer.
- AI key flow is local-only: saveApiKey stores a masked string on the profile and flips aiEnabled; no network call, no auth, no account. The real engine can later route the stored key to a provider without changing the toggle/sheet contract.
- Design-system reuse is the visual seam: the screen consumes existing CSS color variables (incl. light/dark palettes), Fraunces/Inter type scale, radii, spacing rhythm, and motion tokens. ThemeToggle live-applies the project's existing palettes rather than defining new ones, so it stays consistent if the theme is later edited centrally.
- State machine (loading/empty/error/success) is driven by loadState() from the same module, so the real engine's load/error behavior plugs into the identical four-state UI. The dev-only state switcher is prototype scaffolding, visually separated, and is removed when the real loader is wired.

---

## Keeping the seams clean (so the engine snaps in)

Keep these seams clean so the real engine drops in later without a redesign:

1. Single mock-data module. All sample data (today's queue, packs, progress, profile) lives in one file/module that every screen imports. No screen should hardcode its own data inline. When the engine is real, you swap this one module for live data and nothing else moves.

2. Components take data via props. Every screen and card receives its data as inputs from the top, not by reaching into globals or fetching internally. A SessionCard, ProgressMap, or PackTile should render purely from what it's handed.

3. Thin scheduling/grading interface. Define a small, named interface for the two things the engine owns: scheduling (what's due, what comes next) and grading (was this answer right, how does it adjust the schedule). The mock fakes these behind that interface; the real engine implements the same interface later. Screens call the interface, never the implementation.

4. No business logic in components. Components display and emit events ("user answered X", "user rated this hard"). They must not decide intervals, scores, or what's due next — that all lives behind the scheduling/grading interface. Keep the UI dumb and the engine swappable.

## A note on the name

LearningOS is a working name only — a naming pass is available to land a stronger final name before launch if you want one.

---

## When you're done

Bring the generated project back here — share the Claude Design URL or export it into this repo. Then I build the engine (FSRS-6 + BKT + knowledge graph + the relearning/calibration logic), replace the single mock-data module with the real one, and seed the first packs. The screens won't change — only what's underneath them becomes real.
