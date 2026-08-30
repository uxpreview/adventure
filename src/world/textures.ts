import * as THREE from 'three';
import {
  makeTexture, stroke, line, scribbleCircle, hatch, scribbleFill, rng, type Ctx2D,
} from '../engine/ink';
import { INK, PENCIL, WASH } from '../engine/palette';

/**
 * THE PROP BOX — every drawn thing in the world.
 *
 * All of it is ballpoint plus a light wash: fill first (a stain the
 * hand let dry), line second (the pen saying what the stain is). No
 * image assets, same as ever. Textures are seeded so two oaks are two
 * different drawings of an oak, never one drawing twice.
 */

/** A closed wobbly outline. */
function poly(
  ctx: Ctx2D, pts: [number, number][], r: () => number,
  o: Parameters<typeof stroke>[3] = {}
) {
  stroke(ctx, [...pts, pts[0]], r, o);
}

/** The stain under the line: a filled blobby polygon at low alpha. */
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
  const n = 14;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const rr = rad * (0.82 + r() * 0.36);
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * squash]);
  }
  fillPoly(ctx, pts, color, alpha);
}

/* ================== NATURE ================== */

export function oakTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(192, 224, seed, (ctx, r) => {
    // canopy stain, then scribbled leaf mass, then trunk
    fillBlob(ctx, 96, 78, 62, r, WASH.forest, 0.4);
    for (let i = 0; i < 6; i++) {
      scribbleCircle(ctx, 66 + r() * 62, 52 + r() * 52, 24 + r() * 20, r,
        { width: 1.7, alpha: 0.5, jitter: 2.4 }, 1.6);
    }
    scribbleCircle(ctx, 96, 76, 62, r, { width: 2.4, alpha: 0.8, jitter: 3 }, 1.1);
    stroke(ctx, [[88, 218], [90, 168], [84, 140], [88, 122]], r, { width: 5, alpha: 0.9 });
    stroke(ctx, [[104, 218], [102, 170], [110, 142], [102, 124]], r, { width: 4, alpha: 0.85 });
    stroke(ctx, [[96, 160], [118, 138], [132, 126]], r, { width: 2.6, alpha: 0.7 });
    stroke(ctx, [[94, 150], [72, 132], [62, 120]], r, { width: 2.4, alpha: 0.7 });
    hatch(ctx, 40, 96, 60, 34, 0.7, 7, r, { alpha: 0.24 });
  });
}

export function pineTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(128, 256, seed, (ctx, r) => {
    const tiers = 4;
    fillPoly(ctx, [[64, 8], [116, 210], [12, 210]], WASH.forest, 0.35);
    for (let t = 0; t < tiers; t++) {
      const y0 = 26 + t * 46;
      const y1 = y0 + 58;
      const w = 26 + t * 13;
      poly(ctx, [[64, y0 - 18], [64 + w, y1 - 14], [64 + w * 0.4, y1 - 18],
        [64, y1], [64 - w * 0.4, y1 - 18], [64 - w, y1 - 14]], r,
        { width: 2, alpha: 0.75, jitter: 2 });
      hatch(ctx, 64 - w, y0, w * 2, y1 - y0, 0.9, 8, r, { alpha: 0.22 });
    }
    stroke(ctx, [[62, 250], [64, 212], [64, 196]], r, { width: 4.4, alpha: 0.9 });
  });
}

export function palmTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(192, 224, seed, (ctx, r) => {
    const lean = (r() - 0.5) * 40;
    const topX = 96 + lean;
    stroke(ctx, [[96 - lean * 0.3, 218], [92, 160], [topX - 6, 96], [topX, 64]], r,
      { width: 5, alpha: 0.9, jitter: 2 });
    line(ctx, 96 - lean * 0.3 - 6, 214, 96 - lean * 0.3 + 10, 214, r, { width: 2, alpha: 0.5 });
    for (let i = 0; i < 7; i++) {
      const a = -Math.PI * 0.95 + (i / 6) * Math.PI * 0.9 + (r() - 0.5) * 0.2;
      const len = 58 + r() * 22;
      const midx = topX + Math.cos(a) * len * 0.55;
      const midy = 62 + Math.sin(a) * len * 0.4;
      const endx = topX + Math.cos(a) * len;
      const endy = 62 + Math.sin(a) * len * 0.62 + 26;
      fillPoly(ctx, [[topX, 62], [midx, midy - 5], [endx, endy]], WASH.forest, 0.28);
      stroke(ctx, [[topX, 62], [midx, midy], [endx, endy]], r, { width: 2.6, alpha: 0.8 });
      for (let f = 1; f < 5; f++) {
        const t = f / 5;
        const bx = topX + (midx - topX) * t * 1.6;
        const by = 62 + (midy - 62) * t * 1.6;
        line(ctx, bx, by, bx + (r() - 0.5) * 8, by + 12 + r() * 8, r, { width: 1.3, alpha: 0.5, passes: 1 });
      }
    }
    // coconuts
    scribbleCircle(ctx, topX - 8, 70, 6, r, { width: 1.6, alpha: 0.7 });
    scribbleCircle(ctx, topX + 7, 74, 5, r, { width: 1.6, alpha: 0.7 });
  });
}

export function cactusTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(128, 192, seed, (ctx, r) => {
    fillPoly(ctx, [[56, 184], [56, 60], [64, 40], [74, 60], [74, 184]], WASH.forest, 0.35);
    poly(ctx, [[56, 184], [56, 60], [60, 44], [68, 44], [74, 60], [74, 184]], r,
      { width: 2.4, alpha: 0.85 });
    // arms
    stroke(ctx, [[56, 110], [38, 106], [32, 88], [33, 70]], r, { width: 2.2, alpha: 0.85 });
    stroke(ctx, [[33, 70], [40, 66], [44, 76], [44, 102], [56, 106]], r, { width: 2.2, alpha: 0.8 });
    stroke(ctx, [[74, 128], [92, 122], [97, 102], [96, 88]], r, { width: 2.2, alpha: 0.85 });
    stroke(ctx, [[96, 88], [88, 84], [85, 96], [85, 118], [74, 124]], r, { width: 2.2, alpha: 0.8 });
    // ribs and spines
    for (const x of [61, 66, 71]) line(ctx, x, 60, x, 180, r, { width: 1, alpha: 0.3, passes: 1 });
    for (let i = 0; i < 22; i++) {
      const x = 54 + r() * 22;
      const y = 50 + r() * 130;
      line(ctx, x, y, x + (r() - 0.5) * 7, y - 3 - r() * 4, r, { width: 0.9, alpha: 0.5, passes: 1 });
    }
  });
}

export function boulderTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(160, 112, seed, (ctx, r) => {
    const pts: [number, number][] = [[20, 100], [16, 62], [44, 30], [92, 20], [132, 38], [146, 76], [138, 100]];
    fillPoly(ctx, pts, WASH.castle, 0.4);
    poly(ctx, pts, r, { width: 2.4, alpha: 0.85, jitter: 2 });
    stroke(ctx, [[44, 34], [58, 58], [60, 96]], r, { width: 1.4, alpha: 0.4, passes: 1 });
    hatch(ctx, 86, 40, 56, 58, 0.8, 7, r, { alpha: 0.3 });
  });
}

/** A canyon wall: one huge striated slab, drawn to stand at the cell edge. */
export function mesaTexture(seed: number, w = 512, h = 288): THREE.CanvasTexture {
  return makeTexture(w, h, seed, (ctx, r) => {
    const top: [number, number][] = [];
    const n = 10;
    for (let i = 0; i <= n; i++) {
      const x = (i / n) * (w - 20) + 10;
      top.push([x, 26 + Math.sin(i * 1.7 + seed) * 10 + r() * 12]);
    }
    const base: [number, number][] = [[w - 8, h - 6], [8, h - 6]];
    fillPoly(ctx, [...top, ...base], WASH.canyon, 0.88);
    stroke(ctx, top, r, { width: 3, alpha: 0.85, jitter: 2.6 });
    line(ctx, 10, h - 8, w - 10, h - 8, r, { width: 2.4, alpha: 0.7 });
    // strata
    for (let s = 0; s < 5; s++) {
      const y = 60 + s * ((h - 100) / 5) + r() * 10;
      const pts: [number, number][] = [];
      for (let i = 0; i <= n; i++) {
        pts.push([(i / n) * (w - 30) + 15, y + Math.sin(i * 0.9 + s) * 6 + r() * 5]);
      }
      stroke(ctx, pts, r, { width: 1.4, alpha: 0.35, passes: 1, jitter: 2 });
    }
    // vertical cracks + shadow hatch
    for (let cx = 40; cx < w - 30; cx += 70 + r() * 60) {
      stroke(ctx, [[cx, 40 + r() * 30], [cx + (r() - 0.5) * 20, h * 0.55], [cx + (r() - 0.5) * 30, h - 12]],
        r, { width: 1.6, alpha: 0.45, passes: 1 });
    }
    hatch(ctx, 12, h * 0.62, w - 24, h * 0.34, 1.2, 9, r, { alpha: 0.2 });
  });
}

