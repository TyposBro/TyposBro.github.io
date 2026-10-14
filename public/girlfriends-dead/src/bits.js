/*
 * bits.js — reusable comedy primitives.
 *
 * A gag only reads if the audience gets it in ~0.3s. These are the visual
 * "words" we compose gags from: impact bursts, snap-zooms, sweat drops, flies
 * over a corpse, stink lines, sparkles, hearts, skulls, puffs.
 *
 * Every helper is a pure function of time so it works in the live player and
 * the offline renderer alike.
 */
import { Pen, TAU, clamp, lerp, pulse, mix, shade, rgb, hash } from './engine.js';

const INK = [18, 16, 22];

/* ------------------------------------------------------------- camera fx -- */

/** snap-zoom: scale about (cx,cy) that punches on the beat then settles. */
export function snapZoom(ctx, cx, cy, t, amount = 0.18, dur = 0.22) {
  const k = clamp(t / dur);
  const z = 1 + amount * (1 - k) * (1 - k);
  ctx.translate(cx, cy);
  ctx.scale(z, z);
  ctx.translate(-cx, -cy);
  return z;
}

/** decaying shake, in design units. */
export function shake(ctx, t, amp = 10, freq = 42, dur = 0.45) {
  const k = clamp(t / dur);
  const d = amp * (1 - k) * (1 - k);
  ctx.translate(Math.sin(t * freq) * d, Math.cos(t * freq * 1.31) * d);
}

/* ------------------------------------------------------------- impact fx -- */

/** radiating impact lines (speed lines) behind/around a point. */
export function burst(pen, x, y, t, { n = 16, r0 = 70, r1 = 260, w = 14, col = [252, 244, 214], spin = 0 } = {}) {
  const k = clamp(t / 0.3);
  const rr0 = lerp(r0, r1 * 0.7, k);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU + spin;
    const len = (0.6 + 0.4 * Math.abs(Math.sin(i * 2.7))) * (r1 - rr0) * (1 - k * 0.4);
    const ww = w * (1 - k * 0.5);
    const ca = Math.cos(a), sa = Math.sin(a);
    pen.polygon([
      [x + ca * rr0 - sa * ww, y + sa * rr0 + ca * ww],
      [x + ca * (rr0 + len), y + sa * (rr0 + len)],
      [x + ca * rr0 + sa * ww, y + sa * rr0 - ca * ww],
    ], col);
  }
}

/** four-point sparkle / "ding". */
export function ding(pen, x, y, s, col = [255, 246, 200]) {
  pen.polygon([[x, y - s], [x + s * 0.22, y - s * 0.22], [x + s, y], [x + s * 0.22, y + s * 0.22],
    [x, y + s], [x - s * 0.22, y + s * 0.22], [x - s, y], [x - s * 0.22, y - s * 0.22]], col);
}

export function sparkles(pen, x, y, t, n = 5, spread = 60) {
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU + t * 2;
    const d = spread * (0.6 + 0.4 * Math.sin(t * 6 + i));
    const s = 10 + 6 * Math.sin(t * 8 + i * 2);
    ding(pen, x + Math.cos(a) * d, y + Math.sin(a) * d, s);
  }
}

/* ------------------------------------------------------------ emotion fx -- */

/** bead of sweat that bulges and flicks off. */
export function sweat(pen, x, y, t, s = 1) {
  const bulge = clamp(t / 0.5);
  const r = (7 + 5 * Math.sin(clamp(t / 0.5) * Math.PI)) * s;
  pen.polygon([[x, y - bulge * 14 * s], [x + r, y + r * 0.5], [x, y + r * 1.1], [x - r, y + r * 0.5]], [188, 226, 248], INK, 2.5);
}

/** puff of stink / decay rising off something dead. */
export function stink(pen, x, y, t, n = 3, col = [154, 190, 128]) {
  for (let i = 0; i < n; i++) {
    const ph = (t * 0.7 + i * 0.33) % 1;
    const yy = y - ph * 150;
    const xx = x + Math.sin(ph * 6 + i * 2) * 26;
    ctxAlpha(pen, 1 - ph, () => {
      pen.polygon([
        [xx - 12, yy], [xx + 12, yy - 2], [xx + 18, yy - 26],
        [xx - 2, yy - 20], [xx - 18, yy - 30],
      ], col);
    });
  }
}

/** lazy circle of flies. */
export function flies(pen, x, y, t, n = 4, spread = 70) {
  for (let i = 0; i < n; i++) {
    const a = t * (1.6 + i * 0.37) + i * 2.1;
    const fx = x + Math.cos(a) * spread * (0.5 + 0.5 * Math.sin(t * 2 + i));
    const fy = y + Math.sin(a * 1.3) * spread * 0.5 - 20;
    pen.circle(fx, fy, 3.2, INK);
    pen.circle(fx + Math.sign(Math.cos(a * 6)) * 5, fy - 3, 3.0, [90, 90, 110]);
  }
}

export function heartPop(pen, x, y, t, s = 1, col = [232, 70, 110]) {
  const k = clamp(t / 0.6);
  const sc = s * (0.4 + 0.9 * overshootUnit(k));
  ctxAlpha(pen, 1 - clamp((t - 0.5) / 0.5), () => {
    pen.circle(x - 5 * sc, y, 6 * sc, col);
    pen.circle(x + 5 * sc, y, 6 * sc, col);
    pen.polygon([[x - 10 * sc, y + 2 * sc], [x + 10 * sc, y + 2 * sc], [x, y + 14 * sc]], col);
  });
}

