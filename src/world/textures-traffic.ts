import * as THREE from 'three';
import {
  makeCanvas, toTexture, rng, stroke, line, scribbleCircle, hatch, type Ctx2D,
} from '../engine/ink';
import { WHITE_INK } from '../engine/palette';
import { folkTexture, type FolkKind, type FolkPose } from './textures-life';

/**
 * THE TRAFFIC'S DRAWINGS (SCALE pillar). Every mover in `traffic.ts`
 * is an instance on ONE of four atlases — a row of cells on a single
 * canvas, chosen per instance by a frame index — so all the carts,
 * cars, sails, sheep, dogs, birds, folk, smoke, flags and rain on the
 * sheet cost a handful of draw calls between them. All ballpoint.
 */

export type Atlas = { tex: THREE.CanvasTexture; cols: number };

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

function poly(ctx: Ctx2D, pts: [number, number][], r: () => number, o: Parameters<typeof stroke>[3] = {}) {
  stroke(ctx, [...pts, pts[0]], r, o);
}

function atlas(cellW: number, cellH: number, n: number, seed: number,
  draw: (ctx: Ctx2D, r: () => number, i: number) => void): Atlas {
  const { canvas, ctx } = makeCanvas(cellW * n, cellH);
  for (let i = 0; i < n; i++) {
    ctx.save();
    ctx.translate(i * cellW, 0);
    ctx.beginPath();
    ctx.rect(0, 0, cellW, cellH);
    ctx.clip();
    draw(ctx, rng(seed + i * 7), i);
    ctx.restore();
  }
  const tex = toTexture(canvas);
  tex.wrapS = THREE.ClampToEdgeWrapping;
  return { tex, cols: n };
}

/* ---- FOLK: three kinds × stand / stride A / stride B ---------------- */

export const FOLK_W = 96;
export const FOLK_H = 160;
/** Cell index for a kind and a walking frame (0 stand, 1, 2 strides). */
export const folkCell = (kind: FolkKind, f: 0 | 1 | 2) => kind * 3 + f;

/** The generic folk, copied off their own drawings so a crowd is the
 *  same people who keep the routines. */
export function folkAtlas(): Atlas {
  const poses: FolkPose[] = [0, 1, 5];
  return atlas(FOLK_W, FOLK_H, 9, 0, (ctx, _r, i) => {
    const kind = Math.floor(i / 3) as FolkKind;
    const tex = folkTexture(kind, poses[i % 3]);
    ctx.drawImage(tex.image as HTMLCanvasElement, 0, 0);
  });
}

/* ---- WHEELS AND HOOVES: the things that go along the ground -------- */

export const WHEEL_W = 160;
export const WHEEL_H = 112;
export const WHEELS = {
  cartA: 0, cartB: 1,
  carA: 2, carB: 3, carC: 4,
  sailL: 5, sailR: 6,
  sheepA: 7, sheepB: 8,
  dogA: 9, dogB: 10,
  tumbleA: 11, tumbleB: 12,
} as const;

const CAR_COLORS = ['#8a5a4a', '#5c86a0', '#6a6d5a'];
const CLOTH = '#e6ddc4';
const TIMBER = '#b9a888';

function wheel(ctx: Ctx2D, r: () => number, x: number, y: number, rad: number, turn: number) {
  scribbleCircle(ctx, x, y, rad, r, { width: 2, alpha: 0.88 }, 1.15);
  scribbleCircle(ctx, x, y, 2.4, r, { width: 1.2, alpha: 0.6 });
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI + turn;
    line(ctx, x + Math.cos(a) * 3, y + Math.sin(a) * 3, x + Math.cos(a) * (rad - 1), y + Math.sin(a) * (rad - 1), r, { width: 1, alpha: 0.4, passes: 1 });
    line(ctx, x - Math.cos(a) * 3, y - Math.sin(a) * 3, x - Math.cos(a) * (rad - 1), y - Math.sin(a) * (rad - 1), r, { width: 1, alpha: 0.4, passes: 1 });
  }
}