export function archRockTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(288, 224, seed, (ctx, r) => {
    const outer: [number, number][] = [[30, 214], [22, 120], [52, 52], [128, 24], [212, 44],
      [252, 110], [258, 214]];
    fillPoly(ctx, outer, WASH.canyon, 0.88);
    poly(ctx, outer, r, { width: 2.8, alpha: 0.85, jitter: 2.4 });
    // the window
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.ellipse(142, 168, 58, 62, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    scribbleCircle(ctx, 142, 168, 58, r, { width: 2.4, alpha: 0.8 }, 1.05);
    for (let s = 0; s < 3; s++) {
      const y = 60 + s * 30;
      stroke(ctx, [[50, y + 10], [120, y - 6], [210, y + 8]], r, { width: 1.3, alpha: 0.35, passes: 1 });
    }
    hatch(ctx, 190, 90, 60, 110, 1.1, 8, r, { alpha: 0.24 });
  });
}

export function duneDecal(seed: number): THREE.CanvasTexture {
  return makeTexture(256, 128, seed, (ctx, r) => {
    for (let i = 0; i < 3; i++) {
      const y = 34 + i * 32 + r() * 10;
      const pts: [number, number][] = [];
      for (let x = 0; x <= 8; x++) {
        pts.push([16 + x * 28, y + Math.sin(x * 0.9 + i * 2 + seed) * 9]);
      }
      stroke(ctx, pts, r, { width: 1.8, alpha: 0.4 - i * 0.08, passes: 1, jitter: 1.6 });
    }
  });
}

export function flowersTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(96, 72, seed, (ctx, r) => {
    for (let i = 0; i < 4; i++) {
      const x = 14 + i * 22 + (r() - 0.5) * 10;
      const y = 64;
      const h = 26 + r() * 18;
      stroke(ctx, [[x, y], [x + (r() - 0.5) * 6, y - h * 0.6], [x + (r() - 0.5) * 8, y - h]], r,
        { width: 1.4, alpha: 0.7, passes: 1 });
      const c = r() > 0.5 ? '#c99a3b' : '#b06a72';
      ctx.globalAlpha = 0.75;
      ctx.fillStyle = c;
      for (let p = 0; p < 5; p++) {
        const a = (p / 5) * Math.PI * 2;
        ctx.beginPath();
        ctx.ellipse(x + Math.cos(a) * 4, y - h + Math.sin(a) * 4, 3, 2.2, a, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      scribbleCircle(ctx, x, y - h, 2.4, r, { width: 1, alpha: 0.6 });
    }
  });
}

export function bushTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(128, 96, seed, (ctx, r) => {
    fillBlob(ctx, 64, 58, 40, r, WASH.forest, 0.35, 0.72);
    for (let i = 0; i < 4; i++) {
      scribbleCircle(ctx, 40 + r() * 48, 48 + r() * 22, 16 + r() * 12, r,
        { width: 1.6, alpha: 0.55, jitter: 2 }, 1.4);
    }
    scribbleCircle(ctx, 64, 56, 40, r, { width: 2, alpha: 0.7, jitter: 2.6 }, 1.05);
  });
}

export function tumbleweedTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(96, 96, seed, (ctx, r) => {
    for (let i = 0; i < 9; i++) {
      scribbleCircle(ctx, 48 + (r() - 0.5) * 10, 50 + (r() - 0.5) * 10, 12 + r() * 22, r,
        { width: 1.1, alpha: 0.4, jitter: 3.2, passes: 1 }, 1.6);
    }
  });
}

export function skullTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(96, 80, seed, (ctx, r) => {
    fillBlob(ctx, 44, 38, 24, r, '#efece2', 0.7, 0.85);
    poly(ctx, [[22, 52], [18, 32], [30, 16], [56, 14], [70, 28], [68, 46], [58, 52],
      [56, 64], [30, 64]], r, { width: 2, alpha: 0.85 });
    scribbleCircle(ctx, 34, 38, 5, r, { width: 1.6, alpha: 0.85 });
    scribbleCircle(ctx, 52, 36, 5, r, { width: 1.6, alpha: 0.85 });
    // horns
    stroke(ctx, [[20, 34], [6, 26], [4, 12]], r, { width: 2.2, alpha: 0.8 });
    stroke(ctx, [[68, 30], [84, 24], [88, 10]], r, { width: 2.2, alpha: 0.8 });
    for (const x of [32, 40, 48]) line(ctx, x, 56, x, 63, r, { width: 1, alpha: 0.5, passes: 1 });
  });
}

/* ================== COAST & SEA ================== */

export function sailboatTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(160, 176, seed, (ctx, r) => {
    // hull
    fillPoly(ctx, [[22, 138], [138, 138], [120, 164], [40, 164]], '#8a5a3a', 0.4);
    poly(ctx, [[22, 138], [138, 138], [120, 164], [40, 164]], r, { width: 2.4, alpha: 0.9 });
    line(ctx, 30, 148, 128, 148, r, { width: 1.2, alpha: 0.4, passes: 1 });
    // mast + boom
    line(ctx, 80, 138, 82, 22, r, { width: 2.6, alpha: 0.9 });
    // main sail with a wash of sun
    fillPoly(ctx, [[84, 30], [84, 128], [134, 128]], '#efe6cf', 0.8);
    poly(ctx, [[84, 30], [84, 128], [134, 128]], r, { width: 2, alpha: 0.85 });
    fillPoly(ctx, [[76, 44], [76, 124], [38, 124]], '#e7d9bd', 0.7);
    poly(ctx, [[76, 44], [76, 124], [38, 124]], r, { width: 1.8, alpha: 0.8 });
    line(ctx, 84, 70, 120, 96, r, { width: 1, alpha: 0.35, passes: 1 });
    // pennant
    stroke(ctx, [[82, 22], [98, 26], [82, 32]], r, { width: 1.4, alpha: 0.8, passes: 1 });
  });
}

export function buoyTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(64, 96, seed, (ctx, r) => {
    fillPoly(ctx, [[20, 84], [16, 44], [32, 26], [48, 44], [44, 84]], '#b0524a', 0.55);
    poly(ctx, [[20, 84], [16, 44], [32, 26], [48, 44], [44, 84]], r, { width: 2, alpha: 0.85 });
    line(ctx, 17, 58, 47, 58, r, { width: 3, alpha: 0.5 });
    line(ctx, 32, 26, 32, 12, r, { width: 1.8, alpha: 0.8 });
    scribbleCircle(ctx, 32, 10, 4, r, { width: 1.4, alpha: 0.8 });
  });
}

export function umbrellaTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(160, 192, seed, (ctx, r) => {
    const c1 = r() > 0.5 ? '#b0524a' : '#4a7ab0';
    line(ctx, 80, 184, 84, 66, r, { width: 2.6, alpha: 0.9 });
    for (let i = 0; i < 4; i++) {
      const x0 = 16 + i * 32;
      fillPoly(ctx, [[x0, 62], [x0 + 16, 20], [x0 + 32, 62]], i % 2 ? c1 : '#efe6cf', 0.7);
    }
    poly(ctx, [[16, 62], [82, 18], [148, 62]], r, { width: 2.2, alpha: 0.85 });
    for (let i = 0; i <= 4; i++) {
      line(ctx, 16 + i * 32, 62, 82, 20, r, { width: 1.3, alpha: 0.5, passes: 1 });
    }
    stroke(ctx, [[16, 62], [30, 70], [48, 64], [66, 72], [82, 64], [100, 72], [116, 64], [134, 70], [148, 62]],
      r, { width: 1.8, alpha: 0.8, passes: 1 });
  });
}

export function beachHutTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(192, 176, seed, (ctx, r) => {
    const c = ['#7ea3ae', '#c9a06a', '#ae7e8f'][Math.floor(r() * 3)];
    // stilts
    for (const x of [36, 92, 152]) line(ctx, x, 168, x, 140, r, { width: 2.6, alpha: 0.85 });
    // body with vertical planks
    fillPoly(ctx, [[24, 142], [24, 76], [168, 76], [168, 142]], c, 0.45);
    poly(ctx, [[24, 142], [24, 76], [168, 76], [168, 142]], r, { width: 2.2, alpha: 0.9 });
    for (let x = 44; x < 168; x += 22) line(ctx, x, 78, x + (r() - 0.5) * 4, 140, r, { width: 1, alpha: 0.35, passes: 1 });
    // door + window
    poly(ctx, [[82, 142], [82, 96], [112, 96], [112, 142]], r, { width: 1.8, alpha: 0.85 });
    scribbleCircle(ctx, 140, 104, 11, r, { width: 1.6, alpha: 0.8 });
    line(ctx, 129, 104, 151, 104, r, { width: 1, alpha: 0.5, passes: 1 });
    line(ctx, 140, 93, 140, 115, r, { width: 1, alpha: 0.5, passes: 1 });
    // roof
    fillPoly(ctx, [[14, 78], [96, 34], [178, 78]], '#6a6f78', 0.4);
    poly(ctx, [[14, 78], [96, 34], [178, 78]], r, { width: 2.4, alpha: 0.9 });
    hatch(ctx, 30, 44, 130, 30, 0.55, 7, r, { alpha: 0.2 });
  });
}

