import { describe, expect, it } from "vitest";
import { bktUpdate, MASTERY_THRESHOLD, pFromSignal, signalFromP } from "./bkt";

describe("BKT update", () => {
  it("raises mastery probability after a correct answer", () => {
    const before = 0.3;
    expect(bktUpdate(before, true)).toBeGreaterThan(before);
  });

  it("lowers posterior mastery after an incorrect answer", () => {
    // The learn-transition can nudge upward, but the correct vs incorrect
    // posterior ordering must always hold.
    expect(bktUpdate(0.5, false)).toBeLessThan(bktUpdate(0.5, true));
  });

  it("keeps probability within [0, 1]", () => {
    let p = 0.25;
    for (let i = 0; i < 100; i++) p = bktUpdate(p, true);
    expect(p).toBeGreaterThanOrEqual(0);
    expect(p).toBeLessThanOrEqual(1);
  });

  it("converges toward mastery under repeated correct answers", () => {
    let p = 0.25;
    for (let i = 0; i < 20; i++) p = bktUpdate(p, true);
    expect(p).toBeGreaterThan(MASTERY_THRESHOLD);
  });
});

describe("BKT signal mapping", () => {
  it("maps high probability to solid and low to new", () => {
    expect(signalFromP(0.97)).toBe("solid");
    expect(signalFromP(0.7)).toBe("getting-it");
    expect(signalFromP(0.2)).toBe("new");
  });

  it("round-trips a seeded signal back to the same signal", () => {
    expect(signalFromP(pFromSignal("solid"))).toBe("solid");
    expect(signalFromP(pFromSignal("getting-it"))).toBe("getting-it");
    expect(signalFromP(pFromSignal("new"))).toBe("new");
  });
});
