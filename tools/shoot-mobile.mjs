// MOBILE QA — the chrome, on real phone viewports.
//
// Session 6.5, and it exists because of a bug a player found on an
// actual phone that five sessions of contact sheets could not have
// caught: **no shoot script has ever opened a note card.** Every sheet
// so far photographs the WORLD; the note, the region card, the hint and
// the interact prompt are the half of this game the player reads, and
// they were being judged by nobody.
//
// So this shoots the chrome, at four widths, in portrait — because the
// chrome is where portrait actually breaks (QUALITY-BAR §3: mobile and
// desktop are both first-class, and a composition that only works in
// landscape is not done).
//
// AND FROM SESSION 12 IT SHOOTS THE DESKTOP TOO, WHICH IS WHERE THE
// SECOND HALF OF THE OWNER'S FEEL GATE FAILED. "The chrome is shot" had
// only ever meant "the chrome is shot on a phone", and the defect that
// hid in that gap was the phone's own joystick appearing under a mouse
// cursor on a 1280×720 desktop — a control from the wrong device, on
// screen, in the shipped build, for three sessions. A mouse was never
// pointed at this game by any tool in this repository.
//
// So the joystick step is now an ASSERTION as well as a photograph, and
// it runs on both rigs with the opposite expectation on each:
//
//   · a TOUCH drag raises the stick   (and a phone that does not is broken)
//   · a MOUSE drag raises NOTHING     (and a desktop that does is the bug)
//
// The touch drag is dispatched over CDP rather than through
// `page.mouse`, which is how the old version drove it — and driving a
// touch control with a mouse is exactly the confusion that shipped the
// defect. `Input.dispatchTouchEvent` produces a real pointer, so
// `pointerType` is genuinely 'touch' and `setPointerCapture` works.
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { CHROMIUM } from './pw.mjs';

// the narrow end of the real world, the two common iPhones, and a large
// Android. 320 is an iPhone SE in a browser with the chrome showing.
const RIGS = [
  { name: '320-narrow', width: 320, height: 568, touch: true },
  { name: '360-android', width: 360, height: 800, touch: true },
  { name: '390-iphone', width: 390, height: 844, touch: true },
  { name: '430-max', width: 430, height: 932, touch: true },
  // AND THE RIG THE OWNER ACTUALLY PLAYED ON.
  { name: '1280-desktop', width: 1280, height: 720, touch: false },
];

let fails = 0;
/** One rig, for iterating: `RIG=1280-desktop node tools/shoot-mobile.mjs`. */
const ONLY = process.env.RIG;

// THE LONGEST NOTE IN THE GAME, and one of the shortest, so the card is
// judged at both ends of its range.
//
// Session 7 re-wrote every note in the world and moved the ceiling: the
// longest is now THE BOARDWALK at 253 characters (it was THE CUT at
// 252). Anybody who rewrites a note re-checks this — the note card is
// hand-lettered onto a canvas, a canvas does not reflow, and the widest
// line in the game is the only one that proves the wrap.
const LONG = 'THE BOARDWALK';
const SHORT = 'THE MOAT POOL';

const out = process.env.OUT ?? 'shots-mobile';
const url = process.env.URL ?? 'http://localhost:4173/?debug';
const browser = await chromium.launch({ executablePath: CHROMIUM });

