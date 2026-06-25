import type {
  Concept,
  Grade,
  ID,
  Intensity,
  ISODate,
  Item,
  MasterySignal,
  Profile,
  SessionSummary,
} from "../data/types";

// The seam. The store talks only to this interface, so the scheduling/mastery
// implementation behind it (FSRS-6 + BKT + the prerequisite graph) can change
// without the UI knowing.

export interface BuildSessionInput {
  profile: Profile;
  concepts: Concept[]; // all concepts for the profile's active packs
  items: Item[]; // all items for those concepts
  date: ISODate;
  // "daily" = due reviews + the day's new-concept budget (intensity-sized).
  // "extra" = a learner-pulled "keep going" round: only the next new concepts,
  // no reviews. Defaults to "daily".
  mode?: "daily" | "extra";
}

export interface PlannedSession {
  itemIds: ID[]; // the ordered, interleaved, finite path for today
  estMinutes: number; // 10–20
}

export interface ApplyReviewInput {
  item: Item;
  concept: Concept;
  grade: Grade;
  date: ISODate;
  retention: number; // desired retention target for scheduling
}

export interface SummarizeInput {
  itemsDone: number;
  positiveCount: number; // got-it / easy
  prevStreak: number;
  alreadyCountedToday: boolean;
}

export interface LearningEngine {
  // Desired-retention target behind the plain-language intensity dial.
  retentionFor(intensity: Intensity): number;
  // Which items, in which order, for today's finite session.
  buildTodaySession(input: BuildSessionInput): PlannedSession;
  // Update one item's schedule (FSRS) and its concept's mastery (BKT).
  applyReview(input: ApplyReviewInput): { item: Item; concept: Concept };
  // The surface signal for a concept, from its mastery probability.
  deriveSignal(concept: Concept): MasterySignal;
  // The plain-language recap on the "done" screen.
  summarizeSession(input: SummarizeInput): SessionSummary;
}
