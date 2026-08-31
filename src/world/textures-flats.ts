import * as THREE from 'three';
import {
  makeTexture, stroke, line, scribbleCircle, type Ctx2D,
} from '../engine/ink';
import { PENCIL } from '../engine/palette';

/**
 * THE BLEACH FLATS' prop box (design/specs/the-bleach-flats.md).
 *
 * ── THE LAND'S INK TECHNIQUE, AND IT IS ONE SENTENCE ────────────────
 *
 * **Everything in THE BLEACH FLATS is drawn in strokes ACROSS the page,
 * and every one of them gives up as it rises.**
 *
 * SPLITROCK next door is drawn entirely in verticals (`textures-canyon.ts`)
 * because a tear runs the way its fibres run. The Flats are the tear's
 * opposite in every other respect and they are its opposite here too:
 * this land is dune script, crack, dash and rule — long, level, broken
 * runs laid one under another, and there is not a vertical mark on the
 * ground anywhere in it.
 *
 * The second half is the heat. **THE PALING IS THE LAND.** Every drawing
 * here carries full ballpoint pressure where it touches the ground and
 * loses it going up, so a post is black at its foot and nearly gone at
 * its top, and a palm's crown is the faintest thing in the frame. That
 * is the one drawing behaviour that reads as glare rather than as
 * distance, it costs an alpha ramp per stroke, and it is why the Flats
 * do not look like the Downs painted a different colour.
 *
 * ── AND THE REGISTER ────────────────────────────────────────────────
 *
 * THE-WAITS §5: *flat, patient, faintly aggrieved.* Amos believes the
 * answer is elsewhere and that elsewhere owes you. Nothing in this land
 * is charming. The one made thing in it is in better order than anything
 * else in the game.
 */

/* Pigments. Every wash still comes out of palette.ts. */
const BONE = '#e6dcc2';
const PALE = '#cdbf9c';
const DUST = '#a8977a';
const TIMBER = '#7a6a51';
const TIN = '#9aa0a2';
const GREEN = '#7f9469';

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
 * A POLYGON WITH CORNERS ON IT. `stroke` draws quadratics through the
 * midpoints of its points, so a rectangle handed to it comes out as a
 * lozenge — which is what round 1 of the texture gate shipped: a
 * cistern like an egg, an apron like a surfboard, a signpost with four
 * ellipses on it. An edge is drawn as an EDGE, one `line` per segment,
 * and the corners stay corners. (`textures-canyon.ts` carries the twin
 * of this and the same note.)
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

/** A GROUND STAIN WITH NO EDGE ON IT — Session 10's rule (see
 *  `textures-farm.ts`). A stain on paper fades; it does not have
 *  sixteen sides you can count from a hundred units. */
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
 * THE PALING — the land's whole ink technique, in one function.
 *
 * Take the ink out of the top of a drawing with a vertical gradient, so
 * whatever was drawn keeps its full pressure at the ground and has
 * almost let go by the time it reaches the sky. Everything that STANDS
 * in this land goes through here before it leaves the canvas.
 */
