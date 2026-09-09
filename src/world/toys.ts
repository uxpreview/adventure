import * as THREE from 'three';
import { makeStandee, makeDecal } from '../engine/props';
import { billboard } from '../engine/billboard';
import { letterEl, S } from '../ui/lettering';
import { toast } from '../ui/toast';
import { notebook } from './notebook';
import { things } from './things';
import { knowledge } from './knowledge';
import { SANDBAR } from './layout';
import type { WorldPOI } from './regions';
import {
  scoreSignTexture, raceLineDecal, officePlaneTexture, skimStoneTexture,
} from './textures-monsters';

/**
 * THE TOYS (THINGS TO DO) — four things with a score, and a sign drawn
 * in ink beside each one that shows your best in hand-lettering.
 *
 *   SKIMMING    the bar's stone, and a second stone at the tarn once
 *               Brack lets you near the water. Skips are the score.
 *   THE PLANE   a timetable folded into a dart, in the office park,
 *               once Dennis has no more use for the board. Paces.
 *   TIME TRIAL  the bicycle, main street, START to FINISH. Seconds,
 *               and lower is better, with a timer running on screen.
 *   THE CHAIR   the office chair, sat on, rolled from the atrium. Paces.
 *
 * Every toy toasts the score the second it lands and says A NEW BEST
 * when it is. Bests live in `notebook.scores`, saved with the notebook.
 */

const say = (name: string) => {
  try { window.dispatchEvent(new CustomEvent('inklands:event', { detail: name })); } catch { /* no ears */ }
};

export type ToyCtx = {
  scene: THREE.Scene;
  groundAt: (x: number, z: number) => number;
  waterAt: (x: number, z: number) => number;
  walker: () => { x: number; y: number; z: number };
  bicycle: { aboard: boolean };
  root: HTMLElement;
};

/* ------------------------------------------------------------------ *
 * THE THINGS THE TOYS ADD
 * ------------------------------------------------------------------ */
const TARN_STONE_HOME = { x: 150, z: -178.5 };
things.register({ id: 'tarn-stone', kind: 'carriable', land: 'forest', home: TARN_STONE_HOME, name: 'THE STONE', skims: 3 });
const PLANE_HOME = { x: 283, z: 186.5 };
things.register({ id: 'office-plane', kind: 'carriable', land: 'office', home: PLANE_HOME, name: 'THE PLANE', glide: 7 });

/** Where the bar's stone lies: a point along the sandbar's spine. */
function alongBar(k: number): { x: number; z: number; ax: number; az: number } {
  let total = 0;
  const segs: number[] = [];
  for (let i = 0; i < SANDBAR.length - 1; i++) {
    const d = Math.hypot(SANDBAR[i + 1][0] - SANDBAR[i][0], SANDBAR[i + 1][1] - SANDBAR[i][1]);
    segs.push(d);
    total += d;
  }
  let want = k * total;
  for (let i = 0; i < segs.length; i++) {
    if (want <= segs[i]) {
      const t = want / segs[i];
      const ax = (SANDBAR[i + 1][0] - SANDBAR[i][0]) / segs[i];
      const az = (SANDBAR[i + 1][1] - SANDBAR[i][1]) / segs[i];
      return { x: SANDBAR[i][0] + ax * want, z: SANDBAR[i][1] + az * want, ax, az };
    }
    want -= segs[i];
  }
  const l = SANDBAR[SANDBAR.length - 1];
  return { x: l[0], z: l[1], ax: 1, az: 0 };
}
const BAR_SIGN = (() => { const p = alongBar(0.24); return { x: p.x + p.az * 1.6, z: p.z - p.ax * 1.6 }; })();

/* THE TIME TRIAL'S COURSE: main street, west to east. */
const START = { x: -8, z: 202 };
const FINISH = { x: 90, z: 200 };
const TRIAL_MAX_S = 90;

const CHAIR_ID = 'office-chair';

/* ------------------------------------------------------------------ *
 * THE SCOREBOARD
 * ------------------------------------------------------------------ */
