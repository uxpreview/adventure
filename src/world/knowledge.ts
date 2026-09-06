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

/**
 * AND FROM SESSION 15, A DOOR (`THE-FUN-PASS.md` §6).
 *
 *   a **DOOR**    — you chose, at a moment that mattered, and the world
 *                   did one of two things because of it
 *
 * A door is a piece of knowledge with a name a human could read, the
 * same as a fact: `door:the-king-restored` is a thing the walker did
 * and the castle reads it in the present tense every frame, exactly as
 * Brim reads `reason:brim`. The choice card (`ui/UI.ts`) writes to this
 * set and to nothing else — there is no second store of choices, no
 * flag, no "quest state". A door taken is a door taken in every later
 * save, and **nothing anywhere says which door was right** (§6, rule
 * three; it is `STORY.md` §8 rule 5 extended to the doors).
 */
export type Kind = 'name' | 'fact' | 'route' | 'reason' | 'door';

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

/* ================================================================== *
 * THE TWELVE WAITS, AND WHAT ANSWERING ONE LOOKS LIKE FROM HERE.
 *
 * Session 14, and it is the only place in the source where the twelve
 * are written down as twelve. `THE-WAITS.md` §13 is the list; this is
 * the id each one resolves into, in that land's own words, about that
 * land only. Nobody generalises and nothing points at the rhyme.
 *
 * **Three of them are missing, and the gap is honest**: GREYWEATHER's
 * WICK, LONGSHORE's PYE and THE WIDE BLUE's WREN are written and not
 * built (`THE-WAITS` §14 has them on ground that is already WOWED;
 * Session 19's). THE COMMON's NELL is built, Session 16, with two
 * doors from the start. A land with no
 * entry has a platform that is always empty, which is exactly what an
 * unanswered wait looks like and costs nothing to be honest about.
 *
 * Nothing anywhere in the game counts these, shows these, or tells the
 * player there are twelve of them.
 * ================================================================== */
export const WAIT_ANSWERS: Partial<Record<string, Known>> = {
  /** MARGET: the market never opened because of an argument about an
   *  hour. Still learned at the cross holding the hour (Session 7's
   *  mechanic, kept); from Session 21 the belfry is a card as well —
   *  let the bell ring it, or set the clock to either hand — and two of
   *  the three doors learn this, because under two of them she opens.
   *  Under the third the market is called and she never does. */
  kingdom: 'reason:brim',
  /** WICK (Session 19): Brim's red came up the avenue, and a fifth
   *  banner went up. The second door — the king back on his plinth —
   *  is a door and not an answer: Wick is relieved of duty, and his
   *  platform is empty for a different reason (`THE-FUN-PASS` §6). */
  castle: 'reason:the-fifth-banner',
  /** PYE (Session 19): the mark's name came back from the Wide Blue,
   *  and an eighth pot went out on a bearing he has never rowed. The
   *  second door — the pots hauled — takes the shape of his day. */
  beach: 'door:the-eighth-pot',
  /** WREN (Session 19): the bar was walked to its end, and a second
   *  mark went down there. Two marks make a line; the fleet is under no
   *  obligation to use it. The second door calls the finish, once, and
   *  the fleet stops racing, and Wren is the reason there was a fleet. */
  ocean: 'door:the-second-mark',
  /** BRACK: the tarn, and the road that is his circle. Earned by
   *  arriving at the water, or by the card's first door, which is the
   *  same thing said out loud (Session 21). The second door — the oar
   *  out of the boat — is a door and not an answer: he keeps facing the
   *  water, and now he has a reason. */
  forest: 'fact:the-tarn',
  /** HOLT (Session 21): the river that left is running forty units
   *  away — and from this session it is told to him at the trestles,
   *  on a card, and the boat comes off them on the door. The second
   *  door tells him the sea has no bottom; he stops oiling and the
   *  marks weather. `route:the-river` opens the card and answers
   *  nothing by itself any more. */
  canyon: 'door:the-boat-righted',
  /** AMOS (Session 21): the water was always coming from somewhere on
   *  this sheet — and the lid comes off on a card now, at the catch,
   *  holding the fold. The second door fills the cistern from the
   *  oasis by hand, once, in daylight; he stops carrying and the track
   *  grows over, and that is a door and not an answer. */
  desert: 'door:the-lid-off',
  /** JOAN HARROW: a place kept for nobody was always a place kept for
   *  anybody. **She is not on the platform** — see `Eight15.ts`. */
  downs: 'fact:the-place-kept',
  /** VAL (Session 20): one land can be seen from another, if somebody
   *  cuts a hedge — and from this session the cut is a door, taken at
   *  the three chairs with the castle's name. The second door turns her
   *  light off, and is a door and not an answer: the street goes dark a
   *  house a day, and her platform stays empty (`THE-FUN-PASS` §6). */
  neighborhood: 'door:the-gap-cut',
  /** THE MAN AT THE JUNCTION: somebody has been waiting to be asked. */
  city: 'fact:the-man-at-the-junction',
  /** DENNIS: there is a list, and the twelve are on it, in order. */
  office: 'fact:the-timetable',
  /** NELL (Session 16): one of the four roads is not a road. Answered
   *  by the FIRST door only — the fourth name brought back to the gate,
   *  the cart loaded and turned north. The second door (the cart
   *  pushed to a border yourself) is a door and not an answer: Nell
   *  had the option and now has a cart at a border, and her platform
   *  stays empty. `THE-FUN-PASS` §6, and Session 21 reads it back. */
  meadow: 'door:the-cart-turned-north',
};

