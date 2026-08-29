import * as THREE from 'three';
import { StandeeField, type StandeeFieldOpts } from '../../engine/StandeeField';
import { makeStandee, makeDecal, disposeGroup } from '../../engine/props';
import { rng } from '../../engine/ink';
import { Terrain } from '../terrain';
import { WORLD, REGION_SPECS, BRIDGES, type RegionId, type RegionSpec, type Rect } from '../layout';
import { bridgeTexture, bridgeDeckDecal } from '../textures';
import { buildMeadow } from './meadow';
import { buildForest, buildCanyon, buildDesert, buildDowns } from './wilds';
import { buildOcean, buildBeach } from './coast';
import { buildKingdom, buildCastle, buildNeighborhood, buildCity, buildOffice } from './civic';

/**
 * REGION STREAMING — the sheet is one page, but it is furnished lazily.
 *
 * Session 4 — THE PAPER HAS A SHAPE. Placement is centralised HERE, and
 * that is what let elevation land without re-opening twelve region
 * builders: ctx.standee, ctx.decal and ctx.field all stand their props
 * on terrain.heightAt(), ctx.decal lies its marks along the surface
 * normal, and every f.set(i, x, z, …) already written in the world does
 * the right thing on a slope. Standees stay VERTICAL — they are paper
 * cutouts on a warped page, and tilting them would break the one
 * metaphor the whole game rests on. Anything a builder HANGS in the air
 * (a pennant, a bird, bunting) uses ctx.groundY / ctx.hang, because an
 * absolute y means something different now.
 *
 * A region's props are drawn (canvases and all) the first time the
 * walker comes within reach of its rect, one region per frame at most,
 * so crossing the world never hitches. Its standee fields are born
 * GHOSTED — faint pencil under-drawing — and the ink wave (cascadeFrom)
 * runs from wherever the player first sets foot across the border:
 * the land draws itself in around your arrival. Once drawn, a region
 * stays built; distance only toggles visibility.
 */

export type BuildCtx = {
  group: THREE.Group;
  terrain: Terrain;
  r: () => number;
  rect: Rect;
  /** Instanced field: create, add, and register for ticking. */
  field: (tex: THREE.Texture, capacity: number, opts: StandeeFieldOpts) => StandeeField;
  /** One-off paper stand-up at (x, z), standing on the ground, vertical. */
  standee: (tex: THREE.Texture, w: number, h: number, x: number, z: number, opts?: { rotY?: number; opacity?: number }) => THREE.Mesh;
  /** Ground decal at (x, z), lying along the page's surface. */
  decal: (tex: THREE.Texture, w: number, h: number, x: number, z: number, rotY?: number, opacity?: number) => THREE.Mesh;
  /** The ground at (x, z) — for anything hung in the air over it. */
  groundY: (x: number, z: number) => number;
  /** Hang a mesh `h` units above the ground it already stands on. */
  hang: (m: THREE.Mesh, h: number) => THREE.Mesh;
  /** Seeded scatter inside the rect, avoiding water/roads by default. */
  scatter: (n: number, opts?: {
    pad?: number; minDist?: number; rect?: Rect;
    allowWater?: boolean; allowRoad?: boolean; allowSteep?: boolean;
    avoid?: (x: number, z: number) => boolean;
  }) => [number, number][];
};

export type RegionBuilder = (ctx: BuildCtx) =>
  ((dt: number, t: number, px: number, pz: number) => void) | void;

/** A point of interest plus the note card its interact opens, if any. */
export type WorldPOI = import('../../engine/POI').POIDef & {
  note?: { title: string; body: string };
};

const BUILDERS: Record<RegionId, RegionBuilder> = {
  meadow: buildMeadow,
  forest: buildForest,
  canyon: buildCanyon,
  desert: buildDesert,
  downs: buildDowns,
  ocean: buildOcean,
  beach: buildBeach,
  kingdom: buildKingdom,
  castle: buildCastle,
  neighborhood: buildNeighborhood,
  city: buildCity,
  office: buildOffice,
};

type Built = {
  group: THREE.Group;
  fields: StandeeField[];
  update: ((dt: number, t: number, px: number, pz: number) => void) | null;
  inked: boolean;
};

const BUILD_REACH = 185;
const SHOW_REACH = 165;

/**
 * Lay a flat mark along the page. A decal is INK ON PAPER: on a fold it
 * follows the fold. Yaw first, then tip the quad into the surface
 * normal — the two-axis tilt a sheet of paper actually has.
 */
const _n = new THREE.Vector3();
const _q = new THREE.Quaternion();
const _e = new THREE.Euler();
const UP = new THREE.Vector3(0, 1, 0);
export function lieOnGround(
  m: THREE.Object3D, terrain: Terrain, x: number, z: number, rotY = 0
) {
  const [nx, ny, nz] = terrain.normalAt(x, z);
  _n.set(nx, ny, nz);
  _q.setFromUnitVectors(UP, _n);
  _e.set(0, rotY, 0);
  m.quaternion.setFromEuler(_e).premultiply(_q);
}

function rectDist(r: Rect, x: number, z: number): number {
  const dx = Math.max(r.minX - x, 0, x - r.maxX);
  const dz = Math.max(r.minZ - z, 0, z - r.maxZ);
  return Math.hypot(dx, dz);
}

export class World {
  private built = new Map<RegionId, Built>();
  private bridges: THREE.Group;

