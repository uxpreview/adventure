import * as THREE from 'three';
import {
  makeTexture, stroke, line, scribbleCircle, hatch, letteringFit,
  type Ctx2D,
} from '../engine/ink';
import { INK, PENCIL, WASH } from '../engine/palette';

/**
 * THE COMMON's prop box + the Brim vista (design/specs/the-common.md).
 *
 * Two ink registers live here. The meadow set is full-pressure
 * foreground ballpoint, same as textures.ts. The vista set — wall,
 * rooflines, belfry, keep — draws distance as failing pressure: each
 * layer back uses lighter line, lower alpha, paler wash, until the
 * keep is barely more than pencil. The fog does the rest.
 */

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

function poly(
  ctx: Ctx2D, pts: [number, number][], r: () => number,
  o: Parameters<typeof stroke>[3] = {}
) {
  stroke(ctx, [...pts, pts[0]], r, o);
}

/* ================== THE MEADOW SET ================== */

/**
 * A leaning grass tuft. The whole Common leans east with the sea wind;
 * the lean is drawn in, so these must never be x-flipped.
 */
export function leanGrassTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(96, 64, seed, (ctx, r) => {
    const lean = 6 + r() * 9;
    const blades = 4 + Math.floor(r() * 3);
    for (let i = 0; i < blades; i++) {
      const x = 14 + i * (64 / blades) + (r() - 0.5) * 9;
      const h = 30 + r() * 22;
      stroke(ctx, [
        [x, 60],
        [x + lean * 0.35 + (r() - 0.5) * 4, 60 - h * 0.55],
        [x + lean + (r() - 0.5) * 5, 60 - h],
      ], r, { width: 1.8 + r() * 0.5, jitter: 1.3, alpha: 0.8 + r() * 0.12 });
    }
    // one blade that disagrees, so the tuft is a drawing and not a stamp
    if (r() > 0.4) {
      const x = 20 + r() * 50;
      stroke(ctx, [[x, 60], [x - 4 - r() * 4, 42 - r() * 8]], r,
        { width: 1.6, jitter: 1.2, alpha: 0.7 });
    }
  });
}

/** Tall seedhead grass — the near occlusion layer at road edges. */
export function tallGrassTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(96, 96, seed, (ctx, r) => {
    const stems = 3 + Math.floor(r() * 2);
    for (let i = 0; i < stems; i++) {
      const x = 18 + i * (56 / stems) + (r() - 0.5) * 10;
      const lean = 10 + r() * 12;
      const topX = x + lean;
      const topY = 16 + r() * 14;
      stroke(ctx, [[x, 92], [x + lean * 0.25, 62], [x + lean * 0.62, 34], [topX, topY]], r,
        { width: 1.2, jitter: 1, alpha: 0.55, passes: 1 });
      // the seedhead nodding off the tip
      ctx.globalAlpha = 0.4 + r() * 0.15;
      ctx.fillStyle = '#8a6f3a';
      ctx.beginPath();
      ctx.ellipse(topX + 3, topY - 1, 6, 2.6, 0.5 + r() * 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      // awn ticks off the head
      for (let g = 0; g < 3; g++) {
        line(ctx, topX + 2 + g * 2, topY - g, topX + 8 + g * 2, topY - 5 - g * 2, r,
          { width: 0.8, alpha: 0.35, passes: 1, color: '#8a6f3a' }, 2);
      }
    }
  });
}

/**
 * One drift species per texture: 0 rust poppies (the accent), 1 white
 * oxeye, 2 gold buttercups. A drift never mixes species.
 */
