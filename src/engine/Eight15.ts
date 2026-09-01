import * as THREE from 'three';
import {
  railcarSideTexture, railcarFrontTexture, platformFigureTexture,
} from '../world/textures-office';
import { LINE_STOPS, LINE_STOP_S, LINE_LENGTH, lineAt } from '../world/layout';
import { knowledge, WAITS_FOR_THE_LINE } from '../world/knowledge';
import { clock } from '../world/daylight';

/**
 * THE 8:15 — the last mount, and the world's ending.
 *
 * `design/THE-LINE.md` §4 is settled and this builds it. Nothing here
 * re-opens §5, and the two things §3.4 forbids are absent by
 * construction: **nobody in this world holds Act III's fact** (there is
 * no dialogue anywhere in this file and Dennis is not told anything),
 * and **nothing takes the controls** (there is no camera move in here;
 * getting on is a choice you make at an open door and getting off is
 * another one).
 *
 * ── WHAT STARTS IT ──────────────────────────────────────────────────
 *
 * Knowledge, and nothing else (QUESTS Tier 0: no hard locks). Two
 * things, and both are things the player DID:
 *
 *   1. `route:the-line` — they have walked it, all three roads, gate to
 *      car park, and they are the only thing in this world that ever
 *      has, because everybody else stops at their own border;
 *   2. the answers to enough of the twelve waits
 *      (`knowledge.WAITS_FOR_THE_LINE`, and the number is never shown
 *      anywhere to anybody).
 *
 * Then the next time the world's clock passes a quarter past eight in
 * the morning, it comes. The day is forty minutes long, so a player who
 * is playing at all meets the next 8:15 within forty minutes of
 * qualifying and never at a moment somebody chose for them.
 *
 * ── WHAT IT DOES ────────────────────────────────────────────────────
 *
 * It comes down the line from the gate and **it stops twelve times**
 * (`layout.LINE_STOPS`, which is the timetable in the case at THE 8:15
 * STOP). At every land whose wait the player answered, somebody is on
 * the platform and is gone when it leaves; at the ones they did not,
 * the doors stand open the same time and it goes on. Nothing is
 * announced, nothing is counted, and no screen anywhere tells anybody
 * how many platforms had somebody on them.
 *
 * **THE HARROW DOWNS' platform is always empty** (§4.4): Joan Harrow's
 * harvest came in and she never needed a train. She is the only person
 * in the world who does not have to leave to get what she was waiting
 * for, and nothing anywhere says so.
 *
 * **And it arrives already carrying the lands above you.** That is
 * `critique-story-2.md`'s second mandatory finding — *the ending's
 * default witness sees one stop*, so the likeliest single ending in
 * this game was a train stopping at an empty platform — and the fix it
 * asked for, exactly: the windows hold one figure for every stop north
 * of here that had somebody get on. No new content and no change to the
 * ending.
 *
 * ── HOW IT IS DRAWN ─────────────────────────────────────────────────
 *
 * Two aspects, both facing the camera, because nothing on this sheet
 * has ever been anything but a cutout facing you (`Boat.ts`, Session 6,
 * and Session 5's hardest-won gotcha: *a flat quad that runs away from
 * the camera is invisible*). The camera only ever looks north, so:
 *
 *   · running the north–south leg it is drawn FRONT ON — which is what
 *     a thing coming down a road you are looking along actually is;
 *   · on the east–west legs, at every stop, and whenever you are in it,
 *     it is drawn BROADSIDE, which is what a train at a platform is.
 *
 * *A train you are watching is going somewhere; a train you are in is a
 * room.*
 */

/** How fast it runs, in units a second. The walk is 4.1 and the run is
 *  about 7: this is a mount and it is meant to be quick, but it also has
 *  to be a thing you SEE coming down a two-hundred-unit straight. */
const SPEED = 34;

