// Thin wrapper over the chat APIs for the OPTIONAL AI features.
//
// Two providers, auto-detected from the key prefix:
//   - Anthropic (sk-ant-…): the official SDK, dynamically imported so it never
//     lands in the core bundle, called direct from the browser with the user's key.
//   - OpenRouter (sk-or-…): a plain fetch to its OpenAI-compatible endpoint
//     (no SDK exists for it); one key, many models.
//
// Either way the key is the user's, on the user's device, never proxied.

import { getKey, getModel, provider } from "./keys";

export class AiError extends Error {
  kind: "no-key" | "auth" | "rate-limit" | "network" | "bad-output" | "unknown";
  constructor(kind: AiError["kind"], message: string) {
    super(message);
    this.kind = kind;
    this.name = "AiError";
  }
}

interface CallOptions {
  system: string;
  user: string;
  schema: Record<string, unknown>;
  maxTokens?: number;
}

export async function callJSON<T>(opts: CallOptions): Promise<T> {
  const key = getKey();
  if (!key) throw new AiError("no-key", "No API key set.");
  return provider(key) === "openrouter" ? callOpenRouter<T>(key, opts) : callAnthropic<T>(key, opts);
}

// ---- Anthropic (official SDK) ------------------------------------------------

let sdkPromise: Promise<typeof import("@anthropic-ai/sdk").default> | null = null;
function loadSdk() {
  if (!sdkPromise) sdkPromise = import("@anthropic-ai/sdk").then((m) => m.default);
  return sdkPromise;
}

async function callAnthropic<T>(apiKey: string, { system, user, schema, maxTokens = 1024 }: CallOptions): Promise<T> {
  let Anthropic: typeof import("@anthropic-ai/sdk").default;
  try {
    Anthropic = await loadSdk();
  } catch {
    throw new AiError("network", "Couldn't load the AI module.");
  }
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });

  let resp: { content: Array<{ type: string; text?: string }> };
  try {
    resp = (await (client.messages.create as unknown as (p: unknown) => Promise<typeof resp>)({
      model: getModel(),
      max_tokens: maxTokens,
      system,
      messages: [{ role: "user", content: user }],
      output_config: { format: { type: "json_schema", schema } },
    })) as typeof resp;
  } catch (err) {
    throw mapStatus((err as { status?: number }).status);
  }

  const text = resp.content.find((b) => b.type === "text")?.text ?? "";
  return parseJson<T>(text);
}

// ---- OpenRouter (OpenAI-compatible fetch) ------------------------------------

async function callOpenRouter<T>(apiKey: string, { system, user, schema, maxTokens = 1024 }: CallOptions): Promise<T> {
  let resp: Response;
  try {
    resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "X-Title": "LearningOS",
      },
      body: JSON.stringify({
        model: getModel(),
        max_tokens: maxTokens,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: `${system}\n\n${schemaHint(schema)}` },
          { role: "user", content: user },
        ],
      }),
    });
  } catch {
    throw new AiError("network", "Couldn't reach OpenRouter.");
  }
  if (!resp.ok) throw mapStatus(resp.status);

  let data: { choices?: Array<{ message?: { content?: string } }> };
  try {
    data = await resp.json();
  } catch {
    throw new AiError("bad-output", "Unexpected response.");
  }
  return parseJson<T>(data.choices?.[0]?.message?.content ?? "");
}

// ---- shared helpers ----------------------------------------------------------

function mapStatus(status?: number): AiError {
  if (status === 401 || status === 403) return new AiError("auth", "Your API key was rejected.");
  if (status === 429) return new AiError("rate-limit", "Rate limited — try again shortly.");
  return new AiError("network", "Couldn't reach the model.");
}

// Tolerant JSON extraction — some models wrap output in ```json fences or add prose.
function parseJson<T>(text: string): T {
  let t = text.trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) t = fence[1].trim();
  const start = t.indexOf("{");
  const end = t.lastIndexOf("}");
  if (start >= 0 && end > start) t = t.slice(start, end + 1);
  try {
    return JSON.parse(t) as T;
  } catch {
    throw new AiError("bad-output", "The model returned an unexpected response.");
  }
}

// A plain-language description of the wanted JSON shape, for providers that
// can't enforce a JSON schema server-side.
function schemaHint(schema: Record<string, unknown>): string {
  const props = (schema.properties ?? {}) as Record<string, { type?: string; enum?: string[] }>;
  const required = (schema.required as string[] | undefined) ?? Object.keys(props);
  const parts = required.map((k) => {
    const p = props[k] ?? {};
    if (p.enum) return `${k} (one of: ${p.enum.join(", ")})`;
    if (p.type === "array") return `${k} (array of short strings)`;
    return `${k} (${p.type ?? "string"})`;
  });
  return `Return ONLY a JSON object with these keys: ${parts.join("; ")}. No markdown fences, no text outside the JSON.`;
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
