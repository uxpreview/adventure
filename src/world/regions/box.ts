import * as THREE from 'three';
import type { BuildCtx } from './index';
import { boxPieces, packSheet, rowPieces, type BoxStyle, type RowHouse, type RowInk } from '../textures-box';
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
 * 210 to 386. So a land's boxes are BATCHED: every drawing they use
 * (fronts, sides, backs, roofs) is laid on one sheet (`packSheet`), and
 * `flushBoxes` (called once a land is built) merges every box into one
 * mesh of drawings and one of paper — two draw calls a land.
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
/** A piece of a building, by index on the land's sheet-to-be. */
type Buf = { pos: number[]; uv: number[]; hid: number[]; piece: number[] };
type Batch = {
  /** Every distinct drawing the land's boxes use, laid on one sheet at flush. */
  pieces: HTMLCanvasElement[];
  /** Each house's front and wall stand-ins: its opacity is the least of theirs. */
  houses: THREE.Mesh[][];
  ink: Buf;
  paper: Buf;
};

/** Pieces, once per (seed, size): the court's twenty houses are three drawings. */
const made = new Map<string, ReturnType<typeof boxPieces>>();
/** A land's boxes, until the land is built. */
const pending = new WeakMap<BuildCtx, Batch>();

/** How far a back wall reaches past the side walls, and a roof past both. */
const OVER = 0.3;
/** How far the paper sits inside the drawing it backs. */
const IN = 0.04;

/** A quad, corners bottom-left, bottom-right, top-right, top-left as the
 *  piece is drawn, into a batch's buffers, pushed `off` from where it is.
 *  UVs are the piece's own, 0..1; the sheet's are put in at flush. */
function quad(into: Buf, c: V3[], piece: number, h: number, off: V3 = [0, 0, 0]) {
  const uv = [[0, 0], [1, 0], [1, 1], [0, 1]];
  for (const i of [0, 1, 2, 0, 2, 3]) {
    into.pos.push(c[i][0] + off[0], c[i][1] + off[1], c[i][2] + off[2]);
    into.uv.push(uv[i][0], uv[i][1]);
    into.hid.push(h);
    into.piece.push(piece);
  }
}

function batchOf(ctx: BuildCtx): Batch {
  let b = pending.get(ctx);
  if (!b) {
    b = { pieces: [], houses: [], ink: { pos: [], uv: [], hid: [], piece: [] }, paper: { pos: [], uv: [], hid: [], piece: [] } };
    pending.set(ctx, b);
  }
  return b;
}

function pieceOf(b: Batch, c: HTMLCanvasElement) {
  let i = b.pieces.indexOf(c);
  if (i < 0) i = b.pieces.push(c) - 1;
  return i;
}

/** Where a front stands: its local x across it (`ax`), the way back
 *  into the page (`bk`), a point `u` across and `d` back at height `y`
 *  (`at`), and THE STAND-INS: a real solid standee for each wall, never
 *  drawn, for the barrier, the near-fade and the skyline. */
function frame(ctx: BuildCtx, front: THREE.Mesh, h: number) {
  const rotY = front.rotation.y;
  const frontTex = (front.material as THREE.MeshBasicMaterial).map!;
  const ax = [Math.cos(rotY), -Math.sin(rotY)];
  const bk = [-Math.sin(rotY), -Math.cos(rotY)];
  const px = front.position.x;
  const pz = front.position.z;
  const at = (u: number, d: number, y: number): V3 => [px + ax[0] * u + bk[0] * d, y, pz + ax[1] * u + bk[1] * d];
  const stands: THREE.Mesh[] = [];
  const stand = (c: V3, sw: number, ry: number, solid: true | { hw: number }) => {
    const m = ctx.standee(frontTex, sw, h, c[0], c[2], { rotY: ry, solid, face: 'fixed' });
    (m.material as THREE.MeshBasicMaterial).visible = false;
    stands.push(m);
    return m.position.y;
  };
  return { ax, bk, at, stands, stand };
}

