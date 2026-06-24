import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { useApp } from "./data/store";
import { Library } from "./screens/Library";
import { Progress } from "./screens/Progress";
import { Session } from "./screens/Session";
import { Grow } from "./screens/Grow";
import { Settings } from "./screens/Settings";
import { System } from "./screens/System";
import { Today } from "./screens/Today";
import { Welcome } from "./screens/Welcome";

function RequireProfile({ children }: { children: ReactNode }) {
  const { currentProfile } = useApp();
  if (!currentProfile) return <Navigate to="/welcome" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/welcome" element={<Welcome />} />
      <Route
        element={
          <RequireProfile>
            <AppShell />
          </RequireProfile>
        }
      >
        <Route path="/" element={<Today />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/library" element={<Library />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route
        path="/session"
        element={
          <RequireProfile>
            <Session />
          </RequireProfile>
        }
      />
      <Route path="/system" element={<System />} />
      <Route path="/grow" element={<Grow />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
