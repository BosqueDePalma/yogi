import { Controller } from "@hotwired/stimulus";

// The Theme selector on the Timer tab: Glow (the default, in base.css) or Bead (themes.css).
// Sets <html data-theme>, keeps the status bar colour in step, and remembers the choice on
// this phone. The head script in index.html applies the saved theme, status bar included,
// before the page draws; keep it in step with KEY and THEMES here. The colours ease across
// in CSS (themes.css).
const KEY = "yogi-timer.theme";
const DEFAULT = "glow";
const THEMES = ["glow", "bead"];

export default class extends Controller {
  static targets = ["option"];

  connect() {
    const current = document.documentElement.dataset.theme ?? DEFAULT;
    for (const option of this.optionTargets) option.checked = option.value === current;
    this.paintStatusBar(current);
  }

  choose({ currentTarget: { value } }) {
    if (!THEMES.includes(value)) return;
    if (value === DEFAULT) delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = value;
    this.paintStatusBar(value);
    try {
      localStorage.setItem(KEY, value);
    } catch {
      // Not saved; the theme still applies until the app closes.
    }
  }

  // Each <meta name="theme-color"> carries every theme's page colour (data-glow, data-bead).
  paintStatusBar(theme) {
    for (const meta of document.querySelectorAll('meta[name="theme-color"]')) meta.content = meta.dataset[theme];
  }
}