export function driftFlowersTexture(seed: number, species: 0 | 1 | 2): THREE.CanvasTexture {
  const petal = ['#b0524a', '#efece2', '#c99a3b'][species];
  const heart = ['#232633', '#c99a3b', '#8a6f3a'][species];
  return makeTexture(96, 72, seed, (ctx, r) => {
    const n = 3 + Math.floor(r() * 2);
    for (let i = 0; i < n; i++) {
      const x = 14 + i * (64 / n) + (r() - 0.5) * 10;
      const h = 22 + r() * 20;
      stroke(ctx, [[x, 64], [x + 2 + (r() - 0.5) * 5, 64 - h * 0.6], [x + 5 + (r() - 0.5) * 6, 64 - h]],
        r, { width: 1.3, alpha: 0.65, passes: 1 });
      const fx = x + 5;
      const fy = 64 - h;
      ctx.globalAlpha = species === 1 ? 0.85 : 0.75;
      ctx.fillStyle = petal;
      const petals = species === 0 ? 4 : 6;
      for (let p = 0; p < petals; p++) {
        const a = (p / petals) * Math.PI * 2 + r() * 0.4;
        ctx.beginPath();
        ctx.ellipse(fx + Math.cos(a) * 3.6, fy + Math.sin(a) * 3.4, 3.2, 2.2, a, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 0.8;
      ctx.fillStyle = heart;
      ctx.beginPath();
      ctx.arc(fx, fy, 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      // a leaf tick on the stem
      line(ctx, x + 1, 64 - h * 0.4, x - 5, 64 - h * 0.4 - 5, r,
        { width: 1.1, alpha: 0.5, passes: 1 }, 2);
    }
  });
}

/**
 * The named oaks. form 0 = the broad one, 1 = the one that leans,
 * 2 = the split-trunk one. Three different drawings, never one stamp.
 */
export function commonOakTexture(seed: number, form: 0 | 1 | 2): THREE.CanvasTexture {
  return makeTexture(256, 288, seed, (ctx, r) => {
    const lean = form === 1 ? 34 : 0;
    const baseX = 128 - lean * 0.4;
    const topX = 128 + lean * 0.6;

    // canopy stain first — two damp passes, darker to the shade side
    if (form === 2) {
      fillBlob(ctx, topX - 38, 104, 48, r, WASH.forest, 0.36, 0.86);
      fillBlob(ctx, topX + 40, 92, 52, r, WASH.forest, 0.4, 0.86);
    } else {
      fillBlob(ctx, topX, 98, form === 0 ? 70 : 60, r, WASH.forest, 0.38, 0.8);
      fillBlob(ctx, topX - 26, 112, 38, r, WASH.forest, 0.28, 0.88);
    }

    // trunk + root flare — old wood, but still pen, not timber
    if (form === 2) {
      stroke(ctx, [[112, 282], [112, 226], [98, 184], [92, 158]], r, { width: 4.6, alpha: 0.88 });
      stroke(ctx, [[128, 282], [130, 224], [148, 182], [156, 154]], r, { width: 4.2, alpha: 0.86 });
      stroke(ctx, [[112, 240], [122, 236], [128, 240]], r, { width: 2, alpha: 0.55 });
    } else {
      stroke(ctx, [[baseX - 9, 282], [baseX - 6, 222], [topX - 9, 176], [topX - 5, 148]], r,
        { width: 4.8, alpha: 0.88 });
      stroke(ctx, [[baseX + 11, 282], [baseX + 9, 224], [topX + 7, 178], [topX + 3, 150]], r,
        { width: 4.2, alpha: 0.85 });
    }
    // roots gripping the page
    for (const dx of [-18, -6, 10, 20]) {
      stroke(ctx, [[baseX + dx * 0.4, 272], [baseX + dx, 282], [baseX + dx * 1.4, 286]], r,
        { width: 2.2, alpha: 0.65 });
    }
    // bark: one grain line hugging the trunk's own curve
    stroke(ctx, [[baseX - 2, 276], [baseX - 2, 244], [baseX + (topX - baseX) * 0.2, 212]], r,
      { width: 1, alpha: 0.25, passes: 1 });
    // a knot, on the wood and not beside it
    scribbleCircle(ctx, baseX + 2, 244 + r() * 12, 3.4, r,
      { width: 1.2, alpha: 0.5 }, 1.5);

    // branches reaching into the canopy
    const bx = form === 2 ? [[92, 158], [156, 154]] : [[topX - 7, 150], [topX + 2, 152]];
    for (const [sx, sy] of bx as [number, number][]) {
      stroke(ctx, [[sx, sy], [sx - 24 - r() * 12, sy - 24], [sx - 32, sy - 44]], r,
        { width: 2.4, alpha: 0.75 });
      stroke(ctx, [[sx, sy], [sx + 20 + r() * 10, sy - 28], [sx + 34, sy - 40]], r,
        { width: 2.2, alpha: 0.72 });
    }

    // the leaf masses: scribbled lobes tucked inside the crown
    const lobes = form === 2
      ? [[topX - 48, 108, 28], [topX - 22, 82, 26], [topX + 36, 96, 30], [topX + 56, 118, 20], [topX + 8, 70, 24]]
      : [[topX - 46, 118, 26], [topX - 24, 82, 28], [topX + 14, 68, 27], [topX + 46, 90, 28],
         [topX + 54, 124, 20], [topX, 104, 34]];
    for (const [cx, cy, cr] of lobes as [number, number, number][]) {
      scribbleCircle(ctx, cx + (r() - 0.5) * 8, cy + (r() - 0.5) * 8, cr, r,
        { width: 1.4, alpha: 0.42, jitter: 2.2, passes: 1 }, 1.5);
    }
    // one committed outline around the whole crown
    scribbleCircle(ctx, topX + (form === 2 ? 4 : 0), 98, form === 0 ? 70 : 62, r,
      { width: 2.2, alpha: 0.72, jitter: 3.2 }, 1.08);

    // shade side: hatch tucked into the canopy's lower left
    hatch(ctx, topX - 62, 108, 52, 34, 0.7, 6.5, r, { alpha: 0.2 });
    hatch(ctx, topX - 28, 128, 48, 22, 0.75, 7.5, r, { alpha: 0.14 });
  });
}

/** Trodden earth where feet have been — the Common's signature wear. */
export function wornGroundDecal(seed: number): THREE.CanvasTexture {
  return makeTexture(192, 192, seed, (ctx, r) => {
    // the stain: soft radial washes only — a hard edge here reads as a
    // spill, not as wear (art director S2 round 1)
    for (let i = 0; i < 4; i++) {
      const bx = 96 + (r() - 0.5) * 44;
      const by = 96 + (r() - 0.5) * 40;
      const rad = 42 + r() * 34;
      const g = ctx.createRadialGradient(bx, by, 2, bx, by, rad);
      g.addColorStop(0, 'rgba(190,172,138,0.30)');
      g.addColorStop(0.7, 'rgba(190,172,138,0.14)');
      g.addColorStop(1, 'rgba(190,172,138,0)');
      ctx.fillStyle = g;
      ctx.fillRect(bx - rad, by - rad, rad * 2, rad * 2);
    }
    // broken contour: two faint arcs that don't close
    for (let i = 0; i < 2; i++) {
      const a0 = r() * Math.PI * 2;
      const arc: [number, number][] = [];
      const rad = 58 + r() * 20;
      for (let s = 0; s <= 6; s++) {
        const a = a0 + (s / 6) * (0.5 + r() * 0.5);
        arc.push([96 + Math.cos(a) * rad, 96 + Math.sin(a) * rad * 0.9]);
      }
      stroke(ctx, arc, r, { width: 1.1, alpha: 0.16, passes: 1, jitter: 2.2 });
    }
    // stipple: the scuffing
    ctx.fillStyle = INK;
    for (let i = 0; i < 60; i++) {
      const a = r() * Math.PI * 2;
      const d = Math.pow(r(), 0.6) * 70;
      ctx.globalAlpha = 0.10 + r() * 0.16;
      ctx.beginPath();
      ctx.arc(96 + Math.cos(a) * d, 96 + Math.sin(a) * d * 0.92, 0.8 + r() * 1.4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    // flattened grass at the rim
    for (let i = 0; i < 8; i++) {
      const a = r() * Math.PI * 2;
      const x = 96 + Math.cos(a) * (70 + r() * 14);
      const y = 96 + Math.sin(a) * (66 + r() * 14);
      line(ctx, x, y, x + Math.cos(a) * 9, y + Math.sin(a) * 8, r,
        { width: 1.1, alpha: 0.35, passes: 1 }, 2);
    }
  });
}

/** Cart ruts for the last stretch of road before the gate. */
export function wheelRutsDecal(seed: number): THREE.CanvasTexture {
  return makeTexture(256, 128, seed, (ctx, r) => {
    for (const yBase of [46, 82]) {
      let x = 8;
      while (x < 244) {
        const len = 26 + r() * 40;
        const wob = Math.sin(x * 0.03 + seed) * 5;
        stroke(ctx, [
          [x, yBase + wob],
          [x + len * 0.5, yBase + wob + (r() - 0.5) * 4],
          [x + len, yBase + Math.sin((x + len) * 0.03 + seed) * 5],
        ], r, { width: 2.2, alpha: 0.34, passes: 1, jitter: 1.6 });
        // the rut's twin shadow line
        line(ctx, x + 4, yBase + wob + 4, x + len - 6, yBase + wob + 5, r,
          { width: 1.1, alpha: 0.18, passes: 1 }, 3);
        x += len + 10 + r() * 26;
      }
    }
    // a hoof scuff or two between the ruts
    for (let i = 0; i < 5; i++) {
      const x = 20 + r() * 210;
      line(ctx, x, 60 + r() * 10, x + 5, 64 + r() * 8, r, { width: 1.6, alpha: 0.25, passes: 1 }, 2);
    }
  });
}

/** The old well, rebuilt with the weight the spawn's landmark deserves. */
export function commonWellTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(192, 240, seed, (ctx, r) => {
    // stone ring
    fillPoly(ctx, [[44, 226], [40, 172], [152, 172], [148, 226]], WASH.castle, 0.55);
    poly(ctx, [[44, 226], [40, 172], [152, 172], [148, 226]], r, { width: 2.4, alpha: 0.9 });
    stroke(ctx, [[40, 172], [70, 166], [120, 168], [152, 172]], r, { width: 2, alpha: 0.8 });
    // stone courses, uneven
    for (let i = 0; i < 9; i++) {
      const x = 46 + r() * 88;
      const y = 178 + r() * 40;
      line(ctx, x, y, x + 14 + r() * 12, y + (r() - 0.5) * 3, r, { width: 1, alpha: 0.3, passes: 1 });
    }
    hatch(ctx, 44, 200, 40, 24, 1.0, 6, r, { alpha: 0.2 });
    // posts + windlass
    line(ctx, 52, 170, 54, 78, r, { width: 3, alpha: 0.9 });
    line(ctx, 140, 170, 138, 78, r, { width: 3, alpha: 0.9 });
    line(ctx, 50, 96, 142, 94, r, { width: 2.4, alpha: 0.85 });
    scribbleCircle(ctx, 96, 95, 6, r, { width: 1.6, alpha: 0.8 });
    stroke(ctx, [[102, 95], [112, 90], [118, 96]], r, { width: 1.8, alpha: 0.8, passes: 1 });
    // roof with shakes
    fillPoly(ctx, [[34, 82], [96, 34], [158, 82]], '#6a6f78', 0.45);
    poly(ctx, [[34, 82], [96, 34], [158, 82]], r, { width: 2.4, alpha: 0.9 });
    for (let i = 1; i < 4; i++) {
      stroke(ctx, [[34 + i * 15, 82 - i * 3], [96, 38 + i * 10]], r, { width: 1.1, alpha: 0.35, passes: 1 });
      stroke(ctx, [[158 - i * 15, 82 - i * 3], [96, 38 + i * 10]], r, { width: 1.1, alpha: 0.35, passes: 1 });
    }
    // rope + bucket, mid-drop
    line(ctx, 96, 101, 96, 138, r, { width: 1.3, alpha: 0.8, passes: 1 });
    poly(ctx, [[88, 138], [86, 156], [106, 156], [104, 138]], r, { width: 1.8, alpha: 0.85 });
    line(ctx, 88, 138, 104, 138, r, { width: 1.4, alpha: 0.7 });
    // the dark down the shaft
    hatch(ctx, 62, 160, 68, 12, 0.1, 3.4, r, { alpha: 0.4 });
    // stone trough leaning at the side
    fillPoly(ctx, [[6, 226], [8, 202], [46, 204], [44, 226]], WASH.castle, 0.5);
    poly(ctx, [[6, 226], [8, 202], [46, 204], [44, 226]], r, { width: 2, alpha: 0.85 });
    stroke(ctx, [[12, 208], [40, 209]], r, { width: 1.2, alpha: 0.4, passes: 1 });
  });
}

/** The crossroads signpost: four arms, four hand-lettered truths. */
export function crossroadsSignTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(192, 224, seed, (ctx, r) => {
    line(ctx, 96, 216, 96, 20, r, { width: 3.4, alpha: 0.9 });
    // a nail or two
    scribbleCircle(ctx, 96, 40, 2, r, { width: 1, alpha: 0.6 });
    const arm = (
      y: number, dir: 1 | -1, w: number, label: string, tilt: number
    ) => {
      const x0 = 96;
      const x1 = 96 + dir * w;
      const pts: [number, number][] = dir > 0
        ? [[x0, y - 9], [x1 - 10, y - 9 + tilt], [x1, y + tilt], [x1 - 10, y + 9 + tilt], [x0, y + 9]]
        : [[x0, y - 9], [x1 + 10, y - 9 + tilt], [x1, y + tilt], [x1 + 10, y + 9 + tilt], [x0, y + 9]];
      fillPoly(ctx, pts, '#d8c8a8', 0.55);
      poly(ctx, pts, r, { width: 1.8, alpha: 0.9 });
      const tx = dir > 0 ? x0 + 8 : x1 + 14;
      letteringFit(ctx, label, tx, y + 4 + tilt * 0.5, w - 26, 11, r,
        { width: 1.5, alpha: 0.8, crooked: 0.55, passes: 1 });
    };
    arm(34, 1, 84, 'BRIM', -2);
    arm(64, -1, 88, 'THE SEA', 3);
    arm(96, 1, 90, 'DOWNS', 2);
    arm(128, -1, 82, 'HOME', -3);
    // grass at the foot
    for (let i = 0; i < 4; i++) {
      const x = 82 + r() * 28;
      stroke(ctx, [[x, 216], [x + 4 + r() * 5, 202 - r() * 8]], r, { width: 1.4, alpha: 0.6, passes: 1 });
    }
  });
}

/** A half-buried milestone — the west void's one midpoint. */
export function milestoneTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(64, 80, seed, (ctx, r) => {
    fillPoly(ctx, [[16, 74], [14, 34], [24, 18], [42, 18], [50, 36], [48, 74]], WASH.castle, 0.5);
    poly(ctx, [[16, 74], [14, 34], [24, 18], [42, 18], [50, 36], [48, 74]], r, { width: 2, alpha: 0.85 });
    hatch(ctx, 16, 52, 32, 20, 0.9, 5, r, { alpha: 0.22 });
    // the worn mark: a Roman-ish scratch nobody can read
    line(ctx, 26, 32, 27, 46, r, { width: 1.6, alpha: 0.6, passes: 1 });
    line(ctx, 34, 31, 34, 46, r, { width: 1.6, alpha: 0.55, passes: 1 });
    line(ctx, 24, 38, 38, 37, r, { width: 1.1, alpha: 0.4, passes: 1 });
  });
}

/** A hay cart resting on its shafts by the long fence. */
export function hayCartTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(224, 160, seed, (ctx, r) => {
    // bed, tipped slightly forward onto its shafts
    fillPoly(ctx, [[36, 116], [44, 84], [186, 78], [190, 112]], '#c9a06a', 0.45);
    poly(ctx, [[36, 116], [44, 84], [186, 78], [190, 112]], r, { width: 2.2, alpha: 0.9 });
    for (let x = 58; x < 184; x += 20) {
      line(ctx, x, 84, x - 2, 112, r, { width: 1, alpha: 0.3, passes: 1 });
    }
    // shafts to the ground
    stroke(ctx, [[44, 96], [16, 128], [8, 140]], r, { width: 2.4, alpha: 0.85 });
    stroke(ctx, [[48, 104], [24, 134], [16, 144]], r, { width: 2, alpha: 0.75 });
    // the hay mound with straw flying loose
    fillBlob(ctx, 122, 66, 50, r, '#d3b878', 0.55, 0.62);
    scribbleCircle(ctx, 122, 66, 48, r, { width: 1.4, alpha: 0.5, jitter: 2.4, passes: 1 }, 1.15);
    for (let i = 0; i < 14; i++) {
      const x = 76 + r() * 92;
      const y = 42 + r() * 40;
      line(ctx, x, y, x + 8 + r() * 6, y - 3 + r() * 6, r,
        { width: 0.9, alpha: 0.4, passes: 1, color: '#8a6f3a' }, 2);
    }
    // the big wheel
    scribbleCircle(ctx, 148, 122, 25, r, { width: 1.9, alpha: 0.8 }, 1.1);
    scribbleCircle(ctx, 148, 122, 5, r, { width: 1.3, alpha: 0.65 });
    for (let s = 0; s < 6; s++) {
      const a = (s / 6) * Math.PI * 2 + 0.3;
      line(ctx, 148 + Math.cos(a) * 6, 122 + Math.sin(a) * 6,
        148 + Math.cos(a) * 23, 122 + Math.sin(a) * 23, r, { width: 1.2, alpha: 0.5, passes: 1 }, 2);
    }
  });
}

/** Hedgerow run — gap=true breaks in the middle where the hedge gave up. */
export function hedgerowTexture(seed: number, gap = false): THREE.CanvasTexture {
  return makeTexture(256, 112, seed, (ctx, r) => {
    const masses = gap
      ? [[10, 96], [150, 246]]
      : [[8, 248]];
    for (const [x0, x1] of masses) {
      // the mass: two soft stains, darker low
      const mid = (x0 + x1) / 2;
      fillBlob(ctx, mid, 78, (x1 - x0) / 2, r, WASH.forest, 0.34, 0.4);
      fillBlob(ctx, mid + (r() - 0.5) * 20, 66, (x1 - x0) / 2.6, r, WASH.forest, 0.24, 0.42);
      // one committed billowing contour that wraps down both ends —
      // the hedge as ONE enclosed thing, not a lid on a stain
      const topPts: [number, number][] = [[x0 + 2, 100], [x0, 78]];
      let cx = x0;
      while (cx < x1 - 6) {
        cx += 16 + r() * 18;
        topPts.push([Math.min(cx, x1), 44 + r() * 18]);
      }
      topPts.push([x1, 80], [x1 - 2, 100]);
      stroke(ctx, topPts, r, { width: 2, alpha: 0.65, jitter: 2.8 });
      // small leafy scribbles INSIDE the mass, barely there
      for (let i = 0; i < (x1 - x0) / 18; i++) {
        scribbleCircle(ctx, x0 + 12 + r() * (x1 - x0 - 24), 62 + r() * 28, 3 + r() * 4, r,
          { width: 1, alpha: 0.18, jitter: 1.6, passes: 1 }, 1.6);
      }
      // shadow texture low in the hedge
      hatch(ctx, x0 + 4, 84, x1 - x0 - 8, 18, 0.55, 6, r, { alpha: 0.09 });
      // a broken base: dark at the trunks, gone between them
      let bx = x0 + 4;
      while (bx < x1 - 12) {
        const run = 14 + r() * 22;
        line(ctx, bx, 101 + (r() - 0.5) * 3, Math.min(bx + run, x1 - 2), 102 + (r() - 0.5) * 3, r,
          { width: 1.6, alpha: 0.4, passes: 1 }, 3);
        bx += run + 8 + r() * 14;
      }
      for (let i = 0; i < (x1 - x0) / 70; i++) {
        const x = x0 + 20 + r() * (x1 - x0 - 40);
        line(ctx, x, 102, x + (r() - 0.5) * 4, 90, r, { width: 1.4, alpha: 0.4, passes: 1 }, 2);
      }
    }
  });
}

/**
 * The long fence, in states of repair. kind 0 sound, 1 losing a rail,
 * 2 the stile, 3 the field gate.
 */
export function longFenceTexture(seed: number, kind: 0 | 1 | 2 | 3): THREE.CanvasTexture {
  return makeTexture(256, 96, seed, (ctx, r) => {
    const posts = [16, 90, 166, 240];
    for (const x of posts) {
      stroke(ctx, [[x + (r() - 0.5) * 3, 88], [x, 34 + (r() - 0.5) * 6]], r,
        { width: 2.6, alpha: 0.85 });
    }
    if (kind === 3) {
      // the field gate between the middle posts
      line(ctx, 16, 46, 90, 44, r, { width: 2, alpha: 0.8 });
      line(ctx, 16, 68, 90, 66, r, { width: 2, alpha: 0.8 });
      line(ctx, 166, 46, 240, 44, r, { width: 2, alpha: 0.8 });
      line(ctx, 166, 68, 240, 66, r, { width: 2, alpha: 0.8 });
      for (let x = 96; x <= 162; x += 12) line(ctx, x, 38, x + 1, 84, r, { width: 1.8, alpha: 0.8, passes: 1 });
      line(ctx, 94, 40, 164, 82, r, { width: 1.6, alpha: 0.6, passes: 1 });
      line(ctx, 94, 82, 164, 40, r, { width: 1.4, alpha: 0.5, passes: 1 });
    } else {
      line(ctx, 10, 46, 246, 42, r, { width: 2, alpha: 0.8 });
      if (kind === 1) {
        // the lower rail has come down at one end
        stroke(ctx, [[10, 68], [120, 66], [180, 84]], r, { width: 2, alpha: 0.75 });
      } else {
        line(ctx, 10, 68, 246, 64, r, { width: 2, alpha: 0.8 });
      }
      if (kind === 2) {
        // the stile: two steps over the rails
        stroke(ctx, [[112, 88], [126, 30], [138, 30], [152, 88]], r, { width: 2.4, alpha: 0.9 });
        line(ctx, 116, 62, 148, 60, r, { width: 2.6, alpha: 0.9 });
        line(ctx, 122, 44, 144, 43, r, { width: 2.4, alpha: 0.9 });
      }
    }
    // grass at the post feet
    for (const x of posts) {
      for (let i = 0; i < 3; i++) {
        stroke(ctx, [[x - 4 + r() * 8, 88], [x - 2 + r() * 10, 78 - r() * 6]], r,
          { width: 1.2, alpha: 0.5, passes: 1 });
      }
    }
  });
}

/** Fallen oak leaves under the arguing oaks. */
export function leafLitterDecal(seed: number): THREE.CanvasTexture {
  return makeTexture(160, 96, seed, (ctx, r) => {
    for (let i = 0; i < 22; i++) {
      const x = 10 + r() * 140;
      const y = 10 + r() * 76;
      const a = r() * Math.PI * 2;
      ctx.globalAlpha = 0.16 + r() * 0.2;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(x, y, 2.2 + r() * 1.4, 1.2 + r() * 0.7, a, 0.4, Math.PI * 2 - 0.3);
      ctx.stroke();
      // the stem tick
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(a) * 2.6, y + Math.sin(a) * 1.4);
      ctx.lineTo(x + Math.cos(a) * 4.6, y + Math.sin(a) * 2.6);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  });
}

/** Reeds with cattail heads for the riverbend. */
export function reedsTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(128, 128, seed, (ctx, r) => {
    const stems = 4 + Math.floor(r() * 2);
    for (let i = 0; i < stems; i++) {
      const x = 14 + i * (100 / stems) + (r() - 0.5) * 10;
      const h = 72 + r() * 40;
      const lean = 4 + r() * 10;
      stroke(ctx, [[x, 124], [x + lean * 0.5, 124 - h * 0.6], [x + lean, 124 - h]], r,
        { width: 1.2, alpha: 0.55, passes: 1 });
      if (r() > 0.35) {
        // the cattail: a fat capsule near the top
        ctx.globalAlpha = 0.6;
        ctx.fillStyle = '#8a6f3a';
        ctx.beginPath();
        ctx.ellipse(x + lean * 0.9, 124 - h + 10, 3.4, 10, 0.05, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        line(ctx, x + lean * 0.9, 124 - h + 1, x + lean, 124 - h - 9, r,
          { width: 1, alpha: 0.5, passes: 1 }, 2);
      }
    }
  });
}

/** The rope swing on the middle oak. Drawn hanging; pivot is the top. */
export function ropeSwingTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(64, 128, seed, (ctx, r) => {
    line(ctx, 18, 4, 22, 100, r, { width: 1.4, alpha: 0.8, passes: 1 });
    line(ctx, 46, 4, 44, 100, r, { width: 1.4, alpha: 0.8, passes: 1 });
    fillPoly(ctx, [[12, 100], [54, 99], [55, 108], [13, 109]], '#c9a06a', 0.5);
    poly(ctx, [[12, 100], [54, 99], [55, 108], [13, 109]], r, { width: 1.8, alpha: 0.9 });
    line(ctx, 20, 102, 21, 107, r, { width: 1, alpha: 0.4, passes: 1 }, 2);
  });
}

