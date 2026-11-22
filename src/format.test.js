import { describe, expect, it } from "vitest";
import { formatCountdown, describeRun } from "./format.js";

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
});
