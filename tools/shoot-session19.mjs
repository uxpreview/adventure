// THE NEW CAST, WEST AND NORTH — Session 19's contact sheet.
//
//   npx vite preview --port 4173 &
//   node tools/shoot-session19.mjs
//
// The Vikings on the Holdfast (coming in at dawn from the promenade,
// beached and roaring from the bight's sand, round the mark with the
// fleet at noon), the horn on the point and its answer; the surfers at
// the Cut at first light and the van at noon, the board on the wrack
// and racked; Pye rowing the line at the tide, at the pots, the card,
// the eighth pot and the pots hauled; Wren by the punt, rowing out at
// noon, the second mark, the fleet finished; Wick halfway up the avenue
// at dawn, at the pole, the fifth banner, relieved; the keep re-drawn,
// stood in; the portcullis down a foot; the moat red; the shape in the
// deep pines; the stone skipping off the bar; a rowboat in the fleet.
// Both rigs, on the harness clock, chrome swept unless the frame is
// ABOUT the chrome.
//
// Framings are [name, x, z, opts?] — the same opts as `shoot-session18`:
//   opts.hour · opts.day · opts.weather · opts.learn · opts.do ·
//   opts.chrome · opts.wait · opts.fresh
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { CHROMIUM } from './pw.mjs';

const SHOTS = [
  /* ---- THE VIKINGS ----------------------------------------------------- */
  ['01-the-longship-coming-in',        -236, -2,   { hour: 6.7 }],
  ['02-the-longship-beached',          -240, -14,  { hour: 10.0 }],
  ['03-they-roar-at-the-sand',         -244, -24,  { hour: 10.0, do: 'roar', wait: 0 }],
  ['04-the-longship-round-the-mark',   -303, -16,  { hour: 12.6 }],
  ['05-the-horn-on-the-point',         -233, -70,  { hour: 12, chrome: true }],
  ['06-the-horn-answered',             -240, -60,  { hour: 15, do: 'blowHorn', wait: 0 }],
  /* ---- THE SURFERS ----------------------------------------------------- */
  ['07-the-surfers-check-the-water',   -228, -26,  { hour: 6.25 }],
  ['08-the-van-at-noon',               -214, -30,  { hour: 12 }],
  ['09-the-van-light-at-dusk',         -214, -30,  { hour: 19.6 }],
  ['10-the-board-on-the-wrack',        -222, 26,   { hour: 12, chrome: true }],
  ['11-the-board-racked',              -214, -30,  { hour: 12, do: 'rackBoard', wait: 0 }],
  /* ---- PYE ------------------------------------------------------------- */
  ['12-pye-rows-the-line',             -226, -122, { hour: 7.0 }],
  ['13-pye-at-the-pots',               -218, -122, { hour: 9.0 }],
  ['14-the-pot-line-card',             -216, -126, { hour: 9.0, learn: ['name:the-mark'], do: 'openCard', chrome: true, wait: 0 }],
  ['15-the-eighth-pot',                -240, -150, { hour: 9.0, learn: ['name:the-mark', 'door:the-eighth-pot'] }],
  ['16-the-pots-hauled',               -218, -124, { hour: 9.0, learn: ['name:the-mark', 'door:the-pots-hauled'], fresh: true }],
  /* ---- WREN ------------------------------------------------------------ */
  ['17-wren-by-the-punt',              -262, 84,   { hour: 9.5, fresh: true }],
  ['18-wren-rows-to-the-mark',         -280, 62,   { hour: 11.72 }],
  ['19-the-second-mark',               -262, -2,   { hour: 12, learn: ['route:the-bar', 'door:the-second-mark'] }],
  ['20-the-fleet-finished',            -262, 2,    { hour: 12.5, learn: ['route:the-bar', 'door:the-fleet-finished'], fresh: true }],
  /* ---- WICK ------------------------------------------------------------ */
  ['21-wick-resting-at-dawn',          -40, -178,  { hour: 5.85, fresh: true }],
  ['22-wick-at-the-pole',              -47, -164,  { hour: 6.35 }],
  ['23-wick-at-the-pool',              -96, -203,  { hour: 7.4 }],
  ['24-the-fifth-banner',              -60, -184,  { hour: 12, learn: ['fact:brim-red', 'reason:the-fifth-banner'] }],
  ['25-wick-relieved',                 -50, -218,  { hour: 7.0, learn: ['door:the-king-restored'], fresh: true }],
  /* ---- GREYWEATHER RE-DRAWN -------------------------------------------- */
  ['26-the-keep-stood-in',             -45, -232,  { hour: 12, fresh: true }],
  ['27-the-bailey-from-the-gate',      -45, -212,  { hour: 12 }],
  ['28-the-portcullis-down',           -45, -186,  { hour: 12, do: 'rattle', wait: 0.35, chrome: true }],
  ['29-the-moat-red',                  -100, -200, { hour: 12, day: 1 }],
  ['30-the-moat-red-at-night',         -100, -200, { hour: 22.8, day: 1 }],
  /* ---- THE MONSTERS ---------------------------------------------------- */
  ['31-the-shape-in-the-deep-pines',   190, -250,  { hour: 23, do: 'theShape', wait: 0 }],
  ['32-the-seals-the-day-after',       -286, 34,   { hour: 12, day: 1 }],
  /* ---- THE TOYS -------------------------------------------------------- */
  ['33-the-stone-skips',               -282, 48,   { hour: 12, do: 'skim', wait: 0 }],
  ['34-a-rowboat-in-the-fleet',        -318, -26,  { hour: 12.4, do: 'rowIntoFleet', wait: 0 }],
];