/**
 * HOW LONG THE DOORS STAND OPEN.
 *
 * `THE-LINE` §4.2 says *about half a minute*, and half a minute times
 * twelve stops is six minutes of standing still with the ride on top of
 * it, which turns the ending into an errand. Thirteen seconds is long
 * enough to be unmistakably a WAIT — you can walk the length of the
 * train and back inside it — and it puts the whole run at about two and
 * three quarter minutes. The number is written down here rather than
 * quietly rounded in the prose.
 */
const DWELL = 13;

/** How near an open door you have to be to get on. */
const BOARD_REACH = 6.5;

/** Which drawing each land's one passenger is (`platformFigureTexture`),
 *  so a walker who met somebody recognises what they are carrying. */
const CARRIES: Record<string, number> = {
  kingdom: 0,      // Marget, and a bolt of cloth over the arm
  castle: 1,       // Wick, and the banner still rolled
  beach: 2,        // Pye, and a coil of rope
  ocean: 2,        // Wren, the same, from further out
  forest: 3,       // Brack, and the stick is a habit
  canyon: 3,       // Holt, the same, on drier ground
  desert: 4,       // Amos, and the two cans he carries every night
  meadow: 5,
  neighborhood: 5,
  city: 5,
  office: 5,
  downs: 5,        // and she is never on it
};

type Phase = 'away' | 'running' | 'dwelling' | 'ended';

/**
 * WHO IS ON A PLATFORM RIGHT NOW, for the lands to read.
 *
 * Module scope and one instance, the same shape as `daylight.ts`'s
 * clock and `knowledge.ts`'s set, and for the same reason: a region
 * builder should be able to ask without a plumbing run through twelve
 * builders.
 *
 * **It exists to stop anybody being in two places at once.** The 8:15
 * draws whoever is waiting at the stop it is standing in, and at four
 * of the twelve stops that is within a few units of where that land's
 * own drawing of them stands — the man at the junction is eight units
 * from GREYLINE's stop and Dennis is five from the Cubicle Mile's. So
 * while the doors are open, the land does not draw its own person: they
 * are on the platform, which is where the game has just put them.
 *
 * **The departure is not permanent, and this session says so out loud
 * rather than quietly.** When the doors shut they are back where they
 * stand. Making it permanent is one clause per land — the routines are
 * already gated on the hour and on knowledge — but it re-opens the
 * authored routine of seven lands that hold verdicts, and `THE-LINE`
 * §5 does not require it. It is in `SESSIONS.md` as the one thing the
 * ending does not yet do.
 */
export const platform: { land: string | null } = { land: null };

export class Eight15 {
  group = new THREE.Group();
  /** Where it is on the line, in units from the castle gate. */
  s = 0;
  aboard = false;
  phase: Phase = 'away';
  /** The stop it is at or heading for. */
  stop = 0;
  /** How many lands' people are on it. Drawn in the windows. */
  carrying = 0;
  /** True on the frame the doors open, for the one sound it makes. */
  justOpened = false;

  private side: THREE.Mesh;
  private front: THREE.Mesh;
  private sideMat: THREE.MeshBasicMaterial;
  private cache = new Map<string, THREE.Texture>();
  private figure: THREE.Mesh;
  private figTex: THREE.Texture[] = [];
  private dwellLeft = 0;
  /** The clock hour last frame, so the 8:15 is a CROSSING and not a
   *  window — a paused harness clock must not fire it twice. */
  private lastHour = clock.hour;
  private open = false;

