import * as THREE from 'three';
import { grassTexture } from '../../engine/ink';
import {
  lamppostTexture, bannerTexture, boulderTexture, wellTexture,
  suburbanHouseTexture, mailboxTexture, carTexture, picketFenceTexture,
  streetTreeTexture, swingSetTexture, towerBlockTexture, glassTowerTexture,
  shopfrontTexture, trafficLightTexture, benchTexture, busStopTexture,
  planterTexture, doodleFolkTexture, bushTexture, signpostTexture,
  lampGlowTexture, brazierTexture,
} from '../textures';
import {
  brimWallTexture, wallTowerTexture, brimGateTexture, gatePennantTexture,
  wornGroundDecal, wheelRutsDecal, longFenceTexture,
  hedgerowTexture, reedsTexture, swallowTexture,
} from '../textures-common';
import {
  townRowTexture, townRowLitTexture, brimBelfryTexture, brimStallTexture, brimFountainTexture,
  marketCrossTexture, buntingTexture, appleTreeTexture, pigeonTexture,
  woodGateTexture, cobblePlazaDecal, backStreetTexture, stoneWearDecal,
  crateBarrelTexture, greyweatherKeepTexture,
  greyweatherGateTexture, ridgeWallTexture, tallBannerTexture,
  toppledStatueTexture, gnarledHawthornTexture, farPinesTexture, rookTexture,
  screeDecal, margetStallTexture, margetTexture, marketBoardTexture,
} from '../textures-oldworld';
import { clock } from '../daylight';
import { knowledge } from '../knowledge';
import type { RegionBuilder, WorldPOI } from './index';

/* ------------------------------------------------------------------ *
 * THE LAMPS COME ON (Session 6, WORLD-SYSTEMS §7).
 *
 * The day cycle's whole argument is that every land already built
 * improves for free — and "for free" is a claim a session has to earn
 * in at least one place or it is a promise. Brim is that place: it is
 * a built, WOWED land with four lampposts already standing in its
 * square and ten terraces already leaning over its high street, and
 * lighting them costs fourteen standees and one line in an update that
 * was already running.
 *
 * The region asks the clock DIRECTLY (`import { clock }`) rather than
 * being handed the hour by App. That is the seam STORY §7 needs: the
 * story runs on routine — people are somewhere at a given hour, the
 * belfry's two hands disagree, the shutters open in the morning — and
 * Session 7 must be able to ask what time it is without opening
 * App.ts or plumbing an argument through twelve builders.
 * ------------------------------------------------------------------ */

/** Fade a set of drawings up as the lamps come on. Materials only, so
 *  it costs nothing but an opacity write per mesh per frame. */
function lightUp(meshes: THREE.Mesh[], k: number) {
  for (const m of meshes) {
    const mat = m.material as THREE.MeshBasicMaterial;
    mat.opacity = k;
    m.visible = k > 0.02;
  }
}

/** Fire a named audio event up to the App without a plumbing run. */
function say(name: string) {
  window.dispatchEvent(new CustomEvent('inklands:event', { detail: name }));
}

/**
 * The camera walks 12 units behind the walker, so every gate the road
 * passes through needs a fade that holds while EITHER of them is in
 * the arch's plane: a z-band around the gate, gated by x-closeness.
 */
function passFade(px: number, pz: number, gx: number, lo: number, hi: number): number {
  const xk = Math.max(0, 1 - Math.abs(px - gx) / 10);
  const zk = Math.max(0, Math.min(1, Math.min(pz - lo, hi - pz) / 3));
  return xk * zk;
}

/* ================================================================== *
 * THE KINGDOM OF BRIM — a walled market town on the king's road.
 * Session 3: the real town. Terraces of half-timbered houses lean
 * over the high street, the square has its fountain, cross, stalls
 * and pigeons, the belfry stands where its pale stand-in stood, and
 * both side gates are places. The south face (Session 2, WOWED) is
 * kept exactly; the pale vista layer it carried is replaced by the
 * town itself plus a reseeded back-street roof rank.
 * ================================================================== */

