import type { Concept, Grade, ID, Intensity, Item, MasterySignal } from "../data/types";
import { bktUpdate, pFromSignal, signalFromP } from "./bkt";
import { addDays, daysBetween } from "./dates";
import { initCard, nextIntervalDays, reviewCard, type FsrsGrade } from "./fsrs";
import type {
  ApplyReviewInput,
  BuildSessionInput,
  LearningEngine,
  PlannedSession,
  SummarizeInput,
} from "./types";

// How many BRAND-NEW concepts to introduce in a day, by intensity. This is the
// "pace" dial: it controls how fast you take on new material. Due reviews are
// separate and always honored — the spacing science decides those, not you.
// A "keep going" round pulls another batch this size, on demand.
const NEW_CONCEPTS_PER_DAY: Record<Intensity, number> = {
  gentle: 3,
  steady: 6,
  intense: 10,
};

// Safety valve: if you return after a long break, don't get buried — do the most
// overdue reviews today, the rest stay due and surface tomorrow.
const MAX_REVIEWS_PER_DAY = 40;

// A prerequisite must be a PROVEN FOUNDATION before the concepts that depend on
// it unlock: mastered (BKT solid) AND that mastery has survived spacing —
// recalled correctly on at least this many distinct days. The second half is
// what keeps this honest learning and not "cram three answers, unlock the next
// thing": you can't open the next floor until the one below it has set.
export const FOUNDATION_PROVEN_DAYS = 2;

// Successive-relearning step (days). Newly-learned concepts revisit on roughly
// this cadence until they're proven, so confirmation lands on the next visit
// instead of after a long FSRS interval.
const RELEARN_STEP_DAYS = 1;

export function isProvenFoundation(c: Concept | undefined): boolean {
  return !!c && c.mastery === "solid" && (c.provenDays ?? 0) >= FOUNDATION_PROVEN_DAYS;
}

// The prerequisites of `concept` that are NOT yet proven foundations — i.e. the
// reasons it's still locked. Empty means it's unlocked and ready to learn.
export function unmetPrerequisites(
  concept: Concept,
  byId: Map<ID, Concept>,
): Concept[] {
  return concept.prerequisiteIds
    .map((id) => byId.get(id))
    .filter((p): p is Concept => !!p && !isProvenFoundation(p));
}

export function prerequisitesMet(concept: Concept, byId: Map<ID, Concept>): boolean {
  return concept.prerequisiteIds.every((id) => isProvenFoundation(byId.get(id)));
}

const GRADE_TO_FSRS: Record<Grade, FsrsGrade> = {
  missed: 1,
  tough: 2,
  "got-it": 3,
  easy: 4,
};

// "again" is the only outright failure; hard/good/easy all count as recall.
const isCorrect = (grade: Grade) => grade !== "missed";

const RETENTION: Record<Intensity, number> = {
  gentle: 0.85,
  steady: 0.9,
  intense: 0.95,
};

function interleaveByConcept(items: Item[]): Item[] {
  const byConcept = new Map<string, Item[]>();
  for (const item of items) {
    const bucket = byConcept.get(item.conceptId) ?? [];
    bucket.push(item);
    byConcept.set(item.conceptId, bucket);
  }
  const buckets = [...byConcept.values()];
  const out: Item[] = [];
  let added = true;
  while (added) {
    added = false;
    for (const bucket of buckets) {
      const next = bucket.shift();
      if (next) {
        out.push(next);
        added = true;
      }
    }
  }
  return out;
}

