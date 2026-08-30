import * as THREE from 'three';
import {
  makeTexture, stroke, line, scribbleCircle, hatch, type Ctx2D,
} from '../engine/ink';
import { INK, PENCIL, WASH } from '../engine/palette';

/**
 * THE HARROW DOWNS' prop box (design/specs/harrow-downs.md).
 *
 * ── THE LAND'S INK TECHNIQUE, AND IT IS ONE SENTENCE ────────────────
 *
 * **The Penwood is drawn in strokes straight up the page; the Downs are
 * drawn in stripes across the fall of the ground.** Furrow, stubble,
 * thatch, hedge, fleece, sail-cloth: every mark in this file is either a
 * run of short parallel strokes laid across the slope, or a single
 * upright standing against them. Nothing here is outlined and then
 * filled — the Downs are drawn the way a field is made, in passes, and
 * the pen goes back and forth.
 *
 * **There is exactly one exception and it is the land's whole point.**
 * THE HEADLAND's picnic is the only thing in the Downs drawn as a closed
 * rectangle with a line all the way round it. In a place made entirely
 * of stripes, a made thing with an edge is the first thing anybody's eye
 * lands on, and it is supposed to be.
 *
 * ── AND ONE REGISTER NOTE ───────────────────────────────────────────
 *
 * THE-WAITS §10: *the only register in the game that is not wry. Do not
 * be clever in the Downs.* That is a rule about the writing, and it is
 * a rule about the drawing too. Nothing in this file is a joke. The
 * scarecrow keeps the one it already had, because it is older than this
 * session, and it gains a maker's mark inside its collar that nothing
 * will ever mention.
 */

/* Pigments. Line and body colours, mixed for this land; every wash in
 * this file still comes out of palette.ts. */
const STRAW = '#cbb47e';
const CORN = '#c9b071';
const EARTH = '#9a825e';
const TIMBER = '#5d5040';
const CLOTH = '#eae3d0';
const SLATE = '#8d8a84';

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
  const n = 16;
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

/**
 * A GROUND STAIN WITH NO EDGE ON IT.
 *
 * Round 1 of the gate laid every field's colour with `fillBlob`, which
 * is a sixteen-sided polygon, and on a decal that is TILED ACROSS A
 * WHOLE FIELD every one of those sixteen sides showed: the Downs came
 * out as a mosaic of pale hexagons with the seams between them visible
 * from a hundred units. A stain on paper has no boundary — it fades —
 * so this is a radial gradient, and it is what every field state in
 * this file lays its colour with.
 */
function stain(
  ctx: Ctx2D, cx: number, cy: number, rad: number, color: string, alpha: number
) {
  const g = ctx.createRadialGradient(cx, cy, rad * 0.05, cx, cy, rad);
  const rgb = color.replace('#', '');
  const c = [0, 2, 4].map((i) => parseInt(rgb.slice(i, i + 2), 16)).join(',');
  g.addColorStop(0, `rgba(${c},${alpha})`);
  g.addColorStop(0.62, `rgba(${c},${alpha * 0.62})`);
  g.addColorStop(1, `rgba(${c},0)`);
  ctx.fillStyle = g;
  ctx.fillRect(cx - rad, cy - rad, rad * 2, rad * 2);
}

/* ================================================================== *
 * WHAT A FIELD IS DOING — the six states, and no field has two.
 * ================================================================== */

/** Cut, and the stalks left standing. Ranks that wander, because a
 *  scythe does not go straight and neither does a reaper. */
export function stubbleDecal(seed: number): THREE.CanvasTexture {
  return makeTexture(256, 256, seed, (ctx, r) => {
    stain(ctx, 128, 128, 128, STRAW, 0.13);
    const rows = 13;
    for (let row = 0; row < rows; row++) {
      const y = 14 + (row / (rows - 1)) * 228;
      const wob = Math.sin(row * 1.7 + seed) * 5;
      for (let x = 10 + r() * 8; x < 248; x += 5 + r() * 4) {
        const yy = y + wob + (r() - 0.5) * 4;
        line(ctx, x, yy + 5 + r() * 3, x + (r() - 0.5) * 2, yy, r,
          { width: 0.9, alpha: 0.22 + r() * 0.2, passes: 1, color: EARTH }, 2);
      }
    }
    // the reaper's own lines: two passes of shade lying between the ranks
    for (let row = 1; row < rows; row += 2) {
      const y = 14 + (row / (rows - 1)) * 228 + 5;
      line(ctx, 8, y, 248, y + (r() - 0.5) * 6, r,
        { width: 1.6, alpha: 0.1, passes: 1, color: EARTH }, 5);
    }
  });
}

/** Turned over, and drying. Long paired furrows with the shade in the
 *  trough — the only place in this land a `hatch` is allowed. */
export function ploughDecal(seed: number): THREE.CanvasTexture {
  return makeTexture(256, 256, seed, (ctx, r) => {
    stain(ctx, 128, 128, 130, EARTH, 0.34);
    for (let i = 0; i < 12; i++) {
      const y = 12 + (i / 11) * 232;
      const bow = (r() - 0.5) * 7;
      stroke(ctx, [[6, y], [90, y + bow], [172, y + bow * 0.6], [250, y]], r,
        { width: 2.8, alpha: 0.42, passes: 1, color: EARTH, jitter: 1.8 });
      // the ridge's lit crest, a hair above its own furrow
      stroke(ctx, [[6, y - 3.5], [90, y - 3.5 + bow], [250, y - 3.5]], r,
        { width: 1.1, alpha: 0.13, passes: 1, color: CLOTH, jitter: 1.4 });
      hatch(ctx, 6, y + 1, 244, 7, 0.02, 4, r, { alpha: 0.11, color: INK });
    }
    // the headland turn at one end: the furrows stop and the ground is
    // churned where the plough came round
    for (let i = 0; i < 18; i++) {
      const x = 214 + r() * 36;
      line(ctx, x, 14 + r() * 228, x + (r() - 0.5) * 12, 14 + r() * 228, r,
        { width: 1.4, alpha: 0.12, passes: 1, color: EARTH }, 2);
    }
  });
}

/** Left to itself for a year: thistle, dock, and last year's stalks. */
export function fallowDecal(seed: number): THREE.CanvasTexture {
  return makeTexture(256, 256, seed, (ctx, r) => {
    stain(ctx, 128, 128, 126, WASH.downs, 0.26);
    for (let i = 0; i < 90; i++) {
      const a = r() * Math.PI * 2;
      const d = Math.pow(r(), 0.55) * 116;
      const x = 128 + Math.cos(a) * d;
      const y = 128 + Math.sin(a) * d;
      const h = 5 + r() * 12;
      stroke(ctx, [[x, y + h], [x + (r() - 0.5) * 4, y + h * 0.4], [x + (r() - 0.5) * 6, y]], r,
        { width: 1, alpha: 0.2 + r() * 0.22, passes: 1 });
      if (r() > 0.86) scribbleCircle(ctx, x, y - 2, 2.6, r, { width: 1, alpha: 0.3, passes: 1 }, 1.4);
    }
  });
}

/** Standing corn, and it leans ONE way, because there is one wind in the
 *  Downs and it comes off the wood. Never x-flipped. */
