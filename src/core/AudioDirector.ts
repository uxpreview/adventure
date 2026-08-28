/**
 * THE AUDIO DIRECTOR — the ending's score (design/score.md §2.10–2.14, §5).
 *
 * Nine chapters are scored by a room tone, a step voice and a sparse
 * music box wandering a per-chapter scale. The finale needs something
 * the rest of the game does not: a score that is played by the player.
 * This file is that layer, and it is only ever alive during Chapter 10.
 *
 * What it owns:
 *  - the shop: room tone and the tattoo machine through a floor;
 *  - the parcel suite, the mug, the page-washes, the cover boom;
 *  - THE TWO STRIKES — one gesture, made twice, distinguished only by
 *    the sustain it chooses to leave alive (§2.10). What is spared keeps
 *    ringing and drifts, humanized; what is killed is cut dead in 8 ms;
 *  - the composed zero: `holdSilence` has no timeout and no music path
 *    back in. Beat 5 is the mix being architecturally incapable of
 *    flinching;
 *  - Beat 9, the thesis: walking tempo IS phrase timing. The stride
 *    tracker holds an EMA of the player's step intervals — no grid, no
 *    quantize, the tempo is the gait including its jitter — and her line
 *    is one continuous portamento voice whose pitch follows the player's
 *    heading. She lags every response by 0.4 strides. The latency is the
 *    love;
 *  - the reserved D6, unused for nine chapters, spent when the player's
 *    own path closes a loop;
 *  - the pencil register: after the pickup, no phrase ends on the tonic.
 *    Pencil is the future tense, so the score suspends every cadence;
 *  - the credits duet, and one last friendly chime for Rule 3.
 *
 * All of it is oscillators and noise. There is no asset here either.
 */

/** Home is D. Everything below is measured from it. */
const D3 = 146.83;
const D4 = 293.66;
const A3 = 220;
const D6 = 1174.66;

/** Her adult voice: warm, matured, a sixth-and-second world, no leading tone. */
const WARM_SCALE = [0, 2, 5, 7, 9, 12, 14, 17].map((s) => D4 * Math.pow(2, s / 12));
/** Pip's voice sits a register below hers and shares her degrees. */
const BOX_SCALE = [0, 2, 5, 7, 9, 12].map((s) => D3 * Math.pow(2, s / 12));

export class AudioDirector {
  /** Silence with no way back in until it is released by name. */
  silent = false;
  /** Set at the pencil pickup: from here on, no phrase ends on the tonic. */
  private pencilRegister = false;
  private beat = 0;

  /* the shop */
  private room: { src: AudioBufferSourceNode; gain: GainNode; lp: BiquadFilterNode } | null = null;
  private hum: { osc: OscillatorNode; gain: GainNode; bp: BiquadFilterNode; lfo: OscillatorNode } | null = null;
  private humTimer: number | undefined;

  /* her line, Beat 9 */
  private line: { osc: OscillatorNode; gain: GainNode; lp: BiquadFilterNode } | null = null;
  private lineTarget = D4;
  private halo: { src: AudioBufferSourceNode; gain: GainNode } | null = null;

  /* the stride tracker */
  private lastStep = 0;
  private stride = 0.62;
  private stepCount = 0;
  private headingBias = 0;

  private noise2: AudioBuffer | null = null;

  constructor(
    private ctx: AudioContext,
    private master: GainNode,
    private isMuted: () => boolean
  ) {}

  private get t() {
    return this.ctx.currentTime;
  }

