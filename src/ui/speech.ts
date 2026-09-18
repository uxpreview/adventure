import * as THREE from 'three';
import { rng, stroke } from '../engine/ink';
import { INK } from '../engine/palette';
import { letterCanvas, letterEl, S } from './lettering';
import { toastsLive } from './toast';

/**
 * SPEECH BUBBLES (VOICE). A person says a line and it is written in a
 * hand-drawn bubble over their head, anchored to the world, with a
 * tail pointing at the speaker. One bubble per speaker at a time; a
 * second line queues. The walker can speak too. Every bubble carries
 * its text as the element's aria-label while it is up.
 */

export type Speaker = { name: string; x: number; z: number; y?: number } | 'walker';

type Bubble = {
  key: string;
  who: Speaker;
  text: string;
  hold: number;
  t: number;
  el: HTMLElement;
  h: number;
  w: number;
  then?: () => void;
  out: boolean;
};

type Queued = { who: Speaker; text: string; opts: { hold?: number; then?: () => void } };

const FADE_S = 0.45;
/** Where a head is, over the feet. */
const HEAD = 2.15;
/** How far a spoken line carries. */
const EARSHOT = 42;

let root: HTMLElement | null = null;
let camera: THREE.PerspectiveCamera | null = null;
let groundAt: ((x: number, z: number) => number) | null = null;
let walkerPos: (() => { x: number; y: number; z: number }) | null = null;
const v = new THREE.Vector3();
const live = new Map<string, Bubble>();
const queues = new Map<string, Queued[]>();
let shoutEl: HTMLElement | null = null;
let shoutT = -1;
let shoutHold = 0;
let seq = 0;

const DPR = () => Math.min(2, (typeof devicePixelRatio === 'number' ? devicePixelRatio : 1) || 1);

/** How long a line stays up: a second, plus sixty ms a character. */
export const holdFor = (text: string) => Math.max(2.5, 1 + 0.06 * text.length);

/** Wire the bubbles to the camera and the ground. App calls this once. */
export function installSpeech(o: {
  root: HTMLElement;
  camera: THREE.PerspectiveCamera;
  groundAt: (x: number, z: number) => number;
  walker: () => { x: number; y: number; z: number };
}) {
  camera = o.camera;
  groundAt = o.groundAt;
  walkerPos = o.walker;
  root = document.createElement('div');
  root.className = 'speech-root';
  o.root.appendChild(root);
  shoutEl = document.createElement('div');
  shoutEl.className = 'shout';
  o.root.appendChild(shoutEl);
}

const keyOf = (who: Speaker) => (who === 'walker' ? 'walker' : who.name);

