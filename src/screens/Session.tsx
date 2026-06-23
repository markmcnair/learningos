import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { friendlyError } from "../ai/client";
import { hasKey } from "../ai/keys";
import {
  gradeExplanation,
  reviewBrainDump,
  type BrainDumpReview,
  type ExplanationFeedback,
} from "../ai/tutor";
import { Button, Icon, ProgressDots, Streak } from "../components/ui";
import { useApp } from "../data/store";
import type { Concept, Confidence, Grade, Item, ItemType } from "../data/types";
import s from "./Session.module.css";
import sc from "./screens.module.css";

const TEACHING: ItemType[] = ["concept-explanation", "worked-example"];

const KIND_LABEL: Record<ItemType, string> = {
  fact: "Recall",
  cloze: "Fill in the blank",
  "concept-explanation": "Learn",
  "worked-example": "Worked example",
  application: "Apply it",
  refutation: "A common myth",
};

const GRADES: { grade: Grade; label: string; tone?: "missed" | "good" }[] = [
  { grade: "missed", label: "Missed it", tone: "missed" },
  { grade: "tough", label: "Tough" },
  { grade: "got-it", label: "Got it", tone: "good" },
  { grade: "easy", label: "Easy", tone: "good" },
];

const CONFIDENCE: { value: Confidence; label: string }[] = [
  { value: "guessed", label: "Guessed" },
  { value: "unsure", label: "Unsure" },
  { value: "sure", label: "Sure" },
];

// Optional, AI-graded "explain it back" — only shown when AI is on.
function ExplainBack({ concept, item }: { concept: Concept; item: Item }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<ExplanationFeedback | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function check() {
    setBusy(true);
    setError(null);
    setFeedback(null);
    try {
      setFeedback(await gradeExplanation(concept, item, text));
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <div className={s.aiBox}>
        <button className={s.ghostLink} onClick={() => setOpen(true)}>
          Want to test yourself? Explain it in your own words
        </button>
      </div>
    );
  }

  return (
    <div className={s.aiBox}>
      <div className={s.aiPrompt}>In a sentence or two, why is this true?</div>
      <textarea
        className={s.miniArea}
        value={text}
        autoFocus
        placeholder="Your explanation…"
        onChange={(e) => setText(e.target.value)}
      />
      <div style={{ marginTop: "var(--s-3)" }}>
        <Button size="sm" variant="secondary" onClick={check} disabled={busy || !text.trim()}>
          {busy ? "Checking…" : "Check my understanding"}
        </Button>
      </div>
      {feedback && (
        <div
          className={`${s.feedback} ${feedback.verdict === "on-track" ? s.fbOn : s.fbAmber}`}
        >
          <span className={s.fbLabel}>
            {feedback.verdict === "on-track"
              ? "You've got it"
              : feedback.verdict === "close"
                ? "Close"
                : "Not quite"}
          </span>
          {feedback.feedback}
        </div>
      )}
      {error && <div className={s.aiHint}>{error}</div>}
    </div>
  );
}

