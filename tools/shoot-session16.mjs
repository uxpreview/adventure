// THE FIRST HOUR — Session 16's contact sheet.
//
//   npx vite preview --port 4173 &
//   node tools/shoot-session16.mjs
//
// The opening the owner chose (`THE-FUN-PASS` §11), photographed in the
// order a player meets it: the wake, the bull looking, the charge, the
// gate going shut, the bull at the fence, the goat falling in and
// stopping at the border, the four lures from the crossroads on both
// rigs at rest and on a peek, the fair ground, Nell at every posture,
// and both her doors. On the harness clock, both viewports, chrome
// swept unless the frame is ABOUT the chrome.
//
// Framings are [name, x, z, opts?]:
//   opts.hour     hold the sheet at an o'clock
//   opts.learn    hand the walker knowledge before the frame
//   opts.do       a function name on the DO table, run before settling
//   opts.chrome   keep the prompt and cards in the picture
//   opts.wait     extra game seconds of settle
//   opts.fresh    a new page (the opening is stateful)
//   opts.bearing  let the camera turn (the peek frames)
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { CHROMIUM } from './pw.mjs';

const SHOTS = [
  /* ---- THE BULL ------------------------------------------------------ */
  ['01-wake-in-the-long-grass',   24, 82,   { chrome: true, wait: 0.3 }],
  ['02-the-bull-is-looking',      24, 82,   { do: 'watch', wait: 0 }],
  ['03-the-charge',               24, 82,   { do: 'charge', wait: 0, chrome: true }],
  ['04-the-gate-shuts',           -17, 84,  { do: 'throughTheGate', wait: 0 }],
  ['05-the-bull-at-the-hedge',    -17, 86,  { do: 'atTheFence', wait: 0 }],
  ['06-balked-in-your-face',      24, 82,   { fresh: true, do: 'standStill', wait: 0 }],
  /* ---- THE GOAT ------------------------------------------------------ */
  ['07-the-goat-falls-in',        -24, 62, { fresh: true, do: 'goatFollows', wait: 0 }],
  ['08-the-goat-at-the-brim-gate', -45, -18, { do: 'goatNorth', wait: 0 }],
  ['09-the-goat-at-the-east-edge', 66, 47, { fresh: true, do: 'goatEast', wait: 0 }],
  /* ---- THE FOUR LURES ------------------------------------------------ */
  ['10-lures-from-the-crossroads', -45, 58, { fresh: true }],
  ['11-lures-peek-left',           -45, 58, { bearing: true, do: 'peekLeft', wait: 0 }],
  ['12-lures-peek-right',          -45, 58, { bearing: true, do: 'peekRight', wait: 0 }],
  ['13-lures-from-THE-SHOT',       -45, 66, {}],
  ['14-lures-fading-at-the-gate-fields', -45, 24, {}],
  /* ---- THE PLATEAU --------------------------------------------------- */
  ['15-the-fair-ground',           -95, 112, { chrome: true }],
  ['16-the-district-card',         -60, 70, { do: 'crossDistrict', chrome: true, wait: 0.2 }],
  /* ---- NELL ---------------------------------------------------------- */
  ['17-nell-leaning',              -16, 90,  { fresh: true, do: 'nellLeans', wait: 0, chrome: true }],
  ['18-nell-straightens',          -16, 90,  { do: 'nellStraightens', wait: 0 }],
  ['19-nell-watches-the-cart',     -16, 92, { do: 'pushCartEast', wait: 0 }],
  ['20-nell-the-card',             -16, 78,  { fresh: true, learn: ['fact:the-timetable'], do: 'openNellCard', chrome: true, wait: 0 }],
  ['21-door-one-turned-north',     12, 84, { learn: ['door:the-cart-turned-north'] }],
  ['22-door-one-nell',             -16, 90,  { learn: ['door:the-cart-turned-north'], chrome: true }],
  ['23-door-two-cart-at-the-border', 52, 84, { fresh: true, learn: ['fact:the-timetable', 'door:the-cart-pushed'], do: 'pushCartToBorder', wait: 0 }],
  ['24-door-two-nell',             -16, 90,  { learn: ['door:the-cart-pushed'], chrome: true }],
  ['25-the-map-with-districts',    -45, 58, { do: 'openMap', chrome: true, wait: 0 }],
];

const OUT = process.env.OUT ?? 'shots-s16';
const URL = process.env.URL ?? 'http://localhost:4173/?debug';
const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 720 },
  { name: 'portrait', width: 390, height: 844 },
].filter((v) => !process.env.VIEWPORT || v.name === process.env.VIEWPORT);
/** `ONLY=bull,goat` — a comma list of name fragments, for re-shooting. */
const ONLY = (process.env.ONLY ?? '').split(',').filter(Boolean);

const browser = await chromium.launch({ executablePath: CHROMIUM });

/** The little scripts a framing can ask for, run in the page. Every
 *  one drives the walker the way a player would. */
