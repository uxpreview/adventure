import * as THREE from 'three';
import {
  makeTexture, stroke, line, scribbleCircle, hatch, lettering, letteringFit, type Ctx2D,
} from '../engine/ink';
import { INK, PENCIL } from '../engine/palette';

/**
 * THINGS TO DO — the prop box. Monsters (three, two or three poses
 * each, on one sheet apiece), the ink stamp and its impression, the
 * scoreboard sign, the office plane, the tarn stone, and the two worn
 * things the pillar hands out. Procedural ballpoint; no assets.
 */

const DARK = '#2a2d38';
const STAMP_RED = '#b0433a';
const WOOD = '#b9a888';
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

function poly(ctx: Ctx2D, pts: [number, number][], r: () => number, o: Parameters<typeof stroke>[3] = {}) {
  stroke(ctx, [...pts, pts[0]], r, o);
}

/** A dense scribble inside a blob: the pen going round and round. */
function scribbleBlob(ctx: Ctx2D, cx: number, cy: number, rx: number, ry: number, r: () => number, turns: number, o: Parameters<typeof stroke>[3]) {
  const pts: [number, number][] = [];
  const n = Math.floor(turns * 14);
  for (let i = 0; i <= n; i++) {
    const a = (i / 14) * Math.PI * 2;
    const k = 0.55 + 0.45 * ((i * 7919) % 13) / 13;
    pts.push([cx + Math.cos(a) * rx * k * (0.9 + r() * 0.2), cy + Math.sin(a) * ry * k * (0.9 + r() * 0.2)]);
  }
  stroke(ctx, pts, r, o);
}

function eye(ctx: Ctx2D, x: number, y: number, rad: number, r: () => number, look = 0) {
  fillPoly(ctx, [[x - rad, y - rad * 0.7], [x + rad, y - rad * 0.7], [x + rad, y + rad * 0.7], [x - rad, y + rad * 0.7]], '#f3efe4', 0.95);
  scribbleCircle(ctx, x, y, rad, r, { width: 1.6, alpha: 0.9 }, 1.05);
  scribbleCircle(ctx, x + look * rad * 0.35, y, rad * 0.42, r, { width: 1.4, alpha: 0.95, color: INK }, 1.2);
}

export const MONSTER_FRAMES = 3;
export const MONSTER_FW = 128;
export const MONSTER_FH = 160;

export type MonsterKind = 'pine' | 'cut' | 'pier';

/**
 * ONE SHEET PER MONSTER, three frames: lurk, run A, run B. Drawn wide
 * and low so a sprite three units wide reads at twenty.
 */
export function monsterSheet(kind: MonsterKind, seed: number): THREE.CanvasTexture {
  const tex = makeTexture(MONSTER_FW * MONSTER_FRAMES, MONSTER_FH, seed, (ctx, r) => {
    for (let f = 0; f < MONSTER_FRAMES; f++) {
      ctx.save();
      ctx.translate(f * MONSTER_FW, 0);
      drawMonster(ctx, kind, f as 0 | 1 | 2, r);
      ctx.restore();
    }
  });
  tex.repeat.set(1 / MONSTER_FRAMES, 1);
  tex.wrapS = THREE.ClampToEdgeWrapping;
  return tex;
}

