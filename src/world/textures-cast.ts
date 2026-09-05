import * as THREE from 'three';
import {
  makeTexture, stroke, line, scribbleCircle, hatch, lettering, letteringFit, legibleCaps,
  type Ctx2D,
} from '../engine/ink';
import { INK, PENCIL, BLOT } from '../engine/palette';

/**
 * THE NEW CAST, EAST AND SOUTH — the prop box (Session 20, `THE-FUN-PASS`
 * §10): the aliens in the Pale, the barista at the junction, the design
 * studio in the atrium, the office chair, the bin and the ball.
 *
 * ── AND FOUR DRAWINGS ARE THE OWNER'S ────────────────────────────────
 *
 * On 2026-09-05 the owner handed the project four sketches from their
 * own notebook — a dachshund in a neckerchief, six square sheep in a
 * watercolour field, a one-eyed thing shaped like a pine tree with a
 * grin and two boots, and a spotted dog sitting in a bow tie beside a
 * paw print — and asked for them to be in the game. They are drawn here
 * AS DRAWN: the same lines, the same proportions, the same joke in each
 * (the sheep are square; the dog is mostly length; the thing is
 * delighted). Where the sketch has an eye, the drawing has an eye. That
 * is the owner's pen and not this file's decision, and it is recorded
 * in `SESSIONS.md` against the law that only the walker has a face.
 *
 *   THE LOW DOG        the dachshund → MAPLE COURT's green, with a ball
 *   THE SQUARE FLOCK   the sheep → THE CUBICLE MILE's overflow, one to a bay
 *   THE VISITORS       the one-eyed thing → THE ALIENS in the Pale
 *   THE BARISTA'S DOG  the bow-tie dog → GREYLINE's junction, and the paw
 *                      print is what it leaves on the pavement
 */

const CREAMY = '#e6ddc4';
const DUN = '#b9a888';
const DARK = '#3a3630';
const WOOL = '#ece8dc';
const CANVAS = '#ddd3bb';
const STEEL = '#a8adb0';
const BIN = '#5f6d5c';
const STICKY = ['#efe08a', '#f2b8c6', '#b9d6ee', '#cfe6b0'];

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

/** A shaded patch the way the owner shades: a dense diagonal scribble
 *  inside a shape, over a dark stain, so it reads as pen going back and
 *  forth rather than as a flat fill. */
function shaded(ctx: Ctx2D, pts: [number, number][], r: () => number, alpha = 0.72) {
  fillPoly(ctx, pts, DARK, alpha * 0.75);
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
  ctx.clip();
  let minX = 1e9, minY = 1e9, maxX = -1e9, maxY = -1e9;
  for (const [x, y] of pts) { minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y); }
  hatch(ctx, minX, minY, maxX - minX, maxY - minY, 0.9, 3.2, r, { width: 1.3, alpha: 0.5, passes: 1 });
  ctx.restore();
  poly(ctx, pts, r, { width: 1.8, alpha: 0.86, jitter: 1.2 });
}

/* ================================================================== *
 * THE OWNER'S ANIMALS
 * ================================================================== */

/**
 * THE LOW DOG — the owner's dachshund. Two long lines for a body, a
 * wedge of a head with a black nose and one eye, a dark leaf of an ear,
 * a dark neckerchief with two tails, four short legs with black feet,
 * and a tail that is a tall pointed flag at the back.
 *   0 stand · 1 walk · 2 trot · 3 sat, looking after you
 */
export function dachshundTexture(seed: number, pose: 0 | 1 | 2 | 3): THREE.CanvasTexture {
  return makeTexture(192, 96, seed, (ctx, r) => {
    const sat = pose === 3;
    const trot = pose === 2;
    const o = { width: 2.2, alpha: 0.9, jitter: 1.1 };
    // the body: the owner drew it as two lines, and so does this
    const backA: [number, number] = sat ? [54, 56] : [46, 40];
    const backB: [number, number] = [126, 36];
    const bellyA: [number, number] = sat ? [62, 74] : [50, 62];
    const bellyB: [number, number] = [120, 58];
    fillPoly(ctx, [backA, backB, [150, 46], bellyB, bellyA], CREAMY, 0.22);
    stroke(ctx, [backA, [86, 39], backB], r, o);
    stroke(ctx, [bellyA, [86, 61], bellyB], r, o);
    // the rear: a short vertical closing the back end
    stroke(ctx, [backA, [sat ? 48 : 42, sat ? 66 : 52], bellyA], r, { width: 2, alpha: 0.85, jitter: 1 });
    // the tail: a tall pointed flag, up
    const tx = sat ? 56 : 46;
    const ty = sat ? 56 : 40;
    stroke(ctx, [[tx, ty], [tx - 6, 24], [tx - 2, 8], [tx + 4, 20], [tx + 6, ty - 2]], r, { width: 2, alpha: 0.88, jitter: 1 });
    // the neckerchief: a dark shaded band with two tails
    shaded(ctx, [[122, 32], [138, 30], [156, 48], [150, 60], [140, 62], [124, 50]], r, 0.78);
    stroke(ctx, [[150, 58], [158, 66], [162, 60]], r, { width: 2, alpha: 0.8, passes: 1 });
    stroke(ctx, [[146, 60], [154, 70]], r, { width: 1.8, alpha: 0.7, passes: 1 });
    // the head: a wedge to a black nose
    const hx = trot ? 4 : 0;
    stroke(ctx, [[134, 28 + hx], [156, 22 + hx], [182, 38 + hx]], r, o);
    stroke(ctx, [[182, 38 + hx], [168, 48 + hx], [148, 50 + hx]], r, { width: 2, alpha: 0.86, jitter: 1 });
    fillBlob(ctx, 182, 40 + hx, 4, r, BLOT, 0.9);
    fillBlob(ctx, 160, 34 + hx, 2.4, r, BLOT, 0.85);   // the one eye, as drawn
    // the ear: a dark leaf hanging from the top of the head
    shaded(ctx, [[134, 24 + hx], [144, 22 + hx], [150, 44 + hx], [146, 64 + hx], [136, 60 + hx], [130, 40 + hx]], r, 0.7);
    // the legs: short, with black feet, and a stride when it walks
    const s = trot ? 9 : pose === 1 ? 5 : 0;
    const foot = (x: number, y: number, dir: number) => {
      fillPoly(ctx, [[x - 4, y - 3], [x + 5 * dir, y - 2], [x + 7 * dir, y + 3], [x - 4, y + 3]], BLOT, 0.88);
    };
    if (sat) {
      // hind legs folded, front legs straight
      stroke(ctx, [[62, 72], [56, 80], [66, 84]], r, { width: 2, alpha: 0.84 });
      foot(64, 84, -1);
      line(ctx, 112, 58, 110, 84, r, { width: 2, alpha: 0.86 });
      line(ctx, 122, 58, 122, 84, r, { width: 1.8, alpha: 0.76 });
      foot(110, 85, 1);
      foot(122, 85, 1);
    } else {
      line(ctx, 54, 62, 46 - s, 84, r, { width: 2, alpha: 0.86 });
      line(ctx, 64, 62, 66 + s, 84, r, { width: 1.8, alpha: 0.76 });
      line(ctx, 112, 58, 108 + s, 84, r, { width: 2, alpha: 0.86 });
      line(ctx, 124, 56, 128 - s, 84, r, { width: 1.8, alpha: 0.76 });
      foot(46 - s, 85, -1);
      foot(66 + s, 85, 1);
      foot(108 + s, 85, 1);
      foot(128 - s, 85, 1);
    }
  });
}