export const buildKingdom: RegionBuilder = (ctx) => {
  const { r } = ctx;

  /* -- the south face: the spawn's whole horizon (Session 2 spec) ----
   * Segments vary in width, height and seed; drum towers punctuate the
   * run; the gatehouse centers it with two red pennants. UNCHANGED. */
  const gateL = -53.5;
  const gateR = -36.5;
  let wx = -148;
  let si = 0;
  while (wx < 54) {
    if (wx >= gateL && wx < gateR) { wx = gateR; continue; } // the gate
    let segW = 12 + r() * 7;
    if (wx < gateL && wx + segW > gateL) segW = gateL - wx;
    if (wx + segW > 56) segW = 56 - wx;
    if (segW < 4) { wx += segW; continue; }
    const segH = 5.0 + r() * 0.9;
    ctx.standee(brimWallTexture(800 + si), segW + 1.2, segH, wx + segW / 2,
      -13 + (r() - 0.5) * 1.6);
    wx += segW;
    si++;
  }
  [-116, -76, -16, 24].forEach((tx, i) =>
    ctx.standee(wallTowerTexture(880 + i), 6.4, 8.2, tx + (r() - 0.5) * 3, -11.6));
  const southGate = ctx.standee(brimGateTexture(810), 13, 13, -45, -12.5);
  const pennantL = ctx.standee(gatePennantTexture(811), 1.5, 3, -49.1, -13.2);
  const pennantR = ctx.standee(gatePennantTexture(812), 1.5, 3, -40.9, -13.0);
  ctx.hang(pennantL, 10.3);
  ctx.hang(pennantR, 10.3);

  /* -- the high street: terraces lean over the king's road ----------- *
   * The first west run stays short so the belfry yard keeps an open
   * sightline from the south (the camera has to be able to stand
   * there without a facade in its face). */
  const terraces: [number, number, number, number][] = [
    // west side (x, z, width, rotY)
    [-55, -30, 18, 0.26], [-64, -58, 26, 0.26],
    [-60, -108, 26, 0.34], [-62, -136, 28, 0.26],
    // east side
    [-30, -40, 26, -0.32], [-29, -64, 24, -0.28],
    [-27, -114, 26, -0.3], [-28, -140, 28, -0.26],
    // the market lane's north side
    [-6, -108, 26, 0.14], [22, -114, 24, -0.1],
  ];
  terraces.forEach(([x, z, w, rot], i) =>
    ctx.standee(townRowTexture(1400 + i), w, w * (288 / 512), x, z, { rotY: rot }));
  /* THE WINDOWS COME ON. One run of panes per terrace, hung a hair in
   * front of the row it belongs to and lit by the same clock as the
   * lamps. Never all of them: a street where every window is lit is a
   * street nobody lives in (`litWindowsTexture` leaves a third dark). */
  const litWindows: THREE.Mesh[] = terraces.map(([x, z, w, rot], i) => {
    // EXACTLY the row's own geometry, drawn from the row's own recorded
    // casements (textures-oldworld: townRowLitTexture). A generated run
    // of panes hung in front of a terrace lines up with nothing, and
    // round 2 of the gate had warm rectangles floating over the roofs.
    const m = ctx.standee(townRowLitTexture(1400 + i), w, w * (288 / 512), x, z, { rotY: rot });
    m.position.x += Math.sin(rot) * 0.22;
    m.position.z += Math.cos(rot) * 0.22;
    (m.material as THREE.MeshBasicMaterial).depthWrite = false;
    m.renderOrder = 3;
    return m;
  });

  // street wear: ruts up the king's road, worn floors at the gaps
  ctx.decal(wheelRutsDecal(1420), 12, 6, -45, -22, Math.PI / 2, 0.6);
  ctx.decal(wheelRutsDecal(1421), 11, 5.5, -46, -48, Math.PI / 2, 0.5);
  ctx.decal(wheelRutsDecal(1422), 12, 6, -45, -128, Math.PI / 2, 0.55);
  ctx.decal(wornGroundDecal(1423), 8, 6, -45, -36, 0.4, 0.4);
  ctx.decal(wornGroundDecal(1424), 7, 5, -46, -116, 1.1, 0.4);

  /* -- the back streets: the pale roof rank (failing pressure) ------- *
   * These keep the south-approach stack dense over the wall and give
   * the town a far layer of its own from every street framing.        */
  const backRoofs: [number, number, number][] = [
    [-86, -38, 30], [-90, -64, 28], [-88, -118, 30], [-84, -142, 26],
    [-8, -44, 26], [-4, -66, 22], [0, -142, 24], [34, -138, 26],
  ];
  // the pale register is a DISTANCE register: up close these read as
  // flat grey slabs, so each run lets go as the walker reaches it
  const backRoofMeshes = backRoofs.map(([x, z, w], i) =>
    ctx.standee(backStreetTexture(1440 + i, 512, 160), w, w * (160 / 512), x, z));

  /* -- BRIM SQUARE --------------------------------------------------- */
  ctx.decal(cobblePlazaDecal(1450), 32, 32, -45, -81, 0.2, 0.85);
  ctx.standee(brimFountainTexture(1452), 7, 7, -45, -81);
  ctx.standee(marketCrossTexture(1453), 3.4, 5.95, -35, -71);
  const stalls: [number, number, 0 | 1 | 2, number][] = [
    [-57, -90, 0, 0.5], [-59, -77, 1, 0.85], [-55, -67, 2, 1.05],
    [-33, -91, 1, -0.45], [-31, -70, 2, -0.75],
  ];
  stalls.forEach(([x, z, v, rot], i) =>
    ctx.standee(brimStallTexture(1460 + i, v), 5.6, 5.1, x, z, { rotY: rot }));
  const lampSpots: [number, number][] = [[-58, -96.5], [-32, -96], [-58.5, -65], [-33, -65.5]];
  lampSpots.forEach(([x, z], i) =>
    ctx.standee(lamppostTexture(1470 + i), 1.8, 6.3, x, z));
  /* and the four of them are LIT after dark — hung at the lantern, six
   * units up, because the light is at the lantern and a pool painted on
   * the ground runs away from a camera that only ever looks north */
  const lit: THREE.Mesh[] = lampSpots.map(([x, z], i) => {
    const g = ctx.standee(lampGlowTexture(1495 + i), 4.6, 4.6, x, z);
    ctx.hang(g, 4.4);
    (g.material as THREE.MeshBasicMaterial).transparent = true;
    (g.material as THREE.MeshBasicMaterial).depthWrite = false;
    g.renderOrder = 3;
    return g;
  });
  ctx.standee(benchTexture(1474), 3.4, 1.7, -51, -93, { rotY: 0.25 });
  // clutter behind the stalls: the market's working edges
  ctx.standee(crateBarrelTexture(1478), 3.6, 2.5, -60.5, -85, { rotY: 0.3 });
  ctx.standee(crateBarrelTexture(1479), 3.2, 2.25, -29.5, -80, { rotY: -0.4 });

  /* ---- MARGET, AND THE STALL THAT DOES NOT OPEN ------------------- *
   *
   * THE-WAITS.md §2, and the one wait Session 7 authors end to end.
   * She is placed at the head of the square, north of the fountain and
   * under the bunting, because the camera only ever looks north: a
   * player coming up from the south gate gets the market cross near,
   * the fountain as the subject and Marget's stall as the far thing,
   * between two lamps that come on at dusk.
   *
   * Two stalls, one at a time. Which one you see is not a flag the
   * game set — it is whether the walker has worked out why the market
   * never opened (`reason:brim`), asked in the present tense, every
   * frame. That is WORLD-SYSTEMS §6 stated as five lines of code.        */
  const stallShut = ctx.standee(margetStallTexture(1484, false), 4.6, 4.6, -44, -94.5);
  const stallOpen = ctx.standee(margetStallTexture(1485, true), 4.6, 4.6, -44, -94.5);
  const marget = ctx.standee(margetTexture(1486), 1.35, 2.4, -48.8, -93.4);
  for (const m of [stallShut, stallOpen, marget]) {
    (m.material as THREE.MeshBasicMaterial).transparent = true;
  }
  /* THE BOARD. Chalked at the cross the day the market is called, and
   * never taken down: the permanent half of the change, standing at
   * every hour including the sixteen the stall is packed away for. */
  const marketBoard = ctx.standee(marketBoardTexture(1487), 3.0, 2.15, -32.4, -70.2,
    { rotY: -0.22 });
  (marketBoard.material as THREE.MeshBasicMaterial).transparent = true;
  marketBoard.visible = false;

  // bunting strung post to post, ends pinned at lamp height,
  // breathing in the update
  const bunting = [
    ctx.standee(buntingTexture(1475), 26, 6.5, -45, -96.2),
    ctx.standee(buntingTexture(1476), 26, 6.5, -45.5, -65.2),
    ctx.standee(buntingTexture(1477), 25, 6.25, -45.5, -81, { rotY: 0.45 }),
  ];
  // hung at lamp height: flags must clear a walker's head, not swipe it
  for (const b of bunting) ctx.hang(b, 1.75);

  /* -- THE BELFRY YARD (open to the south — the camera needs in) ----- */
  ctx.standee(brimBelfryTexture(1480), 6.5, 13, -66, -44);
  ctx.decal(stoneWearDecal(1481, true), 9, 7, -66, -38, 0.7, 0.6);
  ctx.standee(benchTexture(1482), 3.2, 1.6, -61, -40, { rotY: -0.3 });
  ctx.decal(stoneWearDecal(1483, true), 7, 5, -58, -34, 1.4, 0.45);

  /* -- THE ORCHARD CLOSE --------------------------------------------- */
  const orchardTrees: [number, number, 0 | 1 | 2, number][] = [
    [-118, -56, 0, 1], [-107, -58, 1, 0.95], [-96, -54, 0, 1.05], [-86, -57, 2, 0.8],
    [-116, -71, 1, 1], [-104, -73, 0, 1.1], [-93, -70, 2, 0.75],
    [-119, -86, 0, 0.95], [-107, -88, 1, 1], [-95, -85, 0, 0.9],
    [-129, -63, 2, 0.7], [-131, -80, 1, 0.85], // the strays losing the row
  ];
  orchardTrees.forEach(([x, z, form, s], i) =>
    ctx.standee(appleTreeTexture(1490 + i, form), 8.6 * s, 9.3 * s,
      x + (r() - 0.5) * 3, z + (r() - 0.5) * 3));
  // the paddock fence stitches the close off the streets
  ctx.standee(longFenceTexture(1505, 0), 7, 2.6, -76, -58, { rotY: Math.PI / 2 });
  ctx.standee(longFenceTexture(1506, 3), 7, 2.6, -76, -70, { rotY: Math.PI / 2 });
  ctx.standee(longFenceTexture(1507, 1), 7, 2.6, -76, -84, { rotY: Math.PI / 2 });
  ctx.decal(wornGroundDecal(1508), 7, 5, -72, -76, 0.3, 0.4);
  ctx.decal(wornGroundDecal(1509), 6, 4.5, -84, -73, 1.5, 0.35);
  const orchGrass = ctx.field(grassTexture(), 30, { w: 1.5, h: 1.05 });
  ctx.scatter(30, { minDist: 4, rect: { minX: -134, maxX: -80, minZ: -95, maxZ: -48 } })
    .forEach(([x, z], i) => orchGrass.set(i, x, z, 0.6 + r() * 0.4, 0, r() > 0.5));

  /* -- the market lane's decay toward the Wood Gate ------------------ *
   * Everything tall stays NORTH of the lane: the camera walks the
   * south side and must never shoot through a hedge. */
  ctx.standee(hedgerowTexture(1510), 11, 4.8, 10, -104.5);
  ctx.standee(appleTreeTexture(1512, 1), 7, 7.6, 36, -117);
  ctx.standee(crateBarrelTexture(1513), 3.2, 2.25, 44, -114, { rotY: 0.2 });
  ctx.decal(wheelRutsDecal(1515), 12, 6, 34, -106, 0.15, 0.6);
  ctx.decal(wornGroundDecal(1516), 8, 6, 48, -110, 0.9, 0.5);
  ctx.decal(wornGroundDecal(1517), 7, 5, 4, -98, 0.3, 0.4);

  /* -- THE WOOD GATE + the east face rebuilt in the south register --- */
  let wz = -152;
  let ei = 0;
  while (wz < -22) {
    if (wz >= -116 && wz < -104) { wz = -104; continue; } // the gate
    let segW = 13 + r() * 6;
    if (wz < -116 && wz + segW > -116) segW = -116 - wz;
    if (wz + segW > -22) segW = -22 - wz;
    if (segW < 4) { wz += segW; continue; }
    ctx.standee(brimWallTexture(1520 + ei), segW + 1.2, 5 + r() * 0.8,
      56 + (r() - 0.5) * 1.4, wz + segW / 2, { rotY: Math.PI / 2 });
    wz += segW;
    ei++;
  }
  ctx.standee(wallTowerTexture(1540), 6.2, 8, 57, -140 + (r() - 0.5) * 3, { rotY: Math.PI / 2 });
  ctx.standee(wallTowerTexture(1541), 6.2, 8, 56.5, -58 + (r() - 0.5) * 3, { rotY: Math.PI / 2 });
  ctx.standee(woodGateTexture(1542), 12, 12, 56, -110, { rotY: Math.PI / 2 });

  /* -- the north wall: the town closed toward the castle ------------- *
   * Collected, because since Session 4 the camera RETREATS when the
   * ground ahead rises — and the ground ahead of this wall is
   * Greyweather's ridge. Standing on the banner avenue put the camera
   * back through Brim's own north wall and shot the whole castle
   * through the back of it. The camera only ever looks north, so a wall
   * the walker has already passed can only obstruct: it lets go. */
  const northRun: THREE.Mesh[] = [];
  wx = -148;
  let ni = 0;
  while (wx < 54) {
    if (wx >= gateL && wx < gateR) { wx = gateR; continue; }
    let segW = 12 + r() * 7;
    if (wx < gateL && wx + segW > gateL) segW = gateL - wx;
    if (wx + segW > 56) segW = 56 - wx;
    if (segW < 4) { wx += segW; continue; }
    northRun.push(ctx.standee(brimWallTexture(1550 + ni), segW + 1.2, 4.8 + r() * 0.8, wx + segW / 2,
      -157 + (r() - 0.5) * 1.4));
    wx += segW;
    ni++;
  }
  northRun.push(ctx.standee(wallTowerTexture(1570), 6.2, 8, -100 + (r() - 0.5) * 3, -155.6));
  northRun.push(ctx.standee(wallTowerTexture(1571), 6.2, 8, -6 + (r() - 0.5) * 3, -155.8));
  const northGate = ctx.standee(brimGateTexture(1572), 11.5, 11.5, -45, -156.5);
  ctx.decal(wheelRutsDecal(1573), 11, 5.5, -45, -148, Math.PI / 2, 0.6);

  /* -- folk and the four gate banners -------------------------------- */
  const folk = ctx.field(doodleFolkTexture(870), 16, { w: 1.15, h: 1.9 });
  const folkSpots: [number, number][] = [
    // clustered at the stalls, not spread
    [-54, -88.5], [-56.5, -85], [-35, -89.5], [-33.5, -86], [-57, -74.5],
    [-52, -69], [-34, -72.5], [-43, -88.5], [-47.5, -74], [-40, -67.5],
    // strays on the streets
    [-44, -38], [-47, -122], [-14, -100], [-60, -44],
    // one in the orchard, considering an apple
    [-101, -68], [46, -108],
  ];
  folkSpots.forEach(([x, z], i) => folk.set(i, x, z, 0.85 + r() * 0.25, 0, r() > 0.5));
  const banners = ctx.field(bannerTexture(871, 'red'), 8, { w: 1.6, h: 4 });
  [[-52, -20], [-38, -20], [-52, -150], [-38, -150], [-70, -81], [-20, -83], [50, -104], [50, -116]]
    .forEach(([x, z], i) => banners.set(i, x, z, 1, 0, i % 2 === 0));

  /* -- the pigeons of Brim Square ------------------------------------ */
  type Pigeon = {
    m: THREE.Mesh; x: number; z: number; tx: number; tz: number;
    fx: number; fz: number; ft: number; flying: boolean;
  };
  const pigeons: Pigeon[] = [];
  const roost: [number, number][] = [[-49, -85], [-42, -78], [-38, -85.5], [-50, -77], [-44, -90]];
  roost.forEach(([x, z], i) => {
    const m = ctx.standee(pigeonTexture(1580 + (i % 2)), 1.0, 0.75, x, z);
    pigeons.push({ m, x, z, tx: x, tz: z, fx: x, fz: z, ft: 0, flying: false });
  });

  /* -- the swifts around the belfry ---------------------------------- */
  const swifts = [
    { m: ctx.standee(swallowTexture(1590), 1.4, 0.7, -66, -44), cx: -66, cz: -44, rx: 9, rz: 6, w: 0.62, ph: 0.4 },
    { m: ctx.standee(swallowTexture(1591), 1.3, 0.65, -65, -43), cx: -65, cz: -43, rx: 12, rz: 8, w: 0.5, ph: 3.1 },
  ];

  const sgMat = southGate.material as THREE.MeshBasicMaterial;
  const ngMat = northGate.material as THREE.MeshBasicMaterial;
  const pLMat = pennantL.material as THREE.MeshBasicMaterial;
  const pRMat = pennantR.material as THREE.MeshBasicMaterial;

  const lampsAndWindows = [...lit, ...litWindows];

  return (dt: number, t: number, px: number, pz: number) => {
    // BRIM AT DUSK: the lamps in the square and the windows over the
    // high street, straight off the clock. One number, fourteen meshes.
    lightUp(lampsAndWindows, clock.lamp);

    /* ================================================================ *
     * MARGET'S DAY, AND THE DAY THE MARKET WAS CALLED.
     *
     * Three things happen here and none of them is announced.
     *
     * 1. THE ROUTINE. Out at dawn, away at dusk, every day, whether or
     *    not anybody is in the square to see it. STORY §7: a person in
     *    this world is a posture, a place, a ROUTINE and a name, and
     *    the routine is the only one of the four that needs a clock.
     *    We have had one since Session 6.
     *
     * 2. THE FACT. Brim's belfry has two hands and they disagree, and
     *    nobody in this town can settle which is right because nobody
     *    in this town has anything to check it against. The walker
     *    does: the lamps. Stand in the belfry yard while they are
     *    coming on and one hand agrees with them. Nothing says so —
     *    the player is simply somewhere at an hour, which is the only
     *    kind of knowing this world deals in.
     *
     * 3. THE CALLING. Market day is called from the cross. Come to the
     *    cross holding the hour and the bell rings it, and Brim has a
     *    market. There is no prompt and nothing to accept: you turn up
     *    knowing something and the world does the rest.
     * ================================================================ */
    const open = knowledge.has('reason:brim');
    // dawn to dusk. A cloth laid at first light and folded at the last
    const outNow = Math.min(
      Math.max(0, Math.min(1, (clock.hour - 5.5) / 0.9)),
      Math.max(0, Math.min(1, (20.4 - clock.hour) / 0.9))
    );
    for (const m of [stallShut, stallOpen, marget]) {
      (m.material as THREE.MeshBasicMaterial).opacity = outNow;
    }
    stallShut.visible = outNow > 0.02 && !open;
    stallOpen.visible = outNow > 0.02 && open;
    marget.visible = outNow > 0.02;
    marketBoard.visible = open;

    if (!open) {
      // the belfry yard, while the lamps are settling the hour
      if (clock.lamp > 0.3 && Math.hypot(px + 64, pz + 42) < 9) {
        knowledge.learn('fact:brim-hour');
      }
      // and the cross, where a market is called from
      if (knowledge.has('fact:brim-hour') && Math.hypot(px + 35, pz + 71) < 8) {
        if (knowledge.learn('reason:brim')) say('brim-bell');
      }
    }

    // the gate pennants take the same wind as the meadow grass
    pennantL.scale.x = 1 + Math.sin(t * 5.1) * 0.16 + Math.sin(t * 1.3) * 0.06;
    pennantR.scale.x = 1 + Math.sin(t * 4.6 + 1.9) * 0.16 + Math.sin(t * 1.1 + 0.7) * 0.06;

    // the arch courtesy fades: hold while walker OR camera is in the
    // gate plane (the camera trails 12 units south)
    const sNear = passFade(px, pz, -45, -27, -8);
    sgMat.opacity = 1 - sNear * 0.92;
    pLMat.opacity = pRMat.opacity = 1 - sNear * 0.8;
    const nNear = passFade(px, pz, -45, -172, -153);
    ngMat.opacity = 1 - nNear * 0.92;
    // past the north wall, it is only ever between the camera and the
    // castle: let it go (and take the gate with it)
    const outNorth = Math.max(0, Math.min(1, (-pz - 156) / 5));
    for (const m of northRun) {
      (m.material as THREE.MeshBasicMaterial).opacity = 1 - outNorth;
      m.visible = outNorth < 0.98;
    }
    if (outNorth > 0) ngMat.opacity = Math.min(ngMat.opacity, 1 - outNorth);

    // the back-street rank fades as the walker closes on it
    for (const m of backRoofMeshes) {
      const d = Math.hypot(px - m.position.x, pz - m.position.z);
      const k = Math.max(0, Math.min(1, (d - 16) / 16));
      (m.material as THREE.MeshBasicMaterial).opacity = k;
      m.visible = k > 0.02;
    }

    // bunting breathes
    bunting.forEach((b, i) => {
      b.scale.y = 1 + Math.sin(t * 1.15 + i * 2.1) * 0.045;
      b.rotation.z = Math.sin(t * 0.85 + i * 1.7) * 0.03;
    });

    // swifts loop the belfry, banking into the turn
    for (const s of swifts) {
      const a = t * s.w + s.ph;
      s.m.position.x = s.cx + Math.cos(a) * s.rx;
      s.m.position.z = s.cz + Math.sin(a * 2) * s.rz * 0.5;
      s.m.position.y = ctx.groundY(s.cx, s.cz) + 8.6 + Math.sin(a * 2.7) * 1.6;
      s.m.scale.x = Math.sin(a) > 0 ? -Math.abs(s.m.scale.x) : Math.abs(s.m.scale.x);
    }

    // the pigeons: unbothered until the walker is among them
    let flapped = false;
    for (const p of pigeons) {
      if (!p.flying) {
        const d = Math.hypot(px - p.x, pz - p.z);
        if (d < 2.6) {
          const ax = (p.x - px) / (d || 1);
          const az = (p.z - pz) / (d || 1);
          p.fx = p.x;
          p.fz = p.z;
          p.tx = Math.max(-59, Math.min(-31, p.x + ax * (5 + Math.sin(t * 7 + p.x) * 2)));
          p.tz = Math.max(-96, Math.min(-64, p.z + az * (5 + Math.cos(t * 5 + p.z) * 2)));
          p.ft = 0;
          p.flying = true;
          flapped = true;
        } else {
          // an idle peck: the body dips now and then
          p.m.scale.y = 1 - Math.max(0, Math.sin(t * 1.9 + p.x * 3.1)) * 0.12;
        }
      } else {
        p.ft += dt;
        const u = Math.min(1, p.ft / 1.5);
        p.x = p.fx + (p.tx - p.fx) * u;
        p.z = p.fz + (p.tz - p.fz) * u;
        p.m.position.set(p.x, Math.sin(u * Math.PI) * 2.3, p.z);
        p.m.scale.x = (p.tx > p.fx ? -1 : 1) * Math.abs(p.m.scale.x);
        if (u >= 1) {
          p.flying = false;
          p.m.position.y = ctx.groundY(p.x, p.z);
        }
      }
    }
    if (flapped) say('pigeon-flap');
  };
};

