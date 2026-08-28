import * as THREE from 'three';
import { INK, BLUE, WARM_BLUE, SMUDGE_GREY } from './palette';

/**
 * Tint convention for palable art: textures whose ink belongs to a paling
 * token (WARM_BLUE / COLD_BLUE) are drawn in TINT (white) and colored by
 * their material, so the central paling registry can run the token's
 * color curve. Mixed-token art must be split across materials.
 */
export const TINT = '#ffffff';

/**
 * Procedural ballpoint-pen art. Everything in the game is drawn at load time
 * with these primitives onto offscreen canvases — no image assets. Strokes
 * carry per-segment wobble and a faint double-pass so lines read as pen on
 * paper rather than crisp vectors.
 */

// Deterministic RNG so the world looks identical on every load.
export function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

export type Ctx2D = CanvasRenderingContext2D;
type StrokeOpts = {
  color?: string;
  width?: number;
  jitter?: number;
  alpha?: number;
  passes?: number;
  /**
   * The left-hand drag-ghost (pacing CR-4 / ch04 §10): a soft offset
   * heel-smear pass under the stroke — her left hand following the pen.
   * Defaults ON for WARM_BLUE ink (RULINGS #2 — every real-Bea mark
   * carries it, at every scale; opt out explicitly). Forged (COLD_BLUE)
   * strokes stay clean. On TINT canvases pass `smudge: true` yourself —
   * the token isn't knowable from white. Pass an object to scale the
   * drag: `{ scale: 6, vertical: true }` is rain (her smear as weather,
   * which is Chapter 4's whole plot).
   */
  smudge?: boolean | SmudgeOpts;
};

export type SmudgeOpts = {
  /** Multiplies the base down-left drag vector. */
  scale?: number;
  /** Clip the drag to straight down (rain-streaking). */
  vertical?: boolean;
  alpha?: number;
};

function jitterPoints(
  pts: [number, number][],
  amt: number,
  r: () => number
): [number, number][] {
  return pts.map(([x, y]) => [x + (r() - 0.5) * amt, y + (r() - 0.5) * amt]);
}

/* ------------------------------------------------------------------ *
 * The nib (art director round 2, Fix 3).
 *
 * Before this, every mark in the game was a constant-width polyline
 * stroked twice: "thin geometry under a global grain shader, not
 * ballpoint on paper". A real ball pen does four things this did not.
 * It varies width along its length as the hand's pressure rises and
 * falls. It POOLS where the pen changes direction, because the ball
 * slows and the ink does not. It SKIPS, because the ball outruns its
 * own feed. And a second pass over the same line never registers with
 * the first — the hand comes back at a slightly different angle and the
 * two centrelines drift apart and back together.
 *
 * So the core is no longer a stroked path. It is a filled ribbon whose
 * half-width is sampled along the SAME centreline stroke() has always
 * drawn (quadratics through the midpoints — existing art must not move),
 * plus pooling nodes at the cusps and gaps where the feed starves. One
 * fill per contiguous run, so this stays load-time-cheap.
 * ------------------------------------------------------------------ */

/**
 * The exact centreline stroke() has always drawn, resampled densely.
 * Long straights stop stair-stepping because they are no longer four
 * segments of a polygon; they are sampled at ~2 px.
 */
function curvePoints(j: [number, number][]): [number, number][] {
  if (j.length < 2) return j.slice();
  const out: [number, number][] = [j[0]];
  let start = j[0];
  for (let i = 1; i < j.length; i++) {
    const c = j[i - 1];
    const end: [number, number] = [(j[i - 1][0] + j[i][0]) / 2, (j[i - 1][1] + j[i][1]) / 2];
    const n = Math.max(2, Math.min(28, Math.round(Math.hypot(end[0] - start[0], end[1] - start[1]) / 2.0)));
    for (let s = 1; s <= n; s++) {
      const t = s / n, u = 1 - t;
      out.push([
        u * u * start[0] + 2 * u * t * c[0] + t * t * end[0],
        u * u * start[1] + 2 * u * t * c[1] + t * t * end[1],
      ]);
    }
    start = end;
  }
  out.push(j[j.length - 1]);
  return out;
}

/** Smooth seeded 1/f wobble along the length of a stroke, in [-1, 1]. */
function bandNoise(r: () => number, harmonics = 3) {
  const f: number[] = [], p: number[] = [], a: number[] = [];
  for (let i = 0; i < harmonics; i++) {
    f.push((1.1 + r() * 1.6) * (i + 1) * 1.7);
    p.push(r() * Math.PI * 2);
    a.push(1 / (i + 1.35));
  }
  const norm = a.reduce((s, v) => s + v, 0);
  return (t: number) => {
    let v = 0;
    for (let i = 0; i < harmonics; i++) v += Math.sin(t * f[i] * Math.PI * 2 + p[i]) * a[i];
    return v / norm;
  };
}

/**
 * One inked pass: a variable-width ribbon along `cp`, broken where the
 * feed starves, with a pooled node wherever the pen turned hard.
 */
