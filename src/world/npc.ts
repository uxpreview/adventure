import type * as THREE from 'three';
import type { POIManager, POIDef } from '../engine/POI';
import { drawn, Figure } from './life';
import { clock } from './daylight';
import { knowledge } from './knowledge';
import { notebook } from './notebook';
import { say, type Speaker } from '../ui/speech';
import { PEOPLE, FOLK_BY_ROLE, FOLK_BY_LAND, type NpcPhase, type PersonDef } from './lines';
import type { RegionId } from './layout';

/**
 * THE PEOPLE (VOICE) — a registry of everybody who can be talked to.
 *
 * A named person is defined once (`define`), positioned by whatever
 * already draws them — a `life.ts` Figure found by routine id, a
 * getter the land registers with `track`, or `at(hour)` — and given
 * one POI: walk up, the prompt says TALK TO NELL, press E, and she says
 * the next line for her state. Unnamed folk get the same treatment
 * automatically: every Figure on the page gets a TALK prompt and a
 * line from a pool by role, then by land.
 */

export type { NpcPhase };

export type NpcState = {
  phase: NpcPhase;
  /** Which line of the current set comes next. */
  said: number;
  /** Doors taken in this person's land, in order. */
  doors: string[];
  /** What they have asked for, if anything (a POI label). */
  want?: string;
};

export type NpcDef = {
  id: string;
  name: string;
  land: RegionId;
  /** Where they are, if nothing draws them: a point or a function of
   *  the hour. Optional here — a Figure or a `track` getter wins. */
  at?: ((hour: number) => { x: number; z: number }) | { x: number; z: number };
  lines: (state: NpcState) => string[];
  onTalk?: (state: NpcState) => void;
  /** Routine ids (`life.ts` Figures) that draw this person. */
  figures?: string[];
  /** The POI label their `asked` line names, for the pin. */
  want?: string;
};

export type Npc = {
  def: NpcDef;
  /** The land's own getter, when the person is drawn by hand. */
  tracked: (() => { x: number; z: number; present: boolean }) | null;
  figs: Figure[];
  poi: POIDef | null;
  speaker: Speaker;
};

type Pos = { x: number; z: number; present: boolean };

const TALK_R = 3.5;
const FOLK_R = 3.0;

function figOf(d: { report(): unknown }): Figure | null {
  return d instanceof Figure ? d : null;
}

function opacityOf(m: THREE.Mesh): number {
  const mat = m.material as THREE.MeshBasicMaterial | THREE.MeshBasicMaterial[];
  return Array.isArray(mat) ? 1 : mat.opacity ?? 1;
}

class Npcs {
  private map = new Map<string, Npc>();
  private poiMan: POIManager | null = null;
  /** How far down `drawn` the folk scan has been. `drawn` only grows. */
  private scanned = 0;
  private folkCount = new WeakMap<Figure, number>();
  private namedFigureIds = new Set<string>();
  /** The walker, for `near` and for a reaction's earshot. */
  walker: { x: number; z: number } = { x: 0, z: 0 };

  /** Give the registry the POI manager. People defined before this
   *  get their POIs now. */
  attach(poi: POIManager) {
    this.poiMan = poi;
    for (const n of this.map.values()) if (!n.poi) this.addPoi(n);
  }

  define(def: NpcDef) {
    if (this.map.has(def.id)) return;
    const n: Npc = { def, tracked: null, figs: [], poi: null, speaker: { name: def.name, x: 0, z: 0 } };
    const self = this;
    n.speaker = {
      name: def.name,
      get x() { return self.positionOf(def.id)?.x ?? 0; },
      get z() { return self.positionOf(def.id)?.z ?? 0; },
    };
    for (const f of def.figures ?? []) this.namedFigureIds.add(f);
    this.map.set(def.id, n);
    if (this.poiMan) this.addPoi(n);
  }

  /** A land that draws a person by hand tells the registry where. */
  track(id: string, getter: () => { x: number; z: number; present: boolean }) {
    const n = this.map.get(id);
    if (n) n.tracked = getter;
  }

  private addPoi(n: Npc) {
    const self = this;
    const def = {
      get x() { return self.positionOf(n.def.id)?.x ?? 0; },
      get z() { return self.positionOf(n.def.id)?.z ?? 0; },
      radius: TALK_R,
      label: n.def.name,
      labelHeight: 2.5,
      prompt: `TALK TO ${n.def.name}`,
      get enabled() { return self.positionOf(n.def.id)?.present ?? false; },
      set enabled(_v: boolean) { /* the drawing decides */ },
      onInteract: () => self.talk(n.def.id),
      npc: true,
    } as unknown as POIDef;
    n.poi = def;
    this.poiMan!.add(def);
  }

  /** Where a person is now, and whether they are on the page. */
  positionOf(id: string): Pos | null {
    const n = this.map.get(id);
    if (!n) return null;
    if (n.tracked) return n.tracked();
    if (n.def.figures?.length) {
      if (n.figs.length < n.def.figures.length) this.findFigures(n);
      let best: Figure | null = null;
      for (const f of n.figs) if (f.mesh.visible && opacityOf(f.mesh) > 0.3) { best = f; break; }
      if (best) return { x: best.mesh.position.x, z: best.mesh.position.z, present: true };
      const any = n.figs[0];
      if (any) return { x: any.mesh.position.x, z: any.mesh.position.z, present: false };
      return null;
    }
    const at = n.def.at;
    if (!at) return null;
    const p = typeof at === 'function' ? at(clock.hour) : at;
    return { x: p.x, z: p.z, present: true };
  }

