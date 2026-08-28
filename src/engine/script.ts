import { stroke, type Ctx2D } from './ink';

/**
 * The parametric handwriting synthesizer (ARCHITECTURE #28).
 *
 * Every letter in the game that a PERSON wrote is drawn here — never a
 * font, never ctx.fillText. Glyphs are normalized polyline skeletons; a
 * `Hand` is the set of parameters that turn a skeleton into somebody's
 * writing. Two presets and a lerp between them are the whole of Chapter
 * 6: thirty repetitions of one sentence, each one three per cent further
 * from him and closer to her.
 *
 * The forgery's tell lives in this file and nowhere else: BEA_HAND has
 * no heel-smudge pass (`stroke`'s smudge is opt-in here), because a
 * right-handed boy copying a left-handed girl can copy the slant, the
 * bounce and the open counters, and cannot copy the drag of her hand
 * across her own wet ink.
 *
 * Glyph space: baseline y = 0, x-height top y = -1, ascenders to -1.45,
 * descenders to +0.45. Advance widths in the same units.
 */

type Poly = [number, number][];
type Glyph = { s: Poly[]; adv: number; cap?: boolean };

const g = (adv: number, ...s: Poly[]): Glyph => ({ s, adv });
const cap = (adv: number, ...s: Poly[]): Glyph => ({ s, adv, cap: true });

/* ---------------- lowercase: the working alphabet ---------------- */

