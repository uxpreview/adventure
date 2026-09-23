import * as THREE from 'three';
import type { BuildCtx } from './index';
import { boxAtlas, type AtlasRect, type BoxStyle } from '../textures-box';
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
 * THE FRAME BUDGET. Built as meshes of their own, the sides, back, roof
 * and paper were eleven draw calls a house, and Maple Court went from
 * 210 to 386. So every box of a kind in a land is BATCHED: its pieces
 * are laid on one atlas (`boxAtlas`), and `flushBoxes` (called once a
 * land is built) merges them into one mesh of drawings and one of
 * paper — two draw calls per kind of house, whatever the count.
 *
 * Each house still fades on its own: every vertex carries its house's
 * index, and a small uniform array holds each house's opacity, read
 * every frame off its front and off its walls' INVISIBLE STAND-INS —
 * a real standee per side and back, with its barrier, its footprint in
 * the near-fade and its top in the skyline, whose material is simply
 * never drawn. So the near-fade that clears a house from between the
 * lens and the walker, and a room's front going to pencil (`room.ts`
 * fades `front.userData.box`, which is the stand-ins), clear the box.
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

type V3 = [number, number, number];
type Buf = { pos: number[]; uv: number[]; hid: number[] };
type Batch = {
  tex: THREE.CanvasTexture;
  /** Each house's front and wall stand-ins: its opacity is the least of theirs. */
  houses: THREE.Mesh[][];
  ink: Buf;
  paper: Buf;
};

/** Atlases, once per (seed, size): the court's twenty houses are three drawings. */
const atlases = new Map<string, ReturnType<typeof boxAtlas>>();
/** A land's boxes, by atlas, until the land is built. */
const pending = new WeakMap<BuildCtx, Map<string, Batch>>();

/** How far a back wall reaches past the side walls, and a roof past both. */
const OVER = 0.3;
/** How far the paper sits inside the drawing it backs. */
const IN = 0.04;

/** A quad, corners bottom-left, bottom-right, top-right, top-left as the
 *  piece is drawn, into a batch's buffers, pushed `off` from where it is. */
function quad(into: Buf, c: V3[], r: AtlasRect, h: number, off: V3 = [0, 0, 0]) {
  const uv = [[r[0], r[2]], [r[1], r[2]], [r[1], r[3]], [r[0], r[3]]];
  for (const i of [0, 1, 2, 0, 2, 3]) {
    into.pos.push(c[i][0] + off[0], c[i][1] + off[1], c[i][2] + off[2]);
    into.uv.push(uv[i][0], uv[i][1]);
    into.hid.push(h);
  }
}

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
  const frontTex = (front.material as THREE.MeshBasicMaterial).map!;
  const key = `${spec.seed}:${w}:${h}:${spec.depth}:${back.w.toFixed(2)}`;
  let atlas = atlases.get(key);
  if (!atlas) {
    atlas = boxAtlas(spec.seed, s, frontTex.image as HTMLCanvasElement, h, spec.depth, back, slope);
    atlases.set(key, atlas);
  }
  let land = pending.get(ctx);
  if (!land) pending.set(ctx, (land = new Map()));
  let b = land.get(key);
  if (!b) {
    b = { tex: atlas.tex, houses: [], ink: { pos: [], uv: [], hid: [] }, paper: { pos: [], uv: [], hid: [] } };
    land.set(key, b);
  }
  const hi = b.houses.length;

  // the front's local x across it, and the way back into the page
  const ax = [Math.cos(rotY), -Math.sin(rotY)];
  const bk = [-Math.sin(rotY), -Math.cos(rotY)];
  const px = front.position.x;
  const pz = front.position.z;
  const at = (u: number, d: number, y: number): V3 => [px + ax[0] * u + bk[0] * d, y, pz + ax[1] * u + bk[1] * d];

  /* THE STAND-INS: a real solid standee for each wall, never drawn. */
  const stands: THREE.Mesh[] = [];
  const stand = (c: V3, sw: number, ry: number, solid: true | { hw: number }) => {
    const m = ctx.standee(atlas!.tex, sw, h, c[0], c[2], { rotY: ry, solid, face: 'fixed' });
    (m.material as THREE.MeshBasicMaterial).visible = false;
    stands.push(m);
    return m.position.y;
  };

  // the paper behind the front
  quad(b.paper, [at(-w / 2, 0, y0), at(w / 2, 0, y0), at(w / 2, 0, y0 + h), at(-w / 2, 0, y0 + h)],
    atlas.front, hi, [bk[0] * IN, 0, bk[1] * IN]);
  // the sides, drawn from the front corner back, paper on the inside
  for (const [u, inward] of [[u0, 1], [u1, -1]] as const) {
    const ys = stand(at(u, spec.depth / 2, 0), spec.depth, rotY + Math.PI / 2, true);
    const cs: V3[] = [at(u, 0, ys), at(u, spec.depth, ys), at(u, spec.depth, ys + h), at(u, 0, ys + h)];
    quad(b.ink, cs, atlas.side, hi);
    quad(b.paper, cs, atlas.side, hi, [ax[0] * IN * inward, 0, ax[1] * IN * inward]);
  }
  // the back: its gable, no door
  {
    const hw = Math.max((r0 + r1) / 2 - u0, u1 - (r0 + r1) / 2);
    const yb = stand(at((r0 + r1) / 2, spec.depth, 0), back.w, rotY, { hw });
    const cs: V3[] = [at(r0, spec.depth, yb), at(r1, spec.depth, yb), at(r1, spec.depth, yb + h), at(r0, spec.depth, yb + h)];
    quad(b.ink, cs, atlas.back, hi);
    quad(b.paper, cs, atlas.back, hi, [-bk[0] * IN, 0, -bk[1] * IN]);
  }
  // the roof: sheets eave to ridge, from just behind the front's face
  // to just past the back
  const d0 = 0.03;
  const d1 = spec.depth + (keep ? 0 : OVER);
  const sheets: [number, number, number, number][] = keep
    ? [[u0, baseY, u1, baseY]]
    : [[r0, baseY, au, ridgeY], [r1, baseY, au, ridgeY]];
  for (const [ue, ye, ur, yr] of sheets) {
    const cs: V3[] = [at(ue, d0, ye), at(ue, d1, ye), at(ur, d1, yr), at(ur, d0, yr)];
    quad(b.ink, cs, atlas.roof, hi);
    quad(b.paper, cs, atlas.roof, hi, [0, -0.05, 0]);
  }
  b.houses.push([front, ...stands]);
  front.userData.box = stands;
  return stands;
}

