import { LIGHT, PAPER } from '../engine/palette';

/**
 * THE DAY — what time it is, and what that does to the page.
 *
 * WORLD-SYSTEMS §7 calls time of day the highest-return item in the
 * file, and the reason is arithmetic: every land already built improves
 * for free, because the hour multiplies each of them by the number of
 * states it can be in at no authoring cost per land. Six lands hold the
 * bar today; the day cycle is the only change in this session that
 * makes all six better without touching one of them.
 *
 * THE METAPHOR PAYS FOR IT. The world is a sheet of paper on a desk, so
 * night is not darkness — night is **the desk lamp coming on**. The
 * page never stops being readable, because a drawing under a lamp never
 * does. What changes is the colour of the light falling on it, how much
 * of it there is, and how far from the lamp you are standing.
 *
 * THE THREE LAWS THIS FILE OBEYS, all of them older than it:
 *
 *  1. **Washes come only from `palette.ts`.** So the hour never touches
 *     the wash field and never invents a colour: it modulates the
 *     finished frame with one of `palette.LIGHT`'s tints, in the paper
 *     post-pass, in one place.
 *  2. **A fold is DRAWN, not shaded** (Session 4, two critique rounds).
 *     So dusk may not become a gradient down a hillside. The terrain
 *     shader's marks — the tone, the crease line, the hatching — are
 *     not touched by this file at all. What the hour grades is the
 *     whole frame at once, evenly, the way a room does.
 *  3. **The lamp is BEHIND the page** (Session 4, and the castle scarp
 *     depends on it). That lamp is the terrain shader's, it is a
 *     direction in a vertex attribute, and this file does not move it.
 *     The desk lamp here is a different object: it is the light in the
 *     ROOM, it lives in the post-pass where the room already was, and
 *     the two never meet.
 *
 * AND ONE RULE DECIDES THE CURVE: **08:00 to 15:00 is the shipped
 * look, exactly.** Four lands earned a WOWED under a neutral page and
 * a day cycle that re-graded them would be a regression wearing a
 * feature's clothes. The day departs from neutral at its two ends and
 * nowhere in between.
 *
 * TWO SEAMS ARE LEFT OPEN ON PURPOSE, and both are named in the plan:
 *
 *  · **the mixer** (WORLD-SYSTEMS §9, move 5). `Audio.setHour` reads
 *    the same number, so the score session does not have to re-open the
 *    day cycle to make the music answer the hour.
 *  · **the world builders** (STORY §7 — the story runs on routine).
 *    Anything in the world may `import { clock }` and ask what time it
 *    is: people are somewhere at a given hour, the belfry's two hands
 *    disagree, Brim's shutters open in the morning. Nothing has to go
 *    through App to find out.
 */

/** Hex → 0..1 triple. */
function rgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

/** A tint used as a MULTIPLIER carries no brightness: normalise it to
 *  its own brightest channel and let `value` carry the darkening. That
 *  is what keeps "how blue is the night" and "how dark is the night"
 *  two separately authorable numbers instead of one muddled one. */
function tint(hex: string): [number, number, number] {
  const c = rgb(hex);
  const m = Math.max(c[0], c[1], c[2]) || 1;
  return [c[0] / m, c[1] / m, c[2] / m];
}

const T = {
  earlyDawn: tint(LIGHT.earlyDawn),
  dawn: tint(LIGHT.dawn),
  day: tint(LIGHT.day),
  afternoon: tint(LIGHT.afternoon),
  dusk: tint(LIGHT.dusk),
  lateDusk: tint(LIGHT.lateDusk),
  night: tint(LIGHT.night),
};
export const LAMP_POOL = tint(LIGHT.lampPool);
export const LAMP_EDGE = tint(LIGHT.lampEdge);

/**
 * THE DAY, AS A LIST OF HOURS.
 *
 * Authored as keyframes rather than as a formula, because a formula
 * gives you a sine wave and a sine wave has no dusk in it — it has a
 * long even fade, and the whole point of this system is that the ten
 * minutes either side of sunset do not look like anything else all day.
 *
 *   hour   the o'clock this row describes
 *   tint   the colour of the light (normalised; see above)
 *   value  how much light there is, 1 = the shipped page
 *   lamp   how much the DESK LAMP is doing the work, 0..1 — this is
 *          what turns a flat darkening into a page on a desk
 */
type Key = {
  hour: number;
  tint: [number, number, number];
  value: number;
  lamp: number;
  /**
   * HOW FAR THE HAZE GOES toward the light's own colour, 0..1.
   *
   * Separate from `tint` because round 2 of the gate found the reason
   * it has to be: with the haze taking the tint at full strength, six
   * in the evening was a TANGERINE SLAB across the top of every frame
   * and the town read as a cut-out on a poster. The sheet is PAPER. A
   * page under warm light goes cream-gold; it does not go to a
   * photograph of a sunset, and a saturated sky is a photographic idea
   * in a game that has refused photographic ideas since Session 1.
   */
  sky: number;
};

