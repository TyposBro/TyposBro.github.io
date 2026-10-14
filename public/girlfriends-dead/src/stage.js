/*
 * stage.js — the ten backdrops the cartoon cuts between.
 *
 * Every function paints a COMPLETE 1280x720 design-space backdrop with the
 * shared Pen (flat fills, thick INK outlines, no gradients except skies) and
 * is a pure function of local seconds `t`, so the live player and the offline
 * renderer share one source of truth.
 *
 * Nothing here draws characters: the caller stacks people, props and gags on
 * top. Ground/floor lines live around y=520-620 so a standing character
 * (feet at y~520, ~341 units tall) sits on the floor naturally.
 */
import {
  clamp, lerp, mix, shade, pulse, hash, TAU,
} from './engine.js';

const INK = [18, 16, 22];
const LW = 4;

/* ------------------------------------------------------------ utilities -- */

/** flood the whole frame so no undefined gaps ever show. */
function full(s, col) { s.rect([-2000, -2000], [4000, 4000], col); }

/** run fn with a temporary globalAlpha (glows, fog, flashbacks). */
function alpha(s, a, fn) {
  const c = s.ctx;
  const prev = c.globalAlpha;
  c.globalAlpha = prev * clamp(a);
  fn();
  c.globalAlpha = prev;
}

/** looping horizontal drift, used for clouds. */
function drift(x, t, speed, span) {
  return -340 + ((((x + t * speed) % span) + span) % span);
}

/** chunky cartoon cloud with a flat bottom. */
function cloud(s, x, y, k, col) {
  s.circle(x - 32 * k, y - 20 * k, 21 * k, col);
  s.circle(x, y - 33 * k, 27 * k, col);
  s.circle(x + 34 * k, y - 18 * k, 18 * k, col);
  s.rect([x - 48 * k, y - 21 * k], [x + 48 * k, y], col);
}

/** soft round light blob (stacked translucent discs, wide falloff). */
function glowSpot(s, x, y, r, col, a) {
  for (let i = 6; i >= 1; i--) {
    const k = i / 6;
    alpha(s, a * 0.28 * k, () => s.circle(x, y, r * k, col));
  }
}

/** grid of building windows; a few of them flicker with t. */
function windows(s, x0, y0, w, h, cols, rows, seed, t, litCol, darkCol) {
  const cw = w / cols, ch = h / rows;
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const x = x0 + i * cw + cw * 0.24;
      const y = y0 + j * ch + ch * 0.22;
      const ww = Math.max(8, cw * 0.52);
      const hh = Math.max(10, ch * 0.54);
      const lit = hash(seed + i * 7.3 + j * 13.7) > 0.52;
      let col = lit ? litCol : darkCol;
      if (lit && hash(seed + i * 3.1 + j * 5.9) > 0.82
        && Math.sin(t * 7 + i * 1.7 + j * 2.3) < 0.1) col = darkCol;
      s.rect([x, y], [x + ww, y + hh], col);
    }
  }
}

/** bottle for shelves/bars. */
function bottle(s, x, baseY, w, h, col) {
  s.rrect([x - w / 2, baseY - h], [x + w / 2, baseY], Math.min(5, w / 3), col, INK, 2.6);
  s.rect([x - w * 0.19, baseY - h - h * 0.4], [x + w * 0.19, baseY - h + 3], col, INK, 2.2);
  s.rect([x - w * 0.28, baseY - h - h * 0.48], [x + w * 0.28, baseY - h - h * 0.36], shade(col, 0.72));
  s.rect([x - w * 0.5, baseY - h * 0.72], [x + w * 0.5, baseY - h * 0.42], [246, 244, 236]);
}

/** neon tube text with a glow halo; `on` dips to flicker. */
function neon(s, str, x, y, size, col, on) {
  alpha(s, 0.20 * on, () => {
    for (const [dx, dy] of [[-5, 0], [5, 0], [0, -5], [0, 5], [-4, -4], [4, 4], [4, -4], [-4, 4]]) {
      s.text(str, x + dx, y + dy, size, col, { bold: true, tracking: 8 });
    }
  });
  alpha(s, 0.32 * on, () => s.text(str, x, y, size, col, { bold: true, tracking: 8 }));
  s.text(str, x, y, size, on > 0.5 ? mix(col, [255, 255, 255], 0.78) : shade(col, 0.45),
    { bold: true, tracking: 8 });
}

/* --------------------------------------------------------------- park --- */

/** park bench, seat faces the viewer, feet on gy. */
function bench(s, x, gy, k) {
  const leg = [92, 68, 50];
  const wood = [156, 110, 68];
  const woodD = [120, 82, 50];
  s.rect([x - 96 * k, gy - 64 * k], [x - 78 * k, gy], leg, INK, 3.4);
  s.rect([x + 78 * k, gy - 64 * k], [x + 96 * k, gy], leg, INK, 3.4);
  s.rrect([x - 108 * k, gy - 84 * k], [x + 108 * k, gy - 60 * k], 6, wood, INK, LW);
  s.rrect([x - 104 * k, gy - 176 * k], [x - 88 * k, gy - 74 * k], 6, woodD, INK, 3.4);
  s.rrect([x + 88 * k, gy - 176 * k], [x + 104 * k, gy - 74 * k], 6, woodD, INK, 3.4);
  s.rrect([x - 100 * k, gy - 172 * k], [x + 100 * k, gy - 152 * k], 5, wood, INK, 3.4);
  s.rrect([x - 100 * k, gy - 138 * k], [x + 100 * k, gy - 118 * k], 5, wood, INK, 3.4);
  s.rrect([x - 108 * k, gy - 118 * k], [x - 56 * k, gy - 104 * k], 5, woodD, INK, 3.4);
  s.rrect([x + 56 * k, gy - 118 * k], [x + 108 * k, gy - 104 * k], 5, woodD, INK, 3.4);
}

/** leafy tree that sways with t. */
function tree(s, x, gy, k, sway, leaf, trunk) {
  const tw = 25 * k;
  s.polygon([[x - tw, gy], [x + tw, gy], [x + tw * 0.5, gy - 150 * k], [x - tw * 0.5, gy - 150 * k]], trunk, INK, LW);
  s.line([[x - 2, gy - 118 * k], [x - 46 * k, gy - 186 * k]], 13 * k, trunk);
  s.line([[x + 2, gy - 126 * k], [x + 50 * k, gy - 196 * k]], 13 * k, trunk);
  const cx = x + sway;
  s.circle(cx - 68 * k, gy - 206 * k, 52 * k, leaf, INK, LW);
  s.circle(cx + 70 * k, gy - 212 * k, 54 * k, leaf, INK, LW);
  s.circle(cx, gy - 248 * k, 72 * k, leaf, INK, LW);
  s.circle(cx + 8 * k, gy - 302 * k, 48 * k, leaf, INK, LW);
  alpha(s, 0.55, () => s.circle(cx - 34 * k, gy - 262 * k, 34 * k, shade(leaf, 1.12)));
}