/**
 * Merge a land's boxes into their meshes: per atlas, one of drawings
 * and one of paper. The region builder calls this once a land is built.
 */
export function flushBoxes(ctx: BuildCtx) {
  const land = pending.get(ctx);
  if (!land) return;
  pending.delete(ctx);
  for (const b of land.values()) {
    const n = b.houses.length;
    const op = { value: new Array<number>(n).fill(1) };
    const read = () => {
      b.houses.forEach((walls, i) => {
        let o = 1;
        for (const m of walls) o = Math.min(o, (m.material as THREE.MeshBasicMaterial).opacity);
        op.value[i] = o;
      });
    };
    const perHouse = (shader: THREE.WebGLProgramParametersWithUniforms) => {
      shader.uniforms.uHOp = op;
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', `#include <common>\nattribute float hIdx;\nuniform float uHOp[ ${n} ];\nvarying float vHOp;`)
        .replace('#include <begin_vertex>', '#include <begin_vertex>\n\tvHOp = uHOp[ int( hIdx + 0.5 ) ];');
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', '#include <common>\nvarying float vHOp;');
    };
    const geo = (g: Buf) => {
      const out = new THREE.BufferGeometry();
      out.setAttribute('position', new THREE.Float32BufferAttribute(g.pos, 3));
      out.setAttribute('uv', new THREE.Float32BufferAttribute(g.uv, 2));
      out.setAttribute('hIdx', new THREE.Float32BufferAttribute(g.hid, 1));
      out.computeBoundingSphere();
      return out;
    };

    /* THE DRAWINGS: the pen's own blend, times the house's opacity. */
    const ink = new THREE.MeshBasicMaterial({ map: b.tex, transparent: true, alphaTest: 0.1, side: THREE.DoubleSide });
    inkBlend(ink);
    const pen = ink.onBeforeCompile;
    ink.onBeforeCompile = (shader, renderer) => {
      pen.call(ink, shader, renderer);
      perHouse(shader);
      shader.fragmentShader = shader.fragmentShader.replace(
        'gl_FragColor.rgb *= opacity;', 'gl_FragColor.rgb *= opacity;\n\tgl_FragColor *= vHOp;');
    };
    ink.customProgramCacheKey = () => `box-ink-${n}`;
    const inkMesh = new THREE.Mesh(geo(b.ink), ink);
    inkMesh.onBeforeRender = read;

    /* THE PAPER INSIDE THE WASH. Every drawing in the game is a wash at
     * about sixty per cent, so a box of cards is a glass box, its own
     * far corners drawn through its front. So each sheet is backed on
     * its inside by its own silhouette in plain paper, drawn before
     * every other cutout (renderOrder −1) and writing depth, so nothing
     * behind a house shows through it. A house faded at all has no
     * paper — it is discarded, so it writes no depth — and the near-fade
     * never hides the walker behind one. */
    const paper = new THREE.MeshBasicMaterial({ map: b.tex, color: PAPER, transparent: true, side: THREE.DoubleSide });
    paper.onBeforeCompile = (shader) => {
      perHouse(shader);
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <map_fragment>',
        'if ( texture2D( map, vMapUv ).a < 0.35 || vHOp < 0.95 ) discard;'
      );
    };
    paper.customProgramCacheKey = () => `box-paper-${n}`;
    const paperMesh = new THREE.Mesh(geo(b.paper), paper);
    paperMesh.renderOrder = -1;
    paperMesh.onBeforeRender = read;

    ctx.group.add(paperMesh, inkMesh);
  }
}
