import * as THREE from 'three';
import {
  makeCanvas, toTexture, rng, stroke, line, scribbleCircle, hatch, type Ctx2D,
} from '../engine/ink';
import { INK } from '../engine/palette';

/**
 * THE MOUNTS' DRAWINGS (SCALE pillar). The horse is one pose sheet —
 * five frames side by side on one canvas, the way the walker's own
 * sheet works — so a ride is a texture offset and never a material
 * swap. Everything is ballpoint on paper: strokes from `ink.ts`, a
 * thin dun wash under the outline, and no image anywhere.
 */

const DUN = '#b9a888';
const SADDLE = '#7a5a48';

export const HORSE_FRAMES = 5;
export const HORSE_FW = 192;
export const HORSE_FH = 144;

function fillPoly(ctx: Ctx2D, pts: [number, number][], color: string, alpha: number) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/** One leg: hip → knee → hoof, as two strokes and a hoof mark. */
function leg(ctx: Ctx2D, r: () => number, hx: number, hy: number, kx: number, ky: number, fx: number, fy: number, w = 2.6) {
  stroke(ctx, [[hx, hy], [kx, ky], [fx, fy]], r, { width: w, alpha: 0.86 });
  line(ctx, fx - 5, fy + 1, fx + 6, fy + 1, r, { width: 2.4, alpha: 0.85, passes: 1 }, 2);
}

/**
 * The frames: 0 standing · 1 trot A · 2 trot B · 3 gallop A (legs
 * stretched) · 4 gallop B (legs gathered). Drawn facing EAST; the
 * mount mirrors it to go west, exactly as the bicycle does.
 */
function drawHorse(ctx: Ctx2D, r: () => number, frame: number) {
  const gallop = frame >= 3;
  const bob = frame === 4 ? -4 : frame === 3 ? 3 : 0;
  // the body: a long oval, low at the belly, with the withers up
  const body: [number, number][] = [];
  for (let i = 0; i <= 26; i++) {
    const a = (i / 26) * Math.PI * 2;
    const rx = 52 * (0.94 + ((i % 4) * 0.02));
    const ry = 24 * (0.92 + ((i % 3) * 0.03));
    body.push([100 + Math.cos(a) * rx, 74 + bob + Math.sin(a) * ry * (Math.sin(a) > 0 ? 1.05 : 0.92)]);
  }
  fillPoly(ctx, body, DUN, 0.3);
  stroke(ctx, body, r, { width: 2.6, alpha: 0.88, jitter: 1.4 });
  // the neck rises from the withers to the head
  const neck: [number, number][] = [[136, 56 + bob], [156, 34 + bob], [168, 26 + bob]];
  const throat: [number, number][] = [[146, 74 + bob], [162, 52 + bob], [172, 40 + bob]];
  fillPoly(ctx, [...neck, [176, 32 + bob], ...throat.slice().reverse()], DUN, 0.3);
  stroke(ctx, neck, r, { width: 2.6, alpha: 0.86 });
  stroke(ctx, throat, r, { width: 2.4, alpha: 0.82 });
  // the head: long, the muzzle forward, one ear, one eye
  const head: [number, number][] = [[164, 22 + bob], [178, 20 + bob], [190, 36 + bob], [186, 46 + bob], [174, 44 + bob], [166, 34 + bob]];
  fillPoly(ctx, head, DUN, 0.3);
  stroke(ctx, [...head, head[0]], r, { width: 2.4, alpha: 0.88 });
  line(ctx, 170, 22 + bob, 166, 10 + bob, r, { width: 2, alpha: 0.85 });
  line(ctx, 166, 10 + bob, 174, 21 + bob, r, { width: 2, alpha: 0.85 });
  scribbleCircle(ctx, 176, 30 + bob, 2.2, r, { width: 1.4, alpha: 0.9 });
  // the mane: short hatch down the neck
  for (let i = 0; i < 7; i++) {
    const t = i / 6;
    const x = 138 + t * 26;
    const y = 54 + bob - t * 26;
    line(ctx, x, y, x - 6 - r() * 4, y + 8 + r() * 4, r, { width: 1.6, alpha: 0.7, passes: 1 });
  }
  // the tail
  stroke(ctx, [[50, 62 + bob], [38, 78 + bob], [34, 100 + bob], [40, 112 + bob]], r, { width: 2.2, alpha: 0.8, jitter: 2.4 });
  stroke(ctx, [[50, 64 + bob], [34, 84 + bob], [30, 106 + bob]], r, { width: 1.6, alpha: 0.6, jitter: 2.8 });
  // the saddle, and a girth line under it
  fillPoly(ctx, [[86, 52 + bob], [116, 50 + bob], [120, 60 + bob], [84, 62 + bob]], SADDLE, 0.45);
  stroke(ctx, [[84, 62 + bob], [86, 52 + bob], [116, 50 + bob], [120, 60 + bob]], r, { width: 2, alpha: 0.85 });
  line(ctx, 100, 62 + bob, 98, 96 + bob, r, { width: 1.6, alpha: 0.55, passes: 1 });
  // the reins, from the bit back to the saddle
  stroke(ctx, [[184, 42 + bob], [150, 56 + bob], [118, 54 + bob]], r, { width: 1.2, alpha: 0.6, passes: 1 });
  // the legs, by the frame
  const g = 96 + bob; // where the belly ends and a leg begins
  const F = 136;      // the ground line
  if (frame === 0) {
    leg(ctx, r, 66, g, 62, 116, 60, F);
    leg(ctx, r, 80, g, 80, 116, 82, F, 2.2);
    leg(ctx, r, 124, g, 126, 116, 126, F);
    leg(ctx, r, 138, g, 140, 116, 142, F, 2.2);
  } else if (frame === 1) {
    leg(ctx, r, 66, g, 54, 114, 46, F);
    leg(ctx, r, 80, g, 90, 112, 96, 128, 2.2);
    leg(ctx, r, 124, g, 140, 112, 150, 126);
    leg(ctx, r, 138, g, 134, 116, 130, F, 2.2);
  } else if (frame === 2) {
    leg(ctx, r, 66, g, 76, 112, 84, 128);
    leg(ctx, r, 80, g, 68, 114, 60, F, 2.2);
    leg(ctx, r, 124, g, 120, 116, 116, F);
    leg(ctx, r, 138, g, 152, 112, 162, 126, 2.2);
  } else if (frame === 3) {
    // stretched: hind legs back, forelegs reaching
    leg(ctx, r, 66, g, 44, 108, 26, 126);
    leg(ctx, r, 80, g, 58, 110, 40, 130, 2.2);
    leg(ctx, r, 124, g, 152, 104, 176, 118);
    leg(ctx, r, 138, g, 160, 108, 180, 126, 2.2);
  } else {
    // gathered: everything under the belly
    leg(ctx, r, 66, g, 84, 112, 96, 124);
    leg(ctx, r, 80, g, 94, 114, 104, 128, 2.2);
    leg(ctx, r, 124, g, 110, 114, 100, 130);
    leg(ctx, r, 138, g, 124, 116, 114, 132, 2.2);
  }
}