/** A swallow mid-loop — two arcs and a forked tail. */
export function swallowTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(96, 48, seed, (ctx, r) => {
    stroke(ctx, [[12, 30], [30, 14], [46, 26]], r, { width: 2, alpha: 0.75, passes: 1 });
    stroke(ctx, [[46, 26], [64, 12], [84, 28]], r, { width: 2, alpha: 0.75, passes: 1 });
    // the forked tail
    line(ctx, 46, 26, 40, 38, r, { width: 1.3, alpha: 0.7, passes: 1 }, 2);
    line(ctx, 46, 26, 52, 38, r, { width: 1.3, alpha: 0.7, passes: 1 }, 2);
  });
}

/* ================== THE BRIM VISTA SET ================== */
/* Distance is failing pressure: wall < meadow, roofs < wall, keep in
 * pencil. Alphas and widths step down layer by layer on purpose.     */

/**
 * A run of Brim's south wall. Battlements vary per segment; some
 * merlons are chipped; ivy takes what it can.
 */
export function brimWallTexture(seed: number, w = 512, h = 192): THREE.CanvasTexture {
  return makeTexture(w, h, seed, (ctx, r) => {
    const lw = 1.9;      // lighter than foreground line work, on purpose
    const la = 0.78;
    const parapetY = 58 + (r() - 0.5) * 6;
    fillPoly(ctx, [[6, h - 8], [6, parapetY], [w - 6, parapetY - 4], [w - 6, h - 8]], WASH.castle, 0.5);
    line(ctx, 6, h - 10, w - 6, h - 10, r, { width: lw, alpha: la * 0.9 });
    line(ctx, 6, parapetY + 2, w - 6, parapetY - 2, r, { width: lw, alpha: la });
    // the wall walk's shadow under the parapet
    hatch(ctx, 10, parapetY + 4, w - 20, 12, 0.05, 4.5, r, { alpha: 0.14 });
    // battlements: varied widths and heights, the odd chipped one
    let x = 12 + r() * 10;
    while (x < w - 30) {
      const mw = 18 + r() * 14;
      const mh = 20 + r() * 12;
      const chipped = r() > 0.85;
      if (chipped) {
        stroke(ctx, [[x, parapetY], [x + 2, parapetY - mh * 0.4], [x + mw * 0.6, parapetY - mh * 0.3],
          [x + mw, parapetY]], r, { width: lw * 0.9, alpha: la * 0.85, jitter: 2 });
      } else {
        poly(ctx, [[x, parapetY], [x, parapetY - mh], [x + mw, parapetY - mh + (r() - 0.5) * 3],
          [x + mw, parapetY]], r, { width: lw * 0.9, alpha: la * 0.9 });
      }
      x += mw + 12 + r() * 12;
    }
    // masonry hints + one arrow slit
    for (let i = 0; i < w / 24; i++) {
      const mx = 14 + r() * (w - 40);
      const my = parapetY + 18 + r() * (h - parapetY - 42);
      line(ctx, mx, my, mx + 12 + r() * 10, my + (r() - 0.5) * 3, r,
        { width: 0.9, alpha: 0.2, passes: 1 });
    }
    if (r() > 0.4) {
      const sx = 60 + r() * (w - 120);
      line(ctx, sx, parapetY + 26, sx + 1, parapetY + 46, r, { width: 2.6, alpha: 0.55 });
    }
    // damp at the footing
    hatch(ctx, 12, h - 42, w - 24, 30, 0.9, 8, r, { alpha: 0.13 });
    // ivy claiming a patch
    if (r() > 0.35) {
      const ix = 40 + r() * (w - 120);
      fillBlob(ctx, ix, h - 52, 26 + r() * 16, r, WASH.forest, 0.3, 1.2);
      for (let i = 0; i < 3; i++) {
        scribbleCircle(ctx, ix + (r() - 0.5) * 30, h - 46 - r() * 34, 9 + r() * 7, r,
          { width: 1.1, alpha: 0.35, jitter: 2 }, 1.4);
      }
    }
  });
}

