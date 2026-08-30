import type { RegionId } from '../world/layout';

/** Per-land mood for the generative music layer. */
type Mood = {
  /** Scale degrees in Hz the melody may draw from. */
  scale: number[];
  /** Average seconds between phrases (randomized ±40%). */
  gap: number;
  /** Melody layer volume, 0 to silence the layer. */
  level: number;
};

const A3 = 220;
const st = (semis: number, base = A3) => base * Math.pow(2, semis / 12);
// Per-region moods: the melody's MODE. What a land is played ON is the
// table below this one, and that is nine-tenths of the effect
// (WORLD-SYSTEMS §9 move 1) — twelve moods on one instrument was a
// world with one voice, and it is what Session 8 was called to fix.
export const MOODS: Record<RegionId, Mood> = {
  // the starting meadow — brightest: major pentatonic, short gaps
  meadow: { scale: [3, 5, 7, 10, 12, 15, 17].map((s) => st(s)), gap: 4.5, level: 0.030 },
  // the coast — major add6, unhurried
  beach: { scale: [0, 4, 7, 9, 12, 16].map((s) => st(s)), gap: 6.0, level: 0.026 },
  // open water — bare fifths and ninths, long swells between phrases
  ocean: { scale: [0, 7, 12, 14, 19].map((s) => st(s, A3 / 2)), gap: 9.0, level: 0.020 },
  // under the pines — minor pentatonic, sparse
  forest: { scale: [0, 3, 5, 7, 10, 12].map((s) => st(s)), gap: 7.5, level: 0.022 },
  // the walled town — dorian, a fair on a weekday
  kingdom: { scale: [0, 2, 3, 5, 7, 9, 10, 12].map((s) => st(s)), gap: 5.5, level: 0.026 },
  // the keep — low, held, ceremonial
  castle: { scale: [0, 3, 7, 8, 12].map((s) => st(s, A3 / 2)), gap: 9.0, level: 0.018 },
  // porches and sprinklers — homely major with a leading tone
  neighborhood: { scale: [0, 4, 5, 7, 11, 12].map((s) => st(s)), gap: 6.0, level: 0.024 },
  // downtown — mixolydian, lower, distracted
  city: { scale: [0, 4, 7, 10, 12, 14].map((s) => st(s, A3 / 2)), gap: 7.0, level: 0.020 },
  // the office park — two practiced notes, nearly nothing
  office: { scale: [0, 2, 7].map((s) => st(s)), gap: 11.0, level: 0.012 },
  // the canyon — open low fifths a long way apart
  canyon: { scale: [0, 7, 12].map((s) => st(s, A3 / 2)), gap: 12.0, level: 0.014 },
  // the desert — a phrygian shadow, sparse
  desert: { scale: [0, 1, 5, 7, 10].map((s) => st(s)), gap: 10.0, level: 0.016 },
  // farmland between everywhere — pastoral major
  downs: { scale: [0, 2, 4, 7, 9, 12].map((s) => st(s)), gap: 6.0, level: 0.024 },
};

/* ================================================================== *
 * THE INSTRUMENT BOX — five voices, and they are FUNCTIONS.
 *
 * Every voice here takes the context it is to be built in, the node it
 * is to be played into, and the time it starts. Not one of them reads
 * `this.ctx`, `ctx.currentTime`, `performance.now()` or a timer — which
 * is the whole reason `tools/check-audio.mjs` can exist, because an
 * OfflineAudioContext renders a GRAPH and not a system. Anything that
 * waits on real time renders silence.
 *
 * That refactor was taken FIRST, before the two new voices were
 * written, on the session brief's advice, and the advice was right: it
 * is thirty minutes done in that order and an afternoon done in the
 * other one.
 *
 * Law (QUALITY-BAR §3, WORLD-SYSTEMS §9): zero audio assets, so every
 * voice is synthesis; nothing outside this file invents an instrument,
 * exactly as nothing outside `palette.ts` invents a colour.
 * ================================================================== */

/** Both `AudioContext` and `OfflineAudioContext` are one of these. */
export type Ctx = BaseAudioContext;

export type VoiceOpts = {
  /** Peak into `dest`, before the bus level. 1 is the voice's own full. */
  gain?: number;
  /** 0 dark .. 1 open. The hour closes this after dark. */
  tone?: number;
  /** Seconds. Each voice has a natural one; a land may lengthen it. */
  dur?: number;
  /** 0 bright .. 1 dead. Only the string and the bell listen. */
  damp?: number;
  /** Deterministic randomness, so an offline render repeats exactly. */
  rand?: () => number;
};

export type Voice = (
  ctx: Ctx, dest: AudioNode, freq: number, t0: number, o?: VoiceOpts
) => void;

export type VoiceId = 'box' | 'string' | 'bowed' | 'bell' | 'air';

/** A tiny deterministic PRNG, so a render is a render and not a mood. */
export function srand(seed: number): () => number {
  let s = (seed | 0) || 1;
  return () => {
    s = (s * 1664525 + 1013904223) | 0;
    return ((s >>> 8) & 0xffffff) / 0x1000000;
  };
}

/* Noise costs a buffer, and a buffer per note costs a garbage collection
 * every four seconds. One per (context, length, seed), kept alive as
 * long as the context is. */
/** The world's noise, in seconds. Everything that needs noise reads
 *  from this one buffer at a different offset. */
export const NOISE_SECONDS = 4;
const noiseCache = new WeakMap<Ctx, Map<string, AudioBuffer>>();
function noiseBuf(ctx: Ctx, seconds: number, seed = 7): AudioBuffer {
  let m = noiseCache.get(ctx);
  if (!m) noiseCache.set(ctx, (m = new Map()));
  const key = `${seconds.toFixed(3)}|${seed}`;
  const hit = m.get(key);
  if (hit) return hit;
  const buf = ctx.createBuffer(1, Math.max(1, Math.floor(ctx.sampleRate * seconds)), ctx.sampleRate);
  const d = buf.getChannelData(0);
  const r = srand(seed);
  for (let i = 0; i < d.length; i++) d[i] = r() * 2 - 1;
  m.set(key, buf);
  return buf;
}

/**
 * THE MUSIC BOX — what this game has always had: a sine with one
 * fast-decaying bright partial over it. Small, struck, and gone.
 */
const box: Voice = (ctx, dest, freq, t0, o = {}) => {
  const g0 = o.gain ?? 1;
  const tone = o.tone ?? 1;
  const dur = o.dur ?? 2.4;
  const r = o.rand ?? Math.random;
  for (const [mult, vol, decay] of [
    [1, g0, dur],
    [4, 0.18 * g0 * tone, dur * 0.21],
  ] as const) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq * mult * (1 + (r() - 0.5) * 0.003);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + decay);
    osc.connect(g).connect(dest);
    osc.start(t0);
    osc.stop(t0 + decay + 0.1);
  }
};

/**
 * THE PLUCKED STRING — Karplus–Strong, and §9 is right that it is the
 * single highest-value addition to this box: it costs about thirty
 * lines and it sounds nothing whatsoever like a sine.
 *
 * A burst of noise into a delay line one period long, with a one-pole
 * lowpass in the feedback so the high partials die first — which is
 * what a real string does and what no envelope on an oscillator will
 * ever fake. It is rendered into a BUFFER rather than wired as a
 * DelayNode fed back on itself, for one hard reason: a feedback cycle
 * in Web Audio is floored at one render quantum (128 samples), so a
 * wired version cannot play a note above about 340 Hz, and half this
 * world's scales live above that. Rendering it is also exact, cheap and
 * cacheable — thirty milliseconds of arithmetic, once per pitch.
 */
const ksCache = new WeakMap<Ctx, Map<string, AudioBuffer>>();
/** The string is rendered at half rate and resampled by the source
 *  node: a damped string at 220 Hz has nothing above 8 kHz to lose, and
 *  it halves both the arithmetic and the megabytes a phone has to hold.
 *  One buffer per PITCH, whose noise burst is seeded from the pitch —
 *  so every string on the instrument is its own string, and it is the
 *  same string every time you pluck it, which is what a string is. */
