// THE DRY LANDS — Session 11's contact sheet.
//
//   npm run build && npx vite preview --port 4173 &
//   node tools/shoot-dry-lands.mjs
//
// Built on Session 9's harness, exactly as Session 10's sheet was: every
// clock in the game is pinned, the walker is driven in GAME seconds at a
// fixed sixtieth, and one frame is rendered at the end. Every framing is
// settled PAST the ink-in cascade (thirteen game seconds), both viewports
// are shot, every land framing is shot at two hours, and BOTH STATES OF
// BOTH WAITS are here — the harness hands the walker the knowledge with
// `learn` rather than making the sheet play the game to get it.
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const OUT = process.env.OUT ?? 'shots-s11';
const URL = process.env.URL ?? 'http://localhost:4173/?debug';
const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 720 },
  { name: 'portrait', width: 390, height: 844 },
].filter((v) => !process.env.VIEWPORT || v.name === process.env.VIEWPORT);

/** north is −Z. */
const N = [0, -1];
const S = [0, 1];

/* ---- SPLITROCK CANYON -------------------------------------------- *
 * Every one of these looks north, because the camera's resting bearing
 * is north and the channel runs north. That is not a coincidence: the
 * tear was MOVED this session partly because `tearX` is a function of z
 * and therefore already obeys the law.                                */
const CANYON = [
  ['10-canyon-THE-SHOT',      305, -222],
  ['11-the-mouth',            293, -142],
  ['12-channel-mid',          298, -172],
  ['13-needle-arch',          299, -158],
  ['14-the-overlook',         280, -176],
  ['15-the-riverhead',        300, -100],
  ['16-the-far-side',         324, -196],
  ['17-the-trestles',         304, -228],
  ['18-canyon-arrival',       300, -128],
];
const CANYON_DRIVEN = [
  ['19-channel-DRIVEN',       300, -206, N, 7],
  ['20-mouth-DRIVEN',         295, -150, N, 6],
];

/* ---- THE BLEACH FLATS -------------------------------------------- */
const FLATS = [
  ['30-flats-THE-SHOT',       303, 76],
  ['31-the-catch',            303, 108],
  ['32-oasis-from-the-south', 305, 72],
  ['34-the-pale',             268, 76],
  ['35-the-hands',            266, 28],
  ['36-where-the-road-stops', 348, 34],
  ['37-flats-wide',           300, 122],
  ['38-flats-arrival',        242, 30],
];
const FLATS_DRIVEN = [
  ['39-track-DRIVEN',         303, 96, N, 6],
  /* THE-STRANGERS C22 — *the oasis, from the wrong direction, and it is
   * not there.* It cannot be photographed standing still, because the
   * whole of it is that you are walking AWAY from the water while the
   * camera looks the way it always looks. So it is driven SOUTH, and
   * what the frame shows is a stand of palms with nothing under them. */
  ['33-oasis-from-the-north-DRIVEN', 305, 20, S, 3.4],
];

/* ---- THE WAITS, BEFORE AND AFTER --------------------------------- *
 * A wait's whole product is a permanent change in the world and the
 * only way to photograph one is to photograph both states of it.     */
const WAITS = [
  ['40-holt-BEFORE',          305, -224, 12.0, []],
  ['41-holt-AFTER',           305, -224, 12.0, ['route:the-river']],
  ['42-holt-dusk-BEFORE',     305, -224, 19.6, []],
  ['43-holt-dusk-AFTER',      305, -224, 19.6, ['route:the-river']],
  ['44-holt-night',           305, -224, 22.4, []],
  ['45-the-marks',            304, -240, 12.0, []],
  ['50-cistern-BEFORE',       302, 106, 12.0, []],
  ['51-cistern-AFTER',        302, 106, 12.0, ['fact:the-fold']],
  ['52-cistern-dusk-BEFORE',  302, 106, 19.6, []],
  ['53-cistern-dusk-AFTER',   302, 106, 19.6, ['fact:the-fold']],
  ['54-amos-on-the-track',    303, 86, 0.2, []],
];

/* ---- the seam the two lands share, and the two protected framings
 *      that stand INSIDE this session's scope ---------------------- */
const SEAM = [
  ['60-tear-lip',             312, -140],
  ['61-curl-rim',             370, 16],
  ['62-canyon-flats-seam',    300, -92],
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
