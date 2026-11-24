// The Timer tab's rules, with no DOM: the Selected Preset (a tap selects, − / + Adjust it, a
// tap on the lotus or the Preset again starts it, Cancel drops it), Run completion, Pause (a
// tap on the Lotus dial; Stop only while paused), the Replace confirmation ("Tap again"), the
// 0:00 pulse, what the countdown shows, and whether the Chime rings.
//
// It reads and saves the Teacher's state through `store` ({ getState, setState }). The
// Selected Preset is never saved: it lives here only, while the app is open.
// Every call takes the current time `now` (ms) and nothing here sets a timer: the
// confirmation and the pulse are end times, so they end when the caller next asks
// with a later `now`. The caller ticks a few times a second.
//
// Commands return what should happen outside, with no callbacks:
//   { ring: true }        play the Chime (only on time; never for a Run noticed late)
//   { unlockAudio: true } a Preset was selected or a Run started inside this tap, so audio can be unlocked
import * as teaching from "./domain/teaching.js";
import { describeLesson, describeRuns, formatCountdown } from "./format.js";

const CONFIRM_MS = 3_000; // how long a Preset shows "Tap again"
const PULSE_MS = 4_000; // how long 0:00 pulses after a Run completes
const SETTLE_MS = 2_000; // then how long the Lotus dial takes to fade back to Ready (FADE_S there)