function pale(ctx: Ctx2D, w: number, h: number, from = 0.0, to = 0.5, k = 0.34) {
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  const g = ctx.createLinearGradient(0, h * from, 0, h * to);
  g.addColorStop(0, `rgba(0,0,0,${k})`);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

/** A run of dashes across the page — the mark this land is made of. */
function script(
  ctx: Ctx2D, r: () => number, y: number, x0: number, x1: number,
  o: { alpha?: number; width?: number; color?: string; gap?: number } = {}
) {
  const gap = o.gap ?? 16;
  for (let x = x0 + r() * gap; x < x1; x += gap * (0.5 + r() * 1.1)) {
    const len = gap * (0.5 + r() * 1.4);
    line(ctx, x, y + (r() - 0.5) * 3, Math.min(x1, x + len), y + (r() - 0.5) * 3, r,
      { width: o.width ?? 1.1, alpha: o.alpha ?? 0.24, passes: 1, color: o.color ?? DUST }, 3);
  }
}

/* ================================================================== *
 * THE GROUND — three states, and none of them is sand.
 * ================================================================== */

/**
 * THE DUNE SCRIPT. The default floor of the Flats: long level runs of
 * broken line, one under another, wandering the way wind-combed ground
 * does. Three variants, shared across the whole land.
 */
export function flatsGroundDecal(seed: number, variant: 0 | 1 | 2): THREE.CanvasTexture {
  return makeTexture(256, 256, seed, (ctx, r) => {
    stain(ctx, 128, 128, 130, PALE, 0.14 + variant * 0.03);
    /* Round 1 laid these as evenly-spaced rules and the floor of the
     * Flats came out RULED, which is the array-look with a suntan. A
     * wind-combed floor is a set of runs that WANDER and break: each
     * row bows across the tile on its own arc, and a third of them stop
     * a long way short of the edge. */
    const rows = 11 + variant * 4;
    for (let k = 0; k < rows; k++) {
      const y = 10 + (k / (rows - 1)) * 234 + (r() - 0.5) * 13;
      const x0 = 4 + r() * 52;
      const x1 = 252 - r() * 60;
      const bow = (r() - 0.5) * 16;
      const steps = 5;
      for (let i = 0; i < steps; i++) {
        const t0 = i / steps;
        const t1 = (i + 1) / steps;
        if (r() < 0.22) continue;
        script(ctx, r,
          y + Math.sin(((t0 + t1) / 2) * Math.PI) * bow,
          x0 + (x1 - x0) * t0, x0 + (x1 - x0) * t1,
          { alpha: 0.2 + r() * 0.16, gap: 13 + variant * 5, width: 1.0 + r() * 0.5 });
      }
    }
  });
}

/**
 * THE PALE — cracked pan floor, and the only place in the Flats where
 * the ground has a pattern rather than a grain. The cracks are straight
 * runs meeting at corners, because dried mud breaks the way paper tears.
 */
export function crackedPanDecal(seed: number): THREE.CanvasTexture {
  return makeTexture(256, 256, seed, (ctx, r) => {
    stain(ctx, 128, 128, 132, BONE, 0.26);
    /* Round 1 joined twenty-two nodes to their nearest neighbours and
     * got a spider's web with cells forty pixels across, which at world
     * scale is cracked mud in plates the size of a table. Dried pan
     * breaks small: a lattice on a jittered grid, every cell a straight
     * run to the next, and about a fifth of the joins simply missing. */
    const G = 5;
    const nodes: [number, number][][] = [];
    for (let i = 0; i <= G; i++) {
      const row: [number, number][] = [];
      for (let j = 0; j <= G; j++) {
        row.push([(j / G) * 256 + (r() - 0.5) * 34, (i / G) * 256 + (r() - 0.5) * 34]);
      }
      nodes.push(row);
    }
    for (let i = 0; i <= G; i++) {
      for (let j = 0; j <= G; j++) {
        for (const [di, dj] of [[0, 1], [1, 0]] as const) {
          const a = nodes[i]?.[j];
          const b = nodes[i + di]?.[j + dj];
          if (!a || !b || r() < 0.18) continue;
          const mx = (a[0] + b[0]) / 2 + (r() - 0.5) * 12;
          const my = (a[1] + b[1]) / 2 + (r() - 0.5) * 12;
          line(ctx, a[0], a[1], mx, my, r,
            { width: 1.1, alpha: 0.22 + r() * 0.16, passes: 1, color: DUST }, 2);
          line(ctx, mx, my, b[0], b[1], r,
            { width: 1.1, alpha: 0.22 + r() * 0.16, passes: 1, color: DUST }, 2);
        }
      }
    }
  });
}

/**
 * THE TRACK — worn by one person, both ways, at night.
 *
 * It is one person wide and it is drawn as one thing: a single run of
 * scuffed ground with a hard-ish middle and no edge at all. Nothing else
 * in this land is worn, so nothing else is drawn like it.
 */
export function trackDecal(seed: number): THREE.CanvasTexture {
  return makeTexture(128, 256, seed, (ctx, r) => {
    /* A BAND, not a blob. `stain` is radial and a radial stain on a
     * tile that repeats along its own length draws a row of discs — you
     * could see every one of them down the length of the track. A worn
     * path is a strip: a linear gradient across it, uniform along it. */
    {
      const g = ctx.createLinearGradient(0, 0, 128, 0);
      g.addColorStop(0, 'rgba(168,151,122,0)');
      g.addColorStop(0.32, 'rgba(168,151,122,0.34)');
      g.addColorStop(0.5, 'rgba(139,122,94,0.46)');
      g.addColorStop(0.68, 'rgba(168,151,122,0.34)');
      g.addColorStop(1, 'rgba(168,151,122,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 128, 256);
    }
    for (let k = 0; k < 40; k++) {
      const y = 4 + r() * 248;
      const x = 40 + r() * 44;
      line(ctx, x, y, x + 6 + r() * 16, y + (r() - 0.5) * 7, r,
        { width: 1.0 + r() * 0.8, alpha: 0.24 + r() * 0.26, passes: 1, color: '#8b7a5e' }, 2);
    }
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    for (const [x0, x1] of [[0, 34], [128, 94]] as const) {
      const g = ctx.createLinearGradient(x0, 0, x1, 0);
      g.addColorStop(0, 'rgba(0,0,0,1)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(Math.min(x0, x1), 0, 34, 256);
    }
    ctx.restore();
  });
}

/** The water of the oasis, seen edge-on from its own bank: a flat blue
 *  line and its two reeds. Used ONCE, as the near edge of the pool. */
export function oasisReedTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(160, 96, seed, (ctx, r) => {
    for (let k = 0; k < 14; k++) {
      const x = 12 + r() * 136;
      const h = 30 + r() * 52;
      stroke(ctx, [[x, 92], [x + (r() - 0.5) * 6, 92 - h * 0.6], [x + (r() - 0.5) * 14, 92 - h]], r,
        { width: 1.5, alpha: 0.6, passes: 1, color: GREEN });
    }
    pale(ctx, 160, 96, 0, 0.6, 0.26);
    feather(ctx, 160, 96, 18);
  });
}

/* ================================================================== *
 * WHAT STANDS UP IN IT.
 * ================================================================== */

/**
 * A PALM. Three variants, and the lean is drawn in rather than flipped,
 * because there is one wind out here and it has come from the same
 * quarter for as long as anybody has been keeping track (nobody has been
 * keeping track).
 */
export function flatsPalmTexture(seed: number, variant: 0 | 1 | 2): THREE.CanvasTexture {
  const W = 224;
  const H = 288;
  return makeTexture(W, H, seed, (ctx, r) => {
    const lean = [-26, 8, 30][variant];
    const topX = 112 + lean;
    const topY = 74 + variant * 8;
    /* THE TRUNK IS NOT INK. Round 1 drew it at full ballpoint and a
     * palm out here came out as a black pole with a ghost on top of it,
     * which is the paling working against the drawing instead of with
     * it. A trunk in this light is brown, and it is the DARKEST thing
     * in the land at its foot and the palest at the crown. */
    const trunk: [number, number][] = [
      [112 - lean * 0.25, 282], [110 - lean * 0.1, 210], [topX - lean * 0.35, 140], [topX, topY],
    ];
    stroke(ctx, trunk, r, { width: 5.6, alpha: 0.82, jitter: 2, color: TIMBER });
    // the trunk's rings: dashes ACROSS it, which is this land's mark
    for (let k = 0; k < 16; k++) {
      const t = 0.08 + (k / 16) * 0.86;
      const x = 112 - lean * 0.25 + (topX - (112 - lean * 0.25)) * t * t;
      const y = 282 + (topY - 282) * t;
      line(ctx, x - 7, y, x + 7, y - 1, r, { width: 1.1, alpha: 0.3, passes: 1 }, 2);
    }
    // the crown: seven fronds, each a spine with barbs, and the whole
    // thing thin — a palm out here has lost most of itself
    for (let i = 0; i < 7; i++) {
      const a = -Math.PI * 0.95 + (i / 6) * Math.PI * 0.9 + (r() - 0.5) * 0.22;
      const len = 70 + r() * 30;
      const mx = topX + Math.cos(a) * len * 0.55;
      const my = topY + Math.sin(a) * len * 0.42;
      const ex = topX + Math.cos(a) * len;
      const ey = topY + Math.sin(a) * len * 0.66 + 30;
      fillPoly(ctx, [[topX, topY], [mx, my - 6], [ex, ey]], GREEN, 0.34);
      stroke(ctx, [[topX, topY], [mx, my], [ex, ey]], r,
        { width: 2.8, alpha: 0.9, color: '#4a5a44' });
      for (let f = 1; f < 6; f++) {
        const t = f / 6;
        const bx = topX + (mx - topX) * t * 1.7;
        const by = topY + (my - topY) * t * 1.7;
        line(ctx, bx, by, bx + (r() - 0.5) * 9, by + 13 + r() * 9, r,
          { width: 1.3, alpha: 0.55, passes: 1, color: '#4a5a44' }, 2);
      }
    }
    // the dead fronds still hanging under the crown, which is what makes
    // it a desert palm and not a postcard
    for (let i = 0; i < 4; i++) {
      stroke(ctx, [[topX + (r() - 0.5) * 16, topY + 8], [topX + (r() - 0.5) * 24, topY + 46 + r() * 22]],
        r, { width: 1.8, alpha: 0.4, passes: 1, color: DUST });
    }
    pale(ctx, W, H, 0.0, 0.44, 0.26);
    feather(ctx, W, H, 14);
  });
}

/** Low grey scrub — the plant that actually lives here, and there is
 *  only one of it. Three variants off one plan. */
export function flatsScrubTexture(seed: number, variant: 0 | 1 | 2): THREE.CanvasTexture {
  return makeTexture(128, 88, seed, (ctx, r) => {
    const n = 9 + variant * 4;
    for (let k = 0; k < n; k++) {
      const x = 30 + r() * 68;
      stroke(ctx, [[64, 84], [x, 64 - r() * 10], [x + (r() - 0.5) * 40, 30 + r() * 26]], r,
        { width: 1.1, alpha: 0.34 + r() * 0.16, passes: 1, color: DUST });
    }
    pale(ctx, 128, 88, 0, 0.7, 0.24);
  });
}

/** A fence post, and there is no wire on it. Four of them stand in a
 *  line in the middle of THE PALE and nothing anywhere says why. */
export function fencePostTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(64, 176, seed, (ctx, r) => {
    const p: [number, number][] = [[23, 172], [21, 34], [32, 26], [41, 36], [39, 172]];
    fillPoly(ctx, p, TIMBER, 0.4);
    hardPoly(ctx, p, r, { width: 2.6, alpha: 0.9, jitter: 1.6 });
    // the grain runs ACROSS, because in this land everything does
    for (let k = 0; k < 12; k++) {
      const y = 46 + k * 10 + r() * 4;
      line(ctx, 23, y, 39, y + (r() - 0.5) * 3, r, { width: 1.0, alpha: 0.26, passes: 1 }, 2);
    }
    // two staples, and nothing between them
    for (const y of [66, 108]) scribbleCircle(ctx, 40, y, 3, r, { width: 1.6, alpha: 0.6 });
    pale(ctx, 64, 176, 0, 0.5, 0.3);
  });
}

/**
 * THE HANDS — the signpost where the east road comes into the Flats,
 * and every arm on it points OUT of this land.
 *
 * `THE-WAITS` §5: Amos believes the answer is elsewhere and that
 * elsewhere owes you. That is the land's belief, so the land's one
 * signpost says it and nothing else has to. Four arms, four bearings,
 * and there is no arm for here.
 */
export function flatsSignTexture(seed: number): THREE.CanvasTexture {
  const W = 224;
  const H = 256;
  return makeTexture(W, H, seed, (ctx, r) => {
    line(ctx, 108, 250, 110, 30, r, { width: 5.2, alpha: 0.92, color: TIMBER });
    for (let k = 0; k < 16; k++) {
      const y = 54 + k * 12 + r() * 5;
      line(ctx, 104, y, 116, y + (r() - 0.5) * 3, r, { width: 1.0, alpha: 0.24, passes: 1 }, 2);
    }
    // four arms at four heights, two each way, all of them pointing off
    // the edge of this drawing
    const ARMS: [number, number, number][] = [
      [56, 1, 96], [86, -1, 84], [118, 1, 78], [150, -1, 90],
    ];
    for (const [y, dir, len] of ARMS) {
      const x0 = 110;
      const x1 = x0 + dir * len;
      const tip = x1 + dir * 16;
      const arm: [number, number][] = [
        [x0, y - 8], [x1, y - 8], [tip, y], [x1, y + 8], [x0, y + 8],
      ];
      fillPoly(ctx, arm, BONE, 0.66);
      hardPoly(ctx, arm, r, { width: 2.4, alpha: 0.9 });
      // one worn scratch along each, and it is not readable and never was
      line(ctx, x0 + dir * 12, y, x1 - dir * 6, y + (r() - 0.5) * 2, r,
        { width: 1.2, alpha: 0.28, passes: 1 }, 4);
    }
    pale(ctx, W, H, 0, 0.42, 0.28);
    feather(ctx, W, H, 8);
  });
}

/* ================================================================== *
 * AMOS — THE-WAITS §5. The one piece of engineering in the Bleach
 * Flats, and it is in good order.
 * ================================================================== */

/**
 * THE APRON — the thing that catches the rain.
 *
 * A boarded sheet twelve feet across on four poles, tilted, with a
 * gutter along its low edge. It is the largest made thing in this land
 * by a factor of four and it is the only drawing in the Flats with a
 * straight edge all the way round it: in a land of broken dashes, a
 * ruled rectangle is the first thing anybody's eye lands on, exactly the
 * way THE HEADLAND's table works in the Downs.
 *
 * Nothing about it is shabby. That is the whole point of the drawing.
 */
export function rainApronTexture(seed: number): THREE.CanvasTexture {
  const W = 448;
  const H = 288;
  return makeTexture(W, H, seed, (ctx, r) => {
    // the legs first
    for (const [x, top] of [[52, 172], [172, 158], [298, 142], [410, 128]] as const) {
      line(ctx, x, 284, x + 4, top, r, { width: 4.6, alpha: 0.9, color: TIMBER });
      line(ctx, x - 20, 244, x + 24, 234, r, { width: 2.4, alpha: 0.55, color: TIMBER });
    }
    // the deck: one long ruled quadrilateral, tilted down to the left
    /* THE DECK. Round 1 drew it twenty-four pixels deep and it read as
     * a surfboard on sticks. It is a SHEET seen from slightly above:
     * sixty pixels of foreshortened deck, four corners, and the boards
     * across it so you can see it is a made surface and not a plank. */
    const deck: [number, number][] = [[26, 128], [416, 78], [432, 138], [42, 188]];
    fillPoly(ctx, deck, BONE, 0.6);
    hardPoly(ctx, deck, r, { width: 3.2, alpha: 0.92 });
    for (let k = 1; k < 11; k++) {
      const t = k / 11;
      line(ctx, 26 + 16 * t, 128 + 60 * t, 416 + 16 * t, 78 + 60 * t, r,
        { width: 1.3, alpha: 0.3, passes: 1 }, 8);
    }
    // and one rule the other way, which is the ridge the fall runs off
    line(ctx, 220, 103, 236, 163, r, { width: 1.6, alpha: 0.32, passes: 1 }, 3);
    /* ---- THE GUTTER, AND IT RUNS DOWNHILL FROM THE CISTERN --------- *
     * `THE-STRANGERS` U23, and it is the quietest thing in this land: a
     * gutter whose fall goes AWAY from the tank it feeds could never
     * have filled it, not once, not ever. It is dead straight, it is
     * clean, it is fixed at both ends, and it is wrong. Nothing in this
     * game will ever mention it. */
    const gut: [number, number][] = [[36, 194], [428, 144], [430, 162], [38, 212]];
    fillPoly(ctx, gut, TIN, 0.38);
    hardPoly(ctx, gut, r, { width: 2.6, alpha: 0.88 });
    line(ctx, 42, 204, 426, 154, r, { width: 1.4, alpha: 0.36, passes: 1 }, 8);
    // the brackets, one every eighty pixels, all present
    for (let x = 66; x < 424; x += 76) {
      const y = 196 - (x - 36) * 0.127;
      line(ctx, x, y + 18, x + 3, y + 42, r, { width: 2.2, alpha: 0.62, color: TIMBER });
    }
    pale(ctx, W, H, 0, 0.36, 0.24);
    feather(ctx, W, H, 12);
  });
}

/**
 * THE CISTERN. Two drawings, and the difference between them is the
 * whole of Amos's wait.
 *
 *   lid on   — a tank with a fitted lid and a stone on top of it
 *   lid off  — the lid leaning against the side, the mouth open, and
 *              the water in it black and absolutely still
 *
 * THE-WAITS §5: you have walked the crease, both faces, so you know
 * where any water on this sheet would actually go. Come back holding
 * that and the lid comes off and stays off. **He has decided to find
 * out.** The game does not say whether that is despair or nerve, so
 * neither does the drawing: nothing about the open tank is triumphant
 * and nothing about it is a ruin.
 */
export function cisternTexture(seed: number, lidOn: boolean): THREE.CanvasTexture {
  const W = 256;
  const H = 224;
  return makeTexture(W, H, seed, (ctx, r) => {
    /* A TANK, and round 1 drew it as a cottage: a flat lid laid on a
     * box is a pitched roof and nothing else. What makes a cistern a
     * cistern is that its TOP IS A RING seen from slightly above — so
     * the rim is the one curve allowed in this file, and it is allowed
     * because it is a level line bent by perspective rather than a
     * curve anybody drew. The staves are straight. The hoops are level
     * arcs, which is this land's own mark applied to a round thing. */
    const rim: [number, number][] = [];
    for (let k = 0; k <= 20; k++) {
      const a = (k / 20) * Math.PI * 2;
      rim.push([128 + Math.cos(a) * 88, 100 + Math.sin(a) * 26]);
    }
    const body: [number, number][] = [[40, 100], [40, 208], [216, 208], [216, 100]];
    fillPoly(ctx, body, BONE, 0.56);
    fillPoly(ctx, rim, BONE, 0.7);
    hardPoly(ctx, [[40, 100], [40, 208]], r, { width: 3.0, alpha: 0.92 }, false);
    hardPoly(ctx, [[216, 100], [216, 208]], r, { width: 3.0, alpha: 0.92 }, false);
    // the foot: the near half of the base's ring, and nothing else
    stroke(ctx, [[40, 202], [80, 216], [128, 220], [178, 215], [216, 202]], r,
      { width: 2.8, alpha: 0.9 });
    stroke(ctx, rim, r, { width: 2.8, alpha: 0.92 });
    // three hoops, each the near half of a level ring
    for (const y of [130, 162, 194]) {
      stroke(ctx, [[40, y - 6], [82, y + 4], [128, y + 7], [176, y + 3], [216, y - 6]], r,
        { width: 2.0, alpha: 0.5, passes: 1, color: TIN });
    }
    for (let x = 58; x < 212; x += 24) {
      line(ctx, x, 104 + Math.abs(x - 128) * 0.07, x + 1, 208, r,
        { width: 1.1, alpha: 0.22, passes: 1 }, 3);
    }
    if (lidOn) {
      // the lid: a disc laid ON the ring, a little proud of it
      const lid: [number, number][] = [];
      for (let k = 0; k <= 20; k++) {
        const a = (k / 20) * Math.PI * 2;
        lid.push([128 + Math.cos(a) * 84, 96 + Math.sin(a) * 24]);
      }
      fillPoly(ctx, lid, BONE, 0.82);
      stroke(ctx, lid, r, { width: 2.6, alpha: 0.9 });
      line(ctx, 60, 96, 196, 96, r, { width: 1.3, alpha: 0.3, passes: 1 }, 5);
      // the stone that holds it down, and it is a good stone
      fillPoly(ctx, [[112, 84], [126, 68], [150, 72], [152, 88], [126, 94]], DUST, 0.55);
      hardPoly(ctx, [[112, 84], [126, 68], [150, 72], [152, 88], [126, 94]], r,
        { width: 2.0, alpha: 0.8, jitter: 1.4 });
    } else {
      // the mouth, open. The water is not drawn as water: it is the one
      // place on this sheet the pen simply stopped.
      // the mouth, open. The water is not drawn as water: it is the one
      // place on this sheet the pen simply stopped.
      const mouth: [number, number][] = [];
      for (let k = 0; k <= 20; k++) {
        const a = (k / 20) * Math.PI * 2;
        mouth.push([128 + Math.cos(a) * 80, 102 + Math.sin(a) * 22]);
      }
      fillPoly(ctx, mouth, '#3f4552', 0.76);
      stroke(ctx, mouth, r, { width: 2.6, alpha: 0.9 });
      // one level highlight on it, dead straight, because still water is
      // the only straight thing in the Bleach Flats
      line(ctx, 76, 102, 180, 102, r, { width: 1.6, alpha: 0.42, passes: 1, color: BONE }, 5);
      // and the lid, leaning where a careful man would lean it
      const lid: [number, number][] = [[212, 210], [238, 106], [252, 110], [228, 212]];
      fillPoly(ctx, lid, BONE, 0.66);
      hardPoly(ctx, lid, r, { width: 2.6, alpha: 0.88 });
    }
    pale(ctx, W, H, 0, 0.32, 0.22);
    feather(ctx, W, H, 10);
  });
}

/**
 * THE RAIN TABLE — a board ruled into columns, with nothing in any of
 * them (`THE-STRANGERS` U22).
 *
 * The rules are drawn and the headings are not, because there is no
 * writing in this game outside the lettering engine and because a
 * heading would be a joke and this is not one. What it is, is a table
 * somebody ruled up ready.
 *
 * NO COUNT, NO LIST, NO NUMBER — the columns are empty and they are
 * empty forever; there is nothing here for a player to tally.
 */
export function rainTableTexture(seed: number): THREE.CanvasTexture {
  const W = 160;
  const H = 192;
  return makeTexture(W, H, seed, (ctx, r) => {
    line(ctx, 76, 188, 78, 104, r, { width: 3.6, alpha: 0.88, color: TIMBER });
    const board: [number, number][] = [[14, 40], [146, 34], [148, 112], [16, 118]];
    fillPoly(ctx, board, BONE, 0.68);
    hardPoly(ctx, board, r, { width: 2.8, alpha: 0.92 });
    // the rules: four down, six across, and not one entry
    for (let k = 1; k < 4; k++) {
      const t = k / 4;
      line(ctx, 14 + 132 * t, 40 - 6 * t, 16 + 132 * t, 118 - 6 * t, r,
        { width: 1.4, alpha: 0.55, passes: 1 }, 3);
    }
    for (let k = 1; k < 7; k++) {
      const t = k / 7;
      line(ctx, 14 + 2 * t, 40 + 78 * t, 146 + 2 * t, 34 + 78 * t, r,
        { width: 1.4, alpha: 0.5, passes: 1 }, 4);
    }
    pale(ctx, W, H, 0, 0.34, 0.24);
  });
}

/**
 * AMOS. Three drawings, one at a time.
 *
 *   0  carrying, and it shows — two cans, shoulders down, one hip out
 *   1  standing at the tank with a hand on it
 *   2  down at the gutter's far end with both hands in it
 *
 * The carrying pose is the only one anybody will ever see him in and
 * only if they are out at night, which is the point (`THE-STRANGERS`
 * C21: *Amos, with two full cans, going the other way*).
 */
export function amosTexture(seed: number, pose: 0 | 1 | 2): THREE.CanvasTexture {
  return makeTexture(112, 184, seed, (ctx, r) => {
    /* Round 1 of the texture gate drew all three as stick figures. The
     * people in this world are cloth first: a filled coat, a real head
     * and limbs with some pen in them (`textures-farm.ts`, Joan). No
     * face, so the BODY does all of it — and Amos's body is a man who
     * has carried something heavy for a long time and has stopped
     * noticing. */
    const HAT = { width: 1.7, alpha: 0.72 };
    if (pose === 0) {
      /* CARRYING. Shoulders pulled down and out, both arms dead
       * straight, the head forward of the feet, and one hip out. Every
       * line in this drawing is doing the weight. */
      const cx = 54;
      scribbleCircle(ctx, cx + 3, 40, 12, r, { width: 2, alpha: 0.85 }, 1.05);
      stroke(ctx, [[cx - 11, 38], [cx - 6, 25], [cx + 14, 25], [cx + 17, 38]], r, HAT);
      fillPoly(ctx, [[cx - 17, 58], [cx - 20, 122], [cx + 19, 122], [cx + 15, 58]], DUST, 0.34);
      hardPoly(ctx, [[cx - 17, 58], [cx - 20, 122], [cx + 19, 122], [cx + 15, 58]], r,
        { width: 2, alpha: 0.84 });
      // the arms: straight down, and longer than they should be
      stroke(ctx, [[cx - 16, 62], [cx - 26, 96], [cx - 28, 128]], r, { width: 2.2, alpha: 0.86 });
      stroke(ctx, [[cx + 14, 62], [cx + 25, 96], [cx + 27, 128]], r, { width: 2.2, alpha: 0.86 });
      for (const x of [cx - 28, cx + 27]) {
        const can: [number, number][] = [[x - 11, 172], [x - 10, 132], [x + 10, 132], [x + 11, 172]];
        fillPoly(ctx, can, TIN, 0.42);
        hardPoly(ctx, can, r, { width: 2.2, alpha: 0.88 });
        line(ctx, x - 9, 148, x + 9, 148, r, { width: 1.1, alpha: 0.34, passes: 1 }, 2);
        stroke(ctx, [[x - 8, 132], [x, 125], [x + 8, 132]], r, { width: 1.8, alpha: 0.72 });
      }
      line(ctx, cx - 10, 118, cx - 14, 176, r, { width: 2.4, alpha: 0.86 });
      line(ctx, cx + 9, 118, cx + 13, 176, r, { width: 2.4, alpha: 0.86 });
    } else if (pose === 1) {
      /* A HAND ON THE TANK, and it is the only affectionate thing
       * anybody does in the Bleach Flats. */
      const cx = 50;
      scribbleCircle(ctx, cx, 40, 12, r, { width: 2, alpha: 0.85 }, 1.05);
      stroke(ctx, [[cx - 14, 38], [cx - 10, 25], [cx + 10, 25], [cx + 14, 38]], r, HAT);
      fillPoly(ctx, [[cx - 16, 58], [cx - 20, 124], [cx + 18, 124], [cx + 14, 58]], DUST, 0.34);
      hardPoly(ctx, [[cx - 16, 58], [cx - 20, 124], [cx + 18, 124], [cx + 14, 58]], r,
        { width: 2, alpha: 0.84 });
      stroke(ctx, [[cx + 14, 64], [cx + 36, 78], [cx + 52, 84]], r, { width: 2.1, alpha: 0.86 });
      stroke(ctx, [[cx - 15, 64], [cx - 25, 94], [cx - 20, 118]], r, { width: 2.1, alpha: 0.84 });
      line(ctx, cx - 11, 120, cx - 15, 176, r, { width: 2.4, alpha: 0.86 });
      line(ctx, cx + 9, 120, cx + 13, 176, r, { width: 2.4, alpha: 0.86 });
    } else {
      /* DOWN AT THE GUTTER, both hands in it. The maintenance pose, and
       * the reason the catch is in the order it is in. */
      /* Round 2: the first version put the coat over the head and the
       * legs behind the coat and the whole thing read as a wilting
       * flower. Order matters — the LEGS go down first, then the coat
       * on top of their tops, then the head clear of both. */
      /* Round 2 bent him at the hips with his head at knee height and
       * at forty units he read as an ANIMAL. A person crouching keeps
       * their head UP: the back goes down, the head stays at chest
       * height, and the two things that say human are the vertical neck
       * and the hat above it. */
      line(ctx, 42, 132, 34, 178, r, { width: 2.5, alpha: 0.88 });
      line(ctx, 58, 134, 68, 178, r, { width: 2.4, alpha: 0.86 });
      fillPoly(ctx, [[36, 138], [42, 86], [72, 82], [78, 118], [50, 144]], DUST, 0.4);
      hardPoly(ctx, [[36, 138], [42, 86], [72, 82], [78, 118]], r,
        { width: 2.0, alpha: 0.8, passes: 1 }, false);
      stroke(ctx, [[42, 128], [50, 96], [64, 84], [70, 74]], r, { width: 3.2, alpha: 0.9 });
      stroke(ctx, [[70, 90], [82, 116], [78, 142]], r, { width: 2.2, alpha: 0.88 });
      stroke(ctx, [[62, 88], [58, 116], [66, 142]], r, { width: 2.0, alpha: 0.8 });
      scribbleCircle(ctx, 74, 62, 12, r, { width: 2, alpha: 0.88 }, 1.05);
      stroke(ctx, [[61, 60], [68, 47], [86, 49]], r, HAT);
    }
    pale(ctx, 112, 184, 0, 0.3, 0.2);
  });
}

/** ONE CAN, standing at the side of the track. He leaves one at each
 *  end, because carrying an empty can forty units is work for nothing.
 *  Nobody will ever be told that. */
export function waterCanTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(64, 88, seed, (ctx, r) => {
    const can: [number, number][] = [[15, 84], [17, 28], [46, 28], [48, 84]];
    fillPoly(ctx, can, TIN, 0.46);
    hardPoly(ctx, can, r, { width: 2.4, alpha: 0.92 });
    for (const y of [44, 62]) line(ctx, 18, y, 46, y, r, { width: 1.1, alpha: 0.34, passes: 1 }, 2);
    stroke(ctx, [[20, 26], [32, 16], [44, 26]], r, { width: 2.0, alpha: 0.75 });
    pale(ctx, 64, 88, 0, 0.34, 0.24);
  });
}

