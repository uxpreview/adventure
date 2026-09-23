import * as THREE from 'three';
import { makeTexture, makeCanvas, toTexture, line, hatch, type Ctx2D } from '../engine/ink';

/**
 * THE OTHER THREE WALLS (2026-09-23, owner: option 2).
 *
 * A building used to be one card: its front. Held on its line so what
 * you see is what stops you, a card seen from the side goes to a line,
 * and a house seen along its street vanished. So a building is a paper
 * box now: the front it always had, two side walls going back from its
 * corners, and a back wall. This file draws the three new walls, in the
 * same pen as the front, from a small description of the front: where
 * its ground, eaves and ridge fall on its canvas, and its colours.
 *
 * Every new wall is drawn at the SAME pixels per world unit as the
 * front and at the same canvas height, so a side's eave meets the
 * front's eave at the corner and the ground lines agree.
 */
export type BoxStyle = {
  /** The front canvas's size in pixels; ground, eave and ridge are y
   *  on it, measured from the top as the front was drawn. */
  canvasW: number;
  canvasH: number;
  ground: number;
  eave: number;
  ridge: number;
  wall: string;
  roof: string;
  /** gable: a pitched roof seen end-on at the front; thatch: the same,
   *  fringed; keep: battlements, with a cone-capped tower at each end
   *  whose top is `ridge` and whose cone rises to `cone`; flat: a
   *  parapet at `eave` and a flat roof behind it (an office block, a
   *  tower); lean: one pitch, rising from the front's eave (`roofBase`)
   *  to `ridge` at the back wall (a lean-to). */
  top: 'gable' | 'thatch' | 'keep' | 'flat' | 'lean';
  /** Windows along a side (a back gets one fewer, at least one). */
  windows: number;
  /** flat: that many storeys of them, one above the other. */
  floors?: number;
  /** A body on legs (a beach hut): the wall stops at this y, and the
   *  stilts go on down to `ground`. */
  floor?: number;
  /** keep only: the tower's width in front-canvas pixels, and its cone's apex y. */
  tower?: number;
  cone?: number;
  /** The frame round a window and the timbers, if the front has them. */
  timber?: string;
  /** gable and thatch: the front's roof triangle on its canvas — its
   *  two base corners' x, their y, and the apex's x (its y is `ridge`).
   *  The box's sloped roof is laid from exactly these. */
  roofL?: number;
  roofR?: number;
  roofBase?: number;
  apex?: number;
};

const GLASS = '#e9e4d2';

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

function hardPoly(ctx: Ctx2D, pts: [number, number][], r: () => number, o: Parameters<typeof line>[6] = {}) {
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    line(ctx, a[0], a[1], b[0], b[1], r, o);
  }
}

function windowsAlong(ctx: Ctx2D, r: () => number, s: BoxStyle, x0: number, x1: number, n: number) {
  if (n <= 0) return;
  const floors = s.floors ?? 1;
  if (floors > 1) {
    // a storey at a time: the same row of panes, one band per floor
    const band = (s.ground - s.eave) / floors;
    for (let f = 0; f < floors; f++) {
      windowsAlong(ctx, r, { ...s, floors: 1, eave: s.eave + band * f, ground: s.eave + band * (f + 1) }, x0, x1, n);
    }
    return;
  }
  const foot = s.floor ?? s.ground;
  const top = s.top === 'keep' ? s.eave + (foot - s.eave) * 0.25 : s.eave + (foot - s.eave) * 0.22;
  const span = x1 - x0;
  const slit = s.top === 'keep';
  const ww = slit ? Math.min(12, span / (n + 1) * 0.25) : Math.min(44, span / (n + 1) * 0.6);
  const wh = (foot - s.eave) * (slit ? 0.34 : s.top === 'flat' ? 0.5 : 0.34);
  for (let i = 1; i <= n; i++) {
    const cx = x0 + (span * i) / (n + 1);
    const pane: [number, number][] = [[cx - ww / 2, top + wh], [cx - ww / 2, top], [cx + ww / 2, top], [cx + ww / 2, top + wh]];
    fillPoly(ctx, pane, slit ? '#4a4a4a' : GLASS, slit ? 0.35 : 0.55);
    hardPoly(ctx, pane, r, { width: 1.5, alpha: 0.85, color: s.timber });
    if (!slit) line(ctx, cx, top, cx, top + wh, r, { width: 1, alpha: 0.4, passes: 1 });
  }
}

