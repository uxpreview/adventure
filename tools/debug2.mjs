import { chromium } from 'playwright';
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage();
page.on('pageerror', (e) => console.log('PAGE EXCEPTION:', e.message));
await page.goto('http://localhost:4173/?debug', { waitUntil: 'networkidle' });
await page.waitForTimeout(2600);
await page.evaluate(() => window.__inklands.begin());
await page.evaluate(() => window.__inklands.goto(148, 205));
await page.waitForTimeout(2000);
const out = await page.evaluate(() => {
  const g = window.__inklands;
  let m = null;
  g.scene.traverse((o) => {
    if (!m && o.isMesh && Math.abs(o.position.x - 130.3) < 1 && Math.abs(o.position.z - 145) < 1) m = o;
  });
  if (!m) return 'no mesh';
  const img = m.material.map?.image;
  if (!img) return 'no map image';
  const c = document.createElement('canvas');
  c.width = img.width; c.height = img.height;
  const cx = c.getContext('2d');
  cx.drawImage(img, 0, 0);
  const d = cx.getImageData(0, 0, img.width, img.height).data;
  let nonzero = 0;
  for (let i = 3; i < d.length; i += 4) if (d[i] > 10) nonzero++;
  return {
    w: img.width, h: img.height,
    nonzeroAlphaPx: nonzero, totalPx: d.length / 4,
    opacity: m.material.opacity, alphaTest: m.material.alphaTest,
    renderOrder: m.renderOrder,
    matVisible: m.material.visible, depthTest: m.material.depthTest,
    camY: g.cam.position.y,
  };
});
console.log(JSON.stringify(out));
await browser.close();
