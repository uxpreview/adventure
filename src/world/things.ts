import * as THREE from 'three';
import { REGION_SPECS, type RegionId, type Rect } from './layout';

/**
 * THINGS — what the walker can move, and where it is now.
 *
 * Session 15, and it exists because for fourteen sessions the only
 * thing on this sheet the walker could move was where they stood. The
 * owner's word for the result was *museum*. `THE-FUN-PASS.md` §5 gives
 * the walker touch, carry, sit and throw; this file is the part of
 * those verbs that has to REMEMBER — a pushed cart stays where you
 * left it, a thrown stone lies where it landed, in every later save —
 * and the part that has to REFUSE, which is the border rule.
 *
 * Two kinds of thing, and the difference is what the key does to them:
 *
 *   PUSHABLE   the hay cart. A touch shoves it; it rolls a few units
 *              and slows; it stops at the edge of its own land. It is
 *              never picked up. The first thing the walker has ever
 *              moved.
 *   CARRIABLE  a stone. Picked up, walked with (drawn in the hand),
 *              thrown underarm a few units, on an arc, with a landing
 *              and a sound. Never more than one in hand — there is one
 *              slot on the walker and no inventory anywhere.
 *
 * ── NOBODY CROSSES A BORDER BUT THE WALKER ─────────────────────────
 *
 * The rule was not amended and it is the engine of the ending, so it
 * holds for things as well as people: **every thing has a home land,
 * and it may not leave it.** A pushed cart stops at the Common's edge.
 * A thrown stone that would land in Maple Court lands on the border
 * instead. Not a check somebody remembers to write per thing — the
 * clamp is in `push` and in `land`, and a thing cannot be given a
 * position outside its rect by any path in this file.
 *
 * ── WHAT THIS FILE MUST NOT BECOME ─────────────────────────────────
 *
 * An inventory. `held` is one id or null. There is no list of held
 * things, no `size`, no way to hold two, no screen. A thing in hand is
 * a drawing in the walker's hand and nothing else.
 */

export type ThingKind = 'pushable' | 'carriable';

export type ThingDef = {
  /** Readable, like everything else: `hay-cart`, `fist-stone`. */
  id: string;
  kind: ThingKind;
  land: RegionId;
  /** Where it is on a fresh page, and where the morning puts it back. */
  home: { x: number; z: number };
  /** How the world names it in a prompt: `THE CART`, `THE STONE`. */
  name: string;
  /** For a pushable: how far one shove sends it, in units. */
  shove?: number;
  /** For a pushable: what it may not roll onto. */
  refuse?: (x: number, z: number) => boolean;
};

export type Thing = {
  def: ThingDef;
  x: number;
  z: number;
  /** Rolling: a pushable's remaining velocity. */
  vx: number;
  vz: number;
  /** A carriable's state. `gone` is down the well. */
  state: 'ground' | 'held' | 'flying' | 'gone';
  /** The arc, while flying. */
  fly?: { x0: number; z0: number; x1: number; z1: number; t: number; dur: number; y0: number; y1: number; h: number };
  /** The land's rect, so the border clamp needs no lookup. */
  rect: Rect;
  /** Set by the land that draws it, so the thing knows where to be
   *  drawn; the registry moves it, the land owns the mesh. */
  mesh?: THREE.Object3D;
  /** Whether the thing is somewhere a foot cannot go — set by App's
   *  ground test — so the morning knows to put it back. */
  stranded: boolean;
};

/** What the world does to a flying thing when it lands. */
export type Landing = {
  id: string;
  x: number;
  z: number;
  /** Set by the land's `catcher`, if one caught it (the well). */
  caught?: string;
};

class Things {
  private map = new Map<string, Thing>();
  /** THE ONE SLOT. An id, or nothing. */
  held: string | null = null;
  /** Landings this frame, for App to make a sound of and clear. */
  landed: Landing[] = [];
  /** Set when a position changed, so App persists without polling. */
  dirty = false;
  /** Catchers: a place that swallows a thrown thing (the well). Keyed
   *  by a readable id; a thing that lands within `r` is `gone` and the
   *  landing carries the catcher's id so the world can answer. */
  private catchers: { id: string; x: number; z: number; r: number }[] = [];

