// THE LINE'S SIGHTLINE, ASSERTED.
//
//   node tools/check-sightline.mjs
//
// Session 13. `design/THE-LINE.md` §3.2 is an authoring brief with one
// hard constraint in it, written into the file in Session 7 because
// *later is too late*:
//
//   **Nothing tall may stand within about eight units of x = −45
//   anywhere between z = 120 and z = 278.**
//
// Act III is a two-hundred-unit look north up an empty straight road
// from the world's south rim, and it is the one composition in the game
// that cannot afford a tree beside the road. The shipped draft broke it
// twice: a 4.1-unit signpost at (−40, 196), five units off the axis,
// and thirty street trees on a scatter whose only bound was the road's
// own PAINT — five units wide, against a corridor that is sixteen.
//
// Neither of those is visible in a contact sheet of MAPLE COURT, and
// neither would have failed any check in this repository. So the rule
// gets an assertion, and the instrument was already in the engine: the
// SKYLINE (Session 9) is a four-unit grid of how tall the page is at a
// point, written by `ctx.standee` as every one-off prop in the world is
// built. Ask it along the axis and it answers in one frame.
//
// The road's own bridge over the river is the one thing allowed to
// stand in the corridor, because it is part of the road rather than
// something beside it, and it is named here rather than silently
// skipped.
import { chromium } from 'playwright';
import { CHROMIUM } from './pw.mjs';

const URL = process.env.URL ?? 'http://localhost:4173/?debug';
/** The axis, and the air it is owed either side. */
const X = -45;
const CLEAR = 8;
/** How much a thing may stand over the ground before it is "tall": the
 *  kerb, the road's paint, a survey peg and a dropped kerb are ground,
 *  and a hedge, a fence or a tree is not. */
const TALL = 1.6;
/** The king's road's own bridge (`layout.ts` BRIDGES), which is the one
 *  structure the corridor contains on purpose. */
const BRIDGE = { z: 170, r: 5 };

const browser = await chromium.launch({ executablePath: CHROMIUM });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
await page.addInitScript(() => localStorage.clear());
page.on('pageerror', (e) => console.log('EXCEPTION:', e.message));
await page.goto(URL, { waitUntil: 'networkidle' });
await page
  .waitForFunction(() => document.body.innerText.toLowerCase().includes('set out'), {
    timeout: 25000,
  })
  .catch(() => {});
await page.evaluate(() => window.__inklands.begin());
await page.waitForTimeout(600);

// walk the corridor so every land that can reach it is built: this
// counts what EXISTS, and a land that has never been streamed in has
// nothing in it
const found = await page.evaluate(
  async ({ X, CLEAR, TALL }) => {
    const I = window.__inklands;
    for (const z of [110, 150, 190, 230, 270]) {
      I.goto(X, z);
      I.step(1 / 60, 90);
      await new Promise((r) => setTimeout(r, 140));
    }

    /* Every prop in this game is a plane carrying a drawing: a STANDEE
     * stands up out of the page and a DECAL lies down along it, and the
     * geometry itself is what says which. So the test is exact and it
     * is the same test for both a one-off and an instanced field —
     * take the drawing's own bounding box, scale it, and ask whether
     * any part of it is inside the corridor and off the ground. A mark
     * ON the page (a kerb, a drive, the road's gravel, a survey peg)
     * has no height and is not in anybody's way. */
    const out = [];
    const box = (geo) => {
      if (!geo.boundingBox) geo.computeBoundingBox();
      const b = geo.boundingBox;
      return { w: b.max.x - b.min.x, h: b.max.y - b.min.y };
    };
    I.scene.traverse((o) => {
      if (!o.isMesh && !o.isInstancedMesh) return;
      const g = box(o.geometry);
      if (o.isInstancedMesh) {
        const a = o.instanceMatrix.array;
        for (let i = 0; i < o.count; i++) {
          const b = i * 16;
          const px = a[b + 12];
          const py = a[b + 13];
          const pz = a[b + 14];
          // the drawing's own reach ACROSS the page: a hedge turned
          // ninety degrees is a metre wide from here, not seventeen
          const halfX = (Math.abs(a[b]) * g.w) / 2;
          const top = Math.abs(a[b + 5]) * g.h;
          if (py < -500) continue;                       // a parked pose
          if (top < TALL) continue;
          if (pz < 118 || pz > 280) continue;
          if (Math.abs(px - X) - halfX > CLEAR) continue;
          out.push([+px.toFixed(1), +pz.toFixed(1), +top.toFixed(2), 'field']);
        }
        return;
      }
      const h = g.h * Math.abs(o.scale.y);
      if (h < TALL) return;
      const p = o.position;
      if (p.z < 118 || p.z > 280) return;
      const halfX = (Math.abs(Math.cos(o.rotation.y)) * g.w * Math.abs(o.scale.x)) / 2;
      if (Math.abs(p.x - X) - halfX > CLEAR) return;
      out.push([+p.x.toFixed(1), +p.z.toFixed(1), +h.toFixed(2), 'standee']);
    });
    return out;
  },
  { X, CLEAR, TALL }
);

let fails = 0;
console.log(`the corridor: x = ${X} ± ${CLEAR}, z = 120 .. 278`);
console.log('(a drawing is IN it if any part of the drawing is, not its origin)');
for (const [x, z, h, kind] of found) {
  if (Math.abs(z - BRIDGE.z) <= BRIDGE.r) {
    console.log(`  (${x}, ${z}) ${h} units — the king's road's own bridge, and it is the road ✓`);
    continue;
  }
  console.log(`  ✗ a ${kind} ${h} units tall at (${x}, ${z})`);
  fails++;
}
if (!fails) console.log('  nothing else stands in it anywhere ✓');

await browser.close();
console.log(fails ? `\n${fails} thing(s) in the line's sightline` : '\nthe sightline is clear.');
process.exit(fails ? 1 : 0);
