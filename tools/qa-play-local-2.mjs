// QA PASS 2 — the gate trap, the hedge, the bell, the 8:15, the lands clean.
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'fs';

const CHROMIUM = process.env.PW_CHROMIUM;
const URL = process.env.URL ?? 'http://localhost:4173/?debug';
const OUT = process.env.OUT ?? 'qa-shots';
const RIG = process.env.RIG ?? 'desktop';
const VP = RIG === 'portrait'
  ? { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }
  : { width: 1280, height: 720, deviceScaleFactor: 1 };
const dir = `${OUT}/${RIG}-2`;
mkdirSync(dir, { recursive: true });
const log = [];
const note = (s) => { console.log(s); log.push(s); };

const browser = await chromium.launch({ executablePath: CHROMIUM, headless: false });
const ctx = await browser.newContext({ viewport: { width: VP.width, height: VP.height }, isMobile: VP.isMobile, hasTouch: VP.hasTouch, deviceScaleFactor: VP.deviceScaleFactor });
let page;
const errors = [];
const fresh = async () => {
  if (page) await page.close();
  page = await ctx.newPage();
  await page.addInitScript(() => localStorage.clear());
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`[${m.type()}] ${m.text()}`); });
  page.on('pageerror', (e) => errors.push(`[exception] ${e.message}`));
  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.bringToFront();
  await page.waitForSelector('.title-veil:not(.gone)', { timeout: 40000 });
  await page.evaluate(() => { const I = window.__inklands; I.setHour(12, false); I.begin(); });
  await page.waitForTimeout(800);
};
let n = 0;
const shot = async (name) => {
  n++;
  await page.screenshot({ path: `${dir}/${String(n).padStart(2, '0')}-${name}.png` });
  const st = await page.evaluate(() => { const I = window.__inklands; return { x: +I.char.pos.x.toFixed(1), z: +I.char.pos.z.toFixed(1), region: I.region(), hour: +I.clock.hour.toFixed(2), prompt: I.promptText(), gate: I.common?.gate?.shut, bull: I.common?.bull?.state, note: document.querySelector('.note-veil.show, .note-veil.open') !== null }; });
  note(`${String(n).padStart(2, '0')} ${name}  ${JSON.stringify(st)}`);
};
const wait = (ms) => page.waitForTimeout(ms);
const hold = async (keys, ms) => { for (const k of keys) await page.keyboard.down(k); await wait(ms); for (const k of keys) await page.keyboard.up(k); };
const I = (js) => page.evaluate(js);
const closeNote = async () => { await I(`(() => { const I = window.__inklands; if (I.ui?.noteOpen) I.ui.closeNote(); document.querySelector('.note-veil')?.click(); })()`); await wait(300); };

