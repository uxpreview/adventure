// AUDIT THE SCORE OFF-SCREEN, the way `check-terrain.mjs` audits the
// ground: render it and assert it, before anybody claims anything.
//
//   node tools/check-audio.mjs
//
// This is the first session in this project whose product cannot be
// screenshotted. Five sessions of contact sheets photographed the
// world; nobody had ever MEASURED the sound, and Session 6.1 is the
// standing proof of what goes unnoticed when nobody looks — a note card
// had been running off the side of a phone since Session 1.
//
// So: every land's voice and bed rendered through an OfflineAudioContext
// (deterministic, no audio device, no user gesture, faster than real
// time) and asserted on the things A LISTENER WOULD NOTICE rather than
// the things that are easy to measure:
//
//   1. twelve lands are twelve sounds, and none of them is any other one
//   2. a land is as loud as MOODS says it is
//   3. the bed is the quietest thing in the mix
//   4. a border is an equal-power crossfade: no dip, no peak
//   5. the mix answers how hard you are going, monotonically
//   6. the mix answers the hour, monotonically
//   7. the canyon keeps a sound and the Common does not
//   8. nothing clips, with room left for the steps and the events
//
// WHAT IT CANNOT DO — and the session log says this too: it cannot
// HEAR. A measured spectrum is not a judgement. The ear gate is the
// owner's; `tools/render-wavs.mjs` is how it gets handed over.
import { openBooth, LANDS, bandDistance, db } from './audio-lib.mjs';
import { build } from 'esbuild';

await build({
  entryPoints: ['src/core/Audio.ts'],
  bundle: true, format: 'esm', outfile: '.tmp/audio.mjs', logLevel: 'error',
});
const A = await import('../.tmp/audio.mjs');

let fails = 0;
const fail = (m) => { console.log('  ✗ ' + m); fails++; };
const ok = (m) => console.log('  · ' + m);

const booth = await openBooth();
const R = (spec) => booth.render(spec);

/* ---- 0. the tables are complete ----------------------------------- */
console.log('the tables:');
{
  const used = new Set();
  for (const land of LANDS) {
    const v = A.LAND_VOICE[land];
    const b = A.BEDS[land];
    if (!v) fail(`${land} has no voice`);
    else {
      used.add(v.voice);
      if (!v.reason || v.reason.length < 24) fail(`${land}'s voice has no reason`);
      if (!A.VOICES[v.voice]) fail(`${land} names an instrument that does not exist`);
    }
    if (!b || !b.reason) fail(`${land} has no bed`);
  }
  const all = Object.keys(A.VOICES);
  const unused = all.filter((v) => !used.has(v));
  if (unused.length) fail(`instrument built and never played: ${unused.join(', ')}`);
  /* Doubling is a family; a COLLISION is two lands that are the same
   * land. What separates two members of a family is the register they
   * actually SOUND in — the mood's own scale times the table's `reg` —
   * and a family whose members sit less than a minor third apart is one
   * land played twice. */
  const median = (id) => {
    const f = A.MOODS[id].scale.map((x) => x * A.LAND_VOICE[id].reg).sort((a, b) => a - b);
    return f[Math.floor(f.length / 2)];
  };
  for (let i = 0; i < LANDS.length; i++) {
    for (let j = i + 1; j < LANDS.length; j++) {
      const a = LANDS[i], b = LANDS[j];
      if (A.LAND_VOICE[a].voice !== A.LAND_VOICE[b].voice) continue;
      const semis = Math.abs(12 * Math.log2(median(a) / median(b)));
      if (semis < 3) fail(`${a} and ${b} are the same instrument ${semis.toFixed(1)} semitones apart`);
      else ok(`${a} and ${b} are a family, ${semis.toFixed(0)} semitones apart`);
    }
  }
  ok(`${LANDS.length} lands, ${all.length} instruments, every one of them played`);
}

