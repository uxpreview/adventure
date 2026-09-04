import * as THREE from 'three';
import { bicycleTexture } from '../world/textures-now';
import { SPEC_BY_ID, type Rect } from '../world/layout';

/**
 * THE BICYCLE — Maple Court's mount (Session 18; `WORLD-SYSTEMS` §4,
 * `THE-FUN-PASS` §8 item 3).
 *
 * The rules are the rowboat's, and they were written before this one
 * existed: **fast on its own ground and refusing every other ground;
 * found in the world and left in the world; the player's alone.** Its
 * own ground is the streets of the neighbourhood — road, drive, lawn,
 * the river bridge's planks. It refuses **sand and stairs**, which is
 * what the table has said since Session 6, and it refuses water and
 * the steep the way a foot does, and it refuses its own land's border
 * the way a cart does: it is a THING, and nobody crosses a border but
 * the walker, and no thing does either. A bicycle that could ride into
 * Brim is a bicycle that has broken the ending; so at the Common's
 * edge it stops dead, and you get off, and it is there when you come
 * back.
 *
 * ── WHAT IT IS FOR ──────────────────────────────────────────────────
 *
 * Not speed. The owner's word for the walks was *chore*, and the
 * brief's answer is *mounts as fun, not just speed*: **a bell you can
 * ring**, which is the one key while you are moving, and which the
 * neighbourhood answers — the cat on Val's fence sits up, the children
 * on the green stop and look — and **fast downhill**, which is the
 * land's own grade paid back to you instead of taken.
 *
 * ── WHERE IT LIVES ──────────────────────────────────────────────────
 *
 * On its side at the mouth of the court, four gardens from the house
 * it belongs to (`THE-STRANGERS` E18 says whose, and nobody in Maple
 * Court would say). After that it is wherever you left it, which is
 * saved.
 *
 * It is drawn broadside, a cutout standing on the road like everything
 * else on this sheet, and it mirrors with the direction of travel so
 * the front wheel leads. The rider is the walker, seated, and the
 * bicycle draws half a unit nearer the lens so the frame covers their
 * legs — the rowboat's trick, for the rowboat's reason.
 */

export const BICYCLE_HOME = { x: -60, z: 149 };

/** WHEN THE BELL WAS LAST RUNG, in world seconds, for the land to
 *  answer. Module scope and one instance, like `Eight15.platform`. */
export const bell = { at: -1e9, x: 0, z: 0 };

export class Bicycle {
  group = new THREE.Group();
  pos = new THREE.Vector2(BICYCLE_HOME.x, BICYCLE_HOME.z);
  aboard = false;
  /** The land it may not leave. */
  readonly rect: Rect = SPEC_BY_ID.neighborhood.rect;

  private sprite: THREE.Mesh;
  private mat: THREE.MeshBasicMaterial;
  private lean = 1;
  private bobT = 0;

  constructor() {
    const w = 2.3;
    const h = w * (80 / 128);
    const geo = new THREE.PlaneGeometry(w, h);
    geo.translate(0, h * 0.5, 0);
    this.mat = new THREE.MeshBasicMaterial({
      map: bicycleTexture(8800),
      transparent: true,
      alphaTest: 0.1,
      side: THREE.DoubleSide,
    });
    this.sprite = new THREE.Mesh(geo, this.mat);
    this.group.add(this.sprite);
    this.group.renderOrder = 2;
  }

  setAt(x: number, z: number) {
    this.pos.set(x, z);
  }

  /** Inside its land, with a cart's two-unit margin. */
  clamp(x: number, z: number): [number, number] {
    const m = 2;
    return [
      Math.max(this.rect.minX + m, Math.min(this.rect.maxX - m, x)),
      Math.max(this.rect.minZ + m, Math.min(this.rect.maxZ - m, z)),
    ];
  }

  /**
   * Stand it. `y` is the ground under it, `heading` is which way the
   * rider is pointed, `speed` is how fast. Parked, it leans on its
   * stand; ridden, it sits up and the wheels' bump is in the frame.
   */
  update(dt: number, y: number, heading: number, speed: number) {
    this.bobT += dt * (1 + speed * 0.6);
    this.group.position.set(this.pos.x, y, this.pos.y + (this.aboard ? 0.55 : 0));
    if (this.aboard) {
      this.group.rotation.z = Math.sin(this.bobT * 6.2) * 0.012 * Math.min(1, speed / 4);
      if (Math.abs(heading) > 0.001) {
        const west = Math.sin(heading) < -0.15;
        const east = Math.sin(heading) > 0.15;
        if (west) this.lean = -1;
        else if (east) this.lean = 1;
      }
    } else {
      // on its stand, a little over, the way a bicycle left on a verge is
      this.group.rotation.z = 0.06;
    }
    this.sprite.scale.x = this.lean < 0 ? -1 : 1;
  }

  /** Ring it: the land reads `bell.at` and answers. */
  ring(t: number) {
    bell.at = t;
    bell.x = this.pos.x;
    bell.z = this.pos.y;
  }

  dispose() {
    this.sprite.geometry.dispose();
    this.mat.map?.dispose();
    this.mat.dispose();
  }
}
