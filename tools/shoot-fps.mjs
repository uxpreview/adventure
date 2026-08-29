// The 60fps law needs a number (QUALITY-BAR §3), measured where the
// world is heaviest: the castle ridge, the crease, the tear, the town.
//
// READ THIS BEFORE QUOTING THE OUTPUT. The sandbox has no GPU, so these
// are a software rasteriser's milliseconds and mean nothing on their
// own. What they are FOR is comparison: run it against two builds and
// the ratio is real, and the draw counts and triangle counts beside
// them are exactly what a phone would see. DPR is forced past the app's
// own cap so the pixel count is a worst case.
import { chromium } from 'playwright';

const SPOTS = [
  ['brim square', -45, -70], ['castle avenue', -45, -176], ['the bailey', -45, -222],
  ['the crease', 62, 62], ['the tear', 312, -140], ['the curled rim', 348, 44],
  ['the common', -45, 66], ['the downs', 112, 4],
];

const url = process.env.URL ?? 'http://localhost:4173/?debug';
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
for (const vp of [
  { name: 'desktop', width: 1280, height: 720, dpr: 2 },
  { name: 'portrait', width: 390, height: 844, dpr: 3 },
]) {
  const page = await browser.newPage({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: vp.dpr,
  });
  await page.addInitScript(() => localStorage.clear());
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.bringToFront();
  await page.waitForTimeout(3600);
  await page.evaluate(() => window.__inklands.begin());
  await page.waitForTimeout(1500);
  const dpr = await page.evaluate(() => window.__inklands.renderer.getPixelRatio());
  console.log(`${vp.name} ${vp.width}x${vp.height} @dpr${vp.dpr} (renderer dpr ${dpr}):`);
  for (const [name, x, z] of SPOTS) {
    await page.evaluate(([tx, tz]) => window.__inklands.goto(tx, tz), [x, z]);
    await page.waitForTimeout(1400);
    const c = await page.evaluate(() => window.__inklands.frameCost(30));
    console.log(
      `  ${name.padEnd(15)} ${c.ms.toFixed(1).padStart(6)} ms/frame   ` +
      `${String(c.calls).padStart(3)} draws  ${(c.tris / 1000).toFixed(0)}k tris`
    );
  }
  await page.close();
}
await browser.close();
