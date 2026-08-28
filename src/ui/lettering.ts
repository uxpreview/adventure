import { writeLine, measureLine, NATE_ADULT, type Hand } from '../engine/script';
import { rng, legibleCaps } from '../engine/ink';
import { INK, PENCIL } from '../engine/palette';

/**
 * The chrome, written by the same pen as everything else (art Fix 5,
 * round 2, verbatim): "every word the player reads is written on the
 * page by the same stroke library, in a hand, at an angle, receiving
 * the same paper and the same camera." This module is how the DOM
 * complies: any element's text is re-rendered through the handwriting
 * synthesizer onto a transparent canvas, which multiplies over the
 * rendered page beneath it so the strokes receive the paper's grain
 * and light. The system serif dies here.
 *
 * The book's own hand is NATE_ADULT — him at forty, softer, in pencil
 * or in ink depending on what the line is. Nothing in this file may
 * REWORD a string: re-lettering is presentation; wording is prose.
 */

export type LetterStyle = {
  hand?: Hand;
  color?: string;
  alpha?: number;
  /** x-height in CSS pixels. */
  px?: number;
  /** Wrap width in CSS pixels (unset = single line, no wrap). */
  maxWidth?: number;
  align?: 'left' | 'center';
  tracking?: number;
  weightScale?: number;
  /** Leading, in multiples of the x-height. */
  leading?: number;
  seed?: number;
};

const DPR = () => Math.min(2, (typeof devicePixelRatio === 'number' ? devicePixelRatio : 1) || 1);

/** The line box a hand needs, in x-heights (ascender + descender). */
const boxOf = (hand: Hand) => (1.45 + 0.45) * hand.ascExuberance;

/** Word-wrap `text` to `maxUnits` advance-units of `hand`. */
function wrapLines(text: string, hand: Hand, maxUnits: number, tracking: number): string[] {
  const out: string[] = [];
  for (const raw of text.split('\n')) {
    if (!raw.trim()) {
      out.push('');
      continue;
    }
    const words = raw.split(' ');
    let cur = '';
    for (const w of words) {
      const trial = cur ? cur + ' ' + w : w;
      if (cur && measureLine(trial, hand, tracking) > maxUnits) {
        out.push(cur);
        cur = w;
      } else {
        cur = trial;
      }
    }
    if (cur) out.push(cur);
  }
  return out.length ? out : [''];
}

/**
 * Render one run of handwriting to a canvas sized for the text.
 * Returns the canvas with CSS size set (device pixels inside).
 */
export function letterCanvas(text: string, style: LetterStyle = {}): HTMLCanvasElement {
  const hand = style.hand ?? NATE_ADULT;
  const px = style.px ?? 16;
  const tracking = style.tracking ?? 1;
  const leading = style.leading ?? 2.35;
  const dpr = DPR();
  const xh = px * dpr;

  const maxUnits = style.maxWidth ? style.maxWidth / px : Infinity;
  const lines = style.maxWidth
    ? wrapLines(text, hand, maxUnits, tracking)
    : text.split('\n');

  const widest = Math.max(0.001, ...lines.map((ln) => measureLine(ln, hand, tracking)));
  const padX = xh * 0.55;
  const padY = xh * 0.35;
  const box = boxOf(hand);
  const w = Math.ceil(widest * xh + padX * 2);
  const h = Math.ceil(padY * 2 + box * xh + (lines.length - 1) * leading * xh);

  const canvas = document.createElement('canvas');
  canvas.width = Math.max(2, w);
  canvas.height = Math.max(2, h);
  const ctx = canvas.getContext('2d')!;

  // one deterministic wobble per string, so re-renders don't shimmer
  let seed = style.seed ?? 4211;
  for (let i = 0; i < text.length; i++) seed = (seed * 31 + text.charCodeAt(i)) >>> 0;

  lines.forEach((ln, i) => {
    if (!ln) return;
    const lw = measureLine(ln, hand, tracking) * xh;
    const x = style.align === 'center' ? (w - lw) / 2 : padX;
    writeLine(
      ctx, ln,
      { x, y: padY + i * leading * xh, w: lw + xh, h: box * xh },
      hand, rng(seed + i * 977),
      {
        color: style.color ?? INK,
        alpha: style.alpha ?? 0.88,
        xHeight: xh,
        tracking,
        weightScale: style.weightScale ?? 1,
        smudge: false,
      }
    );
  });

  canvas.style.width = `${w / dpr}px`;
  canvas.style.height = `${h / dpr}px`;
  canvas.style.display = 'block';
  return canvas;
}

/**
 * Replace an element's text with its hand-lettered rendering. The text
 * itself stays on the element as its aria-label, so the words are
 * still the words — only the letterforms changed hands. Caches by
 * content so hot paths (counts, the loader's percent) can call freely.
 */
