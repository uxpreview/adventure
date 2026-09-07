import * as THREE from 'three';
import {
  makeTexture, stroke, line, scribbleCircle, hatch, readPixels, type Ctx2D,
} from '../engine/ink';
import { INK, PENCIL, WASH } from '../engine/palette';

/**
 * THE INTERIORS' prop box (Session 23, `rooms.ts`, `WORLD-SYSTEMS` §11).
 *
 * Three rooms and the things in them, drawn under one rule: **a room is
 * a plan and an elevation on the same page.** The floor is a decal — a
 * plan, seen from above, boards or flags with the wear drawn into
 * them. The far wall is a standee — an elevation, the wall as you would
 * draw it face-on, with its window or its rack. The side walls are the
 * same kind of drawing turned edge-on, so the camera sees them as two
 * lines running away from it, which is exactly what a draughtsman's
 * section does. Three or four objects a room, and every one a cutout
 * standing on the floor plan.
 *
 * Three registers, because three lands: Val's is `textures-now`'s
 * closed shapes and the kettle-and-net-curtains warmth of `THE-WAITS`
 * §3; Marget's is Brim's dark oak over plaster; the loft is
 * Greyweather's cold stone and one colour, which is the red.
 *
 * Nothing in here is about the paper or the pen. A room is a room.
 */

const TIMBER = '#4a4038';
const PLASTER = '#e8dfc8';
const RED = '#8f4a52';
const CREAM = '#efe6cf';
const BOARD = '#c9b088';
const FLAG = '#b9b7b2';
const GLASS = '#e9e4d2';
const WARM = '#e8b878';
const NIGHT_GLASS = '#8592b8';
const PAPER_WALL = '#e3dccb';
const IRON = '#8d8a84';
const ENAMEL = '#dfe3e0';

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

/** A polygon with corners on it: `stroke()` rounds every corner it is
 *  given, and a room is made of corners. */
function hardPoly(ctx: Ctx2D, pts: [number, number][], r: () => number,
  o: Parameters<typeof stroke>[3] = {}, close = true) {
  const n = close ? pts.length : pts.length - 1;
  for (let i = 0; i < n; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    line(ctx, a[0], a[1], b[0], b[1], r, o);
  }
}

function stain(ctx: Ctx2D, cx: number, cy: number, rad: number, color: string, alpha: number) {
  const g = ctx.createRadialGradient(cx, cy, rad * 0.05, cx, cy, rad);
  const rgb = color.replace('#', '');
  const c = [0, 2, 4].map((i) => parseInt(rgb.slice(i, i + 2), 16)).join(',');
  g.addColorStop(0, `rgba(${c},${alpha})`);
  g.addColorStop(0.6, `rgba(${c},${alpha * 0.55})`);
  g.addColorStop(1, `rgba(${c},0)`);
  ctx.fillStyle = g;
  ctx.fillRect(cx - rad, cy - rad, rad * 2, rad * 2);
}

/** Soften a decal's own border so a floor has no rectangle round it
 *  where the walls are not. */
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
 * THE FLOORS — plans. North is the top of the canvas, the door is at
 * the bottom edge, and the wear runs from the door to wherever the
 * person in the room actually stands.
 * ================================================================== */

/** VAL'S: boards running north–south, a rug in the middle of them,
 *  and the boards worn pale in a line from the door to the range. */
export function boardFloorDecal(seed: number): THREE.CanvasTexture {
  return makeTexture(320, 208, seed, (ctx, r, w, h) => {
    fillPoly(ctx, [[0, 0], [w, 0], [w, h], [0, h]], BOARD, 0.34);
    // the boards: ruled, and the only repeated mark in the room
    for (let x = 12; x < w; x += 22 + r() * 6) {
      line(ctx, x, 4, x + (r() - 0.5) * 2, h - 4, r, { width: 1.1, alpha: 0.32, passes: 1 });
      // a board end here and there
      if (r() > 0.6) line(ctx, x, 40 + r() * 120, x + 22, 41 + r() * 120, r, { width: 0.9, alpha: 0.28, passes: 1 });
    }
    // the wear: from the door up the middle, no edge on it
    stain(ctx, w * 0.5, h * 0.7, 46, CREAM, 0.5);
    stain(ctx, w * 0.5, h * 0.4, 40, CREAM, 0.4);
    // the rug, a closed shape, fringed at both ends, off-square
    const rug: [number, number][] = [[92, 62], [230, 58], [232, 150], [90, 154]];
    fillPoly(ctx, rug, '#b0645e', 0.34);
    hardPoly(ctx, rug, r, { width: 1.6, alpha: 0.7 });
    for (let i = 0; i < 12; i++) {
      line(ctx, 92 - 2, 66 + i * 7, 84, 66 + i * 7 + (r() - 0.5) * 2, r, { width: 0.9, alpha: 0.5, passes: 1 });
      line(ctx, 232, 62 + i * 7, 240, 62 + i * 7 + (r() - 0.5) * 2, r, { width: 0.9, alpha: 0.5, passes: 1 });
    }
    hatch(ctx, 104, 74, 116, 66, 0.4, 9, r, { alpha: 0.12, width: 1 });
    feather(ctx, w, h, 10);
  });
}

/** MARGET'S: flags, laid by somebody who did not have a rule, and the
 *  strip from the door to the table worn smooth. */
export function flagFloorDecal(seed: number): THREE.CanvasTexture {
  return makeTexture(320, 208, seed, (ctx, r, w, h) => {
    fillPoly(ctx, [[0, 0], [w, 0], [w, h], [0, h]], FLAG, 0.3);
    let y = 6;
    while (y < h - 8) {
      const rowH = 34 + r() * 14;
      let x = 4 + (r() - 0.5) * 20;
      while (x < w - 6) {
        const fw = 40 + r() * 30;
        const pts: [number, number][] = [
          [x + (r() - 0.5) * 3, y + (r() - 0.5) * 3], [x + fw, y + (r() - 0.5) * 3],
          [x + fw + (r() - 0.5) * 3, y + rowH], [x, y + rowH + (r() - 0.5) * 3],
        ];
        hardPoly(ctx, pts, r, { width: 1.2, alpha: 0.42, passes: 1 });
        if (r() > 0.7) fillPoly(ctx, pts, PENCIL, 0.06);
        x += fw + 3;
      }
      y += rowH + 3;
    }
    stain(ctx, w * 0.5, h * 0.75, 40, CREAM, 0.55);
    stain(ctx, w * 0.42, h * 0.42, 44, CREAM, 0.45);
    feather(ctx, w, h, 10);
  });
}

