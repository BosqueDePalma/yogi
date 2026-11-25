# Real iPhone acceptance test

Status: ready-for-human
Type: task
Blocked by: 19

**Remind the user once the whole app is built and hosted.** This is the final check on a real iPhone, ideally the Teacher's own, using the finished app installed from the GitHub Pages URL. The Simulator can't stand in for it: it has no silent switch, and it handles a locked screen differently (see [issue 01](01-chime-and-wake-lock-test.md)).

## Checks

- [ ] Install from Safari → Share → Add to Home Screen. The icon and the name "Yogi Timer" look right.
- [ ] Open the installed app **once from the Home Screen while online** (the Home Screen app does not reuse the offline cache Safari downloaded, see issue 02). Then turn Airplane mode on, close the app fully, and reopen it: it opens and works fully offline.
- [ ] Each Preset (1, 2, 3, 5, 10), once tapped, starts its Run from a tap on the lotus or a second tap on it, and the countdown is readable from across the room.
- [ ] The chime sounds at zero with the **silent switch on**.
- [ ] The Chime selector switches between Singing bowl, Tingsha and Gong, a mid-Run switch changes what plays at zero, and the choice is still there after reopening the app.
- [ ] With music playing from another app (e.g. a class playlist), tap a Preset: note whether the music pauses. The `playback` audio session may stop other audio (see issue 06).
- [ ] Close the app fully mid-Run and reopen it, then tap the screen once: the Chime still plays at zero.
- [ ] Lock the phone mid-Run: the chime sounds at zero, or if iOS froze the app, the Run shows as Completed on unlock with no late chime.
- [ ] The screen stays awake during a Run.
- [ ] After the Run screen rework (issue 08): one Chime at zero on time, the 0:00 pulse, then Ready; "Tap again" lasts about 3 s.
- [ ] After the Chime rework (issue 10): switching with no Run going previews the Chime once; switching during a Run is silent.
- [ ] After the History rework (issue 11): Lessons newest first with the same text, an open Lesson stays open, and deleting still asks first.
- [ ] The Lotus dial (issue 12): a 10-minute Run stays smooth and doesn't drain the battery noticeably; reopening mid-Run jumps to the right point; it looks right in light and dark mode, and with Reduce Motion on.
- [ ] Stop, Replace ("Tap again") and Mis-tap (< 5 s) all behave as in the spec.
- [ ] Pause (issue 22): a tap on the lotus pauses at once and another resumes; a paused countdown is obvious from across the room; Stop shows only while paused. With VoiceOver the dial reads "Pause, … left" and "Resume, … left", and Stop can be reached. With Reduce Motion on, the paused countdown only dims. A stray tap mid-class is easy to notice and undo. With VoiceOver on the dial while a Run counts, check it doesn't re-read the label every second, and where focus lands after Stop and at zero.
- [ ] Adjust (issue 24): a tapped Preset shows "Tap to start" and Cancel, and − / + change its time in steps, repeating when held. Mid-class, is the extra tap before every Run fine, or does it slow her down? With VoiceOver, − and + read "Remove 5 seconds" and "Add 5 seconds", a double-tap on them steps once, and the selected Preset reads "selected".
- [ ] A Run more than 90 minutes after the last one starts a new Lesson.
- [ ] After an update is published, the Chime choice and History are still there (see issue 07).
- [ ] History shows Lessons correctly, and deleting a Lesson works and sticks after closing and reopening the app.
- [ ] Light and dark mode both look calm and readable.
- [ ] Themes (issues 13–16): Glow and Bead, each in light and dark, look calm on the real screen. 0:00 is readable across the room and hands off cleanly to Ready. The chosen Chime and Theme are easy to spot. The status bar follows the theme from the first frame, including in the Home Screen app. Switching theme, and switching the phone between light and dark with the app open, eases the colours across; a theme switch mid-Run doesn't make the Lotus dial stutter.
- [ ] Install guide (issue 25): open the GitHub Pages link in Safari on the iPhone, as a new teacher would, and install the app by following only the guide. Are the screenshots sharp and do they match what the phone shows? The banner's × is easy to hit and hard to hit by mistake. Opened from its icon, the app shows no banner. If a phone in Spanish is at hand, the guide is in Spanish. Open the link from a WhatsApp message too: the sheet should ask to open it in Safari, and Copy link should work. With VoiceOver on, the × reads "Hide" and focus then moves to the Install pill. After the ×, reloading the page brings the banner back. On opening the link, the banner should not flash in after the page has drawn.
- [ ] Settings (issue 17): the gear is easy to reach but not hit by mistake in class; the sheet opens and closes smoothly, swiping it down feels natural, and it clears the notch and the home indicator. Changing the Chime mid-class from the sheet is quick.

## Comments
