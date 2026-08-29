import * as THREE from 'three';
import {
  makeTexture, stroke, line, scribbleCircle, hatch, type Ctx2D,
} from '../engine/ink';
import { INK, PENCIL, WASH } from '../engine/palette';

/**
 * THE COAST's prop box (Session 5) — LONGSHORE and THE WIDE BLUE.
 *
 * Two techniques hold this land together and both are stated in the
 * specs before a line was drawn:
 *
 * 1. **The dry brush and the horizontal.** Every mark on this coast is
 *    either a long low horizontal — plank, rail, wrack line, hull
 *    sheer, groyne — or a vertical stab standing against it: a post, a
 *    marram blade, a mast, the cairn. Nothing here runs diagonally
 *    except THE CUT, which is exactly why the cut reads as made.
 * 2. **The paint is peeling.** The huts and the boardwalk carry the
 *    only paint in the world outside Brim's banners, and salt has been
 *    at it: colour goes on as BROKEN fill with the paper showing
 *    through the wear, so one hut can be turquoise without the page
 *    turning into a cartoon.
 *
 * On the water there is a third rule: **the sea is drawn by what floats
 * on it.** Nothing in this file puts a mark on open water — the swell,
 * the crests and the surf are the terrain shader's, and pen strokes
 * over them fight. So every floating drawing is cut off flat at its own
 * waterline with a short reflection hatch under it and nothing below.
 */

const TAR = '#3b3a38';
const BLEACH = '#cfc6b0';
const SALT_BLUE = '#7ea3ae';
const SALT_MINT = '#9fb6a4';
const SALT_ROSE = '#c08e86';
const CREAM = '#efe6cf';
const RED = '#8f4a52';
const HULL = '#8a5a3a';

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

function poly(
  ctx: Ctx2D, pts: [number, number][], r: () => number,
  o: Parameters<typeof stroke>[3] = {}
) {
  stroke(ctx, [...pts, pts[0]], r, o);
}

/**
 * PEELING PAINT: a colour laid down as a field of torn patches rather
 * than a flat fill, so the paper reads through the wear. The patches
 * bias toward the top of the box because salt takes the bottom of a
 * plank first.
 */
function peeled(
  ctx: Ctx2D, x: number, y: number, w: number, h: number,
  r: () => number, color: string, alpha: number, wear = 0.5
) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
  // take it back off again, in torn flakes, low down and at the edges
  ctx.globalCompositeOperation = 'destination-out';
  const n = Math.round((w * h) / 620);
  for (let i = 0; i < n; i++) {
    const fy = y + Math.pow(r(), 0.55) * h;
    const fx = x + r() * w;
    const fw = 3 + r() * 13;
    const fh = 2 + r() * 8;
    ctx.globalAlpha = (0.25 + r() * 0.6) * wear;
    ctx.beginPath();
    ctx.moveTo(fx, fy);
    ctx.lineTo(fx + fw * (0.4 + r() * 0.7), fy - fh * r());
    ctx.lineTo(fx + fw, fy + fh * (0.3 + r()));
    ctx.lineTo(fx + fw * 0.3, fy + fh);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}

/** The same peeling, but clipped to a shape instead of a box — a
 *  painted cap is a taper, not a rectangle, and round 1 of the gate
 *  found nine red rectangles standing along a cliff path. */
function peeledPoly(
  ctx: Ctx2D, pts: [number, number][], r: () => number,
  color: string, alpha: number, wear = 0.5
) {
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const [x, y] of pts) {
    x0 = Math.min(x0, x); y0 = Math.min(y0, y);
    x1 = Math.max(x1, x); y1 = Math.max(y1, y);
  }
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
  ctx.clip();
  peeled(ctx, x0, y0, x1 - x0, y1 - y0, r, color, alpha, wear);
  ctx.restore();
}

/* ==================== LONGSHORE ==================== */

/**
 * MARRAM. Not the meadow's grass: sea marram grows in tight tussocks,
 * every blade dead straight for two thirds of its length and then bent
 * hard by a wind that never stops. The lean is DRAWN IN and the field
 * never x-flips these, so the whole coast leans one way — one wind.
 */
export function marramTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(96, 128, seed, (ctx, r) => {
    const n = 7 + Math.floor(r() * 5);
    for (let i = 0; i < n; i++) {
      const bx = 30 + (r() - 0.5) * 34;
      const hgt = 52 + r() * 62;
      const knee = 0.42 + r() * 0.26;
      const bend = 16 + r() * 26;
      stroke(ctx, [
        [bx, 126],
        [bx + bend * 0.16, 126 - hgt * knee],
        [bx + bend * 0.62, 126 - hgt * 0.84],
        [bx + bend, 126 - hgt],
      ], r, { width: 1.5, alpha: 0.62 + r() * 0.26, passes: 1, jitter: 0.7 });
    }
    // the tussock's own shadow-side: a few blades in the pale register
    for (let i = 0; i < 3; i++) {
      const bx = 26 + (r() - 0.5) * 30;
      const hgt = 34 + r() * 30;
      stroke(ctx, [[bx, 126], [bx + 8, 126 - hgt * 0.6], [bx + 20, 126 - hgt]], r,
        { width: 1.2, alpha: 0.3, passes: 1, color: PENCIL });
    }
    // sand gathering at the foot, drawn as two flat licks
    line(ctx, 12, 124, 60, 122, r, { width: 1.4, alpha: 0.22, passes: 1 }, 4);
  });
}

/**
 * THE WRACK LINE — what the last high tide put down and walked away
 * from: bladderwrack, a rope end, a crab shell, splinters. Drawn as a
 * DECAL that lies along the page, so it follows the beach's cockle.
 * The mark is horizontal and broken, never a tidy scatter of objects.
 */
