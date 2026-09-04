import * as THREE from 'three';
import {
  makeTexture, stroke, line, scribbleCircle, hatch, type Ctx2D,
} from '../engine/ink';
import { INK, PENCIL, WASH } from '../engine/palette';

/**
 * LIFE's prop box (Session 17, `THE-FUN-PASS` §9): the unnamed folk
 * and the animals — every drawing that is somewhere at a given hour in
 * a land that was a diorama until now.
 *
 * ── THE FOLK ARE POSTURE AND NOTHING ELSE ───────────────────────────
 *
 * No faces (the walker has two dots and nobody else has a face). An
 * unnamed inhabitant is a head, a coat, a dress or a pair of trousers,
 * and a POSTURE: standing, mid-stride, bent to work, sat down, or
 * carrying something. Three kinds of clothes and seven postures, and
 * every figure in every land is one of those twenty-one drawings —
 * cached here and shared, because sixty figures with a canvas each is
 * six megabytes of texture for people who are two units tall.
 *
 * The named cast (Nell, Marget, Brack, Joan, Holt, Amos, Val, June,
 * Dennis, the man at the junction) keep their own drawings in their
 * own prop boxes and are not touched. A name is three drawings; an
 * inhabitant is a posture.
 *
 * ── THE ANIMALS ARE THE CHEAPEST LIFE PER BYTE ──────────────────────
 *
 * A dog is a barrel on four sticks with its tail up; a cow is a
 * rectangle with a head at one end; a bat is a W. Each has the two or
 * three postures its behaviour needs and no more, and all of them are
 * line over a half-strength stain, the way the bull is, because a
 * black slab with legs read as a hole in the page.
 */

const CREAMY = '#e6ddc4';
const DUN = '#b9a888';
const DARK = '#3a3630';

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

function fillBlob(
  ctx: Ctx2D, cx: number, cy: number, rad: number, r: () => number,
  color: string, alpha: number, squash = 1
) {
  const pts: [number, number][] = [];
  const n = 14;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const rr = rad * (0.82 + r() * 0.36);
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * squash]);
  }
  fillPoly(ctx, pts, color, alpha);
}

function poly(
  ctx: Ctx2D, pts: [number, number][], r: () => number,
  o: Parameters<typeof stroke>[3] = {}
) {
  stroke(ctx, [...pts, pts[0]], r, o);
}

/* ================================================================== *
 * THE FOLK
 * ================================================================== */

/** 0 stand · 1 stride A · 2 bend · 3 sit · 4 carry · 5 stride B · 6 pole */
export type FolkPose = 0 | 1 | 2 | 3 | 4 | 5 | 6;
/** 0 a long coat · 1 a dress · 2 trousers and a jacket */
export type FolkKind = 0 | 1 | 2;

const FOLK_CACHE = new Map<string, THREE.CanvasTexture>();

