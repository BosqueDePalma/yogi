// The Lotus dial: a mala of 108 beads that light up blue one by one around a pink lotus
// that blooms over a Run. A blue lotus tassel hangs from the guru bead and opens when
// the Run completes. In Ready it shows Om. Based on the user's design in
// .scratch/yogi-timer/prototypes/lotus-dial/mala-demo.html (issue 12).
//
// The Run drives the picture: `update` is given how far the Run has gone and jumps there,
// so reopening the app mid-Run shows the right point. Nothing here keeps its own clock.
// Colours come from the --lotus-* tokens in base.css, through the class names below.

const NS = "http://www.w3.org/2000/svg";
const EASE = "cubic-bezier(.3,.1,.2,1)";
const SOFT = "cubic-bezier(.45,0,.55,1)";
const BACK = "cubic-bezier(.3,1.4,.5,1)";

const CELEBRATE_S = 4; // the celebration after zero, while 0:00 shows
const FADE_S = 2; // then the picture fades to Ready
const STOP_FADE_MS = 600; // a Stopped Run fades out quickly, with no celebration
const DRIFT_MS = 300; // jump to the right point when the picture is further off than this

const RADIUS = 236; // the mala
const BEADS = 108;
const GAP = 14; // degrees left for the guru bead

// The demo's lotus, on its 90-second scale: t = when the ring starts, w = how long its
// petals take to all start, d = how long one petal takes to grow. Stretched to each Preset.
const DEMO_S = 90;
const RINGS = [
  { n: 12, turn: 0, h: 250, r: 215, tone: "p1", t: 1, w: 32, d: 14 },
  { n: 12, turn: 15, h: 205, r: 175, tone: "p2", t: 22, w: 30, d: 14 },
  { n: 8, turn: 0, h: 150, r: 105, tone: "p3", t: 44, w: 24, d: 14 },
  { n: 8, turn: 22.5, h: 100, r: 75, tone: "p4", t: 60, w: 18, d: 14 },
];
const TASSEL = [
  [-72, "b1"],
  [72, "b1"],
  [-36, "b2"],
  [36, "b2"],
  [0, "b3"],
];

// Om (ॐ, U+0950) from Noto Sans Devanagari, centred on (0, 0) at 100 units to the em.
// Copyright 2022 The Noto Project Authors (https://github.com/notofonts/devanagari),
// licensed under the SIL Open Font License, Version 1.1 (https://openfontlicense.org).
const OM =
  "M-15-18Q-9.3-18-5.7-16Q-2.2-14-.6-10.8Q1-7.5 1-3.6Q1 3.4-4.1 7.8Q-4.7 8.3-5.4 8.8Q-4.7 9.3-4.1 9.7Q-2.4 10.8-.3 10.8Q1.7 10.8 3.4 9.6Q5 8.5 6.7 5.6L9.5.9Q12.8-4.6 16.7-7Q20.5-9.5 26.4-9.5Q31-9.5 34.5-7.4Q38-5.3 40-1.1Q42 3.1 42 9.4Q42 15.4 39.9 19.7Q37.8 24 34.1 26.3Q30.3 28.6 25 28.6Q20.1 28.6 16.5 26.9Q12.8 25.1 9.9 22.3L14.6 16.7Q16.8 18.8 19.3 20.2Q21.6 21.5 24.8 21.5Q28.3 21.5 31.1 18.6Q34 15.7 34 9.3Q34 3.9 32 .8Q29.9-2.4 25.8-2.4Q22.6-2.4 20.4-.7Q18.2 1 15.9 5.1L13.4 9.5Q11.3 13.2 8.4 15.5Q5.6 17.7 1.1 17.8Q1.5 18.5 1.8 19.1Q2.6 21.3 2.6 23.6Q2.6 28.5.4 32Q-1.8 35.4-5.6 37.2Q-9.5 39-14.4 39Q-20.4 39-25.1 36.4Q-29.9 33.7-34 27.6Q-38.1 21.4-42 10.8L-34.9 7.9Q-30.8 19.6-26.2 25.7Q-21.6 31.7-15.1 31.7Q-10.7 31.7-8 29.4Q-5.3 27-5.3 22.7Q-5.3 18.3-8.5 15Q-10.3 13.2-12.3 11.7Q-16.1 12.8-21.2 13.2L-22.8 6.1Q-16.5 5.3-13.1 4Q-9.7 2.8-8.3.9Q-7-1-7-3.7Q-7-7-9.1-9Q-11.2-10.9-15.3-10.9Q-18.7-10.9-21.9-9.9Q-25.2-8.9-28.4-6.9L-31-13.9Q-27.5-15.9-23.5-17Q-19.6-18-15-18Z" +
  "M26.4-36.4L33.3-34.2Q31.5-24.8 26.7-21Q21.8-17.2 14.5-17.2Q7.2-17.2 2.4-21Q-2.5-24.8-4.3-34.2L2.6-36.4Q3.7-29.1 6.8-26.3Q9.8-23.6 14.5-23.6Q19.3-23.6 22.3-26.3Q25.4-29.1 26.4-36.4Z" +
  "M9.6-34.1Q9.6-36.2 11.1-37.6Q12.5-39 14.5-39Q16.5-39 18-37.6Q19.4-36.2 19.4-34.1Q19.4-32 18-30.5Q16.5-29.1 14.5-29.1Q12.5-29.1 11.1-30.5Q9.6-32 9.6-34.1Z";

