import * as THREE from 'three';
import {
  makeTexture, stroke, line, scribbleCircle, hatch, scribbleFill, type Ctx2D,
} from '../engine/ink';
import { INK, PENCIL, WASH } from '../engine/palette';

/**
 * THE PENWOOD's prop box (design/specs/the-penwood.md).
 *
 * ── THE LAND'S INK TECHNIQUE, AND IT IS ONE SENTENCE ────────────────
 *
 * **The Downs are drawn in stripes across the fall of the ground; the
 * Penwood is drawn in strokes straight up the page.** Every mark in
 * this file is a vertical or it is the floor, and the two exceptions
 * are load-bearing: the birch's bark, which lies down, and the fallen
 * trunks, which are horizontals in a vertical land and are the only
 * thing in the wood that reads as an event.
 *
 * ── AND THE DARK IS THREE THINGS, NOT ONE ───────────────────────────
 *
 * Session 1's pine was four nested triangles with an UNCLIPPED `hatch`
 * over them, and the hatch sprayed diagonal lines fifty pixels past the
 * drawing in every direction. Two hundred of those on a Poisson scatter
 * did not read as a wood; the first contact sheet of this session read
 * as a wood in heavy rain, and it was right to.
 *
 *   1. **The needle mass is hatched INSIDE its own silhouette.** Every
 *      hatch call here is clipped to the whorl that owns it, three
 *      passes crossing at about fifteen degrees, and nothing leaves the
 *      tree.
 *   2. **Pressure falls with distance in three fixed registers** — near
 *      trunks at width 4.4 / alpha 0.88, the stand at 2.4 / 0.6, the far
 *      trees at 1.3 / 0.32 and PENCIL rather than INK. A stand is built
 *      from all three at once. That is what makes it a stand and not a
 *      row.
 *   3. **The floor is drawn**, and under the old ring it is the darkest
 *      ground in the game.
 */

/* Pigments, mixed for this land the way Session 3 mixed TIMBER and
 * PLASTER for Brim's. They are line and body colours, never washes:
 * every wash in this file still comes out of palette.ts. */
const BARK = '#5b5347';
const BIRCH = '#d9d5c6';
const CREAMY = '#e6ddc4';

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
    const rr = rad * (0.8 + r() * 0.4);
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

/** A stain with no edge on it — see textures-farm.ts, which learned the
 *  same lesson in the same round of the same gate: a sixteen-sided
 *  polygon used as a colour shows all sixteen of its sides. */
function stain(
  ctx: Ctx2D, cx: number, cy: number, rx: number, ry: number,
  color: string, alpha: number
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(1, ry / rx);
  const g = ctx.createRadialGradient(0, 0, rx * 0.05, 0, 0, rx);
  const rgb = color.replace('#', '');
  const c = [0, 2, 4].map((i) => parseInt(rgb.slice(i, i + 2), 16)).join(',');
  g.addColorStop(0, `rgba(${c},${alpha})`);
  g.addColorStop(0.58, `rgba(${c},${alpha * 0.66})`);
  g.addColorStop(1, `rgba(${c},0)`);
  ctx.fillStyle = g;
  ctx.fillRect(-rx, -rx, rx * 2, rx * 2);
  ctx.restore();
}

/* ================================================================== *
 * THE THREE REGISTERS.
 *
 * A number per register rather than a switch per drawing, so every tree
 * in the land agrees about what distance looks like.
 * ================================================================== */

export type Reg = 0 | 1 | 2;

const REG = [
  { w: 4.4, a: 0.88, color: INK, mass: 0.24, wash: 0.34 },   // near
  { w: 2.4, a: 0.60, color: INK, mass: 0.17, wash: 0.26 },   // the stand
  { w: 1.3, a: 0.32, color: PENCIL, mass: 0.10, wash: 0.15 }, // the far trees
] as const;

/**
 * ONE PINE, and it is the drawing the whole land is made of.
 *
 * ROUND 1 OF THE GATE THREW THE FIRST VERSION AWAY, and the reason is
 * worth keeping because it is the same reason four times over. It drew
 * each whorl as a branch stroke going out and down with a clipped hatch
 * over it, and at eighteen units tall the two sides of a whorl joined
 * into one continuous ARC — so a stand of them came out as a field of
 * croquet hoops with vertical fuzz in between, standing on bare poles.
 * A pine is not a set of branches. **A pine is a MASS with a pole under
 * it**, and the branches inside the mass are structure you half see.
 *
 * So the drawing is built the other way round now:
 *
 *   1. a SPIRE ENVELOPE, w(y) = maxW · t^0.86 with a seeded wobble, and
 *      every mark in the crown lives inside it;
 *   2. the mass: two hundred SHORT strokes, all angled down and out at
 *      about thirty-five degrees, dense on the axis and thinning to the
 *      edge, which is what makes the silhouette ragged without an
 *      outline being drawn anywhere;
 *   3. seven branch lines in the lower half only, short, so they read
 *      as structure inside the mass rather than as the mass itself;
 *   4. the pole, visible for the bottom third and NOT above it, because
 *      above it it is inside the tree.
 *
 * Nothing in it is hatched. `hatch` draws parallel lines over a
 * rectangle and a pine has no rectangles in it.
 */
