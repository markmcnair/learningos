import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { friendlyError } from "../ai/client";
import { checklistFor, proposeConcept, verifyConcept } from "../ai/generate";
import { hasKey } from "../ai/keys";
import { Button, ButtonLink, Icon } from "../components/ui";
import { useApp } from "../data/store";
import type { Concept, Item, Pack } from "../data/types";
import g from "./Grow.module.css";

function isKidPack(packId: string) {
  return packId.endsWith("-for-kids");
}

export function Grow() {
  const {
    packs,
    conceptsForPack,
    pendingConcepts,
    itemById,
    packById,
    addGeneratedConcept,
    approveConcept,
    discardConcept,
  } = useApp();
  const navigate = useNavigate();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const aiReady = hasKey();
  const pending = pendingConcepts();

  async function generate(pack: Pack) {
    setBusy(pack.id);
    setError(null);
    try {
      const childMode = isKidPack(pack.id);
      const packConcepts = conceptsForPack(pack.id);
      const strong = packConcepts.filter((c) => c.mastery !== "new").map((c) => c.title);
      const knownTitles = strong.length > 0 ? strong : packConcepts.map((c) => c.title);
      const existingTitles = [
        ...packConcepts.map((c) => c.title),
        ...pending.filter((c) => c.packId === pack.id).map((c) => c.title),
      ];

      const proposal = await proposeConcept({
        packTitle: pack.title,
        knownTitles,
        existingTitles,
        childMode,
      });
      const verdict = await verifyConcept({ packTitle: pack.title, proposal, childMode });

      const conceptId = `${pack.id}-ai-${crypto.randomUUID().slice(0, 8)}`;
      const items: Item[] = [
        {
          id: `${conceptId}__t`,
          conceptId,
          type: "concept-explanation",
          prompt: proposal.teaching.prompt,
          body: proposal.teaching.body,
        },
      ];
      proposal.questions.forEach((q, i) => {
        if (q.type === "pick") {
          const ok = q.choices && q.choices.length >= 2 && q.correctChoice && q.choices.includes(q.correctChoice);
          if (!ok) return;
        }
        items.push({
          id: `${conceptId}__${i}`,
          conceptId,
          type: q.type,
          prompt: q.prompt,
          answer: q.answer,
          body: q.body,
          choices: q.choices,
          correctChoice: q.correctChoice,
        });
      });

      // A concept needs at least one gradable item (beyond the teaching card),
      // or it could never be proven — and anything depending on it would lock
      // forever. Reject a teaching-only proposal rather than approve a dead end.
      if (items.length < 2) {
        throw new Error("That concept came back with no usable questions. Try generating again.");
      }

      const titleToId = new Map(packConcepts.map((c) => [c.title, c.id]));
      const prerequisiteIds = proposal.prerequisiteTitles
        .map((t) => titleToId.get(t))
        .filter((x): x is string => !!x);

      const concept: Concept = {
        id: conceptId,
        packId: pack.id,
        title: proposal.title,
        prerequisiteIds,
        itemIds: items.map((i) => i.id),
        mastery: "new",
        source: "ai",
        status: "pending",
        review: {
          rationale: proposal.rationale,
          recommendation: verdict.recommendation,
          issues: verdict.issues,
        },
      };
      addGeneratedConcept(concept, items);
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className={g.page}>
      <div className={g.top}>
        <button className={g.backBtn} onClick={() => navigate(-1)} aria-label="Back">
          <Icon name="back" size={24} />
        </button>
      </div>

      <h1 className={g.hero}>Grow a course</h1>
      <p className={g.sub}>
        The AI proposes a brand-new concept that builds on what's mastered. Nothing reaches a learner
        until you approve it.
      </p>

      {!aiReady ? (
        <div className={g.section}>
          <p className={g.empty}>Add your API key in Settings (Smarter practice with AI) to generate.</p>
          <div style={{ marginTop: "var(--s-4)" }}>
            <ButtonLink to="/settings" variant="secondary" size="md">
              Open Settings
            </ButtonLink>
          </div>
        </div>
      ) : (
        <>
          <div className={g.section}>
            <div className={g.sectionLabel}>Courses</div>
            {packs.map((pack) => (
              <div key={pack.id} className={g.packRow}>
                <span style={{ fontSize: 26 }} aria-hidden="true">
                  {pack.emoji}
                </span>
                <div className={g.packGrow}>
                  <div className={g.packTitle}>{pack.title}</div>
                  <div className={g.packMeta}>
                    {conceptsForPack(pack.id).length} concepts{isKidPack(pack.id) ? " · kid level" : ""}
                  </div>
                </div>
                <Button size="sm" variant="secondary" onClick={() => generate(pack)} disabled={busy !== null}>
                  {busy === pack.id ? "Generating…" : "Generate next"}
                </Button>
              </div>
            ))}
            {error && <p className={g.error}>{error}</p>}
          </div>

          <div className={g.section}>
            <div className={g.sectionLabel}>Waiting for your review · {pending.length}</div>
            {pending.length === 0 ? (
              <p className={g.empty}>Nothing pending. Generate a concept above and it'll appear here for review.</p>
            ) : (
              pending.map((c) => <ReviewCard key={c.id} concept={c} />)
            )}
          </div>
        </>
      )}
    </div>
  );

  function ReviewCard({ concept }: { concept: Concept }) {
    const ok = concept.review?.recommendation === "approve";
    const childMode = isKidPack(concept.packId);
    const items = concept.itemIds.map((id) => itemById(id)).filter((x): x is Item => !!x);
    const teach = items.find((i) => i.type === "concept-explanation");
    const questions = items.filter((i) => i.type !== "concept-explanation");

    return (
      <div className={g.card}>
        <div className={g.cardTop}>
          <div>
            <div className={g.cPack}>{packById(concept.packId)?.title}</div>
            <div className={g.cTitle}>{concept.title}</div>
          </div>
          <span className={`${g.badge} ${ok ? g.badgeOk : g.badgeReview}`}>
            {ok ? "Checker: looks good" : "Checker: needs your eyes"}
          </span>
        </div>

        {concept.review?.rationale && <p className={g.rationale}>{concept.review.rationale}</p>}

        {concept.review && concept.review.issues.length > 0 && (
          <div className={g.issues}>
            <div className={g.issuesLabel}>Flagged by the checker</div>
            <ul>
              {concept.review.issues.map((x, i) => (
                <li key={i}>{x}</li>
              ))}
            </ul>
          </div>
        )}

        <div className={g.preview}>
          {teach && <div className={g.pTeach}>{teach.body}</div>}
          {questions.map((q) => (
            <div key={q.id} className={g.q}>
              <div className={g.qPrompt}>{q.prompt}</div>
              {q.choices?.map((ch) => (
                <div key={ch} className={`${g.qChoice} ${ch === q.correctChoice ? g.qRight : ""}`}>
                  {ch}
                </div>
              ))}
              {q.answer && <div className={g.qAnswer}>{q.answer}</div>}
            </div>
          ))}
        </div>

        <details className={g.checklist}>
          <summary>What to check before approving</summary>
          <ul>
            {checklistFor(childMode).map((x, i) => (
              <li key={i}>{x}</li>
            ))}
          </ul>
        </details>

        <div className={g.actions}>
          <Button size="md" onClick={() => approveConcept(concept.id)}>
            Approve & add
          </Button>
          <Button size="md" variant="ghost" onClick={() => discardConcept(concept.id)}>
            Discard
          </Button>
        </div>
      </div>
    );
  }
}
