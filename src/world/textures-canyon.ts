import * as THREE from 'three';
import {
  makeTexture, stroke, line, scribbleCircle, hatch, type Ctx2D,
} from '../engine/ink';
import { INK, PENCIL } from '../engine/palette';

/**
 * SPLITROCK CANYON's prop box (design/specs/splitrock-canyon.md).
 *
 * ── THE LAND'S INK TECHNIQUE, AND IT IS ONE SENTENCE ────────────────
 *
 * **Everything in SPLITROCK is drawn in strokes DOWN the page.**
 *
 * The terrain shader already hatches a cliff down its fall line, and a
 * torn edge of paper has no strata in it — it has fibres, and they run
 * the way the tear ran. So every drawing in this file is fluting: long
 * vertical runs, close together, heavier at the bottom of the mark than
 * at the top, with the corners between faces left as the only breaks.
 * No horizontals anywhere. Not on the walls, not on the stacks, not on
 * the fallen blocks, not on the shed.
 *
 * **WITH FIVE EXCEPTIONS, AND THEY ARE THE POINT OF THE LAND.**
 *
 * `THE-WAITS` §4: the marks up the wall are not flood records, they are
 * a list, in the order things would float — the boat, the trestles, the
 * shed, the doorstep, the house. Five horizontal chalk strokes, and they
 * are the only marks in a hundred and fifty units of canyon that go
 * ACROSS anything. Nothing labels them and nothing has to: in a land
 * drawn entirely in verticals, a horizontal reads as writing.
 *
 * THE BLEACH FLATS next door are drawn in the other direction for the
 * same reason (`textures-flats.ts`). The pair is a hole in the page
 * against the flattest ground in the world, and they are drawn at right
 * angles to each other.
 *
 * ── AND THE REGISTER ────────────────────────────────────────────────
 *
 * THE-WAITS §4: *short sentences. People out here do not use two words.*
 * That governs the notes in `regions/wilds.ts` and it governs the
 * drawings here too — nothing in this file is decorated. A thing is its
 * silhouette, its fluting and its shadow, and then the pen stops.
 */

/* Pigments. Line and body colours mixed for this land; every wash still
 * comes out of palette.ts. */
const ROCK = '#b18a64';
const ROCK_DEEP = '#8a6a4c';
const DRYBED = '#cbb694';
const TIMBER = '#6a5a45';
const HULL = '#7d6547';
const CHALK = '#f6f3ea';
const CLOTH = '#c9c0ac';

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
 * A POLYGON WITH CORNERS ON IT, and it is why this file has its own.
 *
 * `stroke` draws quadratics through the midpoints of its points, which
 * rounds every corner it is given — correct for a hedge, a tree and a
 * hull, and fatal here. Round 1 of the texture gate came back with a
 * canyon full of DOMES: every stack, every fallen block, the shed, the
 * house and the mark slab were lozenges, because a polygon of straight
 * runs handed to `stroke` comes out as a lens.
 *
 * **Paper does not tear along a curve** (`elevation.ts`, `HOLD_PLAN`),
 * and that is a rule about the drawing as much as about the height
 * field. So an edge is drawn as an EDGE — `line` per segment, which
 * keeps its two endpoints exactly and bows once in between, the way a
 * hand does — and the corners between them stay corners.
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

/**
 * A GROUND STAIN WITH NO EDGE ON IT.
 *
 * Session 10's rule, carried forward verbatim because it cost that
 * session two rounds: `fillBlob` is a sixteen-sided polygon and on a
 * decal that TILES you can count all sixteen sides from a hundred
 * units. A stain on paper has no boundary — it fades. Every ground
 * colour in this file goes through here.
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

/**
 * ERASE THE ENDS OF A CUTOUT (Session 10).
 *
 * A rock face is a rectangle and a run of them is a row of cards until
 * the last forty pixels of each end are taken back out with
 * `destination-out`. Every wide drawing in this file ends this way.
 */
function feather(ctx: Ctx2D, w: number, h: number, px: number) {
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  for (const [x0, x1] of [[0, px], [w, w - px]] as const) {
    const g = ctx.createLinearGradient(x0, 0, x1, 0);
    g.addColorStop(0, 'rgba(0,0,0,1)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(Math.min(x0, x1), 0, px, h);
  }
  ctx.restore();
}

/**
 * THE FLUTING — the one mark this land is made of.
 *
 * Long runs down the face, close together, and the LINE WEIGHT RISES AS
 * IT FALLS: a quarter of a pixel at the top of the stroke and nearly two
 * at the bottom, because that is what a hand does drawing down a cliff
 * and because it puts the land's ink where the land's shadow is. The
 * runs never reach the top of the face and never reach the bottom of
 * it — a flute is worn INTO a wall, it is not a fence.
 */
function flute(
  ctx: Ctx2D, r: () => number, x: number, yTop: number, yBot: number,
  o: { alpha?: number; width?: number; color?: string } = {}
) {
  const n = 5;
  const pts: [number, number][] = [];
  const bow = (r() - 0.5) * 7;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    pts.push([x + Math.sin(t * Math.PI) * bow + (r() - 0.5) * 2.4, yTop + (yBot - yTop) * t]);
  }
  stroke(ctx, pts, r, {
    width: o.width ?? 1.5, alpha: o.alpha ?? 0.36, passes: 1,
    color: o.color ?? INK,
  });
}

/** A whole face fluted, top to bottom, with the gaps authored. */
function fluteFace(
  ctx: Ctx2D, r: () => number, x0: number, x1: number, yTop: (x: number) => number,
  yBot: number, gap: number, alpha: number
) {
  for (let x = x0 + r() * gap; x < x1; x += gap * (0.55 + r() * 0.9)) {
    const t = yTop(x);
    const drop = yBot - t;
    if (drop < 12) continue;
    flute(ctx, r, x, t + drop * (0.06 + r() * 0.22), yBot - drop * (0.02 + r() * 0.2),
      { alpha: alpha * (0.6 + r() * 0.7), width: 1.1 + r() * 1.1 });
  }
}

/* ================================================================== *
 * THE WALLS AND WHAT FELL OFF THEM.
 * ================================================================== */

