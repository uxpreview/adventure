import * as THREE from 'three';
import { coastX } from '../terrain';
import { SANDBAR, barDist } from '../layout';
import { duneX, CUT_PATH, HOLD_PLAN } from '../elevation';
import { driftwoodTexture, shellsDecal, signpostTexture, benchTexture } from '../textures';
import { stoneWearDecal } from '../textures-oldworld';
import {
  marramTexture, wrackDecal, beachHutTexture, groyneTexture, boardwalkDecal,
  boardwalkRailTexture, cutPostTexture, cutRopeRunTexture, chiselMarksDecal,
  seaStackTexture, cairnTexture, beachedBoatTexture, lobsterPotTexture,
  windsockTexture, gullTexture, shoreRockTexture,
  regattaBoatTexture, bellBuoyTexture, smallBuoyTexture, mooringPostTexture,
  barRippleDecal, mooredBoatTexture, fishShoalDecal,
} from '../textures-coast';
import type { BuildCtx, RegionBuilder, WorldPOI } from './index';

/** Fire a named audio event up to the App without a plumbing run. */
function say(name: string) {
  window.dispatchEvent(new CustomEvent('inklands:event', { detail: name }));
}

/** Where along a polyline a parameter t lands, and which way it points. */
function alongPath(
  pts: [number, number][], t: number
): { x: number; z: number; ax: number; az: number } {
  const n = pts.length - 1;
  const u = ((t % 1) + 1) % 1;
  const i = Math.min(n - 1, Math.floor(u * n));
  const f = u * n - i;
  const [ax, az] = pts[i];
  const [bx, bz] = pts[i + 1];
  const dx = bx - ax;
  const dz = bz - az;
  const len = Math.hypot(dx, dz) || 1;
  return { x: ax + dx * f, z: az + dz * f, ax: dx / len, az: dz / len };
}

/* ================================================================== *
 * LONGSHORE — the coast.
 *
 * Session 5, and the first land in the world authored ON elevation
 * rather than before it. Its ground is not scenery: THE HOLDFAST is a
 * real eleven-unit headland ringed by cliff the walker's legs refuse,
 * and THE CUT is a ledge carved into that cliff which is the only way
 * up. Everything drawn here is placed against those two facts.
 *
 * The land's ink technique (design/specs/longshore.md §4) is THE DRY
 * BRUSH AND THE HORIZONTAL: every mark is either a long low horizontal
 * — plank, rail, wrack line, hull sheer, groyne — or a vertical stab
 * standing against it. Nothing runs diagonally except the cut, which is
 * exactly why the cut reads as something a person made.
 * ================================================================== */

/** The ledge, taken straight from `elevation.ts` — the drawn furniture
 *  has to follow the ground's own authored line, or the ledge looks
 *  like a path that happens to be near a path. */
const CUT_LINE = CUT_PATH;

/** THE PROMENADE, running NORTH along the back of the beach, and the
 *  short stub of plank the coast road actually ends on. Matches
 *  `layout.PLANKS`, which is what makes both knock hollow.
 *
 *  The camera in this game only ever looks north. A boardwalk laid
 *  east–west is therefore a handrail across the middle of the frame and
 *  nothing else — round 1 of the gate got exactly that. Laid north it is
 *  a thing you walk ALONG: planks receding, sea on the left, dune and
 *  huts on the right, and the Holdfast standing at the end of it. */
const PROM: [number, number][] = [[-229, 94], [-217, 10]];
const JETTY: [number, number][] = [[-230, 57], [-258, 54]];