/** THE LOFT: boards, and one corner of them gone red for good, where
 *  the vat has stood since the vat was made. */
export function loftFloorDecal(seed: number): THREE.CanvasTexture {
  return makeTexture(320, 208, seed, (ctx, r, w, h) => {
    fillPoly(ctx, [[0, 0], [w, 0], [w, h], [0, h]], FLAG, 0.42);
    for (let x = 8; x < w; x += 26 + r() * 8) {
      line(ctx, x, 4, x + (r() - 0.5) * 3, h - 4, r, { width: 1.2, alpha: 0.3, passes: 1 });
    }
    // the red, worn into the boards under the vat: a stain with no
    // edge, and a ring where the vat's foot is
    stain(ctx, 62, 74, 62, RED, 0.5);
    stain(ctx, 70, 84, 30, RED, 0.35);
    scribbleCircle(ctx, 62, 74, 30, r, { width: 1.4, alpha: 0.35, color: RED }, 1.4);
    // drips, from the vat to the rack, the way a wet banner goes
    for (let i = 0; i < 9; i++) {
      scribbleCircle(ctx, 90 + i * 22 + (r() - 0.5) * 8, 60 + (r() - 0.5) * 22, 2 + r() * 2.4, r, { width: 1, alpha: 0.4, color: RED }, 1.1);
    }
    stain(ctx, w * 0.5, h * 0.72, 40, CREAM, 0.5);
    feather(ctx, w, h, 10);
  });
}

/* ================================================================== *
 * THE CUT WALL — a house's own ink, and nothing else.
 *
 * The front of a house is the wall the section cuts, and a section
 * draws a cut wall as LINE: the outline survives, the wash does not.
 * Rather than draw a second front for every house (and every house a
 * later session gives a door), this reads the house's own drawing back
 * and keeps only what the pen put there — every pixel dark enough to
 * be ink comes through as pencil, every wash and every fill drops out.
 * The result is the under-drawing a draughtsman would have left on the
 * page before the wash went on, which is exactly what a cut wall on a
 * plan should look like, and it is the same drawing as the house.
 * ================================================================== */
export function pencilGhostTexture(src: THREE.Texture): THREE.CanvasTexture {
  const img = src.image as HTMLCanvasElement;
  /* ---- PEN: read at half size through a CPU canvas — the GPU readback
   * of three house fronts was 18 of the 42 seconds to the title ---- */
  const from = readPixels(img, 0.5);
  const w = from.width;
  const h = from.height;
  const out = document.createElement('canvas');
  out.width = w;
  out.height = h;
  const ctx = out.getContext('2d')!;
  const to = ctx.createImageData(w, h);
  const pr = parseInt(PENCIL.slice(1, 3), 16);
  const pg = parseInt(PENCIL.slice(3, 5), 16);
  const pb = parseInt(PENCIL.slice(5, 7), 16);
  const d = from.data;
  const o = to.data;
  for (let i = 0; i < d.length; i += 4) {
    const a = d[i + 3] / 255;
    if (a < 0.05) continue;
    const lum = (0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]) / 255;
    // ink is dark; a wash is light. The threshold sits where the
    // darkest wash in the game (Greyweather's stone at 0.6) still
    // drops out and the lightest pen mark (a hatch at 0.3) survives.
    const ink = Math.max(0, Math.min(1, ((1 - lum) * a - 0.38) / 0.3));
    if (ink <= 0) continue;
    o[i] = pr; o[i + 1] = pg; o[i + 2] = pb; o[i + 3] = Math.round(ink * 255);
  }
  ctx.putImageData(to, 0, 0);
  const tex = new THREE.CanvasTexture(out);
  tex.colorSpace = src.colorSpace;
  tex.minFilter = src.minFilter;
  tex.magFilter = src.magFilter;
  tex.generateMipmaps = src.generateMipmaps;
  tex.anisotropy = src.anisotropy;
  tex.needsUpdate = true;
  return tex;
}

/* ================================================================== *
 * THE WALLS — elevations. The far wall face-on; a side wall is the
 * same kind of drawing stood edge-on to the camera, and it is a
 * barrier as well as a picture.
 * ================================================================== */

/** VAL'S FAR WALL: papered, a window over the sink with the net
 *  curtain across it, a clock, a shelf with three mugs. `night` puts
 *  the dark in the window and nothing else. */