export function park(s, t = 0, opts = {}) {
  const sepia = !!opts.sepia;
  full(s, [142, 198, 238]);

  /* sky band + sun */
  s.rect([-2000, 344], [4000, 530], [188, 224, 244]);
  glowSpot(s, 1044, 132, 92, [255, 246, 194], 0.34);
  s.circle(1044, 132, 56, [255, 236, 156]);
  s.circle(1044, 132, 42, [255, 250, 210]);

  /* clouds */
  cloud(s, drift(180, t, 8, 1780), 118, 1.1, [248, 252, 255]);
  cloud(s, drift(860, t, 13, 1780), 72, 0.72, [238, 246, 255]);
  cloud(s, drift(1340, t, 5, 1780), 198, 0.94, [250, 253, 255]);

  /* distant tree line */
  for (let i = 0; i < 15; i++) {
    const x = -130 + i * 108;
    s.circle(x, 496 - hash(i * 3.3) * 20, 40 + hash(i * 7.7) * 22, [128, 182, 126]);
  }
  s.rect([-2000, 498], [4000, 528], [128, 182, 126]);

  /* grass */
  s.rect([-2000, 520], [4000, 1600], [112, 176, 100]);
  s.rect([-2000, 652], [4000, 1600], [96, 158, 90]);

  /* path curving to the horizon */
  s.polygon([[700, 900], [1160, 900], [950, 514], [864, 514]], [220, 198, 158], INK, LW);
  for (let i = 0; i < 7; i++) {
    const u = i / 6;
    s.ellipse(lerp(888, 940, u) + hash(i) * 24 - 12, lerp(528, 830, u * u + u * 0.4),
      9 + u * 16, 4 + u * 7, [206, 184, 148]);
  }

  /* grass tufts (kept off the path) */
  for (let i = 0; i < 30; i++) {
    const x = hash(i * 1.7 + 3) * 1280;
    if (x > 700 && x < 1170) continue;
    const y = 540 + hash(i * 5.1) * 170;
    s.line([[x, y], [x - 7, y - 15]], 4, [84, 146, 78]);
    s.line([[x, y], [x + 8, y - 12]], 4, [84, 146, 78]);
  }

  /* bench + trees */
  bench(s, 420, 520, 1);
  tree(s, 1136, 522, 1.12, Math.sin(t * 0.9) * 5, [82, 148, 82], [104, 74, 52]);
  tree(s, 168, 522, 0.82, Math.sin(t * 0.9 + 1.4) * 4, [96, 162, 88], [110, 78, 54]);

  /* flowers by the bench */
  for (const [fx, fy, col] of [[612, 566, [242, 96, 118]], [648, 596, [250, 214, 96]], [680, 560, [236, 148, 190]]]) {
    s.line([[fx, fy], [fx, fy + 18]], 4, [84, 146, 78]);
    for (const [dx, dy] of [[-8, 0], [8, 0], [0, -8], [0, 6]]) s.circle(fx + dx, fy + dy, 6, col);
    s.circle(fx, fy, 4, [250, 240, 190]);
  }

  /* faded flashback grade */
  if (sepia) {
    alpha(s, 0.40, () => full(s, [122, 88, 54]));
    alpha(s, 0.30, () => full(s, [234, 208, 160]));
    alpha(s, 0.18, () => {
      s.rect([-2000, -2000], [4000, 340], [70, 48, 30]);
      s.rect([-2000, 620], [4000, 1600], [70, 48, 30]);
    });
  }
}

/* --------------------------------------------------------- living room -- */

export function livingRoom(s, t = 0) {
  full(s, [126, 110, 132]);

  /* wallpaper stripes */
  for (let i = -1; i < 20; i++) {
    const x = -30 + i * 70;
    s.rect([x, 0], [x + 26, 520], [136, 120, 142]);
  }
  /* framed poster above the couch */
  s.rrect([300, 96], [560, 258], 6, [92, 78, 98], INK, LW);
  s.rect([314, 110], [546, 244], [238, 226, 200]);
  s.circle(430, 168, 26, [240, 96, 120]);
  s.polygon([[314, 244], [420, 150], [470, 200], [530, 150], [546, 244]], [108, 158, 196]);

  /* floor */
  s.rect([-2000, 520], [4000, 1600], [108, 84, 74]);
  for (let i = 0; i < 6; i++) {
    const y = 556 + i * 42;
    s.rect([-2000, y], [4000, y + 4], [92, 72, 64]);
  }
  s.rect([-2000, 478], [4000, 526], [96, 84, 104]);
  s.rect([-2000, 478], [4000, 490], [112, 98, 118]);

  /* rug */
  s.ellipse(700, 640, 420, 84, [152, 94, 88]);
  s.ellipse(700, 640, 340, 60, [176, 116, 106]);

  /* couch */
  const sofa = [150, 88, 118];
  s.rrect([96, 306], [686, 452], 18, shade(sofa, 1.08), INK, 6);
  s.rrect([126, 322], [372, 434], 12, sofa, INK, 4);
  s.rrect([400, 322], [652, 434], 12, sofa, INK, 4);
  s.rrect([72, 386], [700, 500], 16, shade(sofa, 0.92), INK, 6);
  s.rrect([62, 372], [150, 508], 20, sofa, INK, 5);
  s.rrect([622, 372], [712, 508], 20, sofa, INK, 5);
  for (const lx of [104, 660]) s.rect([lx, 500], [lx + 26, 528], [78, 56, 46], INK, 3);
  s.rrect([250, 330], [390, 424], 14, [234, 178, 96], INK, 4);
  s.line([[320, 336], [320, 418]], 3, [200, 148, 78]);

  /* television on a stand (flickers) */
  const fk = 0.72 + 0.28 * pulse(t, 2.4) + 0.08 * Math.sin(t * 17);
  s.rrect([806, 448], [1074, 510], 8, [112, 76, 58], INK, 5);
  s.rect([846, 400], [872, 452], [64, 58, 66]);
  s.rect([1008, 400], [1034, 452], [64, 58, 66]);
  s.rrect([820, 250], [1060, 448], 14, [52, 52, 62], INK, 6);
  s.rrect([840, 270], [1040, 428], 8, shade([104, 154, 204], fk), null);
  s.rect([840, 300 + Math.sin(t * 2) * 10], [1040, 316 + Math.sin(t * 2) * 10], shade([220, 236, 250], fk));
  s.rect([840, 360], [954, 374], shade([220, 236, 250], fk * 0.8));
  glowSpot(s, 930, 500, 190, [150, 190, 230], 0.10 * fk);

  /* floor lamp */
  s.ellipse(1180, 522, 46, 12, [72, 62, 82]);
  s.rect([1172, 262], [1188, 518], [170, 164, 176], INK, 3);
  s.polygon([[1116, 176], [1244, 176], [1272, 274], [1088, 274]], [242, 206, 122], INK, 5);
  glowSpot(s, 1180, 300, 150, [255, 236, 168], 0.16);
  glowSpot(s, 1176, 560, 150, [255, 224, 150], 0.12);
}

