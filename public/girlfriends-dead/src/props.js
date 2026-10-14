/*
 * props.js — the set dressing.
 *
 * Every prop is a flat, chunky silhouette with a thick dark outline and one
 * or two tone-shifts so it reads in a single glance. Units are design units
 * (1280x720) and the caller has already set the camera transform.
 *
 * Convention: (x, y) is where the prop touches the ground — or whatever it is
 * standing on — and `s` scales it. Four props are held or hung (scaleProp,
 * medal, trumpet, drum) so they centre on (x, y) instead: the call sites in
 * gags.js leave no other choice.
 */
import { TAU, clamp, lerp, rgb } from './engine.js';

/* ------------------------------------------------------------- palette -- */

const OUT = [18, 16, 22];
const BONE = [246, 240, 226];
const BONE_D = [214, 206, 190];
const BONE_DD = [178, 170, 154];
const RED = [196, 62, 76];
const RED_D = [146, 42, 56];
const MUST = [228, 178, 70];
const MUST_D = [182, 132, 44];
const TEAL = [70, 142, 140];
const TEAL_D = [42, 98, 102];
const WOOD = [176, 130, 82];
const WOOD_D = [126, 90, 56];
const DARK = [58, 54, 64];
const STEEL = [156, 158, 168];
const STEEL_D = [104, 106, 116];
const SKIN = [238, 198, 162];
const GREEN = [92, 138, 78];
const GREEN_D = [62, 102, 56];
const GREY = [186, 186, 194];

/* ------------------------------------------------------------- helpers -- */

/** a thick stroked line with a dark cartoon outline under it. */
function tube(pen, pts, w, col, ow = 3) {
  pen.line(pts, w + ow * 2, OUT);
  pen.line(pts, w, col);
}

/** run fn with a temporary alpha (for glows and shadows). */
function alpha(pen, a, fn) {
  const c = pen.ctx;
  const prev = c.globalAlpha;
  c.globalAlpha = prev * clamp(a);
  fn();
  c.globalAlpha = prev;
}

/** run fn translated to (x,y) and rotated by a. */
function at(pen, x, y, a, fn) {
  const c = pen.ctx;
  c.save();
  c.translate(x, y);
  if (a) c.rotate(a);
  fn();
  c.restore();
}

/** one chunky six-petal flower head: petals spaced so the ink stays light. */
function bloom(pen, cx, cy, r, col) {
  const ow = Math.max(1.2, r * 0.11);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * TAU;
    pen.ellipse(cx + Math.cos(a) * r * 0.78, cy + Math.sin(a) * r * 0.78,
      r * 0.42, r * 0.30, col, OUT, ow, a);
  }
  pen.circle(cx, cy, r * 0.34, MUST, OUT, ow);
}

/** fills a fat cartoon heart (single path, so the outline stays clean). */
function heart(pen, cx, cy, r, col, ol = OUT, ow = 3) {
  const c = pen.ctx;
  c.beginPath();
  c.moveTo(cx, cy + r * 0.95);
  c.bezierCurveTo(cx - r * 1.45, cy - r * 0.35, cx - r * 0.62, cy - r * 1.25, cx, cy - r * 0.42);
  c.bezierCurveTo(cx + r * 0.62, cy - r * 1.25, cx + r * 1.45, cy - r * 0.35, cx, cy + r * 0.95);
  c.closePath();
  if (col) { c.fillStyle = rgb(col); c.fill(); }
  if (ol && ow) { c.lineWidth = ow; c.strokeStyle = rgb(ol); c.stroke(); }
}

/* ================================================================= props == */

/* --------------------------------------------------------- living room -- */

// A chunky corded landline. Bottom of the base sits on (x, y).
export function phone(pen, x, y, s = 1) {
  const w = 78 * s, h = 34 * s;
  const L = x - w / 2, R = x + w / 2, B = y, T = y - h;
  // coiled cord snaking away to the right
  tube(pen, [[R - 14 * s, B - 12 * s], [R + 10 * s, B + 2 * s], [R + 34 * s, B - 12 * s], [R + 58 * s, B + 2 * s], [R + 74 * s, B - 8 * s]], 4 * s, [72, 68, 80], 2 * s);
  // base body
  pen.rrect([L, T], [R, B], 6 * s, [116, 124, 142], OUT, 4 * s);
  pen.rrect([L + 5 * s, T + 11 * s], [R - 5 * s, B - 4 * s], 4 * s, BONE_D);
  // keypad
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) pen.circle(L + 15 * s + c * 9 * s, T + 19 * s + r * 5.4 * s, 2.2 * s, [92, 96, 112]);
  }
  // handset: two earpieces, then the bar over them
  const hw = w + 14 * s, hy = T - 5 * s;
  pen.circle(x - hw / 2 + 7 * s, hy, 11 * s, [76, 82, 102], OUT, 3.5 * s);
  pen.circle(x + hw / 2 - 7 * s, hy, 11 * s, [76, 82, 102], OUT, 3.5 * s);
  pen.rrect([x - hw / 2, hy - 8 * s], [x + hw / 2, hy + 8 * s], 8 * s, [76, 82, 102], OUT, 3.5 * s);
  pen.rrect([x - hw / 2 + 18 * s, hy - 4.5 * s], [x + hw / 2 - 18 * s, hy - 1.5 * s], 2 * s, [126, 134, 156]);
}