/** The shared drawing for a kind and a posture. Made once. */
export function folkTexture(kind: FolkKind, pose: FolkPose): THREE.CanvasTexture {
  const key = `${kind}:${pose}`;
  const hit = FOLK_CACHE.get(key);
  if (hit) return hit;
  const tex = makeTexture(96, 160, 1700 + kind * 10 + pose, (ctx, r) => {
    const cx = 48;
    const hat = kind === 0 ? r() > 0.4 : r() > 0.75;
    const stride = pose === 1 || pose === 5;
    const bend = pose === 2;
    const sit = pose === 3;
    const carry = pose === 4;
    const pole = pose === 6;
    // where the head is: up, forward for a bend, low for a seat
    const hx = bend ? cx + 18 : stride ? cx + 3 : cx;
    const hy = bend ? 62 : sit ? 58 : 34;
    scribbleCircle(ctx, hx, hy, 14, r, { width: 2, alpha: 0.85 }, 1.1);
    if (hat) {
      line(ctx, hx - 20, hy - 10, hx + 20, hy - 12, r, { width: 1.8, alpha: 0.85 });
      poly(ctx, [[hx - 10, hy - 11], [hx - 8, hy - 24], [hx + 10, hy - 24], [hx + 12, hy - 11]], r,
        { width: 1.6, alpha: 0.8 });
    }
    // the body: the top of it is under the head, the bottom is at the
    // hips, and the hips are where the legs start
    const top = hy + 16;
    const hip = sit ? 108 : bend ? 112 : 104;
    const lean = bend ? 14 : stride ? 4 : 0;
    let body: [number, number][];
    if (kind === 0) {
      body = [[cx - 12 + lean, top], [cx - 16, hip + 16], [cx + 16, hip + 16], [cx + 12 + lean, top]];
    } else if (kind === 1) {
      body = [[cx - 9 + lean, top], [cx - 26, hip + 22], [cx + 26, hip + 22], [cx + 9 + lean, top]];
    } else {
      body = [[cx - 11 + lean, top], [cx - 13, hip], [cx + 13, hip], [cx + 11 + lean, top]];
    }
    if (bend) {
      // the spine curves: the whole drawing is the bend
      body = [[cx - 12, hip], [cx - 4, 84], [hx - 6, hy + 12], [hx + 8, hy + 16], [cx + 12, 90], [cx + 14, hip]];
    }
    fillPoly(ctx, body, kind === 1 ? CREAMY : DUN, 0.28);
    poly(ctx, body, r, { width: 2, alpha: 0.85 });
    if (kind === 2) {
      // a jacket has a hem and a line down the middle
      line(ctx, cx + lean * 0.5, top + 6, cx, hip - 4, r, { width: 1.2, alpha: 0.5, passes: 1 });
    }
    // the arms
    if (carry) {
      // a box held in front at the chest, both arms round it
      poly(ctx, [[cx - 18, top + 14], [cx - 18, top + 34], [cx + 18, top + 34], [cx + 18, top + 14]], r,
        { width: 1.8, alpha: 0.8 });
      hatch(ctx, cx - 17, top + 15, 34, 18, 0.2, 5, r, { alpha: 0.14 });
      stroke(ctx, [[cx - 12, top + 4], [cx - 22, top + 20], [cx - 16, top + 32]], r, { width: 1.8, alpha: 0.8 });
      stroke(ctx, [[cx + 12, top + 4], [cx + 22, top + 20], [cx + 16, top + 32]], r, { width: 1.8, alpha: 0.8 });
    } else if (pole) {
      // a long pole held up and forward: a lamplighter's, a shepherd's
      line(ctx, cx + 22, 150, cx + 30, 6, r, { width: 2.2, alpha: 0.86 });
      stroke(ctx, [[cx + 10, top + 4], [cx + 24, top + 10], [cx + 26, top + 2]], r, { width: 1.8, alpha: 0.8 });
      stroke(ctx, [[cx - 12, top + 4], [cx - 18, top + 30], [cx - 10, top + 44]], r, { width: 1.8, alpha: 0.8 });
    } else if (bend) {
      stroke(ctx, [[hx - 8, hy + 18], [hx - 4, hy + 46], [hx + 2, 126]], r, { width: 1.8, alpha: 0.8 });
      stroke(ctx, [[hx + 8, hy + 18], [hx + 14, hy + 44], [hx + 10, 124]], r, { width: 1.7, alpha: 0.76 });
    } else if (sit) {
      stroke(ctx, [[cx - 10, top + 4], [cx - 8, top + 30], [cx + 10, top + 34]], r, { width: 1.8, alpha: 0.8 });
      stroke(ctx, [[cx + 10, top + 4], [cx + 16, top + 28], [cx + 14, top + 36]], r, { width: 1.7, alpha: 0.76 });
    } else {
      const sw = stride ? (pose === 1 ? 10 : -10) : 0;
      stroke(ctx, [[cx - 12, top + 4], [cx - 22 + sw, top + 32], [cx - 20 + sw * 1.4, top + 48]], r, { width: 1.8, alpha: 0.8 });
      stroke(ctx, [[cx + 12, top + 4], [cx + 22 - sw, top + 32], [cx + 20 - sw * 1.4, top + 48]], r, { width: 1.8, alpha: 0.8 });
    }
    // the legs
    const w = kind === 2 ? 2.2 : 2;
    if (sit) {
      // sat on something: thighs forward, shins down
      const seat = hip + 14;
      stroke(ctx, [[cx - 8, seat], [cx + 14, seat + 2], [cx + 16, 148]], r, { width: w, alpha: 0.85 });
      stroke(ctx, [[cx + 6, seat], [cx + 24, seat + 4], [cx + 26, 148]], r, { width: w * 0.9, alpha: 0.75 });
    } else if (stride) {
      const s = pose === 1 ? 1 : -1;
      const foot = kind === 1 ? hip + 22 : hip + (kind === 0 ? 16 : 0);
      line(ctx, cx - 6, foot, cx - 6 - 16 * s, 148, r, { width: w, alpha: 0.85 });
      line(ctx, cx + 6, foot, cx + 6 + 14 * s, 148, r, { width: w, alpha: 0.85 });
    } else {
      const foot = kind === 1 ? hip + 22 : hip + (kind === 0 ? 16 : 0);
      line(ctx, cx - 9, foot, cx - 10, 148, r, { width: w, alpha: 0.85 });
      line(ctx, cx + 9, foot, cx + 10, 148, r, { width: w, alpha: 0.85 });
    }
    // and the feet, two short marks, so a figure stands on the page
    line(ctx, cx - 12, 148, cx - 2, 149, r, { width: 1.8, alpha: 0.8, passes: 1 }, 2);
    line(ctx, cx + 2, 149, cx + 14, 148, r, { width: 1.8, alpha: 0.8, passes: 1 }, 2);
  });
  FOLK_CACHE.set(key, tex);
  return tex;
}

/** A small child: two thirds the height, a bigger head, always running.
 *  One drawing per stride. */
