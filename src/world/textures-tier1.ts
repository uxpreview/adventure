import type * as THREE from 'three';
import { makeTexture, stroke, line, scribbleCircle, hatch, letteringFit, type Ctx2D } from '../engine/ink';
import { WASH } from '../engine/palette';

/**
 * TIER 1's DRAWINGS (`design/foundation/08` §9, promises 1 to 3).
 *
 * The chain on the king's road and what it hangs from; the covers on
 * Brim's stalls and what is under them; six people in Brim Square who
 * have names now; Marget sat down; the hall at Greyweather. Ballpoint
 * and wash like everything else, and nothing here is an image.
 */

const RED = '#8f4a52';
const CREAM = '#efe6cf';
const TIMBER = '#4a4038';
const IRON = '#3c3f4a';

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

function poly(ctx: Ctx2D, pts: [number, number][], r: () => number, o: Parameters<typeof stroke>[3] = {}) {
  stroke(ctx, [...pts, pts[0]], r, o);
}

/* ================== THE CHAIN ON THE KING'S ROAD ================== */

/** A stone bollard with an iron ring: what the chain hangs from. A
 *  round thing, so it may face the lens. */
export function chainPostTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(48, 128, seed, (ctx, r) => {
    fillPoly(ctx, [[12, 124], [14, 30], [24, 18], [34, 30], [36, 124]], WASH.castle, 0.6);
    stroke(ctx, [[12, 124], [14, 30], [24, 18], [34, 30], [36, 124]], r, { width: 2.6, alpha: 0.92 });
    hatch(ctx, 15, 36, 9, 84, 0.2, 7, r, { width: 0.9, alpha: 0.25 });
    // the ring the chain is hooked to
    scribbleCircle(ctx, 24, 50, 6.5, r, { width: 2.2, alpha: 0.9, color: IRON }, 1);
    for (let i = 0; i < 4; i++) stroke(ctx, [[4 + r() * 40, 126], [5 + r() * 40, 112 - r() * 8]], r, { width: 1.2, alpha: 0.5, passes: 1 });
  });
}

/** The chain itself, flat on: a sag of links post to post, and a board
 *  hung off the middle of it in one man's hand. A fixed plane across
 *  the road; end on it is the two posts. */
export function roadChainTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(512, 128, seed, (ctx, r) => {
    const sag = (x: number) => 26 + 34 * (1 - ((x - 256) / 250) ** 2);
    for (let x = 8; x < 504; x += 13) {
      const y = sag(x);
      const tall = (Math.round(x / 13) % 2) === 0;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(((sag(x + 6) - sag(x - 6)) / 12));
      ctx.scale(tall ? 0.62 : 1.3, tall ? 1.25 : 0.7);
      scribbleCircle(ctx, 0, 0, 5.6, r, { width: 2.3, alpha: 0.92, color: IRON });
      ctx.restore();
    }
    // the board, on two bits of wire
    line(ctx, 196, sag(196), 200, 78, r, { width: 1.3, alpha: 0.7, passes: 1 });
    line(ctx, 316, sag(316), 312, 78, r, { width: 1.3, alpha: 0.7, passes: 1 });
    fillPoly(ctx, [[178, 76], [334, 74], [336, 122], [176, 124]], CREAM, 0.92);
    poly(ctx, [[178, 76], [334, 74], [336, 122], [176, 124]], r, { width: 2.4, alpha: 0.92, color: TIMBER });
    letteringFit(ctx, 'ROAD CLOSED', 188, 100, 136, 17, r, { alpha: 0.92, crooked: 0.4 });
    letteringFit(ctx, 'IT IS NOTHING. — W.', 196, 117, 120, 9, r, { alpha: 0.7, crooked: 0.6 });
  });
}

/** The chain, down: a slack line of links on the ground across the
 *  road, and the board face up beside it. A decal; it does not turn. */