const KS_RATE = 22050;
function ksBuffer(ctx: Ctx, freq: number, dur: number, damp: number): AudioBuffer {
  let m = ksCache.get(ctx);
  if (!m) ksCache.set(ctx, (m = new Map()));
  const key = `${freq.toFixed(1)}|${dur.toFixed(2)}|${damp.toFixed(2)}`;
  const hit = m.get(key);
  if (hit) return hit;
  const seed = Math.round(freq * 7) + 3;

  const sr = KS_RATE;
  const n = Math.max(2, Math.round(sr / freq));
  const len = Math.max(n + 1, Math.floor(sr * dur));
  const buf = ctx.createBuffer(1, len, sr);
  const out = buf.getChannelData(0);

  // the pluck itself: a burst of noise, one period long
  const line = new Float32Array(n);
  const r = srand(seed);
  for (let i = 0; i < n; i++) line[i] = r() * 2 - 1;

  // loss per SAMPLE, chosen so the note is 60 dB down at `dur`
  const loss = Math.pow(0.001, 1 / (dur * sr));
  const b = 0.35 + 0.45 * damp; // how fast the top comes off
  let idx = 0;
  let prev = 0;
  let peak = 1e-6;
  for (let i = 0; i < len; i++) {
    const cur = line[idx];
    out[i] = cur;
    if (Math.abs(cur) > peak) peak = Math.abs(cur);
    line[idx] = (cur * (1 - b) + prev * b) * loss;
    prev = cur;
    idx = idx + 1 === n ? 0 : idx + 1;
  }
  // normalise, and take the very front off so the burst is a pluck and
  // not a click: two milliseconds of ramp is a fingertip
  const inv = 1 / peak;
  const front = Math.min(len, Math.floor(sr * 0.002));
  for (let i = 0; i < len; i++) {
    out[i] *= inv * (i < front ? i / front : 1);
  }
  m.set(key, buf);
  return buf;
}

const plucked: Voice = (ctx, dest, freq, t0, o = {}) => {
  const dur = o.dur ?? 2.6;
  const r = o.rand ?? Math.random;
  const src = ctx.createBufferSource();
  src.buffer = ksBuffer(ctx, freq, dur, o.damp ?? 0.45);
  // the same string, and never twice the same hand on it: a few cents
  // and a slightly different body is the whole difference between an
  // instrument and a sample
  src.playbackRate.value = 1 + (r() - 0.5) * 0.006;
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  // the body of the instrument, and what the hour closes
  lp.frequency.value = Math.min(16000, freq * (4 + 8 * (o.tone ?? 1)) * (0.9 + r() * 0.2));
  lp.Q.value = 0.4;
  const g = ctx.createGain();
  g.gain.value = (o.gain ?? 1) * 0.62;
  src.connect(lp).connect(g).connect(dest);
  src.start(t0);
  src.stop(t0 + dur + 0.05);
};

/**
 * THE BOWED / HELD VOICE — a saw through a resonant lowpass with a slow
 * attack, for the lands that stand still: a keep with nobody in it, and
 * two notes of hold music on a telephone nobody picks up.
 *
 * The attack is the whole instrument. Everything else in this box
 * STARTS at its loudest; this one arrives.
 */
const bowed: Voice = (ctx, dest, freq, t0, o = {}) => {
  const dur = o.dur ?? 3.4;
  const tone = o.tone ?? 1;
  const r = o.rand ?? Math.random;
  const attack = Math.min(0.8, dur * 0.32);
  const osc = ctx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.value = freq * (1 + (r() - 0.5) * 0.004);
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.Q.value = 5.5; // the resonance IS the bow
  const f0 = freq * 1.35;
  const f1 = freq * (2.0 + 1.6 * tone);
  lp.frequency.setValueAtTime(f0, t0);
  lp.frequency.exponentialRampToValueAtTime(f1, t0 + attack);
  lp.frequency.exponentialRampToValueAtTime(Math.max(40, f0 * 0.8), t0 + dur);
  const g = ctx.createGain();
  const vol = (o.gain ?? 1) * 0.30;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.linearRampToValueAtTime(vol, t0 + attack);
  g.gain.setValueAtTime(vol, t0 + dur * 0.62);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(lp).connect(g).connect(dest);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
};

/**
 * STRUCK METAL — an inharmonic partial stack with a long tail. A bell
 * is not a note; it is five notes that do not agree, and the reason it
 * reads as bronze is that not one of the ratios is a whole number.
 * `bell-buoy` (Session 5) is already this instrument by hand; this is
 * the same physics with a pitch you can ask for.
 */
const BELL_PARTIALS: [number, number, number][] = [
  // ratio, level, share of the tail
  [1.00, 1.00, 1.00],
  [2.76, 0.42, 0.62],
  [5.40, 0.22, 0.34],
  [8.93, 0.11, 0.19],
];
const bell: Voice = (ctx, dest, freq, t0, o = {}) => {
  const dur = o.dur ?? 3.2;
  const g0 = (o.gain ?? 1) * 0.52;
  const tone = o.tone ?? 1;
  const damp = o.damp ?? 0;
  const r = o.rand ?? Math.random;
  const j = 0.99 + r() * 0.02; // no two strikes are the same strike
  BELL_PARTIALS.forEach(([ratio, lvl, tail], i) => {
    if (i > 1 && tone < 0.4 && i > 2) return; // after dark the top goes
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq * ratio * j;
    const g = ctx.createGain();
    const vol = g0 * lvl * (i === 0 ? 1 : tone);
    const decay = dur * tail * (1 - 0.45 * damp);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + 0.006);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + decay);
    osc.connect(g).connect(dest);
    osc.start(t0);
    osc.stop(t0 + decay + 0.05);
  });
};

/**
 * AIR — filtered noise with a moving resonant peak. The sea, the hum
 * off a grating, the wind with nothing to move. `surge` (Session 5) is
 * already this instrument; this is the version that takes a pitch, so
 * that a land whose voice is air still has a MODE like everywhere else.
 */
const air: Voice = (ctx, dest, freq, t0, o = {}) => {
  const dur = o.dur ?? 2.8;
  const tone = o.tone ?? 1;
  const up = dur * 0.42;
  const r = o.rand ?? Math.random;
  const src = ctx.createBufferSource();
  // ONE noise buffer in the whole game (the beds share it); a gust is a
  // different PLACE in it, not a different megabyte of it
  src.buffer = noiseBuf(ctx, NOISE_SECONDS, 11);
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.Q.value = 4.2; // resonant enough to have a pitch, open enough to be air
  bp.frequency.setValueAtTime(freq * 0.78, t0);
  bp.frequency.exponentialRampToValueAtTime(freq * (1.05 + 0.3 * tone), t0 + up);
  bp.frequency.exponentialRampToValueAtTime(Math.max(40, freq * 0.62), t0 + dur);
  const g = ctx.createGain();
  const vol = (o.gain ?? 1) * 6.0;
  g.gain.value = 0.0001;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.linearRampToValueAtTime(vol, t0 + up);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(bp).connect(g).connect(dest);
  src.start(t0, r() * (NOISE_SECONDS - dur - 0.1));
  src.stop(t0 + dur + 0.05);
};

export const VOICES: Record<VoiceId, Voice> = {
  box, string: plucked, bowed, bell, air,
};

/* ================================================================== *
 * WHICH LAND IS PLAYED ON WHAT — WORLD-SYSTEMS §9 move 1, and the
 * source is decided (§9, "and the source is decided by the story now"):
 * THE WORLD PLAYS IT. Every instrument below is a thing that is
 * actually there. Nothing is scored. You are hearing where you are.
 *
 * Five voices, twelve lands, and the doubling is deliberate — two lands
 * on the plucked string in different registers is a FAMILY; twelve
 * lands on twelve unrelated instruments is a sound library. The
 * families here are: what you wake to (box), what grows (string), what
 * was cast and hung up (bell), what stands still (bowed), and what
 * moves without being touched (air).
 *
 * `reg` multiplies the mood's scale, so a family is separated by
 * register the way two members of one are. `gain` is the voice's own
 * loudness trim ONLY — `MOODS[land].level` is still what decides how
 * loud a land is, and `tools/check-audio.mjs` asserts that the rendered
 * level actually tracks it.
 * ================================================================== */

