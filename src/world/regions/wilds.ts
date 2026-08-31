import * as THREE from 'three';
import {
  splitFinTexture, fallenSlabTexture, wallPanelTexture, markWallTexture,
  needleArchTexture, boatTexture, trestleTexture, holtTexture, holtPlaceTexture,
  bedGravelDecal, driftwoodTexture, kiteTexture,
  panCrustDecal, strandLineDecal, flatsGritDecal, wornTrackDecal,
  saguaroTexture, deadScrubTexture, palmTexture, reedRunTexture,
  cisternTexture, catchFrameTexture, amosTexture, tumbleweedTexture,
  skullTexture, bootTexture, milepostTexture, type Reg as DryReg,
} from '../textures-dry';
import { signpostTexture } from '../textures';
import { tearX, panDist } from '../elevation';
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
import { clock } from '../daylight';
import { knowledge } from '../knowledge';
import type { RegionBuilder, WorldPOI } from './index';

/** Fire a named audio event up to the App without a plumbing run. */
function say(name: string) {
  window.dispatchEvent(new CustomEvent('inklands:event', { detail: name }));
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
    brackWatch.visible = !turned;
    brackTurn.visible = turned;

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
 * SPLITROCK CANYON — a hole in the page, and the only land in this
 * world whose middle is empty and whose edges are the event.
 *
 * Session 11, to design/specs/splitrock-canyon.md. THE-WAITS §4 is the
 * brief and it is one sentence: **the marks are a list, in the order
 * things would float, and the game never says whether Holt is mad or
 * ready.**
 *
 * THE GROUND WAS AUTHORED FIRST AND IT IS MOST OF THE LAND. Session 4
 * cut the tear at x = 338, forty units off the world's curled margin,
 * and this session moved it to 300 — the middle of its own rect — and
 * gave it two ends: a head that ramps in from the north and a mouth
 * that ramps in from the south, with ten units of unclimbable wall
 * everywhere else. So the corridor, the two ways in, the recession and
 * the drama are all in `elevation.ts`, and everything below is what
 * stands on the floor of it.
 *
 * The draft this replaces was six mesas ranked along the north edge at
 * twenty-four-unit spacing, four more at the world's rim (in a
 * protected framing's far field, which nobody had noticed), a
 * forty-six-boulder Poisson scatter and fourteen cacti. All of it is
 * cut. The rule that replaces it:
 *
 *   **NOTHING HERE IS SCATTERED. The page tore, and everything in this
 *   land is either a piece that came off the edge or a thing one man
 *   carried down.**
 * ================================================================== */

/** The channel's axis at z, and a point across it. The floor is six
 *  units either side of the axis; past that is wall. */
const chan = (z: number, u = 0): [number, number] => [tearX(z) + u, z];

/** THE FINS — three runs on three bearings, on the west bench. A group
 *  of split rock is PARALLEL or it is wrong: rock splits along its
 *  bedding the way paper tears along its fibres, so each run is one
 *  line and the three lines disagree with each other. The voids between
 *  them are as authored as the runs. */
/* AND EVERY RUN GOES NORTH, which round 1 of the world sheet did not:
 * it laid them east-west off a bearing and pushed half the fins across
 * the canyon and out onto the far rim. Two rules meet here and they
 * agree — the camera's (a thing you LOOK at recedes north away from you,
 * so a group seen in depth has to run that way) and the rock's (a
 * fracture set is parallel). The lean off north is small and it is a
 * DIFFERENT small for each run, which is what stops three parallel
 * groups reading as one grid. */
const FIN_RUNS: { x: number; z: number; lean: number; n: number; step: number; s: number }[] = [
  { x: 252, z: -150, lean: -0.10, n: 7, step: 14, s: 1.0 },
  { x: 262, z: -126, lean: -0.05, n: 6, step: 13, s: 0.8 },
  { x: 240, z: -196, lean: 0.05, n: 5, step: 12, s: 0.9 },
  // and three on the north rim, so the head has a horizon rather than a
  // beige void: they are the far register and they are barely there
  { x: 292, z: -272, lean: 0.9, n: 3, step: 17, s: 0.62 },
];

const BOAT = { x: 310, z: -226 };
const MARKS = { x: 314.5, z: -216 };
/* HOLT'S PLACE IS DUE NORTH OF HIS BOAT, and it is the second time this
 * session that the camera's law decided a placement rather than
 * commented on one. Round 1 put it out on the east bench, thirty
 * degrees off the channel's axis — inside desktop's field of view by
 * three degrees and a long way outside portrait's, so half the players
 * in the world would never have seen the thing the marks are measured
 * against. It stands on the north rim above the head instead, straight
 * up the channel from the boat, and the walk up the trail ends at it. */
const HOLTS = { x: 300, z: -252 };

export const buildCanyon: RegionBuilder = (ctx) => {
  const { r, terrain } = ctx;

  /* ---- THE BENCHES: the fins ------------------------------------- *
   * Four shared drawings over twenty-odd instances, in three registers.
   * Session 10's law: share drawings, instance placements — a hundred
   * and forty unique canvases for the hedges of one land was thirty-two
   * megabytes and it cost that session a performance round.           */
  const finTex: [THREE.Texture, DryReg][] = [
    [splitFinTexture(7100, 0), 0],
    [splitFinTexture(7101, 1), 1],
    [splitFinTexture(7102, 1), 1],
    [splitFinTexture(7103, 2), 2],
  ];
  /* AND THE SIZES ARE CALIBRATED OFF A PERSON, which round 1 of the
   * world sheet was not. A doodle-folk figure in this game is 1.7 units
   * wide and 2.75 tall (Brack, Joan, Hallows), so the tear is four
   * people deep and a fin on the bench is three or four of them — not
   * the twenty-two-unit tower round 1 shipped, which made the canyon a
   * quarry full of shipping containers and put a rank of what read as
   * houses along its rim. Everything in these two lands is now sized
   * against 2.75, and it is written here because it is the number the
   * next session will get wrong. */
  const finFields = finTex.map(([tex, reg]) =>
    ctx.field(tex, 12, { w: 9.5 - reg * 1.6, h: 9 - reg * 1.5 }));
  const finCount = new Array(4).fill(0);
  for (const run of FIN_RUNS) {
    for (let i = 0; i < run.n; i++) {
      // along the run, with the spacing itself uneven — a fracture set
      // is parallel, it is not regular
      const d = i * run.step + (r() - 0.5) * 5;
      const x = run.x + Math.sin(run.lean) * d + (r() - 0.5) * 7;
      const z = run.z - Math.cos(run.lean) * d + (r() - 0.5) * 6;
      if (terrain.slopeAt(x, z) > 0.4) continue;
      /* AND NOTHING TALL STANDS WHERE THE LENS IS. Round 2 of the world
       * sheet had two near-register fins within five units of the trail
       * on the west bench and the frame was two transparent brown crates
       * — the Penwood's law, restated: full ballpoint pressure and full
       * height belong to things you walk PAST, never to things you walk
       * THROUGH. */
      if (terrain.roadAt(x, z)) continue;
      // the near register is for the ones you walk past, and there are
      // never more than two of those in a run
      const k = i === 1 ? 0 : i === run.n - 1 ? 3 : 1 + (i % 2);
      const f = finFields[k];
      const idx = finCount[k]++;
      if (idx >= 12) continue;
      f.set(idx, x, z, run.s * (0.5 + r() * 0.95), 0, r() > 0.5);
    }
  }
  for (let k = 0; k < 4; k++) {
    for (let i = finCount[k]; i < 12; i++) finFields[k].hide(i, FIN_RUNS[0].x, FIN_RUNS[0].z);
  }

  /* ---- THE FLOOR: gravel, sorted across the channel ---------------- *
   * Coarse at the feet of the walls, fine down the centreline. It is
   * the only thing in the canyon that says water was ever here, and it
   * says it without a drop and without a word.                        */
  const gravel = [0, 1, 2].map((g) =>
    ctx.field(bedGravelDecal(7900 + g, g as 0 | 1 | 2), 16, {
      w: 7.5, h: 7.5, decal: true, baseOpacity: 0.85,
    }));
  const gCount = [0, 0, 0];
  for (let z = -224; z <= -122; z += 4.5) {
    for (const u of [-7.5, -3.4, 0.6, 4.2, 7.8]) {
      const [x, zz] = chan(z + (r() - 0.5) * 3, u + (r() - 0.5) * 2.2);
      const g = Math.abs(u) > 6 ? 0 : Math.abs(u) > 3 ? 1 : 2;
      if (gCount[g] >= 16) continue;
      gravel[g].set(gCount[g]++, x, zz, 0.85 + r() * 0.5, r() * Math.PI, r() > 0.5);
    }
  }
  for (let g = 0; g < 3; g++) {
    for (let i = gCount[g]; i < 16; i++) gravel[g].hide(i, ...chan(-180, 0));
  }

  /* ---- THE FALLEN: slabs, and they get bigger toward the walls ----- *
   * Because that is where they came from. Nothing lies in the middle of
   * the bed except gravel.                                            */
  const slabs = [0, 1].map((k) =>
    ctx.field(fallenSlabTexture(7200 + k, 1), 9, {
      w: k === 0 ? 4.6 : 3.0, h: k === 0 ? 2.0 : 1.3,
    }));
  const sCount = [0, 0];
  for (let i = 0; i < 9; i++) {
    const z = -222 + r() * 96;
    const side = r() > 0.5 ? 1 : -1;
    const u = side * (4.4 + r() * 3.4);
    const [x, zz] = chan(z, u);
    const k = Math.abs(u) > 6 ? 0 : 1;
    if (sCount[k] >= 9) continue;
    slabs[k].set(sCount[k]++, x, zz, 0.7 + r() * 0.6, (r() - 0.5) * 0.7, side < 0);
  }
  for (let k = 0; k < 2; k++) {
    for (let i = sCount[k]; i < 9; i++) slabs[k].hide(i, ...chan(-180, 0));
  }

  /* ---- THE WALLS, where the corridor bends ------------------------ *
   * The height field draws the canyon's faces in hatching down their
   * fall line, which is what makes them a cliff. These are what makes
   * them a cliff somebody DREW: eight panels at the two places the
   * channel turns, standing at the wall's foot with their ends erased
   * so a run reads as one face and not as a row of cards.             */
  /* AND THEY ARE DECALS, NOT STAND-UPS, which is the whole difference
   * between round 1 and this one. A wall panel stood on the floor at the
   * cliff's foot is a flat card hanging in the air in front of a slope —
   * round 1's sheet had eight of them and they read as scaffolding.
   * `ctx.decal` lays a mark along the page's own SURFACE NORMAL, so on a
   * sixty-degree wall the drawing lies ON the wall. It is what
   * `lieOnGround` was built for and no land had ever needed it on
   * anything but the flat. */
  const walls = [0, 1].map((k) =>
    ctx.field(wallPanelTexture(7300 + k, 1), 7, {
      w: 9, h: 12, decal: true, baseOpacity: 0.5,
    }));
  const wCount = [0, 0];
  for (const [z0, side] of [[-214, 1], [-202, 1], [-188, -1], [-176, -1],
    [-162, -1], [-150, 1], [-232, -1], [-140, -1], [-196, 1],
    [-168, 1], [-222, 1], [-158, -1]] as [number, number][]) {
    const [x, zz] = chan(z0, side * 11.5);
    if (terrain.slopeAt(x, zz) < 0.6) continue;
    const k = wCount[0] <= wCount[1] ? 0 : 1;
    if (wCount[k] >= 7) continue;
    walls[k].set(wCount[k]++, x, zz, 0.9 + r() * 0.3, side > 0 ? -0.3 : 0.3, side < 0);
  }
  for (let k = 0; k < 2; k++) {
    for (let i = wCount[k]; i < 7; i++) walls[k].hide(i, ...chan(-180, 0));
  }

  /* ---- THE DRIFTWOOD, on the east bench, at the lip's height ------ *
   * Thirteen units above the floor, a very long way from any water, and
   * nothing in this game will ever mention it.                        */
  const drift = ctx.field(driftwoodTexture(7950), 3, { w: 3.2, h: 1.2 });
  [[330, -204], [336, -178], [327, -158]].forEach(([x, z], i) =>
    drift.set(i, x, z, 0.8 + r() * 0.4, (r() - 0.5) * 1.2, r() > 0.5));

  /* ---- THE LIP, and the head's own stones -------------------------- *
   * Four slabs on the east lip where the walk along it goes, and three
   * at the head, so neither of those two places is a label standing in
   * an empty frame. They are the FAR register: what they are for is a
   * silhouette against the sky at the edge of a drop.               */
  const lipStones = ctx.field(fallenSlabTexture(7210, 2), 8, { w: 3.4, h: 1.5 });
  ([[321, -170], [323, -152], [318, -140], [325, -184],
    [300, -244], [311, -246], [294, -240], [308, -256]] as [number, number][])
    .forEach(([x, z], i) => lipStones.set(i, x, z, 0.8 + r() * 0.6, (r() - 0.5) * 1.4, r() > 0.5));

  /* ---- THE NEEDLE -------------------------------------------------- *
   * A slot worn through a standing block at the channel's west edge,
   * and you can walk under it, which is the whole of why it is here.  */
  ctx.standee(needleArchTexture(7500), 7.6, 5.8, ...chan(-168, -6.2), { rotY: 0.16 });

  /* ================================================================ *
   * HOLT.
   *
   * THE-WAITS §4. He keeps a boat, upside down, on trestles, at the top
   * of the dry channel, and it is oiled. The marks up the wall beside
   * it are not flood records — **they are a list, in the order things
   * would float**, and the boat is at the bottom of it.
   *
   * NOTHING SAYS ANY OF THAT. What the land does instead is put three
   * things in one frame and let the arithmetic happen:
   *
   *   · the boat, on the floor, at −9.7;
   *   · THE MARKS, on the east wall beside it — two low and close
   *     together, then a long blank stretch, then three at the top;
   *   · and HOLT'S PLACE, on the bench over the lip, whose DOORSTEP is
   *     at y = 4.12 while the fourth chalk mark on the wall below comes
   *     out at y = 4.10.
   *
   * Two centimetres. The mark is level with the doorstep because the
   * man measured it, and the only help the game gives is that you can
   * see both of them at once.
   * ================================================================ */
  const boatOver = ctx.standee(boatTexture(7600, true), 6.2, 3.2, BOAT.x, BOAT.z, { rotY: -0.22 });
  // she sits ON the trestles, so she is lifted off the stone and their
  // legs show under her: a boat resting on the ground and a boat kept
  // out of the weather are two different pictures
  boatOver.position.y += 1.25;
  const boatUp = ctx.standee(boatTexture(7601, false), 6.2, 3.3, BOAT.x, BOAT.z + 2.2, { rotY: -0.18 });
  const trestles = ctx.standee(trestleTexture(7602), 3.4, 2.3, BOAT.x, BOAT.z, { rotY: -0.22 });
  // 17 units of wall standing on a floor at −10.14: the marks land where
  // the numbers above say they land, and check-fields walks up to them
  /* 13.56 UNITS OF SLAB ON A FLOOR AT −10.24, AND EVERY NUMBER IN IT IS
   * LOAD-BEARING.
   *
   *   · the top comes out at 3.32, which is a unit BELOW the rim — so
   *     the slab never breaks the skyline, and reads as a face of the
   *     canyon rather than as a chimney standing in it. Four rounds of
   *     the world sheet were spent finding that out;
   *   · the fourth chalk mark comes out at y = 2.69, and the ground
   *     HOLT's doorstep stands on at (300, −252) is 2.694;
   *   · and the LOWEST mark comes out at 0.6 of a unit above the
   *     channel floor — which is the waterline of a boat sitting on the
   *     stone, not of one up on trestles. **The bottom of the list
   *     describes where the boat is not, and the wait is what puts her
   *     there.** Nothing says so. */
  ctx.standee(markWallTexture(7400), 6.0, 13.56, MARKS.x, MARKS.z, { rotY: -0.42 });
  ctx.standee(holtPlaceTexture(7800), 13, 6.0, HOLTS.x, HOLTS.z, { rotY: 0.06 });

  const holtWork = ctx.standee(holtTexture(7700, true), 1.9, 2.8, BOAT.x - 4, BOAT.z);
  const holtStand = ctx.standee(holtTexture(7701, false), 1.75, 2.8, BOAT.x - 4, BOAT.z);
  holtStand.visible = false;

  /* ---- THE KITE, and it is the only thing in the strip of sky ----- */
  const kite = ctx.standee(kiteTexture(7960), 1.5, 1.0, ...chan(-180, 0));
  kite.position.y = ctx.groundY(...chan(-180, 0)) + 26;

  /* ---- THE DUST, hanging in the light between the walls ----------- *
   * Four motes, and they are one-off meshes rather than a field because
   * a field stands its instances ON the ground and these are in the
   * air. Four draw calls for the second idle motion in a land whose
   * whole subject is stillness is a bargain.                          */
  const motes = [0, 1, 2, 3].map((i) => {
    const [x, z] = chan(-206 + i * 22, (i % 2 ? 4 : -4));
    const m = ctx.standee(bedGravelDecal(7970 + i, 2), 1.4, 1.4, x, z, { opacity: 0.2 });
    m.position.y = ctx.groundY(x, z) + 3.5 + i * 1.6;
    return { m, x, z, y0: m.position.y, ph: i * 1.9 };
  });

  /* ---- THE WALLS LET GO, and it is the land's answer to the player - *
   * Come within fourteen units of a wall's foot on the channel floor
   * and a few stones come off above you and find the bottom — and it
   * fires `stone-fall`, which the canyon's own room says again a beat
   * later. It is the only land besides the Penwood that answers you,
   * and this is the one where you can see it as well as hear it.      */
  const pebbles = [0, 1, 2].map((i) =>
    ctx.standee(bedGravelDecal(7980 + i, 2), 0.8, 0.8, ...chan(-190, 6), { opacity: 0 }));
  const fall = { t: -1, cool: 0, x: 0, z: 0, top: 0 };

  return (dt: number, t: number, px: number, pz: number) => {
    /* THE BOAT COMES OFF THE TRESTLES.
     *
     * You have rowed the river, salt to source, under all three bridges,
     * and you are the only thing in this world that has. Come up the
     * canyon holding the route and the boat is on the ground, right way
     * up, on dry stone, and the trestles are still there and they are
     * empty. **The game never says whether that is madness or
     * readiness**, and the empty trestles are the half that makes it a
     * question rather than an announcement. */
    const launched = knowledge.has('route:the-river');
    boatOver.visible = !launched;
    boatUp.visible = launched;
    void trestles;

    /* HOLT WORKS THE HULL, out and back, all day, in one of two
     * drawings — and after the boat comes down he does exactly the same
     * thing to a boat that is the right way up. */
    const lap = 26;
    const u = (t % lap) / lap;
    const swing = u < 0.5 ? u * 2 : 2 - u * 2;
    const hx = BOAT.x - 6.2 + swing * 5.6;
    const hz = BOAT.z + (launched ? 3.4 : 0) + 1.2;
    const reaching = swing > 0.22 && swing < 0.86;
    for (const m of [holtWork, holtStand]) m.position.set(hx, ctx.groundY(hx, hz), hz);
    holtWork.visible = reaching;
    holtStand.visible = !reaching;

    /* THE KITE turns on a slow ellipse it never leaves. */
    const ka = t * 0.19;
    const kx = tearX(-186) + Math.cos(ka) * 15;
    const kz = -186 + Math.sin(ka) * 34;
    kite.position.set(kx, ctx.groundY(...chan(-186, 0)) + 25 + Math.sin(t * 0.4) * 2.2, kz);
    kite.rotation.y = -ka * 0.4;

    /* THE DUST hangs, and drifts, and does not settle. */
    for (const d of motes) {
      d.m.position.set(
        d.x + Math.sin(t * 0.31 + d.ph) * 1.9,
        d.y0 + Math.sin(t * 0.22 + d.ph * 1.7) * 1.1,
        d.z + Math.cos(t * 0.24 + d.ph) * 1.4
      );
    }

    /* THE WALLS LET GO. */
    fall.cool -= dt;
    if (fall.t < 0 && fall.cool <= 0) {
      const off = px - tearX(pz);
      if (pz > -230 && pz < -128 && Math.abs(off) > 3.6 && Math.abs(off) < 9) {
        const side = Math.sign(off);
        fall.x = tearX(pz - 16) + side * 8.5;
        fall.z = pz - 16;
        fall.top = ctx.groundY(fall.x + side * 12, fall.z) + 1.5;
        fall.t = 0;
        say('stone-fall');
      }
    }
    if (fall.t >= 0) {
      fall.t += dt;
      const floorY = ctx.groundY(fall.x, fall.z);
      for (let i = 0; i < 3; i++) {
        const tt = Math.max(0, fall.t - i * 0.18);
        const y = fall.top - 9.8 * 0.5 * tt * tt * 1.4;
        const done = y <= floorY;
        pebbles[i].position.set(fall.x + i * 0.8 - 0.8, done ? floorY + 0.3 : y, fall.z + i * 0.6);
        (pebbles[i].material as THREE.MeshBasicMaterial).opacity = done ? 0 : 0.85;
      }
      if (fall.t > 2.4) {
        fall.t = -1;
        fall.cool = 7 + Math.random() * 9;
        for (const p of pebbles) (p.material as THREE.MeshBasicMaterial).opacity = 0;
      }
    }
  };
};

export const CANYON_POIS: WorldPOI[] = [
  {
    x: 301, z: -104, radius: 9, label: 'THE RIVERHEAD',
    note: {
      title: 'the riverhead',
      body: 'this is where it starts. you could stand with one foot either side of it. two hundred paces down it is a river with bridges on it and a boat, and here it is a wet patch under a stone, and it has been doing this the whole time.',
    },
  },
  {
    x: 292, z: -152, radius: 12, label: 'THE DRY CHANNEL',
    note: {
      title: 'the dry channel',
      body: 'flat, all the way. the stones are big at the sides and small down the middle, which is what water does, and there has not been any for longer than anybody can say. it is the easiest walking in the land and nobody uses it.',
    },
  },
  {
    x: 291, z: -168, radius: 8, label: 'THE NEEDLE',
    prompt: 'STAND UNDER IT',
    note: {
      title: 'the needle',
      body: 'a hole worn through solid rock by nothing but weather and insistence. you stand under it. it holds. it has been holding since before anything out here was named.',
    },
  },
  {
    x: 311, z: -213, radius: 9, label: 'THE MARKS',
    note: {
      title: 'the marks',
      body: 'somebody has been up this wall with a piece of chalk. the marks are level, which takes doing, and they have been gone over. the top one is level with the doorstep up there.',
    },
  },
  {
    x: 303, z: -228, radius: 10, label: 'THE BOAT',
    note: {
      title: 'the boat',
      body: 'upside down on trestles, out of the weather, oiled this week. the nearest water is about a foot wide and a hundred paces down the canyon, and it is going the other way.',
    },
  },
  {
    x: 303, z: -248, radius: 11, label: 'THE HEAD',
    note: {
      title: 'the head',
      body: 'the canyon starts here, or stops here, depending which way you came. the ground just leans. a hundred paces on there are two walls over your head and you never noticed either of them arrive.',
    },
  },
  {
    /* IT WAS 'THE EAST RIM' AT (358, −196) AND IT WAS AN EMPTY BEIGE
     * FRAME, because from out there the canyon is due WEST and the
     * camera looks north. The place was right and the standing point was
     * ninety degrees wrong. On the lip the cut falls away at your feet
     * and runs north, which is the same view and is a composition. */
    x: 320, z: -158, radius: 11, label: 'THE LIP',
    note: {
      title: 'the lip',
      body: 'the edge, where the ground stops being ground. it runs away north and gets deeper as it goes and you can see the bottom of it the whole way. behind your other shoulder the world goes up and then stops.',
      learns: ['name:desert'],
    },
  },
];

/* ================================================================== *
 * THE BLEACH FLATS — the flattest ground in the world, and the only
 * land whose whole thesis is that the answer is somewhere else.
 *
 * Session 11, to design/specs/the-bleach-flats.md. THE-WAITS §5: **the
 * cistern is full, it has always been full, and AMOS is not faking a
 * rainfall — he is keeping the thing that catches rain in working
 * order.**
 *
 * The draft this replaces was sixty dune decals on a Poisson scatter,
 * forty-two saguaros on another, two loose skulls and eight tumbleweeds
 * that marched east at 2.2 + i × 0.24 units a second and teleported
 * back to x = 236, which is an array that moves and is worse than an
 * array that does not. All of it is cut. The rule that replaces it:
 *
 *   **NOTHING IN THE FLATS IS SCATTERED. Everything loose has been
 *   SORTED, and it has been sorted the same way, by the same wind, for
 *   a very long time.**
 *
 * So every field in this land is placed on a RING of `panDist` — a
 * strand line, a place a wash stopped — or along AMOS's track, and the
 * ground between the rings is bare because things have been taken off
 * it rather than because nothing was put there.
 * ================================================================== */

const OASIS = { x: 305, z: 55 };
const CATCH = { x: 301, z: 95 };
/** Where the wash stopped, and stopped again, and stopped again. */
const STRANDS = [30, 44, 58];

/** A point on a strand line, by angle. */
const strandPt = (ring: number, a: number): [number, number] =>
  [272 + Math.cos(a) * ring, 58 + (Math.sin(a) * ring) / 0.78];

export const buildDesert: RegionBuilder = (ctx) => {
  const { r, terrain, rect } = ctx;

  const inLand = (x: number, z: number) =>
    x > rect.minX + 10 && x < 336 && z > rect.minZ + 8 && z < rect.maxZ - 8;

  /* ---- THE PAN's floor -------------------------------------------- */
  const crust = [0, 1].map((k) =>
    ctx.field(panCrustDecal(8000 + k), 18, { w: 10, h: 10, decal: true, baseOpacity: 0.9 }));
  const cCount = [0, 0];
  for (let i = 0; i < 36; i++) {
    const a = r() * Math.PI * 2;
    const d = Math.pow(r(), 0.6) * 28;
    const [x, z] = strandPt(d, a);
    if (!inLand(x, z) || terrain.waterAt(x, z) > 0.03) continue;
    const k = cCount[0] <= cCount[1] ? 0 : 1;
    if (cCount[k] >= 18) continue;
    crust[k].set(cCount[k]++, x, z, 0.9 + r() * 0.5, r() * Math.PI, r() > 0.5);
  }
  for (let k = 0; k < 2; k++) {
    for (let i = cCount[k]; i < 18; i++) crust[k].hide(i, 272, 58);
  }

  /* ---- THE STRAND LINES ------------------------------------------- *
   * Three rings, laid end to end with their ends erased, each one a
   * place the water stopped. The land is a diagram of something
   * leaving, and it is the only thing in the Flats that is a shape
   * rather than a colour.                                             */
  const strand = [0, 1].map((k) =>
    ctx.field(strandLineDecal(8100 + k), 22, { w: 13, h: 3.4, decal: true, baseOpacity: 1 }));
  const stCount = [0, 0];
  for (let s = 0; s < STRANDS.length; s++) {
    const ring = STRANDS[s];
    const n = 13 + s * 4;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + s * 0.4;
      const [x, z] = strandPt(ring + (r() - 0.5) * 3, a);
      if (!inLand(x, z) || terrain.waterAt(x, z) > 0.03 || terrain.roadAt(x, z)) continue;
      const k = stCount[0] <= stCount[1] ? 0 : 1;
      if (stCount[k] >= 22) continue;
      // laid ALONG the ring, so a run of them is one line
      strand[k].set(stCount[k]++, x, z, 0.85 + r() * 0.4, -a + Math.PI / 2, r() > 0.5);
    }
  }
  for (let k = 0; k < 2; k++) {
    for (let i = stCount[k]; i < 22; i++) strand[k].hide(i, 272, 58);
  }

  /* ---- THE GRIT, everywhere, on one bearing ------------------------ */
  const grit = ctx.field(flatsGritDecal(8200), 34, {
    w: 12, h: 12, decal: true, baseOpacity: 0.85,
  });
  const gp = ctx.scatter(34, { minDist: 13, avoid: (x, z) => x > 334 || panDist(x, z) < 20 });
  gp.forEach(([x, z], i) => grit.set(i, x, z, 1, 0.14, false));
  for (let i = gp.length; i < 34; i++) grit.hide(i, 260, 20);

  /* ---- AMOS'S TRACK ------------------------------------------------ *
   * The only line on the ground in a hundred and fifty units, and it
   * has two edges. It is THE SHOT's subject: a look straight up it, and
   * the green at the end of it forty units off.                       */
  const track = [0, 1].map((k) =>
    ctx.field(wornTrackDecal(8300 + k), 6, { w: 3.4, h: 4.6, decal: true, baseOpacity: 0.95 }));
  const tCount = [0, 0];
  for (let i = 0; i <= 10; i++) {
    const t = i / 10;
    const x = CATCH.x + (OASIS.x - CATCH.x) * t + Math.sin(t * 4.1) * 1.1;
    const z = CATCH.z + (OASIS.z - CATCH.z) * t;
    const k = tCount[0] <= tCount[1] ? 0 : 1;
    if (tCount[k] >= 6) continue;
    track[k].set(tCount[k]++, x, z, 1, Math.atan2(OASIS.x - CATCH.x, OASIS.z - CATCH.z), false);
  }
  for (let k = 0; k < 2; k++) {
    for (let i = tCount[k]; i < 6; i++) track[k].hide(i, CATCH.x, CATCH.z);
  }

  /* ---- THE THREE SAGUAROS ------------------------------------------ *
   * In a row, on the pan's outer strand line, and they are the only
   * things in the land taller than a knee outside the oasis. Three, in
   * a line, is not an array — it is a fact about where water was.     */
  const sag = [0, 1].map((k) => ctx.field(saguaroTexture(8400 + k, 2 - k), 3, { w: 2.3, h: 4.7 }));
  const sagAt: [number, number][] = [
    strandPt(STRANDS[2], -1.16), strandPt(STRANDS[2], -0.86), strandPt(STRANDS[2], -0.56),
  ];
  sagAt.forEach(([x, z], i) => {
    const f = sag[i % 2];
    const idx = Math.floor(i / 2);
    f.set(idx, x, z, 0.82 + i * 0.1, 0, i === 1);
  });
  sag[1].hide(1, sagAt[0][0], sagAt[0][1]);
  sag[0].hide(2, sagAt[0][0], sagAt[0][1]);
  sag[1].hide(2, sagAt[0][0], sagAt[0][1]);

  /* ---- THE DEAD SCRUB, on the strand lines and nowhere else ------- *
   * It carries the land's shimmer: a very small, very fast `wind` at a
   * hundred units reads as heat rather than as movement.              */
  const scrub = [0, 1, 2].map((k) =>
    ctx.field(deadScrubTexture(8500 + k), 12, {
      w: 1.9, h: 1.4, wind: { amp: 0.055, freq: 3.1 },
    }));
  const scCount = [0, 0, 0];
  for (let s = 0; s < STRANDS.length; s++) {
    for (let i = 0; i < 13; i++) {
      const a = r() * Math.PI * 2;
      const [x, z] = strandPt(STRANDS[s] + (r() - 0.5) * 6, a);
      if (!inLand(x, z) || terrain.waterAt(x, z) > 0.03 || terrain.roadAt(x, z)) continue;
      const k = s;
      if (scCount[k] >= 12) continue;
      scrub[k].set(scCount[k]++, x, z, 0.7 + r() * 0.6, 0, r() > 0.5);
    }
  }
  for (let k = 0; k < 3; k++) {
    for (let i = scCount[k]; i < 12; i++) scrub[k].hide(i, 272, 58);
  }

  /* ---- THE OASIS --------------------------------------------------- *
   * A single dense knot, twelve units across, and it is the only knot
   * in a hundred and fifty units. Full ballpoint pressure lives here
   * and in Amos's guttering and nowhere else in the land.             */
  const palms: [number, number, number][] = [
    [297, 48, 0.22], [313, 50, -0.3], [307, 65, 0.12], [296, 62, -0.18], [316, 61, 0.3],
  ];
  const palmTex = [palmTexture(8600, 0.2), palmTexture(8601, -0.35)];
  const palmField = [0, 1].map((k) =>
    ctx.field(palmTex[k], 3, { w: 4.8, h: 7.6, wind: { amp: 0.11, freq: 0.7 } }));
  palms.forEach(([x, z], i) => {
    const f = palmField[i % 2];
    f.set(Math.floor(i / 2), x, z, 0.86 + (i % 3) * 0.1, 0, i % 3 === 1);
  });
  palmField[1].hide(2, palms[0][0], palms[0][1]);
  /* AND THE REEDS GO ALL THE WAY ROUND, because round 1 of the world
   * sheet had the water reading as a swimming pool: a flat blue ellipse
   * on flat pale sand with five tufts beside it. The hollow in
   * `elevation.ts` does half the work and this does the other half — a
   * closed ring of uprights at the waterline, ends erased, so the edge
   * of the water is a DRAWN edge and not a shape. */
  const reeds = ctx.field(reedRunTexture(8700), 11, {
    w: 5.2, h: 1.9, wind: { amp: 0.08, freq: 1.4 },
  });
  for (let i = 0; i < 11; i++) {
    const a = (i / 11) * Math.PI * 2 + 0.4;
    const rr = 11.0 + (i % 3) * 0.9;
    const x = OASIS.x + Math.cos(a) * rr;
    const z = OASIS.z + Math.sin(a) * rr;
    reeds.set(i, x, z, 0.85 + r() * 0.35, -a + Math.PI / 2, r() > 0.5);
  }

  /* ================================================================ *
   * AMOS.
   *
   * THE-WAITS §5. The rain-catch is in good order. The cistern is full.
   * It has always been full. He carries the water forty units from the
   * oasis by hand, at night, because it is cooler, and there is nobody
   * out here to fool.
   *
   * NOTHING SAYS ANY OF THAT EITHER. What the land does is put him on
   * the track after the light goes, with a yoke, every night — and if
   * you never come out here after dark you will simply think the
   * cistern is full. The day cycle has never earned its keep harder
   * than it does here.
   * ================================================================ */
  ctx.standee(catchFrameTexture(8900), 5.4, 4.4, CATCH.x + 2.2, CATCH.z + 0.9, { rotY: -0.22 });
  const lidOn = ctx.standee(cisternTexture(8800, false), 2.2, 1.8, CATCH.x, CATCH.z);
  const lidOff = ctx.standee(cisternTexture(8801, true), 2.2, 1.8, CATCH.x, CATCH.z);
  lidOff.visible = false;
  const amosWalk = ctx.standee(amosTexture(9000, true), 2.2, 2.8, CATCH.x - 2, CATCH.z - 3);
  const amosStand = ctx.standee(amosTexture(9001, false), 1.8, 2.8, CATCH.x - 1.7, CATCH.z + 1.4);

  /* ---- SOMEBODY'S LONG WALK ---------------------------------------- *
   * A skull and one boot, forty units apart, both pointing the same
   * way. It is the only joke in either of these two lands and it is not
   * funny.                                                             */
  ctx.standee(skullTexture(9200), 1.15, 0.9, 288, -34, { rotY: 0.3 });
  ctx.standee(bootTexture(9300), 0.6, 0.6, 286, -74, { rotY: 0.3 });
  ctx.standee(milepostTexture(9400), 2.6, 3.7, 248, 12, { rotY: -0.2 });

  /* ---- THE DRIFT --------------------------------------------------- *
   * Four weeds, each with its own life. They hang up on scrub and then
   * go, they all go the same way as everything else that is loose out
   * here, and coming near a hung-up one sets it off — which is the only
   * thing in this land that reacts to a person.                       */
  const weeds = ctx.field(tumbleweedTexture(9100), 4, { w: 1.3, h: 1.3 });
  const drift = [0, 1, 2, 3].map((i) => ({
    x: 244 + i * 24, z: -60 + i * 44, spin: 0, hold: 2 + i * 3.4, speed: 0,
  }));
  drift.forEach((d, i) => weeds.set(i, d.x, d.z, 0.7 + (i % 3) * 0.18, 0, false));

  return (dt: number, t: number, px: number, pz: number) => {
    void t;
    /* THE LID COMES OFF.
     *
     * You have walked the crease — both faces of the world's one real
     * fold, which is where any water on this sheet would actually go —
     * and you have carried that two hundred units east over a border
     * nobody but you may cross. The lid is off the cistern, leaning
     * against it, and it stays off. He has decided to find out.
     * **The game does not say whether that is despair or nerve.** */
    const opened = knowledge.has('fact:the-fold');
    lidOn.visible = !opened;
    lidOff.visible = opened;

    /* HIS DAY, AND HIS NIGHT.
     *
     * By day he is at the catch with one hand on the frame, which is
     * the pose of a man checking a thing he has already checked. After
     * the light goes he is on the track with the yoke, going one way or
     * the other, and it takes him a long time because it is heavy. */
    const h = clock.hour;
    const night = h < 5.4 || h > 20.4;
    amosStand.visible = !night;
    amosWalk.visible = night;
    if (night) {
      // one round trip an hour, and he is never at either end for long
      const u = ((h < 5.4 ? h + 24 : h) - 20.4) % 1;
      const along = u < 0.5 ? u * 2 : 2 - u * 2;
      const ax = CATCH.x + (OASIS.x - CATCH.x) * along;
      const az = CATCH.z + (OASIS.z + 12 - CATCH.z) * along;
      amosWalk.position.set(ax, ctx.groundY(ax, az), az);
      // he faces the way he is going, which is north half the night
      amosWalk.rotation.y = u < 0.5 ? 0 : 0;
    }

    /* THE DRIFT. */
    for (let i = 0; i < drift.length; i++) {
      const d = drift[i];
      const near = Math.hypot(d.x - px, d.z - pz) < 11;
      if (d.hold > 0) {
        d.hold -= dt * (near ? 6 : 1);
        if (d.hold <= 0) d.speed = 3.4 + i * 0.8;
      } else {
        d.speed = Math.max(0, d.speed - dt * 0.55);
        d.x += dt * d.speed * 0.96;
        d.z += dt * d.speed * 0.28;
        d.spin -= dt * (0.7 + d.speed * 0.5);
        if (d.speed <= 0.05) d.hold = 6 + Math.random() * 14;
        if (d.x > 332 || d.z > 124) {
          d.x = 240 + Math.random() * 14;
          d.z = rect.minZ + 10 + Math.random() * 40;
          d.hold = 4 + Math.random() * 10;
        }
      }
      weeds.set(i, d.x, d.z, 0.7 + (i % 3) * 0.18, d.spin, false);
    }
  };
};