export function childTexture(seed: number, pose: 0 | 1): THREE.CanvasTexture {
  return makeTexture(64, 96, seed, (ctx, r) => {
    const s = pose === 0 ? 1 : -1;
    scribbleCircle(ctx, 32, 22, 12, r, { width: 1.9, alpha: 0.85 }, 1.1);
    const body: [number, number][] = [[24, 36], [20, 66], [44, 66], [40, 36]];
    fillPoly(ctx, body, CREAMY, 0.3);
    poly(ctx, body, r, { width: 1.8, alpha: 0.85 });
    // arms out and back: a run
    stroke(ctx, [[24, 40], [10, 36 + 8 * s], [4, 46 + 4 * s]], r, { width: 1.6, alpha: 0.8 });
    stroke(ctx, [[40, 40], [54, 36 - 8 * s], [60, 46 - 4 * s]], r, { width: 1.6, alpha: 0.8 });
    line(ctx, 26, 66, 16 - 6 * s, 90, r, { width: 1.8, alpha: 0.85 });
    line(ctx, 38, 66, 48 + 6 * s, 90, r, { width: 1.8, alpha: 0.85 });
  });
}

/** A handcart with a load under a cloth, pushed: the delivery's. */
export function handcartTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(128, 96, seed, (ctx, r) => {
    const bed: [number, number][] = [[14, 46], [98, 44], [96, 70], [18, 72]];
    fillPoly(ctx, bed, DUN, 0.3);
    poly(ctx, bed, r, { width: 2.2, alpha: 0.86 });
    // the load under a cloth
    fillBlob(ctx, 56, 40, 30, r, CREAMY, 0.5, 0.5);
    stroke(ctx, [[20, 46], [34, 28], [60, 22], [84, 30], [96, 44]], r, { width: 2, alpha: 0.82 });
    hatch(ctx, 24, 26, 64, 20, 0.15, 6, r, { alpha: 0.12 });
    // one wheel, and the handles going up to nobody (the figure stands
    // behind it)
    scribbleCircle(ctx, 40, 78, 12, r, { width: 2.2, alpha: 0.86 }, 1.2);
    scribbleCircle(ctx, 40, 78, 3, r, { width: 1.2, alpha: 0.6 });
    line(ctx, 96, 46, 122, 30, r, { width: 2.2, alpha: 0.85 });
    line(ctx, 96, 60, 122, 44, r, { width: 2, alpha: 0.8 });
    line(ctx, 22, 70, 14, 86, r, { width: 2, alpha: 0.8 });
  });
}

/** A fishing rod, leaning out over water from a seated figure. */
export function rodTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(96, 96, seed, (ctx, r) => {
    stroke(ctx, [[10, 88], [40, 50], [86, 12]], r, { width: 2, alpha: 0.85 });
    line(ctx, 86, 12, 84, 70, r, { width: 0.9, alpha: 0.55, passes: 1 }, 3);
  });
}

/** A lantern on a hook: the lit thing a night watch carries. */
export function lanternGlowTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(64, 64, seed, (ctx) => {
    const g = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
    g.addColorStop(0, 'rgba(255,226,170,0.62)');
    g.addColorStop(0.4, 'rgba(255,214,150,0.24)');
    g.addColorStop(1, 'rgba(255,214,150,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
  });
}

/* ================================================================== *
 * THE ANIMALS
 * ================================================================== */

/** THE DOG — the Downs' co-walker. 0 stand · 1 walk · 2 trot · 3 sat,
 *  looking after you. A barrel on four sticks with the tail up; it is
 *  the tail that makes it a dog and not a sheep. */
export function dogTexture(seed: number, pose: 0 | 1 | 2 | 3): THREE.CanvasTexture {
  return makeTexture(128, 96, seed, (ctx, r) => {
    const sat = pose === 3;
    const trot = pose === 2;
    const body: [number, number][] = sat
      ? [[40, 54], [52, 42], [76, 40], [92, 46], [96, 60], [90, 72], [48, 74]]
      : [[30, 52], [40, 42], [66, 38], [88, 40], [98, 48], [96, 62], [70, 66], [40, 66]];
    fillPoly(ctx, body, DUN, 0.42);
    poly(ctx, body, r, { width: 2.2, alpha: 0.86, jitter: 1.6 });
    for (let i = 0; i < 10; i++) {
      const x = 44 + r() * 44;
      const y = 44 + r() * 18;
      line(ctx, x, y, x + (r() - 0.5) * 8, y + 4 + r() * 4, r, { width: 1, alpha: 0.18, passes: 1 }, 2);
    }
    // the head: forward at a trot, up when sat
    const hx = sat ? 96 : trot ? 112 : 108;
    const hy = sat ? 30 : trot ? 44 : 36;
    stroke(ctx, [[sat ? 88 : 92, sat ? 46 : 42], [hx - 4, hy + 6]], r, { width: 3.4, alpha: 0.82, passes: 1 });
    const head: [number, number][] = [[hx - 10, hy - 8], [hx + 12, hy - 4], [hx + 16, hy + 8], [hx - 8, hy + 10]];
    fillPoly(ctx, head, DUN, 0.5);
    poly(ctx, head, r, { width: 1.9, alpha: 0.86 });
    // one ear, up
    stroke(ctx, [[hx - 6, hy - 8], [hx - 12, hy - 20], [hx - 2, hy - 12]], r, { width: 1.6, alpha: 0.8, passes: 1 });
    // the legs
    const s = trot ? 12 : pose === 1 ? 7 : 0;
    if (sat) {
      line(ctx, 84, 70, 82, 90, r, { width: 2, alpha: 0.85 });
      line(ctx, 92, 70, 94, 90, r, { width: 2, alpha: 0.85 });
      stroke(ctx, [[50, 72], [42, 84], [58, 90]], r, { width: 2, alpha: 0.8 });
    } else {
      line(ctx, 44, 64, 38 - s, 90, r, { width: 2, alpha: 0.85 });
      line(ctx, 52, 66, 56 + s, 90, r, { width: 1.7, alpha: 0.72 });
      line(ctx, 84, 62, 80 + s, 90, r, { width: 2, alpha: 0.85 });
      line(ctx, 92, 60, 96 - s * 0.6, 90, r, { width: 1.7, alpha: 0.72 });
    }
    // and the tail, which on a dog is UP and going
    stroke(ctx, [[sat ? 42 : 32, sat ? 56 : 50], [sat ? 30 : 20, sat ? 46 : 32], [sat ? 24 : 24, sat ? 38 : 20]], r,
      { width: 2, alpha: 0.82, passes: 1 });
  });
}

