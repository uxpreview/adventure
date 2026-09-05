// THE VERBS, ASSERTED — the machine half of Session 15.
//
//   npx vite preview --port 4173 &
//   node tools/check-verbs.mjs
//
// `THE-FUN-PASS.md` §5 gives the walker touch, carry, sit and throw, on
// the one key that already looks. Most of what those are FOR — whether
// pushing a cart is fun — is the owner's play gate and no tool can run
// it. What a tool can run is the law around them, and every clause
// below is a law that was not amended:
//
//   1. NOBODY CROSSES A BORDER BUT THE WALKER. The cart, shoved at the
//      Common's east edge as hard and as often as a player can, stops
//      inside the Common. A stone thrown at the border lands inside it.
//   2. THE WALK DOES NOT GET WORSE. A player who never touches anything
//      walks up to the well and the plinth and reads the same kind of
//      prompt they did in Session 14; the key still looks.
//   3. SITTING IS A STOPPED WALKER, AND A STOPPED WALKER IS DUE NORTH.
//      The feel gate's contract (`check-camera`) extended to the one new
//      state the verbs add: seated, the bearing is exactly zero and the
//      rig does not dolly.
//   4. ONE THING IN HAND, NEVER TWO. Pick up the stone; the hand is
//      full; nothing else can be picked up; throw it and it is empty.
//   5. THE CLOCK KEEPS THE WORLD'S HOURS WHETHER OR NOT ANYBODY IS THERE.
//      The drove is in the fold at four, on the lane at six, in the
//      field at noon — read straight off the hour, on a page where the
//      walker has never been to the Downs.
//   6. A DOOR IS KNOWLEDGE. Take the second door at the king and the
//      castle reads it back: the banners are down and the king is up,
//      in the same frame, from the same save.
//
// Everything runs on the harness clock, so the numbers are game seconds.
import { chromium } from 'playwright';
import { CHROMIUM } from './pw.mjs';

const URL = process.env.URL ?? 'http://localhost:4173/?debug';
let fails = 0;
const fail = (m) => { console.log('  ✗ ' + m); fails++; };
const pass = (m) => console.log('  ✓ ' + m);

const browser = await chromium.launch({ executablePath: CHROMIUM });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
await page.addInitScript(() => localStorage.clear());
page.on('pageerror', (e) => console.log('  PAGE EXCEPTION:', e.message));
await page.goto(URL, { waitUntil: 'networkidle' });
await page.bringToFront();
await page
  .waitForSelector('.title-veil:not(.gone)', { timeout: 25000 })
  .catch(() => {});

