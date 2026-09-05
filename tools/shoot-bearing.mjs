// THE BEARING — Session 9's own contact sheet, and it is the first one
// in this project that is not a set of stand-stills.
//
//   npx vite preview --port 4173 &
//   node tools/shoot-bearing.mjs
//
// Every framing this project owns is a photograph of somebody standing
// still, and a camera that answers TRAVEL cannot be judged in one.
// Worse, the half of it that matters most — the walk south — is a
// composition no contact sheet has ever contained, because until now
// there was no reason to point the shutter at somebody walking away
// from the frame.
//
// So this sheet is built out of WALKS, and every walk is shot TWICE
// from the same start: once with the bearing PINNED, which is the page
// as it shipped, and once LIVE. The pairs sit next to each other in the
// directory listing on purpose — a-PINNED then b-LIVE — because the
// question the gate has to answer is not "is this a good frame", it is
// "is this better than the one under it".
//
// ---- WHY IT DOES NOT TAKE HALF AN HOUR ------------------------------
//
// It drives the walker on the HARNESS CLOCK (Session 9's
// `__inklands.step`) rather than by holding a key for a number of
// milliseconds. This sandbox renders at about three and a half frames a
// second, so Session 6's sprint sheet had to hold a key for fourteen
// seconds to walk ten units, and Session 8's regression pass was the
// better part of half an hour. Here a walk is stated in GAME seconds,
// runs at a fixed sixtieth, renders once at the end, and costs about a
// third of a second — so this sheet drives the walker four hundred and
// eighty units down the king's road and still finishes in minutes. It
// is also repeatable to the pixel, which is what lets the PINNED half
// of every pair be a genuine control.
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { CHROMIUM } from './pw.mjs';

const OUT = process.env.OUT ?? 'shots-s9';
const URL = process.env.URL ?? 'http://localhost:4173/?debug';
const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 720 },
  { name: 'portrait', width: 390, height: 844 },
].filter((v) => !process.env.VIEWPORT || v.name === process.env.VIEWPORT);

/** north is −Z. */
const S = [0, 1], N = [0, -1], E = [1, 0], W = [-1, 0];

/* ================================================================== *
 * 1. THE WALK SOUTH — the composition this session exists for.
 *
 * The king's road runs north–south for four hundred and eighty units
 * (THE-LINE §3: the castle gate at z −218, the road head at z +262) and
 * ACT III'S WHOLE WALK IS DOWN IT. Eight stations from Greyweather's
 * gate to the end of the survey, each walked south for four game
 * seconds before the shutter, so the camera is in the state a walker
 * would actually have put it in — pinned, then live.
 * ================================================================== */
const SOUTH = [
  ['a-castle-gate', -45, -206],
  ['b-avenue', -45, -168],
  ['c-brim-north-gate', -45, -128],
  ['d-brim-square', -45, -58],
  ['e-brim-south-gate', -45, -14],
  ['f-gate-fields', -45, 30],
  ['g-the-common', -45, 70],
  ['h-road-head', -45, 232],
];

/* ---- 2. crossing the frame: where the yaw earns its place --------- */
const CROSS = [
  ['a-common-east', -60, 66, E],
  ['b-common-west', -30, 66, W],
  ['c-tide-line-west', -212, 16, W],
  ['d-downs-east', 96, 4, E],
];

/* ---- 3. the six protected lands, bearing LIVE and walker MOVING --- */
const LANDS = [
  ['a-common', -45, 78, N],
  ['b-brim-street', -45, -30, N],
  ['c-greyweather-avenue', -45, -160, N],
  ['d-longshore-boardwalk', -228, 88, N],
  ['e-the-cut', -237, -45, N],
  ['f-the-sandbar', -292, -14, N],
];

/* ---- 4. the peek, which is a gesture and never a state ------------ */
const PEEK = [
  ['a-common-left', -45, 66, -1],
  ['b-common-none', -45, 66, 0],
  ['c-common-right', -45, 66, 1],
  ['d-avenue-left', -45, -160, -1],
  ['e-avenue-right', -45, -160, 1],
];