export const KINGDOM_POIS: WorldPOI[] = [
  {
    x: -45, z: -82, radius: 10, label: 'BRIM SQUARE',
    prompt: 'LISTEN TO THE FOUNTAIN',
    note: {
      title: 'brim square',
      body: 'the fountain has run since the town was six lines old. the stalls sell whatever a scribble can be argued into being: apples, or cannonballs, or very patient hedgehogs.',
    },
  },
  {
    x: -45, z: -14, radius: 8, label: 'THE SOUTH GATE',
    note: {
      title: 'the south gate',
      body: 'the portcullis is drawn raised and always has been. either the kingdom has no enemies, or its enemies are also drawings, and everyone has agreed to be civil.',
    },
  },
  {
    x: -64, z: -42, radius: 7, label: 'THE BELFRY',
    prompt: 'WAIT FOR THE BELL',
    note: {
      title: 'the belfry',
      body: 'the clock\'s two hands were drawn at different times of day and have refused to discuss it since. the bell splits the difference and rings when it feels the hour has been earned.',
    },
  },
  {
    /* THE MARKET CROSS — where Brim's wait is legible, and the place
     * it resolves at. The note carries the VOICE and not the
     * INSTRUCTION (QUESTS §3.4): it says what a cross is for and what
     * the town cannot agree on, and it does not say go and look at the
     * clock. The label sits high because the cross is six units tall
     * and BRIM SQUARE's own label is fifteen units away at three. */
    x: -35, z: -71, radius: 7, label: 'THE MARKET CROSS', labelHeight: 6.8,
    prompt: 'READ THE CROSS',
    note: {
      title: 'the market cross',
      body: 'a market is called from here, at the hour the bell strikes, and there is a step worn into the base from the calling. the stalls are set and the bunting is up. nobody in brim has been able to agree what hour the bell struck for a very long time.',
    },
  },
  {
    x: -103, z: -70, radius: 12, label: 'THE ORCHARD CLOSE',
    prompt: 'SCRUMP AN APPLE',
    note: {
      title: 'the orchard close',
      body: 'twelve trees inside the walls, counted twice a day by a warden nobody has drawn yet. the apples are red because the pen only brought one other color, and it was needed for the flags.',
    },
  },
  { x: 50, z: -110, radius: 7, label: 'THE WOOD GATE' },
];