let r = await page.evaluate(() => {
  const I = window.__inklands;
  I.setHour(12, false);
  I.begin();
  I.setBearing(true);
  const at = (x, z) => { I.goto(x, z); I.setTime(0); I.step(1 / 60, 120); };
  const walk = (mx, mz, secs, run = 0) => { I.drive(mx, mz, run); I.step(1 / 60, Math.round(secs * 60)); I.release(); };
  const settle = (secs) => I.step(1 / 60, Math.round(secs * 60));
  const out = {};

  /* ---- 2. the walk does not get worse ------------------------------ */
  at(-56.5, 47.5);
  settle(1);
  out.wellPrompt = I.promptText();
  at(-44, 55);
  settle(1);
  out.signPrompt = I.promptText();
  at(-56, -216);
  settle(1);
  out.kingPrompt = I.promptText();

  /* ---- 1. the cart stops at the border ----------------------------- */
  const cart = I.things.get('hay-cart');
  const rect = cart.rect;
  // stand west of the cart and shove it east, fifteen times, walking
  // after it each time — the hardest a player can push
  at(cart.x - 3, cart.z);
  let far = cart.x;
  for (let i = 0; i < 15; i++) {
    I.goto(cart.x - 3.2, cart.z);
    settle(0.2);   // the prompt is found on a frame, as a player finds it
    I.press();
    settle(2.5);
    far = Math.max(far, cart.x);
  }
  out.cart = { x: cart.x, z: cart.z, maxX: rect.maxX, far };
  // and one more shove against the border: the cart does not move,
  // and it ROCKS, and it comes back to exactly rest
  const restZ = cart.mesh.rotation.z;
  I.goto(cart.x - 3.2, cart.z);
  settle(0.2);
  const xBefore = cart.x;
  I.press();
  I.step(1 / 60, 6);
  const rocked = Math.abs(cart.mesh.rotation.z - restZ);
  settle(1.5);
  out.refused = { moved: Math.abs(cart.x - xBefore), rocked, back: Math.abs(cart.mesh.rotation.z - restZ) };
  // and then home again for the sheet's sake: shove it back west
  for (let i = 0; i < 15; i++) {
    I.goto(cart.x + 3.2, cart.z);
    settle(0.2);
    I.press();
    settle(2.5);
  }
  out.cartBack = { x: cart.x, minX: rect.minX };

  /* ---- 4. one thing in hand, and 1. the stone stays home ------------ */
  const stone = I.things.get('fist-stone');
  at(stone.x, stone.z + 1.6);
  settle(0.5);
  out.stonePrompt = I.promptText();
  I.press();
  settle(0.3);
  out.heldAfterPickup = I.holding();
  // try to pick it up again: there is nothing on the ground to pick up
  out.promptWhileHeld = I.promptText();
  // carry it to the Common's south edge and throw it south, at a run
  at(-20, rect.maxZ - 3);
  walk(0, 1, 1.2, 1);
  I.press();
  settle(3);
  out.heldAfterThrow = I.holding();
  out.stone = { x: stone.x, z: stone.z, state: stone.state, maxZ: rect.maxZ };
  // and down the well: it is gone, and the morning puts it back
  I.things.get('fist-stone').x = -57.6; I.things.get('fist-stone').z = 46.5; stone.state = 'ground';
  at(-57.6, 48.2);
  settle(0.5);
  I.press();            // pick up
  settle(0.3);
  /* From the path, at a walk: the well's own reach is the lip, so the
   * throw is made from outside it and lands inside the shaft. */
  I.goto(-57.6, 51.5);
  I.drive(0, -1, 0);
  I.step(1 / 60, 45);
  I.press();            // thrown north, at a walk: into the well
  I.release();
  settle(3);
  out.wellStone = { state: stone.state, held: I.holding() };
  I.setHour(5.85, false);
  I.events.resync();
  I.setHour(5.95, false);
  I.step(1 / 60, 10);
  out.wellStoneMorning = { state: stone.state, x: stone.x, z: stone.z, home: stone.def.home };

  /* ---- 3. sitting is due north ------------------------------------- */
  I.setHour(12, false);
  at(-91, 33);
  walk(0, -1, 0.6);
  settle(1);
  out.swingPrompt = I.promptText();
  I.press();
  settle(0.2);
  out.seated = I.seated();
  const bearings = [];
  for (let i = 0; i < 20; i++) {
    I.step(1 / 60, 15);
    bearings.push(I.bearing());
  }
  out.seatBearing = bearings;
  out.seatPrompt = I.promptText();
  const hourBefore = I.clock.hour;
  I.clock.running = true;
  settle(10);
  out.seatHours = I.clock.hour - hourBefore;
  I.clock.running = false;
  // a step stands you up
  walk(1, 0, 0.5);
  out.stoodUp = !I.seated();

  /* ---- 5. the drove keeps its own hours ---------------------------- */
  const flockZ = (hour) => {
    I.setHour(hour, false);
    I.goto(101, 96);
    I.step(1 / 60, 240);
    // read the sheep straight off the instanced fields: every field with
    // 13 instances in the Downs is a sheep pose
    let zs = [];
    I.scene.traverse((o) => {
      if (!o.isInstancedMesh || o.count !== 13) return;
      const m = new o.matrixWorld.constructor();
      for (let i = 0; i < 13; i++) {
        o.getMatrixAt(i, m);
        const e = m.elements;
        // only the drove and the west slope: other fields of thirteen
        // exist elsewhere on the sheet
        if (e[13] > -1000 && e[0] !== 0 && e[12] > 88 && e[12] < 114 && e[14] > 40 && e[14] < 130) {
          zs.push({ x: e[12], z: e[14] });
        }
      }
    });
    return zs;
  };
  const four = flockZ(4.0);
  const six = flockZ(6.2);
  const noon = flockZ(12.0);
  const mean = (a) => a.reduce((s, p) => s + p.z, 0) / Math.max(1, a.length);
  out.drove = {
    four: { n: four.length, z: +mean(four).toFixed(1) },
    six: { n: six.length, z: +mean(six).toFixed(1), spread: +(Math.max(...six.map((p) => p.z)) - Math.min(...six.map((p) => p.z))).toFixed(1) },
    noon: { n: noon.length, z: +mean(noon).toFixed(1) },
    happeningAtSix: (() => { I.setHour(6.2, false); I.step(1 / 60, 2); return I.events.progress('the-drove-out'); })(),
    happeningAtNoon: (() => { I.setHour(12, false); I.step(1 / 60, 2); return I.events.progress('the-drove-out'); })(),
  };

  /* ---- 6. a door is knowledge -------------------------------------- */
  I.setHour(12, false);
  at(-56, -216);
  settle(1);
  I.press();
  I.step(1 / 60, 5);
  out.cardOpen = I.choiceOpen();
  out.cardDoors = [...document.querySelectorAll('.choice-btn')].map((b) => b.getAttribute('aria-label'));
  I.choose(0);
  I.step(1 / 60, 30);
  out.door = {
    restored: I.knowledge.has('door:the-king-restored'),
    left: I.knowledge.has('door:the-king-left'),
    oldName: I.knowledge.has('fact:the-old-name'),
    promptAfter: I.promptText(),
    cardAgain: (() => { I.press(); I.step(1 / 60, 5); const o = I.choiceOpen(); return o; })(),
  };
  /* ---- 7. THE FIRST HOUR (Session 16) ------------------------------ */
  /* The opening on a fresh page: the bull looks, charges, never touches;
   * the walker runs through the gate; Nell shuts it; the bull stops at
   * the fence — and the fence is a rule for the walker too. Then the
   * goat follows, and stops at the Common's edge on two roads. */
  {
    const C = I.common;
    // the plinth's note is still open from the last press: put it back
    if (document.querySelector('.note-veil.show')) { I.press(); I.step(1 / 60, 5); }
    C.reset();
    I.setHour(12, false);
    I.save.data.taughtRun = false;
    I.goto(24, 82);
    I.setTime(0);
    I.step(1 / 60, 6);
    const o = { wake: { bull: C.bull.state, gate: C.gate.shut, taughtRun: I.save.data.taughtRun } };
    settle(1.6);
    o.afterStanding = C.bull.state;
    o.taughtByTheBull = I.save.data.taughtRun;
    // run for the gate, the way a player who saw it would — which,
    // since the spawn moved onto the gate's row, is due west
    I.drive(-1, 0, 1);
    let nearest = 1e9;
    let touched = false;
    let slamAt = -1;
    for (let f = 0; f < 420; f++) {
      I.step(1 / 60, 1);
      const d = Math.hypot(I.char.pos.x - C.bull.x, I.char.pos.z - C.bull.z);
      nearest = Math.min(nearest, d);
      if (d < 1.2) touched = true;
      if (slamAt < 0 && C.gate.shut) slamAt = f / 60;
    }
    I.release();
    settle(1.5);
    o.chase = { nearest: +nearest.toFixed(2), touched, slamAt: +slamAt.toFixed(2), walker: { x: +I.char.pos.x.toFixed(1), z: +I.char.pos.z.toFixed(1) } };
    o.bullAtFence = { state: C.bull.state, x: +C.bull.x.toFixed(2), hedgeX: -12 };
    o.nell = C.nell.pose;
    o.hint = document.querySelector('.hint')?.classList.contains('show') ?? false;
    /* THE DUE-WEST RUN (the local QA pass, 2026-09-04, B1). The hint
     * says *hold shift to run* and the bull is east, so a player runs
     * due west, along the spawn's own row, eight units off the gate's.
     * The gate must not shut with them still in the field, and the
     * bull must be IN THE PICTURE while it chases — projected through
     * the shipping camera on this rig, not assumed. */
    {
      C.reset();
      I.setHour(12, false);
      I.goto(24, 82);
      I.setTime(0);
      I.step(1 / 60, 6);
      settle(1.6);
      I.drive(-1, 0, 1);
      const project = (x, y, z) => {
        const cam = I.cam;
        cam.updateMatrixWorld();
        const a = cam.matrixWorldInverse.elements;
        const b = cam.projectionMatrix.elements;
        const mul = (m, v) => [
          m[0] * v[0] + m[4] * v[1] + m[8] * v[2] + m[12] * v[3],
          m[1] * v[0] + m[5] * v[1] + m[9] * v[2] + m[13] * v[3],
          m[2] * v[0] + m[6] * v[1] + m[10] * v[2] + m[14] * v[3],
          m[3] * v[0] + m[7] * v[1] + m[11] * v[2] + m[15] * v[3],
        ];
        const c = mul(b, mul(a, [x, y, z, 1]));
        return { x: c[0] / c[3], y: c[1] / c[3], z: c[2] / c[3] };
      };
      let shutInField = false;
      let shutAt = -1;
      let chasing = 0;
      let seen = 0;
      let nearestW = 1e9;
      for (let f = 0; f < 480; f++) {
        I.step(1 / 60, 1);
        if (C.gate.shut && shutAt < 0) {
          shutAt = f / 60;
          if (I.char.pos.x > -12) shutInField = true;
        }
        nearestW = Math.min(nearestW, Math.hypot(I.char.pos.x - C.bull.x, I.char.pos.z - C.bull.z));
        if (C.bull.state === 'charge' || C.bull.state === 'balk') {
          chasing++;
          const p = project(C.bull.x, I.terrain.heightAt(C.bull.x, C.bull.z) + 1.2, C.bull.z);
          if (p.z < 1 && Math.abs(p.x) < 1 && Math.abs(p.y) < 1) seen++;
        }
      }
      I.release();
      settle(1.5);
      o.dueWest = {
        shutInField, shutAt: +shutAt.toFixed(2), walkerX: +I.char.pos.x.toFixed(1), walkerZ: +I.char.pos.z.toFixed(1),
        bull: { state: C.bull.state, x: +C.bull.x.toFixed(1) }, nearest: +nearestW.toFixed(2),
        inFrame: chasing ? +(seen / chasing).toFixed(2) : 0, chasingFrames: chasing,
        stuck: I.barriers.blocks(I.char.pos.x, I.char.pos.z),
      };
    }
    // the fence refuses the walker everywhere but the stile now
    I.goto(20, 62);
    settle(0.2);
    I.drive(0, 1, 0);
    settle(2.5);
    I.release();
    o.fenceHolds = { z: +I.char.pos.z.toFixed(2) };
    I.goto(12.6, 62);
    settle(0.2);
    I.drive(0, 1, 0);
    settle(2.5);
    I.release();
    o.stilePasses = { z: +I.char.pos.z.toFixed(2) };
    // the goat: it falls in, and it stops at the Brim gate
    C.reset();
    at(-24, 62);
    I.drive(-1, -0.4, 0);
    settle(3);
    I.release();
    o.goatFollows = { following: C.goat.following, d: +Math.hypot(C.goat.x - I.char.pos.x, C.goat.z - I.char.pos.z).toFixed(1) };
    at(-45, 30);
    C.goat.x = -45; C.goat.z = 34; C.goat.following = true;
    I.drive(0, -1, 1);
    settle(12);
    I.release();
    settle(1);
    o.goatNorth = { walkerZ: +I.char.pos.z.toFixed(1), goatZ: +C.goat.z.toFixed(2), minZ: C.goat.def.rect.minZ, atBorder: C.goat.atBorder };
    // and at the east edge, on the other road
    at(20, 50);
    C.goat.x = 20; C.goat.z = 54; C.goat.following = true; C.goat.atBorder = false;
    I.drive(1, 0, 1);
    settle(12);
    I.release();
    settle(1);
    o.goatEast = { walkerX: +I.char.pos.x.toFixed(1), goatX: +C.goat.x.toFixed(2), maxX: C.goat.def.rect.maxX, atBorder: C.goat.atBorder };
    // Nell's card, and the door that answers her wait
    C.reset();
    I.setHour(12, false);
    at(-16, 78);
    settle(0.5);
    o.nellPromptBefore = I.promptText();
    I.press();
    I.step(1 / 60, 5);
    o.nellCardBefore = I.choiceOpen();
    o.nellNoteBefore = !!document.querySelector('.note-veil.show:not(.choice-veil)');
    I.press(); // closes the note
    I.step(1 / 60, 5);
    I.learn('fact:the-timetable');
    I.goto(-16, 78);
    settle(0.5);
    o.nellPromptWithName = I.promptText();
    I.press();
    I.step(1 / 60, 5);
    o.nellCard = { open: I.choiceOpen(), doors: [...document.querySelectorAll('.choice-btn')].map((b) => b.getAttribute('aria-label')) };
    I.choose(0);
    I.step(1 / 60, 30);
    const cart = I.things.get('hay-cart');
    o.doorOne = {
      turned: I.knowledge.has('door:the-cart-turned-north'),
      answered: I.knowledge.answered('meadow'),
      cartHome: Math.hypot(cart.x - cart.def.home.x, cart.z - cart.def.home.z) < 0.01,
      promptAfter: I.promptText(),
      cardAgain: (() => { I.press(); I.step(1 / 60, 5); return I.choiceOpen(); })(),
    };
    out.opening = o;
  }

  /* ---- 8. LIFE (Session 17) ---------------------------------------- */
  /* The four multipliers, asserted where a tool can: the weather is a
   * pure function of the day and the hour and the shipped page is calm
   * at both protected hours; the bull lies down at dusk and gets up for
   * a walker inside twelve units; the lamps come on as the lamplighter
   * reaches them and not before; the dog is a companion — it falls in
   * on the east road and STOPS AT THE DOWNS' EDGE on both roads out;
   * every land has its unnamed, and the counts are the brief's. */
  {
    const L = {};
    // the last press left Nell's note open, and an open note freezes the walker
    if (document.querySelector('.note-veil.show')) { I.press(); I.step(1 / 60, 5); }
    I.setWeather(null);
    I.setDay(0);
    const wx = (h) => { I.setHour(h, false); I.weather.tick(); const w = I.weather.state; return { rain: w.rain, wind: w.wind, fog: w.fog, k: I.weather.windK }; };
    L.calmNoon = wx(12);
    L.calmDusk = wx(19.6);
    L.shower = wx(14.9);
    I.setDay(1);
    L.dayTwoFog = wx(6.0);
    L.dayTwoStorm = wx(23.4);
    I.setDay(0);
    // the bull, at night
    const C = I.common;
    C.reset();
    I.setHour(22, false);
    I.events.resync();
    I.goto(-40, 100);
    settle(3);
    L.bullNight = { state: C.bull.state, on: I.events.progress('the-bull-lies-down') };
    I.goto(30, 74);   // inside twelve units of where it lies (33, 70)
    settle(0.5);
    L.bullWoken = C.bull.state;
    I.goto(-40, 100);
    C.reset();
    I.setHour(12, false);
    I.events.resync();
    settle(3);
    L.bullDay = C.bull.state;
    // the lamps, off the lamplighter
    const lamps = (h) => {
      I.setHour(h, false);
      I.events.resync();
      I.goto(-45, -82);
      settle(0.5);
      const r = I.life.drawn().find((d) => d.id === 'the-lamplighter');
      return { out: r?.present, lit: I.lampsLit ? I.lampsLit() : null, lamp: I.clock.state.lamp };
    };
    L.lampsAtQuarterPast = lamps(19.12);
    L.lampsAtDusk = lamps(19.9);
    L.lampsAtNoon = lamps(12);
    // the dog
    I.setHour(12, false);
    I.events.resync();
    // read fresh each time: a report is a snapshot
    const dogNow = () => I.life.drawn().find((d) => d.id === 'the-downs-dog');
    I.goto(104, 45);
    settle(0.5);
    I.drive(-1, 0, 0);
    settle(2.5);
    I.release();
    settle(0.5);
    L.dogFollows = (() => { const dog = dogNow(); return { d: +Math.hypot(dog.x - I.char.pos.x, dog.z - I.char.pos.z).toFixed(1), pose: dog.pose }; })();
    I.goto(90, 46);
    settle(0.5);
    I.drive(-1, 0, 1);
    settle(9);
    I.release();
    settle(1.5);
    L.dogWest = (() => { const dog = dogNow(); return { walkerX: +I.char.pos.x.toFixed(1), dogX: +dog.x.toFixed(2), minX: 60, pose: dog.pose }; })();
    // and the other way, to the Flats' border — the dog put on the east
    // road past the bridge the way the goat is put on the Common's, and
    // the walker driven out: the rule is tested at the border
    const dog = I.company.dog;
    dog.x = 196; dog.z = 15; dog.following = true; dog.atBorder = false;
    I.goto(200, 14);
    settle(0.5);
    I.drive(1, -0.12, 1);
    settle(9);
    I.release();
    settle(1.5);
    L.dogEast = (() => { const dog = dogNow(); return { walkerX: +I.char.pos.x.toFixed(1), dogX: +dog.x.toFixed(2), maxX: 230, pose: dog.pose }; })();
    // the unnamed, counted per land off the routines registered
    const counts = {};
    for (const rt of I.life.routines) counts[rt.land] = (counts[rt.land] ?? 0) + 1;
    L.routines = counts;
    // Joan's day and the mile's lights are on events now
    L.joanNoon = I.events.between('joan-out', 'joan-in', 12);
    L.joanNight = I.events.between('joan-out', 'joan-in', 2);
    L.mileDusk = I.events.between('the-mile-lights', 'the-mile-dark', 19.6);
    L.mileNoon = I.events.between('the-mile-lights', 'the-mile-dark', 12);
    L.regattaNoon = I.events.progress('the-regatta', 12.5);
    L.regattaTea = I.events.progress('the-regatta', 16);
    L.amosNight = (() => { const r = I.life.routines.find((x) => x.id === 'amos-night'); return r ? I.life.routineAt(r, 23).present && !I.life.routineAt(r, 12).present : null; })();
    out.life = L;
  }

  /* ---- 9. THE ROADS (Session 18) ----------------------------------- */
  /* The law around the roads, asserted where a tool can: the bicycle is
   * a thing and stops at its border with the walker still on it; the
   * bell is the key on the move and the land answers it; the plane
   * glides from height and lands inside its land; the 8:15 is a
   * registered event and the second run is a train, not an ending;
   * the dawn dog stops at a line that is not a border; the hat stops at
   * one that is; forty-five districts, none overlapping; and earshot is
   * a pure function the tool can ask. */
  {
    const R = {};
    I.setWeather('clear');
    I.setDay(0);
    I.setHour(12, false);
    I.events.resync();
    I.standUp();
    // THE BICYCLE STOPS AT THE BORDER, and the walker on it
    I.putBicycle(-45, 128);
    at(-45, 130);
    settle(0.6);
    R.bikePrompt = I.promptText();
    I.press();
    settle(0.3);
    R.aboard = I.bicycle.aboard;
    I.drive(0, -1, 1);
    settle(6);
    R.bikeHeld = { walkerZ: +I.char.pos.z.toFixed(2), bikeZ: +I.bicycle.pos.y.toFixed(2), region: I.region(), minZ: 120 };
    I.release();
    settle(0.8);
    R.stoppedPrompt = I.promptText();
    I.press();     // off
    settle(0.5);
    R.offBike = { aboard: I.bicycle.aboard, walkerZ: +I.char.pos.z.toFixed(2) };
    I.drive(0, -1, 0);
    settle(2.5);
    I.release();
    R.walkerCrossed = { region: I.region(), bikeZ: +I.bicycle.pos.y.toFixed(2) };
    // THE BELL, and the cat sits up for it
    I.putBicycle(-90, 150);
    at(-90, 152);
    settle(0.6);
    I.press();
    settle(0.3);
    I.drive(1, 0, 0);
    settle(1.0);
    R.movingPrompt = I.promptText();
    const catBefore = I.life.drawn().find((d) => d.id === 'the-fence-cat')?.pose;
    I.press();
    settle(0.6);
    I.release();
    R.bell = { catBefore, catAfter: I.life.drawn().find((d) => d.id === 'the-fence-cat')?.pose };
    // FASTER THAN A WALK on the flat
    I.putBicycle(-30, 202);
    I.stepOff();
    at(-30, 204);
    settle(0.6);
    I.press();
    settle(0.3);
    const x0 = I.char.pos.x;
    I.drive(1, 0, 0);
    settle(3);
    I.release();
    R.bikeSpeed = +((I.char.pos.x - x0) / 3).toFixed(2);
    I.stepOff();
    // THE PLANE glides off the overlook and lands in its land
    at(278.5, -167.5);
    settle(0.6);
    R.planePrompt = I.promptText();
    I.press();
    settle(0.3);
    R.planeHeld = I.holding();
    // back off the lip and run at it: the throw is pressed on the move,
    // before the steep stops the walker two units short of the edge
    I.goto(274, -167.5);
    settle(0.3);
    I.drive(1, 0, 1);
    settle(0.7);
    I.press();       // thrown, moving east, off the lip
    settle(0.2);
    I.release();
    const plane = I.things.get('paper-plane');
    R.planeFlying = plane.state;
    settle(12);
    R.planeLanded = { state: plane.state, x: +plane.x.toFixed(1), z: +plane.z.toFixed(1), from: 278.5, maxX: plane.rect.maxX, blocked: I.terrain.blockedAt(plane.x, plane.z) };
    if (document.querySelector('.note-veil.show')) { I.press(); I.step(1 / 60, 5); }
    // and SET DOWN by a standing walker it is set down at the feet
    at(plane.x - 1.5, plane.z);
    settle(0.6);
    I.press();
    settle(0.3);
    const px0 = I.char.pos.x;
    I.press();
    settle(3);
    R.planeSetDown = { state: plane.state, d: +Math.hypot(plane.x - px0, plane.z - I.char.pos.z).toFixed(2) };
    if (document.querySelector('.note-veil.show')) { I.press(); I.step(1 / 60, 5); }
    // THE 8:15 is an event, and the second run is a train
    R.eventRegistered = I.events.all.some((e) => e.id === 'the-8-15' && Math.abs(e.at - 8.25) < 1e-6);
    for (const id of Object.values(I.waitAnswers)) I.learn(id);
    I.learn('route:the-line');
    R.qualified = I.knowledge.answeredWaits() >= 6 && I.knowledge.has('route:the-line');
    I.hideTrain();
    I.parkTrain();
    I.setHour(8.2, false);
    I.events.resync();
    at(252, 210);
    settle(0.3);
    I.setHour(8.3, false);
    settle(0.5);
    R.firstRun = { phase: I.train.phase, ending: I.train.ending };
    I.parkTrain();
    I.learn('fact:the-8-15-ran');
    I.setHour(8.2, false);
    settle(0.3);
    I.setHour(8.3, false);
    settle(0.5);
    R.secondRun = { phase: I.train.phase, ending: I.train.ending };
    I.hideTrain();
    I.setHour(12, false);
    I.events.resync();
    // THE DAWN DOG stops at a line that is not a border
    I.setHour(6.0, false);
    I.events.resync();
    at(-118, 64);
    settle(1.5);
    I.drive(1, 0, 0);
    settle(4);
    I.release();
    const dawn = () => I.life.drawn().find((d) => d.id === 'the-dawn-dog');
    R.dawnDogFollows = (() => { const d = dawn(); return d ? { visible: d.visible, d: +Math.hypot(d.x - I.char.pos.x, d.z - I.char.pos.z).toFixed(1) } : null; })();
    at(-40, 60);
    settle(0.3);
    I.drive(1, 0, 1);
    settle(6);
    I.release();
    settle(1);
    R.dawnDogStops = (() => { const d = dawn(); return d ? { dogX: +d.x.toFixed(2), walkerX: +I.char.pos.x.toFixed(1), pose: d.pose, line: -28 } : null; })();
    I.setHour(12, false);
    I.events.resync();
    // THE HAT stops at the Common's border
    at(-190, 60);
    I.setHour(11.45, false);
    I.events.resync();
    settle(0.5);
    const hatMid = I.life.drawn().find((d) => d.id === 'the-hat');
    I.setHour(11.6, false);
    settle(0.5);
    const hatEnd = I.life.drawn().find((d) => d.id === 'the-hat');
    R.hat = { midX: +hatMid.x.toFixed(1), endX: +hatEnd.x.toFixed(1), border: -150 };
    I.setHour(12, false);
    // DISTRICTS: forty-five, none overlapping, every land has some
    const D = I.layout.DISTRICTS;
    let overlaps = 0;
    for (let a = 0; a < D.length; a++) for (let b = a + 1; b < D.length; b++) {
      const p = D[a].rect, q = D[b].rect;
      if (p.minX < q.maxX && q.minX < p.maxX && p.minZ < q.maxZ && q.minZ < p.maxZ) overlaps++;
    }
    const perLand = {};
    for (const d of D) perLand[d.land] = (perLand[d.land] ?? 0) + 1;
    R.districts = { n: D.length, overlaps, lands: Object.keys(perLand).length, min: Math.min(...Object.values(perLand)) };
    // EARSHOT is pure
    R.earshot = {
      well: I.earshot(-57, 45, 12).map((h) => h.id),
      crossroads: I.earshot(-45, 58, 12).map((h) => h.id),
      brack: I.earshot(150, -153, 12).map((h) => h.id),
      funeralNoon: I.earshot(150, 60, 12).map((h) => h.id),
      funeralThree: I.earshot(150, 60, 15.3).map((h) => h.id),
    };
    // A DRAWING IS A BARRIER (the local QA pass, 2026-09-04, B2): the
    // buildings refuse a foot, and no barrier stands across a road or on
    // a place the walker is put
    {
      const B = I.barriers.all;
      R.solids = { n: I.world.solidCount, barriers: B.length };
      const onRoad = [];
      for (const road of I.layout.ROADS) {
        for (let i = 0; i < road.pts.length - 1; i++) {
          const [ax, az] = road.pts[i];
          const [bx, bz] = road.pts[i + 1];
          const n = Math.max(1, Math.ceil(Math.hypot(bx - ax, bz - az) / 0.6));
          for (let k = 0; k <= n; k++) {
            const x = ax + (bx - ax) * (k / n);
            const z = az + (bz - az) * (k / n);
            if (I.barriers.blocks(x, z) && !B.some((b) => b.id.endsWith(':keep') && Math.hypot(x - (b.x0 + b.x1) / 2, z - (b.z0 + b.z1) / 2) < 6)) { onRoad.push([+x.toFixed(1), +z.toFixed(1)]); break; }
          }
        }
      }
      R.solids.onRoad = onRoad;
      const spots = [[24, 82], [-45, 58], [-60, 149], [-206, 205.5]];
      R.solids.onSpots = spots.filter(([x, z]) => I.barriers.blocks(x, z));
      // the walls refuse: driven north into Brim's town wall off the road, and into the keep
      // driven at a drawing, the walker stops, and the next stride is a barrier
      const into = (x, z, mx, mz, frames) => {
        at(x, z); I.drive(mx, mz, 0); I.step(1 / 60, frames); I.release();
        const px = I.char.pos.x, pz = I.char.pos.z;
        return { moved: +Math.hypot(px - x, pz - z).toFixed(1), free: +(frames / 60 * 4.1).toFixed(1), wall: I.barriers.blocks(px + mx * 1.0, pz + mz * 1.0) };
      };
      R.solids.brimWall = into(-30, -8, 0, -1, 300);
      R.solids.keep = into(-45, -244, 0, -1, 200);
      R.solids.house = into(-70, 160, 0, -1, 200);   // the house at (−70, 152)
      R.solids.gateway = into(-45, -6, 0, -1, 300);
    }
    // THE ENCOUNTERS are registered
    const rids = new Set(I.life.routines.map((r) => r.id));
    const eids = new Set(I.events.all.map((e) => e.id));
    R.encounters = {
      routines: ['the-wheelwright', 'the-dusk-walker', 'the-ladder-front', 'the-ladder-back-home', 'the-tideline-comber-0', 'the-fire-folk-1', 'the-funeral-3'].filter((id) => !rids.has(id)),
      events: ['the-fire', 'the-hat-2', 'the-cove-light', 'the-felled-pine', 'the-tarn-rings', 'the-road-flock', 'the-dawn-dog', 'the-8-15'].filter((id) => !eids.has(id)),
    };
    out.roads = R;
  }

  return out;
});