/**
 * THE DUST DEVIL — the land's one responsive motion.
 *
 * A thin column of lifted grit that crosses the Flats on its own
 * business and moves AWAY from anybody who walks at it. It is the only
 * thing out here that goes anywhere, and you cannot reach it, and that
 * is `THE-WAITS` §5's belief drawn instead of written: *the answer is
 * elsewhere.*
 *
 * Two drawings so it can turn over without a second canvas per instance.
 */
export function dustDevilTexture(seed: number, pose: 0 | 1): THREE.CanvasTexture {
  const W = 128;
  const H = 288;
  return makeTexture(W, H, seed, (ctx, r) => {
    /* Round 1 stacked twenty-two level rules and drew a barcode. A
     * dust devil is a THREAD that climbs: one continuous stroke going
     * round and up, drawn four times at different radii and phases, so
     * it reads as something turning rather than as something layered.
     * It is drawn in pencil, never ink, because it is not solid. */
    const lean = pose === 0 ? 20 : -16;
    for (let s = 0; s < 3; s++) {
      const pts: [number, number][] = [];
      const turns = 1.5 + s * 0.55;
      const phase = pose * 1.7 + s * 2.3;
      for (let k = 0; k <= 40; k++) {
        const t = k / 40;
        const y = 284 - t * 268;
        const rad = (4 + t * t * 40) * (0.6 + s * 0.2);
        const cx = 64 + lean * t * t;
        pts.push([cx + Math.cos(t * turns * Math.PI * 2 + phase) * rad, y]);
      }
      stroke(ctx, pts, r, {
        width: 1.7 - s * 0.35, alpha: 0.19 - s * 0.04, passes: 1,
        jitter: 3.4, color: PENCIL,
      });
    }
    // the skirt at the bottom, where it is actually picking things up
    for (let k = 0; k < 5; k++) {
      const y = 268 - k * 7;
      const w = 26 - k * 3;
      line(ctx, 64 - w, y, 64 + w, y + (r() - 0.5) * 4, r,
        { width: 1.2, alpha: 0.14, passes: 1, color: DUST }, 3);
    }
    // and the grains actually leaving the ground, which is the only
    // part of it that is not a suggestion
    for (let k = 0; k < 9; k++) {
      const x = 44 + r() * 42;
      line(ctx, x, 284, x + (r() - 0.5) * 16, 244 - r() * 34, r,
        { width: 0.9, alpha: 0.26, passes: 1, color: DUST }, 2);
    }
    pale(ctx, W, H, 0.0, 0.85, 0.3);
  });
}

