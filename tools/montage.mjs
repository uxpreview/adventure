// A CONTACT SHEET YOU CAN ACTUALLY LOOK AT.
//
//   node tools/montage.mjs shots-s10/desktop out.png a.png b.png ...
//
// Session 10. The gate reviews sixty frames a round and reads them one
// at a time; a land is a whole, and a fault that is invisible in one
// frame (every hedge the same height; three brown things in a row) is
// obvious across ten. No new dependency: PNGs in, one PNG out, through
// the same headless Chromium the shoot scripts already need.
import { chromium } from 'playwright';
import { readFileSync } from 'fs';
import { basename } from 'path';

const [dir, out, ...names] = process.argv.slice(2);
const cols = Number(process.env.COLS ?? 2);
const cw = Number(process.env.CW ?? 660);

const imgs = names.map((n) => ({
  name: basename(n),
  data: readFileSync(`${dir}/${n}`).toString('base64'),
}));

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage({ viewport: { width: cols * cw + 24, height: 800 } });
await page.setContent(`<body style="margin:0;background:#e7e3d8;padding:8px;
  display:grid;grid-template-columns:repeat(${cols},${cw}px);gap:8px;
  font:11px ui-monospace,monospace;color:#232633">
  ${imgs.map((i) => `<div><img src="data:image/png;base64,${i.data}" style="width:${cw}px;display:block">
    <div style="padding:2px 0">${i.name}</div></div>`).join('')}
</body>`);
await page.waitForTimeout(400);
await page.screenshot({ path: out, fullPage: true });
await browser.close();
console.log('→', out);
