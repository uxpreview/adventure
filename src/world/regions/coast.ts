import * as THREE from 'three';
import { coastX } from '../terrain';
import { SANDBAR, barDist } from '../layout';
import { duneX, CUT_PATH, HOLD_PLAN } from '../elevation';
import { driftwoodTexture, shellsDecal, signpostTexture, benchTexture, lampGlowTexture } from '../textures';
import { stoneWearDecal } from '../textures-oldworld';
import {
  marramTexture, wrackDecal, beachHutTexture, groyneTexture, boardwalkDecal,
  boardwalkRailTexture, cutPostTexture, cutRopeRunTexture, chiselMarksDecal,
  seaStackTexture, cairnTexture, beachedBoatTexture, lobsterPotTexture,
  windsockTexture, gullTexture, shoreRockTexture,
  regattaBoatTexture, bellBuoyTexture, smallBuoyTexture, mooringPostTexture,
  barRippleDecal, mooredBoatTexture, fishShoalDecal,
  longshipTexture, hornTexture, surfVanTexture, boardRackTexture, wetsuitLineTexture,
  surfboardTexture, potBuoyTexture, pyeTexture, pyeBoatTexture, wrenTexture, wrenBoatTexture,
} from '../textures-coast';
import { rodTexture, crabTexture, sealTexture, deepBackTexture, hatTexture, fireTexture, rippleDecal } from '../textures-life';
import { fistStoneTexture } from '../textures-common';
import { Figure, Creature, stops, type StopRow } from '../life';
import { barriers } from '../barriers';
import { events } from '../events';
import { weather } from '../weather';
import { clock } from '../daylight';
import { things } from '../things';
import { knowledge } from '../knowledge';
import { platform } from '../../engine/Eight15';
import { rowboat } from '../../engine/Boat';
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

/* ================================================================== *
 * LONGSHORE'S UNNAMED (Session 17): a BEACHCOMBER bent along the wrack
 * line at first light; the OWNER of the third hut, who opens it at
 * nine, sits outside it until lunch, and shuts it at half past five;
 * two BATHERS who sit on the sand in the bight through the early
 * afternoon and never go in, because nobody on this coast has ever
 * learned to swim; somebody FISHING off the jetty head in the evening;
 * and somebody who walks the promenade end to end at eight and at six.
 * ================================================================== */
const COMBER = { id: 'the-beachcomber', land: 'beach' as const, pace: 240, stops: stops([
  [6.15, -206, -1, 0, -1], [6.3, coastX(24) + 7, 24, 2, -1, 0.25], [6.65, coastX(8) + 8, 8, 2, -1, 0.25],
  [7.0, coastX(-8) + 7, -8, 2, 1, 0.25], [7.35, coastX(-22) + 8, -22, 2, 1, 0.25], [7.8, -206, -1, 0, 1, 0.02],
]) };
const HUT_OWNER = { id: 'the-hut-owner', land: 'beach' as const, pace: 260, stops: stops([
  [8.95, -218, 28, 0, -1], [9.15, -203.5, -0.8, 0, 1, 0.3], [9.5, -206.5, 0.2, 3, 1, 3.0], [12.65, -203.5, -0.8, 0, -1, 0.1],
  [12.9, -218, 28, 0, 1, 0.02],
]) };
const HUT_SHUT = { id: 'the-hut-shut', land: 'beach' as const, pace: 260, stops: stops([
  [17.4, -218, 28, 0, -1], [17.6, -203.5, -0.8, 0, 1, 0.2], [17.95, -218, 28, 0, 1, 0.02],
]) };
const BATHERS = [0, 1].map((i) => ({ id: `the-bathers-${i}`, land: 'beach' as const, pace: 240, stops: stops([
  [12.95 + i * 0.03, -218, 20, 0, -1], [13.1 + i * 0.03, -214 + i * 2.2, 10 + i * 4, 3, -1, 2.0], [15.3 + i * 0.03, -218, 20, 0, 1, 0.02],
]) }));
const JETTY_FISHER = { id: 'the-jetty-fisher', land: 'beach' as const, pace: 260, stops: stops([
  [17.15, -218, 52, 0, -1], [17.3, -255, 55.5, 3, -1, 2.3], [19.75, -218, 52, 0, 1, 0.02],
]) };
const PROM_WALKERS = [8.0, 18.0].map((at, k) => ({ id: `the-prom-walker-${k}`, land: 'beach' as const, pace: 300, stops: stops([
  [at, -226, 92, 0, 1], [at + 0.28, -218, 12, 0, 1, 0.05], [at + 0.62, -226, 92, 0, -1, 0.02],
]) }));

/* ================================================================== *
 * THE ENCOUNTERS ON LONGSHORE (Session 18, `THE-STRANGERS` C5–C7).
 * ================================================================== */

/** C6 · A LINE OF PEOPLE COMBING THE TIDELINE, SPREAD OUT, SILENT.
 *  Three of them at low water — first light and again before dark —
 *  a dozen units apart along the wrack in the bight, bent, moving
 *  north a few units at a time, never any nearer each other. With the
 *  beachcomber who was already here that is four. */
function comberLine(id: string, at: number, z0: number) {
  const rows: StopRow[] = [[at, -206, -1, 0, -1]];
  for (let k = 0; k < 4; k++) rows.push([at + 0.16 + k * 0.28, coastX(z0 + k * 6) + 7.5, z0 + k * 6, 2, k % 2 ? 1 : -1, 0.2]);
  rows.push([at + 1.5, -206, -1, 0, 1, 0.02]);
  return { id, land: 'beach' as const, pace: 160, stops: stops(rows) };
}
const COMBERS = [
  comberLine('the-tideline-comber-0', 6.4, -30), comberLine('the-tideline-comber-1', 6.45, -12), comberLine('the-tideline-comber-2', 6.5, 6),
  comberLine('the-tideline-comber-3', 18.1, -28), comberLine('the-tideline-comber-4', 18.15, -10), comberLine('the-tideline-comber-5', 18.2, 8),
];
/** C7 · A FIRE LIT, AND NOBODY AT IT YET. On the south sand between
 *  the promenade's end and the boat resting, lit at seven; two come
 *  down to it at twenty past eight and sit until late; and all the
 *  next day it is a ring of cold ash, which is what a fire is the
 *  morning after. */
const FIRE = { x: -236, z: 104 };
events.register({ id: 'the-fire', land: 'beach', at: 19.0, hours: 4.6, place: FIRE });
const FIRE_FOLK = [0, 1].map((i) => ({ id: `the-fire-folk-${i}`, land: 'beach' as const, pace: 260, stops: stops([
  [20.2 + i * 0.03, -218, 92, 0, -1], [20.4 + i * 0.03, FIRE.x + (i ? 2.4 : -2.4), FIRE.z + 1.4, 3, i ? -1 : 1, 2.9], [23.5, -218, 92, 0, 1, 0.02],
]) }));
/** C5 · A HAT, GOING THE OTHER WAY, FASTER THAN YOU. Three times a
 *  day, east along the coast road from the boardwalk at seven units a
 *  second, and it stops at the Common's border like everybody else. */
const HAT_RUNS = [7.4, 11.4, 15.4];
HAT_RUNS.forEach((at, i) => events.register({ id: `the-hat-${i}`, land: 'beach', at, hours: 0.1 }));

/* ================================================================== *
 * THE SURFERS AT THE CUT (Session 19, `THE-FUN-PASS` §10). Board racks,
 * a van, a wetsuit on a line, and a coast that only has a tide. **They
 * check the water at first light every day**: out of the van, down to
 * the water's edge, stand and look at it, back to the van, sit on the
 * step. And again before dark. The wait, played for laughs, and nobody
 * explains anything. THE CUT is their district.
 * ================================================================== */
