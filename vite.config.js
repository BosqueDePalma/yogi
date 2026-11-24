import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// The light background colour, kept in step with src/styles/base.css.
const BACKGROUND = "#f4f7fe";

export default defineConfig({
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
        navigateFallback: "index.html",
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  test: {
    include: ["src/**/*.test.js"],
  },
});
