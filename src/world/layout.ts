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

/* ================================================================== *
 * WHERE YOU WAKE, AND WHERE THE POSTER STANDS — two places, since
 * Session 16, and they used to be one.
 *
 * For fourteen sessions the walker woke at the signpost, which is
 * exactly where the title camera stands, so THE SHOT and the poster
 * and the spawn were one composition. The owner's verdict on it
 * (`THE-FUN-PASS` §0): *"bland and expected, and it confuses users
 * because they don't know where to go or what to do."* The opening
 * the owner chose (§11: THE BULL) wakes you in long grass with a bull
 * already looking at you, and the long grass is the field beyond the
 * long fence, sixty units east of the poster.
 *
 * So the poster keeps its ground and the walker does not. `POSTER` is
 * where the title camera stands on a fresh page — the frame six WOWED
 * verdicts were awarded on, to the unit — and `SPAWN` is where SET
 * OUT puts you: in the wheat at the field's east end, with the bull
 * at fourteen units and the gate thirty-six to the west. The cut between them is a blink of paper (`App`).
 * A saved walk still opens where it was left.
 * ================================================================== */
export const POSTER = { x: -45, z: 58 };
/* ON THE GATE'S ROW (the local QA pass, 2026-09-04, B1). It was
 * (24, 90), eight units south of the gate at z 82, and a player who
 * ran due west from the bull — which is what the hint tells them to
 * do — hit the hedge eight units south of the gap and stood there with
 * the bull behind them. The run west is now the run through the gate. */
export const SPAWN = { x: 24, z: 82 };

/* ================================================================== *
 * DISTRICTS — more regions, no more sheet (`THE-FUN-PASS` §2.4, §7).
 *
 * The twelve rects stay the shared truth of terrain, map, audio and
 * collision, and they are not touched. Under them, a layer: two to
 * four named sub-rects per land, each with a reason, so that crossing
 * a land is three arrivals instead of one. A district has a card (its
 * name is written under its land's), a place on the map, and nothing
 * else — no wash, no step zone, no mood. It is a NAME for a piece of
 * ground, and a name is the cheapest thing in this game and the most
 * load-bearing.
 *
 * Districts need not tile a land. The ground between them is the
 * land's own, and the card says so by saying nothing.
 *
 * Session 16 built the layer and populated THE COMMON only, because
 * the Common was the land being re-opened; Session 18 fills the other
 * eleven from the first cut in §7 — forty-five districts, none of
 * them overlapping, none of them tiling their land.
 * ================================================================== */
export type District = {
  land: RegionId;
  /** Readable, like everything else: `the-crossroads`. */
  id: string;
  /** Written under the land's name on the card, and on the map. */
  name: string;
  rect: Rect;
};

