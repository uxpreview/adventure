import { chromium } from 'playwright';
import { CHROMIUM } from './pw.mjs';
const url = process.env.URL;
const browser = await chromium.launch({ executablePath: CHROMIUM });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
page.on('pageerror', (e) => console.log('PAGE EXCEPTION:', e.message));
page.on('console', (m) => { if (m.type() === 'error') console.log('CONSOLE ERROR:', m.text()); });
const resp = await page.goto(url + '?debug', { waitUntil: 'networkidle', timeout: 45000 });
console.log('HTTP', resp.status(), resp.url());
await page.waitForTimeout(3000);
const hasGame = await page.evaluate(() => !!window.__inklands);
console.log('game booted:', hasGame);
if (hasGame) {
  await page.evaluate(() => window.__inklands.begin());
  await page.keyboard.down('KeyW');
  await page.waitForTimeout(1500);
  await page.keyboard.up('KeyW');
  const region = await page.evaluate(() => window.__inklands.region());
  const pos = await page.evaluate(() => [window.__inklands.char.pos.x.toFixed(1), window.__inklands.char.pos.z.toFixed(1)]);
  console.log('walking works — region:', region, 'pos:', pos.join(','));
  await page.screenshot({ path: process.env.OUT + '/live.png' });
}
await browser.close();