const OUT = process.env.OUT ?? 'shots-s19';
const URL = process.env.URL ?? 'http://localhost:4173/?debug';
const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 720 },
  { name: 'portrait', width: 390, height: 844 },
].filter((v) => !process.env.VIEWPORT || v.name === process.env.VIEWPORT);
const ONLY = (process.env.ONLY ?? '').split(',').filter(Boolean);

const browser = await chromium.launch({ executablePath: CHROMIUM });

const DO = {
  roar: `I.step(1/60, 60); I.drive(-1, -0.6, 0); I.step(1/60, 120); I.release(); I.step(1/60, 700);`,
  blowHorn: `I.goto(-233, -73.5); I.step(1/60, 30); I.press(); I.step(1/60, 100); I.goto(-240, -60); I.step(1/60, 6);`,
  rackBoard: `const b = I.things.get('the-board'); I.goto(b.x, b.z + 1.6); I.step(1/60, 30); I.press(); I.step(1/60, 10); I.goto(-209.5, -33); I.step(1/60, 20); I.press(); I.step(1/60, 120); I.goto(-214, -30); I.step(1/60, 10);`,
  openCard: `I.step(1/60, 30); I.press(); I.step(1/60, 10);`,
  rattle: `I.goto(-45, -189.5); I.step(1/60, 30); I.press(); I.step(1/60, 24); I.goto(-45, -186); I.step(1/60, 2);`,
  theShape: `I.setTime(200); I.step(1/60, 600); I.step(1/60, 20);`,
  skim: `const s = I.things.get('bar-stone'); I.goto(s.x, s.z + 1.6); I.step(1/60, 30); I.press(); I.step(1/60, 10); I.goto(-282, 48); I.step(1/60, 10); I.drive(-1, 0, 1); I.step(1/60, 40); I.press(); I.step(1/60, 6); I.release(); I.step(1/60, 34);`,
  rowIntoFleet: `I.putBoat(-320, -26); I.goto(-318, -22); I.step(1/60, 10); I.takeOars(); I.step(1/60, 30); I.drive(-0.3, -1, 0); I.step(1/60, 120); I.release(); I.step(1/60, 20);`,
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
    await page.waitForSelector('.title-veil:not(.gone)', { timeout: 25000 }).catch(() => {});
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
        // a note a press left open is not in the next picture
        if (document.querySelector('.note-veil.show')) { I.press(); I.step(1 / 60, 3); }
        I.standUp();
        I.stepOff();
        I.hideTrain();
        I.peek(null);
        I.setBearing(false);
        I.setDay(opts.day ?? 0);
        I.setHour(opts.hour ?? 12, false);
        I.setWeather(opts.weather ?? 'clear');
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
    n++;
  }
  console.log(`  ${vp.name}: ${n} frames → ${dir}`);
  await page.close();
}

await browser.close();
console.log('done →', OUT);