/** A COW: 0 grazing · 1 head up, looking at you. The Downs' herd. */
export function cowTexture(seed: number, pose: 0 | 1): THREE.CanvasTexture {
  return makeTexture(160, 112, seed, (ctx, r) => {
    const up = pose === 1;
    const body: [number, number][] = [[26, 40], [40, 30], [96, 28], [124, 32], [130, 48], [126, 78], [96, 82], [42, 82], [28, 70]];
    fillPoly(ctx, body, CREAMY, 0.5);
    poly(ctx, body, r, { width: 2.4, alpha: 0.88, jitter: 1.8 });
    // the patches: two or three, half-strength stain the pen fills
    for (let i = 0; i < 3; i++) {
      fillBlob(ctx, 46 + r() * 70, 44 + r() * 26, 12 + r() * 8, r, DARK, 0.3, 0.7);
    }
    const hx = up ? 140 : 146;
    const hy = up ? 30 : 74;
    stroke(ctx, [[126, up ? 36 : 46], [hx - 6, hy - 2]], r, { width: 4, alpha: 0.8, passes: 1 });
    const head: [number, number][] = [[hx - 12, hy - 12], [hx + 10, hy - 10], [hx + 12, hy + 12], [hx - 10, hy + 14]];
    fillPoly(ctx, head, CREAMY, 0.5);
    poly(ctx, head, r, { width: 2, alpha: 0.86 });
    // ears out sideways, and two short horns
    line(ctx, hx - 12, hy - 8, hx - 22, hy - 4, r, { width: 1.6, alpha: 0.7, passes: 1 }, 2);
    line(ctx, hx + 10, hy - 8, hx + 20, hy - 4, r, { width: 1.6, alpha: 0.7, passes: 1 }, 2);
    stroke(ctx, [[hx - 8, hy - 12], [hx - 12, hy - 22]], r, { width: 1.8, alpha: 0.8, passes: 1 });
    stroke(ctx, [[hx + 6, hy - 12], [hx + 10, hy - 22]], r, { width: 1.8, alpha: 0.8, passes: 1 });
    // legs, thick, two of them together
    for (const [x, o] of [[44, 0], [56, 3], [104, 0], [118, -2]] as [number, number][]) {
      line(ctx, x, 80, x + o, 106, r, { width: 3, alpha: 0.82 }, 2);
    }
    // the tail, down
    stroke(ctx, [[28, 44], [20, 70], [24, 92]], r, { width: 1.8, alpha: 0.78, passes: 1 });
  });
}

/** A CAT ON A WALL: 0 curled asleep · 1 sat up, looking at you. */
export function catTexture(seed: number, pose: 0 | 1): THREE.CanvasTexture {
  return makeTexture(96, 64, seed, (ctx, r) => {
    if (pose === 0) {
      fillBlob(ctx, 48, 40, 26, r, DARK, 0.4, 0.62);
      stroke(ctx, [[22, 44], [26, 28], [46, 22], [70, 26], [78, 42], [60, 54], [30, 54], [22, 44]], r,
        { width: 2, alpha: 0.86, jitter: 1.4 });
      // the tail wrapped round, and one ear
      stroke(ctx, [[74, 44], [80, 54], [60, 58], [40, 56]], r, { width: 1.8, alpha: 0.8, passes: 1 });
      stroke(ctx, [[64, 26], [66, 16], [72, 26]], r, { width: 1.6, alpha: 0.8, passes: 1 });
    } else {
      const body: [number, number][] = [[36, 56], [40, 30], [56, 26], [62, 56]];
      fillPoly(ctx, body, DARK, 0.42);
      poly(ctx, body, r, { width: 2, alpha: 0.86 });
      scribbleCircle(ctx, 60, 18, 9, r, { width: 1.8, alpha: 0.86 }, 1.1);
      fillBlob(ctx, 60, 18, 8, r, DARK, 0.4);
      stroke(ctx, [[54, 12], [52, 2], [60, 10]], r, { width: 1.6, alpha: 0.8, passes: 1 });
      stroke(ctx, [[64, 10], [70, 2], [68, 12]], r, { width: 1.6, alpha: 0.8, passes: 1 });
      stroke(ctx, [[38, 50], [22, 54], [14, 40]], r, { width: 1.8, alpha: 0.8, passes: 1 });
    }
  });
}

