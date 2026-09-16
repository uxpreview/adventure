import type * as THREE from 'three';
import { makeTexture, stroke, line, scribbleCircle, hatch, lettering, type Ctx2D } from '../engine/ink';
import { WASH } from '../engine/palette';

/**
 * THE FIRST HOUR's prop box: two small drawings, both in the house
 * hand. Nell's cap goes on the walker's head at the figure sheet's
 * scale (see `textures-worn.ts` for the rule); the milestone stands on
 * the verge of the king's road at the Common's south border.
 */

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

/** NELL'S CAP: a soft flat cap, the crown pulled forward over a short
 *  peak, one button on top. Cloth, not gold: the reward for the first
 *  job is something she had in the cart. */
export function nellsCapTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(72, 44, seed, (ctx, r) => {
    // the crown: a low dome that sags to the front (the right)
    const crown: [number, number][] = [[8, 30], [10, 20], [18, 11], [34, 7], [50, 9], [60, 16], [64, 30]];
    fillPoly(ctx, [...crown, [64, 30], [8, 30]], WASH.sand, 0.42);
    stroke(ctx, crown, r, { width: 2.2, alpha: 0.9, jitter: 0.9 });
    // the peak, short and stiff, out to the right
    stroke(ctx, [[58, 30], [70, 33], [66, 37], [50, 34]], r, { width: 2, alpha: 0.88 });
    fillPoly(ctx, [[58, 30], [70, 33], [66, 37], [50, 34]], WASH.sand, 0.3);
    // the band
    line(ctx, 8, 30, 64, 30, r, { width: 2.2, alpha: 0.9 }, 3);
    // the button on top
    scribbleCircle(ctx, 36, 8, 2.2, r, { width: 1.2, alpha: 0.7 });
    // a seam across the crown
    stroke(ctx, [[14, 24], [30, 15], [50, 18]], r, { width: 1, alpha: 0.4, passes: 1 });
  });
}

/** THE MILESTONE at the Common's south border: a stone with a round
 *  top, older than the signpost, with the fourth name cut into it and
 *  an arrow that points back up the road. */
export function borderStoneTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(64, 96, seed, (ctx, r) => {
    const body: [number, number][] = [[14, 92], [12, 30], [18, 14], [32, 8], [46, 14], [52, 30], [50, 92]];
    fillPoly(ctx, body, '#d9d4c6', 0.55);
    stroke(ctx, [...body, [14, 92]], r, { width: 2.4, alpha: 0.9, jitter: 1.0 });
    hatch(ctx, 14, 70, 36, 22, -0.6, 4, r, { width: 0.9, alpha: 0.28 });
    // the arrow, pointing up the road
    line(ctx, 32, 44, 32, 22, r, { width: 2.2, alpha: 0.85 });
    stroke(ctx, [[24, 30], [32, 21], [40, 30]], r, { width: 2.2, alpha: 0.85 });
    // the fourth name, cut deep
    lettering(ctx, '8:15', 18, 62, 7.5, r, { crooked: 0.15, width: 1.6, alpha: 0.9, tracking: 0.9 });
    // an older, fainter line under it that nobody can read any more
    line(ctx, 18, 70, 46, 71, r, { width: 1, alpha: 0.3, passes: 1 });
  });
}

/* ================================================================== *
 * THE FIRST FIVE MINUTES on the story of record (`design/foundation/08`
 * §7): the bench you wake on, the note pinned above it, the washing
 * Nell is hanging, and Morrow going past with the dog.
 * ================================================================== */

/** THE BENCH on the green, side on: two ends, a seat, two back rails,
 *  and legs that have been in the grass a long time. */
export function benchTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(160, 80, seed, (ctx, r) => {
    fillPoly(ctx, [[14, 40], [146, 39], [148, 50], [12, 51]], WASH.sand, 0.3);
    stroke(ctx, [[12, 42], [148, 41]], r, { width: 2.4, alpha: 0.9 });
    stroke(ctx, [[12, 50], [148, 49]], r, { width: 2, alpha: 0.75 });
    stroke(ctx, [[16, 22], [144, 21]], r, { width: 2.2, alpha: 0.85 });
    stroke(ctx, [[16, 31], [144, 30]], r, { width: 1.8, alpha: 0.65 });
    for (const x of [18, 142]) {
      line(ctx, x, 12, x, 52, r, { width: 2.4, alpha: 0.9 });
      line(ctx, x - 2, 50, x - 5, 76, r, { width: 2.2, alpha: 0.85 });
      line(ctx, x + 2, 50, x + 5, 76, r, { width: 2.2, alpha: 0.85 });
    }
    hatch(ctx, 22, 43, 116, 6, 0, 5, r, { width: 0.8, alpha: 0.18 });
  });
}

/** THE NOTE pinned to the bench's back rail: a scrap of paper on a
 *  tack, three lines of somebody's handwriting, rained on. The words
 *  are the card's; this is the thing you see from the road. */
