import {
  WORLD, REGION_SPECS, RIVER, BRIDGES, PONDS, coastX, barDist, fordAt,
  type RegionId,
} from './layout';

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
 * Session 5 authored THE COAST on the same vocabulary, and it is the
 * first land ground written for a land rather than for the sheet:
 *
 *   the holdfast  the wet margin tore away in two bites and one tongue
 *                 of fibre HELD — so the headland is not a hill that
 *                 happens to end at the sea, it is what the tear went
 *                 round. Ten and a half units up, ringed by cliff.
 *   the cut       the only way onto it. A ledge somebody chiselled
 *                 across the seaward face: the page is carved DOWN to
 *                 a gentle ramp in a narrow band, so the wall stands
 *                 above it on the landward side and the cliff falls
 *                 away on the other. Nothing else about the point is
 *                 walkable, which is what makes the walk mean anything.
 *   the bar       a dry streak where the wash never took, running a
 *                 hundred and eighty units out into THE WIDE BLUE.
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

/**
 * A CLIFF, not a hill: a smoothstep run through itself.
 *
 * A plain smoothstep spends its fall evenly across the band, which
 * means a face wide enough for the height grid to resolve is never
 * steep enough to refuse a walker — Session 5 found the Holdfast
 * climbable on its whole seaward quarter for exactly that reason.
 * Running the curve through itself keeps the same width on the grid
 * and the same round lip and toe (a torn edge of paper has both), and
 * puts half again as much of the fall into the middle of the face,
 * which is where a cliff keeps it.
 */
function scarp(a: number, b: number, x: number): number {
  const t = smoothstep(a, b, x);
  return t * t * (3 - 2 * t);
}

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

/* ------------------------------------------------------------------ *
 * THE COAST (Session 5).
 * ------------------------------------------------------------------ */

/** The Holdfast's centre and its two radii. The point is an ELLIPSE of
 *  standing paper: flat on top out to 0.70 of it, then fourteen units
 *  of cliff. Fourteen is not a free number — the height grid's pitch is
 *  four, so anything narrower aliases, and anything wider stops
 *  refusing (the cliff has to hold |∇h| over 0.72 for long enough that
 *  no stride crosses it). */
/**
 * THE HOLDFAST, in plan.
 *
 * Three rounds of the gate went into this shape and every one of them
 * was rejected for the same underlying reason: it was ROUND. A radial
 * headland is a dome, a dome's fall line rotates continuously, and the
 * terrain shader hatches down the fall line — so the point came out
 * first as a thumb print and then, once the radius was wobbled, as
 * herringbone. Both are the same bug: a doubly-curved surface has no
 * face for a pen to draw down.
 *
 * The fix is the metaphor, which had the answer all along. **Paper does
 * not tear along a curve. It tears along its fibres**, in straight runs,
 * turning where the grain turns — which is exactly what `tearX` already
 * says about SPLITROCK. So the point is a POLYGON: seven straight runs
 * of torn edge with corners between them. Every face is planar, every
 * face has one constant fall line, and the hatching runs down each of
 * them in parallel strokes the way a hand draws a cliff. The corners
 * are what give the silhouette its breaks.
 *
 * The plan is convex, so the signed distance is just the largest of its
 * seven half-plane distances: cheap, exact, and sharp at the corners.
 */
export const HOLD_PLAN: [number, number][] = [
  [-259, -72], [-251, -97], [-228, -113], [-199, -107],
  [-182, -85], [-187, -55], [-208, -37], [-239, -43],
];
// inner/outer bracket the cliff in SIGNED-DISTANCE units: full height
// eleven units inside the torn edge, nothing one unit outside it. Twelve
// units of face for eleven and a half of fall — which, run through
// `scarp`, holds |∇h| well past the walk limit for about seven units of
// its width. That is more than a stride, and it is what makes the ledge
// the only way up.
const HOLD = { y: 11.4, inner: -11, outer: 1.0 };