export function standingCornTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(128, 96, seed, (ctx, r) => {
    const lean = 5 + r() * 7;
    const n = 13 + Math.floor(r() * 7);
    for (let i = 0; i < n; i++) {
      const x = 12 + (i / n) * 104 + (r() - 0.5) * 6;
      const h = 52 + r() * 30;
      const top = 92 - h;
      stroke(ctx, [[x, 92], [x + lean * 0.4, 92 - h * 0.55], [x + lean, top]], r,
        { width: 1.1, alpha: 0.42 + r() * 0.24, passes: 1, color: EARTH });
      // the ear: four short marks off one side, drooping
      for (let g = 0; g < 4; g++) {
        const gy = top + g * 3.4;
        line(ctx, x + lean - 1, gy, x + lean + 3.6, gy + 2.4, r,
          { width: 1, alpha: 0.4, passes: 1, color: CORN }, 2);
      }
    }
  });
}

/** A sheaf, bound and stood on its own butt. Eight stems, one band, and
 *  a shade side — three of the four variants lean, because they were
 *  stood up by somebody working fast. */
export function stookTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(128, 160, seed, (ctx, r) => {
    /* A SHEAF IS A FAN TIED AT THE WAIST. Round 1 drew it as a striped
     * pillar with a band round it, which is a barrel; what makes the
     * silhouette read at forty units is that it is NARROW at the foot,
     * pinched at the band, and SPLAYED at the head. */
    const lean = (r() - 0.5) * 14;
    const waist = 78;
    const foot = 152;
    const head = 14;
    const splay = 19 + r() * 7;
    const bx = (t: number) => 64 + lean * 0.3 + (t - 0.5) * 26;      // the butt
    const hx = (t: number) => 64 + lean + (t - 0.5) * splay * 2;     // the ears
    const wx = (t: number) => 64 + lean * 0.55 + (t - 0.5) * 15;     // the band
    // the body, so the sheaf has weight before a stalk is drawn
    fillPoly(ctx, [[bx(0), foot], [wx(0), waist], [hx(0), head],
      [hx(1), head], [wx(1), waist], [bx(1), foot]], STRAW, 0.44);
    // the stalks: each one runs butt → band → ear, and the fan is what
    // the drawing is for
    for (let i = 0; i < 15; i++) {
      const t = (i + 0.5) / 15 + (r() - 0.5) * 0.04;
      stroke(ctx, [[bx(t), foot], [wx(t) + (r() - 0.5) * 2, waist],
        [hx(t) + (r() - 0.5) * 4, head + r() * 12]], r,
        { width: 1.1, alpha: 0.3 + r() * 0.3, passes: 1, color: EARTH });
    }
    // the ears themselves: short marks off the top of the fan
    for (let i = 0; i < 22; i++) {
      const t = r();
      const x = hx(t) + (r() - 0.5) * 5;
      const y = head + r() * 22;
      line(ctx, x, y, x + (r() - 0.5) * 5, y + 5 + r() * 4, r,
        { width: 1.1, alpha: 0.32, passes: 1, color: CORN }, 2);
    }
    // THE BAND, and it is the only horizontal in the drawing
    line(ctx, wx(-0.1), waist, wx(1.1), waist - 2, r, { width: 2.6, alpha: 0.75, passes: 1 }, 3);
    line(ctx, wx(-0.05), waist + 6, wx(1.05), waist + 4, r,
      { width: 1.5, alpha: 0.4, passes: 1 }, 3);
    // and the shade side, tucked inside the fan
    hatch(ctx, bx(0) - 2, waist + 4, 20, foot - waist, 0.08, 5, r, { alpha: 0.13 });
    hatch(ctx, hx(0), head + 6, 22, waist - head, 0.05, 6, r, { alpha: 0.1 });
  });
}

/* ================================================================== *
 * THE HEDGES — the drawing that makes a patchwork a patchwork.
 * ================================================================== */

/**
 * A hedge run. It is NOT a bush: a hedge is a long low mass with a hard
 * bottom line where it meets the ground, a ragged top, and a shade side,
 * and the thing that makes a run of them read as one hedge rather than
 * as five shrubs is that the mass runs off both ends of the quad.
 *
 * `gap` opens it — a gateway, a gap somebody drove through, or the place
 * where it stopped being maintained.
 */
