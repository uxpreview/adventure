import { clock } from './daylight';

/**
 * THE WEATHER — one clock, like the day, readable by anything
 * (`THE-FUN-PASS.md` §9 item 3, Session 17).
 *
 * Rain, wind, fog and a storm once in a while at night. It is a SYSTEM
 * and not a land's: nothing in a region builder decides whether it is
 * raining, it asks. And it obeys the same law `events.ts` obeys, for
 * the same reason:
 *
 *   **IT HAPPENS WHETHER OR NOT THE WALKER IS THERE.** The state is a
 *   pure function of the day and the hour (`daylight.clock.day`,
 *   `clock.hour`) and of nothing else — no random walk, no timer, no
 *   memory. A walker who arrives ten minutes into a shower finds it ten
 *   minutes old, a save that wakes on the second morning wakes into
 *   the second morning's fog, and two runs of one hour on one day are
 *   the same weather, which is what lets `diff-sheets` keep judging
 *   the protected framings.
 *
 * ── DAY ZERO IS THE SHIPPED PAGE ────────────────────────────────────
 *
 * Every verdict this project holds was earned at noon and at 19.6 on a
 * fresh page, in still air. So the first day is AUTHORED rather than
 * hashed: calm at both of those hours — wind exactly at the field's
 * shipped sway, no rain, no fog — with one shower in the middle of the
 * afternoon, after the first hour is over and before the light goes.
 * The second day is authored too, so the owner's first full cycle
 * meets a fog at dawn, a shower, and the first storm after dark. From
 * the third day on the days are hashed, and no two are alike.
 *
 * ── WHAT READS IT ───────────────────────────────────────────────────
 *
 *   App          the haze closes in (fog), the smudge pass runs the
 *                drawing (rain), the whole frame flashes (a storm), and
 *                the voices: the patter, the gusts, the thunder
 *   StandeeField the wind is a multiplier over every field's own sway
 *   the lures    fog closes the vistas — and the four lures with them,
 *                which the Common's opening now depends on
 *   the mill     turns faster when the wind gets up; the regatta's
 *                sails fill; the folk go in out of the rain
 *
 * `wind` is 0..1 and HALF is the shipped page: a field's sway is
 * multiplied by `windK`, which is exactly one at a half. Fog is 0..1
 * over how far the horizon has come in. Rain is 0..1 over how hard.
 * `flash` is the lightning, 0 almost always.
 */

export type WeatherKind = 'clear' | 'wind' | 'rain' | 'fog' | 'storm';

export type WeatherState = {
  rain: number;
  wind: number;
  fog: number;
  /** 0..1 through a storm; the storm is rain and wind at one, plus
   *  lightning. */
  storm: number;
  /** The lightning, this frame: 0 nearly always, a spike that decays
   *  over half a second when it strikes. */
  flash: number;
  /** Which flash this is, so a crossing can fire the thunder once. */
  flashId: number;
  kind: WeatherKind;
};

/** A hash of a day and a slot, 0..1, deterministic. */
function h(day: number, k: number): number {
  const x = Math.sin(day * 127.1 + k * 311.7 + 0.37) * 43758.5453;
  return x - Math.floor(x);
}

const smooth = (t: number) => {
  const u = Math.max(0, Math.min(1, t));
  return u * u * (3 - 2 * u);
};

/** A window of hours with a soft edge either side: 0 outside, 1 inside. */
function window(hour: number, at: number, hours: number, edge = 0.25): number {
  // the day wraps: an event at 23 for two hours runs to 1
  let d = hour - at;
  if (d < -12) d += 24;
  if (d > 12) d -= 24;
  const rise = smooth((d + edge) / edge);
  const fall = 1 - smooth((d - hours + edge) / edge);
  return Math.max(0, Math.min(rise, fall));
}

type DayPlan = {
  shower?: { at: number; hours: number; k: number };
  fog?: { at: number; hours: number; k: number };
  storm?: { at: number; hours: number };
  /** The wind's own level for the day, 0.25..0.75 around the half. */
  wind: number;
};

/** THE FIRST TWO DAYS ARE WRITTEN. The rest are hashed. */
const AUTHORED: DayPlan[] = [
  // day zero: the shipped page. Calm at noon and at dusk, one shower
  // after the first hour is over.
  { wind: 0.5, shower: { at: 14.2, hours: 1.4, k: 0.85 } },
  // day one: fog at first light, a shower before noon, and after dark
  // the first storm — the frightening content lives at night
  { wind: 0.58, fog: { at: 4.9, hours: 2.6, k: 0.9 }, shower: { at: 10.8, hours: 1.5, k: 0.7 },
    storm: { at: 22.6, hours: 2.0 } },
];