export function chainDownDecal(seed: number): THREE.CanvasTexture {
  return makeTexture(512, 160, seed, (ctx, r) => {
    const y = (x: number) => 84 + Math.sin(x / 61) * 22 + Math.sin(x / 23) * 6;
    for (let x = 10; x < 502; x += 12) {
      scribbleCircle(ctx, x, y(x), 5.4, r, { width: 2, alpha: 0.82, color: IRON });
    }
    ctx.save();
    ctx.translate(330, 34);
    ctx.rotate(-0.22);
    fillPoly(ctx, [[-62, -18], [62, -20], [64, 18], [-64, 20]], CREAM, 0.85);
    poly(ctx, [[-62, -18], [62, -20], [64, 18], [-64, 20]], r, { width: 2, alpha: 0.85, color: TIMBER });
    letteringFit(ctx, 'ROAD CLOSED', -54, 6, 108, 14, r, { alpha: 0.6, crooked: 0.5 });
    line(ctx, -58, 12, 58, -12, r, { width: 2.4, alpha: 0.85, passes: 1 });
    ctx.restore();
  });
}

/** Grass come up through a road nobody has used for three years. No
 *  edge to it: tufts, and a wash that dies away before the canvas does. */
export function overgrownRoadDecal(seed: number): THREE.CanvasTexture {
  return makeTexture(192, 256, seed, (ctx, r) => {
    for (let i = 0; i < 5; i++) {
      // every blot dies inside the canvas: an edge here is a box on the road
      const bx = 96 + (r() - 0.5) * 50;
      const by = 128 + (r() - 0.5) * 110;
      const rad = 40 + r() * 18;
      const g = ctx.createRadialGradient(bx, by, 2, bx, by, rad);
      g.addColorStop(0, 'rgba(150,164,110,0.30)');
      g.addColorStop(1, 'rgba(150,164,110,0)');
      ctx.fillStyle = g;
      ctx.fillRect(bx - rad, by - rad, rad * 2, rad * 2);
    }
    for (let i = 0; i < 40; i++) {
      const x = 36 + r() * 120;
      const y = 44 + r() * 180;
      const h = 9 + r() * 12;
      for (let b = 0; b < 3; b++) {
        stroke(ctx, [[x + b * 3, y], [x + b * 3 + (r() - 0.3) * 6, y - h * (0.7 + r() * 0.5)]], r, { width: 1.1, alpha: 0.5, passes: 1 });
      }
    }
  });
}

/** A brazier with no fire in it: the iron basket on its leg, and ash.
 *  What stands at the gate by day (the lit one only exists after dark). */
export function coldBrazierTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(96, 128, seed, (ctx, r) => {
    poly(ctx, [[30, 86], [66, 86], [60, 64], [36, 64]], r, { width: 2.2, alpha: 0.92, color: IRON });
    for (let i = 0; i < 4; i++) line(ctx, 34 + i * 8, 64, 32 + i * 9, 86, r, { width: 1.2, alpha: 0.6, passes: 1, color: IRON });
    line(ctx, 48, 86, 48, 118, r, { width: 2.6, alpha: 0.9, color: IRON });
    line(ctx, 36, 120, 60, 120, r, { width: 2.2, alpha: 0.85, color: IRON });
    // ash, and one stick that did not burn through
    fillPoly(ctx, [[37, 66], [42, 58], [50, 61], [56, 57], [60, 66]], '#8d8a86', 0.7);
    line(ctx, 40, 60, 58, 54, r, { width: 1.6, alpha: 0.7, passes: 1, color: TIMBER });
  });
}

/** A mounting block by the gate: what Wick sits down on. */
export function mountingBlockTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(96, 64, seed, (ctx, r) => {
    fillPoly(ctx, [[8, 60], [8, 34], [44, 34], [44, 14], [88, 14], [88, 60]], WASH.castle, 0.55);
    stroke(ctx, [[8, 60], [8, 34], [44, 34], [44, 14], [88, 14], [88, 60]], r, { width: 2.4, alpha: 0.9 });
    hatch(ctx, 46, 18, 40, 40, 0.3, 8, r, { width: 0.9, alpha: 0.22 });
    line(ctx, 4, 61, 92, 61, r, { width: 1.6, alpha: 0.6, passes: 1 });
  });
}

/* ================== BRIM'S STALLS, COVERED ================== */

/** A stall's counter under a tied sheet, with a chalked slate: the same
 *  canvas as `brimStallTexture` so it lies over the counter exactly. */
