/**
 * NOT YET — the lines of THE LIST whose promise is not built on the
 * story of record (`design/foundation/08` §9) yet: Tier 4 (Joan, the
 * man at the crossing, Dennis). Tier 3 (Amos, Pye, Wren) came off it
 * on 2026-09-24 (`tier3.ts`).
 *
 * Their steps from before the story contradicted it (Amos's night walk
 * was Holt's walk again; Pye's never rowed; Joan's table laid for
 * nobody). So until a tier is built, its lines are on the page and
 * pinned on the map, and nothing else: the person is there and talks,
 * gives no job, and their land's old card is not offered. A line here
 * is kept only by the list itself (Joan's) or crossed out by hand.
 *
 * **A tier's session deletes its three ids from this set** as the
 * first thing it does. No imports, on purpose: jobs, the talk and the
 * lands all read it.
 *
 * (The design audit's pick, 2026-09-24.)
 */

/** Line ids, which are also the person's npc id. */
export const NOT_YET = new Set<string>(['joan', 'the-man', 'dennis']);

/** The same six, by land. */
const LAND_OF: Record<string, string> = {
  amos: 'desert', pye: 'beach', wren: 'ocean', joan: 'downs', 'the-man': 'city', dennis: 'office',
};

/** Whether a land's promise is still waiting for its tier. */
export function notYet(land: string): boolean {
  for (const id of NOT_YET) if (LAND_OF[id] === land) return true;
  return false;
}
