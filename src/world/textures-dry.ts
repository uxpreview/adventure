import * as THREE from 'three';
import {
  makeTexture, stroke, line, scribbleCircle, hatch, type Ctx2D,
} from '../engine/ink';
import { INK, PENCIL, WASH } from '../engine/palette';

/**
 * THE DRY LANDS' prop box — SPLITROCK CANYON and THE BLEACH FLATS
 * (design/specs/splitrock-canyon.md, design/specs/the-bleach-flats.md).
 *
 * ── ONE FILE, TWO LANDS, AND THE DIFFERENCE IS THE POINT ────────────
 *
 * **The canyon is drawn in verticals. The flats are drawn in
 * horizontals.** They share a prop box precisely so that is a decision
 * somebody made rather than something that happened: the two lands are
 * each other's opposite — a hole in the page against the flattest ground
 * in the world — and if their drawings lived in separate files the
 * opposition would be an accident of who wrote which.
 *
 * ── THE CANYON'S SIGNATURE MARK ─────────────────────────────────────
 *
 * **Rock is a stack of horizontal beds with vertical fracture lines cut
 * through them, and the fractures are drawn LAST and go all the way
 * through.** A bed that stops at a fracture is a brick. A fracture that
 * runs through six beds is a rock that split, which is what the land is
 * called. Every fin, slab and wall panel here is built that way and
 * nothing here is outlined and then filled.
 *
 * And the pen gets HEAVIER as it goes down. This is the only land in the
 * game where that is true: the rim is bleached and drawn light, the
 * floor has ten units of page standing over it and is drawn dark.
 *
 * ── THE FLATS' SIGNATURE IS NOT A SHAPE, IT IS A PRESSURE ───────────
 *
 * **Heat is line weight.** The pen presses hardest where the water is —
 * the oasis's reeds, Amos's guttering — and thins by a third for every
 * twenty units out, until in the middle of the pan the marks are barely
 * there and the paper is doing the work. Nothing is faded with alpha;
 * the STROKE is thinner and its passes drop from two to one. A filter
 * over a drawing is a filter. A thinner line is a hotter day.
 *
 * ── AND ONE REGISTER NOTE, WHICH GOVERNS BOTH ───────────────────────
 *
 * `THE-WAITS` §4 and §5: Holt's register is *short sentences — people
 * out here do not use two words*, and Amos's is *flat, patient, faintly
 * aggrieved*. Neither is wry. There is one joke in these two lands and
 * it is not in this file: it is a skull and a boot forty units apart
 * pointing the same way, and it is not funny.
 */

/* Pigments. Line and body colours mixed for these two lands; every wash
 * in this file still comes out of palette.ts. */
const ROCK = '#8a7563';
const ROCK_PALE = '#c0aa92';
const CHALK = '#f3efe4';
const BLEACH = '#e8dcc0';
const GRIT = '#b9a481';
/** The one warm thing in either land: a hull somebody has oiled. */
const OILED = '#8a5a30';
const TIN = '#9aa0a2';
const GREEN = '#7d9160';
const GREEN_DEEP = '#5d7347';

function fillPoly(ctx: Ctx2D, pts: [number, number][], color: string, alpha: number) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function poly(
  ctx: Ctx2D, pts: [number, number][], r: () => number,
  o: Parameters<typeof stroke>[3] = {}
) {
  stroke(ctx, [...pts, pts[0]], r, o);
}

/**
 * A GROUND STAIN WITH NO EDGE ON IT.
 *
 * The third copy of this function in this project and the third land
 * session to need it, for the reason Session 10 wrote down: `fillBlob`
 * is a sixteen-sided polygon, and on a decal that TILES ACROSS A WHOLE
 * LAND every one of those sixteen sides shows from a hundred units. A
 * stain on paper has no boundary — it fades. Every ground colour in both
 * of these lands goes through here.
 */
function stain(
  ctx: Ctx2D, cx: number, cy: number, rx: number, ry: number,
  color: string, alpha: number
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(1, ry / rx);
  const g = ctx.createRadialGradient(0, 0, rx * 0.05, 0, 0, rx);
  const rgb = color.replace('#', '');
  const c = [0, 2, 4].map((i) => parseInt(rgb.slice(i, i + 2), 16)).join(',');
  g.addColorStop(0, `rgba(${c},${alpha})`);
  g.addColorStop(0.58, `rgba(${c},${alpha * 0.64})`);
  g.addColorStop(1, `rgba(${c},0)`);
  ctx.fillStyle = g;
  ctx.fillRect(-rx, -rx, rx * 2, rx * 2);
  ctx.restore();
}

/**
 * ERASE THE ENDS OF A RUN.
 *
 * Session 10's law, and it applies to every cutout in this file that
 * stands in a line with others: a panel is a rectangle and a run of them
 * is a row of cards until you fade its ends. Used by the wall panels and
 * by the strand lines, which are the two things here that are laid end
 * to end.
 */
