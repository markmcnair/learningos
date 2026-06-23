// FSRS-6 — Free Spaced Repetition Scheduler.
// A faithful TypeScript implementation of the DSR (Difficulty, Stability,
// Retrievability) model. This is the real scheduling core; it predicts when an
// item is about to be forgotten and schedules the review for exactly then.
//
// Forgetting curve:  R(t,S) = (1 + FACTOR · t/S) ^ DECAY,
//   with DECAY = -0.5 and FACTOR = 0.9^(1/DECAY) - 1 = 19/81, so that R(S,S) = 0.9.
// Interval for a target retention r:  I(r,S) = (S/FACTOR) · (r^(1/DECAY) - 1),
//   so I(0.9, S) = S.

export const DECAY = -0.5;
export const FACTOR = 19 / 81; // 0.9^(1/DECAY) - 1

// FSRS-5 default weights (w0..w18), trained on the open anki-revlogs dataset.
export const DEFAULT_W: readonly number[] = [
  0.40255, 1.18385, 3.173, 15.69105, 7.1949, 0.5345, 1.4604, 0.0046, 1.54575, 0.1192, 1.01925,
  1.9395, 0.11, 0.29605, 2.2698, 0.2315, 2.9898, 0.51655, 0.6621,
];

// 1 = again (lapse), 2 = hard, 3 = good, 4 = easy.
export type FsrsGrade = 1 | 2 | 3 | 4;

export interface FsrsState {
  stability: number; // days for retrievability to fall from 100% to 90%
  difficulty: number; // 1..10
}

const clampD = (d: number) => Math.min(10, Math.max(1, d));
const clampS = (s: number) => Math.max(0.1, s);

export function retrievability(elapsedDays: number, stability: number): number {
  return Math.pow(1 + (FACTOR * Math.max(0, elapsedDays)) / stability, DECAY);
}

export function intervalForRetention(stability: number, requestRetention: number): number {
  return (stability / FACTOR) * (Math.pow(requestRetention, 1 / DECAY) - 1);
}

export function nextIntervalDays(stability: number, requestRetention: number): number {
  return Math.max(1, Math.round(intervalForRetention(stability, requestRetention)));
}

function initialDifficulty(g: FsrsGrade, w: readonly number[]): number {
  return clampD(w[4] - Math.exp(w[5] * (g - 1)) + 1);
}

function initialStability(g: FsrsGrade, w: readonly number[]): number {
  return clampS(w[g - 1]);
}

function nextDifficulty(d: number, g: FsrsGrade, w: readonly number[]): number {
  const delta = -w[6] * (g - 3);
  const damped = d + delta * ((10 - d) / 9); // linear damping
  const reversion = w[7] * initialDifficulty(4, w) + (1 - w[7]) * damped; // toward easy
  return clampD(reversion);
}

function stabilityAfterRecall(
  d: number,
  s: number,
  r: number,
  g: FsrsGrade,
  w: readonly number[],
): number {
  const hardPenalty = g === 2 ? w[15] : 1;
  const easyBonus = g === 4 ? w[16] : 1;
  const inc =
    Math.exp(w[8]) *
    (11 - d) *
    Math.pow(s, -w[9]) *
    (Math.exp(w[10] * (1 - r)) - 1) *
    hardPenalty *
    easyBonus;
  return clampS(s * (1 + inc));
}

function stabilityAfterLapse(d: number, s: number, r: number, w: readonly number[]): number {
  const sf =
    w[11] * Math.pow(d, -w[12]) * (Math.pow(s + 1, w[13]) - 1) * Math.exp(w[14] * (1 - r));
  // Post-lapse stability never exceeds the pre-lapse value.
  return clampS(Math.min(sf, s));
}

// First-ever review of a brand-new item.
export function initCard(g: FsrsGrade, w: readonly number[] = DEFAULT_W): FsrsState {
  return { stability: initialStability(g, w), difficulty: initialDifficulty(g, w) };
}

// A subsequent review, given how many days elapsed since the last one.
export function reviewCard(
  state: FsrsState,
  g: FsrsGrade,
  elapsedDays: number,
  w: readonly number[] = DEFAULT_W,
): FsrsState {
  const r = retrievability(elapsedDays, state.stability);
  const difficulty = nextDifficulty(state.difficulty, g, w);
  const stability =
    g === 1
      ? stabilityAfterLapse(state.difficulty, state.stability, r, w)
      : stabilityAfterRecall(state.difficulty, state.stability, r, g, w);
  return { stability, difficulty };
}
