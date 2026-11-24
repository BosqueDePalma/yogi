# Real iPhone acceptance test

Status: ready-for-human
Type: task
Blocked by: 13

**Remind the user once the whole app is built and hosted.** This is the final check on a real iPhone, ideally the Teacher's own, using the finished app installed from the GitHub Pages URL. The Simulator can't stand in for it: it has no silent switch, and it handles a locked screen differently (see [issue 01](01-chime-and-wake-lock-test.md)).

## Checks

- [ ] Install from Safari → Share → Add to Home Screen. The icon and the name "Yogi Timer" look right.
- [ ] Open the installed app **once from the Home Screen while online** (the Home Screen app does not reuse the offline cache Safari downloaded, see issue 02). Then turn Airplane mode on, close the app fully, and reopen it: it opens and works fully offline.
- [ ] Each Preset (1, 2, 3, 5, 10) starts a Run with one tap, and the countdown is readable from across the room.
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
- [ ] A Run more than 90 minutes after the last one starts a new Lesson.
- [ ] After an update is published, the Chime choice and History are still there (see issue 07).
- [ ] History shows Lessons correctly, and deleting a Lesson works and sticks after closing and reopening the app.
- [ ] Light and dark mode both look calm and readable.

## Comments
