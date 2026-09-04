import { clock } from './daylight';
import type { RegionId } from './layout';

/**
 * THE SCHEDULED-EVENT CLOCK — *at this hour, in this place, this
 * happens* (`THE-FUN-PASS.md` §9, Session 15).
 *
 * `daylight.ts` has one clock and everything reads it: Brim's lamps,
 * the shelter's light, Amos's night walk, Joan's working day. Every one
 * of those is a routine a land builder rolled by hand out of `clock.hour`
 * and a couple of smoothsteps, and none of them is registered anywhere
 * — so nothing in the game can answer *what is happening right now* and
 * nothing outside a land can tell that land's event has started. The
 * 8:15 is the only EVENT in the game today, it happens once, and it
 * carries its own crossing detector.
 *
 * This is the plumbing so that a land can say it in one line:
 *
 *   events.register({ id: 'the-drove', land: 'downs', at: 5.7, hours: 1,
 *                     place: { x: 101, z: 100 } });
 *
 * and then read it back every frame as a number:
 *
 *   const t = events.progress('the-drove');   // −1, or 0..1
 *
 * ── THE THREE PROPERTIES, AND THEY ARE THE DESIGN ─────────────────
 *
 *  1. **IT FIRES WHETHER OR NOT THE WALKER IS THERE.** A land is only
 *     built when the walker is within reach of its rect, so a land's
 *     own update loop is not running when they are elsewhere, and
 *     anything an event does by *simulation* is a thing that only
 *     happens when somebody is watching. So progress is a FUNCTION OF
 *     THE HOUR and nothing else: a land that reads it places its sheep
 *     from the number, and a walker who arrives ten minutes into the
 *     drove finds the flock ten minutes up the lane. That is RDR2's
 *     *a world with business of its own*, and it costs no state.
 *  2. **IT IS A CROSSING AND NOT A WINDOW.** `onStart` and `onEnd` fire
 *     once, on the tick the hour crosses the boundary — the same guard
 *     `Eight15.ts` carries so a paused harness clock cannot fire a
 *     thing twice. A `setHour` jump lands INSIDE an event without
 *     firing its start, which is right: the sound of a flock setting
 *     out is a thing you hear if you were there when it set out.
 *  3. **ANYTHING CAN ASK.** `happening` is module scope and shaped like
 *     `Eight15.ts`'s `platform`, and for the same reason: a region
 *     builder should be able to know an event is in progress in one
 *     import, without a plumbing run through twelve builders.
 *
 * What it is NOT: a quest scheduler, a trigger system, or a timer. An
 * event has no outcome and no completion; it is the world keeping its
 * own hours. Session 17 puts one in every land.
 */

export type ScheduledEvent = {
  /** Readable, like a knowledge id: `the-drove`, `the-lamplighter`. */
  id: string;
  land: RegionId;
  /** The o'clock it starts, 0..24. */
  at: number;
  /** How long it runs, in hours of the world's day (an hour is a
   *  hundred seconds — `daylight.SECONDS_PER_HOUR`). */
  hours: number;
  /** Where it is, so a thing that wants to know whether the walker was
   *  there to see it can ask. Optional: the lamplighter's round is a
   *  route, not a place. */
  place?: { x: number; z: number };
  /** Fired ONCE on the crossing into the event, with the walker's
   *  position, so a land can make its sound if anybody is in earshot. */
  onStart?: (px: number, pz: number) => void;
  onEnd?: (px: number, pz: number) => void;
};

/**
 * WHAT IS HAPPENING RIGHT NOW, for anything to read.
 *
 * Module scope and one instance — `Eight15.ts` exports `platform` in
 * exactly this shape so a land knows not to draw its own person while
 * they are on a platform, and this is the same bargain: `ids` holds
 * the id of every event in progress this frame, and nothing else in
 * the game needs to be told.
 */
export const happening: { ids: Set<string> } = { ids: new Set() };

class Events {
  private list: ScheduledEvent[] = [];
  /** The hour last tick, so a boundary is a crossing and not a window. */
  private lastHour = clock.hour;

  register(ev: ScheduledEvent) {
    if (this.list.some((e) => e.id === ev.id)) return;
    this.list.push(ev);
  }

  /** Every registered event, for the harness and for nothing else. */
  get all(): readonly ScheduledEvent[] {
    return this.list;
  }

