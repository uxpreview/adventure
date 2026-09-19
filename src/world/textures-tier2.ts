import type * as THREE from 'three';
import { makeTexture, stroke, line, scribbleCircle, hatch, letteringFit, type Ctx2D } from '../engine/ink';
import { WASH } from '../engine/palette';

/**
 * TIER 2's DRAWINGS (`design/foundation/08` §9, promises 4 to 6).
 *
 * The clippers in three years of grass; the gap going through a hedge;
 * the faded footprints, which are the only physical evidence in the
 * game that he walked out of here; the lantern off the bank and the
 * bracket it belongs on; the wood gate's board; the head of a channel
 * with the board out of it, and the board.
 *
 * THE RULE THIS TIER IS AUTHORED TO: a thing a promise sends you to
 * reads from every camera bearing. A lettered thing gets two faces, a
 * thing on the ground gets a decal, and a thing you are looking for in
 * a wood gets a post beside it that stands up above the bracken.
 * Ballpoint and wash, and nothing here is an image.
 */

const IRON = '#3c3f4a';
const BRASS = '#7a6636';
const TIMBER = '#4a4038';
const CREAM = '#efe6cf';
const FLAME = '#c8913c';

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

/* ==================== 4. VAL. THE CLIPPERS ======================== */

/** THE CLIPPERS, lying in the grass by her steps, with three years of
 *  grass up through the handles. A decal: they are on the ground, and
 *  a thing on the ground is a mark on the page, not a cutout standing
 *  edge-on to half the bearings you could look from. */
export function clippersDecal(seed: number): THREE.CanvasTexture {
  return makeTexture(256, 128, seed, (ctx, r) => {
    // the grass first, so the shears lie IN it
    for (let i = 0; i < 26; i++) {
      const x = 20 + r() * 216;
      const y = 96 + r() * 24;
      line(ctx, x, y, x + (r() - 0.5) * 9, y - 16 - r() * 18, r, { width: 1.1, alpha: 0.4, passes: 1 });
    }
    // two blades, crossed, open a hand's width
    const blade = (y0: number, y1: number) => {
      fillPoly(ctx, [[64, y0], [186, y0 - 6], [190, y0 + 5], [66, y0 + 9]], '#d8d4c8', 0.7);
      poly(ctx, [[64, y0], [186, y0 - 6], [190, y0 + 5], [66, y0 + 9]], r, { width: 2, alpha: 0.9, color: IRON });
      void y1;
    };
    blade(48, 0);
    ctx.save();
    ctx.translate(126, 64);
    ctx.rotate(0.22);
    ctx.translate(-126, -64);
    blade(70, 0);
    ctx.restore();
    // the pivot, and the two long handles going the other way
    scribbleCircle(ctx, 70, 62, 6, r, { width: 2.2, alpha: 0.92, color: IRON }, 1);
    for (const dy of [-14, 14]) {
      fillPoly(ctx, [[12, 62 + dy * 0.5], [66, 58 + dy], [66, 68 + dy], [14, 70 + dy * 0.5]], TIMBER, 0.55);
      poly(ctx, [[12, 62 + dy * 0.5], [66, 58 + dy], [66, 68 + dy], [14, 70 + dy * 0.5]], r, { width: 1.8, alpha: 0.88, color: TIMBER });
    }
    // and more grass, over the top of them
    for (let i = 0; i < 14; i++) {
      const x = 28 + r() * 180;
      line(ctx, x, 104, x + (r() - 0.5) * 8, 58 - r() * 20, r, { width: 1.1, alpha: 0.5, passes: 1 });
    }
  });
}

/** THE CLIPPERS IN THE HAND: small, blades down, and they are the one
 *  thing in the world that a hedge is afraid of. */
export function clippersHandTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(64, 96, seed, (ctx, r) => {
    for (const dx of [-5, 5]) {
      line(ctx, 32 + dx, 18, 32 + dx * 2.4, 86, r, { width: 2.4, alpha: 0.9, color: TIMBER });
    }
    poly(ctx, [[26, 6], [38, 6], [36, 40], [28, 40]], r, { width: 2, alpha: 0.92, color: IRON });
    scribbleCircle(ctx, 32, 42, 5, r, { width: 2, alpha: 0.9, color: IRON }, 1);
  });
}

/** A PAIR OF POSTS EITHER SIDE OF THE CUT, so the gap in the hedge is
 *  a gap somebody made and not a hole. Fixed planes on the hedge's own
 *  line; end on they are two posts, which is the point. */
