// The Timer tab's rules, with no DOM: Run completion, the Replace confirmation
// ("Tap again"), the 0:00 pulse, what the countdown shows, and whether the Chime rings.
//
// It reads and saves the Teacher's state through `store` ({ getState, setState }).
// Every call takes the current time `now` (ms) and nothing here sets a timer: the
// confirmation and the pulse are end times, so they end when the caller next asks
// with a later `now`. The caller ticks a few times a second.
//
// Commands return what should happen outside, with no callbacks:
//   { ring: true }        play the Chime (only on time; never for a Run noticed late)
//   { unlockAudio: true } a Run started inside this tap, so audio can be unlocked
import * as teaching from "./domain/teaching.js";
import { describeRun, formatCountdown } from "./format.js";

const CONFIRM_MS = 3_000; // how long a Preset shows "Tap again"
const PULSE_MS = 4_000; // how long 0:00 pulses after a Run completes

export function createTimerScreen(store) {
  let armed = null; // { preset, until }: the Preset showing "Tap again"
  let pulseUntil = 0;

  const armedPresetAt = (now) => (armed && now < armed.until ? armed.preset : null);

  function tick(now) {
    const { state, completed, late } = teaching.check(store.getState(), now);
    if (!completed) return {};
    armed = null;
    store.setState(state);
    if (late) return {};
    pulseUntil = now + PULSE_MS;
    return { ring: true };
  }

  function tapPreset(preset, now) {
    const effects = tick(now); // the Run may have just reached zero
    const state = store.getState();
    if (!state.activeRun) {
      pulseUntil = 0; // a new Run ends the 0:00 pulse
      store.setState(teaching.start(state, preset, now));
      return { ...effects, unlockAudio: true };
    }
    if (armedPresetAt(now) === preset) {
      armed = null;
      store.setState(teaching.replace(state, preset, now));
      return { ...effects, unlockAudio: true };
    }
    armed = { preset, until: now + CONFIRM_MS };
    return {};
  }

  function stop(now) {
    armed = null;
    const state = store.getState();
    if (state.activeRun) store.setState(teaching.stop(state, now));
    return {};
  }

  // What to draw: countdown text, mode ("running" | "pulsing" | "ready"), the armed
  // Preset number or null, the current Lesson's Runs as ready-made lines, and whether
  // a Run is going (which keeps the screen awake).
  function view(now) {
    const state = store.getState();
    const running = Boolean(state.activeRun);
    const mode = running ? "running" : now < pulseUntil ? "pulsing" : "ready";
    const runs = teaching.currentLesson(state, now)?.runs ?? [];
    return {
      countdown: running ? formatCountdown(teaching.remaining(state, now)) : mode === "pulsing" ? "0:00" : "Ready",
      mode,
      armedPreset: armedPresetAt(now),
      lessonRuns: runs.map((run) => ({ text: describeRun(run), outcome: run.outcome })),
      running,
    };
  }

  return { tapPreset, stop, tick, view };
}
