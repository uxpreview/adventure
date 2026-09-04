/**
 * THE ROOKS CROSS, AND NOBODY LOOKS UP (Session 17, `THE-FUN-PASS` §9's
 * one free thematic layer).
 *
 * Nobody crosses a border but the walker — and birds do. Three rooks
 * roost on Greyweather's keep at night, fly out at twenty to seven in
 * the morning to the scarecrow in the Downs' crow field, sit on it all
 * day, and fly home at twenty to seven in the evening. Two hundred and
 * fifty units, over Brim and the Common, in eighteen seconds. The
 * castle draws the flight while it is nearer the castle and the Downs
 * draw it while it is nearer the Downs, off this one function, so
 * there is exactly one flight and two lands that can see it.
 *
 * Recorded here so no session removes it as a bug: it is eerie or
 * lovely depending on when you notice, and it costs nothing.
 */
import { events } from './events';

export const ROOK_ROOST = { x: -50, z: -249, lift: 16.4 };
export const ROOK_PERCH = { x: 128, z: 112, lift: 3.7 };
const OUT = { at: 6.4, hours: 0.18 };
const HOME = { at: 18.6, hours: 0.18 };
events.register({ id: 'the-rooks-cross-out', land: 'castle', ...OUT, place: ROOK_ROOST });
events.register({ id: 'the-rooks-cross-home', land: 'downs', ...HOME, place: ROOK_PERCH });

export type RookState = { x: number; z: number; lift: number; flying: boolean; where: 'castle' | 'downs' | 'air'; face: -1 | 1 };

/** Where rook `i` of three is at an hour. */
export function rookAt(i: number, hour: number): RookState {
  const lag = i * 0.012;
  const out = events.progress('the-rooks-cross-out', hour - lag);
  const home = events.progress('the-rooks-cross-home', hour - lag);
  const dx = (i - 1) * 2.6;
  if (out >= 0 || home >= 0) {
    const u = out >= 0 ? out : 1 - home;
    const e = u * u * (3 - 2 * u);
    const x = ROOK_ROOST.x + (ROOK_PERCH.x - ROOK_ROOST.x) * e + dx;
    const z = ROOK_ROOST.z + (ROOK_PERCH.z - ROOK_ROOST.z) * e + (i - 1) * 1.8;
    // the flight climbs out of the roost, crosses high, and drops on the field
    const lift = ROOK_ROOST.lift + (ROOK_PERCH.lift - ROOK_ROOST.lift) * e + Math.sin(u * Math.PI) * 14;
    const where = z < -55 ? 'castle' : z > -55 ? 'downs' : 'air';
    return { x, z, lift, flying: true, where, face: out >= 0 ? 1 : -1 };
  }
  const outEnd = OUT.at + OUT.hours;
  const away = hour >= outEnd && hour < HOME.at;
  if (away) return { x: ROOK_PERCH.x + dx * 0.4 - 0.6, z: ROOK_PERCH.z, lift: ROOK_PERCH.lift + (i % 2) * 0.25, flying: false, where: 'downs', face: i % 2 ? -1 : 1 };
  return { x: ROOK_ROOST.x + dx * 1.6, z: ROOK_ROOST.z, lift: ROOK_ROOST.lift, flying: false, where: 'castle', face: i % 2 ? -1 : 1 };
}