/** A tumbleweed. Kept from the draft, redrawn: its scribble runs
 *  ACROSS, so even the one round thing in this land obeys the grain. */
export function flatsTumbleweedTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(112, 112, seed, (ctx, r) => {
    for (let k = 0; k < 11; k++) {
      const y = 20 + r() * 72;
      const w = 18 + r() * 34;
      stroke(ctx, [[56 - w, y], [56 - w * 0.2, y + (r() - 0.5) * 18], [56 + w * 0.4, y + (r() - 0.5) * 16], [56 + w, y]],
        r, { width: 1.1, alpha: 0.34 + r() * 0.2, passes: 1, jitter: 3, color: DUST });
    }
    scribbleCircle(ctx, 56, 56, 44, r, { width: 1.2, alpha: 0.28, jitter: 4, passes: 1 }, 1.3);
  });
}

/** The skull, kept from the draft and cut down: no horns, no eye
 *  sockets facing you, and lying on its side, which is how a bone
 *  actually ends up on flat ground. */
export function flatsBoneTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(112, 64, seed, (ctx, r) => {
    const p: [number, number][] = [[16, 54], [12, 36], [30, 22], [64, 18], [92, 28], [96, 46], [72, 58], [36, 60]];
    fillPoly(ctx, p, BONE, 0.6);
    hardPoly(ctx, p, r, { width: 2.0, alpha: 0.84, jitter: 1.6 });
    for (const y of [34, 44]) line(ctx, 30, y, 84, y + 2, r, { width: 1.0, alpha: 0.26, passes: 1 }, 3);
  });
}
