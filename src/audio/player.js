// Plays a Chime through Web Audio.
//
// iOS only lets a page make sound once audio has been unlocked inside a tap, so unlock()
// must be called from the Teacher's tap (the Preset tap). After that, play() works on its
// own, including at zero with no tap. The "playback" audio session makes the Chime ignore
// the silent switch, and on her iPhone it also sounds with the screen locked (issue 01).
import { SOUNDS } from "./sounds.js";

let context = null;

export function unlock() {
  if (!context) {
    if ("audioSession" in navigator) navigator.audioSession.type = "playback";
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    context = new AudioContext();
    // A silent buffer played inside the tap is what unlocks audio on iOS.
    const source = context.createBufferSource();
    source.buffer = context.createBuffer(1, 1, 22050);
    source.connect(context.destination);
    source.start(0);
  }
  if (context.state !== "running") context.resume().catch(() => {});
}

// Plays the Chime once and returns a function that fades it out early.
export function play(name) {
  unlock();
  if (!context) return () => {};
  const sound = SOUNDS[name];
  const t0 = context.currentTime + 0.02;

  const master = context.createGain();
  master.gain.value = sound.gain;
  const filter = context.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = sound.lowpass;
  master.connect(filter);
  filter.connect(context.destination);

  for (const [hitAt, hitAmp, hitTune] of sound.hits ?? [[0, 1, 1]]) {
    sound.partials.forEach(([ratio, relAmp, relDecay], i) => {
      const start = t0 + hitAt;
      const attack = sound.bloom ? sound.attack + sound.bloom * (i / sound.partials.length) : sound.attack;
      const end = start + attack + sound.decay * relDecay;
      for (const detune of [0, sound.detune]) {
        const oscillator = context.createOscillator();
        const envelope = context.createGain();
        oscillator.type = "sine";
        oscillator.frequency.value = (sound.base * ratio + detune) * hitTune;
        envelope.gain.setValueAtTime(0, start);
        envelope.gain.linearRampToValueAtTime((sound.amp * relAmp * hitAmp) / 2, start + attack);
        envelope.gain.exponentialRampToValueAtTime(0.0001, end);
        oscillator.connect(envelope);
        envelope.connect(master);
        oscillator.start(start);
        oscillator.stop(end + 0.1);
      }
    });
  }

  return () => {
    master.gain.cancelScheduledValues(context.currentTime);
    master.gain.setTargetAtTime(0, context.currentTime, 0.05);
  };
}