/** The wall between x0 and x1, ground to eave, with its courses. */
function wallBody(ctx: Ctx2D, r: () => number, s: BoxStyle, x0: number, x1: number) {
  if (s.floor !== undefined) {
    // on legs: the body stops at its floor, and three stilts go on down
    for (const x of [x0 + 8, (x0 + x1) / 2, x1 - 8]) {
      line(ctx, x, s.ground, x + (r() - 0.5) * 4, s.floor, r, { width: 3, alpha: 0.86 });
    }
    wallBody(ctx, r, { ...s, floor: undefined, ground: s.floor }, x0, x1);
    return;
  }
  const body: [number, number][] = [[x0, s.ground], [x0, s.eave], [x1, s.eave], [x1, s.ground]];
  fillPoly(ctx, body, s.wall, s.top === 'keep' ? 0.62 : 0.6);
  hardPoly(ctx, body, r, { width: s.top === 'keep' ? 2.8 : 2.2, alpha: 0.9, color: s.timber });
  if (s.top === 'keep') {
    // coursed stone, the keep's own register
    for (let y = s.eave + 18; y < s.ground - 4; y += 16 + r() * 8) {
      line(ctx, x0 + 3, y, x1 - 3, y + (r() - 0.5) * 2, r, { width: 1, alpha: 0.32, passes: 1 });
    }
    hatch(ctx, x0 + 4, s.ground - 50, x1 - x0 - 8, 44, 0.95, 8, r, { alpha: 0.12 });
  } else if (s.top === 'flat') {
    // a floor line at every storey, run off both ends
    const f = s.floors ?? 1;
    for (let i = 1; i < f; i++) {
      const y = s.eave + ((s.ground - s.eave) * i) / f;
      line(ctx, x0 - 4, y, x1 + 4, y + (r() - 0.5) * 1.4, r, { width: 0.9, alpha: 0.22, passes: 1 });
    }
  } else if (s.timber) {
    // a timber frame: posts every so often, one rail at the floor
    for (let x = x0 + 60; x < x1 - 30; x += 70 + r() * 20) {
      fillPoly(ctx, [[x - 5, s.eave], [x + 5, s.eave], [x + 6, s.ground], [x - 6, s.ground]], s.timber, 0.45);
    }
    line(ctx, x0, (s.eave + s.ground) / 2, x1, (s.eave + s.ground) / 2 - 1, r, { width: 3, alpha: 0.6, color: s.timber });
  } else {
    // the siding's ruled courses, as the fronts have them
    for (let y = s.eave + 8; y < s.ground - 2; y += 11) {
      line(ctx, x0 + 6, y, x1 - 6, y + (r() - 0.5) * 1.6, r, { width: 0.7, alpha: 0.16, passes: 1 });
    }
  }
}

function merlons(ctx: Ctx2D, r: () => number, x0: number, x1: number, y: number) {
  let x = x0;
  while (x < x1 - 12) {
    const mw = 11 + r() * 6;
    const mh = 11 + r() * 5;
    line(ctx, x, y, x + 1, y - mh, r, { width: 1.7, alpha: 0.85, passes: 1 });
    line(ctx, x + 1, y - mh, x + mw, y - mh - 1, r, { width: 1.7, alpha: 0.85, passes: 1 });
    line(ctx, x + mw, y - mh - 1, x + mw + 1, y, r, { width: 1.7, alpha: 0.85, passes: 1 });
    x += mw + 6 + r() * 5;
  }
}

function tower(ctx: Ctx2D, r: () => number, s: BoxStyle, x0: number, x1: number) {
  const top = s.ridge;
  const body: [number, number][] = [[x0, s.ground], [x0 + 4, top], [x1 - 4, top], [x1, s.ground]];
  fillPoly(ctx, body, s.wall, 0.66);
  hardPoly(ctx, body, r, { width: 2.9, alpha: 0.92 });
  const cone: [number, number][] = [[x0, top + 2], [(x0 + x1) / 2, s.cone ?? top - 60], [x1, top + 2]];
  fillPoly(ctx, cone, s.roof, 0.5);
  hardPoly(ctx, cone, r, { width: 2.5, alpha: 0.9 });
  const cx = (x0 + x1) / 2;
  const slit: [number, number][] = [[cx - 4, top + 70], [cx - 4, top + 30], [cx + 4, top + 30], [cx + 4, top + 70]];
  fillPoly(ctx, slit, '#4a4a4a', 0.35);
  hardPoly(ctx, slit, r, { width: 1.4, alpha: 0.8 });
}