export function valWallTexture(seed: number, night: boolean): THREE.CanvasTexture {
  return makeTexture(512, 164, seed, (ctx, r, w, h) => {
    fillPoly(ctx, [[0, 0], [w, 0], [w, h], [0, h]], PAPER_WALL, 0.7);
    // the paper: a small repeat, faint, and it does not line up at the corner
    for (let y = 14; y < h - 20; y += 26) {
      for (let x = 12 + (y % 52 === 14 ? 0 : 13); x < w - 8; x += 26) {
        scribbleCircle(ctx, x, y, 3, r, { width: 0.8, alpha: 0.13, color: '#8c9a7a' }, 0.8);
      }
    }
    // the skirting and the top
    line(ctx, 0, h - 8, w, h - 9, r, { width: 2.2, alpha: 0.8 });
    line(ctx, 0, 2, w, 3, r, { width: 2.4, alpha: 0.85 });
    // the window, over the sink, with the nets drawn across it
    const win: [number, number][] = [[196, 26], [316, 26], [316, 104], [196, 104]];
    fillPoly(ctx, win, night ? NIGHT_GLASS : GLASS, night ? 0.7 : 0.6);
    hardPoly(ctx, win, r, { width: 2, alpha: 0.9 });
    line(ctx, 256, 26, 256, 104, r, { width: 1.2, alpha: 0.5, passes: 1 });
    for (let i = 0; i < 9; i++) {
      stroke(ctx, [[202 + i * 13, 30], [205 + i * 13, 62], [201 + i * 13, 100]], r, { width: 0.9, alpha: 0.3, passes: 1 });
    }
    // the sill, and a jar on it
    line(ctx, 190, 106, 322, 107, r, { width: 2.2, alpha: 0.85 });
    hardPoly(ctx, [[300, 104], [300, 88], [312, 88], [312, 104]], r, { width: 1.2, alpha: 0.7 });
    // the sink under it: a closed shape, taps, the draining board
    fillPoly(ctx, [[188, 120], [326, 120], [326, 156], [188, 156]], ENAMEL, 0.6);
    hardPoly(ctx, [[188, 120], [326, 120], [326, 156], [188, 156]], r, { width: 1.8, alpha: 0.86 });
    for (const tx of [246, 266]) {
      line(ctx, tx, 120, tx, 110, r, { width: 1.6, alpha: 0.8 });
      stroke(ctx, [[tx - 4, 110], [tx, 106], [tx + 4, 110]], r, { width: 1.4, alpha: 0.8 });
    }
    for (let i = 0; i < 5; i++) line(ctx, 296, 126 + i * 5, 320, 126 + i * 5, r, { width: 0.8, alpha: 0.4, passes: 1 });
    // the clock, and it says a time, and the time is nobody's business
    scribbleCircle(ctx, 96, 52, 22, r, { width: 2, alpha: 0.88 }, 1.0);
    line(ctx, 96, 52, 96, 36, r, { width: 1.6, alpha: 0.85 });
    line(ctx, 96, 52, 108, 58, r, { width: 1.6, alpha: 0.85 });
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      line(ctx, 96 + Math.cos(a) * 18, 52 + Math.sin(a) * 18, 96 + Math.cos(a) * 20, 52 + Math.sin(a) * 20, r, { width: 1, alpha: 0.6, passes: 1 });
    }
    // the shelf with three mugs, one of them a different mug
    line(ctx, 360, 84, 484, 82, r, { width: 2.2, alpha: 0.85 });
    line(ctx, 368, 84, 362, 96, r, { width: 1.2, alpha: 0.6, passes: 1 });
    line(ctx, 476, 82, 482, 94, r, { width: 1.2, alpha: 0.6, passes: 1 });
    for (let i = 0; i < 3; i++) {
      const mx = 378 + i * 36;
      const mug: [number, number][] = [[mx, 82], [mx, 62], [mx + 20, 62], [mx + 20, 82]];
      fillPoly(ctx, mug, i === 1 ? '#c9d6d0' : CREAM, 0.7);
      hardPoly(ctx, mug, r, { width: 1.4, alpha: 0.8 });
      stroke(ctx, [[mx + 20, 66], [mx + 27, 70], [mx + 20, 78]], r, { width: 1.2, alpha: 0.75 });
    }
    // a calendar, with a month on it and no days crossed off
    hardPoly(ctx, [[30, 96], [70, 96], [70, 144], [30, 144]], r, { width: 1.3, alpha: 0.7 });
    for (let i = 0; i < 4; i++) line(ctx, 36, 110 + i * 8, 64, 110 + i * 8, r, { width: 0.8, alpha: 0.35, passes: 1 });
    if (night) stain(ctx, 256, 66, 60, '#3a4468', 0.2);
  });
}

/** MARGET'S FAR WALL: plaster between the timbers, a shuttered
 *  window, a shelf of weights and the scale, and a hook with the apron
 *  on it at night. */
export function margetWallTexture(seed: number, apronHung: boolean): THREE.CanvasTexture {
  return makeTexture(512, 164, seed, (ctx, r, w, h) => {
    fillPoly(ctx, [[0, 0], [w, 0], [w, h], [0, h]], PLASTER, 0.72);
    // the timbers: uprights and one brace, dark oak
    for (const x of [8, 150, 300, 500]) {
      fillPoly(ctx, [[x - 6, 0], [x + 6, 0], [x + 7, h], [x - 7, h]], TIMBER, 0.5);
      line(ctx, x - 6, 0, x - 7, h, r, { width: 1.8, alpha: 0.85, color: TIMBER });
      line(ctx, x + 6, 0, x + 7, h, r, { width: 1.8, alpha: 0.85, color: TIMBER });
    }
    line(ctx, 156, 150, 294, 20, r, { width: 3.2, alpha: 0.7, color: TIMBER });
    line(ctx, 0, 3, w, 2, r, { width: 2.6, alpha: 0.88, color: TIMBER });
    line(ctx, 0, h - 6, w, h - 7, r, { width: 2.2, alpha: 0.8, color: TIMBER });
    // the window, shuttered on the inside at night and always here:
    // a market-town window is small
    const win: [number, number][] = [[340, 34], [430, 34], [430, 96], [340, 96]];
    fillPoly(ctx, win, '#b8a884', 0.5);
    hardPoly(ctx, win, r, { width: 2, alpha: 0.88 });
    for (let y = 42; y < 96; y += 9) line(ctx, 342, y, 428, y + 1, r, { width: 1, alpha: 0.4, passes: 1 });
    line(ctx, 385, 34, 385, 96, r, { width: 1.4, alpha: 0.6, passes: 1 });
    // the shelf: five weights in a row, the biggest at the left, and
    // the scale beside them, level
    line(ctx, 20, 92, 140, 90, r, { width: 2.4, alpha: 0.85, color: TIMBER });
    for (let i = 0; i < 5; i++) {
      const wx = 30 + i * 22;
      const wh = 22 - i * 3;
      const wt: [number, number][] = [[wx, 90], [wx + 2, 90 - wh], [wx + 14 - i, 90 - wh], [wx + 16 - i, 90]];
      fillPoly(ctx, wt, IRON, 0.5);
      hardPoly(ctx, wt, r, { width: 1.3, alpha: 0.8 });
      line(ctx, wx + 6, 90 - wh, wx + 8, 90 - wh - 4, r, { width: 1.2, alpha: 0.7, passes: 1 });
    }
    // the scale, hung from the timber over the shelf: a beam and two
    // pans, and the beam is level, which in this house means something
    line(ctx, 230, 24, 230, 44, r, { width: 1.4, alpha: 0.8 });
    line(ctx, 190, 44, 270, 44, r, { width: 2, alpha: 0.86 });
    for (const px of [194, 266]) {
      line(ctx, px, 44, px - 8, 76, r, { width: 1, alpha: 0.7, passes: 1 });
      line(ctx, px, 44, px + 8, 76, r, { width: 1, alpha: 0.7, passes: 1 });
      stroke(ctx, [[px - 12, 76], [px, 82], [px + 12, 76]], r, { width: 1.6, alpha: 0.85 });
    }
    // the hook, and the apron on it after dark
    line(ctx, 460, 30, 460, 40, r, { width: 2, alpha: 0.85 });
    stroke(ctx, [[460, 40], [466, 44], [462, 48]], r, { width: 1.8, alpha: 0.85 });
    if (apronHung) {
      const ap: [number, number][] = [[452, 44], [470, 44], [480, 130], [442, 130]];
      fillPoly(ctx, ap, CREAM, 0.6);
      hardPoly(ctx, ap, r, { width: 1.4, alpha: 0.72 });
      stroke(ctx, [[458, 44], [456, 90]], r, { width: 1, alpha: 0.4, passes: 1 });
    }
  });
}

