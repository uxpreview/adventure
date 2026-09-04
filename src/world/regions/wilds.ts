import * as THREE from 'three';
import { signpostTexture } from '../textures';
import { tearX } from '../elevation';
import {
  wallPanelTexture, stackTexture, blockTexture, dryBedDecal, screeTexture,
  slotShadowTexture, gritTexture, deadScrubTexture, needleArchTexture,
  markSlabTexture, rimMarkTexture, holtShedTexture, holtHouseTexture,
  boatOnTrestlesTexture, trestlesTexture, boatRightedTexture, holtTexture,
  bootsTexture, cairnTexture, turningBirdTexture, fallDustTexture,
  mouthPostTexture,
} from '../textures-canyon';
import {
  flatsGroundDecal, crackedPanDecal, trackDecal, oasisReedTexture,
  flatsPalmTexture, flatsScrubTexture, fencePostTexture, flatsSignTexture,
  rainApronTexture, cisternTexture, rainTableTexture, amosTexture,
  waterCanTexture, dustDevilTexture, flatsTumbleweedTexture, flatsBoneTexture,
} from '../textures-flats';
import {
  leafLitterDecal, hedgerowTexture, leanGrassTexture, wornGroundDecal,
} from '../textures-common';
import {
  penwoodPineTexture, pineCropTexture, youngPineTexture, fallenPineTexture,
  needleFloorDecal, tarnSkinDecal, brackTexture, hallowsTexture, oarLeanTexture,
  choppingBlockTexture, stumpTexture, birchTexture, bracketFungusTexture,
  wornRoundDecal, tarnBoatTexture, goatTexture, type Reg,
} from '../textures-wood';
import {
  stubbleDecal, ploughDecal, fallowDecal, standingCornTexture, stookTexture,
  downsHedgeTexture, hedgeStandardTexture, millTexture, millSailsTexture,
  granaryTexture, picnicTexture, thornTexture, joanTexture, fieldHandTexture,
  sheepTexture, stoneTroughTexture, fieldGateTexture, fordStonesDecal,
  shedAxleTexture, downsScarecrowTexture, sackCartTexture,
} from '../textures-farm';
import { lampGlowTexture } from '../textures';
import {
  heronTexture, batTexture, childTexture, lizardTexture, kiteTexture, snakeTexture,
  cowTexture, dogTexture,
} from '../textures-life';
import { rookTexture } from '../textures-oldworld';
import { Figure, Creature, stops } from '../life';
import { Follower } from '../company';
import { weather } from '../weather';
import { rookAt } from '../rooks';
import { SPEC_BY_ID } from '../layout';
import { clock } from '../daylight';
import { platform } from '../../engine/Eight15';
import { knowledge } from '../knowledge';
import { events, registerRoutine, routine as routineNow } from '../events';
import type { RegionBuilder, WorldPOI } from './index';

/** Fire a named audio event up to the App without a plumbing run. */
function say(name: string) {
  window.dispatchEvent(new CustomEvent('inklands:event', { detail: name }));
}

/** Fade one drawing up or down. Materials only. */
function lightUpOne(m: THREE.Mesh, k: number) {
  const mat = m.material as THREE.MeshBasicMaterial;
  mat.opacity = k;
  m.visible = k > 0.02;
}

/* ------------------------------------------------------------------ *
 * A HEDGE RUN, AND THE ONE COMPROMISE IN IT.
 *
 * A hedge is a long thin mass and the camera only ever looks north, so
 * a hedge laid north–south — which is every hedge in the Downs, because
 * the harrow's grain runs that way — is a plane seen edge-on, which is
 * to say nothing at all. That is the boardwalk problem from Session 5
 * and it does not have a clean answer for a paper cutout.
 *
 * What it has is an honest one: the panels are turned toward the run
 * but **not all the way**, so a hedge along the grain stands at about
 * fifty degrees to the view instead of ninety. It is foreshortened, it
 * recedes, and it is visible — and the panels are placed close enough
 * together that they overlap into one continuous mass rather than
 * reading as a row of cards. The cost is that a hedge is drawn about
 * five units wide instead of two, which is a lie a real hedgerow with
 * standards in it very nearly tells anyway.
 * ------------------------------------------------------------------ */
type HedgePanel = { x: number; z: number; a: number; w: number; h: number; v: number; gap: boolean };

/**
 * Walk a hedge line and RECORD its panels. Nothing is drawn here.
 *
 * Round 13 shipped this as one `ctx.standee` per panel with a unique
 * seed, which is a hundred and forty draw calls and — much worse — a
 * hundred and forty 512×160 canvases, which is about thirty-two
 * megabytes of texture for the hedges of one land. The spec's whole
 * performance budget was eighteen draw calls and four megabytes.
 *
 * So the panels are collected and then placed into SIX instanced fields
 * over six shared drawings: four unbroken and two with a gap in them.
 * Six draws, six canvases, and the hedges get the ink-in cascade for
 * free, which one-off stand-ups never had.
 */
function hedgeRun(
  out: HedgePanel[], r: () => number, pts: [number, number][],
  o: { step?: number; w?: number; h?: number; lean?: number; gaps?: number; standards?: number } = {}
) {
  const step = o.step ?? 8.5;
  const w = o.w ?? 15;
  const h = o.h ?? 4.6;
  const lean = o.lean ?? 0.58;
  const gapChance = o.gaps ?? 0.12;
  const standardChance = o.standards ?? 0.07;
  let k = out.length;
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, az] = pts[i];
    const [bx, bz] = pts[i + 1];
    const len = Math.hypot(bx - ax, bz - az);
    const n = Math.max(1, Math.round(len / step));
    for (let sIdx = 0; sIdx < n; sIdx++) {
      const t = (sIdx + 0.5) / n;
      const x = ax + (bx - ax) * t + (r() - 0.5) * 1.4;
      const z = az + (bz - az) * t + (r() - 0.5) * 1.4;
      /* THE ONE COMPROMISE IN A HEDGED LAND.
       *
       * A hedge is a long thin mass and the camera only ever looks
       * north, so a hedge laid north–south — which is every hedge in
       * the Downs, because the harrow's grain runs that way — is a
       * plane seen edge-on, which is to say nothing at all. That is the
       * boardwalk problem from Session 5 and it has no clean answer for
       * a paper cutout.
       *
       * What it has is an honest one: the panels are turned toward the
       * run but NOT ALL THE WAY, so a hedge along the grain stands at
       * about fifty degrees to the view instead of ninety. It is
       * foreshortened, it recedes, and it is visible — and consecutive
       * panels overlap and their ends are erased in the drawing itself,
       * so a run dissolves into one continuous mass rather than reading
       * as a row of cards. The cost is that a hedge is drawn about five
       * units wide instead of two, which is a lie a real hedgerow with
       * standards in it very nearly tells anyway. */
      let nx = bz - az;
      let nz = -(bx - ax);
      if (nz < 0) { nx = -nx; nz = -nz; }
      const a = Math.atan2(nx, nz) * lean;
      const gap = r() < gapChance;
      out.push({
        x, z, a: a + (r() - 0.5) * 0.12,
        w: w * (0.85 + r() * 0.3), h: h * (0.82 + r() * 0.36),
        v: k % (gap ? 2 : 4), gap,
      });
      if (!gap && r() < standardChance) {
        out.push({ x: x + (r() - 0.5) * 3, z: z + (r() - 0.5) * 3, a: 0,
          w: 5.8, h: 7.2, v: -1 - (k % 3), gap: false });
      }
      k++;
    }
  }
}

/** Is (x, z) inside this polygon? Fields are authored as polygons so a
 *  crop can stop where its hedge is and never within a stride of it. */
function inPoly(poly: [number, number][], x: number, z: number): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, zi] = poly[i];
    const [xj, zj] = poly[j];
    if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) inside = !inside;
  }
  return inside;
}

/** How far inside its own boundary a point is — so a crop can be grown
 *  INWARD from the hedge rather than scattered up against it. */
function polyInset(poly: [number, number][], x: number, z: number): number {
  let best = 1e9;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [ax, az] = poly[j];
    const [bx, bz] = poly[i];
    const dx = bx - ax;
    const dz = bz - az;
    const len2 = dx * dx + dz * dz || 1;
    const u = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / len2));
    best = Math.min(best, Math.hypot(x - (ax + dx * u), z - (az + dz * u)));
  }
  return inPoly(poly, x, z) ? best : -best;
}

/* ================================================================== *
 * THE PENWOOD — pine dark, and one man's caution turned into a road.
 *
 * Session 10, to design/specs/the-penwood.md. The land it replaces was
 * two hundred pines on a Poisson scatter at five and a half units'
 * spacing, one silhouette each, uniform from border to border, with an
 * unclipped hatch that sprayed diagonal lines fifty pixels past every
 * tree. It did not read as a wood. It read as weather.
 *
 * What is here instead is a STAND STRUCTURE — four authored stands of
 * different ages with the voids between them doing as much work as the
 * trees — and one rule that is the whole land:
 *
 *   **THE PINES LEAN AWAY FROM THE TARN. ALL OF THEM.**
 *
 * (THE-STRANGERS U17.) It is a placement rule and not a drawing: every
 * pine's flip is decided by its bearing from the water, so the lean is
 * perfectly consistent across a hundred and seventy units of wood and
 * perfectly radial around one pond. It reads first as wind. Nothing in
 * this game will ever say what it is.
 * ================================================================== */

const TARN = { x: 150, z: -195 };
/** The forty units. Brack's, and the road's, and — from this session —
 *  the boundary of the only stand in the wood nobody has ever cut. */
const FORTY = 40;
const tarnD = (x: number, z: number) => Math.hypot(x - TARN.x, z - TARN.z);

/** Brack's round, as the region draws against it. Matches the polyline
 *  in `layout.ROADS` exactly; the drawn furniture has to follow the
 *  ground's own authored line or the wear ends up beside the path. */
const RING_R = 42;
const ringPt = (a: number): [number, number] =>
  [TARN.x + Math.cos(a) * RING_R, TARN.z + Math.sin(a) * RING_R];

/* ================================================================== *
 * THE PENWOOD'S UNNAMED (Session 17). Two CUTTERS who walk in from the
 * wood gate before seven, work the failing edge where the stumps are,
 * sit at noon, and walk out at dusk — the axe you hear a long way off
 * is theirs, and they never go inside the forty. A PICKER bent in the
 * thicket in the morning. SOMEBODY WALKING THE ROUND at noon, the way
 * everybody does, all the way round and out the way they came in. A
 * CHILD on the wood road at four who runs to the first bend and back.
 * ================================================================== */
function cutter(id: string, dx: number, dh: number) {
  return { id, land: 'forest' as const, pace: 330, stops: stops([
    [6.45 + dh, 64, -117, 4, 1], [6.7 + dh, 110 + dx, -140, 4, 1], [7.05 + dh, 200 + dx, -149, 2, 1, 4.9],
    [12.0 + dh, 204 + dx, -152, 3, -1, 0.7], [12.75 + dh, 200 + dx, -149, 2, 1, 4.7], [17.55 + dh, 110 + dx, -140, 4, -1],
    [17.85 + dh, 64, -117, 4, -1, 0.02],
  ]) };
}
const CUTTERS = [cutter('the-cutters-0', 0, 0), cutter('the-cutters-1', 3.5, 0.04)];
const PICKER = { id: 'the-picker', land: 'forest' as const, pace: 240, stops: stops([
  [7.3, 64, -117, 0, 1], [7.55, 98, -168, 2, 1, 0.4], [8.05, 106, -178, 2, -1, 0.4], [8.55, 92, -186, 2, 1, 0.4],
  [9.2, 64, -117, 4, -1, 0.02],
]) };
const RING_WALK: [number, number, number, number, -1 | 1][] = [];
for (let k = 0; k <= 12; k++) {
  const a = Math.PI / 2 + (k / 12) * Math.PI * 2;
  RING_WALK.push([12.08 + k * 0.055, 150 + Math.cos(a) * 42, -195 + Math.sin(a) * 42, 0, Math.cos(a) < 0 ? -1 : 1]);
}
const ROUND_WALKER = { id: 'the-round-walked', land: 'forest' as const, pace: 410, stops: stops([
  [11.95, 100, -134, 0, 1], ...RING_WALK, [12.85, 100, -134, 0, -1, 0.02],
]) };
events.register({ id: 'the-wood-road-child', land: 'forest', at: 16.0, hours: 0.3, place: { x: 80, z: -122 } });
events.register({ id: 'the-deep-pines-bats', land: 'forest', at: 20.5, hours: 8.0, place: { x: 188, z: -246 } });