const draw = (name, attrs, parent) => {
  const el = document.createElementNS(NS, name);
  for (const key in attrs) el.setAttribute(key, attrs[key]);
  parent.appendChild(el);
  return el;
};
const onCircle = (r, deg) => [r * Math.sin((deg * Math.PI) / 180), -r * Math.cos((deg * Math.PI) / 180)];
// A lens-shaped petal pointing up from (0, 0).
const lens = (h, r) => `M0 0A${r} ${r} 0 0 1 0 ${-h}A${r} ${r} 0 0 1 0 0Z`;

// `svg` is an empty <svg> centred on 0,0: the drawing reaches about 250 out, and the tassel
// hangs down to 300 (index.html crops the viewBox to that). Returns { update, destroy }.
export function createLotusDial(svg, { reducedMotion = false } = {}) {
  const mala = draw("g", { transform: "translate(0 -16)" }, svg);
  draw("circle", { class: "lotus-disc", r: RADIUS - 16 }, mala);
  const glowSlot = draw("g", {}, mala);
  draw("circle", { class: "lotus-thread", r: RADIUS }, mala);

  // The tassel: closed and still in Ready, swaying during a Run, open at zero.
  draw("line", { class: "lotus-thread", y1: RADIUS, y2: RADIUS + 20 }, mala);
  const sway = draw("g", { class: "lotus-turn" }, draw("g", { transform: `translate(0 ${RADIUS + 16}) rotate(180)` }, mala));
  const tassel = TASSEL.map(([angle, tone]) => {
    const petal = draw("path", { class: `lotus-turn lotus-edge thin ${tone}`, d: lens(44, 38) }, sway);
    petal.style.transform = `rotate(${angle / 8}deg)`;
    return { petal, angle };
  });
  draw("circle", { class: "lotus-guru lotus-edge", cy: RADIUS, r: 9 }, mala);
  const swaying = reducedMotion
    ? null
    : sway.animate(
        [
          { transform: "rotate(-3deg)", easing: SOFT },
          { transform: "rotate(3deg)", easing: SOFT },
          { transform: "rotate(-3deg)" },
        ],
        { duration: 6000, iterations: Infinity },
      );
  swaying?.pause();

  // 108 unlit beads, counted clockwise from the guru bead.
  const beadAt = (i) => onCircle(RADIUS, 180 + GAP / 2 + (i * (360 - GAP)) / (BEADS - 1));
  for (let i = 0; i < BEADS; i++) {
    const [x, y] = beadAt(i);
    draw("circle", { class: "lotus-bead", cx: x, cy: y, r: 5 }, mala);
  }
  const runSlot = draw("g", {}, mala);
  for (let i = 0; i < BEADS; i++) {
    const [x, y] = beadAt(i);
    draw("circle", { class: "lotus-shine", cx: x - 1.6, cy: y - 1.6, r: 1.4 }, mala);
  }

  // Om, shown in Ready (base.css fades it in and out).
  draw("path", { class: "lotus-om", d: OM, transform: "translate(0 -38) scale(1.45)" }, mala);

  let shown = null; // { preset, elapsedMs, layers, animations, celebrating }: the Run on show
  let leaving = null; // a Run still fading out

  function start(preset) {
    if (shown) dispose(shown);
    if (leaving) dispose(leaving);
    shown = leaving = null;
    const layers = [draw("g", {}, glowSlot), draw("g", {}, runSlot)];
    shown = { preset, elapsedMs: 0, layers, animations: buildRun(preset, layers), celebrating: false };
    swaying?.play();
  }

  function dispose(run) {
    for (const animation of run.animations) animation.cancel();
    for (const layer of run.layers) layer.remove();
  }

  // Lets the Run on show fade out (`fade` resolves when it has), then removes it.
  function leave(fade) {
    const run = shown;
    shown = null;
    leaving = run;
    swaying?.pause();
    fade
      .catch(() => {})
      .then(() => {
        if (leaving !== run) return; // already removed by a new Run
        dispose(run);
        leaving = null;
      });
  }

  // Everything one Run animates, on one timeline from its start to the end of the fade.
  function buildRun(preset, [glowLayer, layer]) {
    const D = preset * 60;
    const F = D + CELEBRATE_S;
    const T = F + FADE_S;
    const k = D / DEMO_S;
    const at = (s) => Math.min(1, Math.max(0, s / T));
    const timing = { duration: T * 1000, fill: "both" };
    const animations = [];
    const animate = (el, frames) => animations.push(el.animate(frames, timing));

    // Fades in over the first part of its growth, holds, and fades out after the celebration.
    const life = (el, s, d) =>
      animate(el, [
        { offset: 0, opacity: 0 },
        { offset: at(s), opacity: 0, easing: "ease-out" },
        { offset: at(s + d * 0.4), opacity: 1 },
        { offset: at(F), opacity: 1, easing: SOFT },
        { offset: 1, opacity: 0 },
      ]);
    const grow = (el, s, d, from, to) => {
      if (!reducedMotion) {
        animate(el, [
          { offset: 0, transform: from },
          { offset: at(s), transform: from, easing: EASE },
          { offset: at(s + d), transform: to },
          { offset: 1, transform: to },
        ]);
      }
      life(el, s, d);
    };

    // A soft blue glow along the mala when the Run completes.
    const glow = draw("circle", { class: "lotus-glow", r: RADIUS }, glowLayer);
    animate(glow, [
      { offset: 0, opacity: 0 },
      { offset: at(D), opacity: 0, easing: SOFT },
      { offset: at(D + 1.2), opacity: 0.65, easing: SOFT },
      { offset: at(F + 1), opacity: 0 },
      { offset: 1, opacity: 0 },
    ]);

    // Each bead lights up blue in turn, with a soft overlap, and they go out in reverse.
    const w = Math.max(0.4, (D * 2.5) / BEADS);
    for (let i = 0; i < BEADS; i++) {
      const [x, y] = beadAt(i);
      const bead = draw("circle", { class: "lotus-lit lotus-turn", r: 5.4 }, draw("g", { transform: `translate(${x} ${y})` }, layer));
      const s = ((D - w) * i) / (BEADS - 1);
      const off = F + ((BEADS - 1 - i) / (BEADS - 1)) * (FADE_S - 0.6);
      const small = reducedMotion ? {} : { transform: "scale(.3)" };
      const full = reducedMotion ? {} : { transform: "scale(1)" };
      animate(bead, [
        { offset: 0, opacity: 0, ...small },
        { offset: at(s), opacity: 0, ...small, easing: reducedMotion ? "linear" : BACK },
        { offset: at(s + w), opacity: 1, ...full },
        { offset: at(off), opacity: 1, ...full, easing: SOFT },
        { offset: at(off + 0.6), opacity: 0, ...small },
        { offset: 1, opacity: 0, ...small },
      ]);
    }

    // At zero: three soft blue ripples.
    if (!reducedMotion) {
      for (let j = 0; j < 3; j++) {
        const s = D + j * 1.1;
        const ripple = draw("circle", { class: "lotus-ripple lotus-turn", r: 100 }, layer);
        animate(ripple, [
          { offset: 0, transform: "scale(.4)", opacity: 0 },
          { offset: at(s), transform: "scale(.4)", opacity: 0, easing: "cubic-bezier(.2,.6,.3,1)" },
          { offset: at(s + 0.4), opacity: 0.8 },
          { offset: at(s + 3), transform: "scale(2.2)", opacity: 0 },
          { offset: 1, transform: "scale(2.2)", opacity: 0 },
        ]);
      }
    }

    // The lotus blooms over the whole Run, with a gentle swell at zero.
    const swell = draw("g", { class: "lotus-turn" }, layer);
    const lotus = draw("g", { transform: "scale(.8)" }, swell);
    if (!reducedMotion) {
      animate(swell, [
        { offset: 0, transform: "scale(1)" },
        { offset: at(D), transform: "scale(1)", easing: SOFT },
        { offset: at(D + 1.2), transform: "scale(1.04)", easing: SOFT },
        { offset: at(D + 3), transform: "scale(1)" },
        { offset: 1, transform: "scale(1)" },
      ]);
    }
    for (const ring of RINGS) {
      for (let i = 0; i < ring.n; i++) {
        const turn = draw("g", { transform: `rotate(${ring.turn + (i * 360) / ring.n})` }, lotus);
        const petal = draw("path", { class: `lotus-turn lotus-edge ${ring.tone}`, d: lens(ring.h, ring.r) }, turn);
        grow(petal, (ring.t + (i * ring.w) / ring.n) * k, ring.d * k, "scale(.3,.02)", "scale(1,1)");
      }
    }
    const heart = draw("circle", { class: "lotus-turn lotus-edge thick g1", r: 24 }, lotus);
    grow(heart, 70 * k, 20 * k, "scale(0)", "scale(1)");
    for (let i = 0; i < 12; i++) {
      const seed = draw("circle", { class: "lotus-turn g2", cy: -42, r: 3.5 }, draw("g", { transform: `rotate(${i * 30})` }, lotus));
      grow(seed, (76 + (i * 8) / 12) * k, 6 * k, "scale(.1)", "scale(1)");
    }

    // The tassel opens at zero and closes again as the picture fades.
    if (!reducedMotion) {
      for (const { petal, angle } of tassel) {
        const turn = (f) => `rotate(${angle * f}deg)`;
        animate(petal, [
          { offset: 0, transform: turn(1 / 8) },
          { offset: at(D), transform: turn(1 / 4), easing: BACK },
          { offset: at(D + 1.6), transform: turn(1) },
          { offset: at(F), transform: turn(1), easing: SOFT },
          { offset: 1, transform: turn(1 / 8) },
        ]);
      }
    }

    for (const animation of animations) animation.pause();
    return animations;
  }

  function seek(elapsedMs) {
    for (const animation of shown.animations) {
      animation.currentTime = elapsedMs;
      animation.play();
    }
  }

  // `dial` is the Timer screen view's { preset, elapsedMs } for the Run on show (during
  // the Run and its celebration), or null after it. `mode` is the view's mode.
  function update(dial, mode) {
    if (dial) {
      const restarted = !shown || shown.preset !== dial.preset || dial.elapsedMs < shown.elapsedMs;
      if (restarted) start(dial.preset);
      const drift = Math.abs((shown.animations[0].currentTime ?? -Infinity) - dial.elapsedMs);
      if (restarted || drift > DRIFT_MS || shown.animations[0].playState !== "running") seek(dial.elapsedMs);
      shown.elapsedMs = dial.elapsedMs;
      shown.celebrating = mode === "pulsing";
      return;
    }
    if (!shown) return;
    // After the celebration the Run's own timeline fades it to Ready; a Run that was
    // Stopped, or noticed late, fades out quickly with no celebration.
    if (shown.celebrating) {
      leave(shown.animations[0].finished);
    } else {
      const fades = shown.layers.map((layer) => layer.animate([{ opacity: 1 }, { opacity: 0 }], { duration: STOP_FADE_MS, fill: "forwards" }));
      shown.animations.push(...fades);
      leave(fades[0].finished);
    }
  }

  // Takes everything back out of the <svg>.
  function destroy() {
    for (const run of [shown, leaving]) if (run) dispose(run);
    shown = leaving = null;
    swaying?.cancel();
    svg.replaceChildren();
  }

  return { update, destroy };
}