export const DISTRICTS: District[] = [
  /* THE COMMON — four, from the places that already exist and one new.
   * The crossroads is the spawn's whole first minute; the well is the
   * first landmark off the road; the river bend is the south-east
   * corner where the river clips the land; and THE FAIR GROUND is new
   * — the open grass south-west of the crossroads, which was a
   * composed void and is now a place with a reason: it is where the
   * fair is held, and the fair is not on. */
  { land: 'meadow', id: 'the-crossroads', name: 'THE CROSSROADS',
    rect: { minX: -62, maxX: -24, minZ: 50, maxZ: 80 } },
  { land: 'meadow', id: 'the-well', name: 'THE WELL',
    rect: { minX: -84, maxX: -48, minZ: 24, maxZ: 50 } },
  { land: 'meadow', id: 'the-fair-ground', name: 'THE FAIR GROUND',
    rect: { minX: -128, maxX: -62, minZ: 78, maxZ: 118 } },
  { land: 'meadow', id: 'the-river-bend', name: 'THE RIVER BEND',
    rect: { minX: 30, maxX: 60, minZ: 94, maxZ: 120 } },

  /* ================================================================ *
   * THE OTHER ELEVEN (Session 18), from `THE-FUN-PASS` §7's first cut.
   * Every rect is sized off the places that already stand in it — a
   * district is a name for ground the land already has, never a reason
   * to move anything — and none of them overlap, because `districtAt`
   * takes the first match and a walker should never be told two names
   * for one step. Two of the cut's names are NEW ground with nothing
   * standing on it yet, and are drawn as districts anyway so the map
   * and the card promise them: THE YARDS in Greyline (the goods yards
   * south of the junction, where the older buildings are) and THE
   * FAIR GROUND on the Common, which Session 16 already named.
   * ================================================================ */

  /* BRIM: the square is the square; the back streets are the lanes
   * between it and the south gate, with the belfry yard in them; the
   * orchard close is its own wall; the wood gate is the market lane's
   * far end where the Penwood begins. */
  { land: 'kingdom', id: 'the-square', name: 'THE SQUARE',
    rect: { minX: -66, maxX: -22, minZ: -104, maxZ: -62 } },
  { land: 'kingdom', id: 'the-back-streets', name: 'THE BACK STREETS',
    rect: { minX: -78, maxX: -20, minZ: -62, maxZ: -22 } },
  { land: 'kingdom', id: 'the-orchard-close', name: 'THE ORCHARD CLOSE',
    rect: { minX: -128, maxX: -80, minZ: -94, maxZ: -46 } },
  { land: 'kingdom', id: 'the-wood-gate', name: 'THE WOOD GATE',
    rect: { minX: 24, maxX: 60, minZ: -128, maxZ: -92 } },

  /* GREYWEATHER: the avenue is the king's road up the ramp with the
   * banners either side; the bailey is the plateau with the keep and
   * the king on it; the moat is the pool at the ridge's west foot; the
   * ridge is the curtain wall's brow east of the bailey, which the
   * sentry walks at dusk. */
  { land: 'castle', id: 'the-avenue', name: 'THE AVENUE',
    rect: { minX: -62, maxX: -28, minZ: -212, maxZ: -160 } },
  { land: 'castle', id: 'the-bailey', name: 'THE BAILEY',
    rect: { minX: -76, maxX: -14, minZ: -256, maxZ: -212 } },
  { land: 'castle', id: 'the-moat', name: 'THE MOAT',
    rect: { minX: -124, maxX: -76, minZ: -236, maxZ: -196 } },
  { land: 'castle', id: 'the-ridge', name: 'THE RIDGE',
    rect: { minX: -14, maxX: 40, minZ: -262, maxZ: -206 } },

  /* MAPLE COURT: the court is the street the land is named after; the
   * green is the swing and the three chairs' far side; the end of the
   * survey is the last house in the world and the road that stops
   * sixteen units short of the edge. */
  { land: 'neighborhood', id: 'the-court', name: 'THE COURT',
    rect: { minX: -104, maxX: -54, minZ: 124, maxZ: 168 } },
  { land: 'neighborhood', id: 'the-green', name: 'THE GREEN',
    rect: { minX: -16, maxX: 24, minZ: 160, maxZ: 198 } },
  { land: 'neighborhood', id: 'the-end-of-the-survey', name: 'THE END OF THE SURVEY',
    rect: { minX: -70, maxX: -20, minZ: 236, maxZ: 280 } },

  /* THE PENWOOD: the wood road is the track in from Brim's gate; the
   * round is the ring and the water it keeps forty units from; the deep
   * pines are the north-east stand where the pine-tick stops at night. */
  { land: 'forest', id: 'the-wood-road', name: 'THE WOOD ROAD',
    rect: { minX: 60, maxX: 110, minZ: -142, maxZ: -102 } },
  { land: 'forest', id: 'the-round', name: 'THE ROUND',
    rect: { minX: 104, maxX: 196, minZ: -232, maxZ: -150 } },
  { land: 'forest', id: 'the-deep-pines', name: 'THE DEEP PINES',
    rect: { minX: 160, maxX: 230, minZ: -280, maxZ: -232 } },

  /* SPLITROCK: the mouth is where the trail drops in; the floor is the
   * bed of the tear, the only flat walk in the land; the east bench is
   * the rim above the head wall, Holt's side, where the boat is. */
  { land: 'canyon', id: 'the-mouth', name: 'THE MOUTH',
    rect: { minX: 268, maxX: 322, minZ: -150, maxZ: -108 } },
  { land: 'canyon', id: 'the-floor', name: 'THE FLOOR',
    rect: { minX: 282, maxX: 322, minZ: -222, maxZ: -150 } },
  { land: 'canyon', id: 'the-east-bench', name: 'THE EAST BENCH',
    rect: { minX: 282, maxX: 350, minZ: -262, maxZ: -222 } },

  /* THE DOWNS: the harrow is the home field where the whole field
   * works; the mill rise is the lane's climb to the mill; the drove is
   * the fold and the lane's mouth; the ford is where the river goes
   * light. */
  { land: 'downs', id: 'the-harrow', name: 'THE HARROW',
    rect: { minX: 160, maxX: 230, minZ: -58, maxZ: 8 } },
  { land: 'downs', id: 'the-mill-rise', name: 'THE MILL RISE',
    rect: { minX: 124, maxX: 160, minZ: -40, maxZ: 8 } },
  { land: 'downs', id: 'the-drove', name: 'THE DROVE',
    rect: { minX: 80, maxX: 124, minZ: 76, maxZ: 124 } },
  { land: 'downs', id: 'the-ford', name: 'THE FORD',
    rect: { minX: 124, maxX: 162, minZ: 8, maxZ: 34 } },

  /* THE FLATS: the pale is the ruled ground where the aliens will land;
   * the pan is the flattest ground in the world, north of the oasis;
   * the catch is Amos's tank on the pan's rim; where the road stops is
   * where it does. */
  { land: 'desert', id: 'the-pale', name: 'THE PALE',
    rect: { minX: 240, maxX: 296, minZ: 26, maxZ: 78 } },
  { land: 'desert', id: 'the-pan', name: 'THE PAN',
    rect: { minX: 296, maxX: 380, minZ: -84, maxZ: 2 } },
  { land: 'desert', id: 'the-catch', name: 'THE CATCH',
    rect: { minX: 288, maxX: 330, minZ: 84, maxZ: 114 } },
  { land: 'desert', id: 'where-the-road-stops', name: 'WHERE THE ROAD STOPS',
    rect: { minX: 330, maxX: 372, minZ: 2, maxZ: 36 } },

  /* LONGSHORE: the promenade is the boardwalk north from the coast
   * road; the huts are the painted huts; the cut is the surfers' gap
   * in the dune; the point is the Holdfast's tip. */
  { land: 'beach', id: 'the-promenade', name: 'THE PROMENADE',
    rect: { minX: -250, maxX: -206, minZ: 4, maxZ: 100 } },
  { land: 'beach', id: 'the-huts', name: 'THE HUTS',
    rect: { minX: -226, maxX: -184, minZ: -30, maxZ: 4 } },
  { land: 'beach', id: 'the-cut', name: 'THE CUT',
    rect: { minX: -250, maxX: -206, minZ: -62, maxZ: -30 } },
  { land: 'beach', id: 'the-point', name: 'THE POINT',
    rect: { minX: -250, maxX: -220, minZ: -104, maxZ: -62 } },

  /* THE WIDE BLUE: the shallows below the boardwalk; the bar itself,
   * out to the long water; the mark and the water round it; and the
   * Holdfast's seaward face, where the longship will beach. */
  { land: 'ocean', id: 'the-shallows', name: 'THE SHALLOWS',
    rect: { minX: -280, maxX: -250, minZ: 70, maxZ: 110 } },
  { land: 'ocean', id: 'the-bar', name: 'THE BAR',
    rect: { minX: -306, maxX: -256, minZ: 8, maxZ: 70 } },
  { land: 'ocean', id: 'the-mark', name: 'THE MARK',
    rect: { minX: -324, maxX: -280, minZ: -30, maxZ: 8 } },
  { land: 'ocean', id: 'the-holdfast', name: 'THE HOLDFAST',
    rect: { minX: -292, maxX: -250, minZ: -124, maxZ: -30 } },

  /* GREYLINE: the junction with its four green lights; the hollow, one
   * block west; the north end where the grid gives up; the yards
   * south of the junction, where the older, lower buildings stand. */
  { land: 'city', id: 'the-junction', name: 'THE JUNCTION',
    rect: { minX: 128, maxX: 170, minZ: 184, maxZ: 224 } },
  { land: 'city', id: 'the-hollow', name: 'THE HOLLOW',
    rect: { minX: 70, maxX: 108, minZ: 188, maxZ: 240 } },
  { land: 'city', id: 'the-north-end', name: 'THE NORTH END',
    rect: { minX: 136, maxX: 184, minZ: 140, maxZ: 184 } },
  { land: 'city', id: 'the-yards', name: 'THE YARDS',
    rect: { minX: 120, maxX: 180, minZ: 224, maxZ: 270 } },

  /* THE CUBICLE MILE: the barrier and the 8:15 stop at the gate; the
   * atrium behind the sliding doors; the overflow, the car park nobody
   * needs; the car park, the one they use. */
  { land: 'office', id: 'the-barrier', name: 'THE BARRIER',
    rect: { minX: 230, maxX: 262, minZ: 186, maxZ: 222 } },
  { land: 'office', id: 'the-atrium', name: 'THE ATRIUM',
    rect: { minX: 262, maxX: 300, minZ: 164, maxZ: 200 } },
  { land: 'office', id: 'the-overflow', name: 'THE OVERFLOW',
    rect: { minX: 284, maxX: 332, minZ: 134, maxZ: 164 } },
  { land: 'office', id: 'the-car-park', name: 'THE CAR PARK',
    rect: { minX: 300, maxX: 352, minZ: 184, maxZ: 226 } },
];

