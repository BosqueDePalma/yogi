// Text shown on screen. No DOM here, so it can be tested directly.
import { ranMs, runDurationMs } from "./domain/teaching.js";

// m:ss, with part-seconds rounded up: a Run reads 0:01 until it really is zero.
export function formatCountdown(ms) {
  return clock(Math.ceil(ms / 1000));
}

// "3 min · completed" or "5 min · stopped 2:41" (the whole seconds it counted, pauses left out).
// An Adjusted Run shows its own time: "1:30 · completed", or "2 min" when it is whole minutes.
export function describeRun(run) {
  const seconds = Math.round(runDurationMs(run) / 1000);
  const time = seconds % 60 === 0 ? `${seconds / 60} min` : clock(seconds);
  if (run.outcome === "completed") return `${time} · completed`;
  return `${time} · stopped ${clock(Math.floor(ranMs(run) / 1000))}`;
}

// A Lesson's Runs as lines ready to draw: [{ text, outcome }]. Used by both tabs.
export function describeRuns(runs) {
  return runs.map((run) => ({ text: describeRun(run), outcome: run.outcome }));
}

// A Lesson summed up by summarizeLesson(): a row in History, and the Timer tab's
// "This lesson" heading. Dates follow the phone's language and time
// zone unless `locale` and `timeZone` are given (tests pass them).
export function describeLesson(summary, { locale, timeZone } = {}) {
  const started = new Date(summary.startedAt);
  const minutes = Math.round(summary.totalMs / 60_000);
  return {
    date: started.toLocaleDateString(locale, { timeZone, weekday: "short", day: "numeric", month: "short" }),
    time: started.toLocaleTimeString(locale, { timeZone, hour: "numeric", minute: "2-digit" }),
    runs: `${summary.runCount} ${summary.runCount === 1 ? "run" : "runs"}`,
    total: minutes === 0 ? "<1 min" : `${minutes} min`,
  };
}

function clock(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