/* ------------------------------------------------------------ doorway --- */

export function doorway(s, t = 0) {
  full(s, [104, 142, 190]);
  s.rect([-2000, 316], [4000, 474], [150, 180, 216]);
  cloud(s, drift(300, t, 9, 1700), 110, 0.9, [246, 250, 255]);
  cloud(s, drift(1100, t, 14, 1700), 210, 0.7, [240, 246, 254]);

  /* sidewalk + path */
  s.rect([-2000, 600], [4000, 1600], [122, 118, 124]);
  s.rect([-2000, 598], [4000, 612], [150, 146, 150]);
  s.rect([640, 600], [1180, 1600], [186, 178, 168], INK, 4);

  /* next door: house, lawn and hedge on the left */
  s.rect([-2000, 466], [340, 600], [104, 154, 92]);
  s.polygon([[-260, 604], [186, 604], [186, 300], [-40, 204], [-260, 300]], [196, 178, 168], INK, 5);
  s.rect([-40, 330], [60, 604], [96, 78, 78], INK, 4);
  s.rect([126, 300], [150, 604], [170, 158, 152], INK, 3);
  for (let i = 0; i < 6; i++) s.circle(214 + i * 30, 546, 36 + (i % 2) * 8, [86, 148, 84]);
  s.rect([-2000, 574], [4000, 600], [86, 148, 84]);

  /* house wall */
  s.rect([330, 62], [1500, 620], [136, 112, 102]);
  s.rect([300, 40], [1500, 96], [92, 74, 70]);
  s.rect([300, 40], [1500, 62], [74, 58, 56]);
  for (let i = 0; i < 9; i++) s.rect([360 + i * 130, 96], [376 + i * 130, 600], [122, 100, 92]);

  /* window on the right of the door */
  s.rrect([1160, 210], [1420, 400], 8, [70, 56, 54], INK, LW);
  s.rect([1178, 228], [1402, 382], [196, 200, 176]);
  s.rect([1282, 228], [1298, 382], [70, 56, 54]);
  s.rect([1178, 296], [1402, 312], [70, 56, 54]);

  /* door frame + door */
  s.rrect([736, 216], [1024, 618], 10, [70, 54, 48], INK, 8);
  s.rrect([762, 240], [998, 616], 6, [112, 82, 70], INK, 5);
  s.rrect([786, 268], [974, 402], 6, [152, 190, 214], INK, 4);
  s.rect([880, 268], [894, 402], [86, 66, 58]);
  s.rect([786, 328], [974, 342], [86, 66, 58]);
  alpha(s, 0.35, () => s.rrect([790, 272], [878, 398], 4, [255, 246, 200]));
  s.polygon([[786, 446], [974, 446], [974, 500], [786, 500]], [98, 72, 62], null);
  s.rrect([786, 446], [974, 500], 4, [98, 72, 62], INK, 4);
  s.circle(956, 540, 11, [226, 196, 96], INK, 3);

  /* porch light */
  s.rect([860, 150], [900, 190], [70, 62, 60], INK, 3);
  const lampOn = 0.75 + 0.25 * pulse(t, 0.4);
  s.polygon([[846, 190], [914, 190], [902, 232], [858, 232]], [242, 220, 150], INK, 4);
  glowSpot(s, 880, 232, 150, [255, 232, 160], 0.22 * lampOn);

  /* number 13 */
  s.text('13', 880, 122, 48, [246, 236, 214], { bold: true, tracking: 3 });

  /* doorbell */
  s.rrect([1048, 400], [1082, 448], 8, [214, 214, 220], INK, 3.4);
  s.circle(1065, 424, 10, [236, 130, 120], INK, 2.6);

  /* door mat */
  s.rrect([772, 618], [1006, 660], 8, [122, 92, 74], INK, 4);
  s.rect([790, 628], [988, 650], [150, 118, 92]);

  /* porch steps */
  s.rect([-2000, 660], [4000, 692], [140, 134, 138]);
  s.rect([-2000, 690], [4000, 720], [118, 112, 118]);

  /* potted shrub */
  s.polygon([[1076, 522], [1204, 522], [1188, 606], [1092, 606]], [168, 106, 78], INK, 4);
  for (const [dx, dy, r] of [[-46, -34, 34], [4, -54, 40], [50, -30, 32], [0, -14, 36]]) {
    s.circle(1140 + dx, 508 + dy, r, [86, 148, 92], INK, 4);
  }
}

/* ---------------------------------------------------------------- bar --- */

