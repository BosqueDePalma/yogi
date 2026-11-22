// The Teacher's Chime: her saved choice, the preview, the Chime at zero, and unlocking audio.
// No DOM and no Web Audio here, so it can be tested.
//
//   storage    localStorage or a stand-in; the choice is kept under its own key, apart from History
//   player     { play(name) → stop, unlock() }: audio/player.js in the app, a fake in tests
//   isRunning  () → whether a Run is going (a class is going, so no preview)
//
// iOS only lets a page make sound once audio has been unlocked inside a tap, so
// unlockForRun() and tap() must be called from the Teacher's tap.
const KEY = "yogi-timer.chime";
const CHIMES = ["bowl", "tingsha", "gong"];
const DEFAULT_CHIME = "bowl";

export function createChime({ storage, player, isRunning }) {
  let stopPreview = null;

  const chime = {
    current: load(storage), // "bowl" | "tingsha" | "gong"

    // Switches at any time. With no Run going it plays once as a preview.
    choose(name) {
      chime.current = name;
      save(storage, name);
      if (isRunning()) return; // a Run going means a class is going: switch quietly
      stopPreview?.();
      stopPreview = player.play(name);
    },

    // A Run reached zero on time.
    ring() {
      player.play(chime.current);
    },

    // A Run started inside this tap.
    unlockForRun() {
      stopPreview?.();
      stopPreview = null;
      player.unlock();
    },

    // Any tap on the Timer tab. If iOS closed the app mid-Run, reopening it continues the
    // Run with audio locked; this tap unlocks it so the Chime can play at zero.
    tap() {
      if (isRunning()) player.unlock();
    },

    stopPreview() {
      stopPreview?.();
      stopPreview = null;
    },
  };
  return chime;
}

// Anything missing, unknown or unreadable falls back to Singing bowl.
function load(storage) {
  try {
    const saved = storage.getItem(KEY);
    return CHIMES.includes(saved) ? saved : DEFAULT_CHIME;
  } catch {
    return DEFAULT_CHIME;
  }
}

function save(storage, name) {
  try {
    storage.setItem(KEY, name);
  } catch {
    // Not saved; the choice still applies until the app is closed.
  }
}