export const buildForest: RegionBuilder = (ctx) => {
  const { r, terrain, rect } = ctx;

  /* ---- the stands, and where each one is ------------------------- *
   * A wood is a mosaic of stands of different ages. Weighting is by
   * hand, per stand, and the gaps between them are authored rather than
   * left over.                                                        */
  const inRect = (x: number, z: number) =>
    x > rect.minX + 4 && x < rect.maxX - 4 && z > rect.minZ + 4 && z < rect.maxZ - 4;
  const plantable = (x: number, z: number) => {
    if (!inRect(x, z)) return false;
    if (terrain.waterAt(x, z) > 0.03) return false;
    if (terrain.roadAt(x, z)) return false;
    if (terrain.slopeAt(x, z) > 0.5) return false;
    // the water's own shore is bare: needles, and then black
    if (tarnD(x, z) < 19) return false;
    /* NOTHING STANDS IN THE ROAD OR ON ITS VERGE, and the verge is
     * eight and a half units rather than four. A forest track has a
     * corridor of light over it — that is what makes it a track and not
     * a gap — and it is also what keeps a fourteen-unit tree from
     * standing where the lens is: full ballpoint pressure at ten units
     * belongs to the eight authored near trunks and to nothing else. */
    const dr = Math.abs(tarnD(x, z) - RING_R);
    if (dr < 8.5) return false;
    return true;
  };

  /** Clustered scatter: hearts, then members, with the count and the
   *  radius per stand. Nothing in this land is evenly spaced. */
  const clustered = (
    hearts: [number, number][], per: [number, number], rad: number
  ): [number, number][] => {
    const out: [number, number][] = [];
    for (const [hx, hz] of hearts) {
      const n = per[0] + Math.floor(r() * (per[1] - per[0]));
      for (let i = 0; i < n; i++) {
        const a = r() * Math.PI * 2;
        const d = Math.pow(r(), 0.5) * rad;
        const x = hx + Math.cos(a) * d;
        const z = hz + Math.sin(a) * d;
        if (plantable(x, z)) out.push([x, z]);
      }
    }
    return out;
  };

  /**
   * THE LEAN. Away from the water, always, and it is the only thing in
   * this file that consults the tarn's position for a reason that is
   * not the road.
   */
  const leanAway = (x: number): boolean => x < TARN.x;

  /* ---- THE OLD RING: inside the forty, and nobody has ever cut it -- *
   * The biggest trees in the land, widely spaced, no undergrowth, high
   * canopy. It is the reward for going in and it is the reason you can
   * see the water at all: an old stand is a colonnade.                */
  const oldPts: [number, number][] = [];
  for (let a = 0; a < Math.PI * 2; a += 0.26 + r() * 0.2) {
    for (const d of [23 + r() * 5, 31 + r() * 6]) {
      const x = TARN.x + Math.cos(a) * d;
      const z = TARN.z + Math.sin(a) * d;
      if (plantable(x, z) && r() > 0.28) oldPts.push([x, z]);
    }
  }

  /* ---- THE THICKET: young pine, close, head height ---------------- */
  const thicketPts = clustered(
    [[96, -186], [108, -164], [120, -196], [92, -208], [113, -216], [126, -176],
      [100, -148], [130, -206], [88, -172], [104, -200], [118, -160], [90, -196]],
    [10, 20], 15
  );

  /* ---- THE DEEP PINES: tallest, darkest, off the road entirely ---- */
  const deepPts = clustered(
    [[180, -240], [196, -252], [174, -258], [204, -232], [190, -224], [206, -258],
      [172, -226], [198, -270], [182, -270], [188, -238], [166, -244], [210, -246],
      [176, -206], [200, -206]],
    [8, 15], 14
  );

  /* ---- THE FAILING EDGE: thin, leaning, gappy, giving out --------- */
  const edgePts: [number, number][] = [];
  for (let x = 66; x < 226; x += 5 + r() * 9) {
    // the south edge, running down to the Downs' rough grazing. It is
    // the far silhouette of THE HARROW DOWNS' shot, so it is authored
    // from the south as well as from the north.
    for (let k = 0; k < 3; k++) {
      const z = -106 - r() * 30;
      if (r() < 0.22) continue;
      if (plantable(x + (r() - 0.5) * 8, z)) edgePts.push([x + (r() - 0.5) * 8, z]);
    }
  }
  for (let z = -276; z < -110; z += 6 + r() * 10) {
    if (r() < 0.35) continue;
    const x = 210 + r() * 16;
    if (plantable(x, z)) edgePts.push([x, z]);
  }

  /* ---- the general wood: everything that is not a named stand ----- */
  /* THE GENERAL WOOD, and round 10 did not have enough of it: the east
   * arc of the ring came out as bare ground with a road on it and the
   * arrival from Brim came out as a field with trees at the far end.
   * A wood is somewhere you cannot see across, and the count is what
   * makes that true — the STAND STRUCTURE above is what keeps it from
   * being an array while it is true. */
  const generalPts = clustered(
    [[86, -132], [104, -122], [128, -128], [156, -124], [182, -132], [204, -150],
      [76, -158], [82, -196], [70, -232], [86, -252], [110, -262], [136, -266],
      [166, -196], [188, -172], [204, -196], [178, -152], [148, -262], [120, -240],
      [64, -122], [212, -120],
      // the ring's east and north-east arcs, outside the forty
      [196, -168], [206, -184], [200, -212], [192, -232], [178, -186],
      // the way in from the Wood Gate: the canopy has to CLOSE
      [70, -140], [84, -148], [92, -134], [66, -168], [78, -178], [96, -160],
      // and the north, where round 10 had thirty units of nothing
      [128, -246], [154, -240], [140, -222], [162, -216], [112, -226]],
    [7, 16], 17
  );

  /* ================================================================ *
   * PLANTING, and the three registers are what make it a stand.
   *
   * Every group is split across the three distance registers rather
   * than drawn at one pressure: near trunks, the stand, and the far
   * trees in pencil. A stand built from all three at once reads as a
   * stand; a stand built from one reads as a row.
   * ================================================================ */
  const plant = (
    pts: [number, number][], seedBase: number,
    size: [number, number], regs: [number, number, number], variants = 3
  ) => {
    if (!pts.length) return;
    const total = regs[0] + regs[1] + regs[2];
    let i = 0;
    for (let reg = 0; reg < 3; reg++) {
      const share = Math.round((pts.length * regs[reg]) / total);
      const mine = pts.slice(i, i + share);
      i += share;
      if (!mine.length) continue;
      const per = Math.ceil(mine.length / variants);
      for (let v = 0; v < variants; v++) {
        const sub = mine.slice(v * per, (v + 1) * per);
        if (!sub.length) continue;
        const f = ctx.field(penwoodPineTexture(seedBase + reg * 20 + v, reg as Reg),
          sub.length, {
            w: size[0], h: size[1],
            // a wood does not move at the bottom: this is a sixth of
            // the Common's amplitude, and getting it wrong is what
            // makes a drawn forest look like a screensaver
            wind: { amp: 0.03, freq: 0.42 },
          });
        sub.forEach(([x, z], k) =>
          f.set(k, x, z, (0.78 + r() * 0.5) * (reg === 2 ? 1.15 : 1), 0, leanAway(x)));
      }
    }
  };

  /* REGISTER 0 IS NOT A FIELD TREE. Round 2 gave every stand a share of
   * the near register, and a twenty-one-unit tree drawn at full
   * ballpoint pressure fifteen units from the lens is a hundred
   * individual scratches across a third of the frame. Full pressure in
   * this land belongs to the eight authored near trunks and to nothing
   * else; the stands are the middle register and the far one, which is
   * what the three registers were for. */
  plant(oldPts, 2100, [10.5, 21], [0, 3, 1], 3);
  plant(generalPts, 2200, [7.2, 14.4], [0, 4, 3], 3);
  plant(deepPts, 2300, [9.4, 18.8], [0, 3, 2], 3);
  plant(edgePts, 2400, [5.8, 11.6], [0, 2, 3], 3);

  // the thicket is its own drawing: dense, head-height, no trunk showing
  {
    const per = Math.ceil(thicketPts.length / 4);
    for (let v = 0; v < 4; v++) {
      const sub = thicketPts.slice(v * per, (v + 1) * per);
      if (!sub.length) continue;
      const f = ctx.field(youngPineTexture(2500 + v), sub.length,
        { w: 4.0, h: 7.0, wind: { amp: 0.05, freq: 0.55 } });
      sub.forEach(([x, z], k) => f.set(k, x, z, 0.7 + r() * 0.6, 0, leanAway(x)));
    }
  }

  /* ---- THE FLOOR -------------------------------------------------- *
   * Densest under the old ring, absent in the voids. It is the reason
   * the wood has a bottom to it at all.                               */
  {
    /* Round 2 had a wood with no bottom: the inside of the ring came
     * out as a pale beige bowl with trees standing on it, which is a
     * park. Under an old stand there is no grass and no soil showing —
     * there is a foot of needles, and it is the darkest ground in the
     * game. So the floor is laid over the WHOLE of the old ring rather
     * than sampled round it, and at half again the opacity. */
    const floorPts: [number, number][] = [];
    for (let a = 0; a < Math.PI * 2; a += 0.14) {
      for (const d of [17, 22, 27, 32, 37, 47, 53, 59]) {
        floorPts.push([TARN.x + Math.cos(a) * d + (r() - 0.5) * 5,
          TARN.z + Math.sin(a) * d + (r() - 0.5) * 5]);
      }
    }
    for (const [hx, hz] of [[96, -180], [120, -200], [186, -244], [196, -256],
      [104, -130], [160, -130], [190, -180], [80, -150], [112, -172], [178, -232],
      [206, -212], [86, -218], [136, -250], [166, -262], [92, -246],
      [196, -170], [204, -192], [190, -224], [72, -142], [86, -152], [70, -172],
      [128, -240], [154, -232], [140, -218], [162, -204], [176, -150],
      [118, -134], [148, -126], [180, -128], [66, -196]] as [number, number][]) {
      for (let k = 0; k < 9; k++) {
        floorPts.push([hx + (r() - 0.5) * 30, hz + (r() - 0.5) * 30]);
      }
    }
    const per = Math.ceil(floorPts.length / 4);
    for (let v = 0; v < 4; v++) {
      const sub = floorPts.slice(v * per, (v + 1) * per);
      if (!sub.length) continue;
      const f = ctx.field(needleFloorDecal(2600 + v), sub.length,
        /* ELEVEN UNITS, NOT NINETEEN. A decal is a FLAT quad lying at
         * one height, and the tarn's bowl falls five units over
         * twenty-six: a nineteen-unit floor tile spans two units of
         * ground it is not following, so one side of it buries itself
         * and the intersection draws a hard straight edge across the
         * wood. Round 4's sheet had the foreground faceted with them. */
        { w: 11.5, h: 11.5, decal: true, baseOpacity: 0.9 });
      sub.forEach(([x, z], k) => f.set(k, x, z, 0.85 + r() * 0.5, r() * Math.PI, r() > 0.5));
    }
  }

  /* ---- THE FALLEN ------------------------------------------------- *
   * Horizontals in a vertical land, and the only thing in the wood that
   * reads as an event. Eleven of them are in the north-west void, which
   * is where the wood stops being a wood.                             */
  {
    const downSpots: [number, number, number][] = [
      [88, -238, 0.34], [76, -222, -0.5], [100, -252, 0.52], [70, -204, -0.28],
      [110, -236, 0.14], [92, -262, -0.6], [80, -186, 0.44], [118, -258, -0.18],
      [104, -218, 0.58], [66, -246, -0.4], [124, -224, 0.22], [200, -168, 0.5],
    ];
    /* Rotations stay inside ±0.6: a fallen trunk turned two radians is
     * a flat quad seen edge-on, and the first sheet had four of them
     * hanging in the air as black bars. */
    const f = ctx.field(fallenPineTexture(2700), downSpots.length, { w: 10.5, h: 4.2 });
    const fung = ctx.field(bracketFungusTexture(2710), 6, { w: 2.4, h: 1.6 });
    downSpots.forEach(([x, z, rot], i) => {
      f.set(i, x, z, 0.75 + r() * 0.6, rot, r() > 0.5);
      if (i < 6) fung.set(i, x + (r() - 0.5) * 5, z + 1.4, 0.8 + r() * 0.5, rot, r() > 0.5);
    });
    /* THREE VARIANTS, NOT THREE COPIES. Round 2 re-placed the same
     * seventeen spots twice more at a small offset, which tripled the
     * trunks and put pairs of them in parallel — a fallen tree is an
     * event and seventeen of them is already a lot of events. */
    for (let v = 1; v < 4; v++) {
      const sub = downSpots.filter((_, k) => k % 4 === v);
      if (!sub.length) continue;
      const g = ctx.field(fallenPineTexture(2700 + v), sub.length,
        { w: 9 + v, h: 3.6 + v * 0.35 });
      sub.forEach(([x, z, rot], i) => g.set(i, x, z, 0.75 + r() * 0.5, rot, r() > 0.5));
      // and the same instances are hidden in the base field
      downSpots.forEach(([x, z], i) => { if (i % 4 === v) f.hide(i, x, z); });
    }
  }

  /* ---- THE STUMPS, and they are never inside the forty ------------ */
  {
    const stumps = [0, 1, 2].map((v) => stumpTexture(2800 + v));
    const spots: [number, number][] = ([[92, -160], [104, -144], [86, -172],
      [198, -140], [210, -166], [78, -134], [206, -212], [120, -120]] as [number, number][])
      .filter(([x, z]) => tarnD(x, z) >= FORTY + 4);
    stumps.forEach((tex, v) => {
      const list = spots.filter((_, k) => k % 3 === v);
      const f = ctx.field(tex, list.length, { w: 3.0, h: 1.9 });
      list.forEach(([x, z], i) => f.set(i, x, z, 1, (r() - 0.5) * 1.2, r() > 0.5));
    });
  }

  /* ---- THE FAILING EDGE'S OTHER TREE ------------------------------ */
  {
    const birches = [0, 1, 2].map((v) => birchTexture(2820 + v));
    const spots: [number, number, number][] = [[74, -118, 1], [92, -112, 0.85],
      [118, -116, 1.1], [206, -124, 0.9], [220, -160, 0.8], [216, -206, 1.05],
      [64, -142, 0.95]];
    birches.forEach((tex, v) => {
      const list = spots.filter((_, k) => k % 3 === v);
      const f = ctx.field(tex, list.length, { w: 5.4, h: 9.7 });
      list.forEach(([x, z, sc], i) => f.set(i, x, z, sc, 0, r() > 0.5));
    });
  }

  /* ================================================================ *
   * THE TARN — and its blackness is a DRAWING, not a shader change.
   *
   * The world's water is one blue and it is right for the sea, the
   * river and the moat and completely wrong for this. The note has
   * said so since Session 1 — *still water, black as the good ink* —
   * and nothing in the game had ever agreed with it. Nine decals lying
   * on the surface do: pooled ink, the far trees' reflection going
   * down, and one flat highlight that never moves, because nothing on
   * this water moves.
   * ================================================================ */
  /* Four passes of body and six of shore, over FIVE drawings — a
   * 512-square canvas is a megabyte and round 13 made nine of them for
   * one pond. */
  const SKIN = [0, 1, 2].map((v) => tarnSkinDecal(2900 + v));
  const SHORE = [0, 1].map((v) => tarnSkinDecal(2910 + v, true));
  ctx.decal(SKIN[0], 30, 30, TARN.x, TARN.z, 0.2, 0.95);
  ctx.decal(SKIN[1], 27, 27, TARN.x, TARN.z, 1.7, 0.9);
  ctx.decal(SKIN[2], 23, 23, TARN.x - 5, TARN.z + 4, 1.1, 0.9);
  ctx.decal(SKIN[0], 22, 22, TARN.x + 6, TARN.z - 5, 2.3, 0.9);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.4;
    ctx.decal(SHORE[i % 2], 15, 15,
      TARN.x + Math.cos(a) * 9.5, TARN.z + Math.sin(a) * 9.5, a, 0.7);
  }
  // the boat, drawn up on the near shore where the walker arrives
  ctx.standee(tarnBoatTexture(2920), 7.0, 3.5, 143, -184, { rotY: 0.42 });

  /* ================================================================ *
   * BRACK'S ROUND, dressed.
   *
   * The wear is ASYMMETRIC (THE-STRANGERS U18): the drawing is laid
   * with its heavy edge INWARD, because a man walking a circle for
   * forty years walks the side he is watching. Nothing explains it.
   * ================================================================ */
  {
    const wear = [0, 1, 2].map((v) => wornRoundDecal(3000 + v));
    const per = [[], [], []] as [number, number, number][][];
    for (let i = 0; i < 26; i++) {
      const a = (i / 26) * Math.PI * 2 + 0.06;
      const [x, z] = ringPt(a);
      // the decal's own north is its heavy edge; turn it to face the water
      per[i % 3].push([x, z, Math.atan2(TARN.x - x, TARN.z - z)]);
    }
    per.forEach((list, v) => {
      const f = ctx.field(wear[v], list.length,
        { w: 8.5, h: 5.6, decal: true, baseOpacity: 0.5 });
      list.forEach(([x, z, a], i) => f.set(i, x, z, 1, a, false));
    });
  }
  // the track in from the Wood Gate takes the same wear, symmetrically
  {
    const litter = [0, 1, 2].map((v) => leafLitterDecal(3020 + v));
    const spots: [number, number][] = [[64, -114], [78, -122], [92, -129],
      [106, -137], [118, -145], [126, -153]];
    litter.forEach((tex, v) => {
      const list = spots.filter((_, k) => k % 3 === v);
      const f = ctx.field(tex, list.length, { w: 9, h: 6, decal: true, baseOpacity: 0.5 });
      list.forEach(([x, z], i) => f.set(i, x, z, 1, 0.4 + r(), r() > 0.5));
    });
  }

  /* ---- THE NEAR TRUNKS -------------------------------------------- *
   * The foreground layer, and the whole of this land's depth budget.
   * Eight in the land, placed by hand so every framing has exactly one
   * inside eight units and no framing has two.                        */
  const nearTrunks: [number, number][] = [
    [134, -154],          // THE ROUND, frame left — THE SHOT's foreground
    [166, -150],          // and its counterweight, further off
    [155, -172],          // the walk down to the water
    [118, -190],          // the ring's west arc
    [176, -218],          // the ring's north-east
    [86, -140],           // the wood road, where the canopy shuts
    [196, -244],          // the deep pines
    [108, -160],          // the way to the oars
  ];
  /* FOUR DRAWINGS FOR EIGHT TRUNKS, and they stay one-off stand-ups
   * rather than a field: these are the only things in this land that
   * feed the SKYLINE, and a name written under one of them has to
   * clear it. */
  const CROP = [0, 1, 2, 3].map((v) => pineCropTexture(3100 + v));
  nearTrunks.forEach(([x, z], i) => ctx.standee(CROP[i % 4], 6.4, 11.4, x, z));

  /* ================================================================ *
   * THE OARS — HALLOWS, and eleven of them, and the game will never
   * say eleven (THE-STRANGERS S1 beat 1).
   * ================================================================ */
  ctx.standee(CROP[1], 6.4, 11.4, 96, -160);
  ctx.standee(oarLeanTexture(3200), 5.6, 6.4, 99, -158.5, { rotY: 0.18 });
  ctx.standee(choppingBlockTexture(3201), 3.2, 2.8, 105, -153, { rotY: -0.3 });
  const hallows = ctx.standee(hallowsTexture(3202), 2.2, 3.4, 108, -151.5);
  ctx.standee(stumpTexture(3203), 3.2, 2.0, 112, -157);
  ctx.standee(fallenPineTexture(3205), 9, 3.6, 104, -146, { rotY: 0.3 });
  ctx.decal(needleFloorDecal(3204), 12, 12, 103, -154, 0.3, 0.7);
  ctx.decal(needleFloorDecal(3206), 12, 12, 108, -149, 1.1, 0.6);

  /* ================================================================ *
   * BRACK.
   *
   * He paces about thirty units of the ring's south arc and comes back,
   * one lap in ninety seconds, FACING THE TARN THE WHOLE WAY. He never
   * has his back to it and he is never inside forty units of it, and
   * both of those are geometry rather than notes: the road is at
   * forty-two, and the drawing he is up in is a BACK.
   *
   * Which drawing is up depends on `fact:the-tarn`, asked in the
   * present tense every frame, exactly the way Brim asks about its
   * market. The difference between them is nine strokes and it is the
   * largest thing that has happened in the Penwood in forty years.
   * ================================================================ */
  const brackWatch = ctx.standee(brackTexture(3300, false), 1.62, 2.78, ...ringPt(Math.PI / 2));
  const brackTurn = ctx.standee(brackTexture(3301, true), 1.62, 2.78, ...ringPt(Math.PI / 2));
  for (const m of [brackWatch, brackTurn]) {
    (m.material as THREE.MeshBasicMaterial).transparent = true;
  }
  brackTurn.visible = false;

  /* ---- THE GOAT (THE-STRANGERS E12 says it gets out; it is already
   *      canon, so it is already here) ------------------------------ */
  const goatPoses = [0, 1, 2, 3].map((p) =>
    ctx.field(goatTexture(3400 + p, p as 0 | 1 | 2 | 3), 1, { w: 2.4, h: 1.8 }));
  const goat = { x: 124, z: -212, hx: 124, hz: -212, pose: 0, hold: 0 };

  /* ---- THE UNNAMED, AND THE HERON (Session 17) --------------------- */
  const cutters = CUTTERS.map((d, i) => new Figure(ctx, d, i ? 0 : 2));
  const picker = new Figure(ctx, PICKER, 1);
  const roundWalker = new Figure(ctx, ROUND_WALKER, 0);
  const woodChild = new Creature(ctx, 'the-wood-road-child', 'forest', [childTexture(3500, 0), childTexture(3501, 1)], 0.8, 1.2, 66, -116);
  /* THE HERON AT THE TARN — the wood's creature (§3 item 1). It stands
   * at the water's edge from first light to dusk, on one leg, the only
   * thing in the land that goes down to the water; and it goes up when
   * you come inside fourteen units, croaks twice, and is gone into the
   * deep pines, and comes back when you have gone. Nothing else about
   * the tarn has ever moved. */
  const HERON = { x: 137, z: -185.5 };
  const heron = new Creature(ctx, 'the-heron', 'forest', [heronTexture(3510, 0), heronTexture(3511, 1)], 2.6, 2.6, HERON.x, HERON.z);
  const heronState = { up: 0, away: 0 };
  const deepBats = [0, 1, 2].map((i) => new Creature(ctx, `the-deep-pines-bats-${i}`, 'forest', [batTexture(3520 + i)], 0.9, 0.55, 188, -246));

  return (dt: number, t: number, px: number, pz: number) => {
    /* BRACK'S PACE. Thirty units of arc, out and back, on a triangle
     * wave — a man on a beat does not ease in and out of the ends, he
     * gets there and turns round. */
    const lap = 90;
    const u = (t % lap) / lap;
    const swing = u < 0.5 ? u * 2 : 2 - u * 2;
    const a = Math.PI / 2 + (swing - 0.5) * 0.46;
    const [bx, bz] = ringPt(a);
    const turned = knowledge.has('fact:the-tarn');
    for (const m of [brackWatch, brackTurn]) {
      m.position.set(bx, ctx.groundY(bx, bz), bz);
      /* he faces the water, always, and after the tarn he does not.
       * The quarter turn is in the DRAWING, not in the rotation: a
       * standee turned ninety degrees off the lens is a line. */
      m.rotation.y = turned ? 0.42 : Math.atan2(TARN.x - bx, TARN.z - bz);
    }
    /* Nobody is in two places at once: while the 8:15's doors are open
     * at the Penwood's stop, the man who has walked round this water
     * for forty years is standing on it (Session 14, `Eight15.ts`). */
    const gone = platform.land === 'forest';
    brackWatch.visible = !turned && !gone;
    brackTurn.visible = turned && !gone;

    /* THE FACT IS EARNED BY ARRIVING. Inside twenty units of the water
     * is inside Brack's forty, which is the one line in this world
     * nobody but the walker crosses. Nothing asks and nothing
     * confirms. */
    if (!turned && tarnD(px, pz) < 20) {
      if (knowledge.learn('fact:the-tarn')) say('tarn-drip');
    }

    /* HALLOWS works, and never looks up. */
    hallows.rotation.y = 0.2 + Math.sin(t * 1.9) * 0.06;

    /* THE GOAT keeps its distance and looks back, and is never
     * catchable. */
    const d = Math.hypot(goat.hx - px, goat.hz - pz);
    goat.hold -= dt;
    if (d < 16 && goat.hold <= 0) {
      const away = Math.atan2(goat.hz - pz, goat.hx - px);
      /* IT MOVES OFF, AND IT STAYS IN THE WOOD. Twenty units per
       * approach with nothing bounding it means a determined player can
       * herd it across a border, and nothing in this world crosses a
       * border but the walker. It keeps to the Penwood with a margin,
       * and it will not walk into the water. */
      let nx = goat.hx + Math.cos(away) * 20;
      let nz = goat.hz + Math.sin(away) * 20;
      nx = Math.max(rect.minX + 12, Math.min(rect.maxX - 12, nx));
      nz = Math.max(rect.minZ + 12, Math.min(rect.maxZ - 12, nz));
      if (tarnD(nx, nz) < 17) {
        const out = Math.atan2(nz - TARN.z, nx - TARN.x);
        nx = TARN.x + Math.cos(out) * 17;
        nz = TARN.z + Math.sin(out) * 17;
      }
      goat.x = nx;
      goat.z = nz;
      goat.hold = 5.5;
      goat.pose = 1;
    }
    const nd = Math.hypot(goat.x - goat.hx, goat.z - goat.hz);
    if (nd > 0.2) {
      const k = Math.min(1, (dt * 7) / nd);
      goat.hx += (goat.x - goat.hx) * k;
      goat.hz += (goat.z - goat.hz) * k;
      goat.pose = 1;
    } else {
      goat.pose = goat.hold > 3.2 ? 2 : d < 44 ? 3 : 0;
    }
    const facing = goat.x < goat.hx + 0.01 && goat.pose === 1;
    for (let p = 0; p < 4; p++) {
      if (p === goat.pose) goatPoses[p].set(0, goat.hx, goat.hz, 0.9, 0, facing);
      else goatPoses[p].hide(0, goat.hx, goat.hz);
    }

    /* ---- THE UNNAMED, THE HERON, THE BATS (Session 17) --------------- */
    const h = clock.hour;
    const rain = weather.state.rain > 0.5;
    for (const c of cutters) c.tick(h);
    picker.tick(h, rain);
    roundWalker.tick(h, rain);
    {
      const on = events.progress('the-wood-road-child');
      if (on < 0 || rain) woodChild.hide();
      else {
        const e = on < 0.5 ? on * 2 : 2 - on * 2;
        const x = 62 + (101 - 62) * e;
        const z = -114 + (-134 + 114) * e;
        woodChild.set(Math.floor(h * 100 / 0.26) % 2, x, z, on < 0.5 ? 1 : -1);
      }
    }
    {
      const day = h > 5.4 && h < 20.2;
      heronState.away = Math.max(0, heronState.away - dt);
      const near = Math.hypot(px - HERON.x, pz - HERON.z) < 14;
      if (!day) heron.hide();
      else if (heronState.up > 0) {
        heronState.up += dt;
        const u = Math.min(1, heronState.up / 6);
        heron.set(1, HERON.x + (172 - HERON.x) * u, HERON.z + (-232 - HERON.z) * u, 1, Math.sin(u * Math.PI) * 9 + u * 6, 1 - Math.max(0, (u - 0.7) / 0.3));
        if (u >= 1) { heronState.up = 0; heronState.away = 60; }
      } else if (heronState.away > 0) {
        if (near) heronState.away = 60;
        heron.hide();
      } else if (near) {
        heronState.up = 0.01;
        say('heron-croak');
        heron.set(1, HERON.x, HERON.z, 1, 0.4);
      } else heron.set(0, HERON.x, HERON.z, px < HERON.x ? -1 : 1, 0);
    }
    {
      const on = events.progress('the-deep-pines-bats');
      deepBats.forEach((b, i) => {
        if (on < 0) { b.hide(); return; }
        const a = t * (1.5 + i * 0.3) + i * 2.2;
        b.set(0, 188 + Math.cos(a) * (5 + i * 2), -246 + Math.sin(a * 1.6) * 4, Math.cos(a) > 0 ? 1 : -1, 5 + Math.sin(a * 2.4) * 1.2);
      });
    }
  };
};

