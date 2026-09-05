import * as THREE from 'three';
import { footprintTexture } from './ink';

export type FootprintOpts = {
  color?: number;
  /** Seconds until a print fully fades. <= 0 means prints never fade. */
  fade?: number;
  capacity?: number;
  /** World size of one print. */
  size?: number;
  /** The stamp itself, drawn in white for the shader to tint: the
   *  walker's shoe unless a land says otherwise (Session 20: the
   *  barista's dog leaves a paw). */
  map?: THREE.Texture;
};

/**
 * Instanced footprints laid flat on the page. Fading happens entirely in the
 * shader from per-instance birth times, so a full trail costs one draw call
 * and zero per-frame CPU.
 *
 * SESSION 6 — INK WEIGHT AS SPEED (WORLD-SYSTEMS §3).
 *
 * Traversal was the game's weakest verb: twelve lands and one constant
 * walking speed. The cheapest fix on the list is also the most on-brand
 * one this engine could possibly have, because the walker's whole verb
 * is that WALKING IS DRAWING — so **your speed is legible in the marks
 * you leave behind you.** Run and the print presses darker and wetter;
 * walk and it feathers.
 *
 * It is CONTINUOUS, not two-state. There is no "sprint print" texture
 * and no threshold: every print carries the pressure of the foot that
 * made it, in one per-instance float, and the shader spends it on the
 * three things pressure actually does to a ballpoint mark —
 *
 *   DARKER   more ink goes down;
 *   WETTER   it spreads past the nib and pools at the edge of the mark;
 *   FEATHERED  and at LOW pressure the opposite: the mark breaks up,
 *              because a pen barely touching paper skips.
 *
 * The last one is why the alpha is run through a gamma rather than just
 * scaled. Scaling alpha makes a light print a grey print, and a grey
 * print is a print seen through fog; a gamma above one eats the soft
 * edge of the stamp and leaves the core, which is what a skipping pen
 * actually looks like on tooth.
 *
 * A second per-instance float carries how DAMP the paper was. Wet paper
 * refuses the print entirely (that gate is `Character.stamping` and it
 * is older than this), but paper that is merely damp takes it and
 * blooms — so running across the wrack line leaves a heavier, softer
 * mark than running up the king's road does, for free.
 */
export class Footprints {
  mesh: THREE.InstancedMesh;
  private mat: THREE.ShaderMaterial;
  private birth: THREE.InstancedBufferAttribute;
  private press: THREE.InstancedBufferAttribute;
  private capacity: number;
  private head = 0;
  private dummy = new THREE.Object3D();
  private stepSide = 1;
  time = 0;
  /** Fires on every stamp — trail overlap queries, polyline recording. */
  onStamp: ((pos: THREE.Vector3, heading: number) => void) | null = null;

  constructor(opts: FootprintOpts = {}) {
    const { color = 0x232633, fade = 70, capacity = 700, size = 0.3, map } = opts;
    this.capacity = capacity;

    const geo = new THREE.PlaneGeometry(size * 0.68, size);
    geo.rotateX(-Math.PI / 2);

    const births = new Float32Array(capacity).fill(-1e9);
    this.birth = new THREE.InstancedBufferAttribute(births, 1);
    (geo as THREE.BufferGeometry).setAttribute('aBirth', this.birth);

    // x = pressure (0 a drifting walk .. 1 flat out), y = how damp the
    // page was under that foot
    const press = new Float32Array(capacity * 2);
    for (let i = 0; i < capacity; i++) press[i * 2] = 0.5;
    this.press = new THREE.InstancedBufferAttribute(press, 2);
    (geo as THREE.BufferGeometry).setAttribute('aPress', this.press);

    this.mat = new THREE.ShaderMaterial({
      uniforms: {
        uMap: { value: map ?? footprintTexture('#ffffff') },
        uColor: { value: new THREE.Color(color) },
        uTime: { value: 0 },
        uFade: { value: fade },
        uOpacity: { value: 0.85 },
        uFresh: { value: 0.25 },
      },
      vertexShader: /* glsl */ `
        attribute float aBirth;
        attribute vec2 aPress;
        varying vec2 vUv;
        varying float vBirth;
        varying vec2 vPress;
        void main() {
          vUv = uv;
          vBirth = aBirth;
          vPress = aPress;
          gl_Position = projectionMatrix * viewMatrix * instanceMatrix * modelMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform sampler2D uMap;
        uniform vec3 uColor;
        uniform float uTime;
        uniform float uFade;
        uniform float uOpacity;
        uniform float uFresh;
        varying vec2 vUv;
        varying float vBirth;
        varying vec2 vPress;
        void main() {
          vec4 t = texture2D(uMap, vUv);
          float a = t.a * t.r;
          float age = uTime - vBirth;
          if (age < 0.0) discard;

          /* ---- INK WEIGHT (Session 6) ------------------------------
           * How hard this foot came down, and how damp the page was
           * under it. One gamma and one multiply; no branch, no second
           * texture, no cost at all on a trail of seven hundred. */
          float press = vPress.x;
          float damp = vPress.y;
          // a light foot SKIPS: the gamma eats the soft edge of the
          // stamp and leaves the core, which is what a pen barely
          // touching tooth actually does. A heavy one spreads past the
          // nib, so the gamma goes the other way and the whole mark
          // widens without the stamp changing size.
          /* THE MIDDLE OF THE RANGE IS THE WALK, and the walk has to be
           * exactly the print four lands earned a WOWED with — so at
           * press 0.5 the gamma is 1.0 and the weight is 1.0, and this
           * system spends its range EITHER SIDE of the shipped mark and
           * never through it.
           *
           * It spends most of it upward, because that is where the gate
           * said it was needed: round 2's contact sheet had a walk and
           * a run that were three faint dots each and nobody could have
           * told them apart. Above the walk the mark gets darker, wider
           * and — the part that actually reads at this camera — LONGER,
           * because a running foot drags the ink out behind it. */
          a = pow(a, mix(1.60, 0.46, press) * (1.0 - 0.26 * damp));
          // and it lays down more ink while it is at it
          float weight = mix(0.66, 1.62, press) * (1.0 + 0.24 * damp);

          float life = uFade > 0.0 ? clamp(1.0 - age / uFade, 0.0, 1.0) : 1.0;
          /* fresh ink sits darker for a moment, then settles — and a
           * WET print takes longer to settle than a dry one, because
           * that is what wet ink does */
          float fresh = 1.0 + uFresh * (0.6 + 0.9 * press) *
                        exp(-age * mix(2.4, 1.1, press));
          float alpha = a * uOpacity * weight * life * fresh;
          if (alpha < 0.01) discard;
          gl_FragColor = vec4(uColor, min(alpha, 1.0));
        }
      `,
      transparent: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -4,
      polygonOffsetUnits: -8,
    });

    this.mesh = new THREE.InstancedMesh(geo, this.mat, capacity);
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = -5;
    // park all instances far below until used
    for (let i = 0; i < capacity; i++) {
      this.dummy.position.set(0, -1000, 0);
      this.dummy.updateMatrix();
      this.mesh.setMatrixAt(i, this.dummy.matrix);
    }
    this.mesh.instanceMatrix.needsUpdate = true;
  }

