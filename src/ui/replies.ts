import { letterEl, S } from './lettering';
import { Input } from '../core/Input';

/**
 * WHAT YOU SAY BACK (the three verbs). Somebody says a line that can be
 * answered, and two or three answers are lettered along the bottom of
 * the page: 1, 2, 3 on the keys, or a thumb. Nothing stops: the walker
 * keeps walking, the horse keeps going, and an answer nobody gives
 * expires into whatever the person would have done anyway. Every
 * answer carries its text as `aria-label`.
 */

export type Reply = { label: string; pick: () => void };

let root: HTMLElement | null = null;
let strip: HTMLElement | null = null;
let current: Reply[] = [];
let ttl = 0;
let onExpire: (() => void) | null = null;
let blocked: () => boolean = () => false;

export function installReplies(o: { root: HTMLElement; blocked: () => boolean }) {
  root = o.root;
  blocked = o.blocked;
  strip = document.createElement('div');
  strip.className = 'replies';
  root.appendChild(strip);
  window.addEventListener('keydown', (e) => {
    if (!current.length || e.repeat || Input.typing(e) || blocked()) return;
    const n = ['Digit1', 'Digit2', 'Digit3'].indexOf(e.code);
    if (n >= 0 && n < current.length) choose(n);
  });
}

function choose(i: number) {
  const r = current[i];
  if (!r) return;
  closeReplies();
  r.pick();
}

/** Put answers on the page for `seconds`; unanswered, `expire` runs. */
export function openReplies(replies: Reply[], seconds = 10, expire?: () => void) {
  if (!strip) return;
  closeReplies();
  current = replies.slice(0, 3);
  ttl = seconds;
  onExpire = expire ?? null;
  const tall = window.innerWidth / window.innerHeight < 0.8;
  const maxW = Math.max(150, Math.min(300, window.innerWidth - 56));
  current.forEach((r, i) => {
    const b = document.createElement('button');
    b.className = 'reply-btn';
    letterEl(b, `${i + 1} · ${r.label}`, { ...S.button(tall ? 12 : 13), maxWidth: maxW });
    b.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); choose(i); });
    strip!.appendChild(b);
  });
  strip.classList.add('show');
}

export function closeReplies() {
  if (!strip) return;
  current = [];
  onExpire = null;
  strip.classList.remove('show');
  strip.textContent = '';
}

export function repliesOpen(): string[] {
  return current.map((r) => r.label);
}

/** For the harness: answer as a thumb would. */
export function pickReply(i: number) {
  choose(i);
}

export function tickReplies(dt: number) {
  if (!current.length) return;
  ttl -= dt;
  if (ttl > 0) return;
  const fn = onExpire;
  closeReplies();
  fn?.();
}