const LOWER: Record<string, Glyph> = {
  a: g(0.78,
    [[0.62, -0.80], [0.44, -1.00], [0.18, -0.90], [0.08, -0.52], [0.18, -0.10], [0.46, -0.04], [0.62, -0.24]],
    [[0.64, -1.00], [0.61, -0.22], [0.74, 0.01]]),
  b: g(0.74,
    [[0.12, -1.45], [0.10, -0.03]],
    [[0.10, -0.58], [0.30, -0.86], [0.58, -0.74], [0.62, -0.34], [0.42, -0.03], [0.13, -0.10]]),
  c: g(0.70,
    [[0.66, -0.76], [0.44, -1.00], [0.16, -0.86], [0.07, -0.50], [0.18, -0.11], [0.48, -0.02], [0.68, -0.20]]),
  d: g(0.80,
    [[0.62, -0.80], [0.42, -1.00], [0.16, -0.88], [0.07, -0.50], [0.18, -0.09], [0.48, -0.04], [0.64, -0.28]],
    [[0.66, -1.45], [0.63, -0.22], [0.76, 0.01]]),
  e: g(0.70,
    [[0.10, -0.46], [0.60, -0.54], [0.56, -0.84], [0.32, -0.99], [0.11, -0.74], [0.08, -0.34], [0.26, -0.04], [0.58, -0.13]]),
  f: g(0.60,
    [[0.56, -1.45], [0.38, -1.42], [0.31, -1.10], [0.26, -0.02]],
    [[0.06, -0.90], [0.56, -0.98]]),
  g: g(0.78,
    [[0.62, -0.80], [0.42, -1.00], [0.16, -0.88], [0.07, -0.52], [0.20, -0.10], [0.48, -0.06], [0.63, -0.28]],
    [[0.65, -1.00], [0.60, -0.10], [0.50, 0.32], [0.20, 0.44], [0.04, 0.32]]),
  h: g(0.74,
    [[0.12, -1.45], [0.10, -0.02]],
    [[0.10, -0.56], [0.30, -0.88], [0.56, -0.78], [0.60, -0.42], [0.61, -0.02]]),
  i: g(0.42,
    [[0.28, -0.96], [0.25, -0.06], [0.38, 0.01]],
    [[0.30, -1.30], [0.34, -1.24]]),
  j: g(0.46,
    [[0.34, -0.96], [0.31, 0.18], [0.20, 0.42], [0.03, 0.34]],
    [[0.36, -1.30], [0.40, -1.24]]),
  k: g(0.70,
    [[0.12, -1.45], [0.10, -0.02]],
    [[0.58, -0.90], [0.12, -0.40]],
    [[0.26, -0.54], [0.62, -0.02]]),
  l: g(0.42,
    [[0.28, -1.45], [0.24, -0.20], [0.40, 0.01]]),
  m: g(0.98,
    [[0.08, -0.96], [0.07, -0.02]],
    [[0.07, -0.60], [0.22, -0.92], [0.42, -0.82], [0.44, -0.02]],
    [[0.44, -0.60], [0.60, -0.92], [0.80, -0.82], [0.82, -0.02]]),
  n: g(0.72,
    [[0.10, -0.96], [0.09, -0.02]],
    [[0.09, -0.58], [0.28, -0.92], [0.52, -0.80], [0.56, -0.02]]),
  o: g(0.76,
    [[0.38, -1.00], [0.13, -0.84], [0.06, -0.48], [0.18, -0.10], [0.46, -0.02], [0.66, -0.26], [0.64, -0.72], [0.40, -0.99]]),
  p: g(0.76,
    [[0.10, -0.96], [0.05, 0.44]],
    [[0.10, -0.68], [0.32, -0.98], [0.60, -0.84], [0.61, -0.42], [0.40, -0.12], [0.10, -0.20]]),
  q: g(0.78,
    [[0.62, -0.82], [0.40, -1.00], [0.14, -0.86], [0.07, -0.48], [0.20, -0.10], [0.48, -0.08], [0.63, -0.30]],
    [[0.65, -1.00], [0.62, 0.42], [0.78, 0.30]]),
  r: g(0.58,
    [[0.12, -0.96], [0.11, -0.02]],
    [[0.11, -0.64], [0.30, -0.94], [0.56, -0.86]]),
  s: g(0.64,
    [[0.62, -0.84], [0.38, -1.00], [0.15, -0.84], [0.25, -0.58], [0.53, -0.44], [0.58, -0.18], [0.33, -0.01], [0.09, -0.15]]),
  t: g(0.60,
    [[0.33, -1.36], [0.28, -0.22], [0.44, -0.01], [0.60, -0.11]],
    [[0.06, -0.94], [0.55, -1.00]]),
  u: g(0.74,
    [[0.10, -0.96], [0.11, -0.26], [0.29, -0.02], [0.52, -0.20], [0.56, -0.96]],
    [[0.56, -0.30], [0.57, -0.02], [0.70, 0.01]]),
  v: g(0.70,
    [[0.05, -0.96], [0.34, -0.02], [0.65, -0.96]]),
  w: g(0.92,
    [[0.05, -0.96], [0.24, -0.02], [0.44, -0.68], [0.62, -0.02], [0.84, -0.96]]),
  x: g(0.68,
    [[0.07, -0.94], [0.60, -0.03]],
    [[0.61, -0.94], [0.07, -0.03]]),
  y: g(0.72,
    [[0.07, -0.96], [0.33, -0.20]],
    [[0.64, -0.96], [0.43, -0.10], [0.27, 0.32], [0.05, 0.42]]),
  z: g(0.70,
    [[0.07, -0.90], [0.60, -0.96], [0.09, -0.05], [0.65, -0.11]]),
};

/* ---- capitals. Only the ones the game writes get bespoke skeletons; ---- */
/* ---- the rest are their lowercase, drawn at cap height (which is    ---- */
/* ---- what most hands actually do).                                  ---- */

