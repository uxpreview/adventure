import * as THREE from 'three';
import { PENCIL } from './palette';

/**
 * Props are paper stand-ups and ground decals: flat planes carrying ink
 * textures, exactly like drawings standing up out of the page.
 *
 * Session 4: the page is no longer flat, so the two kinds part company.
 * A STANDEE is a cutout — it stands vertically wherever the ground puts
 * it and never tilts with the slope. A DECAL is a mark ON the page — it
 * lies down along the surface normal. Decals carry a polygon offset so
 * a wide mark on a fold can never fight the ground for the same pixel.
 */

export function makeStandee(
  tex: THREE.Texture,
  w: number,
  h: number,
  opacity = 1,
  opts: { ghost?: boolean } = {}
): THREE.Mesh {
  const geo = new THREE.PlaneGeometry(w, h);
  geo.translate(0, h / 2, 0);
  /* PEN: a cutout seen from any side. alphaTest at 0.1 drops the
   * filtered fringe an oblique standee grows along its edge, the
   * drawing is DoubleSide so a camera that has walked round it still
   * sees a drawing and not a missing quad, and the ink blend below
   * keeps the edge clean at every mip. */
  const mat = new THREE.MeshBasicMaterial({
    map: tex,
    transparent: true,
    alphaTest: 0.1,
    opacity,
    side: THREE.DoubleSide,
  });
  inkBlend(mat, opts.ghost);
  skipWhenClear(mat);
  return new THREE.Mesh(geo, mat);
}

/* ---- PEN: the ink blend --------------------------------------------- *
 * A drawing's canvas is stored premultiplied by the browser. Uploaded
 * as straight alpha (three's default) every transparent texel comes out
 * black, and the GPU's filtering blends that black into every edge and
 * every mip: the dark rim round a wash on a far or oblique standee, the
 * one a free camera sees from every side. So a drawing shown by one of
 * these materials is uploaded premultiplied — the filter is honest, and
 * the upload is a copy instead of a per-texel divide — and the material
 * blends ONE / ONE_MINUS_SRC_ALPHA to match. three's own premultiplied
 * path multiplies by alpha a second time in the shader and fogs as if
 * the colour were straight, so both chunks are replaced: the opacity is
 * folded into the colour, and fog pulls toward fogColor × alpha.
 * `ghost` is the pencil plan of a house front: the same drawing, read
 * through the same rule the CPU used to bake it with (dark ink survives,
 * a wash drops out) — on the GPU, so no pixels are ever read back.
 * A texture assigned to `map` later (a figure changing pose) is flagged
 * the same way. Same look up close; clean edges from every side. */
const GHOST_MAP = /* glsl */ `
#ifdef USE_MAP
  vec4 tx = texture2D( map, vMapUv );
  vec3 cs = pow( tx.rgb / max( tx.a, 1e-4 ), vec3( 1.0 / 2.2 ) );
  float lum = dot( cs, vec3( 0.299, 0.587, 0.114 ) );
  float ink = clamp( ( ( 1.0 - lum ) * tx.a - 0.38 ) / 0.3, 0.0, 1.0 );
  diffuseColor *= ink;
#endif
`;
const FOG_PREMULT = /* glsl */ `
#ifdef USE_FOG
  #ifdef FOG_EXP2
    float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
  #else
    float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
  #endif
  gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor * gl_FragColor.a, fogFactor );
#endif
`;
function premultiply(t: THREE.Texture | null) {
  if (t && !t.premultiplyAlpha) {
    t.premultiplyAlpha = true;
    t.needsUpdate = true;
  }
}
/* ---- PEN: a drawing at opacity zero is not a draw call -------------- *
 * three.js culls by `material.visible`, never by opacity, so a lit
 * window by day, a shutter by night, a lamp's glow at noon, a room's
 * pencil front from outside — every variant a land keeps at opacity 0
 * until its hour — was a full draw call of nothing. The kingdom alone
 * carried dozens. `visible` now reads false while the drawing is clear;
 * lands that set `visible` themselves still get exactly what they set. */
