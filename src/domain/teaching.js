// The Teacher's Runs and Lessons (see GLOSSARY.md).
//
// State is plain data, so it can be saved as JSON and reloaded as-is:
//   { lessons: [{ id, runs: [Run] }], activeRun: null | { preset, startedAt, plannedEndAt, pausedAt?, pausedMs? } }
//   Run = { preset, startedAt, endedAt, outcome: "completed" | "stopped", pausedMs? }
// `pausedAt` is set while the Run is paused; `pausedMs` is the time spent in its earlier
// pauses, left out of the time it ran. Both are absent on a Run never paused, as saved before Pause.
// Every function is pure and takes the current time `now` (ms) instead of reading the clock.
// `lessons` is a new list only when the Lessons changed (a Run filed, a Lesson deleted);
// otherwise the same list is passed on. The History tab relies on this to redraw.

const MIN = 60_000;
const MIS_TAP_MS = 5_000;
const LESSON_GAP_MS = 90 * MIN;
const LATE_MS = 1_500;

export const PRESETS = [1, 2, 3, 5, 10];

export function start(state, preset, now) {
  if (!PRESETS.includes(preset)) throw new RangeError(`Not a Preset: ${preset}`);
  return { ...state, activeRun: { preset, startedAt: now, plannedEndAt: now + durationMs(preset) } };
}

// How long a Run of this Preset counts down for.
export function durationMs(preset) {
  return preset * MIN;
}

export function remaining(state, now) {
  const run = state.activeRun;
  return Math.max(0, run.plannedEndAt - (run.pausedAt ?? now));
}

// Stops the countdown where it is, until the Run is resumed.
export function pause(state, now) {
  const run = state.activeRun;
  if (!run || isPaused(state)) return state;
  return { ...state, activeRun: { ...run, pausedAt: now } };
}

// Counts down again from where it was paused. The time paused is kept, so it can be left
// out of the time the Run ran.
export function resume(state, now) {
  const { pausedAt, ...run } = state.activeRun ?? {};
  if (pausedAt == null) return state;
  const pausedFor = now - pausedAt;
  return {
    ...state,
    activeRun: { ...run, plannedEndAt: run.plannedEndAt + pausedFor, pausedMs: (run.pausedMs ?? 0) + pausedFor },
  };
}

export function isPaused(state) {
  return state.activeRun?.pausedAt != null;
}

// Ends the Run as Stopped, paused or not. A Mis-tap (under 5 s of counting) is dropped, not kept.
export function stop(state, now) {
  const run = finished(resume(state, now).activeRun, now, "stopped");
  if (ranMs(run) < MIS_TAP_MS) return { ...state, activeRun: null };
  return file(state, run);
}

export function replace(state, preset, now) {
  return start(stop(state, now), preset, now);
}

// Files the Run as Completed once it has reached zero. However late this is noticed
// (app suspended or closed), it ends at its planned end time. `late` means the end was
// noticed more than 1.5 s after it, so the Chime must not play.
// A paused Run never completes. Left paused past the Lesson Gap, it is filed as Stopped,
// ending when it was paused. With nothing to file, `state` is the very state passed in.
export function check(state, now) {
  const run = state.activeRun;
  if (isPaused(state) && now - run.pausedAt > LESSON_GAP_MS) {
    return { state: stop(state, run.pausedAt), completed: null, late: false };
  }
  if (!run || isPaused(state) || now < run.plannedEndAt) return { state, completed: null, late: false };
  const completed = finished(run, run.plannedEndAt, "completed");
  return { state: file(state, completed), completed, late: now - run.plannedEndAt > LATE_MS };
}

// The latest Lesson, unless the Lesson Gap has passed. A Run that is going counts
// from when it started, since that decides which Lesson it will join.
export function currentLesson(state, now) {
  const latest = state.lessons.at(-1);
  const at = state.activeRun ? state.activeRun.startedAt : now;
  return latest && withinLessonGap(latest, at) ? latest : null;
}

// Every past Lesson, newest first, summed up as summarizeLesson() does.
export function lessonSummaries(state) {
  return state.lessons.map(summarizeLesson).reverse();
}

// A Lesson's id, when its first Run started, how many Runs it has, and the time they ran.
export function summarizeLesson(lesson) {
  return {
    id: lesson.id,
    startedAt: lesson.runs[0].startedAt,
    runCount: lesson.runs.length,
    totalMs: lesson.runs.reduce((sum, run) => sum + ranMs(run), 0),
  };
}

// How long a filed Run counted: from its start to its end, less the time it was paused.
export function ranMs(run) {
  return run.endedAt - run.startedAt - (run.pausedMs ?? 0);
}

export function deleteLesson(state, id) {
  if (!state.lessons.some((lesson) => lesson.id === id)) return state;
  return { ...state, lessons: state.lessons.filter((lesson) => lesson.id !== id) };
}

// A Run that was never paused keeps the shape Runs had before Pause existed.
function finished(run, endedAt, outcome) {
  const done = { preset: run.preset, startedAt: run.startedAt, endedAt, outcome };
  return run.pausedMs ? { ...done, pausedMs: run.pausedMs } : done;
}

function withinLessonGap(lesson, at) {
  return at - lesson.runs.at(-1).endedAt <= LESSON_GAP_MS;
}

function file(state, run) {
  const latest = state.lessons.at(-1);
  if (latest && withinLessonGap(latest, run.startedAt)) {
    const joined = { ...latest, runs: [...latest.runs, run] };
    return { lessons: [...state.lessons.slice(0, -1), joined], activeRun: null };
  }
  return { lessons: [...state.lessons, { id: run.startedAt, runs: [run] }], activeRun: null };
}