// Teal two-seater. Bottom of the legs on (x, y).
export function couch(pen, x, y, s = 1) {
  const w = 300 * s;
  const L = x - w / 2, R = x + w / 2, B = y, T = y - 122 * s;
  const armW = 36 * s;
  // feet
  pen.rrect([L + 24 * s, B - 14 * s], [L + 40 * s, B + 12 * s], 3 * s, WOOD_D, OUT, 3 * s);
  pen.rrect([R - 40 * s, B - 14 * s], [R - 24 * s, B + 12 * s], 3 * s, WOOD_D, OUT, 3 * s);
  // back rest
  pen.rrect([L + 12 * s, T], [R - 12 * s, B - 26 * s], 16 * s, [116, 152, 148], OUT, 5 * s);
  pen.line([[x, T + 10 * s], [x, B - 32 * s]], 3.5 * s, [74, 108, 106]);
  // seat cushions
  pen.rrect([L + 8 * s, B - 50 * s], [R - 8 * s, B - 12 * s], 14 * s, [150, 184, 178], OUT, 5 * s);
  pen.line([[x, B - 46 * s], [x, B - 16 * s]], 3.5 * s, [74, 108, 106]);
  // arms
  pen.rrect([L, B - 68 * s], [L + armW, B - 6 * s], 13 * s, [134, 168, 162], OUT, 5 * s);
  pen.rrect([R - armW, B - 68 * s], [R, B - 6 * s], 13 * s, [134, 168, 162], OUT, 5 * s);
  // a mustard cushion nobody sits on
  at(pen, x + 46 * s, B - 60 * s, -0.12, () => {
    pen.rrect([-24 * s, -20 * s], [24 * s, 20 * s], 9 * s, MUST, OUT, 4 * s);
    pen.line([[-6 * s, -14 * s], [-6 * s, 14 * s]], 3 * s, MUST_D);
  });
}

// Retro CRT on stubby legs. Bottom of the legs on (x, y).
export function tv(pen, x, y, s = 1) {
  const w = 174 * s;
  const L = x - w / 2, R = x + w / 2, B = y;
  const bodyH = 108 * s, T = B - bodyH;
  // antenna
  tube(pen, [[x - 14 * s, T], [x - 46 * s, T - 46 * s]], 4 * s, STEEL_D, 2 * s);
  tube(pen, [[x + 14 * s, T], [x + 46 * s, T - 46 * s]], 4 * s, STEEL_D, 2 * s);
  pen.circle(x - 48 * s, T - 50 * s, 5 * s, MUST, OUT, 2.5 * s);
  pen.circle(x + 48 * s, T - 50 * s, 5 * s, MUST, OUT, 2.5 * s);
  // legs
  pen.rrect([L + 20 * s, B - 10 * s], [L + 32 * s, B + 12 * s], 3 * s, WOOD_D, OUT, 3 * s);
  pen.rrect([R - 32 * s, B - 10 * s], [R - 20 * s, B + 12 * s], 3 * s, WOOD_D, OUT, 3 * s);
  // cabinet
  pen.rrect([L, T], [R, B - 8 * s], 10 * s, [178, 152, 114], OUT, 5 * s);
  // screen
  pen.rrect([L + 11 * s, T + 11 * s], [L + 120 * s, B - 20 * s], 9 * s, [64, 78, 88], OUT, 4 * s);
  pen.rrect([L + 17 * s, T + 17 * s], [L + 114 * s, B - 26 * s], 6 * s, [120, 158, 172]);
  // glare
  pen.polygon([[L + 24 * s, T + 24 * s], [L + 56 * s, T + 24 * s], [L + 24 * s, B - 40 * s]], [198, 222, 228]);
  // dials
  pen.circle(L + 142 * s, T + 30 * s, 8 * s, [92, 86, 78], OUT, 3 * s);
  pen.circle(L + 142 * s, T + 58 * s, 8 * s, [92, 86, 78], OUT, 3 * s);
  pen.rrect([L + 132 * s, T + 76 * s], [L + 152 * s, B - 22 * s], 3 * s, [92, 86, 78], OUT, 3 * s);
}

// Floor lamp with a cone of light. Base on (x, y).
export function lamp(pen, x, y, s = 1) {
  const poleH = 196 * s;
  const topY = y - poleH;
  // light pool on the floor
  alpha(pen, 0.16, () => pen.polygon([[x - 54 * s, topY + 54 * s], [x + 54 * s, topY + 54 * s], [x + 150 * s, y + 6 * s], [x - 150 * s, y + 6 * s]], [252, 238, 178]));
  pen.ellipse(x, y, 32 * s, 11 * s, [96, 90, 100], OUT, 4 * s);
  pen.rrect([x - 4.5 * s, topY + 26 * s], [x + 4.5 * s, y - 6 * s], 3 * s, [124, 118, 128], OUT, 3 * s);
  // shade
  pen.polygon([[x - 26 * s, topY - 12 * s], [x + 26 * s, topY - 12 * s], [x + 48 * s, topY + 46 * s], [x - 48 * s, topY + 46 * s]], MUST, OUT, 5 * s);
  pen.polygon([[x - 20 * s, topY - 8 * s], [x - 6 * s, topY - 8 * s], [x - 10 * s, topY + 42 * s], [x - 24 * s, topY + 42 * s]], MUST_D);
  // bulb
  pen.ellipse(x, topY + 50 * s, 16 * s, 9 * s, [252, 240, 186]);
}

/* ---------------------------------------------------------------- park -- */

// Wooden slat bench. Bottom of the legs on (x, y).
export function bench(pen, x, y, s = 1) {
  const w = 300 * s;
  const L = x - w / 2, R = x + w / 2, B = y;
  const seatT = B - 92 * s, seatB = B - 78 * s;
  // legs
  pen.rrect([L + 22 * s, seatB], [L + 38 * s, B], 3 * s, [96, 96, 104], OUT, 4 * s);
  pen.rrect([R - 38 * s, seatB], [R - 22 * s, B], 3 * s, [96, 96, 104], OUT, 4 * s);
  pen.rrect([x - 30 * s, seatB], [x - 16 * s, B], 3 * s, [82, 82, 90], OUT, 3.5 * s);
  // back posts
  pen.rrect([L + 26 * s, B - 156 * s], [L + 42 * s, seatT + 4 * s], 3 * s, [104, 104, 112], OUT, 4 * s);
  pen.rrect([R - 42 * s, B - 156 * s], [R - 26 * s, seatT + 4 * s], 3 * s, [104, 104, 112], OUT, 4 * s);
  // back slats
  pen.rrect([L + 6 * s, B - 152 * s], [R - 6 * s, B - 136 * s], 5 * s, WOOD, OUT, 4.5 * s);
  pen.rrect([L + 6 * s, B - 128 * s], [R - 6 * s, B - 112 * s], 5 * s, WOOD, OUT, 4.5 * s);
  // seat slats
  pen.rrect([L, seatT], [R, seatB], 5 * s, [198, 152, 100], OUT, 4.5 * s);
  pen.rrect([L, seatB - 14 * s], [R, seatB], 4 * s, WOOD, OUT, 4.5 * s);
  pen.line([[L + 8 * s, seatT + 7 * s], [R - 8 * s, seatT + 7 * s]], 2.5 * s, [224, 184, 130]);
}

