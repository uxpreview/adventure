// SHOOT THE SOUND.
//
//   node tools/shoot-sound.mjs
//
// Five sessions of contact sheets photographed the world. This one
// photographs the SCORE — every land's voice and room rendered offline
// and PLOTTED, waveform and spectrum, drawn with `src/engine/ink.ts`
// because everything in this project is drawn with it.
//
// It exists to answer one question that a passing test cannot: TWELVE
// LANDS SHOULD BE VISIBLY TWELVE SOUNDS. If the sheet comes back as
// twelve nearly identical smears, the session shipped one instrument in
// twelve modes again — which is exactly what it was called to fix — and
// the art director can see it in one glance instead of reading numbers.
//
// Output: out/sound/sheet-lands.png and out/sound/sheet-borders.png
import { build } from 'esbuild';
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'fs';
import { LANDS, BOOTH } from './audio-lib.mjs';
import { CHROMIUM } from './pw.mjs';

mkdirSync('.tmp', { recursive: true });
mkdirSync('out/sound', { recursive: true });

for (const [entry, name, out] of [
  ['src/core/Audio.ts', 'INK', '.tmp/audio.iife.js'],
  ['src/engine/ink.ts', 'INKD', '.tmp/ink.iife.js'],
  ['src/engine/palette.ts', 'PAL', '.tmp/palette.iife.js'],
]) {
  await build({ entryPoints: [entry], bundle: true, format: 'iife', globalName: name, outfile: out, logLevel: 'error' });
}

const browser = await chromium.launch({ executablePath: CHROMIUM });
const page = await browser.newPage({ viewport: { width: 400, height: 400 } });
await page.goto('about:blank');
for (const f of ['.tmp/audio.iife.js', '.tmp/ink.iife.js', '.tmp/palette.iife.js']) {
  await page.addScriptTag({ path: f });
}
// the same render booth `check-audio` measures with — one copy of it,
// so the sheet is a picture of the thing that was asserted
await page.addScriptTag({ content: BOOTH });

const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));

/* ------------------------------------------------------------------ *
 * THE DRAWING. All of it in the page, because ink.ts is a canvas
 * library and a canvas needs a document.
 * ------------------------------------------------------------------ */
