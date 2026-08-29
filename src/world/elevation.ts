import { WORLD, REGION_SPECS, RIVER, BRIDGES, PONDS, coastX, type RegionId } from './layout';

/**
 * THE PAPER HAS A SHAPE.
 *
 * Session 4. The flat ground was never a design decision — it arrived
 * from margins, a book of flat pages, and then got written into the
 * quality bar as if it were law. It is gone.
 *
 * Paper is flat. Paper is not rigid. So the terrain vocabulary is the
 * SHEET'S OWN vocabulary, not generic hills (WORLD-SYSTEMS §1):
 *
 *   the crease   a hard fold with a shadow in it — this page was folded
 *                once, north to south, and the fold is a real valley the
 *                east road dives through
 *   the curl     the margins lift, as paper always does — the world's
 *                rim is a ridge you can climb and look back from, and
 *                past it the sheet's edge stands proud of the desk
 *   the buckle   where the wash went on wet, the paper cockled — the
 *                rolling ground of the common and the downs
 *   the tear     the page ripped; SPLITROCK is that rip
 *   under it     a book under the page lifts CASTLE GREYWEATHER onto a
 *                real ridge with one way up
 *
 * Amplitude is deliberately LOW — roughly 0–12 units across a sheet 760
 * units wide — with three authored exceptions: the castle ridge (+12.5,
 * the high seat, and the highest ground in the world), the tear (−13),
 * and the curled rim (+9). A paper landscape is a landscape of shallow
 * folds; anything taller stops reading as paper and starts reading as
 * terrain from some other game.
 *
 * EVERYTHING agrees on one grid. The mesh is displaced from it, the
 * shading is differentiated from it, the walker stands on it, props are
 * placed on it and collision reads it. There is no second opinion about
 * where the ground is.
 */

/** Grid pitch, in world units. The terrain mesh uses the same pitch, so
 *  its vertices land exactly on grid nodes and mesh and CPU never
 *  disagree about the ground. Nothing in the height field is authored
 *  finer than ~12 units, so this resolves every feature. */
export const H_STEP = 4;
/** The field covers the whole terrain plane, desk included. */
export const H_MIN_X = -700;
export const H_MAX_X = 700;
export const H_MIN_Z = -600;
export const H_MAX_Z = 600;
export const H_NX = Math.round((H_MAX_X - H_MIN_X) / H_STEP) + 1;
export const H_NZ = Math.round((H_MAX_Z - H_MIN_Z) / H_STEP) + 1;

/** The sheet's nominal plane, the next sheet down, and the desk. These
 *  match the bands terrain.ts's fragment shader already paints. */
export const NEXT_SHEET_Y = -2.2;
export const DESK_Y = -4.4;
/** How far past WORLD the sheet's paint runs. Must match terrain.ts's
 *  `uSheet` pad, or the page's paint and the page's edge part company. */
export const SHEET_PAD = 14;

/** Past this gradient the page is too steep to walk. Free traversal
 *  gating: it is what makes the castle ramp the only way up. */
export const MAX_WALK_SLOPE = 0.72;

/* ------------------------------------------------------------------ *
 * Small deterministic helpers. No Math.random anywhere in this file —
 * the sheet must fold identically on every machine, forever.
 * ------------------------------------------------------------------ */

const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t);

function smoothstep(a: number, b: number, x: number): number {
  const t = clamp01((x - a) / (b - a || 1e-6));
  return t * t * (3 - 2 * t);
}

/** A gaussian bump, the workhorse of every authored landform here. */
const bump = (u: number) => Math.exp(-u * u);

/** Soft maximum: landforms MEET, they do not stack. The curl running
 *  into the castle ridge must read as one continuous piece of paper,
 *  not as two features added together into a spike. */
function smax(a: number, b: number, k: number): number {
  const h = clamp01(0.5 + (0.5 * (b - a)) / k);
  return a * (1 - h) + b * h + k * h * (1 - h);
}

function hash2(ix: number, iz: number): number {
  let h = (ix * 374761393 + iz * 668265263) >>> 0;
  h = (h ^ (h >>> 13)) >>> 0;
  h = Math.imul(h, 1274126177) >>> 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}

/** Value noise on a unit lattice — the cockle of a sheet that dried
 *  unevenly. Smooth by construction, so the mesh never facets. */