export function downsHedgeTexture(seed: number, gap = false): THREE.CanvasTexture {
  return makeTexture(512, 160, seed, (ctx, r) => {
    const gapAt = gap ? 150 + r() * 180 : -999;
    const gapW = 110;
    const inGap = (x: number) => gap && x > gapAt && x < gapAt + gapW;
    const foot = 132;
    /** The top of the hedge, and it is a PROFILE, not a row of lobes.
     *  Round 1 drew the body as thirty overlapping `scribbleCircle`s and
     *  every one of them was visible: a hedge came out as a heap of
     *  coils of wire, and the near one in THE HARROW DOWNS' shot filled
     *  the bottom third of the frame with them. A hedge is a MASS with a
     *  ragged top and a hard bottom; the loops were the mass showing its
     *  working. */
    const crest = (x: number) =>
      48 + Math.sin(x * 0.0135 + seed) * 13 + Math.sin(x * 0.037 + 2.2) * 7
        + Math.sin(x * 0.091 + 4.1) * 3.5;

    // 1. the body: one filled shape, drawn once, running off both ends
    const runs: [number, number][][] = [];
    let cur: [number, number][] = [];
    for (let x = -12; x <= 524; x += 8) {
      if (inGap(x)) {
        if (cur.length > 2) runs.push(cur);
        cur = [];
        continue;
      }
      cur.push([x, crest(x)]);
    }
    if (cur.length > 2) runs.push(cur);
    for (const run of runs) {
      const shape: [number, number][] = [...run,
        [run[run.length - 1][0], foot], [run[0][0], foot]];
      fillPoly(ctx, shape, WASH.forest, 0.5);
      fillPoly(ctx, shape.map(([x, y]) => [x, y + 7] as [number, number]), WASH.forest, 0.22);
    }

    // 2. the twiggy texture: short strokes INSIDE the mass, up and out,
    //    and never a closed loop anywhere
    for (let i = 0; i < 300; i++) {
      const x = -8 + r() * 528;
      if (inGap(x)) continue;
      const c = crest(x);
      const y = c + Math.pow(r(), 0.55) * (foot - c);
      const len = 5 + r() * 12;
      const ang = -1.3 + (r() - 0.5) * 1.5;
      line(ctx, x, y, x + Math.cos(ang) * len * 0.5, y + Math.sin(ang) * len, r,
        { width: 0.9 + r() * 0.9, alpha: 0.14 + r() * 0.24, passes: 1 }, 2);
    }
    // 3. the darker clumps: four, and they are where the hedge was last
    //    laid rather than cut
    for (let i = 0; i < 4; i++) {
      const x = 30 + r() * 450;
      if (inGap(x)) continue;
      const c = crest(x);
      for (let k = 0; k < 26; k++) {
        const px = x + (r() - 0.5) * 46;
        const py = c + 8 + r() * (foot - c - 14);
        line(ctx, px, py, px + (r() - 0.5) * 8, py - 6 - r() * 9, r,
          { width: 1.1, alpha: 0.2 + r() * 0.2, passes: 1 }, 2);
      }
    }
    // 4. ONE committed top line, following the profile, broken at the gap
    for (const run of runs) {
      stroke(ctx, run.map(([x, y]) => [x, y + (r() - 0.5) * 4] as [number, number]), r,
        { width: 2.1, alpha: 0.58, jitter: 2.6 });
    }
    // 5. the hard bottom line: a hedge sits ON the ground, and this is
    //    what stops it floating
    for (let x = -8; x < 520; x += 22 + r() * 18) {
      if (inGap(x)) continue;
      line(ctx, x, foot + (r() - 0.5) * 4, x + 22 + r() * 18, foot + (r() - 0.5) * 4, r,
        { width: 2.4, alpha: 0.5, passes: 1 }, 3);
    }
    // 6. the bare stems you can see through at the bottom
    for (let i = 0; i < 26; i++) {
      const x = 6 + r() * 500;
      if (inGap(x)) continue;
      line(ctx, x, foot, x + (r() - 0.5) * 7, foot - 14 - r() * 20, r,
        { width: 1.2, alpha: 0.26, passes: 1 }, 2);
    }
    // and if there is a gap, there is usually a post left standing in it
    if (gap && r() > 0.4) {
      line(ctx, gapAt + 10, foot + 2, gapAt + 8, 70, r, { width: 2.6, alpha: 0.7 });
    }
    /* THE ENDS OF THE PANEL ARE ERASED.
     *
     * A hedge run is eight or nine of these standing behind each other,
     * and round 1 shipped them as rectangles: each panel's left and
     * right edges were hard vertical cuts through the mass, so a hedge
     * came out as a row of green cards with visible sides. A hedge has
     * no sides. Forty pixels of erase at each end lets consecutive
     * panels dissolve into each other, which is the only way a run of
     * cutouts ever reads as one continuous thing. */
    ctx.globalCompositeOperation = 'destination-out';
    for (const [x0, x1] of [[0, 46], [512, 466]] as [number, number][]) {
      const g = ctx.createLinearGradient(x0, 0, x1, 0);
      g.addColorStop(0, 'rgba(0,0,0,1)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(Math.min(x0, x1), 0, 46, 160);
    }
    ctx.globalCompositeOperation = 'source-over';
  });
}

/** A standard: the single grown-out tree left in a hedge line, which is
 *  what hedges actually do and what stops a hedge run reading as a wall. */
export function hedgeStandardTexture(seed: number, form: 0 | 1 | 2): THREE.CanvasTexture {
  return makeTexture(192, 256, seed, (ctx, r) => {
    const lean = form === 1 ? 22 : form === 2 ? -14 : 0;
    const topX = 96 + lean;
    fillBlob(ctx, topX, 96, form === 0 ? 62 : 52, r, WASH.forest, 0.34, 0.84);
    fillBlob(ctx, topX - 24, 112, 34, r, WASH.forest, 0.24, 0.9);
    // trunk: it goes into the hedge, so no root flare is drawn
    stroke(ctx, [[96 - 7, 250], [96 - 5, 200], [topX - 6, 164], [topX - 4, 140]], r,
      { width: 4.2, alpha: 0.86 });
    stroke(ctx, [[96 + 8, 250], [96 + 6, 200], [topX + 6, 166], [topX + 3, 142]], r,
      { width: 3.6, alpha: 0.82 });
    for (const [sx, sy] of [[topX - 5, 142], [topX + 3, 144]] as [number, number][]) {
      stroke(ctx, [[sx, sy], [sx - 22 - r() * 10, sy - 22], [sx - 30, sy - 40]], r,
        { width: 2.2, alpha: 0.7 });
      stroke(ctx, [[sx, sy], [sx + 19 + r() * 9, sy - 26], [sx + 30, sy - 38]], r,
        { width: 2, alpha: 0.68 });
    }
    const lobes = form === 2
      ? [[topX - 40, 104, 24], [topX - 14, 78, 24], [topX + 32, 92, 26], [topX + 46, 116, 18]]
      : [[topX - 40, 112, 24], [topX - 20, 78, 25], [topX + 12, 66, 24],
         [topX + 40, 88, 25], [topX + 46, 118, 18], [topX, 100, 30]];
    for (const [cx, cy, cr] of lobes as [number, number, number][]) {
      scribbleCircle(ctx, cx + (r() - 0.5) * 7, cy + (r() - 0.5) * 7, cr, r,
        { width: 1.3, alpha: 0.4, jitter: 2.2, passes: 1 }, 1.5);
    }
    scribbleCircle(ctx, topX, 96, form === 0 ? 62 : 54, r,
      { width: 2.1, alpha: 0.68, jitter: 3.2 }, 1.08);
    hatch(ctx, topX - 58, 104, 46, 32, 0.7, 6.5, r, { alpha: 0.18 });
  });
}

/* ================================================================== *
 * THE MILL — the land's one landmark and half of its wait.
 * ================================================================== */

/**
 * The tower, WITHOUT its sails. They live on their own quad so they can
 * turn, which is the whole reason this drawing exists instead of the
 * Session 1 windmill: `THE-STRANGERS` U24 says the sails have moved a
 * quarter since your first visit, and a drawing with the sails baked
 * into it can never say that.
 *
 * A tower mill, because a tower mill is a CONE and a cone has a fall
 * line the pen can run down — the same argument `elevation.ts` makes
 * about landforms, applied to a building.
 */
export function millTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(320, 448, seed, (ctx, r) => {
    const body: [number, number][] = [[74, 436], [104, 150], [216, 150], [246, 436]];
    fillPoly(ctx, body, WASH.kingdom, 0.62);
    poly(ctx, body, r, { width: 3, alpha: 0.9 });
    /* the courses: a tower mill is built in lifts, so the horizontals
     * are the drawing. They narrow as they go up, which is what puts the
     * cone across in one look. */
    for (let i = 0; i < 15; i++) {
      const t = i / 14;
      const y = 430 - t * 274;
      const l = 74 + t * 30;
      const rr = 246 - t * 30;
      line(ctx, l, y, rr, y, r, { width: 1.3, alpha: 0.24, passes: 1 }, 5);
      // and the stones in each course, broken and never aligned
      for (let k = 0; k < 5; k++) {
        const x = l + 8 + r() * (rr - l - 16);
        line(ctx, x, y, x, y - 14 + r() * 4, r, { width: 1, alpha: 0.16, passes: 1 }, 2);
      }
    }
    // the shade side, down the fall line of the cone
    hatch(ctx, 78, 150, 44, 286, 0.03, 7, r, { alpha: 0.17 });
    hatch(ctx, 78, 150, 26, 286, 0.05, 10, r, { alpha: 0.12 });

    // THE CAP: a boat-shaped hood, tarred, with the tail pole out behind
    const cap: [number, number][] = [[96, 152], [112, 104], [148, 84], [186, 88], [214, 116], [224, 152]];
    fillPoly(ctx, cap, TIMBER, 0.5);
    poly(ctx, cap, r, { width: 2.8, alpha: 0.9 });
    for (let i = 0; i < 7; i++) {
      stroke(ctx, [[100 + i * 3, 150 - i * 6], [160, 96 - i * 1.5], [220 - i * 3, 148 - i * 6]], r,
        { width: 1, alpha: 0.2, passes: 1 });
    }
    // the tail pole and its little ladder, which is how a cap is turned
    line(ctx, 212, 124, 274, 218, r, { width: 3, alpha: 0.82 });
    line(ctx, 224, 130, 280, 226, r, { width: 2.2, alpha: 0.7 });
    for (let i = 1; i < 6; i++) {
      const t = i / 6;
      line(ctx, 212 + 62 * t, 124 + 94 * t, 224 + 56 * t, 130 + 96 * t, r,
        { width: 1.2, alpha: 0.45, passes: 1 }, 2);
    }
    // the windshaft's nose, which is what the sails hang on
    scribbleCircle(ctx, 118, 118, 13, r, { width: 2.4, alpha: 0.88 }, 1.2);
    line(ctx, 104, 118, 122, 118, r, { width: 3.4, alpha: 0.85, passes: 1 }, 2);

    // the stage, the door under it, and the steps
    line(ctx, 62, 300, 258, 300, r, { width: 3, alpha: 0.85 });
    line(ctx, 64, 312, 256, 312, r, { width: 1.8, alpha: 0.6 });
    for (let x = 70; x < 254; x += 18 + r() * 8) {
      line(ctx, x, 300, x, 312, r, { width: 1.2, alpha: 0.4, passes: 1 }, 2);
    }
    poly(ctx, [[140, 436], [140, 352], [184, 352], [184, 436]], r, { width: 2.4, alpha: 0.88 });
    line(ctx, 140, 352, 184, 436, r, { width: 1.2, alpha: 0.3, passes: 1 });
    for (let i = 0; i < 5; i++) {
      line(ctx, 250 + i * 8, 300 + i * 26, 276 + i * 8, 300 + i * 26, r,
        { width: 2, alpha: 0.55, passes: 1 }, 2);
    }
    // two small windows, one over the other, and neither is square
    poly(ctx, [[152, 250], [152, 224], [174, 224], [174, 250]], r, { width: 1.8, alpha: 0.7 });
    poly(ctx, [[154, 194], [155, 172], [173, 172], [172, 194]], r, { width: 1.6, alpha: 0.62 });
  });
}

