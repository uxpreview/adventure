import { rng, stroke, line, scribbleCircle, hatch } from '../engine/ink';
import { INK, PENCIL } from '../engine/palette';
import { letterCanvas, S } from './lettering';
import { WORLD, REGION_SPECS, ROADS, RIVER, BRIDGES, PONDS, SANDBAR, DISTRICTS } from '../world/layout';
import { coastX } from '../world/terrain';
import { knowledge } from '../world/knowledge';

/**
 * THE MAP — drawn, of course. Region borders in pencil, coast and
 * river in the good blue, roads dashed the way a hand dashes them.
 *
 * ── AND SINCE SESSION 7 IT IS THE RECORD ───────────────────────────
 *
 * WORLD-SYSTEMS §6: *pencil for what you have heard about, ink for
 * what you have seen.* The map had drawn in both registers since
 * Session 1 and had only two things to say with them — a name, or a
 * question mark. It has three states now, and they are the whole
 * content system made visible:
 *
 *   **unknown** a question mark and a smear of pencil hatching. You
 *               have not been and nobody has mentioned it
 *   **heard**   the name, in PENCIL, in a lighter hand. Somebody named
 *               it to you — off a signpost, out of a note — and you
 *               have taken their word for it
 *   **seen**    the name, in INK. You stood in it
 *
 * And ONE road is drawn differently, and nothing anywhere explains it.
 * A player who has walked the king's road, main street and the
 * commuter spur end to end has walked one road under three of its
 * twelve names (STORY §4), and the next time they open the map it is
 * not dashed any more. It is a single ruled line from the castle gate
 * to a car park, with the other eight roads still dashes around it.
 *
 * That is Act III's reveal and it is delivered by cartography. There
 * is no caption, no note, no character, and no acknowledgement of any
 * kind — rule 5 of STORY §8 is that nobody says the turn, and the
 * cheapest way to keep that rule is to make the map's own hand say it
 * instead.
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

  /* roads: dashes, because a hand dashes a road — except the one the
     walker has been the whole way along, which is inked in one pass.
     `knowledge.has` is asked here and nowhere else in this file: the
     map does not know what the line IS, only that it is drawn now. */
  const inkedLine = knowledge.has('route:the-line');
  for (const road of ROADS) {
    if (road.line && inkedLine) {
      stroke(ctx, road.pts.map(([x, z]) => [X(x), Z(z)] as [number, number]), r,
        { width: 2.3, alpha: 0.85, jitter: 1.1 });
      continue;
    }
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

  /* names — in the register the walker earned. A name written in ink
     is a place you stood in; a name written in pencil is a place
     somebody told you about and you have taken their word for. */
  /** Every name's box on the sheet, so the districts' keep off them. */
  const placed: { l: number; r: number; t: number; b: number }[] = [];
  for (const s of REGION_SPECS) {
    const cx = (s.rect.minX + s.rect.maxX) / 2;
    const cz = (s.rect.minZ + s.rect.maxZ) / 2;
    const reg = knowledge.register(s.id, state.discovered);
    if (reg === 'unknown') {
      const q = letterCanvas('?', S.quiet(13 * ink));
      ctx.globalAlpha = 0.6;
      ctx.drawImage(q, X(cx) - q.width / 4, Z(cz) - q.height / 4, q.width / 2, q.height / 2);
      ctx.globalAlpha = 1;
      hatch(ctx, X(cx) - 26, Z(cz) + 10, 52, 14, 0.4, 6, r, { alpha: 0.1, color: PENCIL });
      continue;
    }
    /* TWO HANDS, AND THEY HAVE TO READ AS TWO HANDS AT THE SIZE THE MAP
       IS ACTUALLY DELIVERED AT. The first build of this separated them
       by alpha alone and the registers were indistinguishable on the
       contact sheet — the map is drawn at 940 and shown at about 690,
       and a 1.6× alpha difference does not survive that. So the ink
       goes HEAVIER (a name you earned is written firmly) and the pencil
       goes lighter, greyer AND thinner, which is three signals instead
       of one. */
    const heard = reg === 'heard';
    const label = letterCanvas(s.name, {
      ...S.quiet(11 * ink),
      align: 'center',
      alpha: heard ? 0.8 : 0.96,
      weightScale: heard ? 0.85 : 1.25,
      ...(heard ? { color: PENCIL } : {}),
    });
    const lw = label.width / 2;
    const lh = label.height / 2;
    ctx.globalAlpha = heard ? 0.66 : 1;
    ctx.drawImage(label, X(cx) - lw / 2, Z(cz) - lh / 2, lw, lh);
    ctx.globalAlpha = 1;
    placed.push({ l: X(cx) - lw / 2, r: X(cx) + lw / 2, t: Z(cz) - lh / 2, b: Z(cz) + lh / 2 });
    /* and a place you have only HEARD of does not get its border drawn
       around it — you know the name, not the shape. One underline, the
       way a hand marks a thing it has been told, clear of the letters'
       own descenders. */
    if (heard) {
      const uy = Z(cz) + lh / 2 - 1;
      line(ctx, X(cx) - lw * 0.42, uy, X(cx) + lw * 0.42, uy, r,
        { width: 1.1, alpha: 0.32, color: PENCIL, passes: 1, jitter: 1.6 });
    }
  }

  /* THE DISTRICTS (Session 16), drawn only inside a land the walker has
     stood in: a dashed pencil edge and a small name, the way a hand
     marks a field on a map it has walked. A land you have only heard
     of has no districts yet — you know the name, not the ground.

     AND THE NAMES KEEP OFF EACH OTHER (the local QA pass, 2026-09-04,
     B3): at portrait scale THE WOOD GATE, THE ORCHARD CLOSE and THE
     BACK STREETS were written across THE KINGDOM OF BRIM. A district's
     name is written only where it lands clear of every name already on
     the sheet, and on a map delivered under 560 points across the
     district names are not written at all — the dashed edges still say
     the ground is divided, and the card says the name when you are
     standing on it. */
  const smallMap = (state.width ?? W) < 560;
  const clear = (b: { l: number; r: number; t: number; b: number }) =>
    !placed.some((o) => b.r + 4 > o.l && b.l - 4 < o.r && b.b + 2 > o.t && b.t - 2 < o.b);
  for (const d of DISTRICTS) {
    if (knowledge.register(d.land, state.discovered) !== 'seen') continue;
    const b = d.rect;
    const corners: [number, number][] = [
      [X(b.minX), Z(b.minZ)], [X(b.maxX), Z(b.minZ)], [X(b.maxX), Z(b.maxZ)], [X(b.minX), Z(b.maxZ)],
    ];
    for (let i = 0; i < 4; i++) {
      const [ax, ay] = corners[i];
      const [bx, by] = corners[(i + 1) % 4];
      const segs = Math.max(2, Math.round(Math.hypot(bx - ax, by - ay) / 9));
      for (let k = 0; k < segs; k++) {
        const t0 = k / segs;
        const t1 = t0 + 0.5 / segs;
        line(ctx, ax + (bx - ax) * t0, ay + (by - ay) * t0, ax + (bx - ax) * t1, ay + (by - ay) * t1,
          r, { width: 0.9, alpha: 0.28, color: PENCIL, passes: 1, jitter: 1.2 });
      }
    }
    if (smallMap) continue;
    const dl = letterCanvas(d.name, { ...S.quiet(7.5 * ink), align: 'center', color: PENCIL, alpha: 0.7, weightScale: 0.85 });
    const dw = dl.width / 2;
    const dh = dl.height / 2;
    const dx = X((b.minX + b.maxX) / 2) - dw / 2;
    // at the rect's foot first, then its head, then its middle; else not
    const tries = [Z(b.maxZ) - dh - 2, Z(b.minZ) + 2, Z((b.minZ + b.maxZ) / 2) - dh / 2];
    const dy = tries.find((y) => clear({ l: dx, r: dx + dw, t: y, b: y + dh }));
    if (dy === undefined) continue;
    placed.push({ l: dx, r: dx + dw, t: dy, b: dy + dh });
    ctx.globalAlpha = 0.72;
    ctx.drawImage(dl, dx, dy, dw, dh);
    ctx.globalAlpha = 1;
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
     ink scale a half-size draw is wider than the map itself — and it
     sits UNDER the world's frame, centred in the margin below it, so
     the bigger hand a phone gets never writes across the frame's foot
     (the local QA pass, B3) */
  const bw = Math.min(boast.width / 2, W - pad * 2);
  const bh = (boast.height / 2) * (bw / (boast.width / 2));
  const frameFoot = Z(WORLD.maxZ);
  const by = Math.max(frameFoot + 4, frameFoot + (H - frameFoot - bh) / 2);
  ctx.drawImage(boast, W / 2 - bw / 2, Math.min(by, H - 4 - bh), bw, bh);

  return canvas;
}