export function boxUp(ctx: BuildCtx, front: THREE.Mesh, w: number, h: number, spec: BoxSpec): THREE.Mesh[] {
  const s = spec.style;
  const rotY = front.rotation.y;
  const [u0, u1] = spec.sidesAt ?? [(spec.x0 - 0.5) * w, (spec.x1 - 0.5) * w];
  const cu = (px: number) => (px / s.canvasW - 0.5) * w;
  const y0 = front.position.y;
  const hy = (py: number) => y0 + (1 - py / s.canvasH) * h;
  const keep = s.top === 'keep';
  /** a roof you could stand on: the keep's leads, an office block's felt */
  const level = keep || s.top === 'flat';
  const lean = s.top === 'lean';

  // the roof's span: the front's own eave corners, never inside the walls
  // (a flat roof is exactly its walls: the parapet is the wall going up)
  const r0 = keep ? u0 - OVER : level ? u0 : Math.min(cu(s.roofL ?? 0), u0 - OVER);
  const r1 = keep ? u1 + OVER : level ? u1 : Math.max(cu(s.roofR ?? s.canvasW), u1 + OVER);
  const au = level || lean ? (u0 + u1) / 2 : cu(s.apex ?? s.canvasW / 2);
  const baseY = hy(level ? s.eave : s.roofBase ?? s.eave);
  const ridgeY = hy(s.ridge);
  const slope = level ? u1 - u0
    : lean ? Math.hypot(spec.depth, ridgeY - baseY)
    : Math.max(Math.hypot(au - r0, ridgeY - baseY), Math.hypot(r1 - au, ridgeY - baseY));

  const back = { w: r1 - r0, wallL: u0 - r0, wallR: u1 - r0, apexU: au - r0 };
  const frontTex = (front.material as THREE.MeshBasicMaterial).map!;
  const key = `${spec.seed}:${w}:${h}:${spec.depth}:${back.w.toFixed(2)}`;
  let drawn = made.get(key);
  if (!drawn) {
    drawn = boxPieces(spec.seed, s, h, spec.depth, back, slope, lean ? r1 - r0 : spec.depth);
    made.set(key, drawn);
  }
  const b = batchOf(ctx);
  const piece = (c: HTMLCanvasElement) => pieceOf(b, c);
  const P = {
    front: piece(frontTex.image as HTMLCanvasElement),
    side: piece(drawn.side), back: piece(drawn.back), roof: piece(drawn.roof),
  };
  const hi = b.houses.length;
  const { ax, bk, at, stands, stand } = frame(ctx, front, h);

  // the paper behind the front
  quad(b.paper, [at(-w / 2, 0, y0), at(w / 2, 0, y0), at(w / 2, 0, y0 + h), at(-w / 2, 0, y0 + h)],
    P.front, hi, [bk[0] * IN, 0, bk[1] * IN]);
  // the sides, drawn from the front corner back, paper on the inside
  for (const [u, inward] of [[u0, 1], [u1, -1]] as const) {
    const ys = stand(at(u, spec.depth / 2, 0), spec.depth, rotY + Math.PI / 2, true);
    const cs: V3[] = [at(u, 0, ys), at(u, spec.depth, ys), at(u, spec.depth, ys + h), at(u, 0, ys + h)];
    quad(b.ink, cs, P.side, hi);
    quad(b.paper, cs, P.side, hi, [ax[0] * IN * inward, 0, ax[1] * IN * inward]);
  }
  // the back: its gable, no door
  {
    const hw = Math.max((r0 + r1) / 2 - u0, u1 - (r0 + r1) / 2);
    const yb = stand(at((r0 + r1) / 2, spec.depth, 0), back.w, rotY, { hw });
    const cs: V3[] = [at(r0, spec.depth, yb), at(r1, spec.depth, yb), at(r1, spec.depth, yb + h), at(r0, spec.depth, yb + h)];
    quad(b.ink, cs, P.back, hi);
    quad(b.paper, cs, P.back, hi, [-bk[0] * IN, 0, -bk[1] * IN]);
  }
  // the roof: sheets eave to ridge, from just behind the front's face
  // to just past the back
  const d0 = 0.03;
  const d1 = spec.depth + (level || lean ? 0 : OVER);
  const sheets: V3[][] = lean
    // one pitch, across the front: eave along the front, ridge on the back wall
    ? [[at(r0, d0, baseY), at(r1, d0, baseY), at(r1, d1, ridgeY), at(r0, d1, ridgeY)]]
    : (level ? [[u0, baseY, u1, baseY]] : [[r0, baseY, au, ridgeY], [r1, baseY, au, ridgeY]])
      .map(([ue, ye, ur, yr]) => [at(ue, d0, ye), at(ue, d1, ye), at(ur, d1, yr), at(ur, d0, yr)]);
  for (const cs of sheets) {
    quad(b.ink, cs, P.roof, hi);
    quad(b.paper, cs, P.roof, hi, [0, -0.05, 0]);
  }
  b.houses.push([front, ...stands]);
  front.userData.box = stands;
  return stands;
}