/** A FOX, at night: 0 trotting · 1 stopped, head turned to you. */
export function foxTexture(seed: number, pose: 0 | 1): THREE.CanvasTexture {
  return makeTexture(128, 80, seed, (ctx, r) => {
    const stop = pose === 1;
    const body: [number, number][] = [[24, 40], [36, 30], [70, 26], [90, 30], [98, 42], [92, 54], [40, 56]];
    fillPoly(ctx, body, '#c47a3a', 0.34);
    poly(ctx, body, r, { width: 2, alpha: 0.86, jitter: 1.4 });
    const hx = stop ? 100 : 112;
    const hy = stop ? 24 : 34;
    stroke(ctx, [[92, 34], [hx - 4, hy + 4]], r, { width: 3, alpha: 0.8, passes: 1 });
    poly(ctx, [[hx - 8, hy - 6], [hx + 10, hy - 2], [hx + 12, hy + 6], [hx - 6, hy + 8]], r, { width: 1.8, alpha: 0.86 });
    // two big ears
    stroke(ctx, [[hx - 6, hy - 6], [hx - 10, hy - 18], [hx, hy - 8]], r, { width: 1.6, alpha: 0.8, passes: 1 });
    stroke(ctx, [[hx + 2, hy - 6], [hx + 4, hy - 18], [hx + 10, hy - 4]], r, { width: 1.6, alpha: 0.8, passes: 1 });
    const s = stop ? 0 : 9;
    line(ctx, 42, 54, 36 - s, 76, r, { width: 1.7, alpha: 0.84 });
    line(ctx, 50, 56, 54 + s, 76, r, { width: 1.5, alpha: 0.7 });
    line(ctx, 82, 52, 78 + s, 76, r, { width: 1.7, alpha: 0.84 });
    line(ctx, 90, 50, 94 - s * 0.5, 76, r, { width: 1.5, alpha: 0.7 });
    // the brush: the whole silhouette
    fillPoly(ctx, [[26, 40], [8, 44], [4, 58], [16, 62], [30, 54]], '#c47a3a', 0.3);
    poly(ctx, [[26, 40], [8, 44], [4, 58], [16, 62], [30, 54]], r, { width: 1.8, alpha: 0.82 });
  });
}

/** A BAT: a W, and it is the same W every frame. */
export function batTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(64, 40, seed, (ctx, r) => {
    fillPoly(ctx, [[4, 20], [16, 8], [26, 16], [32, 12], [38, 16], [48, 8], [60, 20], [46, 22], [36, 30], [32, 26], [28, 30], [18, 22]], INK, 0.55);
    stroke(ctx, [[4, 20], [16, 8], [26, 16], [32, 12], [38, 16], [48, 8], [60, 20]], r, { width: 1.6, alpha: 0.86, passes: 1 });
  });
}

/** THE HERON at the tarn: 0 standing in the shallows · 1 gone up. */
export function heronTexture(seed: number, pose: 0 | 1): THREE.CanvasTexture {
  return makeTexture(128, 128, seed, (ctx, r) => {
    if (pose === 0) {
      // one leg, a long neck, and the whole bird is a vertical
      fillBlob(ctx, 60, 70, 18, r, PENCIL, 0.3, 0.7);
      stroke(ctx, [[40, 74], [50, 58], [72, 56], [84, 70], [70, 84], [48, 82], [40, 74]], r, { width: 1.9, alpha: 0.84 });
      stroke(ctx, [[70, 58], [74, 40], [66, 26], [70, 14]], r, { width: 2.2, alpha: 0.86 });
      scribbleCircle(ctx, 72, 12, 5, r, { width: 1.5, alpha: 0.8 });
      line(ctx, 76, 12, 96, 16, r, { width: 1.8, alpha: 0.86, passes: 1 }, 2);
      line(ctx, 58, 84, 58, 124, r, { width: 1.8, alpha: 0.85 });
      line(ctx, 52, 124, 66, 125, r, { width: 1.4, alpha: 0.7, passes: 1 }, 2);
    } else {
      // wings out, legs trailing, neck folded
      fillPoly(ctx, [[8, 56], [40, 40], [64, 48], [88, 40], [120, 56], [90, 62], [64, 70], [38, 62]], PENCIL, 0.3);
      stroke(ctx, [[8, 56], [40, 40], [64, 48], [88, 40], [120, 56]], r, { width: 2.2, alpha: 0.86, passes: 1 });
      stroke(ctx, [[64, 48], [70, 40], [78, 44]], r, { width: 1.8, alpha: 0.8, passes: 1 });
      line(ctx, 78, 44, 92, 46, r, { width: 1.6, alpha: 0.8, passes: 1 }, 2);
      line(ctx, 58, 68, 34, 84, r, { width: 1.4, alpha: 0.7, passes: 1 }, 2);
    }
  });
}

