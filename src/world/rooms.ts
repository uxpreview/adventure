import type { RegionId, Rect } from './layout';

/**
 * ROOMS — the roofless cutaway (Session 23, `WORLD-SYSTEMS` §11).
 *
 * An interior in this world is not a scene, a load or a second sheet.
 * It is a DRAWING CONVENTION: a plan and an elevation on the same page,
 * which is what a draughtsman does and puts the whole thing in craft
 * and nowhere near subject (§0). You walk in through the door, and the
 * front of the house goes to pencil, and the room is drawn where the
 * house was standing: the floor as a plan, the far wall as an
 * elevation, the two side walls edge-on. Three or four objects and a
 * person. Walk out and the house is a house again.
 *
 * §11 said the camera was the cost, and it was: the rig trails thirteen
 * units, wider than most rooms, and the front wall stands exactly
 * between the lens and the walker. This file is the part that has to
 * KNOW — which room the walker is in, and how far in — so that the
 * land can fade its own front wall, App can close the rig, and both do
 * it at a rate a stomach can take. Four rules, and they are the whole
 * of what an interior is here:
 *
 *   1. A ROOM OPENS SOUTH. Its door is in its south wall and the ground
 *      south of it is open, because the camera stands there. A room
 *      whose door faces any other way cannot be looked into.
 *   2. A ROOM IS INSIDE ITS LAND. A person drawn in it is in their
 *      land, and nobody crosses a border but the walker.
 *   3. A ROOM IS FLAT GROUND. Inside, the rig's rise term reads zero:
 *      the ridge behind the loft is not in the picture while the loft
 *      is.
 *   4. EVERY WALL IS A DRAWING AND A BARRIER. The side walls are
 *      standees turned edge-on and registered solid; the front wall is
 *      the house's own footprint with a door left in it. There is no
 *      wall here a foot cannot see.
 *
 * ── WHAT THIS FILE MUST NOT BECOME ─────────────────────────────────
 *
 * A house. `WORLD-SYSTEMS` §11: no construction, no furnishing, no
 * decorating menu. A room is authored by its land the way a place is,
 * and the walker changes nothing in it that a touch does not.
 */

export type RoomDef = {
  /** Readable: `vals-front-room`. */
  id: string;
  land: RegionId;
  /** What the small card says under the land's name: `val's front room`. */
  name: string;
  /** The floor. The south edge is the front wall's line; the door is
   *  a gap in that wall, at `door.x`. */
  rect: Rect;
  door: { x: number; r: number };
};

class Rooms {
  private list: RoomDef[] = [];
  /** Per room, how far in the walker is drawn to be: 0 outside, 1
   *  inside, eased between at a rate the camera sets. */
  private k = new Map<string, number>();
  /** The room the walker is standing in, or nothing. */
  inside: RoomDef | null = null;
  /** The camera's blend: the deepest of them. */
  camK = 0;

  register(def: RoomDef): RoomDef {
    const have = this.list.find((r) => r.id === def.id);
    if (have) return have;
    this.list.push(def);
    this.k.set(def.id, 0);
    return def;
  }

  get(id: string): RoomDef | undefined {
    return this.list.find((r) => r.id === id);
  }

  get all(): readonly RoomDef[] {
    return this.list;
  }

  /** Which room a foot at (x, z) is in. */
  at(x: number, z: number): RoomDef | null {
    for (const r of this.list) {
      const q = r.rect;
      if (x >= q.minX && x <= q.maxX && z >= q.minZ && z <= q.maxZ) return r;
    }
    return null;
  }

  /** How far in, 0..1, for the land to fade its front wall and draw
   *  its room by. */
  blend(id: string): number {
    return this.k.get(id) ?? 0;
  }

  /**
   * One frame. `rate` is how fast a blend may move, per second — App
   * sets it from how far the rig will dolly for this room, so the
   * camera never closes faster than the walker walks (`check-camera`'s
   * ceiling, 4.1 units a second, kept with the same margin the astern
   * keeps it at).
   */
  tick(dt: number, x: number, z: number, rate: number) {
    this.inside = this.at(x, z);
    let top = 0;
    for (const r of this.list) {
      const want = this.inside === r ? 1 : 0;
      const cur = this.k.get(r.id) ?? 0;
      const step = Math.max(-rate * dt, Math.min(rate * dt, want - cur));
      const next = Math.max(0, Math.min(1, cur + step));
      this.k.set(r.id, next);
      if (next > top) top = next;
    }
    this.camK = top;
  }
}

/** One instance, module scope, readable by anything — the same shape as
 *  `things.ts`, and for the same reason. */
export const rooms = new Rooms();
