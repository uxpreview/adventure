import { grassTexture } from '../../engine/ink';
import {
  cottageTexture, marketStallTexture, fountainTexture, wellTexture, lamppostTexture,
  townWallTexture, gatehouseTexture, keepTexture, bannerTexture, boulderTexture,
  suburbanHouseTexture, mailboxTexture, carTexture, picketFenceTexture,
  streetTreeTexture, swingSetTexture, towerBlockTexture, glassTowerTexture,
  shopfrontTexture, trafficLightTexture, benchTexture, busStopTexture,
  planterTexture, doodleFolkTexture, bushTexture, signpostTexture,
} from '../textures';
import type { RegionBuilder, WorldPOI } from './index';

/* ================================================================== *
 * THE KINGDOM OF BRIM — a walled market town on the king's road.
 * Half-timbered houses lean toward each other over the street; the
 * square has a fountain, five stalls, and more folk than anywhere.
 * ================================================================== */

export const buildKingdom: RegionBuilder = (ctx) => {
  const { r } = ctx;

  // the town wall: south face with the road gate, east face with the wood gate
  for (let x = -142; x < 52; x += 16) {
    if (Math.abs(x + 45) < 10) continue; // the south gate
    ctx.standee(townWallTexture(800 + x, 512, 160), 16.5, 5.2, x + 8, -13);
  }
  ctx.standee(gatehouseTexture(810), 12, 12, -45, -12.5);
  for (let z = -152; z < -22; z += 16) {
    if (Math.abs(z + 110) < 10) continue; // the east gate to the Penwood
    ctx.standee(townWallTexture(820 + z, 512, 160), 16.5, 5.2, 56, z + 8, { rotY: Math.PI / 2 });
  }
  ctx.standee(gatehouseTexture(821), 11, 11, 56, -110, { rotY: Math.PI / 2 });

  // houses along the king's road
  const lanes: [number, number, number][] = [];
  for (let z = -145; z <= -35; z += 22) {
    lanes.push([-59 - r() * 5, z + r() * 6, 0.35]);
    lanes.push([-29 + r() * 5, z + 11 + r() * 6, -0.35]);
  }
  // and a lane bending toward the east gate
  for (let x = -10; x <= 40; x += 24) {
    lanes.push([x, -100 - r() * 6, 0.15]);
    lanes.push([x + 10, -124 + r() * 6, -0.15]);
  }
  lanes.forEach(([x, z, rot], i) => {
    if (Math.hypot(x + 45, z + 82) < 14) return; // keep the square open
    ctx.standee(cottageTexture(830 + i), 8.4, 7.2, x, z, { rotY: rot * (0.6 + r() * 0.8) });
  });

  // the square
  ctx.standee(fountainTexture(850), 6.2, 5.2, -45, -82);
  ctx.standee(marketStallTexture(851), 5.6, 4.7, -58, -90, { rotY: 0.5 });
  ctx.standee(marketStallTexture(852), 5.4, 4.5, -32, -92, { rotY: -0.4 });
  ctx.standee(marketStallTexture(853), 5.6, 4.7, -58, -70, { rotY: 0.9 });
  ctx.standee(marketStallTexture(854), 5.2, 4.4, -30, -68, { rotY: -0.8 });
  ctx.standee(wellTexture(855), 3.2, 4, -68, -100);
  for (const [x, z] of [[-56, -96], [-34, -96], [-56, -66], [-34, -66]] as [number, number][]) {
    ctx.standee(lamppostTexture(860), 1.7, 6, x, z);
  }

  // banners and townsfolk
  const folk = ctx.field(doodleFolkTexture(870), 12, { w: 1.15, h: 1.9 });
  ctx.scatter(12, { minDist: 8, rect: { minX: -75, maxX: -15, minZ: -110, maxZ: -45 }, allowRoad: true })
    .forEach(([x, z], i) => folk.set(i, x, z, 0.85 + r() * 0.25, 0, r() > 0.5));
  const banners = ctx.field(bannerTexture(871), 8, { w: 1.6, h: 4 });
  [[-52, -108], [-38, -108], [-52, -56], [-38, -56], [-70, -82], [-20, -82], [-45, -30], [-45, -130]]
    .forEach(([x, z], i) => banners.set(i, x, z, 1, 0, i % 2 === 0));
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
  { x: 56, z: -110, radius: 7, label: 'THE WOOD GATE' },
];

/* ================================================================== *
 * CASTLE GREYWEATHER — the high seat above the town. One keep, one
 * gatehouse, wall on the ridge, banners taking the only wind.
 * ================================================================== */

export const buildCastle: RegionBuilder = (ctx) => {
  const { r } = ctx;

  ctx.standee(keepTexture(900), 30, 25.7, -45, -244);
  ctx.standee(gatehouseTexture(901), 14, 14, -45, -198);
  for (let x = -130; x < 40; x += 16) {
    if (Math.abs(x + 45) < 12) continue;
    ctx.standee(townWallTexture(902 + x, 512, 160), 16.5, 6, x + 8, -196 + Math.sin(x * 0.04) * 3);
  }
  // banners the whole approach
  const banners = ctx.field(bannerTexture(910), 10, { w: 1.7, h: 4.2 });
  for (let i = 0; i < 5; i++) {
    banners.set(i * 2, -52, -204 - i * 12, 1, 0, false);
    banners.set(i * 2 + 1, -38, -204 - i * 12, 1, 0, true);
  }
  // fallen stone on the ridge; the moat pool keeps its own counsel
  const rocks = ctx.field(boulderTexture(920), 20, { w: 3, h: 2.1 });
  ctx.scatter(20, { minDist: 8 }).forEach(([x, z], i) =>
    rocks.set(i, x, z, 0.5 + r() * 0.8, 0, r() > 0.5));
  const grass = ctx.field(grassTexture(), 60, { w: 1.6, h: 1.1 });
  ctx.scatter(60, { minDist: 3 }).forEach(([x, z], i) =>
    grass.set(i, x, z, 0.65 + r() * 0.5, 0, r() > 0.5));
};

export const CASTLE_POIS: WorldPOI[] = [
  {
    x: -45, z: -232, radius: 12, label: 'THE KEEP',
    prompt: 'CRANE YOUR NECK',
    note: {
      title: 'castle greyweather',
      body: 'the tallest drawing on the sheet. the banners are mid-snap in a wind nothing else on the page can feel. whoever lives here is never home, or is the wind.',
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