export function penwoodPineTexture(seed: number, reg: Reg = 1): THREE.CanvasTexture {
  const R = REG[reg];
  return makeTexture(160, 448, seed, (ctx, r) => {
    const lean = (r() - 0.5) * 12;
    const base = 440;
    const topY = 14 + r() * 22;
    const trunkBase = 78 + r() * 26;              // where the crown starts
    const axis = (y: number) => 80 + lean * (1 - (y - topY) / (base - topY));
    const maxW = 50 + r() * 18;
    const wob = [r() * 6.3, r() * 6.3, r() * 6.3];
    /** The spire, and it is the only shape in this drawing. */
    const halfW = (y: number) => {
      const t = Math.max(0, Math.min(1, (y - topY) / (base - trunkBase * 0.2 - topY)));
      const w = maxW * Math.pow(t, 0.86);
      return w * (1 + 0.13 * Math.sin(t * 9 + wob[0]) + 0.08 * Math.sin(t * 21 + wob[1]));
    };

    /* The crown's damp under-stain, and it is ONE CONTINUOUS SPIRE.
     * Round 1 laid seven `fillBlob`s down the axis and every one of them
     * showed as a separate pale-green lozenge — the far register came
     * out as a stack of them with no ink on it at all, which is a
     * cairn, not a tree. Twenty-two soft stains at a third of the alpha
     * overlap into one shape with no edge anywhere. */
    for (let i = 0; i < 22; i++) {
      const t = 0.06 + (i / 21) * 0.94;
      const y = topY + t * (base - 52 - topY);
      const w = halfW(y);
      stain(ctx, axis(y) + (r() - 0.5) * w * 0.22, y, w * 1.05, w * 0.5,
        WASH.forest, R.wash * 0.42);
    }

    /* The pole: the bottom QUARTER only, and it fades out where the
     * crown takes over. Round 1 ran it up to well over half the height
     * at full pressure and a stand of them read as a burnt wood —
     * black poles with a little green on the top. What you actually see
     * of a pine's trunk is the bit under the lowest live branch. */
    for (const [side, w] of [[-1, R.w], [1, R.w * 0.78]] as [number, number][]) {
      stroke(ctx, [[axis(base) + side * 3, base], [axis(base - 60) + side * 2.6, base - 60],
        [axis(base - 118) + side * 2.2, base - 118]], r,
        { width: w, alpha: R.a, color: R.color, jitter: 1.0 });
      stroke(ctx, [[axis(base - 112) + side * 2.2, base - 112],
        [axis(base - 158) + side * 1.9, base - 158]], r,
        { width: w * 0.75, alpha: R.a * 0.4, color: R.color, jitter: 1.0, passes: 1 });
    }
    if (reg < 2) {
      for (let i = 0; i < 5; i++) {
        const y = base - 20 - r() * 150;
        line(ctx, axis(y) - 3, y, axis(y) + 3, y + 2, r,
          { width: 1, alpha: R.a * 0.22, passes: 1, color: R.color }, 2);
      }
    }
    // the root flare
    for (const d of [-1, -0.4, 0.5, 1]) {
      stroke(ctx, [[axis(base) + d * 3, base - 14], [axis(base) + d * 9, base - 2],
        [axis(base) + d * 15, base]], r,
        { width: R.w * 0.45, alpha: R.a * 0.5, color: R.color, passes: 1 });
    }

    /* THE BRANCHES: seven, in the LOWER HALF only, short, and never
     * long enough for two of them to join into an arc. */
    for (let i = 0; i < 7; i++) {
      const t = 0.52 + (i / 7) * 0.46;
      const y = topY + t * (base - trunkBase * 0.2 - topY);
      if (r() < 0.2) continue;
      const s = i % 2 === 0 ? 1 : -1;
      const w = halfW(y);
      stroke(ctx, [[axis(y), y - 2], [axis(y) + s * w * 0.55, y + 3], [axis(y) + s * w * 0.9, y + 11]], r,
        { width: Math.max(0.8, R.w * 0.38), alpha: R.a * 0.55, color: R.color, passes: 1 });
    }

    /* THE MASS. Everything above is scaffolding; this is the tree.
     * Short strokes, down and out, dense on the axis, thinning to the
     * edge — the density falloff IS the silhouette. */
    /* Twice as many strokes at half the length. A stand tree can end up
     * ten units from the lens — you are IN a wood — and at that range a
     * seventeen-pixel mark on a seven-unit quad is a fifty-pixel scratch
     * across the frame. Round 3's sheet had the lower-left quadrant
     * sprayed with them. Short and dense merges; long and sparse
     * resolves, and resolving is what a wood must never do. */
    const n = reg === 2 ? 300 : reg === 1 ? 460 : 520;
    for (let i = 0; i < n; i++) {
      const t = Math.pow(r(), 0.62);
      const y = topY + t * (base - trunkBase - topY);
      const w = halfW(y);
      // bias toward the axis: the crown is solid in the middle
      const u = Math.pow(r(), 0.62) * (r() > 0.5 ? 1 : -1);
      const x = axis(y) + u * w;
      const s = u >= 0 ? 1 : -1;
      const len = (3.4 + r() * 5.4) * (0.6 + t * 0.7);
      const ang = 0.42 + r() * 0.5;                 // down and out
      const a = R.a * (0.42 + r() * 0.5) * (1 - Math.abs(u) * 0.3);
      line(ctx, x, y, x + s * Math.cos(ang) * len, y + Math.sin(ang) * len, r,
        { width: 0.9 + r() * (reg === 0 ? 1.5 : 0.85), alpha: a, passes: 1, color: R.color }, 2);
    }
    /* and the leader: one spike out of the top of the mass, which is
     * what makes a pine a pine at two hundred units */
    stroke(ctx, [[axis(topY), topY], [axis(topY + 22) + (r() - 0.5) * 3, topY + 22]], r,
      { width: R.w * 0.4, alpha: R.a * 0.8, color: R.color, passes: 1 });

    // one broken lower limb on about half of them, snapped short
    if (r() > 0.5) {
      const y = base - 150 - r() * 60;
      const s = r() > 0.5 ? 1 : -1;
      stroke(ctx, [[axis(y), y], [axis(y) + s * (16 + r() * 12), y - 3 - r() * 7]], r,
        { width: R.w * 0.4, alpha: R.a * 0.55, color: R.color, passes: 1 });
    }
  });
}

/**
 * THE NEAR TRUNK — the foreground layer, and every framing in this land
 * has exactly one.
 *
 * The crown runs off the top of the quad on purpose: a tree you can see
 * the top of is a tree you are outside of, and the whole point of this
 * drawing is that you are IN the wood. So it is bark, one branch stub,
 * and nothing else, at full pressure, at eleven units tall.
 */
