import * as THREE from 'three';
import { billboard } from '../engine/billboard';
import { say, shout } from '../ui/speech';
import { toast } from '../ui/toast';
import { notebook } from './notebook';
import { worn } from './worn';
import { rooms } from './rooms';
import { events } from './events';
import { clock } from './daylight';
import { ROADS } from './layout';
import {
  monsterSheet, stolenHatTexture, MONSTER_FRAMES, MONSTER_FW, MONSTER_FH, type MonsterKind,
} from './textures-monsters';

/**
 * THE MONSTERS (THINGS TO DO). Three of them, drawn in ink: one in the
 * Penwood after dark, one on the floor of the canyon, one under the
 * pier. They notice you inside twenty-five units, growl, and chase at
 * just under the run. Lamplight and doors stop them: get inside a room
 * or under a lit lamp and they give up. Caught, the consequence is
 * comic and read back — they take your hat and wear it, you wake on
 * the nearest road, and the hat is back on the road at dawn.
 *
 * NIGHT is a reason to get indoors: when the lamps come on the world
 * says so, out loud, once a night.
 */

const sound = (name: string) => {
  try { window.dispatchEvent(new CustomEvent('inklands:event', { detail: name })); } catch { /* no ears */ }
};

export type MonsterCtx = {
  scene: THREE.Scene;
  groundAt: (x: number, z: number) => number;
  walker: () => { x: number; y: number; z: number };
  /** Put the walker down somewhere else, eyes shut for the cut. */
  wake: (x: number, z: number) => void;
  blink: (cut: () => void) => void;
  started: () => boolean;
  /** Aboard anything: a monster does not chase a train. */
  mounted: () => boolean;
};

type MonsterDef = {
  id: string;
  name: string;
  kind: MonsterKind;
  lair: { x: number; z: number };
  /** How far it wanders from the lair while lurking. */
  roam: number;
  /** Beyond this from the lair it gives up. */
  giveUp: number;
  nightOnly: boolean;
  speed: number;
  w: number;
  /** What it says when it sees you, and when it has you. */
  growl: string;
  caught: string;
  /** The smell the hat comes back with. */
  smell: string;
};

const NOTICE = 25;
const CATCH = 1.4;
const LAMP_R = 6.5;

const DEFS: MonsterDef[] = [
  {
    id: 'the-pine-thing', name: 'THE PINE THING', kind: 'pine', lair: { x: 186, z: -238 }, roam: 26, giveUp: 80,
    nightOnly: true, speed: 4.05, w: 3.2,
    growl: 'HRRRNK.', caught: 'HAT. MINE. GOOD HAT.', smell: 'PINE',
  },
  {
    id: 'the-cut-lurker', name: 'THE CUT LURKER', kind: 'cut', lair: { x: 296, z: -205 }, roam: 22, giveUp: 62,
    nightOnly: false, speed: 3.9, w: 3.6,
    growl: 'KRRK. KRRK.', caught: 'FLAT. LIKE ME. STAY.', smell: 'DUST',
  },
  {
    id: 'the-pier-thing', name: 'THE PIER THING', kind: 'pier', lair: { x: -246, z: 56 }, roam: 10, giveUp: 58,
    nightOnly: false, speed: 4.1, w: 3.0,
    growl: 'BLORP.', caught: 'DAMP NOW. YOU. DAMP.', smell: 'WEED',
  },
];

/** LAMPS THAT STOP THEM: lit street lamps, by position and by hour. */
const LAMPS: { x: number; z: number; lit: () => boolean }[] = [
  // Brim's four
  ...[[-58.5, -65], [-33, -65.5], [-32, -96], [-58, -96.5]].map(([x, z]) => ({ x, z, lit: () => clock.lamp > 0.3 })),
  // the jetty lamp on Longshore, and the van's
  { x: -255.2, z: 51.6, lit: () => events.progress('the-jetty-lamp') >= 0 || clock.lamp > 0.6 },
  { x: -213, z: -41, lit: () => clock.lamp > 0.3 },
  // Val's porch, which is never off, and the atrium's doors
  { x: -78, z: 130, lit: () => true },
  { x: 283, z: 173, lit: () => clock.lamp > 0.3 },
  // the 8:15 stop's shelter, and Amos's catch
  { x: 251.2, z: 199.2, lit: () => clock.lamp > 0.3 },
  { x: 302, z: 95, lit: () => clock.lamp > 0.3 },
];

type Monster = {
  def: MonsterDef;
  sprite: THREE.Mesh;
  tex: THREE.CanvasTexture;
  hat: THREE.Mesh;
  x: number;
  z: number;
  face: number;
  state: 'lurk' | 'chase' | 'return';
  frame: number;
  animT: number;
  wander: number;
  chaseSoundT: number;
  growled: boolean;
  hasHat: boolean;
};

class Monsters {
  private ctx: MonsterCtx | null = null;
  private list: Monster[] = [];
  private hatTaken: string | null = null;
  private hatBy: Monster | null = null;
  private nightWas: boolean | null = null;
  /** For the harness: how many times the walker has been caught. */
  caught = 0;
  private elapsed = 0;