export function stallCoverTexture(seed: number, slate: string): THREE.CanvasTexture {
  return makeTexture(192, 176, seed, (ctx, r) => {
    const top: [number, number][] = [[20, 118], [44, 96], [76, 100], [104, 92], [140, 99], [172, 116]];
    fillPoly(ctx, [...top, [172, 166], [20, 166]], '#d9d2bd', 0.96);
    stroke(ctx, [[20, 166], ...top, [172, 166]], r, { width: 2.2, alpha: 0.9 });
    // the folds, and the cord round it
    for (const x of [52, 88, 126, 150]) stroke(ctx, [[x, 104 + r() * 6], [x - 4 + r() * 8, 162]], r, { width: 1, alpha: 0.4, passes: 1 });
    stroke(ctx, [[20, 136], [96, 142], [172, 134]], r, { width: 1.8, alpha: 0.8, color: TIMBER });
    stroke(ctx, [[92, 142], [88, 154], [98, 150], [96, 142]], r, { width: 1.3, alpha: 0.7, passes: 1, color: TIMBER });
    // the slate propped on it
    fillPoly(ctx, [[60, 108], [132, 106], [134, 132], [58, 134]], '#3f444c', 0.9);
    poly(ctx, [[60, 108], [132, 106], [134, 132], [58, 134]], r, { width: 1.8, alpha: 0.9, color: TIMBER });
    letteringFit(ctx, slate, 65, 126, 64, 12, r, { alpha: 0.92, crooked: 0.5, color: CREAM });
  });
}

/* ================== SIX PEOPLE IN BRIM SQUARE ================== */

export type BrimFolk = 'hob' | 'dorrie' | 'pell' | 'bryn' | 'cass' | 'tolly';

/** Somebody with a name. One drawing each, told apart by what they are
 *  holding and the shape of them, the way a ballpoint tells people
 *  apart. 96 by 160 like the rest of the town. */