/** A drum tower punctuating the wall line. */
export function wallTowerTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(224, 288, seed, (ctx, r) => {
    const lw = 2;
    fillPoly(ctx, [[54, 278], [62, 92], [162, 92], [170, 278]], WASH.castle, 0.55);
    stroke(ctx, [[54, 278], [62, 92]], r, { width: lw, alpha: 0.8 });
    stroke(ctx, [[170, 278], [162, 92]], r, { width: lw, alpha: 0.8 });
    // crenellated crown, slightly wider than the drum. Straight-ish
    // merlons: round jitter here reads as a row of circles at distance
    line(ctx, 48, 92, 176, 90, r, { width: lw, alpha: 0.8 });
    let x = 54;
    while (x < 164) {
      const mw = 15 + r() * 8;
      const mh = 20 + r() * 6;
      line(ctx, x, 90, x, 90 - mh, r, { width: 1.5, alpha: 0.7, passes: 1, jitter: 0.7 }, 3);
      line(ctx, x, 90 - mh, x + mw, 90 - mh - 1, r, { width: 1.5, alpha: 0.7, passes: 1, jitter: 0.7 }, 3);
      line(ctx, x + mw, 90 - mh - 1, x + mw, 90, r, { width: 1.5, alpha: 0.7, passes: 1, jitter: 0.7 }, 3);
      x += mw + 9 + r() * 7;
    }
    // curved course lines say "round"
    for (let i = 0; i < 4; i++) {
      const y = 130 + i * 38 + r() * 8;
      stroke(ctx, [[62, y], [112, y + 6], [162, y]], r, { width: 0.9, alpha: 0.22, passes: 1 });
    }
    // slits
    line(ctx, 100, 130, 101, 156, r, { width: 2.6, alpha: 0.6 });
    line(ctx, 126, 190, 127, 214, r, { width: 2.6, alpha: 0.55 });
    hatch(ctx, 58, 220, 46, 52, 1.1, 7, r, { alpha: 0.16 });
  });
}

