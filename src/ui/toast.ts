import { rng, stroke, line } from '../engine/ink';
import { INK } from '../engine/palette';
import { letterCanvas, S } from './lettering';

/**
 * THE ANSWER LINE (VOICE). Every action gets an answer on screen: one
 * lettered line with a small ink glyph, bottom-centre on a wide screen
 * and top-left under the objective line on a phone.
 *
 * ONE LINE AT A TIME (the owner, 2026-09-17: "in the first 10 seconds a
 * ton of things pop up and it makes it really hard to understand what
 * to do"). Three used to stack, and a job's start was three of them at
 * once over a speech bubble. Now one line is up; the next waits its
 * turn, a repeat of a line already up or waiting is dropped, and the
 * whole line holds its tongue while a card has the page (`holdToasts`).
 * The first line still appears on the frame that asked for it.
 */

export type ToastKind = 'learned' | 'found' | 'job' | 'done' | 'score' | 'plain' | 'place';

const HOLD_S = 2.8;
/** With others waiting a line gives way sooner. */
const HOLD_BUSY_S = 1.9;
const MAX_WAITING = 4;

type Live = { el: HTMLElement; t: number; text: string };

let root: HTMLElement | null = null;
let live: Live[] = [];
let waiting: { text: string; kind: ToastKind }[] = [];
let held = false;
let seq = 0;

/** Whether a line is on the page (a bubble on a phone keeps clear of it). */
export function toastsLive() {
  return live.length > 0 && !held;
}

/** A card has the page: the line is hidden and its clock stops. */
export function holdToasts(on: boolean) {
  if (on === held) return;
  held = on;
  ensureRoot().classList.toggle('held', on);
}

const DPR = () => Math.min(2, (typeof devicePixelRatio === 'number' ? devicePixelRatio : 1) || 1);

/** A glyph for a kind, drawn by the pen into a square of `size` CSS px. */
export function glyph(kind: ToastKind, size: number): HTMLCanvasElement | null {
  if (kind === 'plain') return null;
  const dpr = DPR();
  const s = size * dpr;
  const c = document.createElement('canvas');
  c.width = c.height = Math.ceil(s);
  const ctx = c.getContext('2d')!;
  const r = rng(700 + seq);
  const o = { width: 1.5 * dpr, alpha: 0.9, jitter: 0.8 * dpr, passes: 1 as const };
  const u = (k: number) => k * s;
  switch (kind) {
    case 'done': // a tick
      stroke(ctx, [[u(0.18), u(0.55)], [u(0.4), u(0.8)], [u(0.86), u(0.22)]], r, { ...o, width: 1.9 * dpr });
      break;
    case 'found': { // a star, five points, in one stroke
      const pts: [number, number][] = [];
      for (let i = 0; i <= 5; i++) {
        const a = -Math.PI / 2 + (i * 4 * Math.PI) / 5;
        pts.push([u(0.5) + Math.cos(a) * u(0.4), u(0.52) + Math.sin(a) * u(0.4)]);
      }
      stroke(ctx, pts, r, o);
      break;
    }
    case 'place': // a pin: a loop on a stem
    case 'job': {
      const pts: [number, number][] = [];
      for (let i = 0; i <= 12; i++) {
        const a = -Math.PI / 2 + (i / 12) * Math.PI * 2;
        pts.push([u(0.5) + Math.cos(a) * u(0.22), u(0.34) + Math.sin(a) * u(0.22)]);
      }
      stroke(ctx, pts, r, o);
      line(ctx, u(0.5), u(0.56), u(0.5), u(0.9), r, o);
      if (kind === 'job') line(ctx, u(0.34), u(0.9), u(0.66), u(0.9), r, o);
      break;
    }
    case 'learned': // an open book
      stroke(ctx, [[u(0.1), u(0.28)], [u(0.3), u(0.22)], [u(0.5), u(0.3)], [u(0.7), u(0.22)], [u(0.9), u(0.28)], [u(0.9), u(0.8)], [u(0.5), u(0.86)], [u(0.1), u(0.8)], [u(0.1), u(0.28)]], r, o);
      line(ctx, u(0.5), u(0.3), u(0.5), u(0.86), r, o);
      break;
    case 'score': // a tally: four strokes and one through
      for (let i = 0; i < 4; i++) line(ctx, u(0.18 + i * 0.16), u(0.2), u(0.2 + i * 0.16), u(0.82), r, o);
      line(ctx, u(0.08), u(0.78), u(0.86), u(0.26), r, o);
      break;
  }
  c.style.width = `${size}px`;
  c.style.height = `${size}px`;
  return c;
}

function ensureRoot(): HTMLElement {
  if (root) return root;
  const app = document.getElementById('app') ?? document.body;
  root = document.createElement('div');
  root.className = 'toasts';
  app.appendChild(root);
  return root;
}

/** The answer line. One at a time; the rest wait their turn. */
export function toast(text: string, kind: ToastKind = 'plain') {
  if (live.some((l) => l.text === text) || waiting.some((w) => w.text === text)) return;
  if (live.length || held) {
    waiting.push({ text, kind });
    // a long queue is old news: the oldest waiting line gives way
    while (waiting.length > MAX_WAITING) waiting.shift();
    return;
  }
  show(text, kind);
}

function show(text: string, kind: ToastKind) {
  const host = ensureRoot();
  seq++;
  const el = document.createElement('div');
  el.className = 'toast';
  el.setAttribute('aria-label', text);
  const tall = window.innerWidth / window.innerHeight < 0.8;
  const px = tall ? 11 : 11.5;
  const g = glyph(kind, px * 1.7);
  if (g) {
    g.className = 'toast-glyph';
    el.appendChild(g);
  }
  const t = letterCanvas(text, { ...S.voice(px), maxWidth: Math.max(160, Math.min(420, window.innerWidth - 60)), color: INK });
  t.className = 'toast-text';
  el.appendChild(t);
  host.appendChild(el);
  // this frame, not the next: the answer is on screen before the
  // frame that asked for it is done
  el.classList.add('show');
  live.push({ el, t: 0, text });
}

function drop(l: Live) {
  l.el.classList.remove('show');
  window.setTimeout(() => l.el.remove(), 450);
}

/** Advance the clock: called once a frame with the game's dt. */
export function tickToasts(dt: number) {
  if (held) return;
  if (live.length) {
    const hold = waiting.length ? HOLD_BUSY_S : HOLD_S;
    const keep: Live[] = [];
    for (const l of live) {
      l.t += dt;
      if (l.t > hold) drop(l);
      else keep.push(l);
    }
    live = keep;
  }
  if (!live.length && waiting.length) {
    const next = waiting.shift()!;
    show(next.text, next.kind);
  }
}

/** Sweep everything (the harness's broom). */
export function clearToasts() {
  for (const l of live) l.el.remove();
  live = [];
  waiting = [];
}
