# Selectors and Presets stay legible in every theme

Status: resolved
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

- [x] In all four themes, the chosen Chime and Theme option stands out from its selector at a glance, and is lighter than the selector in dark mode, as on iOS.
- [x] Unchosen option labels are at least 4.5:1 against the selector in all four themes.
- [x] During a Run in light mode, each Preset's outline is clearly visible: at least 3:1 against the page.
- [x] The keyboard focus ring is at least 3:1 against what is around it in all four themes.
- [x] The Chime and Theme option groups line up with each other.
- [x] Checked in the browser at iPhone size in all four themes, with the contrast figures noted in the ticket's done comment.

## Comments

- 2026-11-23: the focus-ring criterion was met in issue 14. The ring now uses the text colour, 9.5–10:1 on the selectors in every theme; check it still holds after this ticket's changes. Issue 14 also made the selected tab's fill deep in dark mode (1.4–1.7:1 against the tab bar). Its text still marks it, but look at it alongside the selectors here.

### 2026-11-23, done.

All contrast figures are WCAG ratios, given as Glow light / Bead light / Glow dark / Bead dark.

- **The chosen option stands out.**
  - The selectors now have their own background, `--selector-track`. The chosen option has `--selector-chosen`.
  - In light mode the chosen option is the white surface: 1.40 / 1.45 against the track, up from 1.24 / 1.29. Its dark text (11.9 / 13.3) and its small shadow do most of the work, as in iOS's own control.
  - In dark mode the chosen option is now *lighter* than the track, as on iOS: 1.59 / 1.76, with text at 6.5 / 5.4. The black shadow, invisible there, is dropped.
- **Unchosen labels pass 4.5:1.** In light mode `--muted` is darker (Glow #4f5b87, Bead #4a5681). Against the selector: 4.64 / 4.72 / 4.99 / 5.36.
  - The darker grey also applies to the other muted text in light mode: unselected tab labels, headings, the History hint and totals, and stopped Runs. All of them get more contrast, and none gets worse.
  - The cost is a little less difference between muted and normal text (1.8–2.0 instead of 2.3). Stopped Runs still say "stopped" in words.
- **Presets show their outline during a Run.** A new `--edge` token draws outlines for controls that stand on the page: 3.36 / 3.33 / 3.50 / 3.50 against the page, up from 1.18–1.55.
- **The Stop button uses the same outline.** It sits right above the Presets and had the same faint border, so it was changed too. This goes slightly beyond the ticket. The History tab's delete button keeps `--line`, because it sits inside a card, not on the page.
- **Focus ring.** Unchanged since issue 14: it uses the text colour, at 9.5–10.3 on the selectors and at least 5.4 next to the chosen option.
- **Alignment.** The CHIME and THEME headings share a minimum width of 4.2em. Both option groups now start at 85.1 px and are 273.9 px wide at 375 px. It is em-based, so it follows the text size; to be confirmed with SF on the iPhone (issue 18).
- **Bug found during the check, then fixed.** One alias made Bead dark take Bead light's selector background: the theme block outranks the generic dark block. Bead dark now restates it. The computed colours were then checked in all four themes.
- **Checks:**
  - In the browser at iPhone size: light Glow and Bead during a Run; dark Glow and Bead in Ready and during a Run, with screenshots.
  - Computed colours of the selectors checked in all four themes.
  - 82 tests pass and the build is clean.
- **Left from the code review:** the Theme heading still uses the class `.chime-heading`. The name is misleading, but that is older than this change.
