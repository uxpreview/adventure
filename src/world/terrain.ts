import * as THREE from 'three';
import { PAPER_HEX, PAPER, INK_HEX } from '../engine/palette';
import {
  paperGrainTexture, paperSheetTexture, deskGrainTexture, paperSpec,
} from '../engine/paper';
import {
  WORLD, REGION_SPECS, ROADS, RIVER, RIVER_WIDTH, BRIDGES, PONDS, type Rect,
} from './layout';

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

/** The coastline: where the sand gives up and the sea begins. */
export function coastX(z: number): number {
  return -250 + Math.sin(z * 0.018) * 10 + Math.sin(z * 0.043 + 1.7) * 6;
}

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

function mixHex(a: string, b: string, t: number): [number, number, number] {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return [0, 1, 2].map((i) => Math.round(pa[i] + (pb[i] - pa[i]) * t)) as [number, number, number];
}

function distToSeg(px: number, pz: number, a: [number, number], b: [number, number]): number {
  const dx = b[0] - a[0];
  const dz = b[1] - a[1];
  const len2 = dx * dx + dz * dz || 1;
  const t = Math.max(0, Math.min(1, ((px - a[0]) * dx + (pz - a[1]) * dz) / len2));
  return Math.hypot(px - (a[0] + dx * t), pz - (a[1] + dz * t));
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

    const geo = new THREE.PlaneGeometry(1400, 1200);
    geo.rotateX(-Math.PI / 2);

    const pad = 14;
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
        },
      ]),
      vertexShader: /* glsl */ `
        #include <fog_pars_vertex>
        varying vec3 vWorld;
        void main() {
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
        varying vec3 vWorld;

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

          /* the page under it, and the desk under that */
          vec3 col = washed;
          if (mSheet < 0.999) {
            vec3 nextCol = uPaper * 0.905 + vec3(-0.006, 0.0, 0.010);
            float shadeA = 1.0 - 0.26 * exp(-max(0.0, sdA) * 1.15);
            vec3 next = nextCol * (1.0 + grain * 0.052) * shadeA;
            float dg = texture2D(uDesk, rot(p * 0.052, 0.18)).r;
            float dg2 = vnoise(rot(p * vec2(0.030, 0.16), 0.18));
            float dg3 = vnoise(rot(p * vec2(0.009, 0.055) + 21.0, 0.18));
            vec3 deskCol = vec3(0.520, 0.452, 0.368);
            float shadeB = 1.0 - 0.30 * exp(-max(0.0, sdB) * 0.85);
            vec3 desk = deskCol * (1.0 + (dg - 0.5) * 0.40 + (dg2 - 0.5) * 0.30
                                      + (dg3 - 0.5) * 0.34) * shadeB;
            col = washed * mSheet + next * mNext + desk * mDesk;
          }

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

  setFogCap(v: number) {
    this.mat.uniforms.uFogCap.value = v;
  }

  private texel(x: number, z: number): number {
    const tx = Math.max(0, Math.min(TEX_W - 1, Math.floor(((x - WORLD.minX) / SPAN_X) * TEX_W)));
    const tz = Math.max(0, Math.min(TEX_H - 1, Math.floor(((z - WORLD.minZ) / SPAN_Z) * TEX_H)));
    return tz * TEX_W + tx;
  }

  /** Waterness underfoot, 0 dry .. 1 open sea. */
  waterAt(x: number, z: number): number {
    return this.water[this.texel(x, z)] / 255;
  }

  roadAt(x: number, z: number): boolean {
    return this.road[this.texel(x, z)] > 96;
  }

  /** Plank bridges span the river: near one, deep water carries you. */
  nearBridge(x: number, z: number, r = 6): boolean {
    for (const b of BRIDGES) {
      if (Math.hypot(x - b.x, z - b.z) < r) return true;
    }
    return false;
  }

  /** Past wading depth the sea refuses the walker. */
  blockedAt(x: number, z: number): boolean {
    if (this.waterAt(x, z) <= 0.62) return false;
    return !this.nearBridge(x, z);
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
      const rad = (18 + rand() * 42) * sx;
      const dark = rand() > 0.5;
      const g = ctx.createRadialGradient(bx, bz, 0, bx, bz, rad);
      const k = dark ? 0.88 : 1.1;
      g.addColorStop(0, `rgba(${Math.round(cr * k)},${Math.round(cg * k)},${Math.round(cb * k)},0.35)`);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(bx - rad, bz - rad, rad * 2, rad * 2);
    }
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
  const riverSegs: [[number, number], [number, number]][] = [];
  for (let i = 0; i < RIVER.length - 1; i++) riverSegs.push([RIVER[i], RIVER[i + 1]]);

  for (let ty = 0; ty < TEX_H; ty++) {
    const wz = WORLD.minZ + ((ty + 0.5) / TEX_H) * SPAN_Z;
    for (let tx = 0; tx < TEX_W; tx++) {
      const wx = WORLD.minX + ((tx + 0.5) / TEX_W) * SPAN_X;
      const idx = ty * TEX_W + tx;
      road[idx] = roadData[idx * 4];

      let w = 0;
      // the sea: deepens west of the coastline
      const d = coastX(wz) - wx;
      if (d > 0) w = smoothstep(0, 42, d);
      // the river: width swells from source to mouth
      let best = 1e9;
      let bestT = 0;
      for (let i = 0; i < riverSegs.length; i++) {
        const dd = distToSeg(wx, wz, riverSegs[i][0], riverSegs[i][1]);
        if (dd < best) {
          best = dd;
          bestT = i / riverSegs.length;
        }
      }
      const halfW = (RIVER_WIDTH * (0.55 + bestT * 0.65)) / 2;
      if (best < halfW + 4) {
        const rw = 1 - smoothstep(halfW * 0.55, halfW + 3, best);
        w = Math.max(w, rw * 0.85);
      }
      // still waters
      for (const p of PONDS) {
        const dp = Math.hypot(wx - p.x, wz - p.z);
        if (dp < p.r + 4) w = Math.max(w, (1 - smoothstep(p.r * 0.45, p.r + 3, dp)) * 0.7);
      }
      // a road is never underwater unless the river takes it (bridges
      // are exempt from collision separately)
      water[idx] = Math.round(Math.max(0, Math.min(1, w)) * 255);
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
