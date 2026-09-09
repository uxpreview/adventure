import * as THREE from 'three';
import { StandeeField } from '../engine/StandeeField';
import { toast } from '../ui/toast';
import { shout } from '../ui/speech';
import { notebook } from './notebook';
import { worn } from './worn';
import type { RegionId } from './layout';
import type { WorldPOI } from './regions';
import { stampStandeeTexture } from './textures-monsters';

/**
 * THE STAMPS (THINGS TO DO) — one collection with a count. Twelve ink
 * stamps, one hidden in each land at a place worth finding. TAKE THE
 * STAMP → `notebook.found('STAMPS', name, 12)` → a toast with the
 * count, and the FOUND page draws the impression. People hint at the
 * ones you lack once their job is done. All twelve: a cap to wear.
 */

export const STAMP_COLLECTION = 'STAMPS';
export const STAMP_TOTAL = 12;

export type StampDef = {
  land: RegionId;
  /** What the impression says and the FOUND page lists. */
  name: string;
  x: number;
  z: number;
  /** The place it is at, for the hint and the pin. */
  place: string;
  /** What a person says about it, plain. */
  hint: string;
};

export const STAMPS: StampDef[] = [
  { land: 'meadow', name: 'THE COMMON', x: -55.4, z: 42.6, place: 'THE OLD WELL', hint: 'There\'s a stamp by THE OLD WELL on the Common, if you collect that sort of thing.' },
  { land: 'kingdom', name: 'BRIM', x: -100, z: -67.5, place: 'THE ORCHARD CLOSE', hint: 'Somebody left a stamp under the apples in THE ORCHARD CLOSE. Brim\'s.' },
  { land: 'castle', name: 'GREYWEATHER', x: -49.5, z: -231, place: 'THE KEEP', hint: 'Up at THE KEEP there\'s a stamp on the ground. Wick won\'t touch it.' },
  { land: 'neighborhood', name: 'MAPLE COURT', x: 4.5, z: 180.5, place: 'THE GREEN', hint: 'There\'s a stamp by the swing on THE GREEN in Maple Court. Nobody\'s claimed it.' },
  { land: 'forest', name: 'THE PENWOOD', x: 185.5, z: -243.5, place: 'THE DEEP PINES', hint: 'A stamp in THE DEEP PINES, right at the back of the wood. Go by day.' },
  { land: 'canyon', name: 'SPLITROCK', x: 302, z: -184, place: 'THE NEEDLE ARCH', hint: 'Under THE NEEDLE ARCH in the canyon there\'s a stamp. Something lives down there.' },
  { land: 'downs', name: 'THE DOWNS', x: 155.5, z: -5.5, place: 'THE MILL', hint: 'The miller keeps a stamp at the foot of THE MILL. He\'d not miss it.' },
  { land: 'desert', name: 'THE FLATS', x: 346, z: 21, place: 'WHERE THE ROAD STOPS', hint: 'Out WHERE THE ROAD STOPS, east of everything, there\'s a stamp. Long walk.' },
  { land: 'city', name: 'GREYLINE', x: 90, z: 217, place: 'THE HOLLOW', hint: 'Down in THE HOLLOW in Greyline, by the grating, a stamp. Warm down there.' },
  { land: 'office', name: 'THE MILE', x: 291.5, z: 250.5, place: 'THE MUSTER POINT', hint: 'THE MUSTER POINT behind the Mile has a stamp in the painted box. Health and safety.' },
  { land: 'beach', name: 'LONGSHORE', x: -252.5, z: 55.8, place: 'THE BOARDWALK', hint: 'At the end of THE BOARDWALK, under the lamp, a stamp. Mind what\'s under the boards.' },
  { land: 'ocean', name: 'THE WIDE BLUE', x: -259.5, z: -23, place: 'THE SANDBAR', hint: 'Walk THE SANDBAR to its end. There\'s a stamp on the last dry sand.' },
];

export const CAP_ID = 'the-postmaster-cap';

class Stamps {
  private field: StandeeField | null = null;
  private scene: THREE.Scene | null = null;
  private drawn = new Set<string>();

  init(scene: THREE.Scene, groundAt: (x: number, z: number) => number) {
    this.scene = scene;
    this.field = new StandeeField(stampStandeeTexture(9401), STAMP_TOTAL, { w: 0.9, h: 1.35, ground: groundAt, ghost: 0 });
    this.field.birthAll(-1e9);
    scene.add(this.field.mesh);
    this.redraw();
  }

  has(name: string): boolean {
    return (notebook.foundMap[STAMP_COLLECTION]?.items ?? []).includes(name);
  }
  get count(): number {
    return notebook.foundMap[STAMP_COLLECTION]?.items.length ?? 0;
  }
  /** The stamps not yet found, nearest to (x, z) first. */
  missing(x: number, z: number): StampDef[] {
    return STAMPS.filter((s) => !this.has(s.name)).sort((a, b) => Math.hypot(a.x - x, a.z - z) - Math.hypot(b.x - x, b.z - z));
  }

  take(def: StampDef) {
    if (this.has(def.name)) return;
    notebook.found(STAMP_COLLECTION, def.name, STAMP_TOTAL);
    notebook.place(def.place, def.x, def.z, { seen: true, quiet: true });
    try { window.dispatchEvent(new CustomEvent('inklands:event', { detail: 'found' })); } catch { /* no ears */ }
    this.redraw();
    if (this.count >= STAMP_TOTAL) {
      worn.take(CAP_ID);
      shout('TWELVE STAMPS. THE POSTMASTER\'S CAP IS YOURS.');
    } else if (this.count === 1) {
      toast('A STAMP. THERE ARE TWELVE. ONE IN EVERY LAND.', 'learned');
      notebook.learn('THERE ARE TWELVE STAMPS, ONE IN EVERY LAND');
    }
  }

  /** A hint at the nearest stamp still out, from somebody standing at
   *  (x, z). Pins the place in pencil. Null when they are all found. */
  hint(x: number, z: number): string | null {
    const m = this.missing(x, z);
    if (!m.length) return null;
    const s = m[0];
    notebook.place(s.place, s.x, s.z, { quiet: true });
    return s.hint;
  }

  private redraw() {
    if (!this.field) return;
    STAMPS.forEach((s, i) => {
      if (this.has(s.name)) this.field!.hide(i, s.x, s.z);
      else this.field!.set(i, s.x, s.z, 1, (i % 5) * 0.12 - 0.24);
    });
  }

  tick(t: number) {
    this.field?.update(t, 0);
  }
}

export const stamps = new Stamps();

/** TAKE THE STAMP, at each of the twelve. */
export const STAMP_POIS: WorldPOI[] = STAMPS.map((s) => ({
  x: s.x, z: s.z, radius: 2.8,
  get enabled() { return !stamps.has(s.name); },
  set enabled(_v: boolean) { /* the collection decides */ },
  prompt: 'TAKE THE STAMP',
  touch: () => { stamps.take(s); },
} as unknown as WorldPOI));
