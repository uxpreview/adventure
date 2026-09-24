/**
 * TIER 3, WHAT THE LANDS AND THE PROMISES SHARE.
 *
 * The same arrangement Tiers 1 and 2 have (`tier1-state.ts`,
 * `tier2-state.ts`): the promises (`tier3.ts`) decide where Amos is
 * walking, what is on his table, where a boat is on its bearing and
 * where the longship lies; the lands (`regions/wilds.ts`,
 * `regions/coast.ts`) draw it. Neither imports the other. They meet
 * here, in a file with no imports at all.
 *
 * Nothing here is saved. What is permanent is a piece of knowledge
 * (`promise:*`, a `door:`), and both sides read that every frame.
 */

/* ================== 7. AMOS. WHEN DID IT LAST RAIN ================= */

/** The catch (the land's own numbers). */
export const CATCH = { x: 302, z: 95 };
/** Where Amos stands at the tank by day. */
export const AMOS_STAND = { x: CATCH.x - 4.6, z: CATCH.z + 2.4 };
/** THE RAIN TABLE: his board, ruled into columns for a rain that has
 *  come once. It stood at his elbow; it stands off the apron's north
 *  corner now, clear of him by more than four units and its own reach
 *  (a person wins every prompt inside four: `tier2-state.ts` CLIPPERS),
 *  and on the side you come in from the road. */
export const RAIN_TABLE = { x: 289, z: 105 };
/** The can at the catch end of the track, and the south bank of the
 *  oasis, where it is filled (the land's own numbers). */
export const CAN_HOME = { x: 300.4, z: 90.0 };
export const OASIS_BANK = { x: 305, z: 63.5 };
/** The Flats' board where the Downs road comes in, beside THE HANDS:
 *  once the date is given, this is where Amos puts it, facing the
 *  Downs. */
export const ROAD_BOARD = { x: 271.5, z: 17.5 };

export const flats = {
  /** The can has water in it (was `canFull` in the land). */
  can: { full: false },
  /**
   * AMOS FETCHES THE WATER: his part, if you let him. Down the track
   * empty, a wait at the water, back up with the can, and he pours it
   * over his own table himself. `leg` is where he is in that; the land
   * draws him at (x, z) instead of at the tank while it is not ''.
   */
  amos: {
    leg: '' as '' | 'down' | 'fill' | 'up' | 'pour' | 'back',
    x: AMOS_STAND.x,
    z: AMOS_STAND.z,
    face: 1 as -1 | 1,
    moving: false,
    t: 0,
  },
};

/* ================== 8. PYE. THE EIGHTH POT ======================== */

/** Pye's boat, drawn up in the cove (the land's own numbers). */
export const COVE_BOAT = { x: -222, z: -136 };
/** Where you get in: the water's edge beside her, a knee deep. Eight
 *  units off where Pye stands, so he does not win the press. */
export const PYE_PUSH = { x: -224.5, z: -139.5 };
/** Where a ride puts you back on the sand. */
export const PYE_LAND = { x: -220.4, z: -138.2 };
/**
 * THE EIGHTH POT. Further out than the seven, and not on their line:
 * the seven run out north-west off the cove, and this one lies further
 * out than the seventh and swung west off their bearing, on a bearing
 * Pye has never rowed. It is ahead and to the left of a walker looking
 * out from the cove, so it reads from the sand at the lens's own
 * bearing (a thing you have to find must). The light that has hung out
 * on this water at night since Session 18 (`THE-STRANGERS` C8,
 * "nothing anywhere says what is under it") is its lamp.
 */
export const EIGHTH_POT = { x: -268, z: -172 };
/** The bearing, as the boat rows it: out along the seven, and then off
 *  their line past the seventh, which is where Pye stops if he is
 *  rowing. */
export const PYE_BEARING: [number, number][] = [
  [PYE_PUSH.x, PYE_PUSH.z], [-236, -145.5], [-249, -158.5], [EIGHTH_POT.x + 2.0, EIGHTH_POT.z + 1.6],
];
/** How far along the bearing Pye's last pot is, as a fraction. */
export const PAST_THE_SEVENTH = 0.6;

export const cove = {
  /** Where Pye's boat is while it is out; `out` false is on its sand. */
  /** `fx, fz` is the way she is going. */
  boat: { out: false, x: COVE_BOAT.x, z: COVE_BOAT.z, fx: -1, fz: 0 },
};

/* ================== 9. WREN. THE FINISH LINE ====================== */

/** THE MARK, the bell buoy the regatta rounds (the land's own). */
export const MARK = { x: -308, z: -36 };
/** THE PUNT, drawn up on the bar's seaward edge. It stood three units
 *  from where Wren stands, and a person wins every press inside four:
 *  it is nine off now. */
export const PUNT = { x: -271.5, z: 64.5 };
/** Where a ride puts you back on the bar. */
export const PUNT_LAND = { x: -269.2, z: 66.4 };
/**
 * THE SECOND MARK: out on the seaward side, so that a line from the
 * first to it runs across the fleet's home leg. A finish is where a
 * course is crossed, not where it turns.
 */
export const FINISH_MARK = { x: -326, z: 2 };
export const PUNT_PATH: [number, number][] = [
  [PUNT.x - 1.2, PUNT.z - 0.4], [-282, 61], [-296, 44], [-308, 23], [-318, 9], [FINISH_MARK.x + 3, FINISH_MARK.z + 2.4],
];
/** Where along it the last boat in the race comes alongside. */
export const ALONGSIDE_AT = 0.55;
/** Where the longship lies: at anchor beyond the mark, where it has lain
 *  four hundred years (08 §5: "beyond the mark... and cannot land"). */
export const LONGSHIP_ANCHOR = { x: -352, z: -70 };
/** And inside it, off the bar by the punt, once a rule lets it in. */
export const LONGSHIP_IN = { x: -298, z: 50 };

export const wideBlue = {
  /** THE LAST BOAT COMES ALONGSIDE: while `on`, the land draws the
   *  longship at (x, z) instead of where its hour would put it. */
  alongside: { on: false, x: 0, z: 0, face: 1 as -1 | 1, roar: 0 },
  /** The punt, while it is out. */
  punt: { out: false, x: PUNT.x, z: PUNT.z, fx: -1, fz: 0 },
};
