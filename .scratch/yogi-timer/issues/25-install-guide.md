# Install guide

Status: resolved
Type: feature
Blocked by: None (can start immediately)
Blocks: 19

**What to build:** when Yogi Timer is opened in a browser on an iPhone or iPad, a banner at the top offers to install it. **Install** opens a sheet with the steps to add it to the Home Screen: each step is a short line with its icon and, under it, a real screenshot of Safari with the button to tap marked. Decided in the grilling session of 2026-11-25, after trying a [prototype](../prototypes/install-guide/index.html). Terms are in [GLOSSARY.md](../../../GLOSSARY.md) (Teacher, Home Screen app, History).

Until now the app had one Teacher, who would be shown how to install it once. It will now be shared with other teachers, who get only a link. Without a guide, most would keep it in a Safari tab, where it doesn't work offline and keeps a History apart from the Home Screen app's (see the notes from issue 01 in the [spec](../spec.md)). The glossary, the spec and [ADR 0001](../../../docs/adr/0001-static-home-screen-web-app.md) now say this.

## Decisions

### When it shows

- **Only on an iPhone or iPad, in a browser.** Never in the Home Screen app (`navigator.standalone`, or `display-mode: standalone`), and never on a computer or an Android phone. iPadOS presents itself as a Mac: tell it apart by its touch screen (`navigator.maxTouchPoints > 1`).
- **Safari gets the steps.** Any other browser on iOS (Chrome, Firefox, Edge, or the browser inside WhatsApp, Instagram, Gmail…) gets the same banner, but the sheet only says to open the page in Safari first, with a **Copy link** button. The browsers inside other apps usually can't add to the Home Screen at all, and other browsers each have their own menus.
- **The sheet never opens on its own.**

### The banner

- **Its own row at the top of both tabs**, above the dial on Timer and above the "History" heading on History, as Safari's own banner for App Store apps: the app icon, "Yogi Timer", "Add it to your Home Screen", and an **Install** button on the right.
- **The Timer tab still never scrolls** ([issue 21](21-timer-tab-never-scrolls.md)): while the banner shows, the Lotus dial shrinks to make room, and Safari's own toolbars leave less room than the Home Screen app does.
- **It can be hidden.** A **×** on its left, away from Install so it isn't tapped by mistake: a 44 × 44 pt tap area with a light × about 14 pt across, read "Hide" by VoiceOver. Hiding it leaves a small **Install** pill in the top left corner, across from the gear, so the guide is still a tap away. Hiding isn't remembered: a reload, or opening the page again, brings the banner back. (Changed on 2026-11-25 after the first build, which remembered it; see the last comment.)
- **The banner is in English**, like the rest of the app.
- Inside the Home Screen app neither the banner nor the pill exists, so in class it costs nothing.

### The sheet

- The same sheet as Settings (`src/sheet/`), titled "Install Yogi Timer", with Done. It closes as Settings does. A Run started in Safari keeps counting behind it.
- **The steps, as iOS 26.5 shows them** (found in the Simulator: the share sheet hides Add to Home Screen behind "More"):
  1. Tap **Share** [share icon]. If you don't see it, tap **•••** first.
  2. Tap **Add to Home Screen** [plus-square icon]. If you don't see it, tap **View More** [chevron] first. (In English the chevron reads "View More"; "More" is another button.)
  3. Keep **Open as Web App** [toggle] on, then tap **Add**.
  4. Open Yogi Timer from your Home Screen once while you're online, so it works offline. [The app icon with its name.]

  Use the exact labels iOS shows in English and in Spanish: read them from the screenshots when they are taken. In iOS 26.5 they are Share, View More, Add to Home Screen, Open as Web App and Add in English, and Compartir, Ver más, Agregar a Inicio, Abrir como app web and Agregar in Spanish.
- **Each step:** the line of text with its icon drawn in SVG, then its screenshot underneath. The text still makes sense if a detail of the menu changes.
- **Under the steps**, in quiet text:
  - Runs timed here in Safari stay in Safari: the Home Screen app keeps its own History.
  - Already added? Open Yogi Timer from your Home Screen.
  - Screens from iPhone, iOS 26.
- **On an iPad:** the same steps with their icons, **without screenshots**. Share sits at the top there and the menus differ, so iPhone screenshots would mislead.
- **In any other browser:** "Open this page in Safari first", the **Copy link** button, and nothing else.

### Language

- **The sheet follows the phone's language:** Spanish when `navigator.language` starts with `es`, English otherwise. That covers its title, the steps, the notes, Copy link, and the screenshots. The banner, the pill and the rest of the app stay in English.

### The screenshots

