import { describe, expect, it } from "vitest";
import { createHistoryScreen } from "./history_screen.js";
import { createStore } from "./store.js";
import { saveState } from "./storage.js";
import { fakeStorage } from "./testing/fake_storage.js";
import { createText } from "./language.js";

// Times in ms; hours past midnight on 21 Nov 2026 (UTC).
const t = (h, m = 0, s = 0) => Date.UTC(2026, 10, 21, h, m, s);
const uk = createText("en", { phoneLocale: "en-GB", timeZone: "UTC" });

function storeWith(lessons) {
  const storage = fakeStorage();
  saveState(storage, { lessons, activeRun: null });
  return { store: createStore(storage), storage };
}

describe("the History tab", () => {
  it("is empty with no Lessons", () => {
    const { store } = storeWith([]);
    expect(createHistoryScreen(store).view(uk)).toEqual({ empty: true, unsaved: false, lessons: [] });
  });

  it("lists Lessons newest first, with date, time, Run count and total", () => {
    const { store } = storeWith([
      { id: t(9), runs: [{ preset: 3, startedAt: t(9), endedAt: t(9, 3), outcome: "completed" }] },
      {
        id: t(18),
        runs: [
          { preset: 5, startedAt: t(18), endedAt: t(18, 5), outcome: "completed" },
          { preset: 10, startedAt: t(18, 10), endedAt: t(18, 12, 41), outcome: "stopped" },
        ],
      },
    ]);

    const { empty, lessons } = createHistoryScreen(store).view(uk);

    expect(empty).toBe(false);
    expect(lessons.map(({ id, date, time, runCount, total, deleteLabel }) => ({ id, date, time, runCount, total, deleteLabel }))).toEqual([
      { id: String(t(18)), date: "Sat 21 Nov", time: "18:00", runCount: "2 runs", total: "8 min", deleteLabel: "Delete lesson of Sat 21 Nov, 18:00" },
      { id: String(t(9)), date: "Sat 21 Nov", time: "9:00", runCount: "1 run", total: "3 min", deleteLabel: "Delete lesson of Sat 21 Nov, 9:00" },
    ]);
  });

  it("gives each Lesson its Run lines", () => {
    const { store } = storeWith([
      {
        id: t(18),
        runs: [
          { preset: 5, startedAt: t(18), endedAt: t(18, 5), outcome: "completed" },
          { preset: 10, startedAt: t(18, 10), endedAt: t(18, 12, 41), outcome: "stopped" },
        ],
      },
    ]);

    expect(createHistoryScreen(store).view(uk).lessons[0].runs).toEqual([
      { text: "5 min · completed", outcome: "completed" },
      { text: "10 min · stopped 2:41", outcome: "stopped" },
    ]);
  });

  it("deletes a Lesson by the id the view gives it", () => {
    const { store } = storeWith([
      { id: t(9), runs: [{ preset: 3, startedAt: t(9), endedAt: t(9, 3), outcome: "completed" }] },
      { id: t(18), runs: [{ preset: 5, startedAt: t(18), endedAt: t(18, 5), outcome: "completed" }] },
    ]);
    const screen = createHistoryScreen(store);
    const morning = screen.view(uk).lessons[1];

    screen.deleteLesson(morning.id);

    expect(screen.view(uk).lessons.map((lesson) => lesson.time)).toEqual(["18:00"]);
    expect(store.getState().lessons).toHaveLength(1);
  });

  it("warns when the phone refused to save", () => {
    const { store, storage } = storeWith([
      { id: t(9), runs: [{ preset: 3, startedAt: t(9), endedAt: t(9, 3), outcome: "completed" }] },
    ]);
    const screen = createHistoryScreen(store);
    storage.refuseWrites(true);

    screen.deleteLesson(String(t(9)));

    expect(screen.view(uk)).toMatchObject({ unsaved: true, empty: true });
  });
});

describe("the History tab in Spanish", () => {
  it("counts, dates and names each Lesson in Spanish", () => {
    const { store } = storeWith([
      { id: t(18), runs: [{ preset: 5, startedAt: t(18), endedAt: t(18, 5), outcome: "completed" }] },
    ]);
    const es = createText("es", { phoneLocale: "es-ES", timeZone: "UTC" });

    const [lesson] = createHistoryScreen(store).view(es).lessons;

    expect(lesson).toMatchObject({ date: "sáb, 21 nov", time: "18:00", runCount: "1 ronda", total: "5 min", deleteLabel: "Borrar la clase del sáb, 21 nov, 18:00" });
    expect(lesson.runs).toEqual([{ text: "5 min · completada", outcome: "completed" }]);
  });
});
