// The Auto Theme (issue 28): four looks in rotation by the phone's clock. Light looks start at
// 6:30 am and dark looks at 6:30 pm, in turn Glow light, Glow dark, Bead light, Bead dark. The
// round is counted from 6:30 am on 1 Jan 2026 (Glow light), so each half-day always gets the
// same look however long the app stays closed. No DOM here, so it can be tested.
//
// The head script in index.html repeats lookAt() to paint the right look before the page
// draws; keep the two in step.

const LOOKS = [
  { theme: "glow", mode: "light" },
  { theme: "glow", mode: "dark" },
  { theme: "bead", mode: "light" },
  { theme: "bead", mode: "dark" },
];
const START = Date.UTC(2026, 0, 1); // the round's first day
const DAY = 86_400_000;
const MORNING = 6 * 60 + 30; // minutes after midnight, local time
const EVENING = 18 * 60 + 30;

// The look at `now` (ms since the epoch).
export function lookAt(now) {
  const date = new Date(now);
  const minutes = date.getHours() * 60 + date.getMinutes();
  // Before 6:30 am it's still the night that began the evening before.
  const day = calendarDay(date) - (minutes < MORNING ? 1 : 0);
  const dark = minutes < MORNING || minutes >= EVENING;
  const half = day * 2 + (dark ? 1 : 0);
  return LOOKS[((half % 4) + 4) % 4];
}

// When the look next changes: the next 6:30, morning or evening, in local time.
export function nextChangeAt(now) {
  const date = new Date(now);
  const minutes = date.getHours() * 60 + date.getMinutes();
  const [y, m, d] = [date.getFullYear(), date.getMonth(), date.getDate()];
  if (minutes < MORNING) return new Date(y, m, d, 6, 30).getTime();
  if (minutes < EVENING) return new Date(y, m, d, 18, 30).getTime();
  return new Date(y, m, d + 1, 6, 30).getTime();
}

// Days since the round's first day, by the local calendar, so daylight saving plays no part.
function calendarDay(date) {
  return Math.round((Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - START) / DAY);
}
