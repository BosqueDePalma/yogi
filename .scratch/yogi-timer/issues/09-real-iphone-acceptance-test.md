# Real iPhone acceptance test

Status: ready-for-human
Type: task
Blocked by: 08

**Remind the user once the whole app is built and hosted.** This is the final check on a real iPhone, ideally the Teacher's own, using the finished app installed from the GitHub Pages URL. The Simulator can't stand in for it: it has no silent switch, and it handles a locked screen differently (see [issue 01](01-chime-and-wake-lock-test.md)).

## Checks

- [ ] Install from Safari → Share → Add to Home Screen. The icon and the name "Yogi Timer" look right.
- [ ] Airplane mode on: the app opens and works fully offline.
- [ ] Each Preset (1, 2, 3, 5, 10) starts a Run with one tap, and the countdown is readable from across the room.
- [ ] The chime sounds at zero with the **silent switch on**.
- [ ] Lock the phone mid-Run: the chime sounds at zero, or if iOS froze the app, the Run shows as Completed on unlock with no late chime.
- [ ] The screen stays awake during a Run.
- [ ] Stop, Replace ("Tap again") and Mis-tap (< 5 s) all behave as in the spec.
- [ ] A Run more than 90 minutes after the last one starts a new Lesson.
- [ ] History shows Lessons correctly, and deleting a Lesson works and sticks after closing and reopening the app.
- [ ] Light and dark mode both look calm and readable.

## Comments
