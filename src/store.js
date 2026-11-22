// The one in-memory copy of the Teacher's state, shared by every controller.
// Each change is saved straight away, then listeners redraw. Keeping a single copy
// means the Timer and History tabs can't overwrite each other's saves.
import { loadState, saveState } from "./storage.js";

let state = null;
const listeners = new Set();

export function getState() {
  state ??= loadState(localStorage);
  return state;
}

export function setState(next) {
  state = next;
  saveState(localStorage, state);
  for (const listener of listeners) listener(state);
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