/** A pony cart, facing east: the pony leads, the cart follows. */
function drawCart(ctx: Ctx2D, r: () => number, frame: number) {
  // the pony
  const bob = frame ? 2 : 0;
  const body: [number, number][] = [];
  for (let i = 0; i <= 18; i++) {
    const a = (i / 18) * Math.PI * 2;
    body.push([124 + Math.cos(a) * 24, 62 + bob + Math.sin(a) * 13]);
  }
  fillPoly(ctx, body, TIMBER, 0.28);
  stroke(ctx, body, r, { width: 2.2, alpha: 0.86 });
  stroke(ctx, [[142, 52 + bob], [152, 38 + bob], [158, 34 + bob]], r, { width: 2.2, alpha: 0.85 });
  poly(ctx, [[152, 32 + bob], [160, 30 + bob], [166, 40 + bob], [158, 44 + bob]], r, { width: 2, alpha: 0.85 });
  line(ctx, 154, 32 + bob, 152, 25 + bob, r, { width: 1.6, alpha: 0.8 });
  const f = frame ? 8 : 0;
  line(ctx, 110, 72 + bob, 104 - f, 98, r, { width: 2.2, alpha: 0.85 });
  line(ctx, 118, 74 + bob, 122 + f, 98, r, { width: 2, alpha: 0.8 });
  line(ctx, 132, 74 + bob, 128 + f, 98, r, { width: 2.2, alpha: 0.85 });
  line(ctx, 140, 72 + bob, 146 - f, 98, r, { width: 2, alpha: 0.8 });
  // the shafts and the cart
  line(ctx, 104, 62, 60, 60, r, { width: 2.4, alpha: 0.8 });
  const bed: [number, number][] = [[14, 50], [72, 50], [76, 72], [10, 72]];
  fillPoly(ctx, bed, TIMBER, 0.32);
  poly(ctx, bed, r, { width: 2.4, alpha: 0.86 });
  hatch(ctx, 16, 52, 56, 18, 0.1, 6, r, { alpha: 0.14 });
  // a load under a cloth
  stroke(ctx, [[18, 50], [26, 36], [44, 30], [62, 38], [70, 50]], r, { width: 2, alpha: 0.8, jitter: 2 });
  fillPoly(ctx, [[18, 50], [26, 36], [44, 30], [62, 38], [70, 50]], CLOTH, 0.4);
  wheel(ctx, r, 42, 82, 17, frame ? 0.5 : 0);
  line(ctx, 10, 100, 150, 100, r, { width: 1, alpha: 0.12, passes: 1 });
}

/** A small car, broadside, facing east. */
function drawCar(ctx: Ctx2D, r: () => number, color: string) {
  const body: [number, number][] = [[10, 82], [16, 60], [44, 56], [58, 34], [108, 34], [126, 56], [152, 62], [154, 82]];
  fillPoly(ctx, body, color, 0.42);
  poly(ctx, body, r, { width: 2.4, alpha: 0.88 });
  // the glass
  poly(ctx, [[62, 38], [104, 38], [116, 56], [50, 56]], r, { width: 1.6, alpha: 0.7 });
  line(ctx, 84, 38, 84, 56, r, { width: 1.4, alpha: 0.6, passes: 1 });
  hatch(ctx, 64, 40, 50, 14, -0.7, 5, r, { alpha: 0.1 });
  // a door line, a handle, the lamps
  line(ctx, 84, 56, 86, 80, r, { width: 1.2, alpha: 0.5, passes: 1 });
  line(ctx, 92, 66, 100, 66, r, { width: 1.6, alpha: 0.6, passes: 1 });
  scribbleCircle(ctx, 148, 66, 3.5, r, { width: 1.2, alpha: 0.7 });
  scribbleCircle(ctx, 16, 68, 3, r, { width: 1.2, alpha: 0.6 });
  wheel(ctx, r, 42, 84, 15, 0.3);
  wheel(ctx, r, 120, 84, 15, 1.1);
}

/** A sail on a hull, heeled to one tack. `left` heels the sail to
 *  the west. */
