/*
 * scenes.js — the cartoon.
 *
 * Every scene is draw(ctx, t, length) where t is local seconds. drawFrame()
 * maps global song time -> scene. Pure functions of time = same code drives
 * the live web player AND the offline MP4 renderer.
 */
import {
  Pen, W, H, TAU, clamp, lerp, invlerp, smooth, easeOut, easeIn, easeIO,
  backOut, overshoot, elasticOut, pulse, wiggle, mix, shade, rgb, rgba, rot,
  add, mul, hash,
} from './engine.js';
import { drawChar, defaultPose, PAL } from './char.js';

/* ------------------------------------------------------------- timing --- */
export const BPM = 172.27;
export const BEAT = 60 / BPM;          // 0.3483 s
export const BAR = BEAT * 4;           // 1.393 s
export const FIRST_BEAT = 0.232;
export const DURATION = 159.5;         // song fades out ~159s

/** seconds at the downbeat of bar n (bar 0 = first downbeat). */
export const B = (n) => FIRST_BEAT + n * BAR;
export const beatPulse = (t) => pulse((t - FIRST_BEAT) / BEAT);

/* ---------------------------------------------------------- palette ---- */
const INK = [18, 16, 22];
const C = {
  hero: PAL.punk,
  gf: PAL.gf,
  flash: [255, 255, 255],
};

/* ------------------------------------------------------------ helpers -- */
function fullBg(ctx, col) {
  ctx.fillStyle = rgb(col);
  ctx.fillRect(-4000, -4000, 8000, 8000);
}
function vgrad(ctx, y0, y1, top, bot) {
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  g.addColorStop(0, rgb(top));
  g.addColorStop(1, rgb(bot));
  ctx.fillStyle = g;
  ctx.fillRect(-4000, y0 - 1, 8000, y1 - y0 + 2);
}
function zoom(ctx, cx, cy, z) {
  ctx.translate(cx, cy); ctx.scale(z, z); ctx.translate(-cx, -cy);
}
/** draw a character positioned/rotated/scaled in world space */
function char(ctx, x, y, angle, scale, P, pal) {
  ctx.save();
  ctx.translate(x, y);
  if (angle) ctx.rotate(angle);
  if (scale && scale !== 1) ctx.scale(scale, scale);
  const p = Object.assign({}, P, { x: 0, y: 0 });
  p.face = P.face;
  drawChar(new Pen(ctx), p, pal);
  ctx.restore();
}
function face(mode, over = {}) {
  return Object.assign({
    eyes: 'normal', eye: 1, pupil: [0, 0], brow: 0, brow_lift: 0,
    mouth: 'flat', mouthW: 26, mouthH: 10, blush: 0, tear: 0, sweat: 0,
  }, { eyes: mode }, over);
}
function heart(pen, x, y, s, a = 1) {
  const c = [232, 70, 110];
  pen.circle(x - 5 * s, y, 6 * s, c);
  pen.circle(x + 5 * s, y, 6 * s, c);
  pen.polygon([[x - 10 * s, y + 2 * s], [x + 10 * s, y + 2 * s], [x, y + 14 * s]], c);
}
function stars(pen, t, n, seed) {
  for (let i = 0; i < n; i++) {
    const x = hash(seed + i * 3.1) * W;
    const y = hash(seed + i * 7.7) * 380 + 20;
    const tw = 0.5 + 0.5 * Math.sin(t * 3 + i);
    pen.circle(x, y, 1.4 + tw * 1.6, [255, 255, 245]);
  }
}

/* ================================================================ scenes */