/* ---- 10. THE NEW CAST, WEST AND NORTH (Session 19), ON A FRESH PAGE ---- *
 * Section 9 learns every wait's answer and section 6 takes the king's
 * door, and both are knowledge for the rest of the page; the cast's
 * doors have to be taken by a walker who has not. */
// 'load', not 'networkidle': a page that has been begun and driven for
// nine sections keeps the sandbox busy enough that idle never comes
// inside the default thirty seconds, and the title veil is the signal
// that matters anyway.
await page.reload({ waitUntil: 'load', timeout: 120000 });
await page.waitForSelector('.title-veil:not(.gone)', { timeout: 60000 }).catch(() => {});
r.cast = await page.evaluate(() => {
  const I = window.__inklands;
  I.setHour(12, false);
  I.begin();
  I.setBearing(true);
  const at = (x, z) => { I.goto(x, z); I.setTime(0); I.step(1 / 60, 120); };
  const settle = (secs) => I.step(1 / 60, Math.round(secs * 60));
  /* NOBODY CROSSES A BORDER BUT THE WALKER, and the Vikings are the joke
   * about it: the longship's position is sampled at every hour of its
   * day and never once east of the ocean's edge. The horn is answered.
   * The board is racked. The three waits have two doors each and the
   * doors are knowledge. The portcullis drops. The moat is red on the
   * days it is red and not on the others; the deep keeps its days and
   * the seals keep theirs; the shape is drawn and gone; the stone skips. */
  {
    const N = {};
    const life = (id) => I.life.drawn().find((d) => d.id === id);
    // the longship, all day: a thing on the ocean's page
    let eastmost = -1e9;
    let seenRowing = false;
    let seenBeached = false;
    at(-240, -20);
    for (let hh = 0; hh < 24; hh += 0.25) {
      I.setHour(hh, false);
      I.events.resync();
      settle(0.2);
      const s = life('the-longship');
      if (!s) continue;
      eastmost = Math.max(eastmost, s.x);
      if (s.pose === 1) seenRowing = true;
      if (s.pose === 0) seenBeached = true;
    }
    N.longship = { eastmost: +eastmost.toFixed(1), border: -250, seenRowing, seenBeached };
    // it roars at the sand, and not at the water
    I.setHour(10, false);
    I.events.resync();
    at(-244, -24);
    N.roared = false;
    for (let f = 0; f < 60 * 22 && !N.roared; f++) { I.step(1 / 60, 1); if (life('the-longship')?.pose === 2) N.roared = true; }
    // the horn is answered a beat and a half later
    I.setHour(15, false);
    at(-233, -73.5);
    settle(0.5);
    N.hornPrompt = I.promptText();
    I.press();
    N.horn = { answered: false, at: -1 };
    for (let f = 0; f < 60 * 4; f++) { I.step(1 / 60, 1); if (life('the-longship')?.pose === 2) { N.horn.answered = true; N.horn.at = +(f / 60).toFixed(2); break; } }
    // the surfers keep their hours
    const rids = new Set(I.life.routines.map((r) => r.id));
    N.surfers = ['the-surfer-0', 'the-surfer-1', 'the-surfer-0-evening', 'pye', 'wren', 'wren-afternoon', 'wick', 'wick-evening'].filter((id) => !rids.has(id));
    I.setHour(6.25, false);
    I.events.resync();
    at(-228, -26);
    settle(1);
    N.surferOut = life('the-surfer-0');
    I.setHour(12, false);
    I.events.resync();
    // the board: picked up on the wrack, set down at the rack, racked
    const board = I.things.get('the-board');
    at(board.x, board.z + 1.6);
    settle(0.5);
    N.boardPrompt = I.promptText();
    I.press();
    settle(0.3);
    N.boardHeld = I.holding();
    at(-209.5, -33);
    settle(0.3);
    N.boardPutPrompt = I.promptText();
    I.press();
    settle(2.5);
    N.boardRacked = { racked: I.knowledge.has('fact:the-board-racked'), held: I.holding(), x: +board.x.toFixed(1), z: +board.z.toFixed(1) };
    // Pye: a note without the name, a card with it, and door one answers
    at(-216.4, -128.2);
    settle(0.5);
    N.pyeBefore = { prompt: I.promptText(), card: (() => { I.press(); I.step(1 / 60, 5); const c = I.choiceOpen(); if (document.querySelector('.note-veil.show')) { I.press(); I.step(1 / 60, 5); } return c; })() };
    I.learn('name:the-mark');
    settle(0.3);
    N.pyePrompt = I.promptText();
    I.press();
    I.step(1 / 60, 5);
    N.pyeCard = { open: I.choiceOpen(), doors: [...document.querySelectorAll('.choice-btn')].map((b) => b.getAttribute('aria-label')) };
    I.choose(0);
    settle(1.5);
    N.pyeDoor = { eighth: I.knowledge.has('door:the-eighth-pot'), hauled: I.knowledge.has('door:the-pots-hauled'), answered: I.knowledge.answered('beach') };
    // Wren: the bar's route opens the card; door two finishes the fleet
    I.learn('route:the-bar');
    at(-266.5, 71);
    settle(0.5);
    N.wrenPrompt = I.promptText();
    I.press();
    I.step(1 / 60, 5);
    N.wrenCard = { open: I.choiceOpen(), doors: [...document.querySelectorAll('.choice-btn')].map((b) => b.getAttribute('aria-label')) };
    I.choose(1);
    settle(1.5);
    N.wrenDoor = { second: I.knowledge.has('door:the-second-mark'), finished: I.knowledge.has('door:the-fleet-finished'), answered: I.knowledge.answered('ocean') };
    I.setHour(12.5, false);
    I.events.resync();
    at(-262, 2);
    settle(2);
    N.fleetStill = (() => { const a = I.life.drawn().find((d) => d.id === 'wren-rowing'); return { wrenRowing: a?.visible ?? null }; })();
    // Wick: the fifth banner goes up for Brim's red on the avenue
    I.setHour(12, false);
    I.events.resync();
    at(-45, -186);
    settle(0.5);
    N.fifthBefore = I.knowledge.has('reason:the-fifth-banner');
    I.learn('fact:brim-red');
    settle(0.5);
    N.fifth = { after: I.knowledge.has('reason:the-fifth-banner'), answered: I.knowledge.answered('castle') };
    I.setHour(5.85, false);
    I.events.resync();
    settle(1);
    N.wickResting = life('wick');
    I.setHour(12, false);
    I.events.resync();
    // the portcullis: a touch, and it is lower a third of a second later
    at(-45, -189.5);
    settle(0.5);
    N.portcullisPrompt = I.promptText();
    const pcY = () => I.scene.children.flatMap((g) => g.children ?? []).find((m) => m.geometry?.parameters?.width === 3.3 && m.geometry?.parameters?.height === 4.4)?.position.y ?? null;
    const y0 = pcY();
    I.press();
    settle(0.5);
    N.portcullis = { y0, y1: pcY() };
    // the moat is red on day one and not on day zero; the deep and the seals keep their days
    I.setDay(0);
    I.setHour(12, false);
    N.moat = { day0: I.moatRed?.(0) ?? null, day1: I.moatRed?.(1) ?? null, day3: I.moatRed?.(3) ?? null };
    at(-286, 34);
    settle(1);
    N.sealsDay0 = life('the-seals-0')?.visible ?? null;
    I.setDay(1);
    settle(1);
    N.sealsDay1 = life('the-seals-0')?.visible ?? null;
    I.setDay(0);
    I.setHour(19.4, false);
    I.events.resync();
    settle(0.5);
    N.deepDay0 = life('the-deep')?.visible ?? null;
    I.setDay(1);
    settle(0.5);
    N.deepDay1 = life('the-deep')?.visible ?? null;
    I.setDay(0);
    // the shape: drawn once, after a while, at night, and gone
    I.setHour(23, false);
    I.events.resync();
    at(190, -250);
    I.setTime(500);
    let shown = false;
    let gone = false;
    for (let f = 0; f < 60 * 16; f++) {
      I.step(1 / 60, 1);
      const sh = life('the-pines-shape');
      if (sh?.visible) shown = true;
      if (shown && sh && !sh.visible) { gone = true; break; }
    }
    N.shape = { shown, gone };
    I.setHour(12, false);
    I.events.resync();
    // the stone skips off the bar
    const stone = I.things.get('bar-stone');
    at(stone.x, stone.z + 1.6);
    settle(0.5);
    N.stonePrompt = I.promptText();
    I.press();
    settle(0.3);
    at(-282, 48);
    I.drive(-1, 0, 1);
    settle(0.7);
    I.press();
    settle(0.1);
    I.release();
    settle(4);
    N.skim = { skips: stone.skips, state: stone.state, water: I.terrain.waterAt(stone.x, stone.z) > 0.12 };
    N.waits = I.knowledge.answeredWaits();
    return N;
  }
});

