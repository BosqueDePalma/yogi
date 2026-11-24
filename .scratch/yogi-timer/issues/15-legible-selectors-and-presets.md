# Selectors and Presets stay legible in every theme

Status: ready-for-agent
Type: task
Blocked by: 14
Blocks: 17

**What to build:** in Glow and Bead, light and dark, the Teacher can always tell which Chime and which Theme are chosen, and can always see where the Presets are during a Run.

It waits for issue 14 because these contrasts are measured against the final dark palette.

Found in the theme review of 2026-11-23:

- **The chosen option is hard to spot in dark.** In the Chime and Theme selectors, the chosen option is *darker* than the selector behind it (1.36:1), the reverse of iOS. Its drop shadow is black, so it can't be seen on a dark page.
- **Unchosen labels are a little faint.** In light mode, the names of the options not chosen ("Tingsha", "Gong", "Bead") are 4.2–4.4:1, just under the 4.5:1 recommended for normal text.
- **The Presets almost vanish during a Run in light mode.** Their fill is 1.06:1 against the page and their outline 1.18:1, so the buttons barely show.
- **The focus ring is faint.** In Glow light it is 1.5:1; outlines need 3:1.
- **The two selectors don't line up.** "CHIME" and "THEME" are different widths, so the two option groups start at slightly different places.

- [ ] In all four themes, the chosen Chime and Theme option stands out from its selector at a glance, and is lighter than the selector in dark mode, as on iOS.
- [ ] Unchosen option labels are at least 4.5:1 against the selector in all four themes.
- [ ] During a Run in light mode, each Preset's outline is clearly visible: at least 3:1 against the page.
- [ ] The keyboard focus ring is at least 3:1 against what is around it in all four themes.
- [ ] The Chime and Theme option groups line up with each other.
- [ ] Checked in the browser at iPhone size in all four themes, with the contrast figures noted in the ticket's done comment.
