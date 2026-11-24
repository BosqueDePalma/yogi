# Settings sheet

Status: resolved
Type: feature
Blocked by: None (can start immediately)
Blocks: 19

**What to build:** the Chime and Theme selectors leave the Timer tab and move into a **Settings** sheet. A gear button at the top right of both tabs opens it. Settings is used rarely, so this leaves the Timer tab with only the dial, Stop, the Presets and "This lesson". Decided in the grilling session of 2026-11-24.

## Decisions

- **How it opens:** a gear button at the top right, in the same place on the Timer and History tabs, labelled "Settings" for VoiceOver. It sits below the notch and status bar (`env(safe-area-inset-top)`). On History it shares a line with the "History" heading. Being far from the thumb is on purpose: the Teacher won't hit it by mistake in class.
- **What it is:** a bottom sheet that slides up from the bottom edge, as on iOS, not a side drawer. It has a grabber bar at the top, the title "Settings" and a "Done" button at the top right, where the gear was.
- **Height:** as tall as its content with natural spacing, so on a regular iPhone its top edge sits just below the Presets and the countdown stays in view. On a small phone (iPhone SE, mini) it may rise over the Presets as far as it needs, up to 90 % of the screen, and the content scrolls inside it if it still doesn't fit.
- **It covers the tab bar.** It comes up from the bottom edge, over the tab bar, and keeps the space the home indicator needs (`env(safe-area-inset-bottom)`).
- **Closing:** any of three ways: swipe it down, tap the dimmed backdrop, or tap "Done". Escape closes it too, which `<dialog>` gives for free.
- **The backdrop catches taps.** Tapping a Preset that shows above the sheet only closes the sheet. It never starts or Replaces a Run.
- **During a Run:** it can be opened at any time. The Run keeps counting behind it, and the Chime at zero still plays with the sheet open.
- **Contents, top to bottom:**
  1. **Chime** selector (Bowl, Tingsha, Gong): it works as it does today. With no Run going, choosing one plays it once as a preview. During a Run it switches quietly.
  2. **Theme** selector (Glow, Bead): it works as it does today, and the page behind the sheet changes colour straight away.
  3. A quiet **version** line at the bottom: the build date and short commit, for example "Version 24 Nov 2026 · 304be28". The date means something to the Teacher; the commit tells us what the phone has installed. Vite injects both at build time.
- **Timer tab after the move:** the dial grows into the space the selectors leave, and the Presets stay where they are today, so the Teacher's thumb still finds them. Check at 375×667 (iPhone SE) and 402×874 (iPhone 17).
- **Animation:** it slides up in about 300 ms and slides back down on close. With Reduce Motion on, it only fades.

## A sheet to reuse

The sheet is its own module, built so it can be dropped into another app:

- A native `<dialog>` opened with `showModal()`. That gives the top layer, the backdrop, focus kept inside, Escape and the dialog role at no cost.
- A Stimulus controller (`sheet_controller.js`) adds what `<dialog>` lacks: swipe down to close (following the finger, closing past a threshold or on a quick flick, otherwise springing back), a tap on the backdrop, and the open and close animations. Its actions are `open` and `close`, and it dispatches `sheet:opened` and `sheet:closed`.
- Its own stylesheet (`sheet.css`), with its colours, radius and spacing as CSS custom properties that Yogi Timer sets from its theme tokens.
- They live together in their own folder and import nothing from Yogi Timer. A short comment at the top says how to use them in another app.
- Not a Web Component: Safari doesn't support extending `<dialog>` (`is="…"`), so wrapping one would mean more code for no gain here.

## Things to keep working

- **Unlocking audio after a reopen.** Today any tap on the Timer tab unlocks audio when the app was reopened mid-Run (the chime controller listens on the Timer panel). Taps in the sheet must do the same, so the Chime still plays at zero if the Teacher's first tap after a reopen is the gear.
- **The status bar** keeps following the Theme. The sheet's backdrop must not leave it the wrong colour.
- **Wake lock** and the countdown carry on while the sheet is open.

## Acceptance criteria

- [x] The Timer tab no longer shows the Chime or Theme selector; the dial is bigger and the Presets haven't moved.
- [x] The gear opens Settings from the Timer tab and from the History tab.
- [x] Settings closes by swiping down, by tapping the backdrop, by tapping "Done" and with Escape. A short swipe that doesn't pass the threshold springs back.
- [x] Tapping a Preset above the open sheet only closes the sheet; no Run starts and none is Replaced.
- [x] Choosing a Chime with no Run going previews it once; during a Run it switches quietly and that Chime plays at zero. The choice survives a reopen.
- [x] Choosing a Theme changes the page behind the sheet straight away, the status bar included, and survives a reopen. (Accepted: the status bar catches up when the sheet closes; see the done comment.)
- [x] A Run keeps counting while Settings is open, and the Chime plays at zero with the sheet still open.
- [x] After the app is reopened mid-Run, opening Settings counts as the tap that unlocks audio.
- [x] The version line shows the build date and the short commit.
- [x] On a regular iPhone the sheet's top edge sits below the Presets. On iPhone SE it may cover them and still fits on the screen, scrolling inside if needed.
- [ ] With Reduce Motion on, it fades instead of sliding.
- [ ] VoiceOver reads the gear as "Settings", focus moves into the sheet when it opens and back to the gear when it closes.
- [x] The sheet's files import nothing from the rest of the app.
- [x] Looks calm in Glow and Bead, light and dark.
- [x] Checked in the browser pane at iPhone size.
- [x] **Checked in the iOS Simulator as the installed PWA:** in the Simulator's Safari open the Vite dev server on `localhost`, Share → Add to Home Screen, then launch it from the icon. Check the gear clears the notch, the sheet clears the home indicator, swipe-down works with a real touch drag, and the steps above behave the same. Screenshots in the done comment.