export function bar(s, t = 0) {
  full(s, [58, 42, 56]);
  s.rect([-2000, 0], [4000, 92], [38, 28, 42]);
  s.rect([-2000, 430], [4000, 1600], [50, 36, 48]);

  /* back shelf unit */
  s.rrect([140, 168], [1140, 424], 8, [72, 54, 66], INK, 5);
  s.rect([166, 190], [1114, 402], [46, 38, 56]);
  s.rect([186, 200], [1094, 216], [104, 74, 92]);
  s.rect([150, 190], [1130, 214], [116, 78, 54], INK, 4);
  s.rect([150, 312], [1130, 336], [116, 78, 54], INK, 4);

  /* bottles, two tiers */
  const cols = [
    [116, 168, 62], [78, 152, 92], [200, 120, 78], [156, 190, 96], [214, 94, 74],
    [126, 178, 140], [232, 160, 70], [96, 130, 168], [188, 196, 108],
  ];
  for (let i = 0; i < 9; i++) {
    const c = cols[i % cols.length];
    bottle(s, 186 + i * 104, 188, 30, 66 + (i % 3) * 8, c);
  }
  for (let i = 0; i < 11; i++) {
    const c = cols[(i + 4) % cols.length];
    bottle(s, 178 + i * 88, 310, 26, 58 + (i % 3) * 7, c);
  }
  s.rect([150, 336], [1130, 400], [62, 46, 58]);

  /* neon sign */
  const on = Math.sin(t * 11.3) + Math.sin(t * 4.1) * 0.6 > -1.25 ? 1 : 0.12;
  s.rrect([478, 74], [806, 176], 8, [40, 30, 42], INK, 4);
  neon(s, 'BAR', 642, 128, 62, [255, 88, 158], on);

  /* hanging lamp, hung clear of the sign to the right of the shelf */
  s.rect([1200, 0], [1220, 130], [70, 62, 72]);
  s.polygon([[1148, 130], [1272, 130], [1246, 186], [1174, 186]], [222, 200, 140], INK, 4);
  glowSpot(s, 1210, 210, 150, [255, 232, 168], 0.15);

  /* counter */
  s.rrect([60, 440], [1240, 494], 10, [158, 104, 66], INK, 6);
  s.rect([60, 490], [1240, 566], [108, 68, 46]);
  s.rect([60, 490], [1240, 504], [138, 90, 60]);
  s.line([[80, 546], [1220, 546]], 6, [186, 148, 84]);
  for (let i = 0; i < 8; i++) s.rect([104 + i * 150, 506], [166 + i * 150, 562], [92, 58, 40]);

  /* drinks on the counter */
  s.polygon([[302, 432], [346, 432], [338, 488], [310, 488]], [246, 244, 238], INK, 4);
  s.polygon([[306, 446], [342, 446], [336, 483], [312, 483]], [232, 176, 64]);
  s.rrect([300, 424], [348, 446], 8, [250, 250, 246], INK, 3.4);
  s.rrect([860, 430], [898, 488], 6, [214, 190, 130], INK, 4);
  s.ellipse(879, 430, 20, 7, [236, 216, 160]);
  s.polygon([[950, 436], [988, 436], [1026, 480], [952, 480]], [186, 216, 224], INK, 4);
  s.line([[964, 436], [998, 478]], 4, [246, 250, 252]);

  /* stools */
  for (let i = 0; i < 4; i++) {
    const x = 190 + i * 300;
    s.ellipse(x, 700, 52, 14, [70, 44, 44]);
    s.circle(x, 578, 46, [176, 74, 74], INK, 6);
    s.circle(x, 578, 30, [198, 96, 92]);
    s.rect([x - 11, 596], [x + 11, 690], [110, 108, 116], INK, 4);
    s.ellipse(x, 692, 56, 16, [110, 108, 116], INK, 4);
  }

  /* cigarette haze */
  alpha(s, 0.10, () => {
    s.ellipse(760, 300, 620, 120, [214, 200, 226]);
    s.ellipse(420, 240, 480, 90, [214, 200, 226]);
  });
}

/* ------------------------------------------------------------- office --- */

export function office(s, t = 0) {
  full(s, [200, 208, 216]);

  /* ceiling grid + light panels */
  s.rect([-2000, 0], [4000, 148], [226, 230, 236]);
  for (let i = 0; i < 9; i++) {
    s.rect([120 + i * 140, 0], [124 + i * 140, 148], [206, 212, 220]);
  }
  s.rect([-2000, 144], [4000, 152], [212, 216, 224]);
  const flick = Math.sin(t * 23) > 0.86 ? 0.46 : 1;
  for (let i = 0; i < 3; i++) {
    const x = 150 + i * 400;
    const a = i === 1 ? flick : 1;
    s.rrect([x, 24], [x + 250, 74], 6, shade([252, 252, 238], a), INK, 4);
    glowSpot(s, x + 125, 130, 210, [255, 250, 210], 0.10 * a);
  }
  s.rect([-2000, 146], [4000, 158], [180, 188, 198]);

  /* back wall + window to the city */
  s.rect([-2000, 158], [4000, 528], [196, 204, 212]);
  s.rrect([540, 190], [760, 420], 6, [70, 76, 88], INK, 5);
  s.rect([556, 206], [744, 404], [138, 174, 206]);
  s.rect([556, 206], [744, 250], [168, 196, 220]);
  for (let i = 0; i < 4; i++) s.rect([566 + i * 48, 268], [598 + i * 48, 404], [108, 138, 176]);
  s.rect([648, 206], [656, 404], [70, 76, 88]);

  /* carpet */
  s.rect([-2000, 520], [4000, 1600], [126, 130, 140]);
  for (let i = 0; i < 90; i++) {
    const x = hash(i * 2.7) * 1280, y = 528 + hash(i * 5.3) * 190;
    s.circle(x, y, 2.2, [112, 116, 126]);
  }
  s.rect([-2000, 512], [4000, 526], [150, 154, 164]);

  /* cubicle partitions */
  const part = (x0, x1) => {
    s.rrect([x0, 206], [x1, 522], 6, [154, 162, 176], INK, 5);
    s.rect([x0, 206], [x1, 226], [96, 104, 118]);
    s.rect([x0 + 10, 240], [x1 - 10, 380], [170, 178, 190]);
    for (let i = 0; i < 4; i++) {
      s.rect([x0 + 26 + i * 60, 262], [x0 + 66 + i * 60, 330], [240, 240, 226]);
      s.line([[x0 + 32 + i * 60, 286], [x0 + 58 + i * 60, 286]], 3, [180, 180, 190]);
      s.line([[x0 + 32 + i * 60, 302], [x0 + 54 + i * 60, 302]], 3, [180, 180, 190]);
    }
  };
  part(20, 460);
  part(812, 1260);

  /* desks on both sides, centre left open for action */
  const desk = (x0, x1, seed) => {
    const mx = (x0 + x1) / 2;
    s.rect([x0 + 18, 404], [x0 + 40, 528], [104, 108, 118], INK, 3);
    s.rect([x1 - 40, 404], [x1 - 18, 528], [104, 108, 118], INK, 3);
    s.rrect([x0 - 12, 382], [x1 + 12, 410], 6, [206, 186, 158], INK, 5);
    s.rect([x0 - 12, 406], [x1 + 12, 420], [176, 156, 130]);
    /* monitor */
    s.rrect([mx - 128, 218], [mx + 128, 358], 10, [58, 60, 72], INK, 5);
    const k = 0.78 + 0.22 * pulse(t + seed, 0.5);
    s.rect([mx - 112, 232], [mx + 112, 344], shade([122, 168, 214], k));
    s.rect([mx - 112, 232], [mx + 112, 258], shade([158, 196, 228], k));
    s.rect([mx - 16, 358], [mx + 16, 382], [70, 72, 84]);
    s.rrect([mx - 44, 372], [mx + 44, 386], 4, [70, 72, 84]);
    /* keyboard + mug + papers */
    s.rrect([mx - 96, 362], [mx + 34, 382], 4, [226, 226, 232], INK, 3);
    s.rrect([x1 - 96, 338], [x1 - 52, 382], 6, [232, 96, 96], INK, 3.4);
    s.arc(x1 - 52, 358, 12, 14, -1.4, 1.4, 4, [232, 96, 96]);
    s.rect([x0 + 6, 330], [x0 + 76, 382], [246, 246, 240], INK, 2.4);
    for (let i = 0; i < 3; i++) s.line([[x0 + 16, 346 + i * 12], [x0 + 66, 346 + i * 12]], 2.6, [160, 164, 176]);
  };
  desk(70, 400, 0);
  desk(880, 1210, 1.7);

  /* swivel chairs */
  s.rrect([200, 470], [316, 502], 8, [64, 66, 78], INK, 4);
  s.rrect([186, 372], [330, 486], 14, [80, 82, 96], INK, 5);
  s.rect([248, 502], [268, 570], [96, 98, 110]);
  for (const dx of [-58, 58]) {
    s.line([[258, 570], [258 + dx, 606]], 8, [96, 98, 110]);
    s.circle(258 + dx, 608, 12, [64, 66, 78], INK, 3);
  }
  s.rrect([1032, 470], [1148, 502], 8, [64, 66, 78], INK, 4);
  s.rrect([1018, 372], [1162, 486], 14, [80, 82, 96], INK, 5);
  s.rect([1080, 502], [1100, 570], [96, 98, 110]);
  for (const dx of [-58, 58]) {
    s.line([[1090, 570], [1090 + dx, 606]], 8, [96, 98, 110]);
    s.circle(1090 + dx, 608, 12, [64, 66, 78], INK, 3);
  }
}

