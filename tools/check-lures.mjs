// THE FOUR LURES, MEASURED — which of them each rig can hold.
//
//   npx vite preview --port 4173 &
//   node tools/check-lures.mjs
//
// `THE-FUN-PASS` §11 candidate 2: the castle on the ridge, smoke from
// the mill, the glint of the sea, the city's towers — all four in frame
// from the crossroads, so the signpost points at things you can already
// see. The camera is due north and the frame is 68.6° across on desktop
// and 26.5° in portrait, and the brief's own instruction was to MEASURE
// which lures portrait can hold and say so, because a lure that only
// works in landscape is not done.
//
// So this stands at the crossroads on both rigs, at rest and at a full
// peek each way, projects the centre of every lure through the shipping
// camera, and reports where it lands: on the page, or off it, and by
// how much. It is a measurement and not a verdict — whether a pencil
// plume at the edge of a phone's frame READS as a mill is the art gate's.
import { chromium } from 'playwright';
import { CHROMIUM } from './pw.mjs';

const URL = process.env.URL ?? 'http://localhost:4173/?debug';
const RIGS = [
  { name: 'desktop', width: 1280, height: 720 },
  { name: 'portrait', width: 390, height: 844 },
];
/** The lures, by the world position of the thing itself. */
const LURES = [
  ['the keep', -52, -52, 16],
  ['the sea', -92, -44, 17],
  ["the mill's smoke", 0, -44, 13],
  ["the city's towers", 28, -70, 10],
];
let fails = 0;
const browser = await chromium.launch({ executablePath: CHROMIUM });
for (const rig of RIGS) {
  const page = await browser.newPage({ viewport: { width: rig.width, height: rig.height } });
  await page.addInitScript(() => localStorage.clear());
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.bringToFront();
  await page.waitForFunction(() => document.body.innerText.toLowerCase().includes('set out'), { timeout: 25000 }).catch(() => {});
  const rows = await page.evaluate((lures) => {
    const I = window.__inklands;
    I.setHour(12, false);
    I.begin();
    I.setBearing(true);
    const out = [];
    for (const peek of [0, -1, 1]) {
      I.goto(-45, 58);
      I.setTime(0);
      I.peek(peek === 0 ? null : peek);
      I.step(1 / 60, 240);
      const cam = I.cam;
      cam.updateMatrixWorld();
      for (const [name, x, z, y] of lures) {
        const v = new I.scene.position.constructor(x, I.terrain.heightAt(x, z) + y, z);
        v.project(cam);
        out.push({ peek, name, nx: +v.x.toFixed(3), ny: +v.y.toFixed(3), inFrame: Math.abs(v.x) <= 1 && Math.abs(v.y) <= 1 });
      }
    }
    I.peek(null);
    return out;
  }, LURES);
  console.log(`\n${rig.name} (${rig.width}×${rig.height}), from the crossroads:`);
  for (const peek of [0, -1, 1]) {
    const label = peek === 0 ? 'at rest      ' : peek < 0 ? 'peek left    ' : 'peek right   ';
    const line = rows.filter((r) => r.peek === peek).map((r) =>
      `${r.name}: ${r.inFrame ? 'IN ' : 'OUT'} (x ${r.nx > 0 ? '+' : ''}${r.nx})`).join('   ');
    console.log(`  ${label}${line}`);
  }
  const rest = rows.filter((r) => r.peek === 0);
  const held = rest.filter((r) => r.inFrame).map((r) => r.name);
  const anyPeek = LURES.map(([n]) => n).filter((n) => rows.some((r) => r.name === n && r.inFrame));
  console.log(`  → holds at rest: ${held.join(', ') || 'nothing'}; with a peek: ${anyPeek.join(', ') || 'nothing'}`);
  if (rig.name === 'desktop' && held.length < 4) { console.log('  ✗ desktop must hold all four at rest'); fails++; }
  if (rig.name === 'portrait' && !held.includes('the keep')) { console.log('  ✗ portrait must hold the keep at rest'); fails++; }
  await page.close();
}
await browser.close();
console.log(fails ? `\n${fails} FAILURE(S)` : '\nthe lures are measured');
process.exit(fails ? 1 : 0);
