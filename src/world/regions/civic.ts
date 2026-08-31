import * as THREE from 'three';
import { grassTexture } from '../../engine/ink';
import {
  lamppostTexture, bannerTexture, boulderTexture, wellTexture,
  mailboxTexture, carTexture, picketFenceTexture,
  streetTreeTexture, swingSetTexture, glassTowerTexture,
  benchTexture, busStopTexture,
  planterTexture, doodleFolkTexture, bushTexture,
  lampGlowTexture, brazierTexture,
} from '../textures';
import {
  courtHouseTexture, courtHouseLitTexture, valHouseTexture, valPorchLitTexture,
  clippedHedgeTexture, gardenChairTexture, latchGateTexture, valTexture,
  juneTexture, pillarBoxTexture, binTexture, surveyPegTexture,
  mownLawnDecal, drivewayDecal, kerbRunDecal, emptyPlotDecal, roadEndDecal, hopscotchDecal,
  greylineTowerTexture, greylineTowerLitTexture, farSkylineTexture, shopRowTexture,
  wornPathsDecal, pavingDecal, hardBenchTexture, junctionManTexture,
  commuterTexture, lightMastTexture, fireEscapeTexture, hoardingTexture,
  revolvingDoorTexture, grateDecal, grateSteamTexture, cityBinsTexture,
  hollowWallTexture,
} from '../textures-now';
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
  const stallShut = ctx.standee(margetStallTexture(1484, false), 5.4, 5.4, -40.5, -75.5);
  const stallOpen = ctx.standee(margetStallTexture(1485, true), 5.4, 5.4, -40.5, -75.5);
  // at the stall's west post and half a unit in front of it, so she
  // reads as the person behind the counter and not as one more figure
  // standing about in a square that already has sixteen of them
  const marget = ctx.standee(margetTexture(1486), 1.45, 2.6, -43.1, -75.0);
  for (const m of [stallShut, stallOpen, marget]) {
    (m.material as THREE.MeshBasicMaterial).transparent = true;
  }
  /* THE BOARD. Chalked at the cross the day the market is called, and
   * never taken down: the permanent half of the change, standing at
   * every hour including the sixteen the stall is packed away for. */
  const marketBoard = ctx.standee(marketBoardTexture(1487), 3.2, 2.3, -38.6, -69.6,
    { rotY: -0.16 });
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
    /* AND SO DOES EVERYBODY ELSE. Marget's routine only reads as a
     * routine if the town keeps one too: a square with sixteen people
     * standing in it at three in the morning makes her going home look
     * like a bug rather than a day. They leave a little later than she
     * does and come back a little later, because she is the one who is
     * always first. */
    folk.setDim(Math.min(
      Math.max(0, Math.min(1, (clock.hour - 6.1) / 1.0)),
      Math.max(0, Math.min(1, (21.2 - clock.hour) / 1.0))
    ));
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
        /* THE ARC IS ABOVE THE GROUND, not above zero. This animation
         * was written in Session 3, when the sheet was flat and y = 0
         * was the flagstones; Session 4 gave the page a shape and Brim
         * Square went up to y ≈ 3.55, and from that session on every
         * pigeon put up has dropped three and a half units THROUGH the
         * square, flown its whole arc underneath it — the peak of the
         * arc is 2.3, which never reaches the paving — and popped back
         * up on landing. Read from the shipping camera that is not a
         * bird flying away, it is a bird vanishing.
         * (Owner, 2026-08-30. Four sessions in the game.) */
        p.m.position.set(p.x, ctx.groundY(p.x, p.z) + Math.sin(u * Math.PI) * 2.3, p.z);
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
      body: 'the fountain has run since before the walls did. the stalls are set out, the bunting is up, and there is nothing on any of the counters, because market day here has been next week for a long time.',
    },
  },
  {
    x: -45, z: -14, radius: 8, label: 'THE SOUTH GATE',
    note: {
      title: 'the south gate',
      body: 'the portcullis has been up so long the chain has gone stiff in its housing. either the kingdom has no enemies, or its enemies have given it up too, and everyone has agreed to be civil about it.',
    },
  },
  {
    x: -64, z: -42, radius: 7, label: 'THE BELFRY',
    prompt: 'WAIT FOR THE BELL',
    note: {
      title: 'the belfry',
      body: 'the clock\'s two hands have disagreed for as long as anybody can remember and neither will give ground. the bell splits the difference and rings when it judges the hour has been earned. brim has been taking the bell\'s word for it ever since.',
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
      body: 'a market is called from here, at the hour the bell strikes, and there is a step worn into the base from the calling. nobody in brim has been able to agree what hour the bell struck for a very long time. the step has not been stood on in living memory.',
    },
  },
  {
    x: -103, z: -70, radius: 12, label: 'THE ORCHARD CLOSE',
    prompt: 'SCRUMP AN APPLE',
    note: {
      title: 'the orchard close',
      body: 'twelve trees inside the walls, counted twice a day by a warden who has never once come back with a different number. they are all the same tree, grafted off itself for as long as the walls have been up, and all going the same way at the same rate.',
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
      body: 'the tallest thing anybody in this world has stood under. the banners are mid-snap in a wind nothing at ground level can feel. whoever lives here is never home, or is the wind.',
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
 * MAPLE COURT — a street that keeps its arrangements.
 *
 * Session 13, to `design/specs/maple-court.md`.
 *
 * THE DRAFT THIS REPLACES was two `for` loops: houses every twenty-four
 * units down two fixed offsets, a picket fence every fourteen, thirty
 * street trees and eighty tufts of grass on a Poisson scatter, and a
 * signpost. That is even spacing, repeated silhouettes and uniform
 * density, which is the three-part definition of "reads as an array"
 * (`QUALITY-BAR` §4).
 *
 * ── WHAT REPLACES IT, AND IT IS A SENTENCE ABOUT THE SURVEY ─────────
 *
 * **The street thins to nothing as it goes south, and the reason is
 * that the survey ran out.** The north end, where the Common is, is the
 * oldest and the densest: a court off the king's road with a turning
 * circle and eleven houses round it. Main street is the middle. South
 * of main street the plots get bigger and further apart, then there are
 * two plots with kerbs and dropped kerbs and driveways and NO HOUSES,
 * and then there is nothing at all for sixteen units, and then the edge
 * of the world.
 *
 * That gradient does three jobs at once and it is why it is the plan:
 * it is a density that means something rather than a density that fills;
 * it is `THE-LINE.md` §3.2's protected corridor obeyed by the land's own
 * story instead of by a constraint; and it is what the walk SOUTH sees,
 * which is the one motion Session 12 kept and improved.
 *
 * ── THE CORRIDOR, AND IT IS A HARD RULE ─────────────────────────────
 *
 * Nothing tall stands within eight units of x = −45 between z = 120 and
 * z = 278 (`THE-LINE` §3.2). Every house here is authored at least
 * twelve units off the axis so that its DRAWING clears the corridor as
 * well as its origin, every scatter is bounded by `offLine`, and
 * `tools/check-sightline.mjs` asserts the whole run against the world's
 * own skyline grid so no later session can put a tree in it.
 * ================================================================== */

/** THE LINE'S AXIS, and how much air it is owed either side. */
const LINE_X = -45;
const LINE_CLEAR = 8;
/** Nothing tall may go here. Used as `scatter({ avoid })` and asserted
 *  by `tools/check-sightline.mjs`. */
const inLine = (x: number, z: number) =>
  z > 118 && z < 280 && Math.abs(x - LINE_X) < LINE_CLEAR + 5;

/** VAL'S, at the head of the court (`THE-WAITS` §3). */
const VAL = { x: -78, z: 128 };
/** The three chairs, and the hedge they face (`WORLD-SYSTEMS` §10). */
const CHAIRS = { x: -61, z: 134 };
const HEDGE_Z = 126;
/** JUNE'S GATE and the fence at the end of the road
 *  (`THE-STRANGERS` S3). */
const JUNE_GATE = { x: 50, z: 191 };
const JUNE_FENCE = { x: 55.5, z: 197.2 };

export const buildNeighborhood: RegionBuilder = (ctx) => {
  const { r } = ctx;

  /* ---- the shared drawings, made ONCE (Session 10's costing) ------- */
  const HOUSE = [0, 1, 2].map((v) => courtHouseTexture(8000 + v, v as 0 | 1 | 2));
  const HOUSE_LIT = [0, 1, 2].map((v) => courtHouseLitTexture(8010 + v, v as 0 | 1 | 2));
  const LAWN = [0, 1].map((v) => mownLawnDecal(8600 + v, v as 0 | 1));
  const DRIVE = [0, 1].map((v) => drivewayDecal(8610 + v, v as 0 | 1));

  /* ================================================================ *
   * THE PLOTS. Authored, one line each, and there is not a loop in it.
   *
   *   x, z      where the house stands
   *   rot       which way it is turned — no two neighbours agree
   *   kind      which of the three drawings
   *   lit       whether anybody is in at dusk. **Most of them are not**,
   *             and that is the whole of `THE-WAITS` §3: a dark house on
   *             this road means the family went, and Val will not be the
   *             one who makes the road look like that.
   *   car/bin   what is out the front
   * ================================================================ */
  type Plot = { x: number; z: number; rot: number; kind: 0 | 1 | 2; lit?: boolean; car?: boolean; bin?: boolean; lawn?: boolean };
  const PLOTS: Plot[] = [
    /* the court, round the circle — the oldest part of the street */
    { x: -90, z: 134, rot: 0.36, kind: 1, car: true, lawn: true },
    { x: -89, z: 147, rot: 0.16, kind: 0, lit: true, bin: true, lawn: true },
    { x: -68, z: 135, rot: -0.3, kind: 2, lawn: true },
    { x: -70, z: 152, rot: -0.12, kind: 0, car: true, lawn: true },
    { x: -92, z: 160, rot: 0.1, kind: 2, lit: true, lawn: true },
    /* the east side of the king's road, north block */
    { x: -32, z: 141, rot: -0.22, kind: 0, car: true, lawn: true },
    { x: -30, z: 155, rot: -0.08, kind: 1, bin: true },
    { x: -30, z: 114 + 60, rot: 0.2, kind: 2, lit: true, lawn: true },   // z 174
    /* main street's own frontage: set back, and one of them is a shop's
     * worth of hedge and nothing else */
    { x: -62, z: 213, rot: 0.14, kind: 0, lit: true, car: true, lawn: true },
    { x: -74, z: 219, rot: 0.3, kind: 2, bin: true },
    { x: -31, z: 214, rot: -0.16, kind: 1, lawn: true },
    { x: -21, z: 221, rot: -0.34, kind: 0, car: true },
    { x: 6, z: 212, rot: 0.1, kind: 2, lit: true, lawn: true },
    { x: 24, z: 218, rot: -0.2, kind: 0, bin: true },
    { x: 41, z: 211, rot: 0.26, kind: 1, car: true, lawn: true },
    /* south of main street the plots get bigger and further apart */
    { x: -70, z: 233, rot: 0.22, kind: 1, lawn: true },
    { x: -32, z: 236, rot: -0.1, kind: 0, lit: true, car: true, lawn: true },
    { x: -19, z: 249, rot: -0.4, kind: 2 },
    { x: -78, z: 251, rot: 0.44, kind: 0, bin: true },
    /* and then one on its own, and it is the last house in the world */
    { x: -31, z: 259, rot: 0.06, kind: 1, lawn: true },
  ];

  const lits: THREE.Mesh[] = [];
  for (let i = 0; i < PLOTS.length; i++) {
    const p = PLOTS[i];
    const w = p.kind === 1 ? 9.6 : 8.8;
    const h = p.kind === 1 ? 5.4 : p.kind === 2 ? 7.0 : 6.6;
    ctx.standee(HOUSE[p.kind], w, h, p.x, p.z, { rotY: p.rot });
    if (p.lit) {
      const m = ctx.standee(HOUSE_LIT[p.kind], w, h, p.x, p.z, { rotY: p.rot, opacity: 0 });
      (m.material as THREE.MeshBasicMaterial).transparent = true;
      lits.push(m);
    }
    // the front garden: a lawn, a drive, and what is standing on it
    const front = p.z + 6.5;
    if (p.lawn) ctx.decal(LAWN[i % 2], 11, 9, p.x - 2.5, front, p.rot * 0.5, 0.5);
    if (p.car || p.bin) {
      ctx.decal(DRIVE[p.car ? 1 : 0], 4.6, 9, p.x + 4.4, front, p.rot * 0.5, 0.66);
    }
    if (p.car) {
      ctx.standee(carTexture(8700 + i), 4.6, 2.3, p.x + 4.4, front + 1.2,
        { rotY: p.rot > 0 ? 0.24 : -0.24 });
    }
    if (p.bin) ctx.standee(binTexture(8720 + i), 1.1, 1.5, p.x + 5.2, front + 4.2);
    ctx.standee(mailboxTexture(8740 + i), 1.0, 1.6,
      p.x + (p.x < LINE_X ? -5.8 : 5.8), front + 4.6);
  }

  /* ---- one drive with a hopscotch on it, mostly rained off --------- *
   * Nobody says whose it was. Nobody in Maple Court would be so rude
   * (`THE-WAITS` §3, and it is the land's whole manner).              */
  ctx.decal(hopscotchDecal(8604), 2.6, 5.2, -65.5, 160.5, 0.1, 0.85);

  /* ================================================================ *
   * THE COURT — the street the land is named after, and it is a dead
   * end that comes back to itself (`layout.ts` draws the road; this is
   * what stands round it).
   *
   * VAL'S HOUSE is at the head of it, north-facing camera dead on, so
   * a walker coming up the court at any hour after about seven has one
   * lit porch in front of them and eleven dark houses behind them.
   * That is THE SHOT, and it is `THE-WAITS` §3's turn photographed:
   * she is not holding a light for the people who left, she is holding
   * the street's line.
   * ================================================================ */
  ctx.standee(valHouseTexture(8100), 10.6, 8.6, VAL.x, VAL.z);
  const porch = ctx.standee(valPorchLitTexture(8101), 10.6, 8.6, VAL.x, VAL.z, { opacity: 0 });
  (porch.material as THREE.MeshBasicMaterial).transparent = true;
  ctx.decal(LAWN[0], 13, 10, VAL.x - 1, VAL.z + 7.5, 0, 0.5);
  ctx.standee(picketFenceTexture(8110), 5.4, 1.3, VAL.x - 5.8, VAL.z + 8.4, { rotY: 0.04 });
  ctx.standee(picketFenceTexture(8111), 5.4, 1.3, VAL.x + 5.6, VAL.z + 8.2, { rotY: -0.03 });
  ctx.standee(pillarBoxTexture(8400), 1.3, 2.2, -71.5, 149.5, { rotY: 0.2 });

  /* VAL, and she has two postures and no face. Out at the gate in the
   * evening looking up her own street; and, once in the morning, the
   * bin. `WORLD-SYSTEMS` §5: one visible want each, expressed by where
   * they stand and never by a line of dialogue. */
  const val = [0, 1].map((p) =>
    ctx.standee(valTexture(8120 + p, p as 0 | 1), 1.15, 2.05, VAL.x + 3.4, VAL.z + 8.8));
  for (const m of val) (m.material as THREE.MeshBasicMaterial).transparent = true;

  /* ================================================================ *
   * THE THREE CHAIRS AND THE HEDGE (`WORLD-SYSTEMS` §10's tableau).
   *
   * Three chairs facing a hedge is a joke about suburbia until you
   * notice that the hedge closed over a GAP. Come back holding the
   * castle's name — which means you have stood under Greyweather — and
   * the gap is cut back open, and it stays cut.
   *
   * **THE CHAIRS FACE NORTH**, because the camera only ever looks north
   * and the whole beat is a sightline (`THE-WAITS` §3's authoring note,
   * in capitals, and Session 12 removed the last excuse for ignoring
   * it: a vista you cannot look along is not a vista). What is through
   * the gap is a hundred and eighty units of the Common and then the
   * pencil ridge over Brim — the same false-perspective keep this game
   * has shown from the meadow since Session 2, seen from a back garden.
   *
   * Nothing is written on any of it. The land does not have a note
   * about the chairs and it is not getting one.
   * ================================================================ */
  const hedgeShut = ctx.standee(clippedHedgeTexture(8200, false), 15, 2.5, CHAIRS.x, HEDGE_Z);
  const hedgeCut = ctx.standee(clippedHedgeTexture(8201, true), 15, 2.5, CHAIRS.x, HEDGE_Z);
  for (const m of [hedgeShut, hedgeCut]) {
    (m.material as THREE.MeshBasicMaterial).transparent = true;
  }
  /* Three chairs, and NOT at even spacing: somebody sat in them and
   * pushed them back, and the middle one is a little out of line with
   * the other two. Even spacing is the thing the bar forbids and it is
   * also, here, the thing that would make them furniture instead of a
   * tableau. */
  ([[-4.1, 0.2, 0, 0.06], [-0.4, -0.7, 1, -0.13], [3.2, 1.1, 2, 0.2]] as
    [number, number, 0 | 1 | 2, number][]).forEach(([dx, dz, v, rot]) =>
    ctx.standee(gardenChairTexture(8210 + v, v), 1.15, 1.25,
      CHAIRS.x + dx, CHAIRS.z + dz, { rotY: rot }));
  ctx.decal(LAWN[1], 17, 13, CHAIRS.x, CHAIRS.z + 5, 0, 0.42);
  /* The hedge runs on either side of the garden, and both returns are
   * SHORT. Round 3 of the gate carried two eleven-unit hedges turned
   * ninety degrees, and a flat cutout seen almost edge-on does not read
   * as a hedge going away from you — it reads as a card standing in a
   * field. Three units each, tucked against the ends of the run. */
  ctx.standee(clippedHedgeTexture(8202, false), 3.4, 2.3, CHAIRS.x - 7.4, HEDGE_Z + 1.7,
    { rotY: Math.PI / 2 });
  ctx.standee(clippedHedgeTexture(8203, false), 3.4, 2.3, CHAIRS.x + 7.4, HEDGE_Z + 1.7,
    { rotY: Math.PI / 2 });

  /* ================================================================ *
   * THE GREEN (built since Session 1; it has a note and it keeps it).
   * A swing set moving gently with nobody on it, a bench, one big tree
   * and the sprinkler you never do find the lawn of.
   * ================================================================ */
  const GREEN = { x: 2, z: 178 };
  const swing = ctx.standee(swingSetTexture(8800), 6.4, 4.8, GREEN.x, GREEN.z);
  /* Portrait's frame is twenty-six degrees wide, and round 7's shot of
   * this place was a swing set alone on a lawn with the bench and both
   * trees outside the picture. A place is composed for the NARROW
   * frame and allowed to be generous in the wide one. */
  ctx.standee(benchTexture(8801), 3.6, 1.8, GREEN.x - 4.6, GREEN.z + 3.2, { rotY: 0.36 });
  ctx.standee(streetTreeTexture(8802), 6.2, 8.4, GREEN.x + 5.4, GREEN.z - 2.6);
  ctx.standee(streetTreeTexture(8803), 4.8, 6.6, GREEN.x - 7.4, GREEN.z - 6.5);
  ctx.decal(LAWN[0], 26, 20, GREEN.x, GREEN.z + 1, 0.04, 0.42);

  /* ================================================================ *
   * JUNE'S GATE — `THE-STRANGERS` S3, beat one, and it is a detail a
   * millimetre across: the latch plate is worn bright from being lifted
   * and set back every night for years.
   *
   * The house is the last one before the border. The fence is the end
   * of the road. Bring back what you saw at the junction and she is at
   * the fence, and she stays there in every later save — forty-odd
   * units from a man on the other side of a line neither of them can
   * cross, and **nothing in this game ever says so.**
   * ================================================================ */
  ctx.standee(HOUSE[2], 8.8, 7.0, JUNE_GATE.x, JUNE_GATE.z - 5.5, { rotY: -0.06 });
  ctx.decal(LAWN[1], 12, 10, JUNE_GATE.x, JUNE_GATE.z - 2, 0, 0.32);
  ctx.standee(latchGateTexture(8300), 4.6, 2.5, JUNE_GATE.x, JUNE_GATE.z + 0.5);
  const june = [0, 1].map((p) =>
    ctx.standee(juneTexture(8310 + p, p as 0 | 1), 1.15, 2.05,
      p === 0 ? JUNE_GATE.x - 2.2 : JUNE_FENCE.x, p === 0 ? JUNE_GATE.z + 1 : JUNE_FENCE.z));
  for (const m of june) (m.material as THREE.MeshBasicMaterial).transparent = true;
  /* THE FENCE AT THE END OF THE ROAD, and it runs ACROSS it.
   *
   * Round 5 laid it north–south along the border, which is where a
   * border fence goes — and the camera only ever looks north, so five
   * panels turned ninety degrees came back as one grey streak with a
   * woman standing beside it. A thing you walk ALONG runs north–south;
   * a thing you LOOK AT runs east–west. This is a thing you look at. */
  for (let i = 0; i < 4; i++) {
    ctx.standee(picketFenceTexture(8320 + i), 5.4, 1.6, 40 + i * 5.3,
      197.6 + (i % 2) * 0.4, { rotY: (i - 1.5) * 0.02 });
  }
  ctx.standee(picketFenceTexture(8324), 4.4, 1.6, 58.2, 200.5, { rotY: Math.PI / 2 });

  /* ================================================================ *
   * THE PLOTS THAT WERE NEVER BUILT ON, and then the end of the road.
   *
   * `THE-LINE.md` §3.2: *"the road stops sixteen units short of the edge
   * of the world and no session has ever said why. Now it has a reason:
   * that is where the survey ran out."* So the last two hundred yards
   * of Maple Court are kerbs, dropped kerbs and driveways with nothing
   * behind them, the tarmac goes to gravel and then to grass, and there
   * are three pegs in the ground.
   *
   * **There is no note here and there never will be.** It is the one
   * place in the game important enough to leave unlettered.
   * ================================================================ */
  for (const [x, z, rot] of [
    [-63, 238, 0.02], [-63, 250, 0.02], [-27, 244, -0.03], [-27, 256, -0.03],
  ] as [number, number, number][]) {
    ctx.decal(emptyPlotDecal(8900 + z), 22, 16, x, z, rot, 0.62);
  }
  /* THE KERBS, and they run from main street to where the survey
   * stopped. They are marks on the page, so they may lie in the
   * corridor nothing is allowed to stand in — and two converging lines
   * are the only thing that makes a hundred units of empty road read as
   * a road rather than as a smear. */
  const KERB = [0, 1].map((v) => kerbRunDecal(8920 + v));
  for (let i = 0; i < 4; i++) {
    ctx.decal(KERB[i % 2], 12, 16, -45, 202 + i * 15.6, 0, 0.62);
  }
  ctx.decal(roadEndDecal(8910), 13, 18, -45, 264, 0, 0.8);
  ctx.standee(surveyPegTexture(8500, false), 0.5, 0.55, -46.4, 267.5, { rotY: 0.3 });
  ctx.standee(surveyPegTexture(8501, false), 0.5, 0.55, -44.6, 272.5, { rotY: -0.2 });
  ctx.standee(surveyPegTexture(8502, true), 0.9, 0.4, -45.6, 276.5, { rotY: 0.5 });

  /* ================================================================ *
   * THE PLANTING — and every last piece of it is bounded off the line.
   *
   * The draft scattered thirty street trees with `minDist: 10` and no
   * `avoid`, and `scatter` only dodges the road's own PAINT, which is
   * five units wide against a corridor that is sixteen. A tree could
   * therefore land legally beside the king's road and inside the one
   * sightline in this game that cannot afford it.
   * ================================================================ */
  const offLine = (x: number, z: number) => inLine(x, z);
  const trees = ctx.field(streetTreeTexture(8950), 26, { w: 4.6, h: 6.3, wind: { amp: 0.05, freq: 0.5 } });
  {
    // street trees stand in verges, so they are authored in short runs
    // beside the streets rather than sprinkled over the land
    const spots: [number, number][] = [];
    for (const [x0, z0, dx, dz, n] of [
      [-86, 143, 0, 9, 4], [-30, 139, 0, 11, 3], [-30, 205, 13, 1.5, 5],
      [-29, 226, -1, 12, 3], [-74, 208, 6, 1, 3], [8, 200, 12, -1.5, 3],
    ] as [number, number, number, number, number][]) {
      for (let i = 0; i < n; i++) {
        const x = x0 + dx * i + (r() - 0.5) * 3;
        const z = z0 + dz * i + (r() - 0.5) * 3;
        if (offLine(x, z)) continue;
        spots.push([x, z]);
      }
    }
    spots.forEach(([x, z], i) => trees.set(i, x, z, 0.8 + r() * 0.5, 0, r() > 0.5));
  }
  const grass = ctx.field(grassTexture(), 60, { w: 1.6, h: 1.1, wind: { amp: 0.08, freq: 0.7 } });
  ctx.scatter(60, { minDist: 5, avoid: offLine }).forEach(([x, z], i) =>
    grass.set(i, x, z, 0.6 + r() * 0.5, 0, r() > 0.5));
  const fences = ctx.field(picketFenceTexture(8960), 24, { w: 5.4, h: 1.7 });
  {
    // fences stitch the yards of the court together and stop where the
    // street does
    let fi = 0;
    for (const [x0, z0, n, rot] of [
      [-86, 130, 5, Math.PI / 2], [-53, 150, 3, 0],
      [-30, 210, 4, 0], [16, 206, 5, 0], [-70, 224, 4, 0],
    ] as [number, number, number, number][]) {
      for (let i = 0; i < n && fi < 24; i++) {
        const x = rot === 0 ? x0 + i * 5.4 : x0;
        const z = rot === 0 ? z0 : z0 + i * 5.4;
        if (offLine(x, z)) continue;
        fences.set(fi++, x, z, 1, rot, false);
      }
    }
  }

  /* ---- and the folk, and there are three of them ------------------- *
   * A suburb at four in the afternoon is not empty and it is not busy.
   * Three people at the far end of what you can see is exactly right,
   * and the fourth would be a crowd.                                   */
  const folk = ctx.field(doodleFolkTexture(8970), 3, { w: 1.15, h: 1.9 });
  [[-88, 206], [14, 232], [-30, 176]].forEach(([x, z], i) =>
    folk.set(i, x, z, 0.95 + r() * 0.12, 0, r() > 0.5));

  /* ================================================================ */
  let sprinkler = 6;
  let dog = 21;
  return (dt: number, _t: number, px: number, pz: number) => {
    const h = clock.hour;

    /* THE PORCH LIGHT, AND IT NEVER GOES ALL THE WAY OUT.
     *
     * Everything else on this street lights at dusk and is dark at
     * noon, the way Brim's lamps have been since Session 6. Val's porch
     * is the exception and it is the whole wait: it is on at every
     * hour, including the ones nobody is awake for. In daylight it is
     * a bulb doing nothing that you can still see is on. */
    const dusk = Math.max(
      Math.min(1, (h - 17.4) / 2.2),
      Math.min(1, (6.6 - h) / 1.8)
    );
    const k = Math.max(0, Math.min(1, dusk));
    lightUp(lits, k);
    (porch.material as THREE.MeshBasicMaterial).opacity = 0.3 + k * 0.7;
    porch.visible = true;

    /* THE GAP IS CUT BACK OPEN, and it stays cut. You have stood under
     * Greyweather; the hedge at the bottom of this garden has a notch
     * in it now, and through the notch there is a ridge. */
    const seen = knowledge.has('name:castle');
    hedgeShut.visible = !seen;
    hedgeCut.visible = seen;

    /* VAL'S DAY. Out at the gate in the evening, looking up her own
     * street; the bin, once, early. She is not in shot at night and she
     * is not in shot in the middle of the day. */
    const pose = h > 18.2 && h < 20.8 ? 0 : h > 7.2 && h < 8.4 ? 1 : -1;
    for (let p = 0; p < 2; p++) val[p].visible = p === pose;

    /* JUNE. At her gate in the evening — and at the fence, always, once
     * you have brought back what you saw at the junction. */
    const told = knowledge.has('fact:the-man-at-the-junction');
    june[0].visible = !told && h > 17.6 && h < 21;
    june[1].visible = told;

    /* THE SPRINKLER YOU NEVER FIND, and the dog two streets over. Both
     * of them are sounds with nothing drawn anywhere in the land to
     * make them, which is the point (`WORLD-SYSTEMS` §5): a suburb is
     * mostly other people's afternoons, heard. */
    const near = pz > 130 && pz < 250 && px > -110 && px < 55;
    if (near) {
      sprinkler -= dt;
      if (sprinkler < 0) {
        sprinkler = 13 + Math.random() * 15;
        if (h > 8 && h < 20.5) say('sprinkler');
      }
      dog -= dt;
      if (dog < 0) {
        dog = 26 + Math.random() * 30;
        // a door on a spring in the evening, a dog the rest of the time
        say(h > 17 && h < 21.5 ? 'screen-door' : 'far-dog');
      }
    }
    // the swing, and nobody is on it
    swing.rotation.z = Math.sin(_t * 0.8) * 0.055 + Math.sin(_t * 0.31) * 0.02;
  };
};

export const NEIGHBORHOOD_POIS: WorldPOI[] = [
  {
    x: 2, z: 178, radius: 8, label: 'THE GREEN',
    prompt: 'SIT A WHILE',
    note: {
      title: 'the green',
      body: 'a swing set moving, gently, with nobody on it. somewhere behind a hedge a sprinkler is going, and you never do find the lawn it is on. it is always almost dinnertime here.',
    },
  },
  {
    /* The label sits over the circle rather than over the house: the
     * skyline writes a name above the tallest thing UNDER it, and the
     * tallest thing here is the porch Val is the reason for. */
    x: -78, z: 140, radius: 9, label: 'MAPLE COURT',
    prompt: 'LOOK UP THE STREET',
    note: {
      title: 'maple court',
      body: 'eleven houses round a circle you can walk all the way around. one porch light on, at four in the afternoon, and it has not been off in a long time. the bins go out on the right day.',
    },
  },
  {
    x: -61, z: 139, radius: 8, label: 'THE THREE CHAIRS',
    prompt: 'LOOK AT THE HEDGE',
    note: {
      title: 'the three chairs',
      body: 'facing a hedge. somebody set them out at this angle on purpose, and somebody has gone on cutting the hedge ever since, and both of those are true.',
    },
  },
  {
    x: 50, z: 193, radius: 7, label: 'THE GATE ON THE LATCH',
    prompt: 'LOOK AT THE LATCH',
    note: {
      title: 'the gate on the latch',
      body: 'never locked, never left open. the plate under the bar is worn down to bright metal — lifted and set back, lifted and set back, for as many years as it takes to do that to a piece of iron.',
    },
  },
  { x: -45, z: 170, radius: 7, label: 'THE RIVER BRIDGE' },
];

/* ================================================================== *
 * GREYLINE CITY — where standing still is shameful.
 *
 * Session 13, to `design/specs/greyline-city.md`.
 *
 * THE DRAFT THIS REPLACES laid towers on a twenty-one-unit `for` loop,
 * shopfronts at `76 + i * 15`, lamps at `78 + i * 30` and ten planters
 * on a scatter. Even spacing, repeated silhouettes, uniform density.
 *
 * ── THE PLAN THAT REPLACES IT ───────────────────────────────────────
 *
 * A city is not props on a grid; it is a STREET WALL with holes in it,
 * and the holes are where the light gets in. So everything here is
 * placed against one of four things and never in the open:
 *
 *   THE STREET WALL   towers standing shoulder to shoulder along mill
 *                     lane and main street, near ones cropped by the
 *                     top of the frame, far ones whole
 *   THE HOLLOW        the page's crease runs north–south through
 *                     x ≈ 88, three units under the rest of the land,
 *                     and the city turned its back on it
 *   THE JUNCTION      four green lights, a man, and the pavement
 *   THE NORTH END     where the grid runs out into the Downs
 *
 * **AND THE FRAME-TOP CEILING IS THE SUBJECT HERE.** Every land since
 * Session 3 has designed AROUND the fact that the camera shows about
 * ten units of height at thirty-three units out. Downtown is the one
 * place in this world where a building going out of the top of the
 * frame is the correct picture, and it is what makes this land read as
 * a city rather than as a village with taller huts.
 * ================================================================== */

/** THE JUNCTION, and the man who has been standing in it long enough to
 *  be geography (`THE-WAITS` §11). */
const JUNCTION = { x: 148, z: 203 };
const MAN = { x: 142.5, z: 199 };
/** The bench twenty units off that nobody has ever used. It is NORTH of
 *  him on purpose: one standpoint holds the wear, the man and the bench
 *  in one frame, and it is the same frame after he moves. */
const BENCH = { x: 145.5, z: 181 };
/** How long you have to stand still for it to be unmistakably a choice.
 *  Four seconds, and `THE-WAITS` §11 is explicit that the cost is the
 *  whole reason nobody in this city has ever paid it. */
const ASK_SECONDS = 4;

/** The walker's last position, for the stand-still test in the update
 *  below: standing still is measured as NOT MOVING, not as not pressing
 *  anything. */
let lastX = 0;
let lastZ = 0;

export const buildCity: RegionBuilder = (ctx) => {
  const { r, terrain } = ctx;

  /* ---- the shared drawings ---------------------------------------- */
  const TOWER: THREE.Texture[] = [];
  const TOWER_LIT: THREE.Texture[] = [];
  const TOWER_H: number[] = [];
  // six blocks, three kinds, two heights each — and every tower in the
  // land is one of these six, placed differently
  ([[0, 5], [0, 9], [1, 6], [1, 12], [2, 7], [2, 11]] as [0 | 1 | 2, number][])
    .forEach(([kind, floors], i) => {
      TOWER.push(greylineTowerTexture(9000 + i * 10, kind, floors));
      TOWER_LIT.push(greylineTowerLitTexture(9001 + i * 10, kind, floors));
      TOWER_H.push(72 + floors * 34);
    });
  const PAVING = [0, 1].map((v) => pavingDecal(9300 + v, v as 0 | 1));

  /* ================================================================ *
   * THE STREET WALL. Authored, one line per building: which drawing,
   * where it stands, how wide it is, and whether anybody is still in it
   * at seven in the evening.
   *
   * The width is authored per placement and the height follows from the
   * drawing, so two towers off the same canvas are different buildings
   * rather than the same building twice.
   * ================================================================ */
  type Block = { x: number; z: number; t: number; w: number; rot?: number; lit?: boolean };
  const BLOCKS: Block[] = [
    /* mill lane's west wall, coming north from the junction */
    { x: 132, z: 194, t: 3, w: 11.5, lit: true },
    { x: 135, z: 184, t: 0, w: 9.5 },
    { x: 137, z: 172, t: 4, w: 12, rot: 0.04, lit: true },
    { x: 134, z: 160, t: 2, w: 10 },
    /* mill lane's east wall */
    { x: 161, z: 194, t: 5, w: 12.5, lit: true },
    { x: 160, z: 180, t: 1, w: 10.5, rot: -0.03 },
    { x: 163, z: 166, t: 3, w: 11 },
    /* south of the junction, where the spur leaves: lower, older */
    { x: 131, z: 218, t: 0, w: 10, lit: true },
    { x: 160, z: 214, t: 2, w: 11, rot: 0.05 },
    { x: 130, z: 234, t: 2, w: 9.5 },
    { x: 164, z: 236, t: 0, w: 10.5, lit: true },
    { x: 141, z: 252, t: 4, w: 11.5 },
    /* main street's north side, running west from the junction to the
     * top of the rise */
    { x: 124, z: 194, t: 1, w: 10.5, lit: true },
    { x: 112, z: 192, t: 3, w: 11 },
    /* and the two that stand on the lip of the hollow and look into it */
    { x: 100, z: 186, t: 0, w: 9.5, rot: -0.08 },
    { x: 99, z: 220, t: 2, w: 10, rot: 0.06, lit: true },
    /* the east quarter, thinner: the city is running out this way */
    { x: 186, z: 200, t: 1, w: 11 },
    { x: 198, z: 222, t: 0, w: 9.5, lit: true },
    { x: 205, z: 188, t: 4, w: 11.5 },
    /* the north end, and the last one is on its own */
    { x: 150, z: 148, t: 2, w: 10, rot: -0.05 },
    { x: 172, z: 143, t: 0, w: 9, lit: true },
  ];

  const towerLits: THREE.Mesh[] = [];
  for (let i = 0; i < BLOCKS.length; i++) {
    const b = BLOCKS[i];
    if (terrain.waterAt(b.x, b.z) > 0.04) continue;
    const h = b.w * (TOWER_H[b.t] / 192);
    ctx.standee(TOWER[b.t], b.w, h, b.x, b.z, { rotY: b.rot ?? 0 });
    if (b.lit) {
      const m = ctx.standee(TOWER_LIT[b.t], b.w, h, b.x, b.z, { rotY: b.rot ?? 0, opacity: 0 });
      (m.material as THREE.MeshBasicMaterial).transparent = true;
      towerLits.push(m);
    }
  }

  /* THE FAR SKYLINE — the haze layer. Pencil, no windows, and nothing a
   * walker can ever reach: it is what stands BEHIND the street wall in
   * every frame in this land. */
  for (const [x, z, w, hh] of [
    [178, 128, 62, 16], [130, 134, 54, 13], [214, 158, 58, 15],
    [116, 266, 60, 14], [206, 268, 56, 13],
  ] as [number, number, number, number][]) {
    /* AND IT TAKES THE FOG. Round 5 turned fog off on these — the
     * meadow's keep vista does, because it is a poster standing in for
     * something a hundred and eighty units further out — and from MAPLE
     * COURT, over the rise, five pale blocks hung in the air above the
     * far bank with nothing hazing them. A skyline IS the haze layer;
     * it does not get to opt out of the haze. */
    ctx.standee(farSkylineTexture(9100 + x), w, hh, x, z, { opacity: 0.85 });
  }

  /* ================================================================ *
   * MAIN STREET at street level: two runs of shopfronts under awnings,
   * facing each other across the road, and they stop where the rise
   * does. Nothing has a name over it — no shop in this game does.
   * ================================================================ */
  ctx.standee(shopRowTexture(9200, 0), 20, 8.3, 118, 197.5, { rotY: -0.03 });
  ctx.standee(shopRowTexture(9201, 1), 22, 9.2, 108, 217, { rotY: Math.PI + 0.02 });
  ctx.standee(shopRowTexture(9202, 0), 18, 7.5, 137, 195, { rotY: -0.05 });
  ctx.standee(busStopTexture(9210), 5.4, 5, 130, 214.5, { rotY: Math.PI });

  /* THE REVOLVING DOOR — a door that goes round and brings you back to
   * where you were, in the land where nobody arrives. It is not a POI,
   * it has no note, and it turns whether or not anybody is looking. */
  const doors = [0, 1].map((p) =>
    ctx.standee(revolvingDoorTexture(9520 + p, p as 0 | 1), 5.2, 6.2, 139, 194));
  for (const m of doors) (m.material as THREE.MeshBasicMaterial).transparent = true;

  /* ================================================================ *
   * THE HOLLOW — the page's crease, three units under the city, and the
   * only landform in this land. `elevation.ts` cut it in Session 4 and
   * the draft built straight over the top of it.
   *
   * A city does with a crease what a city does: it turns its back. So
   * the hollow has the BACKS of things in it — a flank wall with a fire
   * escape zigzagging down it, bins, a grating breathing warm air (the
   * land's own voice, `Audio.ts` LAND_VOICE: *warm air off a grating
   * under the whole street*) — and it runs north–south, so you can walk
   * down into it and look along it.
   * ================================================================ */
  const HOLLOW_X = 88;
  ctx.standee(fireEscapeTexture(9500), 8, 16, HOLLOW_X + 6.5, 196, { rotY: -0.42 });
  ctx.standee(fireEscapeTexture(9501), 7, 14, HOLLOW_X + 6, 224, { rotY: -0.38 });
  {
    /* THE TOES OF BOTH SLOPES, and nothing above them.
     *
     * Round 6 tried to draw this fold properly — hatching down the fall
     * line as `QUALITY-BAR` §3 asks for, and a full run of retaining
     * walls — and both were worse than the smooth ground they were
     * covering: forty identical hatch decals at even spacing read as
     * corduroy (which is an ARRAY, in the one place in the world that
     * already has a harrow in it), and a five-unit wall standing on a
     * slope has its feet in the air at both ends.
     *
     * What is left is what a wall can honestly do here: short panels at
     * the very bottom of the cut where the ground is nearly flat,
     * turned toward the channel so the run of them recedes. **The fold
     * itself is still shaded rather than drawn, and that is a debt this
     * session records rather than hides** — its gradient is under the
     * terrain's own hatching threshold, and the fix belongs to
     * `elevation.ts` and not to a region builder. */
    const WALLS = [0, 1].map((v) => hollowWallTexture(9550 + v, v as 0 | 1));
    let wi = 0;
    for (let z = 172; z <= 254; z += 11) {
      for (const side of [-1, 1] as const) {
        if (r() < 0.3) continue;
        ctx.standee(WALLS[wi++ % 2], 8.5, 3.4, HOLLOW_X + side * 5.4,
          z + (r() - 0.5) * 4, { rotY: side * 0.92 });
      }
    }
  }
  ctx.standee(cityBinsTexture(9540), 4.6, 3.1, HOLLOW_X - 2.5, 208, { rotY: 0.3 });
  ctx.standee(cityBinsTexture(9541), 4.2, 2.8, HOLLOW_X + 1.5, 232, { rotY: -0.2 });
  ctx.decal(grateDecal(9530), 3, 3, HOLLOW_X - 0.5, 216, 0.1, 0.7);
  const steam = [0, 1].map((p) =>
    ctx.standee(grateSteamTexture(9531 + p, p as 0 | 1), 3.4, 5, HOLLOW_X - 0.5, 216.5));
  for (const m of steam) (m.material as THREE.MeshBasicMaterial).transparent = true;
  // the hollow's own paving, and it is not swept
  for (const z of [190, 206, 222, 238]) {
    ctx.decal(PAVING[z % 2 === 0 ? 0 : 1], 12, 12, HOLLOW_X, z, 0.02, 0.5);
  }

  /* ================================================================ *
   * THE JUNCTION — four lights, all green, and a man standing in the
   * one place on the pavement nobody walks (`THE-WAITS` §11).
   *
   * THE WEAR IS THE WAIT. Everybody walks round him, and the paths they
   * take to do it have been trodden into the stone; the clean lens in
   * the middle of them is the shape of a decision made about a million
   * times. It is a DRAWING (`textures-now.ts`, `wornPathsDecal`) and it
   * is twenty-six units across, laid on the pavement he stands on and
   * on nothing else in the world.
   *
   * The paths do not change, ever. When he goes and sits down they stay
   * exactly where they are, curving round a place where nobody is
   * standing any more.
   * ================================================================ */
  for (let i = 0; i < 4; i++) {
    const [x, z] = [[139, 210], [157.5, 210], [139, 195.5], [157.5, 195.5]][i];
    ctx.standee(lightMastTexture(9430 + i, i % 2 === 1), 5.6, 9, x, z,
      { rotY: (i < 2 ? 0.06 : Math.PI - 0.06) });
  }
  // the pavement round the crossing, then the wear on top of it
  for (const [x, z] of [[160, 190], [161, 215], [131, 214]] as [number, number][]) {
    ctx.decal(PAVING[(x + z) % 2], 13, 13, x, z, 0, 0.5);
  }
  /* AND NOTHING ELSE IS LAID OVER IT. Round 3 put a plain paving decal
   * on each corner of the crossing and two of them overlapped this one;
   * decals draw in the order they were made, so the stone the wait is
   * drawn into was covered by ordinary stone and the whole wait went
   * invisible in the contact sheet. */
  ctx.decal(wornPathsDecal(9310), 30, 30, MAN.x, MAN.z, 0, 1);
  ctx.standee(hardBenchTexture(9400), 3.9, 2.3, BENCH.x, BENCH.z, { rotY: -0.06 });

  /* THE MAN. Two postures, no face, no name, and the map will never
   * mark him. */
  const man = [0, 1].map((p) =>
    ctx.standee(junctionManTexture(9410 + p, p as 0 | 1), 1.25, 2.15,
      p === 0 ? MAN.x : BENCH.x + 0.1, p === 0 ? MAN.z : BENCH.z + 0.55));
  for (const m of man) (m.material as THREE.MeshBasicMaterial).transparent = true;

  /* ================================================================ *
   * THE NORTH END, where the grid gives up: a hoarding round a lot that
   * nothing is being built on, and then the Downs.
   * ================================================================ */
  ctx.standee(hoardingTexture(9510), 16, 3.2, 158, 160, { rotY: 0.03 });
  ctx.standee(hoardingTexture(9511), 11, 3.2, 168.5, 164.5, { rotY: Math.PI / 2 + 0.04 });
  ctx.decal(PAVING[0], 14, 14, 150, 172, 0, 0.44);

  /* ================================================================ *
   * THE FLOW. Fourteen people, all of them mid-stride, none of them
   * standing still — placed along the streets in ones and twos rather
   * than scattered over the land, because a pavement is a line.
   * ================================================================ */
  const COMMUTE: [number, number, 0 | 1 | 2][] = [
    [136, 220, 0], [156, 236, 1], [152, 190, 2], [151, 172, 0],
    [128, 205, 1], [117, 203, 2], [106, 200, 0], [133, 200, 2],
    [155, 240, 1], [168, 205, 0], [186, 210, 2], [149, 158, 1],
    [162, 224, 0], [124, 216, 1],
  ];
  for (let v = 0; v < 3; v++) {
    const sub = COMMUTE.filter(([, , k]) => k === v);
    if (!sub.length) continue;
    const f = ctx.field(commuterTexture(9420 + v, v as 0 | 1 | 2), sub.length,
      { w: 1.2, h: 2.0 });
    sub.forEach(([x, z], i) => f.set(i, x, z, 0.92 + r() * 0.16, 0, r() > 0.5));
  }

  const lamps = ctx.field(lamppostTexture(9600), 9, { w: 1.7, h: 6 });
  [[132, 197], [120, 199], [108, 201], [152, 188], [152, 220],
   [152, 244], [176, 202], [190, 214], [144, 168]]
    .forEach(([x, z], i) => lamps.set(i, x, z, 1, 0, i % 2 === 0));
  const planters = ctx.field(planterTexture(9601), 6, { w: 2, h: 2 });
  [[126, 208], [114, 196], [156, 212], [140, 190], [166, 198], [104, 208]]
    .forEach(([x, z], i) => planters.set(i, x, z, 0.9 + r() * 0.3, 0, false));
  const pigeons = ctx.field(pigeonTexture(9602), 7, { w: 0.9, h: 0.7 });
  [[150, 208], [151.5, 209], [153, 207.5], [136, 213], [137, 214.5],
   [90, 214], [91, 216]]
    .forEach(([x, z], i) => pigeons.set(i, x, z, 1, 0, r() > 0.5));

  /* ================================================================ */
  let stood = 0;
  let tick = 3;
  let heels = 8;
  return (dt: number, t: number, px: number, pz: number) => {
    const h = clock.hour;
    const dusk = Math.max(0, Math.min(1,
      Math.max((h - 16.8) / 2.4, (7.2 - h) / 2)));
    lightUp(towerLits, dusk);

    /* ================================================================ *
     * THE ONE THING IN THIS WORLD THAT COSTS YOU FOUR SECONDS.
     *
     * `THE-WAITS` §11: he is not waiting for somebody to arrive, he is
     * waiting **to be asked**, and asking means stopping, and in this
     * land stopping is shameful. So there is no knowledge to bring and
     * nothing to press. You stand still, near him, for long enough that
     * it is unmistakably a choice.
     *
     * The test is deliberately strict about what standing still MEANS —
     * it measures the walker's own movement between frames rather than
     * an input, so a player being carried by the road or drifting on a
     * stick does not qualify, and it resets the moment you move. Once
     * it is done it is done for good: `fact:the-man-at-the-junction`
     * lives in the save, he is on the bench in every later one, and
     * forty units away in another land a woman is at a fence.
     * ================================================================ */
    const told = knowledge.has('fact:the-man-at-the-junction');
    if (!told) {
      const d = Math.hypot(px - MAN.x, pz - MAN.z);
      const moved = Math.hypot(px - lastX, pz - lastZ);
      lastX = px;
      lastZ = pz;
      if (d < 9 && moved < 0.02) {
        stood += dt;
        if (stood > ASK_SECONDS) {
          knowledge.learn('fact:the-man-at-the-junction');
          say('crossing-tick');
        }
      } else {
        stood = 0;
      }
    }
    man[0].visible = !told;
    man[1].visible = told;

    /* the door turns, and it turns whether or not anybody is going
     * through it */
    const phase = Math.floor(t * 1.1) % 2;
    doors[0].visible = phase === 0;
    doors[1].visible = phase === 1;
    // the grating breathes: two drawings, slow, and never in step with
    // the door
    const sp = Math.floor(t * 0.7) % 2;
    steam[0].visible = sp === 0;
    steam[1].visible = sp === 1;

    const inside = px > 62 && px < 228 && pz > 132 && pz < 278;
    if (inside) {
      /* THE CROSSING'S TICK. Four lights, all green, so the box that
       * ticks for people waiting to cross ticks for nobody, forever. */
      tick -= dt;
      if (tick < 0) {
        tick = 6.5 + Math.random() * 5;
        if (Math.hypot(px - JUNCTION.x, pz - JUNCTION.z) < 34) say('crossing-tick');
      }
      /* AND SOMEBODY ELSE'S FOOTSTEPS, GOING AWAY. The only land in the
       * game where you hear a step that is not yours. */
      heels -= dt;
      if (heels < 0) {
        heels = 9 + Math.random() * 12;
        say('heels');
      }
    }
  };
};

export const CITY_POIS: WorldPOI[] = [
  {
    x: 148, z: 203, radius: 9, label: 'THE JUNCTION',
    prompt: 'WAIT FOR THE LIGHT',
    note: {
      title: 'the junction',
      body: 'four traffic lights, and all four of them are green. the city has never once had to stop, and looks a little tired about it.',
    },
  },
  {
    /* The label is west of the man, not over him. He has no name and
     * nothing in this game will ever give him one — but the stone he
     * stands on is a place, and the wear in it is what the label is
     * for. */
    x: 137, z: 196, radius: 8, label: 'THE PAVEMENT', labelHeight: 3.2,
    prompt: 'LOOK DOWN',
    note: {
      title: 'the pavement',
      body: 'the stone is worn pale in two long curves, and between them there is a patch the size of a person where it is not worn at all. it takes a very long time to do this to a paving slab.',
    },
  },
  {
    x: 120, z: 204, radius: 9, label: 'MAIN STREET',
    prompt: 'LOOK UP',
    note: {
      title: 'main street',
      body: 'awnings out over the glass, and the same street this whole road has been since the castle gate. it is called something else here. everything is called something else here.',
    },
  },
  {
    x: 88, z: 214, radius: 9, label: 'THE HOLLOW',
    prompt: 'GO DOWN',
    note: {
      title: 'the hollow',
      body: 'the ground folds here and the city built up to the edge of it and then turned round. down the bottom: bins, a fire escape, and warm air coming up out of a grating all year.',
    },
  },
  { x: 158, z: 162, radius: 8, label: 'THE NORTH END' },
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
      body: 'the timetable says the 8:15 is coming. there is no track here, and there is no track anywhere. everyone waiting knows both of these things and has made their peace.',
    },
  },
  {
    x: 300, z: 200, radius: 10, label: 'THE CUBICLE MILE',
    note: {
      title: 'the cubicle mile',
      body: 'towers of ruled glass, and the only corner of the world anybody ever laid out with a straightedge. your footsteps go glossy here, like the floor is proud of itself.',
    },
  },
];
