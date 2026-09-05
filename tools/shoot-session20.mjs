// THE NEW CAST, EAST AND SOUTH — Session 20's contact sheet.
//
//   npx vite preview --port 4173 &
//   node tools/shoot-session20.mjs
//
// The aliens in the Pale (the pattern by day with three of them stood
// in it, the big one poked, the lights over the pan at night from the
// track and from the pan); the barista at the junction (the cart at
// seven, the cups by noon, the dog and its paws on the way in, the bin
// pushed into the junction, the pavement's card, your lane); the design
// studio in the atrium (the persona and the map, the intercept at eight,
// the stickies on the glass by four, one peeled off, the square flock
// in the overflow and scattering, the chair ridden, the board's card,
// wiped and pressed); Maple Court (the low dog on the green, the ball
// kicked and fetched, the dog at the green's edge, the chairs' card,
// the gap cut, the light off and the street going dark on day three).
// Both rigs, on the harness clock, chrome swept unless the frame is
// ABOUT the chrome.
//
// Framings are [name, x, z, opts?] — the same opts as `shoot-session19`:
//   opts.hour · opts.day · opts.weather · opts.learn · opts.do ·
//   opts.chrome · opts.wait · opts.fresh
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { CHROMIUM } from './pw.mjs';

const SHOTS = [
  /* ---- THE ALIENS IN THE PALE --------------------------------------- */
  ['01-the-pattern-in-the-pan',        268, 76,   { hour: 12 }],
  ['02-the-visitors-by-day',           270, 60,   { hour: 10 }],
  ['03-poke-it',                       273, 45.6, { hour: 10, do: 'poke', wait: 0.2, chrome: true }],
  ['04-the-lights-from-the-track',     274, 86,   { hour: 22.5 }],
  ['05-the-lights-over-the-pan',       268, 82,   { hour: 23.2, do: 'standOnPan', wait: 0 }],
  /* ---- THE BARISTA AT THE JUNCTION ------------------------------------ */
  ['06-the-cart-at-seven',             142, 226,  { hour: 7.05 }],
  ['07-the-cups-by-noon',              142, 221,  { hour: 12.2, chrome: true }],
  ['08-the-dog-walks-in',              152, 197,  { hour: 6.9, do: 'watchPaws', wait: 0 }],
  ['08b-the-dog-turns-at-the-junction', 150, 211,  { hour: 6.97, wait: 0.5 }],
  ['09-the-dog-in-its-bow-tie',        139, 222,  { hour: 14 }],
  ['10-the-bin-at-the-junction',       152, 200,  { hour: 12, do: 'pushBin', wait: 0 }],
  ['11-the-pavement-card',             134, 204,  { hour: 12, learn: ['fact:the-pavement'], do: 'openCard', chrome: true, wait: 0, fresh: true }],
  ['12-your-lane',                     148, 213,  { hour: 12, learn: ['fact:the-pavement', 'door:the-walked-round', 'fact:your-lane'], fresh: true }],
  /* ---- THE DESIGN STUDIO IN THE ATRIUM -------------------------------- */
  ['13-the-persona-and-the-map',       288, 186,  { hour: 10, fresh: true }],
  ['14-the-intercept-at-eight',        252, 212,  { hour: 8.1 }],
  ['15-the-stickies-by-four',          252, 210,  { hour: 16.2 }],
  ['16-peel-one-off',                  250, 203,  { hour: 16.2, do: 'peel', wait: 0.3, chrome: true }],
  ['17-the-square-flock',              304, 168,  { hour: 12 }],
  ['18-the-flock-scatters',            304, 158,  { hour: 12, do: 'walkAtFlock', wait: 0 }],
  ['19-the-chair-ridden',              288, 209,  { hour: 12, do: 'rideChair', wait: 0 }],
  ['20-the-board-card',                256.5, 203, { hour: 12, learn: ['route:the-line'], do: 'openCard', chrome: true, wait: 0 }],
  ['21-the-board-wiped',               254, 206,  { hour: 8.1, learn: ['route:the-line', 'door:the-board-wiped'] }],
  ['22-the-corner-pressed',            254, 206,  { hour: 8.1, learn: ['route:the-line', 'door:the-corner-pressed'], fresh: true }],
  /* ---- MAPLE COURT --------------------------------------------------- */
  ['23-the-low-dog-on-the-green',      2, 190,    { hour: 12, do: 'meetDog', wait: 0 }],
  ['24-the-ball-kicked',               0, 190,    { hour: 12, do: 'kickBall', wait: 0 }],
  ['25-the-dog-at-the-greens-edge',    -22, 186,  { hour: 12, do: 'leaveGreen', wait: 0 }],
  ['26-the-chairs-card',               -61, 143,  { hour: 12, learn: ['name:castle'], do: 'openCard', chrome: true, wait: 0 }],
  ['27-the-gap-cut',                   -61, 142,  { hour: 12, learn: ['name:castle', 'door:the-gap-cut'] }],
  ['28-the-light-off',                 -78, 150,  { hour: 19.6, learn: ['name:castle', 'door:the-light-off'], fresh: true }],
  ['29-the-street-going-dark-day-3',   -60, 235,  { hour: 19.6, day: 3, learn: ['name:castle', 'door:the-light-off', 'fact:the-light-went-off-on-day-0'] }],
];

