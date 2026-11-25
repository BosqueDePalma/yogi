import { describe, expect, it } from "vitest";
import { formatCountdown, describeRun, describeRuns, describeLesson, describeVersion } from "./format.js";
import { createText } from "./language.js";

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

  it("shows an Adjusted Run by its own time, as m:ss", () => {
    expect(describeRun({ preset: 1, startedAt: 0, endedAt: 90_000, outcome: "completed", durationMs: 90_000 })).toBe("1:30 · completed");
    expect(describeRun({ preset: 1, startedAt: 0, endedAt: 48_000, outcome: "stopped", durationMs: 90_000 })).toBe("1:30 · stopped 0:48");
  });

  it("shows an Adjusted Run of whole minutes as minutes, whatever its Preset", () => {
    expect(describeRun({ preset: 1, startedAt: 0, endedAt: 120_000, outcome: "completed", durationMs: 120_000 })).toBe("2 min · completed");
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
  const uk = createText("en", { phoneLocale: "en-GB", timeZone: "UTC" });
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
    expect(describeLesson(lateEvening, createText("es", { phoneLocale: "es-ES", timeZone: "Europe/Madrid" }))).toMatchObject({
      date: "dom, 22 nov",
      time: "0:30",
    });
  });
});

describe("in Spanish", () => {
  const es = createText("es", { phoneLocale: "es-MX", timeZone: "UTC" });

  it("names a Run's outcome", () => {
    expect(describeRun({ preset: 3, startedAt: 0, endedAt: 180_000, outcome: "completed" }, es)).toBe("3 min · completada");
    expect(describeRun({ preset: 2, startedAt: 0, endedAt: 90_000, outcome: "stopped" }, es)).toBe("2 min · detenida 1:30");
    expect(describeRuns([{ preset: 1, startedAt: 0, endedAt: 60_000, outcome: "completed" }], es)[0].text).toBe("1 min · completada");
  });

  it("counts a Lesson's Runs, and dates it in the phone's region", () => {
    const at = Date.UTC(2026, 10, 21, 18, 0);
    expect(describeLesson({ id: at, startedAt: at, runCount: 1, totalMs: 60_000 }, es)).toMatchObject({ runs: "1 ronda", total: "1 min" });
    expect(describeLesson({ id: at, startedAt: at, runCount: 5, totalMs: 14 * 60_000 }, es).runs).toBe("5 rondas");
    const { date } = describeLesson({ id: at, startedAt: at, runCount: 1, totalMs: 60_000 }, es);
    expect(date).toMatch(/sáb/);
  });

  it("dates it in the app's language even on a phone in another one", () => {
    const at = Date.UTC(2026, 10, 21, 18, 0);
    const onEnglishPhone = createText("es", { phoneLocale: "en-US", timeZone: "UTC" });
    expect(describeLesson({ id: at, startedAt: at, runCount: 1, totalMs: 60_000 }, onEnglishPhone).date).toMatch(/sáb/);
  });
});

describe("the version line", () => {
  it("dates the build in the app's language, on its own calendar day", () => {
    expect(describeVersion("2026-11-24", "304be28", createText("es", { phoneLocale: "es-MX", timeZone: "America/Mexico_City" }))).toBe("Versión 24 nov 2026 · 304be28");
    expect(describeVersion("2026-11-24", "", createText("en", { phoneLocale: "en-GB" }))).toBe("Version 24 Nov 2026");
    expect(describeVersion("%VITE_APP_BUILT%", "", createText("en"))).toBeNull();
  });
});
