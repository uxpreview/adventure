// Session 3 contact sheet: THE KINGDOM OF BRIM interior + CASTLE
// GREYWEATHER, plus the protected Session 2 south-approach framings
// (first-minute 09/10) which may not regress. The camera looks north,
// so a subject is framed by standing south of it.
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const OUT = process.env.OUT ?? 'shots-s3';
mkdirSync(OUT, { recursive: true });

const FRAMINGS = [
  // [file, x, z, settleMs]
  // protected: the S2 south approach (must match the WOWED sheet)
  ['01-gate-fields-mid-PROT', -45, 32, 1200],
  ['02-gate-detail-PROT', -45, 6, 1400],
  // the town
  ['03-street-shot', -45, -26, 1600],
  ['04-street-mid', -45, -48, 1000],
  ['05-square-wide', -45, -62, 1200],
  ['06-square-mid', -45, -70, 1000],
  ['07-square-detail', -47, -76, 900],
  ['08-belfry-yard', -68, -34, 1000],
  ['09-orchard', -103, -52, 1200],
  ['10-market-lane', 8, -88, 1000],
  ['11-wood-gate', 44, -98, 1000],
  ['12-north-street', -45, -128, 1000],
  ['13-north-gate-approach', -45, -142, 1200],
  // the castle
  ['14-castle-reveal', -45, -163, 1600],
  ['15-castle-shot', -45, -172, 1400],
  ['16-gatehouse-detail', -45, -189, 1000],
  ['17-bailey', -45, -211, 1200],
  ['18-keep-mid', -45, -224, 1200],
  ['19-keep-detail', -45, -234, 1000],
  ['20-moat-pool', -100, -200, 1200],
  ['21-ridge-west', -120, -182, 1000],
];

const url = process.env.URL ?? 'http://localhost:4173/?debug';
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
await page.addInitScript(() => localStorage.clear());
page.on('console', (m) => { if (m.type() === 'error') console.log('PAGE ERROR:', m.text()); });
page.on('pageerror', (e) => console.log('PAGE EXCEPTION:', e.message));

await page.goto(url, { waitUntil: 'networkidle' });
// wait for the title to actually be up: begin() before showTitle
// leaves the overlay burned into every frame
await page.waitForFunction(
  () => document.body.innerText.toLowerCase().includes('set out'),
  { timeout: 15000 }
).catch(() => {});
await page.waitForTimeout(900);
// the title poster is protected too
await page.screenshot({ path: `${OUT}/00-title-PROT.png` });

await page.evaluate(() => window.__inklands.begin());
await page.waitForTimeout(1400);

for (const [name, x, z, settle] of FRAMINGS) {
  await page.evaluate(([tx, tz]) => window.__inklands.goto(tx, tz), [x, z]);
  await page.waitForTimeout(settle);
  // a few real strides so prints, fades and proximity motion show up
  await page.keyboard.down('KeyW');
  await page.waitForTimeout(450);
  await page.keyboard.up('KeyW');
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/${name}.png` });
}

// the map should show the new market lane
await page.keyboard.press('KeyM');
await page.waitForTimeout(900);
await page.screenshot({ path: `${OUT}/22-map.png` });

await browser.close();
console.log('done →', OUT);