function vnoise(x: number, z: number): number {
  const ix = Math.floor(x);
  const iz = Math.floor(z);
  const fx = x - ix;
  const fz = z - iz;
  const ux = fx * fx * (3 - 2 * fx);
  const uz = fz * fz * (3 - 2 * fz);
  const a = hash2(ix, iz);
  const b = hash2(ix + 1, iz);
  const c = hash2(ix, iz + 1);
  const d = hash2(ix + 1, iz + 1);
  return (a + (b - a) * ux) * (1 - uz) + (c + (d - c) * ux) * uz;
}

/* ------------------------------------------------------------------ *
 * How wet each land got.
 *
 * The buckle is not uniform: a wash cockles the paper where it pooled
 * and leaves it flat where the page stayed dry. That is the excuse the
 * metaphor gives us for per-land control of the rolling ground, and it
 * is a real design lever — the downs roll, the office park does not.
 * Weights blend across a 34-unit ramp inside each rect so no border is
 * ever a step in the ground.
 * ------------------------------------------------------------------ */

const COCKLE: Record<RegionId, number> = {
  ocean: 0.15,
  beach: 0.55,
  castle: 0.45,
  kingdom: 0.40,
  meadow: 0.85,
  neighborhood: 0.75,
  forest: 1.05,
  canyon: 0.70,
  downs: 1.30,
  desert: 0.30,
  city: 0.22,
  office: 0.18,
};

const RAMP = 34;

/** Partition of unity over the twelve rects: a smooth per-land weight
 *  with no seams. Used for cockle amplitude only — landforms are
 *  authored by hand, never by region. */
function cockleAt(x: number, z: number): number {
  let sum = 0;
  let acc = 0;
  for (const s of REGION_SPECS) {
    const r = s.rect;
    const wx =
      smoothstep(r.minX - RAMP, r.minX + RAMP, x) * (1 - smoothstep(r.maxX - RAMP, r.maxX + RAMP, x));
    const wz =
      smoothstep(r.minZ - RAMP, r.minZ + RAMP, z) * (1 - smoothstep(r.maxZ - RAMP, r.maxZ + RAMP, z));
    const w = wx * wz + 1e-4;
    sum += w;
    acc += w * COCKLE[s.id];
  }
  return acc / sum;
}

/* ------------------------------------------------------------------ *
 * THE FIVE FEATURES.
 * ------------------------------------------------------------------ */

/** Where the fold runs. A folded page never folds straight — the crease
 *  wanders, and it wanders the same way every time. */
export function foldX(z: number): number {
  return 78 + Math.sin(z * 0.011) * 9 + Math.sin(z * 0.031 + 1.1) * 4;
}

/** Where the page is torn. SPLITROCK CANYON is this line. */
export function tearX(z: number): number {
  // paper does not tear along a curve — it tears along its fibres, so
  // the lip wanders at two scales and is ragged at the smaller one
  return (
    338 +
    Math.sin(z * 0.02 + 0.4) * 7 +
    Math.sin(z * 0.055) * 4 +
    (vnoise(z * 0.11, 7.3) - 0.5) * 8
  );
}

/** Where the dune line runs behind LONGSHORE. */
export function duneX(z: number): number {
  return -174 + Math.sin(z * 0.021) * 7 + Math.sin(z * 0.06 + 2) * 3;
}

/** How far the bailey ramp reaches: 1 in the gate corridor, 0 on the
 *  scarp either side of it. The ONLY way onto the castle ridge. */
function castleGateK(x: number): number {
  return 1 - smoothstep(20, 38, Math.abs(x + 45));
}

/* ------------------------------------------------------------------ *
 * WATER CANNOT CLIMB A HILL.
 *
 * Round 1 of the art-director gate caught the river painted up and over
 * the crease's shoulder, which is the single most damning thing a
 * landscape can do. So water is not a modifier on the land here — it is
 * an OVERRIDE. The land is shaped first; then each body of water is
 * given a bed, and the land is blended into that bed:
 *
 *   the river   a bed that falls monotonically from its source in the
 *               canyon to its mouth in the sea, by distance ALONG the
 *               course. Where the land is higher than the bed the river
 *               cuts a gorge through it — which is why it crosses the
 *               crease instead of riding over it;
 *   the sea     a level surface deepening west of the coastline;
 *   the ponds   each one level, set just under the land around its rim.
 * ------------------------------------------------------------------ */