/** A SEAL on the bar: 0 hauled out, flat · 1 head up. */
export function sealTexture(seed: number, pose: 0 | 1): THREE.CanvasTexture {
  return makeTexture(128, 64, seed, (ctx, r) => {
    const up = pose === 1;
    const body: [number, number][] = [[10, 50], [26, 34], [60, 26], [92, 28], [110, up ? 20 : 34], [118, up ? 12 : 44], [112, 50], [60, 54], [20, 56]];
    fillPoly(ctx, body, PENCIL, 0.4);
    poly(ctx, body, r, { width: 2.2, alpha: 0.86, jitter: 1.6 });
    for (let i = 0; i < 6; i++) {
      scribbleCircle(ctx, 30 + r() * 70, 36 + r() * 12, 2 + r() * 2, r, { width: 1, alpha: 0.3, passes: 1 });
    }
    // the tail flipper, and one flipper
    stroke(ctx, [[10, 50], [2, 42], [6, 58]], r, { width: 1.8, alpha: 0.8, passes: 1 });
    stroke(ctx, [[60, 50], [66, 60], [80, 58]], r, { width: 1.6, alpha: 0.7, passes: 1 });
  });
}

/** A CRAB on the wrack, and it goes sideways. */
export function crabTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(64, 48, seed, (ctx, r) => {
    fillBlob(ctx, 32, 28, 12, r, '#b3563a', 0.36, 0.7);
    scribbleCircle(ctx, 32, 28, 12, r, { width: 1.7, alpha: 0.84 }, 1.15);
    for (let i = 0; i < 4; i++) {
      const y = 22 + i * 4;
      stroke(ctx, [[22, y], [10, y + 6], [6, y + 14]], r, { width: 1.3, alpha: 0.78, passes: 1 });
      stroke(ctx, [[42, y], [54, y + 6], [58, y + 14]], r, { width: 1.3, alpha: 0.78, passes: 1 });
    }
    stroke(ctx, [[24, 18], [16, 8], [22, 4]], r, { width: 1.6, alpha: 0.8, passes: 1 });
    stroke(ctx, [[40, 18], [48, 8], [42, 4]], r, { width: 1.6, alpha: 0.8, passes: 1 });
  });
}

/** A RAT in the hollow. Low, long, and a tail twice its length. */
export function ratTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(64, 32, seed, (ctx, r) => {
    fillBlob(ctx, 30, 20, 12, r, PENCIL, 0.4, 0.55);
    stroke(ctx, [[14, 24], [20, 12], [40, 10], [48, 18], [40, 28], [18, 28]], r, { width: 1.6, alpha: 0.84 });
    line(ctx, 48, 16, 58, 18, r, { width: 1.4, alpha: 0.8, passes: 1 }, 2);
    stroke(ctx, [[14, 24], [4, 26], [2, 14]], r, { width: 1.1, alpha: 0.7, passes: 1 });
  });
}

/** A MAGPIE: 0 perched · 1 in the air. Half white, and it is the white
 *  half that reads. */
export function magpieTexture(seed: number, pose: 0 | 1): THREE.CanvasTexture {
  return makeTexture(64, 48, seed, (ctx, r) => {
    if (pose === 0) {
      fillBlob(ctx, 30, 26, 10, r, INK, 0.55, 0.8);
      fillPoly(ctx, [[24, 26], [36, 22], [36, 32], [26, 34]], '#f5f2ea', 0.8);
      stroke(ctx, [[14, 30], [18, 18], [32, 14], [44, 16], [42, 28], [32, 34], [18, 34]], r, { width: 1.6, alpha: 0.86 });
      line(ctx, 44, 16, 52, 18, r, { width: 1.2, alpha: 0.8, passes: 1 }, 2);
      stroke(ctx, [[14, 30], [2, 40]], r, { width: 1.8, alpha: 0.82, passes: 1 });
      line(ctx, 26, 34, 24, 44, r, { width: 1.1, alpha: 0.7, passes: 1 }, 2);
    } else {
      fillPoly(ctx, [[4, 26], [22, 12], [32, 20], [42, 12], [60, 26], [42, 28], [32, 34], [22, 28]], INK, 0.5);
      fillPoly(ctx, [[14, 22], [24, 18], [26, 24], [16, 26]], '#f5f2ea', 0.8);
      fillPoly(ctx, [[40, 18], [50, 22], [48, 26], [38, 24]], '#f5f2ea', 0.8);
      stroke(ctx, [[4, 26], [22, 12], [32, 20], [42, 12], [60, 26]], r, { width: 1.6, alpha: 0.86, passes: 1 });
    }
  });
}

/** A LIZARD on a warm stone, and it is gone before you are sure. */
export function lizardTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(64, 32, seed, (ctx, r) => {
    stroke(ctx, [[4, 20], [14, 14], [30, 12], [44, 14], [52, 12], [60, 14]], r, { width: 2.2, alpha: 0.8, passes: 1 });
    stroke(ctx, [[30, 12], [44, 14], [48, 18], [36, 20], [26, 18]], r, { width: 1.4, alpha: 0.7, passes: 1 });
    for (const x of [26, 44]) {
      stroke(ctx, [[x, 14], [x - 6, 24], [x - 10, 26]], r, { width: 1.1, alpha: 0.7, passes: 1 });
      stroke(ctx, [[x, 14], [x + 4, 6], [x + 8, 4]], r, { width: 1.1, alpha: 0.7, passes: 1 });
    }
  });
}

