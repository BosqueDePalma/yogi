# Adjust a Selected Preset

Status: resolved
Type: feature
Blocked by: None (can start immediately)
Blocks: 18

**What to build:** a tap on a Preset no longer starts a Run. It makes it the **Selected Preset**: the countdown shows its time, and − and + **Adjust** it in steps before it starts. A tap on the lotus, or on the same Preset again, starts the Run. So the Teacher can time 1:30 or 45 s without a new Preset. Decided in the grilling session of 2026-11-24, after trying a prototype. Terms are in [GLOSSARY.md](../../../GLOSSARY.md) (Preset, Selected Preset, Adjust, Replace).

Until now the spec listed custom durations and durations in seconds as a non-goal, and a single tap started a Run. Both change: every Run now takes two taps.

## The prototype

Two ways were built and tried in the iOS Simulator as the installed app. The code is on the throwaway branch `prototype/adjust-run` (commit `23084cf`), with a floating bar to switch between them.

- **A, tap selects** (the one chosen): a tap selects a Preset, − / + Adjust it, and a tap on the lotus or the Preset starts it.
- **B, hold to start paused** (not chosen): a tap started a Run as before. A Preset held down for 0.5 s started its Run paused, and − / + Adjusted any Paused Run. It kept the one-tap start, but holding a Preset is hard to discover.

What the prototype showed:

- The step sizes and the repeat (one step, then about 5 a second after 0.5 s held) felt right.
- Rebuilding the Lotus dial at every step, while − or + is held, flickers: two half lotuses show at once. Hence the decision below that the lotus doesn't change while Adjusting.
- `touch-action: manipulation` and no iOS callout on the buttons: a long touch on a Preset or on − / + showed no menu or loupe, and quick taps didn't zoom.

## Decisions

### Selecting and starting

- **A tap on a Preset selects it.** With no Run going, it becomes the Selected Preset. Nothing counts and nothing is saved yet. A tap on another Preset selects that one instead.
- **Two ways to start:** a tap on the lotus, or a second tap on the Selected Preset. The second is the quick path: two taps on the same button.
- **Cancel:** while a Preset is selected, the Stop place shows **Cancel**. It drops the selection and the screen goes back to Ready.
- **Replace:** with a Run going, paused or not, a tap on a Preset shows "Tap again" as today. The second tap within 3 s ends the Run, saved as a Stopped Run (a Mis-tap is dropped as usual), and makes that Preset the Selected Preset. Its Run starts like any other. A Preset tap never starts a Run.
- **The 0:00 pulse and the settling:** a tap on a Preset ends them and selects it.
- **Audio:** the tap that selects unlocks audio, as a Preset tap does today, so the Chime plays at zero.

### Adjusting

- **Only before the Run starts.** − and + show only while a Preset is selected, never during a Run or a pause. Adjusting a Paused Run ("hold it 20 s more") was in variant B and was left out. If she misses it in class, it's a new ticket.
- **Where:** − and + either side of the Stop place, which holds Cancel while a Preset is selected. Nothing moves when they appear, and the Timer tab still never scrolls ([issue 21](21-timer-tab-never-scrolls.md)).
- **Steps by Preset:** 5 s for 1 and 2 min, 10 s for 3 min, 15 s for 5 min, and 30 s for 10 min. The step follows the Preset, whatever the time has been Adjusted to.
- **Steps snap:** + goes to the next multiple of the step and − to the one before, so 1:03 becomes 1:05 with + (1 min Preset). The times stay round.
- **Limits:** the time never goes below 0:05 or above 59:59. At a limit, that button is dimmed and does nothing.
- **Hold to repeat:** a touch steps once. Held for 0.5 s, it repeats about 5 times a second until she lifts her finger.
- **Only this Run:** the Preset keeps its time. The next tap on it selects 1:00 again, not the Adjusted time.

### How it looks

- **The countdown** shows the Selected Preset's time, standing still, with **"Tap to start"** under it, in the place and style of "Paused" (small capitals).
- **Text placement and colour.** "Tap to start" is centred under the countdown, "Cancel" is centred in Stop's button, and the − and + signs are centred in their circles. All of them use the Theme's colours like their neighbours ("Paused", Stop), and read well in Glow and Bead, light and dark. The dimmed − or + at a limit is still clearly a button, just a faded one.
- **The Selected Preset** looks pressed: the same strong colours as "Tap again".
- **The Lotus dial** shows the start of the Run: no beads lit, the lotus closed. It doesn't change while she Adjusts; the Run is drawn over its real time when it starts.
- **VoiceOver:** the Selected Preset reads "1 minute, selected". The lotus is a button reading "Start, 1:05". − and + read "Remove 5 seconds" and "Add 5 seconds", with the step of that Preset.

