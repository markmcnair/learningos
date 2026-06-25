import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { friendlyError } from "../ai/client";
import {
  getKey,
  getModel,
  modelsFor,
  provider,
  setKey as saveKey,
  setModel as saveModel,
} from "../ai/keys";
import { testConnection } from "../ai/tutor";
import { Avatar, Button, Card, Icon } from "../components/ui";
import { useApp, type ThemePref } from "../data/store";
import type { Intensity } from "../data/types";
import s from "./screens.module.css";
import t from "./Settings.module.css";

const INTENSITY: { value: Intensity; label: string; helper: string }[] = [
  { value: "gentle", label: "Gentle", helper: "About 3 new ideas a day and lighter reviews. Lovely for kids or busy stretches." },
  { value: "steady", label: "Steady", helper: "The balanced default — about 6 new ideas a day, strong memory without overload." },
  { value: "intense", label: "Intense", helper: "About 10 new ideas a day and tighter reviews, for when you want to move fast. You can always tap “Keep going” for more." },
];

const THEMES: { value: ThemePref; label: string }[] = [
  { value: "auto", label: "Auto" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

export function Settings() {
  const { currentProfile, theme, setTheme, setIntensity, setAiEnabled, exportData, resetEverything } =
    useApp();
  const navigate = useNavigate();
  const profile = currentProfile!;
  const [apiKey, setApiKey] = useState(getKey());
  const p = provider(apiKey);
  const [model, setModelState] = useState<string>(getModel(p));
  const [test, setTest] = useState<{ state: "idle" | "testing" | "ok" | "fail"; msg?: string }>({
    state: "idle",
  });

  useEffect(() => {
    setModelState(getModel(p));
  }, [p]);

  function onKeyChange(v: string) {
    setApiKey(v);
    saveKey(v);
    setTest({ state: "idle" });
  }
  function onModelChange(m: string) {
    setModelState(m);
    saveModel(p, m);
  }
  async function runTest() {
    setTest({ state: "testing" });
    try {
      const ok = await testConnection();
      setTest(ok ? { state: "ok" } : { state: "fail", msg: "Unexpected response." });
    } catch (e) {
      setTest({ state: "fail", msg: friendlyError(e) });
    }
  }

  function exportBackup() {
    const blob = new Blob([exportData()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "learningos-backup.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function reset() {
    if (window.confirm("Erase everything on this device and start fresh? This can't be undone.")) {
      resetEverything();
      navigate("/welcome");
    }
  }

  const intensityHelper = INTENSITY.find((i) => i.value === profile.intensity)?.helper;

  return (
    <>
      <header className={s.header}>
        <h1 className={s.greeting}>Settings</h1>
      </header>

      <div className={s.stack}>
        <Card>
          <div className={t.profileCard}>
            <Avatar seed={profile.avatarSeed} name={profile.displayName} size={48} />
            <div className={t.profileGrow}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 500 }}>
                {profile.displayName}
              </div>
              <div className={s.faint} style={{ fontSize: 13 }}>
                {profile.streakDays}-day streak
              </div>
            </div>
            <Button variant="secondary" size="sm" onClick={() => navigate("/welcome")}>
              Switch
            </Button>
          </div>
        </Card>

        <button
          onClick={() => navigate("/system")}
          style={{
            display: "block",
            width: "100%",
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          <Card>
            <div className={t.profileCard}>
              <div className={t.profileGrow}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 500 }}>
                  How LearningOS works
                </div>
                <div className={s.faint} style={{ fontSize: 13, marginTop: 2 }}>
                  The iceberg, the engine, the live numbers — a tour to show someone.
                </div>
              </div>
              <Icon name="arrow-right" size={20} />
            </div>
          </Card>
        </button>

        <button
          onClick={() => navigate("/grow")}
          style={{
            display: "block",
            width: "100%",
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          <Card>
            <div className={t.profileCard}>
              <div className={t.profileGrow}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 500 }}>
                  Grow a course with AI
                </div>
                <div className={s.faint} style={{ fontSize: 13, marginTop: 2 }}>
                  Generate new concepts that build on what's mastered — you approve each one.
                </div>
              </div>
              <Icon name="arrow-right" size={20} />
            </div>
          </Card>
        </button>

        <div className={t.group}>
          <div className={s.sectionLabel}>Practice intensity</div>
          <div className={t.segmented}>
            {INTENSITY.map((i) => (
              <button
                key={i.value}
                className={`${t.seg} ${profile.intensity === i.value ? t.segActive : ""}`}
                onClick={() => setIntensity(i.value)}
              >
                {i.label}
              </button>
            ))}
          </div>
          <p className={t.helper}>{intensityHelper}</p>
        </div>

        <Card>
          <div className={t.toggleRow}>
            <div>
              <h3 style={{ fontSize: 16 }}>Smarter practice with AI</h3>
              <p className={s.muted} style={{ fontSize: 14, marginTop: 4 }}>
                Optional, and off by default. With your own key, a tutor can check your written
                explanations and your end-of-session recall. Your key stays on this device and is
                never included in an export.
              </p>
            </div>
            <button
              className={`${t.toggle} ${profile.aiEnabled ? t.toggleOn : ""}`}
              role="switch"
              aria-checked={profile.aiEnabled}
              aria-label="Smarter practice with AI"
              onClick={() => setAiEnabled(!profile.aiEnabled)}
            >
              <span className={t.knob} />
            </button>
          </div>

          {profile.aiEnabled && (
            <div style={{ marginTop: "var(--s-4)" }}>
              <input
                className={t.keyInput}
                type="password"
                value={apiKey}
                placeholder="Key — Anthropic (sk-ant-…) or OpenRouter (sk-or-…)"
                autoComplete="off"
                spellCheck={false}
                onChange={(e) => onKeyChange(e.target.value)}
              />
              {apiKey.trim() && (
                <p className={s.faint} style={{ fontSize: 12, marginTop: 6 }}>
                  Detected: {p === "openrouter" ? "OpenRouter" : "Anthropic"}
                </p>
              )}

              <div style={{ marginTop: "var(--s-4)" }}>
                <span className={s.faint} style={{ fontSize: 13 }}>
                  Model
                </span>
                {p === "openrouter" ? (
                  <>
                    <input
                      className={t.keyInput}
                      type="text"
                      value={model}
                      spellCheck={false}
                      autoComplete="off"
                      placeholder="e.g. deepseek/deepseek-v4-flash"
                      onChange={(e) => onModelChange(e.target.value)}
                      style={{ marginTop: 6 }}
                    />
                    <div className={t.chips}>
                      {modelsFor(p).map((m) => (
                        <button
                          key={m.id}
                          className={`${t.chip} ${model === m.id ? t.chipActive : ""}`}
                          onClick={() => onModelChange(m.id)}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                    <p className={s.faint} style={{ fontSize: 12, marginTop: 6 }}>
                      Any model id from openrouter.ai/models works.
                    </p>
                  </>
                ) : (
                  <div className={t.segmented} style={{ marginTop: 6 }}>
                    {modelsFor(p).map((m) => (
                      <button
                        key={m.id}
                        className={`${t.seg} ${model === m.id ? t.segActive : ""}`}
                        onClick={() => onModelChange(m.id)}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className={t.dataRow} style={{ marginTop: "var(--s-4)", alignItems: "center" }}>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={runTest}
                  disabled={!apiKey || test.state === "testing"}
                >
                  {test.state === "testing" ? "Testing…" : "Test connection"}
                </Button>
                {test.state === "ok" && (
                  <span style={{ color: "var(--positive)", fontSize: 14 }}>Connected ✓</span>
                )}
                {test.state === "fail" && (
                  <span className={t.danger} style={{ fontSize: 14 }}>
                    {test.msg ?? "Failed"}
                  </span>
                )}
              </div>

              <p className={s.faint} style={{ fontSize: 12, marginTop: "var(--s-3)" }}>
                Calls go straight from this device to Anthropic with your key. Every number in your
                packs stays human-checked — the tutor only judges your words against the lesson, it
                never invents facts.
              </p>
            </div>
          )}
        </Card>

        <div className={t.group}>
          <div className={s.sectionLabel}>Appearance</div>
          <div className={t.segmented}>
            {THEMES.map((th) => (
              <button
                key={th.value}
                className={`${t.seg} ${theme === th.value ? t.segActive : ""}`}
                onClick={() => setTheme(th.value)}
              >
                {th.label}
              </button>
            ))}
          </div>
        </div>

        <Card>
          <h3 style={{ fontSize: 16, marginBottom: "var(--s-2)" }}>Your data</h3>
          <p className={s.muted} style={{ fontSize: 14, marginBottom: "var(--s-4)" }}>
            Everything lives on this device — nothing is uploaded. Keep a backup, or start over.
          </p>
          <div className={t.dataRow}>
            <Button variant="secondary" size="sm" onClick={exportBackup}>
              Export backup
            </Button>
            <Button variant="ghost" size="sm" onClick={reset}>
              <span className={t.danger}>Reset everything</span>
            </Button>
          </div>
        </Card>

        <details className={t.how}>
          <summary>How this works, under the hood</summary>
          <p>
            Every day, a spaced-repetition scheduler (FSRS-6) picks the items you're about to forget,
            a mastery model (BKT) tracks what you truly know, and a prerequisite graph unlocks new
            ideas only once you're ready. You never see any of that — just the one thing to do next.
          </p>
        </details>
      </div>
    </>
  );
}
