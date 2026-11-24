// Follows a finger dragging a bottom sheet down, and decides when it lifts whether the sheet
// closes or springs back. No DOM: positions are clientY in px, times in ms.
//
//   const swipe = startSwipe({ y, time, height })   on touch down; height is the sheet's
//   swipe.move(y, time) → px                         how far below its open position to draw it
//   swipe.dragging                                   past the slop: the tap is no longer a tap
//   swipe.release(time) → true | false               on lift: close, or spring back
const SLOP = 8; // px the finger may wobble in a tap before it counts as a drag
const CLOSE_AT = 0.3; // of the sheet's height: a slow drag further than this closes it
const FLICK = 0.5; // px/ms down at lift: a flick closes the sheet whatever the distance
const BACK = -0.1; // px/ms: moving up at lift springs it back whatever the distance
const RECENT_MS = 60; // only the finger's last moments count towards its speed

export function startSwipe({ y: startY, time: startTime, height }) {
  const samples = [{ y: startY, time: startTime }];
  let offset = 0;

  // The finger's speed as it lifts, in px/ms (down is positive); 0 if it had come to rest.
  function speedAt(time) {
    const first = samples.findIndex((s) => s.time >= time - RECENT_MS);
    if (first === -1) return 0; // no movement lately: the finger had come to rest
    const from = samples[Math.max(first - 1, 0)];
    const to = samples.at(-1);
    return to === from ? 0 : (to.y - from.y) / (to.time - from.time || 1);
  }

  const swipe = {
    dragging: false,

    move(y, time) {
      samples.push({ y, time });
      offset = Math.max(0, y - startY);
      if (offset > SLOP) swipe.dragging = true;
      return swipe.dragging ? offset : 0;
    },

    release(time) {
      if (!swipe.dragging) return false;
      const speed = speedAt(time);
      if (speed > FLICK) return true;
      if (speed < BACK) return false;
      return offset > height * CLOSE_AT;
    },
  };
  return swipe;
}
