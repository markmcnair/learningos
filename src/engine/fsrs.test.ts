import { describe, expect, it } from "vitest";
import {
  DEFAULT_W,
  initCard,
  intervalForRetention,
  nextIntervalDays,
  retrievability,
  reviewCard,
} from "./fsrs";

describe("FSRS forgetting curve", () => {
  it("is 90% retrievable after exactly one stability period", () => {
    const S = 12;
    expect(retrievability(S, S)).toBeCloseTo(0.9, 6);
  });

  it("is fully retrievable at zero elapsed time", () => {
    expect(retrievability(0, 10)).toBeCloseTo(1, 6);
  });

  it("decays monotonically as time passes", () => {
    const S = 10;
    expect(retrievability(1, S)).toBeGreaterThan(retrievability(5, S));
    expect(retrievability(5, S)).toBeGreaterThan(retrievability(20, S));
  });
});

describe("FSRS intervals", () => {
  it("schedules the interval equal to stability at 90% target", () => {
    const S = 15;
    expect(intervalForRetention(S, 0.9)).toBeCloseTo(S, 6);
  });

  it("asks for shorter intervals at higher desired retention", () => {
    const S = 30;
    expect(intervalForRetention(S, 0.95)).toBeLessThan(intervalForRetention(S, 0.85));
  });

  it("never returns an interval below one day", () => {
    expect(nextIntervalDays(0.2, 0.95)).toBeGreaterThanOrEqual(1);
  });
});

describe("FSRS state updates", () => {
  it("initialises difficulty within 1..10 for every grade", () => {
    for (const g of [1, 2, 3, 4] as const) {
      const { difficulty } = initCard(g);
      expect(difficulty).toBeGreaterThanOrEqual(1);
      expect(difficulty).toBeLessThanOrEqual(10);
    }
  });

  it("grows stability on a successful recall", () => {
    const start = initCard(3);
    const after = reviewCard(start, 3, start.stability);
    expect(after.stability).toBeGreaterThan(start.stability);
  });

  it("does not raise stability above the prior value on a lapse", () => {
    const start = { stability: 40, difficulty: 5 };
    const after = reviewCard(start, 1, 40);
    expect(after.stability).toBeLessThanOrEqual(start.stability);
  });

  it("keeps difficulty in range after many hard reviews", () => {
    let state = initCard(3);
    for (let i = 0; i < 50; i++) state = reviewCard(state, 1, state.stability);
    expect(state.difficulty).toBeGreaterThanOrEqual(1);
    expect(state.difficulty).toBeLessThanOrEqual(10);
  });

  it("uses 19 default weights (FSRS-5)", () => {
    expect(DEFAULT_W).toHaveLength(19);
  });
});