const UPPER: Record<string, Glyph> = {
  A: cap(0.82,
    [[0.03, -0.02], [0.38, -1.42], [0.74, -0.04]],
    [[0.16, -0.48], [0.62, -0.53]]),
  B: cap(0.82,
    [[0.13, -1.42], [0.10, -0.02]],
    [[0.13, -1.42], [0.52, -1.37], [0.65, -1.14], [0.46, -0.80], [0.11, -0.76]],
    [[0.11, -0.76], [0.58, -0.70], [0.71, -0.40], [0.52, -0.05], [0.10, -0.02]]),
  D: cap(0.88,
    [[0.12, -1.42], [0.10, -0.02]],
    [[0.12, -1.42], [0.52, -1.36], [0.76, -1.02], [0.74, -0.40], [0.48, -0.04], [0.10, -0.02]]),
  E: cap(0.74,
    [[0.66, -1.40], [0.14, -1.42], [0.11, -0.03], [0.66, -0.02]],
    [[0.12, -0.74], [0.50, -0.76]]),
  F: cap(0.70,
    [[0.66, -1.40], [0.14, -1.42], [0.11, -0.02]],
    [[0.12, -0.76], [0.50, -0.78]]),
  G: cap(0.88,
    [[0.80, -1.28], [0.44, -1.44], [0.14, -1.14], [0.08, -0.66], [0.20, -0.16], [0.56, -0.02], [0.80, -0.24], [0.80, -0.62], [0.52, -0.62]]),
  H: cap(0.84,
    [[0.11, -1.42], [0.09, -0.02]],
    [[0.74, -1.42], [0.72, -0.02]],
    [[0.10, -0.72], [0.73, -0.76]]),
  I: cap(0.44,
    [[0.30, -1.42], [0.26, -0.02]]),
  L: cap(0.70,
    [[0.15, -1.42], [0.11, -0.03], [0.66, -0.02]]),
  M: cap(1.02,
    [[0.05, -0.02], [0.10, -1.42], [0.46, -0.58], [0.82, -1.42], [0.88, -0.02]]),
  N: cap(0.86,
    [[0.06, -0.02], [0.11, -1.42], [0.68, -0.06], [0.73, -1.42]]),
  R: cap(0.82,
    [[0.13, -1.42], [0.10, -0.02]],
    [[0.13, -1.42], [0.56, -1.36], [0.68, -1.08], [0.46, -0.74], [0.11, -0.72]],
    [[0.32, -0.74], [0.74, -0.02]]),
  T: cap(0.76,
    [[0.04, -1.40], [0.72, -1.44]],
    [[0.40, -1.42], [0.35, -0.02]]),
  Y: cap(0.78,
    [[0.05, -1.42], [0.38, -0.66]],
    [[0.72, -1.42], [0.35, -0.62], [0.32, -0.02]]),
};

/** Figures, written at cap height the way a hand writes them. */
const DIGIT: Record<string, Glyph> = {
  '0': cap(0.80, [[0.42, -1.30], [0.14, -1.05], [0.08, -0.62], [0.18, -0.14], [0.44, -0.02], [0.68, -0.22], [0.72, -0.72], [0.60, -1.16], [0.42, -1.30]]),
  '1': cap(0.52, [[0.16, -1.04], [0.42, -1.33], [0.38, -0.02]]),
  '2': cap(0.76, [[0.10, -1.08], [0.34, -1.33], [0.66, -1.18], [0.60, -0.82], [0.08, -0.04], [0.72, -0.09]]),
  '3': cap(0.74, [[0.10, -1.20], [0.40, -1.34], [0.68, -1.14], [0.42, -0.76], [0.72, -0.50], [0.60, -0.08], [0.16, -0.02], [0.06, -0.16]]),
  '4': cap(0.78, [[0.58, -0.02], [0.60, -1.34], [0.06, -0.44], [0.76, -0.40]]),
  // Two strokes, pen lifted at the corner (S10): as one polyline the
  // short left stem melted into the bowl at chrome sizes and the tag's
  // "1995" read "1993". Identity on the longest marks (the S9 D lesson):
  // a long flat bar + stem, then the bowl, with a hard break between.
  '5': cap(0.74,
    [[0.72, -1.34], [0.20, -1.30], [0.14, -0.74]],
    [[0.10, -0.80], [0.52, -0.84], [0.74, -0.54], [0.64, -0.08], [0.20, 0.00], [0.06, -0.16]]),
  '6': cap(0.76, [[0.66, -1.28], [0.30, -1.06], [0.10, -0.60], [0.16, -0.14], [0.46, -0.02], [0.68, -0.24], [0.60, -0.60], [0.20, -0.56]]),
  '7': cap(0.72, [[0.06, -1.30], [0.74, -1.34], [0.32, -0.02]]),
  '8': cap(0.78, [[0.40, -0.68], [0.16, -0.90], [0.40, -1.32], [0.66, -0.96], [0.42, -0.68], [0.12, -0.42], [0.40, -0.02], [0.70, -0.36], [0.40, -0.68]]),
  '9': cap(0.76, [[0.70, -0.86], [0.42, -0.68], [0.16, -0.92], [0.40, -1.32], [0.68, -1.10], [0.66, -0.50], [0.50, -0.02]]),
};

