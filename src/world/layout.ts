import type { StepZone } from '../core/Audio';
import { WASH } from '../engine/palette';

/**
 * THE MAP — one continuous sheet, twelve lands.
 *
 * The whole world is a single enormous page lying on a desk: the sea
 * runs off the torn west edge, and past every margin there is the next
 * sheet down and then wood. Regions are axis-aligned rects that tile
 * the sheet exactly; their PAINTED borders are ragged (terrain.ts
 * churns them), so the rectangles are the truth the map and the audio
 * agree on, never something the eye is shown.
 *
 * Geography reads like geography: the ocean west, a beach the whole
 * length of the coast, the old kingdom walled up in the north-west
 * under its castle, the modern grid of city and office park diagonally
 * opposite in the south-east — and the meadow, where you wake up, dead
 * centre with a road to everywhere.
 */

export type Rect = { minX: number; maxX: number; minZ: number; maxZ: number };

export const WORLD: Rect = { minX: -380, maxX: 380, minZ: -280, maxZ: 280 };

export type RegionId =
  | 'ocean' | 'beach' | 'castle' | 'kingdom' | 'meadow' | 'neighborhood'
  | 'forest' | 'canyon' | 'downs' | 'desert' | 'city' | 'office';

export type RegionSpec = {
  id: RegionId;
  /** Name on the card and the map. */
  name: string;
  /** Small line over the name when you cross the border. */
  kicker: string;
  rect: Rect;
  /** The wash this land is painted with. */
  wash: string;
  /** What a step sounds like here (water/roads override locally). */
  step: StepZone;
};

export const REGION_SPECS: RegionSpec[] = [
  // step 'sand', not 'wet': the ONLY places a walker's foot lands in
  // THE WIDE BLUE are the sandbar's dry crest and the shallows, and the
  // shallows are already overridden to 'wet' by the water underfoot.
  // Crossing onto the bar therefore changes the step timbre — which is
  // how a player learns the bar is paper and not sea.
  { id: 'ocean', name: 'THE WIDE BLUE', kicker: 'open water', wash: WASH.seaShallow, step: 'sand',
    rect: { minX: -380, maxX: -250, minZ: -280, maxZ: 280 } },
  { id: 'beach', name: 'LONGSHORE', kicker: 'the coast', wash: WASH.sand, step: 'sand',
    rect: { minX: -250, maxX: -150, minZ: -280, maxZ: 280 } },
  { id: 'castle', name: 'CASTLE GREYWEATHER', kicker: 'the high seat', wash: WASH.castle, step: 'stone',
    rect: { minX: -150, maxX: 60, minZ: -280, maxZ: -160 } },
  { id: 'kingdom', name: 'THE KINGDOM OF BRIM', kicker: 'the walled town', wash: WASH.kingdom, step: 'stone',
    rect: { minX: -150, maxX: 60, minZ: -160, maxZ: -10 } },
  { id: 'meadow', name: 'THE COMMON', kicker: 'where you woke', wash: WASH.meadow, step: 'grass',
    rect: { minX: -150, maxX: 60, minZ: -10, maxZ: 120 } },
  { id: 'neighborhood', name: 'MAPLE COURT', kicker: 'the neighborhood', wash: WASH.suburb, step: 'grass',
    rect: { minX: -150, maxX: 60, minZ: 120, maxZ: 280 } },
  { id: 'forest', name: 'THE PENWOOD', kicker: 'under the pines', wash: WASH.forest, step: 'grass',
    rect: { minX: 60, maxX: 230, minZ: -280, maxZ: -100 } },
  { id: 'canyon', name: 'SPLITROCK CANYON', kicker: 'the deep cut', wash: WASH.canyon, step: 'stone',
    rect: { minX: 230, maxX: 380, minZ: -280, maxZ: -100 } },
  { id: 'downs', name: 'THE HARROW DOWNS', kicker: 'farm country', wash: WASH.downs, step: 'grass',
    rect: { minX: 60, maxX: 230, minZ: -100, maxZ: 130 } },
  { id: 'desert', name: 'THE BLEACH FLATS', kicker: 'the desert', wash: WASH.desert, step: 'sand',
    rect: { minX: 230, maxX: 380, minZ: -100, maxZ: 130 } },
  { id: 'city', name: 'GREYLINE CITY', kicker: 'downtown', wash: WASH.city, step: 'stone',
    rect: { minX: 60, maxX: 230, minZ: 130, maxZ: 280 } },
  { id: 'office', name: 'THE CUBICLE MILE', kicker: 'the office park', wash: WASH.office, step: 'gloss',
    rect: { minX: 230, maxX: 380, minZ: 130, maxZ: 280 } },
];