/**
 * The south gate of Brim, rebuilt as the poster's centerpiece: square
 * towers (the draft's capsule drums read as balloons up close), real
 * battlements, string courses, the arch with its portcullis forever
 * raised.
 */
export function brimGateTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(320, 320, seed, (ctx, r) => {
    const merlons = (x0: number, x1: number, y: number) => {
      let x = x0;
      while (x < x1 - 12) {
        const mw = 14 + r() * 8;
        const mh = 16 + r() * 6;
        line(ctx, x, y, x + 1, y - mh, r, { width: 1.7, alpha: 0.8, passes: 1, jitter: 0.7 }, 3);
        line(ctx, x + 1, y - mh, x + mw, y - mh - 1, r, { width: 1.7, alpha: 0.8, passes: 1, jitter: 0.7 }, 3);
        line(ctx, x + mw, y - mh - 1, x + mw + 1, y, r, { width: 1.7, alpha: 0.8, passes: 1, jitter: 0.7 }, 3);
        x += mw + 8 + r() * 6;
      }
    };
    // twin square towers
    for (const tx of [58, 262]) {
      fillPoly(ctx, [[tx - 44, 310], [tx - 38, 84], [tx + 38, 84], [tx + 44, 310]], WASH.castle, 0.55);
      stroke(ctx, [[tx - 44, 310], [tx - 38, 84]], r, { width: 2.6, alpha: 0.9 });
      stroke(ctx, [[tx + 44, 310], [tx + 38, 84]], r, { width: 2.6, alpha: 0.9 });
      line(ctx, tx - 42, 86, tx + 42, 84, r, { width: 2.2, alpha: 0.85 });
      merlons(tx - 38, tx + 40, 84);
      // string courses where the tower steps
      line(ctx, tx - 40, 150, tx + 40, 148, r, { width: 1.3, alpha: 0.4, passes: 1 });
      line(ctx, tx - 42, 232, tx + 42, 230, r, { width: 1.3, alpha: 0.4, passes: 1 });
      // arrow slits
      line(ctx, tx - 10, 108, tx - 9, 132, r, { width: 3, alpha: 0.7 });
      line(ctx, tx + 8, 170, tx + 9, 196, r, { width: 3, alpha: 0.65 });
      line(ctx, tx - 6, 250, tx - 5, 274, r, { width: 3, alpha: 0.6 });
      // masonry, and shade on the passage side of each tower
      for (let i = 0; i < 18; i++) {
        const x = tx - 34 + r() * 60;
        const y = 96 + r() * 200;
        line(ctx, x, y, x + 12 + r() * 8, y + (r() - 0.5) * 3, r, { width: 0.9, alpha: 0.3, passes: 1 });
      }
      const shadeX = tx < 160 ? tx + 24 : tx - 38;
      hatch(ctx, shadeX, 150, 14, 152, 1.25, 6.5, r, { alpha: 0.14 });
    }
    // the span over the arch
    fillPoly(ctx, [[98, 208], [98, 118], [222, 118], [222, 208]], WASH.castle, 0.5);
    line(ctx, 98, 120, 222, 118, r, { width: 2.2, alpha: 0.85 });
    merlons(102, 220, 118);
    // the kingdom's device over the arch: a shield with the wave
    stroke(ctx, [[146, 138], [146, 158], [160, 168], [174, 158], [174, 138], [146, 138]], r,
      { width: 1.8, alpha: 0.8 });
    stroke(ctx, [[148, 150], [155, 146], [162, 151], [170, 146]], r,
      { width: 1.4, alpha: 0.7, passes: 1, color: '#8f4a52' });
    // the arch and raised portcullis
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.moveTo(116, 310);
    ctx.lineTo(116, 226);
    ctx.quadraticCurveTo(160, 172, 204, 226);
    ctx.lineTo(204, 310);
    ctx.fill();
    ctx.restore();
    stroke(ctx, [[116, 310], [116, 226], [130, 196], [160, 184], [190, 196], [204, 226], [204, 310]], r,
      { width: 2.8, alpha: 0.9 });
    // portcullis teeth, drawn raised: short, even, tucked to the arch
    for (let x = 130; x <= 190; x += 12) {
      const top = 192 + Math.abs(x - 160) * 0.32;
      line(ctx, x, top, x, top + 9, r, { width: 1.6, alpha: 0.55, passes: 1, jitter: 0.5 }, 2);
    }
    // the dark inside the passage walls
    hatch(ctx, 104, 236, 14, 72, 1.25, 6, r, { alpha: 0.26 });
    hatch(ctx, 202, 236, 14, 72, 1.25, 6, r, { alpha: 0.26 });
  });
}