export const FOREST_POIS: WorldPOI[] = [
  {
    x: 78, z: -124, radius: 10, label: 'THE WOOD ROAD',
    note: {
      title: 'the wood road',
      body: 'the sky goes out over about twelve paces. the road keeps going, and the ground under it stops being grass and starts being needles, and everything gets about four degrees colder and a great deal more polite.',
    },
  },
  {
    x: 100, z: -158, radius: 9, label: 'THE OARS',
    prompt: 'COUNT THEM',
    note: {
      title: 'the oars',
      body: 'a woodcutter here makes oars. he has been making them for years and not one of them is right, which he knows, because none of them has ever come back. he has never seen an oar. there is one on the tarn, forty paces off, and he will not go and look at it.',
    },
  },
  {
    x: 150, z: -149, radius: 12, label: 'THE ROUND',
    note: {
      title: 'the round',
      body: 'the track through the wood is a circle. it comes in from brim, it goes round, and it comes back out the way it came. everybody uses it. nobody has ever mentioned it.',
    },
  },
  {
    x: 150, z: -195, radius: 13, label: 'THE TARN',
    prompt: 'TRY THE ROWBOAT',
    note: {
      title: 'the tarn',
      body: 'still water, black as the good ink. the rowboat has one oar, and the oar is newer than the boat. nobody comes down to the water and nobody will say why. there is a path around it, and everybody uses it.',
    },
  },
  {
    x: 188, z: -246, radius: 12, label: 'THE DEEP PINES',
    prompt: 'LOOK UP',
    note: {
      title: 'the deep pines',
      body: 'ninety paces of vertical, and nothing at all growing under it. the light that gets down here has been through the tops twice and comes out green. you can hear the wood working somewhere a long way off and you cannot tell which way.',
    },
  },
];

/* ================================================================== *
 * SPLITROCK CANYON — a hole in the page, and one man at the top of it.
 *
 * Session 11, to design/specs/splitrock-canyon.md.
 *
 * THE DRAFT THIS REPLACES was six mesa cutouts stood along the north
 * edge of the rect, four more along the east, forty-six boulders and
 * fourteen cacti on a Poisson scatter, and an arch in the middle of a
 * field. All of it is cut, and so is the ground it stood on: Session 4's
 * tear was authored at x = 338, six units from the foot of the world's
 * curled east margin, and the trail that is the only way into this land
 * ran at x = 255..305 and never came near it. **The land called
 * SPLITROCK had its split off in the corner.** `elevation.ts` moved it
 * to x = 300 and this file is built in it rather than beside it.
 *
 * ── THE RULE THAT REPLACES THE SCATTER ──────────────────────────────
 *
 *   **NOTHING IN THIS LAND IS PLACED IN THE OPEN. IT IS PLACED
 *   AGAINST A WALL, ON A LIP, OR ON THE FLOOR OF THE CHANNEL.**
 *
 * A canyon is not props in a desert. It is one corridor a hundred and
 * twelve units long with two walls, and every drawing here knows which
 * of the three registers it belongs to: the WALL RUN (turned toward the
 * channel, receding, the theatre wings), the SKYLINE (stacks standing on
 * the lips, silhouette only, and the only thing in this land against the
 * sky), and the FLOOR (blocks, scree, grit and one boat).
 * ================================================================== */

/** The channel's centreline. `elevation.ts` is the authority on where
 *  the page tore; this file never invents a second opinion about it. */
const axisAt = (z: number) => tearX(z);

/** THE CHANNEL HEAD — where the tear closes and the walk stops. */
const HEAD = { x: 305, z: -252 };
/** THE BOAT, on its trestles, on the floor, at the top of the dry
 *  channel (THE-WAITS §4). */
const BOAT = { x: 306, z: -234 };
/** HOLT'S, on the rim above the head wall — which is where the fifth
 *  mark says it is. */
const HOUSE = { x: 302, z: -272 };

/* ================================================================== *
 * SPLITROCK'S UNNAMED (Session 17): three, and no more, because the
 * land's thesis is that nobody comes here. Two HIKERS down the mouth to
 * the arch and back in the afternoon. Somebody at THE OVERLOOK in the
 * morning, who sits. And a figure on THE FAR RIM at four — the other
 * rim, forty units away and about an hour — walking along it, whom you
 * cannot reach and who cannot reach you.
 * ================================================================== */
const HIKERS = [0, 1].map((i) => ({ id: `the-hikers-${i}`, land: 'canyon' as const, pace: 330, stops: stops([
  [13.45 + i * 0.02, 291 + i * 1.6, -132, 0, 1], [13.7 + i * 0.02, 296 + i * 1.5, -160, 0, 1], [13.98 + i * 0.02, 300 + i * 1.8, -178, 0, i ? -1 : 1, 0.25],
  [14.35 + i * 0.02, 296 + i * 1.5, -160, 0, -1], [14.7 + i * 0.02, 291 + i * 1.6, -132, 0, -1, 0.02],
]) }));
const OVERLOOKER = { id: 'the-overlook', land: 'canyon' as const, pace: 260, stops: stops([
  [9.3, 262, -150, 0, 1], [9.42, 272, -176, 3, 1, 0.55], [10.0, 273, -179, 0, 1, 0.2], [10.35, 262, -150, 0, -1, 0.02],
]) };
const FAR_RIM = { id: 'the-far-rim', land: 'canyon' as const, pace: 240, stops: stops([
  [16.0, 336, -222, 0, 1], [16.15, 331, -206, 0, 1, 0.1], [16.35, 340, -170, 0, 1, 0.05], [16.55, 336, -222, 0, -1, 0.02],
]) };
events.register({ id: 'the-slot-bats', land: 'canyon', at: 19.4, hours: 2.0, place: { x: 300, z: -200 } });