export const SPEC_BY_ID = Object.fromEntries(REGION_SPECS.map((s) => [s.id, s])) as
  Record<RegionId, RegionSpec>;

export function regionAt(x: number, z: number): RegionSpec {
  for (const s of REGION_SPECS) {
    const r = s.rect;
    if (x >= r.minX && x < r.maxX && z >= r.minZ && z < r.maxZ) return s;
  }
  // off the sheet entirely — call it the sea
  return SPEC_BY_ID.ocean;
}

export const SPAWN = { x: -45, z: 58 };

/* ------------------------------------------------------------------ *
 * THE COAST. Lives here rather than in terrain.ts because the height
 * field, the wash field, the collision queries and the map all need it
 * and none of them may depend on each other.
 * ------------------------------------------------------------------ */

const csmooth = (a: number, b: number, x: number) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const cbump = (u: number) => Math.exp(-u * u);

/**
 * THE COASTLINE: where the sand gives up and the sea begins.
 *
 * Session 5 gave it a shape, and the shape is the sheet's, not a
 * landscape's. A coast in this world is not where a hill happens to
 * end — it is where the page's WET MARGIN cockled and tore. The wash
 * ran off the west edge and took the paper with it in two long bites,
 * and between them one tongue of fibre held. So the line reads:
 *
 *   THE SOUTH BIGHT   z −34 .. +26   the sea eats eighteen units inland
 *                                    and the surf runs a long way up
 *   THE HOLDFAST      z −124 .. −32  the tongue that held: the coast
 *                                    stands out to −266 and the ground
 *                                    behind it stands ten units up
 *   SHELTER COVE      z −172 .. −116 the bite behind the point, where
 *                                    the water is never rough
 *
 * Everything else on this coast is authored against those three facts.
 */
export function coastX(z: number): number {
  const base = -250 + Math.sin(z * 0.018) * 10 + Math.sin(z * 0.043 + 1.7) * 6;
  const bight = 18 * cbump((z + 6) / 26);
  const cove = 34 * cbump((z + 142) / 26);
  return base + bight + cove;
}

/**
 * THE SANDBAR — the dry streak where the wash never took.
 *
 * THE WIDE BLUE's whole problem is that open water is a place you can
 * look at and not a place you can be, and a land you cannot walk is not
 * a land. The answer is in the metaphor rather than in a boat: when a
 * wash runs over a sheet it leaves misses, and this one left a long
 * curved miss running out from the shore below the boardwalk. It is
 * paper, so it is dry, so you can walk it — a hundred and eighty units
 * out into the sea, past the surf, to where the coast reads as a drawn
 * coastline and the regatta rounds its mark close enough to hear.
 *
 * The spine is authored, never generated, and it is a ROUTE and not a
 * dead end: it leaves the beach below the boardwalk, bends west across
 * the shallows to the loneliest water on the page, turns north past the
 * regatta's mark, and comes back ashore in the bight at the foot of the
 * cliff path. Two ends, both on the coast, and the sea in between. That
 * is what makes it a road rather than a pier.
 */
export const SANDBAR: [number, number][] = [
  [-238, 92], [-256, 76], [-272, 58], [-288, 36], [-298, 12],
  [-300, -12], [-291, -32], [-274, -34], [-258, -24],
];

/** Distance from the sandbar's spine, in world units. */
export function barDist(x: number, z: number): number {
  let best = 1e9;
  for (let i = 0; i < SANDBAR.length - 1; i++) {
    const [ax, az] = SANDBAR[i];
    const [bx, bz] = SANDBAR[i + 1];
    const dx = bx - ax;
    const dz = bz - az;
    const len2 = dx * dx + dz * dz || 1;
    const u = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / len2));
    const d = Math.hypot(x - (ax + dx * u), z - (az + dz * u));
    if (d < best) best = d;
  }
  return best;
}

/**
 * Waterness of the open sea at (x, z): 0 dry .. 1 open water. ONE
 * authority — terrain.ts paints from it, the collision reads what it
 * painted, and `tools/check-terrain.mjs` can walk the bar off-screen
 * without a canvas. The bar is subtracted here rather than added
 * anywhere else, because a bar is not a thing on the sea: it is a
 * place the sea is not.
 */
