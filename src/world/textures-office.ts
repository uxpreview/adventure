import * as THREE from 'three';
import {
  makeTexture, stroke, line, scribbleCircle, hatch, legibleCaps, type Ctx2D,
} from '../engine/ink';
import { PENCIL, WASH } from '../engine/palette';

/**
 * THE CUBICLE MILE — the prop box, and the third rule.
 *
 * Session 14, to `design/specs/the-cubicle-mile.md`.
 *
 * ── THE RULE, AND WHY THIS LAND NEEDED A THIRD ONE ──────────────────
 *
 * Session 13 drew the two present-day lands at right angles to each
 * other: **in MAPLE COURT every mark closes** (a hedge is a loop, a
 * lawn is a kerb that comes back to itself) and **in GREYLINE CITY
 * every mark leaves the frame** (nothing in the land is a closed
 * silhouette). THE CUBICLE MILE is the third land whose subject is the
 * present day and it may be neither of those, so it takes the third
 * thing a line can do:
 *
 *   **EVERY MARK IS RULED, AND EVERY MARK STOPS SHORT OF THE ONE IT
 *   WAS GOING TO MEET.**
 *
 * A line can come back to itself, it can run off the page, or it can
 * stop just before it arrives. The third is what a PROMISE looks like
 * drawn — and a promise is what this land believes in (`THE-WAITS` §12:
 * *a timetable is a promise, and a promise is enough*).
 *
 * So `ruled()` below is the whole prop box in one function: straight
 * runs, no curve anywhere in anything architectural, and a hairline gap
 * at every corner where two rules were meant to meet. At a distance it
 * reads as a technical drawing; up close it reads as a drawing nobody
 * finished. It is never remarked on anywhere in the game.
 *
 * Two consequences the land is composed around:
 *
 *   · **glass is a ruled grid that goes pale before it reaches the edge
 *     of the building.** Greyline's window rules run off both sides of
 *     their towers; here they stop short, and the last courses fade.
 *   · **the roofline is the only line in the land drawn at full weight
 *     all the way across.** Every roof in the mile is at the same
 *     height, so the land has a second horizon three units above the
 *     real one — the straightedge, said in silhouette.
 *
 * Nothing in here is about the paper, the pen, or whoever drew it
 * (`WORLD-SYSTEMS` §0). A ruled land makes that temptation very loud.
 */

/* Pigments — every wash still comes out of palette.ts. */
const PANEL = ['#c9ccc9', '#d2cfc4', '#c2c7c9', '#cdc9c0'];
const CURTAIN = '#dfe2dd';
const GLASS = '#e6e8e2';
const SOFFIT = '#9aa0a2';
const STEEL = '#a8adb0';
const TARMAC = '#b6b3ac';
const PAINT = '#efece0';
const WARM = '#e8b878';
const LEAF = '#8ba077';
const RUST = '#9c7a58';

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
 * A RULED RUN THAT STOPS SHORT — the land's whole signature, and the
 * only drawing primitive in this file that is not in `ink.ts`.
 *
 * `stroke()` draws quadratics through the midpoints of its points, so a
 * rectangle handed to it comes back as a lozenge; `hardPoly` (Sessions
 * 11 and 13) fixed that by drawing every edge as its own `line`. This
 * is `hardPoly` with the one addition this land is built on: each edge
 * is pulled back from BOTH its corners by `gap` pixels, so the corner
 * is a junction two rules do not quite reach.
 *
 * `gap = 0` gives you `hardPoly` exactly, for the few things in the
 * land that genuinely do close — a bay's paint does not, a bin does.
 */
function ruled(
  ctx: Ctx2D, pts: [number, number][], r: () => number,
  o: Parameters<typeof line>[6] = {}, close = true, gap = 2.2
) {
  const n = close ? pts.length : pts.length - 1;
  for (let i = 0; i < n; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len = Math.hypot(dx, dy) || 1;
    // the gap is not the same at both ends and it is not the same on two
    // edges: a hand stops where it stops
    const g0 = gap * (0.55 + r() * 0.9);
    const g1 = gap * (0.55 + r() * 0.9);
    if (len < g0 + g1 + 2) continue;
    line(ctx, a[0] + (dx / len) * g0, a[1] + (dy / len) * g0,
      b[0] - (dx / len) * g1, b[1] - (dy / len) * g1, r, o);
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
 * THE MILE — nine blocks, and every roof at the same height.
 * ================================================================== */

/**
 * AN OFFICE BLOCK. Three kinds, and the variety in the mile comes from
 * the PLAN — how wide it is stood, how far back, which way it is turned
 * a degree or two, whether anybody is still in it at seven — never from
 * a fourth canvas (Session 10's costing rule).
 *
 *   0  the ribbon-window block: three bands of glazing, brick ends
 *   1  the curtain wall: one grid, corner to corner, with a dark base
 *   2  the panel block: precast panels with punched windows in them
 *
 * THE ROOF IS AT y = 26 IN ALL THREE, and the canvas is used to the
 * same depth in all three, which is what makes the level roofline work:
 * stood at the same height on flat ground, nine blocks off three
 * drawings give one dead-level line across the whole land.
 */
export function officeBlockTexture(seed: number, v: 0 | 1 | 2): THREE.CanvasTexture {
  return makeTexture(320, 160, seed, (ctx, r) => {
    const panel = PANEL[Math.floor(r() * 4)];
    const L = 22;
    const R = 298;
    const TOP = 26;
    const BASE = 148;
    fillPoly(ctx, [[L, BASE], [L, TOP], [R, TOP], [R, BASE]], panel, 0.55);

    /* THE ROOFLINE — the one line in this land at full weight all the
     * way across, and the only one drawn corner to corner with no gap
     * in it. Everything else in the drawing stops short of something. */
    line(ctx, L - 4, TOP, R + 4, TOP, r, { width: 2.6, alpha: 0.94 });
    // the parapet's own coping, a hair above it and shorter than it
    line(ctx, L + 6, TOP - 4, R - 6, TOP - 4, r, { width: 1.1, alpha: 0.45, passes: 1 });
    // the two ends, and they stop short of the roof and of the ground
    ruled(ctx, [[L, TOP], [L, BASE]], r, { width: 2.2, alpha: 0.9 }, false, 4);
    ruled(ctx, [[R, TOP], [R, BASE]], r, { width: 2.2, alpha: 0.9 }, false, 4);
    line(ctx, L + 2, BASE, R - 2, BASE, r, { width: 1.8, alpha: 0.7 });

    if (v === 0) {
      // ribbon windows: three bands, and each band stops short of both
      // ends of the building
      for (let b = 0; b < 3; b++) {
        const y = 44 + b * 34;
        const inset = 30 + b * 4;
        fillPoly(ctx, [[L + inset, y + 22], [L + inset, y], [R - inset, y], [R - inset, y + 22]],
          GLASS, 0.5);
        ruled(ctx, [[L + inset, y + 22], [L + inset, y], [R - inset, y], [R - inset, y + 22]], r,
          { width: 1.4, alpha: 0.8 }, true, 3);
        // the mullions, and the last two at each end fade
        const n = 11;
        for (let i = 1; i < n; i++) {
          const mx = L + inset + ((R - inset - L - inset) * i) / n;
          const edge = Math.min(i, n - i);
          line(ctx, mx, y + 3, mx, y + 19, r,
            { width: 0.9, alpha: edge <= 2 ? 0.12 * edge : 0.42, passes: 1 }, 2);
        }
      }
      // the brick ends, hatched, and the hatch stops short of the corner
      for (const [x0] of [[L + 4], [R - 26]] as [number][]) {
        hatch(ctx, x0, TOP + 12, 22, BASE - TOP - 22, 0.4, 7, r, { alpha: 0.2 });
      }
    } else if (v === 1) {
      // the curtain wall: one grid corner to corner, dark base
      fillPoly(ctx, [[L + 8, 128], [L + 8, TOP + 10], [R - 8, TOP + 10], [R - 8, 128]],
        CURTAIN, 0.5);
      const cols = 16;
      const rows = 4;
      for (let i = 1; i < cols; i++) {
        const mx = L + 8 + ((R - L - 16) * i) / cols;
        const edge = Math.min(i, cols - i);
        line(ctx, mx, TOP + 14, mx, 124, r,
          { width: 1, alpha: edge <= 2 ? 0.14 * edge : 0.44, passes: 1 }, 3);
      }
      for (let j = 1; j < rows; j++) {
        const my = TOP + 10 + ((118 - TOP) * j) / rows;
        line(ctx, L + 14, my, R - 14, my, r, { width: 1, alpha: 0.4, passes: 1 });
      }
      ruled(ctx, [[L + 8, 128], [L + 8, TOP + 10], [R - 8, TOP + 10], [R - 8, 128]], r,
        { width: 1.6, alpha: 0.78 }, true, 3);
      // the base course, in shadow, and it does not reach either end
      fillPoly(ctx, [[L + 16, BASE], [L + 16, 128], [R - 16, 128], [R - 16, BASE]], SOFFIT, 0.34);
      ruled(ctx, [[L + 16, BASE], [L + 16, 128], [R - 16, 128], [R - 16, BASE]], r,
        { width: 1.3, alpha: 0.6 }, true, 5);
    } else {
      // precast panels with punched windows
      const cols = 7;
      const rows = 3;
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = L + 10 + i * ((R - L - 20) / cols);
          const y = TOP + 12 + j * 38;
          const w = (R - L - 20) / cols - 8;
          fillPoly(ctx, [[x + 7, y + 26], [x + 7, y + 6], [x + w - 7, y + 6], [x + w - 7, y + 26]],
            GLASS, 0.5);
          ruled(ctx, [[x + 7, y + 26], [x + 7, y + 6], [x + w - 7, y + 6], [x + w - 7, y + 26]], r,
            { width: 1.2, alpha: 0.72 }, true, 2.4);
          // the panel joint down the right of each one, short at both ends
          ruled(ctx, [[x + w, y], [x + w, y + 34]], r,
            { width: 0.9, alpha: 0.24, passes: 1 }, false, 5);
        }
      }
      for (let j = 1; j < rows; j++) {
        line(ctx, L + 14, TOP + 12 + j * 38 - 4, R - 14, TOP + 12 + j * 38 - 4, r,
          { width: 0.9, alpha: 0.22, passes: 1 });
      }
    }

    /* THE DOOR — one, in the middle, with a flat canopy over it on two
     * posts, and the canopy's hatching stops short of the wall. */
    const dx = 140 + Math.floor(r() * 40);
    fillPoly(ctx, [[dx, BASE], [dx, 122], [dx + 34, 122], [dx + 34, BASE]], SOFFIT, 0.4);
    ruled(ctx, [[dx, BASE], [dx, 122], [dx + 34, 122], [dx + 34, BASE]], r,
      { width: 1.6, alpha: 0.85 }, true, 2);
    line(ctx, dx + 17, 124, dx + 17, BASE - 2, r, { width: 0.9, alpha: 0.4, passes: 1 });
    ruled(ctx, [[dx - 12, 118], [dx + 46, 118], [dx + 46, 112], [dx - 12, 112]], r,
      { width: 1.5, alpha: 0.8 }, true, 2.5);
    hatch(ctx, dx - 8, 112, 50, 6, 0.5, 5, r, { alpha: 0.2 });
  });
}