/** THE LOFT'S FAR WALL: stone, a slit for light, and THE RACK — a
 *  rail with four pegs. Three bare. The fourth takes the wet one
 *  (`wetBannerTexture`, stood in front of it). Nothing else is on this
 *  wall, and that is the wall. */
export function loftWallTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(512, 164, seed, (ctx, r, w, h) => {
    fillPoly(ctx, [[0, 0], [w, 0], [w, h], [0, h]], WASH.castle, 0.55);
    // coursed stone, the mortar drawn, not the stones
    let y = 6;
    while (y < h) {
      const ch = 20 + r() * 10;
      line(ctx, 0, y, w, y + (r() - 0.5) * 2, r, { width: 1.1, alpha: 0.42, passes: 1 });
      let x = (r() * 40) | 0;
      while (x < w) {
        line(ctx, x, y, x + (r() - 0.5) * 2, y + ch, r, { width: 1, alpha: 0.36, passes: 1 });
        x += 44 + r() * 40;
      }
      y += ch;
    }
    line(ctx, 0, 3, w, 2, r, { width: 2.6, alpha: 0.9 });
    // the slit, high on the left, with the light drawn as what it
    // does to the wall under it
    hardPoly(ctx, [[60, 20], [72, 20], [72, 70], [60, 70]], r, { width: 2, alpha: 0.88 });
    fillPoly(ctx, [[61, 21], [71, 21], [71, 69], [61, 69]], CREAM, 0.7);
    hatch(ctx, 74, 24, 18, 50, 1.2, 5, r, { alpha: 0.18 });
    // THE RACK. A rail on two brackets, four pegs, and the fourth peg
    // is the one that is worn: a rail is worn where a thing is hung on
    // it every day, and only there
    line(ctx, 150, 50, 480, 48, r, { width: 3.2, alpha: 0.9, color: TIMBER });
    for (const bx of [166, 464]) {
      line(ctx, bx, 50, bx, 30, r, { width: 2, alpha: 0.8, color: TIMBER });
      line(ctx, bx, 30, bx + (bx < 300 ? 10 : -10), 50, r, { width: 1.6, alpha: 0.7, color: TIMBER });
    }
    for (let i = 0; i < 4; i++) {
      const px = 200 + i * 76;
      line(ctx, px, 50, px + 2, 68, r, { width: 3, alpha: 0.88, color: TIMBER });
      scribbleCircle(ctx, px + 2, 70, 3.2, r, { width: 1.4, alpha: 0.8, color: TIMBER }, 1);
      if (i === 3) stain(ctx, px + 2, 62, 16, RED, 0.35);
    }
    // the red, up the wall from the floor, where wet cloth has leaned
    stain(ctx, 440, h - 10, 46, RED, 0.28);
    stain(ctx, 400, h - 6, 30, RED, 0.2);
  });
}

/** A SIDE WALL, edge-on to the camera: the same wall in elevation with
 *  its skirting and one thing on it, and mostly what you see of it is
 *  its edge. `kind` is the land. */
export function sideWallTexture(seed: number, kind: 'paper' | 'plaster' | 'stone', flip = false): THREE.CanvasTexture {
  return makeTexture(256, 164, seed, (ctx, r, w, h) => {
    const fill = kind === 'paper' ? PAPER_WALL : kind === 'plaster' ? PLASTER : WASH.castle;
    fillPoly(ctx, [[0, 0], [w, 0], [w, h], [0, h]], fill, kind === 'stone' ? 0.55 : 0.7);
    line(ctx, 0, 2, w, 3, r, { width: 2.4, alpha: 0.88 });
    line(ctx, 0, h - 8, w, h - 9, r, { width: 2, alpha: 0.78 });
    // THE CUT EDGE: the wall's south end is where the section cuts it,
    // and a section is drawn with its cut face heavy and HATCHED — the
    // draughtsman's mark for a solid the plane has gone through
    const ex = flip ? w - 4 : 4;
    const bx = flip ? w - 14 : 4;
    fillPoly(ctx, [[bx, 0], [bx + 10, 0], [bx + 10, h], [bx, h]], CREAM, 0.5);
    hatch(ctx, bx, 0, 10, h, 0.78, 5, r, { alpha: 0.55, width: 1 });
    line(ctx, bx + (flip ? 0 : 10), 0, bx + (flip ? 0 : 10), h, r, { width: 1.4, alpha: 0.7 });
    line(ctx, ex, 0, ex, h, r, { width: 3.4, alpha: 0.92 });
    if (kind === 'paper') {
      for (let y = 14; y < h - 20; y += 26) {
        for (let x = 12; x < w - 8; x += 26) scribbleCircle(ctx, x, y, 3, r, { width: 0.8, alpha: 0.12, color: '#8c9a7a' }, 0.8);
      }
      // a picture, of somewhere, in a frame
      hardPoly(ctx, [[110, 40], [160, 40], [160, 80], [110, 80]], r, { width: 1.6, alpha: 0.8 });
      stroke(ctx, [[114, 72], [128, 56], [140, 66], [156, 48]], r, { width: 1, alpha: 0.5, passes: 1 });
    } else if (kind === 'plaster') {
      for (const x of [40, 210]) {
        fillPoly(ctx, [[x - 5, 0], [x + 5, 0], [x + 6, h], [x - 6, h]], TIMBER, 0.5);
      }
      line(ctx, 46, 140, 204, 30, r, { width: 3, alpha: 0.65, color: TIMBER });
    } else {
      let y = 6;
      while (y < h) {
        const ch = 20 + r() * 10;
        line(ctx, 0, y, w, y + (r() - 0.5) * 2, r, { width: 1.1, alpha: 0.4, passes: 1 });
        y += ch;
      }
    }
  });
}

/* ================================================================== *
 * THE THINGS IN THE ROOMS — three or four each, cutouts on the plan.
 * ================================================================== */

/** A KITCHEN TABLE, and what is on it: a cup (Val's, one), the cloth
 *  folded (Marget's, at night), or nothing. */