/**
 * Merge a land's boxes into two meshes, one of drawings and one of
 * paper, on one sheet. The region builder calls this once a land is built.
 */
export function flushBoxes(ctx: BuildCtx) {
  const b = pending.get(ctx);
  if (!b) return;
  pending.delete(ctx);
  {
    const sheet = packSheet(b.pieces);
    // the pieces' own UVs, onto the sheet
    for (const g of [b.ink, b.paper]) {
      for (let v = 0; v < g.piece.length; v++) {
        const r = sheet.rects[g.piece[v]];
        g.uv[v * 2] = r[0] + (r[1] - r[0]) * g.uv[v * 2];
        g.uv[v * 2 + 1] = r[2] + (r[3] - r[2]) * g.uv[v * 2 + 1];
      }
    }
    const tex = sheet.tex;
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
    const ink = new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.1, side: THREE.DoubleSide });
    /* THE INK WRITES NO DEPTH: the paper behind every sheet does the
     * hiding. A house faded to let the walker through is ink at a
     * seventh, and all the land's ink is one mesh, so a faded house
     * that wrote depth kept every house drawn after it from inking
     * where it stood — their bare paper showed through it, white. */
    ink.depthWrite = false;
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
    const paper = new THREE.MeshBasicMaterial({ map: tex, color: PAPER, transparent: true, side: THREE.DoubleSide });
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
    /* for the harness: each house's opacity, and its front */
    paperMesh.userData.houses = { op: op.value, fronts: b.houses.map((walls) => walls[0]) };

    ctx.group.add(paperMesh, inkMesh);
  }
}

/**
 * A ROW OF HOUSES IS A PAPER BOX TOO (Brim's terraces). The same box,
 * except that a row is three or four houses each with its own eave and
 * roof, as the front rolled them (`ROW_SHAPE`): an end wall at each end
 * of the row, a party wall wherever a taller house stands over a lower
 * one, a back drawn from the same record, and each house its own roof —
 * a ridge along the street for a house that shows the street its long
 * slope, a gable running back for one that shows it its gable.
 */
