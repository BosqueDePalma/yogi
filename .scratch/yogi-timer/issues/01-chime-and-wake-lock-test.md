# Chime and wake-lock test

Status: resolved
Type: prototype

Settle the open questions in the [spec](../spec.md) before the real timer is built.

## What to build

A throwaway single page (it doesn't need to be part of the app) with:
- a button that plays the generated singing-bowl chime (Web Audio),
- a 30-second countdown that keeps the screen awake and chimes at zero,
- a toggle that sets `navigator.audioSession.type = "playback"` where it's available.

## Checks

In the iOS Simulator, in Safari and also added to the Home Screen:
- [x] The chime plays after a tap. Whether the sound is acceptable still has to be heard by a human; the Simulator test could only confirm that audio played.
- [x] The chime plays at zero without a fresh tap (the audio is unlocked by the start tap).
- [x] The screen stays awake during the countdown: the wake lock is acquired, both in Safari and from the Home Screen.
- [x] Lock the device mid-countdown, then unlock: see the findings below.

On the Teacher's real iPhone (a human step, because the Simulator has no silent switch):
- [x] With the silent switch on, does the chime play with and without the `audioSession` toggle? Yes, both.
- [x] Lock the phone mid-Run: does the chime still sound at zero? Yes (with the toggle on).
- [x] Is the chime's sound OK for class? The user asked for two more yoga sounds so the Teacher can choose. They were added to the prototype, and the choice moved to issue 06.

The real-iPhone check needs the page served over **https**: wake lock and `audioSession` only work in a secure context, so plain `http://<mac-ip>:5180` on the same Wi-Fi isn't enough.

## Done when

The findings are written under Comments below, and the spec's Open questions are answered (or the user has decided).

## Comments

### 2026-11-21 — Simulator findings (iPhone 17, iOS 26.5)

The prototype is at `.scratch/yogi-timer/prototypes/chime-test/` and is served by the `chime-test` entry in `.claude/launch.json`. Open it in the Simulator as `http://127.0.0.1:5180/`: `localhost` hung in Simulator Safari.

- **Feature support:** `navigator.wakeLock` and `navigator.audioSession` both exist, both in a Safari tab and from the Home Screen (standalone). Setting `audioSession.type = "playback"` is accepted, and the chime still plays afterwards.
- **Chime at zero:** a Web Audio `AudioContext` created and resumed inside the Start tap stays `running`. A chime triggered later by the timer (no new tap) plays on time (+183 ms, which is the 200 ms tick). Safari shows the "playing audio" indicator.
- **Wake lock:** acquired on Start and released when the page is hidden (locked or in the background), so it has to be requested again on `visibilitychange → visible` while a Run is still going.
- **Locked mid-Run:** in the Simulator, JavaScript kept running about 14 s after locking. The Run completed at zero (+885 ms) and the chime started, but iOS moved the `AudioContext` to **`interrupted` 250 ms later**, so the chime was most likely cut off. On unlock the context returned to `running` on its own. ⚠️ The Simulator doesn't reproduce a real device's suspension of a locked page, so a real iPhone may behave differently (most likely: JS frozen, the Run noticed late on unlock → the no-late-chime rule applies).
- **Background tab:** a tab sent to the background noticed the end 3.9 s late, and the "late → no chime" rule (1.5 s threshold in the prototype) correctly skipped the chime.
- **Storage is separate:** the Home Screen app does **not** share localStorage with Safari tabs (the log started empty in standalone). History made in a Safari tab will not appear in the installed app. That's fine, because the Teacher only uses the installed app, but it's worth knowing when testing.
- **Simulator quirk:** unlocking with HOME sometimes left the Simulator stuck on a dimmed home screen. Restarting the Simulator fixed it.

**Still open (human):** the silent switch, lock-screen behaviour and how the chime sounds, all on a real iPhone over https. Issue 06 stays needs-triage until then.

### 2026-11-21 — Real iPhone findings (Home Screen app, over an https ngrok tunnel)

- **Silent switch on, toggle off:** the chime was **heard** (+186 ms).
- **Silent switch on, `audioSession.type = "playback"`:** the chime was **heard** (+179 ms).
- **Locked 3 s into a 10 s Run (toggle on):** unlike the Simulator, JavaScript kept running. The Run completed at +810 ms, the `AudioContext` stayed `running` (never `interrupted`), and the chime was **heard on the locked phone**.
- **Wake lock:** acquired on Start and released when the app is hidden, as in the Simulator.

**Decision:** the app always sets `audioSession.type = "playback"`, so the chime ignores the silent switch and can sound while the phone is locked. The no-late-chime rule stays for phones or iOS versions that freeze the app instead. The spec and ADR 0001 have been updated.

**Follow-up:** the user asked for two more yoga-style sounds so the Teacher can choose. The prototype now offers Singing bowl, Tingsha and Gong (radio buttons; the selected one plays at zero). Her pick goes into issue 06.