/* ================================================================== *
 * CASTLE GREYWEATHER — the high seat above the town. Session 3: the
 * flagship walk. The banner avenue tightens toward the gatehouse, the
 * ridge wall rides its crags, the bailey keeps a toppled king and a
 * parliament of rooks, and the keep — the tallest drawing on the
 * sheet — stands at the end of it with its door shut.
 * ================================================================== */

export const buildCastle: RegionBuilder = (ctx) => {
  const { r } = ctx;

  /* ================================================================ *
   * CASTLE GREYWEATHER, ON A REAL RIDGE (Session 4).
   *
   * Session 3 drew the high seat: the keep's height was a wide texture,
   * "the wall riding the crags" was four crag stand-ups in a row, and
   * the ground under all of it was flat. Session 1 of WORLD-SYSTEMS
   * named that as the single biggest thing holding the world back, and
   * this is the session that fixes it. The ridge is now something UNDER
   * THE SHEET — a book under a page makes a scarp with a flat top, not
   * a hill — and everything here is placed against that fact:
   *
   *   · the banner avenue CLIMBS. It is the ramp. From its foot the
   *     ground ahead rises twelve units, which is what the camera reads
   *     to pull back and open the frame (App.CAM).
   *   · the curtain wall is placed by walking north from the foot until
   *     the ground reaches the brow — it FOLLOWS the ridge, at whatever
   *     height the page put it, and steps forward around the gate the
   *     way a real enceinte does.
   *   · the barbican sits low on the ramp and the keep stands on the
   *     plateau, so the approach stacks: barbican, then wall, then keep,
   *     each one clearing the one in front. Session 3 had to win that
   *     contest with texture width; the ridge wins it with ground.
   *   · the scarp itself is stone: scree lying ALONG the slope (decals
   *     follow the surface now) and the ridge's broken toe at its foot.
   *     The crags no longer stand in for the hill. They are the hill's
   *     rubble.
   * ================================================================ */

  /** The plateau under the keep — what the rooks circle above. */
  const ridgeTop = ctx.groundY(-45, -246);

  /** Walk north from the approach until the page reaches `target`: that
   *  is where this column of the ridge has its brow. */
  const lipZ = (x: number, target: number) => {
    for (let z = -194; z >= -234; z -= 1) if (ctx.groundY(x, z) >= target) return z;
    return -226;
  };

  /* -- THE SCARP: the ridge's south face, in stone ------------------- */
  // scree lies ALONG the slope; boulders are its broken toe at the foot
  const screeSpots: [number, number, number][] = [
    [-88, -207, 0.1], [-72, -209, 0.45], [-14, -209, 0.2], [16, -211, 0.55], [40, -210, 0.3],
  ];
  screeSpots.forEach(([x, z, rot], i) => ctx.decal(screeDecal(975 + i), 15, 8, x, z, rot, 0.6));
  /* The four crag stand-ups are GONE. They were the high seat drawn —
   * a picture of a ridge, standing on flat ground, in front of the
   * ridge's own place. The ridge is real now, so its toe is what a
   * ridge's toe actually is: fallen stone. */
  const rubble = ctx.field(boulderTexture(921), 18, { w: 2.4, h: 1.7 });
  [[-88, -204], [-78, -201], [-64, -203], [-9, -200], [6, -204], [24, -199], [42, -204],
   [-95, -197], [-70, -196], [-2, -196], [18, -206], [37, -207], [-83, -207], [30, -195],
   [-86, -196], [11, -197], [46, -199], [-74, -207]]
    .forEach(([x, z], i) => rubble.set(i, x, z, 0.7 + r() * 0.8, 0, r() > 0.5));

  /* -- THE CURTAIN WALL, riding the brow ---------------------------- *
   * Placed by the ground, not by a number: for each run of wall we ask
   * the page where its lip is and stand the segment a metre inside it.
   * The gap is the gate, and the wall steps forward to meet it. */
  const gapL = -60;
  const gapR = -30;
  const wallRun: THREE.Mesh[] = [];
  const wallFeet: [number, number][] = [];
  let wx = -80;
  let si = 0;
  while (wx < 44) {
    if (wx >= gapL && wx < gapR) { wx = gapR; continue; }
    let segW = 13 + r() * 6;
    if (wx < gapL && wx + segW > gapL) segW = gapL - wx;
    if (wx + segW > 46) segW = 46 - wx;
    if (segW < 4) { wx += segW; continue; }
    const cx = wx + segW / 2;
    const wz = lipZ(cx, 11.8) - 1.4;
    wallRun.push(ctx.standee(ridgeWallTexture(948 + si), segW + 1.2, 6.4 + r() * 0.9, cx, wz));
    wallFeet.push([cx, wz]);
    wx += segW;
    si++;
  }
  // spill at the foot of the wall: without it a wall on a brow reads as
  // a cut-out floating on the skyline, because its base is a straight
  // line across an empty slope
  const spill = ctx.field(boulderTexture(923), 22, { w: 2.1, h: 1.5 });
  wallFeet.forEach(([cx, wz], i) => {
    for (let k = 0; k < 2 && i * 2 + k < 22; k++) {
      spill.set(i * 2 + k, cx + (r() - 0.5) * 13, wz + 2.4 + r() * 3.4,
        0.55 + r() * 0.5, 0, r() > 0.5);
    }
  });
  // drum towers pinch the gate: the wall's two ends are the gatehouse
  const towerL = ctx.standee(wallTowerTexture(960), 5.6, 8.4, gapL - 1.5, lipZ(gapL - 1.5, 11.8) - 2.2);
  const towerR = ctx.standee(wallTowerTexture(961), 5.6, 8.4, gapR + 1.5, lipZ(gapR + 1.5, 11.8) - 2.2);
  wallRun.push(towerL, towerR);

  /* -- THE BARBICAN: low on the ramp, so the ridge can rise behind it *
   * Its height is not the point and never was — it is the FIRST of the
   * approach's three beats, and the ridge does the rest. */
  const gate = ctx.standee(greyweatherGateTexture(970), 9.5, 9.5, -45, -192);
  /* TWO BRAZIERS AT THE GATE, and they are the castle's only lit
   * things. Wick changes the banners on the avenue every day and
   * nobody has told him the king is not coming back (STORY §7) — so
   * somebody keeps a fire in at the gate, for a road nobody rides up.
   * The whole land argues in one drawing that only exists after dark. */
  const braziers = [-52.5, -37.5].map((x, i) => {
    const m = ctx.standee(brazierTexture(972 + i), 2.6, 3.5, x, -189.5);
    (m.material as THREE.MeshBasicMaterial).depthWrite = false;
    m.renderOrder = 3;
    return m;
  });

  /* -- THE KEEP: on the plateau, where the high seat belongs --------- */
  const keep = ctx.standee(greyweatherKeepTexture(980), 34, 17, -45, -250);
  ctx.standee(tallBannerTexture(981), 2.8, 7.4, -56, -240);
  ctx.standee(tallBannerTexture(982), 2.8, 7.4, -34, -239.5);
  // the bailey's furniture: the castle well, and stone that never
  // got built into anything
  ctx.standee(wellTexture(983), 3.4, 4.3, -32, -228);

  /* -- THE BANNER AVENUE: pairs tightening up the climb --------------- */
  const avenue: [number, number][] = [];
  const half = [9, 8.4, 7.8, 7.2, 6.6];
  half.forEach((hx, i) => {
    const z = -172 - i * 6.2 + (r() - 0.5) * 1.6;
    avenue.push([-45 - hx, z], [-45 + hx, z + 0.8]);
  });
  for (let v = 0; v < 2; v++) {
    const pts = avenue.filter((_, k) => k % 2 === v);
    const f = ctx.field(tallBannerTexture(984 + v), pts.length,
      { w: 2.3, h: 6.1, wind: { amp: 0.14, freq: 1.5 } });
    pts.forEach(([x, z], i) => f.set(i, x, z, 0.9 + r() * 0.2, 0, false));
  }
  // fallen merlon stones at the verge, and the approach's wear
  const rocks = ctx.field(boulderTexture(920), 15, { w: 2.6, h: 1.8 });
  [[-56, -175], [-33, -186], [-59, -190], [-30, -172], [-62, -226], [-24, -238], [-70, -182], [12, -220],
   [-64, -178], [-27, -193], [-67, -197], [-25, -180], [-60, -167], [-31, -201], [-69, -170]]
    .forEach(([x, z], i) => rocks.set(i, x, z, 0.6 + r() * 0.7, 0, r() > 0.5));
  ctx.decal(wheelRutsDecal(986), 12, 6, -45, -180, Math.PI / 2, 0.5);
  ctx.decal(wheelRutsDecal(1006), 11, 5.5, -46, -196, Math.PI / 2 + 0.05, 0.4);
  ctx.decal(wheelRutsDecal(1007), 12, 6, -44.5, -209, Math.PI / 2 - 0.04, 0.34);
  ctx.decal(stoneWearDecal(987), 10, 8, -45, -191, 0.3, 0.6);

  /* -- the bailey: a cobbled yard on the plateau, the toppled king --- *
   * On flat ground the two soft wear-blobs Session 3 used read as
   * stains; on a bare plateau under an open sky they read as puddles of
   * nothing. The bailey gets a drawn floor instead. */
  ctx.decal(cobblePlazaDecal(1002), 32, 24, -45, -224, 0.06, 0.8);
  ctx.decal(cobblePlazaDecal(1003), 22, 16, -48, -240, 0.5, 0.62);
  ctx.decal(stoneWearDecal(988), 13, 10, -62, -216, 0.8, 0.34);
  ctx.decal(stoneWearDecal(989), 11, 9, -26, -232, 1.6, 0.32);
  // the bailey's working clutter: stone that never got built into
  // anything, stacked where somebody meant to come back for it
  ctx.standee(crateBarrelTexture(1004), 3.6, 2.5, -66, -232, { rotY: 0.4 });
  ctx.standee(crateBarrelTexture(1005), 3.1, 2.2, -20, -222, { rotY: -0.5 });
  ctx.standee(toppledStatueTexture(990), 7, 4, -56, -222, { rotY: 0.15 });

  /* -- the moat pool: at the ridge's west foot, reflecting it -------- */
  const reedSpots: [number, number, number][] = [
    [-108, -212, 1], [-104, -221, 0.85], [-96, -222, 1.05], [-92, -214, 0.8],
    [-106, -207, 0.9], [-95, -208, 0.7], [-110, -218, 0.9], [-99, -224, 0.75],
  ];
  reedSpots.forEach(([x, z, s], i) =>
    ctx.standee(reedsTexture(992 + (i % 2)), 3.4 * s, 3.4 * s, x, z));
  ctx.standee(gnarledHawthornTexture(994), 9, 9, -90, -206);

  /* -- the far layer: pale pines along the plateau's northern rim ---- */
  ctx.standee(farPinesTexture(995), 52, 13, -78, -272);
  ctx.standee(farPinesTexture(996, 384, 128), 34, 11.3, 10, -276);
  ctx.standee(farPinesTexture(997, 640, 128), 44, 8.8, -126, -269);

  /* -- still grass: this land's grass does not lean ------------------ */
  const grass = ctx.field(grassTexture(), 50, { w: 1.5, h: 1.05 });
  ctx.scatter(50, { minDist: 4, avoid: (x, z) => Math.hypot(x + 45, z + 220) < 14 })
    .forEach(([x, z], i) => grass.set(i, x, z, 0.55 + r() * 0.45, 0, r() > 0.5));

  /* -- the rooks ----------------------------------------------------- */
  const loop = [
    { m: ctx.standee(rookTexture(998), 1.7, 1.2, -45, -240), cx: -45, cz: -242, rx: 17, rz: 8, w: 0.34, ph: 0, h: 20 },
    { m: ctx.standee(rookTexture(999), 1.5, 1.05, -40, -236), cx: -42, cz: -238, rx: 22, rz: 11, w: 0.27, ph: 2.2, h: 16 },
    { m: ctx.standee(rookTexture(1000), 1.4, 1, -52, -244), cx: -50, cz: -244, rx: 13, rz: 7, w: 0.42, ph: 4.4, h: 24 },
  ];
  // two more sit the toppled king until the walker breaks the session
  const perched = [
    { m: ctx.standee(rookTexture(1001), 1.5, 1.05, -57.5, -221.6), up: false, ph: 1.1 },
    { m: ctx.standee(rookTexture(1002), 1.4, 1, -54, -222.4), up: false, ph: 3.7 },
  ];
  for (const p of perched) ctx.hang(p.m, 1.9);

  const gateMat = gate.material as THREE.MeshBasicMaterial;
  const keepMat = keep.material as THREE.MeshBasicMaterial;

  return (dt: number, t: number, px: number, pz: number) => {
    // the fires at the gate, on the same clock as Brim's lamps
    lightUp(braziers, clock.lamp);

    // the barbican's arch fade; the curtain wall lets go once the walker
    // is through it (the camera must never shoot the bailey through the
    // back of the wall); the keep steps aside when walked behind
    const gNear = passFade(px, pz, -45, -207, -188);
    gateMat.opacity = 1 - gNear * 0.92;
    // ALL THE WAY OFF, not down to a tenth: since Session 4 the camera
    // stands where the wall is when the walker is in the bailey, and a
    // six-unit wall at ten per cent opacity one unit from the lens is a
    // grey rectangle across the whole frame.
    const past = Math.max(0, Math.min(1, (-pz - 203) / 6));
    for (const seg of wallRun) {
      (seg.material as THREE.MeshBasicMaterial).opacity = 1 - past;
      seg.visible = past < 0.98;
    }
    const behind = Math.max(0, Math.min(1, (-244 - pz) / 6));
    keepMat.opacity = 1 - behind * 0.75;

    // the circling rooks bank like the swallows, slower and darker
    for (const s of loop) {
      const a = t * s.w + s.ph;
      s.m.position.x = s.cx + Math.cos(a) * s.rx;
      s.m.position.z = s.cz + Math.sin(a * 2) * s.rz * 0.5;
      s.m.position.y = ridgeTop + s.h + Math.sin(a * 2.3) * 2.2;
      s.m.scale.x = Math.sin(a) > 0 ? -Math.abs(s.m.scale.x) : Math.abs(s.m.scale.x);
    }

    // the parliament breaks when the walker gets close
    const near = Math.hypot(px + 56, pz + 222) < 4.5;
    for (const p of perched) {
      if (!p.up && near) {
        p.up = true;
        say('rook-caw');
      }
      if (p.up) {
        // join the loop at their own phase; they do not come back soon
        const a = t * 0.36 + p.ph;
        p.m.position.x = -45 + Math.cos(a) * 19;
        p.m.position.z = -242 + Math.sin(a * 2) * 9 * 0.5;
        p.m.position.y = ridgeTop + 14 + Math.sin(a * 2.6) * 2;
        p.m.scale.x = Math.sin(a) > 0 ? -Math.abs(p.m.scale.x) : Math.abs(p.m.scale.x);
        if (!near && Math.hypot(px + 56, pz + 222) > 26) {
          p.up = false;
          const hx = p.ph > 2 ? -54 : -57.5;
          const hz = p.ph > 2 ? -222.4 : -221.6;
          p.m.position.set(hx, ctx.groundY(hx, hz) + 1.9, hz);
        }
      }
    }
  };
};