class ScoreSign {
  mesh: THREE.Mesh;
  private aria: HTMLElement;
  private tex: THREE.Texture | null = null;
  private text = '';
  private shown = false;
  constructor(private ctx: ToyCtx, private x: number, private z: number, private seed: number, private title: string) {
    this.mesh = makeStandee(scoreSignTexture(seed, title, '', ''), 2.3, 2.7);
    this.mesh.position.set(x, ctx.groundAt(x, z), z);
    billboard(this.mesh, 0, 'front');
    ctx.scene.add(this.mesh);
    this.aria = document.createElement('div');
    this.aria.className = 'sign-aria';
    this.aria.style.cssText = 'position:absolute;left:-9999px;top:0;width:1px;height:1px;overflow:hidden;opacity:1;pointer-events:none;';
  }
  /** The board's words: the value big, a note small. */
  set(value: string, note: string) {
    const text = `${this.title}: ${value}${note ? ' — ' + note.toLowerCase() : ''}`;
    if (text === this.text) return;
    this.text = text;
    const old = this.tex;
    this.tex = scoreSignTexture(this.seed, this.title, value, note);
    (this.mesh.material as THREE.MeshBasicMaterial).map = this.tex;
    (this.mesh.material as THREE.MeshBasicMaterial).needsUpdate = true;
    old?.dispose();
    this.aria.setAttribute('aria-label', text);
  }
  /** The mirror for the harness and screen readers, near enough to read. */
  tick(px: number, pz: number) {
    this.mesh.position.y = this.ctx.groundAt(this.x, this.z);
    const near = Math.hypot(px - this.x, pz - this.z) < 26;
    if (near && !this.shown) { this.ctx.root.appendChild(this.aria); this.shown = true; }
    else if (!near && this.shown) { this.aria.remove(); this.shown = false; }
  }
}

/* ------------------------------------------------------------------ *
 * THE MODULE
 * ------------------------------------------------------------------ */
class Toys {
  private ctx: ToyCtx | null = null;
  private signs: Record<string, ScoreSign[]> = {};
  private unlockedNow = new Set<string>();
  private prevState = new Map<string, string>();
  private throwFrom = new Map<string, { x: number; z: number }>();
  private stoneMesh: THREE.Mesh | null = null;
  private planeMesh: THREE.Mesh | null = null;
  /** The trial: −1 off, else seconds on the harness clock. */
  private trialT = -1;
  private trialDrawn = -1;
  private timerEl: HTMLElement | null = null;
  private chairRoll: { x: number; z: number } | null = null;
  private chairWasMoving = false;
  private elapsed = 0;

  init(ctx: ToyCtx) {
    this.ctx = ctx;
    const stone = things.get('tarn-stone')!;
    const plane = things.get('office-plane')!;
    stone.def.hand = skimStoneTexture(9301);
    stone.def.handSize = [0.34, 0.24];
    plane.def.hand = officePlaneTexture(9302);
    plane.def.handSize = [0.6, 0.3];
    this.stoneMesh = makeStandee(skimStoneTexture(9303), 0.7, 0.46);
    this.planeMesh = makeStandee(officePlaneTexture(9304), 1.4, 0.7);
    for (const m of [this.stoneMesh, this.planeMesh]) { billboard(m, 0, 'front'); ctx.scene.add(m); }

    // the signs: skimming at the bar and the tarn, the plane, the trial's two ends, the chair
    this.signs['SKIMMING'] = [
      new ScoreSign(ctx, BAR_SIGN.x, BAR_SIGN.z, 9310, 'BEST SKIM'),
      new ScoreSign(ctx, TARN_STONE_HOME.x + 3.2, TARN_STONE_HOME.z - 1.2, 9311, 'BEST SKIM'),
    ];
    this.signs['THE PLANE'] = [new ScoreSign(ctx, PLANE_HOME.x + 6.5, PLANE_HOME.z - 0.5, 9312, 'BEST THROW')];
    this.signs['TIME TRIAL'] = [
      new ScoreSign(ctx, START.x, START.z + 4.2, 9313, 'MAIN STREET TRIAL'),
      new ScoreSign(ctx, FINISH.x, FINISH.z + 4.2, 9314, 'MAIN STREET TRIAL'),
    ];
    this.signs['THE CHAIR'] = [new ScoreSign(ctx, 295, 207.5, 9315, 'BEST ROLL')];
    // the lines across the road
    for (const [p, word, seed] of [[START, 'START', 9320], [FINISH, 'FINISH', 9321]] as const) {
      const d = makeDecal(raceLineDecal(seed, word), 6.5, 1.6, 0.9);
      d.position.set(p.x, ctx.groundAt(p.x, p.z) + 0.04, p.z);
      d.rotation.y = Math.PI / 2;
      ctx.scene.add(d);
    }
    this.refreshSigns();
  }