  /**
   * 0..1 through the event, or −1 when it is not on. A pure function of
   * the clock, which is what lets a land that was not built when the
   * event started still draw it right when the walker arrives.
   */
  progress(id: string, hour = clock.hour): number {
    const ev = this.list.find((e) => e.id === id);
    if (!ev) return -1;
    return Events.progressOf(ev, hour);
  }

  static progressOf(ev: ScheduledEvent, hour: number): number {
    // the day wraps: an event at 23.5 for one hour runs to 0.5
    let d = hour - ev.at;
    if (d < 0) d += 24;
    if (d >= ev.hours) return -1;
    return d / ev.hours;
  }

  /**
   * Once a frame, from App, after the clock has advanced. Maintains
   * `happening` and fires the crossings.
   */
  tick(px: number, pz: number) {
    const h = clock.hour;
    const was = this.lastHour;
    this.lastHour = h;
    happening.ids.clear();
    for (const ev of this.list) {
      const now = Events.progressOf(ev, h) >= 0;
      if (now) happening.ids.add(ev.id);
      /* A CROSSING, NOT A WINDOW. `was` and `h` are compared through the
       * event's own progress so the wrap at midnight is handled the
       * same way as any other boundary; and a jump of more than an hour
       * — the harness's `setHour`, a save loaded the next morning — is
       * a teleport in time and fires nothing, because nobody was there
       * to hear it. */
      const jump = Math.abs(h - was) > 1 && Math.abs(h - was) < 23;
      if (jump) continue;
      const before = Events.progressOf(ev, was) >= 0;
      if (now && !before) ev.onStart?.(px, pz);
      if (!now && before) ev.onEnd?.(px, pz);
    }
  }

  /**
   * 0..1 BETWEEN TWO EVENTS (Session 17): nothing before the first,
   * rising through it, one until the second, falling through that, and
   * nothing after. The shape every hand-rolled routine in the game had
   * — Brim's lamps, the shelter's light, Joan's working day — written
   * once, off two registered events, so the harness can see them.
   */
  between(startId: string, endId: string, hour = clock.hour): number {
    const a = this.list.find((e) => e.id === startId);
    const b = this.list.find((e) => e.id === endId);
    if (!a || !b) return 0;
    const pa = Events.progressOf(a, hour);
    if (pa >= 0) return pa;
    const pb = Events.progressOf(b, hour);
    if (pb >= 0) return 1 - pb;
    // inside the span between the two, the day wrapping as it does
    const aEnd = (a.at + a.hours) % 24;
    let d = hour - aEnd;
    if (d < 0) d += 24;
    let span = b.at - aEnd;
    if (span < 0) span += 24;
    return d < span ? 1 : 0;
  }

  /** The harness's reset, so a crossing can be re-armed at any hour. */
  resync() {
    this.lastHour = clock.hour;
  }
}

/* ================================================================== *
 * A ROUTINE — a person somewhere at a given hour (Session 17,
 * `THE-FUN-PASS` §9 item 1).
 *
 * *Five to twelve per land, none of them named, all of them somewhere
 * at a given hour.* A routine is a list of STOPS in hour order — at
 * this hour, at this place, in this posture — and the walk between
 * them. It is a pure function of the hour, exactly as an event is, so a
 * land that was not built when the lamplighter set out still draws him
 * four lamps along when the walker arrives; and every leg of it is
 * REGISTERED as an event, so `happening` can say who is on the move and
 * the harness can drive every hour a drawing changes at.
 *
 * Between two stops the figure leaves the first as late as it can and
 * arrives at the second on the hour: `departure = arrival − distance ÷
 * pace`. Before the first stop and after the last one (plus its
 * `hold`) the figure is indoors and not drawn, which is why a routine's
 * first stop is a doorway. A routine may run over midnight by giving a
 * stop an hour past twenty-four.
 * ================================================================== */

export type Stop = {
  /** The o'clock it arrives here. Past 24 for the next morning. */
  at: number;
  x: number;
  z: number;
  /** The posture held here: 0 stand · 1 walk · 2 bend · 3 sit · 4 carry. */
  pose: number;
  /** Which way it faces while it stands here: −1 west, +1 east. */
  face?: -1 | 1;
  /** Hours it stays after arriving — for the LAST stop, how long it
   *  is present before it goes in. */
  hold?: number;
};

