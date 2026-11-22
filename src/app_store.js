// The app's one store, on the phone's localStorage. Every controller uses this copy.
import { createStore } from "./store.js";

export const store = createStore(localStorage);
