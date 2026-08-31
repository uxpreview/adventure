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
await build({
  entryPoints: ['src/world/knowledge.ts'],
  bundle: true,
  format: 'esm',
  outfile: '.tmp/knowledge.mjs',
  logLevel: 'error',
});
const K = await import('../.tmp/knowledge.mjs');

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
  'commuter spur', 'forest track', "brack's round", 'market lane', 'canyon trail',
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
  ['forest', 145, -190], ['canyon lip', 272, -150], ['desert', 300, 45],
  ['downs', 148, -5], ['beach', -205, 60], ['ocean', -270, 60],
  ['maple court', -45, 195], ['city', 148, 205], ['office', 280, 205],
  // the coast (Session 5)
  ['boardwalk', -210, 58], ['river mouth', -203, 202], ['painted huts', -192, 4],
  ['the cut foot', -202, -16], ['the cut mid', -226, -44], ['the holdfast', -236, -78],
  ['shelter cove', -212, -134], ['cove back', -190, -150],
  ['sandbar root', -256, 76], ['sandbar mid', -290, 30],
  ['the long water', -299, 16], ['the mark', -300, -8], ['seaward face', -277, -32],
  // FARM & FOREST (Session 10)
  ['the mill', 150, -8], ['the headland', 136, 8], ['the home field', 176, -2],
  ['the ford', 147, 19], ['the drove', 96, 76], ['the scarecrow', 122, 84],
  ['the wood road', 78, -124], ['the oars', 100, -158], ['the round', 150, -153],
  ['the tarn shore', 150, -176], ['the deep pines', 188, -246],
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
/**
 * Flood the walkable page from the spawn. `block` is an extra refusal —
 * a boolean for the castle-gate seal this has always had, or (Session
 * 11) a predicate, so a land can prove that sealing its two doors makes
 * its floor unreachable and sealing one does not.
 */
function flood(block) {
  const seen = new Uint8Array(gw * gh);
  const fn = typeof block === 'function' ? block : null;
  const gate = block === true;
  const walkable = (gx, gz) => {
    const x = L.WORLD.minX + gx * GS;
    const z = L.WORLD.minZ + gz * GS;
    if (S(x, z) > MAX) return false;
    if (gate && x > -70 && x < -20 && z > -215 && z < -180) return false;
    if (fn && fn(x, z)) return false;
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

/* ---- 4b. THE COAST (Session 5) ------------------------------------ *
 * Three claims the coast makes, each of which is a lie unless the
 * height field and the wash field agree:
 *
 *   1. the sandbar is DRY and it carries a walker out to sea;
 *   2. without the bar, the open water refuses — so the bar is the
 *      reason THE WIDE BLUE is a land and not a backdrop;
 *   3. the Holdfast refuses everywhere except the cut.
 *
 * Walkability out there is a question about the WASH, not about the
 * slope, and layout.seaAt is the one authority on it (terrain.ts paints
 * from it and collision reads what it painted). That is what lets this
 * run with no canvas and no renderer.
 */
const WET = 0.62; // terrain.blockedAt refuses past this
const csm = (a, b, x) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
/** The sea as it would be with no sandbar in it. */
const bareSea = (x, z) => csm(0, 42, L.coastX(z) - x);

/** Flood the coast on foot from the boardwalk. `sea` chooses which
 *  version of the water we are walking against; `sealed` fences off a
 *  box, so a route can be proved to be the ONLY route. */
/** Distance from the ledge's own authored spine. */
function toCut(x, z) {
  let best = 1e9;
  const P = E.CUT_PATH;
  for (let i = 0; i < P.length - 1; i++) {
    const [ax, az] = P[i];
    const [bx, bz] = P[i + 1];
    const dx = bx - ax, dz = bz - az;
    const u = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz || 1)));
    best = Math.min(best, Math.hypot(x - (ax + dx * u), z - (az + dz * u)));
  }
  return best;
}

