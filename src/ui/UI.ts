import { letterEl, S } from './lettering';

/**
 * The chrome — every word hand-lettered through the stroke library,
 * nothing set in a font (accessibility fallback aside). One loader,
 * one title, a region card when you cross a border, one note card
 * for reading things, the map, and two quiet buttons.
 */

const el = (cls: string, parent: HTMLElement, tag = 'div'): HTMLElement => {
  const d = document.createElement(tag);
  d.className = cls;
  parent.appendChild(d);
  return d;
};

export class UI {
  root: HTMLElement;
  labelRoot: HTMLElement;
  promptEl: HTMLElement;
  joyEl: HTMLElement;

  noteOpen = false;
  mapOpen = false;

  onBegin: (() => void) | null = null;
  onContinue: (() => void) | null = null;
  onToggleSound: (() => boolean) | null = null;
  onOpenMap: ((width: number) => HTMLCanvasElement) | null = null;
  onPromptClick: (() => void) | null = null;

  private loader: HTMLElement;
  private loaderBar: HTMLElement;
  private title: HTMLElement;
  private continueBtn: HTMLElement;
  private card: HTMLElement;
  private cardKicker: HTMLElement;
  private cardName: HTMLElement;
  private cardTimer = 0;
  private note: HTMLElement;
  private noteTitle: HTMLElement;
  private noteBody: HTMLElement;
  private map: HTMLElement;
  private mapSlot: HTMLElement;
  private hud: HTMLElement;
  private soundBtn: HTMLElement;
  private hintEl: HTMLElement;
  private hintTimer = 0;

