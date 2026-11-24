import { describe, expect, it } from "vitest";
import {
  PRESETS,
  start,
  stop,
  replace,
  pause,
  resume,
  isPaused,
  remaining,
  check,
  currentLesson,
  lessonSummaries,
  ranMs,
  deleteLesson,
} from "./teaching.js";

const MIN = 60_000;
// Times in ms; hours past midnight on 21 Nov 2026 (UTC), so h = 24 is the next midnight.
const t = (h, m = 0, s = 0) => Date.UTC(2026, 10, 21, h, m, s);
const empty = { lessons: [], activeRun: null };

describe("a Run", () => {
  it("starts only from the five Presets", () => {
    expect(PRESETS).toEqual([1, 2, 3, 5, 10]);
    expect(() => start(empty, 4, t(9))).toThrow();
  });

  it("counts down from its Preset by the clock", () => {
    const state = start(empty, 3, t(9));
    expect(remaining(state, t(9))).toBe(3 * MIN);
    expect(remaining(state, t(9, 1, 30))).toBe(90_000);
  });

  it("never shows less than zero remaining", () => {
    const state = start(empty, 1, t(9));
    expect(remaining(state, t(9, 5))).toBe(0);
  });
});

describe("completing a Run", () => {
  it("is not complete before its planned end", () => {
    const { state, completed } = check(start(empty, 1, t(9)), t(9, 0, 59));
    expect(completed).toBeNull();
    expect(state.activeRun).not.toBeNull();
  });

  it("completes at zero and joins the current Lesson", () => {
    const { state, completed } = check(start(empty, 1, t(9)), t(9, 1));
    expect(completed).toEqual({ preset: 1, startedAt: t(9), endedAt: t(9, 1), outcome: "completed" });
    expect(state.activeRun).toBeNull();
    expect(currentLesson(state, t(9, 1)).runs).toEqual([completed]);
  });

  it("noticed hours after its end (app suspended) is Completed at its planned end", () => {
    const { completed } = check(start(empty, 10, t(9)), t(13, 30));
    expect(completed.outcome).toBe("completed");
    expect(completed.endedAt).toBe(t(9, 10));
  });

  it("with no Run going, nothing completes", () => {
    expect(check(empty, t(9))).toEqual({ state: empty, completed: null, late: false });
  });
});

describe("the Chime at zero", () => {
  it("is on time when the end is noticed within 1.5 seconds", () => {
    expect(check(start(empty, 1, t(9)), t(9, 1)).late).toBe(false);
    expect(check(start(empty, 1, t(9)), t(9, 1, 1) + 500).late).toBe(false);
  });

  it("is late, so it doesn't play, when the end is noticed more than 1.5 seconds after it", () => {
    expect(check(start(empty, 1, t(9)), t(9, 1, 1) + 501).late).toBe(true);
    expect(check(start(empty, 10, t(9)), t(13, 30)).late).toBe(true);
  });
});

describe("stopping a Run", () => {
  it("saves a Stopped Run ending when she stopped it", () => {
    const state = stop(start(empty, 5, t(9)), t(9, 2, 41));
    expect(state.activeRun).toBeNull();
    expect(currentLesson(state, t(9, 3)).runs).toEqual([
      { preset: 5, startedAt: t(9), endedAt: t(9, 2, 41), outcome: "stopped" },
    ]);
  });

  it("drops a Mis-tap: stopped in under 5 seconds", () => {
    const state = stop(start(empty, 3, t(9)), t(9, 0, 4) + 999);
    expect(state).toEqual(empty);
  });

  it("keeps a Run stopped at exactly 5 seconds", () => {
    const state = stop(start(empty, 3, t(9)), t(9, 0, 5));
    expect(currentLesson(state, t(9, 1)).runs).toHaveLength(1);
  });
});

// Run a Preset from `from` all the way to zero.
const complete = (state, preset, from) => check(start(state, preset, from), from + preset * MIN).state;