export function createTimerScreen(store) {
  let selected = null; // { preset, timeMs }: the Selected Preset and its time, never saved
  let armed = null; // { preset, until }: the Preset showing "Tap again"
  let finish = null; // { run, until }: the Run just completed on time; `until` is when its pulse ends

  const armedPresetAt = (now) => (armed && now < armed.until ? armed.preset : null);

  // Files a Run that reached zero, or one left paused past the Lesson Gap.
  function tick(now) {
    const before = store.getState();
    const { state, completed, late } = teaching.check(before, now);
    if (state === before) return {};
    armed = null;
    store.setState(state);
    if (!completed || late) return {};
    finish = { run: completed, until: now + PULSE_MS };
    return { ring: true };
  }

  // A tap on a Preset selects it, and a second tap on the Selected Preset starts its Run. During
  // a Run it shows "Tap again" first: the second tap Replaces the Run, selecting the Preset.
  function tapPreset(preset, now) {
    const effects = tick(now); // the Run may have just reached zero
    const state = store.getState();
    if (!state.activeRun) {
      if (selected?.preset === preset) return startSelected(now, effects);
      select(preset);
      return { ...effects, unlockAudio: true };
    }
    if (armedPresetAt(now) === preset) {
      armed = null;
      store.setState(teaching.stop(state, now));
      select(preset);
      return { ...effects, unlockAudio: true };
    }
    armed = { preset, until: now + CONFIRM_MS };
    return {};
  }

  function select(preset) {
    finish = null; // a selection ends the 0:00 pulse and the settling
    selected = { preset, timeMs: teaching.durationMs(preset) };
  }

  function startSelected(now, effects) {
    store.setState(teaching.start(store.getState(), selected.preset, now, selected.timeMs));
    selected = null;
    return { ...effects, unlockAudio: true };
  }

  // − (direction -1) and + (+1) Adjust the Selected Preset's time. With nothing selected they do nothing.
  function adjust(direction, now) {
    const effects = tick(now);
    if (selected) selected = { ...selected, timeMs: teaching.adjust(selected.preset, selected.timeMs, direction) };
    return effects;
  }

  // A tap on the Lotus dial pauses a Run that is counting and resumes a paused one. It also
  // cancels "Tap again", so no Replace is left half done. With a Selected Preset it starts its
  // Run; with neither it does nothing.
  function tapDial(now) {
    const effects = tick(now); // the Run may have just reached zero
    const state = store.getState();
    if (!state.activeRun) return selected ? startSelected(now, effects) : effects;
    armed = null;
    store.setState(teaching.isPaused(state) ? teaching.resume(state, now) : teaching.pause(state, now));
    return effects;
  }

  // Stop shows only while a Run is paused, so a stray tap on it can't end a Run. With a Preset
  // selected the same button is Cancel, which drops the selection.
  function stop(now) {
    if (selected) {
      selected = null; // Cancel, in Stop's place
      return {};
    }
    const state = store.getState();
    if (!teaching.isPaused(state)) return {};
    armed = null;
    store.setState(teaching.stop(state, now));
    return {};
  }

  // What to draw: countdown text, mode, the dial's VoiceOver label ("Pause, 2:41 left",
  // "Start, 1:05", or null), the armed and the selected Preset numbers or null, what − and +
  // can do (null without a Selected Preset), the current Lesson's heading
  // (or null with no Lesson) and its Runs as ready-made lines, newest first, whether a Run
  // is going, paused or not (which keeps the screen awake), and for the Lotus dial the Run
  // it shows and how far it has gone (also through the 0:00 pulse), or null.
  // The mode is "selected" before a Run starts, "running" or "paused" during it, then after
  // a Run completes on time "pulsing" (0:00 and the celebration) and "settling" (the picture
  // fades; Ready waits so it doesn't land on the lotus), then "ready". Stop, a Run noticed
  // late, and a selection skip the last two.
  function view(now) {
    const state = store.getState();
    const running = Boolean(state.activeRun);
    const paused = teaching.isPaused(state);
    const lesson = teaching.currentLesson(state, now);
    const runs = lesson?.runs ?? [];
    const shared = {
      armedPreset: armedPresetAt(now),
      lessonHeading: lesson && lessonHeading(lesson),
      lessonRuns: describeRuns([...runs].reverse()), // newest first
    };
    if (selected) {
      const timeText = formatCountdown(selected.timeMs);
      return {
        ...shared,
        countdown: timeText,
        mode: "selected",
        dialLabel: `Start, ${timeText}`,
        selectedPreset: selected.preset,
        adjust: {
          step: teaching.adjustStepSeconds(selected.preset),
          canRemove: teaching.adjust(selected.preset, selected.timeMs, -1) !== selected.timeMs,
          canAdd: teaching.adjust(selected.preset, selected.timeMs, +1) !== selected.timeMs,
        },
        running: false,
        // The start of the Run, drawn over the Preset's own time: it stands still while she Adjusts.
        dial: { durationMs: teaching.durationMs(selected.preset), elapsedMs: 0 },
      };
    }
    const pulsing = !running && finish !== null && now < finish.until;
    const settling = !running && !pulsing && finish !== null && now < finish.until + SETTLE_MS;
    const mode = paused ? "paused" : running ? "running" : pulsing ? "pulsing" : settling ? "settling" : "ready";
    const shown = running ? state.activeRun : pulsing ? finish.run : null;
    const remainingText = running && formatCountdown(teaching.remaining(state, now));
    return {
      countdown: running ? remainingText : mode === "ready" ? "Ready" : "0:00",
      mode,
      ...shared,
      dialLabel: running ? `${paused ? "Resume" : "Pause"}, ${remainingText} left` : null,
      selectedPreset: null,
      adjust: null,
      running,
      dial: shown && { durationMs: teaching.runDurationMs(shown), elapsedMs: dialElapsedMs(state, shown, now) },
    };
  }

  return { tapPreset, adjust, tapDial, stop, tick, view };
}

// How far the Lotus dial is through the Run on show: the time it has counted (standing
// still while paused), then on past zero through the celebration.
function dialElapsedMs(state, run, now) {
  const durationMs = teaching.runDurationMs(run);
  if (run === state.activeRun) return durationMs - teaching.remaining(state, now);
  return durationMs + (now - run.endedAt);
}

// "This lesson · 5 runs · 14 min", counted as History counts the Lesson.
function lessonHeading(lesson) {
  const { runs, total } = describeLesson(teaching.summarizeLesson(lesson));
  return `This lesson · ${runs} · ${total}`;
}