/* ---- 1. twelve lands, twelve sounds -------------------------------- */
console.log('\ntwelve lands, twelve sounds — closest pairs by spectrum:');
const land = {};
for (const id of LANDS) {
  land[id] = await R({ kind: 'land', land: id, seconds: 9, spacing: 3.4, len: 3, seed: 7 });
}
{
  const pairs = [];
  for (let i = 0; i < LANDS.length; i++) {
    for (let j = i + 1; j < LANDS.length; j++) {
      pairs.push([bandDistance(land[LANDS[i]].bands, land[LANDS[j]].bands), LANDS[i], LANDS[j]]);
    }
  }
  pairs.sort((a, b) => a[0] - b[0]);
  for (const [d, a, b] of pairs.slice(0, 4)) {
    console.log(`  ${a} / ${b}`.padEnd(34) + d.toFixed(3) +
      `   (${A.LAND_VOICE[a].voice} ${A.LAND_VOICE[a].reg}× / ${A.LAND_VOICE[b].voice} ${A.LAND_VOICE[b].reg}×)`);
  }
  // 0.30 is about "you would not mistake one for the other with your
  // eyes shut", calibrated against the pairs that SHOULD be close: two
  // lands of the same family one octave apart.
  if (pairs[0][0] < 0.30) fail(`${pairs[0][1]} and ${pairs[0][2]} are the same sound (${pairs[0][0].toFixed(3)})`);
  else ok(`closest pair is ${pairs[0][0].toFixed(3)} apart, and they are a family`);

  const cents = LANDS.map((id) => [Math.round(land[id].centroid), id]).sort((a, b) => a[0] - b[0]);
  console.log('  spectral centre, low to high: ' + cents.map(([c, id]) => `${id} ${c}`).join(', '));
}

/* ---- 2. a land is as loud as MOODS says --------------------------- */
console.log('\nthe level is where MOODS says it is:');
{
  const rows = [];
  for (const id of LANDS) {
    const dur = (A.LAND_VOICE[id].dur ?? 2.6) + 0.9;
    const one = await R({ kind: 'voice', land: id, seconds: dur, len: 1, maxPhrases: 1, first: 0.2, seed: 7 });
    rows.push([id, one.rms / A.MOODS[id].level, one.rms]);
  }
  const ratios = rows.map((r) => r[1]).sort((a, b) => a - b);
  const med = ratios[Math.floor(ratios.length / 2)];
  for (const [id, ratio] of rows) {
    const off = ratio / med;
    if (off < 0.75 || off > 1.33) {
      fail(`${id} renders ${(off > 1 ? off : 1 / off).toFixed(2)}× ${off > 1 ? 'louder' : 'quieter'} than its level says`);
    }
  }
  ok(`twelve voices meet within ${(Math.max(...ratios) / Math.min(...ratios)).toFixed(2)}× of one level`);
}

/* ---- 3. the bed is the quietest thing in the mix ------------------- */
console.log('\nthe bed is the quietest thing in the mix:');
{
  const beds = {};
  for (const id of LANDS) beds[id] = await R({ kind: 'bed', land: id, seconds: 6 });
  for (const id of LANDS) {
    const dur = (A.LAND_VOICE[id].dur ?? 2.6) + 0.9;
    const one = await R({ kind: 'voice', land: id, seconds: dur, len: 1, maxPhrases: 1, first: 0.2, seed: 7 });
    const ratio = beds[id].rms / one.rms;
    if (ratio > 0.8) fail(`${id}'s room is louder than ${id} (${db(ratio).toFixed(1)} dB)`);
  }
  const order = LANDS.map((id) => [beds[id].rms, id]).sort((a, b) => a[0] - b[0]);
  console.log('  quietest room to loudest: ' + order.map(([, id]) => id).join(' · '));
  if (order[0][1] !== 'canyon') fail('the canyon is not the quietest room in the game');
  if (order[order.length - 1][1] !== 'beach') fail('the sea is not the loudest room in the game');
  ok(`the canyon is ${db(order[order.length - 1][0] / order[0][0]).toFixed(0)} dB below the sea`);
}