const VAN = { x: -213, z: -41 };
const RACK = { x: -207.5, z: -37 };
const LINE_POSTS = { x: -219.5, z: -39 };
const WATER_EDGE_Z = -40;
function surferDay(id: string, at: number, dx: number, dh: number) {
  return { id, land: 'beach' as const, pace: 240, stops: stops([
    [at + dh, VAN.x - 3 + dx, VAN.z + 2.2, 0, -1],
    [at + dh + 0.14, coastX(WATER_EDGE_Z + dx * 2) + 2.6 + dx * 0.4, WATER_EDGE_Z + dx * 2, 0, -1, 0.22],
    [at + dh + 0.52, VAN.x - 2 + dx * 1.6, VAN.z + 2.6, 3, 1, 0.5],
    [at + dh + 1.1, VAN.x - 3 + dx, VAN.z + 2.2, 0, 1, 0.02],
  ]) };
}
const SURFERS = [
  surferDay('the-surfer-0', 6.05, 0, 0), surferDay('the-surfer-1', 6.05, 2.2, 0.02),
  surferDay('the-surfer-0-evening', 17.55, 0, 0), surferDay('the-surfer-1-evening', 17.55, 2.2, 0.02),
];
/** The van's light comes on at dusk, and the jetty's lamp — Longshore
 *  at dusk was a blank (the local QA pass, §4 item 4). */
events.register({ id: 'the-van-light', land: 'beach', at: 19.2, hours: 4.3, place: VAN });
events.register({ id: 'the-jetty-lamp', land: 'beach', at: 19.0, hours: 10.9, place: { x: -255, z: 51.5 } });
/** THE ERRAND (`THE-STRANGERS` Part Two, E21): a board has come off the
 *  rack in the night and is down the beach on the wrack; bring it back
 *  and set it down at the rack, and it is racked, and there are three,
 *  and the van's sticker has been added to. A carriable with no home
 *  worth going back to: the morning leaves it where the tide did. */
const BOARD_HOME = { x: coastX(16) + 9.5, z: 16 };
things.register({ id: 'the-board', kind: 'carriable', land: 'beach', home: BOARD_HOME, name: 'THE BOARD' });

/* ================================================================== *
 * PYE (Session 19, `THE-WAITS` §6). He rows out at the tide, comes
 * back at the tide, and keeps seven pots that catch nothing much. The
 * pots are not for catching: they are seven MARKS, and running the
 * line of them is how a man holds the shape of a day when the only
 * clock is the water. Two rows a day, off the cove; between them he
 * is by the boat, at the pots, or sat on her gunwale.
 * ================================================================== */
const COVE_BOAT = { x: -222, z: -136 };
const POT_LINE: [number, number][] = [[-231, -139], [-235, -142.5], [-239, -146], [-242.5, -150], [-245.5, -153.5], [-247, -158], [-247.5, -163]];
/** The eighth, further out than any of the seven, on a bearing he has
 *  never rowed. He will not go there. */
const EIGHTH_POT = { x: -247.6, z: -167.5 };
const PYE_SHORE = { x: COVE_BOAT.x + 3.6, z: COVE_BOAT.z + 1.8 };
const PYE_POTS = { x: -216.4, z: -129.2 };
const PYE_ROWS = [{ at: 6.55, hours: 1.05 }, { at: 18.35, hours: 1.05 }];
PYE_ROWS.forEach((w, i) => events.register({ id: `pye-rows-${i}`, land: 'beach', ...w, place: { x: -238, z: -148 } }));
const PYE_DAY = { id: 'pye', land: 'beach' as const, pace: 200, walkPose: 0, stops: stops([
  [7.7, PYE_SHORE.x, PYE_SHORE.z, 0, -1, 0.3], [8.2, PYE_POTS.x, PYE_POTS.z, 2, 1, 4.2],
  [12.65, PYE_SHORE.x + 1.2, PYE_SHORE.z, 3, -1, 5.55], [18.3, PYE_SHORE.x, PYE_SHORE.z, 0, -1, 0.02],
]) };
/** The day after the pots are hauled: nothing to row out to. He sits. */
const PYE_HAULED = stops([[7.7, PYE_SHORE.x + 1.2, PYE_SHORE.z, 3, -1, 11.9]]);

/* THE HORN ON THE POINT, and who answers it (Session 19; the Holdfast's
 * toy, `THE-FUN-PASS` §3 item 3). The point is LONGSHORE's and the
 * longship is THE WIDE BLUE's, so the horn is blown in one builder and
 * answered in the other: the touch sets `pending`, the ocean's update
 * takes it and roars a beat and a half later, and the beach's gulls go
 * up at the roar. Repeatable, no score, and the answer is the point. */