/** The district at (x, z), if any. The list is authored so that no
 *  two overlap; the first match would win if one day they did. */
export function districtAt(x: number, z: number): District | null {
  for (const d of DISTRICTS) {
    const r = d.rect;
    if (x >= r.minX && x < r.maxX && z >= r.minZ && z < r.maxZ) return d;
  }
  return null;
}

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
  /**
   * THIS ROAD IS PART OF THE LINE (Session 7, STORY §4).
   *
   * The king's road, main street and the commuter spur are one road
   * under three of its twelve names, castle gate to car park, surveyed
   * as a railway and built as a road by people who were waiting for it
   * to become the other thing. Session 6 already made the three of them
   * carry hardest; this flag is what lets `knowledge.ts` lay route
   * posts down the whole of it and what lets the MAP draw it as one
   * continuous line once the walker has actually been the whole way.
   *
   * Nothing in the game ever says any of that. The map simply stops
   * dashing it.
   */
  line?: true;
};

export const ROADS: Road[] = [
  // the king's road: castle gate → kingdom square → the meadow → Maple Court
  // Session 4: the road now climbs the castle ramp and goes through the
  // barbican, because the avenue IS the way up the ridge and a bare
  // pale slope read as nothing. Terrain and map pick it up for free.
  // THE LINE, first of three: castle gate to the far side of Maple Court.
  { width: 5, carry: 1, line: true, pts: [[-45, -218], [-45, -206], [-45, -195], [-45, -120], [-48, -60], [-45, -15], [-45, 58], [-42, 130], [-45, 200], [-45, 262]] },
  // the coast road: meadow west over the dune line to the boardwalk
  { width: 4, carry: 0.5, pts: [[-45, 58], [-110, 62], [-165, 60], [-205, 58], [-219, 58]] },
  // the east road: meadow → the downs → bridge → desert edge
  { width: 5, carry: 0.55, pts: [[-45, 58], [10, 50], [60, 46], [110, 45], [160, 22], [225, 8], [290, 12], [345, 18]] },
  // the mill lane: the mill, the ford, the east road, and then south
  // through the downs into the city.
  //
  // Session 10 EXTENDED IT NORTH, and that is the whole of THE HARROW
  // DOWNS' layout. The lane used to stop dead at the river's south
  // bank, which left the mill — the land's one landmark and half of its
  // wait — standing thirty units off the end of a road nobody could
  // follow to it. Now the lane crosses at the ford and climbs the mill
  // rise, so the mill is a thing you walk toward and the camera's law
  // is obeyed instead of argued with: the lane runs north–south, the
  // mill is north of everywhere you stand on it.
  { width: 4, carry: 0.5, pts: [[150, -14], [148, 2], [147, 19], [145, 28], [148, 90], [150, 150], [148, 205], [150, 262]] },
  // main street: neighborhood → the river bridge → downtown
  // THE LINE, second: the same road under a different name.
  { width: 4.5, carry: 1, line: true, pts: [[-45, 200], [-8, 202], [40, 198], [90, 200], [148, 205]] },
  // commuter spur: city → office park
  // THE LINE, third and last: and it ends in a car park.
  { width: 4.5, carry: 1, line: true, pts: [[148, 205], [210, 208], [268, 205], [330, 202]] },
  /* THE FOREST TRACK — the way in, and it goes as far as the ring.
   * Session 10 stopped it at the ring's south-west corner; before that
   * it ran through the middle of the tarn, which was a road painted
   * across twelve units of open water and nobody had ever stood on it
   * to notice. */
  { width: 3.2, carry: 0.34, pts: [[55, -110], [78, -122], [101, -134], [120, -148], [129, -158.6]] },
  /* ================================================================ *
   * BRACK'S ROUND — and it is the only other road in the Penwood.
   *
   * THE-WAITS §7: Brack will not go within forty units of the tarn and
   * has walked its circumference for forty years, and "the forest track
   * is his path — worn by one man's caution, hardened into a road, then
   * used by everybody after him, none of whom were afraid of anything."
   *
   * So it is not a note and it is not a behaviour. It is the road.
   * Forty-two units of radius round the water, all the way round, and
   * the track from Brim arrives at it and stops. **THE PENWOOD HAS ONE
   * ROAD AND IT IS A CIRCLE**: everybody who has ever crossed this wood
   * has walked part of a ring around a pond and gone back the way they
   * came, and not one of them has ever thought that strange.
   *
   * Forty-two rather than forty, because the points are the polyline
   * and the chords sag: at thirty degrees apart the middle of a segment
   * is about a unit and a half in, which lands the road's centreline at
   * forty and a half at its nearest. The man keeps his forty. The
   * carry is the lowest on the sheet — a ring road that CARRIED would
   * walk you round and round, which is funny once and a bug forever.
   * ================================================================ */
  { width: 3.2, carry: 0.22, pts: [
    [192, -195], [186.4, -174], [171, -158.6], [150, -153], [129, -158.6],
    [113.6, -174], [108, -195], [113.6, -216], [129, -231.4], [150, -237],
    [171, -231.4], [186.4, -216], [192, -195],
  ] },
  /* ================================================================ *
   * MAPLE COURT — the street the land is named after (Session 13).
   *
   * `THE-WAITS` §3 gives Val a street to hold the line of, and until now
   * MAPLE COURT was a land with no Maple Court in it: the neighbourhood
   * had one road through it and it was the king's road under another
   * name. So the court is authored the way the Penwood's ring was — as
   * a POLYLINE, because the shape of the road is the shape of what the
   * people on it believe.
   *
   * **It leaves the king's road, goes eighteen units, and comes back to
   * itself.** A stem and a turning circle: a street you can walk the
   * whole of and end up where you started, with eleven houses on it and
   * one porch light. Nothing in Maple Court runs off the edge of its own
   * drawing (`textures-now.ts` carries the same rule for every mark in
   * the land), and the road is the largest instance of it.
   *
   * The carry is the second lowest on the sheet, just above Brack's
   * ring, and for the same reason: a road that carried you round a
   * circle would be funny once and a bug afterwards.
   * ================================================================ */
  { width: 3.6, carry: 0.26, pts: [
    [-45, 146], [-54, 147], [-64, 147], [-72, 146.5],
    [-78, 146], [-73, 143], [-72, 140], [-73, 137], [-78, 134],
    [-83, 137], [-84, 140], [-83, 143], [-78, 146],
  ] },
  // the market lane: Brim Square east to the Wood Gate (Session 3)
  { width: 3.4, carry: 0.42, pts: [[-40, -86], [-12, -96], [18, -104], [42, -109], [55, -110]] },
  /* ================================================================ *
   * THE CANYON TRAIL — and from Session 11 it is the only road in
   * SPLITROCK CANYON, and it is the bed of a river that is not there.
   *
   * THE-WAITS §4 gives HOLT a fact about his land: the river that cut
   * this canyon is now somebody else's river, and the channel floor is
   * "a riverbed with nothing in it, and the only flat walk in the land."
   * The Penwood said its fable in a polyline and this land can say its
   * own in the same place. So the trail does not stop at the canyon's
   * edge and look in. It comes up out of THE BLEACH FLATS, **rounds the
   * head of the river** — there is no bridge on this water and a river
   * with no bridge is a wall, so the only way into this land on foot is
   * round the top of it, six units north of where it comes out of the
   * ground — drops down the MOUTH, where the rip is still shallow, and
   * then runs a hundred and twelve units north along the floor of the
   * tear itself before ending, dead, at a wall.
   *
   * Every point from z = −136 north is `tearX(z)` sampled at eight-unit
   * intervals and rounded to a tenth, which is why the road wanders: it
   * is not following a route, it is lying in the bottom of a channel,
   * and paper does not tear straight.
   *
   * The carry is the second lowest on the sheet. A dry bed carries you
   * the way a dry bed does, which is hardly at all — but it does carry,
   * because the one thing a channel does to anything that walks into it
   * is point it up or down.
   * ================================================================ */
  { width: 3, carry: 0.3, pts: [
    [225, 8], [250, -12], [276, -34], [297, -58], [310, -86], [306, -110],
    [298, -124], [292, -132],
    [290.1, -136], [288.8, -144], [291.9, -152], [296.2, -160], [297.8, -168],
    [299.3, -176], [303.8, -184], [303.5, -192], [308.4, -200], [309.6, -208],
    [309.6, -216], [306.8, -224], [305.7, -232], [305.8, -240], [305.3, -248],
  ] },
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

/**
 * THE RIVER RISES AT THE CANYON'S MOUTH AND THE CHANNEL ABOVE IT IS DRY.
 *
 * That is not a bug and it never was: it is `THE-WAITS` §4 already true
 * in the height field. The rip runs north of here and there is nothing
 * in it; the water comes out of the ground at the bottom of the canyon's
 * open end and goes away west across four lands to the sea, and the man
 * at the top of the dry part keeps a boat.
 *
 * SESSION 11 MOVED THE SOURCE WITH THE TEAR — the canyon is at x = 300
 * now rather than x = 338 (`elevation.ts`, `tearX`), and a source left
 * behind at 318 would have risen on the bench forty units east of the
 * mouth, which says nothing at all. It rises six units south of where
 * the tear begins, which is as close to the mouth as `riverBed` allows:
 * the bed falls monotonically from +3 at the source, and water cannot
 * climb out of a thirteen-unit hole.
 */
export const RIVER: [number, number][] = [
  [296, -116], [285, -70], [250, -38], [205, -12], [168, 8], [138, 26],
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

/* ------------------------------------------------------------------ *
 * THE FORD (Session 10) — and it is deliberately NOT a fourth bridge.
 *
 * THE HARROW DOWNS needed the mill lane to cross the river, and a plank
 * bridge on a farm track is the dull answer: this world already has
 * three and they are the ROAD WEB's, which is part of what makes the
 * king's road read as something laid down on purpose. What a working
 * land does instead is find the shallow place and drive the cart
 * through it.
 *
 * So a ford changes exactly one thing, and it is not the water. The
 * river's waterness is untouched — which matters more than it looks,
 * because `rowableAt` reads that number and `route:the-river` is salt
 * to source under every crossing: reduce it here and the rowboat runs
 * aground in the middle of the Downs. What the ford changes is the BED
 * (raised, so the water shallows and pales over it) and what the PAGE
 * REFUSES (`Terrain.blockedAt` lets a walker through).
 *
 * You can therefore see exactly where it is: it is where the river goes
 * light. Nothing has to tell you.
 * ------------------------------------------------------------------ */
export const FORDS: { x: number; z: number; r: number }[] = [
  { x: 147, z: 19, r: 9 },   // the mill lane's crossing, THE HARROW DOWNS
];

/** How much of a ford there is at (x, z): 1 in the crossing, 0 off it. */
export function fordAt(x: number, z: number): number {
  let k = 0;
  for (const f of FORDS) {
    const d = Math.hypot(x - f.x, z - f.z);
    if (d < f.r + 5) k = Math.max(k, 1 - csmooth(f.r * 0.5, f.r + 4, d));
  }
  return k;
}

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

/* ================================================================== *
 * THE LINE, AS ONE POLYLINE — and the twelve stops on it.
 *
 * Session 14. `STORY.md` §4: *the king's road leaves Greyweather's
 * gate, comes down through Brim, crosses the Common, runs up Maple
 * Court as main street and ends, as the commuter spur, in a car park.
 * Twelve names, one road, castle to car park.* Three of the roads above
 * carry `line: true` and have since Session 7, because `knowledge.ts`
 * lays route posts down them and the map draws them as one continuous
 * inked line once the walker has been the whole way.
 *
 * **The 8:15 runs exactly that**, assembled here from the roads
 * themselves rather than authored a second time, so the thing that
 * comes cannot drift from the road the player walked. Where the king's
 * road runs on past the junction to the world's south rim it is NOT the
 * line — that is where the survey was going before it turned, and it is
 * sixteen units short of the edge of the world, and nothing in this
 * game will ever say so.
 * ================================================================== */

/** The drawn line, gate to car park, as one continuous polyline. */
export const THE_LINE: [number, number][] = (() => {
  const legs = ROADS.filter((r) => r.line);
  const out: [number, number][] = [];
  // the king's road only as far as the junction with main street; past
  // that it is the road to the rim and it is a different thing
  const head = legs[0].pts.filter(([, z]) => z <= 201) as [number, number][];
  out.push(...head);
  for (let i = 1; i < legs.length; i++) {
    out.push(...(legs[i].pts.slice(1) as [number, number][]));
  }
  return out;
})();

/** How far along `THE_LINE` each of its points is, and how long it is
 *  altogether. The 8:15 is driven by arc length, so it moves at one
 *  speed whatever the spacing of the authored points. */
export const LINE_ARC: number[] = (() => {
  const out = [0];
  for (let i = 1; i < THE_LINE.length; i++) {
    out.push(out[i - 1] + Math.hypot(
      THE_LINE[i][0] - THE_LINE[i - 1][0],
      THE_LINE[i][1] - THE_LINE[i - 1][1]
    ));
  }
  return out;
})();

export const LINE_LENGTH = LINE_ARC[LINE_ARC.length - 1];

/** A point on the line, and which way it runs there. */
export function lineAt(s: number): { x: number; z: number; tx: number; tz: number } {
  const d = Math.max(0, Math.min(LINE_LENGTH, s));
  let i = 1;
  while (i < LINE_ARC.length - 1 && LINE_ARC[i] < d) i++;
  const a = THE_LINE[i - 1];
  const b = THE_LINE[i];
  const seg = LINE_ARC[i] - LINE_ARC[i - 1] || 1;
  const u = (d - LINE_ARC[i - 1]) / seg;
  const dx = b[0] - a[0];
  const dz = b[1] - a[1];
  const l = Math.hypot(dx, dz) || 1;
  return { x: a[0] + dx * u, z: a[1] + dz * u, tx: dx / l, tz: dz / l };
}

/** How far along the line (x, z) is, and how far off it — the test the
 *  mount uses to refuse everywhere the line is not drawn. */
export function nearestOnLine(x: number, z: number): { s: number; d: number } {
  let best = 1e9;
  let bestS = 0;
  for (let i = 1; i < THE_LINE.length; i++) {
    const [ax, az] = THE_LINE[i - 1];
    const [bx, bz] = THE_LINE[i];
    const dx = bx - ax;
    const dz = bz - az;
    const len2 = dx * dx + dz * dz || 1;
    const u = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / len2));
    const d = Math.hypot(x - (ax + dx * u), z - (az + dz * u));
    if (d < best) {
      best = d;
      bestS = LINE_ARC[i - 1] + u * Math.hypot(dx, dz);
    }
  }
  return { s: bestS, d: best };
}

