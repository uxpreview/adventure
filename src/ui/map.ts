import { rng, stroke, line, scribbleCircle, hatch } from '../engine/ink';
import { INK, PENCIL } from '../engine/palette';
import { letterCanvas, S } from './lettering';
import { WORLD, REGION_SPECS, ROADS, RIVER, BRIDGES, PONDS, SANDBAR } from '../world/layout';
import { coastX } from '../world/terrain';

/**
 * THE MAP — drawn, of course. Region borders in pencil, coast and
 * river in the good blue, roads dashed the way a hand dashes them,
 * and only the lands you have actually stood in get their names.
 * The rest are a question mark, which is the honest cartography.
 */

export function renderMap(state: {
  discovered: string[];
  here: [number, number] | null;
  walked: number;
  /**
   * HOW BIG THE MAP WILL ACTUALLY BE, in CSS pixels.
   *
   * The map is drawn once at 940 across and then CSS-scaled to
   * `min(92vw, …)`. On a 320-point phone that is 294 points — a 3.2×
   * reduction — and eleven-point land names arrive on screen at three
   * and a half. The geography survives being small; the WRITING does
   * not, and a map whose names you cannot read is a decoration.
   *
   * So the hand writes BIGGER on a small map, which is what a hand
   * does. The lettering is sized for the delivered size and everything
   * else is left alone.
   */
  width?: number;
}): HTMLCanvasElement {
  const W = 940;
  const H = 760;
  /** How much to enlarge the writing so it lands at a readable size.
   *
   *  Capped at 2.2 rather than at the full reduction: writing the names
   *  at their nominal size on a 294-point map makes THE KINGDOM OF BRIM
   *  a third of the world wide, and a map whose labels are bigger than
   *  its geography is a legend, not a map. Two-and-a-bit is the
   *  compromise — small on the page, and about twenty device pixels of
   *  x-height on the phone that is actually holding it. */
  const ink = Math.max(1, Math.min(2.2, W / Math.max(1, state.width ?? W)));
  const pad = 56;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  const r = rng(77);

  const sx = (W - pad * 2) / (WORLD.maxX - WORLD.minX);
  const sz = (H - pad * 2 - 40) / (WORLD.maxZ - WORLD.minZ);
  const X = (x: number) => pad + (x - WORLD.minX) * sx;
  const Z = (z: number) => pad + 20 + (z - WORLD.minZ) * sz;

  // the sheet itself
  ctx.fillStyle = '#f6f3ea';
  ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 500; i++) {
    const x = r() * W;
    const y = r() * H;
    ctx.fillStyle = r() < 0.5 ? 'rgba(120,112,96,0.05)' : 'rgba(255,255,252,0.07)';
    ctx.fillRect(x, y, 1.6, 1.6);
  }

  // the world's own edge — four ruled-by-hand lines, corners kept
  line(ctx, X(WORLD.minX), Z(WORLD.minZ), X(WORLD.maxX), Z(WORLD.minZ), r, { width: 2.2, alpha: 0.8 });
  line(ctx, X(WORLD.maxX), Z(WORLD.minZ), X(WORLD.maxX), Z(WORLD.maxZ), r, { width: 2.2, alpha: 0.8 });
  line(ctx, X(WORLD.maxX), Z(WORLD.maxZ), X(WORLD.minX), Z(WORLD.maxZ), r, { width: 2.2, alpha: 0.8 });
  line(ctx, X(WORLD.minX), Z(WORLD.maxZ), X(WORLD.minX), Z(WORLD.minZ), r, { width: 2.2, alpha: 0.8 });

  // region borders in pencil — interior edges only
  for (const s of REGION_SPECS) {
    const b = s.rect;
    const edges: [number, number, number, number][] = [];
    if (b.maxX < WORLD.maxX) edges.push([b.maxX, b.minZ, b.maxX, b.maxZ]);
    if (b.maxZ < WORLD.maxZ) edges.push([b.minX, b.maxZ, b.maxX, b.maxZ]);
    for (const [x1, z1, x2, z2] of edges) {
      line(ctx, X(x1), Z(z1), X(x2), Z(z2), r,
        { width: 1.2, alpha: 0.35, color: PENCIL, passes: 1, jitter: 2 });
    }
  }

  // the sea: coastline in blue, then lazy wave dashes out to the edge.
  // Sampled every SIX units since Session 5 — at fourteen the Holdfast
  // and Shelter Cove were averaged into a smooth curve, and the map is
  // the one place a player can see the coast's whole shape at once.
  const coast: [number, number][] = [];
  for (let z = WORLD.minZ; z <= WORLD.maxZ; z += 6) coast.push([X(coastX(z)), Z(z)]);
  stroke(ctx, coast, r, { width: 2.2, alpha: 0.7, color: '#4a7ab0', jitter: 1.6 });
  // the sandbar: dotted, the way a chart dots a thing that is only
  // sometimes there
  {
    const bar: [number, number][] = SANDBAR.map(([x, z]) => [X(x), Z(z)]);
    for (let i = 0; i < bar.length - 1; i++) {
      const [ax, ay] = bar[i];
      const [bx, by] = bar[i + 1];
      const n = 5;
      for (let k = 0; k < n; k++) {
        const t0 = k / n;
        const t1 = t0 + 0.6 / n;
        stroke(ctx, [
          [ax + (bx - ax) * t0, ay + (by - ay) * t0],
          [ax + (bx - ax) * t1, ay + (by - ay) * t1],
        ], r, { width: 2, alpha: 0.42, color: '#8a7a5a', passes: 1 });
      }
    }
  }
  for (let i = 0; i < 60; i++) {
    const z = WORLD.minZ + r() * (WORLD.maxZ - WORLD.minZ);
    const x = WORLD.minX + 8 + r() * (coastX(z) - WORLD.minX - 22);
    stroke(ctx, [[X(x), Z(z)], [X(x + 9), Z(z) + (r() - 0.5) * 2]], r,
      { width: 1.2, alpha: 0.3, color: '#4a7ab0', passes: 1 });
  }

  // the river and the still waters
  stroke(ctx, RIVER.map(([x, z]) => [X(x), Z(z)] as [number, number]), r,
    { width: 2.4, alpha: 0.6, color: '#4a7ab0', jitter: 1.8 });
  for (const p of PONDS) {
    scribbleCircle(ctx, X(p.x), Z(p.z), Math.max(4, p.r * sx), r,
      { width: 1.4, alpha: 0.55, color: '#4a7ab0' }, 1.2);
  }

  // roads: dashes, because a hand dashes a road
  for (const road of ROADS) {
    for (let i = 0; i < road.pts.length - 1; i++) {
      const [ax, az] = road.pts[i];
      const [bx, bz] = road.pts[i + 1];
      const segs = Math.max(2, Math.round(Math.hypot(bx - ax, bz - az) / 12));
      for (let sgi = 0; sgi < segs; sgi++) {
        const t0 = sgi / segs;
        const t1 = t0 + 0.55 / segs;
        line(ctx,
          X(ax + (bx - ax) * t0), Z(az + (bz - az) * t0),
          X(ax + (bx - ax) * t1), Z(az + (bz - az) * t1),
          r, { width: 1.5, alpha: 0.5, passes: 1, jitter: 1 });
      }
    }
  }
  for (const b of BRIDGES) {
    line(ctx, X(b.x) - 4, Z(b.z) - 3, X(b.x) + 4, Z(b.z) - 3, r, { width: 1.4, alpha: 0.6, passes: 1 });
    line(ctx, X(b.x) - 4, Z(b.z) + 3, X(b.x) + 4, Z(b.z) + 3, r, { width: 1.4, alpha: 0.6, passes: 1 });
  }

  // names — earned by walking there
  for (const s of REGION_SPECS) {
    const cx = (s.rect.minX + s.rect.maxX) / 2;
    const cz = (s.rect.minZ + s.rect.maxZ) / 2;
    if (state.discovered.includes(s.id)) {
      const label = letterCanvas(s.name, { ...S.quiet(11 * ink), align: 'center' });
      ctx.drawImage(label, X(cx) - label.width / 4, Z(cz) - label.height / 4,
        label.width / 2, label.height / 2);
    } else {
      const q = letterCanvas('?', S.quiet(13 * ink));
      ctx.globalAlpha = 0.6;
      ctx.drawImage(q, X(cx) - q.width / 4, Z(cz) - q.height / 4, q.width / 2, q.height / 2);
      ctx.globalAlpha = 1;
      hatch(ctx, X(cx) - 26, Z(cz) + 10, 52, 14, 0.4, 6, r, { alpha: 0.1, color: PENCIL });
    }
  }

  // you are here
  if (state.here) {
    const [hx, hz] = state.here;
    scribbleCircle(ctx, X(hx), Z(hz), 7, r, { width: 1.8, alpha: 0.85 }, 1.3);
    ctx.fillStyle = INK;
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    ctx.arc(X(hx), Z(hz), 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    const you = letterCanvas('you', S.quiet(10 * ink));
    ctx.drawImage(you, X(hx) + 8, Z(hz) - 20, you.width / 2, you.height / 2);
  }

  // the boast line
  const found = state.discovered.length;
  const walked = Math.round(state.walked);
  const boast = letterCanvas(
    `${found} of ${REGION_SPECS.length} lands walked — ${walked} strides of ink`,
    S.quiet(10.5 * ink)
  );
  /* and the boast fits the sheet it is written on: at the small-map
     ink scale a half-size draw is wider than the map itself */
  const bw = Math.min(boast.width / 2, W - pad * 2);
  const bh = (boast.height / 2) * (bw / (boast.width / 2));
  ctx.drawImage(boast, W / 2 - bw / 2, H - 22 - bh, bw, bh);

  return canvas;
}