export function wrackDecal(seed: number): THREE.CanvasTexture {
  return makeTexture(192, 96, seed, (ctx, r) => {
    // the weed itself: long limp horizontals with bladders on them
    const rows = 3 + Math.floor(r() * 3);
    for (let i = 0; i < rows; i++) {
      const y = 22 + r() * 54;
      const x0 = r() * 60;
      const len = 60 + r() * 110;
      const pts: [number, number][] = [];
      const segs = 7;
      for (let k = 0; k <= segs; k++) {
        pts.push([x0 + (len * k) / segs, y + Math.sin(k * 1.6 + i) * (3 + r() * 5)]);
      }
      stroke(ctx, pts, r, { width: 2.2 + r() * 1.4, alpha: 0.5 + r() * 0.3, passes: 1, jitter: 1.4 });
      // bladders
      for (let k = 0; k < 4; k++) {
        const t = 0.15 + r() * 0.75;
        ctx.globalAlpha = 0.44;
        ctx.fillStyle = INK;
        ctx.beginPath();
        ctx.ellipse(x0 + len * t, y + Math.sin(t * 9 + i) * 3, 2.6 + r() * 1.8, 1.9 + r(), r(), 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }
    // shell fragments and one rope end, sparse
    for (let i = 0; i < 4; i++) {
      const x = 14 + r() * 164;
      const y = 18 + r() * 62;
      if (r() > 0.45) {
        const s = 3 + r() * 4;
        stroke(ctx, [[x - s, y], [x, y - s * 1.2], [x + s, y]], r,
          { width: 1.1, alpha: 0.42, passes: 1 });
        for (let a = 0; a < 3; a++) {
          line(ctx, x, y, x - s + (a * s), y - s * 1.1, r, { width: 0.9, alpha: 0.26, passes: 1 }, 2);
        }
      } else {
        scribbleCircle(ctx, x, y, 2.4 + r() * 2.4, r, { width: 1, alpha: 0.34 }, 1.6);
      }
    }
    if (seed % 3 === 0) {
      // a rope end, coiled where it washed up
      scribbleCircle(ctx, 150, 62, 9, r, { width: 1.4, alpha: 0.4 }, 2.4);
      stroke(ctx, [[159, 62], [172, 58], [186, 64]], r, { width: 1.4, alpha: 0.36, passes: 1 });
    }
  });
}

/**
 * A BEACH HUT ON STILTS, rebuilt. Session 1's version was a shed with a
 * porthole; this one has the coast's whole technique in it — a long low
 * horizontal body, vertical stilts stabbing down into the sand, and
 * paint that salt has been at for thirty years.
 */
export function beachHutTexture(seed: number, paint: 0 | 1 | 2): THREE.CanvasTexture {
  const c = [SALT_BLUE, SALT_MINT, SALT_ROSE][paint];
  return makeTexture(192, 192, seed, (ctx, r) => {
    /* FOUR HUTS IN ONE FRAME MEANS FOUR SILHOUETTES. Round 6 of the
     * gate found the same box four times over with the paint swapped —
     * same width, same roof, same oval door dead centre, same porthole
     * to its right — which is the array-look with colour on it. So
     * everything that gives a hut its outline is rolled here: how wide
     * it is, which side the door is on, how steep the roof is, whether
     * it has a veranda, and whether anybody has been in it this year. */
    const bw = 132 + r() * 44;            // body width
    const bx = 96 - bw / 2;
    const floor = 144 + r() * 10;
    const top = floor - (58 + r() * 20);
    const pitch = 22 + r() * 26;          // roof rise
    const leftDoor = r() > 0.5;
    const dw = 30 + r() * 12;
    const dx = leftDoor ? bx + 12 + r() * 10 : bx + bw - dw - 12 - r() * 10;

    // stilts, braced — the verticals
    const legs = [bx + 8, 96, bx + bw - 8];
    for (const x of legs) {
      line(ctx, x, 186, x + (r() - 0.5) * 4, floor, r, { width: 3, alpha: 0.86 });
    }
    line(ctx, legs[0], floor + 6, 96, 180, r, { width: 1.6, alpha: 0.5, passes: 1 });
    line(ctx, legs[2], floor + 6, 96, 180, r, { width: 1.6, alpha: 0.5, passes: 1 });

    // the body: peeling paint under vertical board lines
    peeled(ctx, bx, top, bw, floor - top, r, c, 0.52, 0.5 + r() * 0.3);
    poly(ctx, [[bx, floor], [bx, top], [bx + bw, top - 3], [bx + bw, floor]], r,
      { width: 2.4, alpha: 0.9 });
    for (let x = bx + 14; x < bx + bw - 6; x += 13 + r() * 8) {
      line(ctx, x, top + 2, x + (r() - 0.5) * 3, floor - 2, r,
        { width: 1, alpha: 0.28, passes: 1 });
    }

    // the door, and whether it is open
    const state = r();
    const dTop = top + 14 + r() * 12;
    if (state > 0.55) {
      fillPoly(ctx, [[dx, floor], [dx, dTop], [dx + dw, dTop - 2], [dx + dw, floor]], INK, 0.42);
      poly(ctx, [[dx, floor], [dx, dTop], [dx + dw, dTop - 2], [dx + dw, floor]], r,
        { width: 2, alpha: 0.86 });
      // a folded chair in the dark, in three strokes
      stroke(ctx, [[dx + 8, floor - 4], [dx + dw * 0.4, dTop + 10], [dx + dw - 8, floor - 6]], r,
        { width: 1.6, alpha: 0.55, passes: 1, color: CREAM });
    } else if (state > 0.28) {
      poly(ctx, [[dx, floor], [dx, dTop], [dx + dw, dTop - 2], [dx + dw, floor]], r,
        { width: 2, alpha: 0.86 });
      // shut, with the season's bar across it
      line(ctx, dx - 3, dTop + 26, dx + dw + 3, dTop + 24, r, { width: 3.4, alpha: 0.72 });
      scribbleCircle(ctx, dx + dw / 2, dTop + 25, 4, r, { width: 1.4, alpha: 0.6 }, 1.2);
    } else {
      // boarded: two planks nailed across, and nobody has been for years
      poly(ctx, [[dx, floor], [dx, dTop], [dx + dw, dTop - 2], [dx + dw, floor]], r,
        { width: 2, alpha: 0.7 });
      for (let i = 0; i < 2; i++) {
        line(ctx, dx - 5, dTop + 14 + i * 22, dx + dw + 5, dTop + 10 + i * 22, r,
          { width: 3, alpha: 0.66 });
      }
    }

    // windows: one, two, or a long light — never the same porthole
    const wx = leftDoor ? dx + dw + 14 + r() * 10 : bx + 12 + r() * 8;
    const wKind = Math.floor(r() * 3);
    if (wKind === 0) {
      poly(ctx, [[wx, top + 22], [wx, top + 46], [wx + 30, top + 45], [wx + 30, top + 21]], r,
        { width: 1.6, alpha: 0.8 });
      line(ctx, wx + 15, top + 21, wx + 15, top + 46, r, { width: 1, alpha: 0.5, passes: 1 }, 3);
    } else if (wKind === 1) {
      poly(ctx, [[wx, top + 20], [wx, top + 40], [wx + 46, top + 39], [wx + 46, top + 19]], r,
        { width: 1.6, alpha: 0.8 });
      line(ctx, wx, top + 30, wx + 46, top + 29, r, { width: 1, alpha: 0.44, passes: 1 });
    } else {
      for (let i = 0; i < 2; i++) {
        poly(ctx, [[wx + i * 26, top + 24], [wx + i * 26, top + 42],
          [wx + i * 26 + 18, top + 41], [wx + i * 26 + 18, top + 23]], r,
          { width: 1.5, alpha: 0.78 });
      }
    }

    // the roof: shallow, felted, and its own pitch
    const rl = bx - 10 - r() * 8;
    const rr2 = bx + bw + 10 + r() * 8;
    fillPoly(ctx, [[rl, top + 2], [96, top - pitch], [rr2, top - 1]], '#5f5c56', 0.34);
    stroke(ctx, [[rl, top + 2], [96, top - pitch], [rr2, top - 1]], r, { width: 2.6, alpha: 0.9 });
    line(ctx, rl, top + 2, rr2, top - 1, r, { width: 2, alpha: 0.7 });
    hatch(ctx, bx, top - pitch + 2, bw, pitch, 0.06, 5.5, r, { alpha: 0.16 });
    // a chimney of a stovepipe on some of them
    if (r() > 0.6) {
      const cx2 = 96 + (r() - 0.5) * 50;
      line(ctx, cx2, top - pitch * 0.6, cx2 + (r() - 0.5) * 4, top - pitch - 16, r,
        { width: 2.2, alpha: 0.82 });
    }

    // the steps down to the sand, under the door
    for (let i = 0; i < 3; i++) {
      line(ctx, dx - 4 - i * 4, floor + 8 + i * 11, dx + dw + 4 + i * 4, floor + 8 + i * 11, r,
        { width: 2, alpha: 0.64 - i * 0.1, passes: 1 });
    }
    // a veranda rail on one in three
    if (r() > 0.66) {
      line(ctx, bx + 4, floor + 4, bx + bw - 4, floor + 2, r, { width: 2, alpha: 0.6 });
      for (let x = bx + 10; x < bx + bw - 6; x += 22 + r() * 10) {
        line(ctx, x, floor + 4, x, floor - 12, r, { width: 1.4, alpha: 0.5, passes: 1 }, 2);
      }
    }
  });
}

/** A groyne: tarred piles marching into the sea, low and getting lower.
 *  The `decay` variant has lost most of its planking to the water. */
export function groyneTexture(seed: number, decay = false): THREE.CanvasTexture {
  return makeTexture(320, 96, seed, (ctx, r) => {
    const base = 88;
    const n = 9;
    for (let i = 0; i < n; i++) {
      const x = 14 + i * 34 + (r() - 0.5) * 5;
      // the piles get shorter seaward and the far ones are half gone
      const fall = Math.pow(i / (n - 1), 1.4);
      let h = 58 * (1 - fall * 0.78) + r() * 6;
      if (decay && r() > 0.45) h *= 0.35;
      line(ctx, x, base, x + (r() - 0.5) * 3, base - h, r,
        { width: 3.4 - fall * 1.2, alpha: 0.88 - fall * 0.22, color: TAR });
      // the pile's split top
      if (h > 22 && r() > 0.5) {
        line(ctx, x, base - h, x + (r() - 0.5) * 7, base - h - 5 - r() * 6, r,
          { width: 1.6, alpha: 0.6, passes: 1, color: TAR }, 2);
      }
    }
    // the planking between them: a long horizontal, broken
    if (!decay) {
      let x = 12;
      while (x < 300) {
        const w = 26 + r() * 44;
        line(ctx, x, base - 34 + r() * 6, x + w, base - 32 + (r() - 0.5) * 8, r,
          { width: 2.4, alpha: 0.6, color: TAR });
        x += w + 6 + r() * 22;
      }
    } else {
      for (let i = 0; i < 3; i++) {
        const x = 14 + r() * 200;
        line(ctx, x, base - 24 + r() * 12, x + 20 + r() * 26, base - 22 + (r() - 0.5) * 10, r,
          { width: 2, alpha: 0.4, color: TAR });
      }
    }
    // weed on the wet ends
    for (let i = 0; i < 5; i++) {
      const x = 140 + r() * 170;
      stroke(ctx, [[x, base], [x + 5 + r() * 5, base - 8 - r() * 8]], r,
        { width: 1.4, alpha: 0.3, passes: 1 });
    }
  });
}

/** The boardwalk's deck: planks across, worn to the grain, sand in the
 *  gaps. A decal, so it lies along whatever the page does under it. */
export function boardwalkDecal(seed: number): THREE.CanvasTexture {
  return makeTexture(256, 160, seed, (ctx, r) => {
    // The deck runs EDGE TO EDGE. Round 2 drew it inside a margin and
    // the promenade came out as nine separate mats laid on the sand.
    ctx.save();
    ctx.globalAlpha = 0.34;
    ctx.fillStyle = BLEACH;
    ctx.fillRect(0, 0, 256, 160);
    ctx.restore();
    // two stringers running the length, then planks across them
    line(ctx, 0, 22, 256, 20, r, { width: 1.6, alpha: 0.3, passes: 1 });
    line(ctx, 0, 140, 256, 138, r, { width: 1.6, alpha: 0.3, passes: 1 });
    // The planks are a WHISPER. Round 1 drew them at width 1.8 and
    // alpha 0.6 and the deck came out a black comb across the frame:
    // a plank line is a seam between two boards, not a drawn edge.
    let x = -2;
    while (x < 258) {
      const gap = 11 + r() * 7;
      const a = 0.14 + r() * 0.12;
      line(ctx, x, -2, x + (r() - 0.5) * 5, 162, r,
        { width: 1.2, alpha: a, passes: 1, jitter: 1.1 });
      if (r() > 0.88) {
        line(ctx, x + 2, 40 + r() * 40, x + 3, 110 + r() * 20, r,
          { width: 1, alpha: 0.12, passes: 1 }, 3);
      }
      x += gap;
    }
    // the wear down the middle where everybody walks
    hatch(ctx, 0, 54, 256, 52, 0.02, 9, r, { alpha: 0.09 });
    // sand drifted over the long edges
    for (let i = 0; i < 18; i++) {
      const sx = r() * 250;
      const sy = r() > 0.5 ? r() * 14 : 146 + r() * 14;
      line(ctx, sx, sy, sx + 7 + r() * 12, sy + (r() - 0.5) * 6, r,
        { width: 1.3, alpha: 0.16, passes: 1 }, 2);
    }
  });
}

/** The boardwalk's rail: a long low horizontal on stubby posts, with
 *  the paint gone off the top where hands go. */
export function boardwalkRailTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(512, 112, seed, (ctx, r) => {
    const base = 104;
    for (let x = 16; x < 500; x += 56 + r() * 18) {
      line(ctx, x, base, x + (r() - 0.5) * 3, 34 + r() * 8, r, { width: 3.2, alpha: 0.86 });
    }
    // the top rail and the mid rail, each bowed its own way
    peeled(ctx, 8, 26, 496, 12, r, SALT_BLUE, 0.4, 0.8);
    line(ctx, 8, 32, 504, 30, r, { width: 3.4, alpha: 0.9 });
    line(ctx, 10, 66, 502, 64, r, { width: 2.2, alpha: 0.62 });
    // a fishing rod-rest clamped on, and a lost glove
    if (seed % 2 === 0) {
      line(ctx, 300, 32, 316, 12, r, { width: 1.8, alpha: 0.7 });
      scribbleCircle(ctx, 318, 9, 4, r, { width: 1.3, alpha: 0.6 }, 1.4);
    }
  });
}

/**
 * THE CUT's outer edge: a tarred post with a red cap, and the eye the
 * rope runs through. Nine of these mark the ledge, and they are the
 * only red on this coast — a colour that means *the way is here*.
 */
export function cutPostTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(48, 128, seed, (ctx, r) => {
    const lean = (r() - 0.5) * 7;
    line(ctx, 24, 126, 24 + lean, 18, r, { width: 3.6, alpha: 0.9, color: TAR });
    // the red cap: a painted taper, and half gone
    const cap: [number, number][] = [
      [16 + lean, 36], [19 + lean, 15], [24 + lean, 9], [29 + lean, 15], [32 + lean, 35],
    ];
    peeledPoly(ctx, cap, r, RED, 0.85, 0.45);
    poly(ctx, cap, r, { width: 1.6, alpha: 0.75 });
    // the rope's eye
    scribbleCircle(ctx, 24 + lean * 0.7, 44, 4.4, r, { width: 1.5, alpha: 0.75 }, 1.3);
    // stones wedged at the foot to hold it
    stroke(ctx, [[12, 124], [18, 116], [26, 120]], r, { width: 1.3, alpha: 0.5, passes: 1 });
  });
}

