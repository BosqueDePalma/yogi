import { Controller } from "@hotwired/stimulus";
import { appLanguage } from "../app_language.js";
import { store } from "../app_store.js";
import { createHistoryScreen } from "../history_screen.js";

// The History tab. The rows come from history_screen.js; this controller draws them and
// asks with the phone's own dialog before a Lesson is deleted.
export default class extends Controller {
  static targets = ["list", "empty", "unsaved"];

  connect() {
    this.screen = createHistoryScreen(store);
    this.unsubscribe = store.subscribe(() => this.render());
    this.unsubscribeLanguage = appLanguage.subscribe(() => this.render());
    this.render();
  }

  disconnect() {
    this.unsubscribe();
    this.unsubscribeLanguage();
  }

  delete({ currentTarget }) {
    if (!confirm(appLanguage.text.t("deleteConfirm"))) return;
    // Read from the dataset, not a Stimulus param, which would turn the id into a number.
    this.screen.deleteLesson(currentTarget.closest("details").dataset.id);
  }

  render() {
    const view = this.screen.view(appLanguage.text);
    this.unsavedTarget.hidden = !view.unsaved;
    // Redraw the list only when what it shows changes, so an open Lesson stays open.
    const drawn = JSON.stringify(view.lessons);
    if (drawn === this.drawn) return;
    this.drawn = drawn;
    const open = new Set([...this.listTarget.querySelectorAll("details[open]")].map((d) => d.dataset.id));
    this.emptyTarget.hidden = !view.empty;
    this.listTarget.hidden = view.empty;
    this.listTarget.replaceChildren(...view.lessons.map((lesson) => this.lessonItem(lesson, open.has(lesson.id))));
  }

  lessonItem(lesson, isOpen) {
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
    details.dataset.id = lesson.id;
    details.open = isOpen;
    item.querySelector(".history-date").textContent = lesson.date;
    item.querySelector(".history-time").textContent = lesson.time;
    item.querySelector(".history-runs").textContent = lesson.runCount;
    item.querySelector(".history-total").textContent = lesson.total;
    item.querySelector(".runs").replaceChildren(
      ...lesson.runs.map(({ text, outcome }) => {
        const row = document.createElement("li");
        row.textContent = text;
        row.dataset.outcome = outcome;
        return row;
      }),
    );
    const deleteButton = item.querySelector(".history-delete");
    deleteButton.textContent = appLanguage.text.t("deleteLesson");
    deleteButton.setAttribute("aria-label", lesson.deleteLabel);
    return item;
  }
}