const PUNCT: Record<string, Glyph> = {
  '.': g(0.30, [[0.13, -0.05], [0.20, 0.02]]),
  ',': g(0.30, [[0.18, -0.04], [0.14, 0.12], [0.03, 0.26]]),
  "'": g(0.24, [[0.17, -1.34], [0.10, -1.02]]),
  '’': g(0.24, [[0.17, -1.34], [0.10, -1.02]]),
  '—': g(1.05, [[0.04, -0.50], [0.98, -0.55]]),
  '-': g(0.56, [[0.05, -0.50], [0.50, -0.53]]),
  '!': g(0.36, [[0.20, -1.35], [0.16, -0.30]], [[0.15, -0.06], [0.21, 0.01]]),
  '?': g(0.62,
    [[0.08, -1.16], [0.30, -1.40], [0.56, -1.24], [0.50, -0.92], [0.28, -0.72], [0.27, -0.34]],
    [[0.25, -0.06], [0.31, 0.01]]),
  ':': g(0.30, [[0.14, -0.62], [0.20, -0.56]], [[0.13, -0.06], [0.19, 0.01]]),
  ';': g(0.30, [[0.14, -0.62], [0.20, -0.56]], [[0.18, -0.04], [0.13, 0.14]]),
  '(': g(0.38, [[0.30, -1.42], [0.10, -0.72], [0.30, 0.04]]),
  ')': g(0.38, [[0.10, -1.42], [0.30, -0.72], [0.10, 0.04]]),
  '¼': g(0.70, [[0.06, -0.90], [0.60, -0.06]], [[0.16, -1.10], [0.14, -0.66]], [[0.44, -0.42], [0.60, -0.44], [0.60, -0.02]]),
  '×': g(0.68, [[0.10, -0.84], [0.60, -0.24]], [[0.60, -0.84], [0.10, -0.24]]),
  '$': g(0.72, [[0.62, -1.10], [0.38, -1.26], [0.16, -1.10], [0.24, -0.82], [0.54, -0.66], [0.60, -0.34], [0.34, -0.14], [0.10, -0.30]], [[0.40, -1.36], [0.36, 0.06]]),
  '/': g(0.62, [[0.62, -1.35], [0.08, 0.04]]),
  '"': g(0.46, [[0.30, -1.34], [0.24, -1.02]], [[0.50, -1.34], [0.44, -1.02]]),
  '“': g(0.46, [[0.30, -1.34], [0.24, -1.02]], [[0.50, -1.34], [0.44, -1.02]]),
  '”': g(0.46, [[0.26, -1.02], [0.32, -1.34]], [[0.46, -1.02], [0.52, -1.34]]),
  '·': g(0.32, [[0.14, -0.52], [0.20, -0.46]]),
  '…': g(0.92,
    [[0.10, -0.05], [0.17, 0.02]], [[0.42, -0.05], [0.49, 0.02]], [[0.74, -0.05], [0.81, 0.02]]),
  '–': g(0.72, [[0.05, -0.50], [0.66, -0.53]]),
  '+': g(0.68, [[0.10, -0.54], [0.60, -0.56]], [[0.35, -0.82], [0.34, -0.26]]),
  '♡': g(0.84, [[0.40, 0.04], [0.06, -0.48], [0.14, -0.82], [0.40, -0.70], [0.66, -0.84], [0.76, -0.50], [0.40, 0.04]]),
};

function glyphFor(ch: string): Glyph | null {
  if (LOWER[ch]) return LOWER[ch];
  if (UPPER[ch]) return UPPER[ch];
  if (DIGIT[ch]) return DIGIT[ch];
  if (PUNCT[ch]) return PUNCT[ch];
  // a capital with no bespoke skeleton: its lowercase, written tall
  const lower = LOWER[ch.toLowerCase()];
  if (lower && ch !== ch.toLowerCase()) {
    return { s: lower.s.map((p) => p.map(([x, y]) => [x * 1.32, y * 1.38] as [number, number])),
      adv: lower.adv * 1.32, cap: true };
  }
  return null;
}

