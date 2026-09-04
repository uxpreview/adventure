import * as THREE from 'three';
import {
  makeTexture, stroke, line, scribbleCircle, hatch, type Ctx2D,
} from '../engine/ink';
import { PENCIL, WASH } from '../engine/palette';

/**
 * THE NOW — the prop box for MAPLE COURT and GREYLINE CITY.
 *
 * Session 13, to `design/specs/maple-court.md` and
 * `design/specs/greyline-city.md`.
 *
 * ── THE PROBLEM THIS FILE HAS AND NO OTHER PROP BOX HAS ─────────────
 *
 * These are the only two lands in the world whose subject is **the
 * present day**. Every other land is old, weathered or empty, and a
 * ballpoint flatters all three for free: a cracked pan, a stook, a wall
 * with the mortar gone. A suburb and a downtown drawn in the same pen
 * will look like a tech demo the instant the drawing is generic,
 * because nothing about a bungalow is inherently interesting to a line.
 *
 * So the two lands are drawn AT RIGHT ANGLES TO EACH OTHER, the way
 * SPLITROCK and THE BLEACH FLATS are (verticals against level dashes),
 * and the pair of rules is the whole answer to "what does a suburb look
 * like in ink":
 *
 *   **MAPLE COURT: EVERY MARK CLOSES.** A hedge is a loop. A lawn is a
 *   kerb that comes back to itself. A fence is a rectangle round a
 *   garden. A hopscotch is a closed figure, a pillar box is a closed
 *   cylinder, a turning circle is a road that returns you to where you
 *   started. Nothing in Maple Court runs off the edge of its own
 *   drawing — which is the street's whole belief (`THE-WAITS` §3: that
 *   leaving is temporary) drawn rather than said.
 *
 *   **GREYLINE CITY: EVERY MARK LEAVES.** Towers are cut off by the top
 *   of the frame, downpipes and fire escapes run out of both ends of
 *   their own canvas, the hatching runs past the edge of what it is
 *   shading, and not one silhouette in the land is closed. `THE-WAITS`
 *   §11: everybody is going somewhere and nobody arrives.
 *
 * **AND THE FRAME-TOP CEILING BECOMES THE SUBJECT.** Session 3 wrote
 * down that the camera shows about ten world units of height at
 * thirty-three units out, and every land since has treated that as a
 * limit to design around — height contests are won by spread, not by
 * scale. A downtown is the one place in this world where a thing going
 * out of the top of the frame is CORRECT, and it is what separates the
 * city from a village with taller huts: near towers crop, far towers
 * stand complete, and the difference between the two is the whole read.
 *
 * Nothing in here is about the paper, the pen, or whoever drew it
 * (`WORLD-SYSTEMS` §0). A suburb makes that temptation very loud.
 */

/* Pigments — every wash still comes out of palette.ts. */
const SIDING = ['#cdd6d2', '#d9d2c3', '#c8d1ba', '#dcccbb'];
const ROOF = ['#79808a', '#8a7f76', '#6f7a78'];
const TIMBER = '#8a6f4f';
const GLASS = '#e9e4d2';
const WARM = '#e8b878';
const STONE = '#b9b7b2';
const SOOT = '#6d7078';
const LEAF = '#8ba077';

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

/**
 * A POLYGON WITH CORNERS ON IT. `stroke()` draws quadratics through the
 * midpoints of its points, so a rectangle handed to it comes back as a
 * lozenge — a house like a loaf, a bench like a banana. Session 11 hit
 * this in two prop boxes and both carry this function; a land of ruled
 * buildings needs it more than either of them did.
 */
function hardPoly(
  ctx: Ctx2D, pts: [number, number][], r: () => number,
  o: Parameters<typeof stroke>[3] = {}, close = true
) {
  const n = close ? pts.length : pts.length - 1;
  for (let i = 0; i < n; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    line(ctx, a[0], a[1], b[0], b[1], r, o);
  }
}

/** A ground stain with no edge on it (Session 10's rule): wear, damp and
 *  shade fade out, they do not have sixteen sides you can count. */
function stain(
  ctx: Ctx2D, cx: number, cy: number, rad: number, color: string, alpha: number
) {
  const g = ctx.createRadialGradient(cx, cy, rad * 0.05, cx, cy, rad);
  const rgb = color.replace('#', '');
  const c = [0, 2, 4].map((i) => parseInt(rgb.slice(i, i + 2), 16)).join(',');
  g.addColorStop(0, `rgba(${c},${alpha})`);
  g.addColorStop(0.6, `rgba(${c},${alpha * 0.55})`);
  g.addColorStop(1, `rgba(${c},0)`);
  ctx.fillStyle = g;
  ctx.fillRect(cx - rad, cy - rad, rad * 2, rad * 2);
}

/** Soften a decal's own border so a mark on the ground has no rectangle
 *  round it. */
