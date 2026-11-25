// The History tab's rows, with no DOM: past Lessons newest first, each with its date,
// start time, Run count, total and Run lines, ready to draw, in the language `view(text)`
// is given (createText() in language.js), dates included.
// A Lesson's id is a string here, both in the view and in deleteLesson().
import { deleteLesson as withoutLesson, lessonSummaries } from "./domain/teaching.js";
import { describeLesson, describeRuns } from "./format.js";
import { ENGLISH } from "./language.js";

export function createHistoryScreen(store) {
  function view(text = ENGLISH) {
    const state = store.getState();
    const runsById = new Map(state.lessons.map((lesson) => [lesson.id, lesson.runs]));
    const lessons = lessonSummaries(state).map((summary) => {
      const lessonText = describeLesson(summary, text);
      return {
        id: String(summary.id),
        date: lessonText.date,
        time: lessonText.time,
        runCount: lessonText.runs,
        total: lessonText.total,
        deleteLabel: text.t("deleteLessonOf", { date: lessonText.date, time: lessonText.time }),
        runs: describeRuns(runsById.get(summary.id), text),
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