function drawMonster(ctx: Ctx2D, kind: MonsterKind, pose: 0 | 1 | 2, r: () => number) {
  const cx = MONSTER_FW / 2;
  const foot = MONSTER_FH - 8;
  const run = pose !== 0;
  const s = pose === 1 ? 1 : -1;
  const o = { width: 2.2, alpha: 0.9, jitter: 1.4 };
  if (kind === 'pine') {
    /* THE PINE THING: a shaggy black scribble the shape of a pine, too
     * many small eyes, two stick legs and boots. The wood, walking. */
    const top = run ? 30 : 22;
    const body: [number, number][] = [[cx, top], [cx + 46, foot - 34], [cx + 30, foot - 30], [cx - 30, foot - 30], [cx - 46, foot - 34]];
    fillPoly(ctx, body, DARK, 0.82);
    for (let i = 0; i < 9; i++) {
      const y = top + 12 + i * 11;
      const w = 6 + i * 4.6;
      stroke(ctx, [[cx - w, y + 4], [cx - w * 0.5, y - 2], [cx, y + 3], [cx + w * 0.5, y - 2], [cx + w, y + 4]], r, { width: 2.6, alpha: 0.86, jitter: 2.2, color: INK });
    }
    hatch(ctx, cx - 44, top, 88, foot - 30 - top, 1.1, 4.5, r, { width: 1.4, alpha: 0.35, color: INK });
    // eyes: five, not paired, at heights that do not agree
    const eyes: [number, number, number][] = [[cx - 18, 78, 5], [cx + 14, 70, 6], [cx - 4, 96, 4.5], [cx + 26, 98, 4], [cx - 28, 104, 3.5]];
    for (const [x, y, rad] of eyes) eye(ctx, x, y + (run ? 3 : 0), rad, r, run ? -s : 0);
    // the grin, wide and pleased
    stroke(ctx, [[cx - 22, 118], [cx - 8, 126], [cx + 10, 126], [cx + 24, 117]], r, { width: 2.2, alpha: 0.9, color: '#f3efe4' });
    for (let i = 0; i < 5; i++) line(ctx, cx - 16 + i * 8, 121 + (i % 2), cx - 16 + i * 8, 127, r, { width: 1.5, alpha: 0.8, color: '#f3efe4', passes: 1 });
    // legs and boots
    const lift = run ? 10 : 0;
    stroke(ctx, [[cx - 14, foot - 30], [cx - 18 - (run ? 10 * s : 0), foot - 6 - (s > 0 ? lift : 0)]], r, o);
    stroke(ctx, [[cx + 14, foot - 30], [cx + 18 + (run ? 10 * s : 0), foot - 6 - (s < 0 ? lift : 0)]], r, o);
    const bootL = cx - 18 - (run ? 10 * s : 0);
    const bootR = cx + 18 + (run ? 10 * s : 0);
    poly(ctx, [[bootL - 10, foot - 6 - (s > 0 ? lift : 0)], [bootL + 8, foot - 6 - (s > 0 ? lift : 0)], [bootL + 10, foot - (s > 0 ? lift : 0)], [bootL - 12, foot - (s > 0 ? lift : 0)]], r, { width: 2, alpha: 0.9 });
    poly(ctx, [[bootR - 8, foot - 6 - (s < 0 ? lift : 0)], [bootR + 10, foot - 6 - (s < 0 ? lift : 0)], [bootR + 12, foot - (s < 0 ? lift : 0)], [bootR - 10, foot - (s < 0 ? lift : 0)]], r, { width: 2, alpha: 0.9 });
  } else if (kind === 'cut') {
    /* THE CUT LURKER: a flat wide slab of rock with a lid of an eye on
     * a stalk, a mouth full of pebbles, and crab legs. It is the floor
     * of the canyon until it is not. */
    const y0 = foot - 60;
    const slab: [number, number][] = [[cx - 56, foot - 22], [cx - 50, y0 + 8], [cx - 20, y0], [cx + 24, y0 + 2], [cx + 54, y0 + 14], [cx + 58, foot - 22], [cx + 40, foot - 16], [cx - 40, foot - 16]];
    fillPoly(ctx, slab, '#8e8478', 0.7);
    poly(ctx, slab, r, { width: 2.4, alpha: 0.9, jitter: 1.6 });
    hatch(ctx, cx - 52, y0, 106, 34, 0.5, 5.5, r, { width: 1.3, alpha: 0.4 });
    // the eye on a stalk, up when it has noticed you
    const stalk = run ? 34 : 14;
    stroke(ctx, [[cx + 6, y0 + 4], [cx + 10, y0 - stalk * 0.6], [cx + 4, y0 - stalk]], r, { width: 2.4, alpha: 0.9 });
    eye(ctx, cx + 4, y0 - stalk - 8, 9, r, run ? -s : 0);
    // the mouth: a slot with pebbles for teeth
    stroke(ctx, [[cx - 34, foot - 34], [cx - 10, foot - 30], [cx + 14, foot - 31], [cx + 36, foot - 36]], r, { width: 2.4, alpha: 0.92, color: INK });
    for (let i = 0; i < 6; i++) scribbleCircle(ctx, cx - 28 + i * 11, foot - 32 + (i % 2) * 3, 3, r, { width: 1.2, alpha: 0.7 });
    // six legs, splayed, scuttling
    for (let i = 0; i < 3; i++) {
      const lx = cx - 40 + i * 14;
      const rx = cx + 40 - i * 14;
      const k = run ? ((i + pose) % 2 ? 8 : -8) : 0;
      stroke(ctx, [[lx, foot - 18], [lx - 14 + k, foot - 8], [lx - 18 + k, foot]], r, o);
      stroke(ctx, [[rx, foot - 18], [rx + 14 - k, foot - 8], [rx + 18 - k, foot]], r, o);
    }
  } else {
    /* THE PIER THING: a dripping tangle of wet rope and weed, two lamp
     * eyes, and legs like a mop's. It lives in the shade under the
     * boards and comes out damp. */
    const top = run ? 40 : 52;
    scribbleBlob(ctx, cx, top + 40, 40, 36, r, 6, { width: 2.4, alpha: 0.86, jitter: 2.6, color: '#3d4a3c' });
    scribbleBlob(ctx, cx, top + 44, 36, 30, r, 5, { width: 2, alpha: 0.75, jitter: 3, color: INK });
    // weed hanging off it
    for (let i = 0; i < 7; i++) {
      const x = cx - 36 + i * 12 + r() * 4;
      stroke(ctx, [[x, top + 60], [x + (r() - 0.5) * 8, top + 84 + r() * 16], [x + (r() - 0.5) * 12, top + 104 + r() * 10]], r, { width: 1.8, alpha: 0.8, jitter: 2, color: '#3d4a3c' });
    }
    // drips
    for (let i = 0; i < 4; i++) {
      const x = cx - 30 + i * 20;
      line(ctx, x, top + 90 + i * 6, x + 1, top + 108 + i * 6, r, { width: 1.4, alpha: 0.6, color: '#5b6ee0', passes: 1 });
    }
    // two lamp eyes, round and lit
    eye(ctx, cx - 14, top + 30, 9, r, run ? -s : 0);
    eye(ctx, cx + 16, top + 34, 8, r, run ? -s : 0);
    // mop legs
    for (let i = 0; i < 5; i++) {
      const x = cx - 24 + i * 12;
      const k = run ? ((i + pose) % 2 ? 6 : -6) : 0;
      stroke(ctx, [[x, top + 70], [x + k, foot - 10], [x + k * 1.5, foot]], r, { width: 2.2, alpha: 0.88, jitter: 1.8 });
    }
  }
}