export const buildBeach: RegionBuilder = (ctx) => {
  const { r, terrain } = ctx;

  /* ---- cluster scatter, the meadow's contract on a different land -- */
  const clustered = (
    hearts: [number, number][], per: [number, number], rad: number,
    ok: (x: number, z: number) => boolean
  ): [number, number][] => {
    const out: [number, number][] = [];
    for (const [hx, hz] of hearts) {
      const n = per[0] + Math.floor(r() * (per[1] - per[0]));
      for (let i = 0; i < n; i++) {
        const a = r() * Math.PI * 2;
        const d = Math.pow(r(), 0.55) * rad;
        const x = hx + Math.cos(a) * d;
        const z = hz + Math.sin(a) * d * 1.5; // clusters run ALONG the coast
        if (ok(x, z)) out.push([x, z]);
      }
    }
    return out;
  };

  /* ---- THE MARRAM ------------------------------------------------- *
   * Sea marram is not meadow grass and does not get meadow treatment:
   * it grows in tight tussocks on the dune's LANDWARD shoulder and in
   * its blowouts, never on the seaward face — sand that is moving holds
   * nothing. It stops dead at the Holdfast, because a dune cannot climb
   * a headland, and picks up again behind Shelter Cove. */
  const marramOK = (x: number, z: number) => {
    if (z < -272 || z > 272) return false;
    const d = x - duneX(z);
    if (d < -13 || d > 16) return false;       // the dune's own width
    if (z > -122 && z < -34) return false;      // the point: no dune here
    if (terrain.waterAt(x, z) > 0.03) return false;
    if (terrain.roadAt(x, z)) return false;
    return true;
  };
  const marramHearts: [number, number][] = [];
  for (let z = -262; z <= 262; z += 15 + r() * 22) {
    if (z > -128 && z < -28) continue;
    // the hearts wander across the dune's width, and skip whole stretches
    if (r() < 0.24) continue;
    marramHearts.push([duneX(z) + (r() - 0.5) * 18, z]);
  }
  const marramPts = clustered(marramHearts, [7, 15], 7, marramOK);
  const perVariant = Math.ceil(marramPts.length / 4);
  for (let v = 0; v < 4; v++) {
    const pts = marramPts.slice(v * perVariant, (v + 1) * perVariant);
    if (!pts.length) continue;
    const f = ctx.field(marramTexture(1200 + v), pts.length, {
      w: 2.0, h: 2.5, wind: { amp: 0.09, freq: 0.85 },
    });
    // never flipped: the lean is drawn in, and this coast has ONE wind
    pts.forEach(([x, z], i) => f.set(i, x, z, 0.65 + r() * 0.7, 0, false));
  }

  /* ---- THE TIDE LINE ----------------------------------------------- *
   * A line, and a line is drawn once. The wrack follows the shore at a
   * wandering offset, THICKENS in the bight where the surf runs a long
   * way up, thins to nothing across the Holdfast's rock foreshore, and
   * piles in the cove. The gaps are authored. */
  const wrackPts: [number, number][] = [];
  for (let z = -268; z < 272; z += 7 + r() * 11) {
    const inBight = z > -36 && z < 30;
    const inCove = z > -168 && z < -114;
    if (z > -118 && z < -32) continue;               // the rock foreshore
    if (r() < (inBight || inCove ? 0.06 : 0.34)) continue;  // authored gaps
    const off = 4 + r() * (inBight ? 15 : 9);
    wrackPts.push([coastX(z) + off, z]);
    // where the surf runs up, a second, older line further in
    if ((inBight || inCove) && r() > 0.5) wrackPts.push([coastX(z) + off + 8 + r() * 9, z + 2]);
  }
  for (let v = 0; v < 3; v++) {
    const pts = wrackPts.filter((_, k) => k % 3 === v);
    if (!pts.length) continue;
    const f = ctx.field(wrackDecal(1210 + v), pts.length,
      { w: 9, h: 5, decal: true, baseOpacity: 0.72 });
    pts.forEach(([x, z], i) => f.set(i, x, z, 0.7 + r() * 0.6, (r() - 0.5) * 0.5, r() > 0.5));
  }
  // shells only where the wash actually reaches
  const shells = ctx.field(shellsDecal(1220), 26, { w: 4.2, h: 4.2, decal: true, baseOpacity: 0.6 });
  for (let i = 0; i < 26; i++) {
    const z = -40 + r() * 200;
    const x = coastX(z) + 2 + r() * 12;
    shells.set(i, x, z, 0.6 + r() * 0.6, r() * Math.PI, false);
  }

  /* ---- THE BOARDWALK ---------------------------------------------- *
   * Where the coast road stops being a road. Planks laid west onto the
   * sand and out over the first of the water — the only painted thing
   * on this coast and the only place on it with a handrail. */
  // the promenade's deck: nine plank panels laid END TO END up the
  // beach, each turned a degree or two off the last, because nobody
  // laid a boardwalk straight
  for (let i = 0; i < 12; i++) {
    const t = (i + 0.5) / 12;
    const x = PROM[0][0] + (PROM[1][0] - PROM[0][0]) * t;
    const z = PROM[0][1] + (PROM[1][1] - PROM[0][1]) * t;
    // 8.4 of deck every 7 units: the panels OVERLAP, because a
    // boardwalk is one boardwalk and round 2 shipped nine floor mats
    ctx.decal(boardwalkDecal(1230 + (i % 3)), 7.4, 10.2, x, z,
      Math.PI / 2 + (r() - 0.5) * 0.04, 0.88);
  }
  // the jetty stub the road ends on, out over the first of the water
  for (let i = 0; i < 5; i++) {
    const t = (i + 0.5) / 5;
    ctx.decal(boardwalkDecal(1233 + (i % 3)), 6.8, 7.2,
      JETTY[0][0] + (JETTY[1][0] - JETTY[0][0]) * t,
      JETTY[0][1] + (JETTY[1][1] - JETTY[0][1]) * t, (r() - 0.5) * 0.06, 0.88);
  }
  // the ONLY rail on this coast: at the jetty head, square to the
  // camera, because a rail that runs away from a north-looking camera is
  // an edge-on quad and therefore nothing at all
  ctx.standee(boardwalkRailTexture(1240), 14, 2.9, -248, 50.4, { rotY: 0.05 });
  ctx.standee(boardwalkRailTexture(1241), 12, 2.7, -250, 58.6, { rotY: -0.04 });
  const sock = ctx.standee(windsockTexture(1242), 2.9, 4.0, -255, 51.5);
  // bollards down the promenade's seaward edge: small, receding, and
  // never evenly spaced. They are what gives the walk its perspective.
  for (let i = 0, z = 90; z > 14; i++) {
    const t = (94 - z) / 84;
    const px = PROM[0][0] + (PROM[1][0] - PROM[0][0]) * t;
    ctx.standee(mooringPostTexture(1243 + (i % 3)), 1.2, 1.8 + (i % 3) * 0.3,
      px - 4.6 + (r() - 0.5) * 1.4, z);
    z -= 6 + r() * 6;
  }
  ctx.standee(signpostTexture(1246), 3.0, 3.6, -215, 52);
  ctx.standee(benchTexture(1247), 3.0, 1.7, -224, 74, { rotY: 0.1 });
  ctx.standee(benchTexture(1248), 2.8, 1.6, -219.5, 40, { rotY: -0.06 });
  // lobster pots stacked where they are STORED, back off the walk
  const potSpots: [number, number, number][] = [
    [-220, 82, 0.4], [-222.5, 83.8, -0.2], [-221, 86, 0.9],
  ];
  potSpots.forEach(([x, z, rot], i) =>
    ctx.standee(lobsterPotTexture(1250 + (i % 3)), 1.7, 1.4, x, z, { rotY: rot }));
  ctx.standee(driftwoodTexture(1254), 3.4, 1.4, -236, 82, { rotY: 0.5 });

  /* ---- THE PAINTED HUTS -------------------------------------------- *
   * Four, on the dune's seaward shoulder above the bight, backs to the
   * wind. Never on a stride: their spacing, their paint, their heights
   * and whether their doors are open all differ, and two of them share
   * a scuffed patch of sand between them because that is where people
   * actually sit. */
  // Three together and one off on its own, at three different set-backs
  // and four sizes. Round 6 of the gate had them on a thirteen-unit
  // stride down a diagonal, which is a row however you paint it.
  const hutSpots: [number, number, number, number, 0 | 1 | 2][] = [
    [-201, -19, 0.2, 7.4, 0],
    [-208, -12, -0.1, 6.4, 2],
    [-203.5, -5, 0.06, 6.9, 1],
    [-211, 20, -0.3, 6.1, 0],
  ];
  hutSpots.forEach(([x, z, rot, sz, paint], i) =>
    ctx.standee(beachHutTexture(1260 + i, paint), sz, sz, x, z, { rotY: rot }));
  ctx.decal(stoneWearDecal(1264, true), 12, 9, -205, -11, 0.4, 0.32);
  ctx.standee(benchTexture(1265), 2.8, 1.6, -207, -2, { rotY: -0.4 });
  ctx.standee(lobsterPotTexture(1266), 1.7, 1.4, -197, -22, { rotY: 0.7 });

  /* ---- THE CUT ----------------------------------------------------- *
   * The ledge, dressed. The wall on the landward side is drawn at
   * foreground pressure so it reads as the same stone the terrain
   * shader is hatching behind it; the roped posts stand on the seaward
   * side, where the page falls away because the ledge was CARVED and
   * never built out. Nine posts, three walls, and the ledge's own wear
   * underfoot — that is the whole place, and it is enough, because the
   * subject here is the ground. */
  /* THE CLIFF IS THE GROUND. Rounds 1, 2 and 3 of the gate each got a
   * run of stand-up walls along here and each time the verdict was the
   * same: pale slabs hung across the headland. The verdict was right,
   * and the reason it kept being right is the session's own thesis —
   * a drawing standing in front of a cliff can only be a drawing
   * standing in front of a cliff.
   *
   * So the ledge's rock is the page's rock, hatched down its own fall
   * line by the terrain shader, and what the drawings carry is the one
   * thing the height field cannot say: that a PERSON made this. The
   * chisel marks lie ON the floor, where they cannot float; the roped
   * posts stand on the SEAWARD side, over the drop; and exactly one
   * face stands, at the top, where the carve leaves a real notch with
   * rising ground behind it.
   *
   * Which side is which is decided against the point's own centre, not
   * against the path's handedness — round 5 took the left-hand normal
   * of a traverse that turns through ninety degrees and hung the rope
   * up the cliff and the rock face out over the sea. */
  const HOLD_C = { x: -220, z: -78 };
  const sides = (t: number) => {
    const p = alongPath(CUT_LINE, t);
    let ix = HOLD_C.x - p.x;
    let iz = HOLD_C.z - p.z;
    const il = Math.hypot(ix, iz) || 1;
    ix /= il;
    iz /= il;
    return { p, ix, iz };
  };

  for (let i = 0; i < 6; i++) {
    const { p } = sides(0.16 + i * 0.14);
    ctx.decal(chiselMarksDecal(1270 + i), 9, 7.4, p.x, p.z,
      Math.atan2(p.ax, p.az) + (r() - 0.5) * 0.4, 0.5 + r() * 0.2);
  }
  /* And the last stand-up is gone too. Round 5 put ONE small face at
   * the top of the cutting, on the argument that the carve leaves a
   * real notch there — and it came out as a grey slab hanging in the
   * air over the ledge, which is the fourth time this session that a
   * drawing stood in front of this cliff and lost to it. The cliff
   * wins. It is the ground; that was the point. */
  for (let i = 0; i < 5; i++) {
    const { p, ix, iz } = sides(0.18 + i * 0.17);
    ctx.standee(cutRopeRunTexture(1274 + i), 12, 4.0, p.x - ix * 4.4, p.z - iz * 4.4,
      { rotY: Math.atan2(-ix, -iz) });
  }
  // three single posts where the rope has gone, spaced by eye
  for (const t of [0.08, 0.63, 0.79, 0.93]) {
    const { p, ix, iz } = sides(t);
    ctx.standee(cutPostTexture(1278 + Math.round(t * 10)), 1.5, 3.9,
      p.x - ix * 4.7, p.z - iz * 4.7);
  }
  for (let i = 0; i < 5; i++) {
    const p = alongPath(CUT_LINE, 0.1 + i * 0.2);
    ctx.decal(stoneWearDecal(1284 + i, true), 11, 7, p.x, p.z,
      Math.atan2(p.ax, p.az), 0.34 + r() * 0.16);
  }

  /* ---- THE HOLDFAST ------------------------------------------------ *
   * The point earns its silence. One cairn on eleven units of bare
   * paper, and everything else is BELOW: sea stacks and shore rock on
   * the foreshore at the cliff's foot, which is what gives the frame
   * from up here its floor. */
  ctx.standee(cairnTexture(1290), 3.0, 4.5, -237, -80);
  // three stacks, well apart and at three sizes — round 4 had them in a
  // huddle and they read as one grey lozenge with lumps
  const stacks: [number, number, number][] = [[-268, -60, 9.6], [-274, -92, 6.2], [-259, -116, 4.4]];
  stacks.forEach(([x, z, h], i) => ctx.standee(seaStackTexture(1291 + i), h * 0.85, h, x, z));
  /* THE CLIFF'S FOOT, all the way round. A cliff that meets flat sand
   * at a clean line is a cut-out standing on a beach; what a cliff
   * actually does is DROP things, and the skirt of what it has dropped
   * is the join between the two. Round 4 of the gate had rubble on the
   * sea side only, and from the bight the point looked stuck on.
   *
   * The heaps are placed by walking the torn edge itself — the same
   * eight runs `elevation.ts` cuts the page along — so the skirt can
   * never drift away from the cliff it fell off. */
  {
    const skirt: [number, number][] = [];
    for (let e = 0; e < HOLD_PLAN.length; e++) {
      const [ax, az] = HOLD_PLAN[e];
      const [bx, bz] = HOLD_PLAN[(e + 1) % HOLD_PLAN.length];
      const len = Math.hypot(bx - ax, bz - az);
      const nx = (bz - az) / len;
      const nz = -(bx - ax) / len;
      for (let d = 5; d < len - 3; d += 7 + r() * 12) {
        if (r() < 0.28) continue;                 // authored gaps
        const t = d / len;
        const out = 2 + r() * 7;
        skirt.push([ax + (bx - ax) * t + nx * out, az + (bz - az) * t + nz * out]);
      }
    }
    const scree = ctx.field(shoreRockTexture(1295), skirt.length, { w: 7.4, h: 4.2 });
    skirt.forEach(([x, z], i) => scree.set(i, x, z, 0.5 + r() * 0.6, 0, r() > 0.5));
    // and a second, smaller pass of the SAME angular drawing rather
    // than a field of round boulders: sixteen domes along a shoreline
    // is the array-look with pebbles in it, which is what round 5 got.
    const fallen = ctx.field(shoreRockTexture(1296), 14, { w: 5.4, h: 3.1 });
    for (let i = 0; i < 14; i++) {
      const [sx, sz] = skirt[Math.floor(r() * skirt.length)];
      fallen.set(i, sx + (r() - 0.5) * 8, sz + (r() - 0.5) * 8, 0.3 + r() * 0.35, 0, r() > 0.5);
    }
  }

  // the foreshore: HEAPS of rock, not a row of stones. Each drawing is
  // already a small outcrop of three or four, so twelve of them at
  // clustered intervals is a broken shore; twenty-six on a stride was
  // an array with pebbles in it.
  const rockSpots: [number, number][] = [];
  for (let z = -120; z < -30; z += 9 + r() * 13) {
    if (r() < 0.2) continue;
    rockSpots.push([coastX(z) + 1 + r() * 11, z]);
    if (r() > 0.55) rockSpots.push([coastX(z) - 6 - r() * 8, z + 3 + r() * 5]);
  }
  const rocks = ctx.field(shoreRockTexture(1294), rockSpots.length, { w: 8.4, h: 4.8 });
  rockSpots.forEach(([x, z], i) => rocks.set(i, x, z, 0.55 + r() * 0.75, 0, r() > 0.5));

  /* ---- SHELTER COVE ------------------------------------------------ *
   * Behind the point, where the water is never rough. A boat drawn up
   * on clean sand, pots that are actually in use, and the dune standing
   * closed behind it. Domestic, quiet, and the reward for the climb. */
  // The cove's furniture sits on the WATER'S OWN EDGE. Round 1 put it
  // fifteen units inland, where the sea is out of frame to the left and
  // "the sheltered cove" was a beige void with a boat in it.
  ctx.standee(beachedBoatTexture(1300), 6.6, 3.3, -222, -136, { rotY: 0.42 });
  ctx.standee(mooringPostTexture(1301), 1.1, 3.0, -227, -142);
  ctx.standee(mooringPostTexture(1302), 1.0, 2.6, -224, -150);
  const covePots: [number, number, number][] = [
    [-217, -130, 0.2], [-215, -132.5, -0.5], [-219, -126, 0.8],
  ];
  covePots.forEach(([x, z, rot], i) =>
    ctx.standee(lobsterPotTexture(1303 + (i % 3)), 1.8, 1.5, x, z, { rotY: rot }));
  ctx.standee(driftwoodTexture(1307), 4.2, 1.7, -213, -148, { rotY: -0.3 });
  ctx.standee(driftwoodTexture(1308), 3.2, 1.3, -219, -156, { rotY: 0.9 });

  /* ---- THE RIVER MOUTH --------------------------------------------- *
   * The river crosses the whole sheet and ENDS here, in salt, under a
   * plank footbridge that has been on the map since Session 1. Groynes
   * hold the sand against it. */
  ctx.standee(groyneTexture(1310), 20, 4.4, -222, 190, { rotY: 1.42 });
  ctx.standee(groyneTexture(1311), 18, 3.9, -228, 226, { rotY: 1.36 });
  ctx.standee(driftwoodTexture(1312), 6.0, 2.4, -214, 196, { rotY: 0.2 });
  ctx.standee(driftwoodTexture(1313), 4.4, 1.8, -210, 218, { rotY: -0.6 });
  ctx.standee(mooringPostTexture(1314), 1.1, 3.0, -208, 213);
  ctx.standee(lobsterPotTexture(1315), 1.8, 1.5, -204, 216, { rotY: 0.3 });

  /* ---- the two composed voids, one midpoint each ------------------- */
  // south: a boat resting, halfway to the river mouth
  ctx.standee(beachedBoatTexture(1320), 6.4, 3.2, -232, 112, { rotY: -0.35 });
  ctx.standee(driftwoodTexture(1321), 3.8, 1.6, -226, 118, { rotY: 0.7 });
  // north: the last groyne, and then the coast gives up being drawn
  ctx.standee(groyneTexture(1322), 22, 4.6, -228, -196, { rotY: 1.5 });
  ctx.standee(groyneTexture(1323, true), 20, 3.4, -232, -218, { rotY: 1.46 });
  ctx.standee(groyneTexture(1324, true), 17, 2.4, -236, -242, { rotY: 1.52 });

  /* ---- THE GULLS --------------------------------------------------- *
   * A working flock stands on the tide line in the bight, mostly facing
   * the same way because gulls do. Walk into them and they go up, wheel
   * out over the water and come down further along the beach — further
   * and slower than Brim's pigeons, because gulls are bigger birds and
   * they hold a grudge. */
  const FLOCK = 13;
  const gullFields = [0, 1, 2, 3].map((p) =>
    ctx.field(gullTexture(1330 + p, p as 0 | 1 | 2 | 3), FLOCK, { w: 2.6, h: 1.9 }));
  type Gull = { x: number; z: number; hx: number; hz: number; ph: number; f: number };
  const gulls: Gull[] = [];
  for (let i = 0; i < FLOCK; i++) {
    const z = -22 + r() * 46;
    const x = coastX(z) + 5 + r() * 16;
    gulls.push({ x, z, hx: x, hz: z, ph: r() * 6.3, f: r() > 0.78 ? 3 : 2 });
  }
  let flockUp = 0;      // 0 down .. 1 fully up
  let flockFired = false;
  let flockHome = 0;    // how far along the beach they have shifted

  /* ---- the boardwalk's rope and rail motion ------------------------ */
  const sockMat = sock.material as THREE.MeshBasicMaterial;

  return (dt: number, t: number, px: number, pz: number) => {
    // the windsock is the coast's one instrument: it never stops, and
    // its swing is the same wind the marram is leaning in
    sock.rotation.y = 0.22 + Math.sin(t * 0.5) * 0.3 + Math.sin(t * 1.31) * 0.08;
    sockMat.opacity = 1;

    /* THE FLOCK. */
    let near = 1e9;
    for (const g of gulls) near = Math.min(near, Math.hypot(g.hx - px, g.hz - pz));
    if (!flockFired && near < 7) {
      flockFired = true;
      flockHome += 30 + Math.random() * 22;
      say('gull-cry');
    }
    if (flockFired && near > 34) flockFired = false;
    const want = flockFired ? 1 : 0;
    flockUp += (want - flockUp) * (1 - Math.exp(-dt * (want ? 2.6 : 0.55)));

    for (let i = 0; i < FLOCK; i++) {
      const g = gulls[i];
      // where they are settling to: further down the beach every time
      const settleZ = g.z + flockHome * (0.7 + (i % 5) * 0.12);
      const settleX = coastX(settleZ) + 5 + ((i * 37) % 15);
      // and where they are when they are up: a wheel out over the water
      const a = t * (0.5 + (i % 4) * 0.07) + g.ph;
      const wheelX = coastX(settleZ) - 14 + Math.cos(a) * (13 + (i % 3) * 5);
      const wheelZ = settleZ - 6 + Math.sin(a * 2) * 9;
      const k = flockUp * flockUp * (3 - 2 * flockUp);
      g.hx = settleX + (wheelX - settleX) * k;
      g.hz = settleZ + (wheelZ - settleZ) * k;
      const y = ctx.groundY(g.hx, g.hz) + k * (5.5 + Math.sin(a * 1.7 + i) * 2.4);
      // posture: standing or calling when down, gliding or beating when up
      const pose = k > 0.22 ? (Math.sin(a * 3 + i) > 0 ? 0 : 1) : g.f;
      for (let p = 0; p < 4; p++) {
        if (p === pose) {
          gullFields[p].set(i, g.hx, g.hz, 0.7 + (i % 4) * 0.09, 0, Math.cos(a) < 0);
          gullFields[p].mesh.getMatrixAt(i, _m);
          _m.elements[13] = y;
          gullFields[p].mesh.setMatrixAt(i, _m);
          gullFields[p].mesh.instanceMatrix.needsUpdate = true;
        } else {
          gullFields[p].set(i, g.hx, -4000, 0.001, 0, false);
        }
      }
    }
  };
};