describe("pausing a Run", () => {
  it("holds its countdown where it is", () => {
    const state = pause(start(empty, 3, t(9)), t(9, 1));
    expect(isPaused(state)).toBe(true);
    expect(remaining(state, t(9, 1))).toBe(2 * MIN);
    expect(remaining(state, t(9, 30))).toBe(2 * MIN);
  });

  it("resumes from the same remaining time, as many times as she likes", () => {
    let state = pause(start(empty, 3, t(9)), t(9, 1)); // 2:00 left
    state = resume(state, t(9, 5));
    expect(isPaused(state)).toBe(false);
    expect(remaining(state, t(9, 5, 30))).toBe(90_000);
    state = resume(pause(state, t(9, 6)), t(9, 20)); // 1:00 left
    expect(remaining(state, t(9, 20))).toBe(MIN);
  });

  it("then stopping it saves a Stopped Run that ran only while it counted", () => {
    let state = resume(pause(start(empty, 5, t(9)), t(9, 1)), t(9, 4)); // held 3 min
    state = stop(pause(state, t(9, 5)), t(9, 8)); // counted 2 min, held 3 more
    const [run] = currentLesson(state, t(9, 8)).runs;
    expect(run).toMatchObject({ preset: 5, startedAt: t(9), endedAt: t(9, 8), outcome: "stopped" });
    expect(ranMs(run)).toBe(2 * MIN);
    expect(lessonSummaries(state)[0].totalMs).toBe(2 * MIN);
  });

  it("drops a Mis-tap by the time it counted, however long it was paused", () => {
    const state = stop(pause(start(empty, 3, t(9)), t(9, 0, 4)), t(9, 1));
    expect(state).toEqual(empty);
  });

  it("never lets a paused Run complete", () => {
    const state = pause(start(empty, 1, t(9)), t(9, 0, 30));
    const { state: after, completed } = check(state, t(9, 5));
    expect(completed).toBeNull();
    expect(after).toBe(state);
  });

  it("left paused past the Lesson Gap, is filed as a Stopped Run ending when it was paused", () => {
    const state = pause(start(empty, 5, t(9)), t(9, 2)); // paused at 9:02
    expect(check(state, t(10, 32)).state).toBe(state); // exactly 90 minutes on: still paused
    const { state: after, completed, late } = check(state, t(10, 32) + 1);
    expect(after.activeRun).toBeNull();
    expect(completed).toBeNull();
    expect(late).toBe(false);
    const [run] = after.lessons[0].runs;
    expect(run).toMatchObject({ preset: 5, startedAt: t(9), endedAt: t(9, 2), outcome: "stopped" });
    expect(ranMs(run)).toBe(2 * MIN);
  });

  it("once resumed, completes when it has counted its whole Preset", () => {
    const state = resume(pause(start(empty, 3, t(9)), t(9, 1)), t(9, 11)); // held 10 min
    expect(check(state, t(9, 13) - 1).completed).toBeNull();
    const { completed, late } = check(state, t(9, 13));
    expect(completed).toMatchObject({ preset: 3, startedAt: t(9), endedAt: t(9, 13), outcome: "completed" });
    expect(ranMs(completed)).toBe(3 * MIN);
    expect(late).toBe(false);
  });

  it("can be Replaced, saving the Paused Run as Stopped", () => {
    const state = replace(pause(start(empty, 3, t(9)), t(9, 1)), 5, t(9, 4));
    const [run] = currentLesson(state, t(9, 4)).runs;
    expect(run.outcome).toBe("stopped");
    expect(ranMs(run)).toBe(MIN);
    expect(isPaused(state)).toBe(false);
    expect(remaining(state, t(9, 4))).toBe(5 * MIN);
  });

  it("stays paused at the same point when the app is closed and reopened", () => {
    const saved = JSON.stringify(pause(start(empty, 5, t(9)), t(9, 2, 19)));
    const state = JSON.parse(saved);
    expect(isPaused(state)).toBe(true);
    expect(remaining(state, t(9, 40))).toBe(2 * MIN + 41_000);
  });

  it("works on a Run saved before Pause existed", () => {
    const saved = { lessons: [], activeRun: { preset: 3, startedAt: t(9), plannedEndAt: t(9, 3) } };
    expect(isPaused(saved)).toBe(false);
    const state = stop(resume(pause(saved, t(9, 1)), t(9, 2)), t(9, 3));
    expect(lessonSummaries(state)[0].totalMs).toBe(2 * MIN);
  });

  it("leaves the list of Lessons as it was", () => {
    const state = complete(empty, 3, t(8));
    const paused = pause(start(state, 5, t(9)), t(9, 1));
    expect(paused.lessons).toBe(state.lessons);
    expect(resume(paused, t(9, 2)).lessons).toBe(state.lessons);
  });
});

describe("grouping Runs into Lessons", () => {
  it("a Run started exactly 90 minutes after the last one ended joins the same Lesson", () => {
    let state = complete(empty, 3, t(9)); // ends 9:03
    state = complete(state, 2, t(10, 33));
    expect(state.lessons).toHaveLength(1);
    expect(state.lessons[0].runs).toHaveLength(2);
  });

  it("a Run started more than 90 minutes after the last one ended starts a new Lesson", () => {
    let state = complete(empty, 3, t(9)); // ends 9:03
    state = complete(state, 2, t(10, 33) + 1);
    expect(state.lessons).toHaveLength(2);
  });

  it("a class running past midnight stays one Lesson", () => {
    let state = complete(empty, 10, t(23, 45)); // ends 23:55
    state = complete(state, 5, t(24, 10)); // 00:10 the next day
    expect(state.lessons).toHaveLength(1);
  });
});