/**
 * THE WINDOWS, WARM. Its own canvas, stood in the same place as the
 * block, so a lit building is an opacity write rather than a second
 * building — Brim's terraces have worked this way since Session 6.
 *
 * **Not many of them are on.** An office at seven in the evening has
 * four lights burning on eleven floors and a cleaner on the third, and
 * a building lit right through would be a different land's picture.
 */
export function officeBlockLitTexture(seed: number, v: 0 | 1 | 2): THREE.CanvasTexture {
  return makeTexture(320, 160, seed, (ctx, r) => {
    const cells: [number, number, number, number][] = [];
    if (v === 0) {
      for (let b = 0; b < 3; b++) {
        const y = 44 + b * 34;
        const inset = 30 + b * 4;
        for (let i = 0; i < 11; i++) {
          const w = (298 - inset - 22 - inset) / 11;
          cells.push([22 + inset + i * w + 2, y + 3, w - 4, 16]);
        }
      }
    } else if (v === 1) {
      for (let i = 0; i < 16; i++) {
        for (let j = 0; j < 4; j++) {
          cells.push([30 + i * 16.4 + 2, 36 + j * 23 + 2, 12, 18]);
        }
      }
    } else {
      for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 3; j++) {
          const x = 32 + i * ((298 - 22 - 20) / 7);
          cells.push([x + 7, 38 + j * 38 + 6, ((298 - 22 - 20) / 7) - 14, 20]);
        }
      }
    }
    for (const [x, y, w, h] of cells) {
      if (r() > 0.17) continue;                       // four lights on eleven floors
      ctx.save();
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = WARM;
      ctx.fillRect(x, y, w, h);
      ctx.restore();
      stain(ctx, x + w / 2, y + h / 2, w * 1.6, WARM, 0.16);
    }
  });
}

/**
 * THE ATRIUM — the one building in the land that breaks the level line,
 * and it breaks it because it was phase two.
 *
 * It is the same drawing language two storeys taller with a glazed
 * entrance hall stuck on the front of it, and the entrance hall is the
 * only thing in the Cubicle Mile with a curve anywhere in it — a
 * segmental canopy — which is exactly why it reads as the front door.
 */
export function atriumTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(320, 224, seed, (ctx, r) => {
    const L = 30;
    const R = 290;
    const TOP = 22;
    const BASE = 210;
    fillPoly(ctx, [[L, BASE], [L, TOP], [R, TOP], [R, BASE]], PANEL[1], 0.55);
    line(ctx, L - 4, TOP, R + 4, TOP, r, { width: 2.8, alpha: 0.94 });
    line(ctx, L + 8, TOP - 5, R - 8, TOP - 5, r, { width: 1.1, alpha: 0.4, passes: 1 });
    ruled(ctx, [[L, TOP], [L, BASE]], r, { width: 2.3, alpha: 0.9 }, false, 5);
    ruled(ctx, [[R, TOP], [R, BASE]], r, { width: 2.3, alpha: 0.9 }, false, 5);

    // six courses of curtain wall, and the outermost columns fade out
    fillPoly(ctx, [[L + 10, 150], [L + 10, TOP + 10], [R - 10, TOP + 10], [R - 10, 150]],
      CURTAIN, 0.5);
    for (let i = 1; i < 15; i++) {
      const mx = L + 10 + ((R - L - 20) * i) / 15;
      const edge = Math.min(i, 15 - i);
      line(ctx, mx, TOP + 14, mx, 146, r,
        { width: 1, alpha: edge <= 2 ? 0.13 * edge : 0.42, passes: 1 }, 3);
    }
    for (let j = 1; j < 6; j++) {
      line(ctx, L + 16, TOP + 10 + ((140 - TOP) * j) / 6, R - 16,
        TOP + 10 + ((140 - TOP) * j) / 6, r, { width: 1, alpha: 0.38, passes: 1 });
    }
    ruled(ctx, [[L + 10, 150], [L + 10, TOP + 10], [R - 10, TOP + 10], [R - 10, 150]], r,
      { width: 1.7, alpha: 0.8 }, true, 3);

    /* THE ENTRANCE HALL — glazed, full height, and the only curve in
     * the land. A segmental canopy over the doors on two slender posts,
     * and the posts do not reach it. */
    const EL = 108;
    const ER = 214;
    fillPoly(ctx, [[EL, BASE], [EL, 150], [ER, 150], [ER, BASE]], GLASS, 0.48);
    ruled(ctx, [[EL, BASE], [EL, 150], [ER, 150], [ER, BASE]], r,
      { width: 1.9, alpha: 0.86 }, true, 3);
    for (const mx of [134, 161, 188]) {
      line(ctx, mx, 154, mx, BASE - 4, r, { width: 1, alpha: 0.4, passes: 1 });
    }
    stroke(ctx, [[EL - 16, 148], [161, 132], [ER + 16, 148]], r, { width: 2.2, alpha: 0.88 });
    for (const px of [EL + 4, ER - 4]) {
      ruled(ctx, [[px, 152], [px, BASE - 6]], r, { width: 1.6, alpha: 0.7 }, false, 6);
    }
    line(ctx, L + 4, BASE, R - 4, BASE, r, { width: 1.8, alpha: 0.7 });
  });
}

/** The atrium at seven in the evening: the hall stays lit all night
 *  because a reception desk is never dark, and four rooms above it are
 *  not. */
export function atriumLitTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(320, 224, seed, (ctx, r) => {
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = WARM;
    ctx.fillRect(112, 156, 98, 50);
    ctx.restore();
    stain(ctx, 161, 182, 76, WARM, 0.2);
    for (let i = 0; i < 15; i++) {
      for (let j = 0; j < 6; j++) {
        if (r() > 0.11) continue;
        const x = 40 + i * 17.3;
        const y = 34 + j * 19.6;
        ctx.save();
        ctx.globalAlpha = 0.55;
        ctx.fillStyle = WARM;
        ctx.fillRect(x, y, 13, 15);
        ctx.restore();
        stain(ctx, x + 6, y + 7, 22, WARM, 0.13);
      }
    }
  });
}

/**
 * THE DOORS THAT OPEN FOR YOU — the land's one player-responsive
 * motion, and the only thing in this world that reacts to the walker's
 * BODY rather than to what they know.
 *
 * Two leaves that slide apart. It is a machine being polite, nothing
 * happens, and `door-hiss` fires once on the opening edge.
 */
export function slidingDoorsTexture(seed: number, open: boolean): THREE.CanvasTexture {
  return makeTexture(128, 128, seed, (ctx, r) => {
    const gap = open ? 26 : 1;
    // the track over them, and it overruns the opening at both ends
    line(ctx, 6, 14, 122, 14, r, { width: 1.8, alpha: 0.8 });
    for (const s of [-1, 1] as const) {
      const inner = 64 + s * gap;
      const outer = 64 + s * 56;
      fillPoly(ctx, [[inner, 122], [inner, 20], [outer, 20], [outer, 122]], GLASS, 0.55);
      ruled(ctx, [[inner, 122], [inner, 20], [outer, 20], [outer, 122]], r,
        { width: 1.6, alpha: 0.85 }, true, 2.2);
      // the rubber edge, full weight — the one thing on a door you touch
      line(ctx, inner, 22, inner, 120, r, { width: 2.2, alpha: 0.9 });
    }
  });
}

/* ================================================================== *
 * THE 8:15 STOP — the premise, and the shot.
 * ================================================================== */

/**
 * THE SHELTER. A ruled box on four posts with a bench in it and a
 * cantilevered roof, and it is drawn the way every bus shelter that
 * ever stood on a road is drawn: three panels, a gap where you get in,
 * and a roof that overhangs the whole thing by a foot.
 *
 * **The desk plate is on the back panel and it says D. HALL**
 * (`THE-WAITS` §12). Nobody screws a desk plate to a bus shelter. He
 * did, and there is no note about it anywhere in this game.
 */