/** Outward half-plane normals and offsets, built once. */
const HOLD_EDGES = HOLD_PLAN.map((a, i) => {
  const b = HOLD_PLAN[(i + 1) % HOLD_PLAN.length];
  const dx = b[0] - a[0];
  const dz = b[1] - a[1];
  const len = Math.hypot(dx, dz) || 1;
  // the plan is wound so that (dz, -dx) points out of it
  return { nx: dz / len, nz: -dx / len, ax: a[0], az: a[1] };
});

/** Signed distance to the torn edge: negative on the point, positive
 *  off it. Zero is the middle of the cliff, not its top. */
function holdSD(x: number, z: number): number {
  let m = -1e9;
  for (const e of HOLD_EDGES) {
    const d = (x - e.ax) * e.nx + (z - e.az) * e.nz;
    if (d > m) m = d;
  }
  return m;
}

/**
 * How much of the Holdfast there is at (x, z), 1 on the plateau and 0
 * off the headland entirely. `terrain.ts` reads it to paint the point
 * as ROCK rather than as sand: the wash field is one stain per land and
 * LONGSHORE's is beach, but the point is the piece the tear went round,
 * and torn paper is not a dune. Round 1 of the gate called an
 * eleven-unit cliff a sand hill, and it was right to.
 */
export function holdfastK(x: number, z: number): number {
  return 1 - smoothstep(-12, 8, holdSD(x, z));
}

/**
 * THE CUT — the ledge somebody chiselled across the Holdfast's seaward
 * face. Six authored points from the sand at the bight's north end,
 * climbing north-west across the face and in through the point's own
 * rim. Everything about this path is deliberate: it traverses rather
 * than climbs, it stays on the seaward side so the drop is the sea, and
 * it ends short of the crest so the last few strides are a CUTTING with
 * rock on both hands.
 */
export const CUT_PATH: [number, number][] = [
  [-205, -27], [-218, -32], [-229, -40], [-238, -50], [-243, -62], [-242, -75],
];
const CUT = CUT_PATH;

const CUT_T: number[] = [0];
for (let i = 1; i < CUT.length; i++) {
  CUT_T.push(CUT_T[i - 1] + Math.hypot(CUT[i][0] - CUT[i - 1][0], CUT[i][1] - CUT[i - 1][1]));
}
const CUT_LEN = CUT_T[CUT_T.length - 1];

/** Nearest point on the cut: how far off it, and how far along it. */
function cutAt(x: number, z: number): { d: number; t: number } {
  let best = 1e9;
  let bestT = 0;
  for (let i = 0; i < CUT.length - 1; i++) {
    const [ax, az] = CUT[i];
    const [bx, bz] = CUT[i + 1];
    const dx = bx - ax;
    const dz = bz - az;
    const len2 = dx * dx + dz * dz || 1;
    const u = clamp01(((x - ax) * dx + (z - az) * dz) / len2);
    const d = Math.hypot(x - (ax + dx * u), z - (az + dz * u));
    if (d < best) {
      best = d;
      bestT = (CUT_T[i] + Math.hypot(dx, dz) * u) / CUT_LEN;
    }
  }
  return { d: best, t: bestT };
}

/** A point along the cut, by its parameter. */
function cutPoint(t: number): [number, number] {
  const s = clamp01(t) * CUT_LEN;
  for (let i = 0; i < CUT.length - 1; i++) {
    if (s <= CUT_T[i + 1] || i === CUT.length - 2) {
      const u = (s - CUT_T[i]) / (CUT_T[i + 1] - CUT_T[i] || 1);
      return [
        CUT[i][0] + (CUT[i + 1][0] - CUT[i][0]) * u,
        CUT[i][1] + (CUT[i + 1][1] - CUT[i][1]) * u,
      ];
    }
  }
  return CUT[CUT.length - 1];
}