/**
 * A STACK — one straight run of torn edge standing on its own.
 *
 * `HOLD_PLAN` taught this project that paper does not tear along a
 * curve, and the same rule governs the drawing: a stack is a POLYGON of
 * two or three planar faces with hard corners between them, never a
 * lump. Three variants, and the variety comes from the plan rather than
 * from a fresh canvas per placement.
 */
export function stackTexture(seed: number, variant: 0 | 1 | 2): THREE.CanvasTexture {
  const W = 256;
  const H = 384;
  return makeTexture(W, H, seed, (ctx, r) => {
    // three plans: a leaning slab, a squat block with a shoulder, and a
    // needle. Every edge straight; every corner a corner.
    const PLANS: [number, number][][] = [
      [[54, 372], [46, 214], [70, 96], [104, 40], [150, 62], [162, 168], [178, 288], [186, 372]],
      [[30, 372], [36, 236], [72, 178], [118, 158], [176, 176], [214, 232], [222, 372]],
      [[92, 372], [88, 250], [96, 140], [112, 52], [130, 24], [146, 88], [152, 210], [166, 372]],
    ];
    const plan = PLANS[variant];
    fillPoly(ctx, plan, ROCK, 0.46);
    // the shadowed half: one face of the polygon is away from the light,
    // and it is FLUTED darker rather than shaded
    const midX = plan.reduce((s, p) => s + p[0], 0) / plan.length;
    hardPoly(ctx, plan, r, { width: 2.8, alpha: 0.88, jitter: 2.2 });
    // the top edge of the plan, so the fluting knows where to start
    const topAt = (x: number) => {
      let best = H;
      for (let i = 0; i < plan.length - 1; i++) {
        const [ax, ay] = plan[i];
        const [bx, by] = plan[i + 1];
        if ((x - ax) * (x - bx) > 0) continue;
        const t = (x - ax) / (bx - ax || 1e-6);
        const y = ay + (by - ay) * t;
        if (y < best) best = y;
      }
      return best === H ? H - 8 : best;
    };
    fluteFace(ctx, r, plan[0][0] + 4, plan[plan.length - 1][0] - 4, topAt, H - 10, 11, 0.34);
    // the dark side: heavier flutes only, never a wash and never a hatch
    // across the grain
    for (let k = 0; k < 9; k++) {
      const x = midX + 6 + r() * (plan[plan.length - 1][0] - midX - 10);
      flute(ctx, r, x, topAt(x) + 26 + r() * 40, H - 14 - r() * 30,
        { alpha: 0.30 + r() * 0.2, width: 2.0 + r() * 1.2 });
    }
    feather(ctx, W, H, 26);
  });
}

/**
 * A CANYON WALL PANEL — the run of face a corridor is actually made of.
 *
 * Wide and low, drawn to be laid end to end along a wall with its ends
 * feathered so a run of them is a wall and not a row of cards. Three
 * variants; the height rides in the instance scale.
 */
export function wallPanelTexture(seed: number, variant: 0 | 1 | 2): THREE.CanvasTexture {
  const W = 512;
  const H = 256;
  return makeTexture(W, H, seed, (ctx, r) => {
    const top: [number, number][] = [];
    // a torn top: straight runs with corners, never a sine
    let x = 0;
    let y = 40 + variant * 14;
    while (x < W) {
      top.push([x, y]);
      x += 48 + r() * 76;
      y += (r() - 0.5) * 46;
      y = Math.max(16, Math.min(112, y));
    }
    top.push([W, y]);
    fillPoly(ctx, [...top, [W, H], [0, H]], ROCK, 0.4);
    hardPoly(ctx, top, r, { width: 3.0, alpha: 0.85, jitter: 2.6 }, false);
    const topAt = (px: number) => {
      for (let i = 0; i < top.length - 1; i++) {
        if (px >= top[i][0] && px <= top[i + 1][0]) {
          const t = (px - top[i][0]) / (top[i + 1][0] - top[i][0] || 1e-6);
          return top[i][1] + (top[i + 1][1] - top[i][1]) * t;
        }
      }
      return top[0][1];
    };
    fluteFace(ctx, r, 6, W - 6, topAt, H - 4, 9 + variant * 2, 0.30);
    // the foot: where the face meets its own scree, the ink pools
    for (let px = 8; px < W; px += 14 + r() * 22) {
      flute(ctx, r, px, H - 40 - r() * 46, H - 2, { alpha: 0.42, width: 2.4 + r() * 1.4 });
    }
    feather(ctx, W, H, 46);
  });
}

/**
 * A FALLEN BLOCK. Angular, because it came off a wall that tears in
 * straight runs, and fluted on the face that used to be the wall.
 */
export function blockTexture(seed: number, variant: 0 | 1 | 2): THREE.CanvasTexture {
  const W = 192;
  const H = 128;
  return makeTexture(W, H, seed, (ctx, r) => {
    const PLANS: [number, number][][] = [
      [[16, 122], [22, 62], [66, 30], [126, 26], [172, 58], [176, 122]],
      [[24, 122], [30, 76], [88, 44], [148, 66], [166, 122]],
      [[30, 122], [40, 50], [96, 22], [138, 48], [158, 90], [154, 122]],
    ];
    const plan = PLANS[variant];
    fillPoly(ctx, plan, ROCK, 0.44);
    hardPoly(ctx, plan, r, { width: 2.4, alpha: 0.88, jitter: 1.8 });
    for (let k = 0; k < 7; k++) {
      const x = plan[1][0] + 6 + r() * (plan[plan.length - 1][0] - plan[1][0] - 12);
      flute(ctx, r, x, 40 + r() * 24, H - 8 - r() * 12, { alpha: 0.3, width: 1.4 });
    }
    feather(ctx, W, H, 14);
  });
}

/**
 * THE NEEDLE ARCH — kept from Session 1's draft, re-drawn and re-sited.
 *
 * It is the ONE curve in this land, and it is allowed to be because it
 * is the one thing here that water made rather than tore. It spans the
 * channel at the halfway point, so a walker coming up from the mouth has
 * something to walk toward and then under, and so the head of the canyon
 * is framed by it from a long way off.
 */
