import { Controller } from "@hotwired/stimulus";
import * as player from "../audio/player.js";
import { store } from "../app_store.js";
import { createChime } from "../chime.js";

// The Chime selector (in Settings), and the Chime at zero. The rules live in chime.js; this
// controller sits on <body> and forwards the selector, the timer's events (timer:started,
// timer:ring) and every tap in the app, the Settings sheet's included.
export default class extends Controller {
  static targets = ["option"];

  connect() {
    this.chime = createChime({ storage: localStorage, player, isRunning: () => Boolean(store.getState().activeRun) });
    for (const option of this.optionTargets) option.checked = option.value === this.chime.current;
    this.onTap = () => this.chime.tap();
    this.element.addEventListener("touchend", this.onTap, { passive: true });
    this.element.addEventListener("click", this.onTap);
  }

  disconnect() {
    this.element.removeEventListener("touchend", this.onTap);
    this.element.removeEventListener("click", this.onTap);
    this.chime.stopPreview();
  }

  choose({ currentTarget }) {
    this.chime.choose(currentTarget.value);
  }

  unlock() {
    this.chime.unlockForRun();
  }

  ring() {
    this.chime.ring();
  }
}