- **One set per language, in dark mode only**: 4 screenshots × English and Spanish.
- **Taken from the real app** in Safari (so the share sheet shows the Yogi Timer icon and name), **cropped** to the menu that matters, with no address (`127.0.0.1`) in view, and with the button to tap **circled**: Share, More, Add to Home Screen, then the Open as Web App toggle and Add.
- **WebP, quality 70, 640 px wide** (twice the width they show at). Measured on the prototype's screenshots: about 15 KB each and sharp on an iPhone, against 876 KB for the four as PNG. Loaded only when the sheet opens (`loading="lazy"`).
- **Kept out of the offline cache.** They live in their own folder, which the service worker's `globPatterns` leave out (`globIgnores`). They are only needed in a browser before installing, and the Home Screen app never shows them.
- **How to retake them** when iOS changes its menus:
  1. Use an iPhone Simulator (the iPhone 17e was used for the prototype), in dark mode (`xcrun simctl ui <device> appearance dark`).
  2. Set its language in Settings → General → Language & Region: English for one set, Español for the other.
  3. Open the dev server in Safari (`http://127.0.0.1:5173`) and walk the steps: •••, Share, More, Add to Home Screen. Take a screenshot at each.
  4. Crop each to its menu, without the address. Circle the button with ImageMagick. Save as WebP: `cwebp -q 70` after resizing to 640 px wide.
  5. Update the "iOS 26" note and any step text that changed.

## Acceptance criteria