/* ---- A. THE GATE TRAP, deterministic ---------------------------------- */
await fresh();
const gateRun = await I(`(() => {
  const I = window.__inklands; I.setBearing(true); I.setTime(0);
  const out = [];
  I.goto(24, 82); I.step(1/60, 70);           // the bull notices, then charges
  I.drive(-1, 0, 1);                            // run DUE WEST, away from it
  for (let f = 0; f < 480; f++) {
    I.step(1/60, 1);
    if (f % 30 === 0 || I.common.gate.shut && !out.shutAt) {
      out.push({ f, x: +I.char.pos.x.toFixed(1), z: +I.char.pos.z.toFixed(1), bull: I.common.bull.state, bx: +I.common.bull.x.toFixed(1), shut: I.common.gate.shut });
      if (I.common.gate.shut && !out.shutAt) out.shutAt = f;
    }
  }
  I.release(); I.step(1/60, 30);
  out.push({ f: 'end', x: +I.char.pos.x.toFixed(1), z: +I.char.pos.z.toFixed(1), bull: I.common.bull.state, shut: I.common.gate.shut, blocksHere: I.barriers.blocks(I.char.pos.x, I.char.pos.z) });
  return out;
})()`);
note('GATE RUN due west from spawn: ' + JSON.stringify(gateRun));
await shot('gate-trap-due-west');
// now try to get out west through the shut gate, and along the hedge
const escape = await I(`(() => {
  const I = window.__inklands;
  const probe = [[-12, 82], [-12, 87], [-12, 90], [-11, 82], [-13, 82]].map(([x, z]) => ({ x, z, blocks: I.barriers.blocks(x, z) }));
  I.goto(-9, 87); I.step(1/60, 10);
  I.drive(-1, -0.3, 1); I.step(1/60, 240); I.release(); I.step(1/60, 10);
  return { probe, after: { x: +I.char.pos.x.toFixed(1), z: +I.char.pos.z.toFixed(1), shut: I.common.gate.shut } };
})()`);
note('ESCAPE ATTEMPT through the shut gate NW at a run: ' + JSON.stringify(escape));
await shot('gate-trap-escape-attempt');
// the diagonal the shoot script uses (-1, -0.22): does that one get through?
await fresh();
const diag = await I(`(() => {
  const I = window.__inklands; I.setBearing(true); I.setTime(0);
  I.goto(24, 82); I.step(1/60, 70); I.drive(-1, -0.22, 1); I.step(1/60, 400); I.release(); I.step(1/60, 10);
  return { x: +I.char.pos.x.toFixed(1), z: +I.char.pos.z.toFixed(1), shut: I.common.gate.shut, bull: I.common.bull.state };
})()`);
note('DIAGONAL (-1,-0.22) as the shoot script drives it: ' + JSON.stringify(diag));
await shot('gate-diagonal');
// and a walker who runs west at z=90 then turns north at the hedge
await fresh();
const late = await I(`(() => {
  const I = window.__inklands; I.setBearing(true); I.setTime(0);
  I.goto(24, 82); I.step(1/60, 70); I.drive(-1, 0, 1); I.step(1/60, 250); I.drive(0, -1, 1); I.step(1/60, 120); I.drive(-1, 0, 1); I.step(1/60, 120); I.release(); I.step(1/60, 10);
  return { x: +I.char.pos.x.toFixed(1), z: +I.char.pos.z.toFixed(1), shut: I.common.gate.shut, bull: I.common.bull.state };
})()`);
note('WEST THEN NORTH ALONG THE HEDGE: ' + JSON.stringify(late));
await shot('gate-west-then-north');

/* ---- B. BUILDINGS HAVE NO COLLISION ------------------------------------ */
await fresh();
await I('window.__inklands.setBearing(true)');
const walls = await I(`(() => {
  const I = window.__inklands; const r = [];
  const tryWalk = (name, x, z, mx, mz, frames) => { I.goto(x, z); I.step(1/60, 5); const a = [I.char.pos.x, I.char.pos.z]; I.drive(mx, mz, 0); I.step(1/60, frames); I.release(); r.push({ name, from: a.map((v) => +v.toFixed(1)), to: [+I.char.pos.x.toFixed(1), +I.char.pos.z.toFixed(1)], moved: +Math.hypot(I.char.pos.x - a[0], I.char.pos.z - a[1]).toFixed(1) }); };
  tryWalk('brim town wall, north through it off-road', -30, -8, 0, -1, 300);
  tryWalk('brim cottage row', -30, -40, 0, -1, 200);
  tryWalk('greyweather keep', -45, -230, 0, -1, 200);
  tryWalk('maple court house', -60, 165, -1, 0, 200);
  tryWalk('greyline tower', 148, 215, 0, -1, 200);
  tryWalk('the cubicle mile atrium', 280, 215, 0, -1, 200);
  tryWalk('the oaks trunk', -101, 27, 0, -1, 120);
  return r;
})()`);
note('WALK THROUGH DRAWINGS: ' + JSON.stringify(walls, null, 0));
await I('window.__inklands.goto(-45, -60); window.__inklands.step(1/60, 5)');
await wait(300); await hold(['KeyW'], 2500); await shot('walked-through-brim-wall');
await I('window.__inklands.goto(-45, -232); window.__inklands.step(1/60, 5)'); await wait(300); await hold(['KeyW'], 1500); await shot('walked-into-the-keep');

/* ---- C. THE BICYCLE AND THE BELL, real keys ---------------------------- */
await fresh();
await I('window.__inklands.setHour(12, true); window.__inklands.putBicycle(-60, 149); window.__inklands.goto(-60, 151)'); await wait(800);
await shot('bike-in-reach');
await page.keyboard.press('KeyE'); await wait(500); await shot('bike-on');
await page.keyboard.down('KeyS'); await wait(1500); await shot('bike-riding');
await page.keyboard.press('KeyE'); await wait(500); await shot('bike-bell-pressed'); await page.keyboard.up('KeyS'); await wait(400);
note('after bell: ' + JSON.stringify(await I('({ aboard: window.__inklands.bicycle.aboard, prompt: window.__inklands.promptText() })')));
await page.keyboard.down('KeyW'); await wait(5000); await shot('bike-north-1'); await wait(3000); await shot('bike-at-common-border'); await page.keyboard.up('KeyW');
note('bike border: ' + JSON.stringify(await I('({ aboard: window.__inklands.bicycle.aboard, x: window.__inklands.char.pos.x, z: window.__inklands.char.pos.z, prompt: window.__inklands.promptText() })')));
await page.keyboard.press('KeyE'); await wait(500); await shot('bike-off-at-border');
await hold(['KeyW'], 1500); await shot('walked-across-from-bike');

