// Text shown on screen. No DOM here, so it can be tested directly.
import { ranMs, runDurationMs } from "./domain/teaching.js";
import { ENGLISH } from "./language.js";

// m:ss, with part-seconds rounded up: a Run reads 0:01 until it really is zero.
export function formatCountdown(ms) {
  return clock(Math.ceil(ms / 1000));
}

// "3 min · completed" or "5 min · stopped 2:41" (the whole seconds it counted, pauses left out).
// An Adjusted Run shows its own time: "1:30 · completed", or "2 min" when it is whole minutes.
// Each takes `text`, the language to write in (createText() in language.js); English when not given.
export function describeRun(run, { t } = ENGLISH) {
  const seconds = Math.round(runDurationMs(run) / 1000);
  const time = seconds % 60 === 0 ? t("minutes", { n: seconds / 60 }) : clock(seconds);
  if (run.outcome === "completed") return t("completed", { time });
  return t("stopped", { time, ran: clock(Math.floor(ranMs(run) / 1000)) });
}

// A Lesson's Runs as lines ready to draw: [{ text, outcome }]. Used by both tabs.
export function describeRuns(runs, text = ENGLISH) {
  return runs.map((run) => ({ text: describeRun(run, text), outcome: run.outcome }));
}

// A Lesson summed up by summarizeLesson(): a row in History, and the Timer tab's
// "This lesson" heading. Dates follow the text's locale, and its time zone (the phone's when
// it gives none).
export function describeLesson(summary, { t, locale, timeZone } = ENGLISH) {
  const started = new Date(summary.startedAt);
  const minutes = Math.round(summary.totalMs / 60_000);
  return {
    date: started.toLocaleDateString(locale, { timeZone, weekday: "short", day: "numeric", month: "short" }),
    time: started.toLocaleTimeString(locale, { timeZone, hour: "numeric", minute: "2-digit" }),
    runs: t("runs", { n: summary.runCount }),
    total: minutes === 0 ? t("underAMinute") : t("minutes", { n: minutes }),
  };
}

function clock(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

// The version line: "Version 24 Nov 2026 · 304be28", from the build's date ("2026-11-24", a
// calendar day, so read in UTC) and short commit (empty when not built from git). Null when
// the build left no date (the dev server's placeholders).
export function describeVersion(built, commit, { t, locale } = ENGLISH) {
  const day = new Date(built);
  if (Number.isNaN(day.getTime())) return null;
  const date = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(day);
  return commit ? t("version", { date, commit }) : t("versionDateOnly", { date });
}