export function driftwoodTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(160, 64, seed, (ctx, r) => {
    stroke(ctx, [[10, 48], [50, 38], [96, 42], [150, 30]], r, { width: 5, alpha: 0.7 });
    stroke(ctx, [[60, 40], [80, 26], [92, 20]], r, { width: 2.6, alpha: 0.6 });
    line(ctx, 20, 46, 60, 41, r, { width: 1, alpha: 0.3, passes: 1 });
  });
}

export function shellsDecal(seed: number): THREE.CanvasTexture {
  return makeTexture(128, 128, seed, (ctx, r) => {
    for (let i = 0; i < 6; i++) {
      const x = 16 + r() * 96;
      const y = 16 + r() * 96;
      const s = 4 + r() * 6;
      if (r() > 0.5) {
        // fan shell
        for (let a = 0; a < 5; a++) {
          const th = -Math.PI * 0.8 + (a / 4) * Math.PI * 0.6;
          line(ctx, x, y, x + Math.cos(th) * s * 1.6, y + Math.sin(th) * s * 1.6, r,
            { width: 1, alpha: 0.5, passes: 1 });
        }
        stroke(ctx, [[x - s, y - s * 0.4], [x, y - s * 1.5], [x + s, y - s * 0.4]], r,
          { width: 1.1, alpha: 0.55, passes: 1 });
      } else {
        scribbleCircle(ctx, x, y, s, r, { width: 1.1, alpha: 0.5 }, 2.2);
      }
    }
  });
}

export function gullTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(96, 64, seed, (ctx, r) => {
    // the two-arc doodle gull, the oldest mark in the book
    stroke(ctx, [[10, 40], [30, 22], [48, 36]], r, { width: 2.2, alpha: 0.8, passes: 1 });
    stroke(ctx, [[48, 36], [66, 20], [86, 38]], r, { width: 2.2, alpha: 0.8, passes: 1 });
  });
}

/* ================== FARM & DOWNS ================== */

export function windmillTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(224, 288, seed, (ctx, r) => {
    fillPoly(ctx, [[86, 276], [98, 120], [128, 120], [140, 276]], WASH.kingdom, 0.5);
    poly(ctx, [[86, 276], [98, 120], [128, 120], [140, 276]], r, { width: 2.6, alpha: 0.9 });
    hatch(ctx, 90, 140, 46, 130, 1.1, 9, r, { alpha: 0.2 });
    scribbleCircle(ctx, 113, 108, 16, r, { width: 2.2, alpha: 0.85 });
    // sails
    for (let i = 0; i < 4; i++) {
      const a = i * (Math.PI / 2) + 0.5;
      const ex = 113 + Math.cos(a) * 84;
      const ey = 104 + Math.sin(a) * 84;
      line(ctx, 113, 104, ex, ey, r, { width: 2.4, alpha: 0.85 });
      const px = Math.cos(a + Math.PI / 2) * 14;
      const py = Math.sin(a + Math.PI / 2) * 14;
      poly(ctx, [[113 + Math.cos(a) * 22, 104 + Math.sin(a) * 22],
        [ex, ey], [ex + px, ey + py],
        [113 + Math.cos(a) * 22 + px, 104 + Math.sin(a) * 22 + py]], r,
        { width: 1.4, alpha: 0.6, passes: 1 });
    }
    poly(ctx, [[96, 174], [96, 148], [116, 148], [116, 174]], r, { width: 1.6, alpha: 0.8 });
  });
}

export function barnTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(256, 192, seed, (ctx, r) => {
    fillPoly(ctx, [[30, 180], [30, 96], [128, 96], [128, 180]], '#a0524a', 0.5);
    poly(ctx, [[30, 180], [30, 96], [128, 96], [128, 180]], r, { width: 2.2, alpha: 0.9 });
    fillPoly(ctx, [[128, 180], [128, 96], [230, 96], [230, 180]], '#a0524a', 0.42);
    poly(ctx, [[128, 180], [128, 96], [230, 96], [230, 180]], r, { width: 2.2, alpha: 0.9 });
    fillPoly(ctx, [[20, 98], [78, 42], [138, 98]], '#6a6f78', 0.45);
    poly(ctx, [[20, 98], [78, 42], [138, 98]], r, { width: 2.4, alpha: 0.9 });
    line(ctx, 138, 98, 240, 98, r, { width: 2.2, alpha: 0.85 });
    line(ctx, 78, 44, 180, 44, r, { width: 2.2, alpha: 0.85 });
    line(ctx, 180, 44, 240, 98, r, { width: 2.2, alpha: 0.85 });
    // big cross door
    poly(ctx, [[56, 178], [56, 118], [102, 118], [102, 178]], r, { width: 2, alpha: 0.9 });
    line(ctx, 56, 118, 102, 178, r, { width: 1.4, alpha: 0.6, passes: 1 });
    line(ctx, 102, 118, 56, 178, r, { width: 1.4, alpha: 0.6, passes: 1 });
    scribbleCircle(ctx, 78, 74, 10, r, { width: 1.6, alpha: 0.8 });
    for (let x = 150; x < 230; x += 18) line(ctx, x, 100, x, 178, r, { width: 0.9, alpha: 0.3, passes: 1 });
  });
}

export function hayBaleTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(128, 96, seed, (ctx, r) => {
    fillBlob(ctx, 64, 52, 36, r, '#d3b878', 0.55, 0.9);
    scribbleCircle(ctx, 64, 52, 34, r, { width: 2.2, alpha: 0.8 }, 1.1);
    scribbleCircle(ctx, 64, 52, 22, r, { width: 1.4, alpha: 0.5 }, 1.3);
    scribbleCircle(ctx, 64, 52, 10, r, { width: 1.2, alpha: 0.45 }, 1.6);
  });
}

export function wheatDecal(seed: number): THREE.CanvasTexture {
  return makeTexture(192, 128, seed, (ctx, r) => {
    for (let i = 0; i < 26; i++) {
      const x = 10 + r() * 172;
      const y = 14 + r() * 100;
      line(ctx, x, y + 12, x + (r() - 0.5) * 5, y, r, { width: 1, alpha: 0.35, passes: 1, color: '#8a6f3a' });
      for (let g = 0; g < 4; g++) {
        line(ctx, x + (r() - 0.5) * 3, y + g * 2.4, x + 3 + (r() - 0.5) * 3, y + g * 2.4 - 3, r,
          { width: 0.8, alpha: 0.3, passes: 1, color: '#8a6f3a' });
      }
    }
  });
}

export function fenceTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(256, 96, seed, (ctx, r) => {
    for (const x of [16, 128, 240]) line(ctx, x, 88, x, 30, r, { width: 2.6, alpha: 0.85 });
    line(ctx, 10, 44, 246, 40, r, { width: 2, alpha: 0.8 });
    line(ctx, 10, 68, 246, 64, r, { width: 2, alpha: 0.8 });
  });
}

export function scarecrowTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(128, 192, seed, (ctx, r) => {
    line(ctx, 64, 184, 64, 60, r, { width: 2.8, alpha: 0.9 });
    line(ctx, 22, 92, 106, 88, r, { width: 2.4, alpha: 0.9 });
    // coat
    fillPoly(ctx, [[44, 150], [50, 96], [78, 96], [86, 150]], '#7a6a4f', 0.5);
    poly(ctx, [[44, 150], [50, 96], [78, 96], [86, 150]], r, { width: 1.8, alpha: 0.8 });
    // sacking head, stitched grin
    fillBlob(ctx, 64, 46, 17, r, '#d3b878', 0.6, 1.05);
    scribbleCircle(ctx, 64, 46, 16, r, { width: 1.8, alpha: 0.85 });
    line(ctx, 56, 42, 60, 44, r, { width: 1.4, alpha: 0.8, passes: 1 });
    line(ctx, 68, 44, 72, 42, r, { width: 1.4, alpha: 0.8, passes: 1 });
    stroke(ctx, [[56, 54], [64, 57], [72, 53]], r, { width: 1.3, alpha: 0.8, passes: 1 });
    // straw
    for (const [sx, sy] of [[22, 92], [106, 88]] as [number, number][]) {
      for (let i = 0; i < 4; i++) {
        line(ctx, sx, sy, sx + (r() - 0.5) * 14, sy + 8 + r() * 6, r, { width: 1, alpha: 0.5, passes: 1 });
      }
    }
  });
}

