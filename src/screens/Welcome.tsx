import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, Button } from "../components/ui";
import { useApp } from "../data/store";
import type { ID, ReadingLevel } from "../data/types";
import s from "./screens.module.css";
import w from "./Welcome.module.css";

export function Welcome() {
  const { profiles, packs, selectProfile, createProfile } = useApp();
  const navigate = useNavigate();

  const [adding, setAdding] = useState(profiles.length === 0);
  const [name, setName] = useState("");
  const [level, setLevel] = useState<ReadingLevel>("general");
  const [packId, setPackId] = useState<ID>(packs[0]?.id ?? "");

  function pick(id: ID) {
    selectProfile(id);
    navigate("/");
  }

  function create() {
    if (!name.trim() || !packId) return;
    createProfile({ displayName: name, readingLevel: level, packId });
    navigate("/");
  }

  return (
    <div className={s.centerScreen}>
      <div className={s.brandMark}>
        <img src="/icon.svg" width={36} height={36} alt="" />
        <span className={s.brandName}>LearningOS</span>
      </div>

      {!adding ? (
        <>
          <h1 className={s.greeting} style={{ marginBottom: "var(--s-2)" }}>
            Who's learning?
          </h1>
          <p className={s.subtle} style={{ marginBottom: "var(--s-6)" }}>
            Everything stays on this device. Pick yourself, or add someone.
          </p>

          <div className={w.list}>
            {profiles.map((p) => (
              <button key={p.id} className={w.profileRow} onClick={() => pick(p.id)}>
                <Avatar seed={p.avatarSeed} name={p.displayName} size={44} />
                <span className={w.rowGrow}>
                  <div className={w.rowName}>{p.displayName}</div>
                  <div className={w.rowMeta}>
                    {p.streakDays > 0 ? `${p.streakDays}-day streak` : "Ready to begin"}
                  </div>
                </span>
              </button>
            ))}
          </div>

          <div style={{ marginTop: "var(--s-5)" }}>
            <Button variant="ghost" size="md" onClick={() => setAdding(true)}>
              + Add someone
            </Button>
          </div>
        </>
      ) : (
        <>
          <h1 className={s.greeting} style={{ marginBottom: "var(--s-2)" }}>
            Add a learner
          </h1>
          <p className={s.subtle} style={{ marginBottom: "var(--s-6)" }}>
            Just a name and where to start. No account, ever.
          </p>

          <div className={w.form}>
            <div className={w.field}>
              <label className={w.label} htmlFor="name">
                Their name
              </label>
              <input
                id="name"
                className={w.input}
                value={name}
                placeholder="e.g. Sage"
                autoFocus
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && create()}
              />
            </div>

            <div className={w.field}>
              <span className={w.label}>Who's this for?</span>
              <div className={w.choices}>
                <button
                  className={`${w.choice} ${level !== "child" ? w.choiceActive : ""}`}
                  onClick={() => setLevel("general")}
                >
                  A grown-up
                </button>
                <button
                  className={`${w.choice} ${level === "child" ? w.choiceActive : ""}`}
                  onClick={() => setLevel("child")}
                >
                  A child
                </button>
              </div>
            </div>

            <div className={w.field}>
              <span className={w.label}>Start with</span>
              <div className={w.choices}>
                {packs.map((p) => (
                  <button
                    key={p.id}
                    className={`${w.choice} ${packId === p.id ? w.choiceActive : ""}`}
                    onClick={() => setPackId(p.id)}
                  >
                    {p.emoji} {p.title}
                  </button>
                ))}
              </div>
            </div>

            <div className={s.rowBetween}>
              {profiles.length > 0 ? (
                <Button variant="ghost" size="md" onClick={() => setAdding(false)}>
                  Back
                </Button>
              ) : (
                <span />
              )}
              <Button size="md" onClick={create} disabled={!name.trim()}>
                Start learning
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