  /* ---- what is unlocked ------------------------------------------- */
  unlock(id: string) {
    if (this.unlockedNow.has(id)) return;
    this.unlockedNow.add(id);
    if (id === 'tarn-stone') toast('A STONE THAT SKIMS LIES AT THE TARN NOW', 'found');
    if (id === 'office-plane') toast('DENNIS FOLDED THE TIMETABLE. THE PLANE IS BY THE ATRIUM.', 'found');
  }
  unlocked(id: string): boolean {
    if (this.unlockedNow.has(id)) return true;
    if (id === 'tarn-stone') return knowledge.has('fact:the-tarn') || knowledge.decided('forest') || !!notebook.list().find((j) => j.id === 'job:brack' && j.complete);
    if (id === 'office-plane') return !!notebook.list().find((j) => j.id === 'job:dennis' && j.complete);
    return false;
  }

  /* ---- the score -------------------------------------------------- */
  /** Write a score; toast it this frame; BEST when it is. Lower can be
   *  better (a time). */
  record(toy: string, value: number, fmt: (v: number) => string, lower = false) {
    const best = notebook.scores[toy];
    const isBest = best === undefined || (lower ? value < best : value > best);
    if (isBest) {
      notebook.scores[toy] = value;
      notebook.dirty = true;
    }
    toast(`${toy}: ${fmt(value)}${isBest && best !== undefined ? ' — A NEW BEST' : isBest ? ' — YOUR FIRST' : ''}`, 'score');
    say('score');
    this.refreshSigns();
  }

  private fmt: Record<string, (v: number) => string> = {
    'SKIMMING': (v) => `${v} ${v === 1 ? 'SKIP' : 'SKIPS'}`,
    'THE PLANE': (v) => `${v} PACES`,
    'TIME TRIAL': (v) => `${v.toFixed(1)} S`,
    'THE CHAIR': (v) => `${v} PACES`,
  };

  private refreshSigns() {
    for (const [toy, signs] of Object.entries(this.signs)) {
      const best = notebook.scores[toy];
      const value = best === undefined ? 'NO BEST YET' : this.fmt[toy](best);
      const note = best === undefined
        ? (toy === 'TIME TRIAL' ? 'BICYCLE. START TO FINISH.' : toy === 'THE CHAIR' ? 'SIT. IT ROLLS.' : toy === 'THE PLANE' ? 'THROW IT AT A RUN.' : 'THROW IT AT A RUN, OVER WATER.')
        : 'YOUR BEST';
      for (const s of signs) s.set(value, note);
    }
  }

  /* ---- the frame -------------------------------------------------- */
  tick(dt: number) {
    const ctx = this.ctx;
    if (!ctx) return;
    this.elapsed += dt;
    const w = ctx.walker();
    for (const signs of Object.values(this.signs)) for (const s of signs) s.tick(w.x, w.z);
    this.drawThing('tarn-stone', this.stoneMesh!);
    this.drawThing('office-plane', this.planeMesh!);
    this.skimming('bar-stone');
    this.skimming('tarn-stone');
    this.plane('office-plane');
    this.trial(dt, w);
    this.chair();
  }

  /** A thing this module owns the drawing of: on the ground, in the air,
   *  or in the hand (then the walker draws it). */
  private drawThing(id: string, m: THREE.Mesh) {
    const t = things.get(id)!;
    const ctx = this.ctx!;
    if (!this.unlocked(id)) { m.visible = false; return; }
    const fp = things.flyPos(t);
    if (fp) { m.visible = true; m.position.set(fp.x, fp.y, fp.z); return; }
    if (t.state === 'ground') { m.visible = true; m.position.set(t.x, ctx.groundAt(t.x, t.z), t.z); return; }
    m.visible = false;
  }

  /** SKIMMING: how many skips a throw gets depends on the throw, so a
   *  run-up matters: the stone's skips are set from the flight the
   *  moment it leaves the hand. Score when it comes to rest. */
  private skimming(id: string) {
    const t = things.get(id);
    if (!t) return;
    const was = this.prevState.get(id);
    this.prevState.set(id, t.state);
    if (was === 'held' && t.state === 'flying' && t.fly) {
      const d = Math.hypot(t.fly.x1 - t.fly.x0, t.fly.z1 - t.fly.z0);
      t.def.skims = Math.max(1, Math.min(9, Math.round(d * 1.25)));
    }
    if (was === 'flying' && t.state === 'ground') {
      if (t.skips > 0) this.record('SKIMMING', t.skips, this.fmt['SKIMMING']);
    }
  }

  /** THE PLANE: paces from the hand to where it came down. */
  private plane(id: string) {
    const t = things.get(id);
    if (!t) return;
    const key = `plane:${id}`;
    const was = this.prevState.get(key);
    this.prevState.set(key, t.state);
    if (was === 'held' && t.state === 'flying' && t.fly) {
      if (t.fly.thrown) this.throwFrom.set(id, { x: t.fly.x0, z: t.fly.z0 });
      else this.throwFrom.delete(id);
    }
    if (was === 'flying' && t.state === 'ground') {
      const from = this.throwFrom.get(id);
      if (from) {
        this.throwFrom.delete(id);
        this.record('THE PLANE', Math.round(Math.hypot(t.x - from.x, t.z - from.z)), this.fmt['THE PLANE']);
      }
    }
  }