/** A red pennant for the gate towers — the poster's accent. */
export function gatePennantTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(48, 96, seed, (ctx, r) => {
    line(ctx, 12, 92, 12, 8, r, { width: 1.8, alpha: 0.85 });
    fillPoly(ctx, [[13, 10], [44, 18], [13, 30]], '#8f4a52', 0.8);
    stroke(ctx, [[13, 10], [44, 18], [13, 30]], r, { width: 1.3, alpha: 0.8, passes: 1 });
  });
}

/**
 * Town roofs seen over the wall: gable rows and chimneys, drawn a
 * step lighter than the wall. Session 3 replaces these with streets.
 */
export function rooflineTexture(seed: number, w = 512, h = 160): THREE.CanvasTexture {
  return makeTexture(w, h, seed, (ctx, r) => {
    const la = 0.5;
    let x = 6;
    const baseY = h - 6;
    while (x < w - 60) {
      const gw = 42 + r() * 44;
      const gh = 26 + r() * 26;
      const wallH = 14 + r() * 14;
      const eaveY = baseY - wallH;
      const ridge = x + gw * (0.3 + r() * 0.4);
      // the house under the roof: a wall face, so this is a town and
      // not a field of tents
      fillPoly(ctx, [[x + 2, baseY], [x + 2, eaveY], [x + gw - 2, eaveY], [x + gw - 2, baseY]],
        WASH.kingdom, 0.3);
      line(ctx, x + 2, eaveY + 1, x + gw - 2, eaveY, r, { width: 1.1, alpha: la * 0.7, passes: 1 });
      // gable roof over it, slightly overhanging, greyer than the wall.
      // Two straight pitches: a stroke through the ridge curves it and
      // the whole town reads as haystacks (S2 round 3)
      fillPoly(ctx, [[x - 2, eaveY], [ridge, eaveY - gh], [x + gw + 2, eaveY]], '#8d8a84', 0.3);
      line(ctx, x - 2, eaveY, ridge, eaveY - gh, r, { width: 1.5, alpha: la, jitter: 0.8 }, 3);
      line(ctx, ridge, eaveY - gh, x + gw + 2, eaveY, r, { width: 1.5, alpha: la, jitter: 0.8 }, 3);
      // ridge line + roof hatch on the shade pitch
      hatch(ctx, x + 2, eaveY - gh * 0.75, Math.max(10, ridge - x - 6), gh * 0.6, 0.85, 6, r,
        { alpha: 0.09 });
      // one window tick per third house, no more detail at this range
      if (r() > 0.6) {
        const wx = x + 10 + r() * (gw - 24);
        poly(ctx, [[wx, baseY - 4], [wx, baseY - 10 - r() * 4], [wx + 6, baseY - 10 - r() * 4], [wx + 6, baseY - 4]],
          r, { width: 0.9, alpha: 0.3, passes: 1 });
      }
      // a chimney, sometimes smoking
      if (r() > 0.45) {
        const cx = ridge + (r() - 0.5) * gw * 0.35;
        const ct = eaveY - gh - 10 - r() * 8;
        poly(ctx, [[cx, eaveY - gh + 6], [cx, ct], [cx + 6, ct], [cx + 6, eaveY - gh + 8]], r,
          { width: 1.1, alpha: la * 0.9 });
        if (r() > 0.5) {
          stroke(ctx, [[cx + 3, ct - 3], [cx + 1, ct - 14], [cx + 7, ct - 26]], r,
            { width: 1, alpha: 0.24, passes: 1, color: PENCIL });
        }
      }
      x += gw * (0.75 + r() * 0.4);
    }
  });
}

