# History tab

Status: resolved
Type: task
Blocked by: 02, 04

See the [spec](../spec.md), History section.

## Scope

- A list of Lessons, newest first, each showing the date, start time, number of Runs and total minutes.
- Tapping a Lesson shows its Runs: the Preset, the actual time ran, and completed or stopped.
- Deleting a whole Lesson, with a confirmation.
- A friendly empty state when there are no Lessons yet.

## Done when

In the Simulator, Lessons created on the Timer tab show up correctly and can be deleted, and the change sticks after the app is relaunched.

## Comments

**2026-11-22, done.**
- Decided with the user: a Lesson's total is in whole minutes, rounded to the nearest minute, with "<1 min" under half a minute. Delete uses the phone's own dialog (`confirm()`). Dates follow the phone's language and time zone, so a Spanish iPhone shows "sáb, 21 nov · 11:18 p.m." inside the otherwise English app.
- `describeLesson(summary, { locale, timeZone })` in `src/format.js` gives the date, start time, Run count ("1 run" or "3 runs") and total. It's tested in `src/format.test.js`, including a Lesson that started late on 21 Nov UTC, which Madrid time dates 22 Nov. The Lesson rules and `deleteLesson` were already tested in issues 03 and 04.
- `history_controller.js` draws each Lesson as a `<details>` element. Its summary shows the date and time, then the Runs and total; opening it shows its Runs (via `describeRun`) and a "Delete lesson" button. It redraws only when the Lessons change, and Lessons that were open stay open.
- The native dialog can't rename its button, so it reads "Cancelar / OK" (in the phone's language) rather than "Delete". A custom dialog could fix that if it matters.
- Checked in the browser pane: newest first, totals (3:00 + 2:41 + 10:00 shows "16 min"), a Lesson past midnight dated by its start, Cancel keeps the Lesson, OK deletes it and saves, and the empty state shows when none are left. Light and dark both checked.
- Checked in the Simulator (Home Screen app): today's 9 test Runs showed as one Lesson ("9 runs · 17 min", the Runs add up to 16:45). The real iOS dialog appeared, and after OK and a relaunch History was empty. A new Run stopped at 0:13 showed up in History straight away as a new Lesson ("1 run · <1 min").
- Seen once, not reproduced: on the first launch after this update, the Simulator's saved Chime was "bowl" where Tingsha had been chosen. A second forced update with Tingsha saved kept Tingsha, checked in the Simulator's localStorage database and on screen. Most likely a stray tap during my launch steps, but the real-iPhone check (issue 11) should confirm the choice survives an update.