export type LandVoice = {
  voice: VoiceId;
  /** Multiplies the mood's scale: the register the family speaks in. */
  reg: number;
  /**
   * Loudness trim, and every one of these numbers was MEASURED into
   * place rather than chosen: a resonant bandpass passes a fraction of
   * what a sine does, and a high string decays faster than a low one,
   * so equal nominal gains render eighteen decibels apart. Change one
   * and re-run `node tools/check-audio.mjs`, which asserts that all
   * twelve lands still meet within a third of one level.
   */
  gain: number;
  /** Seconds; a land may hold its note longer than the voice's own. */
  dur?: number;
  /** 0 bright .. 1 dead. */
  damp?: number;
  /** Why this land is played on this, in one line. */
  reason: string;
};

export const LAND_VOICE: Record<RegionId, LandVoice> = {
  meadow: { voice: 'box', reg: 2, gain: 0.57, reason:
    'the well chain and the lark — the smallest bright thing in the world, and the one you wake to' },
  neighborhood: { voice: 'box', reg: 1, gain: 0.53, dur: 3.2, reason:
    'a wind chime on a porch two doors down: the Common grown up, slowed down, and still home' },
  forest: { voice: 'string', reg: 1, gain: 1.15, damp: 0.72, dur: 3.0, reason:
    'pine is what a string is made of — something plucked under the trees, and the wood eats the top of it' },
  downs: { voice: 'string', reg: 2, gain: 3.60, damp: 0.10, reason:
    'the same wood out in the open light, higher and undamped: the family that grows things' },
  kingdom: { voice: 'bell', reg: 1, gain: 0.93, dur: 2.6, reason:
    'the belfry, and a market that finally opened — the only land whose instrument the player can walk up to' },
  ocean: { voice: 'bell', reg: 0.75, gain: 0.91, dur: 4.6, damp: 0.2, reason:
    'the bell buoy on the mark is the only made thing out there, and the swell rings it whether or not you came' },
  canyon: { voice: 'bell', reg: 0.75, gain: 0.64, dur: 5.4, reason:
    'stone struck once by stone a long way off, and the cut keeps it — the lowest and slowest voice in the game' },
  castle: { voice: 'bowed', reg: 1, gain: 0.64, dur: 4.4, reason:
    'wind in a stone building with nobody in it: held, low, ceremonial, and not going anywhere' },
  office: { voice: 'bowed', reg: 2, gain: 0.96, dur: 1.7, reason:
    'two notes of hold music on a telephone nobody picks up — the same held voice, on hold' },
  beach: { voice: 'air', reg: 1, gain: 0.91, dur: 3.4, reason:
    'the sea is already this instrument; the land is played on the water it is made of' },
  city: { voice: 'air', reg: 0.75, gain: 1.76, dur: 3.0, reason:
    'warm air off a grating under the whole street: the same voice as the sea, made by a machine' },
  desert: { voice: 'air', reg: 3, gain: 0.56, dur: 2.6, reason:
    'wind with nothing left to move but the top of the page: high, thin, and unanswered' },
};

/* ================================================================== *
 * THE BEDS — WORLD-SYSTEMS §9 move 2.
 *
 * `startAmbient` was one lowpass noise loop at 220 Hz and it was
 * IDENTICAL in the canyon and the office park. A bed is the quietest
 * thing in the mix and the thing you notice only when it stops, so it
 * is authored per land and it is authored as a ROOM: what the room is
 * made of (the filter), whether it breathes (the swell), and how much
 * of it there is at all (the level).
 * ================================================================== */

export type Bed = {
  type: BiquadFilterType;
  freq: number;
  q: number;
  /** A second resonant peak — what the room is actually made of. */
  peak?: number;
  peakQ?: number;
  peakGain?: number;
  /**
   * The room's gain at the SOURCE — not its loudness, which depends on
   * what the filter above lets through and is therefore measured rather
   * than declared. `check-audio` asserts the two things that matter:
   * every room is under the land it is the room of, and the canyon is
   * the quietest in the game while the sea is the loudest.
   */
  level: number;
  /** Seconds per breath. Omitted, the room does not breathe. */
  swell?: number;
  /** How far the swell moves the filter, as a fraction of `freq`. */
  swellDepth?: number;
  reason: string;
};

export const BEDS: Record<RegionId, Bed> = {
  meadow: { type: 'lowpass', freq: 300, q: 0.7, level: 0.0136, swell: 14, swellDepth: 0.22,
    reason: 'open field air, and it moves slowly because there is nothing here to hurry it' },
  beach: { type: 'lowpass', freq: 440, q: 0.7, peak: 180, peakQ: 1.1, peakGain: 6,
    level: 0.0104, swell: 7, swellDepth: 0.45,
    reason: 'the loudest bed in the game and the only one that breathes on a count you can feel' },
  ocean: { type: 'lowpass', freq: 300, q: 0.6, level: 0.0111, swell: 9.5, swellDepth: 0.5,
    reason: 'the same water from inside it: broader, lower, and further between' },
  forest: { type: 'bandpass', freq: 900, q: 0.75, level: 0.0070, swell: 11, swellDepth: 0.3,
    reason: 'wind in needles is a HIGH hush, which is the one thing that separates a wood from a field' },
  kingdom: { type: 'lowpass', freq: 240, q: 0.7, peak: 520, peakQ: 0.9, peakGain: 4,
    level: 0.0154, reason: 'a town at the far end of a street: too far to be voices, near enough to be people' },
  castle: { type: 'lowpass', freq: 165, q: 0.8, level: 0.0106, swell: 17, swellDepth: 0.25,
    reason: 'a stone building with nobody in it, and the draught takes seventeen seconds to cross the hall' },
  neighborhood: { type: 'lowpass', freq: 280, q: 0.7, level: 0.0132, swell: 16, swellDepth: 0.18,
    reason: 'a mower three streets over and the rest of the afternoon doing nothing at all' },
  city: { type: 'lowpass', freq: 130, q: 0.9, peak: 88, peakQ: 3.2, peakGain: 8,
    level: 0.0132, reason: 'the hum: one note the whole street is standing on, and it never once moves' },
  office: { type: 'bandpass', freq: 300, q: 1.6, level: 0.0097,
    reason: 'air handling — dead steady, because the one thing a building like this promises is that nothing will change' },
  canyon: { type: 'lowpass', freq: 95, q: 0.7, level: 0.0060,
    reason: 'near-silence, and it is the quietest bed in the game so that the tail on everything else can be heard' },
  desert: { type: 'bandpass', freq: 1500, q: 0.55, level: 0.0032, swell: 13, swellDepth: 0.35,
    reason: 'high and thin: the top of the page, moving, with nothing under it' },
  downs: { type: 'lowpass', freq: 340, q: 0.7, level: 0.0127, swell: 15, swellDepth: 0.25,
    reason: 'the air of the Common over more of it: the two green lands agree, and they are supposed to' },
};

/**
 * AND THE TAIL. §9 asks for "the canyon's near-silence with a long tail
 * on EVERYTHING else", and a tail is not a bed — it is what the place
 * does to a sound after you have made it. One delay with feedback,
 * shared, whose MIX ramps per land: the cut repeats you, the empty keep
 * answers you a little, and everywhere else is a field and does not.
 */
export const TAILS: Partial<Record<RegionId, { time: number; feedback: number; mix: number }>> = {
  canyon: { time: 0.42, feedback: 0.46, mix: 0.55 },
  castle: { time: 0.29, feedback: 0.30, mix: 0.30 },
};

/* ================================================================== *
 * THE BORDER IS A CROSSFADE — §9 move 3.
 *
 * Equal power, not equal amplitude: two uncorrelated sources at 0.5
 * each are 3 dB DOWN in the middle, which is a dip you can hear and
 * exactly the thing that makes a fade sound like a fault. cos/sin of
 * the quarter circle keeps the sum of squares at one all the way
 * across, and `tools/check-audio.mjs` renders it and proves it rather
 * than taking this comment's word for it.
 * ================================================================== */

export const XFADE = 3.5;

/* ================================================================== *
 * THE MIX — one function, because two things have opinions about it
 * and both of them are already plumbed (§9 moves 4 and 5): how hard the
 * player is going, and what time it is.
 *
 * It is a pure function of a land, an hour and an intensity so that
 * `tools/check-audio.mjs` can assert the numbers the game actually
 * mixes with rather than a copy of them written for the test. The class
 * below ramps TOWARD these; the offline renderer sets them directly.
 * ================================================================== */