console.log('\nthe walk does not get worse:');
if (r.wellPrompt === 'SHOUT DOWN THE WELL') pass(`the well says ${r.wellPrompt}`); else fail(`the well says "${r.wellPrompt}"`);
if (r.signPrompt === 'READ THE SIGNPOST') pass(`the signpost still says ${r.signPrompt}`); else fail(`the signpost says "${r.signPrompt}"`);
if (r.kingPrompt === 'SET YOUR SHOULDER TO HIM') pass(`the king says ${r.kingPrompt}`); else fail(`the king says "${r.kingPrompt}"`);

console.log('\nnobody crosses a border but the walker:');
if (r.cart.x < r.cart.maxX && r.cart.far < r.cart.maxX) {
  pass(`the cart stops at the Common's east edge — x ${r.cart.x.toFixed(1)} against a border at ${r.cart.maxX} (furthest ${r.cart.far.toFixed(1)})`);
} else fail(`THE CART CROSSED: x ${r.cart.x.toFixed(1)} against a border at ${r.cart.maxX}`);
if (r.cart.far > r.cart.maxX - 4) pass(`and it actually reached it: ${r.cart.far.toFixed(1)} after fifteen shoves`);
else fail(`the cart barely moved: ${r.cart.far.toFixed(1)} after fifteen shoves east`);
if (r.refused.moved < 0.01 && r.refused.rocked > 0.01 && r.refused.back < 1e-6) {
  pass(`a refused shove is SEEN: the cart rocks ${r.refused.rocked.toFixed(3)} rad, moves 0, and returns to exactly rest`);
} else fail(`a refused shove: moved ${r.refused.moved.toFixed(2)}, rocked ${r.refused.rocked.toFixed(3)}, back ${r.refused.back}`);
if (r.stone.z < r.stone.maxZ && r.stone.state === 'ground') {
  pass(`the stone thrown south at the border lands inside it — z ${r.stone.z.toFixed(1)} against ${r.stone.maxZ}`);
} else fail(`THE STONE LEFT THE COMMON: z ${r.stone.z.toFixed(1)} against ${r.stone.maxZ} (${r.stone.state})`);