function skipWhenClear(mat: THREE.Material) {
  let own = true;
  Object.defineProperty(mat, 'visible', {
    get: () => own && mat.opacity > 0.004,
    set: (v: boolean) => { own = v; },
    configurable: true,
  });
}

export function inkBlend(mat: THREE.MeshBasicMaterial, ghost = false) {
  let map = mat.map;
  premultiply(map);
  Object.defineProperty(mat, 'map', {
    get: () => map,
    set: (t: THREE.Texture | null) => { premultiply(t); map = t; },
    configurable: true,
    enumerable: true,
  });
  mat.premultipliedAlpha = true;
  if (ghost) mat.color.set(PENCIL);
  mat.onBeforeCompile = (shader) => {
    let f = shader.fragmentShader;
    if (ghost) f = f.replace('#include <map_fragment>', GHOST_MAP);
    f = f.replace('#include <opaque_fragment>', '#include <opaque_fragment>\n\tgl_FragColor.rgb *= opacity;');
    f = f.replace('#include <fog_fragment>', FOG_PREMULT);
    f = f.replace('#include <premultiplied_alpha_fragment>', '');
    shader.fragmentShader = f;
  };
  mat.customProgramCacheKey = () => (ghost ? 'pen-ghost' : 'pen-ink');
}

export function makeDecal(
  tex: THREE.Texture,
  w: number,
  h: number,
  opacity = 1
): THREE.Mesh {
  const geo = new THREE.PlaneGeometry(w, h);
  geo.rotateX(-Math.PI / 2);
  const mat = new THREE.MeshBasicMaterial({
    map: tex,
    transparent: true,
    opacity,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -4,
    polygonOffsetUnits: -8,
  });
  inkBlend(mat);
  skipWhenClear(mat);
  const m = new THREE.Mesh(geo, mat);
  m.position.y = 0.01;
  m.renderOrder = -6;
  return m;
}

/** Dispose a group's geometries/materials/textures recursively. */
export function disposeGroup(root: THREE.Object3D) {
  root.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (mesh.geometry) mesh.geometry.dispose();
    const mats = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : [];
    for (const m of mats) {
      const mm = m as THREE.MeshBasicMaterial;
      if (mm.map) mm.map.dispose();
      m.dispose();
    }
  });
}

/**
 * A flat ink ribbon that follows an XZ polyline on the ground — used for
 * inked lines the player "draws" by walking. Revealed via drawRange.
 */
export function makeRibbon(
  points: [number, number][],
  width: number,
  color: number,
  y = 0.02
): { mesh: THREE.Mesh; segments: number; setProgress: (t: number) => void } {
  const n = points.length;
  const positions = new Float32Array(n * 2 * 3);
  const dir = new THREE.Vector2();
  for (let i = 0; i < n; i++) {
    const [x, z] = points[i];
    const [nx, nz] = points[Math.min(i + 1, n - 1)];
    const [px, pz] = points[Math.max(i - 1, 0)];
    dir.set(nx - px, nz - pz).normalize();
    // perpendicular in XZ
    const ox = -dir.y * width * 0.5;
    const oz = dir.x * width * 0.5;
    positions.set([x + ox, y, z + oz], i * 6);
    positions.set([x - ox, y, z - oz], i * 6 + 3);
  }
  const indices: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    const a = i * 2;
    indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setIndex(indices);
  const mat = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.92,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.renderOrder = -5;
  const segments = n - 1;
  geo.setDrawRange(0, 0);
  return {
    mesh,
    segments,
    setProgress: (t: number) => {
      const seg = Math.round(THREE.MathUtils.clamp(t, 0, 1) * segments);
      geo.setDrawRange(0, seg * 6);
    },
  };
}
