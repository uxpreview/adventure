import * as THREE from 'three';
import type { BuildCtx } from './index';
import { rooms, type RoomDef } from '../rooms';
import { sideWallTexture } from '../textures-rooms';

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
  /** Draw the room up to `k` (0 outside, 1 inside). */
  show: (k: number) => void;
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
  const wall = ctx.standee(wallTex, w, wallH, cx, q.minZ + 0.18, { solid: true });
  const sides = [q.minX + 0.16, q.maxX - 0.16].map((x, i) =>
    ctx.standee(sideWallTexture(seed + i, kind), d, wallH, x, cz, { rotY: Math.PI / 2, solid: true }));
  const things: THREE.Mesh[] = [];
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
    show: (k) => {
      for (const m of all()) {
        const mat = m.material as THREE.MeshBasicMaterial;
        /* A land may have hidden a thing on its own account (a person
         * who is not home): the room's blend scales what the land set,
         * and never un-hides. */
        const own = (m.userData as { roomHide?: boolean }).roomHide;
        mat.opacity = (m === floor ? 0.9 : 1) * k;
        m.visible = k > 0.02 && !own;
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
