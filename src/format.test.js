import { describe, expect, it } from "vitest";
import { formatCountdown, describeRun, describeRuns, describeLesson } from "./format.js";

describe("the countdown", () => {
  it("shows the full Preset when a Run starts", () => {
    expect(formatCountdown(3 * 60_000)).toBe("3:00");
    expect(formatCountdown(10 * 60_000)).toBe("10:00");
  });

  it("rounds part-seconds up, so it reads 0:01 until it really is zero", () => {
    expect(formatCountdown(179_001)).toBe("3:00");
    expect(formatCountdown(179_000)).toBe("2:59");
    expect(formatCountdown(1)).toBe("0:01");
    expect(formatCountdown(0)).toBe("0:00");
  });
});

describe("a Run in the lesson list", () => {
  it("shows a Completed Run by its Preset", () => {
    expect(describeRun({ preset: 3, startedAt: 0, endedAt: 180_000, outcome: "completed" })).toBe("3 min · completed");
  });

  it("shows a Stopped Run with the whole seconds it ran", () => {
    expect(describeRun({ preset: 5, startedAt: 0, endedAt: 161_900, outcome: "stopped" })).toBe("5 min · stopped 2:41");
  });

  it("lists a Lesson's Runs as lines ready to draw, with their outcome", () => {
    const runs = [
      { preset: 3, startedAt: 0, endedAt: 180_000, outcome: "completed" },
      { preset: 5, startedAt: 200_000, endedAt: 361_900, outcome: "stopped" },
    ];
    expect(describeRuns(runs)).toEqual([
      { text: "3 min · completed", outcome: "completed" },
      { text: "5 min · stopped 2:41", outcome: "stopped" },
    ]);
  });
});

describe("a Lesson in History", () => {
  const MIN = 60_000;
  const at = Date.UTC(2026, 10, 21, 9, 0);
  const uk = { locale: "en-GB", timeZone: "UTC" };
  const lesson = (totalMs, runCount = 2, startedAt = at) => ({ id: startedAt, startedAt, runCount, totalMs });

  it("totals the time timed in whole minutes, to the nearest minute", () => {
    expect(describeLesson(lesson(5 * MIN + 41_000), uk).total).toBe("6 min");
    expect(describeLesson(lesson(2 * MIN + 29_000), uk).total).toBe("2 min");
    expect(describeLesson(lesson(2 * MIN + 30_000), uk).total).toBe("3 min");
  });

  it("shows a Lesson of under half a minute as <1 min, not 0 min", () => {
    expect(describeLesson(lesson(12_000, 1), uk).total).toBe("<1 min");
  });

  it("counts its Runs", () => {
    expect(describeLesson(lesson(MIN, 1), uk).runs).toBe("1 run");
    expect(describeLesson(lesson(5 * MIN, 3), uk).runs).toBe("3 runs");
  });

  it("dates it by when its first Run started, in the phone's language and time zone", () => {
    expect(describeLesson(lesson(MIN), uk)).toMatchObject({ date: "Sat 21 Nov", time: "9:00" });
    const lateEvening = lesson(MIN, 1, Date.UTC(2026, 10, 21, 23, 30));
    expect(describeLesson(lateEvening, { locale: "es-ES", timeZone: "Europe/Madrid" })).toMatchObject({
      date: "dom, 22 nov",
      time: "0:30",
    });
  });
});