export const buildCanyon: RegionBuilder = (ctx) => {
  const { r } = ctx;

  /* ---- THE SHARED DRAWINGS ---------------------------------------- *
   * Three wall panels, three stacks, three blocks, three bed states and
   * one scree, made ONCE. Session 10's round 4 costed the alternative:
   * a fresh canvas per placement is thirty-two megabytes of texture for
   * the hedges of one land. Variety in SPLITROCK comes from the PLAN —
   * where a wall is, which lip a stack stands on, how the channel bends
   * — and never from another drawing.                                 */
  const PANEL = [0, 1, 2].map((v) => wallPanelTexture(6000 + v, v as 0 | 1 | 2));
  const STACK = [0, 1, 2].map((v) => stackTexture(6010 + v, v as 0 | 1 | 2));
  const BLOCK = [0, 1, 2].map((v) => blockTexture(6020 + v, v as 0 | 1 | 2));
  const BED = [0, 1, 2].map((v) => dryBedDecal(6030 + v, v as 0 | 1 | 2));

  /* ================================================================ *
   * THE WALL'S TOE — and round 1 of the gate was a curtain.
   *
   * The first version stood twenty-one-unit panels every thirteen units
   * up BOTH walls at half their height, turned toward the channel, on
   * the theory that a corridor is built out of theatre wings. What it
   * built was a tunnel with the ends bricked up: the panels stand on a
   * face whose gradient is two, so their feet are five units up the
   * wall and their heads twelve units over the lip, and eighteen units
   * of channel cannot hold two of them and a walker. THE SHOT came back
   * as a brown wall. It also broke the oldest placement rule in this
   * engine — *nothing stands on a scarp; a paper cutout on a cliff face
   * reads as a bug every time.*
   *
   * **The terrain already draws these walls.** It hatches a cliff down
   * its own fall line and it does it better than a cutout can. What the
   * floor of a slot actually needs from the prop box is the near layer
   * the ground cannot give it: slabs that have come OFF the wall and
   * are leaning against its foot, standing on the FLOOR, no taller than
   * the wall behind them, and far enough apart that you can see between
   * them. Nine of them in a hundred and twelve units.
   * ================================================================ */
  {
    const leans: [number, number, number, number][] = [];
    for (let z = -150; z >= -244; z -= 12) {
      if (r() < 0.32) continue;
      const side = r() > 0.5 ? 1 : -1;
      leans.push([axisAt(z) + side * 8.2, z + (r() - 0.5) * 4, 6.5 + r() * 4, side]);
    }
    for (let v = 0; v < 3; v++) {
      const sub = leans.filter((_, i) => i % 3 === v);
      if (!sub.length) continue;
      const f = ctx.field(PANEL[v], sub.length, { w: 13, h: 10 });
      sub.forEach(([x, z, h, side], i) => f.set(i, x, z, h / 10, side * 1.05, side < 0));
    }
  }

  /* ================================================================ *
   * THE SKYLINE — stacks standing on the two lips.
   *
   * The only things in SPLITROCK that meet the sky, and they are the
   * far silhouette in every framing on the floor. They stand OUTSIDE
   * the lip, never on the wall itself.
   *
   * Round 1 put fifty of them at up to twenty-two units tall and the
   * land came back as a field of brown lumps with no sky in it. There
   * are seventeen now, none taller than thirteen units, none within
   * twenty-six units of another, and the gaps between them are most of
   * what makes a skyline a skyline.
   *
   * They also carry this land's one composition problem, which Session
   * 10 wrote down: **the skyline lifts a name above what is standing
   * UNDER it and cannot know what is standing BEHIND it**, and this is
   * a land of tall thin things. Every POI in this file is sited so its
   * label is clear of a stack by ANGLE and not by height.
   * ================================================================ */
  {
    const tops: [number, number, number, number][] = [];
    for (let z = -140; z >= -258; z -= 15) {
      for (const side of [-1, 1] as const) {
        if (r() < 0.42) continue;                    // and the gaps are authored
        const off = 26 + r() * 20;
        const x = axisAt(z) + side * off;
        if (x < 240 || x > 366) continue;
        tops.push([x, z + (r() - 0.5) * 7, 7 + r() * 6, side]);
      }
    }
    for (let v = 0; v < 3; v++) {
      const sub = tops.filter((_, i) => i % 3 === v);
      if (!sub.length) continue;
      const f = ctx.field(STACK[v], sub.length, { w: 9, h: 13 });
      sub.forEach(([x, z, h, side], i) => f.set(i, x, z, h / 13, 0, side < 0));
    }
  }

  /* ================================================================ *
   * THE FLOOR — the dry bed, and what has come off the walls onto it.
   * ================================================================ */
  {
    const bed: [number, number][] = [];
    for (let z = -134; z >= -250; z -= 9) {
      const a = axisAt(z);
      bed.push([a + (r() - 0.5) * 8, z]);
    }
    for (let v = 0; v < 3; v++) {
      const sub = bed.filter((_, i) => i % 3 === v);
      const f = ctx.field(BED[v], sub.length,
        { w: 11, h: 11, decal: true, baseOpacity: 0.52 });
      sub.forEach(([x, z], i) => f.set(i, x, z, 1, 0, r() > 0.5));
    }

    /* THE BLOCKS. They lie where they landed, which is against the foot
     * of the wall they came off — never in the middle of the floor,
     * because the middle of the floor is where the water ran. */
    const blocks: [number, number, number][] = [];
    for (let z = -144; z >= -250; z -= 7) {
      if (r() < 0.3) continue;
      const side = r() > 0.5 ? 1 : -1;
      blocks.push([axisAt(z) + side * (5.5 + r() * 3.6), z + (r() - 0.5) * 4, 2.4 + r() * 2.6]);
    }
    for (let v = 0; v < 3; v++) {
      const sub = blocks.filter((_, i) => i % 3 === v);
      if (!sub.length) continue;
      const f = ctx.field(BLOCK[v], sub.length, { w: 5.4, h: 3.6 });
      sub.forEach(([x, z, h], i) => f.set(i, x, z, h / 3.6, 0, r() > 0.5));
    }

    /* THE SCREE at the toes, and THE SHADOW in the bottom of the cut —
     * the darkest thing in this land, laid against the west wall
     * because the light in this world comes from the west. */
    const scree: [number, number, number][] = [];
    for (let z = -146; z >= -250; z -= 8) {
      for (const side of [-1, 1] as const) {
        if (r() < 0.28) continue;
        scree.push([axisAt(z) + side * 8.4, z + (r() - 0.5) * 3, side]);
      }
    }
    const sf = ctx.field(screeTexture(6040), scree.length, { w: 9, h: 3.4 });
    scree.forEach(([x, z, side], i) => sf.set(i, x, z, 0.75 + r() * 0.6, side * 0.9, side < 0));

    const shade: [number, number][] = [];
    for (let z = -150; z >= -248; z -= 11) shade.push([axisAt(z) - 7.6, z]);
    const shf = ctx.field(slotShadowTexture(6041), shade.length,
      { w: 12, h: 4.6, baseOpacity: 0.42 });
    shade.forEach(([x, z], i) => shf.set(i, x, z, 1, 1.05, false));

    /* THE GRIT, and it MOVES. One gust running north up the channel,
     * which is the only wind that can get in here. */
    const grit: [number, number][] = [];
    for (let z = -138; z >= -250; z -= 6) grit.push([axisAt(z) + (r() - 0.5) * 12, z]);
    const gf = ctx.field(gritTexture(6042), grit.length, {
      w: 6.4, h: 1.9,
      wind: { amp: 0.05, freq: 1.4 },
      wave: { amp: 0.42, speed: 0.5, len: 0.05 },
    });
    grit.forEach(([x, z], i) => gf.set(i, x, z, 0.7 + r() * 0.7, 0, r() > 0.5));

    /* AND THE ONE LIVING THING, WHICH IS NOT. Dead scrub, wedged where
     * the water left it — always on the inside of a bend, because that
     * is where a river drops what it is carrying. */
    const scrub: [number, number][] = [];
    for (let z = -142; z >= -246; z -= 17) scrub.push([axisAt(z) + (r() - 0.5) * 11, z]);
    const scf = ctx.field(deadScrubTexture(6043), scrub.length, { w: 3.4, h: 3.0 });
    scrub.forEach(([x, z], i) => scf.set(i, x, z, 0.7 + r() * 0.5, 0, r() > 0.5));
  }

  /* ================================================================ *
   * THE MOUTH — where the trail goes under the level of the land.
   * ================================================================ */
  ctx.standee(mouthPostTexture(6100), 3.4, 4.6, axisAt(-131) - 8.5, -131, { rotY: 0.2 });
  ctx.standee(bootsTexture(6101), 1.9, 1.2, 297.5, -119.5, { rotY: -0.14 });
  ctx.decal(dryBedDecal(6102, 1), 12, 12, 299, -122, 0.3, 0.4);

  /* ================================================================ *
   * THE NEEDLE ARCH — the land's midpoint, and the one curve in it.
   *
   * It spans the channel, so from anywhere south of it you are walking
   * toward a hole with the head of the canyon framed inside it, and
   * from the north side you have walked under something. It is the only
   * thing in SPLITROCK you pass THROUGH.
   * ================================================================ */
  ctx.standee(needleArchTexture(6110), 25, 19, axisAt(-181), -181, { rotY: 0.06 });

  /* ================================================================ *
   * THE HEAD OF THE CHANNEL — HOLT (THE-WAITS §4).
   *
   * The whole of this land's wait is a SIGHTLINE and it is built rather
   * than written. Standing on the floor and looking north you see, in
   * this order and at these heights:
   *
   *   the boat, upside down on its trestles, oiled          1.2 up
   *   the trestles under it                                 2.3 up
   *   the shed's ridge, forty units down the channel        4.8 up
   *   the fourth chalk mark — WHICH IS THE HEIGHT OF THE   13.0 up
   *     LIP, and the lip is right there beside it
   *   the fifth mark, chalked on the rock ABOVE the wall,  ~16   up
   *     where no flood could ever have put it (U20)
   *   and behind that, on the rim, HOLT'S HOUSE.
   *
   * **They are a list, in the order things would float**, and the game
   * never says so. There is no note on the marks, no label, no number
   * and no scale. What there is, is four heights on a wall that line up
   * with four things you can see from where you are standing, and a
   * fifth that lines up with a roof.
   * ================================================================ */
  ctx.standee(markSlabTexture(6200), 20, 15, HEAD.x, HEAD.z - 2, { rotY: -0.04 });
  ctx.standee(rimMarkTexture(6201), 4.6, 2.8, 305.5, -267.5, { rotY: 0.08 });
  ctx.standee(holtShedTexture(6202), 5.6, 4.9, 301.5, -244, { rotY: 0.12 });
  ctx.decal(dryBedDecal(6203, 2), 12, 12, 303, -241, 0.2, 0.5);

  /* THE BOAT, in its two states, and the change is permanent.
   *
   * You have rowed the river salt to source, under all three bridges,
   * which nothing else in this world has done. Come up the channel
   * holding `route:the-river` and the boat is off the trestles and
   * right way up on the dry floor, bow north, and it stays there in
   * every later save. **The game never says whether that is madness or
   * readiness**, so nothing here does either. */
  const boatUp = ctx.standee(boatOnTrestlesTexture(6210), 12.6, 6.6, BOAT.x, BOAT.z);
  const trestles = ctx.standee(trestlesTexture(6211), 12.6, 6.6, BOAT.x, BOAT.z);
  const boatDown = ctx.standee(boatRightedTexture(6212), 12.4, 6.5, BOAT.x - 1.5, BOAT.z + 5.5);
  for (const m of [boatUp, trestles, boatDown]) {
    (m.material as THREE.MeshBasicMaterial).transparent = true;
  }

  /* ---- HOLT, and he has three postures and no face ---------------- */
  const holt = [0, 1, 2].map((p) =>
    ctx.standee(holtTexture(6220 + p, p as 0 | 1 | 2), 1.55, 2.65, BOAT.x - 5.5, BOAT.z + 1.5));
  for (const m of holt) (m.material as THREE.MeshBasicMaterial).transparent = true;

  /* ---- THE HOUSE, on the rim, and it is lit at night -------------- */
  const houseDark = ctx.standee(holtHouseTexture(6230, false), 6.6, 6.0, HOUSE.x, HOUSE.z);
  const houseLit = ctx.standee(holtHouseTexture(6231, true), 6.6, 6.0, HOUSE.x, HOUSE.z);
  for (const m of [houseDark, houseLit]) {
    (m.material as THREE.MeshBasicMaterial).transparent = true;
  }
  /* AND THE WINDOW'S GLOW (Session 17, a debt since Session 11: *Holt's
   * lit window is one warm pixel at forty units*). The same spill Brim
   * hangs at a lantern, hung at his window, so the only lit thing in
   * the east half of the world is a thing you can steer by. */
  const houseGlow = ctx.standee(lampGlowTexture(6233), 5.2, 5.2, HOUSE.x + 0.6, HOUSE.z + 0.3);
  ctx.hang(houseGlow, 1.4);
  (houseGlow.material as THREE.MeshBasicMaterial).transparent = true;
  (houseGlow.material as THREE.MeshBasicMaterial).depthWrite = false;
  houseGlow.renderOrder = 3;

  /* ---- THE UNNAMED, THE LIZARD, THE BATS (Session 17) --------------- */
  const hikers = HIKERS.map((d, i) => new Figure(ctx, d, i ? 1 : 2));
  const overlooker = new Figure(ctx, OVERLOOKER, 0);
  const farRim = new Figure(ctx, FAR_RIM, 2);
  const LIZARD = { x: 306.5, z: -170 };
  const lizard = new Creature(ctx, 'the-slot-lizard', 'canyon', [lizardTexture(6260)], 0.9, 0.45, LIZARD.x, LIZARD.z);
  const lizardState = { gone: 0 };
  const slotBats = [0, 1].map((i) => new Creature(ctx, `the-slot-bats-${i}`, 'canyon', [batTexture(6270 + i)], 0.9, 0.55, 300, -200));
  ctx.standee(cairnTexture(6232), 2.4, 3.6, 292, -268, { rotY: 0.2 });

  /* ================================================================ *
   * THE TWO RIMS.
   *
   * The west one is where the walker looks down; the east one is the
   * far side, and the only way onto it is all the way back to the
   * mouth and round, which is a fact this land teaches by geometry and
   * never mentions. Both are composed voids with one thing on them.
   * ================================================================ */
  ctx.standee(cairnTexture(6240), 2.6, 3.9, 331, -206, { rotY: -0.3 });
  ctx.standee(blockTexture(6241, 0), 6.4, 4.2, 271, -188, { rotY: 0.34 });
  ctx.standee(fallDustTexture(6242), 9, 6, axisAt(-198) - 6.5, -198, { rotY: 0.7 });

  /* ---- THE ONE BIRD, and it turns ---------------------------------- */
  const birds = [0, 1].map((p) =>
    ctx.standee(turningBirdTexture(6250 + p, p as 0 | 1), 3.2, 1.6, 300, -200));
  for (const m of birds) (m.material as THREE.MeshBasicMaterial).transparent = true;
  const birdY = ctx.groundY(300, -200);

  /* ---- and the far country, so the corridor has an outside --------- *
   * Six big stacks well back from both lips. They are the haze layer:
   * nothing in this land is ever framed without one of them behind it,
   * and none of them is anywhere a walker would go.                    */
  for (const [x, z, w, h, v] of [
    [244, -228, 14, 9, 1], [250, -264, 16, 10, 0], [344, -248, 15, 9, 2],
    [358, -188, 13, 8, 1], [244, -154, 12, 7, 2], [354, -130, 11, 7, 0],
  ] as [number, number, number, number, 0 | 1 | 2][]) {
    ctx.standee(STACK[v], w, h, x, z, { rotY: (r() - 0.5) * 0.4, opacity: 0.94 });
  }

  return (_dt: number, t: number, px: number, pz: number) => {
    const h = clock.hour;

    /* THE BOAT COMES OFF THE TRESTLES. */
    const rowed = knowledge.has('route:the-river');
    boatUp.visible = !rowed;
    trestles.visible = rowed;
    boatDown.visible = rowed;

    /* HOLT'S DAY, and it is a short one.
     *
     * He is at the boat from six to eight, oiling, with a stretch in
     * the middle of the day at the foot of the wall with his head back.
     * At night he is not here and there is a light on up on the rim,
     * which is the only lit window in the east half of the world.
     *
     * AND HE STRAIGHTENS WHEN YOU COME. Fifteen units, once, every
     * time — the land's one player-responsive motion, and it is a man
     * stopping work because somebody is walking up his channel, which
     * out here has not happened in a while. */
    const day = h > 5.8 && h < 20.4;
    const near = Math.hypot(px - BOAT.x, pz - BOAT.z) < 15;
    const reading = h > 12.2 && h < 13.6;
    const pose = !day ? -1 : near ? 2 : reading ? 1 : 0;
    for (let p = 0; p < 3; p++) {
      holt[p].visible = p === pose && platform.land !== 'canyon';
      const at = p === 1
        ? [HEAD.x - 3.2, HEAD.z + 4.4]
        : [BOAT.x - 5.4 + Math.sin(t * 0.11) * 1.6, BOAT.z + 1.4 + Math.cos(t * 0.09) * 1.1];
      holt[p].position.set(at[0], ctx.groundY(at[0], at[1]), at[1]);
    }
    houseDark.visible = day;
    houseLit.visible = !day;
    lightUpOne(houseGlow, day ? 0 : 0.9);

    /* ---- THE UNNAMED, THE LIZARD, THE BATS (Session 17) ------------- */
    for (const f of hikers) f.tick(h);
    overlooker.tick(h);
    farRim.tick(h);
    {
      lizardState.gone = Math.max(0, lizardState.gone - _dt);
      const warm = h > 9 && h < 18;
      if (!warm || lizardState.gone > 0) lizard.hide();
      else {
        if (Math.hypot(px - LIZARD.x, pz - LIZARD.z) < 5.5) lizardState.gone = 20;
        lizard.set(0, LIZARD.x, LIZARD.z, Math.sin(t * 0.13) > 0 ? 1 : -1, 1.3);
      }
    }
    {
      const on = events.progress('the-slot-bats');
      slotBats.forEach((b, i) => {
        if (on < 0) { b.hide(); return; }
        const a = t * (1.6 + i * 0.4) + i * 1.9;
        b.set(0, axisAt(-200 + Math.sin(a * 0.7) * 12) + Math.cos(a) * 4, -200 + Math.sin(a * 0.7) * 12, Math.cos(a) > 0 ? 1 : -1, 7 + Math.sin(a * 2.2) * 1.4);
      });
    }

    /* THE BIRD. One turn every forty seconds, thirteen units up, and it
     * is the only thing in SPLITROCK that is above you. */
    const a = t * 0.157;
    const bx = axisAt(-200) + Math.cos(a) * 15;
    const bz = -200 + Math.sin(a) * 26;
    const wing = Math.sin(t * 1.9) > 0 ? 0 : 1;
    for (let p = 0; p < 2; p++) {
      birds[p].visible = p === wing;
      birds[p].position.set(bx, birdY + 15.5 + Math.sin(a * 2) * 1.4, bz);
    }
  };
};

export const CANYON_POIS: WorldPOI[] = [
  {
    /* Short sentences. People out here do not use two words
     * (THE-WAITS §4), and that is the register for every note in this
     * land: they are the shortest in the game. */
    x: 301, z: -106, radius: 9, label: 'THE RIVERHEAD',
    prompt: 'LOOK AT WHERE IT STARTS',
    note: {
      title: 'the riverhead',
      body: 'it comes out of the ground here and goes west. above it the channel is dry and has been dry a long time. same channel.',
    },
  },
  {
    x: 297, z: -120, radius: 8, label: 'THE TOP OF THE CLIMB',
    note: {
      title: 'the top of the climb',
      body: 'somebody left their boots here. side by side, laced, pointing up the canyon. they have been rained on twice.',
    },
  },
  {
    x: 291, z: -134, radius: 9, label: 'THE MOUTH',
    prompt: 'GO DOWN',
    note: {
      title: 'the mouth',
      body: 'the page is only scratched here. walk north and it opens. there is no other way in and no way out at the far end.',
    },
  },
  {
    /* WEST AND NORTH OF WHERE ROUND 4 PUT IT. From THE SHOT's standpoint
     * on the channel floor the overlook was twenty-eight degrees off
     * north — right on the desktop rig's frame edge — so its name was
     * written half off the screen and the land's best composition had
     * the word "look" clipped into its left margin. It is thirty-six
     * degrees out now, which is outside the frame in both viewports. */
    x: 272, z: -178, radius: 10, label: 'THE OVERLOOK',
    note: {
      title: 'the overlook',
      body: 'the whole cut, end to end, from the one place you can see it from. the other rim is forty units away and about an hour.',
    },
  },
  {
    x: 300, z: -181, radius: 9, label: 'THE NEEDLE ARCH',
    prompt: 'STAND UNDER IT',
    note: {
      title: 'the needle arch',
      body: 'a hole worn through solid rock by weather and insistence. you stand under it. it holds.',
    },
  },
  {
    /* THE LABEL SITS WEST OF THE BOAT, and that is Session 10's lesson
     * applied before it cost anything: the skyline writes a name above
     * the tallest thing UNDER it and cannot know what is BEHIND it, and
     * behind this POI there is a sixteen-unit slab, a rim mark and a
     * house, all on one axis. Height does not solve that. Angle does. */
    x: 300, z: -232, radius: 11, label: 'THE TRESTLES', labelHeight: 3.4,
    prompt: 'LOOK AT THE MARKS',
    note: {
      title: 'the trestles',
      body: 'a boat, keel up, off the ground, oiled. there are marks up the wall behind it. the lowest one is the height of the boat.',
    },
  },
];

/* ================================================================== *
 * THE BLEACH FLATS — the flattest ground in the world, and the only
 * land whose whole thesis is that the answer is somewhere else.
 *
 * Session 11, to design/specs/the-bleach-flats.md.
 *
 * THE DRAFT THIS REPLACES was sixty dune decals, forty-two cacti and
 * eight tumbleweeds on a Poisson scatter, with four palms round the
 * oasis and two cow skulls. All of it is cut. The rule that replaces it
 * is the canyon's, turned inside out:
 *
 *   **NOTHING IN THIS LAND IS ENCLOSED AND NOTHING IN IT IS TALL.
 *   THERE ARE FOUR THINGS TO WALK TO AND EIGHTY UNITS BETWEEN THEM.**
 *
 * The emptiness is the content. What makes it composed emptiness rather
 * than an empty rect is that everything in it is on ONE AXIS — the
 * track — and everything off that axis is deliberately, visibly not
 * worth the walk.
 * ================================================================== */

