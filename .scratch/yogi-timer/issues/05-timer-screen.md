# Timer screen

Status: resolved
Type: task
Blocked by: 02, 03, 04

The main tab, built with Stimulus controllers on top of the domain modules and storage. See the [spec](../spec.md), sections Presets and Runs, Completion, and Main screen layout.

## Scope

- A big countdown (or "Ready") and a Stop button.
- Five Preset buttons. During a Run, tapping one shows "Tap again" for about 3 seconds, and a second tap Replaces the Run.
- The countdown redraws from the clock, and when the app becomes visible again it immediately works out whether the Run has completed (no late chime).
- At zero: the 0:00 pulse for a few seconds, then back to ready. The chime hook is left as a stub until issue 06.
- The screen stays awake during a Run (using whatever issue 01 found works).
- The list of current Lesson Runs, empty once the Lesson Gap has passed.
- Leave a slot under the Presets for the Chime selector (built in issue 06).

## Done when

In the iOS Simulator, the Teacher's flow works end to end: tap 1 min and let it complete, tap 3 min and Stop it, Replace a Run, and lock and unlock mid-Run.

## Comments

**2026-11-21 — done.**

- `src/controllers/timer_controller.js` (Stimulus) on top of `domain/teaching.js`. `src/store.js` holds the one shared copy of the state and saves it on every change, so the History tab (issue 07) can't overwrite the Timer's saves. `src/format.js` formats the countdown and the lesson rows, with 4 Vitest tests. 38 tests in total.
- The countdown is clock-based and ticks every 250 ms; part-seconds round up, so it reads 0:01 until it really is zero. On app open and on `visibilitychange → visible` it checks at once. An end noticed more than 1.5 s late is filed without the pulse and dispatched as `late`.
- Hooks for issue 06: `timer:started` (inside the tap) and `timer:completed { run, late }`. The selector goes in `.chime-slot`.
- Wake lock: requested while a Run is going, asked for again on return to the app, released when the Run ends.
- Preset buttons have explicit labels ("3 minutes"; while armed, "Tap again to replace with 3 minutes"), since the visual "3 / min" had no accessible name.

Checked:
- **Browser pane (dev server):** start, the "Tap again" confirmation and its 3 s timeout, Replace, a live completion (0:00 pulse, then Ready; event `late: false`), Mis-tap dropped, Stop, a reload after a saved Run's end (filed Completed, no pulse), a reload mid-Run (countdown continues), light and dark.
- **iOS Simulator, installed Home Screen app (production build):** 1 min completed, 3 min stopped (0:11), Replace 2 → 10 min (2 min saved as stopped 0:28), lock 10 s mid-Run then unlock (countdown correct), app fully closed mid-Run and reopened (Run and "This lesson" list intact).

**Finding (updates):** an installed app picks up a new version one launch late. The old service worker serves its cache while the new one installs, so the new version shows on the next full reopen. That's fine for her; worth knowing when we ship fixes (issue 17).