export function pineCropTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(224, 384, seed, (ctx, r) => {
    const lean = (r() - 0.5) * 16;
    const l = (y: number) => 96 + lean * (1 - y / 384);
    // a trunk TAPERS, and round 1 drew two parallel lines, which is a
    // post. Half a unit of taper over eleven units is what the eye
    // reads as a tree rather than as a fence rail.
    const w = (y: number) => (17 + r() * 0.4) * (0.72 + 0.28 * (y / 384)) + 4;
    const L = (y: number) => l(y) - w(y);
    const R2 = (y: number) => l(y) + w(y);
    const ys = [0, 60, 130, 200, 270, 330, 384];
    fillPoly(ctx, [...ys.map((y) => [L(y), y] as [number, number]),
      ...ys.slice().reverse().map((y) => [R2(y), y] as [number, number])], BARK, 0.34);
    stroke(ctx, ys.map((y) => [L(y), y] as [number, number]), r,
      { width: 4.6, alpha: 0.9, jitter: 1.2 });
    stroke(ctx, ys.map((y) => [R2(y), y] as [number, number]), r,
      { width: 4.0, alpha: 0.86, jitter: 1.2 });

    /* THE BARK, and it is what the drawing is FOR. Scots pine plates:
     * long irregular islands with a gap between them, drawn as broken
     * verticals rather than as a texture, because at eleven units tall
     * a texture is a smear and a line is a line. */
    for (let i = 0; i < 34; i++) {
      const y = 8 + r() * 360;
      const h = 16 + r() * 58;
      const x = l(y) + (r() - 0.5) * w(y) * 1.7;
      stroke(ctx, [[x, y], [x + (r() - 0.5) * 4, y + h * 0.5], [x + (r() - 0.5) * 5, y + h]], r,
        { width: 1.1 + r() * 1.2, alpha: 0.16 + r() * 0.24, passes: 1 });
    }
    // the shade side, inside the trunk's own width and following it
    for (let i = 0; i < 16; i++) {
      const y = 6 + r() * 372;
      line(ctx, L(y) + 3, y, L(y) + 3 + w(y) * 0.5, y + 4, r,
        { width: 1.4, alpha: 0.1, passes: 1 }, 2);
    }

    /* One branch stub, high, going out of frame — and it is a BRANCH,
     * with needles hanging off it, not a rectangle of hatch. Round 1
     * clipped a hatch to a box beside the trunk and it read as exactly
     * that: a hatched box, floating. */
    const sy = 30 + r() * 60;
    const s = r() > 0.5 ? 1 : -1;
    stroke(ctx, [[l(sy), sy], [l(sy) + s * 46, sy - 4], [l(sy) + s * 104, sy + 18]], r,
      { width: 3.6, alpha: 0.82 });
    for (let i = 0; i < 26; i++) {
      const t = 0.22 + r() * 0.78;
      const bx = l(sy) + s * 104 * t;
      const by = sy - 4 * Math.sin(t * 3.14) + 18 * t * t;
      const len = 6 + r() * 10;
      const ang = 0.5 + r() * 0.6;
      line(ctx, bx, by, bx + s * Math.cos(ang) * len, by + Math.sin(ang) * len, r,
        { width: 1 + r() * 1.1, alpha: 0.24 + r() * 0.3, passes: 1 }, 2);
    }

    // the root flare, gripping the page
    for (const d of [-1, -0.45, 0.5, 1]) {
      stroke(ctx, [
        [l(340) + d * w(340) * 0.8, 344],
        [l(376) + d * w(376) * 1.5, 372],
        [l(384) + d * (w(384) * 2.1 + 8), 384],
      ], r, { width: 2.6, alpha: 0.58 });
    }

    /* THE TOP OF THE QUAD IS ERASED.
     *
     * The crown runs off the top of the drawing on purpose — a tree you
     * can see the top of is a tree you are outside of — but a quad has
     * a hard edge and round 14's portrait sheet had one of these
     * standing beside Brack reading as a dark BOARD with a straight top
     * and a straight side. A trunk you are standing under does not
     * stop; it goes up into shade. Sixty pixels of fade at the top and
     * a hand of it down each side, and it dissolves instead. */
    ctx.globalCompositeOperation = 'destination-out';
    let g = ctx.createLinearGradient(0, 0, 0, 74);
    g.addColorStop(0, 'rgba(0,0,0,0.92)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 224, 74);
    for (const [x0, x1] of [[0, 18], [224, 206]] as [number, number][]) {
      g = ctx.createLinearGradient(x0, 0, x1, 0);
      g.addColorStop(0, 'rgba(0,0,0,1)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(Math.min(x0, x1), 0, 18, 384);
    }
    ctx.globalCompositeOperation = 'source-over';
  });
}

/** THE THICKET — young pine, head height, no trunk showing. The part of
 *  the wood you cannot see through, and the only place in the Penwood
 *  that is crowded. */
export function youngPineTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(128, 224, seed, (ctx, r) => {
    const cx = 64 + (r() - 0.5) * 8;
    const base = 214;
    const topY = 14 + r() * 16;
    const maxW = 40 + r() * 12;
    const halfW = (y: number) => {
      const t = Math.max(0, Math.min(1, (y - topY) / (base - topY)));
      return maxW * Math.pow(t, 0.72) * (1 + 0.12 * Math.sin(t * 11 + seed));
    };
    for (let i = 0; i < 16; i++) {
      const t = 0.08 + (i / 15) * 0.92;
      const y = topY + t * (base - topY);
      stain(ctx, cx + (r() - 0.5) * 8, y, halfW(y) * 1.05, halfW(y) * 0.55, WASH.forest, 0.13);
    }
    // no trunk at all: a young pine is skirted to the ground, which is
    // exactly why the thicket is the part of the wood you cannot see
    // through
    for (let i = 0; i < 210; i++) {
      const t = Math.pow(r(), 0.55);
      const y = topY + t * (base - topY);
      const w = halfW(y);
      const u = Math.pow(r(), 0.6) * (r() > 0.5 ? 1 : -1);
      const x = cx + u * w;
      const s = u >= 0 ? 1 : -1;
      const len = (5 + r() * 8) * (0.6 + t * 0.7);
      const ang = 0.4 + r() * 0.55;
      line(ctx, x, y, x + s * Math.cos(ang) * len, y + Math.sin(ang) * len, r,
        { width: 0.85 + r() * 0.8, alpha: 0.22 + r() * 0.34, passes: 1 }, 2);
    }
    stroke(ctx, [[cx, topY], [cx + (r() - 0.5) * 4, topY + 18]], r,
      { width: 1.5, alpha: 0.7, passes: 1 });
  });
}

/** A TRUNK DOWN, root plate up. The only horizontal in the wood, and the
 *  only thing in it that reads as an event. */
export function fallenPineTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(320, 128, seed, (ctx, r) => {
    // the trunk sits at the BOTTOM of the quad: a standee stands on the
    // ground, so a drawing centred in its canvas is a fallen tree
    // hanging three units in the air, which is what round 1 shipped
    const y0 = 104 + (r() - 0.5) * 8;
    const taper = 20;
    fillPoly(ctx, [[26, y0 - taper], [300, y0 - 9], [300, y0 + 9], [26, y0 + taper]], BARK, 0.26);
    stroke(ctx, [[26, y0 - taper], [150, y0 - 15], [300, y0 - 9]], r, { width: 3.2, alpha: 0.85 });
    stroke(ctx, [[26, y0 + taper], [150, y0 + 15], [300, y0 + 9]], r, { width: 3.0, alpha: 0.82 });
    // the bark plates again, lying down with it
    for (let i = 0; i < 14; i++) {
      const x = 40 + r() * 250;
      line(ctx, x, y0 - 12 + r() * 24, x + 18 + r() * 34, y0 - 12 + r() * 24, r,
        { width: 1, alpha: 0.22, passes: 1 }, 3);
    }
    hatch(ctx, 30, y0 + 2, 268, 18, 0.05, 5, r, { alpha: 0.16 });
    // THE ROOT PLATE: a disc of page torn up on its edge, and the only
    // circle in this land
    scribbleCircle(ctx, 30, y0, 34, r, { width: 2.6, alpha: 0.8 }, 1.12);
    for (let i = 0; i < 11; i++) {
      const a = r() * Math.PI * 2;
      stroke(ctx, [[30, y0], [30 + Math.cos(a) * 22, y0 + Math.sin(a) * 22],
        [30 + Math.cos(a) * (34 + r() * 12), y0 + Math.sin(a) * (32 + r() * 10)]], r,
        { width: 1.4, alpha: 0.5, passes: 1 });
    }
    // and the broken end, which is splinters and not a cut
    for (let i = 0; i < 5; i++) {
      line(ctx, 296, y0 - 8 + i * 4, 316 - r() * 12, y0 - 10 + i * 5, r,
        { width: 1.2, alpha: 0.55, passes: 1 }, 2);
    }
  });
}