/** A KITE, soaring: wings out, forked tail, and it never once flaps. */
export function kiteTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(96, 48, seed, (ctx, r) => {
    fillPoly(ctx, [[4, 26], [30, 14], [48, 18], [66, 14], [92, 26], [66, 24], [48, 28], [30, 24]], '#7a5a3a', 0.4);
    stroke(ctx, [[4, 26], [30, 14], [48, 18], [66, 14], [92, 26]], r, { width: 1.8, alpha: 0.84, passes: 1 });
    stroke(ctx, [[42, 28], [46, 44], [50, 44], [54, 28]], r, { width: 1.4, alpha: 0.76, passes: 1 });
  });
}

/** A PIGEON IN THE AIR: Brim's contented line, with the wings up. */
export function pigeonFlyTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(64, 48, seed, (ctx, r) => {
    fillBlob(ctx, 32, 30, 9, r, PENCIL, 0.35, 0.7);
    stroke(ctx, [[8, 20], [22, 8], [32, 26], [42, 8], [56, 20]], r, { width: 1.6, alpha: 0.85, passes: 1 });
    stroke(ctx, [[22, 30], [32, 24], [44, 28], [46, 36], [30, 40]], r, { width: 1.3, alpha: 0.7, passes: 1 });
    line(ctx, 46, 30, 52, 32, r, { width: 1.1, alpha: 0.7, passes: 1 }, 2);
  });
}

/** A SNAKE crossing the track at dusk: one line that will not lie still. */
export function snakeTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(96, 32, seed, (ctx, r) => {
    const pts: [number, number][] = [];
    for (let i = 0; i <= 12; i++) pts.push([4 + i * 7.5, 16 + Math.sin(i * 1.3) * 7]);
    stroke(ctx, pts, r, { width: 2.6, alpha: 0.82, jitter: 0.8 });
    stroke(ctx, pts.slice(0, 6), r, { width: 1.2, alpha: 0.4, passes: 1, color: '#c9a86a' });
    line(ctx, 92, 14, 96, 12, r, { width: 1, alpha: 0.6, passes: 1 }, 2);
  });
}

/** SOMETHING UNDER THE WIDE BLUE, surfacing once at dusk: a long dark
 *  back breaking the water and the water going white off it. Never
 *  seen whole, because there is no whole to see. */
export function deepBackTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(256, 96, seed, (ctx, r) => {
    const back: [number, number][] = [];
    for (let i = 0; i <= 20; i++) {
      const u = i / 20;
      back.push([12 + u * 232, 78 - Math.sin(u * Math.PI) * 48 * (0.8 + 0.2 * Math.sin(u * 9))]);
    }
    fillPoly(ctx, [...back, [244, 90], [12, 90]], DARK, 0.62);
    stroke(ctx, back, r, { width: 2.8, alpha: 0.9, jitter: 1.2 });
    // one fin, off centre, and the spray
    fillPoly(ctx, [[150, 40], [166, 8], [178, 42]], DARK, 0.6);
    stroke(ctx, [[150, 40], [166, 8], [178, 42]], r, { width: 2, alpha: 0.86, passes: 1 });
    for (let i = 0; i < 18; i++) {
      const x = 8 + r() * 240;
      line(ctx, x, 82 + r() * 6, x + (r() - 0.5) * 10, 70 - r() * 12, r,
        { width: 1.2, alpha: 0.3 + r() * 0.3, passes: 1, color: '#f5f2ea' }, 2);
    }
    hatch(ctx, 14, 70, 228, 20, 0.05, 5, r, { alpha: 0.12, color: WASH.seaShallow });
  });
}

/** A ROW OF SHUT SHUTTERS is the town's evening face; this is the
 *  drawing of one pair, hung over a casement. */
export function shutterPairTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(64, 64, seed, (ctx, r) => {
    for (const x of [2, 33]) {
      fillPoly(ctx, [[x, 4], [x + 28, 4], [x + 28, 60], [x, 60]], '#6b5b48', 0.5);
      poly(ctx, [[x, 4], [x + 28, 4], [x + 28, 60], [x, 60]], r, { width: 1.8, alpha: 0.86 });
      hatch(ctx, x + 3, 8, 22, 48, 0, 7, r, { alpha: 0.28, width: 1.2 });
    }
  });
}

/* ================================================================== *
 * THE ENCOUNTERS' PROPS (Session 18, `THE-STRANGERS` Part Three).
 * What an encounter needs that a figure does not carry: a ladder for
 * two, a hat with nobody under it, a fire with nobody at it, a saw
 * left in a pine, and the ring something makes in the water.
 * ================================================================== */

/** A long ladder, carried level between two people: two rails, nine
 *  rungs, seen from the side. Drawn wide and low; the figures stand
 *  at either end of it. */
export function ladderTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(256, 48, seed, (ctx, r) => {
    stroke(ctx, [[6, 14], [250, 12]], r, { width: 2.2, alpha: 0.86 });
    stroke(ctx, [[6, 34], [250, 32]], r, { width: 2.2, alpha: 0.86 });
    for (let i = 0; i < 9; i++) {
      const x = 20 + i * 27;
      line(ctx, x, 13, x + 1, 33, r, { width: 1.8, alpha: 0.8 });
    }
  });
}