/* ------------------------------ hands ------------------------------ */

export type Hand = {
  /** Shear, x per unit of height above baseline. Positive leans right. */
  slant: number;
  /** Baseline wobble, as a fraction of x-height. */
  bounce: number;
  /** Per-glyph advance variance (0 = a typewriter). */
  advanceVar: number;
  /** Nib width as a fraction of x-height. */
  weight: number;
  /** Stroke wobble as a fraction of x-height. */
  jitter: number;
  /** 0 = counters closed, 1 = bowls left hanging open. */
  counters: number;
  /** Chance a glyph joins to the next at the baseline. */
  ligProb: number;
  /** Multiplier on everything above the x-height and below the baseline. */
  ascExuberance: number;
  /**
   * His tic: every long vertical gets drawn again, faintly, on top. Nobody
   * notices it until they are told, and then they cannot stop seeing it.
   */
  checkPasses: number;
  /** Per-glyph size variance. */
  sizeVar: number;
  /**
   * The heel-drag of a left hand crossing its own wet ink. Real Bea only.
   * A forgery is a hand that got everything except this.
   */
  smudge: boolean;
};

/** 1999. Draftsman's print, ruled twice, leaning very slightly back. */
export const NATE_HAND: Hand = {
  slant: -0.035, bounce: 0.012, advanceVar: 0.05, weight: 0.072, jitter: 0.030,
  counters: 0.05, ligProb: 0.02, ascExuberance: 1.0, checkPasses: 1,
  sizeVar: 0.02, smudge: false,
};

/**
 * 1996, as forged in 1999. Everything of hers that can be practised:
 * the slant, the bounce, the loose advance, the open counters, the
 * exuberant ascenders. And a clean heel, thirty times.
 */
export const BEA_HAND: Hand = {
  slant: 0.244, bounce: 0.062, advanceVar: 0.22, weight: 0.084, jitter: 0.050,
  counters: 0.55, ligProb: 0.35, ascExuberance: 1.24, checkPasses: 0,
  sizeVar: 0.06, smudge: false,
};

/** The same hand, actually hers. One field apart. That is the whole game. */
export const BEA_REAL: Hand = { ...BEA_HAND, smudge: true };

/** A grown-up in a hurry with a ballpoint. Dinner. Now. Both of you. */
export const MOM_HAND: Hand = {
  slant: 0.31, bounce: 0.09, advanceVar: 0.3, weight: 0.062, jitter: 0.062,
  counters: 0.8, ligProb: 0.55, ascExuberance: 0.85, checkPasses: 0,
  sizeVar: 0.09, smudge: false,
};

/** Fourteen, round, careful about being liked. */
export const KID_HAND: Hand = {
  slant: 0.05, bounce: 0.05, advanceVar: 0.14, weight: 0.098, jitter: 0.038,
  counters: 0.12, ligProb: 0.05, ascExuberance: 0.92, checkPasses: 0,
  sizeVar: 0.05, smudge: false,
};

/** Him, twenty-five years later: the same hand, softer, in pencil. */
export const NATE_ADULT: Hand = {
  slant: 0.02, bounce: 0.028, advanceVar: 0.1, weight: 0.056, jitter: 0.044,
  counters: 0.28, ligProb: 0.12, ascExuberance: 1.05, checkPasses: 0,
  sizeVar: 0.035, smudge: false,
};

/** The morph. Chapter 6 walks this parameter from 0 to 1 over 30 rows. */
export function lerpHand(a: Hand, b: Hand, t: number): Hand {
  const k = Math.max(0, Math.min(1, t));
  const m = (x: number, y: number) => x + (y - x) * k;
  return {
    slant: m(a.slant, b.slant),
    bounce: m(a.bounce, b.bounce),
    advanceVar: m(a.advanceVar, b.advanceVar),
    weight: m(a.weight, b.weight),
    jitter: m(a.jitter, b.jitter),
    counters: m(a.counters, b.counters),
    ligProb: m(a.ligProb, b.ligProb),
    ascExuberance: m(a.ascExuberance, b.ascExuberance),
    checkPasses: k < 0.5 ? a.checkPasses : b.checkPasses,
    sizeVar: m(a.sizeVar, b.sizeVar),
    smudge: k < 0.5 ? a.smudge : b.smudge,
  };
}

