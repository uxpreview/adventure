import { rng, stroke, line } from '../engine/ink';
import { INK, PENCIL } from '../engine/palette';
import { letterEl, panelPageURL, S } from './lettering';
import { glyph } from './toast';
import { notebook, type Job } from '../world/notebook';
import { npcs, type NpcState } from '../world/npc';
import { UI } from './UI';
/* ---- THINGS: the finale's count and the stamps' impressions ---- */
import { landKept } from '../world/jobs';
import { STAMP_COLLECTION } from '../world/stamps';
import { stampImpression } from '../world/textures-monsters';
/* ---- THE FIRST FIVE MINUTES: the first page ---- */
import { THE_LIST, LIST_HEAD } from '../world/thelist';
import { crossout } from '../world/crossout'; /* THE THREE VERBS */

/**
 * THE NOTEBOOK PAGE (VOICE) — the walker's own book, opened with N or
 * the HUD button: paper, a pencil rule, five tabs. JOBS · HEARD ·
 * PLACES · FOUND · CHOICES. Every line is lettered once and cached by
 * its content; a page re-render only re-parents elements.
 *
 * Also the OBJECTIVE LINE: one persistent lettered line, top-left,
 * with the active job's next step. It flashes when it changes and
 * opens the notebook when clicked.
 */

type Tab = 'THE LIST' | 'JOBS' | 'HEARD' | 'PLACES' | 'FOUND' | 'CHOICES';
const TABS: Tab[] = ['THE LIST', 'JOBS', 'HEARD', 'PLACES', 'FOUND', 'CHOICES'];

const el = (cls: string, parent: HTMLElement, tag = 'div'): HTMLElement => {
  const d = document.createElement(tag);
  d.className = cls;
  parent.appendChild(d);
  return d;
};

/** An ink line struck through a lettered element. `hard` is a line he
 *  crossed out himself: twice, and pressed. */
function strike(host: HTMLElement, hard = false) {
  const c = document.createElement('canvas');
  const w = Math.max(20, host.offsetWidth || 160);
  const h = Math.max(10, host.offsetHeight || 18);
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d')!;
  line(ctx, 2, h * 0.55, w - 4, h * 0.5, rng(41 + w), { width: hard ? 2.2 : 1.6, alpha: hard ? 0.9 : 0.7, jitter: 1.2, passes: 1 });
  if (hard) line(ctx, 3, h * 0.42, w - 6, h * 0.62, rng(43 + w), { width: 1.8, alpha: 0.8, jitter: 1.4, passes: 1 });
  c.className = 'nb-strike';
  c.style.width = `${w}px`;
  c.style.height = `${h}px`;
  /* the strike is absolute, so its host has to be the thing it is
   * measured against — a static host would hand it to the page */
  if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
  host.appendChild(c);
}

/** The pencil rule under the active tab. */
function rule(w: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = Math.max(10, w);
  c.height = 6;
  const ctx = c.getContext('2d')!;
  stroke(ctx, [[1, 3], [w - 1, 3.5]], rng(9 + w), { width: 1.6, alpha: 0.75, color: PENCIL, jitter: 1, passes: 1 });
  c.className = 'nb-rule';
  c.style.width = `${w}px`;
  c.style.height = '6px';
  return c;
}

/** Everybody in the `asked` phase with a want, newest ask last. */
function asked(): { name: string; want: string; line: string | null }[] {
  const out: { name: string; want: string; line: string | null }[] = [];
  const store = notebook.npcs as Record<string, NpcState | undefined>;
  for (const n of npcs.list()) {
    const s = store[n.def.id];
    if (!s || s.phase !== 'asked' || !s.want) continue;
    const lines = n.def.lines(s);
    out.push({ name: n.def.name, want: s.want, line: lines[0] ?? null });
  }
  return out;
}

/* ---- FIRST HOUR: with no job, the opening may name the nearest ask ---- */
export const fallbackAsk: { get: (() => { name: string; want: string } | null) | null; refresh: () => void } = { get: null, refresh: () => {} };