  private findFigures(n: Npc) {
    for (const d of drawn) {
      const f = figOf(d);
      if (f && n.def.figures!.includes(f.def.id) && !n.figs.includes(f)) n.figs.push(f);
    }
  }

  state(id: string): NpcState {
    const store = notebook.npcs as Record<string, NpcState>;
    let s = store[id];
    if (!s) {
      s = { phase: 'idle', said: 0, doors: [] };
      store[id] = s;
    }
    if (!s.doors) s.doors = [];
    return s;
  }

  set(id: string, patch: Partial<NpcState>) {
    const s = this.state(id);
    const was = s.phase;
    Object.assign(s, patch);
    if (patch.phase && patch.phase !== was) s.said = 0;
    notebook.dirty = true;
  }

  /** A door taken in a land: the land's person will speak to it. */
  doorTaken(land: RegionId, door: string) {
    for (const n of this.map.values()) {
      if (n.def.land !== land) continue;
      const s = this.state(n.def.id);
      if (!s.doors.includes(door)) s.doors.push(door);
      s.said = 0;
      notebook.dirty = true;
    }
  }

  /** The nearest named person within `r` of a point. */
  near(x: number, z: number, r: number): Npc | null {
    let best: Npc | null = null;
    let bd = r;
    for (const n of this.map.values()) {
      const p = this.positionOf(n.def.id);
      if (!p || !p.present) continue;
      const d = Math.hypot(p.x - x, p.z - z);
      if (d < bd) { bd = d; best = n; }
    }
    return best;
  }

  get(id: string): Npc | null {
    return this.map.get(id) ?? null;
  }

  list(): Npc[] {
    return [...this.map.values()];
  }

  speakerOf(id: string): Speaker | null {
    return this.map.get(id)?.speaker ?? null;
  }

  /** The talk verb: the next line for the state, spoken and noted. */
  talk(id: string) {
    const n = this.map.get(id);
    if (!n) return;
    const s = this.state(id);
    const lines = n.def.lines(s);
    if (!lines.length) return;
    const line = lines[s.said % lines.length];
    say(n.speaker, line);
    notebook.heard(n.def.name, line);
    // the first meeting; then, next time, what they want
    if (s.phase === 'idle') {
      s.phase = 'met';
      s.said = 0;
    } else if (s.phase === 'met' && n.def.want && !s.doors.length && !knowledge.decided(n.def.land)) {
      s.phase = 'asked';
      s.said = 0;
      s.want = n.def.want;
    } else {
      s.said++;
    }
    // a line that names a place pins it
    if (n.def.want && line.includes(n.def.want)) this.pin(n.def.want);
    notebook.dirty = true;
    n.def.onTalk?.(s);
  }

  /** Pin a place a person named, by its POI label. */
  pin(label: string): boolean {
    const p = this.poiMan?.pois.find((q) => q.def.label === label && !(q.def as { npc?: boolean }).npc);
    if (!p) return false;
    notebook.place(label, p.def.x, p.def.z);
    return true;
  }

  /** Everybody else: one prompt per drawn Figure, one line each. */
  scanFolk() {
    if (!this.poiMan) return;
    for (; this.scanned < drawn.length; this.scanned++) {
      const f = figOf(drawn[this.scanned]);
      if (!f || this.namedFigureIds.has(f.def.id)) continue;
      const self = this;
      const def = {
        get x() { return f.mesh.position.x; },
        get z() { return f.mesh.position.z; },
        radius: FOLK_R,
        labelHeight: 2.3,
        prompt: 'TALK',
        get enabled() { return f.mesh.visible && opacityOf(f.mesh) > 0.5; },
        set enabled(_v: boolean) { /* the drawing decides */ },
        onInteract: () => self.talkFolk(f),
        npc: true,
      } as unknown as POIDef;
      this.poiMan.add(def);
    }
  }

  private talkFolk(f: Figure) {
    const id = f.def.id;
    let pool: string[] | null = null;
    let role = '';
    for (const [prefix, lines] of FOLK_BY_ROLE) {
      if (id.startsWith(prefix) && prefix.length > role.length) { role = prefix; pool = lines; }
    }
    if (!pool) pool = FOLK_BY_LAND[f.def.land] ?? ['...'];
    const k = this.folkCount.get(f) ?? 0;
    this.folkCount.set(f, k + 1);
    const line = pool[k % pool.length];
    const who = (role || id).replace(/-\d+$/, '').replace(/-/g, ' ').toUpperCase();
    say({ name: who, get x() { return f.mesh.position.x; }, get z() { return f.mesh.position.z; } }, line);
    notebook.heard(who, line);
  }
}

export const npcs = new Npcs();

/** The lines for a person, by state: a door taken overrides the phase. */
function linesFor(p: PersonDef, s: NpcState): string[] {
  for (let i = s.doors.length - 1; i >= 0; i--) {
    const L = p.lines[`chose:${s.doors[i]}`];
    if (L?.length) return L;
  }
  const phase: NpcPhase = s.phase;
  if (phase === 'done' && !p.lines.done.length) return p.lines.met;
  return p.lines[phase]?.length ? p.lines[phase] : p.lines.met;
}

/** Define the twelve. Called once by App after the POIs exist. */
export function defineThePeople() {
  for (const p of PEOPLE) {
    npcs.define({
      id: p.id, name: p.name, land: p.land, figures: p.figures, want: p.want,
      lines: (s) => linesFor(p, s),
    });
  }
}
