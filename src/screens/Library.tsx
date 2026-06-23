import { Button, Card } from "../components/ui";
import { useApp } from "../data/store";
import s from "./screens.module.css";

export function Library() {
  const { packs, currentProfile, addPackToProfile } = useApp();
  const active = new Set(currentProfile?.activePackIds ?? []);

  return (
    <>
      <header className={s.header}>
        <div>
          <h1 className={s.greeting}>Library</h1>
          <p className={s.subtle}>The engine is the same. Point it at anything.</p>
        </div>
      </header>

      <div className={s.stack}>
        {packs.map((pack) => {
          const isActive = active.has(pack.id);
          return (
            <Card key={pack.id}>
              <div style={{ display: "flex", gap: "var(--s-4)", alignItems: "flex-start" }}>
                <span style={{ fontSize: 30, lineHeight: 1 }} aria-hidden="true">
                  {pack.emoji}
                </span>
                <div style={{ flex: 1 }}>
                  <div className={s.rowBetween} style={{ alignItems: "flex-start" }}>
                    <h3>{pack.title}</h3>
                    {isActive ? (
                      <span style={{ fontSize: 13, color: "var(--positive)", fontWeight: 500 }}>
                        Learning
                      </span>
                    ) : (
                      <Button size="sm" variant="secondary" onClick={() => addPackToProfile(pack.id)}>
                        Add
                      </Button>
                    )}
                  </div>
                  <p className={s.muted} style={{ fontSize: 15, marginTop: 6 }}>
                    {pack.description}
                  </p>
                  <p className={s.faint} style={{ fontSize: 13, marginTop: "var(--s-3)" }}>
                    {pack.conceptIds.length} concepts
                  </p>
                </div>
              </div>
            </Card>
          );
        })}

        <Card>
          <h3 style={{ marginBottom: "var(--s-2)" }}>Anyone can write a pack</h3>
          <p className={s.muted} style={{ fontSize: 15 }}>
            A pack is just plain content — concepts, a few items, and what unlocks what. LearningOS
            is open source, so packs for languages, anatomy, chess, or your own field can live right
            alongside these.
          </p>
        </Card>
      </div>
    </>
  );
}
