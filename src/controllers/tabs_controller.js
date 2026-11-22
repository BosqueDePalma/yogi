import { Controller } from "@hotwired/stimulus";

// Switches between the Timer and History panels.
export default class extends Controller {
  static targets = ["tab", "panel"];

  select(event) {
    const chosen = event.currentTarget;
    for (const tab of this.tabTargets) {
      const selected = tab === chosen;
      tab.setAttribute("aria-selected", String(selected));
      document.getElementById(tab.getAttribute("aria-controls")).hidden = !selected;
    }
  }
}
