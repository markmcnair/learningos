# LearningOS

**Live:** https://learningos-orpin.vercel.app — open it on your phone and add it to your home screen.

A learning tool that feels like a small, calm packet of ice — and runs a serious learning engine underneath.

You open it, it tells you the one thing to do right now, you do it in 10–20 minutes, you're done. Come back tomorrow and move the ball forward again. That's the whole experience. Under the surface, a research-backed engine decides what to show and when, so the simple daily habit quietly compounds into real, durable mastery.

It's domain-agnostic. Point it at options trading, business basics for a 7-year-old, a language, anatomy, anything — the subject lives in a swappable **pack**; the engine is the same.

## The iceberg

**The tip (what you see):** one screen. Today. A single button. A short, finite session. A two-minute reflection. A streak. Nothing a child couldn't navigate, nothing that insults an expert.

**The mass (what you don't):**

- **FSRS-6 spaced repetition** — schedules each item for the moment you're about to forget it, the most efficient time to review.
- **Mastery tracking (BKT)** — knows when you actually know something versus when you just got lucky, and gates what unlocks next.
- **A prerequisite knowledge graph** — you only see what you're ready for; concepts unlock as you build the foundations under them.
- **Successive relearning** — pushes items to genuine mastery, then re-checks across spaced sessions so it sticks.
- **Misconception handling** — surfaces and refutes the wrong ideas that quietly block understanding, then re-checks them, because misconceptions relapse.
- **Calibration** — gently closes the gap between what you think you know and what you actually know.

None of those words ever appear on screen. They're translated into plain language, a streak, and a simple New / Getting it / Solid signal.

## Principles

- **Local-first.** No accounts, no servers, no cloud. Multiple named profiles live on one device. Nothing leaves your machine.
- **AI is optional.** The whole thing works with zero AI and zero API key. Add your own key — Anthropic (`sk-ant-…`) or OpenRouter (`sk-or-…`), auto-detected — and a tutor can check your written explanations and your end-of-session recall, judged only against the pack's fact-checked content, so it never invents facts. Off by default; the key stays on your device and is never exported.
- **Free and open.** MIT licensed. Use it, fork it, write packs for it, teach with it.
- **Simple on top, rigorous underneath.** Every screen answers one question and offers one next move. Every scheduling decision is grounded in cognitive science.

## Status

Built in the open, in phases:

| Phase | What | State |
| --- | --- | --- |
| 1 | Vision + architecture | done |
| 2 | UI design prompt pack | done — see [`docs/DESIGN_HANDOFF.md`](docs/DESIGN_HANDOFF.md) |
| 3 | Build the app surface (all 7 screens, local-first) + deploy | done — [live](https://learningos-orpin.vercel.app) |
| 4 | Real learning engine — FSRS-6 scheduling + BKT mastery | done |
| 5 | Content packs — full trading spine + business-for-kids, fact-checked | done |
| 6 | Optional AI tutor — explanation grading + brain-dump review (BYO key) | done |
| 7 | Kid mode (objective tap-to-answer + read-aloud) + 4 kid courses | done |
| 8 | "How it works" showcase dashboard (iceberg, live stats, graph) | done |
| 9 | AI course growth — generate new concepts, verify, owner-approve | done |
| 10 | Adjustable pace — intensity sets daily new-concept volume + "Keep going" | done |
| 11 | Prerequisite-gated unlocking — concepts unlock only on proven foundations | done |
| 12 | Per-user FSRS tuning once there's enough review history | next |

**Growing a course** (`/grow`, from Settings): with AI on, the system proposes a brand-new concept that builds on what's mastered, then an independent **verification pass** adversarially checks it (recomputes finance numbers; checks reading level + theology for kid packs). Nothing reaches a learner until the **owner approves** it — so a child never sees AI-generated content a parent hasn't signed off on. The generation/verification prompts are red-teamed (`src/ai/genPrompts.ts`).

**Your pace, your call.** The intensity dial (Gentle / Steady / Intense) now sets how many brand-new concepts you take on each day — roughly 3 / 6 / 10 — not just the retention target. Whole concepts are taught together (lesson → its questions) so the pace is measured in *ideas*, not loose cards. Finished today's set and want more? **Keep going** pulls the next batch of new concepts on demand, as many rounds as you like — while due reviews stay FSRS-scheduled, because the spacing science decides those, not you. Kid profiles keep a single, protective, finite session.

**Foundations before floors — and no cramming the gate.** A new concept only unlocks once *every* prerequisite is a **proven foundation**, and "proven" deliberately isn't "passed a quiz": it means mastered (BKT) *and* recalled correctly on at least two different days, so a foundation can't be crammed open in one sitting. To keep that from stalling a daily learner, freshly-learned concepts come back on a short ~1-day step (successive relearning) and confirm on your next visit, then graduate to full FSRS spacing — so depth paces itself across days while breadth stays unlimited. The Progress map shows what's locked and what unlocks it; the home screen, when you're caught up but gated, says so honestly ("the next ideas unlock as what you've learned proves it stuck"). None of this is a memorize → test → repeat treadmill: it's understanding, demonstrated, that has to hold over time before you build on it.

The kid path (for `child` profiles) swaps self-rating for **objectively graded tap-the-answer questions** (so a child can't fake mastery), reads every card aloud, and uses a first-grade-level UI. A **System dashboard** (`/system`, reachable from Settings) shows the whole iceberg, live counts, the FSRS spacing curve, and the live knowledge graph — built to demo the system to someone.

The scheduling core is real: [`src/engine/fsrs.ts`](src/engine/fsrs.ts) implements the FSRS-6 DSR model (forgetting curve, stability/difficulty updates, retention-targeted intervals) and [`src/engine/bkt.ts`](src/engine/bkt.ts) tracks per-concept mastery, both covered by unit tests (`npm test`). The plain-language intensity dial maps to a desired-retention target, and the prerequisite graph gates new concepts on proven foundations ([`src/engine/realEngine.ts`](src/engine/realEngine.ts)). Still ahead: per-user FSRS optimization once there's enough review history, and optional AI item generation/grading under the guardrails in [`docs/ENGINE_SPEC.md`](docs/ENGINE_SPEC.md).

## Run it locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build to dist/
```

Everything is local-first: no backend, no accounts, no API key required. Data lives in your browser. The app is a Vite + React + TypeScript single-page app; the learning engine is plain TypeScript in `src/engine/`.

## License

[MIT](LICENSE) — do anything you want with it.
