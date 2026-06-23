// The two guardrailed AI flows. Both are EVALUATION, not generation: the model
// judges the learner's own words against vetted, fact-checked source content
// that we provide. It is explicitly told never to introduce facts beyond the
// source, so it can't invent finance numbers — the spec's central risk.

import type { Concept, Item } from "../data/types";
import { callJSON } from "./client";

// ---- Explain-it-back grading -------------------------------------------------

export interface ExplanationFeedback {
  verdict: "on-track" | "close" | "off-track";
  feedback: string;
}

const GRADE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    verdict: { type: "string", enum: ["on-track", "close", "off-track"] },
    feedback: { type: "string" },
  },
  required: ["verdict", "feedback"],
};

const GRADE_SYSTEM = `You are a warm, precise tutor inside a learning app. The learner has just tried to explain an idea in their own words. Judge their explanation ONLY against the provided source — the source is the correct, fact-checked account. Rules:
- "on-track" if they have the core idea; "close" if mostly there but missing or fuzzy on something; "off-track" if a key part is wrong or absent.
- Feedback is 1-3 short, plain sentences. Encouraging first, then name the one most useful thing to fix or add (if any).
- NEVER introduce facts, numbers, or claims beyond the source. If the source doesn't cover something, don't assert it.
- Speak to the learner directly ("you"). No preamble.`;

export function gradeExplanation(
  concept: Concept,
  item: Item,
  learnerText: string,
): Promise<ExplanationFeedback> {
  const source = [item.prompt, item.body, item.answer, item.correction]
    .filter(Boolean)
    .join("\n");
  const user = `Concept: ${concept.title}

Source (the correct idea):
${source}

The learner was asked to explain this in their own words and wrote:
"${learnerText.trim()}"

Grade their understanding against the source.`;
  return callJSON<ExplanationFeedback>({ system: GRADE_SYSTEM, user, schema: GRADE_SCHEMA, maxTokens: 400 });
}

// ---- End-of-session brain-dump review (hole-poking) --------------------------

export interface BrainDumpReview {
  strengths: string[];
  gaps: string[];
  nudge: string;
}

const REVIEW_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    strengths: { type: "array", items: { type: "string" } },
    gaps: { type: "array", items: { type: "string" } },
    nudge: { type: "string" },
  },
  required: ["strengths", "gaps", "nudge"],
};

const REVIEW_SYSTEM = `You are a warm tutor reviewing a learner's end-of-session brain dump (a free recall of what they remember). Compare it ONLY to the concepts they studied today, provided below. Rules:
- strengths: 1-3 short sentences naming what they clearly recalled.
- gaps: 1-2 short sentences gently naming important things they didn't mention or were fuzzy on. Empty array if they covered it all well.
- nudge: one short, encouraging sentence on what to revisit next time.
- NEVER introduce facts, numbers, or claims beyond the provided concepts.
- Speak to the learner directly ("you"). Plain language. No preamble.`;

export function reviewBrainDump(
  studied: { title: string; body: string }[],
  dumpText: string,
): Promise<BrainDumpReview> {
  const concepts = studied
    .map((c, i) => `${i + 1}. ${c.title}\n${c.body}`)
    .join("\n\n");
  const user = `Concepts studied today:

${concepts}

The learner's brain dump:
"${dumpText.trim()}"

Review it against the concepts above.`;
  return callJSON<BrainDumpReview>({ system: REVIEW_SYSTEM, user, schema: REVIEW_SCHEMA, maxTokens: 600 });
}

// ---- Connection test (Settings) ---------------------------------------------

const PING_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: { ok: { type: "boolean" } },
  required: ["ok"],
};

export async function testConnection(): Promise<boolean> {
  const res = await callJSON<{ ok: boolean }>({
    system: "Reply with ok set to true.",
    user: "ping",
    schema: PING_SCHEMA,
    maxTokens: 16,
  });
  return res.ok === true;
}