export function needleArchTexture(seed: number): THREE.CanvasTexture {
  const W = 512;
  const H = 320;
  return makeTexture(W, H, seed, (ctx, r) => {
    /* A SPAN, not a horseshoe. Round 1 of the texture gate drew this as
     * a doughnut with the middle taken out of it, which is a croquet
     * hoop and not a rock: the mass has to be UP, thin over the opening
     * and thick at the two feet, and the opening has to be a tall thin
     * gap rather than a circle. */
    const outer: [number, number][] = [
      [26, 312], [34, 214], [56, 126], [98, 66], [148, 44], [196, 58],
      [246, 34], [304, 52], [352, 40], [402, 90], [438, 148], [452, 218],
      [460, 312],
    ];
    fillPoly(ctx, outer, ROCK, 0.5);
    hardPoly(ctx, outer, r, { width: 3.4, alpha: 0.92, jitter: 3.0 });
    // the opening, taken out rather than drawn round: a tall gap with
    // straight sides and a pointed head, which is what wind cuts
    const gap: [number, number][] = [
      [126, 312], [132, 214], [156, 148], [206, 108], [256, 100],
      [306, 118], [340, 168], [352, 232], [356, 312],
    ];
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.moveTo(gap[0][0], gap[0][1]);
    for (const [x, y] of gap.slice(1)) ctx.lineTo(x, y);
    ctx.lineTo(356, 320);
    ctx.lineTo(126, 320);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    hardPoly(ctx, gap, r, { width: 2.6, alpha: 0.82, jitter: 2 }, false);
    // the legs are fluted; the span is not, because the span is the one
    // surface in the canyon that water polished
    fluteFace(ctx, r, 34, 122, () => 130, 306, 11, 0.34);
    fluteFace(ctx, r, 360, 452, () => 130, 306, 11, 0.34);
    /* AND THE SPAN, which round 2 left as a flat translucent pane
     * because only the legs were fluted. The crown of an arch is still
     * rock: short runs hanging down off the torn top edge, stopping
     * well clear of the opening so the underside stays clean. */
    for (let x = 120; x < 366; x += 9 + r() * 7) {
      const top = 20 + Math.abs(x - 250) * 0.11 + (r() - 0.5) * 14;
      const bot = 96 - Math.abs(x - 250) * 0.06 - r() * 22;
      if (bot - top < 14) continue;
      flute(ctx, r, x, top + 6, bot, { alpha: 0.2 + r() * 0.16, width: 1.1 + r() * 0.9 });
    }
    feather(ctx, W, H, 20);
  });
}

/**
 * THE DRY BED — the ground stain on the channel floor.
 *
 * A riverbed with nothing in it: pale, sorted, and drawn in runs that
 * point the way the water went. It is the only drawing in this land
 * whose strokes are not vertical on the CANVAS — but they are vertical
 * in the WORLD, because a floor decal lies down, and the runs point
 * north up the channel. The rule holds.
 */
export function dryBedDecal(seed: number, variant: 0 | 1 | 2): THREE.CanvasTexture {
  return makeTexture(256, 256, seed, (ctx, r) => {
    stain(ctx, 128, 128, 128, DRYBED, 0.16);
    for (let k = 0; k < 26 + variant * 6; k++) {
      const x = 12 + r() * 232;
      const y = 14 + r() * 210;
      const len = 16 + r() * 40;
      stroke(ctx, [[x, y], [x + (r() - 0.5) * 5, y + len * 0.5], [x + (r() - 0.5) * 8, y + len]], r,
        { width: 0.9 + r() * 0.7, alpha: 0.16 + r() * 0.16, passes: 1, color: ROCK_DEEP });
    }
    /* the grit that sorted out of it. Round 1 drew these as little
     * circles and a bed came out covered in BUBBLES; a stone in a dry
     * bed is a chip with two flat sides and a shadow under it. */
    for (let k = 0; k < 34; k++) {
      const cx = 20 + r() * 216;
      const cy = 20 + r() * 216;
      if (r() < 0.35) continue;
      const w = 2.4 + r() * 5;
      hardPoly(ctx, [
        [cx - w, cy + 1], [cx - w * 0.6, cy - w * 0.7], [cx + w * 0.7, cy - w * 0.5],
        [cx + w, cy + 1.5],
      ], r, { width: 0.9, alpha: 0.22 + r() * 0.2, passes: 1, color: ROCK_DEEP });
    }
  });
}

/** Loose grit lying in a drift, and it MOVES (a field with a wave on
 *  it). Low, wide, and drawn as a run of short verticals. */
export function gritTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(160, 48, seed, (ctx, r) => {
    for (let k = 0; k < 26; k++) {
      const x = 8 + r() * 144;
      const h = 6 + r() * 22;
      line(ctx, x, 44, x + (r() - 0.5) * 3, 44 - h, r,
        { width: 0.8 + r() * 0.5, alpha: 0.18 + r() * 0.22, passes: 1, color: ROCK_DEEP }, 3);
    }
    feather(ctx, 160, 48, 22);
  });
}

/** Dead scrub, wedged where the water left it. The only living thing in
 *  the channel, and it is not living. */
export function deadScrubTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(128, 112, seed, (ctx, r) => {
    for (let k = 0; k < 11; k++) {
      const x = 30 + r() * 68;
      stroke(ctx, [
        [64, 108], [x, 78 - r() * 16], [x + (r() - 0.5) * 34, 34 + r() * 24],
      ], r, { width: 1.1, alpha: 0.42 + r() * 0.2, passes: 1 });
    }
    line(ctx, 58, 108, 68, 108, r, { width: 1.4, alpha: 0.4, passes: 1 });
  });
}

/* ================================================================== *
 * HOLT — THE-WAITS §4.
 * ================================================================== */