export type Mix = {
  /** The melody bus. */
  music: number;
  /** The ambient bus — a multiplier over the bed's own authored level. */
  ambient: number;
  /** How much of this place comes back at you. */
  tail: number;
  /** How open every instrument's top is: 1 at noon, closed after dark. */
  tone: number;
  /** Average seconds between phrases. */
  gap: number;
  /** 0 broad daylight .. 1 the middle of the night. */
  night: number;
};

/** How open an instrument's top is at a given nightness. One curve. */
export const toneAt = (night: number) => 1 - 0.55 * night;

export function mixLevels(
  land: RegionId,
  o: { hour?: number; intensity?: number; ambient?: number } = {}
): Mix {
  const mood = MOODS[land] ?? MOODS.meadow;
  const night = nightnessAt(o.hour ?? 12);
  const k = o.intensity ?? 1;
  // a room comes up around somebody who is moving through it, and it is
  // a lean and not a level: 8% across the whole range of the walk
  const lean = 0.92 + 0.13 * Math.max(0, Math.min(1.5, k) - 0.45);
  return {
    music: mood.level * k,
    ambient: (o.ambient ?? 1) * (1 - 0.32 * night) * lean,
    tail: TAILS[land]?.mix ?? 0,
    tone: toneAt(night),
    gap: mood.gap * (1 + 0.45 * night),
    night,
  };
}

/** [outgoing, incoming] at 0..1 through the crossfade. */
export function equalPower(k: number): [number, number] {
  const t = Math.max(0, Math.min(1, k)) * Math.PI * 0.5;
  return [Math.cos(t), Math.sin(t)];
}

const EP_STEPS = 65;
function epCurve(dir: 'in' | 'out', scale = 1): Float32Array {
  const c = new Float32Array(EP_STEPS);
  for (let i = 0; i < EP_STEPS; i++) {
    const [out, inn] = equalPower(i / (EP_STEPS - 1));
    c[i] = (dir === 'in' ? inn : out) * scale;
  }
  return c;
}

/** Ramp a gain in or out on the equal-power curve, safely re-entrant. */
export function crossfade(p: AudioParam, dir: 'in' | 'out', t: number, dur = XFADE) {
  const from = dir === 'out' ? p.value : 1;
  try {
    // a second border inside three and a half seconds must not throw:
    // hold whatever the param is at, then curve from there
    const hold = (p as AudioParam & { cancelAndHoldAtTime?: (t: number) => void });
    if (hold.cancelAndHoldAtTime) hold.cancelAndHoldAtTime(t);
    else p.cancelScheduledValues(t);
    p.setValueCurveAtTime(epCurve(dir, dir === 'out' ? from : 1), t, dur);
  } catch {
    p.cancelScheduledValues(t);
    p.linearRampToValueAtTime(dir === 'in' ? 1 : 0, t + dur);
  }
}

/* ================================================================== *
 * A PHRASE — the melody, as a function of a clock you hand it.
 *
 * The live scheduler and the offline renderer call THIS, which is the
 * only way `check-audio` can prove the thing the player actually hears
 * rather than a stand-in for it. `t0` is explicit; nothing in here
 * reads `currentTime` and nothing in here waits.
 * ================================================================== */

export type Played = { voice: VoiceId; reg: number; gain: number; land: RegionId };

export type PhraseOpts = {
  rand?: () => number;
  /** 0 broad daylight .. 1 the middle of the night. */
  night?: number;
  /** Where the last phrase left the scale, so the melody wanders. */
  from?: number;
  /** ch06: the two practised notes, a few cents short of where they live. */
  detune?: number;
  /** The gallery: a second voice a sixteenth behind. */
  echo?: number;
  /** How many notes; the default is the shipped 1–3. */
  len?: number;
  /**
   * Which instruments play it, and how loud each. One entry normally;
   * two while a border is crossing — the SAME notes on the land you are
   * leaving and the land you are entering, at equal power. A crossfade
   * of instruments, not of tunes: two tunes at once is a mistake, and
   * one tune changing what it is played on is a border.
   */
  on?: Played[];
};

/** Everything one phrase does, and where it left the scale. */
export function phrase(
  ctx: Ctx, dest: AudioNode, land: RegionId, t0: number, o: PhraseOpts = {}
): number {
  const mood = MOODS[land] ?? MOODS.meadow;
  const r = o.rand ?? Math.random;
  const night = o.night ?? 0;
  const on = o.on ?? [playedBy(land)];
  const detune = o.detune ?? 0;
  const echo = o.echo ?? 0;
  const { scale } = mood;
  const len = o.len ?? 1 + Math.floor(r() * 3);
  let idx = Math.max(0, Math.min(o.from ?? 0, scale.length - 1));
  let at = 0;
  // after dark the top of every instrument closes, and it is the same
  // curve `mixLevels` reports, monotone in the hour
  const tone = toneAt(night);
  for (let i = 0; i < len; i++) {
    idx = Math.max(0, Math.min(scale.length - 1, idx + (Math.floor(r() * 5) - 2)));
    const bend = DETUNE_DEGREES.has(idx) ? 1 - 0.013 * detune : 1;
    for (const p of on) {
      if (p.gain < 0.02) continue;
      const v = LAND_VOICE[p.land];
      const opts: VoiceOpts = {
        gain: p.gain * v.gain, tone, damp: v.damp, dur: v.dur, rand: r,
      };
      VOICES[p.voice](ctx, dest, scale[idx] * bend * p.reg, t0 + at, opts);
      if (echo > 0) {
        VOICES[p.voice](ctx, dest, scale[idx] * bend * p.reg, t0 + at + 0.17,
          { ...opts, gain: opts.gain! * 0.34 * echo });
      }
    }
    at += 0.55 + r() * 0.5;
  }
  return idx;
}

const DETUNE_DEGREES = new Set([1, 3]);

/** The land, as an instrument. */
export function playedBy(land: RegionId, gain = 1): Played {
  const v = LAND_VOICE[land] ?? LAND_VOICE.meadow;
  return { voice: v.voice, reg: v.reg, gain, land };
}

/* ---- and the bed, built into whatever context is asking ------------ */

export type BedSlot = {
  src: AudioBufferSourceNode;
  /** Only the crossfade ever touches this. */
  xf: GainNode;
  lfo?: OscillatorNode;
  stop(at: number): void;
};

/**
 * One bed, wired and started. Four nodes, five if the room breathes.
 * `level` is baked in here so the ambient BUS is free to be a plain
 * multiplier that the hour, the tacet and the Blot can all ramp.
 */
export function buildBed(
  ctx: Ctx, dest: AudioNode, land: RegionId, t0: number,
  /**
   * WHERE IN THE WORLD'S NOISE THIS ROOM STARTS, and it is not a detail:
   * two beds built from the same buffer at the same offset are the SAME
   * SIGNAL, and an equal-power crossfade of two identical signals swells
   * three decibels in the middle instead of holding flat. Every border
   * in the game would have had a bump in it. Measured, not reasoned —
   * `check-audio` renders the crossfade and looks at the meter.
   */
  offset = Math.random() * NOISE_SECONDS
): BedSlot {
  const b = BEDS[land] ?? BEDS.meadow;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuf(ctx, NOISE_SECONDS, 11);
  src.loop = true;
  const f = ctx.createBiquadFilter();
  f.type = b.type;
  f.frequency.value = b.freq;
  f.Q.value = b.q;
  let tail: AudioNode = f;
  if (b.peak) {
    const pk = ctx.createBiquadFilter();
    pk.type = 'peaking';
    pk.frequency.value = b.peak;
    pk.Q.value = b.peakQ ?? 1;
    pk.gain.value = b.peakGain ?? 5;
    f.connect(pk);
    tail = pk;
  }
  const lvl = ctx.createGain();
  lvl.gain.value = b.level;
  const xf = ctx.createGain();
  xf.gain.value = 1;
  src.connect(f);
  tail.connect(lvl).connect(xf).connect(dest);
  src.start(t0, offset % NOISE_SECONDS);

  let lfo: OscillatorNode | undefined;
  if (b.swell) {
    lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 1 / b.swell;
    const depth = ctx.createGain();
    depth.gain.value = b.freq * (b.swellDepth ?? 0.3);
    lfo.connect(depth).connect(f.frequency);
    lfo.start(t0);
  }
  return {
    src, xf, lfo,
    stop(at: number) {
      try { src.stop(at); lfo?.stop(at); } catch { /* already stopped */ }
    },
  };
}