function coastFlood(sea, sealed) {
  const g = 2;
  const x0 = -380, x1 = -150, z0 = -280, z1 = 280;
  const w = Math.round((x1 - x0) / g) + 1;
  const h = Math.round((z1 - z0) / g) + 1;
  const seen = new Uint8Array(w * h);
  const ok = (gx, gz) => {
    const x = x0 + gx * g;
    const z = z0 + gz * g;
    if (S(x, z) > MAX) return false;
    if (sea(x, z) > WET) return false;
    if (sealed && sealed(x, z)) return false;
    return true;
  };
  const start = Math.round((58 - z0) / g) * w + Math.round((-210 - x0) / g);
  const stack = [start];
  seen[start] = 1;
  while (stack.length) {
    const c = stack.pop();
    const cx = c % w;
    const cz = (c - cx) / w;
    for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = cx + dx, nz = cz + dz;
      if (nx < 0 || nz < 0 || nx >= w || nz >= h) continue;
      const ni = nz * w + nx;
      if (seen[ni] || !ok(nx, nz)) continue;
      seen[ni] = 1;
      stack.push(ni);
    }
  }
  return (x, z) => !!seen[Math.round((z - z0) / g) * w + Math.round((x - x0) / g)];
}

console.log('\nthe coast — the sandbar is the road into THE WIDE BLUE:');
{
  const [ex, ez] = L.SANDBAR[L.SANDBAR.length - 1];
  console.log(`  wash on the crest: ${L.seaAt(-290, 30).toFixed(2)} mid, ` +
    `${L.seaAt(ex, ez).toFixed(2)} at the far end (dry is < ${WET})`);
  console.log(`  wash 26 units off the spine: ${L.seaAt(-290, 56).toFixed(2)} (must refuse)`);
  if (L.seaAt(-290, 56) <= WET) fail('the sea beside the sandbar is walkable — the bar is not a bar');

  const withBar = coastFlood(L.seaAt, null);
  const OUT = [['sandbar mid', -290, 30], ['the long water', -299, 16],
    ['the mark', -300, -8], ['seaward face', -277, -32]];
  for (const [n, x, z] of OUT) if (!withBar(x, z)) fail(`${n} is unreachable along the bar`);
  console.log('  every place in the open water is reachable on foot along the bar \u2713');

  const noBar = coastFlood(bareSea, null);
  const stillOut = OUT.filter(([, x, z]) => noBar(x, z));
  if (stillOut.length) fail(`the open water is walkable with no bar at all (${stillOut.map((s) => s[0])})`);
  else console.log('  with the bar erased, the open water refuses everywhere \u2713');
}

console.log('\nthe holdfast — the cut is the ONLY way onto the point:');
{
  const top = H(-236, -78);
  const climb = [[-200, -14], [-210, -27], [-220, -38], [-230, -49], [-238, -61], [-242, -76]];
  console.log(`  the point stands at y=${top.toFixed(1)}; the cut climbs ` +
    climb.map(([x, z]) => H(x, z).toFixed(1)).join(' \u2192 '));
  let worst = 0;
  for (let i = 0; i < climb.length - 1; i++) {
    const [ax, az] = climb[i];
    const [bx, bz] = climb[i + 1];
    for (let k = 0; k <= 12; k++) {
      const x = ax + (bx - ax) * (k / 12);
      const z = az + (bz - az) * (k / 12);
      worst = Math.max(worst, S(x, z));
    }
  }
  console.log(`  worst gradient along the ledge: ${worst.toFixed(2)} (walk limit ${MAX})`);
  if (worst > MAX) fail('the cut is too steep to walk');
  if (top < 9.5) fail('the point is not standing up');

  const openCoast = coastFlood(L.seaAt, null);
  if (!openCoast(-236, -78)) fail('the point is unreachable on foot');
  if (!openCoast(-212, -88)) fail('the plateau is unreachable on foot');
  // Fence the LEDGE ITSELF — a band around its authored spine, below
  // the rim — and leave every other square unit of the coast open. If
  // the point is still reachable after that, there is a second way up
  // and the whole place means less.
  // twenty-one units, not the ledge's own thirteen: elevation.ts grades
  // the page for eighteen units either side of the spine (thirteen of
  // floor and then the inner wall), so a fence at the floor's own width
  // leaves the ledge's shoulders open and the flood walks round the end
  // of it and up
  const cutSealed = coastFlood(L.seaAt, (x, z) => toCut(x, z) < 21);
  // asked at a point well INSIDE the plateau, not at the ledge's own
  // head — the fence has to be wider than the ledge it fences, so the
  // question is whether the top of the point can be reached at all
  const leak = cutSealed(-212, -88);
  console.log(`  with the ledge sealed, the point is ${leak ? 'STILL reachable' : 'unreachable'}`);
  if (leak) fail('the holdfast can be climbed without the cut');
  // and sealing it must not island the coast north of the point
  if (!cutSealed(-212, -134)) fail('sealing the ledge cuts Shelter Cove off from the beach');
  console.log('  Shelter Cove is still reachable the landward way \u2713');
}