const draw = async (spec) => page.evaluate(async (S) => {
  const { rng, stroke, line, lettering, hatch, makeCanvas } = window.INKD;
  const { PAPER, INK, PENCIL, BLUE } = window.PAL;

  if (S.floor === undefined) S.floor = S.ceil - 58;
  const COLS = S.cols, ROWS = Math.ceil(S.panels.length / S.cols);
  const PW = S.pw, PH = S.ph, PAD = 46, TOP = 132;
  const W = PAD * 2 + COLS * PW, H = TOP + PAD + ROWS * PH;
  const { canvas, ctx } = makeCanvas(W, H);
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, W, H);

  const r = rng(8080);
  lettering(ctx, S.title, PAD, 70, 34, r, { color: INK, width: 3, crooked: 0.4 });
  lettering(ctx, S.sub, PAD, 106, 15, r, { color: PENCIL, width: 1.6, crooked: 0.3, alpha: 0.8 });

  for (let i = 0; i < S.panels.length; i++) {
    const p = S.panels[i];
    const x0 = PAD + (i % COLS) * PW;
    const y0 = TOP + Math.floor(i / COLS) * PH;
    const w = PW - 34, h = PH - 40;

    // the panel's own hand-drawn box: three sides, because a closed box
    // is a diagram and this is a page
    const rr = rng(101 + i * 7);
    line(ctx, x0, y0 + h, x0 + w, y0 + h, rr, { color: INK, width: 1.4, alpha: 0.5, passes: 1 });
    line(ctx, x0, y0 + 6, x0, y0 + h, rr, { color: INK, width: 1.2, alpha: 0.35, passes: 1 });

    lettering(ctx, p.name, x0 + 4, y0 + 26, 17, rr, { color: INK, width: 2.1, crooked: 0.45 });
    lettering(ctx, p.kicker, x0 + 4, y0 + 46, 11, rr,
      { color: PENCIL, width: 1.3, crooked: 0.3, alpha: 0.85 });

    /* ---- the waveform: what it DOES ----
     * Drawn to its OWN height, because the shape is the instrument — a
     * bell's hard front and long tail, air's slow swell, the bowed
     * voice arriving instead of starting — and at a shared height the
     * quiet lands are a flat line and say nothing at all. How loud each
     * one is, is in the caption and in the spectrum, which IS shared. */
    const wy = y0 + 96, wh = 58;
    const top = [], bot = [];
    for (let c = 0; c < p.wave.length; c++) {
      const x = x0 + 4 + (c / (p.wave.length - 1)) * (w - 8);
      top.push([x, wy - Math.max(-1, Math.min(1, p.wave[c][1] / p.scale)) * wh]);
      bot.push([x, wy - Math.max(-1, Math.min(1, p.wave[c][0] / p.scale)) * wh]);
    }
    line(ctx, x0 + 4, wy, x0 + w - 4, wy, rr, { color: PENCIL, width: 0.9, alpha: 0.35, passes: 1 });
    // fill between the two envelopes: without a body, two thin traces
    // read as two unrelated scribbles instead of one sound
    ctx.save();
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.moveTo(top[0][0], top[0][1]);
    for (const [x, y] of top) ctx.lineTo(x, y);
    for (let c = bot.length - 1; c >= 0; c--) ctx.lineTo(bot[c][0], bot[c][1]);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    stroke(ctx, top, rr, { color: INK, width: 1.25, jitter: 0.4, alpha: 0.9, passes: 1 });
    stroke(ctx, bot, rr, { color: INK, width: 1.25, jitter: 0.4, alpha: 0.9, passes: 1 });

    /* ---- the spectrum: WHERE it is ---- */
    const sy = y0 + h - 16, sh = 92;
    const pts = [], bed = [];
    // ONE decibel window across the whole sheet, so a quiet land looks
    // quiet and a room sits under the land it is the room of
    const norm = (v) => Math.max(0, Math.min(1, (v - S.floor) / (S.ceil - S.floor)));
    for (let c = 0; c < p.spectrum.length; c++) {
      const x = x0 + 4 + (c / (p.spectrum.length - 1)) * (w - 8);
      pts.push([x, sy - norm(p.spectrum[c]) * sh]);
      if (p.bedSpectrum) bed.push([x, sy - norm(p.bedSpectrum[c]) * sh]);
    }
    // the room, in pencil, under the voice in ink: the two registers
    // this project already uses for "somebody told me" and "I stood in it"
    if (bed.length) stroke(ctx, bed, rr, { color: PENCIL, width: 1.3, jitter: 0.5, alpha: 0.55, passes: 1 });
    if (p.mid) {
      // where the level started: the line the fade must not leave
      line(ctx, x0 + 4, sy - 0.5 * sh, x0 + w - 4, sy - 0.5 * sh, rr,
        { color: PENCIL, width: 1.0, alpha: 0.45, passes: 1 });
    }
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x0 + 4, sy);
    for (const [x, y] of pts) ctx.lineTo(x, y);
    ctx.lineTo(x0 + w - 4, sy);
    ctx.closePath();
    ctx.clip();
    if (!p.flat) hatch(ctx, x0 + 4, sy - sh, w - 8, sh, -0.5, 7, rr, { color: INK, width: 0.85, alpha: 0.20, passes: 1 });
    ctx.restore();
    stroke(ctx, pts, rr, { color: INK, width: 1.6, jitter: 0.5, alpha: 0.95, passes: 2 });
    line(ctx, x0 + 4, sy, x0 + w - 4, sy, rr, { color: INK, width: 1.1, alpha: 0.45, passes: 1 });

    // and the caption, which is the only thing on this sheet that is
    // allowed to be a number
    lettering(ctx, p.note, x0 + 4, y0 + h + 22, 10.5, rr,
      { color: PENCIL, width: 1.2, crooked: 0.25, alpha: 0.9 });
    if (p.mark) {
      lettering(ctx, p.mark, x0 + w - 96, y0 + 26, 12, rr,
        { color: BLUE, width: 1.6, crooked: 0.3, alpha: 0.85 });
    }
  }
  return canvas.toDataURL('image/png');
}, spec);

/* ---- the twelve lands ---------------------------------------------- */
const NAMES = {
  meadow: ['THE COMMON', 'where you woke'], kingdom: ['BRIM', 'the walled town'],
  castle: ['GREYWEATHER', 'the high seat'], beach: ['LONGSHORE', 'the coast'],
  ocean: ['THE WIDE BLUE', 'open water'], forest: ['THE PENWOOD', 'under the pines'],
  downs: ['THE HARROW DOWNS', 'farm country'], neighborhood: ['MAPLE COURT', 'the neighborhood'],
  city: ['GREYLINE CITY', 'downtown'], office: ['THE CUBICLE MILE', 'the office park'],
  canyon: ['SPLITROCK', 'the deep cut'], desert: ['THE BLEACH FLATS', 'the desert'],
};

const A = await import('../.tmp/audio.mjs').catch(async () => {
  await build({ entryPoints: ['src/core/Audio.ts'], bundle: true, format: 'esm', outfile: '.tmp/audio.mjs', logLevel: 'error' });
  return import('../.tmp/audio.mjs');
});

const render = (spec) => page.evaluate((s) => window.__booth.render(s), spec);

