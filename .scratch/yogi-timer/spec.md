# Yogi Timer — spec

Status: ready-for-agent

A one-tap countdown timer the Teacher uses on her iPhone while teaching. It keeps a History of her Lessons. Terms follow [GLOSSARY.md](../../GLOSSARY.md); the architecture decision is [ADR 0001](../../docs/adr/0001-static-home-screen-web-app.md).

## Goals

- From a cold app open, a single tap starts a Run.
- She can read the countdown from across the room.
- Every Lesson is recorded without her ever opening or closing one.
- It works fully offline after it has been installed once.

## Non-goals (v1)

- Pause and resume.
- Custom durations or durations in seconds.
- A chime while the phone is locked (see ADR 0001).
- Export, backup or sync.
- Notes or names on Lessons, charts, statistics.
- Deleting individual Runs.
- Landscape layout.

## Behaviour

### Presets and Runs

- There are five Presets: 1, 2, 3, 5 and 10 minutes.
- With no Run going, tapping a Preset starts a Run immediately.
- With a Run going, tapping any Preset (the same one included) asks for confirmation first:
  - The tapped button changes to "Tap again" for about 3 seconds.
  - A second tap within that window **Replaces** the Run: the current Run is saved as a Stopped Run and a new one starts.
  - If she doesn't tap again, nothing changes.
- **Stop** ends the Run, which is saved as a Stopped Run.
- A Stopped Run shorter than 5 seconds is a **Mis-tap** and is not saved.
- The countdown is based on the clock: remaining time = planned end time − now, never counted tick by tick. If the app is suspended (screen locked, app in the background), the countdown is correct when it comes back.
- The screen stays awake while a Run is going.

### Completion

- When a Run reaches zero:
  - the chime plays once,
  - the countdown pulses **0:00** for a few seconds,
  - the Run is added to the current Lesson's list,
  - the screen goes back to ready.
- If the app was suspended past zero, the Run is saved as Completed, ending at its planned end time. There is **no late chime**: the screen simply shows the Run as done.

### Lessons

- A Run belongs to the current Lesson if it starts within the **Lesson Gap**: 90 minutes after the **end** of the previous Run. Otherwise it starts a new Lesson.
- Calendar days don't matter, so a class running past midnight stays one Lesson.
- The Teacher never starts or ends a Lesson by hand.
- The main screen's list of current Lesson Runs is empty once the Lesson Gap has passed since the last Run.

### History

- A second tab lists past Lessons, newest first. Each row shows the date, start time, number of Runs and total minutes timed (the sum of the actual time each Run ran).
- Tapping a Lesson shows its Runs: the Preset, the actual time it ran, and whether it was completed or stopped.
- She can delete a whole Lesson after confirming.
- History is stored in localStorage as one JSON document on her phone only.

### Chime

- A singing-bowl-like tone generated in code with Web Audio, with no audio file.
- Whether the chime plays with the silent switch on (via `navigator.audioSession`, iOS 17+) is **undecided** until the chime test ([issue 01](issues/01-chime-and-wake-lock-test.md)).

### Look and install

- Portrait only, with a calm look and a very large countdown.
- Colours follow the phone's light/dark setting.
- Named "Yogi Timer" on the home screen, with an SVG singing-bowl icon (plus the PNG sizes iOS needs).
- Can be installed to the home screen and works offline.

## Main screen layout

```
┌───────────────────────┐
│        3:00           │  ← big countdown (or "Ready")
│       [ Stop ]        │
├───────────────────────┤
│  [1] [2] [3] [5] [10] │  ← Presets, tappable during a Run
├───────────────────────┤
│ This lesson           │
│  3 min · completed    │
│  5 min · stopped 2:41 │
└───────────────────────┘
   [ Timer ] [ History ]   ← tabs
```

## Architecture

- Built with Vite, Stimulus (`@hotwired/stimulus`), plain HTML, plain modern JavaScript and modern CSS. No TypeScript, no UI framework.
- `vite-plugin-pwa` provides the web app manifest and the offline service worker.
- The domain rules (Lessons, Runs, Lesson Gap, Mis-tap, Replace, clock-based countdown) live in plain JavaScript modules with no DOM and no Stimulus. They take the current time as an input, so tests don't depend on the real clock. They are written test-first with Vitest.
- Storage sits behind a small module that reads and writes the History JSON in localStorage.
- Stimulus controllers only connect the domain modules and storage to the page: the timer, the Preset confirmation, the History list and the chime.
- Hosting is GitHub Pages, set up **after** the app is finished and only with the user's go-ahead ([issue 08](issues/08-github-pages-hosting.md)).

## Open questions

- Does the chime play with the silent switch on, and should it? Decide after issue 01.
- Does keeping the screen awake (Screen Wake Lock) work in an app opened from the home screen on her iOS version? Check this in issue 01.
