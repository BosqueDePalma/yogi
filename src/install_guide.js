// The install guide: whether to offer adding Yogi Timer to the Home Screen, and what its sheet
// shows. No DOM here, so it can be tested.
//
//   browser   { standalone, userAgent, maxTouchPoints, language }, read from navigator
//
// It is offered only in a browser on an iPhone or iPad, never in the Home Screen app.
//
//   offer()   "banner" | "pill" (the banner was hidden) | null (nothing to offer)
//   sheet     null, or { steps, screenshots, language }:
//               steps        "safari" (how to add it) | "open-in-safari" (any other browser)
//               screenshots  true on an iPhone in Safari; an iPad's menus differ
//               language     "es" when the phone is in Spanish, "en" otherwise
//   hide()    hides the banner, leaving the pill, until the page is opened again: nothing is
//             saved, so each visit offers the banner anew
export function createInstallGuide({ browser }) {
  const sheet = sheetFor(browser);
  let hidden = false;
  return {
    sheet,
    offer: () => (sheet ? (hidden ? "pill" : "banner") : null),
    hide() {
      hidden = true;
    },
  };
}

function sheetFor({ standalone, userAgent, maxTouchPoints, language }) {
  const device = deviceOf(userAgent, maxTouchPoints);
  if (standalone || !device) return null;
  const sheetLanguage = /^es\b/i.test(language) ? "es" : "en";
  if (!isSafari(userAgent)) return { steps: "open-in-safari", screenshots: false, language: sheetLanguage };
  return { steps: "safari", screenshots: device === "iphone", language: sheetLanguage };
}

// iPadOS presents itself as a Mac; only its touch screen tells them apart.
function deviceOf(userAgent, maxTouchPoints) {
  if (/iPhone|iPod/.test(userAgent)) return "iphone";
  if (/iPad/.test(userAgent) || (/Macintosh/.test(userAgent) && maxTouchPoints > 1)) return "ipad";
  return null;
}

// Safari says "Version/… Safari/…". Other browsers on iOS add their own name, and the browsers
// inside other apps (web views) leave out one or both.
const OTHER_BROWSERS = /CriOS|FxiOS|EdgiOS|OPiOS|OPT\/|GSA\/|DuckDuckGo|YaBrowser|Instagram|FBAN|FBAV|Line\/|Snapchat|Twitter|LinkedInApp/;

function isSafari(userAgent) {
  return /Version\/[\d.]+.*Safari\//.test(userAgent) && !OTHER_BROWSERS.test(userAgent);
}
