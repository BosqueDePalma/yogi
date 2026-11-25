// The app's one language, English or Spanish, shared by every controller. It starts from the
// Teacher's saved choice or the phone's language (language.js), and her choice is saved on this
// phone under its own key. The head script in index.html sets <html lang> from the same rule
// before the page draws; keep KEY in step with it.
import { LANGUAGES, createText, firstLanguage } from "./language.js";

const KEY = "yogi-timer.language";
const phoneLocale = navigator.language;
const listeners = new Set();

let text = createText(firstLanguage({ saved: read(), phoneLanguage: phoneLocale }), { phoneLocale });

export const appLanguage = {
  // { language, locale, t } for the language in use.
  get text() {
    return text;
  },
  choose(language) {
    if (language === text.language || !LANGUAGES.includes(language)) return;
    text = createText(language, { phoneLocale });
    try {
      localStorage.setItem(KEY, language);
    } catch {
      // Not saved; the language still applies until the app closes.
    }
    for (const listener of listeners) listener(text);
  },
  // Calls `listener(text)` on every change; returns a function that stops it.
  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

function read() {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}
