// THE PROP BOX, ON ONE SHEET.
//
//   node tools/shoot-textures.mjs
//
// Session 10. Every drawing in this game is a canvas, and until now the
// only way to look at one was to find it in the world, at whatever size
// and distance the world happened to put it at — which is how a pine
// whose branches joined into croquet hoops survived until the first
// contact sheet, and how it then took three world re-shoots to work out
// which of four drawings was doing it.
//
// So: import the texture modules in the page, draw every canvas at
// actual size on a paper ground, and screenshot the lot. It costs about
// four seconds and it answers "is this drawing any good" without a
// camera, a walker or a land in the way.
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const OUT = process.env.OUT ?? 'shots-textures';
const URL = process.env.URL ?? 'http://localhost:4173/?debug';
mkdirSync(OUT, { recursive: true });

const SHEETS = {
  wood: [
    ['penwoodPineTexture', [2100, 0]], ['penwoodPineTexture', [2101, 0]],
    ['penwoodPineTexture', [2120, 1]], ['penwoodPineTexture', [2121, 1]],
    ['penwoodPineTexture', [2140, 2]], ['penwoodPineTexture', [2141, 2]],
    ['pineCropTexture', [3100]], ['youngPineTexture', [2500]],
    ['fallenPineTexture', [2700]], ['birchTexture', [2820]],
    ['brackTexture', [3300, false]], ['brackTexture', [3301, true]],
    ['hallowsTexture', [3202]], ['oarLeanTexture', [3200]],
    ['choppingBlockTexture', [3201]], ['stumpTexture', [2800]],
    ['tarnBoatTexture', [2920]], ['goatTexture', [3400, 0]],
    ['goatTexture', [3402, 2]], ['tarnSkinDecal', [2900]],
    ['needleFloorDecal', [2600]], ['wornRoundDecal', [3000]],
    ['bracketFungusTexture', [2710]],
  ],
  dry: [
    ['splitFinTexture', [7100, 0]], ['splitFinTexture', [7101, 1]],
    ['splitFinTexture', [7102, 1]], ['splitFinTexture', [7103, 2]],
    ['fallenSlabTexture', [7200, 0]], ['fallenSlabTexture', [7201, 1]],
    ['wallPanelTexture', [7300, 1]], ['wallPanelTexture', [7301, 2]],
    ['markWallTexture', [7400]], ['needleArchTexture', [7500]],
    ['boatTexture', [7600, true]], ['boatTexture', [7601, false]],
    ['trestleTexture', [7602]],
    ['holtTexture', [7700, true]], ['holtTexture', [7701, false]],
    ['holtPlaceTexture', [7800]],
    ['bedGravelDecal', [7900, 0]], ['bedGravelDecal', [7901, 1]],
    ['bedGravelDecal', [7902, 2]],
    ['driftwoodTexture', [7950]], ['kiteTexture', [7960]],
    ['panCrustDecal', [8000]], ['strandLineDecal', [8100]],
    ['flatsGritDecal', [8200]], ['wornTrackDecal', [8300]],
    ['saguaroTexture', [8400, 2]], ['saguaroTexture', [8401, 1]],
    ['deadScrubTexture', [8500]], ['deadScrubTexture', [8501]],
    ['palmTexture', [8600, 0.2]], ['palmTexture', [8601, -0.35]],
    ['reedRunTexture', [8700]],
    ['cisternTexture', [8800, false]], ['cisternTexture', [8801, true]],
    ['catchFrameTexture', [8900]],
    ['amosTexture', [9000, true]], ['amosTexture', [9001, false]],
    ['tumbleweedTexture', [9100]], ['skullTexture', [9200]],
    ['bootTexture', [9300]], ['milepostTexture', [9400]],
  ],
  farm: [
    ['millTexture', [5600]], ['millSailsTexture', [5601]],
    ['granaryTexture', [5602]], ['picnicTexture', [5701, true]],
    ['picnicTexture', [5702, false]], ['thornTexture', [5700]],
    ['joanTexture', [5710, 0]], ['joanTexture', [5711, 1]],
    ['fieldHandTexture', [5720, 0]], ['fieldHandTexture', [5722, 2]],
    ['sheepTexture', [5900, 0]], ['sheepTexture', [5903, 3]],
    ['downsHedgeTexture', [5000, false]], ['downsHedgeTexture', [5001, true]],
    ['hedgeStandardTexture', [5300, 0]], ['stookTexture', [4000]],
    ['standingCornTexture', [4001]], ['stoneTroughTexture', [5920]],
    ['fieldGateTexture', [5603, false]], ['fieldGateTexture', [5803, true]],
    ['shedAxleTexture', [5802]], ['downsScarecrowTexture', [5930]],
    ['stubbleDecal', [4010]], ['ploughDecal', [4011]], ['fallowDecal', [4012]],
    ['fordStonesDecal', [5800]],
  ],
};

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage({ viewport: { width: 1500, height: 1000 } });
page.on('pageerror', (e) => console.log('PAGE EXCEPTION:', e.message));
await page.goto(URL, { waitUntil: 'networkidle' });
await page.waitForTimeout(800);

for (const [name, list] of Object.entries(SHEETS)) {
  const h = await page.evaluate(async ({ list, mod }) => {
    const M = await import(mod);
    document.body.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.style.cssText =
      'position:fixed;inset:0;z-index:99999;background:#f5f2ea;padding:14px;' +
      'display:flex;flex-wrap:wrap;align-items:flex-end;gap:16px;overflow:hidden;' +
      'font:11px/1.2 ui-monospace,monospace;color:#232633';
    for (const [fn, args] of list) {
      const tex = M[fn](...args);
      const cell = document.createElement('div');
      cell.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:3px';
      const c = tex.image;
      c.style.cssText = 'outline:1px solid rgba(35,38,51,.18)';
      cell.appendChild(c);
      const cap = document.createElement('div');
      cap.textContent = `${fn}(${args.join(',')})`;
      cell.appendChild(cap);
      wrap.appendChild(cell);
    }
    document.body.appendChild(wrap);
    await new Promise((r) => requestAnimationFrame(r));
    return wrap.scrollHeight;
  }, { list, mod: `/src/world/textures-${name}.ts` });
  await page.setViewportSize({ width: 1500, height: Math.min(4000, Math.max(600, h + 30)) });
  await page.waitForTimeout(200);
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });
  console.log(`  ${name} → ${OUT}/${name}.png`);
}
await browser.close();