// One flower on a stem. `col` is the petal colour. Stem base on (x, y).
export function flower(pen, x, y, s = 1, col = [232, 90, 120]) {
  const stemH = 64 * s;
  const topY = y - stemH;
  tube(pen, [[x, y], [x + 3 * s, y - stemH * 0.5], [x - 2 * s, topY]], 6 * s, GREEN, 2.5 * s);
  pen.ellipse(x + 15 * s, y - 26 * s, 15 * s, 7 * s, GREEN, OUT, 3 * s, -0.45);
  pen.ellipse(x - 14 * s, y - 44 * s, 14 * s, 6.5 * s, GREEN_D, OUT, 3 * s, 0.45);
  bloom(pen, x, topY - 12 * s, 16 * s, col);
}

// Wrapped bouquet of blooms. Bottom of the paper cone on (x, y).
export function bouquet(pen, x, y, s = 1) {
  const B = y;
  const wrapT = B - 74 * s;
  // blooms behind the paper
  const heads = [
    [-30, -114, [232, 90, 120]], [-4, -132, [244, 206, 96]], [28, -110, [236, 236, 228]],
    [-18, -150, [198, 86, 150]], [22, -148, [230, 120, 90]],
  ];
  for (const [dx, dy, c] of heads) bloom(pen, x + dx * s, B + dy * s, 19 * s, c);
  pen.line([[x - 22 * s, B - 96 * s], [x - 8 * s, wrapT + 4 * s]], 4 * s, GREEN);
  pen.line([[x + 20 * s, B - 100 * s], [x + 6 * s, wrapT + 4 * s]], 4 * s, GREEN);
  // paper cone
  pen.polygon([[x - 36 * s, wrapT], [x + 36 * s, wrapT], [x + 13 * s, B], [x - 13 * s, B]], BONE, OUT, 4.5 * s);
  pen.line([[x - 18 * s, wrapT + 10 * s], [x - 5 * s, B - 8 * s]], 3 * s, BONE_DD);
  pen.line([[x + 18 * s, wrapT + 10 * s], [x + 5 * s, B - 8 * s]], 3 * s, BONE_DD);
  // ribbon
  pen.rrect([x - 31 * s, B - 62 * s], [x + 31 * s, B - 46 * s], 4 * s, RED, OUT, 3.5 * s);
  at(pen, x + 26 * s, B - 60 * s, 0.5, () => {
    pen.polygon([[-8 * s, 0], [-26 * s, -12 * s], [-20 * s, 4 * s]], RED, OUT, 3 * s);
    pen.polygon([[-8 * s, 0], [-24 * s, 12 * s], [-16 * s, -2 * s]], RED_D, OUT, 3 * s);
  });
}

// A cone of ice cream. Tip of the cone on (x, y).
export function iceCream(pen, x, y, s = 1) {
  const coneH = 58 * s;
  pen.polygon([[x - 20 * s, y], [x + 20 * s, y], [x, y - coneH]], [204, 156, 92], OUT, 4 * s);
  pen.line([[x - 12 * s, y - 8 * s], [x + 2 * s, y - coneH + 12 * s]], 2.5 * s, [166, 118, 64]);
  pen.line([[x + 12 * s, y - 8 * s], [x - 2 * s, y - coneH + 12 * s]], 2.5 * s, [166, 118, 64]);
  pen.circle(x - 2 * s, y - coneH - 10 * s, 20 * s, [236, 150, 172], OUT, 4 * s);
  pen.circle(x + 11 * s, y - coneH - 24 * s, 17 * s, BONE, OUT, 4 * s);
  pen.circle(x - 1 * s, y - coneH - 40 * s, 15 * s, [238, 188, 84], OUT, 4 * s);
  pen.circle(x + 4 * s, y - coneH - 55 * s, 8.5 * s, RED, OUT, 3 * s);
}

/* -------------------------------------------------------------- funeral -- */

// A heap of sympathy cards. Base of the heap on (x, y).
export function cardPile(pen, x, y, s = 1) {
  const w = 112 * s, h = 78 * s;
  const cards = [
    { dx: -34, dy: -16, a: -0.26, col: BONE_D },
    { dx: 30, dy: -12, a: 0.18, col: [238, 230, 214] },
    { dx: -4, dy: -26, a: -0.06, col: BONE },
  ];
  cards.forEach((c) => {
    at(pen, x + c.dx * s, y + c.dy * s - h * 0.5 + 10 * s, c.a, () => {
      pen.rrect([-w / 2, -h / 2], [w / 2, h / 2], 3 * s, c.col, OUT, 3.5 * s);
      heart(pen, 0, -8 * s, 12 * s, RED, OUT, 2.5 * s);
      pen.line([[-w * 0.28, 16 * s], [w * 0.28, 16 * s]], 2.5 * s, BONE_DD);
      pen.line([[-w * 0.18, 26 * s], [w * 0.18, 26 * s]], 2.5 * s, BONE_DD);
    });
  });
  // a standing card leaning at the front
  at(pen, x + 8 * s, y - 6 * s, 0.05, () => {
    pen.polygon([[-26 * s, 0], [-26 * s, -62 * s], [26 * s, -62 * s], [26 * s, 0]], [250, 246, 236], OUT, 3.5 * s);
    pen.polygon([[-26 * s, -62 * s], [0, -78 * s], [26 * s, -62 * s]], BONE_D, OUT, 3.5 * s);
    heart(pen, 0, -34 * s, 12 * s, RED, OUT, 2.5 * s);
  });
  // a small envelope down the side
  at(pen, x - 58 * s, y - 14 * s, -0.18, () => {
    pen.rrect([-22 * s, -15 * s], [22 * s, 15 * s], 2 * s, [236, 226, 206], OUT, 3 * s);
    pen.line([[-22 * s, -14 * s], [0, 3 * s], [22 * s, -14 * s]], 2.5 * s, BONE_DD);
  });
}