/**
 * THE TWELVE STOPS, in the surveyors' order, coming down the line from
 * the gate — and they are the twelve entries on the timetable in the
 * case at THE 8:15 STOP (`textures-office.ts`, `SURVEY_SCHEDULE`).
 *
 * ── WHY TWELVE STOPS ON A ROAD THAT PASSES SIX LANDS ────────────────
 *
 * `THE-LINE.md` §5 is settled: *the 8:15 comes down the line, once, and
 * stops twelve times.* The line runs through six of the twelve rects,
 * and rule 1 of `STORY.md` §8 — nobody crosses a border but the walker
 * — forbids the obvious repair of walking the other six lands' people
 * to a platform.
 *
 * So the twelve are what a survey's twelve entries actually are: **the
 * twelve places on the line where the surveyors were due, each noted
 * against the land it was to serve.** A survey names the place it is
 * going to reach, not the place it goes through. Six of these stand in
 * the lands they are named for; the other six stand on the line at the
 * chainage the survey gave that land, which is where its own road
 * leaves, or where it is nearest, or simply where the hour fell.
 *
 * **And there is exactly one shelter in the world, and it is the last
 * one on this list.** The other eleven stops are places on a road where
 * there is nothing at all, and at eleven of them, once, somebody is
 * standing.
 *
 * `land` is the region whose wait decides whether anybody is there.
 */
export const LINE_STOPS: { land: RegionId; name: string; z?: number; x?: number }[] = [
  { land: 'castle', name: 'GREYWEATHER', z: -206 },
  { land: 'forest', name: 'PENWOOD', z: -166 },
  { land: 'kingdom', name: 'BRIM', z: -120 },
  { land: 'canyon', name: 'SPLITROCK', z: -74 },
  { land: 'downs', name: 'HARROW', z: -24 },
  { land: 'beach', name: 'LONGSHORE', z: 24 },
  { land: 'meadow', name: 'THE COMMON', z: 58 },
  { land: 'ocean', name: 'WIDE BLUE', z: 104 },
  { land: 'neighborhood', name: 'MAPLE COURT', z: 150 },
  { land: 'desert', name: 'BLEACH FLATS', x: 40 },
  { land: 'city', name: 'GREYLINE', x: 148 },
  { land: 'office', name: 'CUBICLE MILE', x: 252 },
];

/** Where each stop is, as a distance along the line. Resolved once. */
export const LINE_STOP_S: number[] = LINE_STOPS.map((st) =>
  st.z !== undefined
    ? nearestOnLine(-45, st.z).s
    : nearestOnLine(st.x!, st.x! < 148 ? 200 : 205).s
);