## Comments

### 2026-11-24, done.

- **The sheet**, in `src/sheet/`. It imports nothing from Yogi Timer.
  - `sheet_controller.js` wraps a native `<dialog>` opened with `showModal()`.
  - `sheet.css` sets the colours, radius, spacing and duration as `--sheet-*` properties.
  - `swipe.js` follows the finger and decides on lift (8 tests in `swipe.test.js`):
    - 8 px of wobble is still a tap.
    - It never moves above its open position.
    - A slow drag past 30 % of the sheet's height closes it; a shorter one springs back.
    - A flick of more than 0.5 px/ms closes it.
    - A finger that rests before lifting springs back.
    - Moving up at lift springs back.
  - The controller adds:
    - swipe down to close;
    - a backdrop tap to close;
    - Escape slides it down;
    - a 600 ms fallback, because animations stall while the page isn't drawn;
    - a guard that stops the drag's click from choosing the option it ends on.
  - When the content is too tall and scrolls, only the grabber and the header drag the sheet.
  - Focus moves into the sheet on open (to Done). On close it goes back to the gear when the sheet was opened from the keyboard or VoiceOver (a click with no pointer behind it). After a finger tap nothing is focused, so iOS draws no ring.
- **The app.**
  - There is one gear `<symbol>` with a button on each tab, 4 px below the safe area. On History it shares a line with the heading, so the heading moved up about 20 px.
  - The chime controller moved to `<body>`, so it reaches the selector in the sheet. Every tap in the app now unlocks audio after a reopen, the gear and the sheet included.
  - `--sheet-backdrop` comes from a new `--scrim` token, deeper in dark mode.
  - The version line is `%VITE_APP_VERSION%`. `vite.config.js` fills it in from the build date (`en-GB`) and `git rev-parse --short HEAD`.
- **The bigger dial.** The lotus was already as wide as the screen at 375 and 402. To grow it, the viewBox is cropped to the drawing (`-262 -256 524 556`), which makes it about 14 % bigger, and the gaps around it are tighter.
  - The Presets' top edge is at 435 px at 375×667, the same as before, and 464 px at 402×874, 2 px lower than the 462 px before.
  - The countdown keeps its place and its size relative to the lotus.
- **Checked in the browser pane** at 375×667 and 402×874:
  - The sheet top is at 433 px on the SE, over the top edge of the Presets, and at 640 px on the iPhone 17, below them.
  - The backdrop, Done and Escape each close it, and focus returns.
  - A Preset tapped above the open sheet only closes it.
  - A Chime previews with no Run going, and switches quietly during one.
  - A Run reaches zero with the sheet open and the Chime rings (`timer:ring`, plus one audio graph).
  - The Theme changes the page and the theme-color metas, and is saved.
  - A drag closes it, and a drag that starts on Bowl doesn't choose Bowl.
  - Tapping the History gear after a reopen mid-Run unlocks audio.
- **Checked in the iOS Simulator** (iPhone 17) as the installed PWA, from `http://127.0.0.1:5173`:
  - The gear clears the Dynamic Island, and the sheet clears the home indicator.
  - Real touch drags behave as designed: a short slow drag springs back, a long one closes, and a flick closes.
  - Bead dark during a Run, Bead light at 0:00 (the Chime rang, shown in the Dynamic Island), and Glow dark all look calm.
  - Screenshots: [Glow dark](17-settings-sheet/glow-dark-ready.png), [Bead dark, Run](17-settings-sheet/bead-dark-run.png), [Bead light, 0:00](17-settings-sheet/bead-light-zero.png).
- **Not met: the status bar while the sheet is open.** While a modal `<dialog>` is open, iOS keeps the status bar colour it had when the sheet opened. A Theme chosen in the sheet changes the page straight away, but the status bar only catches up when the sheet closes ([screenshot](17-settings-sheet/status-bar-held.png)). Two fixes didn't help: moving the backdrop below the safe area, and re-presenting the dialog after the change. The way around it would be a non-modal dialog with a hand-made backdrop and `inert`, which gives up what `showModal()` provides. The user accepted the lag on 2026-11-24: the sheet stays modal, and the status bar catches up on close.
- **Not checked on a device: Reduce Motion.** The rules parse, and they fade instead of sliding. The Simulator's Settings app wouldn't respond to taps, so I couldn't turn Reduce Motion on.
- **Not checked: VoiceOver.** Leave it for the real-iPhone test (ticket 20).
- **Leftovers:**
  - `data-scrolls` is measured only when the sheet opens.
  - The lotus crop lives in three places: the viewBox in `index.html`, the percentages in `base.css`, and the comment in `lotus_dial.js`.