/* ================================================================== *
 * 4c. TRAVERSAL MAY NOT BREAK THE WORLD'S GATES (Session 6).
 *
 * Steep ground and deep water are this world's ONLY traversal gating,
 * and two proofs above already stand on them: Greyweather's south scarp
 * refuses everywhere off the banner avenue, and with the ledge fenced
 * the Holdfast is unreachable. This session adds a road that carries
 * and a boat that goes where the page used to say no, and either one
 * could delete both of those silently — a carry that flings the walker
 * off the cut, a boat that goes anywhere wet.
 *
 * So the two new systems get proofs of their own, off-screen, before
 * anything is rendered.
 * ================================================================== */

console.log('\nthe carry — a road may not carry a walker off the page:');
{
  // The same numbers Character.applyCarry uses. If these drift the
  // proof stops proving anything, so they are named here on purpose.
  const CARRY_GAIN = 0.2;
  const WALK = 4.1;
  const RUN = 1.5;
  const DT = 0.05; // App clamps the frame at this

  // 1. the carry is BOUNDED and it is LOCAL. Off the road it is zero,
  //    which is what makes walking off one free.
  let maxK = 0;
  let leaked = 0;
  for (let z = L.WORLD.minZ; z <= L.WORLD.maxZ; z += 5) {
    for (let x = L.WORLD.minX; x <= L.WORLD.maxX; x += 5) {
      const c = L.roadCarryAt(x, z);
      if (c.k > maxK) maxK = c.k;
      if (c.k > 0) {
        // it may only be non-zero within the widest authored band
        let near = false;
        for (const road of L.ROADS) {
          const band = road.width * 0.5 + 4.2;
          for (let i = 0; i < road.pts.length - 1 && !near; i++) {
            const [ax, az] = road.pts[i];
            const [bx, bz] = road.pts[i + 1];
            const dx = bx - ax, dz = bz - az;
            const u = Math.max(0, Math.min(1,
              ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz || 1)));
            if (Math.hypot(x - (ax + dx * u), z - (az + dz * u)) <= band + 0.001) near = true;
          }
        }
        if (!near) leaked++;
      }
    }
  }
  console.log(`  strongest carry on the sheet: ${maxK.toFixed(2)} (must be <= 1)`);
  if (maxK > 1.0001) fail('a road carries harder than 1');
  if (leaked) fail(`the carry is non-zero ${leaked} places off every road's band`);
  else console.log(`  zero everywhere outside the roads' own width \u2713`);

  // 2. THE LINE carries hardest. STORY §4: king's road + main street +
  //    commuter spur are one road under twelve names, and this session's
  //    job is to make walking it feel like following something laid down
  //    on purpose.
  const LINE = [0, 4, 5];
  const lineK = LINE.map((i) => L.ROADS[i].carry);
  const restK = L.ROADS.filter((_, i) => !LINE.includes(i)).map((r) => r.carry);
  console.log(`  the line carries ${lineK.join('/')}; every other road ${restK.join('/')}`);
  if (Math.min(...lineK) <= Math.max(...restK)) {
    fail('a side road carries as hard as the line');
  }

  // 3. AND THE CARRIED STEP LANDS ON THE PAGE. This is the one that
  //    matters: at every point along every road, take the biggest step
  //    the carry can produce — a full run, the full speed bonus, a
  //    whole clamped frame — along the road's own tangent, and it must
  //    land somewhere a walker could have walked to anyway.
  let flung = 0;
  let flungAt = null;
  for (const road of L.ROADS) {
    for (let i = 0; i < road.pts.length - 1; i++) {
      const [ax, az] = road.pts[i];
      const [bx, bz] = road.pts[i + 1];
      const seg = Math.hypot(bx - ax, bz - az);
      const n = Math.max(2, Math.round(seg / 1.5));
      for (let k = 0; k <= n; k++) {
        const t = k / n;
        // check the road's shoulders too — a walker wanders
        for (const o of [0, road.width * 0.4, -road.width * 0.4]) {
          const nx = (bz - az) / seg;
          const nz = -(bx - ax) / seg;
          const x = ax + (bx - ax) * t + o * nx;
          const z = az + (bz - az) * t + o * nz;
          const c = L.roadCarryAt(x, z);
          if (c.k <= 0) continue;
          const step = WALK * RUN * (1 + CARRY_GAIN * c.k) * DT;
          for (const dir of [1, -1]) {
            const px = x + c.tx * dir * step;
            const pz = z + c.tz * dir * step;
            if (S(px, pz) > MAX) {
              flung++;
              if (!flungAt) flungAt = [Math.round(px), Math.round(pz)];
            }
          }
        }
      }
    }
  }
  if (flung) fail(`the carry steps into unwalkable ground in ${flung} places (first ${flungAt})`);
  else console.log('  a full-speed carried step lands on walkable ground everywhere \u2713');
}