function feather(ctx: Ctx2D, w: number, h: number, px: number) {
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  const runs: [number, number, number, number, number, number][] = [
    [0, 0, px, 0, px, h], [w, 0, w - px, 0, px, h],
    [0, 0, 0, px, w, px], [0, h, 0, h - px, w, px],
  ];
  for (const [x0, y0, x1, y1, gw, gh] of runs) {
    const g = ctx.createLinearGradient(x0, y0, x1, y1);
    g.addColorStop(0, 'rgba(0,0,0,1)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(Math.min(x0, x1), Math.min(y0, y1), gw, gh);
  }
  ctx.restore();
}

/* ================================================================== *
 * MAPLE COURT — and every mark closes.
 * ================================================================== */

/**
 * THE HOUSES. Three drawings, and the variety in the street comes from
 * the PLAN — setback, spacing, which way the gable runs, whether the
 * car is there — never from a fourth canvas. Session 10 costed the
 * alternative at thirty-two megabytes of texture for one land's hedges.
 *
 *   0  the gabled two-storey: the street's common house
 *   1  the bungalow, wide and low, with a carport
 *   2  the chalet with the dormer, set the other way about
 */
export function courtHouseTexture(seed: number, v: 0 | 1 | 2): THREE.CanvasTexture {
  return makeTexture(256, 192, seed, (ctx, r) => {
    const siding = SIDING[Math.floor(r() * 4)];
    const roof = ROOF[Math.floor(r() * 3)];
    if (v === 1) {
      // the bungalow: one storey, a long shallow roof, a carport beside
      fillPoly(ctx, [[44, 178], [44, 120], [196, 120], [196, 178]], siding, 0.6);
      hardPoly(ctx, [[44, 178], [44, 120], [196, 120], [196, 178]], r, { width: 2.2, alpha: 0.9 });
      fillPoly(ctx, [[30, 122], [120, 84], [210, 122]], roof, 0.5);
      hardPoly(ctx, [[30, 122], [120, 84], [210, 122]], r, { width: 2.4, alpha: 0.9 });
      // the carport: a flat roof on two posts, and it is the one open
      // shape in the house — so it is closed by the drive under it
      hardPoly(ctx, [[196, 132], [246, 132], [246, 140], [196, 140]], r, { width: 1.8, alpha: 0.8 });
      line(ctx, 240, 140, 240, 178, r, { width: 1.8, alpha: 0.85 });
      line(ctx, 202, 140, 202, 178, r, { width: 1.4, alpha: 0.6 });
      for (const wx of [62, 140]) {
        fillPoly(ctx, [[wx, 158], [wx, 132], [wx + 36, 132], [wx + 36, 158]], GLASS, 0.55);
        hardPoly(ctx, [[wx, 158], [wx, 132], [wx + 36, 132], [wx + 36, 158]], r, { width: 1.5, alpha: 0.85 });
        line(ctx, wx + 18, 132, wx + 18, 158, r, { width: 1, alpha: 0.45, passes: 1 });
      }
      fillPoly(ctx, [[110, 178], [110, 138], [134, 138], [134, 178]], TIMBER, 0.5);
      hardPoly(ctx, [[110, 178], [110, 138], [134, 138], [134, 178]], r, { width: 1.7, alpha: 0.9 });
    } else if (v === 2) {
      // the chalet: the gable end faces the street, a dormer over it
      fillPoly(ctx, [[52, 178], [52, 104], [188, 104], [188, 178]], siding, 0.6);
      hardPoly(ctx, [[52, 178], [52, 104], [188, 104], [188, 178]], r, { width: 2.2, alpha: 0.9 });
      fillPoly(ctx, [[40, 106], [120, 46], [200, 106]], roof, 0.5);
      hardPoly(ctx, [[40, 106], [120, 46], [200, 106]], r, { width: 2.4, alpha: 0.9 });
      // the dormer, closed, sitting in the roof
      fillPoly(ctx, [[96, 92], [96, 66], [146, 66], [146, 92]], siding, 0.6);
      hardPoly(ctx, [[96, 92], [96, 66], [146, 66], [146, 92]], r, { width: 1.8, alpha: 0.85 });
      fillPoly(ctx, [[104, 72], [104, 88], [138, 88], [138, 72]], GLASS, 0.5);
      fillPoly(ctx, [[70, 152], [70, 116], [104, 116], [104, 152]], GLASS, 0.55);
      hardPoly(ctx, [[70, 152], [70, 116], [104, 116], [104, 152]], r, { width: 1.5, alpha: 0.85 });
      fillPoly(ctx, [[140, 178], [140, 126], [168, 126], [168, 178]], TIMBER, 0.5);
      hardPoly(ctx, [[140, 178], [140, 126], [168, 126], [168, 178]], r, { width: 1.7, alpha: 0.9 });
    } else {
      // the gabled two-storey
      fillPoly(ctx, [[38, 178], [38, 96], [218, 96], [218, 178]], siding, 0.6);
      hardPoly(ctx, [[38, 178], [38, 96], [218, 96], [218, 178]], r, { width: 2.2, alpha: 0.9 });
      fillPoly(ctx, [[26, 98], [128, 40], [230, 98]], roof, 0.5);
      hardPoly(ctx, [[26, 98], [128, 40], [230, 98]], r, { width: 2.4, alpha: 0.9 });
      hardPoly(ctx, [[188, 62], [188, 30], [206, 30], [206, 72]], r, { width: 1.8, alpha: 0.85 });
      for (const [wx, wy] of [[56, 108], [150, 108], [56, 146], [150, 146]] as const) {
        fillPoly(ctx, [[wx, wy + 26], [wx, wy], [wx + 46, wy], [wx + 46, wy + 26]], GLASS, 0.55);
        hardPoly(ctx, [[wx, wy + 26], [wx, wy], [wx + 46, wy], [wx + 46, wy + 26]], r,
          { width: 1.5, alpha: 0.85 });
        line(ctx, wx + 23, wy, wx + 23, wy + 26, r, { width: 1, alpha: 0.4, passes: 1 });
      }
      fillPoly(ctx, [[112, 178], [112, 132], [140, 132], [140, 178]], TIMBER, 0.5);
      hardPoly(ctx, [[112, 178], [112, 132], [140, 132], [140, 178]], r, { width: 1.7, alpha: 0.9 });
    }
    // the siding's ruled courses: the only repeated mark in the drawing
    const top = v === 0 ? 100 : v === 1 ? 124 : 108;
    for (let y = top + 8; y < 176; y += 11) {
      line(ctx, 46, y, 190, y + (r() - 0.5) * 1.6, r, { width: 0.7, alpha: 0.16, passes: 1 });
    }
  });
}

/**
 * THE WINDOWS, WARM. Drawn on their own canvas and stood in the same
 * place as the house, so a lit house is an opacity write rather than a
 * second house — Brim's terraces have worked this way since Session 6.
 */
export function courtHouseLitTexture(seed: number, v: 0 | 1 | 2): THREE.CanvasTexture {
  return makeTexture(256, 192, seed, (ctx, r) => {
    const panes: [number, number, number, number][] =
      v === 1 ? [[62, 132, 36, 26], [140, 132, 36, 26]]
        : v === 2 ? [[70, 116, 34, 36], [104, 72, 34, 16]]
          : [[56, 108, 46, 26], [150, 146, 46, 26]];
    for (const [x, y, w, h] of panes) {
      if (r() > 0.72) continue;                     // not every room is up
      ctx.save();
      ctx.globalAlpha = 0.62;
      ctx.fillStyle = WARM;
      ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
      ctx.restore();
      stain(ctx, x + w / 2, y + h / 2, w * 1.5, WARM, 0.24);
    }
  });
}

/**
 * VAL'S HOUSE — the last house on the court, and the only one drawn
 * with its porch on. A porch is a roof on two posts, which is an open
 * shape; it is closed here by the step and the rail, because this house
 * more than any other in the land has to obey the street's rule.
 */
export function valHouseTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(256, 208, seed, (ctx, r) => {
    fillPoly(ctx, [[40, 194], [40, 104], [214, 104], [214, 194]], '#d5d8cb', 0.62);
    hardPoly(ctx, [[40, 194], [40, 104], [214, 104], [214, 194]], r, { width: 2.3, alpha: 0.92 });
    fillPoly(ctx, [[28, 106], [128, 44], [228, 106]], ROOF[0], 0.52);
    hardPoly(ctx, [[28, 106], [128, 44], [228, 106]], r, { width: 2.5, alpha: 0.92 });
    // the porch: roof, two posts, three steps, a rail each side
    hardPoly(ctx, [[86, 140], [86, 132], [178, 132], [178, 140]], r, { width: 2, alpha: 0.9 });
    for (const px of [92, 172]) line(ctx, px, 140, px, 184, r, { width: 2, alpha: 0.9 });
    hardPoly(ctx, [[92, 162], [172, 162], [172, 168], [92, 168]], r, { width: 1.3, alpha: 0.6 });
    for (let s = 0; s < 3; s++) {
      line(ctx, 104 + s * 3, 184 + s * 4, 160 - s * 3, 184 + s * 4, r, { width: 1.6, alpha: 0.8 });
    }
    // the door, and the light over it
    fillPoly(ctx, [[114, 184], [114, 140], [148, 140], [148, 184]], TIMBER, 0.55);
    hardPoly(ctx, [[114, 184], [114, 140], [148, 140], [148, 184]], r, { width: 1.8, alpha: 0.9 });
    scribbleCircle(ctx, 131, 127, 5, r, { width: 1.5, alpha: 0.85 });
    line(ctx, 131, 132, 131, 122, r, { width: 1.2, alpha: 0.7, passes: 1 });
    // net curtains, closed, in both front windows
    for (const wx of [54, 158]) {
      fillPoly(ctx, [[wx, 158], [wx, 118], [wx + 44, 118], [wx + 44, 158]], GLASS, 0.58);
      hardPoly(ctx, [[wx, 158], [wx, 118], [wx + 44, 118], [wx + 44, 158]], r,
        { width: 1.6, alpha: 0.88 });
      for (let i = 0; i < 5; i++) {
        stroke(ctx, [[wx + 4 + i * 9, 122], [wx + 6 + i * 9, 138], [wx + 3 + i * 9, 154]], r,
          { width: 0.9, alpha: 0.3, passes: 1 });
      }
    }
    for (let y = 112; y < 192; y += 11) {
      line(ctx, 46, y, 208, y + (r() - 0.5) * 1.4, r, { width: 0.7, alpha: 0.15, passes: 1 });
    }
  });
}

/**
 * THE PORCH LIGHT — the whole of `THE-WAITS` §3 in one drawing.
 *
 * It is a bulb over a door and a stain of warm on a wall, and it is on
 * at every hour, including the ones nobody is awake for. Stood over
 * VAL'S HOUSE and faded up at dusk — except that in this land the fade
 * never reaches zero, and the region is where that is written down.
 */
export function valPorchLitTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(256, 208, seed, (ctx, r) => {
    stain(ctx, 131, 129, 40, WARM, 0.55);
    stain(ctx, 131, 150, 30, WARM, 0.3);
    // the pool it throws on the porch boards and the step
    stain(ctx, 131, 182, 46, WARM, 0.22);
    ctx.save();
    ctx.globalAlpha = 0.75;
    ctx.fillStyle = WARM;
    ctx.beginPath();
    ctx.arc(131, 127, 4.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    // and one room, because somebody is in — and it is a window with
    // a curtain across it, not a hole full of light
    ctx.save();
    ctx.globalAlpha = 0.34;
    ctx.fillStyle = WARM;
    ctx.fillRect(160, 122, 36, 32);
    ctx.restore();
    stain(ctx, 178, 138, 30, WARM, 0.14);
    void r;
  });
}

/**
 * THE HEDGE — clipped, and it is the land's rule in one drawing: a
 * closed loop with a flat top, nothing like the wild hedgerow the Downs
 * are stitched with.
 *
 * `gap = true` is the same hedge with a five-unit notch cut back
 * through it, and the notch is the permanent change in `THE-WAITS` §3.
 * The cut is drawn as CUT — square ends, the leaf mass stopped dead
 * rather than tapering — because a gap that has grown open reads as a
 * hole and a gap that has been cut back open reads as a decision.
 */
