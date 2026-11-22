import { describe, expect, it } from "vitest";
import { createStore } from "./store.js";
import { saveState } from "./storage.js";
import { fakeStorage } from "./testing/fake_storage.js";

const empty = { lessons: [], activeRun: null };
const run = { preset: 3, startedAt: 1_000, endedAt: 181_000, outcome: "completed" };
const oneLesson = { lessons: [{ id: 1_000, runs: [run] }], activeRun: null };

describe("a new store", () => {
  it("starts from what storage holds, or from empty when storage is empty", () => {
    expect(createStore(fakeStorage()).getState()).toEqual(empty);

    const storage = fakeStorage();
    saveState(storage, oneLesson);
    expect(createStore(storage).getState()).toEqual(oneLesson);
  });
});

describe("setting the state", () => {
  it("saves it, so a fresh store on the same storage starts from it", () => {
    const storage = fakeStorage();
    createStore(storage).setState(oneLesson);
    expect(createStore(storage).getState()).toEqual(oneLesson);
  });
});

describe("listeners", () => {
  it("are told about every change, until they unsubscribe", () => {
    const store = createStore(fakeStorage());
    const heard = [];
    const unsubscribe = store.subscribe(() => heard.push(store.getState()));
    store.subscribe(() => heard.push("second listener"));

    store.setState(oneLesson);
    unsubscribe();
    store.setState(empty);

    expect(heard).toEqual([oneLesson, "second listener", "second listener"]);
  });
});

describe("when the phone refuses to save", () => {
  it("keeps the new state in memory, still tells listeners, and reports it isn't saved", () => {
    const storage = fakeStorage();
    const store = createStore(storage);
    let told = 0;
    store.subscribe(() => told++);
    expect(store.saved()).toBe(true);

    storage.refuseWrites(true);
    store.setState(oneLesson);

    expect(store.getState()).toEqual(oneLesson);
    expect(told).toBe(1);
    expect(store.saved()).toBe(false);
  });

  it("reports it saved again once a save works", () => {
    const storage = fakeStorage();
    const store = createStore(storage);
    storage.refuseWrites(true);
    store.setState(oneLesson);

    storage.refuseWrites(false);
    store.setState(empty);

    expect(store.saved()).toBe(true);
    expect(createStore(storage).getState()).toEqual(empty);
  });
});
