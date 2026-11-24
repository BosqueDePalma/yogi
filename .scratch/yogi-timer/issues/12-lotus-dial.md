# Lotus dial

Status: resolved
Type: feature
Blocked by: 08
Blocks: 17

The Timer tab's countdown gets a picture: a mala of 108 beads that light up blue one by one around a pink lotus that blooms over the Run. A blue lotus tassel hangs from the guru bead and opens when the Run completes. The animation is the user's own design, kept in [prototypes/lotus-dial/mala-demo.html](../prototypes/lotus-dial/mala-demo.html). Decided in the grilling session of 2026-11-23.

## Decisions

- **The Run drives the picture.** It shows how far the Run has gone and nothing else: no loop and no clock of its own. Reopening the app mid-Run jumps straight to the right point (60 % of the way through a 10-minute Run after 6 minutes). A new Run or a Replace starts it from the beginning. It fits every Preset (1, 2, 3, 5 and 10 minutes) by stretching the demo's 90-second timeline to the Preset's length.
- **The numbers stay.** The m:ss countdown sits large in the middle of the lotus, still readable from across the room, with `role="timer"`. The picture goes with the numbers and never replaces them.
- **At zero:** the Chime plays once and the celebration runs for 4 s (the tassel opens, three ripples and a blue glow) while "0:00" shows. This takes the place of today's 0:00 pulse and lasts as long. Then the picture fades to Ready in about 2 s. It never starts over.
- **Ready:** every bead unlit (pink), the tassel closed and still, and Om (ॐ) in the middle with the word "Ready" below it, as drawn in option A of [prototypes/lotus-dial/ready-symbols.html](../prototypes/lotus-dial/ready-symbols.html). The tassel sways only during a Run.
- **Stop and Mis-tap:** the lotus and beads fade out quickly (about 0.6 s) with no ripples, no tassel and no glow, then Ready. A Stopped Run never looks Completed.
- **Completed while the app was away:** straight to Ready with no celebration, the same as no late Chime.
- **Colours:** the lotus keeps its pink, blue and gold as colours of its own, written as CSS tokens, with a dark-mode set (softer petals on a dark background). Petal outlines use the page background (`var(--bg)`) instead of a fixed `#fff7f4`. The rest of the app stays cream and amber for now. The light and dark values to start from are in that prototype's `.theme-light` and `.theme-dark`.
- **Layout:** the dial replaces today's `.dial` and spans the width at the top. Below it come Stop, the Presets and the Chime selector, with "This lesson" further down (it can scroll). Check it at 375×667 (iPhone SE).
- **Reduced motion:** with `prefers-reduced-motion`, beads and petals appear with a plain fade: no bounce, no sway, no ripples. Progress still shows.
- **Wording:** the accessible label says "when the Run completes", not "round" (see GLOSSARY).
- **Battery:** about 150 animated SVG elements for up to 10 minutes with the screen kept awake. Accepted for now; checked in the real-iPhone test ([issue 18](18-real-iphone-acceptance-test.md)). Fallback if it drains or stutters: redraw on the 250 ms tick instead of every frame.

## Ready symbol

Chosen on 2026-11-23: **A. Om (ॐ)**, the sound most classes open (and close) with, and the best-known "beginning" sign in yoga. Draw it as a fixed SVG path taken from Noto Sans Devanagari (SIL Open Font License), not as text, so it looks the same on every phone and needs no system font. Its colour is the deepest petal pink.

The other options, not chosen:

- **B. Lotus bud with a golden bindu:** the closed flower the Run will open. The bindu is the point everything starts from. Ties straight into the bloom.
- **C. Rising sun:** Surya Namaskar (sun salutation), the sequence many practices start with.

## Comments

**2026-11-23, done.**

- **Tested seam** (agreed with the user): `timer_screen.view(now).dial` is `{ preset, elapsedMs }` during a Run and through the 4 s celebration, and null in Ready. Four new tests cover jumping to the right point (6 of 10 min), the celebration, a Run completed while away, Replace and Stop. 81 tests pass and the build works.
- **Drawing:** `src/lotus_dial.js`, `createLotusDial(svg, { reducedMotion })` returns `{ update(dial, mode), destroy }`. One timeline of Web Animations per Run, from its start through the 4 s celebration and the 2 s fade. It seeks to `elapsedMs`, and again whenever the picture is more than 300 ms off (after the app was hidden). A Run whose `elapsedMs` goes down, or whose Preset changes, is a new Run. The timer controller calls `update` from `render`.
- **Om** is a fixed SVG path from Noto Sans Devanagari (OFL 1.1, credited in `lotus_dial.js`). Taken with opentype.js from `@fontsource/noto-sans-devanagari@5.1.0`; neither is a dependency of the app.
- **Colours:** `--lotus-*` tokens in `base.css`, light and dark, from the prototype. The old blinking 0:00 is gone; 0:00 shows in lotus blue during the celebration.
- **Checked in the browser** at 375×667, light and dark: Ready with Om, jumping to 60 % of a 10-minute Run, one Chime at zero, the celebration, fading back to Ready at about +6 s with every Run element removed, Stop fading in about 0.6 s, Replace starting the bloom over, and a Run noticed late showing no celebration and no Chime. With `reducedMotion`, no animation moves anything (opacity only), there are no ripples and no sway. No console errors.
- **Checked in the iOS Simulator** (Safari on iPhone 17, dev server): Ready with Om, a 1-minute Run blooming smoothly, the Chime at zero (audio indicator), and back to Ready with the Run in "This lesson".
- **Differs from the decisions:** a Run noticed late fades out in 0.6 s like a Stop, instead of vanishing at once. There is still no celebration and no Chime.
- **Known, left for the real-iPhone test (issue 18):** the re-seek when the picture drifts more than 300 ms may fire often if iOS throttles frames (Low Power Mode). Reduce Motion is read when the app opens, so switching it needs a reopen.