/**
 * A ROPED RUN along the ledge's outer edge — three posts and the rope
 * sagging between them, drawn as ONE standee so the rope always
 * connects. Nine metres of "the drop is here, and somebody knew it
 * would be, and did something about it."
 */
export function cutRopeRunTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(384, 128, seed, (ctx, r) => {
    const base = 122;
    const posts = [40, 190, 344].map((x) => x + (r() - 0.5) * 18);
    const tops = posts.map(() => 30 + r() * 12);
    posts.forEach((x, i) => {
      const lean = (r() - 0.5) * 8;
      line(ctx, x, base, x + lean, tops[i], r, { width: 4, alpha: 0.9, color: TAR });
      const cap: [number, number][] = [
        [x + lean - 8, tops[i] + 12], [x + lean - 6, tops[i] - 2],
        [x + lean, tops[i] - 7], [x + lean + 6, tops[i] - 2],
        [x + lean + 8, tops[i] + 11],
      ];
      peeledPoly(ctx, cap, r, RED, 0.85, 0.5);
      poly(ctx, cap, r, { width: 1.5, alpha: 0.75 });
      // stones wedged at the foot
      stroke(ctx, [[x - 13, base], [x - 6, base - 8], [x + 4, base - 2]], r,
        { width: 1.3, alpha: 0.46, passes: 1 });
    });
    // the rope: two catenaries, each sagging its own amount, because
    // nobody ever tensioned two spans the same
    for (let i = 0; i < 2; i++) {
      const x0 = posts[i];
      const x1 = posts[i + 1];
      const y0 = tops[i] + 14;
      const y1 = tops[i + 1] + 14;
      const sag = 24 + r() * 18;
      const pts: [number, number][] = [];
      for (let k = 0; k <= 10; k++) {
        const t = k / 10;
        pts.push([x0 + (x1 - x0) * t, y0 + (y1 - y0) * t + Math.sin(t * Math.PI) * sag]);
      }
      stroke(ctx, pts, r, { width: 2.4, alpha: 0.72, jitter: 1 });
      // the rope's lay: short ticks along it
      for (let k = 1; k < 10; k += 2) {
        const [px, py] = pts[k];
        line(ctx, px - 2, py - 2, px + 2, py + 2, r, { width: 1, alpha: 0.3, passes: 1 }, 2);
      }
    }
    // thrift and sea-campion at the posts' feet
    for (let i = 0; i < 6; i++) {
      const gx = 20 + r() * 344;
      for (let k = 0; k < 3; k++) {
        stroke(ctx, [[gx + k * 3, base], [gx + k * 3 + (r() - 0.5) * 5, base - 7 - r() * 6]], r,
          { width: 1, alpha: 0.4, passes: 1 });
      }
    }
  });
}