console.log('\none thing in hand:');
if (r.stonePrompt === 'PICK UP THE STONE') pass(`the stone says ${r.stonePrompt}`); else fail(`the stone says "${r.stonePrompt}"`);
if (r.heldAfterPickup === 'fist-stone') pass('picked up: the hand holds the stone'); else fail(`after picking up, the hand holds ${r.heldAfterPickup}`);
if (/^(PUT DOWN|THROW) THE STONE$/.test(r.promptWhileHeld ?? '')) pass(`held, the prompt says ${r.promptWhileHeld}`); else fail(`held, the prompt says "${r.promptWhileHeld}"`);
if (r.heldAfterThrow === null) pass('thrown: the hand is empty'); else fail(`after the throw the hand holds ${r.heldAfterThrow}`);
if (r.wellStone.state === 'gone' && r.wellStone.held === null) pass('down the well: the stone is gone and the hand is empty');
else fail(`down the well: state ${r.wellStone.state}, hand ${r.wellStone.held}`);
if (r.wellStoneMorning.state === 'ground' && Math.abs(r.wellStoneMorning.x - r.wellStoneMorning.home.x) < 0.01) {
  pass(`and the morning puts it back by the gate (${r.wellStoneMorning.x}, ${r.wellStoneMorning.z})`);
} else fail(`the morning did not put it back: ${JSON.stringify(r.wellStoneMorning)}`);

