import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { mockEngine } from "../engine/mockEngine";
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
const STATE_VERSION = 1;

function seed(): PersistState {
  return {
    version: STATE_VERSION,
    profiles: SEED_PROFILES,
    packs: SEED_PACKS,
    concepts: SEED_CONCEPTS,
    items: SEED_ITEMS,
    sessions: [],
    reviews: [],
    currentProfileId: null,
    theme: "auto",
  };
}

function load(): PersistState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seed();
    const parsed = JSON.parse(raw) as PersistState;
    if (parsed.version !== STATE_VERSION) return seed();
    return parsed;
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
    return (
      state.sessions.find((s) => s.profileId === currentProfile.id && s.date === APP_TODAY) ?? null
    );
  }, [state.sessions, currentProfile]);

  const packById = useCallback((id: ID) => state.packs.find((p) => p.id === id), [state.packs]);
  const itemById = useCallback((id: ID) => state.items.find((i) => i.id === id), [state.items]);
  const conceptById = useCallback(
    (id: ID) => state.concepts.find((c) => c.id === id),
    [state.concepts],
  );
  const conceptsForPack = useCallback(
    (packId: ID) => state.concepts.filter((c) => c.packId === packId),
    [state.concepts],
  );

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
      const existing = s.sessions.find(
        (x) => x.profileId === profile.id && x.date === APP_TODAY,
      );
      if (existing) {
        if (existing.state === "ready") {
          return {
            ...s,
            sessions: s.sessions.map((x) =>
              x.id === existing.id ? { ...x, state: "in-progress" } : x,
            ),
          };
        }
        return s;
      }
      const planned = mockEngine.buildTodaySession({
        profile,
        concepts: s.concepts,
        items: s.items,
        date: APP_TODAY,
      });
      const session: Session = {
        id: crypto.randomUUID(),
        profileId: profile.id,
        date: APP_TODAY,
        state: "in-progress",
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
        const session = s.sessions.find(
          (x) => x.profileId === s.currentProfileId && x.date === APP_TODAY,
        );
        if (!session) return s;
        const item = s.items.find((i) => i.id === itemId);
        const review: Review = {
          id: crypto.randomUUID(),
          sessionId: session.id,
          itemId,
          grade,
          confidence,
          reviewedAt: new Date().toISOString(),
        };
        const concepts = item
          ? s.concepts.map((c) =>
              c.id === item.conceptId
                ? { ...c, mastery: mockEngine.gradeToMastery(c.mastery, grade) }
                : c,
            )
          : s.concepts;
        return {
          ...s,
          reviews: [...s.reviews, review],
          concepts,
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
        (x) => x.profileId === s.currentProfileId && x.date === APP_TODAY,
      );
      if (!profile || !session) return s;
      const sessionReviews = s.reviews.filter((r) => r.sessionId === session.id);
      const positiveCount = sessionReviews.filter((r) => PAID_ATTENTION.includes(r.grade)).length;
      const alreadyCountedToday = profile.lastCompletedDate === APP_TODAY;
      const summary = mockEngine.summarizeSession({
        itemsDone: session.itemIds.length,
        positiveCount,
        prevStreak: profile.streakDays,
        alreadyCountedToday,
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
    return currentProfile.activePackIds.map((packId) => {
      const concepts = state.concepts.filter((c) => c.packId === packId);
      const solidIds = new Set(concepts.filter((c) => c.mastery === "solid").map((c) => c.id));
      const nextUp = concepts
        .filter(
          (c) => c.mastery !== "solid" && c.prerequisiteIds.every((p) => solidIds.has(p)),
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
  }, [currentProfile, state.concepts]);

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
    selectProfile,
    createProfile,
    setTheme,
    setIntensity,
    setAiEnabled,
    addPackToProfile,
    todaySession,
    startTodaySession,
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
