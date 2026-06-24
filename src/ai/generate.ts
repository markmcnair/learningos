// AI concept generation for "go further". Two calls: PROPOSE a new concept that
// builds on what's mastered, then an independent VERIFY pass that adversarially
// checks it. Nothing reaches a learner until the owner approves — see the Grow
// screen. The system prompts below are hardened by the generator-guardrails
// workflow; keep them strict.

import { callJSON } from "./client";
import { GEN_PROMPTS } from "./genPrompts";

export interface GeneratedQuestion {
  type: "pick" | "application" | "fact";
  prompt: string;
  choices?: string[];
  correctChoice?: string;
  answer: string;
  body?: string;
}

export interface GeneratedConcept {
  title: string;
  rationale: string;
  prerequisiteTitles: string[];
  teaching: { prompt: string; body: string };
  questions: GeneratedQuestion[];
}

export interface VerifyResult {
  recommendation: "approve" | "review";
  issues: string[];
}

const GEN_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    title: { type: "string" },
    rationale: { type: "string" },
    prerequisiteTitles: { type: "array", items: { type: "string" } },
    teaching: {
      type: "object",
      additionalProperties: false,
      properties: { prompt: { type: "string" }, body: { type: "string" } },
      required: ["prompt", "body"],
    },
    questions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          type: { enum: ["pick", "application", "fact"] },
          prompt: { type: "string" },
          choices: { type: "array", items: { type: "string" } },
          correctChoice: { type: "string" },
          answer: { type: "string" },
          body: { type: "string" },
        },
        required: ["type", "prompt", "answer"],
      },
    },
  },
  required: ["title", "rationale", "prerequisiteTitles", "teaching", "questions"],
};

const VERIFY_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    recommendation: { type: "string", enum: ["approve", "review"] },
    issues: { type: "array", items: { type: "string" } },
  },
  required: ["recommendation", "issues"],
};

const SHAPE = `Return JSON exactly like:
{"title":"...","rationale":"one sentence on why it follows","prerequisiteTitles":["..."],"teaching":{"prompt":"a short headline","body":"the teaching, kept short"},"questions":[{"type":"pick","prompt":"...","choices":["...","..."],"correctChoice":"copied word-for-word from choices","answer":"a short cheerful answer"}]}`;

export function checklistFor(childMode: boolean): string[] {
  return (childMode ? GEN_PROMPTS.kid : GEN_PROMPTS.adult).checklist;
}

export function proposeConcept(input: {
  packTitle: string;
  knownTitles: string[];
  existingTitles: string[];
  childMode: boolean;
}): Promise<GeneratedConcept> {
  const sys = (input.childMode ? GEN_PROMPTS.kid : GEN_PROMPTS.adult).gen;
  const qType = input.childMode ? '"pick"' : '"application" or "fact"';
  const user = `Course: ${input.packTitle}
The learner has mastered: ${input.knownTitles.join(", ") || "(the basics of this course)"}
Concepts that already exist — do NOT duplicate these: ${input.existingTitles.join(", ")}
Audience: ${input.childMode ? "a young child, first-grade reading level" : "an adult"}. Questions must be type ${qType}.
Propose ONE new concept that builds naturally on what they've mastered.
${SHAPE}`;
  // Generous budget: reasoning models (e.g. DeepSeek) spend tokens thinking
  // before the JSON, so a tight cap can truncate the output.
  return callJSON<GeneratedConcept>({ system: sys, user, schema: GEN_SCHEMA, maxTokens: 4096 });
}

export async function verifyConcept(input: {
  packTitle: string;
  proposal: GeneratedConcept;
  childMode: boolean;
}): Promise<VerifyResult> {
  const sys = (input.childMode ? GEN_PROMPTS.kid : GEN_PROMPTS.adult).verify;
  const user = `Course: ${input.packTitle}
Review this proposed concept and its questions, then give your recommendation and a list of specific issues (empty if none):

${JSON.stringify(input.proposal, null, 2)}`;
  const res = await callJSON<VerifyResult>({ system: sys, user, schema: VERIFY_SCHEMA, maxTokens: 3000 });
  // Normalize: anything other than a clean "approve" means it needs your eyes.
  return {
    recommendation: res.recommendation === "approve" ? "approve" : "review",
    issues: Array.isArray(res.issues) ? res.issues : [],
  };
}
