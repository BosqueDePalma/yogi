import { describe, expect, it } from "vitest";
import { createInstallGuide } from "./install_guide.js";

// User agents as each browser sends them.
const IPHONE_SAFARI =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1";

function guideFor(browser) {
  return createInstallGuide({
    browser: { standalone: false, userAgent: IPHONE_SAFARI, maxTouchPoints: 5, language: "en-US", ...browser },
  });
}

describe("in Safari on an iPhone", () => {
  it("offers the banner, and the Safari steps with screenshots", () => {
    const guide = guideFor({});
    expect(guide.offer()).toBe("banner");
    expect(guide.sheet).toEqual({ steps: "safari", screenshots: true, language: "en" });
  });
});

describe("other iPhone browsers", () => {
  it.each([
    ["Chrome", "Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/142.0.7444.77 Mobile/15E148 Safari/604.1"],
    ["Firefox", "Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/145.0 Mobile/15E148 Safari/605.1.15"],
    ["Edge", "Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 EdgiOS/142.0.3595.53 Mobile/15E148 Safari/605.1.15"],
    ["the Google app", "Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) GSA/390.0.798106925 Mobile/15E148 Safari/604.1"],
    ["Instagram's browser", "Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 404.0.0.33.91 (iPhone17,3; iOS 18_7; en_US; en; scale=3.00; 1206x2622; 785420147)"],
    ["Facebook's browser", "Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/22H20 [FBAN/FBIOS;FBAV/530.0.0.43.109;FBBV/812345678;FBDV/iPhone17,3;FBMD/iPhone;FBSN/iOS;FBSV/18.7;FBSS/3;FBCR/;FBID/phone;FBLC/en_US;FBOP/80]"],
    ["an app's own web view", "Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148"],
  ])("%s gets the banner, and a sheet that says to open the page in Safari", (_, userAgent) => {
    const guide = guideFor({ userAgent });
    expect(guide.offer()).toBe("banner");
    expect(guide.sheet).toEqual({ steps: "open-in-safari", screenshots: false, language: "en" });
  });
});

describe("on an iPad", () => {
  // iPadOS presents itself as a Mac; only its touch screen tells them apart.
  const IPAD_SAFARI =
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Safari/605.1.15";

  it("gives the Safari steps without screenshots", () => {
    const guide = guideFor({ userAgent: IPAD_SAFARI, maxTouchPoints: 5 });
    expect(guide.offer()).toBe("banner");
    expect(guide.sheet).toEqual({ steps: "safari", screenshots: false, language: "en" });
  });

  it("says to open the page in Safari from another browser", () => {
    const chrome = "Mozilla/5.0 (iPad; CPU OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/142.0.7444.77 Mobile/15E148 Safari/604.1";
    expect(guideFor({ userAgent: chrome }).sheet).toEqual({ steps: "open-in-safari", screenshots: false, language: "en" });
  });
});

describe("on a computer or an Android phone", () => {
  it.each([
    ["a Mac", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Safari/605.1.15", 0],
    ["Windows", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36", 0],
    ["a Windows laptop with a touch screen", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36", 10],
    ["Android", "Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36", 5],
  ])("on %s nothing shows", (_, userAgent, maxTouchPoints) => {
    const guide = guideFor({ userAgent, maxTouchPoints });
    expect(guide.offer()).toBe(null);
    expect(guide.sheet).toBe(null);
  });
});

describe("the sheet's language", () => {
  it.each([
    ["es-MX", "es"],
    ["es", "es"],
    ["ES-es", "es"],
    ["en-GB", "en"],
    ["fr-FR", "en"],
    ["", "en"],
  ])("is %s → %s", (language, expected) => {
    expect(guideFor({ language }).sheet.language).toBe(expected);
  });

  it("follows the phone in another browser too", () => {
    const chrome = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/142.0.7444.77 Mobile/15E148 Safari/604.1";
    expect(guideFor({ userAgent: chrome, language: "es-ES" }).sheet.language).toBe("es");
  });
});

describe("hiding the banner", () => {
  it("leaves the Install pill, and the same sheet", () => {
    const guide = guideFor({});
    guide.hide();
    expect(guide.offer()).toBe("pill");
    expect(guide.sheet).toEqual({ steps: "safari", screenshots: true, language: "en" });
  });

  it("is forgotten the next time the page opens: the banner comes back", () => {
    guideFor({}).hide();
    expect(guideFor({}).offer()).toBe("banner");
  });
});

describe("in the Home Screen app", () => {
  it("shows neither the banner nor the pill", () => {
    const guide = guideFor({ standalone: true });
    expect(guide.offer()).toBe(null);
    expect(guide.sheet).toBe(null);
  });
});
