import { rng, stroke } from '../engine/ink';
import { INK } from '../engine/palette';
import { letterCanvas, S } from './lettering';
import { openReplies, closeReplies, type Reply } from './replies';
import { hush, type Speaker } from './speech';

/**
 * A CONVERSATION (the owner, 2026-09-18: "there's something to be said
 * for the player clicking the dialog to continue, so they have time to
 * fully read what they are saying").
 *
 * Two kinds of talk, the way every game with people in it has them:
 *
 *   a BARK   `say()`: one short line over a head, on a timer. Colour, a
 *            call across a green, RUN. Never the only copy of anything
 *            the player has to know.
 *   a CONVERSATION   this file. The player starts it (TALK TO NELL), the
 *            walker stops, and the lines come one at a time in one place
 *            at the foot of the page, under the speaker's name. Each
 *            waits for a press: E, Space, Enter, a click or a thumb.
 *            Answers, if the last line has any, wait as long as it takes.
 *            Anything that hands over a job, a name or a choice is one
 *            of these.
 *
 * Every line carries its text as the panel's aria-label while it is up.
 */

export type Page = { who: Speaker; text: string };
export type ConverseOpts = {
  /** What can be said back to the last line. No clock on them. */
  replies?: Reply[];
  /** The conversation is over (not run if an answer is picked). */
  then?: () => void;
};

type Talk = { pages: Page[]; i: number; opts: ConverseOpts; shownAt: number; answering: boolean };

/** A press this soon after a line is written is the press that wrote it. */
const GUARD_S = 0.28;

let panel: HTMLElement | null = null;
let walkerName: () => string = () => '';
let current: Talk | null = null;
const queue: { pages: Page[]; opts: ConverseOpts }[] = [];
let clock = 0;
let touch = false;
let seq = 0;

const DPR = () => Math.min(2, (typeof devicePixelRatio === 'number' ? devicePixelRatio : 1) || 1);

export function installConverse(o: { root: HTMLElement; walkerName: () => string; touch: boolean }) {
  walkerName = o.walkerName;
  touch = o.touch;
  panel = document.createElement('div');
  panel.className = 'talk';
  panel.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); advanceConverse(); });
  o.root.appendChild(panel);
}

const nameOf = (who: Speaker) => (who === 'walker' ? (walkerName() || 'YOU').toUpperCase() : who.name);

/** The panel: paper, a wobbly outline, the name on a tab, the words, and
 *  a drawn mark in the corner that says there is more, or that is all. */
function draw(page: Page, last: boolean, answers: boolean): HTMLCanvasElement {
  const dpr = DPR();
  const tall = window.innerWidth / window.innerHeight < 0.8;
  const W = Math.max(220, Math.min(tall ? 360 : 520, window.innerWidth - 28));
  const padX = 16;
  const name = letterCanvas(nameOf(page.who), { ...S.button(tall ? 10.5 : 11.5), color: INK, alpha: 0.9 });
  const words = letterCanvas(page.text, { ...S.voice(tall ? 13 : 14.5), maxWidth: W - padX * 2, color: INK, alpha: 0.92 });
  const hintText = answers ? '' : touch ? 'TAP' : 'E';
  const hint = hintText ? letterCanvas(hintText, { ...S.quiet(11), color: INK, alpha: 0.82 }) : null;
  const nw = name.width / dpr;
  const nh = name.height / dpr;
  const ww = words.width / dpr;
  const wh = words.height / dpr;
  const tabH = nh + 8;
  const H = Math.ceil(tabH + 12 + wh + 26);
  const c = document.createElement('canvas');
  c.width = Math.ceil(W * dpr);
  c.height = Math.ceil(H * dpr);
  c.style.width = `${W}px`;
  c.style.height = `${H}px`;
  const ctx = c.getContext('2d')!;
  ctx.scale(dpr, dpr);
  seq++;
  const r = rng(4700 + seq * 13);
  const x0 = 2;
  const y0 = tabH * 0.5;
  const x1 = W - 2;
  const y1 = H - 2;
  const box: [number, number][] = [[x0 + 8, y0], [x1 - 6, y0 + 1], [x1, y0 + 8], [x1 - 1, y1 - 7], [x1 - 8, y1], [x0 + 7, y1 - 1], [x0, y1 - 8], [x0 + 1, y0 + 7], [x0 + 10, y0]];
  ctx.beginPath();
  ctx.moveTo(box[0][0], box[0][1]);
  for (let i = 1; i < box.length; i++) ctx.lineTo(box[i][0], box[i][1]);
  ctx.closePath();
  ctx.fillStyle = 'rgba(247, 244, 235, 0.96)';
  ctx.fill();
  stroke(ctx, box, r, { width: 1.6, alpha: 0.88, jitter: 0.9, passes: 2, color: INK });
  // the name, on a tab that sits across the top edge
  const tx = padX - 4;
  const tab: [number, number][] = [[tx, 1], [tx + nw + 16, 2], [tx + nw + 17, tabH], [tx + 1, tabH - 1], [tx, 1]];
  ctx.beginPath();
  ctx.moveTo(tab[0][0], tab[0][1]);
  for (let i = 1; i < tab.length; i++) ctx.lineTo(tab[i][0], tab[i][1]);
  ctx.closePath();
  ctx.fillStyle = 'rgb(247, 244, 235)';
  ctx.fill();
  stroke(ctx, tab, r, { width: 1.3, alpha: 0.85, jitter: 0.7, passes: 1, color: INK });
  ctx.drawImage(name, tx + 8, 4, nw, nh);
  ctx.drawImage(words, padX, tabH + 10, ww, wh);
  if (hint) {
    // more to come: a little arrowhead, pointing down. The end: a square.
    const hw = hint.width / dpr;
    const hh = hint.height / dpr;
    const mx = W - padX - 6;
    const my = H - 15;
    ctx.drawImage(hint, mx - 12 - hw, my - hh * 0.5 - 1, hw, hh);
    const mark: [number, number][] = last
      ? [[mx - 4, my - 4], [mx + 4, my - 4], [mx + 4, my + 4], [mx - 4, my + 4], [mx - 4, my - 4]]
      : [[mx - 5, my - 4], [mx + 5, my - 4], [mx, my + 5], [mx - 5, my - 4]];
    stroke(ctx, mark, r, { width: 1.5, alpha: 0.85, jitter: 0.5, passes: 2, color: INK });
  }
  return c;
}