export function tableTexture(seed: number, top: 'cup' | 'cloth' | 'bare'): THREE.CanvasTexture {
  return makeTexture(192, 112, seed, (ctx, r) => {
    const topPts: [number, number][] = [[10, 44], [182, 42], [186, 56], [6, 58]];
    fillPoly(ctx, topPts, BOARD, 0.55);
    hardPoly(ctx, topPts, r, { width: 2, alpha: 0.88 });
    for (const lx of [22, 168]) {
      line(ctx, lx, 58, lx - 2, 108, r, { width: 2.2, alpha: 0.86 });
      line(ctx, lx + 6, 57, lx + 5, 106, r, { width: 1.4, alpha: 0.5, passes: 1 });
    }
    line(ctx, 22, 90, 168, 89, r, { width: 1.2, alpha: 0.5, passes: 1 });
    if (top === 'cup') {
      const mug: [number, number][] = [[112, 42], [112, 26], [128, 26], [128, 42]];
      fillPoly(ctx, mug, CREAM, 0.7);
      hardPoly(ctx, mug, r, { width: 1.4, alpha: 0.82 });
      stroke(ctx, [[128, 30], [134, 34], [128, 40]], r, { width: 1.2, alpha: 0.75 });
      // a saucer under it, which is a household that has saucers
      stroke(ctx, [[104, 43], [120, 46], [136, 43]], r, { width: 1.3, alpha: 0.7 });
    } else if (top === 'cloth') {
      // the red, folded in four, square, on the table's corner: the
      // same cloth that is on the stall by day
      const cl: [number, number][] = [[46, 42], [106, 40], [108, 30], [48, 32]];
      fillPoly(ctx, cl, RED, 0.62);
      hardPoly(ctx, cl, r, { width: 1.5, alpha: 0.8 });
      line(ctx, 47, 37, 107, 35, r, { width: 1, alpha: 0.5, passes: 1 });
      fillPoly(ctx, [[48, 32], [108, 30], [110, 22], [50, 24]], RED, 0.5);
      hardPoly(ctx, [[48, 32], [108, 30], [110, 22], [50, 24]], r, { width: 1.3, alpha: 0.7 });
    }
  });
}

/** A KITCHEN CHAIR, pulled out from the table and left. */
export function chairTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(80, 128, seed, (ctx, r) => {
    // the back: two uprights and three rails
    line(ctx, 22, 12, 18, 70, r, { width: 2.2, alpha: 0.88 });
    line(ctx, 58, 10, 62, 70, r, { width: 2.2, alpha: 0.88 });
    for (let i = 0; i < 3; i++) line(ctx, 22, 20 + i * 14, 58, 18 + i * 14, r, { width: 1.6, alpha: 0.8 });
    // the seat
    const seat: [number, number][] = [[12, 70], [68, 70], [72, 82], [8, 82]];
    fillPoly(ctx, seat, BOARD, 0.55);
    hardPoly(ctx, seat, r, { width: 1.8, alpha: 0.86 });
    for (const lx of [14, 66]) line(ctx, lx, 82, lx + (lx < 40 ? -2 : 2), 124, r, { width: 2, alpha: 0.85 });
    line(ctx, 14, 108, 66, 108, r, { width: 1.2, alpha: 0.5, passes: 1 });
  });
}

/** THE RANGE with the kettle on it. `lit` puts the fire in the box —
 *  after dark, and never when nobody is home. */
export function rangeTexture(seed: number, lit: boolean): THREE.CanvasTexture {
  return makeTexture(176, 136, seed, (ctx, r) => {
    const body: [number, number][] = [[16, 132], [16, 56], [160, 56], [160, 132]];
    fillPoly(ctx, body, '#5d5b5a', 0.55);
    hardPoly(ctx, body, r, { width: 2.2, alpha: 0.9 });
    // the hob's rail, the two doors, the flue up out of the top
    line(ctx, 10, 56, 166, 55, r, { width: 2.6, alpha: 0.9 });
    hardPoly(ctx, [[30, 70], [78, 70], [78, 116], [30, 116]], r, { width: 1.5, alpha: 0.8 });
    hardPoly(ctx, [[98, 70], [146, 70], [146, 116], [98, 116]], r, { width: 1.5, alpha: 0.8 });
    scribbleCircle(ctx, 70, 94, 2.4, r, { width: 1.2, alpha: 0.8 }, 1);
    scribbleCircle(ctx, 138, 94, 2.4, r, { width: 1.2, alpha: 0.8 }, 1);
    line(ctx, 40, 56, 40, 4, r, { width: 6, alpha: 0.55 });
    if (lit) {
      // a fire is a warm thing behind bars, and the bars are the drawing
      fillPoly(ctx, [[32, 72], [76, 72], [76, 114], [32, 114]], WARM, 0.45);
      stain(ctx, 54, 96, 30, WARM, 0.5);
      for (let i = 0; i < 4; i++) line(ctx, 38 + i * 10, 72, 38 + i * 10, 114, r, { width: 1.4, alpha: 0.7 });
    }
    // THE KETTLE, on the hob, the one the land is named after in
    // `THE-WAITS` §3: a body, a lid, a spout, a handle over the top
    const k: [number, number][] = [[96, 54], [100, 30], [136, 30], [140, 54]];
    fillPoly(ctx, k, ENAMEL, 0.7);
    hardPoly(ctx, k, r, { width: 1.8, alpha: 0.88 });
    stroke(ctx, [[100, 30], [118, 26], [136, 30]], r, { width: 1.6, alpha: 0.85 });
    stroke(ctx, [[98, 38], [86, 30], [84, 22]], r, { width: 1.8, alpha: 0.85 });
    stroke(ctx, [[104, 30], [110, 12], [128, 12], [134, 30]], r, { width: 1.6, alpha: 0.82 });
  });
}

/** THE HOOKS BY THE DOOR, with one coat on them and the other hooks
 *  bare. Nothing says whose. */
export function coatHooksTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(128, 144, seed, (ctx, r) => {
    line(ctx, 8, 22, 120, 20, r, { width: 2.4, alpha: 0.86, color: TIMBER });
    for (const hx of [24, 52, 80, 108]) {
      line(ctx, hx, 22, hx, 34, r, { width: 2, alpha: 0.85 });
      stroke(ctx, [[hx, 34], [hx + 6, 38], [hx + 2, 42]], r, { width: 1.6, alpha: 0.82 });
    }
    // the coat, on the second hook, and its own shape on the wall
    const coat: [number, number][] = [[44, 36], [60, 36], [76, 60], [78, 134], [30, 136], [30, 60]];
    fillPoly(ctx, coat, '#7a8a7e', 0.55);
    hardPoly(ctx, coat, r, { width: 1.8, alpha: 0.86 });
    line(ctx, 54, 44, 52, 128, r, { width: 1, alpha: 0.4, passes: 1 });
    for (let i = 0; i < 3; i++) scribbleCircle(ctx, 56, 60 + i * 20, 2, r, { width: 1, alpha: 0.6 }, 1);
    // a scarf over the far one, which is not a coat
    stroke(ctx, [[108, 40], [112, 70], [104, 100]], r, { width: 5, alpha: 0.5, color: '#b0645e' });
  });
}

