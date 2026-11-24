# Calm, distinct dark themes

Status: ready-for-agent
Type: task
Blocked by: None (can start immediately)
Blocks: 15, 17

**What to build:** with the phone in dark mode, the Timer tab is calm in a dim room and the Theme selector does something you can see. Glow and Bead each have a dark version that looks like itself.

Found in the theme review of 2026-11-23:

- **The Presets glare at night.** The accent (the Presets' fill and the selected tab) is the same pale blue in dark as in light, at 11:1 against the dark page. In Ready the Presets are the brightest thing on screen, brighter than the countdown. That works against the spec's "calm look".
- **Glow and Bead look the same in dark.** Their page colours measure 1.00:1 against each other. During a Run, once the Presets step back, the only visible difference is the selected tab.
- **Bead's own blue is missing in dark.** Bead is "the lit beads' blue", and in light its lit beads match its accent. In dark, Bead's lit beads use Glow's darker blue.

- [ ] In dark mode, the countdown is the strongest thing on the Timer tab. The Presets and the selected tab are clearly visible but no longer the brightest.
- [ ] Text on the Presets and the selected tab stays at least 4.5:1 in both dark themes.
- [ ] Glow dark and Bead dark can be told apart at a glance, in Ready and during a Run.
- [ ] In Bead dark, the lit beads use Bead's blue, as they do in Bead light.
- [ ] The status bar colour still matches each theme's page in dark mode.
- [ ] The spec's description of the two themes still holds, or is updated to match.
- [ ] Checked in the browser at iPhone size in both dark themes, in Ready, during a Run, and with "Tap again" showing, with screenshots.