const _m = new THREE.Matrix4();

export const BEACH_POIS: WorldPOI[] = [
  {
    x: -224, z: 58, radius: 10, label: 'THE BOARDWALK',
    prompt: 'WALK THE PLANKS',
    note: {
      title: 'the boardwalk',
      body: 'the road walks out onto the sand, thinks better of it, and becomes planks. the planks knock hollow underfoot — the sound of a drawing bragging about being a drawing. they stop, eventually, over the water, for no reason anybody wrote down.',
    },
  },
  {
    x: -204, z: -9, radius: 12, label: 'THE PAINTED HUTS',
    prompt: 'LOOK IN A WINDOW',
    note: {
      title: 'the painted huts',
      body: 'four huts, three colours, thirty years of salt. two of the doors are open and there is nothing in either of them but a folded chair and the particular dark that beach huts keep. the fourth has a bar across it and has had for a while.',
    },
  },
  {
    x: -228, z: -46, radius: 12, label: 'THE CUT',
    prompt: 'READ THE CHISEL MARKS',
    note: {
      title: 'the cut',
      body: 'the cliff did not have a path. somebody went at it with a jumper bar and a great deal of time, and now it does. you can still see the half-round grooves where the drill went in. the rope on the sea side is a courtesy; the rock on the other side is not.',
    },
  },
  {
    x: -237, z: -80, radius: 12, label: 'THE HOLDFAST',
    prompt: 'STAND AT THE POINT',
    note: {
      title: 'the holdfast',
      body: 'the wet edge of the page tore away on both sides of here and this piece held. that is all a headland is. the stones on top were put there one at a time by people who had just climbed the cut and wanted to say so.',
    },
  },
  {
    x: -221, z: -134, radius: 13, label: 'SHELTER COVE',
    prompt: 'SIT A WHILE',
    note: {
      title: 'shelter cove',
      body: 'the sea comes in here the long way round and arrives tired. the boat has been pulled up past the wrack line by somebody who has done it a thousand times and never once further than they had to.',
    },
  },
  {
    x: -203, z: 204, radius: 11, label: 'THE RIVER MOUTH',
    prompt: 'WATCH THE INK GO OUT',
    note: {
      title: 'the river mouth',
      body: 'four hundred units of river, one long sentence across the whole page, and this is the full stop. the ink goes out with the tide and does not come back, and upstream it keeps writing the same word anyway.',
    },
  },
  { x: -232, z: 112, radius: 7, label: 'A BOAT, RESTING' },
];