/**
 * THE CUT's inner wall: the rock somebody took out of this hillside,
 * seen from inside the cutting. Struck faces, drill scars, and the
 * hatching running DOWN the face — the same mark the terrain shader
 * makes on a real cliff, drawn here at foreground pressure so the wall
 * and the ground behind it read as one piece of stone.
 */
/**
 * THE CHISEL MARKS — the half-round grooves a jumper bar leaves, on the
 * floor of the cutting where the rock was split out.
 *
 * Three rounds of the gate rejected a standee for this job, and all
 * three verdicts were the same: a pale slab hung across the headland.
 * They were right, and the reason is the session's own thesis — THE
 * CLIFF IS THE GROUND. A drawing standing in front of a cliff can only
 * ever be a drawing standing in front of a cliff. So the one thing the
 * height field cannot say, which is that a PERSON made this, is said by
 * a mark lying ON the page instead: paired grooves, spalled edges, and
 * the wear of everybody who has walked it since.
 */
export function chiselMarksDecal(seed: number): THREE.CanvasTexture {
  return makeTexture(192, 160, seed, (ctx, r) => {
    // the drill grooves: pairs, running the way the bar went in
    const ang = -0.5 + r() * 1.0;
    for (let i = 0; i < 4; i++) {
      const x = 22 + r() * 148;
      const y = 20 + r() * 108;
      const len = 22 + r() * 34;
      const dx = Math.cos(ang) * len;
      const dy = Math.sin(ang) * len;
      line(ctx, x, y, x + dx, y + dy, r,
        { width: 2.6, alpha: 0.26, passes: 1, jitter: 0.4 }, 4);
      line(ctx, x + 4, y + 2, x + dx + 4, y + dy + 2, r,
        { width: 1.2, alpha: 0.17, passes: 1, jitter: 0.35 }, 4);
    }
    // spalled edges where the rock let go, drawn as short angular breaks
    for (let i = 0; i < 7; i++) {
      const x = 14 + r() * 160;
      const y = 14 + r() * 128;
      const sz = 6 + r() * 13;
      stroke(ctx, [
        [x, y], [x + sz * (0.4 + r() * 0.6), y - sz * (0.2 + r() * 0.5)],
        [x + sz * 1.3, y + sz * (0.1 + r() * 0.4)], [x + sz * 0.5, y + sz * 0.7],
      ], r, { width: 1.3, alpha: 0.22 + r() * 0.14, passes: 1, jitter: 1.1 });
    }
    // the wear: a soft lane down the middle where everybody walks
    hatch(ctx, 26, 44, 140, 60, ang, 7, r, { alpha: 0.08 });
    // grit
    for (let i = 0; i < 22; i++) {
      const x = 10 + r() * 170;
      const y = 10 + r() * 140;
      line(ctx, x, y, x + 2 + r() * 3, y + (r() - 0.5) * 3, r,
        { width: 1.1, alpha: 0.14, passes: 1 }, 2);
    }
  });
}

/** A sea stack at the cliff's foot: what is left when the tear went
 *  round something twice. Waterline flat, hatched, weeded at the base. */
export function seaStackTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(224, 256, seed, (ctx, r) => {
    const wl = 236; // the waterline: everything is cut off flat here
    const lean = (r() - 0.5) * 22;
    // angular, undercut, and NOT a dome: a stack is what is left when
    // the sea has taken everything either side of it
    const pts: [number, number][] = [
      [56 + lean * 0.2, wl],
      [40 + lean * 0.4, 174],
      [52 + lean * 0.7, 108],
      [40 + lean * 0.9, 72],
      [84 + lean, 30 + r() * 22],
      [122 + lean, 18 + r() * 16],
      [150 + lean * 0.9, 62],
      [172 + lean * 0.7, 106],
      [160 + lean * 0.4, 176],
      [172 + lean * 0.2, wl],
    ];
    fillPoly(ctx, pts, WASH.castle, 0.6);
    poly(ctx, pts, r, { width: 3.2, alpha: 0.94, jitter: 2.2 });
    // bedding: near-horizontal strata, because this rock lies in beds
    for (let i = 0; i < 6; i++) {
      const y = 60 + i * 28 + (r() - 0.5) * 10;
      stroke(ctx, [[38, y + 8], [110, y], [180, y + 6]], r,
        { width: 1.3, alpha: 0.26, passes: 1, jitter: 1.6 });
    }
    hatch(ctx, 120, 60, 68, 160, 1.5, 6, r, { alpha: 0.2 });
    // the dark wet band the tide keeps, and weed under it
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = INK;
    ctx.fillRect(30, wl - 26, 158, 26);
    ctx.globalAlpha = 1;
    for (let i = 0; i < 8; i++) {
      const wx = 36 + r() * 146;
      stroke(ctx, [[wx, wl], [wx + 5 + r() * 6, wl - 8 - r() * 9]], r,
        { width: 1.5, alpha: 0.34, passes: 1 });
    }
    // gulls on the ledges — two, never three in a row
    if (seed % 2 === 0) {
      for (const [gx, gy] of [[86, 62], [140, 104]] as [number, number][]) {
        ctx.globalAlpha = 0.7;
        ctx.fillStyle = INK;
        ctx.beginPath();
        ctx.ellipse(gx, gy, 5, 3, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        line(ctx, gx + 5, gy - 1, gx + 9, gy - 2, r, { width: 1, alpha: 0.6, passes: 1 }, 2);
      }
    }
  });
}

/** The cairn on the point: seven stones somebody balanced, and a rag
 *  of flag on a driftwood pole. The world's westernmost mark. */
