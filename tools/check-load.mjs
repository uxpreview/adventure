// TIME TO TITLE — how long the page takes from navigation to the title
// card, and where it goes.
//
//   node tools/check-load.mjs [--url http://localhost:4173/] [--runs 3] [--rig desktop|portrait]
//
// Loads the built page cold in Playwright (cache off, localStorage
// cleared), waits for the title, and reads the performance marks the
// app leaves on the way (`__inklands.loadMarks()`): `boot` (the module
// script starts), `app` (the App constructor has returned: terrain,
// world, character, mounts, traffic), `first-frame` (the first tick),
// `title` (the title card is up), plus the resource timing for the
// script and the fetch → response for the document.
//
// The sandbox has no GPU: the numbers here are a software rasteriser's
// and a slow CPU's, so what matters is the SHAPE — which span dominates
// — and the before/after of a change, not the absolute value.
import { chromium } from 'playwright';
import { CHROMIUM } from './pw.mjs';

const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : d; };
let URL = arg('url', process.env.URL ?? 'http://localhost:4173/');
if (!URL.includes('debug')) URL += (URL.includes('?') ? '&' : '?') + 'debug';
const RUNS = Number(arg('runs', 3));
const RIG = arg('rig', 'desktop') === 'portrait'
  ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true }
  : { viewport: { width: 1280, height: 720 }, deviceScaleFactor: 2 };

const browser = await chromium.launch({
  executablePath: CHROMIUM,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
const rows = [];
for (let i = 0; i < RUNS; i++) {
  const ctx = await browser.newContext(RIG);
  const page = await ctx.newPage();
  await page.addInitScript(() => { try { localStorage.clear(); } catch {} });
  const bad = [];
  page.on('console', (m) => { if (m.type() === 'error') bad.push(m.text()); });
  page.on('response', (r) => { if (r.status() >= 400) bad.push(`${r.status()} ${r.url()}`); });
  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.title-veil:not(.gone)', { timeout: 300000 });
  const r = await page.evaluate(() => {
    const m = window.__inklands.loadMarks();
    const nav = performance.getEntriesByType('navigation')[0];
    const scripts = performance.getEntriesByType('resource').filter((e) => e.initiatorType === 'script' || /\.js(\?|$)/.test(e.name));
    const scriptMs = scripts.length ? Math.round(Math.max(...scripts.map((e) => e.responseEnd)) - Math.min(...scripts.map((e) => e.startTime))) : 0;
    return { doc: Math.round(nav?.responseEnd ?? 0), scriptFetch: scriptMs, ...m };
  });
  rows.push(r);
  console.log(`run ${i + 1}: document ${r.doc} ms · scripts fetched by ${r.scriptFetch} · boot ${r.boot} · app ${r.app} (+${r.app - r.boot} building) · first frame ${r['first-frame']} (+${r['first-frame'] - r.app}) · title ${r.title} (+${r.title - r['first-frame']})`
    + (bad.length ? `\n   ✗ ${bad.join(' | ')}` : ''));
  await ctx.close();
}
await browser.close();
const med = (k) => { const v = rows.map((r) => r[k]).sort((a, b) => a - b); return v[v.length >> 1]; };
console.log(`\nmedian of ${RUNS}: title at ${med('title')} ms — script parse+eval ${med('boot') - med('scriptFetch')} · build ${med('app') - med('boot')} · first frame ${med('first-frame') - med('app')} · loader→title ${med('title') - med('first-frame')}`);