const OUT = process.env.OUT ?? 'shots-s20';
const URL = process.env.URL ?? 'http://localhost:4173/?debug';
const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 720 },
  { name: 'portrait', width: 390, height: 844 },
].filter((v) => !process.env.VIEWPORT || v.name === process.env.VIEWPORT);
const ONLY = (process.env.ONLY ?? '').split(',').filter(Boolean);

const browser = await chromium.launch({ executablePath: CHROMIUM });

const DO = {
  poke: `I.goto(273, 45.6); I.step(1/60, 30); I.press(); I.step(1/60, 8);`,
  standOnPan: `I.step(1/60, 600);`,
  watchPaws: `I.step(1/60, 240);`,
  pushBin: `const b = I.things.get('the-bin'); I.goto(b.x + 2.8, b.z - 2.2); I.step(1/60, 20); I.press(); I.step(1/60, 10); I.press(); I.step(1/60, 30); I.goto(I.things.get('the-bin').x + 2.6, I.things.get('the-bin').z - 2.4); I.step(1/60, 10); I.press(); I.step(1/60, 40); I.goto(152, 200); I.step(1/60, 20);`,
  openCard: `I.step(1/60, 30); I.press(); I.step(1/60, 10);`,
  peel: `I.step(1/60, 30); I.press(); I.step(1/60, 20);`,
  walkAtFlock: `I.drive(0, -1, 0); I.step(1/60, 150); I.release(); I.step(1/60, 30);`,
  rideChair: `const c = I.things.get('office-chair'); I.goto(c.x - 2.8, c.z); I.step(1/60, 10); I.drive(1, 0, 0); I.step(1/60, 8); I.release(); I.step(1/60, 20); I.press(); I.step(1/60, 90); I.step(1/60, 240);`,
  meetDog: `I.step(1/60, 200); I.drive(0, -1, 0); I.step(1/60, 60); I.release(); I.step(1/60, 120);`,
  kickBall: `I.step(1/60, 120); const b = I.things.get('the-ball'); I.goto(b.x, b.z + 1.6); I.step(1/60, 30); I.press(); I.step(1/60, 10); I.drive(0, -1, 1); I.step(1/60, 40); I.press(); I.step(1/60, 6); I.release(); I.step(1/60, 150);`,
  leaveGreen: `I.goto(2, 186); I.step(1/60, 200); I.drive(-1, 0, 1); I.step(1/60, 240); I.release(); I.step(1/60, 60);`,
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
    /* THE LOADER LETS GO FIRST. In this sandbox the loader's tween can
     * outlast a twenty-five second wait, and a frame shot under it is a
     * frame of the loader: wait for it to be gone, then for the title. */
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
