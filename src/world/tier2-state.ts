/**
 * TIER 2, WHAT THE LANDS AND THE PROMISES SHARE.
 *
 * The same arrangement Tier 1 has (`tier1-state.ts`): the promises
 * (`tier2.ts`) decide where Val, Brack and Holt are going and what is
 * cut, lit or dry; the lands (`regions/civic.ts`, `regions/wilds.ts`)
 * draw it. Neither imports the other. They meet here, in a file with no
 * imports at all.
 *
 * Nothing here is saved. What is permanent is a piece of knowledge
 * (`promise:*`, a `door:`), and both sides read that every frame.
 */

/* ================== 4. VAL. THE GAP IN THE HEDGE ================== */

/** The three chairs, and the hedge they face (the land's own numbers). */
export const CHAIRS = { x: -61, z: 134 };
export const HEDGE = { x: -61, z: 126 };
/** THE CLIPPERS, where they have been since the hedge was planted
 *  closed: on the ground at the foot of Val's porch steps, with the
 *  grass up through the handles.
 *
 *  AND EIGHT UNITS CLEAR OF WHERE SHE STANDS. A named person's talk
 *  place leans to within a third of a stride of the walker's feet
 *  (`npc.ts`), so a person inside four units wins every prompt there
 *  is. A thing of radius `r` therefore has to stand more than
 *  `4 + r` from anybody, or it cannot be pressed at all: the clippers
 *  were four units from her gate, then six, and PICK UP THE CLIPPERS
 *  could not be reached either time (the play of 2026-09-19). */
export const CLIPPERS = { x: -79.8, z: 130.4 };
/** Where Val stands when she is out at her gate. */
export const VAL_GATE = { x: -74.6, z: 136.8 };
/** THE FADED FOOTPRINTS, on the Common, going west past the well: the
 *  first of them, and the reveal the whole tier hangs on. They are seen
 *  from the chairs, through the gap, and they are walked to. */
export const PRINTS_COMMON = { x: -62.5, z: 76.4 };

/* ================== 5. BRACK. THE LAKE ============================ */

export const TARN = { x: 150, z: -195 };
/** THE BANK: the shingle at the north-west of the water, where the
 *  prints go in and the lantern was set down. */
export const BANK = { x: 140.6, z: -186.2 };
/** THE WOOD GATE, where the road comes in from Brim and where the
 *  lantern's bracket has been empty for three years. */
export const WOOD_GATE = { x: 64, z: -117 };
/** THE OVERGROWN WAY: the old cut from the round down to the bank,
 *  three years under bramble, on the line a foot takes. The clippers
 *  open it, and it is the one other place in the world they are for.
 *  It is NOT the only way down — the shore by the boat is still open —
 *  and Brack's line says so. A tool that only ever opens a door you
 *  cannot get through another way is a key, not a tool. */
export const THICKET = { x: 143.4, z: -171.6 };

/* ================== 6. HOLT. THE WATER ============================ */

/** The trestles, and the boat on them (the land's own numbers). */
export const TRESTLES = { x: 306, z: -234 };
/** THE HEAD OF THE CHANNEL: the cut he rigged, at the top of the dry
 *  bed, with the board out of it. */
export const CHANNEL = { x: 304.4, z: -250.4 };
/** Amos's rain-catch, on the Flats (the land's own numbers). */
export const CATCH = { x: 302, z: 95 };
/** The line the canyon stops at, which is where Holt stops. */
export const CANYON_EDGE = -101;

/**
 * HOLT'S WALK. He is drawn by the canyon while he is in it and by the
 * Flats once he is over the line; both read this, and the promise moves
 * it. He does not have a pace of his own: he keeps up with whoever is
 * walking him, which is the whole point of walking somebody somewhere.
 */
export const splitrock = {
  holt: {
    /** 'house' is his own day at the trestles; 'walk' is with you. */
    goal: 'house' as 'house' | 'walk',
    x: TRESTLES.x - 3.2,
    z: TRESTLES.z + 2.6,
    face: 1 as -1 | 1,
    /** Drawn this frame (the land sets it). */
    present: false,
    /** Moving, so the land draws the stride. */
    moving: false,
    /** He has stopped dead at his own border and is waiting to be asked
     *  again. Every companion in this world stops there; he is the
     *  first one anybody has ever asked twice. */
    atEdge: false,
    /** He has been asked again and is over the line. */
    crossed: false,
    /** He is at the catch, beside Amos. */
    arrived: false,
  },
};

/** THE PENWOOD's one light. `lit` is the gate's lantern burning; the
 *  land draws the flame and the pool of it on the road. */
export const penwood = {
  lantern: { lit: false, t: 0 },
};

/** MAPLE COURT: the shears going through the hedge, once, so the land
 *  can draw the cut being made and not only its result. */
export const maple = {
  cutting: 0,
};