### The rules

- **A selection is never saved.** It lives while the app is open and doesn't expire. Switching to History or opening Settings keeps it. Reopening the app shows Ready.
- **No wake lock for a selection.** The screen stays awake only during a Run, as today, so a selection left alone doesn't drain the battery.
- **A Run remembers its time.** A Run started from an Adjusted time counts down from that time, and the Lotus dial spreads its beads over it. The Lesson Gap, the Mis-tap and Pause work as before.
- **History:** an Adjusted Run reads "1:30 · completed" or "1:30 · stopped 0:48". When its time is whole minutes it reads as today: "2 min · completed", even from a 1 min Preset. A Run that wasn't Adjusted reads exactly as now.
- **History saved before this change** still loads and reads the same, including a Run that was going when the app updated.

## Acceptance criteria

- [x] A tap on a Preset with no Run going selects it: its time shows with "Tap to start", nothing counts, and − / + and Cancel show. Another Preset tapped selects that one instead.
- [x] A tap on the lotus, or on the Selected Preset again, starts its Run from the selected time.
- [x] Cancel drops the selection and goes back to Ready, with nothing saved.
- [x] − and + step by the Preset's step and snap to its multiples. They never go below 0:05 or above 59:59, and are dimmed at the limit. Held, they repeat.
- [x] The Preset's own time doesn't change: the next selection starts from 1, 2, 3, 5 or 10 minutes.
- [x] With a Run going, paused or not, a Preset tap shows "Tap again". The second tap saves the Run as Stopped and selects the Preset without starting it.
- [x] An Adjusted Run counts down from its own time, the Lotus dial follows that time, and it is saved with it. History and "This lesson" read "1:30 · completed" or "2 min · completed".
- [x] History saved before this change loads and reads the same.
- [x] A selection survives a switch to History and back, and opening Settings. After a reopen the app shows Ready.
- [x] The screen isn't kept awake by a selection alone. (`view()` gives `running: false` for a selection, which releases the wake lock; the lock itself is for the real-iPhone test.)
- [x] "Tap to start", "Cancel" and the − and + signs are centred, and their colours read well in Glow and Bead, light and dark.
- [x] The Timer tab doesn't scroll at 375 × 667 and 402 × 874, with a Preset selected.
- [ ] VoiceOver reads the selected Preset, the lotus ("Start, 1:05") and − / + ("Remove 5 seconds"). (The labels are in the DOM; VoiceOver itself is for the real-iPhone test.)
- [x] **Checked in the iOS Simulator as the installed web app**, launched from its Home Screen icon, with real taps:
  - Select, Adjust with taps and by holding, and start from the lotus and from the Preset.
  - Two quick taps on a Preset start it with no zoom. A long touch on a Preset or − / + shows no iOS menu or loupe.
  - Cancel, and Replace from a Run and from a pause.
  - An Adjusted Run reaches 0:00 and the Chime plays.
  - Centring and colour in Glow and Bead, each in light and dark.

## Testing

- TDD for the rules in the domain module (`teaching.js`), through its exported functions:
  - the Adjust step: sizes by Preset, snapping, and the 0:05 and 59:59 limits;
  - a Run started from an Adjusted time, completed, stopped and filed with its time;
  - a Run read back from saved state, and old History without the new field.
- TDD for the Timer tab through `view()` of the Timer screen module (`timer_screen.js`):
  - selecting, re-selecting and Cancel;
  - − / + and when they are dimmed;
  - starting from the lotus and from the Preset;
  - Replace into a selection;
  - the "selected" mode, its countdown, "Tap to start", and the dial and Preset labels;
  - a selection never touches the store.
- TDD for the History line in `format.js` ("1:30", "2 min").
- The hold to repeat, the centring and the colours are the controller and CSS: checked in the browser at both sizes, then in the iOS Simulator as the installed web app.
- VoiceOver on a device goes to the real-iPhone test ([issue 20](20-real-iphone-acceptance-test.md)).

## Comments

### 2026-11-24, done.