/**
 * THE SAILS, on their own quad, centred on the windshaft so the mesh can
 * simply be rotated. Four sweeps: **two clothed and two bare**, because
 * a miller sets only what the wind he has needs, and a mill with all
 * four dressed on a still day is a mill drawn by somebody who has never
 * seen one.
 */
export function millSailsTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(384, 384, seed, (ctx, r) => {
    const C = 192;
    for (let i = 0; i < 4; i++) {
      const a = i * (Math.PI / 2);
      const ux = Math.cos(a);
      const uy = Math.sin(a);
      const px = -uy;
      const py = ux;
      const len = 176;
      const clothed = i % 2 === 0;
      // the whip: one long stroke from the hub out
      line(ctx, C + ux * 16, C + uy * 16, C + ux * len, C + uy * len, r,
        { width: 3.2, alpha: 0.88 });
      // the bars: the ladder of the frame, and it is the drawing
      for (let k = 2; k <= 10; k++) {
        const t = k / 10;
        const bx = C + ux * len * t;
        const by = C + uy * len * t;
        const w = 22 - t * 5;
        line(ctx, bx, by, bx + px * w, by + py * w, r,
          { width: 1.4, alpha: 0.62, passes: 1 }, 2);
      }
      // the trailing edge
      line(ctx, C + ux * 34 + px * 21, C + uy * 34 + py * 21,
        C + ux * len + px * 17, C + uy * len + py * 17, r, { width: 1.8, alpha: 0.7 });
      if (clothed) {
        const quad: [number, number][] = [
          [C + ux * 40, C + uy * 40],
          [C + ux * len * 0.94, C + uy * len * 0.94],
          [C + ux * len * 0.94 + px * 17, C + uy * len * 0.94 + py * 17],
          [C + ux * 40 + px * 20, C + uy * 40 + py * 20],
        ];
        fillPoly(ctx, quad, CLOTH, 0.62);
        poly(ctx, quad, r, { width: 1.6, alpha: 0.6 });
        // the cloth's own fold lines, running with the whip
        for (let k = 1; k < 4; k++) {
          const o = (k / 4) * 18;
          line(ctx, C + ux * 46 + px * o, C + uy * 46 + py * o,
            C + ux * (len * 0.9) + px * o, C + uy * (len * 0.9) + py * o, r,
            { width: 0.9, alpha: 0.2, passes: 1 }, 4);
        }
      }
    }
    // the cross and the canister at the middle
    scribbleCircle(ctx, C, C, 15, r, { width: 2.6, alpha: 0.9 }, 1.2);
    scribbleCircle(ctx, C, C, 7, r, { width: 1.6, alpha: 0.6 }, 1.4);
  });
}

/** The mill's yard building: a low stone granary on staddle stones, and
 *  the only other roof in the north of this land. */
export function granaryTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(256, 192, seed, (ctx, r) => {
    // the staddles: mushroom stones, which is a real thing and reads as
    // one instantly — a building standing on stone toadstools
    for (const x of [46, 96, 152, 204]) {
      line(ctx, x, 182, x, 158, r, { width: 3.4, alpha: 0.8 });
      poly(ctx, [[x - 13, 158], [x - 8, 148], [x + 8, 148], [x + 13, 158]], r,
        { width: 2, alpha: 0.8 });
    }
    const body: [number, number][] = [[32, 148], [32, 84], [222, 80], [222, 146]];
    fillPoly(ctx, body, WASH.kingdom, 0.5);
    poly(ctx, body, r, { width: 2.6, alpha: 0.88 });
    // boarding: verticals, which in this land means it is a BUILDING
    for (let x = 40; x < 218; x += 12 + r() * 6) {
      line(ctx, x, 146, x, 82, r, { width: 1.1, alpha: 0.22, passes: 1 }, 3);
    }
    // the roof: thatch, drawn in the land's own stripe
    const roof: [number, number][] = [[20, 86], [126, 30], [234, 82]];
    fillPoly(ctx, roof, STRAW, 0.5);
    poly(ctx, roof, r, { width: 2.6, alpha: 0.88 });
    for (let i = 0; i < 26; i++) {
      const t = r();
      const x0 = 24 + t * 100;
      line(ctx, x0, 84 - t * 8, x0 + 60 * (0.5 + r() * 0.5), 84 - 50 * (0.4 + r() * 0.5), r,
        { width: 1, alpha: 0.16, passes: 1, color: EARTH }, 3);
    }
    line(ctx, 24, 84, 126, 32, r, { width: 1.4, alpha: 0.4, passes: 1 });
    // the door, high, with the steps gone
    poly(ctx, [[108, 146], [108, 96], [146, 94], [146, 144]], r, { width: 2.2, alpha: 0.85 });
    line(ctx, 108, 96, 146, 144, r, { width: 1.1, alpha: 0.28, passes: 1 });
    hatch(ctx, 34, 84, 34, 62, 0.05, 6, r, { alpha: 0.14 });
  });
}

/* ================================================================== *
 * THE HEADLAND — the wait, and the only closed rectangle in the land.
 * ================================================================== */

