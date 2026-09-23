// WHAT YOU SEE IS WHAT STOPS YOU, ASSERTED.
//
//   npx vite preview --port 4173 &
//   node tools/check-solid.mjs
//
// 2026-09-23. A solid standee's barrier lies on its authored line; when
// the drawing turned to the lens it swung off that line, and a gate's
// arch was no longer over the gap you walk through. Solid standees hold
// their line now (regions/index.ts, `standee`). This walks the walker
// at the gates and along the walls from four camera bearings: every
// gate must let you through and every wall must stop you, whichever
// way the lens is turned, and the doors must still let you into rooms.
import { chromium } from 'playwright';
import { CHROMIUM } from './pw.mjs';

const URL = process.env.URL ?? 'http://localhost:4173/?debug';
const b = await chromium.launch({ executablePath: CHROMIUM });
const p = await b.newPage({ viewport: { width: 800, height: 500 } });
await p.addInitScript(() => localStorage.clear());
p.on('pageerror', (e) => console.log('PAGE EXCEPTION', e.message));
await p.goto(URL, { waitUntil: 'networkidle' });
await p.waitForSelector('.title-veil:not(.gone)', { timeout: 30000 }).catch(() => {});
await p.evaluate(() => window.__inklands.begin());
await p.waitForTimeout(1000);

const D = (d) => (d * Math.PI) / 180;
/** Walk a WORLD direction for `secs` of game time with the lens at `yaw`. */
const walk = (x, z, dir, yaw, secs) => p.evaluate(([x, z, dir, yaw, secs]) => {
  const I = window.__inklands;
  I.stepOff(); I.goto(x, z); I.setYaw(yaw); I.step(1 / 60, 30);
  const f = [Math.sin(yaw), -Math.cos(yaw)], r = [Math.cos(yaw), Math.sin(yaw)];
  I.drive(dir[0] * r[0] + dir[1] * r[1], -(dir[0] * f[0] + dir[1] * f[1]), 0);
  I.step(1 / 60, Math.round(secs * 60));
  I.release(); I.step(1 / 60, 10);
  return [I.char.pos.x, I.char.pos.z, I.roomK?.() ?? 0];
}, [x, z, dir, D(yaw), secs]);

const N = [0, -1], E = [1, 0];
/* [label, start x, z, world direction, seconds, passes if] */
const CASES = [
  ['Brim south gate lets you through', -45, -2, N, 10, (q) => q[1] < -20],
  ['Brim south wall stops you', -62, -2, N, 10, (q) => q[1] > -14],
  ['Brim east gate lets you through', 44, -110, E, 10, (q) => q[0] > 62],
  ['Brim east wall stops you', 44, -92, E, 10, (q) => q[0] < 57],
  ['Greyweather gate lets you through', -45, -180, N, 10, (q) => q[1] < -198],
];
const DOORS = [
  ["Val's door", -78, 134], ["Marget's door", -80, -91], ['the loft door', -34, -208],
];

let fails = 0;
const say = (ok, msg) => { if (!ok) fails++; console.log(`  ${ok ? '✓' : '✗'} ${msg}`); };
for (const yaw of [0, 60, -60, 150]) {
  for (const [label, x, z, dir, secs, ok] of CASES) {
    const q = await walk(x, z, dir, yaw, secs);
    say(ok(q), `${label} — lens at ${yaw}° (ended ${q[0].toFixed(1)}, ${q[1].toFixed(1)})`);
  }
}
for (const [label, x, z] of DOORS) {
  const q = await walk(x, z, N, 0, 8);
  say(q[2] > 0.5, `${label} lets you into the room (room ${q[2].toFixed(2)})`);
}
await b.close();
console.log(fails ? `\n${fails} FAILURE(S)` : '\nall clear');
process.exit(fails ? 1 : 0);