/** The floor: needles, all lying one way, and the shade between them. */
export function needleFloorDecal(seed: number): THREE.CanvasTexture {
  return makeTexture(256, 256, seed, (ctx, r) => {
    const g = ctx.createRadialGradient(128, 128, 6, 128, 128, 124);
    g.addColorStop(0, 'rgba(111,129,104,0.26)');
    g.addColorStop(0.72, 'rgba(111,129,104,0.12)');
    g.addColorStop(1, 'rgba(111,129,104,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
    // the needles: pairs, all at one angle, because they fell together
    const lean = 0.5 + r() * 0.5;
    for (let i = 0; i < 150; i++) {
      const a = r() * Math.PI * 2;
      const d = Math.pow(r(), 0.55) * 118;
      const x = 128 + Math.cos(a) * d;
      const y = 128 + Math.sin(a) * d * 0.9;
      const l = 4 + r() * 7;
      const ang = lean + (r() - 0.5) * 0.7;
      line(ctx, x, y, x + Math.cos(ang) * l, y + Math.sin(ang) * l, r,
        { width: 0.85, alpha: 0.12 + r() * 0.2, passes: 1 }, 2);
    }
    // three cones, and never more
    for (let i = 0; i < 3; i++) {
      const x = 34 + r() * 188;
      const y = 34 + r() * 188;
      for (let k = 0; k < 5; k++) {
        line(ctx, x - 3 + k * 1.6, y - 6 + k * 2.4, x + 3 + k * 1.6, y - 4 + k * 2.4, r,
          { width: 1.1, alpha: 0.3, passes: 1 }, 2);
      }
    }
    scribbleFill(ctx, 78, 92, 60, 44, r, { alpha: 0.07, width: 1.2 });
  });
}

/**
 * THE TARN'S SKIN — the black water, DRAWN.
 *
 * The world's water is one shader and one blue, and it is right for the
 * sea, the river and the moat and completely wrong for this: a tarn in
 * a wood is not blue, it is whatever is standing over it, which here is
 * ninety units of pine. The note has said so since Session 1 — *still
 * water, black as the good ink* — and nothing in the game had ever
 * agreed with it.
 *
 * So the tarn's colour is not a shader change, it is a drawing lying on
 * the water: pooled INK at high alpha, the far trees' reflection as
 * vertical strokes going DOWN, and one flat highlight that never moves,
 * because nothing on this water moves. The medium is the style, and the
 * style is what makes this the only dark shape in a pale world.
 */
export function tarnSkinDecal(seed: number, edge = false): THREE.CanvasTexture {
  return makeTexture(512, 512, seed, (ctx, r) => {
    /* Round 1 laid this as three sixteen-sided `fillBlob`s of INK and it
     * came out as a faceted grey hexagon with a hard rim — the tarn had
     * a POLYGON on it. Water has no edge except its own shore, so the
     * body is a stain and the only line anywhere near it is the shore. */
    const rad = edge ? 200 : 244;
    stain(ctx, 256, 256, rad, rad, INK, edge ? 0.42 : 0.72);
    stain(ctx, 256 + (r() - 0.5) * 40, 256 + (r() - 0.5) * 40, rad * 0.72, rad * 0.72,
      INK, edge ? 0.2 : 0.44);
    /* THE REFLECTION. Vertical strokes going DOWN from the top edge —
     * the trees standing on the far bank, upside down, in a water that
     * has not moved in forty years. They are the only marks in the
     * Penwood that get FAINTER as they go away from their subject,
     * which is what a reflection does. */
    ctx.save();
    ctx.beginPath();
    ctx.arc(256, 256, rad * 0.94, 0, Math.PI * 2);
    ctx.clip();
    for (let i = 0; i < 54; i++) {
      const x = 24 + r() * 464;
      const len = 50 + Math.pow(r(), 0.7) * 210;
      const w = 1.6 + r() * 4;
      stroke(ctx, [[x, 30], [x + (r() - 0.5) * 5, 30 + len * 0.6], [x + (r() - 0.5) * 9, 30 + len]], r,
        { width: w, alpha: 0.08 + r() * 0.13, passes: 1, color: INK, jitter: 1.4 });
    }
    ctx.restore();
    // and one horizontal, which is the whole trick: still water has a
    // flat highlight and moving water has none
    if (!edge) {
      for (let i = 0; i < 5; i++) {
        const y = 262 + i * 14 + (r() - 0.5) * 6;
        const x0 = 116 + r() * 60;
        line(ctx, x0, y, x0 + 160 + r() * 130, y, r,
          { width: 2.2 - i * 0.3, alpha: 0.2 - i * 0.03, passes: 1, color: '#efeade' }, 4);
      }
    }
    // the shore, and it is the only LINE in this drawing: broken, where
    // the black stops and the needle floor starts
    if (edge) {
      for (let i = 0; i < 11; i++) {
        const a0 = r() * Math.PI * 2;
        const arc: [number, number][] = [];
        for (let s = 0; s <= 5; s++) {
          const a = a0 + (s / 5) * (0.22 + r() * 0.26);
          arc.push([256 + Math.cos(a) * (196 + r() * 10), 256 + Math.sin(a) * (196 + r() * 10)]);
        }
        stroke(ctx, arc, r, { width: 1.7, alpha: 0.26, passes: 1 });
      }
    }
  });
}

/**
 * BRACK, in the two postures that are the whole of his wait.
 *
 * WATCHING: seen from behind, square on, shoulders level, hands down,
 * hat on. He is a back. That is the drawing, and it is doing the one
 * thing THE-WAITS §7 asks for — *he moves so that he never has his back
 * to it* — from the only side the camera will ever see him from.
 *
 * TURNED: a quarter round, three-quarter view, weight on one leg, the
 * stick he has always had now leaning rather than planted, looking down
 * the road. **It is the largest thing that has happened in the Penwood
 * in forty years and it is nine strokes' difference.**
 */
export function brackTexture(seed: number, turned: boolean): THREE.CanvasTexture {
  return makeTexture(112, 192, seed, (ctx, r) => {
    /* Round 1 drew the coat as one wide lozenge and both states came out
     * as the same gingerbread man in a hat. A coat HANGS: narrow at the
     * shoulder, wide at the hem, with the shoulder line square across
     * the top of it — and the difference between the two states has to
     * be a difference in SILHOUETTE, not in a seam, because at fifteen
     * units the seam is a pixel and the silhouette is the drawing. */
    const cx = 56;
    if (!turned) {
      // WATCHING: square on, seen from behind. Shoulders level, arms
      // straight down and still, hat brim flat across.
      line(ctx, cx - 22, 30, cx + 22, 29, r, { width: 2.2, alpha: 0.86 });
      poly(ctx, [[cx - 13, 29], [cx - 11, 12], [cx + 11, 12], [cx + 13, 29]], r,
        { width: 1.9, alpha: 0.84 });
      scribbleCircle(ctx, cx, 38, 11, r, { width: 1.9, alpha: 0.78 }, 1.05);
      // the shoulder line: one stroke, dead level, and it is the mark
      // that says BACK more than anything else in the drawing
      stroke(ctx, [[cx - 19, 54], [cx, 51], [cx + 19, 54]], r, { width: 2.4, alpha: 0.88 });
      const coat: [number, number][] = [[cx - 19, 54], [cx - 24, 96], [cx - 26, 130],
        [cx + 26, 130], [cx + 24, 96], [cx + 19, 54]];
      fillPoly(ctx, coat, BARK, 0.32);
      poly(ctx, coat, r, { width: 2.1, alpha: 0.86 });
      // the back seam and the vent at the bottom of it
      line(ctx, cx, 56, cx, 118, r, { width: 1.2, alpha: 0.36, passes: 1 }, 3);
      line(ctx, cx, 118, cx + 1, 130, r, { width: 1.6, alpha: 0.5, passes: 1 }, 2);
      hatch(ctx, cx - 26, 60, 16, 70, 0.05, 6, r, { alpha: 0.12 });
      // the arms are INSIDE the silhouette from behind: two creases
      line(ctx, cx - 16, 60, cx - 19, 104, r, { width: 1.3, alpha: 0.4, passes: 1 }, 3);
      line(ctx, cx + 16, 60, cx + 19, 104, r, { width: 1.3, alpha: 0.4, passes: 1 }, 3);
      // and the stick, planted, on the side away from the water
      line(ctx, cx + 30, 66, cx + 33, 184, r, { width: 2.3, alpha: 0.76 });
      line(ctx, cx - 10, 130, cx - 11, 182, r, { width: 2.3, alpha: 0.85 });
      line(ctx, cx + 10, 130, cx + 11, 182, r, { width: 2.3, alpha: 0.85 });
      line(ctx, cx - 18, 184, cx - 5, 184, r, { width: 2.6, alpha: 0.82, passes: 1 }, 2);
      line(ctx, cx + 5, 184, cx + 18, 184, r, { width: 2.6, alpha: 0.82, passes: 1 }, 2);
    } else {
      /* TURNED: a quarter round. The silhouette is NARROWER, the hat's
       * brim is now an ellipse rather than a bar, one shoulder is in
       * front of the other, and the stick is taking his weight instead
       * of standing beside him. **It is nine strokes' difference and it
       * is the largest thing that has happened in the Penwood in forty
       * years.** */
      stroke(ctx, [[cx - 16, 31], [cx - 4, 27], [cx + 14, 29], [cx + 4, 34], [cx - 16, 31]], r,
        { width: 2.0, alpha: 0.84 });
      poly(ctx, [[cx - 9, 29], [cx - 7, 12], [cx + 9, 13], [cx + 10, 30]], r,
        { width: 1.8, alpha: 0.82 });
      scribbleCircle(ctx, cx - 1, 38, 10.5, r, { width: 1.9, alpha: 0.78 }, 1.05);
      // one shoulder forward: the line is no longer level
      stroke(ctx, [[cx - 13, 57], [cx + 2, 51], [cx + 14, 55]], r, { width: 2.4, alpha: 0.88 });
      const coat: [number, number][] = [[cx - 13, 57], [cx - 16, 96], [cx - 17, 130],
        [cx + 18, 130], [cx + 17, 96], [cx + 14, 55]];
      fillPoly(ctx, coat, BARK, 0.32);
      poly(ctx, coat, r, { width: 2.1, alpha: 0.86 });
      // the coat's FRONT EDGE, which is the mark that says not-the-back
      stroke(ctx, [[cx + 5, 55], [cx + 2, 92], [cx + 5, 128]], r,
        { width: 1.7, alpha: 0.6, passes: 1 });
      hatch(ctx, cx - 17, 60, 13, 70, 0.05, 6, r, { alpha: 0.12 });
      // the near arm comes forward onto the stick
      stroke(ctx, [[cx + 12, 60], [cx + 20, 84], [cx + 16, 100]], r, { width: 1.9, alpha: 0.82 });
      line(ctx, cx + 16, 100, cx + 34, 184, r, { width: 2.3, alpha: 0.78 });
      line(ctx, cx - 7, 130, cx - 10, 182, r, { width: 2.3, alpha: 0.85 });
      line(ctx, cx + 9, 130, cx + 13, 182, r, { width: 2.3, alpha: 0.85 });
      line(ctx, cx - 16, 184, cx - 4, 184, r, { width: 2.6, alpha: 0.82, passes: 1 }, 2);
      line(ctx, cx + 8, 184, cx + 20, 184, r, { width: 2.6, alpha: 0.82, passes: 1 }, 2);
    }
  });
}

/**
 * HALLOWS, mid-cut (THE-STRANGERS S1 beat 1). Back to the road, because
 * a man working does not look up, and because the drawing that faces
 * the camera in this land is Brack's and there should only be one.
 */
export function hallowsTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(112, 176, seed, (ctx, r) => {
    scribbleCircle(ctx, 54, 40, 12, r, { width: 1.9, alpha: 0.82 }, 1.05);
    // bent at the waist over the block: the whole posture in two curves
    stroke(ctx, [[42, 54], [34, 92], [40, 128]], r, { width: 2.2, alpha: 0.86 });
    stroke(ctx, [[66, 52], [72, 90], [62, 128]], r, { width: 2.2, alpha: 0.86 });
    fillPoly(ctx, [[42, 56], [36, 122], [66, 122], [66, 54]], BARK, 0.26);
    // both arms forward and down — the axe is at the bottom of a stroke
    stroke(ctx, [[46, 62], [64, 92], [80, 118]], r, { width: 2, alpha: 0.84 });
    stroke(ctx, [[62, 60], [76, 90], [84, 116]], r, { width: 1.9, alpha: 0.8 });
    // the haft, and the head buried in something out of frame
    line(ctx, 82, 118, 104, 150, r, { width: 2.6, alpha: 0.85 });
    poly(ctx, [[100, 146], [110, 142], [112, 156], [102, 158]], r, { width: 1.8, alpha: 0.85 });
    line(ctx, 40, 128, 34, 170, r, { width: 2.2, alpha: 0.84 });
    line(ctx, 62, 128, 66, 170, r, { width: 2.2, alpha: 0.84 });
  });
}

