# Install guide

Status: ready-for-agent
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
- **It can be hidden.** A **×** on its left, away from Install so it isn't tapped by mistake: a 44 × 44 pt tap area with a light × about 14 pt across, read "Hide" by VoiceOver. Hiding it leaves a small **Install** pill in the top left corner, across from the gear, so the guide is still a tap away. The browser remembers it was hidden.
- **The banner is in English**, like the rest of the app.
- Inside the Home Screen app neither the banner nor the pill exists, so in class it costs nothing.

### The sheet

- The same sheet as Settings (`src/sheet/`), titled "Install Yogi Timer", with Done. It closes as Settings does. A Run started in Safari keeps counting behind it.
- **The steps, as iOS 26.5 shows them** (found in the Simulator: the share sheet hides Add to Home Screen behind "More"):
  1. Tap **Share** [share icon]. If you don't see it, tap **•••** first.
  2. Tap **Add to Home Screen** [plus-square icon]. If you don't see it, tap **More** [chevron] first.
  3. Keep **Open as Web App** [toggle] on, then tap **Add**.
  4. Open Yogi Timer from your Home Screen once while you're online, so it works offline. [The app icon with its name.]

  Use the exact labels iOS shows in English and in Spanish: read them from the screenshots when they are taken. The Spanish ones in iOS 26.5 are Compartir, Ver más, Agregar a Inicio, Abrir como app web and Agregar.
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

- [ ] In Safari on an iPhone, the banner shows at the top of Timer and History. In the Home Screen app it never shows, and nor does the pill.
- [ ] Install opens the sheet with the four steps, each with its icon and screenshot, and the notes under them.
- [ ] The × hides the banner, leaves the Install pill in the corner, and stays hidden after a reload. Its tap area is 44 × 44 pt and VoiceOver reads it "Hide".
- [ ] With the phone in Spanish the sheet and its screenshots are in Spanish; otherwise in English. The banner is in English either way.
- [ ] On an iPad the steps show without screenshots.
- [ ] In another browser the sheet asks to open the page in Safari, and Copy link copies the page's address.
- [ ] On a computer nothing shows.
- [ ] The Timer tab doesn't scroll in Safari with the banner showing, nor at 375 × 667 in the browser pane. The Presets stay where the thumb expects them.
- [ ] The screenshots are dark, cropped with no address, have the button circled, are WebP at 640 px wide and about 15 KB each, and aren't in the service worker's precache list (`dist/sw.js`).
- [ ] **Checked in the iOS Simulator by following the guide**, in English and in Spanish:
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
- The hidden banner is remembered under its own localStorage key, read through the same small seam, so tests don't need a browser.
- The banner, the pill, the sheet, the shrinking dial and the screenshots are checked in the browser pane at 375 × 667 and 402 × 874, then in the iOS Simulator as above.
- Real-phone checks are in [issue 20](20-real-iphone-acceptance-test.md).

## Comments