console.log('\nsitting is a stopped walker:');
if (r.swingPrompt === 'SIT IN THE SWING') pass(`the swing says ${r.swingPrompt}`); else fail(`the swing says "${r.swingPrompt}"`);
if (r.seated) pass('the key sits the walker down'); else fail('the key did not sit the walker down');
const worstYaw = Math.max(...r.seatBearing.map((b) => Math.abs(b.yaw)));
const worstAstern = Math.max(...r.seatBearing.map((b) => b.astern));
const backs = r.seatBearing.map((b) => b.back);
const dolly = Math.max(...backs) - Math.min(...backs);
if (worstYaw === 0 && worstAstern === 0) pass('seated, the bearing is EXACTLY zero for five game seconds');
else fail(`seated, the bearing drifts: yaw ${worstYaw}, astern ${worstAstern}`);
if (dolly < 0.5) pass(`seated, the rig does not dolly (${dolly.toFixed(3)} units over five seconds)`);
else fail(`seated, the rig dollies ${dolly.toFixed(2)} units`);
if (r.seatPrompt === 'STAND UP') pass(`seated, the prompt says ${r.seatPrompt}`); else fail(`seated, the prompt says "${r.seatPrompt}"`);
if (r.seatHours > 0.5) pass(`seated, time passes: ${r.seatHours.toFixed(2)} hours in ten seconds`);
else fail(`seated, the clock barely moved: ${r.seatHours.toFixed(3)} hours in ten seconds`);
if (r.stoodUp) pass('a step stands you up'); else fail('a step did not stand the walker up');

console.log('\nthe drove keeps its own hours:');
const d = r.drove;
console.log(`    04:00 ${d.four.n} sheep, mean z ${d.four.z}   06:12 ${d.six.n} sheep, mean z ${d.six.z} (spread ${d.six.spread})   12:00 ${d.noon.n} sheep, mean z ${d.noon.z}`);
if (d.four.n === 13 && d.six.n === 13 && d.noon.n === 13) pass('thirteen sheep at every hour');
else fail(`the flock is not thirteen: ${d.four.n} / ${d.six.n} / ${d.noon.n}`);
if (d.four.z > 104) pass('at four they are in the fold at the lane\'s south end'); else fail(`at four the flock is at z ${d.four.z}, not the fold`);
if (d.six.spread > 18 && d.six.z < d.four.z && d.six.z > d.noon.z) pass('at a quarter past six they are strung out along the lane, walking');
else fail(`at a quarter past six the flock is not on the lane: mean ${d.six.z}, spread ${d.six.spread}`);
if (d.noon.z < 78) pass('at noon they are in the field, north of the mouth gate'); else fail(`at noon the flock is at z ${d.noon.z}, not the field`);
if (d.happeningAtSix >= 0 && d.happeningAtNoon < 0) pass(`events.progress reads ${d.happeningAtSix.toFixed(2)} at six and −1 at noon`);
else fail(`events.progress: ${d.happeningAtSix} at six, ${d.happeningAtNoon} at noon`);

console.log('\na door is knowledge:');
if (r.cardOpen && r.cardDoors.length === 2) pass(`the card opens with two doors: ${r.cardDoors.join(' / ')}`);
else fail(`the card: open ${r.cardOpen}, doors ${JSON.stringify(r.cardDoors)}`);
if (r.door.restored && !r.door.left) pass('the first door writes door:the-king-restored and nothing else');
else fail(`doors after choosing: restored ${r.door.restored}, left ${r.door.left}`);
if (r.door.oldName) pass('and reading the card read the plinth (fact:the-old-name)'); else fail('the plinth was not read');
if (r.door.promptAfter === 'READ THE PLINTH' && !r.door.cardAgain) pass(`after the door the plinth says ${r.door.promptAfter} and the card is never offered again`);
else fail(`after the door: prompt "${r.door.promptAfter}", card again ${r.door.cardAgain}`);

console.log('\nthe first hour:');
{
  const o = r.opening;
  if (o.wake.bull === 'watch') pass('you wake and the bull is already looking at you'); else fail(`at the wake the bull is ${o.wake.bull}`);
  if (o.afterStanding === 'charge' || o.afterStanding === 'balk') pass(`stand still and it comes anyway (${o.afterStanding})`); else fail(`after 1.6s standing the bull is ${o.afterStanding}`);
  if (!o.chase.touched && o.chase.nearest > 1.5) pass(`it never touches you: nearest ${o.chase.nearest} units`); else fail(`THE BULL TOUCHED THE WALKER: nearest ${o.chase.nearest}`);
  if (o.chase.slamAt > 0 && o.chase.slamAt < 9) pass(`Nell shuts the gate at ${o.chase.slamAt}s, and the walker is through (x ${o.chase.walker.x})`); else fail(`the gate: slam at ${o.chase.slamAt}, walker at x ${o.chase.walker.x}`);
  if (o.chase.walker.x < -12) pass('the walker is west of the hedge'); else fail(`the walker never got through: x ${o.chase.walker.x}`);
  {
    const w = o.dueWest;
    if (!w.shutInField && w.walkerX < -12 && !w.stuck) pass(`RUN DUE WEST, as the hint says: the gate shuts at ${w.shutAt}s with the walker already through (x ${w.walkerX}, z ${w.walkerZ})`);
    else fail(`THE DUE-WEST RUN IS TRAPPED: gate shut in the field ${w.shutInField} at ${w.shutAt}s, walker at (${w.walkerX}, ${w.walkerZ}), stuck ${w.stuck}`);
    if (w.nearest > 1.5) pass(`and the bull never touches them on that run either: nearest ${w.nearest}`); else fail(`the bull touched the due-west runner: ${w.nearest}`);
    if (w.inFrame >= 0.7) pass(`and the charge is IN THE PICTURE on this rig for ${Math.round(w.inFrame * 100)}% of its ${w.chasingFrames} frames`);
    else fail(`the charge is off the frame: in the picture for only ${Math.round(w.inFrame * 100)}% of ${w.chasingFrames} frames`);
    if (w.bull.x > -12 && w.bull.x < -6) pass(`and it stops at the hedge: x ${w.bull.x} (${w.bull.state})`); else fail(`after the due-west run the bull is at x ${w.bull.x} (${w.bull.state})`);
  }
  if (o.bullAtFence.x > -12 && o.bullAtFence.x < -8 && (o.bullAtFence.state === 'fence' || o.bullAtFence.state === 'balk' || o.bullAtFence.state === 'home')) {
    pass(`and the bull stops at the hedge: x ${o.bullAtFence.x} against the hedge at −12 (${o.bullAtFence.state})`);
  } else fail(`the bull at the hedge: x ${o.bullAtFence.x}, ${o.bullAtFence.state}`);
  if (o.nell === 1 || o.nell === 2) pass(`Nell is off the gate (pose ${o.nell})`); else fail(`Nell's pose after the slam: ${o.nell}`);
  if (o.wake.taughtRun === false && o.taughtByTheBull) pass('the run is taught by the bull: told once, at the charge'); else fail(`the run: taught before ${o.wake.taughtRun}, taught by the bull ${o.taughtByTheBull}`);
  if (o.fenceHolds.z < 64.2) pass(`the fence refuses a foot: driven south at x 20 the walker stops at z ${o.fenceHolds.z}`); else fail(`THE WALKER WALKED THROUGH THE FENCE: z ${o.fenceHolds.z}`);
  if (o.stilePasses.z > 66) pass(`and the stile lets one over: z ${o.stilePasses.z}`); else fail(`the stile does not pass: z ${o.stilePasses.z}`);
  if (o.goatFollows.following && o.goatFollows.d < 8) pass(`the goat falls in: ${o.goatFollows.d} units behind`); else fail(`the goat: following ${o.goatFollows.following}, ${o.goatFollows.d} behind`);
  if (o.goatNorth.goatZ >= o.goatNorth.minZ && o.goatNorth.walkerZ < o.goatNorth.minZ && o.goatNorth.goatZ < o.goatNorth.minZ + 3) {
    pass(`and stops dead at the Brim gate: goat z ${o.goatNorth.goatZ} against a border at ${o.goatNorth.minZ}, walker at ${o.goatNorth.walkerZ}`);
  } else fail(`THE GOAT AT THE NORTH BORDER: goat z ${o.goatNorth.goatZ}, border ${o.goatNorth.minZ}, walker ${o.goatNorth.walkerZ}`);
  if (o.goatEast.goatX <= o.goatEast.maxX && o.goatEast.walkerX > o.goatEast.maxX && o.goatEast.goatX > o.goatEast.maxX - 3) {
    pass(`and at the east edge on the other road: goat x ${o.goatEast.goatX} against ${o.goatEast.maxX}, walker at ${o.goatEast.walkerX}`);
  } else fail(`THE GOAT AT THE EAST BORDER: goat x ${o.goatEast.goatX}, border ${o.goatEast.maxX}, walker ${o.goatEast.walkerX}`);
  if (o.nellPromptBefore === 'LEAN ON THE GATE WITH HER' && !o.nellCardBefore && o.nellNoteBefore) pass(`without the fourth name Nell is a note: ${o.nellPromptBefore}`);
  else fail(`Nell before: "${o.nellPromptBefore}", card ${o.nellCardBefore}, note ${o.nellNoteBefore}`);
  if (o.nellPromptWithName === 'TELL HER THE FOURTH NAME' && o.nellCard.open && o.nellCard.doors.length === 2) pass(`with it she is a card with two doors: ${o.nellCard.doors.join(' / ')}`);
  else fail(`Nell with the name: "${o.nellPromptWithName}", card ${JSON.stringify(o.nellCard)}`);
  if (o.doorOne.turned && o.doorOne.answered && o.doorOne.cartHome) pass('door one: the cart is loaded and turned north at home, and the wait is answered');
  else fail(`door one: ${JSON.stringify(o.doorOne)}`);
  if (o.doorOne.promptAfter === 'LEAN ON THE GATE WITH HER' && !o.doorOne.cardAgain) pass('and the card is never offered again'); else fail(`after the door: "${o.doorOne.promptAfter}", card again ${o.doorOne.cardAgain}`);
}

