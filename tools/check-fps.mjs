// THE FRAME BUDGET, per land, per hour, per rig.
//
//   node tools/check-fps.mjs [--url http://localhost:4173/] [--json out.json] [--lands meadow,city] [--frames 30]
//   node tools/check-fps.mjs --play 4383 --rig desktop     # through a running play-server
//
// `--play` drives a page a play-server (tools/play-server.mjs) already has
// open, so a rig costs one load of the game instead of one per run, and
// the numbers come from the same browser the cold player uses.
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
const PLAY = arg('play', null);
const PLAY_RIG = arg('rig', 'desktop');
const FRAMES = Number(arg('frames', 30)); // fewer frames = a faster run; ms get noisier, the gate does not

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

const rows = [];
let fails = 0;

/** One rig's table, given an `evalJs(string) → value` on a loaded page. */
async function measureRig(rig, evalJs) {
  await evalJs('window.__inklands.begin(), 1');
  const rs = await evalJs('window.__inklands.renderScale?.() ?? 1');
  console.log(`\n${rig.name} ${rig.viewport.width}x${rig.viewport.height} @dpr${rig.deviceScaleFactor}  render scale ${rs}`);
  console.log('  land          hour   ms/frame  calls    tris  lettered');

  for (const s of specs) {
    if (ONLY && !ONLY.includes(s.id)) continue;
    for (const h of HOURS) {
      await evalJs(`(() => { const I = window.__inklands; I.setHour(${h}); I.goto(${s.x}, ${s.z}); I.quiet?.(); return 1; })()`);
      // settle: two seconds on the harness clock (builds the lands in
      // reach, one per frame, and lets the cascade and cards finish)
      await evalJs('window.__inklands.step(1 / 30, 60), 1');
      const c = await evalJs(`(() => { const I = window.__inklands; I.quiet?.(); const c = I.frameCost(${FRAMES});
        return { ...c, lettered: document.querySelectorAll('.lettered canvas').length }; })()`);
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
}

if (PLAY) {
  const rig = RIGS.find((r) => r.name === PLAY_RIG) ?? RIGS[0];
  const evalJs = async (js) => {
    const r = await fetch(`http://127.0.0.1:${PLAY}/`, { method: 'POST', body: JSON.stringify(['eval', js]) });
    const j = await r.json();
    if (j && j.error) throw new Error(j.error);
    return j;
  };
  await measureRig(rig, evalJs);
} else {
  const browser = await chromium.launch({
    executablePath: CHROMIUM,
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
  });
  for (const rig of RIGS) {
    const ctx = await browser.newContext(rig);
    const page = await ctx.newPage();
    await page.addInitScript(() => { try { localStorage.clear(); } catch {} });
    await page.goto(URL, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.title-veil:not(.gone)', { timeout: 300000 });
    await measureRig(rig, (js) => page.evaluate(js));
    await ctx.close();
  }
  await browser.close();
}

const worst = [...rows].sort((a, b) => (b.calls / BUDGET.calls + b.tris / BUDGET.tris) - (a.calls / BUDGET.calls + a.tris / BUDGET.tris));
console.log(`\nbudget: ≤ ${BUDGET.calls} draw calls, ≤ ${BUDGET.tris / 1000}k triangles per frame`);
console.log('worst three: ' + worst.slice(0, 3).map((r) => `${r.land}@${r.hour} ${r.rig} (${r.calls} calls, ${Math.round(r.tris / 1000)}k)`).join('; '));
if (JSON_OUT) writeFileSync(JSON_OUT, JSON.stringify({ budget: BUDGET, rows }, null, 1));
if (fails) { console.log(`✗ ${fails} of ${rows.length} frames over budget`); process.exit(1); }
console.log(`✓ every frame inside the budget (${rows.length} measured)`);
