/**
 * A RIDE IN SOMEBODY ELSE'S BOAT (Tier 3, `design/foundation/08` §9,
 * promises 8 and 9).
 *
 * Pye's boat and Wren's punt are theirs, not a mount: they are not
 * found and left in the world the way the rowboat is (`engine/Boat.ts`),
 * and neither of them goes anywhere but out on one bearing and back on
 * it. So they are a RIDE: the walker sits in the bow and the boat keeps
 * to its line. Either its owner rows — you asked them to — or you pull,
 * and every push of the stick or press of the key is a stroke. Nobody
 * steers. A bearing is the whole of the thing.
 *
 * `tier3.ts` moves it; the lands draw the boat under it; App puts the
 * walker in it and turns the stick into a pull. No imports, on purpose.
 */

export type RideOwner = 'pye' | 'wren';

export const ride = {
  /** Aboard. */
  on: false,
  /** Whose boat. */
  who: 'pye' as RideOwner,
  /** Who is rowing: its owner, or the walker. */
  rower: 'them' as 'them' | 'you',
  /** Where the walker sits this frame. */
  x: 0,
  z: 0,
  /** Which way the bow points, as the walker's heading (radians). */
  heading: 0,
  /** Where a page saved mid-row puts the walker again: the sand the
   *  boat went out from. Nobody wakes up on the open sea. */
  home: { x: 0, z: 0 },
  /** App writes it every frame: how hard the stick is pushed, 0 to 1.
   *  Any way at all is a pull; a bearing is not steered. */
  pull: 0,
  /** The boat is under way this frame (an oar is in the water). */
  moving: false,
};