export function cairnTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(128, 192, seed, (ctx, r) => {
    let y = 186;
    let w = 46;
    for (let i = 0; i < 7; i++) {
      const hgt = 16 - i * 1.4 + r() * 5;
      const cx = 64 + (r() - 0.5) * (10 - i);
      const pts: [number, number][] = [
        [cx - w / 2, y],
        [cx - w / 2 + 3 + r() * 4, y - hgt],
        [cx + w / 2 - 4 - r() * 4, y - hgt - r() * 3],
        [cx + w / 2, y - r() * 3],
      ];
      fillPoly(ctx, pts, WASH.castle, 0.46);
      poly(ctx, pts, r, { width: 1.9, alpha: 0.86, jitter: 1.2 });
      hatch(ctx, cx - w / 2 + 4, y - hgt + 2, w * 0.4, hgt - 3, 1.4, 4, r, { alpha: 0.14 });
      y -= hgt + 1.5;
      w *= 0.86;
    }
    // the pole, wedged in the top, and a rag that has given up
    line(ctx, 64, y + 4, 67, 24, r, { width: 2.4, alpha: 0.88 });
    fillPoly(ctx, [[67, 26], [96, 34], [90, 48], [67, 48]], RED, 0.55);
    poly(ctx, [[67, 26], [96, 34], [90, 48], [67, 48]], r, { width: 1.4, alpha: 0.7 });
    for (let i = 0; i < 3; i++) {
      line(ctx, 90 + r() * 5, 36 + i * 5, 98 + r() * 6, 40 + i * 5, r,
        { width: 1, alpha: 0.42, passes: 1 }, 2);
    }
  });
}

/** A boat pulled up the sand and left on its side, which is what a boat
 *  on a beach actually looks like. Waterline nowhere: this one is dry. */
export function beachedBoatTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(224, 112, seed, (ctx, r) => {
    const roll = 0.16 + r() * 0.2;
    const sheer: [number, number][] = [
      [14, 74], [46, 58 - roll * 16], [110, 50 - roll * 20],
      [176, 56 - roll * 16], [210, 72],
    ];
    const keel: [number, number][] = [[210, 72], [172, 96], [104, 100], [44, 94], [14, 74]];
    fillPoly(ctx, [...sheer, ...keel], HULL, 0.34);
    stroke(ctx, sheer, r, { width: 2.6, alpha: 0.9 });
    stroke(ctx, keel, r, { width: 2.6, alpha: 0.9 });
    // the strakes: three long horizontals, the coast's own mark
    for (let i = 0; i < 3; i++) {
      stroke(ctx, [[20 + i * 3, 78 + i * 5], [104, 68 + i * 9 - roll * 14], [204 - i * 3, 76 + i * 5]], r,
        { width: 1.2, alpha: 0.3, passes: 1 });
    }
    // a red stripe under the gunwale, salt-eaten
    ctx.save();
    ctx.globalAlpha = 0.4;
    ctx.strokeStyle = RED;
    ctx.lineWidth = 3.4;
    ctx.setLineDash([14 + r() * 10, 5 + r() * 9]);
    ctx.beginPath();
    ctx.moveTo(20, 76);
    ctx.quadraticCurveTo(110, 56 - roll * 18, 204, 74);
    ctx.stroke();
    ctx.restore();
    // the prop under her, and one oar leaned on the gunwale
    line(ctx, 60, 98, 58, 108, r, { width: 2.4, alpha: 0.7 });
    line(ctx, 30, 100, 190, 56 - roll * 14, r, { width: 2, alpha: 0.6 });
    fillPoly(ctx, [[186, 62 - roll * 14], [206, 52 - roll * 14], [208, 60 - roll * 14], [190, 68 - roll * 14]],
      INK, 0.3);
    // a name, or the ghost of one — scratches, never letters
    for (let i = 0; i < 5; i++) {
      line(ctx, 120 + i * 9, 76, 124 + i * 9, 86, r, { width: 1, alpha: 0.2, passes: 1 }, 2);
    }
  });
}

/** A lobster pot: withies over a hoop, with the net's slack in it. */
export function lobsterPotTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(96, 80, seed, (ctx, r) => {
    /* Round 6 of the gate: a pot drawn as a wire dome with the netting
     * cross-hatched over it came out as a circus tent. A creel is a LOW
     * thing — wider than it is tall, dark and solid down at the bottom
     * where the ballast is, and open wicker only over the top. */
    const cx = 48;
    const base = 70;
    // the ballasted base: a dark band, and the frame's feet
    fillPoly(ctx, [[10, base], [14, base - 16], [82, base - 16], [86, base]], INK, 0.26);
    poly(ctx, [[10, base], [14, base - 16], [82, base - 16], [86, base]], r,
      { width: 2, alpha: 0.85 });
    // three hoops over it, flattened
    for (let i = 0; i < 3; i++) {
      const t = i / 2;
      const x0 = 15 + t * 20;
      stroke(ctx, [[x0, base - 15], [cx + (t - 0.5) * 14, 32 + t * 5],
        [81 - t * 20, base - 15]], r,
        { width: 1.6, alpha: 0.66, passes: 1 });
    }
    // the wicker, along the hoops only, never crossed
    for (let i = 0; i < 4; i++) {
      const y = 40 + i * 8;
      stroke(ctx, [[18 + i * 2, y + 4], [cx, y], [78 - i * 2, y + 4]], r,
        { width: 1.1, alpha: 0.24, passes: 1 });
    }
    // the eye and its rope
    scribbleCircle(ctx, cx, 30, 5, r, { width: 1.3, alpha: 0.5 }, 1.3);
    if (seed % 2 === 0) stroke(ctx, [[cx, 26], [68, 16], [90, 22]], r, { width: 1.3, alpha: 0.42, passes: 1 });
  });
}

/** A windsock on the boardwalk — the one instrument on this coast, and
 *  the only thing that will tell you the wind is real. */
export function windsockTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(128, 176, seed, (ctx, r) => {
    line(ctx, 22, 170, 24, 26, r, { width: 3, alpha: 0.9 });
    scribbleCircle(ctx, 30, 30, 8, r, { width: 1.6, alpha: 0.7 }, 1.2);
    // the sock: three bands, full, streaming right
    const mouth = 30;
    const bands: [number, number, number][] = [[38, 22, 20], [66, 19, 16], [96, 15, 12]];
    let px = mouth;
    let ph = 24;
    for (const [bx, bh, _w] of bands) {
      const col = px === mouth ? RED : (bx === 66 ? CREAM : RED);
      fillPoly(ctx, [[px, 30 - ph / 2 + 12], [bx, 30 - bh / 2 + 14], [bx, 30 + bh / 2 + 14], [px, 30 + ph / 2 + 12]],
        col, 0.55);
      poly(ctx, [[px, 30 - ph / 2 + 12], [bx, 30 - bh / 2 + 14], [bx, 30 + bh / 2 + 14], [px, 30 + ph / 2 + 12]],
        r, { width: 1.4, alpha: 0.7 });
      px = bx;
      ph = bh;
    }
    // the stay, and the guy to the deck
    line(ctx, 24, 60, 8, 168, r, { width: 1.2, alpha: 0.4, passes: 1 });
  });
}

/** The doodle gull, in four postures. Session 1 had one two-arc glyph
 *  and ten copies of it patrolling; a flock of identical marks is the
 *  array-look with feathers on. */
