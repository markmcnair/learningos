import type {
  Concept,
  Grade,
  ID,
  ISODate,
  Item,
  MasterySignal,
  Profile,
  Review,
  SessionSummary,
} from "../data/types";

// The seam. Everything below is what the real learning engine implements.
// Today a deterministic mock fills these in; tomorrow FSRS-6 (scheduling),
// BKT (mastery), and the prerequisite graph (sequencing) take over — without
// the UI knowing the difference.

export interface BuildSessionInput {
  profile: Profile;
  concepts: Concept[]; // all concepts for the profile's active packs
  items: Item[]; // all items for those concepts
  date: ISODate;
}

export interface PlannedSession {
  itemIds: ID[]; // the ordered path for today (interleaved, finite)
  estMinutes: number; // 10–20
}

export interface SummarizeInput {
  itemsDone: number;
  positiveCount: number; // got-it / easy
  prevStreak: number;
  alreadyCountedToday: boolean;
}

export interface LearningEngine {
  // Which items, in which order, for today's finite session.
  buildTodaySession(input: BuildSessionInput): PlannedSession;
  // How a single self-rating nudges a concept's surface mastery signal.
  gradeToMastery(current: MasterySignal, grade: Grade): MasterySignal;
  // The plain-language recap shown on the "done" screen.
  summarizeSession(input: SummarizeInput): SessionSummary;
}

export type { Review };