  register(def: ThingDef): Thing {
    const have = this.map.get(def.id);
    if (have) return have;
    const spec = REGION_SPECS.find((s) => s.id === def.land)!;
    const t: Thing = {
      def, x: def.home.x, z: def.home.z, vx: 0, vz: 0,
      state: 'ground', rect: spec.rect, stranded: false,
    };
    this.map.set(def.id, t);
    return t;
  }

  addCatcher(id: string, x: number, z: number, r: number) {
    if (this.catchers.some((c) => c.id === id)) return;
    this.catchers.push({ id, x, z, r });
  }

  get(id: string): Thing | undefined {
    return this.map.get(id);
  }

  get all(): Thing[] {
    return [...this.map.values()];
  }

  /** The thing in hand, if any. */
  get holding(): Thing | null {
    return this.held ? this.map.get(this.held) ?? null : null;
  }

  /** Restore from the save. A thing an older save never mentions is at
   *  home, which is exactly where an untouched thing is. */
  load(saved: Record<string, { x: number; z: number } | null>) {
    for (const [id, pos] of Object.entries(saved)) {
      const t = this.map.get(id);
      if (!t) continue;
      if (pos === null) {
        t.state = 'gone';
      } else {
        t.x = this.clampX(t, pos.x);
        t.z = this.clampZ(t, pos.z);
        t.state = 'ground';
      }
    }
  }

  /** For the save file, and for nothing else. A held thing is saved
   *  where the walker stands: closing the tab puts it down. */
  saved(px: number, pz: number): Record<string, { x: number; z: number } | null> {
    const out: Record<string, { x: number; z: number } | null> = {};
    for (const t of this.map.values()) {
      if (t.state === 'gone') out[t.def.id] = null;
      else if (t.state === 'held' || t.state === 'flying') {
        out[t.def.id] = { x: this.clampX(t, px), z: this.clampZ(t, pz) };
      } else out[t.def.id] = { x: t.x, z: t.z };
    }
    return out;
  }

  /* ---- the border ------------------------------------------------- */
  private clampX(t: Thing, x: number) {
    return Math.max(t.rect.minX + Things.BORDER, Math.min(t.rect.maxX - Things.BORDER, x));
  }
  private clampZ(t: Thing, z: number) {
    return Math.max(t.rect.minZ + Things.BORDER, Math.min(t.rect.maxZ - Things.BORDER, z));
  }
  /** How far inside its land a thing stops. Two units: a cart against
   *  a border you can see from both sides, and never on the seam. */
  static BORDER = 2.0;

  /* ---- PUSH -------------------------------------------------------- */
  /**
   * A touch, on a pushable: it goes away from the walker. `from` is
   * where the walker stands, so the direction is the line through both
   * — shove the cart from its south and it rolls north.
   */
  push(id: string, fromX: number, fromZ: number): boolean {
    const t = this.map.get(id);
    if (!t || t.def.kind !== 'pushable') return false;
    let dx = t.x - fromX;
    let dz = t.z - fromZ;
    const d = Math.hypot(dx, dz) || 1;
    dx /= d;
    dz /= d;
    const shove = t.def.shove ?? 6;
    /* A shove is a velocity, not a teleport: the cart takes a second and
     * a bit to roll to a stop, so a player who keeps pressing keeps it
     * rolling, and a player who stops sees it slow. The decay in `tick`
     * integrates to about `shove` units. */
    t.vx += dx * shove * Things.DECAY;
    t.vz += dz * shove * Things.DECAY;
    return true;
  }
  /** Per second: the cart loses this much of its speed. */
  static DECAY = 2.6;

  /* ---- CARRY ------------------------------------------------------- */
  pickUp(id: string): boolean {
    const t = this.map.get(id);
    if (!t || t.def.kind !== 'carriable' || t.state !== 'ground' || this.held) return false;
    t.state = 'held';
    this.held = id;
    this.dirty = true;
    return true;
  }