/**
 * THE MARK SLAB — the face at the head of the channel, and the only
 * horizontal marks in SPLITROCK CANYON.
 *
 * Four chalk strokes up it, and their heights are not decorative. The
 * canvas is sixteen world units tall standing on a floor at −10.6, so
 * one world unit is 24 pixels from the foot:
 *
 *   the boat       1.2 up   — the hull on its trestles, right there
 *   the trestles   2.3 up   — the thing under the boat
 *   the shed       4.8 up   — its ridge, forty units down the channel
 *   the doorstep  13.0 up   — WHICH IS THE HEIGHT OF THE LIP
 *
 * and the fifth, THE HOUSE, is not on this drawing at all: it is chalked
 * on the rock above the wall (`rimMarkTexture`), which is `THE-STRANGERS`
 * U20 — *one mark is above the lip, which means it is not a flood mark* —
 * built as geometry instead of written as a note.
 *
 * Nothing is written beside any of them. There is no scale, no date and
 * no number anywhere in this land.
 */
export function markSlabTexture(seed: number): THREE.CanvasTexture {
  const W = 512;
  const H = 384;
  // 384 px over fifteen world units = 25.6 px per unit, measured up from
  // the channel floor
  const up = (u: number) => H - 8 - u * 25.6;
  return makeTexture(W, H, seed, (ctx, r) => {
    /* Round 1 drew this ten units wide and sixteen tall on a canvas
     * twice as tall as it was wide, and what stood at the head of the
     * channel was a TOMBSTONE: a pointed brown lump in the middle of
     * the floor with three faint scratches on it. It is a WALL FACE. It
     * is twenty units wide and fifteen high, its top is flat and
     * feathered so it runs into the terrain's own hatching, and the
     * marks on it are the most legible thing in the land. */
    const face: [number, number][] = [
      [6, 380], [2, 240], [26, 128], [96, 48], [214, 20], [340, 26],
      [446, 74], [496, 190], [506, 380],
    ];
    fillPoly(ctx, face, ROCK, 0.5);
    /* ONLY THE TWO SIDES ARE OUTLINED, and the top is not drawn at all.
     * A face at the head of a channel is the END OF THE TERRAIN, not an
     * object standing in front of it: outline its top and it becomes a
     * haystack on the skyline, which is what round 2 of the gate showed.
     * The two flanks are inked; the crown is left to the fade below and
     * to the terrain's own hatching behind it. */
    hardPoly(ctx, [[6, 380], [2, 240], [26, 128], [96, 48]], r,
      { width: 3.0, alpha: 0.86, jitter: 2.6 }, false);
    hardPoly(ctx, [[340, 26], [446, 74], [496, 190], [506, 380]], r,
      { width: 3.0, alpha: 0.86, jitter: 2.6 }, false);
    fluteFace(ctx, r, 16, W - 16, (x) => 30 + Math.abs(x - 256) * 0.28, H - 10, 13, 0.3);
    feather(ctx, W, H, 40);
    // the crown, taken back out, so the face runs INTO the wall behind
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    const g = ctx.createLinearGradient(0, 8, 0, 74);
    g.addColorStop(0, 'rgba(0,0,0,0.95)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, 80);
    ctx.restore();
    /* AND THE FOUR MARKS.
     *
     * Short, level, chalk-white, and drawn with the pressure of
     * somebody who came back and did it again. They are the only
     * horizontal marks in a hundred and fifty units of canyon, and in a
     * land drawn entirely in verticals a horizontal reads as writing.
     * Their heights are the drawing:
     *
     *   1.2  the boat, on its trestles, right there in front of it
     *   2.3  the trestles under it
     *   4.8  the shed's ridge, forty units down the channel
     *  13.0  THE DOORSTEP — and thirteen units is the height of the LIP
     */
    for (const [u, x0, len] of [
      [1.2, 96, 300], [2.3, 138, 236], [4.8, 108, 286], [12.6, 156, 224],
    ] as const) {
      const y = up(u);
      const jx = x0 + (r() - 0.5) * 18;
      for (let p = 0; p < 2; p++) {
        line(ctx, jx, y + (r() - 0.5) * 3, jx + len, y + (r() - 0.5) * 3, r,
          { width: 6.0 - p * 2.2, alpha: 0.96 - p * 0.28, passes: 1, color: CHALK }, 6);
      }
      // the tick at the end of it, which is how a person marks a height
      line(ctx, jx + len, y - 13, jx + len, y + 13, r,
        { width: 4.4, alpha: 0.86, passes: 1, color: CHALK }, 2);
    }
  });
}

/** THE FIFTH MARK, chalked on the rock ON TOP of the head wall, where no
 *  flood could ever have put it. Nothing else is up there. */
export function rimMarkTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(160, 96, seed, (ctx, r) => {
    const rock: [number, number][] = [[8, 90], [14, 46], [52, 20], [110, 26], [146, 58], [150, 90]];
    fillPoly(ctx, rock, ROCK, 0.44);
    hardPoly(ctx, rock, r, { width: 2.2, alpha: 0.82, jitter: 1.8 });
    for (let k = 0; k < 5; k++) flute(ctx, r, 24 + k * 24, 34 + r() * 14, 84, { alpha: 0.26 });
    for (let p = 0; p < 2; p++) {
      line(ctx, 34, 52 + (r() - 0.5) * 2, 122, 52 + (r() - 0.5) * 2, r,
        { width: 3.8 - p * 1.5, alpha: 0.94 - p * 0.3, passes: 1, color: CHALK }, 4);
    }
    line(ctx, 122, 44, 122, 60, r, { width: 2.4, alpha: 0.7, passes: 1, color: CHALK }, 2);
    feather(ctx, 160, 96, 12);
  });
}

/**
 * THE BOAT, UPSIDE DOWN ON TRESTLES, AND OILED.
 *
 * A clinker hull keel-up: the planks are the drawing, they run the
 * length of it, and the shine on them is the only thing in this land
 * drawn with anything but a line — a thin pale stain along the turn of
 * the bilge, because somebody put oil on it recently.
 */