export function clippedHedgeTexture(seed: number, gap: boolean): THREE.CanvasTexture {
  return makeTexture(512, 96, seed, (ctx, r) => {
    const runs: [number, number][] = gap ? [[8, 210], [302, 504]] : [[8, 504]];
    for (const [x0, x1] of runs) {
      fillPoly(ctx, [[x0, 88], [x0, 26], [x1, 23], [x1, 88]], LEAF, 0.5);
      // the top is CLIPPED: one level line, and it is the flattest mark
      // in the land — but a hedge that has been cut is not a ruler, so
      // the silhouette breaks over it
      line(ctx, x0, 25, x1, 22, r, { width: 2.4, alpha: 0.85 });
      for (let x = x0 + 5; x < x1 - 4; x += 9 + r() * 8) {
        scribbleCircle(ctx, x, 24 + (r() - 0.5) * 5, 3 + r() * 2.6, r,
          { width: 1.2, alpha: 0.5 }, 0.75);
      }
      line(ctx, x0, 88, x0, 26, r, { width: 2, alpha: 0.8 });
      line(ctx, x1, 88, x1, 23, r, { width: 2, alpha: 0.8 });
      // leaf: small closed scribbles all the way down, denser low
      const n = Math.round((x1 - x0) * 0.62);
      for (let i = 0; i < n; i++) {
        const x = x0 + 4 + r() * (x1 - x0 - 8);
        const y = 28 + r() * 58;
        scribbleCircle(ctx, x, y, 2.6 + r() * 3.4, r, { width: 1.1, alpha: 0.44 }, 0.9);
      }
      hatch(ctx, x0 + 2, 50, x1 - x0 - 4, 40, 0.22, 7, r, { alpha: 0.16, width: 0.9 });
      // the foot: a clipped hedge sits down onto its own shadow
      line(ctx, x0 + 2, 87, x1 - 2, 87, r, { width: 2.6, alpha: 0.5 });
    }
    if (gap) {
      /* THE CUT, and it is drawn as CUT. Square ends and the leaf mass
       * stopped dead rather than tapering: a gap that has GROWN open
       * reads as a hole, and a gap that has been cut back open reads as
       * a decision — which is the whole difference `THE-WAITS` §3 turns
       * on. Somebody went out there with a saw. */
      for (const cx of [210, 302]) {
        line(ctx, cx, 88, cx, 23, r, { width: 2.2, alpha: 0.8 });
        for (let y = 30; y < 84; y += 9) {
          line(ctx, cx - 3, y, cx + 3, y + 1, r, { width: 1, alpha: 0.3, passes: 1 }, 2);
        }
      }
      // and the clippings, still on the ground under it
      for (let i = 0; i < 12; i++) {
        const x = 216 + r() * 80;
        line(ctx, x, 86 + r() * 8, x + 4 + r() * 8, 88 + r() * 7, r,
          { width: 1.1, alpha: 0.4, passes: 1 }, 2);
      }
    }
  });
}

/** A GARDEN CHAIR. Three of them face a hedge (`WORLD-SYSTEMS` §10),
 *  and every one of them is one closed outline. */
export function gardenChairTexture(seed: number, v: 0 | 1 | 2): THREE.CanvasTexture {
  return makeTexture(96, 128, seed, (ctx, r) => {
    const seat = 82;
    const back = v === 2 ? 26 : 34;
    fillPoly(ctx, [[22, seat], [22, back + 6], [70, back], [70, seat]],
      v === 1 ? '#c8b9a2' : '#b6bfae', 0.45);
    hardPoly(ctx, [[22, seat], [22, back + 6], [70, back], [70, seat]], r,
      { width: 1.9, alpha: 0.9 });
    // legs, and they meet the seat: the outline comes back to itself
    hardPoly(ctx, [[22, seat], [26, 118], [34, 118], [32, seat]], r, { width: 1.6, alpha: 0.85 });
    hardPoly(ctx, [[60, seat], [64, 118], [72, 118], [70, seat]], r, { width: 1.6, alpha: 0.85 });
    for (let i = 1; i < 4; i++) {
      line(ctx, 24, back + 8 + i * 11, 68, back + 4 + i * 11, r, { width: 1, alpha: 0.4, passes: 1 });
    }
    if (v === 0) {
      // one of them has a cushion on it, and it has been rained on
      fillPoly(ctx, [[26, seat], [26, seat - 9], [66, seat - 11], [66, seat]], '#a8927e', 0.5);
      hardPoly(ctx, [[26, seat], [26, seat - 9], [66, seat - 11], [66, seat]], r,
        { width: 1.4, alpha: 0.75 });
    }
  });
}

/**
 * JUNE'S GATE — `THE-STRANGERS` S3, beat one.
 *
 * A gate on the latch in a picket fence. The whole beat is one detail
 * and it is a millimetre across in the world: **the latch plate is worn
 * bright** from being lifted and set back every night for years. It is
 * drawn as the one place on the gate where the ink has gone.
 */
export function latchGateTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(192, 128, seed, (ctx, r) => {
    // the fence either side, and the gate between: three closed shapes
    for (const [x0, x1] of [[4, 52], [140, 188]] as const) {
      for (let x = x0; x < x1; x += 12) {
        hardPoly(ctx, [[x, 118], [x, 56], [x + 4, 50], [x + 8, 56], [x + 8, 118]], r,
          { width: 1.5, alpha: 0.8 });
      }
      line(ctx, x0, 70, x1, 70, r, { width: 1.5, alpha: 0.7 });
      line(ctx, x0, 100, x1, 100, r, { width: 1.5, alpha: 0.7 });
    }
    hardPoly(ctx, [[56, 118], [56, 48], [136, 44], [136, 118]], r, { width: 2.1, alpha: 0.9 });
    for (let x = 64; x < 132; x += 14) {
      line(ctx, x, 116, x, 50, r, { width: 1.3, alpha: 0.65 });
    }
    line(ctx, 58, 62, 134, 58, r, { width: 1.6, alpha: 0.75 });
    line(ctx, 58, 104, 134, 100, r, { width: 1.6, alpha: 0.75 });
    line(ctx, 58, 104, 134, 58, r, { width: 1.4, alpha: 0.6 });   // the brace
    // THE LATCH PLATE, worn bright: paper where the ink should be
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.beginPath();
    ctx.ellipse(140, 74, 9, 6.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    hardPoly(ctx, [[132, 68], [150, 66], [150, 82], [132, 84]], r, { width: 1.4, alpha: 0.55 });
    line(ctx, 136, 76, 154, 74, r, { width: 2, alpha: 0.7 });     // the bar, lifted
  });
}

/** VAL. Two postures and no face (`QUALITY-BAR` §3): at the gate
 *  looking up the street, and putting the bin out. */
export function valTexture(seed: number, p: 0 | 1): THREE.CanvasTexture {
  return makeTexture(80, 144, seed, (ctx, r) => {
    const coat = '#9aa3ad';
    if (p === 0) {
      fillPoly(ctx, [[30, 128], [26, 68], [54, 68], [50, 128]], coat, 0.5);
      hardPoly(ctx, [[30, 128], [26, 68], [54, 68], [50, 128]], r, { width: 1.9, alpha: 0.9 });
      scribbleCircle(ctx, 40, 54, 11, r, { width: 1.8, alpha: 0.9 });
      line(ctx, 28, 74, 20, 100, r, { width: 1.6, alpha: 0.85 });
      line(ctx, 52, 74, 58, 98, r, { width: 1.6, alpha: 0.85 });
      line(ctx, 34, 128, 33, 140, r, { width: 1.7, alpha: 0.85 });
      line(ctx, 46, 128, 47, 140, r, { width: 1.7, alpha: 0.85 });
    } else {
      // leaning: one arm down and long, the bin's handle at the end of it
      fillPoly(ctx, [[30, 126], [24, 70], [52, 66], [50, 126]], coat, 0.5);
      hardPoly(ctx, [[30, 126], [24, 70], [52, 66], [50, 126]], r, { width: 1.9, alpha: 0.9 });
      scribbleCircle(ctx, 42, 52, 11, r, { width: 1.8, alpha: 0.9 });
      stroke(ctx, [[50, 72], [62, 92], [64, 110]], r, { width: 1.6, alpha: 0.85 });
      line(ctx, 26, 74, 18, 96, r, { width: 1.5, alpha: 0.8 });
      line(ctx, 34, 126, 30, 140, r, { width: 1.7, alpha: 0.85 });
      line(ctx, 46, 126, 50, 140, r, { width: 1.7, alpha: 0.85 });
    }
  });
}

/** JUNE. Standing at her gate; and standing at the fence at the end of
 *  the road, which is where she stays. Same person, same coat, and the
 *  second one is not doing anything at all. */
export function juneTexture(seed: number, p: 0 | 1): THREE.CanvasTexture {
  return makeTexture(80, 144, seed, (ctx, r) => {
    const coat = '#b2a289';
    fillPoly(ctx, [[30, 130], [27, 66], [53, 66], [50, 130]], coat, 0.5);
    hardPoly(ctx, [[30, 130], [27, 66], [53, 66], [50, 130]], r, { width: 1.9, alpha: 0.9 });
    scribbleCircle(ctx, 40, 52, 11, r, { width: 1.8, alpha: 0.9 });
    // hair, and it is the only thing about her that is drawn twice
    stroke(ctx, [[30, 46], [28, 58], [33, 64]], r, { width: 1.4, alpha: 0.7, passes: 1 });
    stroke(ctx, [[50, 46], [53, 58], [48, 64]], r, { width: 1.4, alpha: 0.7, passes: 1 });
    if (p === 0) {
      // a hand on the gate: the arm goes out and stops
      stroke(ctx, [[52, 74], [66, 84], [72, 88]], r, { width: 1.6, alpha: 0.85 });
      line(ctx, 28, 74, 22, 100, r, { width: 1.5, alpha: 0.8 });
    } else {
      // both arms down. She is not doing anything.
      line(ctx, 29, 72, 24, 104, r, { width: 1.5, alpha: 0.82 });
      line(ctx, 51, 72, 56, 104, r, { width: 1.5, alpha: 0.82 });
    }
    line(ctx, 35, 130, 34, 142, r, { width: 1.7, alpha: 0.85 });
    line(ctx, 45, 130, 46, 142, r, { width: 1.7, alpha: 0.85 });
  });
}

/** THE PILLAR BOX on the corner: a closed cylinder, and the most
 *  confident single shape in the land. */