  constructor() {
    /* THE SIDE. Twenty-two units of railcar for a walker who is 1.9
     * tall: one carriage, not a train, because twelve stops down a road
     * is the scale of this thing and a rake of four would be wider than
     * the frame at every one of them. */
    const sw = 22;
    const sh = sw * (192 / 1024);
    const sgeo = new THREE.PlaneGeometry(sw, sh);
    sgeo.translate(0, sh * 0.5, 0);
    this.sideMat = new THREE.MeshBasicMaterial({
      map: this.sideTex(0, false),
      transparent: true,
      alphaTest: 0.1,
      side: THREE.DoubleSide,
    });
    this.side = new THREE.Mesh(sgeo, this.sideMat);
    this.group.add(this.side);

    const fw = 3.6;
    const fh = fw * (224 / 192);
    const fgeo = new THREE.PlaneGeometry(fw, fh);
    fgeo.translate(0, fh * 0.5, 0);
    this.front = new THREE.Mesh(fgeo, new THREE.MeshBasicMaterial({
      map: railcarFrontTexture(7900),
      transparent: true,
      alphaTest: 0.1,
      side: THREE.DoubleSide,
    }));
    this.group.add(this.front);

    /* WHOEVER IS ON THE PLATFORM. One drawing at a time, because the
     * train is only ever at one stop: they are there when it arrives
     * and gone when it leaves, and nobody is ever shown walking to a
     * stop or away from one. Nobody crosses a border, and nobody is
     * ever seen not crossing one either. */
    for (let v = 0; v < 6; v++) this.figTex.push(platformFigureTexture(7910 + v, v));
    const pgeo = new THREE.PlaneGeometry(1.15, 1.92);
    pgeo.translate(0, 0.96, 0);
    this.figure = new THREE.Mesh(pgeo, new THREE.MeshBasicMaterial({
      map: this.figTex[0],
      transparent: true,
      alphaTest: 0.1,
      side: THREE.DoubleSide,
    }));
    this.group.add(this.figure);

    /* Drawn AFTER the walker so the near side of the carriage hides the
     * legs of whoever is sitting in it — the rowboat's trick, and the
     * same reason: the camera only ever looks north, so "south of" is
     * "in front of". */
    this.group.renderOrder = 2;
    /* IT IS NOT IN THE WORLD UNTIL IT HAS RUN, and that is the whole
     * of `PROMPT` §0's warning: *do not spend the reveal early.* Round 1
     * of the gate stood a railcar across THE CAR PARK from the first
     * minute of a fresh page, so a player who walked east in their first
     * ten minutes found the ending parked in it. It sleeps nowhere. It
     * arrives at a quarter past eight, once the walker has walked the
     * line, and it is in the car park from then on. */
    this.group.visible = false;
    this.s = 0;
    this.stop = 0;
    this.phase = 'away';
  }

  /**
   * The carriage's drawing for a given load, made once per load.
   *
   * A full run asks for up to twenty of these (ten loads, doors open and
   * shut) and the canvas is 1024 × 192, which is fifteen megabytes of
   * texture accrued over three minutes on a phone. So the cache is
   * capped at six and drops its oldest: the train only ever shows one
   * load at a time and it never goes backwards, so nothing that is
   * evicted is ever asked for again in the same run.
   */
  private sideTex(carrying: number, open: boolean): THREE.Texture {
    const key = `${Math.min(9, carrying)}|${open ? 1 : 0}`;
    let t = this.cache.get(key);
    if (!t) {
      t = railcarSideTexture(7920, carrying, open);
      this.cache.set(key, t);
      while (this.cache.size > 6) {
        const oldest = this.cache.keys().next().value as string;
        if (oldest === key) break;
        this.cache.get(oldest)?.dispose();
        this.cache.delete(oldest);
      }
    }
    return t;
  }

  /**
   * WHERE IT SLEEPS. It ends its run at the car park, which is where
   * the line ends, and it stands there until the next quarter past
   * eight. Nobody ever sees it go back up, and nobody in this world
   * would think that strange.
   */
  /** Whether this walker has done the two things (§4.1). */
  static qualified(): boolean {
    return knowledge.has('route:the-line') &&
      knowledge.answeredWaits() >= WAITS_FOR_THE_LINE;
  }

  /** Somebody is standing at stop `i` — unless it is the Downs. */
  private waiting(i: number): boolean {
    const st = LINE_STOPS[i];
    /* IV.4. **JOAN HARROW IS NOT ON THE PLATFORM.** She is in the
     * field, working, because her harvest came in and she never needed
     * a train. It is the only wait in the world that was ever answered,
     * and she is the only person who does not have to leave to get what
     * she was waiting for. Nothing anywhere says why. */
    if (st.land === 'downs') return false;
    return knowledge.answered(st.land);
  }

