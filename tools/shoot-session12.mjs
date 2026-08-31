// THE SHOT OF ALL EIGHT BUILT LANDS, ON THE SESSION 12 CAMERA.
//
// A camera change touches every land in the world, so the art director's
// sheet for a camera session is not "this session's lands" — there are
// none — it is THE SHOT of every land that already holds a verdict,
// re-photographed down the new lens.
//
// Shot standing still, at the shipping bearing, in both viewports. That
// is deliberate and it is also the point: a stopped walker is due north
// by contract, so if this sheet differs from the shipped page at all,
// the contract broke. `diff-sheets` says it did not (92/92 on the page);
// this is the half a human looks at.
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { CHROMIUM } from './pw.mjs';

const SHOTS = [
  ['1-common',     -45, 66],
  ['2-brim',       -45, -26],
  ['3-greyweather', -45, -178],
  ['4-longshore',  -237, -49],
  ['5-wide-blue',  -292, -20],
  ['6-downs',       145, 34],
  ['7-penwood',     150, -146],
  ['8-canyon',      305, -222],
  ['9-flats',       303, 76],
];
const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 720 },
  { name: 'portrait', width: 390, height: 844 },
];

const out = process.env.OUT ?? 'shots/session12-sheet';
const url = process.env.URL ?? 'http://localhost:4173/?debug';
const HOUR = Number(process.env.HOUR ?? 12);
const browser = await chromium.launch({ executablePath: CHROMIUM });

for (const vp of VIEWPORTS) {
  const dir = `${out}/${vp.name}`;
  mkdirSync(dir, { recursive: true });
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
  await page.addInitScript(() => localStorage.clear());
  page.on('pageerror', (e) => console.log(`[${vp.name}] EXCEPTION:`, e.message));
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.bringToFront();
  await page
    .waitForFunction(() => document.body.innerText.toLowerCase().includes('set out'), {
      timeout: 25000,
    })
    .catch(() => {});
  await page.evaluate((h) => {
    window.__inklands.begin();
    window.__inklands.setHour(h, false);
  }, HOUR);
  await page.waitForTimeout(1000);

  for (const [name, x, z] of SHOTS) {
    // the harness clock: twelve game seconds of settle, so the page is
    // fully inked in and the frame is reproducible
    await page.evaluate(
      ([tx, tz]) => {
        const I = window.__inklands;
        I.goto(tx, tz);
        I.setTime(0);
        I.step(1 / 60, 720);
        I.quiet();
      },
      [x, z]
    );
    /* THE CHROME FADES ON A CSS TRANSITION, and `quiet()` only takes the
     * class off — so a sheet shot on the harness clock alone catches the
     * region card and the control hint half faded over the composition.
     * That is wall-clock and there is no pinning it: wait it out, then
     * step one more tick so the frame presented is the settled one. */
    await page.waitForTimeout(1400);
    await page.evaluate(() => window.__inklands.step(1 / 60, 1));
    await page.waitForTimeout(150);
    await page.screenshot({ path: `${dir}/${name}.png` });
  }
  console.log(`  ${vp.name}: ${SHOTS.length} framings → ${dir}`);
  await page.close();
}

await browser.close();
console.log('done →', out);
