/*
 * scenes.js — the public entry point for the cartoon.
 *
 * The film is defined as data in shots.js and drawn by gags.js. This file just
 * exposes the timeline + the render call, so the live site (main.js) and the
 * offline renderer (tools/render.mjs) share the exact same frames.
 */
import { Pen } from './engine.js';
import { SHOTS, shotAt } from './shots.js';
import { drawGag } from './gags.js';

export const BPM = 172.27;
export const BEAT = 60 / BPM;          // 0.3483 s
export const BAR = BEAT * 4;           // 1.393 s
export const FIRST_BEAT = 0.232;
export const DURATION = 160.99;        // song fades out ~161s

/** downbeat n of the song, in seconds (bar-anchored) */
export const B = (n) => FIRST_BEAT + n * BAR;

export { SHOTS, shotAt };

/** name of the shot playing at t — used by the UI label */
export function sceneAt(t) {
  const { shot } = shotAt(t);
  return { scene: { name: `${shot.id} — ${shot.note}` } };
}

export function drawFrame(ctx, t) {
  const { shot, t: lt } = shotAt(t);
  const len = shot.to - shot.from;
  drawGag(ctx, shot.id, lt, len);
}

/** dev helper: a Pen on the live ctx (kept for parity with the old API) */
export function penFor(ctx) { return new Pen(ctx); }
