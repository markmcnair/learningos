import { Link } from "react-router-dom";
import { Avatar, ButtonLink, Card, Icon, Streak } from "../components/ui";
import { APP_TODAY } from "../data/mockData";
import { useApp } from "../data/store";
import { mockEngine } from "../engine/mockEngine";
import s from "./screens.module.css";

function greeting(name: string): string {
  const h = new Date().getHours();
  const part = h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  return `${part}, ${name}.`;
}

export function Today() {
  const { currentProfile, todaySession, concepts, items } = useApp();
  const profile = currentProfile!;

  const preview = mockEngine.buildTodaySession({
    profile,
    concepts,
    items,
    date: APP_TODAY,
  });

  const done = todaySession?.state === "complete";
  const inProgress =
    todaySession?.state === "in-progress" && todaySession.currentIndex > 0;
  const count = todaySession ? todaySession.itemIds.length : preview.itemIds.length;
  const minutes = todaySession ? todaySession.estMinutes : preview.estMinutes;
  const nothingDue = !todaySession && count === 0;

  return (
    <>
      <header className={s.header}>
        <div>
          <h1 className={s.greeting}>{greeting(profile.displayName)}</h1>
          <div className={s.subtle}>
            <Streak days={profile.streakDays} />
          </div>
        </div>
        <Link to="/welcome" className={s.avatarBtn} aria-label="Switch profile">
          <Avatar seed={profile.avatarSeed} name={profile.displayName} size={44} />
        </Link>
      </header>

      {done || nothingDue ? (
        <Card focal>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--s-4)" }}>
            <span style={{ color: "var(--positive)" }}>
              <Icon name="check" size={30} strokeWidth={2} />
            </span>
            <h2>{done ? "Done for today." : "You're all caught up."}</h2>
            <p className={s.muted}>
              {done
                ? todaySession?.summary?.headline ?? "Nicely done."
                : "Nothing is due right now. Rest is part of how memory sticks — see you tomorrow."}
            </p>
            <div style={{ marginTop: "var(--s-2)" }}>
              <ButtonLink to="/progress" variant="secondary" size="md">
                See your map
              </ButtonLink>
            </div>
          </div>
        </Card>
      ) : (
        <Card focal>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--s-5)" }}>
            <div>
              <div className={s.sectionLabel} style={{ marginBottom: "var(--s-2)" }}>
                Today
              </div>
              <h2 style={{ marginBottom: "var(--s-2)" }}>
                {inProgress ? "Pick up where you left off." : "One short session."}
              </h2>
              <p className={s.muted}>
                {count} thing{count === 1 ? "" : "s"} to practice · about {minutes} minutes. It
                always ends — that's the point.
              </p>
            </div>
            <ButtonLink to="/session" size="lg" block>
              {inProgress ? "Continue" : "Start today"}
              <Icon name="arrow-right" size={20} />
            </ButtonLink>
          </div>
        </Card>
      )}

      {!done && !nothingDue && (
        <p className={s.faint} style={{ textAlign: "center", marginTop: "var(--s-6)", fontSize: 14 }}>
          Move the ball forward today.
        </p>
      )}
    </>
  );
}