/** THE OASIS. `layout.PONDS[1]`; the only water in the land and the
 *  bottom of THE PAN (`elevation.ts`). */
const OASIS = { x: 305, z: 55 };
/** THE CATCH — Amos's, forty units south, and on the pan's RIM, which
 *  is why the water he carries goes uphill both ways. */
const CATCH = { x: 302, z: 95 };

/* ================================================================== *
 * THE FLATS' UNNAMED (Session 17): two, because the answer is elsewhere
 * and so is everybody. Somebody walks the east road in from the Downs'
 * side at seven, gets as far as THE HANDS, reads a post that points at
 * everywhere but here, and turns round; and again in the afternoon.
 * That is the delivery that finds the stall shut, in a land with no
 * stall. AND AMOS'S NIGHT WALK, moved onto `events.ts` (owed from
 * Session 15): six round trips from the catch to the oasis and back,
 * down empty and up loaded, with the wait at the water while the cans
 * fill, every one of them a registered leg.
 * ================================================================== */
const ROAD_WALKERS = [7.2, 15.4].map((at, k) => ({ id: `the-road-walker-${k}`, land: 'desert' as const, pace: 330, stops: stops([
  [at, 234.5, 14.5, 0, 1], [at + 0.1, 263.5, 15.5, 0, 1, 0.2], [at + 0.4, 234.5, 14.5, 0, -1, 0.02],
]) }));
const TRACK_X = (z: number) => 303.5 + Math.sin(z * 0.17) * 1.3;
const AMOS_NIGHT = (() => {
  const rows: [number, number, number, number, (-1 | 1)?, number?][] = [];
  for (let k = 0; k < 6; k++) {
    const t0 = 20.5 + k * 1.333;
    rows.push([t0, TRACK_X(95) + 1.1, 95, 1, -1, 0.02]);
    rows.push([t0 + 0.56, TRACK_X(64) + 1.1, 64, 2, 1]);
  }
  rows.push([28.5, TRACK_X(95) - 1.1, 95, 1, -1, 0.02]);
  return { id: 'amos-night', land: 'desert' as const, pace: 72, walkPose: 1, stops: stops(rows) };
})();
registerRoutine(AMOS_NIGHT);
events.register({ id: 'the-pale-kite', land: 'desert', at: 11.0, hours: 4.0, place: { x: 268, z: 52 } });
events.register({ id: 'the-snake-crosses', land: 'desert', at: 19.7, hours: 0.08, place: { x: 304, z: 82 } });

export const buildDesert: RegionBuilder = (ctx) => {
  const { r, terrain } = ctx;

  const GROUND = [0, 1, 2].map((v) => flatsGroundDecal(7000 + v, v as 0 | 1 | 2));
  const SCRUB = [0, 1, 2].map((v) => flatsScrubTexture(7010 + v, v as 0 | 1 | 2));
  const PALM = [0, 1, 2].map((v) => flatsPalmTexture(7020 + v, v as 0 | 1 | 2));

  const clear = (x: number, z: number) => {
    if (terrain.waterAt(x, z) > 0.04) return false;
    if (terrain.roadAt(x, z)) return false;
    if (Math.hypot(x - OASIS.x, z - OASIS.z) < 17) return false;
    if (Math.hypot(x - CATCH.x, z - CATCH.z) < 13) return false;
    // and nothing anywhere near the track: it is worn because one
    // person walks it and nothing else has ever been on it
    if (Math.abs(x - 303.5) < 6 && z > 52 && z < 98) return false;
    return true;
  };

  /* ================================================================ *
   * THE GROUND — and it is most of the land.
   *
   * A density GRADIENT rather than a coverage: thickest along the
   * north, where the east road comes in and the page still remembers
   * the Downs, and thinning to nothing over the pan, which is THE PALE
   * and is supposed to be bare. Nothing is evenly spaced anywhere.
   * ================================================================ */
  {
    const pts: [number, number][] = [];
    for (let x = 238; x < 374; x += 15) {
      for (let z = -94; z < 126; z += 15) {
        const jx = x + (r() - 0.5) * 13;
        const jz = z + (r() - 0.5) * 13;
        if (!clear(jx, jz)) continue;
        // THE PALE is bare: the middle of the pan gets a quarter of the
        // ground marks anything else does
        const toPale = Math.hypot(jx - 268, jz - 52);
        if (toPale < 34 && r() < 0.72) continue;
        pts.push([jx, jz]);
      }
    }
    for (let v = 0; v < 3; v++) {
      const sub = pts.filter((_, i) => i % 3 === v);
      const f = ctx.field(GROUND[v], sub.length,
        { w: 15, h: 15, decal: true, baseOpacity: 0.42 });
      // the dune script runs one way, always: there is one wind out
      // here and a floor combed at random angles is a floor nothing
      // combed
      sub.forEach(([x, z], i) => f.set(i, x, z, 1, 0, r() > 0.5));
    }
  }

  /* THE PALE — cracked pan floor, and the one place the ground has a
   * pattern. Four fence posts stand in it, in a line, with no wire on
   * them and nothing anywhere to say why. */
  {
    const pts: [number, number][] = [];
    for (let k = 0; k < 22; k++) {
      const a = r() * Math.PI * 2;
      const d = Math.sqrt(r()) * 30;
      pts.push([268 + Math.cos(a) * d, 52 + Math.sin(a) * d * 0.85]);
    }
    const f = ctx.field(crackedPanDecal(7030), pts.length,
      { w: 13, h: 13, decal: true, baseOpacity: 0.6 });
    pts.forEach(([x, z], i) => f.set(i, x, z, 1, r() * Math.PI, r() > 0.5));

    const posts: [number, number][] = [[258, 34], [262, 46], [266, 58], [270, 70]];
    const pf = ctx.field(fencePostTexture(7031), posts.length, { w: 1.0, h: 2.8 });
    posts.forEach(([x, z], i) => pf.set(i, x, z, 0.86 + r() * 0.24, 0, i % 2 === 0));
  }

  /* THE SCRUB — the only plant that lives out here, and there is one of
   * it. Clustered where a fold in the page holds a little shade, never
   * spread: a desert plant grows where the last one dropped. */
  {
    const pts: [number, number][] = [];
    for (const [cx, cz, n, rad] of [
      [246, -60, 9, 22], [330, -52, 7, 18], [252, 12, 6, 16], [344, 62, 8, 20],
      [286, 118, 7, 22], [356, 108, 6, 18], [240, 96, 8, 20], [318, -22, 5, 15],
    ] as [number, number, number, number][]) {
      for (let k = 0; k < n; k++) {
        const a = r() * Math.PI * 2;
        const d = Math.sqrt(r()) * rad;
        const x = cx + Math.cos(a) * d;
        const z = cz + Math.sin(a) * d;
        if (clear(x, z)) pts.push([x, z]);
      }
    }
    for (let v = 0; v < 3; v++) {
      const sub = pts.filter((_, i) => i % 3 === v);
      if (!sub.length) continue;
      const f = ctx.field(SCRUB[v], sub.length,
        { w: 2.9, h: 2.0, wind: { amp: 0.07, freq: 1.3 } });
      sub.forEach(([x, z], i) => f.set(i, x, z, 0.7 + r() * 0.7, 0, r() > 0.5));
    }
    const bones: [number, number][] = [[292, -30], [258, 108], [340, 30]];
    const bf = ctx.field(flatsBoneTexture(7040), bones.length,
      { w: 2.2, h: 1.3 });
    bones.forEach(([x, z], i) => bf.set(i, x, z, 0.8 + r() * 0.4, r() * 2, r() > 0.5));
  }

  /* ================================================================ *
   * THE OASIS — and the palms are all on the NORTH shore.
   *
   * `THE-STRANGERS` C22: *the oasis, from the wrong direction, and it
   * is not there.* That is not a script and it is not a trick of the
   * light — it is where the trees stand. Come at it from the north,
   * which is what a player walking off the east road does, and you find
   * a stand of palms with nothing under them and no water anywhere,
   * because the water is on the far side of them and the ground is
   * flat. Come at it from the SOUTH, up Amos's track, and the pool is
   * the whole foreground with the trees standing behind it.
   *
   * **The land teaches you that you came at it from the wrong side**,
   * which is the belief of the place said in one placement rule.
   * ================================================================ */
  {
    const palms: [number, number, number, 0 | 1 | 2][] = [
      [299, 42, 9.4, 0], [308, 39, 10.2, 1], [314, 46, 8.6, 2], [295, 47, 8.0, 1],
      [318, 55, 9.0, 0], [303, 36, 7.4, 2], [289, 52, 7.0, 0], [312, 63, 6.6, 1],
    ];
    for (let v = 0; v < 3; v++) {
      const sub = palms.filter((p) => p[3] === v);
      if (!sub.length) continue;
      const f = ctx.field(PALM[v], sub.length,
        { w: 8.4, h: 10.8, wind: { amp: 0.045, freq: 0.85 } });
      sub.forEach(([x, z, h], i) => f.set(i, x, z, h / 10.8, 0, false));
    }
    // the reeds, on the SOUTH bank only, so they are the near edge of
    // the pool in the one framing this land is staged around
    const reeds: [number, number][] = [[298, 65], [306, 67], [313, 64], [302, 68]];
    const rf = ctx.field(oasisReedTexture(7050), reeds.length,
      { w: 5.2, h: 3.1, wind: { amp: 0.09, freq: 1.6 } });
    reeds.forEach(([x, z], i) => rf.set(i, x, z, 0.8 + r() * 0.4, 0, r() > 0.5));
  }

  /* ================================================================ *
   * THE TRACK — forty units, worn by one person, both ways, at night.
   *
   * It is not in `layout.ROADS` and that is the whole point. A road in
   * this world is a thing everybody uses; Brack's Round is a road
   * because a wood full of people inherited one man's fear. **This is
   * not a road. It is wear.** One person made it, nobody else has ever
   * been on it, the map will never draw it, and it goes from the only
   * water in the land to the only made thing in the land and nowhere
   * else at all.
   * ================================================================ */
  {
    const wear: [number, number][] = [];
    for (let z = 54; z <= 96; z += 4.4) wear.push([303.5 + Math.sin(z * 0.17) * 1.3, z]);
    const tex = [0, 1].map((v) => trackDecal(7060 + v));
    for (let v = 0; v < 2; v++) {
      const sub = wear.filter((_, i) => i % 2 === v);
      const f = ctx.field(tex[v], sub.length,
        { w: 4.4, h: 7.4, decal: true, baseOpacity: 0.85 });
      sub.forEach(([x, z], i) => f.set(i, x, z, 1, 0, r() > 0.5));
    }
    /* AND HE LEAVES A CAN AT EACH END, because carrying an empty can
     * forty units is work for nothing. Nobody is ever told that. */
    ctx.standee(waterCanTexture(7062), 0.9, 1.2, 306.4, 63.5, { rotY: 0.3 });
    ctx.standee(waterCanTexture(7063), 0.9, 1.2, 300.4, 90.0, { rotY: -0.2 });
  }

  /* ================================================================ *
   * THE CATCH — AMOS (THE-WAITS §5).
   *
   * The rain-catch is in good order and the cistern is full and it has
   * always been full. He carries the water forty units from the oasis
   * by hand, at night, because it is cooler, and there is nobody out
   * here to fool. **He is not faking a rainfall. He is keeping the
   * thing that catches rain in working order**, and a full cistern is
   * what working order looks like.
   *
   * Three things in the geometry say all of it and none of them is
   * written anywhere:
   *   · the apron is the only ruled rectangle in a land of broken
   *     dashes, and it is spotless;
   *   · the gutter runs downhill FROM the cistern (U23), so it has
   *     never delivered a drop and never could;
   *   · and the tank sits on the pan's rim while the oasis sits at the
   *     bottom of it, so every can he has ever carried came uphill.
   * ================================================================ */
  /* THE APRON STANDS WEST OF THE TRACK, and that is a composition fix
   * before it is a fiction one. Round 1 put it on the track's own line,
   * eight units north of the cistern — which is exactly where the
   * camera sits when a walker stands on the track and looks at the
   * oasis, so THE SHOT came back as a close-up of a boarded deck. The
   * catch is a thing you come off the track to look at. */
  ctx.standee(rainApronTexture(7100), 13.4, 8.6, CATCH.x - 10, CATCH.z - 3.4, { rotY: 0.06 });
  const cisternShut = ctx.standee(cisternTexture(7101, true), 5.4, 4.7, CATCH.x, CATCH.z);
  const cisternOpen = ctx.standee(cisternTexture(7102, false), 5.4, 4.7, CATCH.x, CATCH.z);
  for (const m of [cisternShut, cisternOpen]) {
    (m.material as THREE.MeshBasicMaterial).transparent = true;
  }
  ctx.standee(rainTableTexture(7103), 2.6, 3.1, CATCH.x - 5.6, CATCH.z + 3.4, { rotY: -0.22 });
  ctx.decal(crackedPanDecal(7104), 13, 13, CATCH.x - 4, CATCH.z - 1, 0.3, 0.5);

  const amos = [0, 1, 2].map((p) =>
    ctx.standee(amosTexture(7110 + p, p as 0 | 1 | 2), 1.6, 2.62, CATCH.x - 4, CATCH.z + 2));
  for (const m of amos) (m.material as THREE.MeshBasicMaterial).transparent = true;

  /* ================================================================ *
   * THE HANDS, and WHERE THE ROAD STOPS.
   * ================================================================ */
  ctx.standee(flatsSignTexture(7120), 5.0, 5.7, 266, 13.5, { rotY: 0.1 });
  /* THE ROAD'S LAST YARD. Four hundred units from the meadow, the east
   * road simply quits at the foot of the rim, and what is there is what
   * is always there at the end of a road nobody finished: two posts
   * somebody set, and then the ground going up. */
  for (const [x, z, h] of [[344, 19, 3.0], [351, 20, 2.6], [347.5, 25, 2.2]] as const) {
    ctx.standee(fencePostTexture(7121 + Math.round(x)), 1.1, h, x, z, { rotY: 0.4 });
  }
  ctx.standee(flatsBoneTexture(7122), 2.4, 1.4, 341, 24, { rotY: 1.1 });
  ctx.decal(crackedPanDecal(7123), 14, 14, 347, 22, 0.4, 0.4);
  ctx.decal(trackDecal(7124), 9, 12, 346, 18.5, 1.55, 0.55);
  for (const [x, z, w] of [[342, 15, 2.2], [352, 12, 1.7], [338, 27, 1.4]] as const) {
    ctx.standee(flatsBoneTexture(7125 + Math.round(x)), w, w * 0.6, x, z, { rotY: x * 0.3 });
  }

  /* ================================================================ *
   * THE TUMBLEWEEDS, and THE DUST DEVIL.
   *
   * The weeds cross the land west to east on the one wind, and one of
   * them is caught on the fence posts and only rocks. The devil is the
   * land's player-responsive motion and it is the belief of the place:
   * it is the one thing out here that is going somewhere, and if you
   * walk at it, it goes somewhere else.
   * ================================================================ */
  const WEEDS = 9;
  const weeds = ctx.field(flatsTumbleweedTexture(7130), WEEDS, { w: 2.4, h: 2.4 });
  const weedState = Array.from({ length: WEEDS }, (_, i) => ({
    x: 236 + r() * 140, z: -84 + r() * 206, spin: r() * 6, stuck: i === 3,
  }));
  weedState[3].x = 264;
  weedState[3].z = 52;
  weedState.forEach((s, i) => weeds.set(i, s.x, s.z, 0.55 + r() * 0.6, s.spin, false));

  const devils = [0, 1].map((p) =>
    ctx.standee(dustDevilTexture(7140 + p, p as 0 | 1), 5.4, 12.2, 280, 20));
  for (const m of devils) (m.material as THREE.MeshBasicMaterial).transparent = true;
  const devil = { x: 276, z: 24, a: 1.9 };

  /* ---- THE UNNAMED, AND THE PALE'S ANIMALS (Session 17) ------------- */
  const roadWalkers = ROAD_WALKERS.map((d, i) => new Figure(ctx, d, i ? 2 : 0));
  const PALE_LIZARD = { x: 262.5, z: 49.5 };
  const paleLizard = new Creature(ctx, 'the-pale-lizard', 'desert', [lizardTexture(7150)], 0.9, 0.45, PALE_LIZARD.x, PALE_LIZARD.z);
  const paleLizardState = { gone: 0 };
  const kite = new Creature(ctx, 'the-pale-kite', 'desert', [kiteTexture(7151)], 2.6, 1.3, 268, 52);
  const snake = new Creature(ctx, 'the-snake', 'desert', [snakeTexture(7152)], 1.9, 0.6, 296, 80);

  return (dt: number, t: number, px: number, pz: number) => {
    const h = clock.hour;

    /* THE LID COMES OFF, AND STAYS OFF.
     *
     * You have walked the crease, both faces — the world's one real
     * fold, which is where any water on this sheet would actually go.
     * `fact:the-fold` (knowledge.ts). He has decided to find out. The
     * game does not say whether that is despair or nerve. */
    const open = knowledge.has('fact:the-fold');
    cisternShut.visible = !open;
    cisternOpen.visible = open;

    /* AMOS'S NIGHT, and it is the whole of the wait.
     *
     * From half past eight in the evening to half past four he is on
     * the track, and he is on it the whole time: down empty, back with
     * two full cans, and again. `THE-STRANGERS` C21 is a player meeting
     * him going the other way, and the only way to make that happen is
     * for it to be true. In the day he is at the catch, and what he is
     * doing there is maintenance on a machine that has never worked. */
    const walk = routineNow('amos-night', h);
    const night = !!walk && walk.present;
    let pose: 0 | 1 | 2 = 1;
    let ax = CATCH.x - 4.6;
    let az = CATCH.z + 2.4;
    if (night && walk) {
      /* ON `events.ts` since Session 17: one round trip every eighty
       * game-minutes, down empty and back with two full cans, the
       * loaded half slower because it is, and a wait at the water
       * while they fill. `amos-night` is registered at module scope
       * with every leg, so a walker who arrives at two in the morning
       * finds him where the hour says. */
      ax = walk.x;
      az = walk.z;
      const down = walk.leg % 2 === 0;
      pose = walk.moving ? (down ? 1 : 0) : (walk.leg % 2 === 1 ? 2 : 1);
    } else {
      /* Round 1 had him crouched at the gutter for most of the day and
       * at forty units a bent figure a metre and a half tall reads as an
       * animal, not a man. He stands at the tank for two thirds of it —
       * which is also the truer thing: there is not much to do to a
       * machine that works. */
      const swing = Math.sin(t * 0.05 + 1.2);
      pose = swing > 0.62 ? 2 : 1;
      if (pose === 2) { ax = CATCH.x - 12.4; az = CATCH.z - 1.4; }
    }
    for (let p = 0; p < 3; p++) {
      amos[p].visible = p === pose && platform.land !== 'desert';
      amos[p].position.set(ax, ctx.groundY(ax, az), az);
    }

    /* THE WEEDS. One wind, west to east, and the one on the fence has
     * been on the fence for a while. */
    for (let i = 0; i < WEEDS; i++) {
      const s = weedState[i];
      if (s.stuck) {
        s.spin = Math.sin(t * 1.7) * 0.22;
        weeds.set(i, s.x, s.z, 0.62, s.spin, false);
        continue;
      }
      s.x += dt * (2.4 + (i % 4) * 0.5);
      s.z += dt * 0.5;
      s.spin -= dt * (2.1 + (i % 3) * 0.3);
      if (s.x > 376) { s.x = 234; s.z = -88 + ((s.z + 320) % 210); }
      weeds.set(i, s.x, s.z, 0.55 + (i % 4) * 0.14, s.spin, false);
    }

    /* THE DUST DEVIL, and it will not be walked up to. It drifts on its
     * own bearing until somebody comes inside twenty-five units, and
     * then it leans away — never fast, never a flee, just always
     * further off than it was. */
    const toW = Math.hypot(devil.x - px, devil.z - pz);
    if (toW < 26) {
      const away = Math.atan2(devil.z - pz, devil.x - px);
      let d = away - devil.a;
      while (d > Math.PI) d -= Math.PI * 2;
      while (d < -Math.PI) d += Math.PI * 2;
      devil.a += d * Math.min(1, dt * 1.1);
    } else {
      devil.a += Math.sin(t * 0.07) * dt * 0.28;
    }
    devil.x += Math.cos(devil.a) * dt * 3.4;
    devil.z += Math.sin(devil.a) * dt * 3.4;
    if (devil.x < 238) { devil.x = 238; devil.a = Math.PI - devil.a; }
    if (devil.x > 372) { devil.x = 372; devil.a = Math.PI - devil.a; }
    if (devil.z < -92) { devil.z = -92; devil.a = -devil.a; }
    if (devil.z > 124) { devil.z = 124; devil.a = -devil.a; }
    const lean = Math.sin(t * 0.9) > 0 ? 0 : 1;
    for (let p = 0; p < 2; p++) {
      devils[p].visible = p === lean;
      devils[p].position.set(devil.x, ctx.groundY(devil.x, devil.z), devil.z);
    }

    /* ---- THE UNNAMED, AND THE PALE'S ANIMALS (Session 17) ----------- */
    for (const f of roadWalkers) f.tick(h);
    {
      paleLizardState.gone = Math.max(0, paleLizardState.gone - dt);
      const warm = h > 8.5 && h < 18.5;
      if (!warm || paleLizardState.gone > 0) paleLizard.hide();
      else {
        if (Math.hypot(px - PALE_LIZARD.x, pz - PALE_LIZARD.z) < 5.5) paleLizardState.gone = 20;
        paleLizard.set(0, PALE_LIZARD.x, PALE_LIZARD.z, Math.sin(t * 0.11) > 0 ? 1 : -1, 0.1);
      }
    }
    {
      const on = events.progress('the-pale-kite');
      if (on < 0) kite.hide();
      else {
        const a = t * 0.11;
        kite.set(0, 268 + Math.cos(a) * 24, 52 + Math.sin(a) * 14, Math.sin(a) < 0 ? -1 : 1, 15 + Math.sin(a * 2.3) * 1.5);
      }
    }
    {
      const on = events.progress('the-snake-crosses');
      if (on < 0) snake.hide();
      else snake.set(0, 296 + (313 - 296) * on, 80 + (85 - 80) * on, 1, 0.05);
    }
  };
};