/**
 * THE BARISTA'S DOG — the owner's spotted dog in a bow tie. Sat, it is a
 * tall wedge with two straight front legs, a haunch, a tail curling out
 * on the ground, ears that flop either side of the head, a dark patch
 * over one eye and a bow tie at the throat. Walking, the same dog on
 * four legs.
 *   0 sat, still · 1 stride A · 2 stride B
 */
export function bowtieDogTexture(seed: number, pose: 0 | 1 | 2): THREE.CanvasTexture {
  return makeTexture(128, 128, seed, (ctx, r) => {
    const o = { width: 2.1, alpha: 0.9, jitter: 1.1 };
    const spot = (x: number, y: number, rad: number) => {
      fillBlob(ctx, x, y, rad, r, DARK, 0.7, 0.85);
    };
    if (pose === 0) {
      // the body: a wedge from the neck to the ground, and the haunch
      const body: [number, number][] = [[62, 56], [72, 60], [86, 118], [46, 118], [38, 92]];
      fillPoly(ctx, body, CREAMY, 0.2);
      stroke(ctx, [[62, 56], [50, 74], [38, 92], [44, 118]], r, o);
      stroke(ctx, [[72, 60], [80, 84], [86, 118]], r, o);
      line(ctx, 44, 118, 86, 118, r, { width: 1.8, alpha: 0.8, passes: 1 }, 3);
      spot(60, 78, 8);
      spot(70, 100, 7);
      spot(48, 108, 6);
      // the front legs, straight down, and the feet
      line(ctx, 70, 82, 68, 122, r, { width: 2.2, alpha: 0.88 });
      line(ctx, 80, 84, 80, 122, r, { width: 2, alpha: 0.8 });
      fillPoly(ctx, [[62, 120], [74, 120], [74, 125], [62, 125]], BLOT, 0.85);
      fillPoly(ctx, [[76, 120], [88, 120], [88, 125], [76, 125]], BLOT, 0.85);
      // the tail, curling out along the ground and up
      stroke(ctx, [[42, 110], [24, 118], [10, 110], [8, 92], [14, 84]], r, { width: 2, alpha: 0.86, jitter: 1 });
      spot(16, 100, 4);
      // the bow tie
      fillPoly(ctx, [[52, 52], [66, 58], [52, 64]], DARK, 0.85);
      fillPoly(ctx, [[80, 52], [66, 58], [80, 64]], DARK, 0.85);
      poly(ctx, [[52, 52], [66, 58], [52, 64]], r, { width: 1.5, alpha: 0.8, passes: 1 });
      poly(ctx, [[80, 52], [66, 58], [80, 64]], r, { width: 1.5, alpha: 0.8, passes: 1 });
      // the head: an oval, and the ears flopping either side
      fillBlob(ctx, 68, 34, 13, r, CREAMY, 0.3, 1.15);
      scribbleCircle(ctx, 68, 34, 12, r, { width: 2, alpha: 0.88 }, 1.1);
      stroke(ctx, [[58, 24], [46, 26], [42, 36], [50, 40], [58, 34]], r, { width: 1.9, alpha: 0.86, jitter: 1 });
      stroke(ctx, [[78, 24], [92, 24], [96, 32], [88, 36], [80, 32]], r, { width: 1.9, alpha: 0.86, jitter: 1 });
      shaded(ctx, [[58, 28], [68, 26], [70, 38], [60, 40]], r, 0.62);   // the patch over one eye
      fillBlob(ctx, 76, 34, 2, r, BLOT, 0.85);                           // the eye, as drawn
      stroke(ctx, [[64, 44], [70, 47], [76, 44]], r, { width: 1.3, alpha: 0.7, passes: 1 });
    } else {
      const s = pose === 1 ? 8 : -8;
      const body: [number, number][] = [[30, 62], [40, 52], [70, 48], [92, 50], [100, 58], [96, 72], [70, 76], [40, 76]];
      fillPoly(ctx, body, CREAMY, 0.2);
      poly(ctx, body, r, o);
      spot(54, 60, 7);
      spot(80, 64, 6);
      // the head, forward, with the flopping ears and the patch
      stroke(ctx, [[94, 52], [104, 42]], r, { width: 3, alpha: 0.8, passes: 1 });
      fillBlob(ctx, 108, 36, 10, r, CREAMY, 0.3, 1.1);
      scribbleCircle(ctx, 108, 36, 9.5, r, { width: 1.9, alpha: 0.86 }, 1.1);
      stroke(ctx, [[100, 28], [92, 30], [90, 40], [98, 40]], r, { width: 1.7, alpha: 0.84, jitter: 1 });
      shaded(ctx, [[100, 30], [108, 28], [110, 38], [102, 40]], r, 0.6);
      fillBlob(ctx, 114, 36, 1.8, r, BLOT, 0.85);
      // the bow tie at the throat
      fillPoly(ctx, [[90, 46], [98, 50], [90, 54]], DARK, 0.85);
      fillPoly(ctx, [[106, 46], [98, 50], [106, 54]], DARK, 0.85);
      // legs, striding
      line(ctx, 44, 74, 38 - s, 100, r, { width: 2, alpha: 0.86 });
      line(ctx, 52, 76, 56 + s, 100, r, { width: 1.7, alpha: 0.74 });
      line(ctx, 84, 72, 80 + s, 100, r, { width: 2, alpha: 0.86 });
      line(ctx, 92, 70, 96 - s * 0.6, 100, r, { width: 1.7, alpha: 0.74 });
      // the tail, up and curling
      stroke(ctx, [[32, 60], [20, 44], [12, 30], [18, 22]], r, { width: 2, alpha: 0.84, jitter: 1 });
      spot(18, 36, 3.5);
    }
  });
}