/** Cumulative distance along the river, so the bed can fall with it. */
const RIVER_T: number[] = [0];
for (let i = 1; i < RIVER.length; i++) {
  RIVER_T.push(
    RIVER_T[i - 1] + Math.hypot(RIVER[i][0] - RIVER[i - 1][0], RIVER[i][1] - RIVER[i - 1][1])
  );
}
const RIVER_LEN = RIVER_T[RIVER_T.length - 1];
/** Source, in the canyon, down to mouth, in the sea. Monotone by
 *  construction: there is no way to author an uphill river. */
const RIVER_SOURCE_Y = 3.0;
const RIVER_MOUTH_Y = -3.2;

/** Nearest point on the course: distance from it, and how far along. */
function riverAt(x: number, z: number): { d: number; t: number } {
  let best = 1e9;
  let bestT = 0;
  for (let i = 0; i < RIVER.length - 1; i++) {
    const [ax, az] = RIVER[i];
    const [bx, bz] = RIVER[i + 1];
    const dx = bx - ax;
    const dz = bz - az;
    const len2 = dx * dx + dz * dz || 1;
    const u = clamp01(((x - ax) * dx + (z - az) * dz) / len2);
    const d = Math.hypot(x - (ax + dx * u), z - (az + dz * u));
    if (d < best) {
      best = d;
      bestT = (RIVER_T[i] + Math.hypot(dx, dz) * u) / RIVER_LEN;
    }
  }
  return { d: best, t: bestT };
}

const riverBed = (t: number) =>
  RIVER_SOURCE_Y + (RIVER_MOUTH_Y - RIVER_SOURCE_Y) * Math.pow(clamp01(t), 0.85);

/** Each pond sits just under the land around its own rim. Measured once
 *  from the dry land, so a pond can never end up on a hillside. */
let POND_Y: number[] | null = null;
function pondLevels(): number[] {
  if (POND_Y) return POND_Y;
  POND_Y = PONDS.map((p) => {
    let sum = 0;
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2;
      sum += landHeight(p.x + Math.cos(a) * (p.r + 9), p.z + Math.sin(a) * (p.r + 9));
    }
    return sum / 8 - 1.0;
  });
  return POND_Y;
}

/**
 * THE SHAPE OF THE DRY LAND at (x, z).
 *
 * Read it top to bottom and it is a description of a sheet of paper:
 * what the wash did to it, how it was folded, what is under it, where
 * it tore, and how its margins lift off the desk. Water is applied on
 * top of this, by pageHeight below.
 */