/* ----------------------------- writing ----------------------------- */

export type WriteOpts = {
  color?: string;
  alpha?: number;
  /** Multiplies the hand's nib width (pencil under-layers run thinner). */
  weightScale?: number;
  align?: 'left' | 'center';
  /** Force the x-height instead of deriving it from the rect. */
  xHeight?: number;
  /** Extra tracking multiplier. */
  tracking?: number;
  /** Draw as a planning under-layer: looser, offset, unconfident. */
  ghost?: boolean;
  /** Override the hand's smudge decision (journal redraws want control). */
  smudge?: boolean;
  /** Vertical squash, for canvases whose texel aspect isn't square. */
  yScale?: number;
  /** Stroke passes (2 = ballpoint double-track; order maps need 1). */
  passes?: number;
};

/** Total advance of a line, in x-heights, before any fitting. */
export function measureLine(text: string, hand: Hand, tracking = 1): number {
  let w = 0;
  for (const ch of text) {
    if (ch === ' ') { w += 0.4 * tracking; continue; }
    const gl = glyphFor(ch);
    if (!gl) { w += 0.4 * tracking; continue; }
    w += gl.adv + 0.09 * tracking;
  }
  return w;
}

export type WriteResult = { xHeight: number; baseline: number; width: number; endX: number };

/**
 * Write one line of somebody's handwriting into `rect`, fitting it if it
 * would overflow. Returns the metrics so an under-layer can be drawn to
 * the same measure (the pencil beneath has to land under the ink, not
 * beside it).
 */
