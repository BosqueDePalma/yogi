import { describe, expect, it } from "vitest";
import { loadState, saveState } from "./storage.js";
import { fakeStorage } from "./testing/fake_storage.js";

const empty = { lessons: [], activeRun: null };

describe("loading History", () => {
  it("is empty when nothing has been saved", () => {
    expect(loadState(fakeStorage())).toEqual(empty);
  });

  it("is empty when storage is blocked and can't be read", () => {
    const blocked = { ...fakeStorage(), getItem: () => { throw new DOMException("denied", "SecurityError"); } };
    expect(loadState(blocked)).toEqual(empty);
  });
});

describe("saving History", () => {
  it("loads back exactly what was saved, including the Run that is going", () => {
    const storage = fakeStorage();
    const state = {
      lessons: [{ id: 1, runs: [{ preset: 3, startedAt: 1, endedAt: 180_001, outcome: "completed" }] }],
      activeRun: { preset: 5, startedAt: 200_000, plannedEndAt: 500_000 },
    };
    expect(saveState(storage, state)).toBe(true);
    expect(loadState(storage)).toEqual(state);
  });

  it("reports failure instead of crashing when storage refuses the write", () => {
    const full = { ...fakeStorage(), setItem: () => { throw new DOMException("full", "QuotaExceededError"); } };
    expect(saveState(full, empty)).toBe(false);
  });
});

describe("unreadable History", () => {
  it("damaged JSON starts empty and is kept in the backup key", () => {
    const storage = fakeStorage({ "yogi-timer.history": '{"version":1,"lessons":[{' });
    expect(loadState(storage)).toEqual(empty);
    expect(storage.items()["yogi-timer.history.backup"]).toBe('{"version":1,"lessons":[{');
  });

  it.each([
    ["a newer format version", { version: 2, lessons: [], activeRun: null }],
    ["no version", { lessons: [], activeRun: null }],
    ["lessons that are not a list", { version: 1, lessons: "oops", activeRun: null }],
    ["something that is not History at all", 42],
  ])("%s starts empty and is kept in the backup key", (_, saved) => {
    const raw = JSON.stringify(saved);
    const storage = fakeStorage({ "yogi-timer.history": raw });
    expect(loadState(storage)).toEqual(empty);
    expect(storage.items()["yogi-timer.history.backup"]).toBe(raw);
  });

  it("still starts empty if the backup can't be written", () => {
    const storage = { ...fakeStorage({ "yogi-timer.history": "{" }), setItem: () => { throw new DOMException("full", "QuotaExceededError"); } };
    expect(loadState(storage)).toEqual(empty);
  });
});
