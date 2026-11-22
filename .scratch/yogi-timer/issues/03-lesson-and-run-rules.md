# Lesson and Run rules, test-first

Status: ready-for-agent
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

## Done when

Every rule above has a passing test, including these edge cases: exactly 90 minutes, exactly 5 seconds, a Run noticed hours after its end, a class over midnight.

## Comments
