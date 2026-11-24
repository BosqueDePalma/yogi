# Chime and Chime selector

Status: resolved
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

**2026-11-21, done.**
- `src/audio/sounds.js` holds the three Chimes as plain data. The numbers are the prototype's, with field names instead of positions. `src/audio/player.js` has `unlock()`, which sets `audioSession.type = "playback"`, creates and resumes the `AudioContext` and plays a silent buffer, and `play(name)`, which returns a fade-out used to cut a preview short.
- `src/chimes.js` saves and loads the choice under `yogi-timer.chime`, falling back to `bowl` when the value is missing, unknown or unreadable. A failed save doesn't throw. Tested in `src/chimes.test.js`.
- The late rule now lives in `teaching.check()`, which returns `late: true` when the end is noticed more than 1.5 s after it. It's tested, and `LATE_MS` is gone from the timer controller.
- `chime_controller.js` sits on the Timer tab with the timer controller. It wires `timer:started->chime#unlock` and `timer:completed->chime#ring`. The selector is three native radio inputs styled as a segmented control. A preview plays only with no Run going, and starting a Run cuts a preview short.
- Found: if iOS closes the app mid-Run, reopening it continues the Run with audio locked, and there was no tap to unlock it. Any tap on the Timer tab while a Run is going now unlocks audio. Without a tap, that Run completes silently.
- Checked in the browser pane by counting the Web Audio filters created: one preview per idle switch, none mid-Run, one Chime at zero 60.2 s after the tap using the Chime picked mid-Run, none for an end missed by 10 s, one for 0.5 s. The choice survives a reload.
- Checked in the Simulator (Home Screen app): the selector shows, defaults to Bowl, the Run continues after the app was closed, and the choice is kept. In that reopened Run, after one tap on the screen, iOS's audio indicator showed in the Dynamic Island at zero, so the Chime played. How it sounds is left to the real-iPhone check (issue 20).
- ⚠️ Not checked: `audioSession.type = "playback"` probably pauses music playing from another app when a Preset is tapped. Added to issue 20. If it does and the Teacher plays music in class, `"transient"` or `"ambient"` might mix instead, but `"ambient"` obeys the silent switch.