export const engine: LearningEngine = {
  retentionFor(intensity: Intensity): number {
    return RETENTION[intensity];
  },

  buildTodaySession({ profile, concepts, items, date, mode = "daily" }: BuildSessionInput): PlannedSession {
    const activeConceptIds = new Set(
      concepts.filter((c) => profile.activePackIds.includes(c.packId)).map((c) => c.id),
    );
    const masteryById = new Map(concepts.map((c) => [c.id, c.mastery]));
    const inScope = items.filter((i) => activeConceptIds.has(i.conceptId));

    // Due reviews interleave (discrimination among confusable, already-encoded
    // ideas) — the spaced-repetition heartbeat. An "extra" round skips them; the
    // daily session already cleared them and you're here for new ground.
    const due =
      mode === "extra"
        ? []
        : interleaveByConcept(
            inScope.filter((i) => i.scheduling?.due && i.scheduling.due <= date),
          ).slice(0, MAX_REVIEWS_PER_DAY);

    // Brand-new concepts are taught BLOCKED, concept by concept (teach → its
    // questions → next concept), never scattered — the science says hold off on
    // interleaving until a schema forms. Teaching items come before practice.
    // We take whole concepts up to the day's budget, so the pace is measured in
    // ideas, not loose questions.
    //
    // "Fresh" is judged per CONCEPT, not per item: a concept is new only if NONE
    // of its items has ever been scheduled. (Teaching cards advance without a
    // schedule, so a per-item test would let an already-taught concept's lesson
    // leak back in — and a "keep going" round would re-teach what you just did.)
    const typeRank = (t: Item["type"]) =>
      t === "concept-explanation" || t === "worked-example" ? 0 : t === "cloze" ? 1 : 2;
    const conceptOrder = concepts.filter((c) => activeConceptIds.has(c.id)).map((c) => c.id);
    const startedConceptIds = new Set(
      inScope.filter((i) => i.scheduling?.due).map((i) => i.conceptId),
    );
    // PREREQUISITE GATE: a brand-new concept is only introduced once every one
    // of its prerequisites is a proven foundation (mastered AND survived a day's
    // spacing). You never build on a foundation you haven't shown actually holds.
    const byId = new Map(concepts.map((c) => [c.id, c]));
    const freshConceptIds = conceptOrder.filter((cid) => {
      const c = byId.get(cid);
      return (
        !!c &&
        !startedConceptIds.has(cid) &&
        masteryById.get(cid) !== "solid" &&
        prerequisitesMet(c, byId)
      );
    });
    const budget = NEW_CONCEPTS_PER_DAY[profile.intensity];
    const introduce: Item[] = [];
    for (const cid of freshConceptIds.slice(0, budget)) {
      const forConcept = inScope
        .filter((i) => i.conceptId === cid)
        .sort((a, b) => typeRank(a.type) - typeRank(b.type));
      introduce.push(...forConcept);
    }

    const planned = [...due, ...introduce];
    const estMinutes = Math.max(5, Math.round(planned.length * 1.3));
    return { itemIds: planned.map((i) => i.id), estMinutes };
  },

  applyReview({ item, concept, grade, date, retention }: ApplyReviewInput) {
    const g = GRADE_TO_FSRS[grade];
    const sched = item.scheduling;

    const fsrsState =
      sched?.stability != null && sched.lastReview
        ? reviewCard(
            { stability: sched.stability, difficulty: sched.difficulty ?? 5 },
            g,
            daysBetween(sched.lastReview, date),
          )
        : initCard(g);

    const correct = isCorrect(grade);
    const prevP = concept.bktP ?? pFromSignal(concept.mastery);
    const nextP = bktUpdate(prevP, correct);
    // Count a NEW proven day only when this is the first correct recall today —
    // so a single session's repeats can't fake durability. A lapse breaks the
    // streak (the foundation didn't hold), resetting the count.
    const countsNewDay = correct && concept.lastProvenDay !== date;
    const newConcept: Concept = {
      ...concept,
      bktP: nextP,
      mastery: signalFromP(nextP),
      relearnReps: correct ? (concept.relearnReps ?? 0) + 1 : 0,
      provenDays: correct ? (concept.provenDays ?? 0) + (countsNewDay ? 1 : 0) : 0,
      lastProvenDay: correct ? date : undefined,
    };

    // Successive relearning: until a concept is a proven foundation, keep its
    // items on a short ~1-day step so they come back on the learner's NEXT
    // visit and durability gets confirmed at their own cadence — not after a
    // long FSRS gap (which would strand a daily learner with a locked next
    // concept and empty days). Once proven, graduate to full FSRS spacing.
    const fsrsInterval = nextIntervalDays(fsrsState.stability, retention);
    const proven = (newConcept.provenDays ?? 0) >= FOUNDATION_PROVEN_DAYS;
    const interval = correct && !proven ? Math.min(fsrsInterval, RELEARN_STEP_DAYS) : fsrsInterval;
    const newItem: Item = {
      ...item,
      scheduling: {
        due: addDays(date, interval),
        stability: fsrsState.stability,
        difficulty: fsrsState.difficulty,
        lastReview: date,
        reps: (sched?.reps ?? 0) + 1,
        lapses: (sched?.lapses ?? 0) + (grade === "missed" ? 1 : 0),
        learningState: grade === "missed" ? "relearning" : "review",
      },
    };

    return { item: newItem, concept: newConcept };
  },

  deriveSignal(concept): MasterySignal {
    return concept.bktP != null ? signalFromP(concept.bktP) : concept.mastery;
  },

  summarizeSession({ itemsDone, positiveCount, prevStreak, alreadyCountedToday }: SummarizeInput) {
    const newStreakDays = alreadyCountedToday ? prevStreak : prevStreak + 1;
    let headline: string;
    if (itemsDone === 0) {
      headline = "You showed up — that's the habit.";
    } else if (positiveCount === 0) {
      headline = "Tricky one today. Showing up is the win.";
    } else if (positiveCount === 1) {
      headline = "You moved 1 idea closer to solid.";
    } else {
      headline = `You moved ${positiveCount} ideas closer to solid.`;
    }
    return { itemsDone, headline, newStreakDays };
  },
};
