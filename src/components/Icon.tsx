// A small, consistent set of line icons. Stroke inherits currentColor so they
// take the color of their context and adapt to dark mode for free.

export type IconName =
  | "today"
  | "progress"
  | "library"
  | "settings"
  | "back"
  | "check"
  | "spark"
  | "close"
  | "plus"
  | "sun"
  | "moon"
  | "flame"
  | "arrow-right";

const PATHS: Record<IconName, string> = {
  today: "M4 9h16M4 9a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2M4 9v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9M8 4v4M16 4v4",
  progress: "M5 19V11M12 19V5M19 19v-5",
  library: "M4 7l8-3 8 3-8 3-8-3Zm0 5l8 3 8-3M4 17l8 3 8-3",
  settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8-3a8 8 0 0 0-.13-1.4l2-1.55-2-3.46-2.36.95a8 8 0 0 0-2.42-1.4L12.6 2h-1.2l-.49 2.74a8 8 0 0 0-2.42 1.4L6.13 5.2l-2 3.46 2 1.55a8 8 0 0 0 0 2.8l-2 1.55 2 3.46 2.36-.95a8 8 0 0 0 2.42 1.4L11.4 22h1.2l.49-2.74a8 8 0 0 0 2.42-1.4l2.36.95 2-3.46-2-1.55A8 8 0 0 0 20 12Z",
  back: "M15 6l-6 6 6 6",
  check: "M5 13l4 4L19 7",
  spark: "M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18",
  close: "M6 6l12 12M18 6 6 18",
  plus: "M12 5v14M5 12h14",
  sun: "M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10ZM12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19",
  moon: "M20 14a8 8 0 0 1-10-10 8 8 0 1 0 10 10Z",
  flame: "M12 3c1 3-1 4-2 6a4 4 0 1 0 7 2c0-3-3-4-5-8ZM12 21a4 4 0 0 1-1-7",
  "arrow-right": "M5 12h14M13 6l6 6-6 6",
};

export function Icon({
  name,
  size = 22,
  strokeWidth = 1.6,
  label,
}: {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  label?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? "img" : "presentation"}
      aria-hidden={label ? undefined : true}
      aria-label={label}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