function eraseEnds(ctx: Ctx2D, w: number, h: number, pad: number, vpad = 0) {
  ctx.globalCompositeOperation = 'destination-out';
  for (const [x0, x1] of [[0, pad], [w, w - pad]] as [number, number][]) {
    if (pad <= 0) break;
    const g = ctx.createLinearGradient(x0, 0, x1, 0);
    g.addColorStop(0, 'rgba(0,0,0,1)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(Math.min(x0, x1), 0, pad, h);
  }
  /* AND ON THE TOP AND BOTTOM TOO, for anything that lies ON a cliff
   * rather than standing on the flat. Round 2 of the world sheet had
   * the wall panels reading as sheets of glass leaning against the
   * canyon, and the give-away was four hard rectangle edges: a mark on
   * a rock face has no edges at all, in any direction. */
  for (const [y0, y1] of [[0, vpad], [h, h - vpad]] as [number, number][]) {
    if (vpad <= 0) break;
    const g = ctx.createLinearGradient(0, y0, 0, y1);
    g.addColorStop(0, 'rgba(0,0,0,1)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, Math.min(y0, y1), w, vpad);
  }
  ctx.globalCompositeOperation = 'source-over';
}

/* ================================================================== *
 * THE THREE REGISTERS — the canyon's.
 *
 * The Penwood's law, kept: full ballpoint pressure belongs to the
 * FOREGROUND layer and nothing else. A twenty-unit fin at register 0
 * that ends up ten units from the lens is a hundred individual
 * scratches across a third of the frame.
 * ================================================================== */

export type Reg = 0 | 1 | 2;

const REG = [
  { w: 3.6, a: 0.86, color: INK, body: 0.30, mass: 0.88 },   // near
  { w: 2.1, a: 0.58, color: INK, body: 0.20, mass: 0.7 },    // the run
  { w: 1.2, a: 0.30, color: PENCIL, body: 0.12, mass: 0.42 }, // the far wall
] as const;

/**
 * AND `mass` IS WHY IT IS FOUR NUMBERS AND NOT THREE.
 *
 * The Penwood's three registers carry a `wash` that is deliberately
 * thin, because foliage IS thin — you see the wood through the wood, and
 * that is what makes a stand a stand. **Rock is not foliage.** Round 2
 * of the world sheet had the walker standing between two fins on the
 * west bench and looking through both of them at the canyon behind, and
 * the frame read as a stack of cellophane crates. A rock is OPAQUE, so
 * the fins' silhouettes are filled at `mass` rather than at `body`, and
 * the near register is very nearly solid. It is the one thing in either
 * of these two lands that hides what is behind it.
 */

/* ================================================================== *
 * PART ONE — SPLITROCK CANYON
 * ================================================================== */

/**
 * BEDDED ROCK, and it is the only drawing idea in the canyon.
 *
 * Lay `n` horizontal beds across a box, each one a wandering stroke with
 * a little shade under it, and then cut `k` fractures straight down
 * through the whole stack. The beds are what makes it rock; the
 * fractures are what makes it SPLIT rock; and the fractures going
 * through rather than stopping is the difference between a cliff and a
 * wall built out of blocks.
 */
function beds(
  ctx: Ctx2D, r: () => number, x: number, y: number, w: number, h: number,
  n: number, reg: Reg, o: { fractures?: number; shade?: number } = {}
) {
  const R = REG[reg];
  /* ROUND 1 OF THE TEXTURE SHEET THREW THE FIRST VERSION AWAY and the
   * fault was one word: REGULAR. Beds at (i + 0.5) / n, all spanning the
   * full width, all the same weight, with fractures ruled between them,
   * is graph paper — and a fin drawn on graph paper is an obelisk. Rock
   * beds are laid down over different centuries: they vary in
   * THICKNESS by a factor of three, most of them do not run the whole
   * way across, and the ones that matter have a hand's width of shadow
   * under them and the rest have none. */
  const cuts: number[] = [0];
  let acc = 0;
  const w8 = new Array(n).fill(0).map(() => 0.4 + r() * 1.6);
  for (const k of w8) acc += k;
  for (const k of w8) cuts.push(cuts[cuts.length - 1] + k / acc);
  for (let i = 0; i < n; i++) {
    const yy = y + cuts[i + 1] * h;
    const thick = (cuts[i + 1] - cuts[i]) * h;
    // a bed rarely runs the whole way: it wedges out
    const x0 = x + (r() < 0.55 ? r() * w * 0.3 : 0);
    const x1 = x + w - (r() < 0.55 ? r() * w * 0.3 : 0);
    const pts: [number, number][] = [];
    const segs = 4 + Math.floor(r() * 3);
    const sag = (r() - 0.5) * h * 0.03;
    for (let s2 = 0; s2 <= segs; s2++) {
      const t = s2 / segs;
      pts.push([x0 + (x1 - x0) * t, yy + sag * Math.sin(t * Math.PI * 1.7) + (r() - 0.5) * 1.8]);
    }
    const heavy = r() < 0.34;
    stroke(ctx, pts, r, {
      width: R.w * (heavy ? 0.85 : 0.34 + r() * 0.28),
      alpha: R.a * (heavy ? 0.66 : 0.22 + r() * 0.2),
      color: R.color, passes: 1,
    });
    // the shade UNDER a bed, never over it: the sun is up, and only the
    // heavy beds get any, which is what stops it reading as corduroy
    if (heavy && (o.shade ?? 1) > 0) {
      hatch(ctx, x0, yy + 1, x1 - x0, Math.min(thick * 0.55, 26), 0.03, 3.4 + r() * 2, r,
        { alpha: R.a * 0.16 * (o.shade ?? 1), width: R.w * 0.32, color: R.color, passes: 1 });
    }
  }
  /* THE FRACTURES, DRAWN LAST AND ALL THE WAY THROUGH, and there are
   * two of them and not five. A fracture that runs through six beds is a
   * rock that split; five of them evenly spaced is masonry. */
  const k = o.fractures ?? 2;
  for (let i = 0; i < k; i++) {
    const fx = x + w * (0.2 + 0.6 * ((i + 0.35 + r() * 0.3) / k));
    const dx = (r() - 0.5) * w * 0.16;
    line(ctx, fx, y - 3, fx + dx, y + h + 3, r,
      { width: R.w * 0.55, alpha: R.a * 0.44, color: R.color, passes: 1 },
      Math.max(5, Math.round(h / 18)));
    // and the sliver of shade in it, on one hand only
    line(ctx, fx + 2.5, y - 3, fx + dx + 2.5, y + h + 3, r,
      { width: R.w * 0.5, alpha: R.a * 0.2, color: R.color, passes: 1 },
      Math.max(5, Math.round(h / 26)));
  }
}

/**
 * A STANDING FIN — the west bench's rock, and the thing the land is
 * named for.
 *
 * It is a BLADE, not a mesa: paper tears along its fibres and rock
 * splits along its bedding, so a group of fins is parallel or it is
 * wrong. Session 1's draft drew six mesas in a rank at twenty-four-unit
 * spacing, which is a bar violation with a rock texture on it; this is
 * one drawing, shared, instanced, and the variety is in the plan.
 */
export function splitFinTexture(seed: number, reg: Reg = 1): THREE.CanvasTexture {
  return makeTexture(320, 288, seed, (ctx, r) => {
    const R = REG[reg];
    /* TWO ROUNDS OF THE TEXTURE SHEET WENT ON THIS ONE DRAWING and both
     * failures were the same failure: it was TALL AND POINTED, so it read
     * as an obelisk and then as a rocket. Split rock is not a spire. It
     * is a BLOCK that a fracture went through — wider than it is tall,
     * sides that stand up nearly vertical and step where beds have come
     * away, and a top that is BROKEN FLAT with a notch in it, never a
     * summit. So the canvas is landscape now, which forced the shape.
     *
     * And it has a SHADED SIDE, which is the other half of why the first
     * two read as paper cut-outs of nothing: rock reads as rock when one
     * face is in the light and the other is not. */
    /* AND THE SILHOUETTE VARIES BY SEED OR THREE OF THESE STANDING
     * TOGETHER ARE THREE OF THE SAME BOX. The lever is not noise on the
     * corners — it is the block's PROPORTION and where its mass sits:
     * `squat` decides how far down the top starts, `slew` leans the
     * whole thing one way, and the two step patterns are independent. */
    /* AND THE TOP IS A WEDGE, NOT A LID. Round 2 of the world sheet put
     * these on the bench and they read as crates, and the reason was
     * that the silhouette was a rectangle with a wavy line on top of it:
     * two near-vertical sides the same length and a flat top between
     * them is a box however much you wobble the wobble. A block that a
     * fracture went through does not weather evenly — one end stands and
     * the other goes — so the top SLOPES, hard, across the whole width,
     * and the low end is where the fallen piece at the foot came from.
     * Which end is high is decided per seed and it commits. */
    const squat = 0.5 + r() * 1.0;
    const topY = 18 + squat * 34;
    const drop = 52 + r() * 60;        // how far the top falls across
    const highRight = r() > 0.5;
    const slew = (r() - 0.5) * 30;
    const lx = 22 + r() * 34;
    const rx = 298 - r() * 40;
    const yL = highRight ? topY + drop : topY;
    const yR = highRight ? topY : topY + drop;
    const notchX = lx + 50 + r() * (rx - lx - 110);
    const top: [number, number][] = [
      [lx + slew * 0.3, yL + 8 + r() * 12],
      [notchX - 24 - r() * 14, yL + (yR - yL) * 0.28 + (r() - 0.5) * 14],
      [notchX, yL + (yR - yL) * 0.4 + 12 + r() * 14],
      [notchX + 18 + r() * 20, yL + (yR - yL) * 0.62 + (r() - 0.5) * 12],
      [rx + slew * 0.3, yR + 10 + r() * 14],
    ];
    const step = (x0: number, dir: number): [number, number][] => {
      const out: [number, number][] = [];
      const n = 3 + Math.floor(r() * 3);
      for (let i = 1; i <= n; i++) {
        const t = i / n;
        out.push([x0 + dir * (r() * 16 + 4) - slew * 0.4 * (1 - t), topY + (284 - topY) * t]);
      }
      out[out.length - 1] = [x0 + dir * (6 + r() * 10), 284];
      return out;
    };
    const left: [number, number][] = [top[0], ...step(lx, -1)];
    const right: [number, number][] = [top[4], ...step(rx, 1)];
    const body: [number, number][] = [...left, ...[...right].reverse()];
    // body tone, laid in wide flat bands rather than one oval: a rock
    // face is horizontal, and so is everything that stains it
    /* AND THEY HAVE A BODY. Round 2 of the world sheet put these on the
     * bench and they read as transparent crates — all outline and no
     * mass, because a stain fades to nothing at its own edge and the
     * silhouette is exactly where a rock needs to be solid. So the
     * polygon is FILLED first, at low alpha, and the stains go on top of
     * that. It is the one place in either of these lands where a filled
     * polygon is allowed, and it is allowed because it is a silhouette
     * and not a colour. */
    fillPoly(ctx, body, ROCK_PALE, R.mass);
    stain(ctx, 160, 180, 150, 96, ROCK, R.body * 1.5);
    stain(ctx, 160, 260, 140, 44, ROCK, R.body * 1.3);
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(body[0][0], body[0][1]);
    for (let i = 1; i < body.length; i++) ctx.lineTo(body[i][0], body[i][1]);
    ctx.closePath();
    ctx.clip();
    beds(ctx, r, 12, topY, 296, 300 - topY,
      (reg === 0 ? 5 : 8) + Math.floor(r() * 4), reg, { fractures: reg === 0 ? 1 : 2 });
    // THE SHADED FACE: a third of the block, on one hand, hatched down
    const sx = highRight ? 22 : 200;
    hatch(ctx, sx, topY + 20, 84, 262 - topY, 0.02, 4.6, r,
      { alpha: R.a * 0.2, width: R.w * 0.4, color: R.color, passes: 1 });
    hatch(ctx, sx, topY + 20, 84, 262 - topY, 0.7, 7.5, r,
      { alpha: R.a * 0.1, width: R.w * 0.35, color: R.color, passes: 1 });
    ctx.restore();
    // the silhouette: the top is the drawing, so it gets the pressure
    stroke(ctx, top, r, { width: R.w * 1.15, alpha: R.a, color: R.color });
    stroke(ctx, left, r, { width: R.w * 0.95, alpha: R.a * 0.94, color: R.color });
    stroke(ctx, right, r, { width: R.w * 0.95, alpha: R.a * 0.94, color: R.color });
    /* and the block that came off, lying at the foot on the shaded side.
     * ANGULAR: round 3 drew it with five points and a wobble and it came
     * out an egg. A piece of split rock has corners, and the give-away
     * is a flat top face and a hard vertical edge under it. */
    const bx = highRight ? 66 : 244;
    const bw = 22 + r() * 14;
    const bh = 26 + r() * 16;
    fillPoly(ctx, [[bx - bw, 284], [bx - bw + 4, 284 - bh], [bx + bw - 6, 284 - bh - 6],
      [bx + bw, 284]], ROCK, R.body * 1.4);
    poly(ctx, [[bx - bw, 284], [bx - bw + 4, 284 - bh], [bx + bw - 6, 284 - bh - 6],
      [bx + bw, 284]], r,
      { width: R.w * 0.8, alpha: R.a * 0.82, color: R.color, passes: 1 });
    line(ctx, bx - bw + 4, 284 - bh, bx + bw - 6, 284 - bh - 6, r,
      { width: R.w * 0.55, alpha: R.a * 0.5, color: R.color, passes: 1 }, 2);
    // a fin has no line across its foot: it comes out of the ground
  });
}

/** A FALLEN SLAB. It came off a wall, so it is bedded the same way and
 *  it is lying on its side — which means the beds run at an angle and
 *  the fractures run with them. The only rock in the land that is not
 *  vertical, which is exactly why it reads as an event. */
export function fallenSlabTexture(seed: number, reg: Reg = 1): THREE.CanvasTexture {
  return makeTexture(320, 160, seed, (ctx, r) => {
    const R = REG[reg];
    /* ROUND 1 DREW A POTATO. A slab is not a boulder: it came off a wall
     * along two bedding planes, so it is FLAT, it has corners, and what
     * you see from a walker's eye is a thick edge with a foreshortened
     * top face over it. Two shapes, not one. */
    const tilt = (r() - 0.5) * 0.2;
    /* ROUND 1 OF THE WORLD SHEET READ THESE AS LILY PADS, because the
     * top face was as tall on the canvas as the edge was and a standee
     * is a VERTICAL quad: a big pale top face seen edge-on is a plate.
     * A slab on the ground, from a standing eye, is nearly all EDGE
     * with a sliver of top over it. */
    const topBack: [number, number][] = [
      [58 + r() * 16, 44 + r() * 8], [150, 30 + r() * 8],
      [252, 38 + r() * 8], [292, 56 + r() * 8],
    ];
    const topFront: [number, number][] = [
      [58 + r() * 16, 44 + r() * 8], [126, 58 + r() * 6],
      [230, 62 + r() * 6], [292, 56 + r() * 8],
    ];
    const edgeDrop = 46 + r() * 20;
    const front: [number, number][] = topFront.map(([x, y]) => [x, y + edgeDrop]);
    stain(ctx, 172, 96, 132, 48, ROCK, R.body * 0.9);
    // the top face, seen at a shallow angle: pale, and almost featureless
    fillPoly(ctx, [...topBack, ...[...topFront].reverse()], ROCK_PALE, 0.16);
    // the edge, which is the thick part and the only part with beds in it
    fillPoly(ctx, [...topFront, ...[...front].reverse()], ROCK, 0.18);
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(topFront[0][0], topFront[0][1]);
    for (const p2 of topFront.slice(1)) ctx.lineTo(p2[0], p2[1]);
    for (const p2 of [...front].reverse()) ctx.lineTo(p2[0], p2[1]);
    ctx.closePath();
    ctx.clip();
    ctx.translate(172, 110);
    ctx.rotate(tilt);
    beds(ctx, r, -160, -34, 320, 76, 3, reg, { fractures: 2, shade: 0.5 });
    ctx.restore();
    stroke(ctx, topBack, r, { width: R.w * 0.8, alpha: R.a * 0.8, color: R.color });
    stroke(ctx, topFront, r, { width: R.w, alpha: R.a, color: R.color });
    stroke(ctx, front, r, { width: R.w * 0.9, alpha: R.a * 0.9, color: R.color });
    stroke(ctx, [topFront[0], front[0]], r,
      { width: R.w * 0.8, alpha: R.a * 0.8, color: R.color });
    stroke(ctx, [topFront[3], front[3]], r,
      { width: R.w * 0.8, alpha: R.a * 0.8, color: R.color });
    // it is not sitting flat: gravel heaped against one corner
    for (let i = 0; i < 9; i++) {
      const x = 56 + r() * 240;
      const y = front[0][1] + 4 + r() * 12;
      line(ctx, x, y, x + 5 + r() * 7, y + 1, r,
        { width: R.w * 0.4, alpha: R.a * 0.3, color: R.color, passes: 1 }, 2);
    }
  });
}

/**
 * A PANEL OF WALL, for standing against the terrain's own cliff.
 *
 * The height field draws the canyon's walls in hatching down their fall
 * line, which is what makes them a cliff; this is what makes them a
 * cliff somebody DREW. Panels stand at the wall's foot in runs, with
 * their ends erased so a run reads as one face.
 */
export function wallPanelTexture(seed: number, reg: Reg = 1): THREE.CanvasTexture {
  return makeTexture(256, 448, seed, (ctx, r) => {
    const R = REG[reg];
    /* ROUND 2's PANEL WAS A PALE SHEET WITH TWO RULED LINES ON IT, and
     * the fault was the body: one radial stain on a tall canvas is an
     * oval, so the wall had a dark stripe down the middle of it and
     * nothing anywhere else. A rock face is HORIZONTAL. Its tone goes on
     * in wide flat bands, its beds are many and close, and the bottom of
     * it is the darkest paper in the world because there are ten units
     * of page standing over it. */
    /* AND THE BODY IS HALF WHAT IT WAS. Round 1 of the WORLD sheet had
     * these lying on the cliff as decals at full strength and they read
     * as three soft dark smudges on the wall — a stain is a stain at
     * any angle, and on a sixty-degree face it has no edge to explain
     * it. What a drawn cliff needs from a panel is LINE, not tone: the
     * height field is already carrying the tone. */
    for (let i = 0; i < 5; i++) {
      const y = 60 + i * 88;
      stain(ctx, 128, y, 190, 40 + r() * 16, ROCK, R.body * (0.3 + i * 0.11));
    }
    beds(ctx, r, -10, 24 + r() * 24, 276, 424, 17 + Math.floor(r() * 7), reg,
      { fractures: 2 });
    // the shaded half — the light comes down one wall of a canyon and
    // not the other, and a run of panels all agree about which
    hatch(ctx, 138, 70, 118, 356, 0.02, 5, r,
      { alpha: R.a * 0.18, width: R.w * 0.4, color: R.color, passes: 1 });
    // the brow: broken, and it drops away at one end
    const brow: [number, number][] = [];
    const tilt = (r() - 0.5) * 44;
    for (let i = 0; i <= 7; i++) {
      brow.push([i * 36.5, 30 + (i / 7) * tilt + Math.sin(i * 2.1 + seed) * 12 + (r() - 0.5) * 9]);
    }
    stroke(ctx, brow, r, { width: R.w * 1.1, alpha: R.a, color: R.color });
    // one big block sitting proud of the face, because a wall this size
    // always has one thing about to happen on it
    const bx = 34 + r() * 130;
    const by = 130 + r() * 170;
    const blk: [number, number][] = [[bx, by + 4], [bx + 44 + r() * 28, by - 12],
      [bx + 52, by + 46], [bx - 4, by + 62]];
    fillPoly(ctx, blk, ROCK, R.body);
    poly(ctx, blk, r, { width: R.w * 0.95, alpha: R.a * 0.8, color: R.color, passes: 1 });
    hatch(ctx, bx + 24, by + 6, 30, 48, 0.03, 4.4, r,
      { alpha: R.a * 0.2, width: R.w * 0.35, color: R.color, passes: 1 });
    // and the talus at its foot: a slope of small stuff, not a scatter
    for (let i = 0; i < 30; i++) {
      const t = r();
      const x = t * 256;
      const y = 428 - Math.abs(t - 0.5) * 50 + r() * 22;
      line(ctx, x, y, x + 5 + r() * 8, y + 1 + (r() - 0.5) * 3, r,
        { width: R.w * 0.5, alpha: R.a * 0.36, color: R.color, passes: 1 }, 2);
    }
    eraseEnds(ctx, 256, 448, 52, 64);
  });
}

/**
 * THE MARKS — the one drawing in this project that carries a whole
 * fable, and it carries it in the SPACING and nowhere else.
 *
 * `THE-WAITS` §4: the marks are not flood records, *they are a list, in
 * the order things would float*, and Holt keeps the boat oiled at the
 * bottom of it. So: two marks low down and close together — the boat,
 * and the trestles it sits on — then a long blank stretch of wall, then
 * three near the top, which are the shed, the doorstep and the house
 * standing on the rim directly above. **The gap is the whole thing.**
 * There is no label, no number, no scale and no note explaining it; the
 * only help the game gives is that the topmost mark is level with a
 * doorstep you can see.
 *
 * They are drawn in CHALK, at three passes with almost no jitter,
 * because a man with a straight-edge is the only careful thing in this
 * land and the marks have to look measured against a wall that does not.
 */
export function markWallTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(224, 448, seed, (ctx, r) => {
    const R = REG[1];
    /* FOUR ROUNDS WENT INTO THIS ONE DRAWING. The fourth fault was
     * WEIGHT: drawn at the near register and eight units wide it became
     * the biggest, blackest thing in the frame and the boat — which is
     * the land's whole subject — was a thumbnail behind it. A record
     * scratched on a wall is not a monument. So it is drawn at the
     * middle register, it is four and a half units wide, and it reads
     * as a stripe of chalked rock rather than as a standing stone.
     *
     * The third fault was the shape: a rectangle standing at the foot
     * of a cliff is a door.
     * What it actually is — and what the land's own vocabulary says it
     * should be — is a SLAB THAT CAME AWAY: a piece of the wall standing
     * where it fell, tapering, stepped down one side, broken across the
     * top. Once it has that silhouette it stops being a panel leaning on
     * the canyon and starts being part of it, and the chalk goes up it
     * the way chalk goes up anything a man can reach.
     *
     * The first fault was that the wall was too pale for chalk to read
     * on (CHALK is two shades off PAPER by design, so a pale mark on a
     * pale wall is nothing at all). The second was four hard edges. This
     * is the one panel in the canyon stained to full strength and it is
     * the only one with a shape. */
    const slab: [number, number][] = [
      [44, 446], [36, 300], [44, 180], [40, 96], [50, 22],
      [92, 8], [124, 26], [148, 12], [178, 32],
      [184, 130], [190, 240], [180, 340], [186, 446],
    ];
    fillPoly(ctx, slab, ROCK, 0.24);
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(slab[0][0], slab[0][1]);
    for (let i = 1; i < slab.length; i++) ctx.lineTo(slab[i][0], slab[i][1]);
    ctx.closePath();
    ctx.clip();
    stain(ctx, 112, 250, 140, 250, ROCK, 0.3);
    stain(ctx, 112, 412, 130, 110, ROCK, 0.3);
    beds(ctx, r, 6, 8, 212, 440, 12, 1, { fractures: 1 });
    // the shaded side, so it stands away from the wall behind it
    hatch(ctx, 128, 40, 60, 400, 0.02, 5.5, r,
      { alpha: 0.11, width: 1.2, color: INK, passes: 1 });
    ctx.restore();
    // the two long edges and the broken top; no line across its foot,
    // because it comes out of the ground
    stroke(ctx, slab.slice(0, 5), r, { width: 1.8, alpha: 0.42, color: INK, passes: 1 });
    stroke(ctx, slab.slice(4, 9), r, { width: 2.0, alpha: 0.5, color: INK, passes: 1 });
    stroke(ctx, slab.slice(8), r, { width: 1.8, alpha: 0.42, color: INK, passes: 1 });

    /* THE FIVE, and their heights are the fable — and they are heights
     * in the WORLD, not positions on a canvas. The slab ships at 15.26
     * units tall standing on a floor at −10.14, which puts:
     *
     *   canvas 428 → y = −9.46   the boat, floating in half a metre
     *   canvas 398 → y = −8.44   the trestle rail it is sitting on
     *          · · · thirteen units of blank rock · · ·
     *   canvas  46 → y =  3.55   the shed
     *   canvas  24 → y =  4.30   THE DOORSTEP, and the ground HOLT's
     *                            house stands on is 4.24
     *   canvas  10 → y =  4.78   the house
     *
     * Two low and close together, three at the very top, and thirteen
     * units of nothing in between. **The gap is the whole thing.**
     * Nothing points at it, nothing counts them, and the only help the
     * game gives is that from the channel floor you can see the fourth
     * mark and the doorstep it is level with in the same frame. */
    const mark = (y: number, x0: number, x1: number) => {
      line(ctx, x0, y + 2.6, x1, y + 2.6, r,
        { width: 3.6, alpha: 0.3, color: INK, jitter: 0.5, passes: 1 }, 3);
      line(ctx, x0, y, x1, y + (r() - 0.5) * 1.2, r,
        { width: 3.2, alpha: 1, color: CHALK, jitter: 0.35, passes: 3 }, 3);
    };
    mark(428, 56, 168);
    mark(398, 60, 160);
    mark(46, 58, 156);
    mark(24, 54, 166);
    mark(10, 66, 148);
    /* and the tick beside the bottom pair: a man who takes a measurement
     * twice leaves the second one showing */
    line(ctx, 146, 392, 146, 432, r,
      { width: 2.4, alpha: 0.85, color: CHALK, jitter: 0.4, passes: 2 }, 3);
  });
}

/** THE NEEDLE — a hole worn through a standing fin. You can walk under
 *  it, which is the whole of why it is here. */
export function needleArchTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(384, 288, seed, (ctx, r) => {
    const R = REG[0];
    /* ROUND 2 STILL DREW A HORSESHOE, because the outer silhouette was a
     * DOME. An arch in a canyon is not a dome with a hole in it — it is a
     * squared-off block of wall that the weather has worked a slot
     * through, so the top is FLAT, the two legs are unequal, and the
     * thing you notice is the LINTEL: a great deal of rock standing on
     * very little. */
    const outer: [number, number][] = [
      [22, 286], [26, 150], [40, 74], [96, 40], [188, 30],
      [286, 38], [330, 82], [342, 168], [356, 286],
    ];
    for (let i = 0; i < 3; i++) {
      stain(ctx, 186, 80 + i * 78, 168, 46, ROCK, 0.2 + i * 0.08);
    }
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(outer[0][0], outer[0][1]);
    for (let i = 1; i < outer.length; i++) ctx.lineTo(outer[i][0], outer[i][1]);
    ctx.closePath();
    ctx.clip();
    beds(ctx, r, 12, 26, 360, 268, 11, 0, { fractures: 2 });
    hatch(ctx, 240, 60, 110, 220, 0.02, 5, r,
      { alpha: 0.16, width: 1.4, color: INK, passes: 1 });
    ctx.restore();
    stroke(ctx, outer, r, { width: R.w, alpha: R.a, color: INK });
    /* THE SLOT: low, off-centre, taller than it is wide, and squared at
     * the top — weather works UP a fracture, so the hole is the shape of
     * the fracture and not the shape of a bubble. */
    const hole: [number, number][] = [
      [116, 286], [110, 210], [120, 158], [148, 128], [186, 122],
      [214, 146], [220, 200], [214, 286],
    ];
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.moveTo(hole[0][0], hole[0][1]);
    for (let i = 1; i < hole.length; i++) ctx.lineTo(hole[i][0], hole[i][1]);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    stroke(ctx, hole, r, { width: R.w * 0.95, alpha: R.a, color: INK });
    // the inside of the slot is SMOOTH: two strokes following it just
    // inside, and no beds at all
    stroke(ctx, hole.slice(1, 7).map(([x, y]) => [165 + (x - 165) * 0.82, 200 + (y - 200) * 0.88] as [number, number]),
      r, { width: R.w * 0.4, alpha: 0.24, color: INK, passes: 1 });
    // the thin leg, and it is thin — this is the one that will go
    stroke(ctx, [[240, 286], [246, 220], [240, 176]], r,
      { width: R.w * 0.7, alpha: R.a * 0.7, color: INK, passes: 1 });
  });
}

