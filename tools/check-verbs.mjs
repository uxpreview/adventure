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
  .waitForFunction(() => document.body.innerText.toLowerCase().includes('set out'), { timeout: 25000 })
  .catch(() => {});

const r = await page.evaluate(() => {
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
    I.goto(24, 90);
    I.setTime(0);
    I.step(1 / 60, 6);
    const o = { wake: { bull: C.bull.state, gate: C.gate.shut, taughtRun: I.save.data.taughtRun } };
    settle(1.6);
    o.afterStanding = C.bull.state;
    o.taughtByTheBull = I.save.data.taughtRun;
    // run for the gate, the way a player who saw it would
    I.drive(-1, -0.22, 1);
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
    I.goto(24, 88);
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
    L.lampsAtDusk = lamps(19.6);
    L.lampsAtNoon = lamps(12);
    // the dog
    I.setHour(12, false);
    I.events.resync();
    const dog = I.life.drawn().find((d) => d.id === 'the-downs-dog');
    I.goto(104, 45);
    settle(0.5);
    I.drive(-1, 0, 0);
    settle(2.5);
    I.release();
    settle(0.5);
    L.dogFollows = { d: +Math.hypot(dog.x - I.char.pos.x, dog.z - I.char.pos.z).toFixed(1), pose: dog.pose };
    I.goto(90, 46);
    settle(0.5);
    I.drive(-1, 0, 1);
    settle(9);
    I.release();
    settle(1.5);
    L.dogWest = { walkerX: +I.char.pos.x.toFixed(1), dogX: +dog.x.toFixed(2), minX: 60, pose: dog.pose };
    // and the other way, over the bridge to the Flats' border
    I.goto(120, 42);
    settle(0.5);
    I.drive(1, -0.2, 0);
    settle(4);
    I.release();
    I.goto(200, 14);
    settle(0.5);
    I.drive(1, -0.12, 1);
    settle(9);
    I.release();
    settle(1.5);
    L.dogEast = { walkerX: +I.char.pos.x.toFixed(1), dogX: +dog.x.toFixed(2), maxX: 230, pose: dog.pose };
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
  return out;
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
  if (L.lampsAtQuarterPast.out && L.lampsAtDusk.out === false && L.lampsAtNoon.out === false) pass('the lamplighter is out at ten past seven and in by half past, and in at noon');
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

await browser.close();
console.log(fails ? `\n${fails} FAILURE(S)` : '\nall verb checks pass');
process.exit(fails ? 1 : 0);
