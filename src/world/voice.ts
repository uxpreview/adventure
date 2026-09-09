import type * as THREE from 'three';
import type { POIManager } from '../engine/POI';
import type { UI } from '../ui/UI';
import type { WorldPOI } from './regions';
import { installSpeech, tickSpeech, say, shout } from '../ui/speech';
import { toast, tickToasts } from '../ui/toast';
import { NotebookPage } from '../ui/notebook';
import { notebook } from './notebook';
import { npcs, defineThePeople } from './npc';
import { knowledge } from './knowledge';
import { things } from './things';
import { worn } from './worn';
import { regionAt, type RegionId } from './layout';
import { clock } from './daylight';
import { CONSEQUENCES, WAIT_PERSON, knowledgeLabel } from './lines';

/**
 * THE VOICE OF THE WORLD — the wiring. One object App constructs and
 * ticks; it watches what the player does (a mount taken, a thing in
 * hand, a place come into range, a fact learned, a door chosen) and
 * answers each on screen within a frame, then reads a choice back
 * within a minute through whoever is nearest.
 */

export type VoiceCtx = {
  ui: UI;
  poi: POIManager;
  camera: THREE.PerspectiveCamera;
  groundAt: (x: number, z: number) => number;
  waterAt: (x: number, z: number) => number;
  walker: () => { x: number; y: number; z: number };
  boat: { aboard: boolean };
  bicycle: { aboard: boolean };
  train: { aboard: boolean };
  seated: () => boolean;
  regionId: () => RegionId;
  started: () => boolean;
};

type Reaction = { at: number; land: RegionId; door: string };
type Touch = { def: WorldPOI; prompt: string; t: number; held: string | null; worn: string | null; moved: boolean };

const short = (name: string) => name.replace(/^THE /, '');

export class Voice {
  page: NotebookPage;
  private elapsed = 0;
  private scanAcc = 0;
  private reactions: Reaction[] = [];
  private touch: Touch | null = null;
  private held: string | null;
  private watching: string | null = null;
  private pushSpeed = new Map<string, number>();
  private pushSaid = new Map<string, number>();
  private boat = false;
  private bicycle = false;
  private train = false;
  private seated = false;
  /** Lands heard of this frame, said together at the end of it. */
  private namesPending: string[] = [];

  constructor(private ctx: VoiceCtx) {
    installSpeech({ root: ctx.ui.root, camera: ctx.camera, groundAt: ctx.groundAt, walker: ctx.walker });
    this.page = new NotebookPage(ctx.ui);
    notebook.setDayClock(() => clock.day);
    npcs.attach(ctx.poi);
    defineThePeople();
    this.held = things.held;
    this.boat = ctx.boat.aboard;
    this.bicycle = ctx.bicycle.aboard;
    this.train = ctx.train.aboard;
    knowledge.onLearn = (id) => this.learned(id);
    ctx.ui.onToggleNotebook = () => this.page.toggle();
  }

  /** Whether the notebook has the screen (App freezes the walker). */
  get open() {
    return this.page.isOpen;
  }

  close() {
    this.page.close();
  }

  /* ---- verbs App tells us about ------------------------------------ */
  read(title: string) {
    toast(`READ: ${title.toUpperCase()}`, 'learned');
  }

  touched(def: WorldPOI) {
    const p = def.prompt;
    const prompt = (typeof p === 'function' ? p() : p) ?? 'TOUCH';
    this.touch = { def, prompt, t: 0, held: things.held, worn: worn.current, moved: false };
  }

  chose(def: WorldPOI, option: { label: string; door: string }) {
    const land = regionAt(def.x, def.z).id;
    const c = CONSEQUENCES[option.door];
    notebook.chose(option.door, option.label, c?.hint ?? '');
    npcs.doorTaken(land, option.door);
    // read back within the minute: six to twenty seconds from now
    this.reactions.push({ at: this.elapsed + 6 + (option.door.length % 7) * 2, land, door: option.door });
  }

  /* ---- knowledge ----------------------------------------------------- */
  private learned(id: string) {
    if (!this.ctx.started()) return;
    if (id.startsWith('door:')) return;
    if (id.startsWith('name:')) {
      // standing in a land is the region card's job, not a toast's
      if (id === `name:${this.ctx.regionId()}`) return;
      // one signpost names three lands: one line, not three
      this.namesPending.push(notebook.landName(id.slice(5)));
      return;
    }
    if (id.startsWith('wear:')) {
      const d = worn.def(id.slice(5));
      toast(`TAKEN: ${d?.name ?? knowledgeLabel(id, (r) => notebook.landName(r))} — YOU ARE WEARING IT`, 'found');
      return;
    }
    const label = knowledgeLabel(id, (r) => notebook.landName(r));
    notebook.learn(label);
    toast(`YOU LEARNED: ${label}`, 'learned');
  }

  /* ---- the frame ------------------------------------------------------ */
  tick(dt: number) {
    tickSpeech(dt);
    tickToasts(dt);
    if (!this.ctx.started()) return;
    this.elapsed += dt;
    const w = this.ctx.walker();
    npcs.walker.x = w.x;
    npcs.walker.z = w.z;

    this.scanAcc += dt;
    if (this.scanAcc > 0.3) {
      this.scanAcc = 0;
      npcs.scanFolk();
      this.scanPlaces();
    }
    this.flushNames();
    this.diffHand();
    this.diffPushables(dt);
    this.diffMounts();
    this.diffTouch(dt);
    this.fireReactions();
  }