export type RoutineDef = {
  id: string;
  land: RegionId;
  stops: Stop[];
  /** Units an hour on the walk between stops. The walker's own walk is
   *  four hundred and ten; a stroll is two hundred and fifty. */
  pace?: number;
  /** A posture held on the walk instead of the stride: a lamplighter
   *  keeps his pole, a delivery keeps its hands on the cart. */
  walkPose?: number;
  /** Fired once on the crossing into leg `i` (setting out from stop
   *  `i`), with the walker's position, for a sound if anybody is near. */
  onLeg?: (i: number, px: number, pz: number) => void;
};

export type RoutineState = {
  /** Out at all. */
  present: boolean;
  x: number;
  z: number;
  pose: number;
  /** On a leg between two stops. */
  moving: boolean;
  face: -1 | 1;
  /** Which stop it is at or has left. */
  leg: number;
  /** 0..1 in over the first two seconds out and out over the last:
   *  a figure comes out of a door rather than appearing. */
  fade: number;
};

const DEFAULT_PACE = 410;

/** Where a routine is at an hour. Exported pure, for the harness. */
export function routineAt(def: RoutineDef, hour: number): RoutineState {
  const st = def.stops;
  const pace = def.pace ?? DEFAULT_PACE;
  const first = st[0];
  const last = st[st.length - 1];
  const end = last.at + (last.hold ?? 0);
  // a routine that runs over midnight: the small hours are past 24
  let h = hour;
  if (end > 24 && h < first.at) h += 24;
  const gone: RoutineState = { present: false, x: first.x, z: first.z, pose: first.pose, moving: false, face: first.face ?? 1, leg: 0, fade: 0 };
  if (h < first.at || h >= end) return gone;
  const FADE = 0.03;
  const fade = Math.min(1, (h - first.at) / FADE, (end - h) / FADE);
  for (let i = 0; i < st.length; i++) {
    const a = st[i];
    const b = st[i + 1];
    if (!b) {
      return { present: true, x: a.x, z: a.z, pose: a.pose, moving: false, face: a.face ?? 1, leg: i, fade };
    }
    const d = Math.hypot(b.x - a.x, b.z - a.z);
    const travel = d / pace;
    const depart = Math.max(a.at + (a.hold ?? 0), b.at - travel);
    if (h < depart) {
      return { present: true, x: a.x, z: a.z, pose: a.pose, moving: false, face: a.face ?? 1, leg: i, fade };
    }
    if (h < b.at) {
      const u = (h - depart) / Math.max(1e-6, b.at - depart);
      return {
        present: true, x: a.x + (b.x - a.x) * u, z: a.z + (b.z - a.z) * u, pose: 1, moving: true,
        face: b.x < a.x ? -1 : 1, leg: i, fade,
      };
    }
  }
  return gone;
}

/** Every routine registered, for the harness. */
export const routines: RoutineDef[] = [];

/**
 * Register a routine: one event for its whole day out, and one per
 * leg, so `happening` knows who is walking where.
 */
export function registerRoutine(def: RoutineDef): RoutineDef {
  if (routines.some((r) => r.id === def.id)) return def;
  routines.push(def);
  const st = def.stops;
  const last = st[st.length - 1];
  const end = last.at + (last.hold ?? 0);
  events.register({ id: def.id, land: def.land, at: st[0].at % 24, hours: Math.max(0.01, end - st[0].at),
    place: { x: st[0].x, z: st[0].z } });
  const pace = def.pace ?? DEFAULT_PACE;
  for (let i = 0; i < st.length - 1; i++) {
    const a = st[i];
    const b = st[i + 1];
    const travel = Math.hypot(b.x - a.x, b.z - a.z) / pace;
    const depart = Math.max(a.at + (a.hold ?? 0), b.at - travel);
    if (b.at - depart <= 0) continue;
    events.register({
      id: `${def.id}/${i}`, land: def.land, at: depart % 24, hours: b.at - depart,
      place: { x: a.x, z: a.z },
      onStart: def.onLeg ? (px, pz) => def.onLeg!(i, px, pz) : undefined,
    });
  }
  return def;
}

/** One instance, module scope, readable by anything — the same shape as
 *  `daylight.ts`'s clock and `knowledge.ts`'s set. */
export const events = new Events();

/** A routine's state now, by id. */
export function routine(id: string, hour = clock.hour): RoutineState | null {
  const def = routines.find((r) => r.id === id);
  return def ? routineAt(def, hour) : null;
}
