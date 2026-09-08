import { rng, stroke, line } from '../engine/ink';
import { INK, PENCIL } from '../engine/palette';
import { letterEl, panelPageURL, S } from './lettering';
import { glyph } from './toast';
import { notebook, type Job } from '../world/notebook';
import { UI } from './UI';

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

type Tab = 'JOBS' | 'HEARD' | 'PLACES' | 'FOUND' | 'CHOICES';
const TABS: Tab[] = ['JOBS', 'HEARD', 'PLACES', 'FOUND', 'CHOICES'];

const el = (cls: string, parent: HTMLElement, tag = 'div'): HTMLElement => {
  const d = document.createElement(tag);
  d.className = cls;
  parent.appendChild(d);
  return d;
};

/** An ink line struck through a lettered element. */
function strike(host: HTMLElement) {
  const c = document.createElement('canvas');
  const w = Math.max(20, host.offsetWidth || 160);
  const h = Math.max(10, host.offsetHeight || 18);
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d')!;
  line(ctx, 2, h * 0.55, w - 4, h * 0.5, rng(41 + w), { width: 1.6, alpha: 0.7, jitter: 1.2, passes: 1 });
  c.className = 'nb-strike';
  c.style.width = `${w}px`;
  c.style.height = `${h}px`;
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

export class NotebookPage {
  private veil: HTMLElement;
  private page: HTMLElement;
  private tabsEl: HTMLElement;
  private body: HTMLElement;
  private tab: Tab = 'JOBS';
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
    const title = el('nb-title', head);
    letterEl(title, 'notebook', { ...S.display(16), px: 16, align: 'left' });
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
      this.objectiveTick();
      if (this.isOpen) this.render();
      else this.dirtyWhileOpen = true;
    });
    this.objectiveTick();
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

  show(t: Tab) {
    this.tab = t;
    this.render();
  }

  /* ---- lines, cached by content ------------------------------------ */
  private lineEl(key: string, text: string, style: 'head' | 'line' | 'quiet' | 'pencil' | 'voice', w: number): HTMLElement {
    const k = `${style}|${key}`;
    let e = this.cache.get(k);
    if (!e) {
      e = document.createElement('div');
      e.className = `nb-line nb-${style}`;
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
      case 'JOBS': {
        const jobs = notebook.list();
        if (!jobs.length) push(this.lineEl('none', 'nothing yet. talk to somebody.', 'quiet', w));
        const active = notebook.active();
        for (const j of [...jobs.filter((x) => !x.complete), ...jobs.filter((x) => x.complete)]) {
          push(this.jobEl(j, j === active, w));
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
          for (const item of notebook.foundMap[name].items) push(this.lineEl(`item|${name}|${item}`, item, 'line', w));
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

  private jobEl(j: Job, active: boolean, w: number): HTMLElement {
    const key = `job|${j.id}|${j.done}|${j.complete}|${active}`;
    let wrap = this.cache.get(key);
    if (wrap) return wrap;
    wrap = document.createElement('div');
    wrap.className = `nb-job${j.complete ? ' complete' : ''}${active ? ' active' : ''}`;
    const head = this.lineEl(`jobhead|${j.giver}|${j.name}`, `${j.giver} — ${j.name}`, 'head', w - 24);
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
    const text = j ? `${j.giver} — ${j.steps[j.done] ?? j.name}`.toUpperCase() : '';
    if (text === this.objectiveText) return;
    this.objectiveText = text;
    if (!text) {
      this.objective.classList.remove('show');
      return;
    }
    letterEl(this.objective, text, { ...S.voice(11), maxWidth: Math.max(160, Math.min(360, window.innerWidth * 0.55)), color: INK });
    this.objective.classList.add('show');
    this.objective.classList.remove('flash');
    void this.objective.offsetWidth;
    this.objective.classList.add('flash');
    window.clearTimeout(this.flashTimer);
    this.flashTimer = window.setTimeout(() => this.objective.classList.remove('flash'), 1400);
  }
}
