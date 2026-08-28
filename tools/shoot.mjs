// Drive INKLANDS under Playwright: begin the game, teleport to each
// land, walk a few real strides, screenshot.
import { chromium } from 'playwright';

const SPOTS = [
  ['meadow', -45, 58],
  ['kingdom', -45, -85],
  ['castle', -45, -215],
  ['forest', 145, -190],
  ['canyon', 300, -150],
  ['desert', 300, 45],
  ['downs', 148, -5],
  ['beach', -205, 60],
  ['ocean', -270, 60],
  ['neighborhood', -45, 195],
  ['city', 148, 205],
  ['office', 280, 205],
];

const url = process.env.URL ?? 'http://localhost:4173/?debug';
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
page.on('console', (m) => { if (m.type() === 'error') console.log('PAGE ERROR:', m.text()); });
page.on('pageerror', (e) => console.log('PAGE EXCEPTION:', e.message));

await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(2600);
await page.screenshot({ path: (process.env.OUT ?? 'shots') + '/00-title.png' });

// begin
await page.evaluate(() => window.__inklands.begin());
await page.waitForTimeout(1200);

for (const [name, x, z] of SPOTS) {
  await page.evaluate(([tx, tz]) => window.__inklands.goto(tx, tz), [x, z]);
  await page.waitForTimeout(900);
  // walk with real keys so prints + steps + fields run
  await page.keyboard.down('KeyD');
  await page.waitForTimeout(1100);
  await page.keyboard.up('KeyD');
  await page.keyboard.down('KeyW');
  await page.waitForTimeout(700);
  await page.keyboard.up('KeyW');
  await page.waitForTimeout(600);
  const region = await page.evaluate(() => window.__inklands.region());
  console.log(`${name}: standing in region "${region}"`);
  await page.screenshot({ path: `${process.env.OUT ?? 'shots'}/${name}.png` });
}

// the map
await page.keyboard.press('KeyM');
await page.waitForTimeout(900);
await page.screenshot({ path: (process.env.OUT ?? 'shots') + '/99-map.png' });

await browser.close();
console.log('done');