export function seaAt(x: number, z: number): number {
  const d = coastX(z) - x;
  if (d <= 0) return 0;
  /* Twenty-four units, not forty-two. Round 1 of the art-director gate
   * called this coast a dune sea, and half of why was here: over a
   * forty-two-unit ramp the sea arrives as a GRADIENT and a coast has
   * no line at all — the surf band lands twelve units wide and the
   * whole shore reads as an airbrushed edge between two beiges. A
   * shoreline is a line. Twenty-four gives the shader's foam a
   * seven-unit band to break in and still leaves thirteen units of
   * wadeable shallow before the page refuses. */
  const open = csmooth(0, 24, d);
  const bar = 1 - csmooth(3, 14, barDist(x, z));
  return open * (1 - 0.94 * bar);
}

/* ------------------------------------------------------------------ *
 * ROADS. One connected web, authored once; the terrain paints them,
 * the map draws them, bridges sit where they cross the river.
 * ------------------------------------------------------------------ */

export type Road = {
  pts: [number, number][];
  width: number;
  /**
   * HOW HARD THIS ROAD CARRIES (Session 6). 1 is the line; the side
   * roads are gentler and one of them is barely a road at all.
   *
   * WORLD-SYSTEMS §3: "a pen likes following a line it already drew."
   * The road web has been decoration since Session 1 — nine authored
   * roads the terrain paints and the map draws and the walker crosses
   * without noticing. A road that CARRIES turns the whole web into
   * infrastructure at the cost of two numbers per road, and it makes
   * the crossroads a decision instead of a picture of one.
   *
   * The weights are not uniform, and STORY.md §4 is why. The king's
   * road leaves Greyweather's gate, comes down through Brim, crosses
   * the Common, runs up Maple Court as MAIN STREET and ends, as the
   * COMMUTER SPUR, in a car park: twelve names, one road, castle to car
   * park, and Act III's reveal is that it was surveyed as a railway.
   * The player walks that line for fifteen hours before anybody tells
   * them what it is, so it has to FEEL like following something that
   * was laid down on purpose — and the only way this session can say
   * that without saying it is to make those three roads carry hardest
   * and let the others be tracks.
   */
  carry: number;
};

export const ROADS: Road[] = [
  // the king's road: castle gate → kingdom square → the meadow → Maple Court
  // Session 4: the road now climbs the castle ramp and goes through the
  // barbican, because the avenue IS the way up the ridge and a bare
  // pale slope read as nothing. Terrain and map pick it up for free.
  // THE LINE, first of three: castle gate to the far side of Maple Court.
  { width: 5, carry: 1, pts: [[-45, -218], [-45, -206], [-45, -195], [-45, -120], [-48, -60], [-45, -15], [-45, 58], [-42, 130], [-45, 200], [-45, 262]] },
  // the coast road: meadow west over the dune line to the boardwalk
  { width: 4, carry: 0.5, pts: [[-45, 58], [-110, 62], [-165, 60], [-205, 58], [-219, 58]] },
  // the east road: meadow → the downs → bridge → desert edge
  { width: 5, carry: 0.55, pts: [[-45, 58], [10, 50], [60, 46], [110, 45], [160, 22], [225, 8], [290, 12], [345, 18]] },
  // the mill lane: east road south through the downs into the city
  { width: 4, carry: 0.5, pts: [[145, 28], [148, 90], [150, 150], [148, 205], [150, 262]] },
  // main street: neighborhood → the river bridge → downtown
  // THE LINE, second: the same road under a different name.
  { width: 4.5, carry: 1, pts: [[-45, 200], [-8, 202], [40, 198], [90, 200], [148, 205]] },
  // commuter spur: city → office park
  // THE LINE, third and last: and it ends in a car park.
  { width: 4.5, carry: 1, pts: [[148, 205], [210, 208], [268, 205], [330, 202]] },
  // the forest track: kingdom east gate into the Penwood
  { width: 3.2, carry: 0.34, pts: [[55, -110], [95, -130], [130, -160], [150, -195], [160, -230]] },
  // the market lane: Brim Square east to the Wood Gate (Session 3)
  { width: 3.4, carry: 0.42, pts: [[-40, -86], [-12, -96], [18, -104], [42, -109], [55, -110]] },
  // canyon trail: downs NE corner up the canyon mouth
  // barely a road: a trail carries you the way a trail does, which is
  // hardly at all
  { width: 3, carry: 0.3, pts: [[225, 8], [255, -40], [280, -85], [300, -130], [305, -175]] },
];