  /**
   * Run the world's morning.
   *
   * `y` is the ground under it, `px, pz` is the walker. Returns nothing
   * and says nothing: everything this thing communicates it communicates
   * by being somewhere.
   */
  update(dt: number, groundAt: (x: number, z: number) => number, px: number, pz: number) {
    this.justOpened = false;

    /* ---- does it come at all? ------------------------------------- *
     * The 8:15 is a CROSSING of a quarter past eight, not a window: the
     * harness can hold the clock anywhere it likes and the train will
     * not fire twice for it. */
    const h = clock.hour;
    const crossed = this.lastHour < 8.25 && h >= 8.25 && h < 9;
    this.lastHour = h;
    if (crossed && (this.phase === 'ended' || this.phase === 'away') && Eight15.qualified()) {
      this.s = -40;
      this.stop = 0;
      this.carrying = 0;
      this.phase = 'running';
      this.aboard = false;
    }
    if (this.phase === 'away') {
      // nowhere, and nothing in the world knows it is coming
      this.group.visible = false;
      this.figure.visible = false;
      platform.land = null;
      return;
    }
    if (this.phase === 'ended' && !this.aboard) {
      /* IV.5. It goes on south and east, down the spur, and stops at
       * the car park, which is where the line ends — and it stands
       * there until the next quarter past eight. Nobody ever sees it go
       * back up, and nobody in this world would think that strange. */
      this.place(groundAt, false);
      this.group.visible = true;
      this.figure.visible = false;
      platform.land = null;
      return;
    }

    if (this.phase === 'running') {
      const target = this.stop < LINE_STOPS.length
        ? LINE_STOP_S[this.stop]
        : LINE_LENGTH;
      this.s = Math.min(target, this.s + SPEED * dt);
      if (this.s >= target - 1e-6) {
        if (this.stop < LINE_STOPS.length) {
          this.phase = 'dwelling';
          this.dwellLeft = DWELL;
          this.justOpened = true;
        } else {
          /* IV.5. It goes on south and east, down the spur, and stops at
           * the car park, which is where the line ends. */
          this.phase = 'ended';
          this.stop = LINE_STOPS.length;
        }
      }
    } else if (this.phase === 'dwelling') {
      this.dwellLeft -= dt;
      if (this.dwellLeft <= 0) {
        /* IV.3, and it is the ending because it is a CONSEQUENCE and
         * not a choice: somebody gets on at every land whose wait the
         * player answered, and at the others the doors stand open the
         * same time and it goes on. */
        if (this.waiting(this.stop)) this.carrying++;
        this.stop++;
        this.phase = 'running';
      }
    }

    const doorsOpen = this.phase === 'dwelling';
    if (doorsOpen !== this.open) {
      this.open = doorsOpen;
      this.sideMat.map = this.sideTex(this.carrying, doorsOpen);
      this.sideMat.needsUpdate = true;
    } else if (this.sideMat.map !== this.sideTex(this.carrying, doorsOpen)) {
      this.sideMat.map = this.sideTex(this.carrying, doorsOpen);
      this.sideMat.needsUpdate = true;
    }

    this.place(groundAt, doorsOpen);
    this.group.visible = true;

    /* WHOEVER IS WAITING, and they are only ever there while it is. */
    const showFigure = doorsOpen && this.waiting(this.stop);
    this.figure.visible = showFigure;
    platform.land = showFigure ? LINE_STOPS[this.stop].land : null;
    if (showFigure) {
      const land = LINE_STOPS[this.stop].land;
      const tex = this.figTex[(CARRIES[land] ?? 5) % 6];
      const mat = this.figure.material as THREE.MeshBasicMaterial;
      if (mat.map !== tex) {
        mat.map = tex;
        mat.needsUpdate = true;
      }
      const p = lineAt(this.s);
      /* South of the train, which is between it and the lens: a person
       * standing at a stop is on the near side of it, and the camera
       * only ever looks north.
       *
       * **AND THE OFFSET IS LOCAL, NOT WORLD.** Round 3 of the gate set
       * this in world coordinates on a mesh parented to a group that is
       * already at the train's position, which put every platform
       * figure in the game at twice the train's x and twice its z —
       * three hundred units off the sheet, on the other side of the
       * page. Nothing in this repository would have said so: the check
       * that reads instance matrices reads FIELDS, and this is a
       * one-off, and a contact sheet of an empty platform looks exactly
       * like a contact sheet of a platform whose figure is elsewhere. */
      const dx = Math.abs(p.tz) > 0.7 ? 4.4 : 0;
      const dz = Math.abs(p.tz) > 0.7 ? 0 : 5.2;
      const gy = this.group.position.y;
      this.figure.position.set(dx, groundAt(p.x + dx, p.z + dz) - gy, dz);
    }
    void px;
    void pz;
  }

