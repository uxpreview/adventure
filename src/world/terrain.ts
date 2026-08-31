import * as THREE from 'three';
import { PAPER_HEX, PAPER, INK_HEX, WASH } from '../engine/palette';
import {
  paperGrainTexture, paperSheetTexture, deskGrainTexture, paperSpec,
} from '../engine/paper';
import {
  WORLD, REGION_SPECS, ROADS, BRIDGES, PLANKS, coastX, seaAt, waterFieldAt,
  barDist, fordAt,
  type Rect,
} from './layout';
import {
  HeightField, H_STEP, H_MIN_X, H_MAX_X, H_MIN_Z, H_MAX_Z, MAX_WALK_SLOPE, SHEET_PAD,
  holdfastK, tearFloorK,
} from './elevation';

export { coastX };

/**
 * THE SHEET — the entire world as one page.
 *
 * Margins gave every chapter its own small sheet with an edge; here
 * there is exactly one sheet, seven hundred and sixty units across,
 * and everything the player will ever walk is drawn on it. The page
 * keeps its tooth, its foxing and its torn edge onto the desk; what is
 * new is UNDER the line work: a painted field of muted washes, one per
 * land, with the roads and the water laid into it. Sketch first, real
 * second — the wash never covers the paper, it stains it.
 *
 * Session 4 gave the page a SHAPE (see elevation.ts). The mesh is no
 * longer a quad: it is displaced from the height field, and every vertex
 * carries the two numbers a pen would need to draw the fold — how the
 * surface leans away from the light, and how sharply it is cupped. The
 * fragment shader turns those into shading and into the shadow that
 * lives in a crease. Nothing here invents a height; elevation.ts is the
 * one authority and this file reads it.
 *
 * The wash field is painted once at load into a 1-unit-per-texel map:
 *   rgb = the land's stain (regions churned soft at the borders)
 *   a   = waterness, 0 dry .. 1 open sea
 * The same pixels answer the CPU: can you wade here, what does a step
 * sound like, is there a road underfoot. The shader warps its lookup
 * with a low noise so no border is ever a straight line, and the
 * queries use the unwarped truth — a five-unit disagreement at a
 * shoreline reads as surf, not as a bug.
 */

const TEX_W = 768;
const TEX_H = 576;
const SPAN_X = WORLD.maxX - WORLD.minX;
const SPAN_Z = WORLD.maxZ - WORLD.minZ;

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

function mixHex(a: string, b: string, t: number): [number, number, number] {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return [0, 1, 2].map((i) => Math.round(pa[i] + (pb[i] - pa[i]) * t)) as [number, number, number];
}

export class Terrain {
  mesh: THREE.Mesh;
  private mat: THREE.ShaderMaterial;
  private grain: THREE.CanvasTexture;
  private desk: THREE.CanvasTexture;
  private sheetMap: THREE.CanvasTexture;
  private tintTex: THREE.DataTexture;
  /** waterness per texel, 0..255 — the unwarped truth the CPU walks on. */
  private water: Uint8Array;
  /** road mask per texel, 0..255. */
  private road: Uint8Array;
  /** The shape of the page. The one authority on where the ground is. */
  readonly field = new HeightField();