/** THE PAW — what the barista's dog leaves on the pavement. Drawn in
 *  white for the footprint shader, which tints it; a pad and four toes,
 *  pointing up the page. */
export function pawTexture(): THREE.CanvasTexture {
  return makeTexture(64, 96, 71, (ctx, r) => {
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.9;
    ctx.beginPath();
    ctx.ellipse(32, 62, 14 + r() * 2, 12 + r() * 2, (r() - 0.5) * 0.2, 0, Math.PI * 2);
    ctx.fill();
    for (const [x, y] of [[13, 40], [25, 28], [40, 27], [52, 39]] as [number, number][]) {
      ctx.beginPath();
      ctx.ellipse(x, y, 6 + r() * 1.5, 7.5 + r() * 1.5, (r() - 0.5) * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  });
}

/**
 * THE SQUARE FLOCK — the owner's sheep. A sheep is a rounded square
 * with a small black head hung off one corner and four sticks under it,
 * and nothing about it is round except the corners.
 *   kind 0 a sheep · 1 the ram, with curled horns · 2 the one that is
 *   not a sheep: a long-horned face in the middle of the square
 *   pose 0 head down · 1 head up, looking at you
 * Drawn facing LEFT, the way they are in the painting.
 */
export function squareSheepTexture(seed: number, kind: 0 | 1 | 2, pose: 0 | 1): THREE.CanvasTexture {
  return makeTexture(128, 112, seed, (ctx, r) => {
    const box: [number, number][] = [[28, 24], [102, 22], [106, 82], [26, 84]];
    fillPoly(ctx, box, WOOL, 0.62);
    // the square, twice, the second pass never quite on the first
    const sq: [number, number][] = [];
    const corners: [number, number][] = [[30, 26], [100, 24], [104, 80], [28, 82]];
    for (let i = 0; i < 4; i++) {
      const [ax, ay] = corners[i];
      const [bx, by] = corners[(i + 1) % 4];
      for (let k = 0; k < 4; k++) sq.push([ax + (bx - ax) * (k / 4) + (r() - 0.5) * 2, ay + (by - ay) * (k / 4) + (r() - 0.5) * 2]);
    }
    sq.push(sq[0]);
    stroke(ctx, sq, r, { width: 2.4, alpha: 0.9, jitter: 1.6 });
    stroke(ctx, sq.map(([x, y]) => [x + 1.5, y - 1] as [number, number]), r, { width: 1.2, alpha: 0.4, jitter: 2, passes: 1 });
    // the legs: four sticks, two pairs
    for (const [x, o] of [[38, -1], [46, 1], [84, 0], [94, 2]] as [number, number][]) {
      line(ctx, x, 82, x + o, 104, r, { width: 1.6, alpha: 0.84 }, 2);
    }
    if (kind === 2) {
      // the one that is not a sheep: a long-horned face in the middle
      fillBlob(ctx, 64, 56, 9, r, BLOT, 0.85, 1.25);
      scribbleCircle(ctx, 64, 56, 8.5, r, { width: 1.7, alpha: 0.86 }, 1.1);
      stroke(ctx, [[56, 50], [42, 44], [34, 46]], r, { width: 2.4, alpha: 0.88, passes: 1 });
      stroke(ctx, [[72, 50], [86, 44], [94, 46]], r, { width: 2.4, alpha: 0.88, passes: 1 });
      return;
    }
    // the head, hung off the left corner: up, or down at the grass
    const hx = pose === 1 ? 22 : 24;
    const hy = pose === 1 ? 22 : 84;
    fillBlob(ctx, hx, hy, 9, r, BLOT, 0.88, 0.9);
    scribbleCircle(ctx, hx, hy, 8, r, { width: 1.8, alpha: 0.84, jitter: 1.4 }, 1.2);
    line(ctx, hx - 6, hy - 4, hx - 16, hy - 8, r, { width: 2, alpha: 0.82, passes: 1 }, 2);
    line(ctx, hx + 2, hy - 8, hx + 4, hy - 16, r, { width: 1.6, alpha: 0.7, passes: 1 }, 2);
    if (kind === 1) {
      // the ram: two curled horns, drawn as loops that do not close
      scribbleCircle(ctx, hx - 6, hy - 18, 7, r, { width: 2, alpha: 0.86 }, 1.6);
      scribbleCircle(ctx, hx + 12, hy - 14, 6, r, { width: 1.8, alpha: 0.8 }, 1.5);
    }
  });
}

/**
 * THE VISITORS — the owner's one-eyed thing. A zigzag egg the shape of
 * a pine tree, one big eye, a wide grin with a single tooth, a few
 * marks of fur, and two black boots pointing opposite ways.
 *   0 grinning · 1 blinking · 2 mouth shut
 */
export function alienTexture(seed: number, pose: 0 | 1 | 2): THREE.CanvasTexture {
  return makeTexture(96, 160, seed, (ctx, r) => {
    // the zigzag outline: down the left, across the bottom, up the right
    const left: [number, number][] = [];
    const right: [number, number][] = [];
    const steps = 9;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const y = 12 + t * 120;
      const half = 6 + Math.sin(t * Math.PI * 0.86) * 34;
      const out = i % 2 === 0 ? 0 : 7;
      left.push([48 - half - out, y]);
      right.push([48 + half + out, y]);
    }
    const outline: [number, number][] = [[48, 8], ...left, [34, 134], [62, 134], ...right.reverse()];
    fillPoly(ctx, outline, CANVAS, 0.42);
    poly(ctx, outline, r, { width: 2.4, alpha: 0.9, jitter: 0.8 });
    // the eye: an almond with a heavy pupil, or a lid
    if (pose === 1) {
      stroke(ctx, [[36, 60], [48, 66], [62, 60]], r, { width: 2.2, alpha: 0.88, passes: 1 });
    } else {
      stroke(ctx, [[36, 62], [44, 44], [56, 42], [64, 58], [58, 72], [42, 74], [36, 62]], r, { width: 2.1, alpha: 0.9, jitter: 0.8 });
      fillBlob(ctx, 50, 62, 7.5, r, BLOT, 0.92, 1.15);
    }
    // the mouth: a wide dark grin, and one tooth
    if (pose === 2) {
      stroke(ctx, [[34, 92], [48, 96], [66, 90]], r, { width: 2, alpha: 0.86, passes: 1 });
    } else {
      const grin: [number, number][] = [[30, 86], [46, 92], [64, 90], [74, 82], [66, 100], [50, 106], [34, 100]];
      shaded(ctx, grin, r, 0.85);
      fillPoly(ctx, [[54, 88], [60, 87], [60, 95], [54, 95]], '#f5f2ea', 0.95);
      poly(ctx, [[54, 88], [60, 87], [60, 95], [54, 95]], r, { width: 1, alpha: 0.7, passes: 1 });
    }
    // fur: a few short marks low on the body
    for (const [x, y] of [[36, 112], [52, 118], [62, 108], [44, 126]] as [number, number][]) {
      line(ctx, x, y, x + 2, y + 7, r, { width: 1.3, alpha: 0.6, passes: 1 }, 2);
    }
    // the boots, pointing opposite ways
    fillPoly(ctx, [[38, 132], [46, 132], [44, 146], [20, 150], [22, 144], [36, 142]], BLOT, 0.9);
    fillPoly(ctx, [[52, 132], [60, 132], [62, 142], [76, 146], [74, 152], [50, 146]], BLOT, 0.9);
  });
}

/** THE EYE, AT NIGHT — what is left of a visitor after dark: a pale
 *  glow with a dark centre, and it is the light over the pan. */
export function eyeGlowTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(64, 64, seed, (ctx) => {
    const g = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
    g.addColorStop(0, 'rgba(226,240,190,0.9)');
    g.addColorStop(0.3, 'rgba(210,228,160,0.45)');
    g.addColorStop(1, 'rgba(200,220,150,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
    ctx.fillStyle = BLOT;
    ctx.globalAlpha = 0.82;
    ctx.beginPath();
    ctx.ellipse(32, 32, 4.5, 5.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  });
}

/** THE PATTERN burned into the pan: ruled, which nothing out here has
 *  ever been. Three squares inside each other, turned a little, eight
 *  rules from the middle, and the ink of it is scorch. */
export function scorchDecal(seed: number): THREE.CanvasTexture {
  return makeTexture(512, 512, seed, (ctx, r) => {
    const c = 256;
    const o = { width: 5, alpha: 0.5, passes: 1, jitter: 0.6, color: '#2a2620', smudge: { scale: 1.6, alpha: 0.12 } };
    for (const [half, rot] of [[210, 0.1], [140, 0.3], [70, 0.52]] as [number, number][]) {
      const pts: [number, number][] = [];
      for (let i = 0; i <= 4; i++) {
        const a = rot + (i / 4) * Math.PI * 2 + Math.PI / 4;
        pts.push([c + Math.cos(a) * half * 1.414, c + Math.sin(a) * half * 1.414]);
      }
      stroke(ctx, pts, r, o);
    }
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4 + 0.1;
      line(ctx, c + Math.cos(a) * 60, c + Math.sin(a) * 60, c + Math.cos(a) * 236, c + Math.sin(a) * 236, r, { ...o, width: 3.4, alpha: 0.42 }, 10);
      // tick marks along every rule, evenly, which is the point
      for (let k = 90; k < 230; k += 24) {
        const x = c + Math.cos(a) * k;
        const y = c + Math.sin(a) * k;
        line(ctx, x - Math.sin(a) * 6, y + Math.cos(a) * 6, x + Math.sin(a) * 6, y - Math.cos(a) * 6, r, { ...o, width: 2.2, alpha: 0.4 }, 2);
      }
    }
    // the scorch: a soft dark bloom under the middle
    const g = ctx.createRadialGradient(c, c, 10, c, c, 120);
    g.addColorStop(0, 'rgba(40,36,30,0.28)');
    g.addColorStop(1, 'rgba(40,36,30,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 512, 512);
  });
}

/* ================================================================== *
 * THE BARISTA AT THE JUNCTION
 * ================================================================== */

/** THE CART: two wheels, a counter, a striped canopy on two poles, a
 *  machine with a lever, and the one word on it says what it is for. */
export function coffeeCartTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(192, 176, seed, (ctx, r) => {
    // the body and the counter
    const body: [number, number][] = [[34, 96], [160, 94], [162, 150], [32, 152]];
    fillPoly(ctx, body, CANVAS, 0.5);
    poly(ctx, body, r, { width: 2.4, alpha: 0.9 });
    line(ctx, 30, 96, 166, 94, r, { width: 2.6, alpha: 0.9 });
    hatch(ctx, 36, 100, 124, 48, 0.02, 9, r, { alpha: 0.14 });
    // wheels
    for (const wx of [58, 138]) {
      scribbleCircle(ctx, wx, 156, 12, r, { width: 2.2, alpha: 0.88 }, 1.2);
      scribbleCircle(ctx, wx, 156, 3, r, { width: 1.3, alpha: 0.6 });
    }
    // the poles and the canopy
    line(ctx, 40, 96, 42, 40, r, { width: 2.2, alpha: 0.86 });
    line(ctx, 154, 94, 152, 40, r, { width: 2.2, alpha: 0.86 });
    const canopy: [number, number][] = [[22, 42], [172, 40], [166, 18], [28, 20]];
    fillPoly(ctx, canopy, '#e8dfc8', 0.6);
    poly(ctx, canopy, r, { width: 2.4, alpha: 0.9 });
    for (let x = 34; x < 166; x += 18) {
      fillPoly(ctx, [[x, 21], [x + 9, 21], [x + 8, 41], [x - 1, 41]], '#b35a4a', 0.42);
    }
    // the scallops along the edge
    for (let x = 26; x < 170; x += 12) {
      stroke(ctx, [[x, 42], [x + 6, 48], [x + 12, 42]], r, { width: 1.5, alpha: 0.8, passes: 1 });
    }
    // the machine, with a lever, and a stack of cups beside it
    const machine: [number, number][] = [[112, 94], [150, 94], [150, 66], [112, 66]];
    fillPoly(ctx, machine, STEEL, 0.5);
    poly(ctx, machine, r, { width: 2, alpha: 0.86 });
    line(ctx, 146, 68, 160, 54, r, { width: 2.4, alpha: 0.86, passes: 1 });
    fillBlob(ctx, 160, 53, 3, r, BLOT, 0.8);
    for (let i = 0; i < 4; i++) {
      poly(ctx, [[48 + i * 2, 94 - i * 3], [62 + i * 2, 94 - i * 3], [60 + i * 2, 80 - i * 3], [50 + i * 2, 80 - i * 3]], r, { width: 1.3, alpha: 0.7, passes: 1 });
    }
    // and what it is for, on the canopy
    legibleCaps(ctx, 'COFFEE', 62, 36, 13, r, { alpha: 0.88, width: 2 });
  });
}

/**
 * THE CUPS on the counter, with the names on them. `names` is the row
 * as it stands at this hour: a name is lettered on its cup the way a
 * marker letters a paper cup, and `null` is a cup with no name on it.
 */
export function cupRowTexture(seed: number, names: (string | null)[]): THREE.CanvasTexture {
  return makeTexture(512, 80, seed, (ctx, r) => {
    for (let i = 0; i < names.length; i++) {
      const x = 8 + i * 41;
      const cup: [number, number][] = [[x + 4, 70], [x + 34, 70], [x + 38, 26], [x, 26]];
      fillPoly(ctx, cup, '#f0ece0', 0.9);
      poly(ctx, cup, r, { width: 1.7, alpha: 0.86, jitter: 0.8 });
      line(ctx, x - 2, 26, x + 40, 25, r, { width: 2, alpha: 0.86, passes: 1 }, 3);
      const n = names[i];
      if (n) lettering(ctx, n, x + 5, 56, 8.5, r, { crooked: 0.9, width: 1.4, alpha: 0.88, tracking: 0.9 });
    }
  });
}

/** THE BARISTA: an apron, a cap, and a hand cupped to the mouth.
 *   0 calling a name · 2 bent over the counter, wiping */
export function baristaTexture(seed: number, pose: 0 | 2): THREE.CanvasTexture {
  return makeTexture(96, 160, seed, (ctx, r) => {
    const cx = 48;
    const bend = pose === 2;
    const hx = bend ? cx + 14 : cx;
    const hy = bend ? 56 : 34;
    scribbleCircle(ctx, hx, hy, 13, r, { width: 2, alpha: 0.86 }, 1.1);
    // the cap
    stroke(ctx, [[hx - 14, hy - 8], [hx - 2, hy - 18], [hx + 14, hy - 12]], r, { width: 2, alpha: 0.85, passes: 1 });
    line(ctx, hx + 8, hy - 12, hx + 22, hy - 10, r, { width: 1.8, alpha: 0.8, passes: 1 }, 2);
    const top = hy + 16;
    const body: [number, number][] = bend
      ? [[cx - 12, 108], [cx - 6, 84], [hx - 6, hy + 12], [hx + 8, hy + 16], [cx + 12, 90], [cx + 14, 108]]
      : [[cx - 12, top], [cx - 14, 108], [cx + 14, 108], [cx + 12, top]];
    fillPoly(ctx, body, DUN, 0.24);
    poly(ctx, body, r, { width: 2, alpha: 0.86 });
    // the apron: a paler bib and a tie at the waist
    const apron: [number, number][] = bend
      ? [[cx - 8, 104], [cx - 4, 86], [cx + 8, 88], [cx + 10, 104]]
      : [[cx - 9, top + 10], [cx - 10, 106], [cx + 10, 106], [cx + 9, top + 10]];
    fillPoly(ctx, apron, '#f0ece0', 0.6);
    poly(ctx, apron, r, { width: 1.4, alpha: 0.7, passes: 1 });
    if (bend) {
      stroke(ctx, [[hx - 8, hy + 18], [hx - 2, hy + 44], [hx + 6, 118]], r, { width: 1.8, alpha: 0.8 });
      stroke(ctx, [[hx + 8, hy + 18], [hx + 16, hy + 40], [hx + 14, 116]], r, { width: 1.7, alpha: 0.76 });
    } else {
      // one hand up beside the mouth, the other on the counter
      stroke(ctx, [[cx + 12, top + 4], [cx + 24, top - 6], [hx + 14, hy + 2]], r, { width: 1.8, alpha: 0.82 });
      stroke(ctx, [[cx - 12, top + 4], [cx - 22, top + 30], [cx - 18, top + 46]], r, { width: 1.8, alpha: 0.8 });
    }
    line(ctx, cx - 8, 108, cx - 10, 148, r, { width: 2.2, alpha: 0.85 });
    line(ctx, cx + 8, 108, cx + 10, 148, r, { width: 2.2, alpha: 0.85 });
    line(ctx, cx - 12, 148, cx - 2, 149, r, { width: 1.8, alpha: 0.8, passes: 1 }, 2);
    line(ctx, cx + 2, 149, cx + 14, 148, r, { width: 1.8, alpha: 0.8, passes: 1 }, 2);
  });
}

/** THE WHEELIE BIN — a tall bin on two wheels with a lid, and it goes
 *  over a little when it is rolling. */
export function wheelieBinTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(96, 128, seed, (ctx, r) => {
    const body: [number, number][] = [[26, 30], [72, 30], [68, 108], [30, 108]];
    fillPoly(ctx, body, BIN, 0.55);
    poly(ctx, body, r, { width: 2.4, alpha: 0.9 });
    line(ctx, 22, 30, 76, 28, r, { width: 2.6, alpha: 0.9 });
    poly(ctx, [[22, 30], [76, 28], [74, 20], [24, 22]], r, { width: 2, alpha: 0.86 });
    line(ctx, 38, 38, 36, 100, r, { width: 1.2, alpha: 0.4, passes: 1 });
    line(ctx, 58, 38, 60, 100, r, { width: 1.2, alpha: 0.4, passes: 1 });
    // the handle bar, and the wheels
    line(ctx, 74, 30, 82, 26, r, { width: 2.2, alpha: 0.86, passes: 1 }, 2);
    for (const wx of [34, 64]) {
      scribbleCircle(ctx, wx, 114, 8, r, { width: 2, alpha: 0.86 }, 1.2);
      fillBlob(ctx, wx, 114, 3, r, BLOT, 0.8);
    }
  });
}