  /** Which aspect, and where. */
  private place(groundAt: (x: number, z: number) => number, stopped: boolean) {
    const p = lineAt(this.s);
    const y = groundAt(p.x, p.z);
    this.group.position.set(p.x, y, p.z + (this.aboard ? 0.9 : 0));
    /* THE ASPECT. Broadside on the east–west legs, at every stop and
     * whenever you are in it; front on when it is coming down a road
     * you are looking along. */
    const broadside = stopped || this.aboard || Math.abs(p.tx) > Math.abs(p.tz);
    this.side.visible = broadside;
    this.front.visible = !broadside;
    /* Going away from you rather than toward you is the same drawing
     * mirrored, which is how the walker and the rowboat have always
     * done it. */
    this.front.scale.x = p.tz < 0 ? -1 : 1;
    this.side.scale.x = p.tx < 0 ? -1 : 1;
  }

  /** Can the walker get on from where they are standing? */
  canBoard(px: number, pz: number): boolean {
    if (this.aboard || this.phase !== 'dwelling') return false;
    const p = lineAt(this.s);
    return Math.hypot(px - p.x, pz - p.z) < BOARD_REACH + 4;
  }

  /** And can they get off? Only at a stop, because it is a train. */
  canAlight(): boolean {
    return this.aboard && this.phase === 'dwelling';
  }

  /** Where it is, for the walker who is riding it. */
  get pos(): { x: number; z: number } {
    const p = lineAt(this.s);
    return { x: p.x, z: p.z };
  }

  /**
   * WHERE THE PROMPT IS — and it is nowhere at all unless a door is
   * open in front of you.
   *
   * `diff-sheets` found this and nothing else would have. The POI that
   * says TAKE A SEAT reads the train's live coordinates the way the
   * rowboat's reads the boat's, and before the 8:15 has ever run those
   * coordinates are the head of the line — **which is Greyweather's
   * gate.** So on a fresh page, standing in the bailey of a castle in
   * the oldest land in the world, the game offered you a seat on a
   * train that does not exist yet, and it had been doing it in every
   * shot of that place since the mount was wired in.
   *
   * The prompt showed up as a hundred-and-two-pixel band in the WRITING
   * pass of four protected framings, in a land this session never
   * opened, and no contact sheet of the Cubicle Mile could ever have
   * contained it.
   *
   * A train you cannot board is not a place you can stand: off the
   * sheet entirely unless the doors are open.
   */
  get boardingPos(): { x: number; z: number } {
    if (this.phase !== 'dwelling' && !this.aboard) return { x: 1e6, z: 1e6 };
    const p = lineAt(this.s);
    return { x: p.x, z: p.z };
  }

  dispose() {
    this.side.geometry.dispose();
    this.front.geometry.dispose();
    this.figure.geometry.dispose();
    for (const t of this.cache.values()) t.dispose();
    for (const t of this.figTex) t.dispose();
    this.sideMat.dispose();
    (this.front.material as THREE.Material).dispose();
    (this.figure.material as THREE.Material).dispose();
  }
}