/**
 * THE LEDGE'S FLOOR — a GRADED profile, not a formula.
 *
 * Round 2 of the gate carved the ledge to a fixed ramp and the ramp
 * stopped matching the hill the moment the headland's plan changed:
 * where the natural ground sat below the ramp there was nothing to
 * carve, and the walker met a stretch of raw cliff at one in one and a
 * quarter. A ramp is the wrong idea anyway. What a person cutting a
 * path does is GRADE it: they follow the ground, they take the high
 * spots off, they throw the spoil into the low ones, and they never let
 * the thing get steeper than they are willing to walk.
 *
 * So the floor is built from the ground itself, once, at load:
 *   1. sample the page along the path with the cut turned off;
 *   2. make it monotone — a path up a headland only ever climbs;
 *   3. cap its grade at one in three and a half, forward;
 *   4. lift the tail so it still arrives on the plateau.
 * The result is bounded above and below by the ground it came from, so
 * the ledge is a cut where the page is high and its own spoil where the
 * page is low, which is what a ledge is.
 */
const CUT_N = 56;
const CUT_DS = CUT_LEN / CUT_N;
const CUT_GRADE = 0.28;
let CUT_FLOOR: Float64Array | null = null;
/** Guards the one recursion: the profile is measured on the page as it
 *  would be with no ledge in it. */
let cutSuspended = false;

function cutFloorProfile(): Float64Array {
  if (CUT_FLOOR) return CUT_FLOOR;
  const raw = new Float64Array(CUT_N + 1);
  cutSuspended = true;
  for (let i = 0; i <= CUT_N; i++) {
    const [x, z] = cutPoint(i / CUT_N);
    raw[i] = landHeight(x, z);
  }
  cutSuspended = false;
  const c = new Float64Array(CUT_N + 1);
  c[0] = raw[0];
  for (let i = 1; i <= CUT_N; i++) {
    c[i] = Math.min(Math.max(c[i - 1], raw[i]), c[i - 1] + CUT_GRADE * CUT_DS);
  }
  // and it must still arrive: lift the tail back to the plateau
  const top = raw[CUT_N];
  c[CUT_N] = Math.max(c[CUT_N], top);
  for (let i = CUT_N - 1; i >= 0; i--) {
    c[i] = Math.max(c[i], c[i + 1] - CUT_GRADE * CUT_DS);
  }
  CUT_FLOOR = c;
  return c;
}