  constructor(private scene: THREE.Scene, private terrain: Terrain) {
    // bridges belong to the road web, not to any one land
    this.bridges = new THREE.Group();
    BRIDGES.forEach((b, i) => {
      // the height field levels the river's fold around a crossing, so a
      // plank deck still spans it flat — but the crossing itself sits
      // wherever the page put it
      const deckY = terrain.heightAt(b.x, b.z);
      const deck = makeDecal(bridgeDeckDecal(900 + i), 13, 7.2, 0.9);
      deck.position.set(b.x, deckY + 0.08, b.z);
      deck.rotation.y = -b.angle;
      this.bridges.add(deck);
      for (const side of [-1, 1]) {
        const rail = makeStandee(bridgeTexture(910 + i + (side > 0 ? 10 : 0)), 13, 4.3, 0.95);
        const rx = b.x + side * Math.sin(b.angle) * 2.6;
        const rz = b.z + side * Math.cos(b.angle) * 2.6;
        rail.position.set(rx, terrain.heightAt(rx, rz), rz);
        rail.rotation.y = b.angle;
        this.bridges.add(rail);
      }
    });
    scene.add(this.bridges);
  }

  /** Build one region synchronously (used for the spawn's surroundings). */
  ensure(id: RegionId) {
    if (this.built.has(id)) return;
    const spec = REGION_SPECS.find((s) => s.id === id)!;
    this.build(spec);
  }

  private build(spec: RegionSpec) {
    const group = new THREE.Group();
    const fields: StandeeField[] = [];
    const r = rng(spec.id.split('').reduce((a, c) => a * 31 + c.charCodeAt(0), 7) >>> 0);
    const terrain = this.terrain;
    const rect = spec.rect;

    const ctx: BuildCtx = {
      group, terrain, r, rect,
      groundY: (x, z) => terrain.heightAt(x, z),
      hang: (m, h) => {
        m.position.y = terrain.heightAt(m.position.x, m.position.z) + h;
        return m;
      },
      field: (tex, capacity, opts) => {
        const f = new StandeeField(tex, capacity, {
          ghost: 0.16,
          ground: (x, z) => terrain.heightAt(x, z),
          ...opts,
        });
        fields.push(f);
        group.add(f.mesh);
        return f;
      },
      standee: (tex, w, h, x, z, opts = {}) => {
        const m = makeStandee(tex, w, h, opts.opacity ?? 1);
        m.position.set(x, terrain.heightAt(x, z), z);
        if (opts.rotY) m.rotation.y = opts.rotY;
        group.add(m);
        return m;
      },
      decal: (tex, w, h, x, z, rotY = 0, opacity = 0.9) => {
        const m = makeDecal(tex, w, h, opacity);
        m.position.set(x, terrain.heightAt(x, z) + 0.05, z);
        lieOnGround(m, terrain, x, z, rotY);
        group.add(m);
        return m;
      },
      scatter: (n, o = {}) => {
        const rr = o.rect ?? rect;
        const pad = o.pad ?? 6;
        const minDist = o.minDist ?? 0;
        const out: [number, number][] = [];
        let guard = n * 40;
        while (out.length < n && guard-- > 0) {
          const x = rr.minX + pad + r() * (rr.maxX - rr.minX - pad * 2);
          const z = rr.minZ + pad + r() * (rr.maxZ - rr.minZ - pad * 2);
          if (!o.allowWater && terrain.waterAt(x, z) > 0.04) continue;
          if (!o.allowRoad && terrain.roadAt(x, z)) continue;
          // nothing scatters onto a scarp or a tear wall: paper cutouts
          // standing on a cliff face read as a bug, every time
          if (!o.allowSteep && terrain.slopeAt(x, z) > 0.5) continue;
          if (o.avoid && o.avoid(x, z)) continue;
          if (minDist > 0 && out.some(([ox, oz]) => Math.hypot(ox - x, oz - z) < minDist)) continue;
          out.push([x, z]);
        }
        return out;
      },
    };

    const update = BUILDERS[spec.id](ctx) ?? null;
    this.scene.add(group);
    this.built.set(spec.id, { group, fields, update, inked: false });
  }

  /**
   * Per frame: build at most one region in reach, cull by distance,
   * tick fields and region updates, and run the ink wave when the
   * walker first crosses into a land.
   */
  tick(dt: number, t: number, x: number, z: number, currentId: RegionId) {
    let builtOne = false;
    for (const spec of REGION_SPECS) {
      const d = rectDist(spec.rect, x, z);
      const b = this.built.get(spec.id);
      if (!b) {
        if (!builtOne && d < BUILD_REACH) {
          this.build(spec);
          builtOne = true;
        }
        continue;
      }
      b.group.visible = d < SHOW_REACH;
      if (b.group.visible) {
        for (const f of b.fields) {
          f.update(t);
          f.setPlayer(x, z);
        }
        b.update?.(dt, t, x, z);
      }
      if (!b.inked && spec.id === currentId) {
        b.inked = true;
        for (const f of b.fields) f.cascadeFrom(x, z, 34, t, 0.3);
      }
    }
  }

  /** For a fresh save: ink the spawn land instantly, no wave. */
  inkImmediate(id: RegionId) {
    const b = this.built.get(id);
    if (!b) return;
    b.inked = true;
    for (const f of b.fields) f.birthAll(0);
  }

  dispose() {
    for (const [, b] of this.built) {
      this.scene.remove(b.group);
      disposeGroup(b.group);
      for (const f of b.fields) f.dispose();
    }
    this.built.clear();
    this.scene.remove(this.bridges);
    disposeGroup(this.bridges);
  }
}

export { WORLD, REGION_SPECS };
