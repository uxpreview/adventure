// Session 2 contact sheet: THE COMMON + the title + the Brim vista,
// hand-framed from the shipping camera (the camera looks north, so a
// subject is framed by standing south of it).
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const OUT = process.env.OUT ?? 'shots-s2';
mkdirSync(OUT, { recursive: true });

const FRAMINGS = [
  // [file, x, z, settleMs]
  ['01-common-wide', -45, 84, 1200],
  ['02-the-shot', -45, 66, 1200],
  ['03-crossroads-mid', -45, 63, 900],
  ['04-crossroads-detail', -44.5, 57, 900],
  ['05-well-mid', -56, 53, 900],
  ['06-well-detail', -56.5, 48, 900],
  ['07-oaks-wide', -97, 48, 1000],
  ['08-oaks-mid', -96, 35, 1000],
  ['09-gate-fields-mid', -45, 32, 1000],
  ['10-gate-detail', -45, 6, 1400],
  ['11-fence-wide', 12, 78, 1000],
  ['12-fence-mid', 10, 70, 900],
  ['13-riverbend', 52, 108, 1000],
  ['14-west-void', -118, 72, 900],
  ['15-inside-kingdom-look-back', -45, -22, 2000],
];

const url = process.env.URL ?? 'http://localhost:4173/?debug';
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
await page.addInitScript(() => localStorage.clear());
page.on('console', (m) => { if (m.type() === 'error') console.log('PAGE ERROR:', m.text()); });
page.on('pageerror', (e) => console.log('PAGE EXCEPTION:', e.message));

await page.goto(url, { waitUntil: 'networkidle' });
// mid-load: the loader must own the screen alone (no title bleed)
await page.waitForTimeout(1100);
await page.screenshot({ path: `${OUT}/00a-loader-mid.png` });
// settled title = the poster
await page.waitForTimeout(2600);
await page.screenshot({ path: `${OUT}/00b-title.png` });

await page.evaluate(() => window.__inklands.begin());
await page.waitForTimeout(1400);

for (const [name, x, z, settle] of FRAMINGS) {
  await page.evaluate(([tx, tz]) => window.__inklands.goto(tx, tz), [x, z]);
  await page.waitForTimeout(settle);
  // a few real strides so prints and the grass-part show up
  await page.keyboard.down('KeyW');
  await page.waitForTimeout(450);
  await page.keyboard.up('KeyW');
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/${name}.png` });
}

// portrait check of the poster
await page.close(); // a backgrounded page gets rAF-throttled: no loader tween
const p2 = await browser.newPage({ viewport: { width: 390, height: 844 } });
await p2.addInitScript(() => localStorage.clear());
await p2.goto(url, { waitUntil: 'networkidle' });
await p2.bringToFront();
await p2.waitForTimeout(5400);
await p2.screenshot({ path: `${OUT}/16-title-portrait.png` });

await browser.close();
console.log('done →', OUT);
