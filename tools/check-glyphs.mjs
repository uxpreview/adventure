// THE GLYPH SHEET — every character the pen knows, lettered by the real
// code and photographed, so a glyph that reads wrong is seen and not
// assumed.
//
//   node tools/check-glyphs.mjs [--out out/glyphs.png]
//
// Bundles src/ui/lettering.ts with esbuild (the same way check-terrain
// bundles the height field), letters a pangram, the figures and the
// punctuation the other pillars need, plus a line of characters the
// pen does NOT know (which must draw a pencil box and never throw), and
// writes one screenshot. Fails if a required character has no glyph or
// if lettering anything throws.
import { build } from 'esbuild';
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { CHROMIUM } from './pw.mjs';

const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : d; };
const OUT = arg('out', 'out/glyphs.png');

mkdirSync('.tmp', { recursive: true });
mkdirSync(dirname(OUT), { recursive: true });
await build({
  entryPoints: ['src/ui/lettering.ts'],
  bundle: true, format: 'iife', globalName: 'LET', outfile: '.tmp/lettering.iife.js', logLevel: 'error',
});
await build({
  entryPoints: ['src/engine/script.ts'],
  bundle: true, format: 'iife', globalName: 'SCRIPT', outfile: '.tmp/script.iife.js', logLevel: 'error',
});

const REQUIRED = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789' +
  '!?,.\'":;-–—…()/&+=%#*_@<>[]~°';

const LINES = [
  ['the quick brown fox jumps over the lazy dog', 14],
  ['THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG', 14],
  ['Sphinx of black quartz, judge my vow. Pack my box with five dozen jugs.', 12],
  ['0123456789  3 of 12  8:15  −4°  50%  £ ¼ ½ × $9', 14],
  ['! ? , . \' ’ " “ ” : ; - – — … ( ) / & + = % # * _ @ < > [ ] ~ `', 14],
  ['Nell: "That bull is mine. Get the gate shut and I\'ll owe you."', 12],
  ['DONE: the bull in the field — 3 of 12 found, best 1,250 pts (new!)', 11],
  ['café naïve résumé Zoë — ✓ ★ ∞ ☃ 漢字 emoji 🙂 fallback', 12],
];

const browser = await chromium.launch({ executablePath: CHROMIUM });
const page = await browser.newPage({ viewport: { width: 1100, height: 900 }, deviceScaleFactor: 2 });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
await page.setContent(`<body style="margin:0;background:#f5f2ea;padding:24px 28px;font:0/0 a"></body>`);
await page.addScriptTag({ path: '.tmp/lettering.iife.js' });
await page.addScriptTag({ path: '.tmp/script.iife.js' });

const report = await page.evaluate(([lines, required]) => {
  const out = { missing: [], threw: [], glyphs: window.SCRIPT.GLYPH_CHARS.length };
  for (const ch of required) if (!window.SCRIPT.hasGlyph(ch)) out.missing.push(ch);
  for (const [text, px] of lines) {
    try {
      const c = window.LET.letterCanvas(text, { px, alpha: 0.9 });
      c.style.marginBottom = '6px';
      document.body.appendChild(c);
    } catch (e) { out.threw.push(`${text}: ${e.message}`); }
  }
  // the whole table, packed
  const c = window.LET.letterCanvas(window.SCRIPT.GLYPH_CHARS, { px: 13, alpha: 0.9, maxWidth: 1000 });
  document.body.appendChild(c);
  return out;
}, [LINES, REQUIRED]);

await page.screenshot({ path: OUT, fullPage: true });
await browser.close();

console.log(`glyph sheet → ${OUT}  (${report.glyphs} skeletons)`);
let fails = 0;
if (report.missing.length) { console.log(`  ✗ no glyph for: ${report.missing.join(' ')}`); fails++; }
if (report.threw.length) { console.log(`  ✗ lettering threw: ${report.threw.join(' | ')}`); fails++; }
if (errors.length) { console.log(`  ✗ page errors: ${errors.join(' | ')}`); fails++; }
if (!fails) console.log('  ✓ every required character has a glyph; unknown ones draw a pencil box; nothing threw');
process.exit(fails ? 1 : 0);