export function gapPostTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(32, 128, seed, (ctx, r) => {
    fillPoly(ctx, [[10, 126], [11, 16], [16, 8], [21, 16], [22, 126]], WASH.suburb, 0.55);
    poly(ctx, [[10, 126], [11, 16], [16, 8], [21, 16], [22, 126]], r, { width: 2.2, alpha: 0.9, color: TIMBER });
    hatch(ctx, 12, 26, 8, 92, 0.1, 9, r, { width: 0.8, alpha: 0.22 });
  });
}

/* ================ THE FADED FOOTPRINTS (the reveal) =============== */

/**
 * HIS PRINTS, GOING WEST, IN GROUND THAT WAS WET ONCE AND HAS NOT BEEN
 * SINCE. Three years old, walked over by nobody, because the Common is
 * a green and nobody crosses it there.
 *
 * A decal, and the one drawing in this tier that has to be read from
 * four bearings: it is a LINE of prints, and a line reads as a line
 * from any angle, which is the whole reason the reveal is prints and
 * not an object.
 */
export function fadedPrintsDecal(seed: number, dark = false): THREE.CanvasTexture {
  return makeTexture(512, 128, seed, (ctx, r) => {
    const a = dark ? 0.5 : 0.3;
    for (let i = 0; i < 9; i++) {
      const x = 22 + i * 54 + (r() - 0.5) * 5;
      const y = 62 + (i % 2 ? 15 : -15) + (r() - 0.5) * 6;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(-0.16 + (r() - 0.5) * 0.12);
      // a heel and a ball, west-going: the toe is the left end
      fillPoly(ctx, [[-13, -6], [2, -8], [5, -2], [4, 4], [-11, 6]], '#5d5647', a * 0.55);
      poly(ctx, [[-13, -6], [2, -8], [5, -2], [4, 4], [-11, 6]], r, { width: 1.3, alpha: a, jitter: 1.1, passes: 1 });
      poly(ctx, [[7, -5], [15, -4], [16, 3], [8, 4]], r, { width: 1.2, alpha: a * 0.8, jitter: 1.2, passes: 1 });
      ctx.restore();
    }
  });
}

/* ==================== 5. BRACK. THE LANTERN ======================= */

/** THE LANTERN, lying on the shingle where it was set down. A decal,
 *  for the same reason the clippers are one. */
export function lanternDownDecal(seed: number): THREE.CanvasTexture {
  return makeTexture(192, 128, seed, (ctx, r) => {
    ctx.save();
    ctx.translate(96, 66);
    ctx.rotate(1.42); // on its side
    fillPoly(ctx, [[-22, -34], [22, -34], [20, 32], [-20, 32]], '#cfc7b4', 0.55);
    poly(ctx, [[-22, -34], [22, -34], [20, 32], [-20, 32]], r, { width: 2.2, alpha: 0.9, color: IRON });
    poly(ctx, [[-14, -22], [14, -22], [13, 18], [-13, 18]], r, { width: 1.5, alpha: 0.6, color: IRON });
    // the bail, fallen flat
    stroke(ctx, [[-20, -36], [0, -50], [20, -36]], r, { width: 2, alpha: 0.85, color: IRON });
    ctx.restore();
    // shingle round it
    for (let i = 0; i < 18; i++) {
      scribbleCircle(ctx, 16 + r() * 160, 22 + r() * 92, 2 + r() * 3.5, r, { width: 1, alpha: 0.28 }, 1);
    }
  });
}

/** THE LANTERN, STANDING: on the bracket, on the ground, or in a hand.
 *  Lit, the glass is warm and the flame is two strokes. */
export function lanternTexture(seed: number, lit: boolean): THREE.CanvasTexture {
  return makeTexture(64, 128, seed, (ctx, r) => {
    stroke(ctx, [[18, 22], [32, 10], [46, 22]], r, { width: 2, alpha: 0.88, color: IRON });
    fillPoly(ctx, [[16, 30], [48, 30], [46, 40], [18, 40]], '#cfc7b4', 0.6);
    poly(ctx, [[16, 30], [48, 30], [46, 40], [18, 40]], r, { width: 2, alpha: 0.9, color: IRON });
    fillPoly(ctx, [[19, 40], [45, 40], [44, 96], [20, 96]], lit ? '#f0d79a' : '#ded8c9', lit ? 0.85 : 0.5);
    poly(ctx, [[19, 40], [45, 40], [44, 96], [20, 96]], r, { width: 2.1, alpha: 0.9, color: IRON });
    fillPoly(ctx, [[15, 96], [49, 96], [47, 110], [17, 110]], '#cfc7b4', 0.6);
    poly(ctx, [[15, 96], [49, 96], [47, 110], [17, 110]], r, { width: 2, alpha: 0.9, color: IRON });
    if (lit) {
      fillPoly(ctx, [[32, 54], [38, 68], [32, 82], [26, 68]], FLAME, 0.92);
      stroke(ctx, [[32, 56], [32, 80]], r, { width: 2, alpha: 0.9, color: '#8a5a1c' });
    } else {
      stroke(ctx, [[26, 66], [38, 74]], r, { width: 1.2, alpha: 0.4, color: IRON });
    }
  });
}

