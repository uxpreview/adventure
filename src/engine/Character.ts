import * as THREE from 'three';
import { characterSheet, blobShadowTexture } from './ink';
import { INK, BLUE, WHITE_INK } from './palette';
import { Footprints } from './Footprints';
import type { SkinId } from '../core/Save';

const FRAMES = 8; // 0 idle · 1–6 walk · 7 sit

/**
 * Pip — a flat ink figure standing on the page like a paper cut-out.
 * Movement uses acceleration and damping so starts and stops feel soft;
 * footprints and step sounds are driven by distance travelled.
 *
 * Session 4: the page has a shape, so Pip has a ground. `setGround`
 * lifts the figure onto it every frame; `grade` (the gradient of the
 * ground in the direction of travel) makes a climb cost something and a
 * descent give it back — the only place in the game where the terrain
 * pushes back on the verb. Pip does NOT lean into the slope: a paper
 * cutout stands upright on a warped sheet, always.
 */
export class Character {
  group = new THREE.Group();
  pos = new THREE.Vector3();
  vel = new THREE.Vector3();
  heading = 0;
  maxSpeed = 4.1;
  frozen = false;
  /**
   * Rise per unit travelled, in the direction of travel. Uphill drags,
   * downhill lets go — subtly, because this is a walk, not a climb.
   */
  grade = 0;
  onStep: (() => void) | null = null;
  /**
   * Footprint stamp gate (ARCHITECTURE #34). False = steps and step
   * sound continue but the page takes no mark — the surface refuses the
   * record (Ch5's whiteout, Ch7's blank years).
   */
  stamping = true;

  private sprite: THREE.Mesh;
  private tex: THREE.CanvasTexture;
  private texInk: THREE.CanvasTexture;
  private texWhite: THREE.CanvasTexture | null = null;
  private shadow: THREE.Mesh;
  private skin: SkinId = 'pip';
  private inverted = false;
  private walkPhase = 0;
  private stepAcc = 0;
  private sitting = false;
  private idleT = 0;
  /**
   * Gait wobble (ARCHITECTURE #35): lateral sway, step-interval jitter
   * and a speed penalty in one scalar. Ch7's coda walks a body that is
   * starting to go; Ch10's moving ground reuses it for footing.
   */
  private wobble = 0;
  private wobbleSeed = 0;
  private stepGate = 0.62;
  private groundY = 0;
  private groundN: [number, number, number] = [0, 1, 0];

  constructor(private prints: Footprints) {
    this.tex = this.buildSheet(false);
    this.texInk = this.tex;
    this.tex.offset.set(0, 0);

    const h = 1.55;
    const w = h * (128 / 176);
    const geo = new THREE.PlaneGeometry(w, h);
    geo.translate(0, h / 2, 0);
    const mat = new THREE.MeshBasicMaterial({
      map: this.tex,
      transparent: true,
      alphaTest: 0.15,
      side: THREE.DoubleSide,
    });
    this.sprite = new THREE.Mesh(geo, mat);

    const sgeo = new THREE.PlaneGeometry(1.1, 0.8);
    sgeo.rotateX(-Math.PI / 2);
    this.shadow = new THREE.Mesh(
      sgeo,
      new THREE.MeshBasicMaterial({
        map: blobShadowTexture(),
        transparent: true,
        depthWrite: false,
      })
    );
    this.shadow.position.y = 0.015;
    this.shadow.renderOrder = -4;

    this.group.add(this.shadow, this.sprite);
  }

  setWobble(k: number) {
    this.wobble = Math.max(0, k);
    if (k === 0) {
      this.sprite.position.x = 0;
      this.stepGate = 0.62;
    }
  }

  /** Pip's own ink, thinning. The coda fades the walker, not the page. */
  setOpacity(o: number) {
    const m = this.sprite.material as THREE.MeshBasicMaterial;
    m.opacity = o;
    m.transparent = true;
    (this.shadow.material as THREE.MeshBasicMaterial).opacity = o;
  }

  setSitting(v: boolean) {
    this.sitting = v;
    if (v) this.setFrame(7);
  }

  /** One sprite sheet for the current skin: Pip's tuft in black ink, B.'s
   *  flat cap in blue — or either silhouette in white for the Blot. */
  private buildSheet(white: boolean): THREE.CanvasTexture {
    const color = white ? WHITE_INK : this.skin === 'b' ? BLUE : INK;
    const t = characterSheet(color, this.skin === 'b' ? { tuft: false } : {});
    t.repeat.set(1 / FRAMES, 1);
    return t;
  }

