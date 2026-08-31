// FARM & FOREST — Session 10's contact sheet.
//
//   npx vite preview --port 4173 &
//   node tools/shoot-farm-forest.mjs
//
// Built on Session 9's harness, which is the whole reason this sheet is
// affordable: every clock in the game is pinned, the walker is driven in
// GAME seconds at a fixed sixtieth, and one frame is rendered at the
// end. A twelve-second settle — long enough for the ink-in cascade to
// finish crossing a land — costs about a third of a second instead of
// seventy, so this sheet shoots both lands, both viewports, two hours
// and four DRIVEN framings in minutes.
//
// Every framing is settled PAST the cascade. Session 8's pigeons were
// wrong for four sessions because every framing this project owned was
// shot on a page still drawing itself.
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const OUT = process.env.OUT ?? 'shots-s10';
const URL = process.env.URL ?? 'http://localhost:4173/?debug';
const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 720 },
  { name: 'portrait', width: 390, height: 844 },
].filter((v) => !process.env.VIEWPORT || v.name === process.env.VIEWPORT);

/** north is −Z. */
const N = [0, -1], S = [0, 1], E = [1, 0], W = [-1, 0];

/* ---- THE HARROW DOWNS -------------------------------------------- */
const DOWNS = [
  ['10-downs-THE-SHOT',      145, 34],
  ['11-headland-picnic',     141, 24],
  ['12-mill-yard',           149, 10],
  ['13-home-field',          178, 30],
  ['14-the-drove',           101, 108],
  ['15-scarecrow',           128, 124],
  ['16-downs-arrival',       112, 40],
  ['17-downs-wide',          150, 74],
];
/* ---- THE WAIT, BEFORE AND AFTER --------------------------------- *
 * A wait's whole product is a permanent change in the world, and the
 * only way to photograph one is to photograph both states of it. The
 * harness hands the walker the knowledge (`learn`) rather than making
 * the sheet play the game to get it — the same trick Session 7 used to
 * shoot Brim's market. */
const WAITS = [
  // close, because the change is one plate and one figure's quarter
  // turn and a sheet shot from forty units cannot show either
  ['40-picnic-evening-BEFORE', 140, 18, 21.0, []],
  ['41-picnic-evening-AFTER', 140, 18, 21.0, ['fact:the-place-kept']],
  ['42-picnic-noon-BEFORE', 140, 18, 12.0, []],
  ['43-picnic-noon-AFTER', 140, 18, 12.0, ['fact:the-place-kept']],
  ['44-brack-BEFORE', 151, -144, 12, []],
  ['45-brack-AFTER', 151, -144, 12, ['fact:the-tarn']],
  ['46-brack-dusk-BEFORE', 151, -144, 19.6, []],
  ['47-brack-dusk-AFTER', 151, -144, 19.6, ['fact:the-tarn']],
];

const DOWNS_DRIVEN = [
  ['18-drove-sheep-DRIVEN',  101, 118, N, 6],
  ['19-mill-lane-DRIVEN',    147, 56, N, 7],
];

/* ---- THE PENWOOD -------------------------------------------------- */
const FOREST = [
  ['20-penwood-THE-SHOT',    150, -146],
  ['21-the-round-east',      186, -178],
  ['22-the-tarn-shore',      150, -176],
  ['23-the-oars',            103, -147],
  ['24-wood-road',            76, -122],
  ['25-deep-pines',          186, -240],
  ['26-penwood-arrival',      68, -112],
  ['27-under-the-pines',     124, -196],
];
const FOREST_DRIVEN = [
  ['28-brack-turns-DRIVEN',  150, -136, N, 4],
  ['29-track-DRIVEN',        112, -140, N, 6],
];

/* ---- the seam the two lands share, and the one protected framing
 *      that can see either of them ---------------------------------- */
const SEAM = [
  ['30-downs-forest-seam',   150, -88],
  ['31-crease-east-road',     62, 62],
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

  /** Stand somebody at (x, z) and let the page finish drawing itself. */
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

  console.log(`[${vp.name}] THE HARROW DOWNS`);
  for (const [n, x, z] of DOWNS) {
    await frame(n, x, z);
    await frame(`${n}-dusk`, x, z, { hour: 19.6 });
  }
  for (const [n, x, z, m, w] of DOWNS_DRIVEN) await frame(n, x, z, { move: m, walk: w });

  console.log(`[${vp.name}] THE PENWOOD`);
  for (const [n, x, z] of FOREST) {
    await frame(n, x, z);
    await frame(`${n}-dusk`, x, z, { hour: 19.6 });
  }
  for (const [n, x, z, m, w] of FOREST_DRIVEN) await frame(n, x, z, { move: m, walk: w });

  console.log(`[${vp.name}] the waits, both states`);
  for (const [n, x, z, hour, learn] of WAITS) await frame(n, x, z, { hour, learn });

  console.log(`[${vp.name}] the seams`);
  for (const [n, x, z] of SEAM) await frame(n, x, z);

  console.log(`  ${vp.name} → ${dir}`);
  await page.close();
}

await browser.close();
console.log('done →', OUT);