/**
 * THE BOAT, and there are two of her.
 *
 * `over` is upside down on trestles, which is how a boat is kept: hull
 * up, out of the weather, and oiled. `up` is right way up on dry stone,
 * which is what happens once, permanently, when somebody comes up the
 * canyon holding `route:the-river`.
 *
 * The difference has to read at forty units, so it is a SILHOUETTE
 * difference and not a detail one: hull-up is a smooth curve with
 * nothing inside it, hull-down is a rim with thwarts across it and a
 * dark inside. And the oil is the only warm colour in the land.
 */
export function boatTexture(seed: number, over: boolean): THREE.CanvasTexture {
  return makeTexture(288, 152, seed, (ctx, r) => {
    const R = REG[0];
    if (over) {
      // UPSIDE DOWN: a smooth curve with a keel along the top of it and
      // NOTHING inside it. That emptiness is the silhouette, and at
      // forty units it is the whole read.
      const hull: [number, number][] = [
        [16, 116], [44, 78], [104, 58], [180, 56], [240, 72], [270, 112],
      ];
      stain(ctx, 144, 94, 128, 34, OILED, 0.42);
      fillPoly(ctx, [...hull, [270, 124], [16, 126]], OILED, 0.26);
      stroke(ctx, hull, r, { width: R.w, alpha: R.a, color: INK });
      stroke(ctx, [[16, 116], [70, 124], [190, 126], [270, 112]], r,
        { width: R.w * 0.95, alpha: R.a * 0.9, color: INK });
      // the keel, on top, and it is the mark that says upside down
      stroke(ctx, hull.map(([x, y]) => [x, y - 4] as [number, number]), r,
        { width: R.w * 0.75, alpha: R.a * 0.66, color: INK });
      for (let i = 1; i <= 3; i++) {
        stroke(ctx, hull.map(([x, y]) => [x, y + i * 13] as [number, number]), r,
          { width: R.w * 0.36, alpha: R.a * 0.24, color: INK, passes: 1 });
      }
      // the shine where the rag has been, along the turn of the bilge
      hatch(ctx, 88, 62, 104, 20, 0.05, 5, r,
        { alpha: 0.16, width: 1.3, color: CHALK, passes: 1 });
    } else {
      /* RIGHT WAY UP, ON DRY STONE. The difference has to read at forty
       * units, so it is a SILHOUETTE difference: a hull-up boat is a
       * closed curve, and a hull-down boat is a RIM with a dark hollow
       * under it and three thwarts across the hollow. The thwarts are
       * what the eye reads, so they are drawn heavy and they are drawn
       * last. */
      const rim: [number, number][] = [
        [12, 74], [52, 54], [128, 44], [208, 46], [258, 58], [278, 76],
      ];
      const bot: [number, number][] = [
        [12, 74], [50, 116], [126, 134], [206, 132], [256, 106], [278, 76],
      ];
      stain(ctx, 146, 96, 130, 40, OILED, 0.4);
      fillPoly(ctx, [...rim, ...[...bot].reverse()], OILED, 0.24);
      // the hollow: the inside of a boat is the darkest shape in it
      const inner: [number, number][] = [
        [26, 76], [60, 62], [128, 54], [204, 56], [248, 66], [266, 78],
        [230, 92], [128, 100], [50, 90],
      ];
      fillPoly(ctx, inner, INK, 0.2);
      stroke(ctx, bot, r, { width: R.w, alpha: R.a, color: INK });
      stroke(ctx, rim, r, { width: R.w * 1.1, alpha: R.a, color: INK });
      stroke(ctx, [[26, 78], [128, 96], [266, 80]], r,
        { width: R.w * 0.6, alpha: R.a * 0.5, color: INK, passes: 1 });
      // THE THWARTS
      for (const tx of [86, 148, 210]) {
        const dy = (tx - 148) * 0.03;
        line(ctx, tx - 30, 72 + dy, tx + 30, 68 - dy, r,
          { width: R.w * 0.9, alpha: R.a * 0.86, color: INK }, 3);
      }
      // an oar, shipped, lying along her, and he has not taken it out
      line(ctx, 40, 92, 250, 70, r, { width: R.w * 0.65, alpha: R.a * 0.62, color: INK }, 6);
      poly(ctx, [[38, 86], [24, 90], [26, 100], [42, 97]], r,
        { width: R.w * 0.5, alpha: R.a * 0.5, color: INK, passes: 1 });
    }
  });
}