export function shelterTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(256, 192, seed, (ctx, r) => {
    const L = 20;
    const R = 236;
    const ROOF = 34;
    const FOOT = 182;

    /* THE ROOF — a slab, and it is the heaviest mark in the drawing.
     * Round 1 of the gate had a shelter you could see straight through:
     * everything was a hairline and the whole thing read as a pane of
     * glass standing in a car park. A shelter is a ROOF first. */
    fillPoly(ctx, [[L - 14, ROOF], [R + 14, ROOF], [R + 12, ROOF + 12], [L - 12, ROOF + 12]],
      SOFFIT, 0.5);
    line(ctx, L - 16, ROOF, R + 16, ROOF, r, { width: 3.4, alpha: 0.95 });
    line(ctx, L - 14, ROOF + 12, R + 14, ROOF + 12, r, { width: 2.2, alpha: 0.8 });
    hatch(ctx, L - 10, ROOF + 2, R - L + 20, 9, 0, 5, r, { alpha: 0.3 });

    /* THE BACK PANEL, and there is a WASH behind it: a bus shelter's
     * glass has a car park behind it and a car park is not white. */
    fillPoly(ctx, [[L + 14, FOOT], [L + 14, ROOF + 14], [R - 14, ROOF + 14], [R - 14, FOOT]],
      GLASS, 0.66);
    ruled(ctx, [[L + 14, FOOT], [L + 14, ROOF + 14], [R - 14, ROOF + 14], [R - 14, FOOT]], r,
      { width: 2.2, alpha: 0.9 }, true, 3);
    for (const mx of [L + 88, R - 88]) {
      ruled(ctx, [[mx, ROOF + 16], [mx, FOOT]], r, { width: 1.8, alpha: 0.72 }, false, 5);
    }
    // the reflections, which are what says a pane is a pane
    for (const [x0, y0] of [[L + 24, ROOF + 24], [L + 100, ROOF + 30]] as [number, number][]) {
      line(ctx, x0, y0, x0 + 40, y0 + 46, r, { width: 1.2, alpha: 0.2, passes: 1 });
      line(ctx, x0 + 12, y0, x0 + 52, y0 + 46, r, { width: 1, alpha: 0.14, passes: 1 });
    }

    /* THE TWO SIDE PANELS, turned in, which is what makes it a box you
     * can stand in out of the wind and not a screen. */
    for (const s0 of [-1, 1] as const) {
      const xo = s0 < 0 ? L + 14 : R - 14;
      const xi = s0 < 0 ? L : R;
      fillPoly(ctx, [[xo, FOOT], [xo, ROOF + 14], [xi, ROOF + 20], [xi, FOOT - 6]], GLASS, 0.5);
      ruled(ctx, [[xo, FOOT], [xo, ROOF + 14], [xi, ROOF + 20], [xi, FOOT - 6]], r,
        { width: 2, alpha: 0.85 }, true, 3);
    }

    /* THE POSTS — four, and they are the only thing here holding the
     * roof up, so they are drawn like it. */
    for (const px of [L + 2, R - 2]) {
      line(ctx, px, ROOF + 8, px, FOOT + 6, r, { width: 3, alpha: 0.92 });
    }

    /* THE BENCH: a seat, a back rail, and two brackets — and it is
     * empty, which is the only thing about it worth drawing. */
    fillPoly(ctx, [[L + 34, 152], [L + 34, 142], [R - 34, 142], [R - 34, 152]], SOFFIT, 0.42);
    ruled(ctx, [[L + 34, 152], [L + 34, 142], [R - 34, 142], [R - 34, 152]], r,
      { width: 2, alpha: 0.88 }, true, 4);
    ruled(ctx, [[L + 38, 132], [R - 38, 132]], r, { width: 1.7, alpha: 0.7 }, false, 6);
    for (const bx of [L + 48, R - 48]) {
      ruled(ctx, [[bx, 154], [bx, FOOT]], r, { width: 1.8, alpha: 0.8 }, false, 3);
    }

    /* the strip light in the roof, and it is OFF */
    ruled(ctx, [[L + 52, ROOF + 17], [R - 52, ROOF + 17]], r,
      { width: 2.2, alpha: 0.4, passes: 1 }, false, 4);

    /* THE DESK PLATE. Screwed to the back panel at shoulder height,
     * brass, with a bevel drawn round it — and it is the only closed
     * shape in the drawing, because a name plate is a finished object
     * and everything else here is a promise.
     *
     * **Nobody screws a desk plate to a bus shelter.** He did, and
     * there is no note about it anywhere in this game. */
    fillPoly(ctx, [[L + 28, 116], [L + 28, 94], [L + 106, 94], [L + 106, 116]], PAINT, 0.72);
    ruled(ctx, [[L + 28, 116], [L + 28, 94], [L + 106, 94], [L + 106, 116]], r,
      { width: 1.8, alpha: 0.9 }, true, 0);
    legibleCaps(ctx, 'D. HALL', L + 34, 98, 12, r, { alpha: 0.85, width: 1.5 });
    void PENCIL;
  });
}

/**
 * THE SHELTER'S LIGHT — Session 6's lamp code with a different
 * condition, exactly as `THE-WAITS` §12 says to copy it.
 *
 * It is a strip in the roof and a pool of it on the bench and the
 * ground. **It is not on when you first come here.** Walk the line —
 * gate to car park, and you are the only thing that ever has — and it
 * is on at dusk, and at every dusk afterwards, in every save.
 *
 * *A stop with a light on is a stop that expects somebody at an hour
 * when it is dark.*
 */
export function shelterLitTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(256, 192, seed, (ctx, r) => {
    ctx.save();
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = WARM;
    ctx.fillRect(68, 48, 120, 7);
    ctx.restore();
    stain(ctx, 128, 52, 116, WARM, 0.5);
    // what a strip light in a roof actually does: it lights the panel
    // behind it, the seat under it and eight feet of tarmac in front
    /* what a strip light in a roof actually does, and it is not a flat
     * orange rectangle: it lights the panel behind it hardest at the
     * top, the bench under it, and eight feet of tarmac in front. Round
     * 3 filled the whole shelter at one alpha and it came back as a
     * lozenge of colour rather than a lit room. */
    const g = ctx.createLinearGradient(0, 56, 0, 178);
    g.addColorStop(0, 'rgba(232,184,120,0.42)');
    g.addColorStop(0.55, 'rgba(232,184,120,0.16)');
    g.addColorStop(1, 'rgba(232,184,120,0.05)');
    ctx.save();
    ctx.fillStyle = g;
    ctx.fillRect(34, 56, 188, 122);
    ctx.restore();
    stain(ctx, 128, 146, 78, WARM, 0.26);
    stain(ctx, 128, 188, 140, WARM, 0.26);
    void r;
  });
}

/**
 * THE TIMETABLE — and it is a SURVEY SCHEDULE (`THE-WAITS` §12).
 *
 * Twelve names and twelve times. The times are the hours the surveyors
 * were due at each point down the line; **8:15 is when they were due
 * here, and the last entry on it is this stop, because this is where
 * the survey stopped.**
 *
 * It is the only document in the world that names all twelve lands in
 * order, and Dennis has it by heart, and **it has never once occurred
 * to him that they are places.** To him they are stops: a list, in
 * sequence, that somebody once wrote down as though they belonged
 * together. Which they do.
 *
 * **Nothing in this game ever says any of that.** The board is a
 * drawing with a list on it and the player is the only thing in the
 * world that can read it and understand what they are reading.
 *
 * `wiped` is `THE-STRANGERS` S8: one line cleaned of a century of grime,
 * and nobody in the Cubicle Mile notices, because nobody has ever
 * listened to the whole list.
 */
export function timetableTexture(
  seed: number, rows: string[][], wiped: number
): THREE.CanvasTexture {
  return makeTexture(224, 288, seed, (ctx, r) => {
    // the case: a glazed frame on two legs, and the frame stops short
    fillPoly(ctx, [[14, 232], [14, 14], [210, 14], [210, 232]], PAINT, 0.78);
    ruled(ctx, [[14, 232], [14, 14], [210, 14], [210, 232]], r, { width: 2.6, alpha: 0.92 }, true, 3);
    ruled(ctx, [[22, 224], [22, 24], [202, 24], [202, 224]], r,
      { width: 1.3, alpha: 0.45, passes: 1 }, true, 4);
    for (const lx of [42, 182]) {
      ruled(ctx, [[lx, 234], [lx, 286]], r, { width: 2.4, alpha: 0.86 }, false, 4);
    }
    // a rule under the head, and it does not reach either side
    ruled(ctx, [[30, 44], [194, 44]], r, { width: 1.6, alpha: 0.68 }, false, 6);

    /* THE TWELVE, in the surveyors' order. Set at the size a timetable
     * in a case on a post is actually set at, which is small — the
     * player reads it by standing in front of it, and that is what the
     * prompt is for. Round 1 set it at seven pixels under a stain and
     * the whole board came back as a grey smear. */
    for (let i = 0; i < rows.length; i++) {
      const y = 52 + i * 14.6;
      const dim = i === wiped ? 0.88 : 0.5 + r() * 0.08;
      legibleCaps(ctx, rows[i][0], 28, y, 8.2, r, { alpha: dim, width: 1.25 });
      legibleCaps(ctx, rows[i][1], 154, y, 8.2, r, { alpha: dim, width: 1.25 });
    }

    /* A CENTURY OF GRIME, over everything except the line somebody
     * wiped. It is drawn LAST and it is drawn as a stain, so the type
     * under it is there and is simply older — which is what makes one
     * clean line legible from across a car park. */
    for (let i = 0; i < rows.length; i++) {
      if (i === wiped) continue;
      stain(ctx, 112, 58 + i * 14.6, 74, '#8b8b80', 0.07);
    }
    stain(ctx, 52, 206, 84, '#8b8b80', 0.1);
    stain(ctx, 182, 62, 62, '#8b8b80', 0.08);
  });
}

