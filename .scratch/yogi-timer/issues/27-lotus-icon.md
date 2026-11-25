# A lotus icon in the app's colours

Status: needs-triage
Type: feature
Blocked by: None (can start immediately)
Blocks: 19

**What to build:** a new Home Screen icon that matches the app as it looks today. The current icon is a brown and gold singing bowl on a sand background (`#f3ece1`), from before the Lotus dial and the Glow and Bead Themes. Nothing in the app is brown any more, and the bowl appears nowhere in it. Decided on 2026-11-25.

## Decisions

- **The drawing:** the pink lotus inside the blue ring of the mala, the same picture as the Lotus dial, simplified so it reads at Home Screen size (about 60 px). Few beads, or a solid ring, and no thin strokes or small details that turn to mush when small. The tassel can be left out if it doesn't read. Colours come from the Lotus dial's palette.
- **The background:** Glow's page colour, `#f4f7fe`, which is already the manifest's `theme_color` and `background_color`. There's one icon: it doesn't change with Bead or dark mode.
- **iOS 26's dark and tinted icons:** web apps can't supply their own dark icon, so iOS darkens ours itself. Accepted, and checked in the Simulator.
- **Maskable:** the drawing stays inside the maskable safe zone (the middle 80 %), so no platform crops it.

## Things to change with it

- `public/icon.svg`, then `npm run icons` to regenerate the PNGs and `favicon.ico`.
- The background in `pwa-assets.config.js` (`#f3ece1` → `#f4f7fe`) and its comment.
- **The install guide's screenshots** `public/install/en-4.webp` and `es-4.webp` show the old icon on the "Add to Home Screen" screen. Retake them in the Simulator, as in [issue 25](25-install-guide.md), at the same size and quality. Check the other screenshots too.
- The spec's line about the icon.
- **iOS caches a Home Screen icon.** To see the new one, the app has to be removed and added again. The same goes for the Teacher's phone: say so when the app goes live ([issue 19](19-github-pages-hosting.md)).

## Acceptance criteria

- [ ] The icon shows the pink lotus in the blue mala on Glow's background, and it reads clearly at Home Screen size.
- [ ] The PNGs, the maskable icon, the Apple touch icon and the favicon are regenerated from the new SVG. No sand background remains anywhere (`#f3ece1`).
- [ ] The install guide's screenshots show the new icon, in English and in Spanish.
- [ ] The spec describes the new icon.
- [ ] **Checked in the iOS Simulator:** the app removed and added again from Safari, then the icon looked at on the Home Screen in light mode, dark mode and tinted, beside other apps. Screenshots in the done comment.

## Testing

No code rules change, so there's no TDD. The icon is checked by eye: in the browser at 60 px and at 512 px, then on the Simulator's Home Screen.
