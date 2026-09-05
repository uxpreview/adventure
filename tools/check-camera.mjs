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
// AND FROM SESSION 12 THERE IS A SEVENTH, WHICH IS THE ONE THE OWNER
// ACTUALLY FELT AND THE ONE NOBODY HAD WRITTEN:
//
//   7. HOW FAST CAN THE FRAME MOVE, UNDER AN INPUT A PLAYER CAN
//      PRODUCE? The six claims above are all about WHERE the camera
//      ends up, and every one of them was green on the build that made
//      the owner ill. None of them asked about the JOURNEY between two
//      of those places, and a rotation rate is the whole of what
//      vection sickness is made of.
//
//      Two ceilings, because the distinction is the design (App.CAM,
//      SESSION 12), and asserting one number for both would either ban
//      the peek or license the sickness:
//
//        · UNREQUESTED — the frame's rotation under WALKING INPUT
//          ALONE, with no hand on a peek key. The ceiling is 1°/s,
//          which is a way of writing ZERO that survives an easing
//          term and a floating-point tick. On the build that failed
//          the gate this was 34.7°/s.
//        · REQUESTED — the frame's rotation while a peek is HELD. The
//          ceiling is 45°/s. A held peek is a head turn: the player
//          asked for it, knows they asked, and lets go when they are
//          done. It measures 32°/s.
//
//      And one more, because the dolly is a motion too and it is
//      coupled to the turn: THE RIG MAY NOT GIVE GROUND FASTER THAN
//      THE WALKER COVERS IT. A camera receding faster than 4.1 units a
//      second — the walk — makes the page flow backwards under
//      somebody who is going forwards. It was 5.9 u/s and it is 4.1.
//
// Everything here runs on the harness clock (`__inklands.step`), so the
// numbers are game seconds and this file's results do not depend on how
// many frames a second the machine underneath it manages.
import { chromium } from 'playwright';
import { CHROMIUM } from './pw.mjs';

const URL = process.env.URL ?? 'http://localhost:4173/?debug';
const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 720, env: 26 },
  { name: 'portrait', width: 390, height: 844, env: 12 },
];

let fails = 0;
const fail = (m) => { console.log('  ✗ ' + m); fails++; };
const pass = (m) => console.log('  ✓ ' + m);

const browser = await chromium.launch({ executablePath: CHROMIUM });