export function boatOnTrestlesTexture(seed: number): THREE.CanvasTexture {
  const W = 384;
  const H = 200;
  return makeTexture(W, H, seed, (ctx, r) => {
    // the trestles first, so the hull sits on them
    for (const tx of [96, 288]) {
      stroke(ctx, [[tx - 22, 194], [tx - 5, 132]], r, { width: 3.4, alpha: 0.86, color: TIMBER });
      stroke(ctx, [[tx + 22, 194], [tx + 5, 132]], r, { width: 3.4, alpha: 0.86, color: TIMBER });
      line(ctx, tx - 26, 130, tx + 26, 130, r, { width: 4.0, alpha: 0.86, color: TIMBER });
      line(ctx, tx - 16, 166, tx + 16, 166, r, { width: 2.0, alpha: 0.6, color: TIMBER });
    }
    // the hull, keel up: a long shallow arc with a hard stem and stern
    const hull: [number, number][] = [
      [26, 128], [58, 100], [128, 78], [212, 72], [296, 82], [348, 106], [366, 128],
    ];
    fillPoly(ctx, [...hull, [366, 132], [26, 132]], HULL, 0.5);
    hardPoly(ctx, hull, r, { width: 3.6, alpha: 0.92 }, false);
    // the gunwale, now the lowest line on her, dead level: a hull on
    // trestles is the one thing out here that is exactly horizontal
    line(ctx, 26, 130, 366, 130, r, { width: 2.8, alpha: 0.84 }, 8);
    // the planks: five runs the length of her, which are the only long
    // horizontals in this file that are not chalk — and they are the
    // reason the boat reads as MAINTAINED rather than as wreckage
    for (let k = 1; k <= 5; k++) {
      const off = k * 9;
      const pl: [number, number][] = hull.map(([x, y]) => [x, y + off] as [number, number]);
      hardPoly(ctx, pl.slice(1, -1), r, { width: 1.3, alpha: 0.34 - k * 0.03, passes: 1 }, false);
    }
    // the keel, which is the top of her now, and it is a straight run
    hardPoly(ctx, [[58, 99], [212, 70], [348, 105]], r, { width: 3.2, alpha: 0.82 }, false);
    // THE OIL. A pale stain along the turn of the bilge and nothing
    // else: the whole of "it is oiled" in one mark.
    stain(ctx, 196, 96, 130, '#f2e8d2', 0.3);
    stain(ctx, 118, 88, 62, '#f2e8d2', 0.22);
    feather(ctx, W, H, 10);
  });
}

/** The trestles with nothing on them. Same drawing, half the story. */
export function trestlesTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(384, 200, seed, (ctx, r) => {
    for (const tx of [96, 288]) {
      stroke(ctx, [[tx - 22, 194], [tx - 5, 132]], r, { width: 3.4, alpha: 0.86, color: TIMBER });
      stroke(ctx, [[tx + 22, 194], [tx + 5, 132]], r, { width: 3.4, alpha: 0.86, color: TIMBER });
      line(ctx, tx - 26, 130, tx + 26, 130, r, { width: 4.0, alpha: 0.86, color: TIMBER });
      line(ctx, tx - 16, 166, tx + 16, 166, r, { width: 2.0, alpha: 0.6, color: TIMBER });
    }
    // and the two dents in the ground where they have stood a long time
    stain(ctx, 96, 192, 40, ROCK_DEEP, 0.16);
    stain(ctx, 288, 192, 40, ROCK_DEEP, 0.16);
  });
}

/**
 * THE BOAT, RIGHT WAY UP, ON THE FLOOR OF A DRY CHANNEL.
 *
 * The permanent change (THE-WAITS §4): you have rowed the river salt to
 * source, which nothing else in this world has done, and Holt takes her
 * off the trestles and sets her down in the dry, bow north, and leaves
 * her there. **The game never says whether that is madness or
 * readiness**, so the drawing does not say either: she is level, she is
 * square, her oars are shipped, and there is not one drop of anything
 * near her.
 */
export function boatRightedTexture(seed: number): THREE.CanvasTexture {
  const W = 384;
  const H = 200;
  return makeTexture(W, H, seed, (ctx, r) => {
    /* Round 1 drew her as a lens and she read as a leaf. A boat on dry
     * ground is a SHEER LINE — level, hard, and the highest thing about
     * her — with a stem that goes up at one end and a transom that goes
     * straight down at the other. Both of those are corners. */
    /* Round 2: a lens with a line round it is a PLATTER, whichever way
     * up you draw it. What makes a boat a boat, side on and on dry
     * ground, is four things and none of them is the curve: a level
     * SHEER along the top, a raked STEM at one end, a flat TRANSOM at
     * the other, and the fact that you can see down into her. */
    const sheer: [number, number][] = [[26, 72], [110, 66], [222, 66], [318, 70], [352, 74]];
    const hullOut: [number, number][] = [
      [26, 72], [40, 132], [78, 158], [176, 168], [274, 164], [332, 148], [352, 74],
    ];
    fillPoly(ctx, hullOut, HULL, 0.44);
    hardPoly(ctx, hullOut, r, { width: 3.4, alpha: 0.92 }, false);
    hardPoly(ctx, sheer, r, { width: 3.6, alpha: 0.94 }, false);
    // the rubbing strake, parallel to the sheer the whole way: one
    // straight run, and it is what says somebody built her
    line(ctx, 32, 86, 348, 88, r, { width: 2.0, alpha: 0.55, passes: 1 }, 8);
    // the inside: three thwarts, and they are level, which is the whole
    // point of the drawing
    /* THE INSIDE HAS TO READ, or she is a platter. Round 1 drew three
     * faint thwarts on a flat fill and she came out as a dish seen from
     * above. What separates the two is the FAR SHEER — a second line
     * inside the first, with the shadow of the hull between them — and
     * thwarts with enough pen in them to be planks. */
    // the far side of the inside, and the shadow between the two
    fillPoly(ctx, [[34, 76], [110, 72], [222, 72], [318, 76], [346, 80],
      [300, 96], [180, 100], [70, 96]], '#5e4b38', 0.3);
    hardPoly(ctx, [[70, 96], [180, 100], [300, 96], [346, 80]], r,
      { width: 1.8, alpha: 0.6 }, false);
    for (const [x0, x1, y] of [[76, 136, 106], [168, 236, 104], [268, 328, 106]] as const) {
      line(ctx, x0, y, x1, y + 2, r, { width: 4.4, alpha: 0.85, color: TIMBER }, 4);
      line(ctx, x0 + 4, y + 8, x1 - 4, y + 9, r, { width: 1.5, alpha: 0.34, passes: 1 }, 3);
    }
    // the planks again, so she is the same boat
    for (let k = 1; k <= 3; k++) {
      hardPoly(ctx, [[34, 72 + k * 20], [176, 74 + k * 22], [332, 72 + k * 20]], r,
        { width: 1.2, alpha: 0.26 - k * 0.05, passes: 1 }, false);
    }
    // the oars, shipped along her, and they are the one pair of
    // diagonals in a drawing made of levels
    line(ctx, 74, 92, 306, 112, r, { width: 2.8, alpha: 0.74, color: TIMBER });
    line(ctx, 82, 100, 314, 120, r, { width: 2.8, alpha: 0.62, color: TIMBER });
    stain(ctx, 200, 108, 140, '#f2e8d2', 0.24);
    feather(ctx, W, H, 10);
  });
}

