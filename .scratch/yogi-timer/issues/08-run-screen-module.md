# Run screen module

Status: resolved
Type: task
Blocked by: 05, 06, 07
Blocks: 09

A refactor with no change the Teacher can see. The Timer tab's rules move out of `timer_controller.js` into a module with no DOM, so they can be tested with the time passed in. Today these rules are untested sequencing in the controller:
- Run completion;
- the Replace confirmation;
- the 0:00 pulse;
- what the countdown shows.

The "late, no Chime" rule is also checked in two controllers that are joined by HTML. This came out of the architecture review of 2026-11-22 (candidate 1). See the [spec](../spec.md), sections Presets and Runs, and Completion.

## Decisions

- **Module:** `src/timer_screen.js`, named after the spec's "Timer tab". It names a screen, not a domain term, so there's no glossary entry.
- **What goes inside:**
  - Run completion.
  - The Replace confirmation ("Tap again", 3 s).
  - The 0:00 pulse (4 s).
  - What the countdown shows: Ready, m:ss or 0:00.
  - The current Lesson's Runs.
  - Web Audio and the wake lock stay outside. The module only *says* "ring", "unlock audio" and "a Run is going".
- **No timers inside.** Every call takes `now`. The confirmation and the pulse are stored as timestamps ("armed until", "pulse until"). The controller's existing 250 ms tick ends them, so a disarmed Preset may take up to 250 ms to change back.
- **State:** `createTimerScreen(store)` reads and saves through a store `{ getState, setState }`. The app passes `store.js`; tests pass a small in-memory store. The controller never touches the state's shape.
- **Commands return effects:**
  - `tapPreset(preset, now)`, `stop(now)` and `tick(now)` each return what should happen, for example `{ ring: true }` or `{ unlockAudio: true }`.
  - They don't take callbacks.
- **Query:** `view(now)` → `{ countdown, mode: "running" | "pulsing" | "ready", armedPreset, lessonRuns: [{ text, outcome }], running }`.
  - `armedPreset` is the Preset number, not a button element.
  - Run lines come out ready to draw, built with `describeRun`.
- **The late Chime is decided once, inside the module.**
  - The Timer controller dispatches a plain `timer:ring` only when the module says ring.
  - `chime#ring` then always plays, with no `late` check.
  - `timer:started` stays, for unlocking audio inside the tap.
  - So reopening the app after a Run has ended gives no ring at all, whatever order the controllers connect in.
- **Tapping a Preset at the moment of zero:**
  - The Run is filed as Completed, the Chime rings, and the tapped Preset starts a new Run straight away, with no "Tap again".
  - This is today's behaviour, now stated as a rule.
- **What the Timer controller keeps:**
  - It no longer subscribes to the store. It redraws after every command and every tick.
  - The wake lock stays in the controller, driven by `view.running` after each tick and on `visibilitychange`.
  - Moving the wake lock into its own module is a possible later step; it's not part of this ticket.

## Tests at the module's interface

All with `now` passed in. Write them test-first, one at a time. The existing `teaching.test.js` stays as it is.

1. A tap with no Run going starts one, and the view shows its countdown.
2. A first tap during a Run arms that Preset; a second tap within 3 s Replaces the Run.
3. After 3 s the Preset is no longer armed, and a tap arms it again.
4. Tapping a different Preset moves the "Tap again" to it.
5. Stop, or the Run completing, cancels the "Tap again".
6. On time at zero: ring, the 0:00 pulse for 4 s, then Ready.
7. Late at zero: no ring, no pulse, straight to Ready.
8. A tap at the moment of zero: Completed, ring, and the new Run starts.
9. A Mis-tap Stop leaves the current Lesson's list unchanged.

## Done when

- The nine tests pass, along with all existing tests.
- `timer_controller.js` only draws the view, forwards taps and time, fires `timer:started` and `timer:ring`, and keeps the wake lock.
- `chime_controller.js` has no `late` check.
- Checked in the browser pane with time sped up:
  - start;
  - "Tap again" → Replace;
  - the "Tap again" window running out;
  - Stop;
  - one Chime at zero;
  - no Chime when late.
- The Simulator run is not repeated. The real-iPhone test ([issue 13](13-real-iphone-acceptance-test.md)) has a line for this rework.

## Comments

**2026-11-22, done.**
- `src/timer_screen.js` exports `createTimerScreen(store)` with `tapPreset`, `stop`, `tick` and `view`, as decided above. It holds the "Tap again" and the 0:00 pulse as end times, never sets a timer, and reads and saves only through the store it's given.
- `src/timer_screen.test.js` has the nine tests, written one at a time, with an in-memory store. Test 5 is split in two (Stop; the Run completing). Test 4 passed with no new code, because there's only one armed slot; it stays as a guard. Test 9 starts its Mis-tap Run while 0:00 is still pulsing. That caught a real gap: the pulse came back after the Mis-tap Stop, so a new Run now ends the pulse, as the old controller did.
- `timer_controller.js` no longer subscribes to the store. It forwards taps and the time (read once per command), draws the view, dispatches `timer:started` and `timer:ring`, and keeps the wake lock. `chime#ring` has no `late` check, and `index.html` wires `timer:ring->chime#ring`.
- A History delete now reaches the Timer tab's Lesson list on the next tick (up to 250 ms), not straight away.
- Leftover, not new: a Run that ended less than 1.5 s before the app reopens still says ring, and that ring is lost if the Chime controller hasn't connected yet. This is the same as before, and too narrow to matter.
- Checked in the browser pane with the clock sped up: start, "Tap again" → Replace, the "Tap again" window running out after about 3 s, Stop, one Chime at zero (the Chime controller built its sound), the 0:00 pulse for about 4 s then Ready, no Chime and no pulse when late, and reopening after a Run ended while closed (filed Completed, Ready, no pulse). No console errors. The Simulator run was not repeated, as agreed.