export function writeLine(
  ctx: Ctx2D,
  text: string,
  rect: { x: number; y: number; w: number; h: number },
  hand: Hand,
  r: () => number,
  o: WriteOpts = {}
): WriteResult {
  const tracking = o.tracking ?? 1;
  const yScale = o.yScale ?? 1;
  const ghost = o.ghost === true;
  // the line box holds ascender (1.45) + descender (0.45) of exuberance
  const boxHeights = 1.45 * hand.ascExuberance + 0.45 * hand.ascExuberance;
  let xh = o.xHeight ?? rect.h / (boxHeights * yScale);
  const advUnits = measureLine(text, hand, tracking);
  if (advUnits * xh > rect.w) xh = rect.w / advUnits;

  const baseline = rect.y + 1.45 * hand.ascExuberance * xh * yScale;
  const total = advUnits * xh;
  let cx = rect.x + (o.align === 'center' ? Math.max(0, (rect.w - total) / 2) : 0);
  const startX = cx;

  const width = Math.max(1, hand.weight * xh * (o.weightScale ?? 1));
  const jitter = hand.jitter * xh;
  const smudge = o.smudge ?? hand.smudge;
  const base = {
    color: o.color,
    width,
    jitter,
    alpha: o.alpha ?? 0.92,
    passes: o.passes ?? 2,
    smudge,
  };

  let prevEnd: [number, number] | null = null;

  for (const ch of text) {
    if (ch === ' ') {
      cx += 0.4 * xh * tracking;
      prevEnd = null;
      continue;
    }
    const gl = glyphFor(ch);
    if (!gl) { cx += 0.4 * xh * tracking; prevEnd = null; continue; }

    const size = xh * (1 + (r() - 0.5) * 2 * hand.sizeVar);
    const bob = (r() - 0.5) * 2 * hand.bounce * xh;
    // the pencil plan sits a hair off from the ink that followed it
    const ox = ghost ? (r() - 0.5) * 0.09 * xh : 0;
    const oy = ghost ? (r() - 0.5) * 0.07 * xh : 0;

    const map = ([gx, gy]: [number, number]): [number, number] => {
      const ey = gy < -1 || gy > 0 ? gy * hand.ascExuberance : gy;
      const py = ey * size * yScale;
      return [cx + gx * size - py * hand.slant + ox, baseline + bob + py + oy];
    };

    let firstPt: [number, number] | null = null;
    let lastPt: [number, number] | null = null;

    const isDigit = ch >= '0' && ch <= '9';
    for (const poly of gl.s) {
      let pts = poly.map(map);
      // open counters: a loose hand does not close its bowls — but a
      // figure keeps its identity: trimming a 5's or 9's closing stroke
      // turns it into a different number (S9, letterform integrity)
      if (!isDigit && hand.counters > 0.02 && pts.length > 4) {
        const cut = Math.round(pts.length * 0.09 * hand.counters);
        if (cut > 0) pts = pts.slice(0, pts.length - cut);
      }
      if (pts.length < 2) continue;
      stroke(ctx, pts, r, base);
      // his tic: the vertical, checked
      const dy = Math.abs(pts[pts.length - 1][1] - pts[0][1]);
      const dx = Math.abs(pts[pts.length - 1][0] - pts[0][0]);
      if (hand.checkPasses > 0 && dy > size * 0.55 && dy > dx * 1.6) {
        for (let p = 0; p < hand.checkPasses; p++) {
          stroke(ctx, pts.map(([x, y]) => [x + width * 0.42, y] as [number, number]), r,
            { ...base, alpha: (o.alpha ?? 0.92) * 0.3, passes: 1, smudge: false });
        }
      }
      if (!firstPt) firstPt = pts[0];
      lastPt = pts[pts.length - 1];
    }

    // ligature: the pen never left the page
    if (prevEnd && firstPt && r() < hand.ligProb) {
      const mid: [number, number] = [
        (prevEnd[0] + firstPt[0]) / 2,
        Math.max(prevEnd[1], firstPt[1]) + size * 0.12,
      ];
      stroke(ctx, [prevEnd, mid, firstPt], r,
        { ...base, alpha: (o.alpha ?? 0.92) * 0.7, passes: 1 });
    }
    prevEnd = lastPt;

    cx += (gl.adv * size) + 0.09 * xh * tracking
      + (r() - 0.5) * hand.advanceVar * 0.34 * xh;
  }

  return { xHeight: xh, baseline, width: total, endX: cx - startX };
}

/**
 * The ruling underneath: baseline, x-height, and the slant ticks a
 * careful person draws before writing in somebody else's hand. Drawn in
 * whatever color the caller is using for graphite.
 */
export function writeGuides(
  ctx: Ctx2D,
  rect: { x: number; y: number; w: number; h: number },
  m: { xHeight: number; baseline: number; width: number },
  hand: Hand,
  r: () => number,
  o: { color?: string; alpha?: number; slantTicks?: number; yScale?: number } = {}
) {
  const { color = '#ffffff', alpha = 0.5, slantTicks = 7 } = o;
  const yScale = o.yScale ?? 1;
  const w = Math.max(0.8, m.xHeight * 0.032);
  const opt = { color, width: w, jitter: m.xHeight * 0.012, alpha, passes: 1, smudge: false as const };
  const right = rect.x + Math.min(rect.w, m.width + m.xHeight * 0.4);
  // baseline, then x-height, then the ascender line — ruled, not felt
  for (const [y, a] of [
    [m.baseline, alpha],
    [m.baseline - m.xHeight * yScale, alpha * 0.8],
    [m.baseline - 1.42 * m.xHeight * yScale, alpha * 0.45],
  ] as const) {
    stroke(ctx, [[rect.x - m.xHeight * 0.2, y], [right, y]], r, { ...opt, alpha: a });
  }
  // the slant ticks: he measured her lean before he practised it
  const span = right - rect.x;
  for (let i = 0; i < slantTicks; i++) {
    const x = rect.x + (span * (i + 0.5)) / slantTicks;
    const top = m.baseline - 1.42 * m.xHeight * yScale;
    stroke(ctx, [[x + 1.42 * m.xHeight * yScale * hand.slant, top], [x, m.baseline]], r,
      { ...opt, alpha: alpha * 0.35 });
  }
  void rect;
}
