import { chromium } from 'playwright';
import { CHROMIUM } from './pw.mjs';

const browser = await chromium.launch({ executablePath: CHROMIUM });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
page.on('pageerror', (e) => console.log('PAGE EXCEPTION:', e.message));
await page.goto('http://localhost:4173/?debug', { waitUntil: 'networkidle' });
await page.waitForTimeout(2600);
await page.evaluate(() => window.__inklands.begin());
await page.evaluate(() => window.__inklands.goto(148, 205));
await page.waitForTimeout(2000);

const out = await page.evaluate(() => {
  const g = window.__inklands;
  const probes = [[131, 187], [170, 197], [131, 145], [72, 186], [280, 176], [-63, 250], [-26, 150]];
  const res = { probes: {}, meshes: [] };
  for (const [x, z] of probes) {
    res.probes[`${x},${z}`] = {
      water: +g.terrain.waterAt(x, z).toFixed(3),
      road: g.terrain.roadAt(x, z),
    };
  }
  let count = 0;
  g.scene.traverse((o) => {
    if (o.isMesh) count++;
    if (o.isMesh && Math.abs(o.position.x - 150) < 60 && Math.abs(o.position.z - 203) < 60 && o.geometry?.parameters?.height > 5) {
      res.meshes.push({
        x: +o.position.x.toFixed(1), z: +o.position.z.toFixed(1),
        h: o.geometry.parameters.height, visible: o.visible,
        parentVisible: o.parent?.visible,
      });
    }
  });
  res.total = count;
  return res;
});
console.log(JSON.stringify(out, null, 1));
await browser.close();