export function brimFolkTexture(seed: number, who: BrimFolk): THREE.CanvasTexture {
  return makeTexture(96, 160, seed, (ctx, r) => {
    const pen = { width: 2, alpha: 0.86 };
    const legs = (x0: number, x1: number, top: number) => {
      line(ctx, x0, top, x0 - 1, 150, r, pen);
      line(ctx, x1, top, x1 + 1, 150, r, pen);
      line(ctx, x0 - 1, 150, x0 - 7, 152, r, { width: 1.8, alpha: 0.8, passes: 1 });
      line(ctx, x1 + 1, 150, x1 + 7, 152, r, { width: 1.8, alpha: 0.8, passes: 1 });
    };
    switch (who) {
      case 'hob': {
        // a thin man in a flat cap leaning on a broom taller than he is
        scribbleCircle(ctx, 44, 34, 12, r, pen, 1.05);
        stroke(ctx, [[30, 28], [44, 19], [60, 27], [64, 30]], r, { width: 2.2, alpha: 0.9 });
        poly(ctx, [[36, 48], [32, 112], [56, 112], [52, 48]], r, pen);
        fillPoly(ctx, [[36, 48], [32, 112], [56, 112], [52, 48]], WASH.kingdom, 0.4);
        legs(38, 50, 112);
        line(ctx, 74, 8, 70, 150, r, { width: 2.2, alpha: 0.88, color: TIMBER });
        for (let i = 0; i < 7; i++) line(ctx, 70, 138, 58 + i * 4, 156, r, { width: 1.1, alpha: 0.6, passes: 1 });
        stroke(ctx, [[52, 58], [64, 66], [72, 60]], r, { width: 1.8, alpha: 0.82 });
        stroke(ctx, [[52, 64], [62, 80], [71, 78]], r, { width: 1.8, alpha: 0.82 });
        break;
      }
      case 'dorrie': {
        // round, floured, a baker's cap and a tray with nothing on it
        scribbleCircle(ctx, 48, 36, 13, r, pen, 1.0);
        fillPoly(ctx, [[34, 28], [36, 12], [48, 8], [60, 12], [62, 28]], CREAM, 0.9);
        stroke(ctx, [[34, 28], [36, 12], [48, 8], [60, 12], [62, 28], [34, 28]], r, { width: 1.8, alpha: 0.85 });
        poly(ctx, [[34, 52], [22, 126], [74, 126], [62, 52]], r, pen);
        fillPoly(ctx, [[38, 62], [30, 122], [66, 122], [58, 62]], CREAM, 0.7);
        line(ctx, 40, 126, 40, 150, r, pen);
        line(ctx, 56, 126, 56, 150, r, pen);
        // the tray, held out in front, empty
        poly(ctx, [[14, 84], [82, 82], [86, 92], [10, 94]], r, { width: 1.8, alpha: 0.85, color: TIMBER });
        stroke(ctx, [[36, 64], [22, 84]], r, { width: 1.8, alpha: 0.8 });
        stroke(ctx, [[60, 64], [76, 82]], r, { width: 1.8, alpha: 0.8 });
        break;
      }
      case 'pell': {
        // a big man with a cheese under one arm like a drum
        scribbleCircle(ctx, 50, 32, 13, r, pen, 1.0);
        stroke(ctx, [[40, 40], [50, 46], [60, 40]], r, { width: 1.3, alpha: 0.6, passes: 1 });
        poly(ctx, [[30, 50], [24, 116], [76, 116], [70, 50]], r, pen);
        fillPoly(ctx, [[30, 50], [24, 116], [76, 116], [70, 50]], '#c9b37a', 0.35);
        legs(38, 62, 116);
        scribbleCircle(ctx, 22, 88, 15, r, { width: 2, alpha: 0.88 });
        fillPoly(ctx, [[8, 80], [36, 80], [36, 96], [8, 96]], '#e2c46a', 0.5);
        stroke(ctx, [[32, 56], [20, 72]], r, { width: 1.8, alpha: 0.8 });
        break;
      }
      case 'bryn': {
        // tall, a bolt of blue cloth over one shoulder
        scribbleCircle(ctx, 46, 30, 12, r, pen, 1.1);
        stroke(ctx, [[34, 26], [38, 14], [54, 14], [58, 26]], r, { width: 1.5, alpha: 0.7 });
        poly(ctx, [[36, 44], [30, 128], [64, 128], [56, 44]], r, pen);
        line(ctx, 40, 128, 40, 150, r, pen);
        line(ctx, 54, 128, 54, 150, r, pen);
        fillPoly(ctx, [[52, 22], [92, 40], [88, 54], [48, 36]], '#4a7ab0', 0.6);
        poly(ctx, [[52, 22], [92, 40], [88, 54], [48, 36]], r, { width: 1.8, alpha: 0.85 });
        scribbleCircle(ctx, 90, 47, 7, r, { width: 1.4, alpha: 0.7 }, 1.2);
        stroke(ctx, [[54, 50], [66, 40]], r, { width: 1.8, alpha: 0.8 });
        break;
      }
      case 'cass': {
        // twelve, all elbows, two plaits and a hoop
        scribbleCircle(ctx, 44, 62, 11, r, pen, 1.0);
        stroke(ctx, [[34, 60], [26, 76], [28, 86]], r, { width: 1.8, alpha: 0.8 });
        stroke(ctx, [[54, 60], [62, 76], [60, 86]], r, { width: 1.8, alpha: 0.8 });
        poly(ctx, [[36, 76], [28, 124], [60, 124], [52, 76]], r, pen);
        fillPoly(ctx, [[36, 76], [28, 124], [60, 124], [52, 76]], RED, 0.4);
        legs(38, 50, 124);
        scribbleCircle(ctx, 74, 118, 19, r, { width: 1.8, alpha: 0.8, color: TIMBER }, 1.0);
        stroke(ctx, [[52, 86], [66, 100]], r, { width: 1.7, alpha: 0.8 });
        break;
      }
      case 'tolly': {
        // an old man sat with both hands on a stick and a bag at his feet
        scribbleCircle(ctx, 46, 52, 12, r, pen, 1.0);
        stroke(ctx, [[36, 46], [46, 38], [58, 46]], r, { width: 1.4, alpha: 0.6, passes: 1 });
        poly(ctx, [[34, 66], [30, 112], [62, 112], [58, 66]], r, pen);
        fillPoly(ctx, [[34, 66], [30, 112], [62, 112], [58, 66]], WASH.city, 0.4);
        stroke(ctx, [[36, 112], [58, 114], [74, 118], [74, 150]], r, pen);
        stroke(ctx, [[40, 116], [64, 122], [66, 150]], r, pen);
        line(ctx, 82, 70, 80, 152, r, { width: 2.2, alpha: 0.88, color: TIMBER });
        stroke(ctx, [[56, 76], [72, 82], [82, 78]], r, { width: 1.8, alpha: 0.8 });
        poly(ctx, [[8, 128], [28, 126], [30, 152], [6, 152]], r, { width: 1.7, alpha: 0.8 });
        stroke(ctx, [[12, 128], [18, 118], [24, 126]], r, { width: 1.3, alpha: 0.7, passes: 1 });
        break;
      }
    }
  });
}

