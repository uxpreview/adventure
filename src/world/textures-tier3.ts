import type * as THREE from 'three';
import { makeTexture, stroke, line, scribbleCircle, hatch, letteringFit, type Ctx2D } from '../engine/ink';

/**
 * TIER 3's DRAWINGS (`design/foundation/08` §9, promises 7 to 9).
 *
 * Amos's rain table in its four states — the one line in pencil gone
 * white, the same line come up dark in the wet, the date painted over
 * it in his own big hand, and the board rubbed clean — and Amos sat on
 * the edge of his apron. Pye's boat and Wren's punt with nobody in them
 * but you, oars out; the eighth pot's float with its lamp on a pole;
 * the eighth pot come up, on the sand; a lamp on a post at the catch.
 *
 * Ballpoint and wash, and nothing here is an image.
 */

const TIMBER = '#7a6a51';
const BONE = '#e6dcc2';
const DUST = '#a8977a';
const PAINT = '#8f4a52';
const WET = '#6f6758';
const HULL = '#8a5a3a';
const CREAM = '#efe6cf';
const RED = '#8f4a52';
const FLAME = '#c8913c';

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

/** An edge drawn as an edge: the corners stay corners (see
 *  `textures-flats.ts` hardPoly for why). */
function hardPoly(ctx: Ctx2D, pts: [number, number][], r: () => number, o: Parameters<typeof stroke>[3] = {}) {
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    line(ctx, a[0], a[1], b[0], b[1], r, o);
  }
}

/**
 * THE RAIN TABLE, Tier 3. The same board as ever — four columns, six
 * rows, on a post — drawn bigger than before, because it is the thing a
 * promise sends you to and a thing you have to find must read from
 * every bearing.
 *
 *   faint   one line near the foot of the first column, pencil gone
 *           white in fourteen summers of sun: you can see there is
 *           writing and not what it says
 *   wet     the board dark with water, and the line come up black in
 *           his hand: RAIN. ALL NIGHT. I'LL SEE TO IT.
 *   dated   and over the top of the first column, in Amos's paint, the
 *           date, big: IT RAINED
 *   rubbed  the board dark and clean, with a smear where a line was
 */