/* ----------------------------------------------------------- hospital --- */

export function hospital(s, t = 0) {
  full(s, [206, 216, 214]);
  s.rect([-2000, 132], [4000, 190], [166, 200, 192]);
  s.rect([-2000, 0], [4000, 96], [234, 238, 238]);
  s.rrect([480, 22], [800, 66], 6, [250, 252, 242], INK, 4);
  glowSpot(s, 640, 120, 230, [255, 252, 220], 0.10);

  /* floor */
  s.rect([-2000, 520], [4000, 1600], [178, 184, 188]);
  for (let i = 0; i < 13; i++) s.rect([i * 104, 520], [i * 104 + 3, 1600], [158, 164, 170]);
  s.rect([-2000, 512], [4000, 526], [150, 158, 162]);

  /* hospital bed */
  s.rrect([104, 296], [162, 500], 8, [196, 200, 208], INK, 5);
  for (let i = 0; i < 3; i++) s.rect([112, 316 + i * 54], [154, 330 + i * 54], [148, 152, 162]);
  s.rect([122, 484], [142, 528], [140, 144, 154]);
  s.rect([618, 484], [638, 528], [140, 144, 154]);
  s.rrect([100, 428], [700, 502], 10, [214, 216, 222], INK, 5);
  s.rrect([128, 392], [684, 436], 8, [246, 246, 250], INK, 4);
  s.rrect([140, 366], [316, 404], 14, [252, 252, 254], INK, 4);
  s.rrect([292, 402], [700, 450], 8, [156, 200, 214], INK, 4);
  s.line([[292, 424], [700, 424]], 3, [132, 176, 192]);
  s.rect([676, 428], [700, 502], [186, 190, 198], INK, 4);

  /* IV stand + bag */
  s.rect([748, 214], [760, 542], [176, 180, 188], INK, 3);
  s.ellipse(754, 542, 40, 12, [150, 154, 162]);
  s.rrect([722, 226], [786, 330], 8, [226, 236, 240], INK, 4);
  s.rect([722, 288], [786, 322], [172, 210, 226]);
  s.line([[754, 330], [754, 380]], 4, [200, 206, 212]);

  /* monitor cart */
  s.rect([854, 462], [1022, 542], [186, 190, 198], INK, 5);
  s.circle(880, 546, 14, [140, 144, 152], INK, 3);
  s.circle(996, 546, 14, [140, 144, 152], INK, 3);
  s.rrect([842, 246], [1034, 400], 10, [88, 94, 106], INK, 6);
  s.rect([858, 262], [1018, 386], [38, 50, 58]);
  const pts = [];
  const ph = (t * 0.62) % 1;
  for (let i = 0; i <= 40; i++) {
    const u = i / 40;
    const x = lerp(870, 1006, u);
    let y = 340;
    const d = Math.abs(u - ph);
    if (d < 0.05) y -= 54 * (1 - d / 0.05);
    else if (d < 0.1) y += 14 * (1 - (d - 0.05) / 0.05);
    pts.push([x, y]);
  }
  s.line(pts, 3, [122, 240, 152]);
  s.text('\u2665 72', 938, 300, 22, [240, 130, 150], { bold: true });

  /* curtain rail + curtain */
  s.rect([980, 96], [1420, 116], [140, 146, 152], INK, 3);
  const bot = [];
  for (let i = 0; i <= 8; i++) {
    const x = 1040 + (i / 8) * 360;
    bot.push([x, 452 + Math.sin((i / 8) * Math.PI * 3) * 26]);
  }
  s.polygon([[1040, 110], [1400, 110], ...bot.reverse()], [186, 220, 218], INK, 4);
  for (let i = 0; i < 7; i++) {
    const x = 1058 + i * 54;
    s.line([[x, 116], [x + 6, 462]], 9, [166, 202, 202]);
  }
  s.rrect([1022, 96], [1062, 118], 6, [200, 206, 210], INK, 3);
}

/* ----------------------------------------------------------- bathroom --- */

