// The Teacher's Chime choice, kept on the phone under its own key, apart from History.
// Anything missing, unknown or unreadable falls back to Singing bowl.

const KEY = "yogi-timer.chime";

export const CHIMES = ["bowl", "tingsha", "gong"];
export const DEFAULT_CHIME = "bowl";

export function loadChime(storage) {
  try {
    const saved = storage.getItem(KEY);
    return CHIMES.includes(saved) ? saved : DEFAULT_CHIME;
  } catch {
    return DEFAULT_CHIME;
  }
}

export function saveChime(storage, chime) {
  try {
    storage.setItem(KEY, chime);
  } catch {
    // Not saved; the choice still applies until the app is closed.
  }
}
