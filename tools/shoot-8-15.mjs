// THE 8:15 — the contact sheet for THE CUBICLE MILE, its wait, and the
// mount that is the ending's instrument.
//
// Session 14. Shot on the harness clock (Session 9) so two runs of the
// same framing are the same picture, in both viewports, with the chrome
// swept. Framings are [name, x, z, opts?]:
//
//   opts.hour    hold the sheet at an o'clock (the shelter light, the
//                lit windows and the lamp standards are all dusk)
//   opts.learn   hand the walker knowledge before the frame — a wait has
//                two states and the gate has to see both
//   opts.wait    extra game seconds of settle
//   opts.train   [stop, carrying] — put the 8:15 at one of its twelve
//                stops with a load in its windows
//   opts.ride    get on
//
// THE FRAMINGS THAT NEED KNOWLEDGE GO LAST, and Session 13 is why: a
// `learn` is for the rest of the page, and round 4 of that session's
// sheet had a man sitting on a bench in the shot that was supposed to
// show him standing, because a framing eleven rows earlier had handed
// the walker the fact. The shelter's light is exactly that trap: it is
// the whole of this land's wait and it never goes back off.
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { CHROMIUM } from './pw.mjs';

const SHOTS = [
  // ---- THE CUBICLE MILE, before the walker has walked anything ------
  ['01-mile-the-barrier',        243, 216],
  ['02-mile-THE-SHOT-the-stop',  252, 210],
  ['03-mile-the-stop-close',     252, 206],
  ['04-mile-the-board',          258, 205],
  ['05-mile-the-level-roofline', 277, 200],
  ['06-mile-the-atrium',         283, 184],
  ['07-mile-the-doors',          283, 176],
  ['08-mile-the-overflow',       301, 168],
  ['09-mile-the-car-park',       322, 210],
  ['10-mile-the-slab',           332, 152],
  ['11-mile-the-muster-point',   290, 260],
  ['12-mile-the-back-of-house',  260, 254],
  ['13-mile-arriving-west',      236, 212],
  // ---- and at dusk, which is when this land is about something -----
  ['14-mile-dusk-the-mile',      277, 200, { hour: 19.8 }],
  ['15-mile-dusk-the-stop-DARK', 252, 210, { hour: 19.8 }],
  // ---- the neighbours, because a land session's diff is its own ----
  ['16-city-the-spur-east',      210, 214],
  ['17-flats-looking-south',     300, 122],
  /* ---- THE 8:15 -----------------------------------------------------
   * THE CAMERA LOOKS NORTH, WHICH IS −Z, so to see a stop you stand
   * SOUTH of it. Round 1 of this sheet shot four framings of an empty
   * road with the train behind the walker's head. */
  ['18-line-something-coming',   -45, 118, { train: [6, 3] }],   // it is at z 58
  /* LONGSHORE's wait is written and not built, so its platform is
   * always empty — which is what an unanswered wait looks like, and it
   * is the frame the ending has to survive as well as the other one. */
  ['19-line-it-stops-empty',     -45,  42, { train: [5, 2] }],   // LONGSHORE, z 24
  /* MAPLE COURT's stop rather than Brim's: Brim's is halfway up a
   * street of terraces and the carriage comes back buried in a town. */
  ['20-line-somebody-gets-on',   -45, 168, { train: [8, 4], learn: ['name:castle'] }],
  ['21-line-at-the-junction',    148, 218,
    { train: [10, 6], learn: ['fact:the-man-at-the-junction'] }],
  ['22-line-at-the-stop',        252, 216,
    { train: [11, 7], learn: ['fact:the-timetable'] }],
  ['23-line-aboard',             252, 216, { train: [11, 7], ride: true }],
  ['24-line-the-car-park-end',   322, 214, { park: true }],
  // ---- THE WAIT'S PERMANENT CHANGE, and it never goes back off -----
  ['25-mile-dusk-THE-LIGHT',     252, 210, { hour: 19.8, learn: ['route:the-line'] }],
  ['26-mile-the-board-wiped',    258, 205, { learn: ['fact:the-old-name'] }],
  // ---- and the framing this session may not break ------------------
  ['27-rim-the-end-of-the-survey', -45, 274],
];
const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 720 },
  { name: 'portrait', width: 390, height: 844 },
];
const ONLY = process.env.VIEWPORT;
const PICK = process.env.ONLY;

const out = process.env.OUT ?? 'shots/session14';
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
        /* the train is un-spent between framings: it is NOT in the world
         * until it has run, and a shoot list that left it standing in a
         * car park would put the ending in every later frame */
        I.hideTrain();
        if (o.train) I.warpTrain(o.train[0], o.train[1]);
        if (o.park) I.parkTrain();
        I.step(1 / 60, 720 + Math.round((o.wait ?? 0) * 60));
        if (o.ride) {
          I.rideTheLine();
          I.step(1 / 60, 90);
        }
        I.quiet();
      },
      [x, z, opts, HOUR]
    );
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