console.log('\nthe rowboat — its ground is water, and it refuses every other:');
{
  // 1. it floats where it is meant to and nowhere else
  const HOME = L.BOAT_HOME;
  const launch = (() => {
    for (let rad = 1.5; rad <= 16; rad += 1) {
      for (let k = 0; k < 28; k++) {
        const a = (k / 28) * Math.PI * 2;
        const x = HOME.x + Math.cos(a) * rad;
        const z = HOME.z + Math.sin(a) * rad;
        if (L.rowableAt(x, z)) return [x, z];
      }
    }
    return null;
  })();
  if (!launch) fail('the boat cannot be shoved off from where it is left');
  else console.log(`  she is drawn up at ${HOME.x},${HOME.z} and floats at ` +
    `${launch.map((v) => v.toFixed(0))} \u2713`);

  // 2. THE RIVER IS A ROUTE. It crosses the whole sheet and has been a
  //    wall its whole length except at three bridges; under oar it must
  //    be continuous from the mouth to the source, bridges included.
  const G = 2;
  const rw = Math.round((L.WORLD.maxX - L.WORLD.minX) / G) + 1;
  const rh = Math.round((L.WORLD.maxZ - L.WORLD.minZ) / G) + 1;
  function rowFlood(from) {
    const seen = new Uint8Array(rw * rh);
    const at = (gx, gz) => [L.WORLD.minX + gx * G, L.WORLD.minZ + gz * G];
    const sx = Math.round((from[0] - L.WORLD.minX) / G);
    const sz = Math.round((from[1] - L.WORLD.minZ) / G);
    const stack = [sz * rw + sx];
    seen[stack[0]] = 1;
    while (stack.length) {
      const c = stack.pop();
      const cx = c % rw;
      const cz = (c - cx) / rw;
      for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = cx + dx, nz = cz + dz;
        if (nx < 0 || nz < 0 || nx >= rw || nz >= rh) continue;
        const ni = nz * rw + nx;
        if (seen[ni]) continue;
        const [wx, wz] = at(nx, nz);
        if (!L.rowableAt(wx, wz)) continue;
        seen[ni] = 1;
        stack.push(ni);
      }
    }
    return (x, z) =>
      !!seen[Math.round((z - L.WORLD.minZ) / G) * rw + Math.round((x - L.WORLD.minX) / G)];
  }
  const afloat = rowFlood(launch ?? [-200, 210]);
  const UP = [
    ['under the boardwalk bridge', -200, 210], ['the long reach', -108, 192],
    ["the king's road bridge", -45, 170], ['the meadow bend', 52, 100],
    ['the east road bridge', 110, 45], ['the downs', 168, 8],
    ['the canyon mouth', 274, -72], ['the source', 301, -104],
  ];
  for (const [n, x, z] of UP) if (!afloat(x, z)) fail(`the river is not rowable at ${n}`);
  console.log('  the river carries an oar from the sea to the source, under all three bridges \u2713');

  // 3. AND IT STOPS. The open sea past the shallows refuses, which is
  //    what keeps THE WIDE BLUE a land you WALK (Session 5's sandbar)
  //    and keeps the torn west edge unspent.
  //
  //    THE SANDBAR COUNTS AS SHORE, deliberately: its crest is dry
  //    paper (that is the whole of what it is), so an oar works either
  //    side of it and the boat can run the shelf between the beach and
  //    the bar. That is the reverse of deleting Session 5's work — the
  //    bar is the ONLY reason a boat can be out there at all, exactly
  //    as it is the only reason a walker can.
  const OFF = [
    ['deep water off the huts', -300, 130], ['the far west', -370, -40],
    ['past the bar', -350, 10], ['the north sea', -320, -160],
    ['the south sea', -330, 240],
  ];
  for (const [n, x, z] of OFF) {
    if (L.rowableAt(x, z)) fail(`the boat can row out to ${n} — the open sea does not refuse`);
    if (afloat(x, z)) fail(`the boat can REACH ${n}`);
  }
  // and the torn west edge itself, which stays unspent
  let edge = 0;
  for (let z = L.WORLD.minZ; z <= L.WORLD.maxZ; z += 4) {
    for (let x = L.WORLD.minX; x <= -345; x += 4) if (afloat(x, z)) edge++;
  }
  if (edge) fail(`the boat reaches the torn west margin in ${edge} places`);
  console.log(`  the open sea refuses past ${L.ROW_REACH} units off dry paper, ` +
    'and the torn west edge stays unspent \u2713');

  // 4. THE GATES STILL HOLD. The strongest claim in this block, and the
  //    one the whole session is judged on: a boat may not put anybody
  //    ashore anywhere the WALK could not already reach. Flood the
  //    water, then step ashore everywhere it touches land, and check
  //    every one of those landings against the walker's own flood fill
  //    from the spawn.
  let smuggled = 0;
  let smuggledAt = null;
  for (let z = L.WORLD.minZ; z <= L.WORLD.maxZ; z += G) {
    for (let x = L.WORLD.minX; x <= L.WORLD.maxX; x += G) {
      if (!afloat(x, z)) continue;
      // App.landingNear: rings outward to fifteen units, first dry
      // walkable square wins
      for (let rad = 2.4; rad <= 15 && !smuggledAt; rad += 1.2) {
        for (let k = 0; k < 24; k++) {
          const a = (k / 24) * Math.PI * 2;
          const px = x + Math.cos(a) * rad;
          const pz = z + Math.sin(a) * rad;
          if (L.waterFieldAt(px, pz) > 0.3) continue;
          if (S(px, pz) > MAX) continue;
          if (!open(px, pz)) {
            smuggled++;
            if (!smuggledAt) smuggledAt = [Math.round(px), Math.round(pz)];
          }
          break;
        }
      }
    }
  }
  if (smuggled) {
    fail(`the boat lands the walker in ${smuggled} places the walk cannot reach ` +
      `(first ${smuggledAt}) — the world's gating is deleted`);
  } else {
    console.log('  every place the boat can put you ashore is already reachable on foot \u2713');
  }

  // 5. and the two gates that have their own proofs above, restated
  //    against the water: no oar goes near either.
  const NEAR_GATES = [
    ['the holdfast plateau', -212, -88], ['the point', -236, -78],
    ['the castle ridge', -45, -234], ['the bailey', -45, -222],
  ];
  for (const [n, x, z] of NEAR_GATES) {
    let wet = false;
    for (let rad = 0; rad <= 15 && !wet; rad += 2) {
      for (let k = 0; k < 16; k++) {
        const a = (k / 16) * Math.PI * 2;
        if (afloat(x + Math.cos(a) * rad, z + Math.sin(a) * rad)) { wet = true; break; }
      }
    }
    if (wet) fail(`the boat can reach within fifteen units of ${n}`);
  }
  console.log('  neither gated place has navigable water within fifteen units \u2713');
}