export function letterEl(el: HTMLElement, text: string, style: LetterStyle = {}) {
  const key = `${text}|${style.px}|${style.color}|${style.hand === undefined ? 'book' : 'x'}|${style.alpha}`;
  if ((el as HTMLElement & { __letterKey?: string }).__letterKey === key) return;
  (el as HTMLElement & { __letterKey?: string }).__letterKey = key;
  el.textContent = '';
  el.setAttribute('aria-label', text);
  el.classList.add('lettered');
  if (text.trim()) el.appendChild(letterCanvas(text, style));
}

/**
 * A DOCUMENT — the clipping, the receipt. Typeset in-fiction, so it is
 * rendered with the same 16-segment machine the world's clipping uses
 * (`legibleCaps`), never a font. Monospaced enough that the receipt's
 * dot-leader columns still land.
 */
export function letterDocCanvas(text: string, pxSize = 8, opts: { color?: string; alpha?: number } = {}): HTMLCanvasElement {
  const dpr = DPR();
  const size = pxSize * dpr;
  const cellW = size * 0.62 + size * 0.24; // legibleCaps advance
  const leading = size * 1.9;
  const lines = text.split('\n');
  const cols = Math.max(...lines.map((l) => l.length), 1);
  const padX = size * 0.9;
  const padY = size * 1.1;
  const w = Math.ceil(cols * cellW + padX * 2);
  const h = Math.ceil(lines.length * leading + padY * 2);
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(2, w);
  canvas.height = Math.max(2, h);
  const ctx = canvas.getContext('2d')!;
  let seed = 8901;
  for (let i = 0; i < text.length; i++) seed = (seed * 31 + text.charCodeAt(i)) >>> 0;
  lines.forEach((ln, i) => {
    if (!ln.trim()) return;
    legibleCaps(ctx, ln, padX, padY + i * leading, size, rng(seed + i * 613), {
      color: opts.color ?? INK, alpha: opts.alpha ?? 0.86,
    });
  });
  canvas.style.width = `${w / dpr}px`;
  canvas.style.height = `${h / dpr}px`;
  canvas.style.display = 'block';
  return canvas;
}

/**
 * A PAGE for a full-screen panel (round 6 sanding: "the journal is the
 * last screen shaped like a website"). Grain, a ruled left margin, a
 * few binding holes — drawn once at runtime, applied as a background.
 * No image assets; the paper is made of strokes like everything else.
 */
export function panelPageURL(seed = 5150): string {
  const w = 640;
  const h = 900;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  const r = rng(seed);
  ctx.fillStyle = '#f6f3ea';
  ctx.fillRect(0, 0, w, h);
  // grain: short pale fibres, denser toward the edges
  for (let i = 0; i < 900; i++) {
    const x = r() * w;
    const y = r() * h;
    const len = 3 + r() * 14;
    const ang = r() * Math.PI;
    const edge = Math.min(x, w - x, y, h - y) / 160;
    const a = 0.025 + r() * 0.05 + Math.max(0, 0.045 - edge * 0.03);
    ctx.strokeStyle = r() < 0.5 ? `rgba(120,112,96,${a.toFixed(3)})` : `rgba(255,255,252,${(a * 1.4).toFixed(3)})`;
    ctx.lineWidth = 0.8 + r() * 1.2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len);
    ctx.stroke();
  }
  // the ruled margin, drawn by a hand with a straightedge
  ctx.strokeStyle = 'rgba(178,110,104,0.4)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  const mx = w * 0.12;
  ctx.moveTo(mx + (r() - 0.5) * 3, 8);
  ctx.lineTo(mx + (r() - 0.5) * 5, h - 8);
  ctx.stroke();
  // binding holes down the margin, each with a shadowed rim
  for (const y of [h * 0.18, h * 0.5, h * 0.82]) {
    ctx.beginPath();
    ctx.arc(mx * 0.45, y + (r() - 0.5) * 8, 7 + r() * 2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(120,112,96,0.16)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(90,86,74,0.3)';
    ctx.lineWidth = 1.4;
    ctx.stroke();
  }
  return canvas.toDataURL('image/png');
}

/* ---------------- the house styles, so call sites stay terse -------- */

/** Ink dark enough for the juror's 4.5:1 floor against the cream. */
export const S = {
  /** Display caps — title, panel headers, chapter names. */
  display: (px: number): LetterStyle => ({ px, alpha: 0.9, align: 'center' }),
  /** A button's line. */
  button: (px = 11): LetterStyle => ({ px, alpha: 0.86 }),
  /** The quiet chrome: HUD words, counts, tags. */
  quiet: (px = 9.5): LetterStyle => ({ px, alpha: 0.82 }),
  /** A spoken line in the corner — hints, tutorials. */
  voice: (px = 12): LetterStyle => ({ px, alpha: 0.85 }),
  /** Pencil marks in the gutter. Graphite, thinner. */
  pencil: (px = 10): LetterStyle => ({
    px, color: PENCIL, alpha: 0.95, weightScale: 0.85,
  }),
};