/** THE TRESTLES — drawn EMPTY, because they are the half of the change
 *  that makes it a question. Four legs, a top rail, and a hollow across
 *  the middle of them the shape of a hull that is not there. */
export function trestleTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(176, 120, seed, (ctx, r) => {
    const R = REG[0];
    /* DRAWN EMPTY, because the empty half is what makes the change a
     * question rather than an announcement. Two A-frames, a rail, and
     * two V-NOTCHES cut down into the top of the rail the shape of a
     * hull that is not in them — round 1 drew the notches as loops
     * standing above the rail and they read as handles. */
    for (const cx of [46, 130]) {
      line(ctx, cx - 24, 116, cx - 2, 30, r,
        { width: R.w * 0.85, alpha: R.a * 0.92, color: INK });
      line(ctx, cx + 24, 116, cx + 2, 30, r,
        { width: R.w * 0.85, alpha: R.a * 0.92, color: INK });
      // the cross-brace, and it is pegged rather than nailed
      line(ctx, cx - 15, 82, cx + 15, 80, r,
        { width: R.w * 0.55, alpha: R.a * 0.66, color: INK, passes: 1 }, 2);
      // the feet, splayed onto stone
      line(ctx, cx - 30, 117, cx - 18, 117, r,
        { width: R.w * 0.6, alpha: R.a * 0.6, color: INK, passes: 1 }, 2);
      line(ctx, cx + 18, 117, cx + 30, 117, r,
        { width: R.w * 0.6, alpha: R.a * 0.6, color: INK, passes: 1 }, 2);
    }
    // the rail, and it sags a little in the middle after all these years
    stroke(ctx, [[22, 30], [88, 34], [154, 29]], r,
      { width: R.w * 0.95, alpha: R.a * 0.94, color: INK });
    // THE NOTCHES: cut DOWN into the rail, not standing on it
    for (const cx of [60, 118]) {
      stroke(ctx, [[cx - 12, 31], [cx - 3, 42], [cx + 3, 42], [cx + 12, 30]], r,
        { width: R.w * 0.6, alpha: R.a * 0.78, color: INK, passes: 1 });
    }
    // and the rag over one end of the rail, which is where he leaves it
    stroke(ctx, [[146, 30], [156, 44], [150, 58], [142, 46], [146, 30]], r,
      { width: R.w * 0.5, alpha: R.a * 0.5, color: INK, passes: 1 });
  });
}

/**
 * HOLT. Two drawings and no face, and the difference between them is a
 * job of work rather than a mood.
 *
 * `working` is bent to the hull with a rag: shoulders round, one arm
 * long. `standing` is upright with the rag in one hand, looking down the
 * channel — which is the way the water would come, and the game does not
 * say that either.
 */
