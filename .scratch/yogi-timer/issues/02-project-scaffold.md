# Project scaffold: Vite, Stimulus, Vitest, offline install

Status: ready-for-agent
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
