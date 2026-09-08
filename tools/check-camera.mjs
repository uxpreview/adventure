// THE CAMERA, ASSERTED — the reset, pillar 1.
//
//   npx vite preview --port 4173 &
//   node tools/check-camera.mjs
//
// The camera orbits under the player's hand and under nothing else
// (src/core/Look.ts). The claims are arithmetic, so they are asserted:
//
//   1. THE POSTER HAS NO YAW. Before anybody sets out the frame is the
//      composition the title was drawn for.
//   2. WALKING NEVER TURNS THE FRAME. Ten game seconds on each of eight
//      headings, at a run, with no look input: the yaw is EXACTLY the
//      number it started at — not near it. This is the assertion that
//      failed in the owner's stomach in Session 12, and it is the one
//      rule that survives every other change to this camera.
//   3. A DRAG TURNS IT BY THE EXPECTED AMOUNT. N pixels of mouse drag
//      is N × YAW_PER_PX radians, once the short drain has settled;
//      vertical drag pitches, and the pitch is clamped to its range.
//   4. THE WHEEL DOLLIES between the near and far distances, both ways.
//   5. THE RECENTRE LANDS BEHIND THE WALKER, exactly, and never turns
//      faster than Look.RECENTRE_RATE on the way.
//   6. THE WALK IS RELATIVE TO THE LENS: W looking east walks east.
//   7. THE HELD KEYS TURN AND DO NOT SPRING BACK: after `.` is let go the
//      yaw stays where it was left.
//   8. THE PIN WORKS: `setBearing(false)` holds the yaw at zero through
//      a drag and a held key, which is what every old contact sheet is
//      shot on.
//
// Everything runs on the harness clock (`__inklands.step`), so the
// numbers are game seconds whatever the machine underneath manages.
import { chromium } from 'playwright';
import { CHROMIUM } from './pw.mjs';

const URL = process.env.URL ?? 'http://localhost:4173/?debug';
const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 720 },
  { name: 'portrait', width: 390, height: 844 },
];
/* Mirrors of src/core/Look.ts — the check fails if they drift. */
const YAW_PER_PX = 0.0052;
const PITCH_MAX = (50 * Math.PI) / 180;
const PITCH_MIN = (10 * Math.PI) / 180;
const RECENTRE_RATE = 2.0;
const KEY_TURN = 1.3;

let fails = 0;
const fail = (m) => { console.log('  ✗ ' + m); fails++; };
const pass = (m) => console.log('  ✓ ' + m);
const deg = (r) => ((r * 180) / Math.PI).toFixed(2) + '°';

const browser = await chromium.launch({ executablePath: CHROMIUM });

