import * as THREE from 'three';
import { makeCanvas, stroke, line, scribbleCircle, rng, type Ctx2D } from './ink';

/**
 * WORKED PAPER (art director Fix 3 · Awwwards juror Fix 1).
 *
 * Both visual gates, blind, named the same defect from opposite sides:
 *
 *   "The largest surface in most frames is the one surface with no ink
 *    in it — and it is lit by a 3D falloff, not by paper. A sketchbook
 *    has no sky."                                          (the juror)
 *
 *   "The paper is one full-screen grain-plus-vignette multiply,
 *    pixel-identical across ten pages that are supposed to be ten
 *    different pages — the tell that all ten are the same quad."
 *                                                    (the art director)
 *
 * Unmarked ground was a flat colour with a little shader speckle, lit by
 * a radial vignette, terminating in a band where the fog saturated. This
 * module is the other thing: a sheet with tooth and fibre, with the
 * ghost of whatever is drawn on its reverse, with the indentation of the
 * sheet that was pressed on top of it while somebody wrote, with foxing,
 * with a gutter crease, and with an EDGE — because the far distance in a
 * sketchbook is never sky. It is the edge of this page, the next page
 * under it, and the desk.
 *
 * Two textures, deliberately:
 *
 *  - the GRAIN tiles (tooth and fibre are everywhere and may repeat), and
 *    it carries three DECORRELATED fields one per channel, sampled at
 *    three scales and three rotations, so neither the tile nor the
 *    sampling can lay a lattice over the page — ch2's hatch taught the
 *    first half of that the hard way and this module taught the second;
 *  - the SHEET map is stretched once over this chapter's page and never
 *    repeats, because foxing that repeats is wallpaper. It carries every
 *    feature the eye can count: the spots, the grooves, the show-through,
 *    the crease, the handling at the edges.
 *
 * Both are DATA, not art: they modulate a colour rather than being one,
 * so they carry no colour space and 0.5 means "leave it alone" (S4's
 * gotcha — a canvas used as data must not be sRGB).
 */

const NEUTRAL = 'rgb(128,128,128)';

function dataTexture(canvas: HTMLCanvasElement, repeat = false): THREE.CanvasTexture {
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.NoColorSpace;
  t.anisotropy = 4;
  t.generateMipmaps = true;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  if (repeat) {
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
  }
  return t;
}

/* ------------------------------------------------------------------ *
 * Tooth and fibre — the tiling half
 * ------------------------------------------------------------------ */

/**
 * Cartridge paper close up: a pulp tooth (speckle correlated along the
 * grain direction, so it reads as fibre and not as television) with
 * longer surface fibres drawn over it by the pen.
 */
