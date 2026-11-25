import { Controller } from "@hotwired/stimulus";
import { startSwipe } from "./swipe.js";

const MAX_CLOSE_MS = 600; // the slide down is 0.3 s; past this it closes regardless

// A bottom sheet, as on iOS: a native <dialog> that slides up from the bottom edge. The
// dialog gives the top layer, the backdrop, focus kept inside, Escape and the dialog role;
// this adds swipe down to close, a tap on the backdrop to close, and the slide up and down.
//
// To use it in another app (it needs only Stimulus, this folder, and sheet.css):
//
//   import "./sheet/sheet.css";
//   application.register("sheet", SheetController);
//
//   <body data-controller="sheet">        any element holding the buttons and the dialog
//     <button data-action="sheet#open">Settings</button>
//     <dialog class="sheet" data-sheet-target="dialog" aria-labelledby="sheet-title">
//       <div class="sheet-grabber" aria-hidden="true"></div>
//       <header class="sheet-header">
//         <h2 id="sheet-title" class="sheet-title">Settings</h2>
//         <button class="sheet-done" type="button" data-action="sheet#close">Done</button>
//       </header>
//       …
//     </dialog>
//   </body>
//
// Each controller drives one dialog. For a second sheet, register the same controller again
// under another name (`application.register("guide", SheetController)`) and use that name in
// its target and actions (`data-guide-target="dialog"`, `guide#open`).
//
// It opens at the top, with its header staying in view as the content scrolls. Opened from the
// keyboard or VoiceOver, focus goes to its first button (Done); after a finger's tap the sheet
// itself takes focus, so no focus ring is drawn. It closes by swiping it down, tapping the
// backdrop, `sheet#close` or Escape, and gives focus back to the button that opened it when that
// was pressed from the keyboard or VoiceOver.
// Dispatches sheet:opened and sheet:closed. Colours, radius and spacing are CSS custom
// properties, listed in sheet.css.
export default class extends Controller {
  static targets = ["dialog"];

  connect() {
    const dialog = this.dialogTarget;
    dialog.tabIndex = -1; // so it can take focus itself (see open)
    this.listeners = {
      cancel: (event) => {
        event.preventDefault(); // Escape: slide down rather than vanish
        this.close();
      },
      close: () => this.afterClose(),
      click: (event) => {
        if (event.target === dialog && !this.isInside(event)) this.close(); // the backdrop
      },
      pointerdown: (event) => this.pointerDown(event),
      pointermove: (event) => this.pointerMove(event),
      pointerup: (event) => this.pointerUp(event),
      pointercancel: (event) => this.pointerUp(event),
    };
    for (const [type, listener] of Object.entries(this.listeners)) dialog.addEventListener(type, listener);
  }

  disconnect() {
    const dialog = this.dialogTarget;
    for (const [type, listener] of Object.entries(this.listeners)) dialog.removeEventListener(type, listener);
    if (dialog.open) {
      dialog.close();
      this.afterClose(); // the close event would arrive after its listener has gone
    }
  }

  open(event) {
    const dialog = this.dialogTarget;
    if (dialog.open) return;
    // Where focus goes back to on close. A press from the keyboard or VoiceOver (a click with
    // no pointer behind it, detail 0) returns to the button that opened it. A finger's tap
    // returns to whatever had focus before, usually nothing, so no focus ring is drawn.
    const fromKeyboard = event?.detail === 0;
    this.opener = fromKeyboard && event.currentTarget ? event.currentTarget : document.activeElement;
    dialog.showModal(); // slides up: @starting-style in sheet.css
    // showModal() focuses the first button, Done, which a press from the keyboard or VoiceOver
    // wants. After a finger's tap the sheet itself takes focus instead, so no ring is drawn.
    if (!fromKeyboard) dialog.focus({ preventScroll: true });
    dialog.scrollTop = 0; // opens at the top, wherever it was left
    // Too tall for the screen, its content scrolls, so a swipe only drags it from the top bar.
    dialog.toggleAttribute("data-scrolls", dialog.scrollHeight > dialog.clientHeight);
    this.dispatch("opened");
  }

  // Slides down, then closes the dialog once it's out of sight.
  close() {
    const dialog = this.dialogTarget;
    if (!dialog.open || dialog.hasAttribute("data-closing")) return;
    dialog.removeAttribute("data-dragging");
    dialog.setAttribute("data-closing", "");
    getComputedStyle(dialog).translate; // starts the slide now, so getAnimations() sees it
    const slides = dialog.getAnimations({ subtree: true }).map((animation) => animation.finished);
    // Animations stall while the page isn't drawn, so it closes after a while regardless.
    const atMost = new Promise((resolve) => setTimeout(resolve, MAX_CLOSE_MS));
    Promise.race([Promise.allSettled(slides), atMost]).then(() => {
      if (dialog.hasAttribute("data-closing")) dialog.close();
    });
  }

  afterClose() {
    const dialog = this.dialogTarget;
    dialog.removeAttribute("data-closing");
    dialog.style.removeProperty("--sheet-offset");
    this.swipe = null;
    if (this.opener !== document.body && this.opener?.isConnected) this.opener.focus({ preventScroll: true });
    this.opener = null;
    this.dispatch("closed");
  }

  // --- Swipe down to close ----------------------------------------------------------

  pointerDown(event) {
    const dialog = this.dialogTarget;
    if (!event.isPrimary || event.button !== 0 || dialog.hasAttribute("data-closing")) return;
    if (!this.isInside(event)) return; // the backdrop: a tap there closes it on click
    if (dialog.hasAttribute("data-scrolls") && !event.target.closest(".sheet-grabber, .sheet-header")) return;
    this.swipe = startSwipe({ y: event.clientY, time: event.timeStamp, height: dialog.offsetHeight });
    this.pointerId = event.pointerId;
  }

  pointerMove(event) {
    if (!this.swipe || event.pointerId !== this.pointerId) return;
    const offset = this.swipe.move(event.clientY, event.timeStamp);
    if (!this.swipe.dragging) return;
    const dialog = this.dialogTarget;
    if (!dialog.hasAttribute("data-dragging")) {
      dialog.setAttribute("data-dragging", "");
      dialog.setPointerCapture(event.pointerId);
    }
    dialog.style.setProperty("--sheet-offset", `${offset}px`);
  }

  pointerUp(event) {
    if (!this.swipe || event.pointerId !== this.pointerId) return;
    const swipe = this.swipe;
    this.swipe = null;
    if (!swipe.dragging) return; // a tap: the click goes through
    this.ignoreNextClick(); // so the drag doesn't also choose the option it ends on
    const dialog = this.dialogTarget;
    if (event.type === "pointerup" && swipe.release(event.timeStamp)) {
      this.close(); // slides down from where the finger left it
    } else {
      dialog.removeAttribute("data-dragging");
      dialog.style.removeProperty("--sheet-offset"); // springs back
    }
  }

  // The click, if any, comes after pointerup, sometimes a while after on iOS; the guard stays
  // until it comes or the next touch begins.
  ignoreNextClick() {
    const swallow = (event) => {
      event.stopPropagation();
      event.preventDefault();
      stop();
    };
    const stop = () => {
      window.removeEventListener("click", swallow, { capture: true });
      window.removeEventListener("pointerdown", stop, { capture: true });
    };
    window.addEventListener("click", swallow, { capture: true });
    window.addEventListener("pointerdown", stop, { capture: true });
  }

  isInside({ clientX: x, clientY: y }) {
    const box = this.dialogTarget.getBoundingClientRect();
    return x >= box.left && x <= box.right && y >= box.top && y <= box.bottom;
  }
}
