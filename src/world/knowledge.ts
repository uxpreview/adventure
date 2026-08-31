import { ROADS, RIVER, SANDBAR } from './layout';

/**
 * KNOWLEDGE — the content system, and it is not an inventory.
 *
 * WORLD-SYSTEMS §6, and it replaced a collection loop for a reason
 * worth restating: **a collection caps at about two hours.** Whatever
 * the thing being collected is, the player learns nothing doing the
 * ninth one that they did not know at the third, and past that point it
 * is a checklist — the exact failure the quality bar already refuses.
 *
 * What runs long is knowing things. So the thing that accumulates in
 * this game is not an item and not a journal entry. It is
 *
 *   a **NAME**    — you have heard of a place
 *   a **FACT**    — you noticed something that is true
 *   a **ROUTE**   — you have actually been the whole way along something
 *   a **REASON**  — you worked out why
 *
 * and **places open because the player now knows what they are looking
 * at, not because a boolean flipped.** That distinction is the whole
 * design and it is enforceable: every id in here is a phrase a human
 * could read out, and a region builder asks `knowledge.has(...)` in the
 * present tense — *does the walker know this* — rather than being told
 * *has quest 7 stage 3 completed*.
 *
 * ── THE THREE THINGS THIS FILE MUST NOT BECOME ─────────────────────
 *
 *  1. **A CHECKLIST** (QUESTS §7). There is no count, no list, no
 *     percentage, and no way for a player to know they have them all.
 *     `size` deliberately does not exist on this class; the only reader
 *     of the raw set is the save file, and the save file does not draw
 *     anything. If a later session finds itself writing "3 of 12"
 *     anywhere in the UI, this system has been misused.
 *  2. **A GATE.** Nothing in this world locks. A player who walks
 *     straight to the Cubicle Mile in the first ten minutes finds a
 *     stop, a timetable and a man called Dennis, and none of it means
 *     anything yet, and that is the game working (QUESTS Tier 0).
 *  3. **A NOTIFICATION.** Nothing announces a piece of knowledge.
 *     There is no toast, no chime, no "you have learned". The world
 *     simply does the thing, later, somewhere else, when you turn up
 *     holding it.
 *
 * ── WHAT READS IT ──────────────────────────────────────────────────
 *
 *  · `ui/map.ts` — **the map is the record.** Pencil for what you have
 *    heard about, ink for what you have walked. It has drawn in both
 *    registers since Session 1 and only ever had two states to say it
 *    with; now it has three.
 *  · the region builders — Brim asks whether the walker knows why the
 *    market never opened, every frame, and sets a stall out accordingly.
 */

export type Kind = 'name' | 'fact' | 'route' | 'reason';

/** `${Kind}:${slug}` — always readable, always specific. */
export type Known = string;

/* ------------------------------------------------------------------ *
 * ROUTES — the one kind of knowledge you cannot be told.
 *
 * A NAME can come off a signpost and a FACT can come off a look, but a
 * ROUTE means you went the whole way, and the only honest way to know
 * that is to have watched somebody do it. So a route is a line of
 * POSTS: authored points along the thing, each one marked off when the
 * walker comes within reach of it, and the route is known when there
 * are none left.
 *
 * It is a checklist, and it is invisible, and those two facts are not
 * in tension: QUESTS §7 forbids the PLAYER a count. The bookkeeping is
 * ours.
 * ------------------------------------------------------------------ */

export type Route = {
  id: Known;
  /** How near a post you have to pass for it to count. */
  reach: number;
  posts: [number, number][];
};

/** Every nth point of a polyline, ends always kept. */
function posts(pts: [number, number][], step: number): [number, number][] {
  const out: [number, number][] = [];
  for (let i = 0; i < pts.length; i += step) out.push(pts[i]);
  const last = pts[pts.length - 1];
  const tail = out[out.length - 1];
  if (!tail || tail[0] !== last[0] || tail[1] !== last[1]) out.push(last);
  return out;
}

/** The king's road / main street / commuter spur chain, in order. */
const LINE_ROADS = ROADS.filter((r) => r.line);