/** A hat, on its own, on the road, going the other way: a brim and a
 *  crown, and a little air under the brim. */
export function hatTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(64, 48, seed, (ctx, r) => {
    const crown: [number, number][] = [[20, 30], [22, 10], [44, 9], [46, 30]];
    fillPoly(ctx, crown, DUN, 0.34);
    poly(ctx, crown, r, { width: 1.9, alpha: 0.86 });
    stroke(ctx, [[6, 33], [30, 36], [58, 31]], r, { width: 2.2, alpha: 0.86 });
    line(ctx, 22, 24, 44, 23, r, { width: 1.1, alpha: 0.5, passes: 1 });
  });
}

/** A fire on the sand at dusk: three sticks leant together, the flame
 *  in a warm wash with two licks of pen, and the glow the sand takes
 *  from it. Nobody at it yet. */
export function fireTexture(seed: number, lit: boolean): THREE.CanvasTexture {
  return makeTexture(96, 96, seed, (ctx, r) => {
    if (lit) {
      const g = ctx.createRadialGradient(48, 60, 2, 48, 60, 44);
      g.addColorStop(0, 'rgba(255,240,210,0.9)');
      g.addColorStop(0.35, 'rgba(255,200,120,0.45)');
      g.addColorStop(1, 'rgba(255,200,120,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 8, 96, 88);
    }
    // the sticks
    line(ctx, 22, 84, 52, 56, r, { width: 2.2, alpha: 0.85 });
    line(ctx, 74, 84, 44, 56, r, { width: 2.2, alpha: 0.85 });
    line(ctx, 30, 88, 66, 86, r, { width: 2, alpha: 0.8 });
    line(ctx, 60, 90, 28, 70, r, { width: 1.8, alpha: 0.7 });
    if (lit) {
      for (let i = 0; i < 3; i++) {
        stroke(ctx, [[40 + i * 6, 70], [36 + i * 8 + r() * 6, 50], [46 + i * 4, 30 - r() * 10]], r,
          { width: 1.4, alpha: 0.42, color: '#ffd79a' });
      }
    } else {
      // the ash, cold
      hatch(ctx, 34, 76, 30, 10, 0.2, 4, r, { alpha: 0.18 });
    }
  });
}

/** A saw, left in the cut: the blade stuck in the log and the handle
 *  up in the air. Drawn on its own so the log can be the log. */
export function sawTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(64, 96, seed, (ctx, r) => {
    const blade: [number, number][] = [[22, 88], [30, 30], [40, 30], [36, 88]];
    fillPoly(ctx, blade, CREAMY, 0.5);
    poly(ctx, blade, r, { width: 1.8, alpha: 0.86 });
    for (let i = 0; i < 7; i++) line(ctx, 23 + i * 0.9, 84 - i * 7, 20 + i * 0.9, 80 - i * 7, r, { width: 1, alpha: 0.5, passes: 1 });
    // the handle: a D, open
    stroke(ctx, [[30, 30], [24, 14], [36, 6], [48, 12], [44, 30]], r, { width: 2.2, alpha: 0.86 });
    line(ctx, 30, 22, 42, 20, r, { width: 1.6, alpha: 0.7 });
  });
}

/** The ring something makes in the water and you do not see what:
 *  two circles, the outer thinner, on a transparent ground. Scaled up
 *  and faded by the land over a couple of seconds. */
export function rippleDecal(seed: number): THREE.CanvasTexture {
  return makeTexture(128, 128, seed, (ctx, r) => {
    // pale, not ink: the tarn is the darkest water in the game at the
    // hour the rings are on, and a dark ring on dark water is no ring
    scribbleCircle(ctx, 64, 64, 50, r, { width: 1.8, alpha: 0.55, color: '#efe9d8' }, 1.2);
    scribbleCircle(ctx, 64, 64, 32, r, { width: 2.2, alpha: 0.7, color: '#efe9d8' }, 1.1);
    scribbleCircle(ctx, 64, 64, 14, r, { width: 1.4, alpha: 0.45, color: '#efe9d8' }, 1.0);
  });
}

/** The mended cart's wheel, off, leaning against nothing: a ring with
 *  spokes, drawn flat on the road beside the cart. */
export function wheelTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(64, 64, seed, (ctx, r) => {
    scribbleCircle(ctx, 32, 32, 26, r, { width: 2.2, alpha: 0.86 }, 1.15);
    scribbleCircle(ctx, 32, 32, 5, r, { width: 1.4, alpha: 0.7 });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI;
      line(ctx, 32 + Math.cos(a) * 5, 32 + Math.sin(a) * 5, 32 + Math.cos(a) * 25, 32 + Math.sin(a) * 25, r, { width: 1.3, alpha: 0.6, passes: 1 });
      line(ctx, 32 - Math.cos(a) * 5, 32 - Math.sin(a) * 5, 32 - Math.cos(a) * 25, 32 - Math.sin(a) * 25, r, { width: 1.3, alpha: 0.6, passes: 1 });
    }
  });
}
