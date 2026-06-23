// The user's API key and model choice live in their own localStorage entries —
// deliberately NOT part of the exported/synced app state. The key never leaves
// this device and is never included in a data export.

const KEY_STORAGE = "learningos:aikey";
const MODEL_STORAGE = "learningos:aimodel";

export const AI_MODELS = [
  { id: "claude-opus-4-8", label: "Most capable (Opus)" },
  { id: "claude-sonnet-4-6", label: "Balanced (Sonnet)" },
  { id: "claude-haiku-4-5", label: "Fastest & cheapest (Haiku)" },
] as const;

export type AiModelId = (typeof AI_MODELS)[number]["id"];

const DEFAULT_MODEL: AiModelId = "claude-opus-4-8";

export function getKey(): string {
  try {
    return localStorage.getItem(KEY_STORAGE) ?? "";
  } catch {
    return "";
  }
}

export function setKey(key: string): void {
  try {
    const trimmed = key.trim();
    if (trimmed) localStorage.setItem(KEY_STORAGE, trimmed);
    else localStorage.removeItem(KEY_STORAGE);
  } catch {
    // best-effort
  }
}

export function hasKey(): boolean {
  return getKey().length > 0;
}

export function getModel(): AiModelId {
  try {
    const m = localStorage.getItem(MODEL_STORAGE) as AiModelId | null;
    return m && AI_MODELS.some((x) => x.id === m) ? m : DEFAULT_MODEL;
  } catch {
    return DEFAULT_MODEL;
  }
}

export function setModel(model: AiModelId): void {
  try {
    localStorage.setItem(MODEL_STORAGE, model);
  } catch {
    // best-effort
  }
}
