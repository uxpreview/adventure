// RENDERING THE SCORE OFF-SCREEN — the shared harness behind
// `check-audio.mjs`, `shoot-sound.mjs` and `render-wavs.mjs`.
//
// Five sessions of contact sheets photographed the world and NOBODY HAS
// EVER MEASURED THE SOUND. This is the machine that measures it, and
// the reason it can exist is that Session 8's first move was to make
// every voice in `Audio.ts` a function of the context it is built in:
// an `OfflineAudioContext` renders deterministically, with no audio
// device and no user gesture, many times faster than real time.
//
// THE TRAP, and it is written down in the session brief because it
// costs an hour: an OfflineAudioContext renders a GRAPH, not a SYSTEM.
// Anything that reads `performance.now()`, schedules off `setTimeout`
// or waits on `currentTime` advancing renders SILENCE. So the melody is
// driven here from an explicit clock — `Audio.phrase(ctx, dest, land,
// t0, …)`, the same function the live scheduler calls — and the class's
// own `setTimeout` loop is never involved.
//
// What is proven and what is not: the VOICES, the BEDS, the PHRASE, the
// CROSSFADE curve and `mixLevels` are the game's own exported code, so
// what this renders is what the player hears. The class's wiring order
// (bus → master) is asserted by reading it, not by rendering it.
import { build } from 'esbuild';
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { CHROMIUM } from './pw.mjs';

export const LANDS = [
  'meadow', 'kingdom', 'castle', 'beach', 'ocean', 'forest',
  'downs', 'neighborhood', 'city', 'office', 'canyon', 'desert',
];

/** Bundle Audio.ts into something a blank page can hold. */
export async function bundleAudio() {
  mkdirSync('.tmp', { recursive: true });
  await build({
    entryPoints: ['src/core/Audio.ts'],
    bundle: true,
    format: 'iife',
    globalName: 'INK',
    outfile: '.tmp/audio.iife.js',
    logLevel: 'error',
  });
  return '.tmp/audio.iife.js';
}

/* ------------------------------------------------------------------ *
 * IN-PAGE: the graph, the render, and the analysis. Everything below
 * runs inside headless Chromium, where there is a Web Audio API.
 * ------------------------------------------------------------------ */