/** The bell tower rising over the roofs. */
export function belfryTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(128, 256, seed, (ctx, r) => {
    const la = 0.55;
    fillPoly(ctx, [[42, 248], [46, 96], [82, 96], [86, 248]], WASH.kingdom, 0.36);
    stroke(ctx, [[42, 248], [46, 96]], r, { width: 1.6, alpha: la });
    stroke(ctx, [[86, 248], [82, 96]], r, { width: 1.6, alpha: la });
    // the bell stage: an arched opening, the bell a small dark bulb
    stroke(ctx, [[52, 130], [52, 108], [58, 100], [70, 100], [76, 108], [76, 130]], r,
      { width: 1.5, alpha: la });
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.arc(64, 116, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    // the cap: a steep pyramid with a weathervane tick
    fillPoly(ctx, [[36, 98], [64, 40], [92, 98]], '#6a6f78', 0.32);
    poly(ctx, [[36, 98], [64, 40], [92, 98]], r, { width: 1.6, alpha: la });
    line(ctx, 64, 40, 64, 24, r, { width: 1.2, alpha: la, passes: 1 });
    stroke(ctx, [[58, 28], [70, 26]], r, { width: 1.1, alpha: 0.5, passes: 1 });
    // course hints
    for (let i = 0; i < 4; i++) {
      const y = 150 + i * 24;
      line(ctx, 47, y, 81, y - 1, r, { width: 0.8, alpha: 0.18, passes: 1 });
    }
  });
}

