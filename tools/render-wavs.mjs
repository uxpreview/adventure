// HAND THE EAR GATE TO THE OWNER.
//
//   node tools/render-wavs.mjs
//
// A session that claims a sound is good is lying. `check-audio.mjs`
// measures the score and `shoot-sound.mjs` draws it, and neither of
// them has heard a single note of it — a measured spectrum is not a
// judgement and a plot is not a listen. So the last thing this session
// does with the score is render it to files a person can play, and say
// plainly that the verdict is not ours to give.
//
// Twelve land voices, three border crossings, and one land at four
// hours of the day. Everything is synthesised at render time from
// `src/core/Audio.ts` — there is not one audio asset in this repository
// and there never will be (QUALITY-BAR §3).
//
// Output: out/sound/*.wav (git-ignored — they are evidence, not art)
import { openBooth, LANDS, wav } from './audio-lib.mjs';
import { build } from 'esbuild';
import { mkdirSync, writeFileSync } from 'fs';

const RATE = 32000;
/* The score is mixed about twenty-six decibels below full scale so the
 * steps and the lands' own voices have somewhere to land on top of it.
 * A file at that level is unplayably quiet on a laptop, so every file
 * here gets the SAME sixteen-fold gain — never a per-file
 * normalisation, which would flatten the difference between a loud land
 * and a quiet one, and that difference is half the design. */
const LISTEN_GAIN = 16;
mkdirSync('out/sound', { recursive: true });
await build({
  entryPoints: ['src/core/Audio.ts'],
  bundle: true, format: 'esm', outfile: '.tmp/audio.mjs', logLevel: 'error',
});
const A = await import('../.tmp/audio.mjs');

const NAMES = {
  meadow: 'the-common', kingdom: 'brim', castle: 'castle-greyweather',
  beach: 'longshore', ocean: 'the-wide-blue', forest: 'the-penwood',
  downs: 'the-harrow-downs', neighborhood: 'maple-court', city: 'greyline-city',
  office: 'the-cubicle-mile', canyon: 'splitrock-canyon', desert: 'the-bleach-flats',
};

const booth = await openBooth();
const notes = [];
let n = 0;
const write = async (file, spec, what) => {
  const r = await booth.render({ ...spec, rate: RATE, samples: true, gain: LISTEN_GAIN });
  writeFileSync(`out/sound/${file}.wav`, wav(r.pcm, RATE));
  notes.push(`${file}.wav  —  ${what}`);
  console.log(`${String(++n).padStart(2)}. ${file}.wav  ${r.seconds.toFixed(0)}s  ` +
    `peak ${(r.peak * LISTEN_GAIN).toFixed(2)} of full scale`);
};

/* ---- twelve lands, each at its own natural pace ------------------- */
for (const id of LANDS) {
  const v = A.LAND_VOICE[id];
  await write(`land-${NAMES[id]}`, { kind: 'land', land: id, seconds: 17, seed: 7 },
    `${v.voice}, ${v.reg}x — ${v.reason}`);
}

/* ---- three borders ------------------------------------------------ */
for (const [from, to, what] of [
  ['meadow', 'kingdom', 'THE NORTH GATE: the music box gives way to the belfry'],
  ['beach', 'ocean', 'THE SANDBAR: the sea itself gives way to the bell on the mark'],
  ['downs', 'canyon', 'THE CANYON TRAIL: a bright string gives way to struck stone, and the stone answers back'],
]) {
  await write(`border-${NAMES[from]}-to-${NAMES[to]}`,
    { kind: 'border', land: from, to, seconds: 22, at: 9, spacing: 2.6, len: 2, seed: 3 },
    what);
}

/* ---- and one land at four hours ----------------------------------- */
for (const h of [12, 18, 21, 23]) {
  await write(`hours-the-penwood-${String(h).padStart(2, '0')}00`,
    { kind: 'land', land: 'forest', seconds: 17, seed: 7, hour: h },
    `THE PENWOOD at ${h}:00 — nightness ${A.mixLevels('forest', { hour: h }).night.toFixed(2)}`);
}

writeFileSync('out/sound/WHAT-TO-LISTEN-FOR.txt', `INKLANDS — the score, Session 8
================================

Every file here was synthesised from src/core/Audio.ts by
tools/render-wavs.mjs. There are no audio assets in this project and
there never will be.

All nineteen files carry THE SAME 16x gain and nothing else. In the
game the score is mixed about twenty-six decibels below full scale,
so that the footsteps and each land's own voices have room on top of
it; at that level a file is unplayably quiet. The gain is uniform on
purpose: a land that is quieter than another one here is quieter in
the game, by exactly as much.

THE GATE THIS SESSION COULD NOT RUN
-----------------------------------
The score has been rendered, measured and drawn. IT HAS NOT BEEN
HEARD — not by anybody. tools/check-audio.mjs asserts that twelve
lands are twelve sounds, that a border does not dip, that the mix
answers the hour and the walk, and that nothing clips; none of that
is a judgement about whether it is any good, and the session that
built it cannot supply one.

So the ear gate is yours. What it is worth asking:

1. LAND-*.wav — twelve lands, seventeen seconds each.
   Can you tell them apart with your eyes shut? Can you tell them
   apart a WEEK from now? That is the bar RuneScape sets and it is
   the reason this session exists.
   The doubling is deliberate: the Common and Maple Court are one
   family (the music box, an octave apart), the Penwood and the
   Harrow Downs are another (the plucked string), Brim, the Wide
   Blue and Splitrock are the bells, Greyweather and the Cubicle
   Mile are the held voice, and Longshore, Greyline and the Bleach
   Flats are air. Does a family sound like a family, or like a
   mistake?

2. BORDER-*.wav — three crossings. The fade opens at nine seconds
   and takes three and a half. Does it sound like a place you walk
   through, or like a switch somebody flipped? Is there a hole in
   the middle of it? (There should not be — it is equal power, and
   the meter says so — but a meter is not an ear.)

3. HOURS-*.wav — the Penwood at noon, six, nine and eleven. The
   room thins, the phrases come further apart, and every
   instrument's top closes. Is eleven at night still the same
   place, or has it become a different one?

WHAT IS NOT IN THESE FILES
--------------------------
The footsteps and the one-shot voices of each land (the lark, the
belfry, the gulls, the surf, the oars). They are bound to the live
audio context and are not part of the offline render, so what you
are hearing is the SCORE alone, with the rest of the world's sound
turned off. In the game they sit on top of this, which is why the
score is mixed twenty decibels below full scale.

${notes.join('\n')}
`);

console.log('\nout/sound/WHAT-TO-LISTEN-FOR.txt');
if (booth.errors.length) console.log('page errors:', booth.errors);
await booth.close();
