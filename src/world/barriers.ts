import type { Rect } from './layout';

/**
 * BARRIERS — what the walker cannot walk through, other than the page.
 *
 * Session 16, and it exists because a fence was a drawing. For fifteen
 * sessions the only thing on this sheet that refused a foot was the
 * page itself — deep water and ground too steep (`Terrain.blockedAt`),
 * which is right, because a world you navigate by looking should refuse
 * you with things you can see. A fence is a thing you can see. It has
 * stood along the Common's east seam since Session 2 and a walker has
 * walked through it since Session 2, because nothing in the game knew
 * it was there.
 *
 * The opening the owner chose (`THE-FUN-PASS` §11: THE BULL) needs a
 * gate to mean something: you run through it, Nell slams it, the bull
 * stops at the fence. A gate in a fence you can walk through anywhere
 * is a decoration. So the fence is a rule now — for the WALKER. The
 * bull's own rule is different and older (nobody crosses a border but
 * the walker) and lives in `company.ts`.
 *
 * A barrier is a segment with a thickness and any number of GAPS: a
 * stile, a gate. A gap can be shut (the gate, after Nell). App asks
 * `blocks(x, z)` in the same breath it asks the terrain, and a refused
 * step slides along the fence rather than sticking to it, exactly as it
 * does along a bank.
 *
 * What this must never become: an invisible wall. Every barrier here
 * is a drawing a land has stood up in the same place, and a land that
 * registers one without drawing it has broken the rule this file was
 * written to keep.
 */

export type Gap = {
  id: string;
  /** Where along the segment the gap is, and how wide (a radius). */
  x: number;
  z: number;
  r: number;
  /** A shut gap is a piece of fence. */
  open: boolean;
};

export type Barrier = {
  id: string;
  x0: number;
  z0: number;
  x1: number;
  z1: number;
  /** Half-thickness: how near the line a foot may come. */
  half: number;
  gaps: Gap[];
};

class Barriers {
  private list: Barrier[] = [];

  register(b: Barrier): Barrier {
    const have = this.list.find((o) => o.id === b.id);
    if (have) return have;
    this.list.push(b);
    return b;
  }

  get(id: string): Barrier | undefined {
    return this.list.find((o) => o.id === id);
  }

  gap(id: string): Gap | undefined {
    for (const b of this.list) {
      const g = b.gaps.find((o) => o.id === id);
      if (g) return g;
    }
    return undefined;
  }

  /** Is a foot at (x, z) inside a barrier and outside every open gap? */
  blocks(x: number, z: number): boolean {
    for (const b of this.list) {
      const dx = b.x1 - b.x0;
      const dz = b.z1 - b.z0;
      const len2 = dx * dx + dz * dz || 1;
      const u = Math.max(0, Math.min(1, ((x - b.x0) * dx + (z - b.z0) * dz) / len2));
      const px = b.x0 + dx * u;
      const pz = b.z0 + dz * u;
      if (Math.hypot(x - px, z - pz) > b.half) continue;
      /* A GAP IS A SLAB THROUGH THE WHOLE THICKNESS, not a disc: a
       * foot anywhere in the barrier's band within `r` of the gap
       * ALONG the barrier is through it. The first version was a disc
       * about the gap's centre, and a walker who came into the gate on
       * a diagonal stood on the disc's edge inside the band and could
       * not move on any axis. */
      const len = Math.sqrt(len2);
      const along = ((x - b.x0) * dx + (z - b.z0) * dz) / len;
      let through = false;
      for (const g of b.gaps) {
        if (!g.open) continue;
        const gAlong = ((g.x - b.x0) * dx + (g.z - b.z0) * dz) / len;
        if (Math.abs(along - gAlong) < g.r) {
          through = true;
          break;
        }
      }
      if (!through) return true;
    }
    return false;
  }

  /** Every barrier, for the harness and for nothing else. */
  get all(): readonly Barrier[] {
    return this.list;
  }
}

/** One instance, module scope, readable by anything — the same shape as
 *  `things.ts`, and for the same reason. */
export const barriers = new Barriers();

/** A rect's edge, as the line a creature bound to it will stop at. */
export function insetRect(r: Rect, m: number): Rect {
  return { minX: r.minX + m, maxX: r.maxX - m, minZ: r.minZ + m, maxZ: r.maxZ - m };
}
