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

  constructor(tex: THREE.Texture, capacity: number, opts: StandeeFieldOpts) {
    const {
      w, h,
      ghost = 0.14,
      baseOpacity = 1,
      color = 0xffffff,
      overshoot = 0.12,
      decal = false,
      wind,
    } = opts;
    this.count = capacity;

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
        uQuadH: { value: h },
        uPlayer: { value: new THREE.Vector2(1e6, 1e6) },
      },
      vertexShader: /* glsl */ `
        attribute float aBirth;
        uniform float uTime;
        uniform float uOvershoot;
        uniform vec2 uWind;
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
            wp.x += sway * uWind.x * hFac * hFac;
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
    for (let i = 0; i < capacity; i++) {
      this.dummy.position.set(0, -1000, 0);
      this.dummy.updateMatrix();
      this.mesh.setMatrixAt(i, this.dummy.matrix);
    }
  }

  /** Place instance i. Negative scaleX flips the silhouette. */
  set(i: number, x: number, z: number, scale = 1, rotY = 0, flip = false) {
    this.positions[i] = { x, z };
    this.dummy.position.set(x, 0.001 + (i % 7) * 0.0004, z);
    this.dummy.rotation.set(0, rotY, 0);
    this.dummy.scale.set(flip ? -scale : scale, scale, scale);
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
      if (!p) continue;
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