// A standing funeral wreath on a tripod. Feet on (x, y).
export function wreath(pen, x, y, s = 1) {
  const cy = y - 118 * s, r = 60 * s;
  // tripod: two splayed legs and a stay, fixed to the underside of the ring
  tube(pen, [[x - r * 0.5, cy + r * 0.72], [x - r * 0.78, y]], 5 * s, [98, 92, 88], 2.5 * s);
  tube(pen, [[x + r * 0.5, cy + r * 0.72], [x + r * 0.78, y]], 5 * s, [98, 92, 88], 2.5 * s);
  tube(pen, [[x, cy + r * 0.9], [x, y - 2 * s]], 5 * s, [116, 110, 104], 2.5 * s);
  // foliage ring
  pen.circle(x, cy, r, [46, 84, 66], OUT, 12 * s);
  pen.circle(x, cy, r, null, [30, 24, 28], 3 * s);
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * TAU;
    pen.ellipse(x + Math.cos(a) * r, cy + Math.sin(a) * r, 12 * s, 7.5 * s,
      i % 3 === 0 ? [104, 148, 100] : [72, 116, 84], OUT, 3 * s, a);
  }
  // crimson bow + banner
  pen.rrect([x - 54 * s, cy - 17 * s], [x + 54 * s, cy + 19 * s], 4 * s, BONE, OUT, 4 * s);
  pen.text('REST', x, cy - 4 * s, 17 * s, [60, 54, 64], { bold: true });
  pen.text('EASY', x, cy + 12 * s, 17 * s, [60, 54, 64], { bold: true });
}

// A framed portrait, the kind nobody wants to be handed. Bottom of the frame
// on (x, y).
export function framedPortrait(pen, x, y, s = 1) {
  const w = 124 * s, h = 152 * s;
  const L = x - w / 2, R = x + w / 2, T = y - h, B = y;
  // frame
  pen.rrect([L, T], [R, B], 6 * s, WOOD_D, OUT, 6 * s);
  pen.rrect([L + 8 * s, T + 8 * s], [R - 8 * s, B - 8 * s], 3 * s, [70, 64, 72], OUT, 3.5 * s);
  // the departed, smiling
  const fy = T + h * 0.5;
  pen.circle(x, fy - 6 * s, 40 * s, [212, 206, 222]);
  // hair
  pen.chord(x, fy - 22 * s, 30 * s, 30 * s, Math.PI, TAU, [122, 82, 62]);
  pen.circle(x, fy - 8 * s, 26 * s, SKIN);
  pen.chord(x, fy - 20 * s, 28 * s, 26 * s, Math.PI * 0.98, TAU * 1.02, [132, 90, 66]);
  // eyes + smile
  pen.circle(x - 10 * s, fy - 12 * s, 3 * s, OUT);
  pen.circle(x + 10 * s, fy - 12 * s, 3 * s, OUT);
  pen.arc(x, fy - 4 * s, 10 * s, 8 * s, 0.25, Math.PI - 0.25, 3 * s, OUT);
  // shoulders
  pen.chord(x, fy + 46 * s, 46 * s, 34 * s, Math.PI, TAU, TEAL);
  // black mourning ribbon across a corner
  at(pen, L + 26 * s, T + 60 * s, -0.7, () => {
    pen.polygon([[-9 * s, -34 * s], [9 * s, -34 * s], [5 * s, 40 * s], [-1 * s, 30 * s], [-7 * s, 42 * s]], DARK, OUT, 3 * s);
  });
  // easel feet
  tube(pen, [[x - 26 * s, B], [x - 34 * s, B + 12 * s]], 5 * s, WOOD_D, 2.5 * s);
  tube(pen, [[x + 26 * s, B], [x + 34 * s, B + 12 * s]], 5 * s, WOOD_D, 2.5 * s);
}

// Medal on a ribbon. (x, y) is where the ribbon is pinned; the disc hangs and
// swings under it.
export function medal(pen, x, y, s = 1, t = 0) {
  const swing = Math.sin(t * 2.4) * 0.26;
  const rx = x + Math.sin(swing) * 66 * s;
  const ry = y + Math.cos(swing) * 66 * s;
  // two straps
  tube(pen, [[x - 13 * s, y], [rx - 11 * s, ry - 8 * s]], 8 * s, RED, 2.5 * s);
  tube(pen, [[x + 13 * s, y], [rx + 11 * s, ry - 8 * s]], 8 * s, RED_D, 2.5 * s);
  // disc
  const cy = ry + 12 * s;
  pen.circle(rx, cy, 23 * s, [226, 184, 84], OUT, 4.5 * s);
  pen.circle(rx, cy, 15 * s, [246, 224, 148]);
  pen.text('\u2605', rx, cy + 1 * s, 22 * s, [176, 132, 48], {});
  // a scrap of ribbon at the top
  at(pen, x, y - 2 * s, 0, () => {
    pen.polygon([[-16 * s, -6 * s], [16 * s, -6 * s], [12 * s, 6 * s], [-12 * s, 6 * s]], MUST, OUT, 3 * s);
  });
}

/* -------------------------------------------------------------- office -- */

