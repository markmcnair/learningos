// === LearningOS core data contract ===
// The UI codes its (mock) data against these shapes. The real learning engine
// (FSRS-6 scheduling + BKT mastery + the prerequisite graph) replaces the mock
// data module later by producing these SAME shapes. No UI changes required.

export type ID = string;
export type ISODate = string; // "2026-06-23"
export type ISODateTime = string; // "2026-06-23T08:14:00.000Z"

// A soft hint that nudges content tone. Never a UI mode, never a toggle on screen.
export type ReadingLevel = "child" | "general" | "expert";

// ---- Identity & content ----

export interface Profile {
  id: ID;
  displayName: string; // "Mara", "Dad", "Sage"
  avatarSeed: string; // deterministic color/avatar, no upload
  readingLevel: ReadingLevel;
  activePackIds: ID[];
  streakDays: number; // consecutive days a session was completed
  lastCompletedDate: ISODate | null;
  aiEnabled: boolean; // true only once the user adds their own API key
  intensity: Intensity; // plain-language stand-in for desired-retention
  createdAt: ISODateTime;
}

// The single, plain-language difficulty dial. Maps internally to a retention
// target (gentle ~0.85, steady ~0.90, intense ~0.95) — never shown as a number.
export type Intensity = "gentle" | "steady" | "intense";

export interface Pack {
  id: ID;
  title: string; // "Trading Foundations", "Business for Kids"
  description: string; // one calm sentence
  emoji: string; // single friendly glyph for the surface
  conceptIds: ID[]; // ordered roughly along the intended learning path
  version: string;
}

// A surface-safe mastery signal. The engine's real BKT probability never reaches
// a screen; it is collapsed to one of these three words first.
export type MasterySignal = "new" | "getting-it" | "solid";

// A Concept is a node in the prerequisite knowledge graph.
export interface Concept {
  id: ID;
  packId: ID;
  title: string; // "What a call option is"
  prerequisiteIds: ID[]; // edges in the prereq graph (engine signal)
  itemIds: ID[]; // the items that teach / test this concept
  mastery: MasterySignal; // the surface signal, derived from bktP
  bktP?: number; // BKT mastery probability — engine internal, never rendered
  relearnReps?: number; // consecutive successful recalls (successive relearning)
  // Successive relearning across SPACED time: the count of distinct days this
  // concept was recalled correctly, and the last such day (so same-day repeats
  // don't inflate it). A concept only becomes a "proven foundation" — safe to
  // build new concepts on top of — once this survives ≥1 day gap, so mastery
  // can't be crammed open in a single sitting. Engine-internal, never rendered.
  provenDays?: number;
  lastProvenDay?: ISODate;
  // AI-generated concepts: held as "pending" until the owner approves them, so
  // nothing new reaches a learner (or a child) without a human sign-off.
  source?: "ai";
  status?: "pending" | "approved";
  review?: { rationale: string; recommendation: "approve" | "review"; issues: string[] };
}

// ---- Items: the atomic things a session is made of ----

export type ItemType =
  | "fact" // a single thing to know (front / back recall)
  | "cloze" // fill-in-the-blank within a sentence
  | "concept-explanation" // a short teaching card, often no grading
  | "worked-example" // a step-by-step solved example to study
  | "application" // apply the idea to a small scenario / problem
  | "refutation" // names a common misconception, then corrects it
  | "pick"; // tap-the-right-answer — objectively graded (used for kids)

export interface ItemScheduling {
  due: ISODate;
  stability?: number; // FSRS internal — never rendered
  difficulty?: number; // FSRS internal — never rendered
  lastReview?: ISODate; // FSRS internal — used to compute elapsed time
  reps?: number;
  lapses?: number;
  learningState?: "new" | "learning" | "review" | "relearning";
}

export interface Item {
  id: ID;
  conceptId: ID;
  type: ItemType;
  prompt: string; // question / scenario / teaching headline
  body?: string; // explanation, worked steps, or scenario detail
  clozeMask?: string[]; // hidden spans for "cloze"
  answer?: string; // canonical answer for recall / cloze / application
  choices?: string[]; // optional multiple choice
  correctChoice?: string; // the correct option (for "pick" — objectively checked)
  misconception?: string; // the wrong belief (refutation)
  correction?: string; // the corrected belief (refutation)
  scheduling?: ItemScheduling; // engine-owned; never rendered
}

// ---- The daily session: one finite path ----

export type SessionState = "ready" | "in-progress" | "complete";

export interface SessionSummary {
  itemsDone: number;
  headline: string; // "You moved 3 ideas closer to solid."
  newStreakDays: number;
}

export interface Reflection {
  text: string;
  skipped: boolean;
  createdAt: ISODateTime;
}

export interface Session {
  id: ID;
  profileId: ID;
  date: ISODate;
  state: SessionState;
  // "daily" is the one paced session a day; "extra" is a learner-pulled
  // "keep going" round of new material beyond the day's budget.
  kind?: "daily" | "extra";
  itemIds: ID[]; // ordered path the engine chose for today
  currentIndex: number; // position-in-session for the quiet progress bar
  estMinutes: number; // soft promise; scales with how much you take on
  reflection?: Reflection;
  summary?: SessionSummary;
}

// ---- Reviews: one per graded interaction ----

// Human words, not 0–3. The engine maps these to its grade internally.
export type Grade = "missed" | "tough" | "got-it" | "easy";
export type Confidence = "guessed" | "unsure" | "sure";

export interface Review {
  id: ID;
  sessionId: ID;
  itemId: ID;
  grade: Grade;
  confidence: Confidence | null; // null if the light tap was skipped
  responseMs?: number; // engine signal, never shown
  reviewedAt: ISODateTime;
}

// ---- Progress & calibration (the optional, tucked-away view) ----

export interface ProgressSnapshot {
  profileId: ID;
  packId: ID;
  solid: number;
  gettingIt: number;
  new: number;
  totalConcepts: number;
  streakDays: number;
  nextUp: ID[]; // concept ids on the outer fringe — "ready to learn"
}

// One concept's gap between felt and actual knowing.
export interface CalibrationPoint {
  conceptId: ID;
  conceptTitle: string;
  youThink: number; // 0..1, from confidence taps
  youActually: number; // 0..1, from grades
}