export function rainTableTexture3(seed: number, state: 'faint' | 'wet' | 'dated' | 'rubbed'): THREE.CanvasTexture {
  const W = 200;
  const H = 240;
  return makeTexture(W, H, seed, (ctx, r) => {
    line(ctx, 98, 236, 100, 128, r, { width: 4.2, alpha: 0.9, color: TIMBER });
    const board: [number, number][] = [[14, 36], [186, 28], [188, 138], [16, 146]];
    const wet = state !== 'faint';
    fillPoly(ctx, board, wet ? WET : BONE, wet ? 0.42 : 0.7);
    hardPoly(ctx, board, r, { width: 3, alpha: 0.92 });
    // the rules: four down, six across
    for (let k = 1; k < 4; k++) {
      const t = k / 4;
      line(ctx, 14 + 172 * t, 36 - 8 * t, 16 + 172 * t, 146 - 8 * t, r, { width: 1.5, alpha: 0.55, passes: 1 }, 3);
    }
    for (let k = 1; k < 7; k++) {
      const t = k / 7;
      line(ctx, 14 + 2 * t, 36 + 110 * t, 186 + 2 * t, 28 + 110 * t, r, { width: 1.4, alpha: 0.5, passes: 1 }, 4);
    }
    // THE ONE LINE, at the foot of the first column, across two cells
    if (state === 'faint') {
      for (let k = 0; k < 3; k++) {
        stroke(ctx, [[22, 128 + k * 1.5], [40, 126 + k], [62, 129], [84, 126 + k]], r, { width: 1.1, alpha: 0.16, passes: 1, jitter: 1.4 });
      }
    } else if (state === 'wet' || state === 'dated') {
      letteringFit(ctx, 'RAIN. ALL NIGHT.', 22, 122, 92, 9, r, { alpha: 0.92, crooked: 0.6 });
      letteringFit(ctx, 'I\'LL SEE TO IT.', 22, 136, 92, 8, r, { alpha: 0.88, crooked: 0.7 });
    } else {
      // rubbed: a thumb's width of grey where a line was
      ctx.save();
      ctx.globalAlpha = 0.22;
      ctx.fillStyle = '#3f3a33';
      ctx.beginPath();
      ctx.ellipse(56, 128, 40, 8, -0.05, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    if (state === 'dated') {
      letteringFit(ctx, 'IT RAINED', 24, 70, 150, 26, r, { alpha: 0.95, crooked: 0.4, color: PAINT });
      letteringFit(ctx, 'THE NIGHT BEFORE THE GATHERING', 24, 96, 156, 11, r, { alpha: 0.85, crooked: 0.5, color: PAINT });
    }
    // drips off the foot of a wet board
    if (wet) for (let k = 0; k < 4; k++) line(ctx, 40 + k * 38, 146 - k * 2, 41 + k * 38, 156 - k * 2, r, { width: 1.2, alpha: 0.3, passes: 1 });
  });
}

/** AMOS, SAT ON THE EDGE OF HIS APRON with his hands between his
 *  knees, watching somebody else carry his water. The one drawing of
 *  him not doing anything, and it is the cost. */
export function amosSatTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(112, 184, seed, (ctx, r) => {
    const cx = 52;
    const HAT = { width: 1.7, alpha: 0.72 };
    // the shins down first, then the thighs level, then the coat over
    line(ctx, cx + 22, 138, cx + 26, 178, r, { width: 2.4, alpha: 0.86 });
    line(ctx, cx + 8, 140, cx + 12, 178, r, { width: 2.4, alpha: 0.86 });
    stroke(ctx, [[cx - 12, 136], [cx + 8, 136], [cx + 26, 138]], r, { width: 2.4, alpha: 0.84 });
    fillPoly(ctx, [[cx - 16, 80], [cx - 20, 140], [cx + 12, 140], [cx + 12, 80]], DUST, 0.36);
    hardPoly(ctx, [[cx - 16, 80], [cx - 20, 140], [cx + 12, 140], [cx + 12, 80]], r, { width: 2, alpha: 0.84 });
    // arms down to the knees, the hands together between them
    stroke(ctx, [[cx + 10, 86], [cx + 18, 112], [cx + 16, 134]], r, { width: 2.1, alpha: 0.86 });
    stroke(ctx, [[cx - 12, 86], [cx - 2, 114], [cx + 12, 134]], r, { width: 2, alpha: 0.8 });
    scribbleCircle(ctx, cx + 14, 136, 4, r, { width: 1.4, alpha: 0.7 }, 1.1);
    // the head forward, and the hat
    scribbleCircle(ctx, cx + 2, 62, 12, r, { width: 2, alpha: 0.85 }, 1.05);
    stroke(ctx, [[cx - 12, 60], [cx - 8, 47], [cx + 12, 47], [cx + 16, 60]], r, HAT);
    // the apron's edge he is sat on
    line(ctx, 4, 142, 108, 140, r, { width: 2.2, alpha: 0.6, passes: 1 }, 3);
  });
}

/** A LAMP ON A POST, at the catch: Amos lights it at night once the
 *  date is up, so the Downs can see where the argument was won. The
 *  flame is drawn on its own drawing so the land can show it after
 *  dark only. */
export function catchLampTexture(seed: number, lit: boolean): THREE.CanvasTexture {
  return makeTexture(64, 192, seed, (ctx, r) => {
    line(ctx, 31, 188, 33, 40, r, { width: 3.2, alpha: 0.9, color: TIMBER });
    line(ctx, 33, 42, 46, 40, r, { width: 2, alpha: 0.8 });
    const box: [number, number][] = [[38, 44], [54, 44], [55, 70], [37, 70]];
    if (lit) fillPoly(ctx, box, FLAME, 0.55);
    hardPoly(ctx, box, r, { width: 1.8, alpha: 0.85 });
    if (lit) {
      ctx.save();
      const g = ctx.createRadialGradient(46, 58, 2, 46, 58, 28);
      g.addColorStop(0, 'rgba(232,180,90,0.55)');
      g.addColorStop(1, 'rgba(232,180,90,0)');
      ctx.fillStyle = g;
      ctx.fillRect(10, 26, 64, 64);
      ctx.restore();
    }
  });
}

/**
 * A BOAT WITH NOBODY IN IT BUT YOU. Pye's (a clinker hull, a pot in the
 * stern) or Wren's punt (flat, narrow, the bell's rope coiled and the
 * second mark lying across the thwarts), side on, cut off at the
 * waterline, the oars out. The walker is drawn in it by the game, not
 * here: this is only the boat.
 */
export function emptyBoatTexture(seed: number, kind: 'pye' | 'punt', cargo: boolean): THREE.CanvasTexture {
  return makeTexture(192, 96, seed, (ctx, r) => {
    const wl = 80;
    const sheer: [number, number][] = kind === 'pye'
      ? [[14, 54], [40, 46], [96, 42], [150, 46], [178, 56]]
      : [[10, 62], [30, 56], [100, 54], [170, 56], [184, 62]];
    fillPoly(ctx, [...sheer, [170, wl], [22, wl]], HULL, 0.4);
    stroke(ctx, sheer, r, { width: 2.4, alpha: 0.9 });
    stroke(ctx, [[sheer[0][0], sheer[0][1]], [22, wl]], r, { width: 2.2, alpha: 0.88 });
    stroke(ctx, [[sheer[4][0], sheer[4][1]], [170, wl]], r, { width: 2.2, alpha: 0.88 });
    line(ctx, 22, wl, 170, wl, r, { width: 2.4, alpha: 0.9 });
    if (kind === 'pye') stroke(ctx, [[26, 62], [96, 56], [166, 64]], r, { width: 1.1, alpha: 0.3, passes: 1 });
    // the oars, out either side of where the rower sits
    line(ctx, 100, 50, 146, 72, r, { width: 2, alpha: 0.82 });
    line(ctx, 96, 48, 54, 68, r, { width: 1.6, alpha: 0.5 });
    if (cargo && kind === 'pye') {
      // the eighth pot, hauled, in the stern, and a sleeve out of it
      hardPoly(ctx, [[128, 48], [130, 30], [156, 30], [158, 48]], r, { width: 1.5, alpha: 0.75 });
      hatch(ctx, 131, 32, 24, 14, 0.6, 3, r, { alpha: 0.22 });
      stroke(ctx, [[146, 36], [160, 40], [168, 52]], r, { width: 2.2, alpha: 0.7, color: '#3b3a38' });
    }
    if (cargo && kind === 'punt') {
      // the second mark, lying across the thwarts: a small bell buoy
      hardPoly(ctx, [[120, 52], [124, 36], [150, 36], [154, 52]], r, { width: 1.6, alpha: 0.8 });
      fillPoly(ctx, [[124, 36], [150, 36], [148, 30], [126, 30]], RED, 0.55);
      scribbleCircle(ctx, 137, 26, 5, r, { width: 1.4, alpha: 0.7 }, 1.1);
    }
    hatch(ctx, 24, wl + 2, 144, 12, 0.02, 4, r, { alpha: 0.15 });
  });
}

/** THE EIGHTH POT'S FLOAT: bigger than the seven's, with a pole and a
 *  flag and a lamp on top — a marker for a bearing, not a catch. */
export function eighthPotTexture(seed: number, lit: boolean): THREE.CanvasTexture {
  return makeTexture(64, 128, seed, (ctx, r) => {
    const wl = 110;
    fillPoly(ctx, [[14, wl], [12, 94], [22, 84], [42, 84], [52, 94], [50, wl]], CREAM, 0.75);
    stroke(ctx, [[14, wl], [12, 94], [22, 84], [42, 84], [52, 94], [50, wl]], r, { width: 2, alpha: 0.88 });
    line(ctx, 32, 84, 33, 22, r, { width: 1.8, alpha: 0.85 });
    fillPoly(ctx, [[33, 22], [54, 28], [33, 36]], RED, 0.7);
    const box: [number, number][] = [[26, 8], [40, 8], [41, 22], [25, 22]];
    if (lit) fillPoly(ctx, box, FLAME, 0.6);
    hardPoly(ctx, box, r, { width: 1.5, alpha: 0.85 });
    line(ctx, 14, wl, 50, wl, r, { width: 2, alpha: 0.85 });
    hatch(ctx, 12, wl + 2, 40, 12, 0.02, 3, r, { alpha: 0.16 });
  });
}

/** THE EIGHTH POT, UP: on the sand by Pye's boat, a sleeve still
 *  hanging out of it, and the float's pole laid across it. */
export function eighthPotUpTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(128, 96, seed, (ctx, r) => {
    const pot: [number, number][] = [[20, 86], [24, 36], [96, 36], [100, 86]];
    fillPoly(ctx, pot, BONE, 0.3);
    hardPoly(ctx, pot, r, { width: 2.2, alpha: 0.88 });
    for (let k = 1; k < 5; k++) line(ctx, 22 + k * 16, 38, 22 + k * 16, 86, r, { width: 1.1, alpha: 0.4, passes: 1 });
    stroke(ctx, [[22, 36], [60, 18], [98, 36]], r, { width: 1.8, alpha: 0.7 });
    line(ctx, 8, 30, 124, 50, r, { width: 1.8, alpha: 0.8 });
    fillPoly(ctx, [[112, 48], [126, 40], [124, 56]], RED, 0.6);
  });
}