const DAY: Key[] = [
  { hour: 0.0, tint: T.night, value: 0.68, lamp: 1.00, sky: 0.62 },
  { hour: 4.4, tint: T.night, value: 0.68, lamp: 1.00, sky: 0.62 },
  { hour: 5.4, tint: T.earlyDawn, value: 0.79, lamp: 0.60, sky: 0.58 },
  { hour: 6.4, tint: T.dawn, value: 0.91, lamp: 0.18, sky: 0.46 },
  { hour: 8.0, tint: T.day, value: 1.00, lamp: 0.00, sky: 0.00 },
  // ---- the shipped page: neutral, and it stays neutral for eight hours
  { hour: 16.0, tint: T.day, value: 1.00, lamp: 0.00, sky: 0.00 },
  { hour: 17.6, tint: T.afternoon, value: 0.99, lamp: 0.00, sky: 0.18 },
  // and then the hour this whole system is for, and it is SHORT: two
  // thirds of an hour from "the light has changed" to "the lamps are on"
  { hour: 19.0, tint: T.dusk, value: 0.93, lamp: 0.14, sky: 0.36 },
  { hour: 19.8, tint: T.dusk, value: 0.84, lamp: 0.46, sky: 0.44 },
  { hour: 20.5, tint: T.lateDusk, value: 0.75, lamp: 0.82, sky: 0.54 },
  { hour: 21.5, tint: T.night, value: 0.68, lamp: 1.00, sky: 0.62 },
  { hour: 24.0, tint: T.night, value: 0.68, lamp: 1.00, sky: 0.62 },
];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => t * t * (3 - 2 * t);

export type DayPhase = 'night' | 'dawn' | 'morning' | 'afternoon' | 'dusk';

export type DayState = {
  /** 0..24. */
  hour: number;
  /** The name of the hour, for anything that wants to branch on it. */
  phase: DayPhase;
  /** The colour of the light, as a multiplier over the whole frame. */
  tint: [number, number, number];
  /** How much light there is. 1 is the shipped page. */
  value: number;
  /** How much of the light is coming from the desk lamp, 0..1. This is
   *  what lights a lamp, a window and a brazier, and what deepens the
   *  pool in the post-pass. */
  lamp: number;
  /** The horizon closes in after dark: a multiplier on fog distance. */
  fogScale: number;
  /**
   * THE COLOUR OF THE HAZE, and it is the most important number in this
   * file. See `skyOf` below: the hour's colour lives at the HORIZON,
   * not on the ground.
   */
  fog: number;
};

/** Where the hour sits between two keyframes. */
function sample(hour: number): DayState {
  const h = ((hour % 24) + 24) % 24;
  let i = 0;
  while (i < DAY.length - 2 && DAY[i + 1].hour <= h) i++;
  const a = DAY[i];
  const b = DAY[i + 1];
  const t = smooth(Math.max(0, Math.min(1, (h - a.hour) / (b.hour - a.hour || 1))));
  const lamp = lerp(a.lamp, b.lamp, t);
  return {
    hour: h,
    phase: phaseOf(h),
    tint: [
      lerp(a.tint[0], b.tint[0], t),
      lerp(a.tint[1], b.tint[1], t),
      lerp(a.tint[2], b.tint[2], t),
    ],
    value: lerp(a.value, b.value, t),
    lamp,
    // a horizon you can see to is a daylight thing. After dark the haze
    // closes to four-fifths, which is enough to feel and not enough to
    // take a vista away from anybody who climbed for it.
    fogScale: 1 - 0.2 * lamp,
    fog: skyOf(
      [lerp(a.tint[0], b.tint[0], t), lerp(a.tint[1], b.tint[1], t), lerp(a.tint[2], b.tint[2], t)],
      lerp(a.value, b.value, t),
      lerp(a.sky, b.sky, t)
    ),
  };
}

/* ------------------------------------------------------------------ *
 * WHERE THE HOUR'S COLOUR ACTUALLY LIVES.
 *
 * Round 1 of the gate rejected the first build of this system in one
 * word, and the word was SEPIA. Grading the whole frame by the light's
 * colour at full strength is a photo filter: at half past seven the
 * greens went brown, the greys went brown, the ink went brown, and the
 * page lost every bit of colour separation it had. It is the single
 * most common way a day cycle fails and this one failed it exactly.
 *
 * The fix is not a weaker filter. It is putting the colour where it is:
 *
 *   THE HAZE TAKES THE SUNSET. The horizon is where sky colour lives —
 *   it is the only part of the frame that IS light rather than a thing
 *   with light on it. So the fog goes deep amber at dusk and cold at
 *   night, at full strength, and it is the fog that says what time it
 *   is from across a land.
 *
 *   THE PAPER TAKES A LITTLE OF IT, weighted by how bright it already
 *   is (see the post-pass). Warm light warms what it lands on; it does
 *   not repaint a dark green hedge. So the sheet's own white goes
 *   golden and the washes stay the washes they were mixed to be.
 *
 *   THE INK TAKES NONE OF IT. Ballpoint is ballpoint at every hour of
 *   the day, and the moment the line work goes brown the whole
 *   medium — the one thing this project cannot compromise — is gone.
 *
 * That is also just how the room works: the page is on a desk, and at
 * dusk the window is orange and the page is a page.
 * ------------------------------------------------------------------ */