/** YOUR LANE — a third path worn into the junction's stone, closer to
 *  him than either of the two the city made. Pale on the paving. */
export function yourLaneDecal(seed: number): THREE.CanvasTexture {
  return makeTexture(512, 512, seed, (ctx, r) => {
    const pts: [number, number][] = [];
    for (let i = 0; i <= 16; i++) {
      const t = i / 16;
      const y = 512 - t * 512;
      const lean = Math.sin(t * Math.PI) * 74;
      pts.push([256 + 12 + lean, y]);
    }
    for (let k = 0; k < 7; k++) {
      stroke(ctx, pts.map(([x, y]) => [x + (r() - 0.5) * 12, y] as [number, number]), r,
        { width: 16, alpha: 0.2, passes: 1, jitter: 3, color: '#ebe8df' });
    }
  });
}

/* ================================================================== *
 * THE DESIGN STUDIO IN THE ATRIUM
 * ================================================================== */

/** A person with a lanyard and a laptop under one arm.
 *   0 stood, a clipboard held up · 2 bent over the table · 4 carrying
 *   a foam board */
export function designerTexture(seed: number, pose: 0 | 2 | 4): THREE.CanvasTexture {
  return makeTexture(96, 160, seed, (ctx, r) => {
    const cx = 48;
    const bend = pose === 2;
    const hx = bend ? cx + 16 : cx;
    const hy = bend ? 60 : 34;
    scribbleCircle(ctx, hx, hy, 13, r, { width: 2, alpha: 0.86 }, 1.1);
    const top = hy + 16;
    const body: [number, number][] = bend
      ? [[cx - 12, 110], [cx - 4, 84], [hx - 6, hy + 12], [hx + 8, hy + 16], [cx + 12, 90], [cx + 14, 110]]
      : [[cx - 11, top], [cx - 13, 106], [cx + 13, 106], [cx + 11, top]];
    fillPoly(ctx, body, '#8e9aa6', 0.28);
    poly(ctx, body, r, { width: 2, alpha: 0.86 });
    // the lanyard: a V, and a card on the end of it
    if (!bend) {
      stroke(ctx, [[cx - 8, top + 2], [cx, top + 22], [cx + 8, top + 2]], r, { width: 1.1, alpha: 0.7, passes: 1 });
      fillPoly(ctx, [[cx - 4, top + 20], [cx + 4, top + 20], [cx + 4, top + 30], [cx - 4, top + 30]], '#f0ece0', 0.8);
      poly(ctx, [[cx - 4, top + 20], [cx + 4, top + 20], [cx + 4, top + 30], [cx - 4, top + 30]], r, { width: 1, alpha: 0.7, passes: 1 });
    }
    if (pose === 4) {
      // a foam board carried flat against the chest
      const b: [number, number][] = [[cx - 24, top + 8], [cx + 24, top + 8], [cx + 24, top + 38], [cx - 24, top + 38]];
      fillPoly(ctx, b, '#f3f0e6', 0.9);
      poly(ctx, b, r, { width: 1.6, alpha: 0.8 });
      for (let i = 0; i < 3; i++) line(ctx, cx - 18, top + 14 + i * 7, cx + 6 + i * 4, top + 14 + i * 7, r, { width: 1, alpha: 0.4, passes: 1 }, 2);
      stroke(ctx, [[cx - 11, top + 4], [cx - 26, top + 24], [cx - 20, top + 36]], r, { width: 1.8, alpha: 0.8 });
      stroke(ctx, [[cx + 11, top + 4], [cx + 26, top + 24], [cx + 20, top + 36]], r, { width: 1.8, alpha: 0.8 });
    } else if (bend) {
      stroke(ctx, [[hx - 8, hy + 18], [hx - 4, hy + 46], [hx + 2, 124]], r, { width: 1.8, alpha: 0.8 });
      stroke(ctx, [[hx + 8, hy + 18], [hx + 14, hy + 44], [hx + 10, 122]], r, { width: 1.7, alpha: 0.76 });
    } else {
      // a clipboard held up in one hand, a laptop under the other arm
      stroke(ctx, [[cx + 11, top + 4], [cx + 24, top + 14], [cx + 22, top + 4]], r, { width: 1.8, alpha: 0.8 });
      const cb: [number, number][] = [[cx + 18, top - 14], [cx + 34, top - 12], [cx + 32, top + 10], [cx + 16, top + 8]];
      fillPoly(ctx, cb, '#f3f0e6', 0.9);
      poly(ctx, cb, r, { width: 1.5, alpha: 0.82 });
      for (let i = 0; i < 3; i++) line(ctx, cx + 21, top - 8 + i * 5, cx + 30, top - 8 + i * 5, r, { width: 0.9, alpha: 0.4, passes: 1 }, 2);
      stroke(ctx, [[cx - 11, top + 4], [cx - 20, top + 30], [cx - 14, top + 40]], r, { width: 1.8, alpha: 0.8 });
      fillPoly(ctx, [[cx - 24, top + 24], [cx - 8, top + 22], [cx - 8, top + 34], [cx - 24, top + 36]], STEEL, 0.6);
      poly(ctx, [[cx - 24, top + 24], [cx - 8, top + 22], [cx - 8, top + 34], [cx - 24, top + 36]], r, { width: 1.3, alpha: 0.7, passes: 1 });
    }
    line(ctx, cx - 8, 106, cx - 10, 148, r, { width: 2.2, alpha: 0.85 });
    line(ctx, cx + 8, 106, cx + 10, 148, r, { width: 2.2, alpha: 0.85 });
    line(ctx, cx - 12, 148, cx - 2, 149, r, { width: 1.8, alpha: 0.8, passes: 1 }, 2);
    line(ctx, cx + 2, 149, cx + 14, 148, r, { width: 1.8, alpha: 0.8, passes: 1 }, 2);
  });
}

