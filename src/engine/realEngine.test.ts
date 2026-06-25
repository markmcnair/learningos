import { describe, expect, it } from "vitest";
import type { Concept, Item, Profile } from "../data/types";
import { engine } from "./realEngine";

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
