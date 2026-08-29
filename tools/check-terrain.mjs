// Audit the height field OFF-SCREEN, before anything is rendered: no
// road may climb a wall, no land may become an island, and the sheet's
// amplitude must stay inside the range WORLD-SYSTEMS §1 authorises.
//
//   node tools/check-terrain.mjs
//
// It bundles src/world/elevation.ts with esbuild so the numbers checked
// here are the numbers the game walks on.
import { build } from 'esbuild';
import { writeFileSync, mkdirSync, rmSync } from 'fs';

mkdirSync('.tmp', { recursive: true });
await build({
  entryPoints: ['src/world/elevation.ts'],
  bundle: true,
  format: 'esm',
  outfile: '.tmp/elevation.mjs',
  logLevel: 'error',
});
const E = await import('../.tmp/elevation.mjs');
const L = { ROADS: null };
await build({
  entryPoints: ['src/world/layout.ts'],
  bundle: true,
  format: 'esm',
  outfile: '.tmp/layout.mjs',
  logLevel: 'error',
});
Object.assign(L, await import('../.tmp/layout.mjs'));

const field = new E.HeightField();
const H = (x, z) => field.heightAt(x, z);
const S = (x, z) => field.slopeAt(x, z);
const MAX = E.MAX_WALK_SLOPE;

let fails = 0;
const fail = (m) => { console.log('  ✗ ' + m); fails++; };

/* ---- 1. amplitude across the sheet -------------------------------- */
let lo = 1e9, hi = -1e9, loAt = null, hiAt = null;
for (let z = L.WORLD.minZ; z <= L.WORLD.maxZ; z += 4) {
  for (let x = L.WORLD.minX; x <= L.WORLD.maxX; x += 4) {
    const h = H(x, z);
    if (h < lo) { lo = h; loAt = [x, z]; }
    if (h > hi) { hi = h; hiAt = [x, z]; }
  }
}
console.log(`amplitude: ${lo.toFixed(1)} (at ${loAt}) .. ${hi.toFixed(1)} (at ${hiAt})`);
if (hi > 24 || lo < -18) fail('amplitude outside the authored envelope');

/* ---- 2. every road stays walkable --------------------------------- */
console.log('\nroads — max gradient along the centreline (walk limit ' + MAX + '):');
const ROAD_NAMES = [
  "king's road", 'coast road', 'east road', 'mill lane', 'main street',
  'commuter spur', 'forest track', 'market lane', 'canyon trail',
];
L.ROADS.forEach((road, ri) => {
  let worst = 0, worstAt = null, blocked = 0;
  let climb = 0;
  let prevH = null;
  for (let i = 0; i < road.pts.length - 1; i++) {
    const [x1, z1] = road.pts[i];
    const [x2, z2] = road.pts[i + 1];
    const d = Math.hypot(x2 - x1, z2 - z1);
    const n = Math.max(2, Math.round(d / 2));
    for (let s = 0; s <= n; s++) {
      const t = s / n;
      const x = x1 + (x2 - x1) * t;
      const z = z1 + (z2 - z1) * t;
      // a road is a strip: check its shoulders too, since the walker
      // wanders and collision reads the point they actually stand on
      for (const o of [0, road.width * 0.4, -road.width * 0.4]) {
        const ox = x + o * ((z2 - z1) / d);
        const oz = z - o * ((x2 - x1) / d);
        const sl = S(ox, oz);
        if (sl > worst) { worst = sl; worstAt = [Math.round(ox), Math.round(oz)]; }
        if (sl > MAX) blocked++;
      }
      const h = H(x, z);
      if (prevH !== null) climb += Math.abs(h - prevH);
      prevH = h;
    }
  }
  const tag = blocked ? 'BLOCKED×' + blocked : 'ok';
  console.log(`  ${ROAD_NAMES[ri].padEnd(15)} worst ${worst.toFixed(2)} at ${String(worstAt).padEnd(12)} total climb ${climb.toFixed(0)}  ${tag}`);
  if (blocked) fail(`${ROAD_NAMES[ri]} is severed by terrain`);
});

/* ---- 3. the places the shoot scripts stand in must be walkable ----- */
const SPOTS = [
  ['spawn', -45, 58], ['common shot', -45, 66], ['brim gate', -45, 6],
  ['brim street', -45, -26], ['brim square', -45, -70], ['belfry', -68, -34],
  ['orchard', -103, -52], ['wood gate', 44, -98], ['north gate', -45, -142],
  ['castle reveal', -45, -163], ['banner avenue', -45, -172],
  ['gatehouse', -45, -189], ['bailey', -45, -211], ['keep', -45, -234],
  ['moat pool', -100, -200], ['ridge west', -120, -182],
  ['forest', 145, -190], ['canyon lip', 300, -150], ['desert', 300, 45],
  ['downs', 148, -5], ['beach', -205, 60], ['ocean', -270, 60],
  ['maple court', -45, 195], ['city', 148, 205], ['office', 280, 205],
];
console.log('\nstanding places — height / slope:');
for (const [name, x, z] of SPOTS) {
  const sl = S(x, z);
  const bad = sl > MAX;
  console.log(`  ${name.padEnd(15)} y=${H(x, z).toFixed(1).padStart(6)}  slope=${sl.toFixed(2)}${bad ? '  ✗ TOO STEEP' : ''}`);
  if (bad) fail(`${name} is not standable`);
}