function ItemView({
  item,
  concept,
  aiActive,
  onViewed,
  onGraded,
}: {
  item: Item;
  concept: Concept | undefined;
  aiActive: boolean;
  onViewed: () => void;
  onGraded: (grade: Grade, confidence: Confidence | null) => void;
}) {
  const [revealed, setRevealed] = useState(false);
  const [confidence, setConfidence] = useState<Confidence | null>(null);
  const teaching = TEACHING.includes(item.type);

  function reveal(c: Confidence | null) {
    setConfidence(c);
    setRevealed(true);
  }

  return (
    <div className={s.body}>
      <div className={s.kind}>{KIND_LABEL[item.type]}</div>
      <h2 className={s.prompt}>{item.prompt}</h2>
      {item.body && <p className={s.passage}>{item.body}</p>}

      {teaching && (
        <>
          <div className={s.controls}>
            <Button size="lg" block onClick={onViewed}>
              Got it
            </Button>
          </div>
          {aiActive && concept && <ExplainBack concept={concept} item={item} />}
        </>
      )}

      {!teaching && !revealed && (
        <div className={s.controls}>
          <div className={s.askLabel}>How sure are you?</div>
          <div className={s.chips}>
            {CONFIDENCE.map((c) => (
              <button key={c.value} className={s.chip} onClick={() => reveal(c.value)}>
                {c.label}
              </button>
            ))}
          </div>
          <div className={s.ghostCenter}>
            <button className={s.ghostLink} onClick={() => reveal(null)}>
              Just show me
            </button>
          </div>
        </div>
      )}

      {!teaching && revealed && (
        <>
          <div className={s.reveal}>
            {item.type === "refutation" ? (
              <>
                <div className={`${s.revealLabel} ${s.mythLabel}`}>The myth</div>
                <div className={s.revealText} style={{ marginBottom: "var(--s-4)" }}>
                  {item.misconception}
                </div>
                <div className={s.revealLabel}>Actually</div>
                <div className={s.revealText}>{item.correction}</div>
              </>
            ) : (
              <>
                <div className={s.revealLabel}>Answer</div>
                <div className={s.revealText}>{item.answer}</div>
              </>
            )}
          </div>
          <div className={s.controls}>
            <div className={s.askLabel}>How did that go?</div>
            <div className={s.grades}>
              {GRADES.map((g) => (
                <button
                  key={g.grade}
                  className={`${s.grade} ${
                    g.tone === "missed" ? s.gradeMissed : g.tone === "good" ? s.gradeGood : ""
                  }`}
                  onClick={() => onGraded(g.grade, confidence)}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Reflect({
  aiActive,
  studied,
  onFinish,
}: {
  aiActive: boolean;
  studied: { title: string; body: string }[];
  onFinish: (text: string, skipped: boolean) => void;
}) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [review, setReview] = useState<BrainDumpReview | null>(null);

  async function saveAndFinish() {
    if (aiActive && text.trim()) {
      setBusy(true);
      try {
        setReview(await reviewBrainDump(studied, text));
        setBusy(false);
        return; // show the review, then the user taps Finish
      } catch {
        // fall through to finishing without a review
      }
    }
    onFinish(text, false);
  }

  if (review) {
    return (
      <div className={s.body}>
        <div className={s.kind}>What I noticed</div>
        <h2 className={s.prompt}>Nice recall.</h2>
        <div className={s.reviewPanel}>
          {review.strengths.length > 0 && (
            <div>
              <div className={s.gLabel}>You nailed</div>
              <ul className={s.reviewList}>
                {review.strengths.map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
            </div>
          )}
          {review.gaps.length > 0 && (
            <div>
              <div className={s.gLabel}>Worth another look</div>
              <ul className={s.reviewList}>
                {review.gaps.map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
            </div>
          )}
          <p className={s.nudge}>{review.nudge}</p>
        </div>
        <div className={s.controls}>
          <Button size="lg" block onClick={() => onFinish(text, false)}>
            Finish
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={s.body}>
      <div className={s.kind}>Before you go</div>
      <h2 className={s.prompt}>What do you remember?</h2>
      <p className={s.passage}>
        No pressure, no grade. Just dump whatever stuck — it's one of the strongest ways to make it
        last.
      </p>
      <textarea
        className={s.reflectArea}
        value={text}
        autoFocus
        placeholder="It's coming back to me…"
        onChange={(e) => setText(e.target.value)}
      />
      <div className={s.controls}>
        <Button size="lg" block onClick={saveAndFinish} disabled={busy || !text.trim()}>
          {busy ? "Reading it back…" : aiActive ? "Save & see notes" : "Save & finish"}
        </Button>
        <div className={s.ghostCenter}>
          <button className={s.ghostLink} onClick={() => onFinish("", true)}>
            Skip for today
          </button>
        </div>
      </div>
    </div>
  );
}

export function Session() {
  const {
    currentProfile,
    todaySession,
    itemById,
    conceptById,
    startTodaySession,
    viewItem,
    gradeItem,
    finishSession,
  } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    startTodaySession();
  }, [startTodaySession]);

  const aiActive = !!currentProfile?.aiEnabled && hasKey();

  if (!todaySession) {
    return (
      <div className={s.player}>
        <p className={sc.faint} style={{ textAlign: "center", marginTop: "30vh" }}>
          Preparing your session…
        </p>
      </div>
    );
  }

  const { itemIds, currentIndex, state, summary } = todaySession;
  const phase = state === "complete" ? "done" : currentIndex >= itemIds.length ? "reflect" : "items";
  const currentItem = phase === "items" ? itemById(itemIds[currentIndex]) : undefined;
  const currentConcept = currentItem ? conceptById(currentItem.conceptId) : undefined;

  // Concept summaries for the brain-dump review (one entry per concept studied).
  const studied: { title: string; body: string }[] = [];
  if (phase === "reflect" && aiActive) {
    const byConcept = new Map<string, string[]>();
    for (const id of itemIds) {
      const it = itemById(id);
      if (!it) continue;
      const parts = byConcept.get(it.conceptId) ?? [];
      const piece = [it.prompt, it.body, it.answer, it.correction].filter(Boolean).join(" ");
      if (piece) parts.push(piece);
      byConcept.set(it.conceptId, parts);
    }
    for (const [cid, parts] of byConcept) {
      studied.push({ title: conceptById(cid)?.title ?? "", body: parts.join("\n").slice(0, 600) });
    }
  }

  return (
    <div className={s.player}>
      {phase !== "done" && (
        <div className={s.topbar}>
          <button className={s.closeBtn} onClick={() => navigate("/")} aria-label="Leave session">
            <Icon name="close" size={22} />
          </button>
          <div className={s.dotsWrap}>
            <ProgressDots total={itemIds.length || 1} current={currentIndex} />
          </div>
        </div>
      )}

      {phase === "items" && currentItem && (
        <ItemView
          key={currentIndex}
          item={currentItem}
          concept={currentConcept}
          aiActive={aiActive}
          onViewed={viewItem}
          onGraded={(grade, confidence) => gradeItem(currentItem.id, grade, confidence)}
        />
      )}

      {phase === "reflect" && (
        <Reflect
          aiActive={aiActive}
          studied={studied}
          onFinish={(text, skipped) => finishSession({ text, skipped })}
        />
      )}

      {phase === "done" && (
        <div className={s.body}>
          <div className={s.doneWrap}>
            <span className={s.doneCheck}>
              <Icon name="check" size={40} strokeWidth={2} />
            </span>
            <h1>Done for today.</h1>
            <p className={sc.muted}>{summary?.headline}</p>
            <Streak days={summary?.newStreakDays ?? 0} />
            <div style={{ marginTop: "var(--s-4)" }}>
              <Button size="lg" onClick={() => navigate("/")}>
                Back home
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
