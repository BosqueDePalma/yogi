# Chime and wake-lock test

Status: ready-for-agent
Type: prototype

Settle the open questions in the [spec](../spec.md) before the real timer is built.

## What to build

A throwaway single page (it doesn't need to be part of the app) with:
- a button that plays the generated singing-bowl chime (Web Audio),
- a 30-second countdown that keeps the screen awake and chimes at zero,
- a toggle that sets `navigator.audioSession.type = "playback"` where it's available.

## Checks

In the iOS Simulator, in Safari and also added to the Home Screen:
- [ ] The chime plays after a tap, and its sound is acceptable.
- [ ] The chime plays at zero without a fresh tap (the audio is unlocked by the start tap).
- [ ] The screen stays awake during the countdown.
- [ ] Lock the device mid-countdown, then unlock: write down what happened.

On the Teacher's real iPhone (a human step, because the Simulator has no silent switch):
- [ ] With the silent switch on, does the chime play with and without the `audioSession` toggle?

## Done when

The findings are written under Comments below, and the spec's Open questions are answered (or the user has decided).

## Comments