export function pillarBoxTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(96, 160, seed, (ctx, r) => {
    fillPoly(ctx, [[26, 148], [24, 44], [72, 44], [70, 148]], '#a05a52', 0.5);
    hardPoly(ctx, [[26, 148], [24, 44], [72, 44], [70, 148]], r, { width: 2.1, alpha: 0.9 });
    scribbleCircle(ctx, 48, 40, 24, r, { width: 2, alpha: 0.85 }, 0.55);
    line(ctx, 32, 74, 64, 74, r, { width: 3.2, alpha: 0.8 });      // the slot
    scribbleCircle(ctx, 48, 108, 13, r, { width: 1.3, alpha: 0.45 });
    line(ctx, 26, 146, 70, 146, r, { width: 1.6, alpha: 0.6 });
  });
}

/** A WHEELIE BIN, out at the kerb on the wrong day. */
export function binTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(80, 112, seed, (ctx, r) => {
    fillPoly(ctx, [[20, 100], [24, 34], [60, 34], [64, 100]], '#8d9a92', 0.5);
    hardPoly(ctx, [[20, 100], [24, 34], [60, 34], [64, 100]], r, { width: 2, alpha: 0.9 });
    hardPoly(ctx, [[20, 34], [22, 24], [62, 24], [64, 34]], r, { width: 1.8, alpha: 0.85 });
    scribbleCircle(ctx, 26, 102, 6, r, { width: 1.4, alpha: 0.7 });
    scribbleCircle(ctx, 58, 102, 6, r, { width: 1.4, alpha: 0.7 });
  });
}

/** THE SURVEY PEGS at the end of the road. Twenty centimetres of wood
 *  with a painted top, and one of them is down. Nothing anywhere in
 *  this game says what they are. */
export function surveyPegTexture(seed: number, down: boolean): THREE.CanvasTexture {
  return makeTexture(64, 64, seed, (ctx, r) => {
    if (down) {
      fillPoly(ctx, [[8, 44], [8, 36], [56, 32], [56, 40]], TIMBER, 0.5);
      hardPoly(ctx, [[8, 44], [8, 36], [56, 32], [56, 40]], r, { width: 1.6, alpha: 0.85 });
      ctx.save();
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = '#b0524a';
      ctx.fillRect(48, 33, 8, 7);
      ctx.restore();
    } else {
      fillPoly(ctx, [[26, 60], [28, 14], [38, 14], [40, 60]], TIMBER, 0.5);
      hardPoly(ctx, [[26, 60], [28, 14], [38, 14], [40, 60]], r, { width: 1.7, alpha: 0.88 });
      ctx.save();
      ctx.globalAlpha = 0.62;
      ctx.fillStyle = '#b0524a';
      ctx.fillRect(28, 14, 10, 9);
      ctx.restore();
      line(ctx, 26, 26, 40, 25, r, { width: 1, alpha: 0.4, passes: 1 });
    }
  });
}

/* ---- the ground of MAPLE COURT: kerbs, aprons, stripes ------------ */

/** A MOWN LAWN: a closed kerb with stripes inside it. The closure is
 *  the kerb — the stripes are what a mower does between two of them. */
export function mownLawnDecal(seed: number, v: 0 | 1): THREE.CanvasTexture {
  return makeTexture(256, 256, seed, (ctx, r) => {
    const inset = 14 + r() * 10;
    const box: [number, number][] = [
      [inset, inset], [256 - inset, inset - 4], [256 - inset + 3, 256 - inset], [inset + 2, 256 - inset],
    ];
    fillPoly(ctx, box, WASH.suburb, 0.26);
    hardPoly(ctx, box, r, { width: 2, alpha: 0.34 });
    const gap = v === 0 ? 34 : 44;
    for (let y = inset + gap * 0.5; y < 256 - inset; y += gap) {
      ctx.save();
      ctx.globalAlpha = 0.1;
      ctx.fillStyle = '#93a37b';
      ctx.fillRect(inset + 2, y, 256 - inset * 2, gap * 0.5);
      ctx.restore();
    }
    feather(ctx, 256, 256, 30);
  });
}

/** A DRIVE: an apron of concrete with one crack in it, and the crack is
 *  the only mark in Maple Court that does not close. It is a crack. */
export function drivewayDecal(seed: number, v: 0 | 1): THREE.CanvasTexture {
  return makeTexture(192, 256, seed, (ctx, r) => {
    const box: [number, number][] = [[40, 8], [152, 10], [158, 246], [34, 244]];
    fillPoly(ctx, box, '#cfcabb', 0.42);
    hardPoly(ctx, box, r, { width: 1.7, alpha: 0.5 });
    for (let y = 40; y < 240; y += 52) {
      line(ctx, 38, y, 154, y + (r() - 0.5) * 3, r, { width: 1.1, alpha: 0.3, passes: 1 });
    }
    if (v === 1) {
      stroke(ctx, [[70, 60], [82, 108], [76, 150], [88, 196]], r, { width: 1.2, alpha: 0.4, passes: 1 });
      stain(ctx, 96, 150, 40, SOOT, 0.12);           // where a car stands
    }
    feather(ctx, 192, 256, 10);
  });
}

/**
 * THE KERB, AND WHAT IT DOES TO A HUNDRED UNITS OF EMPTY ROAD.
 *
 * `THE-LINE.md` §3.2 asks for *two hundred units of dead straight road
 * running away into haze*, and round 1 of this session's gate produced
 * a tan smear that gave up at sixty. A road at distance is not read
 * from its surface — the surface is four pixels wide by then — it is
 * read from its EDGES, two lines converging on a point. That is the
 * whole of one-point perspective and it is the reason this drawing
 * exists.
 *
 * It is a DECAL: a mark on the page, no height, so it may lie in the
 * protected corridor where nothing is allowed to stand. And it stops
 * where the survey did, which is the other half of what it is for: the
 * kerbs are the part of Maple Court that got MADE, and the last sixteen
 * units of the king's road never did.
 */
export function kerbRunDecal(seed: number): THREE.CanvasTexture {
  return makeTexture(192, 512, seed, (ctx, r) => {
    for (const kx of [45, 147]) {
      // the kerb's top edge: the hardest continuous line in the land
      line(ctx, kx, -8, kx + (r() - 0.5) * 4, 520, r, { width: 2.6, alpha: 0.5 }, 22);
      // its face, and the gutter inside it
      const inward = kx < 96 ? 6 : -6;
      line(ctx, kx + inward, -8, kx + inward + (r() - 0.5) * 4, 520, r,
        { width: 1.2, alpha: 0.22, passes: 1 }, 22);
      // the joints between the kerbstones, and they are not even
      for (let y = 0; y < 512; y += 26 + r() * 12) {
        line(ctx, kx - 5, y, kx + 5, y + (r() - 0.5) * 2, r,
          { width: 1, alpha: 0.2, passes: 1 }, 2);
      }
    }
    // and the verge either side goes to grass without an edge
    feather(ctx, 192, 512, 22);
  });
}

/** THE KERB, AND NOTHING BEHIND IT. A length of kerb with a driveway
 *  mouth dropped into it, laid on a plot that was never built on.
 *  `THE-LINE` §3.2's brief in one drawing: the survey laid the street
 *  out and the houses stopped coming. */
export function emptyPlotDecal(seed: number): THREE.CanvasTexture {
  return makeTexture(256, 192, seed, (ctx, r) => {
    line(ctx, 6, 40, 250, 44, r, { width: 2.2, alpha: 0.46 });
    line(ctx, 6, 48, 250, 52, r, { width: 1.1, alpha: 0.26, passes: 1 });
    // the dropped kerb: a mouth for a drive nobody ever came up
    line(ctx, 96, 44, 108, 52, r, { width: 1.6, alpha: 0.4, passes: 1 });
    line(ctx, 152, 46, 164, 54, r, { width: 1.6, alpha: 0.4, passes: 1 });
    fillPoly(ctx, [[108, 52], [152, 54], [150, 92], [110, 90]], '#cfcabb', 0.3);
    hardPoly(ctx, [[108, 52], [152, 54], [150, 92], [110, 90]], r, { width: 1.2, alpha: 0.3 });
    // and then grass, going back to itself
    for (let i = 0; i < 40; i++) {
      const x = 12 + r() * 232;
      const y = 66 + r() * 118;
      stroke(ctx, [[x, y], [x + 2 - r() * 4, y - 5 - r() * 4]], r,
        { width: 0.9, alpha: 0.22, passes: 1 });
    }
    feather(ctx, 256, 192, 14);
  });
}

/** WHERE THE TARMAC GIVES OUT. The road's last four units, going to
 *  gravel and then to nothing. No edge, because there is not one. */
