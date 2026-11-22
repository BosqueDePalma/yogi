# Project scaffold: Vite, Stimulus, Vitest, offline install

Status: resolved
Type: task

Set up the empty app so later tickets have somewhere to land. See the [spec](../spec.md), Architecture section.

## Scope

- Vite project using plain JavaScript (no TypeScript), with `@hotwired/stimulus` and an `index.html` entry point.
- Vitest set up, with `npm test` running it.
- `vite-plugin-pwa`: manifest name "Yogi Timer", portrait orientation, an offline service worker that caches the app shell.
- An SVG singing-bowl icon, plus the PNG and apple-touch-icon sizes iOS needs.
- A base CSS file with colour tokens that follow the phone's light/dark setting.
- Two empty tabs: Timer and History.

## Done when

- `npm run build` produces a site that installs to the Home Screen in the iOS Simulator and loads with the network off.
- `npm test` passes (with a placeholder test).

## Comments

**2026-11-21 — done.**

- Vite 8 + Stimulus 3, Vitest 5, vite-plugin-pwa 2 (generateSW, auto-update). `npm test` and `npm run build` both pass; 13 files precached (about 59 KiB).
- Icon: `public/icon.svg` (bowl on sand). The PNGs come from it via `npm run icons` (`@vite-pwa/assets-generator`, config in `pwa-assets.config.js`).
- Colour tokens in `src/styles/base.css` follow light/dark; checked both in the Simulator.
- Timer and History tabs via `tabs_controller.js`.
- Preview: the `app-preview` entry in `.claude/launch.json` builds and serves on `http://127.0.0.1:4173/`.
- **iOS Simulator:** Add to Home Screen shows the bowl icon and "Yogi Timer", and it opens standalone. Then with the server stopped and the app killed, a cold launch loads fine. Offline works.
- **Finding:** the Home Screen app does *not* inherit the service worker Safari installed. The first launch from the Home Screen with the server off failed. It has to be opened once from the Home Screen **while online**; offline works after that. Added to issue 12.
- `npm audit` reports 4 moderate advisories in `glob`/`minimatch` pulled in by `workbox-build`. These are build-time only, nothing ships to the phone. The suggested "fix" downgrades vite-plugin-pwa, so it was left alone.