/* ================================================================== *
 * THE WIDE BLUE — open water.
 *
 * The hardest land on the sheet, because its whole surface is a thing
 * you cannot stand on. Session 1 shipped it as three sailboats at
 * x ≈ −330, forty units past the point where the water refuses the
 * walker: nobody has ever seen them at any size, and the land had no
 * reason to be entered and no shot.
 *
 * THE SANDBAR fixes that, and it fixes it out of the metaphor rather
 * than with a boat: when a wash runs across a sheet it leaves misses,
 * and this one left a long curved miss running out from the shore. It
 * is paper, so it is dry, so you can walk it — a hundred and eighty
 * units out, to where the coast reads as a drawn coastline and the
 * regatta rounds its mark close enough to hear the halyards.
 *
 * On the water the technique is THE WATERLINE: every drawing here is
 * cut off flat at its own, with a short reflection hatch under it and
 * nothing below. Not one mark in this land is made on open water — the
 * swell, the crests and the surf are the terrain shader's, and pen
 * strokes over them fight.
 * ================================================================== */

/**
 * The regatta's course: a closed loop that rounds THE MARK, staged so
 * its SOUTHERN extremity sits about twenty units due north of where the
 * player stands on the bar. The camera in this game only ever looks
 * north, so a fleet placed west of the walker is a fleet nobody sees;
 * round 1 put it beside the bar and the boats came into frame cropped
 * by the left edge, at ten units, the size of houses.
 */