export function roadEndDecal(seed: number): THREE.CanvasTexture {
  return makeTexture(256, 192, seed, (ctx, r) => {
    fillPoly(ctx, [[40, 0], [216, 0], [212, 96], [44, 92]], WASH.road, 0.4);
    for (let i = 0; i < 260; i++) {
      const t = r();
      const y = 60 + t * t * 118;
      const x = 40 + r() * 176 + (t - 0.5) * 26;
      ctx.save();
      ctx.globalAlpha = 0.3 * (1 - t * 0.8);
      ctx.fillStyle = '#a99b7f';
      ctx.beginPath();
      ctx.arc(x, y, 0.9 + r() * 1.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    feather(ctx, 256, 192, 22);
  });
}

/** A HOPSCOTCH, chalked on a drive, mostly rained off. Eight closed
 *  boxes and a number in each — and the numbers are not a count of
 *  anything, they are a child's chalk. */
export function hopscotchDecal(seed: number): THREE.CanvasTexture {
  return makeTexture(128, 256, seed, (ctx, r) => {
    const col = '#e8e4d8';
    let y = 232;
    for (let i = 0; i < 7; i++) {
      const double = i === 2 || i === 5;
      const h = 26;
      if (double) {
        hardPoly(ctx, [[26, y], [26, y - h], [62, y - h], [62, y]], r,
          { width: 2.6, alpha: 0.8, color: col });
        hardPoly(ctx, [[66, y], [66, y - h], [102, y - h], [102, y]], r,
          { width: 2.6, alpha: 0.8, color: col });
      } else {
        hardPoly(ctx, [[46, y], [46, y - h], [82, y - h], [82, y]], r,
          { width: 2.6, alpha: 0.8, color: col });
      }
      y -= h + 2;
    }
    feather(ctx, 128, 256, 10);
  });
}

/* ================================================================== *
 * GREYLINE CITY — and every mark leaves the frame.
 * ================================================================== */

/**
 * THE TOWERS. Three kinds, and none of them has a top edge inside its
 * own canvas when it is drawn close to the street:
 *
 *   0  the brick block: hatched, heavy, windows in a ruled grid
 *   1  the slab: a curtain wall of ruled panes, nothing else
 *   2  the stepped one: a setback two thirds up, which is the only
 *      thing in Greyline City that admits there is a sky
 *
 * `floors` sets the height; the canvas grows with it, so a fourteen-
 * floor block is not a six-floor block stretched.
 */
export function greylineTowerTexture(
  seed: number, kind: 0 | 1 | 2, floors: number
): THREE.CanvasTexture {
  const h = 72 + floors * 34;
  return makeTexture(192, h, seed, (ctx, r) => {
    const w = kind === 1 ? 150 : 128 + Math.floor(r() * 26);
    const x0 = (192 - w) / 2;
    const step = kind === 2 ? Math.round(h * 0.34) : 0;
    const top = 6 + step;
    fillPoly(ctx, [[x0, h], [x0, top], [x0 + w, top], [x0 + w, h]],
      kind === 1 ? '#c3c6c4' : STONE, 0.5);
    hardPoly(ctx, [[x0, h], [x0, top], [x0 + w, top], [x0 + w, h]], r,
      { width: 2.4, alpha: 0.9 }, false);
    line(ctx, x0, top, x0 + w, top, r, { width: 2.4, alpha: 0.9 });
    if (kind === 2) {
      const sw = w * 0.62;
      const sx = x0 + (w - sw) / 2;
      fillPoly(ctx, [[sx, top], [sx, 8], [sx + sw, 8], [sx + sw, top]], STONE, 0.45);
      hardPoly(ctx, [[sx, top], [sx, 8], [sx + sw, 8], [sx + sw, top]], r,
        { width: 2.1, alpha: 0.85 });
      const sr = Math.max(2, Math.round((top - 16) / 34));
      for (let f = 0; f < sr; f++) {
        const wy = 16 + f * ((top - 22) / sr);
        for (let c = 0; c < 3; c++) {
          const wx = sx + 8 + c * ((sw - 16) / 3);
          const ww = (sw - 16) / 3 - 6;
          fillPoly(ctx, [[wx, wy], [wx, wy + 15], [wx + ww, wy + 15], [wx + ww, wy]], GLASS, 0.4);
          hardPoly(ctx, [[wx, wy], [wx, wy + 15], [wx + ww, wy + 15], [wx + ww, wy]], r,
            { width: 0.9, alpha: 0.38 });
        }
      }
    }
    if (kind === 0) hatch(ctx, x0 + 3, top + 3, w - 6, h - top - 6, 1.2, 13, r,
      { alpha: 0.13, width: 1 });
    // the window grid: ruled, and the rules run off both sides
    const cols = kind === 1 ? 7 : 5;
    const rows = floors;
    for (let f = 0; f < rows; f++) {
      const wy = top + 16 + f * ((h - top - 26) / rows);
      line(ctx, x0 - 6, wy - 4, x0 + w + 6, wy - 4, r, { width: 0.9, alpha: 0.22, passes: 1 });
      for (let c = 0; c < cols; c++) {
        const wx = x0 + 10 + c * ((w - 20) / cols);
        const ww = (w - 20) / cols - 6;
        fillPoly(ctx, [[wx, wy], [wx, wy + 17], [wx + ww, wy + 17], [wx + ww, wy]], GLASS, 0.4);
        hardPoly(ctx, [[wx, wy], [wx, wy + 17], [wx + ww, wy + 17], [wx + ww, wy]], r,
          { width: 1, alpha: 0.42 });
      }
    }
    // the verticals, and they run out of the bottom of the drawing
    for (let c = 1; c < cols; c++) {
      const vx = x0 + 6 + c * ((w - 20) / cols);
      line(ctx, vx, top + 8, vx, h + 8, r, { width: 1.1, alpha: 0.24, passes: 1 });
    }
  });
}

/** THE WINDOWS THAT ARE STILL ON. Same canvas, warm rectangles only,
 *  and never all of them: an office block at dusk is mostly dark and
 *  entirely unfinished. */
export function greylineTowerLitTexture(
  seed: number, kind: 0 | 1 | 2, floors: number
): THREE.CanvasTexture {
  const h = 72 + floors * 34;
  return makeTexture(192, h, seed, (ctx, r) => {
    const w = kind === 1 ? 150 : 128 + Math.floor(r() * 26);
    const x0 = (192 - w) / 2;
    const step = kind === 2 ? Math.round(h * 0.34) : 0;
    const top = 6 + step;
    const cols = kind === 1 ? 7 : 5;
    ctx.save();
    for (let f = 0; f < floors; f++) {
      const wy = top + 16 + f * ((h - top - 26) / floors);
      for (let c = 0; c < cols; c++) {
        if (r() > 0.3) continue;
        const wx = x0 + 10 + c * ((w - 20) / cols);
        const ww = (w - 20) / cols - 6;
        ctx.globalAlpha = 0.3 + r() * 0.34;
        ctx.fillStyle = WARM;
        ctx.fillRect(wx + 1, wy + 1, ww - 2, 15);
      }
    }
    ctx.restore();
  });
}

/** THE FAR SKYLINE — the haze layer, and the only drawing in the city
 *  with air in it. Pale, pencil, no windows: shapes at a distance, with
 *  the gaps between them doing the work. */
export function farSkylineTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(512, 192, seed, (ctx, r) => {
    let x = 6;
    while (x < 500) {
      const w = 26 + r() * 54;
      const top = 30 + r() * 108;
      fillPoly(ctx, [[x, 192], [x, top], [x + w, top], [x + w, 192]], PENCIL, 0.08);
      hardPoly(ctx, [[x, 192], [x, top], [x + w, top], [x + w, 192]], r,
        { width: 1.1, alpha: 0.17, color: PENCIL }, false);
      line(ctx, x, top, x + w, top, r, { width: 1.1, alpha: 0.19, color: PENCIL });
      // a mast or a lift housing on some of them, because a skyline is
      // never a row of boxes
      if (r() > 0.55) line(ctx, x + w * 0.5, top, x + w * 0.5, top - 8 - r() * 22, r,
        { width: 1, alpha: 0.16, color: PENCIL, passes: 1 });
      x += w + 2 + r() * 34;
    }
  });
}

/** A RUN OF SHOPFRONTS under one continuous awning. The awning runs off
 *  both ends of the drawing, because a street does. */
export function shopRowTexture(seed: number, v: 0 | 1): THREE.CanvasTexture {
  return makeTexture(384, 160, seed, (ctx, r) => {
    fillPoly(ctx, [[0, 150], [0, 20], [384, 16], [384, 150]], STONE, 0.42);
    line(ctx, 0, 20, 384, 16, r, { width: 2.2, alpha: 0.8 });
    const units = v === 0 ? 3 : 4;
    for (let i = 0; i < units; i++) {
      const x0 = 8 + i * (368 / units);
      const wdt = 368 / units - 16;
      // the glass, floor to fascia
      fillPoly(ctx, [[x0, 148], [x0, 62], [x0 + wdt, 60], [x0 + wdt, 148]], GLASS, 0.5);
      hardPoly(ctx, [[x0, 148], [x0, 62], [x0 + wdt, 60], [x0 + wdt, 148]], r,
        { width: 1.7, alpha: 0.85 });
      line(ctx, x0 + wdt * 0.55, 148, x0 + wdt * 0.55, 62, r, { width: 1.3, alpha: 0.6 });
      // the awning: a canted plane, and its front edge is a scallop
      const ay = 58;
      fillPoly(ctx, [[x0 - 6, ay], [x0 + wdt + 6, ay - 2], [x0 + wdt + 10, ay + 18], [x0 - 10, ay + 20]],
        i % 2 ? '#a8756a' : '#7d8f95', 0.45);
      hardPoly(ctx, [[x0 - 6, ay], [x0 + wdt + 6, ay - 2], [x0 + wdt + 10, ay + 18], [x0 - 10, ay + 20]],
        r, { width: 1.6, alpha: 0.8 });
      for (let s = 0; s < 6; s++) {
        const sx = x0 - 10 + s * ((wdt + 20) / 6);
        line(ctx, sx, ay + 19, sx + (wdt + 20) / 12, ay + 24, r, { width: 1.2, alpha: 0.6, passes: 1 });
        line(ctx, sx + (wdt + 20) / 12, ay + 24, sx + (wdt + 20) / 6, ay + 19, r,
          { width: 1.2, alpha: 0.6, passes: 1 });
      }
      // the fascia over it, blank: no shop in this game has a name
      fillPoly(ctx, [[x0 - 4, ay - 4], [x0 + wdt + 4, ay - 6], [x0 + wdt + 4, ay - 24], [x0 - 4, ay - 22]],
        '#c9c6bd', 0.4);
      hardPoly(ctx, [[x0 - 4, ay - 4], [x0 + wdt + 4, ay - 6], [x0 + wdt + 4, ay - 24], [x0 - 4, ay - 22]],
        r, { width: 1.3, alpha: 0.55 });
    }
    // upper floors, ruled, running out of the top
    for (let y = 12; y > -2; y -= 7) line(ctx, 0, y, 384, y - 2, r, { width: 0.8, alpha: 0.2, passes: 1 });
    hatch(ctx, 0, 22, 384, 30, 1.4, 15, r, { alpha: 0.1, width: 0.9 });
  });
}

/**
 * THE WORN PATHS — and this is the drawing the whole land stands on.
 *
 * `THE-WAITS` §11: everybody walks round him, and the paths they take to
 * do it have been trodden into the stone. **He has been there long
 * enough to be geography.** The prompt for this session put it plainly:
 * if the wear does not read, the land has no wait.
 *
 * How it is drawn, which is the only way it reads at this camera:
 *
 *   · the wear is PALE, not dark. Stone that a million shoes have been
 *     over loses its ink; it does not gain any. So the mark is paper
 *     laid back over the paving, and what it rubs out is the slab lines
 *     drawn underneath it;
 *   · it is drawn as SIXTY INDIVIDUAL WALKS, not as two shapes. Each one
 *     enters the bottom of the canvas going roughly north, leans round
 *     the island, and leaves the top; where they crowd, the stone is
 *     gone, and where they thin out at the edges it comes back. The
 *     lanes are what is left over rather than what was drawn, which is
 *     what a real desire line looks like from above;
 *   · and the ISLAND IS NEVER TOUCHED. Two and a half units across,
 *     dead centre, with every slab line in it still crisp. That hole is
 *     the composition: it is the shape of a decision made about a
 *     million times, and after he moves to the bench it is the shape of
 *     a man who is not standing there any more.
 */
export function wornPathsDecal(seed: number): THREE.CanvasTexture {
  return makeTexture(512, 512, seed, (ctx, r) => {
    const CX = 256;
    const CY = 268;
    const ISLE = 34;

    /* the stone first, and it is ordinary: slabs, ruled, running off
     * every side of the drawing */
    fillPoly(ctx, [[0, 0], [512, 0], [512, 512], [0, 512]], '#c6c4bd', 0.3);
    /* THE SLABS ARE SLAB-SIZED. Round 5 drew them at sixty-two pixels
     * on a thirty-unit decal, which is a paving slab three and a half
     * metres across — so the grid read as a plaza floor and the missing
     * lines in the lanes were two gaps in a very coarse grid. At
     * twenty-four the slabs are about a metre and a half and the lanes
     * are what they are on a real pavement: a wide band where the
     * jointing has simply gone. */
    const G = 24;
    const rules: [number, number, number, number][] = [];
    for (let y = -8; y < 520; y += G) rules.push([-8, y, 520, y + (r() - 0.5) * 4]);
    for (let x = -8; x < 520; x += G) rules.push([x, -8, x + (r() - 0.5) * 4, 520]);
    for (const [x1, y1, x2, y2] of rules) {
      line(ctx, x1, y1, x2, y2, r, { width: 1.3, alpha: 0.5, passes: 1 }, 6);
    }

    /* THE WALKS, and they are drawn by TAKING THE STONE AWAY. Sixty-two
     * of them, each one entering at the bottom, leaning round the
     * island, and leaving at the top; where they crowd, the slab lines
     * are gone entirely, and at the edges they come back. The lanes are
     * what is left over rather than what was drawn — which is what a
     * desire line actually looks like from above. */
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineCap = 'round';
    for (let i = 0; i < 62; i++) {
      /* a walk commits to one side of him and stays there. It has to:
       * you decide which way you are going round somebody about ten
       * paces out, and by then you are already over. So the whole of
       * this curve is on one side of the centre line except its very
       * ends, and the clean LENS between the two lanes — longer than it
       * is wide, drawn out upstream and down — is exactly the shape a
       * pavement takes round a man who does not move. */
      const side = i % 2 === 0 ? 1 : -1;
      const clear = ISLE + 10 + r() * 62;
      const lane = CX + side * clear;
      const end = CX + side * (4 + r() * 46);
      const w = () => (r() - 0.5) * 11;
      const mid = (lane + end) / 2;
      const pts: [number, number][] = [
        [end + w(), 528], [mid + w(), 430], [lane + w(), 352],
        [lane + w(), 268], [lane + w(), 184], [mid + w(), 106], [end + w(), -16],
      ];
      ctx.globalAlpha = 0.17 + r() * 0.14;
      ctx.strokeStyle = 'rgba(0,0,0,1)';
      ctx.lineWidth = 18 + r() * 30;
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let k = 1; k < pts.length; k++) {
        const [px, py] = pts[k - 1];
        const [x, y] = pts[k];
        ctx.quadraticCurveTo(px, py, (px + x) / 2, (py + y) / 2);
      }
      ctx.stroke();
    }
    ctx.restore();

    /* AND THE STONE ITSELF GOES SMOOTH. The slab lines coming away is
     * the whole of the drawing at ten units and nothing at all at forty
     * — a line that is not there cannot be seen from a distance — so
     * the lanes take a wash as well. It is a DARK one, and that is a
     * correction: the drawing's own argument was that wear is pale
     * because stone loses its ink, and on a page that is already the
     * colour of paper a pale mark on pale ground is nothing at all.
     * What a hundred years of shoes actually leaves is a polish, and a
     * polish is darker than the stone round it. */
    ctx.save();
    for (const s of [-1, 1]) {
      const g = ctx.createRadialGradient(CX + s * 92, CY - 10, 10, CX + s * 92, CY - 10, 150);
      g.addColorStop(0, 'rgba(108,110,116,0.26)');
      g.addColorStop(0.55, 'rgba(108,110,116,0.13)');
      g.addColorStop(1, 'rgba(108,110,116,0)');
      ctx.fillStyle = g;
      ctx.fillRect(CX + s * 92 - 150, CY - 160, 300, 300);
    }
    ctx.restore();

    /* THE ISLAND IS NEVER TOUCHED. Two and a half units across, dead
     * centre, and every slab line in it still crisp: the walks bow
     * round it, and here the stone is put back at full strength in case
     * one of them clipped it. That hole is the composition — it is the
     * shape of a decision made about a million times, and once he moves
     * to the bench it is the shape of a man who is not standing there
     * any more. */
    ctx.save();
    ctx.beginPath();
    ctx.arc(CX, CY, ISLE, 0, Math.PI * 2);
    ctx.clip();
    for (const [x1, y1, x2, y2] of rules) {
      line(ctx, x1, y1, x2, y2, r, { width: 1.4, alpha: 0.42, passes: 1 });
    }
    ctx.restore();

    /* and the deepest part of each lane takes a little dirt, so the
     * wear has a shape and not only an absence */
    for (const s of [-1, 1]) stain(ctx, CX + s * 96, CY - 26, 96, SOOT, 0.085);
    feather(ctx, 512, 512, 40);
  });
}

