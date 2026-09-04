// QA PLAY-THROUGH — headed Chromium on the owner's Mac, real time, real keys.
// Not the harness clock: this is what a player gets, GPU and all.
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'fs';

const CHROMIUM = process.env.PW_CHROMIUM;
const URL = process.env.URL ?? 'http://localhost:4173/?debug';
const OUT = process.env.OUT ?? 'qa-shots';
const RIG = process.env.RIG ?? 'desktop';
const VP = RIG === 'portrait'
  ? { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }
  : { width: 1280, height: 720, deviceScaleFactor: 1 };

const dir = `${OUT}/${RIG}`;
mkdirSync(dir, { recursive: true });
const log = [];
const note = (s) => { console.log(s); log.push(s); };

const browser = await chromium.launch({ executablePath: CHROMIUM, headless: false });
const ctx = await browser.newContext({ viewport: { width: VP.width, height: VP.height }, isMobile: VP.isMobile, hasTouch: VP.hasTouch, deviceScaleFactor: VP.deviceScaleFactor });
const page = await ctx.newPage();
await page.addInitScript(() => localStorage.clear());
const errors = [];
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errors.push(`[${m.type()}] ${m.text()}`); });
page.on('pageerror', (e) => errors.push(`[exception] ${e.message}`));

let n = 0;
const shot = async (name) => {
  n++;
  const file = `${dir}/${String(n).padStart(2, '0')}-${name}.png`;
  await page.screenshot({ path: file });
  const st = await page.evaluate(() => {
    const I = window.__inklands; if (!I) return null;
    return { x: +I.char.pos.x.toFixed(1), z: +I.char.pos.z.toFixed(1), region: I.region(), hour: +I.clock.hour.toFixed(2), prompt: I.promptText(), held: I.holding?.() ?? null };
  });
  note(`${String(n).padStart(2, '0')} ${name}  ${st ? JSON.stringify(st) : ''}`);
};
const wait = (ms) => page.waitForTimeout(ms);
const visibleText = () => page.evaluate(() => [...document.querySelectorAll('[aria-label]')].filter((e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 0 && cs.visibility !== 'hidden' && +cs.opacity > 0.05 && !e.closest('.gone'); }).map((e) => e.getAttribute('aria-label')).join(' | '));
const hold = async (keys, ms) => { for (const k of keys) await page.keyboard.down(k); await wait(ms); for (const k of keys) await page.keyboard.up(k); };
const fps = async (label, secs = 2) => {
  const r = await page.evaluate((s) => new Promise((res) => {
    let f = 0; const t0 = performance.now();
    const tick = () => { f++; if (performance.now() - t0 < s * 1000) requestAnimationFrame(tick); else res({ fps: +(f / s).toFixed(1) }); };
    requestAnimationFrame(tick);
  }), secs);
  const cost = await page.evaluate(() => window.__inklands.frameCost(20));
  note(`FPS ${label}: ${r.fps} rAF/s   frameCost ${cost.ms.toFixed(2)}ms  calls ${cost.calls}  tris ${cost.tris}`);
};

/* ---- 1. LOAD ---------------------------------------------------------- */
const t0 = Date.now();
await page.goto(URL, { waitUntil: 'domcontentloaded' });
await page.bringToFront();
await wait(900);
await shot('loader');
await page.waitForSelector('.title-veil:not(.gone)', { timeout: 40000 }).catch(() => note('!! title never appeared'));
note(`load → title: ${((Date.now() - t0) / 1000).toFixed(1)} s`);
await wait(1200);
await shot('title');
note('title text: ' + JSON.stringify(await visibleText()));

/* ---- 2. THE FIRST HOUR, PLAYED --------------------------------------- */
await page.evaluate(() => window.__inklands.setHour(9, true));
// press the real button
await page.click('.title-btn >> nth=0');
await wait(1800);
await shot('wake-in-long-grass');
await wait(2500);
await shot('the-bull-looking');
note('prompt/hint on body: ' + JSON.stringify(await visibleText()));
// the charge: run west and a little north, as the hint says
await page.keyboard.down('ShiftLeft'); await page.keyboard.down('KeyA');
await wait(1200); await shot('run-1');
await wait(1200); await shot('run-2');
await page.keyboard.down('KeyW'); await wait(600); await page.keyboard.up('KeyW');
await wait(1200); await shot('run-3');
await wait(1500); await shot('run-4-near-gate');
await page.keyboard.up('KeyA'); await page.keyboard.up('ShiftLeft');
await wait(1500);
await shot('after-the-run');
note('after run text: ' + JSON.stringify(await visibleText()));
await fps('common after the bull');

// on to the crossroads: north-west
await hold(['KeyA', 'KeyW'], 4000);
await shot('toward-crossroads');
await hold(['KeyA', 'KeyW'], 4000);
await shot('crossroads-ish');
await hold(['KeyW'], 1500);
await shot('look-around');
// look at whatever is in reach
await page.keyboard.press('KeyE'); await wait(900);
await shot('E-pressed');
note('note text: ' + JSON.stringify(await visibleText()));
await page.keyboard.press('KeyE'); await wait(400);
// the peek
await page.keyboard.down('Period'); await wait(1500); await shot('peek-right'); await page.keyboard.up('Period'); await wait(1500);
// north up the king's road: the goat should fall in
await hold(['KeyW'], 5000); await shot('north-1');
await hold(['KeyW'], 5000); await shot('north-2');
await hold(['ShiftLeft', 'KeyW'], 5000); await shot('north-3-run');
await hold(['ShiftLeft', 'KeyW'], 5000); await shot('north-4-border');
await wait(1200); await shot('after-border-card');
await fps('brim gate');
await page.keyboard.press('KeyM'); await wait(1000); await shot('map-early'); await page.keyboard.press('KeyM'); await wait(400);

