import { describe, expect, it } from "vitest";
import { createChime } from "./chime.js";

// An in-memory stand-in for localStorage.
function fakeStorage(items = {}) {
  const data = new Map(Object.entries(items));
  return {
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => data.set(key, String(value)),
  };
}

// Records what would have sounded, instead of using Web Audio.
function fakePlayer() {
  const player = {
    calls: [],
    play(name) {
      const call = { play: name, stopped: false };
      player.calls.push(call);
      return () => (call.stopped = true);
    },
    unlock() {
      player.calls.push({ unlock: true });
    },
  };
  return player;
}

function setup({ storage = fakeStorage(), running = false } = {}) {
  const player = fakePlayer();
  const run = { going: running };
  const chime = createChime({ storage, player, isRunning: () => run.going });
  return { chime, player, storage, run };
}

describe("her Chime choice", () => {
  it("is Singing bowl when nothing has been chosen", () => {
    expect(setup().chime.current).toBe("bowl");
  });

  it.each([["an unknown name", "drum"], ["an empty value", ""]])(
    "falls back to Singing bowl when the saved value is %s",
    (_, saved) => {
      expect(setup({ storage: fakeStorage({ "yogi-timer.chime": saved }) }).chime.current).toBe("bowl");
    },
  );

  it("falls back to Singing bowl when storage is blocked and can't be read", () => {
    const blocked = { ...fakeStorage(), getItem: () => { throw new DOMException("denied", "SecurityError"); } };
    expect(setup({ storage: blocked }).chime.current).toBe("bowl");
  });
});

describe("choosing a Chime", () => {
  it("with no Run going: saves it and previews it once; choosing again stops that preview", () => {
    const { chime, player, storage } = setup();

    chime.choose("gong");
    expect(chime.current).toBe("gong");
    expect(createChime({ storage, player: fakePlayer(), isRunning: () => false }).current).toBe("gong");
    expect(player.calls).toEqual([{ play: "gong", stopped: false }]);

    chime.choose("tingsha");
    expect(player.calls).toEqual([{ play: "gong", stopped: true }, { play: "tingsha", stopped: false }]);
  });

  it("during a Run: saves it with no preview, and the Run then rings with the new Chime", () => {
    const { chime, player } = setup({ running: true });

    chime.choose("tingsha");
    expect(chime.current).toBe("tingsha");
    expect(player.calls).toEqual([]);

    chime.ring();
    expect(player.calls).toEqual([{ play: "tingsha", stopped: false }]);
  });
});

describe("at zero", () => {
  it("plays her current Chime", () => {
    const { chime, player } = setup({ storage: fakeStorage({ "yogi-timer.chime": "gong" }), running: true });
    chime.ring();
    expect(player.calls).toEqual([{ play: "gong", stopped: false }]);
  });
});

describe("unlocking audio", () => {
  it("a Run starting stops a playing preview and unlocks audio", () => {
    const { chime, player } = setup();
    chime.choose("gong");

    chime.unlockForRun();
    expect(player.calls).toEqual([{ play: "gong", stopped: true }, { unlock: true }]);
  });
  it("a tap on the Timer tab unlocks audio only while a Run is going", () => {
    const { chime, player, run } = setup();
    chime.tap();
    expect(player.calls).toEqual([]);

    run.going = true; // e.g. iOS closed the app mid-Run and it reopened with audio locked
    chime.tap();
    expect(player.calls).toEqual([{ unlock: true }]);
  });
});

describe("when the choice can't be saved", () => {
  it("still applies until the app is closed (storage full or blocked)", () => {
    const full = { ...fakeStorage(), setItem: () => { throw new DOMException("full", "QuotaExceededError"); } };
    const { chime, player } = setup({ storage: full });

    chime.choose("gong");
    expect(chime.current).toBe("gong");
    expect(player.calls).toEqual([{ play: "gong", stopped: false }]);
  });
});
