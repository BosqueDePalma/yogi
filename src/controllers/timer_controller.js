import { Controller } from "@hotwired/stimulus";
import { store } from "../app_store.js";
import { createLotusDial } from "../lotus_dial.js";
import { createTimerScreen } from "../timer_screen.js";

const TICK_MS = 250;

// The Timer tab. The rules live in timer_screen.js; this controller forwards taps and
// the time to it, draws what it returns (the Lotus dial included), and keeps the screen
// awake during a Run.
// Dispatches timer:started (inside the tap, so the Chime can unlock audio) and
// timer:ring (the Run reached zero on time, so the Chime plays).
export default class extends Controller {
  static targets = ["countdown", "lotus", "preset", "lesson", "lessonHeading", "runs"];

  connect() {
    this.screen = createTimerScreen(store);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.lotus = createLotusDial(this.lotusTarget, { reducedMotion });
    for (const button of this.presetTargets) button.dataset.label = button.getAttribute("aria-label");
    this.onVisibility = () => {
      if (document.visibilityState === "visible") this.tick();
    };
    document.addEventListener("visibilitychange", this.onVisibility);
    this.interval = setInterval(() => this.tick(), TICK_MS);
    this.runsObserver = new ResizeObserver(() => this.markOverflow());
    this.runsObserver.observe(this.runsTarget);
    this.tick(); // files a Run that ended while the app was closed, with no Chime
  }

  disconnect() {
    clearInterval(this.interval);
    this.runsObserver.disconnect();
    document.removeEventListener("visibilitychange", this.onVisibility);
    this.wakeLock?.release();
    this.lotus.destroy();
  }

  tapPreset({ params: { preset } }) {
    const now = Date.now();
    this.apply(this.screen.tapPreset(preset, now), now);
  }

  stop() {
    const now = Date.now();
    this.apply(this.screen.stop(now), now);
  }

  tick() {
    const now = Date.now();
    this.apply(this.screen.tick(now), now);
  }

  apply(effects, now) {
    if (effects.unlockAudio) this.dispatch("started");
    if (effects.ring) this.dispatch("ring");
    const view = this.screen.view(now);
    this.render(view);
    this.running = view.running;
    this.syncWakeLock();
  }

  // --- Drawing -------------------------------------------------------------------

  render(view) {
    this.element.toggleAttribute("data-running", view.mode === "running");
    this.element.toggleAttribute("data-pulsing", view.mode === "pulsing");
    this.element.toggleAttribute("data-settling", view.mode === "settling");
    this.element.toggleAttribute("data-ready", view.mode === "ready");
    this.countdownTarget.textContent = view.countdown;
    this.lotus.update(view.dial, view.mode);
    for (const button of this.presetTargets) {
      const armed = Number(button.dataset.timerPresetParam) === view.armedPreset;
      button.toggleAttribute("data-armed", armed);
      button.setAttribute("aria-label", armed ? `Tap again to replace with ${button.dataset.label}` : button.dataset.label);
    }
    this.renderLesson(view.lessonHeading, view.lessonRuns);
  }

  renderLesson(heading, lines) {
    const key = JSON.stringify([heading, lines]);
    if (key === this.lessonKey) return;
    this.lessonKey = key;
    this.lessonTarget.hidden = lines.length === 0;
    this.lessonHeadingTarget.textContent = heading ?? "";
    this.runsTarget.replaceChildren(
      ...lines.map(({ text, outcome }) => {
        const item = document.createElement("li");
        item.textContent = text;
        item.dataset.outcome = outcome;
        return item;
      }),
    );
    this.markOverflow();
  }

  // When the Runs don't all fit, the oldest fade out at the bottom (base.css). Checked when
  // the list changes, and when its room does (the tab shown again, a new screen size).
  markOverflow() {
    const runs = this.runsTarget;
    runs.toggleAttribute("data-overflows", runs.scrollHeight > runs.clientHeight);
  }

  // --- Keep the screen awake during a Run -------------------------------------------
  // iOS drops the wake lock whenever the app is hidden, so it is asked for again on return.

  async syncWakeLock() {
    if (!this.running) {
      this.wakeLock?.release();
      this.wakeLock = null;
      return;
    }
    if (this.wakeLock || this.wakeLockPending || !("wakeLock" in navigator)) return;
    if (document.visibilityState !== "visible") return;
    this.wakeLockPending = true;
    try {
      const lock = await navigator.wakeLock.request("screen");
      lock.addEventListener("release", () => {
        if (this.wakeLock === lock) this.wakeLock = null;
      });
      this.wakeLock = lock;
      if (!this.running) this.syncWakeLock(); // the Run ended while we waited
    } catch {
      // Not allowed right now (e.g. low power mode); the countdown still works.
    } finally {
      this.wakeLockPending = false;
    }
  }
}