/* ---- 3. THE VERBS (teleported) --------------------------------------- */
const I = (js) => page.evaluate(js);
const go = async (x, z) => { await I(`window.__inklands.goto(${x}, ${z})`); await wait(1200); };
await I('window.__inklands.setHour(12, true)');
await go(-56.5, 47.5); await shot('well-in-reach');
await page.keyboard.press('KeyE'); await wait(800); await shot('well-shout'); await wait(4000); await shot('well-answers');
await go(-91, 33); await hold(['KeyW'], 700); await wait(600); await shot('swing-in-reach');
await page.keyboard.press('KeyE'); await wait(1500); await shot('seated'); await wait(3000); await shot('seated-later');
await page.keyboard.press('KeyE'); await wait(600);
await go(-16, 88); await shot('nell');
await I(`const c = window.__inklands.things.get('hay-cart'); window.__inklands.goto(c.x - 3.2, c.z);`); await wait(800); await shot('cart-in-reach');
await page.keyboard.press('KeyE'); await wait(1500); await shot('cart-pushed');
await go(-56, -216); await shot('the-king');
await page.keyboard.press('KeyE'); await wait(1200); await shot('the-choice-card');
note('card text: ' + JSON.stringify(await visibleText()));
await page.keyboard.press('Escape'); await wait(300);
await I('window.__inklands.choose?.(1)'); await wait(800);

/* ---- 4. THE BICYCLE, REAL KEYS --------------------------------------- */
await I('window.__inklands.putBicycle(-60, 149)');
await go(-60, 151); await shot('bicycle-in-reach');
await page.keyboard.press('KeyE'); await wait(600); await shot('on-the-bicycle');
await hold(['KeyS'], 2500); await shot('riding-south');
await page.keyboard.down('KeyS'); await wait(400); await page.keyboard.press('KeyE'); await wait(600); await shot('bell'); await page.keyboard.up('KeyS');
await hold(['KeyW'], 6000); await shot('riding-north-to-border');
await hold(['KeyW'], 3000); await shot('bicycle-at-border');
await fps('on the bicycle at the border');
await page.keyboard.press('KeyE'); await wait(600); await I('window.__inklands.stepOff()');

/* ---- 5. TWELVE LANDS, WIDE, NOON AND DUSK ----------------------------- */
const LANDS = [['meadow', -45, 58], ['kingdom', -45, -85], ['castle', -45, -215], ['forest', 145, -190], ['canyon', 300, -150], ['desert', 300, 45], ['downs', 148, -5], ['beach', -205, 60], ['ocean', -270, 60], ['neighborhood', -45, 195], ['city', 148, 205], ['office', 280, 205]];
for (const [id, x, z] of LANDS) {
  await I('window.__inklands.setHour(12, false)');
  await go(x, z); await hold(['KeyW'], 500); await wait(900); await shot(`land-${id}-noon`);
  await fps(id, 1.5);
}
await I('window.__inklands.setHour(19.4, false)');
for (const [id, x, z] of [['kingdom', -45, -85], ['beach', -205, 60], ['office', 280, 205], ['neighborhood', -45, 195]]) {
  await go(x, z); await hold(['KeyW'], 500); await wait(900); await shot(`land-${id}-dusk`);
}
await I('window.__inklands.setHour(22.5, false)');
await go(-45, 58); await hold(['KeyW'], 500); await wait(900); await shot('common-night');
await I("window.__inklands.setWeather('rain')"); await I('window.__inklands.setHour(14, false)'); await go(-45, -85); await hold(['KeyW'], 500); await wait(1500); await shot('brim-rain');
await I("window.__inklands.setWeather('storm')"); await I('window.__inklands.setHour(23, false)'); await wait(2500); await shot('brim-storm-night');
await I("window.__inklands.setWeather('fog')"); await I('window.__inklands.setHour(7, false)'); await go(-45, 58); await wait(1500); await shot('common-fog-dawn');
await I('window.__inklands.setWeather(null)');

/* ---- 6. THE 8:15 ------------------------------------------------------ */
await I(`const I = window.__inklands; Object.values(I.waitAnswers).forEach((k) => k && I.learn(k)); I.learn('fact:the-timetable'); I.setHour(8.2, true); I.events.resync?.();`);
await go(252, 210); await wait(1500); await shot('the-stop-8-12');
await I('window.__inklands.setHour(8.25, true)'); await wait(4000); await shot('the-8-15-arrives');
await wait(4000); await shot('the-8-15-doors');
await page.keyboard.press('KeyE'); await wait(2500); await shot('aboard');
await wait(6000); await shot('aboard-later');
await page.keyboard.press('KeyM'); await wait(1000); await shot('map-late'); await page.keyboard.press('KeyM');

/* ---- 7. DONE ---------------------------------------------------------- */
const save = await page.evaluate(() => JSON.stringify(window.__inklands.save.data).slice(0, 800));
note('save: ' + save);
note('---- console errors/warnings (' + errors.length + ') ----');
for (const e of [...new Set(errors)].slice(0, 40)) note(e);
writeFileSync(`${dir}/qa-log.txt`, log.join('\n'));
await browser.close();