/** THE HAT IT TOOK: a generic hat with a question over it, worn by a
 *  monster at the walker's own scale. It looks good on it. */
export function stolenHatTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(80, 56, seed, (ctx, r) => {
    const crown: [number, number][] = [[22, 40], [26, 12], [54, 11], [58, 40]];
    fillPoly(ctx, crown, WOOD, 0.4);
    stroke(ctx, [...crown, crown[0]], r, { width: 2.2, alpha: 0.88 });
    stroke(ctx, [[4, 42], [22, 46], [40, 47], [58, 46], [76, 40]], r, { width: 2.6, alpha: 0.9 });
  });
}

/* ------------------------------------------------------------------ *
 * THE STAMPS
 * ------------------------------------------------------------------ */

/** THE STAMP, standing on the ground: a wooden handle on a block, a red
 *  rubber face, and a red mark on the ground beside it. */
export function stampStandeeTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(64, 96, seed, (ctx, r) => {
    // the mark it made on the paper
    ctx.save();
    ctx.translate(44, 84);
    ctx.rotate(-0.25);
    poly(ctx, [[-12, -8], [12, -8], [12, 8], [-12, 8]], r, { width: 1.6, alpha: 0.6, color: STAMP_RED, jitter: 1.5 });
    ctx.restore();
    // the block and the rubber
    fillPoly(ctx, [[8, 66], [40, 66], [40, 78], [8, 78]], WOOD, 0.5);
    poly(ctx, [[8, 66], [40, 66], [40, 78], [8, 78]], r, { width: 2, alpha: 0.9 });
    fillPoly(ctx, [[10, 78], [38, 78], [38, 86], [10, 86]], STAMP_RED, 0.75);
    line(ctx, 10, 86, 38, 87, r, { width: 2, alpha: 0.9 });
    // the handle: a knob on a waist
    fillPoly(ctx, [[19, 66], [29, 66], [27, 46], [21, 46]], WOOD, 0.5);
    stroke(ctx, [[19, 66], [21, 46], [16, 40], [16, 30], [24, 22], [32, 30], [32, 40], [27, 46], [29, 66]], r, { width: 2, alpha: 0.9 });
    hatch(ctx, 16, 24, 16, 20, 1.1, 4, r, { width: 1, alpha: 0.3 });
  });
}

/**
 * THE IMPRESSION a stamp leaves on a notebook page: a rough rounded
 * frame, the land's short name inside, red, a little crooked, uneven
 * where the ink did not take. Drawn to a canvas for the FOUND page.
 */