export const DESERT_POIS: WorldPOI[] = [
  {
    x: 266, z: 12, radius: 9, label: 'THE HANDS',
    note: {
      title: 'the hands',
      body: 'four arms on one post, and every one of them points at somewhere else. there is nothing on it for here. somebody put it up anyway, which took a day.',
      learns: ['name:canyon'],
    },
  },
  {
    x: 268, z: 52, radius: 13, label: 'THE PALE',
    note: {
      title: 'the pale',
      body: 'the flattest ground on the sheet, cracked into plates you could lift. four fence posts stand in a line across it with no wire between them, and whatever was worth keeping in or out has been gone a long while.',
    },
  },
  {
    x: 305, z: 55, radius: 13, label: 'THE OASIS',
    prompt: 'DRINK',
    note: {
      title: 'the oasis',
      body: 'green, out here, is a rumor you can stand in. the water is the same blue as the sea, which is a long way west, and nobody has ever worked out how it gets here or where it goes afterwards. from the north it is a stand of trees and nothing else.',
      learns: ['name:beach'],
    },
  },
  {
    x: 303, z: 77, radius: 9, label: 'THE TRACK',
    note: {
      title: 'the track',
      body: 'forty units of worn ground between the only water out here and the only building. one set of feet, both ways, and it goes nowhere else. there is a can standing at each end of it.',
    },
  },
  {
    /* THE LABEL SITS EAST, off the apron's axis. The apron is thirteen
     * units wide and eight and a half tall and the cistern stands in
     * front of the middle of it, so a name written over the tank lands
     * on the deck from anywhere on the track. Angle, not height. */
    x: 306, z: 97, radius: 11, label: 'THE CATCH', labelHeight: 3.2,
    prompt: 'LOOK AT THE GUTTER',
    note: {
      title: 'the catch',
      body: 'guttering, a fall, a tank with a lid on it, and every bracket on it present and true. the only piece of engineering in the bleach flats. there is a board beside it ruled into columns, ready.',
    },
  },
  {
    x: 348, z: 18, radius: 10, label: 'WHERE THE ROAD STOPS',
    note: {
      title: 'where the road stops',
      body: 'the east road runs four hundred units from the meadow and then quits, here, at the foot of the place the page lifts. you can climb the rest. there is nothing up there but the edge and the next sheet down.',
    },
  },
];


/* ================================================================== *
 * THE HARROW DOWNS — farm country, and the one wait in this world with
 * a date on it.
 *
 * Session 10, to design/specs/harrow-downs.md, and the register comes
 * first because it governs everything else. THE-WAITS §10: *the only
 * one in the game that is not wry. Do not be clever in the Downs.*
 * There is no joke in this land. The scarecrow keeps the one it had,
 * because it is older than this session.
 *
 * The draft this replaces was seventy wheat decals on a Poisson
 * scatter, fourteen bales, thirty fence panels on three dead-straight
 * runs and two identical red barns. All of it is cut, and the rule that
 * replaces it is one line:
 *
 *   **NOTHING IN THIS LAND IS SCATTERED. IT IS ENCLOSED.**
 *
 * Farm country is not props on grass. It is a set of shapes with edges,
 * the edges are hedges, and what a field is DOING is the only variety
 * it needs — no two fields sharing a hedge are in the same state, which
 * is the whole of what makes a patchwork a patchwork.
 * ================================================================== */

type FieldState = 'corn' | 'stook' | 'stubble' | 'plough' | 'fallow' | 'grazed';
type Field = { name: string; poly: [number, number][]; state: FieldState };

/**
 * ELEVEN FIELDS, laid on the harrow's grain, which runs north–south —
 * so the patchwork is STRIPED rather than gridded and the recession in
 * every framing is drawn by the ground itself (`elevation.ts`, THE
 * HARROW). The states are distributed by hand: neighbours never match.
 */
const FIELDS: Field[] = [
  // north of the river, the worked centre
  { name: 'the long piece', state: 'plough',
    poly: [[106, -42], [132, -44], [131, 14], [107, 12]] },
  { name: 'the headland', state: 'grazed',
    poly: [[134, -44], [146, -44], [146, 20], [133, 18]] },
  // NORTH OF THE WATER. Round 14 ran it from z −42 to +16, which put
  // the river through the middle of the field the wait is set in.
  { name: 'the home field', state: 'stook',
    poly: [[158, -46], [208, -42], [206, -6], [157, -8]] },
  { name: 'the far piece', state: 'stubble',
    poly: [[158, -92], [204, -88], [206, -46], [158, -46]] },
  { name: 'the mill piece', state: 'corn',
    poly: [[110, -84], [148, -86], [150, -48], [108, -48]] },
  // south of the river, going away toward the city
  { name: 'the water meadow', state: 'plough',
    poly: [[110, 40], [136, 38], [136, 92], [110, 90]] },
  // the strip between the east road and the river, which round 9 left
  // as thirty units of unaccounted-for ground in the middle of THE SHOT
  { name: 'the roadside piece', state: 'stubble',
    poly: [[154, -2], [204, -8], [206, 28], [154, 32]] },
  { name: 'the low piece', state: 'fallow',
    poly: [[162, 40], [200, 34], [202, 80], [162, 78]] },
  { name: 'the crow field', state: 'stubble',
    poly: [[112, 102], [143, 102], [142, 124], [112, 124]] },
  { name: 'the sour ground', state: 'fallow',
    poly: [[158, 86], [204, 84], [206, 124], [158, 124]] },
  /* The two nobody works hard — and they stop at x = 96, with the
   * harrow, because west of that is the crease's east shoulder and
   * THE COMMON's protected framings can see it at the fog limit.
   * `diff-sheets.mjs` costed the first version: four-hundred-pixel
   * slivers of new grass on the horizon of `common-THE-SHOT`,
   * `crossroads`, `common-wide` and `gate-detail`. The Downs' west
   * third is a composed void in the spec and it is a composed void
   * here; it was only ever grass because grass was easy. */
  { name: 'the west slope', state: 'grazed',
    poly: [[97, 30], [106, 30], [106, 76], [97, 76]] },
  { name: 'the rough', state: 'grazed',
    poly: [[97, -40], [105, -40], [105, 24], [97, 24]] },
];

const MILL = { x: 150, z: -8 };
const PICNIC = { x: 140.5, z: 9 };

/* ================================================================== *
 * THE DROVE MOVES AT DAWN — the first scheduled event in the game
 * (Session 15, `THE-FUN-PASS` §9, `events.ts`).
 *
 * Thirteen sheep. At night they are in the fold at the south end of
 * the lane. At first light they walk the lane north, through the mouth
 * gate, into the west slope, and stand there all day; at dusk they
 * come back down it. It happens whether or not the walker is there:
 * the flock's place is a FUNCTION OF THE HOUR, so a walker who arrives
 * ten minutes into the drove finds it ten minutes up the lane, and a
 * walker who has never been to the Downs finds a field with sheep in
 * it at noon and a lane with sheep in it at midnight.
 *
 * **Two of them do not move for anybody**, including at dawn. The note
 * on THE DROVE has said so since Session 10 and it is still true.
 *
 * Registered at module scope, not in the builder, because a thing that
 * fires whether or not the walker is there cannot wait for the land to
 * be built. The sound is the only part that needs the walker: the
 * flock setting out is a thing you hear if you were in earshot.
 * ================================================================== */
const DROVE_OUT = { at: 5.7, hours: 1.0 };
const DROVE_HOME = { at: 19.3, hours: 1.0 };
const droveSound = (px: number, pz: number) => {
  if (Math.hypot(px - 101, pz - 100) < 70) say('sheep');
};
events.register({ id: 'the-drove-out', land: 'downs', ...DROVE_OUT,
  place: { x: 101, z: 100 }, onStart: droveSound });
events.register({ id: 'the-drove-home', land: 'downs', ...DROVE_HOME,
  place: { x: 101, z: 100 }, onStart: droveSound });

/* JOAN'S DAY, ON `events.ts` (Session 17; owed from 15). Out at first
 * light, at the table through the middle of the day, in when the light
 * goes: three registered events, and the builder reads them back. */
events.register({ id: 'joan-out', land: 'downs', at: 5.6, hours: 0.8, place: { x: 174, z: -40 } });
events.register({ id: 'joan-at-table', land: 'downs', at: 11.6, hours: 1.3, place: PICNIC });
events.register({ id: 'joan-in', land: 'downs', at: 19.8, hours: 0.8, place: { x: 174, z: -40 } });

/* ================================================================== *
 * THE DOWNS' UNNAMED (Session 17): THE MILLER, in and out of his door
 * all day and once to the granary with a sack; A CARTER who walks down
 * from the field gate, over the ford on the stones, up to the mill and
 * back, in the middle of the morning; and THE SHEPHERD, who is at the
 * back of the flock at dawn and at dusk and stands at the field's edge
 * with his stick between. And the four hands, who were already here.
 * ================================================================== */
const MILLER = { id: 'the-miller', land: 'downs' as const, pace: 260, walkPose: 4, stops: stops([
  [6.95, 150, -1.5, 0, 1], [7.05, 152.5, -3, 0, 1, 1.8], [9.0, 162.5, -12.5, 4, 1, 0.12], [9.3, 152.5, -3, 0, -1, 3.0],
  [12.4, 154.5, -2, 3, -1, 0.6], [13.1, 152.5, -3, 0, 1, 4.5], [17.8, 150, -1.5, 0, -1, 0.02],
]) };
const CARTER = { id: 'the-downs-carter', land: 'downs' as const, pace: 280, stops: stops([
  [9.4, 155, 29, 0, -1], [9.52, 141.5, 20.5, 0, -1, 0.1], [9.66, 146, 15, 0, 1], [9.8, 150, 3, 0, 1, 0.2], [10.2, 155, 29, 0, 1, 0.02],
]) };
const SHEPHERD = { id: 'the-shepherd', land: 'downs' as const, pace: 56, walkPose: 6, stops: stops([
  [5.62, 101, 117, 6, 1], [6.75, 96.5, 63, 6, -1, 12.5], [20.35, 101, 117, 6, 1, 0.05],
]) };
events.register({ id: 'the-cows-lie-down', land: 'downs', at: 20.5, hours: 9.0, place: { x: 140, z: -12 } });

/** Where the flock is at an hour: 0 in the fold, 1 in the field, and
 *  in between it is walking. Symmetric, so the same path serves both. */
function droveAt(hour: number): number {
  const out = events.progress('the-drove-out', hour);
  if (out >= 0) return out;
  const home = events.progress('the-drove-home', hour);
  if (home >= 0) return 1 - home;
  // the day between the two: in the field; the night: in the fold
  const dayStart = DROVE_OUT.at + DROVE_OUT.hours;
  const dayEnd = DROVE_HOME.at;
  return hour >= dayStart && hour < dayEnd ? 1 : 0;
}

