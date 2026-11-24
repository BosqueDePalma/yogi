# Chime module

Status: resolved
Type: task
Blocked by: 06, 08, 09
Blocks: 11

A refactor with no change the Teacher can see. The Chime's rules move out of `chime_controller.js` into a module with no DOM and no Web Audio, so they can be tested.

Today these rules are untested `if`s in the controller:
- no preview while a Run is going;
- stopping a preview when a Run starts;
- unlocking audio on a tap during a Run (after iOS closed the app).

Her saved choice lives in a separate, shallow `chimes.js`. This came out of candidate 3 of the architecture review of 2026-11-22. Ticket 08 already moved "ring unless late" into the Run screen module. See the [spec](../spec.md), section Chime.

## Decisions

- **Module:** `src/chime.js`, named after the glossary's **Chime**. `chimes.js` and its tests fold into it, and `chimes.js` is deleted.
- **Interface:** `createChime({ storage, player, isRunning })` returns:
  - `current`: the chosen Chime name, read once from `storage` (Singing bowl if the saved value is missing, unknown or unreadable);
  - `choose(name)`: save the choice; with no Run going, stop any preview and play the new Chime once; during a Run, no preview;
  - `ring()`: play the current choice;
  - `unlockForRun()`: stop a playing preview, then unlock audio (called on `timer:started`, inside the Preset tap);
  - `tap()`: unlock audio only while a Run is going.
- **Seam at the player:** `player` is `{ play(name) → stopFn, unlock() }`.
  - The app passes `audio/player.js`, the real Web Audio adapter. Tests pass a fake that records its calls.
  - `player.js` itself stays untested; the real-iPhone test ([issue 14](14-real-iphone-acceptance-test.md)) covers how it sounds.
- **Is a Run going?** The module takes an `isRunning: () => boolean` function, wired to the store in the controller. It never sees the saved state's shape.
- **`audio/sounds.js` stays as is.** It's tuning data, not behaviour.
- **What `chime_controller.js` keeps:**
  - It checks the radio for `current` on connect.
  - It forwards `choose`, `timer:started` (→ `unlockForRun`), `timer:ring` (→ `ring`) and Timer-tab taps (→ `tap`).
  - It stops the preview on disconnect.
  - It doesn't read the store or call `player.js` directly.

## Tests at the module's interface

These use a fake player, fake storage and a switchable `isRunning`. Write them test-first, one at a time.

1. With nothing saved she gets the Singing bowl. An unknown, empty or unreadable saved value also gives the Singing bowl. These cases move over from `chimes.test.js`.
2. Choosing with no Run going saves the choice and previews it once. Choosing again stops the first preview.
3. Choosing during a Run saves the choice with no preview, and `ring()` then plays the new Chime.
4. `ring()` plays the current choice.
5. `unlockForRun()` stops a playing preview and unlocks audio.
6. `tap()` unlocks audio only while a Run is going.
7. The choice still applies when saving it fails (storage full or blocked).

## Done when

- The seven tests pass, along with all existing tests.
- `chimes.js` and `chimes.test.js` are gone.
- `chime_controller.js` only forwards to the module, as listed above.
- Checked in the browser pane:
  - a preview plays on switching with no Run going;
  - no preview during a Run;
  - the Chime plays at zero with the newly chosen sound;
  - the choice survives a reload.
- The Simulator run is not repeated.

## Comments

**2026-11-22, done.**
- `src/chime.js` exports `createChime({ storage, player, isRunning })` with `current`, `choose`, `ring`, `unlockForRun` and `tap`, as decided. It also has `stopPreview()`, which the controller calls on disconnect; that was the controller's own job before.
- `src/chime.test.js` has the seven tests, written one at a time, with a fake player, fake storage and a switchable `isRunning`. Test 1 keeps the fallback cases from `chimes.test.js`. Test 4 passed with no new code, because `ring` came with test 3; it stays as a guard. `chimes.js` and `chimes.test.js` are deleted.
- `chime_controller.js` only builds the module (wiring `isRunning` to the store), checks the saved radio, and forwards the selector, `timer:started`, `timer:ring` and Timer-tab taps.
- Checked in the browser pane with the clock sped up: switching with no Run going played one preview and saved the choice; switching during a Run saved it silently; the Chime played at zero; the choice was still checked after a reload. No console errors.
- Also checked in the Simulator on request (Home Screen app on iPhone 17, after a full relaunch to pick up the new build): choosing Gong with no Run going lit the audio indicator once; switching to Bowl during a 1-minute Run was silent; at zero the audio indicator showed with the 0:00 pulse and "1 min · completed"; after another full relaunch Bowl was still selected. How it sounds is left to the real-iPhone check (issue 14).