const horn = { pending: false, answerAt: -1, liftGulls: false };

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
    ctx.standee(beachHutTexture(1260 + i, paint), sz, sz, x, z, { rotY: rot, solid: true }));
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
  stacks.forEach(([x, z, h], i) => ctx.standee(seaStackTexture(1291 + i), h * 0.85, h, x, z, { solid: h * 0.3 }));
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
  /* HOW MANY TIMES THEY HAVE BEEN PUT UP, and it is a COUNTER rather
   * than a call to Math.random for one reason: this is the only
   * unseeded randomness left anywhere in the drawn world, and it made
   * LONGSHORE the one land whose contact sheet could not be compared
   * with itself (Session 9, tools/diff-sheets.mjs). Every flight still
   * carries them a different distance down the beach; it is now the
   * same different distance every time you walk it, which is what
   * everything else in this world already does. */
  let flockPuts = 0;

  /* ---- the boardwalk's rope and rail motion ------------------------ */
  const sockMat = sock.material as THREE.MeshBasicMaterial;

  /* ---- THE UNNAMED, AND THE CRABS (Session 17) --------------------- */
  const comber = new Figure(ctx, COMBER, 2);
  const hutOwner = new Figure(ctx, HUT_OWNER, 0);
  const hutShut = new Figure(ctx, HUT_SHUT, 0);
  const bathers = BATHERS.map((d, i) => new Figure(ctx, d, i ? 1 : 2));
  const fisher = new Figure(ctx, JETTY_FISHER, 0);
  fisher.prop = ctx.standee(rodTexture(1350), 1.6, 1.6, -255, 55.5);
  (fisher.prop.material as THREE.MeshBasicMaterial).transparent = true;
  fisher.propOffset = { x: -0.9, z: -0.1 };
  const promWalkers = PROM_WALKERS.map((d, i) => new Figure(ctx, d, i ? 2 : 1));
  /* THE CRABS on the wrack — the coast's creature (§3 item 1). Six of
   * them on the tide line in the bight, and they go SIDEWAYS, toward
   * the water, the moment you come inside four units, and come back
   * when you have gone. The gulls hold a grudge; the crabs do not. */
  const CRABS: [number, number][] = [[-20, -6], [-16, 2], [-12, 9], [-8, 14], [-15, 20], [-11, -2]]
    .map(([o, z]) => [coastX(z) + 10 + o * 0.2, z]);
  const crabs = CRABS.map(([x, z], i) => new Creature(ctx, `the-crabs-${i}`, 'beach', [crabTexture(1360 + i)], 0.7, 0.5, x, z));
  const crabState = CRABS.map(() => ({ away: 0 }));
  /* ---- THE ENCOUNTERS (Session 18, `THE-STRANGERS` C5, C6, C7) ------ */
  const hat = new Creature(ctx, 'the-hat', 'beach', [hatTexture(1370)], 1.1, 0.8, -215, 58.6);
  const combers = COMBERS.map((d, i) => new Figure(ctx, d, (i % 3) as 0 | 1 | 2));
  const fireLit = ctx.standee(fireTexture(1371, true), 3.2, 3.2, FIRE.x, FIRE.z);
  const fireCold = ctx.standee(fireTexture(1372, false), 3.2, 3.2, FIRE.x, FIRE.z);
  const fireFolk = FIRE_FOLK.map((d, i) => new Figure(ctx, d, i ? 1 : 2));

  /* ---- THE SURFERS AT THE CUT (Session 19) -------------------------- */
  ctx.standee(surfVanTexture(1500), 7.2, 4.5, VAN.x, VAN.z, { rotY: 0.12, solid: true });
  const rack2 = ctx.standee(boardRackTexture(1501, 2), 3.6, 3.6, RACK.x, RACK.z, { rotY: -0.2, solid: 1.2 });
  const rack3 = ctx.standee(boardRackTexture(1502, 3), 3.6, 3.6, RACK.x, RACK.z, { rotY: -0.2 });
  ctx.standee(wetsuitLineTexture(1503), 5.4, 3.2, LINE_POSTS.x, LINE_POSTS.z, { rotY: 0.3 });
  const vanLight = ctx.standee(lampGlowTexture(1504), 3.4, 3.4, VAN.x + 1.2, VAN.z + 0.4);
  (vanLight.material as THREE.MeshBasicMaterial).depthWrite = false;
  vanLight.renderOrder = 3;
  ctx.hang(vanLight, 1.4);
  const jettyLamp = ctx.standee(lampGlowTexture(1505), 3.2, 3.2, -255.2, 51.6);
  (jettyLamp.material as THREE.MeshBasicMaterial).depthWrite = false;
  jettyLamp.renderOrder = 3;
  ctx.hang(jettyLamp, 3.2);
  const surfers = SURFERS.map((d, i) => new Figure(ctx, d, 2, { scale: i % 2 ? 1 : 1.06 }));
  /* THE HORN, on its stone beside the cairn. */
  ctx.standee(hornTexture(1508), 1.7, 1.4, -233, -76.4);
  const boardThing = things.get('the-board')!;
  boardThing.def.hand = surfboardTexture(1506);
  boardThing.def.handSize = [1.5, 0.45];
  const board = ctx.standee(surfboardTexture(1507), 3.2, 0.96, boardThing.x, boardThing.z, { rotY: 0.5 });
  boardThing.mesh = board;
  rack3.visible = false;

  /* ---- PYE (Session 19) -------------------------------------------- */
  const pyeMaps = { 0: pyeTexture(1510, 0), 2: pyeTexture(1511, 2), 3: pyeTexture(1512, 3) };
  const pye = new Figure(ctx, PYE_DAY, 0, { maps: pyeMaps, scale: 1.02 });
  const pyeBoat = new Creature(ctx, 'pye-rowing', 'beach', [pyeBoatTexture(1513)], 6.0, 3.0, COVE_BOAT.x, COVE_BOAT.z);
  pyeBoat.hide();
  const pots = POT_LINE.map(([x, z], i) => ctx.standee(potBuoyTexture(1520 + i), 1.3, 1.7, x, z));
  const eighthPot = ctx.standee(potBuoyTexture(1528), 1.3, 1.7, EIGHTH_POT.x, EIGHTH_POT.z);
  eighthPot.visible = false;
  // hauled: the seven stacked by the boat, wet
  const hauled = [[-218.5, -138.5, 0.3], [-217, -136.5, -0.4], [-219.5, -135, 0.8], [-216, -139.5, 0.1]]
    .map(([x, z, rot], i) => ctx.standee(lobsterPotTexture(1530 + (i % 3)), 1.8, 1.5, x, z, { rotY: rot }));
  for (const m of hauled) m.visible = false;
  let pyeDoor: 'none' | 'eighth' | 'hauled' = 'none';

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
      flockHome += 30 + (Math.sin(flockPuts++ * 12.9898) * 0.5 + 0.5) * 22;
      say('gull-cry');
    }
    // and they go up for a roar, wherever the walker is
    if (horn.liftGulls) {
      horn.liftGulls = false;
      if (!flockFired) { flockFired = true; flockHome += 12; say('gull-cry'); }
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
          gullFields[p].hide(i, g.hx, g.hz);
        }
      }
    }

    /* ---- THE UNNAMED, AND THE CRABS (Session 17) --------------------- */
    const h = clock.hour;
    const rain = weather.state.rain > 0.5;
    comber.tick(h);
    hutOwner.tick(h, rain);
    hutShut.tick(h);
    for (const b of bathers) b.tick(h, rain);
    fisher.tick(h);
    for (const w of promWalkers) w.tick(h, rain);
    let scuttled = false;
    crabs.forEach((c, i) => {
      const [x, z] = CRABS[i];
      const st = crabState[i];
      const d = Math.hypot(px - x, pz - z);
      if (d < 4.2 && st.away <= 0) { st.away = 12; scuttled = true; }
      st.away = Math.max(0, st.away - dt);
      const u = st.away > 0 ? Math.min(1, (12 - st.away) / 0.5) * Math.min(1, st.away / 2) : 0;
      c.set(0, x - 3.6 * u, z + Math.sin(t * 5 + i) * 0.08 * u, 1, 0.02);
    });
    if (scuttled) say('crab-scuttle');

    /* ---- THE ENCOUNTERS (Session 18) --------------------------------- */
    for (const c of combers) c.tick(h, rain);
    {
      const lit = events.progress('the-fire') >= 0;
      fireLit.visible = lit;
      fireCold.visible = !lit;
      for (const f of fireFolk) f.tick(h, rain);
    }
    /* ---- THE SURFERS, THE BOARD, THE LIGHTS (Session 19) ------------- */
    for (const s of surfers) s.tick(h, rain);
    vanLight.visible = events.progress('the-van-light') >= 0;
    jettyLamp.visible = events.progress('the-jetty-lamp') >= 0;
    {
      const racked = knowledge.has('fact:the-board-racked');
      rack2.visible = !racked;
      rack3.visible = racked;
      if (!racked && boardThing.state === 'ground'
        && Math.hypot(boardThing.x - RACK.x, boardThing.z - RACK.z) < 6.2) {
        /* SET DOWN AT THE RACK, IT IS RACKED. The visible permanent
         * change is a third board; the van's sticker says the rest. */
        knowledge.learn('fact:the-board-racked');
        boardThing.x = RACK.x;
        boardThing.z = RACK.z;
        say('board-knock');
      }
      const fp = things.flyPos(boardThing);
      if (racked) board.visible = false;
      else if (fp) { board.visible = true; board.position.set(fp.x, fp.y, fp.z); }
      else if (boardThing.state === 'ground') { board.visible = true; board.position.set(boardThing.x, ctx.groundY(boardThing.x, boardThing.z), boardThing.z); }
      else board.visible = false;
    }

    /* ---- PYE, AND THE TWO DOORS (Session 19) -------------------------- */
    {
      const door = knowledge.has('door:the-pots-hauled') ? 'hauled' : knowledge.has('door:the-eighth-pot') ? 'eighth' : 'none';
      if (door !== pyeDoor) {
        pyeDoor = door;
        // the routine is re-written in place: the day has a new shape
        if (door === 'hauled') PYE_DAY.stops.splice(0, PYE_DAY.stops.length, ...PYE_HAULED);
        for (const m of pots) m.visible = door !== 'hauled';
        for (const m of hauled) m.visible = door === 'hauled';
        eighthPot.visible = door === 'eighth';
      }
      const gone = platform.land === 'beach';
      pye.tick(h, rain || gone);
      // the row: out along the line, a pause at each pot, and back
      let rowing = -1;
      for (let i = 0; i < PYE_ROWS.length; i++) {
        const p = events.progress(`pye-rows-${i}`);
        if (p >= 0) rowing = p;
      }
      if (rowing < 0 || door === 'hauled' || gone) pyeBoat.hide();
      else {
        const n = POT_LINE.length;
        const u = rowing < 0.5 ? rowing * 2 : 2 - rowing * 2;   // out, then back
        const seg = Math.min(n - 1, Math.max(0, u * (n - 1)));
        const i = Math.floor(seg);
        const f = seg - i;
        const [ax, az] = i === 0 ? [COVE_BOAT.x - 2, COVE_BOAT.z - 3] : POT_LINE[i - 1];
        const [bx, bz] = POT_LINE[Math.min(n - 1, i)];
        // he dwells at each pot: the last third of every leg is still
        const k = Math.min(1, f / 0.66);
        const x = ax + (bx - ax) * k;
        const z = az + (bz - az) * k;
        pyeBoat.set(0, x, z, rowing < 0.5 ? -1 : 1, Math.sin(t * 1.1) * 0.08);
        if (k < 1 && Math.floor(t * 0.9) !== Math.floor((t - dt) * 0.9) && Math.hypot(px - x, pz - z) < 30) say('oar');
      }
      // the eighth pot is set the morning after the name comes back: it
      // is set at arrival, which is how a wait resolves (`THE-WAITS` §0)
      if (door === 'none' && knowledge.has('name:the-mark') && Math.hypot(px - COVE_BOAT.x, pz - COVE_BOAT.z) < 14 && knowledge.has('door:the-eighth-pot')) { /* the card writes the door */ }
    }
    {
      /* THE HAT: between runs it lies where it stopped, which is the
       * border, and the morning puts it back at the boardwalk. */
      const X0 = -215;
      const X1 = -152.2;
      let k = -1;
      let ran = false;
      for (let i = 0; i < HAT_RUNS.length; i++) {
        const p = events.progress(`the-hat-${i}`);
        if (p >= 0) k = p;
        if (h >= HAT_RUNS[i]) ran = true;
      }
      if (h < HAT_RUNS[0] || h > 22.5) hat.set(0, X0, 58.6, 1, 0.05);
      else if (k >= 0) hat.set(0, X0 + (X1 - X0) * k, 58.6 + Math.sin(k * 40) * 0.5, 1, 0.3 + Math.abs(Math.sin(k * 60)) * 0.9);
      else hat.set(0, ran ? X1 : X0, 58.6, 1, 0.05);
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
      body: 'the road walks out onto the sand, thinks better of it, and becomes planks. the planks knock hollow underfoot, which is the only sound on this coast anybody built on purpose. they stop, eventually, over the water, for no reason anybody here can give you.',
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
      body: 'the sea took the land away on both sides of here and this piece held. that is all a headland is. the stones on top were put there one at a time by people who had just climbed the cut and wanted to say so.',
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
      body: 'the whole river comes down to this, and here is where it stops being one. what goes out on the tide does not come back, and upstream it keeps coming down at exactly the same rate, which is either patience or arithmetic.',
    },
  },
  { x: -232, z: 112, radius: 7, label: 'A BOAT, RESTING' },
  /* ---- SESSION 19: THE NEW CAST, WEST ------------------------------ */
  {
    /* THE VAN. The surfers' place, and the note says what they do,
     * which is check. */
    /* Its reach stops short of the rack: a thing in reach beats the
     * thing in the hand, and a walker setting the board down at the
     * rack must not be offered the sticker instead (Session 15's
     * gotcha, learned a third time on the sheet). */
    x: VAN.x, z: VAN.z + 1, radius: 5, label: 'THE VAN',
    prompt: 'READ THE STICKER',
    note: {
      title: 'the van',
      body: () => (knowledge.has('fact:the-board-racked')
        ? 'a van with a roof rack, a sticker on the back door that says the surf report is on the other door, and on the other door it says: flat. three boards now, one of them with sand still on it, which somebody has had to explain. they check the water at first light every day. it is important to check.'
        : 'a van with a roof rack, a sticker on the back door that says the surf report is on the other door, and on the other door it says: flat. two boards on the rack and a wetsuit on the line, and a coast that only has a tide. they check the water at first light every day. it is important to check.'),
    },
  },
  {
    /* THE BOARD, where the tide left it: off while it is in the hand or
     * in the air, and gone from the beach once it is racked. */
    get x() { return things.get('the-board')!.x; },
    get z() { return things.get('the-board')!.z; },
    get enabled() { return things.get('the-board')!.state === 'ground' && !knowledge.has('fact:the-board-racked'); },
    set enabled(_v: boolean) { /* the registry and the rack decide */ },
    radius: 2.8,
    prompt: 'PICK UP THE BOARD',
    touch: () => { things.pickUp('the-board'); },
  } as unknown as WorldPOI,
  {
    /* THE HORN. Blow it, and they answer, every time, from wherever
     * they are. Nothing says who put it here. */
    x: -233, z: -76, radius: 3.2, label: 'THE HORN',
    prompt: 'BLOW THE HORN',
    touch: () => {
      say('horn');
      horn.pending = true;
    },
  },
  {
    /* THE POT LINE — where Pye's wait is legible, and where both doors
     * are (`THE-FUN-PASS` §6, `THE-WAITS` §6). Before you have the
     * mark's name it is a note; with it, a card with two doors, offered
     * once. Nothing here says which was right. */
    x: PYE_POTS.x, z: PYE_POTS.z + 0.5, radius: 5.5, label: 'THE POT LINE',
    get prompt() {
      const done = knowledge.has('door:the-eighth-pot') || knowledge.has('door:the-pots-hauled');
      if (!done && knowledge.has('name:the-mark')) return 'TELL HIM THE MARK\'S NAME';
      return 'COUNT THE POTS';
    },
    get choice() {
      if (!knowledge.has('name:the-mark')) return undefined;
      return {
        body: 'seven pots on a line off the cove, and a man who rows out to them at the tide and back at the tide, and has done for as long as the tide has. you have been out to the mark, which nobody in longshore has. he would like to know what it is called. or the pots could come up. they have never once come up.',
        options: [
          { label: 'TELL HIM THE MARK\'S NAME', door: 'door:the-eighth-pot' },
          { label: 'HAUL THE POTS', door: 'door:the-pots-hauled' },
        ],
      };
    },
    note: {
      title: 'the pot line',
      body: () => {
        if (knowledge.has('door:the-eighth-pot')) return 'eight pots on a line off the cove, and the eighth is further out than any of the seven, on a bearing nobody here has rowed. he set it the morning after you came back. he has not been out to it and he is not going to, and it has his mark on it.';
        if (knowledge.has('door:the-pots-hauled')) return 'seven pots stacked by the boat, wet, and nothing on the line. they were empty. he has not said anything about it, and he sits on the gunwale now at the hours he used to row, and the tide comes in and goes out without anywhere to put him.';
        return 'seven pots on a line off the cove, three or four paces apart, going out. pye rows out to them at the tide and back at the tide. they catch nothing much, and he sets them again anyway, and the tide is the most reliable thing anybody here knows.';
      },
    },
  } as unknown as WorldPOI,
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

