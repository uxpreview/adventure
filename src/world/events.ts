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

  /** The harness's reset, so a crossing can be re-armed at any hour. */
  resync() {
    this.lastHour = clock.hour;
  }
}

/** One instance, module scope, readable by anything — the same shape as
 *  `daylight.ts`'s clock and `knowledge.ts`'s set. */
export const events = new Events();
