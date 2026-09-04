// NOTHING EMPTY FOR FIFTEEN SECONDS — the fifteen-second rule, measured
// (Session 18; `THE-FUN-PASS.md` §3 item 7 and §8 item 2).
//
//   npx vite preview --port 4173 &
//   node tools/check-roads.mjs                 # every road, both rigs, from noon
//   HOUR=19 node tools/check-roads.mjs         # setting out at dusk
//   ROAD=east-road RIG=portrait node tools/check-roads.mjs
//   STEP=1 node tools/check-roads.mjs          # a sample every game second
//
// ---- WHAT IT ASSERTS ------------------------------------------------
//
// *On any road across the land, at a walk, something is in frame or in
// earshot at every point.* The owner's word for the walks was CHORE, and
// the bar has said since Session 15 that the walks earn their length
// with midpoints or they shrink; it has never once been enforced,
// because nothing could ask the world what a walker on a road sees.
//
// So this walks EVERY ROAD in `layout.ROADS`, in the direction it was
// authored, at 4.1 units a second — the walk, not the run — with the
// clock running from the hour it set out at, and every STEP seconds it
// stands the walker there through the shipping camera on each rig and
// asks two questions:
//
//   IN FRAME     is anything standing inside the camera's frustum, close
//                enough to read? The skyline grid (every one-off standee
//                in the world records its top as it is built), the life
//                registry (every figure and creature that is drawn), the
//                things the walker can move, the bridges, and water
//                within a few units of the road — a bend in a river is a
//                thing to look at. NOT instanced fields: grass, trees and
//                a crowd drawn as a field are the land's texture, and a
//                road with nothing on it but trees is exactly the road
//                the owner meant.
//   IN EARSHOT   is a PLACED voice in reach and keeping its hours
//                (`src/world/earshot.ts` — the well, the bell, the surf
//                as you come down to it, the mill, the palms), a silence
//                that is itself a place (Brack's twenty units), or a
//                scheduled event with a place, in progress? Not the
//                land-wide filler: a lark every twelve seconds is the bed
//                with a voice, and a rule it satisfied could not fail.
//
// A run of samples with neither, fifteen seconds of walking or longer,
// is a SILENCE, and it fails. The output is every silence on every road
// on both rigs, longest first, with where it starts and ends and what
// the nearest thing was — which is the list the session builds
// midpoints against and the list the play sheet hands the owner.
//
// ---- THE GOTCHAS, ALL INHERITED ------------------------------------
//
//   · a land is built when the walker comes within reach of its rect,
//     one land a frame, so each sample steps a handful of frames before
//     it asks; the first sample on a road steps more;
//   · the bearing is PINNED (the shipping camera); walking does not turn
//     the frame anyway (Session 12), so the pinned rig is the rig;
//   · the figures go in out of the rain, so the weather is pinned clear;
//     a road that is only alive in the dry is a question for the sheet;
//   · portrait is a separate page — a viewport is a rig, and both are
//     judged (QUALITY-BAR §3).
import { chromium } from 'playwright';
import { CHROMIUM } from './pw.mjs';

const URL = process.env.URL ?? 'http://localhost:4173/?debug';
const WALK = 4.1;
const STEP = Number(process.env.STEP ?? 2);           // game seconds between samples
const LIMIT = Number(process.env.LIMIT ?? 15);         // seconds of nothing that fail
const HOUR0 = Number(process.env.HOUR ?? 12);
const REACH = Number(process.env.REACH ?? 78);         // how far a thing in frame can be
const ONLY_ROAD = process.env.ROAD ?? null;
const RIG = process.env.RIG ?? 'both';

const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 720 },
  { name: 'portrait', width: 390, height: 844 },
].filter((v) => RIG === 'both' || v.name === RIG);

/** The roads, named for the report, in `layout.ROADS` order. */
const NAMES = [
  'kings-road', 'coast-road', 'east-road', 'mill-lane', 'main-street', 'commuter-spur',
  'forest-track', 'bracks-round', 'maple-court', 'market-lane', 'canyon-trail',
];

const browser = await chromium.launch({ executablePath: CHROMIUM });
const report = [];
let fails = 0;

