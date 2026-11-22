// One in-memory copy of the Teacher's state, saved on every change. Listeners are told
// after each change and redraw. The app makes a single store (app_store.js), so the Timer
// and History tabs can't overwrite each other's saves.
//
// `storage` is localStorage in the app and a fake in tests. When the phone refuses a
// save, the new state is still kept and listeners are still told, so the app carries
// on from memory; `saved()` is false until a later save works.
import { loadState, saveState } from "./storage.js";

export function createStore(storage) {
  let state = loadState(storage);
  let saved = true;
  const listeners = new Set();
  return {
    getState: () => state,
    saved: () => saved,
    setState(next) {
      state = next;
      saved = saveState(storage, state);
      for (const listener of listeners) listener();
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
