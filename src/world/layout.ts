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
  { id: 'ocean', name: 'THE WIDE BLUE', kicker: 'open water', wash: WASH.seaShallow, step: 'wet',
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
 * ROADS. One connected web, authored once; the terrain paints them,
 * the map draws them, bridges sit where they cross the river.
 * ------------------------------------------------------------------ */

export type Road = { pts: [number, number][]; width: number };

export const ROADS: Road[] = [
  // the king's road: castle gate → kingdom square → the meadow → Maple Court
  { width: 5, pts: [[-45, -195], [-45, -120], [-48, -60], [-45, -15], [-45, 58], [-42, 130], [-45, 200], [-45, 262]] },
  // the coast road: meadow west over the dune line to the boardwalk
  { width: 4, pts: [[-45, 58], [-110, 62], [-165, 60], [-205, 58]] },
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

/** Small still waters, painted as soft blobs. */
export const PONDS: { x: number; z: number; r: number }[] = [
  { x: 150, z: -195, r: 12 },  // the forest tarn
  { x: 305, z: 55, r: 10 },    // the oasis
  { x: -100, z: -215, r: 8 },  // the castle moat pool
];