/** Draw the bubble: paper, a wobbly outline, a tail, the words. */
function drawBubble(text: string, name: string | null): { canvas: HTMLCanvasElement; w: number; h: number } {
  const dpr = DPR();
  const tall = window.innerWidth / window.innerHeight < 0.8;
  const px = tall ? 11.5 : 12;
  const maxW = Math.max(140, Math.min(tall ? 230 : 260, window.innerWidth - 48));
  const t = letterCanvas(text, { ...S.voice(px), maxWidth: maxW, color: INK, alpha: 0.9 });
  /* WHO SAID THAT (the owner, 2026-09-18: "I saw a chat bubble in the
   * corner of my screen but wasn't sure where it was coming from"). A
   * person's line has their name written small over it, so a bubble
   * pinned to the edge of the page still says whose it is. */
  const n = name ? letterCanvas(name, { ...S.quiet(8.5), color: INK, alpha: 0.72 }) : null;
  const nw = n ? n.width / dpr : 0;
  const nh = n ? n.height / dpr + 1 : 0;
  const tw = Math.max(t.width / dpr, nw);
  const th = t.height / dpr + nh;
  const pad = 7;
  const tail = 14;
  const w = Math.ceil(tw + pad * 2);
  const h = Math.ceil(th + pad * 2 + tail);
  const c = document.createElement('canvas');
  c.width = Math.ceil(w * dpr);
  c.height = Math.ceil(h * dpr);
  const ctx = c.getContext('2d')!;
  ctx.scale(dpr, dpr);
  seq++;
  const r = rng(3100 + seq * 17);
  const bw = w - 2;
  const bh = h - tail - 2;
  const x0 = 1;
  const y0 = 1;
  const rad = Math.min(10, bh * 0.35);
  // the outline as one wobbly loop, with the tail cut into its bottom edge
  const tx = w * 0.5;
  const pts: [number, number][] = [];
  const arc = (cx: number, cy: number, a0: number, a1: number) => {
    for (let i = 0; i <= 5; i++) {
      const a = a0 + ((a1 - a0) * i) / 5;
      pts.push([cx + Math.cos(a) * rad, cy + Math.sin(a) * rad]);
    }
  };
  pts.push([x0 + rad, y0]);
  pts.push([x0 + bw - rad, y0]);
  arc(x0 + bw - rad, y0 + rad, -Math.PI / 2, 0);
  pts.push([x0 + bw, y0 + bh - rad]);
  arc(x0 + bw - rad, y0 + bh - rad, 0, Math.PI / 2);
  // the tail: down to the tip and back
  pts.push([tx + 9, y0 + bh]);
  pts.push([tx + 1, y0 + bh + tail - 1]);
  pts.push([tx - 5, y0 + bh]);
  pts.push([x0 + rad, y0 + bh]);
  arc(x0 + rad, y0 + bh - rad, Math.PI / 2, Math.PI);
  pts.push([x0, y0 + rad]);
  arc(x0 + rad, y0 + rad, Math.PI, Math.PI * 1.5);
  pts.push([x0 + rad + 2, y0]);
  // paper first, so the words read over whatever is drawn behind
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
  ctx.fillStyle = 'rgba(247, 244, 235, 0.93)';
  ctx.fill();
  stroke(ctx, pts, r, { width: 1.5, alpha: 0.88, jitter: 0.9, passes: 2, color: INK });
  if (n) ctx.drawImage(n, pad, pad - 1, nw, nh - 1);
  ctx.drawImage(t, pad, pad + nh, t.width / dpr, t.height / dpr);
  c.style.width = `${w}px`;
  c.style.height = `${h}px`;
  return { canvas: c, w, h };
}

function open(who: Speaker, text: string, opts: { hold?: number; then?: () => void }) {
  if (!root) return;
  const key = keyOf(who);
  const el = document.createElement('div');
  el.className = 'bubble';
  el.setAttribute('aria-label', text);
  const d = drawBubble(text, who === 'walker' ? null : who.name);
  el.appendChild(d.canvas);
  root.appendChild(el);
  const b: Bubble = { key, who, text, hold: opts.hold ?? holdFor(text), t: 0, el, w: d.w, h: d.h, then: opts.then, out: false };
  live.set(key, b);
  place(b);
  // shown THIS frame, not the next: a line that waits for a frame at
  // four frames a second is a line the harness photographs as blank
  el.classList.add('show');
  // the pen scratches: PEN's sound for a line being written
  try {
    window.dispatchEvent(new CustomEvent('inklands:event', { detail: 'speech' }));
  } catch { /* nothing to hear */ }
}

/**
 * Say a line. One bubble per speaker; a busy speaker queues it. The
 * speaker's x/z are read live every frame, so an object with getters
 * follows its figure.
 */
export function say(who: Speaker, text: string, opts: { hold?: number; then?: () => void; now?: boolean } = {}): boolean {
  const key = keyOf(who);
  /* OUT OF EARSHOT, NOT SAID. A line from somebody a field away used to
   * be pinned to the edge of the page, from nowhere. The caller is told,
   * so the world can say it another way if it matters. */
  if (who !== 'walker' && walkerPos) {
    const p = walkerPos();
    if (Math.hypot(who.x - p.x, who.z - p.z) > EARSHOT) return false;
  }
  /* gate round 5: a line that ANSWERS A PRESS is said now, over whatever
   * the speaker was in the middle of — a queued answer reads as a dead key */
  if (opts.now) hush(who);
  if (live.has(key)) {
    const q = queues.get(key) ?? [];
    q.push({ who, text, opts });
    queues.set(key, q);
    return true;
  }
  open(who, text, opts);
  return true;
}

