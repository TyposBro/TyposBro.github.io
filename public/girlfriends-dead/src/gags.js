/*
 * gags.js — the comedy.
 *
 * One implementation per shot in shots.js. Signature (pen, ctx, t, len) where
 * t is LOCAL seconds inside the shot and len is the shot's duration.
 *
 * House rules:
 *   - A joke must read in one frame. If it needs explaining, cut it.
 *   - Cartoon physics, no blood: a head pops off like a bowling ball.
 *   - We never draw the lyrics. We draw the STORY. Symbols only.
 *   - The running gag: the more he retells it, the bigger the lie, the bigger
 *     the reaction, the more he enjoys it.
 */
import {
  Pen, W, H, TAU, clamp, lerp, smooth, easeOut, easeIn, backOut, overshoot,
  elasticOut, pulse, mix, shade, rgb, rot, add, hash,
} from './engine.js';
import { drawChar, defaultPose, PAL, OUTLINE } from './char.js';
import * as fx from './bits.js';
import * as stage from './stage.js';
import * as props from './props.js';

/* ================================================================ helpers */

/** place + rotate + scale a character in world space (feet at x,y). */
function ch(ctx, x, y, angle, scale, P, pal) {
  ctx.save();
  ctx.translate(x, y);
  if (angle) ctx.rotate(angle);
  if (scale && scale !== 1) ctx.scale(scale, scale);
  drawChar(new Pen(ctx), Object.assign({}, P, { x: 0, y: 0 }), pal);
  ctx.restore();
}

function face(mode, over = {}) {
  const f = {
    eyes: mode, eye: 1, pupil: [0, 0], brow: 0, brow_lift: 0,
    mouth: 'flat', mouthW: 26, mouthH: 10, blush: 0, tear: 0, sweat: 0,
  };
  return Object.assign(f, over);
}

function bg(name, pen, t) {
  const fn = stage[name] || stage.street;
  fn(pen, t);
}

/** circular iris so fantasy sequences feel like a thought. */
function iris(ctx, t, dur, cx = 640, cy = 360, rIn = 660) {
  const grow = clamp(t / (dur * 0.22));
  const out = clamp((dur - t) / (dur * 0.16));
  const r = rIn * Math.min(1, grow, out);
  if (r <= 1) return;
  const pen = new Pen(ctx);
  ctx.save();
  ctx.beginPath();
  ctx.rect(-4000, -4000, 8000, 8000);
  ctx.arc(cx, cy, r, 0, TAU, true);
  ctx.fillStyle = 'rgba(14,12,20,0.62)';
  ctx.fill();
  ctx.restore();
  pen.circle(cx, cy, r, null, [250, 244, 226], 5);
}

/** the recurring 4th-wall beat: he checks whether we're watching. */
function smirk(pen, x, y, t, s = 1) {
  if (t < 0.12) return;
  const k = clamp((t - 0.12) / 0.3);
  fx.sparkles(pen, x, y, t * 2, 3, 34 * s);
  ctxAlpha(pen, k, () => {
    pen.text('\u2665', x + 54 * s, y - 46 * s, 22 * s, [240, 120, 150], {});
  });
}

/** our own caption text — never lyrics. */
function caption(pen, str, y = 96, col = [252, 246, 232]) {
  pen.posterText(str, 640, y, 30, col, { outline: OUTLINE, ow: 6, shadow: [30, 26, 36], sx: 3, sy: 3 });
}

function ctxAlpha(pen, a, fn) {
  const c = pen.ctx;
  const prev = c.globalAlpha;
  c.globalAlpha = prev * clamp(a);
  fn();
  c.globalAlpha = prev;
}

/* --------------------------------------------------------- extra people */

const P_NEIGHBOUR = {
  skin: [238, 198, 162], jacket: [86, 128, 92], shirt: [214, 210, 194],
  pants: [102, 98, 90], shoe: [48, 42, 40], hair: 'bald', hair_color: [92, 82, 76],
  studs: false, belt: [62, 56, 52], ol: OUTLINE, lw: 3.4, shadow: [40, 36, 46],
};
const P_BARTENDER = {
  skin: [226, 182, 146], jacket: [70, 74, 96], shirt: [236, 236, 240],
  pants: [58, 56, 66], shoe: [36, 34, 40], hair: 'long', hair_color: [58, 44, 40],
  studs: false, belt: [44, 42, 50], ol: OUTLINE, lw: 3.4,
};
const P_COWORKER = {
  skin: [236, 194, 156], jacket: [126, 108, 168], shirt: [240, 238, 230],
  pants: [72, 76, 100], shoe: [44, 40, 46], hair: 'long', hair_color: [80, 60, 48],
  studs: false, belt: [56, 52, 62], ol: OUTLINE, lw: 3.4,
};
const P_BOSS = {
  skin: [230, 190, 152], jacket: [52, 56, 72], shirt: [214, 216, 226],
  pants: [48, 48, 58], shoe: [34, 32, 38], hair: 'bald', hair_color: [70, 64, 60],
  studs: false, belt: [44, 42, 50], ol: OUTLINE, lw: 3.4,
};
const P_KID = {
  skin: [244, 204, 168], jacket: [232, 96, 72], shirt: [250, 240, 200],
  pants: [90, 120, 180], shoe: [60, 52, 48], hair: 'bob', hair_color: [96, 66, 44],
  studs: false, belt: [70, 62, 58], ol: OUTLINE, lw: 3.2,
};
const P_OLD = {
  skin: [232, 200, 176], jacket: [150, 130, 170], shirt: [244, 240, 236],
  pants: [110, 106, 120], shoe: [62, 56, 60], hair: 'bob', hair_color: [218, 216, 220],
  studs: false, belt: [80, 74, 80], ol: OUTLINE, lw: 3.2,
};
const P_STRANGER = {
  skin: [212, 168, 132], jacket: [120, 92, 76], shirt: [200, 196, 180],
  pants: [64, 60, 70], shoe: [40, 36, 42], hair: 'spike', hair_color: [40, 36, 40],
  studs: false, belt: [50, 46, 54], ol: OUTLINE, lw: 3.4,
};

/** the hero */
const HERO = (o = {}) => defaultPose(Object.assign({ x: 640, y: 560, hip_h: 138 }, o));

function performanceBow(pen, ctx, t) {
  const bow = Math.sin(Math.min(1, t / 1.4) * Math.PI) * 0.7;
  for (let i = 0; i < 4; i++) {
    const p = HERO({ x: 220 + i * 270, y: 590, sh_l: -0.6, sh_r: 0.6, el_l: -1.4 + Math.sin(t * 14) * 0.2, el_r: -1.4 });
    p.face = face('happy', { mouth: 'smile' });
    drawChar(pen, p, i % 2 ? P_COWORKER : P_BOSS);
  }
  const p = HERO({ x: 640, y: 560, lean: bow, sh_l: -1.3, sh_r: 1.3, el_l: -0.6, el_r: -0.6 });
  p.face = face('happy', { mouth: 'grin', mouthW: 24 });
  drawChar(pen, p, PAL.punk);
  if (t > 1.3) {
    for (let i = 0; i < 3; i++) props.flower(pen, 480 + i * 160, 650 - Math.sin(clamp((t - 1.3) / 0.8) * Math.PI) * 210, 0.75, [240, 90, 120]);
  }
}

/* ================================================================== gags */

