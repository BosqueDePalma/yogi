import { Controller } from "@hotwired/stimulus";
import { deleteLesson, lessonSummaries } from "../domain/teaching.js";
import { describeLesson, describeRun } from "../format.js";
import { getState, setState, subscribe } from "../store.js";

// The History tab: past Lessons, newest first. Tapping one opens its Runs; a whole Lesson
// can be deleted after the phone's own confirmation dialog.
export default class extends Controller {
  static targets = ["list", "empty"];

  connect() {
    this.unsubscribe = subscribe(() => this.render());
    this.render();
  }

  disconnect() {
    this.unsubscribe();
  }

  delete({ params: { id } }) {
    if (!confirm("Delete this lesson? This can't be undone.")) return;
    setState(deleteLesson(getState(), id));
  }

  render() {
    const { lessons } = getState();
    // Redraw only when the Lessons change, so an open Lesson stays open.
    if (lessons === this.lessons) return;
    this.lessons = lessons;
    const open = new Set([...this.listTarget.querySelectorAll("details[open]")].map((d) => d.dataset.id));
    const runsById = new Map(lessons.map((lesson) => [lesson.id, lesson.runs]));
    const summaries = lessonSummaries({ lessons });

    this.emptyTarget.hidden = summaries.length > 0;
    this.listTarget.hidden = summaries.length === 0;
    this.listTarget.replaceChildren(
      ...summaries.map((summary) => this.lessonItem(summary, runsById.get(summary.id), open.has(String(summary.id)))),
    );
  }

  lessonItem(summary, runs, isOpen) {
    const text = describeLesson(summary);
    const item = document.createElement("li");
    item.innerHTML = `
      <details class="history-lesson">
        <summary>
          <span class="history-when"><span class="history-date"></span> · <span class="history-time"></span></span>
          <span class="history-totals"><span class="history-runs"></span> · <span class="history-total"></span></span>
        </summary>
        <ol class="runs"></ol>
        <button class="history-delete" type="button" data-action="history#delete">Delete lesson</button>
      </details>`;
    const details = item.querySelector("details");
    details.dataset.id = summary.id;
    details.open = isOpen;
    item.querySelector(".history-date").textContent = text.date;
    item.querySelector(".history-time").textContent = text.time;
    item.querySelector(".history-runs").textContent = text.runs;
    item.querySelector(".history-total").textContent = text.total;
    item.querySelector(".runs").replaceChildren(
      ...runs.map((run) => {
        const row = document.createElement("li");
        row.textContent = describeRun(run);
        row.dataset.outcome = run.outcome;
        return row;
      }),
    );
    const button = item.querySelector(".history-delete");
    button.dataset.historyIdParam = summary.id;
    button.setAttribute("aria-label", `Delete lesson of ${text.date}, ${text.time}`);
    return item;
  }
}
