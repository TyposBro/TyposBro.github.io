/*
 * char.js — rigged flat-2D character (chunky cartoon proportions).
 * A pose is a flat object of scalar params; skeleton() -> joints; drawChar() renders.
 */
import {
  add, mul, rot, upDir, dnDir, lerp, clamp, shade, mix, TAU,
} from './engine.js';

export const OUTLINE = [18, 16, 22];

/* proportions (design units) — head is ~1/4 of total height */
export const HEAD_R = 46;
const L_TORSO = 112;
const L_NECK = 20;
const SHW = 30;
const L_UP = 56;
const L_FORE = 54;
const L_THIGH = 66;
const L_SHIN = 66;
const FOOT = 26;
const HAND = 13;

export function defaultPose(o = {}) {
  const p = {
    x: 640, y: 520, hip_h: 134,
    lean: 0, head_tilt: 0, head_dx: 0, head_dy: 0,
    sh_l: 0, el_l: 0, sh_r: 0, el_r: 0,
    th_l: -0.1, kn_l: 0, th_r: 0.1, kn_r: 0,
    sx: 1, sy: 1, flip: false, crouch: 0,
  };
  p.face = {
    eyes: 'normal', eye: 1, pupil: [0, 0], brow: 0, brow_lift: 0,
    mouth: 'flat', mouthW: 26, mouthH: 10, blush: 0, tear: 0, sweat: 0,
    rot: 0,
  };
  Object.assign(p, o);
  if (o.face) p.face = Object.assign(p.face, o.face);
  return p;
}

export function skeleton(P) {
  const { x, y, hip_h, lean } = P;
  const hip = [x, y - hip_h];
  const chest = add(hip, mul(upDir(lean), L_TORSO));
  const neck = add(chest, mul(upDir(lean * 0.72), L_NECK));
  const head = add(neck, mul(upDir(lean * 0.45 + (P.head_tilt || 0)), HEAD_R * 0.62));
  const headf = add(head, [P.head_dx || 0, P.head_dy || 0]);

  const sh_l = add(chest, rot([-SHW, -10], lean));
  const sh_r = add(chest, rot([SHW, -10], lean));

  const el_l = add(sh_l, mul(dnDir(lean + P.sh_l), L_UP));
  const ha_l = add(el_l, mul(dnDir(lean + P.sh_l + P.el_l), L_FORE));
  const el_r = add(sh_r, mul(dnDir(lean + P.sh_r), L_UP));
  const ha_r = add(el_r, mul(dnDir(lean + P.sh_r + P.el_r), L_FORE));

  const hipL = add(hip, rot([-16, 0], lean));
  const hipR = add(hip, rot([16, 0], lean));
  const kn_l = add(hipL, mul(dnDir(P.th_l), L_THIGH));
  const ft_l = add(kn_l, mul(dnDir(P.th_l + P.kn_l), L_SHIN));
  const kn_r = add(hipR, mul(dnDir(P.th_r), L_THIGH));
  const ft_r = add(kn_r, mul(dnDir(P.th_r + P.kn_r), L_SHIN));

  const S = {
    hip, hipL, hipR, chest, neck, head: headf,
    sh_l, el_l, ha_l, sh_r, el_r, ha_r,
    kn_l, ft_l, kn_r, ft_r,
  };

  const sx = P.sx ?? 1, sy = P.sy ?? 1;
  if (sx !== 1 || sy !== 1) {
    for (const k in S) S[k] = [x + (S[k][0] - x) * sx, y + (S[k][1] - y) * sy];
  }
  return S;
}