/** THE PAVING the wear is worn INTO: slabs, ruled, and the rules run
 *  off all four sides. Without this under it the wear is a smudge. */
export function pavingDecal(seed: number, v: 0 | 1): THREE.CanvasTexture {
  return makeTexture(256, 256, seed, (ctx, r) => {
    fillPoly(ctx, [[0, 0], [256, 0], [256, 256], [0, 256]], '#c6c4bd', 0.28);
    const g = v === 0 ? 42 : 52;
    for (let y = -6; y < 262; y += g) {
      line(ctx, -6, y, 262, y + (r() - 0.5) * 3, r, { width: 1.1, alpha: 0.3, passes: 1 });
    }
    for (let x = -6; x < 262; x += g) {
      line(ctx, x, -6, x + (r() - 0.5) * 3, 262, r, { width: 1.1, alpha: 0.26, passes: 1 });
    }
    feather(ctx, 256, 256, 10);
  });
}

/**
 * THE BENCH TWENTY UNITS OFF. Slats, a back, and an arm in the MIDDLE
 * of it — the detail that says the city thought about somebody lying
 * down on it before anybody ever sat on it.
 */
export function hardBenchTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(192, 112, seed, (ctx, r) => {
    // the back: four slats, leaning away, and it is the tallest part
    fillPoly(ctx, [[26, 56], [30, 14], [166, 10], [170, 52]], '#9aa0a2', 0.36);
    for (let i = 0; i < 4; i++) {
      const y = 16 + i * 11;
      line(ctx, 28 + i, y, 168 - i, y - 4, r, { width: 2.6, alpha: 0.85 });
    }
    // the seat: three slats, and the front edge is the darkest line
    fillPoly(ctx, [[18, 74], [26, 58], [170, 54], [178, 70]], '#9aa0a2', 0.44);
    for (let i = 0; i < 3; i++) {
      line(ctx, 20 + i * 3, 72 - i * 6, 176 - i * 3, 68 - i * 6, r, { width: 2.4, alpha: 0.82 });
    }
    line(ctx, 18, 75, 178, 71, r, { width: 3, alpha: 0.9 });
    // the frame: two end standards and a foot each, and they run out of
    // the bottom of the drawing the way everything in this land does
    for (const lx of [30, 164]) {
      line(ctx, lx, 72, lx - 3, 108, r, { width: 2.6, alpha: 0.9 });
      line(ctx, lx + 12, 70, lx + 16, 108, r, { width: 2.2, alpha: 0.8 });
      line(ctx, lx - 4, 104, lx + 20, 103, r, { width: 2, alpha: 0.7 });
      line(ctx, lx + 2, 60, lx + 2, 14, r, { width: 2.2, alpha: 0.8 });
    }
    /* THE ARM IN THE MIDDLE. The city thought about somebody lying down
     * on this bench before anybody had ever sat on it. */
    stroke(ctx, [[92, 56], [96, 34], [104, 32], [106, 54]], r, { width: 2.4, alpha: 0.9 });
    line(ctx, 98, 56, 97, 74, r, { width: 2, alpha: 0.8 });
  });
}