  private noise(seconds = 2): AudioBuffer {
    // one shared buffer, per score §6.3 — every noise voice filters it
    if (seconds === 2 && this.noise2) return this.noise2;
    const buf = this.ctx.createBuffer(1, Math.ceil(this.ctx.sampleRate * seconds), this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    if (seconds === 2) this.noise2 = buf;
    return buf;
  }

  /** The humanizer (§2.0). The forgery's tell is this being bypassed. */
  private hand(v: number, spread = 0.02) {
    return v * (1 + (Math.random() - 0.5) * 2 * spread);
  }

  private out(): GainNode {
    return this.master;
  }

  private tone(
    freq: number,
    at: number,
    dur: number,
    vol: number,
    o: { type?: OscillatorType; glideFrom?: number; drift?: number; dest?: AudioNode } = {}
  ) {
    if (this.isMuted() || this.silent) return null;
    const ctx = this.ctx;
    const t0 = this.t + at;
    const osc = ctx.createOscillator();
    osc.type = o.type ?? 'sine';
    if (o.glideFrom) {
      osc.frequency.setValueAtTime(o.glideFrom, t0);
      osc.frequency.exponentialRampToValueAtTime(freq, t0 + 0.14);
    } else {
      osc.frequency.setValueAtTime(freq, t0);
    }
    // warm voices drift; the cold ones (the forgery, the machine) do not
    if (o.drift) {
      osc.detune.setValueAtTime(0, t0);
      osc.detune.linearRampToValueAtTime((Math.random() - 0.5) * o.drift, t0 + dur);
    }
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0008, t0 + dur);
    osc.connect(g).connect(o.dest ?? this.out());
    osc.start(t0);
    osc.stop(t0 + dur + 0.1);
    return { osc, gain: g, t0 };
  }