/* ---- 4. a border is a crossfade, and it is equal power ------------- */
console.log('\na border is an equal-power crossfade:');
{
  // the curve itself
  let worst = 0;
  for (let i = 0; i <= 200; i++) {
    const [a, b] = A.equalPower(i / 200);
    worst = Math.max(worst, Math.abs(a * a + b * b - 1));
  }
  if (worst > 1e-6) fail(`the crossfade curve is not equal power (off by ${worst})`);
  else ok('cos/sin: the sum of powers is one all the way across');

  /* The same room on both sides, so anything the meter does in the
   * middle is the CURVE and not two rooms being different rooms. THE
   * OFFICE PARK, because it is the one room in the game that does not
   * breathe: a bed with a swell on it drifts under the measurement and
   * the drift is not a fault, it is weather. */
  const ref = await R({ kind: 'xfade-ref', land: 'office', seconds: 12, at: 4 });
  /* A meter, not a sample. The envelope is 50 ms windows and the RMS of
   * fifty milliseconds of NOISE bounces two decibels on its own, so
   * every reading below is a half-second average — which is also about
   * how long an ear takes to decide something got quieter. */
  const win = (r, t0, t1) => {
    const a = Math.floor(t0 / r.envStep), b = Math.floor(t1 / r.envStep);
    const s = r.env.slice(a, b);
    return Math.sqrt(s.reduce((x, y) => x + y * y, 0) / s.length);
  };
  const SMOOTH = 0.5;
  const at = (r, t) => win(r, Math.max(0, t - SMOOTH / 2), t + SMOOTH / 2);
  const before = win(ref, 1.5, 3.8);
  const after = win(ref, 8.0, 11.5);
  let dip = 0, bump = 0;
  for (let t = 4.2; t <= 7.3; t += 0.1) {
    const v = db(at(ref, t) / before);
    dip = Math.min(dip, v);
    bump = Math.max(bump, v);
  }
  console.log(`  through the fade: ${dip.toFixed(2)} dB low, +${bump.toFixed(2)} dB high, ` +
    `ends ${db(after / before).toFixed(2)} dB from where it started`);
  if (dip < -1.0) fail(`the crossfade dips ${dip.toFixed(2)} dB in the middle — that is the hole equal power exists to close`);
  if (bump > 1.0) fail(`the crossfade peaks ${bump.toFixed(2)} dB in the middle`);
  if (Math.abs(db(after / before)) > 0.5) fail('the crossfade does not arrive where it was going');

  /* And three real borders. The ROOMS are measured, not the melody:
   * a melody is intermittent by design, so a meter pointed at one reads
   * every gap between phrases as a hole. What must not dip or swell is
   * the thing that is on continuously — which is also the thing a
   * player is listening to without knowing they are. */
  for (const [from, to] of [['meadow', 'kingdom'], ['beach', 'ocean'], ['downs', 'canyon']]) {
    const r = await R({ kind: 'border', land: from, to, seconds: 16, at: 7, silent: true });
    const a = win(r, 3.0, 6.6);
    const b = win(r, 11.5, 15.5);
    /* A ROOM THAT BREATHES MOVES ON ITS OWN, and the sea breathes hard
     * on a seven-second count. So each land is rendered alone first and
     * asked how far it wanders from its own average; that much is
     * WEATHER and the crossfade does not have to answer for it. */
    const drift = async (id) => {
      const solo = await R({ kind: 'bed', land: id, seconds: 16, offset: id === from ? 0.4 : 2.3 });
      const mean = win(solo, 1, 15);
      let d = 0;
      for (let t = 1; t <= 15; t += 0.1) d = Math.max(d, Math.abs(db(at(solo, t) / mean)));
      return d;
    };
    const wobble = Math.max(await drift(from), await drift(to));
    /* Two rooms at honestly different levels, so "flat" is the wrong
     * word for what a good crossfade does: what it must do is follow
     * the equal-power interpolation BETWEEN them, sqrt(cos²·a² +
     * sin²·b²), and never leave a hole or a swell on the way. */
    let worstDev = 0, worstAt = 0;
    for (let t = 7.1; t <= 10.4; t += 0.1) {
      const [co, si] = A.equalPower((t - 7) / A.XFADE);
      const want = Math.sqrt(co * co * a * a + si * si * b * b);
      const dev = db(at(r, t) / want);
      if (Math.abs(dev) > Math.abs(worstDev)) { worstDev = dev; worstAt = t - 7; }
    }
    const allow = 1.0 + wobble;
    console.log(`  ${from} → ${to}: ${db(a).toFixed(1)} dB → ${db(b).toFixed(1)} dB, ` +
      `worst ${worstDev > 0 ? '+' : ''}${worstDev.toFixed(2)} dB off the curve at ${worstAt.toFixed(1)}s ` +
      `(these rooms breathe ${wobble.toFixed(2)} dB on their own)`);
    if (Math.abs(worstDev) > allow) {
      fail(`${from} → ${to} leaves the equal-power curve by ${worstDev.toFixed(2)} dB, ` +
        `which is more than its own weather`);
    }
    // and the same crossing with the melody over it, for the peak alone
    const full = await R({ kind: 'border', land: from, to, seconds: 16, at: 7, spacing: 2.2, len: 2, seed: 3 });
    if (full.peak > 0.5) fail(`${from} → ${to} peaks at ${full.peak.toFixed(3)}`);
  }
}

