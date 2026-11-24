# Switching theme feels smooth

Status: ready-for-agent
Type: task
Blocked by: None (can start immediately)
Blocks: 17

**What to build:** tapping Glow or Bead, or the phone switching between light and dark, eases the colours across in about a quarter of a second, not a hard cut. The status bar shows the right colour for Bead from the moment the app opens.

Found in the theme review of 2026-11-23:

- **Every colour change is a hard cut.** Nothing in the interface fades: switching theme, light and dark, and the Presets stepping back when a Run starts all happen in one frame. The Presets' "Tap again" state should stay instant, because it is feedback for a tap.
- **The status bar starts in Glow's colour.** The page's own status-bar colours are Glow's. For a Teacher who chose Bead they are corrected only once the app's script has loaded, so Bead can open with Glow's status bar for a moment.

- [ ] Choosing Glow or Bead fades the page, surfaces, text and Presets to the new colours over roughly 200–300 ms.
- [ ] The phone switching between light and dark fades the same way.
- [ ] With Reduce Motion on, both changes are instant.
- [ ] "Tap again" still appears instantly, and nothing else that responds to a tap becomes slower.
- [ ] The Lotus dial's animation during a Run is not disturbed by a theme switch.
- [ ] A Teacher who chose Bead sees Bead's status bar colour from the first frame, in light and dark.
- [ ] Checked in the browser at iPhone size: switching theme mid-Run and in Ready, and reopening with Bead saved.
