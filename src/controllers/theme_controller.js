import { Controller } from "@hotwired/stimulus";
import { lookAt, nextChangeAt } from "../theme_clock.js";

// The Theme selector in Settings: Auto (the default), Glow (base.css) or Bead (themes.css).
// Glow and Bead follow the phone's light or dark mode. Auto rotates through the four looks by
// the clock (theme_clock.js) and sets the mode itself, whatever the phone's.
//
// Sets <html data-theme="bead"> (none for Glow) and, with Auto, <html data-mode>; keeps the
// status bar colour in step; and remembers the choice on this phone. The head script in
// index.html does the same before the page draws; keep it in step with KEY, the choices and
// the look. The colours ease across in CSS (themes.css), at 6:30 too. While the Settings
// sheet (a modal <dialog>) is open, iOS keeps the status bar colour it had when the sheet
// opened; it catches up when the sheet closes.
const KEY = "yogi-timer.theme";
const DEFAULT = "auto";
const CHOICES = ["auto", "glow", "bead"];

export default class extends Controller {
  static targets = ["option"];

  connect() {
    this.choice = saved();
    for (const option of this.optionTargets) option.checked = option.value === this.choice;
    this.apply();
    // Timers stall while the app is in the background, so look again on coming back.
    this.onVisible = () => document.visibilityState === "visible" && this.apply();
    document.addEventListener("visibilitychange", this.onVisible);
  }

  disconnect() {
    clearTimeout(this.timer);
    document.removeEventListener("visibilitychange", this.onVisible);
  }

  choose({ currentTarget: { value } }) {
    if (!CHOICES.includes(value)) return;
    this.choice = value;
    this.apply();
    try {
      localStorage.setItem(KEY, value);
    } catch {
      // Not saved; the theme still applies until the app closes.
    }
  }

  // Paints the chosen Theme, and with Auto sets a timer for the next 6:30.
  apply() {
    clearTimeout(this.timer);
    const now = Date.now();
    const { theme, mode } = this.choice === "auto" ? lookAt(now) : { theme: this.choice, mode: null };
    const root = document.documentElement;
    if (theme === "glow") delete root.dataset.theme;
    else root.dataset.theme = theme;
    if (mode) root.dataset.mode = mode;
    else delete root.dataset.mode;
    paintStatusBar(theme, mode);
    if (this.choice === "auto") this.timer = setTimeout(() => this.apply(), nextChangeAt(now) - now);
  }
}

function saved() {
  try {
    const choice = localStorage.getItem(KEY);
    return CHOICES.includes(choice) ? choice : DEFAULT;
  } catch {
    return DEFAULT;
  }
}

// Each <meta name="theme-color"> is for the phone's light or dark mode and carries every
// theme's page colour in that mode (data-glow, data-bead). With a mode set by the clock, both
// take that mode's colour.
function paintStatusBar(theme, mode) {
  const metas = [...document.querySelectorAll('meta[name="theme-color"]')];
  const forMode = mode && metas.find((meta) => meta.media.includes(mode));
  for (const meta of metas) meta.content = (forMode ?? meta).dataset[theme];
}