/* ------------------------------------------------------------------ *
 * A ROAD THAT CARRIES (Session 6).
 *
 * Everything the walker needs to know about the road under their feet,
 * answered analytically from the authored polylines rather than from
 * the painted mask. The mask is a boolean at one-unit texels and it
 * cannot say which WAY the road runs, which is the half that matters:
 * a road carries you ALONG itself, and along has a direction.
 *
 * THE ONE RULE THIS HAS TO OBEY, and it is the hardest thing in the
 * session to get right: **it has to be FELT, not fought.** If a player
 * ever notices they are being steered it is wrong, and if they walk off
 * the road and the game tugs them back it is very wrong. So:
 *
 *   · the carry never pulls SIDEWAYS. It rotates the direction you are
 *     already going toward the direction the road goes, and it never
 *     once moves you toward the centreline. Walking off a road is
 *     therefore free, always, and stepping across one is free too;
 *   · it is gated on ALIGNMENT. Cross the king's road at right angles
 *     and there is no carry at all — the gate opens over about thirty
 *     degrees, so what it can do is tidy a walk that was already down
 *     the road, and what it cannot do is turn a walk that was not;
 *   · and it dies at the road's own painted edge, so the thing that
 *     carries you is the thing you can see.
 * ------------------------------------------------------------------ */

export type RoadCarry = {
  /** 0 off the road .. 1 dead centre of the line. */
  k: number;
  /** Unit tangent, pointing the way the polyline was authored. */
  tx: number;
  tz: number;
};

const NO_CARRY: RoadCarry = { k: 0, tx: 0, tz: 0 };

/**
 * How much the road at (x, z) carries, and which way it runs.
 *
 * The band is the painted road's own width plus a unit and a half of
 * shoulder, and the falloff starts at just under half of it: full carry
 * down the middle of the line, nothing at all off the edge of the
 * drawing. A road you can see is a road that carries, and there is no
 * invisible corridor either side of it.
 */
export function roadCarryAt(x: number, z: number): RoadCarry {
  let bestK = 0;
  let bestTx = 0;
  let bestTz = 0;
  for (const road of ROADS) {
    /* The paint plus a shoulder. Round 2 measured the first version and
     * found the band was the problem as much as the strength was: at a
     * run, four units of half-width is under a second of walking, so a
     * player angling onto a road left it again before the carry could
     * do anything at all. A road is wider than its metalling — the
     * verge is part of the road — so the carry is FULL over the paint
     * and lets go across the four units of shoulder either side. */
    const band = road.width * 0.5 + 4.2;
    for (let i = 0; i < road.pts.length - 1; i++) {
      const [ax, az] = road.pts[i];
      const [bx, bz] = road.pts[i + 1];
      const dx = bx - ax;
      const dz = bz - az;
      const len2 = dx * dx + dz * dz || 1;
      const u = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / len2));
      const px = ax + dx * u;
      const pz = az + dz * u;
      const d = Math.hypot(x - px, z - pz);
      if (d > band) continue;
      const k = road.carry * (1 - csmooth(road.width * 0.5, band, d));
      if (k > bestK) {
        bestK = k;
        const l = Math.hypot(dx, dz) || 1;
        bestTx = dx / l;
        bestTz = dz / l;
      }
    }
  }
  return bestK > 0 ? { k: bestK, tx: bestTx, tz: bestTz } : NO_CARRY;
}

/** The widest band any road carries over — the proof in
 *  tools/check-terrain.mjs walks this to show the carry is bounded. */
export const ROAD_BAND_MAX = Math.max(...ROADS.map((r) => r.width * 0.5 + 4.2));

/* ------------------------------------------------------------------ *
 * THE RIVER INK. Rises in the canyon, crosses the whole sheet, meets
 * the sea south of the boardwalk. Two authored bridge points sit
 * exactly on road crossings; terrain paints the water around them.
 * ------------------------------------------------------------------ */

export const RIVER: [number, number][] = [
  [318, -108], [285, -70], [250, -38], [205, -12], [168, 8], [138, 26],
  [110, 45], [82, 72], [52, 100], [18, 128], [-22, 158], [-62, 178],
  [-108, 192], [-150, 200], [-200, 210], [-260, 222], [-330, 232],
];
export const RIVER_WIDTH = 9;