/* 1. title */
function sTitle(ctx, t) {
  fullBg(ctx, [26, 22, 34]);
  ctx.save();
  ctx.globalAlpha = 0.14;
  ctx.fillStyle = rgb([236, 60, 96]);
  for (let i = -8; i < 30; i++) {
    const x = i * 78 - ((t * 34) % 78);
    ctx.save(); ctx.translate(x, 0); ctx.rotate(0.4); ctx.fillRect(0, -900, 30, 2600); ctx.restore();
  }
  ctx.restore();
  const pen = new Pen(ctx);
  const z = overshoot((t - 0.15) / 0.45, 0.2);
  ctx.save(); zoom(ctx, 640, 300, z);
  pen.posterText('MY GIRLFRIEND\u2019S', 640, 262, 84, [250, 250, 252],
    { outline: INK, ow: 10, shadow: [226, 46, 84], sx: 7, sy: 8 });
  pen.posterText('DEAD', 640, 372, 150, [240, 62, 96],
    { outline: INK, ow: 13, shadow: [250, 250, 252], sx: 8, sy: 9 });
  ctx.restore();
  if (t > 0.9) pen.text('a fan-made cartoon', 640, 498, 24, [214, 212, 224], {});
  if (t > 1.25) pen.text('song by The Vandals \u2014 official audio via YouTube', 640, 534, 17, [150, 148, 166], {});
  // bouncing heart
  const hy = 470 + Math.sin(t * 5) * 6;
  heart(pen, 640, hy, 1.1);
}

/* 2. getting ready */
function sReady(ctx, t, len) {
  fullBg(ctx, [66, 60, 84]);
  ctx.fillStyle = rgb([50, 46, 62]); ctx.fillRect(-2000, 520, 6000, 1600);
  // mirror on the wall
  const pen = new Pen(ctx);
  pen.rrect([300, 150], [560, 470], 14, [40, 38, 52], [120, 118, 140], 5);
  pen.rrect([312, 162], [548, 458], 9, [92, 104, 128]);
  // poster on wall
  pen.polygon([[900, 180], [1080, 200], [1060, 400], [880, 380]], [200, 190, 150], INK, 4);
  pen.text('\u2620', 980, 290, 40, [60, 56, 70], {});

  const comb = t > 0.6 && t < 3.2;
  const bob = Math.sin(t * 4) * 2;
  const p = defaultPose({
    x: 640, y: 520, hip_h: 134 + bob, lean: 0.04,
    sh_l: comb ? -2.2 + Math.sin(t * 9) * 0.18 : 0.25,
    el_l: comb ? -1.5 : -0.3,
    sh_r: -0.2, el_r: -0.5,
  });
  p.face = face('happy', { mouth: 'smile', blush: 1, mouthW: 22 });
  drawChar(pen, p, C.hero);
  // comb in raised hand
  if (comb) {
    const S = { hx: 640 + Math.sin(t * 9) * 6, hy: 250 };
    pen.rrect([S.hx - 16, S.hy], [S.hx + 16, S.hy + 12], 3, [230, 90, 120], INK, 3);
  }
  // floating hearts
  for (let i = 0; i < 4; i++) {
    const tt = (t * 0.7 + i * 0.35) % 1;
    heart(pen, 460 + i * 60 + Math.sin(t * 2 + i) * 8, 430 - tt * 200, 0.7 + i * 0.1);
  }
  // flowers appear, he takes them
  if (t > 3.6) {
    const a = clamp((t - 3.6) / 0.5);
    const fx = lerp(400, 640 - 60, a), fy = 470 - a * 40;
    pen.line([[fx, fy + 10], [fx, fy + 60]], 4, [70, 120, 70]);
    for (const [dx, dy, col] of [[-14, 0, [240, 90, 110]], [8, -10, [250, 220, 90]], [0, 8, [240, 140, 180]]]) {
      pen.circle(fx + dx, fy + dy, 11, col, INK, 3);
    }
  }
  const pen2 = new Pen(ctx);
  pen2.text('date night \u2192', 1120, 120, 24, [230, 226, 236], { align: 'center' });
}