export function holtTexture(seed: number, working: boolean): THREE.CanvasTexture {
  return makeTexture(128, 192, seed, (ctx, r) => {
    const cx = 64;
    /* TWO ROUNDS ON THIS ONE TOO, and the fault was PROPORTION rather
     * than detail. A figure in this game reads because it is a COAT:
     * Brack is forty per cent coat and twenty-eight per cent leg, with a
     * small head on top, and a stick man is what you get at any other
     * ratio however many creases you draw on him. So: head r=9 at the
     * top, coat from 56 to 138 (forty-three per cent), legs 138 to 186,
     * and the coat is the widest and darkest shape in the drawing. */
    const coatBody = (pts: [number, number][], hatchAt: [number, number, number, number]) => {
      fillPoly(ctx, pts, ROCK, 0.38);
      poly(ctx, pts, r, { width: 2.4, alpha: 0.9, color: INK });
      hatch(ctx, hatchAt[0], hatchAt[1], hatchAt[2], hatchAt[3], 0.05, 5.5, r,
        { alpha: 0.13, color: INK, width: 1.1, passes: 1 });
    };
    if (working) {
      /* ROUND 3 TRIED TO DRAW HIM BENT OVER AND IT DID NOT READ, and the
       * reason is a rule this project already knew and had only ever
       * applied to Brack: **the difference between two poses has to be a
       * difference in SILHOUETTE**, and a bent back on a two-by-three
       * cutout at thirty units is four pixels of slope. An ARM is not.
       * So both drawings stand upright and the working one has his arm
       * out at shoulder height with the rag on the end of it — which
       * changes the outline by a third of its width and reads from the
       * far end of the channel. */
      scribbleCircle(ctx, cx - 4, 40, 9, r, { width: 2.0, alpha: 0.82, color: INK }, 1.05);
      stroke(ctx, [[cx - 26, 34], [cx - 12, 28], [cx + 4, 28], [cx + 18, 35]], r,
        { width: 2.6, alpha: 0.88, color: INK });
      poly(ctx, [[cx - 15, 30], [cx - 13, 16], [cx + 5, 16], [cx + 7, 30]], r,
        { width: 2.0, alpha: 0.82, color: INK });
      // the shoulder line tips toward the work: one end is lower
      stroke(ctx, [[cx - 21, 58], [cx - 2, 53], [cx + 17, 50]], r,
        { width: 2.8, alpha: 0.92, color: INK });
      coatBody([[cx - 21, 58], [cx - 25, 104], [cx - 27, 138],
        [cx + 23, 138], [cx + 21, 100], [cx + 17, 50]],
        [cx - 27, 68, 18, 68]);
      // THE ARM, straight out and slightly down, and the rag on the end
      // of it. It is the whole difference and it is drawn heaviest.
      stroke(ctx, [[cx + 16, 56], [cx + 34, 62], [cx + 50, 72]], r,
        { width: 2.6, alpha: 0.9, color: INK });
      stroke(ctx, [[cx + 44, 68], [cx + 58, 74], [cx + 55, 88], [cx + 42, 81]], r,
        { width: 1.6, alpha: 0.66, color: INK, passes: 1 });
      // and he is leaning into it: the weight is on the near foot
      line(ctx, cx - 12, 138, cx - 18, 186, r, { width: 2.6, alpha: 0.9, color: INK });
      line(ctx, cx + 8, 138, cx + 14, 184, r, { width: 2.6, alpha: 0.9, color: INK });
      line(ctx, cx - 26, 187, cx - 12, 187, r,
        { width: 2.8, alpha: 0.84, color: INK, passes: 1 }, 2);
      line(ctx, cx + 8, 185, cx + 22, 185, r,
        { width: 2.8, alpha: 0.84, color: INK, passes: 1 }, 2);
    } else {
      /* UPRIGHT, looking down the channel — which is the way the water
       * would come, and the game does not say that either. */
      scribbleCircle(ctx, cx, 40, 9, r, { width: 2.0, alpha: 0.82, color: INK }, 1.05);
      // the hat: a bar across, and a low crown, and the bar is what says
      // hat at forty units
      stroke(ctx, [[cx - 22, 34], [cx - 8, 28], [cx + 8, 28], [cx + 22, 35]], r,
        { width: 2.6, alpha: 0.88, color: INK });
      poly(ctx, [[cx - 11, 30], [cx - 9, 16], [cx + 9, 16], [cx + 11, 30]], r,
        { width: 2.0, alpha: 0.82, color: INK });
      stroke(ctx, [[cx - 19, 56], [cx, 52], [cx + 19, 56]], r,
        { width: 2.8, alpha: 0.92, color: INK });
      coatBody([[cx - 19, 56], [cx - 24, 104], [cx - 26, 138],
        [cx + 26, 138], [cx + 24, 104], [cx + 19, 56]],
        [cx - 26, 66, 18, 70]);
      // the arms are inside the silhouette: two creases — and one hand
      // out with the rag still in it, which is the only thing he ever
      // has in his hands
      line(ctx, cx - 16, 62, cx - 20, 112, r,
        { width: 1.5, alpha: 0.42, color: INK, passes: 1 }, 3);
      stroke(ctx, [[cx + 17, 64], [cx + 27, 100], [cx + 24, 120]], r,
        { width: 2.1, alpha: 0.86, color: INK });
      stroke(ctx, [[cx + 17, 118], [cx + 31, 124], [cx + 28, 136], [cx + 15, 129]], r,
        { width: 1.5, alpha: 0.6, color: INK, passes: 1 });
      line(ctx, cx - 10, 138, cx - 13, 186, r, { width: 2.6, alpha: 0.9, color: INK });
      line(ctx, cx + 10, 138, cx + 13, 186, r, { width: 2.6, alpha: 0.9, color: INK });
      line(ctx, cx - 21, 187, cx - 7, 187, r,
        { width: 2.8, alpha: 0.84, color: INK, passes: 1 }, 2);
      line(ctx, cx + 7, 187, cx + 21, 187, r,
        { width: 2.8, alpha: 0.84, color: INK, passes: 1 }, 2);
    }
  });
}

/**
 * HOLT'S PLACE — the shed, the doorstep and the house, in one drawing,
 * standing on the rim above the head of the canyon.
 *
 * It exists so that the top three marks have something to be level with.
 * It is drawn small and light — it is the highest and most bleached
 * thing in the land, and you always see it from below.
 */
export function holtPlaceTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(384, 192, seed, (ctx, r) => {
    const R = REG[1];
    /* ROUND 1 DREW TWO LOAVES OF BREAD, because the roof was a stroke
     * arched over the top of a box. A roof is a TRIANGLE with a ridge
     * line and two eaves that stick out past the wall, and the eaves are
     * what makes a building read as a building at sixty units. */
    const shack = (x: number, w: number, h: number, rise: number, weight: number) => {
      const y = 184;
      const body: [number, number][] = [[x, y], [x, y - h], [x + w, y - h], [x + w, y]];
      fillPoly(ctx, body, BLEACH, 0.44);
      stroke(ctx, [[x, y], [x, y - h]], r, { width: R.w * weight, alpha: 0.82, color: INK });
      stroke(ctx, [[x + w, y], [x + w, y - h]], r, { width: R.w * weight, alpha: 0.82, color: INK });
      stroke(ctx, [[x - 1, y], [x + w + 1, y]], r, { width: R.w * weight, alpha: 0.86, color: INK });
      // the gable, with the eaves proud of the wall on both hands
      const apex: [number, number] = [x + w / 2, y - h - rise];
      fillPoly(ctx, [[x - 7, y - h], apex, [x + w + 7, y - h]], BLEACH, 0.4);
      stroke(ctx, [[x - 9, y - h + 3], apex, [x + w + 9, y - h + 3]], r,
        { width: R.w * weight * 1.1, alpha: 0.86, color: INK });
      stroke(ctx, [[x - 9, y - h + 3], [x + w + 9, y - h + 3]], r,
        { width: R.w * weight * 0.8, alpha: 0.6, color: INK, passes: 1 });
      // boards, vertical, because out here you nail them the short way
      for (let i = 1; i < 6; i++) {
        line(ctx, x + (w * i) / 6, y - 3, x + (w * i) / 6 + (r() - 0.5) * 2, y - h + 3, r,
          { width: 1.0, alpha: 0.22, color: INK, passes: 1 }, 3);
      }
    };
    // the shed, lower, off to one side, and lighter
    shack(24, 88, 46, 20, 0.85);
    // the house
    shack(196, 128, 78, 34, 1.1);
    /* THE DOORSTEP. One slab, drawn heavier than anything else up here,
     * because the top chalk mark on the wall below is level with it and
     * that is the only help the game gives. */
    poly(ctx, [[226, 184], [224, 174], [274, 173], [276, 184]], r,
      { width: 3.0, alpha: 0.9, color: INK });
    fillPoly(ctx, [[226, 184], [224, 174], [274, 173], [276, 184]], ROCK, 0.3);
    // a door, shut, and a window with nothing in it
    poly(ctx, [[236, 173], [236, 128], [264, 127], [264, 173]], r,
      { width: 1.7, alpha: 0.66, color: INK, passes: 1 });
    poly(ctx, [[206, 152], [206, 134], [226, 133], [226, 151]], r,
      { width: 1.4, alpha: 0.5, color: INK, passes: 1 });
    // a chimney with nothing coming out of it
    poly(ctx, [[288, 118], [288, 88], [302, 87], [302, 119]], r,
      { width: 1.6, alpha: 0.6, color: INK, passes: 1 });
    // and a line between the two buildings with nothing hanging on it
    line(ctx, 112, 128, 196, 118, r, { width: 1.0, alpha: 0.3, color: INK, passes: 1 }, 4);
  });
}

/** THE BED — the channel floor's own ground, in three grades. Coarse
 *  against the walls, fine down the middle: the sorting is the only
 *  thing in the canyon that says water was ever here, and it says it
 *  without a drop. */
export function bedGravelDecal(seed: number, grade: 0 | 1 | 2): THREE.CanvasTexture {
  return makeTexture(256, 256, seed, (ctx, r) => {
    /* ROUND 1 DREW BUBBLES. `scribbleCircle` is a circle, and a hundred
     * and fifty circles on a pale ground is soap. A stone in a bed has
     * been ROLLED: it is flat, it lies on its longest side, it lies the
     * same way as the one beside it, and what you actually see of it is
     * a top edge with a dark line under it where it meets the sand. */
    const size = [9.0, 5.0, 2.4][grade];
    const n = [40, 76, 120][grade];
    stain(ctx, 128, 128, 128, 128, GRIT, 0.09 + grade * 0.02);
    for (let i = 0; i < n; i++) {
      const x = r() * 256;
      const y = r() * 256;
      const w = size * (0.7 + r() * 1.1);
      const h = w * (0.34 + r() * 0.22);
      const lie = (r() - 0.5) * 0.34;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(lie);
      // the top edge: one arc, never a closed circle
      stroke(ctx, [[-w, h * 0.5], [-w * 0.5, -h], [w * 0.55, -h * 0.85], [w, h * 0.4]], r,
        { width: 1.0, alpha: 0.2 + r() * 0.22, color: INK, passes: 1 });
      // and the dark under it where it sits in the sand
      line(ctx, -w * 0.8, h * 0.55, w * 0.8, h * 0.5, r,
        { width: 1.3, alpha: 0.14 + r() * 0.14, color: INK, passes: 1 }, 2);
      ctx.restore();
    }
    // the faint sweep of the last water there ever was: horizontals,
    // never diagonals, and they run between the stones and not over them
    for (let i = 0; i < 4; i++) {
      const y = r() * 256;
      line(ctx, -8, y, 264, y + (r() - 0.5) * 12, r,
        { width: 1.6, alpha: 0.06, color: INK, passes: 1 }, 8);
    }
  });
}

/** DRIFTWOOD, on the east bench at the lip's height — thirteen units
 *  over the floor. Nothing in the game mentions it. */
export function driftwoodTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(192, 88, seed, (ctx, r) => {
    const y = 52 + r() * 8;
    /* Heavier than round 1's, which was invisible. Driftwood on a rock
     * bench is the palest thing in the canyon and the only thing in it
     * with a curve, so it has to be drawn with some weight or it is a
     * scratch. */
    const spine: [number, number][] = [[10, y + 2], [58, y - 11 - r() * 6], [118, y - 5], [180, y + 6]];
    fillPoly(ctx, [...spine, [180, y + 15], [118, y + 6], [58, y + 1], [10, y + 11]],
      BLEACH, 0.4);
    stroke(ctx, spine, r, { width: 2.8, alpha: 0.8, color: INK });
    stroke(ctx, [[10, y + 11], [58, y + 1], [118, y + 6], [180, y + 15]], r,
      { width: 2.2, alpha: 0.7, color: INK });
    // a stub of root at one end, which is what says wood and not stone
    stroke(ctx, [[58, y - 9], [42, y - 28], [26, y - 34]], r,
      { width: 2.0, alpha: 0.7, color: INK });
    stroke(ctx, [[62, y - 8], [52, y - 24], [38, y - 22]], r,
      { width: 1.5, alpha: 0.5, color: INK, passes: 1 });
    // the grain, which runs the length of it and splits at the end
    for (let i = 0; i < 5; i++) {
      const off = (i - 2) * 2.4;
      line(ctx, 24 + r() * 16, y + off + 3, 160 + r() * 18, y + off + 8, r,
        { width: 0.9, alpha: 0.26, color: INK, passes: 1 }, 6);
    }
  });
}

