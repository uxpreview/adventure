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