export const CASTLE_POIS: WorldPOI[] = [
  {
    x: -45, z: -234, radius: 12, label: 'THE KEEP',
    prompt: 'CRANE YOUR NECK',
    note: {
      title: 'castle greyweather',
      body: 'the tallest drawing on the sheet. the banners are mid-snap in a wind nothing else on the page can feel. whoever lives here is never home, or is the wind.',
    },
  },
  {
    x: -45, z: -192, radius: 8, label: 'THE GATEHOUSE',
    prompt: 'READ THE PROCLAMATION',
    note: {
      title: 'the proclamation',
      body: 'a notice is nailed by the arch, weathered past reading. by order of somebody, something is forbidden, or possibly required. the portcullis stays up either way.',
    },
  },
  {
    x: -56, z: -222, radius: 7, label: 'THE TOPPLED KING',
    prompt: 'READ THE PLINTH',
    note: {
      title: 'the toppled king',
      body: 'a king fell over and was left where he landed, sceptre a body\'s length away. the plinth says he was beloved. the rooks say he is comfortable.',
    },
  },
  {
    x: -100, z: -215, radius: 8, label: 'THE MOAT POOL',
    note: {
      title: 'the moat pool',
      body: 'the moat was started, got as far as one satisfying pool, and was left. the castle has decided it counts.',
    },
  },
];