function inkPass(
  ctx: Ctx2D,
  cp: [number, number][],
  base: number,
  alpha: number,
  r: () => number,
  opts: { taper: boolean; skip: boolean }
) {
  const n = cp.length;
  if (n < 2) return;
  // arc length, so pressure and starve read in real distance and not in
  // however many points the caller happened to hand us
  const s: number[] = [0];
  for (let i = 1; i < n; i++) s.push(s[i - 1] + Math.hypot(cp[i][0] - cp[i - 1][0], cp[i][1] - cp[i - 1][1]));
  const L = s[n - 1];
  if (L < 0.6) {
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(cp[0][0], cp[0][1], base * 0.5, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  const pressure = bandNoise(r, 3);
  const starve = bandNoise(r, 2);
  const half = base * 0.5;

  // turn per unit length at each sample — where the ball slows and pools
  const turn = new Float32Array(n);
  for (let i = 1; i < n - 1; i++) {
    const ax = cp[i][0] - cp[i - 1][0], ay = cp[i][1] - cp[i - 1][1];
    const bx = cp[i + 1][0] - cp[i][0], by = cp[i + 1][1] - cp[i][1];
    const la = Math.hypot(ax, ay) || 1e-4, lb = Math.hypot(bx, by) || 1e-4;
    const d = Math.max(-1, Math.min(1, (ax * bx + ay * by) / (la * lb)));
    turn[i] = Math.acos(d) / ((la + lb) * 0.5);
  }
  // One box blur, so a pool is a swelling and not a spike — and then
  // the stroke's OWN mean is taken out of it. A pool is where the pen
  // slowed relative to the rest of this stroke; without the subtraction
  // every uniformly-curved mark (a grass tuft, a loop) comes out
  // uniformly fatter, which is not pooling, it is just a thicker pen.
  const pool = new Float32Array(n);
  let mean = 0;
  for (let i = 0; i < n; i++) {
    let acc = 0, cnt = 0;
    for (let k = Math.max(0, i - 3); k <= Math.min(n - 1, i + 3); k++) { acc += turn[k]; cnt++; }
    pool[i] = Math.min(1, (acc / cnt) / 0.34);
    mean += pool[i];
  }
  mean /= n;
  for (let i = 0; i < n; i++) pool[i] = Math.max(-0.35, pool[i] - mean);

  const w = new Float32Array(n);
  const on = new Uint8Array(n);
  // a starve threshold that only bites on strokes long enough to have
  // outrun their own feed; short marks never skip
  // A ball starves when it is moving fast under a light hand. A bold
  // ruled border under real pressure does not dash, and dashing it
  // turns a panel edge into a dotted line — so the threshold backs
  // off as the stroke gets heavier, and short marks never skip.
  const skipT = opts.skip && L > 55 ? -(0.74 + Math.min(0.9, base * 0.085)) : -2;
  for (let i = 0; i < n; i++) {
    const t = s[i] / L;
    let k = 1 + pressure(t) * 0.22;
    if (opts.taper) {
      // the nib lands and lifts: thin in, thinner out
      const inK = 0.52 + 0.48 * Math.min(1, (s[i] / Math.min(L * 0.5, base * 3.4 + 2)));
      const rem = L - s[i];
      const outK = 0.34 + 0.66 * Math.min(1, rem / Math.min(L * 0.5, base * 5.2 + 3));
      k *= inK * outK;
    }
    k *= 1 + pool[i] * 0.55;
    w[i] = Math.max(0.34, half * Math.min(1.55, k));
    on[i] = starve(t) < skipT ? 0 : 1;
  }

  // contiguous inked runs, one fill each
  ctx.globalAlpha = alpha;
  let i = 0;
  while (i < n) {
    while (i < n && !on[i]) i++;
    let a = i;
    while (i < n && on[i]) i++;
    const b = i - 1;
    if (b - a < 1) continue;
    ctx.beginPath();
    // one side out...
    for (let k = a; k <= b; k++) {
      const px = k > a ? cp[k - 1] : cp[k], nx = k < b ? cp[k + 1] : cp[k];
      let dx = nx[0] - px[0], dy = nx[1] - px[1];
      const l = Math.hypot(dx, dy) || 1e-4; dx /= l; dy /= l;
      const x = cp[k][0] - dy * w[k], y = cp[k][1] + dx * w[k];
      if (k === a) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    // ...and the other side back
    for (let k = b; k >= a; k--) {
      const px = k > a ? cp[k - 1] : cp[k], nx = k < b ? cp[k + 1] : cp[k];
      let dx = nx[0] - px[0], dy = nx[1] - px[1];
      const l = Math.hypot(dx, dy) || 1e-4; dx /= l; dy /= l;
      ctx.lineTo(cp[k][0] + dy * w[k], cp[k][1] - dx * w[k]);
    }
    ctx.closePath();
    ctx.fill();
    // round caps, the way a ball pen sets down and lifts
    ctx.beginPath();
    ctx.arc(cp[a][0], cp[a][1], w[a], 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cp[b][0], cp[b][1], w[b], 0, Math.PI * 2);
    ctx.fill();
  }

  // the pools themselves: a heavier dot at each local maximum of turning
  for (let k = 2; k < n - 2; k++) {
    if (!on[k] || pool[k] < 0.34) continue;
    if (pool[k] < pool[k - 1] || pool[k] < pool[k + 1]) continue;
    ctx.globalAlpha = Math.min(1, alpha * 1.15);
    ctx.beginPath();
    ctx.arc(cp[k][0], cp[k][1], w[k] * 1.10, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = alpha;
  }
}

/** A wobbly polyline: the core ballpoint stroke. */
export function stroke(
  ctx: Ctx2D,
  pts: [number, number][],
  r: () => number,
  o: StrokeOpts = {}
) {
  const { color = INK, width = 2, jitter = 1.6, alpha = 0.92, passes = 2 } = o;
  const smudgeOpt = o.smudge ?? color === WARM_BLUE;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  if (smudgeOpt) {
    // her left hand following the pen: two soft grey passes dragged
    // down-left under the real ink (white ghost on TINT canvases)
    const cfg: SmudgeOpts = typeof smudgeOpt === 'object' ? smudgeOpt : {};
    const scale = cfg.scale ?? 1;
    const dx = cfg.vertical ? 0 : -2.2 * scale;
    const dy = 2.6 * scale;
    ctx.strokeStyle = color === TINT ? TINT : SMUDGE_GREY;
    for (const [mult, alpha] of [
      [1, cfg.alpha ?? 0.16],
      [2.1, (cfg.alpha ?? 0.16) * 0.38],
    ] as const) {
      ctx.globalAlpha = alpha;
      ctx.lineWidth = width * 2.2;
      const s = jitterPoints(
        pts.map(([x, y]) => [x + dx * mult, y + dy * mult] as [number, number]),
        jitter * 1.4,
        r
      );
      ctx.beginPath();
      ctx.moveTo(s[0][0], s[0][1]);
      for (let i = 1; i < s.length; i++) {
        const [px, py] = s[i - 1];
        const [x, y] = s[i];
        ctx.quadraticCurveTo(px, py, (px + x) / 2, (py + y) / 2);
      }
      ctx.stroke();
    }
  }
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  for (let p = 0; p < passes; p++) {
    const j = jitterPoints(pts, jitter * (p === 0 ? 1 : 1.8), r);
    const cp = curvePoints(j);
    if (p > 0) {
      /*
       * MIS-REGISTRATION. A second pass over a line you have already
       * drawn does not land on it: the hand comes back at a slightly
       * different angle, so the two centrelines separate and rejoin
       * along the length. Jittering the same points (what this did
       * before) gives noise around a shared centre, which is not the
       * same thing and is why doubled strokes used to read as one
       * thick stroke.
       */
      const ang = r() * Math.PI * 2;
      const amp = width * (0.26 + r() * 0.3);
      const swing = bandNoise(r, 2);
      const n = cp.length;
      for (let i = 0; i < n; i++) {
        const t = n > 1 ? i / (n - 1) : 0;
        const k = amp * (0.45 + 0.55 * swing(t));
        cp[i] = [cp[i][0] + Math.cos(ang) * k, cp[i][1] + Math.sin(ang) * k];
      }
    }
    inkPass(ctx, cp, width * (p === 0 ? 1 : 0.72), alpha * (p === 0 ? 1 : 0.35), r, {
      taper: true,
      skip: p === 0,
    });
  }
  ctx.globalAlpha = 1;
}

/**
 * Straight-ish line subdivided so wobble can act on it.
 *
 * Nobody rules a line straight. A hand drawing along a straight edge
 * bows away from it — the wrist is a compass — and the bow is always to
 * one side for the whole length, which is what tells the eye a person
 * drew it. So every line carries a seeded single-sign bow whose depth
 * grows with its length, and long lines are subdivided far more finely
 * than six segments, because six segments over four hundred pixels is
 * exactly the stair-step the art director found.
 */
export function line(
  ctx: Ctx2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  r: () => number,
  o: StrokeOpts = {},
  segs?: number
) {
  const len = Math.hypot(x2 - x1, y2 - y1);
  const n = segs ?? Math.max(6, Math.min(26, Math.round(len / 14)));
  // perpendicular, and a bow that commits to one side
  const px = len > 1e-4 ? -(y2 - y1) / len : 0;
  const py = len > 1e-4 ? (x2 - x1) / len : 0;
  const bow = (r() - 0.5) * 2;
  const depth = Math.min(3.4, len * 0.008) * (0.35 + Math.abs(bow)) * Math.sign(bow || 1);
  const pts: [number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const arc = Math.sin(t * Math.PI) * depth;
    pts.push([x1 + (x2 - x1) * t + px * arc, y1 + (y2 - y1) * t + py * arc]);
  }
  stroke(ctx, pts, r, o);
}

/** A hand-drawn circle that doesn't quite close — the doodle staple. */
export function scribbleCircle(
  ctx: Ctx2D,
  cx: number,
  cy: number,
  rad: number,
  r: () => number,
  o: StrokeOpts = {},
  loops = 1.15
) {
  const pts: [number, number][] = [];
  const n = Math.max(14, Math.floor(rad * 0.9));
  for (let i = 0; i <= n * loops; i++) {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    const rr = rad * (1 + (r() - 0.5) * 0.12);
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
  }
  stroke(ctx, pts, r, { jitter: rad * 0.04, ...o });
}

/** Parallel hatching inside a clip path the caller sets up. */
export function hatch(
  ctx: Ctx2D,
  x: number,
  y: number,
  w: number,
  h: number,
  angle: number,
  gap: number,
  r: () => number,
  o: StrokeOpts = {}
) {
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate(angle);
  const d = Math.hypot(w, h);
  for (let yy = -d / 2; yy <= d / 2; yy += gap * (0.8 + r() * 0.4)) {
    line(ctx, -d / 2, yy, d / 2, yy + (r() - 0.5) * gap, r, {
      width: 1.2,
      jitter: 1.1,
      alpha: 0.5,
      passes: 1,
      ...o,
    }, 4);
  }
  ctx.restore();
}

/** Frantic zig-zag fill — for crossed-out things and heavy shading. */
export function scribbleFill(
  ctx: Ctx2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: () => number,
  o: StrokeOpts = {}
) {
  const pts: [number, number][] = [];
  const rows = Math.max(3, Math.floor(h / 7));
  for (let i = 0; i <= rows; i++) {
    const yy = y + (h * i) / rows;
    pts.push(i % 2 === 0 ? [x, yy] : [x + w, yy]);
    pts.push(i % 2 === 0 ? [x + w, yy + h / rows / 2] : [x, yy + h / rows / 2]);
  }
  stroke(ctx, pts, r, { width: 1.6, jitter: 2.5, alpha: 0.55, passes: 1, ...o });
}

export function makeCanvas(w: number, h: number) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return { canvas: c, ctx: c.getContext('2d')! };
}

export function toTexture(canvas: HTMLCanvasElement): THREE.CanvasTexture {
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  t.generateMipmaps = true;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  return t;
}

export function makeTexture(
  w: number,
  h: number,
  seed: number,
  draw: (ctx: Ctx2D, r: () => number, w: number, h: number) => void
): THREE.CanvasTexture {
  const { canvas, ctx } = makeCanvas(w, h);
  draw(ctx, rng(seed), w, h);
  return toTexture(canvas);
}

/* ------------------------------------------------------------------ */
/* Hand lettering — text as drawing, never ctx font (RULINGS #10)      */
/* ------------------------------------------------------------------ */

type Glyph = [number, number][][];

// Skeleton caps in a unit box (x 0–1, y 0 top – 1 baseline). Deliberately
// crooked once the per-letter jitter/slant lands on them.
const GLYPHS: Record<string, Glyph> = {
  A: [[[0, 1], [0.5, 0], [1, 1]], [[0.22, 0.62], [0.78, 0.62]]],
  B: [[[0.05, 0], [0.05, 1]], [[0.05, 0], [0.8, 0.06], [0.82, 0.28], [0.05, 0.5]], [[0.05, 0.5], [0.9, 0.56], [0.92, 0.82], [0.05, 1]]],
  C: [[[0.9, 0.14], [0.5, 0], [0.1, 0.18], [0, 0.5], [0.1, 0.82], [0.5, 1], [0.9, 0.86]]],
  D: [[[0.05, 0], [0.05, 1]], [[0.05, 0], [0.7, 0.08], [0.95, 0.5], [0.7, 0.92], [0.05, 1]]],
  E: [[[0.95, 0], [0.05, 0.02], [0.05, 1], [0.95, 0.98]], [[0.05, 0.5], [0.68, 0.5]]],
  F: [[[0.95, 0], [0.05, 0.02], [0.05, 1]], [[0.05, 0.5], [0.62, 0.5]]],
  G: [[[0.9, 0.12], [0.5, 0], [0.1, 0.2], [0, 0.5], [0.1, 0.85], [0.5, 1], [0.9, 0.9], [0.92, 0.56], [0.55, 0.56]]],
  H: [[[0.05, 0], [0.05, 1]], [[0.95, 0], [0.95, 1]], [[0.05, 0.52], [0.95, 0.5]]],
  I: [[[0.5, 0], [0.5, 1]]],
  J: [[[0.8, 0], [0.8, 0.78], [0.5, 1], [0.15, 0.86]]],
  K: [[[0.05, 0], [0.05, 1]], [[0.9, 0], [0.08, 0.56]], [[0.32, 0.42], [0.95, 1]]],
  L: [[[0.08, 0], [0.05, 1], [0.9, 1]]],
  M: [[[0, 1], [0.06, 0], [0.5, 0.6], [0.94, 0], [1, 1]]],
  N: [[[0.02, 1], [0.06, 0], [0.94, 1], [0.98, 0]]],
  O: [[[0.5, 0], [0.12, 0.16], [0, 0.52], [0.14, 0.86], [0.5, 1], [0.87, 0.84], [1, 0.5], [0.86, 0.14], [0.5, 0]]],
  P: [[[0.05, 1], [0.05, 0]], [[0.05, 0], [0.85, 0.08], [0.85, 0.46], [0.05, 0.54]]],
  Q: [[[0.5, 0], [0.12, 0.16], [0, 0.52], [0.14, 0.86], [0.5, 1], [0.87, 0.84], [1, 0.5], [0.86, 0.14], [0.5, 0]], [[0.6, 0.7], [1, 1.06]]],
  R: [[[0.05, 1], [0.05, 0]], [[0.05, 0], [0.85, 0.08], [0.85, 0.46], [0.05, 0.54]], [[0.3, 0.54], [0.95, 1]]],
  S: [[[0.9, 0.12], [0.5, 0], [0.12, 0.16], [0.2, 0.44], [0.8, 0.56], [0.9, 0.84], [0.5, 1], [0.08, 0.88]]],
  T: [[[0, 0.02], [1, 0]], [[0.5, 0], [0.5, 1]]],
  U: [[[0.05, 0], [0.05, 0.74], [0.22, 1], [0.78, 1], [0.95, 0.74], [0.95, 0]]],
  V: [[[0.02, 0], [0.5, 1], [0.98, 0]]],
  W: [[[0, 0], [0.25, 1], [0.5, 0.34], [0.75, 1], [1, 0]]],
  X: [[[0.05, 0], [0.95, 1]], [[0.95, 0], [0.05, 1]]],
  Y: [[[0.02, 0], [0.5, 0.5], [0.98, 0]], [[0.5, 0.5], [0.5, 1]]],
  Z: [[[0.05, 0.02], [0.95, 0], [0.05, 1], [0.95, 0.98]]],
  '0': [[[0.5, 0], [0.15, 0.2], [0.08, 0.55], [0.2, 0.9], [0.5, 1], [0.82, 0.86], [0.92, 0.5], [0.84, 0.16], [0.5, 0]]],
  '1': [[[0.3, 0.22], [0.55, 0], [0.55, 1]]],
  '2': [[[0.1, 0.24], [0.4, 0], [0.85, 0.14], [0.78, 0.5], [0.06, 1], [0.95, 0.98]]],
  '3': [[[0.1, 0.1], [0.6, 0], [0.85, 0.24], [0.5, 0.48], [0.9, 0.7], [0.6, 1], [0.1, 0.9]]],
  '4': [[[0.7, 1], [0.7, 0], [0.06, 0.7], [0.95, 0.7]]],
  '5': [[[0.9, 0], [0.16, 0.02], [0.1, 0.46], [0.7, 0.4], [0.9, 0.7], [0.6, 1], [0.1, 0.9]]],
  '6': [[[0.8, 0.04], [0.3, 0.3], [0.1, 0.7], [0.4, 1], [0.8, 0.85], [0.74, 0.55], [0.16, 0.6]]],
  '7': [[[0.06, 0.02], [0.95, 0], [0.4, 1]]],
  '8': [[[0.5, 0.5], [0.16, 0.3], [0.5, 0], [0.84, 0.3], [0.5, 0.5], [0.12, 0.76], [0.5, 1], [0.88, 0.76], [0.5, 0.5]]],
  '9': [[[0.85, 0.3], [0.5, 0.56], [0.16, 0.3], [0.5, 0], [0.85, 0.3], [0.74, 1]]],
  '.': [[[0.45, 0.92], [0.52, 0.96], [0.48, 1]]],
  ',': [[[0.52, 0.9], [0.5, 1], [0.36, 1.14]]],
  "'": [[[0.5, 0], [0.46, 0.22]]],
  '-': [[[0.15, 0.55], [0.85, 0.52]]],
  ':': [[[0.48, 0.3], [0.52, 0.36]], [[0.48, 0.82], [0.52, 0.88]]],
  '!': [[[0.5, 0], [0.5, 0.66]], [[0.48, 0.9], [0.53, 0.96]]],
  '?': [[[0.15, 0.2], [0.45, 0], [0.85, 0.16], [0.8, 0.42], [0.5, 0.55], [0.5, 0.68]], [[0.49, 0.9], [0.54, 0.96]]],
  '/': [[[0.85, 0], [0.15, 1]]],
};

export type LetteringOpts = StrokeOpts & {
  /** Extra crookedness of placement (0 tidy draftsman – 1 age-seven). */
  crooked?: number;
  /** Letter slant in x-per-y (positive leans right). */
  slant?: number;
  /** Letter spacing multiplier. */
  tracking?: number;
};

/**
 * Hand-lettered caps built from the stroke library — her crooked print,
 * his ruled draftsman letters, world-scale scrawls. Lowercase input maps
 * to the same caps drawn smaller (a kid's mixed print). Returns the pen's
 * end x so callers can continue a line.
 */
export function lettering(
  ctx: Ctx2D,
  text: string,
  x: number,
  y: number,
  size: number,
  r: () => number,
  o: LetteringOpts = {}
): number {
  const { crooked = 0.5, slant = 0, tracking = 1, ...strokeOpts } = o;
  let cx = x;
  for (const ch of text) {
    if (ch === ' ') {
      cx += size * 0.42 * tracking;
      continue;
    }
    const upper = ch.toUpperCase();
    const glyph = GLYPHS[upper] ?? GLYPHS[ch];
    if (!glyph) {
      cx += size * 0.42 * tracking;
      continue;
    }
    const small = ch !== upper || ch === ch.toLowerCase();
    const gs = size * (small && /[a-z]/.test(ch) ? 0.78 : 1);
    const gw = gs * 0.66;
    const baseWob = (r() - 0.5) * size * 0.16 * crooked;
    const rot = (r() - 0.5) * 0.14 * crooked;
    for (const strokePts of glyph) {
      const pts: [number, number][] = strokePts.map(([gx, gy]) => {
        const lx = (gx - 0.5) * gw;
        const ly = (gy - 1) * gs;
        const rx = lx * Math.cos(rot) - ly * Math.sin(rot) - ly * slant;
        const ry = lx * Math.sin(rot) + ly * Math.cos(rot);
        return [cx + gw / 2 + rx, y + baseWob + ry];
      });
      stroke(ctx, pts, r, {
        width: Math.max(1.4, size * 0.075),
        jitter: size * 0.03 * (0.5 + crooked),
        ...strokeOpts,
      });
    }
    cx += gw + size * 0.16 * tracking + (r() - 0.5) * size * 0.06 * crooked;
  }
  return cx;
}

/** Width one `lettering()` run will occupy at a given size. */
export function letteringWidth(text: string, size: number, tracking = 1): number {
  return text.length * (size * 0.66 + size * 0.16 * tracking);
}

/**
 * Hand-lettering that fits the space it was given: picks the largest
 * size at or under `maxSize` whose run fits `maxWidth`. Text as drawing
 * still has to sit on the object it is drawn on.
 */
export function letteringFit(
  ctx: Ctx2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  maxSize: number,
  r: () => number,
  o: LetteringOpts = {}
): number {
  const tracking = o.tracking ?? 1;
  let size = maxSize;
  if (letteringWidth(text, size, tracking) > maxWidth) {
    size = maxWidth / (text.length * (0.66 + 0.16 * tracking));
  }
  return lettering(ctx, text, x, y, size, r, o);
}

/* ------------------------------------------------------------------ */
/* Shared art pieces                                                   */
/* ------------------------------------------------------------------ */

/** Small shoe print — the signature mark. Points "up" (−Y). */
export function footprintTexture(color = INK): THREE.CanvasTexture {
  return makeTexture(64, 96, 7, (ctx, r) => {
    ctx.fillStyle = color;
    // sole
    ctx.globalAlpha = 0.9;
    ctx.beginPath();
    ctx.ellipse(32, 34, 15 + r() * 2, 24 + r() * 2, (r() - 0.5) * 0.15, 0, Math.PI * 2);
    ctx.fill();
    // heel
    ctx.beginPath();
    ctx.ellipse(32, 76, 11 + r() * 2, 12 + r() * 2, (r() - 0.5) * 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  });
}

/**
 * Pip's sprite sheet. 8 frames of 128×176 laid out horizontally:
 * 0 idle · 1–6 walk cycle · 7 sitting.
 */
export function characterSheet(
  color = INK,
  opts: { tuft?: boolean; scarf?: boolean; alpha?: number } = {}
): THREE.CanvasTexture {
  const FW = 128;
  const FH = 176;
  const { canvas, ctx } = makeCanvas(FW * 8, FH);
  const { tuft = true, scarf = false, alpha = 1 } = opts;
  ctx.globalAlpha = alpha;

  const drawFigure = (
    ox: number,
    pose: { legA: number; legB: number; armA: number; armB: number; bob: number; sit?: boolean },
    r: () => number
  ) => {
    ctx.save();
    ctx.translate(ox + FW / 2, 0);
    const bob = pose.bob;
    const headY = 42 + bob;
    const hipY = pose.sit ? 118 : 108 + bob;
    const shY = 68 + bob;

    // head: a scribbled circle with a confident bad tilt
    scribbleCircle(ctx, 0, headY, 22, r, { color, width: 3.4, jitter: 1.4 }, 1.2);
    if (tuft) {
      // one scribbled tuft of hair
      stroke(
        ctx,
        [
          [-4, headY - 22],
          [-9, headY - 34],
          [-1, headY - 27],
          [4, headY - 37],
          [8, headY - 26],
        ],
        r,
        { color, width: 2.6, jitter: 1.2 }
      );
    } else {
      // B.'s doodle wears a flat cap
      line(ctx, -20, headY - 16, 20, headY - 16, r, { color, width: 3 });
      stroke(
        ctx,
        [
          [-18, headY - 16],
          [-14, headY - 30],
          [14, headY - 30],
          [18, headY - 16],
        ],
        r,
        { color, width: 3, jitter: 1 }
      );
    }
    // eyes: two dots, slightly uneven
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(-7, headY + 1, 2.4, 0, Math.PI * 2);
    ctx.arc(8, headY - 1, 2.4, 0, Math.PI * 2);
    ctx.fill();

    // body
    line(ctx, 0, headY + 22, 0, hipY, r, { color, width: 3.6 }, 4);
    if (scarf) {
      line(ctx, -12, shY + 2, 12, shY + 6, r, { color: BLUE, width: 5, alpha: 0.9 }, 3);
      line(ctx, 8, shY + 6, 13, shY + 26, r, { color: BLUE, width: 4, alpha: 0.85 }, 3);
    }

    // arms
    line(
      ctx, 0, shY,
      Math.sin(pose.armA) * 26, shY + Math.cos(pose.armA) * 30,
      r, { color, width: 3 }, 4
    );
    line(
      ctx, 0, shY,
      Math.sin(pose.armB) * 26, shY + Math.cos(pose.armB) * 30,
      r, { color, width: 3 }, 4
    );

    // legs + little foot ticks
    if (pose.sit) {
      // knees up, arms around them handled by armA/armB
      stroke(ctx, [[0, hipY], [-20, hipY + 18], [-18, hipY + 44]], r, { color, width: 3.4 });
      stroke(ctx, [[0, hipY], [-8, hipY + 22], [-6, hipY + 44]], r, { color, width: 3.4 });
      line(ctx, -26, hipY + 44, -12, hipY + 46, r, { color, width: 3 }, 3);
      line(ctx, -14, hipY + 44, 0, hipY + 46, r, { color, width: 3 }, 3);
    } else {
      const foot = (a: number) => {
        const kx = Math.sin(a) * 24;
        const ky = hipY + Math.cos(a) * 40;
        line(ctx, 0, hipY, kx, ky, r, { color, width: 3.4 }, 4);
        line(ctx, kx, ky, kx + 10, ky + 2, r, { color, width: 3 }, 2);
      };
      foot(pose.legA);
      foot(pose.legB);
    }
    ctx.restore();
  };

  const r = rng(101);
  // idle
  drawFigure(0, { legA: -0.12, legB: 0.12, armA: -0.25, armB: 0.25, bob: 0 }, r);
  // walk cycle: legs and arms counter-swing, body bobs
  for (let i = 0; i < 6; i++) {
    const t = (i / 6) * Math.PI * 2;
    drawFigure(FW * (1 + i), {
      legA: Math.sin(t) * 0.62,
      legB: Math.sin(t + Math.PI) * 0.62,
      armA: Math.sin(t + Math.PI) * 0.5 - 0.05,
      armB: Math.sin(t) * 0.5 + 0.05,
      bob: Math.abs(Math.sin(t)) * -3,
    }, r);
  }
  // sitting
  drawFigure(FW * 7, { legA: 0, legB: 0, armA: -0.9, armB: -0.6, bob: 4, sit: true }, r);

  const t = toTexture(canvas);
  t.magFilter = THREE.LinearFilter;
  return t;
}

/** Soft round contact shadow. */
export function blobShadowTexture(): THREE.CanvasTexture {
  const { canvas, ctx } = makeCanvas(128, 128);
  const g = ctx.createRadialGradient(64, 64, 4, 64, 64, 60);
  g.addColorStop(0, 'rgba(35,38,51,0.30)');
  g.addColorStop(1, 'rgba(35,38,51,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  return toTexture(canvas);
}

/** A folded margin note standing on the page, corner lifted. */
export function noteTexture(): THREE.CanvasTexture {
  return makeTexture(96, 96, 21, (ctx, r) => {
    ctx.fillStyle = 'rgba(250,248,241,0.96)';
    ctx.save();
    ctx.translate(48, 52);
    ctx.rotate(-0.06);
    ctx.fillRect(-30, -36, 60, 76);
    ctx.restore();
    stroke(ctx, [[18, 16], [78, 20], [76, 90], [16, 86], [18, 16]], r, { width: 2.2, jitter: 1.4 });
    // folded corner
    stroke(ctx, [[78, 20], [64, 20], [78, 36]], r, { width: 1.8, jitter: 1 });
    // faint writing
    for (let i = 0; i < 4; i++) {
      line(ctx, 26, 34 + i * 13, 66 + (r() - 0.5) * 8, 36 + i * 13, r, {
        width: 1.4, alpha: 0.4, passes: 1, jitter: 2,
      }, 4);
    }
    // blue signature dash
    line(ctx, 48, 84, 66, 82, r, { color: BLUE, width: 2, alpha: 0.8, passes: 1 }, 3);
  });
}

/** Vantage / walk-target ring drawn on the ground. */
export function ringTexture(color = INK): THREE.CanvasTexture {
  return makeTexture(128, 128, 33, (ctx, r) => {
    scribbleCircle(ctx, 64, 64, 46, r, { color, width: 2.6, alpha: 0.75 }, 1.3);
    scribbleCircle(ctx, 64, 64, 34, r, { color, width: 1.6, alpha: 0.4 }, 1.05);
  });
}

/** Sparse grass tuft. */
export function grassTexture(color = INK): THREE.CanvasTexture {
  return makeTexture(96, 64, 45, (ctx, r) => {
    for (let i = 0; i < 5; i++) {
      const x = 16 + i * 16 + (r() - 0.5) * 8;
      stroke(
        ctx,
        [
          [x, 60],
          [x + (r() - 0.5) * 10, 34 + r() * 10],
          [x + (r() - 0.5) * 16, 14 + r() * 10],
        ],
        r,
        { color, width: 2, jitter: 1.4, alpha: 0.85 }
      );
    }
  });
}

/** Loop-de-loop practice scribble, used as meadow "hills" ground decals. */
export function loopsTexture(color = INK): THREE.CanvasTexture {
  return makeTexture(256, 96, 57, (ctx, r) => {
    const pts: [number, number][] = [];
    for (let i = 0; i <= 60; i++) {
      const t = i / 60;
      const x = 12 + t * 232;
      const y = 52 + Math.sin(t * Math.PI * 6) * 26 * Math.sin(t * Math.PI);
      pts.push([x, y]);
    }
    stroke(ctx, pts, r, { color, width: 2.4, jitter: 1.6, alpha: 0.6 });
  });
}

/* ------------------------------------------------------------------ */
/* Typeset glyph kit — the old renderer with its humanity turned off    */
/* (ch05 §4). Machine letters: line() only, no midpoint curving, near-  */
/* zero jitter, one pass, exact baselines. The contrast with every      */
/* wobbling mark in the first four chapters IS the theme.               */
/* ------------------------------------------------------------------ */

// 16-segment cell. Unit box, y=0 top. Order:
// a1 a2 b c d1 d2 e f g1 g2 h i j k l m
const SEG: [number, number, number, number][] = [
  [0, 0, 0.5, 0], [0.5, 0, 1, 0],            // a1 a2 — top
  [1, 0, 1, 0.5], [1, 0.5, 1, 1],            // b c  — right
  [0.5, 1, 0, 1], [1, 1, 0.5, 1],            // d1 d2 — bottom
  [0, 1, 0, 0.5], [0, 0.5, 0, 0],            // e f  — left
  [0, 0.5, 0.5, 0.5], [0.5, 0.5, 1, 0.5],    // g1 g2 — middle
  [0, 0, 0.5, 0.5], [0.5, 0, 0.5, 0.5],      // h i  — upper diag/vert
  [1, 0, 0.5, 0.5], [0.5, 0.5, 1, 1],        // j k
  [0.5, 0.5, 0.5, 1], [0.5, 0.5, 0, 1],      // l m
  // the D's bowl (S9): two long diagonals meeting at mid-right, so the
  // letter's identity is carried by strokes big enough to survive
  // minification — the centre-stem D read as a zero at render size
  [0.5, 0, 1, 0.5], [1, 0.5, 0.5, 1],        // n o — angled right bowl
];
const S = {
  a1: 0, a2: 1, b: 2, c: 3, d1: 4, d2: 5, e: 6, f: 7,
  g1: 8, g2: 9, h: 10, i: 11, j: 12, k: 13, l: 14, m: 15,
  n: 16, o: 17,
};
const CAPS: Record<string, number[]> = {
  A: [S.a1, S.a2, S.b, S.c, S.e, S.f, S.g1, S.g2],
  // B and D used to differ by ONE middle bar on an otherwise identical
  // barred rectangle, so the game's midpoint document read "SAI INGS
  // BONI" — the Awwwards juror's Fix 3, on the one piece of text in
  // the game the budget licenses reading. B takes the LEFT stem and
  // square bowls; D takes the CENTRE stem and only the right side.
  B: [S.f, S.e, S.a1, S.a2, S.b, S.g1, S.g2, S.c, S.d1, S.d2],
  C: [S.a1, S.a2, S.f, S.e, S.d1, S.d2],
  // D (S9, round 6): the old centre-stem D ("barred") hung its identity
  // on one thin vertical that mipmapping erased, and the survivors —
  // half-top, right side, half-bottom — read as a zero ("BE0FOR0",
  // "0OYLE", "BON0" at reading distance, two rounds running). This D is
  // a full LEFT stem and an angled right bowl: every identity-bearing
  // stroke is long, and no subset of them closes into an O.
  D: [S.e, S.f, S.a1, S.d1, S.n, S.o],
  E: [S.a1, S.a2, S.f, S.e, S.d1, S.d2, S.g1],
  F: [S.a1, S.a2, S.f, S.e, S.g1],
  G: [S.a1, S.a2, S.f, S.e, S.d1, S.d2, S.c, S.g2],
  H: [S.b, S.c, S.e, S.f, S.g1, S.g2],
  I: [S.a1, S.a2, S.d1, S.d2, S.i, S.l],
  J: [S.b, S.c, S.d1, S.d2, S.e],
  K: [S.e, S.f, S.g1, S.j, S.k],
  L: [S.e, S.f, S.d1, S.d2],
  M: [S.e, S.f, S.b, S.c, S.h, S.j],
  N: [S.e, S.f, S.b, S.c, S.h, S.k],
  O: [S.a1, S.a2, S.b, S.c, S.d1, S.d2, S.e, S.f],
  P: [S.a1, S.a2, S.b, S.f, S.e, S.g1, S.g2],
  Q: [S.a1, S.a2, S.b, S.c, S.d1, S.d2, S.e, S.f, S.k],
  R: [S.a1, S.a2, S.b, S.f, S.e, S.g1, S.g2, S.k],
  S: [S.a1, S.a2, S.f, S.g1, S.g2, S.c, S.d1, S.d2],
  T: [S.a1, S.a2, S.i, S.l],
  U: [S.b, S.c, S.d1, S.d2, S.e, S.f],
  V: [S.h, S.j],
  W: [S.e, S.f, S.b, S.c, S.m, S.k],
  X: [S.h, S.j, S.k, S.m],
  Y: [S.h, S.j, S.l],
  Z: [S.a1, S.a2, S.j, S.m, S.d1, S.d2],
  '0': [S.a1, S.a2, S.b, S.c, S.d1, S.d2, S.e, S.f, S.j, S.m],
  '1': [S.i, S.l],
  '2': [S.a1, S.a2, S.b, S.g1, S.g2, S.e, S.d1, S.d2],
  '3': [S.a1, S.a2, S.b, S.c, S.d1, S.d2, S.g2],
  '4': [S.f, S.g1, S.g2, S.b, S.c],
  '5': [S.a1, S.a2, S.f, S.g1, S.g2, S.c, S.d1, S.d2],
  '6': [S.a1, S.a2, S.f, S.e, S.d1, S.d2, S.c, S.g1, S.g2],
  '7': [S.a1, S.a2, S.b, S.c],
  '8': [S.a1, S.a2, S.b, S.c, S.d1, S.d2, S.e, S.f, S.g1, S.g2],
  '9': [S.a1, S.a2, S.b, S.f, S.g1, S.g2, S.c, S.d1, S.d2],
  '-': [S.g1, S.g2],
  // legibleCaps silently drew nothing for an unmapped character and
  // advanced the pen anyway, which is how a savings bond lost its money
  '$': [S.a1, S.a2, S.f, S.g1, S.g2, S.c, S.d1, S.d2, S.i, S.l],
  "'": [S.i],
  // the machine's remaining vocabulary (S9): the receipt and the
  // clipping are typeset in-fiction, so their punctuation is segments
  // too, never a font
  '/': [S.j, S.m],
  '—': [S.g1, S.g2],
  '–': [S.g1, S.g2],
  '+': [S.g1, S.g2, S.i, S.l],
  '#': [S.i, S.l, S.b, S.c, S.g1, S.g2],
  '!': [S.i],
  '(': [S.a2, S.i, S.l, S.d2],
  ')': [S.a1, S.i, S.l, S.d1],
};
const GREEK_POOL = Object.keys(CAPS).filter((k) => /[A-Z]/.test(k));

export type TypeOpts = {
  color?: string;
  width?: number;
  alpha?: number;
  /** Machine tolerance. Above ~0.4 it stops reading as type. */
  jitter?: number;
};

/** One 16-segment cell from a segment mask. Every segment is one line(). */
export function typeGlyph(
  ctx: Ctx2D,
  x: number,
  y: number,
  w: number,
  h: number,
  mask: number[],
  r: () => number,
  o: TypeOpts = {}
) {
  const { color = INK, width = 1.6, alpha = 0.92, jitter = 0.2 } = o;
  for (const si of mask) {
    const [x1, y1, x2, y2] = SEG[si];
    line(ctx, x + x1 * w, y + y1 * h, x + x2 * w, y + y2 * h, r, {
      color, width, alpha, jitter, passes: 1, smudge: false,
    }, 2);
  }
}

/**
 * Real letters, machine-set. Only for text the budget licenses reading —
 * the clipping's headline band and its one-name caption.
 */
export function legibleCaps(
  ctx: Ctx2D,
  text: string,
  x: number,
  y: number,
  size: number,
  r: () => number,
  o: TypeOpts = {}
): number {
  const w = size * 0.62;
  const gap = size * 0.24;
  let cx = x;
  for (const ch of text.toUpperCase()) {
    if (ch === ' ') {
      cx += w * 0.7;
      continue;
    }
    if (ch === '.' || ch === ',') {
      ctx.fillStyle = o.color ?? INK;
      ctx.globalAlpha = o.alpha ?? 0.92;
      ctx.fillRect(cx + w * 0.2, y + (ch === '.' ? size * 0.92 : size * 0.95), size * 0.12, size * 0.12);
      ctx.globalAlpha = 1;
      cx += w * 0.5;
      continue;
    }
    // dotted punctuation the segment cell cannot say (S9): the machine
    // still gets to punctuate its own receipt
    if (ch === ':' || ch === '"' || ch === '%') {
      ctx.fillStyle = o.color ?? INK;
      ctx.globalAlpha = o.alpha ?? 0.92;
      if (ch === ':') {
        ctx.fillRect(cx + w * 0.36, y + size * 0.28, size * 0.12, size * 0.12);
        ctx.fillRect(cx + w * 0.36, y + size * 0.78, size * 0.12, size * 0.12);
      } else if (ch === '"') {
        ctx.fillRect(cx + w * 0.2, y, size * 0.1, size * 0.24);
        ctx.fillRect(cx + w * 0.55, y, size * 0.1, size * 0.24);
      } else {
        ctx.fillRect(cx + w * 0.02, y + size * 0.04, size * 0.14, size * 0.14);
        ctx.fillRect(cx + w * 0.78, y + size * 0.82, size * 0.14, size * 0.14);
        ctx.globalAlpha = 1;
        typeGlyph(ctx, cx, y, w, size, CAPS['/'], r, { width: Math.max(1.2, size * 0.09), ...o });
      }
      ctx.globalAlpha = 1;
      cx += w * (ch === ':' ? 0.6 : 1) + (ch === ':' ? 0 : gap);
      continue;
    }
    const mask = CAPS[ch];
    if (mask) typeGlyph(ctx, cx, y, w, size, mask, r, { width: Math.max(1.2, size * 0.09), ...o });
    if (ch === '!') {
      ctx.fillStyle = o.color ?? INK;
      ctx.globalAlpha = o.alpha ?? 0.92;
      ctx.fillRect(cx + w * 0.44, y + size * 0.9, size * 0.12, size * 0.12);
      ctx.globalAlpha = 1;
    }
    cx += w + gap;
  }
  return cx;
}

/**
 * Greeked body copy: rows of type cells with strict leading, word-gap runs
 * and a short last line. Unreadable at column scale, unmistakably type.
 */
export function greekColumn(
  ctx: Ctx2D,
  x: number,
  y: number,
  w: number,
  lines: number,
  r: () => number,
  o: TypeOpts & { size?: number; leading?: number } = {}
) {
  const size = o.size ?? 9;
  const leading = o.leading ?? size * 1.75;
  const cw = size * 0.62;
  const gap = size * 0.24;
  for (let ln = 0; ln < lines; ln++) {
    const ly = y + ln * leading;
    // last line runs short, like a paragraph end
    const fill = ln === lines - 1 ? 0.35 + r() * 0.4 : 1;
    let cx = x;
    let wordLeft = 2 + Math.floor(r() * 7);
    while (cx < x + w * fill - cw) {
      if (wordLeft === 0) {
        cx += cw * 0.7;
        wordLeft = 2 + Math.floor(r() * 7);
        continue;
      }
      const ch = GREEK_POOL[Math.floor(r() * GREEK_POOL.length)];
      typeGlyph(ctx, cx, ly, cw, size, CAPS[ch], r, {
        width: Math.max(1, size * 0.1), alpha: 0.72, ...o,
      });
      cx += cw + gap;
      wordLeft--;
    }
  }
}

/**
 * Strict-grid halftone: dot radius modulated by a density function. The
 * clipping's photo block — their drawing, mechanically reproduced.
 */
export function halftoneBlock(
  ctx: Ctx2D,
  x: number,
  y: number,
  w: number,
  h: number,
  density: (u: number, v: number) => number,
  o: { pitch?: number; color?: string; maxR?: number } = {}
) {
  const pitch = o.pitch ?? 7;
  const maxR = o.maxR ?? pitch * 0.52;
  ctx.fillStyle = o.color ?? INK;
  for (let gy = 0; gy * pitch < h; gy++) {
    for (let gx = 0; gx * pitch < w; gx++) {
      const u = (gx * pitch) / w;
      const v = (gy * pitch) / h;
      const d = Math.max(0, Math.min(1, density(u, v)));
      if (d <= 0.02) continue;
      ctx.beginPath();
      ctx.arc(x + gx * pitch + pitch / 2, y + gy * pitch + pitch / 2, maxR * d, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
