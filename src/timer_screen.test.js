import { describe, expect, it } from "vitest";
import { createTimerScreen } from "./timer_screen.js";

// Times in ms; hours past midnight on 22 Nov 2026 (UTC).
const t = (h, m = 0, s = 0, ms = 0) => Date.UTC(2026, 10, 22, h, m, s, ms);

// Starts a Run the quick way: a tap selects the Preset, a second tap on it starts it.
function startRun(screen, preset, now) {
  screen.tapPreset(preset, now);
  return screen.tapPreset(preset, now);
}

function memoryStore(state = { lessons: [], activeRun: null }) {
  return {
    getState: () => state,
    setState: (next) => {
      state = next;
    },
  };
}

describe("starting a Run", () => {
  it("starts from a second tap on the Selected Preset, and shows its countdown", () => {
    const screen = createTimerScreen(memoryStore());
    expect(screen.view(t(9)).countdown).toBe("Ready");

    screen.tapPreset(3, t(9));
    const effects = screen.tapPreset(3, t(9));

    expect(effects).toEqual({ unlockAudio: true });
    expect(screen.view(t(9, 0, 30))).toMatchObject({ countdown: "2:30", mode: "running", running: true, armedPreset: null });
  });
});

describe("the Lotus dial", () => {
  it("shows nothing in Ready, and how far the Run has gone while it is going", () => {
    const screen = createTimerScreen(memoryStore());
    expect(screen.view(t(9)).dial).toBeNull();

    startRun(screen, 10, t(9));

    expect(screen.view(t(9, 6)).dial).toEqual({ durationMs: 10 * 60_000, elapsedMs: 6 * 60_000 });
  });

  it("keeps the completed Run through the 4 s celebration, then shows nothing", () => {
    const screen = createTimerScreen(memoryStore());
    startRun(screen, 1, t(9));
    screen.tick(t(9, 1, 0, 200));

    expect(screen.view(t(9, 1, 3)).dial).toEqual({ durationMs: 60_000, elapsedMs: 63_000 });
    expect(screen.view(t(9, 1, 4, 200)).dial).toBeNull();
  });

  it("shows nothing after a Run completed while the app was away", () => {
    const screen = createTimerScreen(memoryStore());
    startRun(screen, 1, t(9));
    screen.tick(t(9, 7));

    expect(screen.view(t(9, 7)).dial).toBeNull();
  });

  it("starts over for the new Run after a Replace, and shows nothing after Stop", () => {
    const screen = createTimerScreen(memoryStore());
    startRun(screen, 3, t(9));
    screen.tapPreset(5, t(9, 1));
    screen.tapPreset(5, t(9, 1, 2));
    screen.tapDial(t(9, 1, 2));

    expect(screen.view(t(9, 1, 3)).dial).toEqual({ durationMs: 5 * 60_000, elapsedMs: 1_000 });

    screen.tapDial(t(9, 2));
    screen.stop(t(9, 2));
    expect(screen.view(t(9, 2)).dial).toBeNull();
  });
});

