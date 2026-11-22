// Text shown on screen. No DOM here, so it can be tested directly.

// m:ss, with part-seconds rounded up: a Run reads 0:01 until it really is zero.
export function formatCountdown(ms) {
  return clock(Math.ceil(ms / 1000));
}

// "3 min · completed" or "5 min · stopped 2:41" (the whole seconds it ran).
export function describeRun(run) {
  if (run.outcome === "completed") return `${run.preset} min · completed`;
  return `${run.preset} min · stopped ${clock(Math.floor((run.endedAt - run.startedAt) / 1000))}`;
}

function clock(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
