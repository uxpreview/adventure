import * as THREE from 'three';
import {
  makeTexture, stroke, line, scribbleCircle, lettering, type Ctx2D,
} from '../engine/ink';
import { INK, PENCIL, WASH } from '../engine/palette';

/**
 * THE WORN THINGS' prop box (Session 22, `worn.ts`).
 *
 * Four small drawings, and every one of them is drawn to sit on the
 * walker's head or round the walker's neck at the walker's own scale:
 * the figure sheet is a hundred and twenty-eight by a hundred and
 * seventy-six pixels a frame with a head twenty-two across, and these
 * are drawn on canvases of about that width so the pen weight matches
 * the pen weight of the figure they go on. Front view, no face under
 * any of them, and the paper shows through every wash.
 *
 * Each one is the SAME drawing as the thing it came off — the crown
 * is the toppled king's zigzag, the hat is the one that runs the coast
 * road, the helm is the cap with a nasal the crew are drawn with — so
 * a player who has looked at the world recognises what they are
 * wearing without being told.
 */

const GOLD = WASH.sand;
const CLOTH = '#e6ddc4';
const IRON = '#8d8a84';
const CORD = '#5b6ee0';

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

/** THE CROWN, off the toppled king: a band and its zigzag, five
 *  points, the same line the statue has always been drawn with. */
export function crownTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(64, 48, seed, (ctx, r) => {
    const band: [number, number][] = [[8, 44], [10, 30], [54, 30], [56, 44]];
    fillPoly(ctx, band, GOLD, 0.5);
    const zig: [number, number][] = [[10, 30], [14, 10], [22, 24], [32, 6], [42, 24], [50, 10], [54, 30]];
    fillPoly(ctx, [...zig, [54, 30]], GOLD, 0.34);
    stroke(ctx, zig, r, { width: 2.4, alpha: 0.9, jitter: 1.1 });
    stroke(ctx, [[8, 44], [10, 30]], r, { width: 2.4, alpha: 0.9 });
    stroke(ctx, [[54, 30], [56, 44]], r, { width: 2.4, alpha: 0.9 });
    line(ctx, 8, 44, 56, 44, r, { width: 2.4, alpha: 0.9 }, 3);
    // three stones, which on a statue are three dots
    for (const x of [20, 32, 44]) scribbleCircle(ctx, x, 37, 2.2, r, { width: 1.2, alpha: 0.7 });
  });
}

/** THE HAT that ran the coast road: the same brim and crown as
 *  `hatTexture`, drawn a little squarer because it is on a head now. */
export function wornHatTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(80, 56, seed, (ctx, r) => {
    const crown: [number, number][] = [[22, 40], [26, 12], [54, 11], [58, 40]];
    fillPoly(ctx, crown, '#b9a888', 0.36);
    stroke(ctx, [...crown, crown[0]], r, { width: 2.2, alpha: 0.88 });
    // the brim, wide, and it went round a bend at seven units a second
    stroke(ctx, [[4, 42], [22, 46], [40, 47], [58, 46], [76, 40]], r, { width: 2.6, alpha: 0.9 });
    line(ctx, 26, 32, 54, 31, r, { width: 1.2, alpha: 0.5, passes: 1 });
  });
}

/** THE LANYARD from the atrium: a cord round the neck and a card on
 *  it, lettered VISITOR in the ruled hand, which is the joke played
 *  straight — you are the only one who ever was. */
export function lanyardTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(56, 72, seed, (ctx, r) => {
    stroke(ctx, [[8, 2], [14, 22], [24, 40]], r, { width: 1.6, alpha: 0.86, color: CORD });
    stroke(ctx, [[48, 2], [42, 22], [32, 40]], r, { width: 1.6, alpha: 0.86, color: CORD });
    const card: [number, number][] = [[16, 40], [40, 40], [41, 68], [15, 68]];
    fillPoly(ctx, card, CLOTH, 0.9);
    stroke(ctx, [...card, card[0]], r, { width: 1.5, alpha: 0.86 });
    scribbleCircle(ctx, 28, 44, 1.6, r, { width: 1, alpha: 0.7 });
    lettering(ctx, 'VISITOR', 17, 58, 5.4, r, { crooked: 0.2, width: 1.1, alpha: 0.86, tracking: 0.7 });
    line(ctx, 19, 63, 37, 63, r, { width: 0.8, alpha: 0.4, passes: 1, color: PENCIL });
  });
}

/** THE HELM off the foreshore: a cap with a nasal, the way the crew
 *  are drawn — and horns, which the crew are not, and which is the
 *  reason it was in the bow. */
export function helmTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(72, 56, seed, (ctx, r) => {
    const cap: [number, number][] = [[14, 44], [16, 24], [26, 12], [46, 12], [56, 24], [58, 44]];
    fillPoly(ctx, cap, IRON, 0.4);
    stroke(ctx, cap, r, { width: 2.4, alpha: 0.9 });
    line(ctx, 14, 44, 58, 44, r, { width: 2.2, alpha: 0.86 }, 3);
    // the nasal
    line(ctx, 36, 44, 36, 54, r, { width: 2.4, alpha: 0.86 }, 2);
    // the rivets along the band
    for (const x of [22, 36, 50]) scribbleCircle(ctx, x, 38, 1.4, r, { width: 1, alpha: 0.6 });
    // the horns
    stroke(ctx, [[16, 26], [6, 18], [4, 6]], r, { width: 2.2, alpha: 0.88, color: INK });
    stroke(ctx, [[56, 26], [66, 18], [68, 6]], r, { width: 2.2, alpha: 0.88, color: INK });
  });
}