function drawSail(ctx: Ctx2D, r: () => number, left: boolean) {
  const s = left ? -1 : 1;
  const mx = 80 + s * 4;
  // the hull: a low crescent
  const hull: [number, number][] = [[34, 88], [126, 88], [116, 104], [44, 104]];
  fillPoly(ctx, hull, TIMBER, 0.3);
  poly(ctx, hull, r, { width: 2.4, alpha: 0.88 });
  // the mast, leaning with the tack
  line(ctx, mx, 88, mx + s * 10, 8, r, { width: 2.4, alpha: 0.9 });
  // the main, full
  const sail: [number, number][] = [[mx + s * 9, 12], [mx + s * 9 - s * 46, 40], [mx + s * 8 - s * 40, 82], [mx + s * 1, 84]];
  fillPoly(ctx, sail, WHITE_INK, 0.5);
  stroke(ctx, sail, r, { width: 2, alpha: 0.86, jitter: 1.2 });
  hatch(ctx, Math.min(sail[0][0], sail[1][0]), 14, 46, 68, s * 0.35, 9, r, { alpha: 0.08 });
  // the jib
  stroke(ctx, [[mx + s * 9, 16], [mx + s * 9 + s * 36, 76], [mx + s * 3, 84]], r, { width: 1.8, alpha: 0.8 });
  // the water it sits in
  line(ctx, 20, 106, 60, 105, r, { width: 1.4, alpha: 0.4, passes: 1 });
  line(ctx, 96, 106, 140, 107, r, { width: 1.4, alpha: 0.4, passes: 1 });
}

/** A sheep, drifting: two frames, head down and a step. */
function drawSheep(ctx: Ctx2D, r: () => number, step: boolean) {
  const pts: [number, number][] = [];
  for (let i = 0; i <= 28; i++) {
    const a = -2.5 + (i / 28) * 5.2;
    const rr = 32 * (0.86 + ((i % 3) * 0.09));
    pts.push([78 + Math.cos(a) * rr, 56 + Math.sin(a) * rr * 0.66]);
  }
  fillPoly(ctx, pts, CLOTH, 0.6);
  stroke(ctx, pts, r, { width: 2, alpha: 0.72, jitter: 2.6 });
  // the head, down in the grass
  poly(ctx, [[104, 66], [122, 74], [124, 88], [110, 88]], r, { width: 1.8, alpha: 0.82 });
  line(ctx, 106, 66, 100, 60, r, { width: 1.6, alpha: 0.7 });
  const f = step ? 5 : 0;
  line(ctx, 58, 78, 54 - f, 100, r, { width: 2, alpha: 0.82 });
  line(ctx, 68, 80, 70 + f, 100, r, { width: 2, alpha: 0.78 });
  line(ctx, 92, 80, 90 - f, 100, r, { width: 2, alpha: 0.82 });
  line(ctx, 100, 78, 104 + f, 100, r, { width: 2, alpha: 0.78 });
}

/** A dog at a trot, facing east. */
function drawDog(ctx: Ctx2D, r: () => number, step: boolean) {
  const bob = step ? 2 : 0;
  const body: [number, number][] = [[48, 66 + bob], [64, 56 + bob], [104, 54 + bob], [118, 60 + bob], [116, 76 + bob], [56, 78 + bob]];
  fillPoly(ctx, body, TIMBER, 0.3);
  poly(ctx, body, r, { width: 2, alpha: 0.86 });
  poly(ctx, [[116, 50 + bob], [136, 46 + bob], [140, 58 + bob], [124, 62 + bob]], r, { width: 1.8, alpha: 0.86 });
  line(ctx, 120, 48 + bob, 116, 38 + bob, r, { width: 1.6, alpha: 0.8 });
  stroke(ctx, [[48, 66 + bob], [36, 52 + bob], [30, 40 + bob]], r, { width: 1.8, alpha: 0.8 });
  const f = step ? 9 : -6;
  line(ctx, 60, 78 + bob, 52 - f, 100, r, { width: 1.8, alpha: 0.82 });
  line(ctx, 70, 78 + bob, 74 + f, 100, r, { width: 1.8, alpha: 0.78 });
  line(ctx, 100, 76 + bob, 96 + f, 100, r, { width: 1.8, alpha: 0.82 });
  line(ctx, 110, 76 + bob, 116 - f, 100, r, { width: 1.8, alpha: 0.78 });
}