const COURSE: [number, number][] = [
  [-304, -26], [-310, -48], [-326, -62], [-344, -54], [-350, -32],
  [-340, -14], [-320, -10], [-304, -26],
];
const MARK = { x: -308, z: -36 };

export const buildOcean: RegionBuilder = (ctx: BuildCtx) => {
  const { r } = ctx;

  /* ---- THE BAR'S OWN SURFACE --------------------------------------- *
   * Ripples in the sand the tide corrugated and left, drawn at a
   * whisper — the point of the bar is that you are walking on the part
   * the wash MISSED, and a heavy mark there would make it a thing on
   * the sea instead of a hole in it. */
  const ripplePts: [number, number][] = [];
  for (let i = 0; i < SANDBAR.length - 1; i++) {
    const [ax, az] = SANDBAR[i];
    const [bx, bz] = SANDBAR[i + 1];
    const n = 4;
    for (let k = 0; k < n; k++) {
      const t = (k + 0.5) / n;
      ripplePts.push([
        ax + (bx - ax) * t + (r() - 0.5) * 13,
        az + (bz - az) * t + (r() - 0.5) * 13,
      ]);
    }
  }
  for (let v = 0; v < 4; v++) {
    const pts = ripplePts.filter((_, k) => k % 4 === v).filter(([x, z]) => barDist(x, z) < 15);
    if (!pts.length) continue;
    const f = ctx.field(barRippleDecal(1400 + v), pts.length,
      { w: 16, h: 16, decal: true, baseOpacity: 0.8 });
    pts.forEach(([x, z], i) => f.set(i, x, z, 0.8 + r() * 0.5, r() * Math.PI, r() > 0.5));
  }

  /* ---- THE NEAR MARKS ---------------------------------------------- *
   * In a land with no landform there is no other way to stage depth, so
   * the bar must ALWAYS have something near on it. Five mooring posts,
   * at intervals nobody paced out, each leaning its own way. */
  const postT = [0.07, 0.23, 0.39, 0.52, 0.66, 0.79, 0.9];
  postT.forEach((t, i) => {
    const p = alongPath(SANDBAR, t);
    ctx.standee(mooringPostTexture(1410 + (i % 3)), 1.2, 3.4 - (i % 3) * 0.4,
      p.x - p.az * (5 + r() * 5), p.z + p.ax * (5 + r() * 5));
  });
  // two withies marking the channel — set OFF the bar, in the water
  // they are marking. Round 6 planted them on the dry crest, and a buoy
  // standing on sand is a buoy that has been abandoned.
  for (const t of [0.36, 0.7]) {
    const p = alongPath(SANDBAR, t);
    ctx.standee(smallBuoyTexture(1417 + Math.round(t * 10)), 1.5, 2.4,
      p.x + p.az * 26, p.z - p.ax * 26);
  }

  /* ---- THE MARK, and the regatta round it -------------------------- */
  const bell = ctx.standee(bellBuoyTexture(1420), 3.0, 4.7, MARK.x, MARK.z);
  const buoys = [
    { m: ctx.standee(smallBuoyTexture(1421), 1.7, 2.7, -296, -22), ph: 0.4 },
    { m: ctx.standee(smallBuoyTexture(1422), 1.5, 2.3, -330, -20), ph: 2.9 },
    { m: ctx.standee(smallBuoyTexture(1423), 1.6, 2.6, -322, -58), ph: 5.1 },
  ];

  // four boats on ONE course at four points on it — never four abreast,
  // which is an array with sails on it. Two of them are always close
  // enough together to overlap in silhouette, which is what makes a
  // fleet read as a fleet.
  const boats = [0.965, 0.055, 0.30, 0.62].map((t0, i) => ({
    m: ctx.standee(
      regattaBoatTexture(1430 + i, (i % 2) as 0 | 1, (i % 3) as 0 | 1 | 2),
      [7.6, 6.2, 7.0, 5.6][i], [9.0, 7.4, 8.3, 6.6][i], -320, 0, { opacity: 0.97 }
    ),
    t: t0,
    v: 0.0088 + i * 0.0016,
    ph: i * 1.9,
  }));

  /* ---- the far south: two boats at their moorings, and nothing ----- */
  const moored = [
    { m: ctx.standee(mooredBoatTexture(1440), 7.2, 7.2, -272, 152), ph: 0.8 },
    { m: ctx.standee(mooredBoatTexture(1441), 6.2, 6.2, -286, 198), ph: 3.4 },
  ];

  /* ---- THE SHOAL --------------------------------------------------- *
   * WORLD-SYSTEMS §5: fish scatter in the shallows. They hold over the
   * bar's root where the water is a hand deep, and they break when you
   * walk into them and re-form thirty units off. */
  const SHOALS = 5;
  const shoal = ctx.field(fishShoalDecal(1450), SHOALS, { w: 7, h: 7, decal: true, baseOpacity: 0.55 });
  const fish: { x: number; z: number; hx: number; hz: number; ph: number }[] = [];
  for (let i = 0; i < SHOALS; i++) {
    const p = alongPath(SANDBAR, 0.06 + i * 0.045);
    const x = p.x + p.az * (9 + r() * 7);
    const z = p.z - p.ax * (9 + r() * 7);
    fish.push({ x, z, hx: x, hz: z, ph: r() * 6.3 });
  }
  let scatter = 0;

  const bellY = ctx.groundY(MARK.x, MARK.z);

  return (dt: number, t: number, px: number, pz: number) => {
    /* THE REGATTA. Boats carry along the course and heel INTO the turn;
     * a standee cannot rotate to a heading, so the flip is the tack and
     * it happens where the course doubles back. */
    for (const b of boats) {
      b.t = (b.t + dt * b.v) % 1;
      const p = alongPath(COURSE, b.t);
      const y = ctx.groundY(p.x, p.z);
      b.m.position.set(p.x, y + Math.sin(t * 0.7 + b.ph) * 0.14, p.z);
      // she pitches to the swell and rolls a little as she is steered
      b.m.rotation.z = Math.sin(t * 0.62 + b.ph) * 0.05 + (p.ax > 0 ? 0.03 : -0.03);
      const s = Math.abs(b.m.scale.x);
      b.m.scale.x = p.az > 0 ? -s : s;
    }

    /* THE BELL BUOY works the swell: it nods, it rolls, and it rings. */
    const swell = Math.sin(t * 0.74) + 0.4 * Math.sin(t * 1.63 + 1.1);
    bell.position.y = bellY + swell * 0.26;
    bell.rotation.z = swell * 0.1;
    for (const b of buoys) {
      b.m.position.y = ctx.groundY(b.m.position.x, b.m.position.z)
        + Math.sin(t * 1.05 + b.ph) * 0.2;
      b.m.rotation.z = Math.sin(t * 0.9 + b.ph) * 0.09;
    }
    for (const b of moored) {
      b.m.position.y = ctx.groundY(b.m.position.x, b.m.position.z)
        + Math.sin(t * 0.66 + b.ph) * 0.13;
      b.m.rotation.z = Math.sin(t * 0.48 + b.ph) * 0.045;
    }

    /* THE SHOAL. */
    let close = 1e9;
    for (const f of fish) close = Math.min(close, Math.hypot(f.hx - px, f.hz - pz));
    const want = close < 11 ? 1 : 0;
    scatter += (want - scatter) * (1 - Math.exp(-dt * (want ? 4.5 : 0.7)));
    for (let i = 0; i < SHOALS; i++) {
      const f = fish[i];
      const away = Math.atan2(f.z - pz, f.x - px);
      const drift = Math.sin(t * 0.4 + f.ph) * 2.2;
      f.hx = f.x + Math.cos(away) * scatter * 26 + drift;
      f.hz = f.z + Math.sin(away) * scatter * 26 + Math.cos(t * 0.33 + f.ph) * 2;
      shoal.set(i, f.hx, f.hz, 0.8 + (i % 3) * 0.2, away + Math.PI / 2, false);
    }
  };
};

