import { execSync } from "node:child_process";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// The light background colour, kept in step with src/styles/base.css.
const BACKGROUND = "#f4f7fe";

// The version line in Settings, e.g. "24 Nov 2026 · 304be28": the build date means something
// to the Teacher, the short commit tells us what her phone has installed. index.html shows it
// as %VITE_APP_VERSION%, which Vite fills in from the environment.
function version() {
  const date = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date());
  try {
    return `${date} · ${execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim()}`;
  } catch {
    return date; // not built from a git checkout
  }
}
process.env.VITE_APP_VERSION = version();
// The same, for language_controller.js to write the date in the app's language.
process.env.VITE_APP_BUILT = new Date().toISOString().slice(0, 10);
try {
  process.env.VITE_APP_COMMIT = execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim();
} catch {
  process.env.VITE_APP_COMMIT = "";
}

// GitHub Pages serves the app at https://bosquedepalma.github.io/yogi/, so the build lives
// under /yogi/. The dev server stays at the root, where the Simulator's Home Screen app points.
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/yogi/" : "/",
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "script-defer",
      // Everything in dist/ is precached by globPatterns below.
      includeManifestIcons: false,
      manifest: {
        name: "Yogi Timer",
        short_name: "Yogi Timer",
        description: "One-tap countdown timer for teaching yoga, with a history of lessons.",
        display: "standalone",
        orientation: "portrait",
        start_url: ".",
        scope: ".",
        background_color: BACKGROUND,
        theme_color: BACKGROUND,
        icons: [
          { src: "pwa-64x64.png", sizes: "64x64", type: "image/png" },
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
          { src: "maskable-icon-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
          { src: "icon.svg", sizes: "any", type: "image/svg+xml" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{html,js,css,svg,png,ico,webmanifest}"],
        // The install guide's screenshots are only needed in a browser, before installing; the
        // Home Screen app never shows them. globPatterns leaves out .webp already; this keeps
        // them out if it ever takes images of every kind.
        globIgnores: ["install/**"],
        navigateFallback: "index.html",
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  test: {
    include: ["src/**/*.test.js"],
  },
}));
