import { events, routines, happening } from './events';
import { coastX, barDist, type RegionId } from './layout';
import { tearX } from './elevation';

/**
 * EARSHOT — where a sound is coming from, as data (Session 18,
 * `THE-FUN-PASS` §3 item 7, §8 item 2).
 *
 * *Nothing empty for fifteen seconds: on any road across the land, at a
 * walk, something is in frame or in earshot at every point.* Half of
 * that sentence is a question the world can already answer — the
 * skyline grid knows what is standing where, the life registry knows
 * who is out — and the other half could not be asked at all, because
 * the ambient table in `App.ts` is two hundred lines of `Math.random()`
 * and distances written inline. A tool cannot walk a road and ask a
 * table like that what it would hear.
 *
 * So this is THE PLACED VOICES, as a list: every sound in the ambient
 * table that is gated on WHERE the walker stands, with its place and
 * its reach and the hours it keeps. `App.ts` reads its distances from
 * here from this session on, so the number the tool walks against is
 * the number the game plays.
 *
 * ── WHAT COUNTS, AND WHAT DOES NOT ──────────────────────────────────
 *
 * The land-wide filler — the lark on the Common, the pine-tick, the
 * grit running on the Flats, the stone that falls somewhere in the
 * canyon — is NOT in this list, on purpose. Those are the land's bed
 * with a voice, and they fire wherever you stand; a rule they satisfied
 * would be a rule nothing could fail. What is in earshot, for the
 * fifteen-second rule, is a sound that is coming FROM somewhere: the
 * well, the bell, the sea getting louder as you come down to it, the
 * mill, the flock, the tarn, the bell on the mark, the palms you hear
 * before you can see the water. A silence that is itself a place —
 * Brack's twenty units, the deep pines after dark — counts too, since a
 * sound that stops is a thing that happened.
 *
 * And the scheduled events (`events.ts`) that have a place and are in
 * progress: the regatta's bell, the children on the green, the shutters
 * going over. A routine's legs are not counted here — a person walking
 * is in FRAME, and that is the registry's job.
 */

export type Voice = {
  land: RegionId;
  /** The `Audio.event` name, or a readable id for a silence. */
  id: string;
  /** Where it comes from. */
  x: number;
  z: number;
  /** How far it carries, in units. */
  r: number;
  /** The hours it keeps; absent means all day. `from` may be past `to`
   *  for a voice that keeps the night. */
  from?: number;
  to?: number;
  /** A place where the ambient STOPS — Brack's forty, the deep pines
   *  after dark. Heard as an absence, and counted. */
  silence?: true;
};

/** The place of a moving source, for the two voices that have no one
 *  place: the sea, and the canyon's slot. Resolved per query. */
type Moving = { land: RegionId; id: string; from?: number; to?: number; dist: (x: number, z: number) => number; r: number };

