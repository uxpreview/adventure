// THE CONTACT SHEET, IN BOTH VIEWPORTS.
//
// Session 4 made mobile and desktop both first-class (QUALITY-BAR §3,
// WORLD-SYSTEMS §8): every framing is now shot at 1280×720 AND at
// 390×844, and the art director judges both. This is the shared driver
// so a shoot script only has to name its framings once.
//
// Output: OUT/desktop/NN-name.png and OUT/portrait/NN-name.png.
//
// The gotchas are all Session 2's and they all still bite:
//   · a backgrounded page is rAF-throttled and its loader tween never
//     finishes, so each viewport gets its own page, brought to front,
//     and the previous one is CLOSED before the next opens;
//   · begin() before the title is up burns the overlay into every frame,
//     so we wait for the title to actually letter itself on.
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

export const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 720 },
  { name: 'portrait', width: 390, height: 844 },
];

/**
 * @param {object} o
 * @param {string} o.out              output directory
 * @param {[string, number, number, number][]} o.framings  [file, x, z, settleMs]
 * @param {string} [o.url]
 * @param {boolean} [o.map]           also shoot the map screen
 * @param {(page, dir) => Promise<void>} [o.extra]  per-viewport extras
 */
export async function shoot({ out, framings, url, map = false, extra }) {
  const target = url ?? process.env.URL ?? 'http://localhost:4173/?debug';
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });

  for (const vp of VIEWPORTS) {
    const dir = `${out}/${vp.name}`;
    mkdirSync(dir, { recursive: true });
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    await page.addInitScript(() => localStorage.clear());
    page.on('console', (m) => {
      if (m.type() === 'error') console.log(`[${vp.name}] PAGE ERROR:`, m.text());
    });
    page.on('pageerror', (e) => console.log(`[${vp.name}] PAGE EXCEPTION:`, e.message));

    await page.goto(target, { waitUntil: 'networkidle' });
    await page.bringToFront();

    // mid-load: the loader must own the screen alone, no title bleed
    await page.waitForTimeout(1100);
    await page.screenshot({ path: `${dir}/00a-loader.png` });

    await page
      .waitForFunction(() => document.body.innerText.toLowerCase().includes('set out'), {
        timeout: 15000,
      })
      .catch(() => {});
    await page.waitForTimeout(900);
    await page.screenshot({ path: `${dir}/00b-title.png` });

    await page.evaluate(() => window.__inklands.begin());
    await page.waitForTimeout(1500);

    for (const [name, x, z, settle] of framings) {
      await page.evaluate(([tx, tz]) => window.__inklands.goto(tx, tz), [x, z]);
      await page.waitForTimeout(settle);
      // real strides so prints, fades, proximity motion and the camera's
      // rise damper all settle into what a player would actually see
      await page.keyboard.down('KeyW');
      await page.waitForTimeout(500);
      await page.keyboard.up('KeyW');
      await page.waitForTimeout(650);
      await page.screenshot({ path: `${dir}/${name}.png` });
    }

    if (map) {
      await page.keyboard.press('KeyM');
      await page.waitForTimeout(900);
      await page.screenshot({ path: `${dir}/99-map.png` });
      await page.keyboard.press('KeyM');
    }

    if (extra) await extra(page, dir);

    console.log(`  ${vp.name}: ${framings.length + 2 + (map ? 1 : 0)} frames → ${dir}`);
    await page.close();
  }

  await browser.close();
  console.log('done →', out);
}