/**
 * A SIDE: seen square-on, a side of a gabled house is its wall with the
 * roof above it as a band from the eave to the ridge, running the whole
 * depth. Of a keep, it is a curtain between two towers.
 */
function drawSide(ctx: Ctx2D, r: () => number, s: BoxStyle, W: number) {
  const m = 3;
  if (s.top === 'keep') {
    const tw = s.tower ?? 80;
    wallBody(ctx, r, s, tw - 6, W - tw + 6);
    merlons(ctx, r, tw, W - tw, s.eave);
    windowsAlong(ctx, r, s, tw, W - tw, s.windows);
    tower(ctx, r, s, m, tw);
    tower(ctx, r, s, W - tw, W - m);
    return;
  }
  if (s.top === 'lean') {
    // a lean-to's side rises with its roof: the eave at the front (the
    // canvas's left), the ridge at the back wall
    const base = s.roofBase ?? s.eave;
    const body: [number, number][] = [[m, s.ground], [m, base], [W - m, s.ridge], [W - m, s.ground]];
    fillPoly(ctx, body, s.wall, 0.6);
    hardPoly(ctx, body, r, { width: 2.4, alpha: 0.9 });
    for (let y = base + 16; y < s.ground - 6; y += 16 + r() * 6) {
      line(ctx, m + 3, y, W - m - 3, y + (r() - 0.5) * 2, r, { width: 1, alpha: 0.3, passes: 1 });
    }
    windowsAlong(ctx, r, { ...s, eave: base }, m, W - m, s.windows);
    line(ctx, 0, base - 2, W, s.ridge - 2, r, { width: 3, alpha: 0.9 });
    return;
  }
  // a gabled house's side is its wall to the eave and nothing above:
  // the roof over it is its own sloped sheet (`roofTexture`); a flat
  // roof's is its parapet
  wallBody(ctx, r, s, m, W - m);
  windowsAlong(ctx, r, s, m, W - m, s.windows);
  line(ctx, 0, s.eave, W, s.eave, r, { width: 2.4, alpha: 0.9 });
}

/** A BACK: the front's own outline — wall and gable — with windows and
 *  no door. Nobody goes in the back. */
function drawBack(ctx: Ctx2D, r: () => number, s: BoxStyle, W: number, wl: number, wr: number, ax: number) {
  if (s.top === 'keep') {
    drawSide(ctx, r, s, W);
    return;
  }
  if (s.top === 'flat' || s.top === 'lean') {
    // a flat roof's back is its wall to the parapet; a lean-to's is its
    // tall wall, all the way up to the ridge
    const t = s.top === 'lean' ? { ...s, eave: s.ridge } : s;
    wallBody(ctx, r, t, wl, wr);
    windowsAlong(ctx, r, t, wl, wr, Math.max(1, s.windows - 1));
    line(ctx, wl - 2, t.eave, wr + 2, t.eave, r, { width: 2.6, alpha: 0.92 });
    return;
  }
  wallBody(ctx, r, s, wl, wr);
  windowsAlong(ctx, r, s, wl, wr, Math.max(1, s.windows - 1));
  const base = s.roofBase ?? s.eave;
  const roof: [number, number][] = [[1, base], [ax, s.ridge], [W - 1, base]];
  fillPoly(ctx, roof, s.roof, 0.5);
  hardPoly(ctx, roof, r, { width: 2.4, alpha: 0.9 });
  if (s.top === 'thatch') {
    for (let x = 12; x < W - 12; x += 10 + r() * 6) {
      const k = x < ax ? (ax - x) / ax : (x - ax) / (W - ax);
      const y = s.ridge + (base - s.ridge) * k + 6;
      line(ctx, x, y, x + 1, base + 8 + r() * 6, r, { width: 1, alpha: 0.35, passes: 1 });
    }
  }
}

