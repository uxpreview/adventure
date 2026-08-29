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

export type Road = { pts: [number, number][]; width: number };

export const ROADS: Road[] = [
  // the king's road: castle gate → kingdom square → the meadow → Maple Court
  // Session 4: the road now climbs the castle ramp and goes through the
  // barbican, because the avenue IS the way up the ridge and a bare
  // pale slope read as nothing. Terrain and map pick it up for free.
  { width: 5, pts: [[-45, -218], [-45, -206], [-45, -195], [-45, -120], [-48, -60], [-45, -15], [-45, 58], [-42, 130], [-45, 200], [-45, 262]] },
  // the coast road: meadow west over the dune line to the boardwalk
  { width: 4, pts: [[-45, 58], [-110, 62], [-165, 60], [-205, 58], [-219, 58]] },
  // the east road: meadow → the downs → bridge → desert edge
  { width: 5, pts: [[-45, 58], [10, 50], [60, 46], [110, 45], [160, 22], [225, 8], [290, 12], [345, 18]] },
  // the mill lane: east road south through the downs into the city
  { width: 4, pts: [[145, 28], [148, 90], [150, 150], [148, 205], [150, 262]] },
  // main street: neighborhood → the river bridge → downtown
  { width: 4.5, pts: [[-45, 200], [-8, 202], [40, 198], [90, 200], [148, 205]] },
  // commuter spur: city → office park
  { width: 4.5, pts: [[148, 205], [210, 208], [268, 205], [330, 202]] },
  // the forest track: kingdom east gate into the Penwood
  { width: 3.2, pts: [[55, -110], [95, -130], [130, -160], [150, -195], [160, -230]] },
  // the market lane: Brim Square east to the Wood Gate (Session 3)
  { width: 3.4, pts: [[-40, -86], [-12, -96], [18, -104], [42, -109], [55, -110]] },
  // canyon trail: downs NE corner up the canyon mouth
  { width: 3, pts: [[225, 8], [255, -40], [280, -85], [300, -130], [305, -175]] },
];

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
