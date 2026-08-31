import * as THREE from 'three';
import { ringTexture, loopsTexture } from '../../engine/ink';
import { hayBaleTexture, doodleFolkTexture, logTexture, wheatDecal } from '../textures';
import {
  leanGrassTexture, tallGrassTexture, driftFlowersTexture, commonOakTexture,
  wornGroundDecal, wheelRutsDecal, commonWellTexture, crossroadsSignTexture,
  milestoneTexture, hayCartTexture, hedgerowTexture, longFenceTexture,
  leafLitterDecal, reedsTexture, ropeSwingTexture, swallowTexture,
  keepVistaTexture,
} from '../textures-common';
import type { RegionBuilder, WorldPOI } from './index';

/**
 * THE COMMON — rebuilt to design/specs/the-common.md (Session 2).
 *
 * Six places, three seams, two composed voids. Everything green goes
 * through the cluster scatter so nothing reads as an array; every
 * place stands on worn ground; the north edge is the poster's horizon
 * (the keep vista here, the wall itself on the kingdom's side).
 */

const OAKS = { x: -98, z: 26 };
const WELL = { x: -57, z: 45 };

export const buildMeadow: RegionBuilder = (ctx) => {
  const { r, terrain } = ctx;

  /* ---- cluster scatter: hearts, then jittered members ------------- */
  const dropAt = (x: number, z: number, avoidOakShade = true) => {
    if (x < ctx.rect.minX + 4 || x > ctx.rect.maxX - 4) return false;
    if (z < ctx.rect.minZ + 4 || z > ctx.rect.maxZ - 4) return false;
    if (terrain.waterAt(x, z) > 0.04 || terrain.roadAt(x, z)) return false;
    // the shade void under the oaks stays bare
    if (avoidOakShade && Math.hypot(x - OAKS.x, z - OAKS.z) < 9) return false;
    // the worn floors of the places stay bare too
    if (Math.hypot(x + 45, z - 58) < 6) return false;
    if (Math.hypot(x - WELL.x, z - WELL.z) < 4) return false;
    return true;
  };
  const clustered = (
    hearts: [number, number][], per: [number, number], rad: number
  ): [number, number][] => {
    const out: [number, number][] = [];
    for (const [hx, hz] of hearts) {
      const n = per[0] + Math.floor(r() * (per[1] - per[0]));
      for (let i = 0; i < n; i++) {
        const a = r() * Math.PI * 2;
        const d = Math.pow(r(), 0.6) * rad;
        const x = hx + Math.cos(a) * d;
        const z = hz + Math.sin(a) * d * 0.85;
        if (dropAt(x, z)) out.push([x, z]);
      }
    }
    return out;
  };

  /* ---- the grass: six drawings, wind-swayed, clustered ------------ */
  // hearts thin toward the west void and stay out of the gate corridor
  const grassHearts: [number, number][] = [
    [-70, 30], [-84, 56], [-62, 82], [-95, 92], [-30, 100], [-18, 42],
    [-2, 74], [16, 22], [26, 54], [40, 92], [48, 32], [-110, 22],
    [-128, 62], [8, 100],
  ];
  const grassPts = clustered(grassHearts, [9, 17], 8);
  // strays between clusters, sparse
  ctx.scatter(40, { minDist: 5 }).forEach(([x, z]) => {
    if (x > -112 && dropAt(x, z)) grassPts.push([x, z]);
  });
  const perVariant = Math.ceil(grassPts.length / 6);
  for (let v = 0; v < 6; v++) {
    const pts = grassPts.slice(v * perVariant, (v + 1) * perVariant);
    if (!pts.length) continue;
    const f = ctx.field(leanGrassTexture(300 + v), pts.length,
      { w: 1.7, h: 1.15, wind: { amp: 0.06, freq: 1.15 } });
    // the lean is drawn in: never flipped, so the wind stays one wind
    pts.forEach(([x, z], i) => f.set(i, x, z, 0.7 + r() * 0.6, 0, false));
  }

  /* ---- the near layer: tall seedheads at the road shoulders ------- */
  const tallPts: [number, number][] = [];
  for (let z = 66; z < 116; z += 3.5 + r() * 3) {
    tallPts.push([-51 - r() * 2.5, z], [-38.5 + r() * 2.5, z + 1.7]);
  }
  for (let x = -30; x < 52; x += 4 + r() * 3.5) {
    tallPts.push([x, 52 - 4.2 - r() * 2.5]);
  }
  for (let i = 0; i < 3; i++) {
    const pts = tallPts.filter((_, k) => k % 3 === i).filter(([x, z]) => dropAt(x, z, false));
    if (!pts.length) continue;
    const f = ctx.field(tallGrassTexture(320 + i), pts.length,
      { w: 1.9, h: 1.9, wind: { amp: 0.11, freq: 0.95 } });
    pts.forEach(([x, z], k) => f.set(k, x, z, 0.75 + r() * 0.5, 0, false));
  }

  /* ---- the drifts: one species each --------------------------------- */
  const drifts: { hearts: [number, number][]; species: 0 | 1 | 2; seed: number }[] = [
    // poppies at the well — the accent color kept low and close
    { hearts: [[-62, 41], [-53, 50]], species: 0, seed: 340 },
    // oxeye trailing west along the coast road into the void
    { hearts: [[-82, 65], [-108, 55], [-134, 62]], species: 1, seed: 342 },
    // buttercups along the long fence
    { hearts: [[4, 70], [22, 72], [34, 64]], species: 2, seed: 344 },
  ];
  for (const d of drifts) {
    const pts = clustered(d.hearts, [6, 12], 6);
    if (!pts.length) continue;
    for (let v = 0; v < 2; v++) {
      const sub = pts.filter((_, k) => k % 2 === v);
      if (!sub.length) continue;
      const f = ctx.field(driftFlowersTexture(d.seed + v, d.species), sub.length,
        { w: 1.9, h: 1.45, wind: { amp: 0.05, freq: 1.3 } });
      sub.forEach(([x, z], i) => f.set(i, x, z, 0.7 + r() * 0.45, 0, false));
    }
  }

  /* ---- THE CROSSROADS --------------------------------------------- */
  ctx.decal(wornGroundDecal(400), 13, 13, -45, 58, 0.3, 0.75);
  ctx.decal(ringTexture(), 4, 4, -45, 58, 0, 0.5);
  ctx.standee(crossroadsSignTexture(401), 4.0, 4.7, -42, 52);
  ctx.standee(milestoneTexture(402), 1.1, 1.4, -49.5, 63);
  // the surviving warm-up loops: the pen tried the pen here, once
  ctx.decal(loopsTexture(), 7, 2.6, -37, 63.5, 0.35, 0.22);
  // the foot-path scuffs toward the well
  ctx.decal(wornGroundDecal(403), 6, 3.6, -50, 52, 0.85, 0.45);
  ctx.decal(wornGroundDecal(404), 5, 3.2, -54, 48, 0.8, 0.4);

  /* ---- THE OLD WELL ----------------------------------------------- */
  ctx.decal(wornGroundDecal(410), 9, 8, WELL.x, WELL.z, 1.2, 0.6);
  ctx.standee(commonWellTexture(411), 4.4, 5.5, WELL.x - 1, WELL.z - 1);

  /* ---- THE ARGUING OAKS ------------------------------------------- */
  ctx.standee(commonOakTexture(420, 0), 11.5, 12.9, OAKS.x - 6, OAKS.z - 3);
  ctx.standee(commonOakTexture(421, 1), 10.2, 11.5, OAKS.x + 8, OAKS.z + 3.5);
  ctx.standee(commonOakTexture(422, 2), 10.8, 12.2, OAKS.x - 1, OAKS.z + 10);
  ctx.decal(leafLitterDecal(423), 9, 5.5, OAKS.x - 3, OAKS.z + 2, 0.4, 0.7);
  ctx.decal(leafLitterDecal(424), 7, 4.5, OAKS.x + 5, OAKS.z + 6, 1.7, 0.6);
  ctx.decal(wornGroundDecal(425), 6, 5, OAKS.x + 7.5, OAKS.z + 1.5, 0.2, 0.5);
  ctx.standee(logTexture(426), 3.1, 1.4, OAKS.x - 4, OAKS.z + 5.5, { rotY: 0.35 });
  // the rope swing hangs from the leaning oak; pivot re-seated to the top
  const swing = ctx.standee(ropeSwingTexture(427), 1.5, 3.0, OAKS.x + 7.4, OAKS.z + 3.2);
  swing.geometry.translate(0, -3.0, 0);
  ctx.hang(swing, 5.6);

  /* ---- THE GATE FIELDS: hedgerows funnel the king's road ---------- */
  ctx.standee(hedgerowTexture(430), 15, 6.6, -55, 22);
  ctx.standee(hedgerowTexture(431, true), 15, 6.6, -56, 7);
  ctx.standee(hedgerowTexture(432), 14, 6.2, -35, 17);
  ctx.standee(hedgerowTexture(433), 15, 6.6, -34, 2);
  ctx.decal(wheelRutsDecal(434), 12, 6, -45, 24, Math.PI / 2, 0.7);
  ctx.decal(wheelRutsDecal(435), 12, 6, -45, 10, Math.PI / 2, 0.8);
  ctx.decal(wheelRutsDecal(436), 11, 5.5, -45, 38, Math.PI / 2, 0.5);

  /* ---- THE LONG FENCE --------------------------------------------- */
  const fenceRun: { x: number; kind: 0 | 1 | 2 | 3 }[] = [
    { x: -12, kind: 0 }, { x: -5, kind: 1 }, { x: 2, kind: 0 },
    { x: 9, kind: 2 }, { x: 16, kind: 0 }, { x: 23, kind: 3 },
    { x: 30, kind: 0 }, { x: 37, kind: 1 },
  ];
  fenceRun.forEach((seg, i) =>
    ctx.standee(longFenceTexture(440 + i, seg.kind), 7, 2.6, seg.x + 3.5,
      64.5 + Math.sin(i * 1.7) * 0.8));
  // the fence dies out east of the gate: one leaning post, then nothing
  ctx.standee(milestoneTexture(449), 1.1, 1.5, 45, 66);
  ctx.decal(wornGroundDecal(450), 5, 4, 9.5, 62.5, 0.4, 0.5);
  // the implied field beyond: the hay cart, bales, a stand of wheat
  ctx.standee(hayCartTexture(451), 5.6, 4.0, 20, 76.5, { rotY: -0.25 });
  // bales stand clear of the cart: beside its wheel they read as spares
  ctx.standee(hayBaleTexture(452), 3.2, 2.4, 33, 81);
  ctx.standee(hayBaleTexture(453), 2.7, 2.0, 37.5, 77);
  for (let i = 0; i < 5; i++) {
    ctx.decal(wheatDecal(454 + i), 10, 6.6, -2 + i * 9 + r() * 3, 76 + r() * 8, r() * 0.4, 0.55);
  }
  // someone leaning at the field gate, watching the road
  ctx.standee(doodleFolkTexture(459), 1.15, 1.9, 26.6, 63.8);

  /* ---- RIVERBEND --------------------------------------------------- */
  const reedSpots: [number, number, number][] = [
    [44, 96, 1.0], [50.5, 91, 0.85], [38, 104, 1.1], [47, 103, 0.8],
    [33, 111, 0.95], [42, 111.5, 0.7],
  ];
  reedSpots.forEach(([x, z, s], i) =>
    ctx.standee(reedsTexture(460 + (i % 2)), 2.6 * s, 2.6 * s, x, z));

  /* ---- the west void's one midpoint ------------------------------- */
  ctx.standee(milestoneTexture(470), 1.4, 1.8, -118, 62.5);

  /* ---- the north horizon: Greyweather ghosted above Brim ----------- *
   * False perspective: the real keep is 180 units further out, fogged
   * to nothing. This pencil stand-in gives the poster its third layer
   * and fades away before the walker can catch it working.            */
  const vista = ctx.standee(keepVistaTexture(480), 48, 32, -52, -52, { opacity: 0.8 });
  (vista.material as THREE.MeshBasicMaterial).fog = false;
  const vistaMat = vista.material as THREE.MeshBasicMaterial;

  /* ---- the swallows ------------------------------------------------ */
  const swallows = [
    { m: ctx.standee(swallowTexture(490), 1.6, 0.8, -70, 40), cx: -72, cz: 44, rx: 16, rz: 9, w: 0.42, ph: 0 },
    { m: ctx.standee(swallowTexture(491), 1.4, 0.7, -55, 60), cx: -58, cz: 62, rx: 13, rz: 11, w: 0.55, ph: 2.4 },
  ];

  return (dt: number, t: number, _px: number, pz: number) => {
    // the swing: a slow pendulum nobody is sitting in
    swing.rotation.z = Math.sin(t * 0.9) * 0.07 + Math.sin(t * 0.37) * 0.03;
    // swallows loop crossing ellipses, always banking into the turn
    for (const s of swallows) {
      const a = t * s.w + s.ph;
      s.m.position.x = s.cx + Math.cos(a) * s.rx;
      s.m.position.z = s.cz + Math.sin(a * 2) * s.rz * 0.5;
      s.m.position.y = ctx.groundY(s.cx, s.cz) + 4.6 + Math.sin(a * 3.1) * 1.2;
      s.m.scale.x = Math.sin(a) > 0 ? -Math.abs(s.m.scale.x) : Math.abs(s.m.scale.x);
    }
    /* THE KEEP VISTA HOLDS ONLY AT MEADOW DISTANCE — and until Session 13
     * that sentence was only half true, because the fade had a near
     * bound and no far one.
     *
     * This standee is FALSE PERSPECTIVE with `fog = false`: a pencil
     * keep at (−52, −52) standing in for a castle a hundred and eighty
     * units further out. It ramps in as the walker comes south down the
     * Common and then never lets go, so from the world's SOUTH RIM —
     * three hundred and twenty-four units away, in a land this file has
     * never heard of — Greyweather stood on the horizon at full
     * opacity, at the vanishing point of the king's road.
     *
     * That is the one thing `THE-LINE.md` §3.2 says the end of the
     * survey must not do. *"You cannot see where it ends. You can see
     * that it does not stop."* A game that shows you the castle from
     * the south rim has answered the question, and this one had been
     * answering it since Session 2 in a frame nobody had ever shot.
     *
     * So it lets go over the first forty units of MAPLE COURT: full
     * through the whole Common and over its border (the three chairs
     * look north through their hedge at z ≈ 132 and this is what they
     * see), gone by z = 168, which is the near side of the river. No
     * framing north of there has moved by a pixel — `diff-sheets`
     * carries eleven of them and every one is at z ≤ 120. */
    const near = Math.max(0, Math.min(1, (pz - 12) / 22));
    const far = 1 - Math.max(0, Math.min(1, (pz - 136) / 32));
    vistaMat.opacity = 0.8 * near * far;
  };
};

