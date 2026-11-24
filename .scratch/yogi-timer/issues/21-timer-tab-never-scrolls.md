# The Timer tab never scrolls

Status: resolved
Type: feature
Blocked by: None (can start immediately)
Blocks: 18

**What to build:** the Timer tab fits the screen whatever happens in a Lesson. Today each Run filed adds a row to "This lesson", and soon the tab scrolls: the newest Run, at the bottom, is the one pushed out of sight. Decided in the grilling session of 2026-11-24.

Measured on 2026-11-24, as the Home Screen app: on an iPhone 17 two Run rows fit under the Presets before the tab scrolls; on an iPhone SE none do, so a single Run already makes it scroll.

## Decisions

- **The rule:** the Timer tab never scrolls vertically, on any iPhone from the SE to the Pro Max, however many Runs the Lesson has. The History tab scrolls as it does now.
- **Newest first:** in "This lesson" the latest Run is at the top, so it is always the one in view. Today the list runs oldest first.
- **As many as fit:** the list fills the space left under the Presets and shows as many Runs as fit. When some don't fit, the oldest fade out at the bottom edge. When they all fit, there's no fade and the list keeps its normal bottom edge.
- **Room on short screens:** on short screens the Lotus dial shrinks a little, so that at least two Runs always show. On an iPhone 17 it stays as it is.
- **The heading counts them all:** "This lesson · 5 runs · 14 min", counted as History counts a Lesson: "1 run" in the singular, and the minutes are the sum of the time each Run actually ran, rounded. A Run that is going isn't counted until it ends, just as it isn't listed until then. So the Teacher knows every Run counted even when she can see only some. There is no link to History.
- **History doesn't change:** an opened Lesson in History still lists its Runs first to last. It's the record, read in order; "This lesson" is what she glances at mid-class.
- **Not part of this:** horizontal scrolling. It came up in the same session and was dropped: it wasn't the problem.

## Acceptance criteria

- [x] With 1, 2 and 8 Runs in the Lesson, the Timer tab doesn't scroll, at iPhone SE (375 × 667) and iPhone 17 (402 × 874) sizes, with and without a Run going.
- [x] The newest Run is at the top of "This lesson".
- [x] When the Runs don't all fit, the oldest fade out at the bottom; when they do, nothing fades.
- [x] At least two Runs show on an iPhone SE; the Lotus dial on an iPhone 17 is the size it was.
- [x] The heading reads "This lesson · N runs · M min" ("1 run" for one), with the same total History shows for that Lesson.
- [x] History's Run lines are still in order, first to last.
- [x] Checked in the iOS Simulator as the installed Home Screen app, in both Themes, light and dark.

## Testing

- TDD for the heading and the newest-first order, in the DOM-free Timer screen module (`timer_screen.js`, with `format.js`), through its `view()`.
- The fit, the fade and the smaller Lotus dial on short screens are CSS: checked in the browser at both sizes (the Timer panel's `scrollHeight` equals its `clientHeight`), then in the Simulator.

## Comments

### 2026-11-24, done.

- **Newest first and the heading**, in `timer_screen.js`. `view()` lists the Runs newest first. It also gives a `lessonHeading`, "This lesson · 5 runs · 14 min", or null before a Lesson's first Run ends.
  - The count and total come from `describeLesson()` applied to a new `summarizeLesson()` in `teaching.js`. `lessonSummaries()` now uses the same function, so the Timer tab and History can't disagree.
  - There are four tests through `view()`: newest first; the heading; "1 run" without the Run that is going; and no heading before the first Run ends.
  - The page shows the heading in capitals, as it did "This lesson" before (`.lesson h2`).
- **The tab never scrolls**, in `base.css`.
  - `.timer` is exactly the height above the tab bar.
  - "This lesson" takes what's left. The list clips and its rows don't shrink.
  - The `<ol>` is `reversed`, so its numbering runs the way it is now read.
- **The fade.** When the Runs don't all fit, the controller sets `data-overflows` on the list. It checks when the list changes and, through a ResizeObserver, when its room changes. A 24 px mask then fades the bottom edge.
- **The smaller dial.** `.timer` is a size container. The lotus is at most `(100cqh − --under-lotus) × 524/556` wide. `--under-lotus` adds up what goes under it: the gaps, Stop, the Presets, the heading, two rows of 45 px, and a 12 px glimpse of a third.
  - The glimpse is where the fade falls. With three or more Runs the newest two read clearly: on the SE the second row's text ends 2 px above the fade.
  - With exactly two Runs nothing fades.
- **Checked in the browser pane.** The Timer panel's `scrollHeight` equals its `clientHeight` with 1, 2, 3 and 8 Runs, with and without a Run going, at:
  - **375 × 667:** the lotus is 303 px tall (364 before), two rows show plus the glimpse, and the fade shows only from 3 Runs.
  - **375 × 647:** about the SE as the Home Screen app, under its 20 px status bar. The lotus is 283 px tall, and the rest is the same as at 375 × 667.
  - **402 × 874:** the lotus is 370 px wide, as before, and the Presets are still at 464 px. Four rows show, and the fade shows only with 8 Runs.
  - History still lists a Lesson's Runs first to last and still scrolls.
  - Screenshot: [SE, 8 Runs](21-timer-tab-never-scrolls/se-browser-8-runs.jpg).
- **Checked in the iOS Simulator** (iPhone 17) as the installed app.
  - A drag up on the list moves nothing.
  - A Stopped Run joins at the top and the heading counts it.
  - Screenshots: [Glow light](21-timer-tab-never-scrolls/glow-light-ready.png), [Glow dark](21-timer-tab-never-scrolls/glow-dark-ready.png), [Bead light](21-timer-tab-never-scrolls/bead-light-ready.png), [Bead dark, Run going](21-timer-tab-never-scrolls/bead-dark-run.png), [Bead dark, newest first](21-timer-tab-never-scrolls/bead-dark-newest-first.png).
- **Not checked on a device: the smaller dial.** There's no SE in the Simulator with the app installed, so the smaller lotus has only been measured in the browser. Leave it for the real-iPhone test (ticket 20), on a short phone if one is at hand.
- **Leftovers:**
  - `--under-lotus` repeats sizes set elsewhere in `base.css`: Stop's height, the Presets' height, the gaps and the row height. Its comment says to keep them in step.
  - The overflow check in `timer_controller.js` is the same as the sheet's `data-scrolls` check.

