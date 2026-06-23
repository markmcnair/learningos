import type { Grade, Intensity, Item, MasterySignal } from "../data/types";
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

const MAX_ITEMS = 12;

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

  buildTodaySession({ profile, concepts, items, date }: BuildSessionInput): PlannedSession {
    const activeConceptIds = new Set(
      concepts.filter((c) => profile.activePackIds.includes(c.packId)).map((c) => c.id),
    );
    const masteryById = new Map(concepts.map((c) => [c.id, c.mastery]));
    const inScope = items.filter((i) => activeConceptIds.has(i.conceptId));

    // Items FSRS says are due (or have never been scheduled = fresh review).
    const due = inScope.filter((i) => i.scheduling?.due && i.scheduling.due <= date);

    // Gently introduce teaching items from concepts not yet solid.
    const toLearn = inScope.filter(
      (i) =>
        !i.scheduling?.due &&
        masteryById.get(i.conceptId) !== "solid" &&
        (i.type === "concept-explanation" || i.type === "worked-example" || i.type === "cloze"),
    );

    const planned = interleaveByConcept([...due, ...toLearn.slice(0, 4)]).slice(0, MAX_ITEMS);
    const estMinutes = Math.min(20, Math.max(10, Math.round(planned.length * 1.4)));
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

    const interval = nextIntervalDays(fsrsState.stability, retention);
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

    const prevP = concept.bktP ?? pFromSignal(concept.mastery);
    const nextP = bktUpdate(prevP, isCorrect(grade));
    const newConcept = {
      ...concept,
      bktP: nextP,
      mastery: signalFromP(nextP),
      relearnReps: isCorrect(grade) ? (concept.relearnReps ?? 0) + 1 : 0,
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