/** A small yellow square, and the two scrawled lines on it that are
 *  never legible at any distance, which is accurate. */
function sticky(ctx: Ctx2D, x: number, y: number, s: number, r: () => number, color: string) {
  const rot = (r() - 0.5) * 0.3;
  const pts: [number, number][] = [[-s / 2, -s / 2], [s / 2, -s / 2], [s / 2, s / 2], [-s / 2, s / 2]]
    .map(([px, py]) => [x + px * Math.cos(rot) - py * Math.sin(rot), y + px * Math.sin(rot) + py * Math.cos(rot)] as [number, number]);
  fillPoly(ctx, pts, color, 0.88);
  poly(ctx, pts, r, { width: 0.9, alpha: 0.5, passes: 1, jitter: 0.5 });
  for (let i = 0; i < 2; i++) {
    const yy = y - s * 0.16 + i * s * 0.28;
    line(ctx, x - s * 0.32, yy, x + s * (0.1 + r() * 0.24), yy + (r() - 0.5) * 2, r, { width: 0.8, alpha: 0.5, passes: 1 }, 2);
  }
}

/** THE PERSONA, pinned up on an easel. A name, a circle where a face
 *  would go and is not, three headings, and a quote. Accurate. */
export function personaBoardTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(192, 240, seed, (ctx, r) => {
    // the easel
    line(ctx, 40, 236, 60, 60, r, { width: 2.6, alpha: 0.88 });
    line(ctx, 152, 236, 132, 60, r, { width: 2.6, alpha: 0.88 });
    line(ctx, 96, 224, 96, 100, r, { width: 2.2, alpha: 0.8 });
    line(ctx, 52, 176, 140, 176, r, { width: 2, alpha: 0.8 });
    // the board
    const b: [number, number][] = [[28, 176], [164, 176], [164, 30], [28, 30]];
    fillPoly(ctx, b, '#f3f0e6', 0.95);
    poly(ctx, b, r, { width: 2.2, alpha: 0.9, jitter: 0.8 });
    legibleCaps(ctx, 'DENNIS', 40, 56, 15, r, { alpha: 0.9, width: 2 });
    legibleCaps(ctx, 'COMMUTER, 58', 40, 70, 6.5, r, { alpha: 0.6, width: 1.1 });
    // the photo: a circle, hatched, and nobody in it
    scribbleCircle(ctx, 138, 58, 16, r, { width: 1.6, alpha: 0.8 }, 1.1);
    hatch(ctx, 124, 44, 28, 28, 0.7, 4, r, { alpha: 0.16 });
    for (const [label, y] of [['GOALS', 92], ['FRUSTRATIONS', 122], ['NEEDS', 152]] as [string, number][]) {
      legibleCaps(ctx, label, 40, y, 7, r, { alpha: 0.82, width: 1.2 });
      for (let i = 0; i < 2; i++) {
        line(ctx, 40, y + 8 + i * 7, 88 + r() * 60, y + 8 + i * 7, r, { width: 1, alpha: 0.32, passes: 1 }, 3);
      }
    }
    // the quote, in a box, and it is what he says
    poly(ctx, [[36, 160], [156, 160], [156, 172], [36, 172]], r, { width: 1, alpha: 0.5, passes: 1 });
    lettering(ctx, "'IT SAYS 8:15.'", 44, 170, 7.5, r, { crooked: 0.4, width: 1.1, alpha: 0.82 });
    sticky(ctx, 150, 40, 20, r, STICKY[0]);
  });
}