  constructor() {
    this.grain = paperGrainTexture(11);
    this.desk = deskGrainTexture(29);
    // one sheet, one spec: the world's own paper (seeded like a chapter)
    this.sheetMap = paperSheetTexture(paperSpec(3));

    const { data, water, road } = paintWorld() as {
      data: Uint8Array<ArrayBuffer>; water: Uint8Array; road: Uint8Array;
    };
    this.water = water;
    this.road = road;
    this.tintTex = new THREE.DataTexture(data, TEX_W, TEX_H, THREE.RGBAFormat);
    this.tintTex.magFilter = THREE.LinearFilter;
    this.tintTex.minFilter = THREE.LinearFilter;
    this.tintTex.wrapS = THREE.ClampToEdgeWrapping;
    this.tintTex.wrapT = THREE.ClampToEdgeWrapping;
    this.tintTex.needsUpdate = true;

    /* ---- the shape of the page ------------------------------------ *
     * One plane, subdivided at exactly the height field's pitch so mesh
     * vertices land on field nodes and the geometry can never disagree
     * with what the walker stands on. */
    const segX = Math.round((H_MAX_X - H_MIN_X) / H_STEP);
    const segZ = Math.round((H_MAX_Z - H_MIN_Z) / H_STEP);
    const geo = new THREE.PlaneGeometry(H_MAX_X - H_MIN_X, H_MAX_Z - H_MIN_Z, segX, segZ);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position as THREE.BufferAttribute;
    const n = pos.count;
    const shade = new Float32Array(n * 4);
    /* The desk lamp is BEHIND the page and to the left — which means
     * every slope that faces the camera faces away from the light and
     * reads dark. Round 4 of the gate found the castle scarp lit and
     * therefore invisible, so the curtain wall appeared to float on the
     * skyline. A hillside you are looking at should be the shaded one. */
    const LX = -0.38, LY = 0.86, LZ = -0.34;
    const CAV = 8; // the stencil the cupping is measured over, in units
    for (let i = 0; i < n; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const h = this.field.heightAt(x, z);
      pos.setY(i, h);
      const [nx, ny, nz] = this.field.normalAt(x, z);
      shade[i * 4] = nx * LX + ny * LY + nz * LZ;
      // cupping: positive in a fold's bottom, negative along its crest
      const ring =
        (this.field.heightAt(x + CAV, z) + this.field.heightAt(x - CAV, z) +
          this.field.heightAt(x, z + CAV) + this.field.heightAt(x, z - CAV)) * 0.25;
      shade[i * 4 + 1] = (ring - h) / 1.8;
      /* The fall line, so hatching can run DOWN a cliff the way a hand
       * draws one, whichever way the cliff happens to face.
       *
       * Session 5: its DIRECTION is taken over a wide stencil and its
       * MAGNITUDE over the grid's own. A pen draws a cliff down the way
       * the cliff AS A WHOLE falls, not down the way one square metre of
       * it happens to tip — and at the top and bottom of a face the
       * cliff's own gradient goes to zero, so a one-cell reading there
       * picks up the cockle instead and the strokes swing thirty degrees
       * from row to row. That is what round 4 of the gate saw on the
       * Holdfast and called herringbone. Magnitude is left exactly as it
       * was, so `steep`, the stroke pitch and every hatched surface in
       * Sessions 2–4 are untouched. */
      const [gx, gz] = this.field.gradAt(x, z);
      const mag = Math.hypot(gx, gz);
      const FALL = 7;
      const wx = (this.field.heightAt(x + FALL, z) - this.field.heightAt(x - FALL, z)) / (2 * FALL);
      const wz = (this.field.heightAt(x, z + FALL) - this.field.heightAt(x, z - FALL)) / (2 * FALL);
      const wl = Math.hypot(wx, wz);
      /* ---- COHERENCE ------------------------------------------------
       * And now the thing that took five rounds of the gate to name.
       *
       * The hatch phase is `dot(worldXZ, across)` — a GLOBAL linear
       * ramp read through a LOCAL direction. Where that direction is
       * constant over a face, the isolines are the parallel strokes
       * they are meant to be. Where it rotates, they are not strokes at
       * all: they are the caustics of a rotating field, and they come
       * out as chevrons and knots. That is the herringbone the Holdfast
       * kept showing, and no amount of tuning the pitch or the noise
       * could fix it, because it is the construction and not the
       * parameters.
       *
       * The construction is fine on a face and wrong on a brow, so the
       * answer is to hatch faces and not brows. Coherence measures the
       * difference: how much the fall line at a point agrees with the
       * fall line of the landform around it. It is folded into the
       * stored MAGNITUDE, so `steep` — which is what gates the hatch —
       * falls away wherever the direction is unreliable, and a pen
       * simply leaves that part of the rock white. On a planar scarp
       * (Greyweather's, the tear's walls) the two directions agree and
       * nothing changes at all. */
      const F2 = 17;
      const bx = (this.field.heightAt(x + F2, z) - this.field.heightAt(x - F2, z)) / (2 * F2);
      const bz = (this.field.heightAt(x, z + F2) - this.field.heightAt(x, z - F2)) / (2 * F2);
      const bl = Math.hypot(bx, bz);
      let coh = 1;
      if (wl > 1e-5 && bl > 1e-5) {
        const dot = (wx * bx + wz * bz) / (wl * bl);
        coh = Math.max(0, Math.min(1, (dot - 0.68) / 0.28));
      }
      const m = mag * coh;
      shade[i * 4 + 2] = wl > 1e-5 ? (wx / wl) * m : gx * coh;
      shade[i * 4 + 3] = wl > 1e-5 ? (wz / wl) * m : gz * coh;
    }
    pos.needsUpdate = true;
    geo.setAttribute('aShade', new THREE.BufferAttribute(shade, 4));
    geo.computeBoundingSphere();

    const pad = SHEET_PAD;
    this.mat = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.merge([
        THREE.UniformsLib.fog,
        {
          uPaper: { value: new THREE.Color(PAPER_HEX) },
          uInk: { value: new THREE.Color(INK_HEX) },
          uGrain: { value: null },
          uSheetMap: { value: null },
          uDesk: { value: null },
          uTint: { value: null },
          uSheet: {
            value: new THREE.Vector4(
              WORLD.minX - pad, WORLD.maxX + pad, WORLD.minZ - pad, WORLD.maxZ + pad
            ),
          },
          uBounds: {
            value: new THREE.Vector4(WORLD.minX, WORLD.maxX, WORLD.minZ, WORLD.maxZ),
          },
          uTime: { value: 0 },
          uSeed: { value: 0.37 },
          uFogCap: { value: 0.74 },
          uFlatLam: { value: 0.86 },
        },
      ]),
      vertexShader: /* glsl */ `
        #include <fog_pars_vertex>
        attribute vec4 aShade;
        varying vec3 vWorld;
        varying vec4 vShade;
        void main() {
          vShade = aShade;
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vWorld = wp.xyz;
          vec4 mvPosition = viewMatrix * wp;
          gl_Position = projectionMatrix * mvPosition;
          #include <fog_vertex>
        }
      `,
      fragmentShader: /* glsl */ `
        #include <fog_pars_fragment>
        uniform vec3 uPaper;
        uniform vec3 uInk;
        uniform sampler2D uGrain;
        uniform sampler2D uSheetMap;
        uniform sampler2D uDesk;
        uniform sampler2D uTint;
        uniform vec4 uSheet;
        uniform vec4 uBounds;
        uniform float uTime;
        uniform float uSeed;
        uniform float uFogCap;
        uniform float uFlatLam;
        varying vec3 vWorld;
        varying vec4 vShade;

        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
        }
        float vnoise(vec2 p) {
          vec2 i = floor(p), f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          return mix(
            mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
            mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
        }
        vec2 rot(vec2 p, float a) {
          float c = cos(a), s = sin(a);
          return vec2(p.x * c - p.y * s, p.x * s + p.y * c);
        }

        void main() {
          vec2 p = vWorld.xz;

          /* tooth and fibre — three decorrelated fields (Ground.ts) */
          float gm = texture2D(uGrain, rot(p * 0.0195 + 3.1, 0.41 + uSeed)).r;
          float gf = texture2D(uGrain, rot(p * 0.0840 + 7.3, 1.97 - uSeed)).g;
          float gt = texture2D(uGrain, rot(p * 0.1650 + 19.7, 0.83 + uSeed)).b;
          float grain = (gm - 0.5) * 0.85 + (gf - 0.5) * 0.70 + (gt - 0.5) * 0.75;

          /* the one sheet's edge, warped at two frequencies, and the
           * page and desk below it (Ground.ts, unchanged in spirit) */
          vec2 halfS = vec2(uSheet.y - uSheet.x, uSheet.w - uSheet.z) * 0.5;
          vec2 cen  = vec2(uSheet.y + uSheet.x, uSheet.w + uSheet.z) * 0.5;
          vec2 q = abs(p - cen) - halfS;
          float sd = length(max(q, vec2(0.0))) + min(max(q.x, q.y), 0.0);
          float sdA = sd, sdB = sd - 7.0;
          if (sd > -3.0) {
            sdA = sd
              + (vnoise(p * 0.34 + uSeed * 13.0) - 0.5) * 0.9
              + (vnoise(p * 1.30 + uSeed * 41.0) - 0.5) * 0.34;
            sdB = sd - 7.0 + (vnoise(p * 0.27 + 91.0 + uSeed * 5.0) - 0.5) * 1.7;
          }
          float mSheet = 1.0 - smoothstep(-0.10, 0.14, sdA);
          float mNext  = (1.0 - mSheet) * (1.0 - smoothstep(-0.12, 0.18, sdB));
          float mDesk  = max(0.0, 1.0 - mSheet - mNext);

          /* ---- the wash field ------------------------------------- *
           * The lookup is domain-warped so no region border, road edge
           * or shoreline is ever the rectangle it is stored as. */
          vec2 warp = vec2(
            vnoise(p * 0.045 + uSeed * 17.0),
            vnoise(p * 0.045 + 39.0 - uSeed * 9.0)) - 0.5;
          vec2 pw = p + warp * 9.0;
          vec2 span = vec2(uBounds.y - uBounds.x, uBounds.w - uBounds.z);
          vec2 tuv = (pw - vec2(uBounds.x, uBounds.z)) / span;
          vec4 tint = texture2D(uTint, clamp(tuv, 0.001, 0.999));

          float sm = texture2D(uSheetMap, clamp((p - vec2(uSheet.x, uSheet.z))
                   / vec2(uSheet.y - uSheet.x, uSheet.w - uSheet.z), 0.0, 1.0)).r;
          vec3 sheet = uPaper * (1.0 + grain * 0.058 + (sm - 0.5) * 0.55);

          /* stain, don't cover: multiply the paper by the wash */
          vec3 washed = sheet * mix(vec3(1.0), tint.rgb * 1.075, 0.9);

          /* ---- water ---------------------------------------------- */
          float wtr = tint.a;
          if (wtr > 0.01) {
            float w2 = vnoise(p * 0.11 + uTime * 0.05);
            vec3 shallow = vec3(0.658, 0.769, 0.792);
            vec3 deep = vec3(0.322, 0.494, 0.596);
            vec3 waterCol = mix(shallow, deep, smoothstep(0.22, 0.95, wtr));
            waterCol *= (1.0 + grain * 0.05);

            /* swell lines: warped stripes that drift shoreward, drawn
             * as ink where they crest — waves as a pen would say them */
            float ph = p.x * 0.30 + w2 * 7.0 + uTime * 0.55
                     + sin(p.y * 0.13 - uTime * 0.22) * 2.0;
            float crest = smoothstep(0.955, 0.995, sin(ph));
            float crest2 = smoothstep(0.96, 0.995, sin(ph * 0.53 + 2.1 + uTime * 0.21));
            float waveMask = smoothstep(0.10, 0.35, wtr) * (0.55 + 0.45 * w2);
            waterCol = mix(waterCol, uInk, (crest * 0.16 + crest2 * 0.10) * waveMask);

            /* surf: a pale broken line breathing at the water's edge */
            float foam = smoothstep(0.015, 0.09, wtr) * (1.0 - smoothstep(0.09, 0.20, wtr));
            float lap = 0.5 + 0.5 * sin(uTime * 1.1 + w2 * 9.0 + p.y * 0.2);
            waterCol = mix(waterCol, vec3(0.932, 0.918, 0.884), foam * (0.35 + 0.45 * lap));

            washed = mix(washed, waterCol, smoothstep(0.015, 0.28, wtr) * 0.92);
          }

          /* THROUGH the page: down in the tear you can see the desk.
           * SPLITROCK is a rip in the sheet, and the whole point of a
           * rip is what is under it — so the same two bands that lie
           * past the margin are painted into the bottom of the cut. */
          float through = smoothstep(-3.4, -9.5, vWorld.y) * mSheet;

          /* the page under it, and the desk under that */
          vec3 col = washed;
          if (mSheet < 0.999 || through > 0.002) {
            vec3 nextCol = uPaper * 0.905 + vec3(-0.006, 0.0, 0.010);
            float shadeA = 1.0 - 0.40 * exp(-max(0.0, sdA) * 1.05);
            vec3 next = nextCol * (1.0 + grain * 0.052) * shadeA;
            float dg = texture2D(uDesk, rot(p * 0.052, 0.18)).r;
            float dg2 = vnoise(rot(p * vec2(0.030, 0.16), 0.18));
            float dg3 = vnoise(rot(p * vec2(0.009, 0.055) + 21.0, 0.18));
            vec3 deskCol = vec3(0.520, 0.452, 0.368);
            float shadeB = 1.0 - 0.38 * exp(-max(0.0, sdB) * 0.80);
            vec3 desk = deskCol * (1.0 + (dg - 0.5) * 0.40 + (dg2 - 0.5) * 0.30
                                      + (dg3 - 0.5) * 0.34) * shadeB;
            col = washed * mSheet + next * mNext + desk * mDesk;
            /* the cut: paper's own back first, then wood, then dark */
            float deep = smoothstep(-6.5, -12.0, vWorld.y);
            vec3 under = mix(next, desk, deep);
            col = mix(col, under * (1.0 - 0.18 * deep), through);
          }

          /* ---- the shape of the page, DRAWN ----------------------- *
           * Round 1 of the art-director gate rejected the first pass in
           * one line: shaded with a smooth gradient, a fold reads as an
           * airbrushed dune, and the sheet stops being a sheet. A pen
           * does not have a gradient. It has three moves, and all three
           * are here:
           *
           *   TONE     the wash goes on heavier where the page leans out
           *            of the light — small, or it becomes airbrush;
           *   HATCH    a slope is shaded with STROKES. World-space, so
           *            they belong to the ground and never crawl; angled
           *            and wobbled, so they are a hand's; gated hard on
           *            gradient, so flat land never gets corduroy; and
           *            faded with distance, because a pen stops
           *            describing a hillside you cannot see;
           *   THE LINE ink POOLS in the bottom of a fold and the crest
           *            keeps the paper's own white. That single dark
           *            line down a valley is what makes a crease a
           *            crease instead of a dent. */
          float lam = vShade.x;
          float cav = vShade.y;
          vec2 fall = vShade.zw;
          float grad = length(fall);

          float lean = clamp(1.0 + (lam - uFlatLam) * 0.44, 0.82, 1.06);
          col *= mix(1.0, lean, mSheet);

          /* HATCHING is for CLIFFS ONLY. Round 2 put it on every gentle
           * slope at a three-unit pitch and it read as drapery, not as
           * pen: soft, enormous, and describing nothing. Round 3 cut it
           * back again — a pen hatches what is actually a CLIFF (the
           * castle scarp, the tear's walls), finely, in broken strokes,
           * and stops when the thing is too far off to describe. A fold
           * in the ground is described by its line, not by shading. */
          float shadeSide = smoothstep(uFlatLam - 0.04, uFlatLam - 0.44, lam);
          /* HATCHING IS FOR CLIFFS, and Session 5 finally made the
           * threshold mean it. Session 4 wrote the law down as a gotcha
           * — "on gentle ground it reads as corduroy" — and then left
           * the gate at 0.36, which a five-unit dune over seventeen
           * clears comfortably. It is why the coast kept coming back
           * from the gate with chevrons on its sand: NOTHING on that
           * dune is a cliff, and every stroke on it was a lie about the
           * ground. At 0.62 the dune, the buckle and the river's own
           * banks all fall silent, and what still draws is what is
           * genuinely a wall: the Holdfast's face, the castle scarp,
           * the tear.
           *
           * The gradient also means something stricter than it did:
           * the magnitude in aShade.zw is scaled by the fall line's
           * COHERENCE, so a brow or a corner — where the direction
           * rotates and the stroke field turns into caustics — reads as
           * gentle here and takes no strokes either. */
          float steep = smoothstep(0.62, 1.15, grad);
          float near = 1.0 - smoothstep(58.0, 124.0, vFogDepth);
          float hatchAmt = steep * mix(0.45, 1.0, shadeSide) * near * mSheet;
          if (hatchAmt > 0.004) {
            /* Strokes run DOWN the slope. Round 6 of the gate had them
             * running along the contours, where perspective squashed
             * them into strata and the scarp read as a smudge. A hand
             * drawing a cliff draws down it, always, whichever way the
             * cliff faces — so the stroke direction is taken from the
             * fall line the geometry already knows. */
            vec2 dn = fall / max(grad, 1e-4);
            vec2 across = vec2(-dn.y, dn.x);
            float u = dot(p, across);
            float v = dot(p, dn);
            /* The stroke is the same size ON THE PAGE at every distance,
             * because a pen has one nib and one hand. So the world-space
             * pitch scales with depth: tight underfoot, open on a far
             * hillside. Without this a slope five units from the lens
             * gets strokes a metre wide and reads as herringbone. */
            /* Session 5 opened the pitch out. At 3.4–5.6 a fifty-unit
             * cliff got eighty strokes across it, which is not hatching
             * — it is grain, and grain is what a texture does, not what
             * a pen does. Twenty-odd strokes down a face is a hand. */
            float pitch = mix(2.2, 3.4, steep)
                        * clamp(28.0 / max(vFogDepth, 6.0), 0.34, 3.2);
            /* The phase wander is SLOW. Session 5: at p × 0.8 the noise
             * had the same wavelength as the strokes it was displacing,
             * so every stroke wandered independently of its neighbours
             * and a big hatched face came out as WOODGRAIN — knots,
             * swirls, a thumb print. A hand does not do that. A hand
             * lays a bundle of strokes and the whole bundle drifts, so
             * the wander runs at about a sixth of the stroke pitch and
             * the strokes stay parallel to the ones beside them. */
            float s1 = sin(u * pitch + (vnoise(p * 0.15 + 5.0) - 0.5) * 3.0);
            /* strokes, not lines: each one stops where the hand lifted */
            float brk = smoothstep(0.26, 0.60, vnoise(vec2(u * 0.55, v * 0.20) + 11.0));
            /* and each one is a STROKE with paper either side of it:
             * a wide smoothstep merges neighbouring strokes into a
             * tone, which is the other half of why a hatched face read
             * as woodgrain */
            float h1 = smoothstep(0.44, 0.90, s1) * brk;
            /* A crossing pass, only where it is genuinely a wall — and
             * COARSE. Session 5: at pitch × 0.8 the second pass sat a
             * few per cent off the first and the two beat together into
             * herringbone on the Holdfast's face, which is a moiré and
             * not a hand. A person's second pass over a cliff is wider
             * than the first, not almost the same width; at 0.45 it
             * reads as a second sweep of the pen, and it is broken by
             * its own noise so it stops where the hand lifted. */
            float s2 = sin((u * 0.72 + v * 0.62) * pitch * 0.45
                       + (vnoise(p * 0.11 + 19.0) - 0.5) * 2.6);
            float brk2 = smoothstep(0.22, 0.66, vnoise(vec2(v * 0.7, u * 0.22) + 31.0));
            float h2 = smoothstep(0.40, 0.95, s2) * brk2 * smoothstep(0.80, 1.25, grad);
            col = mix(col, uInk, clamp(h1 * 0.52 + h2 * 0.17, 0.0, 0.60) * hatchAmt);
          }

          /* THE LINE. Ink pools in the bottom of a fold, and the crest
           * keeps the paper's own white. This single dark line down a
           * valley is what makes a crease a crease and not a dent. */
          // a wide soft settling, and then the LINE itself: a crease is
          // legible because the pen went down the very bottom of it once
          col = mix(col, uInk, smoothstep(0.22, 0.62, cav) * 0.13 * mSheet);
          float fold = smoothstep(0.60, 0.90, cav) * mSheet;
          col = mix(col, uInk, fold * 0.40);
          // a torn lip shows the paper's own white fibres, and it shows
          // them brightest exactly where the page breaks
          col += smoothstep(0.24, 0.80, -cav) * (0.055 + 0.11 * steep) * mSheet;

          col += grain * 0.032;
          gl_FragColor = vec4(col, 1.0);

          #ifdef USE_FOG
            float fogF = smoothstep(fogNear, fogFar, vFogDepth);
            /* the cap keeps the walkable midfield from plateauing into a
             * flat band, but the DESK at the horizon must be allowed to
             * dissolve completely, or the cap paints it as a hard brown
             * stripe across the top of every frame */
            float cap = mix(uFogCap, 1.0, smoothstep(1.0, 2.6, vFogDepth / fogFar));
            fogF *= cap;
            gl_FragColor.rgb = mix(gl_FragColor.rgb, fogColor, fogF);
          #endif
        }
      `,
      fog: true,
    });
    // UniformsUtils.merge clones texture uniforms; re-seat the originals
    this.mat.uniforms.uGrain.value = this.grain;
    this.mat.uniforms.uDesk.value = this.desk;
    this.mat.uniforms.uSheetMap.value = this.sheetMap;
    this.mat.uniforms.uTint.value = this.tintTex;

    this.mesh = new THREE.Mesh(geo, this.mat);
    this.mesh.renderOrder = -10;
  }

  update(dt: number) {
    this.mat.uniforms.uTime.value += dt;
  }

  /** THE WATER IS A CLOCK TOO, and it was the fifth one found (Session
   *  9). It accumulates from page load, it is not reset by anything, and
   *  it drives the only animation in the sheet's own shader — so the
   *  four coast framings were the only ones in the regression sheet that
   *  could not be reproduced, and it took a diff to notice. Pinned by
   *  `__inklands.setTime` along with the world's, the paper's and the
   *  walker's. */
  setTime(t: number) {
    this.mat.uniforms.uTime.value = t;
  }

  setFogCap(v: number) {
    this.mat.uniforms.uFogCap.value = v;
  }

  private texel(x: number, z: number): number {
    const tx = Math.max(0, Math.min(TEX_W - 1, Math.floor(((x - WORLD.minX) / SPAN_X) * TEX_W)));
    const tz = Math.max(0, Math.min(TEX_H - 1, Math.floor(((z - WORLD.minZ) / SPAN_Z) * TEX_H)));
    return tz * TEX_W + tx;
  }

  /** The ground at (x, z) — what everything stands on. */
  heightAt(x: number, z: number): number {
    return this.field.heightAt(x, z);
  }

  /** The ground with the cockle averaged out: what the camera stands on
   *  so it does not get seasick over a buckle. */
  smoothHeightAt(x: number, z: number, r?: number): number {
    return this.field.smoothHeightAt(x, z, r);
  }

  /** Unit surface normal — decals and footprints lie along it. Standees
   *  never do: they are cutouts standing on a warped page. */
  normalAt(x: number, z: number): [number, number, number] {
    return this.field.normalAt(x, z);
  }

  slopeAt(x: number, z: number): number {
    return this.field.slopeAt(x, z);
  }

  /** Too steep to walk. The scarp under Greyweather is made of this. */
  tooSteep(x: number, z: number): boolean {
    return this.field.slopeAt(x, z) > MAX_WALK_SLOPE;
  }

  /** Waterness underfoot, 0 dry .. 1 open sea. */
  waterAt(x: number, z: number): number {
    return this.water[this.texel(x, z)] / 255;
  }

  roadAt(x: number, z: number): boolean {
    return this.road[this.texel(x, z)] > 96;
  }

  /**
   * Plank underfoot. The road's three bridges span the river; the
   * boardwalk is LONGSHORE's own decking and runs out past the
   * shoreline onto a jetty head. Both do the same two jobs: they knock
   * HOLLOW, and they carry the walker over water the page would
   * otherwise refuse.
   */
  onPlanks(x: number, z: number, pad = 0): boolean {
    for (const b of BRIDGES) {
      if (Math.hypot(x - b.x, z - b.z) < 6 + pad) return true;
    }
    for (const p of PLANKS) {
      if (Math.hypot(x - p.x, z - p.z) < p.r + pad) return true;
    }
    return false;
  }

  /** What the page refuses: deep water, and ground too steep to climb.
   *  Two things get you across water: a plank, and a FORD (Session 10) —
   *  the shallow place the mill lane crosses the river on, where the bed
   *  comes up and the cart goes through. */
  blockedAt(x: number, z: number): boolean {
    if (this.tooSteep(x, z)) return true;
    if (this.waterAt(x, z) <= 0.62) return false;
    return !this.onPlanks(x, z) && fordAt(x, z) < 0.45;
  }
}