  /** Swap which doodle walks the page (keeps the current frame and pose). */
  setSkin(id: SkinId) {
    if (id === this.skin) return;
    this.skin = id;
    const frameX = this.tex.offset.x;
    this.texInk = this.buildSheet(false);
    this.texWhite = this.inverted ? this.buildSheet(true) : null;
    const target = this.inverted ? this.texWhite! : this.texInk;
    target.offset.x = frameX;
    this.tex = target;
    const mat = this.sprite.material as THREE.MeshBasicMaterial;
    mat.map = target;
    mat.needsUpdate = true;
  }

  /** Swap the doodle to white ink for the Blot (and back). */
  setInverted(v: boolean) {
    this.inverted = v;
    if (v && !this.texWhite) this.texWhite = this.buildSheet(true);
    const target = v ? this.texWhite! : this.texInk;
    target.offset.x = this.tex.offset.x;
    this.tex = target;
    const mat = this.sprite.material as THREE.MeshBasicMaterial;
    mat.map = target;
    mat.needsUpdate = true;
    this.shadow.visible = !v;
  }

  teleport(x: number, z: number, heading = 0) {
    this.pos.set(x, this.groundY, z);
    this.vel.set(0, 0, 0);
    this.heading = heading;
    this.group.position.copy(this.pos);
  }

  /**
   * Put the figure on the page. Called every frame with the ground under
   * the walker's feet and the page's normal there; the blob shadow lies
   * along the surface, the figure stands square to the world.
   */
  setGround(y: number, normal?: [number, number, number]) {
    this.groundY = y;
    this.pos.y = y;
    this.group.position.y = y;
    if (normal) {
      this.groundN = normal;
      const [nx, ny, nz] = normal;
      // the shadow is a mark on the paper, so it follows the paper
      this.shadow.rotation.set(Math.atan2(nz, ny), 0, -Math.atan2(nx, ny));
    }
  }

  private setFrame(f: number) {
    this.tex.offset.x = f / FRAMES;
  }

  update(dt: number, move: THREE.Vector2, bounds?: { minX: number; maxX: number; minZ: number; maxZ: number }) {
    if (this.frozen || this.sitting) {
      this.vel.multiplyScalar(Math.max(0, 1 - dt * 10));
      if (this.sitting) this.setFrame(7);
      else this.animateIdle(dt);
      this.group.position.copy(this.pos);
      return;
    }

    const accel = 16;
    // a climb costs, a descent gives a little back
    const hill = 1 - Math.max(-0.22, Math.min(0.42, this.grade)) * 0.55;
    const speed0 = this.maxSpeed * (1 - 0.38 * Math.min(1, this.wobble)) * hill;
    const target = new THREE.Vector3(move.x, 0, move.y).multiplyScalar(speed0);
    this.vel.x += (target.x - this.vel.x) * Math.min(1, accel * dt * 0.45);
    this.vel.z += (target.z - this.vel.z) * Math.min(1, accel * dt * 0.45);

    this.pos.x += this.vel.x * dt;
    this.pos.z += this.vel.z * dt;
    if (bounds) {
      this.pos.x = THREE.MathUtils.clamp(this.pos.x, bounds.minX, bounds.maxX);
      this.pos.z = THREE.MathUtils.clamp(this.pos.z, bounds.minZ, bounds.maxZ);
    }
    this.group.position.copy(this.pos);

    const speed = Math.hypot(this.vel.x, this.vel.z);
    if (speed > 0.25) {
      this.heading = Math.atan2(this.vel.x, this.vel.z);
      // mirror the sprite by travel direction; keep it facing the camera plane
      this.sprite.scale.x = this.vel.x < -0.15 ? -1 : 1;

      this.walkPhase += dt * speed * 2.6;
      this.setFrame(1 + (Math.floor(this.walkPhase) % 6));

      if (this.wobble > 0) {
        // a sway that is not quite in time with the feet
        this.sprite.position.x = Math.sin(this.walkPhase * 1.7) * 0.14 * this.wobble;
      }
      this.stepAcc += speed * dt;
      if (this.stepAcc >= this.stepGate) {
        this.stepAcc = 0;
        if (this.wobble > 0) {
          this.wobbleSeed = (this.wobbleSeed * 1664525 + 1013904223) >>> 0;
          const j = (this.wobbleSeed / 0xffffffff - 0.5) * 0.36 * this.wobble;
          this.stepGate = 0.62 * (1 + j);
        }
        if (this.stamping) this.prints.stamp(this.pos, this.heading, 0.03, this.groundN);
        this.onStep?.();
      }
    } else {
      this.animateIdle(dt);
    }
  }

  private animateIdle(dt: number) {
    this.idleT += dt;
    this.setFrame(0);
    // a quiet breath
    const s = 1 + Math.sin(this.idleT * 1.8) * 0.008;
    this.sprite.scale.y = s;
  }
}
