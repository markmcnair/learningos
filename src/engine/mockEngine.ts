import type { Grade, Item, MasterySignal } from "../data/types";
import type {
  BuildSessionInput,
  LearningEngine,
  PlannedSession,
  SummarizeInput,
} from "./types";

// A deliberately simple stand-in for FSRS-6 + BKT. It is good enough to make the
// daily loop feel real, and it keeps every decision behind the LearningEngine
// interface so the real engine is a drop-in replacement.

const MAX_ITEMS = 12;

function isDue(item: Item, date: string): boolean {
  return !!item.scheduling?.due && item.scheduling.due <= date;
}

// Round-robin across concepts so confusable ideas interleave instead of blocking.
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

export const mockEngine: LearningEngine = {
  buildTodaySession({ profile, concepts, items, date }: BuildSessionInput): PlannedSession {
    const activeConceptIds = new Set(
      concepts.filter((c) => profile.activePackIds.includes(c.packId)).map((c) => c.id),
    );
    const inScope = items.filter((i) => activeConceptIds.has(i.conceptId));

    // Due reviews first — the spaced-repetition heartbeat.
    const due = inScope.filter((i) => isDue(i, date));

    // Then gently introduce un-mastered teaching items not already due.
    const conceptMastery = new Map(concepts.map((c) => [c.id, c.mastery]));
    const toLearn = inScope.filter(
      (i) =>
        !isDue(i, date) &&
        conceptMastery.get(i.conceptId) !== "solid" &&
        (i.type === "concept-explanation" || i.type === "worked-example" || i.type === "cloze"),
    );

    const planned = interleaveByConcept([...due, ...toLearn.slice(0, 4)]).slice(0, MAX_ITEMS);
    const estMinutes = Math.min(20, Math.max(10, Math.round(planned.length * 1.4)));
    return { itemIds: planned.map((i) => i.id), estMinutes };
  },

  gradeToMastery(current: MasterySignal, grade: Grade): MasterySignal {
    const up: Record<MasterySignal, MasterySignal> = {
      new: "getting-it",
      "getting-it": "solid",
      solid: "solid",
    };
    const down: Record<MasterySignal, MasterySignal> = {
      solid: "getting-it",
      "getting-it": "new",
      new: "new",
    };
    if (grade === "missed") return down[current];
    if (grade === "tough") return current;
    return up[current]; // got-it / easy
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