- **The rules**, in `teaching.js`.
  - `start()` takes the Run's time (`timeMs`), and an Adjusted Run keeps it as `durationMs`, set only when it isn't its Preset's own time. So a Run never Adjusted, or Adjusted back, keeps the shape saved before, and old History loads as it was.
  - `runDurationMs()` gives a Run's time either way. The Lotus dial, the countdown and the History line use it.
  - `adjust(preset, timeMs, direction)` takes one step, snapped to the step's multiples, within 0:05 and 59:59. `adjustStepSeconds()` gives the step for VoiceOver.
  - `replace()` is gone: a Replace now ends the Run and selects, which is the Timer screen's job.
  - 8 new tests. The domain Replace tests moved to the Timer screen.
- **The History line**, in `format.js`: "1:30 · completed", or "2 min" when the time is whole minutes. 2 new tests.
- **The Timer screen**, in `timer_screen.js`.
  - A tap on a Preset selects it. A second tap on it, or a tap on the lotus, starts it. Stop's button is Cancel while a Preset is selected.
  - `adjust()` is − and +.
  - `view()` adds the mode `"selected"`, `selectedPreset` and `adjust` (`{ step, canRemove, canAdd }`, null without a selection). While a Preset is selected, the dial shows the start of the Run over the Preset's own time, so the lotus stands still while she Adjusts.
  - The selection lives only here and is never saved.
  - 10 new tests. The tests that started a Run with one tap now select and tap again (`startRun`). Those for Replace now expect a selection.
- **The page.**
  - − and + sit either side of Stop's place, with drawn signs so they sit exactly in the middle. They are dimmed at a limit and named "Remove 5 seconds" or "Add 5 seconds" with the Preset's step.
  - A finger steps once on touch, then repeats every 200 ms after 500 ms. The repeat stops at a limit. A click with no pointer behind it (keyboard, VoiceOver) steps once.
  - "Tap to start" sits in the place and style of "Paused", and the Selected Preset uses the "Tap again" colours.
  - `white-space: nowrap` keeps both notes on one line and centred. Placed from the middle, they wrapped at half the width.
  - No button shows the iOS callout on a long touch.
  - The Lotus dial now takes `{ durationMs, elapsedMs }` and stands still for `"selected"` as for `"paused"`.
- **Checked in the browser pane.**
  - Select, re-select, Adjust (taps and hold), the limits and dimming, Cancel, and start from the lotus and from the Preset.
  - Replace from a paused Run.
  - A selection survives a switch to History and back.
  - "Tap to start", the countdown, Stop's row and the − / + signs share one centre, to the pixel. Their colour is the Theme's text colour, as "Paused" and Stop.
  - The Timer panel's `scrollHeight` equals its `clientHeight` with a selection at 375 × 667 and 402 × 874.
- **Checked in the iOS Simulator** (iPhone 17), as the installed web app opened from its Home Screen icon, with real taps.
  - Select the 1, hold − to 0:30 (about 5 steps a second), and hold on to 0:05, where − dims.
  - + to 0:10, then start from the lotus. It reached 0:00 with the celebration, the Chime played (the speaker shows in the Dynamic Island), and "0:10 · completed" joined "This lesson" at the top.
  - Replace from a pause: "3 min · stopped 0:16", and the 5 is selected without counting.
  - Two quick taps on a Preset during an armed "Tap again" Replace, then start.
  - Cancel goes back to Ready, with nothing saved.
  - Settings opens over a selection and keeps it.
  - Glow and Bead, each in light and dark.
  - Screenshots:
    - [Glow light, 0:05](24-adjust-a-selected-preset/glow-light-at-0-05.png)
    - [Glow light, the Adjusted Run completed](24-adjust-a-selected-preset/glow-light-adjusted-run-completed.png)
    - [Glow light, Replace from a pause](24-adjust-a-selected-preset/glow-light-replace-from-pause.png)
    - [Glow dark](24-adjust-a-selected-preset/glow-dark-selected.png)
    - [Bead dark](24-adjust-a-selected-preset/bead-dark-selected.png)
    - [Bead light](24-adjust-a-selected-preset/bead-light-selected.png)
  - A few Simulator taps were lost while the page was changing (the sheet opening or closing, a reload). The same tap repeated a moment later worked.
- **Not checked on a device:** VoiceOver (the labels, and that a double-tap on − or + steps once), and the wake lock. Both go to [issue 20](20-real-iphone-acceptance-test.md).
- **Leftovers:**
  - `view()` builds the selection's object apart from the Run's, so the two list the same keys.
  - Stop's "Cancel" label is chosen in the controller from the mode, not given by `view()`.
  - Over a 10-second Run the beads light faster at the start than the time left suggests. The Lotus dial's own timing does this on very short Runs.
