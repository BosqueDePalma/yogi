// The three Chimes, generated in code (no audio files). Ported from the issue 01 prototype,
// where the Teacher picked them on her iPhone. Tune here.
//
// Each Chime is a set of sine partials over a base note:
//   gain      overall loudness
//   base      fundamental frequency (Hz)
//   amp       peak loudness of the fundamental
//   attack    seconds to reach the peak
//   decay     seconds to fade out
//   partials  [frequency ratio, relative loudness, relative decay]; inharmonic ratios sound like metal
//   detune    Hz added to a twin of each partial, for the slow "beating" shimmer
//   lowpass   filter cutoff (Hz), so nothing sounds harsh on a phone speaker
//   hits      optional [offset s, loudness, pitch ratio] strikes (Tingsha: two cymbals)
//   bloom     optional seconds by which the highest partials swell in later (Gong)
export const SOUNDS = {
  // Singing bowl: D4, warm inharmonic partials, long ring.
  bowl: {
    gain: 0.6, base: 293.66, amp: 0.55, attack: 0.015, decay: 7.0, detune: 0.8, lowpass: 4000,
    partials: [[1, 1, 1], [2.71, 0.51, 0.71], [5.15, 0.22, 0.43], [8.43, 0.09, 0.26]],
  },
  // Tingsha: two small cymbals struck together: bright and high, two hits 0.12 s apart.
  tingsha: {
    gain: 0.22, base: 2349, amp: 0.5, attack: 0.003, decay: 4.0, detune: 3, lowpass: 9000,
    partials: [[1, 1, 1], [1.47, 0.45, 0.8], [2.09, 0.25, 0.6], [2.71, 0.12, 0.45]],
    hits: [[0, 1, 1], [0.12, 0.8, 1.012]],
  },
  // Gong: low A2 with upper partials that bloom in slowly, very long decay.
  gong: {
    gain: 0.55, base: 110, amp: 0.55, attack: 0.04, decay: 9.0, detune: 0.4, lowpass: 4000, bloom: 0.9,
    partials: [[1, 1, 1], [1.52, 0.5, 0.85], [2.0, 0.45, 0.8], [2.66, 0.35, 0.65], [3.4, 0.22, 0.5], [4.1, 0.14, 0.4]],
  },
};