/* THE REGATTA STARTS AT NOON (Session 17, `THE-FUN-PASS` §9: *the
 * regatta start at noon* is on the list of things that happen on the
 * clock). Before it the fleet drifts about the course the way it has
 * since Session 5; at twelve the bell goes twice and the halyards run,
 * and for an hour and a half they RACE — three times the speed, heeled
 * over, the sails full of whatever wind there is — and then they drift
 * again, and nobody has won. Whether or not anybody is on the bar. */
const REGATTA = { at: 12.0, hours: 1.5 };
events.register({ id: 'the-regatta', land: 'ocean', ...REGATTA, place: { x: -308, z: -36 },
  onStart: (px, pz) => {
    if (Math.hypot(px + 308, pz + 36) < 90) { say('bell-buoy'); say('halyard'); }
  } });
/* THE SEALS haul out on the bar through the middle of the day. */
events.register({ id: 'the-seals-haul-out', land: 'ocean', at: 9.5, hours: 7.0, place: { x: -290, z: 10 } });
/* AND SOMETHING UNDER THE WIDE BLUE SURFACES ONCE AT DUSK (§9 item 4,
 * §10 THE MONSTERS): ten seconds, fifty units north of the bar's end,
 * a back and a fin and the water going white, and gone. It is the one
 * thing in the game that is drawn to be frightening, and it happens
 * whether or not anybody is on the bar to be frightened. */
