/*
 * engine.js — tiny flat-2D drawing engine.
 * World/design space is 1280x720. The camera transform is applied by the
 * caller, so every Pen method works directly in design units.
 */
export const W = 1280;
export const H = 720;
export const TAU = Math.PI * 2;

/* ------------------------------------------------------------- easing --- */
export const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
export const lerp = (a, b, t) => a + (b - a) * t;
export const invlerp = (a, b, x) => (b === a ? 0 : clamp((x - a) / (b - a)));
export const remap = (x, a, b, c, d) => lerp(c, d, invlerp(a, b, x));

export const smooth = (t) => { t = clamp(t); return t * t * (3 - 2 * t); };
export const easeOut = (t) => 1 - Math.pow(1 - clamp(t), 3);
export const easeIn = (t) => Math.pow(clamp(t), 3);
export const easeIO = (t) => { t = clamp(t); return t * t * (3 - 2 * t); };
export const backOut = (t, s = 1.70158) => { t = clamp(t) - 1; return t * t * ((s + 1) * t + s) + 1; };
export const overshoot = (t, amt = 0.18) => { t = clamp(t); return 1 + Math.sin(t * Math.PI) * amt * (1 - t); };
export const elasticOut = (t, period = 0.36) => {
  t = clamp(t);
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  return Math.pow(2, -10 * t) * Math.sin((t - period / 4) * TAU / period) + 1;
};
export const pulse = (t, freq = 1, phase = 0) => (Math.sin((t * freq + phase) * TAU) + 1) * 0.5;
export const wiggle = (t, freq = 6, amt = 1) => Math.sin(t * TAU * freq) * amt;

/* -------------------------------------------------------------- color --- */
export const mix = (c1, c2, t) => {
  t = clamp(t);
  return [0, 1, 2].map((i) => Math.round(lerp(c1[i], c2[i], t)));
};
export const shade = (c, k) => c.slice(0, 3).map((v) => Math.max(0, Math.min(255, Math.round(v * k))));
export const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
export const rgb = (c) => `rgb(${c[0]},${c[1]},${c[2]})`;

/* ------------------------------------------------------------ vectors --- */
export const rot = ([x, y], a) => {
  const c = Math.cos(a), s = Math.sin(a);
  return [x * c - y * s, x * s + y * c];
};
export const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
export const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
export const mul = (a, k) => [a[0] * k, a[1] * k];
export const d2 = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
export const unit = (a) => { const l = Math.hypot(a[0], a[1]) || 1; return [a[0] / l, a[1] / l]; };
export const perp = (a) => [-a[1], a[0]];
export const upDir = (a) => [Math.sin(a), -Math.cos(a)];
export const dnDir = (a) => [Math.sin(a), Math.cos(a)];
/** Linear interpolation of a numeric-keyed pose object. */
export function lerpPose(a, b, t) {
  const out = {};
  for (const k in a) {
    if (typeof a[k] === 'number' && typeof b[k] === 'number') out[k] = lerp(a[k], b[k], t);
    else out[k] = t < 0.5 ? a[k] : b[k];
  }
  return out;
}

/* ---------------------------------------------------------------- Pen --- */
export class Pen {
  constructor(ctx) {
    this.ctx = ctx;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }

  _path(pts, close = false) {
    const c = this.ctx;
    c.beginPath();
    c.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]);
    if (close) c.closePath();
  }

  line(pts, w, fill) {
    const c = this.ctx;
    this._path(pts);
    c.lineWidth = Math.max(0.1, w);
    c.strokeStyle = rgb(fill);
    c.stroke();
  }

  polygon(pts, fill, outline, ow) {
    const c = this.ctx;
    this._path(pts, true);
    if (fill) { c.fillStyle = rgb(fill); c.fill(); }
    if (outline && ow) { c.lineWidth = ow; c.strokeStyle = rgb(outline); c.stroke(); }
  }
  poly(pts, fill, outline, ow) { this.polygon(pts, fill, outline, ow); }

  circle(cx, cy, r, fill, outline, ow) {
    const c = this.ctx;
    c.beginPath();
    c.arc(cx, cy, Math.max(0, r), 0, TAU);
    if (fill) { c.fillStyle = rgb(fill); c.fill(); }
    if (outline && ow) { c.lineWidth = ow; c.strokeStyle = rgb(outline); c.stroke(); }
  }

  ellipse(cx, cy, rx, ry, fill, outline, ow, rotA = 0) {
    const c = this.ctx;
    c.beginPath();
    c.ellipse(cx, cy, Math.max(0, rx), Math.max(0, ry), rotA, 0, TAU);
    if (fill) { c.fillStyle = rgb(fill); c.fill(); }
    if (outline && ow) { c.lineWidth = ow; c.strokeStyle = rgb(outline); c.stroke(); }
  }

  capsule(a, b, w, fill) { this.line([a, b], w, fill); }

  bone(a, b, w, fill, ol, lw) {
    if (ol) this.line([a, b], w + 2 * lw, ol);
    this.line([a, b], w, fill);
  }

  arc(cx, cy, rx, ry, a0, a1, w, fill) {
    const c = this.ctx;
    c.beginPath();
    c.ellipse(cx, cy, Math.max(0.1, rx), Math.max(0.1, ry), 0, a0, a1);
    c.lineWidth = Math.max(0.1, w);
    c.strokeStyle = rgb(fill);
    c.stroke();
  }

  pie(cx, cy, rx, ry, a0, a1, fill) {
    const c = this.ctx;
    c.beginPath();
    c.moveTo(cx, cy);
    c.ellipse(cx, cy, Math.max(0, rx), Math.max(0, ry), 0, a0, a1);
    c.closePath();
    c.fillStyle = rgb(fill);
    c.fill();
  }

  chord(cx, cy, rx, ry, a0, a1, fill, outline, ow) {
    const c = this.ctx;
    c.beginPath();
    c.ellipse(cx, cy, Math.max(0, rx), Math.max(0, ry), 0, a0, a1);
    c.closePath();
    if (fill) { c.fillStyle = rgb(fill); c.fill(); }
    if (outline && ow) { c.lineWidth = ow; c.strokeStyle = rgb(outline); c.stroke(); }
  }

  rect(a, b, fill, outline, ow) {
    const c = this.ctx;
    if (fill) { c.fillStyle = rgb(fill); c.fillRect(a[0], a[1], b[0] - a[0], b[1] - a[1]); }
    if (outline && ow) { c.lineWidth = ow; c.strokeStyle = rgb(outline); c.strokeRect(a[0], a[1], b[0] - a[0], b[1] - a[1]); }
  }

  rrect(a, b, r, fill, outline, ow) {
    const c = this.ctx;
    c.beginPath();
    if (c.roundRect) {
      c.roundRect(a[0], a[1], b[0] - a[0], b[1] - a[1], r);
    } else {
      c.rect(a[0], a[1], b[0] - a[0], b[1] - a[1]);
    }
    if (fill) { c.fillStyle = rgb(fill); c.fill(); }
    if (outline && ow) { c.lineWidth = ow; c.strokeStyle = rgb(outline); c.stroke(); }
  }

  text(str, x, y, size, fill, opts = {}) {
    const c = this.ctx;
    const { bold = false, italic = false, align = 'center', baseline = 'middle', tracking = 0 } = opts;
    c.font = `${italic ? 'italic ' : ''}${bold ? '800 ' : '600 '}${size}px "Trebuchet MS", "DejaVu Sans", system-ui, sans-serif`;
    c.textAlign = 'left';
    c.textBaseline = baseline;
    c.fillStyle = rgb(fill);
    if (!tracking) {
      c.textAlign = align;
      c.fillText(str, x, y);
      return;
    }
    const chars = [...str];
    const widths = chars.map((ch) => c.measureText(ch).width);
    const total = widths.reduce((s, v) => s + v, 0) + tracking * (chars.length - 1);
    let cx = align === 'center' ? x - total / 2 : align === 'right' ? x - total : x;
    c.textAlign = 'left';
    chars.forEach((ch, i) => {
      c.fillText(ch, cx, y);
      cx += widths[i] + tracking;
    });
  }

  /** Chunky poster text with a solid offset shadow + outline. */
  posterText(str, x, y, size, fill, opts = {}) {
    const c = this.ctx;
    const { outline = [30, 26, 36], ow = 8, shadow = [12, 10, 16], sx = 5, sy = 6, tracking = 2, align = 'center' } = opts;
    const draw = (dx, dy, col, useStroke) => {
      c.save();
      c.lineJoin = 'round';
      c.lineWidth = ow;
      c.strokeStyle = rgb(col);
      c.fillStyle = rgb(col);
      c.font = `900 ${size}px "Trebuchet MS", "DejaVu Sans", system-ui, sans-serif`;
      const chars = [...str];
      const widths = chars.map((ch) => c.measureText(ch).width);
      const total = widths.reduce((s, v) => s + v, 0) + tracking * (chars.length - 1);
      let cx = align === 'center' ? x - total / 2 : x;
      c.textAlign = 'left';
      c.textBaseline = 'middle';
      chars.forEach((ch, i) => {
        const px = cx + dx, py = y + dy;
        if (useStroke) c.strokeText(ch, px, py);
        else c.fillText(ch, px, py);
        cx += widths[i] + tracking;
      });
      c.restore();
    };
    draw(sx, sy, shadow, false);
    draw(0, 0, outline, true);
    draw(0, 0, fill, false);
  }
}

/* -------------------------------------------------------------- frame --- */
export function setCamera(ctx, cam, dpr) {
  const s = (cam.s || 1) * dpr;
  ctx.setTransform(s, 0, 0, s, (cam.x || 0) * dpr, (cam.y || 0) * dpr);
}

export function hash(n) {
  const s = Math.sin(n * 127.1) * 43758.5453;
  return s - Math.floor(s);
}
