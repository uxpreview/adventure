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
 *
 * SESSION 6 — TRAVERSAL. Two things arrive here and they are the two
 * halves of WORLD-SYSTEMS §3.
 *
 * **RUN.** One continuous scalar, never a mode. `Input` hands up a
 * `pace` of 0..1 (Shift on a keyboard, how far you dragged the stick on
 * a phone), and every consequence is a lerp on it: top speed, stride
 * length, cadence, the ink weight of the print, the gain of the step,
 * and how far the score leans in. There is no sprint button state
 * anywhere in this game and there is deliberately no stamina — nothing
 * is urgent (WORLD-SYSTEMS §0 rule 2), so running is a texture and not
 * a resource.
 *
 * **THE ROAD CARRIES.** `carry` is set every frame from
 * `layout.roadCarryAt` and it does exactly one thing: it rotates the
 * direction you are ALREADY GOING toward the direction the road goes,
 * and gives you a little speed for agreeing. It never pulls sideways
 * and it never once moves you toward the centreline — see the long note
 * on `applyCarry`, which is where the whole "felt, not fought" rule
 * lives.
 */
export class Character {
  group = new THREE.Group();
  pos = new THREE.Vector3();
  vel = new THREE.Vector3();
  heading = 0;
  /** The walk. Unchanged since Session 1 — a run is faster than this,
   *  never slower, so nothing that was tuned against it moves. */
  maxSpeed = 4.1;
  /** Flat out, as a multiple of the walk. Chosen against the camera and
   *  not against a feel: the frame is about fifty-five units wide and
   *  the camera's horizontal follow is damped at 3.2, so much past
   *  1.5× the walker starts to out-run their own frame and the world
   *  arrives as a smear instead of as a place. */
  runMult = 1.5;
  /**
   * HOW HARD THE PLAYER IS ASKING TO GO, 0..1 of flat out. Set by App
   * from `Input.run`; continuous, and there is no state behind it.
   */
  runIntent = 0;
  /** The fraction of top speed being ASKED for. The velocity is what
   *  happens to it after the hill, the road and the damping. */
  pace = 0;
  /** What the road under the walker is doing (layout.roadCarryAt). */
  carry: { k: number; tx: number; tz: number } = { k: 0, tx: 0, tz: 0 };
  /** How damp the page is underfoot, 0..1 — the print blooms on it. */
  damp = 0;
  /**
   * SITTING IN THE BOAT. A walk cycle in a rowboat is a person jogging
   * on the spot in a rowboat, which is what the first build looked
   * like. Rowing is its own posture: the figure holds still and works
   * from the shoulders, and the stroke is a lean rather than a step.
   */
  rowing = false;
  /**
   * The pressure of the last foot down, 0..1: what the print is drawn
   * with, what the step is played at, and what the score leans on.
   * Damped, because a footfall is a body and a body has mass.
   */
  effort = 0;
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
  /** The stride actually being walked, in units per step. A run's feet
   *  come further apart; this is what makes running read as running in
   *  the trail rather than just as more prints. */
  private strideNow = 0.62;
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
    /* THE PACE.
     *
     * `move` keeps exactly the meaning it has had since Session 1 — a
     * direction whose LENGTH is how much of the walk you are asking
     * for, so half a drag is still half a walk and nothing tuned
     * against that moves. Running is a second, separate scalar on top
     * (`runIntent`), and it only counts once you are already asking for
     * most of a walk: leaning on the stick while barely steering should
     * not launch anybody.
     *
     * There is no stamina and there is no cooldown. Nothing in this
     * world is urgent (WORLD-SYSTEMS §0 rule 2), so a run is a texture,
     * not a resource, and the only thing that ever takes it away is a
     * hill. */
    const want = Math.hypot(move.x, move.y);
    let dx = want > 1e-4 ? move.x / want : 0;
    let dz = want > 1e-4 ? move.y / want : 0;
    const runK = this.runIntent * Math.min(1, Math.max(0, (want - 0.55) / 0.35));
    const run = 1 + (this.runMult - 1) * runK;
    this.pace = Math.min(1, (want * run) / this.runMult);

