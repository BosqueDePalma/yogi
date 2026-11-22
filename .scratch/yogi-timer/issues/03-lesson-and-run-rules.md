# Lesson and Run rules, test-first

Status: resolved
Type: task
Blocked by: 02

Plain JavaScript domain modules with no DOM and no Stimulus. Write them test-first with Vitest. Every function takes `now` as an argument and never reads the real clock.

## Rules to cover (see GLOSSARY.md)

- Starting a Run from a Preset (1, 2, 3, 5, 10 minutes) records its start time and planned end time.
- Remaining time = planned end time − now, clamped at 0.
- A Run is Completed when now ≥ planned end time. A Run noticed after its end (because the app was suspended) is Completed with its end time = planned end time.
- Stop gives a Stopped Run with its actual time ran. Under 5 seconds it's a Mis-tap and is discarded.
- Replace = stop the current Run (the Mis-tap rule still applies) and start the new one.
- Lesson assignment: a Run joins the current Lesson if it starts ≤ 90 minutes after the end of the previous Run, otherwise it starts a new Lesson. Calendar days are ignored, so a class over midnight stays one Lesson.
- The current Lesson is the latest Lesson if the Lesson Gap has not passed, and none otherwise.
- Lesson summary: start time, number of Runs, total minutes (the sum of actual time ran).
- The Run that is going is part of the saved state, so after a restart the same completion check files it as Completed if its end has passed.

## Interface (agreed 2026-11-21)

One seam, `src/domain/teaching.js`. State is plain data `{ lessons, activeRun }`, and every function is pure and takes `now` (ms):
`start(state, preset, now)`, `stop(state, now)`, `replace(state, preset, now)`, `check(state, now) → { state, completed }`, `remaining(state, now)`, `currentLesson(state, now)`, `lessonSummaries(state)`. Tests go through this interface only.

## Done when

Every rule above has a passing test, including these edge cases: exactly 90 minutes, exactly 5 seconds, a Run noticed hours after its end, a class over midnight.

## Comments

**2026-11-21 — done.** `src/domain/teaching.js`, 22 Vitest tests in `src/domain/teaching.test.js`, all through the agreed interface. Built red → green one slice at a time; the late-notice and midnight edge cases passed on first run, because filing uses the planned end and ignores calendar days.

Decisions made while building:
- The current Lesson while a Run is going is judged by when that Run **started**: a Run started 87 min after the last one keeps "This lesson" on screen even after 90 min have passed.
- `lessonSummaries` returns `totalMs`; turning it into minutes is left to the History screen (issue 07).
- A Lesson's `id` is the start time of its first Run, so issue 04/07 can delete by id.
- `start` throws on anything other than a Preset; the old `src/smoke.test.js` placeholder was removed.