export function bathroom(s, t = 0) {
  full(s, [200, 220, 226]);

  /* tiled wall */
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 7; j++) {
      const x = i * 148 - 20, y = j * 78;
      const tone = (i + j) % 2 ? [214, 232, 236] : [196, 220, 228];
      s.rect([x, y], [x + 148, y + 78], tone);
    }
  }
  s.rect([-2000, 0], [4000, 6], [176, 200, 208]);
  for (let i = 0; i < 10; i++) s.rect([i * 148 - 20, 0], [i * 148 - 12, 546], [168, 194, 204]);
  for (let j = 0; j < 8; j++) s.rect([-2000, j * 78 - 6], [4000, j * 78 + 2], [168, 194, 204]);
  s.rect([-2000, 452], [4000, 470], [150, 210, 206]);

  /* floor tiles */
  s.rect([-2000, 546], [4000, 1600], [178, 188, 192]);
  for (let i = 0; i < 7; i++) {
    for (let j = 0; j < 3; j++) {
      const x = i * 200 - 40, y = 546 + j * 70;
      s.rect([x, y], [x + 196, y + 66], (i + j) % 2 ? [196, 204, 208] : [178, 188, 194]);
    }
  }
  s.rect([-2000, 540], [4000, 556], [150, 178, 184]);

  /* mirror */
  s.rrect([150, 96], [540, 356], 12, [124, 148, 158], INK, LW);
  s.rrect([170, 116], [520, 336], 6, [186, 214, 222]);
  s.polygon([[186, 330], [340, 128], [430, 128], [212, 330]], [214, 234, 240]);
  s.polygon([[300, 330], [470, 140], [506, 160], [344, 330]], [204, 228, 236]);

  /* pedestal sink */
  s.polygon([[292, 420], [368, 420], [406, 546], [254, 546]], [246, 248, 250], INK, 5);
  s.rrect([150, 372], [510, 432], 26, [250, 250, 252], INK, 6);
  s.ellipse(330, 382, 150, 26, [200, 214, 222]);
  s.ellipse(330, 386, 116, 16, [228, 238, 242]);
  s.circle(330, 388, 14, [168, 190, 200], INK, 3);
  s.rect([322, 322], [338, 374], [206, 212, 220], INK, 3);
  s.rect([266, 314], [394, 328], [206, 212, 220], INK, 3);
  s.circle(330, 306, 12, [196, 204, 212], INK, 3);

  /* wall shelf holding soap + brush cup */
  s.rrect([540, 386], [770, 402], 4, [250, 250, 252], INK, 4);
  s.polygon([[560, 402], [576, 402], [570, 442], [566, 442]], [206, 212, 218]);
  s.polygon([[748, 402], [764, 402], [758, 442], [754, 442]], [206, 212, 218]);
  s.rrect([560, 362], [640, 392], 8, [236, 176, 200], INK, 4);
  s.rrect([672, 302], [734, 392], 8, [214, 226, 234], INK, 4);
  s.line([[690, 384], [688, 316]], 7, [240, 240, 244]);
  s.line([[706, 384], [712, 320]], 7, [190, 226, 240]);
  s.line([[716, 384], [728, 312]], 7, [240, 210, 200]);

  /* towel rail + towel */
  s.rect([900, 150], [1240, 166], [170, 176, 182], INK, 3);
  s.rrect([946, 158], [1200, 366], 6, [228, 98, 112], INK, 5);
  s.rect([946, 300], [1200, 322], [246, 246, 250]);
  s.line([[1074, 170], [1074, 356]], 4, [196, 76, 92]);

  /* bath mat */
  s.rrect([470, 600], [880, 676], 16, [126, 176, 196], INK, 4);
  s.rrect([500, 618], [850, 658], 12, [158, 202, 216]);

  /* dripping tap */
  const dt = (t * 0.7) % 1;
  s.circle(330, 400 + dt * 90, 6 - dt * 2, [190, 224, 240]);
}

/* ------------------------------------------------------------- street --- */

export function street(s, t = 0) {
  full(s, [118, 160, 212]);
  s.rect([-2000, 300], [4000, 470], [168, 200, 232]);
  cloud(s, drift(60, t, 7, 1700), 104, 1.0, [246, 250, 255]);
  cloud(s, drift(760, t, 11, 1700), 58, 0.68, [238, 244, 252]);
  cloud(s, drift(1320, t, 4, 1700), 176, 0.9, [250, 252, 255]);

  /* far skyline */
  const far = [
    [20, 252, 150], [180, 186, 122], [312, 300, 168], [490, 214, 132],
    [632, 318, 176], [818, 196, 124], [952, 284, 198], [1162, 224, 152],
  ];
  for (const [x, y, w] of far) {
    s.rect([x, y], [x + w, 470], [94, 106, 134]);
    windows(s, x + 12, y + 18, w - 24, 470 - y - 34,
      Math.max(2, Math.round(w / 46)), Math.max(3, Math.round((470 - y) / 74)),
      x * 0.013, t, [250, 226, 158], [70, 80, 104]);
  }

  /* near buildings framing the shot */
  s.rect([-60, 84], [300, 470], [126, 118, 126], INK, 5);
  s.rect([-60, 84], [300, 112], [96, 88, 96]);
  windows(s, -20, 130, 260, 320, 3, 3, 4.1, t, [252, 232, 170], [78, 72, 84]);
  s.rrect([60, 356], [230, 470], 6, [84, 76, 86], INK, 4);
  s.rect([-60, 62], [300, 88], [104, 96, 104]);

  s.rect([980, 46], [1360, 470], [118, 112, 122], INK, 5);
  s.rect([980, 46], [1360, 74], [92, 86, 96]);
  windows(s, 1010, 96, 330, 330, 3, 3, 9.3, t, [252, 232, 170], [74, 68, 80]);
  s.rrect([1040, 340], [1240, 470], 6, [80, 72, 84], INK, 4);

  /* storefront awning over the left door (drawn behind the street lamp) */
  s.polygon([[-60, 300], [300, 300], [300, 332], [-60, 332]], [196, 78, 88], INK, 4);
  for (let i = 0; i < 9; i++) s.circle(-40 + i * 44, 332, 22, [196, 78, 88]);
  s.rect([-60, 300], [300, 314], [224, 108, 118]);

  /* sidewalk */
  s.rect([-2000, 470], [4000, 566], [172, 170, 174]);
  for (let i = 0; i < 12; i++) s.rect([i * 140 - 40, 470], [i * 140 - 34, 566], [152, 150, 156]);
  s.rect([-2000, 470], [4000, 480], [196, 194, 198]);
  s.rect([-2000, 556], [4000, 574], [136, 134, 140]);
  s.rect([-2000, 572], [4000, 1600], [66, 64, 74]);

  /* road markings */
  for (let i = 0; i < 9; i++) s.rect([i * 170 - 40, 648], [i * 170 + 70, 660], [216, 196, 108]);
  s.ellipse(1006, 610, 46, 16, [82, 80, 90], INK, 4);

  /* street lamp */
  s.rect([150, 232], [170, 556], [78, 84, 92], INK, 4);
  s.rect([150, 232], [280, 252], [78, 84, 92], INK, 4);
  s.polygon([[244, 250], [302, 250], [292, 290], [254, 290]], [104, 110, 118], INK, 4);
  s.rrect([258, 286], [290, 300], 5, [250, 240, 196]);
  glowSpot(s, 274, 334, 150, [255, 236, 168], 0.13);
  s.ellipse(160, 556, 34, 10, [120, 118, 124]);

  /* hydrant */
  s.rrect([836, 470], [912, 556], 12, [204, 76, 76], INK, 4);
  s.rrect([812, 496], [936, 524], 8, [176, 60, 60], INK, 4);
  s.rrect([852, 438], [896, 474], 8, [204, 76, 76], INK, 4);
  s.circle(886, 502, 16, [176, 60, 60], INK, 3.4);

  /* trash can */
  s.polygon([[1096, 470], [1200, 470], [1186, 560], [1110, 560]], [96, 110, 104], INK, 4);
  for (let i = 0; i < 3; i++) s.line([[1104 + i * 2, 486 + i * 24], [1190 - i * 2, 486 + i * 24]], 3, [76, 90, 86]);

  /* sign */
  s.rect([360, 300], [374, 542], [96, 100, 108], INK, 3);
  s.rrect([300, 240], [434, 316], 6, [246, 246, 240], INK, 4);
  s.text('ONE', 367, 264, 22, [200, 60, 70], { bold: true });
  s.text('WAY', 367, 292, 22, [200, 60, 70], { bold: true });
}

/* ------------------------------------------------------------ rooftop --- */