/** Marget, sat down behind her stall on an upturned crate, hands in
 *  her lap. What I'LL HANDLE IT costs, where you can see it. */
export function margetSatTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(96, 176, seed, (ctx, r) => {
    scribbleCircle(ctx, 48, 70, 14, r, { width: 2, alpha: 0.85 }, 1.1);
    stroke(ctx, [[35, 64], [40, 54], [58, 54], [62, 65]], r, { width: 1.6, alpha: 0.7 });
    poly(ctx, [[38, 86], [30, 136], [74, 140], [78, 168], [60, 168], [58, 150], [34, 150]], r, { width: 2, alpha: 0.85 });
    fillPoly(ctx, [[40, 98], [34, 140], [70, 142], [58, 98]], CREAM, 0.55);
    stroke(ctx, [[40, 94], [48, 118], [60, 120]], r, { width: 1.8, alpha: 0.82 });
    stroke(ctx, [[56, 94], [62, 114], [52, 122]], r, { width: 1.8, alpha: 0.82 });
    // the crate
    poly(ctx, [[22, 148], [60, 148], [60, 172], [22, 172]], r, { width: 1.8, alpha: 0.85, color: TIMBER });
    line(ctx, 22, 160, 60, 160, r, { width: 1, alpha: 0.5, passes: 1 });
  });
}

/* ================== THE HALL AT GREYWEATHER ================== */

/** The hall's far wall: a hearth with a fire in, a long settle, pegs
 *  with one coat on them that has been there three years. */
export function hallWallTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(640, 256, seed, (ctx, r) => {
    fillPoly(ctx, [[0, 0], [640, 0], [640, 256], [0, 256]], WASH.castle, 0.42);
    for (let y = 40; y < 256; y += 44) line(ctx, 0, y, 640, y + (r() - 0.5) * 4, r, { width: 1, alpha: 0.22, passes: 1 }, 8);
    for (let i = 0; i < 16; i++) {
      const x = 20 + r() * 600;
      const y = Math.floor(r() * 5) * 44 + 40;
      line(ctx, x, y, x + (r() - 0.5) * 3, y + 44, r, { width: 1, alpha: 0.2, passes: 1 });
    }
    // the hearth
    fillPoly(ctx, [[236, 252], [240, 96], [320, 60], [400, 96], [404, 252]], '#2c2a2e', 0.78);
    stroke(ctx, [[222, 252], [226, 88], [320, 44], [414, 88], [418, 252]], r, { width: 3, alpha: 0.92 });
    stroke(ctx, [[206, 86], [434, 84]], r, { width: 3.4, alpha: 0.9, color: TIMBER });
    const g = ctx.createRadialGradient(320, 214, 4, 320, 204, 96);
    g.addColorStop(0, 'rgba(255,244,214,0.95)');
    g.addColorStop(0.45, 'rgba(255,190,110,0.6)');
    g.addColorStop(1, 'rgba(255,190,110,0)');
    ctx.fillStyle = g;
    ctx.fillRect(224, 108, 192, 144);
    for (let i = 0; i < 5; i++) {
      const x = 286 + i * 17;
      stroke(ctx, [[x, 246], [x - 6 + r() * 12, 212 - r() * 26], [x + 3, 186 - r() * 22]], r, { width: 1.8, alpha: 0.75, passes: 1, color: RED });
    }
    line(ctx, 272, 246, 368, 244, r, { width: 3, alpha: 0.85, color: TIMBER });
    line(ctx, 282, 238, 360, 250, r, { width: 2.6, alpha: 0.8, color: TIMBER });
    // pegs, one coat
    line(ctx, 470, 92, 610, 90, r, { width: 2.2, alpha: 0.8, color: TIMBER });
    for (let i = 0; i < 5; i++) line(ctx, 482 + i * 30, 91, 482 + i * 30, 102, r, { width: 2, alpha: 0.8, passes: 1 });
    poly(ctx, [[500, 100], [486, 190], [540, 192], [524, 100]], r, { width: 1.8, alpha: 0.8 });
    fillPoly(ctx, [[500, 100], [486, 190], [540, 192], [524, 100]], WASH.seaDeep, 0.35);
    // a banner, folded, on the settle
    poly(ctx, [[30, 252], [30, 170], [190, 168], [190, 252]], r, { width: 2.2, alpha: 0.85, color: TIMBER });
    line(ctx, 30, 204, 190, 202, r, { width: 1.6, alpha: 0.7, passes: 1, color: TIMBER });
    fillPoly(ctx, [[70, 202], [72, 186], [140, 184], [142, 202]], RED, 0.5);
    poly(ctx, [[70, 202], [72, 186], [140, 184], [142, 202]], r, { width: 1.4, alpha: 0.7 });
  });
}

