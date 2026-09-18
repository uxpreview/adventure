/**
 * TIER 1, WHAT THE LANDS AND THE PROMISES SHARE.
 *
 * The promises (`tier1.ts`) decide where Wick and Marget are going and
 * why; the lands (`regions/civic.ts`) draw them going there. Neither
 * imports the other: they meet here, in a file with no imports, the way
 * the opening and the meadow meet in `common`.
 *
 * Nothing here is saved. What is permanent is a piece of knowledge
 * (`promise:*`, a `door:`), and both sides read that every frame.
 */

/** Where things are, so the two sides agree. */
export const CHAIN = { x: -45, z: -164.5, halfW: 4.6 };
export const BRAZIERS = { x: -45, z: -188.6, west: { x: -52.5, z: -189.5 }, east: { x: -37.5, z: -189.5 } };
/** Wick by day: at his post by the west fire. At dusk: out in front of
 *  both, facing down the hill to Brim. Sat: the mounting block. */
export const WICK_POST = { x: -50.4, z: -186.9 };
export const WICK_WATCH = { x: -45, z: -181.8 };
export const WICK_BLOCK = { x: -55.6, z: -187.4 };
export const WICK_AT_CHAIN = { x: -47.6, z: -166.2 };
export const HALL_DOOR = { x: -45, z: -249.2 };
export const HALL_ROOM = { minX: -53, maxX: -37, minZ: -257.4, maxZ: -250.8 };

export const BELFRY = { x: -64, z: -42 };
export const BELL_ROPE = { x: -62.6, z: -41.2 };
export const MARGET_STALL = { x: -43.1, z: -75.0 };
/** Down the king's road and into the yard: never through a terrace. */
export const MARGET_PATH: [number, number][] = [[-43.1, -75.0], [-46.4, -66], [-47, -48], [-55, -42.6], [BELL_ROPE.x, BELL_ROPE.z]];

export type Going = 'home' | 'out';

export const greyweather = {
  wick: {
    /** 'home' is his own day; 'out' is down at the chain. */
    goal: 'home' as Going,
    /** Set by the land: he has got where he was going. */
    arrived: false,
    /** Where he is drawn this frame, and whether he is on the page. */
    x: WICK_POST.x, z: WICK_POST.z, present: false,
    /** He is out in front of the fires, facing Brim (dusk till late). */
    watching: false,
  },
};

export const brim = {
  marget: {
    goal: 'home' as Going,
    arrived: false,
  },
  /** The bell, rung: the land rocks the belfry and sounds it. */
  bell: { strokes: 0, t: 0 },
  /** Where each named bystander stands, for a line said unasked. */
  folk: {} as Record<string, { x: number; z: number; present: boolean }>,
};

export function ringBell(strokes: number) {
  brim.bell.strokes = strokes;
  brim.bell.t = 0;
}
