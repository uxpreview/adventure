// THE CONTACT SHEET, IN BOTH VIEWPORTS.
//
// Session 4 made mobile and desktop both first-class (QUALITY-BAR §3,
// WORLD-SYSTEMS §8): every framing is now shot at 1280×720 AND at
// 390×844, and the art director judges both. This is the shared driver
// so a shoot script only has to name its framings once.
//
// Output: OUT/desktop/NN-name.png and OUT/portrait/NN-name.png.
//
// The gotchas are all Session 2's and they all still bite:
//   · a backgrounded page is rAF-throttled and its loader tween never
//     finishes, so each viewport gets its own page, brought to front,
//     and the previous one is CLOSED before the next opens;
//   · begin() before the title is up burns the overlay into every frame,
//     so we wait for the title to actually letter itself on;
//   · and, found the hard way in Session 6: THIS SANDBOX RENDERS AT
//     ABOUT THREE AND A HALF FRAMES A SECOND (no GPU, 213k terrain
//     triangles). App clamps dt at 0.05, so ONE SECOND OF WALL CLOCK IS
//     ABOUT A SIXTH OF A SECOND OF GAME TIME. Anything that drives the
//     walker has to hold for roughly six times as long as it looks like
//     it should — a 2.4-second hold walks about two units and produces
//     four footprints, which is what made the first contact sheet of
//     "sprint as ink weight" show a run and a walk that were identical.
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

export const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 720 },
  { name: 'portrait', width: 390, height: 844 },
];

/** ONE viewport, for iteration rounds only. Never for a gate: a
 *  composition that only works in landscape is not done (QUALITY-BAR). */
const ONLY = process.env.VIEWPORT;

/**
 * SESSION 6 added two things a framing may now ask for, because two of
 * this session's four items cannot be photographed standing still:
 *
 *   opts.hold  [mx, mz, run] — drive the walker as a player would, with
 *              the run ramped. A road that carries and a river under
 *              oar are both MOTION, and a screenshot of somebody
 *              standing on a road proves nothing about either.
 *   opts.hour  hold the world at an o'clock for this frame. The day
 *              cycle is forty minutes long; a contact sheet cannot wait
 *              for dusk, and every protected framing is now shot at two
 *              hours of the day.
 *
 * Plus `opts.boat` / `opts.aboard`, which put the rowboat somewhere and
 * put the walker in it.
 *
 * SESSION 7 adds one more, and the gate needs it: `opts.learn` — a list
 * of knowledge ids to hand the walker before the frame. A wait has to
 * be photographed at BOTH its states and the map at all three of its
 * registers, and neither is reachable inside a shoot script's lifetime
 * by playing the game honestly (the market needs a dusk in the belfry
 * yard and then a walk to the cross, and the map's inked line needs
 * four hundred and eighty units of road).
 *
 * @param {object} o
 * @param {string} o.out              output directory
 * @param {[string, number, number, number, object?][]} o.framings
 *        [file, x, z, settleMs, opts?]
 * @param {string} [o.url]
 * @param {boolean} [o.map]           also shoot the map screen
 * @param {number} [o.hour]           hold the whole sheet at this hour
 * @param {(page, dir) => Promise<void>} [o.extra]  per-viewport extras
 */
export async function shoot({ out, framings, url, map = false, hour, extra }) {
  // HOUR=19.6 node tools/shoot-first-minute.mjs — every protected
  // framing is judged at two hours of the day from Session 6 on: the
  // day cycle is not done until dusk is as good as noon.
  if (hour === undefined && process.env.HOUR) hour = Number(process.env.HOUR);
  const target = url ?? process.env.URL ?? 'http://localhost:4173/?debug';
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });

  for (const vp of VIEWPORTS.filter((v) => !ONLY || v.name === ONLY)) {
    const dir = `${out}/${vp.name}`;
    mkdirSync(dir, { recursive: true });
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    await page.addInitScript(() => localStorage.clear());
    page.on('console', (m) => {
      if (m.type() === 'error') console.log(`[${vp.name}] PAGE ERROR:`, m.text());
    });
    page.on('pageerror', (e) => console.log(`[${vp.name}] PAGE EXCEPTION:`, e.message));

    await page.goto(target, { waitUntil: 'networkidle' });
    await page.bringToFront();

    // mid-load: the loader must own the screen alone, no title bleed
    await page.waitForTimeout(1100);
    await page.screenshot({ path: `${dir}/00a-loader.png` });

    await page
      .waitForFunction(() => document.body.innerText.toLowerCase().includes('set out'), {
        timeout: 15000,
      })
      .catch(() => {});
    await page.waitForTimeout(900);
    await page.screenshot({ path: `${dir}/00b-title.png` });

    if (hour !== undefined) {
      await page.evaluate((h) => window.__inklands.setHour(h, false), hour);
    }

    await page.evaluate(() => window.__inklands.begin());
    await page.waitForTimeout(1500);
    // the title poster is shot before begin(); re-pin the hour, because
    // begin() lets the clock run
    if (hour !== undefined) {
      await page.evaluate((h) => window.__inklands.setHour(h, false), hour);
    }

    for (const [name, x, z, settle, opts = {}] of framings) {
      // never carry the boat into the next framing: a rowboat parked in
      // the middle of THE COMMON is what the first contact sheet of
      // this session actually produced
      if (!opts.aboard) await page.evaluate(() => window.__inklands.stepOff());
      if (opts.hour !== undefined) {
        await page.evaluate((h) => window.__inklands.setHour(h, false), opts.hour);
      }
      if (opts.boat) {
        await page.evaluate((b) => window.__inklands.putBoat(b[0], b[1]), opts.boat);
      }
      if (opts.learn) {
        await page.evaluate((ids) => ids.forEach((i) => window.__inklands.learn(i)), opts.learn);
      }
      await page.evaluate(([tx, tz]) => window.__inklands.goto(tx, tz), [x, z]);
      if (opts.aboard) {
        await page.evaluate(() => window.__inklands.takeOars());
        await page.waitForTimeout(200);
      }
      await page.waitForTimeout(settle);
      if (opts.hold) {
        // driven, not tapped: a road that carries and a river under oar
        // are both motion, and the run has a ramp on it
        await page.evaluate((h) => window.__inklands.drive(h[0], h[1], h[2]), opts.hold);
        await page.waitForTimeout(opts.holdMs ?? 2200);
        await page.screenshot({ path: `${dir}/${name}.png` });
        await page.evaluate(() => window.__inklands.release());
        await page.waitForTimeout(300);
        continue;
      }
      // real strides so prints, fades, proximity motion and the camera's
      // rise damper all settle into what a player would actually see
      await page.keyboard.down('KeyW');
      await page.waitForTimeout(500);
      await page.keyboard.up('KeyW');
      await page.waitForTimeout(650);
      await page.screenshot({ path: `${dir}/${name}.png` });
    }

    if (map) {
      if (process.env.LEARN) {
        await page.evaluate(
          (ids) => ids.forEach((i) => window.__inklands.learn(i)),
          process.env.LEARN.split(',')
        );
      }
      await page.keyboard.press('KeyM');
      await page.waitForTimeout(900);
      await page.screenshot({ path: `${dir}/99-map.png` });
      await page.keyboard.press('KeyM');
    }

    if (extra) await extra(page, dir);

    console.log(`  ${vp.name}: ${framings.length + 2 + (map ? 1 : 0)} frames → ${dir}`);
    await page.close();
  }

  await browser.close();
  console.log('done →', out);
}
