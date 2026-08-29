import * as THREE from 'three';
import { footprintTexture } from './ink';

export type FootprintOpts = {
  color?: number;
  /** Seconds until a print fully fades. <= 0 means prints never fade. */
  fade?: number;
  capacity?: number;
  /** World size of one print. */
  size?: number;
};

/**
 * Instanced footprints laid flat on the page. Fading happens entirely in the
 * shader from per-instance birth times, so a full trail costs one draw call
 * and zero per-frame CPU.
 */
export class Footprints {
  mesh: THREE.InstancedMesh;
  private mat: THREE.ShaderMaterial;
  private birth: THREE.InstancedBufferAttribute;
  private capacity: number;
  private head = 0;
  private dummy = new THREE.Object3D();
  private stepSide = 1;
  time = 0;
  /** Fires on every stamp — trail overlap queries, polyline recording. */
  onStamp: ((pos: THREE.Vector3, heading: number) => void) | null = null;

  constructor(opts: FootprintOpts = {}) {
    const { color = 0x232633, fade = 70, capacity = 700, size = 0.3 } = opts;
    this.capacity = capacity;

    const geo = new THREE.PlaneGeometry(size * 0.68, size);
    geo.rotateX(-Math.PI / 2);

    const births = new Float32Array(capacity).fill(-1e9);
    this.birth = new THREE.InstancedBufferAttribute(births, 1);
    (geo as THREE.BufferGeometry).setAttribute('aBirth', this.birth);

    this.mat = new THREE.ShaderMaterial({
      uniforms: {
        uMap: { value: footprintTexture('#ffffff') },
        uColor: { value: new THREE.Color(color) },
        uTime: { value: 0 },
        uFade: { value: fade },
        uOpacity: { value: 0.85 },
        uFresh: { value: 0.25 },
      },
      vertexShader: /* glsl */ `
        attribute float aBirth;
        varying vec2 vUv;
        varying float vBirth;
        void main() {
          vUv = uv;
          vBirth = aBirth;
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
        void main() {
          float a = texture2D(uMap, vUv).a * texture2D(uMap, vUv).r;
          float age = uTime - vBirth;
          if (age < 0.0) discard;
          float life = uFade > 0.0 ? clamp(1.0 - age / uFade, 0.0, 1.0) : 1.0;
          // fresh ink sits darker for a moment, then settles
          float fresh = 1.0 + uFresh * exp(-age * 2.0);
          float alpha = a * uOpacity * life * fresh;
          if (alpha < 0.01) discard;
          gl_FragColor = vec4(uColor, alpha);
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
  stamp(pos: THREE.Vector3, heading: number, y = 0.03, normal?: [number, number, number]) {
    this.stepSide *= -1;
    const side = 0.11 * this.stepSide;
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
    this.dummy.updateMatrix();
    this.mesh.setMatrixAt(this.head, this.dummy.matrix);
    this.mesh.instanceMatrix.needsUpdate = true;
    this.birth.setX(this.head, this.time);
    this.birth.needsUpdate = true;
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
