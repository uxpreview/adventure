// THE BEARING, ASSERTED — the machine half of Session 9's gate.
//
//   npx vite preview --port 4173 &
//   node tools/check-camera.mjs
//
// A camera is not a picture, so a contact sheet cannot prove most of
// what App.CAM's bearing claims. Six of its claims are arithmetic, and
// arithmetic can be asserted:
//
//   1. THE ENVELOPE IS A HARD CLAMP. Nothing — travel, peek, the boat,
//      a road that carries, all of them at once — ever puts the camera
//      further off north than its rig's own number. That number is the
//      one thing in the system standing between this world and a stack
//      of card seen sideways, and it is not allowed to be a suggestion.
//   2. A STOPPED WALKER COMES HOME, EXACTLY. Not asymptotically: six
//      WOWED verdicts are held by the clause that a standing figure is
//      in the composition its land was authored for, so the bearing has
//      to ARRIVE at zero and stay there.
//   3. THERE IS NO COIN TOSS AT DUE SOUTH. Sweep the whole circle of
//      travel directions and the bearing must be continuous across every
//      one of them — most of all across ±180°, which is where the
//      obvious implementation of "ease toward travel" flips a
//      fifty-two-degree pan back and forth for a walker wobbling either
//      side of the road.
//   4. THE WALK SOUTH IS ACTUALLY BETTER, in units of page. Measured by
//      firing the frame's own bottom edge at the ground and asking how
//      far in front of the walker it lands — which is, exactly, how much
//      warning you get about the ground you are walking into.
//   5. THE PIN WORKS. `setBearing(false)` and the camera is the shipped
//      page, which is what every protected contact sheet is shot on.
//   6. AND THE POSTER HAS NO BEARING, because nobody is walking.
//
// Everything here runs on the harness clock (`__inklands.step`), so the
// numbers are game seconds and this file's results do not depend on how
// many frames a second the machine underneath it manages.
import { chromium } from 'playwright';

const URL = process.env.URL ?? 'http://localhost:4173/?debug';
const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 720, env: 26 },
  { name: 'portrait', width: 390, height: 844, env: 12 },
];

let fails = 0;
const fail = (m) => { console.log('  ✗ ' + m); fails++; };
const pass = (m) => console.log('  ✓ ' + m);

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });

