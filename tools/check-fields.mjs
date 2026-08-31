// EVERY INSTANCE IN THE LAND YOU ARE STANDING IN IS INKED IN.
//
//   npx vite preview --port 4173 &
//   node tools/check-fields.mjs
//
// ---- WHY THIS EXISTS ------------------------------------------------
//
// The owner reported that the animals disappeared when you walked up to
// them, everywhere except Brim. They were right, it had been true since
// Session 5, and no contact sheet in this project could ever have shown
// it — because a contact sheet photographs a walker standing still, and
// the bug only fired when a creature CHANGED POSTURE.
//
// The mechanism, for anyone who meets its cousin later: every creature
// with more than one pose is drawn as one instanced field per pose with
// a single instance showing at a time, and the way the world used to
// hide the other poses was `set(i, x, -4000, 0.001)`. But `set` records
// the position, `positions` is the field's answer to "where is instance
// i", and `cascadeFrom` reads it to decide when the ink wave reaches
// that instance. Four thousand units at thirty-four a second is a birth
// NINETY-SEVEN SECONDS in the future, and until its birth the shader
// draws an instance at `uGhost` — sixteen per cent — which against
// paper is nothing at all. Brim's pigeons and Greyweather's rooks were
// immune only because they are one-off `ctx.standee` meshes with no
// birth attribute to get wrong.
//
// So the assertion is the general one, not the specific one:
//
//   **In the land the walker is standing in, after the ink wave has had
//   time to cross it, no instance of any field may still be ghosted or
//   unborn — including the instances that are hidden right now.**
//
// It drives the walker AT each land's animals first, because a posture
// that is never taken is a posture whose birth is never checked.
import { chromium } from 'playwright';
import { CHROMIUM } from './pw.mjs';

const URL = process.env.URL ?? 'http://localhost:4173/?debug';

/** [land, x, z, walk-x, walk-z, game-seconds] — each one stands where
 *  the land's life is and then walks INTO it. */
const CASES = [
  ['THE COMMON', -45, 66, 0, -1, 6],
  ['THE KINGDOM OF BRIM', -45, -74, 0, -1, 6],
  ['CASTLE GREYWEATHER', -45, -214, 0, -1, 6],
  ['LONGSHORE', -228, 30, 0, -1, 8],
  ['THE WIDE BLUE', -258, 84, -1, 0, 8],
  ['THE HARROW DOWNS', 101, 116, 0, -1, 8],
  ['THE PENWOOD', 132, -206, 0, -1, 8],
  /* SESSION 11. Both new lands carry a field that MOVES every frame —
   * the grit drifting up the channel, and the Bleach Flats' tumbleweeds,
   * which cross a hundred and forty units and wrap round to the far side
   * of the land when they get there. A field whose instances are re-set
   * from an update loop is exactly the shape of the bug this file was
   * written for, so both of them are walked at. */
  ['SPLITROCK CANYON', 300, -212, 0, -1, 8],
  ['THE BLEACH FLATS', 303, 92, 0, -1, 8],
];

const browser = await chromium.launch({ executablePath: CHROMIUM });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
page.on('pageerror', (e) => console.log('PAGE EXCEPTION:', e.message));
await page.goto(URL, { waitUntil: 'networkidle' });
await page
  .waitForFunction(() => document.body.innerText.toLowerCase().includes('set out'), { timeout: 25000 })
  .catch(() => {});
await page.evaluate(() => window.__inklands.begin());
await page.waitForTimeout(1200);

let fails = 0;
console.log('fields — every instance in the land underfoot is inked in:');

for (const [name, x, z, mx, mz, secs] of CASES) {
  const r = await page.evaluate(
    ([x, z, mx, mz, secs]) => {
      const I = window.__inklands;
      I.setBearing(false);
      I.setHour(12, false);
      I.goto(x, z);
      I.setTime(0);
      // thirteen game seconds: long enough for the wave to cross a land
      I.step(1 / 60, 780);
      I.quiet();
      // and then walk at whatever lives here, so every posture is taken
      if (mx || mz) {
        I.drive(mx, mz, 0);
        I.step(1 / 60, Math.round(secs * 60));
        I.release();
      }
      I.step(1 / 60, 120);
      // only the region the walker is actually standing in: a land you
      // have never entered is SUPPOSED to be unborn
      /* THE TEST, AND IT IS A SHAPE RATHER THAN A DISTANCE.
       *
       * `cascadeFrom` runs over a WHOLE FIELD at once, the first time
       * the walker stands in that field's land. So a field is either
       * wholly cascaded or wholly untouched, and after thirteen game
       * seconds — four hundred and forty units of wave, more than any
       * land's diagonal — a cascaded field has every instance born.
       *
       * **A field with some instances born and some not is therefore
       * the bug itself**, whatever land it is in and wherever the
       * walker is standing. A field with none born is a land nobody has
       * walked into yet, which is the system working. */
      const here = I.region();
      let faulty = 0;
      let stranded = 0;
      let worst = 0;
      let total = 0;
      let fields = 0;
      I.scene.traverse((o) => {
        if (!o.isInstancedMesh) return;
        const u = o.material && o.material.uniforms;
        if (!u || u.uGhost === undefined) return;
        const b = o.geometry.getAttribute('aBirth');
        if (!b) return;
        fields++;
        const t = u.uTime.value;
        let born = 0;
        let late = 0;
        let lateWorst = 0;
        for (let i = 0; i < b.count; i++) {
          total++;
          const v = b.getX(i);
          if (v <= t) born++;
          else {
            late++;
            if (v < 1e8) lateWorst = Math.max(lateWorst, v - t);
          }
        }
        if (born > 0 && late > 0) {
          faulty++;
          stranded += late;
          worst = Math.max(worst, lateWorst);
        }
      });
      return { here, fields, total, faulty, stranded, worst: +worst.toFixed(1) };
    },
    [x, z, mx, mz, secs]
  );
  const tag = r.faulty
    ? `✗ ${r.faulty} half-inked field(s), ${r.stranded} instance(s) stranded (longest wait ${r.worst}s)`
    : '✓';
  console.log(
    `  ${name.padEnd(22)} ${String(r.fields).padStart(3)} fields, ${String(r.total).padStart(4)} instances  ${tag}`
  );
  if (r.faulty) fails++;
}

await browser.close();
console.log(
  fails
    ? `\n✗ ${fails} land(s) have a field that is half inked in. See the header of this file.`
    : '\nall field checks pass'
);
process.exit(fails ? 1 : 0);