/* 3. the knock */
function sKnock(ctx, t, len) {
  vgrad(ctx, 0, 620, [92, 118, 158], [150, 168, 196]);
  fullBg(ctx, [92, 118, 158]);
  ctx.fillStyle = rgb([74, 68, 86]); ctx.fillRect(-2000, 560, 6000, 1600); // sidewalk
  ctx.fillStyle = rgb([120, 96, 84]); ctx.fillRect(-2000, 600, 6000, 1600);
  const pen = new Pen(ctx);
  // house wall
  pen.rect([560, 120], [1400, 600], [126, 104, 96]);
  pen.rect([560, 120], [1400, 140], [86, 70, 66]);
  // door
  pen.rrect([820, 250], [1040, 600], 6, [96, 70, 60], INK, 6);
  pen.rrect([840, 270], [1020, 420], 6, [110, 80, 66], [30, 26, 30], 3);
  pen.circle(1006, 470, 9, [220, 190, 90], INK, 3);
  // door number
  pen.text('13', 930, 200, 34, [240, 230, 210], {});

  // knock animations: 3 knocks
  const knocks = [0.6, 1.8, 3.0, 4.2];
  let knockT = -1;
  for (const k of knocks) if (t > k && t < k + 0.34) knockT = (t - k) / 0.34;
  const reached = knockT >= 0;
  const ext = reached ? Math.sin(knockT * Math.PI) : 0;
  const p = defaultPose({
    x: 700, y: 560, hip_h: 134, lean: 0.03, flip: true,
    sh_l: 1.5 * (0.3 + ext), el_l: -0.35,
    sh_r: -0.15, el_r: -0.3,
  });
  const confused = t > 3.4;
  p.face = confused
    ? face('normal', { eye: 0.9, brow: 0.35, brow_lift: 3, mouth: 'wave', mouthW: 14, mouthH: 6, pupil: [0.4, 0] })
    : face('normal', { mouth: 'smile', mouthW: 20 });
  drawChar(pen, p, C.hero);

  // impact arcs at the door on each knock
  if (reached) {
    const a = knockT;
    pen.arc(830, 420, 40 + a * 30, 60 + a * 40, -1.2, 1.2, 6 * (1 - a), [250, 240, 200]);
    pen.text('KNOCK', 700, 300 - a * 30, 30 + a * 10, [250, 240, 200], {});
  }
  // wristwatch shrug
  if (t > 3.6) {
    pen.text('? ? ?', 700, 250, 44, [250, 250, 250], {});
  }
}

/* 4. peek in the window */
function sPeek(ctx, t, len) {
  // interior view through a window into a dim room
  fullBg(ctx, [46, 40, 56]);
  const pen = new Pen(ctx);
  // room
  pen.rect([0, 0], [W, 560], [72, 62, 84]);
  pen.rect([0, 470], [W, 560], [56, 48, 66]);
  // window frame (we are outside looking in) — border + mullions, not a fill
  pen.polygon([[120, 90], [1160, 90], [1160, 590], [120, 590]], null, [40, 34, 48], 22);
  pen.rect([630, 90], [650, 590], [40, 34, 48]);
  pen.rect([120, 330], [1160, 350], [40, 34, 48]);
  // sill
  pen.rect([96, 560], [1184, 604], [40, 34, 48]);

  // GF lying on the floor, very still
  const lie = defaultPose({
    hip_h: 34, lean: 0.0, head_tilt: 0.25, head_dy: 4,
    sh_l: 1.9, el_l: 0.5, sh_r: -1.6, el_r: 0.4,
    th_l: 1.35, kn_l: 0.35, th_r: 1.55, kn_r: 0.2, sx: 1.0, sy: 1.0,
  });
  lie.face = face('x', { mouth: 'flat', mouthW: 16, mouthH: 6 });
  char(ctx, 760, 540, -Math.PI / 2, 0.85, lie, C.gf);

  // hero outside at the window, waving
  const wavePhase = clamp((t - 0.6) / 2.2);
  const waving = t > 0.6 && t < 4.4;
  const fast = t > 2.4;
  const wave = waving ? Math.sin(t * (fast ? 16 : 8)) * 0.5 : 0;
  const p = defaultPose({
    x: 300, y: 620, hip_h: 134, lean: 0.02,
    sh_l: waving ? -2.3 + wave : 0.15, el_l: waving ? -0.4 : -0.2,
    sh_r: -0.1, el_r: -0.3,
  });
  p.face = face(t > 4.2 ? 'x' : 'happy', {
    mouth: t > 4.2 ? 'flat' : 'smile', mouthW: 20, blush: t > 4.2 ? 0 : 1,
    sweat: t > 3.6 ? 1 : 0, brow: t > 3.8 ? 0.3 : 0, brow_lift: t > 3.8 ? 3 : 0,
  });
  drawChar(pen, p, C.hero);
  if (waving) pen.text('(waving)', 300, 250, 22, [235, 235, 240], {});
  if (t > 4.2) pen.text('\u2026nothing.', 640, 660, 30, [250, 220, 220], {});
}

