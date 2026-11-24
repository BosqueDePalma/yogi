# The finish at zero reads cleanly

Status: ready-for-agent
Type: task
Blocked by: None (can start immediately)
Blocks: 17

**What to build:** the moment a Run reaches zero looks calm and legible in every theme, light and dark. The Teacher sees a clear **0:00** while the Lotus dial celebrates, then the picture settles into Ready without the Ready screen landing on top of the fading lotus.

Found in the theme review of 2026-11-23, by measuring contrast and watching each state in the browser at iPhone size:

- **0:00 is hard to read in light mode.** Its blue is 2.7:1 on the dial's disc, under the 3:1 needed for large text, and about 1:1 on the pink petals behind it. Only the soft halo around the digits makes it readable.
- **Ready arrives too early.** The 0:00 pulse lasts 4 s, but the Lotus dial celebrates for 4 s and then fades for 2 s more. So for about 2 s the word "Ready" (mauve, with no halo) and the pink Om are drawn over the still-bloomed pink lotus, which looks muddy.
- **The countdown snaps.** It jumps from a large blue "0:00" to a small mauve "Ready" in one frame, while everything around it fades.

The finish's timing in the spec stays the same: one Chime, 0:00 for 4 s, then back to Ready in about 2 s.

- [ ] In light mode, 0:00 is at least 3:1 against the dial's disc in both themes, and stays clearly readable over the petals.
- [ ] Om and "Ready" don't show over the bloomed lotus. They come in as the picture fades, or once it has gone.
- [ ] The countdown goes from 0:00 to Ready without a one-frame jump in size and colour.
- [ ] With Reduce Motion on, the finish still works and nothing new moves; only fades remain.
- [ ] A Stopped Run, and a Run noticed late, still fade quickly to Ready, with no celebration.
- [ ] Checked in the browser at iPhone size in Glow and Bead, light and dark, with screenshots of 0:00 and of the hand-off to Ready.