/**
 * THE OARS, leaning on a trunk. Every blade a different wrong shape:
 * one is a paddle, one is a spade, one is a plank with a handle, and
 * one of them is very nearly right, which is worse.
 *
 * There is no number written anywhere on this drawing and the POI's
 * prompt says COUNT THEM, and the game will never tell you.
 */
export function oarLeanTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(224, 256, seed, (ctx, r) => {
    /* the blade shapes, authored rather than random: the joke only
     * works if they are each specifically, individually wrong */
    const blades: [number, number][][] = [
      [[-9, 0], [-11, 34], [0, 44], [11, 34], [9, 0]],          // a paddle
      [[-13, 0], [-13, 40], [13, 40], [13, 0]],                  // a spade
      [[-7, 0], [-16, 26], [-9, 46], [9, 46], [16, 26], [7, 0]], // a leaf, far too wide
      [[-5, 0], [-6, 48], [6, 48], [5, 0]],                      // a plank
      [[-8, 0], [-12, 22], [-6, 44], [6, 44], [12, 22], [8, 0]], // nearly right
      [[-10, 0], [-4, 30], [-10, 46], [10, 46], [4, 30], [10, 0]], // a fishtail
      [[-6, 0], [-18, 30], [0, 40], [18, 30], [6, 0]],           // a shovel
      [[-11, 0], [-9, 20], [-14, 42], [14, 42], [9, 20], [11, 0]],
      [[-4, 0], [-14, 36], [14, 36], [4, 0]],
      [[-12, 0], [-12, 18], [0, 50], [12, 18], [12, 0]],         // a spearhead
      [[-8, 0], [-8, 38], [8, 44], [8, 0]],                      // a boot
    ];
    blades.forEach((blade, i) => {
      const t = i / (blades.length - 1);
      const bx = 26 + t * 172 + (r() - 0.5) * 8;
      const lean = -0.30 + t * 0.60 + (r() - 0.5) * 0.16;
      const len = 176 + r() * 40;
      const topX = bx + Math.sin(lean) * len;
      const topY = 244 - Math.cos(lean) * len;
      // the loom, and it is heavy: round 1 drew a thin stem under a wide
      // bowl and eleven of them read as a row of tulips
      line(ctx, bx, 246, topX, topY, r, { width: 3.8, alpha: 0.86 });
      // the blade, at the TOP, because they are stood on their handles
      // blades are drawn at three-quarters width and full length: an
      // oar's blade is long and narrow, and the joke is that none of
      // these ones is
      const pts = blade.map(([px, py]) => [
        topX + px * 0.72 * Math.cos(lean) + py * 1.15 * Math.sin(lean) * 0.9,
        topY + py * 1.15 * Math.cos(lean) - px * 0.72 * Math.sin(lean) * 0.9,
      ] as [number, number]);
      fillPoly(ctx, pts, BARK, 0.2);
      poly(ctx, pts, r, { width: 1.9, alpha: 0.78 });
      // one grain line down each, because he finishes them properly
      line(ctx, topX, topY + 6, topX + Math.sin(lean) * -20, topY + 34, r,
        { width: 0.9, alpha: 0.28, passes: 1 }, 3);
    });
  });
}