/**
 * DENNIS. Two postures and no face (`WORLD-SYSTEMS` §5): one visible
 * want each, expressed by where they stand.
 *
 *   0  standing under the shelter, facing north up a road, coat
 *      buttoned, case in the hand nearest the road. This is most of the
 *      day and it is the shot.
 *   1  at the board with an arm up, reading a list he knows by heart.
 *      Once, in the morning, at about eight.
 */
export function dennisTexture(seed: number, p: 0 | 1): THREE.CanvasTexture {
  return makeTexture(96, 160, seed, (ctx, r) => {
    const o = { width: 2.6, alpha: 0.95 };
    // the coat: a ruled overcoat with a wash in it, and its hem stops
    // short of the legs
    fillPoly(ctx, [[32, 128], [32, 52], [64, 52], [64, 128]], SOFFIT, 0.4);
    ruled(ctx, [[32, 128], [32, 52], [64, 52], [64, 128]], r, o, true, 2.6);
    line(ctx, 48, 58, 48, 124, r, { width: 1.3, alpha: 0.45, passes: 1 });
    // head and collar
    scribbleCircle(ctx, 48, 36, 12.5, r, o);
    ruled(ctx, [[35, 55], [48, 47], [61, 55]], r, { width: 1.9, alpha: 0.8 }, false, 1.2);
    // legs, and the trousers are pressed
    for (const lx of [41, 56]) line(ctx, lx, 128, lx, 151, r, { width: 2.4, alpha: 0.92 });
    line(ctx, 36, 152, 46, 152, r, { width: 2.2, alpha: 0.9 });
    line(ctx, 51, 152, 61, 152, r, { width: 2.2, alpha: 0.9 });
    if (p === 0) {
      /* THE CASE, in the hand nearest the road, HELD and not carried —
       * which is the whole posture: a man who has been ready to go
       * since before it was light. */
      line(ctx, 64, 66, 71, 96, r, { width: 2.2, alpha: 0.9 });
      fillPoly(ctx, [[63, 112], [63, 94], [85, 94], [85, 112]], SOFFIT, 0.42);
      ruled(ctx, [[63, 112], [63, 94], [85, 94], [85, 112]], r, { width: 2, alpha: 0.9 }, true, 1.4);
      line(ctx, 69, 94, 74, 88, r, { width: 1.5, alpha: 0.7, passes: 1 });
    } else {
      // the arm up at the board, and it is a small reach: he is not
      // pointing, he is steadying a case he does not need to read
      line(ctx, 62, 66, 80, 48, r, { width: 2.2, alpha: 0.9 });
      line(ctx, 80, 48, 87, 46, r, { width: 1.7, alpha: 0.78, passes: 1 });
      fillPoly(ctx, [[21, 114], [21, 96], [43, 96], [43, 114]], SOFFIT, 0.42);
      ruled(ctx, [[21, 114], [21, 96], [43, 96], [43, 114]], r, { width: 2, alpha: 0.88 }, true, 1.4);
    }
  });
}

/* ================================================================== *
 * THE SEAM, THE SITE AND THE THINGS ON IT.
 * ================================================================== */

/** THE BARRIER, up — and rusted up. The counterweight is at the top of
 *  its arc and has been for so long that the tarmac under the boom has
 *  never once been marked. */
export function barrierTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(128, 256, seed, (ctx, r) => {
    /* ROUND 2 OF THE GATE DREW THIS ON A WIDE CANVAS and the boom came
     * back as a six-inch sliver in a seven-unit drawing: a lifting
     * barrier that is UP is a TALL silhouette, and the drawing has to
     * be the shape of the thing. */
    const PX = 58;
    const FOOT = 244;
    // the post
    fillPoly(ctx, [[PX - 11, FOOT], [PX - 11, 128], [PX + 11, 128], [PX + 11, FOOT]], STEEL, 0.55);
    ruled(ctx, [[PX - 11, FOOT], [PX - 11, 128], [PX + 11, 128], [PX + 11, FOOT]], r,
      { width: 2.8, alpha: 0.94 }, true, 3);
    // the pivot housing on top of it
    ruled(ctx, [[PX - 17, 128], [PX - 17, 100], [PX + 17, 100], [PX + 17, 128]], r,
      { width: 2.4, alpha: 0.92 }, true, 2.4);
    scribbleCircle(ctx, PX, 114, 6, r, { width: 1.7, alpha: 0.72 });
    line(ctx, PX - 20, FOOT + 2, PX + 20, FOOT + 2, r, { width: 2.6, alpha: 0.9 });

    /* THE BOOM, STRAIGHT UP over an entrance that has not been closed
     * in thirty years — and it leans two degrees, because nothing that
     * has stood in one position that long is plumb. */
    const lean = 9;
    const TIP = 12;
    fillPoly(ctx, [[PX - 7, 100], [PX - 7 + lean, TIP], [PX + 7 + lean, TIP], [PX + 7, 100]],
      PAINT, 0.7);
    ruled(ctx, [[PX - 7, 100], [PX - 7 + lean, TIP], [PX + 7 + lean, TIP], [PX + 7, 100]], r,
      { width: 2.6, alpha: 0.94 }, true, 2.4);
    // five bands, and the top one runs off the end of the boom
    for (let i = 0; i < 5; i++) {
      const t0 = i / 5;
      const y0 = 100 + (TIP - 100) * t0;
      hatch(ctx, PX - 6 + lean * t0, y0 - 11, 13, 10, 0.72, 3.4, r, { alpha: 0.3 });
    }
    /* THE COUNTERWEIGHT, at the bottom of the post, which is where it
     * ends up when the boom is up — and it has rusted there. */
    fillPoly(ctx, [[PX - 22, 186], [PX - 22, 156], [PX + 22, 156], [PX + 22, 186]], STEEL, 0.5);
    ruled(ctx, [[PX - 22, 186], [PX - 22, 156], [PX + 22, 156], [PX + 22, 186]], r,
      { width: 2.2, alpha: 0.9 }, true, 2);
    stain(ctx, PX, 206, 26, RUST, 0.36);
    stain(ctx, PX, 236, 30, RUST, 0.22);

    /* AND THE SOCKET ON THE OTHER SIDE OF THE ROAD, with nothing in it
     * and nothing ever in it. */
    ruled(ctx, [[104, FOOT], [104, 208], [120, 208], [120, FOOT]], r,
      { width: 2, alpha: 0.86 }, true, 2);
  });
}

/**
 * THE ESTATE BOARD at the entrance, and it is the land's whole thesis
 * bolted to two posts: a heading, and six slots for the names of the
 * six tenants the site was drawn for, and **two of them have anything
 * in them at all.**
 *
 * Nobody ever reads it. There is no note on it and there never will be.
 */
export function estateBoardTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(224, 192, seed, (ctx, r) => {
    const L = 18;
    const R = 206;
    fillPoly(ctx, [[L, 148], [L, 12], [R, 12], [R, 148]], PAINT, 0.74);
    line(ctx, L - 6, 12, R + 6, 12, r, { width: 2.8, alpha: 0.94 });
    ruled(ctx, [[L, 14], [L, 148]], r, { width: 2.2, alpha: 0.9 }, false, 4);
    ruled(ctx, [[R, 14], [R, 148]], r, { width: 2.2, alpha: 0.9 }, false, 4);
    line(ctx, L + 3, 148, R - 3, 148, r, { width: 2, alpha: 0.8 });
    for (const px of [L + 34, R - 34]) {
      ruled(ctx, [[px, 150], [px, 190]], r, { width: 2.6, alpha: 0.88 }, false, 4);
    }
    // the heading band, and it is the only thing on the board anybody
    // ever paid a signwriter for
    fillPoly(ctx, [[L + 10, 44], [L + 10, 22], [R - 10, 22], [R - 10, 44]], SOFFIT, 0.4);
    ruled(ctx, [[L + 10, 44], [L + 10, 22], [R - 10, 22], [R - 10, 44]], r,
      { width: 1.6, alpha: 0.7 }, true, 3);
    hatch(ctx, L + 18, 27, 152, 12, 0, 5.5, r, { alpha: 0.34 });
    // six slots, and four are empty
    for (let i = 0; i < 6; i++) {
      const y = 56 + i * 15;
      ruled(ctx, [[L + 16, y + 11], [L + 16, y], [R - 16, y], [R - 16, y + 11]], r,
        { width: 1.2, alpha: 0.44 }, true, 3);
      if (i === 0 || i === 3) {
        hatch(ctx, L + 22, y + 2, 100 + r() * 40, 7, 0, 4, r, { alpha: 0.3 });
      }
    }
    stain(ctx, 40, 130, 44, '#8b8b80', 0.1);
  });
}

/** THE GATEHOUSE — a hut with a window, a kettle in it, and nobody. */
export function gatehouseTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(160, 160, seed, (ctx, r) => {
    fillPoly(ctx, [[22, 146], [22, 44], [138, 44], [138, 146]], PANEL[2], 0.55);
    line(ctx, 14, 44, 146, 44, r, { width: 2.4, alpha: 0.92 });
    ruled(ctx, [[22, 44], [22, 146]], r, { width: 2, alpha: 0.88 }, false, 4);
    ruled(ctx, [[138, 44], [138, 146]], r, { width: 2, alpha: 0.88 }, false, 4);
    line(ctx, 24, 146, 136, 146, r, { width: 1.7, alpha: 0.7 });
    // the window, which is most of the front of it
    fillPoly(ctx, [[36, 106], [36, 60], [124, 60], [124, 106]], GLASS, 0.5);
    ruled(ctx, [[36, 106], [36, 60], [124, 60], [124, 106]], r, { width: 1.7, alpha: 0.85 }, true, 3);
    ruled(ctx, [[80, 62], [80, 104]], r, { width: 1.1, alpha: 0.45, passes: 1 }, false, 3);
    // the kettle on the sill, and a mug beside it, and that is the whole
    // of what anybody knows about whoever used to sit here
    ruled(ctx, [[46, 104], [46, 94], [58, 94], [58, 104]], r, { width: 1.2, alpha: 0.7 }, true, 0);
    line(ctx, 58, 96, 62, 99, r, { width: 1, alpha: 0.6, passes: 1 });
    ruled(ctx, [[66, 104], [66, 98], [72, 98], [72, 104]], r, { width: 1, alpha: 0.6 }, true, 0);
    // the door, shut
    ruled(ctx, [[100, 146], [100, 112], [124, 112], [124, 146]], r, { width: 1.5, alpha: 0.8 }, true, 2);
  });
}