/* ---- 5. the tear must not sever the canyon trail ------------------ */
/* ---- 4d. THE FORD, AND BRACK'S ROUND (Session 10) ------------------ *
 * Two claims THE HARROW DOWNS and THE PENWOOD make in their geometry
 * rather than in a note, so they are asserted rather than trusted:
 *
 *   1. THE FORD is the only place a walker crosses the river between
 *      the east road's bridge and the sea, and the river is still wet
 *      enough there to float an oar — because `route:the-river` runs
 *      salt to source and a shallow that stopped a rowboat would sever
 *      it in the middle of the Downs.
 *   2. BRACK'S ROUND never comes within forty units of the tarn, at any
 *      point on it, and it goes all the way round. THE-WAITS §7 is a
 *      behaviour and a road, and this is the road half.
 */
console.log('\nthe ford — the mill lane crosses, and the oar still passes:');
{
  const F = L.FORDS[0];
  const wet = L.waterFieldAt(F.x, F.z);
  const k = L.fordAt(F.x, F.z);
  const blocked = (x, z) =>
    L.waterFieldAt(x, z) > WET && L.fordAt(x, z) < 0.45;
  console.log(`  at the crossing: water ${wet.toFixed(2)}, ford ${k.toFixed(2)}, bed lifted to y=${H(F.x, F.z).toFixed(1)}`);
  let walk = 0;
  for (let z = F.z - 12; z <= F.z + 12; z += 0.5) if (!blocked(F.x, z)) walk++;
  if (blocked(F.x, F.z)) fail('the ford does not let a walker across');
  else console.log('  a walker crosses the mill lane at the ford \u2713');
  if (!L.rowableAt(F.x, F.z)) fail('the ford has run the rowboat aground');
  else console.log('  and an oar still works in it, so the river is not severed \u2713');
  // and it is the ONLY dry-shod crossing on this stretch. The river runs
  // diagonally here, so the transect has to be long enough to actually
  // meet it: sixty units of north–south at each x, which crosses the
  // channel wherever it has wandered to.
  let leaks = 0;
  for (let d = 14; d < 46; d += 1) {
    for (const sgn of [-1, 1]) {
      const x = F.x + sgn * d;
      let crossed = true;
      for (let z = -30; z <= 30; z += 0.5) {
        if (blocked(x, F.z + z)) { crossed = false; break; }
      }
      if (crossed) leaks++;
    }
  }
  if (leaks) fail(`the river is fordable in ${leaks} places off the ford`);
  else console.log('  and it is the only dry-shod crossing for forty units either way \u2713');
}