/* ------------------------------------------------------------------ *
 * Painting the world, once, at load.
 * ------------------------------------------------------------------ */

function paintWorld(): { data: Uint8Array; water: Uint8Array; road: Uint8Array } {
  const px = (x: number) => ((x - WORLD.minX) / SPAN_X) * TEX_W;
  const pz = (z: number) => ((z - WORLD.minZ) / SPAN_Z) * TEX_H;
  const sx = TEX_W / SPAN_X;

  /* -- the stains ---------------------------------------------------- */
  const c = document.createElement('canvas');
  c.width = TEX_W;
  c.height = TEX_H;
  const ctx = c.getContext('2d')!;

  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, TEX_W, TEX_H);

  let blotSeed = 5;
  const rand = () => {
    blotSeed = (blotSeed * 1664525 + 1013904223) >>> 0;
    return blotSeed / 0xffffffff;
  };

  for (const s of REGION_SPECS) {
    const r: Rect = s.rect;
    const [cr, cg, cb] = mixHex(PAPER, s.wash, 0.62);
    ctx.fillStyle = `rgb(${cr},${cg},${cb})`;
    ctx.fillRect(px(r.minX), pz(r.minZ), (r.maxX - r.minX) * sx, (r.maxZ - r.minZ) * (TEX_H / SPAN_Z));
    // a wash is never even: a few broad damp blotches per land
    for (let i = 0; i < 8; i++) {
      const bx = px(r.minX + rand() * (r.maxX - r.minX));
      const bz = pz(r.minZ + rand() * (r.maxZ - r.minZ));
      const rad = (14 + rand() * 26) * sx;
      const dark = rand() > 0.5;
      const g = ctx.createRadialGradient(bx, bz, 0, bx, bz, rad);
      const k = dark ? 0.88 : 1.1;
      g.addColorStop(0, `rgba(${Math.round(cr * k)},${Math.round(cg * k)},${Math.round(cb * k)},0.2)`);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(bx - rad, bz - rad, rad * 2, rad * 2);
    }
  }

  /* ---- THE COAST IS NOT ALL SAND (Session 5) ---------------------- *
   * One stain per land is the rule, and it is a good rule — but a rule
   * about LANDS, not about everything inside one. LONGSHORE's stain is
   * beach, and the two things on that coast which are emphatically not
   * beach are the Holdfast (the piece of page the tear went round: torn
   * paper, not blown sand) and the sandbar (the strip the wash MISSED,
   * which is drier than the beach, not wetter). Round 1 of the gate
   * looked at an eleven-unit cliff painted sand-coloured and called the
   * whole coast a dune sea, which was the correct verdict.
   *
   * Both are painted here, before the border-softening pass, so they get
   * the same ragged edge every other border in this world gets. */
  {
    const rock = mixHex(PAPER, WASH.castle, 0.66);
    const dry = mixHex(PAPER, WASH.sand, 0.44);
    const img = ctx.getImageData(0, 0, TEX_W, TEX_H);
    const d = img.data;
    for (let ty = 0; ty < TEX_H; ty++) {
      const wz = WORLD.minZ + ((ty + 0.5) / TEX_H) * SPAN_Z;
      for (let tx = 0; tx < TEX_W; tx++) {
        const wx = WORLD.minX + ((tx + 0.5) / TEX_W) * SPAN_X;
        if (wx > -150 || wx < -330) continue;
        const i = (ty * TEX_W + tx) * 4;
        // the point, and the rock it has been dropping onto its own
        // foreshore for as long as there has been a point
        const hk = holdfastK(wx, wz);
        if (hk > 0.002) {
          const k = hk;
          for (let c = 0; c < 3; c++) d[i + c] += (rock[c] - d[i + c]) * k;
        }
        // the bar: dry sand where the sea is painted
        const bk = 1 - smoothstep(4, 18, barDist(wx, wz));
        if (bk > 0.002) {
          for (let c = 0; c < 3; c++) d[i + c] += (dry[c] - d[i + c]) * bk * 0.85;
        }
      }
    }
    ctx.putImageData(img, 0, 0);
  }

  /* ---- AND SPLITROCK IS NOT ALL CANYON (Session 11) --------------- *
   * The same argument as the Holdfast's, from the other end of the
   * sheet. One stain per land is a rule about LANDS, and the one thing
   * inside SPLITROCK that is not canyon-coloured is the bottom of the
   * rip: the walls are the page seen edge-on and they keep the land's
   * wash, but the FLOOR is a riverbed with nothing in it, and a dry bed
   * is paler and greyer than the country it runs through.
   *
   * It is worth a pass over the pixels for one reason: **a walker on
   * the west lip has to be able to see that the channel is a channel.**
   * From up there the tear is a shadow and a line of stacks, and without
   * this it is a shadow and a line of stacks the same colour as the
   * ground. With it, the floor reads as a road going north, which is
   * exactly what it is. */
  {
    const bed = mixHex(PAPER, WASH.sand, 0.34);
    const img = ctx.getImageData(0, 0, TEX_W, TEX_H);
    const d = img.data;
    for (let ty = 0; ty < TEX_H; ty++) {
      const wz = WORLD.minZ + ((ty + 0.5) / TEX_H) * SPAN_Z;
      if (wz > -100 || wz < -280) continue;
      for (let tx = 0; tx < TEX_W; tx++) {
        const wx = WORLD.minX + ((tx + 0.5) / TEX_W) * SPAN_X;
        if (wx < 250 || wx > 350) continue;
        const k = tearFloorK(wx, wz);
        if (k < 0.004) continue;
        const i = (ty * TEX_W + tx) * 4;
        for (let c = 0; c < 3; c++) d[i + c] += (bed[c] - d[i + c]) * k * 0.8;
      }
    }
    ctx.putImageData(img, 0, 0);
  }

  // soften every border: downscale and stretch back up, twice
  const soft = document.createElement('canvas');
  soft.width = TEX_W / 4;
  soft.height = TEX_H / 4;
  const sctx = soft.getContext('2d')!;
  sctx.drawImage(c, 0, 0, soft.width, soft.height);
  ctx.drawImage(soft, 0, 0, soft.width, soft.height, 0, 0, TEX_W, TEX_H);

  /* -- the roads ------------------------------------------------------ */
  const roadC = document.createElement('canvas');
  roadC.width = TEX_W;
  roadC.height = TEX_H;
  const rctx = roadC.getContext('2d')!;
  const drawRoads = (target: CanvasRenderingContext2D, forMask: boolean) => {
    target.lineCap = 'round';
    target.lineJoin = 'round';
    for (const road of ROADS) {
      const path = new Path2D();
      road.pts.forEach(([x, z], i) => {
        // a surveyor did not lay these
        const jx = px(x) + Math.sin(x * 12.9 + z * 3.7) * 1.5;
        const jz = pz(z) + Math.sin(z * 11.3 + x * 2.9) * 1.5;
        if (i === 0) path.moveTo(jx, jz);
        else path.lineTo(jx, jz);
      });
      if (forMask) {
        target.strokeStyle = '#fff';
        target.globalAlpha = 1;
        target.lineWidth = road.width * sx;
        target.stroke(path);
      } else {
        const [rr, rg, rb] = mixHex(PAPER, '#cfc3a7', 0.85);
        target.strokeStyle = `rgb(${rr},${rg},${rb})`;
        target.globalAlpha = 0.42;
        target.lineWidth = (road.width + 3) * sx;
        target.stroke(path);
        target.globalAlpha = 0.85;
        target.lineWidth = road.width * sx;
        target.stroke(path);
      }
    }
    target.globalAlpha = 1;
  };
  drawRoads(ctx, false);
  drawRoads(rctx, true);

  const tintData = ctx.getImageData(0, 0, TEX_W, TEX_H).data;
  const roadData = rctx.getImageData(0, 0, TEX_W, TEX_H).data;

  /* -- the water, per texel, analytically ----------------------------- */
  const water = new Uint8Array(TEX_W * TEX_H);
  const road = new Uint8Array(TEX_W * TEX_H);
  for (let ty = 0; ty < TEX_H; ty++) {
    const wz = WORLD.minZ + ((ty + 0.5) / TEX_H) * SPAN_Z;
    for (let tx = 0; tx < TEX_W; tx++) {
      const wx = WORLD.minX + ((tx + 0.5) / TEX_W) * SPAN_X;
      const idx = ty * TEX_W + tx;
      road[idx] = roadData[idx * 4];

      /* The sea, the river and the still waters, in one call.
       *
       * Session 5 moved the SEA into layout.ts so the pixels the walker
       * collides with and the numbers tools/check-terrain.mjs walks
       * off-screen could not disagree about the sandbar. Session 6 moved
       * the river and the ponds for exactly the same reason, and the
       * reason has a boat in it: the rowboat's ground is water, so
       * "where is there water" is now a question the proof has to be
       * able to answer with no canvas and no renderer. layout.ts is the
       * one authority; this loop paints what it says.
       *
       * A road is never underwater unless the river takes it — bridges
       * are exempt from collision separately. */
      water[idx] = Math.round(waterFieldAt(wx, wz) * 255);
    }
  }

  /* -- compose rgb + a ------------------------------------------------ */
  const data = new Uint8Array(TEX_W * TEX_H * 4);
  for (let i = 0; i < TEX_W * TEX_H; i++) {
    data[i * 4] = tintData[i * 4];
    data[i * 4 + 1] = tintData[i * 4 + 1];
    data[i * 4 + 2] = tintData[i * 4 + 2];
    data[i * 4 + 3] = water[i];
  }
  return { data, water, road };
}
