import { grassTexture, loopsTexture, ringTexture } from '../../engine/ink';
import {
  oakTexture, bushTexture, flowersTexture, fenceTexture, wellTexture, signpostTexture,
} from '../textures';
import type { RegionBuilder, WorldPOI } from './index';

/**
 * THE COMMON — the land you wake in. Open grass, three old oaks, a
 * well, and the crossroads every road in the world leaves from. It is
 * deliberately the plainest page in the book: everything interesting
 * is a silhouette on some horizon from here.
 */

export const buildMeadow: RegionBuilder = (ctx) => {
  const { r } = ctx;

  // the grass itself — the page's idle noise
  const grass = ctx.field(grassTexture(), 240, { w: 1.7, h: 1.15 });
  ctx.scatter(240, { minDist: 2.2 }).forEach(([x, z], i) =>
    grass.set(i, x, z, 0.75 + r() * 0.6, 0, r() > 0.5));

  const flowers = ctx.field(flowersTexture(31), 90, { w: 2.0, h: 1.5 });
  ctx.scatter(90, { minDist: 4 }).forEach(([x, z], i) =>
    flowers.set(i, x, z, 0.7 + r() * 0.5, 0, r() > 0.5));

  const bushes = ctx.field(bushTexture(45), 26, { w: 3.4, h: 2.5 });
  ctx.scatter(26, { minDist: 9 }).forEach(([x, z], i) =>
    bushes.set(i, x, z, 0.8 + r() * 0.55, 0, r() > 0.5));

  // three named oaks, old enough to argue about
  ctx.standee(oakTexture(101), 9.5, 11, -96, 28);
  ctx.standee(oakTexture(102), 8.6, 10, 18, 88);
  ctx.standee(oakTexture(103), 10.4, 12, -12, 14);

  // doodle hills: practice loops lying on the grass, margins-style
  for (let i = 0; i < 5; i++) {
    const [pos] = ctx.scatter(1, { minDist: 0 });
    if (pos) ctx.decal(loopsTexture(), 9, 3.4, pos[0], pos[1], r() * Math.PI, 0.35);
  }

  // fences along the east road's south side, a field being implied
  ctx.standee(fenceTexture(61), 7, 2.6, -8, 66);
  ctx.standee(fenceTexture(62), 7, 2.6, -1, 66.5);
  ctx.standee(fenceTexture(63), 7, 2.6, 6, 67);

  // the well, and where you woke
  ctx.standee(wellTexture(71), 3.4, 4.2, -52, 44);
  ctx.decal(ringTexture(), 4, 4, -45, 58, 0, 0.5);

  // the crossroads signpost
  ctx.standee(signpostTexture(81), 3.4, 4.1, -42, 52);
};

export const MEADOW_POIS: WorldPOI[] = [
  {
    x: -42, z: 52, radius: 7, label: 'THE CROSSROADS',
    prompt: 'READ THE SIGNPOST',
    note: {
      title: 'the crossroads',
      body: 'north to the kingdom. west to the sea. east through the farms to the sand. south to the little houses. every road in the world starts here, which is another way of saying you are nowhere in particular.',
    },
  },
  {
    x: -52, z: 44, radius: 5, label: 'THE OLD WELL',
    prompt: 'LOOK DOWN THE WELL',
    note: {
      title: 'the old well',
      body: 'you look down. the dark looks back, politely. somewhere below, a splash the pen never bothered to draw.',
    },
  },
  { x: -96, z: 30, radius: 8, label: 'THE ARGUING OAKS' },
];