describe("the Replace confirmation", () => {
  it("arms the tapped Preset during a Run, and a second tap within 3 s Replaces the Run, selecting that Preset", () => {
    const screen = createTimerScreen(memoryStore());
    startRun(screen, 3, t(9));

    expect(screen.tapPreset(5, t(9, 1))).toEqual({});
    expect(screen.view(t(9, 1))).toMatchObject({ countdown: "2:00", armedPreset: 5 });

    expect(screen.tapPreset(5, t(9, 1, 2))).toEqual({ unlockAudio: true });
    expect(screen.view(t(9, 1, 2))).toMatchObject({ countdown: "5:00", mode: "selected", selectedPreset: 5, running: false, armedPreset: null });
    expect(screen.view(t(9, 1, 2)).lessonRuns).toEqual([{ text: "3 min · stopped 1:02", outcome: "stopped" }]);
    // Nothing counts until it is started.
    expect(screen.view(t(9, 1, 30)).countdown).toBe("5:00");
  });

  it("runs out after 3 s, and the next tap arms the Preset again", () => {
    const screen = createTimerScreen(memoryStore());
    startRun(screen, 3, t(9));
    screen.tapPreset(5, t(9, 1));

    expect(screen.view(t(9, 1, 2, 999)).armedPreset).toBe(5);
    expect(screen.view(t(9, 1, 3)).armedPreset).toBeNull();

    expect(screen.tapPreset(5, t(9, 1, 4))).toEqual({});
    expect(screen.view(t(9, 1, 4))).toMatchObject({ countdown: "1:56", armedPreset: 5 });
  });

  it("moves to a different Preset when that one is tapped instead", () => {
    const screen = createTimerScreen(memoryStore());
    startRun(screen, 3, t(9));
    screen.tapPreset(5, t(9, 1));

    expect(screen.tapPreset(10, t(9, 1, 1))).toEqual({});
    expect(screen.view(t(9, 1, 1))).toMatchObject({ countdown: "1:59", armedPreset: 10 });

    // 5 is no longer armed, so tapping it arms it rather than Replacing.
    expect(screen.tapPreset(5, t(9, 1, 2))).toEqual({});
    expect(screen.view(t(9, 1, 2))).toMatchObject({ countdown: "1:58", armedPreset: 5 });
  });

  it("is cancelled by Stop", () => {
    const screen = createTimerScreen(memoryStore());
    startRun(screen, 3, t(9));
    screen.tapDial(t(9, 1));
    screen.tapPreset(5, t(9, 1));

    expect(screen.stop(t(9, 1, 1))).toEqual({});
    expect(screen.view(t(9, 1, 1))).toMatchObject({ countdown: "Ready", mode: "ready", armedPreset: null, running: false });
    expect(screen.view(t(9, 1, 1)).lessonRuns).toEqual([{ text: "3 min · stopped 1:00", outcome: "stopped" }]);
  });

  it("is cancelled when the Run completes", () => {
    const screen = createTimerScreen(memoryStore());
    startRun(screen, 1, t(9));
    screen.tapPreset(5, t(9, 0, 58));

    screen.tick(t(9, 1));
    expect(screen.view(t(9, 1)).armedPreset).toBeNull();

    // So the next tap selects the Preset, with no "Tap again".
    expect(screen.tapPreset(5, t(9, 1, 0, 500))).toEqual({ unlockAudio: true });
    expect(screen.view(t(9, 1, 0, 500))).toMatchObject({ countdown: "5:00", mode: "selected", armedPreset: null });
  });
});

describe("reaching zero", () => {
  it("on time: rings once, pulses 0:00 for 4 s, settles for 2 s while the picture fades, then shows Ready", () => {
    const screen = createTimerScreen(memoryStore());
    startRun(screen, 1, t(9));

    expect(screen.tick(t(9, 0, 59, 750))).toEqual({});
    expect(screen.tick(t(9, 1, 0, 200))).toEqual({ ring: true });
    expect(screen.tick(t(9, 1, 0, 450))).toEqual({});

    expect(screen.view(t(9, 1, 0, 450))).toMatchObject({ countdown: "0:00", mode: "pulsing", running: false });
    expect(screen.view(t(9, 1, 0, 450)).lessonRuns).toEqual([{ text: "1 min · completed", outcome: "completed" }]);
    expect(screen.view(t(9, 1, 4, 199)).mode).toBe("pulsing");
    expect(screen.view(t(9, 1, 4, 200))).toMatchObject({ countdown: "0:00", mode: "settling", running: false });
    expect(screen.view(t(9, 1, 6, 199)).mode).toBe("settling");
    expect(screen.view(t(9, 1, 6, 200))).toMatchObject({ countdown: "Ready", mode: "ready" });
  });

  it("a Preset tapped while the picture settles: selects it straight away", () => {
    const screen = createTimerScreen(memoryStore());
    startRun(screen, 1, t(9));
    screen.tick(t(9, 1));

    expect(screen.tapPreset(2, t(9, 1, 5))).toEqual({ unlockAudio: true });
    expect(screen.view(t(9, 1, 5))).toMatchObject({ countdown: "2:00", mode: "selected" });
  });

  it("late (the app was away past zero): files it Completed with no ring and no pulse", () => {
    const screen = createTimerScreen(memoryStore());
    startRun(screen, 1, t(9));

    expect(screen.tick(t(9, 7))).toEqual({});

    expect(screen.view(t(9, 7))).toMatchObject({ countdown: "Ready", mode: "ready", running: false });
    expect(screen.view(t(9, 7)).lessonRuns).toEqual([{ text: "1 min · completed", outcome: "completed" }]);
  });

  it("a Preset tapped at the moment of zero: the Run is Completed, rings, and the Preset is selected", () => {
    const screen = createTimerScreen(memoryStore());
    startRun(screen, 1, t(9));

    // The tap lands before the next tick has noticed zero.
    expect(screen.tapPreset(3, t(9, 1, 0, 100))).toEqual({ ring: true, unlockAudio: true });

    expect(screen.view(t(9, 1, 0, 100))).toMatchObject({ countdown: "3:00", mode: "selected", armedPreset: null });
    expect(screen.view(t(9, 1, 0, 100)).lessonRuns).toEqual([{ text: "1 min · completed", outcome: "completed" }]);
  });
});

