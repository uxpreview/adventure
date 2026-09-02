// THE VERBS — Session 15's contact sheet.
//
//   npx vite preview --port 4173 &
//   node tools/shoot-session15.mjs
//
// A systems session has no land to shoot, so it shoots its PROOFS: the
// three things the owner can play in the play sheet, each photographed
// in both states, because a verb's whole product is a change in the
// world and the only way to photograph a change is to photograph both
// sides of it. On the harness clock, both viewports, chrome swept
// unless the frame is ABOUT the chrome (the choice card is).
//
// Framings are [name, x, z, opts?]:
//   opts.hour     hold the sheet at an o'clock
//   opts.learn    hand the walker knowledge before the frame
//   opts.do       a function name on __inklands to call before settling
//   opts.chrome   keep the prompt and cards in the picture
//   opts.wait     extra game seconds of settle
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { CHROMIUM } from './pw.mjs';

const SHOTS = [
  /* ---- THE COMMON: the well, the cart, the stone ------------------ */
  ['01-well-the-prompt',          -56, 50,  { chrome: true }],
  ['02-well-shouted',             -56, 50,  { do: 'shout' }],
  ['03-cart-at-rest',             20, 84,   { chrome: true }],
  ['04-cart-pushed-east',         44, 84,   { do: 'pushCartEast' }],
  ['05-cart-at-the-border',       52, 84,   { do: 'pushCartToBorder' }],
  ['06-stone-by-the-gate',        13.6, 71, { chrome: true }],
  ['07-stone-in-hand',            13.6, 71, { do: 'pickUpStone', chrome: true }],
  ['08-stone-thrown',             13.6, 71, { do: 'throwStone', wait: 3 }],
  ['09-swing-sitting',            -90.6, 34, { do: 'sitSwing', chrome: true }],
  /* ---- GREYWEATHER: the king, both doors ------------------------- */
  ['10-king-the-card',            -56, -216, { do: 'openKingCard', chrome: true }],
  ['11-king-LEFT-bailey',         -45, -214, { learn: ['door:the-king-left'] }],
  ['12-king-LEFT-close',          -56, -216, { learn: ['door:the-king-left'] }],
  ['13-king-LEFT-avenue',         -45, -178, { learn: ['door:the-king-left'] }],
  ['14-king-LEFT-moat',           -100, -200, { learn: ['door:the-king-left'] }],
  // the other door, on a fresh page: see `fresh` below
  ['15-king-RESTORED-close',      -56, -216, { fresh: true, learn: ['door:the-king-restored'] }],
  ['16-king-RESTORED-bailey',     -45, -214, { learn: ['door:the-king-restored'] }],
  ['17-king-RESTORED-avenue',     -45, -178, { learn: ['door:the-king-restored'] }],
  ['18-king-RESTORED-moat',       -100, -200, { learn: ['door:the-king-restored'] }],
  ['19-king-RESTORED-dusk',       -45, -178, { learn: ['door:the-king-restored'], hour: 19.6 }],
  /* ---- THE DOWNS: the drove at its hours -------------------------- */
  ['20-drove-fold-04h',           101, 128, { hour: 4.0 }],
  ['21-drove-on-the-lane-06h',    101, 112, { hour: 6.15 }],
  ['22-drove-through-the-gate',   101, 94,  { hour: 6.45 }],
  ['23-drove-in-the-field-noon',  101, 82,  { hour: 12 }],
  ['24-drove-home-dusk',          101, 112, { hour: 19.7 }],
  ['25-headland-sitting',         140, 16,  { do: 'sitHeadland', chrome: true }],
];

const OUT = process.env.OUT ?? 'shots-s15';
const URL = process.env.URL ?? 'http://localhost:4173/?debug';
const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 720 },
  { name: 'portrait', width: 390, height: 844 },
].filter((v) => !process.env.VIEWPORT || v.name === process.env.VIEWPORT);
const ONLY = process.env.ONLY;

const browser = await chromium.launch({ executablePath: CHROMIUM });

/** The little scripts a framing can ask for, run in the page. */
const DO = {
  shout: `I.goto(-56, 50); I.step(1/60, 30); I.press(); I.step(1/60, 240);`,
  pushCartEast: `for (let i = 0; i < 5; i++) { const c = I.things.get('hay-cart'); I.goto(c.x - 3.2, c.z); I.step(1/60, 10); I.press(); I.step(1/60, 150); } const c = I.things.get('hay-cart'); I.goto(c.x, c.z + 8);`,
  pushCartToBorder: `for (let i = 0; i < 16; i++) { const c = I.things.get('hay-cart'); I.goto(c.x - 3.2, c.z); I.step(1/60, 10); I.press(); I.step(1/60, 150); } const c = I.things.get('hay-cart'); I.goto(c.x - 6, c.z + 8);`,
  pickUpStone: `const s = I.things.get('fist-stone'); I.goto(s.x, s.z + 1.6); I.step(1/60, 20); I.press(); I.step(1/60, 20); I.goto(13.6, 71);`,
  throwStone: `const s = I.things.get('fist-stone'); I.goto(s.x, s.z + 1.6); I.step(1/60, 20); I.press(); I.step(1/60, 20); I.goto(13.6, 74); I.drive(0, -1, 1); I.step(1/60, 70); I.press(); I.release(); I.step(1/60, 40);`,
  sitSwing: `I.goto(-90.6, 34); I.drive(0, -1, 0); I.step(1/60, 40); I.release(); I.step(1/60, 30); I.press(); I.step(1/60, 30);`,
  sitHeadland: `I.goto(140, 16); I.drive(0, -1, 0); I.step(1/60, 30); I.release(); I.step(1/60, 30); I.press(); I.step(1/60, 30);`,
  openKingCard: `I.goto(-56, -216); I.step(1/60, 40); I.press(); I.step(1/60, 5);`,
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
      .waitForFunction(() => document.body.innerText.toLowerCase().includes('set out'), { timeout: 25000 })
      .catch(() => {});
    await page.evaluate(() => {
      const I = window.__inklands;
      I.setHour(12, false);
      I.begin();
      I.setBearing(false);
    });
  };
  await fresh();

  let n = 0;
  for (const [name, x, z, opts = {}] of SHOTS) {
    if (ONLY && !name.includes(ONLY)) continue;
    if (opts.fresh) await fresh();
    await page.evaluate(
      ({ x, z, opts, script }) => {
        const I = window.__inklands;
        I.standUp();
        I.setHour(opts.hour ?? 12, false);
        I.events.resync();
        for (const id of opts.learn ?? []) I.learn(id);
        I.goto(x, z);
        I.setTime(0);
        I.step(1 / 60, 720);
        if (script) new Function('I', script)(I);
        I.step(1 / 60, Math.round((opts.wait ?? 1) * 60));
        if (!opts.chrome) I.quiet();
        if (!opts.chrome) document.getElementById('prompt')?.classList.remove('show');
      },
      { x, z, opts, script: opts.do ? DO[opts.do] : null }
    );
    await page.waitForTimeout(250);
    await page.screenshot({ path: `${dir}/${name}.png` });
    if (opts.do === 'openKingCard') await page.keyboard.press('Escape');
    n++;
  }
  console.log(`  ${vp.name}: ${n} frames → ${dir}`);
  await page.close();
}

await browser.close();
console.log('done →', OUT);