const DO = {
  watch: `I.step(1/60, 40);`,
  charge: `I.step(1/60, 70); I.drive(-1, -0.22, 1); I.step(1/60, 120); I.release();`,
  throughTheGate: `I.goto(24, 82); I.step(1/60, 70); I.drive(-1, 0, 1); I.step(1/60, 400); I.release(); I.step(1/60, 10);`,
  atTheFence: `I.step(1/60, 60);`,
  standStill: `I.step(1/60, 200);`,
  goatFollows: `I.goto(-24, 62); I.step(1/60, 30); I.drive(-1, -0.4, 0); I.step(1/60, 150); I.release(); I.step(1/60, 30);`,
  /* Over the border, and then a few steps back toward it: the goat is
   * behind a north-locked camera once you have crossed north, and the
   * astern opening on a walk south is the only way to see it. */
  goatNorth: `const g = I.common.goat; g.x = -45; g.z = 44; g.following = true; g.atBorder = false; I.goto(-45, 40); I.step(1/60, 60); I.drive(0, -1, 0); I.step(1/60, 700); I.drive(0, 1, 0); I.step(1/60, 100); I.release(); I.step(1/60, 2);`,
  goatEast: `const g = I.common.goat; g.x = 20; g.z = 54; g.following = true; g.atBorder = false; I.goto(20, 50); I.step(1/60, 60); I.drive(1, 0, 0); I.step(1/60, 640); I.release(); I.step(1/60, 60);`,
  peekLeft: `I.peek(-1); I.step(1/60, 240);`,
  peekRight: `I.peek(1); I.step(1/60, 240);`,
  crossDistrict: `I.goto(-70, 70); I.step(1/60, 30); I.drive(1, 0, 0); I.step(1/60, 240); I.release();`,
  nellLeans: `I.step(1/60, 30);`,
  nellStraightens: `I.goto(-30, 92); I.step(1/60, 30); I.drive(1, 0, 0); I.step(1/60, 150); I.release(); I.step(1/60, 20);`,
  pushCartEast: `for (let i = 0; i < 4; i++) { const c = I.things.get('hay-cart'); I.goto(c.x - 3.2, c.z); I.step(1/60, 10); I.press(); I.step(1/60, 150); } I.goto(-16, 92); I.step(1/60, 60);`,
  pushCartToBorder: `for (let i = 0; i < 16; i++) { const c = I.things.get('hay-cart'); I.goto(c.x - 3.2, c.z); I.step(1/60, 10); I.press(); I.step(1/60, 150); } const c = I.things.get('hay-cart'); I.goto(c.x - 6, c.z + 8); I.step(1/60, 30);`,
  openNellCard: `I.goto(-16, 78); I.step(1/60, 40); I.press(); I.step(1/60, 5);`,
  openMap: `I.learn('name:meadow'); document.querySelector('.hud-btn')?.click(); I.step(1/60, 5);`,
};

for (const vp of VIEWPORTS) {
  const dir = `${OUT}/${vp.name}`;
  mkdirSync(dir, { recursive: true });
  let page = null;
  const fresh = async () => {
    if (page) await page.close();
    page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    await page.addInitScript(() => localStorage.clear());
    page.on('pageerror', (e) => console.log(`[${vp.name}] PAGE EXCEPTION:`, e.message));
    await page.goto(URL, { waitUntil: 'networkidle' });
    await page.bringToFront();
    await page
      .waitForSelector('.title-veil:not(.gone)', { timeout: 25000 })
      .catch(() => {});
    await page.evaluate(() => {
      const I = window.__inklands;
      I.setHour(12, false);
      I.begin();
      I.setBearing(false);
      I.setTime(0);
    });
  };
  await fresh();

  let n = 0;
  for (const [name, x, z, opts = {}] of SHOTS) {
    if (ONLY.length && !ONLY.some((o) => name.includes(o))) continue;
    if (opts.fresh) await fresh();
    await page.evaluate(
      ({ x, z, opts, script }) => {
        const I = window.__inklands;
        I.standUp();
        I.peek(null);
        I.setBearing(!!opts.bearing);
        I.setHour(opts.hour ?? 12, false);
        I.events.resync();
        for (const id of opts.learn ?? []) I.learn(id);
        I.goto(x, z);
        I.step(1 / 60, 240);
        if (script) new Function('I', script)(I);
        I.step(1 / 60, Math.round((opts.wait ?? 1) * 60));
        if (!opts.chrome) I.quiet();
        if (!opts.chrome) document.getElementById('prompt')?.classList.remove('show');
      },
      { x, z, opts, script: opts.do ? DO[opts.do] : null }
    );
    await page.waitForTimeout(opts.chrome ? 900 : 250);
    await page.screenshot({ path: `${dir}/${name}.png` });
    if (opts.do === 'openNellCard' || opts.do === 'openMap') await page.keyboard.press('Escape');
    n++;
  }
  console.log(`  ${vp.name}: ${n} frames → ${dir}`);
  await page.close();
}

await browser.close();
console.log('done →', OUT);
