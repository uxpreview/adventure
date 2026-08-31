import * as THREE from 'three';

export type StandeeFieldOpts = {
  /** World size of one quad. */
  w: number;
  h: number;
  /** Opacity before birth (the ghost page) and after re-inking. */
  ghost?: number;
  baseOpacity?: number;
  color?: number;
  /** 0 disables the birth spring (perf degrade path, ch01 §9). */
  overshoot?: number;
  /** Ground decal instead of standing quad. */
  decal?: boolean;
  /**
   * Wind sway (THE COMMON spec §9.1): every instance leans on a
   * per-instance phase, amplitude scaled by height up the quad, and
   * bends away from the walker set via setPlayer(). Vertex-stage only.
   */
  wind?: { amp: number; freq: number };
  /**
   * ONE GUST CROSSING A WHOLE FIELD (Session 10, THE HARROW DOWNS).
   *
   * `wind` above is per-instance sway on a phase hashed off world
   * position, and its coefficients are large on purpose — neighbouring
   * blades are uncorrelated, which is what grass does. A field of corn
   * does the opposite: it moves in one piece, in a wave you can watch
   * arrive. That is the same term with a SMALL spatial coefficient and
   * a one-sided envelope, so the gust passes rather than oscillating.
   *
   *   amp    how far the heads go over at the peak of it
   *   speed  radians a second — one gust every 2π/speed
   *   len    world units per radian across the field; the wave travels
   *          along +x, which in the Downs is the wind off the wood
   *
   * Requires `wind` to be set: it rides in the same vertex term.
   */
  wave?: { amp: number; speed: number; len: number };
  /**
   * The ground under an instance (Session 4). Set once by ctx.field, so
   * the twelve region builders never have to think about height: every
   * f.set(i, x, z, ...) call already written stands the instance on the
   * page's real surface. Standees stay VERTICAL on a slope — they are
   * cutouts on a warped sheet, not objects lying on a hill.
   */
  ground?: (x: number, z: number) => number;
};

/**
 * Instanced standee field (ARCHITECTURE #1): hundreds of small quads
 * sharing one texture and one draw call. Each instance has a birth time;
 * before it the quad sits at ghost opacity, at it the quad springs to
 * full ink (fade-in with overshoot, computed entirely in-shader).
 * `cascadeFrom` assigns distance-ordered births — the radial re-ink wave.
 */
export class StandeeField {
  mesh: THREE.InstancedMesh;
  private mat: THREE.ShaderMaterial;
  private birth: THREE.InstancedBufferAttribute;
  private positions: { x: number; z: number }[] = [];
  private dummy = new THREE.Object3D();
  private count: number;
  private ground: ((x: number, z: number) => number) | null;
  private isDecal: boolean;
  /** The authored opacities, so setDim can be a multiply and not a set. */
  private base: number;
  private ghost: number;

