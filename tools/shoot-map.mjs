// THE MAP, AT ITS THREE REGISTERS — Session 7.
//
// The map is the record now (WORLD-SYSTEMS §6), and a record has to be
// judged at every state it can be in, not at the one a fresh save
// happens to produce. So this drives it deliberately:
//
//   A · FRESH        one land in ink, eleven question marks. What a
//                    player sees in their first minute
//   B · HEARD        the crossroads signpost has named three lands, and
//                    they are written in pencil, underlined, with no
//                    border drawn round them. Nobody has been there
//   C · WALKED       six lands in ink, and the rest still pencil or
//                    unknown — the honest middle of a real playthrough
//   D · THE LINE     the same map with route:the-line held: the king's
//                    road, main street and the commuter spur stop being
//                    dashes and become one continuous inked line from a
//                    castle gate to a car park. Nothing captions it.
//                    That is Act III (design/THE-LINE.md §3.3)
//
// Shot at 1280×720 and at 390×844, because the map's lettering is sized
// for its DELIVERED size and Session 6.1 found that the hard way.
//
//   node tools/shoot-map.mjs
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { CHROMIUM } from './pw.mjs';

const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 720 },
  { name: 'portrait', width: 390, height: 844 },
  { name: '320-narrow', width: 320, height: 568 },
];

const out = process.env.OUT ?? 'shots-map';
const url = process.env.URL ?? 'http://localhost:4173/?debug';
const browser = await chromium.launch({ executablePath: CHROMIUM });

// what the crossroads signpost names, which is the first note in the game
const HEARD = ['name:kingdom', 'name:beach', 'name:downs'];
// a plausible six lands into a playthrough
const WALKED = ['meadow', 'kingdom', 'castle', 'beach', 'ocean', 'downs'];

for (const vp of VIEWPORTS.filter((v) => !process.env.VIEWPORT || v.name === process.env.VIEWPORT)) {
  const dir = `${out}/${vp.name}`;
  mkdirSync(dir, { recursive: true });
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
  await page.addInitScript(() => localStorage.clear());
  page.on('pageerror', (e) => console.log(`[${vp.name}] EXCEPTION:`, e.message));

  await page.goto(url, { waitUntil: 'networkidle' });
  await page.bringToFront();
  await page
    .waitForFunction(() => document.body.innerText.toLowerCase().includes('set out'), { timeout: 15000 })
    .catch(() => {});
  await page.evaluate(() => window.__inklands.begin());
  await page.waitForTimeout(2600);

  const shot = async (name) => {
    await page.keyboard.press('KeyM');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${dir}/${name}.png` });
    await page.keyboard.press('KeyM');
    await page.waitForTimeout(400);
  };

  await shot('01-fresh');
  await page.evaluate((ids) => ids.forEach((i) => window.__inklands.learn(i)), HEARD);
  await shot('02-heard');
  await page.evaluate((ids) => {
    for (const id of ids) {
      window.__inklands.save.discover(id);
      window.__inklands.learn(`name:${id}`);
    }
  }, WALKED);
  await shot('03-walked');
  await page.evaluate(() => window.__inklands.learn('route:the-line'));
  await shot('04-the-line');

  console.log(`  ${vp.name}: 4 maps → ${dir}`);
  await page.close();
}

await browser.close();
console.log('done →', out);