/**
 * THE DOORS, LAND BY LAND (Session 21, `THE-FUN-PASS` §6).
 *
 * Every wait has two doors on a card now, and this is the only place
 * in the source where they are written down against their lands. Two
 * readers and no more: `decided` below, which is how the 8:15 knows a
 * wait has been DECIDED rather than completed — a walker who took the
 * second door at every gate in the world has made twelve decisions and
 * the ending has to come and read them — and `Eight15.ts`, which asks
 * which door was taken to know who is standing on a platform, or what
 * is standing there instead, or nothing. Nothing counts these, shows
 * these, or grades them; a door taken is a door taken.
 *
 * A land whose first door is its answer lists that door too, so the
 * list is honest about the whole card. GREYWEATHER's first door is not
 * a door at all — Brim's red comes up the avenue and the fifth banner
 * goes up by arrival — and its `door:the-king-left` changes nothing, so
 * only the one that relieves Wick is here.
 */
export const WAIT_DOORS: Record<string, Known[]> = {
  kingdom: ['door:the-bell-rings-it', 'door:the-clock-set-to-eight', 'door:the-clock-set-to-eleven'],
  castle: ['door:the-king-restored'],
  beach: ['door:the-eighth-pot', 'door:the-pots-hauled'],
  ocean: ['door:the-second-mark', 'door:the-fleet-finished'],
  forest: ['door:the-water-stood', 'door:the-oar-taken'],
  canyon: ['door:the-boat-righted', 'door:the-sea-has-no-bottom'],
  desert: ['door:the-lid-off', 'door:the-cistern-yours'],
  downs: ['door:the-seat-taken', 'door:the-setting-cleared'],
  neighborhood: ['door:the-gap-cut', 'door:the-light-off'],
  city: ['door:the-stood-with', 'door:the-walked-round'],
  office: ['door:the-board-wiped', 'door:the-corner-pressed'],
  meadow: ['door:the-cart-turned-north', 'door:the-cart-pushed'],
};

/**
 * HOW MANY WAITS THE 8:15 NEEDS, AND WHY IT IS NOT SEVEN.
 *
 * `THE-LINE.md` §4.1 proposed seven, against twelve waits, and said in
 * the same breath that **seven is an implementation constant and not a
 * fact about the fiction.** Eight of the twelve exist in the source
 * today, so a threshold of seven would put somebody on almost every
 * platform in the game — and IV.3 is only an ending because the
 * platforms DIFFER. Five leaves room for the ending to be the player's
 * rather than the author's.
 *
 * It went back to seven in Session 19, when the last three were built:
 * eleven of the twelve now exist in the source (JOAN's is the one
 * that resolves by sitting and never puts her on a platform). It is
 * never shown anywhere, to anybody, in any form (QUESTS §7).
 *
 * **And from Session 21 it counts waits DECIDED, not waits answered**
 * (`decidedWaits` below): a second door is a decision about a wait as
 * much as the first is, and `THE-FUN-PASS` §6's last rule — the ending
 * reads the doors — is only true if the ending comes for a walker who
 * chose the other way. The threshold is the same number.
 */
export const WAITS_FOR_THE_LINE = 7;

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

  /** The first known id under a readable prefix, or null — for the one
   *  fact whose id carries a day in it (Session 20: the day Val's light
   *  went off, so the street can go dark a house a day from it). Not a
   *  count and not a list; one id, read back. */
  first(prefix: string): string | null {
    for (const id of this.set) if (id.startsWith(prefix)) return id;
    return null;
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

  /**
   * HOW MANY OF THE TWELVE WAITS THIS WALKER HAS ANSWERED.
   *
   * **This is the only count in the content system and it is read by
   * exactly one caller** (`Eight15.ts`, to decide whether the 8:15
   * comes at all). It is not exposed to the UI, it is not saved, it is
   * not rendered, and nothing in the game will ever draw it — which is
   * the same bargain §0 of this file already struck for route posts:
   * the player gets no count; the bookkeeping is ours.
   */
  answeredWaits(): number {
    let n = 0;
    for (const id of Object.values(WAIT_ANSWERS)) if (id && this.set.has(id)) n++;
    return n;
  }

  /** Whether this land's wait is answered — its first door, as
   *  designed. The 8:15 reads this AND the doors (`Eight15.ts`). */
  answered(regionId: string): boolean {
    const id = WAIT_ANSWERS[regionId];
    return !!id && this.set.has(id);
  }

  /** Whether this land's wait has been DECIDED — answered, or a door
   *  taken at its card, either one (Session 21). */
  decided(regionId: string): boolean {
    if (this.answered(regionId)) return true;
    for (const id of WAIT_DOORS[regionId] ?? []) if (this.set.has(id)) return true;
    return false;
  }

  /** How many of the twelve are decided. The 8:15's threshold reads
   *  this and nothing else does (Session 21; the same bargain as
   *  `answeredWaits`: the bookkeeping is ours, the player gets no
   *  count). */
  decidedWaits(): number {
    let n = 0;
    for (const land of Object.keys(WAIT_DOORS)) if (this.decided(land)) n++;
    return n;
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