function show() {
  if (!panel || !current) return;
  const t = current;
  const page = t.pages[t.i];
  const last = t.i >= t.pages.length - 1;
  const answers = last && !!t.opts.replies?.length;
  panel.textContent = '';
  panel.appendChild(draw(page, last, answers));
  panel.setAttribute('aria-label', `${nameOf(page.who)}: ${page.text}`);
  panel.classList.add('show');
  panel.classList.toggle('answering', answers);
  t.shownAt = clock;
  t.answering = answers;
  // whoever is talking here is not also talking over their own head
  hush(page.who);
  try { window.dispatchEvent(new CustomEvent('inklands:event', { detail: 'speech' })); } catch { /* nothing to hear */ }
  if (answers) {
    const box = panel.getBoundingClientRect();
    openReplies(t.opts.replies!.map((r) => ({
      label: r.label,
      pick: () => end(r.pick),
    })), Infinity, undefined, window.innerHeight - box.top + 10);
  }
}

function start(pages: Page[], opts: ConverseOpts) {
  current = { pages, i: 0, opts, shownAt: clock, answering: false };
  show();
}

/** Over: by the last press (`then` runs) or by an answer (it runs). */
function end(answer?: () => void) {
  const t = current;
  current = null;
  panel?.classList.remove('show', 'answering');
  if (t?.answering) closeReplies();
  if (answer) answer();
  else t?.opts.then?.();
  // either may have opened the next one itself
  if (!current) {
    const next = queue.shift();
    if (next) start(next.pages, next.opts);
  }
}

/** Open a conversation. One at a time: a second waits for the first. */
export function converse(pages: Page[], opts: ConverseOpts = {}) {
  if (!panel || !pages.length) { opts.then?.(); return; }
  if (current) { queue.push({ pages, opts }); return; }
  start(pages, opts);
}

/** Whether a conversation has the walker's attention (App stops him). */
export function conversing(): boolean {
  return !!current;
}

/** The press. True if a conversation took it. */
export function advanceConverse(): boolean {
  const t = current;
  if (!t) return false;
  if (clock - t.shownAt < GUARD_S) return true;
  if (t.answering) return true; // an answer is the only way on
  if (t.i < t.pages.length - 1) { t.i++; show(); } else end();
  return true;
}

export function tickConverse(dt: number) {
  clock += dt;
}

/** For the harness: what is on the panel. */
export function converseState(): { who: string; text: string; page: number; of: number; answering: boolean } | null {
  const t = current;
  if (!t) return null;
  const p = t.pages[t.i];
  return { who: nameOf(p.who), text: p.text, page: t.i + 1, of: t.pages.length, answering: t.answering };
}

/** Sweep it (the harness's broom, and a fresh page). */
export function clearConverse() {
  queue.length = 0;
  if (current?.answering) closeReplies();
  current = null;
  panel?.classList.remove('show', 'answering');
}