/** A LIGHTING COLUMN — the only vertical in a level land, and there are
 *  four of them, and at dusk they are all on over an empty car park. */
export function lampStandardTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(64, 256, seed, (ctx, r) => {
    line(ctx, 30, 246, 31, 34, r, { width: 3.6, alpha: 0.94 });
    line(ctx, 24, 246, 40, 246, r, { width: 2.6, alpha: 0.85 });
    // the outreach arm and the lantern, and the arm does not touch it
    ruled(ctx, [[31, 34], [31, 24], [50, 20]], r, { width: 2.6, alpha: 0.9 }, false, 2);
    ruled(ctx, [[41, 22], [43, 13], [61, 13], [60, 22]], r, { width: 2.2, alpha: 0.88 }, true, 1.6);
    // the access door at the base, which every column has and nobody
    // has ever opened
    ruled(ctx, [[26, 214], [26, 190], [36, 190], [36, 214]], r,
      { width: 1, alpha: 0.35, passes: 1 }, true, 2);
  });
}

/** The same column with the light on: a lantern and the cone under it. */
export function lampStandardLitTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(64, 256, seed, (ctx, r) => {
    /* THE LANTERN. Round 4 drew it as a hard orange bar at nine tenths
     * alpha and it came back as a rectangle hanging in the air over the
     * mile: a light is a SOURCE with a halo, not a painted panel, and
     * the halo is most of what the eye reads at forty units. */
    ctx.save();
    ctx.globalAlpha = 0.62;
    ctx.fillStyle = WARM;
    ctx.beginPath();
    ctx.ellipse(51, 19, 9, 4.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    stain(ctx, 51, 19, 30, WARM, 0.72);
    stain(ctx, 51, 22, 62, WARM, 0.24);
    /* THE CONE. A lighting column over a car park throws a long soft
     * wedge down the tarmac, and it is the only thing in this land at
     * dusk that is a shape made of light rather than a shape with light
     * on it — which is what makes the ONE dark shelter read. */
    const g = ctx.createLinearGradient(51, 22, 40, 250);
    g.addColorStop(0, 'rgba(232,184,120,0.34)');
    g.addColorStop(1, 'rgba(232,184,120,0)');
    ctx.save();
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(47, 22);
    ctx.lineTo(56, 22);
    ctx.lineTo(64, 250);
    ctx.lineTo(24, 250);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    void r;
  });
}

/** THREE FLAGPOLES AND ONE FLAG. The flag is drawn separately so it can
 *  move; these are the poles, and two of them are bare. */
export function flagpolesTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(160, 192, seed, (ctx, r) => {
    for (const [px, top] of [[34, 26], [80, 14], [126, 26]] as [number, number][]) {
      line(ctx, px, 182, px + 1, top, r, { width: 2, alpha: 0.88 });
      scribbleCircle(ctx, px, top - 4, 3, r, { width: 1.2, alpha: 0.7 });
      // the halyard, cleated off, and it does not reach the cleat
      ruled(ctx, [[px + 3, top + 4], [px + 3, 150]], r,
        { width: 0.8, alpha: 0.3, passes: 1 }, false, 5);
      line(ctx, px - 3, 182, px + 5, 182, r, { width: 1.5, alpha: 0.7 });
    }
  });
}

/** The one flag, on the middle pole, and it is the only thing at the
 *  atrium that moves on its own. */
export function officeFlagTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(96, 64, seed, (ctx, r) => {
    /* THE ONE FLAG, on the middle pole of three, and it is the only
     * thing at the atrium that moves on its own. Round 5 drew it at
     * half alpha on a two-unit standee and it disappeared into the
     * curtain wall behind it: a flag is a solid object with a hard
     * edge, seen against the sky, and it is drawn like one. */
    fillPoly(ctx, [[6, 6], [90, 12], [90, 56], [6, 52]], CURTAIN, 0.72);
    ruled(ctx, [[6, 6], [90, 12], [90, 56], [6, 52]], r, { width: 2.6, alpha: 0.94 }, true, 2.2);
    // the hoist edge, full weight — it is the part attached to a rope
    line(ctx, 6, 4, 6, 54, r, { width: 3, alpha: 0.95 });
    hatch(ctx, 14, 18, 68, 26, 0.12, 6, r, { alpha: 0.3 });
    // and the fold in it, because a flag in any wind at all has one
    stroke(ctx, [[34, 8], [40, 32], [32, 54]], r, { width: 1.4, alpha: 0.35, passes: 1 });
  });
}

/** THE PLANTED BED — shrubs in a ruled row, and each one is a clipped
 *  box that has been clipped so long it has corners. Three variants:
 *  the bar forbids one silhouette repeated across a frame. */
export function plannedShrubTexture(seed: number, v: 0 | 1 | 2): THREE.CanvasTexture {
  return makeTexture(96, 96, seed, (ctx, r) => {
    const w = v === 1 ? 30 : v === 2 ? 40 : 35;
    const h = v === 2 ? 26 : 34;
    const box: [number, number][] = [
      [48 - w, 88], [48 - w, 88 - h], [48 + w, 88 - h], [48 + w, 88],
    ];
    fillPoly(ctx, box, LEAF, 0.42);
    ruled(ctx, box, r, { width: 1.8, alpha: 0.82 }, true, 2.6);
    // the one thing that says it is alive: a few shoots over the ruled
    // top, and they are the only unruled marks in the drawing
    for (let i = 0; i < 5 + Math.floor(r() * 4); i++) {
      const x = 48 - w + r() * w * 2;
      stroke(ctx, [[x, 88 - h + 2], [x + (r() - 0.5) * 5, 88 - h - 6 - r() * 7]], r,
        { width: 1.1, alpha: 0.6, passes: 1 });
    }
    hatch(ctx, 48 - w + 3, 88 - h + 5, w * 2 - 6, h - 8, 0.55, 6, r, { alpha: 0.16 });
  });
}

/** A BOLLARD. The near layer, and the only thing in the land at knee
 *  height. Two variants; one of them has been hit. */
export function bollardTexture(seed: number, hit: boolean): THREE.CanvasTexture {
  return makeTexture(48, 96, seed, (ctx, r) => {
    const lean = hit ? 7 : 0;
    ruled(ctx, [[18, 90], [18 + lean, 20], [30 + lean, 20], [30, 90]], r,
      { width: 2, alpha: 0.9 }, true, 2.2);
    line(ctx, 18 + lean * 0.9, 30, 30 + lean * 0.9, 30, r, { width: 1.2, alpha: 0.5, passes: 1 });
    if (hit) stain(ctx, 24, 90, 16, '#8b8b80', 0.2);
  });
}

/** A LITTER BIN, and a SAND-TOPPED one for the smoking spot. The sand
 *  bin is the only object in the Cubicle Mile that anybody chose the
 *  position of. */
export function officeBinTexture(seed: number, sand: boolean): THREE.CanvasTexture {
  return makeTexture(64, 96, seed, (ctx, r) => {
    ruled(ctx, [[16, 88], [19, 30], [45, 30], [48, 88]], r, { width: 1.9, alpha: 0.88 }, true, 2);
    line(ctx, 17, 40, 47, 40, r, { width: 1.1, alpha: 0.45, passes: 1 });
    if (sand) {
      // a flat sand tray on the top, and the stubs in it
      ruled(ctx, [[17, 30], [17, 22], [47, 22], [47, 30]], r, { width: 1.5, alpha: 0.8 }, true, 1.6);
      for (let i = 0; i < 7; i++) {
        const x = 20 + r() * 24;
        line(ctx, x, 26, x + (r() - 0.5) * 4, 23, r, { width: 1, alpha: 0.5, passes: 1 }, 2);
      }
    } else {
      ruled(ctx, [[18, 30], [18, 24], [46, 24], [46, 30]], r, { width: 1.5, alpha: 0.78 }, true, 1.6);
    }
  });
}

/** A CAR. Three, and they are the only curves in the car park. */
export function officeCarTexture(seed: number, v: 0 | 1 | 2): THREE.CanvasTexture {
  return makeTexture(160, 96, seed, (ctx, r) => {
    const roofH = v === 1 ? 26 : v === 2 ? 34 : 30;
    stroke(ctx, [
      [12, 74], [16, 56], [42, 52], [56, roofH], [104, roofH], [122, 52], [146, 56], [150, 74],
    ], r, { width: 2, alpha: 0.9 });
    line(ctx, 14, 74, 148, 74, r, { width: 1.9, alpha: 0.88 });
    // the glass, ruled, stopping short of the pillars
    ruled(ctx, [[58, 50], [62, roofH + 3], [98, roofH + 3], [102, 50]], r,
      { width: 1.3, alpha: 0.6 }, true, 2.4);
    line(ctx, 80, roofH + 4, 80, 49, r, { width: 1, alpha: 0.4, passes: 1 });
    for (const wx of [44, 118]) {
      scribbleCircle(ctx, wx, 76, 11, r, { width: 1.8, alpha: 0.85 });
      scribbleCircle(ctx, wx, 76, 4, r, { width: 1.1, alpha: 0.5 });
    }
    stain(ctx, 80, 88, 60, '#8b8b80', 0.14);
  });
}