export const VOICES: Voice[] = [
  /* THE COMMON */
  { land: 'meadow', id: 'well-plink', x: -57, z: 45, r: 8 },
  /* BRIM: the murmur is the square's; the bell is the belfry's and it
   * is a bell, so it carries the whole town. */
  { land: 'kingdom', id: 'market-murmur', x: -45, z: -82, r: 16 },
  { land: 'kingdom', id: 'brim-bell', x: -64, z: -42, r: 64 },
  /* GREYWEATHER: the banners on the avenue, unless the king is back;
   * the rooks on the keep. */
  { land: 'castle', id: 'banner-snap', x: -45, z: -200, r: 40 },
  { land: 'castle', id: 'rook-caw', x: -45, z: -234, r: 30 },
  /* THE WIDE BLUE: the mark's bell, from the bar; the halyards off the
   * moorings; and (Session 19) THE VIKINGS on the Holdfast, who roar at
   * the sand from their berth by day, and Wren's oars on the way to
   * the mark and back at noon. */
  { land: 'ocean', id: 'bell-buoy', x: -308, z: -36, r: 62 },
  { land: 'ocean', id: 'halyard', x: -262, z: 92, r: 36 },
  { land: 'ocean', id: 'viking-roar', x: -264, z: -46, r: 46, from: 7, to: 20 },
  { land: 'ocean', id: 'oar', x: -282, z: 34, r: 30, from: 11.6, to: 13.9 },
  /* LONGSHORE (Session 19): Pye rowing the pot line off the cove at
   * the tide, twice a day. */
  { land: 'beach', id: 'oar', x: -238, z: -148, r: 30, from: 6.55, to: 7.6 },
  { land: 'beach', id: 'oar', x: -238, z: -148, r: 30, from: 18.35, to: 19.4 },
  /* THE DOWNS: the mill's creak; the drove; the herd. */
  { land: 'downs', id: 'mill-creak', x: 150, z: -8, r: 42 },
  { land: 'downs', id: 'sheep', x: 100, z: 76, r: 34 },
  { land: 'downs', id: 'cow-low', x: 140, z: -8, r: 24 },
  { land: 'downs', id: 'the-funeral-silence', x: 151, z: 64, r: 40, from: 15.0, to: 16.0, silence: true },
  /* THE PENWOOD: the tarn's drip; Brack's silence; the deep pines
   * after dark, where the pine-tick stops. */
  { land: 'forest', id: 'tarn-drip', x: 150, z: -195, r: 30 },
  { land: 'forest', id: 'brack-silence', x: 150, z: -153, r: 20, silence: true },
  { land: 'forest', id: 'deep-pines-silence', x: 188, z: -246, r: 34, from: 20.4, to: 5.2, silence: true },
  /* SPLITROCK: the rag on Holt's hull, by day. */
  { land: 'canyon', id: 'hull-rag', x: 306, z: -234, r: 34, from: 5.8, to: 20.4 },
  /* THE FLATS: the palms before the water; the cans on the track at
   * night. */
  { land: 'desert', id: 'palm-rattle', x: 305, z: 55, r: 26 },
  { land: 'desert', id: 'can-knock', x: 303.5, z: 75, r: 25, from: 20.5, to: 4.5 },
  /* MAPLE COURT: the sprinkler you never find, and the dog two streets
   * over, are heard across the built part of the land and nowhere
   * else; the swing on the green. */
  { land: 'neighborhood', id: 'sprinkler', x: -28, z: 190, r: 62, from: 8, to: 20.5 },
  { land: 'neighborhood', id: 'far-dog', x: -28, z: 190, r: 62 },
  /* GREYLINE: the crossing's tick at the junction; and (Session 20)
   * THE BARISTA calling a name on the hour from the cart, seven till
   * six, for nobody. */
  { land: 'city', id: 'crossing-tick', x: 148, z: 203, r: 34 },
  { land: 'city', id: 'order-call', x: 153, z: 216, r: 30, from: 7, to: 18.6 },
  /* THE CUBICLE MILE: the cup, in the atrium, by day; and (Session 20)
   * THE SQUARE FLOCK in the overflow's bays, which is the second thing
   * that has ever happened there. */
  { land: 'office', id: 'cup-turn', x: 334, z: 191, r: 40, from: 7, to: 19.5 },
  { land: 'office', id: 'car-door', x: 322, z: 200, r: 30, from: 7, to: 19.5 },
  { land: 'office', id: 'sheep', x: 308, z: 150, r: 28 },
  /* THE FLATS (Session 20): THE LIGHTS OVER THE PAN, after dark, a hum
   * under the grit. Nothing says what it is. */
  { land: 'desert', id: 'pale-hum', x: 268, z: 52, r: 40, from: 20.5, to: 5.2 },
  /* MAPLE COURT (Session 20): THE LOW DOG on the green, by day. */
  { land: 'neighborhood', id: 'yap', x: 2, z: 180, r: 26, from: 7, to: 20 },
];

/** How near the sea the walker has to be before the surf is a PLACE
 *  and not a bed: the same forty-six units `App.ts` ramps the breakers
 *  over. And the slot's own wind, on the canyon floor. */
export const SURF_REACH = 46;
const MOVING: Moving[] = [
  { land: 'beach', id: 'surf-break', r: SURF_REACH, dist: (x, z) => Math.max(0, x - coastX(z)) },
  { land: 'ocean', id: 'surf-break', r: 22, dist: (x, z) => barDist(x, z) },
  { land: 'canyon', id: 'slot-wind', r: 13, dist: (x, z) => (z < -132 && z > -258 ? Math.abs(x - tearX(z)) : 1e9) },
];

/** How far a scheduled event with a place is heard. */
export const EVENT_REACH = 45;

function keeps(v: { from?: number; to?: number }, hour: number): boolean {
  if (v.from === undefined || v.to === undefined) return true;
  if (v.from <= v.to) return hour >= v.from && hour < v.to;
  return hour >= v.from || hour < v.to;
}

/** One placed voice, by land and id — for `App.ts`, so the ambient
 *  table and the tool agree on a number. */
export function voice(land: RegionId, id: string): Voice {
  const v = VOICES.find((e) => e.land === land && e.id === id);
  if (!v) throw new Error(`no placed voice ${id} in ${land}`);
  return v;
}

export type Heard = { id: string; d: number; silence?: true };

/**
 * Everything in earshot at (x, z) at an hour — placed voices in reach
 * and keeping their hours, and scheduled events with a place that are
 * in progress. Pure, and the tool's whole question.
 */
export function earshotAt(x: number, z: number, hour: number): Heard[] {
  const out: Heard[] = [];
  for (const v of VOICES) {
    if (!keeps(v, hour)) continue;
    const d = Math.hypot(x - v.x, z - v.z);
    if (d < v.r) out.push({ id: v.id, d, silence: v.silence });
  }
  for (const m of MOVING) {
    if (!keeps(m, hour)) continue;
    const d = m.dist(x, z);
    if (d < m.r) out.push({ id: m.id, d });
  }
  const routineIds = new Set(routines.map((r) => r.id));
  for (const ev of events.all) {
    if (!ev.place) continue;
    if (routineIds.has(ev.id) || ev.id.includes('/')) continue;
    if (!happening.ids.has(ev.id)) continue;
    const d = Math.hypot(x - ev.place.x, z - ev.place.z);
    if (d < EVENT_REACH) out.push({ id: `event:${ev.id}`, d });
  }
  return out;
}
