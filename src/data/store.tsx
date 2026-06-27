import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { daysBetween } from "../engine/dates";
import {
  engine,
  FOUNDATION_PROVEN_DAYS,
  isMastered,
  unmetPrerequisites,
} from "../engine/realEngine";
import {
  APP_TODAY,
  SEED_CONCEPTS,
  SEED_ITEMS,
  SEED_PACKS,
  SEED_PROFILES,
} from "./mockData";
import type {
  CalibrationPoint,
  Concept,
  Confidence,
  Grade,
  ID,
  Intensity,
  Item,
  Pack,
  Profile,
  ProgressSnapshot,
  ReadingLevel,
  Review,
  Session,
} from "./types";

export type ThemePref = "auto" | "light" | "dark";

interface PersistState {
  version: number;
  profiles: Profile[];
  packs: Pack[];
  concepts: Concept[];
  items: Item[];
  sessions: Session[];
  reviews: Review[];
  currentProfileId: ID | null;
  theme: ThemePref;
}

const STORAGE_KEY = "learningos:v1";
const STATE_VERSION = 3; // bumped for kid packs (Bible/Business/Missions/Money) + Selah/Caris profiles

// Grandfather already-mastered concepts as proven foundations, so turning on
// prerequisite gating never re-locks progress a learner already earned (brand
// new learning still earns its days the honest way, provenDays starting 0), and
// heal any broken prerequisite edges (a self-reference or an id that no longer
// resolves to a concept — e.g. a discarded AI concept) so the gate can never
// get stuck permanently on something unsatisfiable.
function normalize(state: PersistState): PersistState {
  const ids = new Set(state.concepts.map((c) => c.id));
  return {
    ...state,
    concepts: state.concepts.map((c) => {
      const provenDays =
        c.provenDays == null ? (c.mastery === "solid" ? FOUNDATION_PROVEN_DAYS : 0) : c.provenDays;
      const cleanPrereqs = c.prerequisiteIds.filter((p) => p !== c.id && ids.has(p));
      const prereqsChanged = cleanPrereqs.length !== c.prerequisiteIds.length;
      return c.provenDays == null || prereqsChanged
        ? { ...c, provenDays, prerequisiteIds: cleanPrereqs }
        : c;
    }),
  };
}

function seed(): PersistState {
  return normalize({
    version: STATE_VERSION,
    profiles: SEED_PROFILES,
    packs: SEED_PACKS,
    concepts: SEED_CONCEPTS,
    items: SEED_ITEMS,
    sessions: [],
    reviews: [],
    currentProfileId: null,
    theme: "auto",
  });
}

function load(): PersistState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seed();
    const parsed = JSON.parse(raw) as PersistState;
    if (parsed.version !== STATE_VERSION) return seed();
    return normalize(parsed);
  } catch {
    return seed();
  }
}

const PAID_ATTENTION: Grade[] = ["got-it", "easy"];
const CONFIDENCE_SCORE: Record<Confidence, number> = { guessed: 0.33, unsure: 0.66, sure: 1 };

export interface AppApi {
  // raw state
  profiles: Profile[];
  packs: Pack[];
  concepts: Concept[];
  items: Item[];
  reviews: Review[];
  theme: ThemePref;
  currentProfile: Profile | null;

  // lookups
  packById: (id: ID) => Pack | undefined;
  itemById: (id: ID) => Item | undefined;
  conceptById: (id: ID) => Concept | undefined;
  conceptsForPack: (packId: ID) => Concept[];

  // AI concept generation (owner-gated)
  pendingConcepts: () => Concept[];
  addGeneratedConcept: (concept: Concept, items: Item[]) => void;
  approveConcept: (id: ID) => void;
  discardConcept: (id: ID) => void;

  // profile + settings
  selectProfile: (id: ID) => void;
  createProfile: (input: { displayName: string; readingLevel: ReadingLevel; packId: ID }) => void;
  setTheme: (pref: ThemePref) => void;
  setIntensity: (intensity: Intensity) => void;
  setAiEnabled: (enabled: boolean) => void;
  addPackToProfile: (packId: ID) => void;