export function rooftop(s, t = 0) {
  full(s, [26, 28, 54]);
  s.rect([-2000, 250], [4000, 420], [44, 46, 80]);
  s.rect([-2000, 420], [4000, 470], [78, 60, 88]);

  /* stars */
  for (let i = 0; i < 46; i++) {
    const x = hash(i * 1.9) * 1280;
    const y = hash(i * 4.3) * 330;
    const tw = 0.45 + 0.55 * pulse(t * 1.6 + i, 1, hash(i) * 3);
    s.circle(x, y, 1.2 + tw * 1.5, [240, 244, 255]);
  }
  /* moon */
  s.circle(1090, 116, 48, [246, 244, 218]);
  s.circle(1074, 104, 9, [226, 224, 200]);
  s.circle(1104, 132, 6, [226, 224, 200]);
  glowSpot(s, 1090, 116, 130, [250, 246, 220], 0.14);

  /* skyline: far, then near */
  const far = [
    [-40, 300, 130], [90, 236, 104], [196, 330, 120], [320, 262, 118],
    [440, 346, 140], [582, 288, 112], [696, 356, 130], [828, 268, 104],
    [934, 322, 118], [1062, 280, 130], [1196, 340, 124],
  ];
  for (const [x, y, w] of far) {
    s.rect([x, y], [x + w, 470], [44, 48, 80]);
    windows(s, x + 10, y + 16, w - 20, 470 - y - 30,
      Math.max(2, Math.round(w / 42)), Math.max(3, Math.round((470 - y) / 62)),
      x * 0.017 + 2, t, [250, 222, 150], [34, 38, 66]);
  }
  const near = [[-60, 200, 160], [212, 286, 130], [860, 210, 150], [1096, 300, 210]];
  for (const [x, y, w] of near) {
    s.rect([x, y], [x + w, 470], [24, 26, 48]);
    windows(s, x + 12, y + 18, w - 24, 470 - y - 34,
      Math.max(2, Math.round(w / 52)), Math.max(3, Math.round((470 - y) / 68)),
      x * 0.021 + 7, t, [252, 226, 152], [18, 20, 38]);
  }

  /* parapet (the ledge) */
  s.rect([-2000, 440], [4000, 530], [76, 74, 92], INK, 5);
  s.rect([-2000, 440], [4000, 460], [110, 108, 128], INK, 4);
  for (let i = 0; i < 14; i++) s.rect([i * 100 - 20, 468], [i * 100 - 8, 524], [66, 64, 82]);

  /* roof deck */
  s.rect([-2000, 528], [4000, 1600], [66, 64, 76]);
  s.rect([-2000, 528], [4000, 542], [84, 82, 96]);
  for (let i = 0; i < 120; i++) {
    const x = hash(i * 3.1) * 1280, y = 546 + hash(i * 6.7) * 174;
    s.circle(x, y, 2 + hash(i * 1.3) * 2, [56, 54, 66]);
  }
  alpha(s, 0.10, () => {
    s.ellipse(420, 620, 300, 46, [34, 32, 42]);
    s.ellipse(980, 664, 380, 54, [34, 32, 42]);
  });
  s.rect([-2000, 596], [4000, 602], [52, 50, 60]);
  s.rect([-2000, 700], [4000, 706], [52, 50, 60]);

  /* door hut */
  s.rrect([40, 292], [274, 542], 6, [76, 76, 94], INK, 6);
  s.rrect([64, 344], [200, 542], 4, [48, 48, 64], INK, 5);
  s.circle(184, 448, 7, [214, 186, 110], INK, 3);
  s.rect([30, 274], [286, 300], [80, 80, 100], INK, 4);
  const bulb = 0.6 + 0.4 * pulse(t, 0.3);
  s.rect([250, 300], [262, 330], [70, 70, 88]);
  s.circle(256, 340, 13, [250, 232, 170], INK, 3);
  glowSpot(s, 256, 340, 120, [255, 236, 170], 0.16 * bulb);

  /* AC unit */
  s.rrect([980, 396], [1240, 542], 8, [104, 106, 118], INK, 6);
  s.rect([1000, 416], [1220, 522], [72, 74, 88], INK, 4);
  s.circle(1110, 468, 40, [88, 90, 104], INK, 4);
  s.circle(1110, 468, 12, [56, 58, 70]);
  for (let i = 0; i < 4; i++) {
    const a = t * 1.4 + (i / 4) * TAU;
    s.line([[1110, 468], [1110 + Math.cos(a) * 38, 468 + Math.sin(a) * 38]], 5, [70, 72, 86]);
  }
  s.rect([1000, 522], [1040, 552], [80, 82, 96], INK, 3);
  s.rect([1180, 522], [1220, 552], [80, 82, 96], INK, 3);

  /* vent pipes */
  s.rect([800, 452], [836, 542], [92, 92, 104], INK, 4);
  s.rrect([788, 430], [848, 458], 6, [116, 116, 130], INK, 4);
  s.rect([872, 480], [900, 542], [92, 92, 104], INK, 4);
  s.rrect([862, 462], [910, 488], 6, [116, 116, 130], INK, 4);

  /* satellite dish bolted to the parapet */
  s.rect([416, 396], [436, 452], [76, 76, 92], INK, 4);
  s.rrect([404, 386], [448, 404], 5, [96, 96, 112], INK, 4);
  s.polygon([[424, 400], [430, 400], [436, 372], [430, 368]], [120, 120, 136]);
  s.ellipse(430, 358, 42, 36, [154, 154, 168], INK, 5, -0.3);
  s.ellipse(430, 358, 26, 22, [104, 104, 120], INK, 3, -0.3);
  s.line([[430, 358], [466, 330]], 6, [150, 150, 164]);
  s.circle(470, 327, 7, [200, 200, 212], INK, 3);

  /* antenna mast */
  s.rect([676, 240], [690, 542], [84, 84, 98], INK, 3);
  for (const [yy, ww] of [[276, 74], [316, 60], [352, 46]]) {
    s.rect([676 - ww, yy], [690 + ww, yy + 8], [84, 84, 98]);
  }
  s.circle(683, 250, 6, [230, 90, 90]);

  /* pigeon perched on the parapet cap */
  s.ellipse(520, 427, 19, 13, [124, 124, 138], INK, 3);
  s.circle(536, 417, 9, [140, 140, 154], INK, 2.6);
  s.polygon([[544, 415], [560, 419], [544, 423]], [220, 180, 90]);
  s.line([[503, 432], [490, 452]], 4, [104, 104, 120]);
}

/* ---------------------------------------------------------- graveyard --- */