export function rowUp(
  ctx: BuildCtx, front: THREE.Mesh, w: number, h: number,
  spec: { houses: RowHouse[]; ink: RowInk; depth: number; seed: number; canvasW: number; canvasH: number; ground: number }
): THREE.Mesh[] {
  const { houses, depth: D } = spec;
  const cu = (px: number) => (px / spec.canvasW - 0.5) * w;
  const y0 = front.position.y;
  const hy = (py: number) => y0 + (1 - py / spec.canvasH) * h;
  const rotY = front.rotation.y;
  const frontTex = (front.material as THREE.MeshBasicMaterial).map!;
  const drawn = rowPieces(spec.seed, houses, spec.ink, spec.canvasW, spec.canvasH, spec.ground, h, D);

  const b = batchOf(ctx);
  const hi = b.houses.length;
  const P = {
    front: pieceOf(b, frontTex.image as HTMLCanvasElement),
    sides: drawn.sides.map((c) => pieceOf(b, c)), back: pieceOf(b, drawn.back), roof: pieceOf(b, drawn.roof),
  };
  const { ax, bk, at, stands, stand } = frame(ctx, front, h);
  const across = (k: number): V3 => [ax[0] * k, 0, ax[1] * k];

  // the paper behind the front
  quad(b.paper, [at(-w / 2, 0, y0), at(w / 2, 0, y0), at(w / 2, 0, y0 + h), at(-w / 2, 0, y0 + h)],
    P.front, hi, [bk[0] * IN, 0, bk[1] * IN]);

  /* the ends: the first house's and the last house's, solid */
  const uL = cu(houses[0].x0 + 2);
  const uR = cu(houses[houses.length - 1].x1 - 2);
  for (const [u, i, inward] of [[uL, 0, 1], [uR, houses.length - 1, -1]] as const) {
    const ys = stand(at(u, D / 2, 0), D, rotY + Math.PI / 2, true);
    const cs: V3[] = [at(u, 0, ys), at(u, D, ys), at(u, D, ys + h), at(u, 0, ys + h)];
    quad(b.ink, cs, P.sides[i], hi);
    quad(b.paper, cs, P.sides[i], hi, across(IN * inward));
  }
  /* the party walls, where one house stands over the next: the taller
   * one's end, inked on both faces with the paper between */
  const top = (hs: RowHouse) => (hs.side ? hs.ridge : hs.eave);
  for (let i = 0; i + 1 < houses.length; i++) {
    const [a, c] = [houses[i], houses[i + 1]];
    const t = top(a) <= top(c) ? i : i + 1;
    const u = cu(c.x0);
    const cs: V3[] = [at(u, 0, y0), at(u, D, y0), at(u, D, y0 + h), at(u, 0, y0 + h)];
    quad(b.ink, cs, P.sides[t], hi, across(IN));
    quad(b.ink, cs, P.sides[t], hi, across(-IN));
    quad(b.paper, cs, P.sides[t], hi);
  }
  /* the back, the width of the front's canvas, solid across its walls */
  {
    const yb = stand(at((uL + uR) / 2, D, 0), uR - uL, rotY, true);
    const cs: V3[] = [at(-w / 2, D, yb), at(w / 2, D, yb), at(w / 2, D, yb + h), at(-w / 2, D, yb + h)];
    quad(b.ink, cs, P.back, hi);
    quad(b.paper, cs, P.back, hi, [-bk[0] * IN, 0, -bk[1] * IN]);
  }
  /* every house's own roof */
  const d0 = 0.03;
  for (const hs of houses) {
    const ul = cu(hs.x0 - hs.jet - 2 + hs.lean);
    const ur = cu(hs.x1 + hs.jet + 2 + hs.lean);
    const eY = hy(hs.eave + 1);
    const rY = hy(hs.ridge);
    const sheets: V3[][] = hs.side
      // a long ridge halfway back, a slope down to the street and one to the yard
      ? [[at(ul, d0, eY), at(ur, d0, eY), at(ur, D / 2, rY), at(ul, D / 2, rY)],
        [at(ul, D, eY), at(ur, D, eY), at(ur, D / 2, rY), at(ul, D / 2, rY)]]
      // a gable to the street: two slopes running back from its apex
      : [ul, ur].map((ue) => {
        const ua = cu(hs.apex);
        return [at(ue, d0, eY), at(ue, D, eY), at(ua, D, rY), at(ua, d0, rY)];
      });
    for (const cs of sheets) {
      quad(b.ink, cs, P.roof, hi);
      quad(b.paper, cs, P.roof, hi, [0, -0.05, 0]);
    }
  }
  b.houses.push([front, ...stands]);
  front.userData.box = stands;
  return stands;
}