/** ONE SLOPE OF THE ROOF, eave at the bottom of the canvas and ridge at
 *  the top, running the house's depth left to right. */
function drawRoof(ctx: Ctx2D, r: () => number, s: BoxStyle, W: number, H: number) {
  const sheet: [number, number][] = [[1, H - 2], [1, 2], [W - 1, 2], [W - 1, H - 2]];
  fillPoly(ctx, sheet, s.roof, s.top === 'keep' ? 0.55 : 0.6);
  hardPoly(ctx, sheet, r, { width: 2.4, alpha: 0.9 });
  if (s.top === 'thatch') {
    for (let y = 10; y < H - 4; y += 12) {
      for (let x = 6 + r() * 8; x < W - 6; x += 9 + r() * 6) {
        line(ctx, x, y, x + 1, y + 8 + r() * 5, r, { width: 1, alpha: 0.32, passes: 1 });
      }
    }
  } else if (s.top === 'keep') {
    for (let y = 16; y < H - 6; y += 22 + r() * 6) line(ctx, 4, y, W - 4, y + (r() - 0.5) * 2, r, { width: 1, alpha: 0.28, passes: 1 });
  } else if (s.top === 'flat') {
    // felt and gravel, a plant box, and nothing anybody meant to be seen
    for (let i = 0; i < 40; i++) {
      const x = 8 + r() * (W - 16);
      const y = 8 + r() * (H - 16);
      line(ctx, x, y, x + 3 + r() * 5, y + (r() - 0.5) * 2, r, { width: 0.9, alpha: 0.22, passes: 1 });
    }
    const bx = W * (0.3 + r() * 0.3);
    const by = H * (0.3 + r() * 0.3);
    hardPoly(ctx, [[bx, by], [bx + 22, by], [bx + 22, by + 16], [bx, by + 16]], r, { width: 1.6, alpha: 0.7 });
  } else {
    // courses of slates up the slope
    for (let y = H - 14; y > 8; y -= 13) line(ctx, 4, y, W - 4, y + (r() - 0.5) * 1.4, r, { width: 0.9, alpha: 0.3, passes: 1 });
  }
  line(ctx, 1, 3, W - 1, 3, r, { width: 2.6, alpha: 0.9 });
}

/**
 * The side, back and roof of one building, drawn at the front's own
 * pixels per unit, as canvases: `box.ts` lays every building of a land
 * on one sheet (the frame budget: one draw for all of them).
 *
 * `depth` is how far back it goes; the back is `back.w` wide with its
 * wall between `wallL` and `wallR` and its apex at `apexU` (all world
 * units from its left edge); `slope` is one roof sheet, eave to ridge.
 */
export function boxPieces(
  seed: number, s: BoxStyle, frontH: number, depth: number,
  back: { w: number; wallL: number; wallR: number; apexU: number }, slope: number,
  /** How wide the roof sheet runs: the depth, unless it runs across the
   *  front (a lean-to's one pitch, a flat roof). */
  roofW = depth
): { side: HTMLCanvasElement; back: HTMLCanvasElement; roof: HTMLCanvasElement } {
  const ppu = s.canvasH / frontH;
  const px = (u: number) => Math.max(32, Math.min(1024, Math.round(u * ppu)));
  const side = makeTexture(px(depth), s.canvasH, seed, (ctx, r, w) => drawSide(ctx, r, s, w)).image as HTMLCanvasElement;
  const bw = px(back.w);
  const k = bw / back.w;
  const backC = makeTexture(bw, s.canvasH, seed + 1,
    (ctx, r, w) => drawBack(ctx, r, s, w, back.wallL * k, back.wallR * k, back.apexU * k)).image as HTMLCanvasElement;
  const roof = makeTexture(px(roofW), px(slope), seed + 2, (ctx, r, w, h) => drawRoof(ctx, r, s, w, h)).image as HTMLCanvasElement;
  return { side, back: backC, roof };
}

/** Where a piece sits on a sheet, in UV: u0, u1, v0, v1. */
export type AtlasRect = [number, number, number, number];

/**
 * ONE SHEET FOR A LAND. Every piece laid in rows no wider than `maxW`,
 * with a gutter between so a mip never bleeds one into the next.
 */