/** THE JOURNEY MAP: four rows, twelve stages, and a line for how it
 *  feels that goes down at the fourth stage and stays down. A journey
 *  nobody has taken, mapped. */
export function journeyMapTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(288, 176, seed, (ctx, r) => {
    line(ctx, 30, 172, 40, 40, r, { width: 2.4, alpha: 0.86 });
    line(ctx, 258, 172, 248, 40, r, { width: 2.4, alpha: 0.86 });
    const b: [number, number][] = [[14, 140], [274, 140], [274, 24], [14, 24]];
    fillPoly(ctx, b, '#f3f0e6', 0.95);
    poly(ctx, b, r, { width: 2.2, alpha: 0.9, jitter: 0.8 });
    legibleCaps(ctx, 'JOURNEY MAP - THE 8:15', 22, 40, 8.5, r, { alpha: 0.88, width: 1.4 });
    const rows = ['STAGE', 'DOING', 'THINKING', 'FEELING'];
    for (let i = 0; i < rows.length; i++) {
      const y = 58 + i * 20;
      legibleCaps(ctx, rows[i], 20, y + 2, 5.5, r, { alpha: 0.7, width: 1 });
      line(ctx, 66, y + 6, 268, y + 6, r, { width: 0.9, alpha: 0.35, passes: 1 }, 4);
    }
    // twelve stages, as dots on the top row, and nothing under most of them
    for (let i = 0; i < 12; i++) {
      const x = 74 + i * 17;
      fillBlob(ctx, x, 54, 2.6, r, INK, 0.8);
      if (i < 4 || r() > 0.7) {
        line(ctx, x - 6, 76, x + 6, 76, r, { width: 1, alpha: 0.4, passes: 1 }, 2);
        line(ctx, x - 6, 96, x + 4, 96, r, { width: 1, alpha: 0.4, passes: 1 }, 2);
      }
    }
    // how it feels: up, up, down at the fourth stage, and level from there
    const curve: [number, number][] = [[74, 116], [91, 112], [108, 110], [125, 132], [142, 134], [176, 133], [210, 134], [244, 133], [261, 134]];
    stroke(ctx, curve, r, { width: 1.8, alpha: 0.86, color: '#b35a4a' });
    sticky(ctx, 200, 70, 14, r, STICKY[1]);
    sticky(ctx, 232, 92, 14, r, STICKY[2]);
    sticky(ctx, 118, 118, 13, r, STICKY[0]);
  });
}