function cutFloor(t: number): number {
  const c = cutFloorProfile();
  const f = clamp01(t) * CUT_N;
  const i = Math.min(CUT_N - 1, Math.floor(f));
  const u = f - i;
  return c[i] + (c[i + 1] - c[i]) * u;
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

  /* ---- THE COAST -------------------------------------------------- *
   * The dune line first, because the two coastal landforms are both
   * defined against it: the Holdfast is where the dune STOPS (a dune
   * cannot climb a headland, so the marram line ends against the
   * point's south foot and picks up again behind the cove), and the
   * cove's back is the dune closing behind sheltered water. */
  const bw = smoothstep(-262, -234, x) * (1 - smoothstep(-166, -138, x));
  // the point is a hole in the dune line: sixty units of coast where
  // there is no sand to blow, because what is there is standing paper
  const duneGap = 1 - 0.94 * bump((z + 76) / 38);
  const dune = 5.4 * bump((x - duneX(z)) / 17) * bw * duneGap;

  /* THE HOLDFAST: the tongue of fibre the tear went round.
   * An ellipse of standing page — flat on top, then fourteen units of
   * cliff all the way round it. The ring holds |∇h| well past the walk
   * limit for about eight units of its width, which is more than a
   * stride: there is no way up this except the cut. */
  const holdfast = HOLD.y * (1 - scarp(HOLD.inner, HOLD.outer, holdSD(x, z)));

  /* SHELTER COVE's back: behind the bite, the dune stands up into a
   * bank, so the cove is a bowl that only opens to its own water. */
  const coveBack = 4.4 * bump((x + 188) / 24) * bump((z + 148) / 30);

  /* ---- the tear ---------------------------------------------------- *
   * The page ripped and you can see a long way down. Its lips stand
   * proud where the fibres pulled up; its walls are unwalkable. Session
   * 9 builds SPLITROCK on this cut — the ground is already here. */
  const td = x - tearX(z);
  const mouth = smoothstep(-96, -132, z) * smoothstep(-292, -272, z);
  const tear = (-13 * (1 - smoothstep(6, 16, Math.abs(td))) + 1.7 * bump((Math.abs(td) - 19) / 7)) * mouth;

  /* ---- THE HARROW (Session 10) ------------------------------------ *
   * The land is called the Harrow Downs and until this session that was
   * a word on a signpost. It is now the ground.
   *
   * A harrow rakes a field into long parallel lines, and a sheet of
   * paper that dried while it was held along one edge cockles the same
   * way: not in random lumps, in RUNS. So the Downs' buckle is
   * authored rather than sampled — five or six low ridges, forty-six
   * units apart, running north–south with a slow wander in them, about
   * a unit and a half from trough to crest.
   *
   * It does three jobs at once and that is why it is worth a term:
   *   · the land finally has a GRAIN, and the grain runs the way the
   *     camera looks, so the recession in every framing is drawn by the
   *     ground instead of by props standing on it;
   *   · the field plan can be laid one field per fold, which is what
   *     makes a patchwork read as a patchwork rather than as a grid;
   *   · and you crest one every forty paces, which is the cheapest
   *     midpoint a walk can have.
   *
   * IT STARTS EAST OF THE CREASE, and that is deliberate twice over.
   * The fold is the Downs' west wall — you come over it out of THE
   * COMMON and the harrowed country begins on the far side — and it
   * keeps every unit of this term more than thirty units clear of the
   * protected `crease-east-road` framing's own ground.
   */
  /* AND IT IS BOUNDED ON ALL FOUR SIDES, which the first version was
   * not: `smoothstep(96, 130, x)` alone is 1 at x = 370, so the Downs'
   * corrugation ran clean across the Bleach Flats and out onto the
   * world's curled east rim. `tools/diff-sheets.mjs` found it — eight
   * per cent of the protected `curl-rim` framing had moved, in a land
   * this session never opened — which is exactly the class of mistake
   * that tool exists for and exactly the kind nobody has ever caught by
   * looking at two contact sheets a week apart. */
  const harrowK = smoothstep(96, 130, x) * (1 - smoothstep(206, 232, x))
    * smoothstep(-96, -62, z) * (1 - smoothstep(96, 128, z));
  const harrowPhase = x * 0.1366 + Math.sin(z * 0.0125) * 1.15 + Math.sin(z * 0.0041 + 2.2) * 0.6;
  const harrow = (Math.sin(harrowPhase) * 1.15 + Math.sin(harrowPhase * 2 + 1.4) * 0.34) * harrowK;

  /* The rough grazing's swell, from Session 4 and deliberately KEPT.
   * It is the only ground in the Downs visible from the protected
   * `crease-east-road` framing at anything like foreground pressure,
   * and a land session that re-cut it would be moving a page six
   * verdicts were awarded on for no gain (QUALITY-BAR §2). */
  const downsA = 3.4 * bump((x - 108) / 52) * bump((z + 52) / 44);

  /* THE MILL RISE. A windmill stands on the highest ground it can find,
   * because that is what a windmill is FOR, and until now this one
   * stood on a swell whose crest was forty units west of it. The rise
   * is broad and low — four and a half units over sixty — so the lane
   * climbs it the whole way from the ford and the mill is the last
   * thing you reach and the first thing you see. */
  const millRise = 4.5 * bump((x - 150) / 46) * bump((z + 10) / 40);
  /* and the ground going sour toward the city: a shallow, wide sag in
   * the south-east, which is the void's excuse for being a void */
  const sourGround = -1.6 * bump((x - 206) / 44) * bump((z - 96) / 40);

  /* ---- THE TARN'S BOWL (Session 10) ------------------------------- *
   * The wood's floor was a flat sheet with a blue disc lying on it, so
   * the water was invisible from anywhere except its own rim — which is
   * fatal for a land whose one composition is a look at it from forty
   * units away.
   *
   * A pond in a wood sits in a hollow, so the page dishes: the ground
   * falls three and a half units from the ring road down to the water
   * over twenty-six units, which is a gradient of about one in seven —
   * you barely feel it underfoot and you can see straight down it. The
   * dish is doubly curved, and that is safe here and nowhere else in
   * this file: nothing on it comes within a fifth of the hatching
   * threshold, so there is no fall line for the shader to draw down and
   * no thumb print to draw it as.
   *
   * Kept east of x = 78 so it can never touch Brim or Greyweather. */
  const tarnD = Math.hypot(x - 150, z + 195);
  const bowlK = smoothstep(78, 104, x);
  const bowl = (-3.5 * (1 - smoothstep(2, 46, tarnD))
                + 0.9 * bump((tarnD - 50) / 14)) * bowlK;
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
  land = smax(land, coveBack, 3);
  // k = 0.8, not 2. A soft max blends over its own k in HEIGHT, so a
  // generous k rounds the cliff's TOE into a four-unit ramp at two
  // thirds of the walk limit — which round 3 of the gate found you
  // could simply walk up, anywhere round the point. The toe of a torn
  // edge is not round.
  land = smax(land, holdfast, 0.8);
  land = smax(land, brimSwell + commonClimb, 4);
  land = smax(land, downsA, 4);
  land = smax(land, millRise, 4);

  let h = land + buckle + crease + penBasin + bowl + harrow + sourGround + sag + tear;

  /* ---- THE CUT ----------------------------------------------------- *
   * A ledge is not a ramp bolted onto a cliff — it is stone TAKEN AWAY,
   * and that is exactly how it is authored: inside a narrow band along
   * the path the page is carved DOWN to the ledge's own gentle floor,
   * and it is never built UP. That one asymmetry does all the work.
   * On the landward side the face was higher than the floor, so the
   * carve leaves a wall standing over your right hand; on the seaward
   * side the face was already lower, so the carve does nothing at all
   * and the cliff falls away off your left. The floor is thirteen units
   * wide because anything narrower than the grid can resolve reads as a
   * crack rather than as a path. */
  if (!cutSuspended) {
    const cu = cutAt(x, z);
    if (cu.d < 18) {
      /* The ledge is thirteen units of floor and then ELEVEN of wall,
       * not five. Nothing in this height field may be finer than about
       * twelve units (the grid pitch is four), and a five-unit inner
       * wall is exactly the kind of feature that aliases: its gradient
       * direction is unstable from node to node, and the shader's
       * hatching turns that into chevrons. Round 6 of the gate was
       * still looking at them in the bottom of the frame. */
      const k = (1 - smoothstep(6.5, 17.5, cu.d)) * smoothstep(0.0, 0.07, cu.t);
      h += (cutFloor(cu.t) - h) * k;
    }
  }

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
    /* THE FORD raises the bed rather than lowering the water: the river
     * runs a hand deep over a gravel bar, so it shallows and pales over
     * the crossing and is exactly as wet as it was everywhere else. */
    const bed = riverBed(rt) - 1.3 + smoothstep(14, 4, bridgeD) * 0.55
              + fordAt(x, z) * 1.02;
    h = h * (1 - chan) + Math.min(h, bed) * chan;
  }

  /* the sea: level, deepening west */
  const cx = coastX(z);
  const seaM = smoothstep(cx + 6, cx - 30, x);
  if (seaM > 0.001) {
    const seaBed = -0.9 - 3.0 * smoothstep(cx - 10, cx - 76, x);
    h = h * (1 - seaM) + Math.min(h, seaBed) * seaM;
  }

  /* THE SANDBAR: the dry streak where the wash never took.
   * Applied AFTER the sea, because the bar is not a thing built on the
   * sea floor — it is a place the sea never got to, so the page there
   * simply never went under. It only ever raises ground that is below
   * the bar's own crest, so where the bar's root runs up onto the beach
   * it does nothing and there is no step. */
  const bd = barDist(x, z);
  if (bd < 26) {
    const bk = 1 - smoothstep(5, 20, bd);
    const crest = 0.55;
    if (h < crest) h += (crest - h) * bk;
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