export const buildDowns: RegionBuilder = (ctx) => {
  const { r, terrain } = ctx;

  /* ---- THE SHARED DRAWINGS ----------------------------------------- *
   * Six hedges, three standards and ten ground states, made ONCE. Round
   * 13 made a fresh canvas per placement — a hundred and forty hedge
   * panels and thirty-three field decals, which is forty megabytes of
   * texture for one land against a budget of four. Variety in this land
   * comes from the FIELD PLAN and from placement, not from giving every
   * instance its own drawing.                                          */
  const HEDGE = [0, 1, 2, 3].map((v) => downsHedgeTexture(5000 + v, false));
  const HEDGE_GAP = [0, 1].map((v) => downsHedgeTexture(5010 + v, true));
  const STANDARD = [0, 1, 2].map((v) => hedgeStandardTexture(5020 + v, v as 0 | 1 | 2));
  const GROUND: Record<string, THREE.Texture[]> = {
    stubble: [0, 1, 2, 3].map((v) => stubbleDecal(5030 + v)),
    plough: [0, 1, 2].map((v) => ploughDecal(5040 + v)),
    fallow: [0, 1, 2].map((v) => fallowDecal(5050 + v)),
  };
  const GRASS = [0, 1, 2].map((v) => leanGrassTexture(5060 + v));

  const clear = (x: number, z: number) => {
    if (terrain.waterAt(x, z) > 0.04) return false;
    if (terrain.roadAt(x, z)) return false;
    if (terrain.slopeAt(x, z) > 0.5) return false;
    if (Math.hypot(x - MILL.x, z - MILL.z) < 9) return false;   // the mill yard
    if (Math.hypot(x - PICNIC.x, z - PICNIC.z) < 7) return false;
    return true;
  };

  /* ---- WHAT A FIELD IS DOING -------------------------------------- *
   * Grown INWARD from the boundary: nothing gets within three and a
   * half units of its own hedge, because a crop does not, and because
   * the strip it leaves is the headland — which in this land is a
   * place and not a detail.                                            */
  const fieldPts = (f: Field, spacing: number): [number, number][] => {
    const xs = f.poly.map((p) => p[0]);
    const zs = f.poly.map((p) => p[1]);
    const out: [number, number][] = [];
    for (let x = Math.min(...xs); x < Math.max(...xs); x += spacing) {
      for (let z = Math.min(...zs); z < Math.max(...zs); z += spacing) {
        const jx = x + (r() - 0.5) * spacing * 0.7;
        const jz = z + (r() - 0.5) * spacing * 0.7;
        if (polyInset(f.poly, jx, jz) < 3.5) continue;
        if (!clear(jx, jz)) continue;
        out.push([jx, jz]);
      }
    }
    return out;
  };

  let seed = 4000;
  for (const f of FIELDS) {
    if (f.state === 'grazed') {
      /* Grazed ground carries no crop — it is the land's rest, and
       * three of the eleven fields are composed emptiness. What it does
       * carry is GRASS, and that matters more than it sounds: with
       * stubble, turned earth and standing corn all in the tan family,
       * the pasture is the only green GROUND in the Downs, and round 4
       * shipped a land the art director would have called a beach. */
      const pts = fieldPts(f, 3.6);
      const per = Math.ceil(pts.length / 3);
      for (let v = 0; v < 3; v++) {
        const sub = pts.slice(v * per, (v + 1) * per);
        if (!sub.length) continue;
        const fld = ctx.field(GRASS[v], sub.length,
          { w: 1.9, h: 1.3, wind: { amp: 0.06, freq: 1.1 } });
        sub.forEach(([x, z], i) => fld.set(i, x, z, 0.7 + r() * 0.6, 0, false));
      }
      seed += 24;
      continue;
    }
    if (f.state === 'corn') {
      /* STANDING CORN, and it leans one way because there is one wind
       * in the Downs and it comes off the wood. The gust is a wave
       * crossing the whole field west to east — one field, one gust,
       * and you can watch it arrive. */
      const pts = fieldPts(f, 4.4);
      const per = Math.ceil(pts.length / 5);
      for (let v = 0; v < 5; v++) {
        const sub = pts.slice(v * per, (v + 1) * per);
        if (!sub.length) continue;
        const fld = ctx.field(standingCornTexture(seed + v), sub.length, {
          w: 4.6, h: 3.4,
          wind: { amp: 0.05, freq: 0.9 },
          wave: { amp: 0.5, speed: 0.58, len: 0.035 },
        });
        // never flipped: the lean is drawn in and it is one wind
        sub.forEach(([x, z], i) => fld.set(i, x, z, 0.85 + r() * 0.4, 0, false));
      }
      seed += 10;
      continue;
    }
    if (f.state === 'stook') {
      /* STOOKED. Sheaves stood in ranks that wander, because a person
       * carrying a sheaf walks where the last one left off. */
      /* STOOKS STAND IN THE LINE OF THE CUT, and the lines run
       * NORTH–SOUTH — with the harrow's grain, and away from the lens.
       * Round 14 scattered them on a jittered grid and a stooked field
       * came out as a hundred brown pegs on a beach: no rows, no
       * recession, and nothing to say a person had worked it. A field
       * of sheaves is a set of LINES with gaps in them. */
      const pts: [number, number][] = [];
      const xs = f.poly.map((p) => p[0]);
      const zs = f.poly.map((p) => p[1]);
      for (let x = Math.min(...xs) + 2 + r() * 4; x < Math.max(...xs); x += 6.5 + r() * 2.5) {
        // each line has its own lean, because nobody walks straight
        const drift = (r() - 0.5) * 0.16;
        const z0 = Math.min(...zs);
        for (let z = z0 + r() * 4; z < Math.max(...zs); z += 5 + r() * 2.5) {
          const jx = x + (z - z0) * drift + (r() - 0.5) * 1.2;
          const jz = z + (r() - 0.5) * 1.0;
          if (polyInset(f.poly, jx, jz) < 3.5 || !clear(jx, jz)) continue;
          if (r() < 0.2) continue;               // and the gaps are authored
          pts.push([jx, jz]);
        }
      }
      const per = Math.ceil(pts.length / 4);
      for (let v = 0; v < 4; v++) {
        const sub = pts.slice(v * per, (v + 1) * per);
        if (!sub.length) continue;
        const fld = ctx.field(stookTexture(seed + v), sub.length, { w: 2.5, h: 3.1 });
        sub.forEach(([x, z], i) => fld.set(i, x, z, 0.85 + r() * 0.35, 0, r() > 0.5));
      }
      // and the stubble under them, because a stooked field was cut
      const gp = fieldPts(f, 12);
      const g = ctx.field(GROUND.stubble[0], gp.length,
        { w: 12, h: 12, decal: true, baseOpacity: 0.36 });
      gp.forEach(([x, z], i) => g.set(i, x, z, 1, r() * 0.3, r() > 0.5));
      seed += 12;
      continue;
    }
    // the three ground states, off the shared pool
    const pool = GROUND[f.state];
    const pts = fieldPts(f, 11);
    const per = Math.ceil(pts.length / pool.length);
    for (let v = 0; v < pool.length; v++) {
      const sub = pts.slice(v * per, (v + 1) * per);
      if (!sub.length) continue;
      const fld = ctx.field(pool[v], sub.length,
        { w: 11, h: 11, decal: true, baseOpacity: f.state === 'plough' ? 0.5 : 0.4 });
      // ploughed ground is drawn ONE WAY, always: furrows run with the
      // harrow's grain, and a field of furrows at random angles is a
      // field nobody ploughed
      sub.forEach(([x, z], i) =>
        fld.set(i, x, z, 1, f.state === 'plough' ? 0 : r() * Math.PI, r() > 0.5));
    }
    seed += 6;
  }

  /* ---- THE HEDGES -------------------------------------------------- *
   * The field boundaries, and the drawing that makes this a patchwork.
   * Runs are mostly north–south, along the grain; east–west runs happen
   * only where a field ends, so the frame is striped and never gridded.
   * ------------------------------------------------------------------ */
  const HEDGES: HedgePanel[] = [];
  hedgeRun(HEDGES, r, [[106, -44], [107, 14]], { standards: 0.14 });
  hedgeRun(HEDGES, r, [[134, -46], [133, 20]], { gaps: 0.18 });
  hedgeRun(HEDGES, r, [[157, -44], [157, 16]], { standards: 0.16 });
  hedgeRun(HEDGES, r, [[208, -38], [206, 16]], { gaps: 0.2, standards: 0.08 });
  hedgeRun(HEDGES, r, [[106, -44], [156, -45]], { step: 11, gaps: 0.22 });
  hedgeRun(HEDGES, r, [[158, -46], [206, -46]], { step: 11, gaps: 0.24 });
  hedgeRun(HEDGES, r, [[108, -86], [108, -48]], { gaps: 0.2 });
  hedgeRun(HEDGES, r, [[154, -86], [154, -52]], { gaps: 0.16 });
  // south of the river
  hedgeRun(HEDGES, r, [[109, 38], [110, 92]], { standards: 0.14 });
  hedgeRun(HEDGES, r, [[137, 76], [137, 124]], { gaps: 0.18 });
  hedgeRun(HEDGES, r, [[161, 40], [160, 80]], { gaps: 0.15 });
  hedgeRun(HEDGES, r, [[202, 32], [204, 80]], { gaps: 0.28, standards: 0.06 });
  hedgeRun(HEDGES, r, [[112, 100], [142, 101]], { step: 11, gaps: 0.26 });
  /* THE DROVE — a sunken lane between two hedges, running north, and
   * the only enclosed space in the Downs. Both sides at once, which is
   * why it is the one place in the land you cannot see out of. */
  /* Round 11 ran it from z 44 to 108, which took it straight through
   * the river — a sunken lane full of sheep that fords a river twice.
   * It runs SOUTH of the water now, forty-six units of it, which is
   * also where the flock has somewhere to be going. */
  hedgeRun(HEDGES, r, [[95, 80], [94, 126]],
    { step: 6, h: 4.4, lean: 0.42, gaps: 0.05, standards: 0.09 });
  hedgeRun(HEDGES, r, [[108, 80], [107, 126]],
    { step: 6, h: 4.4, lean: 0.42, gaps: 0.05, standards: 0.07 });
  // and the lane itself: a foot of wear worn into the page by a few
  // hundred years of sheep, which is what a drove IS
  {
    const wear = [0, 1, 2].map((v) => wornGroundDecal(5560 + v));
    const spots: [number, number][] = [];
    for (let z = 82; z < 126; z += 7) spots.push([101 + (r() - 0.5) * 2.4, z]);
    wear.slice(1).forEach((tex, v) => {
      const list = spots.filter((_, k) => k % 3 === v + 1);
      const g = ctx.field(tex, list.length, { w: 11, h: 9, decal: true, baseOpacity: 0.62 });
      list.forEach(([x, z], i) => g.set(i, x, z, 1, 0.2 + r() * 0.5, r() > 0.5));
    });
    const own = spots.filter((_, k) => k % 3 === 0);
    const f = ctx.field(wear[0], own.length, { w: 11, h: 9, decal: true, baseOpacity: 0.62 });
    own.forEach(([x, z], i) => f.set(i, x, z, 1, 0.2 + r() * 0.5, r() > 0.5));
  }


  /* ---- and now they are placed, six fields for the whole land ------ */
  {
    const solid = HEDGE.map(() => [] as HedgePanel[]);
    const gapped = HEDGE_GAP.map(() => [] as HedgePanel[]);
    const stands = STANDARD.map(() => [] as HedgePanel[]);
    for (const p of HEDGES) {
      if (p.v < 0) stands[-p.v - 1].push(p);
      else if (p.gap) gapped[p.v % gapped.length].push(p);
      else solid[p.v % solid.length].push(p);
    }
    const place = (tex: THREE.Texture, list: HedgePanel[], w: number, h: number) => {
      if (!list.length) return;
      const fld = ctx.field(tex, list.length, { w, h });
      list.forEach((p, i) => fld.set(i, p.x, p.z, 1, p.a, false));
    };
    // one field per drawing; the per-panel width and height ride in the
    // instance scale, which is why every panel in a field shares a size
    solid.forEach((list, v) => place(HEDGE[v], list, 15, 4.6));
    gapped.forEach((list, v) => place(HEDGE_GAP[v], list, 15, 4.6));
    stands.forEach((list, v) => place(STANDARD[v], list, 5.8, 7.2));
  }
  /* ================================================================ *
   * THE MILL — on the highest ground in the land, at the head of the
   * lane, which is the whole of this land's layout.
   *
   * The sails live on their own quad so they can turn: THE-STRANGERS
   * U24 says they have moved a quarter since your first visit, and a
   * drawing with the sails baked into it can never say that.
   * ================================================================ */
  ctx.standee(millTexture(5600), 10.5, 14.7, MILL.x, MILL.z);
  const sails = ctx.standee(millSailsTexture(5601), 15.4, 15.4, MILL.x - 2.4, MILL.z + 0.35);
  // the sails hang on the windshaft, not on the ground: re-seat the
  // quad's pivot at its own centre and hang it at cap height
  sails.geometry.translate(0, -7.7, 0);
  ctx.hang(sails, 11.6);
  ctx.standee(granaryTexture(5602), 8.4, 6.3, 163, -16, { rotY: -0.22 });
  ctx.standee(fieldGateTexture(5603, false), 4.6, 2.9, 150, 2, { rotY: 0.08 });
  ctx.decal(stubbleDecal(5604), 16, 16, 152, -3, 0.4, 0.4);

  /* ================================================================ *
   * THE HEADLAND — the wait (THE-WAITS §10).
   *
   * A trestle laid for two, on the strip of grass the plough turns on,
   * under the one thorn that was left when the hedge was laid. It is
   * the only thing in the Downs drawn as a closed rectangle with a line
   * all the way round it, and in a land made of stripes that is the
   * first thing anybody's eye lands on.
   *
   * Two drawings, one at a time, and which one you see is not a flag
   * the game set: it is whether the second setting has been put away
   * for the evening, and — once you have sat down — it never is again.
   * ================================================================ */
  ctx.standee(thornTexture(5700), 7.2, 8.2, 132.5, 5);
  const picnicLaid = ctx.standee(picnicTexture(5701, true), 6.6, 4.95, PICNIC.x, PICNIC.z);
  const picnicOne = ctx.standee(picnicTexture(5702, false), 6.6, 4.95, PICNIC.x, PICNIC.z);
  for (const m of [picnicLaid, picnicOne]) {
    (m.material as THREE.MeshBasicMaterial).transparent = true;
  }
  ctx.decal(stubbleDecal(5703), 11, 11, PICNIC.x - 1, PICNIC.z + 3, 0.5, 0.34);

  /* ---- JOAN, AND THE FOUR WHO WORK WITH HER ----------------------- */
  const joanWork = ctx.standee(joanTexture(5710, 0), 1.72, 2.7, 172, -6);
  const joanRest = ctx.standee(joanTexture(5711, 1), 1.72, 2.7, 137.5, 12.5);
  for (const m of [joanWork, joanRest]) {
    (m.material as THREE.MeshBasicMaterial).transparent = true;
  }
  const HANDS: [number, number, number][] = [
    [166, -24, 0.0], [184, -18, 2.1], [176, -34, 4.0], [196, -28, 1.1],
  ];
  const handFields = [0, 1, 2].map((p) =>
    ctx.field(fieldHandTexture(5720 + p, p as 0 | 1 | 2), HANDS.length, { w: 1.5, h: 2.5 }));

  /* ================================================================ *
   * THE FORD — where the mill lane crosses, and the land's midpoint.
   * ================================================================ */
  /* ONE line of stones. Round 3 laid two crossings four units apart and
   * the ford came out as a zebra crossing. */
  ctx.decal(fordStonesDecal(5800), 13, 11, 143.5, 19, 0.06, 0.9);
  ctx.standee(shedAxleTexture(5802), 4.2, 2.4, 135, 22, { rotY: 0.5 });
  /* THE CART AT THE FIELD GATE, and it is the Downs' foreground. Every
   * framing in this project needs a near thing, a subject and a far
   * silhouette (QUALITY-BAR §4), and round 6's shot had the subject and
   * the silhouette and thirty units of empty lane under the lens. */
  ctx.standee(sackCartTexture(5804), 5.6, 4.2, 139.5, 34, { rotY: 0.28 });
  ctx.decal(fallowDecal(5805), 9, 9, 140, 36, 0.3, 0.3);
  ctx.standee(fieldGateTexture(5803, true), 4.6, 2.9, 155, 27, { rotY: -0.3 });
  for (const [x, z] of [[142, 30], [152, 12], [140, 36]] as [number, number][]) {
    ctx.decal(ploughDecal(5810 + Math.round(x)), 11, 11, x, z, 0, 0.3);
  }

  /* ================================================================ *
   * THE DROVE, AND THE FLOCK.
   *
   * Thirteen sheep in a sunken lane. Walk into them and they PART —
   * not a scatter: they move square off the lane's axis to whichever
   * hedge is nearer, hold while you pass, and close up behind you.
   * **Two of them never move**, because two of them never do.
   * ================================================================ */
  const FLOCK = 13;
  const sheepFields = [0, 1, 2, 3].map((p) =>
    ctx.field(sheepTexture(5900 + p, p as 0 | 1 | 2 | 3), FLOCK, { w: 2.6, h: 1.95 }));
  /* A sheep has a place in the FOLD (the lane's south end), a place in
   * the FIELD (the west slope, through the mouth gate), and walks the
   * lane between them on the clock. `x, z` is where it is meant to be
   * this frame; `hx, hz` is where it actually is, which is that plus
   * the parting. The two stubs have one place and it is in the lane. */
  type Sheep = {
    x: number; z: number; hx: number; hz: number; side: number; stub: boolean;
    fold: [number, number]; field: [number, number]; lead: number;
  };
  const flock: Sheep[] = [];
  for (let i = 0; i < FLOCK; i++) {
    const stub = i === 4 || i === 9;
    const z = 84 + (i / FLOCK) * 38 + (r() - 0.5) * 4;
    const x = 101 + (r() - 0.5) * 8;
    const fold: [number, number] = stub ? [x, z] : [100 + (r() - 0.5) * 7, 113 + (i / FLOCK) * 10 + (r() - 0.5) * 2];
    const field: [number, number] = stub ? [x, z] : [99 + (r() - 0.5) * 6.5, 54 + (i / FLOCK) * 20 + (r() - 0.5) * 3];
    flock.push({
      x: fold[0], z: fold[1], hx: fold[0], hz: fold[1],
      side: r() > 0.5 ? 1 : -1, stub, fold, field,
      // they set out one after another, the front of the flock first
      lead: (1 - i / FLOCK) * 0.35,
    });
  }
  /** The lane, fold to field: down the drove, through the mouth gate,
   *  and out into the west slope. Each sheep's own two ends are spliced
   *  onto it. */
  const LANE: [number, number][] = [[101, 108], [101, 92], [101, 82], [101, 76]];
  const lanePos = (s: Sheep, k: number): [number, number] => {
    const pts: [number, number][] = [s.fold, ...LANE, s.field];
    const segs: number[] = [];
    let total = 0;
    for (let i = 0; i < pts.length - 1; i++) {
      const d = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]);
      segs.push(d);
      total += d;
    }
    let want = k * total;
    for (let i = 0; i < segs.length; i++) {
      if (want <= segs[i] || i === segs.length - 1) {
        const u = segs[i] > 0 ? Math.max(0, Math.min(1, want / segs[i])) : 1;
        return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * u, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * u];
      }
      want -= segs[i];
    }
    return s.field;
  };
  ctx.standee(stoneTroughTexture(5920), 4.0, 2.3, 103, 90, { rotY: 0.2 });

  /* ---- THE SCARECROW, kept, and given one mark nothing will mention */
  ctx.standee(downsScarecrowTexture(5930), 3.4, 5.1, 128, 112);
  ctx.decal(stubbleDecal(5931), 13, 13, 128, 115, 0.3, 0.4);

  /* ---- THE TWO COMPOSED VOIDS ------------------------------------- *
   * North: rough grazing going up to the wood, with one stone trough on
   * it and nothing else — which is what makes the Penwood read as an
   * EDGE rather than as a wall. South-east: ground going sour toward
   * the city, one field gate standing open in a hedge that has gone.  */
  ctx.standee(stoneTroughTexture(5940), 4.6, 2.6, 112, -74, { rotY: -0.15 });
  ctx.decal(fallowDecal(5941), 17, 17, 112, -70, 0.4, 0.4);
  ctx.standee(fieldGateTexture(5942, true), 5.0, 3.1, 196, 100, { rotY: 0.12 });
  ctx.standee(hedgerowTexture(5943, true), 12, 5.0, 190, 101);
  ctx.standee(signpostTexture(5944), 2.6, 3.2, 214, 12);
  ctx.standee(signpostTexture(5945), 2.6, 3.2, 104, 42);
  ctx.standee(fieldGateTexture(5946, false), 4.8, 3.0, 112, 36, { rotY: -0.2 });

  /* ---- and the drove's mouth, where it meets the east road -------- */
  ctx.standee(fieldGateTexture(5950, false), 4.8, 3.0, 101, 79, { rotY: 0.04 });

  /* ---- THE UNNAMED, THE HERD, THE DOG, THE ROOKS (Session 17) ------ */
  const miller = new Figure(ctx, MILLER, 2);
  const carter = new Figure(ctx, CARTER, 0);
  const shepherd = new Figure(ctx, SHEPHERD, 0);
  /* THE HERD, in the headland, and it PARTS the way the flock does —
   * square off the lane, to whichever side is nearer — and it is
   * slower about it, and the heads come up first (§9 item 2: *cows in
   * the Downs with one bull that means it*; the bull is the Common's). */
  const HERD: [number, number][] = [[137, -30], [142, -22], [138, -12], [143, -4], [136, 4], [141, 12]];
  const cows = HERD.map(([x, z], i) => new Creature(ctx, `the-herd-${i}`, 'downs', [cowTexture(5960 + i, 0), cowTexture(5966 + i, 1)], 3.2, 2.2, x, z));
  const cowState = HERD.map(() => ({ hx: 0, hz: 0, low: 0, side: 0 }));
  HERD.forEach(([x, z], i) => { cowState[i].hx = x; cowState[i].hz = z; cowState[i].side = (i % 2 ? 1 : -1); });
  /* THE DOG — the second co-walker (`critique-story-3` RECOMMENDED:
   * *not another goat, on a road the goat did not take*). It lives at
   * the drove's mouth, falls in beside anybody who comes up the lane,
   * follows them anywhere in the Downs, and STOPS DEAD AT THE DOWNS'
   * EDGE on every road, and sits, and looks after them. The same
   * `Follower` as the goat with different numbers, which is the whole
   * point of `company.ts`. */
  /* IT LIVES AT THE FIELD GATE ON THE EAST ROAD, north of the river: a
   * follower cannot find a bridge, and the drove's mouth is across the
   * water from every road out of the land. From the gate the east road
   * runs to the Common's border one way and the Flats' the other, and
   * the mill lane fords the river, so there is nowhere in the Downs a
   * walker can go that the dog cannot follow — and nowhere out of it
   * that it can. */
  const dog = new Follower({
    id: 'the-downs-dog', rect: SPEC_BY_ID.downs.rect, home: { x: 106.5, z: 40.5 },
    gap: 2.6, notice: 14, walk: 4.0, trot: 9.2, margin: 2,
  });
  const dogDrawn = new Creature(ctx, 'the-downs-dog', 'downs', [0, 1, 2, 3].map((p) => dogTexture(5970 + p, p as 0 | 1 | 2 | 3)), 1.5, 1.12, dog.x, dog.z);
  let dogBark = 0;
  /* THE ROOKS ON THE SCARECROW (`rooks.ts`): Greyweather's three, here
   * all day, and they lift off the scarecrow's arms when you come and
   * settle again when you have gone. */
  const scarecrowRooks = [0, 1, 2].map((i) => new Creature(ctx, `the-scarecrow-rooks-${i}`, 'downs', [rookTexture(5980 + i)], 1.5, 1.05, 128, 112));
  const rookState = { up: 0 };
  let sailSpin = 0;

  return (dt: number, t: number, px: number, pz: number) => {
    /* THE SAILS. One revolution in about ten minutes of game time —
     * slow enough that "they were mid-turn when you came over the rise
     * and they will be mid-turn when you look back" is still true, and
     * fast enough that a player who comes back finds them a quarter
     * round (THE-STRANGERS U24). It is the only clock in this world
     * that a player can read by looking at it twice. */
    /* AND FROM SESSION 17 THE WIND ACTUALLY TURNS THEM: at the shipped
     * calm the sails keep their ten-minute revolution; when the wind
     * gets up they go round in two. */
    sailSpin += dt * Math.max(0, weather.state.wind - 0.5) * 0.14;
    sails.rotation.z = -t * 0.0105 - sailSpin;

    /* JOAN'S DAY, and it is a working day.
     *
     * Six to noon in the home field; the middle of the day at the
     * headland, standing, with her hands at the small of her back,
     * which is the one moment in it she is not doing anything; then
     * back to the field until the light goes. The register is the
     * point: she is the only person in this world waiting for
     * something that actually arrives, and is therefore the only one
     * who is not really waiting. */
    const h = clock.hour;
    // on `events.ts` since Session 17: the same day, read off three
    // registered events
    const outNow = events.between('joan-out', 'joan-in', h);
    const atTable = events.progress('joan-at-table', h) >= 0;
    (joanWork.material as THREE.MeshBasicMaterial).opacity = outNow * (atTable ? 0 : 1);
    (joanRest.material as THREE.MeshBasicMaterial).opacity = outNow * (atTable ? 1 : 0);
    joanWork.visible = outNow > 0.02 && !atTable;
    joanRest.visible = outNow > 0.02 && atTable;
    // she works her way down the field over the morning and back up it
    // over the afternoon, which is what a person reaping does
    const along = atTable ? 0 : Math.max(0, Math.min(1, (h - 6) / 14));
    const jz = -40 + Math.sin(along * Math.PI) * 30;
    joanWork.position.set(174 + Math.cos(along * 5.1) * 7, ctx.groundY(174, jz), jz);

    /* THE HANDS. A slow bend-and-straighten, out of phase, and the
     * phase NEVER REACHES THE TOP: pose 2 is the highest any of them
     * gets and its head is still down (THE-STRANGERS C16). */
    for (let i = 0; i < HANDS.length; i++) {
      const [hx, hz, ph] = HANDS[i];
      const w = 0.5 + Math.sin(t * 0.55 + ph) * 0.5;
      const pose = w > 0.72 ? 2 : w > 0.34 ? 1 : 0;
      for (let p = 0; p < 3; p++) {
        if (p === pose && outNow > 0.4) handFields[p].set(i, hx, hz, 0.95, 0, i % 2 === 0);
        else handFields[p].hide(i, hx, hz);
      }
    }

    /* THE SECOND SETTING.
     *
     * It is put away every evening and laid out again every morning,
     * and every player will read it as a small grief, and it is not one
     * (THE-WAITS §10). Once you have sat down it stays out, at every
     * hour, in every save, permanently — the only tableau in this game
     * that gets easier to look at. */
    const kept = knowledge.has('fact:the-place-kept');
    const laid = kept || (h > 5.9 && h < 20.2);
    picnicLaid.visible = laid;
    picnicOne.visible = !laid;

    /* THE FLOCK, ON THE CLOCK, AND THEN THE FLOCK PARTS. */
    const drove = droveAt(h);
    for (let i = 0; i < FLOCK; i++) {
      const s = flock[i];
      if (!s.stub) {
        /* Where the flock is meant to be: a function of the hour, so a
         * walker arriving mid-drove finds it mid-lane. Each sheep sets
         * out `lead` after the one in front and takes the rest of the
         * hour to arrive. */
        const k = Math.max(0, Math.min(1, (drove - s.lead) / (1 - 0.35)));
        const at = lanePos(s, drove >= 1 ? 1 : drove <= 0 ? 0 : k);
        s.x = at[0];
        s.z = at[1];
      }
      const walking = !s.stub && drove > 0 && drove < 1
        && Math.hypot(s.x - s.hx, s.z - s.hz) > 0.05;
      const d = Math.hypot(s.hx - px, s.hz - pz);
      let tx = s.x;
      let tz = s.z;
      if (!s.stub && d < 13) {
        // square off the lane's axis, to whichever hedge is nearer, and
        // never backward: a flock parts, it does not flee
        const push = (1 - d / 13) * 7.5;
        tx = s.x + s.side * push;
        tz = s.z + (s.hz > pz ? 1.5 : -1.5) * (1 - d / 13);
      }
      /* Parting is quick; closing up is slow; and the walk on the clock
       * is taken directly, because a sheep easing toward a target that
       * is itself moving arrives late and never quite gets there — the
       * harness's setHour would have found the flock half a lane short
       * of the field at noon. */
      const k = 1 - Math.exp(-dt * (d < 13 ? 3.2 : walking ? 6.0 : 0.9));
      s.hx += (tx - s.hx) * k;
      s.hz += (tz - s.hz) * k;
      const moving = walking || Math.hypot(tx - s.hx, tz - s.hz) > 0.35;
      const pose = s.stub ? (i % 2 as 0 | 1) : moving ? 3 : ((i % 3) as 0 | 1 | 2);
      for (let p = 0; p < 4; p++) {
        if (p === pose) sheepFields[p].set(i, s.hx, s.hz, 0.85 + (i % 4) * 0.06, 0, s.side < 0);
        else sheepFields[p].hide(i, s.hx, s.hz);
      }
    }

    /* ---- THE UNNAMED (Session 17) ------------------------------------ */
    const rain = weather.state.rain > 0.5;
    miller.tick(h, rain);
    carter.tick(h, rain);
    shepherd.tick(h);

    /* THE HERD PARTS, slowly, and looks up first. At night they lie
     * down — which is one drawing, the grazing one, drawn lower. */
    const lying = events.progress('the-cows-lie-down') >= 0;
    for (let i = 0; i < HERD.length; i++) {
      const c = cowState[i];
      const [x0, z0] = HERD[i];
      const d = Math.hypot(c.hx - px, c.hz - pz);
      let tx = x0;
      let tz = z0;
      if (d < 11 && !lying) {
        const push = (1 - d / 11) * 6;
        tx = x0 + c.side * push;
        tz = z0 + (c.hz > pz ? 1.2 : -1.2) * (1 - d / 11);
      }
      const k = 1 - Math.exp(-dt * (d < 11 ? 1.4 : 0.5));
      c.hx += (tx - c.hx) * k;
      c.hz += (tz - c.hz) * k;
      c.low = Math.max(0, c.low - dt);
      const near = d < 15;
      if (near && c.low <= 0 && !lying) { c.low = 18 + i * 3; if (Math.random() < 0.5) say('cow-low'); }
      cows[i].set(near && !lying ? 1 : 0, c.hx, c.hz, px < c.hx ? -1 : 1, lying ? -0.55 : 0);
    }

    /* THE DOG. */
    const wasFollowing = dog.following;
    dog.tick(dt, px, pz, (x, z) => terrain.blockedAt(x, z));
    if (!wasFollowing && dog.following) say('dog-bark');
    if (dog.justStopped) say('dog-bark');
    dogBark -= dt;
    if (dog.following && dog.pose === 'trot' && dogBark <= 0) { say('dog-bark'); dogBark = 11 + (t % 6); }
    const dp = dog.pose === 'walk' ? 1 : dog.pose === 'trot' ? 2 : dog.atBorder ? 3 : 0;
    dogDrawn.set(dp, dog.x, dog.z, dog.face < 0 ? -1 : 1);

    /* THE ROOKS on the scarecrow, and off it. */
    rookState.up = Math.max(0, rookState.up - dt);
    scarecrowRooks.forEach((c, i) => {
      const rk = rookAt(i, h);
      if (rk.where !== 'downs') { c.hide(); return; }
      if (rk.flying) { c.set(0, rk.x, rk.z, rk.face, rk.lift + Math.sin(t * 9 + i) * 0.25); return; }
      const near = Math.hypot(px - 128, pz - 112) < 6.5;
      if (near && rookState.up <= 0) { rookState.up = 10; say('rook-caw'); }
      if (rookState.up > 0) {
        const u = Math.min(1, (10 - rookState.up) / 1.2) * Math.min(1, rookState.up / 1.2);
        const a = t * 0.8 + i * 2.1;
        c.set(0, rk.x + Math.cos(a) * 9 * u, rk.z + Math.sin(a * 2) * 4 * u, Math.cos(a) > 0 ? 1 : -1, rk.lift + u * (6 + Math.sin(a * 2.4) * 2));
      } else c.set(0, rk.x, rk.z, rk.face, rk.lift);
    });
  };
};