/** THE BACK OF HOUSE. What an office park looks like from behind, which
 *  is extract fans, a bin store and a substation with a sign on it —
 *  and the sign is the only thing back here anybody ever printed. */
export function backOfHouseTexture(seed: number, v: 0 | 1): THREE.CanvasTexture {
  return makeTexture(256, 160, seed, (ctx, r) => {
    if (v === 0) {
      // the bin store: a brick pen with the gates open and never shut
      fillPoly(ctx, [[24, 148], [24, 74], [190, 74], [190, 148]], PANEL[3], 0.66);
      line(ctx, 18, 74, 196, 74, r, { width: 3, alpha: 0.94 });
      ruled(ctx, [[24, 74], [24, 148]], r, { width: 2.6, alpha: 0.9 }, false, 4);
      ruled(ctx, [[190, 74], [190, 148]], r, { width: 2.6, alpha: 0.9 }, false, 4);
      line(ctx, 26, 148, 188, 148, r, { width: 2, alpha: 0.72 });
      /* THE BRICK COURSES. Round 5 laid these at fifteen per cent and
       * from twenty units the whole pen came back as a pale grey box —
       * a back-of-house wall is the DIRTIEST thing in a clean land and
       * it has to hold its own against nine ruled glass buildings. */
      hatch(ctx, 30, 82, 154, 60, 0, 9, r, { alpha: 0.34 });
      for (let y = 84; y < 146; y += 11) {
        line(ctx, 28, y, 186, y + (r() - 0.5) * 2, r, { width: 1, alpha: 0.22, passes: 1 });
      }
      // the gate, open, leaning against its own wall
      ruled(ctx, [[196, 146], [204, 84], [232, 88], [226, 148]], r,
        { width: 2.2, alpha: 0.88 }, true, 2.4);
      // and one bin out, because it is always one bin out
      fillPoly(ctx, [[62, 148], [66, 104], [98, 104], [102, 148]], SOFFIT, 0.44);
      ruled(ctx, [[62, 148], [66, 104], [98, 104], [102, 148]], r,
        { width: 2.3, alpha: 0.9 }, true, 2);
      line(ctx, 65, 112, 99, 112, r, { width: 1.4, alpha: 0.5, passes: 1 });
    } else {
      // the substation: a blockhouse, a louvre, a sign, and the fans
      fillPoly(ctx, [[40, 148], [40, 88], [150, 88], [150, 148]], PANEL[0], 0.68);
      line(ctx, 34, 88, 156, 88, r, { width: 3, alpha: 0.94 });
      ruled(ctx, [[40, 88], [40, 148]], r, { width: 2.6, alpha: 0.9 }, false, 4);
      ruled(ctx, [[150, 88], [150, 148]], r, { width: 2.6, alpha: 0.9 }, false, 4);
      line(ctx, 43, 148, 147, 148, r, { width: 2, alpha: 0.72 });
      // the louvre, in a recessed frame so it reads as a hole and not
      // as a stripe pattern painted on a wall
      fillPoly(ctx, [[54, 146], [54, 100], [136, 100], [136, 146]], SOFFIT, 0.5);
      ruled(ctx, [[54, 146], [54, 100], [136, 100], [136, 146]], r,
        { width: 2, alpha: 0.86 }, true, 3);
      for (let i = 0; i < 6; i++) {
        ruled(ctx, [[58, 106 + i * 7], [132, 106 + i * 7]], r,
          { width: 1.6, alpha: 0.72, passes: 1 }, false, 3);
      }
      ruled(ctx, [[80, 140], [80, 128], [112, 128], [112, 140]], r,
        { width: 1.2, alpha: 0.7 }, true, 0);
      // three extract fans on the roof of the block behind it, each a
      // ruled box with a cowl, and none of them turning
      for (const [fx, fw] of [[168, 22], [198, 28], [232, 20]] as [number, number][]) {
        fillPoly(ctx, [[fx, 88], [fx, 66], [fx + fw, 66], [fx + fw, 88]], STEEL, 0.5);
        ruled(ctx, [[fx, 88], [fx, 66], [fx + fw, 66], [fx + fw, 88]], r,
          { width: 2.1, alpha: 0.88 }, true, 2);
        line(ctx, fx - 4, 66, fx + fw + 4, 66, r, { width: 1.9, alpha: 0.8 });
        scribbleCircle(ctx, fx + fw / 2, 78, fw * 0.3, r, { width: 1.3, alpha: 0.45 });
      }
    }
  });
}

/** THE MUSTER SIGN — a sign on a post, and it is the only place in the
 *  Cubicle Mile where everybody has ever stood together at once. */
export function musterSignTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(96, 160, seed, (ctx, r) => {
    line(ctx, 46, 156, 47, 62, r, { width: 2, alpha: 0.88 });
    fillPoly(ctx, [[10, 60], [10, 12], [86, 12], [86, 60]], PAINT, 0.55);
    ruled(ctx, [[10, 60], [10, 12], [86, 12], [86, 60]], r, { width: 1.8, alpha: 0.88 }, true, 2.4);
    legibleCaps(ctx, 'ASSEMBLY', 17, 22, 9, r, { alpha: 0.72, width: 1.1 });
    legibleCaps(ctx, 'POINT', 28, 40, 9, r, { alpha: 0.72, width: 1.1 });
    void PENCIL;
  });
}

/** THE FOLK. Three, all carrying something, all mid-stride, and every
 *  one of them is going toward a door. */
export function officeFolkTexture(seed: number, v: 0 | 1 | 2): THREE.CanvasTexture {
  return makeTexture(96, 160, seed, (ctx, r) => {
    const o = { width: 2, alpha: 0.88 };
    scribbleCircle(ctx, 48, 38, 10, r, o);
    if (v === 0) {
      // a coat, and a case swinging
      ruled(ctx, [[36, 122], [36, 52], [60, 52], [60, 122]], r, o, true, 2.4);
      line(ctx, 60, 66, 70, 96, r, { width: 1.7, alpha: 0.82 });
      ruled(ctx, [[66, 110], [66, 96], [82, 96], [82, 110]], r, { width: 1.5, alpha: 0.8 }, true, 1.4);
    } else if (v === 1) {
      // a shorter coat, a box held with both arms
      ruled(ctx, [[36, 116], [36, 52], [60, 52], [60, 116]], r, o, true, 2.4);
      ruled(ctx, [[30, 100], [30, 78], [66, 78], [66, 100]], r, { width: 1.6, alpha: 0.82 }, true, 1.8);
    } else {
      // a lanyard and nothing in the hands at all
      ruled(ctx, [[36, 118], [36, 52], [60, 52], [60, 118]], r, o, true, 2.4);
      ruled(ctx, [[44, 76], [48, 52]], r, { width: 1.1, alpha: 0.5, passes: 1 }, false, 1);
      ruled(ctx, [[52, 76], [48, 52]], r, { width: 1.1, alpha: 0.5, passes: 1 }, false, 1);
      ruled(ctx, [[42, 84], [42, 76], [54, 76], [54, 84]], r, { width: 1.2, alpha: 0.6 }, true, 0);
    }
    // mid-stride, always: the legs are never together in this land
    line(ctx, 42, 118, 34, 152, r, { width: 1.9, alpha: 0.86 });
    line(ctx, 54, 118, 62, 150, r, { width: 1.9, alpha: 0.86 });
    line(ctx, 29, 153, 39, 153, r, { width: 1.6, alpha: 0.82 });
    line(ctx, 58, 151, 68, 151, r, { width: 1.6, alpha: 0.82 });
  });
}

/** THE PAPER CUP that turns in the eddy at the corner of the east
 *  block, forever, and never gets anywhere. */
export function paperCupTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(48, 48, seed, (ctx, r) => {
    ruled(ctx, [[14, 40], [17, 12], [33, 12], [36, 40]], r, { width: 1.6, alpha: 0.85 }, true, 1.6);
    line(ctx, 16, 18, 34, 18, r, { width: 1, alpha: 0.45, passes: 1 });
  });
}

/* ================================================================== *
 * THE GROUND — and in this land the ground is PAINT.
 *
 * The office park is the flattest ground in the world (elevation.ts
 * gives it a cockle weight of 0.18 and no landform comes near it), so
 * it is the one land with no landform to recede along. What replaces
 * one is the car park: ruled bays running away north, which a decal
 * draws in perfect perspective for nothing.
 * ================================================================== */

/**
 * A RUN OF PARKING BAYS. Three states, and the three of them are the
 * land's whole story told in paint:
 *
 *   0  painted        the frontage, kept up
 *   1  faded          the far end of the main car park
 *   2  never painted  the overflow, where they set out the kerbs and
 *                     the drainage and stopped
 *
 * **The paint stops short of the kerb at both ends of every bay**,
 * which is what road paint actually does and which is the land's rule.
 */