    /* THE ROAD, if there is one under us and we are already going its
     * way. Returns the direction to actually travel and what the road
     * gives back for agreeing with it. */
    const carried = this.applyCarry(dx, dz);
    dx = carried.x;
    dz = carried.z;

    const speed0 = this.maxSpeed * Math.min(1, want) * run * carried.gain
                 * (1 - 0.38 * Math.min(1, this.wobble)) * hill;
    const target = new THREE.Vector3(dx, 0, dz).multiplyScalar(speed0);
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
    /* EFFORT, damped. Taken from the speed actually being achieved and
     * not from the key being held, so a climb reads as a climb: hold
     * shift up the banner avenue and the hill eats most of it, and the
     * prints say so. Asymmetric on purpose — a body leans into a run
     * over about a second and settles out of one faster than that. */
    const wantEffort = Math.max(0, Math.min(1,
      (speed / this.maxSpeed - 0.5) / (this.runMult - 0.5)));
    const rate = wantEffort > this.effort ? 1.6 : 3.2;
    this.effort += (wantEffort - this.effort) * (1 - Math.exp(-dt * rate));

    if (speed > 0.25) {
      this.heading = Math.atan2(this.vel.x, this.vel.z);
      // mirror the sprite by travel direction; keep it facing the camera plane
      this.sprite.scale.x = this.vel.x < -0.15 ? -1 : 1;

      /* CADENCE. The walk cycle already ran off distance travelled, so
       * it speeds up on its own — but a run is not a walk played back
       * fast, it is a longer stride at a higher cadence, and the two
       * do not scale together. So the stride opens up (below) and the
       * cycle takes a little of the speed back, which keeps the feet
       * landing where the prints land. */
      this.walkPhase += dt * speed * (2.6 - 0.5 * this.effort);
      if (this.rowing) {
        // nobody walks in a boat: hold the standing frame and put the
        // stroke in the body — a lean forward on the catch, back on the
        // pull, timed off distance made good exactly like a footstep
        this.setFrame(0);
        this.sprite.rotation.z = Math.sin(this.walkPhase * 1.15) * 0.10;
        this.sprite.position.y = -0.02 + Math.sin(this.walkPhase * 1.15) * 0.05;
      } else {
        this.setFrame(1 + (Math.floor(this.walkPhase) % 6));
      }

      if (this.wobble > 0) {
        // a sway that is not quite in time with the feet
        this.sprite.position.x = Math.sin(this.walkPhase * 1.7) * 0.14 * this.wobble;
      }
      this.stepAcc += speed * dt;
      if (this.stepAcc >= this.strideNow) {
        this.stepAcc = 0;
        this.strideNow = this.stepGate * (1 + 0.34 * this.effort);
        if (this.wobble > 0) {
          this.wobbleSeed = (this.wobbleSeed * 1664525 + 1013904223) >>> 0;
          const j = (this.wobbleSeed / 0xffffffff - 0.5) * 0.36 * this.wobble;
          this.stepGate = 0.62 * (1 + j);
        }
        if (this.stamping) {
          this.prints.stamp(this.pos, this.heading, 0.03, this.groundN, this.effort, this.damp);
        }
        this.onStep?.();
      }
    } else {
      this.animateIdle(dt);
    }
  }

  /* ================================================================ *
   * THE ROAD CARRIES — WORLD-SYSTEMS §3, "the line pulls the pen".
   *
   * Nine authored roads have been decoration since Session 1: the
   * terrain paints them, the map draws them, and crossing one has never
   * once meant anything. This is the change that turns the web into
   * infrastructure, and it is worth being exact about what it may and
   * may not do, because the brief for it is one sentence:
   *
   *     IT HAS TO BE FELT, NOT FOUGHT.
   *
   * If a player ever NOTICES they are being steered it is wrong, and if
   * they walk off the road and the game tugs them back it is worse than
   * wrong. Three properties keep it honest, and all three are here:
   *
   *  1. IT ROTATES, IT NEVER PULLS. The only thing this function
   *     returns is a direction and a gain. There is no term anywhere in
   *     it that points at the centreline, so leaving a road is exactly
   *     as free as it was before this session and stepping across one
   *     costs nothing at all. A road you are walking off is a road that
   *     lets go.
   *  2. IT IS GATED ON ALIGNMENT. The gate opens between about
   *     fifty-six and twenty-three degrees off the road's own bearing,
   *     so it can only ever tidy a walk that was already down the road.
   *     Cross the king's road and it does nothing; angle onto it and it
   *     takes the last few degrees off for you, which is the feeling
   *     the whole thing is for — A LINE YOU ARE ALREADY ON.
   *  3. IT CANNOT WIN AN ARGUMENT. The rotation is capped per second
   *     AND capped at a fraction of the angle remaining, so it always
   *     converges and never overshoots, and holding a direction against
   *     it walks you out of the band in a couple of seconds.
   *
   * The strength is AUTHORED per road (`layout.Road.carry`), not
   * guessed, and STORY §4 is what authors it: the king's road, main
   * street and the commuter spur are one road under twelve names, and
   * the reveal in Act III is that it was surveyed as a railway. Those
   * three carry hardest. The forest track barely carries at all,
   * because a trail does not.
   * ================================================================ */
  private applyCarry(dx: number, dz: number) {
    const c = this.carry;
    if (c.k <= 0.001 || (dx === 0 && dz === 0)) return { x: dx, z: dz, gain: 1 };
    // the road runs both ways; take the end we are facing
    const dot = dx * c.tx + dz * c.tz;
    const sgn = dot >= 0 ? 1 : -1;
    const tx = c.tx * sgn;
    const tz = c.tz * sgn;
    const align = Math.abs(dot);
    // 0.55 ≈ 56° off, 0.92 ≈ 23° off
    const t = Math.max(0, Math.min(1, (align - 0.55) / 0.37));
    const gate = t * t * (3 - 2 * t);
    if (gate <= 0.001) return { x: dx, z: dz, gain: 1 };

    const strength = c.k * gate;
    /* THE BEND IS A FRACTION OF THE ANGLE, NOT A RATE.
     *
     * The first build applied a per-second rotation to the raw input
     * every frame — and a rotation applied to a value that is re-read
     * from scratch every frame does not accumulate. Measured on the
     * king's road it deflected a walk by half a degree and the whole
     * feature was, in practice, switched off. The instrument found it;
     * the eye never would have.
     *
     * What a road actually does is BEND you. So take a fixed share of
     * the angle between where you are pointed and where the road goes,
     * every frame, which is stable, frame-rate independent, and settles
     * instantly into a steady deflection: on the line, a walk aimed
     * twenty degrees off the road travels about seven degrees off it.
     * You are not being moved. You are being LEANED. */
    /* The signed angle FROM where we are pointed TO where the road
     * goes, in the (x, z) sense the rotation below uses. Getting this
     * backwards steers you off the road instead of along it, which is
     * exactly what the first measured run did: aimed ten degrees off
     * the king's road, the walker travelled sixteen. */
    const cross = dx * tz - dz * tx;
    const ang = Math.atan2(cross, Math.abs(dot));
    const step = ang * Character.CARRY_BEND * strength;
    const ca = Math.cos(step);
    const sa = Math.sin(step);
    return {
      x: dx * ca - dz * sa,
      z: dx * sa + dz * ca,
      gain: 1 + Character.CARRY_GAIN * strength,
    };
  }

  /** What share of the angle a road at full strength takes off a walk
   *  that is already going its way. Three fifths is the number the
   *  instrument settled on: below about a half nobody can feel it, and
   *  above about three quarters the road stops being a suggestion and
   *  a player aiming off it notices they are being held. */
  private static CARRY_BEND = 0.6;
  /** And what the road gives back for agreeing with it. A fifth on the
   *  line, a tenth on a lane, a fifteenth on the canyon trail — a road
   *  is faster walking, it is not a conveyor. */
  private static CARRY_GAIN = 0.2;

  private animateIdle(dt: number) {
    this.idleT += dt;
    this.effort += (0 - this.effort) * (1 - Math.exp(-dt * 3.2));
    if (this.rowing) {
      this.sprite.rotation.z *= Math.max(0, 1 - dt * 4);
      this.sprite.position.y *= Math.max(0, 1 - dt * 4);
    }
    this.setFrame(0);
    // a quiet breath
    const s = 1 + Math.sin(this.idleT * 1.8) * 0.008;
    this.sprite.scale.y = s;
  }
}
