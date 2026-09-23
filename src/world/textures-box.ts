import * as THREE from 'three';
import { makeTexture, line, hatch, type Ctx2D } from '../engine/ink';

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
   *  whose top is `ridge` and whose cone rises to `cone`. */
  top: 'gable' | 'thatch' | 'keep';
  /** Windows along a side (a back gets one fewer, at least one). */
  windows: number;
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
  const top = s.top === 'keep' ? s.eave + (s.ground - s.eave) * 0.25 : s.eave + (s.ground - s.eave) * 0.22;
  const span = x1 - x0;
  const slit = s.top === 'keep';
  const ww = slit ? Math.min(12, span / (n + 1) * 0.25) : Math.min(44, span / (n + 1) * 0.6);
  const wh = (s.ground - s.eave) * (slit ? 0.34 : 0.34);
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
  const body: [number, number][] = [[x0, s.ground], [x0, s.eave], [x1, s.eave], [x1, s.ground]];
  fillPoly(ctx, body, s.wall, s.top === 'keep' ? 0.62 : 0.6);
  hardPoly(ctx, body, r, { width: s.top === 'keep' ? 2.8 : 2.2, alpha: 0.9, color: s.timber });
  if (s.top === 'keep') {
    // coursed stone, the keep's own register
    for (let y = s.eave + 18; y < s.ground - 4; y += 16 + r() * 8) {
      line(ctx, x0 + 3, y, x1 - 3, y + (r() - 0.5) * 2, r, { width: 1, alpha: 0.32, passes: 1 });
    }
    hatch(ctx, x0 + 4, s.ground - 50, x1 - x0 - 8, 44, 0.95, 8, r, { alpha: 0.12 });
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
  // a gabled house's side is its wall to the eave and nothing above:
  // the roof over it is its own sloped sheet (`roofTexture`)
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
  } else {
    // courses of slates up the slope
    for (let y = H - 14; y > 8; y -= 13) line(ctx, 4, y, W - 4, y + (r() - 0.5) * 1.4, r, { width: 0.9, alpha: 0.3, passes: 1 });
  }
  line(ctx, 1, 3, W - 1, 3, r, { width: 2.6, alpha: 0.9 });
}

/**
 * The side, back and roof of one building, for a front `frontH` world
 * units tall. `depth` is how far back it goes; the back is `backW` wide
 * with its wall between `wallL` and `wallR` and its apex at `apexU`
 * (all world units from its left edge); `slope` is the length of one
 * roof sheet from eave to ridge.
 */
export function boxTextures(
  seed: number, s: BoxStyle, frontH: number, depth: number,
  back: { w: number; wallL: number; wallR: number; apexU: number }, slope: number
): { side: THREE.CanvasTexture; back: THREE.CanvasTexture; roof: THREE.CanvasTexture } {
  const ppu = s.canvasH / frontH;
  const px = (u: number) => Math.max(32, Math.min(1024, Math.round(u * ppu)));
  const side = makeTexture(px(depth), s.canvasH, seed, (ctx, r, w) => drawSide(ctx, r, s, w));
  const bw = px(back.w);
  const k = bw / back.w;
  const backTex = makeTexture(bw, s.canvasH, seed + 1,
    (ctx, r, w) => drawBack(ctx, r, s, w, back.wallL * k, back.wallR * k, back.apexU * k));
  const roof = makeTexture(px(depth), px(slope), seed + 2, (ctx, r, w, h) => drawRoof(ctx, r, s, w, h));
  return { side, back: backTex, roof };
}