/* ---- D. THE 8:15 -------------------------------------------------------- */
await fresh();
await I(`(() => { const I = window.__inklands; Object.values(I.waitAnswers).forEach((k) => k && I.learn(k)); I.learn('fact:the-timetable'); I.setHour(8.2, true); I.events.resync?.(); I.goto(252, 207); })()`);
await wait(1500); await shot('stop-812');
await I('window.__inklands.setHour(8.245, true)'); await wait(5000); await shot('815-arriving');
await wait(4000); await shot('815-doors');
note('train: ' + JSON.stringify(await I('({ phase: window.__inklands.train.phase, prompt: window.__inklands.promptText() })')));
await page.keyboard.press('KeyE'); await wait(1500); await shot('815-aboard');
await wait(8000); await shot('815-aboard-8s');
await wait(8000); await shot('815-aboard-16s');
note('train after: ' + JSON.stringify(await I('({ phase: window.__inklands.train.phase, aboard: window.__inklands.train.aboard, x: window.__inklands.char.pos.x, z: window.__inklands.char.pos.z, ending: window.__inklands.train.ending })')));

/* ---- E. THE LANDS, CLEAN ---------------------------------------------- */
await fresh();
const LANDS = [['meadow', -45, 58], ['kingdom', -45, -85], ['castle', -45, -215], ['forest', 145, -175], ['canyon', 300, -150], ['desert', 300, 45], ['downs', 148, -5], ['beach', -205, 60], ['ocean', -270, 60], ['neighborhood', -45, 195], ['city', 148, 205], ['office', 280, 205]];
for (const [id, x, z] of LANDS) {
  await I('window.__inklands.setHour(12, false)');
  await I(`window.__inklands.goto(${x}, ${z})`); await wait(900); await hold(['KeyW'], 500); await wait(900); await shot(`land-${id}-noon`);
}
await I('window.__inklands.setHour(19.4, false)');
for (const [id, x, z] of [['kingdom', -45, -85], ['beach', -205, 60], ['office', 280, 205], ['neighborhood', -45, 195], ['castle', -45, -215], ['forest', 145, -175]]) {
  await I(`window.__inklands.goto(${x}, ${z})`); await wait(900); await hold(['KeyW'], 500); await wait(900); await shot(`land-${id}-dusk`);
}
await I('window.__inklands.setHour(22.5, false)'); await I('window.__inklands.goto(-45, 58)'); await wait(900); await hold(['KeyW'], 500); await wait(900); await shot('common-night');
await I("window.__inklands.setWeather('rain'); window.__inklands.setHour(14, false); window.__inklands.goto(-45, -85)"); await wait(2000); await hold(['KeyW'], 500); await wait(900); await shot('brim-rain');
await I("window.__inklands.setWeather('storm'); window.__inklands.setHour(23, false)"); await wait(3000); await shot('brim-storm-night');
await I("window.__inklands.setWeather('fog'); window.__inklands.setHour(7, false); window.__inklands.goto(-45, 58)"); await wait(2000); await shot('common-fog-dawn');
await I("window.__inklands.setWeather('wind'); window.__inklands.setHour(15, false); window.__inklands.goto(148, -5)"); await wait(2000); await shot('downs-wind');
await I("window.__inklands.setWeather(null)");

/* ---- F. DISTRICT CARDS ON A WALK, AND THE PEEK ------------------------- */
await I('window.__inklands.setHour(10, true); window.__inklands.goto(-45, -60)'); await wait(800);
await page.keyboard.down('KeyW'); await wait(2500); await shot('brim-walk-north-1'); await wait(3000); await shot('brim-walk-north-2'); await page.keyboard.up('KeyW');
await page.keyboard.down('Comma'); await wait(1500); await shot('brim-peek-left'); await page.keyboard.up('Comma'); await wait(1500); await shot('brim-peek-home');

note('---- console errors (' + errors.length + ') ----');
for (const e of [...new Set(errors)].slice(0, 20)) note(e);
writeFileSync(`${dir}/qa-log.txt`, log.join('\n'));
await browser.close();