console.log('\nlife (Session 17):');
{
  const L = r.life;
  const calm = (w) => w.rain === 0 && w.fog === 0 && Math.abs(w.k - 1) < 1e-9;
  if (calm(L.calmNoon) && calm(L.calmDusk)) pass('day zero is the shipped page at noon and at 19.6: no rain, no fog, the wind exactly at the fields\' own sway');
  else fail(`day zero is not calm at the protected hours: ${JSON.stringify(L.calmNoon)} / ${JSON.stringify(L.calmDusk)}`);
  if (L.shower.rain > 0.5) pass(`and it rains at ten to three on the first afternoon (${L.shower.rain.toFixed(2)})`); else fail(`no shower on day zero: ${JSON.stringify(L.shower)}`);
  if (L.dayTwoFog.fog > 0.5 && L.dayTwoStorm.rain > 0.9 && L.dayTwoStorm.wind > 0.9) pass('day one has a fog at first light and a storm after dark');
  else fail(`day one: fog ${JSON.stringify(L.dayTwoFog)}, storm ${JSON.stringify(L.dayTwoStorm)}`);
  if (L.bullNight.state === 'lying' && L.bullNight.on >= 0) pass('the bull lies down at night (the-bull-lies-down is happening)'); else fail(`the bull at night: ${JSON.stringify(L.bullNight)}`);
  if (L.bullWoken !== 'lying') pass(`and gets up for a walker inside twelve units (${L.bullWoken})`); else fail('the bull stayed down with the walker on top of it');
  if (L.bullDay === 'graze') pass('and grazes by day'); else fail(`the bull by day: ${L.bullDay}`);
  if (L.lampsAtQuarterPast.out && L.lampsAtDusk.out === false && L.lampsAtNoon.out === false) pass('the lamplighter is out at ten past seven, in by ten to eight, and in at noon');
  else fail(`the lamplighter: ${JSON.stringify([L.lampsAtQuarterPast.out, L.lampsAtDusk.out, L.lampsAtNoon.out])}`);
  if (L.dogFollows.d < 8 && (L.dogFollows.pose === 1 || L.dogFollows.pose === 2 || L.dogFollows.pose === 0)) pass(`the dog falls in on the east road: ${L.dogFollows.d} units behind`); else fail(`the dog: ${JSON.stringify(L.dogFollows)}`);
  if (L.dogWest.dogX >= L.dogWest.minX && L.dogWest.dogX < L.dogWest.minX + 3 && L.dogWest.walkerX < L.dogWest.minX) {
    pass(`and stops dead at the Downs' west edge: dog x ${L.dogWest.dogX} against ${L.dogWest.minX}, walker at ${L.dogWest.walkerX}, sat looking after you (pose ${L.dogWest.pose})`);
  } else fail(`THE DOG AT THE WEST BORDER: ${JSON.stringify(L.dogWest)}`);
  if (L.dogEast.dogX <= L.dogEast.maxX && L.dogEast.dogX > L.dogEast.maxX - 3 && L.dogEast.walkerX > L.dogEast.maxX) {
    pass(`and at the east edge, over the bridge, on the road to the Flats: dog x ${L.dogEast.dogX} against ${L.dogEast.maxX}, walker at ${L.dogEast.walkerX}`);
  } else fail(`THE DOG AT THE EAST BORDER: ${JSON.stringify(L.dogEast)}`);
  const want = { meadow: 5, kingdom: 5, castle: 5, neighborhood: 5, forest: 4, canyon: 3, desert: 2, downs: 3, beach: 5, ocean: 2, city: 4, office: 5 };
  const short = Object.entries(want).filter(([land, n]) => (L.routines[land] ?? 0) < n);
  if (!short.length) pass(`every land has its unnamed on events.ts: ${Object.entries(L.routines).map(([l, n]) => `${l} ${n}`).join(', ')}`);
  else fail(`lands short of their routines: ${short.map(([l, n]) => `${l} ${L.routines[l] ?? 0}/${n}`).join(', ')}`);
  if (L.joanNoon === 1 && L.joanNight === 0) pass('Joan\'s working day reads off events.between'); else fail(`Joan on events: noon ${L.joanNoon}, night ${L.joanNight}`);
  if (L.mileDusk === 1 && L.mileNoon === 0) pass('the mile\'s lights read off events.between'); else fail(`the mile on events: dusk ${L.mileDusk}, noon ${L.mileNoon}`);
  if (L.regattaNoon >= 0 && L.regattaTea < 0) pass('the regatta is on at half past twelve and over by four'); else fail(`the regatta: ${L.regattaNoon} / ${L.regattaTea}`);
  if (L.amosNight === true) pass('Amos\'s night walk is a registered routine, out at eleven and in at noon'); else fail(`Amos on events: ${L.amosNight}`);
}

console.log('\nthe roads (Session 18):');
{
  const R = r.roads;
  if (R.bikePrompt === 'GET ON THE BICYCLE' && R.aboard) pass('the bicycle is a place you walk up to and get on'); else fail(`the bicycle's prompt: ${R.bikePrompt}, aboard ${R.aboard}`);
  if (R.bikeHeld.walkerZ >= R.bikeHeld.minZ && R.bikeHeld.region === 'neighborhood' && R.bikeHeld.bikeZ >= R.bikeHeld.minZ) {
    pass(`THE BICYCLE STOPS AT THE BORDER, with the walker on it: walker z ${R.bikeHeld.walkerZ} against ${R.bikeHeld.minZ}, still in ${R.bikeHeld.region}`);
  } else fail(`THE BICYCLE CROSSED: ${JSON.stringify(R.bikeHeld)}`);
  if (R.stoppedPrompt === 'GET OFF' && !R.offBike.aboard) pass('stopped, the key gets off'); else fail(`getting off: ${R.stoppedPrompt}, ${JSON.stringify(R.offBike)}`);
  if (R.walkerCrossed.region === 'meadow' && R.walkerCrossed.bikeZ >= 120) pass(`and the walker walks on into the Common while the bicycle stays at z ${R.walkerCrossed.bikeZ}`); else fail(`after getting off: ${JSON.stringify(R.walkerCrossed)}`);
  if (R.movingPrompt === 'RING THE BELL') pass('moving, the key is the bell'); else fail(`moving prompt: ${R.movingPrompt}`);
  if (R.bell.catAfter === 1) pass(`and the cat on Val's fence sits up for it (pose ${R.bell.catBefore} → ${R.bell.catAfter})`); else fail(`the bell went unanswered: ${JSON.stringify(R.bell)}`);
  if (R.bikeSpeed > 5.5) pass(`faster than a walk on the flat: ${R.bikeSpeed} u/s against 4.1`); else fail(`the bicycle is slow: ${R.bikeSpeed} u/s`);
  if (R.planePrompt === 'PICK UP THE PLANE' && R.planeHeld === 'paper-plane') pass('the plane is picked up at the overlook'); else fail(`the plane: ${R.planePrompt}, holding ${R.planeHeld}`);
  if (R.planeFlying === 'flying' && R.planeLanded.state === 'ground' && R.planeLanded.x - R.planeLanded.from > 18 && R.planeLanded.x < R.planeLanded.maxX && !R.planeLanded.blocked) {
    pass(`THROWN OFF THE LIP IT GLIDES THE CUT: from x ${R.planeLanded.from} to (${R.planeLanded.x}, ${R.planeLanded.z}), on ground a foot can stand on, inside Splitrock`);
  } else fail(`the plane: flying ${R.planeFlying}, landed ${JSON.stringify(R.planeLanded)}`);
  if (R.planeSetDown.state === 'ground' && R.planeSetDown.d < 3) pass(`and set down by a standing walker it is set down, ${R.planeSetDown.d} units away`); else fail(`the set-down glided: ${JSON.stringify(R.planeSetDown)}`);
  if (R.eventRegistered) pass('the 8:15 is a registered event at 8.25'); else fail('the-8-15 is not on events.ts');
  if (R.qualified && R.firstRun.phase === 'running' && R.firstRun.ending === true) pass('the first 8:15 after qualifying is THE ENDING'); else fail(`the first run: ${JSON.stringify(R.firstRun)}, qualified ${R.qualified}`);
  if (R.secondRun.phase === 'running' && R.secondRun.ending === false) pass('and once the ending is written down the next 8:15 is a train, every day'); else fail(`the second run: ${JSON.stringify(R.secondRun)}`);
  if (R.dawnDogFollows && R.dawnDogFollows.visible && R.dawnDogFollows.d < 8) pass(`the dawn dog falls in on the coast road: ${R.dawnDogFollows.d} units behind`); else fail(`the dawn dog: ${JSON.stringify(R.dawnDogFollows)}`);
  if (R.dawnDogStops && R.dawnDogStops.dogX <= R.dawnDogStops.line && R.dawnDogStops.dogX > R.dawnDogStops.line - 3 && R.dawnDogStops.walkerX > R.dawnDogStops.line) {
    pass(`and stops dead at a line that is not a border: dog x ${R.dawnDogStops.dogX} against ${R.dawnDogStops.line}, walker at ${R.dawnDogStops.walkerX}, sat (pose ${R.dawnDogStops.pose})`);
  } else fail(`THE DAWN DOG AT ITS LINE: ${JSON.stringify(R.dawnDogStops)}`);
  if (R.hat.midX > -200 && R.hat.midX < -160 && R.hat.endX <= R.hat.border && R.hat.endX > R.hat.border - 4) pass(`the hat goes the other way and stops at the border: x ${R.hat.midX} mid-run, ${R.hat.endX} after`); else fail(`the hat: ${JSON.stringify(R.hat)}`);
  if (R.districts.n === 45 && R.districts.overlaps === 0 && R.districts.lands === 12 && R.districts.min >= 3) pass(`forty-five districts in twelve lands, none overlapping, every land three or more`); else fail(`districts: ${JSON.stringify(R.districts)}`);
  if (R.earshot.well.includes('well-plink') && !R.earshot.crossroads.includes('well-plink') && R.earshot.brack.includes('brack-silence') && !R.earshot.funeralNoon.includes('the-funeral-silence') && R.earshot.funeralThree.includes('the-funeral-silence')) {
    pass('earshot is a pure function of place and hour: the well at the well and not at the crossroads, Brack\'s silence, the funeral\'s at three and not at noon');
  } else fail(`earshot: ${JSON.stringify(R.earshot)}`);
  if (!R.encounters.routines.length && !R.encounters.events.length) pass('every encounter is a routine or an event on the clock'); else fail(`encounters missing: ${JSON.stringify(R.encounters)}`);
  {
    const S = R.solids;
    if (S.n > 40 && S.barriers > S.n) pass(`A DRAWING IS A BARRIER: ${S.n} standees registered their footprints (${S.barriers} barriers in all)`); else fail(`solids: ${JSON.stringify(S)}`);
    if (!S.onRoad.length && !S.onSpots.length) pass('and none of them stands across a road (but the fountain, which the king\'s road was drawn through and which you go round), the spawn, the crossroads, the bicycle or the boat');
    else fail(`A BARRIER STANDS WHERE THE WALKER GOES: roads ${JSON.stringify(S.onRoad)} spots ${JSON.stringify(S.onSpots)}`);
    const held = (o) => o.wall && o.moved < o.free * 0.9;
    if (held(S.brimWall) && held(S.keep) && held(S.house)) pass(`the walls refuse a foot: driven at them off-road the walker stops at Brim's wall (${S.brimWall.moved} of ${S.brimWall.free} u), the keep (${S.keep.moved} u), a house in Maple Court (${S.house.moved} u), with a barrier the next stride on`);
    else fail(`THE WALKER WALKS THROUGH DRAWINGS: ${JSON.stringify({ wall: S.brimWall, keep: S.keep, house: S.house })}`);
    if (S.gateway.moved > 12) pass(`and the south gate's arch lets the king's road through: ${S.gateway.moved} u`); else fail(`THE SOUTH GATE IS SHUT: ${S.gateway.moved} u north from the road at z −6`);
  }
}

