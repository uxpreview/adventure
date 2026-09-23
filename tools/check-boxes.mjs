// NOTHING IS INSIDE A HOUSE, asserted (2026-09-23).
//
//   npx vite --port 5173 &
//   URL=http://localhost:5173/?debug node tools/check-boxes.mjs
//
// A building that was one card stood on a line; a paper box
// (`regions/box.ts`) stands on a footprint, and a footprint can land on
// something that was already there. So this asks every land's boxes for
// their footprints — the front's line and each stand-in wall — and
// every authored place in the world where somebody walks or something
// waits: the roads, the people's rounds (and the legs between their
// stops), the things' homes, the events' places. Anything inside a box
// is listed. Needs the DEV server: it imports the world's own modules.
import { chromium } from 'playwright';
import { CHROMIUM } from './pw.mjs';

const URL = process.env.URL ?? 'http://localhost:5173/?debug';
const b = await chromium.launch({ executablePath: CHROMIUM });
const p = await b.newPage({ viewport: { width: 800, height: 500 } });
await p.addInitScript(() => localStorage.clear());
p.on('pageerror', (e) => console.log('PAGE EXCEPTION', e.message));
await p.goto(URL, { waitUntil: 'networkidle' });
await p.waitForSelector('.title-veil:not(.gone)', { timeout: 30000 }).catch(() => {});
await p.evaluate(() => window.__inklands.begin());
await p.waitForTimeout(1000);

const hits = await p.evaluate(async () => {
  const I = window.__inklands;
  /* THE FOOTPRINTS: each house's walls, as the corners of their standees */
  const boxes = [];
  I.scene.traverse((o) => {
    const h = o.userData?.houses;
    if (!h) return;
    for (const front of h.fronts) {
      // the walls themselves: the stand-ins' ends are the box's corners
      // (the front card runs past its drawn walls, and always has)
      const walls = front.userData.box?.length ? front.userData.box : [front];
      const pts = [];
      for (const m of walls) {
        const hw = m.geometry.parameters?.width / 2 || 0.5;
        const c = Math.cos(m.rotation.y), s = -Math.sin(m.rotation.y);
        pts.push([m.position.x - c * hw, m.position.z - s * hw], [m.position.x + c * hw, m.position.z + s * hw]);
      }
      const hw = front.geometry.parameters?.width / 2 || 0.5;
      const c = Math.cos(front.rotation.y), s = -Math.sin(front.rotation.y);
      const line = [[front.position.x - c * hw, front.position.z - s * hw], [front.position.x + c * hw, front.position.z + s * hw]];
      boxes.push({ at: `${front.position.x.toFixed(1)},${front.position.z.toFixed(1)}`, hull: hull(pts), front: line });
    }
  });
  function hull(P) {
    P = P.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lo = [], up = [];
    for (const q of P) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
    for (const q of P.slice().reverse()) { while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
    return lo.slice(0, -1).concat(up.slice(0, -1));
  }
  /** inside, by more than `m` units */
  const inside = (H, x, z, m = 0.3) => {
    for (let i = 0; i < H.length; i++) {
      const [ax, az] = H[i], [bx, bz] = H[(i + 1) % H.length];
      const ex = bx - ax, ez = bz - az, L = Math.hypot(ex, ez) || 1;
      if (((x - ax) * ez - (z - az) * ex) / L > -m) return false;
    }
    return true;
  };

  /* THE PLACES: everything the world modules hold with an x and a z */
  const mods = {
    layout: await import('/src/world/layout.ts'),
    events: await import('/src/world/events.ts'),
    things: await import('/src/world/things.ts'),
  };
  const pts = [];
  const legs = [];
  for (const r of mods.layout.ROADS ?? []) {
    for (let i = 0; i + 1 < r.pts.length; i++) legs.push([`road ${mods.layout.ROADS.indexOf(r)} (width ${r.width})`, r.pts[i], r.pts[i + 1], r.width / 2]);
  }
  for (const rt of mods.events.routines ?? []) {
    const st = rt.stops.filter((s) => typeof s?.x === 'number');
    st.forEach((s, i) => {
      pts.push([`${rt.id} stop ${i}`, s.x, s.z]);
      if (i + 1 < st.length) legs.push([`${rt.id} leg ${i}`, [s.x, s.z], [st[i + 1].x, st[i + 1].z]]);
    });
  }
  const seen = new Set();
  const walk = (v, path, d) => {
    if (!v || typeof v !== 'object' || seen.has(v) || d > 5 || v.isObject3D || v.isTexture) return;
    seen.add(v);
    if (typeof v.x === 'number' && typeof v.z === 'number') pts.push([path, v.x, v.z]);
    for (const [k, w] of Object.entries(v)) walk(w, `${path}.${k}`, d + 1);
  };
  walk(mods.things.things, 'things', 0);
  walk(mods.events.events, 'events', 0);
  // name an event by its id, not its index
  for (const q of pts) {
    const m = /^events\.list\.(\d+)/.exec(q[0]);
    if (m) q[0] = `event ${mods.events.events.list[+m[1]]?.id ?? m[1]}`;
  }

  /** does a–c cross the front's own line? then it went through the card before any box */
  const cross = (a, c, [p, q]) => {
    const d = (u, v, w) => (v[0] - u[0]) * (w[1] - u[1]) - (v[1] - u[1]) * (w[0] - u[0]);
    return d(a, c, p) * d(a, c, q) < 0 && d(p, q, a) * d(p, q, c) < 0;
  };
  const out = [];
  const old = [];
  for (const bx of boxes) {
    for (const [n, x, z] of pts) if (inside(bx.hull, x, z)) out.push(`${bx.at}: ${n} (${x.toFixed(1)}, ${z.toFixed(1)})`);
    // a road is as wide as it is drawn; a person is a point
    for (const [n, a, c, half = 0] of legs) {
      const steps = Math.max(1, Math.ceil(Math.hypot(c[0] - a[0], c[1] - a[1]) / 0.5));
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const x = a[0] + (c[0] - a[0]) * t, z = a[1] + (c[1] - a[1]) * t;
        if (inside(bx.hull, x, z, 0.3 - half)) {
          (cross(a, c, bx.front) ? old : out).push(`${bx.at}: ${n} crosses at (${x.toFixed(1)}, ${z.toFixed(1)})`);
          break;
        }
      }
    }
  }
  return { boxes: boxes.length, points: pts.length, legs: legs.length, out, old };
});
console.log(`${hits.boxes} boxes, ${hits.points} places, ${hits.legs} legs`);
for (const h of hits.out) console.log('  ✗', h);
if (hits.old.length) {
  console.log(`\nand ${hits.old.length} that walked through the front card before it was a box:`);
  for (const h of hits.old) console.log('  ·', h);
}
console.log(hits.out.length ? `\n${hits.out.length} inside a house` : '\nnothing inside a house');
await b.close();
process.exit(hits.out.length ? 1 : 0);
