import { grassTexture } from '../../engine/ink';
import {
  pineTexture, oakTexture, mushroomTexture, logTexture, bushTexture,
  mesaTexture, archRockTexture, boulderTexture, cactusTexture, duneDecal,
  skullTexture, tumbleweedTexture, palmTexture,
  windmillTexture, barnTexture, hayBaleTexture, wheatDecal, fenceTexture,
  scarecrowTexture, signpostTexture, rowboatTexture,
} from '../textures';
import type { RegionBuilder, WorldPOI } from './index';

/* ================================================================== *
 * THE PENWOOD — pine dark, needle floor, a tarn with a rowboat that
 * has clearly been borrowed before.
 * ================================================================== */

export const buildForest: RegionBuilder = (ctx) => {
  const { r, rect } = ctx;

  const pinesA = ctx.field(pineTexture(211), 110, { w: 4.4, h: 8.8 });
  ctx.scatter(110, { minDist: 5.5 }).forEach(([x, z], i) =>
    pinesA.set(i, x, z, 0.8 + r() * 0.7, 0, r() > 0.5));
  const pinesB = ctx.field(pineTexture(212), 90, { w: 4.0, h: 8.0 });
  ctx.scatter(90, { minDist: 5.5 }).forEach(([x, z], i) =>
    pinesB.set(i, x, z, 0.75 + r() * 0.7, 0, r() > 0.5));
  const oaks = ctx.field(oakTexture(213), 30, { w: 8, h: 9.4 });
  ctx.scatter(30, { minDist: 12 }).forEach(([x, z], i) =>
    oaks.set(i, x, z, 0.8 + r() * 0.5, 0, r() > 0.5));

  const shrooms = ctx.field(mushroomTexture(214), 40, { w: 1.1, h: 1.1 });
  ctx.scatter(40, { minDist: 3 }).forEach(([x, z], i) =>
    shrooms.set(i, x, z, 0.7 + r() * 0.7, 0, r() > 0.5));

  for (let i = 0; i < 7; i++) {
    const [p] = ctx.scatter(1, {});
    if (p) ctx.standee(logTexture(220 + i), 4.4, 2, p[0], p[1], { rotY: r() * Math.PI });
  }

  // the tarn's borrowed rowboat, pulled half out of the water
  ctx.standee(rowboatTexture(230), 5.2, 2.6, 141, -186, { rotY: 0.5 });

  // undergrowth thins toward the road; bushes take the edges
  const bushes = ctx.field(bushTexture(231), 40, { w: 3, h: 2.2 });
  ctx.scatter(40, { minDist: 6, rect: { minX: rect.minX, maxX: rect.maxX, minZ: rect.maxZ - 60, maxZ: rect.maxZ } })
    .forEach(([x, z], i) => bushes.set(i, x, z, 0.7 + r() * 0.5, 0, r() > 0.5));
};

export const FOREST_POIS: WorldPOI[] = [
  {
    x: 150, z: -195, radius: 9, label: 'THE TARN',
    prompt: 'TRY THE ROWBOAT',
    note: {
      title: 'the tarn',
      body: 'still water, black as the good ink. the rowboat has one oar, and the oar is newer than the boat. nobody comes down to the water and nobody will say why. there is a path around it, and everybody uses it.',
    },
  },
  { x: 160, z: -232, radius: 8, label: 'THE DEEP PINES' },
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
 * THE HARROW DOWNS — hay country. Wheat in rows, a mill that minds
 * the wind, a scarecrow that minds you.
 * ================================================================== */

export const buildDowns: RegionBuilder = (ctx) => {
  const { r } = ctx;

  const wheat = ctx.field(wheatDecal(500), 70, { w: 9, h: 6, decal: true, baseOpacity: 0.85 });
  ctx.scatter(70, { minDist: 7 }).forEach(([x, z], i) =>
    wheat.set(i, x, z, 0.8 + r() * 0.6, (r() - 0.5) * 0.8, r() > 0.5));

  const bales = ctx.field(hayBaleTexture(501), 14, { w: 2.6, h: 2 });
  ctx.scatter(14, { minDist: 12 }).forEach(([x, z], i) =>
    bales.set(i, x, z, 0.75 + r() * 0.5, 0, r() > 0.5));

  const fences = ctx.field(fenceTexture(502), 30, { w: 6.5, h: 2.4 });
  // fence lines: three long runs implying fields
  let fi = 0;
  for (const [x0, z0, dx, dz, n] of [
    [80, -60, 6.3, 0.4, 10], [100, 90, 6.3, -0.3, 9], [180, -20, 0.4, 6.3, 8],
  ] as [number, number, number, number, number][]) {
    for (let k = 0; k < n && fi < 30; k++, fi++) {
      fences.set(fi, x0 + dx * k, z0 + dz * k, 1, dx > 1 ? 0 : Math.PI / 2, false);
    }
  }

  ctx.standee(windmillTexture(510), 9.5, 12.2, 150, -8);
  ctx.standee(barnTexture(511), 10.5, 7.9, 92, -42, { rotY: 0.15 });
  ctx.standee(barnTexture(512), 9, 6.8, 196, 72, { rotY: -0.2 });
  ctx.standee(scarecrowTexture(513), 3.4, 5.1, 122, 78);
  ctx.standee(scarecrowTexture(514), 3, 4.5, 210, -55);

  const grass = ctx.field(grassTexture(), 90, { w: 1.7, h: 1.15 });
  ctx.scatter(90, { minDist: 3 }).forEach(([x, z], i) =>
    grass.set(i, x, z, 0.7 + r() * 0.5, 0, r() > 0.5));
};

export const DOWNS_POIS: WorldPOI[] = [
  {
    x: 150, z: -8, radius: 8, label: 'THE MILL',
    prompt: 'WATCH THE SAILS',
    note: {
      title: 'the mill',
      body: 'the sails are mid-turn. they were mid-turn when you came over the rise and they will be mid-turn when you look back. the miller is owed one good gust, has been owed it for years, and does not appear to mind.',
    },
  },
  {
    x: 122, z: 78, radius: 6, label: 'THE SCARECROW',
    prompt: 'STARE BACK',
    note: {
      title: 'the scarecrow',
      body: 'it has a stitched-on grin and a coat older than the field. you stare. it wins. it was always going to win; it practices.',
    },
  },
];
