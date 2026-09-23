import * as THREE from 'three';
import type { BuildCtx } from './index';
import { boxTextures, type BoxStyle } from '../textures-box';
import { PAPER } from '../../engine/palette';
import { inkBlend } from '../../engine/props';

/**
 * A BUILDING IS A PAPER BOX (2026-09-23, owner: option 2).
 *
 * The front is the drawing the land already stood up, held on its line
 * (`face: 'fixed'`). This builds the rest of the box round it: a side
 * wall from each of the front's drawn corners, going back `depth`; a
 * back wall across their far ends, with the front's gable on it; and
 * the roof, two sloped sheets from the front's own eave corners up to
 * its own ridge (a keep gets a flat lead roof behind its battlements).
 * The walls are solid and fixed, so the footprint you walk round is the
 * footprint you see, from any bearing, and a house seen along its
 * street is a side wall, not a line.
 *
 * The new meshes ride on `front.userData.box`, so a room behind the
 * front (`room.ts`) fades them with the front as the walker goes in.
 */
export type BoxSpec = {
  /** Where the front's walls are drawn, as fractions of its width. */
  x0: number;
  x1: number;
  depth: number;
  style: BoxStyle;
  seed: number;
  /** Stand the sides at these local x offsets instead (world units off
   *  the front's centre) — a room's own walls, so the box is the room. */
  sidesAt?: [number, number];
};

/** Textures, once per (seed, size): the court's twenty houses are three drawings. */
const made = new Map<string, ReturnType<typeof boxTextures>>();

/** How far a back wall reaches past the side walls, and a roof past both. */
const OVER = 0.3;