/* ---- 4. reachability: flood-fill the walkable page from the spawn -- */
const GS = 2;
const gw = Math.round((L.WORLD.maxX - L.WORLD.minX) / GS) + 1;
const gh = Math.round((L.WORLD.maxZ - L.WORLD.minZ) / GS) + 1;
function flood(blockGate) {
  const seen = new Uint8Array(gw * gh);
  const walkable = (gx, gz) => {
    const x = L.WORLD.minX + gx * GS;
    const z = L.WORLD.minZ + gz * GS;
    if (S(x, z) > MAX) return false;
    if (blockGate && x > -70 && x < -20 && z > -215 && z < -180) return false;
    return true;
  };
  const sx = Math.round((L.SPAWN.x - L.WORLD.minX) / GS);
  const sz = Math.round((L.SPAWN.z - L.WORLD.minZ) / GS);
  const stack = [sz * gw + sx];
  seen[stack[0]] = 1;
  while (stack.length) {
    const c = stack.pop();
    const cx = c % gw;
    const cz = (c - cx) / gw;
    for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = cx + dx;
      const nz = cz + dz;
      if (nx < 0 || nz < 0 || nx >= gw || nz >= gh) continue;
      const ni = nz * gw + nx;
      if (seen[ni] || !walkable(nx, nz)) continue;
      seen[ni] = 1;
      stack.push(ni);
    }
  }
  return (x, z) =>
    !!seen[Math.round((z - L.WORLD.minZ) / GS) * gw + Math.round((x - L.WORLD.minX) / GS)];
}
console.log('\nreachability from the spawn (the walker must be able to get everywhere):');
const open = flood(false);
for (const [name, x, z] of SPOTS) {
  if (!open(x, z)) fail(`${name} (${x},${z}) is unreachable on foot`);
}
console.log('  every standing place above is reachable' + (fails ? ' — except the failures listed' : ''));

console.log('\ncastle ridge — the south face is a scarp, the avenue is the way up:');
let breach = 0;
for (let x = -74; x <= 38; x += 2) {
  if (Math.abs(x + 45) <= 42) continue;
  let wall = false;
  for (let z = -196; z >= -224; z -= 2) if (S(x, z) > MAX) { wall = true; break; }
  if (!wall) { breach++; if (breach < 5) console.log(`  \u2717 the scarp is walkable at x=${x}`); }
}
const ramp = [];
for (let z = -164; z >= -236; z -= 6) ramp.push(H(-45, z).toFixed(1));
console.log(`  the avenue climbs, x=-45, z=-164..-236: ${ramp.join(' \u2192 ')}`);
if (breach) fail(`the south scarp is walkable in ${breach} places off the avenue`);
else console.log('  the face refuses everywhere off the avenue \u2713');
if (H(-45, -236) < 10) fail('the avenue does not climb to the ridge top');
// the long way round: the curled north rim DOES let a determined walker
// onto the ridge from behind. That is a reward for walking the margin,
// not a leak — but it must stay long, so the ridge top may not be
// reachable from the kingdom without either the avenue or the rim.
const sealed = flood(true);
console.log(`  with the avenue sealed, the ridge top is ${sealed(-45, -234) ? 'still reachable the long way round (via the curled rim)' : 'unreachable'}`);

/* ---- 5. the tear must not sever the canyon trail ------------------ */
console.log('\nthe tear:');
let deepest = 0, deepAt = null;
for (let z = -280; z <= -100; z += 4) {
  const x = E.tearX(z);
  const h = H(x, z);
  if (h < deepest) { deepest = h; deepAt = [Math.round(x), z]; }
}
console.log(`  floor ${deepest.toFixed(1)} at ${deepAt}; lip at (300,-150) y=${H(300, -150).toFixed(1)}`);

/* ---- 6. the fold the east road dives through ---------------------- */
console.log('\nthe crease:');
const fz = 46;
const fx = E.foldX(fz);
const prof = [];
for (let d = -34; d <= 34; d += 6) prof.push(H(fx + d, fz).toFixed(1));
console.log(`  at z=${fz} the fold runs through x=${fx.toFixed(0)}; profile ${prof.join(' ')}`);

console.log(fails ? `\n${fails} FAILURE(S)` : '\nall terrain checks pass');
rmSync('.tmp', { recursive: true, force: true });
process.exit(fails ? 1 : 0);