export const BOOTH = String.raw`
window.__booth = (() => {
  const A = window.INK;

  /* ---- the mix, wired the way the class wires it ------------------ */
  function buildMix(ctx, land, o) {
    const M = A.mixLevels(land, { hour: o.hour ?? 12, intensity: o.intensity ?? 1 });
    const master = ctx.createGain();
    master.gain.value = 1;
    master.connect(ctx.destination);

    const ambient = ctx.createGain();
    ambient.gain.value = M.ambient;
    ambient.connect(master);

    const music = ctx.createGain();
    music.gain.value = M.music;
    music.connect(master);

    // the tail: one delay with feedback, mixed per land
    const t = A.TAILS[land];
    if (t && M.tail > 0) {
      const d = ctx.createDelay(1.0);
      d.delayTime.value = t.time;
      const fb = ctx.createGain();
      fb.gain.value = t.feedback;
      const mix = ctx.createGain();
      mix.gain.value = M.tail;
      music.connect(d);
      d.connect(fb).connect(d);
      d.connect(mix).connect(master);
    }
    return { master, ambient, music, M };
  }

  /** Phrases from an explicit clock, never a timer. */
  function playPhrases(ctx, dest, land, o, M) {
    const r = A.srand(o.seed ?? 1234);
    const spacing = o.spacing ?? M.gap;
    let idx = o.from ?? 0;
    let at = o.first ?? 0.3;
    let n = 0;
    while (at < o.seconds - 0.6 && n < (o.maxPhrases ?? 99)) {
      idx = A.phrase(ctx, dest, land, at, {
        rand: r, night: M.night, from: idx, len: o.len, on: o.on ? o.on(land) : undefined,
      });
      at += spacing;
      n++;
    }
    return n;
  }

  async function render(spec) {
    const sr = spec.rate ?? 32000;
    const sec = spec.seconds ?? 8;
    const ctx = new OfflineAudioContext(1, Math.ceil(sr * sec), sr);
    const land = spec.land;
    const o = { ...spec, seconds: sec };
    const g = buildMix(ctx, land, o);

    /* Every bed is entered at a NAMED place in the world's noise. The
     * default is random, because in the game two beds must never be the
     * same signal; here it has to be the same render every time or half
     * the assertions below are measuring a dice throw. */
    const OFF = spec.offset ?? 0.7;

    if (spec.kind === 'bed') {
      A.buildBed(ctx, g.ambient, land, 0, OFF);
    } else if (spec.kind === 'voice') {
      playPhrases(ctx, g.music, land, o, g.M);
    } else if (spec.kind === 'land') {
      A.buildBed(ctx, g.ambient, land, 0, OFF);
      playPhrases(ctx, g.music, land, o, g.M);
    } else if (spec.kind === 'border') {
      /* A BORDER, rendered: the bed of the land you are leaving fades
       * out on the equal-power curve while the land you are entering
       * fades in, and the phrases in the middle are played on BOTH
       * instruments at the same weights. Exactly what setMood does. */
      const to = spec.to;
      const at = spec.at ?? sec * 0.4;
      const MB = A.mixLevels(to, { hour: o.hour ?? 12, intensity: o.intensity ?? 1 });
      const bedA = A.buildBed(ctx, g.ambient, land, 0, 0.4);
      const bedB = A.buildBed(ctx, g.ambient, to, 0, 2.3);
      bedB.xf.gain.value = 0;
      A.crossfade(bedA.xf.gain, 'out', at);
      A.crossfade(bedB.xf.gain, 'in', at);
      g.music.gain.setValueAtTime(g.M.music, at);
      g.music.gain.linearRampToValueAtTime(MB.music, at + A.XFADE);
      const r = A.srand(spec.seed ?? 99);
      let idx = 0;
      let t = 0.4;
      while (!spec.silent && t < sec - 0.6) {
        const k = (t - at) / A.XFADE;
        const here = t < at ? land : to;
        let on;
        if (k > 0 && k < 1) {
          const [out, inn] = A.equalPower(k);
          on = [A.playedBy(to, inn), A.playedBy(land, out)];
        }
        idx = A.phrase(ctx, g.music, here, t, {
          rand: r, night: g.M.night, from: idx, on, len: spec.len,
        });
        t += spec.spacing ?? 1.9;
      }
    } else if (spec.kind === 'event') {
      /* ONE OF THE LAND VOICES — the lark, the belfry, the oar, the
       * crossing box, the plant on the roof (Session 14).
       *
       * Audio.event is thirty-four one-shots and NOT ONE OF THEM HAS
       * EVER BEEN HEARD by anybody: they are bound to the live audio
       * context, so the offline render Session 8 built for the score
       * could not reach them, and the note in the owner's own listening
       * pack says so in as many words. This is the smallest possible
       * bridge to them: an Audio instance whose context and master are
       * the offline ones, and then the same call the game makes.
       *
       * Nothing about the sound is re-implemented here. If it were,
       * this would be a rendering of a different game.
       *
       * They all schedule from ctx.currentTime + at, and an offline
       * context's currentTime is zero for the whole render — so each
       * file is ONE firing, from the top, which is how you hear a
       * one-shot anyway.
       */
      const a = new A.Audio();
      a.ctx = ctx;
      a.master = g.master;
      a.muted = false;
      a.tacet = false;
      a.event(spec.name);
    } else if (spec.kind === 'xfade-ref') {
      /* THE EQUAL-POWER PROOF. The same bed on both sides of the fade,
       * so anything the meter does in the middle is the CURVE and not
       * the two rooms being different rooms. */
      const at = spec.at ?? sec * 0.4;
      const bedA = A.buildBed(ctx, g.ambient, land, 0, 0.4);
      const bedB = A.buildBed(ctx, g.ambient, land, 0, 2.3);
      bedB.xf.gain.value = 0;
      A.crossfade(bedA.xf.gain, 'out', at);
      A.crossfade(bedB.xf.gain, 'in', at);
    }

    const buf = await ctx.startRendering();
    return analyse(buf.getChannelData(0), sr, spec);
  }

  /* ---- analysis: what a listener would notice, as numbers ---------- */

  function fft(re, im) {
    const n = re.length;
    for (let i = 1, j = 0; i < n; i++) {
      let bit = n >> 1;
      for (; j & bit; bit >>= 1) j ^= bit;
      j ^= bit;
      if (i < j) {
        let t = re[i]; re[i] = re[j]; re[j] = t;
        t = im[i]; im[i] = im[j]; im[j] = t;
      }
    }
    for (let len = 2; len <= n; len <<= 1) {
      const ang = -2 * Math.PI / len;
      const wr = Math.cos(ang), wi = Math.sin(ang);
      for (let i = 0; i < n; i += len) {
        let cr = 1, ci = 0;
        for (let k = 0; k < len / 2; k++) {
          const ur = re[i + k], ui = im[i + k];
          const vr = re[i + k + len / 2] * cr - im[i + k + len / 2] * ci;
          const vi = re[i + k + len / 2] * ci + im[i + k + len / 2] * cr;
          re[i + k] = ur + vr; im[i + k] = ui + vi;
          re[i + k + len / 2] = ur - vr; im[i + k + len / 2] = ui - vi;
          const nr = cr * wr - ci * wi;
          ci = cr * wi + ci * wr; cr = nr;
        }
      }
    }
  }

  const N = 2048;
  function spectrum(d, sr) {
    const power = new Float64Array(N / 2);
    const win = new Float64Array(N);
    for (let i = 0; i < N; i++) win[i] = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / N);
    let frames = 0;
    for (let off = 0; off + N <= d.length; off += N / 2) {
      const re = new Float64Array(N), im = new Float64Array(N);
      let energy = 0;
      for (let i = 0; i < N; i++) { re[i] = d[off + i] * win[i]; energy += re[i] * re[i]; }
      if (energy < 1e-14) continue; // silence tells you nothing about a voice
      fft(re, im);
      for (let k = 0; k < N / 2; k++) power[k] += re[k] * re[k] + im[k] * im[k];
      frames++;
    }
    if (frames) for (let k = 0; k < N / 2; k++) power[k] /= frames;
    return power;
  }

  /** Log-spaced band energies, normalised to sum 1: WHERE a sound is. */
  const BAND_LO = 40, BAND_HI = 12000, NBANDS = 30;
  function bands(power, sr) {
    const out = new Array(NBANDS).fill(0);
    for (let k = 1; k < power.length; k++) {
      const f = k * sr / N;
      if (f < BAND_LO || f > BAND_HI) continue;
      const b = Math.min(NBANDS - 1, Math.floor(
        Math.log(f / BAND_LO) / Math.log(BAND_HI / BAND_LO) * NBANDS));
      out[b] += power[k];
    }
    const sum = out.reduce((a, b) => a + b, 0) || 1;
    return out.map((v) => v / sum);
  }

  function centroid(power, sr) {
    let num = 0, den = 0;
    for (let k = 1; k < power.length; k++) {
      const f = k * sr / N;
      if (f < BAND_LO || f > BAND_HI) continue;
      const a = Math.sqrt(power[k]);
      num += f * a; den += a;
    }
    return den ? num / den : 0;
  }

  function analyse(d, sr, spec) {
    let peak = 0, sum = 0;
    for (let i = 0; i < d.length; i++) {
      const a = Math.abs(d[i]);
      if (a > peak) peak = a;
      sum += d[i] * d[i];
    }
    const rms = Math.sqrt(sum / d.length);

    // short-time RMS, 50 ms windows: the level as it moves
    const w = Math.max(1, Math.floor(sr * 0.05));
    const env = [];
    for (let off = 0; off + w <= d.length; off += w) {
      let s = 0;
      for (let i = 0; i < w; i++) s += d[off + i] * d[off + i];
      env.push(Math.sqrt(s / w));
    }

    const power = spectrum(d, sr);
    const res = {
      seconds: d.length / sr, rate: sr, peak, rms,
      env, envStep: w / sr,
      bands: bands(power, sr), centroid: centroid(power, sr),
    };
    if (spec.plot) {
      // a decimated min/max pair per column, for the sound sheet
      const cols = spec.plot;
      const wave = [];
      const step = d.length / cols;
      for (let c = 0; c < cols; c++) {
        let lo = 1, hi = -1;
        for (let i = Math.floor(c * step); i < Math.floor((c + 1) * step); i++) {
          if (d[i] < lo) lo = d[i];
          if (d[i] > hi) hi = d[i];
        }
        wave.push([lo, hi]);
      }
      res.wave = wave;
      /* A log-spaced spectrum in ABSOLUTE decibels — not normalised to
       * its own loudest bin, because a sheet whose every panel is
       * normalised to itself cannot say that one land is louder than
       * another, or that a room is quieter than the land it is in. The
       * caller picks the window it draws.
       *
       * Empty bins are INTERPOLATED, not floored: at the bottom of a log
       * scale there are fewer FFT bins than plot bins, and dropping the
       * gaps to zero draws a picket fence that is the arithmetic and not
       * the sound. */
      const bins = 96;
      const sp = new Array(bins).fill(0);
      const cnt = new Array(bins).fill(0);
      for (let k = 1; k < power.length; k++) {
        const f = k * sr / N;
        if (f < BAND_LO || f > BAND_HI) continue;
        const b = Math.min(bins - 1, Math.floor(
          Math.log(f / BAND_LO) / Math.log(BAND_HI / BAND_LO) * bins));
        sp[b] += power[k]; cnt[b]++;
      }
      for (let i = 0; i < bins; i++) {
        if (cnt[i]) { sp[i] /= cnt[i]; continue; }
        let a = i - 1, b = i + 1;
        while (a >= 0 && !cnt[a]) a--;
        while (b < bins && !cnt[b]) b++;
        const va = a >= 0 ? sp[a] : 0, vb = b < bins ? sp[b] / (cnt[b] || 1) : 0;
        sp[i] = a >= 0 && b < bins ? (va + vb) / 2 : (a >= 0 ? va : vb);
      }
      res.spectrum = sp.map((v) => 10 * Math.log10(v + 1e-18));
    }
    if (spec.samples) {
      // 16-bit PCM, base64: small enough to hand back, good enough to play
      /* ONE gain over every file the owner is handed, never a per-file
       * normalisation: the score sits twenty decibels below full scale
       * because the footsteps and the lands' own voices have to fit on
       * top of it, and a listening copy that normalised each land to
       * the same peak would throw away the one thing the mix is FOR —
       * that the canyon is quieter than the Common. */
      const G = spec.gain ?? 1;
      const pcm = new Int16Array(d.length);
      for (let i = 0; i < d.length; i++) {
        pcm[i] = Math.max(-32768, Math.min(32767, Math.round(d[i] * G * 32767)));
      }
      const bytes = new Uint8Array(pcm.buffer);
      let s = '';
      for (let i = 0; i < bytes.length; i += 0x8000) {
        s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
      }
      res.pcm = btoa(s);
    }
    return res;
  }

  return { render, buildMix };
})();
`;