for (const vp of VIEWPORTS) {
  console.log(`\n${vp.name}:`);
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
  await page.addInitScript(() => localStorage.clear());
  page.on('pageerror', (e) => console.log('  PAGE EXCEPTION:', e.message));
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.bringToFront();
  await page.waitForSelector('.title-veil:not(.gone)', { timeout: 20000 }).catch(() => {});

  /* ---- 1. the poster --------------------------------------------- */
  const poster = await page.evaluate(() => {
    window.__inklands.setTime(0);
    window.__inklands.step(1 / 60, 60);
    return window.__inklands.yaw();
  });
  if (Math.abs(poster) > 1e-9) fail(`the title poster has a yaw (${deg(poster)})`);
  else pass('the title poster looks due north');

  const r = await page.evaluate(() => {
    const I = window.__inklands;
    const D = (a) => (a * Math.PI) / 180;
    I.setHour(12, false);
    I.begin();
    const at = (x, z) => { I.goto(x, z); I.setTime(0); I.step(1 / 60, 120); };
    const walk = (mx, mz, secs, run = 0) => { I.drive(mx, mz, run); I.step(1 / 60, Math.round(secs * 60)); };
    const settle = () => I.step(1 / 60, 90);

    /* ---- 2. walking never turns the frame ------------------------ */
    const walked = [];
    for (const start of [0, D(37)]) {
      at(-80, 80);
      I.setYaw(start);
      settle();
      for (let a = 0; a < 360; a += 45) {
        const before = I.yaw();
        let worst = 0;
        I.drive(Math.sin(D(a)), -Math.cos(D(a)), 1);
        for (let i = 0; i < 600; i++) {
          I.step(1 / 60, 1);
          worst = Math.max(worst, Math.abs(I.yaw() - before));
        }
        I.release();
        settle();
        walked.push({ start, a, drift: worst, after: I.yaw() - before });
      }
    }

    /* ---- 3. a drag turns it by the expected amount ---------------- */
    at(-80, 80);
    I.setYaw(0);
    settle();
    I.orbitBy(300, 0);
    settle();
    const dragYaw = I.yaw();
    I.orbitBy(-450, 0);
    settle();
    const dragYaw2 = I.yaw();
    const pitch0 = I.pitch();
    I.orbitBy(0, 2000);
    settle();
    const pitchHigh = I.pitch();
    I.orbitBy(0, -4000);
    settle();
    const pitchLow = I.pitch();
    I.setPitch(pitch0);

    /* ---- 4. the wheel ---------------------------------------------- */
    const dist0 = I.dist();
    I.zoomBy(3);
    settle();
    const distFar = I.dist();
    I.zoomBy(-6);
    settle();
    const distNear = I.dist();
    I.setDist(dist0);
    settle();

    /* ---- 5. the recentre lands behind the walker ------------------- */
    at(-80, 80);
    I.setYaw(D(-120));
    walk(1, 0, 2);          // east
    I.release();
    settle();
    I.recentre();
    let rate = 0;
    let last = I.yaw();
    for (let i = 0; i < 360; i++) {
      I.step(1 / 60, 1);
      const y = I.yaw();
      let d = y - last;
      if (d > Math.PI) d -= 2 * Math.PI;
      if (d < -Math.PI) d += 2 * Math.PI;
      rate = Math.max(rate, Math.abs(d) * 60);
      last = y;
    }
    const recentred = { yaw: I.yaw(), pitch: I.pitch(), rate, still: I.recentring() };

    /* ---- 6. the walk is relative to the lens ----------------------- */
    const rel = [];
    for (const yaw of [0, 90, 180, 270]) {
      at(-80, 80);
      I.setYaw(D(yaw));
      settle();
      const x0 = I.char.pos.x, z0 = I.char.pos.z;
      walk(0, -1, 2);       // W
      I.release();
      rel.push({ yaw, dx: I.char.pos.x - x0, dz: I.char.pos.z - z0 });
    }

    /* ---- 7. the held key turns and stays ---------------------------- */
    at(-80, 80);
    I.setYaw(0);
    settle();
    I.peek(1);
    I.step(1 / 60, 60);
    const held = I.yaw();
    I.peek(null);
    I.step(1 / 60, 180);
    const letGo = I.yaw();

    /* ---- 8. the pin ------------------------------------------------- */
    I.setBearing(false);
    I.orbitBy(400, 0);
    I.peek(1);
    walk(1, 0, 2);
    const pinned = I.yaw();
    I.peek(null);
    I.release();
    I.setBearing(true);

    return { walked, dragYaw, dragYaw2, pitch0, pitchHigh, pitchLow, dist0, distFar, distNear, recentred, rel, held, letGo, pinned };
  });

  /* ---- 2 ---- */
  const drift = r.walked.reduce((m, w) => Math.max(m, w.drift, Math.abs(w.after)), 0);
  if (drift > 0) fail(`WALKING TURNS THE FRAME: ${deg(drift)} of drift over 16 runs of 10 s with no look input`);
  else pass('walking never turns the frame — 16 headings × 10 s at a run, yaw exactly unchanged');

  /* ---- 3 ---- */
  const want = 300 * YAW_PER_PX;
  if (Math.abs(r.dragYaw - want) > 0.002) fail(`a 300 px drag turned ${deg(r.dragYaw)}, expected ${deg(want)}`);
  else pass(`a 300 px drag turns ${deg(r.dragYaw)} (YAW_PER_PX ${YAW_PER_PX})`);
  const want2 = -150 * YAW_PER_PX;
  if (Math.abs(r.dragYaw2 - want2) > 0.002) fail(`and back 450 px lands at ${deg(r.dragYaw2)}, expected ${deg(want2)}`);
  else pass(`and a drag back lands at ${deg(r.dragYaw2)} — no spring, no drift`);
  if (Math.abs(r.pitchHigh - PITCH_MAX) > 1e-6 || Math.abs(r.pitchLow - PITCH_MIN) > 1e-6) {
    fail(`the pitch leaves its range: ${deg(r.pitchLow)} .. ${deg(r.pitchHigh)}`);
  } else pass(`a vertical drag pitches, clamped to ${deg(PITCH_MIN)} .. ${deg(PITCH_MAX)}`);

  /* ---- 4 ---- */
  if (!(r.distFar > r.dist0 * 1.5 && r.distNear < r.dist0 * 0.8)) {
    fail(`the wheel does not dolly both ways: ${r.distNear.toFixed(1)} < ${r.dist0.toFixed(1)} < ${r.distFar.toFixed(1)}`);
  } else pass(`the wheel dollies ${r.distNear.toFixed(1)} .. ${r.dist0.toFixed(1)} .. ${r.distFar.toFixed(1)} units`);

  /* ---- 5 ---- */
  // the walker went east: behind them is a camera looking east, yaw +90°
  const wantYaw = Math.PI / 2;
  if (r.recentred.still || Math.abs(r.recentred.yaw - wantYaw) > 1e-6) {
    fail(`the recentre lands at ${deg(r.recentred.yaw)}, not exactly behind the walker (${deg(wantYaw)})${r.recentred.still ? ', and is still going' : ''}`);
  } else pass(`the recentre lands exactly behind the walker at ${deg(r.recentred.yaw)}`);
  if (r.recentred.rate > RECENTRE_RATE + 0.05) fail(`the recentre whips at ${deg(r.recentred.rate)}/s, past ${deg(RECENTRE_RATE)}/s`);
  else pass(`and turns no faster than ${deg(r.recentred.rate)}/s on the way`);

  /* ---- 6 ---- */
  let relOk = true;
  for (const t of r.rel) {
    const ex = Math.sin((t.yaw * Math.PI) / 180), ez = -Math.cos((t.yaw * Math.PI) / 180);
    const along = t.dx * ex + t.dz * ez;
    const across = Math.abs(t.dx * -ez + t.dz * ex);
    if (!(along > 4 && across < along * 0.25)) { relOk = false; fail(`W looking ${t.yaw}° moved (${t.dx.toFixed(1)}, ${t.dz.toFixed(1)})`); }
  }
  if (relOk) pass('W walks away from the lens at every yaw — the walk is relative to the camera');

  /* ---- 7 ---- */
  if (!(r.held > 0.5 * KEY_TURN * 0.8)) fail(`a held \`.\` turned only ${deg(r.held)} in a second`);
  else if (r.letGo !== r.held) fail(`the held key springs back: ${deg(r.held)} → ${deg(r.letGo)}`);
  else pass(`a held \`.\` turns ${deg(r.held)} in a second and stays there when let go`);

  /* ---- 8 ---- */
  if (r.pinned !== 0) fail(`setBearing(false) did not pin the yaw (${deg(r.pinned)})`);
  else pass('setBearing(false) pins the yaw at zero through a drag, a held key and a walk');

  await page.close();
}

await browser.close();
console.log(fails ? `\n${fails} FAILURE(S)` : '\nall camera checks pass');
process.exit(fails ? 1 : 0);
