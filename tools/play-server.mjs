// THE COLD PLAYER'S HANDS — a persistent, stepped Playwright session.
//
//   node tools/play-server.mjs [--port 4321] [--url http://localhost:4173/] [--rig desktop|portrait] [--out play-strip]
//
// This sandbox has no GPU: Chromium renders the game at ~4 fps through
// SwiftShader, so a real-time playtest is a slideshow. Instead the server
// keeps one browser open and advances GAME time on the harness clock
// (`window.__inklands.step`), rendering only the last frame of each
// advance. One "game second" is 30 fixed ticks whatever the wall clock
// says, so a held key walks exactly as far as it would for a player.
//
// Drive it with tools/play.mjs (one command per call), e.g.
//   node tools/play.mjs shot title        → play-strip/001-title.png
//   node tools/play.mjs click .title-btn   → press the first title button
//   node tools/play.mjs hold w,shift 3     → run north for 3 game seconds
//   node tools/play.mjs text               → every word visible on screen
//   node tools/play.mjs status             → where you are, what's prompted
//
// The server does NOT need `?debug` in the URL: it turns the hooks on
// itself by adding the flag. It clears localStorage once at launch, so
// every session starts from the title screen as a new player would.
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { mkdirSync, writeFileSync, appendFileSync } from 'node:fs';
import { CHROMIUM } from './pw.mjs';

const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : d; };
const PORT = Number(arg('port', 4321));
const RIG = arg('rig', 'desktop');
const OUT = arg('out', 'play-strip');
let URL = arg('url', 'http://localhost:4173/');
if (!URL.includes('debug')) URL += (URL.includes('?') ? '&' : '?') + 'debug';
const TICK = 1 / 30;

const VP = RIG === 'portrait'
  ? { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }
  : { viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 };

mkdirSync(OUT, { recursive: true });
const LOG = `${OUT}/log.jsonl`;
writeFileSync(LOG, '');
const log = (o) => appendFileSync(LOG, JSON.stringify({ t: Date.now(), ...o }) + '\n');

const browser = await chromium.launch({
  executablePath: CHROMIUM,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'],
});
const ctx = await browser.newContext(VP);
const page = await ctx.newPage();
await page.addInitScript(() => { try { localStorage.clear(); } catch {} });
const errors = [];
page.on('pageerror', (e) => errors.push(`[exception] ${e.message}`));
page.on('console', (m) => { if (m.type() === 'error') errors.push(`[console] ${m.text()}`); });

let gameSec = 0;
let shotN = 0;
const cdp = await ctx.newCDPSession(page);

const KEY = {
  w: 'KeyW', a: 'KeyA', s: 'KeyS', d: 'KeyD', e: 'KeyE', m: 'KeyM', n: 'KeyN', q: 'KeyQ', r: 'KeyR', f: 'KeyF',
  t: 'KeyT', j: 'KeyJ', i: 'KeyI', c: 'KeyC', b: 'KeyB', h: 'KeyH', x: 'KeyX', z: 'KeyZ', p: 'KeyP', tab: 'Tab',
  shift: 'ShiftLeft', space: 'Space', esc: 'Escape', escape: 'Escape', enter: 'Enter',
  up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight', ',': 'Comma', '.': 'Period',
  '1': 'Digit1', '2': 'Digit2', '3': 'Digit3', '4': 'Digit4',
};
const key = (k) => KEY[k.toLowerCase()] ?? k;

const started = () => page.evaluate(() => !!window.__inklands && document.querySelector('.title-veil')?.classList.contains('gone'));

/** Advance `s` game seconds on the harness clock (renders the last frame). */
async function sec(s) {
  const n = Math.max(1, Math.round(s / TICK));
  const CH = 30;
  for (let i = 0; i < n; i += CH) {
    const k = Math.min(CH, n - i);
    await page.evaluate(([dt, k]) => window.__inklands?.step?.(dt, k), [TICK, k]);
  }
  gameSec += n * TICK;
  await page.waitForTimeout(60);
}

const state = () => page.evaluate(() => {
  const I = window.__inklands; if (!I) return { loaded: false };
  const vis = [...document.querySelectorAll('[aria-label]')].filter((e) => {
    const r = e.getBoundingClientRect(); const cs = getComputedStyle(e);
    return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && +cs.opacity > 0.05 && !e.closest('.gone');
  }).map((e) => e.getAttribute('aria-label'));
  const title = document.querySelector('.title-veil') && !document.querySelector('.title-veil')?.classList.contains('gone');
  return {
    loaded: true, title,
    x: +I.char.pos.x.toFixed(1), z: +I.char.pos.z.toFixed(1), region: I.region(), hour: +I.clock.hour.toFixed(2),
    prompt: I.promptText?.() ?? null, holding: I.holding?.() ?? null,
    text: vis,
  };
});