// A cubicle: partition walls, desk, monitor. Floor contact at (x, y).
export function cubicle(pen, x, y, s = 1) {
  const w = 400 * s;
  const L = x - w / 2, R = x + w / 2, B = y;
  const deskY = B - 110 * s;
  // side partitions
  pen.rrect([L, B - 208 * s], [L + 24 * s, B], 4 * s, [178, 180, 188], OUT, 5 * s);
  pen.rrect([R - 24 * s, B - 208 * s], [R, B], 4 * s, [158, 160, 172], OUT, 5 * s);
  pen.line([[L + 6 * s, B - 196 * s], [L + 6 * s, B - 12 * s]], 3 * s, [140, 142, 154]);
  // back panel
  pen.rrect([L + 12 * s, B - 248 * s], [R - 12 * s, B - 186 * s], 4 * s, [196, 198, 206], OUT, 5 * s);
  // pinboard
  pen.rrect([x - 84 * s, B - 240 * s], [x + 84 * s, B - 194 * s], 3 * s, [214, 174, 108], OUT, 4 * s);
  pen.rrect([x - 76 * s, B - 232 * s], [x - 44 * s, B - 202 * s], 2 * s, [252, 248, 238], OUT, 2.5 * s);
  pen.rrect([x - 38 * s, B - 228 * s], [x - 8 * s, B - 198 * s], 2 * s, [244, 236, 176], OUT, 2.5 * s);
  heart(pen, x + 34 * s, B - 216 * s, 12 * s, RED, OUT, 2.5 * s);
  // desk top + front panel
  pen.rrect([L + 16 * s, deskY], [R - 16 * s, deskY + 16 * s], 4 * s, [172, 150, 118], OUT, 5 * s);
  pen.rrect([L + 16 * s, deskY + 16 * s], [R - 16 * s, B - 10 * s], 3 * s, [198, 186, 164], OUT, 4 * s);
  pen.line([[L + 30 * s, deskY + 32 * s], [R - 30 * s, deskY + 32 * s]], 3 * s, [172, 160, 140]);
  // monitor
  pen.rrect([x - 96 * s, deskY - 76 * s], [x - 22 * s, deskY - 6 * s], 5 * s, [72, 74, 86], OUT, 4.5 * s);
  pen.rrect([x - 88 * s, deskY - 68 * s], [x - 30 * s, deskY - 16 * s], 3 * s, [110, 150, 160]);
  pen.rrect([x - 66 * s, deskY - 8 * s], [x - 52 * s, deskY], 2 * s, [72, 74, 86], OUT, 3 * s);
  // keyboard, mug, papers
  pen.rrect([x - 12 * s, deskY - 20 * s], [x + 44 * s, deskY - 4 * s], 3 * s, [236, 232, 222], OUT, 3 * s);
  pen.rrect([x + 62 * s, deskY - 42 * s], [x + 92 * s, deskY - 2 * s], 4 * s, TEAL, OUT, 3.5 * s);
  pen.arc(x + 92 * s, deskY - 26 * s, 12 * s, 12 * s, -Math.PI / 2, Math.PI / 2, 6 * s, TEAL);
  pen.line([[x + 66 * s, deskY - 34 * s], [x + 88 * s, deskY - 34 * s]], 2.5 * s, [144, 190, 188]);
  for (let i = 0; i < 3; i++) pen.rrect([L + 34 * s + i * 4 * s, deskY - 10 * s - i * 3 * s], [L + 96 * s + i * 4 * s, deskY - 2 * s - i * 3 * s], 2 * s, BONE, OUT, 2.5 * s);
}

// Office chair. Casters on (x, y). Drawn behind the seated character.
export function chair(pen, x, y, s = 1) {
  const B = y;
  const seatT = B - 132 * s, seatB = B - 108 * s;
  // star base
  tube(pen, [[x, seatB], [x - 44 * s, B - 6 * s]], 5 * s, STEEL_D, 2.5 * s);
  tube(pen, [[x, seatB], [x + 44 * s, B - 6 * s]], 5 * s, STEEL_D, 2.5 * s);
  tube(pen, [[x, seatB], [x - 10 * s, B - 2 * s]], 5 * s, STEEL_D, 2.5 * s);
  tube(pen, [[x, seatB], [x + 12 * s, B - 2 * s]], 5 * s, STEEL_D, 2.5 * s);
  for (const dx of [-44, 44, -10, 12]) pen.circle(x + dx * s, B - 2 * s, 7 * s, DARK, OUT, 3 * s);
  // gas cylinder
  pen.rrect([x - 7 * s, seatB - 6 * s], [x + 7 * s, B - 26 * s], 3 * s, STEEL, OUT, 3 * s);
  // seat
  pen.rrect([x - 46 * s, seatT], [x + 46 * s, seatB + 4 * s], 9 * s, [98, 106, 126], OUT, 4.5 * s);
  pen.rrect([x - 38 * s, seatT + 5 * s], [x + 38 * s, seatB - 2 * s], 6 * s, [124, 134, 158]);
  // back rest
  pen.rrect([x - 32 * s, seatT - 112 * s], [x + 32 * s, seatT - 14 * s], 12 * s, [92, 100, 122], OUT, 4.5 * s);
  pen.rrect([x - 24 * s, seatT - 100 * s], [x + 24 * s, seatT - 34 * s], 8 * s, [120, 130, 154]);
  pen.rrect([x - 9 * s, seatT - 16 * s], [x + 9 * s, seatT - 4 * s], 3 * s, STEEL_D, OUT, 3 * s);
  // arm rests, set outboard of the back rest so the seat stays visible
  for (const sx of [-1, 1]) {
    pen.rrect([x + sx * 30 * s, seatT - 38 * s], [x + sx * 60 * s, seatT - 29 * s], 4 * s, [78, 86, 106], OUT, 3.5 * s);
    pen.rrect([x + sx * 52 * s, seatT - 29 * s], [x + sx * 60 * s, seatT + 2 * s], 3 * s, [78, 86, 106], OUT, 3 * s);
  }
}

/* ------------------------------------------------------------ hospital -- */

