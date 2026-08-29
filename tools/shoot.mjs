// The walkability smoke test: begin the game, teleport into each of the
// twelve lands, walk a few real strides, screenshot. Both viewports
// since Session 4. This is the sheet that catches a land elevation has
// made unreachable or unstandable — `tools/check-terrain.mjs` catches
// it cheaper, but this one catches what the check cannot see.
import { shoot } from './shoot-lib.mjs';

const SPOTS = [
  ['meadow', -45, 58],
  ['kingdom', -45, -85],
  ['castle', -45, -215],
  ['forest', 145, -190],
  ['canyon', 300, -150],
  ['desert', 300, 45],
  ['downs', 148, -5],
  ['beach', -205, 60],
  ['ocean', -270, 60],
  ['neighborhood', -45, 195],
  ['city', 148, 205],
  ['office', 280, 205],
];

await shoot({
  out: process.env.OUT ?? 'shots',
  map: true,
  framings: SPOTS.map(([name, x, z]) => [name, x, z, 1100]),
});