/* ================== KINGDOM & CASTLE ================== */

export function cottageTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(224, 192, seed, (ctx, r) => {
    const stone = r() > 0.5;
    // walls
    fillPoly(ctx, [[28, 180], [28, 92], [196, 92], [196, 180]], stone ? WASH.castle : '#e0d4b4', 0.55);
    poly(ctx, [[28, 180], [28, 92], [196, 92], [196, 180]], r, { width: 2.2, alpha: 0.9 });
    if (!stone) {
      // half-timbering
      line(ctx, 28, 132, 196, 130, r, { width: 2.4, alpha: 0.75 });
      for (const x of [66, 112, 158]) line(ctx, x, 92, x + (r() - 0.5) * 8, 180, r, { width: 2.2, alpha: 0.7 });
      line(ctx, 66, 92, 112, 130, r, { width: 1.8, alpha: 0.6, passes: 1 });
    } else {
      for (let i = 0; i < 14; i++) {
        const x = 34 + r() * 150;
        const y = 100 + r() * 70;
        poly(ctx, [[x, y], [x + 12 + r() * 8, y - 2], [x + 12 + r() * 8, y + 6], [x, y + 7]], r,
          { width: 1, alpha: 0.3, passes: 1 });
      }
    }
    // thatched / tiled roof
    fillPoly(ctx, [[14, 94], [112, 26], [210, 94]], '#b09a62', 0.6);
    poly(ctx, [[14, 94], [112, 26], [210, 94]], r, { width: 2.6, alpha: 0.9 });
    for (let i = 1; i < 4; i++) {
      stroke(ctx, [[14 + i * 22, 94 - i * 4], [112, 30 + i * 12]], r, { width: 1.2, alpha: 0.4, passes: 1 });
      stroke(ctx, [[210 - i * 22, 94 - i * 4], [112, 30 + i * 12]], r, { width: 1.2, alpha: 0.4, passes: 1 });
    }
    // door and windows
    fillPoly(ctx, [[96, 180], [96, 128], [126, 128], [126, 180]], '#6f4f34', 0.5);
    poly(ctx, [[96, 180], [96, 128], [126, 128], [126, 180]], r, { width: 1.8, alpha: 0.85 });
    for (const wx of [52, 156]) {
      poly(ctx, [[wx, 146], [wx, 118], [wx + 26, 118], [wx + 26, 146]], r, { width: 1.6, alpha: 0.85 });
      line(ctx, wx + 13, 118, wx + 13, 146, r, { width: 1, alpha: 0.5, passes: 1 });
      line(ctx, wx, 132, wx + 26, 132, r, { width: 1, alpha: 0.5, passes: 1 });
    }
    // chimney smoke
    stroke(ctx, [[168, 52], [166, 34], [172, 20]], r, { width: 1.2, alpha: 0.35, passes: 1, color: PENCIL });
  });
}

export function marketStallTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(192, 160, seed, (ctx, r) => {
    const c = r() > 0.5 ? '#b0524a' : '#4a7ab0';
    for (const x of [30, 162]) line(ctx, x, 152, x, 56, r, { width: 2.6, alpha: 0.9 });
    // scalloped awning
    fillPoly(ctx, [[16, 58], [96, 34], [176, 58], [176, 76], [16, 76]], c, 0.5);
    poly(ctx, [[16, 58], [96, 36], [176, 58]], r, { width: 2.2, alpha: 0.9 });
    for (let i = 0; i < 5; i++) {
      const x0 = 16 + i * 32;
      stroke(ctx, [[x0, 74], [x0 + 16, 84], [x0 + 32, 74]], r, { width: 1.8, alpha: 0.85, passes: 1 });
    }
    // counter with goods
    fillPoly(ctx, [[26, 152], [26, 112], [166, 112], [166, 152]], '#c9a06a', 0.4);
    poly(ctx, [[26, 152], [26, 112], [166, 112], [166, 152]], r, { width: 2, alpha: 0.9 });
    for (let i = 0; i < 7; i++) {
      scribbleCircle(ctx, 44 + i * 18, 106, 6 + (i % 3), r, { width: 1.2, alpha: 0.6 });
    }
  });
}

export function fountainTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(192, 160, seed, (ctx, r) => {
    // basin
    fillPoly(ctx, [[24, 150], [20, 118], [172, 118], [168, 150]], WASH.castle, 0.5);
    poly(ctx, [[24, 150], [20, 118], [172, 118], [168, 150]], r, { width: 2.2, alpha: 0.9 });
    stroke(ctx, [[20, 118], [56, 112], [96, 114], [140, 111], [172, 118]], r, { width: 1.6, alpha: 0.6 });
    // column and bowl
    line(ctx, 96, 116, 96, 62, r, { width: 3.4, alpha: 0.85 });
    stroke(ctx, [[64, 66], [96, 76], [128, 66]], r, { width: 2, alpha: 0.85 });
    // water, blue and busy
    for (let i = 0; i < 5; i++) {
      const a = -0.9 + i * 0.45;
      stroke(ctx, [[96, 58], [96 + Math.cos(a) * 26, 66 + Math.sin(a) * 8 + 18],
        [96 + Math.cos(a) * 38, 108]], r,
        { width: 1.3, alpha: 0.55, passes: 1, color: '#4a7ab0' });
    }
    stroke(ctx, [[34, 124], [70, 121], [120, 124], [160, 122]], r,
      { width: 1.4, alpha: 0.5, passes: 1, color: '#4a7ab0' });
  });
}

export function lamppostTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(64, 224, seed, (ctx, r) => {
    line(ctx, 32, 216, 32, 52, r, { width: 2.8, alpha: 0.9 });
    stroke(ctx, [[32, 52], [30, 40], [36, 32]], r, { width: 2, alpha: 0.85 });
    // lantern
    poly(ctx, [[26, 38], [30, 20], [44, 20], [48, 38], [37, 44]], r, { width: 1.8, alpha: 0.9 });
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = '#e3b878';
    ctx.beginPath();
    ctx.ellipse(37, 31, 6, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    line(ctx, 24, 216, 42, 216, r, { width: 2.2, alpha: 0.8 });
  });
}

/* ================================================================== *
 * WHAT IS LIT AFTER DARK (Session 6).
 *
 * The day cycle grades the whole frame with one multiply (see
 * `postfx/PaperPass.ts`), which is exactly right for the page and
 * exactly wrong for a lamp: a warm glow multiplied by a night tint is
 * a dark warm glow. So a light is not an exception to the grade, it is
 * a DRAWING that is only on at night — a standee like every other
 * standee, whose opacity is `daylight.clock.lamp`.
 *
 * That is also the honest answer in this medium. A page has no light
 * sources in it; it has marks. A lit window on paper is not a hole in
 * the page, it is a patch somebody drew with a lighter pen and left the
 * white of the sheet showing through. So these are drawn the way a hand
 * would draw them: the paper's own white, a wash of flame over it, and
 * the sparest possible line to say what shape the light is coming out
 * of. Nothing here glows. It is just brighter than the page around it,
 * which after dark is the whole of what "lit" means.
 * ================================================================== */

/** The pool a street lamp throws — hung at the lantern, never on the
 *  ground: a decal on the ground runs away from the camera and is
 *  invisible (Session 5's law). */
export function lampGlowTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(128, 128, seed, (ctx, r) => {
    // the flame's own halo: a soft blot, because that is what a light
    // looks like through a page
    const g = ctx.createRadialGradient(64, 64, 2, 64, 64, 58);
    g.addColorStop(0, 'rgba(255,247,228,0.92)');
    g.addColorStop(0.34, 'rgba(255,215,154,0.44)');
    g.addColorStop(1, 'rgba(255,215,154,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    // and the hand that drew it: three or four quick rays, wobbled
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 + r() * 0.5;
      const r0 = 20 + r() * 8;
      const r1 = 38 + r() * 16;
      line(ctx, 64 + Math.cos(a) * r0, 64 + Math.sin(a) * r0,
        64 + Math.cos(a) * r1, 64 + Math.sin(a) * r1, r,
        { width: 1.3, alpha: 0.28, color: '#ffd79a', passes: 1 });
    }
  });
}

/** A fire in an iron basket by a gate — the castle's one lit thing, and
 *  it is lit because somebody is still changing the banners. */
export function brazierTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(96, 128, seed, (ctx, r) => {
    // the basket
    poly(ctx, [[30, 86], [66, 86], [60, 64], [36, 64]], r, { width: 2, alpha: 0.9 });
    for (let i = 0; i < 4; i++) {
      line(ctx, 34 + i * 8, 64, 32 + i * 9, 86, r, { width: 1.1, alpha: 0.5, passes: 1 });
    }
    line(ctx, 48, 86, 48, 118, r, { width: 2.4, alpha: 0.85 });
    line(ctx, 36, 120, 60, 120, r, { width: 2, alpha: 0.8 });
    // the fire: white paper under a flame wash, and two licks of pen
    const g = ctx.createRadialGradient(48, 54, 2, 48, 54, 34);
    g.addColorStop(0, 'rgba(255,247,228,0.95)');
    g.addColorStop(0.4, 'rgba(255,205,132,0.5)');
    g.addColorStop(1, 'rgba(255,205,132,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 8, 96, 84);
    for (let i = 0; i < 3; i++) {
      stroke(ctx, [[40 + i * 7, 66], [38 + i * 8 + r() * 5, 50], [46 + i * 6, 34 - r() * 8]], r,
        { width: 1.4, alpha: 0.4, color: '#ffd79a' });
    }
  });
}