const panels = [];
let scale = 0;
const done = [];
for (const id of LANDS) {
  const voice = await render({ kind: 'land', land: id, seconds: 9, spacing: 3.4, len: 3, seed: 7, plot: 300 });
  const bed = await render({ kind: 'bed', land: id, seconds: 6, plot: 8 });
  done.push([id, voice, bed]);
  scale = Math.max(scale, voice.peak);
}
for (const [id, v, bed] of done) {
  const lv = A.LAND_VOICE[id];
  panels.push({
    name: NAMES[id][0], kicker: NAMES[id][1],
    wave: v.wave, spectrum: v.spectrum, bedSpectrum: bed.spectrum, scale: v.peak,
    mark: `${lv.voice} ${lv.reg}x`,
    note: `centre ${Math.round(v.centroid)}hz   level ${(20 * Math.log10(v.rms)).toFixed(0)}db`,
  });
}
writeFileSync('out/sound/sheet-lands.png', Buffer.from((await draw({
  title: 'THE SOUND OF TWELVE LANDS',
  sub: 'every voice and every room, rendered offline — ink is the land, pencil is the room it stands in',
  cols: 3, pw: 545, ph: 300, panels,
  ceil: Math.max(...panels.flatMap((p) => p.spectrum)) + 2, floor: 0,
})).split(',')[1], 'base64'));
console.log('out/sound/sheet-lands.png');

/* ---- and three borders --------------------------------------------- */
const BORDERS = [
  ['meadow', 'kingdom', 'THE NORTH GATE'],
  ['beach', 'ocean', 'THE SANDBAR'],
  ['downs', 'canyon', 'THE CANYON TRAIL'],
];
const bp = [];
for (const [from, to, name] of BORDERS) {
  const r = await render({ kind: 'border', land: from, to, seconds: 16, at: 7, spacing: 2.2, len: 2, seed: 3, plot: 460 });
  const q = await render({ kind: 'border', land: from, to, seconds: 16, at: 7, silent: true, plot: 460 });
  /* THE LOWER LANE IS A METER, NOT A SPECTRUM: the two rooms alone,
   * their level over the same sixteen seconds, drawn on a window of
   * plus and minus four decibels around where the crossing STARTED.
   * Flat across the middle is the whole claim of an equal-power fade,
   * and the previous draft of this sheet plotted it normalised to its
   * own maximum, which pinned every panel to the ceiling and proved
   * precisely nothing. */
  const env = q.env;
  const sm = env.map((_, i) => {
    const a = Math.max(0, i - 5), b = Math.min(env.length, i + 6);
    return Math.sqrt(env.slice(a, b).reduce((x, y) => x + y * y, 0) / (b - a));
  });
  const mean = (t0, t1) => {
    const a = sm.slice(Math.floor(t0 / q.envStep), Math.floor(t1 / q.envStep));
    return Math.sqrt(a.reduce((x, y) => x + y * y, 0) / a.length);
  };
  /* And what is plotted is the DEVIATION from the curve the fade is
   * supposed to follow — sqrt(cos²·a² + sin²·b²) between the two rooms'
   * own levels — because two rooms at honestly different levels are
   * SUPPOSED to arrive somewhere else, and a plot of the raw level
   * would show that arrival as a fault. Flat is correct; a sag in the
   * middle is the 3 dB hole equal power exists to close. */
  const la = mean(1, 6.6), lb = mean(11.5, 15.5);
  const WIN = 4;
  const meter = Array.from({ length: 200 }, (_, i) => {
    const t = (i / 199) * q.seconds;
    const v = sm[Math.min(sm.length - 1, Math.round(i / 199 * (sm.length - 1)))];
    const k = Math.max(0, Math.min(1, (t - 7) / 3.5));
    const co = Math.cos(k * Math.PI / 2), si = Math.sin(k * Math.PI / 2);
    const want = Math.sqrt(co * co * la * la + si * si * lb * lb);
    return Math.max(0, Math.min(1, 0.5 + (20 * Math.log10(v / want)) / (2 * WIN)));
  });
  bp.push({
    name, kicker: `${from} to ${to} — the fade opens at seven seconds and takes three and a half`,
    wave: r.wave, spectrum: meter, scale: r.peak, mid: true, flat: true,
    mark: `${A.LAND_VOICE[from].voice} to ${A.LAND_VOICE[to].voice}`,
    note: 'below: the two rooms alone, against the curve they should follow, +/-4db',
  });
}
writeFileSync('out/sound/sheet-borders.png', Buffer.from((await draw({
  title: 'THREE BORDERS',
  sub: 'above: everything you hear crossing. below: the two rooms alone, crossfading — the line must not sag',
  cols: 1, pw: 1180, ph: 300, panels: bp, ceil: 1, floor: 0,
})).split(',')[1], 'base64'));
console.log('out/sound/sheet-borders.png');

if (errors.length) console.log('page errors:', errors);
await browser.close();