/**
 * THE PICNIC LAID FOR TWO (THE-WAITS §10).
 *
 * Two states, and the difference between them is one plate, one cup and
 * one stool. `both` false is the second setting PUT AWAY, which is what
 * you find on any evening; `both` true is laid, which is what you find
 * every morning and — once you have sat down — what you find forever.
 *
 * **Nothing about this drawing is sad and nothing about it is clever.**
 * The cloth is clean, the table is level, the settings are square to
 * each other. It is a place kept, by somebody who has plenty of plates
 * and plenty of days, and every visual instinct that wants to weather it
 * or tilt it or fray the cloth is the wry register trying to get into
 * the one land it is barred from.
 */
export function picnicTexture(seed: number, both: boolean): THREE.CanvasTexture {
  return makeTexture(256, 192, seed, (ctx, r) => {
    const top = 74;
    const hem = 112;
    /* THE CLOTH is the closed rectangle, and round 1 drew it twenty-two
     * pixels deep, which at six units across a field is a line. It is
     * the only shape in this land with an edge all the way round it and
     * it has to READ as one: a top face and a hanging side, filled
     * solid, outlined once, with the fall of the hem drawn in. */
    const face: [number, number][] = [[26, top + 8], [128, top - 4], [230, top + 8],
      [232, top + 22], [128, top + 32], [24, top + 22]];
    fillPoly(ctx, face, CLOTH, 0.9);
    const side: [number, number][] = [[24, top + 22], [128, top + 32], [232, top + 22],
      [228, hem], [128, hem + 8], [28, hem]];
    fillPoly(ctx, side, CLOTH, 0.78);
    poly(ctx, [...face.slice(0, 3), [232, top + 22], [228, hem], [128, hem + 8],
      [28, hem], [24, top + 22]], r, { width: 2.4, alpha: 0.88, jitter: 1.0 });
    // the table's own edge, under the cloth's top face
    stroke(ctx, [[24, top + 22], [128, top + 32], [232, top + 22]], r,
      { width: 1.8, alpha: 0.5, passes: 1 });
    // the fall of the hem: four folds, and one crease from being folded
    for (const x of [56, 92, 160, 198]) {
      stroke(ctx, [[x, top + 27], [x - 2, top + 70], [x - 4, hem + 3]], r,
        { width: 1.3, alpha: 0.3, passes: 1 });
    }
    line(ctx, 128, top - 2, 128, top + 30, r, { width: 1, alpha: 0.2, passes: 1 }, 2);

    // the trestle: two crossed pairs, under the hem where they belong
    for (const [ax, bx2] of [[44, 76], [180, 212]] as [number, number][]) {
      line(ctx, ax, hem, bx2, 182, r, { width: 2.4, alpha: 0.78 });
      line(ctx, bx2, hem, ax, 182, r, { width: 2.4, alpha: 0.78 });
    }

    /* THE FIRST SETTING — hers, and it is always there. Drawn on the
     * top face, in perspective, which is what stops the plates reading
     * as circles floating over a plank. */
    const setting = (cx: number, cy: number, cupSide: number) => {
      fillBlob(ctx, cx, cy, 17, r, CLOTH, 0.9, 0.44);
      scribbleCircle(ctx, cx, cy, 17, r, { width: 2, alpha: 0.85 }, 1.08);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(1, 0.44);
      scribbleCircle(ctx, 0, 0, 10, r, { width: 1.2, alpha: 0.42 }, 1.3);
      ctx.restore();
      // the cup, standing, so it has a body and not just a rim
      const ux = cx + cupSide * 27;
      poly(ctx, [[ux - 7, cy - 4], [ux - 6, cy - 15], [ux + 6, cy - 15], [ux + 7, cy - 4]], r,
        { width: 1.7, alpha: 0.8 });
      scribbleCircle(ctx, ux, cy - 15, 6.5, r, { width: 1.4, alpha: 0.6 }, 1.1);
      // and a knife, laid square to the plate, because she lays it square
      line(ctx, cx + cupSide * 22, cy + 8, cx + cupSide * 22, cy + 16, r,
        { width: 1.4, alpha: 0.55, passes: 1 }, 2);
    };
    setting(76, top + 12, -1);
    // the stool she actually sits on
    line(ctx, 58, 182, 64, 138, r, { width: 2.2, alpha: 0.75 });
    line(ctx, 96, 182, 90, 138, r, { width: 2.2, alpha: 0.75 });
    line(ctx, 54, 138, 100, 136, r, { width: 2.8, alpha: 0.82, passes: 1 }, 3);

    if (both) {
      // THE SECOND SETTING — square to the first, the same distance in
      // from the same end, laid by somebody who does it every morning
      setting(180, top + 12, 1);
      line(ctx, 162, 182, 168, 138, r, { width: 2.2, alpha: 0.75 });
      line(ctx, 200, 182, 194, 138, r, { width: 2.2, alpha: 0.75 });
      line(ctx, 158, 138, 204, 136, r, { width: 2.8, alpha: 0.82, passes: 1 }, 3);
    } else {
      // put away: the cloth is still laid across the whole table and the
      // far end of it is simply empty, which is the entire drawing
      line(ctx, 150, top + 14, 212, top + 12, r, { width: 1, alpha: 0.1, passes: 1 }, 4);
    }

    // the basket on the ground at the near end, with the day in it, and
    // it is always there and always closed
    fillPoly(ctx, [[16, 182], [22, 150], [66, 148], [70, 180]], STRAW, 0.5);
    poly(ctx, [[16, 182], [22, 150], [66, 148], [70, 180]], r, { width: 2, alpha: 0.8 });
    for (let x = 24; x < 66; x += 7) {
      line(ctx, x, 180, x + 2, 150, r, { width: 0.9, alpha: 0.32, passes: 1 }, 2);
    }
    for (let y = 154; y < 178; y += 8) {
      line(ctx, 18, y, 68, y - 1, r, { width: 0.9, alpha: 0.28, passes: 1 }, 3);
    }
    stroke(ctx, [[28, 150], [44, 130], [62, 148]], r, { width: 2, alpha: 0.7 });
  });
}

/** The thorn over the headland: one tree, cut back on the field side
 *  every year for as long as anybody has been cutting it. */
export function thornTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(224, 256, seed, (ctx, r) => {
    fillBlob(ctx, 132, 92, 60, r, WASH.forest, 0.3, 0.72);
    fillBlob(ctx, 106, 108, 38, r, WASH.forest, 0.22, 0.8);
    stroke(ctx, [[94, 250], [92, 196], [104, 156], [116, 128]], r, { width: 5, alpha: 0.88 });
    stroke(ctx, [[112, 250], [110, 198], [124, 158], [134, 130]], r, { width: 4, alpha: 0.84 });
    // the branches all go ONE WAY, because the field side is cut and the
    // headland side is not. It is a hedge tree and it looks like one.
    for (let i = 0; i < 7; i++) {
      const y = 132 + i * 5;
      stroke(ctx, [[118 + i * 2, y], [150 + i * 6, y - 16 - r() * 12],
        [178 + i * 5, y - 20 - r() * 20]], r, { width: 2 - i * 0.13, alpha: 0.66, passes: 1 });
    }
    // and two stubs on the cut side, going nowhere
    stroke(ctx, [[104, 156], [86, 148], [76, 152]], r, { width: 2.2, alpha: 0.6, passes: 1 });
    stroke(ctx, [[110, 178], [92, 174]], r, { width: 2, alpha: 0.5, passes: 1 });
    for (const [cx, cy, cr] of [[150, 86, 26], [180, 100, 22], [126, 74, 24],
      [196, 76, 18], [156, 118, 20]] as [number, number, number][]) {
      scribbleCircle(ctx, cx, cy, cr, r, { width: 1.3, alpha: 0.4, jitter: 2.2, passes: 1 }, 1.5);
    }
    scribbleCircle(ctx, 152, 94, 58, r, { width: 2, alpha: 0.6, jitter: 3.4 }, 1.06);
    hatch(ctx, 100, 100, 46, 34, 0.7, 6.5, r, { alpha: 0.16 });
  });
}