  init(ctx: MonsterCtx) {
    this.ctx = ctx;
    const hatTex = stolenHatTexture(9501);
    DEFS.forEach((def, i) => {
      const h = def.w * (MONSTER_FH / MONSTER_FW);
      const geo = new THREE.PlaneGeometry(def.w, h);
      geo.translate(0, h * 0.5, 0);
      const tex = monsterSheet(def.kind, 9510 + i);
      const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.1, side: THREE.DoubleSide });
      const sprite = new THREE.Mesh(geo, mat);
      sprite.renderOrder = 2;
      const hatGeo = new THREE.PlaneGeometry(0.9, 0.6);
      hatGeo.translate(0, h * 0.96, 0.02);
      const hat = new THREE.Mesh(hatGeo, new THREE.MeshBasicMaterial({ map: hatTex, transparent: true, alphaTest: 0.1, side: THREE.DoubleSide }));
      hat.visible = false;
      sprite.add(hat);
      billboard(sprite, 0, 'front');
      ctx.scene.add(sprite);
      this.list.push({
        def, sprite, tex, hat, x: def.lair.x, z: def.lair.z, face: 1, state: 'lurk', frame: 0, animT: 0,
        wander: i * 2.1, chaseSoundT: 0, growled: false, hasHat: false,
      });
    });
  }

  /** Where each one is, for the harness. */
  get all() {
    return this.list.map((m) => ({ id: m.def.id, x: m.x, z: m.z, state: m.state, hasHat: m.hasHat, out: m.sprite.visible }));
  }

  /** Whether (x, z) is somewhere a monster will not follow. */
  static safe(x: number, z: number): boolean {
    if (rooms.at(x, z)) return true;
    for (const l of LAMPS) if (l.lit() && Math.hypot(l.x - x, l.z - z) < LAMP_R) return true;
    return false;
  }

  private isOut(m: Monster): boolean {
    return !m.def.nightOnly || clock.lamp > 0.45;
  }

  tick(dt: number) {
    const ctx = this.ctx;
    if (!ctx || !ctx.started()) return;
    this.elapsed += dt;
    this.night();
    const w = ctx.walker();
    const safe = Monsters.safe(w.x, w.z) || ctx.mounted();
    for (const m of this.list) {
      const out = this.isOut(m);
      m.sprite.visible = out;
      if (!out) { m.state = 'lurk'; m.growled = false; continue; }
      const dW = Math.hypot(w.x - m.x, w.z - m.z);
      const dLairW = Math.hypot(w.x - m.def.lair.x, w.z - m.def.lair.z);
      if (m.state === 'lurk') {
        // a slow wander round the lair
        m.wander += dt * 0.35;
        const tx = m.def.lair.x + Math.cos(m.wander) * m.def.roam * 0.6;
        const tz = m.def.lair.z + Math.sin(m.wander * 0.7) * m.def.roam * 0.6;
        this.stepToward(m, tx, tz, 0.9, dt);
        if (dW < NOTICE && !safe && dLairW < m.def.giveUp) {
          m.state = 'chase';
          m.chaseSoundT = 0;
          if (!m.growled) {
            m.growled = true;
            sound('growl');
            say(this.speaker(m), m.def.growl, { hold: 2.2 });
            toast(`${m.def.name} HAS SEEN YOU. RUN FOR A LAMP OR A DOOR.`, 'plain');
          }
        }
      } else if (m.state === 'chase') {
        if (safe || dLairW > m.def.giveUp || dW > NOTICE * 2.2) {
          m.state = 'return';
          say(this.speaker(m), safe ? 'LIGHT. NO.' : 'FAR. TIRED.', { hold: 2 });
          toast(safe ? 'IT WILL NOT COME INTO THE LIGHT.' : 'IT GAVE UP. IT IS GOING HOME.', 'done');
          continue;
        }
        this.stepToward(m, w.x, w.z, m.def.speed, dt);
        m.chaseSoundT -= dt;
        if (m.chaseSoundT <= 0) { m.chaseSoundT = 1.5; sound('chase'); }
        if (dW < CATCH) this.catchWalker(m);
      } else {
        // going home; lurk again at the lair
        const d = this.stepToward(m, m.def.lair.x, m.def.lair.z, m.def.speed * 0.6, dt);
        if (d < 1.5) { m.state = 'lurk'; m.growled = false; }
      }
      // the drawing: which frame, which way, where
      m.animT += dt;
      const running = m.state !== 'lurk';
      const f = running ? 1 + (Math.floor(m.animT / 0.16) % 2) : 0;
      if (f !== m.frame) { m.frame = f; m.tex.offset.x = f / MONSTER_FRAMES; }
      m.sprite.position.set(m.x, ctx.groundAt(m.x, m.z), m.z);
      m.sprite.scale.x = m.face;
      m.hat.visible = m.hasHat;
    }
    this.dawnHat();
  }

  private speaker(m: Monster) {
    return { name: m.def.name, get x() { return m.x; }, get z() { return m.z; }, y: m.def.w * (MONSTER_FH / MONSTER_FW) + 0.3 };
  }

  private stepToward(m: Monster, tx: number, tz: number, speed: number, dt: number): number {
    const dx = tx - m.x;
    const dz = tz - m.z;
    const d = Math.hypot(dx, dz);
    if (d < 1e-3) return d;
    const step = Math.min(d, speed * dt);
    m.x += (dx / d) * step;
    m.z += (dz / d) * step;
    if (Math.abs(dx) > 0.2) m.face = dx > 0 ? -1 : 1;
    return d - step;
  }

  /** CAUGHT. Comic, and read back: the hat, the road, the line. */
  private catchWalker(m: Monster) {
    const ctx = this.ctx!;
    this.caught++;
    sound('roar');
    const had = worn.current;
    let line: string;
    if (had && !this.hatTaken) {
      this.hatTaken = had;
      this.hatBy = m;
      m.hasHat = true;
      worn.put(null);
      const name = worn.def(had)?.name ?? 'YOUR HAT';
      line = `CAUGHT. IT TOOK ${name}. IT LOOKS GOOD ON IT.`;
    } else if (this.hatTaken) {
      line = 'CAUGHT AGAIN. IT ALREADY HAS YOUR HAT. IT SEEMED EMBARRASSED.';
    } else {
      line = 'CAUGHT. YOU HAD NO HAT. IT TOOK THE IDEA OF ONE.';
    }
    say(this.speaker(m), m.def.caught, { hold: 2.5 });
    notebook.heard(m.def.name, m.def.caught);
    toast(line, 'plain');
    m.state = 'return';
    // the walker wakes on the nearest road that is not the monster's
    const w = ctx.walker();
    const road = nearestRoad(w.x, w.z, m.def.lair, m.def.giveUp * 0.7);
    ctx.blink(() => {
      ctx.wake(road.x, road.z);
      toast('YOU WAKE ON THE ROAD. NOTHING HURTS. IT WAS QUITE POLITE ABOUT IT.', 'plain');
      shout(this.caught === 1 ? 'THE MONSTERS ARE REAL. LAMPS AND DOORS STOP THEM.' : 'CAUGHT AGAIN. LAMPS. DOORS.');
      notebook.learn('MONSTERS COME OUT AT NIGHT. LAMPLIGHT AND DOORS STOP THEM');
    });
  }

  /** The hat comes back at dawn. */
  private dawnHat() {
    if (!this.hatTaken || clock.lamp > 0.05) return;
    const id = this.hatTaken;
    const by = this.hatBy;
    this.hatTaken = null;
    this.hatBy = null;
    if (by) by.hasHat = false;
    worn.put(id);
    const name = worn.def(id)?.name ?? 'YOUR HAT';
    toast(`${name} WAS ON THE ROAD THIS MORNING. IT SMELLS OF ${by?.def.smell ?? 'NIGHT'}.`, 'found');
  }

  /** NIGHT FALLS: once, when the lamps come on; and morning, once. */
  private night() {
    const isNight = clock.lamp > 0.5;
    if (this.nightWas === null) { this.nightWas = isNight; return; }
    if (isNight && !this.nightWas) {
      sound('night-falls');
      shout('NIGHT. THE MONSTERS ARE OUT. GET INDOORS.');
      notebook.learn('MONSTERS COME OUT AT NIGHT. LAMPLIGHT AND DOORS STOP THEM');
    } else if (!isNight && this.nightWas) {
      shout('MORNING. THE MONSTERS HAVE GONE IN.');
    }
    this.nightWas = isNight;
  }
}