  private noiseHit(
    at: number,
    dur: number,
    vol: number,
    filter: { type: BiquadFilterType; from: number; to?: number; q?: number }
  ) {
    if (this.isMuted() || this.silent) return;
    const ctx = this.ctx;
    const t0 = this.t + at;
    const src = ctx.createBufferSource();
    src.buffer = this.noise(Math.max(0.25, dur));
    const f = ctx.createBiquadFilter();
    f.type = filter.type;
    f.frequency.setValueAtTime(filter.from, t0);
    if (filter.to) f.frequency.exponentialRampToValueAtTime(filter.to, t0 + dur);
    f.Q.value = filter.q ?? 1;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.0008, t0 + dur);
    src.connect(f).connect(g).connect(this.out());
    src.start(t0);
    src.stop(t0 + dur + 0.05);
  }

  /* ------------------------------ the shop ------------------------------ */

  /**
   * Her room. `muffled` is Beat 0: we are inside a cardboard box on a
   * floor below all of this, and the whole recipe is behind a wall.
   */
  roomTone(on: boolean, muffled = false) {
    if (!on) {
      if (this.room) {
        this.room.gain.gain.linearRampToValueAtTime(0, this.t + 1.2);
        const r = this.room;
        window.setTimeout(() => r.src.stop(), 1600);
        this.room = null;
      }
      return;
    }
    if (!this.room) {
      const src = this.ctx.createBufferSource();
      src.buffer = this.noise(2);
      src.loop = true;
      const lp = this.ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = muffled ? 400 : 1600;
      const gain = this.ctx.createGain();
      gain.gain.value = 0;
      src.connect(lp).connect(gain).connect(this.out());
      src.start();
      this.room = { src, gain, lp };
    }
    this.room.lp.frequency.linearRampToValueAtTime(muffled ? 400 : 1600, this.t + 2);
    this.room.gain.gain.linearRampToValueAtTime(muffled ? 0.008 : 0.019, this.t + 2);
  }

  /**
   * The tattoo machine (§2.11): a coil formant, amplitude-modulated at
   * 60 Hz — and the AM is deliberately NOT humanized. It is the only
   * sound in the score with a motor's regularity, because it is the only
   * thing in the fiction that is a machine.
   */
  waspHum(mode: 'floor' | 'room' | 'off') {
    window.clearTimeout(this.humTimer);
    if (mode === 'off') {
      if (this.hum) {
        this.hum.gain.gain.linearRampToValueAtTime(0, this.t + 0.6);
        const h = this.hum;
        window.setTimeout(() => {
          h.osc.stop();
          h.lfo.stop();
        }, 900);
        this.hum = null;
      }
      return;
    }
    if (!this.hum) {
      const osc = this.ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = 85;
      const bp = this.ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 1200;
      bp.Q.value = 1.4;
      const lp = this.ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = mode === 'floor' ? 400 : 3000;
      const gain = this.ctx.createGain();
      gain.gain.value = 0;
      // the 60 Hz amplitude modulation — a motor, exactly on time
      const lfo = this.ctx.createOscillator();
      lfo.frequency.value = 60;
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.value = 0.6;
      lfo.connect(lfoGain).connect(gain.gain);
      osc.connect(bp).connect(lp).connect(gain).connect(this.out());
      osc.start();
      lfo.start();
      this.hum = { osc, gain, bp, lfo };
      (this.hum as unknown as { lp: BiquadFilterNode }).lp = lp;
    }
    const level = mode === 'floor' ? 0.0055 : 0.011;
    const burst = () => {
      if (!this.hum || this.silent) return;
      const dur = 2 + Math.random() * 7;
      this.hum.gain.gain.linearRampToValueAtTime(level, this.t + 0.3);
      this.humTimer = window.setTimeout(() => {
        if (!this.hum) return;
        this.hum.gain.gain.linearRampToValueAtTime(0, this.t + 0.5);
        this.humTimer = window.setTimeout(burst, 1500 + Math.random() * 6000);
      }, dur * 1000);
    };
    burst();
  }

  /* --------------------------- the parcel suite --------------------------- */

  /** String pull, string cut, and then the tear — used as an opening. */
  parcelOpen() {
    // the string: thin, tense, gliding up
    this.noiseHit(0, 0.5, 0.03, { type: 'bandpass', from: 1800, to: 2600, q: 12 });
    // the cut: click + thump, instant
    this.noiseHit(0.55, 0.04, 0.05, { type: 'highpass', from: 3000 });
    this.tone(80, 0.55, 0.18, 0.05);
    // the tear, unchanged from every other tear in the game. What is
    // recontextualized is what follows it, never the sound itself.
    this.noiseHit(0.9, 0.42, 0.055, { type: 'bandpass', from: 700, to: 2200, q: 1.2 });
    for (let i = 0; i < 22; i++) {
      this.noiseHit(1.0 + Math.random() * 1.4, 0.03, 0.02, {
        type: 'bandpass', from: 1000 + Math.random() * 3000, q: 6,
      });
    }
  }

  /**
   * The mug (§2.13): a ceramic tock, then the glaze singing on the page
   * for two seconds — and Pip's stagger scored as a three-note flub.
   * The loudest character introduction in the game is a coffee stain,
   * so the joke lands first and the reverence arrives two seconds late.
   */
  mugStamp() {
    const ctx = this.ctx;
    const t0 = this.t;
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(260, t0);
    o.frequency.exponentialRampToValueAtTime(180, t0 + 0.01);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.075, t0);
    g.gain.exponentialRampToValueAtTime(0.0008, t0 + 0.07);
    o.connect(g).connect(this.out());
    o.start(t0);
    o.stop(t0 + 0.12);
    this.tone(1900, 0, 0.09, 0.012);
    this.tone(2700, 0, 0.07, 0.009);
    // the glaze, singing on the page
    this.tone(2400, 0.06, 2.0, 0.006);
    // the flub: fast, wrong neighbours, quiet
    const wrong = [BOX_SCALE[2] * 1.06, BOX_SCALE[1] * 0.97, BOX_SCALE[3] * 1.03];
    wrong.forEach((f, i) => this.tone(f, 0.18 + i * 0.11, 0.5, 0.016));
  }

  /** A wash of light going past; panned with the wipe. */
  pageWash(dir: 'left' | 'right') {
    void dir;
    this.noiseHit(0, 0.62, 0.026, { type: 'bandpass', from: 220, to: 1200, q: 0.8 });
    this.noiseHit(0.55, 0.05, 0.014, { type: 'highpass', from: 1800 });
    // the felted ghost quote: two notes of somebody else's chapter,
    // thirty decibels down, going past with the page
    if (Math.random() < 0.75) {
      const s = WARM_SCALE[Math.floor(Math.random() * WARM_SCALE.length)];
      this.tone(s * 0.5, 0.15, 1.4, 0.0055, { drift: 6 });
      this.tone(s * 0.5 * 1.5, 0.42, 1.2, 0.004, { drift: 6 });
    }
  }

  /* ----------------------------- the two strikes ----------------------------- */

  /**
   * ONE gesture, made twice (§2.10). The nib press and the scratch are
   * identical by construction — same call, same numbers, both times —
   * and everything that differs is what is left ringing afterward.
   *
   * JUSTICE: the cold signature is sounding; the warm sentence enters
   * with the press; the scratch's end hard-cuts the cold tone in 8 ms
   * and the sentence rings on, drifting, for four seconds.
   * MERCY: mirrored. The dark verdict is sounding, her signature enters,
   * and the verdict is the one that gets cut.
   */
  strike(kind: 'justice' | 'mercy') {
    if (this.isMuted() || this.silent) return;
    const ctx = this.ctx;
    const t0 = this.t;
    const SCRATCH = 0.35;

    // what is already sounding, and will die
    const doomed = ctx.createGain();
    doomed.gain.value = 0;
    doomed.connect(this.out());
    if (kind === 'justice') {
      // the forged signature: A5, zero drift, beating against itself
      for (const f of [880, 880 * 1.004]) {
        const o = ctx.createOscillator();
        o.type = 'sine';
        o.frequency.value = f;
        o.connect(doomed);
        o.start(t0);
        o.stop(t0 + 6);
      }
    } else {
      // her old verdict: a low minor dyad, humanized, because it was honest
      for (const f of [D4, D4 * Math.pow(2, 3 / 12)]) {
        const o = ctx.createOscillator();
        o.type = 'sine';
        o.frequency.value = this.hand(f * 0.5, 0.004);
        o.detune.linearRampToValueAtTime((Math.random() - 0.5) * 9, t0 + 5);
        o.connect(doomed);
        o.start(t0);
        o.stop(t0 + 6);
      }
    }
    doomed.gain.linearRampToValueAtTime(0.03, t0 + 0.5);

    // the press: the heaviest pen-contact in the game
    const press = () => {
      this.noiseHit(0, 0.02, 0.06, { type: 'highpass', from: 4000 });
      this.tone(150, 0, 0.16, 0.075);
    };
    // the scratch: a bandpass sweeping down under a pressure tremor,
    // with a terminal flick
    const scratch = () => {
      const src = ctx.createBufferSource();
      src.buffer = this.noise(0.5);
      const f = ctx.createBiquadFilter();
      f.type = 'bandpass';
      f.Q.value = 2.2;
      const s0 = this.t;
      f.frequency.setValueAtTime(1800, s0);
      f.frequency.exponentialRampToValueAtTime(900, s0 + SCRATCH);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, s0);
      g.gain.linearRampToValueAtTime(0.05, s0 + 0.06);
      g.gain.linearRampToValueAtTime(0.032, s0 + SCRATCH - 0.04);
      // the 8 Hz pressure tremor of a hand pushing a nib across paper
      const trem = ctx.createOscillator();
      trem.frequency.value = 8;
      const tremG = ctx.createGain();
      tremG.gain.value = 0.012;
      trem.connect(tremG).connect(g.gain);
      trem.start(s0);
      trem.stop(s0 + SCRATCH + 0.1);
      src.connect(f).connect(g).connect(this.out());
      src.start(s0);
      src.stop(s0 + SCRATCH + 0.06);
      // terminal flick
      this.noiseHit(SCRATCH - 0.04, 0.05, 0.05, { type: 'highpass', from: 2600 });
    };

    press();
    // the survivor enters WITH the press, and keeps its humanity
    if (kind === 'justice') {
      // the sentence: a warm low dyad, gliding in, drifting
      this.tone(D4, 0.02, 4.2, 0.03, { glideFrom: D4 * 0.94, drift: 12 });
      this.tone(A3, 0.06, 4.4, 0.024, { glideFrom: A3 * 0.95, drift: 12 });
    } else {
      // her signature: one high warm tone with a halo, alone
      this.tone(D4 * Math.pow(2, 9 / 12) * 2, 0.02, 5.2, 0.026, {
        glideFrom: D4 * Math.pow(2, 7 / 12) * 2, drift: 14,
      });
      this.tone(D4 * Math.pow(2, 9 / 12) * 4, 0.35, 3.0, 0.006, { drift: 10 });
    }
    window.setTimeout(scratch, 90);
    // what is killed is cut dead: 8 ms, no release
    window.setTimeout(() => {
      doomed.gain.cancelScheduledValues(this.t);
      doomed.gain.setValueAtTime(doomed.gain.value, this.t);
      doomed.gain.linearRampToValueAtTime(0, this.t + 0.008);
    }, (90 + SCRATCH * 1000) | 0);
  }

  /* ------------------------------ Beat 5 ------------------------------ */

  /** The cover: the biggest low event in the game, and then nothing. */
  coverBoom() {
    const ctx = this.ctx;
    const t0 = this.t;
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(45, t0);
    o.frequency.exponentialRampToValueAtTime(28, t0 + 0.5);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.14, t0);
    g.gain.exponentialRampToValueAtTime(0.0008, t0 + 0.9);
    o.connect(g).connect(this.out());
    o.start(t0);
    o.stop(t0 + 1);
    this.noiseHit(0, 0.5, 0.05, { type: 'lowpass', from: 900, to: 120 });
  }

  /**
   * The composed zero (§4.5). No timeout, no automatic release, no
   * music path back in while it holds. Playtest pressure to help Beat 5
   * with score has to lose, so it loses in the code.
   */
  holdSilence(on: boolean) {
    this.silent = on;
    if (on) {
      this.roomTone(false);
      this.waspHum('off');
      this.penFollow(false);
    }
  }

  /** Page flutter and light coming back. */
  bookReopen() {
    this.noiseHit(0, 0.8, 0.03, { type: 'bandpass', from: 400, to: 2400, q: 0.7 });
    for (let i = 0; i < 5; i++) {
      this.noiseHit(0.1 + i * 0.13, 0.05, 0.02, { type: 'bandpass', from: 900 + i * 260, q: 4 });
    }
  }

  /* ------------------------------ Beat 9 ------------------------------ */

  /**
   * Her pen, following. Pitched below the player's own step-scratch so
   * the duet is legible as two hands: the player's feet are the higher
   * voice, her nib is the lower one. It stops the moment she idles —
   * the silence when the player stops walking is her waiting.
   */
  penFollow(on: boolean, level = 0.02) {
    if (!on) {
      if (this.halo) {
        this.halo.gain.gain.linearRampToValueAtTime(0, this.t + 0.2);
        const h = this.halo;
        window.setTimeout(() => h.src.stop(), 500);
        this.halo = null;
      }
      return;
    }
    if (this.isMuted() || this.silent) return;
    if (!this.halo) {
      const src = this.ctx.createBufferSource();
      src.buffer = this.noise(2);
      src.loop = true;
      const bp = this.ctx.createBiquadFilter();
      bp.type = 'bandpass';
      // ~20% below the step scratch's 1150 Hz centre
      bp.frequency.value = 920;
      bp.Q.value = 1.3;
      const gain = this.ctx.createGain();
      gain.gain.value = 0;
      src.connect(bp).connect(gain).connect(this.out());
      src.start();
      this.halo = { src, gain };
    }
    this.halo.gain.gain.linearRampToValueAtTime(level, this.t + 0.1);
  }

  /**
   * Her line as one continuous voice: pitch follows the player's
   * heading (turning left bends up, right bends down) with an 80 ms
   * glide onto the nearest degree, loudness follows speed. The line is
   * literally drawn in pitch — the same gesture, in two media.
   */
  startLine() {
    if (this.line || this.isMuted() || this.silent) return;
    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = D4;
    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 1400;
    const gain = this.ctx.createGain();
    gain.gain.value = 0;
    osc.connect(lp).connect(gain).connect(this.out());
    osc.start();
    this.line = { osc, gain, lp };
  }

  stopLine() {
    if (!this.line) return;
    const l = this.line;
    l.gain.gain.linearRampToValueAtTime(0, this.t + 1.2);
    window.setTimeout(() => l.osc.stop(), 1600);
    this.line = null;
  }

  /**
   * Feed the line. `heading` is the walker's, `speed` is 0–1 of cruise.
   * She lags: the pitch she is asked for now is the one she glides to
   * over 0.4 strides, which is audible followership, tuned like the
   * Chapter 3 boat.
   */
  driveLine(heading: number, speed: number) {
    if (!this.line) return;
    const turn = Math.sin(heading);
    // map heading across her scale with soft snapping to a degree
    const idx = Math.round(((turn + 1) / 2) * (WARM_SCALE.length - 1));
    const want = WARM_SCALE[Math.max(0, Math.min(WARM_SCALE.length - 1, idx))];
    if (Math.abs(want - this.lineTarget) > 0.5) {
      this.lineTarget = want;
      const lag = 0.4 * this.stride;
      this.line.osc.frequency.cancelScheduledValues(this.t);
      this.line.osc.frequency.setValueAtTime(this.line.osc.frequency.value, this.t + lag);
      this.line.osc.frequency.linearRampToValueAtTime(this.hand(want, 0.002), this.t + lag + 0.08);
    }
    const target = 0.004 + speed * 0.012;
    this.line.gain.gain.linearRampToValueAtTime(target, this.t + 0.25);
    this.line.lp.frequency.linearRampToValueAtTime(900 + speed * 1800, this.t + 0.3);
  }

  /**
   * A footstep. The stride tracker is an EMA of the last few intervals,
   * clamped to a walk — no grid, no quantize; the tempo IS the gait,
   * jitter included. Every Nth step answers in Pip's voice, N adapting
   * so the note rate stays around one a second whatever the pace.
   */
  footstep(headingDelta = 0) {
    const now = this.t;
    if (this.lastStep > 0) {
      const gap = Math.min(1.2, Math.max(0.25, now - this.lastStep));
      this.stride = this.stride * 0.75 + gap * 0.25;
    }
    this.lastStep = now;
    this.headingBias = this.headingBias * 0.6 + headingDelta * 0.4;
    this.stepCount++;
    const n = this.stride < 0.45 ? 4 : this.stride < 0.75 ? 3 : 2;
    if (this.stepCount % n !== 0) return;
    // contour biased by where they have been turning
    const base = Math.floor(BOX_SCALE.length / 2);
    let i = base + Math.round(this.headingBias * 2.2 + (Math.random() - 0.5) * 1.6);
    i = Math.max(0, Math.min(BOX_SCALE.length - 1, i));
    // pencil register: never land on the tonic. Everything after the
    // pickup is a comma.
    if (this.pencilRegister && i % BOX_SCALE.length === 0) i = 1;
    this.box(BOX_SCALE[i], 0, this.pencilRegister ? 0.016 : 0.028);
  }

  /** The music-box voice: a sine with one bright partial that dies fast. */
  private box(freq: number, at: number, vol = 0.03, dest?: AudioNode) {
    this.tone(this.hand(freq, 0.003), at, 2.2, vol, { dest });
    this.tone(this.hand(freq * 4, 0.004), at, 0.42, vol * 0.16, { dest });
  }

  /**
   * The reserved note (§5). D6 has not been played once in nine
   * chapters. The player's own closed loop spends it — the game's first
   * and only full cadence, and it is not the game's, it is theirs.
   */
  oceanCadence() {
    if (this.isMuted() || this.silent) return;
    this.box(D4 * Math.pow(2, 7 / 12), 0, 0.026);
    this.box(D4 * Math.pow(2, 9 / 12), 0.28, 0.026);
    this.tone(D6, 0.62, 5.5, 0.03, { glideFrom: D6 * 0.985, drift: 8 });
    this.tone(D6 * 1.5, 0.9, 3.2, 0.007, { drift: 8 });
  }

  /** Attention becoming habitat, harmonically. Never a sting. */
  monsterBloom(size = 1) {
    const base = D3 * 0.5 * (1.15 - size * 0.15);
    this.tone(base, 0, 4.2, 0.03, { glideFrom: base * 0.9, drift: 14 });
    // two playfully inharmonic partials — too many teeth — resolving inward
    this.tone(base * 3.17, 0.2, 2.4, 0.008, { drift: 20 });
    this.tone(base * 4.73, 0.3, 2.2, 0.006, { drift: 20 });
    this.tone(base * 3, 1.8, 2.4, 0.007);
    this.tone(base * 4, 2.0, 2.2, 0.006);
  }

  /** One frame, one honk. */
  geraldHonk() {
    this.noiseHit(0, 0.16, 0.012, { type: 'bandpass', from: 520, q: 9 });
    this.tone(196, 0.02, 0.3, 0.014, { type: 'square' });
  }

  /* --------------------------- Beats 11–12 --------------------------- */

  checkmark() {
    this.noiseHit(0, 0.07, 0.035, { type: 'bandpass', from: 1900, to: 2600, q: 3 });
    this.noiseHit(0.09, 0.11, 0.03, { type: 'bandpass', from: 2400, to: 1400, q: 3 });
    // the friendly collect-chime's warm sibling — a fifth, not the full rise
    this.box(D4 * Math.pow(2, 7 / 12), 0.18, 0.024);
    this.box(D4 * Math.pow(2, 12 / 12), 0.3, 0.02);
  }

  /**
   * One small wooden tick, and the whole score drops into pencil. From
   * here to the last frame no phrase ends on the tonic: pencil is the
   * future tense, so every cadence is suspended. Beat 9's D6 was the
   * game's only period; everything after it is a comma.
   */
  pencilPickup() {
    const ctx = this.ctx;
    const t0 = this.t;
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(760, t0);
    o.frequency.exponentialRampToValueAtTime(430, t0 + 0.04);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.03, t0);
    g.gain.exponentialRampToValueAtTime(0.0008, t0 + 0.08);
    o.connect(g).connect(this.out());
    o.start(t0);
    o.stop(t0 + 0.12);
    this.pencilRegister = true;
  }

  /** Each settling stroke is one note, converging on — not onto — home. */
  settleNote(i: number) {
    const degrees = [4, 2, 5, 1, 6, 2, 4, 1, 2];
    const d = degrees[i % degrees.length];
    this.box(WARM_SCALE[Math.min(WARM_SCALE.length - 1, d)] * 0.5, 0, 0.02);
  }

  /**
   * The layers exhale in order and leave BREATH under a held,
   * unresolved warm dyad. Fade not to black: to paper, and PAPER is the
   * last layer standing when the credits begin.
   */
  finalExhale() {
    this.penFollow(false);
    this.stopLine();
    this.tone(D3, 0.6, 18, 0.022, { drift: 8 });
    this.tone(D3 * Math.pow(2, 9 / 12), 1.4, 17, 0.016, { drift: 8 });
    this.waspHum('off');
    if (this.room) this.room.gain.gain.linearRampToValueAtTime(0.012, this.t + 8);
  }

  /* ------------------------------ credits ------------------------------ */

  /**
   * The credits duet: black strokes answer in Pip's voice, blue in
   * hers, strictly alternating — the turn structure of the whole book,
   * as an arrangement. The first new collaborative page in twenty-six
   * years is also the first time these two voices sound at once.
   */
  creditsStroke(handIs: 'black' | 'blue', overlap = 0) {
    if (this.isMuted()) return;
    if (handIs === 'black') {
      const i = 1 + Math.floor(Math.random() * (BOX_SCALE.length - 1));
      this.box(BOX_SCALE[i], 0, 0.024);
      if (overlap > 0.5) this.box(BOX_SCALE[Math.max(1, i - 2)], 0.34, 0.014);
    } else {
      const i = 1 + Math.floor(Math.random() * (WARM_SCALE.length - 2));
      this.tone(this.hand(WARM_SCALE[i], 0.003), 0, 2.6, 0.022, {
        glideFrom: WARM_SCALE[Math.max(0, i - 1)], drift: 10,
      });
      if (overlap > 0.5) this.tone(WARM_SCALE[i] * 1.5, 0.4, 2.0, 0.008, { drift: 10 });
    }
    // the ground the two of them stand on: D–G–A, felted, under everything
    if (Math.random() < 0.14) {
      const ground = [D3, D3 * Math.pow(2, 5 / 12), D3 * Math.pow(2, 7 / 12)];
      this.tone(ground[Math.floor(Math.random() * 3)] * 0.5, 0, 6, 0.012, { drift: 6 });
    }
  }

  /**
   * The original chime, one last time. It meant *collected*, then it
   * meant *forged*. Now it means your turn.
   */
  ruleThree() {
    this.box(D4 * Math.pow(2, 5 / 12), 0, 0.03);
    this.box(D4 * Math.pow(2, 9 / 12), 0.18, 0.03);
    // and no cadence: the last interval in the game is left open
    this.tone(D3, 0.5, 12, 0.018, { drift: 8 });
    this.tone(D3 * Math.pow(2, 2 / 12), 1.2, 11, 0.012, { drift: 8 });
  }

  /* ------------------------------ presets ------------------------------ */

  /** Beat presets (score §4.2 `setEndingBeat`). */
  setEndingBeat(n: number) {
    this.beat = n;
    switch (n) {
      case 0:
        this.roomTone(true, true);
        this.waspHum('floor');
        break;
      case 1:
        this.roomTone(true, false);
        this.waspHum('room');
        break;
      case 4:
        // she isn't working; she's reading
        this.waspHum('off');
        break;
      case 8:
        this.waspHum('off');
        this.roomTone(true, false);
        break;
      default:
        break;
    }
  }

  get endingBeat() {
    return this.beat;
  }

  dispose() {
    window.clearTimeout(this.humTimer);
    this.roomTone(false);
    this.waspHum('off');
    this.penFollow(false);
    this.stopLine();
    this.silent = false;
    this.pencilRegister = false;
  }
}
