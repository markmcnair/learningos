// The user's API key and model choice live in their own localStorage entries —
// deliberately NOT part of the exported/synced app state. The key never leaves
// this device and is never included in a data export.
//
// Two providers are supported, auto-detected from the key prefix:
//   sk-ant-…  → Anthropic directly
//   sk-or-…   → OpenRouter (one key, many models; great for BYO-key)

const KEY_STORAGE = "learningos:aikey";

export type Provider = "anthropic" | "openrouter";

export interface ModelOption {
  id: string;
  label: string;
}

export const ANTHROPIC_MODELS: ModelOption[] = [
  { id: "claude-opus-4-8", label: "Most capable" },
  { id: "claude-sonnet-4-6", label: "Balanced" },
  { id: "claude-haiku-4-5", label: "Fastest & cheapest" },
];

// OpenRouter has hundreds of models — these are just quick-pick chips. Any
// slug from openrouter.ai/models can be typed in directly.
export const OPENROUTER_MODELS: ModelOption[] = [
  { id: "deepseek/deepseek-v4-flash", label: "DeepSeek V4 Flash" },
  { id: "anthropic/claude-sonnet-4.6", label: "Claude Sonnet" },
  { id: "anthropic/claude-haiku-4.5", label: "Claude Haiku" },
  { id: "anthropic/claude-opus-4.8", label: "Claude Opus" },
];

const DEFAULTS: Record<Provider, string> = {
  anthropic: "claude-opus-4-8",
  openrouter: "anthropic/claude-sonnet-4.6", // sensible default; fully overridable
};

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

export function provider(key: string = getKey()): Provider {
  return key.trim().startsWith("sk-or") ? "openrouter" : "anthropic";
}

export function modelsFor(p: Provider): ModelOption[] {
  return p === "openrouter" ? OPENROUTER_MODELS : ANTHROPIC_MODELS;
}

function modelStorageKey(p: Provider): string {
  return p === "openrouter" ? "learningos:aimodel_or" : "learningos:aimodel";
}

export function getModel(p: Provider = provider()): string {
  try {
    const m = localStorage.getItem(modelStorageKey(p));
    // Any non-empty slug is allowed (OpenRouter has hundreds); presets are
    // only quick-pick suggestions, not a whitelist.
    return m && m.trim() ? m : DEFAULTS[p];
  } catch {
    return DEFAULTS[p];
  }
}

export function setModel(p: Provider, model: string): void {
  try {
    localStorage.setItem(modelStorageKey(p), model);
  } catch {
    // best-effort
  }
}
