import { Controller } from "@hotwired/stimulus";
import { play, unlock } from "../audio/player.js";
import { loadChime, saveChime } from "../chimes.js";
import { getState } from "../store.js";

// The Chime selector, and the Chime at zero. Sits on the Timer tab next to the timer
// controller and listens for its events: timer:started unlocks audio inside the Preset tap,
// timer:completed plays the chosen Chime unless the end was noticed late.
export default class extends Controller {
  static targets = ["option"];

  connect() {
    this.chime = loadChime(localStorage);
    for (const option of this.optionTargets) option.checked = option.value === this.chime;
    // If iOS closed the app mid-Run, reopening it continues the Run with audio still locked.
    // Any tap on the Timer tab then unlocks it, so the Chime can play at zero.
    this.onTap = () => {
      if (getState().activeRun) unlock();
    };
    this.element.addEventListener("touchend", this.onTap, { passive: true });
    this.element.addEventListener("click", this.onTap);
  }

  disconnect() {
    this.element.removeEventListener("touchend", this.onTap);
    this.element.removeEventListener("click", this.onTap);
    this.stopPreview?.();
  }

  choose({ currentTarget }) {
    this.chime = currentTarget.value;
    saveChime(localStorage, this.chime);
    // A Run going means a class is going: switch quietly, no preview.
    if (getState().activeRun) return;
    this.stopPreview?.();
    this.stopPreview = play(this.chime);
  }

  unlock() {
    this.stopPreview?.();
    this.stopPreview = null;
    unlock();
  }

  ring({ detail: { late } }) {
    if (!late) play(this.chime);
  }
}