/** THE KITE — one bird, high, turning. Four strokes, and it is the only
 *  thing in the strip of sky. */
export function kiteTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(72, 48, seed, (ctx, r) => {
    stroke(ctx, [[6, 22], [22, 12], [36, 18], [50, 11], [66, 22]], r,
      { width: 1.8, alpha: 0.68, color: INK });
    stroke(ctx, [[30, 18], [36, 34], [42, 18]], r,
      { width: 1.4, alpha: 0.5, color: INK, passes: 1 });
  });
}

/* ================================================================== *
 * PART TWO — THE BLEACH FLATS
 *
 * From here every mark lies down. The one exception is the saguaro, and
 * it is an exception on purpose: three of them stand in a row on the
 * pan's outer strand line and they are the only verticals in a hundred
 * and fifty units, which is what makes a dry shoreline visible.
 * ================================================================== */

/** How hard the pen presses, by how far out you are. THE FLATS' whole
 *  ink technique in one function: heat is line weight. */
export function heat(dist: number): { width: number; alpha: number; passes: number } {
  const t = Math.max(0, Math.min(1, dist / 70));
  return { width: 2.4 - t * 1.5, alpha: 0.8 - t * 0.5, passes: t > 0.5 ? 1 : 2 };
}

/** THE PAN's floor: crazed, and the crazing is horizontal because
 *  everything in this land is. */
export function panCrustDecal(seed: number): THREE.CanvasTexture {
  return makeTexture(256, 256, seed, (ctx, r) => {
    stain(ctx, 128, 128, 128, 128, BLEACH, 0.16);
    /* A dried pan cracks into plates, and the plates are wide and flat
     * rather than square, because the mud shrank against a wind that
     * only ever came from one direction. So: long nearly-horizontal
     * splits, and short ones joining them. */
    for (let i = 0; i < 9; i++) {
      const y = 8 + r() * 240;
      const pts: [number, number][] = [];
      for (let s = 0; s <= 6; s++) pts.push([-6 + s * 45, y + (r() - 0.5) * 13]);
      stroke(ctx, pts, r, { width: 1.1, alpha: 0.15 + r() * 0.1, color: INK, passes: 1 });
    }
    for (let i = 0; i < 22; i++) {
      const x = r() * 256;
      const y = r() * 256;
      line(ctx, x, y, x + (r() - 0.5) * 12, y + 12 + r() * 20, r,
        { width: 0.9, alpha: 0.1 + r() * 0.08, color: INK, passes: 1 }, 3);
    }
    // and the pale curl where a plate has lifted at its edge
    for (let i = 0; i < 5; i++) {
      const y = r() * 256;
      line(ctx, r() * 90, y, 130 + r() * 120, y + (r() - 0.5) * 8, r,
        { width: 2.2, alpha: 0.1, color: CHALK, passes: 1 }, 5);
    }
  });
}

/**
 * A STRAND LINE — where a wash stopped, and stopped again, and stopped
 * again.
 *
 * A ridge of pale salt with one fine dark line under it, laid end to end
 * around the pan in three concentric runs. It is the Flats' whole
 * geological argument and it is four strokes: something was here, it
 * went, it left its edge behind, and it did that more than once.
 */
export function strandLineDecal(seed: number): THREE.CanvasTexture {
  return makeTexture(384, 96, seed, (ctx, r) => {
    const y = 48;
    const pts: [number, number][] = [];
    for (let s2 = 0; s2 <= 10; s2++) {
      pts.push([s2 * 38.4, y + Math.sin(s2 * 0.9 + seed) * 6 + (r() - 0.5) * 4]);
    }
    /* ROUND 1 WAS INVISIBLE. A strand line is a RIDGE and a ridge has a
     * lit side and a dark side: pale salt heaped above, a hard dark
     * edge below it where the ground drops back, and the grit caught
     * against the upper side only, because the wind only ever came from
     * one direction. Three marks, and the dark one does the work. */
    fillPoly(ctx, [...pts.map(([x, yy]) => [x, yy - 5] as [number, number]),
      ...[...pts].reverse().map(([x, yy]) => [x, yy + 4] as [number, number])], CHALK, 0.5);
    stroke(ctx, pts.map(([x, yy]) => [x, yy - 4] as [number, number]), r,
      { width: 2.0, alpha: 0.3, color: CHALK, passes: 1 });
    stroke(ctx, pts.map(([x, yy]) => [x, yy + 4] as [number, number]), r,
      { width: 2.0, alpha: 0.46, color: INK, passes: 1 });
    for (let i = 0; i < 30; i++) {
      const t = r();
      const x = t * 384;
      const yy = y + Math.sin(t * 9 + seed) * 6 - 4 - r() * 9;
      line(ctx, x, yy, x + 3 + r() * 6, yy + (r() - 0.5) * 2, r,
        { width: 1.1, alpha: 0.2 + r() * 0.2, color: INK, passes: 1 }, 2);
    }
    eraseEnds(ctx, 384, 96, 54);
  });
}

/** GRIT, sorted. Short horizontal marks on ONE bearing, sparse, and the
 *  bearing is the same everywhere in the land. */
export function flatsGritDecal(seed: number): THREE.CanvasTexture {
  return makeTexture(256, 256, seed, (ctx, r) => {
    // no oval: a wide flat band, twice, so the tile has tone without
    // having a middle
    stain(ctx, 128, 86, 150, 34, GRIT, 0.07);
    stain(ctx, 128, 186, 150, 30, GRIT, 0.06);
    for (let i = 0; i < 58; i++) {
      const x = r() * 256;
      const y = r() * 256;
      const len = 4 + r() * 12;
      line(ctx, x, y, x + len, y + len * 0.16, r,
        { width: 0.9, alpha: 0.1 + r() * 0.16, color: INK, passes: 1 }, 2);
    }
  });
}

/**
 * AMOS'S TRACK — the only line on the ground in a hundred and fifty
 * units, and it has two edges.
 *
 * A path worn by ONE person going both ways is narrow and it is
 * scuffed down the middle and heaped very slightly at the sides, and
 * that is all it is. It is the load-bearing drawing in the land: THE
 * SHOT is a look straight up it.
 */
export function wornTrackDecal(seed: number): THREE.CanvasTexture {
  return makeTexture(256, 192, seed, (ctx, r) => {
    /* ROUND 2 STILL DREW A FURRY SMEAR, and the reason was that the pale
     * stain down the middle was as wide as the track and painted OVER
     * both its edges. A path worn by one person going both ways is TWO
     * DARK LINES with bare ground between them: draw the edges last,
     * heavier than anything else on the ground in this land, and keep
     * the pale middle well inside them. It is THE SHOT's subject — a
     * line going away forty units — so it is the one drawing in the
     * Flats that gets full pressure out in the open. */
    // the scoured middle first, and narrow
    stain(ctx, 128, 96, 15, 100, CHALK, 0.6);
    // a few scuffs, and every one points along the track, because he
    // only ever walks it one way and then the other
    for (let i = 0; i < 12; i++) {
      const x = 128 + (r() - 0.5) * 26;
      const y = r() * 192;
      line(ctx, x, y, x + (r() - 0.5) * 3, y + 8 + r() * 10, r,
        { width: 1.1, alpha: 0.14 + r() * 0.1, color: INK, passes: 1 }, 2);
    }
    for (const side of [-1, 1]) {
      const pts: [number, number][] = [];
      for (let s2 = 0; s2 <= 8; s2++) {
        pts.push([128 + side * (23 + Math.sin(s2 * 1.1 + seed + side) * 4), (s2 * 192) / 8]);
      }
      // the heap outside the edge — grit, pushed the same way for years
      for (let i = 0; i < 20; i++) {
        const t = r();
        const yy = t * 192;
        const x = 128 + side * (26 + Math.sin(t * 8.8 + seed + side) * 4 + r() * 11);
        line(ctx, x, yy, x + 4 + r() * 6, yy + 1, r,
          { width: 1.1, alpha: 0.16 + r() * 0.16, color: INK, passes: 1 }, 2);
      }
      // and the edge itself, drawn LAST and heavy
      stroke(ctx, pts, r, { width: 2.6, alpha: 0.5, color: INK, passes: 1 });
    }
  });
}

/** A SAGUARO. The only vertical in the Flats, and there are three of
 *  them, in a row, on a dry shoreline. Ribs run up it, which is the one
 *  place in this land the pen goes that way. */
export function saguaroTexture(seed: number, arms: number): THREE.CanvasTexture {
  return makeTexture(160, 320, seed, (ctx, r) => {
    const o = { width: 2.2, alpha: 0.74, color: INK } as const;
    const trunk: [number, number][] = [[80, 316], [78, 220], [80, 120], [82, 60]];
    fillPoly(ctx, [[66, 316], [64, 200], [68, 90], [80, 52], [92, 90], [96, 200], [94, 316]],
      GREEN_DEEP, 0.22);
    stroke(ctx, [[66, 316], [64, 200], [68, 90], [80, 52]], r, o);
    stroke(ctx, [[94, 316], [96, 200], [92, 90], [80, 52]], r, o);
    for (let a = 0; a < arms; a++) {
      const side = a % 2 === 0 ? -1 : 1;
      const y = 150 + a * 46 + r() * 20;
      const reach = 34 + r() * 16;
      stroke(ctx, [
        [80 + side * 14, y], [80 + side * reach, y - 6],
        [80 + side * (reach + 6), y - 46 - r() * 26],
      ], r, o);
      stroke(ctx, [
        [80 + side * 14, y + 14], [80 + side * (reach + 12), y + 6],
        [80 + side * (reach + 18), y - 44 - r() * 24],
      ], r, { ...o, width: 1.8, alpha: 0.6 });
    }
    // the ribs
    for (let i = 0; i < 5; i++) {
      const x = 68 + i * 6;
      line(ctx, x, 300, x + 1, 70, r,
        { width: 0.9, alpha: 0.2, color: INK, passes: 1 }, 8);
    }
    void trunk;
  });
}

/** DEAD SCRUB. Three variants, no fill, one pass — and it carries the
 *  land's shimmer, because a very small fast `wind` at a hundred units
 *  reads as heat rather than as movement. */
