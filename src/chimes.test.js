import { describe, expect, it } from "vitest";
import { CHIMES, loadChime, saveChime } from "./chimes.js";

// An in-memory stand-in for localStorage.
function fakeStorage(items = {}) {
  const data = new Map(Object.entries(items));
  return {
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => data.set(key, String(value)),
  };
}

describe("the Chime choice", () => {
  it("offers Singing bowl, Tingsha and Gong", () => {
    expect(CHIMES).toEqual(["bowl", "tingsha", "gong"]);
  });

  it("is Singing bowl when nothing has been chosen", () => {
    expect(loadChime(fakeStorage())).toBe("bowl");
  });

  it("loads back the Chime she chose", () => {
    const storage = fakeStorage();
    saveChime(storage, "gong");
    expect(loadChime(storage)).toBe("gong");
  });

  it.each([["an unknown name", "drum"], ["an empty value", ""]])(
    "falls back to Singing bowl when the saved value is %s",
    (_, saved) => {
      expect(loadChime(fakeStorage({ "yogi-timer.chime": saved }))).toBe("bowl");
    },
  );

  it("falls back to Singing bowl when storage is blocked and can't be read", () => {
    const blocked = { ...fakeStorage(), getItem: () => { throw new DOMException("denied", "SecurityError"); } };
    expect(loadChime(blocked)).toBe("bowl");
  });

  it("keeps working when the choice can't be saved (storage full or blocked)", () => {
    const full = { ...fakeStorage(), setItem: () => { throw new DOMException("full", "QuotaExceededError"); } };
    expect(() => saveChime(full, "tingsha")).not.toThrow();
  });
});