export class NotebookPage {
  private veil: HTMLElement;
  private page: HTMLElement;
  private tabsEl: HTMLElement;
  private body: HTMLElement;
  private tab: Tab = 'THE LIST';
  private title: HTMLElement;
  private tabEls = new Map<Tab, HTMLElement>();
  private cache = new Map<string, HTMLElement>();
  private dirtyWhileOpen = false;
  isOpen = false;

  /** The objective line. */
  private objective: HTMLElement;
  private objectiveText = '';
  private flashTimer = 0;

  constructor(private ui: UI) {
    this.veil = el('nb-veil', ui.root);
    this.veil.addEventListener('click', () => this.close());
    this.page = el('nb-page', this.veil);
    this.page.style.backgroundImage = `url(${panelPageURL(6120)})`;
    this.page.addEventListener('click', (e) => e.stopPropagation());
    const head = el('nb-head', this.page);
    this.title = el('nb-title', head);
    this.letterTitle();
    const close = el('nb-close', head, 'button');
    letterEl(close, 'put it away', S.button(10.5));
    close.addEventListener('click', () => this.close());
    this.tabsEl = el('nb-tabs', this.page);
    for (const t of TABS) {
      const b = el('nb-tab', this.tabsEl, 'button');
      letterEl(b, t, S.quiet(10.5));
      b.addEventListener('click', () => this.show(t));
      this.tabEls.set(t, b);
    }
    this.body = el('nb-body', this.page);

    this.objective = ui.objectiveEl;
    this.objective.addEventListener('click', () => this.open());

    notebook.ui = this;
    notebook.onChange(() => {
      this.letterTitle();
      this.objectiveTick();
      if (this.isOpen) this.render();
      else this.dirtyWhileOpen = true;
    });
    this.objectiveTick();
    fallbackAsk.refresh = () => this.objectiveTick(); /* ---- FIRST HOUR ---- */
    window.addEventListener('resize', () => { if (this.isOpen) this.render(); });
  }

  open() {
    if (this.isOpen) return;
    this.ui.closeNote();
    this.ui.closeMap();
    this.isOpen = true;
    this.veil.classList.add('show');
    this.render();
  }

  close() {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.veil.classList.remove('show');
  }

  toggle() {
    if (this.isOpen) this.close();
    else this.open();
  }

  show(t: Tab | string) {
    if (!TABS.includes(t as Tab)) return;
    this.tab = t as Tab;
    this.render();
  }

  /** The cover: the name the walker chose on the bench, once there is one. */
  private letterTitle() {
    const n = notebook.name;
    letterEl(this.title, n ? `${n}'s notebook` : 'notebook', { ...S.display(16), px: 16, align: 'left' });
  }

  /* ---- lines, cached by content ------------------------------------ */
  private lineEl(key: string, text: string, style: 'head' | 'line' | 'quiet' | 'pencil' | 'voice', w: number): HTMLElement {
    const k = `${style}|${key}`;
    let e = this.cache.get(k);
    if (!e) {
      e = document.createElement('div');
      e.className = `nb-line nb-l-${style}`;
      this.cache.set(k, e);
    }
    const st = style === 'head' ? { ...S.display(13), px: 13, align: 'left' as const, maxWidth: w }
      : style === 'quiet' ? { ...S.quiet(10), maxWidth: w }
        : style === 'pencil' ? { ...S.pencil(10), maxWidth: w }
          : style === 'voice' ? { ...S.voice(11.5), maxWidth: w }
            : { ...S.voice(11), maxWidth: w };
    letterEl(e, text, st);
    return e;
  }

  private width(): number {
    const cs = getComputedStyle(this.page);
    const padX = parseFloat(cs.paddingLeft || '0') + parseFloat(cs.paddingRight || '0');
    const w = this.page.clientWidth || Math.min(520, window.innerWidth * 0.92);
    return Math.max(160, Math.floor(w - padX - 8));
  }

