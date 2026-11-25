import { Controller } from "@hotwired/stimulus";
import { appLanguage } from "../app_language.js";
import { store } from "../app_store.js";
import { createLotusDial } from "../lotus_dial.js";
import { createTimerScreen } from "../timer_screen.js";

const TICK_MS = 250;
const REPEAT_AFTER_MS = 500; // − or + held this long starts repeating
const REPEAT_EVERY_MS = 200; // then steps this often

// The Timer tab. The rules live in timer_screen.js; this controller forwards taps (on the
// Presets, the Lotus dial, Stop or Cancel, and − / +, which repeat while held) and the time to
// it, draws what it returns (the Lotus dial included), and keeps the screen awake during a
// Run, paused or not.
// Dispatches timer:started (inside the tap, so the Chime can unlock audio) and
// timer:ring (the Run reached zero on time, so the Chime plays).
export default class extends Controller {
  static targets = ["countdown", "lotus", "dialToggle", "preset", "lesson", "lessonHeading", "runs", "adjustStep"];

  connect() {
    this.screen = createTimerScreen(store);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.reducedMotion = reducedMotion;
    this.stopButton = this.element.querySelector(".stop");
    this.lotus = createLotusDial(this.lotusTarget, { reducedMotion });
    this.unsubscribeLanguage = appLanguage.subscribe(() => this.tick()); // redraws in the new language
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
    this.releaseAdjust();
    this.runsObserver.disconnect();
    this.unsubscribeLanguage();
    document.removeEventListener("visibilitychange", this.onVisibility);
    this.wakeLock?.release();
    this.lotus.destroy();
  }

  tapPreset({ params: { preset } }) {
    const now = Date.now();
    this.apply(this.screen.tapPreset(preset, now), now);
  }

  tapDial() {
    const now = Date.now();
    this.apply(this.screen.tapDial(now), now);
  }

  stop() {
    const now = Date.now();
    this.apply(this.screen.stop(now), now);
  }

  // − and +: a finger steps once on touch, then repeats while it stays down. The click that
  // follows the lift is ignored; a click with no pointer behind it (keyboard, VoiceOver) steps.
  // The repeat is set up before the first step, so a first step that reaches a limit stops it.
  pressAdjust({ params: { direction } }) {
    this.releaseAdjust();
    this.heldDirection = direction;
    this.steppedByPointer = true;
    this.repeatDelay = setTimeout(() => {
      this.repeat = setInterval(() => this.adjust(direction), REPEAT_EVERY_MS);
    }, REPEAT_AFTER_MS);
    this.adjust(direction);
  }

  releaseAdjust() {
    this.heldDirection = null;
    clearTimeout(this.repeatDelay);
    clearInterval(this.repeat);
  }

  clickAdjust({ params: { direction } }) {
    if (this.steppedByPointer) this.steppedByPointer = false;
    else this.adjust(direction);
  }

  adjust(direction) {
    const now = Date.now();
    this.apply(this.screen.adjust(direction, now), now);
  }

  tick() {
    const now = Date.now();
    this.apply(this.screen.tick(now), now);
  }

  apply(effects, now) {
    if (effects.unlockAudio) this.dispatch("started");
    if (effects.ring) this.dispatch("ring");
    const view = this.screen.view(now, appLanguage.text);
    this.render(view);
    this.running = view.running;
    this.syncWakeLock();
  }

  // --- Drawing -------------------------------------------------------------------

  render(view) {
    const { t } = appLanguage.text;
    const resuming = this.element.hasAttribute("data-paused") && view.mode === "running";
    const breath = resuming ? Number(getComputedStyle(this.countdownTarget).opacity) : 1;
    this.element.toggleAttribute("data-running", view.running); // counting or paused
    this.element.toggleAttribute("data-paused", view.mode === "paused");
    if (resuming) this.easeCountdownBack(breath);
    if (view.mode === "paused") this.countdownEase?.cancel(); // so the breathing shows at once
    // Hidden or fading out, Stop (Cancel with a Selected Preset), − and + can't be tapped or
    // reached by VoiceOver.
    const selected = view.mode === "selected";
    this.element.toggleAttribute("data-selected", selected);
    this.stopButton.inert = view.mode !== "paused" && !selected;
    this.stopButton.textContent = t(selected ? "cancel" : "stop");
    this.renderAdjust(view.adjust);
    this.element.toggleAttribute("data-pulsing", view.mode === "pulsing");
    this.element.toggleAttribute("data-settling", view.mode === "settling");
    this.element.toggleAttribute("data-ready", view.mode === "ready");
    this.countdownTarget.textContent = view.countdown;
    this.renderDialToggle(view.dialLabel);
    this.lotus.update(view.dial, view.mode);
    for (const button of this.presetTargets) {
      const preset = Number(button.dataset.timerPresetParam);
      const armed = preset === view.armedPreset;
      const isSelected = preset === view.selectedPreset;
      button.toggleAttribute("data-armed", armed);
      button.toggleAttribute("data-selected", isSelected);
      const minutes = t("presetMinutes", { n: preset });
      const label = armed ? t("replaceWith", { preset: minutes }) : isSelected ? t("presetSelected", { preset: minutes }) : minutes;
      button.setAttribute("aria-label", label);
    }
    this.renderLesson(view.lessonHeading, view.lessonRuns);
  }

  // The paused countdown breathes (a CSS animation, base.css), which can't transition out:
  // on Resume it would jump to full strength. This eases it there from where it was, as
  // "Paused" and Stop fade out. With Reduce Motion on it changes at once.
  easeCountdownBack(from) {
    if (this.reducedMotion || !(from < 1)) return;
    this.countdownEase = this.countdownTarget.animate([{ opacity: from }, { opacity: 1 }], { duration: 300, easing: "ease-out" });
  }

  // − and +, shown only with a Selected Preset: dimmed at a limit, named with the Preset's step.
  // The held button stops repeating once it hides or dims (a disabled button may not see the lift).
  renderAdjust(adjust) {
    const [remove, add] = this.adjustStepTargets;
    const { t } = appLanguage.text;
    for (const [button, can, key] of [[remove, adjust?.canRemove, "removeSeconds"], [add, adjust?.canAdd, "addSeconds"]]) {
      button.inert = !adjust;
      button.disabled = !can;
      if (adjust) button.setAttribute("aria-label", t(key, { n: adjust.step }));
    }
    const canGoOn = this.heldDirection > 0 ? adjust?.canAdd : adjust?.canRemove;
    if (this.heldDirection && !canGoOn) this.releaseAdjust();
  }

  // A button over the whole Lotus dial, there while a Run is going or a Preset is selected.
  renderDialToggle(label) {
    const toggle = this.dialToggleTarget;
    toggle.hidden = !label;
    if (label && toggle.getAttribute("aria-label") !== label) toggle.setAttribute("aria-label", label);
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