console.log('\nthe new cast, west and north (Session 19):');
{
  const N = r.cast;
  if (N.longship.eastmost < N.longship.border - 2 && N.longship.seenRowing && N.longship.seenBeached) pass(`THE LONGSHIP NEVER LANDS: sampled every quarter hour, its eastmost is x ${N.longship.eastmost} against the sand at ${N.longship.border}; it rows and it is beached`);
  else fail(`the longship: ${JSON.stringify(N.longship)}`);
  if (N.roared) pass('and it roars at the sand'); else fail('the longship did not roar at a walker on the sand');
  if (N.hornPrompt === 'BLOW THE HORN' && N.horn.answered) pass(`the horn says ${N.hornPrompt}, and the longship answers it ${N.horn.at}s later`);
  else fail(`the horn: ${N.hornPrompt}, ${JSON.stringify(N.horn)}`);
  if (!N.surfers.length) pass('the surfers, Pye, Wren and Wick are routines on the clock'); else fail(`routines missing: ${N.surfers.join(', ')}`);
  if (N.surferOut && N.surferOut.visible) pass('and at first light a surfer is out of the van'); else fail(`the surfer at 6.25: ${JSON.stringify(N.surferOut)}`);
  if (N.boardPrompt === 'PICK UP THE BOARD' && N.boardHeld === 'the-board' && /THE BOARD$/.test(N.boardPutPrompt ?? '') && N.boardRacked.racked && N.boardRacked.held === null) {
    pass(`the errand: the board is picked up on the wrack, set down at the rack (${N.boardPutPrompt}), and racked (${N.boardRacked.x}, ${N.boardRacked.z})`);
  } else fail(`the board: ${N.boardPrompt}, held ${N.boardHeld}, put ${N.boardPutPrompt}, ${JSON.stringify(N.boardRacked)}`);
  if (N.pyeBefore.prompt === 'COUNT THE POTS' && !N.pyeBefore.card) pass(`without the mark's name the pot line is a note: ${N.pyeBefore.prompt}`); else fail(`Pye before: ${JSON.stringify(N.pyeBefore)}`);
  if (N.pyePrompt === "TELL HIM THE MARK'S NAME" && N.pyeCard.open && N.pyeCard.doors.length === 2) pass(`with it, a card with two doors: ${N.pyeCard.doors.join(' / ')}`); else fail(`Pye's card: ${N.pyePrompt}, ${JSON.stringify(N.pyeCard)}`);
  if (N.pyeDoor.eighth && !N.pyeDoor.hauled && N.pyeDoor.answered) pass('door one writes door:the-eighth-pot and answers LONGSHORE\'s wait'); else fail(`Pye's door: ${JSON.stringify(N.pyeDoor)}`);
  if (N.wrenPrompt === 'TELL WREN WHERE THE BAR ENDS' && N.wrenCard.open && N.wrenCard.doors.length === 2) pass(`with the bar walked, Wren's punt is a card with two doors: ${N.wrenCard.doors.join(' / ')}`); else fail(`Wren's card: ${N.wrenPrompt}, ${JSON.stringify(N.wrenCard)}`);
  if (N.wrenDoor.finished && !N.wrenDoor.second && !N.wrenDoor.answered) pass('door two writes door:the-fleet-finished, which is a door and not an answer'); else fail(`Wren's door: ${JSON.stringify(N.wrenDoor)}`);
  if (N.fleetStill.wrenRowing === false) pass('and with the fleet finished Wren does not row out at noon'); else fail(`after the finish: ${JSON.stringify(N.fleetStill)}`);
  if (!N.fifthBefore && N.fifth.after && N.fifth.answered) pass('Brim\'s red on the avenue writes reason:the-fifth-banner and answers GREYWEATHER\'s wait'); else fail(`the fifth banner: before ${N.fifthBefore}, ${JSON.stringify(N.fifth)}`);
  if (N.wickResting && N.wickResting.visible && N.wickResting.pose === 3) pass(`Wick is halfway up the avenue at dawn, resting (pose ${N.wickResting.pose})`); else fail(`Wick at 5.85: ${JSON.stringify(N.wickResting)}`);
  if (N.portcullisPrompt === 'RATTLE THE PORTCULLIS' && N.portcullis.y0 !== null && N.portcullis.y1 < N.portcullis.y0 - 0.8) pass(`the portcullis comes down a foot: ${N.portcullis.y0.toFixed(2)} → ${N.portcullis.y1.toFixed(2)}`); else fail(`the portcullis: ${N.portcullisPrompt}, ${JSON.stringify(N.portcullis)}`);
  if (N.moat.day0 === false && N.moat.day1 === true && N.moat.day3 === false) pass('the moat is red on day one and not on days zero or three'); else fail(`the moat: ${JSON.stringify(N.moat)}`);
  if (N.deepDay0 === true && N.deepDay1 === false && N.sealsDay0 === true && N.sealsDay1 === false) pass('the deep surfaces on day zero and not day one, and the seals do not haul out the day after'); else fail(`the deep and the seals: deep ${N.deepDay0}/${N.deepDay1}, seals ${N.sealsDay0}/${N.sealsDay1}`);
  if (N.shape.shown && N.shape.gone) pass('the shape in the deep pines is drawn once at night, and is gone'); else fail(`the shape: ${JSON.stringify(N.shape)}`);
  if (N.stonePrompt === 'PICK UP THE STONE' && N.skim.skips >= 1 && N.skim.state === 'ground') pass(`the bar's stone skips: ${N.skim.skips} skip(s) before it went in`); else fail(`the skim: ${N.stonePrompt}, ${JSON.stringify(N.skim)}`);
  if (N.waits === 3) pass(`three waits answered on this page, and the line wants seven of the eleven built`); else fail(`answered waits: ${N.waits}`);
}

await browser.close();
console.log(fails ? `\n${fails} FAILURE(S)` : '\nall verb checks pass');
process.exit(fails ? 1 : 0);
