import { describe, expect, it } from "vitest";
import { createTimerScreen } from "./timer_screen.js";

// Times in ms; hours past midnight on 22 Nov 2026 (UTC).
const t = (h, m = 0, s = 0, ms = 0) => Date.UTC(2026, 10, 22, h, m, s, ms);

function memoryStore(state = { lessons: [], activeRun: null }) {
  return {
    getState: () => state,
    setState: (next) => {
      state = next;
    },
  };
}

describe("starting a Run", () => {
  it("starts straight away when no Run is going, and shows its countdown", () => {
    const screen = createTimerScreen(memoryStore());
    expect(screen.view(t(9)).countdown).toBe("Ready");

    const effects = screen.tapPreset(3, t(9));

    expect(effects).toEqual({ unlockAudio: true });
    expect(screen.view(t(9, 0, 30))).toMatchObject({ countdown: "2:30", mode: "running", running: true, armedPreset: null });
  });
});

describe("the Replace confirmation", () => {
  it("arms the tapped Preset during a Run, and a second tap within 3 s Replaces the Run", () => {
    const screen = createTimerScreen(memoryStore());
    screen.tapPreset(3, t(9));

    expect(screen.tapPreset(5, t(9, 1))).toEqual({});
    expect(screen.view(t(9, 1))).toMatchObject({ countdown: "2:00", armedPreset: 5 });

    expect(screen.tapPreset(5, t(9, 1, 2))).toEqual({ unlockAudio: true });
    expect(screen.view(t(9, 1, 2))).toMatchObject({ countdown: "5:00", armedPreset: null });
    expect(screen.view(t(9, 1, 2)).lessonRuns).toEqual([{ text: "3 min · stopped 1:02", outcome: "stopped" }]);
  });

  it("runs out after 3 s, and the next tap arms the Preset again", () => {
    const screen = createTimerScreen(memoryStore());
    screen.tapPreset(3, t(9));
    screen.tapPreset(5, t(9, 1));

    expect(screen.view(t(9, 1, 2, 999)).armedPreset).toBe(5);
    expect(screen.view(t(9, 1, 3)).armedPreset).toBeNull();

    expect(screen.tapPreset(5, t(9, 1, 4))).toEqual({});
    expect(screen.view(t(9, 1, 4))).toMatchObject({ countdown: "1:56", armedPreset: 5 });
  });

  it("moves to a different Preset when that one is tapped instead", () => {
    const screen = createTimerScreen(memoryStore());
    screen.tapPreset(3, t(9));
    screen.tapPreset(5, t(9, 1));

    expect(screen.tapPreset(10, t(9, 1, 1))).toEqual({});
    expect(screen.view(t(9, 1, 1))).toMatchObject({ countdown: "1:59", armedPreset: 10 });

    // 5 is no longer armed, so tapping it arms it rather than Replacing.
    expect(screen.tapPreset(5, t(9, 1, 2))).toEqual({});
    expect(screen.view(t(9, 1, 2))).toMatchObject({ countdown: "1:58", armedPreset: 5 });
  });

  it("is cancelled by Stop", () => {
    const screen = createTimerScreen(memoryStore());
    screen.tapPreset(3, t(9));
    screen.tapPreset(5, t(9, 1));

    expect(screen.stop(t(9, 1, 1))).toEqual({});
    expect(screen.view(t(9, 1, 1))).toMatchObject({ countdown: "Ready", mode: "ready", armedPreset: null, running: false });
    expect(screen.view(t(9, 1, 1)).lessonRuns).toEqual([{ text: "3 min · stopped 1:01", outcome: "stopped" }]);
  });

  it("is cancelled when the Run completes", () => {
    const screen = createTimerScreen(memoryStore());
    screen.tapPreset(1, t(9));
    screen.tapPreset(5, t(9, 0, 58));

    screen.tick(t(9, 1));
    expect(screen.view(t(9, 1)).armedPreset).toBeNull();

    // So the next tap starts a Run of its own, with no "Tap again".
    expect(screen.tapPreset(5, t(9, 1, 0, 500))).toEqual({ unlockAudio: true });
    expect(screen.view(t(9, 1, 0, 500))).toMatchObject({ countdown: "5:00", running: true });
  });
});

describe("reaching zero", () => {
  it("on time: rings once, pulses 0:00 for 4 s, then shows Ready", () => {
    const screen = createTimerScreen(memoryStore());
    screen.tapPreset(1, t(9));

    expect(screen.tick(t(9, 0, 59, 750))).toEqual({});
    expect(screen.tick(t(9, 1, 0, 200))).toEqual({ ring: true });
    expect(screen.tick(t(9, 1, 0, 450))).toEqual({});

    expect(screen.view(t(9, 1, 0, 450))).toMatchObject({ countdown: "0:00", mode: "pulsing", running: false });
    expect(screen.view(t(9, 1, 0, 450)).lessonRuns).toEqual([{ text: "1 min · completed", outcome: "completed" }]);
    expect(screen.view(t(9, 1, 4, 199)).mode).toBe("pulsing");
    expect(screen.view(t(9, 1, 4, 200))).toMatchObject({ countdown: "Ready", mode: "ready" });
  });

  it("late (the app was away past zero): files it Completed with no ring and no pulse", () => {
    const screen = createTimerScreen(memoryStore());
    screen.tapPreset(1, t(9));

    expect(screen.tick(t(9, 7))).toEqual({});

    expect(screen.view(t(9, 7))).toMatchObject({ countdown: "Ready", mode: "ready", running: false });
    expect(screen.view(t(9, 7)).lessonRuns).toEqual([{ text: "1 min · completed", outcome: "completed" }]);
  });

  it("a Preset tapped at the moment of zero: the Run is Completed, rings, and the new Run starts", () => {
    const screen = createTimerScreen(memoryStore());
    screen.tapPreset(1, t(9));

    // The tap lands before the next tick has noticed zero.
    expect(screen.tapPreset(3, t(9, 1, 0, 100))).toEqual({ ring: true, unlockAudio: true });

    expect(screen.view(t(9, 1, 0, 100))).toMatchObject({ countdown: "3:00", mode: "running", armedPreset: null });
    expect(screen.view(t(9, 1, 0, 100)).lessonRuns).toEqual([{ text: "1 min · completed", outcome: "completed" }]);
  });
});

describe("a Mis-tap", () => {
  it("Stopped under 5 s leaves the current Lesson's list unchanged, and the screen Ready", () => {
    const screen = createTimerScreen(memoryStore());
    screen.tapPreset(1, t(9));
    screen.tick(t(9, 1));
    const before = screen.view(t(9, 1)).lessonRuns;

    // Started while 0:00 is still pulsing, then Stopped straight away.
    screen.tapPreset(3, t(9, 1, 1));
    screen.stop(t(9, 1, 3));

    expect(screen.view(t(9, 1, 3))).toMatchObject({ countdown: "Ready", mode: "ready", running: false });
    expect(screen.view(t(9, 1, 3)).lessonRuns).toEqual(before);
  });
});
