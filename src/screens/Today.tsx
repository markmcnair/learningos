import { Link, useNavigate } from "react-router-dom";
import { Avatar, Button, ButtonLink, Card, Icon, Streak } from "../components/ui";
import { APP_TODAY } from "../data/mockData";
import { useApp } from "../data/store";
import { engine } from "../engine/realEngine";
import s from "./screens.module.css";

function greeting(name: string): string {
  const h = new Date().getHours();
  const part = h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  return `${part}, ${name}.`;
}

export function Today() {
  const { currentProfile, todaySession, concepts, items, startExtraSession, hasMoreToLearn, moreLockedAhead } =
    useApp();
  const navigate = useNavigate();
  const profile = currentProfile!;

  // Mirror the session builder: pending (un-approved AI) concepts never count.
  const liveConcepts = concepts.filter((c) => c.status !== "pending");
  const liveIds = new Set(liveConcepts.map((c) => c.id));
  const preview = engine.buildTodaySession({
    profile,
    concepts: liveConcepts,
    items: items.filter((i) => liveIds.has(i.conceptId)),
    date: APP_TODAY,
  });

  function keepGoing() {
    startExtraSession();
    navigate("/session");
  }

  const done = todaySession?.state === "complete";
  const inProgress =
    todaySession?.state === "in-progress" && todaySession.currentIndex > 0;
  const count = todaySession ? todaySession.itemIds.length : preview.itemIds.length;
  const minutes = todaySession ? todaySession.estMinutes : preview.estMinutes;
  const nothingDue = !todaySession && count === 0;

  // "Settling": there's more to learn, but it's gated behind foundations that
  // need a day to prove they stuck. The honest TRUE-learning pause, not a wall.
  const settling = !hasMoreToLearn && moreLockedAhead;
  const caughtUpBody = hasMoreToLearn
    ? "Nothing is due right now — but there's new ground whenever you want it."
    : settling
      ? "The next ideas unlock as what you've learned proves it stuck. Come back tomorrow — that day's rest is doing real work."
      : "Nothing is due right now. Rest is part of how memory sticks — see you tomorrow.";

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
            <p className={s.muted}>{done ? todaySession?.summary?.headline ?? "Nicely done." : caughtUpBody}</p>
            {done && settling && (
              <p className={s.faint} style={{ fontSize: 14, marginTop: "calc(-1 * var(--s-2))" }}>
                The next ideas unlock as today's foundations settle — see you tomorrow.
              </p>
            )}
            <div
              style={{
                marginTop: "var(--s-2)",
                display: "flex",
                flexDirection: "column",
                gap: "var(--s-3)",
                alignItems: "flex-start",
              }}
            >
              {hasMoreToLearn && (
                <Button size="md" onClick={keepGoing}>
                  Keep going
                  <Icon name="arrow-right" size={18} />
                </Button>
              )}
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