export function gullTexture(seed: number, pose: 0 | 1 | 2 | 3): THREE.CanvasTexture {
  return makeTexture(96, 72, seed, (ctx, r) => {
    if (pose === 0) {
      // glide: the two-arc doodle, the oldest mark in the book
      stroke(ctx, [[8, 40], [30, 22], [48, 36]], r, { width: 2.2, alpha: 0.8, passes: 1 });
      stroke(ctx, [[48, 36], [66, 20], [88, 38]], r, { width: 2.2, alpha: 0.8, passes: 1 });
    } else if (pose === 1) {
      // downbeat: the arcs bend the other way and the body shows
      stroke(ctx, [[10, 22], [30, 40], [48, 30]], r, { width: 2.2, alpha: 0.82, passes: 1 });
      stroke(ctx, [[48, 30], [68, 42], [88, 24]], r, { width: 2.2, alpha: 0.82, passes: 1 });
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = INK;
      ctx.beginPath();
      ctx.ellipse(48, 32, 6, 3.4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    } else if (pose === 2) {
      // standing, side on, looking at the sea like everybody else
      ctx.globalAlpha = 0.66;
      ctx.fillStyle = INK;
      ctx.beginPath();
      ctx.ellipse(46, 36, 18, 9, -0.12, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      stroke(ctx, [[28, 34], [22, 26], [26, 22]], r, { width: 2, alpha: 0.85, passes: 1 });
      line(ctx, 20, 24, 12, 26, r, { width: 1.6, alpha: 0.8, passes: 1 }, 2);
      line(ctx, 44, 44, 43, 58, r, { width: 1.4, alpha: 0.7 }, 2);
      line(ctx, 54, 44, 55, 58, r, { width: 1.4, alpha: 0.7 }, 2);
      stroke(ctx, [[56, 32], [70, 30], [64, 40]], r, { width: 1.4, alpha: 0.5, passes: 1 });
    } else {
      // calling: head back, beak open, the whole reason to hate them
      ctx.globalAlpha = 0.66;
      ctx.fillStyle = INK;
      ctx.beginPath();
      ctx.ellipse(48, 40, 17, 8.5, 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      stroke(ctx, [[32, 36], [26, 22], [32, 14]], r, { width: 2, alpha: 0.85, passes: 1 });
      line(ctx, 30, 15, 18, 8, r, { width: 1.6, alpha: 0.8, passes: 1 }, 2);
      line(ctx, 31, 20, 19, 18, r, { width: 1.4, alpha: 0.7, passes: 1 }, 2);
      line(ctx, 46, 48, 45, 60, r, { width: 1.4, alpha: 0.7 }, 2);
      line(ctx, 56, 48, 57, 60, r, { width: 1.4, alpha: 0.7 }, 2);
    }
  });
}

/** Rock on the foreshore — what the cliff has been dropping for as long
 *  as there has been a cliff. Angular, bedded, weeded on the wet side. */
export function shoreRockTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(224, 128, seed, (ctx, r) => {
    /* Round 1 of the gate got a field of grey DOMES and called it an
     * array with pebbles in it. Foreshore rock is not round: it is what
     * a cliff drops, so it is angular, it lies at whatever angle it
     * landed at, and it comes in HEAPS of three and four rather than
     * one at a time. Each drawing here is a small outcrop, not a stone. */
    const base = 118;
    const n = 2 + Math.floor(r() * 3);
    for (let k = 0; k < n; k++) {
      const cx = 34 + k * (52 + r() * 22) + (r() - 0.5) * 14;
      const w = 34 + r() * 40;
      const h = 26 + r() * 40;
      const tilt = (r() - 0.5) * 0.5;
      const pts: [number, number][] = [
        [cx - w * 0.55, base],
        [cx - w * 0.5 + tilt * 14, base - h * 0.5],
        [cx - w * 0.18 + tilt * 20, base - h],
        [cx + w * 0.24 + tilt * 18, base - h * (0.82 + r() * 0.2)],
        [cx + w * 0.52 + tilt * 8, base - h * 0.34],
        [cx + w * 0.55, base],
      ];
      fillPoly(ctx, pts, WASH.castle, 0.58);
      poly(ctx, pts, r, { width: 2.4, alpha: 0.9, jitter: 1.4 });
      // one hard struck face per rock, hatched down it
      hatch(ctx, cx - w * 0.1, base - h * 0.86, w * 0.5, h * 0.8,
        1.42 + tilt, 4.5, r, { alpha: 0.22 });
      // bedding, and the wet band the tide keeps at the foot
      for (let i = 0; i < 2; i++) {
        stroke(ctx, [[cx - w * 0.44, base - h * (0.28 + i * 0.24)],
          [cx, base - h * (0.34 + i * 0.26)],
          [cx + w * 0.46, base - h * (0.24 + i * 0.22)]], r,
          { width: 1.1, alpha: 0.26, passes: 1, jitter: 1.2 });
      }
      ctx.globalAlpha = 0.2;
      ctx.fillStyle = INK;
      ctx.fillRect(cx - w * 0.55, base - 9, w * 1.1, 9);
      ctx.globalAlpha = 1;
    }
    for (let i = 0; i < 7; i++) {
      const wx = 16 + r() * 190;
      stroke(ctx, [[wx, base], [wx + 4 + r() * 6, base - 8 - r() * 10]], r,
        { width: 1.4, alpha: 0.32, passes: 1 });
    }
  });
}

/* ==================== THE WIDE BLUE ==================== */

/**
 * A REGATTA BOAT. Heel is BAKED IN — a dinghy sailing hard is not a
 * dinghy leaning; the whole rig goes over together and the hull shows
 * its bilge. Two heels and four hulls give eight silhouettes, which is
 * what keeps four boats in one frame from reading as four copies.
 *
 * The waterline rule: everything stops flat at the water and gets one
 * short hatch of reflection under it. Nothing is drawn below that.
 */
export function regattaBoatTexture(
  seed: number, heel: 0 | 1, sailCol: 0 | 1 | 2
): THREE.CanvasTexture {
  return makeTexture(192, 224, seed, (ctx, r) => {
    /* Round 2 of the gate saw four duck decoys. At thirty units out a
     * boat is forty pixels tall, so detail is thrown away and only the
     * SILHOUETTE survives: a tall mast, one big triangle, a dark hull
     * sitting low. Everything here is drawn for that read. Heel is
     * baked in — a dinghy sailing hard does not lean, the whole rig goes
     * over together and she shows her bilge to windward. */
    const wl = 182;
    const k = heel ? 1 : 0.42;
    const mastX = 78 + k * 46;
    const mastTop = 12 + k * 16;
    const bow = 158 - k * 10;
    const stern = 44 + k * 8;
    const sailTint = [CREAM, '#e7d9bd', '#dfe3e6'][sailCol];

    // THE MAINSAIL first, because it is nine tenths of the read: a full
    // triangle with a curved leech, big enough to be a sail at any size
    const head: [number, number] = [mastX + 2, mastTop + 4];
    const tack: [number, number] = [80, wl - 24 - k * 12];
    const clew: [number, number] = [10 + k * 26, wl - 58 - k * 28];
    const belly: [number, number] = [
      (head[0] + clew[0]) / 2 - 22 - k * 10,
      (head[1] + clew[1]) / 2 + 10,
    ];
    fillPoly(ctx, [head, tack, clew, belly], sailTint, 0.86);
    stroke(ctx, [head, tack, clew], r, { width: 2.8, alpha: 0.92 });
    stroke(ctx, [clew, belly, head], r, { width: 2.8, alpha: 0.92 });
    // two seams only: any more is noise at this size
    for (const t of [0.36, 0.68]) {
      stroke(ctx, [
        [head[0] + (tack[0] - head[0]) * t, head[1] + (tack[1] - head[1]) * t],
        [head[0] + (belly[0] - head[0]) * t - 5, head[1] + (belly[1] - head[1]) * t],
        [head[0] + (clew[0] - head[0]) * t, head[1] + (clew[1] - head[1]) * t],
      ], r, { width: 1.2, alpha: 0.3, passes: 1 });
    }

    // the jib, overlapping FORWARD of the mast — this is what makes two
    // boats crossing read as two boats and not as one lump
    const jt: [number, number] = [mastX - 3, mastTop + 30];
    const jc: [number, number] = [134 + k * 18, wl - 66 - k * 20];
    const jf: [number, number] = [146 - k * 8, wl - 24 - k * 8];
    fillPoly(ctx, [jt, jf, jc], sailTint, 0.7);
    stroke(ctx, [jt, jf, jc, jt], r, { width: 2.2, alpha: 0.88 });

    // mast and boom, over the sail so the spar reads as a spar
    line(ctx, 80, wl - 19 - k * 9, mastX, mastTop, r, { width: 3, alpha: 0.94 });
    line(ctx, 80, wl - 22 - k * 11, 14 + k * 24, wl - 54 - k * 26, r,
      { width: 2.4, alpha: 0.9 });

    // THE HULL: dark, low, and finished with a hard flat waterline
    // A dinghy is nearly all rig. Round 6 of the gate drew a hull as
    // long as the mast was tall and the fleet read as canoes with
    // leaves stuck in them; a boat's hull is two thirds of its mast and
    // it sits LOW, showing mostly topsides and a lot of sky.
    const hull: [number, number][] = [
      [stern, wl], [stern + 7, wl - 15 - k * 7], [92, wl - 20 - k * 10],
      [bow - 7, wl - 13 - k * 5], [bow, wl],
    ];
    fillPoly(ctx, hull, HULL, 0.32);
    stroke(ctx, hull, r, { width: 2.6, alpha: 0.9 });
    line(ctx, stern, wl, bow, wl, r, { width: 2.6, alpha: 0.9 });
    if (seed % 3 === 0) {
      ctx.save();
      ctx.globalAlpha = 0.6;
      ctx.strokeStyle = RED;
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(stern + 7, wl - 6);
      ctx.quadraticCurveTo(92, wl - 11 - k * 7, bow - 7, wl - 5);
      ctx.stroke();
      ctx.restore();
    }
    // the burgee: this land's only colour aloft
    fillPoly(ctx, [[mastX, mastTop], [mastX + 22, mastTop + 6], [mastX, mastTop + 13]], RED, 0.8);
    // crew hiked out over the windward rail. No face.
    const cx = 56 + k * 8;
    ctx.globalAlpha = 0.72;
    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.ellipse(cx, wl - 28 - k * 15, 8.5, 4.6, -0.55 - k * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx - 8, wl - 35 - k * 19, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    line(ctx, cx + 6, wl - 25 - k * 12, 78, wl - 16 - k * 7, r, { width: 2, alpha: 0.8 }, 2);
    // THE WATERLINE: reflection hatch, a bow wave, and nothing below
    hatch(ctx, stern, wl + 2, bow - stern, 15, 0.02, 4, r, { alpha: 0.15 });
    line(ctx, bow - 16, wl + 1, bow + 14, wl + 3, r, { width: 2, alpha: 0.38, passes: 1 }, 3);
    line(ctx, bow - 30, wl + 7, bow + 2, wl + 8, r, { width: 1.4, alpha: 0.22, passes: 1 }, 3);
  });
}

/** THE MARK: a bell buoy, the biggest thing floating in this world and
 *  the only one that makes a noise. */
export function bellBuoyTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(112, 176, seed, (ctx, r) => {
    const wl = 160;
    // the can: a fat cylinder with a wet band and a lot of rust
    // Round 6 of the gate: a red can under a dark wet band, an inked
    // cage and a hatched shadow came out as a BLACK BRICK on the water.
    // A buoy is a bright thing — it is painted to be seen from a long
    // way off — so the red stays up and the shadow comes down.
    fillPoly(ctx, [[26, wl], [22, 112], [30, 96], [82, 94], [90, 110], [86, wl]], RED, 0.72);
    poly(ctx, [[26, wl], [22, 112], [30, 96], [82, 94], [90, 110], [86, wl]], r,
      { width: 2.6, alpha: 0.9 });
    ctx.globalAlpha = 0.13;
    ctx.fillStyle = INK;
    ctx.fillRect(24, wl - 14, 62, 14);
    ctx.globalAlpha = 1;
    hatch(ctx, 68, 104, 20, 48, 1.5, 6, r, { alpha: 0.13 });
    // the cage: four legs and two rings, with the bell slung inside
    for (const x of [34, 80]) {
      line(ctx, x, 96, 48 + (x - 56) * 0.35, 30, r, { width: 2, alpha: 0.8 });
    }
    line(ctx, 30, 74, 84, 72, r, { width: 1.6, alpha: 0.6 });
    line(ctx, 36, 50, 78, 49, r, { width: 1.6, alpha: 0.6 });
    fillPoly(ctx, [[46, 52], [66, 52], [70, 74], [42, 74]], INK, 0.22);
    poly(ctx, [[46, 52], [66, 52], [70, 74], [42, 74]], r, { width: 1.8, alpha: 0.85 });
    line(ctx, 56, 74, 56, 82, r, { width: 1.4, alpha: 0.7 }, 2);
    // the topmark, and a gull who has claimed it
    line(ctx, 56, 30, 57, 12, r, { width: 2.2, alpha: 0.85 });
    poly(ctx, [[48, 12], [64, 12], [56, 0]], r, { width: 1.8, alpha: 0.8 });
    // waterline: reflection hatch only
    hatch(ctx, 22, wl + 2, 68, 12, 0.02, 4, r, { alpha: 0.14 });
  });
}

/** A working buoy: smaller, sillier, tethered. Three variants because
 *  three identical buoys in one frame is a bar violation. */
export function smallBuoyTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(72, 112, seed, (ctx, r) => {
    const wl = 98;
    const kind = seed % 3;
    if (kind === 0) {
      fillPoly(ctx, [[20, wl], [16, 62], [36, 42], [54, 62], [50, wl]], RED, 0.5);
      poly(ctx, [[20, wl], [16, 62], [36, 42], [54, 62], [50, wl]], r, { width: 2, alpha: 0.86 });
      line(ctx, 17, 74, 53, 73, r, { width: 3, alpha: 0.45 });
      line(ctx, 36, 42, 36, 24, r, { width: 1.8, alpha: 0.8 });
      scribbleCircle(ctx, 36, 21, 4, r, { width: 1.3, alpha: 0.8 });
    } else if (kind === 1) {
      // a float and a withy: a stick with a bit of rag, which is what
      // most sea marks in the world actually are
      line(ctx, 34, wl - 4, 38, 18, r, { width: 2.2, alpha: 0.85 });
      fillPoly(ctx, [[38, 20], [58, 26], [38, 32]], CREAM, 0.6);
      poly(ctx, [[38, 20], [58, 26], [38, 32]], r, { width: 1.3, alpha: 0.7 });
      scribbleCircle(ctx, 32, wl - 12, 10, r, { width: 1.8, alpha: 0.8 }, 1.3);
    } else {
      // a spar buoy: a long pole riding almost upright, weighted low,
      // with a cross topmark. Round 1 had a cream BOX here and it read
      // as a lost parcel.
      const lean = (r() - 0.5) * 8;
      line(ctx, 34, wl, 34 + lean, 14, r, { width: 3.4, alpha: 0.88 });
      fillPoly(ctx, [[26, wl], [28, wl - 22], [42, wl - 22], [44, wl]], CREAM, 0.55);
      poly(ctx, [[26, wl], [28, wl - 22], [42, wl - 22], [44, wl]], r,
        { width: 1.8, alpha: 0.8 });
      line(ctx, 24 + lean, 26, 46 + lean, 25, r, { width: 2, alpha: 0.8 }, 3);
      line(ctx, 30 + lean, 18, 40 + lean, 17, r, { width: 1.6, alpha: 0.7 }, 2);
    }
    hatch(ctx, 16, wl + 2, 40, 9, 0.02, 4, r, { alpha: 0.13 });
  });
}

/** A mooring post out on the bar: barnacled, leaning, with a rope that
 *  goes off somewhere. The near mark every framing out here needs. */
export function mooringPostTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(72, 176, seed, (ctx, r) => {
    const lean = (r() - 0.5) * 12;
    line(ctx, 34, 172, 34 + lean, 20, r, { width: 5, alpha: 0.9, color: TAR });
    // barnacles: a crust that stops dead at the old waterline
    for (let i = 0; i < 26; i++) {
      const t = 0.42 + Math.pow(r(), 0.7) * 0.56;
      const y = 20 + t * 152;
      const x = 34 + lean * (1 - t) + (r() - 0.5) * 11;
      scribbleCircle(ctx, x, y, 1.4 + r() * 2, r, { width: 0.9, alpha: 0.3 + r() * 0.2 }, 1.1);
    }
    // the split top and an iron ring
    line(ctx, 34 + lean, 20, 34 + lean + (r() - 0.5) * 9, 8, r,
      { width: 2, alpha: 0.6, passes: 1, color: TAR }, 2);
    scribbleCircle(ctx, 40 + lean, 44, 6, r, { width: 1.8, alpha: 0.75 }, 1.2);
    if (seed % 2 === 0) {
      stroke(ctx, [[45 + lean, 46], [58, 58], [70, 76]], r, { width: 1.6, alpha: 0.5, passes: 1 });
    }
    // weed at the foot, the wet band
    for (let i = 0; i < 4; i++) {
      const wx = 26 + r() * 18;
      stroke(ctx, [[wx, 170], [wx + 4 + r() * 5, 160 - r() * 8]], r,
        { width: 1.4, alpha: 0.32, passes: 1 });
    }
  });
}