/* ================================================================== *
 * MAPLE COURT — porch lights, picket fences, a green with a swing
 * set. The kind of street the pen draws from memory.
 * ================================================================== */

export const buildNeighborhood: RegionBuilder = (ctx) => {
  const { r, terrain } = ctx;

  const houses: [number, number, number][] = [];
  for (let z = 138; z <= 270; z += 24) {
    houses.push([-63 - r() * 4, z, 0.5]);
    houses.push([-26 + r() * 4, z + 12, -0.5]);
  }
  for (let x = -20; x <= 48; x += 24) {
    houses.push([x, 184 - r() * 4, 0.5]);
    houses.push([x + 12, 220 + r() * 4, -0.5]);
  }
  let hi = 0;
  for (const [x, z, rot] of houses) {
    if (terrain.waterAt(x, z) > 0.04) continue;
    if (Math.hypot(x + 45, z - 200) < 16) continue; // the corner stays open
    if (Math.hypot(x - 0, z - 160) < 14) continue;  // the green
    ctx.standee(suburbanHouseTexture(1000 + hi), 8.8, 6.6, x, z, { rotY: rot * (0.5 + r() * 0.5) });
    // a mailbox out front, sometimes a car
    const mx = x + (rot > 0 ? 5 : -5);
    ctx.standee(mailboxTexture(1030 + hi), 1.1, 1.7, mx, z + 2);
    if (r() > 0.6) ctx.standee(carTexture(1060 + hi), 4.6, 2.3, mx + (r() - 0.5) * 3, z + 5, { rotY: rot > 0 ? 0.2 : -0.2 });
    hi++;
  }

  // picket fences stitch the yards together
  const fences = ctx.field(picketFenceTexture(1100), 40, { w: 5.4, h: 1.7 });
  let fi = 0;
  for (let z = 132; z <= 272 && fi < 20; z += 14, fi++) {
    fences.set(fi, -74, z, 1, Math.PI / 2, false);
  }
  for (let x = -18; x <= 50 && fi < 40; x += 12, fi++) {
    fences.set(fi, x, 236, 1, 0, false);
  }

  const trees = ctx.field(streetTreeTexture(1101), 30, { w: 4.6, h: 6.3 });
  ctx.scatter(30, { minDist: 10 }).forEach(([x, z], i) =>
    trees.set(i, x, z, 0.75 + r() * 0.5, 0, r() > 0.5));

  const grass = ctx.field(grassTexture(), 80, { w: 1.6, h: 1.1 });
  ctx.scatter(80, { minDist: 3 }).forEach(([x, z], i) =>
    grass.set(i, x, z, 0.6 + r() * 0.5, 0, r() > 0.5));

  // the green
  ctx.standee(swingSetTexture(1110), 6.4, 4.8, 0, 158);
  ctx.standee(benchTexture(1111), 3.6, 1.8, -8, 164, { rotY: 0.4 });
  ctx.standee(streetTreeTexture(1112), 5.4, 7.4, 8, 150);
  ctx.standee(signpostTexture(1113), 3.4, 4.1, -40, 196);

  const folk = ctx.field(doodleFolkTexture(1120), 6, { w: 1.15, h: 1.9 });
  ctx.scatter(6, { minDist: 20 }).forEach(([x, z], i) =>
    folk.set(i, x, z, 0.85 + r() * 0.25, 0, r() > 0.5));
};