export const DOWNS_POIS: WorldPOI[] = [
  {
    x: 150, z: -8, radius: 9, label: 'THE MILL',
    prompt: 'WATCH THE SAILS',
    note: {
      title: 'the mill',
      body: 'the sails are mid-turn. they were mid-turn when you came over the rise and they will be mid-turn when you look back. the miller is owed one good gust, has been owed it for years, and does not appear to mind.',
    },
  },
  {
    /* THE WAIT, AND IT IS A SIT NOW (Session 15). `SIT DOWN` has been
     * the prompt since Session 10 and it opened a note; the note's
     * reading was what resolved JOAN. It resolves on sitting now — the
     * walker is put on the bench, the camera does not move, the day
     * goes by — and the note is the headland's own, four units off,
     * where the strip is. `fact:the-place-kept` is learned by sitting
     * and by nothing else, which is what `THE-WAITS` §10 always said. */
    x: 140, z: 10, radius: 6,
    prompt: 'SIT DOWN',
    sit: { x: 140.2, z: 10.6, learns: ['fact:the-place-kept'] },
  },
  {
    x: 134.5, z: 12.5, radius: 4, label: 'THE HEADLAND',
    prompt: 'LOOK AT THE TABLE',
    note: {
      title: 'the headland',
      body: 'the strip at the edge of a field, where the plough turns and nothing is sown. there is a table on it, laid for two, and a basket under it with the day in it. the cloth is clean.',
    },
  },
  {
    x: 178, z: -24, radius: 14, label: 'THE HOME FIELD',
    note: {
      title: 'the home field',
      body: 'the corn is cut and stood in sheaves and there are people in it working. none of them looks up, and it is not rudeness: the light goes at eight and there is a field of it.',
    },
  },
  {
    /* THE LABEL SITS LOW AND WEST, and both of those are the mill's
     * fault. Session 9's skyline writes a name above the tallest thing
     * standing UNDER it, which is right, and it cannot know that the
     * ford and the mill are both on the lane's axis with the mill
     * forty units behind — so from anywhere south of the crossing a
     * name written over the ford lands on the mill's tower, at any
     * height that is not absurd. Height does not solve it; ANGLE does.
     * The POI sits at the west end of the stones rather than the middle
     * of them, which is a real place (it is where you step on), and
     * from every viewpoint on the lane it is now twelve to nineteen
     * degrees clear of the mill's silhouette. */
    x: 139, z: 19, radius: 9, label: 'THE FORD', labelHeight: 3.0,
    prompt: 'CROSS ON THE STONES',
    note: {
      title: 'the ford',
      body: 'the river is a hand deep here and the bottom is gravel, so the carts go through it and everybody else goes over on the stones. somebody put the stones in. nobody remembers doing it.',
    },
  },
  {
    x: 101, z: 100, radius: 11, label: 'THE DROVE',
    note: {
      title: 'the drove',
      body: 'a lane worn a foot into the ground between two hedges, which is what a few hundred years of sheep does to a field. the sheep move aside for you and close up again behind. two of them do not move for anybody.',
    },
  },
  {
    x: 128, z: 112, radius: 6, label: 'THE SCARECROW',
    prompt: 'STARE BACK',
    note: {
      title: 'the scarecrow',
      body: 'it has a stitched-on grin and a coat older than the field. you stare. it wins. it was always going to win; it practices.',
    },
  },
];