export function bayRunDecal(seed: number, v: 0 | 1 | 2): THREE.CanvasTexture {
  return makeTexture(256, 512, seed, (ctx, r) => {
    fillPoly(ctx, [[0, 0], [256, 0], [256, 512], [0, 512]], TARMAC, v === 2 ? 0.2 : 0.34);
    // the aisle's two kerbs, ruled, and they are the only continuous
    // marks in the drawing
    for (const kx of [18, 238]) {
      line(ctx, kx, -8, kx + (r() - 0.5) * 3, 520, r, { width: 2.2, alpha: 0.45 }, 22);
    }
    if (v === 2) {
      // NEVER PAINTED: the drainage channel down the middle and the
      // gulley grates, and nothing else. They set it out and stopped.
      line(ctx, 128, -8, 128, 520, r, { width: 1.4, alpha: 0.22, passes: 1 }, 20);
      for (let y = 40; y < 512; y += 118) {
        ruled(ctx, [[120, y], [120, y + 14], [136, y + 14], [136, y]], r,
          { width: 1.2, alpha: 0.3 }, true, 1.4);
      }
      // and the weeds in the joints, which is the only thing that has
      // happened here in thirty years
      for (let i = 0; i < 22; i++) {
        const x = 24 + r() * 208;
        const y = r() * 512;
        stroke(ctx, [[x, y], [x + (r() - 0.5) * 4, y - 4 - r() * 6]], r,
          { color: WASH.downs, width: 1.2, alpha: 0.4, passes: 1 });
      }
      feather(ctx, 256, 512, 26);
      return;
    }
    /* THE PAINT. Round 1 laid it at 0.62 and 0.3 and the whole car park
     * came back as bare tarmac from ten units away: this is the land's
     * ONLY recession device (it has no landform, on purpose), so the
     * bays have to be the second strongest mark in the drawing after
     * the rooflines. */
    const alpha = v === 0 ? 0.95 : 0.5;
    // the bays: two ranks nose to nose, and the paint stops short of the
    // kerb at the outside and short of the centre line at the inside
    for (let y = 22; y < 500; y += 44) {
      const jog = (r() - 0.5) * 2.5;
      line(ctx, 26, y + jog, 118, y + jog + (r() - 0.5) * 2, r,
        { color: PAINT, width: 5, alpha: alpha * (0.82 + r() * 0.36), passes: 1 }, 4);
      line(ctx, 138, y + jog, 230, y + jog + (r() - 0.5) * 2, r,
        { color: PAINT, width: 5, alpha: alpha * (0.82 + r() * 0.36), passes: 1 }, 4);
    }
    // and the head of each rank, which is a line the bays end on and it
    // does not reach either kerb
    for (const hx of [118, 138]) {
      line(ctx, hx, 30, hx, 486, r, { color: PAINT, width: 3.8, alpha: alpha * 0.72, passes: 1 }, 16);
    }
    if (v === 1) {
      // the far end: the paint has gone entirely off three bays and
      // there is a patch of repair over the drainage
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.globalAlpha = 0.8;
      ctx.fillStyle = '#000';
      ctx.fillRect(20, 330, 216, 120);
      ctx.restore();
      stain(ctx, 128, 388, 96, '#7d7a74', 0.16);
    }
    feather(ctx, 256, 512, 22);
  });
}

/** THE APRON at the stop: tarmac, a kerb across the top of it, and the
 *  ghost of a bay nobody uses because the bus never came. */
export function apronDecal(seed: number): THREE.CanvasTexture {
  return makeTexture(384, 384, seed, (ctx, r) => {
    fillPoly(ctx, [[0, 0], [384, 0], [384, 384], [0, 384]], TARMAC, 0.3);
    /* THE KERB across the top of it, which is the mark that says a
     * pavement is a pavement, and the gutter inside it. */
    line(ctx, -8, 118, 392, 121, r, { width: 3, alpha: 0.55 }, 20);
    line(ctx, -8, 127, 392, 130, r, { width: 1.3, alpha: 0.24, passes: 1 }, 20);
    /* THE STOPPING PLACE, marked out on the road in a box that a bus
     * has never once pulled into. Round 1 of the gate had a block of
     * tactile studs here and it read across the whole frame as an even
     * dotted grid, which is the one thing the bar forbids in capitals.
     * A box of paint says the same thing in three lines. */
    const box: [number, number][] = [[96, 168], [292, 170], [292, 236], [96, 234]];
    ruled(ctx, box, r, { color: PAINT, width: 4, alpha: 0.42, passes: 1 }, true, 12);
    line(ctx, 120, 202, 268, 203, r, { color: PAINT, width: 3, alpha: 0.26, passes: 1 }, 10);
    /* the joints in the slabs of the apron itself, and they run the
     * other way to the kerb so the ground has a grain */
    for (let x = 40; x < 384; x += 62) {
      line(ctx, x, 0, x + 3, 118, r, { width: 1.1, alpha: 0.16, passes: 1 }, 8);
    }
    // and the long stain down the gutter, which every kerb in the world
    // has and which nobody has ever drawn as anything but a stain
    for (let i = 0; i < 9; i++) {
      stain(ctx, 20 + i * 44, 124 + (r() - 0.5) * 6, 30 + r() * 20, '#7d7a74', 0.06);
    }
    feather(ctx, 384, 384, 34);
  });
}

/** THE SLAB — phase three, poured, with the holding-down bolts in it
 *  and a ruled outline round it and nothing on it, ever. */
export function slabDecal(seed: number): THREE.CanvasTexture {
  return makeTexture(384, 256, seed, (ctx, r) => {
    fillPoly(ctx, [[40, 34], [344, 34], [344, 222], [40, 222]], '#c4c1b8', 0.4);
    ruled(ctx, [[40, 34], [344, 34], [344, 222], [40, 222]], r, { width: 2.4, alpha: 0.6 }, true, 6);
    // the day joints across it, ruled, and each one short of both edges
    for (let x = 116; x < 344; x += 76) {
      ruled(ctx, [[x, 40], [x, 216]], r, { width: 1.3, alpha: 0.28, passes: 1 }, false, 8);
    }
    // the holding-down bolts, in pairs, waiting
    for (let i = 0; i < 6; i++) {
      const x = 74 + i * 48;
      for (const y of [78, 176]) {
        ctx.save();
        ctx.globalAlpha = 0.4;
        ctx.fillStyle = '#6f6f68';
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        stain(ctx, x, y, 9, RUST, 0.22);
      }
    }
    // and the grass has come up the edge of it on one side only
    for (let i = 0; i < 26; i++) {
      const x = 40 + r() * 304;
      const y = 220 + r() * 8;
      stroke(ctx, [[x, y], [x + (r() - 0.5) * 4, y - 5 - r() * 6]], r,
        { color: WASH.downs, width: 1.2, alpha: 0.42, passes: 1 });
    }
    feather(ctx, 384, 256, 26);
  });
}

/** THE MUSTER POINT — a rectangle painted on tarmac, and the grass
 *  nowhere near it is worn and the tarmac inside it is not. */
export function musterDecal(seed: number): THREE.CanvasTexture {
  return makeTexture(320, 320, seed, (ctx, r) => {
    fillPoly(ctx, [[0, 0], [320, 0], [320, 320], [0, 320]], TARMAC, 0.2);
    const box: [number, number][] = [[54, 62], [266, 62], [266, 258], [54, 258]];
    for (const w of [4.4, 4.4]) {
      ruled(ctx, box, r, { color: PAINT, width: w, alpha: 0.5, passes: 1 }, true, 9);
    }
    // the hatching inside the corners, which is what a marked assembly
    // area has and which nobody has ever repainted
    for (const [cx, cy, ax] of [[54, 62, 1], [266, 258, -1]] as [number, number, number][]) {
      hatch(ctx, cx + (ax > 0 ? 6 : -60), cy + (ax > 0 ? 6 : -60), 54, 54, 0.78, 11, r,
        { color: PAINT, alpha: 0.26 });
    }
    feather(ctx, 320, 320, 30);
  });
}

/**
 * THE SMOKING SPOT — twelve units from a fire door, no bench, and the
 * ground worn by people who were not supposed to stop there.
 *
 * Session 13's lesson, and it cost that session a round: **wear is
 * DARKER, not paler.** The drawing's own argument is that wear takes
 * the ink out of stone — true, and invisible on a page the colour of
 * paper. What a thousand ten-minute stands leave is a polish.
 */
export function smokedPatchDecal(seed: number): THREE.CanvasTexture {
  return makeTexture(256, 256, seed, (ctx, r) => {
    // the patch itself: a lens, not a circle. People stand in an arc
    // round a bin with their backs to the building
    for (let i = 0; i < 40; i++) {
      const a = -0.4 + r() * 3.9;
      const rad = 46 + r() * 34;
      stain(ctx, 128 + Math.cos(a) * rad, 150 + Math.sin(a) * rad * 0.62,
        20 + r() * 16, '#6f6d66', 0.05);
    }
    // and the walk to it from the door, which is the only path anywhere
    // in this land nobody drew
    for (let i = 0; i < 14; i++) {
      const x0 = 118 + (r() - 0.5) * 22;
      stroke(ctx, [[x0, 8], [x0 + (r() - 0.5) * 14, 70], [128 + (r() - 0.5) * 26, 130]], r,
        { color: '#6f6d66', width: 9 + r() * 8, alpha: 0.05, passes: 1 });
    }
    feather(ctx, 256, 256, 30);
  });
}

/* ================================================================== *
 * THE 8:15 — and it is not a prop of this land, it is the world's.
 *
 * Two aspects, both facing the camera, because nothing on this sheet
 * has ever been anything but a cutout facing you (Boat.ts, Session 6):
 * THE FRONT while it is running the north–south leg, which is a thing
 * coming down a road you are looking along, and THE SIDE on the
 * east–west legs, at every stop, and whenever you are in it.
 *
 * *A train you are watching is going somewhere; a train you are in is
 * a room.*
 * ================================================================== */

/**
 * THE SIDE. A single railcar, doors open or shut, with `carrying`
 * figures in its windows.
 *
 * The windows are what `critique-story-2.md`'s second mandatory finding
 * asked for: *the ending's default witness sees one stop*, and the fix
 * is that the 8:15 **arrives already carrying the lands above you**.
 * One figure in a window for every stop north of here that had somebody
 * on it. No new content, no change to the ending, and a train that has
 * been somewhere.
 */
