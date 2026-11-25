# A lotus icon in the app's colours

Status: resolved
Type: feature
Blocked by: None (can start immediately)
Blocks: 19

**What to build:** a new Home Screen icon that matches the app as it looks today. The current icon is a brown and gold singing bowl on a sand background (`#f3ece1`), from before the Lotus dial and the Glow and Bead Themes. Nothing in the app is brown any more, and the bowl appears nowhere in it. Decided on 2026-11-25.

## Decisions

- **The drawing:** the pink lotus inside the blue ring of the mala, the same picture as the Lotus dial, simplified so it reads at Home Screen size (about 60 px). Few beads, or a solid ring, and no thin strokes or small details that turn to mush when small. The tassel can be left out if it doesn't read. Colours come from the Lotus dial's palette.
- **The background:** dark blue, Bead's dark page colour `#111634`, with the disc in Bead's dark surface `#1a2049`. Changed from Glow's pale page (`#f4f7fe`) after the first version, at the user's request: the pale lotus barely stood out on it. There's one icon: it doesn't change with the Theme or dark mode. The manifest's `theme_color` and `background_color` stay Glow's page colour, since they colour the app's own launch screen.
- **iOS 26's dark and tinted icons:** web apps can't supply their own dark icon. Accepted, and checked in the Simulator. (It turned out iOS 26.5 leaves web app icons as they are in dark mode, and only tints them when tinted icons are chosen.)
- **Maskable:** the drawing stays inside the maskable safe zone (the middle 80 %), so no platform crops it.

## Things to change with it

- `public/icon.svg`, then `npm run icons` to regenerate the PNGs and `favicon.ico`.
- The background in `pwa-assets.config.js` (`#f3ece1` → `#111634`) and its comment.
- **The install guide's screenshots** `public/install/en-4.webp` and `es-4.webp` show the old icon on the "Add to Home Screen" screen. Retake them in the Simulator, as in [issue 25](25-install-guide.md), at the same size and quality. Check the other screenshots too.
- The spec's line about the icon.
- **iOS caches a Home Screen icon.** To see the new one, the app has to be removed and added again. The same goes for the Teacher's phone: say so when the app goes live ([issue 19](19-github-pages-hosting.md)).

## Acceptance criteria

- [x] The icon shows the pink lotus in the blue mala on a dark blue background, and it reads clearly at Home Screen size.
- [x] The PNGs, the maskable icon, the Apple touch icon and the favicon are regenerated from the new SVG. No sand background remains anywhere (`#f3ece1`).
- [x] The install guide's screenshots show the new icon, in English and in Spanish.
- [x] The spec describes the new icon.
- [x] **Checked in the iOS Simulator:** the app removed and added again from Safari, then the icon looked at on the Home Screen in light mode, dark mode and tinted, beside other apps. Screenshots in the done comment.

## Testing

No code rules change, so there's no TDD. The icon is checked by eye: in the browser at 60 px and at 512 px, then on the Simulator's Home Screen.

## Comments

### 2026-11-25, done.

- **The icon**, in `public/icon.svg`.
  - The Lotus dial, simplified: 4 rings of pink petals (12, 12, 8, 8) on the white disc, inside a ring of 36 blue beads and a larger guru bead at the bottom. The tassel is left out.
  - The petals and beads use the light `--lotus-*` tokens. The background, disc and thread use Bead's dark page, surface and accent (`#111634`, `#1a2049`, `#31428c`). The SVG's comment maps each hex to its token.
  - Everything stays within 191 px of the centre, inside the maskable safe zone (205 px).
- **The PNGs and the favicon** were regenerated with `npm run icons`. `pwa-assets.config.js` uses the new background, and `#f3ece1` appears nowhere outside the tickets.
- **The install guide's screenshots.** Only steps 2 and 4 showed the icon.
  - The new icon was captured in the Simulator from Safari's real share sheet and its real "Add to Home Screen" screen, in Spanish and dark mode. That tile replaced the old one in `en-2`, `es-2`, `en-4` and `es-4`.
  - The rest of each screenshot is unchanged. Only the icon was taken from the new captures, because they now show the address (`127.0.0.1`) under the name, and the guide's screenshots leave it out.
  - Saved as WebP q70 at the same size, 13–15 KB each.
- **Checked in the iOS Simulator** (iPhone 17).
  - Added from Safari next to the old bowl icons.
  - At Home Screen size it reads clearly in light and dark mode. iOS doesn't darken web app icons in dark mode.
  - When tinted, it stays a clear light lotus on blue. The old bowl icons fade to almost nothing.
  - Screenshots: [light](27-lotus-icon/home-light.png), [dark](27-lotus-icon/home-dark.png), [tinted](27-lotus-icon/home-tinted.png).
- **Review:** on Glow's pale background the lotus was pale (light pink on a near-white disc). At the user's request the background became dark blue, and the lotus now stands out clearly, tinted too. The 3 px thread around the disc vanishes when small and is harmless.
- **Tests:** 168 pass, and the build succeeds.
