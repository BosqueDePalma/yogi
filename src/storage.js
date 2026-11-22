// Saves the Teacher's state ({ lessons, activeRun } from domain/teaching.js) as one
// JSON document. `storage` is localStorage in the app and a fake in tests.
// Nothing here throws: storage can be full, blocked or hold damaged data.

const KEY = "yogi-timer.history";
const BACKUP_KEY = "yogi-timer.history.backup";
const VERSION = 1;

// Anything unreadable is copied as-is to the backup key before starting empty,
// so the next save can't destroy the only copy.
export function loadState(storage) {
  const raw = attempt(() => storage.getItem(KEY), null);
  if (raw === null) return emptyState();
  const saved = attempt(() => JSON.parse(raw), null);
  if (saved?.version !== VERSION || !Array.isArray(saved.lessons)) {
    attempt(() => storage.setItem(BACKUP_KEY, raw));
    return emptyState();
  }
  return { lessons: saved.lessons, activeRun: saved.activeRun ?? null };
}

// Returns false when storage refuses the write.
export function saveState(storage, state) {
  const doc = { version: VERSION, lessons: state.lessons, activeRun: state.activeRun };
  return attempt(() => (storage.setItem(KEY, JSON.stringify(doc)), true), false);
}

function emptyState() {
  return { lessons: [], activeRun: null };
}

function attempt(fn, fallback) {
  try {
    return fn();
  } catch {
    return fallback;
  }
}