  constructor(tex: THREE.Texture, capacity: number, opts: StandeeFieldOpts) {
    const {
      w, h,
      ghost = 0.14,
      baseOpacity = 1,
      color = 0xffffff,
      overshoot = 0.12,
      decal = false,
      wind,
      wave,
      ground,
    } = opts;
    this.count = capacity;
    this.base = baseOpacity;
    this.ghost = ghost;
    this.ground = ground ?? null;
    this.isDecal = decal;

    const geo = new THREE.PlaneGeometry(w, h);
    if (decal) geo.rotateX(-Math.PI / 2);
    else geo.translate(0, h / 2, 0);
    const births = new Float32Array(capacity).fill(1e9);
    this.birth = new THREE.InstancedBufferAttribute(births, 1);
    geo.setAttribute('aBirth', this.birth);

    this.mat = new THREE.ShaderMaterial({
      uniforms: {
        uMap: { value: tex },
        uColor: { value: new THREE.Color(color) },
        uTime: { value: 0 },
        uGhost: { value: ghost },
        uBase: { value: baseOpacity },
        uOvershoot: { value: overshoot },
        uWind: { value: new THREE.Vector2(wind?.amp ?? 0, wind?.freq ?? 0) },
        uWave: { value: new THREE.Vector3(wave?.amp ?? 0, wave?.speed ?? 0, wave?.len ?? 0) },
        uQuadH: { value: h },
        uPlayer: { value: new THREE.Vector2(1e6, 1e6) },
      },
      vertexShader: /* glsl */ `
        attribute float aBirth;
        uniform float uTime;
        uniform float uOvershoot;
        uniform vec2 uWind;
        uniform vec3 uWave;
        uniform float uQuadH;
        uniform vec2 uPlayer;
        varying vec2 vUv;
        varying float vWake;
        void main() {
          vUv = uv;
          float t = uTime - aBirth;
          vWake = clamp(t / 0.45, 0.0, 1.0);
          // back-out scale spring around the quad's base
          float spring = t > 0.0 ? 1.0 + uOvershoot * exp(-t * 4.0) * sin(min(t, 1.2) * 9.0) : 1.0;
          vec3 p = position * spring;
          vec4 wp = instanceMatrix * modelMatrix * vec4(p, 1.0);
          if (uWind.x > 0.0) {
            // the wind, and the walker: both act on the top of the
            // blade, in world space so flips and rotations stay honest
            vec2 origin = vec2(instanceMatrix[3][0], instanceMatrix[3][2]);
            float hFac = clamp(position.y / uQuadH, 0.0, 1.0);
            float phase = origin.x * 1.7 + origin.y * 2.3;
            float sway = sin(uTime * uWind.y + phase)
                       + 0.5 * sin(uTime * uWind.y * 2.7 + phase * 1.3);
            // THE GUST: one wave crossing the whole field, one-sided so
            // it arrives, passes, and leaves the corn standing again
            float g = 0.0;
            if (uWave.x > 0.0) {
              float w = sin(uTime * uWave.y - origin.x * uWave.z);
              g = max(0.0, w) * max(0.0, w) * uWave.x;
            }
            wp.x += (sway * uWind.x + g) * hFac * hFac;
            vec2 away = origin - uPlayer;
            float d = length(away);
            if (d < 1.7 && d > 1e-4) {
              wp.xz += (away / d) * (1.0 - d / 1.7) * 0.55 * hFac;
            }
          }
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform sampler2D uMap;
        uniform vec3 uColor;
        uniform float uGhost;
        uniform float uBase;
        varying vec2 vUv;
        varying float vWake;
        void main() {
          vec4 tex = texture2D(uMap, vUv);
          float alpha = tex.a * mix(uGhost, uBase, vWake);
          if (alpha < 0.012) discard;
          gl_FragColor = vec4(tex.rgb * uColor, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    });

    this.mesh = new THREE.InstancedMesh(geo, this.mat, capacity);
    this.mesh.frustumCulled = false;
    /* Unused capacity is parked at ZERO SCALE, not merely a thousand
     * units under the page. A field is often created at the size a
     * scatter was ASKED for and `ctx.scatter` is allowed to return
     * fewer (it gives up after so many tries against water, road and
     * slope), so most fields in this world carry a few seats nobody
     * sits in. They were full-size quads a thousand units down, which
     * is invisible by luck rather than by construction. */
    for (let i = 0; i < capacity; i++) {
      this.dummy.position.set(0, -1000, 0);
      this.dummy.scale.set(0, 0, 0);
      this.dummy.updateMatrix();
      this.mesh.setMatrixAt(i, this.dummy.matrix);
    }
    this.dummy.scale.set(1, 1, 1);
  }

  /** Place instance i. Negative scaleX flips the silhouette. */
  set(i: number, x: number, z: number, scale = 1, rotY = 0, flip = false) {
    this.positions[i] = { x, z };
    const g = this.ground ? this.ground(x, z) : 0;
    // a decal is a mark on the page and needs clearance over a fold; a
    // standee is a cutout and only needs its feet on the ground
    this.dummy.position.set(x, g + (this.isDecal ? 0.05 : 0.001) + (i % 7) * 0.0004, z);
    this.dummy.rotation.set(0, rotY, 0);
    this.dummy.scale.set(flip ? -scale : scale, scale, scale);
    this.dummy.updateMatrix();
    this.mesh.setMatrixAt(i, this.dummy.matrix);
    this.mesh.instanceMatrix.needsUpdate = true;
  }

  /**
   * TAKE INSTANCE i OFF THE PAGE WITHOUT LYING ABOUT WHERE IT IS.
   *
   * Every creature in this world that has more than one posture is drawn
   * as one instanced field per pose with a single instance showing at a
   * time, and the way the world hid the other poses was
   * `set(i, x, -4000, 0.001)` — park it four thousand units away at a
   * thousandth of its size.
   *
   * **That is a lie, and `positions` is the field's answer to "where is
   * instance i".** `cascadeFrom` reads it: a gull parked at z = −4000
   * came out four thousand units from the walker, and four thousand
   * units at the ink wave's thirty-four a second is a birth **ninety-
   * seven seconds in the future**. Until then the shader draws it at
   * `uGhost` — sixteen per cent — which is invisible against paper.
   *
   * So every animal in the game vanished the moment it changed posture,
   * for the first hundred seconds in each land, which is all the time
   * anybody spends near it. The only ones that worked were Brim's
   * pigeons, Brim's swallows and Greyweather's rooks, and they worked
   * because they are one-off `ctx.standee` meshes with no birth
   * attribute to get wrong. Reported by the owner; found by asking the
   * running page what its births actually were.
   *
   * The instance drops straight down under its own feet at zero scale.
   * `positions[i]` keeps the truth, so the cascade, `wakeNear` and
   * `awakeCount` all still see a creature standing where it stands.
   *
   * (The other half of that rule, for anyone adding a field later: an
   * instance that has NEVER been placed has no position at all, and
   * `cascadeFrom` skips it and it is never born. Place every instance
   * once at build time, or hide it — do not leave it untouched.)
   */
  hide(i: number, x: number, z: number) {
    this.positions[i] = { x, z };
    this.dummy.position.set(x, -4000, z);
    this.dummy.rotation.set(0, 0, 0);
    this.dummy.scale.set(0, 0, 0);
    this.dummy.updateMatrix();
    this.mesh.setMatrixAt(i, this.dummy.matrix);
    this.mesh.instanceMatrix.needsUpdate = true;
  }

  /** Wake instance i at absolute shader time t (pass current time for now). */
  setBirth(i: number, t: number) {
    this.birth.setX(i, t);
    this.birth.needsUpdate = true;
  }

  birthAll(t: number) {
    for (let i = 0; i < this.count; i++) this.birth.setX(i, t);
    this.birth.needsUpdate = true;
  }

  /**
   * Radial re-ink cascade (ARCHITECTURE #27): births ordered by distance
   * from (x,z), travelling at `speed` world-units/s starting at `now`.
   * Instances already awake keep their earlier birth.
   */
  cascadeFrom(x: number, z: number, speed: number, now: number, jitter = 0.15, reach = Infinity) {
    for (let i = 0; i < this.count; i++) {
      const p = this.positions[i];
      if (!p) {
        /* A seat nobody sits in. It draws nothing, so its birth cannot
         * matter — but leaving it at infinity means a cascaded field is
         * only MOSTLY born, and "a cascaded field is wholly born" is
         * the invariant `tools/check-fields.mjs` asserts to keep the
         * ghosted-animal bug from coming back. Give it the wave's own
         * start and the invariant is exact. */
        if (now < this.birth.getX(i)) this.birth.setX(i, now);
        continue;
      }
      const d = Math.hypot(p.x - x, p.z - z);
      // the wave carries only so far: past its reach the page stays
      // ghosted, and the rest of the sheet is the player's to walk
      if (d > reach) continue;
      const t = now + d / speed + (Math.sin(i * 12.9898) * 0.5 + 0.5) * jitter;
      if (t < this.birth.getX(i)) this.birth.setX(i, t);
    }
    this.birth.needsUpdate = true;
  }

  /**
   * Wake every instance within `radius` of (x,z) that is still ghosted,
   * and report how many woke this call (ch01's "light the meadow":
   * the page inks where the player walks, blade by blade, and the count
   * is the region's meter). `only` restricts the sweep to one region's
   * instances.
   */
  wakeNear(x: number, z: number, radius: number, now: number, only?: number[]): number {
    let woke = 0;
    const r2 = radius * radius;
    const idx = only ?? null;
    const n = idx ? idx.length : this.count;
    for (let k = 0; k < n; k++) {
      const i = idx ? idx[k] : k;
      const p = this.positions[i];
      if (!p) continue;
      if (this.birth.getX(i) < 1e8) continue; // already awake or scheduled
      const dx = p.x - x;
      const dz = p.z - z;
      if (dx * dx + dz * dz > r2) continue;
      // a tiny per-instance stagger so a sweep reads as blades catching,
      // not as a rectangle switching on
      this.birth.setX(i, now + (Math.sin(i * 12.9898) * 0.5 + 0.5) * 0.22);
      woke++;
    }
    if (woke) this.birth.needsUpdate = true;
    return woke;
  }

  /** How many of these instances are awake (or scheduled to wake). */
  awakeCount(only?: number[]): number {
    let n = 0;
    const list = only ?? null;
    const len = list ? list.length : this.count;
    for (let k = 0; k < len; k++) {
      const i = list ? list[k] : k;
      if (this.positions[i] && this.birth.getX(i) < 1e8) n++;
    }
    return n;
  }

  setOvershoot(v: number) {
    this.mat.uniforms.uOvershoot.value = v;
  }

  /**
   * DIM THE WHOLE FIELD (Session 7). One multiply over both the inked
   * and the ghost opacity, so a field can be taken off the page without
   * touching a single instance — which is how Brim's folk go home.
   *
   * The day cycle multiplies every land already built for free
   * (WORLD-SYSTEMS §7), and Session 6 spent that on lamps. This is the
   * other half of the same argument: a walled town at three in the
   * morning has nobody standing in its square, and a routine that only
   * one named person keeps is not a routine, it is an exception.
   */
  setDim(k: number) {
    this.mat.uniforms.uBase.value = this.base * k;
    this.mat.uniforms.uGhost.value = this.ghost * k;
    this.mesh.visible = k > 0.02;
  }

  update(time: number) {
    this.mat.uniforms.uTime.value = time;
  }

  /** Where the walker is, for the grass-parting bend (wind fields only). */
  setPlayer(x: number, z: number) {
    (this.mat.uniforms.uPlayer.value as THREE.Vector2).set(x, z);
  }

  dispose() {
    this.mesh.geometry.dispose();
    this.mat.dispose();
  }
}
