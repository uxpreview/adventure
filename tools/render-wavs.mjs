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

/* ================================================================== *
 * AND THE LAND VOICES — thirty-four one-shots, and NOT ONE OF THEM HAS
 * EVER BEEN HEARD (Session 14).
 *
 * `Audio.event` has grown every land session since Session 5 and its
 * whole output has been invisible to this pack, because Session 8's
 * offline render could only reach the SCORE — the beds and the phrases.
 * The note the owner has been reading since then says so in as many
 * words. Four more went in this session and it was not defensible to
 * add a fifth un-heard voice to a list of thirty.
 *
 * They are grouped by the land they belong to, because that is the
 * question worth asking about them: does a land's ambient event sound
 * like the same PLACE as its instrument, or like a sound effect somebody
 * dropped on top of it?
 * ================================================================== */
const VOICES = [
  ['the-common', ['lark', 'well-plink']],
  ['brim', ['brim-bell', 'market-murmur', 'pigeon-flap']],
  ['castle-greyweather', ['banner-snap', 'rook-caw']],
  ['longshore', ['surf-break', 'gull-cry', 'halyard', 'oar', 'oar-ship']],
  ['the-wide-blue', ['bell-buoy']],
  ['the-harrow-downs', ['mill-creak', 'sheep', 'field-work']],
  ['the-penwood', ['axe-far', 'tarn-drip', 'pine-tick']],
  ['splitrock-canyon', ['stone-fall', 'slot-wind', 'hull-rag']],
  ['the-bleach-flats', ['grit-run', 'palm-rattle', 'can-knock']],
  ['maple-court', ['sprinkler', 'far-dog', 'screen-door']],
  ['greyline-city', ['crossing-tick', 'heels']],
  ['the-cubicle-mile', ['plant-shift', 'door-hiss', 'cup-turn', 'car-door']],
];
console.log('');
for (const [land, names] of VOICES) {
  for (const name of names) {
    await write(`voice-${land}-${name}`,
      { kind: 'event', name, land: 'meadow', seconds: 5, silent: true },
      `${land}: ${name}`);
  }
}

writeFileSync('out/sound/WHAT-TO-LISTEN-FOR.txt', `INKLANDS — the score, Session 8
================================

Every file here was synthesised from src/core/Audio.ts by
tools/render-wavs.mjs. There are no audio assets in this project and
there never will be.

Every file carries THE SAME 16x gain and nothing else. In the
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

4. VOICE-*.wav — THE THIRTY-FOUR LAND VOICES, added Session 14, and
   until now not one of them had ever been rendered to anything a
   person could play. They are the one-shots each land fires as you
   walk it: the lark and the well chain in the Common, the belfry
   and the market in Brim, the surf and the gulls and the oar on
   the coast, the mill and the sheep on the Downs, the axe and the
   drip and the tick of a pine in the Penwood, stone falling in the
   canyon, grit and two full water cans in the Flats, a sprinkler
   and a dog and a screen door in Maple Court, a crossing box
   ticking for nobody in the city, and the plant on the roof of the
   Cubicle Mile.

   Each file is ONE firing, from the top, in five seconds of
   silence — no bed and no phrases under it, so you are hearing the
   voice alone, which is not how it ever sounds in the game.

   What is worth asking: does the voice belong to the same PLACE as
   the instrument in that land's LAND-*.wav, or does it sound like
   a sound effect dropped on top of one? And is any of them too
   often, too loud, or too obviously a synthesiser?

WHAT IS NOT IN THESE FILES
--------------------------
The footsteps, and the score under the voices (the voice files are
dry, on purpose). What you are hearing in LAND-*.wav is the SCORE
alone with the rest of the world's sound turned off; in the game
the two sit on top of each other, which is why the score is mixed
twenty decibels below full scale.

${notes.join('\n')}
`);

console.log('\nout/sound/WHAT-TO-LISTEN-FOR.txt');
if (booth.errors.length) console.log('page errors:', booth.errors);
await booth.close();