/** A STANDING LAMP with a shade, `on` after dark. The warm thing in
 *  Val's room is this and the range, and both are on for one. */
export function standingLampTexture(seed: number, on: boolean): THREE.CanvasTexture {
  return makeTexture(96, 208, seed, (ctx, r) => {
    const shade: [number, number][] = [[30, 48], [66, 48], [80, 10], [16, 10]];
    fillPoly(ctx, shade, on ? WARM : CREAM, on ? 0.7 : 0.55);
    hardPoly(ctx, shade, r, { width: 1.8, alpha: 0.86 });
    line(ctx, 48, 48, 48, 190, r, { width: 2.4, alpha: 0.88 });
    stroke(ctx, [[20, 200], [48, 192], [76, 200]], r, { width: 2, alpha: 0.85 });
    if (on) {
      stain(ctx, 48, 40, 50, WARM, 0.5);
      stain(ctx, 48, 90, 40, WARM, 0.25);
    }
  });
}

/** MARGET'S DRESSER: shelves with the stall's own things put away on
 *  them, which is where a stall goes at night. */
export function dresserTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(192, 176, seed, (ctx, r) => {
    const body: [number, number][] = [[12, 172], [12, 8], [180, 8], [180, 172]];
    fillPoly(ctx, body, '#6a5a48', 0.5);
    hardPoly(ctx, body, r, { width: 2.2, alpha: 0.9, color: TIMBER });
    for (const y of [50, 92]) line(ctx, 14, y, 178, y - 1, r, { width: 2, alpha: 0.8, color: TIMBER });
    line(ctx, 14, 130, 178, 129, r, { width: 2.2, alpha: 0.85, color: TIMBER });
    // plates on the top shelf, on edge, a run of them and one gap
    for (let i = 0; i < 6; i++) {
      if (i === 3) continue;
      scribbleCircle(ctx, 32 + i * 26, 32, 12, r, { width: 1.4, alpha: 0.75 }, 1);
      scribbleCircle(ctx, 32 + i * 26, 32, 7, r, { width: 0.9, alpha: 0.4 }, 1);
    }
    // the second shelf: jars, and the stall's basket
    for (let i = 0; i < 3; i++) hardPoly(ctx, [[24 + i * 24, 90], [24 + i * 24, 66], [40 + i * 24, 66], [40 + i * 24, 90]], r, { width: 1.3, alpha: 0.7 });
    stroke(ctx, [[112, 90], [116, 64], [166, 64], [170, 90]], r, { width: 1.6, alpha: 0.8 });
    hatch(ctx, 116, 66, 52, 24, 0.9, 5, r, { alpha: 0.2 });
    // the drawers, two, with a knob each
    for (const dx of [14, 98]) {
      hardPoly(ctx, [[dx + 4, 136], [dx + 76, 136], [dx + 76, 166], [dx + 4, 166]], r, { width: 1.4, alpha: 0.75, color: TIMBER });
      scribbleCircle(ctx, dx + 40, 151, 3, r, { width: 1.2, alpha: 0.8 }, 1);
    }
  });
}

/** THE VAT: a tub, red inside, the paddle leaning in it. What the moat
 *  pool is a bigger one of. */
export function dyeVatTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(160, 128, seed, (ctx, r) => {
    const tub: [number, number][] = [[20, 120], [16, 44], [144, 44], [140, 120]];
    fillPoly(ctx, tub, '#a08050', 0.45);
    stroke(ctx, [[20, 120], [18, 82], [16, 44]], r, { width: 2.2, alpha: 0.88 });
    stroke(ctx, [[140, 120], [142, 82], [144, 44]], r, { width: 2.2, alpha: 0.88 });
    stroke(ctx, [[20, 120], [80, 126], [140, 120]], r, { width: 2, alpha: 0.85 });
    // the top, and the red in it, seen a little from above
    fillPoly(ctx, [[16, 44], [144, 44], [140, 36], [20, 36]], RED, 0.7);
    stroke(ctx, [[16, 44], [80, 50], [144, 44]], r, { width: 2, alpha: 0.86 });
    stroke(ctx, [[20, 36], [80, 30], [140, 36]], r, { width: 1.8, alpha: 0.8 });
    for (const y of [64, 96]) stroke(ctx, [[17, y], [80, y + 5], [143, y]], r, { width: 1.2, alpha: 0.5, passes: 1 });
    // the paddle, leaning
    line(ctx, 112, 40, 130, 4, r, { width: 3, alpha: 0.85, color: TIMBER });
    stain(ctx, 80, 122, 30, RED, 0.3);
  });
}

/** A STOOL, three legs, and the loft's only seat. */
export function stoolTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(80, 80, seed, (ctx, r) => {
    const seat: [number, number][] = [[14, 28], [66, 28], [70, 38], [10, 38]];
    fillPoly(ctx, seat, BOARD, 0.5);
    hardPoly(ctx, seat, r, { width: 1.8, alpha: 0.86 });
    line(ctx, 18, 38, 10, 76, r, { width: 2, alpha: 0.85 });
    line(ctx, 40, 38, 40, 78, r, { width: 2, alpha: 0.85 });
    line(ctx, 62, 38, 70, 76, r, { width: 2, alpha: 0.85 });
  });
}

/** THE WET BANNER, hung on the fourth peg: the same cloth the avenue
 *  flies, twice as heavy, dripping. Stood in front of the rack when
 *  somebody has carried it up. */
export function wetBannerTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(72, 176, seed, (ctx, r) => {
    const cl: [number, number][] = [[20, 8], [52, 8], [58, 150], [36, 168], [14, 150]];
    fillPoly(ctx, cl, RED, 0.62);
    stroke(ctx, [...cl, cl[0]], r, { width: 2, alpha: 0.88 });
    // wet cloth hangs in folds, and the folds are dark
    for (let i = 0; i < 3; i++) stroke(ctx, [[24 + i * 10, 12], [26 + i * 10, 80], [23 + i * 10, 146]], r, { width: 1.2, alpha: 0.45, passes: 1 });
    // the drips
    for (let i = 0; i < 5; i++) {
      const dx = 18 + r() * 36;
      line(ctx, dx, 156 + r() * 8, dx, 170 + r() * 5, r, { width: 1.4, alpha: 0.6, color: RED, passes: 1 });
    }
  });
}

/** THE SAME BANNER, in the hand: a bundle over the shoulder, dark
 *  with water, one end trailing. */