/* ================================================================== *
 * THE PEOPLE — and they are working.
 * ================================================================== */

/**
 * JOAN HARROW. She is drawn WORKING, in every pose the game has of her,
 * because THE-WAITS §10 says she is the only person in this world
 * waiting for something that actually arrives and is therefore the only
 * one who is not really waiting.
 *
 * `at` 0 is her in the corn with a hook, three-quarters away. `at` 1 is
 * her standing at the headland with her hands at the small of her back,
 * which is the one moment in her day she is not doing anything, and it
 * lasts as long as a meal.
 */
export function joanTexture(seed: number, at: 0 | 1): THREE.CanvasTexture {
  return makeTexture(112, 176, seed, (ctx, r) => {
    const cx = 52;
    if (at === 0) {
      /* BENT TO THE WORK, and round 1 drew this standing up with its
       * arms down, which is a person waiting. The bend is the whole
       * drawing: the head comes DOWN AND FORWARD to hip height, the
       * back is one long curve above it, and the hook is at the end of
       * an arm that is already at the ground. */
      const hx = 84;
      const hy = 92;
      scribbleCircle(ctx, hx, hy, 12, r, { width: 2, alpha: 0.85 }, 1.05);
      stroke(ctx, [[hx - 12, hy - 6], [hx - 6, hy - 16], [hx + 8, hy - 14]], r,
        { width: 1.7, alpha: 0.7 });
      // the back: hips to shoulders to neck, one curve, nearly level
      stroke(ctx, [[36, 104], [50, 88], [70, 84], [hx - 6, hy - 8]], r,
        { width: 3.2, alpha: 0.88 });
      fillPoly(ctx, [[34, 112], [46, 84], [76, 80], [80, 100], [44, 118]], EARTH, 0.24);
      stroke(ctx, [[34, 112], [46, 84], [76, 80]], r, { width: 2, alpha: 0.8 });
      // the near arm, down to the ground, with the hook at the end of it
      stroke(ctx, [[74, 92], [78, 116], [72, 136]], r, { width: 1.9, alpha: 0.84 });
      stroke(ctx, [[72, 136], [90, 142], [98, 128]], r, { width: 2.2, alpha: 0.78 });
      // the far arm, gathering
      stroke(ctx, [[62, 88], [52, 112], [58, 130]], r, { width: 1.7, alpha: 0.7 });
      // the legs, braced, one forward
      line(ctx, 36, 110, 28, 168, r, { width: 2.3, alpha: 0.85 });
      line(ctx, 44, 112, 52, 168, r, { width: 2.2, alpha: 0.82 });
      fillPoly(ctx, [[32, 108], [42, 104], [50, 140], [30, 142]], CLOTH, 0.5);
    } else {
      /* STANDING AT THE HEADLAND, hands at the small of her back. It is
       * the one moment in her day she is not doing anything, and it
       * lasts as long as a meal. */
      scribbleCircle(ctx, cx, 34, 13, r, { width: 2, alpha: 0.85 }, 1.05);
      stroke(ctx, [[cx - 14, 30], [cx - 10, 18], [cx + 10, 18], [cx + 14, 31]], r,
        { width: 1.7, alpha: 0.72 });
      line(ctx, cx + 13, 30, cx + 22, 40, r, { width: 1.4, alpha: 0.6, passes: 1 }, 2);
      fillPoly(ctx, [[cx - 15, 50], [cx - 20, 124], [cx + 20, 124], [cx + 15, 50]], EARTH, 0.24);
      poly(ctx, [[cx - 15, 50], [cx - 20, 124], [cx + 20, 124], [cx + 15, 50]], r,
        { width: 2, alpha: 0.85 });
      fillPoly(ctx, [[cx - 13, 66], [cx - 17, 118], [cx + 15, 118], [cx + 11, 64]], CLOTH, 0.55);
      poly(ctx, [[cx - 13, 66], [cx - 17, 118], [cx + 15, 118], [cx + 11, 64]], r,
        { width: 1.3, alpha: 0.55, passes: 1 });
      // both arms go BEHIND her: the elbows read, the hands do not, and
      // that is the whole posture
      stroke(ctx, [[cx - 14, 58], [cx - 25, 84], [cx - 9, 96]], r, { width: 1.9, alpha: 0.82 });
      stroke(ctx, [[cx + 14, 58], [cx + 25, 84], [cx + 9, 96]], r, { width: 1.9, alpha: 0.82 });
      line(ctx, cx - 18, 124, cx - 16, 168, r, { width: 2.2, alpha: 0.84 });
      line(ctx, cx + 18, 124, cx + 16, 168, r, { width: 2.2, alpha: 0.84 });
    }
  });
}

/**
 * A FIELD HAND, in three postures, **none of which looks up**
 * (THE-STRANGERS C16). The phase of the bend-and-straighten never
 * reaches the top: pose 2 is the highest any of them gets and its head
 * is still down.
 */
export function fieldHandTexture(seed: number, pose: 0 | 1 | 2): THREE.CanvasTexture {
  return makeTexture(96, 160, seed, (ctx, r) => {
    const cx = 48;
    const bend = [1, 0.6, 0.24][pose];
    const headY = 30 + bend * 44;
    const headX = cx + bend * 16;
    scribbleCircle(ctx, headX, headY, 12, r, { width: 1.9, alpha: 0.82 }, 1.05);
    if (r() > 0.45) line(ctx, headX - 15, headY - 6, headX + 15, headY - 8, r,
      { width: 1.6, alpha: 0.75 });
    // the spine: one curve from the hips to the neck, and the bend is
    // the whole drawing
    stroke(ctx, [[cx - 6, 116], [cx + bend * 8, 92 - bend * 4], [headX - 4, headY + 12]], r,
      { width: 2.6, alpha: 0.86 });
    fillPoly(ctx, [[cx - 14, 116], [cx - 8 + bend * 12, 78], [cx + 12 + bend * 14, 80],
      [cx + 14, 116]], EARTH, 0.22);
    // arms hanging toward the ground, always
    stroke(ctx, [[headX - 8, headY + 18], [headX - 4, headY + 44], [headX + 2, 122]], r,
      { width: 1.8, alpha: 0.8 });
    stroke(ctx, [[headX + 8, headY + 18], [headX + 14, headY + 44], [headX + 10, 120]], r,
      { width: 1.7, alpha: 0.76 });
    line(ctx, cx - 8, 116, cx - 10, 154, r, { width: 2.1, alpha: 0.84 });
    line(ctx, cx + 8, 116, cx + 10, 154, r, { width: 2.1, alpha: 0.84 });
  });
}