console.log("\nbrack's round — the road keeps his forty units:");
{
  const ring = L.ROADS[7];
  const C = { x: 150, z: -195 };
  let near = 1e9;
  let nearAt = null;
  for (let i = 0; i < ring.pts.length - 1; i++) {
    const [ax, az] = ring.pts[i];
    const [bx, bz] = ring.pts[i + 1];
    for (let t = 0; t <= 1; t += 0.02) {
      const x = ax + (bx - ax) * t;
      const z = az + (bz - az) * t;
      const d = Math.hypot(x - C.x, z - C.z);
      if (d < near) { near = d; nearAt = [Math.round(x), Math.round(z)]; }
    }
  }
  const closed =
    ring.pts[0][0] === ring.pts[ring.pts.length - 1][0] &&
    ring.pts[0][1] === ring.pts[ring.pts.length - 1][1];
  console.log(`  nearest the water: ${near.toFixed(1)} units at ${nearAt}`);
  console.log(`  and it closes: ${closed ? 'yes — the wood has one road and it is a circle' : 'NO'}`);
  if (near < 40) fail(`the round comes within ${near.toFixed(1)} units of the tarn`);
  if (!closed) fail('the round does not close');
  // the bowl: you can see down it, and you can walk down it
  const prof = [];
  for (let d = 42; d >= 14; d -= 4) prof.push(H(C.x, C.z + d).toFixed(1));
  console.log(`  the bowl, ring to water: ${prof.join(' \u2192 ')}`);
  let steep = 0;
  for (let d = 14; d <= 44; d += 1) {
    for (let a = 0; a < 6.28; a += 0.2) {
      if (S(C.x + Math.cos(a) * d, C.z + Math.sin(a) * d) > MAX) steep++;
    }
  }
  if (steep) fail(`the tarn's bowl refuses a walker in ${steep} places`);
  else console.log('  and it is walkable all the way down, from every side \u2713');
}