/** THE LANTERN'S BRACKET on the wood gate's post: empty for three
 *  years, and the hook is worn bright where it used to swing. */
export function bracketTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(48, 64, seed, (ctx, r) => {
    stroke(ctx, [[4, 58], [6, 18], [34, 14], [36, 26]], r, { width: 2.6, alpha: 0.9, color: IRON });
    scribbleCircle(ctx, 36, 30, 4.5, r, { width: 2, alpha: 0.9, color: BRASS }, 1);
  });
}

/**
 * THE WOOD GATE, and it is a BOARD AT THE MOUTH OF A ROAD (the rule
 * this session is authored to: a place a promise sends me to has a
 * board at the mouth of its road and a name that reads from far off).
 * Two posts, a bar between them, and THE PENWOOD cut into the bar in
 * the same hand as everything else in this world.
 */
export function woodGateTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(512, 192, seed, (ctx, r) => {
    for (const x of [26, 470]) {
      fillPoly(ctx, [[x - 12, 190], [x - 10, 30], [x, 18], [x + 10, 30], [x + 12, 190]], WASH.forest, 0.55);
      poly(ctx, [[x - 12, 190], [x - 10, 30], [x, 18], [x + 10, 30], [x + 12, 190]], r, { width: 2.6, alpha: 0.92, color: TIMBER });
    }
    fillPoly(ctx, [[30, 44], [466, 38], [468, 92], [32, 96]], CREAM, 0.9);
    poly(ctx, [[30, 44], [466, 38], [468, 92], [32, 96]], r, { width: 2.6, alpha: 0.92, color: TIMBER });
    letteringFit(ctx, 'THE PENWOOD', 56, 76, 390, 34, r, { alpha: 0.92, crooked: 0.35 });
    // the bracket, on the west post, at a man's reach
    stroke(ctx, [[36, 120], [66, 114], [68, 126]], r, { width: 2.4, alpha: 0.88, color: IRON });
    scribbleCircle(ctx, 68, 130, 4.5, r, { width: 1.8, alpha: 0.85, color: BRASS }, 1);
  });
}

/** THE POOL OF IT ON THE ROAD, once the lantern is lit: the Penwood's
 *  call, and the only warm thing for a hundred and seventy units. */
export function lanternGlowTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(128, 128, seed, (ctx) => {
    const g = ctx.createRadialGradient(64, 64, 4, 64, 64, 62);
    g.addColorStop(0, 'rgba(240, 206, 142, 0.85)');
    g.addColorStop(0.45, 'rgba(226, 184, 112, 0.28)');
    g.addColorStop(1, 'rgba(226, 184, 112, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
  });
}

/** THE OVERGROWN WAY: three years of bramble across the old cut down
 *  to the bank. Cut, it is a gap with the brash thrown to both sides. */
export function bramblesTexture(seed: number, cut: boolean): THREE.CanvasTexture {
  return makeTexture(256, 128, seed, (ctx, r) => {
    const arc = (cx: number, w: number) => {
      for (let i = 0; i < 9; i++) {
        const x0 = cx + (r() - 0.5) * w;
        stroke(ctx, [[x0, 126], [x0 + (r() - 0.5) * 30, 80 - r() * 30], [x0 + (r() - 0.5) * 50, 30 + r() * 30]], r,
          { width: 1.5, alpha: 0.72, jitter: 1.6, passes: 1, color: '#4c5240' });
      }
    };
    if (cut) { arc(34, 44); arc(222, 44); } else { arc(40, 60); arc(128, 80); arc(216, 60); }
    for (let i = 0; i < (cut ? 10 : 26); i++) {
      const x = cut ? (r() > 0.5 ? 10 + r() * 60 : 186 + r() * 60) : 8 + r() * 240;
      scribbleCircle(ctx, x, 40 + r() * 80, 2.5 + r() * 3, r, { width: 1.1, alpha: 0.4, color: '#4c5240' }, 1);
    }
  });
}

/* ==================== 6. HOLT. THE CHANNEL ======================== */

