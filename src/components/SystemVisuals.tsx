import type { Concept, MasterySignal } from "../data/types";
import { retrievability } from "../engine/fsrs";

// All visuals are theme-aware SVG (CSS variables for fills), so they work in
// light and dark mode and scale to the container.

const SIGNAL: Record<MasterySignal, { fill: string; stroke: string; text: string }> = {
  new: { fill: "var(--signal-new-bg)", stroke: "var(--border-strong)", text: "var(--signal-new-text)" },
  "getting-it": {
    fill: "var(--signal-getting-bg)",
    stroke: "var(--signal-getting-text)",
    text: "var(--signal-getting-text)",
  },
  solid: { fill: "var(--signal-solid-bg)", stroke: "var(--positive)", text: "var(--signal-solid-text)" },
};

function clip(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

// ---------------------------------------------------------------------------
// The iceberg — the simple surface over the deep engine.
// ---------------------------------------------------------------------------

const ENGINE_LAYERS = [
  "Session orchestrator",
  "FSRS-6 scheduler",
  "Knowledge graph",
  "Mastery engine · BKT",
  "AI under guardrails",
  "Reflection & calibration",
];

export function Iceberg() {
  const top = 196;
  const bandH = 42;
  const gap = 8;
  return (
    <svg width="100%" viewBox="0 0 680 540" role="img" aria-label="The simple daily surface rests on a deep learning engine">
      <text x="340" y="26" textAnchor="middle" fontSize="13" fill="var(--text-faint)" fontWeight="500">
        WHAT YOU SEE
      </text>

      {/* surface card */}
      <rect x="210" y="42" width="260" height="104" rx="16" fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="1.5" />
      <text x="232" y="74" fontSize="17" fontWeight="500" fill="var(--accent-hover)" fontFamily="var(--font-display)">
        Today
      </text>
      <text x="448" y="74" textAnchor="end" fontSize="12" fill="var(--accent-hover)">day 24</text>
      <text x="232" y="100" fontSize="13" fill="var(--accent-hover)">5 to practice · about 12 min</text>
      <rect x="232" y="112" width="206" height="24" rx="12" fill="var(--accent)" />
      <text x="335" y="128" textAnchor="middle" fontSize="13" fontWeight="500" fill="var(--on-accent)">Start today</text>

      {/* waterline */}
      <line x1="40" y1="170" x2="640" y2="170" stroke="var(--accent)" strokeWidth="2" />
      <text x="636" y="164" textAnchor="end" fontSize="11" fill="var(--text-faint)">the waterline</text>

      {ENGINE_LAYERS.map((label, i) => {
        const y = top + i * (bandH + gap);
        return (
          <g key={label}>
            <rect x="80" y={y} width="520" height={bandH} rx="10" fill="var(--surface-sunk)" stroke="var(--border)" />
            <text x="100" y={y + 26} fontSize="14" fontWeight="500" fill="var(--text)">
              {label}
            </text>
          </g>
        );
      })}

      <text x="340" y="520" textAnchor="middle" fontSize="13" fill="var(--text-faint)">
        a calm surface resting on deep, battle-tested science
      </text>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// The FSRS spacing sawtooth — why reviews keep memory high.
// ---------------------------------------------------------------------------

export function ForgettingCurve() {
  const W = 680;
  const H = 240;
  const padL = 48;
  const padR = 24;
  const padT = 24;
  const padB = 40;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const stabilities = [3, 8, 20, 45];
  const total = stabilities.reduce((a, b) => a + b, 0);
  const X = (t: number) => padL + (t / total) * plotW;
  // map retention 0.82..1.0 across the plot height for a visible sawtooth
  const Y = (r: number) => padT + (1 - Math.max(0, Math.min(1, (r - 0.82) / 0.18))) * plotH;

  const points: string[] = [];
  const reviewDots: { x: number; y: number }[] = [];
  let t = 0;
  stabilities.forEach((S, i) => {
    const steps = 24;
    for (let k = 0; k <= steps; k++) {
      const tt = (S * k) / steps;
      points.push(`${X(t + tt).toFixed(1)},${Y(retrievability(tt, S)).toFixed(1)}`);
    }
    t += S;
    if (i < stabilities.length - 1) {
      points.push(`${X(t).toFixed(1)},${Y(1).toFixed(1)}`); // review resets retention
      reviewDots.push({ x: X(t), y: Y(1) });
    }
  });

  const y90 = Y(0.9);

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Spaced reviews keep memory high over time">
      {/* 90% guide line */}
      <line x1={padL} y1={y90} x2={W - padR} y2={y90} stroke="var(--border-strong)" strokeDasharray="3 4" />
      <text x={padL - 8} y={y90 + 4} textAnchor="end" fontSize="11" fill="var(--text-faint)">90%</text>
      {/* axes */}
      <line x1={padL} y1={padT} x2={padL} y2={H - padB} stroke="var(--border)" />
      <line x1={padL} y1={H - padB} x2={W - padR} y2={H - padB} stroke="var(--border)" />
      <text x={padL} y={H - 14} fontSize="11" fill="var(--text-faint)">time →</text>
      <text x={W - padR} y={H - 14} textAnchor="end" fontSize="11" fill="var(--text-faint)">each review at the perfect moment</text>

      <polyline points={points.join(" ")} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinejoin="round" />
      {reviewDots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r="4" fill="var(--accent)" />
      ))}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// The knowledge graph — concepts as nodes, prerequisites as edges, colored by
// the learner's real mastery. Laid out top-to-bottom by prerequisite depth.
// ---------------------------------------------------------------------------

export function ConceptGraph({ concepts }: { concepts: Concept[] }) {
  if (concepts.length === 0) return null;
  const byId = new Map(concepts.map((c) => [c.id, c]));

  const depthMemo = new Map<string, number>();
  function depth(id: string, seen: Set<string> = new Set()): number {
    if (depthMemo.has(id)) return depthMemo.get(id)!;
    const c = byId.get(id);
    if (!c || c.prerequisiteIds.length === 0 || seen.has(id)) {
      depthMemo.set(id, 0);
      return 0;
    }
    seen.add(id);
    const v = 1 + Math.max(0, ...c.prerequisiteIds.filter((p) => byId.has(p)).map((p) => depth(p, seen)));
    depthMemo.set(id, v);
    return v;
  }
  concepts.forEach((c) => depth(c.id));

  const byDepth = new Map<number, Concept[]>();
  let maxDepth = 0;
  for (const c of concepts) {
    const d = depthMemo.get(c.id) ?? 0;
    maxDepth = Math.max(maxDepth, d);
    (byDepth.get(d) ?? byDepth.set(d, []).get(d)!).push(c);
  }

  const W = 680;
  const rowGap = 84;
  const nodeW = 132;
  const nodeH = 38;
  const top = 30;
  const H = top + (maxDepth + 1) * rowGap;

  const pos = new Map<string, { x: number; y: number }>();
  for (let d = 0; d <= maxDepth; d++) {
    const row = byDepth.get(d) ?? [];
    row.forEach((c, i) => {
      const x = ((i + 1) / (row.length + 1)) * W;
      const y = top + d * rowGap;
      pos.set(c.id, { x, y });
    });
  }

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Knowledge graph of concepts and prerequisites">
      {concepts.flatMap((c) =>
        c.prerequisiteIds
          .filter((p) => pos.has(p) && pos.has(c.id))
          .map((p) => {
            const a = pos.get(p)!;
            const b = pos.get(c.id)!;
            return (
              <path
                key={`${p}-${c.id}`}
                d={`M ${a.x} ${a.y + nodeH / 2} C ${a.x} ${a.y + rowGap / 2}, ${b.x} ${b.y - rowGap / 2}, ${b.x} ${b.y - nodeH / 2}`}
                fill="none"
                stroke="var(--border-strong)"
                strokeWidth="1.5"
              />
            );
          }),
      )}
      {concepts.map((c) => {
        const p = pos.get(c.id);
        if (!p) return null;
        const sig = SIGNAL[c.mastery];
        return (
          <g key={c.id}>
            <rect x={p.x - nodeW / 2} y={p.y - nodeH / 2} width={nodeW} height={nodeH} rx="10" fill={sig.fill} stroke={sig.stroke} strokeWidth="1.5" />
            <text x={p.x} y={p.y + 4} textAnchor="middle" fontSize="12" fontWeight="500" fill={sig.text}>
              {clip(c.title, 18)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
