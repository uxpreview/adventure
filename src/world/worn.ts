import type { RegionId } from './layout';
import { knowledge } from './knowledge';

/**
 * WORN THINGS — what the walker has on, and where it came from
 * (Session 22, the owner's ask: *cosmetic items the player equips and
 * acquires through the story, e.g. a crown*).
 *
 * The law has one slot in the hand (`things.ts`: one id or nothing, no
 * inventory, no screen) and this is the second slot, on the head or
 * round the neck, and it is built the same way for the same reasons.
 * A worn thing is NOT a thing: it has no position on the page, it is
 * not thrown, it does not stop at a border — it is on the walker, and
 * the walker is the one body that crosses. What it is instead is a
 * piece of KNOWLEDGE, which is what the inventory in this game has
 * always been (`WORLD-SYSTEMS` §6):
 *
 *   a **WEAR**   — `wear:the-crown`: you took it, and it is yours to
 *                  put on, in every later save
 *
 * The id is learned at the moment the walker takes the thing, by a
 * touch, in the land that had it — and every one of them costs that
 * land something visible and permanent, the way a door does: the king
 * is bare-headed for good, the hat does not run the coast road any
 * more. Nothing here is a reward. Nothing counts them, nothing lists
 * them to the player, and nothing anywhere says which to wear.
 *
 * ── WHAT THIS FILE MUST NOT BECOME ─────────────────────────────────
 *
 * A wardrobe. `current` is one id or null. The only control is one
 * lettered button in the HUD, beside `map` and `sound`, that goes round
 * what has been earned — nothing, then each in the order it was taken
 * — and it is not on the page at all until the first thing is. There
 * is no screen, no grid, no preview, no rarity, no set.
 */

export type WornSlot = 'head' | 'neck';

export type WornDef = {
  /** Readable, like everything else: `the-crown`. The knowledge id is
   *  `wear:` + this. */
  id: string;
  /** How the world names it: `THE CROWN`, `HIS CROWN`. */
  name: string;
  /** The land it was taken from, for the record and for nothing else. */
  land: RegionId;
  slot: WornSlot;
  /** The drawing's size on the walker, in world units, and how far up
   *  from the slot's anchor its bottom edge sits. */
  w: number;
  h: number;
  dy?: number;
};

/** THE FOUR, in no order that means anything. Their drawings are in
 *  `textures-worn.ts`; the lands that hand them over are the crown at
 *  Greyweather, the hat on Longshore's coast road, the lanyard in the
 *  Cubicle Mile's atrium and the helm on the foreshore under the
 *  Holdfast. */
export const WORN: WornDef[] = [
  { id: 'the-crown', name: 'THE CROWN', land: 'castle', slot: 'head', w: 0.42, h: 0.3, dy: -0.06 },
  { id: 'the-hat', name: 'THE HAT', land: 'beach', slot: 'head', w: 0.62, h: 0.42, dy: -0.1 },
  { id: 'the-lanyard', name: 'THE LANYARD', land: 'office', slot: 'neck', w: 0.34, h: 0.42, dy: -0.36 },
  { id: 'the-helm', name: 'THE HELM', land: 'ocean', slot: 'head', w: 0.5, h: 0.4, dy: -0.12 },
];

export const wearId = (id: string) => `wear:${id}`;

class Worn {
  /** THE ONE SLOT. An id, or nothing. */
  current: string | null = null;
  /** Set when `current` changed, so App dresses the walker and saves
   *  without polling. */
  dirty = false;
  /** The order things were taken in, for the button to go round; the
   *  save's `known` is a set and keeps no order, so a loaded page goes
   *  round in the registry's order, which is fine. */
  private order: string[] = [];

  def(id: string | null): WornDef | null {
    return id ? WORN.find((w) => w.id === id) ?? null : null;
  }

  has(id: string): boolean {
    return knowledge.has(wearId(id));
  }

  /** Everything the walker has earned, in the order it was earned. */
  owned(): WornDef[] {
    const out: WornDef[] = [];
    for (const id of this.order) { const d = this.def(id); if (d && this.has(id)) out.push(d); }
    for (const d of WORN) if (this.has(d.id) && !out.includes(d)) out.push(d);
    return out;
  }

  /** TAKE IT: learn it, and put it on at once — the first time you hold
   *  a thing you took, you are wearing it. True if it was new. */
  take(id: string): boolean {
    if (!this.def(id)) return false;
    const fresh = knowledge.learn(wearId(id));
    if (fresh) this.order.push(id);
    this.put(id);
    return fresh;
  }

  /** Put on something earned, or nothing. */
  put(id: string | null) {
    if (id !== null && !this.has(id)) return;
    if (id === this.current) return;
    this.current = id;
    this.dirty = true;
  }

  /** The button's press: nothing, then each earned thing, round again. */
  next() {
    const list = this.owned().map((d) => d.id);
    if (!list.length) return;
    const i = this.current ? list.indexOf(this.current) : -1;
    this.put(i + 1 >= list.length ? null : list[i + 1]);
  }

  /** From the save: a worn id is honoured only if it is still earned. */
  load(id: string | null) {
    this.current = id && this.has(id) ? id : null;
    this.dirty = true;
  }
}

/** One instance, module scope, readable by anything — the same shape as
 *  `things`, and for the same reason. */
export const worn = new Worn();