export function deadScrubTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(128, 96, seed, (ctx, r) => {
    /* ROUND 1 DREW A SPIDER: every stem left the same point on the
     * ground and went up, which is a hairball. Dead scrub out here is
     * WIDE and LOW — it has been flattened by the same wind that sorted
     * everything else, so its stems leave the ground along a foot of it
     * and lean the same way, and the tallest of them is half as tall as
     * the thing is wide. */
    const lean = 0.5 + r() * 0.35;
    const n = 9 + Math.floor(r() * 7);
    for (let i = 0; i < n; i++) {
      const x0 = 30 + r() * 68;
      const len = 20 + r() * 34;
      const a = -Math.PI / 2 + lean * (0.5 + r() * 0.9);
      const mid: [number, number] = [x0 + Math.cos(a) * len * 0.45, 94 + Math.sin(a) * len * 0.5];
      stroke(ctx, [[x0, 94], mid,
        [x0 + Math.cos(a) * len * 1.05 + r() * 8, 94 + Math.sin(a) * len * 0.86]], r,
        { width: 1.3, alpha: 0.3 + r() * 0.24, color: INK, passes: 1 });
      // a side twig on about half of them, going the same way
      if (r() > 0.5) {
        stroke(ctx, [mid, [mid[0] + 8 + r() * 12, mid[1] - 2 - r() * 8]], r,
          { width: 1.0, alpha: 0.26, color: INK, passes: 1 });
      }
    }
    // and the grit heaped in its lee, which is what it is FOR
    for (let i = 0; i < 10; i++) {
      const x = 60 + r() * 60;
      line(ctx, x, 88 + r() * 7, x + 4 + r() * 6, 89 + r() * 7, r,
        { width: 1.0, alpha: 0.14, color: INK, passes: 1 }, 2);
    }
  });
}

/** A PALM. Full pressure, and the only full-pressure green in the land:
 *  the oasis is where the pen presses hardest, because the oasis is
 *  where the water is. */
export function palmTexture(seed: number, lean: number): THREE.CanvasTexture {
  return makeTexture(224, 352, seed, (ctx, r) => {
    const o = { width: 2.6, alpha: 0.84, color: INK } as const;
    const topX = 112 + lean * 40;
    const topY = 96 + r() * 24;
    stroke(ctx, [[104, 350], [108 + lean * 10, 260], [topX - 6, 170], [topX - 2, topY]], r, o);
    stroke(ctx, [[124, 350], [126 + lean * 10, 260], [topX + 8, 170], [topX + 4, topY]], r, o);
    // the trunk's rings, which lie down: the only horizontals on a palm
    for (let i = 0; i < 9; i++) {
      const t = i / 9;
      const x = 114 + (topX - 114) * (1 - t) * 0.9;
      const y = 350 - t * (350 - topY) * 0.92;
      line(ctx, x - 10, y, x + 10, y - 2, r,
        { width: 1.0, alpha: 0.24, color: INK, passes: 1 }, 2);
    }
    const fronds = 7;
    for (let i = 0; i < fronds; i++) {
      const a = Math.PI + (i / (fronds - 1)) * Math.PI;
      const len = 74 + r() * 34;
      const ex = topX + Math.cos(a) * len;
      const ey = topY + Math.sin(a) * len * 0.62 + 26;
      const mid: [number, number] = [topX + Math.cos(a) * len * 0.55, topY + Math.sin(a) * len * 0.4];
      fillPoly(ctx, [[topX, topY], mid, [ex, ey], [topX + 4, topY + 8]], GREEN, 0.26);
      stroke(ctx, [[topX, topY], mid, [ex, ey]], r,
        { width: 2.2, alpha: 0.8, color: INK });
      // the leaflets, and they hang
      for (let k = 1; k < 6; k++) {
        const t = k / 6;
        const px = topX + (ex - topX) * t;
        const py = topY + (ey - topY) * t;
        line(ctx, px, py, px + (r() - 0.5) * 16, py + 12 + r() * 12, r,
          { width: 1.1, alpha: 0.42, color: INK, passes: 1 }, 2);
      }
    }
  });
}

/** THE OASIS' REEDS — a run of uprights at the water's edge, erased at
 *  both ends so a line of them is one thing. */
export function reedRunTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(256, 128, seed, (ctx, r) => {
    for (let i = 0; i < 34; i++) {
      const x = r() * 256;
      const h = 40 + r() * 70;
      const lean = (r() - 0.5) * 16;
      stroke(ctx, [[x, 126], [x + lean * 0.4, 126 - h * 0.6], [x + lean, 126 - h]], r,
        { width: 1.3, alpha: 0.4 + r() * 0.3, color: INK, passes: 1 });
    }
    eraseEnds(ctx, 256, 128, 40);
  });
}

/**
 * THE CISTERN, and there are two of her.
 *
 * Closed: a drum with a lid on it, clean, and there is nothing to see.
 * Open: the lid leaning against the side, and the water in it — the only
 * water drawn as a flat surface anywhere in this game outside a pond.
 *
 * `THE-WAITS` §5: *the lid comes off, and stays off. He has decided to
 * find out.* The game does not say whether that is despair or nerve, and
 * the drawing does not either: it is a lid, on the ground, leaning.
 */
export function cisternTexture(seed: number, open: boolean): THREE.CanvasTexture {
  return makeTexture(240, 200, seed, (ctx, r) => {
    const o = { width: 2.4, alpha: 0.86, color: INK } as const;
    const body: [number, number][] = [[52, 190], [48, 80], [164, 78], [160, 190]];
    fillPoly(ctx, body, TIN, 0.3);
    stroke(ctx, [[52, 190], [48, 80]], r, o);
    stroke(ctx, [[164, 78], [160, 190]], r, o);
    stroke(ctx, [[52, 190], [106, 195], [160, 190]], r, o);
    // hoops. A drum in good order has all of them, and they are the one
    // set of evenly spaced marks in a land where nothing else is even
    for (const y of [106, 142, 174]) {
      stroke(ctx, [[50, y], [106, y + 4], [162, y - 1]], r,
        { width: 1.7, alpha: 0.54, color: INK, passes: 1 });
    }
    // the rim, an ellipse seen slightly from above
    stroke(ctx, [[48, 80], [106, 66], [164, 78], [106, 92], [48, 80]], r, o);
    if (!open) {
      // the lid, ON: proud of the rim, with a lip round it and a handle
      fillPoly(ctx, [[52, 76], [106, 62], [160, 74], [106, 87]], BLEACH, 0.5);
      stroke(ctx, [[52, 76], [106, 62], [160, 74], [106, 87], [52, 76]], r,
        { width: 2.1, alpha: 0.82, color: INK });
      stroke(ctx, [[96, 66], [106, 55], [116, 65]], r,
        { width: 2.2, alpha: 0.8, color: INK });
    } else {
      // the water: flat, still, full to within a hand of the rim, and it
      // is the only water drawn as a surface anywhere but a pond
      fillPoly(ctx, [[54, 80], [106, 70], [158, 79], [106, 90]], WASH.seaShallow, 0.55);
      stroke(ctx, [[62, 81], [106, 75], [152, 80]], r,
        { width: 1.3, alpha: 0.34, color: INK, passes: 1 });
      stroke(ctx, [[74, 85], [106, 81], [140, 85]], r,
        { width: 1.1, alpha: 0.22, color: INK, passes: 1 });
      /* THE LID, OFF. Round 1 drew it as a curved sliver and it read as
       * a spoon. A lid leaning against a drum is a DISC seen nearly
       * edge-on: an ellipse on its side, its bottom edge on the ground
       * and its top edge touching the drum, with the handle still on it.
       * It is the whole permanent change of a wait, so it has to read. */
      const cx = 196;
      const disc: [number, number][] = [
        [cx - 26, 188], [cx - 34, 132], [cx - 18, 104], [cx + 6, 100],
        [cx + 20, 128], [cx + 16, 182],
      ];
      fillPoly(ctx, disc, BLEACH, 0.5);
      poly(ctx, disc, r, { width: 2.2, alpha: 0.84, color: INK });
      // the rim of the lid on the near side, and its handle
      stroke(ctx, [[cx - 22, 178], [cx - 28, 130], [cx - 14, 108]], r,
        { width: 1.4, alpha: 0.44, color: INK, passes: 1 });
      stroke(ctx, [[cx - 8, 142], [cx + 2, 134], [cx + 8, 146]], r,
        { width: 2.0, alpha: 0.74, color: INK });
      // and it is resting against the drum, not floating: the shadow
      line(ctx, 158, 190, cx - 22, 189, r,
        { width: 2.6, alpha: 0.28, color: INK, passes: 1 }, 2);
    }
  });
}

/**
 * THE CATCH — guttering on a frame, and a graded fall into the drum.
 *
 * **The only orthogonal drawing in the Bleach Flats.** Everything else
 * in this land is weathered, sorted, bleached or bent; this is square,
 * and it is square because somebody keeps it that way. It is the land's
 * one foreground element and every framing that needs weight puts it in
 * a corner.
 */
export function catchFrameTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(352, 288, seed, (ctx, r) => {
    const o = { width: 2.4, alpha: 0.84, color: INK } as const;
    /* the catchment: a wide shallow tray, tilted, on four legs. It is
     * drawn as two long parallel lines because that is what a gutter is,
     * and they are the straightest lines in either land. */
    fillPoly(ctx, [[16, 74], [326, 44], [330, 66], [20, 96]], TIN, 0.3);
    stroke(ctx, [[16, 74], [326, 44]], r, o);
    stroke(ctx, [[20, 96], [330, 66]], r, o);
    stroke(ctx, [[16, 74], [20, 96]], r, { ...o, width: 1.8 });
    stroke(ctx, [[326, 44], [330, 66]], r, { ...o, width: 1.8 });
    // the ribs across it: evenly spaced, which nothing else here is
    for (let i = 1; i < 9; i++) {
      const t = i / 9;
      line(ctx, 16 + 310 * t, 74 - 30 * t, 20 + 310 * t, 96 - 30 * t, r,
        { width: 1.2, alpha: 0.34, color: INK, passes: 1 }, 2);
    }
    // the legs, braced. A brace is a diagonal and there are exactly four
    for (const [x, y] of [[54, 88], [148, 78], [242, 69], [318, 62]] as [number, number][]) {
      line(ctx, x, y, x + 3, 262, r, { width: 2.2, alpha: 0.8, color: INK });
    }
    for (const [x0, x1] of [[54, 148], [242, 318]] as [number, number][]) {
      line(ctx, x0 + 2, 200, x1 + 2, 150, r,
        { width: 1.6, alpha: 0.6, color: INK, passes: 1 }, 4);
    }
    // THE FALL: a pipe off the low end, graded, into where the drum is
    stroke(ctx, [[18, 92], [10, 150], [16, 206], [44, 244]], r,
      { width: 3.0, alpha: 0.84, color: INK });
    stroke(ctx, [[30, 94], [22, 150], [28, 204], [52, 238]], r,
      { width: 2.0, alpha: 0.5, color: INK, passes: 1 });
    // and the trap at the top of the fall, with nothing in it
    poly(ctx, [[8, 92], [8, 116], [40, 116], [40, 92]], r,
      { width: 1.6, alpha: 0.62, color: INK, passes: 1 });
  });
}

