import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { lookAt, nextChangeAt } from "./theme_clock.js";

// Local times, as the phone shows them, in a time zone with daylight saving so those cases
// test something wherever the tests run.
let zone;
beforeAll(() => {
  zone = process.env.TZ;
  process.env.TZ = "Europe/Madrid";
});
afterAll(() => {
  if (zone === undefined) delete process.env.TZ;
  else process.env.TZ = zone;
});

const at = (y, month, d, h, m = 0) => new Date(y, month - 1, d, h, m).getTime();

describe("the Auto Theme's look", () => {
  it("starts the round on Glow light at 6:30 am on 1 Jan 2026", () => {
    expect(lookAt(at(2026, 1, 1, 6, 30))).toEqual({ theme: "glow", mode: "light" });
  });

  it("goes round all four looks, 12 hours each, over two days", () => {
    expect(lookAt(at(2026, 1, 1, 12))).toEqual({ theme: "glow", mode: "light" });
    expect(lookAt(at(2026, 1, 1, 21))).toEqual({ theme: "glow", mode: "dark" });
    expect(lookAt(at(2026, 1, 2, 12))).toEqual({ theme: "bead", mode: "light" });
    expect(lookAt(at(2026, 1, 2, 21))).toEqual({ theme: "bead", mode: "dark" });
    expect(lookAt(at(2026, 1, 3, 12))).toEqual({ theme: "glow", mode: "light" });
  });

  it("changes at 6:30 am and 6:30 pm, not a minute before", () => {
    expect(lookAt(at(2026, 1, 2, 6, 29))).toEqual({ theme: "glow", mode: "dark" });
    expect(lookAt(at(2026, 1, 2, 6, 30))).toEqual({ theme: "bead", mode: "light" });
    expect(lookAt(at(2026, 1, 2, 18, 29))).toEqual({ theme: "bead", mode: "light" });
    expect(lookAt(at(2026, 1, 2, 18, 30))).toEqual({ theme: "bead", mode: "dark" });
  });

  it("keeps the evening's dark look past midnight", () => {
    expect(lookAt(at(2026, 1, 3, 0, 15))).toEqual({ theme: "bead", mode: "dark" });
  });

  it("keeps counting long after the start, across daylight-saving changes", () => {
    // 2026-11-25 is day 328 of the round: an even day, so Glow.
    expect(lookAt(at(2026, 11, 25, 9))).toEqual({ theme: "glow", mode: "light" });
    expect(lookAt(at(2026, 11, 25, 19))).toEqual({ theme: "glow", mode: "dark" });
    // Either side of the spring and autumn changes in Europe (29 Mar, 25 Oct) and the US.
    expect(lookAt(at(2026, 3, 8, 12))).toEqual({ theme: "glow", mode: "light" }); // day 66
    expect(lookAt(at(2026, 3, 29, 12))).toEqual({ theme: "bead", mode: "light" }); // day 87
    expect(lookAt(at(2026, 10, 25, 12))).toEqual({ theme: "bead", mode: "light" }); // day 297
    expect(lookAt(at(2026, 11, 1, 12))).toEqual({ theme: "glow", mode: "light" }); // day 304
  });

  it("works before the start too", () => {
    expect(lookAt(at(2025, 12, 31, 12))).toEqual({ theme: "bead", mode: "light" });
    expect(lookAt(at(2026, 1, 1, 3))).toEqual({ theme: "bead", mode: "dark" });
  });
});

describe("the next change", () => {
  it("is the next 6:30, morning or evening", () => {
    expect(nextChangeAt(at(2026, 1, 2, 3))).toBe(at(2026, 1, 2, 6, 30));
    expect(nextChangeAt(at(2026, 1, 2, 6, 30))).toBe(at(2026, 1, 2, 18, 30));
    expect(nextChangeAt(at(2026, 1, 2, 12))).toBe(at(2026, 1, 2, 18, 30));
    expect(nextChangeAt(at(2026, 1, 2, 18, 30))).toBe(at(2026, 1, 3, 6, 30));
    expect(nextChangeAt(at(2026, 1, 2, 23, 59))).toBe(at(2026, 1, 3, 6, 30));
  });

  it("is at 6:30 local time on a daylight-saving day", () => {
    expect(nextChangeAt(at(2026, 3, 29, 1))).toBe(at(2026, 3, 29, 6, 30));
    expect(nextChangeAt(at(2026, 11, 1, 1))).toBe(at(2026, 11, 1, 6, 30));
  });
});
