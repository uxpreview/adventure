// LIFE — Session 17's contact sheet.
//
//   npx vite preview --port 4173 &
//   node tools/shoot-session17.mjs
//
// The four multipliers (`THE-FUN-PASS` §9) photographed where they
// happen: the unnamed inhabitants at the hours they are out, the
// animals at the moment they react, the weather in each of its states,
// and the night as a different game. A day in the life of twelve lands,
// on the harness clock, both viewports, chrome swept unless the frame is
// ABOUT the chrome.
//
// Framings are [name, x, z, opts?]:
//   opts.hour     hold the sheet at an o'clock
//   opts.day      which day (the weather is a function of the day)
//   opts.weather  pin a preset: clear · wind · rain · fog · storm
//   opts.learn    hand the walker knowledge before the frame
//   opts.do       a function name on the DO table, run before settling
//   opts.chrome   keep the prompt and cards in the picture
//   opts.wait     extra game seconds of settle
//   opts.fresh    a new page (the opening is stateful)
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { CHROMIUM } from './pw.mjs';

const SHOTS = [
  /* ---- THE COMMON ---------------------------------------------------- */
  ['01-the-oaks-argument',        -97, 46,   { hour: 10.5 }],
  ['02-the-fisher-at-first-light', 40, 106,  { hour: 6.5 }],
  ['03-the-carter-on-the-road',   -45, 54,   { hour: 7.75 }],
  ['04-the-fair-children',        -95, 113,  { hour: 16.0 }],
  ['05-the-bull-lying-at-night',   28, 101,  { hour: 22.0, do: 'bullNight', wait: 0 }],
  ['06-the-fox-on-its-round',     -78, 108,  { hour: 23.0 }],
  ['07-bats-over-the-well',       -57, 58,   { hour: 20.4 }],
  /* ---- BRIM ---------------------------------------------------------- */
  ['08-the-lamplighter',          -45, -78,  { hour: 19.42, fresh: true }],
  ['09-brim-shuttered',           -45, -26,  { hour: 22.0 }],
  ['10-the-delivery-finds-it-shut', -45, -64, { hour: 7.75 }],
  ['11-the-cat-woken',            -45, 4,    { hour: 12, do: 'runPastCat', wait: 0 }],
  ['12-brim-in-the-rain',         -45, -62,  { hour: 12, weather: 'rain' }],
  /* ---- GREYWEATHER --------------------------------------------------- */
  ['13-the-sentry-at-dusk',       2, -198,   { hour: 19.5 }],
  ['14-the-pilgrims',             -45, -172, { hour: 8.45 }],
  ['15-the-washerwoman',          -98, -200, { hour: 10.0 }],
  ['16-the-rooks-roost',          -45, -232, { hour: 5.5 }],
  ['17-the-rooks-arrive',         100, 100,  { hour: 6.54 }],
  /* ---- THE DOWNS ----------------------------------------------------- */
  ['18-the-herd-parts',           147, 20,   { hour: 12, do: 'walkIntoHerd', wait: 0 }],
  ['19-the-dog-falls-in',         104, 45,   { hour: 12, do: 'dogFollows', wait: 0 }],
  ['20-the-dog-at-the-border',    75, 46,    { hour: 12, do: 'dogWest', wait: 0 }],
  ['21-the-scarecrow-rooks',      128, 123,  { hour: 12 }],
  ['22-the-miller-to-the-granary', 152, 8,   { hour: 9.06 }],
  ['23-the-shepherd-at-dawn',     101, 104,  { hour: 6.2 }],
  ['24-the-mill-in-a-wind',       147, 20,   { hour: 12, weather: 'wind' }],
  /* ---- THE PENWOOD --------------------------------------------------- */
  ['25-the-heron',                137, -167, { hour: 12 }],
  ['26-the-heron-goes-up',        137, -167, { hour: 12, do: 'walkAtHeron', wait: 0 }],
  ['27-the-cutters-at-work',      200, -138, { hour: 10.0 }],
  ['28-the-round-walked',         150, -148, { hour: 12.3 }],
  ['29-the-deep-pines-at-night',  188, -232, { hour: 23.0 }],
  /* ---- SPLITROCK ----------------------------------------------------- */
  ['30-the-hikers-at-the-arch',   300, -164, { hour: 13.95 }],
  ['31-holts-window',             304, -250, { hour: 22.0 }],
  ['32-the-far-rim',              300, -190, { hour: 16.25 }],
  /* ---- THE FLATS ----------------------------------------------------- */
  ['33-the-road-walker-turns-back', 250, 20, { hour: 7.58 }],
  ['34-amos-on-the-track',        303, 104,  { hour: 22.15 }],
  ['35-the-snake-crosses',        304, 92,   { hour: 19.73 }],
  ['36-the-kite',                 268, 70,   { hour: 12 }],
  /* ---- LONGSHORE ----------------------------------------------------- */
  ['37-the-beachcomber',          -218, 32,  { hour: 6.7 }],
  ['38-the-hut-owner-sits',       -206, 10,  { hour: 10.5 }],
  ['39-the-jetty-fisher',         -254, 68,  { hour: 18.5 }],
  ['40-the-crabs-scuttle',        -210, 14,  { hour: 12, do: 'walkAtCrabs', wait: 0 }],
  /* ---- THE WIDE BLUE ------------------------------------------------- */
  ['41-the-seals-on-the-bar',     -290, 40,  { hour: 12 }],
  ['42-the-regatta-starts',       -292, -20, { hour: 12.3 }],
  ['43-the-thing-surfaces',       -292, -20, { hour: 19.385 }],
  /* ---- MAPLE COURT --------------------------------------------------- */
  ['44-the-jogger',               -78, 158,  { hour: 6.44 }],
  ['45-the-first-car-leaves',     -45, 192,  { hour: 8.3 }],
  ['46-the-post',                 -40, 236,  { hour: 10.3 }],
  ['47-the-fence-cat',            -84, 152,  { hour: 12, do: 'runPastFence', wait: 0 }],
  /* ---- GREYLINE ------------------------------------------------------ */
  ['48-the-rush',                 148, 232,  { hour: 8.3 }],
  ['49-the-pigeons-lift',         150, 216,  { hour: 12, do: 'walkAtPigeons', wait: 0 }],
  ['50-the-busker',               152, 218,  { hour: 12.5 }],
  /* ---- THE CUBICLE MILE ---------------------------------------------- */
  ['51-the-nine-oclock',          283, 192,  { hour: 8.86 }],
  ['52-the-guard-at-night',       270, 216,  { hour: 22.5 }],
  ['53-the-shelter-light',        252, 210,  { hour: 19.6, learn: ['route:the-line'] }],
  /* ---- THE WEATHER --------------------------------------------------- */
  ['54-rain-on-the-common',       -45, 66,   { hour: 12, weather: 'rain', chrome: true }],
  ['55-fog-closes-the-lures',     -45, 58,   { hour: 12, weather: 'fog' }],
  ['56-the-storm',                -45, 66,   { hour: 23.0, weather: 'storm' }],
  ['57-fog-at-the-cut',           -237, -49, { hour: 12, weather: 'fog' }],
  ['58-day-two-dawn-fog',         -45, 58,   { hour: 6.0, day: 1 }],
  ['59-day-two-afternoon-shower', 150, 20,   { hour: 11.5, day: 1 }],
];