/**
 * THE BAR'S OWN SURFACE — ripples in the sand the tide corrugated and
 * left. Drawn with the page's own broken hatch at a whisper of alpha,
 * because the point of the bar is that you are walking on the part the
 * wash MISSED, and a heavy mark there would make it a thing on the sea
 * instead of a hole in it.
 */
export function barRippleDecal(seed: number): THREE.CanvasTexture {
  return makeTexture(192, 192, seed, (ctx, r) => {
    const ang = 0.3 + r() * 0.5;
    for (let i = 0; i < 16; i++) {
      const y = 8 + i * 11 + (r() - 0.5) * 6;
      const pts: [number, number][] = [];
      for (let k = 0; k <= 8; k++) {
        pts.push([k * 24 - 8, y + Math.sin(k * 0.9 + i * 0.7) * (3 + r() * 3) + k * ang * 2]);
      }
      // a ripple is a broken line: the pen lifts where the sand is flat
      const cut = Math.floor(r() * 4);
      stroke(ctx, pts.slice(0, 5 + cut), r,
        { width: 1.3, alpha: 0.1 + r() * 0.09, passes: 1, jitter: 1.1 });
      if (r() > 0.4) {
        stroke(ctx, pts.slice(5 + cut), r,
          { width: 1.2, alpha: 0.08 + r() * 0.08, passes: 1, jitter: 1.1 });
      }
    }
    // a razor shell or two standing on end, and a worm cast
    for (let i = 0; i < 3; i++) {
      const x = 20 + r() * 150;
      const y = 20 + r() * 150;
      if (r() > 0.5) {
        line(ctx, x, y, x + 4 + r() * 6, y - 10 - r() * 8, r, { width: 1.4, alpha: 0.3, passes: 1 }, 2);
      } else {
        scribbleCircle(ctx, x, y, 3, r, { width: 1, alpha: 0.22 }, 2.6);
      }
    }
  });
}