/* ---- 5. the mix answers the player -------------------------------- */
console.log('\nthe mix answers how hard the player is going:');
{
  // 0.45 standing still .. 1.35 flat out (App, twice a second)
  for (const id of ['meadow', 'canyon']) {
    const at = [];
    for (const k of [0.45, 0.7, 1.0, 1.35]) {
      const r = await R({ kind: 'land', land: id, seconds: 9, spacing: 3.4, len: 3, seed: 7, intensity: k });
      at.push([k, r.rms]);
    }
    for (let i = 1; i < at.length; i++) {
      if (at[i][1] <= at[i - 1][1]) fail(`${id} does not get louder between ${at[i - 1][0]} and ${at[i][0]}`);
    }
    console.log(`  ${id}: ` + at.map(([k, v]) => `${k}→${db(v).toFixed(1)}dB`).join('  '));
  }
  ok('standing still to flat out is monotone, in the melody and in the room');
}

/* ---- 6. the mix answers the hour ---------------------------------- */
console.log('\nthe mix answers the hour (and the day cycle was not re-opened):');
{
  const HOURS = [12, 16, 18, 20, 22];
  for (const h of HOURS) {
    if (h <= 16.5 && A.mixLevels('meadow', { hour: h }).night !== 0) {
      fail(`nightness at ${h}:00 is not zero — eight to four is the shipped page`);
    }
  }
  const rows = [];
  for (const h of HOURS) {
    const r = await R({ kind: 'land', land: 'forest', seconds: 9, spacing: 3.4, len: 3, seed: 7, hour: h });
    const m = A.mixLevels('forest', { hour: h });
    rows.push([h, r.centroid, r.rms, m.gap]);
  }
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][1] > rows[i - 1][1] + 1) fail(`the top does not close between ${rows[i - 1][0]}:00 and ${rows[i][0]}:00`);
    if (rows[i][2] > rows[i - 1][2] * 1.001) fail(`the mix does not thin between ${rows[i - 1][0]}:00 and ${rows[i][0]}:00`);
    if (rows[i][3] < rows[i - 1][3]) fail(`the phrases do not come further apart after ${rows[i - 1][0]}:00`);
  }
  console.log('  THE PENWOOD: ' + rows.map(([h, c, r, g]) =>
    `${h}h ${Math.round(c)}Hz/${db(r).toFixed(1)}dB/${g.toFixed(1)}s`).join('  '));
  ok('after dark: the top closes, the room thins, the phrases come further apart');
}

/* ---- 7. the canyon keeps a sound and the Common does not ----------- */
console.log('\nthe place answers you back:');
{
  const tailOf = async (id) => {
    const dur = (A.LAND_VOICE[id].dur ?? 2.6);
    const r = await R({ kind: 'voice', land: id, seconds: dur + 4.5, len: 1, maxPhrases: 1, first: 0.2, seed: 7 });
    const i0 = Math.floor((dur + 0.4) / r.envStep);
    const tail = r.env.slice(i0);
    const peak = Math.max(...r.env);
    return db((tail.reduce((a, b) => a + b, 0) / tail.length) / peak);
  };
  const canyon = await tailOf('canyon');
  const meadow = await tailOf('meadow');
  const castle = await tailOf('castle');
  const show = (v) => (v < -120 ? 'nothing at all' : v.toFixed(1) + ' dB');
  console.log(`  after the note has stopped: canyon ${show(canyon)}, ` +
    `castle ${show(castle)}, meadow ${show(meadow)}`);
  if (canyon - meadow < 6) fail('the canyon does not keep a sound any longer than a field does');
  else ok(`the cut answers ${(canyon - meadow).toFixed(0)} dB louder than the Common does`);
}

/* ---- 8. nothing clips --------------------------------------------- */
console.log('\nnothing clips, and there is room left for the steps:');
{
  let hottest = ['', 0];
  for (const id of LANDS) {
    const r = await R({ kind: 'land', land: id, seconds: 10, spacing: 2.0, len: 3, seed: 11, intensity: 1.35 });
    if (r.peak > hottest[1]) hottest = [id, r.peak];
  }
  console.log(`  hottest land, flat out, phrases on top of each other: ${hottest[0]} at ${hottest[1].toFixed(3)}`);
  // A step is 0.033 peak and an event up to 0.05; the score must leave
  // them somewhere to land, so the bar is far below 1.0 on purpose.
  if (hottest[1] > 0.5) fail(`${hottest[0]} peaks at ${hottest[1].toFixed(3)} — no headroom for the world's own voices`);
  else ok(`${db(hottest[1]).toFixed(0)} dB below full scale with the steps and the events still to come`);
}

if (booth.errors.length) {
  for (const e of booth.errors) fail('page error: ' + e);
}
await booth.close();

console.log(fails === 0
  ? '\nthe score renders, and every assertion holds.\nIT HAS NOT BEEN HEARD. That gate is the owner’s — tools/render-wavs.mjs.'
  : `\n${fails} FAILED`);
process.exit(fails ? 1 : 0);