  /** "YOU HEARD OF: BRIM, LONGSHORE AND THE HARROW DOWNS" — one toast. */
  private flushNames() {
    if (!this.namesPending.length) return;
    const n = this.namesPending.splice(0);
    const list = n.length === 1 ? n[0] : `${n.slice(0, -1).join(', ')} AND ${n[n.length - 1]}`;
    toast(`YOU HEARD OF: ${list}`, 'learned');
  }

  /** A named place whose label has come into range is found. */
  private scanPlaces() {
    // eyes shut: the walker is between two places and has found neither
    if (this.ctx.ui.blinking) return;
    for (const p of this.ctx.poi.pois) {
      const d = p.def as WorldPOI & { npc?: boolean };
      if (!d.label || d.npc || !p.enabled) continue;
      if (!p.inRange && !p.labelEl?.classList.contains('show')) continue;
      const have = notebook.placeNamed(d.label);
      if (have?.seen) continue;
      notebook.place(d.label, d.x, d.z, { seen: true });
    }
  }

  private diffHand() {
    const now = things.held;
    if (now !== this.held) {
      if (now) {
        const t = things.get(now);
        toast(`IN HAND: ${t?.def.name ?? now.toUpperCase()}`, 'found');
        this.watching = null;
      } else if (this.held) {
        const t = things.get(this.held);
        const name = t?.def.name ?? this.held.toUpperCase();
        if (t?.state === 'flying') { toast(`THROWN: ${name}`, 'plain'); this.watching = this.held; }
        else if (t?.state === 'gone') toast(`${name} — GONE`, 'plain');
        else toast(`PUT DOWN: ${name}`, 'plain');
      }
      this.held = now;
    }
    if (this.watching) {
      const t = things.get(this.watching);
      if (!t || t.state === 'held') this.watching = null;
      else if (t.state === 'gone') { toast('THE WELL HAS IT', 'plain'); this.watching = null; }
      else if (t.state === 'ground') {
        const name = t.def.name;
        if (t.skips > 0) toast(`${short(name)}: ${t.skips} ${t.skips === 1 ? 'SKIP' : 'SKIPS'}`, 'score');
        else if (this.ctx.waterAt(t.x, t.z) > 0.12) toast(`${short(name)}: PLOP`, 'plain');
        else if (t.def.glide) toast(`${name} COMES DOWN`, 'plain');
        else toast(`${name} LANDS`, 'plain');
        this.watching = null;
      }
    }
  }

  private diffPushables(dt: number) {
    for (const t of things.all) {
      if (t.def.kind !== 'pushable') continue;
      const sp = Math.hypot(t.vx, t.vz);
      const was = this.pushSpeed.get(t.def.id) ?? 0;
      this.pushSpeed.set(t.def.id, sp);
      if (was < 0.3 && sp > 0.6) {
        const last = this.pushSaid.get(t.def.id) ?? -10;
        if (this.elapsed - last > 2) {
          this.pushSaid.set(t.def.id, this.elapsed);
          toast(`${t.def.name} ROLLS`, 'plain');
        }
        if (this.touch) this.touch.moved = true;
      }
    }
    void dt;
  }

  private diffMounts() {
    const c = this.ctx;
    if (c.boat.aboard !== this.boat) {
      this.boat = c.boat.aboard;
      toast(this.boat ? 'THE OARS ARE YOURS. ROW ANYWHERE THE WATER GOES.' : 'ASHORE', this.boat ? 'found' : 'plain');
    }
    if (c.bicycle.aboard !== this.bicycle) {
      this.bicycle = c.bicycle.aboard;
      toast(this.bicycle ? 'ON THE BICYCLE. E RINGS THE BELL.' : 'OFF THE BICYCLE', this.bicycle ? 'found' : 'plain');
    }
    if (c.train.aboard !== this.train) {
      this.train = c.train.aboard;
      toast(this.train ? 'ABOARD THE 8:15' : 'OFF THE 8:15', this.train ? 'found' : 'plain');
    }
    const s = c.seated();
    if (s !== this.seated) {
      this.seated = s;
      if (s) toast('YOU SIT. THE DAY RUNS SIX TIMES FASTER.', 'plain');
    }
  }

  /** A touch that nothing else answered gets the prompt back, ticked. */
  private diffTouch(dt: number) {
    const t = this.touch;
    if (!t) return;
    t.t += dt;
    if (t.t < 0.35) return;
    this.touch = null;
    if (t.moved || things.held !== t.held || worn.current !== t.worn) return;
    const p = t.prompt.toUpperCase();
    if (p.startsWith('PUSH') || p.startsWith('SHOVE')) {
      toast('IT WILL NOT BUDGE', 'plain');
      return;
    }
    toast(p, 'done');
  }

  private fireReactions() {
    if (!this.reactions.length) return;
    const keep: Reaction[] = [];
    for (const r of this.reactions) {
      if (this.elapsed < r.at) { keep.push(r); continue; }
      const id = WAIT_PERSON[r.land];
      const n = npcs.get(id);
      const pos = npcs.positionOf(id);
      const w = this.ctx.walker();
      const near = pos && pos.present && Math.hypot(pos.x - w.x, pos.z - w.z) < 45;
      if (n && near) {
        const lines = n.def.lines(npcs.state(id));
        const line = lines[0];
        say(n.speaker, line);
        notebook.heard(n.def.name, line);
        npcs.state(id).said = 1;
      } else {
        shout(CONSEQUENCES[r.door]?.shout ?? 'THE WORLD TAKES NOTE');
      }
    }
    this.reactions = keep;
  }
}