/* ================================================================== *
 * THE FLOCK
 * ================================================================== */

/** A sheep. The fleece is ONE continuous scribble and the legs are four
 *  marks: anything more and it is a toy. Four heads — down, down, down,
 *  and one that is looking at you, which is the one you notice. */
export function sheepTexture(seed: number, pose: 0 | 1 | 2 | 3): THREE.CanvasTexture {
  // 0,1,2 grazing (three different bodies) · 3 head up, watching
  return makeTexture(128, 96, seed, (ctx, r) => {
    const up = pose === 3;
    fillBlob(ctx, 62, 46, 30, r, CLOTH, 0.62, 0.66);
    // the fleece: one long scribble round the body, never closing
    const pts: [number, number][] = [];
    for (let i = 0; i <= 30; i++) {
      const a = -2.6 + (i / 30) * 5.4;
      const rr = 30 * (0.86 + ((i % 3) * 0.09));
      pts.push([62 + Math.cos(a) * rr, 46 + Math.sin(a) * rr * 0.66]);
    }
    stroke(ctx, pts, r, { width: 2, alpha: 0.72, jitter: 2.6 });
    for (let i = 0; i < 9; i++) {
      const a = -2.4 + r() * 5;
      scribbleCircle(ctx, 62 + Math.cos(a) * 22, 44 + Math.sin(a) * 15, 6 + r() * 4, r,
        { width: 1.1, alpha: 0.26, passes: 1, jitter: 1.6 }, 1.4);
    }
    // the head: dark, small, and always in front of the fleece
    const hx = up ? 96 : 100;
    const hy = up ? 32 : 66;
    stroke(ctx, [[86, 40], [hx - 4, hy - 6]], r, { width: 3, alpha: 0.8, passes: 1 });
    fillBlob(ctx, hx, hy, 9, r, TIMBER, 0.5, 0.8);
    scribbleCircle(ctx, hx, hy, 8, r, { width: 1.7, alpha: 0.82 }, 1.15);
    // ears, out sideways, which is the whole silhouette of a sheep's head
    line(ctx, hx - 5, hy - 5, hx - 15, hy - 8, r, { width: 1.5, alpha: 0.72, passes: 1 }, 2);
    line(ctx, hx + 4, hy - 6, hx + 12, hy - 10, r, { width: 1.5, alpha: 0.72, passes: 1 }, 2);
    // four legs, thin, and two of them are together
    for (const [x, o] of [[42, 0], [50, 2], [76, 0], [82, -2]] as [number, number][]) {
      line(ctx, x, 60, x + o, 88, r, { width: 1.6, alpha: 0.78 }, 2);
    }
  });
}

/* ================================================================== *
 * THE FURNITURE OF A WORKED PLACE
 * ================================================================== */

/** The void's one silhouette: a stone trough on the rough grazing, with
 *  the ground worn bare all round it. */
export function stoneTroughTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(192, 112, seed, (ctx, r) => {
    const body: [number, number][] = [[24, 100], [30, 46], [166, 44], [172, 100]];
    fillPoly(ctx, body, WASH.castle, 0.55);
    poly(ctx, body, r, { width: 2.8, alpha: 0.88 });
    line(ctx, 30, 46, 166, 44, r, { width: 2.4, alpha: 0.85 });
    line(ctx, 36, 56, 160, 54, r, { width: 1.8, alpha: 0.5, passes: 1 });
    // the water in it, which is the only blue on the rough grazing
    fillPoly(ctx, [[38, 60], [158, 58], [156, 66], [40, 68]], WASH.seaShallow, 0.4);
    for (let i = 0; i < 9; i++) {
      const x = 40 + r() * 116;
      line(ctx, x, 90 - r() * 30, x + 3, 90 - r() * 30, r,
        { width: 1, alpha: 0.2, passes: 1 }, 2);
    }
    hatch(ctx, 26, 60, 26, 40, 0.06, 6, r, { alpha: 0.16 });
  });
}

/** A field gate. Five bars, one hinge post, and one post that is not a
 *  hinge post any more. */
export function fieldGateTexture(seed: number, open: boolean): THREE.CanvasTexture {
  return makeTexture(224, 144, seed, (ctx, r) => {
    line(ctx, 18, 138, 20, 24, r, { width: 4, alpha: 0.88 });
    line(ctx, 206, 138, 204, 34, r, { width: 3.4, alpha: 0.8 });
    const lean = open ? 0.34 : 0;
    const tip = (y: number) => (open ? (138 - y) * lean : 0);
    for (let i = 0; i < 5; i++) {
      const y = 44 + i * 20;
      line(ctx, 22, y, open ? 150 : 202, y - tip(y) * 0.4, r,
        { width: 2.2 - i * 0.1, alpha: 0.8, passes: 1 }, 4);
    }
    // the brace, which always runs from the bottom hinge upward
    line(ctx, 24, 132, open ? 146 : 198, 46, r, { width: 2.4, alpha: 0.78 });
    if (open) {
      // and it has dropped: the far end is nearer the ground than the
      // near end, which is what an unhung gate does
      line(ctx, 146, 46, 152, 130, r, { width: 2, alpha: 0.7 });
    } else {
      line(ctx, 200, 42, 202, 132, r, { width: 2, alpha: 0.72 });
    }
  });
}

/** THE FORD: the stones, the ruts going into the water, and the scour. */
export function fordStonesDecal(seed: number): THREE.CanvasTexture {
  return makeTexture(256, 192, seed, (ctx, r) => {
    // the two ruts, running down the quad and stopping at the water
    for (const x0 of [88, 154]) {
      stroke(ctx, [[x0 + (r() - 0.5) * 6, 4], [x0 + (r() - 0.5) * 8, 60],
        [x0 + (r() - 0.5) * 8, 132], [x0 + (r() - 0.5) * 6, 188]], r,
        { width: 4.4, alpha: 0.24, passes: 1, color: EARTH, jitter: 2.4 });
      stroke(ctx, [[x0 - 3, 10], [x0 - 2, 90], [x0 - 3, 182]], r,
        { width: 1.4, alpha: 0.16, passes: 1, jitter: 2 });
    }
    // THE STONES: eight, for anybody on foot, and they are not in line
    const stones: [number, number, number][] = [
      [30, 168, 13], [44, 142, 11], [36, 116, 14], [52, 92, 10],
      [42, 66, 12], [56, 42, 11], [46, 20, 13], [62, 2, 9],
    ];
    for (const [x, y, rad] of stones) {
      const jx = x + (r() - 0.5) * 7;
      const jy = y + (r() - 0.5) * 7;
      fillBlob(ctx, jx, jy, rad, r, WASH.castle, 0.6, 0.78);
      scribbleCircle(ctx, jx, jy, rad, r, { width: 1.8, alpha: 0.68, jitter: 1.6 }, 1.1);
      hatch(ctx, jx - rad, jy, rad * 0.9, rad * 0.8, 0.1, 4, r, { alpha: 0.14 });
    }
    // the scour: the water's own working, running across everything
    for (let i = 0; i < 12; i++) {
      const y = 20 + r() * 152;
      line(ctx, 6, y, 250, y + (r() - 0.5) * 8, r,
        { width: 1.2, alpha: 0.1, passes: 1, color: SLATE }, 6);
    }
  });
}

