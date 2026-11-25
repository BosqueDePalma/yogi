import { Controller } from "@hotwired/stimulus";
import { createInstallGuide } from "../install_guide.js";

const COPIED_MS = 2000;

// The install guide, in a browser on an iPhone or iPad: the banner at the top of both tabs, the
// Install pill left once it's hidden, and what the guide's sheet shows. The rules live in
// install_guide.js. This controller sits on <body>. It marks <html data-install="banner|pill">
// for base.css, and marks the sheet with the steps to show and its language; the sheet itself
// opens and closes with the `guide` controller (src/sheet/).
export default class extends Controller {
  static targets = ["sheet", "pill"];

  connect() {
    this.installGuide = createInstallGuide({
      browser: {
        standalone: navigator.standalone === true || matchMedia("(display-mode: standalone)").matches,
        userAgent: navigator.userAgent,
        maxTouchPoints: navigator.maxTouchPoints,
        language: navigator.language,
      },
    });
    const { sheet } = this.installGuide;
    if (sheet) {
      this.sheetTarget.lang = sheet.language;
      this.sheetTarget.dataset.steps = sheet.steps;
      this.sheetTarget.toggleAttribute("data-screenshots", sheet.screenshots);
    }
    this.render();
  }

  // The × on the banner. Pressed from the keyboard or VoiceOver (a click with no pointer
  // behind it), focus moves to the pill that takes its place: the one on the tab in view.
  hide(event) {
    this.installGuide.hide();
    this.render();
    if (event.detail === 0) this.pillTargets.find((pill) => pill.checkVisibility())?.focus();
  }

  // "Copy link", in a browser other than Safari, to paste the address into Safari.
  async copyLink({ currentTarget }) {
    const copied = await copy(location.href);
    if (!copied) return;
    currentTarget.toggleAttribute("data-copied", true);
    clearTimeout(this.copiedTimer);
    this.copiedTimer = setTimeout(() => currentTarget.removeAttribute("data-copied"), COPIED_MS);
  }

  render() {
    const offer = this.installGuide.offer();
    if (offer) document.documentElement.dataset.install = offer;
    else delete document.documentElement.dataset.install;
  }
}

// The browsers inside other apps don't always allow the Clipboard API; the old way still works.
async function copy(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const field = Object.assign(document.createElement("textarea"), { value: text, readOnly: true });
    field.style.cssText = "position: fixed; opacity: 0;";
    document.body.append(field);
    field.select();
    const copied = document.execCommand("copy");
    field.remove();
    return copied;
  }
}
