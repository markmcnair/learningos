// Thin wrapper over the Anthropic Messages API for the OPTIONAL AI features.
// The SDK is dynamically imported so it never lands in the core bundle — the
// app stays lean and fully functional with AI off.
//
// Calls go directly from the browser using the user's own key
// (dangerouslyAllowBrowser). That is the intended local-first, bring-your-own-key
// model: the key is the user's, on the user's device, and never proxied.

import { getKey, getModel } from "./keys";

export class AiError extends Error {
  kind: "no-key" | "auth" | "rate-limit" | "network" | "bad-output" | "unknown";
  constructor(kind: AiError["kind"], message: string) {
    super(message);
    this.kind = kind;
    this.name = "AiError";
  }
}

let sdkPromise: Promise<typeof import("@anthropic-ai/sdk").default> | null = null;
function loadSdk() {
  if (!sdkPromise) sdkPromise = import("@anthropic-ai/sdk").then((m) => m.default);
  return sdkPromise;
}

interface CallOptions {
  system: string;
  user: string;
  schema: Record<string, unknown>;
  maxTokens?: number;
}

// Returns the model's JSON output, validated by the API against `schema`.
export async function callJSON<T>({ system, user, schema, maxTokens = 1024 }: CallOptions): Promise<T> {
  const apiKey = getKey();
  if (!apiKey) throw new AiError("no-key", "No API key set.");

  let Anthropic: typeof import("@anthropic-ai/sdk").default;
  try {
    Anthropic = await loadSdk();
  } catch {
    throw new AiError("network", "Couldn't load the AI module.");
  }

  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });

  let resp: { content: Array<{ type: string; text?: string }> };
  try {
    // output_config.format is the structured-output surface; cast to keep this
    // resilient across SDK minor versions.
    resp = (await (client.messages.create as unknown as (p: unknown) => Promise<typeof resp>)({
      model: getModel(),
      max_tokens: maxTokens,
      system,
      messages: [{ role: "user", content: user }],
      output_config: { format: { type: "json_schema", schema } },
    })) as typeof resp;
  } catch (err) {
    const status = (err as { status?: number }).status;
    if (status === 401 || status === 403) throw new AiError("auth", "Your API key was rejected.");
    if (status === 429) throw new AiError("rate-limit", "Rate limited — try again shortly.");
    throw new AiError("network", "Couldn't reach the model.");
  }

  const text = resp.content.find((b) => b.type === "text")?.text ?? "";
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new AiError("bad-output", "The model returned an unexpected response.");
  }
}

export function friendlyError(err: unknown): string {
  if (err instanceof AiError) {
    switch (err.kind) {
      case "no-key":
        return "Add your API key in Settings to use this.";
      case "auth":
        return "Your API key was rejected. Check it in Settings.";
      case "rate-limit":
        return "Rate limited — give it a moment and try again.";
      case "bad-output":
        return "The model returned something unexpected. Try again.";
      default:
        return "Couldn't reach the model. Check your connection and key.";
    }
  }
  return "Something went wrong. Try again.";
}
