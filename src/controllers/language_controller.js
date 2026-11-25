import { Controller } from "@hotwired/stimulus";
import { appLanguage } from "../app_language.js";
import { describeVersion } from "../format.js";

// The language, on <body>: the EN · ES switch in the top-left corner of both tabs, the Language
// row in Settings, and the page's fixed text. Elements name their text by key from
// language.js: `data-text` for their text, `data-text-label` for their VoiceOver label.
// Text that changes as the app runs is drawn by its own controller, which listens to
// app_language.js. The install guide's sheet keeps the phone's language (install_controller.js).
export default class extends Controller {
  static targets = ["option", "switch", "version"];

  connect() {
    this.unsubscribe = appLanguage.subscribe(() => this.render());
    this.render();
    delete document.documentElement.dataset.languagePending; // the head script hid the page until now
  }

  disconnect() {
    this.unsubscribe();
  }

  // The corner switch: to the other language.
  toggle() {
    appLanguage.choose(appLanguage.text.language === "es" ? "en" : "es");
  }

  // The Language row in Settings.
  choose({ currentTarget: { value } }) {
    appLanguage.choose(value);
  }

  render() {
    const { language, t } = appLanguage.text;
    document.documentElement.lang = language;
    for (const element of this.element.querySelectorAll("[data-text]")) element.textContent = t(element.dataset.text);
    for (const element of document.querySelectorAll("[data-text-label]")) element.setAttribute("aria-label", t(element.dataset.textLabel));
    for (const option of this.optionTargets) option.checked = option.value === language;
    for (const button of this.switchTargets) {
      button.dataset.language = language;
      button.setAttribute("aria-label", t("languageSwitch"));
    }
    if (this.hasVersionTarget) {
      const { built, commit } = this.versionTarget.dataset;
      const version = describeVersion(built, commit, appLanguage.text);
      if (version) this.versionTarget.textContent = version;
    }
  }
}