/** Open a page that can render the score. Remember to `close()`. */
export async function openBooth() {
  const file = await bundleAudio();
  const browser = await chromium.launch({ executablePath: CHROMIUM });
  const page = await browser.newPage();
  await page.goto('about:blank');
  await page.addScriptTag({ path: file });
  await page.addScriptTag({ content: BOOTH });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  return {
    page,
    errors,
    /** One render. Returns the analysis (and the samples, if asked). */
    render: (spec) => page.evaluate((s) => window.__booth.render(s), spec),
    close: () => browser.close(),
  };
}

/* ---- small shared helpers ----------------------------------------- */

export const db = (v) => 20 * Math.log10(Math.max(1e-9, v));

/** How far apart two sounds are, 0 (identical) .. 2 (nothing shared). */
export function bandDistance(a, b) {
  let d = 0;
  for (let i = 0; i < a.length; i++) d += Math.abs(a[i] - b[i]);
  return d;
}

/** A mono 16-bit WAV around base64 PCM. */
export function wav(pcmBase64, rate) {
  const data = Buffer.from(pcmBase64, 'base64');
  const head = Buffer.alloc(44);
  head.write('RIFF', 0);
  head.writeUInt32LE(36 + data.length, 4);
  head.write('WAVE', 8);
  head.write('fmt ', 12);
  head.writeUInt32LE(16, 16);
  head.writeUInt16LE(1, 20);
  head.writeUInt16LE(1, 22);
  head.writeUInt32LE(rate, 24);
  head.writeUInt32LE(rate * 2, 28);
  head.writeUInt16LE(2, 32);
  head.writeUInt16LE(16, 34);
  head.write('data', 36);
  head.writeUInt32LE(data.length, 40);
  return Buffer.concat([head, data]);
}
