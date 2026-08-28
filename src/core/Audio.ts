import { AudioDirector } from './AudioDirector';

/** Per-chapter mood for the generative music layer. */
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
// Per-region moods: the music-box register wanders with the walker.
// The meadow is the game's brightest; every other land is measured
// against it. Interiors and wastes go sparse rather than loud.
const MOODS: Record<string, Mood> = {
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
 * All-procedural audio: paper-room ambience, pen-scratch steps, small
 * chimes, and a sparse music-box melody that wanders a per-chapter scale.
 * No assets; the AudioContext is created on the first user gesture.
 */
export class Audio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private ambient: GainNode | null = null;
  private music: GainNode | null = null;
  private musicTimer: number | undefined;
  private mood: Mood = MOODS.meadow;
  private lastIdx = 0;
  private tacet = false;
  private intensity = 1;
  private lastAmbient = 0.018;
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
  private detuneDegrees = new Set([1, 3]);
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
    this.startAmbient();
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

  private startAmbient() {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer(4);
    src.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 220;
    this.ambient = ctx.createGain();
    this.ambient.gain.value = 0.018;
    src.connect(filter).connect(this.ambient).connect(this.master!);
    src.start();
  }

  /** Quiet the room (the Blot) or restore it. */
  setAmbientLevel(v: number) {
    this.lastAmbient = v;
    if (this.ambient && this.ctx && !this.tacet) {
      this.ambient.gain.linearRampToValueAtTime(v, this.ctx.currentTime + 1.5);
    }
  }

  /**
   * Scripted full musical tacet (pacing CR-3): melody silenced, chimes
   * ineligible, room tone ducked. Held until released — no timeout.
   */
  holdTacet(on: boolean) {
    this.tacet = on;
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.music?.gain.linearRampToValueAtTime(on ? 0 : this.mood.level * this.intensity, t + 1.2);
    this.ambient?.gain.linearRampToValueAtTime(on ? this.lastAmbient * 0.3 : this.lastAmbient, t + 1.2);
  }

  /**
   * The ending's own score (design/score.md §5), built on first ask and
   * torn down with the chapter. Only Chapter 10 has one: the finale is
   * the only place where the player plays the music.
   */
  private directorInstance: AudioDirector | null = null;

  director(): AudioDirector | null {
    this.init();
    if (!this.ctx || !this.master) return null;
    if (!this.directorInstance) {
      this.directorInstance = new AudioDirector(this.ctx, this.master, () => this.muted);
    }
    return this.directorInstance;
  }

  releaseDirector() {
    this.directorInstance?.dispose();
    this.directorInstance = null;
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
    this.directorInstance?.holdSilence(on);
    if (!this.ctx) return;
    this.ambient?.gain.linearRampToValueAtTime(
      on ? 0 : this.lastAmbient,
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

  /** Macro intensity for within-chapter ramps; survives chapter select. */
  setMoodIntensity(k: number) {
    this.intensity = k;
    if (this.music && this.ctx && !this.tacet) {
      this.music.gain.linearRampToValueAtTime(this.mood.level * k, this.ctx.currentTime + 1.5);
    }
  }

  /* ---------- named events (chapter hooks; score doc §4.3 subset) ---------- */

  /** Small vocabulary of adaptive-layer events used by Ch 1–2. */
  event(name: string, data?: number) {
    if (!this.ctx || this.muted || this.tacet) return;
    switch (name) {
      case 'tally': {
        // dry woodblock tick, pitch creeping up comically with the count
        this.knock(300 + Math.min(600, (data ?? 0) * 1.2));
        break;
      }
      case 'cold': {
        // a single detuned cold note — the game's first minor inflection
        this.tone(311 * 1.012, 0, 1.6, 0.035);
        break;
      }
      case 'warm-low': {
        this.tone(196, 0, 1.4, 0.045);
        break;
      }
      case 'flare-tick': {
        this.knock(900 + Math.random() * 300, 0.02);
        break;
      }
      case 'segment': {
        this.tone(1046, 0, 0.5, 0.04);
        break;
      }
      case 'leg': {
        // two-note figure, unresolved — the route continues
        this.tone(523, 0, 0.4, 0.04);
        this.tone(587, 0.22, 0.7, 0.035);
        break;
      }
      case 'homely': {
        this.tone(392, 0, 0.9, 0.04);
        break;
      }
      case 'bird': {
        this.tone(1568, 0, 0.18, 0.03);
        this.tone(1760, 0.14, 0.2, 0.025);
        break;
      }
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
      case 'panel': {
        // a pair pays off — rising by pair index (ch03 §8)
        const n = data ?? 0;
        this.tone(523 * Math.pow(2, n / 12), 0, 0.45, 0.042);
        this.tone(784 * Math.pow(2, n / 12), 0.13, 0.6, 0.03);
        break;
      }
      case 'credits': {
        // escalating comic plinks, layers 1-4. Layer 5 never calls this.
        const n = data ?? 1;
        this.knock(380 + n * 130, 0.03 + n * 0.008);
        break;
      }
      case 'boat-lap': {
        this.knock(160 + Math.random() * 60, 0.012);
        break;
      }
      case 'rain-begin': {
        this.tone(2093, 0, 0.12, 0.016);
        break;
      }
      case 'slice': {
        // the razor stub: one dry tick, over before it registers
        this.knock(2400, 0.05);
        break;
      }
      case 'flare-fail': {
        // note()'s corpse: flatted, pitched down a fourth, decay halved
        this.tone(660 * 0.75 * 0.943, 0, 0.25, 0.04);
        this.tone(880 * 0.75 * 0.943, 0.1, 0.3, 0.028);
        break;
      }
      case 'ghost-raised': {
        // no chime. a low paper-flex whump, like a book settling
        this.thump(70, 0.7);
        break;
      }
      case 'crackle': {
        // brittle, high, short — each of the three lower than the last
        const n = data ?? 0;
        this.burst(3200 - n * 700, 0.07);
        break;
      }
      case 'blue-voice': {
        // the hairline of blue, given a voice
        this.tone(1318, 0, 0.8, 0.03);
        break;
      }
      case 'xray-taught': {
        // one soft low note: the instrument, acknowledged
        this.tone(174.6, 0, 1.8, 0.036);
        break;
      }
      case 'valley-enter': {
        this.tone(146.8, 0, 2.6, 0.032);
        this.tone(220 * 0.994, 0.5, 2.2, 0.02);
        break;
      }
      case 'terraces': {
        this.tone(440, 0, 0.7, 0.026);
        this.tone(466.2, 0.3, 0.9, 0.02);
        break;
      }
      case 'cap': {
        // he pulls the brim down. one low tone, no melody.
        this.tone(130.8, 0, 1.7, 0.04);
        break;
      }
      case 'point-back': {
        this.tone(196, 0, 1.2, 0.034);
        this.tone(261.6, 0.42, 1.6, 0.026);
        break;
      }
      case 'blot-edge': {
        // the room tone pre-laps the Blot: paper noise, nothing else
        this.thump(52, 1.5);
        break;
      }
      case 'dry-step': {
        this.knock(1500 + Math.random() * 400, 0.016);
        break;
      }
      /* ---- chapter 7: a score made of subtraction ---- */
      case 'enter-blot': {
        // the world's pen-scratch dies; what is left is a room, not a page
        this.setAmbientLevel(0.006);
        break;
      }
      case 'flood-still': {
        // near-inaudible: the flood settling, and only if you stopped
        this.tone(3136, 0, 2.2, 0.008);
        break;
      }
      case 'surface': {
        this.thump(190, 0.55);
        break;
      }
      case 'sink': {
        this.thump(120, 0.9);
        break;
      }
      case 'letterform': {
        // a dry sub-click. NO chime — the friendly voice would be obscene
        this.knock(120, 0.02);
        break;
      }
      case 'sit': {
        this.setAmbientLevel(0.0045);
        break;
      }
      case 'stand': {
        this.setAmbientLevel(0.006);
        this.thump(60, 1.1);
        break;
      }
      case 'feather-shore': {
        // the page breathes back in, and two notes with it
        this.setAmbientLevel(0.018);
        this.tone(392, 0, 1.6, 0.028);
        this.tone(523, 0.7, 2.0, 0.022);
        break;
      }
      case 'landmark': {
        // a dry page-settle tick, quieter each time. L4 is nearly silent.
        const n = data ?? 0;
        this.knock(240 + n * 40, 0.006 + n * 0.008);
        break;
      }
      case 'paper': {
        this.burst(1800, 0.13);
        break;
      }
      case 'box-dark': {
        this.setAmbientLevel(0);
        break;
      }
      case 'dawn-seam': {
        // first light is the first sound
        this.setAmbientLevel(0.014);
        this.tone(174.6, 0, 3.4, 0.03);
        this.tone(261.6, 1.2, 3.0, 0.02);
        break;
      }
      case 'pencil-line': {
        // graphite: shaped noise, the first drawing sound since the pour
        for (let i = 0; i < 7; i++) {
          window.setTimeout(() => this.burst(900 + Math.random() * 1400, 0.4), i * 1400);
        }
        break;
      }
      case 'tilt-up':
        // nothing. The silence IS the sting.
        break;
      /* ---- chapter 8: graphite over ink ---- */
      case 'atlas-enter': {
        // lamp-warm room tone: the warmest room in the back half
        this.setAmbientLevel(0.02);
        break;
      }
      case 'eraser': {
        // filtered noise rub, three short strokes
        for (let i = 0; i < 3; i++) {
          window.setTimeout(() => this.burst(640 + Math.random() * 220, 0.16), i * 260);
        }
        break;
      }
      case 'crumb': {
        this.knock(1900 + Math.random() * 500, 0.008);
        break;
      }
      case 'mom-underline': {
        // room tone to nothing for two seconds; back three dB softer.
        // The chapter's entire silence budget, spent here (ch08 §8).
        if (this.ambient && this.ctx) {
          const t = this.ctx.currentTime;
          this.ambient.gain.linearRampToValueAtTime(0.00001, t + 0.3);
          this.ambient.gain.setValueAtTime(0.00001, t + 2.3);
          this.ambient.gain.linearRampToValueAtTime(this.lastAmbient * 0.7, t + 3.1);
        }
        window.setTimeout(() => this.setAmbientLevel(this.lastAmbient), 22000);
        break;
      }
      case 'line-hesitate': {
        // the melody suspends on a degree that doesn't resolve
        this.tone(466.2, 0, 2.6, 0.02);
        break;
      }
      case 'line-withdraw': {
        this.tone(392, 0, 1.8, 0.024);
        break;
      }
      case 'page-slide': {
        // long paper-drag swell, then the table takes the weight
        this.burst(500, 2.2);
        window.setTimeout(() => this.burst(700, 2.0), 1800);
        window.setTimeout(() => this.burst(900, 1.6), 3600);
        window.setTimeout(() => this.thump(70, 0.9), 5600);
        break;
      }
      case 'pencil-setdown': {
        // one dry wooden click, close-mic'd
        this.knock(210, 0.06);
        window.setTimeout(() => this.knock(150, 0.03), 45);
        break;
      }
      case 'replay-door': {
        this.thump(120, 0.6);
        break;
      }
      /* ---- chapter 9: the score earned back by coverage ---- */
      case 'wo-first-crack': {
        // a long dry split
        this.burst(2400, 0.5);
        window.setTimeout(() => this.burst(1500, 0.4), 160);
        window.setTimeout(() => this.burst(700, 0.5), 340);
        break;
      }
      case 'wo-flake': {
        // papery shiver; pitch falls as the chains grow longer
        const k = Math.min(1, data ?? 0);
        this.burst(2600 - k * 1200, 0.05 + k * 0.06);
        break;
      }
      case 'wo-region': {
        // one soft chord per cleared region; the leviathan's is lowest
        const n = data ?? 0;
        const base = [329.6, 392, 261.6, 196][n % 4];
        this.tone(base, 0, 2.6, 0.034);
        this.tone(base * 1.5, 0.4, 2.6, 0.024);
        this.tone(base * 2, 0.9, 3.0, 0.018);
        break;
      }
      case 'wo-glow': {
        this.tone(1046.5, 0, 3.2, 0.012);
        break;
      }
      case 'wo-gate-open': {
        // the seam-crack running to the corner
        for (let i = 0; i < 6; i++) {
          window.setTimeout(() => this.burst(2000 - i * 220, 0.12), i * 380);
        }
        break;
      }
      case 'wo-names': {
        // a single warm note. No solve-chime — the names are not a collectible.
        this.tone(523.3, 0, 3.4, 0.04);
        break;
      }
      case 'wo-tape-descend': {
        this.burst(3400, 1.8);
        break;
      }
      case 'wo-tape-boom': {
        this.thump(90, 0.8);
        this.knock(140, 0.05);
        break;
      }
      case 'wo-nib-lift': {
        // the lift replaces any chime after — N.
        this.knock(1200, 0.014);
        break;
      }
      case 'wo-wrap': {
        this.burst(800, 1.4);
        window.setTimeout(() => this.burst(1000, 1.2), 900);
        break;
      }
      case 'wo-string': {
        this.burst(2600, 0.3);
        break;
      }
      case 'wo-boom': {
        // the mailbox: the biggest low event in the game, then silence
        this.thump(38, 2.6);
        this.tone(41, 0, 1.8, 0.09);
        this.setAmbientLevel(0);
        break;
      }
    }
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

  /** Low filtered noise body — paper flexing, a book settling. */
  private thump(freq: number, dur: number) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer(dur);
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.06, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    src.connect(f).connect(g).connect(this.master!);
    src.start();
  }

  /** Narrow-band noise transient — something brittle giving way. */
  private burst(freq: number, dur: number) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer(dur);
    const f = ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = freq;
    f.Q.value = 6;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.05, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    src.connect(f).connect(g).connect(this.master!);
    src.start();
  }

  /** Short dry knock (woodblock family). */
  private knock(freq: number, vol = 0.045) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(freq, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(freq * 0.6, ctx.currentTime + 0.06);
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);
    o.connect(g).connect(this.master!);
    o.start();
    o.stop(ctx.currentTime + 0.12);
  }

  /* ---------- generative melody ---------- */

  /** Pick the melodic mood for a region; crossfades over a few seconds. */
  setMood(region: string) {
    this.mood = MOODS[region] ?? MOODS.meadow;
    this.detune = 0;
    this.echo = 0;
    if (this.music && this.ctx && !this.tacet) {
      this.music.gain.linearRampToValueAtTime(
        this.mood.level * this.intensity,
        this.ctx.currentTime + 3
      );
    }
  }

  private startMusic() {
    const ctx = this.ctx!;
    this.music = ctx.createGain();
    this.music.gain.value = 0;
    this.music.connect(this.master!);
    this.music.gain.linearRampToValueAtTime(this.mood.level, ctx.currentTime + 4);
    this.scheduleMusic();
  }

  private scheduleMusic() {
    const wait = this.mood.gap * (0.6 + Math.random() * 0.8);
    this.musicTimer = window.setTimeout(() => {
      this.playPhrase();
      this.scheduleMusic();
    }, wait * 1000);
  }

  /** A short music-box phrase: 1–3 steps that wander, never leap far. */
  private playPhrase() {
    if (!this.ctx || this.muted || this.tacet || document.hidden) return;
    const { scale } = this.mood;
    const len = 1 + Math.floor(Math.random() * 3);
    let idx = Math.min(this.lastIdx, scale.length - 1);
    let at = 0;
    for (let i = 0; i < len; i++) {
      idx = Math.max(0, Math.min(scale.length - 1, idx + (Math.floor(Math.random() * 5) - 2)));
      // the two practised notes, a few cents short of where they live
      const bend = this.detuneDegrees.has(idx) ? 1 - 0.013 * this.detune : 1;
      this.pluck(scale[idx] * bend, at);
      if (this.echo > 0) this.pluck(scale[idx] * bend, at + 0.17, 0.34 * this.echo);
      at += 0.55 + Math.random() * 0.5;
    }
    this.lastIdx = idx;
  }

  /** Music-box voice: a sine with a fast-decaying bright partial. */
  private pluck(freq: number, at: number, gain = 1) {
    const ctx = this.ctx!;
    const t = ctx.currentTime + at;
    const dur = 2.4;
    for (const [mult, vol, decay] of [
      [1, gain, dur],
      [4, 0.18 * gain, 0.5],
    ] as const) {
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.value = freq * mult * (1 + (Math.random() - 0.5) * 0.003);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(vol, t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.001, t + decay);
      o.connect(g).connect(this.music!);
      o.start(t);
      o.stop(t + decay + 0.1);
    }
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