for (const vp of VIEWPORTS) {
  console.log(`\n${vp.name} (envelope ${vp.env}°):`);
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
  await page.addInitScript(() => localStorage.clear());
  page.on('pageerror', (e) => console.log('  PAGE EXCEPTION:', e.message));
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.bringToFront();
  await page
    .waitForFunction(() => document.body.innerText.toLowerCase().includes('set out'), {
      timeout: 20000,
    })
    .catch(() => {});

  /* ---- 6. the poster, before anybody has set out ------------------- */
  const poster = await page.evaluate(() => {
    window.__inklands.setTime(0);
    window.__inklands.step(1 / 60, 60);
    return window.__inklands.bearing();
  });
  if (Math.abs(poster.yaw) > 1e-9 || poster.astern > 1e-9) {
    fail(`the title poster has a bearing (${poster.yaw.toFixed(3)}°)`);
  } else {
    pass('the title poster is due north');
  }

  const r = await page.evaluate(() => {
    const I = window.__inklands;
    const D = (a) => (a * Math.PI) / 180;
    I.setHour(12, false);
    I.begin();

    /* Fired down the frame's own bottom edge: where the near edge of the
     * picture meets the page, and therefore how much of the ground in
     * front of the walker is IN the picture. Marched rather than solved,
     * because the ground is not a plane. */
    const groundHit = () => {
      const cam = I.cam;
      const o = cam.position;
      const dir = { x: 0, y: 0, z: 0 };
      // NDC (0, -1) is the bottom of the frame, dead centre
      const v = new cam.position.constructor(0, -1, 0.5);
      v.unproject(cam);
      dir.x = v.x - o.x; dir.y = v.y - o.y; dir.z = v.z - o.z;
      const L = Math.hypot(dir.x, dir.y, dir.z);
      dir.x /= L; dir.y /= L; dir.z /= L;
      let t = 0;
      for (let i = 0; i < 4000; i++) {
        t += 0.05;
        const px = o.x + dir.x * t, py = o.y + dir.y * t, pz = o.z + dir.z * t;
        if (py <= I.terrain.heightAt(px, pz)) return { x: px, z: pz };
        if (t > 200) break;
      }
      return null;
    };

    const at = (x, z) => { I.goto(x, z); I.setTime(0); I.step(1 / 60, 180); };
    const walk = (mx, mz, secs, run = 0) => {
      I.drive(mx, mz, run);
      I.step(1 / 60, Math.round(secs * 60));
    };

    /* ---- 1 + 3. the whole circle of travel, and the peek on top ----- */
    /* OFF THE ROAD, ON PURPOSE. At (−45, 66) the walker is standing on
     * the king's road, which CARRIES (Session 6): it bends the heading
     * and adds speed, and it hands off in steps as the alignment gate
     * opens and shuts. That is the road's behaviour and it is measured
     * in design/specs/traversal.md; measured here it would be scored
     * against the camera. So the sweep is run in open meadow where
     * carryAt is zero, and the roads are photographed instead. */
    const sweep = [];
    for (let a = 0; a < 360; a += 10) {
      at(-80, 80);
      // every direction is driven for four game seconds, then peeked
      // hard the way that would take it furthest off north
      walk(Math.sin(D(a)), -Math.cos(D(a)), 4);
      const plain = I.bearing();
      I.peek(plain.yaw >= 0 ? 1 : -1);
      I.step(1 / 60, 120);
      const peeked = I.bearing();
      I.peek(null);
      I.release();
      sweep.push({ a, yaw: plain.yaw, astern: plain.astern, peeked: peeked.yaw });
    }

    /* ---- 2. and it comes home ---------------------------------------*/
    at(-80, 80);
    walk(1, 0, 5);
    const before = I.bearing().yaw;
    I.release();
    const home = [];
    for (let i = 0; i < 24; i++) {
      I.step(1 / 60, 15);       // quarter of a game second at a time
      home.push(I.bearing());
    }

    /* ---- 4. the walk south, in units of page ------------------------ */
    const southward = (pin) => {
      at(-45, 150);
      I.setBearing(!pin);
      walk(0, 1, 6);
      const hit = groundHit();
      const ahead = hit ? hit.z - I.char.pos.z : null;
      const b = I.bearing();
      I.release();
      I.setBearing(true);
      return { ahead, yaw: b.yaw, astern: b.astern };
    };
    const pinned = southward(true);
    const live = southward(false);

    /* ---- 5. the pin, on a walker who is moving ---------------------- */
    at(-80, 80);
    I.setBearing(false);
    walk(1, 0, 5);
    const whilePinned = I.bearing();
    I.peek(1);
    I.step(1 / 60, 120);
    const pinnedPeek = I.bearing();
    I.peek(null);
    I.release();
    I.setBearing(true);

    return { sweep, before, home, pinned, live, whilePinned, pinnedPeek };
  });

  /* ---- 1. the envelope ------------------------------------------- */
  const worst = r.sweep.reduce(
    (m, s) => Math.max(m, Math.abs(s.yaw), Math.abs(s.peeked)), 0
  );
  if (worst > vp.env + 0.01) {
    fail(`the envelope leaked: ${worst.toFixed(2)}° off north, past ${vp.env}°`);
  } else {
    pass(`nothing gets past the envelope — worst of 72 readings ${worst.toFixed(2)}°`);
  }

  /* ---- 3. continuity round the circle ------------------------------ */
  let jump = 0, jumpAt = 0;
  for (let i = 0; i < r.sweep.length; i++) {
    const a = r.sweep[i], b = r.sweep[(i + 1) % r.sweep.length];
    const d = Math.abs(b.yaw - a.yaw);
    if (d > jump) { jump = d; jumpAt = b.a; }
  }
  // ten degrees of travel may not move the camera more than a quarter of
  // its envelope: a coin toss at due south would move it by twice it
  if (jump > vp.env * 0.25) {
    fail(`the bearing jumps ${jump.toFixed(2)}° between two travel directions at ${jumpAt}°`);
  } else {
    pass(`continuous round the circle — worst step ${jump.toFixed(2)}° per 10° of travel, at ${jumpAt}°`);
  }
  const south = r.sweep.find((s) => s.a === 180);
  if (Math.abs(south.yaw) > 2) {
    fail(`due south is not straight: ${south.yaw.toFixed(2)}°`);
  } else {
    pass(`due south picks no side (${south.yaw.toFixed(2)}°) and is fully astern (${south.astern.toFixed(2)})`);
  }
  const east = r.sweep.find((s) => s.a === 90);
  console.log(
    `    east ${east.yaw.toFixed(1)}°  south-east ${r.sweep.find((s) => s.a === 130).yaw.toFixed(1)}°` +
    `  south ${south.yaw.toFixed(1)}°  west ${r.sweep.find((s) => s.a === 270).yaw.toFixed(1)}°`
  );

  /* ---- 2. home ---------------------------------------------------- */
  const zeroAt = r.home.findIndex((h) => h.yaw === 0 && h.astern === 0);
  if (zeroAt < 0) {
    fail(`the bearing never reaches zero (${r.home[r.home.length - 1].yaw.toFixed(4)}° after 6 s)`);
  } else {
    pass(`home from ${r.before.toFixed(1)}° to EXACTLY zero in ${((zeroAt + 1) * 0.25).toFixed(2)} game seconds`);
  }

  /* ---- 4. the walk south ------------------------------------------ */
  const gain = r.live.ahead / r.pinned.ahead;
  console.log(
    `    walking south, the page in front of the walker: ` +
    `${r.pinned.ahead.toFixed(1)} units pinned → ${r.live.ahead.toFixed(1)} live` +
    ` (×${gain.toFixed(2)}), astern ${r.live.astern.toFixed(2)}`
  );
  /* The floor is stated in UNITS OF PAGE and in what they are worth: at
   * a walk, fifteen units is three seconds of warning about the ground
   * you are entering. The ratio is measured against the same build with
   * the bearing pinned — which still has the lead — so it is the astern
   * terms' own contribution and nothing else's. */
  if (r.live.ahead < 15 || gain < 1.45) {
    fail(`the walk south sees ${r.live.ahead.toFixed(1)} units (×${gain.toFixed(2)}); the astern terms are not earning their place`);
  } else {
    pass(`the walk south sees ${r.live.ahead.toFixed(1)} units of page ahead of it, ×${gain.toFixed(2)} the pinned rig`);
  }

  /* ---- 5. the pin ------------------------------------------------- */
  if (r.whilePinned.yaw !== 0 || r.whilePinned.astern !== 0 || r.pinnedPeek.yaw !== 0) {
    fail('setBearing(false) did not pin the camera; every protected sheet is unreproducible');
  } else {
    pass('setBearing(false) pins the camera through travel AND a held peek');
  }

  await page.close();
}

await browser.close();
console.log(fails ? `\n${fails} FAILURE(S)` : '\nall camera checks pass');
process.exit(fails ? 1 : 0);
