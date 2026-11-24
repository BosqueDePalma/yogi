import { Controller } from "@hotwired/stimulus";

// The Theme selector on the Timer tab: Glow (the default, in base.css) or Bead (themes.css).
// Sets <html data-theme>, keeps the status bar colour in step, and remembers the choice on
// this phone. The head script in index.html applies the saved theme before the page draws.
const KEY = "yogi-timer.theme";
const DEFAULT = "glow";
// The page background of each theme, light and dark, for <meta name="theme-color">. Keep in
// step with --bg in base.css and themes.css (and the defaults in index.html).
const BACKGROUNDS = {
  glow: { light: "#f4f7fe", dark: "#15171e" },
  bead: { light: "#eef2fd", dark: "#111634" },
};

export default class extends Controller {
  static targets = ["option"];

  connect() {
    const current = document.documentElement.dataset.theme ?? DEFAULT;
    for (const option of this.optionTargets) option.checked = option.value === current;
    this.paintStatusBar(current);
  }

  choose({ currentTarget: { value } }) {
    if (!(value in BACKGROUNDS)) return;
    if (value === DEFAULT) delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = value;
    this.paintStatusBar(value);
    try {
      localStorage.setItem(KEY, value);
    } catch {
      // Not saved; the theme still applies until the app closes.
    }
  }

  paintStatusBar(theme) {
    for (const meta of document.querySelectorAll('meta[name="theme-color"]')) {
      const dark = meta.media.includes("dark");
      meta.content = BACKGROUNDS[theme][dark ? "dark" : "light"];
    }
  }
}