export function drawChar(pen, P, C) {
  const S = skeleton(P);
  const f = P.face;
  const ol = C.ol || OUTLINE;
  const lw = C.lw ?? 3.4;
  const flip = !!P.flip;
  const sign = flip ? -1 : 1;

  const skin = C.skin;
  const skinD = shade(skin, 0.88);
  const jacket = C.jacket;
  const jacketD = shade(jacket, 0.7);
  const pants = C.pants;
  const pantsD = shade(pants, 0.72);
  const shoe = C.shoe;

  // ground shadow
  pen.ellipse(P.x, P.y + 4, 52, 11, C.shadow || [40, 36, 46]);

  // ---- back limbs
  pen.bone(S.sh_r, S.el_r, 19, jacketD, ol, lw);
  pen.bone(S.el_r, S.ha_r, 17, jacketD, ol, lw);
  pen.circle(S.ha_r[0], S.ha_r[1], HAND - 1, shade(skin, 0.9), ol, lw * 0.8);
  pen.bone(S.hipR, S.kn_r, 25, pantsD, ol, lw);
  pen.bone(S.kn_r, S.ft_r, 21, pantsD, ol, lw);
  _shoe(pen, S.ft_r, sign, shade(shoe, 0.82), ol, lw);

  // ---- torso (tapered polygon: broad shoulders -> waist)
  const lean = P.lean;
  const tl = add(S.chest, rot([-44, -12], lean));
  const tr = add(S.chest, rot([46, -12], lean));
  const br = add(S.hip, [34, 8]);
  const bl = add(S.hip, [-34, 8]);
  pen.circle(tl[0], tl[1], 19, jacket, ol, lw);
  pen.circle(tr[0], tr[1], 19, jacket, ol, lw);
  pen.polygon([tl, tr, br, bl], jacket, ol, lw);

  if (C.shirt) {
    const t = add(S.neck, rot([0, -2], lean));
    pen.polygon([add(t, [-11, 4]), add(t, [13, 2]),
      [S.hip[0] + 9, S.hip[1] - 4], [S.hip[0] - 7, S.hip[1] - 4]], C.shirt);
  }
  if (C.studs) {
    for (let i = 0; i < 4; i++) {
      const t = (i + 0.5) / 4;
      const q = add(mul(S.hip, 1 - t), mul(S.neck, t));
      pen.circle(q[0] + 15 * sign, q[1] + 2, 2.8, [206, 206, 216]);
    }
  }
  // belt
  pen.line([[S.hip[0] - 30, S.hip[1] - 2], [S.hip[0] + 30, S.hip[1] - 2]], 7, C.belt || [40, 34, 42]);

  // ---- near leg
  pen.bone(S.hipL, S.kn_l, 27, pants, ol, lw);
  pen.bone(S.kn_l, S.ft_l, 23, pants, ol, lw);
  _shoe(pen, S.ft_l, sign, shoe, ol, lw);

  // ---- head
  const hr = HEAD_R * (P.sy ?? 1);
  const head = S.head;
  _hair(pen, head, hr, lean, sign, C, true);
  pen.circle(head[0], head[1], hr, skin, ol, lw);
  pen.circle(head[0] + sign * (hr - 7), head[1] + 6, 9, skinD, ol, lw * 0.75);
  _hair(pen, head, hr, lean, sign, C, false);
  _face(pen, head, hr, P, C, sign);

  // ---- near arm
  pen.bone(S.sh_l, S.el_l, 20, jacket, ol, lw);
  pen.bone(S.el_l, S.ha_l, 18, jacket, ol, lw);
  pen.circle(S.ha_l[0], S.ha_l[1], HAND, skin, ol, lw * 0.8);
  return S;
}

function _shoe(pen, foot, sign, col, ol, lw) {
  const tip = [foot[0] + FOOT * sign, foot[1] + 3];
  pen.bone(foot, tip, 19, col, ol, lw);
}