/** THE SHED, on the channel floor. Its ridge is the third mark. Boards
 *  drawn as verticals, because everything here is. */
export function holtShedTexture(seed: number): THREE.CanvasTexture {
  const W = 256;
  const H = 224;
  return makeTexture(W, H, seed, (ctx, r) => {
    const walls: [number, number][] = [[36, 218], [36, 106], [220, 106], [220, 218]];
    const roof: [number, number][] = [[26, 110], [128, 48], [230, 110]];
    fillPoly(ctx, walls, '#ded2b6', 0.54);
    fillPoly(ctx, [...roof, [220, 118], [36, 118]], '#bfae8e', 0.66);
    hardPoly(ctx, walls, r, { width: 3.0, alpha: 0.9, jitter: 1.6 });
    hardPoly(ctx, roof, r, { width: 3.2, alpha: 0.92, jitter: 1.6 }, false);
    line(ctx, 26, 112, 230, 112, r, { width: 2.4, alpha: 0.8 }, 6);
    // the corrugation, drawn as short runs DOWN the pitch
    for (let x = 34; x < 224; x += 10 + r() * 5) {
      const top = 48 + Math.abs(x - 128) * 0.608;
      line(ctx, x, top + 2, x, 108, r, { width: 1.2, alpha: 0.26, passes: 1 }, 2);
    }
    // the boards
    for (let x = 44; x < 214; x += 12 + r() * 8) {
      line(ctx, x, 118 + r() * 4, x + (r() - 0.5) * 3, 214, r,
        { width: 1.3, alpha: 0.3, passes: 1, color: TIMBER }, 3);
    }
    // the door, shut, and a rag on a nail beside it — the only thing on
    // the outside of this building
    const door: [number, number][] = [[104, 216], [104, 138], [150, 138], [150, 216]];
    hardPoly(ctx, door, r, { width: 2.4, alpha: 0.8 });
    for (let x = 108; x < 150; x += 10) line(ctx, x, 140, x, 214, r, { width: 1.1, alpha: 0.26, passes: 1 }, 2);
    stroke(ctx, [[172, 132], [176, 150], [170, 166], [178, 178]], r,
      { width: 2.2, alpha: 0.6, color: CLOTH });
    feather(ctx, W, H, 12);
  });
}

/**
 * HOLT'S HOUSE, on the rim above the head of the canyon.
 *
 * It stands where the fifth mark says it stands, which is a very long
 * way above where a river would have to get to. Small, square, kept, and
 * with a doorstep drawn as one line — the fourth mark's height, and it
 * faces the canyon, because everything of his does.
 */
export function holtHouseTexture(seed: number, lit: boolean): THREE.CanvasTexture {
  const W = 320;
  const H = 288;
  return makeTexture(W, H, seed, (ctx, r) => {
    const walls: [number, number][] = [[56, 280], [56, 140], [264, 140], [264, 280]];
    const roof: [number, number][] = [[40, 146], [160, 58], [280, 146]];
    fillPoly(ctx, walls, '#ded2b6', 0.6);
    fillPoly(ctx, [...roof, [264, 154], [56, 154]], '#bfae8e', 0.7);
    hardPoly(ctx, walls, r, { width: 3.2, alpha: 0.92, jitter: 1.6 });
    hardPoly(ctx, roof, r, { width: 3.4, alpha: 0.92, jitter: 1.6 }, false);
    line(ctx, 40, 148, 280, 148, r, { width: 2.6, alpha: 0.82 }, 6);
    // stone, drawn in verticals like everything else out here
    for (let x = 62; x < 262; x += 13 + r() * 9) {
      line(ctx, x, 160 + r() * 8, x + (r() - 0.5) * 4, 276, r,
        { width: 1.2, alpha: 0.24, passes: 1 }, 3);
    }
    // the roof, ruled in short runs down the pitch
    for (let x = 46; x < 276; x += 9 + r() * 5) {
      const top = 58 + Math.abs(x - 160) * 0.733;
      line(ctx, x, top + 2, x, 144, r, { width: 1.1, alpha: 0.22, passes: 1 }, 2);
    }
    // the chimney, one window, the door — and THE DOORSTEP, one line
    fillPoly(ctx, [[212, 116], [212, 40], [242, 40], [242, 128]], '#ded2b6', 0.72);
    hardPoly(ctx, [[212, 116], [212, 40], [242, 40], [242, 128]], r,
      { width: 2.6, alpha: 0.85 });
    /* THE WINDOW, and at night there is a light in it — the only lit
     * window in the east half of the world, and the only way a walker
     * on the channel floor after dark can tell that anybody lives up
     * there at all. */
    /* AT NIGHT THERE IS A LIGHT IN IT, and it is the only lit window in
     * the east half of the world — the one way a walker standing on the
     * channel floor after dark can tell that anybody lives up there at
     * all. It is drawn bigger and brighter than the shut version, with
     * the spill on the ground under it, because a warm pixel forty
     * units away and six above the lip has to survive the night grade. */
    if (lit) {
      stain(ctx, 102, 194, 78, '#ffd79a', 0.5);
      fillPoly(ctx, [[78, 220], [78, 166], [126, 166], [126, 220]], '#ffe0aa', 0.96);
      fillPoly(ctx, [[168, 278], [168, 194], [212, 194], [212, 240]], '#ffd79a', 0.35);
    }
    hardPoly(ctx, [[82, 216], [82, 172], [122, 172], [122, 216]], r, { width: 2.2, alpha: 0.8 });
    line(ctx, 102, 172, 102, 216, r, { width: 1.4, alpha: 0.5, passes: 1 });
    const door: [number, number][] = [[168, 278], [168, 194], [212, 194], [212, 278]];
    fillPoly(ctx, door, TIMBER, 0.35);
    hardPoly(ctx, door, r, { width: 2.6, alpha: 0.88 });
    line(ctx, 156, 281, 224, 281, r, { width: 4.4, alpha: 0.9 }, 5);
    feather(ctx, W, H, 14);
  });
}

