# LearningOS — engine spec

The buildable reference for the part under the waterline. Grounded in the research summary the project started from (retrieval practice, spacing, interleaving, FSRS, BKT, successive relearning, cognitive load, conceptual change). This is what Phase 4 implements and wires beneath the Claude Design UI.

The guiding constraint: the engine decides *what* to surface, never *how* it looks. It outputs the data shapes in [`DESIGN_HANDOFF.md`](DESIGN_HANDOFF.md)'s data contract, and the UI renders them. No engine number ever reaches a screen un-translated.

## Modules

1. **Item store** — the canonical, source-grounded items and their content.
2. **Knowledge graph** — concepts and prerequisite edges; powers sequencing and unlocking.
3. **Scheduler (FSRS-6)** — per-item Stability / Difficulty / Retrievability and due dates; desired-retention config; interleaving and batching policy.
4. **Mastery engine (BKT)** — per-concept mastery probability layered with the successive-relearning criterion; gates advancement and graph unlocking.
5. **Session orchestrator** — assembles each day's finite session honoring due dates, interleaving, batching, difficulty tuning, and load.
6. **Question generator (optional, AI)** — RAG-grounded generation of novel problem instances and varied-Bloom items; deterministic tools for all computation.
7. **Evaluation engine (optional, AI)** — rubric grading of open answers + a verification pass; deterministic checkers for any numeric/finance computation; misconception detection.
8. **Reflection / metacognition** — brain-dump capture, hole-poking, confidence judgments, calibration.
9. **Learner state** — review history, mastery, calibration, daily load.

The first thing to build and validate in isolation is the **scheduler + mastery core (3, 4, 5)** with a hand-authored graph. Everything else layers on top. AI (6, 7) is last and optional.

## Defaults (start here, tune with data)

- **Desired retention:** 0.90 default. 0.85 under heavy load, 0.95 before a high-stakes event. Exposed to the user only as a plain-language intensity dial.
- **FSRS:** version 6 (21 parameters). Ship with the published default weights; switch to per-user optimization once a profile has ~1,000+ reviews. Optimize per-pack where content types differ.
- **First spaced review:** roughly 10–20% of the target retention horizon.
- **New-item batch size:** ~5, gated by mastery before the next batch. Tune down for high-element-interactivity material.
- **Successive-relearning criterion:** 3 correct recalls initially, then relearn 3× across widely spaced sessions. This is the mastery layer on top of FSRS.
- **BKT mastery threshold:** 0.95 to unlock dependents. Constrain slip and guess ≤ 0.5.
- **Difficulty / success-rate floor:** keep the learner's success rate roughly in the 70–85% band during practice — productive struggle without quitting. This bounds every difficulty knob.
- **Feedback:** immediate during acquisition and error correction; optionally delayed once an item's stability is high.

## Item types and what a "review" means

Item types (see the data contract): `fact`, `cloze`, `concept-explanation`, `worked-example`, `application`, `refutation`.

A successful review is a **retrieval event**, never passive re-reading. For an `application` item, success = solving a *novel* instance of that problem type (procedurally or AI generated), not recalling a memorized answer. Each item carries its own FSRS state; concepts carry BKT mastery plus the relearning counter.

## The pedagogical loop

1. **Encode** a new concept on the outer fringe: worked example(s) + multiple representations; surface and refute its known misconceptions; minimal extraneous load.
2. **Self-explain:** prompt the learner for "why," predict before reveal.
3. **Retrieve:** production-format question + a novel application instance; immediate corrective feedback.
4. **Reach criterion:** 3 correct recalls in-session; batches of ~5.
5. **Space:** FSRS schedules each item; the concept re-enters across ≥3 spaced sessions.
6. **Interleave:** once encoded, mix confusable concepts so the learner must *select* the right approach (this is where discrimination is learned). Keep brand-new high-interactivity material blocked until a schema forms.
7. **Reflect:** end-of-session brain dump → hole-poking → confidence judgments.
8. **Assess & advance:** unlock dependents when BKT ≥ 0.95 AND the relearning criterion is met across spaced sessions AND transfer items pass. Then raise difficulty / fade guidance.

## AI guardrails (non-negotiable, and AI is off by default)

1. **Grounding (RAG):** every generated item and feedback is grounded in vetted pack source material with citations. No ungrounded factual generation for canonical content.
2. **Deterministic computation:** all numbers (e.g. Greeks, CAGR, volatility drag) are computed by real code, never the model.
3. **Verification pass:** a second check validates answer/explanation consistency and flags errors before anything reaches the learner.
4. **Human-authored canon:** packs define the truth. AI is for *variation and scale* (novel instances of an established type) and for grading, calibrated against a human-graded gold set. Low-confidence or high-stakes grades escalate.

## Packs (the domain-agnostic content layer)

A pack is plain, versioned content: concepts (with prerequisite edges and known misconceptions), items, source references, and generation templates for novel instances. The engine never hard-codes a domain.

Two seed packs to prove the model:

- **Trading Foundations** — the spine: stats → arithmetic vs. geometric returns → CAGR → volatility drag → rebalancing bonus; microstructure → market-maker dynamics; payoff diagrams → Black–Scholes intuition → first-order Greeks → second-order Greeks → multi-leg structures → 0DTE. Each node carries worked examples, refutation items for its misconceptions, application problems, and synthesis items connecting nodes. All numbers checked deterministically.
- **Business for Kids** — the same machinery, child-level content and tone, proving one engine serves a 7-year-old and a fund manager with no separate mode.

## What to validate before trusting it

- Scheduler quality: log-loss of FSRS predictions on held-out reviews; defer per-user optimization if it doesn't beat defaults on the real population.
- Grading quality: agreement (kappa) between AI grading and a human gold set; if it's low, keep grading human/deterministic and restrict AI to generation.
- Difficulty band: if completion or retention drops, the band is too high — lower the success-rate floor or retention target.

## Honest caveats

Most foundational effects come from verbal/math materials, not elite finance skill; transfer is plausible, not proven. The "fewer reviews" FSRS efficiency figure is from simulation; the prediction-accuracy edge over SM-2 is well established. Expanding-vs-fixed spacing is genuinely unresolved. Interleaving helps for discrimination, not universally. Misconceptions are never fully erased — plan for relapse and ongoing re-checks. Prerequisite sequencing helps but isn't sufficient alone; it only pays off paired with the high-utility mechanisms above.