/** A tumbleweed: one scribbled ball, two turns. */
function drawTumble(ctx: Ctx2D, r: () => number, turn: number) {
  for (let i = 0; i < 4; i++) {
    scribbleCircle(ctx, 80, 66, 30 - i * 4, r, { width: 1.4, alpha: 0.55, jitter: 3.5 }, 1.4 + turn * 0.3);
  }
  for (let i = 0; i < 9; i++) {
    const a = r() * Math.PI * 2 + turn;
    line(ctx, 80 + Math.cos(a) * 10, 66 + Math.sin(a) * 10, 80 + Math.cos(a) * 32, 66 + Math.sin(a) * 32, r, { width: 1.2, alpha: 0.5, passes: 1 });
  }
}

export function wheelsAtlas(): Atlas {
  return atlas(WHEEL_W, WHEEL_H, 13, 9200, (ctx, r, i) => {
    switch (i) {
      case WHEELS.cartA: drawCart(ctx, r, 0); break;
      case WHEELS.cartB: drawCart(ctx, r, 1); break;
      case WHEELS.carA: drawCar(ctx, r, CAR_COLORS[0]); break;
      case WHEELS.carB: drawCar(ctx, r, CAR_COLORS[1]); break;
      case WHEELS.carC: drawCar(ctx, r, CAR_COLORS[2]); break;
      case WHEELS.sailL: drawSail(ctx, r, true); break;
      case WHEELS.sailR: drawSail(ctx, r, false); break;
      case WHEELS.sheepA: drawSheep(ctx, r, false); break;
      case WHEELS.sheepB: drawSheep(ctx, r, true); break;
      case WHEELS.dogA: drawDog(ctx, r, false); break;
      case WHEELS.dogB: drawDog(ctx, r, true); break;
      case WHEELS.tumbleA: drawTumble(ctx, r, 0); break;
      case WHEELS.tumbleB: drawTumble(ctx, r, 1); break;
    }
  });
}

/* ---- BIRDS ----------------------------------------------------------- */

export const BIRD_W = 64;
export const BIRD_H = 48;
export const BIRDS = {
  gullUp: 0, gullDown: 1,
  smallUp: 2, smallDown: 3,
  kite: 4,
  bat: 5,
  pigeonUp: 6, pigeonDown: 7,
} as const;

function drawBird(ctx: Ctx2D, r: () => number, span: number, up: boolean, w: number, body = true) {
  const cy = 26;
  const lift = up ? -10 : 8;
  stroke(ctx, [[32 - span, cy + lift], [32 - span * 0.5, cy - 2], [32, cy + 2]], r, { width: w, alpha: 0.88, jitter: 1 });
  stroke(ctx, [[32, cy + 2], [32 + span * 0.5, cy - 2], [32 + span, cy + lift]], r, { width: w, alpha: 0.88, jitter: 1 });
  if (body) line(ctx, 29, cy + 2, 36, cy + 3, r, { width: w + 0.6, alpha: 0.8, passes: 1 });
}

export function birdsAtlas(): Atlas {
  return atlas(BIRD_W, BIRD_H, 8, 9300, (ctx, r, i) => {
    switch (i) {
      case BIRDS.gullUp: drawBird(ctx, r, 26, true, 2.2); break;
      case BIRDS.gullDown: drawBird(ctx, r, 26, false, 2.2); break;
      case BIRDS.smallUp: drawBird(ctx, r, 14, true, 1.8); break;
      case BIRDS.smallDown: drawBird(ctx, r, 14, false, 1.8); break;
      case BIRDS.kite: {
        // a kite soars: wings out flat, a forked tail
        stroke(ctx, [[4, 24], [18, 18], [32, 22], [46, 18], [60, 24]], r, { width: 2.4, alpha: 0.9, jitter: 0.8 });
        stroke(ctx, [[30, 22], [28, 34], [32, 30], [36, 34], [34, 22]], r, { width: 1.8, alpha: 0.8 });
        break;
      }
      case BIRDS.bat: {
        stroke(ctx, [[8, 20], [14, 28], [20, 22], [26, 28], [32, 24], [38, 28], [44, 22], [50, 28], [56, 20]], r, { width: 1.8, alpha: 0.9, jitter: 0.8 });
        line(ctx, 30, 22, 34, 30, r, { width: 2.4, alpha: 0.85, passes: 1 });
        break;
      }
      case BIRDS.pigeonUp: drawBird(ctx, r, 18, true, 2); break;
      case BIRDS.pigeonDown: drawBird(ctx, r, 18, false, 2); break;
    }
  });
}

