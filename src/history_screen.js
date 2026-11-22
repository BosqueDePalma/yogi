// The History tab's rows, with no DOM: past Lessons newest first, each with its date,
// start time, Run count, total and Run lines, ready to draw. Dates follow the phone's
// language and time zone unless `dates` gives { locale, timeZone } (tests do).
// A Lesson's id is a string here, both in the view and in deleteLesson().
import { deleteLesson as withoutLesson, lessonSummaries } from "./domain/teaching.js";
import { describeLesson, describeRuns } from "./format.js";

export function createHistoryScreen(store, dates = {}) {
  function view() {
    const state = store.getState();
    const runsById = new Map(state.lessons.map((lesson) => [lesson.id, lesson.runs]));
    const lessons = lessonSummaries(state).map((summary) => {
      const text = describeLesson(summary, dates);
      return {
        id: String(summary.id),
        date: text.date,
        time: text.time,
        runCount: text.runs,
        total: text.total,
        deleteLabel: `Delete lesson of ${text.date}, ${text.time}`,
        runs: describeRuns(runsById.get(summary.id)),
      };
    });
    return { empty: lessons.length === 0, unsaved: !store.saved(), lessons };
  }

  // `id` is the string the view gave; no confirmation here (the page asks first).
  function deleteLesson(id) {
    const state = store.getState();
    const lesson = state.lessons.find((each) => String(each.id) === id);
    if (lesson) store.setState(withoutLesson(state, lesson.id));
  }

  return { view, deleteLesson };
}