export const OCEAN_POIS: WorldPOI[] = [
  {
    x: -262, z: 92, radius: 10, label: 'THE SHALLOWS',
    prompt: 'WADE OUT',
    note: {
      title: 'the shallows',
      body: 'you can wade to about the knee of the drawing. past that the blue gets serious, and whoever drew you gave you no more swimming than they gave themselves. what they did give you is a bar of dry sand going the other way.',
    },
  },
  {
    x: -272, z: 58, radius: 12, label: 'THE SANDBAR',
    prompt: 'FEEL THE GROUND CHANGE',
    note: {
      title: 'the sandbar',
      body: 'the wash went over this page in one pass and missed a strip of it, the way a wash always does. the sea has been trying to take the strip back ever since and has got nowhere. it is dry, it is a hundred and eighty units long, and it goes out.',
    },
  },
  {
    x: -299, z: 16, radius: 12, label: 'THE LONG WATER',
    prompt: 'STAND HERE A MOMENT',
    note: {
      title: 'the long water',
      body: 'sixty units from anything. there is not one mark drawn on the page from here to the fog, which on a sheet that is drawings all the way down is the loudest thing in the world.',
    },
  },
  {
    x: -300, z: -8, radius: 13, label: 'THE MARK',
    prompt: 'WATCH THEM ROUND IT',
    note: {
      title: 'the mark',
      body: 'they have been sailing this triangle since the page was wet. nobody has ever won and the bell keeps the time anyway, which is roughly what a race is.',
    },
  },
  {
    x: -277, z: -32, radius: 12, label: 'THE SEAWARD FACE',
    prompt: 'LOOK UP',
    note: {
      title: 'the seaward face',
      body: 'from the sand you are either on the point or behind it. from here you get the whole face at once: eleven units of torn edge, hatched down its own fall, with one thin line cut across it by somebody who wanted to be up there.',
    },
  },
];