export type StepZone =
  | 'paper' | 'dead' | 'wet' | 'hollow' | 'fiber' | 'gloss'
  | 'sand' | 'grass' | 'stone';

/** Step-synthesis presets per walked surface (ch03 §5C, ch05 §8). */
const STEP_ZONES: Record<StepZone, {
  type: BiquadFilterType; freq: number; spread: number; q: number;
  gain: number; decay: number; dur: number;
}> = {
  // §2.8: heel 30 ms, bandpass 420-920 Hz walking cf, Q 1.2. The gain
  // is down a third from the single-burst version because there are two
  // stages now and because a doodle on paper is not an event.
  paper: { type: 'bandpass', freq: 420, spread: 500, q: 1.2, gain: 0.033, decay: 0.03, dur: 0.03 },
  // the plain is outside the drawn world: paper over void, -12 dB
  dead: { type: 'lowpass', freq: 90, spread: 20, q: 0.7, gain: 0.013, decay: 0.07, dur: 0.06 },
  wet: { type: 'bandpass', freq: 300, spread: 260, q: 0.6, gain: 0.045, decay: 0.13, dur: 0.1 },
  // crossing the tear: dry, hollow, wrong
  hollow: { type: 'bandpass', freq: 190, spread: 90, q: 3.4, gain: 0.055, decay: 0.06, dur: 0.05 },
  fiber: { type: 'highpass', freq: 1500, spread: 900, q: 0.8, gain: 0.035, decay: 0.12, dur: 0.11 },
  gloss: { type: 'highpass', freq: 2600, spread: 700, q: 1.6, gain: 0.03, decay: 0.05, dur: 0.05 },
  // the open-world surfaces: a shuff in dry sand, a swish through
  // drawn grass, a harder tap on flagstones and pavement
  sand: { type: 'bandpass', freq: 210, spread: 160, q: 0.7, gain: 0.030, decay: 0.09, dur: 0.08 },
  grass: { type: 'highpass', freq: 1250, spread: 750, q: 0.7, gain: 0.027, decay: 0.10, dur: 0.09 },
  stone: { type: 'bandpass', freq: 640, spread: 320, q: 2.2, gain: 0.038, decay: 0.045, dur: 0.045 },
};

/**
 * All-procedural audio: a per-land bed, a per-land instrument,
 * pen-scratch steps, small chimes, and the named voices of the lands.
 * No assets; the AudioContext is created on the first user gesture.
 */