/** Which dusks it surfaces at: every third, from the shipped page's own
 *  (day zero). The day after each, the seals stay in the water. */
const deepDay = (day: number) => day % 3 === 0;
const deepYesterday = (day: number) => day % 3 === 1;
events.register({ id: 'the-deep', land: 'ocean', at: 19.35, hours: 0.1, place: { x: -300, z: -70 },
  onStart: (px, pz) => { if (deepDay(clock.day) && Math.hypot(px + 300, pz + 70) < 110) say('deep-surface'); } });

/* ================================================================== *
 * THE VIKINGS ON THE HOLDFAST (Session 19, `THE-FUN-PASS` §10). A
 * longship beached at the foot of the point's seaward face, and a
 * raiding party that has been waiting for a wind for four hundred
 * years. **Every day they row out to the mark and compete in the
 * regatta**, because it is the only thing to do. They roar at the
 * shore. **They cannot land on it**: the berth is THE WIDE BLUE's and
 * the sand they roar at is LONGSHORE's, and the border is the rule that
 * makes them funny. The ship is a thing and the crew is its drawing;
 * neither has a position outside the ocean's rect by any path here.
 *
 * Their day is a pure function of the hour, like everybody's: in from
 * the offing at first light (the first time you see them from the
 * promenade they are a longship coming in), beached until the regatta
 * is called, out to the course and round it, back, and beached again
 * through the night.
 * ================================================================== */
const BERTH = { x: -264, z: -46 };
const OFFING = { x: -334, z: -96 };
const SHIP = { rowIn: [6.0, 7.0], out: [11.85, 12.0], race: [12.0, 13.5], back: [13.5, 13.75] };
events.register({ id: 'the-longship-in', land: 'ocean', at: 6.0, hours: 1.0, place: BERTH });
events.register({ id: 'the-longship-out', land: 'ocean', at: 11.85, hours: 1.9, place: BERTH });

/* ================================================================== *
 * WREN (Session 19, `THE-WAITS` §8). Keeps the mark: rows out, rings
 * the bell, rows back. The bell buoy has been ringing since Session 5
 * and this is who rings it. The punt is drawn up on the bar's root;
 * the noon row goes out along the bar's seaward side to the mark, and
 * Wren is beside the buoy for the race and rows back after it.
 * ================================================================== */
const WREN_BOAT = { x: -266.5, z: 72.5 };
const WREN_SHORE = { x: -263.6, z: 70.4 };
const WREN_AT_MARK = { x: -304, z: -32 };
/** The second mark, at the bar's far end, in the water off it. */
const SECOND_MARK = { x: -266, z: -16 };
const WREN_ROW = { at: 11.6, hours: 2.3 };
events.register({ id: 'wren-rows', land: 'ocean', ...WREN_ROW, place: { x: -282, z: 34 } });
const WREN_EVENING = { at: 18.0, hours: 1.0 };
events.register({ id: 'wren-rows-evening', land: 'ocean', ...WREN_EVENING, place: SECOND_MARK });
const WREN_DAY = { id: 'wren', land: 'ocean' as const, pace: 200, walkPose: 0, stops: stops([
  [8.0, WREN_SHORE.x, WREN_SHORE.z, 2, -1, 3.5], [11.58, WREN_SHORE.x, WREN_SHORE.z, 0, -1, 0.02],
]) };
const WREN_AFTERNOON = { id: 'wren-afternoon', land: 'ocean' as const, pace: 200, walkPose: 0, stops: stops([
  [13.95, WREN_SHORE.x, WREN_SHORE.z, 0, 1, 1.0], [15.0, WREN_SHORE.x + 1.6, WREN_SHORE.z + 0.4, 3, -1, 2.9], [17.95, WREN_SHORE.x, WREN_SHORE.z, 0, -1, 0.02],
]) };
/** The fleet finished: nothing to row out for. Wren sits, all day; the
 *  afternoon routine is given a stop it never reaches. */
const WREN_FINISHED = stops([[8.0, WREN_SHORE.x + 1.6, WREN_SHORE.z + 0.4, 3, -1, 10]]);
const WREN_NEVER = stops([[24.5, WREN_SHORE.x, WREN_SHORE.z, 0, 1, 0.01]]);

/** THE BAR'S STONE (`QUESTS` §8: skim a stone off the sandbar). The
 *  Common's stone has a twin on the bar, and this one skips. */