/* 5. realization */
function sRealize(ctx, t, len) {
  fullBg(ctx, [232, 232, 236]);
  // radial shock lines
  const pen = new Pen(ctx);
  ctx.save();
  ctx.translate(640, 380);
  for (let i = 0; i < 28; i++) {
    const a = (i / 28) * TAU + t * 0.3;
    const r0 = 180 + Math.sin(t * 12 + i) * 14;
    ctx.save(); ctx.rotate(a);
    pen.polygon([[r0, -16], [r0 + 620, 0], [r0, 16]], [250, 240, 210]);
    ctx.restore();
  }
  ctx.restore();
  // frozen record-scratch ring
  const ring = clamp(t / 0.35);
  pen.circle(640, 380, 180 + ring * 60, null, [236, 60, 96], 10 * (1 - ring) + 2);
  // hero close-up
  const shake = t < 0.5 ? Math.sin(t * 60) * 8 : 0;
  const p = defaultPose({
    x: 640 + shake, y: 560, hip_h: 134, lean: -0.04,
    sh_l: -2.2, el_l: -0.5, sh_r: 2.2, el_r: 0.5, sy: 1.06, sx: 0.95,
  });
  p.face = face('wide', {
    eye: 1.5, pupil: [0, -0.5], brow: 0.4, brow_lift: 8, mouth: 'bigo', mouthW: 18, mouthH: 8, sweat: 1,
  });
  const z = 1 + clamp(t / 0.4) * 0.5;
  ctx.save(); zoom(ctx, 640, 380, z);
  drawChar(pen, p, C.hero);
  ctx.restore();
  if (t > 0.35) pen.posterText('!!!', 640, 74, 86, [236, 60, 96], { outline: INK, ow: 9, shadow: [255, 240, 200], sx: 5, sy: 6 });
}

/* 6. denial gags — coffee / mirror / stethoscope */
function sDenial(ctx, t, len) {
  const third = len / 3;
  const seg = Math.min(2, Math.floor(t / third));
  const tl = t - seg * third;
  fullBg(ctx, [58, 52, 72]);
  const pen = new Pen(ctx);
  pen.rect([0, 470], [W, 720], [46, 40, 58]);          // floor
  pen.rect([80, 60], [1200, 470], [72, 64, 86]);        // wall
  // rug
  pen.ellipse(760, 500, 300, 60, [92, 60, 70]);

  // GF lying there for all three gags
  const lie = defaultPose({
    hip_h: 34, head_tilt: 0.25, head_dy: 4,
    sh_l: 1.9, el_l: 0.5, sh_r: -1.6, el_r: 0.4,
    th_l: 1.35, kn_l: 0.35, th_r: 1.55, kn_r: 0.2,
  });
  lie.face = face('x', { mouth: 'flat', mouthW: 16, mouthH: 6 });
  char(ctx, 790, 505, -Math.PI / 2, 0.8, lie, C.gf);

  // hero crouching beside her
  const p = defaultPose({
    x: 420, y: 520, hip_h: 96, lean: -0.18,
    sh_l: 0.9, el_l: -0.6, sh_r: -0.4, el_r: -0.5,
    th_l: -1.1, kn_l: 1.5, th_r: 0.2, kn_r: 1.4,
  });
  p.face = face('normal', { brow: 0.2, brow_lift: 2, eye: 1.0, mouth: 'flat', mouthW: 16 });
  drawChar(pen, p, C.hero);

  if (seg === 0) {
    // coffee
    pen.text('maybe some coffee?', 640, 90, 28, [240, 220, 190], {});
    const tip = clamp((tl - 0.4) / 0.6);
    pen.polygon([[1000, 150], [1060, 150], [1050, 230], [1010, 230]], [240, 240, 245], INK, 4);
    const tilt = tip * 0.9;
    ctx.save(); ctx.translate(1030, 190); ctx.rotate(tilt); ctx.translate(-1030, -190);
    pen.rrect([985, 140], [1075, 245], 8, [250, 250, 252], INK, 4);
    pen.rrect([990, 145], [1070, 210], 4, [110, 70, 46]);
    ctx.restore();
    for (let i = 0; i < 5; i++) {
      const tt = (tl * 2 + i * 0.2) % 1;
      pen.circle(1030 + Math.sin(i) * 6, 200 + tt * 130, 4, [110, 70, 46]);
    }
    // dribbles out of her mouth
    for (let i = 0; i < 3; i++) {
      const tt = (tl * 1.6 + i * 0.3) % 1;
      pen.circle(700 - tt * 30, 470 + tt * 40, 4.5, [110, 70, 46]);
    }
    p.face = face('normal', { mouth: 'smile', mouthW: 18, brow: 0.2 });
  } else if (seg === 1) {
    // mirror under the nose
    pen.text('ok, but is she breathing?', 640, 90, 28, [240, 220, 190], {});
    const my = 452 - clamp((tl - 0.3) / 0.5) * 20;
    pen.rrect([600, my], [660, my + 18], 3, [180, 200, 220], INK, 3);
    pen.line([[600, my + 9], [580, my + 9]], 4, [120, 130, 150]);
    if (tl > 1.1) pen.text('no fog.', 640, 150, 34, [220, 200, 210], {});
    p.face = face('normal', { eye: 1.1, brow: 0.3, brow_lift: 3, mouth: 'wave', mouthW: 14, mouthH: 6 });
  } else {
    // stethoscope
    pen.text('let\u2019s be thorough.', 640, 90, 28, [240, 220, 190], {});
    pen.line([[470, 330], [560, 420], [700, 470]], 9, [40, 40, 50]);
    pen.circle(470, 330, 16, [180, 80, 90], INK, 4);
    pen.circle(700, 470, 18, [200, 200, 210], INK, 4);
    if (tl > 1.2) pen.text('\u2026nope.', 640, 150, 36, [220, 200, 210], {});
    if (tl > 1.5) {
      const s = clamp((tl - 1.5) / 0.4);
      p.face = face('happy', { mouth: 'smirk', mouthW: 18, brow: 0.2 });
      pen.text('so, dinner?', 640, 620, 32, [250, 240, 200], {});
    }
  }
}

