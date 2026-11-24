# History screen module

Status: resolved
Type: task
Blocked by: 07, 08, 09, 10
Blocks: 13

A refactor with no change the Teacher can see. Today the History controller builds the list itself, in four steps:
- it gets the Lessons from the store;
- it builds the summaries;
- it builds the date, time, Run-count and total text;
- it builds each Run line.

The Run line (`describeRun` plus its outcome) is also built a second time in `timer_screen.js`. The controller redraws only when `lessons !== this.lessons`, which relies on an unstated rule: the store replaces the list of Lessons only when it really changes. A Lesson's id also goes from number to string to number through the page. This came out of candidate 4 of the architecture review of 2026-11-22. See the [spec](../spec.md), section History.

## Decisions

- **Module:** `src/history_screen.js`, named after the spec's "History tab". It's built the same way as `timer_screen.js`. It names a screen, not a domain term, so there's no glossary entry.
- **Interface:** `createHistoryScreen(store, { locale, timeZone })` with two calls:
  - `view()`;
  - `deleteLesson(id)`.
  - `locale` and `timeZone` are optional. The app leaves them out, so the phone's own are used. Tests pass fixed ones.
- **`view()` returns rows ready to draw, newest first:**
  `{ empty, unsaved, lessons: [{ id, date, time, runCount, total, deleteLabel, runs: [{ text, outcome }] }] }`
  - `id` is a string.
  - `deleteLesson(id)` takes that string, so the number/string conversion happens in one place, inside the module.
  - `deleteLabel` is today's "Delete lesson of <date>, <time>".
- **One place for Run lines:** `format.js` gains `describeRuns(runs)` → `[{ text, outcome }]`. Both `timer_screen.js` and `history_screen.js` use it.
- **Redraw rule made explicit:**
  - The controller keeps what it drew last (`JSON.stringify(view.lessons)`), and redraws the list only when that changes.
  - Open Lessons stay open, as now.
  - The `unsaved` warning is still drawn on every change.
- **The confirmation stays in the controller:** `confirm()` is a browser dialog. `deleteLesson(id)` deletes without asking.
- **What the History controller keeps:** subscribing to the store, the `confirm()`, and copying the view into the page (the `<details>` markup, keeping open Lessons open).

## Tests at the module's interface

All with a fixed locale and time zone and an in-memory store. Write them test-first, one at a time. The `describeLesson` tests in `format.test.js` stay as they are.

1. With no Lessons, the view is `empty`.
2. Lessons come out newest first, with date, time, "N runs" and total.
3. Each Lesson's Run lines come out right (completed, and stopped with the time it ran).
4. `deleteLesson` with the string id from the view removes that Lesson, and the view updates.
5. A refused save shows `unsaved: true`.

## Done when

- The five tests pass, along with all existing tests. `timer_screen.js` uses `describeRuns`.
- `history_controller.js` no longer imports `teaching.js` or `format.js`, and has no `lessons === this.lessons` check.
- Checked in the browser pane:
  - newest first, with the same text as before;
  - opening a Lesson shows its Runs;
  - an open Lesson stays open when a new Run is filed on the Timer tab;
  - Cancel keeps a Lesson, OK deletes it;
  - the empty state.
- The Simulator run is not repeated. The real-iPhone test ([issue 14](14-real-iphone-acceptance-test.md)) has a line for this rework.

## Comments

**2026-11-22, done.**
- `src/history_screen.js` exports `createHistoryScreen(store, { locale, timeZone })` with `view()` and `deleteLesson(id)`, as decided above. `src/history_screen.test.js` has the five tests, using the real store over a fake storage. Test 5 (the "not saved" warning) passed with no new code, because test 1's minimal version already read `store.saved()`; it stays as a guard.
- `format.js` gains `describeRuns(runs)`, test-first in `format.test.js`. `timer_screen.js` uses it too, so the Run line is built in one place.
- `history_controller.js` imports only the store and the new module. It redraws the list when `JSON.stringify(view.lessons)` changes, keeps open Lessons open, and still asks with `confirm()`.
- Found while building: a Stimulus action param turns a number-like string back into a number. So the delete button no longer carries `data-history-id-param`. The controller reads the string id from the Lesson's `<details data-id>`.
- Checked in the browser pane (dev server, phone language Spanish):
  - two seeded Lessons came out newest first, with the same text as before ("vie, 20 nov · 10:46 p.m.", "2 runs · 8 min", "10 min · stopped 2:41");
  - an open Lesson stayed open when a new Run was filed on the Timer tab, and the new Lesson appeared at the top;
  - Cancel kept a Lesson; OK deleted it and saved;
  - deleting the rest showed the empty state.
  - No console errors. The Simulator run was not repeated.
- Also checked in the iOS Simulator on request (Home Screen app on iPhone 17, served from this build on 127.0.0.1:4173). It took two full relaunches to pick up the build; the app's service worker then listed this build's script (`index-C2csNdQW.js`).
  - History showed three Lessons newest first, in the phone's Spanish format ("dom, 22 nov · 3:51 p.m.", "2 runs · 3 min").
  - Opening one showed its Run ("2 min · stopped 0:13").
  - In the real iOS dialog, Cancelar kept that Lesson and OK deleted it. So the string id works on the phone.
  - With the top Lesson open, a Run stopped at 0:09 on the Timer tab joined it. Back on History it was still open, now "3 runs · 3 min" with the new line "1 min · stopped 0:09".