/** The block, with the axe in it, because he has gone to look at a tree. */
export function choppingBlockTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(128, 112, seed, (ctx, r) => {
    fillPoly(ctx, [[22, 106], [26, 54], [102, 52], [106, 106]], BARK, 0.3);
    poly(ctx, [[22, 106], [26, 54], [102, 52], [106, 106]], r, { width: 2.4, alpha: 0.86 });
    // the end grain: rings, and the split that runs across all of them
    scribbleCircle(ctx, 64, 52, 34, r, { width: 2, alpha: 0.8 }, 1.1);
    scribbleCircle(ctx, 62, 52, 21, r, { width: 1.2, alpha: 0.45 }, 1.4);
    scribbleCircle(ctx, 63, 52, 10, r, { width: 1.1, alpha: 0.4 }, 1.6);
    line(ctx, 34, 46, 92, 58, r, { width: 1.6, alpha: 0.5, passes: 1 });
    hatch(ctx, 24, 58, 26, 46, 0.1, 5, r, { alpha: 0.15 });
    // the axe, standing in it
    line(ctx, 76, 44, 92, 6, r, { width: 2.8, alpha: 0.85 });
    poly(ctx, [[70, 46], [78, 26], [90, 30], [84, 50]], r, { width: 2, alpha: 0.85 });
  });
}

/** A cut stump. Only ever placed OUTSIDE the forty units, which is the
 *  whole of what it says. */
export function stumpTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(128, 80, seed, (ctx, r) => {
    const h = 26 + r() * 20;
    fillPoly(ctx, [[36, 76], [34, 76 - h], [92, 76 - h], [90, 76]], BARK, 0.26);
    poly(ctx, [[36, 76], [34, 76 - h], [92, 76 - h], [90, 76]], r, { width: 2.2, alpha: 0.82 });
    scribbleCircle(ctx, 63, 76 - h, 28, r, { width: 1.8, alpha: 0.75 }, 1.1);
    scribbleCircle(ctx, 62, 76 - h, 15, r, { width: 1.1, alpha: 0.4 }, 1.5);
    hatch(ctx, 36, 78 - h, 20, h, 0.1, 5, r, { alpha: 0.16 });
    for (let i = 0; i < 4; i++) {
      const a = r() * Math.PI;
      stroke(ctx, [[63, 74], [63 + Math.cos(a) * 26, 76], [63 + Math.cos(a) * 40, 78]], r,
        { width: 1.8, alpha: 0.5, passes: 1 });
    }
  });
}

/** The failing edge's other tree, and the one place in the Penwood where
 *  a stroke lies down. */