/* 7. carry to the car */
function sCarry(ctx, t, len) {
  vgrad(ctx, 0, 560, [96, 122, 160], [168, 184, 206]);
  fullBg(ctx, [120, 140, 176]);
  ctx.fillStyle = rgb([86, 78, 92]); ctx.fillRect(-2000, 520, 6000, 1600);
  ctx.fillStyle = rgb([74, 66, 80]); ctx.fillRect(-2000, 560, 6000, 1600);
  const pen = new Pen(ctx);
  pen.rect([1080, 150], [1100, 560], [60, 58, 70]);
  pen.ellipse(1090, 150, 40, 20, [70, 68, 82]);

  const drag = clamp(t / 3.2);
  const load = clamp((t - 3.2) / 1.4);
  const depart = clamp((t - 5.2) / 2.8);
  const carX = 780 + depart * 1700;

  // car
  pen.ellipse(carX, 560, 150, 16, [50, 46, 58]);
  pen.rrect([carX - 150, 430], [carX + 150, 540], 22, [206, 70, 92], INK, 6);
  pen.polygon([[carX - 90, 430], [carX - 40, 360], [carX + 60, 360], [carX + 100, 430]], [206, 70, 92], INK, 5);
  pen.polygon([[carX - 74, 426], [carX - 34, 372], [carX + 52, 372], [carX + 84, 426]], [150, 200, 230], INK, 4);
  for (const wx of [-88, 92]) {
    pen.circle(carX + wx, 540, 30, [40, 38, 46], INK, 5);
    pen.circle(carX + wx, 540, 12, [190, 190, 200]);
    const a = t * 7;
    pen.line([[carX + wx, 540], [carX + wx + Math.cos(a) * 22, 540 + Math.sin(a) * 22]], 5, [190, 190, 200]);
  }

  // girlfriend: dragged along the ground, then hoisted in
  const gfX = lerp(300, carX - 70, drag);
  const gfY = lerp(516, 466, load);
  const lie = defaultPose({
    hip_h: 30, head_tilt: 0.3, head_dy: 3,
    sh_l: -1.1, el_l: 0.8, sh_r: -0.9, el_r: 0.9,
    th_l: 1.2, kn_l: 0.4, th_r: 1.45, kn_r: 0.3,
  });
  lie.face = face('x', { mouth: 'flat', mouthW: 14, mouthH: 5 });
  char(ctx, gfX, gfY, -Math.PI / 2 + 0.05, 0.8, lie, C.gf);

  // hero, hauling her
  const heroX = lerp(290, carX - 200, drag);
  const hp = defaultPose({
    x: heroX, y: 520, hip_h: 134, lean: -0.12,
    sh_l: -1.5, el_l: -1.0, sh_r: -1.3, el_r: 0.5,
    th_l: -0.3 - drag * 0.25, kn_l: 0.3, th_r: 0.3 + drag * 0.25, kn_r: 0.3,
  });
  hp.face = face('happy', { mouth: 'smile', mouthW: 20, blush: 1 });
  drawChar(pen, hp, C.hero);

  if (t < 3.4) pen.text('come on, we\u2019re gonna be late', 640, 100, 26, [250, 245, 230], {});
  else if (t < 5.4) pen.text('hop in!', 640, 100, 26, [250, 245, 230], {});
  else pen.text('vroom', 640, 100, 30, [255, 240, 200], {});
}

