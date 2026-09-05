// THE NOW — the contact sheet for MAPLE COURT and GREYLINE CITY, plus
// the one framing this session is not allowed to break.
//
// Session 13. Shot on the harness clock (Session 9) so two runs of the
// same framing are the same picture, in both viewports, with the chrome
// swept. Framings are [name, x, z, opts?]:
//
//   opts.hour   hold the sheet at an o'clock (the porch light, the lit
//               windows and the shelter are all dusk content)
//   opts.learn  hand the walker knowledge before the frame — a wait has
//               two states and the gate has to see both
//   opts.wait   extra game seconds of settle, for anything that has to
//               happen while you stand still (the man sits down after
//               four seconds of not walking, and that is the whole of
//               GREYLINE CITY's wait)
//
// THE RIM IS FIRST IN THE LIST ON PURPOSE. `design/THE-LINE.md` §3.2 is
// an authoring brief addressed to this session and its constraint is a
// sightline: nothing tall within about eight units of x = −45 between
// z = 120 and z = 278. It is shot before anything is placed and again
// after, and the two frames are compared.
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { CHROMIUM } from './pw.mjs';

const SHOTS = [
  // THE LINE, from the world's south rim, looking two hundred units north
  ['01-rim-the-end-of-the-survey', -45, 274],
  ['02-rim-approach',              -45, 248],
  // MAPLE COURT
  ['03-maple-the-bridge',          -45, 196],
  ['04-maple-the-green',             2, 192],
  ['05-maple-the-chairs',          -61, 142, { hour: 12 }],
  ['06-maple-the-chairs-open',     -61, 142, { hour: 12, learn: ['name:castle', 'door:the-gap-cut'] }],
  ['07-maple-the-court',           -78, 158],
  ['08-maple-THE-SHOT-porch-dusk', -78, 144, { hour: 19.8 }],
  ['09-maple-junes-gate',           50, 203, { hour: 19.8 }],
  ['11-maple-the-empty-plots',     -45, 232],
  // GREYLINE CITY
  ['12-city-main-street',          124, 210],
  ['13-city-THE-SHOT-junction',    142, 213],
  ['14-city-he-sits',              142, 213, { wait: 10 }],
  ['15-city-the-hollow',            88, 232],
  ['16-city-north-end',            150, 186],
  ['17-city-dusk',                 148, 226, { hour: 19.8 }],
  // and the neighbours, because a land session's diff is its own
  ['18-city-the-wear',             142, 207],
  // the two framings that need knowledge come LAST, because a learn is
  // for the rest of the page: round 4's shot of the man standing had him
  // sitting on the bench, because the framing before it had told the
  // walker he was there
  ['19-maple-junes-fence',          56, 213, { learn: ['fact:the-man-at-the-junction'] }],
  ['20-common-looks-south',        -45, 100],
];
const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 720 },
  { name: 'portrait', width: 390, height: 844 },
];
const ONLY = process.env.VIEWPORT;
const PICK = process.env.ONLY;

const out = process.env.OUT ?? 'shots/session13';
const url = process.env.URL ?? 'http://localhost:4173/?debug';
const HOUR = Number(process.env.HOUR ?? 12);
const browser = await chromium.launch({ executablePath: CHROMIUM });

for (const vp of VIEWPORTS.filter((v) => !ONLY || v.name === ONLY)) {
  const dir = `${out}/${vp.name}`;
  mkdirSync(dir, { recursive: true });
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
  await page.addInitScript(() => localStorage.clear());
  page.on('pageerror', (e) => console.log(`[${vp.name}] EXCEPTION:`, e.message));
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.bringToFront();
  await page
    .waitForSelector('.title-veil:not(.gone)', { timeout: 25000 })
    .catch(() => {});
  await page.evaluate((h) => {
    window.__inklands.begin();
    window.__inklands.setHour(h, false);
  }, HOUR);
  await page.waitForTimeout(1000);

  for (const [name, x, z, opts = {}] of SHOTS.filter(([n]) => !PICK || n.includes(PICK))) {
    await page.evaluate(
      ([tx, tz, o, baseHour]) => {
        const I = window.__inklands;
        I.setHour(o.hour ?? baseHour, false);
        (o.learn ?? []).forEach((k) => I.learn(k));
        I.goto(tx, tz);
        I.setTime(0);
        I.step(1 / 60, 720 + Math.round((o.wait ?? 0) * 60));
        I.quiet();
      },
      [x, z, opts, HOUR]
    );
    // the chrome fades on a CSS transition, which is wall clock and
    // cannot be pinned: wait it out, then step one more tick so the
    // frame presented is the settled one
    await page.waitForTimeout(1400);
    await page.evaluate(() => window.__inklands.step(1 / 60, 1));
    await page.waitForTimeout(150);
    await page.screenshot({ path: `${dir}/${name}.png` });
  }
  console.log(`  ${vp.name} → ${dir}`);
  await page.close();
}

await browser.close();
console.log('done →', out);