export const DESERT_POIS: WorldPOI[] = [
  {
    x: 248, z: 12, radius: 8, label: 'THE MILEPOST',
    prompt: 'READ IT',
    note: {
      title: 'the milepost',
      body: 'two boards on a post, and one of them has dropped. whatever was painted on them went years ago. the road it is standing on goes east, and then it goes on going east, and there is nothing on either arm to argue with.',
      learns: ['name:canyon', 'name:office'],
    },
  },
  {
    x: 288, z: -34, radius: 7, label: 'SOMEBODY’S LONG WALK',
    note: {
      title: 'somebody’s long walk',
      body: 'a skull. forty paces on, one boot, upright, laces done up. both of them pointing the same way, which is the way you are going.',
    },
  },
  {
    x: 268, z: 58, radius: 16, label: 'THE PAN',
    note: {
      title: 'the pan',
      body: 'the lowest ground for a hundred paces in any direction, cracked into plates, with three faint rings round it where something stopped and then stopped again. nothing has ever been in it. the only water out here is up the slope and to the east, which is not how water works.',
    },
  },
  {
    x: 305, z: 55, radius: 12, label: 'THE OASIS',
    prompt: 'DRINK',
    note: {
      title: 'the oasis',
      body: 'green, out here, is a rumor you can stand in. the water is the same blue as the sea, which is a long way west, and it is about a hand deep, and nobody has ever worked out how it gets here or where it goes afterwards.',
      learns: ['name:beach'],
    },
  },
  {
    x: 301, z: 95, radius: 10, label: 'THE CATCH',
    note: {
      title: 'the catch',
      body: 'the guttering is straight, the fall is graded, the lid is on, and there is not a leaf in the trap. it has not rained here in anyone’s memory. the cistern is full.',
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
  type Sheep = { x: number; z: number; hx: number; hz: number; side: number; stub: boolean };
  const flock: Sheep[] = [];
  for (let i = 0; i < FLOCK; i++) {
    const z = 84 + (i / FLOCK) * 38 + (r() - 0.5) * 4;
    const x = 101 + (r() - 0.5) * 8;
    flock.push({ x, z, hx: x, hz: z, side: r() > 0.5 ? 1 : -1, stub: i === 4 || i === 9 });
  }
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

  return (dt: number, t: number, px: number, pz: number) => {
    /* THE SAILS. One revolution in about ten minutes of game time —
     * slow enough that "they were mid-turn when you came over the rise
     * and they will be mid-turn when you look back" is still true, and
     * fast enough that a player who comes back finds them a quarter
     * round (THE-STRANGERS U24). It is the only clock in this world
     * that a player can read by looking at it twice. */
    sails.rotation.z = -t * 0.0105;

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
    const outNow = Math.min(
      Math.max(0, Math.min(1, (h - 5.6) / 0.8)),
      Math.max(0, Math.min(1, (20.6 - h) / 0.8))
    );
    const atTable = h > 11.6 && h < 12.9;
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

    /* THE FLOCK PARTS. */
    for (let i = 0; i < FLOCK; i++) {
      const s = flock[i];
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
      const k = 1 - Math.exp(-dt * (d < 13 ? 3.2 : 0.9));
      s.hx += (tx - s.hx) * k;
      s.hz += (tz - s.hz) * k;
      const moving = Math.hypot(tx - s.hx, tz - s.hz) > 0.35;
      const pose = s.stub ? (i % 2 as 0 | 1) : moving ? 3 : ((i % 3) as 0 | 1 | 2);
      for (let p = 0; p < 4; p++) {
        if (p === pose) sheepFields[p].set(i, s.hx, s.hz, 0.85 + (i % 4) * 0.06, 0, s.side < 0);
        else sheepFields[p].hide(i, s.hx, s.hz);
      }
    }
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
    x: 140, z: 10, radius: 8, label: 'THE HEADLAND',
    prompt: 'SIT DOWN',
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
