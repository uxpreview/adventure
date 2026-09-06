// THE SECOND DOOR — Session 21's contact sheet.
//
//   npx vite preview --port 4173 &
//   node tools/shoot-session21.mjs
//
// The five remaining waits with both doors on a card, and the second
// door's permanent visible cost in each: Brim's belfry (the card; the
// clock set to eleven and the lamps lit at five in the afternoon; the
// clock set to eight and the market open round a stall that never
// opens); Splitrock's trestles (the card; the boat righted; the sea
// told and the boat dull, the marks weathered, Holt up on the rim); the
// Flats' catch (the card; the lid off; the can carried, filled and
// emptied in; the track grown over, by day and by night); the Penwood's
// tarn (the card; the boat without its oar; the twelfth oar at
// Hallows'; Brack still facing the water); the Downs' table (the card;
// the setting cleared; sat at a table laid for one). Then the 8:15
// reading the doors: the cans on the Flats' platform, the pots on
// Longshore's, and the morning after. Both rigs, on the harness clock,
// chrome swept unless the frame is ABOUT the chrome.
//
// Framings are [name, x, z, opts?] — the same opts as `shoot-session20`:
//   opts.hour · opts.day · opts.weather · opts.learn · opts.do ·
//   opts.chrome · opts.wait · opts.fresh
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { CHROMIUM } from './pw.mjs';

const SHOTS = [
  /* ---- BRIM: MARGET'S CLOCK ---------------------------------------- */
  ['01-the-belfry-card',               -63, -37,  { hour: 19.4, learn: ['fact:brim-hour'], do: 'openCard', chrome: true, wait: 0 }],
  ['02-the-clock-set-to-eleven',       -64, -33,  { hour: 12, learn: ['fact:brim-hour', 'door:the-clock-set-to-eleven'], fresh: true }],
  /* from the fountain, not the gate: the north lamps are thirty-four
   * units from the square's foot and a halo at that distance is four
   * pixels; from the fountain the two of them are on the frame's
   * shoulders in daylight */
  ['03-the-lamps-lit-at-five',         -45, -80,  { hour: 17.1 }],
  ['04-the-lamplighter-three-hours-early', -45, -70, { hour: 16.2 }],
  ['05-the-clock-set-to-eight',        -45, -70,  { hour: 12, learn: ['fact:brim-hour', 'door:the-clock-set-to-eight'], fresh: true }],
  ['06-a-market-round-a-shut-stall',   -43, -66,  { hour: 10 }],
  /* ---- SPLITROCK: HOLT'S SEA --------------------------------------- */
  ['07-the-trestles-card',             300, -227, { hour: 12, learn: ['route:the-river'], do: 'openCard', chrome: true, wait: 0, fresh: true }],
  ['08-the-boat-righted',              305, -224, { hour: 12, learn: ['route:the-river', 'door:the-boat-righted'] }],
  ['09-the-sea-told',                  305, -224, { hour: 12, learn: ['route:the-river', 'door:the-sea-has-no-bottom'], fresh: true }],
  ['10-the-marks-weathered',           305, -238, { hour: 12 }],
  ['11-holt-on-the-rim',               302, -256, { hour: 12 }],
  /* ---- THE FLATS: AMOS'S CISTERN ----------------------------------- */
  ['12-the-catch-card',                302, 101,  { hour: 12, learn: ['fact:the-fold'], do: 'openCard', chrome: true, wait: 0, fresh: true }],
  ['13-the-lid-off',                   302, 106,  { hour: 12, learn: ['fact:the-fold', 'door:the-lid-off'] }],
  ['14-the-can-in-hand',               303, 86,   { hour: 12, learn: ['fact:the-fold', 'door:the-cistern-yours'], do: 'pickUpCan', chrome: true, wait: 0, fresh: true }],
  ['15-fill-the-can',                  305, 66.5, { hour: 12, do: 'atTheWater', chrome: true, wait: 0 }],
  ['16-empty-it-in',                   302, 100.2, { hour: 12, do: 'atTheTank', chrome: true, wait: 0 }],
  ['17-the-track-grown-over',          303, 84,   { hour: 12, do: 'pourIt', wait: 0 }],
  ['18-the-track-at-night-nobody-on-it', 303, 84, { hour: 23.5 }],
  /* ---- THE PENWOOD: BRACK'S OAR ------------------------------------ */
  ['19-the-tarn-card',                 150, -171, { hour: 12, do: 'openCard', chrome: true, wait: 0, fresh: true }],
  ['20-the-oar-out-of-the-boat',       146, -177, { hour: 12, learn: ['door:the-oar-taken'] }],
  ['21-the-oar-in-hand',               146, -177, { hour: 12, do: 'pickUpOar', chrome: true, wait: 0 }],
  ['22-the-twelfth-oar',               100, -150, { hour: 12, do: 'setOar', wait: 0 }],
  ['23-brack-still-facing-the-water',  151, -144, { hour: 12 }],
  /* ---- THE DOWNS: JOAN'S TABLE ------------------------------------- */
  ['24-the-table-card',                140, 13.5, { hour: 12, do: 'openCard', chrome: true, wait: 0, fresh: true }],
  ['25-the-setting-cleared',           140, 18,   { hour: 12, learn: ['door:the-setting-cleared'] }],
  ['26-sat-at-a-table-for-one',        140, 13.5, { hour: 12.2, do: 'sitDown', chrome: true, wait: 0 }],
  /* ---- THE 8:15 READS THE DOORS ------------------------------------ */
  /* THE FLATS' STOP STANDS BEHIND A HOUSE from the pavement (the plot
   * at (41, 211)): the frame is from the road's own verge, north of
   * it, where the cans are in front of the carriage and not behind a
   * roof. */
  ['27-the-cans-on-the-flats-platform', 37, 207.5, { hour: 8.4, learn: ['fact:the-fold', 'door:the-cistern-yours', 'fact:the-cistern-filled'], do: 'trainAtFlats', wait: 0, fresh: true }],
  ['28-the-pots-on-longshores-platform', -45, 42, { hour: 8.4, learn: ['name:the-mark', 'door:the-pots-hauled'], do: 'trainAtLongshore', wait: 0 }],
  ['29-nobody-on-splitrocks-platform', -45, -60,  { hour: 8.4, learn: ['route:the-river', 'door:the-sea-has-no-bottom'], do: 'trainAtSplitrock', wait: 0 }],
  ['30-the-morning-after-the-cans',    37, 207.5, { hour: 9.5, learn: ['fact:the-8-15-ran', 'fact:left-at-desert-cans', 'fact:left-at-beach-pots'] }],
  ['31-the-morning-after-the-pots',    -45, 42,   { hour: 9.5 }],
];

