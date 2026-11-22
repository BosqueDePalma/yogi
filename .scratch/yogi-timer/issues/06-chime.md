# Chime and Chime selector

Status: ready-for-agent
Type: task
Blocked by: 05

Plug the Chimes generated in code into the Run completion, and add the Chime selector to the Timer tab. See the [spec](../spec.md), Chime section, and the findings in [issue 01](01-chime-and-wake-lock-test.md).

## Decided

- Three Chimes, ported from the prototype's `SOUNDS` table (`.scratch/yogi-timer/prototypes/chime-test/index.html`): **Singing bowl** (default), **Tingsha**, **Gong**. Keep the sound definitions as plain data in their own module, so they're easy to tune.
- Set `navigator.audioSession.type = "playback"` (when available) so the Chime ignores the silent switch and can sound with the phone locked.
- Create or resume the `AudioContext` inside the Preset tap to unlock audio. The Chime at zero then needs no extra tap.
- Request the wake lock again on `visibilitychange → visible` while a Run is going.
- The Chime plays only if the Run's end is noticed within about 1.5 s; otherwise there is no late chime.

## Chime selector

- A three-option segmented control under the Presets: Bowl | Tingsha | Gong.
- One tap switches, at any time. Switching during a Run changes the Chime that Run plays at zero.
- With no Run going, switching plays the new Chime once as a preview. During a Run there is no preview.
- The choice is saved in localStorage under its own key (not in History) and restored when the app opens. It falls back to Singing bowl if the saved value is missing or unknown.

## Done when

- The selected Chime plays once at zero in the Simulator, never late after an unlock, and with `audioSession` set to playback.
- Switching Chime mid-Run changes what plays at zero, and the choice survives closing and reopening the app.
- Vitest covers loading and saving the choice, including the fallback to Singing bowl.

## Comments

**2026-11-21, from issue 05:** the timer screen already provides the hooks.
- `timer:started` (event on the Timer tab, dispatched inside the Preset tap): create or resume the `AudioContext` here.
- `timer:completed` with `detail: { run, late }`: play the selected Chime unless `late`. `late` uses a 1.5 s rule kept in `timer_controller.js` (`LATE_MS`); move it into a tested function here.
- The wake lock, including asking again on `visibilitychange → visible`, is already done in issue 05.
- The selector goes in the empty `.chime-slot` under the Presets.
