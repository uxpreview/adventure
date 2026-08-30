// THE SCORE, IN THE RUNNING GAME.
//
//   node tools/verify-score.mjs          (needs vite preview on :4173)
//
// `check-audio.mjs` renders the score's own exported functions offline
// and asserts them. What it CANNOT prove is the part that only exists
// inside the class: that init wires the buses in the right order, that
// `setMood` crossfades without throwing, and — the one that would
// actually bite — that crossing two borders inside one three-and-a-half
// second fade does not put an AudioParam into a state Web Audio refuses.
//
// So this walks the world with the real AudioContext running and looks
// at the graph it built. Same division of labour as Session 7:
// `shoot-story` photographs the wait, `verify-story` PLAYS it.
import { chromium } from 'playwright';

const URL = process.env.URL ?? 'http://localhost:4173/?debug';
let fails = 0;
const fail = (m) => { console.log('  ✗ ' + m); fails++; };
const ok = (m) => console.log('  · ' + m);

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium',
  // an AudioContext with no user gesture is SUSPENDED, and a suspended
  // context's currentTime does not advance — every ramp in here would
  // sit at its start value forever and every assertion would be a lie
  args: ['--autoplay-policy=no-user-gesture-required'],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
await page.addInitScript(() => localStorage.clear());
await page.goto(URL, { waitUntil: 'networkidle' });
await page.bringToFront();
await page.waitForFunction(() => document.body.innerText.toLowerCase().includes('set out'),
  { timeout: 20000 }).catch(() => {});
await page.evaluate(() => window.__inklands.begin());
await page.waitForTimeout(1500);

const A = () => page.evaluate(() => {
  const a = window.__inklands.audio;
  return {
    state: a.ctx?.state ?? 'none',
    time: a.ctx?.currentTime ?? 0,
    land: a.land,
    bed: !!a.bed,
    music: a.music?.gain.value ?? -1,
    ambient: a.ambient?.gain.value ?? -1,
    tail: a.tailMix?.gain.value ?? -1,
    tailTime: a.tailDelay?.delayTime.value ?? -1,
    hour: a.hour,
  };
});

console.log('the context:');
{
  const s = await A();
  if (s.state !== 'running') fail(`the AudioContext is ${s.state}`);
  else ok(`running, and it has been for ${s.time.toFixed(1)} seconds`);
  if (!s.bed) fail('no bed was built at spawn');
  if (s.land !== 'meadow') fail(`spawn thinks it is in ${s.land}`);
  else ok('THE COMMON is playing the moment the title lets go');
}

/* ---- every border in the world, crossed for real ------------------- */
console.log('\ncrossing:');
const WALK = [
  ['meadow', -45, 58], ['kingdom', -45, -60], ['castle', -45, -200],
  ['kingdom', -45, -60], ['meadow', -45, 58], ['neighborhood', -45, 200],
  ['downs', 140, 40], ['forest', 140, -180], ['canyon', 300, -180],
  ['desert', 300, 40], ['office', 300, 200], ['city', 140, 200],
  ['downs', 140, 40], ['beach', -200, 40], ['ocean', -300, 40],
];
for (const [want, x, z] of WALK) {
  await page.evaluate(([tx, tz]) => window.__inklands.goto(tx, tz), [x, z]);
  await page.waitForTimeout(700);
  const s = await A();
  if (s.land !== want) fail(`walked into ${want} and the score thinks it is in ${s.land}`);
  if (!s.bed) fail(`${want} has no bed`);
}
ok(`${WALK.length} crossings, every one of them the land the walker is standing in`);

/* ---- and the one that breaks it: two borders inside one fade ------- */
console.log('\ntwo borders inside one fade (the fade is three and a half seconds):');
{
  const before = errors.length;
  for (const [x, z] of [[-45, -60], [-45, -200], [-45, -60], [-45, 58], [-45, -60]]) {
    await page.evaluate(([tx, tz]) => window.__inklands.goto(tx, tz), [x, z]);
    await page.waitForTimeout(220);
  }
  await page.waitForTimeout(1200);
  const s = await A();
  if (errors.length > before) fail('a re-entrant crossfade threw: ' + errors.slice(before).join(' / '));
  else ok('five crossings in a second and a bit, and nothing threw');
  if (!s.bed) fail('the bed did not survive it');
}

/* ---- the tail is a place, not a setting ---------------------------- */
console.log('\nthe canyon answers and the Common does not:');
{
  await page.evaluate(() => window.__inklands.goto(300, -180));
  await page.waitForTimeout(4200);
  const c = await A();
  await page.evaluate(() => window.__inklands.goto(-45, 58));
  await page.waitForTimeout(4200);
  const m = await A();
  console.log(`  SPLITROCK tail ${c.tail.toFixed(2)} at ${c.tailTime.toFixed(2)}s   ` +
    `THE COMMON tail ${m.tail.toFixed(2)}`);
  if (c.tail < 0.4) fail('the canyon does not answer back');
  if (m.tail > 0.02) fail('the Common answers back, and a field does not');
}

/* ---- the hour and the walk, in the running mix --------------------- */
console.log('\nthe mix, live:');
{
  const noon = await A();
  await page.evaluate(() => window.__inklands.setHour(23, false));
  await page.waitForTimeout(4500);
  const night = await A();
  console.log(`  the room: ${noon.ambient.toFixed(3)} at noon, ${night.ambient.toFixed(3)} at eleven`);
  if (!(night.ambient < noon.ambient * 0.85)) fail('the room does not thin after dark');
  else ok('the room thins after dark, live, off the day cycle');
  await page.evaluate(() => window.__inklands.setHour(12, false));
}

if (errors.length) for (const e of errors) fail('page error: ' + e);
await browser.close();
console.log(fails === 0 ? '\nthe score is wired.' : `\n${fails} FAILED`);
process.exit(fails ? 1 : 0);