  /* ---- THROW ------------------------------------------------------- */
  /**
   * Underarm, from the hand, `dist` units along `heading`, on an arc.
   * The landing is clamped to the thing's own land BEFORE it flies, so
   * the arc itself never leaves the rect: a throw at a border is a
   * throw that falls short, and nothing in the air is ever over another
   * land.
   */
  throw_(px: number, pz: number, y0: number, heading: number, dist: number,
    groundAt: (x: number, z: number) => number): boolean {
    const t = this.holding;
    if (!t) return false;
    const x1 = this.clampX(t, px + Math.sin(heading) * dist);
    const z1 = this.clampZ(t, pz + Math.cos(heading) * dist);
    const d = Math.hypot(x1 - px, z1 - pz);
    t.state = 'flying';
    this.held = null;
    t.fly = {
      x0: px, z0: pz, x1, z1, t: 0,
      // a stone goes about eight units a second underarm; a set-down at
      // the feet is nearly instant
      dur: Math.max(0.18, d / 8),
      y0, y1: groundAt(x1, z1),
      // the arc's height rises with the throw, capped at a body's height
      h: Math.min(1.4, 0.25 + d * 0.16),
    };
    this.dirty = true;
    return true;
  }

  /** Where a flying thing is right now, for the land that draws it. */
  flyPos(t: Thing): { x: number; y: number; z: number } | null {
    const f = t.fly;
    if (!f || t.state !== 'flying') return null;
    const k = Math.min(1, f.t / f.dur);
    const x = f.x0 + (f.x1 - f.x0) * k;
    const z = f.z0 + (f.z1 - f.z0) * k;
    const y = f.y0 + (f.y1 - f.y0) * k + Math.sin(k * Math.PI) * f.h;
    return { x, y, z };
  }

  /* ---- the frame --------------------------------------------------- */
  tick(dt: number) {
    for (const t of this.map.values()) {
      if (t.def.kind === 'pushable') {
        const sp = Math.hypot(t.vx, t.vz);
        if (sp < 0.02) {
          t.vx = 0;
          t.vz = 0;
          continue;
        }
        const nx = t.x + t.vx * dt;
        const nz = t.z + t.vz * dt;
        const cx = this.clampX(t, nx);
        const cz = this.clampZ(t, nz);
        /* THE BORDER STOPS IT, dead. A cart that bounces off the edge
         * of a land is a cart that is arguing with the rule; it stops,
         * and it stays. And its own refusals (water, the steep) stop it
         * the same way, per axis, so it slides along a bank rather
         * than sticking to it. */
        const refuse = t.def.refuse;
        if (cx !== nx || (refuse && refuse(cx, t.z))) t.vx = 0; else t.x = cx;
        if (cz !== nz || (refuse && refuse(t.x, cz))) t.vz = 0; else t.z = cz;
        const k = Math.max(0, 1 - Things.DECAY * dt);
        t.vx *= k;
        t.vz *= k;
        this.dirty = true;
      } else if (t.state === 'flying' && t.fly) {
        t.fly.t += dt;
        if (t.fly.t >= t.fly.dur) {
          t.x = t.fly.x1;
          t.z = t.fly.z1;
          t.state = 'ground';
          const landing: Landing = { id: t.def.id, x: t.x, z: t.z };
          for (const c of this.catchers) {
            if (Math.hypot(t.x - c.x, t.z - c.z) < c.r) {
              landing.caught = c.id;
              t.state = 'gone';
            }
          }
          t.fly = undefined;
          this.landed.push(landing);
          this.dirty = true;
        }
      }
    }
  }

  /**
   * THE MORNING PUTS IT BACK. Anything the walker cannot reach — down
   * the well, in deep water, on a scarp — is at its home again at
   * first light. Nobody says who. It is the one rule that keeps a toy
   * a toy: a stone you can lose for good is a stone you stop throwing.
   */
  morning() {
    for (const t of this.map.values()) {
      if (t.def.kind !== 'carriable') continue;
      if (t.state === 'gone' || (t.state === 'ground' && t.stranded)) {
        t.x = t.def.home.x;
        t.z = t.def.home.z;
        t.state = 'ground';
        t.stranded = false;
        this.dirty = true;
      }
    }
  }
}

/** One instance, module scope, readable by anything — the same shape as
 *  the clock, the knowledge and the platform, and for the same reason. */
export const things = new Things();