const OUT = process.env.OUT ?? 'shots-s17';
const URL = process.env.URL ?? 'http://localhost:4173/?debug';
const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 720 },
  { name: 'portrait', width: 390, height: 844 },
].filter((v) => !process.env.VIEWPORT || v.name === process.env.VIEWPORT);
/** `ONLY=heron,dog` — a comma list of name fragments, for re-shooting. */
const ONLY = (process.env.ONLY ?? '').split(',').filter(Boolean);

const browser = await chromium.launch({ executablePath: CHROMIUM });

/** The little scripts a framing can ask for, run in the page. Every
 *  one drives the walker the way a player would. */
const DO = {
  bullNight: `I.common.reset(); I.step(1/60, 200);`,
  runPastCat: `I.goto(-45, 16); I.step(1/60, 30); I.drive(0, -1, 1); I.step(1/60, 120); I.release(); I.step(1/60, 10);`,
  walkIntoHerd: `I.step(1/60, 30); I.drive(0, -1, 0); I.step(1/60, 240); I.release(); I.step(1/60, 60);`,
  dogFollows: `I.step(1/60, 30); I.drive(-1, 0, 0); I.step(1/60, 200); I.release(); I.step(1/60, 40);`,
  dogWest: `I.goto(118, 46); I.step(1/60, 30); I.drive(-1, 0, 0); I.step(1/60, 120); I.release(); I.goto(90, 46); I.step(1/60, 30); I.drive(-1, 0, 0); I.step(1/60, 480); I.release(); I.step(1/60, 90);`,
  walkAtHeron: `I.step(1/60, 30); I.drive(0, -1, 0); I.step(1/60, 90); I.release(); I.step(1/60, 70);`,
  walkAtCrabs: `I.step(1/60, 30); I.drive(-1, 0, 0); I.step(1/60, 70); I.release(); I.step(1/60, 20);`,
  runPastFence: `I.goto(-84, 156); I.step(1/60, 30); I.drive(0, -1, 1); I.step(1/60, 140); I.release(); I.step(1/60, 10);`,
  walkAtPigeons: `I.step(1/60, 30); I.drive(0, -1, 0); I.step(1/60, 90); I.release(); I.step(1/60, 60);`,
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
        I.setBearing(false);
        I.setDay(opts.day ?? 0);
        I.setHour(opts.hour ?? 12, false);
        I.setWeather(opts.weather ?? null);
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