function _hair(pen, head, hr, lean, sign, C, back) {
  const style = C.hair || 'spike';
  const col = C.hair_color || [40, 34, 40];
  const ol = C.ol || OUTLINE;
  const lw = C.lw ?? 3.4;
  const [hx, hy] = head;

  if (style === 'bald') return;

  if (style === 'spike') {
    if (back) { pen.circle(hx, hy - 8, hr * 0.98, col); return; }
    pen.pie(hx, hy, hr * 1.02, hr * 1.02, Math.PI, TAU, col);
    const n = 9;
    for (let i = 0; i < n; i++) {
      const a = Math.PI * (i / (n - 1));
      const bx = hx - Math.cos(a) * hr * 0.95;
      const by = hy - Math.sin(a) * hr * 0.95 - 2;
      const dx = (bx - hx) * 0.7;
      const dy = -hr * (0.42 + 0.34 * Math.sin(a));
      const wx = Math.sin(a) * 9 + 6;
      pen.polygon([[bx - wx, by + 10], [bx + wx, by + 10], [bx + dx, by + dy]], col, ol, lw * 0.7);
    }
    return;
  }

  if (style === 'mohawk') {
    if (back) return;
    pen.pie(hx, hy, hr * 1.0, hr * 1.0, Math.PI * 1.15, Math.PI * 1.85, col);
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + (i - 2) * 0.3;
      const bx = hx + Math.cos(a) * hr * 0.85;
      const by = hy + Math.sin(a) * hr * 0.85;
      pen.polygon([[bx - 10, by + 10], [bx + 10, by + 10], [bx, by - hr * 1.0]], col, ol, lw * 0.7);
    }
    return;
  }

  if (style === 'bob' || style === 'long') {
    const len = style === 'long' ? hr * 1.5 : hr * 0.9;
    if (back) {
      pen.circle(hx, hy + 2, hr * 1.1, col);
      pen.polygon([[hx - hr * 1.15, hy], [hx + hr * 1.15, hy],
        [hx + hr * 1.05, hy + len], [hx - hr * 1.05, hy + len]], col);
      return;
    }
    pen.pie(hx, hy, hr * 1.06, hr * 1.06, Math.PI, TAU, col);
    pen.polygon([[hx - hr * 1.2, hy - 6], [hx - hr * 0.45, hy - hr * 1.0],
      [hx + hr * 0.45, hy - hr * 1.0], [hx + hr * 1.2, hy - 6],
      [hx + hr * 1.25, hy + 4], [hx - hr * 1.25, hy + 4]], col);
    // fringe — kept above the eyes on purpose
    pen.polygon([[hx - hr * 0.62, hy - hr * 0.84], [hx + hr * 1.12, hy - hr * 0.62],
      [hx + hr * 1.06, hy - hr * 0.5], [hx - hr * 0.12, hy - hr * 0.64]], col);
    return;
  }

  // fallback
  pen.pie(hx, hy, hr * 1.02, hr * 1.02, Math.PI, TAU, col);
}