const OUT = process.env.OUT ?? 'shots-s21';
const URL = process.env.URL ?? 'http://localhost:4173/?debug';
const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 720 },
  { name: 'portrait', width: 390, height: 844 },
].filter((v) => !process.env.VIEWPORT || v.name === process.env.VIEWPORT);
const ONLY = (process.env.ONLY ?? '').split(',').filter(Boolean);

const browser = await chromium.launch({ executablePath: CHROMIUM });

const DO = {
  openCard: `I.step(1/60, 30); I.press(); I.step(1/60, 10);`,
  pickUpCan: `const c = I.things.get('the-can'); I.goto(c.x, c.z + 1.6); I.step(1/60, 30); I.press(); I.step(1/60, 20); I.goto(303, 86); I.step(1/60, 120);`,
  atTheWater: `I.step(1/60, 30);`,
  atTheTank: `I.goto(305, 66.5); I.step(1/60, 30); I.press(); I.step(1/60, 20); I.goto(302, 100.2); I.step(1/60, 60);`,
  pourIt: `I.goto(302, 100.2); I.step(1/60, 30); I.press(); I.step(1/60, 30); I.goto(303, 84); I.step(1/60, 150);`,
  setOar: `I.goto(99.5, -153.5); I.step(1/60, 30); I.press(); I.step(1/60, 30); I.goto(100, -150); I.step(1/60, 120);`,
  pickUpOar: `const o = I.things.get('the-oar'); I.goto(o.x - 1.2, o.z + 1.4); I.step(1/60, 30); I.press(); I.step(1/60, 20); I.goto(146, -177); I.step(1/60, 120);`,
  sitDown: `I.step(1/60, 30); I.press(); I.step(1/60, 90);`,
  trainAtFlats: `I.warpTrain(9, 3); I.step(1/60, 60);`,
  trainAtLongshore: `I.warpTrain(5, 2); I.step(1/60, 60);`,
  trainAtSplitrock: `I.warpTrain(3, 1); I.step(1/60, 60);`,
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
    /* THE LOADER LETS GO FIRST (Session 20's gotcha). */
    await page.waitForSelector('.loader.gone', { timeout: 90000 }).catch(() => {});
    await page.waitForSelector('.title-veil:not(.gone)', { timeout: 60000 }).catch(() => {});
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
        if (document.querySelector('.note-veil.show')) { I.press(); I.step(1 / 60, 3); }
        if (I.choiceOpen()) I.closeChoice();
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