export function pinnedNoteTexture(seed: number, second = false): THREE.CanvasTexture {
  return makeTexture(64, 72, seed, (ctx, r) => {
    const paper: [number, number][] = second
      ? [[10, 14], [56, 10], [58, 62], [8, 66]]
      : [[8, 12], [54, 8], [58, 60], [12, 64]];
    fillPoly(ctx, paper, '#f4efe2', 0.92);
    stroke(ctx, [...paper, paper[0]], r, { width: 1.6, alpha: 0.8, jitter: 1.1 });
    // the tack
    scribbleCircle(ctx, 32, 12, 2.6, r, { width: 1.4, alpha: 0.9 });
    // the writing, as marks: the words are on the card
    lettering(ctx, second ? 'YOU DONT' : 'BACK IN', 14, 30, 5.2, r, { crooked: 0.4, width: 1.2, alpha: 0.8, tracking: 0.8 });
    lettering(ctx, second ? 'HAVE TO' : 'AN HOUR', 14, 42, 5.2, r, { crooked: 0.4, width: 1.2, alpha: 0.8, tracking: 0.8 });
    line(ctx, 30, 54, 50, 55, r, { width: 1.2, alpha: 0.6, passes: 1 });
    if (!second) {
      // rain got at the bottom corner
      hatch(ctx, 14, 52, 22, 10, 0.6, 3, r, { width: 0.7, alpha: 0.14 });
    }
  });
}

/** THE WASHING LINE by the field gate: two posts, a line that sags,
 *  and three things pegged to it. Nell hung it out the day he left
 *  and every day since. */
export function laundryLineTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(224, 104, seed, (ctx, r) => {
    line(ctx, 14, 18, 12, 100, r, { width: 2.4, alpha: 0.9 });
    line(ctx, 210, 16, 212, 100, r, { width: 2.4, alpha: 0.9 });
    stroke(ctx, [[14, 20], [70, 30], [130, 32], [190, 26], [210, 18]], r, { width: 1.5, alpha: 0.85, passes: 1 });
    // a shirt
    const shirt: [number, number][] = [[46, 30], [40, 40], [48, 42], [50, 70], [78, 70], [80, 42], [88, 40], [82, 30]];
    fillPoly(ctx, shirt, '#e6ddc4', 0.5);
    stroke(ctx, [...shirt, shirt[0]], r, { width: 1.7, alpha: 0.85 });
    // a sheet, folded over the line
    const sheet: [number, number][] = [[104, 31], [100, 86], [160, 84], [158, 31]];
    fillPoly(ctx, sheet, '#eee8d8', 0.55);
    stroke(ctx, [...sheet, sheet[0]], r, { width: 1.7, alpha: 0.85 });
    line(ctx, 106, 50, 156, 49, r, { width: 0.9, alpha: 0.3, passes: 1 });
    // a sock
    stroke(ctx, [[176, 28], [176, 52], [170, 60], [180, 64], [188, 54], [186, 28]], r, { width: 1.6, alpha: 0.8 });
    // pegs
    for (const x of [46, 82, 104, 158, 176, 186]) line(ctx, x, 24, x, 34, r, { width: 1.4, alpha: 0.7, passes: 1 });
  });
}

/** MORROW, fifteen. Shorter than Nell, a jacket that stops at the hip,
 *  a copied notebook under one arm. 0 standing · 1 mid-stride. He does
 *  not stop for anybody. */
export function morrowTexture(seed: number, pose: 0 | 1): THREE.CanvasTexture {
  return makeTexture(80, 150, seed, (ctx, r) => {
    const stride = pose === 1;
    scribbleCircle(ctx, 40, 30, 12, r, { width: 2, alpha: 0.85 }, 1.1);
    // hair, forward over the brow
    stroke(ctx, [[28, 24], [34, 16], [46, 14], [52, 22]], r, { width: 2, alpha: 0.7, passes: 1 });
    // the jacket, short
    const jacket: [number, number][] = [[28, 44], [24, 92], [56, 92], [52, 44]];
    fillPoly(ctx, jacket, '#c9c0ab', 0.35);
    stroke(ctx, [...jacket, jacket[0]], r, { width: 2, alpha: 0.85 });
    line(ctx, 40, 46, 40, 90, r, { width: 1, alpha: 0.35, passes: 1 });
    // the notebook, under the left arm
    const book: [number, number][] = [[14, 66], [12, 84], [30, 86], [32, 68]];
    fillPoly(ctx, book, '#f0ead9', 0.8);
    stroke(ctx, [...book, book[0]], r, { width: 1.6, alpha: 0.9 });
    // arms: one clamped over the book, one swinging
    stroke(ctx, [[28, 50], [18, 62], [22, 72]], r, { width: 1.8, alpha: 0.8 });
    stroke(ctx, stride ? [[52, 50], [66, 70], [60, 84]] : [[52, 50], [60, 72], [58, 88]], r, { width: 1.8, alpha: 0.8 });
    // legs
    if (stride) {
      line(ctx, 32, 92, 20, 140, r, { width: 2.2, alpha: 0.85 });
      line(ctx, 48, 92, 60, 140, r, { width: 2.2, alpha: 0.85 });
    } else {
      line(ctx, 34, 92, 32, 140, r, { width: 2.2, alpha: 0.85 });
      line(ctx, 46, 92, 50, 140, r, { width: 2.2, alpha: 0.85 });
    }
  });
}
