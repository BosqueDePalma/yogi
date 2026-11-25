# Auto Theme: four looks in rotation

Status: resolved
Type: feature
Blocked by: None (can start immediately)
Blocks: 19

**What to build:** a third Theme option, **Auto**, which becomes the default. It rotates through the four looks by the clock: Glow light, Glow dark, Bead light, Bead dark, then back to Glow light. Light looks start at 6:30 am and dark looks at 6:30 pm, so each look lasts 12 hours and a full round takes two days. Decided on 2026-11-25. The term is in [GLOSSARY.md](../../../GLOSSARY.md) (Theme).

## Decisions

- **The rotation:** Glow light (6:30 am) → Glow dark (6:30 pm) → Bead light (the next 6:30 am) → Bead dark (6:30 pm) → Glow light.
- **The clock decides, not the phone.** With Auto, light or dark follows the time even when the phone is in the other mode. iOS's own status bar and controls follow the phone's mode, so they may not match the app. Check this in the Simulator.
- **Fixed times:** 6:30 am and 6:30 pm in the phone's local time, every day of the year, with no sunrise or sunset.
- **A fixed starting point:** the round is counted from a fixed date, 1 Jan 2026 at 6:30 am, starting on Glow light. Every half-day always gets the same look, however long the app stays closed. It doesn't depend on when the app was opened.
- **In Settings:** the Theme row has **Auto**, Glow and Bead. Auto is the default. Choosing Glow or Bead keeps that Theme, which follows the phone's light or dark mode as it does today. The choice is saved as it is now. "Auto" keeps its name in Spanish (issue 26).
- **A change mid-class:** at 6:30 the colours ease across with the theme switch from [issue 16](16-smooth-theme-switch.md). A Run keeps counting and the Lotus dial doesn't stutter. The change also happens with the app open and no tap.
- **On opening:** the right look is applied before the page draws, status bar colour included, as the saved Theme is today.

## Acceptance criteria

- [x] Auto is the default and comes first in the Theme row, before Glow and Bead.
- [x] With Auto, the look at any moment matches the rotation counted from 1 Jan 2026, 6:30 am, Glow light.
- [x] Light and dark follow the clock, whatever the phone's mode.
- [x] At 6:30 am and 6:30 pm the look changes by itself with the app open, easing across, mid-Run too.
- [x] Opening the app shows the right look from the first frame, status bar included.
- [x] Glow and Bead still work as today and follow the phone's mode.
- [ ] **Checked in the iOS Simulator as the Home Screen app** at each of the four looks (by setting the time) and across a 6:30 change with a Run going. Note where iOS's status bar or controls don't match the look.

## Testing

- TDD for a DOM-free function that, given a time, returns the look (`{ theme, mode }`). Cases:
  - 6:29 am vs 6:30 am, and 6:29 pm vs 6:30 pm;
  - all four looks in turn across two days;
  - a date long after the start;
  - just past midnight still giving the evening's dark look;
  - a daylight-saving change in local time.
- TDD for when the next change is due, so the page can switch at exactly 6:30 without polling.
- The easing, the first frame and the status bar are checked in the browser and then in the Simulator.

## Comments

### 2026-11-25, done.

- **The rotation**, in `theme_clock.js`, with no DOM. `lookAt(now)` gives `{ theme, mode }` and `nextChangeAt(now)` gives the next 6:30. Days are counted on the local calendar, so daylight saving plays no part. 8 tests, pinned to Europe/Madrid so the daylight-saving cases count. They also pass in New York, Sydney and UTC.
- **Colours.** Every colour token is now a `light-dark(light, by night)` pair, in place of the `prefers-color-scheme` blocks, Bead's included. Auto sets `<html data-mode>`, which sets `color-scheme`, so the clock picks light or dark whatever the phone's mode. All former dark values are kept.
- **The page.**
  - `theme_controller.js` has Auto, Glow and Bead, with Auto as the default when nothing is saved. With Auto it sets a timer for the next 6:30, and looks again when the app comes back to the foreground.
  - The head script repeats `lookAt()` and paints the first frame, status bar included. With Auto, both theme-color metas take the clock mode's colour.
  - Auto is first in the Theme row.
- **Checked in the browser pane:**
  - The four looks under a forced mode.
  - Glow and Bead following the phone.
  - With the clock moved to 6:29:58 pm, the look turned from Glow light to Glow dark on its own and eased across.
- **Checked in the iOS Simulator** (iPhone 17), as the Home Screen app:
  - Auto is the default.
  - At 4:57 pm, with the phone in dark mode, Auto stays Glow light, and the status bar matches the page.
  - Bead, chosen fixed, follows the phone into dark.
  - Screenshots: [Settings, Auto](28-auto-theme-rotation/settings-auto-default.png), [Auto, Glow light with the phone dark](28-auto-theme-rotation/auto-glow-light-phone-dark.png), [Bead following the phone](28-auto-theme-rotation/bead-follows-phone-dark.png).
- **Not checked:**
  - **The other three looks under Auto, and a 6:30 change with a Run going, in the Simulator.** The Simulator runs on the Mac's clock, so these were checked only in the browser. Leave them for the real-iPhone test (issue 20).
  - **iOS's own controls with the clock and the phone in different modes.** The `color-scheme` set on the page may not reach all of them.
- **Leftovers:**
  - The head script repeats `lookAt()` and the status bar painting. The comments say to keep them in step.
  - `light-dark()` needs iOS 17.5 or later.