export function handBannerTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(64, 88, seed, (ctx, r) => {
    const b: [number, number][] = [[10, 40], [18, 12], [46, 8], [56, 34], [42, 60], [22, 62]];
    fillPoly(ctx, b, RED, 0.7);
    stroke(ctx, [...b, b[0]], r, { width: 2, alpha: 0.88 });
    stroke(ctx, [[22, 62], [26, 84], [34, 86]], r, { width: 3.5, alpha: 0.7, color: RED });
    stroke(ctx, [[20, 30], [40, 24]], r, { width: 1.2, alpha: 0.45, passes: 1 });
  });
}

/* ================================================================== *
 * THE FRONTS — two new houses, drawn to their lands' rules, with a
 * door in each because a door is the whole of what an interior costs
 * from outside.
 * ================================================================== */

/** MARGET'S HOUSE, in Brim's back streets: dark oak over plaster, one
 *  storey and a loft, a door with a step worn into it, one window with
 *  the shutter hooked back, and the cloth's colour nowhere on it. */
export function margetHouseTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(320, 224, seed, (ctx, r) => {
    // the wall, and its lean, which every house in Brim has
    const wall: [number, number][] = [[28, 218], [34, 96], [290, 92], [294, 218]];
    fillPoly(ctx, wall, PLASTER, 0.72);
    hardPoly(ctx, wall, r, { width: 2.4, alpha: 0.9, color: TIMBER });
    // the timbers
    for (const x of [90, 160, 232]) {
      fillPoly(ctx, [[x - 5, 96], [x + 5, 96], [x + 6, 218], [x - 6, 218]], TIMBER, 0.5);
    }
    line(ctx, 96, 210, 154, 104, r, { width: 3, alpha: 0.65, color: TIMBER });
    line(ctx, 34, 150, 290, 148, r, { width: 3, alpha: 0.7, color: TIMBER });
    // the roof: thatch, a fringe over the eaves, the ridge
    const roof: [number, number][] = [[10, 98], [160, 22], [312, 96]];
    fillPoly(ctx, [...roof, [10, 98]], '#a89468', 0.55);
    stroke(ctx, roof, r, { width: 2.8, alpha: 0.9 });
    for (let x = 30; x < 296; x += 10 + r() * 6) {
      const y = 98 - Math.abs(x - 160) * 0.5 + 6;
      line(ctx, x, y, x + 1, y + 14 + r() * 6, r, { width: 1, alpha: 0.35, passes: 1 });
    }
    line(ctx, 10, 100, 312, 98, r, { width: 2.2, alpha: 0.8 });
    // the chimney, off the ridge, with a little smoke in the mornings
    // drawn elsewhere and never here
    hardPoly(ctx, [[220, 60], [220, 30], [242, 30], [242, 72]], r, { width: 2, alpha: 0.85 });
    // THE DOOR, in the middle, and the step under it worn in a dip
    const door: [number, number][] = [[136, 218], [136, 154], [184, 154], [184, 218]];
    fillPoly(ctx, door, TIMBER, 0.62);
    hardPoly(ctx, door, r, { width: 2.2, alpha: 0.9 });
    for (let i = 0; i < 4; i++) line(ctx, 146 + i * 10, 156, 146 + i * 10, 216, r, { width: 0.9, alpha: 0.3, passes: 1, color: CREAM });
    scribbleCircle(ctx, 176, 190, 2.4, r, { width: 1.3, alpha: 0.85 }, 1);
    stroke(ctx, [[126, 218], [160, 214], [194, 218]], r, { width: 2, alpha: 0.7 });
    // the window, shutter hooked back on the left
    const win: [number, number][] = [[212, 176], [212, 118], [270, 118], [270, 176]];
    fillPoly(ctx, win, GLASS, 0.55);
    hardPoly(ctx, win, r, { width: 1.8, alpha: 0.86 });
    line(ctx, 241, 118, 241, 176, r, { width: 1.2, alpha: 0.5, passes: 1 });
    line(ctx, 212, 147, 270, 147, r, { width: 1.2, alpha: 0.5, passes: 1 });
    hardPoly(ctx, [[196, 178], [196, 116], [210, 116], [210, 178]], r, { width: 1.6, alpha: 0.8, color: TIMBER });
    for (let y = 122; y < 176; y += 9) line(ctx, 198, y, 208, y, r, { width: 0.9, alpha: 0.4, passes: 1 });
    // a bunch of something dried, over the door, which every house in
    // the back streets has and nobody has ever explained
    stroke(ctx, [[160, 134], [156, 146], [164, 146]], r, { width: 2, alpha: 0.7, color: '#8a6f3a' });
    for (let i = 0; i < 6; i++) line(ctx, 160, 140, 152 + i * 3.2, 152 + (i % 2) * 3, r, { width: 1, alpha: 0.5, passes: 1, color: '#8a6f3a' });
  });
}

/** THE LOFT'S FRONT: a lean-to of the wall's own stone, against the
 *  east tower, a plank door and a slit, the roof of it slates that do
 *  not quite reach the wall. Greyweather's register: nothing
 *  abbreviated, and the only colour is what has been carried in. */