/* ---- MARKS: soft things — smoke, a flag, a glint, a lamp, rain ------ */

export const MARK_W = 192;
export const MARK_H = 192;
export const MARKS = {
  smoke: 0,
  flagA: 1, flagB: 2,
  glint: 3,
  lamp: 4,
  rain: 5,
} as const;

export function marksAtlas(): Atlas {
  return atlas(MARK_W, MARK_H, 6, 9400, (ctx, r, i) => {
    switch (i) {
      case MARKS.smoke: {
        // a puff: three soft scribbled rounds, pencil grey
        for (const [x, y, rad] of [[96, 100, 44], [70, 116, 30], [126, 118, 34]] as [number, number, number][]) {
          for (let k = 0; k < 3; k++) {
            scribbleCircle(ctx, x, y, rad - k * 6, r, { width: 2.2, alpha: 0.16, jitter: 5, color: '#6b6e78' }, 1.6);
          }
        }
        break;
      }
      case MARKS.flagA:
      case MARKS.flagB: {
        const snap = i === MARKS.flagB;
        line(ctx, 16, 186, 18, 10, r, { width: 3.4, alpha: 0.9 });
        const fl: [number, number][] = snap
          ? [[18, 14], [80, 30], [150, 12], [176, 34], [160, 70], [96, 62], [18, 84]]
          : [[18, 14], [70, 20], [130, 44], [180, 40], [170, 76], [110, 74], [18, 84]];
        fillPoly(ctx, fl, '#a13d3a', 0.55);
        stroke(ctx, [...fl, fl[0]], r, { width: 2.4, alpha: 0.9, jitter: 1.4 });
        hatch(ctx, 24, 18, 150, 62, 0.15, 7, r, { alpha: 0.12, color: '#a13d3a' });
        break;
      }
      case MARKS.glint: {
        // a spark on water: a short white flare with two ticks
        line(ctx, 30, 96, 162, 96, r, { width: 5, alpha: 0.9, color: WHITE_INK, passes: 3 });
        line(ctx, 96, 70, 96, 122, r, { width: 3, alpha: 0.7, color: WHITE_INK, passes: 2 });
        line(ctx, 60, 80, 132, 112, r, { width: 2, alpha: 0.5, color: WHITE_INK, passes: 1 });
        break;
      }
      case MARKS.lamp: {
        // a warm point with a halo
        for (let k = 0; k < 4; k++) {
          scribbleCircle(ctx, 96, 96, 60 - k * 12, r, { width: 3, alpha: 0.08, jitter: 4, color: '#f2c27a' }, 1.6);
        }
        scribbleCircle(ctx, 96, 96, 10, r, { width: 4, alpha: 0.9, color: '#f2c27a' }, 1.6);
        scribbleCircle(ctx, 96, 96, 5, r, { width: 3, alpha: 0.9, color: WHITE_INK }, 1.4);
        break;
      }
      case MARKS.rain: {
        // a curtain of slanted grey hatch, soft at every edge
        const g = ctx.createRadialGradient(96, 100, 20, 96, 100, 100);
        g.addColorStop(0, 'rgba(120,124,134,0.55)');
        g.addColorStop(1, 'rgba(120,124,134,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, MARK_W, MARK_H);
        ctx.save();
        ctx.globalAlpha = 0.5;
        hatch(ctx, 24, 12, 144, 170, 1.32, 5, r, { alpha: 0.22, width: 1.2, color: '#5d616b', jitter: 2.6 });
        ctx.restore();
        break;
      }
    }
  });
}