function landHeight(x: number, z: number): number {
  /* ---- the buckle: the wash cockled the page ---------------------- */
  const ck = cockleAt(x, z);
  // Round 1 of the art-director gate rejected this at four times the
  // amplitude: at the shipping camera a five-unit swell across ninety
  // units is a HILL, and the sheet stopped reading as a sheet. Cockle is
  // texture underfoot — you feel it, you do not climb it.
  const buckle =
    ((vnoise(x * 0.0125, z * 0.0125) - 0.5) * 1.55 +
      (vnoise(x * 0.0265 + 31, z * 0.0265 - 17) - 0.5) * 0.85 +
      (vnoise(x * 0.058 - 9, z * 0.058 + 44) - 0.5) * 0.42) *
    ck;

  /* ---- the crease: one fold, north to south ----------------------- *
   * The east road dives through it between the common and the downs,
   * and the forest track crosses it at the Wood Gate. A fold has a
   * valley AND two shoulders — the paper has to go somewhere. */
  const fd = x - foldX(z);
  const crease = -6.0 * bump(fd / 10.6) + 1.9 * bump((Math.abs(fd) - 18) / 8);

  /* ---- what is under the sheet: the castle ridge ------------------- *
   * A book under a page does not make a hill, it makes a SCARP with a
   * flat top. The south face climbs 12.5 units in sixteen — too steep
   * to walk — except in the gate corridor, where it stretches over
   * thirty-two and becomes the ramp through the gatehouse. Greyweather
   * has one way in because the paper says so. */
  const n = -z;
  const gk = castleGateK(x);
  const nFoot = 202 - gk * 36;
  const nTop = 216 - gk * 4;
  const capX = smoothstep(-92, -76, x) * (1 - smoothstep(40, 54, x));
  const ridge = (12.5 * smoothstep(nFoot, nTop, n) + 1.9 * smoothstep(226, 262, n)) * capX;

  /* ---- the town on its rise, and the climb out of the common ------ *
   * The old world is UP the hill. The king's road leaves the common
   * level and arrives at Brim's south gate two and a half units higher,
   * which is what makes the wall and the keep stack in the title shot. */
  const brimSwell = 3.0 * bump((x + 50) / 92) * bump((z + 85) / 78);
  const commonClimb = 2.6 * smoothstep(66, -14, z) * bump((x + 45) / 130) * (1 - smoothstep(-14, -70, z));

  /* ---- the dune line, and the sea floor beneath the wash ---------- */
  const bw = smoothstep(-262, -234, x) * (1 - smoothstep(-166, -138, x));
  const dune = 5.4 * bump((x - duneX(z)) / 17) * bw;

  /* ---- the tear ---------------------------------------------------- *
   * The page ripped and you can see a long way down. Its lips stand
   * proud where the fibres pulled up; its walls are unwalkable. Session
   * 9 builds SPLITROCK on this cut — the ground is already here. */
  const td = x - tearX(z);
  const mouth = smoothstep(-96, -132, z) * smoothstep(-292, -272, z);
  const tear = (-13 * (1 - smoothstep(6, 16, Math.abs(td))) + 1.7 * bump((Math.abs(td) - 19) / 7)) * mouth;

  /* ---- two swells in the downs and a basin in the pines ----------- */
  const downsA = 3.4 * bump((x - 108) / 52) * bump((z + 52) / 44);
  const downsB = 2.6 * bump((x - 196) / 44) * bump((z - 74) / 52);
  const penBasin = -2.8 * bump((x - 146) / 62) * bump((z + 192) / 54);

  /* ---- the curl: the margins lift off the desk -------------------- *
   * Three sides only. The west margin is where the sea runs off the
   * torn edge, and wet paper does not curl — it sags. */
  // paper does not lift in a long ramp — it lifts in the last handspan,
  // so the curl is concentrated near the margin and its lip is steep
  const curlE = 9.0 * smoothstep(344, 382, x);
  const curlN = 8.2 * smoothstep(248, 284, n);
  const curlS = 8.2 * smoothstep(250, 286, z);
  const sag = -1.8 * smoothstep(318, 376, -x);

  /* ---- assemble ---------------------------------------------------- *
   * Landforms MEET (soft max) so the curl running into the castle ridge
   * is one continuous piece of paper. Folds, cockle and cuts are added
   * on top, because a fold is something done TO the landform. */
  let land = ridge;
  land = smax(land, curlE, 5);
  land = smax(land, curlN, 5);
  land = smax(land, curlS, 5);
  land = smax(land, dune, 4);
  land = smax(land, brimSwell + commonClimb, 4);
  land = smax(land, downsA, 4);
  land = smax(land, downsB, 4);

  let h = land + buckle + crease + penBasin + sag + tear;

  return h;
}

/**
 * THE HEIGHT OF THE PAGE AT (x, z). The one authority: dry land, then
 * the water laid into it. A bridge crossing is levelled over a short
 * run so a plank deck still spans flat, but the channel is never
 * removed — the river keeps its banks under the bridge.
 */
export function pageHeight(x: number, z: number): number {
  let h = landHeight(x, z);

  /* the river: a bed that only ever falls */
  const { d: rd, t: rt } = riverAt(x, z);
  if (rd < 30) {
    let bridgeD = 1e9;
    for (const b of BRIDGES) {
      const d = Math.hypot(x - b.x, z - b.z);
      if (d < bridgeD) bridgeD = d;
    }
    const chan = 1 - smoothstep(7.5, 20, rd);
    const bed = riverBed(rt) - 1.3 + smoothstep(14, 4, bridgeD) * 0.55;
    h = h * (1 - chan) + Math.min(h, bed) * chan;
  }

  /* the sea: level, deepening west */
  const cx = coastX(z);
  const seaM = smoothstep(cx + 6, cx - 30, x);
  if (seaM > 0.001) {
    const seaBed = -0.9 - 3.0 * smoothstep(cx - 10, cx - 76, x);
    h = h * (1 - seaM) + Math.min(h, seaBed) * seaM;
  }

  /* the still waters: each one level */
  const lv = pondLevels();
  for (let i = 0; i < PONDS.length; i++) {
    const p = PONDS[i];
    const d = Math.hypot(x - p.x, z - p.z);
    if (d > p.r + 8) continue;
    const m = 1 - smoothstep(p.r * 0.4, p.r + 8, d);
    h = h * (1 - m) + Math.min(h, lv[i]) * m;
  }

  /* ---- off the sheet: the page's EDGE, then the desk ---------------- *
   * The two bands terrain.ts already paints, now cut into the geometry
   * at exactly the same distances (SHEET_PAD matches the shader's
   * uSheet pad, and the second band its sd − 7). A sheet of paper does
   * not ramp down onto a desk: it ENDS. So the drop is two units wide —
   * one quad — and the curled margin stands proud above the wood, which
   * is the whole reason the world's rim is worth walking to. */
  const q = Math.max(
    Math.max(WORLD.minX - x, x - WORLD.maxX),
    Math.max(WORLD.minZ - z, z - WORLD.maxZ)
  ) - SHEET_PAD;
  if (q > -3) {
    const off = Math.max(0, q);
    const toNext = smoothstep(0.2, 2.6, off);
    const toDesk = smoothstep(6.4, 9.0, off);
    h = h * (1 - toNext) + NEXT_SHEET_Y * (toNext - toNext * toDesk) + DESK_Y * toNext * toDesk;
  }

  return h;
}

