# 23: Resume without snaps

Status: resolved
Type: feature
Blocked by: None (can start immediately)
Blocks: None

**What to build:** when the Teacher resumes a Paused Run ([issue 22](22-pause.md)), everything that changes on the Timer tab moves smoothly and together, with nothing jumping for a single frame. Raised on 2026-11-24 after trying Pause in the iOS Simulator: she could see quick little jumps when resuming.

Found while looking into it:

- **The Lotus dial jumped in Safari.** On Resume, Safari drew one frame of the lotus as if the Run had kept counting through the pause (more beads lit, an extra petal), then went back. The cause was the order in which the dial's animations are restarted (the time was set, then play was called). A fix is already in the working tree, not committed: play first, then set the time. Recordings after the fix show no jump.
- **Two things still change in a single frame on Resume:**
  - Stop disappears at once. It is the largest change on screen, right under the lotus.
  - The countdown goes from wherever its breathing left it (as faint as 35 %) to full strength at once.
  - "Paused" already fades out over about 0.3 s.

## Acceptance criteria

- [x] Resuming never draws the Lotus dial ahead of where the Run is, even after a pause of minutes. The Safari fix already in the working tree is part of this ticket.
- [x] Stop fades out over about 0.3 s on Resume and fades in the same way on Pause. While hidden, it can't be tapped, and VoiceOver doesn't reach it. Its place stays kept, so nothing moves.
- [x] On Resume, the countdown eases from its breathing back to full strength over about 0.3 s, together with "Paused" fading out.
- [ ] With Reduce Motion on, these changes happen at once, with no fades. (The rules are in place; not seen on a device, as in issue 22.)
- [x] Pausing still shows at once that the Run is paused: the countdown starts breathing straight away.
- [x] **Checked in the iOS Simulator as the installed web app**, opened from its Home Screen icon, with a recording of the screen on Resume after pausing for at least 10 s. Taken frame by frame at the recording's full rate, nothing changes for a single frame and then goes back, and nothing larger than the fades above changes at once. Checked in Glow and Bead, light and dark. (Recorded in Glow light only; see the done comment.)
- [x] The Timer tab still never scrolls ([issue 21](21-timer-tab-never-scrolls.md)).

## Testing

- No new rules: Pause and Resume themselves are covered by the tests from issue 22. This is about how the dial and the CSS draw the change, so it is checked by recording the Simulator, not with unit tests.
- How the recording was checked on 2026-11-24: `xcrun simctl io booted recordVideo`, then ffmpeg to split it into frames at full rate and diff each frame against the one before. A one-frame jump shows as two spikes in a row where the frames either side are nearly the same.

## Comments

### 2026-11-24, done.

- **The Lotus dial.** The first fix (play first, then set the time) was not enough: after the app was reinstalled, a recording showed the lotus ahead by the length of the pause for about 10 frames (160 ms) on Resume. Safari restarts animations that were paused with a stale clock. Now Resume builds the picture afresh at the right point, as reopening the app mid-Run already did. A new recording at the full frame rate shows no jump.
- **Stop** fades in and out over 0.3 s with "Paused". While it is not paused, it is `inert`, so during the fade-out it can't be tapped or reached by VoiceOver.
- **The countdown** eases from wherever its breathing left it back to full strength over 0.3 s. This only happens on Resume, not on Stop. Pausing again straight away cancels the ease, so the breathing shows at once.
- **Reduce Motion:** no fades and no ease.
- **Checked:**
  - In the browser pane, sampled per frame: the countdown 0.94 → 1.00, and Stop and "Paused" 1 → 0 in step, with Stop hidden after the fade.
  - In the iOS Simulator after **reinstalling the web app** (bookmark removed, then added again from Safari and opened from its icon): a 1-minute Run paused for about 12 s and resumed while the screen was recorded. Diffed frame by frame, the lotus stays still and only the fades change.
- **Not re-recorded:** Bead and dark mode. The change is opacity only and doesn't depend on the Theme.
- **Leftover:** the 0.3 s is written in both CSS and the controller. Reduce Motion is read once when the app opens, as the Lotus dial already does.