export function townWallTexture(seed: number, w = 512, h = 160): THREE.CanvasTexture {
  return makeTexture(w, h, seed, (ctx, r) => {
    fillPoly(ctx, [[8, h - 8], [8, 54], [w - 8, 54], [w - 8, h - 8]], WASH.castle, 0.5);
    line(ctx, 8, h - 10, w - 8, h - 10, r, { width: 2.4, alpha: 0.85 });
    line(ctx, 8, 56, w - 8, 54, r, { width: 2.4, alpha: 0.9 });
    // crenellation
    for (let x = 16; x < w - 24; x += 34) {
      poly(ctx, [[x, 54], [x, 30], [x + 20, 30], [x + 20, 54]], r, { width: 1.8, alpha: 0.85 });
    }
    // masonry
    for (let i = 0; i < w / 14; i++) {
      const x = 14 + r() * (w - 40);
      const y = 66 + r() * (h - 90);
      line(ctx, x, y, x + 14 + r() * 10, y + (r() - 0.5) * 3, r, { width: 1, alpha: 0.25, passes: 1 });
    }
    hatch(ctx, 12, h - 44, w - 24, 32, 0.9, 9, r, { alpha: 0.14 });
  });
}

export function gatehouseTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(288, 288, seed, (ctx, r) => {
    // twin drum towers
    for (const tx of [48, 240]) {
      fillPoly(ctx, [[tx - 40, 276], [tx - 34, 96], [tx + 34, 96], [tx + 40, 276]], WASH.castle, 0.55);
      poly(ctx, [[tx - 40, 276], [tx - 34, 96], [tx + 34, 96], [tx + 40, 276]], r, { width: 2.4, alpha: 0.9 });
      for (let x = tx - 30; x < tx + 30; x += 22) {
        poly(ctx, [[x, 94], [x, 74], [x + 14, 74], [x + 14, 94]], r, { width: 1.6, alpha: 0.85 });
      }
      line(ctx, tx - 8, 130, tx - 8, 150, r, { width: 3.2, alpha: 0.7 });
      line(ctx, tx + 8, 170, tx + 8, 190, r, { width: 3.2, alpha: 0.7 });
    }
    // wall over the arch
    fillPoly(ctx, [[88, 150], [88, 96], [200, 96], [200, 150]], WASH.castle, 0.5);
    line(ctx, 88, 98, 200, 96, r, { width: 2.2, alpha: 0.9 });
    for (let x = 96; x < 196; x += 26) {
      poly(ctx, [[x, 94], [x, 76], [x + 16, 76], [x + 16, 94]], r, { width: 1.6, alpha: 0.85 });
    }
    // the arch and raised portcullis
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.moveTo(108, 276);
    ctx.lineTo(108, 190);
    ctx.quadraticCurveTo(144, 140, 180, 190);
    ctx.lineTo(180, 276);
    ctx.fill();
    ctx.restore();
    stroke(ctx, [[108, 276], [108, 190], [122, 162], [144, 152], [166, 162], [180, 190], [180, 276]], r,
      { width: 2.6, alpha: 0.9 });
    for (let x = 116; x < 180; x += 14) line(ctx, x, 158 + Math.abs(x - 144) * 0.4, x, 172, r, { width: 1.6, alpha: 0.6, passes: 1 });
    hatch(ctx, 92, 200, 24, 70, 1.2, 7, r, { alpha: 0.25 });
    hatch(ctx, 174, 200, 22, 70, 1.2, 7, r, { alpha: 0.25 });
  });
}

export function keepTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(448, 384, seed, (ctx, r) => {
    // the great keep: central mass, two flanking towers, banners
    const towers: [number, number, number][] = [[76, 120, 34], [372, 120, 34]];
    // central block
    fillPoly(ctx, [[128, 372], [132, 132], [316, 132], [320, 372]], WASH.castle, 0.6);
    poly(ctx, [[128, 372], [132, 132], [316, 132], [320, 372]], r, { width: 2.8, alpha: 0.9 });
    for (let x = 140; x < 312; x += 30) {
      poly(ctx, [[x, 130], [x, 106], [x + 18, 106], [x + 18, 130]], r, { width: 1.8, alpha: 0.85 });
    }
    // tall windows
    for (const [wx, wy] of [[180, 190], [224, 170], [268, 190], [202, 260], [246, 260]] as [number, number][]) {
      stroke(ctx, [[wx, wy + 34], [wx, wy + 6], [wx + 7, wy], [wx + 14, wy + 6], [wx + 14, wy + 34]], r,
        { width: 1.8, alpha: 0.85 });
    }
    // great door
    stroke(ctx, [[204, 372], [204, 320], [214, 306], [232, 302], [250, 306], [258, 320], [258, 372]], r,
      { width: 2.4, alpha: 0.9 });
    hatch(ctx, 208, 312, 46, 56, 1.3, 6, r, { alpha: 0.3 });
    // flanking towers with conical caps
    for (const [tx, ty, tw] of towers) {
      fillPoly(ctx, [[tx - tw, 372], [tx - tw + 5, ty], [tx + tw - 5, ty], [tx + tw, 372]], WASH.castle, 0.62);
      poly(ctx, [[tx - tw, 372], [tx - tw + 5, ty], [tx + tw - 5, ty], [tx + tw, 372]], r, { width: 2.6, alpha: 0.9 });
      fillPoly(ctx, [[tx - tw - 6, ty + 2], [tx, ty - 62], [tx + tw + 6, ty + 2]], '#5f6672', 0.5);
      poly(ctx, [[tx - tw - 6, ty + 2], [tx, ty - 62], [tx + tw + 6, ty + 2]], r, { width: 2.4, alpha: 0.9 });
      line(ctx, tx, ty - 62, tx, ty - 86, r, { width: 1.8, alpha: 0.85 });
      // the banner
      fillPoly(ctx, [[tx, ty - 84], [tx + 34, ty - 76], [tx, ty - 66]], '#8f4a52', 0.75);
      poly(ctx, [[tx, ty - 84], [tx + 34, ty - 76], [tx, ty - 66]], r, { width: 1.4, alpha: 0.8 });
      for (let wy = ty + 30; wy < 350; wy += 60) {
        line(ctx, tx - 4, wy, tx - 4, wy + 22, r, { width: 3, alpha: 0.65 });
      }
    }
    // masonry hints
    for (let i = 0; i < 30; i++) {
      const x = 140 + r() * 168;
      const y = 150 + r() * 200;
      line(ctx, x, y, x + 16 + r() * 10, y + (r() - 0.5) * 3, r, { width: 1, alpha: 0.2, passes: 1 });
    }
  });
}

export function bannerTexture(seed: number, force?: 'red' | 'blue'): THREE.CanvasTexture {
  return makeTexture(64, 160, seed, (ctx, r) => {
    line(ctx, 32, 152, 32, 16, r, { width: 2.4, alpha: 0.9 });
    line(ctx, 20, 22, 44, 22, r, { width: 2, alpha: 0.85 });
    const c = force ? (force === 'red' ? '#8f4a52' : '#4a6a8f') : r() > 0.5 ? '#8f4a52' : '#4a6a8f';
    fillPoly(ctx, [[22, 24], [42, 24], [42, 88], [32, 78], [22, 88]], c, 0.7);
    stroke(ctx, [[22, 24], [22, 88], [32, 78], [42, 88], [42, 24]], r, { width: 1.6, alpha: 0.85 });
    scribbleCircle(ctx, 32, 48, 7, r, { width: 1.3, alpha: 0.7, color: '#efece2' });
  });
}

/* ================== SUBURB ================== */