  setColor(c: number) {
    (this.mat.uniforms.uColor.value as THREE.Color).setHex(c);
  }
  setFade(sec: number) {
    this.mat.uniforms.uFade.value = sec;
  }
  setOpacity(o: number) {
    this.mat.uniforms.uOpacity.value = o;
  }
  /**
   * How much brighter the newest print sits before it settles. On the
   * blot the step has to read like a struck match (ch07 §5A).
   */
  setFreshBoost(k: number) {
    this.mat.uniforms.uFresh.value = k;
  }

  update(dt: number) {
    this.time += dt;
    this.mat.uniforms.uTime.value = this.time;
  }

  /**
   * Drop one print at pos, pointing along heading (radians, +Z forward).
   * `y` is clearance ABOVE pos.y, because since Session 4 pos.y is the
   * ground; `normal` lies the print along the page where the page folds.
   */
  stamp(
    pos: THREE.Vector3, heading: number, y = 0.03,
    normal?: [number, number, number], press = 0.5, damp = 0
  ) {
    this.stepSide *= -1;
    /* A run is not a walk done faster: the feet come further apart and
     * the stride swings wider, so the print steps further off the
     * centreline and the stamp itself gets bigger. Both are the same
     * one number as the ink weight, which is the point — the print is a
     * readout of the foot that made it, not a decoration on it. */
    const side = (0.11 + (press - 0.5) * 0.09) * this.stepSide;
    this.dummy.position.set(
      pos.x + Math.cos(heading) * side,
      pos.y + y,
      pos.z - Math.sin(heading) * side
    );
    if (normal) {
      this.dummy.rotation.set(
        Math.atan2(normal[2], normal[1]), heading, -Math.atan2(normal[0], normal[1]), 'YXZ'
      );
    } else {
      this.dummy.rotation.set(0, heading, 0);
    }
    /* The stamp grows ANISOTROPICALLY: a running print drags out along
     * the line of travel far more than it spreads across it. The
     * geometry is a plane rotated flat with its local +Z along the
     * heading, so z is the drag and x is the spread. At a walk both are
     * 1 and the stamp is the stamp Sessions 2–5 were judged on. */
    this.dummy.scale.set(
      1 + (press - 0.5) * 0.34 + damp * 0.10,
      1,
      1 + (press - 0.5) * 0.88 + damp * 0.12
    );
    this.dummy.updateMatrix();
    this.dummy.scale.set(1, 1, 1);
    this.mesh.setMatrixAt(this.head, this.dummy.matrix);
    this.mesh.instanceMatrix.needsUpdate = true;
    this.birth.setX(this.head, this.time);
    this.birth.needsUpdate = true;
    this.press.setXY(this.head, Math.max(0, Math.min(1, press)), Math.max(0, Math.min(1, damp)));
    this.press.needsUpdate = true;
    this.head = (this.head + 1) % this.capacity;
    this.onStamp?.(pos, heading);
  }

  /** Pre-lay a static trail (ghost footprints along a path of XZ points). */
  layTrail(points: [number, number][], spacing = 0.55) {
    for (let i = 0; i < points.length - 1; i++) {
      const [x1, z1] = points[i];
      const [x2, z2] = points[i + 1];
      const d = Math.hypot(x2 - x1, z2 - z1);
      const heading = Math.atan2(x2 - x1, z2 - z1);
      const n = Math.max(1, Math.floor(d / spacing));
      for (let s = 0; s < n; s++) {
        const t = s / n;
        this.stamp(
          new THREE.Vector3(x1 + (x2 - x1) * t, 0, z1 + (z2 - z1) * t),
          heading,
          0.011
        );
      }
    }
  }

  clear() {
    for (let i = 0; i < this.capacity; i++) this.birth.setX(i, -1e9);
    this.birth.needsUpdate = true;
    this.head = 0;
  }

  dispose() {
    this.mesh.geometry.dispose();
    this.mat.dispose();
  }
}
