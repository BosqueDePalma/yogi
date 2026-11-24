import { describe, expect, it } from "vitest";
import { startSwipe } from "./swipe.js";

// A sheet 300 px tall; the finger lands 100 px from the top of the screen at t = 0 ms.
const HEIGHT = 300;

describe("following the finger", () => {
  it("moves the sheet down with the finger", () => {
    const swipe = startSwipe({ y: 100, time: 0, height: HEIGHT });

    expect(swipe.move(150, 100)).toBe(50);
    expect(swipe.dragging).toBe(true);
  });

  it("treats a few px of wobble as a tap, not a drag", () => {
    const swipe = startSwipe({ y: 100, time: 0, height: HEIGHT });

    expect(swipe.move(104, 50)).toBe(0);
    expect(swipe.dragging).toBe(false);
    expect(swipe.release(80)).toBe(false);
  });

  it("doesn't lift the sheet above its open position", () => {
    const swipe = startSwipe({ y: 100, time: 0, height: HEIGHT });

    expect(swipe.move(40, 100)).toBe(0);
    expect(swipe.dragging).toBe(false);
  });
});

// A slow drag: 1 px every 10 ms.
function slowDrag(swipe, from, to, time = 0) {
  for (let y = from; y <= to; y++) swipe.move(y, (time += 10));
  return time;
}

describe("letting go", () => {
  it("closes after a slow drag past 30 % of the sheet's height", () => {
    const swipe = startSwipe({ y: 100, time: 0, height: HEIGHT });
    const time = slowDrag(swipe, 100, 200);

    expect(swipe.release(time + 10)).toBe(true);
  });

  it("springs back after a slow drag that stops short of it", () => {
    const swipe = startSwipe({ y: 100, time: 0, height: HEIGHT });
    const time = slowDrag(swipe, 100, 180);

    expect(swipe.release(time + 10)).toBe(false);
  });

  it("closes after a quick flick down, even a short one", () => {
    const swipe = startSwipe({ y: 100, time: 0, height: HEIGHT });
    swipe.move(110, 16);
    swipe.move(125, 32);
    swipe.move(140, 48);

    expect(swipe.release(56)).toBe(true);
  });

  it("springs back when the finger rests before lifting, however quick the drag was", () => {
    const swipe = startSwipe({ y: 100, time: 0, height: HEIGHT });
    swipe.move(110, 16);
    swipe.move(125, 32);
    swipe.move(140, 48);

    expect(swipe.release(400)).toBe(false);
  });

  it("springs back when a long drag ends with a flick back up", () => {
    const swipe = startSwipe({ y: 100, time: 0, height: HEIGHT });
    const time = slowDrag(swipe, 100, 220);
    swipe.move(212, time + 16);
    swipe.move(204, time + 32); // still past 30 % (90 px), but moving up

    expect(swipe.release(time + 40)).toBe(false);
  });
});