export function birchTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(160, 288, seed, (ctx, r) => {
    const lean = (r() - 0.5) * 26;
    const l = (y: number) => 80 + lean * (1 - y / 288);
    fillPoly(ctx, [[l(288) - 9, 288], [l(0) - 5, 40], [l(0) + 5, 40], [l(288) + 9, 288]], BIRCH, 0.5);
    stroke(ctx, [[l(288) - 9, 288], [l(150) - 7, 150], [l(40) - 5, 40]], r, { width: 2.2, alpha: 0.78 });
    stroke(ctx, [[l(288) + 9, 288], [l(150) + 7, 150], [l(40) + 5, 40]], r, { width: 2.0, alpha: 0.74 });
    // THE BARK: horizontals, and they are the only ones in this land
    for (let i = 0; i < 22; i++) {
      const y = 46 + r() * 236;
      const w = 4 + r() * 12;
      const x = l(y) + (r() - 0.5) * 10;
      line(ctx, x - w, y, x + w, y + (r() - 0.5) * 2, r,
        { width: 1.4 + r(), alpha: 0.35 + r() * 0.3, passes: 1 }, 2);
    }
    // a thin, high, sparse crown — birch is the tree light gets through
    for (let i = 0; i < 16; i++) {
      const a = -0.4 - r() * 2.3;
      const y0 = 40 + r() * 40;
      stroke(ctx, [[l(y0), y0], [l(y0) + Math.cos(a) * 34, y0 + Math.sin(a) * 26],
        [l(y0) + Math.cos(a) * 58, y0 + Math.sin(a) * 34 + 12]], r,
        { width: 1.1, alpha: 0.4, passes: 1 });
    }
    fillBlob(ctx, l(30) + (r() - 0.5) * 16, 34, 46, r, WASH.forest, 0.2, 0.7);
  });
}

/** On the fallen trunks, and nowhere else. */
export function bracketFungusTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(96, 64, seed, (ctx, r) => {
    for (let i = 0; i < 3; i++) {
      const x = 22 + i * 24 + (r() - 0.5) * 8;
      const y = 40 + (r() - 0.5) * 14;
      const w = 11 + r() * 9;
      const pts: [number, number][] = [[x - w, y], [x - w * 0.7, y - 9], [x, y - 12],
        [x + w * 0.7, y - 8], [x + w, y]];
      fillPoly(ctx, pts, CREAMY, 0.55);
      stroke(ctx, pts, r, { width: 1.5, alpha: 0.72 });
      line(ctx, x - w * 0.6, y - 4, x + w * 0.6, y - 3, r, { width: 0.9, alpha: 0.4, passes: 1 }, 2);
    }
  });
}

/**
 * THE ROUND'S WEAR, and it is asymmetric on purpose
 * (THE-STRANGERS U18): the inner edge — the tarn side — is trodden
 * deeper than the outer one, because a man walking a circle for forty
 * years walks the side he is watching. The drawing is laid with its
 * heavy edge inward and nothing anywhere explains why.
 */
