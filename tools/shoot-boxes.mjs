// THE PAPER BOXES, photographed (2026-09-23).
//
//   npx vite preview --port 4173 &
//   node tools/shoot-boxes.mjs
//   ONLY=terrace HOURS=12,21 node tools/shoot-boxes.mjs
//
// Every building that is a box (`regions/box.ts`), the lens orbiting it
// at four bearings with the walker between, at noon and after dark:
// the box has to read as one building from every side, and its lit
// windows have to stay on its windows when the lens turns.
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { CHROMIUM } from './pw.mjs';

const OUT = process.env.OUT ?? 'shots-boxes';
const URL = process.env.URL ?? 'http://localhost:4173/?debug';
const HOURS = (process.env.HOURS ?? '12,21').split(',').map(Number);
const BEARINGS = (process.env.BEARINGS ?? '0,70,140,220').split(',').map(Number);
/* PITCH=48 DIST=30: from higher and further, for the roofs */
const PITCH = process.env.PITCH ? (Number(process.env.PITCH) * Math.PI) / 180 : null;
const DIST = process.env.DIST ? Number(process.env.DIST) : null;

/* [name, the building's middle x, z, how far off the walker stands]:
 * at each bearing the walker stands that far from the middle, on the
 * lens's side, so the lens orbits the building and not the walker */
const PLACES = [
  ['terrace', -66, -61, 17],
  ['terrace-east', -25, -117, 17],
  ['court', -89, 144, 13],
  ['val', -78, 124, 14],
  ['marget', -80, -101, 13],
  ['keep', -45, -256, 30],
  ['loft', -34, -217.5, 11],
  ['holt', 302, -274.5, 11],
  ['huts', -205, -13, 13],
  ['office', 270, 183, 19],
  ['towers', 137, 168, 19],
].filter(([n]) => !process.env.ONLY || process.env.ONLY.split(',').includes(n));

mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ executablePath: CHROMIUM });
const p = await b.newPage({ viewport: { width: 960, height: 600 } });
await p.addInitScript(() => localStorage.clear());
p.on('pageerror', (e) => console.log('PAGE EXCEPTION', e.message));
await p.goto(URL, { waitUntil: 'networkidle' });
// the whole sheet inked first, however long that takes on this machine
await p.waitForSelector('.loader.gone', { state: 'attached', timeout: 240000 });
await p.waitForSelector('.title-veil:not(.gone)', { timeout: 30000 }).catch(() => {});
await p.evaluate(() => window.__inklands.begin());
await p.waitForTimeout(1000);

for (const [name, cx, cz, R0] of PLACES) {
  // from high up the walker stands close in, so the building is in frame
  // (and still in front of them, or the near-fade clears it)
  const R = PITCH === null ? R0 : Math.min(R0, 10);
  for (const hour of HOURS) {
    for (const deg of BEARINGS) {
      const yaw = (deg * Math.PI) / 180;
      // the lens looks along (sin yaw, −cos yaw); the walker stands short of the middle
      const x = cx - Math.sin(yaw) * R;
      const z = cz + Math.cos(yaw) * R;
      await p.evaluate(([x, z, yaw, hour, pitch, dist]) => {
        const I = window.__inklands;
        I.stepOff(); I.goto(x, z); I.setHour(hour); I.setYaw(yaw);
        if (pitch !== null) I.setPitch(pitch);
        if (dist !== null) I.setDist(dist);
        I.step(1 / 60, 90);
      }, [x, z, yaw, hour, PITCH, DIST]);
      await p.waitForTimeout(300);
      const f = `${OUT}/${name}${PITCH === null ? '' : '-high'}-h${hour}-${String(deg).padStart(3, '0')}.png`;
      await p.screenshot({ path: f });
      console.log(f);
    }
  }
}
await b.close();