/**
 * THE MAN AT THE JUNCTION. Two postures: standing, and sitting on the
 * bench. He has no face (nobody does), no name (nothing in this game
 * will ever give him one), and nothing about the drawing says he is
 * waiting for anything — he is a man in a coat with his hands at his
 * sides, and the pavement round him is what says the rest.
 */
export function junctionManTexture(seed: number, p: 0 | 1): THREE.CanvasTexture {
  return makeTexture(88, 152, seed, (ctx, r) => {
    const coat = '#7d8189';
    if (p === 0) {
      fillPoly(ctx, [[32, 136], [30, 62], [58, 62], [56, 136]], coat, 0.52);
      hardPoly(ctx, [[32, 136], [30, 62], [58, 62], [56, 136]], r, { width: 2, alpha: 0.92 });
      line(ctx, 44, 74, 44, 132, r, { width: 1, alpha: 0.3, passes: 1 });  // the coat's line
      scribbleCircle(ctx, 44, 48, 11, r, { width: 1.8, alpha: 0.9 });
      line(ctx, 31, 68, 27, 108, r, { width: 1.6, alpha: 0.85 });
      line(ctx, 57, 68, 61, 108, r, { width: 1.6, alpha: 0.85 });
      line(ctx, 38, 136, 37, 148, r, { width: 1.8, alpha: 0.88 });
      line(ctx, 50, 136, 51, 148, r, { width: 1.8, alpha: 0.88 });
    } else {
      // sitting: the knees come forward and the coat falls open
      fillPoly(ctx, [[32, 108], [30, 56], [58, 56], [58, 108]], coat, 0.52);
      hardPoly(ctx, [[32, 108], [30, 56], [58, 56], [58, 108]], r, { width: 2, alpha: 0.92 });
      scribbleCircle(ctx, 44, 42, 11, r, { width: 1.8, alpha: 0.9 });
      stroke(ctx, [[34, 106], [22, 118], [22, 140]], r, { width: 1.9, alpha: 0.88 });
      stroke(ctx, [[54, 106], [66, 118], [66, 140]], r, { width: 1.9, alpha: 0.88 });
      line(ctx, 31, 62, 26, 96, r, { width: 1.5, alpha: 0.8 });
      line(ctx, 58, 62, 63, 96, r, { width: 1.5, alpha: 0.8 });
    }
  });
}

/** COMMUTERS. Three postures, every one of them mid-stride and every
 *  one of them going somewhere. Nobody in this land is standing still
 *  except the man, and that is the whole joke and the whole wound. */
export function commuterTexture(seed: number, v: 0 | 1 | 2): THREE.CanvasTexture {
  return makeTexture(88, 148, seed, (ctx, r) => {
    const coat = ['#8b8f97', '#9a8e80', '#77828b'][v];
    const lean = v === 1 ? -3 : 3;
    fillPoly(ctx, [[32 + lean, 128], [30, 60], [56, 60], [54 + lean, 128]], coat, 0.5);
    hardPoly(ctx, [[32 + lean, 128], [30, 60], [56, 60], [54 + lean, 128]], r,
      { width: 1.9, alpha: 0.9 });
    scribbleCircle(ctx, 43 + lean * 0.6, 46, 10.5, r, { width: 1.8, alpha: 0.9 });
    // the stride: one leg forward, one behind, and they leave the body
    stroke(ctx, [[38, 128], [30 + lean * 2, 140], [26 + lean * 2, 146]], r,
      { width: 1.8, alpha: 0.88 });
    stroke(ctx, [[50, 128], [58 + lean, 138], [64 + lean, 144]], r, { width: 1.8, alpha: 0.88 });
    if (v === 2) {
      // a bag, and it swings behind
      line(ctx, 56, 72, 66, 96, r, { width: 1.4, alpha: 0.8 });
      hardPoly(ctx, [[60, 96], [74, 94], [76, 112], [62, 114]], r, { width: 1.5, alpha: 0.8 });
    } else {
      line(ctx, 30, 66, 24 + lean, 98, r, { width: 1.5, alpha: 0.82 });
      line(ctx, 56, 66, 62 + lean, 98, r, { width: 1.5, alpha: 0.82 });
    }
  });
}

/** THE LIGHT MAST. A pole with an arm out over the road and three
 *  lamps on it, and the top one is green. All four of them are green.
 *  The pole runs out of the bottom of its own canvas. */
export function lightMastTexture(seed: number, mirrored = false): THREE.CanvasTexture {
  return makeTexture(160, 256, seed, (ctx, r) => {
    const px = mirrored ? 138 : 22;
    const dir = mirrored ? -1 : 1;
    line(ctx, px, 260, px, 40, r, { width: 3, alpha: 0.9 });
    stroke(ctx, [[px, 46], [px + dir * 20, 34], [px + dir * 62, 32]], r, { width: 2.4, alpha: 0.88 });
    const hx = px + dir * 74;
    hardPoly(ctx, [[hx - 13, 28], [hx + 13, 28], [hx + 13, 96], [hx - 13, 96]], r,
      { width: 2, alpha: 0.9 });
    for (let i = 0; i < 3; i++) {
      scribbleCircle(ctx, hx, 44 + i * 22, 8, r, { width: 1.4, alpha: 0.6 });
    }
    ctx.save();
    ctx.globalAlpha = 0.62;
    ctx.fillStyle = '#7fa86a';
    ctx.beginPath();
    ctx.arc(hx, 88, 7.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    stain(ctx, hx, 88, 22, '#7fa86a', 0.16);
  });
}

/** A FIRE ESCAPE on a blank flank wall: a zigzag that arrives from
 *  above the drawing and leaves below it. */
export function fireEscapeTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(160, 320, seed, (ctx, r) => {
    fillPoly(ctx, [[0, 0], [160, 0], [160, 320], [0, 320]], STONE, 0.36);
    hatch(ctx, 0, 0, 160, 320, 1.35, 17, r, { alpha: 0.12, width: 1 });
    for (let i = -1; i < 5; i++) {
      const y = 34 + i * 66;
      line(ctx, 14, y, 146, y - 3, r, { width: 2, alpha: 0.82 });
      line(ctx, 14, y + 9, 146, y + 6, r, { width: 1.2, alpha: 0.5, passes: 1 });
      for (let s = 0; s < 6; s++) line(ctx, 20 + s * 22, y, 20 + s * 22, y - 14, r,
        { width: 1, alpha: 0.45, passes: 1 });
      // the flight down to the next one, and it leaves the canvas
      stroke(ctx, [[132, y + 9], [46, y + 62]], r, { width: 2, alpha: 0.7 });
      stroke(ctx, [[136, y - 4], [50, y + 50]], r, { width: 1.1, alpha: 0.4, passes: 1 });
    }
    line(ctx, 14, -6, 14, 326, r, { width: 2.2, alpha: 0.75 });
  });
}

/**
 * A RETAINING WALL at the foot of THE HOLLOW.
 *
 * `QUALITY-BAR` §3: a fold is DRAWN, not shaded, and a smooth gradient
 * on a hillside is an airbrush — which is exactly what round 3's shot of
 * the hollow came back as, because the crease's own gradient is under
 * the terrain's hatching threshold and there was nothing standing in
 * front of it. What a city does with a cut like this is wall it, so the
 * wall is what gets drawn: brick in courses, a coping along the top,
 * and a weep pipe with a stain under it.
 *
 * It stands on the FLOOR at the toe of the slope and never on the slope
 * (Session 11's rule — nothing stands on a scarp), turned toward the
 * channel so the run of them recedes like theatre wings.
 */