// Cardiac monitor on a trolley. Wheels on (x, y); the trace runs on `t`.
export function heartMonitor(pen, x, y, s = 1, t = 0) {
  const B = y;
  const topY = B - 208 * s;
  // wheels + base
  pen.circle(x - 28 * s, B - 9 * s, 9 * s, DARK, OUT, 3.5 * s);
  pen.circle(x + 28 * s, B - 9 * s, 9 * s, DARK, OUT, 3.5 * s);
  pen.rrect([x - 44 * s, B - 22 * s], [x + 44 * s, B - 6 * s], 4 * s, STEEL_D, OUT, 3.5 * s);
  // pole
  tube(pen, [[x, B - 18 * s], [x, topY + 46 * s]], 8 * s, STEEL, 2.5 * s);
  // box
  const mw = 104 * s, mh = 82 * s;
  pen.rrect([x - mw / 2, topY], [x + mw / 2, topY + mh], 8 * s, [66, 70, 84], OUT, 5 * s);
  const sl = x - mw / 2 + 10 * s, sr = x + mw / 2 - 10 * s;
  const st = topY + 10 * s, sb = topY + mh - 22 * s;
  pen.rrect([sl, st], [sr, sb], 3 * s, [22, 38, 34]);
  // the trace
  const flat = t > 1.75;
  const N = 64;
  const pts = [];
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    pts.push([lerp(sl, sr, u), lerp(st, sb, flat ? 0.55 : traceV(u, t))]);
  }
  pen.line(pts, 3.4 * s, flat ? [126, 206, 128] : [112, 234, 132]);
  // readout strip
  pen.rrect([sl, sb + 4 * s], [sr, st + mh - 6 * s], 2 * s, [30, 44, 40]);
  // blinking heart + lead wires
  const blink = 0.35 + 0.65 * Math.abs(Math.sin(t * 5));
  pen.text('\u2665', x - 22 * s, sb + 11 * s, 15 * s, [232, 92, 104]);
  pen.text(flat ? '0' : '72', x + 22 * s, sb + 11 * s, 13 * s, [200, 240, 200], {});
  alpha(pen, blink, () => pen.circle(x - mw / 2 - 8 * s, topY + 20 * s, 5 * s, [240, 96, 108]));
  tube(pen, [[x - mw / 2 + 6 * s, topY + mh], [x - 60 * s, B - 40 * s], [x - 96 * s, B - 30 * s]], 4 * s, [70, 70, 84], 2 * s);
}

/** scrolling ECG shape, 0 = top of the screen, 1 = bottom. */
function traceV(u, t) {
  const p = ((u * 2.2 - t * 0.85) % 1 + 1) % 1;
  const g = (c, w) => Math.exp(-Math.pow((p - c) / w, 2));
  let v = 0.62;
  v -= 0.14 * g(0.10, 0.035);
  v += 0.10 * g(0.19, 0.014);
  v -= 0.48 * g(0.23, 0.013);
  v += 0.20 * g(0.28, 0.018);
  v -= 0.12 * g(0.46, 0.05);
  return clamp(v, 0.02, 0.98);
}

// Big dial bathroom scale. The gag spins its own needle around (x, y), so the
// dial face centres there.
export function scaleProp(pen, x, y, s = 1) {
  const r = 92 * s;
  // foot pad
  pen.rrect([x - r * 0.7, y + r * 0.72], [x + r * 0.7, y + r * 0.98], 4 * s, STEEL_D, OUT, 3.5 * s);
  // casing + face
  pen.circle(x, y, r, [190, 188, 180], OUT, 6 * s);
  pen.circle(x, y, r * 0.87, BONE, OUT, 3 * s);
  // red zone + ticks (upper half, angle 0 = right, PI/2 = down)
  pen.arc(x, y, r * 0.78, r * 0.78, -Math.PI * 0.92, -Math.PI * 0.62, 7 * s, RED);
  for (let i = 0; i <= 10; i++) {
    const a = -Math.PI * 0.95 + (i / 10) * Math.PI * 0.9;
    const r0 = r * (i % 5 === 0 ? 0.60 : 0.68), r1 = r * 0.76;
    tube(pen, [[x + Math.cos(a) * r0, y + Math.sin(a) * r0], [x + Math.cos(a) * r1, y + Math.sin(a) * r1]], 2.4 * s, DARK, 1.6 * s);
  }
  pen.text('kg', x, y + r * 0.42, 20 * s, [96, 92, 98], { bold: true });
  pen.circle(x, y, r * 0.14, BONE_D, OUT, 3 * s);
}

/* ---------------------------------------------------------------- road -- */

