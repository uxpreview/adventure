import * as THREE from 'three';
import type { BuildCtx } from './index';
import { rooms, type RoomDef } from '../rooms';
import { sideWallTexture, pencilGhostTexture } from '../textures-rooms';
import { makeStandee } from '../../engine/props';
import { billboard, cameraYaw } from '../../engine/billboard';

/**
 * ONE ROOM, BUILT (Session 23, `rooms.ts`, `WORLD-SYSTEMS` §11).
 *
 * What every interior in the game is made of, so a land authors a room
 * the way it authors a place — a rect, a door, a floor, a far wall, and
 * whatever it stands on the floor — and gets the section for free:
 *
 *   · THE FLOOR is a decal, the plan, lying on the ground the house
 *     already stands on.
 *   · THE FAR WALL is a standee at the north edge, face-on: the
 *     elevation. It is solid.
 *   · THE SIDE WALLS are standees turned edge-on at the east and west
 *     edges, with the section's cut face drawn heavy at their south
 *     ends. They are solid. From the camera they are two lines going
 *     away, which is what a section looks like.
 *   · THE FRONT WALL is the house's own drawing, which the land has
 *     already registered solid with a door left in it, and which the
 *     land takes to pencil off the room's blend.
 *
 * Everything here is born at nothing and drawn up by `show(k)`: from
 * outside a house is exactly the house it was, to the pixel, which is
 * what keeps every protected framing that looks at one unmoved.
 */
export type Room = {
  def: RoomDef;
  floor: THREE.Mesh;
  wall: THREE.Mesh;
  sides: THREE.Mesh[];
  /** What the land stood on the floor, faded with it. */
  things: THREE.Mesh[];
  /** Stand a thing on the floor, in the room's fade group. */
  put: (m: THREE.Mesh) => THREE.Mesh;
  /**
   * THE FRONT WALL, handed over (the awwwards pass, Session 23). The
   * house's own drawing goes to NOTHING as the walker goes in, and in
   * its place the same drawing's ink alone — `pencilGhostTexture`,
   * read off the house's canvas — stands where the house stood, as
   * pencil, at a fifth. That is the cut wall drawn as a section draws
   * one: line, no wash. The ghost is made here so a land gives a
   * house a door in one call and never draws a second front.
   */
  front: (m: THREE.Mesh) => void;
  /** Draw the room up to `k` (0 outside, 1 inside). */
  show: (k: number) => void;
};

/** How dark the cut wall's pencil is at full. */
const GHOST = 0.22;
/** A hand drawing a section draws it in order — the plan, then the
 *  walls up off it, then what stands in it — so the blend is spent on
 *  each in turn rather than on all at once. */
const ease = (k: number, a: number, b: number) => {
  const u = Math.max(0, Math.min(1, (k - a) / (b - a)));
  return u * u * (3 - 2 * u);
};

export function buildRoom(
  ctx: BuildCtx, def: RoomDef, kind: 'paper' | 'plaster' | 'stone',
  floorTex: THREE.Texture, wallTex: THREE.Texture, wallH = 3.0, seed = 2300
): Room {
  rooms.register(def);
  const q = def.rect;
  const w = q.maxX - q.minX;
  const d = q.maxZ - q.minZ;
  const cx = (q.minX + q.maxX) / 2;
  const cz = (q.minZ + q.maxZ) / 2;
  const floor = ctx.decal(floorTex, w, d, cx, cz, 0, 0.9);
  floor.renderOrder = -5;
  const wall = ctx.standee(wallTex, w, wallH, cx, q.minZ + 0.18, { solid: true, face: 'fixed' });
  const sides = [q.minX + 0.16, q.maxX - 0.16].map((x, i) =>
    ctx.standee(sideWallTexture(seed + i, kind), d, wallH, x, cz, { rotY: Math.PI / 2, solid: true }));
  const things: THREE.Mesh[] = [];
  const fronts: { house: THREE.Mesh; ghost: THREE.Mesh }[] = [];
  const all = () => [floor, wall, ...sides, ...things];
  for (const m of all()) {
    const mat = m.material as THREE.MeshBasicMaterial;
    mat.transparent = true;
    mat.opacity = 0;
    m.visible = false;
  }
  const room: Room = {
    def, floor, wall, sides, things,
    put: (m) => {
      const mat = m.material as THREE.MeshBasicMaterial;
      mat.transparent = true;
      mat.opacity = 0;
      m.visible = false;
      things.push(m);
      return m;
    },
    front: (house) => {
      const mat = house.material as THREE.MeshBasicMaterial;
      mat.transparent = true;
      const geo = house.geometry as THREE.PlaneGeometry;
      const p = geo.parameters;
      const ghost = makeStandee(pencilGhostTexture(mat.map!), p.width, p.height, 0);
      ghost.position.copy(house.position);
      ghost.position.z += 0.02;
      ghost.rotation.copy(house.rotation);
      // CAMERA: the house turns to face the lens, so its pencil ghost
      // turns with it, from the same authored tilt
      billboard(ghost, house.rotation.y + cameraYaw());
      (ghost.material as THREE.MeshBasicMaterial).depthWrite = false;
      // pencil is faint by nature; the cutout's alpha test would eat it
      (ghost.material as THREE.MeshBasicMaterial).alphaTest = 0.01;
      ghost.renderOrder = 2;
      ghost.visible = false;
      house.parent?.add(ghost);
      fronts.push({ house, ghost });
    },
    show: (k) => {
      for (const m of all()) {
        const mat = m.material as THREE.MeshBasicMaterial;
        /* A land may have hidden a thing on its own account (a person
         * who is not home): the room's blend scales what the land set,
         * and never un-hides. */
        const own = (m.userData as { roomHide?: boolean }).roomHide;
        const stage = m === floor ? ease(k, 0, 0.5) : m === wall || sides.includes(m) ? ease(k, 0.15, 0.75) : ease(k, 0.4, 1);
        mat.opacity = (m === floor ? 0.9 : 1) * stage;
        m.visible = stage > 0.02 && !own;
      }
      /* THE FRONT GOES FIRST: the wash is gone by the time the plan is
       * half drawn, and the ink stays on as pencil. */
      for (const f of fronts) {
        (f.house.material as THREE.MeshBasicMaterial).opacity = 1 - ease(k, 0, 0.55);
        const g = f.ghost.material as THREE.MeshBasicMaterial;
        g.opacity = GHOST * ease(k, 0.1, 0.7);
        f.ghost.visible = g.opacity > 0.01;
      }
    },
  };
  return room;
}

/** Hide a room's thing on the land's own account (a person not home),
 *  or give it back to the blend. */
export function roomHide(m: THREE.Mesh, hidden: boolean) {
  (m.userData as { roomHide?: boolean }).roomHide = hidden;
  if (hidden) m.visible = false;
}
