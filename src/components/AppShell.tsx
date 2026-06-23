import { NavLink, Outlet } from "react-router-dom";
import { Icon, type IconName } from "./Icon";
import s from "./AppShell.module.css";

const TABS: { to: string; label: string; icon: IconName }[] = [
  { to: "/", label: "Today", icon: "today" },
  { to: "/progress", label: "Progress", icon: "progress" },
  { to: "/library", label: "Library", icon: "library" },
  { to: "/settings", label: "Settings", icon: "settings" },
];

export function AppShell() {
  return (
    <div className={s.shell}>
      <main className={s.content}>
        <Outlet />
      </main>
      <nav className={s.nav} aria-label="Main">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === "/"}
            className={({ isActive }) => `${s.tab} ${isActive ? s.tabActive : ""}`}
          >
            <Icon name={tab.icon} size={22} />
            {tab.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
