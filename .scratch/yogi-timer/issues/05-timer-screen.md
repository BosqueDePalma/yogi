# Timer screen

Status: ready-for-agent
Type: task
Blocked by: 02, 03, 04

The main tab, built with Stimulus controllers on top of the domain modules and storage. See the [spec](../spec.md), sections Presets and Runs, Completion, and Main screen layout.

## Scope

- A big countdown (or "Ready") and a Stop button.
- Five Preset buttons. During a Run, tapping one shows "Tap again" for about 3 seconds, and a second tap Replaces the Run.
- The countdown redraws from the clock, and when the app becomes visible again it immediately works out whether the Run has completed (no late chime).
- At zero: the 0:00 pulse for a few seconds, then back to ready. The chime hook is left as a stub until issue 06.
- The screen stays awake during a Run (using whatever issue 01 found works).
- The list of current Lesson Runs, empty once the Lesson Gap has passed.

## Done when

In the iOS Simulator, the Teacher's flow works end to end: tap 1 min and let it complete, tap 3 min and Stop it, Replace a Run, and lock and unlock mid-Run.

## Comments
