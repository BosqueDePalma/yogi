# History storage in localStorage

Status: resolved
Type: task
Blocked by: 03

A small module that loads and saves History (Lessons and their Runs) as one JSON document in localStorage.

## Scope

- Load: return an empty History if nothing is saved or the saved data is corrupt (never crash).
- Save after every change: a Run completed, a Run stopped, a Run replaced, a Lesson deleted.
- Delete a Lesson by id.
- Put a version number in the JSON so later changes to the format can be migrated.
- Save the Run that is going (`activeRun`) in the same document: the whole `{ lessons, activeRun }` state from issue 03. Save when a Run starts as well.

## Interface (agreed 2026-11-21)

- `src/storage.js`: `loadState(storage)` → `{ lessons, activeRun }` and `saveState(storage, state)` → `true | false`. It stores `{ version: 1, lessons, activeRun }` under the key `yogi-timer.history`. `storage` is `localStorage` in the app and a fake in-memory object in tests.
- `deleteLesson(state, id)` lives in `src/domain/teaching.js` next to the other rules; storage only loads and saves.
- Unreadable data (damaged JSON, wrong shape, newer version) is first copied as-is to `yogi-timer.history.backup`, then the app starts empty, so her History can still be recovered by hand.
- A failed save (storage full or blocked) returns `false` instead of throwing.

## Done when

Vitest covers loading, saving, corrupt data and deletion, using a fake storage object.

## Comments

**2026-11-21 — done.** `src/storage.js` (10 tests in `src/storage.test.js`, using a fake in-memory storage) and `deleteLesson` in `src/domain/teaching.js` (2 more tests there). Built red → green.

- Covered: nothing saved, round-trip including the Run that is going, failed save returns `false`, blocked reads, and damaged JSON / newer or missing version / wrong shape / non-History data, each of which starts empty with the raw text kept in `yogi-timer.history.backup`. If even the backup write fails, it still starts empty.
- Deleting a Lesson leaves a Run that is going untouched.
- Still to do in issue 05: call `saveState` after every change (Run started, completed, stopped, replaced; Lesson deleted), and `loadState` → `check(state, now)` on app open.
