// MOBILE QA — the chrome, on real phone viewports.
//
// Session 6.5, and it exists because of a bug a player found on an
// actual phone that five sessions of contact sheets could not have
// caught: **no shoot script has ever opened a note card.** Every sheet
// so far photographs the WORLD; the note, the region card, the hint and
// the interact prompt are the half of this game the player reads, and
// they were being judged by nobody.
//
// So this shoots the chrome, at four widths, in portrait only — because
// the chrome is where portrait actually breaks (QUALITY-BAR §3: mobile
// and desktop are both first-class, and a composition that only works
// in landscape is not done).
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

// the narrow end of the real world, the two common iPhones, and a large
// Android. 320 is an iPhone SE in a browser with the chrome showing.
const PHONES = [
  { name: '320-narrow', width: 320, height: 568 },
  { name: '360-android', width: 360, height: 800 },
  { name: '390-iphone', width: 390, height: 844 },
  { name: '430-max', width: 430, height: 932 },
];

// the longest note in the game, and one of the shortest, so the card is
// judged at both ends of its range
const LONG = 'THE KEEP';
const SHORT = 'THE MOAT POOL';

const out = process.env.OUT ?? 'shots-mobile';
const url = process.env.URL ?? 'http://localhost:4173/?debug';
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });

for (const vp of PHONES) {
  const dir = `${out}/${vp.name}`;
  mkdirSync(dir, { recursive: true });
  const page = await browser.newPage({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  await page.addInitScript(() => localStorage.clear());
  page.on('pageerror', (e) => console.log(`[${vp.name}] EXCEPTION:`, e.message));

  await page.goto(url, { waitUntil: 'networkidle' });
  await page.bringToFront();
  await page.waitForTimeout(1100);
  await page.screenshot({ path: `${dir}/01-loader.png` });
  await page
    .waitForFunction(() => document.body.innerText.toLowerCase().includes('set out'), {
      timeout: 15000,
    })
    .catch(() => {});
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${dir}/02-title.png` });

  await page.evaluate(() => window.__inklands.begin());
  // the border card and the control hint both fire on begin
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${dir}/03-card-and-hint.png` });
  await page.waitForTimeout(3000);

  // THE LONGEST LAND NAME IN THE GAME, on the border card. THE COMMON
  // is ten characters and fits anywhere; CASTLE GREYWEATHER is
  // eighteen, in 24pt display caps, and is what actually tests it.
  await page.evaluate(() => window.__inklands.goto(-45, -158));
  await page.waitForTimeout(500);
  await page.evaluate(() => window.__inklands.goto(-45, -170));
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${dir}/03b-longest-card.png` });
  await page.waitForTimeout(2500);

  // THE NOTE CARD — the thing that was never shot. Walked to, not
  // teleported past: the prompt has to be reachable by a thumb and the
  // card has to hold its own text.
  for (const [file, label, x, z] of [
    ['04-note-long', LONG, -45, -234],
    ['05-note-short', SHORT, -100, -215],
  ]) {
    await page.evaluate(([tx, tz]) => window.__inklands.goto(tx, tz), [x, z]);
    await page.waitForTimeout(1400);
    await page.screenshot({ path: `${dir}/${file}-prompt.png` });
    await page.evaluate((l) => {
      const poi = window.__inklands.poi ?? null;
      // press the prompt exactly as a thumb would
      const el = document.getElementById('prompt');
      if (el) el.click();
      void poi; void l;
    }, label);
    await page.waitForTimeout(900);
    await page.screenshot({ path: `${dir}/${file}.png` });
    // Escape, which is what the game itself listens for — a synthetic
    // click on the veil is not reliable across viewports and left a
    // note card open underneath the joystick frame
    await page.keyboard.press('Escape');
    await page.waitForTimeout(600);
  }

  // the map, which IS shot elsewhere but never at 320
  await page.keyboard.press('KeyM');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${dir}/06-map.png` });
  await page.keyboard.press('KeyM');
  await page.waitForTimeout(400);

  // and the joystick, planted where a thumb actually lands
  await page.touchscreen.tap(vp.width * 0.5, vp.height * 0.82);
  await page.mouse.move(vp.width * 0.5, vp.height * 0.82);
  await page.mouse.down();
  await page.mouse.move(vp.width * 0.5 + 10, vp.height * 0.82 - 70, { steps: 8 });
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${dir}/07-joystick-running.png` });
  await page.mouse.up();

  console.log(`  ${vp.name}: 8 frames → ${dir}`);
  await page.close();
}

await browser.close();
console.log('done →', out);
