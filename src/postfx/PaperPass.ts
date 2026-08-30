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
        /* ---- THE DAY (Session 6) ------------------------------------
         * The hour grades the finished frame here and NOWHERE else.
         *
         * That is not a shortcut, it is the only place it can legally
         * live. Three standing laws point at this pass and no other:
         * washes come only from palette.ts, so the hour may not repaint
         * the wash field; a fold is DRAWN and not shaded, so the hour
         * may not touch the terrain shader's marks; and the fog, the
         * clear colour, every standee, every decal and every footprint
         * would each need their own tint if the grade were applied per
         * object — twelve region builders and forty materials, and one
         * of them would always be the one that forgot.
         *
         * One multiply after everything, and nothing in the world is
         * exempt. It also costs six instructions, which is what a day
         * cycle has to cost to pass tools/shoot-fps.mjs.
         *
         *   uDayTint   the colour of the light (normalised in daylight.ts)
         *   uDayValue  how much of it there is
         *   uDayLamp   how much of it is the DESK LAMP — the thing that
         *              makes night a page on a desk instead of a page
         *              in a cave. It deepens the pool the vignette was
         *              already drawing, warms its middle and cools its
         *              edge, so after dark you are standing in a light
         *              rather than under a filter.
         */
        uDayTint: { value: new THREE.Vector3(1, 1, 1) },
        uDayValue: { value: 1 },
        uDayLamp: { value: 0 },
        uPoolWarm: { value: new THREE.Vector3(1, 1, 1) },
        uPoolCool: { value: new THREE.Vector3(1, 1, 1) },
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
        uniform vec3 uDayTint;
        uniform float uDayValue;
        uniform float uDayLamp;
        uniform vec3 uPoolWarm;
        uniform vec3 uPoolCool;
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
          /* After dark the pool tightens and deepens — that is the whole
           * difference between "the lights went out" and "the desk lamp
           * came on", and it is the sentence WORLD-SYSTEMS §7 uses to
           * justify the entire day cycle. */
          float inner = 0.40 - 0.05 * uDayLamp;
          float fall = smoothstep(inner + wob2, 0.94 + wob2, d);
          col.rgb *= 1.0 - fall * (uVignette + 0.12 * uDayLamp);

          /* ---- THE HOUR, ON THE PAPER ONLY -------------------------
           * Weighted by how bright the pixel already is. Round 1 of the
           * gate called the first version SEPIA and it was right: a
           * flat multiply by the light's colour repaints the greens,
           * the greys and the LINE WORK, and a world whose ballpoint
           * goes brown at teatime has stopped being made of ballpoint.
           *
           * Warm light warms what it lands on. The sheet's own white
           * takes nearly all of the hour; a dark green hedge takes a
           * quarter of it; the ink takes none. Where the hour actually
           * declares itself is the HAZE, which is scene fog and is set
           * from the same state (see world/daylight.ts, skyOf). */
          float lum = dot(col.rgb, vec3(0.30, 0.59, 0.11));

          /* One quarter-step of desaturation after dark, and no more —
           * and it happens FIRST, against the pixel's own luminance.
           * Doing it last mixes the darkened colour back toward the
           * UNDARKENED luminance, which quietly lifts the whole page:
           * a bug that made midnight brighter than it was authored to
           * be and took a pixel probe rather than an eye to find. */
          col.rgb = mix(vec3(lum), col.rgb, 1.0 - 0.22 * uDayLamp);

          float take = smoothstep(0.06, 0.86, lum) * 0.78;
          col.rgb *= mix(vec3(1.0), uDayTint, take);
          /* And how much light there is, which IS flat: a room with
           * less light in it has less light in all of it. */
          col.rgb *= mix(1.0, uDayValue, 0.42 + 0.58 * take);

          /* And the lamp itself: warm where it falls, cold where it does
           * not. Two multiplies, no gradient down anything the pen drew
           * — this is the light in the ROOM, and the room is allowed to
           * have a shape because it is not part of the drawing. */
          col.rgb *= mix(vec3(1.0), uPoolWarm, (1.0 - fall) * uDayLamp);
          col.rgb *= mix(vec3(1.0), uPoolCool, fall * uDayLamp);

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

  /**
   * WHAT TIME IT IS, applied to the whole frame. Called once a frame
   * from App with `daylight.ts`'s state; nothing else in the game needs
   * to know the hour to be lit by it.
   */
  setDay(
    tint: [number, number, number], value: number, lamp: number,
    poolWarm: [number, number, number], poolCool: [number, number, number]
  ) {
    (this.pass.uniforms.uDayTint.value as THREE.Vector3).set(tint[0], tint[1], tint[2]);
    this.pass.uniforms.uDayValue.value = value;
    this.pass.uniforms.uDayLamp.value = lamp;
    (this.pass.uniforms.uPoolWarm.value as THREE.Vector3).set(poolWarm[0], poolWarm[1], poolWarm[2]);
    (this.pass.uniforms.uPoolCool.value as THREE.Vector3).set(poolCool[0], poolCool[1], poolCool[2]);
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

  /** THE GRAIN IS A CLOCK. The pen-and-page shimmer and the hand-drawn
   *  wobble are both hashed off `uTime` — a one-pixel random resample of
   *  every ink edge in the frame, re-seeded three times a second. Two
   *  screenshots taken at two different `uTime`s therefore differ in
   *  every line in the picture, which is why the regression harness pins
   *  this as well as the world's own clock (see `__inklands.setTime`). */
  setTime(t: number) {
    this.pass.uniforms.uTime.value = t;
  }
}