export const ROUTES: Route[] = [
  {
    /**
     * THE LINE. Castle gate to car park, twelve names, one road
     * (STORY §4). You do not learn this from anybody, because nobody
     * in this world could tell you: they cannot cross a border and it
     * crosses eleven.
     *
     * The posts stop at the junction in Maple Court where the king's
     * road hands over to main street — the road's own last stretch,
     * out to the world's south rim, is NOT the line. It is where the
     * survey was going before it turned, and it is sixteen units short
     * of the edge of the world, and nothing in this game will ever say
     * so (THE-STRANGERS.md, U31).
     */
    id: 'route:the-line',
    reach: 15,
    posts: [
      ...LINE_ROADS[0].pts.filter(([, z]) => z <= 201),
      ...LINE_ROADS[1].pts.slice(1),
      ...LINE_ROADS[2].pts.slice(1),
    ] as [number, number][],
  },
  {
    /** Salt to source, under all three bridges. Session 6's rowboat is
     *  the only way to hold this one. */
    id: 'route:the-river',
    reach: 20,
    posts: posts(RIVER, 3),
  },
  {
    /** A hundred and eighty units of dry paper going out. The one thing
     *  in THE WIDE BLUE that is not water. */
    id: 'route:the-bar',
    reach: 18,
    posts: posts(SANDBAR, 2),
  },
  {
    /**
     * THE FOLD — and it is a FACT rather than a route, which is the one
     * id in this file whose prefix does not match its mechanism, on
     * purpose.
     *
     * `THE-WAITS` §0 has said since Session 7 that THE BLEACH FLATS turn
     * on `fact:the-fold`, *earned by walking the crease, both faces*, and
     * until Session 11 there was no such id anywhere in the source and
     * nothing that taught it: Amos's wait had a dependency nobody had
     * built. Session 10's Penwood earned its fact by ARRIVAL — twenty
     * units of proximity, no note, no prompt — and that is the cheapest
     * honest mechanism this project has. It does not fit here, because
     * **a fold has two sides and the whole of the fact is that you have
     * been on both of them.** A proximity test cannot say that. Two
     * posts can, and they are the only honest way to say it.
     *
     * So the KIND is a fact (you noticed something that is true) and the
     * MECHANISM is a route (you went there). It is spelled `fact:` because
     * the id is the thing a region builder reads in the present tense and
     * because a human reading `knowledge.has('fact:the-fold')` in the
     * Bleach Flats should understand it without coming here.
     *
     * The two posts are the crease's two shoulders at z = 45, which is
     * where the east road dives through the fold (`elevation.ts`,
     * `foldX(45) ≈ 84.7`, and `check-terrain` prints the profile). They
     * are twelve units either side of the bottom, with a reach of eleven,
     * so a walker who goes down one face and up the other collects both
     * and a walker who skirts the fold collects neither.
     *
     * **NOTHING MARKS THEM AND NOTHING WAS BUILT FOR THEM.** They add no
     * geometry to THE COMMON and none to THE HARROW DOWNS — which is
     * deliberate twice over, because both of those lands hold verdicts
     * and `crease-east-road` is a protected framing standing sixteen
     * units from the southern post.
     */
    id: 'fact:the-fold',
    reach: 11,
    posts: [[72.7, 45], [96.7, 45]],
  },
];

/* ------------------------------------------------------------------ */

class Knowledge {
  private set = new Set<Known>();
  /** Route posts already passed, keyed `${routeId}#${index}`. */
  private passed = new Set<string>();

  /** Restore from the save. Nothing else may write these wholesale. */
  load(known: string[], passed: string[]) {
    this.set = new Set(known);
    this.passed = new Set(passed);
    this.settle();
  }

  /** For the save file, and for nothing else. */
  get saved() {
    return { known: [...this.set], passed: [...this.passed] };
  }

  has(id: Known): boolean {
    return this.set.has(id);
  }

  /** True if this was new. Callers use that to make a noise ONCE. */
  learn(id: Known): boolean {
    if (this.set.has(id)) return false;
    this.set.add(id);
    this.dirty = true;
    return true;
  }

  /**
   * WHAT THE MAP DRAWS A LAND IN.
   *
   *   'seen'    you have stood in it            → ink
   *   'heard'   somebody named it to you        → pencil
   *   'unknown' nothing                         → a question mark
   */
  register(regionId: string, discovered: string[]): 'seen' | 'heard' | 'unknown' {
    if (discovered.includes(regionId)) return 'seen';
    return this.set.has(`name:${regionId}`) ? 'heard' : 'unknown';
  }

  /** Set when anything changed, so App can persist without polling. */
  dirty = false;

  /**
   * Walk the routes. Called with the walker's position — on foot or
   * under oar, because rowing the river IS walking it for this purpose
   * and that is the entire point of a mount.
   */
  travel(x: number, z: number) {
    for (const route of ROUTES) {
      if (this.set.has(route.id)) continue;
      const r2 = route.reach * route.reach;
      for (let i = 0; i < route.posts.length; i++) {
        const key = `${route.id}#${i}`;
        if (this.passed.has(key)) continue;
        const [px, pz] = route.posts[i];
        const dx = x - px;
        const dz = z - pz;
        if (dx * dx + dz * dz < r2) {
          this.passed.add(key);
          this.dirty = true;
        }
      }
      this.complete(route);
    }
  }

  /** A route with no posts left is a route you have been. */
  private complete(route: Route) {
    for (let i = 0; i < route.posts.length; i++) {
      if (!this.passed.has(`${route.id}#${i}`)) return;
    }
    if (!this.set.has(route.id)) {
      this.set.add(route.id);
      this.dirty = true;
    }
  }

  /** After a load: a save from before routes existed still has posts. */
  private settle() {
    for (const route of ROUTES) this.complete(route);
  }
}

/**
 * ONE INSTANCE, MODULE SCOPE, READABLE BY ANYTHING — the same shape as
 * `daylight.ts`'s clock, and for the same reason. A region builder that
 * wants to know whether the walker has worked out why the market never
 * opened should be able to ask, in one import, without a plumbing
 * session through twelve builders and an App.
 */
export const knowledge = new Knowledge();
