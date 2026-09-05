// THE ROADS — Session 18's contact sheet.
//
//   npx vite preview --port 4173 &
//   node tools/shoot-session18.mjs
//
// The twenty-eight encounters that were built, photographed at the hour
// each one is on and once at the hour it is over (the aftermath is the
// point); the districts' cards on the seams; the two road midpoints the
// fifteen-second tool asked for; the bicycle parked, ridden, and ringing
// its bell at the cat; the paper plane on the rock, in the air over the
// cut, and down on the far rim; and the 8:15 on the day after the
// ending, stopping at a platform with nobody on it. Both rigs, on the
// harness clock, chrome swept unless the frame is ABOUT the chrome.
//
// Framings are [name, x, z, opts?] — the same opts as `shoot-session17`:
//   opts.hour · opts.day · opts.weather · opts.learn · opts.do ·
//   opts.chrome · opts.wait · opts.fresh
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { CHROMIUM } from './pw.mjs';

const SHOTS = [
  /* ---- THE ENCOUNTERS ------------------------------------------------ */
  ['01-c1-the-broken-cart',          -45, -22,  { hour: 10.0 }],
  ['02-c1-the-wheelwright-at-it',    -45, -22,  { hour: 14.0 }],
  ['03-c1-the-cart-mended',          -45, -22,  { hour: 15.3 }],
  ['04-c2-the-dusk-walker',          -45, 2,    { hour: 19.15 }],
  ['05-c3-the-dawn-dog-falls-in',    -118, 70,  { hour: 6.0, do: 'dawnDog', wait: 0 }],
  ['06-c3-the-dawn-dog-at-its-line', -40, 66,   { hour: 6.0, do: 'dawnDogLine', wait: 0 }],
  ['07-c4-the-ladder-round-the-bend', -60, 66,  { hour: 9.72 }],
  ['08-c4-the-ladder-leant',         -92, 110,  { hour: 12 }],
  ['09-c5-the-hat',                  -190, 70,  { hour: 11.45 }],
  ['10-c6-the-tideline-combers',     -222, 0,   { hour: 6.9 }],
  ['11-c7-the-fire-lit-nobody-at-it', -236, 116, { hour: 19.6 }],
  ['12-c7-the-fire-with-two-at-it',  -236, 116, { hour: 21.0 }],
  ['13-c7-the-fire-cold',            -236, 116, { hour: 12 }],
  ['14-c8-the-cove-light',           -238, -125, { hour: 22.5 }],
  ['15-c9-the-gull-on-the-crest',    -282, 44,  { hour: 12, do: 'walkAtGull', wait: 0 }],
  ['16-c14-the-felled-pine',         118, -144, { hour: 10.0 }],
  ['17-c14-sawn-by-three',           118, -144, { hour: 16.0 }],
  ['18-c15-rings-on-the-tarn',       150, -172, { hour: 19.3, do: 'ringNow', wait: 0 }],
  ['19-c17-the-funeral',             150, 74,   { hour: 15.3 }],
  ['20-c18-the-flock-parts',         134, 38,   { hour: 16.75, do: 'flockParts', wait: 0 }],
  ['21-c22-the-oasis-that-is-not',   276, -34,  { hour: 12.5 }],
  ['22-c24-lights-on-engine-off',    -57, 232,  { hour: 19.0 }],
  /* ---- THE DISTRICTS ------------------------------------------------- */
  /* THE CARD LIVES 2.6 WALL-CLOCK SECONDS, and the harness steps are
   * wall-clock too: cross, and press the shutter with as few frames
   * after the crossing as the walk allows. */
  ['23-a-district-card-brim',        -45, -54,  { hour: 12, do: 'crossIntoSquare', chrome: true, wait: 0 }],
  ['24-a-district-card-the-floor',   292, -140, { hour: 12, do: 'crossIntoFloor', chrome: true, wait: 0 }],
  ['25-the-map-with-districts',      -45, 58,   { hour: 12, map: true, learn: ['name:kingdom', 'name:castle', 'name:downs'] }],
  /* ---- THE MIDPOINTS ------------------------------------------------- */
  ['26-the-cairn-on-the-trail',      258, -10,  { hour: 12 }],
  ['27-the-woodpile-on-the-round',   150, -231, { hour: 12 }],
  /* ---- THE BICYCLE --------------------------------------------------- */
  ['28-the-bicycle-on-the-verge',    -58, 158,  { hour: 12 }],
  ['29-riding-main-street',          -30, 204,  { hour: 12, do: 'rideEast', wait: 0 }],
  ['30-the-bell-and-the-cat',        -90, 154,  { hour: 12, do: 'ringAtCat', wait: 0.6 }],
  ['31-the-bicycle-at-the-border',   -45, 132,  { hour: 12, do: 'rideToBorder', wait: 0, chrome: true }],
  /* ---- THE PAPER PLANE ----------------------------------------------- */
  ['32-the-plane-on-the-rock',       278, -162, { hour: 12 }],
  ['33-the-plane-over-the-cut',      278, -162, { hour: 12, do: 'throwPlane', wait: 0 }],
  ['34-the-plane-at-the-far-wall',   296, -170, { hour: 12, do: 'planeLands', wait: 0 }],
  /* ---- THE 8:15, THE DAY AFTER --------------------------------------- */
  ['35-the-ending-somebody-boards',  148, 214,  { hour: 8.5, do: 'trainEnding', wait: 0 }],
  ['36-the-daily-nobody-waiting',    148, 214,  { hour: 8.5, do: 'trainDaily', wait: 0 }],
];

