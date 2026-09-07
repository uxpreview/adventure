// THE FRAME BUDGET, per land, per hour, per rig.
//
//   node tools/check-fps.mjs [--url http://localhost:4173/] [--json out.json] [--lands meadow,city]
//
// For each of the twelve lands at 12:00 and 19:30 on both rigs: teleport
// there, settle two seconds on the harness clock, then read
// `__inklands.frameCost(30)` — milliseconds, draw calls, triangles — and
// count the lettered canvases in the DOM.
//
// The sandbox has no GPU. SwiftShader's milliseconds are not a phone's,
// so the GATE is on the two numbers a phone would see exactly as we do:
// draw calls and triangles per frame. The budget below is what a
// mid-range phone comfortably does at 60 fps with a fullscreen post
// pass on top.
import { chromium } from 'playwright';
import { build } from 'esbuild';
import { writeFileSync, mkdirSync } from 'node:fs';
import { CHROMIUM } from './pw.mjs';

const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : d; };
let URL = arg('url', process.env.URL ?? 'http://localhost:4173/');
if (!URL.includes('debug')) URL += (URL.includes('?') ? '&' : '?') + 'debug';
const JSON_OUT = arg('json', null);
const ONLY = arg('lands', null)?.split(',');

export const BUDGET = { calls: 180, tris: 350_000 };
const HOURS = [12, 19.5];
const RIGS = [
  { name: 'desktop', viewport: { width: 1280, height: 720 }, deviceScaleFactor: 2 },
  { name: 'portrait', viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
];

// the lands, from the authored geography, so a re-authored world is
// measured where it now is
mkdirSync('.tmp', { recursive: true });
await build({ entryPoints: ['src/world/layout.ts'], bundle: true, format: 'esm', outfile: '.tmp/layout.mjs', logLevel: 'error' });
const L = await import('../.tmp/layout.mjs');
const specs = L.REGION_SPECS.map((s) => ({
  id: s.id, x: (s.rect.minX + s.rect.maxX) / 2, z: (s.rect.minZ + s.rect.maxZ) / 2,
}));

const browser = await chromium.launch({
  executablePath: CHROMIUM,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});

const rows = [];
let fails = 0;
for (const rig of RIGS) {
  const ctx = await browser.newContext(rig);
  const page = await ctx.newPage();
  await page.addInitScript(() => { try { localStorage.clear(); } catch {} });
  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.title-veil:not(.gone)', { timeout: 300000 });
  await page.evaluate(() => window.__inklands.begin());
  await page.waitForTimeout(300);

  const rs = await page.evaluate(() => window.__inklands.renderScale?.() ?? 1);
  console.log(`\n${rig.name} ${rig.viewport.width}x${rig.viewport.height} @dpr${rig.deviceScaleFactor}  render scale ${rs}`);
  console.log('  land          hour   ms/frame  calls    tris  lettered');

  for (const s of specs) {
    if (ONLY && !ONLY.includes(s.id)) continue;
    for (const h of HOURS) {
      await page.evaluate(([x, z, hour]) => {
        const I = window.__inklands;
        I.setHour(hour);
        I.goto(x, z);
        I.quiet?.();
      }, [s.x, s.z, h]);
      // settle: two seconds on the harness clock (builds the lands in
      // reach, one per frame, and lets the cascade and cards finish)
      await page.evaluate(() => window.__inklands.step(1 / 30, 60));
      await page.evaluate(() => window.__inklands.quiet?.());
      const c = await page.evaluate(() => {
        const I = window.__inklands;
        const c = I.frameCost(30);
        const lettered = document.querySelectorAll('.lettered canvas').length;
        return { ...c, lettered };
      });
      const over = c.calls > BUDGET.calls || c.tris > BUDGET.tris;
      if (over) fails++;
      rows.push({ rig: rig.name, land: s.id, hour: h, ...c, over });
      console.log(
        `  ${s.id.padEnd(13)} ${String(h).padStart(4)}  ${c.ms.toFixed(1).padStart(8)}  ` +
        `${String(c.calls).padStart(5)}  ${String(Math.round(c.tris / 1000) + 'k').padStart(6)}  ` +
        `${String(c.lettered).padStart(8)}${over ? '   ✗ over budget' : ''}`
      );
    }
  }
  await ctx.close();
}
await browser.close();

const worst = [...rows].sort((a, b) => (b.calls / BUDGET.calls + b.tris / BUDGET.tris) - (a.calls / BUDGET.calls + a.tris / BUDGET.tris));
console.log(`\nbudget: ≤ ${BUDGET.calls} draw calls, ≤ ${BUDGET.tris / 1000}k triangles per frame`);
console.log('worst three: ' + worst.slice(0, 3).map((r) => `${r.land}@${r.hour} ${r.rig} (${r.calls} calls, ${Math.round(r.tris / 1000)}k)`).join('; '));
if (JSON_OUT) writeFileSync(JSON_OUT, JSON.stringify({ budget: BUDGET, rows }, null, 1));
if (fails) { console.log(`✗ ${fails} of ${rows.length} frames over budget`); process.exit(1); }
console.log(`✓ every frame inside the budget (${rows.length} measured)`);