/** a heart that splits in two with a jagged crack. */
export function brokenHeart(pen, x, y, t, s = 1, col = [210, 60, 96]) {
  const gap = clamp(t / 0.5) * 8 * s;
  const half = (sign) => {
    const ox = sign * gap;
    pen.circle(x + ox - 5 * s, y, 6 * s, col);
    pen.circle(x + ox + 5 * s, y, 6 * s, col);
    pen.polygon([[x + ox - 10 * s, y + 2 * s], [x + ox + 10 * s, y + 2 * s], [x + ox, y + 14 * s]], col);
  };
  half(-1); half(1);
  pen.line([[x - 2, y - 4], [x + 1, y + 4], [x - 3, y + 10], [x + 1, y + 16]], 3, [250, 240, 230]);
}

export function skull(pen, x, y, s = 1, col = [238, 236, 228]) {
  pen.circle(x, y, 22 * s, col, INK, 3.4);
  pen.rrect([x - 15 * s, y + 12 * s], [x + 15 * s, y + 26 * s], 6 * s, col, INK, 3.4);
  pen.circle(x - 9 * s, y - 3 * s, 6.5 * s, INK);
  pen.circle(x + 9 * s, y - 3 * s, 6.5 * s, INK);
  pen.polygon([[x, y + 3 * s], [x - 4 * s, y + 12 * s], [x + 4 * s, y + 12 * s]], INK);
}

export function gravestone(pen, x, y, s = 1, col = [148, 150, 156]) {
  pen.rrect([x - 46 * s, y - 96 * s], [x + 46 * s, y], 14 * s, col, INK, 5);
  pen.pie(x, y - 96 * s, 46 * s, 46 * s, Math.PI, TAU, col);
  pen.line([[x - 26 * s, y - 62 * s], [x + 26 * s, y - 62 * s]], 8 * s, [120, 122, 128]);
  pen.line([[x - 26 * s, y - 40 * s], [x + 6 * s, y - 40 * s]], 8 * s, [120, 122, 128]);
}

export function coffin(pen, x, y, w, h, col = [126, 84, 62]) {
  pen.polygon([
    [x - w * 0.28, y - h / 2], [x + w * 0.28, y - h / 2],
    [x + w / 2, y - h * 0.16], [x + w / 2, y + h / 2],
    [x - w / 2, y + h / 2], [x - w / 2, y - h * 0.16],
  ], col, INK, 5);
}

/* --------------------------------------------------------------- staging -- */

/** soft pool of light, drawn as stacked translucent ellipses. */
export function spotlight(pen, x, y, rx, ry, col = [255, 246, 210], a = 0.16) {
  for (let i = 3; i >= 1; i--) {
    ctxAlpha(pen, a / i, () => pen.ellipse(x, y, rx * (i / 3), ry * (i / 3), col));
  }
}

/** dust puff where something hits the ground. */
export function puff(pen, x, y, t, s = 1, col = [206, 198, 184]) {
  const k = clamp(t / 0.5);
  for (let i = 0; i < 5; i++) {
    const a = Math.PI + (i / 4) * Math.PI;
    const d = (18 + 42 * k) * s;
    ctxAlpha(pen, 1 - k, () =>
      pen.circle(x + Math.cos(a) * d, y + Math.sin(a) * d * 0.55, (11 + 7 * k) * s, col));
  }
}

/** tumbling tumbleweed, because punk. */
export function tumbleweed(pen, x, y, t, s = 1) {
  const spin = t * 3;
  for (let i = 0; i < 9; i++) {
    const a = spin + (i / 9) * TAU;
    pen.line([[x, y], [x + Math.cos(a) * 22 * s, y + Math.sin(a) * 22 * s]], 2.4, [150, 132, 96]);
  }
  pen.circle(x, y, 22 * s, null, [150, 132, 96], 2.4);
}

/* ---------------------------------------------------------------- speech -- */

/** a speech bubble holding a symbol (never words — we don't print lyrics). */
export function bubble(pen, x, y, w, h, symbol, t = 0, col = [252, 250, 244]) {
  const pop = overshootUnit(clamp(t / 0.25));
  const ww = w * pop, hh = h * pop;
  pen.rrect([x - ww / 2, y - hh / 2], [x + ww / 2, y + hh / 2], 16 * pop, col, INK, 4.5);
  pen.polygon([[x - 12 * pop, y + hh / 2 - 2], [x + 4 * pop, y + hh / 2 - 2], [x - 8 * pop, y + hh / 2 + 22 * pop]], col, INK, 4);
  pen.text(symbol, x, y + 6 * pop, Math.min(hh * 0.8, 54) * pop, INK, { align: 'center' });
}

/* ---------------------------------------------------------------- helpers -- */

function overshootUnit(k) {
  if (k >= 1) return 1;
  const c = 1.70158 + 1;
  return 1 + c * Math.pow(k - 1, 3) + 1.70158 * Math.pow(k - 1, 2);
}

/** run fn with a temporary globalAlpha (works whether ctx is wrapped or not). */
function ctxAlpha(pen, a, fn) {
  const c = pen.ctx;
  const prev = c.globalAlpha;
  c.globalAlpha = prev * clamp(a);
  fn();
  c.globalAlpha = prev;
}