export function boxUp(ctx: BuildCtx, front: THREE.Mesh, w: number, h: number, spec: BoxSpec): THREE.Mesh[] {
  const s = spec.style;
  const rotY = front.rotation.y;
  const [u0, u1] = spec.sidesAt ?? [(spec.x0 - 0.5) * w, (spec.x1 - 0.5) * w];
  const cu = (px: number) => (px / s.canvasW - 0.5) * w;
  const y0 = front.position.y;
  const hy = (py: number) => y0 + (1 - py / s.canvasH) * h;
  const keep = s.top === 'keep';

  // the roof's span: the front's own eave corners, never inside the walls
  const r0 = keep ? u0 - OVER : Math.min(cu(s.roofL ?? 0), u0 - OVER);
  const r1 = keep ? u1 + OVER : Math.max(cu(s.roofR ?? s.canvasW), u1 + OVER);
  const au = keep ? (u0 + u1) / 2 : cu(s.apex ?? s.canvasW / 2);
  const baseY = hy(keep ? s.eave : s.roofBase ?? s.eave);
  const ridgeY = hy(s.ridge);
  const slope = keep ? u1 - u0 : Math.max(Math.hypot(au - r0, ridgeY - baseY), Math.hypot(r1 - au, ridgeY - baseY));

  const back = { w: r1 - r0, wallL: u0 - r0, wallR: u1 - r0, apexU: au - r0 };
  const key = `${spec.seed}:${w}:${h}:${spec.depth}:${back.w.toFixed(2)}`;
  let tex = made.get(key);
  if (!tex) {
    tex = boxTextures(spec.seed, s, h, spec.depth, back, slope);
    made.set(key, tex);
  }
  // the front's local x across it, and the way back into the page
  const ax = [Math.cos(rotY), -Math.sin(rotY)];
  const bk = [-Math.sin(rotY), -Math.cos(rotY)];
  const px = front.position.x;
  const pz = front.position.z;
  const at = (u: number, d: number): [number, number] => [px + ax[0] * u + bk[0] * d, pz + ax[1] * u + bk[1] * d];

  const parts: THREE.Mesh[] = [];
  for (const u of [u0, u1]) {
    const [x, z] = at(u, spec.depth / 2);
    parts.push(ctx.standee(tex.side, spec.depth, h, x, z, { rotY: rotY + Math.PI / 2, solid: true, face: 'fixed' }));
  }
  {
    const [x, z] = at((r0 + r1) / 2, spec.depth);
    const hw = Math.max((r0 + r1) / 2 - u0, u1 - (r0 + r1) / 2);
    parts.push(ctx.standee(tex.back, back.w, h, x, z, { rotY, solid: { hw }, face: 'fixed' }));
  }
  paperBack(front, [0, 0, -0.04]);
  paperBack(parts[0], [0, 0, 0.04]);
  paperBack(parts[1], [0, 0, -0.04]);
  paperBack(parts[2], [0, 0, 0.04]);

  /* THE ROOF: sheets laid in world space, eave to ridge, from just
   * behind the front's face to just past the back. */
  const d0 = 0.03;
  const d1 = spec.depth + (keep ? 0 : OVER);
  const sheets: [number, number, number, number][] = keep
    ? [[u0, baseY, u1, baseY]]
    : [[r0, baseY, au, ridgeY], [r1, baseY, au, ridgeY]];
  const walls = [front, ...parts];
  for (const [ue, ye, ur, yr] of sheets) {
    const e0 = at(ue, d0), e1 = at(ue, d1), q1 = at(ur, d1), q0 = at(ur, d0);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute([
      e0[0], ye, e0[1], e1[0], ye, e1[1], q1[0], yr, q1[1], q0[0], yr, q0[1],
    ], 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 1], 2));
    geo.setIndex([0, 1, 2, 0, 2, 3]);
    const mat = new THREE.MeshBasicMaterial({ map: tex.roof, transparent: true, alphaTest: 0.1, side: THREE.DoubleSide });
    inkBlend(mat);
    const roof = new THREE.Mesh(geo, mat);
    // a roof fades as far as the faintest wall under it: a house cleared
    // from between the lens and the walker is cleared roof and all
    roof.onBeforeRender = () => {
      let o = 1;
      for (const m of walls) o = Math.min(o, (m.material as THREE.MeshBasicMaterial).opacity);
      mat.opacity = o;
    };
    ctx.group.add(roof);
    paperBack(roof, [0, -0.05, 0]);
    parts.push(roof);
  }
  front.userData.box = parts;
  return parts;
}

/**
 * THE PAPER INSIDE THE WASH. Every drawing in the game is a wash at
 * about sixty per cent, so a card lets the world behind it through;
 * a box of such cards is a glass box, its own far corners drawn
 * through its front. So each sheet of a box is backed, on its inside,
 * by the same silhouette in plain paper: drawn before every other
 * cutout (renderOrder −1), opaque, writing depth, so nothing behind a
 * house shows through it — the house is a solid thing, as it is to
 * the foot.
 *
 * It follows its sheet's opacity every frame, and stops writing depth
 * the moment the sheet is faded at all, so the near-fade that clears a
 * house from between the lens and the walker (and a room's front going
 * to pencil) clears the paper with it and never hides the walker.
 */
function paperBack(sheet: THREE.Mesh, offset: [number, number, number]) {
  const own = sheet.material as THREE.MeshBasicMaterial;
  const mat = new THREE.MeshBasicMaterial({
    map: own.map, color: PAPER, transparent: true, side: THREE.DoubleSide,
  });
  mat.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <map_fragment>',
      // the silhouette only: where the sheet is washed, paper; else nothing
      'if ( texture2D( map, vMapUv ).a < 0.35 ) discard;'
    );
  };
  mat.customProgramCacheKey = () => 'paper-back';
  const back = new THREE.Mesh(sheet.geometry, mat);
  back.position.set(...offset);
  back.renderOrder = -1;
  back.onBeforeRender = () => {
    mat.opacity = own.opacity;
    mat.depthWrite = own.opacity > 0.95;
  };
  sheet.add(back);
}