/** The hall's floor: flags, and a worn run from the door to the fire. */
export function hallFloorDecal(seed: number): THREE.CanvasTexture {
  return makeTexture(256, 192, seed, (ctx, r) => {
    fillPoly(ctx, [[0, 0], [256, 0], [256, 192], [0, 192]], WASH.castle, 0.5);
    for (let y = 0; y <= 192; y += 32) line(ctx, 0, y, 256, y + (r() - 0.5) * 3, r, { width: 1, alpha: 0.3, passes: 1 }, 6);
    for (let row = 0; row < 6; row++) {
      for (let x = (row % 2) * 24; x < 256; x += 48) line(ctx, x, row * 32, x + (r() - 0.5) * 3, row * 32 + 32, r, { width: 1, alpha: 0.28, passes: 1 });
    }
    const g = ctx.createRadialGradient(128, 96, 6, 128, 96, 110);
    g.addColorStop(0, 'rgba(190,172,138,0.34)');
    g.addColorStop(1, 'rgba(190,172,138,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 192);
  });
}

/** A bed of sorts: a straw pallet with a folded blanket, by the fire. */
export function palletTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(160, 64, seed, (ctx, r) => {
    fillPoly(ctx, [[6, 58], [10, 30], [150, 28], [154, 58]], '#d8c48e', 0.6);
    poly(ctx, [[6, 58], [10, 30], [150, 28], [154, 58]], r, { width: 2, alpha: 0.88 });
    hatch(ctx, 12, 34, 136, 22, 0.1, 9, r, { width: 0.9, alpha: 0.25 });
    fillPoly(ctx, [[96, 30], [98, 12], [148, 12], [150, 28]], RED, 0.45);
    poly(ctx, [[96, 30], [98, 12], [148, 12], [150, 28]], r, { width: 1.7, alpha: 0.82 });
    line(ctx, 98, 20, 148, 20, r, { width: 1, alpha: 0.5, passes: 1 });
  });
}

/** A road board on two legs: what stands at the mouth of a road and
 *  says where it goes. No arms (a lens-facing arm points nowhere). */
export function roadBoardTexture(seed: number, top: string, under: string): THREE.CanvasTexture {
  return makeTexture(224, 176, seed, (ctx, r) => {
    line(ctx, 52, 172, 56, 96, r, { width: 2.6, alpha: 0.88, color: TIMBER });
    line(ctx, 172, 172, 168, 96, r, { width: 2.6, alpha: 0.88, color: TIMBER });
    fillPoly(ctx, [[18, 16], [206, 12], [208, 100], [16, 104]], CREAM, 0.92);
    poly(ctx, [[18, 16], [206, 12], [208, 100], [16, 104]], r, { width: 2.4, alpha: 0.92, color: TIMBER });
    letteringFit(ctx, top, 30, 56, 164, 26, r, { alpha: 0.92, crooked: 0.45 });
    letteringFit(ctx, under, 30, 88, 164, 16, r, { alpha: 0.75, crooked: 0.55 });
  });
}