// Semi truck: `x` is the front bumper, the rig extends to the left. Wheel
// contact at `y`. opts.driverGrin puts a grinning idiot at the wheel.
export function truck(pen, x, y, s = 1, opts = {}) {
  const { driverGrin = false } = opts;
  const B = y;
  const chassisB = B - 44 * s;
  const boxL = x - 376 * s, boxR = x - 120 * s;
  const boxT = B - 232 * s;
  const wr = 34 * s;
  // wheels
  for (const wx of [x - 48 * s, x - 154 * s, x - 264 * s, x - 346 * s]) {
    pen.circle(wx, B - wr, wr, [46, 44, 54], OUT, 4 * s);
    pen.circle(wx, B - wr, wr * 0.44, GREY, OUT, 3 * s);
    pen.circle(wx, B - wr, wr * 0.15, [96, 96, 106]);
  }
  // chassis beam
  pen.rrect([boxL - 8 * s, chassisB - 16 * s], [x, chassisB + 14 * s], 4 * s, [50, 48, 60], OUT, 4 * s);
  // trailer box
  pen.rrect([boxL, boxT], [boxR, chassisB], 6 * s, BONE, OUT, 5.5 * s);
  for (let i = 1; i < 4; i++) pen.line([[lerp(boxL, boxR, i / 4), boxT + 10 * s], [lerp(boxL, boxR, i / 4), chassisB - 8 * s]], 3 * s, BONE_D);
  pen.rrect([boxL + 10 * s, chassisB - 44 * s], [boxR - 10 * s, chassisB - 26 * s], 2 * s, RED, OUT, 3 * s);
  heart(pen, (boxL + boxR) / 2, boxT + 62 * s, 30 * s, RED, OUT, 4 * s);
  // cab
  const cabL = boxR - 6 * s, cabR = x - 8 * s;
  pen.rrect([cabL, B - 174 * s], [cabR, chassisB + 10 * s], 9 * s, TEAL, OUT, 5.5 * s);
  pen.rrect([cabL + 8 * s, B - 148 * s], [cabL + 60 * s, B - 96 * s], 6 * s, [116, 164, 172], OUT, 4 * s);
  pen.rrect([cabR - 58 * s, B - 148 * s], [cabR - 10 * s, B - 96 * s], 6 * s, [128, 176, 184], OUT, 4 * s);
  // chrome stack
  pen.rrect([cabL - 16 * s, B - 222 * s], [cabL - 2 * s, B - 150 * s], 3 * s, STEEL, OUT, 3 * s);
  // bumper, light, plate
  pen.rrect([cabR, B - 76 * s], [cabR + 14 * s, B - 30 * s], 3 * s, STEEL, OUT, 3.5 * s);
  pen.circle(cabR - 18 * s, B - 68 * s, 9 * s, [250, 234, 158], OUT, 3 * s);
  pen.rrect([cabL + 4 * s, B - 44 * s], [cabL + 40 * s, B - 20 * s], 2 * s, BONE, OUT, 2.5 * s);
  if (driverGrin) {
    // the man himself, grinning like nothing is happening
    const fx = cabL + 34 * s, fy = B - 122 * s;
    pen.circle(fx, fy, 20 * s, SKIN, OUT, 4 * s);
    pen.chord(fx, fy - 6 * s, 20 * s, 17 * s, Math.PI, TAU, [86, 62, 46]);
    pen.rrect([fx - 24 * s, fy - 12 * s], [fx + 24 * s, fy - 5 * s], 3 * s, MUST, OUT, 3 * s);
    pen.circle(fx - 8 * s, fy + 1 * s, 3.2 * s, OUT);
    pen.circle(fx + 8 * s, fy + 1 * s, 3.2 * s, OUT);
    pen.chord(fx + 1 * s, fy + 11 * s, 12 * s, 9 * s, 0, Math.PI, [246, 244, 238], OUT, 3 * s);
    pen.circle(fx + 30 * s, fy + 20 * s, 9 * s, SKIN, OUT, 3 * s);
    pen.line([[fx + 22 * s, fy + 22 * s], [fx + 46 * s, fy + 14 * s]], 5 * s, SKIN);
  }
}

// A small cartoon dog, facing left. Paws on (x, y); `t` wags the tail.
export function dog(pen, x, y, s = 1, t = 0) {
  const B = y;
  const bodyY = B - 30 * s;
  const bx = x + 10 * s;
  // back legs
  pen.rrect([bx + 14 * s, bodyY + 2 * s], [bx + 25 * s, B], 4 * s, [176, 138, 92], OUT, 3.5 * s);
  pen.rrect([bx + 1 * s, bodyY + 2 * s], [bx + 12 * s, B], 4 * s, [198, 160, 110], OUT, 3.5 * s);
  // tail
  const wag = -0.62 + Math.sin(t * 7) * 0.55;
  const tx0 = bx + 26 * s, ty0 = bodyY - 8 * s;
  tube(pen, [[tx0, ty0], [tx0 + Math.cos(wag) * 14 * s, ty0 + Math.sin(wag) * 14 * s], [tx0 + Math.cos(wag) * 28 * s, ty0 + Math.sin(wag) * 28 * s]], 9 * s, [198, 160, 110], 3);
  // body
  pen.ellipse(bx, bodyY, 34 * s, 22 * s, [206, 168, 118], OUT, 4 * s);
  // front legs
  pen.rrect([bx - 24 * s, bodyY + 4 * s], [bx - 13 * s, B], 4 * s, [214, 176, 126], OUT, 3.5 * s);
  pen.rrect([bx - 35 * s, bodyY + 4 * s], [bx - 24 * s, B], 4 * s, [190, 152, 102], OUT, 3.5 * s);
  // collar
  tube(pen, [[bx - 30 * s, bodyY - 12 * s], [bx - 23 * s, bodyY + 12 * s]], 8 * s, RED, 2.5 * s);
  // head
  const hx = bx - 40 * s, hy = bodyY - 26 * s;
  pen.ellipse(hx - 12 * s, hy - 13 * s, 9 * s, 15 * s, [150, 114, 72], OUT, 3.5 * s, -0.4);
  pen.circle(hx, hy, 20 * s, [214, 176, 126], OUT, 4 * s);
  pen.ellipse(hx - 15 * s, hy + 6 * s, 15 * s, 10 * s, [234, 198, 148], OUT, 3.5 * s);
  pen.circle(hx - 26 * s, hy + 3 * s, 4.5 * s, OUT);
  pen.circle(hx + 3 * s, hy - 4 * s, 3.8 * s, OUT);
  pen.arc(hx + 6 * s, hy - 8 * s, 7 * s, 5 * s, -1.9, -0.6, 3 * s, OUT);
  pen.arc(hx - 16 * s, hy + 8 * s, 8 * s, 6 * s, 0.2, 2.1, 3 * s, [126, 88, 58]);
  pen.ellipse(hx - 21 * s, hy + 15 * s, 5 * s, 7 * s, [232, 128, 140], OUT, 2.5 * s);
}