function _face(pen, head, hr, P, C, sign) {
  const f = P.face;
  const ol = C.ol || OUTLINE;
  const lw = C.lw ?? 3.4;
  const [hx, hy] = head;
  const es = hr / HEAD_R;

  const ex = 23 * es, ey = -6 * es;
  const lc = [hx - ex, hy + ey];
  const rc = [hx + ex, hy + ey];
  const mode = f.eyes;

  const white = (c) => {
    pen.ellipse(c[0], c[1], 13 * es, 15 * es * f.eye, [250, 250, 252], ol, lw * 0.75);
    if (f.eye > 0.22) {
      const px = c[0] + (f.pupil[0] || 0) * 6 * es;
      const py = c[1] + (f.pupil[1] || 0) * 6 * es;
      pen.circle(px, py, 6 * es, [30, 28, 34]);
      pen.circle(px - 2 * es, py - 2.2 * es, 2 * es, [255, 255, 255]);
    }
  };

  if (mode === 'normal' || mode === 'wide' || mode === 'dead') { white(lc); white(rc); }
  else if (mode === 'x') {
    for (const c of [lc, rc]) {
      pen.line([[c[0] - 9 * es, c[1] - 10 * es], [c[0] + 9 * es, c[1] + 10 * es]], 4 * es, ol);
      pen.line([[c[0] - 9 * es, c[1] + 10 * es], [c[0] + 9 * es, c[1] - 10 * es]], 4 * es, ol);
    }
  } else if (mode === 'happy') {
    for (const c of [lc, rc]) pen.arc(c[0], c[1], 10 * es, 10 * es, Math.PI * 1.15, Math.PI * 1.85, 4 * es, ol);
  } else if (mode === 'closed') {
    for (const c of [lc, rc]) pen.line([[c[0] - 10 * es, c[1]], [c[0] + 10 * es, c[1]]], 4 * es, ol);
  } else if (mode === 'spiral') {
    for (const c of [lc, rc]) {
      for (const rr of [4, 8, 12]) pen.arc(c[0], c[1], rr * es, rr * es, 0, Math.PI * 1.7, 2.6 * es, ol);
    }
  } else if (mode === 'heart') {
    for (const c of [lc, rc]) {
      pen.circle(c[0] - 5 * es, c[1], 6 * es, [232, 74, 104]);
      pen.circle(c[0] + 5 * es, c[1], 6 * es, [232, 74, 104]);
      pen.polygon([[c[0] - 10 * es, c[1] + 2], [c[0] + 10 * es, c[1] + 2], [c[0], c[1] + 14 * es]], [232, 74, 104]);
    }
  } else if (mode === 'dollar') {
    for (const c of [lc, rc]) {
      pen.text('$', c[0], c[1], 20 * es, [60, 160, 90], { bold: true });
    }
  }

  // brows
  if (f.brow || f.brow_lift) {
    const bl = f.brow_lift || 0;
    [[-1, lc], [1, rc]].forEach(([s, c]) => {
      const a = (f.brow || 0) * s;
      const bx = c[0], by = c[1] - 20 * es - bl;
      pen.line([[bx - 11 * es, by + a * 6], [bx + 11 * es, by - a * 6]], 4 * es, ol);
    });
  }

  // nose
  pen.arc(hx + sign * 5 * es, hy + 12 * es, 5 * es, 5 * es, 0.4, 2.4, 3 * es, ol);

  // mouth
  const mc = [hx, hy + 31 * es];
  const mw = (f.mouthW ?? 26) * es, mh = (f.mouthH ?? 10) * es;
  const m = f.mouth;
  if (m === 'flat') pen.line([[mc[0] - mw, mc[1]], [mc[0] + mw, mc[1]]], 4 * es, ol);
  else if (m === 'smile') pen.arc(mc[0], mc[1], mw, mh * 2.4, 0.35, Math.PI - 0.35, 4 * es, ol);
  else if (m === 'frown') pen.arc(mc[0], mc[1] + mh, mw, mh * 2.4, Math.PI + 0.35, TAU - 0.35, 4 * es, ol);
  else if (m === 'grin') {
    pen.chord(mc[0], mc[1] - mh, mw, mh * 1.8, 0, Math.PI, [70, 34, 44], ol, lw * 0.8);
    pen.rect([mc[0] - mw * 0.9, mc[1] - mh * 1.8], [mc[0] + mw * 0.9, mc[1] - mh * 1.15], [250, 250, 250]);
  } else if (m === 'o') pen.ellipse(mc[0], mc[1], mw * 0.6, mh * 1.7, [70, 34, 44], ol, lw);
  else if (m === 'bigo') pen.ellipse(mc[0], mc[1] + mh * 0.6, mw * 0.95, mh * 2.6, [70, 34, 44], ol, lw);
  else if (m === 'smirk') pen.arc(mc[0] - sign * 4, mc[1], mw, mh * 1.8, 0.2, 1.5, 4 * es, ol);
  else if (m === 'wave') {
    const pts = [];
    for (let i = 0; i <= 8; i++) {
      const t = i / 8;
      pts.push([lerp(mc[0] - mw, mc[0] + mw, t), mc[1] + Math.sin(t * Math.PI * 3) * mh * 0.6]);
    }
    pen.line(pts, 3.4 * es, ol);
  } else if (m === 'teeth') {
    pen.rrect([mc[0] - mw, mc[1] - mh * 1.4], [mc[0] + mw, mc[1] + mh * 1.2], 4, [250, 250, 250], ol, lw * 0.8);
    pen.line([[mc[0] - mw, mc[1] - mh * 0.1], [mc[0] + mw, mc[1] - mh * 0.1]], 2.4, shade(ol, 1.6));
  }

  if (f.blush) {
    for (const s of [-1, 1]) pen.ellipse(hx + s * 34 * es, hy + 17 * es, 11 * es, 6 * es, [242, 150, 160]);
  }
  if (f.tear) pen.ellipse(hx - 22 * es, hy + 8 * es, 4.5 * es, 8 * es, [140, 200, 255]);
  if (f.sweat) pen.ellipse(hx + 40 * es, hy - 20 * es, 5 * es, 9 * es, [150, 210, 255], ol, 2);
}

/* ---------------------------------------------------------- palettes --- */
export const PAL = {
  punk: {
    skin: [242, 197, 158], jacket: [42, 39, 52], shirt: [140, 138, 152],
    pants: [88, 106, 158], shoe: [30, 28, 34], hair: 'spike',
    hair_color: [42, 34, 40], studs: true, belt: [40, 34, 44], ol: OUTLINE, lw: 3.4,
  },
  punkB: {
    skin: [232, 186, 148], jacket: [70, 48, 64], shirt: [206, 194, 120],
    pants: [64, 72, 112], shoe: [28, 26, 32], hair: 'mohawk',
    hair_color: [206, 62, 92], studs: true, belt: [40, 34, 44], ol: OUTLINE, lw: 3.4,
  },
  gf: {
    skin: [198, 204, 218], jacket: [158, 98, 142], shirt: [228, 208, 216],
    pants: [98, 92, 128], shoe: [42, 38, 48], hair: 'bob',
    hair_color: [216, 100, 152], studs: false, belt: [58, 52, 70], ol: OUTLINE, lw: 3.4,
  },
};