/* ---- 4e. SPLITROCK AND THE FLATS (Session 11) ---------------------- *
 * Four claims these two lands make in their GEOMETRY rather than in a
 * note, so they are asserted rather than trusted:
 *
 *   1. THE CHANNEL HAS TWO ENDS AND NOTHING ELSE. The floor of the tear
 *      is reachable on foot; it is reachable with the head sealed and
 *      reachable with the mouth sealed; and with BOTH sealed it is not
 *      reachable at all. That is the whole traversal design of the land
 *      in one test — a corridor with two doors and ten units of
 *      unclimbable wall everywhere else.
 *   2. THE TRAIL IS IN THE CHANNEL. Every point of the canyon trail
 *      north of the mouth sits inside the tear's six-unit floor. The
 *      polyline is authored in `layout.ts` and cannot import `tearX`, so
 *      this is the thing that stops the two drifting apart.
 *   3. AMOS WALKS FORTY UNITS AND NEVER LEAVES HIS LAND. The catch, the
 *      oasis, the distance between them, and the whole of the track,
 *      inside THE BLEACH FLATS' rect with a margin — because nobody
 *      crosses a border but the walker, and his wait IS the walk.
 *   4. THE FOLD'S TWO POSTS ARE ON THE FOLD'S TWO SHOULDERS, opposite
 *      faces, opposite ends, on walkable ground, and far enough apart
 *      that one crossing of the east road cannot take both.
 */
const CHANNEL = { headZ: [-256, -222], mouthZ: [-136, -96], deepZ: [-220, -140] };
console.log('\nsplitrock — the channel has two ends and nothing else:');
{
  const floorAt = (z) => [E.tearX(z), z];
  const prof = [];
  for (let z = -256; z <= -100; z += 12) prof.push(H(...floorAt(z)).toFixed(1));
  console.log(`  head to mouth: ${prof.join(' → ')}`);

  let worst = 0;
  for (let z = CHANNEL.deepZ[0]; z <= CHANNEL.deepZ[1]; z += 1) {
    const sl = S(...floorAt(z));
    if (sl > worst) worst = sl;
  }
  console.log(`  worst gradient on the deep floor: ${worst.toFixed(2)} (walk limit ${MAX})`);
  if (worst > MAX) fail('the channel floor refuses a walker');

  // the two doors, and then neither
  const target = floorAt(-180);
  const seal = (bands) => (x, z) => {
    if (x < 250 || x > 360) return false;
    return bands.some(([a, b]) => z > a && z < b);
  };
  const reach = (bands) => flood(bands.length ? seal(bands) : null)(target[0], target[1]);
  const open = reach([]);
  const noHead = reach([CHANNEL.headZ]);
  const noMouth = reach([CHANNEL.mouthZ]);
  const neither = reach([CHANNEL.headZ, CHANNEL.mouthZ]);
  console.log(`  the floor at (${target[0].toFixed(0)}, ${target[1]}): open ${open}, head sealed ${noHead}, mouth sealed ${noMouth}, both sealed ${neither}`);
  if (!open) fail('the channel floor is unreachable on foot');
  if (!noHead) fail('the mouth alone does not get a walker onto the channel floor');
  if (!noMouth) fail('the head alone does not get a walker onto the channel floor');
  if (neither) fail('the tear has a third way in — its walls do not refuse');
}

