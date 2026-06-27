import { describe, expect, it } from "vitest";
import type { Concept, Item, Profile } from "../data/types";
import { daysBetween } from "./dates";
import { engine, unmetPrerequisites } from "./realEngine";

// Minimal fixtures: one pack, N concepts, each with a teaching card + one question.
const PACK = "p1";

function profile(intensity: Profile["intensity"]): Profile {
  return {
    id: "u1",
    displayName: "Test",
    avatarSeed: "ember",
    readingLevel: "general",
    activePackIds: [PACK],
    streakDays: 0,
    lastCompletedDate: null,
    aiEnabled: false,
    intensity,
    createdAt: "2026-06-25T00:00:00.000Z",
  };
}

function concept(n: number): Concept {
  return {
    id: `c${n}`,
    packId: PACK,
    title: `Concept ${n}`,
    prerequisiteIds: [],
    itemIds: [`c${n}-teach`, `c${n}-q`],
    mastery: "new",
  };
}

function items(n: number, scheduledDue?: string): Item[] {
  const sched = scheduledDue ? { scheduling: { due: scheduledDue, lastReview: scheduledDue } } : {};
  return [
    { id: `c${n}-teach`, conceptId: `c${n}`, type: "concept-explanation", prompt: "t", ...sched },
    { id: `c${n}-q`, conceptId: `c${n}`, type: "application", prompt: "q", answer: "a", ...sched },
  ];
}

// Realistic "already taught" concept: its teaching card was viewed (never
// scheduled), only the graded question carries a schedule.
function taughtItems(n: number, due: string): Item[] {
  return [
    { id: `c${n}-teach`, conceptId: `c${n}`, type: "concept-explanation", prompt: "t" },
    {
      id: `c${n}-q`,
      conceptId: `c${n}`,
      type: "application",
      prompt: "q",
      answer: "a",
      scheduling: { due, lastReview: due },
    },
  ];
}

const N = 8;
const CONCEPTS = Array.from({ length: N }, (_, i) => concept(i + 1));
const ALL_NEW = CONCEPTS.flatMap((_, i) => items(i + 1));
const DATE = "2026-06-25";

describe("buildTodaySession — intensity sets the new-concept budget", () => {
  it("gentle introduces 3 brand-new concepts", () => {
    const plan = engine.buildTodaySession({
      profile: profile("gentle"),
      concepts: CONCEPTS,
      items: ALL_NEW,
      date: DATE,
    });
    expect(plan.itemIds).toHaveLength(3 * 2); // 3 concepts × 2 items each
  });

  it("steady introduces more than gentle, intense more than steady", () => {
    const count = (intensity: Profile["intensity"]) =>
      engine.buildTodaySession({ profile: profile(intensity), concepts: CONCEPTS, items: ALL_NEW, date: DATE })
        .itemIds.length;
    expect(count("steady")).toBeGreaterThan(count("gentle"));
    // Only 8 concepts exist, so intense (budget 10) is capped at all 8.
    expect(count("intense")).toBe(N * 2);
  });

  it("teaching card comes before the question within a concept", () => {
    const plan = engine.buildTodaySession({
      profile: profile("gentle"),
      concepts: CONCEPTS,
      items: ALL_NEW,
      date: DATE,
    });
    expect(plan.itemIds.indexOf("c1-teach")).toBeLessThan(plan.itemIds.indexOf("c1-q"));
  });
});

describe("buildTodaySession — due reviews", () => {
  it("includes due reviews and puts them before new material", () => {
    // c1 is due (already taught), the rest are brand-new.
    const mixed = [
      ...items(1, "2026-06-20"),
      ...CONCEPTS.slice(1).flatMap((_, i) => items(i + 2)),
    ];
    const reviewed: Concept[] = CONCEPTS.map((c) =>
      c.id === "c1" ? { ...c, mastery: "getting-it" } : c,
    );
    const plan = engine.buildTodaySession({
      profile: profile("gentle"),
      concepts: reviewed,
      items: mixed,
      date: DATE,
    });
    expect(plan.itemIds).toContain("c1-q"); // the due item is scheduled today
    expect(plan.itemIds.indexOf("c1-q")).toBeLessThan(plan.itemIds.indexOf("c2-teach"));
  });
});