export function railcarSideTexture(
  seed: number, carrying: number, open: boolean
): THREE.CanvasTexture {
  return makeTexture(1024, 192, seed, (ctx, r) => {
    const L = 24;
    const R = 1000;
    const TOP = 34;
    const FLOOR = 150;
    fillPoly(ctx, [[L, FLOOR], [L, TOP], [R, TOP], [R, FLOOR]], PANEL[0], 0.6);
    /* THE ROOFLINE, full weight the whole way — the same line the mile's
     * rooflines are drawn with, which is not a coincidence: this thing
     * was surveyed by the people who ruled this land out. */
    line(ctx, L - 6, TOP, R + 6, TOP, r, { width: 2.8, alpha: 0.94 });
    line(ctx, L + 10, TOP + 8, R - 10, TOP + 8, r, { width: 1.1, alpha: 0.4, passes: 1 });
    // the ends: raked, and they stop short of the roof
    ruled(ctx, [[L, TOP + 6], [L - 8, FLOOR]], r, { width: 2.3, alpha: 0.9 }, false, 4);
    ruled(ctx, [[R, TOP + 6], [R + 8, FLOOR]], r, { width: 2.3, alpha: 0.9 }, false, 4);
    line(ctx, L - 8, FLOOR, R + 8, FLOOR, r, { width: 2.2, alpha: 0.88 });
    // the skirt and the bogies
    fillPoly(ctx, [[L + 30, 168], [L + 30, FLOOR], [R - 30, FLOOR], [R - 30, 168]], SOFFIT, 0.34);
    for (const bx of [190, 500, 820]) {
      for (const wx of [bx - 26, bx + 26]) {
        scribbleCircle(ctx, wx, 172, 14, r, { width: 1.9, alpha: 0.85 });
      }
      ruled(ctx, [[bx - 44, 176], [bx - 44, 158], [bx + 44, 158], [bx + 44, 176]], r,
        { width: 1.4, alpha: 0.6 }, true, 3);
    }

    /* THE WINDOWS. Nine of them, ruled, each stopping short of its own
     * frame, and the last one at each end fades — the land's rule,
     * carried onto the thing the land is waiting for. */
    const winX: number[] = [];
    for (let i = 0; i < 9; i++) winX.push(96 + i * 96);
    winX.forEach((x, i) => {
      const edge = Math.min(i, 8 - i);
      const a = edge === 0 ? 0.4 : 0.82;
      fillPoly(ctx, [[x, 116], [x, 54], [x + 64, 54], [x + 64, 116]], GLASS, 0.5);
      ruled(ctx, [[x, 116], [x, 54], [x + 64, 54], [x + 64, 116]], r,
        { width: 1.6, alpha: a }, true, 3);
    });

    /* WHO IS ON IT. One head and shoulders per land north of here that
     * had somebody on the platform, filling the windows from the front
     * of the train back, because that is the order they got on in. */
    const n = Math.max(0, Math.min(9, carrying));
    for (let i = 0; i < n; i++) {
      const x = winX[i] + 32;
      scribbleCircle(ctx, x, 84, 9, r, { width: 1.7, alpha: 0.82 });
      ruled(ctx, [[x - 15, 116], [x - 13, 96], [x + 13, 96], [x + 15, 116]], r,
        { width: 1.6, alpha: 0.78 }, false, 2.2);
    }

    /* THE DOORS — two, and they are the only thing on this drawing that
     * ever changes. Open, they are a gap with the floor visible through
     * it; shut, they are two leaves with a rubber edge down the middle. */
    for (const dx of [320, 704]) {
      const g = open ? 26 : 2;
      for (const s of [-1, 1] as const) {
        const inner = dx + s * g;
        const outer = dx + s * 34;
        fillPoly(ctx, [[inner, FLOOR], [inner, 46], [outer, 46], [outer, FLOOR]],
          open ? SOFFIT : GLASS, open ? 0.3 : 0.5);
        ruled(ctx, [[inner, FLOOR], [inner, 46], [outer, 46], [outer, FLOOR]], r,
          { width: 1.7, alpha: 0.85 }, true, 2.4);
        line(ctx, inner, 48, inner, FLOOR - 2, r, { width: 2.1, alpha: 0.88 });
      }
      if (open) {
        // the step down, and the light out of the doorway onto it
        line(ctx, dx - 30, 158, dx + 30, 158, r, { width: 1.6, alpha: 0.7 });
        stain(ctx, dx, 150, 46, WARM, 0.12);
      }
    }
    void STEEL;
  });
}

/**
 * THE FRONT — a thing coming down a road you are looking along.
 *
 * Narrow, tall, two lit windows in the cab and a coupling under it, and
 * the whole of it is one ruled box. The reason it exists at all is
 * Session 5's hardest-won gotcha: *a flat quad that runs away from the
 * camera is invisible.* The camera only ever looks north, so a railcar
 * drawn broadside coming down the king's road would be four pixels of
 * roof.
 */
export function railcarFrontTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(192, 224, seed, (ctx, r) => {
    const L = 26;
    const R = 166;
    const TOP = 20;
    const FLOOR = 186;
    fillPoly(ctx, [[L, FLOOR], [L, TOP], [R, TOP], [R, FLOOR]], PANEL[0], 0.6);
    line(ctx, L - 6, TOP, R + 6, TOP, r, { width: 2.8, alpha: 0.94 });
    ruled(ctx, [[L, TOP + 6], [L, FLOOR]], r, { width: 2.4, alpha: 0.9 }, false, 5);
    ruled(ctx, [[R, TOP + 6], [R, FLOOR]], r, { width: 2.4, alpha: 0.9 }, false, 5);
    line(ctx, L - 4, FLOOR, R + 4, FLOOR, r, { width: 2.2, alpha: 0.88 });
    // the cab glass, one pane across the whole front, and the wiper
    fillPoly(ctx, [[L + 14, 108], [L + 14, 44], [R - 14, 44], [R - 14, 108]], GLASS, 0.5);
    ruled(ctx, [[L + 14, 108], [L + 14, 44], [R - 14, 44], [R - 14, 108]], r,
      { width: 1.8, alpha: 0.85 }, true, 3);
    line(ctx, 96, 44, 96, 106, r, { width: 1.1, alpha: 0.4, passes: 1 });
    stroke(ctx, [[54, 104], [70, 70], [88, 58]], r, { width: 1.3, alpha: 0.5, passes: 1 });
    // the two marker lights, and they are the accent
    for (const mx of [L + 26, R - 26]) {
      ctx.save();
      ctx.globalAlpha = 0.68;
      ctx.fillStyle = WARM;
      ctx.beginPath();
      ctx.arc(mx, 128, 6.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      stain(ctx, mx, 128, 22, WARM, 0.3);
    }
    // the skirt, the coupling and the two wheels you can see round it
    fillPoly(ctx, [[L + 18, FLOOR], [L + 18, 148], [R - 18, 148], [R - 18, FLOOR]], SOFFIT, 0.34);
    ruled(ctx, [[86, 178], [86, 160], [106, 160], [106, 178]], r,
      { width: 1.5, alpha: 0.7 }, true, 2);
    for (const wx of [L + 22, R - 22]) scribbleCircle(ctx, wx, 196, 13, r, { width: 1.8, alpha: 0.8 });
  });
}

/**
 * WHO IS ON THE PLATFORM — six drawings, one for each thing a person in
 * this world carries, and each of the twelve lands is given one of them
 * so that a walker who met somebody recognises what they are holding.
 *
 * No faces (the law), no names (they do not need them), and nobody is
 * shown walking to the stop or away from it: they are there when it
 * arrives and they are gone when it leaves.
 */
export function platformFigureTexture(seed: number, v: number): THREE.CanvasTexture {
  return makeTexture(96, 160, seed, (ctx, r) => {
    const o = { width: 2, alpha: 0.88 };
    scribbleCircle(ctx, 48, 38, 10, r, o);
    stroke(ctx, [[36, 122], [34, 76], [48, 52], [62, 76], [60, 122]], r, o);
    line(ctx, 42, 122, 40, 152, r, { width: 1.9, alpha: 0.86 });
    line(ctx, 54, 122, 57, 152, r, { width: 1.9, alpha: 0.86 });
    switch (v % 6) {
      case 0: // a bolt of cloth, laid over the arm (BRIM)
        stroke(ctx, [[26, 84], [46, 78], [70, 84]], r, { width: 5, alpha: 0.6, passes: 1 });
        break;
      case 1: // a rolled banner, upright (GREYWEATHER)
        line(ctx, 70, 140, 66, 24, r, { width: 3.2, alpha: 0.8 });
        break;
      case 2: // a coil of rope over the shoulder (LONGSHORE, THE WIDE BLUE)
        scribbleCircle(ctx, 66, 74, 11, r, { width: 1.5, alpha: 0.7 }, 1.9);
        break;
      case 3: // a stick, and the stick is a habit (THE PENWOOD, SPLITROCK)
        line(ctx, 72, 148, 68, 62, r, { width: 2, alpha: 0.75 });
        break;
      case 4: // two cans, one in each hand (THE BLEACH FLATS)
        for (const cx of [24, 74]) {
          stroke(ctx, [[cx - 7, 112], [cx - 6, 96], [cx + 6, 96], [cx + 7, 112]], r,
            { width: 1.6, alpha: 0.78 });
        }
        break;
      default: // a case, held not carried (the modern lands)
        stroke(ctx, [[66, 112], [66, 96], [84, 96], [84, 112]], r, { width: 1.6, alpha: 0.8 });
        line(ctx, 62, 74, 70, 96, r, { width: 1.7, alpha: 0.8 });
    }
  });
}
