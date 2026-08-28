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
  onOpenMap: (() => HTMLCanvasElement) | null = null;
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

    // title
    this.title = el('title-veil', this.root);
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

  showTitle(hasSave: boolean) {
    this.continueBtn.style.display = hasSave ? '' : 'none';
    this.title.classList.remove('gone');
    this.hud.classList.remove('show');
  }

  hideTitle() {
    this.title.classList.add('gone');
    this.hud.classList.add('show');
  }

  setSoundLabel(muted: boolean) {
    letterEl(this.soundBtn, muted ? 'sound: off' : 'sound: on', S.button(11));
  }

  /** The border-crossing card: kicker over name, then it lets go. */
  showRegionCard(kicker: string, name: string) {
    letterEl(this.cardKicker, kicker, S.quiet(11));
    letterEl(this.cardName, name, { ...S.display(24), px: 24 });
    this.card.classList.add('show');
    window.clearTimeout(this.cardTimer);
    this.cardTimer = window.setTimeout(() => this.card.classList.remove('show'), 3400);
  }

  showHint(text: string, holdMs = 4200) {
    letterEl(this.hintEl, text, S.voice(11.5));
    this.hintEl.classList.add('show');
    window.clearTimeout(this.hintTimer);
    this.hintTimer = window.setTimeout(() => this.hintEl.classList.remove('show'), holdMs);
  }

  openNote(title: string, body: string) {
    letterEl(this.noteTitle, title, { ...S.display(17), px: 17, align: 'left' });
    letterEl(this.noteBody, body, { ...S.voice(12.5), maxWidth: 380, leading: 2.6 });
    this.note.classList.add('show');
    this.noteOpen = true;
  }

  closeNote() {
    this.note.classList.remove('show');
    this.noteOpen = false;
  }

  openMap() {
    const canvas = this.onOpenMap?.();
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
