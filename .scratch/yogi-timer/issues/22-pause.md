# Pause

Status: ready-for-agent
Type: feature
Blocked by: None (can start immediately)
Blocks: 18

**What to build:** the Teacher can **Pause** a Run with a tap on the Lotus dial and **Resume** it with another. The Stop button stops being always on screen: it appears only while a Run is paused, so stopping takes two deliberate taps and a stray tap mid-class can always be undone. Decided in the grilling session of 2026-11-24. Terms are in [GLOSSARY.md](../../../GLOSSARY.md) (Pause, Paused Run).

Pause was a v1 non-goal in the spec, with no reason written down. Nothing blocks it. It touches four things: how long a Run ran (today the end time minus the start time), the Lesson Gap, the Lotus dial, and the one-tap feel.

## Decisions

### The gesture

- **Tap the dial to pause, tap again to resume.** The whole dial is the target: the lotus and the countdown. The tap acts at once, with no wait for a second tap, so there is no double tap anywhere. A double tap would clash with VoiceOver, delay every tap by about 300 ms, and be hard to discover.
- **As many pauses as she likes** in one Run.
- **Stop only while paused.** There is no Stop button while a Run counts. Its place under the dial stays reserved and empty, so nothing moves when she pauses, and the Timer tab still never scrolls ([issue 21](21-timer-tab-never-scrolls.md)). While paused, the **Stop** button shows in that place. It's called "Stop", not "End", to match Stopped Run.
- **No hint text** such as "Tap to pause" while counting. She learns it once, and in class nothing extra shows.
- **The dial does nothing outside a Run.** In Ready, and during the 0:00 pulse and the settling, a tap on it does nothing. Runs still start only from the Presets.
- **A dial tap cancels "Tap again".** If a Preset shows "Tap again" when she taps the dial, the Run pauses and the confirmation is cancelled, so no Replace is left half done.
- **Replace works the same while paused.** A Preset tap shows "Tap again", and the second tap Replaces the Run. The Paused Run is saved as a Stopped Run.

### How a Paused Run looks

- The countdown holds still and **breathes**: its opacity rises and falls slowly, about 2 s a cycle. The small word **Paused** shows under it. A frozen clock must be obvious from across the room, so an accidental pause doesn't go unnoticed.
- The **Lotus dial freezes**: no more beads light, and the petals stop swaying. On Resume it carries on from where it was.
- **With Reduce Motion on**, the countdown is only dimmed, with no breathing.
- **VoiceOver:** the dial is a button, read as "Pause, 2:41 left" while counting and "Resume, 2:41 left" while paused.
- **No sound** when she pauses or resumes.

### The rules

- **Paused time doesn't count.** The time a Run ran is only the time it was counting. That holds for the History line ("stopped 1:30"), for a Lesson's total minutes in History and in "This lesson", and for the Mis-tap rule (less than 5 s of counting is not kept).
- **History shows no sign of pauses.** It shows the time ran, as today ("5 min · completed", "stopped 1:30"), and not how many times she paused.
- **A pause left too long.** A Run still paused when the Lesson Gap (90 minutes) has passed since the pause becomes a Stopped Run, ending at the moment it was paused. So a forgotten pause doesn't open the app the next day with a Run half done.
- **The screen stays awake** while paused, since she will usually resume soon. The wake lock is released when the pause ends with a Stop, a Replace, or the Lesson Gap.
- **A pause survives a reopen.** If iOS closes the app while a Run is paused, reopening it shows the Run paused at the same point. A paused Run never completes on its own.
- **Audio.** The tap that resumes also unlocks audio after a reopen, as every tap in the app already does, so the Chime still plays at zero.
- **History saved before this change** still loads and reads the same, including a Run that was going when the app updated.

## Acceptance criteria

- [ ] A tap on the dial pauses a counting Run at once, and another tap resumes it from the same remaining time. This works several times in one Run.
- [ ] While counting there is no Stop button and its place is empty. While paused, Stop shows there, and a tap on it saves a Stopped Run. Nothing on the Timer tab moves between the two.
- [ ] In Ready, at 0:00 and while settling, a tap on the dial does nothing.
- [ ] A dial tap while a Preset shows "Tap again" pauses the Run and cancels the confirmation.
- [ ] Replace from a Paused Run works as from a counting one ("Tap again", then the Run is Replaced and saved as Stopped).
- [ ] Paused time is left out of the History line, the Lesson's total (History and the "This lesson" heading) and the Mis-tap rule.
- [ ] A Run left paused past the Lesson Gap is filed as a Stopped Run ending when it was paused.
- [ ] A Paused Run survives closing and reopening the app, still paused at the same point.
- [ ] While paused the countdown breathes and reads "Paused", and the Lotus dial is frozen. With Reduce Motion on, the countdown only dims.
- [ ] VoiceOver reads the dial as "Pause, … left" and "Resume, … left".
- [ ] The screen stays awake while paused.
- [ ] History saved before this change still loads and shows the same lines and totals.
- [ ] The Timer tab still never scrolls at 375 × 667 and 402 × 874, counting and paused.
- [ ] **Checked in the iOS Simulator as the installed web app**, launched from its Home Screen icon (not a Safari tab), with real taps. Screenshots in the done comment.
  - A tap on the lotus pauses at once and another resumes. A quick second tap doesn't zoom the page or act as a double tap.
  - While paused, Stop shows in its place and saves a Stopped Run that joins "This lesson" at the top.
  - The paused countdown breathes and the Lotus dial is frozen.
  - Close the app from the app switcher while paused and reopen it from the icon: the Run is still paused at the same point. Resume it, and the Chime plays at zero.
  - A Preset tap while paused shows "Tap again" and Replaces the Run.
  - The Settings sheet still opens and closes over a Paused Run.
  - In Glow and Bead, each in light and dark.

## Testing

- TDD for the rules in the domain module (`teaching.js`): pause, resume, stop from a pause, paused time left out of the time ran, the Mis-tap, a pause filed after the Lesson Gap, Replace from a pause, and a pause read back from saved state. Old saved state loads too.
- TDD for what the Timer tab shows, through `view()` of the Timer screen module (`timer_screen.js`): a "paused" mode, the frozen countdown, Stop shown only while paused, the dial's label, a dial tap that does nothing outside a Run, and a dial tap that cancels "Tap again".
- The breathing, the frozen dial, Reduce Motion and the reserved Stop place are CSS and the Lotus dial: checked in the browser at both sizes, then in the iOS Simulator as the installed web app (see the last acceptance criterion).
- VoiceOver and Reduce Motion on a device go to the real-iPhone test ([issue 20](20-real-iphone-acceptance-test.md)).

## Comments
