import * as THREE from 'three';
import { horseSheet, hitchingPostTexture, HORSE_FRAMES, HORSE_FW, HORSE_FH } from '../world/textures-mounts';
import { makeStandee } from './props';
/* ---- CAMERA: the horse turns about its feet to face the lens ---- */
import { billboard, cameraYaw, mirrorFor, towardLens } from './billboard';

/**
 * THE HORSE (SCALE pillar) — the reason the world is big.
 *
 * The rules are the bicycle's and the rowboat's: found in the world,
 * left in the world, yours alone, saved where you left it. It differs
 * in what it refuses — only water, the steep and a barrier, the same
 * things a foot refuses — so it goes everywhere a walk goes at four
 * times the pace. It lives by a hitching post at the Common's
 * crossroads, and a whistle (the H key) calls it from anywhere within
 * earshot: it trots over, and stands, and waits.
 *
 * It is drawn broadside from a seven-frame sheet — standing, two trot
 * frames, two gallop frames, two grazing — and mirrored with the direction of
 * travel so the head leads. The rider is the walker, lifted onto the
 * saddle; the horse draws half a unit nearer the lens so its body
 * covers the rider's legs, the bicycle's trick for the bicycle's reason.
 */

export const HORSE_HOME = { x: -36, z: 66 };
export const HITCHING_POST = { x: -33.6, z: 66.4 };
/** How far a whistle carries, in world units. */
export const WHISTLE_REACH = 120;
/** Its trot when called, in units a second. */
export const CALLED_TROT = 5.2;

export class Horse {
  group = new THREE.Group();
  pos = new THREE.Vector2(HORSE_HOME.x, HORSE_HOME.z);
  aboard = false;
  /** Called by a whistle: where it is trotting to, or null. */
  coming: { x: number; z: number; t: number } | null = null;
  /** Distance made good since the last hoofbeat, so the sound rides
   *  the stride exactly the way the oar rides the boat. */
  hoofAcc = 0;
  /** True on a frame it took a hoofbeat's worth of ground. */
  hoofbeat = false;

  private sprite: THREE.Mesh;
  private mat: THREE.MeshBasicMaterial;
  private tex: THREE.CanvasTexture;
  private post: THREE.Mesh;
  private face = 1;
  private phase = 0;
  private frame = 0;
  /** How long it has stood: it grazes after a moment, and swishes. */
  private idle = 0;

  constructor() {
    const w = 3.0;
    const h = w * (HORSE_FH / HORSE_FW);
    const geo = new THREE.PlaneGeometry(w, h);
    geo.translate(0, h * 0.5, 0);
    this.tex = horseSheet();
    this.mat = new THREE.MeshBasicMaterial({
      map: this.tex,
      transparent: true,
      alphaTest: 0.1,
      side: THREE.DoubleSide,
    });
    this.sprite = new THREE.Mesh(geo, this.mat);
    this.sprite.renderOrder = 2;
    this.group.add(this.sprite);
    this.post = makeStandee(hitchingPostTexture(9150), 1.0, 2.0);
    this.post.position.set(HITCHING_POST.x, 0, HITCHING_POST.z);
    billboard(this.post); /* ---- CAMERA: the post faces the lens too ---- */
    this.group.add(this.post);
    this.setFrame(0);
  }

  setAt(x: number, z: number) {
    this.pos.set(x, z);
    this.coming = null;
  }

  /** The post stands on the ground it was drawn at; set once. */
  groundPost(y: number) {
    this.post.position.y = y;
  }

  /** A whistle from (x, z): true if it heard, and is coming. */
  call(x: number, z: number): boolean {
    if (this.aboard) return false;
    if (Math.hypot(x - this.pos.x, z - this.pos.y) > WHISTLE_REACH) return false;
    this.coming = { x, z, t: 0 };
    return true;
  }

  private setFrame(f: number) {
    if (f === this.frame) return;
    this.frame = f;
    this.tex.offset.x = f / HORSE_FRAMES;
  }

  /**
   * One frame. `y` is the ground under it, `heading` the rider's,
   * `speed` how fast it is going; `refuses` is what its feet will not
   * take, so a called horse stops at a bank rather than wading.
   */
  update(dt: number, y: number, heading: number, speed: number,
    refuses: (x: number, z: number) => boolean, ground: (x: number, z: number) => number) {
    this.hoofbeat = false;
    let moved = 0;
    if (!this.aboard && this.coming) {
      const c = this.coming;
      c.t += dt;
      const dx = c.x - this.pos.x;
      const dz = c.z - this.pos.y;
      const d = Math.hypot(dx, dz);
      if (d < 2.6 || c.t > 40) {
        this.coming = null;
      } else {
        const step = Math.min(d, CALLED_TROT * dt);
        const nx = this.pos.x + (dx / d) * step;
        const nz = this.pos.y + (dz / d) * step;
        // per axis, the way a cart slides along a bank
        let mx = this.pos.x;
        let mz = this.pos.y;
        if (!refuses(nx, this.pos.y)) mx = nx;
        if (!refuses(mx, nz)) mz = nz;
        moved = Math.hypot(mx - this.pos.x, mz - this.pos.y);
        if (moved < step * 0.2) this.coming = null; // held by the page: it gives up
        if (Math.abs(mx - this.pos.x) > 1e-4) this.face = mx > this.pos.x ? 1 : -1;
        this.pos.set(mx, mz);
        y = ground(mx, mz);
      }
    }
    const going = this.aboard ? speed : (this.coming ? CALLED_TROT : 0);
    if (this.aboard) {
      moved = speed * dt;
      if (Math.abs(heading) > 0.001 && speed > 0.3) {
        const west = Math.sin(heading) < -0.15;
        const east = Math.sin(heading) > 0.15;
        if (west) this.face = -1;
        else if (east) this.face = 1;
      }
    }
    this.phase += moved;
    this.hoofAcc += moved;
    if (going >= 0.3) this.idle = 0;
    const stride = going > 7.5 ? 2.4 : 1.35;
    if (going > 0.3 && this.hoofAcc > stride) {
      this.hoofAcc = 0;
      this.hoofbeat = true;
    }
    // the frame: standing, a trot swapping every three quarters of a
    // unit, a gallop swapping every unit and a half
    if (going < 0.3) {
      this.idle += dt;
      const c = this.idle % 11;
      this.setFrame(this.aboard || c < 3.5 ? 0 : Math.floor(c / 1.1) % 2 ? 5 : 6);
    } else if (going < 7.5) this.setFrame(1 + (Math.floor(this.phase / 0.75) % 2));
    else this.setFrame(3 + (Math.floor(this.phase / 1.5) % 2));

    /* ---- CAMERA: the camera turns now — the horse faces the lens from
     * any yaw, draws a stride TOWARD the lens (not south) when ridden so
     * its body covers the rider's legs, and keeps facing the way it
     * goes when seen from behind (the mirror, like every 'keep' cutout). */
    const [lx, lz] = towardLens();
    const off = this.aboard ? 0.55 : 0;
    this.sprite.position.set(this.pos.x + lx * off, y, this.pos.y + lz * off);
    this.sprite.rotation.y = -cameraYaw();
    this.sprite.rotation.z = going > 7.5 ? Math.sin(this.phase * 2.1) * 0.03 : 0;
    this.sprite.scale.x = mirrorFor(this.face);
  }

  dispose() {
    this.sprite.geometry.dispose();
    this.mat.dispose();
    this.post.geometry.dispose();
    (this.post.material as THREE.Material).dispose();
  }
}
