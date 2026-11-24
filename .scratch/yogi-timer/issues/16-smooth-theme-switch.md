# Switching theme feels smooth

Status: resolved
Type: task
Blocked by: None (can start immediately)
Blocks: 19

**What to build:** tapping Glow or Bead, or the phone switching between light and dark, eases the colours across in about a quarter of a second, not a hard cut. The status bar shows the right colour for Bead from the moment the app opens.

Found in the theme review of 2026-11-23:

- **Every colour change is a hard cut.** Nothing in the interface fades: switching theme, light and dark, and the Presets stepping back when a Run starts all happen in one frame. The Presets' "Tap again" state should stay instant, because it is feedback for a tap.
- **The status bar starts in Glow's colour.** The page's own status-bar colours are Glow's. For a Teacher who chose Bead they are corrected only once the app's script has loaded, so Bead can open with Glow's status bar for a moment.

- [x] Choosing Glow or Bead fades the page, surfaces, text and Presets to the new colours over roughly 200–300 ms.
- [x] The phone switching between light and dark fades the same way.
- [x] With Reduce Motion on, both changes are instant.
- [x] "Tap again" still appears instantly, and nothing else that responds to a tap becomes slower.
- [x] The Lotus dial's animation during a Run is not disturbed by a theme switch.
- [x] A Teacher who chose Bead sees Bead's status bar colour from the first frame, in light and dark.
- [x] Checked in the browser at iPhone size: switching theme mid-Run and in Ready, and reopening with Bead saved.

## Comments

### 2026-11-23, done.

- **How the fade works.** The 28 colour tokens are registered as colours with `@property`, and `:root` eases them over 0.25 s whenever their values change. It is all CSS.
  - Choosing Glow or Bead, and the phone switching between light and dark, both change token values, so everything that uses them fades.
  - Taps ("Tap again", a Run starting, a tab, a selector option) only swap *which* token an element uses, so they still change at once.
  - Elements keep their own transitions: the countdown, the Om and the History chevron.
  - With Reduce Motion on, or in a browser without `@property` (older than iOS 16.4), the change is instant.
  - Each new colour token must be registered there too; the comment says so.
- **First version replaced.** The first version switched a wildcard transition on for 0.3 s from JS. The spec review showed three problems with it:
  - It relied on the browser recalculating styles only after the light/dark change event. The browser pane's emulation does the opposite, and there was no fade.
  - A tap inside that window would have faded "Tap again".
  - It cut short the page's own fades.
  The `@property` approach has none of these problems.
- **Status bar from the first frame.** Each `<meta name="theme-color">` now carries both themes' page colours (`data-glow`, `data-bead`).
  - The head script applies Bead's before the page draws. The theme controller reads the same attributes, and its own copy of the colours is gone.
  - Moving the colours onto the tags wasn't asked for, but it lets both read one copy.
- **Browser checks.** Done in the browser pane at iPhone size; the pane was hidden, so frames were throttled.
  - Choosing Bead in Ready created 10 token transitions on `:root` (`--bg` from #f4f7fe to #eef2fd, 250 ms) and none on other elements.
  - Light → dark created 28 token transitions, and a screenshot caught the page halfway.
  - "Tap again" 30 ms after a theme switch, mid-Run, armed at once with no transition of its own.
  - The Lotus dial kept all 225 of its animations running through the switch.
  - A real reload with Bead saved opened in Bead with Bead's status bar colours and no fade.
  - The fade exists only under `prefers-reduced-motion: no-preference`.
  - 82 tests pass and the build is clean, with all 28 `@property` rules in the built CSS.
- ⚠️ **For the iPhone (issue 20).** While the 0.25 s fade runs, every element using the tokens is restyled each frame, including the Lotus dial's ~400 SVG shapes. On the phone, check that a switch mid-Run doesn't stutter. Issue 20 now has this line.
