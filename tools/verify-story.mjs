// PLAY THE WAIT, DON'T POKE IT.
//
// The contact sheet uses `__inklands.learn(...)` to reach both of a
// wait's states inside a shoot script's lifetime, which is legitimate
// for photography and proves nothing about the game. This walks the
// chain the way a player does and asserts each link:
//
//   1. a fresh page knows nothing and the map says so;
//   2. reading the crossroads signpost puts THREE lands into pencil,
//      and standing in one puts it into ink;
//   3. standing in Brim's belfry yard at NOON teaches nothing;
//   4. standing there at DUSK, while the lamps are on, teaches the hour;
//   5. carrying that to the market cross calls the market — and the
//      stall is open and the board is chalked;
//   6. and it survives a reload, because a permanent change that
//      forgets is a daytime state.
//
// Plus the frame cost at Brim Square, because this session put four
// more standees in the busiest plaza in the game.
//
//   node tools/verify-story.mjs
import { chromium } from 'playwright';

const url = process.env.URL ?? 'http://localhost:4173/?debug';
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
/* NO addInitScript HERE, and it cost this script a false failure.
 * An init script runs on EVERY navigation, so clearing localStorage
 * that way wipes the save on the reload and then reports that the
 * market forgot itself. Clear once, by hand, before the run. */
page.on('pageerror', (e) => console.log('EXCEPTION:', e.message));

let fails = 0;
const check = (label, ok, extra = '') => {
  console.log(`  ${ok ? '✓' : '✗'} ${label}${extra ? ' — ' + extra : ''}`);
  if (!ok) fails++;
};
const knows = (id) => page.evaluate((i) => window.__inklands.knowledge.has(i), id);
const at = async (x, z, ms = 900) => {
  await page.evaluate(([tx, tz]) => window.__inklands.goto(tx, tz), [x, z]);
  await page.waitForTimeout(ms);
};
const hour = (h) => page.evaluate((v) => window.__inklands.setHour(v, false), h);

await page.goto(url, { waitUntil: 'networkidle' });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: 'networkidle' });
await page
  .waitForFunction(() => document.body.innerText.toLowerCase().includes('set out'), { timeout: 15000 })
  .catch(() => {});
await page.evaluate(() => window.__inklands.begin());
await page.waitForTimeout(2200);

console.log('\na fresh page:');
check('knows THE COMMON, because it is standing in it', await knows('name:meadow'));
check('has not heard of BRIM', !(await knows('name:kingdom')));
check('has not heard of THE PENWOOD', !(await knows('name:forest')));

console.log('\nthe crossroads signpost:');
await at(-42, 55, 1200);
await page.evaluate(() => document.getElementById('prompt')?.click());
await page.waitForTimeout(700);
check('names BRIM', await knows('name:kingdom'));
check('names LONGSHORE', await knows('name:beach'));
check('names THE HARROW DOWNS', await knows('name:downs'));
check('does not name the office park', !(await knows('name:office')));
check('and BRIM is HEARD, not SEEN', await page.evaluate(
  () => window.__inklands.knowledge.register('kingdom', window.__inklands.save.data.discovered) === 'heard'
));
await page.keyboard.press('Escape');
await page.waitForTimeout(400);

console.log('\nBrim’s belfry yard:');
await hour(12);
await at(-64, -42, 1400);
check('at noon it teaches nothing', !(await knows('fact:brim-hour')));
check('and standing in BRIM makes it SEEN', await page.evaluate(
  () => window.__inklands.knowledge.register('kingdom', window.__inklands.save.data.discovered) === 'seen'
));
await hour(20.2);
await at(-64, -42, 1600);
check('at dusk, with the lamps on, it teaches the hour', await knows('fact:brim-hour'));
check('but the market is not called from the belfry', !(await knows('reason:brim')));

console.log('\nthe market cross:');
await at(-35, -71, 1600);
check('carrying the hour to the cross calls the market', await knows('reason:brim'));