  render() {
    this.dirtyWhileOpen = false;
    // tabs: the active one gets the pencil rule
    for (const [t, b] of this.tabEls) {
      b.classList.toggle('active', t === this.tab);
      b.querySelectorAll('.nb-rule').forEach((r) => r.remove());
      if (t === this.tab) b.appendChild(rule(Math.max(20, b.offsetWidth - 8)));
    }
    const w = this.width();
    const out: HTMLElement[] = [];
    const push = (e: HTMLElement) => out.push(e);
    switch (this.tab) {
      case 'THE LIST': {
        /* THE FIRST PAGE, in his own hand: twelve lines, one crossed
         * out, and the sentence over them. Stuck to the cover until the
         * opening reads it. */
        if (!notebook.listShown) {
          push(this.lineEl('list-stuck', 'the first page is stuck to the cover. it can wait.', 'quiet', w));
          break;
        }
        push(this.lineEl('list-head', LIST_HEAD, 'head', w));
        push(this.lineEl('list-how', 'hold a line down to cross it out. it is your book.', 'quiet', w));
        THE_LIST.forEach((l, i) => {
          /* a line is crossed out when he crossed it out, or when the
           * land's job is done: the notebook keeps its own score */
          const byHand = notebook.crossed.includes(l.id);
          const kept = !!l.kept || byHand || landKept(l.land);
          const row = document.createElement('div');
          row.className = `nb-list-row${kept ? ' kept' : ''}`;
          row.dataset.line = l.id;
          const num = this.lineEl(`list-n|${i}`, `${i + 1}.`, 'pencil', 30);
          num.style.cssText = 'display:inline-block;width:26px;flex:0 0 26px;';
          row.style.cssText = 'display:flex;align-items:flex-start;gap:4px;margin:3px 0;';
          const text = this.lineEl(`list|${l.id}|${kept}|${byHand}`, l.line, 'line', w - 40);
          row.appendChild(num);
          row.appendChild(text);
          push(row);
          if (kept) requestAnimationFrame(() => { if (!text.querySelector('.nb-strike')) strike(text, byHand); });
          else this.holdToCross(row, text, l.id);
        });
        break;
      }
      case 'JOBS': {
        const jobs = notebook.list();
        const asks = asked();
        if (!jobs.length && !asks.length) push(this.lineEl('none', 'nothing yet. talk to somebody.', 'quiet', w));
        const active = notebook.active();
        for (const j of [...jobs.filter((x) => !x.complete), ...jobs.filter((x) => x.complete)]) {
          push(this.jobEl(j, j === active, w));
        }
        /* what people have asked for and where — the errands that are
         * not yet jobs, so the page is never blank after a conversation */
        if (asks.length) {
          push(this.lineEl('asked-head', 'ASKED', 'head', w));
          for (const a of asks) {
            push(this.lineEl(`ask|${a.name}|${a.want}`, `${a.name} — ${a.want}`, 'line', w));
            if (a.line) push(this.lineEl(`askline|${a.name}|${a.line}`, `“${a.line}”`, 'pencil', w));
          }
        }
        break;
      }
      case 'HEARD': {
        if (!notebook.heardList.length) push(this.lineEl('none', 'nobody has said anything to you yet.', 'quiet', w));
        notebook.heardList.forEach((h, i) => {
          const wrap = document.createElement('div');
          wrap.className = 'nb-heard';
          // keyed by the line it heads, so two of Nell's get two NELLs
          wrap.appendChild(this.lineEl(`who|${h.who}|${h.line}`, h.who, 'quiet', w));
          wrap.appendChild(this.lineEl(`said|${h.who}|${h.line}`, `“${h.line}”`, 'line', w));
          wrap.dataset.i = String(i);
          push(wrap);
        });
        break;
      }
      case 'PLACES': {
        if (!notebook.places.length) push(this.lineEl('none', 'no places yet. read a signpost.', 'quiet', w));
        for (const p of notebook.places) {
          const text = `${p.label} — ${notebook.landName(p.land).toLowerCase()}`;
          push(this.lineEl(`place|${text}|${p.seen}`, text, p.seen ? 'line' : 'pencil', w));
        }
        break;
      }
      case 'FOUND': {
        const counts = Object.entries(notebook.counts());
        if (!counts.length && !notebook.learned.length) push(this.lineEl('none', 'nothing found yet.', 'quiet', w));
        for (const [name, c] of counts) {
          push(this.lineEl(`count|${name}|${c.have}|${c.of}`, `${name} — ${c.have} of ${c.of}`, 'head', w));
          for (const item of notebook.foundMap[name].items) {
            /* ---- THINGS: a stamp is drawn as its impression ---- */
            if (name === STAMP_COLLECTION) { push(this.stampEl(name, item, w)); continue; }
            push(this.lineEl(`item|${name}|${item}`, item, 'line', w));
          }
        }
        if (notebook.learned.length) {
          push(this.lineEl('learned-head', 'LEARNED', 'head', w));
          for (const l of [...notebook.learned].reverse()) push(this.lineEl(`learned|${l}`, l, 'line', w));
        }
        break;
      }
      case 'CHOICES': {
        if (!notebook.choices.length) push(this.lineEl('none', 'no choices yet. they come on cards.', 'quiet', w));
        for (const c of [...notebook.choices].reverse()) {
          push(this.lineEl(`chose|${c.id}`, `YOU CHOSE: ${c.what}`, 'line', w));
          if (c.consequence) push(this.lineEl(`why|${c.id}|${c.consequence}`, `— ${c.consequence}`, 'pencil', w));
        }
        break;
      }
    }
    this.body.textContent = '';
    for (const e of out) this.body.appendChild(e);
  }