/* ------------------------------------------------------------------ *
 * THE FIELD. Baked once at load; everything reads it, nothing
 * re-evaluates pageHeight at runtime.
 * ------------------------------------------------------------------ */

export class HeightField {
  readonly data: Float32Array;

  constructor() {
    this.data = new Float32Array(H_NX * H_NZ);
    for (let j = 0; j < H_NZ; j++) {
      const z = H_MIN_Z + j * H_STEP;
      const row = j * H_NX;
      for (let i = 0; i < H_NX; i++) {
        this.data[row + i] = pageHeight(H_MIN_X + i * H_STEP, z);
      }
    }
  }

  /** The ground at (x, z). Bilinear on the same nodes the mesh uses. */
  heightAt(x: number, z: number): number {
    const fx = (x - H_MIN_X) / H_STEP;
    const fz = (z - H_MIN_Z) / H_STEP;
    let i = Math.floor(fx);
    let j = Math.floor(fz);
    if (i < 0) i = 0;
    else if (i > H_NX - 2) i = H_NX - 2;
    if (j < 0) j = 0;
    else if (j > H_NZ - 2) j = H_NZ - 2;
    const tx = clamp01(fx - i);
    const tz = clamp01(fz - j);
    const a = this.data[j * H_NX + i];
    const b = this.data[j * H_NX + i + 1];
    const c = this.data[(j + 1) * H_NX + i];
    const d = this.data[(j + 1) * H_NX + i + 1];
    return (a + (b - a) * tx) * (1 - tz) + (c + (d - c) * tx) * tz;
  }

  /** dH/dx, dH/dz over one grid cell — the ground's lean, and the
   *  direction water would run. The shading needs the VECTOR, not just
   *  its length: a pen draws a cliff in strokes down the fall line. */
  gradAt(x: number, z: number): [number, number] {
    const e = H_STEP;
    return [
      (this.heightAt(x + e, z) - this.heightAt(x - e, z)) / (2 * e),
      (this.heightAt(x, z + e) - this.heightAt(x, z - e)) / (2 * e),
    ];
  }

  /** Rise over run. Past MAX_WALK_SLOPE the page refuses the walker. */
  slopeAt(x: number, z: number): number {
    const [gx, gz] = this.gradAt(x, z);
    return Math.hypot(gx, gz);
  }

  /** Unit surface normal. Decals and footprints lie down along it;
   *  standees never do — they are cutouts on a warped page. */
  normalAt(x: number, z: number): [number, number, number] {
    const [gx, gz] = this.gradAt(x, z);
    const inv = 1 / Math.hypot(gx, 1, gz);
    return [-gx * inv, inv, -gz * inv];
  }

  /** A ground height with the single-cell wobble taken out, for the
   *  camera: sampling one point makes the camera seasick over cockle,
   *  so it stands on the average of a small disc instead. */
  smoothHeightAt(x: number, z: number, r = 7): number {
    return (
      this.heightAt(x, z) * 0.36 +
      (this.heightAt(x + r, z) +
        this.heightAt(x - r, z) +
        this.heightAt(x, z + r) +
        this.heightAt(x, z - r)) *
        0.16
    );
  }
}