export function paperGrainTexture(seed: number): THREE.CanvasTexture {
  const S = 512;
  const { canvas, ctx } = makeCanvas(S, S);
  const r = rng(seed * 7919 + 13);

  /*
   * THREE FIELDS, ONE TILE, PACKED IN RGB — and that packing is the fix,
   * not a saving.
   *
   * The first build sampled ONE grey field at three scales and three
   * rotations. Three rotated copies of the same directional fibre laid
   * over each other is a crosshatch, and the page came out looking like
   * woven canvas — or, worse, like graph paper, in a game whose whole
   * subject is a sketchbook. Decorrelated fields cannot do that, so:
   *
   *   R — mottle: isotropic, slow, the unevenness of the pulp
   *   G — fibre: strongly correlated one way only, the grain direction
   *   B — tooth: nearly isotropic fine speckle, the surface itself
   *
   * All three WRAP. The version before this filtered each row from a
   * cold start, so the left column and the right column had nothing to
   * do with each other and the ground grew a hard line every seven world
   * units — visible rectangles across the page, the exact lattice the
   * art director would have killed us for, introduced by the fix meant
   * to remove one. Every filter below runs twice around its axis,
   * carrying the accumulator across the wrap, which makes it circular.
   */
  const field = (kx: number, ky: number) => {
    const b = new Float32Array(S * S);
    for (let i = 0; i < S * S; i++) b[i] = r() - 0.5;
    for (let y = 0; y < S; y++) {
      let run = 0;
      for (let pass = 0; pass < 2; pass++)
        for (let x = 0; x < S; x++) {
          run = run * kx + b[y * S + x] * (1 - kx);
          if (pass === 1) b[y * S + x] = run;
        }
    }
    for (let x = 0; x < S; x++) {
      let run = 0;
      for (let pass = 0; pass < 2; pass++)
        for (let y = 0; y < S; y++) {
          run = run * ky + b[y * S + x] * (1 - ky);
          if (pass === 1) b[y * S + x] = run;
        }
    }
    // normalise: two cascaded leaky integrators leave an amplitude that
    // depends entirely on their constants, and a tooth nobody can see is
    // a tooth nobody drew
    let sd = 0;
    for (let i = 0; i < S * S; i++) sd += b[i] * b[i];
    sd = Math.sqrt(sd / (S * S)) || 1;
    for (let i = 0; i < S * S; i++) b[i] /= sd;
    return b;
  };

  const mottle = field(0.90, 0.90);
  const fibre = field(0.88, 0.10);
  const tooth = field(0.34, 0.30);

  const img = ctx.createImageData(S, S);
  const d = img.data;
  for (let i = 0; i < S * S; i++) {
    d[i * 4] = Math.max(0, Math.min(255, 128 + mottle[i] * 40));
    d[i * 4 + 1] = Math.max(0, Math.min(255, 128 + fibre[i] * 36));
    d[i * 4 + 2] = Math.max(0, Math.min(255, 128 + tooth[i] * 34));
    d[i * 4 + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);

  // FIBRE PROPER: the few strands that sit proud of the surface and
  // catch the light. Drawn, because they are marks on a page and this
  // game draws its marks — and drawn in GREEN, so they land in the fibre
  // channel and nowhere else. Short: a strand that crosses a whole tile
  // reads as a scratch across the whole page.
  for (let i = 0; i < 220; i++) {
    const x = r() * S, y = r() * S;
    const a = r() * Math.PI * 2;
    const len = 7 + r() * 26;
    const up = r() < 0.5;
    const o = {
      color: up ? 'rgb(128,152,128)' : 'rgb(128,104,128)',
      width: 0.7 + r() * 0.8,
      alpha: 0.16 + r() * 0.18,
      jitter: 1.2,
      passes: 1,
      smudge: false as const,
    };
    const x2 = x + Math.cos(a) * len, y2 = y + Math.sin(a) * len;
    // a strand that runs off one edge comes back on the other, or the
    // tile has a border and the ground grows a grid
    for (const ox of [-S, 0, S]) {
      for (const oy of [-S, 0, S]) {
        if (Math.max(x, x2) + ox < -len || Math.min(x, x2) + ox > S + len) continue;
        if (Math.max(y, y2) + oy < -len || Math.min(y, y2) + oy > S + len) continue;
        line(ctx, x + ox, y + oy, x2 + ox, y2 + oy, rng(1000 + i), o);
      }
    }
  }
  return dataTexture(canvas, true);
}

/* ------------------------------------------------------------------ *
 * The sheet itself — the half that never repeats
 * ------------------------------------------------------------------ */

export type PaperSpec = {
  seed: number;
  /** −1 cold and new, +1 warm and old. Shifts the sheet's own colour. */
  tone: number;
  /** 0 fresh from the pad, 1 carried in a bag for twenty years. */
  wear: number;
  /**
   * Where the gutter crease runs, as a fraction across the sheet
   * (0 west edge, 1 east edge), or null for a loose sheet with none.
   */
  crease: number | null;
  /** How much of somebody else's drawing shows through from the back. */
  showThrough: number;
};

/**
 * Everything on this page that can be counted: foxing, the grooves left
 * by the sheet that was pressed on top of it, the show-through from the
 * reverse, the crease, and the handling that darkens an edge somebody
 * has turned a thousand times.
 */
export function paperSheetTexture(spec: PaperSpec): THREE.CanvasTexture {
  const W = 1024, H = 640;
  const { canvas, ctx } = makeCanvas(W, H);
  const r = rng(spec.seed * 2654435761 + 97);
  ctx.fillStyle = NEUTRAL;
  ctx.fillRect(0, 0, W, H);

  /* ---- the ghost of the reverse ---------------------------------- *
   * Something is drawn on the other side of this sheet. You cannot read
   * it — it is backwards and it is under a sheet of paper — but you can
   * see that it is there, and that is the whole point: this page has a
   * back, so it is a page and not a plane. */
  if (spec.showThrough > 0.01) {
    ctx.save();
    // mirrored, because it is the back
    ctx.translate(W, 0);
    ctx.scale(-1, 1);
    const a = 0.05 * spec.showThrough;
    const lines = 5 + Math.floor(r() * 5);
    for (let i = 0; i < lines; i++) {
      const y = H * (0.12 + r() * 0.76);
      const x0 = W * (0.06 + r() * 0.3);
      const wid = W * (0.2 + r() * 0.44);
      // handwriting-shaped, never handwriting: a run of humps, because
      // anything legible through the back of a page is a different story
      const pts: [number, number][] = [];
      const n = Math.floor(wid / 9);
      for (let k = 0; k <= n; k++) {
        const t = k / n;
        pts.push([
          x0 + wid * t,
          y + Math.sin(t * n * 0.9 + i) * 5.2 + (r() - 0.5) * 3.4,
        ]);
      }
      stroke(ctx, pts, r, {
        color: 'rgb(96,96,96)', width: 2.6, alpha: a, jitter: 1.2, passes: 1, smudge: false,
      });
    }
    // and one thing that is not writing at all
    if (r() < 0.7) {
      scribbleCircle(ctx, W * (0.2 + r() * 0.6), H * (0.2 + r() * 0.6), 40 + r() * 70, r, {
        color: 'rgb(100,100,100)', width: 3, alpha: a * 0.9, passes: 1, smudge: false,
      }, 1.1);
    }
    ctx.restore();
  }

  /* ---- indentation from the sheet pressed on top ------------------ *
   * Somebody wrote on the next page up while this one was underneath.
   * The pen never touched here; the pressure did. A groove is a dark
   * valley with a bright lip on the side the light comes from, and
   * nothing else in this game looks like that, which is exactly why the
   * eye believes it. */
  {
    const groups = 2 + Math.floor(r() * 3);
    for (let g = 0; g < groups; g++) {
      const gx = W * (0.08 + r() * 0.8), gy = H * (0.1 + r() * 0.8);
      const ang = (r() - 0.5) * 0.34;
      const rows = 2 + Math.floor(r() * 4);
      for (let i = 0; i < rows; i++) {
        const y = gy + i * (13 + r() * 6);
        const wid = 90 + r() * 300;
        const x2 = gx + Math.cos(ang) * wid, y2 = y + Math.sin(ang) * wid;
        // the lip, first, offset toward the light
        line(ctx, gx, y - 1.4, x2, y2 - 1.4, r, {
          color: 'rgb(168,168,168)', width: 1.5, alpha: 0.3, jitter: 1.1, passes: 1, smudge: false,
        });
        // then the valley
        line(ctx, gx, y, x2, y2, r, {
          color: 'rgb(103,103,103)', width: 1.9, alpha: 0.34, jitter: 1.1, passes: 1, smudge: false,
        });
      }
    }
  }

  /* ---- foxing ------------------------------------------------------ *
   * Age spots. They cluster around damp and along edges; they never sit
   * on a grid, and the art director will find them if they do. */
  {
    const clusters = 2 + Math.floor(spec.wear * 5);
    for (let c = 0; c < clusters; c++) {
      const cx = W * r(), cy = H * r();
      const spread = 40 + r() * 130;
      const count = 3 + Math.floor(r() * 9 * (0.4 + spec.wear));
      for (let i = 0; i < count; i++) {
        const a = r() * Math.PI * 2;
        const d = Math.pow(r(), 0.6) * spread;
        const x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d;
        const rad = 1.6 + Math.pow(r(), 2) * 9;
        const dark = 0.1 + r() * 0.16 * (0.4 + spec.wear);
        // drawn, not filled: a foxing spot is a stain with a rim
        scribbleCircle(ctx, x, y, rad, r, {
          color: 'rgb(104,100,92)', width: rad * 0.9, alpha: dark,
          passes: 1, smudge: false,
        }, 1 + r() * 0.5);
      }
    }
  }

  /* ---- the gutter crease ------------------------------------------ *
   * Where the sheet folds into the spine: a soft valley several
   * millimetres wide with the paper lifting on both sides of it, and a
   * hard line at the bottom of the fold where the fibres broke. */
  if (spec.crease !== null) {
    const cx = W * spec.crease;
    for (let i = -22; i <= 22; i++) {
      const t = Math.abs(i) / 22;
      const shade = 128 - Math.round((1 - t * t) * 26) + Math.round(t * t * 12);
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = `rgb(${shade},${shade},${shade})`;
      ctx.fillRect(cx + i * 1.6, 0, 1.8, H);
    }
    ctx.globalAlpha = 1;
    // the broken fibres at the bottom of the fold, drawn in pieces
    // because a fold never breaks evenly along its whole length
    let y = 0;
    while (y < H) {
      const seg = 30 + r() * 90;
      if (r() < 0.72) {
        line(ctx, cx + (r() - 0.5) * 3, y, cx + (r() - 0.5) * 3, y + seg, r, {
          color: 'rgb(94,94,94)', width: 1.3 + r(), alpha: 0.28 + r() * 0.2,
          jitter: 1.6, passes: 1, smudge: false,
        });
      }
      y += seg + r() * 26;
    }
  }

  /* ---- handling ---------------------------------------------------- *
   * The outer inch of a page somebody turns is darker than the middle,
   * and never evenly so. */
  {
    const g = ctx.createLinearGradient(0, 0, W, 0);
    g.addColorStop(0, `rgba(96,96,96,${0.2 * spec.wear})`);
    g.addColorStop(0.16, 'rgba(128,128,128,0)');
    g.addColorStop(0.84, 'rgba(128,128,128,0)');
    g.addColorStop(1, `rgba(96,96,96,${0.26 * spec.wear})`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    const v = ctx.createLinearGradient(0, 0, 0, H);
    v.addColorStop(0, `rgba(100,100,100,${0.16 * spec.wear})`);
    v.addColorStop(0.2, 'rgba(128,128,128,0)');
    v.addColorStop(0.8, 'rgba(128,128,128,0)');
    v.addColorStop(1, `rgba(100,100,100,${0.16 * spec.wear})`);
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, W, H);
    // and the smears of a hand that has been resting here for an hour
    for (let i = 0; i < 3 + Math.floor(spec.wear * 5); i++) {
      const x = W * r(), y = H * r();
      ctx.globalAlpha = 0.05 + r() * 0.06;
      const rad = 40 + r() * 90;
      const rg = ctx.createRadialGradient(x, y, 0, x, y, rad);
      rg.addColorStop(0, 'rgb(112,112,112)');
      rg.addColorStop(1, 'rgba(128,128,128,0)');
      ctx.fillStyle = rg;
      ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }
    ctx.globalAlpha = 1;
  }

  return dataTexture(canvas);
}

/* ------------------------------------------------------------------ *
 * The desk the book is lying on
 * ------------------------------------------------------------------ */

/**
 * What is past the edge of the page. Not a gradient band and not a sky:
 * a wooden surface, running the same way in every chapter because it is
 * the same desk, drawn as grain.
 */
export function deskGrainTexture(seed: number): THREE.CanvasTexture {
  const W = 512, H = 512;
  const { canvas, ctx } = makeCanvas(W, H);
  const r = rng(seed * 104729 + 5);
  ctx.fillStyle = NEUTRAL;
  ctx.fillRect(0, 0, W, H);
  // long grain, drifting: a board, not a stripe pattern
  for (let i = 0; i < 130; i++) {
    const y = r() * H;
    const dark = r() < 0.5;
    // a whole number of periods across the board, so the grain that
    // leaves the east edge is the grain that arrives at the west
    const cyc = 1 + Math.floor(r() * 3);
    const amp = 3 + r() * 9;
    const ph = r() * Math.PI * 2;
    const pts: [number, number][] = [];
    for (let k = 0; k <= 24; k++) {
      const t = k / 24;
      pts.push([t * W, y + Math.sin(t * cyc * Math.PI * 2 + ph) * amp]);
    }
    const o = {
      color: dark ? 'rgb(96,96,96)' : 'rgb(154,154,154)',
      width: 0.9 + r() * 3.4,
      alpha: 0.14 + r() * 0.2,
      jitter: 1.2,
      passes: 1,
      smudge: false as const,
    };
    for (const oy of [-H, 0, H]) {
      if (y + oy < -amp - 8 || y + oy > H + amp + 8) continue;
      stroke(ctx, pts.map(([px, py]) => [px, py + oy] as [number, number]), rng(700 + i), o);
    }
  }
  // a few knots and one old ring
  for (let i = 0; i < 3; i++) {
    const x = 60 + r() * (W - 120), y = 60 + r() * (H - 120); // clear of the wrap
    const rad = 8 + r() * 22;
    for (let k = 0; k < 3; k++)
      scribbleCircle(ctx, x, y, rad * (0.4 + k * 0.3), r, {
        color: 'rgb(92,92,92)', width: 2 + r() * 2, alpha: 0.2, passes: 1, smudge: false,
      }, 1.1);
  }
  return dataTexture(canvas, true);
}

/* ------------------------------------------------------------------ *
 * The ten pages
 * ------------------------------------------------------------------ */

/**
 * A seed, a tone and a wear per chapter, because ten identical pages is
 * the tell that they are one quad. The progression is the book's own:
 * Chapter 1 is the front of a new pad, the middle of the book has been
 * carried around, Chapter 9's page has been under whiteout for twenty
 * years, and Chapter 10 is somebody else's paper on somebody else's
 * desk. Chapters 5 and 10 are loose sheets and have no gutter.
 */
export const CHAPTER_PAPER: Record<number, PaperSpec> = {
  1:  { seed: 1041, tone: -0.35, wear: 0.10, crease: 0.06, showThrough: 0.35 },
  2:  { seed: 2207, tone:  0.15, wear: 0.28, crease: 0.94, showThrough: 0.85 },
  3:  { seed: 3319, tone:  0.05, wear: 0.34, crease: 0.05, showThrough: 0.55 },
  4:  { seed: 4457, tone:  0.42, wear: 0.52, crease: 0.93, showThrough: 0.70 },
  5:  { seed: 5573, tone: -0.10, wear: 0.44, crease: null, showThrough: 0.20 },
  6:  { seed: 6691, tone:  0.30, wear: 0.62, crease: 0.07, showThrough: 1.00 },
  7:  { seed: 7817, tone:  0.55, wear: 0.70, crease: 0.95, showThrough: 0.45 },
  8:  { seed: 8933, tone:  0.20, wear: 0.58, crease: 0.06, showThrough: 0.90 },
  9:  { seed: 9059, tone: -0.55, wear: 0.86, crease: 0.92, showThrough: 0.15 },
  10: { seed: 1187, tone:  0.48, wear: 0.40, crease: null, showThrough: 0.62 },
};

export const paperSpec = (chapter: number): PaperSpec =>
  CHAPTER_PAPER[chapter] ?? CHAPTER_PAPER[1];