// Coffin. (x, y) is the TOP-LEFT of the box, w/h in design units.
export function coffin(pen, x, y, w, h, opts = {}) {
  const { open = false } = opts;
  const bevel = w * 0.15;
  const body = [
    [x, y + h * 0.36], [x + bevel, y], [x + w - bevel, y], [x + w, y + h * 0.36],
    [x + w - bevel, y + h], [x + bevel, y + h],
  ];
  pen.polygon(body, [128, 88, 58], OUT, 5);
  // lid panel
  pen.polygon([
    [x + w * 0.10, y + h * 0.30], [x + w * 0.22, y + h * 0.10],
    [x + w * 0.78, y + h * 0.10], [x + w * 0.90, y + h * 0.30],
    [x + w * 0.74, y + h * 0.90], [x + w * 0.26, y + h * 0.90],
  ], open ? [34, 30, 38] : [156, 110, 72], OUT, 4);
  if (open) {
    // a dark, empty inside
    pen.polygon([
      [x + w * 0.14, y + h * 0.34], [x + w * 0.24, y + h * 0.16],
      [x + w * 0.76, y + h * 0.16], [x + w * 0.86, y + h * 0.34],
      [x + w * 0.72, y + h * 0.86], [x + w * 0.28, y + h * 0.86],
    ], [26, 24, 30]);
  } else {
    pen.line([[lerp(x + w * 0.22, x + w * 0.74, 0.5), y + h * 0.16], [lerp(x + w * 0.26, x + w * 0.74, 0.44), y + h * 0.86]], 3, [104, 70, 44]);
  }
  // brass handles
  pen.rrect([x + w * 0.06, y + h * 0.44], [x + w * 0.16, y + h * 0.58], 3, [214, 176, 92], OUT, 3);
  pen.rrect([x + w * 0.84, y + h * 0.44], [x + w * 0.94, y + h * 0.58], 3, [214, 176, 92], OUT, 3);
  // a little cross on the lid
  if (!open) {
    const mx = x + w * 0.5, my = y + h * 0.44;
    pen.rrect([mx - 3, my - 20], [mx + 3, my + 20], 2, [236, 226, 206]);
    pen.rrect([mx - 16, my - 9], [mx + 16, my - 3], 2, [236, 226, 206]);
  }
}

/* ---------------------------------------------------------------- band -- */

// A trumpet, held: (x, y) is roughly the middle of the instrument.
export function trumpet(pen, x, y, s = 1) {
  const my = y + 4 * s;
  tube(pen, [[x - 56 * s, y], [x - 40 * s, y], [x - 20 * s, my], [x + 34 * s, my]], 11 * s, MUST, 3);
  tube(pen, [[x + 34 * s, my], [x + 50 * s, my - 6 * s], [x + 58 * s, my - 14 * s]], 11 * s, MUST_D, 3);
  // valves
  for (let i = 0; i < 3; i++) {
    const vx = x - 22 * s + i * 20 * s;
    pen.rrect([vx - 6 * s, my - 30 * s], [vx + 6 * s, my + 6 * s], 3 * s, STEEL, OUT, 3 * s);
    pen.circle(vx, my - 32 * s, 6 * s, MUST, OUT, 3 * s);
  }
  // mouthpiece
  pen.rrect([x - 68 * s, y - 7 * s], [x - 54 * s, y + 7 * s], 3 * s, STEEL, OUT, 3 * s);
  // bell
  pen.polygon([[x + 52 * s, my - 14 * s], [x + 96 * s, my - 40 * s], [x + 106 * s, my + 6 * s], [x + 96 * s, my + 26 * s], [x + 52 * s, my + 12 * s]], MUST, OUT, 4 * s);
  pen.polygon([[x + 62 * s, my - 10 * s], [x + 96 * s, my - 32 * s], [x + 100 * s, my + 2 * s], [x + 92 * s, my + 18 * s], [x + 62 * s, my + 8 * s]], [246, 214, 130]);
  // a note flying out
  pen.text('\u266a', x + 122 * s, my - 34 * s, 26 * s, [244, 240, 230], {});
}

// A snare drum, held: (x, y) is the centre of the shell.
export function drum(pen, x, y, s = 1) {
  const rx = 48 * s, ry = 15 * s, hh = 52 * s;
  const T = y - hh / 2, B = y + hh / 2;
  pen.rrect([x - rx, T], [x + rx, B], 4 * s, [190, 84, 76], OUT, 4.5 * s);
  pen.rrect([x - rx, T + hh * 0.34], [x + rx, T + hh * 0.66], 2 * s, BONE, OUT, 3 * s);
  pen.ellipse(x, T, rx, ry, [222, 214, 196], OUT, 4.5 * s);
  pen.ellipse(x, T, rx * 0.72, ry * 0.62, [206, 196, 178]);
  pen.ellipse(x, B, rx, ry, [172, 74, 68], OUT, 4.5 * s);
  // tension rods
  for (const dx of [-1, -0.55, 0, 0.55, 1]) {
    tube(pen, [[x + dx * rx, T + ry * 0.1], [x + dx * rx, B - ry * 0.1]], 4 * s, STEEL, 2 * s);
    pen.rrect([x + dx * rx - 3 * s, T + 3 * s], [x + dx * rx + 3 * s, T + 9 * s], 2 * s, STEEL_D);
  }
  // strap
  tube(pen, [[x - rx, y - 6 * s], [x - rx - 34 * s, y - 30 * s]], 7 * s, [92, 74, 58], 2.5 * s);
  tube(pen, [[x + rx, y - 6 * s], [x + rx + 34 * s, y - 30 * s]], 7 * s, [92, 74, 58], 2.5 * s);
  // crossed sticks over the top
  at(pen, x, T - 4 * s, -0.5, () => {
    pen.rrect([-6 * s, -44 * s], [6 * s, 6 * s], 4 * s, [226, 210, 176], OUT, 3 * s);
    pen.circle(0, -46 * s, 7 * s, MUST, OUT, 3 * s);
  });
  at(pen, x, T - 4 * s, 0.55, () => {
    pen.rrect([-6 * s, -44 * s], [6 * s, 6 * s], 4 * s, [226, 210, 176], OUT, 3 * s);
    pen.circle(0, -46 * s, 7 * s, MUST_D, OUT, 3 * s);
  });
}

/* ---------------------------------------------------------------- index -- */

export const PROPS = {
  phone, couch, tv, lamp, bench, flower, bouquet, iceCream, cardPile, wreath,
  framedPortrait, medal, cubicle, chair, heartMonitor, scaleProp, truck, dog,
  coffin, trumpet, drum,
};
