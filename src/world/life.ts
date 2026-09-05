import * as THREE from 'three';
import { clock } from './daylight';
import { routineAt, registerRoutine, type RoutineDef, type RoutineState } from './events';
import { folkTexture, type FolkKind, type FolkPose } from './textures-life';
import type { BuildCtx } from './regions/index';

/**
 * LIFE — how an unnamed inhabitant or an animal is put on the page
 * (Session 17, `THE-FUN-PASS` §9).
 *
 * Two drawers and one registry:
 *
 *   FIGURE    a routine (`events.ts`) with a body: one standee whose
 *             drawing is swapped by posture, placed where the routine
 *             says at this hour, faded in over the first two seconds
 *             out of its door and out over the last. It is a one-off
 *             standee rather than a field ON PURPOSE — a standee has no
 *             birth to get wrong (`StandeeField.hide`'s note, and the
 *             bug the owner found in Session 9).
 *   CREATURE  an animal with two or more postures, the same way: one
 *             standee, one map per posture, and the land's own update
 *             deciding which. The bull, the goat and Nell are built
 *             this way by hand in `meadow.ts`; this is the same shape
 *             with the bookkeeping done once.
 *   THE REGISTRY  everything either drawer puts on the page reports
 *             itself — id, land, whether it should be out, whether it
 *             is drawn, where, in which posture — so `tools/check-
 *             fields.mjs` can drive every hour a routine changes its
 *             drawing at and assert the drawing changed. The owner
 *             found the last bug of this class by walking up to an
 *             animal; a contact sheet cannot, because a contact sheet
 *             photographs a walker standing still.
 */

export type LifeReport = {
  id: string;
  land: string;
  kind: 'figure' | 'creature';
  /** Whether the thing is meant to be on the page now. */
  present: boolean;
  /** Whether it is drawn. */
  visible: boolean;
  x: number;
  z: number;
  pose: number;
  /** The drawing is a real texture and not nothing. */
  map: boolean;
  /** For a figure: what the routine says, to compare against. */
  expect?: { x: number; z: number; moving: boolean; pose: number };
};

/** Everything alive that has been drawn, for the harness. */
export const drawn: { report(): LifeReport }[] = [];

/** How long a stride is, in world seconds, for the walk's two frames. */
const STRIDE_S = 0.32;

export class Figure {
  mesh: THREE.Mesh;
  state: RoutineState;
  private mat: THREE.MeshBasicMaterial;
  private shown: FolkPose = 0;
  /** A second thing the figure pushes or holds, drawn beside it: a
   *  handcart, a rod. Follows the figure; hidden with it. */
  prop: THREE.Mesh | null = null;
  propOffset = { x: 0, z: 0 };

  constructor(
    private ctx: BuildCtx, readonly def: RoutineDef, readonly kind: FolkKind,
    private opts: { scale?: number; lift?: number;
      /** A NAMED PERSON'S OWN DRAWINGS (Session 19: Wick, Pye, Wren,
       *  the surfers) — a map from posture to texture, falling back to
       *  the shared folk drawing for any posture it does not have. A
       *  name is three drawings; this is how a name keeps a routine. */
      maps?: Partial<Record<FolkPose, THREE.Texture>> } = {}
  ) {
    registerRoutine(def);
    const s = opts.scale ?? 1;
    this.mesh = ctx.standee(this.tex(def.stops[0].pose as FolkPose), 1.15 * s, 1.9 * s, def.stops[0].x, def.stops[0].z);
    this.mat = this.mesh.material as THREE.MeshBasicMaterial;
    this.mat.transparent = true;
    this.mesh.visible = false;
    this.shown = def.stops[0].pose as FolkPose;
    this.state = routineAt(def, clock.hour);
    drawn.push(this);
  }