/**
 * AMOS. Two drawings and no face.
 *
 * `walking` carries a yoke with a vessel on each end, and it is the one
 * that matters: after the light goes he is on the track with it, going
 * one way or the other, every night, and nothing in this game will ever
 * tell you to come back after dark and look.
 *
 * The yoke is drawn ACROSS the shoulders and level, and the vessels hang
 * off it low, because a man who has done this every night for years does
 * not carry it badly.
 */
export function amosTexture(seed: number, walking: boolean): THREE.CanvasTexture {
  return makeTexture(144, 184, seed, (ctx, r) => {
    const cx = 72;
    const o = { width: 2.2, alpha: 0.84, color: INK } as const;
    scribbleCircle(ctx, cx, 44, 10, r, { width: 1.9, alpha: 0.8, color: INK }, 1.05);
    // a hat, flat-brimmed, because the sun here is straight down
    stroke(ctx, [[cx - 20, 38], [cx - 6, 31], [cx + 8, 32], [cx + 20, 39]], r,
      { width: 2.0, alpha: 0.82, color: INK });
    stroke(ctx, [[cx - 15, 60], [cx, 56], [cx + 15, 60]], r,
      { width: 2.4, alpha: 0.88, color: INK });
    /* THE COAT IS THE FIGURE. Same lesson as Holt two rounds earlier and
     * as Brack a session before that: forty per cent of the height is
     * coat, it is the widest and darkest shape in the drawing, and the
     * legs are short. Amos's is a work coat with the sleeves off, so it
     * is squarer than Holt's and it hangs straighter — the man is
     * patient and the drawing had better be. */
    const coat: [number, number][] = walking
      ? [[cx - 19, 62], [cx - 22, 106], [cx - 20, 136], [cx + 22, 136], [cx + 23, 104], [cx + 19, 62]]
      : [[cx - 19, 62], [cx - 24, 106], [cx - 25, 138], [cx + 25, 138], [cx + 24, 106], [cx + 19, 62]];
    fillPoly(ctx, coat, BLEACH, 0.44);
    poly(ctx, coat, r, { width: 2.3, alpha: 0.88, color: INK });
    hatch(ctx, coat[0][0], 72, 16, 58, 0.05, 5.5, r,
      { alpha: 0.12, color: INK, width: 1.1, passes: 1 });
    if (walking) {
      // THE YOKE: level, across the shoulders, and longer than he is
      // wide. A man who has carried it every night for years carries it
      // level — the yoke is the straightest line in the Bleach Flats
      // after the guttering, and both of them are his.
      line(ctx, cx - 50, 60, cx + 50, 59, r, { ...o, width: 3.0 });
      for (const side of [-1, 1]) {
        line(ctx, cx + side * 44, 61, cx + side * 46, 100, r,
          { width: 1.3, alpha: 0.55, color: INK, passes: 1 }, 3);
        // the vessel, FULL: a closed shape with a flat top, and it hangs
        // dead still because it is full to the brim
        const vx = cx + side * 46;
        const v: [number, number][] = [[vx - 13, 100], [vx - 15, 132], [vx + 15, 132], [vx + 13, 100]];
        fillPoly(ctx, v, TIN, 0.3);
        poly(ctx, v, r, { width: 2.0, alpha: 0.82, color: INK });
        line(ctx, vx - 13, 105, vx + 13, 105, r,
          { width: 1.1, alpha: 0.34, color: INK, passes: 1 }, 2);
      }
      // mid-stride: one leg forward
      line(ctx, cx - 12, 136, cx - 19, 180, r, { ...o, width: 2.5 });
      line(ctx, cx + 9, 136, cx + 17, 178, r, { ...o, width: 2.5 });
    } else {
      // standing at the catch, one hand up on the frame — which is the
      // pose of a man checking a thing he has already checked
      stroke(ctx, [[cx + 18, 66], [cx + 34, 62], [cx + 40, 44]], r, { ...o, width: 2.4 });
      line(ctx, cx - 16, 66, cx - 19, 106, r,
        { width: 1.4, alpha: 0.4, color: INK, passes: 1 }, 3);
      line(ctx, cx - 10, 138, cx - 13, 180, r, { ...o, width: 2.5 });
      line(ctx, cx + 10, 138, cx + 13, 180, r, { ...o, width: 2.5 });
      line(ctx, cx - 22, 181, cx - 8, 181, r,
        { ...o, width: 2.6, passes: 1 }, 2);
      line(ctx, cx + 8, 181, cx + 22, 181, r,
        { ...o, width: 2.6, passes: 1 }, 2);
    }
  });
}

/** A TUMBLEWEED. Loops at three radii, one pass, no fill — it is mostly
 *  hole, which is why it goes when the wind does. */
export function tumbleweedTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(128, 128, seed, (ctx, r) => {
    for (let i = 0; i < 9; i++) {
      scribbleCircle(ctx, 64 + (r() - 0.5) * 22, 64 + (r() - 0.5) * 22,
        16 + r() * 40, r,
        { width: 1.1, alpha: 0.2 + r() * 0.22, color: INK, passes: 1 }, 0.8 + r() * 0.7);
    }
  });
}

/**
 * SOMEBODY'S LONG WALK — a skull, and one boot, and they are drawn as
 * one pair of textures because they are one joke and it is not funny.
 * They are forty units apart and they point the same way.
 */
export function skullTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(128, 96, seed, (ctx, r) => {
    const o = { width: 2.0, alpha: 0.78, color: INK } as const;
    /* ROUND 1 DREW A FACE, and this game has exactly one rule about
     * faces: the walker has two dots and NOBODY ELSE HAS ONE. Two round
     * sockets side by side over a mouth line is a face however you label
     * it. So the skull is drawn in three-quarter profile with the muzzle
     * running away to one side: one socket, a long jaw, and a horn going
     * over. It is a thing lying on the ground and it does not look back
     * at you. */
    const head: [number, number][] = [
      [18, 62], [26, 38], [46, 26], [72, 28], [92, 40], [104, 60],
      [96, 78], [70, 86], [40, 82], [22, 74],
    ];
    fillPoly(ctx, head, BLEACH, 0.46);
    poly(ctx, head, r, o);
    // the muzzle, running off to the right and DOWN — it is lying down
    stroke(ctx, [[92, 46], [116, 58], [122, 72], [104, 76]], r, o);
    stroke(ctx, [[96, 66], [118, 70]], r,
      { width: 1.3, alpha: 0.44, color: INK, passes: 1 });
    // ONE socket, in profile, and it is an oval on its side
    ctx.save();
    ctx.translate(58, 50);
    ctx.rotate(0.4);
    scribbleCircle(ctx, 0, 0, 9, r, { width: 1.7, alpha: 0.6, color: INK, passes: 1 }, 1.1);
    ctx.restore();
    // the horn, over and back, and the stub of the other one
    stroke(ctx, [[40, 30], [22, 12], [4, 12], [2, 26]], r, { ...o, width: 2.2 });
    stroke(ctx, [[70, 28], [66, 16], [76, 12]], r,
      { width: 1.7, alpha: 0.6, color: INK, passes: 1 });
    // the suture down the top of the skull, which is the mark that says
    // bone and not stone
    line(ctx, 46, 32, 84, 44, r,
      { width: 1.0, alpha: 0.34, color: INK, passes: 1 }, 3);
  });
}

/** One boot. Empty, upright, and pointing the way the skull is. */
export function bootTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(96, 96, seed, (ctx, r) => {
    const o = { width: 2.0, alpha: 0.78, color: INK } as const;
    const b: [number, number][] = [[30, 92], [28, 40], [34, 22], [56, 20], [60, 44], [82, 62], [84, 92]];
    fillPoly(ctx, b, ROCK, 0.26);
    poly(ctx, b, r, o);
    line(ctx, 30, 84, 84, 84, r, { width: 1.6, alpha: 0.5, color: INK, passes: 1 }, 2);
    // laces, still done up
    for (let i = 0; i < 3; i++) {
      line(ctx, 30, 34 + i * 8, 58, 30 + i * 8, r,
        { width: 1.0, alpha: 0.36, color: INK, passes: 1 }, 2);
    }
  });
}

/** THE MILEPOST — the last thing in the Bleach Flats that was put there
 *  by anybody official, and it has been out here a long time. */
export function milepostTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(176, 256, seed, (ctx, r) => {
    const o = { width: 2.6, alpha: 0.86, color: INK } as const;
    /* ROUND 1 DREW TWO ELLIPSES ON A STICK. A fingerpost is a POST with
     * FLAT BOARDS bolted through it: the boards are wide, they are seen
     * nearly edge-on from any direction but one, and the thing that says
     * fingerpost is that they point in two different directions and one
     * of them has dropped. */
    // the post, and it is not straight either
    fillPoly(ctx, [[80, 250], [76, 60], [92, 58], [94, 250]], ROCK, 0.3);
    stroke(ctx, [[80, 250], [76, 150], [77, 60]], r, { ...o, width: 3.4 });
    stroke(ctx, [[94, 250], [92, 150], [91, 58]], r, { ...o, width: 3.0 });
    stroke(ctx, [[74, 58], [84, 50], [94, 57]], r, { ...o, width: 2.4 });
    const board = (y: number, dir: number, len: number, drop: number) => {
      const x0 = dir > 0 ? 92 : 78;
      const x1 = x0 + dir * len;
      const pts: [number, number][] = [
        [x0, y], [x1, y + drop], [x1 + dir * 14, y + drop + 11],
        [x1, y + drop + 22], [x0, y + 22],
      ];
      fillPoly(ctx, pts, BLEACH, 0.5);
      poly(ctx, pts, r, { width: 2.1, alpha: 0.84, color: INK });
      // the writing, which has gone: a run of faint marks and no words
      for (let i = 0; i < 5; i++) {
        const mx = x0 + dir * (12 + i * (len - 18) / 5);
        line(ctx, mx, y + drop * 0.6 + 12, mx + dir * (4 + r() * 4), y + drop * 0.6 + 12, r,
          { width: 1.2, alpha: 0.2, color: INK, passes: 1 }, 2);
      }
      // and the bolt it swings on
      scribbleCircle(ctx, x0 + dir * 6, y + 11, 3, r,
        { width: 1.2, alpha: 0.5, color: INK, passes: 1 }, 1.2);
    };
    board(72, 1, 66, 3);
    // and this one has dropped, and nobody has been out to put it back
    board(116, -1, 60, 14);
    // the grain, and the split down it
    for (let i = 0; i < 3; i++) {
      line(ctx, 80 + i * 4, 244, 79 + i * 4, 66, r,
        { width: 0.9, alpha: 0.18, color: INK, passes: 1 }, 6);
    }
    // the grit heaped at its foot, on the same hand as everywhere else
    for (let i = 0; i < 14; i++) {
      const x = 92 + r() * 34;
      line(ctx, x, 244 + r() * 9, x + 4 + r() * 6, 245 + r() * 9, r,
        { width: 1.0, alpha: 0.16, color: INK, passes: 1 }, 2);
    }
  });
}