describe("the current Lesson", () => {
  it("is the latest Lesson until the Lesson Gap has passed", () => {
    const state = complete(empty, 3, t(9)); // ends 9:03
    expect(currentLesson(state, t(10, 33)).runs).toHaveLength(1);
    expect(currentLesson(state, t(10, 33) + 1)).toBeNull();
  });

  it("is none before any Run", () => {
    expect(currentLesson(empty, t(9))).toBeNull();
  });

  it("stays current while a Run that started within the Lesson Gap is going", () => {
    let state = complete(empty, 3, t(9)); // ends 9:03
    state = start(state, 10, t(10, 30));
    expect(currentLesson(state, t(10, 39)).runs).toHaveLength(1);
  });

  it("is none while a Run that started after the Lesson Gap is going", () => {
    let state = complete(empty, 3, t(9)); // ends 9:03
    state = start(state, 10, t(11));
    expect(currentLesson(state, t(11, 1))).toBeNull();
  });
});

describe("replacing a Run", () => {
  it("saves the current Run as Stopped and starts the new Preset", () => {
    const state = replace(start(empty, 3, t(9)), 5, t(9, 1));
    expect(currentLesson(state, t(9, 1)).runs).toEqual([
      { preset: 3, startedAt: t(9), endedAt: t(9, 1), outcome: "stopped" },
    ]);
    expect(remaining(state, t(9, 1))).toBe(5 * MIN);
  });

  it("restarting with the same Preset begins its countdown again", () => {
    const state = replace(start(empty, 3, t(9)), 3, t(9, 2));
    expect(remaining(state, t(9, 2))).toBe(3 * MIN);
  });

  it("drops the replaced Run if it was a Mis-tap", () => {
    const state = replace(start(empty, 1, t(9)), 2, t(9, 0, 2));
    expect(state.lessons).toEqual([]);
    expect(remaining(state, t(9, 0, 2))).toBe(2 * MIN);
  });
});

describe("Lesson summaries", () => {
  it("list Lessons newest first with start time, Run count and total time actually ran", () => {
    let state = complete(empty, 3, t(9)); // morning: 3 min
    state = stop(start(state, 5, t(9, 10)), t(9, 12, 41)); // + 2:41 stopped
    state = complete(state, 10, t(18)); // evening: 10 min

    expect(lessonSummaries(state)).toEqual([
      { id: t(18), startedAt: t(18), runCount: 1, totalMs: 10 * MIN },
      { id: t(9), startedAt: t(9), runCount: 2, totalMs: 3 * MIN + 2 * MIN + 41_000 },
    ]);
  });
});

describe("after the app is closed mid-Run", () => {
  it("a saved Run reloaded after its end is filed as Completed at its planned end", () => {
    const saved = JSON.stringify(start(empty, 5, t(9)));
    const { completed } = check(JSON.parse(saved), t(11));
    expect(completed).toEqual({ preset: 5, startedAt: t(9), endedAt: t(9, 5), outcome: "completed" });
  });
});

describe("deleting a Lesson", () => {
  it("removes that Lesson and its Runs, leaving the others", () => {
    let state = complete(empty, 3, t(9)); // morning Lesson
    state = complete(state, 10, t(18)); // evening Lesson
    state = deleteLesson(state, t(9));
    expect(lessonSummaries(state).map((lesson) => lesson.id)).toEqual([t(18)]);
  });

  it("leaves a Run that is going untouched", () => {
    let state = complete(empty, 3, t(9));
    state = start(state, 5, t(9, 10));
    state = deleteLesson(state, t(9));
    expect(state.lessons).toEqual([]);
    expect(remaining(state, t(9, 10))).toBe(5 * MIN);
  });
});

// The History tab redraws only when `lessons` is a different list, so an open Lesson
// stays open while Runs start and stop.
describe("the list of Lessons", () => {
  it("is the same list when no Lesson changed", () => {
    const state = complete(empty, 3, t(9));
    expect(start(state, 5, t(9, 10)).lessons).toBe(state.lessons);
    expect(stop(start(state, 5, t(9, 10)), t(9, 10, 4)).lessons).toBe(state.lessons); // Mis-tap
    expect(check(start(state, 5, t(9, 10)), t(9, 11)).state.lessons).toBe(state.lessons); // not at zero yet
    expect(deleteLesson(state, t(18)).lessons).toBe(state.lessons); // no such Lesson
  });

  it("is a new list when a Run is filed or a Lesson is deleted", () => {
    const state = complete(empty, 3, t(9));
    expect(stop(start(state, 5, t(9, 10)), t(9, 12)).lessons).not.toBe(state.lessons);
    expect(check(start(state, 5, t(9, 10)), t(9, 15)).state.lessons).not.toBe(state.lessons);
    expect(deleteLesson(state, t(9)).lessons).not.toBe(state.lessons);
  });
});