for (const vp of VIEWPORTS) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
  await page.addInitScript(() => localStorage.clear());
  page.on('pageerror', (e) => console.log('  PAGE EXCEPTION:', e.message));
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.bringToFront();
  await page
    .waitForFunction(() => document.body.innerText.toLowerCase().includes('set out'), { timeout: 25000 })
    .catch(() => {});
  await page.evaluate((h) => {
    const I = window.__inklands;
    I.setHour(h, false);
    I.begin();
    I.setBearing(false);
    I.setWeather('clear');
    I.quiet();
  }, HOUR0);
  await page.waitForTimeout(600);

  const roads = await page.evaluate(() => window.__inklands.layout.ROADS.map((r) => ({ pts: r.pts, width: r.width })));

  for (let ri = 0; ri < roads.length; ri++) {
    const name = NAMES[ri] ?? `road-${ri}`;
    if (ONLY_ROAD && name !== ONLY_ROAD) continue;
    const road = roads[ri];
    // arc length, so the samples are evenly spaced in TIME
    const arc = [0];
    for (let i = 1; i < road.pts.length; i++) {
      arc.push(arc[i - 1] + Math.hypot(road.pts[i][0] - road.pts[i - 1][0], road.pts[i][1] - road.pts[i - 1][1]));
    }
    const length = arc[arc.length - 1];
    const samples = [];
    const dS = WALK * STEP;
    for (let s = 0; s <= length + 1e-6; s += dS) {
      const sc = Math.min(s, length);
      let i = 1;
      while (i < arc.length - 1 && arc[i] < sc) i++;
      const u = (sc - arc[i - 1]) / ((arc[i] - arc[i - 1]) || 1);
      const x = road.pts[i - 1][0] + (road.pts[i][0] - road.pts[i - 1][0]) * u;
      const z = road.pts[i - 1][1] + (road.pts[i][1] - road.pts[i - 1][1]) * u;
      const hour = (HOUR0 + sc / WALK / 100) % 24;
      const r = await page.evaluate(
        ([x, z, hour, first, REACH, elapsed]) => {
          const I = window.__inklands;
          I.goto(x, z);
          I.setHour(hour, false);
          I.events.resync();
          I.setTime(elapsed);
          I.step(1 / 60, first ? 40 : 8);
          const cam = I.cam;
          const ground = (px, pz) => I.terrain.heightAt(px, pz);
          const V = cam.position.constructor;
          const inFrame = (px, py, pz) => {
            const v = new V(px, py, pz).project(cam);
            return v.z < 1 && v.z > -1 && Math.abs(v.x) <= 1 && Math.abs(v.y) <= 1;
          };
          const near = (px, pz) => Math.hypot(px - x, pz - z);
          const frame = [];
          // the skyline: anything standing that is taller than the grass
          for (const c of I.world.skylineWithin(x, z, REACH)) {
            const d = near(c.x, c.z);
            if (d > REACH || d < 0.5) continue;
            const g = ground(c.x, c.z);
            if (c.top - g < 1.3) continue;
            // and big enough to read: a four-unit thing at eighty is a
            // mark on the horizon, not company
            if ((c.top - g) / d < 0.05) continue;
            if (inFrame(c.x, g + (c.top - g) * 0.6, c.z)) frame.push({ id: 'standee', d: +d.toFixed(1), x: c.x, z: c.z });
          }
          // the life: everything drawn
          for (const l of I.life.drawn()) {
            if (!l.visible || !l.map) continue;
            const d = near(l.x, l.z);
            if (d > REACH) continue;
            if (inFrame(l.x, ground(l.x, l.z) + 0.9, l.z)) frame.push({ id: l.id, d: +d.toFixed(1), x: l.x, z: l.z });
          }
          // the things
          for (const t of I.things.all) {
            if (t.state === 'gone' || t.state === 'held') continue;
            const d = near(t.x, t.z);
            if (d > REACH) continue;
            if (inFrame(t.x, ground(t.x, t.z) + 0.6, t.z)) frame.push({ id: t.def.id, d: +d.toFixed(1), x: t.x, z: t.z });
          }
          // the bridges
          for (const b of I.layout.BRIDGES) {
            const d = near(b.x, b.z);
            if (d > 44) continue;
            if (inFrame(b.x, ground(b.x, b.z) + 1.5, b.z)) frame.push({ id: 'bridge', d: +d.toFixed(1), x: b.x, z: b.z });
          }
          // water beside the road: a bend is a thing to look at
          let wet = false;
          for (let a = 0; a < 8 && !wet; a++) {
            const ang = (a / 8) * Math.PI * 2;
            const wx = x + Math.cos(ang) * 7;
            const wz = z + Math.sin(ang) * 7;
            if (wz < z - 1) continue;    // only water in front of or beside the walker
            if (I.terrain.waterAt(wx, wz) > 0.3 && inFrame(wx, ground(wx, wz), wz)) wet = true;
          }
          if (wet) frame.push({ id: 'water', d: 7, x, z });
          const ear = I.earshot(x, z, hour).map((h) => ({ id: h.id, d: +h.d.toFixed(1) }));
          frame.sort((a, b) => a.d - b.d);
          ear.sort((a, b) => a.d - b.d);
          return { land: I.region(), frame: frame.slice(0, 6), ear: ear.slice(0, 6) };
        },
        [x, z, hour, samples.length === 0, REACH, sc / WALK]
      );
      samples.push({ s: +sc.toFixed(1), x: +x.toFixed(1), z: +z.toFixed(1), hour: +hour.toFixed(2), ...r });
    }

    // the silences: runs of samples with nothing in frame and nothing in earshot
    const silences = [];
    let run = null;
    const close = (endIdx) => {
      if (!run) return;
      const a = samples[run.start];
      const b = samples[endIdx];
      const secs = (b.s - a.s) / WALK + STEP;   // a sample stands for the STEP seconds around it
      // what was nearest, over the run, on either side of it
      const before = run.start > 0 ? samples[run.start - 1] : null;
      const after = endIdx < samples.length - 1 ? samples[endIdx + 1] : null;
      const last = (before?.frame[0] ?? before?.ear[0])?.id ?? 'the road\'s start';
      const next = (after?.frame[0] ?? after?.ear[0])?.id ?? 'the road\'s end';
      silences.push({ rig: vp.name, road: name, secs: +secs.toFixed(0), units: +(b.s - a.s + WALK * STEP).toFixed(0),
        from: [a.x, a.z], to: [b.x, b.z], land: a.land, landTo: b.land, hour: a.hour, last, next });
      run = null;
    };
    samples.forEach((sm, i) => {
      const empty = sm.frame.length === 0 && sm.ear.length === 0;
      if (empty && !run) run = { start: i };
      if (!empty) close(i - 1);
    });
    close(samples.length - 1);
    const bad = silences.filter((s) => s.secs >= LIMIT);
    report.push(...bad);
    const alive = samples.filter((s) => s.frame.length || s.ear.length).length;
    console.log(
      `  ${vp.name.padEnd(9)} ${name.padEnd(14)} ${String(Math.round(length)).padStart(4)}u ${String(Math.round(length / WALK)).padStart(4)}s  ` +
      `${alive}/${samples.length} samples alive  ${bad.length ? `✗ ${bad.length} silence(s): ${bad.map((b) => `${b.secs}s`).join(', ')}` : '✓'}`
    );
    if (process.env.VERBOSE) {
      for (const sm of samples) {
        console.log(`      s=${String(sm.s).padStart(6)} (${sm.x}, ${sm.z}) ${sm.hour}h ${sm.land.padEnd(12)} frame: ${sm.frame.map((f) => `${f.id}@${f.d}`).join(' ') || '—'}  ear: ${sm.ear.map((e) => `${e.id}@${e.d}`).join(' ') || '—'}`);
      }
    }
  }
  await page.close();
}
await browser.close();

report.sort((a, b) => b.secs - a.secs);
fails = report.length;
console.log(fails ? `\n${fails} silence(s) of ${LIMIT}s or more, longest first:` : '\nno road is silent for fifteen seconds');
for (const s of report) {
  console.log(
    `  ${String(s.secs).padStart(3)}s  ${s.rig.padEnd(8)} ${s.road.padEnd(14)} ${s.land === s.landTo ? s.land : `${s.land}→${s.landTo}`}` +
    `  (${s.from[0]}, ${s.from[1]}) → (${s.to[0]}, ${s.to[1]})  from ${s.hour}h  after ${s.last}, before ${s.next}`
  );
}
if (process.env.JSON) {
  const { writeFileSync, mkdirSync } = await import('fs');
  mkdirSync('out', { recursive: true });
  writeFileSync(process.env.JSON, JSON.stringify(report, null, 1));
}
process.exit(fails ? 1 : 0);