export function wornRoundDecal(seed: number): THREE.CanvasTexture {
  return makeTexture(256, 160, seed, (ctx, r) => {
    // the stain, weighted to the top of the quad, which is the inside
    for (let i = 0; i < 5; i++) {
      const bx = 40 + r() * 176;
      const by = 40 + r() * 54;
      const rad = 40 + r() * 34;
      const g = ctx.createRadialGradient(bx, by, 2, bx, by, rad);
      g.addColorStop(0, 'rgba(150,132,104,0.30)');
      g.addColorStop(0.7, 'rgba(150,132,104,0.13)');
      g.addColorStop(1, 'rgba(150,132,104,0)');
      ctx.fillStyle = g;
      ctx.fillRect(bx - rad, by - rad, rad * 2, rad * 2);
    }
    // the trodden line itself, high in the quad
    for (let i = 0; i < 3; i++) {
      const y = 44 + i * 13 + (r() - 0.5) * 8;
      stroke(ctx, [[6, y + (r() - 0.5) * 6], [80, y + (r() - 0.5) * 8],
        [170, y + (r() - 0.5) * 8], [250, y + (r() - 0.5) * 6]], r,
        { width: 2.4 - i * 0.5, alpha: 0.2 - i * 0.04, passes: 1, jitter: 2 });
    }
    // stipple: heavy inside, giving out toward the bottom edge
    ctx.fillStyle = INK;
    for (let i = 0; i < 90; i++) {
      const y = 20 + Math.pow(r(), 0.5) * 120;
      ctx.globalAlpha = 0.16 * (1 - (y - 20) / 130) + 0.03;
      ctx.beginPath();
      ctx.arc(8 + r() * 240, y, 0.7 + r() * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    // and the root that everybody has stepped over for forty years
    if (seed % 3 === 0) {
      stroke(ctx, [[60, 30], [110, 52], [150, 48], [200, 66]], r,
        { width: 2.6, alpha: 0.4, passes: 1 });
    }
  });
}

/**
 * THE TARN'S BOAT. Session 1 drew it and it stays; what it gains is the
 * one detail THE-STRANGERS U19 asks for — **it has one oar, and the oar
 * is newer than the boat.** The hull is drawn at heavy, tired, broken
 * pressure; the oar at light clean pressure with no wear marks on it at
 * all. Nothing anywhere will ever mention that.
 */
export function tarnBoatTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(256, 128, seed, (ctx, r) => {
    // the hull: a long sheer, cut off flat at its own waterline
    const hull: [number, number][] = [
      [16, 84], [40, 96], [110, 102], [186, 98], [226, 84],
    ];
    fillPoly(ctx, [...hull, [226, 112], [16, 112]], BARK, 0.26);
    stroke(ctx, hull, r, { width: 3.2, alpha: 0.86 });
    stroke(ctx, [[16, 84], [70, 78], [150, 76], [226, 84]], r, { width: 2.8, alpha: 0.82 });
    // planking, and the one plank that has been replaced badly
    for (let i = 0; i < 3; i++) {
      stroke(ctx, [[26, 88 + i * 5], [110, 96 + i * 5], [216, 88 + i * 5]], r,
        { width: 1, alpha: 0.28 - i * 0.05, passes: 1 });
    }
    // three thwarts, one of them broken through
    for (const [x, brk] of [[70, false], [124, true], [178, false]] as [number, boolean][]) {
      if (brk) {
        line(ctx, x - 22, 80, x - 6, 82, r, { width: 2.2, alpha: 0.7 }, 3);
        line(ctx, x + 8, 83, x + 22, 80, r, { width: 2.2, alpha: 0.7 }, 3);
      } else {
        line(ctx, x - 22, 80, x + 22, 80, r, { width: 2.2, alpha: 0.75 }, 4);
      }
    }
    hatch(ctx, 30, 86, 190, 18, 0.06, 6, r, { alpha: 0.14 });
    // and the wear: the hull is drawn broken, in short pieces
    for (let i = 0; i < 8; i++) {
      const x = 30 + r() * 180;
      line(ctx, x, 100 + r() * 6, x + 8 + r() * 14, 100 + r() * 6, r,
        { width: 1.2, alpha: 0.3, passes: 1 }, 2);
    }
    /* THE OAR. One, shipped across the thwarts, drawn CLEAN: two passes
     * at low jitter, no broken pressure, no wear line, one grain mark.
     * It is the newest thing in this land and nobody made it here. */
    line(ctx, 44, 74, 208, 66, r, { width: 3.0, alpha: 0.72, jitter: 0.7 });
    const bp: [number, number][] = [[204, 60], [224, 58], [236, 66], [228, 76], [206, 72]];
    fillPoly(ctx, bp, CREAMY, 0.5);
    poly(ctx, bp, r, { width: 1.8, alpha: 0.72, jitter: 0.7 });
    line(ctx, 210, 66, 232, 66, r, { width: 0.9, alpha: 0.3, passes: 1 }, 2);
  });
}

/** The goat, in four postures, and it never lets you near it. */
export function goatTexture(seed: number, pose: 0 | 1 | 2 | 3): THREE.CanvasTexture {
  // 0 grazing · 1 walking off · 2 stopped and looking back · 3 standing
  return makeTexture(128, 96, seed, (ctx, r) => {
    const headDown = pose === 0;
    const back = pose === 2;
    /* Round 1 drew the body as a line over the back and a line under
     * the belly, and it came out as a table with horns. A goat is a
     * BARREL on four thin legs, deeper at the chest than at the hip,
     * with the back dipping in the middle — so the body is one filled
     * shape and the legs hang off the bottom of it. */
    const body: [number, number][] = [
      [34, 46], [44, 36], [64, 34], [82, 37], [90, 44],
      [88, 60], [70, 64], [48, 62], [36, 56],
    ];
    fillPoly(ctx, body, CREAMY, 0.62);
    poly(ctx, body, r, { width: 2.2, alpha: 0.84, jitter: 1.8 });
    // the fleece, one continuous scribble INSIDE the barrel
    for (let i = 0; i < 16; i++) {
      const x = 38 + r() * 48;
      const y = 38 + r() * 22;
      line(ctx, x, y, x + (r() - 0.5) * 8, y + 4 + r() * 5, r,
        { width: 1, alpha: 0.2 + r() * 0.2, passes: 1 }, 2);
    }
    // the neck and head
    const hx = headDown ? 100 : back ? 80 : 102;
    const hy = headDown ? 76 : 22;
    stroke(ctx, [[86, 40], [94, hy + (headDown ? -12 : 14)], [hx, hy]], r,
      { width: 3, alpha: 0.85 });
    const face: [number, number][] = back
      ? [[hx + 8, hy - 6], [hx - 8, hy - 4], [hx - 12, hy + 6], [hx + 6, hy + 7]]
      : [[hx - 8, hy - 7], [hx + 9, hy - 5], [hx + 13, hy + 6], [hx - 6, hy + 8]];
    fillPoly(ctx, face, CREAMY, 0.6);
    poly(ctx, face, r, { width: 1.8, alpha: 0.84 });
    // the horns, swept back, and they are the whole silhouette
    const s = back ? -1 : 1;
    stroke(ctx, [[hx - s * 2, hy - 8], [hx - s * 14, hy - 18], [hx - s * 28, hy - 16]], r,
      { width: 1.9, alpha: 0.8, passes: 1 });
    stroke(ctx, [[hx - s * 6, hy - 7], [hx - s * 17, hy - 20], [hx - s * 30, hy - 20]], r,
      { width: 1.6, alpha: 0.7, passes: 1 });
    // the beard, which is one stroke and is the joke
    line(ctx, hx + s * 4, hy + 8, hx + s * 6, hy + 21, r,
      { width: 1.6, alpha: 0.74, passes: 1 }, 2);
    // legs: thin, and in pose 1 they are not together
    const stride = pose === 1 ? 8 : 2;
    line(ctx, 44, 58, 40 - stride, 90, r, { width: 1.9, alpha: 0.84 });
    line(ctx, 52, 61, 56 + stride, 90, r, { width: 1.6, alpha: 0.72 });
    line(ctx, 78, 60, 74 + stride, 90, r, { width: 1.9, alpha: 0.84 });
    line(ctx, 84, 57, 86 - stride * 0.4, 90, r, { width: 1.6, alpha: 0.72 });
    // and the tail, which on a goat goes UP
    line(ctx, 34, 44, 26, 34, r, { width: 1.7, alpha: 0.75, passes: 1 }, 2);
  });
}

/**
 * THE SHAPE IN THE DEEP PINES (Session 19, `THE-FUN-PASS` §10 THE
 * MONSTERS). Drawn once, at the edge of the frame, at night, and not
 * there when you look. It is a stain the height of two men and the
 * width of a trunk, with a lean the pines around it do not have, and
 * a ragged edge where a trunk's is straight. No face. No head. It is
 * drawn by the same law as everything else — a cutout on the page —
 * and it is the only cutout in the wood that is not a tree.
 */
export function pineShapeTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(64, 256, seed, (ctx, r) => {
    const pts: [number, number][] = [];
    const n = 26;
    for (let i = 0; i <= n; i++) {
      const u = i / n;
      const y = 250 - u * 236;
      const lean = u * 14;
      const w = 7 + Math.sin(u * Math.PI) * 9 + (r() - 0.5) * 6;
      pts.push([30 + lean - w, y]);
    }
    for (let i = n; i >= 0; i--) {
      const u = i / n;
      const y = 250 - u * 236;
      const lean = u * 14;
      const w = 7 + Math.sin(u * Math.PI) * 9 + (r() - 0.5) * 6;
      pts.push([30 + lean + w, y]);
    }
    fillPoly(ctx, pts, INK, 0.72);
    stroke(ctx, [...pts, pts[0]], r, { width: 1.4, alpha: 0.5, jitter: 2.2 });
    // the inside is darker again, in the middle, like a thing with a middle
    for (let i = 0; i < 14; i++) {
      const y = 40 + r() * 190;
      const lean = ((250 - y) / 236) * 14;
      line(ctx, 30 + lean - 4, y, 30 + lean + 4, y + (r() - 0.5) * 6, r, { width: 2.4, alpha: 0.35, passes: 1 });
    }
  });
}