export function loftLeanToTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(320, 160, seed, (ctx, r) => {
    const wall: [number, number][] = [[20, 156], [22, 62], [300, 66], [302, 156]];
    fillPoly(ctx, wall, WASH.castle, 0.6);
    hardPoly(ctx, wall, r, { width: 2.6, alpha: 0.92 });
    // coursed stone, mortar drawn
    let y = 70;
    while (y < 152) {
      const ch = 14 + r() * 8;
      line(ctx, 22, y, 300, y + (r() - 0.5) * 2, r, { width: 1, alpha: 0.4, passes: 1 });
      let x = 24 + r() * 30;
      while (x < 298) {
        line(ctx, x, y, x + (r() - 0.5) * 2, Math.min(152, y + ch), r, { width: 1, alpha: 0.34, passes: 1 });
        x += 30 + r() * 30;
      }
      y += ch;
    }
    // the roof: a single pitch of slates, low, the eaves heavy
    const roof: [number, number][] = [[6, 66], [40, 22], [316, 26], [316, 66]];
    fillPoly(ctx, roof, '#6f6e6c', 0.5);
    hardPoly(ctx, roof, r, { width: 2.6, alpha: 0.9 });
    for (let x = 44; x < 312; x += 16 + r() * 4) line(ctx, x, 26, x - 6, 64, r, { width: 1, alpha: 0.4, passes: 1 });
    for (let yy = 34; yy < 64; yy += 9) line(ctx, 30, yy, 316, yy + 1, r, { width: 0.9, alpha: 0.32, passes: 1 });
    // THE DOOR, planks, a bar across it that is off, and the step
    const door: [number, number][] = [[136, 156], [136, 92], [186, 92], [186, 156]];
    fillPoly(ctx, door, TIMBER, 0.55);
    hardPoly(ctx, door, r, { width: 2.2, alpha: 0.9 });
    for (let i = 1; i < 5; i++) line(ctx, 136 + i * 10, 94, 136 + i * 10, 154, r, { width: 1, alpha: 0.35, passes: 1, color: CREAM });
    line(ctx, 138, 112, 184, 110, r, { width: 2, alpha: 0.6, color: IRON });
    line(ctx, 138, 138, 184, 136, r, { width: 2, alpha: 0.6, color: IRON });
    scribbleCircle(ctx, 178, 126, 2.6, r, { width: 1.3, alpha: 0.85 }, 1);
    // the slit, and the red on the sill of it, which is the one colour
    hardPoly(ctx, [[236, 128], [236, 84], [246, 84], [246, 128]], r, { width: 1.8, alpha: 0.86 });
    hatch(ctx, 237, 86, 8, 40, 1.4, 4, r, { alpha: 0.3 });
    stain(ctx, 241, 132, 10, RED, 0.35);
    // a wet mark down the wall beside the door, where the last one leaned
    stain(ctx, 120, 140, 18, RED, 0.22);
  });
}

/* ================================================================== *
 * THE ERRANDS' THINGS (`THE-STRANGERS` Part Two).
 * ================================================================== */

/** THE CRATE (E5): shut, in the lane; open at the stall, straw in the
 *  bottom and nothing in the straw. `hand` is the same crate carried. */
export function crateTexture(seed: number, state: 'shut' | 'open' | 'hand'): THREE.CanvasTexture {
  return makeTexture(96, 80, seed, (ctx, r) => {
    const box: [number, number][] = [[14, 74], [14, 30], [82, 30], [82, 74]];
    fillPoly(ctx, box, '#c9a06a', 0.4);
    hardPoly(ctx, box, r, { width: 1.8, alpha: 0.86 });
    line(ctx, 14, 52, 82, 51, r, { width: 1, alpha: 0.4, passes: 1 });
    line(ctx, 48, 30, 48, 74, r, { width: 1, alpha: 0.4, passes: 1 });
    if (state === 'open') {
      // the lid, off, leaning; the straw, and nothing in it
      hardPoly(ctx, [[84, 74], [92, 16], [98, 18], [90, 76]], r, { width: 1.5, alpha: 0.8 });
      for (let i = 0; i < 7; i++) {
        line(ctx, 18 + r() * 60, 30, 22 + r() * 60, 24 - r() * 6, r, { width: 0.9, alpha: 0.45, passes: 1, color: '#8a6f3a' });
      }
      hatch(ctx, 16, 32, 64, 8, 0.2, 3, r, { alpha: 0.18, color: '#8a6f3a' });
    } else {
      hardPoly(ctx, [[12, 30], [12, 22], [84, 22], [84, 30]], r, { width: 1.6, alpha: 0.82 });
      if (state === 'hand') {
        stroke(ctx, [[12, 26], [4, 40], [10, 60]], r, { width: 1.8, alpha: 0.7 });
      }
    }
  });
}

/** THE SMALL BIKE (E18): a child's, on its side on a lawn four gardens
 *  from home; stood up; and leaning on the wall of the house it lives
 *  at. One drawing at three angles, and every mark on it closes,
 *  because it is Maple Court's. */
export function smallBikeTexture(seed: number, pose: 'down' | 'up' | 'parked'): THREE.CanvasTexture {
  return makeTexture(128, 96, seed, (ctx, r) => {
    const wheel = (cx: number, cy: number, rad: number) => {
      scribbleCircle(ctx, cx, cy, rad, r, { width: 1.8, alpha: 0.86 }, 1);
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI;
        line(ctx, cx - Math.cos(a) * rad, cy - Math.sin(a) * rad, cx + Math.cos(a) * rad, cy + Math.sin(a) * rad, r, { width: 0.8, alpha: 0.4, passes: 1 });
      }
    };
    if (pose === 'down') {
      // on its side: one wheel flat to us, one up, the frame between
      wheel(36, 62, 22);
      scribbleCircle(ctx, 96, 44, 12, r, { width: 1.6, alpha: 0.8 }, 0.45);
      stroke(ctx, [[36, 62], [64, 46], [92, 44]], r, { width: 2.2, alpha: 0.86, color: '#b0645e' });
      stroke(ctx, [[64, 46], [70, 30], [90, 34]], r, { width: 2, alpha: 0.8, color: '#b0645e' });
      line(ctx, 70, 30, 60, 18, r, { width: 1.6, alpha: 0.7 });
      // the grass it is on, bent under it
      for (let i = 0; i < 6; i++) line(ctx, 20 + i * 18, 84, 22 + i * 18, 76 + r() * 4, r, { width: 1, alpha: 0.4, passes: 1, color: '#8c9a7a' });
    } else {
      const lean = pose === 'parked' ? 8 : 0;
      wheel(32, 66, 22);
      wheel(96, 66, 22);
      stroke(ctx, [[32, 66], [58, 34 + lean], [96, 66]], r, { width: 2.4, alpha: 0.88, color: '#b0645e' });
      stroke(ctx, [[58, 34 + lean], [84, 36 + lean], [96, 66]], r, { width: 2.2, alpha: 0.84, color: '#b0645e' });
      stroke(ctx, [[32, 66], [50, 40 + lean], [60, 62]], r, { width: 2, alpha: 0.8, color: '#b0645e' });
      // the saddle and the bars
      stroke(ctx, [[52, 32 + lean], [64, 30 + lean]], r, { width: 3, alpha: 0.86 });
      stroke(ctx, [[84, 36 + lean], [82, 22 + lean]], r, { width: 1.8, alpha: 0.8 });
      stroke(ctx, [[74, 22 + lean], [92, 20 + lean]], r, { width: 2, alpha: 0.84 });
      // a bell on the bars, because a child's bike has one
      scribbleCircle(ctx, 78, 20 + lean, 2.6, r, { width: 1.2, alpha: 0.8 }, 1);
      if (pose === 'parked') {
        // leaning: the wall it leans on is the house, not this drawing;
        // the shadow it throws on the wall is
        stain(ctx, 64, 60, 40, INK, 0.08);
      }
    }
  });
}
