// Bayesian Knowledge Tracing — a per-concept hidden-Markov model of mastery.
// Four parameters: prior mastery (pL0), learn rate (pT), slip (pS, wrong despite
// knowing), guess (pG, right without knowing). It gives an interpretable
// probability that the learner has mastered a concept, which gates advancement.

import type { MasterySignal } from "../data/types";

export interface BktParams {
  pL0: number;
  pT: number;
  pS: number;
  pG: number;
}

// Sensible defaults; slip/guess constrained <= 0.5 to avoid degenerate models.
export const BKT_DEFAULTS: BktParams = { pL0: 0.25, pT: 0.15, pS: 0.1, pG: 0.2 };

export const MASTERY_THRESHOLD = 0.95;
const GETTING_IT_THRESHOLD = 0.6;

// One observation: posterior mastery after seeing a correct/incorrect response,
// then the learning transition.
export function bktUpdate(pL: number, correct: boolean, p: BktParams = BKT_DEFAULTS): number {
  const { pS, pG, pT } = p;
  const posterior = correct
    ? (pL * (1 - pS)) / (pL * (1 - pS) + (1 - pL) * pG)
    : (pL * pS) / (pL * pS + (1 - pL) * (1 - pG));
  const updated = posterior + (1 - posterior) * pT;
  return Math.min(1, Math.max(0, updated));
}

// Collapse the internal probability into the only thing the UI ever sees.
export function signalFromP(pL: number): MasterySignal {
  if (pL >= MASTERY_THRESHOLD) return "solid";
  if (pL >= GETTING_IT_THRESHOLD) return "getting-it";
  return "new";
}

// Seed a probability from a pack's hand-set signal, so first reviews don't jolt.
export function pFromSignal(signal: MasterySignal): number {
  if (signal === "solid") return 0.96;
  if (signal === "getting-it") return 0.7;
  return 0.3;
}