/**
 * HOLT. Three drawings, one at a time.
 *
 *   0  bent over the hull with a rag — what he is doing most of the day
 *   1  standing at the foot of the wall, head back, looking up the marks
 *   2  standing straight, facing out — which is what he does when
 *      somebody comes, and nobody comes
 *
 * No face (QUALITY-BAR §3), so it is all posture: the working pose has
 * his weight over the boat and the standing pose has it on one hip.
 */
export function holtTexture(seed: number, pose: 0 | 1 | 2): THREE.CanvasTexture {
  return makeTexture(112, 176, seed, (ctx, r) => {
    /* Round 1 of the texture gate drew all three of these as stick
     * figures with a pea for a head, against a land whose own people
     * (Joan, the field hands) carry a filled coat, a real head and
     * limbs you can see from forty units. A doodle-folk has no face, so
     * the BODY is the whole performance and it has to have some. */
    if (pose === 0) {
      // BENT OVER THE HULL. The back is one long near-level curve and
      // the working arm is already down at the boat.
      /* Round 2: the first version drew the coat over the head and the
       * legs under the coat, and it came out as a hooded ghost. Order
       * is the whole fix — legs down first, coat on their tops, head
       * clear of both, arm last. */
      const hx = 94;
      const hy = 76;
      line(ctx, 34, 106, 26, 170, r, { width: 2.5, alpha: 0.88 });
      line(ctx, 46, 110, 54, 170, r, { width: 2.4, alpha: 0.84 });
      fillPoly(ctx, [[30, 116], [42, 78], [70, 72], [78, 98], [44, 122]], CLOTH, 0.44);
      hardPoly(ctx, [[30, 116], [42, 78], [70, 72], [78, 98]], r,
        { width: 2.0, alpha: 0.78, passes: 1 }, false);
      // the back: hips to shoulders to neck, one curve, nearly level
      stroke(ctx, [[34, 104], [48, 84], [70, 76], [hx - 10, hy + 2]], r,
        { width: 3.2, alpha: 0.9 });
      scribbleCircle(ctx, hx, hy, 12, r, { width: 2, alpha: 0.88 }, 1.05);
      stroke(ctx, [[hx - 13, hy - 5], [hx - 5, hy - 17], [hx + 10, hy - 14]], r,
        { width: 1.7, alpha: 0.72 });
      // the arm down, and the rag at the end of it
      stroke(ctx, [[76, 86], [82, 112], [76, 130]], r, { width: 2.2, alpha: 0.88 });
      stroke(ctx, [[76, 130], [64, 134], [70, 144], [56, 144]], r,
        { width: 2.2, alpha: 0.72, color: CLOTH });
      stroke(ctx, [[60, 82], [50, 108], [56, 126]], r, { width: 1.9, alpha: 0.72 });
    } else if (pose === 1) {
      // HEAD BACK, READING THE WALL. The only posture in the game where
      // somebody is looking UP, and the whole of it is in the neck.
      const cx = 52;
      scribbleCircle(ctx, cx + 6, 30, 12.5, r, { width: 2, alpha: 0.88 }, 1.05);
      /* THE HAT IS THE HEAD-BACK. A brim seen from under it is a wide
       * shallow arc ABOVE the crown rather than a line across it, and
       * it is the only way a figure with no face can be looking up. */
      stroke(ctx, [[cx - 10, 26], [cx + 4, 12], [cx + 24, 16], [cx + 22, 30]], r,
        { width: 1.9, alpha: 0.78 });
      // the neck, and it is long and thrown back
      stroke(ctx, [[cx - 1, 52], [cx + 3, 40]], r, { width: 3.0, alpha: 0.86 });
      fillPoly(ctx, [[cx - 16, 52], [cx - 20, 122], [cx + 19, 122], [cx + 14, 52]], CLOTH, 0.4);
      hardPoly(ctx, [[cx - 16, 52], [cx - 20, 122], [cx + 19, 122], [cx + 14, 52]], r,
        { width: 2, alpha: 0.82 });
      stroke(ctx, [[cx - 15, 60], [cx - 26, 86], [cx - 18, 106]], r, { width: 2, alpha: 0.84 });
      stroke(ctx, [[cx + 14, 60], [cx + 25, 84], [cx + 16, 104]], r, { width: 2, alpha: 0.84 });
      line(ctx, cx - 12, 118, cx - 16, 172, r, { width: 2.4, alpha: 0.86 });
      line(ctx, cx + 11, 118, cx + 15, 172, r, { width: 2.4, alpha: 0.86 });
    } else {
      // STOPPED, AND FACING OUT. Weight on one hip, the rag still in
      // one hand, and doing nothing at all, which out here is news.
      const cx = 54;
      scribbleCircle(ctx, cx, 34, 12.5, r, { width: 2, alpha: 0.85 }, 1.05);
      stroke(ctx, [[cx - 14, 31], [cx - 10, 18], [cx + 10, 18], [cx + 14, 32]], r,
        { width: 1.7, alpha: 0.72 });
      fillPoly(ctx, [[cx - 16, 52], [cx - 21, 122], [cx + 18, 122], [cx + 13, 52]], CLOTH, 0.4);
      hardPoly(ctx, [[cx - 16, 52], [cx - 21, 122], [cx + 18, 122], [cx + 13, 52]], r,
        { width: 2, alpha: 0.84 });
      stroke(ctx, [[cx - 15, 58], [cx - 27, 88], [cx - 22, 112]], r, { width: 2, alpha: 0.84 });
      stroke(ctx, [[cx + 13, 58], [cx + 23, 90], [cx + 19, 116]], r, { width: 2, alpha: 0.84 });
      stroke(ctx, [[cx + 19, 116], [cx + 27, 124], [cx + 21, 134]], r,
        { width: 2, alpha: 0.6, color: CLOTH });
      line(ctx, cx - 13, 118, cx - 18, 172, r, { width: 2.4, alpha: 0.86 });
      line(ctx, cx + 10, 118, cx + 14, 172, r, { width: 2.4, alpha: 0.86 });
    }
  });
}

