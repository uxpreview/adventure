// THE DRY LANDS — Session 11's contact sheet.
//
//   npx vite preview --port 4173 &
//   node tools/shoot-dry.mjs
//
// Session 10's harness, unchanged, because it is the reason this sheet
// is affordable: every clock in the game is pinned, the walker is driven
// in GAME seconds at a fixed sixtieth, and one frame is rendered at the
// end. Thirteen game seconds of settle — past the ink-in cascade — costs
// about a third of a second instead of seventy.
//
// Every framing is settled PAST the cascade, both waits are photographed
// at BOTH their states, and AMOS is photographed at an hour no other
// sheet in this project has ever needed: the Bleach Flats' second
// composition only exists after the light goes.
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const OUT = process.env.OUT ?? 'shots-s11';
const URL = process.env.URL ?? 'http://localhost:4173/?debug';
const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 720 },
  { name: 'portrait', width: 390, height: 844 },
].filter((v) => !process.env.VIEWPORT || v.name === process.env.VIEWPORT);

/** north is −Z. */
const N = [0, -1], S = [0, 1];

/* ---- SPLITROCK CANYON -------------------------------------------- */
const CANYON = [
  ['10-canyon-THE-SHOT',   305, -196],
  ['11-the-mouth',         294, -118],
  ['12-dry-channel',       293, -150],
  ['13-the-needle',        292, -178],
  ['14-the-marks',         311, -200],
  ['15-the-boat',          310, -206],
  ['16-the-head',          305, -236],
  ['17-east-rim',          358, -196],
  ['18-west-bench',        258, -172],
  ['19-canyon-arrival',    288, -100],
];
const CANYON_DRIVEN = [
  ['20-channel-DRIVEN',    293, -140, N, 7],
  ['21-head-in-DRIVEN',    303, -258, S, 6],
];

/* ---- THE BLEACH FLATS -------------------------------------------- */
const FLATS = [
  ['30-flats-THE-SHOT',    301, 93],
  ['31-the-track',         303, 78],
  ['32-the-oasis',         305, 80],
  ['33-the-pan',           272, 84],
  ['34-the-saguaros',      308, 40],
  ['35-the-milepost',      248, 15],
  ['36-long-walk',         287, -14],
  ['37-flats-arrival',     254, 10],
  ['38-flats-wide',        286, 116],
];
const FLATS_DRIVEN = [
  ['39-track-DRIVEN',      302, 92, N, 7],
];

/* ---- THE WAITS, BEFORE AND AFTER ---------------------------------- *
 * A wait's whole product is a permanent change in the world and the only
 * way to photograph one is to photograph both states of it. The harness
 * hands the walker the knowledge (`learn`) rather than making the sheet
 * play the game to get it — which for Holt would mean rowing the entire
 * river and for Amos two hundred units of fold.                        */
const WAITS = [
  ['40-boat-BEFORE',        310, -206, 12.0, []],
  ['41-boat-AFTER',         310, -206, 12.0, ['route:the-river']],
  ['42-boat-dusk-BEFORE',   310, -206, 19.6, []],
  ['43-boat-dusk-AFTER',    310, -206, 19.6, ['route:the-river']],
  ['44-cistern-BEFORE',     301, 101, 12.0, []],
  ['45-cistern-AFTER',      301, 101, 12.0, ['fact:the-fold']],
  ['46-cistern-dusk-BEFORE', 301, 101, 19.6, []],
  ['47-cistern-dusk-AFTER',  301, 101, 19.6, ['fact:the-fold']],
  // and the one composition in this world that only exists in the dark
  ['48-amos-at-night',      303, 86, 22.0, []],
  ['49-amos-at-night-late', 303, 72, 22.6, []],
];

/* ---- the seams, and the two protected framings that look in ------- */
const SEAM = [
  ['50-canyon-flats-seam', 300, -96],
  ['51-curl-rim',          370, 16],
  ['52-tear-lip',          312, -140],
];

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });

for (const vp of VIEWPORTS) {
  const dir = `${OUT}/${vp.name}`;
  mkdirSync(dir, { recursive: true });
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
  await page.addInitScript(() => localStorage.clear());
  page.on('pageerror', (e) => console.log(`[${vp.name}] PAGE EXCEPTION:`, e.message));
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.bringToFront();
  await page
    .waitForFunction(() => document.body.innerText.toLowerCase().includes('set out'), { timeout: 25000 })
    .catch(() => {});
  await page.evaluate(() => window.__inklands.begin());
  await page.waitForTimeout(1200);

  const frame = async (name, x, z, opts = {}) => {
    await page.evaluate(
      ([tx, tz, mx, mz, hour, walkS, learn]) => {
        const I = window.__inklands;
        I.setBearing(!!(mx || mz));
        I.setHour(hour, false);
        (learn || []).forEach((k) => I.learn(k));
        I.goto(tx, tz);
        I.setTime(0);
        I.step(1 / 60, 780);        // thirteen game seconds: the land inks in
        I.quiet();
        if (mx !== 0 || mz !== 0) I.drive(mx, mz, 0);
        I.step(1 / 60, Math.round(walkS * 60));
        I.release();
      },
      [x, z, opts.move?.[0] ?? 0, opts.move?.[1] ?? 0, opts.hour ?? 12,
        opts.walk ?? 0, opts.learn ?? []]
    );
    await page.waitForTimeout(420);
    await page.screenshot({ path: `${dir}/${name}.png` });
  };

  console.log(`[${vp.name}] SPLITROCK CANYON`);
  for (const [n, x, z] of CANYON) {
    await frame(n, x, z);
    await frame(`${n}-dusk`, x, z, { hour: 19.6 });
  }
  for (const [n, x, z, m, w] of CANYON_DRIVEN) await frame(n, x, z, { move: m, walk: w });

  console.log(`[${vp.name}] THE BLEACH FLATS`);
  for (const [n, x, z] of FLATS) {
    await frame(n, x, z);
    await frame(`${n}-dusk`, x, z, { hour: 19.6 });
  }
  for (const [n, x, z, m, w] of FLATS_DRIVEN) await frame(n, x, z, { move: m, walk: w });

  console.log(`[${vp.name}] the waits, both states`);
  for (const [n, x, z, hour, learn] of WAITS) await frame(n, x, z, { hour, learn });

  console.log(`[${vp.name}] the seams`);
  for (const [n, x, z] of SEAM) await frame(n, x, z);

  console.log(`  ${vp.name} → ${dir}`);
  await page.close();
}

await browser.close();
console.log('done →', OUT);