function skyOf(tint: [number, number, number], value: number, sky: number): number {
  const base = rgb(PAPER);
  // the haze takes MORE of the hour than the page does, but nothing
  // like all of it: `sky` is authored per keyframe (see the note on
  // Key.sky, which is round 2 of the gate written down as a number)
  /* THE HORIZON GOES DARKER THAN THE PAGE DOES, and that is the single
   * move that makes this a desk lamp rather than a filter. A page in a
   * dim room is dim; the room BEYOND it is dark. So the haze takes the
   * value to a power — noon is 1 either way, dusk is four-fifths on the
   * page and seven-tenths at the horizon, and midnight is two-thirds on
   * the page against four-tenths out there. You are looking at a lit
   * sheet with the dark of the room behind it, which is exactly what
   * you are looking at. */
  const v = Math.pow(value, 2.2);
  const out = [0, 1, 2].map((i) =>
    Math.max(0, Math.min(1, base[i] * (1 + (tint[i] - 1) * sky) * v))
  );
  return (Math.round(out[0] * 255) << 16) | (Math.round(out[1] * 255) << 8) |
    Math.round(out[2] * 255);
}

function phaseOf(h: number): DayPhase {
  if (h < 5.1 || h >= 20.8) return 'night';
  if (h < 7.5) return 'dawn';
  if (h < 12.5) return 'morning';
  if (h < 18.4) return 'afternoon';
  return 'dusk';
}

/**
 * ONE HOUR OF THE WORLD IS ONE HUNDRED SECONDS.
 *
 * A full day is forty minutes, which is the number this whole system
 * is tuned around and it was chosen against two facts. A crossing of
 * the sheet is about ten minutes (WORLD-SYSTEMS §0), so a forty-minute
 * day means a player who walks from the castle to the office park
 * arrives in a different light than they set out in — the world has
 * visibly moved while they were in it, which is the entire point of
 * §7. And a session at this game is measured in hours, so nobody is
 * ever stuck in one light: the dusk you missed comes round again.
 *
 * Faster and the sky is weather, not time. Slower and the day cycle is
 * a thing you read about in the patch notes.
 */
export const SECONDS_PER_HOUR = 100;

/** A fresh page starts in the middle of the morning: the shipped
 *  neutral light, so the first minute is the first minute Session 2
 *  earned its WOWED on, and the player's first dusk is something that
 *  HAPPENS to them rather than something they booted into. */
export const DAY_START = 9.0;

/**
 * THE CLOCK. One instance, module-scope, readable by anything.
 *
 * It is deliberately not owned by App and not passed down through a
 * context: the story runs on routine (STORY §7) and a region builder
 * that wants to know whether the shutters are open should be able to
 * ask, in one import, without a plumbing session. App advances it;
 * everybody else reads it.
 */
export class Clock {
  hour = DAY_START;
  /**
   * WHICH DAY IT IS (Session 17). The hour wraps and the day counts:
   * the weather (`weather.ts`) is a pure function of the day and the
   * hour, the way an event is a pure function of the hour, so that a
   * shower on the second afternoon is the same shower whether or not
   * anybody was out in it, and a fresh page always wakes into the same
   * first day. Saved with the hour; a fresh page is day zero.
   */
  day = 0;
  /** Set false to hold the world at one hour (the shoot harness does). */
  running = true;
  private cached: DayState = sample(DAY_START);

  advance(dt: number) {
    if (!this.running) return;
    const next = this.hour + dt / SECONDS_PER_HOUR;
    if (next >= 24) this.day++;
    this.hour = next % 24;
    this.cached = sample(this.hour);
  }

  set(hour: number) {
    this.hour = ((hour % 24) + 24) % 24;
    this.cached = sample(this.hour);
  }

  get state(): DayState {
    return this.cached;
  }

  /** How much the lamps are doing — what a lit window's opacity is. */
  get lamp(): number {
    return this.cached.lamp;
  }

  get phase(): DayPhase {
    return this.cached.phase;
  }

  /** "twenty past six" — hand-lettered clock faces and timetables will
   *  want this, and so does the debug harness. */
  get clockText(): string {
    const h = Math.floor(this.hour);
    const m = Math.floor((this.hour - h) * 60);
    return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')}${h < 12 ? 'am' : 'pm'}`;
  }
}

export const clock = new Clock();

/** The hour, for anything that only needs the number. */
export const hourNow = () => clock.hour;