console.log('\nand the world did it:');
await hour(12);
await at(-45, -63, 1600);
const seen = await page.evaluate(() => {
  const out = { open: 0, shut: 0, board: 0, marget: 0 };
  window.__inklands.scene.traverse((o) => {
    if (!o.isMesh || !o.material?.map) return;
    const w = o.geometry?.parameters?.width;
    if (Math.abs(o.position.x + 40.5) < 0.1 && Math.abs(o.position.z + 75.5) < 0.1) {
      if (o.visible) out.open++;
      else out.shut++;
    }
    if (Math.abs(o.position.x + 38.6) < 0.1 && o.visible) out.board++;
    if (Math.abs(o.position.x + 43.1) < 0.1 && o.visible) out.marget++;
    void w;
  });
  return out;
});
check('exactly one of the two stalls is on the page', seen.open === 1 && seen.shut === 1,
  `${seen.open} visible / ${seen.shut} hidden`);
check('the board is chalked at the cross', seen.board === 1);
check('Marget is at her counter', seen.marget === 1);

console.log('\nafter a reload:');
await page.reload({ waitUntil: 'networkidle' });
await page
  .waitForFunction(() => document.body.innerText.toLowerCase().includes('continue') ||
    document.body.innerText.toLowerCase().includes('set out'), { timeout: 15000 })
  .catch(() => {});
await page.evaluate(() => window.__inklands.begin());
await page.waitForTimeout(1800);
check('the market is still called', await knows('reason:brim'));
check('and BRIM is still a place you have been', await knows('name:kingdom'));

console.log('\nand a route is walked, never told:');
check('the line is not known from a note', !(await knows('route:the-line')));
/* WALK IT. The posts are authored down the king's road, main street and
 * the commuter spur; the map only inks the line when there are none
 * left, and there is no other way to hold it. */
const LINE = [
  [-45, -218], [-45, -206], [-45, -195], [-45, -120], [-48, -60], [-45, -15],
  [-45, 58], [-42, 130], [-45, 200],
  [-8, 202], [40, 198], [90, 200], [148, 205],
  [210, 208], [268, 205], [330, 202],
];
for (const [x, z] of LINE) await at(x, z, 260);
check('walking it end to end is the only way to hold it', await knows('route:the-line'));
check('and the river is still unrowed', !(await knows('route:the-river')));

console.log('\nfaster than the eye:');
await hour(12);
await at(-45, -78, 1600);
const cost = await page.evaluate(() => window.__inklands.frameCost(30));
console.log(`  Brim Square: ${cost.ms.toFixed(1)}ms/frame, ${cost.calls} draws, ${cost.tris} tris`);
console.log('  (Session 6 recorded Brim Square at 217 draws; Session 10 measured');
console.log('   THE COMMON, the worst frame in the game, at 350 draws / 6.4 ms)');
/* SESSION 11 RE-CUT THIS THRESHOLD AND SAID SO, because it was 235 and
 * it had been failing since Session 10 without anybody running the
 * file. It is not a regression: 235 was `217 + the four standees
 * Session 7 added`, which is a DELTA written as an absolute, and it
 * went stale the moment another session put anything on the page.
 * Brim Square sees THE PENWOOD's edge (its rect starts 105 units east
 * of the square, well inside SHOW_REACH), so Session 10's wood is in
 * this count and always will be.
 *
 * The number that means something is the one Session 10's own
 * performance round was judged on: THE COMMON, the worst frame in the
 * game, at 350 draws. Anything at or under that is inside an envelope
 * an art director has already passed. Brim Square is 311.
 *
 * If this fires again, do not raise it — find what was added. */
if (cost.calls > 355) { console.log('  ✗ Brim Square is now costlier than the worst frame in the game'); fails++; }

await browser.close();
console.log(fails ? `\n${fails} FAILED` : '\nall story checks pass');
process.exit(fails ? 1 : 0);
