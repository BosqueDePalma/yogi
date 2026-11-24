# The Timer tab never scrolls

Status: ready-for-agent
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

- [ ] With 1, 2 and 8 Runs in the Lesson, the Timer tab doesn't scroll, at iPhone SE (375 × 667) and iPhone 17 (402 × 874) sizes, with and without a Run going.
- [ ] The newest Run is at the top of "This lesson".
- [ ] When the Runs don't all fit, the oldest fade out at the bottom; when they do, nothing fades.
- [ ] At least two Runs show on an iPhone SE; the Lotus dial on an iPhone 17 is the size it was.
- [ ] The heading reads "This lesson · N runs · M min" ("1 run" for one), with the same total History shows for that Lesson.
- [ ] History's Run lines are still in order, first to last.
- [ ] Checked in the iOS Simulator as the installed Home Screen app, in both Themes, light and dark.

## Testing

- TDD for the heading and the newest-first order, in the DOM-free Timer screen module (`timer_screen.js`, with `format.js`), through its `view()`.
- The fit, the fade and the smaller Lotus dial on short screens are CSS: checked in the browser at both sizes (the Timer panel's `scrollHeight` equals its `clientHeight`), then in the Simulator.

## Comments
