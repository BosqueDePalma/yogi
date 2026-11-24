# Settings sheet

Status: ready-for-agent
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

- [ ] The Timer tab no longer shows the Chime or Theme selector; the dial is bigger and the Presets haven't moved.
- [ ] The gear opens Settings from the Timer tab and from the History tab.
- [ ] Settings closes by swiping down, by tapping the backdrop, by tapping "Done" and with Escape. A short swipe that doesn't pass the threshold springs back.
- [ ] Tapping a Preset above the open sheet only closes the sheet; no Run starts and none is Replaced.
- [ ] Choosing a Chime with no Run going previews it once; during a Run it switches quietly and that Chime plays at zero. The choice survives a reopen.
- [ ] Choosing a Theme changes the page behind the sheet straight away, the status bar included, and survives a reopen.
- [ ] A Run keeps counting while Settings is open, and the Chime plays at zero with the sheet still open.
- [ ] After the app is reopened mid-Run, opening Settings counts as the tap that unlocks audio.
- [ ] The version line shows the build date and the short commit.
- [ ] On a regular iPhone the sheet's top edge sits below the Presets. On iPhone SE it may cover them and still fits on the screen, scrolling inside if needed.
- [ ] With Reduce Motion on, it fades instead of sliding.
- [ ] VoiceOver reads the gear as "Settings", focus moves into the sheet when it opens and back to the gear when it closes.
- [ ] The sheet's files import nothing from the rest of the app.
- [ ] Looks calm in Glow and Bead, light and dark.
- [ ] Checked in the browser pane at iPhone size.
- [ ] **Checked in the iOS Simulator as the installed PWA:** in the Simulator's Safari open the Vite dev server on `localhost`, Share → Add to Home Screen, then launch it from the icon. Check the gear clears the notch, the sheet clears the home indicator, swipe-down works with a real touch drag, and the steps above behave the same. Screenshots in the done comment.

## Comments