/** THE STICKIES ON THE SHELTER GLASS: `n` of them, in a cluster that
 *  grows through the sprint. Drawn on a transparent sheet the size of
 *  the shelter's own drawing, so it stands on the glass. */
export function stickyGlassTexture(seed: number, n: number): THREE.CanvasTexture {
  return makeTexture(224, 160, seed, (ctx, r) => {
    for (let i = 0; i < n; i++) {
      // fill the glass from the middle out, a row at a time
      const col = i % 6;
      const row = Math.floor(i / 6);
      const x = 62 + col * 19 + (r() - 0.5) * 6;
      const y = 62 + row * 17 + (r() - 0.5) * 5;
      sticky(ctx, x, y, 14, r, STICKY[(i * 7) % 4]);
    }
  });
}

/** ONE STICKY, peeled off and on the ground. */
export function stickyNoteDecal(seed: number): THREE.CanvasTexture {
  return makeTexture(32, 32, seed, (ctx, r) => {
    sticky(ctx, 16, 16, 22, r, STICKY[seed % 4]);
  });
}

/** THE OFFICE CHAIR: five castors, a stem, a seat, a mesh back and two
 *  arms. Ruled, like everything in this land, and it rolls. */
export function officeChairTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(96, 128, seed, (ctx, r) => {
    const o = { width: 2.2, alpha: 0.88, jitter: 0.6 };
    // the star base and its castors
    for (const [dx, dy] of [[-30, 10], [-14, 14], [14, 14], [30, 10], [0, 16]] as [number, number][]) {
      line(ctx, 48, 100, 48 + dx, 100 + dy, r, o, 3);
      scribbleCircle(ctx, 48 + dx, 103 + dy, 3, r, { width: 1.4, alpha: 0.8 }, 1.2);
    }
    line(ctx, 48, 100, 48, 74, r, { width: 3, alpha: 0.88 }, 2);
    // the seat, and the back with a mesh in it
    const seat: [number, number][] = [[22, 74], [74, 74], [72, 64], [24, 64]];
    fillPoly(ctx, seat, DARK, 0.5);
    poly(ctx, seat, r, o);
    const back: [number, number][] = [[28, 64], [30, 16], [66, 16], [68, 64]];
    fillPoly(ctx, back, DARK, 0.28);
    poly(ctx, back, r, o);
    hatch(ctx, 32, 20, 32, 40, 0.8, 4, r, { alpha: 0.18 });
    hatch(ctx, 32, 20, 32, 40, -0.8, 4, r, { alpha: 0.18 });
    // the arms
    stroke(ctx, [[24, 66], [16, 48], [30, 46]], r, { width: 2, alpha: 0.84, passes: 1 });
    stroke(ctx, [[72, 66], [80, 48], [66, 46]], r, { width: 2, alpha: 0.84, passes: 1 });
  });
}