for (const vp of RIGS.filter((r) => !ONLY || r.name === ONLY)) {
  const dir = `${out}/${vp.name}`;
  mkdirSync(dir, { recursive: true });
  const page = await browser.newPage({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 2,
    isMobile: vp.touch,
    hasTouch: vp.touch,
  });
  await page.addInitScript(() => localStorage.clear());
  page.on('pageerror', (e) => console.log(`[${vp.name}] EXCEPTION:`, e.message));

  await page.goto(url, { waitUntil: 'networkidle' });
  await page.bringToFront();
  await page.waitForTimeout(1100);
  await page.screenshot({ path: `${dir}/01-loader.png` });
  await page
    .waitForSelector('.title-veil:not(.gone)', { timeout: 15000 })
    .catch(() => {});
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${dir}/02-title.png` });

  await page.evaluate(() => window.__inklands.begin());
  // the border card and the control hint both fire on begin
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${dir}/03-card-and-hint.png` });
  await page.waitForTimeout(3000);

  // THE LONGEST LAND NAME IN THE GAME, on the border card. THE COMMON
  // is ten characters and fits anywhere; CASTLE GREYWEATHER is
  // eighteen, in 24pt display caps, and is what actually tests it.
  await page.evaluate(() => window.__inklands.goto(-45, -158));
  await page.waitForTimeout(500);
  await page.evaluate(() => window.__inklands.goto(-45, -170));
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${dir}/03b-longest-card.png` });
  await page.waitForTimeout(2500);

  // THE NOTE CARD — the thing that was never shot. Walked to, not
  // teleported past: the prompt has to be reachable by a thumb and the
  // card has to hold its own text.
  for (const [file, label, x, z] of [
    ['04-note-long', LONG, -224, 58],
    ['05-note-short', SHORT, -100, -215],
  ]) {
    await page.evaluate(([tx, tz]) => window.__inklands.goto(tx, tz), [x, z]);
    await page.waitForTimeout(1400);
    await page.screenshot({ path: `${dir}/${file}-prompt.png` });
    await page.evaluate((l) => {
      const poi = window.__inklands.poi ?? null;
      // press the prompt exactly as a thumb would
      const el = document.getElementById('prompt');
      if (el) el.click();
      void poi; void l;
    }, label);
    await page.waitForTimeout(900);
    await page.screenshot({ path: `${dir}/${file}.png` });
    // Escape, which is what the game itself listens for — a synthetic
    // click on the veil is not reliable across viewports and left a
    // note card open underneath the joystick frame
    await page.keyboard.press('Escape');
    await page.waitForTimeout(600);
  }

  /* ---- THE CHOICE CARD (Session 15) --------------------------------- *
   * It is chrome, it is lettered onto a canvas, and a canvas does not
   * reflow — so it is shot at every width like the note, with THE
   * LONGEST DOOR IN THE GAME on it, and ASSERTED: every option button
   * has to be inside the viewport with air to spare, or the card is a
   * note card that runs off the side of the screen all over again.
   * Session 15 opens it in the world the way a thumb would (the king's
   * plinth) rather than through a back door, so the prompt, the veil
   * and the buttons are all the shipped ones. */
  await page.evaluate(() => window.__inklands.goto(-56, -216));
  await page.waitForTimeout(1400);
  await page.screenshot({ path: `${dir}/08-choice-prompt.png` });
  await page.evaluate(() => {
    const el = document.getElementById('prompt');
    if (el) el.click();
  });
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${dir}/08-choice-card.png` });
  const card = await page.evaluate(({ w, h }) => {
    const open = !!document.querySelector('.choice-veil.show');
    const btns = [...document.querySelectorAll('.choice-btn')].map((b) => {
      const r = b.getBoundingClientRect();
      return { l: r.left, r: r.right, t: r.top, b: r.bottom, label: b.getAttribute('aria-label') };
    });
    const c = document.querySelector('.choice-card');
    const cr = c ? c.getBoundingClientRect() : null;
    return { open, btns, card: cr && { l: cr.left, r: cr.right, t: cr.top, b: cr.bottom }, w, h };
  }, { w: vp.width, h: vp.height });
  const PAD = 8;
  const inside = (r) => r.l >= PAD && r.r <= card.w - PAD && r.t >= PAD && r.b <= card.h - PAD;
  if (!card.open || card.btns.length < 2) {
    console.log(`  ✗ ${vp.name}: the choice card did not open at the plinth (${card.btns.length} doors)`);
    fails++;
  } else if (!card.btns.every(inside) || !inside(card.card)) {
    const off = card.btns.filter((b) => !inside(b)).map((b) => b.label).join(', ');
    console.log(`  ✗ ${vp.name}: a door is off the page — ${off || 'the card itself'}`);
    fails++;
  } else {
    console.log(`  ✓ ${vp.name}: ${card.btns.length} doors on the card, all on the page`);
  }
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);

  /* AND NELL'S CARD (Session 16), which carries the longest door in the
   * game now — KEEP IT, AND PUSH THE CART YOURSELF — and is asserted
   * the same way at every width. Opened at the gate as a thumb would,
   * with the fourth name handed over first. */
  await page.evaluate(() => { window.__inklands.learn('fact:the-timetable'); window.__inklands.goto(-16, 78); });
  await page.waitForTimeout(1400);
  await page.evaluate(() => {
    const el = document.getElementById('prompt');
    if (el) el.click();
  });
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${dir}/08b-nell-card.png` });
  const nell = await page.evaluate(({ w, h }) => {
    const open = !!document.querySelector('.choice-veil.show');
    const btns = [...document.querySelectorAll('.choice-btn')].map((b) => {
      const r = b.getBoundingClientRect();
      return { l: r.left, r: r.right, t: r.top, b: r.bottom, label: b.getAttribute('aria-label') };
    });
    const c = document.querySelector('.choice-card');
    const cr = c ? c.getBoundingClientRect() : null;
    return { open, btns, card: cr && { l: cr.left, r: cr.right, t: cr.top, b: cr.bottom }, w, h };
  }, { w: vp.width, h: vp.height });
  if (!nell.open || nell.btns.length < 2) {
    console.log(`  ✗ ${vp.name}: Nell's card did not open at the gate (${nell.btns.length} doors)`);
    fails++;
  } else if (!nell.btns.every(inside) || !inside(nell.card)) {
    const off = nell.btns.filter((b) => !inside(b)).map((b) => b.label).join(', ');
    console.log(`  ✗ ${vp.name}: a door on Nell's card is off the page — ${off || 'the card itself'}`);
    fails++;
  } else {
    console.log(`  ✓ ${vp.name}: ${nell.btns.length} doors on Nell's card, all on the page`);
  }
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);

  // the map, which IS shot elsewhere but never at 320
  await page.keyboard.press('KeyM');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${dir}/06-map.png` });
  await page.keyboard.press('KeyM');
  await page.waitForTimeout(400);

  /* ---- THE STICK, AND WHETHER IT BELONGS HERE ---------------------- *
   * Same drag on both rigs, dispatched with the pointer each rig
   * actually has, and the two rigs want opposite answers. */
  /* AND IT HAS TO LAND ON THE PAGE, AND THE PAGE HAS TO STAY THERE.
   * The walker is put on empty meadow first — (−80, 80), the same open
   * ground `check-camera` sweeps in, chosen because nothing is there —
   * and the transient chrome is swept. Otherwise the walk from the note
   * framings leaves the walker at THE MOAT POOL with a `look` prompt
   * under the drag, and the prompt is not even STILL: Session 9 made it
   * re-place itself beside whatever it names, every frame, on whichever
   * side the walker is not. So `elementFromPoint` would answer "the
   * page" and the touch a moment later would land on a button — which
   * is exactly what happened, and it is why the hit target is
   * re-checked at dispatch time below rather than trusted. */
  await page.evaluate(() => {
    window.__inklands.goto(-80, 80);
    window.__inklands.quiet();
  });
  await page.waitForTimeout(900);

  /* AND IT HAS TO LAND ON THE PAGE, NOT ON A CONTROL. The old version
   * dragged from (0.5w, 0.82h) unconditionally, and at THE MOAT POOL —
   * which is where the note walk leaves the walker — that is exactly
   * where the `look` prompt sits, so the drag was being swallowed by a
   * button and the frame was filed as "07-joystick-running.png"
   * anyway. It was PHOTOGRAPHED and never ASSERTED, which is the same
   * mistake in miniature as the one this whole session is about. So
   * the origin is SEARCHED for: the lowest point in the legal walk
   * band whose hit target is actually the renderer's canvas. */
  const origin = await page.evaluate(({ w, h }) => {
    const cv = document.querySelector('#app > canvas');
    for (const fy of [0.82, 0.76, 0.7, 0.64, 0.58, 0.5]) {
      for (const fx of [0.5, 0.28, 0.72, 0.16, 0.84]) {
        const x = w * fx;
        const y = h * fy;
        if (document.elementFromPoint(x, y) === cv) return { x, y };
      }
    }
    return null;
  }, { w: vp.width, h: vp.height });
  /* AND THE TOOL SAYS WHERE IT DRAGGED FROM, because "the stick did not
   * come up" and "the drag never landed on the page" are different
   * failures and the first one hid the second for a whole session. */
  await page.evaluate(() => {
    window.__pd = [];
    window.addEventListener(
      'pointerdown',
      (e) => window.__pd.push(`${e.pointerType}→${e.target.tagName}.${e.target.className}`),
      true
    );
  });
  if (!origin) {
    console.log(`  ✗ ${vp.name}: no point in the walk band is the page — chrome covers it`);
    fails++;
    await page.close();
    continue;
  }
  const stillPage = await page.evaluate(
    (o) => document.elementFromPoint(o.x, o.y) === document.querySelector('#app > canvas'),
    origin
  );
  if (!stillPage) {
    console.log(`  ✗ ${vp.name}: chrome moved under the drag point between the search and the drag`);
    fails++;
    await page.close();
    continue;
  }
  const x0 = origin.x;
  const y0 = origin.y;
  const x1 = x0 + 10;
  const y1 = y0 - 70;
  if (vp.touch) {
    const cdp = await page.context().newCDPSession(page);
    const touch = (type, x, y) =>
      cdp.send('Input.dispatchTouchEvent', {
        type,
        touchPoints: type === 'touchEnd' ? [] : [{ x, y, radiusX: 12, radiusY: 12, force: 1 }],
      });
    await touch('touchStart', x0, y0);
    for (let i = 1; i <= 8; i++) {
      await touch('touchMove', x0 + ((x1 - x0) * i) / 8, y0 + ((y1 - y0) * i) / 8);
    }
    await page.waitForTimeout(700);
  } else {
    await page.mouse.move(x0, y0);
    await page.mouse.down();
    await page.mouse.move(x1, y1, { steps: 8 });
    await page.waitForTimeout(700);
  }
  await page.screenshot({ path: `${dir}/07-joystick.png` });
  const landed = await page.evaluate(() => window.__pd);
  const inp = await page.evaluate(() => {
    const i = window.__inklands?.input;
    return i
      ? { enabled: i.enabled, pointerId: i.pointerId, pts: i.pts.size, peek: i.peekIds.length }
      : null;
  });
  const joy = await page.evaluate(() => {
    const el = document.querySelector('.joy');
    if (!el) return { cls: '(no .joy element)', shown: false };
    const r = el.getBoundingClientRect();
    return {
      cls: el.className,
      shown:
        el.classList.contains('active') &&
        getComputedStyle(el).opacity !== '0' &&
        r.width > 0,
    };
  });
  if (vp.touch) {
    await page.evaluate(() => {}); // touch is released by closing the page
    if (joy.shown) {
      console.log(`  ✓ ${vp.name}: a thumb raises the stick ("${joy.cls}")`);
    } else {
      console.log(
        `  ✗ ${vp.name}: a thumb did NOT raise the stick ("${joy.cls}") — ` +
        `dragged from ${Math.round(x0)},${Math.round(y0)}; the drag hit [${landed.join(' ')}]; ` +
        `input ${JSON.stringify(inp)}`
      );
      fails++;
    }
  } else {
    await page.mouse.up();
    if (joy.shown) {
      console.log(
        `  ✗ ${vp.name}: A MOUSE DRAG RAISED THE PHONE'S STICK ("${joy.cls}") — ` +
        `dragged from ${Math.round(x0)},${Math.round(y0)}; the drag hit [${landed.join(' ')}]; ` +
        `input ${JSON.stringify(inp)}`
      );
      fails++;
    } else {
      console.log(`  ✓ ${vp.name}: a mouse drag raises nothing ("${joy.cls}")`);
    }
  }

  console.log(`     ${vp.name}: 10 frames → ${dir}`);
  await page.close();
}

await browser.close();
console.log('done →', out);
if (fails) {
  console.log(`\n${fails} FAILURE(S) — a control is on the wrong device`);
  process.exit(1);
}