describe("a Mis-tap", () => {
  it("Stopped under 5 s leaves the current Lesson's list unchanged, and the screen Ready", () => {
    const screen = createTimerScreen(memoryStore());
    startRun(screen, 1, t(9));
    screen.tick(t(9, 1));
    const before = screen.view(t(9, 1)).lessonRuns;

    // Started while 0:00 is still pulsing, then Stopped straight away.
    startRun(screen, 3, t(9, 1, 1));
    screen.tapDial(t(9, 1, 3));
    screen.stop(t(9, 1, 3));

    expect(screen.view(t(9, 1, 3))).toMatchObject({ countdown: "Ready", mode: "ready", running: false });
    expect(screen.view(t(9, 1, 3)).lessonRuns).toEqual(before);
  });
});

describe("This lesson", () => {
  it("lists the newest Run first", () => {
    const screen = createTimerScreen(memoryStore());
    startRun(screen, 1, t(9));
    screen.tick(t(9, 1));
    startRun(screen, 3, t(9, 2));
    screen.tapDial(t(9, 3, 30));
    screen.stop(t(9, 3, 30));

    expect(screen.view(t(9, 4)).lessonRuns).toEqual([
      { text: "3 min · stopped 1:30", outcome: "stopped" },
      { text: "1 min · completed", outcome: "completed" },
    ]);
  });

  it("counts every Run in its heading, with the time they ran as History totals it", () => {
    const screen = createTimerScreen(memoryStore());
    startRun(screen, 1, t(9));
    screen.tick(t(9, 1));
    startRun(screen, 3, t(9, 2));
    screen.tapDial(t(9, 3, 30));
    screen.stop(t(9, 3, 30));

    expect(screen.view(t(9, 4)).lessonHeading).toBe("This lesson · 2 runs · 3 min");
  });

  it("says 1 run for one, and counts a Run that is going only once it ends", () => {
    const screen = createTimerScreen(memoryStore());
    startRun(screen, 1, t(9));
    screen.tick(t(9, 1));
    startRun(screen, 5, t(9, 2));

    expect(screen.view(t(9, 4)).lessonHeading).toBe("This lesson · 1 run · 1 min");
  });

  it("has no heading before the first Run of a Lesson ends", () => {
    const screen = createTimerScreen(memoryStore());
    startRun(screen, 3, t(9));

    expect(screen.view(t(9, 1)).lessonHeading).toBeNull();
  });
});