/** The nearest point on any road to (x, z), at least `keepOff` from
 *  `from` — so a walker caught on the ring road round the tarn does not
 *  wake on the ring road round the tarn. */
function nearestRoad(x: number, z: number, from: { x: number; z: number }, keepOff: number): { x: number; z: number } {
  let best = { x, z };
  let bd = Infinity;
  for (const road of ROADS) {
    for (let i = 0; i < road.pts.length - 1; i++) {
      const [ax, az] = road.pts[i];
      const [bx, bz] = road.pts[i + 1];
      const vx = bx - ax;
      const vz = bz - az;
      const L2 = vx * vx + vz * vz || 1;
      // sample the segment: the nearest point that is far enough away
      for (let k = 0; k <= 8; k++) {
        const t = Math.max(0, Math.min(1, ((x - ax) * vx + (z - az) * vz) / L2)) * (k === 0 ? 1 : 0) + (k > 0 ? k / 8 : 0);
        const px = ax + vx * t;
        const pz = az + vz * t;
        if (Math.hypot(px - from.x, pz - from.z) < keepOff) continue;
        const d = Math.hypot(px - x, pz - z);
        if (d < bd) { bd = d; best = { x: px, z: pz }; }
      }
    }
  }
  return best;
}

export const monsters = new Monsters();
export const monsterSafe = (x: number, z: number) => Monsters.safe(x, z);