let HORSE_SHEET: THREE.CanvasTexture | null = null;

/** The five-frame sheet, made once. `repeat.x` is one frame wide; the
 *  mount sets `offset.x` to choose a frame. */
export function horseSheet(): THREE.CanvasTexture {
  if (HORSE_SHEET) return HORSE_SHEET;
  const { canvas, ctx } = makeCanvas(HORSE_FW * HORSE_FRAMES, HORSE_FH);
  for (let f = 0; f < HORSE_FRAMES; f++) {
    ctx.save();
    ctx.translate(f * HORSE_FW, 0);
    drawHorse(ctx, rng(9100 + f), f);
    ctx.restore();
  }
  const tex = toTexture(canvas);
  tex.repeat.set(1 / HORSE_FRAMES, 1);
  tex.wrapS = THREE.ClampToEdgeWrapping;
  HORSE_SHEET = tex;
  return tex;
}

/** The hitching post at the crossroads: a post, a rail, a loop of rope. */
export function hitchingPostTexture(seed: number): THREE.CanvasTexture {
  const { canvas, ctx } = makeCanvas(64, 128);
  const r = rng(seed);
  line(ctx, 30, 122, 32, 30, r, { width: 3.2, alpha: 0.9 });
  line(ctx, 8, 40, 56, 38, r, { width: 3, alpha: 0.88 });
  line(ctx, 8, 40, 8, 52, r, { width: 2.4, alpha: 0.8, passes: 1 });
  line(ctx, 56, 38, 56, 50, r, { width: 2.4, alpha: 0.8, passes: 1 });
  hatch(ctx, 26, 34, 10, 88, 1.3, 6, r, { alpha: 0.16, color: INK });
  // the rope, hung off the rail
  stroke(ctx, [[46, 40], [44, 56], [48, 66], [54, 60], [50, 46]], r, { width: 1.6, alpha: 0.7, jitter: 2 });
  line(ctx, 22, 124, 42, 124, r, { width: 2, alpha: 0.6, passes: 1 }, 2);
  return toTexture(canvas);
}
