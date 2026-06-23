import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Local-first single-page app. No server, no backend. Builds to static files
// that can be opened from disk or hosted anywhere.
export default defineConfig({
  plugins: [react()],
  base: "/",
});