/* ---- 5. and the labels, which a turning camera moves -------------- */
const LABELS = [
  ['a-crossroads', -44.5, 57],
  ['b-well', -56.5, 48],
  /* NOT at (−45, −70): Brim has three runs of bunting at z −65, −81 and
   * −96, and a camera trailing thirteen units from there hangs two
   * enormous translucent triangles down the middle of the frame. This
   * stands south-east of the cross, close enough for its name and far
   * enough for the lens. */
  ['c-market-cross', -38, -60],
  ['d-crossroads-east', -50, 57, E],
];

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: CHROMIUM });

for (const vp of VIEWPORTS) {
  const dir = `${OUT}/${vp.name}`;
  mkdirSync(dir, { recursive: true });
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
  await page.addInitScript(() => localStorage.clear());
  page.on('pageerror', (e) => console.log(`[${vp.name}] PAGE EXCEPTION:`, e.message));
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.bringToFront();
  await page
    .waitForSelector('.title-veil:not(.gone)', { timeout: 25000 })
    .catch(() => {});
  await page.evaluate(() => window.__inklands.begin());
  await page.waitForTimeout(1200);

  /**
   * Stand somebody at (x, z), hand them a direction, and let four game
   * seconds pass. `settle` first, so the land is inked and every damper
   * has arrived before the walk starts and the frame is about the WALK.
   */
  const frame = async (name, x, z, move, opts = {}) => {
    await page.evaluate(
      ([tx, tz, mx, mz, hour, bearing, peek, walkS]) => {
        const I = window.__inklands;
        I.setBearing(bearing);
        I.peek(null);
        I.setHour(hour, false);
        I.goto(tx, tz);
        I.setTime(0);
        I.step(1 / 60, 600);          // ten game seconds: the page inks in
        I.quiet();                    // the harness teleported; the card did not
        if (peek !== 0) I.peek(peek);
        if (mx !== 0 || mz !== 0) I.drive(mx, mz, 0);
        I.step(1 / 60, Math.round(walkS * 60));
        I.release();
        I.peek(null);
      },
      [x, z, move?.[0] ?? 0, move?.[1] ?? 0, opts.hour ?? 12,
        opts.bearing !== false, opts.peek ?? 0, opts.walk ?? 4]
    );
    // let any CSS transition the frame carries finish before the shutter
    await page.waitForTimeout(450);
    await page.screenshot({ path: `${dir}/${name}.png` });
  };

  /** A walk shot twice from one start: the shipped page, then this one. */
  const pair = async (n, name, x, z, move, opts = {}) => {
    await frame(`${n}${name}-1-PINNED`, x, z, move, { ...opts, bearing: false });
    await frame(`${n}${name}-2-LIVE`, x, z, move, { ...opts, bearing: true });
  };

  console.log(`[${vp.name}] 1. the walk south`);
  for (const [n, x, z] of SOUTH) await pair('1', n, x, z, S);
  // and the three that carry it, at dusk
  for (const [n, x, z] of SOUTH.slice(3, 6)) {
    await pair('2', n + '-dusk', x, z, S, { hour: 19.6 });
  }

  console.log(`[${vp.name}] 3. crossing the frame`);
  for (const [n, x, z, m] of CROSS) await pair('3', n, x, z, m);

  console.log(`[${vp.name}] 4. the protected lands, walking`);
  for (const [n, x, z, m] of LANDS) {
    await frame(`4${n}`, x, z, m);
    await frame(`4${n}-dusk`, x, z, m, { hour: 19.6 });
  }

  console.log(`[${vp.name}] 5. the peek`);
  for (const [n, x, z, p] of PEEK) {
    await frame(`5${n}`, x, z, null, { peek: p, walk: 2.5 });
  }

  console.log(`[${vp.name}] 6. the labels`);
  for (const [n, x, z, m] of LABELS) {
    await frame(`6${n}`, x, z, m ?? null, { walk: m ? 3 : 0.2 });
  }

  console.log(`  ${vp.name} → ${dir}`);
  await page.close();
}

await browser.close();
console.log('done →', OUT);