async function shot(name = 'shot') {
  shotN++;
  const file = `${OUT}/${String(shotN).padStart(3, '0')}-${name.replace(/[^a-z0-9_-]/gi, '_')}.png`;
  await page.screenshot({ path: file });
  const st = await state();
  log({ op: 'shot', file, gameSec: +gameSec.toFixed(1), ...st });
  return { file, gameSec: +gameSec.toFixed(1), ...st };
}

async function touchDrag(points, secs) {
  // points: [[x0,y0,x1,y1], ...] one entry per finger
  const steps = 12;
  const at = (k) => points.map((p, i) => ({ x: p[0] + (p[2] - p[0]) * k, y: p[1] + (p[3] - p[1]) * k, id: i }));
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: at(0) });
  for (let i = 1; i <= steps; i++) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: at(i / steps) });
    await sec(secs / steps);
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await sec(0.2);
}

async function run(cmd) {
  const [op, ...a] = cmd;
  switch (op) {
    case 'status': return { gameSec: +gameSec.toFixed(1), ...(await state()), errors: errors.splice(0) };
    case 'text': return (await state()).text;
    case 'sec': await sec(Number(a[0] ?? 1)); return { gameSec: +gameSec.toFixed(1) };
    case 'wait': await page.waitForTimeout(Number(a[0] ?? 500)); return 'ok';
    case 'hold': {
      const keys = a[0].split(',').map(key); const s = Number(a[1] ?? 1);
      for (const k of keys) await page.keyboard.down(k);
      await sec(s);
      for (const k of keys) await page.keyboard.up(k);
      await sec(0.2);
      return { gameSec: +gameSec.toFixed(1), ...(await state()) };
    }
    case 'press': { await page.keyboard.press(key(a[0])); await sec(Number(a[1] ?? 0.5)); return await state(); }
    case 'down': await page.keyboard.down(key(a[0])); return 'ok';
    case 'up': await page.keyboard.up(key(a[0])); return 'ok';
    case 'click': {
      if (/^\d/.test(a[0])) { await page.mouse.click(Number(a[0]), Number(a[1])); }
      else { const el = page.locator(a[0]).first(); await el.click({ timeout: 3000 }); }
      await sec(0.5); return await state();
    }
    case 'tap': { await page.touchscreen.tap(Number(a[0]), Number(a[1])); await sec(0.5); return await state(); }
    case 'drag': {
      // drag x0 y0 x1 y1 [button=left|right] [secs=1]
      const [x0, y0, x1, y1] = a.slice(0, 4).map(Number); const button = a[4] ?? 'left'; const s = Number(a[5] ?? 1);
      const steps = 12;
      await page.mouse.move(x0, y0); await page.mouse.down({ button });
      for (let i = 1; i <= steps; i++) { await page.mouse.move(x0 + (x1 - x0) * i / steps, y0 + (y1 - y0) * i / steps); await sec(s / steps); }
      await page.mouse.up({ button }); await sec(0.2);
      return await state();
    }
    case 'wheel': { await page.mouse.move(640, 360); await page.mouse.wheel(0, Number(a[0] ?? 200)); await sec(0.5); return 'ok'; }
    case 'touch': { const [x0, y0, x1, y1] = a.slice(0, 4).map(Number); await touchDrag([[x0, y0, x1, y1]], Number(a[4] ?? 1)); return await state(); }
    case 'touch2': { // two fingers, same delta: x0 y0 dx dy [secs]
      const [x0, y0, dx, dy] = a.slice(0, 4).map(Number);
      await touchDrag([[x0 - 40, y0, x0 - 40 + dx, y0 + dy], [x0 + 40, y0, x0 + 40 + dx, y0 + dy]], Number(a[4] ?? 1)); return await state();
    }
    case 'shot': return await shot(a[0]);
    case 'eval': return await page.evaluate(a.join(' '));
    case 'errors': return errors.splice(0);
    case 'quit': setTimeout(() => process.exit(0), 100); return 'bye';
    default: return { error: `unknown op ${op}` };
  }
}

// ---- load, to the title, as a player would --------------------------
const t0 = Date.now();
await page.goto(URL, { waitUntil: 'domcontentloaded' });
await page.waitForSelector('.title-veil:not(.gone)', { timeout: 120000 }).catch(() => console.log('!! title never appeared'));
await page.waitForTimeout(800);
console.log(`loaded to title in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
// hold the clock from here on: nothing advances unless a command says so
await page.evaluate(() => { window.__inklands?.step?.(1 / 30, 1); });

let busy = Promise.resolve();
createServer((req, res) => {
  let body = '';
  req.on('data', (c) => (body += c));
  req.on('end', () => {
    let cmd; try { cmd = JSON.parse(body); } catch { res.end(JSON.stringify({ error: 'bad json' })); return; }
    busy = busy.then(async () => {
      try { const r = await run(cmd); log({ cmd, r: typeof r === 'object' ? { ...r, text: undefined } : r }); res.end(JSON.stringify(r)); }
      catch (e) { res.end(JSON.stringify({ error: String(e.message ?? e) })); }
    });
  });
}).listen(PORT, () => console.log(`play-server on :${PORT}  strip → ${OUT}/`));