export function planFor(day: number): DayPlan {
  if (day < AUTHORED.length) return AUTHORED[day];
  const plan: DayPlan = { wind: 0.3 + h(day, 1) * 0.45 };
  if (h(day, 2) < 0.55) {
    plan.shower = { at: 9.5 + h(day, 3) * 9.5, hours: 0.7 + h(day, 4) * 2.2, k: 0.55 + h(day, 5) * 0.45 };
  }
  if (h(day, 6) < 0.45) plan.fog = { at: 4.6 + h(day, 7) * 0.8, hours: 2 + h(day, 8) * 1.6, k: 0.6 + h(day, 9) * 0.4 };
  if (h(day, 10) < 0.32) plan.storm = { at: 21.8 + h(day, 11) * 1.8, hours: 1.4 + h(day, 12) * 1.4 };
  return plan;
}

/** THE WEATHER AT AN HOUR OF A DAY. Pure, and exported so a harness or
 *  a play sheet can ask for tomorrow. */
export function weatherAt(day: number, hour: number): WeatherState {
  const p = planFor(day);
  let rain = 0;
  let fog = 0;
  let storm = 0;
  let flash = 0;
  let flashId = -1;
  // the wind breathes slowly through the day about the day's own level;
  // on day zero it sits exactly at the half at the protected hours
  let wind = p.wind;
  if (day > 0) wind += Math.sin(hour * 0.9 + day) * 0.06 + Math.sin(hour * 2.3) * 0.03;
  if (p.shower) {
    const w = window(hour, p.shower.at, p.shower.hours, 0.22);
    rain = Math.max(rain, w * p.shower.k);
    wind = Math.max(wind, 0.5 + w * 0.3);
  }
  if (p.fog) fog = Math.max(fog, window(hour, p.fog.at, p.fog.hours, 0.5) * p.fog.k);
  if (p.storm) {
    const w = window(hour, p.storm.at, p.storm.hours, 0.3);
    storm = w;
    rain = Math.max(rain, w);
    wind = Math.max(wind, 0.5 + w * 0.5);
    if (w > 0.35) {
      /* THE LIGHTNING: the storm's hours cut into slots of about five
       * seconds (a twentieth of an hour), and a hash decides which
       * slots strike. A strike is a spike at the top of its slot that
       * is gone in half a second, and its id is the slot, so App can
       * fire one thunder per strike and never two. */
      let d = hour - p.storm.at;
      if (d < 0) d += 24;
      const slot = Math.floor(d * 20);
      const frac = d * 20 - slot;
      if (h(day * 7 + 3, slot) > 0.78) {
        flash = Math.pow(Math.max(0, 1 - frac * 2.4), 5) * (0.6 + h(day, slot + 40) * 0.4);
        flashId = day * 100000 + slot;
      }
    }
  }
  wind = Math.max(0, Math.min(1, wind));
  const kind: WeatherKind = storm > 0.35 ? 'storm' : rain > 0.15 ? 'rain' : fog > 0.15 ? 'fog' : wind > 0.72 ? 'wind' : 'clear';
  return { rain, wind, fog, storm, flash, flashId, kind };
}

const CALM: WeatherState = { rain: 0, wind: 0.5, fog: 0, storm: 0, flash: 0, flashId: -1, kind: 'clear' };

/** The named states a harness or a URL can ask for. */
export const PRESETS: Record<WeatherKind, WeatherState> = {
  clear: CALM,
  wind: { ...CALM, wind: 0.92, kind: 'wind' },
  rain: { ...CALM, rain: 0.85, wind: 0.7, kind: 'rain' },
  fog: { ...CALM, fog: 0.95, wind: 0.3, kind: 'fog' },
  storm: { ...CALM, rain: 1, wind: 1, storm: 1, kind: 'storm' },
};

class Weather {
  state: WeatherState = CALM;
  /** Held here by the harness or a URL; null is the clock's own. */
  pinned: WeatherState | null = null;

  /** Once a frame, after the clock has advanced. */
  tick() {
    this.state = this.pinned ?? weatherAt(clock.day, clock.hour);
  }

  pin(kind: WeatherKind | WeatherState | null) {
    this.pinned = kind === null ? null : typeof kind === 'string' ? PRESETS[kind] : kind;
    this.tick();
  }

  /** The multiplier every field's sway takes: exactly one at the
   *  shipped page's half. */
  get windK(): number {
    return 0.45 + this.state.wind * 1.1;
  }
}

/** One instance, module scope, readable by anything. */
export const weather = new Weather();