/* 8. driving */
function sDrive(ctx, t, len) {
  vgrad(ctx, 0, 560, [70, 96, 140], [180, 150, 190]);
  fullBg(ctx, [150, 130, 170]);
  ctx.fillStyle = rgb([64, 70, 90]); ctx.fillRect(-2000, 500, 6000, 1600);
  ctx.fillStyle = rgb([52, 56, 74]); ctx.fillRect(-2000, 540, 6000, 1600);
  const pen = new Pen(ctx);
  // scrolling roadside
  for (let i = 0; i < 8; i++) {
    const x = ((i * 260) - (t * 130)) % 2080 - 400;
    pen.rect([x, 300], [x + 26, 520], [70, 66, 82]);
    pen.ellipse(x + 13, 300, 30, 14, [80, 96, 70]);
  }
  // dashed line
  for (let i = 0; i < 12; i++) {
    const x = ((i * 200) - (t * 260)) % 2400 - 400;
    pen.rect([x, 640], [x + 120, 652], [220, 210, 170]);
  }
  // car
  const bob = Math.sin(t * 18) * 3;
  const carX = 640, carY = 470 + bob;
  pen.ellipse(carX, carY + 110, 210, 20, [40, 38, 48]);
  pen.rrect([carX - 250, carY - 60], [carX + 250, carY + 80], 30, [206, 70, 92], INK, 7);
  pen.polygon([[carX - 170, carY - 60], [carX - 90, carY - 160], [carX + 60, carY - 160], [carX + 140, carY - 60]], [206, 70, 92], INK, 6);
  pen.polygon([[carX - 150, carY - 66], [carX - 80, carY - 148], [carX + 48, carY - 148], [carX + 116, carY - 66]], [150, 200, 230], INK, 5);
  // wheels
  for (const wx of [-150, 150]) {
    pen.circle(carX + wx, carY + 78, 40, [40, 38, 46], INK, 6);
    pen.circle(carX + wx, carY + 78, 16, [190, 190, 200]);
    const a = t * 12;
    for (let k = 0; k < 3; k++) {
      const aa = a + k * 2.1;
      pen.line([[carX + wx, carY + 78], [carX + wx + Math.cos(aa) * 30, carY + 78 + Math.sin(aa) * 30]], 5, [190, 190, 200]);
    }
  }
  // hero driving (front seat), GF in back with arm out the window
  const hp = defaultPose({
    x: carX - 80, y: carY + 40, hip_h: 90, lean: 0.05,
    sh_l: 1.5, el_l: -0.9, sh_r: 1.4, el_r: -0.9, th_l: -1.3, kn_l: 1.5, th_r: -1.3, kn_r: 1.5,
  });
  hp.face = face('happy', { mouth: 'grin', mouthW: 18, mouthH: 9 });
  ctx.save(); zoom(ctx, carX, carY, 1);
  drawChar(pen, Object.assign(hp, { x: carX - 90, y: carY + 5, hip_h: 60 }), C.hero);
  const gp = defaultPose({
    hip_h: 40, head_tilt: -0.35, head_dy: 6,
    sh_l: 1.0, el_l: 0.2, sh_r: -1.7 + Math.sin(t * 5) * 0.2, el_r: -0.3,
    th_l: -1.3, kn_l: 1.4, th_r: -1.3, kn_r: 1.4,
  });
  gp.face = face('x', { mouth: 'flat', mouthW: 14, mouthH: 5 });
  char(ctx, carX + 120, carY + 10, -0.1, 0.9, gp, C.gf);
  // sunglasses on GF
  pen.rrect([carX + 92, carY - 78], [carX + 150, carY - 54], 6, [30, 30, 40], INK, 3);
  ctx.restore();
  if (t > 2) pen.text('road trip!', 640, 90, 36, [255, 245, 220], {});
}