  constructor() {
    this.root = document.getElementById('app')!;

    this.labelRoot = el('labels', this.root);
    this.promptEl = el('prompt lettered', this.root);
    this.promptEl.id = 'prompt';
    this.promptEl.addEventListener('click', () => this.onPromptClick?.());

    this.joyEl = el('joy', this.root);
    this.joyEl.id = 'joy';
    el('nub', this.joyEl);

    // hud
    this.hud = el('hud', this.root);
    const mapBtn = el('hud-btn', this.hud, 'button');
    letterEl(mapBtn, 'map', S.button(11));
    mapBtn.addEventListener('click', () => (this.mapOpen ? this.closeMap() : this.openMap()));
    this.soundBtn = el('hud-btn', this.hud, 'button');
    letterEl(this.soundBtn, 'sound: on', S.button(11));
    this.soundBtn.addEventListener('click', () => {
      const muted = this.onToggleSound?.() ?? false;
      letterEl(this.soundBtn, muted ? 'sound: off' : 'sound: on', S.button(11));
    });

    // region card
    this.card = el('region-card', this.root);
    this.cardKicker = el('kicker', this.card);
    this.cardName = el('name', this.card);

    // hint line (controls, small truths)
    this.hintEl = el('hint', this.root);

    // note card
    this.note = el('note-veil', this.root);
    const noteCard = el('note-card', this.note);
    this.noteTitle = el('note-title', noteCard);
    this.noteBody = el('note-body', noteCard);
    const noteClose = el('note-close', noteCard);
    letterEl(noteClose, 'put it back', S.button(10.5));
    this.note.addEventListener('click', () => this.closeNote());

    // map overlay
    this.map = el('map-veil', this.root);
    this.mapSlot = el('map-slot', this.map);
    this.map.addEventListener('click', () => this.closeMap());

    // title — starts gone so the loader's fade never overlaps it;
    // App shows it once the loader has fully let go
    this.title = el('title-veil gone', this.root);
    const tbox = el('title-box', this.title);
    const t = el('game-title', tbox);
    letterEl(t, 'INKLANDS', { ...S.display(44), px: 44 });
    const sub = el('game-sub', tbox);
    letterEl(sub, 'a world in one sheet — twelve lands, one pen', S.voice(13));
    const begin = el('title-btn', tbox, 'button');
    letterEl(begin, 'set out', S.button(14));
    begin.addEventListener('click', () => this.onBegin?.());
    this.continueBtn = el('title-btn', tbox, 'button');
    letterEl(this.continueBtn, 'keep walking', S.button(14));
    this.continueBtn.addEventListener('click', () => this.onContinue?.());

    // loader
    this.loader = el('loader', this.root);
    const lt = el('loader-title', this.loader);
    letterEl(lt, 'INKLANDS', { ...S.display(30), px: 30 });
    const sub2 = el('loader-sub', this.loader);
    letterEl(sub2, 'inking the sheet…', S.quiet(11));
    const track = el('loader-track', this.loader);
    this.loaderBar = el('loader-bar', track);

    /* A canvas does not reflow, so anything lettered to a measured width
     * has to be re-lettered when that width changes — a phone rotated
     * with a note open would otherwise keep the portrait wrap. */
    window.addEventListener('resize', () => {
      if (this.noteOpen) this.letterNote();
      if (this.mapOpen) this.openMap();
    });

    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyM') (this.mapOpen ? this.closeMap() : this.openMap());
      if (e.code === 'Escape') {
        this.closeMap();
        this.closeNote();
      }
    });
  }

  setProgress(t: number) {
    this.loaderBar.style.transform = `scaleX(${Math.min(1, t)})`;
  }

  hideLoader() {
    this.loader.classList.add('gone');
  }

  /** Set once the walk has begun, so a loader tween that finishes LATE
   *  can never letter the title back over a game already in progress.
   *  Only the shoot harness and a very slow first paint can produce
   *  that order, and it produced it here. */
  private begun = false;

  showTitle(hasSave: boolean) {
    if (this.begun) return;
    this.continueBtn.style.display = hasSave ? '' : 'none';
    this.title.classList.remove('gone');
    this.hud.classList.remove('show');
  }

  hideTitle() {
    this.begun = true;
    this.title.classList.add('gone');
    this.hud.classList.add('show');
  }

  setSoundLabel(muted: boolean) {
    letterEl(this.soundBtn, muted ? 'sound: off' : 'sound: on', S.button(11));
  }

  /** The border-crossing card: kicker over name, then it lets go.
   *
   *  The NAME is set in 24pt display caps and some of these lands are
   *  called CASTLE GREYWEATHER. On a narrow phone that is wider than
   *  the screen, so the card is given the page to wrap in — it will
   *  break to two lines rather than run off the side. */
  showRegionCard(kicker: string, name: string) {
    const w = Math.max(180, window.innerWidth - 36);
    letterEl(this.cardKicker, kicker, { ...S.quiet(11), maxWidth: w, align: 'center' });
    letterEl(this.cardName, name, { ...S.display(24), px: 24, maxWidth: w });
    this.card.classList.add('show');
    window.clearTimeout(this.cardTimer);
    this.cardTimer = window.setTimeout(() => this.card.classList.remove('show'), 3400);
  }

  showHint(text: string, holdMs = 4200) {
    /* The hint is the control list and the control list got longer when
     * running arrived. It is one lettered line on a canvas, which does
     * not reflow, so at 320 points it ran off both edges of the screen. */
    letterEl(this.hintEl, text, {
      ...S.voice(11.5), maxWidth: Math.max(200, window.innerWidth - 32), align: 'center',
    });
    this.hintEl.classList.add('show');
    window.clearTimeout(this.hintTimer);
    this.hintTimer = window.setTimeout(() => this.hintEl.classList.remove('show'), holdMs);
  }

  /* ================================================================ *
   * THE NOTE CARD.
   *
   * Hand-lettering is drawn to a CANVAS, and a canvas has a width in
   * pixels rather than a paragraph's willingness to reflow. So the wrap
   * width is not a style choice — it is a measurement, and it has to be
   * taken from the card the text is actually going into.
   *
   * It was a constant (380) for five sessions, and on a phone that is
   * wider than the card: `max-width: min(460px, 88vw)` on a 390-point
   * screen is 343 points, less 60 of padding, so the body was lettered
   * a hundred points wider than the box it lives in and every line but
   * the last ran off the side of the screen mid-word. Nothing in five
   * sessions of contact sheets could have caught it, because no shoot
   * script had ever opened a note. A player on an actual phone did.
   * ================================================================ */
  private noteText: { title: string; body: string } | null = null;

  /**
   * The width the card can give a line.
   *
   * Measured as the SPACE AVAILABLE, not as the card's current width —
   * the card is a flex item that shrinks to its contents, and at the
   * moment of measuring its only content is the "put it back" button.
   * Measuring the card itself therefore wrapped every note to the width
   * of those three words, which is a narrower card than the bug it was
   * fixing. `max-width` resolves through getComputedStyle to a real
   * pixel value, so the stylesheet stays the single source of the
   * number and this reads it.
   */
  private noteWidth(): number {
    const card = this.noteBody.parentElement as HTMLElement;
    const cs = getComputedStyle(card);
    const padX = parseFloat(cs.paddingLeft || '0') + parseFloat(cs.paddingRight || '0');
    const cap = parseFloat(cs.maxWidth);
    const avail = Number.isFinite(cap) && cap > 0
      ? cap
      : Math.min(460, window.innerWidth * 0.92);
    return Math.max(150, Math.floor(avail - (padX || 44)));
  }

  private letterNote() {
    if (!this.noteText) return;
    const w = this.noteWidth();
    /* AND THE TYPE IS SIZED SO THE LONGEST NOTE IN THE GAME FITS THE
     * NARROWEST PHONE WITHOUT SCROLLING.
     *
     * Wrapping to the card was the first fix and it was not the whole
     * one: at 320 points the same note simply became eleven lines and
     * ran off the bottom instead of off the side. A note is one card
     * you read at a glance — the moment it needs a scrollbar it has
     * stopped being a note and become a document. So the hand writes a
     * little smaller and a little tighter on a small page, which is
     * what a hand does, and `max-height` stays as a safety net rather
     * than as the plan. */
    const px = Math.max(11, Math.min(12.5, w / 22));
    const lead = px < 12 ? 2.25 : 2.6;
    const tpx = Math.max(14.5, Math.min(17, w / 16));
    letterEl(this.noteTitle, this.noteText.title,
      { ...S.display(tpx), px: tpx, align: 'left', maxWidth: w });
    letterEl(this.noteBody, this.noteText.body,
      { ...S.voice(px), maxWidth: w, leading: lead });
  }

  openNote(title: string, body: string) {
    this.noteText = { title, body };
    // show first, measure second: a hidden card has no width to measure
    this.note.classList.add('show');
    this.letterNote();
    this.noteOpen = true;
  }

  closeNote() {
    this.note.classList.remove('show');
    this.noteOpen = false;
    this.noteText = null;
  }

  openMap() {
    /* The map's own delivered width, computed the way the stylesheet
     * computes it, so the hand can write big enough to be read on a
     * small one (see ui/map.ts). */
    const w = Math.min(
      window.innerWidth * 0.92, window.innerHeight * 0.78 * 1.2368, 940
    );
    const canvas = this.onOpenMap?.(w);
    if (!canvas) return;
    this.mapSlot.textContent = '';
    canvas.className = 'map-canvas';
    this.mapSlot.appendChild(canvas);
    this.map.classList.add('show');
    this.mapOpen = true;
  }

  closeMap() {
    this.map.classList.remove('show');
    this.mapOpen = false;
  }
}