for (const vp of VIEWPORTS) {
  console.log(`\n${vp.name} (envelope ${vp.env}°):`);
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
  await page.addInitScript(() => localStorage.clear());
  page.on('pageerror', (e) => console.log('  PAGE EXCEPTION:', e.message));
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.bringToFront();
  await page
    .waitForSelector('.title-veil:not(.gone)', { timeout: 20000 })
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
      I.peek(1);
      I.step(1 / 60, 120);
      const peeked = I.bearing();
      I.peek(null);
      I.release();
      sweep.push({ a, yaw: plain.yaw, astern: plain.astern, peeked: peeked.yaw });
    }

    /* ---- 2. and it comes home ---------------------------------------*
     * SESSION 12: this used to drive the walker east and let go, because
     * travel was what deflected the bearing. Travel deflects nothing
     * now, so that test could only ever have proved that zero is zero.
     * The contract it exists to protect is unchanged and is the one
     * holding ninety-two protected framings — A STOPPED WALKER IS IN
     * THE SHIPPED COMPOSITION — so it is now run on the only thing left
     * that can deflect the bearing at all: a full peek, let go. */
    at(-80, 80);
    walk(1, 0, 2);
    I.peek(1);
    I.step(1 / 60, 180);
    const before = I.bearing().yaw;
    I.peek(null);
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

    /* ---- 7. HOW FAST THE FRAME MOVES (Session 12) ------------------- *
     * Sampled EVERY TICK, which is the whole point: the owner's own
     * table was sampled every third of a second and that averaged the
     * peak away — it reported 20°/s where the frame was doing 35. A
     * rate you can feel lives inside a frame, not inside a third of a
     * second.
     *
     * Driven round the circuit a player actually walks: a heading, a
     * change of mind, a change back. The turn from east to west is the
     * worst case in the game and it is one key press.  */
    const circuit = (peeking) => {
      at(-80, 80);
      const LEGS = [[0, -1], [0.707, -0.707], [1, 0], [0.707, 0.707], [0, 1], [-1, 0], [0, 0]];
      let lastYaw = I.bearing().yaw;
      let lastBack = I.bearing().back;
      let dYaw = 0;
      let dBack = 0;
      if (peeking) I.peek(1);
      for (const [mx, mz] of LEGS) {
        if (mx === 0 && mz === 0) I.release(); else I.drive(mx, mz, 0);
        /* AND THE PEEK IS FLIPPED MID-CIRCUIT, because the fastest
         * rotation a player can ask for is not holding one peek — it is
         * changing their mind about which way they are looking. */
        for (let i = 0; i < 120; i++) {
          if (peeking === 'flip' && i === 60) I.peek(mz > 0 ? -1 : 1);
          I.step(1 / 60, 1);
          const bb = I.bearing();
          const y = bb.yaw;
          const b = bb.back;
          dYaw = Math.max(dYaw, Math.abs(y - lastYaw) * 60);
          dBack = Math.max(dBack, Math.abs(b - lastBack) * 60);
          lastYaw = y;
          lastBack = b;
        }
      }
      I.release();
      I.peek(null);
      I.step(1 / 60, 180);
      return { dYaw, dBack };
    };
    const walked = circuit(false);
    const peeked = circuit(true);
    /* AND THE WORST ROTATION A HAND CAN FORCE: not a held peek but a
     * peek REVERSED — `.` released and `,` pressed — which is the full
     * envelope twice over in one gesture. */
    const flipped = circuit('flip');

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

    return { sweep, before, home, pinned, live, whilePinned, pinnedPeek, walked, peeked, flipped };
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

  /* ---- 3. NO DIRECTION OF TRAVEL TURNS THE FRAME (Session 12) ------ *
   * This used to assert that the bearing was CONTINUOUS round the
   * circle of travel, because the shipped camera turned with travel and
   * the failure mode worth guarding was a coin toss at due south
   * flipping a fifty-two degree pan. Session 12 took the automatic yaw
   * off, so the claim is now the stronger one that supersedes it: there
   * is nothing to be continuous, because there is nothing there. A
   * discontinuity cannot exist in a term that is identically zero, and
   * this fails the moment anybody puts travel back into the yaw.
   *
   * The peeked half of the same sweep is what still proves the envelope
   * above, and it proves it from all thirty-six headings. */
  const deflect = r.sweep.reduce((m, s) => Math.max(m, Math.abs(s.yaw)), 0);
  if (deflect > 0.01) {
    fail(`travel turns the frame: ${deflect.toFixed(2)}° off north on a walk with no peek`);
  } else {
    pass('no direction of travel turns the frame — 36 headings, all exactly zero');
  }
  const south = r.sweep.find((s) => s.a === 180);
  /* 0.95 AT FOUR SECONDS, AND THE NUMBER MOVED FOR A REASON. Session 12
   * slowed `asternEase` to 0.85 so the rig can never give ground faster
   * than the walker covers it, and the cost of that ceiling is arrival
   * time: the opening reaches 0.97 at four seconds and 0.99 at five and
   * a half. The sweep samples at four. The walk-south measurement below
   * drives for six and reads 0.99, which is where the claim that
   * matters is actually made. */
  if (south.astern < 0.95) {
    fail(`due south is not opening astern (${south.astern.toFixed(2)} after 4 s)`);
  } else {
    pass(`due south still opens the ground at your feet (astern ${south.astern.toFixed(2)} at 4 s)`);
  }
  const east = r.sweep.find((s) => s.a === 90);
  console.log(
    `    peeked from east ${east.peeked.toFixed(1)}°  from south ${south.peeked.toFixed(1)}°` +
    `  from west ${r.sweep.find((s) => s.a === 270).peeked.toFixed(1)}°`
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

  /* ---- 7. the rate, which is the number the owner felt ------------- */
  /* THE CEILINGS, AND WHY THEY ARE THESE NUMBERS.
   *
   * 1°/s unrequested is a way of writing ZERO that an easing term and a
   * float tick can both live inside. It is not a comfort threshold
   * borrowed from anywhere — it is the assertion that WALKING DOES NOT
   * TURN THE FRAME IN THIS GAME, which is the design Session 12 chose,
   * and a build that drifts off it fails here rather than in somebody's
   * stomach three sessions later.
   *
   * 45°/s requested is sized off what the shipped peek actually does
   * (32°/s at its peak, flipped mid-turn) with room for a rig that
   * eases differently, and it is bounded ABOVE because even a rotation
   * you asked for can be snapped rather than turned. */
  const RATE_WALK = 1.0;
  const RATE_PEEK = 45;
  /* AND A SECOND, LOOSER CEILING FOR THE WORST A HAND CAN FORCE. A peek
   * reversed mid-gesture crosses the envelope TWICE — fifty-two degrees
   * on desktop — and no ease that still feels like a look keeps that
   * under forty-five. It is bounded by what a head does instead: a
   * voluntary head turn runs comfortably past 150°/s, so 80 is half of
   * one, and it still catches every regression worth catching — a peek
   * set instead of eased, an envelope widened without slowing the ease,
   * an ease raised. */
  const RATE_FLIP = 80;
  const RATE_DOLLY = 4.1;   // the walk itself
  if (r.walked.dYaw > RATE_WALK) {
    fail(`WALKING TURNS THE FRAME: ${r.walked.dYaw.toFixed(1)}°/s with no hand on a peek key`);
  } else {
    pass(`walking never turns the frame — ${r.walked.dYaw.toFixed(2)}°/s round the whole circuit`);
  }
  if (r.peeked.dYaw > RATE_PEEK) {
    fail(`a held peek turns the frame at ${r.peeked.dYaw.toFixed(1)}°/s, past ${RATE_PEEK}`);
  } else {
    pass(`a held peek turns it at ${r.peeked.dYaw.toFixed(1)}°/s, and a peek is asked for`);
  }
  if (r.flipped.dYaw > RATE_FLIP) {
    fail(`a REVERSED peek turns the frame at ${r.flipped.dYaw.toFixed(1)}°/s, past ${RATE_FLIP}`);
  } else {
    pass(`the worst a hand can force is ${r.flipped.dYaw.toFixed(1)}°/s — a peek reversed mid-turn`);
  }
  const dolly = Math.max(r.walked.dBack, r.peeked.dBack, r.flipped.dBack);
  if (dolly > RATE_DOLLY) {
    fail(`the rig gives ground at ${dolly.toFixed(2)} u/s, faster than the ${RATE_DOLLY} u/s walk`);
  } else {
    pass(`the rig never gives ground faster than the walker walks — ${dolly.toFixed(2)} u/s`);
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