/** A shed axle at the ford, and nobody has moved it. */
export function shedAxleTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(192, 112, seed, (ctx, r) => {
    line(ctx, 26, 84, 168, 78, r, { width: 5, alpha: 0.82 });
    line(ctx, 26, 92, 168, 86, r, { width: 2.4, alpha: 0.5 });
    // one wheel still on it, sunk to the hub; the other end is bare
    scribbleCircle(ctx, 44, 76, 32, r, { width: 2.8, alpha: 0.85 }, 1.08);
    scribbleCircle(ctx, 44, 76, 10, r, { width: 2.2, alpha: 0.8 }, 1.3);
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2 + 0.3;
      // the bottom of the wheel is in the ground, so the lower spokes
      // simply stop
      if (Math.sin(a) > 0.55) continue;
      line(ctx, 44 + Math.cos(a) * 9, 76 + Math.sin(a) * 9,
        44 + Math.cos(a) * 30, 76 + Math.sin(a) * 30, r,
        { width: 1.6, alpha: 0.6, passes: 1 }, 2);
    }
    poly(ctx, [[160, 66], [176, 64], [178, 90], [162, 92]], r, { width: 2, alpha: 0.72 });
    hatch(ctx, 20, 96, 160, 14, 0.03, 5, r, { alpha: 0.12 });
  });
}

/** The scarecrow, kept from Session 1 and given one mark it will never
 *  be asked about: a Brim maker's stamp inside the coat collar
 *  (THE-STRANGERS U8). Four pixels, at pencil weight, and it is the
 *  quietest thing in the land. */
export function downsScarecrowTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(128, 192, seed, (ctx, r) => {
    line(ctx, 64, 184, 64, 60, r, { width: 2.8, alpha: 0.9 });
    line(ctx, 22, 92, 106, 88, r, { width: 2.4, alpha: 0.9 });
    fillPoly(ctx, [[44, 150], [50, 96], [78, 96], [86, 150]], TIMBER, 0.4);
    poly(ctx, [[44, 150], [50, 96], [78, 96], [86, 150]], r, { width: 1.8, alpha: 0.8 });
    // the coat's stripes, which is how this land draws cloth
    for (let i = 0; i < 7; i++) {
      const y = 102 + i * 7;
      line(ctx, 47 + i * 0.6, y, 82 - i * 0.4, y + 1, r,
        { width: 0.9, alpha: 0.18, passes: 1 }, 2);
    }
    // THE COLLAR, turned up, and the mark inside it
    stroke(ctx, [[50, 96], [56, 88], [64, 92], [72, 88], [78, 96]], r,
      { width: 1.8, alpha: 0.78 });
    scribbleCircle(ctx, 64, 92, 3.2, r, { width: 0.8, alpha: 0.34, passes: 1, color: PENCIL }, 1.2);
    line(ctx, 62, 92, 66, 92, r, { width: 0.7, alpha: 0.3, passes: 1, color: PENCIL }, 2);
    fillBlob(ctx, 64, 46, 17, r, STRAW, 0.6, 1.05);
    scribbleCircle(ctx, 64, 46, 16, r, { width: 1.8, alpha: 0.85 });
    line(ctx, 56, 42, 60, 44, r, { width: 1.4, alpha: 0.8, passes: 1 });
    line(ctx, 68, 44, 72, 42, r, { width: 1.4, alpha: 0.8, passes: 1 });
    stroke(ctx, [[56, 54], [64, 57], [72, 53]], r, { width: 1.3, alpha: 0.8, passes: 1 });
    for (const [sx, sy] of [[22, 92], [106, 88]] as [number, number][]) {
      for (let i = 0; i < 4; i++) {
        line(ctx, sx, sy, sx + (r() - 0.5) * 14, sy + 8 + r() * 6, r,
          { width: 1, alpha: 0.5, passes: 1 });
      }
    }
  });
}

/**
 * A HANDCART, standing at the field gate with the day's sacks still on
 * it. Two wheels, a bed, two shafts down on the ground — a cart that
 * has been PUT DOWN rather than parked, which is what a cart looks like
 * when the person pulling it went to do something else.
 *
 * It is the Downs' only piece of foreground furniture and it exists
 * because THE SHOT needs a near thing at the ford, which the ford's own
 * stones are too far up the frame to be.
 */
export function sackCartTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(256, 192, seed, (ctx, r) => {
    // the shafts, down on the ground, running toward the lens
    line(ctx, 40, 178, 118, 138, r, { width: 3.2, alpha: 0.82 });
    line(ctx, 52, 186, 128, 146, r, { width: 3.0, alpha: 0.78 });
    line(ctx, 40, 178, 52, 186, r, { width: 2.2, alpha: 0.6, passes: 1 }, 2);
    // the bed, tipped forward because the shafts are down
    const bed: [number, number][] = [[112, 142], [214, 118], [222, 138], [122, 162]];
    fillPoly(ctx, bed, TIMBER, 0.3);
    poly(ctx, bed, r, { width: 2.6, alpha: 0.86 });
    for (let i = 1; i < 6; i++) {
      const t = i / 6;
      line(ctx, 112 + 102 * t, 142 - 24 * t, 122 + 100 * t, 162 - 24 * t, r,
        { width: 1.1, alpha: 0.3, passes: 1 }, 2);
    }
    // the tail board
    poly(ctx, [[214, 118], [222, 138], [230, 100], [222, 82]], r, { width: 2.2, alpha: 0.78 });
    // one wheel, and the far one is only its top
    scribbleCircle(ctx, 150, 150, 30, r, { width: 2.8, alpha: 0.86 }, 1.06);
    scribbleCircle(ctx, 150, 150, 8, r, { width: 2, alpha: 0.7 }, 1.3);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + 0.4;
      line(ctx, 150 + Math.cos(a) * 8, 150 + Math.sin(a) * 8,
        150 + Math.cos(a) * 28, 150 + Math.sin(a) * 28, r,
        { width: 1.5, alpha: 0.55, passes: 1 }, 2);
    }
    stroke(ctx, [[196, 132], [206, 118], [220, 122]], r, { width: 2.2, alpha: 0.6, passes: 1 });
    // THE SACKS: three, tied at the neck, and one of them is still full
    const sacks: [number, number, number][] = [[146, 108, 26], [180, 100, 22], [162, 92, 18]];
    for (const [sx, sy, sr] of sacks) {
      fillBlob(ctx, sx, sy, sr, r, CLOTH, 0.7, 1.15);
      scribbleCircle(ctx, sx, sy, sr, r, { width: 2, alpha: 0.8, jitter: 2.2 }, 1.08);
      // the tie, and the ear of cloth above it
      line(ctx, sx - 7, sy - sr + 3, sx + 7, sy - sr + 3, r,
        { width: 1.8, alpha: 0.6, passes: 1 }, 2);
      stroke(ctx, [[sx - 5, sy - sr + 2], [sx - 2, sy - sr - 8], [sx + 6, sy - sr - 4]], r,
        { width: 1.5, alpha: 0.62, passes: 1 });
      hatch(ctx, sx - sr, sy, sr * 0.7, sr * 0.9, 0.1, 5, r, { alpha: 0.12 });
    }
  });
}