  /* ---- THE THREE VERBS: a line of THE LIST is crossed out by holding
   * it down. The pen draws across it while the press lasts; let go
   * early and the pen lifts and the line is as it was. ---- */
  private static CROSS_MS = 900;
  private holdToCross(row: HTMLElement, text: HTMLElement, id: string) {
    if (row.dataset.wired) return;
    row.dataset.wired = '1';
    row.style.cursor = 'pointer';
    row.style.touchAction = 'none';
    let timer = 0;
    let t0 = 0;
    let pen: HTMLCanvasElement | null = null;
    const lift = () => {
      if (!timer) return;
      window.clearInterval(timer);
      timer = 0;
      pen?.remove();
      pen = null;
    };
    const draw = (k: number) => {
      if (!pen) return;
      const w = pen.width;
      const h = pen.height;
      const ctx = pen.getContext('2d')!;
      ctx.clearRect(0, 0, w, h);
      line(ctx, 2, h * 0.55, 2 + (w - 6) * k, h * (0.55 - 0.05 * k), rng(41 + w), { width: 2.2, alpha: 0.9, jitter: 1.2, passes: 1 });
    };
    row.addEventListener('pointerdown', (e) => {
      if (!crossout.can(id) || timer) return;
      e.preventDefault();
      t0 = performance.now();
      pen = document.createElement('canvas');
      pen.width = Math.max(20, text.offsetWidth || 160);
      pen.height = Math.max(10, text.offsetHeight || 18);
      pen.className = 'nb-strike';
      pen.style.width = `${pen.width}px`;
      pen.style.height = `${pen.height}px`;
      if (getComputedStyle(text).position === 'static') text.style.position = 'relative';
      text.appendChild(pen);
      timer = window.setInterval(() => {
        if (!row.isConnected) { lift(); return; } // the page redrew under the pen
        const k = (performance.now() - t0) / NotebookPage.CROSS_MS;
        if (k < 1) { draw(k); return; }
        lift();
        crossout.cross(id); // the notebook changes, and the page redraws it struck
      }, 30);
    });
    for (const ev of ['pointerup', 'pointercancel', 'pointerleave'] as const) row.addEventListener(ev, lift);
  }