export function suburbanHouseTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(256, 192, seed, (ctx, r) => {
    const siding = ['#c9d4d6', '#d6cfc0', '#c6d0b8', '#d8c8b8'][Math.floor(r() * 4)];
    // body
    fillPoly(ctx, [[32, 180], [32, 96], [224, 96], [224, 180]], siding, 0.6);
    poly(ctx, [[32, 180], [32, 96], [224, 96], [224, 180]], r, { width: 2.2, alpha: 0.9 });
    for (let y = 108; y < 180; y += 12) line(ctx, 34, y, 222, y + (r() - 0.5) * 2, r, { width: 0.8, alpha: 0.2, passes: 1 });
    // roof
    fillPoly(ctx, [[20, 98], [128, 36], [236, 98]], '#7a7f88', 0.5);
    poly(ctx, [[20, 98], [128, 36], [236, 98]], r, { width: 2.4, alpha: 0.9 });
    // door with a little porch light
    fillPoly(ctx, [[118, 180], [118, 126], [148, 126], [148, 180]], '#6f4f34', 0.55);
    poly(ctx, [[118, 180], [118, 126], [148, 126], [148, 180]], r, { width: 1.8, alpha: 0.9 });
    scribbleCircle(ctx, 144, 152, 1.8, r, { width: 1, alpha: 0.8 });
    // picture windows with curtains
    for (const wx of [54, 176]) {
      fillPoly(ctx, [[wx, 152], [wx, 116], [wx + 40, 116], [wx + 40, 152]], '#e8e2cf', 0.6);
      poly(ctx, [[wx, 152], [wx, 116], [wx + 40, 116], [wx + 40, 152]], r, { width: 1.6, alpha: 0.9 });
      line(ctx, wx + 20, 116, wx + 20, 152, r, { width: 1, alpha: 0.5, passes: 1 });
      stroke(ctx, [[wx + 2, 118], [wx + 8, 134], [wx + 3, 150]], r, { width: 1, alpha: 0.4, passes: 1 });
      stroke(ctx, [[wx + 38, 118], [wx + 32, 134], [wx + 37, 150]], r, { width: 1, alpha: 0.4, passes: 1 });
    }
    // attic window + chimney
    scribbleCircle(ctx, 128, 74, 9, r, { width: 1.6, alpha: 0.85 });
    poly(ctx, [[190, 62], [190, 38], [208, 38], [208, 72]], r, { width: 1.8, alpha: 0.85 });
  });
}

export function mailboxTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(64, 96, seed, (ctx, r) => {
    line(ctx, 32, 90, 32, 46, r, { width: 2.2, alpha: 0.9 });
    fillPoly(ctx, [[14, 46], [14, 30], [50, 30], [50, 46]], '#4a6a8f', 0.5);
    stroke(ctx, [[14, 46], [14, 34], [20, 28], [44, 28], [50, 34], [50, 46], [14, 46]], r,
      { width: 1.8, alpha: 0.9 });
    // the little flag, up
    line(ctx, 14, 36, 8, 24, r, { width: 1.6, alpha: 0.85, color: '#b0524a' });
  });
}

export function carTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(192, 96, seed, (ctx, r) => {
    const c = ['#7ea3ae', '#c9a06a', '#a8b0a0', '#b0778a'][Math.floor(r() * 4)];
    fillPoly(ctx, [[18, 76], [22, 52], [52, 48], [66, 30], [128, 30], [148, 50], [176, 56], [178, 76]], c, 0.55);
    stroke(ctx, [[18, 76], [22, 52], [52, 48], [66, 30], [128, 30], [148, 50], [176, 56], [178, 76], [18, 76]],
      r, { width: 2.2, alpha: 0.9 });
    stroke(ctx, [[70, 48], [74, 34], [122, 34], [136, 48]], r, { width: 1.4, alpha: 0.6, passes: 1 });
    line(ctx, 96, 34, 96, 48, r, { width: 1.2, alpha: 0.5, passes: 1 });
    for (const wx of [56, 148]) {
      scribbleCircle(ctx, wx, 76, 13, r, { width: 2.2, alpha: 0.9 });
      scribbleCircle(ctx, wx, 76, 5, r, { width: 1.2, alpha: 0.5 });
    }
  });
}

export function picketFenceTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(256, 80, seed, (ctx, r) => {
    line(ctx, 8, 36, 248, 34, r, { width: 1.8, alpha: 0.8 });
    line(ctx, 8, 58, 248, 56, r, { width: 1.8, alpha: 0.8 });
    for (let x = 14; x < 250; x += 20) {
      stroke(ctx, [[x, 74], [x, 26], [x + 5, 18], [x + 10, 26], [x + 10, 74]], r,
        { width: 1.6, alpha: 0.85, passes: 1 });
    }
  });
}

export function streetTreeTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(128, 176, seed, (ctx, r) => {
    fillBlob(ctx, 64, 58, 40, r, WASH.suburb, 0.5, 1.05);
    scribbleCircle(ctx, 64, 58, 40, r, { width: 2, alpha: 0.75, jitter: 2.2 }, 1.15);
    scribbleCircle(ctx, 50, 48, 18, r, { width: 1.3, alpha: 0.4 }, 1.3);
    line(ctx, 64, 170, 64, 94, r, { width: 3.4, alpha: 0.9 });
    scribbleCircle(ctx, 64, 168, 12, r, { width: 1.4, alpha: 0.5 }, 1.05);
  });
}

export function swingSetTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(192, 144, seed, (ctx, r) => {
    stroke(ctx, [[24, 136], [56, 24], [88, 136]], r, { width: 2.2, alpha: 0.9 });
    stroke(ctx, [[104, 136], [136, 24], [168, 136]], r, { width: 2.2, alpha: 0.9 });
    line(ctx, 54, 26, 138, 26, r, { width: 2.4, alpha: 0.9 });
    for (const sx of [78, 116]) {
      line(ctx, sx, 28, sx - 2, 96, r, { width: 1.2, alpha: 0.7, passes: 1 });
      line(ctx, sx + 12, 28, sx + 12, 96, r, { width: 1.2, alpha: 0.7, passes: 1 });
      line(ctx, sx - 4, 98, sx + 14, 97, r, { width: 2.2, alpha: 0.85 });
    }
  });
}

/* ================== CITY & OFFICE ================== */

export function towerBlockTexture(seed: number, floors = 8): THREE.CanvasTexture {
  const h = 64 + floors * 30;
  return makeTexture(192, h, seed, (ctx, r) => {
    const w = 132 + Math.floor(r() * 30);
    const x0 = (192 - w) / 2;
    fillPoly(ctx, [[x0, h - 8], [x0 + 3, 30], [x0 + w - 3, 30], [x0 + w, h - 8]], WASH.city, 0.55);
    poly(ctx, [[x0, h - 8], [x0 + 3, 30], [x0 + w - 3, 30], [x0 + w, h - 8]], r, { width: 2.6, alpha: 0.9 });
    // window grid, some lit
    const cols = 4 + Math.floor(r() * 2);
    for (let f = 0; f < floors; f++) {
      for (let cix = 0; cix < cols; cix++) {
        const wx = x0 + 14 + cix * ((w - 24) / cols);
        const wy = 44 + f * ((h - 90) / floors);
        const lit = r() > 0.72;
        if (lit) {
          ctx.globalAlpha = 0.5;
          ctx.fillStyle = '#e3b878';
          ctx.fillRect(wx, wy, (w - 30) / cols - 6, 16);
          ctx.globalAlpha = 1;
        }
        poly(ctx, [[wx, wy + 16], [wx, wy], [wx + (w - 30) / cols - 6, wy],
          [wx + (w - 30) / cols - 6, wy + 16]], r, { width: 1.1, alpha: 0.55, passes: 1, jitter: 0.8 });
      }
    }
    // roof clutter
    poly(ctx, [[x0 + 16, 30], [x0 + 16, 16], [x0 + 34, 16], [x0 + 34, 30]], r, { width: 1.4, alpha: 0.8 });
    line(ctx, x0 + w - 30, 30, x0 + w - 30, 8, r, { width: 1.6, alpha: 0.8 });
    scribbleCircle(ctx, x0 + w - 30, 7, 2.5, r, { width: 1, alpha: 0.7 });
  });
}

export function glassTowerTexture(seed: number, floors = 10): THREE.CanvasTexture {
  const h = 60 + floors * 28;
  return makeTexture(192, h, seed, (ctx, r) => {
    const w = 120 + Math.floor(r() * 40);
    const x0 = (192 - w) / 2;
    fillPoly(ctx, [[x0, h - 8], [x0, 24], [x0 + w, 24], [x0 + w, h - 8]], WASH.office, 0.6);
    poly(ctx, [[x0, h - 8], [x0, 24], [x0 + w, 24], [x0 + w, h - 8]], r, { width: 2.4, alpha: 0.9 });
    // curtain-wall: long verticals, faint floor lines, one diagonal sun-glare
    for (let i = 1; i < 5; i++) {
      line(ctx, x0 + (w / 5) * i, 26, x0 + (w / 5) * i, h - 10, r, { width: 1, alpha: 0.4, passes: 1 });
    }
    for (let f = 1; f < floors; f++) {
      line(ctx, x0 + 3, 24 + f * ((h - 34) / floors), x0 + w - 3, 24 + f * ((h - 34) / floors), r,
        { width: 0.8, alpha: 0.25, passes: 1 });
    }
    fillPoly(ctx, [[x0 + w * 0.16, h - 12], [x0 + w * 0.5, 26], [x0 + w * 0.68, 26], [x0 + w * 0.34, h - 12]],
      '#f4f2ea', 0.35);
    hatch(ctx, x0 + 6, 30, w * 0.3, h - 50, 1.25, 8, r, { alpha: 0.12 });
  });
}