export function packSheet(pieces: HTMLCanvasElement[], maxW = 2048): { tex: THREE.CanvasTexture; rects: AtlasRect[] } {
  const G = 8;
  const place: [number, number][] = [];
  let x = G, y = G, rowH = 0, W = 0;
  for (const c of pieces) {
    if (x + c.width + G > maxW && x > G) { x = G; y += rowH + G; rowH = 0; }
    place.push([x, y]);
    x += c.width + G;
    rowH = Math.max(rowH, c.height);
    W = Math.max(W, x);
  }
  const H = y + rowH + G;
  const { canvas, ctx } = makeCanvas(W, H);
  const rects: AtlasRect[] = pieces.map((c, i) => {
    const [px, py] = place[i];
    ctx.drawImage(c, px, py);
    // canvas y runs down, v runs up
    return [px / W, (px + c.width) / W, 1 - (py + c.height) / H, 1 - py / H];
  });
  return { tex: toTexture(canvas), rects };
}

/* ================================================================== *
 * A ROW OF HOUSES (2026-09-23): Brim's terraces. A terrace is three or
 * four houses, each rolled its own eave, jetty, lean and roof as the
 * front was drawn (`townRowTexture` records them in `ROW_SHAPE`), so
 * its ends and its back are drawn from that record and not guessed.
 * ================================================================== */

/** One house of a row, in front-canvas pixels. */
export type RowHouse = {
  /** its lower walls, and its upper storey's eave */
  x0: number;
  x1: number;
  eave: number;
  /** how far the upper storey oversails, and which way it leans */
  jet: number;
  lean: number;
  /** a long ridge along the street (true) or a gable to the street */
  side: boolean;
  /** the ridge's y, and (a gable to the street) its apex's x */
  ridge: number;
  apex: number;
  stone: boolean;
};
export type RowInk = { plaster: string; stone: string; slate: string; timber: string };

/** A casement, as the front draws them. */
function casement(ctx: Ctx2D, r: () => number, x: number, y: number, w = 15, h = 20) {
  const pane: [number, number][] = [[x, y + h], [x, y], [x + w, y], [x + w, y + h]];
  fillPoly(ctx, pane, GLASS, 0.5);
  hardPoly(ctx, pane, r, { width: 1.5, alpha: 0.85 });
  line(ctx, x + w / 2, y, x + w / 2, y + h, r, { width: 0.9, alpha: 0.45, passes: 1 });
  line(ctx, x, y + h / 2, x + w, y + h / 2, r, { width: 0.9, alpha: 0.45, passes: 1 });
}

/** A house's walls between x0 and x1, ground to eave: plaster over a
 *  jetty with its timbers, or stone; `wins` casements upstairs. */
function rowWall(ctx: Ctx2D, r: () => number, hs: RowHouse, ink: RowInk, ground: number, x0: number, x1: number, wins: number) {
  const wash = hs.stone ? ink.stone : ink.plaster;
  const body: [number, number][] = [[x0, ground], [x0, hs.eave], [x1, hs.eave], [x1, ground]];
  fillPoly(ctx, body, wash, hs.stone ? 0.5 : 0.58);
  hardPoly(ctx, body, r, { width: 2.4, alpha: 0.9 });
  const jettyY = hs.eave + (ground - hs.eave) * 0.46;
  line(ctx, x0, jettyY, x1, jettyY, r, { width: 2, alpha: 0.8 });
  if (!hs.stone) {
    line(ctx, x0 + 2, hs.eave + 3, x1 - 2, hs.eave + 4, r, { width: 2, alpha: 0.7, color: ink.timber });
    const n = 2 + Math.floor((x1 - x0) / 40);
    for (let i = 1; i <= n; i++) {
      const x = x0 + ((x1 - x0) * i) / (n + 1);
      line(ctx, x, hs.eave + 3, x + (r() - 0.5) * 3, jettyY - 2, r, { width: 1.8, alpha: 0.62, color: ink.timber });
    }
    line(ctx, x0 + 3, ground - 4, x1 - 3, ground - 3, r, { width: 1.7, alpha: 0.55, color: ink.timber });
  } else {
    for (let k = 0; k < 6; k++) {
      const mx = x0 + 6 + r() * Math.max(4, x1 - x0 - 20);
      const my = hs.eave + 10 + r() * (ground - hs.eave - 24);
      line(ctx, mx, my, mx + 10 + r() * 8, my + (r() - 0.5) * 3, r, { width: 1, alpha: 0.28, passes: 1 });
    }
  }
  for (let k = 0; k < wins; k++) {
    const wx = x0 + ((x1 - x0) * (k + 1)) / (wins + 1) - 7.5 + (r() - 0.5) * 4;
    casement(ctx, r, wx, hs.eave + 14 + r() * 6);
  }
  if (x1 - x0 > 40) casement(ctx, r, x0 + (x1 - x0) * (0.3 + r() * 0.4) - 7, ground - 34, 14, 16);
}