/** Stop a speaker mid-line and drop what they had queued. */
export function hush(who: Speaker) {
  const key = keyOf(who);
  const b = live.get(key);
  if (b) { b.el.remove(); live.delete(key); }
  queues.delete(key);
}

/** A world line, unattributed, across the top of the page. */
export function shout(text: string) {
  if (!shoutEl) return;
  letterEl(shoutEl, text, { ...S.voice(14), maxWidth: Math.max(200, window.innerWidth - 40), align: 'center', alpha: 0.9 });
  shoutEl.classList.add('show');
  shoutT = 0;
  shoutHold = holdFor(text) + 0.5;
}

/** Whether anybody is mid-line (the harness reads this). */
export function speaking(): string[] {
  return [...live.values()].filter((b) => !b.out).map((b) => `${b.key}: ${b.text}`);
}

function place(b: Bubble) {
  if (!camera) return;
  let x: number;
  let y: number;
  let z: number;
  if (b.who === 'walker') {
    const p = walkerPos ? walkerPos() : { x: 0, y: 0, z: 0 };
    x = p.x;
    y = p.y + HEAD;
    z = p.z;
  } else {
    x = b.who.x;
    z = b.who.z;
    y = (groundAt ? groundAt(x, z) : 0) + (b.who.y ?? HEAD);
  }
  v.set(x, y, z).project(camera);
  const behind = v.z > 1;
  let sx = (v.x * 0.5 + 0.5) * window.innerWidth;
  let sy = (-v.y * 0.5 + 0.5) * window.innerHeight;
  if (behind) {
    /* a speaker behind the lens: the line is pinned to the side of the
     * page they are on, beside the walker and never over his head, where
     * the cold player (gate round 2) read Nell's lines as their own. (A
     * point behind the lens projects mirrored, so its side is the other.) */
    sx = v.x < 0 ? window.innerWidth : 0;
    sy = window.innerHeight * 0.42;
  }
  const hw = b.w * 0.5;
  const pad = 8;
  const tall = window.innerWidth / window.innerHeight < 0.8;
  /* ONE VOICE AT A TIME: on a phone the objective line and the answer
   * line are lettered down the top-left, and a bubble clamped to the
   * top used to be written straight over both. It stops under them. */
  const top = tall ? (toastsLive() ? 158 : 108) : 12;
  sx = Math.min(Math.max(sx, hw + pad), window.innerWidth - hw - pad);
  sy = Math.min(Math.max(sy, b.h + top), window.innerHeight - pad);
  b.el.style.left = `${sx}px`;
  b.el.style.top = `${sy}px`;
}

/* ---- SOMEBODY WANTS A WORD ------------------------------------------
 * The mark every game hangs over a head: this person has something to
 * say, and it will wait until you go and ask. It is seen from across a
 * land, and when they are off the page it sits at the edge they are
 * past, so it is also the way to them. */
type Mark = { who: Exclude<Speaker, 'walker'>; el: HTMLElement; w: number; h: number };
const marks = new Map<string, Mark>();

function drawMark(): { canvas: HTMLCanvasElement; w: number; h: number } {
  const dpr = DPR();
  const w = 26;
  const h = 36;
  const c = document.createElement('canvas');
  c.width = Math.ceil(w * dpr);
  c.height = Math.ceil(h * dpr);
  c.style.width = `${w}px`;
  c.style.height = `${h}px`;
  const ctx = c.getContext('2d')!;
  ctx.scale(dpr, dpr);
  const r = rng(3907);
  const pts: [number, number][] = [];
  for (let i = 0; i <= 14; i++) {
    const a = -Math.PI / 2 + (i / 14) * Math.PI * 2;
    pts.push([13 + Math.cos(a) * 11, 13 + Math.sin(a) * 11]);
  }
  // the tail, cut into the bottom of the ring
  pts.splice(8, 0, [16, 23.5], [13, 34], [10.5, 23.8]);
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
  ctx.fillStyle = 'rgba(247, 244, 235, 0.95)';
  ctx.fill();
  stroke(ctx, pts, r, { width: 1.5, alpha: 0.9, jitter: 0.6, passes: 2, color: INK });
  stroke(ctx, [[13, 6], [13.3, 15.5]], r, { width: 2.6, alpha: 0.95, jitter: 0.3, passes: 2, color: INK });
  stroke(ctx, [[12.6, 19.4], [13.6, 20.2]], r, { width: 2.8, alpha: 0.95, jitter: 0.2, passes: 2, color: INK });
  return { canvas: c, w, h };
}