export const NEIGHBORHOOD_POIS: WorldPOI[] = [
  {
    x: 0, z: 158, radius: 8, label: 'THE GREEN',
    prompt: 'SIT A WHILE',
    note: {
      title: 'the green',
      body: 'a swing set drawn mid-sway. somewhere a sprinkler the pen only wrote the sound of. it is always almost dinnertime here.',
    },
  },
  { x: -45, z: 170, radius: 7, label: 'THE RIVER BRIDGE' },
];

/* ================================================================== *
 * GREYLINE CITY — downtown. Hatched towers, lit windows, shopfronts
 * under awnings, and the junction that thinks it is the center of
 * the world (it is a four-way stop).
 * ================================================================== */

export const buildCity: RegionBuilder = (ctx) => {
  const { r, terrain } = ctx;

  // towers hold the street grid: mill lane (x≈150) and main street (z≈203)
  const spots: [number, number][] = [];
  for (let z = 145; z <= 270; z += 21) {
    spots.push([131 - r() * 4, z], [170 + r() * 4, z + 10]);
  }
  for (let x = 72; x <= 128; x += 20) {
    spots.push([x, 186 - r() * 4], [x + 8, 224 + r() * 4]);
  }
  for (let x = 186; x <= 222; x += 20) {
    spots.push([x, 184 - r() * 4], [x + 6, 226 + r() * 4]);
  }
  let ti = 0;
  for (const [x, z] of spots) {
    if (terrain.waterAt(x, z) > 0.04 || terrain.roadAt(x, z)) continue;
    if (Math.hypot(x - 150, z - 203) < 15) continue;
    const floors = 5 + Math.floor(r() * 7);
    const hpx = 64 + floors * 30;
    ctx.standee(towerBlockTexture(1200 + ti, floors), 9.6, 9.6 * (hpx / 192), x, z);
    ti++;
  }

  // shopfronts at street level on main street
  for (let i = 0; i < 5; i++) {
    ctx.standee(shopfrontTexture(1240 + i), 7, 5, 76 + i * 15, 213, { rotY: -0.06 });
  }
  for (let i = 0; i < 3; i++) {
    ctx.standee(shopfrontTexture(1250 + i), 7, 5, 96 + i * 17, 193, { rotY: Math.PI });
  }

  // the junction
  for (const [x, z, rot] of [[143, 196, 0], [157, 196, 0.4], [143, 211, -0.4], [157, 211, 0.2]] as
    [number, number, number][]) {
    ctx.standee(trafficLightTexture(1260), 1.6, 5.6, x, z, { rotY: rot });
  }
  ctx.standee(busStopTexture(1265), 5.4, 5, 122, 210, { rotY: Math.PI });

  const benches = ctx.field(benchTexture(1270), 8, { w: 3.4, h: 1.7 });
  [[80, 208], [104, 196], [170, 210], [140, 190], [160, 240], [138, 260], [200, 196], [214, 212]]
    .forEach(([x, z], i) => benches.set(i, x, z, 1, (r() - 0.5) * 0.6, r() > 0.5));
  const planters = ctx.field(planterTexture(1271), 10, { w: 2, h: 2 });
  ctx.scatter(10, { minDist: 12 }).forEach(([x, z], i) =>
    planters.set(i, x, z, 0.9 + r() * 0.3, 0, false));

  const folk = ctx.field(doodleFolkTexture(1280), 14, { w: 1.15, h: 1.9 });
  ctx.scatter(14, { minDist: 9, allowRoad: true }).forEach(([x, z], i) =>
    folk.set(i, x, z, 0.85 + r() * 0.25, 0, r() > 0.5));

  const lamps = ctx.field(lamppostTexture(1281), 10, { w: 1.7, h: 6 });
  for (let i = 0; i < 5; i++) {
    lamps.set(i * 2, 78 + i * 30, 197, 1, 0, false);
    lamps.set(i * 2 + 1, 92 + i * 30, 209, 1, 0, true);
  }
};