/** THE END OF A HOUSE, seen square-on: its wall to the eave, the front
 *  at the canvas's left; a long-ridged house has its gable here. */
function drawRowSide(ctx: Ctx2D, r: () => number, hs: RowHouse, ink: RowInk, ground: number, W: number) {
  rowWall(ctx, r, hs, ink, ground, 2, W - 2, W > 90 ? 1 : 0);
  if (hs.side) {
    const gable: [number, number][] = [[0, hs.eave + 1], [W / 2, hs.ridge], [W, hs.eave + 1]];
    fillPoly(ctx, gable, hs.stone ? ink.stone : ink.plaster, 0.58);
    hardPoly(ctx, gable, r, { width: 2.3, alpha: 0.88 });
    if (!hs.stone) line(ctx, W / 2, hs.ridge + 3, W / 2 + (r() - 0.5) * 2, hs.eave, r, { width: 1.8, alpha: 0.6, color: ink.timber });
  }
  line(ctx, 0, hs.eave, W, hs.eave, r, { width: 2.4, alpha: 0.9 });
}

/** THE BACK OF THE ROW, on the front's own canvas: every house's back
 *  wall and the back of its roof, and no doors — nobody goes in the back. */
function drawRowBack(ctx: Ctx2D, r: () => number, houses: RowHouse[], ink: RowInk, ground: number) {
  for (const hs of houses) {
    const w = hs.x1 - hs.x0;
    rowWall(ctx, r, hs, ink, ground, hs.x0 + 2, hs.x1 - 2, w > 120 ? 3 : 2);
    const el = hs.x0 - hs.jet - 2 + hs.lean;
    const er = hs.x1 + hs.jet + 2 + hs.lean;
    const roof: [number, number][] = hs.side
      ? [[el, hs.eave + 1], [hs.x0 - hs.jet + 8 + hs.lean, hs.ridge], [hs.x1 + hs.jet - 8 + hs.lean, hs.ridge], [er, hs.eave + 1]]
      : [[el, hs.eave + 1], [hs.apex, hs.ridge], [er, hs.eave + 1]];
    fillPoly(ctx, roof, ink.slate, 0.42);
    hardPoly(ctx, roof, r, { width: 2.3, alpha: 0.88 });
  }
}

/**
 * A row's pieces, at its front's pixels per unit: an end for each house
 * (the row's two ends, and a party wall wherever a taller house stands
 * over a lower one), the back, and one sheet of slates for every roof.
 */
export function rowPieces(
  seed: number, houses: RowHouse[], ink: RowInk, canvasW: number, canvasH: number, ground: number,
  frontH: number, depth: number
): { sides: HTMLCanvasElement[]; back: HTMLCanvasElement; roof: HTMLCanvasElement } {
  const ppu = canvasH / frontH;
  const sw = Math.max(32, Math.round(depth * ppu));
  const sides = houses.map((hs, i) =>
    makeTexture(sw, canvasH, seed + i, (ctx, r, w) => drawRowSide(ctx, r, hs, ink, ground, w)).image as HTMLCanvasElement);
  const back = makeTexture(canvasW, canvasH, seed + 11, (ctx, r) => drawRowBack(ctx, r, houses, ink, ground)).image as HTMLCanvasElement;
  const slate: BoxStyle = {
    canvasW, canvasH, ground, eave: 0, ridge: 0, wall: ink.plaster, roof: ink.slate, top: 'gable', windows: 0,
  };
  const roof = makeTexture(sw, Math.round(sw * 0.6), seed + 12, (ctx, r, w, h) => drawRoof(ctx, r, slate, w, h)).image as HTMLCanvasElement;
  return { sides, back, roof };
}