describe("pausing", () => {
  it("a tap on the dial pauses the Run, holding its countdown, and another resumes it", () => {
    const screen = createTimerScreen(memoryStore());
    startRun(screen, 3, t(9));

    expect(screen.tapDial(t(9, 0, 30))).toEqual({});
    expect(screen.view(t(9, 5))).toMatchObject({ countdown: "2:30", mode: "paused", running: true });

    expect(screen.tapDial(t(9, 5))).toEqual({});
    expect(screen.view(t(9, 5, 10))).toMatchObject({ countdown: "2:20", mode: "running", running: true });
  });

  it("Stop works only while paused, and saves the time the Run counted", () => {
    const screen = createTimerScreen(memoryStore());
    startRun(screen, 3, t(9));

    expect(screen.stop(t(9, 1))).toEqual({});
    expect(screen.view(t(9, 1))).toMatchObject({ countdown: "2:00", mode: "running" });

    screen.tapDial(t(9, 1));
    screen.stop(t(9, 4));
    expect(screen.view(t(9, 4))).toMatchObject({ countdown: "Ready", mode: "ready", running: false });
    expect(screen.view(t(9, 4)).lessonRuns).toEqual([{ text: "3 min · stopped 1:00", outcome: "stopped" }]);
  });

  it("a tap on the dial does nothing in Ready, while 0:00 pulses, or while the picture settles", () => {
    const screen = createTimerScreen(memoryStore());
    expect(screen.tapDial(t(9))).toEqual({});
    expect(screen.view(t(9))).toMatchObject({ countdown: "Ready", mode: "ready", running: false });

    startRun(screen, 1, t(9));
    screen.tick(t(9, 1));
    expect(screen.tapDial(t(9, 1, 1))).toEqual({});
    expect(screen.view(t(9, 1, 1))).toMatchObject({ countdown: "0:00", mode: "pulsing", running: false });

    expect(screen.tapDial(t(9, 1, 5))).toEqual({});
    expect(screen.view(t(9, 1, 5))).toMatchObject({ mode: "settling", running: false });
  });

  it("a Paused Run is Replaced as a counting one is: Tap again, then the Preset is selected", () => {
    const screen = createTimerScreen(memoryStore());
    startRun(screen, 3, t(9));
    screen.tapDial(t(9, 1));

    expect(screen.tapPreset(5, t(9, 4))).toEqual({});
    expect(screen.view(t(9, 4))).toMatchObject({ mode: "paused", countdown: "2:00", armedPreset: 5 });

    expect(screen.tapPreset(5, t(9, 4, 1))).toEqual({ unlockAudio: true });
    expect(screen.view(t(9, 4, 1))).toMatchObject({ mode: "selected", countdown: "5:00", armedPreset: null });
    expect(screen.view(t(9, 4, 1)).lessonRuns).toEqual([{ text: "3 min · stopped 1:00", outcome: "stopped" }]);
  });

  it("a tap on the dial at the moment of zero completes the Run and rings, with nothing to pause", () => {
    const screen = createTimerScreen(memoryStore());
    startRun(screen, 1, t(9));

    expect(screen.tapDial(t(9, 1, 0, 100))).toEqual({ ring: true });
    expect(screen.view(t(9, 1, 0, 100)).mode).toBe("pulsing");
  });

  it("a tap on the dial cancels a Preset's Tap again", () => {
    const screen = createTimerScreen(memoryStore());
    startRun(screen, 3, t(9));
    screen.tapPreset(5, t(9, 1));

    screen.tapDial(t(9, 1, 1));
    expect(screen.view(t(9, 1, 1))).toMatchObject({ mode: "paused", armedPreset: null });

    // So the next tap on 5 arms it again rather than Replacing the Run.
    expect(screen.tapPreset(5, t(9, 1, 2))).toEqual({});
    expect(screen.view(t(9, 1, 2))).toMatchObject({ mode: "paused", countdown: "1:59", armedPreset: 5 });
  });

  it("names the dial for VoiceOver: Pause while it counts, Resume while paused, nothing outside a Run", () => {
    const screen = createTimerScreen(memoryStore());
    expect(screen.view(t(9)).dialLabel).toBeNull();

    startRun(screen, 3, t(9));
    expect(screen.view(t(9, 0, 19)).dialLabel).toBe("Pause, 2:41 left");

    screen.tapDial(t(9, 0, 19));
    expect(screen.view(t(9, 3)).dialLabel).toBe("Resume, 2:41 left");
  });

  it("holds the Lotus dial where the Run was paused, and carries on from there", () => {
    const screen = createTimerScreen(memoryStore());
    startRun(screen, 1, t(9));
    screen.tapDial(t(9, 0, 20));

    expect(screen.view(t(9, 5)).dial).toEqual({ durationMs: 60_000, elapsedMs: 20_000 });

    screen.tapDial(t(9, 5));
    expect(screen.view(t(9, 5, 10)).dial).toEqual({ durationMs: 60_000, elapsedMs: 30_000 });

    // Through the celebration too: zero comes at 9:05:40.
    screen.tick(t(9, 5, 40));
    expect(screen.view(t(9, 5, 42)).dial).toEqual({ durationMs: 60_000, elapsedMs: 62_000 });
  });

  it("files a Run left paused past the Lesson Gap as Stopped, with no ring, and shows Ready", () => {
    const store = memoryStore();
    const screen = createTimerScreen(store);
    startRun(screen, 5, t(9));
    screen.tapDial(t(9, 2));

    expect(screen.tick(t(11))).toEqual({});

    expect(store.getState().activeRun).toBeNull();
    expect(screen.view(t(11))).toMatchObject({ countdown: "Ready", mode: "ready", running: false });
    // Lesson Gap passed since it ended at 9:02, so it is no longer "This lesson".
    expect(store.getState().lessons[0].runs).toMatchObject([{ preset: 5, endedAt: t(9, 2), outcome: "stopped" }]);
  });
});