/* 9. diner */
function sDiner(ctx, t, len) {
  fullBg(ctx, [92, 80, 68]);
  const pen = new Pen(ctx);
  pen.rect([0, 0], [W, 180], [120, 96, 80]);
  pen.rect([0, 180], [W, 600], [86, 72, 62]);
  // booth
  pen.rrect([80, 300], [760, 620], 18, [150, 70, 80], INK, 6);
  pen.rrect([120, 320], [720, 600], 12, [176, 90, 100]);
  // table
  pen.rrect([380, 470], [1000, 540], 14, [220, 214, 200], INK, 6);
  pen.rect([420, 540], [460, 700], [180, 174, 160]);
  pen.rect([920, 540], [960, 700], [180, 174, 160]);
  // checkered floor
  for (let i = 0; i < 16; i++) for (let j = 0; j < 3; j++) {
    ctx.fillStyle = rgb((i + j) % 2 ? [60, 54, 58] : [80, 72, 76]);
    ctx.fillRect(i * 90, 620 + j * 34, 90, 34);
  }

  // GF sitting opposite, slumped onto the table
  const slump = clamp((t - 0.8) / 1.2);
  const gp = defaultPose({
    hip_h: 78, lean: -0.1 - slump * 0.7, head_tilt: 0.5 * slump,
    sh_l: 1.0, el_l: 0.6, sh_r: -0.6, el_r: 0.5, th_l: -1.3, kn_l: 1.4, th_r: -1.3, kn_r: 1.4,
  });
  gp.face = face('x', { mouth: 'flat', mouthW: 14, mouthH: 5 });
  char(ctx, 800, 470, 0, 0.95, gp, C.gf);

  // hero opposite, cheerful, toasting
  const raise = t > 1.8 ? Math.sin(clamp((t - 1.8) / 1.0) * Math.PI * 0.5) : 0;
  const hp = defaultPose({
    x: 470, y: 470, hip_h: 78, lean: 0.08,
    sh_l: 1.4 - raise * 1.9, el_l: -0.5, sh_r: -0.4, el_r: -0.6,
    th_l: -1.3, kn_l: 1.4, th_r: -1.3, kn_r: 1.4,
  });
  hp.face = face('happy', { mouth: 'grin', mouthW: 18, mouthH: 9, blush: 1 });
  drawChar(pen, Object.assign(hp, { y: 500, hip_h: 60 }), C.hero);

  // milkshakes
  const s1 = 200;
  pen.polygon([[s1 - 26, 430], [s1 + 26, 430], [s1 + 16, 500], [s1 - 16, 500]], [250, 190, 210], INK, 4);
  pen.circle(s1, 424, 26, [250, 210, 225], INK, 4);
  pen.line([[s1, 400], [s1 + 6, 372]], 5, [230, 90, 120]);
  const s2 = 700;
  pen.polygon([[s2 - 26, 430], [s2 + 26, 430], [s2 + 16, 500], [s2 - 16, 500]], [210, 200, 160], INK, 4);
  pen.circle(s2, 424, 26, [230, 220, 180], INK, 4);
  // her shake slides down as she slumps
  const slide = slump;
  pen.circle(s2 + slide * 60, 470 + slide * 70, 5, [230, 220, 180]);

  if (t > 2.4) pen.text('best date ever', 640, 110, 34, [255, 240, 210], {});
}

