# Chime at the end of a Run

Status: needs-info
Type: task
Blocked by: 05

Plug the chime generated in code into the Run completion. See the [spec](../spec.md), Chime section, and the findings in [issue 01](01-chime-and-wake-lock-test.md).

## Decided

- Set `navigator.audioSession.type = "playback"` (when available) so the chime ignores the silent switch and can sound with the phone locked.
- Create or resume the `AudioContext` inside the Preset tap to unlock audio. The chime at zero then needs no extra tap.
- Request the wake lock again on `visibilitychange → visible` while a Run is going.
- The chime plays only if the Run's end is noticed within about 1.5 s; otherwise there is no late chime.

## Waiting on

- **Which sound?** The Teacher picks Singing bowl, Tingsha or Gong in the prototype (`.scratch/yogi-timer/prototypes/chime-test/`). Port only the chosen sound's synthesis into the app. Set this ticket to ready-for-agent once she has chosen.

## Done when

The chosen chime plays once at zero in the Simulator, never late after an unlock, and with `audioSession` set to playback.

## Comments