describe("selecting a Preset", () => {
  it("a tap selects it: its time shows, nothing counts and nothing is saved", () => {
    const store = memoryStore();
    const screen = createTimerScreen(store);

    expect(screen.tapPreset(3, t(9))).toEqual({ unlockAudio: true });

    expect(screen.view(t(9, 2))).toMatchObject({
      countdown: "3:00",
      mode: "selected",
      selectedPreset: 3,
      running: false,
      dialLabel: "Start, 3:00",
      dial: { durationMs: 3 * 60_000, elapsedMs: 0 },
    });
    expect(store.getState()).toEqual({ lessons: [], activeRun: null });
  });

  it("another Preset tapped is selected instead", () => {
    const screen = createTimerScreen(memoryStore());
    screen.tapPreset(3, t(9));
    screen.tapPreset(5, t(9, 0, 1));

    expect(screen.view(t(9, 0, 1))).toMatchObject({ countdown: "5:00", selectedPreset: 5 });
  });

  it("a tap on the lotus starts its Run", () => {
    const screen = createTimerScreen(memoryStore());
    screen.tapPreset(3, t(9));

    expect(screen.tapDial(t(9, 1))).toEqual({ unlockAudio: true });
    expect(screen.view(t(9, 1, 30))).toMatchObject({ countdown: "2:30", mode: "running", selectedPreset: null });
  });

  it("− and + Adjust its time by its step, and the Run counts down from it", () => {
    const screen = createTimerScreen(memoryStore());
    screen.tapPreset(1, t(9));

    expect(screen.adjust(+1, t(9))).toEqual({});
    screen.adjust(+1, t(9));
    expect(screen.view(t(9))).toMatchObject({ countdown: "1:10", dialLabel: "Start, 1:10" });
    screen.adjust(-1, t(9));
    expect(screen.view(t(9)).countdown).toBe("1:05");

    screen.tapDial(t(9));
    expect(screen.view(t(9, 1))).toMatchObject({ countdown: "0:05", dial: { durationMs: 65_000, elapsedMs: 60_000 } });
  });

  it("says what − and + do, and dims each at its limit", () => {
    const screen = createTimerScreen(memoryStore());
    expect(screen.view(t(9)).adjust).toBeNull();

    screen.tapPreset(10, t(9));
    expect(screen.view(t(9)).adjust).toEqual({ step: 30, canRemove: true, canAdd: true });

    screen.tapPreset(1, t(9));
    for (let i = 0; i < 12; i++) screen.adjust(-1, t(9));
    expect(screen.view(t(9))).toMatchObject({ countdown: "0:05", adjust: { step: 5, canRemove: false, canAdd: true } });
  });

  it("Cancel drops the selection and shows Ready, with nothing saved", () => {
    const store = memoryStore();
    const screen = createTimerScreen(store);
    screen.tapPreset(3, t(9));

    expect(screen.stop(t(9, 0, 5))).toEqual({});
    expect(screen.view(t(9, 0, 5))).toMatchObject({ countdown: "Ready", mode: "ready", selectedPreset: null, adjust: null });
    expect(store.getState()).toEqual({ lessons: [], activeRun: null });
  });

  it("Adjusts only that Run: the next selection starts from the Preset's own time", () => {
    const screen = createTimerScreen(memoryStore());
    screen.tapPreset(1, t(9));
    screen.adjust(+1, t(9));
    screen.tapDial(t(9));
    screen.tapDial(t(9, 0, 10));
    screen.stop(t(9, 0, 10));

    screen.tapPreset(1, t(9, 1));
    expect(screen.view(t(9, 1)).countdown).toBe("1:00");
    expect(screen.view(t(9, 1)).lessonRuns).toEqual([{ text: "1:05 · stopped 0:10", outcome: "stopped" }]);
  });

  it("− and + do nothing during a Run", () => {
    const screen = createTimerScreen(memoryStore());
    startRun(screen, 1, t(9));
    screen.tapDial(t(9, 0, 10));

    screen.adjust(+1, t(9, 0, 20));
    expect(screen.view(t(9, 0, 20))).toMatchObject({ countdown: "0:50", adjust: null });
  });

  it("Replace drops the Run it ends if that was a Mis-tap", () => {
    const screen = createTimerScreen(memoryStore());
    startRun(screen, 1, t(9));
    screen.tapPreset(2, t(9, 0, 1));
    screen.tapPreset(2, t(9, 0, 2));

    expect(screen.view(t(9, 0, 2))).toMatchObject({ mode: "selected", countdown: "2:00", lessonRuns: [] });
  });

  it("restarting is replacing with the same Preset, which starts from its own time again", () => {
    const screen = createTimerScreen(memoryStore());
    startRun(screen, 3, t(9));
    startRun(screen, 3, t(9, 2));
    screen.tapDial(t(9, 2));

    expect(screen.view(t(9, 2, 30))).toMatchObject({ mode: "running", countdown: "2:30" });
    expect(screen.view(t(9, 2, 30)).lessonRuns).toEqual([{ text: "3 min · stopped 2:00", outcome: "stopped" }]);
  });
});
