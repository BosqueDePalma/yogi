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
- A *guaranteed* chime while the phone is locked. It worked on her iPhone, but iOS doesn't promise it (see ADR 0001).
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
- The Run that is going is saved on the phone along with History. If iOS closes the app completely mid-Run, reopening it continues the countdown, or, if the end has already passed, files the Run as Completed with no late chime.
- The screen stays awake while a Run is going.

### Completion

- When a Run reaches zero:
  - the chime plays once,
  - **0:00** shows for 4 seconds while the Lotus dial celebrates: the tassel opens, three ripples spread and the mala glows blue,
  - the Run is added to the current Lesson's list,
  - the picture fades back to ready in about 2 seconds.
- If the app was suspended past zero, the Run is saved as Completed, ending at its planned end time. There is **no late chime** and no celebration: the screen simply shows the Run as done.

### Lessons

- A Run belongs to the current Lesson if it starts within the **Lesson Gap**: 90 minutes after the **end** of the previous Run. Otherwise it starts a new Lesson.
- Calendar days don't matter, so a class running past midnight stays one Lesson.
- The Teacher never starts or ends a Lesson by hand.
- The main screen's list of current Lesson Runs is empty once the Lesson Gap has passed since the last Run.

### History

- A second tab lists past Lessons, newest first. Each row shows the date, start time, number of Runs and total minutes timed (the sum of the actual time each Run ran).
- Tapping a Lesson shows its Runs: the Preset, the actual time it ran, and whether it was completed or stopped.
- She can delete a whole Lesson after confirming.
- History is stored in localStorage as one JSON document on her phone only, together with the Run that is going, if any.
- If the phone refuses to save, the app carries on from memory, and the History tab shows a quiet notice: "History isn't being saved on this phone. New runs will be lost when the app closes." The notice goes away as soon as a save works again. The Timer tab never shows it ([issue 09](issues/09-deeper-store.md)).

### Chime

- A tone generated in code with Web Audio, with no audio file. There are three Chimes: **Singing bowl** (the default, the Teacher's pick), **Tingsha** and **Gong**, ported from the issue 01 prototype.
- **Chime selector** on the Timer tab: a three-option segmented control under the Presets. One tap switches, at any time:
  - Switching during a Run changes the Chime that Run plays at zero.
  - With no Run going, switching plays the new Chime once as a preview. During a Run there is no preview, so the class isn't disturbed.
  - The choice is remembered on the phone (localStorage, under its own key, separate from History). History doesn't record which Chime played.
- The chime **always plays, even with the silent switch on**: the app sets `navigator.audioSession.type = "playback"`. On her iPhone this also let the chime sound with the screen locked ([issue 01](issues/01-chime-and-wake-lock-test.md)).

### Look and install

- Portrait only, with a calm look and a very large countdown.
- **Lotus dial** ([issue 12](issues/12-lotus-dial.md)): around the countdown, a mala of 108 beads lights up blue one by one while a pink lotus blooms, stretched to the Run's Preset. The Run drives the picture, so reopening mid-Run shows the right point. A Stopped Run fades out in about 0.6 s with no celebration. In ready it shows Om (ॐ) above the word "Ready". The lotus has its own pink, blue and gold palette, in light and dark; the rest of the app uses the chosen theme (see below). With Reduce Motion on, beads and petals only fade in: no bounce, sway or ripples.
- Colours follow the phone's light/dark setting.
- **Theme selector** on the Timer tab, under the Chime selector: **Glow** (the default: the mala's final glow, a pale blue, on a blue-white page) or **Bead** (the lit beads' stronger blue on a periwinkle page). Both come from the lotus palette, each in light and dark. One tap switches; the choice is remembered on the phone under its own key, and the status bar colour follows it.
- Named "Yogi Timer" on the home screen, with an SVG singing-bowl icon (plus the PNG sizes iOS needs).
- Can be installed to the home screen and works offline.

## Main screen layout

```
┌──────────────────────────────┐
│    ( lotus + mala )          │  ← Lotus dial, Om + "Ready" when idle
│        3:00                  │  ← big countdown over the lotus
│       [ Stop ]               │
├──────────────────────────────┤
│  [1] [2] [3] [5] [10]        │  ← Presets, tappable during a Run
│  Chime [Bowl|Tingsha|Gong]   │  ← Chime selector, one tap
│  Theme [Glow|Bead]           │  ← Theme selector, one tap
├──────────────────────────────┤
│ This lesson                  │
│  3 min · completed           │
│  5 min · stopped 2:41        │
└──────────────────────────────┘
    [ Timer ] [ History ]       ← tabs
```

## Architecture

- Built with Vite, Stimulus (`@hotwired/stimulus`), plain HTML, plain modern JavaScript and modern CSS. No TypeScript, no UI framework.
- `vite-plugin-pwa` provides the web app manifest and the offline service worker.
- The domain rules (Lessons, Runs, Lesson Gap, Mis-tap, Replace, clock-based countdown) live in plain JavaScript modules with no DOM and no Stimulus. They take the current time as an input, so tests don't depend on the real clock. They are written test-first with Vitest.
- Storage sits behind a small module that reads and writes the History JSON in localStorage.
- Stimulus controllers only connect the domain modules and storage to the page: the timer, the Preset confirmation, the History list, the Chime and the Chime selector.
- The Timer tab's own rules (Run completion, the Replace confirmation, the 0:00 pulse, what the countdown shows, and whether the Chime rings) live in a DOM-free module that takes the time as an input. The timer controller only draws what it returns ([issue 08](issues/08-run-screen-module.md)).
- The Chime's rules (her saved choice, no preview during a Run, unlocking audio inside a tap) live in a module with no DOM and no Web Audio. The Web Audio player sits behind a seam, so tests use a fake ([issue 10](issues/10-chime-module.md)).
- The History tab's rows (newest first, date and time, Run count, total, and each Run line) are built by a DOM-free module. The History controller only draws them and asks before a delete ([issue 11](issues/11-history-screen-module.md)).
- The Lotus dial is drawn with SVG and the Web Animations API, behind `createLotusDial(svg)` in `lotus_dial.js`. The Timer screen module tells it which Run to show and how far it has gone; it keeps no clock of its own ([issue 12](issues/12-lotus-dial.md)).
- Hosting is GitHub Pages, set up **after** the app is finished and only with the user's go-ahead ([issue 13](issues/13-github-pages-hosting.md)).

## Open questions

None right now.

Resolved by issue 01: the chime ignores the silent switch (by design), and the wake lock works from the Home Screen on her phone. It is released whenever the app is hidden, so it must be requested again on return while a Run is going.

## Notes from issue 01

- The Home Screen app has its own storage, separate from Safari tabs. History only exists in the installed app. This includes the offline cache: the app must be opened once from the Home Screen while online before it works offline (found in issue 02).
- Audio must be unlocked inside the Teacher's tap (create/resume the `AudioContext` on the Preset tap); after that the chime at zero needs no further tap. If iOS closed the app mid-Run, reopening it continues the Run with audio locked: any tap on the Timer tab unlocks it again (issue 06).