describe('buildTodaySession — "extra" round', () => {
  it("serves the NEXT untaught concepts and no reviews", () => {
    // c1..c6 taught today (only the question scheduled; teaching card was viewed
    // but never scheduled). c7,c8 still brand-new. This is the real-world shape
    // and the regression guard: a viewed-but-unscheduled teaching card must NOT
    // pull its already-taught concept back into a "keep going" round.
    const taught = [1, 2, 3, 4, 5, 6].flatMap((n) => taughtItems(n, DATE));
    const fresh = [7, 8].flatMap((n) => items(n));
    const partlyLearned: Concept[] = CONCEPTS.map((c) =>
      ["c1", "c2", "c3", "c4", "c5", "c6"].includes(c.id) ? { ...c, mastery: "getting-it" } : c,
    );
    const plan = engine.buildTodaySession({
      profile: profile("steady"),
      concepts: partlyLearned,
      items: [...taught, ...fresh],
      date: DATE,
      mode: "extra",
    });
    // Only the next new concepts (c7, c8) — nothing from c1..c6, not even their
    // unscheduled teaching cards.
    expect(new Set(plan.itemIds)).toEqual(new Set(["c7-teach", "c7-q", "c8-teach", "c8-q"]));
  });
});

describe("buildTodaySession — prerequisite gate", () => {
  const ROOT = (over: Partial<Concept> = {}): Concept => ({
    id: "root",
    packId: PACK,
    title: "Root",
    prerequisiteIds: [],
    itemIds: ["root-q"],
    mastery: "solid",
    ...over,
  });
  const DEP: Concept = {
    id: "dep",
    packId: PACK,
    title: "Dependent",
    prerequisiteIds: ["root"],
    itemIds: ["dep-teach", "dep-q"],
    mastery: "new",
  };
  const DEP_ITEMS: Item[] = [
    { id: "dep-teach", conceptId: "dep", type: "concept-explanation", prompt: "t" },
    { id: "dep-q", conceptId: "dep", type: "application", prompt: "q", answer: "a" },
  ];
  // root has a (due) review so the session isn't empty — its presence is incidental.
  const ROOT_ITEMS: Item[] = [
    {
      id: "root-q",
      conceptId: "root",
      type: "application",
      prompt: "q",
      answer: "a",
      scheduling: { due: "2026-06-20", lastReview: "2026-06-20" },
    },
  ];
  const plan = (concepts: Concept[]) =>
    engine.buildTodaySession({
      profile: profile("steady"),
      concepts,
      items: [...ROOT_ITEMS, ...DEP_ITEMS],
      date: "2026-06-25",
    });

  it("locks a concept whose prerequisite is mastered but crammed (only 1 proven day)", () => {
    const ids = plan([ROOT({ provenDays: 1 }), DEP]).itemIds;
    expect(ids).not.toContain("dep-teach");
    expect(ids).not.toContain("dep-q");
  });

  it("unlocks the concept once its prerequisite is a proven foundation (≥2 days)", () => {
    const ids = plan([ROOT({ provenDays: 2 }), DEP]).itemIds;
    expect(ids).toContain("dep-teach");
    expect(ids).toContain("dep-q");
  });

  it("locks a concept whose prerequisite isn't even mastered yet", () => {
    const ids = plan([ROOT({ mastery: "getting-it", provenDays: 9 }), DEP]).itemIds;
    expect(ids).not.toContain("dep-q");
  });

  it('"Keep going" (extra) pushes onto a MASTERED-but-not-yet-proven prerequisite that the daily session holds back', () => {
    // root is solid but only 1 proven day → a proven foundation needs 2.
    const concepts = [ROOT({ provenDays: 1 }), DEP];
    const items = [...ROOT_ITEMS, ...DEP_ITEMS];
    const daily = engine.buildTodaySession({
      profile: profile("steady"),
      concepts,
      items,
      date: "2026-06-25",
    });
    const extra = engine.buildTodaySession({
      profile: profile("steady"),
      concepts,
      items,
      date: "2026-06-25",
      mode: "extra",
    });
    expect(daily.itemIds).not.toContain("dep-q"); // strict daily holds it back
    expect(extra.itemIds).toContain("dep-q"); // Keep going pushes onto the mastered prereq
  });

  it("a child's extra round stays strict (no push onto unproven foundations)", () => {
    const kid: Profile = { ...profile("gentle"), readingLevel: "child" };
    const concepts = [ROOT({ provenDays: 1 }), DEP];
    const extra = engine.buildTodaySession({
      profile: kid,
      concepts,
      items: [...ROOT_ITEMS, ...DEP_ITEMS],
      date: "2026-06-25",
      mode: "extra",
    });
    expect(extra.itemIds).not.toContain("dep-q");
  });
});