const OUT = process.env.OUT ?? 'shots-s18';
const URL = process.env.URL ?? 'http://localhost:4173/?debug';
const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 720 },
  { name: 'portrait', width: 390, height: 844 },
].filter((v) => !process.env.VIEWPORT || v.name === process.env.VIEWPORT);
const ONLY = (process.env.ONLY ?? '').split(',').filter(Boolean);

const browser = await chromium.launch({ executablePath: CHROMIUM });

const DO = {
  ringNow: `I.setHour(19.0, false); I.events.resync(); I.step(1/60, 5); I.setHour(19.3, false); I.events.resync(); I.step(1/60, 40);`,
  dawnDog: `I.step(1/60, 60); I.drive(1, 0, 0); I.step(1/60, 240); I.release(); I.step(1/60, 30);`,
  dawnDogLine: `I.goto(-118, 64); I.step(1/60, 60); I.drive(1, 0, 0); I.step(1/60, 240); I.release(); I.goto(-40, 60); I.step(1/60, 20); I.drive(1, 0, 1); I.step(1/60, 360); I.release(); I.step(1/60, 60); I.goto(-22, 62); I.step(1/60, 50);`,
  walkAtGull: `I.step(1/60, 30); I.drive(-0.6, -0.8, 0); I.step(1/60, 150); I.release(); I.step(1/60, 30);`,
  flockParts: `I.step(1/60, 30); I.drive(1, -0.4, 0); I.step(1/60, 90); I.release(); I.step(1/60, 40);`,
  crossIntoSquare: `I.step(1/60, 30); I.drive(0, -1, 0); I.step(1/60, 121); I.release();`,
  crossIntoFloor: `I.step(1/60, 30); I.drive(0.15, -1, 0); I.step(1/60, 152); I.release();`,
  rideEast: `I.putBicycle(-30, 202); I.step(1/60, 30); I.press(); I.step(1/60, 10); I.drive(1, 0, 0); I.step(1/60, 150); I.release(); I.step(1/60, 5); I.stepOff();`,
  ringAtCat: `I.putBicycle(-90, 150); I.goto(-90, 152); I.step(1/60, 30); I.press(); I.step(1/60, 10); I.drive(1, 0, 0); I.step(1/60, 50); I.press(); I.step(1/60, 30); I.release(); I.step(1/60, 20); I.stepOff();`,
  rideToBorder: `I.putBicycle(-45, 130); I.goto(-45, 132); I.step(1/60, 30); I.press(); I.step(1/60, 10); I.drive(0, -1, 1); I.step(1/60, 300); I.release(); I.step(1/60, 40); I.stepOff();`,
  throwPlane: `I.goto(278.5, -167.5); I.step(1/60, 30); I.press(); I.step(1/60, 10); I.goto(274, -167.5); I.step(1/60, 20); I.drive(1, 0, 1); I.step(1/60, 42); I.press(); I.step(1/60, 12); I.release(); I.goto(292, -128); I.step(1/60, 24);`,
  planeLands: `I.goto(278.5, -167.5); I.step(1/60, 30); I.press(); I.step(1/60, 10); I.goto(274, -167.5); I.step(1/60, 20); I.drive(1, 0, 1); I.step(1/60, 42); I.press(); I.step(1/60, 12); I.release(); I.step(1/60, 720); const p = I.things.get('paper-plane'); I.goto(p.x - 6, p.z + 8); I.step(1/60, 60);`,
  trainEnding: `I.learn(I.waitAnswers.city); I.hideTrain(); I.train.ending = true; I.warpTrain(10, 3); I.step(1/60, 60);`,
  trainDaily: `I.learn(I.waitAnswers.city); I.learn('fact:the-8-15-ran'); I.hideTrain(); I.train.ending = false; I.warpTrain(10, 0); I.step(1/60, 60);`,
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
    if (opts.map) {
      await page.keyboard.press('KeyM');
      await page.waitForTimeout(900);
    }
    await page.waitForTimeout(opts.chrome ? 900 : 250);
    await page.screenshot({ path: `${dir}/${name}.png` });
    if (opts.map) await page.keyboard.press('KeyM');
    n++;
  }
  console.log(`  ${vp.name}: ${n} frames → ${dir}`);
  await page.close();
}

await browser.close();
console.log('done →', OUT);