  /** THE TIME TRIAL: on the bicycle over START, the timer runs on
   *  screen; over FINISH it stops and scores; off the bike it is off. */
  private trial(dt: number, w: { x: number; z: number }) {
    const ctx = this.ctx!;
    const aboard = ctx.bicycle.aboard;
    if (this.trialT < 0) {
      if (aboard && Math.hypot(w.x - START.x, w.z - START.z) < 3.2) {
        this.trialT = 0;
        this.trialDrawn = -1;
        toast('GO. FINISH IS EAST, PAST THE BRIDGE.', 'score');
        say('bicycle-bell');
      }
      return;
    }
    this.trialT += dt;
    if (!aboard) {
      this.trialT = -1;
      this.hideTimer();
      toast('TRIAL OFF. STAY ON THE BICYCLE.', 'plain');
      return;
    }
    if (this.trialT > TRIAL_MAX_S) {
      this.trialT = -1;
      this.hideTimer();
      toast('TRIAL OFF. THAT WAS A SIGHTSEEING TOUR.', 'plain');
      return;
    }
    if (Math.hypot(w.x - FINISH.x, w.z - FINISH.z) < 4.2) {
      const time = Math.round(this.trialT * 10) / 10;
      this.trialT = -1;
      this.hideTimer();
      this.record('TIME TRIAL', time, this.fmt['TIME TRIAL'], true);
      say('bicycle-bell');
      return;
    }
    // the running timer, redrawn ten times a second of game time
    const tenth = Math.floor(this.trialT * 10);
    if (tenth !== this.trialDrawn) {
      this.trialDrawn = tenth;
      this.showTimer(`${(tenth / 10).toFixed(1)} S`);
    }
  }

  private showTimer(text: string) {
    const ctx = this.ctx!;
    if (!this.timerEl) {
      this.timerEl = document.createElement('div');
      this.timerEl.className = 'toy-timer';
      this.timerEl.style.cssText = 'position:absolute;left:50%;top:14%;transform:translateX(-50%);pointer-events:none;z-index:36;padding:4px 14px;background:rgba(245,242,234,0.82);border-radius:46% 42% 48% 44% / 50% 46% 54% 48%;';
      ctx.root.appendChild(this.timerEl);
    }
    letterEl(this.timerEl, text, { ...S.voice(16), alpha: 0.92 });
  }
  private hideTimer() {
    this.timerEl?.remove();
    this.timerEl = null;
  }

  /** THE CHAIR: from where it started rolling to where it stopped. */
  private chair() {
    const c = things.get(CHAIR_ID);
    if (!c) return;
    const sp = Math.hypot(c.vx, c.vz);
    const moving = sp > 0.35;
    if (moving && !this.chairWasMoving) this.chairRoll = { x: c.x, z: c.z };
    if (!moving && this.chairWasMoving && this.chairRoll) {
      const d = Math.hypot(c.x - this.chairRoll.x, c.z - this.chairRoll.z);
      this.chairRoll = null;
      if (d >= 1) this.record('THE CHAIR', Math.round(d), this.fmt['THE CHAIR']);
    }
    this.chairWasMoving = moving;
  }

  /** Whether the trial is running, for the harness. */
  get trialRunning() { return this.trialT >= 0; }
}

export const toys = new Toys();

/** The toys' places: pick up the stone, pick up the plane. */
export const TOY_POIS: WorldPOI[] = [
  {
    get x() { return things.get('tarn-stone')!.x; },
    get z() { return things.get('tarn-stone')!.z; },
    get enabled() { return toys.unlocked('tarn-stone') && things.get('tarn-stone')!.state === 'ground'; },
    set enabled(_v: boolean) { /* the registry decides */ },
    radius: 2.6,
    prompt: 'PICK UP THE STONE',
    touch: () => { things.pickUp('tarn-stone'); },
  } as unknown as WorldPOI,
  {
    get x() { return things.get('office-plane')!.x; },
    get z() { return things.get('office-plane')!.z; },
    get enabled() { return toys.unlocked('office-plane') && things.get('office-plane')!.state === 'ground'; },
    set enabled(_v: boolean) { /* the registry decides */ },
    radius: 2.6,
    prompt: 'PICK UP THE PLANE',
    touch: () => { things.pickUp('office-plane'); },
  } as unknown as WorldPOI,
];
