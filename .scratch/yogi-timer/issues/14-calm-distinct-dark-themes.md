# Calm, distinct dark themes

Status: resolved
Type: task
Blocked by: None (can start immediately)
Blocks: 15, 17

**What to build:** with the phone in dark mode, the Timer tab is calm in a dim room and the Theme selector does something you can see. Glow and Bead each have a dark version that looks like itself.

Found in the theme review of 2026-11-23:

- **The Presets glare at night.** The accent (the Presets' fill and the selected tab) is the same pale blue in dark as in light, at 11:1 against the dark page. In Ready the Presets are the brightest thing on screen, brighter than the countdown. That works against the spec's "calm look".
- **Glow and Bead look the same in dark.** Their page colours measure 1.00:1 against each other. During a Run, once the Presets step back, the only visible difference is the selected tab.
- **Bead's own blue is missing in dark.** Bead is "the lit beads' blue", and in light its lit beads match its accent. In dark, Bead's lit beads use Glow's darker blue.

- [x] In dark mode, the countdown is the strongest thing on the Timer tab. The Presets and the selected tab are clearly visible but no longer the brightest.
- [x] Text on the Presets and the selected tab stays at least 4.5:1 in both dark themes.
- [x] Glow dark and Bead dark can be told apart at a glance, in Ready and during a Run.
- [x] In Bead dark, the lit beads use Bead's blue, as they do in Bead light.
- [x] The status bar colour still matches each theme's page in dark mode.
- [x] The spec's description of the two themes still holds, or is updated to match.
- [x] Checked in the browser at iPhone size in both dark themes, in Ready, during a Run, and with "Tap again" showing, with screenshots.

## Comments

### 2026-11-23, done.

- **New dark palettes.** Only the dark tokens changed; light mode is untouched.
  - **Glow by night:** a near-neutral page, #15171e. The Presets and the selected tab are deep slate (#323d5e) with soft glow-blue text (#afc0ea), 5.9:1.
  - **Bead by night:** a deep indigo page, #111634. The Presets and the selected tab are a deep bead blue (#31428c) with #b8c6f3 text, 5.4:1. The lit beads use Bead's own blue, #93afed, now 5.0:1 against the unlit beads (up from 4.0).
- **The countdown now leads.**
  - The Preset fills went from the brightest surface on screen (luminance 0.63 in Glow, 0.43 in Bead) to deep tones (about 0.05 and 0.07).
  - Their numbers were softened too, to luminance 0.53 and 0.57, after the review pointed out they had outshone "Ready" (0.45).
  - During a Run, the digits are 0.85.
- **Glow and Bead now differ at a glance.** In OKLab ×100, the page difference went from 1.6 to 4.5, the surfaces from 1.2 to 5.5, and the accents to 13.2. Checked in Ready and during a Run.
- **"Tap again" is left bright on purpose.** The armed Preset still fills with the text colour. It is a 3-second confirmation that should catch the eye, and it is the only bright tile.
- **Status bar.** The dark status bar colours follow the new pages: Glow #15171e (the index.html default and the theme controller) and Bead #111634. Each copy now notes that it must stay in step with `--bg`.
- **Spec.** The spec's theme line now describes both themes by night.
- **Fixed on the way: the focus ring.** It was drawn in the accent colour, which this change made dark. It now uses the text colour: 9.5–10:1 on the selectors in all four themes. That also meets ticket 15's focus-ring criterion.
- **Checks.**
  - In the browser at iPhone size, in both dark themes: Ready, a Run with "Tap again", and the status bar meta. The Ready screenshots were retaken after the softer Preset text.
  - 82 tests pass and the build is clean.
- **Left from the code review:** each page colour is still written in three or four places (CSS, the theme controller, index.html, vite.config.js), as before. A test comparing them would catch drift if more themes are added.