export function stampImpression(name: string, size: number, dpr: number): HTMLCanvasElement {
  const w = Math.ceil(size * 2.2 * dpr);
  const h = Math.ceil(size * dpr);
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d')!;
  let seed = 31;
  for (const ch of name) seed = (seed * 33 + ch.charCodeAt(0)) >>> 0;
  const rr = mulberry(seed);
  ctx.save();
  ctx.translate(w / 2, h / 2);
  ctx.rotate((rr() - 0.5) * 0.18);
  const rw = w * 0.44;
  const rh = h * 0.4;
  const frame: [number, number][] = [[-rw, -rh], [rw, -rh * 0.96], [rw * 0.98, rh], [-rw * 1.02, rh * 0.94]];
  poly(ctx, frame, rr, { width: 1.9 * dpr, alpha: 0.72, color: STAMP_RED, jitter: 1.6 * dpr, passes: 1 });
  poly(ctx, frame.map(([x, y]) => [x * 0.9, y * 0.82] as [number, number]), rr, { width: 1.1 * dpr, alpha: 0.5, color: STAMP_RED, jitter: 1.2 * dpr, passes: 1 });
  letteringFit(ctx, name, -rw * 0.82, rh * 0.28, rw * 1.64, h * 0.34, rr, { width: 1.6 * dpr, alpha: 0.78, color: STAMP_RED, crooked: 0.35, tracking: 0.9 });
  // where the rubber did not take: a few pale scratches
  for (let i = 0; i < 5; i++) {
    const x = -rw + rr() * rw * 2;
    const y = -rh + rr() * rh * 2;
    line(ctx, x, y, x + 6 * dpr, y + 1, rr, { width: 2 * dpr, alpha: 0.5, color: '#f5f2ea', passes: 1 });
  }
  ctx.restore();
  c.style.width = `${w / dpr}px`;
  c.style.height = `${h / dpr}px`;
  return c;
}

function mulberry(a: number) {
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ------------------------------------------------------------------ *
 * THE SCOREBOARD
 * ------------------------------------------------------------------ */

/** A SIGN on a post, hand-lettered: a title line and a big line under
 *  it. Redrawn whenever the best changes. */
export function scoreSignTexture(seed: number, title: string, value: string, note: string): THREE.CanvasTexture {
  return makeTexture(192, 224, seed, (ctx, r) => {
    // the post
    fillPoly(ctx, [[92, 120], [100, 120], [102, 216], [90, 216]], WOOD, 0.5);
    stroke(ctx, [[92, 120], [90, 216]], r, { width: 2.2, alpha: 0.9 });
    stroke(ctx, [[100, 120], [102, 216]], r, { width: 2.2, alpha: 0.9 });
    // the board, a little off square
    const board: [number, number][] = [[10, 14], [182, 10], [184, 122], [8, 126]];
    fillPoly(ctx, board, CREAMY, 0.92);
    poly(ctx, board, r, { width: 2.6, alpha: 0.92, jitter: 1.6 });
    // two nails
    scribbleCircle(ctx, 22, 24, 2.2, r, { width: 1.2, alpha: 0.7 });
    scribbleCircle(ctx, 170, 21, 2.2, r, { width: 1.2, alpha: 0.7 });
    letteringFit(ctx, title, 20, 52, 152, 15, r, { width: 2, alpha: 0.86, crooked: 0.4, color: PENCIL });
    line(ctx, 22, 60, 170, 58, r, { width: 1.2, alpha: 0.45, color: PENCIL, passes: 1 });
    letteringFit(ctx, value, 18, 100, 156, 30, r, { width: 3, alpha: 0.92, crooked: 0.35 });
    if (note) letteringFit(ctx, note, 24, 118, 144, 10, r, { width: 1.4, alpha: 0.7, crooked: 0.4, color: PENCIL });
  });
}

/** A start or finish line across a road: chalk dashes and a word. */
export function raceLineDecal(seed: number, word: string): THREE.CanvasTexture {
  return makeTexture(256, 64, seed, (ctx, r) => {
    for (let i = 0; i < 12; i++) {
      const x = 8 + i * 20;
      line(ctx, x, 30, x + 12, 31, r, { width: 5, alpha: 0.7, color: '#efece2', passes: 1 });
      line(ctx, x, 30, x + 12, 31, r, { width: 2, alpha: 0.5, color: INK, passes: 1 });
    }
    letteringFit(ctx, word, 70, 20, 120, 14, r, { width: 2.2, alpha: 0.75, color: '#efece2', crooked: 0.3 });
    letteringFit(ctx, word, 70, 20, 120, 14, r, { width: 1.2, alpha: 0.5, color: INK, crooked: 0.3 });
  });
}

/* ------------------------------------------------------------------ *
 * THE TOYS' THINGS
 * ------------------------------------------------------------------ */

/** THE OFFICE PLANE: a timetable folded into a dart, ruled lines and
 *  a smudge of names still on it. */
export function officePlaneTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(96, 48, seed, (ctx, r) => {
    const body: [number, number][] = [[6, 30], [90, 14], [40, 22], [60, 40]];
    fillPoly(ctx, [[6, 30], [90, 14], [60, 40]], CREAMY, 0.92);
    stroke(ctx, [[6, 30], [90, 14]], r, { width: 1.8, alpha: 0.9 });
    stroke(ctx, [[90, 14], [60, 40], [6, 30]], r, { width: 1.8, alpha: 0.9 });
    stroke(ctx, [[90, 14], [40, 22]], r, { width: 1.2, alpha: 0.6 });
    for (let i = 0; i < 4; i++) line(ctx, 20 + i * 10, 28 - i * 2, 40 + i * 10, 24 - i * 2, r, { width: 0.9, alpha: 0.35, color: PENCIL, passes: 1 });
    void body;
  });
}