export const CITY_POIS: WorldPOI[] = [
  {
    x: 150, z: 203, radius: 9, label: 'THE JUNCTION',
    prompt: 'WAIT FOR THE LIGHT',
    note: {
      title: 'the junction',
      body: 'four traffic lights, all drawn green. the city has never once had to stop, and looks a little tired about it.',
    },
  },
  { x: 100, z: 205, radius: 8, label: 'MAIN STREET' },
];

/* ================================================================== *
 * THE CUBICLE MILE — glass, hedges, one bus stop, and the long lunch
 * hour of the soul. The floors are polished; your steps say so.
 * ================================================================== */

export const buildOffice: RegionBuilder = (ctx) => {
  const { r, terrain } = ctx;

  const spots: [number, number][] = [];
  for (let x = 250; x <= 360; x += 26) {
    spots.push([x, 176 - r() * 8], [x + 10, 236 + r() * 8]);
  }
  spots.push([248, 155], [330, 152], [365, 250], [255, 262]);
  let gi = 0;
  for (const [x, z] of spots) {
    if (terrain.waterAt(x, z) > 0.04 || terrain.roadAt(x, z)) continue;
    const floors = 7 + Math.floor(r() * 7);
    const hpx = 60 + floors * 28;
    ctx.standee(glassTowerTexture(1300 + gi, floors), 10, 10 * (hpx / 192), x, z);
    gi++;
  }

  // hedges: clipped bushes in disciplined rows
  const hedges = ctx.field(bushTexture(1320), 30, { w: 2.6, h: 1.7 });
  let hi = 0;
  for (let x = 240; x <= 372 && hi < 15; x += 9, hi++) hedges.set(hi, x, 194, 1, 0, false);
  for (let x = 244; x <= 372 && hi < 30; x += 9, hi++) hedges.set(hi, x, 216, 1, 0, true);

  ctx.standee(busStopTexture(1330), 5.4, 5, 252, 212, { rotY: Math.PI });
  const benches = ctx.field(benchTexture(1331), 6, { w: 3.4, h: 1.7 });
  ctx.scatter(6, { minDist: 16 }).forEach(([x, z], i) =>
    benches.set(i, x, z, 1, (r() - 0.5) * 0.5, r() > 0.5));
  const planters = ctx.field(planterTexture(1332), 12, { w: 2, h: 2 });
  ctx.scatter(12, { minDist: 10 }).forEach(([x, z], i) =>
    planters.set(i, x, z, 0.9 + r() * 0.3, 0, false));

  const folk = ctx.field(doodleFolkTexture(1340), 8, { w: 1.15, h: 1.9 });
  ctx.scatter(8, { minDist: 14, allowRoad: true }).forEach(([x, z], i) =>
    folk.set(i, x, z, 0.85 + r() * 0.25, 0, r() > 0.5));
};

export const OFFICE_POIS: WorldPOI[] = [
  {
    x: 252, z: 212, radius: 7, label: 'THE 8:15 STOP',
    prompt: 'CHECK THE TIMETABLE',
    note: {
      title: 'the 8:15 stop',
      body: 'the timetable says the 8:15 is coming. the 8:15 is drawn nowhere on this sheet. everyone waiting knows both of these things and has made their peace.',
    },
  },
  {
    x: 300, z: 200, radius: 10, label: 'THE CUBICLE MILE',
    note: {
      title: 'the cubicle mile',
      body: 'towers of ruled glass, the only part of the world drawn with a straightedge. your footsteps go glossy here, like the floor is proud of itself.',
    },
  },
];