/** Where a road crosses the river: the water parts, a plank bridge spans. */
export const BRIDGES: { x: number; z: number; angle: number }[] = [
  { x: 110, z: 45, angle: 0.75 },    // the east road bridge
  { x: -45, z: 170, angle: 1.45 },   // the king's road bridge
  { x: -200, z: 210, angle: 1.35 },  // the boardwalk footbridge on the shore
];

/**
 * DECKED GROUND — where the world is planks. The road's three bridges
 * are one kind; LONGSHORE's boardwalk is the other, and it is the
 * reason the boardwalk knocks hollow underfoot and the reason it can
 * carry a walker out past the shoreline onto its own jetty head.
 * `Terrain.onPlanks` reads both.
 */
export const PLANKS: { x: number; z: number; r: number }[] = [
  // THE PROMENADE, running NORTH along the back of the beach. The
  // camera only ever looks north, so a boardwalk laid east–west is a
  // handrail across the middle of the frame and nothing else; laid
  // north it is a thing you walk ALONG, receding, with the sea on your
  // left and the dune on your right. Round 1 of the gate laid it the
  // wrong way and the arrival shot was two grey bars. It leans WEST as
  // it goes north, following the bight in, so the water stays in the
  // left of the frame the whole way up.
  { x: -228, z: 92, r: 9 },
  { x: -226, z: 76, r: 9 },
  { x: -224, z: 58, r: 9 },
  { x: -222, z: 42, r: 9 },
  { x: -220, z: 26, r: 9 },
  { x: -218, z: 12, r: 9 },
  // and the stub the coast road ends on: planks out west over the first
  // of the water, and then the sea
  { x: -236, z: 57, r: 8 },
  { x: -248, z: 55, r: 8 },
  { x: -257, z: 54, r: 7 },
];

/** Small still waters, painted as soft blobs. */
export const PONDS: { x: number; z: number; r: number }[] = [
  { x: 150, z: -195, r: 12 },  // the forest tarn
  { x: 305, z: 55, r: 10 },    // the oasis
  { x: -100, z: -215, r: 8 },  // the castle moat pool
];

/* ------------------------------------------------------------------ *
 * WHERE THE WATER IS — and, from Session 6, where an oar has anything
 * to pull against.
 *
 * `waterFieldAt` is what terrain.ts paints into the wash field's alpha
 * channel and what the walker then collides with. It moved here for the
 * same reason `seaAt` did in Session 5: the height field, the wash
 * field, the collision queries and `tools/check-terrain.mjs` all need
 * it and none of them may depend on each other. The numbers the proof
 * walks off-screen are now the numbers the game floats on.
 * ------------------------------------------------------------------ */

const RIVER_SEGS: [[number, number], [number, number]][] = [];
for (let i = 0; i < RIVER.length - 1; i++) RIVER_SEGS.push([RIVER[i], RIVER[i + 1]]);

function segDist(px: number, pz: number, a: [number, number], b: [number, number]): number {
  const dx = b[0] - a[0];
  const dz = b[1] - a[1];
  const len2 = dx * dx + dz * dz || 1;
  const t = Math.max(0, Math.min(1, ((px - a[0]) * dx + (pz - a[1]) * dz) / len2));
  return Math.hypot(px - (a[0] + dx * t), pz - (a[1] + dz * t));
}

/** Waterness of the RIVER alone at (x, z): 0 dry .. 0.85 mid-stream.
 *  Its width swells from source to mouth, which is why the boat gets
 *  more room the further down it goes. */
export function riverAt(x: number, z: number): number {
  let best = 1e9;
  let bestT = 0;
  for (let i = 0; i < RIVER_SEGS.length; i++) {
    const d = segDist(x, z, RIVER_SEGS[i][0], RIVER_SEGS[i][1]);
    if (d < best) {
      best = d;
      bestT = i / RIVER_SEGS.length;
    }
  }
  const halfW = (RIVER_WIDTH * (0.55 + bestT * 0.65)) / 2;
  if (best >= halfW + 4) return 0;
  return (1 - csmooth(halfW * 0.55, halfW + 3, best)) * 0.85;
}

