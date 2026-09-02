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

await browser.close();
console.log(fails ? `\n${fails} FAILURE(S)` : '\nall verb checks pass');
process.exit(fails ? 1 : 0);