export const MEADOW_POIS: WorldPOI[] = [
  {
    x: -42, z: 52, radius: 7, label: 'THE CROSSROADS',
    prompt: 'READ THE SIGNPOST',
    note: {
      title: 'the crossroads',
      body: 'brim, to the north. the sea, west. the downs, east. and one that says 8:15, which is not a place. every road in the world starts here, which is another way of saying you are nowhere in particular.',
      /* THREE LANDS GO INTO PENCIL ON THE MAP FROM THE FIRST NOTE IN
       * THE GAME. The signpost has named them since Session 1 and it
       * has never been worth anything, because the map had nothing to
       * do with what the walker had been told. Now it has. */
      learns: ['name:kingdom', 'name:beach', 'name:downs'],
    },
  },
  {
    x: -57, z: 45, radius: 5, label: 'THE OLD WELL',
    prompt: 'LOOK DOWN THE WELL',
    note: {
      title: 'the old well',
      body: 'you look down. the dark looks back, politely. a long way below, something lands in water, and it takes longer to do it than it should.',
    },
  },
  {
    x: -95, z: 29, radius: 9, label: 'THE ARGUING OAKS',
    prompt: 'SIT IN THE SWING',
    note: {
      title: 'the arguing oaks',
      body: 'three oaks, one argument, four hundred years. the subject is who stands furthest from the other two. the swing takes no side; it was hung on the leaning one because the leaning one was losing.',
    },
  },
  {
    x: 12, z: 63, radius: 6, label: 'THE LONG FENCE',
    prompt: 'LEAN ON THE STILE',
    note: {
      title: 'the long fence',
      body: 'a fence with one stile, one gate, and several strong opinions about which side is the field. the hay cart has been almost done being loaded for as long as anyone at this gate can remember.',
    },
  },
  {
    x: 44, z: 102, radius: 7, label: 'RIVERBEND',
    prompt: 'WATCH THE WATER',
    note: {
      title: 'riverbend',
      body: 'the river practices its cursive on this corner of the common. the reeds lean in to read it. so far it has written the same word the whole way to the sea.',
    },
  },
];