/** Waterness of the still waters — the tarn, the oasis, the moat. */
export function pondAt(x: number, z: number): number {
  let w = 0;
  for (const p of PONDS) {
    const d = Math.hypot(x - p.x, z - p.z);
    if (d < p.r + 4) w = Math.max(w, (1 - csmooth(p.r * 0.45, p.r + 3, d)) * 0.7);
  }
  return w;
}

/** Everything blue on the sheet, in one number. 0 dry .. 1 open sea. */
export function waterFieldAt(x: number, z: number): number {
  const w = Math.max(seaAt(x, z), riverAt(x, z), pondAt(x, z));
  return w < 0 ? 0 : w > 1 ? 1 : w;
}

/* ------------------------------------------------------------------ *
 * THE ROWBOAT'S GROUND.
 *
 * WORLD-SYSTEMS §4: every mount is fast on its own ground and refuses
 * every other ground. The rowboat's ground is WATER — and water is the
 * one thing on this sheet that has only ever said no. The river crosses
 * the entire page and is a wall along its whole length except at three
 * bridges. Under oar it is a road, and it is the only road in the world
 * that runs east–west across every land at once.
 *
 * AND WHERE THE BOAT STOPS IS A DESIGN DECISION, not an oversight.
 *
 * The open sea past the shallows is the question — "you can row to the
 * torn west edge of the page" is either the best reward in the world or
 * the thing that breaks it. It is the thing that breaks it, for two
 * reasons that have nothing to do with implementation cost:
 *
 *   1. THE WIDE BLUE is a land because the sandbar makes it walkable
 *      (Session 5, and it took a whole session to earn). A boat that
 *      goes anywhere wet deletes that: the bar stops being a route and
 *      becomes a strip of sand you could have rowed past. The mount has
 *      to open a route the walk did not have, not repeal one the walk
 *      worked for.
 *   2. The torn west edge is the biggest reward the sheet has left. It
 *      is not this session's to spend on a rowboat found beside a
 *      footbridge in the first ten minutes.
 *
 * So the rule is the one a rowboat has anyway: **it does not leave the
 * shore.** The river, wherever the river is; the water within thirty-
 * four units of dry paper — which is the whole coast, the bight, the
 * cove, the river mouth and the long shallow water either side of the
 * bar. Past that the sea gets up and a rowboat's business is over. It
 * is a boundary the player never has to be told, because they can see
 * exactly where it is: it is wherever they can still see the sand.
 * ------------------------------------------------------------------ */

/** Deep enough to float a boat. */
export const ROW_MIN_WATER = 0.42;
/** How far off dry paper an oar will go. */
export const ROW_REACH = 34;

/** How far (x, z) is from dry paper, out on the open sea. Two shores
 *  count and the bar is one of them: the crest is paper, so a boat can
 *  work the whole length of it. */
export function offshoreDist(x: number, z: number): number {
  const fromCoast = Math.max(0, coastX(z) - x);
  const fromBar = Math.max(0, barDist(x, z) - 9);
  return Math.min(fromCoast, fromBar);
}

/** Can an oar work here? The one authority; App floats on it and
 *  tools/check-terrain.mjs walks it off-screen. */
export function rowableAt(x: number, z: number): boolean {
  if (x < WORLD.minX || x > WORLD.maxX || z < WORLD.minZ || z > WORLD.maxZ) return false;
  if (riverAt(x, z) >= ROW_MIN_WATER) return true;
  return seaAt(x, z) >= ROW_MIN_WATER && offshoreDist(x, z) < ROW_REACH;
}

/**
 * WHERE THE BOAT IS, ON A PAGE NOBODY HAS TOUCHED YET.
 *
 * THE RIVER MOUTH (Session 5's sixth place on LONGSHORE): the river
 * crosses the whole sheet and ends here in salt, under the plank
 * footbridge that has been on the map since Session 1, with groynes
 * holding the sand against it and a mooring post already standing.
 * A river boat lives where the river is, and this is the one place on
 * the coast a walker arrives at with the whole river behind them.
 *
 * It is emphatically NOT the boat in Shelter Cove and NOT the one
 * resting on the south beach. STORY §8 rule 1: mounts are the PLAYER'S
 * ALONE, and no inhabitant may ever be shown leaving their own land by
 * boat. Those two belong to people who row out and come back — Pye
 * keeps pots off the cove and has never once been past the point — and
 * they stay exactly what they are, drawn up on their own sand.
 */
export const BOAT_HOME = { x: -206, z: 205.5 };