export function graveyard(s, t = 0) {
  full(s, [48, 46, 72]);
  s.rect([-2000, 220], [4000, 380], [76, 62, 92]);
  s.rect([-2000, 380], [4000, 480], [112, 88, 108]);
  /* pale moon */
  s.circle(1032, 116, 44, [234, 228, 236]);
  s.circle(1016, 104, 8, [212, 204, 216]);
  alpha(s, 0.14, () => s.circle(1032, 116, 96, [234, 228, 236]));

  /* distant hills */
  s.pie(240, 486, 460, 150, Math.PI, TAU, [64, 66, 88]);
  s.pie(880, 486, 560, 120, Math.PI, TAU, [58, 60, 82]);
  s.pie(1330, 486, 420, 170, Math.PI, TAU, [64, 66, 88]);

  /* iron fence */
  const fy0 = 330, fy1 = 500;
  for (let i = 0; i < 4; i++) {
    const x = 60 + i * 380;
    s.rrect([x, fy0 - 30], [x + 34, fy1], 4, [54, 54, 68], INK, 4);
    s.polygon([[x - 8, fy0 - 30], [x + 42, fy0 - 30], [x + 17, fy0 - 62]], [54, 54, 68], INK, 4);
  }
  for (let i = 0; i < 26; i++) {
    const x = 100 + i * 47;
    if (i % 8 === 0) continue;
    s.rect([x, fy0], [x + 9, fy1], [50, 50, 64]);
    s.polygon([[x - 3, fy0], [x + 12, fy0], [x + 4.5, fy0 - 22]], [50, 50, 64], INK, 3);
  }
  s.rect([-2000, 372], [4000, 390], [50, 50, 64]);
  s.rect([-2000, 452], [4000, 470], [50, 50, 64]);

  /* ground */
  s.rect([-2000, 470], [4000, 1600], [74, 88, 74]);
  s.rect([-2000, 470], [4000, 486], [92, 106, 88]);
  s.ellipse(640, 690, 900, 150, [66, 80, 68]);

  /* bare tree */
  (function bareTree() {
    const sway = Math.sin(t * 0.8) * 0.012;
    const br = (x0, y0, ang, len, w, depth) => {
      const x1 = x0 + Math.sin(ang + sway * depth) * len;
      const y1 = y0 - Math.cos(ang) * len;
      s.line([[x0, y0], [x1, y1]], w, [46, 40, 50]);
      if (depth <= 0) return;
      br(x1, y1, ang - 0.46 - depth * 0.05, len * 0.74, w * 0.68, depth - 1);
      br(x1, y1, ang + 0.4 + depth * 0.04, len * 0.7, w * 0.66, depth - 1);
    };
    s.polygon([[76, 522], [172, 522], [148, 300], [118, 300]], [40, 34, 44], INK, 4);
    s.polygon([[76, 522], [104, 522], [112, 470], [70, 494]], [40, 34, 44]);
    s.polygon([[150, 522], [176, 522], [166, 478], [198, 496]], [40, 34, 44]);
    br(133, 318, 0.05, 130, 20, 4);
    br(124, 400, -0.35, 90, 14, 2);
    br(140, 380, 0.4, 84, 13, 2);
  })();

  /* headstones */
  const stone = [150, 152, 158];
  const stoneD = [126, 128, 134];
  const stone2 = [168, 168, 172];
  const stone3 = [138, 140, 148];

  const headstone = (x, gy, w, h, col, round) => {
    s.rrect([x - w / 2, gy - h], [x + w / 2, gy], round ? 10 : 4, col, INK, 5);
    if (round) s.pie(x, gy - h, w / 2, w / 2, Math.PI, TAU, col);
    if (round) s.rrect([x - w / 2, gy - h - 6], [x + w / 2, gy - h + 6], 8, col, INK, 5);
    s.rect([x - w * 0.34, gy - h * 0.7], [x + w * 0.34, gy - h * 0.62], shade(col, 0.82));
    s.rect([x - w * 0.34, gy - h * 0.52], [x + w * 0.16, gy - h * 0.44], shade(col, 0.82));
    s.line([[x, gy - h * 0.86], [x, gy - h * 0.76]], 5, shade(col, 0.82));
    s.line([[x - 8, gy - h * 0.81], [x + 8, gy - h * 0.81]], 5, shade(col, 0.82));
    s.rect([x - w * 0.6, gy - 6], [x + w * 0.6, gy + 6], shade(col, 0.9), INK, 3);
  };

  headstone(300, 520, 92, 128, stone, true);
  headstone(452, 546, 76, 100, stoneD, false);
  headstone(612, 512, 108, 150, stone2, true);
  headstone(880, 540, 84, 112, stone3, false);
  headstone(1010, 512, 96, 140, stone, true);
  headstone(1090, 552, 72, 92, stoneD, true);

  /* cross stone */
  s.rect([730, 400], [786, 546], stone2, INK, 5);
  s.rect([700, 440], [816, 486], stone2, INK, 5);
  s.rect([736, 424], [780, 542], [186, 186, 190]);

  /* obelisk */
  s.polygon([[1192, 300], [1232, 300], [1244, 520], [1180, 520]], stone3, INK, 5);
  s.rrect([1166, 520], [1258, 546], 4, stoneD, INK, 4);
  s.polygon([[1196, 274], [1228, 274], [1232, 300], [1192, 300]], [172, 172, 176], INK, 4);

  /* fresh grave mound + spade stuck in the dirt */
  s.ellipse(560, 668, 150, 30, [96, 96, 74]);
  s.polygon([[452, 656], [664, 656], [630, 706], [486, 706]], [116, 100, 78], INK, 4);
  s.rect([634, 548], [650, 668], [142, 108, 74], INK, 3.4);
  s.rrect([624, 526], [660, 556], 6, [142, 108, 74], INK, 3.4);
  s.polygon([[614, 638], [672, 638], [666, 686], [620, 686]], [168, 170, 176], INK, 4);

  /* grass tufts */
  for (let i = 0; i < 40; i++) {
    const x = hash(i * 2.3) * 1280;
    const y = 560 + hash(i * 7.1) * 150;
    s.line([[x, y], [x - 6, y - 14]], 3.4, [88, 108, 84]);
    s.line([[x, y], [x + 7, y - 11]], 3.4, [88, 108, 84]);
  }

  /* fog */
  alpha(s, 0.08, () => {
    s.ellipse(340 + Math.sin(t * 0.3) * 40, 552, 460, 44, [200, 204, 218]);
    s.ellipse(900 + Math.cos(t * 0.24) * 50, 596, 500, 50, [200, 204, 218]);
  });

  /* crow on the tall stone */
  s.ellipse(1146, 552, 20, 14, [30, 28, 38], INK, 3);
  s.circle(1162, 540, 10, [30, 28, 38], INK, 2.6);
  s.polygon([[1170, 540], [1186, 544], [1170, 548]], [200, 160, 70]);
  s.line([[1130, 556], [1118, 572]], 4, [30, 28, 38]);
}
