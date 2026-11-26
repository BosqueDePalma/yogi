# Landscape fallback

Status: needs-triage
Type: feature
Blocked by: None (can start immediately)
Blocks: None

**What to build:** a landscape layout for when iOS turns the screen. The app is meant to be used in portrait, but iOS gives no way to lock it there. In landscape every tab still has to work, look calm, and feel like the same app. Decided in the grilling session of 2026-11-25.

**Checked in the iOS Simulator** (iPhone 17, iOS 26.5) on 2026-11-25. iOS ignores the manifest's `orientation: "portrait"`, and `screen.orientation.lock()` doesn't work on iPhone, so both Safari and the Home Screen app turn.
- **In Safari:** the lotus is cut off and the countdown can't be seen.
- **In the Home Screen app:** the lotus shrinks to a dot at the edge, and the Presets and the tabs fill the screen.

Only the iPhone's own rotation lock, which the Teacher turns on in Control Center, keeps it upright.

A phone propped on its side on a mat or a stand is a real use in class. In landscape the countdown can be read from further away.

## Decisions

- **The manifest keeps `orientation: "portrait"`**, so Android stays upright. The landscape layout is the fallback for iOS.
- **The Timer tab with no Run going is two columns:**
  - On the left, the Lotus dial with the countdown, as tall as the screen allows.
  - On the right, the five Presets in a row; under them Stop with − and +; and under that "This lesson", showing as many Runs as fit.
  - The tab bar stays at the bottom, lower.
  - Nothing scrolls, as in portrait ([issue 21](21-timer-tab-never-scrolls.md)).
- **While a Run counts, the dial takes the screen:** the lotus and the countdown grow in the middle, and the Presets, "This lesson", the EN · ES switch and the gear fade out.
  - A tap on the lotus still pauses.
  - While paused, Stop and the Presets come back, so she can Stop or Replace.
  - When the Run ends, the two columns come back.
- **History:** a centred column about 560 pt wide at most, scrolling as in portrait.
- **Settings:** the sheet is centred and about 560 pt wide at most. The screen is short, so it scrolls inside when it doesn't fit.
- **Safe areas:** nothing goes under the Dynamic Island or the home indicator, whichever way the phone turns (`env(safe-area-inset-left/right/bottom)`).
- **Turning mid-Run loses nothing:**
  - the Lotus dial jumps to the right point with no flicker;
  - the countdown and the wake lock carry on;
  - the Chime plays at zero.
- **In Safari** the same layout applies, with the install banner as a thin strip at the top of the right column.
- **The experience barely changes:**
  - the same gestures (a tap on the lotus pauses, Stop only while paused, "Tap again" to Replace);
  - the same colours, and the same order of things (lotus, Presets, then "This lesson");
  - nothing new to learn.

## Acceptance criteria

- [ ] With no Run going, the Timer tab in landscape shows the lotus on the left and the Presets, Stop and "This lesson" on the right, with no scrolling.
- [ ] While a Run counts, the lotus and the countdown fill the screen. While paused, Stop and the Presets come back. When the Run ends, the two columns come back.
- [ ] History and Settings are centred and at most about 560 pt wide, and Settings scrolls inside if it doesn't fit.
- [ ] Nothing is cut off under the Dynamic Island or the home indicator, turning either way.
- [ ] Turning the phone mid-Run, paused or not, keeps the Run, the Lotus dial's place, the wake lock and the Chime.
- [ ] Portrait doesn't change.
- [ ] **Sizes, measured in the Simulator:**
  - the countdown is as tall as in portrait, or taller;
  - every tap area is at least 44 pt (the Presets, Stop, − and +, the EN · ES switch, the gear and the tabs);
  - the lotus fills almost the full usable height with no Run going, and more while one counts.
- [ ] **The main check, in the iOS Simulator as the Home Screen app**, opened from its icon, turned left and right, with real taps:
  - with no Run going, with a Selected Preset, while a Run counts, while paused, and at 0:00;
  - with Settings open, and on the History tab;
  - the UX barely changes from portrait and the sizes are good;
  - in Glow and Bead, each in light and dark.
  - The done comment has portrait and landscape screenshots side by side for each of these states.
- [ ] Safari in landscape works too, with the install banner in the right column.

## Testing

- No new rules in the domain or screen modules; this is CSS (orientation media queries and safe areas) plus the Lotus dial's resize.
- In the browser at 874 × 402 and 667 × 375: the Timer panel's `scrollHeight` equals its `clientHeight`, tap areas are at least 44 px, and the countdown's height compared with portrait.
- **Above all, in the iOS Simulator as the Home Screen app** (see the last two acceptance criteria). It's the only place that shows the real safe areas and the real rotation.
- On a real iPhone, propped on its side: left for [issue 20](20-real-iphone-acceptance-test.md).