- [x] In Safari on an iPhone, the banner shows at the top of Timer and History. In the Home Screen app it never shows, and nor does the pill.
- [x] Install opens the sheet with the four steps, each with its icon and screenshot, and the notes under them.
- [ ] The × hides the banner and leaves the Install pill in the corner; a reload brings the banner back. Its tap area is 44 × 44 pt and VoiceOver reads it "Hide". (All checked except VoiceOver itself: the label is in the page, but VoiceOver wasn't run.)
- [x] With the phone in Spanish the sheet and its screenshots are in Spanish; otherwise in English. The banner is in English either way.
- [x] On an iPad the steps show without screenshots. (Through the tests and in the browser pane; there was no iPad in the Simulator.)
- [x] In another browser the sheet asks to open the page in Safari, and Copy link copies the page's address. (Through the tests and in the browser pane; no other browser in the Simulator.)
- [x] On a computer nothing shows.
- [x] The Timer tab doesn't scroll in Safari with the banner showing, nor at 375 × 667 in the browser pane. The Presets stay where the thumb expects them.
- [x] The screenshots are dark, cropped with no address, have the button circled, are WebP at 640 px wide and about 15 KB each, and aren't in the service worker's precache list (`dist/sw.js`).
- [x] **Checked in the iOS Simulator by following the guide**, in English and in Spanish:
  - Open the app in Safari, read the banner, open the guide, and follow its steps literally until Yogi Timer is on the Home Screen.
  - Opened from its icon, the app shows no banner.
  - Screenshots of the banner, the sheet in each language, and the hidden banner's pill, in Glow and Bead, light and dark.

## Testing

- TDD for the decision of what to show, in a DOM-free module of its own: given whether the app is standalone, the user agent, `maxTouchPoints` and the language, it answers whether to show the guide, Safari steps or "open in Safari", screenshots or not, and in which language. Cases:
  - iPhone Safari;
  - iPhone Chrome (`CriOS`);
  - an in-app browser;
  - iPad as a Mac with touch;
  - a Mac;
  - Android;
  - the Home Screen app;
  - `es-MX` and `en-GB`.
- Hiding the banner lasts only while the page is open, so nothing is stored and the tests need no storage.
- The banner, the pill, the sheet, the shrinking dial and the screenshots are checked in the browser pane at 375 × 667 and 402 × 874, then in the iOS Simulator as above.
- Real-phone checks are in [issue 20](20-real-iphone-acceptance-test.md).

## Comments

### 2026-11-25, done.

- **What to show**, in `install_guide.js`, with no DOM. Given whether the app is standalone, the user agent, `maxTouchPoints` and the language, it answers:
  - `offer()`: "banner", "pill" or nothing;
  - `sheet`: the Safari steps or "open in Safari", screenshots or not, and "en" or "es".
  - `hide()` kept the hidden banner under `yogi-timer.install-banner`. (No longer: see the last comment.)
  - 27 tests through that interface: every case the ticket lists, plus Firefox, Edge, the Google app, Facebook's browser, an app's own web view, Windows, a touch-screen Windows laptop, storage that refuses writes and storage that can't be read.
- **The page.**
  - `install_controller.js` marks `<html data-install="banner|pill">` and marks the sheet with its steps, its screenshots and `lang`.
  - The banner and the pill are on both tabs.
  - The sheet is the Settings sheet's controller registered again as `guide`. English and Spanish are both in `index.html`, and CSS shows the one matching the phone.
  - The icons, step 3's switch included, are SVG `<symbol>`s.
- **The layout.**
  - The banner takes the top row of both tabs, and the gear moves under it, still level on both tabs.
  - The Lotus dial gives up exactly the banner's row (`--above-lotus`), so the Presets don't move at any height. On a tall screen, where the dial is limited by the screen's width, it shrinks a little more than room alone would need.
  - The Timer tab's row gap is one token, `--row-gap`, shared with `--under-lotus`.
  - The pill sits in the top left corner, level with the gear. On History, while it shows, the pill and the gear share the top row and the "History" heading moves under them, so they are in the same place on both tabs.
  - On a narrow phone the banner's second line wraps; the 56 px banner has room.
- **The screenshots**, in `public/install/` (`en-1…4`, `es-1…4`).
  - Taken in the iPhone 17 Simulator (iOS 26.5), dark, from the real app in Safari.
  - Each is cropped to its menu, the address is covered with the colour beside it, and the button is circled in orange.
  - WebP q70, 640 px wide, 9.5–15 KB each. They load only when the sheet opens, and only the ones for that language.
  - `globIgnores` keeps them out of `dist/sw.js`. It's already true because `globPatterns` has no `.webp`.
- **Found while taking them:** in English the chevron reads **View More** ("More" is another button). The decisions above now say so, and step 2 uses it.
- **The shared sheet (`src/sheet/`) changed in three ways, which Settings gets too.** All three came from the Simulator.
  - The header stays at the top while a long sheet scrolls, so Done is always in reach.
  - The sheet opens scrolled to the top.
  - After a finger's tap the sheet itself takes focus, so iOS draws no ring on Done. From the keyboard or VoiceOver, focus still goes to Done.
- **Checked in the browser pane** at 375 × 667 and 402 × 874, with 0 and 8 Runs, with the banner, the pill and neither.
  - The Timer tab doesn't scroll.
  - The Presets stay at 374 px and 464 px.
  - The gear is at 79 px under the banner on both tabs.
  - The pill's middle is level with the gear's.
  - The × is 44 × 44 px.
  - The pane presents itself as Android at phone sizes and as a computer otherwise, and nothing shows in either.
  - The iPad and other-browser sheets were forced on: no screenshots on an iPad, and none downloaded; Copy link reports "Enlace copiado".
- **Checked in the iOS Simulator** (iPhone 17), in Safari, with real taps.
  - In English and in Spanish, the guide was followed step by step until Yogi Timer was on the Home Screen. Opened from its icon, the app showed no banner and no pill.
  - The × left the pill, and the pill stayed after a reload. (Before the change in the last comment.)
  - The Spanish sheet has Spanish screenshots, and the banner stays in English.
  - Screenshots: [Glow dark, banner](25-install-guide/glow-dark-banner.png), [Glow dark, History with the banner](25-install-guide/glow-dark-history-banner.png), [Glow light, banner](25-install-guide/glow-light-banner.png), [Glow light, pill](25-install-guide/glow-light-pill.png), [Glow light, History with the pill](25-install-guide/glow-light-history-pill.png), [Glow dark, guide in English](25-install-guide/glow-dark-guide-en.png), [Glow dark, guide in Spanish](25-install-guide/glow-dark-guide-es.png), [Bead light, guide in Spanish](25-install-guide/bead-light-guide-es.png), [Bead dark, pill](25-install-guide/bead-dark-pill.png), [the Home Screen app, no banner](25-install-guide/home-screen-app-no-banner.png).
  - Two Yogi Timer icons were added to that Simulator's Home Screen.
- **Not checked:**
  - VoiceOver ("Hide", focus moving to the pill after the ×).
  - Whether the banner shows for a moment before the page is drawn.
  - The banner in Bead (its colours are the same tokens as the pill's).
- **Can't be told apart:** an app's browser built on Safari's own view (which WhatsApp and Gmail often use) sends Safari's user agent. It gets the Safari steps even though it may not offer Add to Home Screen. iPhone Safari with "Request Desktop Website" on looks like an iPad, so it gets the steps without screenshots.
- **Leftovers:**
  - The banner's markup is written twice in `index.html`, once per tab, as the gear is.

### 2026-11-25, the × is no longer remembered.

- **Why:** asked for after trying the app in the Simulator, where once hidden the banner came back only by clearing Safari's data.
- **What changed:**
  - `hide()` hides the banner, leaving the pill, only until the page is opened again. A reload brings the banner back.
  - `createInstallGuide` no longer takes `storage`, and nothing is written to localStorage. A `yogi-timer.install-banner` left by the first build is simply ignored.
  - The tests drop from 27 to 24: the three that tested the stored value (its own key, a refused write, an unreadable storage) went with it, and "is remembered" became "is forgotten the next time the page opens".
- **Checked in the iOS Simulator** (iPhone 17, Safari, the same page where the first build had saved the banner as hidden): the banner showed, the × left the pill, and reloading brought the banner back.
