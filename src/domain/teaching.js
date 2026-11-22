// The Teacher's Runs and Lessons (see GLOSSARY.md).
//
// State is plain data, so it can be saved as JSON and reloaded as-is:
//   { lessons: [{ id, runs: [Run] }], activeRun: null | { preset, startedAt, plannedEndAt } }
//   Run = { preset, startedAt, endedAt, outcome: "completed" | "stopped" }
// Every function is pure and takes the current time `now` (ms) instead of reading the clock.

const MIN = 60_000;
const MIS_TAP_MS = 5_000;
const LESSON_GAP_MS = 90 * MIN;
const LATE_MS = 1_500;

export const PRESETS = [1, 2, 3, 5, 10];

export function start(state, preset, now) {
  if (!PRESETS.includes(preset)) throw new RangeError(`Not a Preset: ${preset}`);
  return { ...state, activeRun: { preset, startedAt: now, plannedEndAt: now + preset * MIN } };
}

export function remaining(state, now) {
  return Math.max(0, state.activeRun.plannedEndAt - now);
}

// Ends the Run as Stopped. A Mis-tap (under 5 s) is dropped, not kept.
export function stop(state, now) {
  const run = state.activeRun;
  if (now - run.startedAt < MIS_TAP_MS) return { ...state, activeRun: null };
  return file(state, finished(run, now, "stopped"));
}

export function replace(state, preset, now) {
  return start(stop(state, now), preset, now);
}

// Files the Run as Completed once it has reached zero. However late this is noticed
// (app suspended or closed), it ends at its planned end time. `late` means the end was
// noticed more than 1.5 s after it, so the Chime must not play.
export function check(state, now) {
  const run = state.activeRun;
  if (!run || now < run.plannedEndAt) return { state, completed: null, late: false };
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

export function lessonSummaries(state) {
  return state.lessons
    .map((lesson) => ({
      id: lesson.id,
      startedAt: lesson.runs[0].startedAt,
      runCount: lesson.runs.length,
      totalMs: lesson.runs.reduce((sum, run) => sum + (run.endedAt - run.startedAt), 0),
    }))
    .reverse();
}

export function deleteLesson(state, id) {
  return { ...state, lessons: state.lessons.filter((lesson) => lesson.id !== id) };
}

function finished(run, endedAt, outcome) {
  return { preset: run.preset, startedAt: run.startedAt, endedAt, outcome };
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