/** SOMEBODY'S BOOTS, side by side, at the top of the climb
 *  (THE-STRANGERS C20). Nobody says whose. */
export function bootsTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(128, 80, seed, (ctx, r) => {
    for (const x of [40, 82]) {
      const b: [number, number][] = [
        [x - 15, 72], [x - 16, 44], [x - 8, 28], [x + 6, 26], [x + 12, 44], [x + 14, 72],
      ];
      fillPoly(ctx, b, TIMBER, 0.34);
      hardPoly(ctx, b, r, { width: 2.2, alpha: 0.86, jitter: 1.4 });
      line(ctx, x - 15, 62, x + 14, 62, r, { width: 1.6, alpha: 0.5, passes: 1 });
      for (let k = 0; k < 3; k++) {
        line(ctx, x - 8, 34 + k * 5, x + 8, 32 + k * 5, r, { width: 1.0, alpha: 0.4, passes: 1 }, 2);
      }
    }
  });
}

/** A cairn on the east bench: six stones somebody stacked, and there is
 *  no path anywhere near it. */
export function cairnTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(96, 144, seed, (ctx, r) => {
    let y = 136;
    let w = 30;
    while (y > 26) {
      const h = 12 + r() * 8;
      const p: [number, number][] = [
        [48 - w / 2, y], [48 - w / 2 + 2, y - h], [48 + w / 2 - 3, y - h + 2], [48 + w / 2, y],
      ];
      fillPoly(ctx, p, ROCK, 0.44);
      hardPoly(ctx, p, r, { width: 2.0, alpha: 0.84, jitter: 1.4 });
      y -= h + 1;
      w *= 0.82;
    }
  });
}

/** The one bird in SPLITROCK, turning above the slot. Two drawings, so
 *  it can change the set of its wings without changing anything else. */
export function turningBirdTexture(seed: number, pose: 0 | 1): THREE.CanvasTexture {
  return makeTexture(96, 48, seed, (ctx, r) => {
    if (pose === 0) {
      stroke(ctx, [[10, 30], [30, 18], [48, 24], [66, 18], [86, 30]], r,
        { width: 2.6, alpha: 0.8 });
    } else {
      stroke(ctx, [[12, 20], [32, 26], [48, 22], [64, 26], [84, 20]], r,
        { width: 2.6, alpha: 0.8 });
    }
  });
}

/** Dust hanging where something came off the wall: a pale smear with
 *  nothing solid in it. Used once, at the rockfall. */
export function fallDustTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(192, 128, seed, (ctx, r) => {
    stain(ctx, 96, 92, 88, '#e8dcc4', 0.3);
    for (let k = 0; k < 10; k++) {
      flute(ctx, r, 30 + r() * 130, 24 + r() * 40, 110 + r() * 14,
        { alpha: 0.12 + r() * 0.1, width: 2.2, color: PENCIL });
    }
  });
}

/** THE LAND'S ONE PIECE OF SIGN-WRITING, and there is no writing on it:
 *  a post at the mouth with a single arm, pointing up the channel.
 *  Whoever cut it did not think anybody would need telling twice. */
export function mouthPostTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(128, 176, seed, (ctx, r) => {
    line(ctx, 60, 170, 62, 34, r, { width: 4.4, alpha: 0.9, color: TIMBER });
    for (let k = 0; k < 5; k++) {
      line(ctx, 56 + k * 2.4, 60 + r() * 20, 57 + k * 2.4, 160, r,
        { width: 0.9, alpha: 0.22, passes: 1 }, 3);
    }
    const arm: [number, number][] = [[60, 40], [104, 38], [120, 51], [104, 64], [60, 62]];
    fillPoly(ctx, arm, '#e9e0cc', 0.55);
    hardPoly(ctx, arm, r, { width: 2.4, alpha: 0.88 });
    // a single scratch along it and nothing that could be read
    line(ctx, 70, 52, 104, 51, r, { width: 1.2, alpha: 0.3, passes: 1 }, 3);
    feather(ctx, 128, 176, 8);
  });
}

/** The scree at the foot of a wall — a run of small blocks, drawn once
 *  and instanced along the toes of the cliffs. */
export function screeTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(192, 72, seed, (ctx, r) => {
    for (let k = 0; k < 9; k++) {
      const x = 16 + r() * 160;
      const w = 10 + r() * 22;
      const h = 8 + r() * 20;
      const p: [number, number][] = [
        [x - w / 2, 68], [x - w / 2 + 2, 68 - h], [x + w / 2 - 3, 68 - h + 3], [x + w / 2, 68],
      ];
      fillPoly(ctx, p, ROCK, 0.38);
      hardPoly(ctx, p, r, { width: 1.8, alpha: 0.7, jitter: 1.4 });
    }
    feather(ctx, 192, 72, 22);
  });
}

/** Fine hatching for the deep shadow at the bottom of the cut — a
 *  standee laid against the wall's foot, and the darkest thing in this
 *  land. Vertical, of course. */
export function slotShadowTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(256, 128, seed, (ctx, r) => {
    // DOWN the page, like everything else in this land: `hatch` takes
    // an angle and zero is horizontal, which round 1 shipped and which
    // put the only cross-grain marks in SPLITROCK in its darkest corner
    hatch(ctx, 0, 0, 256, 128, Math.PI / 2, 5, r, { alpha: 0.17, width: 1.4 });
    hatch(ctx, 0, 40, 256, 88, Math.PI / 2, 8, r, { alpha: 0.15, width: 1.7 });
    feather(ctx, 256, 128, 60);
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    const g = ctx.createLinearGradient(0, 0, 0, 128);
    g.addColorStop(0, 'rgba(0,0,0,1)');
    g.addColorStop(0.55, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 128);
    ctx.restore();
  });
}