export function shopfrontTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(224, 160, seed, (ctx, r) => {
    const c = ['#7a9a8f', '#a08f62', '#8f6a7a'][Math.floor(r() * 3)];
    fillPoly(ctx, [[20, 150], [20, 56], [204, 56], [204, 150]], '#ddd6c4', 0.55);
    poly(ctx, [[20, 150], [20, 56], [204, 56], [204, 150]], r, { width: 2.2, alpha: 0.9 });
    // awning
    fillPoly(ctx, [[14, 78], [14, 58], [210, 58], [210, 78]], c, 0.6);
    for (let i = 0; i < 7; i++) {
      const x0 = 14 + i * 28;
      stroke(ctx, [[x0, 78], [x0 + 14, 86], [x0 + 28, 78]], r, { width: 1.6, alpha: 0.8, passes: 1 });
    }
    line(ctx, 14, 58, 210, 58, r, { width: 2, alpha: 0.85 });
    // big window with wares, door
    poly(ctx, [[36, 144], [36, 96], [130, 96], [130, 144]], r, { width: 1.8, alpha: 0.9 });
    for (let i = 0; i < 4; i++) scribbleCircle(ctx, 52 + i * 20, 132, 6, r, { width: 1.2, alpha: 0.55 });
    line(ctx, 36, 120, 130, 119, r, { width: 1, alpha: 0.4, passes: 1 });
    poly(ctx, [[150, 150], [150, 94], [186, 94], [186, 150]], r, { width: 1.8, alpha: 0.9 });
    scribbleCircle(ctx, 180, 124, 1.8, r, { width: 1, alpha: 0.8 });
  });
}

export function trafficLightTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(64, 224, seed, (ctx, r) => {
    line(ctx, 30, 216, 30, 30, r, { width: 2.6, alpha: 0.9 });
    poly(ctx, [[20, 78], [20, 24], [44, 24], [44, 78]], r, { width: 1.8, alpha: 0.9 });
    const cs = ['#b0524a', '#c9a03b', '#6a9a6f'];
    for (let i = 0; i < 3; i++) {
      ctx.globalAlpha = i === 2 ? 0.75 : 0.3;
      ctx.fillStyle = cs[i];
      ctx.beginPath();
      ctx.arc(32, 34 + i * 17, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      scribbleCircle(ctx, 32, 34 + i * 17, 6, r, { width: 1.1, alpha: 0.7 });
    }
  });
}

export function benchTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(160, 80, seed, (ctx, r) => {
    line(ctx, 16, 44, 144, 42, r, { width: 2.6, alpha: 0.9 });
    line(ctx, 16, 30, 144, 28, r, { width: 2.2, alpha: 0.85 });
    for (const x of [28, 132]) {
      line(ctx, x, 74, x, 42, r, { width: 2.2, alpha: 0.9 });
      stroke(ctx, [[x, 44], [x - 2, 30], [x, 18]], r, { width: 1.8, alpha: 0.85 });
    }
    for (let x = 30; x < 132; x += 14) line(ctx, x, 42, x, 30, r, { width: 1, alpha: 0.4, passes: 1 });
  });
}

export function busStopTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(192, 176, seed, (ctx, r) => {
    line(ctx, 24, 168, 24, 34, r, { width: 2.4, alpha: 0.9 });
    line(ctx, 168, 168, 168, 34, r, { width: 2.4, alpha: 0.9 });
    fillPoly(ctx, [[12, 36], [180, 36], [172, 20], [20, 20]], WASH.city, 0.5);
    poly(ctx, [[12, 36], [20, 20], [172, 20], [180, 36]], r, { width: 2.2, alpha: 0.9 });
    // glass back wall
    poly(ctx, [[30, 160], [30, 42], [162, 42], [162, 160]], r, { width: 1.4, alpha: 0.5 });
    line(ctx, 96, 42, 96, 160, r, { width: 1, alpha: 0.3, passes: 1 });
    fillPoly(ctx, [[38, 156], [70, 46], [86, 46], [54, 156]], '#f4f2ea', 0.3);
    // bench inside
    line(ctx, 40, 118, 152, 116, r, { width: 2, alpha: 0.8 });
  });
}

export function planterTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(96, 96, seed, (ctx, r) => {
    fillPoly(ctx, [[22, 88], [26, 56], [70, 56], [74, 88]], WASH.city, 0.5);
    poly(ctx, [[22, 88], [26, 56], [70, 56], [74, 88]], r, { width: 2, alpha: 0.9 });
    fillBlob(ctx, 48, 44, 22, r, WASH.suburb, 0.5, 0.8);
    scribbleCircle(ctx, 48, 44, 22, r, { width: 1.6, alpha: 0.7, jitter: 2 }, 1.2);
  });
}

/* ================== SHARED ================== */

export function signpostTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(160, 192, seed, (ctx, r) => {
    line(ctx, 80, 184, 80, 28, r, { width: 3, alpha: 0.9 });
    // two arms, opposite ways
    fillPoly(ctx, [[80, 44], [148, 40], [156, 50], [148, 60], [80, 62]], '#d8c8a8', 0.5);
    poly(ctx, [[80, 44], [148, 40], [156, 50], [148, 60], [80, 62]], r, { width: 1.8, alpha: 0.9 });
    fillPoly(ctx, [[80, 78], [16, 74], [6, 85], [16, 96], [80, 96]], '#d8c8a8', 0.5);
    poly(ctx, [[80, 78], [16, 74], [6, 85], [16, 96], [80, 96]], r, { width: 1.8, alpha: 0.9 });
    // greeked destination scratches
    line(ctx, 92, 52, 138, 51, r, { width: 1.6, alpha: 0.6, passes: 1 });
    line(ctx, 26, 86, 68, 85, r, { width: 1.6, alpha: 0.6, passes: 1 });
  });
}

export function bridgeTexture(seed: number): THREE.CanvasTexture {
  // side elevation: plank deck on two piers, low rails
  return makeTexture(288, 96, seed, (ctx, r) => {
    line(ctx, 12, 56, 276, 54, r, { width: 3.2, alpha: 0.9 });
    line(ctx, 12, 40, 276, 38, r, { width: 1.8, alpha: 0.8 });
    for (let x = 20; x < 276; x += 24) line(ctx, x, 40, x, 55, r, { width: 1.4, alpha: 0.6, passes: 1 });
    for (const x of [48, 240]) {
      line(ctx, x - 8, 88, x - 4, 58, r, { width: 2.6, alpha: 0.85 });
      line(ctx, x + 8, 88, x + 4, 58, r, { width: 2.6, alpha: 0.85 });
    }
    stroke(ctx, [[12, 60], [80, 64], [160, 62], [276, 58]], r, { width: 1.2, alpha: 0.4, passes: 1 });
  });
}

export function bridgeDeckDecal(seed: number): THREE.CanvasTexture {
  return makeTexture(192, 96, seed, (ctx, r) => {
    /* Session 5: this was an opaque tan RECTANGLE with a ruled border,
     * and standing on the river-mouth crossing you were standing on a
     * brown slab. A plank deck is planks: a dry wash the paper shows
     * through, seams rather than drawn edges, and ends that are worn
     * rather than ruled. */
    ctx.globalAlpha = 0.44;
    ctx.fillStyle = '#c9ae82';
    ctx.fillRect(2, 8, 188, 80);
    ctx.globalAlpha = 1;
    // the two stringers the planks are laid across, and the worn ends
    line(ctx, 4, 14, 188, 12, r, { width: 1.6, alpha: 0.42, passes: 1 });
    line(ctx, 4, 84, 188, 82, r, { width: 1.6, alpha: 0.42, passes: 1 });
    for (let x = 8; x < 190; x += 13 + r() * 6) {
      line(ctx, x, 8, x + (r() - 0.5) * 5, 88, r,
        { width: 1.2, alpha: 0.2 + r() * 0.14, passes: 1 });
    }
    // the wear down the middle, and grit in the seams
    hatch(ctx, 10, 34, 172, 30, 0.02, 9, r, { alpha: 0.08 });
    for (let i = 0; i < 12; i++) {
      const gx = 8 + r() * 176;
      const gy = r() > 0.5 ? 10 + r() * 8 : 76 + r() * 10;
      line(ctx, gx, gy, gx + 5 + r() * 8, gy + (r() - 0.5) * 4, r,
        { width: 1.1, alpha: 0.14, passes: 1 }, 2);
    }
  });
}