describe("applyReview — successive relearning across days", () => {
  const ITEM: Item = { id: "x", conceptId: "k", type: "application", prompt: "q", answer: "a" };
  const CONCEPT: Concept = {
    id: "k",
    packId: PACK,
    title: "K",
    prerequisiteIds: [],
    itemIds: ["x"],
    mastery: "new",
  };
  const review = (item: Item, concept: Concept, date: string, grade: "got-it" | "missed") =>
    engine.applyReview({ item, concept, grade, date, retention: 0.9 });

  it("counts one proven day per distinct day, never per answer", () => {
    const r1 = review(ITEM, CONCEPT, "2026-06-25", "got-it");
    expect(r1.concept.provenDays).toBe(1);
    const r1b = review(r1.item, r1.concept, "2026-06-25", "got-it"); // same day again
    expect(r1b.concept.provenDays).toBe(1);
    const r2 = review(r1b.item, r1b.concept, "2026-06-26", "got-it"); // next day
    expect(r2.concept.provenDays).toBe(2);
  });

  it("a miss resets the proven-day streak", () => {
    const r1 = review(ITEM, CONCEPT, "2026-06-25", "got-it");
    const miss = review(r1.item, r1.concept, "2026-06-26", "missed");
    expect(miss.concept.provenDays).toBe(0);
  });

  it("holds a fresh concept on a short ~1-day step, then graduates to FSRS spacing", () => {
    const r1 = review(ITEM, CONCEPT, "2026-06-25", "got-it");
    expect(daysBetween("2026-06-25", r1.item.scheduling!.due)).toBeLessThanOrEqual(1); // not proven → short step
    const r2 = review(r1.item, r1.concept, "2026-06-26", "got-it");
    expect(r2.concept.provenDays).toBe(2); // now a proven foundation
    // Graduated → real FSRS spacing, well past the 1-day relearn cap (a collapse
    // to a flat ≤2-day interval would fail this).
    expect(daysBetween("2026-06-26", r2.item.scheduling!.due)).toBeGreaterThanOrEqual(3);
  });

  it("keeps a MISSED not-yet-proven item on the short step too (no empty next day)", () => {
    // got-it builds stability; a later miss must still come back next visit, not
    // jump to the longer FSRS lapse interval — otherwise a single wrong tap can
    // strand a learner with an empty, locked day.
    const r1 = review(ITEM, CONCEPT, "2026-06-25", "got-it");
    const miss = review(r1.item, r1.concept, "2026-06-26", "missed");
    expect(miss.concept.provenDays).toBe(0); // un-proven again
    expect(daysBetween("2026-06-26", miss.item.scheduling!.due)).toBeLessThanOrEqual(1);
  });
});

describe("summarizeSession — streak is consecutive days", () => {
  const base = { itemsDone: 5, positiveCount: 3, prevStreak: 7 };
  it("extends on the next day", () => {
    expect(engine.summarizeSession({ ...base, daysSinceLast: 1 }).newStreakDays).toBe(8);
  });
  it("leaves it unchanged for a second session the same day", () => {
    expect(engine.summarizeSession({ ...base, daysSinceLast: 0 }).newStreakDays).toBe(7);
  });
  it("resets to 1 after a missed day (a gap > 1)", () => {
    expect(engine.summarizeSession({ ...base, daysSinceLast: 3 }).newStreakDays).toBe(1);
  });
  it("starts at 1 on the very first completion", () => {
    expect(engine.summarizeSession({ ...base, prevStreak: 0, daysSinceLast: null }).newStreakDays).toBe(1);
  });
});

describe("buildTodaySession — a stale/missing prerequisite fails CLOSED", () => {
  it("locks a concept whose prerequisite id resolves to nothing, and surfaces it", () => {
    const orphan: Concept = {
      id: "orphan",
      packId: PACK,
      title: "Orphan",
      prerequisiteIds: ["ghost"], // no such concept
      itemIds: ["orphan-q"],
      mastery: "new",
    };
    const orphanItems: Item[] = [
      { id: "orphan-q", conceptId: "orphan", type: "application", prompt: "q", answer: "a" },
    ];
    const plan = engine.buildTodaySession({
      profile: profile("steady"),
      concepts: [orphan],
      items: orphanItems,
      date: "2026-06-25",
    });
    expect(plan.itemIds).not.toContain("orphan-q"); // locked, not silently unlocked
    // and the lock is reported (non-empty) so the UI can explain it
    expect(unmetPrerequisites(orphan, new Map([["orphan", orphan]])).length).toBe(1);
  });
});