export function hollowWallTexture(seed: number, v: 0 | 1): THREE.CanvasTexture {
  return makeTexture(256, 128, seed, (ctx, r) => {
    fillPoly(ctx, [[0, 128], [0, 18], [256, 14], [256, 128]], STONE, 0.44);
    // the coping, and it runs off both ends of the drawing
    line(ctx, -6, 18, 262, 14, r, { width: 3, alpha: 0.85 });
    line(ctx, -6, 26, 262, 22, r, { width: 1.4, alpha: 0.45, passes: 1 });
    // courses, and every third one is drawn and the rest are implied
    for (let y = 34; y < 128; y += 13) {
      line(ctx, -6, y, 262, y - 2, r, { width: 1, alpha: 0.24, passes: 1 });
    }
    for (let y = 34; y < 128; y += 39) {
      for (let x = 6 + (r() * 20); x < 256; x += 26 + r() * 10) {
        line(ctx, x, y - 5, x, y + 6, r, { width: 0.9, alpha: 0.2, passes: 1 }, 2);
      }
    }
    hatch(ctx, 0, 20, 256, 108, 1.45, 15, r, { alpha: 0.1, width: 1 });
    if (v === 1) {
      // a weep pipe, and what has come out of it for years
      line(ctx, 172, 74, 172, 128, r, { width: 3.4, alpha: 0.8 });
      stain(ctx, 172, 116, 34, SOOT, 0.16);
    } else {
      stain(ctx, 60, 120, 40, SOOT, 0.12);
    }
  });
}

/** A HOARDING round a lot where nothing is being built. Posters, torn,
 *  and not one word on any of them. */
export function hoardingTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(320, 128, seed, (ctx, r) => {
    fillPoly(ctx, [[0, 118], [0, 14], [320, 10], [320, 118]], '#b8ac96', 0.45);
    line(ctx, 0, 14, 320, 10, r, { width: 2.2, alpha: 0.8 });
    for (let x = 12; x < 320; x += 28) {
      line(ctx, x, 118, x, 12, r, { width: 1, alpha: 0.22, passes: 1 });
    }
    for (let i = 0; i < 5; i++) {
      const x = 10 + r() * 250;
      const y = 26 + r() * 30;
      const w = 40 + r() * 46;
      const h = 40 + r() * 34;
      fillPoly(ctx, [[x, y], [x + w, y - 3], [x + w - 2, y + h], [x + 2, y + h + 3]],
        ['#a8967f', '#93a3a8', '#b09a8e'][i % 3], 0.4);
      hardPoly(ctx, [[x, y], [x + w, y - 3], [x + w - 2, y + h], [x + 2, y + h + 3]], r,
        { width: 1.2, alpha: 0.4 });
      for (let k = 0; k < 4; k++) {
        line(ctx, x + 5, y + 12 + k * 8, x + w - 8, y + 11 + k * 8, r,
          { width: 1.4, alpha: 0.18, passes: 1 });
      }
      // torn: one corner has come away and hangs
      stroke(ctx, [[x + w - 2, y + h * 0.4], [x + w - 16, y + h * 0.55], [x + w - 6, y + h * 0.7]],
        r, { width: 1.2, alpha: 0.45, passes: 1 });
    }
  });
}

/** A REVOLVING DOOR, in two phases. A door that goes round and brings
 *  you back where you were, in the land where nobody arrives. */
export function revolvingDoorTexture(seed: number, p: 0 | 1): THREE.CanvasTexture {
  return makeTexture(160, 192, seed, (ctx, r) => {
    fillPoly(ctx, [[10, 182], [10, 26], [150, 22], [150, 182]], STONE, 0.4);
    hardPoly(ctx, [[10, 182], [10, 26], [150, 22], [150, 182]], r, { width: 2.2, alpha: 0.88 }, false);
    line(ctx, 10, 26, 150, 22, r, { width: 2.2, alpha: 0.88 });
    fillPoly(ctx, [[30, 178], [30, 66], [130, 62], [130, 178]], GLASS, 0.42);
    hardPoly(ctx, [[30, 178], [30, 66], [130, 62], [130, 178]], r, { width: 1.8, alpha: 0.8 });
    // and the leaves, which are the only thing that changes
    const a = p === 0 ? 0.5 : 1.1;
    for (let k = 0; k < 4; k++) {
      const th = a + (k * Math.PI) / 2;
      const dx = Math.cos(th) * 46;
      line(ctx, 80, 176, 80 + dx, 176 - Math.abs(Math.sin(th)) * 6, r,
        { width: 1.6, alpha: 0.4, passes: 1 });
      line(ctx, 80 + dx, 176, 80 + dx, 74, r, { width: 1.8, alpha: 0.55 });
    }
    line(ctx, 80, 178, 80, 60, r, { width: 2, alpha: 0.7 });
  });
}

/** A GRATING in the pavement, and what comes up out of it. The city's
 *  voice is warm air off a grating under the whole street (`Audio.ts`,
 *  LAND_VOICE), so the one place the land is drawn breathing is here. */
export function grateDecal(seed: number): THREE.CanvasTexture {
  return makeTexture(128, 128, seed, (ctx, r) => {
    fillPoly(ctx, [[16, 16], [112, 14], [114, 112], [14, 110]], SOOT, 0.3);
    hardPoly(ctx, [[16, 16], [112, 14], [114, 112], [14, 110]], r, { width: 1.6, alpha: 0.55 });
    for (let y = 24; y < 108; y += 9) {
      line(ctx, 20, y, 110, y - 1, r, { width: 2.2, alpha: 0.4 });
    }
    feather(ctx, 128, 128, 8);
  });
}

export function grateSteamTexture(seed: number, p: 0 | 1): THREE.CanvasTexture {
  return makeTexture(128, 192, seed, (ctx, r) => {
    for (let i = 0; i < 5; i++) {
      const x = 30 + i * 16 + (p ? 6 : 0);
      stroke(ctx, [
        [x, 188], [x + (p ? 8 : -8), 140], [x + (p ? -6 : 10), 92], [x + (p ? 12 : -4), 44],
        [x + (p ? -2 : 14), 4],
      ], r, { width: 1.4 + r(), alpha: 0.16, passes: 1, color: PENCIL });
    }
  });
}

/** CITY BINS in the bottom of the hollow, and the one thing down there
 *  that has been touched today. */
export function cityBinsTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(192, 128, seed, (ctx, r) => {
    const boxes: [number, number, number, number][] = [[10, 44, 58, 74], [72, 36, 62, 82], [138, 52, 46, 66]];
    for (const [x, y, w, h] of boxes) {
      fillPoly(ctx, [[x, y + h], [x + 2, y], [x + w - 2, y - 2], [x + w, y + h]], '#7f8a84', 0.48);
      hardPoly(ctx, [[x, y + h], [x + 2, y], [x + w - 2, y - 2], [x + w, y + h]], r,
        { width: 1.9, alpha: 0.88 });
      hardPoly(ctx, [[x, y], [x + 1, y - 9], [x + w - 1, y - 11], [x + w, y - 2]], r,
        { width: 1.6, alpha: 0.8 });
    }
    // and one bag beside them that did not go in
    scribbleCircle(ctx, 178, 112, 13, r, { width: 1.6, alpha: 0.7 }, 1.05);
  });
}

/** THE BICYCLE (Session 18): two wheels, a frame, the handlebars up
 *  and the bell on them. Drawn broadside and mirrored to lead with the
 *  front wheel, like the rowboat. The rider is the walker. */
export function bicycleTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(128, 80, seed, (ctx, r) => {
    for (const wx of [30, 98]) {
      scribbleCircle(ctx, wx, 56, 20, r, { width: 2.2, alpha: 0.9 }, 1.15);
      scribbleCircle(ctx, wx, 56, 3, r, { width: 1.2, alpha: 0.6 });
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI;
        line(ctx, wx + Math.cos(a) * 3, 56 + Math.sin(a) * 3, wx + Math.cos(a) * 19, 56 + Math.sin(a) * 19, r, { width: 0.9, alpha: 0.35, passes: 1 });
        line(ctx, wx - Math.cos(a) * 3, 56 - Math.sin(a) * 3, wx - Math.cos(a) * 19, 56 - Math.sin(a) * 19, r, { width: 0.9, alpha: 0.35, passes: 1 });
      }
    }
    // the frame: a diamond, a seat post, the forks
    stroke(ctx, [[30, 56], [52, 30], [88, 30], [98, 56]], r, { width: 2.2, alpha: 0.9 });
    stroke(ctx, [[52, 30], [64, 56], [88, 30]], r, { width: 2, alpha: 0.85 });
    line(ctx, 30, 56, 64, 56, r, { width: 1.8, alpha: 0.7 });
    // the saddle, and the handlebars up to nobody
    line(ctx, 44, 30, 60, 26, r, { width: 2.6, alpha: 0.9 });
    stroke(ctx, [[88, 30], [92, 16], [84, 14]], r, { width: 2, alpha: 0.85 });
    line(ctx, 96, 15, 82, 13, r, { width: 2.2, alpha: 0.9 });
    // the bell
    scribbleCircle(ctx, 90, 12, 2.6, r, { width: 1.2, alpha: 0.8, color: WASH.kingdom });
    // pedals
    line(ctx, 64, 56, 70, 66, r, { width: 1.4, alpha: 0.7 });
    line(ctx, 66, 66, 74, 66, r, { width: 1.8, alpha: 0.8 });
  });
}