  /** One frame. `gone` takes it off the page whatever the hour (a
   *  land's platform, a storm). Returns the state for the land's own
   *  use — a sound on a leg, a shutter on a stop. */
  tick(hour = clock.hour, gone = false): RoutineState {
    const s = routineAt(this.def, hour);
    this.state = s;
    const show = s.present && !gone;
    this.mesh.visible = show;
    if (this.prop) this.prop.visible = show;
    if (!show) return s;
    let pose = s.pose as FolkPose;
    if (s.moving) {
      pose = this.def.walkPose !== undefined
        ? (this.def.walkPose as FolkPose)
        : Math.floor((hour * 100) / STRIDE_S) % 2 === 0 ? 1 : 5;
    }
    if (pose !== this.shown) {
      this.shown = pose;
      this.mat.map = this.tex(pose);
    }
    const y = this.ctx.groundY(s.x, s.z) + (this.opts.lift ?? 0);
    this.mesh.position.set(s.x, y, s.z);
    this.mesh.scale.x = s.face;
    this.mat.opacity = s.fade;
    if (this.prop) {
      this.prop.position.set(s.x + this.propOffset.x * s.face, this.ctx.groundY(s.x, s.z), s.z + this.propOffset.z);
      this.prop.scale.x = s.face * Math.abs(this.prop.scale.x);
      (this.prop.material as THREE.MeshBasicMaterial).opacity = s.fade;
    }
    return s;
  }

  /** The drawing for a posture: the person's own if they have one. */
  private tex(pose: FolkPose): THREE.Texture {
    return this.opts.maps?.[pose] ?? folkTexture(this.kind, pose);
  }

  report(): LifeReport {
    return {
      id: this.def.id, land: this.def.land, kind: 'figure',
      present: this.state.present, visible: this.mesh.visible,
      x: this.mesh.position.x, z: this.mesh.position.z, pose: this.shown,
      map: !!this.mat.map,
      expect: { x: this.state.x, z: this.state.z, moving: this.state.moving, pose: this.state.pose },
    };
  }
}

export class Creature {
  mesh: THREE.Mesh;
  pose = 0;
  present = true;
  private mat: THREE.MeshBasicMaterial;

  constructor(
    ctx: BuildCtx, readonly id: string, readonly land: string,
    readonly maps: THREE.Texture[], w: number, h: number, x: number, z: number,
    private ground: (x: number, z: number) => number = ctx.groundY
  ) {
    this.mesh = ctx.standee(maps[0], w, h, x, z);
    this.mat = this.mesh.material as THREE.MeshBasicMaterial;
    this.mat.transparent = true;
    drawn.push(this);
  }

  /** Put it somewhere in a posture, facing a way. `lift` is height
   *  above the ground it stands over — a bird, a bat. */
  set(pose: number, x: number, z: number, face: -1 | 1 = 1, lift = 0, opacity = 1) {
    if (pose !== this.pose) {
      this.pose = pose;
      this.mat.map = this.maps[Math.max(0, Math.min(this.maps.length - 1, pose))];
    }
    this.mesh.position.set(x, this.ground(x, z) + lift, z);
    this.mesh.scale.x = face * Math.abs(this.mesh.scale.x);
    this.mat.opacity = opacity;
    this.mesh.visible = opacity > 0.02;
    this.present = true;
  }

  hide() {
    this.mesh.visible = false;
    this.present = false;
  }

  report(): LifeReport {
    return {
      id: this.id, land: this.land, kind: 'creature',
      present: this.present, visible: this.mesh.visible,
      x: this.mesh.position.x, z: this.mesh.position.z, pose: this.pose, map: !!this.mat.map,
    };
  }
}

/** A routine's stops, written as rows: `[at, x, z, pose, face?, hold?]`. */
export type StopRow = [number, number, number, number, (-1 | 1)?, number?];
export function stops(rows: StopRow[]): RoutineDef['stops'] {
  return rows.map(([at, x, z, pose, face, hold]) => ({ at, x, z, pose, face, hold }));
}
