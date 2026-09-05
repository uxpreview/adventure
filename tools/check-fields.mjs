// EVERY INSTANCE IN THE LAND YOU ARE STANDING IN IS INKED IN — AND,
// FROM SESSION 17, EVERY ROUTINE THAT CHANGES DRAWING CHANGES IT.
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
  /* SESSION 15: the flock is on the clock. At noon it is in the west
   * slope, north of the drove's mouth, and the lane holds only the two
   * that never move; so the walk starts at the mouth and goes north
   * into the field, which is where the animals are at the hour this
   * file pins. */
  ['THE HARROW DOWNS', 101, 82, 0, -1, 8],
  ['THE PENWOOD', 132, -206, 0, -1, 8],
  /* SESSION 11. Both new lands carry a field that MOVES every frame —
   * the grit drifting up the channel, and the Bleach Flats' tumbleweeds,
   * which cross a hundred and forty units and wrap round to the far side
   * of the land when they get there. A field whose instances are re-set
   * from an update loop is exactly the shape of the bug this file was
   * written for, so both of them are walked at. */
  ['SPLITROCK CANYON', 300, -212, 0, -1, 8],
  ['THE BLEACH FLATS', 303, 92, 0, -1, 8],
  /* SESSION 13. MAPLE COURT's fields are still — trees, grass, fences,
   * three people standing about — but GREYLINE CITY's commuters are
   * three fields of postures, and the whole land is a street the walker
   * walks INTO. The city is also the first land whose wait changes a
   * one-off standee's visibility from an update loop while a field is
   * ticking beside it, which is near enough to Session 9's bug to be
   * worth walking at. */
  ['MAPLE COURT', -78, 152, 0, -1, 8],
  ['GREYLINE CITY', 142, 216, 0, -1, 8],
];

const browser = await chromium.launch({ executablePath: CHROMIUM });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
page.on('pageerror', (e) => console.log('PAGE EXCEPTION:', e.message));
await page.goto(URL, { waitUntil: 'networkidle' });
await page
  .waitForSelector('.title-veil:not(.gone)', { timeout: 25000 })
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

/* ================================================================== *
 * AND EVERY ROUTINE THAT CHANGES DRAWING (Session 17).
 *
 * The owner found the last bug of this class by walking up to an
 * animal, and no contact sheet could have: a contact sheet photographs
 * a walker standing still at one hour. Session 17 put a routine in every
 * land — a figure somewhere at a given hour, in a posture, and indoors
 * otherwise — and every one of them is a drawing that changes with the
 * clock. So this drives the clock through every hour a routine changes
 * at and asserts, for each: when the routine says it is out, it is
 * DRAWN, with a real drawing, where the routine says; when it says it is
 * in, it is not drawn; and when it is walking, it is in a walking
 * posture. Read from the running page, not from the source.
 * ================================================================== */
console.log('\nroutines — every figure is drawn when it is out and not when it is in:');
const routineList = await page.evaluate(() =>
  window.__inklands.life.routines.map((r) => ({
    id: r.id, land: r.land, walkPose: r.walkPose,
    stops: r.stops.map((s) => [s.at, s.x, s.z, s.hold ?? 0]),
  }))
);
let routineFails = 0;
let checked = 0;
let skipped = 0;
for (const rt of routineList) {
  const st = rt.stops;
  const end = st[st.length - 1][0] + st[st.length - 1][3];
  const hours = [st[0][0] - 0.05, end + 0.05];
  for (let i = 0; i < st.length; i++) {
    hours.push(st[i][0] + 0.005);
    if (i < st.length - 1) hours.push(st[i][0] + (st[i + 1][0] - st[i][0]) * 0.6);
  }
  const res = await page.evaluate(
    ({ rt, hours }) => {
      const I = window.__inklands;
      I.setBearing(false);
      I.setWeather('clear');          // rain sends the folk in, and that is not what is asserted here
      I.goto(rt.stops[0][1], rt.stops[0][2]);
      I.step(1 / 60, 40);             // the land is built and everything near it
      const def = I.life.routines.find((r) => r.id === rt.id);
      const out = [];
      for (const h of hours) {
        I.setHour(((h % 24) + 24) % 24, false);
        I.events.resync();
        I.step(1 / 60, 12);
        const d = I.life.drawn().find((x) => x.id === rt.id && x.kind === 'figure');
        const e = I.life.routineAt(def, ((h % 24) + 24) % 24);
        out.push({
          h: +h.toFixed(3), figure: !!d, present: e.present, moving: e.moving,
          visible: d?.visible ?? null, map: d?.map ?? null, pose: d?.pose ?? null,
          off: d ? Math.hypot(d.x - e.x, d.z - e.z) : null,
        });
      }
      I.setWeather(null);
      return out;
    },
    { rt, hours }
  );
  if (!res[0].figure) { skipped++; continue; }
  const bad = [];
  for (const r of res) {
    if (r.present && !(r.visible && r.map && r.off < 0.6)) bad.push(`${r.h}: out but not drawn where it should be (visible ${r.visible}, map ${r.map}, off ${r.off?.toFixed(2)})`);
    if (!r.present && r.visible) bad.push(`${r.h}: in, but drawn`);
    if (r.present && r.moving && !(r.pose === 1 || r.pose === 5 || r.pose === rt.walkPose)) bad.push(`${r.h}: walking in posture ${r.pose}`);
  }
  checked++;
  if (bad.length) {
    routineFails++;
    console.log(`  ✗ ${rt.id.padEnd(28)} ${bad.slice(0, 3).join('; ')}${bad.length > 3 ? ` (+${bad.length - 3})` : ''}`);
  }
}
console.log(`  ${checked} figure(s) driven through ${routineList.length ? 'their hours' : 'nothing'}; ${skipped} routine(s) drawn by a land's own hand (skipped); ${routineFails ? `${routineFails} FAILED` : 'all drawn right'}`);
fails += routineFails;

await browser.close();
console.log(
  fails
    ? `\n✗ ${fails} check(s) failed: a field half inked in, or a routine not drawn. See the header of this file.`
    : '\nall field checks pass'
);
process.exit(fails ? 1 : 0);