export class Audio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  /** The ambient BUS: a plain multiplier over whichever bed is playing. */
  private ambient: GainNode | null = null;
  private bed: BedSlot | null = null;
  private music: GainNode | null = null;
  private tailMix: GainNode | null = null;
  private tailDelay: DelayNode | null = null;
  private tailFb: GainNode | null = null;
  private musicTimer: number | undefined;
  private land: RegionId = 'meadow';
  /** The land being left, while the border is still crossing. */
  private fromLand: RegionId | null = null;
  private xfadeAt = 0;
  private lastIdx = 0;
  private tacet = false;
  private intensity = 1;
  /** 0..1 over the bed, not an absolute level (see `setAmbientLevel`). */
  private lastAmbient = 1;
  private stepZone: StepZone = 'paper';
  /** Centre-frequency random walk (0..1 of the zone's spread), §2.8. */
  private stepCf = 0.5;
  /** Which foot: alternates every step, drives the pan. */
  private stepFoot = 1;
  /**
   * Chapter 6's thesis, in the score: the melody is the same melody, two
   * of its notes a few cents wrong. Familiar, and not right. The score
   * doing exactly what the handwriting is doing.
   */
  private detune = 0;
  /** The gallery: a second music-box a sixteenth behind the first. */
  private echo = 0;
  muted = false;

  init() {
    if (this.ctx) return;
    try {
      this.ctx = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    } catch {
      return;
    }
    this.master = this.ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 1;
    this.master.connect(this.ctx.destination);
    this.ambient = this.ctx.createGain();
    this.ambient.gain.value = this.ambientTarget();
    this.ambient.connect(this.master);
    this.bed = buildBed(this.ctx, this.ambient, this.land, this.ctx.currentTime);
    // whatever land was set before there was a context, this IS that
    // land now — there is nothing to be crossfading away from
    this.fromLand = null;
    this.startMusic();
  }

  setMuted(m: boolean) {
    this.muted = m;
    if (this.master && this.ctx) {
      this.master.gain.linearRampToValueAtTime(m ? 0 : 1, this.ctx.currentTime + 0.3);
    }
  }

  private noiseBuffer(seconds: number): AudioBuffer {
    const ctx = this.ctx!;
    const buf = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }

  /**
   * Where the ambient BUS should sit. One place, because four things
   * have an opinion about it: the Blot (`setAmbientLevel`), the hour
   * (thinner after dark), how hard the player is going (a room comes up
   * around somebody moving), and the tacet.
   */
  private mix(): Mix {
    return mixLevels(this.land, {
      hour: this.hour, intensity: this.intensity, ambient: this.lastAmbient,
    });
  }

  private ambientTarget(): number {
    return this.mix().ambient;
  }

  private applyAmbient(ramp = 1.5) {
    if (!this.ctx || !this.ambient || this.tacet) return;
    this.ambient.gain.linearRampToValueAtTime(this.ambientTarget(), this.ctx.currentTime + ramp);
  }

  /** Quiet the room (the Blot) or restore it. 1 is the room as authored. */
  setAmbientLevel(v: number) {
    this.lastAmbient = v;
    this.applyAmbient();
  }

  /**
   * Scripted full musical tacet (pacing CR-3): melody silenced, chimes
   * ineligible, room tone ducked. Held until released — no timeout.
   */
  holdTacet(on: boolean) {
    this.tacet = on;
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.music?.gain.linearRampToValueAtTime(on ? 0 : this.mix().music, t + 1.2);
    this.ambient?.gain.linearRampToValueAtTime(
      on ? this.ambientTarget() * 0.3 : this.ambientTarget(), t + 1.2
    );
  }

  /**
   * The composed zero (score §4.5, ch10 Beat 5): everything off, with no
   * timeout and no automatic way back. `holdTacet` ducks the room to 30%
   * because a room is still a room; this takes the room too. The player
   * is being given time to believe the answer is no, and the mix must be
   * incapable of flinching.
   */
  holdSilence(on: boolean) {
    this.holdTacet(on);
    if (!this.ctx) return;
    this.ambient?.gain.linearRampToValueAtTime(
      on ? 0 : this.ambientTarget(),
      this.ctx.currentTime + (on ? 0.4 : 1.6)
    );
  }

  /** 0 = in tune. 1 = the two practised notes are audibly off. */
  setDetune(t: number) {
    this.detune = Math.max(0, Math.min(1, t));
  }

  /** The copy, following the original a sixteenth behind. */
  setEcho(t: number) {
    this.echo = Math.max(0, Math.min(1, t));
  }

  /* ================================================================ *
   * WHAT TIME IT IS — the seam WORLD-SYSTEMS §9 move 5 asked for, and
   * Session 8 found it exactly where Session 6 left it. Eight in the
   * morning to four in the afternoon is bit-for-bit the shipped page
   * and six verdicts depend on it, so the day cycle was not re-opened.
   *
   * What the hour does to the SCORE, now that there is one: the room
   * thins, the phrases come further apart (both Session 6's), and every
   * instrument's top closes — `phrase` passes `tone` into the voice, so
   * a bell after dark has lost its high partials and a bowed note has
   * lost its bow. It is one number and it is monotone in nightness,
   * which is what `check-audio` asserts.
   * ================================================================ */
  /** 0..24. Read by anything in this file that wants to know. */
  hour = 12;

  setHour(h: number) {
    this.hour = h;
    this.applyAmbient(4);
  }

  /** 0 in broad daylight .. 1 in the middle of the night. The same
   *  shape `world/daylight.ts` grades the page with, kept here rather
   *  than imported so nothing outside Audio.ts can reach into the mix. */
  private nightness(): number {
    return nightnessAt(this.hour);
  }

  /** Macro intensity for within-chapter ramps; survives chapter select. */
  setMoodIntensity(k: number) {
    this.intensity = k;
    if (this.music && this.ctx && !this.tacet) {
      this.music.gain.linearRampToValueAtTime(this.mix().music, this.ctx.currentTime + 1.5);
    }
    this.applyAmbient();
  }

  /* ---------- named events: the voices of the lands ---------- */

  /**
   * INKLANDS' one-shot vocabulary. Session 4's inheritance audit deleted
   * fifty-nine cases that were margins' chapter hooks (`wo-tape-boom`,
   * `xray-taught`, `mom-underline`…) — none of them ours, none of them
   * ever fired here. What remains is what the world actually says, and
   * every land that ships from here adds at least one line to it
   * (QUALITY-BAR §4, "sound is place"). The synthesis helpers below are
   * kept whole: they are the instrument, not the score — and Session 5
   * added two of them, `surge` and `glide`, because a coast cannot be
   * played on sine waves alone.
   */
  event(name: string, _data?: number) {
    if (!this.ctx || this.muted || this.tacet) return;
    switch (name) {
      case 'lark': {
        // the Common's bird: three quick chirps stepping up and away,
        // pitch-jittered so no two larks are the same lark
        const j = 0.96 + Math.random() * 0.1;
        this.tone(1760 * j, 0, 0.13, 0.02);
        this.tone(2093 * j, 0.11, 0.11, 0.018);
        this.tone(1975 * j, 0.24, 0.2, 0.015);
        break;
      }
      case 'well-plink': {
        // a drop finally reaching the water a long way down
        this.knock(140, 0.016);
        this.tone(880, 0.04, 0.09, 0.016);
        this.tone(659, 0.12, 0.4, 0.02);
        break;
      }
      case 'brim-bell': {
        // the belfry earning the hour: strike, hum, and the low answer
        const j = 0.985 + Math.random() * 0.03;
        this.knock(220 * j, 0.014);
        this.tone(466 * j, 0.02, 1.8, 0.014);
        this.tone(311 * j, 0.05, 2.4, 0.018);
        this.tone(196 * j, 1.35, 0.08, 0.016); // the second strike's knock
        this.tone(349 * j, 1.38, 2.6, 0.014);
        break;
      }
      case 'market-murmur': {
        // the square at work: a barrel set down, a trader's two notes
        const j = 0.94 + Math.random() * 0.12;
        this.knock(240 * j, 0.018);
        this.knock(180 * j, 0.012);
        this.tone(523 * j, 0.16, 0.3, 0.012);
        break;
      }
      case 'pigeon-flap': {
        // the square's pigeons put up: three fast soft beats climbing
        const j = 0.9 + Math.random() * 0.2;
        this.knock(320 * j, 0.012);
        this.knock(430 * j, 0.01);
        this.knock(560 * j, 0.008);
        break;
      }
      case 'banner-snap': {
        // the only wind on the page cracking a banner once
        const j = 0.9 + Math.random() * 0.25;
        this.knock(1500 * j, 0.02);
        this.knock(640 * j, 0.012);
        break;
      }
      case 'rook-caw': {
        // two low rasps a third apart; the parliament is in session
        const j = 0.93 + Math.random() * 0.14;
        this.knock(210 * j, 0.02);
        this.tone(175 * j, 0.02, 0.14, 0.02);
        this.knock(175 * j, 0.016);
        this.tone(147 * j, 0.24, 0.16, 0.018);
        break;
      }

      /* ---- THE COAST (Session 5) ---------------------------------- *
       * Four voices added deliberately to a file that is now only what
       * the world actually says. The sea is the first thing in this
       * game that is NOISE rather than pitch, which is why `surge` had
       * to be built: every instrument here until now was a sine. */

      case 'surf-break': {
        // a wave standing up, breaking, and running out. The centre
        // frequency falls as it collapses — the standing wave is bright
        // and tight, the wash is broad and low — and no two are the same
        // size, because the seventh one never is.
        const big = Math.random();
        const w = 0.7 + big * 0.75;
        this.surge(0.55 * w, 1.25 + big * 0.9, 880 + big * 420, 240, 0.030 * w);
        // the shingle in the backwash, a half-beat late
        this.surge(0.8, 1.5, 2600, 1500, 0.009 * w, 0.55 + big * 0.3, 'highpass');
        break;
      }

      case 'gull-cry': {
        // the mew: a hard front and then a fall of about a fourth, two
        // or three times, each one a little lower and a little later,
        // because a gull is losing interest in its own point
        const j = 0.9 + Math.random() * 0.22;
        const n = 2 + (Math.random() > 0.55 ? 1 : 0);
        for (let i = 0; i < n; i++) {
          const f = (1180 - i * 130) * j;
          this.glide(f, f * 0.72, i * (0.19 + Math.random() * 0.07), 0.2, 0.019 - i * 0.004);
        }
        break;
      }

      case 'bell-buoy': {
        // bronze on the swell: a struck partial stack that is not quite
        // harmonic (a bell never is), and then the roll back and the
        // softer second strike a couple of seconds later
        const j = 0.97 + Math.random() * 0.06;
        this.knock(150 * j, 0.02);
        this.tone(437 * j, 0.0, 2.6, 0.013);
        this.tone(586 * j, 0.01, 2.1, 0.009);
        this.tone(219 * j, 0.02, 3.4, 0.015);
        const back = 1.6 + Math.random() * 1.4;
        this.knock(140 * j, 0.012);
        this.tone(437 * j, back, 1.9, 0.008);
        this.tone(219 * j, back + 0.01, 2.4, 0.010);
        break;
      }

      /* ---- THE OARS (Session 6) ------------------------------------ *
       * The first mount's voice, and it is built out of the coast's own
       * instrument: a stroke is a DIP and a PULL, so it is two surges
       * with a gap in them. The dip is short, bright and wet — a blade
       * going in; the pull is long, low and broad — a boat moving. In
       * between, the one detail that makes it a rowboat and not a
       * paddle: the rowlock. */

      case 'oar': {
        const j = 0.9 + Math.random() * 0.24;
        // the blade in: a small, bright catch
        this.surge(0.02, 0.16, 1500 * j, 620, 0.020);
        // wood turning in wood, a beat later — irregular, because a
        // rowlock is worn and it never sits the same way twice
        this.knock(210 * j, 0.011);
        // and the pull: the hull actually moving through water
        this.surge(0.34, 0.72, 420, 150, 0.017, 0.10, 'lowpass');
        break;
      }

      case 'oar-ship': {
        // shipping the oars and standing up out of her: two knocks of
        // loom on gunwale and the hull rocking off the last of it
        this.knock(190, 0.016);
        this.knock(164, 0.012);
        this.surge(0.1, 0.9, 300, 120, 0.012, 0.16, 'lowpass');
        break;
      }

      case 'halyard': {
        // a wire slapping an aluminium mast: bright, metallic, and
        // irregular, because the swell is irregular
        const j = 0.92 + Math.random() * 0.2;
        let at = 0;
        for (let i = 0, n = 3 + Math.floor(Math.random() * 3); i < n; i++) {
          this.glide(2400 * j * (0.9 + Math.random() * 0.3), 1500 * j, at, 0.045,
            0.009 - i * 0.0012, 'triangle');
          at += 0.09 + Math.random() * 0.22;
        }
        break;
      }

      /* ---- FARM & FOREST (Session 10) ------------------------------ *
       * Six voices for two lands, and between them they say the one
       * thing the beds cannot: that the Downs are WORKED and that the
       * Penwood is not. Everything the Downs make is a machine or an
       * animal or a tool going into the ground. Everything the Penwood
       * makes comes from above you or from a long way off, and it is
       * the only land besides the canyon that answers you. */

      case 'mill-creak': {
        // the shaft taking the load: a low knock, the wood complaining
        // as it comes round, and the second knock a beat and a half
        // later. The only sound in the Downs made by a machine.
        const j = 0.93 + Math.random() * 0.15;
        this.knock(96 * j, 0.019);
        this.glide(96 * j, 74 * j, 0.02, 0.52, 0.013, 'triangle');
        this.surge(0.06, 0.5, 300, 130, 0.008, 0.05, 'lowpass');
        this.knock(88 * j, 0.012, 1.4 + Math.random() * 0.5);
        break;
      }

      case 'sheep': {
        // two notes a tone apart, the second falling further than it
        // should, thin and nasal, with the breath under it
        const j = 0.9 + Math.random() * 0.22;
        this.glide(486 * j, 452 * j, 0, 0.20, 0.016, 'sawtooth');
        this.glide(432 * j, 336 * j, 0.23, 0.34, 0.013, 'sawtooth');
        this.surge(0.03, 0.4, 1700, 900, 0.005, 0.02);
        break;
      }

      case 'field-work': {
        // a tool going into the ground a long way off: one soft knock
        // and its dry answer. NO VOICES — nobody in the Downs is
        // talking, and that is the loudest thing about the land.
        const j = 0.88 + Math.random() * 0.26;
        this.knock(210 * j, 0.011);
        this.surge(0.01, 0.14, 700 * j, 260, 0.007, 0.01);
        if (Math.random() > 0.55) this.knock(186 * j, 0.007, 0.42);
        break;
      }

      case 'axe-far': {
        /* Hallows, a long way off — and THE WOOD ANSWERS. Two knocks
         * and then the same pair again at a tenth the level, 340 ms
         * behind: the Penwood is the only land besides the canyon that
         * repeats you, and nothing anywhere says so. */
        const j = 0.94 + Math.random() * 0.14;
        this.knock(300 * j, 0.017);
        this.knock(250 * j, 0.012, 0.19);
        this.knock(300 * j, 0.0022, 0.34);
        this.knock(250 * j, 0.0016, 0.53);
        break;
      }

      case 'tarn-drip': {
        // something small landing on flat water, and the whole pond
        // taking a moment about it
        const j = 0.9 + Math.random() * 0.2;
        this.tone(700 * j, 0, 0.06, 0.014);
        this.tone(262 * j, 0.03, 2.1, 0.011);
        this.tone(196 * j, 0.06, 2.6, 0.007);
        break;
      }

      case 'pine-tick': {
        // a cone coming down through the branches: three knocks
        // falling and getting quieter, which is the cheapest possible
        // proof that there is something above you
        const j = 0.85 + Math.random() * 0.3;
        this.knock(1500 * j, 0.008);
        this.knock(1100 * j, 0.006, 0.07 + Math.random() * 0.05);
        this.knock(800 * j, 0.004, 0.16 + Math.random() * 0.08);
        break;
      }
    }
  }

  /* ---- two instruments the coast needed (Session 5) ---------------- */

  /**
   * SURGE — filtered noise with a shape: the sea, and the first thing in
   * this game that is not a sine. A noise source through a band whose
   * centre frequency SWEEPS from `f0` to `f1` while the gain rises over
   * `up` and falls over `down`. A wave is exactly that: bright and tight
   * as it stands, broad and low as it collapses.
   */
  private surge(
    up: number, down: number, f0: number, f1: number, vol: number,
    at = 0, type: BiquadFilterType = 'bandpass'
  ) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const t0 = ctx.currentTime + at;
    const dur = up + down;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer(dur + 0.1);
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.Q.value = type === 'bandpass' ? 0.9 : 0.6;
    f.frequency.setValueAtTime(f0, t0);
    f.frequency.exponentialRampToValueAtTime(Math.max(40, f1), t0 + dur);
    const g = ctx.createGain();
    // silence the param before anything is scheduled on it: an
    // AudioParam holds 1.0 until its first event, and that one sample
    // of full-gain noise is a click louder than the whole wave
    g.gain.value = 0.0001;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + up);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f).connect(g).connect(this.master!);
    src.start(t0);
    src.stop(t0 + dur + 0.05);
  }

  /**
   * GLIDE — a pitched note that goes somewhere. `tone` holds still and
   * `knock` always falls a fixed fifth; a gull's mew and a halyard's
   * slap both need a sweep they choose. Hard front, no attack ramp:
   * both of these sounds start at their loudest.
   */
  private glide(
    f0: number, f1: number, at: number, dur: number, vol: number,
    type: OscillatorType = 'sine'
  ) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const t0 = ctx.currentTime + at;
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(f0, t0);
    o.frequency.exponentialRampToValueAtTime(Math.max(30, f1), t0 + dur);
    const g = ctx.createGain();
    g.gain.value = 0.0001;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g).connect(this.master!);
    o.start(t0);
    o.stop(t0 + dur + 0.05);
  }

  /* ---------- the graphite voice (ch08 §8) ---------- */
  private scratchSrc: AudioBufferSourceNode | null = null;
  private scratchGain: GainNode | null = null;

  /**
   * Pencil-scratch loop, gated by the reveal animations so writing
   * sounds like its own speed. Level tracks the write rate roughly via
   * the on/off gate; the voice retires for good after the set-down.
   */
  pencilScratch(on: boolean, level = 0.022) {
    if (!this.ctx || this.muted) return;
    const ctx = this.ctx;
    if (on) {
      if (!this.scratchSrc) {
        const src = ctx.createBufferSource();
        src.buffer = this.noiseBuffer(2);
        src.loop = true;
        const f = ctx.createBiquadFilter();
        f.type = 'bandpass';
        f.frequency.value = 1150;
        f.Q.value = 1.1;
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 2600;
        const g = ctx.createGain();
        g.gain.value = 0;
        src.connect(f).connect(lp).connect(g).connect(this.master!);
        src.start();
        this.scratchSrc = src;
        this.scratchGain = g;
      }
      this.scratchGain!.gain.cancelScheduledValues(ctx.currentTime);
      this.scratchGain!.gain.linearRampToValueAtTime(level, ctx.currentTime + 0.08);
    } else if (this.scratchGain) {
      this.scratchGain.gain.cancelScheduledValues(ctx.currentTime);
      this.scratchGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15);
    }
  }

  /** Short dry knock (woodblock family). `at` schedules it forward, which
   *  is what lets a mill's shaft answer itself and a wood repeat an axe
   *  without either of them needing a second event (Session 10). */
  private knock(freq: number, vol = 0.045, at = 0) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const t0 = ctx.currentTime + at;
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(freq, t0);
    o.frequency.exponentialRampToValueAtTime(freq * 0.6, t0 + 0.06);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.09);
    o.connect(g).connect(this.master!);
    o.start(t0);
    o.stop(t0 + 0.12);
  }

  /* ---------- the score ---------- */

  /**
   * CROSS A BORDER — §9 move 3. The card, the footstep and the mood all
   * fire exactly as they did; what is new is that the instrument and the
   * bed take three and a half seconds to become the other land's, on an
   * equal-power curve, so a border is a place you pass through rather
   * than a switch somebody flipped behind you.
   *
   * Nothing announces it. There is no track name anywhere in this game
   * (INSPIRATION, RuneScape §6: take the voice, refuse the music player).
   */
  setMood(region: string) {
    const land = (MOODS[region as RegionId] ? region : 'meadow') as RegionId;
    if (land === this.land && this.bed) return;
    this.fromLand = this.land;
    this.land = land;
    this.detune = 0;
    this.echo = 0;
    if (!this.ctx || !this.ambient) return;
    const t = this.ctx.currentTime;
    this.xfadeAt = t;

    // the bed: a real crossfade of two rooms
    const next = buildBed(this.ctx, this.ambient, land, t);
    next.xf.gain.value = 0;
    crossfade(next.xf.gain, 'in', t);
    const old = this.bed;
    if (old) {
      crossfade(old.xf.gain, 'out', t);
      old.stop(t + XFADE + 0.3);
    }
    this.bed = next;

    // the tail: what this place does to a sound after you make it
    if (this.tailMix && this.tailDelay && this.tailFb) {
      const tail = TAILS[land];
      this.tailMix.gain.cancelScheduledValues(t);
      this.tailMix.gain.linearRampToValueAtTime(this.mix().tail, t + XFADE);
      // the size of the room, not only how much of it: a canyon answers
      // slower than a hall, and the two are the only lands that answer
      this.tailDelay.delayTime.linearRampToValueAtTime(tail?.time ?? 0.42, t + XFADE);
      this.tailFb.gain.linearRampToValueAtTime(tail?.feedback ?? 0.44, t + XFADE);
    }

    // and the melody's own level, which has always ramped
    if (this.music && !this.tacet) {
      this.music.gain.linearRampToValueAtTime(this.mix().music, t + XFADE);
    }
  }

  private startMusic() {
    const ctx = this.ctx!;
    this.music = ctx.createGain();
    this.music.gain.value = 0;
    this.music.connect(this.master!);
    this.music.gain.linearRampToValueAtTime(this.mix().music, ctx.currentTime + 4);

    /* ONE tail for the whole world, mixed per land (TAILS). A delay
     * with feedback is three nodes; a convolver would have been one
     * node and a rendered impulse response, which is an asset. */
    const delay = ctx.createDelay(1.0);
    delay.delayTime.value = TAILS[this.land]?.time ?? 0.42;
    const fb = ctx.createGain();
    fb.gain.value = TAILS[this.land]?.feedback ?? 0.44;
    this.tailDelay = delay;
    this.tailFb = fb;
    this.tailMix = ctx.createGain();
    this.tailMix.gain.value = this.mix().tail;
    this.music.connect(delay);
    delay.connect(fb).connect(delay);
    delay.connect(this.tailMix).connect(this.master!);

    this.scheduleMusic();
  }

  private scheduleMusic() {
    // phrases come further apart after dark (see setHour)
    const wait = this.mix().gap * (0.6 + Math.random() * 0.8);
    this.musicTimer = window.setTimeout(() => {
      this.playPhrase();
      this.scheduleMusic();
    }, wait * 1000);
  }

  /**
   * A phrase, on whatever this land is played on — and, for three and a
   * half seconds after a border, on BOTH lands' instruments at equal
   * power. The notes are the land you have entered; what is crossfading
   * is what they are played on.
   */
  private playPhrase() {
    if (!this.ctx || this.muted || this.tacet || document.hidden) return;
    const t0 = this.ctx.currentTime;
    const on = [playedBy(this.land)];
    if (this.fromLand && this.fromLand !== this.land) {
      const k = (t0 - this.xfadeAt) / XFADE;
      if (k >= 1) this.fromLand = null;
      else {
        const [out, inn] = equalPower(k);
        on[0].gain = inn;
        on.push(playedBy(this.fromLand, out));
      }
    }
    this.lastIdx = phrase(this.ctx, this.music!, this.land, t0, {
      from: this.lastIdx,
      night: this.nightness(),
      detune: this.detune,
      echo: this.echo,
      on,
    });
  }

  /**
   * The surface underfoot (ARCHITECTURE #9 / ch05 §8). `dead` is the
   * chapter-5 signature: the pen-noise of the world stops, because the
   * whiteout is outside the drawn world.
   */
  setStepZone(id: StepZone) {
    this.stepZone = id;
  }

  /**
   * A FOOTSTEP — the pen-scratch percussion family, score §2.8, as
   * written rather than as half-built.
   *
   * What shipped was the heel and nothing else: one noise burst opened
   * at full gain in a single sample and closed 90 ms later. An instant
   * attack on a low-mid band is a knock — the owner heard it as "a
   * hammer" — and with no variation, no gait and no pan, forty of them
   * a minute is a woodpecker following the player around.
   *
   * §2.8's recipe, now implemented: two stages (heel, then a quieter
   * toe an ankle's-length later at twice the frequency), a centre
   * frequency that RANDOM-WALKS inside the surface's band so no two
   * steps match, left/right alternation with a pan wobble, and gain
   * from how fast the walker is actually moving. Plus the thing that
   * kills the hammer: a real attack. Four milliseconds is nothing to
   * count and everything to hear — it is the difference between a
   * strike and a scuff.
   *
   * `speed` is 0..1 of the walker's top speed; a drifting walk is
   * quieter than a march, which is what "velocity from movement speed"
   * asks for.
   */
  step(speed = 1) {
    if (!this.ctx || this.muted) return;
    const ctx = this.ctx;
    const z = STEP_ZONES[this.stepZone] ?? STEP_ZONES.paper;

    // the centre frequency wanders inside the band instead of being
    // re-rolled flat every step: neighbouring steps are related, distant
    // ones are not — a hand's drift, not a dice throw
    this.stepCf += (Math.random() - 0.5) * 0.34;
    this.stepCf = Math.max(0, Math.min(1, this.stepCf));
    const cf = z.freq + this.stepCf * z.spread;

    // L/R: the pan alternates, the amount wobbles
    this.stepFoot = -this.stepFoot;
    const pan = this.stepFoot * (0.15 + Math.random() * 0.06);

    const vel = 0.55 + 0.45 * Math.max(0, Math.min(1, speed));
    const t0 = ctx.currentTime;

    const hit = (at: number, dur: number, freq: number, gain: number, attack: number) => {
      const src = ctx.createBufferSource();
      src.buffer = this.noiseBuffer(dur);
      const filter = ctx.createBiquadFilter();
      filter.type = z.type;
      filter.frequency.value = freq;
      filter.Q.value = z.q;
      const g = ctx.createGain();
      /*
       * Silence the param BEFORE anything is scheduled on it. An
       * AudioParam holds its default — 1.0 — until its first event, so
       * a node whose first `setValueAtTime` sits 35 ms in the future
       * passes the first sample or two of its source at FULL GAIN. That
       * is a one-sample click, it is the same size whatever the step's
       * gain is, and measured offline it was thirty times louder than
       * the step it was decorating. Half the "hammer" lived here.
       */
      g.gain.value = 0.0001;
      // a scuff, not a strike: up over `attack`, then away
      g.gain.setValueAtTime(0.0001, t0 + at);
      g.gain.linearRampToValueAtTime(gain, t0 + at + attack);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + at + dur);
      let tail: AudioNode = g;
      if (ctx.createStereoPanner) {
        const p = ctx.createStereoPanner();
        p.pan.value = pan;
        g.connect(p);
        tail = p;
      }
      src.connect(filter).connect(g);
      tail.connect(this.master!);
      src.start(t0 + at);
      src.stop(t0 + at + dur + 0.02);
    };

    /*
     * Heel: the weight. Toe: the paper letting go, 35 ms later, at
     * twice the frequency and -6 dB — measured, not nominal. A 0.5
     * gain ratio renders at -2.8 dB because the second stage's band is
     * an octave up and a bandpass passes energy in proportion to its
     * centre; 0.4 lands on -6. Attack is a fixed fraction of the
     * heel's own length, floored at 3 ms: below that it is a click
     * again, whatever the surface.
     */
    const attack = Math.max(0.003, Math.min(0.011, z.decay * 0.27));
    hit(0, z.decay, cf, z.gain * vel, attack);
    hit(0.035, z.decay * 0.55, cf * 2, z.gain * vel * 0.4, 0.004);
  }

  private tone(freq: number, at: number, dur: number, vol: number) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, ctx.currentTime + at);
    g.gain.linearRampToValueAtTime(vol, ctx.currentTime + at + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + at + dur);
    o.connect(g).connect(this.master!);
    o.start(ctx.currentTime + at);
    o.stop(ctx.currentTime + at + dur + 0.1);
  }

  note() {
    if (!this.ctx || this.muted || this.tacet) return;
    this.tone(660, 0, 0.5, 0.05);
    this.tone(880, 0.12, 0.6, 0.04);
  }

  solve() {
    if (!this.ctx || this.muted || this.tacet) return;
    this.tone(523, 0, 0.5, 0.05);
    this.tone(659, 0.11, 0.5, 0.05);
    this.tone(784, 0.22, 0.8, 0.05);
  }
}

/**
 * 0 in broad daylight .. 1 in the middle of the night — the same shape
 * `world/daylight.ts` grades the page with, kept here rather than
 * imported so nothing outside Audio.ts can reach into the mix, and
 * exported as a function so the offline renderer can ask for an hour.
 */
export function nightnessAt(h: number): number {
  if (h >= 8 && h <= 16.5) return 0;
  if (h > 16.5 && h < 21) return (h - 16.5) / 4.5;
  if (h >= 21 || h < 4.6) return 1;
  return Math.max(0, 1 - (h - 4.6) / 3.4);
}
