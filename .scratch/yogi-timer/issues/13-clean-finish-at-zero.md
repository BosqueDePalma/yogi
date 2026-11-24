# The finish at zero reads cleanly

Status: resolved
Type: task
Blocked by: None (can start immediately)
Blocks: 19

**What to build:** the moment a Run reaches zero looks calm and legible in every theme, light and dark. The Teacher sees a clear **0:00** while the Lotus dial celebrates, then the picture settles into Ready without the Ready screen landing on top of the fading lotus.

Found in the theme review of 2026-11-23, by measuring contrast and watching each state in the browser at iPhone size:

- **0:00 is hard to read in light mode.** Its blue is 2.7:1 on the dial's disc, under the 3:1 needed for large text, and about 1:1 on the pink petals behind it. Only the soft halo around the digits makes it readable.
- **Ready arrives too early.** The 0:00 pulse lasts 4 s, but the Lotus dial celebrates for 4 s and then fades for 2 s more. So for about 2 s the word "Ready" (mauve, with no halo) and the pink Om are drawn over the still-bloomed pink lotus, which looks muddy.
- **The countdown snaps.** It jumps from a large blue "0:00" to a small mauve "Ready" in one frame, while everything around it fades.

The finish's timing in the spec stays the same: one Chime, 0:00 for 4 s, then back to Ready in about 2 s.

- [x] In light mode, 0:00 is at least 3:1 against the dial's disc in both themes, and stays clearly readable over the petals.
- [x] Om and "Ready" don't show over the bloomed lotus. They come in as the picture fades, or once it has gone.
- [x] The countdown goes from 0:00 to Ready without a one-frame jump in size and colour.
- [x] With Reduce Motion on, the finish still works and nothing new moves; only fades remain.
- [x] A Stopped Run, and a Run noticed late, still fade quickly to Ready, with no celebration.
- [x] Checked in the browser at iPhone size in Glow and Bead, light and dark, with screenshots of 0:00 and of the hand-off to Ready.

## Comments

### 2026-11-23, done.

- **A settling phase.** After the 4 s pulse, the Timer screen now spends 2 s "settling" while the Lotus dial fades. 0:00 fades out over 0.8 s, and once the picture has gone, "Ready" fades in over 0.8 s and the Om over 1.5 s. Stop, a Run noticed late, and a new Run skip settling, as before. A Preset tapped while settling starts a Run straight away. The countdown's size, position and colour change while it is invisible, so there is no one-frame jump.
- **A darker 0:00.** 0:00 has its own colour, the `--lotus-zero` token. In light mode it is #3f5cb3: 6.1:1 on the disc and 3.0:1 on the middle petals (p3). In dark mode it is #bcd0f6 (the glow blue): 9.8:1 on the disc. Before, the light-mode figure was 2.7:1 on the disc.
- ⚠️ **Partly met: the darkest inner petals.** On the darkest inner petals (p4) it is 2.3:1 in light mode and 2.6:1 in dark. There the soft halo around the digits still does the work. Reaching 3:1 on p4 would need a near-navy 0:00 and lose the blue.
- **Tests.** Two tests on the Timer screen seam:
  - The on-time finish now goes pulse → settling → Ready.
  - A tap while settling starts a Run.
  - 82 tests pass and the build is clean.
- **Browser checks.** Done in the browser pane at iPhone size, with Date.now skewed. The 0:00 captures and the hand-off to Ready were checked in Glow and Bead, light and dark:
  - The Om and "Ready" only appear once the lotus has faded.
  - Stop shows "Ready" at full opacity at once.
  - A tap while settling shows the new countdown at full opacity.
- **Total timing.** The picture still fades back in about 2 s, as the spec says. The text is fully back about 0.8 s later, about 2.8 s after the pulse ends.
- **Known edge cases:**
  - If the app is hidden for the whole of settling, it returns straight to Ready with no fade. Nobody is watching, so this is fine.
  - After a Stop, "Ready" still shows over the lotus during its 0.6 s fade, as before this change.
- **Left from the code review:**
  - `SETTLE_MS` must match the Lotus dial's fade length; now cross-referenced, as `PULSE_MS` already is with the celebration.
  - Using one `data-mode` attribute instead of one attribute per mode would cut repetition, but it is out of scope here.