/* 10. sunset + end card */
function sSunset(ctx, t, len) {
  vgrad(ctx, 0, 620, [250, 150, 90], [240, 90, 120]);
  const pen = new Pen(ctx);
  const sx = 900, sy = 300 + Math.sin(t * 0.6) * 4;
  pen.circle(sx, sy, 110, [255, 230, 150]);
  ctx.save(); ctx.globalAlpha = 0.25;
  pen.circle(sx, sy, 160, [255, 220, 140]);
  ctx.restore();
  vgrad(ctx, 560, 720, [120, 70, 110], [70, 44, 80]);
  // sea
  ctx.fillStyle = rgb([120, 90, 150]); ctx.fillRect(0, 600, W, 120);
  for (let i = 0; i < 6; i++) pen.rect([sx - 60 + i * 20, 606 + i * 12], [sx + 60 - i * 20, 610 + i * 12], [255, 220, 160]);
  ctx.fillStyle = rgb([54, 40, 62]); ctx.fillRect(0, 640, W, 200);

  // hero + GF holding hands, silhouetted-ish
  const sway = Math.sin(t * 1.2) * 0.02;
  const hp = defaultPose({ x: 560, y: 620, hip_h: 134, lean: 0.02, sh_l: 1.1, el_l: -0.2, sh_r: -1.2, el_r: -0.1 });
  hp.face = face('happy', { mouth: 'smile', mouthW: 20, blush: 1 });
  drawChar(pen, hp, C.hero);
  const gp = defaultPose({
    hip_h: 134, lean: -0.04, head_tilt: 0.22, head_dy: 3,
    sh_l: -1.2, el_l: 0.15, sh_r: -0.2, el_r: -0.2,
  });
  gp.face = face('x', { mouth: 'flat', mouthW: 16, mouthH: 5 });
  char(ctx, 720, 620, sway, 1, gp, C.gf);
  // joined hands
  pen.line([[618, 500], [660, 500]], 14, [198, 204, 218]);
  for (let i = 0; i < 3; i++) {
    const tt = (t * 0.5 + i * 0.4) % 1;
    heart(pen, 640 + Math.sin(i * 2) * 30, 470 - tt * 160, 0.6 + i * 0.1);
  }
  // end card
  if (t > 3.0) {
    const a = clamp((t - 3.0) / 0.6);
    ctx.save(); ctx.globalAlpha = a;
    pen.posterText('THE END', 640, 158, 104, [255, 245, 240], { outline: INK, ow: 11, shadow: [200, 60, 90], sx: 7, sy: 8 });
    ctx.restore();
  }
  if (t > 4.2) {
    const pen2 = new Pen(ctx);
    pen2.text('she still had a great time', 640, 240, 26, [255, 232, 224], {});
    pen2.text('\u2665', 640, 320 + Math.sin(t * 4) * 6, 40, [255, 130, 160], {});
  }
}

/* ============================================================== timeline */
export const TIMELINE = [
  { name: 'title', from: B(0), to: B(4), draw: sTitle },
  { name: 'ready', from: B(4), to: B(16), draw: sReady },
  { name: 'knock', from: B(16), to: B(28), draw: sKnock },
  { name: 'peek', from: B(28), to: B(40), draw: sPeek },
  { name: 'realize', from: B(40), to: B(46), draw: sRealize },
  { name: 'denial', from: B(46), to: B(64), draw: sDenial },
  { name: 'carry', from: B(64), to: B(70), draw: sCarry },
  { name: 'drive', from: B(70), to: B(88), draw: sDrive },
  { name: 'diner', from: B(88), to: B(104), draw: sDiner },
  { name: 'sunset', from: B(104), to: DURATION, draw: sSunset },
];

export function sceneAt(t) {
  for (let i = 0; i < TIMELINE.length; i++) {
    if (t >= TIMELINE[i].from && t < TIMELINE[i].to) return { i, scene: TIMELINE[i], t: t - TIMELINE[i].from };
  }
  const last = TIMELINE[TIMELINE.length - 1];
  return { i: TIMELINE.length - 1, scene: last, t: t - last.from };
}

/** master draw — call once per frame with current song time. */
export function drawFrame(ctx, t) {
  const found = sceneAt(t);
  const { scene, t: tl } = found;
  ctx.save();
  // beat bounce on cut
  const localBeat = clamp((tl) / 0.06);
  ctx.translate(W / 2, H / 2);
  const s = 1 + (1 - localBeat) * 0.0;
  ctx.scale(s, s);
  ctx.translate(-W / 2, -H / 2);
  scene.draw(ctx, tl, scene.to - scene.from);
  ctx.restore();
  // global vignette + subtle scanline grain
  const pen = new Pen(ctx);
  ctx.save();
  const g = ctx.createRadialGradient(W / 2, H / 2, 300, W / 2, H / 2, 820);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(0,0,0,0.32)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
  return found;
}