/**
 * THE HEAD OF THE CHANNEL, cut into the head wall: a slot, a sill and
 * the two slots the board went in, empty. Dry, there is a white line
 * where the water used to stand; running, there is water in it.
 */
export function channelHeadTexture(seed: number, running: boolean): THREE.CanvasTexture {
  return makeTexture(256, 160, seed, (ctx, r) => {
    fillPoly(ctx, [[8, 158], [16, 22], [240, 18], [248, 158]], WASH.canyon, 0.6);
    poly(ctx, [[8, 158], [16, 22], [240, 18], [248, 158]], r, { width: 2.6, alpha: 0.9 });
    hatch(ctx, 22, 36, 212, 112, 0.14, 11, r, { width: 0.9, alpha: 0.22 });
    // the slot, and the two grooves the board drops into
    fillPoly(ctx, [[74, 154], [78, 62], [178, 60], [182, 154]], running ? '#9fb2b8' : '#efe9da', running ? 0.75 : 0.5);
    poly(ctx, [[74, 154], [78, 62], [178, 60], [182, 154]], r, { width: 2.4, alpha: 0.92, color: '#3f4550' });
    for (const x of [86, 170]) stroke(ctx, [[x, 150], [x + 1, 66]], r, { width: 2.2, alpha: 0.8, color: '#3f4550' });
    if (running) {
      for (let i = 0; i < 5; i++) {
        const y = 78 + i * 16;
        stroke(ctx, [[92, y], [120 + r() * 20, y + 4], [164, y - 2]], r, { width: 1.5, alpha: 0.5, color: '#4b6672', passes: 1 });
      }
    } else {
      // the tide line: where the water used to stand, and does not
      stroke(ctx, [[80, 92], [178, 90]], r, { width: 1.8, alpha: 0.55, color: '#8b8168' });
    }
  });
}

/** THE BOARD, the one piece of this that can be carried, leaning on
 *  the trestle where it has leaned for three years. */
export function channelBoardTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(96, 160, seed, (ctx, r) => {
    fillPoly(ctx, [[18, 156], [22, 12], [76, 10], [80, 154]], '#8a7a5e', 0.65);
    poly(ctx, [[18, 156], [22, 12], [76, 10], [80, 154]], r, { width: 2.4, alpha: 0.92, color: TIMBER });
    for (let i = 0; i < 4; i++) stroke(ctx, [[24, 30 + i * 32], [76, 28 + i * 32]], r, { width: 1.1, alpha: 0.3, color: TIMBER });
    stroke(ctx, [[30, 66], [70, 62]], r, { width: 2.6, alpha: 0.5, color: '#4b6672' });
  });
}

/** A BOARD AT THE MOUTH OF THE CANYON ROAD: SPLITROCK, and under it,
 *  in a hand that is not the sign-writer's, HOLT'S CHANNEL — THIS WAY. */
export function canyonBoardTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(320, 160, seed, (ctx, r) => {
    stroke(ctx, [[152, 158], [154, 70]], r, { width: 3.2, alpha: 0.9, color: TIMBER });
    fillPoly(ctx, [[14, 18], [306, 12], [308, 74], [16, 80]], CREAM, 0.9);
    poly(ctx, [[14, 18], [306, 12], [308, 74], [16, 80]], r, { width: 2.6, alpha: 0.92, color: TIMBER });
    letteringFit(ctx, 'SPLITROCK', 34, 50, 250, 30, r, { alpha: 0.92, crooked: 0.3 });
    letteringFit(ctx, 'THE CHANNEL, NORTH', 36, 70, 240, 12, r, { alpha: 0.6, crooked: 0.7 });
  });
}

/** WATER, back in the dry bed: a decal laid the length of the channel
 *  floor, so it is the ground that changed and not a prop that arrived. */
export function channelWaterDecal(seed: number): THREE.CanvasTexture {
  return makeTexture(256, 512, seed, (ctx, r) => {
    ctx.save();
    ctx.globalAlpha = 0.34;
    ctx.fillStyle = '#7d99a4';
    ctx.beginPath();
    ctx.moveTo(96, 0);
    for (let y = 0; y <= 512; y += 32) ctx.lineTo(96 + Math.sin(y * 0.02) * 16, y);
    for (let y = 512; y >= 0; y -= 32) ctx.lineTo(160 + Math.sin(y * 0.017 + 1.4) * 14, y);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    for (let i = 0; i < 22; i++) {
      const y = 10 + r() * 492;
      stroke(ctx, [[104 + r() * 20, y], [136 + r() * 18, y + 6]], r, { width: 1.3, alpha: 0.35, color: '#3f5b66', passes: 1 });
    }
  });
}