const BAR_STONE_HOME = (() => { const p = alongPath(SANDBAR, 0.24); return { x: p.x - p.az * 2, z: p.z + p.ax * 2 }; })();
things.register({ id: 'bar-stone', kind: 'carriable', land: 'ocean', home: BAR_STONE_HOME, name: 'THE STONE', skims: 3 });

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

  /* ---- THE SEALS, THE THING, AND TWO ON THE MOORINGS (Session 17) --- */
  const SEALS: [number, number][] = [0.44, 0.49, 0.54, 0.6].map((u, i) => {
    const p = alongPath(SANDBAR, u);
    const side = i % 2 ? 1 : -1;
    return [p.x - p.az * side * (3.2 + i * 0.6), p.z + p.ax * side * (3.2 + i * 0.6)];
  });
  const seals = SEALS.map(([x, z], i) => new Creature(ctx, `the-seals-${i}`, 'ocean', [sealTexture(1460 + i, 0), sealTexture(1470 + i, 1)], 2.4, 1.2, x, z));
  const sealState = { off: 0, look: 0 };
  const DEEP = { x: -300, z: -70 };
  const deep = new Creature(ctx, 'the-deep', 'ocean', [deepBackTexture(1480)], 22, 8.2, DEEP.x, DEEP.z);
  const moorFolk = [[-272, 152], [-286, 198]].map(([x, z], i) =>
    new Figure(ctx, { id: `the-moorings-${i}`, land: 'ocean', stops: stops([[9.0 + i * 0.3, x - 0.6, z + 0.4, 2, i ? -1 : 1, 2.0]]) }, i ? 2 : 0, { lift: 0.5 }));

  /* ---- THE ENCOUNTERS (Session 18, `THE-STRANGERS` C8, C9) ---------- */
  /* C9 · A GULL THAT WILL NOT MOVE OFF THE CREST, SO YOU GO ROUND. On
   * the bar's spine where it bends west, all day and all night, and it
   * is a barrier (`barriers.ts`) two units wide, which is the drawing
   * standing exactly there: it looks at the sea like every gull, turns
   * to you when you are close, opens its beak at you at arm's length,
   * and does not move. The crest is nineteen wide. You go round. */
  const GULL = { x: SANDBAR[3][0], z: SANDBAR[3][1] };
  const crestGull = new Creature(ctx, 'the-crest-gull', 'ocean', [2, 1, 3].map((p) => gullTexture(1490 + p, p as 1 | 2 | 3)), 1.9, 1.4, GULL.x, GULL.z);
  barriers.register({ id: 'the-crest-gull', x0: GULL.x - 1.1, z0: GULL.z - 0.8, x1: GULL.x + 1.1, z1: GULL.z + 0.8, half: 1.0, gaps: [] });
  const gullState = { cry: 0 };
  /* C8 · A LIGHT OUT ON THE WATER THAT IS NOT THE MARK. In Shelter
   * Cove, from nine at night until first light, thirty-five units off
   * the sand, drifting a little, and nothing anywhere says what is
   * under it. The mark is fifty units further out and rings. This one
   * does not. */
  const COVE_LIGHT = { x: -252, z: -165 };
  const coveLight = new Creature(ctx, 'the-cove-light', 'ocean', [lampGlowTexture(1495)], 3.2, 3.2, COVE_LIGHT.x, COVE_LIGHT.z);
  events.register({ id: 'the-cove-light', land: 'ocean', at: 21.0, hours: 7.6 });

  /* ---- THE VIKINGS (Session 19) ------------------------------------- */
  const longship = new Creature(ctx, 'the-longship', 'ocean',
    [longshipTexture(1600, 0), longshipTexture(1601, 1), longshipTexture(1602, 2)], 14, 7, BERTH.x, BERTH.z);
  const ship = { roarT: 0, next: 4 + r() * 6, seen: false };
  /* Where the ship is at an hour, and what it is doing. Pure. */
  const shipAt = (h: number): { x: number; z: number; pose: 0 | 1; face: -1 | 1 } => {
    const lerp = (a: { x: number; z: number }, b: { x: number; z: number }, u: number) =>
      ({ x: a.x + (b.x - a.x) * u, z: a.z + (b.z - a.z) * u });
    const start = alongPath(COURSE, 0.9);
    if (h >= SHIP.rowIn[0] && h < SHIP.rowIn[1]) {
      const u = (h - SHIP.rowIn[0]) / (SHIP.rowIn[1] - SHIP.rowIn[0]);
      return { ...lerp(OFFING, BERTH, u * u * (3 - 2 * u)), pose: 1, face: 1 };
    }
    if (h >= SHIP.out[0] && h < SHIP.out[1]) {
      const u = (h - SHIP.out[0]) / (SHIP.out[1] - SHIP.out[0]);
      return { ...lerp(BERTH, start, u), pose: 1, face: -1 };
    }
    if (h >= SHIP.race[0] && h < SHIP.race[1]) {
      const u = (h - SHIP.race[0]) / (SHIP.race[1] - SHIP.race[0]);
      const p = alongPath(COURSE, 0.9 + u * 2.6);
      return { x: p.x, z: p.z, pose: 1, face: p.ax >= 0 ? 1 : -1 };
    }
    if (h >= SHIP.back[0] && h < SHIP.back[1]) {
      const u = (h - SHIP.back[0]) / (SHIP.back[1] - SHIP.back[0]);
      const end = alongPath(COURSE, 0.9 + 2.6);
      return { ...lerp({ x: end.x, z: end.z }, BERTH, u), pose: 1, face: 1 };
    }
    return { x: BERTH.x, z: BERTH.z, pose: 0, face: 1 };
  };
  /* ---- WREN, THE SECOND MARK (Session 19) --------------------------- */
  const wrenMaps = { 0: wrenTexture(1610, 0), 2: wrenTexture(1611, 2), 3: wrenTexture(1612, 3) };
  const wren = new Figure(ctx, WREN_DAY, 2, { maps: wrenMaps, scale: 0.98 });
  const wrenPm = new Figure(ctx, WREN_AFTERNOON, 2, { maps: wrenMaps, scale: 0.98 });
  const punt = ctx.standee(wrenBoatTexture(1613), 5.6, 3.3, WREN_BOAT.x, WREN_BOAT.z, { rotY: 0.5 });
  const wrenRowing = new Creature(ctx, 'wren-rowing', 'ocean', [wrenBoatTexture(1614)], 5.6, 3.3, WREN_BOAT.x, WREN_BOAT.z);
  wrenRowing.hide();
  const secondMark = ctx.standee(bellBuoyTexture(1615), 2.8, 4.4, SECOND_MARK.x, SECOND_MARK.z);
  secondMark.visible = false;
  const secondMarkY = ctx.groundY(SECOND_MARK.x, SECOND_MARK.z);
  let wrenDoor: 'none' | 'mark' | 'finished' = 'none';
  /* ---- THE BAR'S STONE, AND ITS RINGS (Session 19) ------------------ */
  const barStone = things.get('bar-stone')!;
  barStone.def.hand = fistStoneTexture(1616);
  const stoneMesh = ctx.standee(fistStoneTexture(1616), 0.5, 0.5, barStone.x, barStone.z);
  barStone.mesh = stoneMesh;
  const rings = [0, 1, 2, 3].map((i) => {
    const m = ctx.decal(rippleDecal(1620 + i), 3, 3, BAR_STONE_HOME.x, BAR_STONE_HOME.z, 0, 0.7);
    m.visible = false;
    return { m, at: -1 };
  });
  /* THE FLEET, FOR A ROWBOAT (`QUESTS` §8: row into the fleet and
   * scatter it): a boat with the rowboat inside nine units bears away
   * — a jump along the course and a swerve off it — and the halyards
   * run. Reset when it has gone. */
  const veer = boats.map(() => ({ k: 0, side: 1 as -1 | 1, said: 0 }));

  return (dt: number, t: number, px: number, pz: number) => {
    /* THE REGATTA. Boats carry along the course and heel INTO the turn;
     * a standee cannot rotate to a heading, so the flip is the tack and
     * it happens where the course doubles back. From Session 17 the
     * RACE is at noon: three times the speed for an hour and a half,
     * and the heel goes with the wind. */
    /* THE FLEET FINISHED (Session 19, Wren's second door): the boats
     * lie at anchor off the second mark and do not race, ever again. */
    const finished = knowledge.has('door:the-fleet-finished');
    const race = !finished && events.progress('the-regatta') >= 0 ? 1 : 0;
    const wind = weather.state.wind;
    const fill = 1 + race * (1.6 + wind * 1.6);
    boats.forEach((b, i) => {
      const v = veer[i];
      if (finished) {
        const ax = SECOND_MARK.x - 9 - (i % 2) * 8 + Math.sin(i * 2.3) * 3;
        const az = SECOND_MARK.z + 6 + i * 5;
        b.m.position.set(ax, ctx.groundY(ax, az) + Math.sin(t * 0.66 + b.ph) * 0.13, az);
        b.m.rotation.z = Math.sin(t * 0.48 + b.ph) * 0.045;
        return;
      }
      // a rowboat in the fleet: she bears away, and keeps bearing away
      const near = rowboat.aboard ? Math.hypot(rowboat.x - b.m.position.x, rowboat.z - b.m.position.z) : 1e9;
      if (near < 9) {
        if (v.k < 0.05) {
          const p0 = alongPath(COURSE, b.t);
          v.side = ((rowboat.x - b.m.position.x) * -p0.az + (rowboat.z - b.m.position.z) * p0.ax) > 0 ? -1 : 1;
        }
        v.k = Math.min(1, v.k + dt * 2.2);
        b.t = (b.t + dt * 0.03) % 1;
        if (t - v.said > 3.5) { v.said = t; say('halyard'); }
      } else v.k = Math.max(0, v.k - dt * 0.35);
      b.t = (b.t + dt * b.v * fill) % 1;
      const p = alongPath(COURSE, b.t);
      const px2 = p.x + (-p.az) * v.side * v.k * 7;
      const pz2 = p.z + p.ax * v.side * v.k * 7;
      const y = ctx.groundY(px2, pz2);
      b.m.position.set(px2, y + Math.sin(t * 0.7 + b.ph) * 0.14, pz2);
      // she pitches to the swell and rolls a little as she is steered
      b.m.rotation.z = Math.sin(t * 0.62 + b.ph) * 0.05 + (p.ax > 0 ? 0.03 : -0.03) * (1 + race * 2.5 + Math.max(0, wind - 0.5) * 3) + v.k * 0.12 * v.side;
      const s = Math.abs(b.m.scale.x);
      b.m.scale.x = p.az > 0 ? -s : s;
    });

    /* ---- THE VIKINGS (Session 19) ------------------------------------- */
    {
      const hh = clock.hour;
      const at = shipAt(hh);
      const beached = at.pose === 0;
      ship.roarT = Math.max(0, ship.roarT - dt);
      // the horn is answered a beat and a half after it is blown
      if (horn.pending) { horn.pending = false; horn.answerAt = t + 1.4; }
      if (horn.answerAt > 0 && t >= horn.answerAt) {
        horn.answerAt = -1;
        ship.roarT = 1.6;
        horn.liftGulls = true;
        say('viking-roar');
      }
      /* THEY ROAR AT THE SHORE: at anybody on the sand within earshot
       * of the berth, by day, every ten seconds or so — and never at
       * anybody on the water, because that is a different matter. */
      const onSand = px > -250 && hh >= 7 && hh < 20;
      const d = Math.hypot(px - BERTH.x, pz - BERTH.z);
      if (beached && onSand && d < 46) {
        ship.next -= dt;
        if (ship.next <= 0) {
          ship.next = 9 + Math.abs(Math.sin(t * 3.1)) * 6;
          ship.roarT = 1.5;
          say('viking-roar');
        }
      } else ship.next = Math.min(ship.next, 3);
      const pose = beached ? (ship.roarT > 0 ? 2 : 0) : 1;
      // the ship is a THING: nothing gives it a position off the ocean's page
      const sx = Math.min(-252.5, at.x);
      const lurch = ship.roarT > 0 ? Math.sin(t * 22) * 0.03 : 0;
      longship.set(pose, sx, at.z, at.face, Math.sin(t * 0.6) * (beached ? 0.05 : 0.12));
      longship.mesh.rotation.z = Math.sin(t * 0.55) * (beached ? 0.012 : 0.035) + lurch;
    }

    /* ---- WREN, THE SECOND MARK, THE FINISH (Session 19) --------------- */
    {
      const door = knowledge.has('door:the-fleet-finished') ? 'finished' : knowledge.has('door:the-second-mark') ? 'mark' : 'none';
      if (door !== wrenDoor) {
        wrenDoor = door;
        secondMark.visible = door !== 'none';
        if (door === 'finished') {
          WREN_DAY.stops.splice(0, WREN_DAY.stops.length, ...WREN_FINISHED);
          WREN_AFTERNOON.stops.splice(0, WREN_AFTERNOON.stops.length, ...WREN_NEVER);
        }
      }
      if (secondMark.visible) {
        const sw = Math.sin(t * 0.7 + 1.3) + 0.4 * Math.sin(t * 1.5);
        secondMark.position.y = secondMarkY + sw * 0.24;
        secondMark.rotation.z = sw * 0.09;
      }
      const gone = platform.land === 'ocean';
      wren.tick(clock.hour, gone);
      wrenPm.tick(clock.hour, gone);
      const rowing = events.progress('wren-rows');
      const evening = door === 'none' || door === 'finished' ? -1 : events.progress('wren-rows-evening');
      let out: { x: number; z: number; face: -1 | 1 } | null = null;
      if (rowing >= 0 && door !== 'finished' && !gone) {
        // out for the first sixth, at the mark for the middle, back for the last
        const u = rowing < 0.174 ? rowing / 0.174 : rowing < 0.826 ? 1 : 1 - (rowing - 0.826) / 0.174;
        const k = u * u * (3 - 2 * u);
        out = { x: WREN_BOAT.x + (WREN_AT_MARK.x - WREN_BOAT.x) * k, z: WREN_BOAT.z + (WREN_AT_MARK.z - WREN_BOAT.z) * k, face: rowing < 0.5 ? -1 : 1 };
        if (rowing < 0.174 || rowing >= 0.826) {
          if (Math.floor(t * 0.8) !== Math.floor((t - dt) * 0.8) && Math.hypot(px - out.x, pz - out.z) < 30) say('oar');
        }
      } else if (evening >= 0 && !gone) {
        const u = evening < 0.5 ? evening * 2 : 2 - evening * 2;
        const k = u * u * (3 - 2 * u);
        out = { x: WREN_BOAT.x + (SECOND_MARK.x + 4 - WREN_BOAT.x) * k, z: WREN_BOAT.z + (SECOND_MARK.z + 3 - WREN_BOAT.z) * k, face: evening < 0.5 ? -1 : 1 };
      }
      if (out) {
        wrenRowing.set(0, out.x, out.z, out.face, Math.sin(t * 1.2) * 0.08);
        punt.visible = false;
      } else {
        wrenRowing.hide();
        punt.visible = true;
      }
      // Wren rings the bell at noon: the mark nods harder while the punt is beside it
      if (rowing >= 0.174 && rowing < 0.22) bell.rotation.z += Math.sin(t * 9) * 0.06;
    }

    /* ---- THE BAR'S STONE (Session 19) --------------------------------- */
    {
      const fp = things.flyPos(barStone);
      if (fp) { stoneMesh.visible = true; stoneMesh.position.set(fp.x, fp.y, fp.z); }
      else if (barStone.state === 'ground') { stoneMesh.visible = true; stoneMesh.position.set(barStone.x, ctx.groundY(barStone.x, barStone.z), barStone.z); }
      else stoneMesh.visible = false;
      // the rings: one per splash the walker's throw made on this water
      for (let i = things.splashes.length - 1; i >= 0; i--) {
        const s = things.splashes[i];
        if (s.id !== 'bar-stone') continue;
        things.splashes.splice(i, 1);
        const ring = rings.reduce((a, b) => (a.at < b.at ? a : b));
        ring.at = t;
        ring.m.position.set(s.x, ctx.groundY(s.x, s.z) + 0.06, s.z);
      }
      for (const ring of rings) {
        const age = ring.at < 0 ? 9 : t - ring.at;
        const u = Math.min(1, age / 1.8);
        ring.m.visible = u < 1;
        const sc = 0.5 + u * 2.2;
        ring.m.scale.set(sc, sc, 1);
        (ring.m.material as THREE.MeshBasicMaterial).opacity = (1 - u) * 0.7;
      }
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

    /* ---- THE SEALS, THE THING, THE MOORINGS (Session 17) ------------ */
    const h = clock.hour;
    {
      /* THE DAY AFTER THE DEEP, THE SEALS DO NOT HAUL OUT (Session 19,
       * `THE-FUN-PASS` §10: a consequence that is not an explanation).
       * The thing surfaces every third dusk; the morning after it, the
       * bar is empty of them, and nothing anywhere says why. */
      const out = events.progress('the-seals-haul-out') >= 0 && !deepYesterday(clock.day);
      let near = 1e9;
      for (const [x, z] of SEALS) near = Math.min(near, Math.hypot(px - x, pz - z));
      sealState.off = Math.max(0, sealState.off - dt);
      if (out && sealState.off <= 0 && near < 9) { sealState.off = 45; say('seal-bark'); }
      if (out && sealState.off > 0 && sealState.off < 5 && near < 20) sealState.off = 45;
      seals.forEach((c, i) => {
        if (!out) { c.hide(); return; }
        const [x, z] = SEALS[i];
        if (sealState.off > 0) {
          // into the water: a slither seaward over a second, and gone
          const u = Math.min(1, (45 - sealState.off) / 1.1);
          if (u >= 1) { c.hide(); return; }
          const p = alongPath(SANDBAR, 0.5);
          c.set(1, x - p.az * (i % 2 ? 1 : -1) * 7 * u, z + p.ax * (i % 2 ? 1 : -1) * 7 * u, i % 2 ? -1 : 1, -0.6 * u, 1 - u * 0.6);
        } else c.set(near < 16 ? 1 : 0, x, z, i % 2 ? -1 : 1, 0);
      });
    }
    {
      const k = deepDay(clock.day) ? events.progress('the-deep') : -1;
      if (k < 0) deep.hide();
      else {
        const e = Math.sin(k * Math.PI);
        deep.set(0, DEEP.x + k * 6, DEEP.z, 1, -3.2 + e * 3.6, Math.min(1, e * 1.8));
      }
    }
    for (const f of moorFolk) f.tick(h);

    /* ---- THE ENCOUNTERS (Session 18) --------------------------------- */
    {
      const d = Math.hypot(px - GULL.x, pz - GULL.z);
      gullState.cry = Math.max(0, gullState.cry - dt);
      if (d < 3.6 && gullState.cry <= 0) { gullState.cry = 9; say('gull-cry'); }
      crestGull.set(d < 3.6 ? 2 : d < 9 ? 1 : 0, GULL.x, GULL.z, px < GULL.x ? -1 : 1, 0.05);
    }
    {
      const on = events.progress('the-cove-light');
      if (on < 0) coveLight.hide();
      else coveLight.set(0, COVE_LIGHT.x + Math.sin(t * 0.05) * 5, COVE_LIGHT.z + Math.cos(t * 0.037) * 3, 1, 0.9, 0.55 + Math.sin(t * 0.9) * 0.2);
    }
  };
};