/** A boat at her mooring, bare-masted, waiting for somebody. */
export function mooredBoatTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(208, 208, seed, (ctx, r) => {
    const wl = 176;
    fillPoly(ctx, [[24, wl], [30, wl - 20], [104, wl - 26], [176, wl - 18], [184, wl]], HULL, 0.3);
    stroke(ctx, [[24, wl], [30, wl - 20], [104, wl - 26], [176, wl - 18], [184, wl]], r,
      { width: 2.4, alpha: 0.9 });
    line(ctx, 24, wl, 184, wl, r, { width: 2.2, alpha: 0.85 });
    line(ctx, 32, wl - 12, 178, wl - 10, r, { width: 1.2, alpha: 0.3, passes: 1 });
    // the mast, bare, with the halyards slack against it
    line(ctx, 100, wl - 24, 104, 26, r, { width: 2.6, alpha: 0.9 });
    line(ctx, 103, 32, 98, wl - 26, r, { width: 1, alpha: 0.34, passes: 1 });
    line(ctx, 104, 30, 112, wl - 30, r, { width: 1, alpha: 0.3, passes: 1 });
    // the boom in its crutch, and a cover lashed over it
    line(ctx, 100, wl - 52, 44, wl - 44, r, { width: 2, alpha: 0.82 });
    fillPoly(ctx, [[50, wl - 46], [98, wl - 54], [98, wl - 38], [52, wl - 32]], '#9aa0a4', 0.4);
    for (let i = 0; i < 5; i++) {
      line(ctx, 56 + i * 9, wl - 46 + i, 56 + i * 9, wl - 32 + i, r,
        { width: 1, alpha: 0.28, passes: 1 }, 2);
    }
    // shrouds
    line(ctx, 104, 60, 62, wl - 24, r, { width: 1.1, alpha: 0.4, passes: 1 });
    line(ctx, 104, 60, 146, wl - 22, r, { width: 1.1, alpha: 0.4, passes: 1 });
    // the mooring line going down into the water and stopping
    stroke(ctx, [[178, wl - 16], [192, wl - 4], [196, wl]], r,
      { width: 1.6, alpha: 0.55, passes: 1 });
    hatch(ctx, 24, wl + 2, 160, 16, 0.02, 4, r, { alpha: 0.13 });
  });
}

/** A shoal in the shallows: a dozen short strokes all pointing the same
 *  way, which is the only thing a fish ever does. */
export function fishShoalDecal(seed: number): THREE.CanvasTexture {
  return makeTexture(128, 128, seed, (ctx, r) => {
    const heading = r() * Math.PI * 2;
    for (let i = 0; i < 14; i++) {
      const x = 16 + r() * 96;
      const y = 16 + r() * 96;
      const a = heading + (r() - 0.5) * 0.5;
      const len = 5 + r() * 5;
      stroke(ctx, [
        [x, y],
        [x + Math.cos(a) * len, y + Math.sin(a) * len],
      ], r, { width: 1.6, alpha: 0.34 + r() * 0.2, passes: 1 });
      // the tail's V
      const bx = x - Math.cos(a) * 1.5;
      const by = y - Math.sin(a) * 1.5;
      line(ctx, bx, by, bx - Math.cos(a + 0.6) * 4, by - Math.sin(a + 0.6) * 4, r,
        { width: 1.1, alpha: 0.26, passes: 1 }, 2);
      line(ctx, bx, by, bx - Math.cos(a - 0.6) * 4, by - Math.sin(a - 0.6) * 4, r,
        { width: 1.1, alpha: 0.26, passes: 1 }, 2);
    }
  });
}