  // the daily loop
  todaySession: Session | null;
  startTodaySession: () => void;
  startExtraSession: () => void; // "keep going" — pull the next batch of new concepts
  hasMoreToLearn: boolean; // unlocked new concepts are available right now
  moreLockedAhead: boolean; // more concepts exist but are gated on foundations settling
  lockedPrereqs: (conceptId: ID) => Concept[]; // unmet prerequisites of a concept
  viewItem: () => void; // advance a teaching card (no grade)
  gradeItem: (itemId: ID, grade: Grade, confidence: Confidence | null) => void;
  finishSession: (reflection: { text: string; skipped: boolean }) => void;

  // progress
  progressForCurrent: () => ProgressSnapshot[];
  calibrationForCurrent: () => CalibrationPoint[];

  // data ownership
  exportData: () => string;
  resetEverything: () => void;
}

const AppContext = createContext<AppApi | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistState>(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // local-first and best-effort; ignore quota/availability errors
    }
  }, [state]);

  // Apply theme. "auto" defers to the OS via CSS, so we clear the attribute.
  useEffect(() => {
    const el = document.documentElement;
    if (state.theme === "auto") el.removeAttribute("data-theme");
    else el.setAttribute("data-theme", state.theme);
  }, [state.theme]);

  const currentProfile = useMemo(
    () => state.profiles.find((p) => p.id === state.currentProfileId) ?? null,
    [state.profiles, state.currentProfileId],
  );

  const todaySession = useMemo(() => {
    if (!currentProfile) return null;
    const todays = state.sessions.filter(
      (s) => s.profileId === currentProfile.id && s.date === APP_TODAY,
    );
    // The round you're actively in (not finished) wins; otherwise the most
    // recent one — so the "done" screen of whatever you last did is what shows.
    return todays.find((s) => s.state !== "complete") ?? todays[todays.length - 1] ?? null;
  }, [state.sessions, currentProfile]);

  const conceptsById = useMemo(
    () => new Map(state.concepts.map((c) => [c.id, c])),
    [state.concepts],
  );

  // What new ground is ahead, for the "Keep going" affordance. A concept is
  // "teachable" only if it has items, none ever scheduled (teaching cards never
  // get a schedule, so a per-item test would never go false), and it isn't
  // already mastered. Of those, the PUSH bar (prereqs MASTERED) decides:
  // UNLOCKED ones Keep going can pull now; LOCKED ones are waiting on a
  // prerequisite to even be mastered. (The daily session is stricter — it waits
  // for the 2-day proof — but Keep going lets an adult push onto solid ground.)
  const learnAhead = useMemo(() => {
    // Kids keep a protective, finite session — no "keep going", no gate UI.
    if (!currentProfile || currentProfile.readingLevel === "child") {
      return { unlocked: false, locked: false };
    }
    const started = new Set(state.items.filter((i) => i.scheduling?.due).map((i) => i.conceptId));
    const withItems = new Set(state.items.map((i) => i.conceptId));
    let unlocked = false;
    let locked = false;
    for (const c of state.concepts) {
      if (!currentProfile.activePackIds.includes(c.packId)) continue;
      if (c.status === "pending" || c.mastery === "solid") continue;
      if (!withItems.has(c.id) || started.has(c.id)) continue;
      if (c.prerequisiteIds.every((p) => isMastered(conceptsById.get(p)))) unlocked = true;
      else locked = true;
    }
    return { unlocked, locked };
  }, [currentProfile, state.concepts, state.items, conceptsById]);
  const hasMoreToLearn = learnAhead.unlocked;
  const moreLockedAhead = learnAhead.locked;

  // The unmet prerequisites of a concept — empty if it's unlocked. Drives the
  // "🔒 unlocks after …" hints on the Progress map.
  const lockedPrereqs = useCallback(
    (conceptId: ID) => {
      const c = conceptsById.get(conceptId);
      // Relaxed bar: a concept is only "locked" (🔒) if a prerequisite isn't even
      // mastered. One that's mastered-but-not-yet-proven is reachable via Keep
      // going, so it shouldn't read as locked.
      return c ? unmetPrerequisites(c, conceptsById, true) : [];
    },
    [conceptsById],
  );

  const packById = useCallback((id: ID) => state.packs.find((p) => p.id === id), [state.packs]);
  const itemById = useCallback((id: ID) => state.items.find((i) => i.id === id), [state.items]);
  const conceptById = useCallback(
    (id: ID) => state.concepts.find((c) => c.id === id),
    [state.concepts],
  );
  const conceptsForPack = useCallback(
    (packId: ID) => state.concepts.filter((c) => c.packId === packId && c.status !== "pending"),
    [state.concepts],
  );
  const pendingConcepts = useCallback(
    () => state.concepts.filter((c) => c.status === "pending"),
    [state.concepts],
  );

  const addGeneratedConcept = useCallback((concept: Concept, newItems: Item[]) => {
    setState((s) => ({ ...s, concepts: [...s.concepts, concept], items: [...s.items, ...newItems] }));
  }, []);
  const approveConcept = useCallback((id: ID) => {
    setState((s) => ({
      ...s,
      concepts: s.concepts.map((c) => (c.id === id ? { ...c, status: "approved" } : c)),
    }));
  }, []);
  const discardConcept = useCallback((id: ID) => {
    setState((s) => ({
      ...s,
      // Remove the concept AND scrub it from any other concept's prerequisites,
      // so nothing is left gated behind an id that no longer exists.
      concepts: s.concepts
        .filter((c) => c.id !== id)
        .map((c) =>
          c.prerequisiteIds.includes(id)
            ? { ...c, prerequisiteIds: c.prerequisiteIds.filter((p) => p !== id) }
            : c,
        ),
      items: s.items.filter((i) => i.conceptId !== id),
    }));
  }, []);

  const selectProfile = useCallback((id: ID) => {
    setState((s) => ({ ...s, currentProfileId: id }));
  }, []);

  const createProfile = useCallback(
    (input: { displayName: string; readingLevel: ReadingLevel; packId: ID }) => {
      const seeds = ["ember", "frost", "lemon", "sky", "moss"];
      setState((s) => {
        const profile: Profile = {
          id: crypto.randomUUID(),
          displayName: input.displayName.trim() || "Learner",
          avatarSeed: seeds[s.profiles.length % seeds.length],
          readingLevel: input.readingLevel,
          activePackIds: [input.packId],
          streakDays: 0,
          lastCompletedDate: null,
          aiEnabled: false,
          intensity: input.readingLevel === "child" ? "gentle" : "steady",
          createdAt: new Date().toISOString(),
        };
        return { ...s, profiles: [...s.profiles, profile], currentProfileId: profile.id };
      });
    },
    [],
  );

  const setTheme = useCallback((pref: ThemePref) => setState((s) => ({ ...s, theme: pref })), []);

  const updateCurrentProfile = useCallback((patch: Partial<Profile>) => {
    setState((s) => ({
      ...s,
      profiles: s.profiles.map((p) => (p.id === s.currentProfileId ? { ...p, ...patch } : p)),
    }));
  }, []);

  const setIntensity = useCallback(
    (intensity: Intensity) => updateCurrentProfile({ intensity }),
    [updateCurrentProfile],
  );
  const setAiEnabled = useCallback(
    (enabled: boolean) => updateCurrentProfile({ aiEnabled: enabled }),
    [updateCurrentProfile],
  );
  const addPackToProfile = useCallback(
    (packId: ID) =>
      setState((s) => ({
        ...s,
        profiles: s.profiles.map((p) =>
          p.id === s.currentProfileId && !p.activePackIds.includes(packId)
            ? { ...p, activePackIds: [...p.activePackIds, packId] }
            : p,
        ),
      })),
    [],
  );

  const startTodaySession = useCallback(() => {
    setState((s) => {
      const profile = s.profiles.find((p) => p.id === s.currentProfileId);
      if (!profile) return s;
      // The one paced session a day (ignore any "extra" rounds when resuming).
      const daily = s.sessions.find(
        (x) => x.profileId === profile.id && x.date === APP_TODAY && x.kind !== "extra",
      );
      if (daily) {
        if (daily.state === "ready") {
          return {
            ...s,
            sessions: s.sessions.map((x) =>
              x.id === daily.id ? { ...x, state: "in-progress" } : x,
            ),
          };
        }
        return s;
      }
      // Pending (un-approved AI) concepts never enter a session.
      const liveConcepts = s.concepts.filter((c) => c.status !== "pending");
      const liveIds = new Set(liveConcepts.map((c) => c.id));
      const planned = engine.buildTodaySession({
        profile,
        concepts: liveConcepts,
        items: s.items.filter((i) => liveIds.has(i.conceptId)),
        date: APP_TODAY,
      });
      const session: Session = {
        id: crypto.randomUUID(),
        profileId: profile.id,
        date: APP_TODAY,
        state: "in-progress",
        kind: "daily",
        itemIds: planned.itemIds,
        currentIndex: 0,
        estMinutes: planned.estMinutes,
      };
      return { ...s, sessions: [...s.sessions, session] };
    });
  }, []);

  // "Keep going": an on-demand round of the NEXT new concepts beyond the day's
  // budget. Reviews are already handled by the daily session, so this is pure
  // new ground. Adults only — kids keep the finite session.
  const startExtraSession = useCallback(() => {
    setState((s) => {
      const profile = s.profiles.find((p) => p.id === s.currentProfileId);
      if (!profile) return s;
      // Never stack rounds: if anything today is unfinished, stay in it.
      const unfinished = s.sessions.find(
        (x) => x.profileId === profile.id && x.date === APP_TODAY && x.state !== "complete",
      );
      if (unfinished) return s;
      const liveConcepts = s.concepts.filter((c) => c.status !== "pending");
      const liveIds = new Set(liveConcepts.map((c) => c.id));
      const planned = engine.buildTodaySession({
        profile,
        concepts: liveConcepts,
        items: s.items.filter((i) => liveIds.has(i.conceptId)),
        date: APP_TODAY,
        mode: "extra",
      });
      if (planned.itemIds.length === 0) return s; // nothing new left to teach
      const session: Session = {
        id: crypto.randomUUID(),
        profileId: profile.id,
        date: APP_TODAY,
        state: "in-progress",
        kind: "extra",
        itemIds: planned.itemIds,
        currentIndex: 0,
        estMinutes: planned.estMinutes,
      };
      return { ...s, sessions: [...s.sessions, session] };
    });
  }, []);

  const viewItem = useCallback(() => {
    setState((s) => ({
      ...s,
      sessions: s.sessions.map((x) =>
        x.profileId === s.currentProfileId && x.date === APP_TODAY && x.state === "in-progress"
          ? { ...x, currentIndex: x.currentIndex + 1 }
          : x,
      ),
    }));
  }, []);

  const gradeItem = useCallback(
    (itemId: ID, grade: Grade, confidence: Confidence | null) => {
      setState((s) => {
        const profile = s.profiles.find((p) => p.id === s.currentProfileId);
        const session = s.sessions.find(
          (x) =>
            x.profileId === s.currentProfileId && x.date === APP_TODAY && x.state !== "complete",
        );
        if (!profile || !session) return s;
        const item = s.items.find((i) => i.id === itemId);
        const concept = item ? s.concepts.find((c) => c.id === item.conceptId) : undefined;
        const review: Review = {
          id: crypto.randomUUID(),
          sessionId: session.id,
          itemId,
          grade,
          confidence,
          reviewedAt: new Date().toISOString(),
        };
        let items = s.items;
        let concepts = s.concepts;
        if (item && concept) {
          const updated = engine.applyReview({
            item,
            concept,
            grade,
            date: APP_TODAY,
            retention: engine.retentionFor(profile.intensity),
          });
          items = s.items.map((i) => (i.id === item.id ? updated.item : i));
          concepts = s.concepts.map((c) => (c.id === concept.id ? updated.concept : c));
        }
        return {
          ...s,
          items,
          concepts,
          reviews: [...s.reviews, review],
          sessions: s.sessions.map((x) =>
            x.id === session.id ? { ...x, currentIndex: x.currentIndex + 1 } : x,
          ),
        };
      });
    },
    [],
  );

  const finishSession = useCallback((reflection: { text: string; skipped: boolean }) => {
    setState((s) => {
      const profile = s.profiles.find((p) => p.id === s.currentProfileId);
      const session = s.sessions.find(
        (x) =>
          x.profileId === s.currentProfileId && x.date === APP_TODAY && x.state !== "complete",
      );
      if (!profile || !session) return s;
      const sessionReviews = s.reviews.filter((r) => r.sessionId === session.id);
      const positiveCount = sessionReviews.filter((r) => PAID_ATTENTION.includes(r.grade)).length;
      // Days since the last completed day, so the engine can extend a streak,
      // leave it (a second session same day), or reset it after a missed day.
      const daysSinceLast = profile.lastCompletedDate
        ? daysBetween(profile.lastCompletedDate, APP_TODAY)
        : null;
      const summary = engine.summarizeSession({
        itemsDone: session.itemIds.length,
        positiveCount,
        prevStreak: profile.streakDays,
        daysSinceLast,
      });
      return {
        ...s,
        profiles: s.profiles.map((p) =>
          p.id === profile.id
            ? { ...p, streakDays: summary.newStreakDays, lastCompletedDate: APP_TODAY }
            : p,
        ),
        sessions: s.sessions.map((x) =>
          x.id === session.id
            ? {
                ...x,
                state: "complete",
                currentIndex: x.itemIds.length,
                reflection: { ...reflection, createdAt: new Date().toISOString() },
                summary,
              }
            : x,
        ),
      };
    });
  }, []);

  const progressForCurrent = useCallback((): ProgressSnapshot[] => {
    if (!currentProfile) return [];
    const started = new Set(state.items.filter((i) => i.scheduling?.due).map((i) => i.conceptId));
    return currentProfile.activePackIds.map((packId) => {
      const concepts = state.concepts.filter((c) => c.packId === packId && c.status !== "pending");
      // The frontier: brand-new (not yet started, not solid) concepts whose
      // prerequisites are all mastered — i.e. reachable now (the daily session
      // when proven, "Keep going" the moment they're solid). Never lists a
      // concept you're already mid-way through.
      const nextUp = concepts
        .filter(
          (c) =>
            c.mastery !== "solid" &&
            !started.has(c.id) &&
            c.prerequisiteIds.every((p) => isMastered(conceptsById.get(p))),
        )
        .map((c) => c.id);
      return {
        profileId: currentProfile.id,
        packId,
        solid: concepts.filter((c) => c.mastery === "solid").length,
        gettingIt: concepts.filter((c) => c.mastery === "getting-it").length,
        new: concepts.filter((c) => c.mastery === "new").length,
        totalConcepts: concepts.length,
        streakDays: currentProfile.streakDays,
        nextUp,
      };
    });
  }, [currentProfile, state.concepts, state.items, conceptsById]);

  const calibrationForCurrent = useCallback((): CalibrationPoint[] => {
    if (!currentProfile) return [];
    const activeConceptIds = new Set(
      state.concepts.filter((c) => currentProfile.activePackIds.includes(c.packId)).map((c) => c.id),
    );
    const byConcept = new Map<string, { think: number[]; right: number[] }>();
    for (const r of state.reviews) {
      const item = state.items.find((i) => i.id === r.itemId);
      if (!item || !activeConceptIds.has(item.conceptId) || r.confidence === null) continue;
      const bucket = byConcept.get(item.conceptId) ?? { think: [], right: [] };
      bucket.think.push(CONFIDENCE_SCORE[r.confidence]);
      bucket.right.push(PAID_ATTENTION.includes(r.grade) ? 1 : 0);
      byConcept.set(item.conceptId, bucket);
    }
    const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
    return [...byConcept.entries()].map(([conceptId, v]) => ({
      conceptId,
      conceptTitle: state.concepts.find((c) => c.id === conceptId)?.title ?? conceptId,
      youThink: avg(v.think),
      youActually: avg(v.right),
    }));
  }, [currentProfile, state.concepts, state.items, state.reviews]);

  const exportData = useCallback(() => JSON.stringify(state, null, 2), [state]);
  const resetEverything = useCallback(() => {
    const fresh = seed();
    setState(fresh);
  }, []);

  const api: AppApi = {
    profiles: state.profiles,
    packs: state.packs,
    concepts: state.concepts,
    items: state.items,
    reviews: state.reviews,
    theme: state.theme,
    currentProfile,
    packById,
    itemById,
    conceptById,
    conceptsForPack,
    pendingConcepts,
    addGeneratedConcept,
    approveConcept,
    discardConcept,
    selectProfile,
    createProfile,
    setTheme,
    setIntensity,
    setAiEnabled,
    addPackToProfile,
    todaySession,
    startTodaySession,
    startExtraSession,
    hasMoreToLearn,
    moreLockedAhead,
    lockedPrereqs,
    viewItem,
    gradeItem,
    finishSession,
    progressForCurrent,
    calibrationForCurrent,
    exportData,
    resetEverything,
  };

  return <AppContext.Provider value={api}>{children}</AppContext.Provider>;
}

export function useApp(): AppApi {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within <AppProvider>");
  return ctx;
}