/** THE BALL on the green, with its panels. */
export function ballTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(48, 48, seed, (ctx, r) => {
    fillBlob(ctx, 24, 24, 17, r, '#eae6da', 0.9, 1);
    scribbleCircle(ctx, 24, 24, 17, r, { width: 2, alpha: 0.9 }, 1.12);
    // two dark panels and the seams between them
    fillPoly(ctx, [[18, 16], [28, 14], [32, 22], [26, 28], [17, 24]], DARK, 0.7);
    fillPoly(ctx, [[10, 30], [16, 34], [14, 40], [8, 36]], DARK, 0.6);
    fillPoly(ctx, [[34, 30], [40, 28], [40, 36], [34, 38]], DARK, 0.6);
    stroke(ctx, [[26, 28], [30, 36], [24, 41]], r, { width: 1.1, alpha: 0.6, passes: 1 });
    stroke(ctx, [[32, 22], [40, 20]], r, { width: 1.1, alpha: 0.6, passes: 1 });
  });
}

/** THE CORNER OF THE TIMETABLE, lifted (`THE-STRANGERS` E20): a small
 *  curl at the board's foot, and pressing it back is a door. */
export function liftedCornerTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(40, 40, seed, (ctx, r) => {
    const flap: [number, number][] = [[4, 36], [30, 36], [8, 8]];
    fillPoly(ctx, flap, '#f5f2ea', 0.95);
    poly(ctx, flap, r, { width: 1.5, alpha: 0.85, jitter: 0.6 });
    hatch(ctx, 6, 14, 18, 20, 0.6, 3, r, { alpha: 0.2 });
  });
}

/** A run of hand-lettered text on a transparent sheet, for the one
 *  place in the studio that says what it is: the sprint board's title. */
export function sprintSignTexture(seed: number, text: string): THREE.CanvasTexture {
  return makeTexture(256, 48, seed, (ctx, r) => {
    letteringFit(ctx, text, 12, 34, 232, 18, r, { crooked: 0.5, width: 2.2, alpha: 0.86, color: PENCIL });
  });
}