/**
 * THE ROWBOAT, redrawn for Session 6 — because it stopped being a prop
 * in the box and became the thing the player sits in.
 *
 * What was here was a Session 1 sketch: one filled brown polygon at
 * half alpha with three lines over it. On this sheet that is a foreign
 * object — it is the most saturated thing in any frame it appears in,
 * and every other drawing in this world is a light WASH under a
 * BALLPOINT LINE. The first contact sheet of the mount had a brown
 * bathtub parked in the middle of THE COMMON and there was no arguing
 * with it.
 *
 * Redrawn in LONGSHORE's stated technique (Session 5, textures-coast):
 * *the waterline* — a floating drawing stops flat, with one hatch of
 * reflection and nothing below it. So the hull is a sheer line and a
 * keel line meeting at two points, clinker-built (a boat this size is
 * lapstrake and the laps are what make it read as a boat rather than as
 * a leaf), with two thwarts, a pair of rowlocks and an oar shipped
 * across her. The wash is the sand's own, so she belongs to the coast
 * she was found on.
 */
export function rowboatTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(200, 104, seed, (ctx, r) => {
    /* Round 2 of the gate: the first redraw came out a GONDOLA — long,
     * shallow, pointed at both ends, and the walker read as standing on
     * it rather than sitting in it. A dinghy is short and DEEP: the
     * freeboard is most of what you see of a small boat from the side,
     * and it is the freeboard that hides the legs of whoever is in it. */
    const sheer: [number, number][] = [
      [22, 26], [38, 40], [66, 47], [104, 49], [146, 46], [172, 36], [180, 24],
    ];
    const keel: [number, number][] = [
      [22, 26], [32, 46], [62, 78], [104, 82], [148, 76], [172, 44], [180, 24],
    ];
    fillPoly(ctx, [...sheer, ...[...keel].reverse()], WASH.sand, 0.44);
    // the shadowed inside of her, so the hull is not a flat cutout
    fillPoly(ctx, [[40, 42], [66, 49], [104, 51], [146, 48], [170, 38],
      [150, 60], [104, 63], [64, 60]], WASH.castle, 0.26);
    stroke(ctx, keel, r, { width: 2.6, alpha: 0.92 });
    stroke(ctx, sheer, r, { width: 2.3, alpha: 0.88 });
    // clinker: two laps following the sheer down toward the keel
    for (let i = 1; i <= 2; i++) {
      const k = i / 3;
      stroke(ctx, sheer.map(([x, y], j) =>
        [x + (keel[j][0] - x) * k, y + (keel[j][1] - y) * k] as [number, number]),
        r, { width: 1.2, alpha: 0.32 - i * 0.07, passes: 1 });
    }
    // the stem, and the transom squared off at the stern
    line(ctx, 22, 26, 26, 12, r, { width: 2.2, alpha: 0.85 });
    line(ctx, 172, 36, 172, 44, r, { width: 1.8, alpha: 0.62 });
    // two thwarts — a seat is a line with both ends on the sheer
    line(ctx, 60, 48, 88, 49, r, { width: 2.2, alpha: 0.8 });
    line(ctx, 122, 50, 150, 47, r, { width: 2.2, alpha: 0.78 });
    // rowlocks
    for (const x of [76, 140]) {
      line(ctx, x, 47, x, 38, r, { width: 1.5, alpha: 0.75 });
      line(ctx, x - 3, 38, x + 3, 38, r, { width: 1.2, alpha: 0.62 });
    }
    // the oar, shipped across her, blade forward
    stroke(ctx, [[44, 44], [118, 41], [162, 37]], r, { width: 2, alpha: 0.66 });
    fillPoly(ctx, [[30, 40], [44, 37], [46, 48], [32, 50]], WASH.sand, 0.34);
    poly(ctx, [[30, 40], [44, 37], [46, 48], [32, 50]], r, { width: 1.5, alpha: 0.75 });
    /* AND THE WATERLINE — LONGSHORE's stated technique (Session 5): a
     * floating drawing stops flat, with one hatch of reflection and
     * nothing below it. She floats; she does not stand on the sea. */
    for (let i = 0; i < 10; i++) {
      const x = 26 + i * 16 + r() * 6;
      line(ctx, x, 86 + r() * 4, x + 9 + r() * 9, 86 + r() * 4, r,
        { width: 1.2, alpha: 0.16 + r() * 0.13, passes: 1 });
    }
  });
}

export function wellTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(128, 160, seed, (ctx, r) => {
    fillPoly(ctx, [[28, 148], [28, 108], [100, 108], [100, 148]], WASH.castle, 0.55);
    poly(ctx, [[28, 148], [28, 108], [100, 108], [100, 148]], r, { width: 2.2, alpha: 0.9 });
    for (let i = 0; i < 7; i++) {
      const x = 32 + r() * 60;
      const y = 112 + r() * 30;
      line(ctx, x, y, x + 12, y + (r() - 0.5) * 3, r, { width: 1, alpha: 0.3, passes: 1 });
    }
    line(ctx, 34, 106, 34, 52, r, { width: 2.2, alpha: 0.85 });
    line(ctx, 94, 106, 94, 52, r, { width: 2.2, alpha: 0.85 });
    fillPoly(ctx, [[22, 54], [64, 26], [106, 54]], '#6a6f78', 0.45);
    poly(ctx, [[22, 54], [64, 26], [106, 54]], r, { width: 2, alpha: 0.9 });
    line(ctx, 64, 58, 64, 84, r, { width: 1.2, alpha: 0.7, passes: 1 });
    scribbleCircle(ctx, 64, 92, 8, r, { width: 1.6, alpha: 0.8 });
  });
}

export function mushroomTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(64, 64, seed, (ctx, r) => {
    stroke(ctx, [[30, 58], [30, 38], [34, 38], [34, 58]], r, { width: 1.6, alpha: 0.8, passes: 1 });
    fillPoly(ctx, [[14, 40], [22, 22], [44, 22], [50, 40]], '#b0524a', 0.5);
    stroke(ctx, [[12, 40], [20, 24], [32, 20], [44, 24], [52, 40], [12, 40]], r, { width: 1.6, alpha: 0.85 });
    for (const [dx, dy] of [[24, 30], [36, 28], [30, 35]]) {
      scribbleCircle(ctx, dx, dy, 2, r, { width: 0.9, alpha: 0.6, color: '#efece2' });
    }
  });
}

export function logTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(160, 72, seed, (ctx, r) => {
    stroke(ctx, [[14, 30], [146, 26]], r, { width: 2.2, alpha: 0.85 });
    stroke(ctx, [[14, 56], [146, 52]], r, { width: 2.2, alpha: 0.85 });
    scribbleCircle(ctx, 148, 39, 13, r, { width: 1.8, alpha: 0.85 }, 1.1);
    scribbleCircle(ctx, 148, 39, 6, r, { width: 1.1, alpha: 0.5 }, 1.4);
    line(ctx, 14, 30, 12, 56, r, { width: 2, alpha: 0.8 });
    for (let i = 0; i < 4; i++) {
      line(ctx, 26 + i * 28, 33, 40 + i * 28, 50, r, { width: 1, alpha: 0.3, passes: 1 });
    }
  });
}

/** A little cousin of Pip standing around town — a drawn person, no face. */
export function doodleFolkTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(96, 160, seed, (ctx, r) => {
    const hat = r() > 0.6;
    // head
    scribbleCircle(ctx, 48, 34, 15, r, { width: 2, alpha: 0.85 }, 1.1);
    if (hat) {
      line(ctx, 28, 24, 68, 22, r, { width: 1.8, alpha: 0.85 });
      poly(ctx, [[38, 23], [40, 10], [58, 10], [60, 23]], r, { width: 1.6, alpha: 0.8 });
    }
    // body: a long coat or a triangle dress or trousers
    const kind = Math.floor(r() * 3);
    if (kind === 0) {
      poly(ctx, [[36, 50], [30, 120], [66, 120], [60, 50]], r, { width: 2, alpha: 0.85 });
      line(ctx, 38, 120, 38, 148, r, { width: 2, alpha: 0.85 });
      line(ctx, 58, 120, 58, 148, r, { width: 2, alpha: 0.85 });
    } else if (kind === 1) {
      poly(ctx, [[40, 50], [22, 126], [74, 126], [56, 50]], r, { width: 2, alpha: 0.85 });
      line(ctx, 40, 126, 40, 148, r, { width: 1.8, alpha: 0.85 });
      line(ctx, 56, 126, 56, 148, r, { width: 1.8, alpha: 0.85 });
    } else {
      poly(ctx, [[38, 50], [34, 100], [62, 100], [58, 50]], r, { width: 2, alpha: 0.85 });
      line(ctx, 40, 100, 36, 148, r, { width: 2.2, alpha: 0.85 });
      line(ctx, 56, 100, 60, 148, r, { width: 2.2, alpha: 0.85 });
    }
    // arms
    stroke(ctx, [[38, 60], [24, 84], [26, 96]], r, { width: 1.8, alpha: 0.8 });
    stroke(ctx, [[58, 60], [72, 82], [70, 96]], r, { width: 1.8, alpha: 0.8 });
  });
}
