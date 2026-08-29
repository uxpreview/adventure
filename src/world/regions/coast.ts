import { grassTexture } from '../../engine/ink';
import { coastX } from '../terrain';
import {
  palmTexture, umbrellaTexture, beachHutTexture, driftwoodTexture, shellsDecal,
  gullTexture, sailboatTexture, buoyTexture, rowboatTexture, signpostTexture,
  bridgeDeckDecal,
} from '../textures';
import type { RegionBuilder, WorldPOI } from './index';

/* ================================================================== *
 * THE WIDE BLUE — open water. Nothing to stand on but the shallows;
 * everything out there is something to look at across the swell:
 * sailboats leaning, buoys keeping their patient appointments, and
 * past the last of it the torn edge of the sheet and the desk below.
 * ================================================================== */

export const buildOcean: RegionBuilder = (ctx) => {
  const { r } = ctx;

  // boats ride deep water; they are placed by depth, not by scatter
  const boats: { x: number; z: number; m: ReturnType<typeof ctx.standee>; ph: number }[] = [];
  const spots: [number, number][] = [[-330, -180], [-352, -40], [-322, 90], [-345, 210], [-300, -240]];
  spots.forEach(([x, z], i) => {
    const m = ctx.standee(sailboatTexture(600 + i), 6.4, 7, x, z, { opacity: 0.96 });
    boats.push({ x, z, m, ph: i * 1.7 });
  });

  const buoys: { m: ReturnType<typeof ctx.standee>; ph: number }[] = [];
  for (let i = 0; i < 6; i++) {
    const z = -250 + i * 96;
    const x = coastX(z) - 16 - r() * 10;
    buoys.push({ m: ctx.standee(buoyTexture(610 + i), 1.7, 2.5, x, z), ph: i * 2.3 });
  }

  // gulls work the shore line
  const gulls = ctx.field(gullTexture(620), 10, { w: 2.4, h: 1.6 });
  const gullState: { x: number; z: number; v: number }[] = [];
  for (let i = 0; i < 10; i++) {
    const z = -260 + r() * 520;
    const x = coastX(z) - 30 + r() * 44;
    gullState.push({ x, z, v: 1.5 + r() * 2 });
    gulls.set(i, x, z, 0.8 + r() * 0.5, 0, r() > 0.5);
  }

  return (dt: number, t: number) => {
    for (const b of boats) {
      b.m.position.y = ctx.groundY(b.m.position.x, b.m.position.z) + Math.sin(t * 0.8 + b.ph) * 0.12;
      b.m.rotation.z = Math.sin(t * 0.55 + b.ph) * 0.035;
      b.m.position.x = b.x + Math.sin(t * 0.11 + b.ph) * 2.2;
    }
    for (const b of buoys) {
      b.m.position.y = ctx.groundY(b.m.position.x, b.m.position.z) + Math.sin(t * 1.1 + b.ph) * 0.16;
    }
    for (let i = 0; i < gullState.length; i++) {
      const g = gullState[i];
      g.z += dt * g.v;
      if (g.z > 270) g.z = -270;
      gulls.set(i, g.x + Math.sin(t * 0.7 + i) * 3, g.z, 0.8 + (i % 3) * 0.2, 0, Math.sin(t * 0.4 + i * 2) > 0);
    }
  };
};

export const OCEAN_POIS: WorldPOI[] = [
  {
    x: -285, z: 60, radius: 10, label: 'THE SHALLOWS',
    prompt: 'WADE OUT',
    note: {
      title: 'the shallows',
      body: 'you can wade to about the knee of the drawing. past that the blue gets serious, and whoever drew you gave you no more swimming than they gave themselves.',
    },
  },
  { x: -330, z: -180, radius: 14, label: 'THE REGATTA, SORT OF' },
];

/* ================================================================== *
 * LONGSHORE — the whole west coast: dune grass, umbrellas that argue
 * with the wind, four huts on stilts, and the boardwalk where the
 * coast road gives up being a road.
 * ================================================================== */

export const buildBeach: RegionBuilder = (ctx) => {
  const { r, rect, terrain } = ctx;

  // dune grass keeps to the landward half
  const dune = ctx.field(grassTexture(), 130, { w: 1.8, h: 1.2 });
  ctx.scatter(130, {
    minDist: 3,
    rect: { minX: -205, maxX: rect.maxX, minZ: rect.minZ, maxZ: rect.maxZ },
  }).forEach(([x, z], i) => dune.set(i, x, z, 0.7 + r() * 0.6, 0, r() > 0.5));

  const shells = ctx.field(shellsDecal(700), 40, { w: 4.4, h: 4.4, decal: true, baseOpacity: 0.7 });
  // shells live on the wet margin: scatter near the coastline
  for (let i = 0; i < 40; i++) {
    const z = rect.minZ + 8 + r() * (rect.maxZ - rect.minZ - 16);
    const x = coastX(z) + 3 + r() * 14;
    if (terrain.waterAt(x, z) > 0.3) continue;
    shells.set(i, x, z, 0.7 + r() * 0.7, r() * Math.PI, false);
  }

  const wood = ctx.field(driftwoodTexture(701), 12, { w: 4.2, h: 1.7 });
  for (let i = 0; i < 12; i++) {
    const z = rect.minZ + 12 + r() * (rect.maxZ - rect.minZ - 24);
    const x = coastX(z) + 6 + r() * 12;
    if (terrain.waterAt(x, z) > 0.25) continue;
    wood.set(i, x, z, 0.7 + r() * 0.7, (r() - 0.5) * 0.8, r() > 0.5);
  }

  // palms hold the dune line
  const palms = ctx.field(palmTexture(702), 30, { w: 7, h: 8.2 });
  ctx.scatter(30, {
    minDist: 9,
    rect: { minX: -212, maxX: rect.maxX - 4, minZ: rect.minZ, maxZ: rect.maxZ },
  }).forEach(([x, z], i) => palms.set(i, x, z, 0.75 + r() * 0.5, 0, r() > 0.5));

  // umbrellas cluster near the boardwalk
  for (let i = 0; i < 7; i++) {
    const z = 20 + r() * 90;
    const x = coastX(z) + 10 + r() * 16;
    ctx.standee(umbrellaTexture(710 + i), 4.4, 5.3, x, z);
  }

  for (let i = 0; i < 4; i++) {
    ctx.standee(beachHutTexture(720 + i), 6.8, 6.2, -186 + r() * 14, -180 + i * 46 + r() * 12, { rotY: (r() - 0.5) * 0.3 });
  }

  // the boardwalk: planks where the coast road meets the sand
  for (let i = 0; i < 4; i++) {
    ctx.decal(bridgeDeckDecal(730 + i), 10, 5.6, -208 - i * 9, 58 + (r() - 0.5) * 2, 0.02, 0.85);
  }
  ctx.standee(rowboatTexture(740), 5.4, 2.7, -228, 96, { rotY: -0.4 });
  ctx.standee(signpostTexture(741), 3.4, 4.1, -198, 52);
};

export const BEACH_POIS: WorldPOI[] = [
  {
    x: -214, z: 58, radius: 8, label: 'THE BOARDWALK',
    prompt: 'WALK THE PLANKS',
    note: {
      title: 'the boardwalk',
      body: 'the road walks out onto the sand, thinks better of it, and becomes planks. the planks knock hollow underfoot — the sound of a drawing bragging about being a drawing.',
    },
  },
  {
    x: -186, z: -120, radius: 10, label: 'THE PAINTED HUTS',
  },
  { x: -228, z: 96, radius: 6, label: 'A BOAT, RESTING' },
];