/** THE TARN STONE: flat, grey, the kind that skips. */
export function skimStoneTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(48, 32, seed, (ctx, r) => {
    const s: [number, number][] = [[6, 20], [14, 12], [30, 10], [42, 16], [40, 24], [22, 27], [8, 25]];
    fillPoly(ctx, s, '#a9a49a', 0.7);
    poly(ctx, s, r, { width: 1.8, alpha: 0.9, jitter: 1 });
    hatch(ctx, 8, 12, 32, 12, 0.6, 4, r, { width: 1, alpha: 0.3 });
  });
}

/* ------------------------------------------------------------------ *
 * THE WORN THINGS THIS PILLAR HANDS OUT
 * ------------------------------------------------------------------ */

/** MARGET'S RED SCARF: Brim's red, round the neck, two tails. */
export function redScarfTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(64, 72, seed, (ctx, r) => {
    const band: [number, number][] = [[6, 8], [58, 8], [56, 22], [8, 22]];
    fillPoly(ctx, band, STAMP_RED, 0.72);
    poly(ctx, band, r, { width: 2, alpha: 0.9 });
    const tail: [number, number][] = [[34, 22], [50, 22], [54, 64], [40, 68]];
    fillPoly(ctx, tail, STAMP_RED, 0.7);
    poly(ctx, tail, r, { width: 2, alpha: 0.9 });
    for (let i = 0; i < 4; i++) line(ctx, 40 + i * 3, 66 + (i % 2) * 2, 40 + i * 3, 71, r, { width: 1.4, alpha: 0.8, passes: 1 });
    hatch(ctx, 36, 26, 16, 36, 1.2, 4, r, { width: 1, alpha: 0.25 });
  });
}

/** THE POSTMASTER'S CAP, for all twelve stamps: a peaked cap with a
 *  red band and a small stamp mark on the front. */
export function postmasterCapTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(80, 56, seed, (ctx, r) => {
    const crown: [number, number][] = [[14, 34], [18, 14], [40, 6], [62, 14], [66, 34]];
    fillPoly(ctx, crown, '#4a5266', 0.6);
    stroke(ctx, crown, r, { width: 2.2, alpha: 0.9 });
    fillPoly(ctx, [[12, 34], [68, 34], [68, 42], [12, 42]], STAMP_RED, 0.7);
    poly(ctx, [[12, 34], [68, 34], [68, 42], [12, 42]], r, { width: 2, alpha: 0.9 });
    // the peak
    stroke(ctx, [[12, 42], [30, 50], [56, 50], [70, 42]], r, { width: 2.6, alpha: 0.92 });
    fillPoly(ctx, [[12, 42], [30, 50], [56, 50], [70, 42]], DARK, 0.5);
    // the mark on the front
    poly(ctx, [[34, 18], [48, 18], [48, 30], [34, 30]], r, { width: 1.4, alpha: 0.8, color: STAMP_RED, jitter: 1.2 });
    lettering(ctx, 'P', 36, 28, 9, r, { width: 1.4, alpha: 0.8, color: STAMP_RED, crooked: 0.3 });
  });
}
