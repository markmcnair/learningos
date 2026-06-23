import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";
import type { MasterySignal } from "../data/types";
import { Icon } from "./Icon";
import s from "./ui.module.css";

export { Icon } from "./Icon";
export type { IconName } from "./Icon";

type Variant = "primary" | "secondary" | "ghost";
type Size = "lg" | "md" | "sm";

function classes(...xs: (string | false | undefined)[]) {
  return xs.filter(Boolean).join(" ");
}

export function Button({
  variant = "primary",
  size = "md",
  block,
  className,
  children,
  ...rest
}: {
  variant?: Variant;
  size?: Size;
  block?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={classes(s.btn, s[variant], s[size], block && s.block, className)}
      {...rest}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  to,
  variant = "primary",
  size = "md",
  block,
  children,
}: {
  to: string;
  variant?: Variant;
  size?: Size;
  block?: boolean;
  children: ReactNode;
}) {
  return (
    <Link to={to} className={classes(s.btn, s[variant], s[size], block && s.block)}>
      {children}
    </Link>
  );
}

export function Card({
  focal,
  className,
  children,
}: {
  focal?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return <div className={classes(s.card, focal && s.cardFocal, className)}>{children}</div>;
}

const SIGNAL_LABEL: Record<MasterySignal, string> = {
  new: "New",
  "getting-it": "Getting it",
  solid: "Solid",
};
const SIGNAL_CLASS: Record<MasterySignal, string> = {
  new: s.signalNew,
  "getting-it": s.signalGetting,
  solid: s.signalSolid,
};

export function MasteryPill({ signal }: { signal: MasterySignal }) {
  return (
    <span className={classes(s.pill, SIGNAL_CLASS[signal])}>
      <span className={s.pillDot} aria-hidden="true" />
      {SIGNAL_LABEL[signal]}
    </span>
  );
}

export function ProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <div
      className={s.dots}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={current}
      aria-label="Progress through today's session"
    >
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={classes(s.dot, i < current && s.dotDone, i === current && s.dotCurrent)}
          style={{ width: i === current ? 22 : 6 }}
        />
      ))}
    </div>
  );
}

const AVATAR_COLORS: Record<string, string> = {
  ember: "#E8743B",
  frost: "#5B86A6",
  lemon: "#C9A227",
  sky: "#4F86C6",
  moss: "#5E8C61",
};

export function Avatar({ seed, name, size = 40 }: { seed: string; name: string; size?: number }) {
  const bg = AVATAR_COLORS[seed] ?? AVATAR_COLORS.ember;
  return (
    <span
      className={s.avatar}
      style={{ background: bg, width: size, height: size, fontSize: size * 0.42 }}
      aria-hidden="true"
    >
      {name.trim().charAt(0).toUpperCase()}
    </span>
  );
}

export function Streak({ days }: { days: number }) {
  if (days <= 0) return null;
  return (
    <span className={s.streak}>
      <Icon name="flame" size={16} />
      {days} day{days === 1 ? "" : "s"}
    </span>
  );
}
