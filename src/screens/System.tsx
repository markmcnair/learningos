import { useNavigate } from "react-router-dom";
import { ConceptGraph, ForgettingCurve, Iceberg } from "../components/SystemVisuals";
import { Icon } from "../components/ui";
import { useApp } from "../data/store";
import s from "./System.module.css";

const ENGINE = [
  {
    title: "FSRS-6 scheduler",
    plain: "When to review",
    body: "Predicts the day you're about to forget each item and schedules it for exactly then — the most efficient possible moment to study.",
  },
  {
    title: "Mastery engine · BKT",
    plain: "Do you really know it?",
    body: "A Bayesian model tracks the odds you've truly mastered each concept, so a lucky guess never counts as knowing.",
  },
  {
    title: "Knowledge graph",
    plain: "What's next",
    body: "Concepts unlock only once you're solid on what they depend on, so every new idea lands on a foundation you already have.",
  },
  {
    title: "Successive relearning",
    plain: "Make it stick",
    body: "Pushes each idea to mastery, then re-checks it across spaced sessions — the most durable way learning science has found.",
  },
  {
    title: "Refutation",
    plain: "Unlearn the wrong",
    body: "Names a common wrong idea, corrects it, and re-checks it later — because misconceptions quietly creep back.",
  },
  {
    title: "Reflection & calibration",
    plain: "Know what you know",
    body: "A brain-dump and confidence checks close the gap between what you feel you know and what you actually do.",
  },
];

const LOOP = ["Open", "One thing today", "Learn & recall", "Reflect", "Come back tomorrow"];

export function System() {
  const { packs, concepts, items, profiles, reviews, conceptsForPack } = useApp();
  const navigate = useNavigate();

  const solid = concepts.filter((c) => c.mastery === "solid").length;
  const graphConcepts =
    conceptsForPack("trading-foundations").length > 0
      ? conceptsForPack("trading-foundations")
      : conceptsForPack(packs[0]?.id ?? "");

  const tiles = [
    { num: packs.length, label: "courses" },
    { num: concepts.length, label: "concepts mapped" },
    { num: items.length, label: "questions & cards" },
    { num: profiles.length, label: "learners" },
  ];

  return (
    <div className={s.page}>
      <div className={s.top}>
        <button className={s.backBtn} onClick={() => navigate(-1)} aria-label="Back">
          <Icon name="back" size={24} />
        </button>
      </div>

      <h1 className={s.hero}>How LearningOS works</h1>
      <p className={s.heroSub}>The simple surface — and the serious engine underneath.</p>

      <div className={s.section}>
        <div className={s.panel}>
          <Iceberg />
        </div>
      </div>

      <div className={s.section}>
        <div className={s.sectionLabel}>What's inside right now</div>
        <div className={s.stats}>
          {tiles.map((t) => (
            <div key={t.label} className={s.tile}>
              <div className={s.tileNum}>{t.num}</div>
              <div className={s.tileLabel}>{t.label}</div>
            </div>
          ))}
        </div>
        <p className={s.caption}>
          {reviews.length > 0
            ? `${reviews.length} answers logged so far · ${solid} of ${concepts.length} concepts are solid.`
            : "Every answer feeds the engine. The more you practice, the better it schedules."}
        </p>
      </div>

      <div className={s.section}>
        <div className={s.sectionLabel}>The daily loop</div>
        <div className={s.loop}>
          {LOOP.map((step, i) => (
            <span key={step} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <span className={s.loopStep}>{step}</span>
              {i < LOOP.length - 1 && (
                <span className={s.loopArrow}>
                  <Icon name="arrow-right" size={16} />
                </span>
              )}
            </span>
          ))}
        </div>
        <p className={s.caption}>
          Ten to twenty calm minutes a day. It always ends. The reward is momentum — close the app
          having moved the ball forward.
        </p>
      </div>

      <div className={s.section}>
        <div className={s.sectionLabel}>Under the surface — the engine</div>
        <div className={s.engine}>
          {ENGINE.map((e) => (
            <div key={e.title} className={s.eCard}>
              <div className={s.eTitle}>{e.title}</div>
              <div className={s.ePlain}>{e.plain}</div>
              <div className={s.eBody}>{e.body}</div>
            </div>
          ))}
        </div>
      </div>

      <div className={s.section}>
        <div className={s.sectionLabel}>The science of spacing</div>
        <div className={s.panel}>
          <ForgettingCurve />
        </div>
        <p className={s.caption}>
          Memory fades along a curve. Each review at the right moment (the dots) lifts it back up and
          makes the next fade slower — so you stay above 90% with fewer and fewer reviews.
        </p>
      </div>

      <div className={s.section}>
        <div className={s.sectionLabel}>The knowledge graph</div>
        <div className={s.panel}>
          <ConceptGraph concepts={graphConcepts} />
        </div>
        <div className={s.legend}>
          <span className={s.legendItem}>
            <span className={s.dot} style={{ background: "var(--signal-solid-bg)", borderColor: "var(--positive)" }} />
            Solid
          </span>
          <span className={s.legendItem}>
            <span
              className={s.dot}
              style={{ background: "var(--signal-getting-bg)", borderColor: "var(--signal-getting-text)" }}
            />
            Getting it
          </span>
          <span className={s.legendItem}>
            <span className={s.dot} style={{ background: "var(--signal-new-bg)", borderColor: "var(--border-strong)" }} />
            New
          </span>
        </div>
        <p className={s.caption}>
          Every concept depends on the ones beneath it. The colors are real mastery — the graph
          unlocks upward as the foundations turn solid.
        </p>
      </div>

      <p className={s.footer}>
        Local-first · no accounts · open source.
        <br />
        The whole engine runs on your device.
      </p>
    </div>
  );
}
