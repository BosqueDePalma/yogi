import { Controller } from "@hotwired/stimulus";
import * as teaching from "../domain/teaching.js";
import { describeRun, formatCountdown } from "../format.js";
import { getState, setState, subscribe } from "../store.js";

const TICK_MS = 250;
const CONFIRM_MS = 3_000; // how long a Preset shows "Tap again"
const PULSE_MS = 4_000; // how long 0:00 pulses after a Run completes
const LATE_MS = 1_500; // an end noticed later than this was missed (app suspended)

// The Timer tab: countdown, Stop, Presets and the current Lesson's Runs.
// Dispatches timer:started (inside the tap, so issue 06 can unlock audio) and
// timer:completed with { run, late } (issue 06 plays the Chime unless late).
export default class extends Controller {
  static targets = ["countdown", "preset", "lesson", "runs"];

  connect() {
    this.onVisibility = () => {
      if (document.visibilityState === "visible") {
        this.tick();
        this.syncWakeLock();
      }
    };
    document.addEventListener("visibilitychange", this.onVisibility);
    this.unsubscribe = subscribe(() => {
      this.render();
      this.syncWakeLock();
    });
    this.interval = setInterval(() => this.tick(), TICK_MS);
    this.tick(); // files a Run that ended while the app was closed, with no Chime
    this.render();
    this.syncWakeLock();
  }

  disconnect() {
    clearInterval(this.interval);
    clearTimeout(this.pulseTimer);
    this.disarm();
    document.removeEventListener("visibilitychange", this.onVisibility);
    this.unsubscribe();
    this.wakeLock?.release();
  }

  tapPreset({ params: { preset }, currentTarget }) {
    this.tick(); // the Run may have just reached zero
    const now = Date.now();
    const state = getState();
    if (!state.activeRun) return this.begin(teaching.start(state, preset, now));
    if (this.armed === currentTarget) {
      this.disarm();
      return this.begin(teaching.replace(state, preset, now));
    }
    this.arm(currentTarget);
  }

  stop() {
    this.disarm();
    const state = getState();
    if (state.activeRun) setState(teaching.stop(state, Date.now()));
  }

  tick() {
    const now = Date.now();
    const { state, completed } = teaching.check(getState(), now);
    if (completed) {
      this.disarm();
      const late = now - completed.endedAt > LATE_MS;
      if (!late) this.pulse();
      setState(state);
      this.dispatch("completed", { detail: { run: completed, late } });
    }
    this.render(now);
  }

  begin(next) {
    this.endPulse();
    setState(next);
    this.dispatch("started", { detail: { run: next.activeRun } });
  }

  // --- Replace confirmation ---------------------------------------------------

  arm(button) {
    this.disarm();
    this.armed = button;
    button.dataset.armed = "";
    button.dataset.label = button.getAttribute("aria-label");
    button.setAttribute("aria-label", `Tap again to replace with ${button.dataset.label}`);
    this.armTimer = setTimeout(() => this.disarm(), CONFIRM_MS);
  }

  disarm() {
    clearTimeout(this.armTimer);
    if (!this.armed) return;
    delete this.armed.dataset.armed;
    this.armed.setAttribute("aria-label", this.armed.dataset.label);
    this.armed = null;
  }

  // --- Completion pulse --------------------------------------------------------

  pulse() {
    this.pulsing = true;
    clearTimeout(this.pulseTimer);
    this.pulseTimer = setTimeout(() => this.endPulse(), PULSE_MS);
  }

  endPulse() {
    clearTimeout(this.pulseTimer);
    this.pulsing = false;
    this.render();
  }

  // --- Drawing -------------------------------------------------------------------

  render(now = Date.now()) {
    const state = getState();
    const run = state.activeRun;
    this.element.toggleAttribute("data-running", Boolean(run));
    this.element.toggleAttribute("data-pulsing", Boolean(this.pulsing));
    this.element.toggleAttribute("data-ready", !run && !this.pulsing);
    this.countdownTarget.textContent = run
      ? formatCountdown(teaching.remaining(state, now))
      : this.pulsing ? "0:00" : "Ready";
    this.renderLesson(teaching.currentLesson(state, now));
  }

  renderLesson(lesson) {
    const runs = lesson?.runs ?? [];
    const key = runs.map((run) => `${run.startedAt}-${run.endedAt}`).join();
    if (key === this.lessonKey) return;
    this.lessonKey = key;
    this.lessonTarget.hidden = runs.length === 0;
    this.runsTarget.replaceChildren(
      ...runs.map((run) => {
        const item = document.createElement("li");
        item.textContent = describeRun(run);
        item.dataset.outcome = run.outcome;
        return item;
      }),
    );
  }

  // --- Keep the screen awake during a Run -------------------------------------------
  // iOS drops the wake lock whenever the app is hidden, so it is asked for again on return.

  async syncWakeLock() {
    const running = Boolean(getState().activeRun);
    if (!running) {
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
      if (!getState().activeRun) this.syncWakeLock(); // the Run ended while we waited
    } catch {
      // Not allowed right now (e.g. low power mode); the countdown still works.
    } finally {
      this.wakeLockPending = false;
    }
  }
}
