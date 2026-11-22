# Deeper store

Status: resolved
Type: task
Blocked by: 08
Blocks: 10, 11, 12

A small refactor, plus one thing the Teacher can see. `src/store.js` keeps the one shared copy of her state, and the deletion test says it earns its place. Its gaps are:
- it is hard-wired to `localStorage`, so it can't be tested;
- it ignores a refused save, so if her phone stops saving, she only finds out when History is empty after a relaunch;
- History's redraw relies on an unstated rule about when the list of Lessons changes.

This came out of the architecture review of 2026-11-22 (candidate 2). It was narrowed after ticket 08 landed. See the [spec](../spec.md), section History.

## Decisions

- **Deepen the store; don't make it own the commands.**
  - Start, Stop, Replace and completion have one caller each (`timer_screen.js`), and so does deleting a Lesson (the History tab).
  - Moving them into the store would make it a pass-through, so the commands stay where they are.
  - It's still called "the store", a code concept with no glossary entry. "Teaching session" was rejected because the glossary avoids "session".
- **`createStore(storage)`.**
  - `store.js` exports a factory that takes its storage, as `storage.js` and `chimes.js` already do.
  - The app uses one shared copy made with `localStorage`, so every controller still sees the same state.
  - Tests pass the fake storage from `storage.test.js`, which gives the seam two real adapters.
- **A refused save keeps the app running from memory.**
  - The store keeps the new state and still notifies listeners.
  - `saved()` returns `false` after a refused save and `true` again after the next save that works.
  - Each `setState` saves the whole document, so the next save is the retry.
- **The notice appears only on the History tab.** It goes under the heading, in the same red as Delete:
  > **History isn't being saved on this phone.** New runs will be lost when the app closes.
  - It disappears as soon as a save works. It never appears on the Timer tab, so class isn't disturbed.
  - The History controller draws it on every notification, before its "Lessons unchanged" early return, so it can't get stuck.
- **Load problems stay silent, as now.**
  - Damaged data starts empty, and the bad copy is kept in the backup key.
  - Storage blocked at open starts empty. The first save is then refused too, so the notice appears within one Run.
- **The `lessons` rule is stated where the lists are made.**
  - In `teaching.js`: `lessons` is a new list only when the Lessons changed. Starting a Run and a Mis-tap Stop keep the same list; filing a Run and deleting a Lesson make a new one.
  - History keeps its `===` check.
- **Left out on purpose.**
  - `chime_controller.js` still reads `getState().activeRun`. An `isRunning()` query would put a Run rule in the store; this belongs to candidate 3 (a Chime module).
  - Nothing changes in `timer_screen.js` beyond taking the shared store copy.

## Tests at the module's interface

Write them test-first, one at a time, using the fake storage.

1. A new store starts from what storage holds, or from empty when storage is empty.
2. After `setState`, a fresh store on the same storage loads the new state.
3. `setState` notifies every listener, and an unsubscribed listener isn't notified.
4. A refused save keeps the new state in memory: `getState()` returns it, listeners are notified, and `saved()` is `false`.
5. The next save that works makes `saved()` `true` again.
6. In `teaching.test.js`:
   - starting a Run and a Mis-tap Stop keep the same `lessons` list;
   - filing a Run and deleting a Lesson make a new one.

## Done when

- The tests pass, along with all existing tests, and the build works.
- No controller and no module imports the store's old singleton functions. They all use the one shared copy.
- Checked in the browser pane with `localStorage.setItem` forced to throw:
  - a Run still counts down and completes;
  - the notice shows on History and never on the Timer tab;
  - it goes away once saving works again;
  - an open Lesson stays open when a Run starts.
- Checked in the iOS Simulator with saving refused (added at the user's request).

## Comments

**2026-11-22, done.**
- `src/store.js` exports `createStore(storage)` with `getState`, `setState`, `subscribe` and `saved`. It loads once when created. `src/app_store.js` makes the app's one copy on `localStorage`. The timer, Chime and History controllers all import that copy, and none of them uses the old singleton functions, which are gone.
- `src/store.test.js` has tests 1–5, written one at a time; each failed before its code went in. The fake storage moved to `src/testing/fake_storage.js` so `storage.test.js` and `store.test.js` share it, and it gained `refuseWrites()`.
- Test 6 is two tests in `teaching.test.js`. Starting a Run, a Mis-tap and "not at zero yet" passed with no new code, so they stay as guards. Deleting a Lesson that doesn't exist made a new list; it now hands back the same state. The rule is written at the top of `teaching.js`.
- The notice is a `role="status"` line under the History heading, drawn before the controller's early return. The History tab's delete still uses the store; the Timer tab still sees a delete on its next tick.
- 68 tests pass (up from 61), and the build works (13 precache entries).
- Browser pane, with `Storage.prototype.setItem` forced to throw:
  - a Run counted down and completed (2:00 → 0:00, "2 min · completed" on the Timer tab);
  - the notice showed on History and was hidden on the Timer tab;
  - an open Lesson stayed open when a Run started;
  - once writes worked again, the next save cleared the notice and stored the Run that had completed while saving failed;
  - it reads well in dark mode at phone width.
- iOS Simulator (Home Screen app, served from this build on 127.0.0.1:4173):
  - with normal storage, History loaded with no notice;
  - to make saves fail, a filler item was written into the app's localStorage database while the app was closed. 2.7M characters wasn't enough to be refused; 5.3M was, so WebKit seems to count the 5 MB limit in characters;
  - with storage full, the Run counted down, Stop worked, and the notice showed on History and nowhere else. The stopped Run showed from memory, and the stored History was unchanged;
  - after the filler was removed and the app relaunched, the notice was gone. The refused Stop was lost, so the Run whose start had been saved came back counting down. That is exactly what the notice warns about.
