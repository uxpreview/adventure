import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

/**
 * The whole frame passes through paper: animated grain, a soft vignette,
 * and a sub-pixel line wobble that keeps edges from feeling vector-crisp.
 */
export class PaperFX {
  composer: EffectComposer;
  private pass: ShaderPass;

  constructor(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera) {
    this.composer = new EffectComposer(renderer);
    this.composer.addPass(new RenderPass(scene, camera));
    this.pass = new ShaderPass({
      uniforms: {
        tDiffuse: { value: null },
        uTime: { value: 0 },
        uVignette: { value: 0.32 },
        uDim: { value: 1 },
        // Ten pages that were pixel-identical were "the tell that all ten
        // are the same quad" (art director Fix 3). The lamp is not in the
        // same place over every page, and the grain of one sheet is not
        // the grain of the next.
        uSeed: { value: 0.0 },
        uLamp: { value: new THREE.Vector2(0.5, 0.5) },
        uGrainK: { value: 1.0 },
      },
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform sampler2D tDiffuse;
        uniform float uTime;
        uniform float uVignette;
        uniform float uDim;
        uniform float uSeed;
        uniform vec2 uLamp;
        uniform float uGrainK;
        varying vec2 vUv;

        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
        }
        /*
         * Smooth, because the first version of the lamp's broken edge
         * used floor(vUv * 6.0) and a FLOORED hash is a grid: it cut the
         * screen into thirty cells and gave each one its own constant
         * threshold, so every frame in the game carried six faint
         * vertical blocks. Rendering the ground alone is what found it —
         * they were invisible under the art and unmistakable without it.
         */
        float vnoise(vec2 p) {
          vec2 i = floor(p), f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          return mix(
            mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
            mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
        }

        void main() {
          // hand-drawn wobble: tiny uv distortion, re-seeded a few times/sec
          float seed = floor(uTime * 3.0);
          vec2 wob = vec2(
            hash(vUv * 7.0 + seed) - 0.5,
            hash(vUv * 9.0 + seed + 4.0) - 0.5
          ) * 0.0016;
          vec4 col = texture2D(tDiffuse, vUv + wob);

          // animated paper grain — the sheet's own tooth is drawn in the
          // ground now, so this is only the pen-and-page shimmer over the
          // whole frame, and it is not the same strength page to page
          float g = hash(vUv * vec2(1280.0, 720.0) + fract(uTime) * 61.0 + uSeed * 37.0);
          col.rgb += (g - 0.5) * 0.024 * uGrainK;

          /*
           * The light in the room, not a lens. It falls off from wherever
           * the lamp is over THIS page, slightly wider across than down
           * (a desk lamp is not a spotlight), and its edge is broken by a
           * slow noise so the ten pages do not share one contour.
           */
          vec2 rel = (vUv - uLamp) * vec2(0.86, 1.14);
          float d = length(rel);
          float wob2 = (vnoise(vUv * 2.6 + uSeed * 11.0) - 0.5) * 0.06;
          col.rgb *= 1.0 - smoothstep(0.40 + wob2, 0.92 + wob2, d) * uVignette;

          // the light in the room the book is lying in (ch07's coda):
          // one multiply over the whole frame, so nothing is exempt
          col.rgb *= uDim;

          gl_FragColor = col;
        }
      `,
    });
    this.composer.addPass(this.pass);
  }

  /**
   * How much light is falling on the page. 1 is a lit room; the Chapter 7
   * coda spends four minutes walking this to almost nothing.
   */
  setDim(v: number) {
    this.pass.uniforms.uDim.value = Math.max(0, v);
  }

  setVignette(v: number) {
    this.pass.uniforms.uVignette.value = v;
  }

  /**
   * Which page this is. Moves the lamp and re-seeds the grain, so a
   * contact sheet of ten chapters stops looking like one exposure.
   */
  setPaperSeed(chapter: number) {
    const t = (chapter * 2654435761) % 1000 / 1000;
    const u = (chapter * 40503) % 997 / 997;
    this.pass.uniforms.uSeed.value = t;
    (this.pass.uniforms.uLamp.value as THREE.Vector2).set(
      0.5 + (t - 0.5) * 0.30,
      0.5 + (u - 0.5) * 0.24
    );
    this.pass.uniforms.uGrainK.value = 0.78 + u * 0.5;
  }

  setSize(w: number, h: number, dpr: number) {
    this.composer.setSize(w, h);
    this.composer.setPixelRatio(dpr);
  }

  render(dt: number) {
    this.pass.uniforms.uTime.value += dt;
    this.composer.render();
  }
}