export const GAGS = {

  /* ------------------------------------------------------------- intro -- */

  // He waits by the phone. Hopeful. Nothing happens.
  'intro-phone'(pen, ctx, t) {
    bg('livingRoom', pen, t);
    const look = t >= 1.6;
    const p = HERO({
      x: 740, hip_h: 138, lean: 0.04,
      sh_l: look ? 1.55 : 1.15, el_l: -1.15,
      sh_r: 0.12, el_r: -0.25, th_l: -0.16, kn_l: 0.1, th_r: 0.14, kn_r: 0.1,
    });
    p.face = look
      ? face('normal', { eye: 0.85, brow_lift: 2, mouth: 'frown', mouthW: 14, mouthH: 4, pupil: [0.4, 0.3] })
      : face('normal', { eye: 1.05, brow_lift: 1, mouth: 'smile', mouthW: 18 });
    drawChar(pen, p, PAL.punk);
    props.phone(pen, 700, 404, 0.85);
    if (look) {
      pen.text('\u2026', 810, 262, 40, [236, 232, 240], {});
      fx.sweat(pen, 796, 300, t - 1.6, 0.8);
    }
    if (t > 2.6) pen.text('\u2716', 700, 382, 24, [232, 92, 104], {});
  },

  // Doorbell. It's the neighbour. He asks the question.
  'intro-door'(pen, ctx, t) {
    bg('doorway', pen, t);
    const open = clamp(t / 0.5);
    const p = HERO({ x: 430, hip_h: 136, lean: 0.03, sh_l: 0.9 - open * 1.5, el_l: -0.5, sh_r: -0.1, el_r: -0.25, flip: true });
    p.face = face('normal', { mouth: 'smile', mouthW: 20, brow_lift: 1 });
    drawChar(pen, p, PAL.punk);
    // neighbour
    const nb = HERO({ x: 880, hip_h: 134, lean: -0.02, sh_l: -0.35, el_l: -0.3, sh_r: 0.2, el_r: -0.6, flip: false });
    nb.face = face('happy', { mouth: 'smile', mouthW: 22 });
    drawChar(pen, nb, P_NEIGHBOUR);
    if (open > 0.6 && t < 3.4) {
      fx.bubble(pen, 900, 250, 150, 130, '?', t - 0.6);
      fx.ding(pen, 1110, 210, 16);
    }
  },

  // TITLE CARD, and the impact knocks the neighbour back.
  'intro-title'(pen, ctx, t, len) {
    bg('doorway', pen, t);
    const p = HERO({ x: 430, hip_h: 136, lean: 0.03, sh_l: 0.4, el_l: -0.3, sh_r: -0.1, el_r: -0.25, flip: true });
    p.face = face('wide', { eye: 1.1, mouth: 'flat', mouthW: 16, brow_lift: 2 });
    drawChar(pen, p, PAL.punk);
    const nb = HERO({ x: 880 + clamp(t / 0.3) * 40, hip_h: 134, lean: -0.25, sh_l: -1.2, el_l: -0.9, sh_r: -1.0, el_r: -0.8 });
    nb.face = face('wide', { eye: 1.2, mouth: 'bigo', mouthW: 12, mouthH: 7 });
    drawChar(pen, nb, P_NEIGHBOUR);
    if (t > 0.1) fx.burst(pen, 640, 360, t - 0.1, { n: 20, r0: 90, r1: 520, col: [255, 240, 190] });
    const z = overshoot(clamp((t - 0.1) / 0.3), 0.25);
    ctx.save();
    ctx.translate(640, 320); ctx.scale(z, z); ctx.translate(-640, -320);
    pen.posterText('MY GIRLFRIEND\u2019S', 640, 286, 76, [250, 250, 252], { outline: OUTLINE, ow: 9, shadow: [226, 46, 84], sx: 6, sy: 7 });
    pen.posterText('DEAD', 640, 382, 132, [240, 62, 96], { outline: OUTLINE, ow: 12, shadow: [250, 250, 252], sx: 7, sy: 8 });
    ctx.restore();
    if (t > 1.0) pen.text('a fan-made cartoon', 640, 470, 20, [226, 220, 230], {});
  },

  /* ----------------------------------------------------------- verse 1 -- */

  // Flashback: the happy bit.
  'v1-happy'(pen, ctx, t) {
    bg('park', pen, t, { sepia: true });
    const him = HERO({ x: 400, y: 545, hip_h: 126, lean: 0.04, sh_l: 1.35, el_l: -0.7, sh_r: -0.15, el_r: -0.3, th_l: -0.85, kn_l: 1.25, th_r: 0.15, kn_r: 0.1 });
    him.face = face('happy', { mouth: 'smile', mouthW: 20, blush: 1 });
    drawChar(pen, him, PAL.punk);
    const her = HERO({ x: 540, y: 545, hip_h: 126, lean: -0.04, sh_l: 0.2, el_l: -0.25, sh_r: -1.3, el_r: -0.6, th_l: -0.15, kn_l: 0.1, th_r: 0.85, kn_r: 1.25 });
    her.face = face('happy', { mouth: 'smile', mouthW: 20, blush: 1 });
    ch(ctx, 540, 545, 0, 1, Object.assign(her, { x: 0, y: 0 }), PAL.gf);
    for (let i = 0; i < 3; i++) fx.heartPop(pen, 470 + i * 30, 300 - ((t * 40 + i * 40) % 140), (t * 0.6 + i * 0.4) % 1, 1.4);
    props.iceCream(pen, 470, 424, 1.0);
    ctxAlpha(pen, 0.30, () => pen.rect([-2000, -2000], [4000, 4000], [222, 186, 128]));
    if (t > 0.2) caption(pen, 'six months earlier\u2026');
  },

  // She leaves with someone else. The heart snaps.
  'v1-dumped'(pen, ctx, t) {
    bg('park', pen, t, { sepia: true });
    const leave = clamp((t - 0.4) / 2.0);
    // the other guy
    const him2 = HERO({ x: 1040 + leave * 200, y: 552, hip_h: 128, lean: 0.02, sh_l: 0.2, el_l: -0.3, sh_r: -0.2, el_r: -0.3 });
    him2.face = face('happy', { mouth: 'grin', mouthW: 18, mouthH: 8 });
    drawChar(pen, him2, P_STRANGER);
    const her = HERO({ x: 880 + leave * 200, y: 552, hip_h: 126, lean: 0.05, sh_l: 1.2, el_l: -0.4, sh_r: -0.2, el_r: -0.2 });
    her.face = face('happy', { mouth: 'smile', mouthW: 18, blush: 1 });
    ch(ctx, 880 + leave * 200, 552, 0, 1, Object.assign(her, { x: 0, y: 0 }), PAL.gf);
    // him, abandoned
    const p = HERO({ x: 400, y: 545, hip_h: 128, lean: -0.05, sh_l: 0.5, el_l: -0.4, sh_r: 0.3, el_r: -0.3, th_l: -0.08, kn_l: 0.05, th_r: 0.08, kn_r: 0.05 });
    p.face = face('normal', { eye: 1.1, brow_lift: 4, mouth: 'o', mouthW: 12, mouthH: 8, pupil: [0.6, 0] });
    drawChar(pen, p, PAL.punk);
    // the flower left behind, and the cracking heart
    props.flower(pen, 400, 492, 1.0, [240, 90, 120]);
    const crack = clamp((t - 1.6) / 0.5);
    pen.circle(400, 236, 34 * (1 - crack * 0.1), [232, 74, 104]);
    if (crack > 0) fx.brokenHeart(pen, 400, 236, t - 1.6, 1.7);
    ctxAlpha(pen, 0.30, () => pen.rect([-2000, -2000], [4000, 4000], [222, 186, 128]));
    if (t > 2.2) pen.text('\u2026', 400, 292, 46, [240, 236, 220], {});
  },

  // Present day. The question lands and he panics.
  'v1-freeze'(pen, ctx, t, len) {
    bg('doorway', pen, t);
    const p = HERO({ x: 470, hip_h: 136, lean: 0.02, sh_l: 0.35, el_l: -0.35, sh_r: -0.1, el_r: -0.25, flip: true });
    const panic = clamp(t / 0.6);
    p.face = face('wide', { eye: 1.0 + panic * 0.25, pupil: [Math.sin(t * 9) * 0.7, 0], brow_lift: 2 + panic * 4, mouth: 'wave', mouthW: 12, mouthH: 4 });
    drawChar(pen, p, PAL.punk);
    const nb = HERO({ x: 880, hip_h: 134, lean: -0.02, sh_l: -0.4, el_l: -0.3, sh_r: 0.25, el_r: -0.6 });
    nb.face = face('normal', { eye: 0.95, brow: 0.2, mouth: 'flat', mouthW: 20 });
    drawChar(pen, nb, P_NEIGHBOUR);
    if (t > 0.2) fx.bubble(pen, 900, 250, 150, 130, '?', t - 0.2);
    fx.sweat(pen, 540, 300, t, 1.0);
    for (let i = 0; i < 3; i++) pen.text('\u2026', 300 - i * 46, 320 + Math.sin(t * 8 + i) * 8, 34, [236, 232, 240], {});
    // deliberate zoom-in on the dread
    ctx.save();
    const z = 1 + clamp(t / 3.2) * 0.35;
    ctx.translate(640, 380); ctx.scale(z, z); ctx.translate(-640, -380);
    ctx.restore();
  },

  /* ----------------------------------------------------------- chorus 1 -- */

  // The first lie. It just falls out of him.
  'ch1-lie'(pen, ctx, t) {
    bg('doorway', pen, t);
    const speak = clamp((t - 0.3) / 0.25);
    const p = HERO({ x: 470, hip_h: 136, lean: 0.05, sh_l: 0.5, el_l: -0.8, sh_r: 0.4, el_r: -0.5, flip: true });
    p.face = face('normal', { eye: 0.9, brow: 0.3, mouth: 'bigo', mouthW: 10, mouthH: 6, sweat: 1 });
    drawChar(pen, p, PAL.punk);
    const nb = HERO({ x: 880, hip_h: 134, lean: -0.03, sh_l: -0.4, el_l: -0.3, sh_r: 0.25, el_r: -0.6 });
    nb.face = face('normal', { eye: 1.0, mouth: 'flat', mouthW: 18 });
    drawChar(pen, nb, P_NEIGHBOUR);
    if (speak > 0) {
      const s = 0.4 + speak * 0.6;
      fx.bubble(pen, 640, 220, 140 * s, 120 * s, '?', 0.3);
      fx.skull(pen, 640, 214, 0.9 * s, [236, 232, 224]);
    }
    if (t > 1.6) fx.ding(pen, 720, 190, 20);
  },

  // The reaction. Big, cartoon, operatic grief.
  'ch1-reaction'(pen, ctx, t) {
    bg('doorway', pen, t);
    const p = HERO({ x: 470, hip_h: 136, sh_l: 0.4, el_l: -0.5, sh_r: 0.2, el_r: -0.3, flip: true });
    p.face = face('normal', { eye: 0.8, brow: 0.4, mouth: 'flat', mouthW: 14, sweat: 1 });
    drawChar(pen, p, PAL.punk);
    const k = clamp(t / 0.4);
    const nb = HERO({ x: 880, hip_h: 134, lean: -0.12, sh_l: -1.2, el_l: -1.1, sh_r: 1.1, el_r: -1.2 });
    nb.face = face('closed', { brow: 0.5, brow_lift: 3, mouth: 'bigo', mouthW: 12, mouthH: 8 });
    drawChar(pen, nb, P_NEIGHBOUR);
    // hat off, hand on heart, tears fountaining
    if (k > 0.4) {
      const hk = clamp((t - 0.4) / 0.5);
      pen.circle(880 - hk * 40, 300 - hk * 60 + hk * hk * 40, 22, [96, 84, 74], OUTLINE, 3);
      for (let i = 0; i < 2; i++) {
        const tt = (t * 1.4 + i * 0.5) % 1;
        pen.ellipse(858 + i * 44, 330 + tt * 160, 5, 12, [140, 200, 255], OUTLINE, 2);
      }
      fx.tumbleweed(pen, 300 + t * 60, 600, t, 0.9);
      if (t > 1.2) pen.text('\u2716', 640, 130, 40, [236, 232, 240], {});
    }
  },

  // He notices: that reaction was useful.
  'ch1-notice'(pen, ctx, t) {
    bg('doorway', pen, t);
    const nb = HERO({ x: 880, hip_h: 134, lean: -0.1, sh_l: -0.9, el_l: -0.8, sh_r: 0.6, el_r: -0.9 });
    nb.face = face('closed', { brow: 0.5, mouth: 'frown', mouthW: 16, mouthH: 5, tear: 1 });
    drawChar(pen, nb, P_NEIGHBOUR);
    const lift = clamp((t - 0.5) / 0.5);
    const p = HERO({ x: 470, hip_h: 136, lean: 0.02, sh_l: 0.3, el_l: -0.3, sh_r: -0.1, el_r: -0.25, flip: true });
    p.face = face('normal', {
      eye: 1.0, pupil: [(1 - lift) * 0.7, 0], brow: 0.15 * lift, brow_lift: 1 + lift * 2,
      mouth: lift > 0.6 ? 'smirk' : 'o', mouthW: 14, mouthH: 6,
    });
    drawChar(pen, p, PAL.punk);
    if (lift > 0.7) {
      fx.ding(pen, 520, 240, 18 + Math.sin(t * 8) * 3, [255, 236, 150]);
      smirk(pen, 470, 300, t - 0.9, 1);
    }
  },

  /* --------------------------------------------- verse 2: the big lies -- */

  // Death story 1: an illness. Iris into the fantasy.
  'v2-lie-1'(pen, ctx, t, len) {
    bg('hospital', pen, t);
    props.heartMonitor(pen, 250, 560, 1.1, t);
    // the sheet-covered lump on the ward bed
    const lump = clamp(t / 0.9);
    pen.ellipse(340, 474, 130 * (0.55 + lump * 0.45), 34, [238, 240, 246], OUTLINE, 5);
    pen.ellipse(300, 458, 30, 22, [228, 230, 238], OUTLINE, 4);
    // the get-well balloons giving up
    for (let i = 0; i < 3; i++) {
      const d = clamp((t - 0.5 - i * 0.18) / 0.7);
      const yy = 214 + d * 74;
      pen.line([[304 + i * 46, yy + 26], [304 + i * 46, 470]], 2, [206, 206, 212]);
      pen.ellipse(304 + i * 46, yy, 22 * (1 - d * 0.42), 26 * (1 - d * 0.48), [[240, 90, 110], [250, 220, 100], [140, 190, 240]][i], OUTLINE, 3);
    }
    const doc = HERO({ x: 840, y: 578, hip_h: 136, lean: -0.04, sh_l: -0.35, el_l: -0.45, sh_r: 0.3, el_r: -0.5 });
    doc.face = face('closed', { brow: 0.55, mouth: 'frown', mouthW: 16, mouthH: 5 });
    drawChar(pen, doc, P_COWORKER);
    iris(ctx, t, len);
    caption(pen, 'VERSION 1', 46);
  },

  // Death story 2: worse, and sillier.
  'v2-lie-2'(pen, ctx, t, len) {
    bg('bathroom', pen, t);
    // the needle buried past the end of the dial
    props.scaleProp(pen, 730, 508, 1.05);
    // a houseplant that has given up
    const droop = clamp(t / 1.6);
    ctx.save();
    ctx.translate(1000, 600); ctx.rotate(droop * 0.85); ctx.translate(-1000, -600);
    props.flower(pen, 1000, 600, 1.4, [176, 198, 120]);
    ctx.restore();
    const by = HERO({ x: 300, y: 585, hip_h: 132, lean: 0.05, sh_l: 0.3, el_l: -0.3, sh_r: -0.2, el_r: -0.4 });
    by.face = face('normal', { eye: 0.9, brow: 0.35, mouth: 'wave', mouthW: 12, mouthH: 4 });
    drawChar(pen, by, P_COWORKER);
    iris(ctx, t, len);
    caption(pen, 'REVISED EDITION', 92);
  },

  // Death story 3: the truck. Full cartoon spectacle.
  'v2-lie-3'(pen, ctx, t, len) {
    bg('street', pen, t);
    const drive = clamp((t - 0.4) / 1.1);
    const tx = lerp(-260, 1180, drive * drive);
    props.truck(pen, tx, 560, 1.0, { driverGrin: true });
    // dust and speed
    if (drive < 1) {
      for (let i = 0; i < 4; i++) fx.puff(pen, tx - 120 - i * 30, 566, (t * 2 + i * 0.25) % 1, 1.2);
      for (let i = 0; i < 3; i++) pen.line([[tx - 200 - i * 40, 520], [tx - 320 - i * 60, 520]], 4, [220, 214, 196]);
    }
    // the little stand-in figure, and the slapstick pop
    const hit = clamp((t - 1.3) / 0.25);
    if (hit < 1) {
      const sp = HERO({ x: 720, hip_h: 120, lean: 0, sh_l: 1.9, el_l: -0.4, sh_r: -1.9, el_r: -0.4 });
      sp.face = face('wide', { eye: 1.3, mouth: 'bigo', mouthW: 12, mouthH: 8 });
      ch(ctx, 720, 560, -hit * 1.2, 1, Object.assign(sp, { x: 0, y: 0 }), P_STRANGER);
    } else {
      fx.burst(pen, 740, 500, t - 1.3, { n: 18, r0: 60, r1: 320, col: [255, 240, 190] });
      // the head rolls off like a bowling ball — no gore, just a ball
      const roll = clamp((t - 1.4) / 1.2);
      const hx = 780 + roll * 420;
      pen.circle(hx, 540 - Math.abs(Math.sin(roll * 6)) * 26, 30, [232, 186, 148], OUTLINE, 5);
      pen.circle(hx - 10, 552, 5, OUTLINE); pen.circle(hx + 10, 552, 5, OUTLINE);
      for (let i = 0; i < 4; i++) pen.arc(hx - 20 + i * 13, 560, 10, 8, 0, Math.PI, 4, OUTLINE);
    }
    iris(ctx, t, len);
    caption(pen, 'BUDGET INCREASED', 92);
  },

  /* ----------------------------------------------------------- chorus 2 -- */

  'ch2-bar'(pen, ctx, t) {
    bg('bar', pen, t);
    const bt = HERO({ x: 900, hip_h: 130, lean: -0.03, sh_l: -1.5, el_l: -0.7, sh_r: -0.3, el_r: -0.3 });
    bt.face = face('normal', { eye: 0.9, mouth: 'flat', mouthW: 16 });
    drawChar(pen, bt, P_BARTENDER);
    const lean = clamp(t / 0.8);
    const p = HERO({ x: 560, hip_h: 132, lean: 0.12 * lean, sh_l: 1.5 * lean, el_l: -1.3, sh_r: 0.2, el_r: -0.4, flip: false });
    p.face = face('normal', { eye: 0.95, brow: 0.25, mouth: 'wave', mouthW: 14, mouthH: 5 });
    drawChar(pen, p, PAL.punk);
    // a hand cupped around the mouth
    pen.circle(600, 330, 16, [242, 197, 158], OUTLINE, 3);
    if (t > 0.9) pen.text('\u2026', 720, 280, 34, [236, 232, 240], {});
  },

  'ch2-scratch'(pen, ctx, t, len) {
    bg('bar', pen, t);
    const freeze = clamp(t / 0.18);
    const bt = HERO({ x: 900, hip_h: 130, lean: -0.03, sh_l: -1.4, el_l: -0.7, sh_r: -0.3, el_r: -0.3 });
    bt.face = face('wide', { eye: 1.15, brow_lift: 4, mouth: 'bigo', mouthW: 10, mouthH: 6 });
    drawChar(pen, bt, P_BARTENDER);
    const p = HERO({ x: 560, hip_h: 132, lean: 0.1, sh_l: 1.2, el_l: -1.1, sh_r: 0.2, el_r: -0.4 });
    p.face = face('normal', { eye: 0.9, brow: 0.2, mouth: 'wave', mouthW: 12, mouthH: 4 });
    drawChar(pen, p, PAL.punk);
    // the whole room turns, hats off, glasses frozen mid-air
    const turn = clamp((t - 0.12) / 0.4);
    for (let i = 0; i < 4; i++) {
      const gx = 180 + i * 90 + turn * 40;
      const gy = 300 - clamp((t - 0.1 - i * 0.03) / 0.6) * 60;
      pen.rrect([gx, gy], [gx + 26, gy + 40], 5, [230, 226, 210], OUTLINE, 3);
      pen.rrect([gx + 3, gy + 6], [gx + 23, gy + 26], 3, [180, 120, 60]);
      if (t > 0.2 + i * 0.04) pen.circle(gx + 13, gy - 20, 18, [220, 216, 200], OUTLINE, 3); // hat, off
    }
    if (t < 0.5) {
      const w = (0.5 - t) * 4;
      for (let i = 0; i < 8; i++) {
        const rr = 120 + i * 90 - t * 400;
        if (rr > 0) pen.circle(640, 320, rr, null, [250, 244, 226], 8 * w);
      }
      pen.posterText('SCRATCH', 640, 150, 60, [250, 226, 120], { outline: OUTLINE, ow: 8, shadow: [30, 26, 36], sx: 4, sy: 5 });
    }
  },

  'ch2-drink'(pen, ctx, t) {
    bg('bar', pen, t);
    const p = HERO({ x: 560, hip_h: 132, lean: 0.05, sh_l: 0.9, el_l: -0.9, sh_r: 0.2, el_r: -0.4 });
    p.face = face('normal', { eye: 0.95, mouth: 'flat', mouthW: 14, brow: 0.1 });
    drawChar(pen, p, PAL.punk);
    // a stranger to the right, and a drink sliding down the bar
    const st = HERO({ x: 1080, hip_h: 130, lean: -0.02, sh_l: -0.3, el_l: -0.3, sh_r: 0.4, el_r: -0.7 });
    st.face = face('closed', { brow: 0.5, mouth: 'flat', mouthW: 14 });
    drawChar(pen, st, P_STRANGER);
    const slide = easeOut(clamp(t / 0.9));
    const dx = lerp(980, 690, slide);
    pen.rrect([dx, 430], [dx + 40, 500], 6, [226, 180, 90], OUTLINE, 4);
    pen.rrect([dx + 4, 436], [dx + 36, 458], 4, [250, 236, 200]);
    if (slide >= 1) {
      const lift = clamp((t - 1.0) / 0.5);
      const s = HERO({ x: 560, hip_h: 132, lean: 0.05 + lift * 0.05, sh_l: 1.6 + lift * 0.4, el_l: -1.3, sh_r: 0.2, el_r: -0.4 });
      s.face = face('happy', { eye: 0.95, mouth: 'smile', mouthW: 18, brow_lift: 2 });
      drawChar(pen, s, PAL.punk);
      if (lift > 0.5) { fx.ding(pen, 520, 240, 20, [255, 236, 150]); smirk(pen, 560, 320, t - 1.0, 0.9); }
    }
  },

  /* ------------------------------------------- verse 3: he LIKES this -- */

  'v3-queue'(pen, ctx, t) {
    bg('office', pen, t);
    props.cubicle(pen, 640, 560, 1.2);
    props.chair(pen, 470, 600, 1.1);
    const p = HERO({ x: 470, y: 560, hip_h: 118, lean: 0.05, sh_l: 0.4, el_l: -0.5, sh_r: 0.3, el_r: -0.4, th_l: -1.2, kn_l: 1.3, th_r: -1.2, kn_r: 1.3 });
    p.face = face('normal', { eye: 0.9, brow_lift: 2, mouth: 'flat', mouthW: 16 });
    drawChar(pen, p, PAL.punk);
    // a queue of coworkers, shuffling in
    for (let i = 0; i < 3; i++) {
      const appear = clamp((t - i * 0.5) / 0.6);
      if (appear <= 0) continue;
      const x = lerp(1400, 980 - i * 150, appear);
      const c = HERO({ x, hip_h: 130, lean: -0.03, sh_l: -0.4, el_l: -0.5, sh_r: 0.3, el_r: -0.6 });
      c.face = face('closed', { brow: 0.5, mouth: 'frown', mouthW: 15, mouthH: 4 });
      drawChar(pen, c, i === 1 ? P_BOSS : P_COWORKER);
      // a comforting hand on his shoulder for the nearest one
      if (i === 0 && appear > 0.9) pen.circle(560, 300, 15, [236, 194, 156], OUTLINE, 3);
    }
  },

  'v3-toohappy'(pen, ctx, t, len) {
    bg('office', pen, t);
    ctx.save();
    const z = 1.5; ctx.translate(640, 400); ctx.scale(z, z); ctx.translate(-640, -400);
    const base = clamp(t / 0.3);
    const caught = clamp((t - 1.6) / 0.35);
    const p = HERO({ x: 640, y: 600, hip_h: 138, lean: 0.02, sh_l: 0.35, el_l: -0.4, sh_r: 0.3, el_r: -0.35 });
    p.face = caught > 0.5
      ? face('normal', { eye: 0.85, brow: 0.4, brow_lift: 3, mouth: 'flat', mouthW: 14 })
      : face('happy', { eye: 1.1, mouth: 'grin', mouthW: 20, mouthH: 9, blush: 1 });
    drawChar(pen, p, PAL.punk);
    if (caught < 0.5) {
      fx.sparkles(pen, 640, 260, t * 2, 6, 90);
      for (let i = 0; i < 3; i++) fx.heartPop(pen, 560 + i * 80, 240 - ((t * 50 + i * 40) % 150), (t + i * 0.3) % 1, 1.2);
    }
    ctx.restore();
    if (caught > 0.6) { fx.sweat(pen, 760, 330, t - 1.6, 1.1); pen.text('\u2026!', 860, 220, 34, [240, 236, 220], {}); }
  },

  'v3-cards'(pen, ctx, t) {
    bg('office', pen, t);
    props.cubicle(pen, 640, 560, 1.2);
    // buried in cards and flowers
    props.cardPile(pen, 350, 520, 1.5);
    props.cardPile(pen, 900, 530, 1.6);
    props.bouquet(pen, 500, 500, 1.3);
    props.bouquet(pen, 800, 496, 1.2);
    props.wreath(pen, 1080, 560, 1.0);
    const hop = Math.abs(Math.sin(clamp((t - 0.5) / 0.6) * Math.PI));
    const p = HERO({ x: 640, y: 560 - hop * 26, hip_h: 130, lean: 0.03, sh_l: 0.8, el_l: -1.2, sh_r: 0.7, el_r: -1.2 });
    p.face = face('happy', { eye: 1.05, mouth: 'grin', mouthW: 20, mouthH: 9, blush: 1 });
    drawChar(pen, p, PAL.punk);
    // a card flutters down
    if (t > 1.2) {
      const f = (t - 1.2) % 1.6;
      pen.rrect([600 + Math.sin(f * 5) * 60, 160 + f * 300], [660 + Math.sin(f * 5) * 60, 194 + f * 300], 3, [252, 246, 232], OUTLINE, 3);
    }
  },

  /* ----------------------------------------------------------- chorus 3 -- */

  'ch3-actout'(pen, ctx, t) {
    bg('street', pen, t);
    const wit = HERO({ x: 920, hip_h: 132, lean: -0.03, sh_l: -0.4, el_l: -0.4, sh_r: 0.3, el_r: -0.5 });
    wit.face = face('normal', { eye: 0.95, brow: 0.2, mouth: 'flat', mouthW: 18 });
    drawChar(pen, wit, P_COWORKER);
    // he mimes the whole catastrophe
    const swing = Math.sin(t * 2.4);
    const p = HERO({ x: 500, hip_h: 134, lean: 0.08 + swing * 0.05, sh_l: 1.8 + swing * 0.6, el_l: -0.6, sh_r: -1.4 - swing * 0.4, el_r: -0.5, th_l: -0.4, kn_l: 0.4, th_r: 0.4, kn_r: 0.4 });
    p.face = face('wide', { eye: 1.15, brow_lift: 3, mouth: 'bigo', mouthW: 12, mouthH: 7 });
    drawChar(pen, p, PAL.punk);
    // a little ghost of the truck mimed in the air
    pen.rrect([820 + swing * 30, 250], [1000 + swing * 30, 330], 12, [206, 70, 92], OUTLINE, 4);
    for (let i = 0; i < 3; i++) pen.line([[760 + swing * 30 - i * 26, 260 + i * 26], [700 + swing * 30 - i * 26, 260 + i * 26]], 4, [220, 214, 196]);
  },

  'ch3-procession'(pen, ctx, t) {
    bg('street', pen, t);
    // mourners behind him
    for (let i = 0; i < 3; i++) {
      const x = 300 - i * 130;
      const bob = Math.abs(Math.sin(t * 3 + i)) * 6;
      const m = HERO({ x, y: 570 - bob, hip_h: 128, lean: 0.02, sh_l: 0.3, el_l: -0.4, sh_r: 0.2, el_r: -0.4 });
      m.face = face('closed', { brow: 0.5, mouth: 'frown', mouthW: 14, mouthH: 4 });
      drawChar(pen, m, i % 2 ? P_COWORKER : P_BOSS);
    }
    // him: veil, armband, her portrait
    const bob = Math.abs(Math.sin(t * 3)) * 8;
    const p = HERO({ x: 700, y: 566 - bob, hip_h: 136, lean: 0.02, sh_l: 1.2, el_l: -1.0, sh_r: -0.9, el_r: -0.6, th_l: -0.3, kn_l: 0.2, th_r: 0.35, kn_r: 0.25 });
    p.face = face('closed', { brow: 0.6, mouth: 'frown', mouthW: 16, mouthH: 5 });
    drawChar(pen, p, PAL.punk);
    props.framedPortrait(pen, 500, 430, 1.1);
    // the mourning veil + hat
    ctxAlpha(pen, 0.48, () => {
      pen.polygon([[648, 216], [752, 216], [742, 308], [658, 308]], [18, 16, 22]);
    });
    pen.ellipse(700, 214, 54, 15, [24, 22, 28], OUTLINE, 4);
    pen.rrect([686, 194], [714, 218], 4, [24, 22, 28], OUTLINE, 3);
    pen.rrect([648, 352], [690, 378], 5, [232, 228, 236], OUTLINE, 3);
  },

  /* ----------------------------------------------- bridge: the truth -- */

  'br-mask'(pen, ctx, t, len) {
    // world drains of colour
    bg('street', pen, t);
    const drain = clamp((t - 0.3) / 1.0);
    ctxAlpha(pen, drain * 0.72, () => pen.rect([-2000, -2000], [4000, 4000], [96, 96, 104]));
    const p = HERO({ x: 640, y: 570, hip_h: 138, lean: -0.02, sh_l: 0.25, el_l: -0.3, sh_r: 0.2, el_r: -0.3 });
    p.face = face('normal', { eye: 0.85, brow: 0.4, brow_lift: 2, mouth: 'frown', mouthW: 16, mouthH: 5 });
    drawChar(pen, p, PAL.punk);
    if (t > 1.2) {
      caption(pen, 'UNRELIABLE NARRATOR', 300, [230, 226, 232]);
    }
  },

  'br-truth'(pen, ctx, t, len) {
    bg('street', pen, t);
    ctxAlpha(pen, 0.55, () => pen.rect([-2000, -2000], [4000, 4000], [110, 112, 122]));
    // across the street: she is fine. She is happy. With someone else.
    const her = HERO({ x: 980, y: 560, hip_h: 130, lean: 0.04, sh_l: 1.1, el_l: -0.4, sh_r: -0.2, el_r: -0.25 });
    her.face = face('happy', { mouth: 'smile', mouthW: 20, blush: 1 });
    ch(ctx, 980, 560, 0, 1, Object.assign(her, { x: 0, y: 0 }), PAL.gf);
    const him2 = HERO({ x: 1140, y: 560, hip_h: 130, lean: -0.03, sh_l: -0.2, el_l: -0.3, sh_r: 0.2, el_r: -0.3 });
    him2.face = face('happy', { mouth: 'grin', mouthW: 18, mouthH: 8 });
    drawChar(pen, him2, P_STRANGER);
    for (let i = 0; i < 2; i++) fx.heartPop(pen, 1060, 330 - ((t * 26 + i * 50) % 130), 1.2, 0.8);
    // and him, shrinking
    const shrink = 1 - clamp(t / len) * 0.28;
    const p = HERO({ x: 340, y: 570, hip_h: 138 * shrink, lean: -0.06, sh_l: 0.2, el_l: -0.25, sh_r: 0.15, el_r: -0.25 });
    p.face = face('normal', { eye: 0.8, brow: 0.45, brow_lift: 1, mouth: 'frown', mouthW: 13, mouthH: 4, tear: clamp(t / 1.6) });
    ctx.save(); ctx.translate(340, 570); ctx.scale(shrink, shrink); ctx.translate(-340, -570);
    drawChar(pen, p, PAL.punk);
    ctx.restore();
  },

  'br-ledge'(pen, ctx, t, len) {
    bg('rooftop', pen, t);
    const wind = Math.sin(t * 9);
    const drop = clamp((t - 1.2) / 0.5);
    const p = HERO({ x: 640, y: 520, hip_h: 138, lean: wind * 0.08, sh_l: -2.1 + wind * 0.5, el_l: -0.5, sh_r: 2.1 - wind * 0.5, el_r: 0.5, th_l: 0.1, kn_l: 0.2, th_r: -0.1, kn_r: 0.2 });
    p.face = face('wide', { eye: 1.25, brow_lift: 4, mouth: 'bigo', mouthW: 12, mouthH: 8, sweat: 1 });
    drawChar(pen, p, PAL.punk);
    // a pigeon lands on his head, unimpressed
    if (t > 1.4) {
      const pk = clamp((t - 1.4) / 0.4);
      pen.ellipse(640, 250 - (1 - pk) * 40, 22, 16, [150, 152, 168], OUTLINE, 3);
      pen.circle(660, 240 - (1 - pk) * 40, 10, [150, 152, 168], OUTLINE, 3);
      pen.polygon([[668, 240 - (1 - pk) * 40], [684, 244 - (1 - pk) * 40], [668, 248 - (1 - pk) * 40]], [240, 190, 80]);
    }
    if (t > 2.4) caption(pen, 'please change the subject', 110, [240, 236, 224]);
    if (drop > 0) pen.text('\u2026', 640, 150, 40, [240, 236, 224], {});
  },

  /* ----------------------------------------------- chorus 4: reactions -- */

  'ch4-kid'(pen, ctx, t) {
    bg('street', pen, t);
    const p = HERO({ x: 420, hip_h: 134, lean: 0.05, sh_l: 0.9, el_l: -0.8, sh_r: 0.2, el_r: -0.3, flip: false });
    p.face = face('normal', { eye: 0.9, brow: 0.25, mouth: 'wave', mouthW: 13, mouthH: 4 });
    drawChar(pen, p, PAL.punk);
    const kid = HERO({ x: 880, y: 580, hip_h: 78, lean: -0.02, sh_l: 0.4, el_l: -0.5, sh_r: 0.3, el_r: -0.5 });
    const melt = clamp((t - 0.8) / 0.5);
    kid.face = melt > 0.5 ? face('wide', { eye: 1.3, brow_lift: 5, mouth: 'bigo', mouthW: 10, mouthH: 6 }) : face('happy', { mouth: 'smile', mouthW: 16 });
    ch(ctx, 880, 580, 0, 0.62, Object.assign(kid, { x: 0, y: 0 }), P_KID);
    // the ice cream drops
    const f = clamp((t - 0.9) / 0.9);
    if (f > 0) {
      const iy = 430 + f * f * 170;
      if (f < 1) props.iceCream(pen, 920, iy, 1.0);
      else { const sc = clamp((t - 1.8) / 0.4); fx.puff(pen, 920, 596, sc, 1.1); }
    }
    if (t > 2.2) { const s = clamp((t - 2.2) / 0.4); pen.line([[880 - 20, 470], [880 + 20, 442]], 6 * s, [236, 194, 156]); }
  },

  'ch4-oldlady'(pen, ctx, t) {
    bg('street', pen, t);
    const p = HERO({ x: 420, hip_h: 134, lean: 0.05, sh_l: 0.9, el_l: -0.8, sh_r: 0.2, el_r: -0.3 });
    p.face = face('normal', { eye: 0.9, brow: 0.25, mouth: 'wave', mouthW: 13, mouthH: 4 });
    drawChar(pen, p, PAL.punk);
    const fall = clamp((t - 1.0) / 0.6);
    const ang = -fall * 1.35;
    const old = HERO({ sh_l: 0.3, el_l: -0.3, sh_r: 0.3, el_r: -0.3 });
    old.face = face('x', { mouth: 'o', mouthW: 10, mouthH: 6 });
    // she topples into his waiting arms
    ch(ctx, 900 - fall * 150, 580, ang, 0.95, Object.assign(old, { x: 0, y: 0 }), P_OLD);
    if (fall > 0.7) {
      const s = HERO({ x: 420, hip_h: 134, lean: 0.22, sh_l: 1.6, el_l: -1.5, sh_r: 1.5, el_r: -1.5, th_l: -0.4, kn_l: 0.6, th_r: 0.4, kn_r: 0.6 });
      s.face = face('wide', { eye: 1.1, brow_lift: 4, mouth: 'flat', mouthW: 12, sweat: 1 });
      drawChar(pen, s, PAL.punk);
    }
  },

  'ch4-dog'(pen, ctx, t) {
    bg('street', pen, t);
    const p = HERO({ x: 420, hip_h: 134, lean: 0.04, sh_l: 0.8, el_l: -0.7, sh_r: 0.2, el_r: -0.3 });
    p.face = face('normal', { eye: 0.9, brow: 0.25, mouth: 'wave', mouthW: 13, mouthH: 4 });
    drawChar(pen, p, PAL.punk);
    props.dog(pen, 900, 596, 1.4, t);
    // the dog tilts, then howls
    if (t > 1.0) {
      const tilt = Math.sin(t * 6) * 0.12;
      ctx.save(); ctx.translate(900, 596); ctx.rotate(tilt); ctx.scale(1, 1); ctx.translate(-900, -596);
      ctx.restore();
      pen.text('\u266a', 760, 300 - ((t * 40) % 60), 34, [236, 232, 240], {});
    }
    if (t > 1.6) { fx.ding(pen, 560, 260, 18); smirk(pen, 420, 320, t - 1.6, 0.95); }
  },

  /* ------------------------------------------------------------ reprise -- */

  'rp-bench'(pen, ctx, t) {
    bg('park', pen, t);
    const sway = Math.sin(t * 1.6) * 0.02;
    const p = HERO({ x: 420, y: 545, hip_h: 126, lean: 0.03 + sway, sh_l: 0.3, el_l: -0.4, sh_r: 1.1, el_r: -0.9, th_l: -0.85, kn_l: 1.25, th_r: 0.15, kn_r: 0.1 });
    p.face = face('normal', { eye: 0.85, brow: 0.3, brow_lift: 1, mouth: 'frown', mouthW: 13, mouthH: 4 });
    drawChar(pen, p, PAL.punk);
    props.flower(pen, 560, 500, 1.0, [240, 90, 120]);
    // the empty half of the bench is the joke
    if (t > 1.0) { pen.text('\u2026', 620, 400 + Math.sin(t * 2) * 4, 40, [236, 232, 240], {}); }
    if (t > 2.0) fx.tumbleweed(pen, 200 + (t - 2.0) * 90, 600, t, 0.85);
  },

  'rp-neighbour'(pen, ctx, t) {
    bg('park', pen, t);
    const p = HERO({ x: 420, y: 545, hip_h: 126, lean: 0.02, sh_l: 0.3, el_l: -0.4, sh_r: 0.25, el_r: -0.35, th_l: -0.85, kn_l: 1.25, th_r: 0.15, kn_r: 0.1 });
    p.face = face('normal', { eye: 0.95, brow: 0.15, mouth: 'flat', mouthW: 16 });
    drawChar(pen, p, PAL.punk);
    const nb = HERO({ x: 900, y: 545, hip_h: 132, lean: -0.02, sh_l: -0.4, el_l: -0.4, sh_r: 0.3, el_r: -0.6 });
    nb.face = face('happy', { mouth: 'smile', mouthW: 20 });
    drawChar(pen, nb, P_NEIGHBOUR);
    if (t > 0.3) fx.bubble(pen, 920, 240, 140, 120, '?', t - 0.3);
    if (t > 1.4) {
      // no hesitation this time
      const k = clamp((t - 1.4) / 0.3);
      pen.text('\u2716', 470, 240, 44 * k, [236, 232, 240], {});
    }
  },

  'rp-flourish'(pen, ctx, t) {
    bg('park', pen, t);
    const nb = HERO({ x: 980, y: 545, hip_h: 132, lean: -0.05, sh_l: -0.9, el_l: -0.8, sh_r: 0.6, el_r: -0.9 });
    nb.face = face('closed', { brow: 0.5, mouth: 'bigo', mouthW: 10, mouthH: 6 });
    drawChar(pen, nb, P_NEIGHBOUR);
    const big = clamp(t / 0.7);
    const p = HERO({ x: 420, y: 545, hip_h: 128, lean: 0.06, sh_l: -1.9 * big, el_l: -0.5, sh_r: 1.9 * big, el_r: -0.5, th_l: -0.3, kn_l: 0.2, th_r: 0.3, kn_r: 0.2 });
    p.face = big > 0.6 ? face('happy', { eye: 1.0, mouth: 'grin', mouthW: 22, mouthH: 10 }) : face('normal', { eye: 0.9, mouth: 'wave', mouthW: 12, mouthH: 4 });
    drawChar(pen, p, PAL.punk);
    if (big > 0.6) { fx.burst(pen, 500, 340, t - 0.7, { n: 12, r0: 80, r1: 300, col: [255, 236, 190] }); }
    if (t > 2.2) smirk(pen, 500, 320, t - 2.2, 1.1);
  },

  /* ------------------------------------------- break: physical comedy -- */

  'bk-swoon'(pen, ctx, t, len) {
    bg('livingRoom', pen, t);
    const swoon = clamp((t - 0.3) / 0.5);
    const fold = pulse(clamp((t - 1.2) / 1.4));
    const squash = 1 - fold * 0.55;
    const angle = -swoon * 1.35;
    const p = HERO({ sh_l: -0.9, el_l: -0.5, sh_r: -0.9, el_r: -0.5 });
    p.face = face('closed', { brow: 0.5, mouth: 'o', mouthW: 12, mouthH: 7 });
    ctx.save();
    ctx.translate(430, 520); ctx.rotate(angle); ctx.scale(1.0, squash); ctx.translate(-430, -520);
    drawChar(pen, Object.assign(p, { x: 430, y: 520 }), PAL.punk);
    ctx.restore();
    if (fold > 0 && fold < 1) {
      for (const dx of [-1, 1]) pen.text('!', 430 + dx * 90, 300, 40, [240, 236, 220], {});
    }
  },

  'bk-support'(pen, ctx, t) {
    bg('graveyard', pen, t);
    // an audience, seated, hanging on his every word
    for (let i = 0; i < 4; i++) {
      const x = 220 + i * 190;
      const nod = Math.sin(t * 2.2 + i) * 0.08;
      const a = HERO({ x, y: 600, hip_h: 112, lean: 0.04, sh_l: 0.3, el_l: -0.4, sh_r: 0.3, el_r: -0.4 });
      a.face = face('closed', { brow: 0.5, mouth: 'frown', mouthW: 14, mouthH: 4 });
      ctx.save(); ctx.translate(x, 600); ctx.rotate(nod); ctx.translate(-x, -600);
      drawChar(pen, a, i % 2 ? P_COWORKER : P_OLD);
      ctx.restore();
    }
    // him, standing on a chair like a podium, arms wide
    const p = HERO({ x: 640, y: 470, hip_h: 128, lean: 0.02, sh_l: -1.6, el_l: -1.2, sh_r: 1.6, el_r: -1.2 });
    p.face = face('happy', { eye: 1.05, mouth: 'grin', mouthW: 22, mouthH: 10, blush: 1 });
    drawChar(pen, p, PAL.punk);
    pen.rrect([598, 468], [682, 514], 6, [96, 88, 104], OUTLINE, 4);
    if (t > 0.6) { fx.ding(pen, 540, 230, 22); fx.ding(pen, 742, 216, 18); }
  },

  /* ------------------------------------------------------------- outro -- */

  'out-mourners'(pen, ctx, t, len) {
    bg('graveyard', pen, t);
    // the crowd keeps growing
    const arrival = clamp(t / (len * 0.7));
    const n = Math.floor(arrival * 5) + 1;
    for (let i = 0; i < n; i++) {
      const x = 300 + i * 150 + (i % 2) * 24;
      const bob = Math.abs(Math.sin(t * 2.6 + i)) * 5;
      const m = HERO({ x, y: 600 - bob, hip_h: 122, lean: 0.02, sh_l: 0.3, el_l: -0.4, sh_r: 0.3, el_r: -0.4 });
      m.face = face('closed', { brow: 0.5, mouth: 'frown', mouthW: 14, mouthH: 4, tear: i % 2 });
      drawChar(pen, m, [P_COWORKER, P_BOSS, P_OLD, P_NEIGHBOUR, P_STRANGER][i % 5]);
      if (i % 2 === 0) props.wreath(pen, x - 60, 616, 0.6);
    }
    // him, centre, drinking it in
    const p = HERO({ x: 640, y: 560, hip_h: 136, lean: 0.02, sh_l: 1.3, el_l: -1.1, sh_r: -1.1, el_r: -0.8 });
    p.face = face('normal', { eye: 0.9, brow: 0.55, brow_lift: 2, mouth: 'frown', mouthW: 16, mouthH: 5 });
    drawChar(pen, p, PAL.punk);
    if (t > len * 0.55) smirk(pen, 640, 320, t - len * 0.55, 1.2);
  },

  'out-procession'(pen, ctx, t) {
    bg('street', pen, t);
    // brass band
    for (let i = 0; i < 3; i++) {
      const x = 210 + i * 120;
      const bob = Math.abs(Math.sin(t * 3 + i * 0.7)) * 6;
      const m = HERO({ x, y: 586 - bob, hip_h: 126, lean: 0.02, sh_l: 0.6, el_l: -0.7, sh_r: 0.5, el_r: -0.7 });
      m.face = face('closed', { brow: 0.4, mouth: 'o', mouthW: 9, mouthH: 6 });
      drawChar(pen, m, i % 2 ? P_BOSS : P_COWORKER);
      if (i === 1) props.trumpet(pen, x + 40, 330 - bob, 1.0);
      if (i === 2) props.drum(pen, x + 30, 470 - bob, 0.9);
    }
    // him at the head, delighted
    const bob = Math.abs(Math.sin(t * 3)) * 10;
    const p = HERO({ x: 780, y: 566 - bob, hip_h: 138, lean: 0.03, sh_l: -1.5, el_l: -0.8, sh_r: 1.5, el_r: -0.8, th_l: -0.35, kn_l: 0.3, th_r: 0.35, kn_r: 0.3 });
    p.face = face('happy', { eye: 1.1, mouth: 'grin', mouthW: 22, mouthH: 10, blush: 1 });
    drawChar(pen, p, PAL.punk);
    props.medal(pen, 780, 330 - bob, 1.0, t);
    // a black mourning banner carried aloft on a pole
    pen.line([[392, 262 - bob], [392, 566 - bob]], 6, [96, 82, 70]);
    pen.rrect([368, 190 - bob], [676, 262 - bob], 7, [24, 22, 30], OUTLINE, 5);
    pen.text('\u2665', 522, 244 - bob, 44, [244, 240, 246], {});
  },

  'out-tears'(pen, ctx, t) {
    bg('graveyard', pen, t);
    const cue = Math.sin(t * 9);
    for (let i = 0; i < 4; i++) {
      const x = 220 + i * 270;
      const p = HERO({ x, y: 590, lean: Math.sin(t * 5 + i) * 0.06 });
      p.face = face('closed', { mouth: 'bigo', mouthH: 14, tear: 1 });
      drawChar(pen, p, i % 2 ? P_COWORKER : P_BOSS);
      // Tears become fountains when he raises the baton.
      for (let j = 0; j < 5; j++) {
        const q = (t * 1.4 + j / 5) % 1;
        pen.ellipse(x + (i % 2 ? 1 : -1) * q * 100, 300 - Math.sin(q * Math.PI) * (70 + t * 25) + q * 140, 5, 9, [130, 205, 255]);
      }
    }
    const p = HERO({ x: 640, y: 520, sh_l: -1.8, sh_r: 1.5 + cue * 0.4, el_r: -0.7 });
    p.face = face('happy', { mouth: 'grin', mouthW: 24 });
    drawChar(pen, p, PAL.punk);
    pen.line([[730, 315], [780 + cue * 24, 210]], 5, [255, 244, 210]);
  },

  'out-autograph'(pen, ctx, t) {
    bg('graveyard', pen, t);
    const p = HERO({ x: 560, y: 570, sh_r: 1.1, el_r: -0.8 });
    p.face = face('happy', { mouth: 'grin', mouthW: 24 });
    drawChar(pen, p, PAL.punk);
    const fan = HERO({ x: 870, y: 580, sh_l: -1.1, el_l: -0.8 });
    fan.face = face('heart', { mouth: 'smile' });
    drawChar(pen, fan, P_COWORKER);
    const count = Math.min(5, Math.floor(t * 2.4));
    for (let i = 0; i <= count; i++) {
      const x = 620 + i * 23, y = 410 + i * 15;
      pen.rrect([x, y], [x + 110, y + 75], 3, [255, 246, 220], OUTLINE, 3);
      pen.line([[x + 15, y + 45], [x + 30, y + 22], [x + 45, y + 50], [x + 62, y + 27], [x + 92, y + 40]], 3, [65, 62, 85]);
    }
    pen.line([[650, 405], [690 + Math.sin(t * 18) * 18, 360]], 6, [235, 68, 95]);
    if (t > 1.7) smirk(pen, 560, 310, t - 1.7);
  },

  'out-encore'(pen, ctx, t) {
    bg('graveyard', pen, t);
    performanceBow(pen, ctx, t);
  },

  'out-solo'(pen, ctx, t) {
    bg('street', pen, t);
    const hit = Math.sin(t * 18);
    const d = HERO({ x: 520, y: 580, sh_l: -1.1 + hit * 0.5, sh_r: 1.1 - hit * 0.5, el_l: -0.8, el_r: -0.8 });
    d.face = face('happy', { mouth: 'grin' });
    drawChar(pen, d, P_COWORKER);
    props.drum(pen, 520, 440, 1.2);
    pen.line([[420, 360], [470, 420 + hit * 26]], 7, [235, 199, 143]);
    pen.line([[620, 360], [570, 420 - hit * 26]], 7, [235, 199, 143]);
    fx.burst(pen, 520, 440, (t % 0.7) / 0.7, { n: 8, r0: 65, r1: 150, col: [255, 220, 130] });
    const p = HERO({ x: 930, y: 570, lean: -0.12, sh_l: 0.2, sh_r: -0.2 });
    p.face = face('normal', { brow: -0.6, mouth: 'frown', pupil: [-0.8, 0] });
    drawChar(pen, p, PAL.punk);
  },

  'out-conductor'(pen, ctx, t) {
    GAGS['out-procession'](pen, ctx, t);
    // He insists the band follow HIS increasingly absurd tempo.
    const k = Math.min(1, t / 0.5);
    ctxAlpha(pen, k, () => {
      pen.line([[835, 300], [900 + Math.sin(t * 15) * 45, 180]], 7, [255, 244, 210]);
      if (t > 1) fx.burst(pen, 780, 280, (t % 0.7) / 0.7, { n: 9, r0: 65, r1: 190, col: [255, 223, 120] });
    });
  },

  'out-cover'(pen, ctx, t) {
    bg('street', pen, t);
    const witness = HERO({ x: 890, y: 580, lean: -0.06 });
    witness.face = face('normal', { brow: -0.5, pupil: [-0.8, 0], mouth: 'flat' });
    drawChar(pen, witness, P_NEIGHBOUR);
    if (t < 1.1) fx.bubble(pen, 910, 240, 110, 100, '?', t);
    const sell = clamp((t - 0.6) / 0.35);
    const p = HERO({ x: 520, y: 570, lean: -0.13 * sell, sh_l: -1.7 * sell, sh_r: 1.7 * sell, el_l: -0.6, el_r: -0.6 });
    p.face = face('closed', { tear: sell, mouth: 'bigo', mouthH: 18 * sell });
    drawChar(pen, p, PAL.punk);
    if (t > 1.2) { witness.face = face('closed', { tear: 1, mouth: 'frown' }); drawChar(pen, witness, P_NEIGHBOUR); }
  },

  'out-bow'(pen, ctx, t) {
    bg('street', pen, t);
    performanceBow(pen, ctx, t);
  },

  'out-coffin'(pen, ctx, t, len) {
    bg('street', pen, t);
    const bob = Math.abs(Math.sin(t * 3)) * 8;
    const p = HERO({ x: 420, y: 566 - bob, hip_h: 138, lean: 0.02, sh_l: 1.1, el_l: -1.0, sh_r: 1.1, el_r: -1.0, th_l: -0.3, kn_l: 0.25, th_r: 0.3, kn_r: 0.25 });
    p.face = face('happy', { eye: 1.05, mouth: 'grin', mouthW: 20, mouthH: 9 });
    drawChar(pen, p, PAL.punk);
    // the empty coffin, rattling
    const rattle = t > 1.0 && t < 2.4 ? Math.sin(t * 40) * 5 : 0;
    const CX = 790, CY = 402, CW = 280, CH = 132;
    const lidOpen = t > 2.4 && t < 3.9;
    const lidK = t > 2.4 ? clamp((t - 2.4) / 0.28) * (1 - clamp((t - 3.62) / 0.28)) : 0;
    props.coffin(pen, CX + rattle, CY, CW, CH, { open: lidOpen });
    if (lidK > 0.01) {
      ctx.save();
      ctx.translate(CX, CY); ctx.rotate(-lidK * 1.05); ctx.translate(-CX, -CY);
      pen.rrect([CX + 10, CY - 34], [CX + CW - 10, CY + 4], 8, [150, 104, 78], OUTLINE, 5);
      ctx.restore();
    }
    if (t > 1.0 && t < 2.4) {
      for (let i = 0; i < 3; i++) pen.text('!', CX + 70 + i * 60 + Math.sin(t * 40 + i) * 6, CY - 60, 34, [240, 236, 220], {});
    }
    // the occupant
    const catAt = (cx, cy) => {
      const c = [236, 206, 128];
      pen.line([[cx - 30, cy + 2], [cx - 58, cy - 26], [cx - 66, cy + 12]], 6, OUTLINE);
      pen.ellipse(cx, cy, 34, 25, c, OUTLINE, 4);
      pen.polygon([[cx + 12, cy - 34], [cx + 18, cy - 58], [cx + 34, cy - 34]], c, OUTLINE, 3);
      pen.polygon([[cx + 34, cy - 34], [cx + 48, cy - 58], [cx + 60, cy - 34]], c, OUTLINE, 3);
      pen.circle(cx + 26, cy - 20, 19, c, OUTLINE, 4);
      pen.circle(cx + 19, cy - 22, 3.4, OUTLINE);
      pen.circle(cx + 35, cy - 22, 3.4, OUTLINE);
      pen.line([[cx + 42, cy - 16], [cx + 62, cy - 22]], 2, OUTLINE);
      pen.line([[cx + 42, cy - 13], [cx + 62, cy - 12]], 2, OUTLINE);
    };
    if (t > 2.7 && t < 3.8) {
      const jump = clamp((t - 2.7) / 0.7);
      catAt(CX + 120 + jump * 120, CY + 96 - Math.sin(jump * Math.PI) * 260);
    } else if (t >= 3.8) {
      const run = t - 3.8;
      catAt(CX + 250 + run * 200, CY + 112 + Math.sin(run * 13) * 4);
    }
    // the lid slams
    if (t > 3.7 && t < 4.4) fx.puff(pen, CX + CW * 0.5, CY + 44, (t - 3.7) / 0.7, 1.3);
    // and he could not be happier about any of this
    if (t > 5.0) smirk(pen, 420, 322, t - 5.0, 1.0);
  },

  'end-march'(pen, ctx, t) {
    bg('street', pen, t);
    const bob = Math.abs(Math.sin(t * 3.2)) * 12;
    for (let i = 0; i < 3; i++) {
      const b2 = Math.abs(Math.sin(t * 3.2 + i * 0.6)) * 10;
      const m = HERO({ x: 300 + i * 140, y: 580 - b2, hip_h: 126, lean: 0.02, sh_l: 0.3, el_l: -0.4, sh_r: 0.3, el_r: -0.4 });
      m.face = face('closed', { brow: 0.5, mouth: 'frown', mouthW: 14, mouthH: 4 });
      drawChar(pen, m, [P_COWORKER, P_OLD, P_BOSS][i]);
    }
    const p = HERO({ x: 820, y: 560 - bob, hip_h: 138, lean: 0.03, sh_l: -1.4, el_l: -0.9, sh_r: 1.4, el_r: -0.9, th_l: -0.35, kn_l: 0.3, th_r: 0.35, kn_r: 0.3 });
    p.face = face('happy', { eye: 1.1, mouth: 'grin', mouthW: 22, mouthH: 10 });
    drawChar(pen, p, PAL.punk);
    // a single tear of pure joy
    pen.ellipse(852, 300 - bob, 5, 10, [140, 200, 255], OUTLINE, 2);
    props.medal(pen, 820, 336 - bob, 1.0, t);
  },

  'end-card'(pen, ctx, t) {
    bg('street', pen, t);
    const bob = Math.abs(Math.sin(t * 3)) * 8;
    const p = HERO({ x: 400, y: 570 - bob, hip_h: 138, lean: 0.03, sh_l: -1.2, el_l: -0.9, sh_r: 1.2, el_r: -0.9 });
    p.face = face('happy', { eye: 1.05, mouth: 'grin', mouthW: 20, mouthH: 9 });
    drawChar(pen, p, PAL.punk);
    for (let i = 0; i < 3; i++) {
      const b2 = Math.abs(Math.sin(t * 3 + i * 0.7)) * 9;
      const m = HERO({ x: 640 + i * 150, y: 580 - b2, hip_h: 126, lean: 0.02, sh_l: 0.3, el_l: -0.4, sh_r: 0.3, el_r: -0.4 });
      m.face = face('closed', { brow: 0.5, mouth: 'frown', mouthW: 14, mouthH: 4 });
      drawChar(pen, m, [P_COWORKER, P_OLD, P_BOSS][i]);
    }
    ctxAlpha(pen, 0.55, () => pen.rect([-2000, -2000], [4000, 4000], [20, 18, 26]));
    const z = overshoot(clamp((t - 0.2) / 0.4), 0.2);
    ctx.save(); ctx.translate(640, 320); ctx.scale(z, z); ctx.translate(-640, -320);
    pen.posterText('THE END', 640, 300, 124, [255, 248, 240], { outline: OUTLINE, ow: 12, shadow: [226, 46, 84], sx: 7, sy: 8 });
    ctx.restore();
    if (t > 1.2) pen.text('encore?', 640, 420, 24, [230, 224, 232], {});
    if (t > 2.0) pen.text('a fan-made cartoon \u00b7 song by The Vandals', 640, 640, 17, [176, 172, 186], {});
  },
};

export function drawGag(ctx, id, t, len) {
  const fn = GAGS[id];
  if (!fn) {
    // unknown gag: never render a black frame, show the backdrop instead
    const pen = new Pen(ctx);
    bg('street', pen, t);
    pen.text(id, 640, 360, 30, [240, 236, 226], {});
    return;
  }
  fn(new Pen(ctx), ctx, t, len);
}
