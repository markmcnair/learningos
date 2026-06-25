import { Card, MasteryPill } from "../components/ui";
import { useApp } from "../data/store";
import s from "./screens.module.css";

function SegBar({ solid, getting, fresh }: { solid: number; getting: number; fresh: number }) {
  const total = Math.max(1, solid + getting + fresh);
  const pct = (n: number) => `${(n / total) * 100}%`;
  return (
    <div className={s.segbar} aria-hidden="true">
      {solid > 0 && <span className={s.segSolid} style={{ width: pct(solid) }} />}
      {getting > 0 && <span className={s.segGetting} style={{ width: pct(getting) }} />}
      {fresh > 0 && <span className={s.segNew} style={{ width: pct(fresh) }} />}
    </div>
  );
}

export function Progress() {
  const {
    currentProfile,
    packById,
    conceptById,
    conceptsForPack,
    progressForCurrent,
    calibrationForCurrent,
    lockedPrereqs,
  } = useApp();
  const profile = currentProfile!;
  const snapshots = progressForCurrent();
  const calibration = calibrationForCurrent();

  return (
    <>
      <header className={s.header}>
        <div>
          <h1 className={s.greeting}>How you're doing</h1>
          <p className={s.subtle}>What's taking root, and what's next.</p>
        </div>
      </header>

      <div className={s.stack}>
        {snapshots.map((snap) => {
          const pack = packById(snap.packId);
          const concepts = conceptsForPack(snap.packId);
          return (
            <Card key={snap.packId}>
              <div className={s.rowBetween} style={{ marginBottom: "var(--s-4)" }}>
                <h3>
                  {pack?.emoji} {pack?.title}
                </h3>
                <span className={s.faint} style={{ fontSize: 14 }}>
                  {snap.solid} of {snap.totalConcepts} solid
                </span>
              </div>

              <SegBar solid={snap.solid} getting={snap.gettingIt} fresh={snap.new} />

              {snap.nextUp.length > 0 && (
                <p className={s.muted} style={{ marginTop: "var(--s-4)", fontSize: 15 }}>
                  Up next:{" "}
                  {snap.nextUp
                    .map((id) => conceptById(id)?.title)
                    .filter(Boolean)
                    .join(", ")}
                </p>
              )}

              <div style={{ marginTop: "var(--s-5)", display: "flex", flexDirection: "column", gap: "var(--s-2)" }}>
                {concepts.map((c) => {
                  // Locked = not yet started, with prerequisites still unproven.
                  const unmet = c.mastery === "new" ? lockedPrereqs(c.id) : [];
                  const locked = unmet.length > 0;
                  return (
                    <div key={c.id} className={s.rowBetween}>
                      <span className={locked ? s.faint : undefined} style={{ fontSize: 15 }}>
                        {locked && <span className="sr-only">Locked — </span>}
                        {locked ? <span aria-hidden="true">🔒 </span> : null}
                        {c.title}
                      </span>
                      {locked ? (
                        <span className={s.faint} style={{ fontSize: 12, textAlign: "right", maxWidth: "55%" }}>
                          unlocks after {unmet.map((p) => p.title).join(", ")}
                        </span>
                      ) : (
                        <MasteryPill signal={c.mastery} />
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })}

        <div>
          <div className={s.sectionLabel}>What you think vs. what you know</div>
          <Card>
            {calibration.length === 0 ? (
              <p className={s.muted} style={{ fontSize: 15 }}>
                Do a few sessions and use the “how sure are you?” taps. We'll quietly show you where
                your gut runs ahead of — or behind — what you actually know.
              </p>
            ) : (
              <div>
                <div className={s.rowBetween} style={{ marginBottom: "var(--s-3)", fontSize: 13 }}>
                  <span className={s.faint}>Felt sure</span>
                  <span style={{ color: "var(--accent)" }}>Actually right</span>
                </div>
                {calibration.map((p) => (
                  <div key={p.conceptId} className={s.compareRow}>
                    <span style={{ fontSize: 14 }}>{p.conceptTitle}</span>
                    <div className={s.compareTrack}>
                      <div className={s.compareFillThink} style={{ width: `${p.youThink * 100}%` }} />
                    </div>
                    <div className={s.compareTrack}>
                      <div className={s.compareFillKnow} style={{ width: `${p.youActually * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      <p className={s.faint} style={{ textAlign: "center", marginTop: "var(--s-6)", fontSize: 13 }}>
        {profile.displayName}'s map · grows a little every day
      </p>
    </>
  );
}
