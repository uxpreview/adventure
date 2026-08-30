import * as THREE from 'three';
import {
  mesaTexture, archRockTexture, boulderTexture, cactusTexture, duneDecal,
  skullTexture, tumbleweedTexture, palmTexture, signpostTexture,
} from '../textures';
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
      downSpots.forEach(([x, z], i) => { if (i % 4 === v) f.set(i, x, -4000, 0.001, 0, false); });
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
      goat.x = goat.hx + Math.cos(away) * 20;
      goat.z = goat.hz + Math.sin(away) * 20;
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
      else goatPoses[p].set(0, goat.hx, -4000, 0.001, 0, false);
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
 * SPLITROCK CANYON — striated walls, balanced stone, one arch you
 * will try to walk under (you can).
 * ================================================================== */

export const buildCanyon: RegionBuilder = (ctx) => {
  const { r, rect } = ctx;

  // the walls: big slabs lining the north edge and a broken inner ridge
  for (let i = 0; i < 6; i++) {
    const x = rect.minX + 14 + i * 24 + r() * 6;
    ctx.standee(mesaTexture(300 + i, 512, 288), 26, 15, x, rect.minZ + 10 + r() * 5);
  }
  for (let i = 0; i < 4; i++) {
    const x = rect.maxX - 12;
    ctx.standee(mesaTexture(310 + i, 512, 288), 24, 14, x, rect.minZ + 40 + i * 36, { rotY: -Math.PI / 2 });
  }
  // an inner shelf the trail winds past
  ctx.standee(mesaTexture(320, 512, 288), 30, 13, 268, -160, { rotY: 0.35 });
  ctx.standee(mesaTexture(321, 512, 288), 26, 12, 330, -200, { rotY: -0.3 });

  ctx.standee(archRockTexture(331), 13, 10, 305, -148, { rotY: 0.1 });

  const rocks = ctx.field(boulderTexture(340), 46, { w: 3.2, h: 2.2 });
  ctx.scatter(46, { minDist: 5 }).forEach(([x, z], i) =>
    rocks.set(i, x, z, 0.6 + r() * 0.9, 0, r() > 0.5));

  const cacti = ctx.field(cactusTexture(341), 14, { w: 2.6, h: 3.9 });
  ctx.scatter(14, { minDist: 12 }).forEach(([x, z], i) =>
    cacti.set(i, x, z, 0.6 + r() * 0.5, 0, r() > 0.5));
};

export const CANYON_POIS: WorldPOI[] = [
  {
    x: 305, z: -148, radius: 8, label: 'THE NEEDLE ARCH',
    prompt: 'STAND UNDER IT',
    note: {
      title: 'the needle arch',
      body: 'a hole worn through solid rock by nothing but weather and insistence. you stand under it. it holds. it has been holding since before anything out here was named.',
    },
  },
  { x: 318, z: -108, radius: 9, label: 'THE RIVERHEAD' },
];

/* ================================================================== *
 * THE BLEACH FLATS — dune script, saguaros, one green secret.
 * ================================================================== */

export const buildDesert: RegionBuilder = (ctx) => {
  const { r } = ctx;

  const dunes = ctx.field(duneDecal(400), 60, { w: 11, h: 5.5, decal: true, baseOpacity: 0.8 });
  ctx.scatter(60, { minDist: 8 }).forEach(([x, z], i) =>
    dunes.set(i, x, z, 0.8 + r() * 0.8, r() * Math.PI, r() > 0.5));

  const cacti = ctx.field(cactusTexture(401), 42, { w: 2.8, h: 4.2 });
  const oasisAvoid = (x: number, z: number) => Math.hypot(x - 305, z - 55) < 20;
  ctx.scatter(42, { minDist: 7, avoid: oasisAvoid }).forEach(([x, z], i) =>
    cacti.set(i, x, z, 0.55 + r() * 0.7, 0, r() > 0.5));

  ctx.standee(skullTexture(410), 2.2, 1.8, 292, -30);
  ctx.standee(skullTexture(411), 1.8, 1.5, 342, 88);

  // the oasis: palms leaning over the one wet thing for miles
  ctx.standee(palmTexture(420), 7.5, 8.8, 295, 48);
  ctx.standee(palmTexture(421), 8, 9.4, 314, 50);
  ctx.standee(palmTexture(422), 7, 8.2, 306, 66);
  ctx.standee(palmTexture(423), 6.5, 7.6, 296, 62);

  ctx.standee(signpostTexture(430), 3.4, 4.1, 248, 12);

  // tumbleweeds that actually tumble
  const weeds = ctx.field(tumbleweedTexture(440), 8, { w: 2.2, h: 2.2 });
  const weedPos = ctx.scatter(8, { minDist: 10 });
  weedPos.forEach(([x, z], i) => weeds.set(i, x, z, 0.6 + r() * 0.6, 0, false));
  const state = weedPos.map(([x, z]) => ({ x, z, spin: 0 }));
  return (dt: number) => {
    for (let i = 0; i < state.length; i++) {
      const s = state[i];
      s.x += dt * (2.2 + i * 0.24);
      s.spin -= dt * (2 + i * 0.2);
      if (s.x > 374) s.x = 236;
      weeds.set(i, s.x, s.z, 0.6 + (i % 3) * 0.2, s.spin, false);
    }
  };
};

export const DESERT_POIS: WorldPOI[] = [
  {
    x: 305, z: 55, radius: 12, label: 'THE OASIS',
    prompt: 'DRINK',
    note: {
      title: 'the oasis',
      body: 'green, out here, is a rumor you can stand in. the water is the same blue as the sea, which is a long way west, and nobody has ever worked out how it gets here or where it goes afterwards.',
      learns: ['name:beach'],
    },
  },
  { x: 292, z: -30, radius: 6, label: 'SOMEBODY’S LONG WALK' },
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
        else handFields[p].set(i, hx, -4000, 0.001, 0, false);
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
        else sheepFields[p].set(i, s.hx, -4000, 0.001, 0, false);
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