/**
 * Castle Greyweather as the meadow sees it: a pencil ghost above the
 * town, no interior detail — the fog and the false perspective do the
 * rest. Faded out by the region update before the walker gets close.
 */
export function keepVistaTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(384, 256, seed, (ctx, r) => {
    const la = 0.62;
    // no hill: a filled ground plane here reads as a grey slab edge
    // floating in the sky (S2 round 2) — the keep alone, in the haze
    // central mass
    fillPoly(ctx, [[128, 214], [132, 92], [252, 92], [256, 214]], WASH.castle, 0.3);
    stroke(ctx, [[128, 214], [132, 92]], r, { width: 1.5, alpha: la, color: PENCIL });
    stroke(ctx, [[256, 214], [252, 92]], r, { width: 1.5, alpha: la, color: PENCIL });
    line(ctx, 130, 93, 254, 91, r, { width: 1.4, alpha: la, color: PENCIL });
    for (let x = 138; x < 248; x += 22) {
      poly(ctx, [[x, 91], [x, 78], [x + 13, 78], [x + 13, 91]], r,
        { width: 1.1, alpha: la * 0.9, color: PENCIL });
    }
    // flanking towers with cones
    for (const tx of [96, 290]) {
      fillPoly(ctx, [[tx - 24, 218], [tx - 20, 102], [tx + 20, 102], [tx + 24, 218]], WASH.castle, 0.32);
      stroke(ctx, [[tx - 24, 218], [tx - 20, 102]], r, { width: 1.4, alpha: la, color: PENCIL });
      stroke(ctx, [[tx + 24, 218], [tx + 20, 102]], r, { width: 1.4, alpha: la, color: PENCIL });
      fillPoly(ctx, [[tx - 26, 104], [tx, 58], [tx + 26, 104]], WASH.castle, 0.32);
      poly(ctx, [[tx - 26, 104], [tx, 58], [tx + 26, 104]], r,
        { width: 1.3, alpha: la, color: PENCIL });
      line(ctx, tx, 58, tx, 44, r, { width: 1, alpha: la * 0.9, passes: 1, color: PENCIL });
      // the banner: the one whisper of the accent at distance
      fillPoly(ctx, [[tx + 1, 45], [tx + 18, 50], [tx + 1, 56]], '#8f4a52', 0.4);
    }
    // three window ticks, no more
    for (const [wx, wy] of [[168, 130], [206, 118], [232, 150]] as [number, number][]) {
      line(ctx, wx, wy, wx + 1, wy + 12, r, { width: 1.6, alpha: 0.32, passes: 1, color: PENCIL });
    }
  });
}