console.log('\nthe canyon trail keeps to the channel:');
{
  const trail = L.ROADS[9];
  let worstOff = 0, worstAt = null;
  for (const [x, z] of trail.pts) {
    if (z > -104) continue;
    const off = Math.abs(x - E.tearX(z));
    if (off > worstOff) { worstOff = off; worstAt = [x, z]; }
  }
  console.log(`  furthest any in-channel point strays from the tear's axis: ${worstOff.toFixed(1)} units at ${worstAt}`);
  if (worstOff > 6) fail(`the trail leaves the channel floor by ${worstOff.toFixed(1)} units`);
}

console.log('\namos — forty units, and never over a border:');
{
  const CATCH = { x: 301, z: 95 };
  const OASIS = L.PONDS[1];
  const d = Math.hypot(CATCH.x - OASIS.x, CATCH.z - OASIS.z);
  const rect = L.REGION_SPECS.find((r) => r.id === 'desert').rect;
  console.log(`  the catch (${CATCH.x}, ${CATCH.z}) to the oasis (${OASIS.x}, ${OASIS.z}): ${d.toFixed(1)} units`);
  if (d < 36 || d > 44) fail(`amos's walk is ${d.toFixed(1)} units, not forty`);
  let steep = 0, outside = 0;
  for (let t = 0; t <= 1; t += 0.01) {
    const x = CATCH.x + (OASIS.x - CATCH.x) * t;
    const z = CATCH.z + (OASIS.z - CATCH.z) * t;
    if (S(x, z) > MAX) steep++;
    if (x < rect.minX + 8 || x > rect.maxX - 8 || z < rect.minZ + 8 || z > rect.maxZ - 8) outside++;
  }
  if (steep) fail(`amos's track refuses a walker in ${steep} places`);
  else console.log('  and he can walk it, every night, both ways ✓');
  if (outside) fail(`amos's track comes within eight units of a border in ${outside} places`);
  else console.log('  and it never comes within eight units of a border ✓');
  console.log(`  the catch stands at y=${H(CATCH.x, CATCH.z).toFixed(1)} and the oasis at y=${H(OASIS.x, OASIS.z - OASIS.r - 4).toFixed(1)}: he carries it uphill`);
}

console.log('\nthe fold — both faces, both ends:');
{
  const route = K.ROUTES.find((r) => r.id === 'fact:the-fold');
  if (!route) fail('fact:the-fold does not exist');
  else {
    const [a, b] = route.posts;
    const fa = a[0] - E.foldX(a[1]);
    const fb = b[0] - E.foldX(b[1]);
    console.log(`  west post ${a} sits ${fa.toFixed(1)} off the fold (y=${H(a[0], a[1]).toFixed(1)})`);
    console.log(`  east post ${b} sits ${fb.toFixed(1)} off the fold (y=${H(b[0], b[1]).toFixed(1)})`);
    if (fa > -12 || fb < 12) fail('the fold’s posts are not on opposite faces');
    if (Math.abs(Math.abs(fa) - 16) > 4 || Math.abs(Math.abs(fb) - 16) > 4) {
      fail('the fold’s posts have drifted off the shoulders');
    }
    if (S(a[0], a[1]) > MAX || S(b[0], b[1]) > MAX) fail('a fold post stands on unwalkable ground');
    const apart = Math.hypot(a[0] - b[0], a[1] - b[1]);
    console.log(`  and they are ${apart.toFixed(0)} units apart, so one crossing takes neither pair`);
    if (apart < 2 * route.reach * 3) fail('the fold can be learned by crossing the east road once');
  }
}

console.log('\nthe tear:');
let deepest = 0, deepAt = null;
for (let z = -280; z <= -100; z += 4) {
  const x = E.tearX(z);
  const h = H(x, z);
  if (h < deepest) { deepest = h; deepAt = [Math.round(x), z]; }
}
console.log(`  floor ${deepest.toFixed(1)} at ${deepAt}; west lip at (272,-150) y=${H(272, -150).toFixed(1)}`);

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