  /* ---- THINGS: the FOUND page draws each stamp as an ink rubber-stamp ---- */
  private stampEl(collection: string, item: string, w: number): HTMLElement {
    const key = `stamp|${collection}|${item}`;
    let row = this.cache.get(key);
    if (row) return row;
    row = document.createElement('div');
    row.className = 'nb-stamp-row';
    row.style.cssText = 'display:flex;align-items:center;gap:10px;margin:2px 0;';
    row.appendChild(stampImpression(item, 26, Math.min(2, window.devicePixelRatio || 1)));
    row.appendChild(this.lineEl(`item|${collection}|${item}`, item, 'line', w - 80));
    this.cache.set(key, row);
    return row;
  }

  private jobEl(j: Job, active: boolean, w: number): HTMLElement {
    /* THE TWELVE LINES: once the first page has been read, a job that
     * hangs on a line of it is headed by that line, verbatim, in his
     * own hand; the steps under it are what keeping it takes */
    const hung = notebook.listShown && j.line ? j.line : null;
    const key = `job|${j.id}|${j.done}|${j.complete}|${active}|${hung ? 1 : 0}|${j.steps[j.done] ?? ''}`;
    let wrap = this.cache.get(key);
    if (wrap) return wrap;
    wrap = document.createElement('div');
    wrap.className = `nb-job${j.complete ? ' complete' : ''}${active ? ' active' : ''}`;
    const head = hung
      ? this.lineEl(`jobline-head|${j.id}|${hung}`, hung, 'voice', w - 24)
      : this.lineEl(`jobhead|${j.giver}|${j.name}`, `${j.giver} — ${j.name}`, 'head', w - 24);
    const headWrap = document.createElement('div');
    headWrap.className = 'nb-jobhead';
    if (active && !j.complete) {
      const g = glyph('job', 16);
      if (g) headWrap.appendChild(g);
    }
    headWrap.appendChild(head);
    wrap.appendChild(headWrap);
    j.steps.forEach((s, i) => {
      const row = document.createElement('div');
      row.className = `nb-step${i < j.done ? ' done' : ''}${i === j.done && !j.complete ? ' next' : ''}`;
      const box = document.createElement('div');
      box.className = 'nb-box';
      if (i < j.done) {
        const g = glyph('done', 14);
        if (g) box.appendChild(g);
      }
      row.appendChild(box);
      row.appendChild(this.lineEl(`step|${j.id}|${i}|${s}`, s, 'line', w - 40));
      wrap.appendChild(row);
    });
    if (j.reward) wrap.appendChild(this.lineEl(`reward|${j.id}|${j.reward}`, `for: ${j.reward}`, 'pencil', w - 24));
    if (j.complete && j.line) wrap.appendChild(this.lineEl(`jobline|${j.id}|${j.line}`, `“${j.line}”`, 'pencil', w - 24));
    if (j.complete) requestAnimationFrame(() => strike(headWrap));
    this.cache.set(key, wrap);
    return wrap;
  }

  /* ---- the objective line ------------------------------------------ */
  private objectiveTick() {
    const j = notebook.active();
    // no job: the line falls back to the last thing somebody asked for
    const a = j ? null : (fallbackAsk.get?.() ?? asked()[0]); /* ---- FIRST HOUR: the nearest ask ---- */
    const text = j ? `${j.giver} — ${j.steps[j.done] ?? j.name}`.toUpperCase()
      : a ? `${a.name} — ${a.want}`.toUpperCase() : '';
    if (text === this.objectiveText) return;
    this.objectiveText = text;
    if (!text) {
      this.objective.classList.remove('show');
      return;
    }
    const tall = window.innerWidth / window.innerHeight < 0.8;
    letterEl(this.objective, text, { ...S.voice(11), maxWidth: tall ? Math.max(160, window.innerWidth - 48) : Math.max(160, Math.min(360, window.innerWidth * 0.55)), color: INK });
    this.objective.classList.add('show');
    this.objective.classList.remove('flash');
    void this.objective.offsetWidth;
    this.objective.classList.add('flash');
    window.clearTimeout(this.flashTimer);
    this.flashTimer = window.setTimeout(() => this.objective.classList.remove('flash'), 1400);
  }
}