/** Hang the mark over somebody, or take it down. */
export function beckon(who: Speaker, on: boolean) {
  if (!root || who === 'walker') return;
  const have = marks.get(who.name);
  if (!on) { have?.el.remove(); marks.delete(who.name); return; }
  if (have) return;
  const el = document.createElement('div');
  el.className = 'bubble beckon';
  el.setAttribute('aria-label', `${who.name} HAS SOMETHING TO SAY`);
  const d = drawMark();
  el.appendChild(d.canvas);
  root.appendChild(el);
  marks.set(who.name, { who, el, w: d.w, h: d.h });
}

/** Who has the mark over them (the harness reads this). */
export function beckoning(): string[] {
  return [...marks.keys()];
}

function placeMark(m: Mark, quiet: boolean) {
  if (!camera) return;
  // their own line is up, or a conversation has the page: no mark
  const show = !quiet && !live.has(m.who.name);
  m.el.classList.toggle('show', show);
  if (!show) return;
  const x = m.who.x;
  const z = m.who.z;
  const y = (groundAt ? groundAt(x, z) : 0) + (m.who.y ?? HEAD) + 0.45;
  v.set(x, y, z).project(camera);
  let sx = (v.x * 0.5 + 0.5) * window.innerWidth;
  let sy = (-v.y * 0.5 + 0.5) * window.innerHeight;
  if (v.z > 1) { sx = v.x < 0 ? window.innerWidth : 0; sy = window.innerHeight * 0.42; }
  const pad = 10;
  const tall = window.innerWidth / window.innerHeight < 0.8;
  sx = Math.min(Math.max(sx, m.w * 0.5 + pad), window.innerWidth - m.w * 0.5 - pad);
  sy = Math.min(Math.max(sy, m.h + (tall ? 108 : 46)), window.innerHeight - 120);
  m.el.style.left = `${sx}px`;
  m.el.style.top = `${sy}px`;
}

/** Whether somebody is in the frame, so a line is only said where it is seen. */
export function inFrame(who: { x: number; z: number; y?: number }): boolean {
  if (!camera) return false;
  v.set(who.x, (groundAt ? groundAt(who.x, who.z) : 0) + (who.y ?? HEAD), who.z).project(camera);
  return v.z < 1 && Math.abs(v.x) < 0.92 && Math.abs(v.y) < 0.92;
}

/** Every bubble on the page, so a place's name is not written under one. */
export function speechEls(): HTMLElement[] {
  const out: HTMLElement[] = [];
  for (const b of live.values()) if (!b.out) out.push(b.el);
  return out;
}

/** Once a frame: follow speakers, time the holds, run the queues. */
export function tickSpeech(dt: number, quiet = false) {
  for (const m of marks.values()) placeMark(m, quiet);
  for (const [key, b] of live) {
    b.t += dt;
    place(b);
    if (!b.out && b.t > b.hold) {
      b.out = true;
      b.el.classList.remove('show');
      b.then?.();
    }
    if (b.out && b.t > b.hold + FADE_S) {
      b.el.remove();
      live.delete(key);
      const q = queues.get(key);
      const next = q?.shift();
      if (next) open(next.who, next.text, next.opts);
    }
  }
  if (shoutT >= 0 && shoutEl) {
    shoutT += dt;
    if (shoutT > shoutHold) {
      shoutEl.classList.remove('show');
      shoutT = -1;
    }
  }
}

/** Sweep every bubble (the harness's broom). */
export function clearSpeech() {
  for (const b of live.values()) b.el.remove();
  live.clear();
  queues.clear();
  for (const m of marks.values()) m.el.remove();
  marks.clear();
  shoutEl?.classList.remove('show');
  shoutT = -1;
}