export const OCEAN_POIS: WorldPOI[] = [
  {
    x: -262, z: 92, radius: 10, label: 'THE SHALLOWS',
    prompt: 'WADE OUT',
    note: {
      title: 'the shallows',
      body: 'you can wade to about the knee. past that the blue gets serious, and nobody on this coast has ever learned to swim, on the grounds that the sea is not somewhere a person goes. what there is instead is a bar of dry sand, going out.',
      learns: ['name:ocean'],
    },
  },
  {
    x: -272, z: 58, radius: 12, label: 'THE SANDBAR',
    prompt: 'FEEL THE GROUND CHANGE',
    note: {
      title: 'the sandbar',
      body: 'a strip of this seabed came up dry and nobody on the coast can tell you why. the sea has been trying to take it back ever since and has got nowhere. it is dry, it is a hundred and eighty paces long, and it goes out.',
    },
  },
  {
    x: -299, z: 16, radius: 12, label: 'THE LONG WATER',
    prompt: 'STAND HERE A MOMENT',
    note: {
      title: 'the long water',
      body: 'sixty paces from anything, and then nothing at all between here and the fog. no boat, no bird, no bar, no sound. in a world where something is always going on just out of sight, that is the loudest thing in it.',
    },
  },
  {
    x: -300, z: -8, radius: 13, label: 'THE MARK',
    prompt: 'WATCH THEM ROUND IT',
    note: {
      title: 'the mark',
      body: 'they have been sailing this triangle since before anybody was counting. nobody has ever won, and the bell keeps the time anyway, which is roughly what a race is.',
    },
  },
  {
    x: -277, z: -32, radius: 12, label: 'THE SEAWARD FACE',
    prompt: 'LOOK UP',
    note: {
      title: 'the seaward face',
      body: 'from the sand you are either on the point or behind it. from here you get the whole face at once: eleven paces of raw cliff going straight down, with one thin line cut across it by somebody who wanted to be up there.',
    },
  },
  /* ---- SESSION 19: THE NEW CAST, WEST ------------------------------ */
  {
    /* THE HOLDFAST's berth, read from the bar's near end or the bight:
     * the longship is a thing you look at, and the note is the whole of
     * what anybody will ever tell you about them. */
    x: BERTH.x + 6, z: BERTH.z + 4, radius: 13, label: 'THE LONGSHIP',
    prompt: 'COUNT THE SHIELDS',
    note: {
      title: 'the longship',
      body: 'a longship, beached at the foot of the point, with seven shields along her side and four men in her who have been waiting for a wind for four hundred years. every day at noon they row out and go round the mark with the others, because it is the only thing to do. they roar at the sand. they have never once stood on it.',
    },
  },
  {
    /* WREN'S PUNT — where Wren's wait is legible and where both doors
     * are (`THE-FUN-PASS` §6, `THE-WAITS` §8). With the bar walked to
     * its end it is a card with two doors, offered once. */
    x: WREN_BOAT.x, z: WREN_BOAT.z - 1.5, radius: 6, label: 'THE PUNT',
    get prompt() {
      const done = knowledge.has('door:the-second-mark') || knowledge.has('door:the-fleet-finished');
      if (!done && knowledge.has('route:the-bar')) return 'TELL WREN WHERE THE BAR ENDS';
      return 'LOOK IN THE PUNT';
    },
    get choice() {
      if (!knowledge.has('route:the-bar')) return undefined;
      return {
        body: 'you have walked the bar to its end, which is the one thing out here that is not water, and wren has never asked what is at the end of it. two marks make a line, and a line has an end, and the fleet has been calling this a race since before anybody was counting. wren could set a second mark. or set it, and call the finish.',
        options: [
          { label: 'SET THE SECOND MARK', door: 'door:the-second-mark' },
          { label: 'SET IT, AND CALL THE FINISH', door: 'door:the-fleet-finished' },
        ],
      };
    },
    note: {
      title: 'the punt',
      body: () => {
        if (knowledge.has('door:the-fleet-finished')) return 'a punt drawn up on the bar with one oar in it, and the fleet at anchor off the far end of the bar by the second mark, which is where the line ended. nobody won. wren sits by the punt at the hours the bell used to go, and the bell does not go, and the fleet is all in one place now, all day, which was the point, and is not the same.';
        if (knowledge.has('door:the-second-mark')) return 'a punt drawn up on the bar with one oar in it, and a coil of the bell\'s rope, and a tin of the mark\'s paint. there are two marks now. wren rows out to the far one in the evening and rings nothing, because it has no bell, and rows back. the fleet goes round the first one, the way it always has.';
        return 'a punt drawn up on the bar with one oar in it, a coil of the bell\'s rope, and a tin of the mark\'s paint. somebody rows out to the mark at noon and rings the bell and rows back, and has done for as long as the fleet has gone round it, and everything wren says is said twice, in case.';
      },
    },
  } as unknown as WorldPOI,
  {
    /* THE BAR'S STONE, where it lies. */
    get x() { return things.get('bar-stone')!.x; },
    get z() { return things.get('bar-stone')!.z; },
    get enabled() { return things.get('bar-stone')!.state === 'ground'; },
    set enabled(_v: boolean) { /* the registry decides */ },
    radius: 2.6,
    prompt: 'PICK UP THE STONE',
    touch: () => { things.pickUp('bar-stone'); },
  } as unknown as WorldPOI,
  {
    x: SECOND_MARK.x, z: SECOND_MARK.z, radius: 9, label: 'THE SECOND MARK',
    get enabled() { return knowledge.has('door:the-second-mark') || knowledge.has('door:the-fleet-finished'); },
    set enabled(_v: boolean) { /* the door decides */ },
  } as unknown as WorldPOI,
];
