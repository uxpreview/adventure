import * as THREE from 'three';
import {
  makeTexture, stroke, line, scribbleCircle, hatch, letteringFit, type Ctx2D,
} from '../engine/ink';
import { INK, PENCIL, WASH } from '../engine/palette';

/**
 * THE OLD WORLD's prop box (Session 3): the streets of Brim and the
 * high seat of Greyweather.
 *
 * Two registers again. Brim inside its walls is the busiest ink in the
 * game — dark oak timber over pale plaster, signs and bunting, full
 * foreground pressure. Greyweather is the heaviest: cold grey wash and
 * near-black iron line, surrounded by the barest ground on the sheet.
 * The pale (failing-pressure) far layers — back-street roofs, the
 * ridge pines — keep Session 2's distance register.
 */

const TIMBER = '#4a4038';
const PLASTER = '#e8dfc8';
const SLATE = '#8d8a84';
const RED = '#8f4a52';
const CREAM = '#efe6cf';

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

function fillBlob(
  ctx: Ctx2D, cx: number, cy: number, rad: number, r: () => number,
  color: string, alpha: number, squash = 1
) {
  const pts: [number, number][] = [];
  const n = 14;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const rr = rad * (0.82 + r() * 0.36);
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * squash]);
  }
  fillPoly(ctx, pts, color, alpha);
}

function poly(
  ctx: Ctx2D, pts: [number, number][], r: () => number,
  o: Parameters<typeof stroke>[3] = {}
) {
  stroke(ctx, [...pts, pts[0]], r, o);
}

/* ================== THE STREETS OF BRIM ================== */

/**
 * A terrace of three or four half-timbered townhouses sharing walls,
 * each with its own lean, jetty and roofline. The town is drawn as
 * dark oak framing over pale plaster; roofs stay in the slate family
 * so the silhouette over the wall matches the Session 2 vista it
 * replaces. One house per row keeps a shopfront with a hanging sign.
 */
/* ------------------------------------------------------------------ *
 * WHERE THE WINDOWS ARE.
 *
 * The day cycle (Session 6) lights Brim's high street after dark, and
 * the first build of that hung a generated run of panes in front of
 * each terrace. It read exactly as badly as it sounds: warm rectangles
 * floating over roofs and party walls, aligned with nothing, because a
 * second drawing cannot guess where a first drawing put its windows.
 *
 * So the row RECORDS its own casements as it draws them, and the lit
 * version reads the record. One drawing, two passes, and a lit window
 * is in the window.
 * ------------------------------------------------------------------ */
type WinRect = { x: number; y: number; w: number; h: number };
const ROW_WINDOWS = new Map<number, WinRect[]>();

export function townRowTexture(seed: number): THREE.CanvasTexture {
  const windows: WinRect[] = [];
  const tex = makeTexture(512, 288, seed, (ctx, r) => {
    const baseY = 282;
    const n = 3 + Math.floor(r() * 2);
    // divide the row into houses of unequal width
    const cuts: number[] = [8];
    for (let i = 1; i < n; i++) cuts.push(8 + ((504 - 16) * i) / n + (r() - 0.5) * 30);
    cuts.push(504);
    const shopAt = Math.floor(r() * n);

    for (let i = 0; i < n; i++) {
      const x0 = cuts[i];
      const x1 = cuts[i + 1];
      const w = x1 - x0;
      const lean = (r() - 0.5) * 9; // top-x drift: each house leans its own way
      const eaveY = 118 + r() * 34;
      const jettyY = eaveY + (baseY - eaveY) * (0.42 + r() * 0.1);
      const jet = 5 + r() * 5; // the upper floor overhangs
      const stone = r() > 0.82; // one house in five or so is stone

      // lower face
      fillPoly(ctx, [[x0 + 2, baseY], [x0 + 3, jettyY], [x1 - 3, jettyY], [x1 - 2, baseY]],
        stone ? WASH.castle : PLASTER, stone ? 0.5 : 0.55);
      // jettied upper face, wider, leaning
      fillPoly(ctx, [[x0 - jet + 3 + lean * 0.4, jettyY], [x0 - jet + 4 + lean, eaveY],
        [x1 + jet - 4 + lean, eaveY], [x1 + jet - 3 + lean * 0.4, jettyY]],
        stone ? WASH.castle : PLASTER, stone ? 0.5 : 0.6);

      // outline: party walls heavier where houses meet
      stroke(ctx, [[x0 + 2, baseY], [x0 + 3, jettyY], [x0 - jet + 3 + lean * 0.4, jettyY],
        [x0 - jet + 4 + lean, eaveY]], r, { width: 2.6, alpha: 0.9 });
      stroke(ctx, [[x1 - 2, baseY], [x1 - 3, jettyY], [x1 + jet - 3 + lean * 0.4, jettyY],
        [x1 + jet - 4 + lean, eaveY]], r, { width: 2.6, alpha: 0.9 });
      // the jetty line with its bracket ticks
      line(ctx, x0 - jet + 4 + lean * 0.4, jettyY, x1 + jet - 4 + lean * 0.4, jettyY, r,
        { width: 2.2, alpha: 0.85 });
      for (let bx = x0 + 8; bx < x1 - 6; bx += 16 + r() * 8) {
        line(ctx, bx, jettyY, bx - 3, jettyY + 7, r, { width: 1.4, alpha: 0.6, passes: 1 }, 2);
      }

      if (!stone) {
        // timber framing on the upper storey: a real grid of it — top
        // rail, mid rail, close studs, braces in the outer bays — so
        // the plaster reads half-timbered and never blank
        const tx0 = x0 - jet + 6 + lean;
        const tx1 = x1 + jet - 6 + lean;
        const midY = (eaveY + jettyY) / 2 + (r() - 0.5) * 4;
        line(ctx, tx0 + 2, eaveY + 3, tx1 - 2, eaveY + 4, r, { width: 2, alpha: 0.72, color: TIMBER });
        line(ctx, tx0 + 1, midY, tx1 - 1, midY + 1, r, { width: 1.6, alpha: 0.55, color: TIMBER });
        const studs = 3 + Math.floor((tx1 - tx0) / 34);
        for (let s = 1; s <= studs; s++) {
          const sx = tx0 + ((tx1 - tx0) * s) / (studs + 1);
          line(ctx, sx, eaveY + 3, sx - lean * 0.5 + (r() - 0.5) * 3, jettyY - 2, r,
            { width: 1.9, alpha: 0.68, color: TIMBER });
        }
        // braces in both outer bays, opposing angles
        line(ctx, tx0 + 3, eaveY + 6, tx0 + (tx1 - tx0) * 0.24, jettyY - 4, r,
          { width: 1.7, alpha: 0.58, color: TIMBER });
        line(ctx, tx1 - 3, eaveY + 6, tx1 - (tx1 - tx0) * 0.24, jettyY - 4, r,
          { width: 1.7, alpha: 0.58, color: TIMBER });
        // and the lower storey gets its studs and sill too
        line(ctx, x0 + 4, baseY - 4, x1 - 4, baseY - 3, r, { width: 1.8, alpha: 0.6, color: TIMBER });
        for (let s = 1; s <= 2; s++) {
          const sx = x0 + ((x1 - x0) * s) / 3 + (r() - 0.5) * 6;
          line(ctx, sx, jettyY + 3, sx + (r() - 0.5) * 3, baseY - 4, r,
            { width: 1.7, alpha: 0.5, color: TIMBER });
        }
      } else {
        // stone courses instead
        for (let k = 0; k < 8; k++) {
          const mx = x0 + 6 + r() * (w - 20);
          const my = eaveY + 10 + r() * (baseY - eaveY - 24);
          line(ctx, mx, my, mx + 10 + r() * 8, my + (r() - 0.5) * 3, r,
            { width: 1, alpha: 0.28, passes: 1 });
        }
      }

      // casement windows upstairs: two or three, some with a window box
      const wins = w > 120 ? 3 : 2;
      for (let k = 0; k < wins; k++) {
        const wx = x0 - jet + 12 + lean + ((x1 - x0 + jet * 2 - 36) * k) / Math.max(1, wins - 1) + (r() - 0.5) * 5;
        const wy = eaveY + 14 + r() * 8;
        poly(ctx, [[wx, wy + 20], [wx, wy], [wx + 15, wy], [wx + 15, wy + 20]], r,
          { width: 1.5, alpha: 0.85 });
        windows.push({ x: wx, y: wy, w: 15, h: 20 });
        line(ctx, wx + 7.5, wy, wx + 7.5, wy + 20, r, { width: 0.9, alpha: 0.45, passes: 1 }, 2);
        line(ctx, wx, wy + 10, wx + 15, wy + 10, r, { width: 0.9, alpha: 0.45, passes: 1 }, 2);
        if (r() > 0.55) {
          // window box with red dots of geraniums
          line(ctx, wx - 2, wy + 21, wx + 17, wy + 21, r, { width: 1.8, alpha: 0.7 });
          ctx.fillStyle = RED;
          ctx.globalAlpha = 0.7;
          for (let f = 0; f < 4; f++) {
            ctx.beginPath();
            ctx.arc(wx + 2 + f * 4 + r() * 2, wy + 18 + (r() - 0.5) * 2, 1.6, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.globalAlpha = 1;
        }
      }

      // ground floor: shopfront on one house, plain door on the rest
      if (i === shopAt) {
        // two mullioned display windows with small panes and a door
        const sx = x0 + w * 0.14;
        const winW = w * 0.24;
        for (const wxa of [sx, sx + winW + w * 0.26]) {
          poly(ctx, [[wxa, baseY - 8], [wxa, baseY - 36], [wxa + winW, baseY - 36], [wxa + winW, baseY - 8]], r,
            { width: 1.7, alpha: 0.85 });
          windows.push({ x: wxa, y: baseY - 36, w: winW, h: 28 });
          line(ctx, wxa + winW / 2, baseY - 36, wxa + winW / 2, baseY - 8, r,
            { width: 1, alpha: 0.45, passes: 1 }, 2);
          line(ctx, wxa, baseY - 22, wxa + winW, baseY - 22, r, { width: 1, alpha: 0.45, passes: 1 }, 2);
          // small wares on the sill
          for (let g = 0; g < 3; g++) {
            scribbleCircle(ctx, wxa + 4 + g * (winW / 3), baseY - 12, 2, r, { width: 0.9, alpha: 0.5 });
          }
        }
        const dx0 = sx + winW + w * 0.04;
        fillPoly(ctx, [[dx0, baseY - 2], [dx0, baseY - 34], [dx0 + w * 0.16, baseY - 34], [dx0 + w * 0.16, baseY - 2]],
          '#6f4f34', 0.5);
        stroke(ctx, [[dx0, baseY - 2], [dx0, baseY - 30], [dx0 + w * 0.08, baseY - 36],
          [dx0 + w * 0.16, baseY - 30], [dx0 + w * 0.16, baseY - 2]], r, { width: 1.7, alpha: 0.85 });
        // the hanging sign on its bracket
        const bx = Math.min(x1 - 24, sx + winW * 2 + w * 0.32);
        line(ctx, bx, baseY - 58, bx + 16, baseY - 56, r, { width: 1.8, alpha: 0.85 });
        line(ctx, bx + 13, baseY - 56, bx + 13, baseY - 48, r, { width: 1.1, alpha: 0.7, passes: 1 }, 2);
        poly(ctx, [[bx + 5, baseY - 48], [bx + 21, baseY - 48], [bx + 21, baseY - 34], [bx + 5, baseY - 34]], r,
          { width: 1.5, alpha: 0.85 });
        // the sign's device: a pretzel, a boot, or a fish
        const dev = Math.floor(r() * 3);
        if (dev === 0) scribbleCircle(ctx, bx + 13, baseY - 41, 4.5, r, { width: 1.3, alpha: 0.7 }, 1.8);
        else if (dev === 1) stroke(ctx, [[bx + 9, baseY - 44], [bx + 10, baseY - 38], [bx + 17, baseY - 37]], r, { width: 1.6, alpha: 0.7 });
        else stroke(ctx, [[bx + 8, baseY - 41], [bx + 14, baseY - 44], [bx + 18, baseY - 41], [bx + 14, baseY - 38], [bx + 8, baseY - 41]], r, { width: 1.2, alpha: 0.7, passes: 1 });
      } else {
        const dx = x0 + w * (0.3 + r() * 0.3);
        fillPoly(ctx, [[dx, baseY - 2], [dx, baseY - 36], [dx + 17, baseY - 36], [dx + 17, baseY - 2]],
          '#6f4f34', 0.5);
        stroke(ctx, [[dx, baseY - 2], [dx, baseY - 30], [dx + 8, baseY - 38], [dx + 17, baseY - 30], [dx + 17, baseY - 2]],
          r, { width: 1.7, alpha: 0.85 });
        // a small ground-floor window beside the door
        const gx = dx + (r() > 0.5 ? 24 : -22);
        if (gx > x0 + 4 && gx + 14 < x1 - 4) {
          poly(ctx, [[gx, baseY - 16], [gx, baseY - 32], [gx + 14, baseY - 32], [gx + 14, baseY - 16]], r,
            { width: 1.4, alpha: 0.8 });
          windows.push({ x: gx, y: baseY - 32, w: 14, h: 16 });
          line(ctx, gx + 7, baseY - 32, gx + 7, baseY - 16, r, { width: 0.9, alpha: 0.4, passes: 1 }, 2);
        }
      }

      // the roof: front gables and long side ridges MIXED, so the row
      // never saws into a tent camp (critique #1's haystack lesson,
      // and #2 round 1's tents)
      const sideGabled = r() > 0.52;
      let ridgeX: number;
      let ridgeY: number;
      if (sideGabled) {
        // a long horizontal ridge: the roof reads as a slab, not a tooth
        ridgeY = eaveY - 16 - r() * 12;
        const rx0 = x0 - jet + 8 + lean;
        const rx1 = x1 + jet - 8 + lean;
        ridgeX = (rx0 + rx1) / 2;
        fillPoly(ctx, [[x0 - jet - 2 + lean, eaveY + 1], [rx0, ridgeY], [rx1, ridgeY],
          [x1 + jet + 2 + lean, eaveY + 1]], SLATE, 0.42);
        line(ctx, x0 - jet - 2 + lean, eaveY + 1, rx0, ridgeY, r, { width: 2.3, alpha: 0.88, jitter: 0.9 }, 3);
        line(ctx, rx0, ridgeY, rx1, ridgeY + (r() - 0.5) * 3, r, { width: 2.3, alpha: 0.88, jitter: 0.9 }, 4);
        line(ctx, rx1, ridgeY, x1 + jet + 2 + lean, eaveY + 1, r, { width: 2.3, alpha: 0.88, jitter: 0.9 }, 3);
        // slate courses following the eave
        for (let k = 1; k < 3; k++) {
          const t = k / 3;
          line(ctx, x0 - jet + 4 + lean, eaveY - (eaveY - ridgeY) * t,
            x1 + jet - 4 + lean, eaveY - (eaveY - ridgeY) * t + (r() - 0.5) * 3, r,
            { width: 0.9, alpha: 0.2, passes: 1 }, 3);
        }
        // sometimes a little dormer breaks the slab
        if (r() > 0.55) {
          const dx = x0 + w * (0.3 + r() * 0.4);
          poly(ctx, [[dx, eaveY - 2], [dx + 3, ridgeY + 4], [dx + 15, ridgeY + 4], [dx + 18, eaveY - 2]], r,
            { width: 1.4, alpha: 0.7 });
          poly(ctx, [[dx + 5, eaveY - 6], [dx + 5, ridgeY + 8], [dx + 13, ridgeY + 8], [dx + 13, eaveY - 6]], r,
            { width: 1, alpha: 0.55, passes: 1 });
        }
      } else {
        ridgeX = x0 + lean + w * (0.34 + r() * 0.32);
        ridgeY = eaveY - 26 - r() * 26;
        fillPoly(ctx, [[x0 - jet - 2 + lean, eaveY + 1], [ridgeX, ridgeY], [x1 + jet + 2 + lean, eaveY + 1]],
          SLATE, 0.42);
        line(ctx, x0 - jet - 2 + lean, eaveY + 1, ridgeX, ridgeY, r, { width: 2.3, alpha: 0.88, jitter: 0.9 }, 3);
        line(ctx, ridgeX, ridgeY, x1 + jet + 2 + lean, eaveY + 1, r, { width: 2.3, alpha: 0.88, jitter: 0.9 }, 3);
        // slate courses on the shade pitch
        for (let k = 1; k < 3; k++) {
          const t = k / 3;
          line(ctx, x0 - jet + lean + (ridgeX - x0 + jet - lean) * t * 0.9, eaveY - (eaveY - ridgeY) * t,
            ridgeX - 2, ridgeY + (eaveY - ridgeY) * (1 - t) * 0.25 + 6 * k, r,
            { width: 0.9, alpha: 0.22, passes: 1 }, 3);
        }
        hatch(ctx, x0 - jet + 2 + lean, ridgeY + (eaveY - ridgeY) * 0.4,
          Math.max(12, ridgeX - x0), (eaveY - ridgeY) * 0.55, 0.8, 6, r, { alpha: 0.1 });
      }

      // a chimney off the ridge, sometimes smoking in pencil
      if (r() > 0.35) {
        const cx = sideGabled
          ? x0 + lean + w * (r() > 0.5 ? 0.16 : 0.84)
          : ridgeX + (r() - 0.5) * w * 0.3;
        const ct = ridgeY - 14 - r() * 8;
        poly(ctx, [[cx, ridgeY + 8], [cx + 1, ct], [cx + 9, ct], [cx + 9, ridgeY + 10]], r,
          { width: 1.6, alpha: 0.85 });
        line(ctx, cx - 1, ct + 3, cx + 11, ct + 3, r, { width: 1.3, alpha: 0.7 }, 2);
        if (r() > 0.5) {
          stroke(ctx, [[cx + 5, ct - 4], [cx + 2, ct - 16], [cx + 9, ct - 30], [cx + 4, ct - 42]], r,
            { width: 1.2, alpha: 0.26, passes: 1, color: PENCIL });
        }
      }
    }
  });
  ROW_WINDOWS.set(seed, windows);
  return tex;
}

/**
 * THE SAME ROW, AFTER DARK — only the windows that are lit.
 *
 * Hung a hair in front of its own terrace and faded up by
 * `daylight.clock.lamp`, so a street at nine at night is the street it
 * was at noon with the lights on in it. Never all of them: a run where
 * every window is lit is a run nobody lives in, and the two-thirds that
 * are on is the number that makes the other third read as somebody
 * being out rather than as a gap.
 *
 * A lit window on paper is not a hole in the page. It is the sheet's
 * own white with a wash of flame over it and the spill drawn round it,
 * which is what a hand would do and the only thing a hand could do.
 */
export function townRowLitTexture(seed: number): THREE.CanvasTexture {
  const wins = ROW_WINDOWS.get(seed) ?? [];
  return makeTexture(512, 288, seed * 7 + 13, (ctx, r) => {
    for (const win of wins) {
      if (r() < 0.34) continue; // dark: somebody is out, or asleep
      const { x, y, w, h } = win;
      // the spill first, so the pane sits on top of its own glow
      const g = ctx.createRadialGradient(x + w / 2, y + h / 2, 1,
        x + w / 2, y + h / 2, Math.max(w, h) * 1.9);
      g.addColorStop(0, 'rgba(255,222,168,0.52)');
      g.addColorStop(1, 'rgba(255,222,168,0)');
      ctx.fillStyle = g;
      ctx.fillRect(x - w * 2, y - h * 2, w * 5, h * 5);
      // the paper's own white, then the flame over it
      ctx.save();
      ctx.globalAlpha = 0.88;
      ctx.fillStyle = '#fbf8ee';
      ctx.fillRect(x + 1, y + 1, w - 2, h - 2);
      ctx.globalAlpha = 0.62 + r() * 0.2;
      ctx.fillStyle = '#ffcf88';
      ctx.fillRect(x + 1, y + 1, w - 2, h - 2);
      ctx.restore();
      // and the shape of whatever is standing in the way of it
      if (r() > 0.6) {
        ctx.save();
        ctx.globalAlpha = 0.30;
        ctx.fillStyle = INK;
        const bw = w * (0.2 + r() * 0.16);
        ctx.fillRect(x + w * (0.2 + r() * 0.4), y + h * 0.35, bw, h * 0.65);
        ctx.restore();
      }
    }
  });
}

/**
 * THE SHUTTERS (Session 17): the same recorded casements with a pair of
 * dark shutters pulled to over each, which is the town's face from nine
 * at night until first light. Hung a hair in front of the row, exactly
 * as the lit panes are, and for the same reason.
 */
export function townRowShutTexture(seed: number): THREE.CanvasTexture {
  const wins = ROW_WINDOWS.get(seed) ?? [];
  return makeTexture(512, 288, seed * 11 + 5, (ctx, r) => {
    for (const win of wins) {
      if (r() < 0.2) continue; // one left open: somebody is still up
      const { x, y, w, h } = win;
      for (const side of [0, 1]) {
        const sx = x + side * (w / 2);
        ctx.save();
        ctx.globalAlpha = 0.72;
        ctx.fillStyle = '#5a4a3a';
        ctx.fillRect(sx + 1, y + 1, w / 2 - 2, h - 2);
        ctx.restore();
        line(ctx, sx + 1, y + 1, sx + 1, y + h - 1, r, { width: 1.2, alpha: 0.7, passes: 1 }, 2);
        line(ctx, sx + w / 2 - 1, y + 1, sx + w / 2 - 1, y + h - 1, r, { width: 1.2, alpha: 0.7, passes: 1 }, 2);
        for (let yy = y + 4; yy < y + h - 2; yy += 4) {
          line(ctx, sx + 2, yy, sx + w / 2 - 2, yy + 0.5, r, { width: 0.8, alpha: 0.35, passes: 1 }, 2);
        }
      }
    }
  });
}

/**
 * The belfry at full pressure — the pale Session 2 stand-in made real:
 * stone tower, clock scratch, bell arch with its bell, steep cap, and
 * the chapel gable leaning against its foot.
 */
export function brimBelfryTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(224, 448, seed, (ctx, r) => {
    // chapel gable at the foot, first, so the tower overlaps it
    fillPoly(ctx, [[118, 440], [120, 350], [204, 350], [206, 440]], PLASTER, 0.5);
    poly(ctx, [[118, 440], [120, 350], [204, 350], [206, 440]], r, { width: 2.2, alpha: 0.88 });
    fillPoly(ctx, [[112, 352], [162, 306], [212, 352]], SLATE, 0.42);
    line(ctx, 112, 352, 162, 306, r, { width: 2.2, alpha: 0.88, jitter: 0.9 }, 3);
    line(ctx, 162, 306, 212, 352, r, { width: 2.2, alpha: 0.88, jitter: 0.9 }, 3);
    // the chapel's arched window
    stroke(ctx, [[152, 420], [152, 384], [162, 372], [172, 384], [172, 420]], r, { width: 1.8, alpha: 0.85 });
    line(ctx, 162, 374, 162, 420, r, { width: 0.9, alpha: 0.4, passes: 1 });
    hatch(ctx, 154, 386, 17, 32, 1.2, 4.5, r, { alpha: 0.2 });

    // the tower
    fillPoly(ctx, [[54, 440], [62, 118], [130, 118], [138, 440]], WASH.castle, 0.52);
    stroke(ctx, [[54, 440], [62, 118]], r, { width: 2.6, alpha: 0.9 });
    stroke(ctx, [[138, 440], [130, 118]], r, { width: 2.6, alpha: 0.9 });
    // quoins up the corners
    for (let k = 0; k < 7; k++) {
      const y = 150 + k * 42;
      line(ctx, 60 - k * 0.3, y, 70 - k * 0.3, y - 1, r, { width: 1.2, alpha: 0.35, passes: 1 }, 2);
      line(ctx, 123 + k * 0.3, y + 20, 133 + k * 0.3, y + 19, r, { width: 1.2, alpha: 0.35, passes: 1 }, 2);
    }
    // string courses
    line(ctx, 60, 262, 132, 260, r, { width: 1.4, alpha: 0.45, passes: 1 });
    line(ctx, 58, 350, 134, 348, r, { width: 1.4, alpha: 0.45, passes: 1 });
    /* THE CLOCK: a scratched circle with two hands that disagree, and
     * from Session 7 they disagree about something SPECIFIC.
     *
     * They are stopped, and a stopped clock is right twice a day. One
     * of these two points at eight, which is the hour Brim's lamps
     * actually come on (`daylight.ts`); the other points at eleven and
     * is simply wrong. Nobody in this town can tell which, because
     * nobody in this town has anything to check a clock against — but
     * the walker has watched the light go all the way round, and can
     * stand in this yard while the lamps are lit and see that one of
     * the two hands agrees with them.
     *
     * That is the whole of Brim's wait (design/THE-WAITS.md §2) and it
     * is two lines of geometry. Do not "fix" these angles. */
    scribbleCircle(ctx, 96, 300, 17, r, { width: 1.8, alpha: 0.8 }, 1.1);
    // eight o'clock: down and to the left, and it is the right one
    line(ctx, 96, 300, 96 - 12.1, 300 + 7.0, r, { width: 1.7, alpha: 0.82, passes: 1 }, 2);
    // eleven: up and to the left, and it has never given ground
    line(ctx, 96, 300, 96 - 7.0, 300 - 12.1, r, { width: 1.4, alpha: 0.72, passes: 1 }, 2);
    // the bell stage: paired arches, the bell a dark bulb in the left
    for (const bx of [72, 104]) {
      stroke(ctx, [[bx, 220], [bx, 172], [bx + 8, 160], [bx + 16, 172], [bx + 16, 220]], r,
        { width: 2, alpha: 0.85 });
      hatch(ctx, bx + 2, 174, 13, 42, 1.2, 4.5, r, { alpha: 0.22 });
    }
    ctx.globalAlpha = 0.75;
    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.arc(80, 196, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    line(ctx, 80, 189, 80, 176, r, { width: 1.4, alpha: 0.7, passes: 1 }, 2);
    // battlemented crown then the steep cap
    line(ctx, 52, 120, 140, 117, r, { width: 2.2, alpha: 0.88 });
    for (let x = 58; x < 130; x += 20) {
      poly(ctx, [[x, 117], [x, 102], [x + 12, 102], [x + 12, 117]], r, { width: 1.5, alpha: 0.8 });
    }
    fillPoly(ctx, [[52, 104], [96, 26], [140, 104]], SLATE, 0.4);
    line(ctx, 52, 104, 96, 26, r, { width: 2.2, alpha: 0.88, jitter: 0.8 }, 3);
    line(ctx, 96, 26, 140, 104, r, { width: 2.2, alpha: 0.88, jitter: 0.8 }, 3);
    line(ctx, 96, 26, 96, 8, r, { width: 1.6, alpha: 0.85, passes: 1 });
    // the weathercock, mid-turn
    stroke(ctx, [[90, 12], [102, 10]], r, { width: 1.3, alpha: 0.7, passes: 1 });
    stroke(ctx, [[96, 10], [101, 5], [104, 9]], r, { width: 1.2, alpha: 0.7, passes: 1 });
    // masonry hints
    for (let i = 0; i < 14; i++) {
      const x = 64 + r() * 60;
      const y = 130 + r() * 290;
      line(ctx, x, y, x + 11 + r() * 8, y + (r() - 0.5) * 3, r, { width: 0.9, alpha: 0.25, passes: 1 });
    }
    hatch(ctx, 58, 390, 30, 44, 1.1, 7, r, { alpha: 0.14 });
  });
}

/**
 * A market stall worth stopping at. Variant 0 is the red-striped one —
 * the square's accent; 1 is blue; 2 is plain canvas gone grey.
 */
export function brimStallTexture(seed: number, variant: 0 | 1 | 2): THREE.CanvasTexture {
  const awn = [RED, '#4a7ab0', '#c8bda2'][variant];
  return makeTexture(192, 176, seed, (ctx, r) => {
    const lean = (r() - 0.5) * 6;
    // posts
    line(ctx, 30, 168, 32 + lean, 62, r, { width: 2.6, alpha: 0.9 });
    line(ctx, 162, 168, 160 + lean, 60, r, { width: 2.6, alpha: 0.9 });
    // awning: canvas first, then stripes, then the scalloped hem
    fillPoly(ctx, [[16, 64], [96 + lean, 38], [176, 62], [176, 84], [16, 86]], CREAM, 0.6);
    if (variant < 2) {
      ctx.globalAlpha = 0.55;
      ctx.fillStyle = awn;
      for (let i = 0; i < 4; i++) {
        const x0 = 24 + i * 40;
        ctx.beginPath();
        ctx.moveTo(x0, 84);
        ctx.lineTo(x0 + 8 + lean * 0.4, 52 - (Math.abs(x0 + 10 - 96) < 40 ? 8 : 2));
        ctx.lineTo(x0 + 26 + lean * 0.4, 50 - (Math.abs(x0 + 26 - 96) < 40 ? 8 : 2));
        ctx.lineTo(x0 + 18, 84);
        ctx.closePath();
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    } else {
      hatch(ctx, 24, 52, 140, 28, 0.15, 8, r, { alpha: 0.08 });
    }
    stroke(ctx, [[16, 64], [96 + lean, 40], [176, 62]], r, { width: 2.2, alpha: 0.9 });
    for (let i = 0; i < 5; i++) {
      const x0 = 16 + i * 32;
      stroke(ctx, [[x0, 82], [x0 + 16, 92], [x0 + 32, 82]], r, { width: 1.8, alpha: 0.85, passes: 1 });
    }
    // counter with goods: baskets, a hung string of onions
    fillPoly(ctx, [[24, 164], [26, 118], [166, 116], [168, 164]], '#c9a06a', 0.42);
    poly(ctx, [[24, 164], [26, 118], [166, 116], [168, 164]], r, { width: 2, alpha: 0.9 });
    for (let x = 40; x < 160; x += 24) {
      line(ctx, x, 120, x - 1, 162, r, { width: 0.9, alpha: 0.28, passes: 1 });
    }
    // two baskets of round goods
    for (const bx of [56, 116]) {
      stroke(ctx, [[bx - 16, 116], [bx - 12, 100], [bx + 12, 100], [bx + 16, 116]], r,
        { width: 1.6, alpha: 0.8 });
      line(ctx, bx - 13, 106, bx + 13, 105, r, { width: 0.9, alpha: 0.4, passes: 1 });
      ctx.globalAlpha = 0.55;
      ctx.fillStyle = variant === 0 ? RED : '#c99a3b';
      for (let g = 0; g < 4; g++) {
        ctx.beginPath();
        ctx.arc(bx - 8 + g * 5.5 + (r() - 0.5) * 3, 98 + (r() - 0.5) * 3, 3.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    // the onion string off the post
    stroke(ctx, [[160 + lean, 66], [158, 84], [159, 100]], r, { width: 1, alpha: 0.6, passes: 1 });
    for (let g = 0; g < 3; g++) {
      scribbleCircle(ctx, 158 + (r() - 0.5) * 3, 76 + g * 11, 3.4, r, { width: 1, alpha: 0.55 });
    }
    // a barrel resting against the other post
    stroke(ctx, [[8, 166], [10, 132], [34, 132], [36, 166]], r, { width: 1.8, alpha: 0.85 });
    stroke(ctx, [[9, 140], [35, 140]], r, { width: 1.1, alpha: 0.5, passes: 1 });
    stroke(ctx, [[8, 156], [36, 156]], r, { width: 1.1, alpha: 0.5, passes: 1 });
  });
}

/** The fountain of Brim, two tiers, running since the town was six lines old. */
export function brimFountainTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(256, 256, seed, (ctx, r) => {
    const BLUE_W = '#4a7ab0';
    // the basin: low octagon-ish ring
    fillPoly(ctx, [[30, 244], [24, 196], [58, 188], [198, 186], [232, 194], [226, 244]], WASH.castle, 0.5);
    stroke(ctx, [[30, 244], [24, 196], [58, 188], [198, 186], [232, 194], [226, 244]], r,
      { width: 2.4, alpha: 0.9 });
    line(ctx, 30, 242, 226, 240, r, { width: 2, alpha: 0.8 });
    // coping stones
    for (let x = 34; x < 224; x += 26 + r() * 10) {
      line(ctx, x, 192 + (r() - 0.5) * 3, x, 200 + (r() - 0.5) * 3, r, { width: 1.1, alpha: 0.35, passes: 1 }, 2);
    }
    // water line in the basin, busy
    stroke(ctx, [[36, 208], [80, 204], [130, 207], [180, 203], [220, 206]], r,
      { width: 1.5, alpha: 0.55, passes: 1, color: BLUE_W });
    stroke(ctx, [[48, 216], [96, 213], [150, 216], [206, 212]], r,
      { width: 1.1, alpha: 0.4, passes: 1, color: BLUE_W });
    // the column and the upper bowl
    line(ctx, 126, 190, 127, 118, r, { width: 3.6, alpha: 0.88 });
    line(ctx, 134, 190, 133, 118, r, { width: 2.6, alpha: 0.8 });
    stroke(ctx, [[86, 112], [102, 124], [130, 128], [158, 123], [174, 110]], r, { width: 2.2, alpha: 0.88 });
    stroke(ctx, [[86, 112], [94, 104], [130, 100], [166, 103], [174, 110]], r, { width: 1.8, alpha: 0.8 });
    // the finial: a small worn beast, posture only
    stroke(ctx, [[122, 98], [120, 76], [128, 66], [138, 70], [136, 84], [130, 98]], r, { width: 1.8, alpha: 0.85 });
    stroke(ctx, [[128, 66], [134, 58], [140, 60]], r, { width: 1.4, alpha: 0.75, passes: 1 });
    // water: arcs from the beast's mouth and the bowl's lip
    for (const [sx, sy, ex] of [[140, 62, 176], [92, 116, 66], [166, 114, 196]] as [number, number, number][]) {
      stroke(ctx, [[sx, sy], [(sx + ex) / 2 + 6, sy + 40], [ex, 196]], r,
        { width: 1.4, alpha: 0.55, passes: 1, color: BLUE_W });
      stroke(ctx, [[sx, sy + 3], [(sx + ex) / 2 + 2, sy + 46], [ex - 6, 198]], r,
        { width: 1, alpha: 0.35, passes: 1, color: BLUE_W });
    }
    // splash ticks where the arcs land
    for (const lx of [66, 176, 196]) {
      line(ctx, lx - 5, 202, lx - 9, 197, r, { width: 1, alpha: 0.45, passes: 1, color: BLUE_W }, 2);
      line(ctx, lx + 4, 202, lx + 8, 196, r, { width: 1, alpha: 0.45, passes: 1, color: BLUE_W }, 2);
    }
    // damp on the shaded basin side
    hatch(ctx, 32, 220, 60, 20, 0.9, 6, r, { alpha: 0.14 });
  });
}

/** The market cross: steps, column, ringed head, one resident pigeon. */
export function marketCrossTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(128, 224, seed, (ctx, r) => {
    // three worn steps
    fillPoly(ctx, [[18, 216], [22, 196], [106, 194], [110, 216]], WASH.castle, 0.5);
    poly(ctx, [[18, 216], [22, 196], [106, 194], [110, 216]], r, { width: 2, alpha: 0.88 });
    fillPoly(ctx, [[34, 196], [36, 180], [92, 179], [94, 195]], WASH.castle, 0.45);
    poly(ctx, [[34, 196], [36, 180], [92, 179], [94, 195]], r, { width: 1.8, alpha: 0.85 });
    // the column, tapering
    stroke(ctx, [[58, 180], [60, 96], [61, 70]], r, { width: 2.6, alpha: 0.9 });
    stroke(ctx, [[70, 180], [67, 96], [66, 70]], r, { width: 2.2, alpha: 0.85 });
    line(ctx, 56, 174, 72, 173, r, { width: 1.4, alpha: 0.5, passes: 1 }, 2);
    // the ringed cross head
    scribbleCircle(ctx, 64, 52, 17, r, { width: 2, alpha: 0.85 }, 1.1);
    line(ctx, 64, 34, 64, 70, r, { width: 2.2, alpha: 0.85 });
    line(ctx, 46, 52, 82, 51, r, { width: 2.2, alpha: 0.85 });
    // the pigeon who owns it
    fillBlob(ctx, 84, 30, 6, r, PENCIL, 0.4, 0.8);
    stroke(ctx, [[78, 32], [84, 26], [92, 29]], r, { width: 1.4, alpha: 0.7, passes: 1 });
    line(ctx, 90, 28, 95, 26, r, { width: 1.1, alpha: 0.6, passes: 1 }, 2);
    line(ctx, 84, 35, 84, 39, r, { width: 1, alpha: 0.6, passes: 1 }, 2);
    // a step chipped at one corner
    stroke(ctx, [[100, 208], [106, 204], [108, 210]], r, { width: 1.2, alpha: 0.5, passes: 1 });
    hatch(ctx, 24, 200, 30, 14, 0.9, 5, r, { alpha: 0.13 });
  });
}

/**
 * A string of bunting sagging between two ends — hung between the
 * square's lamp posts. Flag colors alternate red and cream; the sag
 * is drawn, the sway is the region update's.
 */
export function buntingTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(384, 96, seed, (ctx, r) => {
    // the catenary string
    const pts: [number, number][] = [];
    for (let i = 0; i <= 12; i++) {
      const t = i / 12;
      pts.push([8 + t * 368, 12 + Math.sin(t * Math.PI) * 26 + (r() - 0.5) * 2]);
    }
    stroke(ctx, pts, r, { width: 1.3, alpha: 0.75, passes: 1 });
    // flags hang from it, each at its own slight angle
    for (let i = 0; i < 9; i++) {
      const t = (i + 0.7) / 10;
      const x = 8 + t * 368;
      const y = 12 + Math.sin(t * Math.PI) * 26;
      const sway = (r() - 0.5) * 8;
      const red = i % 2 === (seed % 2);
      fillPoly(ctx, [[x - 9, y + 1], [x + 9, y + 1], [x + sway, y + 26]], red ? RED : CREAM,
        red ? 0.72 : 0.85);
      stroke(ctx, [[x - 9, y + 1], [x + sway, y + 26], [x + 9, y + 1]], r,
        { width: 1.1, alpha: 0.6, passes: 1 });
    }
  });
}

/**
 * The back streets, pale: a run of roofs seen past the front terraces.
 * Long horizontal ridges with chimneys, at most ONE gable per run —
 * the failing-pressure register without the tent-picket the Session 2
 * vista texture turns into at this range.
 */
export function backStreetTexture(seed: number, w = 512, h = 160): THREE.CanvasTexture {
  return makeTexture(w, h, seed, (ctx, r) => {
    const la = 0.48;
    const baseY = h - 6;
    let x = 6;
    let gableUsed = false;
    while (x < w - 70) {
      const runW = 90 + r() * 110;
      const wallH = 16 + r() * 12;
      const eaveY = baseY - wallH;
      const ridgeY = eaveY - 18 - r() * 12;
      const rx0 = x + 10 + r() * 8;
      const rx1 = Math.min(x + runW - 10, w - 10);
      // the wall face under the roof
      fillPoly(ctx, [[x + 2, baseY], [x + 2, eaveY], [rx1 + 8, eaveY], [rx1 + 8, baseY]],
        WASH.kingdom, 0.28);
      line(ctx, x + 2, eaveY + 1, rx1 + 8, eaveY, r, { width: 1.1, alpha: la * 0.7, passes: 1 });
      // the long roof: two hips and a ridge
      fillPoly(ctx, [[x - 2, eaveY], [rx0, ridgeY], [rx1, ridgeY], [rx1 + 10, eaveY]], '#8d8a84', 0.28);
      line(ctx, x - 2, eaveY, rx0, ridgeY, r, { width: 1.5, alpha: la, jitter: 0.8 }, 3);
      line(ctx, rx0, ridgeY, rx1, ridgeY + (r() - 0.5) * 3, r, { width: 1.5, alpha: la, jitter: 0.8 }, 4);
      line(ctx, rx1, ridgeY, rx1 + 10, eaveY, r, { width: 1.5, alpha: la, jitter: 0.8 }, 3);
      // one gable allowed per drawing, breaking one run's ridge
      if (!gableUsed && r() > 0.55) {
        gableUsed = true;
        const gx = x + runW * (0.3 + r() * 0.3);
        const gTop = ridgeY - 8 - r() * 8;
        fillPoly(ctx, [[gx - 14, eaveY], [gx, gTop], [gx + 14, eaveY]], '#8d8a84', 0.3);
        line(ctx, gx - 14, eaveY, gx, gTop, r, { width: 1.4, alpha: la, jitter: 0.8 }, 3);
        line(ctx, gx, gTop, gx + 14, eaveY, r, { width: 1.4, alpha: la, jitter: 0.8 }, 3);
      }
      // chimneys along the ridge, one smoking
      const chimneys = 1 + Math.floor(r() * 2);
      for (let c = 0; c < chimneys; c++) {
        const cx = rx0 + (rx1 - rx0) * (0.2 + r() * 0.6);
        const ct = ridgeY - 9 - r() * 6;
        poly(ctx, [[cx, ridgeY + 4], [cx, ct], [cx + 5, ct], [cx + 5, ridgeY + 5]], r,
          { width: 1, alpha: la * 0.9 });
        if (r() > 0.6) {
          stroke(ctx, [[cx + 2, ct - 3], [cx, ct - 12], [cx + 6, ct - 22]], r,
            { width: 1, alpha: 0.2, passes: 1, color: PENCIL });
        }
      }
      // a window tick or two, nothing more at this range
      if (r() > 0.5) {
        const wx = x + 14 + r() * (runW - 30);
        poly(ctx, [[wx, baseY - 4], [wx, baseY - 11], [wx + 6, baseY - 11], [wx + 6, baseY - 4]], r,
          { width: 0.9, alpha: 0.28, passes: 1 });
      }
      x += runW * (0.9 + r() * 0.25);
    }
  });
}

/**
 * Wear on stone: the grey polish of feet and cartwheels, for the
 * bailey and the town's stone floors. The tan wornGroundDecal is
 * earth and reads as a spill on a grey wash.
 */
export function stoneWearDecal(seed: number, warm = false): THREE.CanvasTexture {
  return makeTexture(192, 192, seed, (ctx, r) => {
    const tone = warm ? '150,140,120' : '118,120,126';
    for (let i = 0; i < 4; i++) {
      const bx = 96 + (r() - 0.5) * 44;
      const by = 96 + (r() - 0.5) * 40;
      const rad = 40 + r() * 32;
      const g = ctx.createRadialGradient(bx, by, 2, bx, by, rad);
      g.addColorStop(0, `rgba(${tone},0.20)`);
      g.addColorStop(0.7, `rgba(${tone},0.10)`);
      g.addColorStop(1, `rgba(${tone},0)`);
      ctx.fillStyle = g;
      ctx.fillRect(bx - rad, by - rad, rad * 2, rad * 2);
    }
    // flag joints half-erased by feet
    for (let i = 0; i < 6; i++) {
      const x = 30 + r() * 130;
      const y = 30 + r() * 130;
      line(ctx, x, y, x + 16 + r() * 14, y + (r() - 0.5) * 6, r,
        { width: 0.9, alpha: 0.12 + r() * 0.08, passes: 1 });
      if (r() > 0.5) {
        line(ctx, x + 6, y - 8 - r() * 8, x + 7, y + 6, r,
          { width: 0.9, alpha: 0.1 + r() * 0.06, passes: 1 }, 2);
      }
    }
    // scuff stipple
    ctx.fillStyle = INK;
    for (let i = 0; i < 40; i++) {
      const a = r() * Math.PI * 2;
      const d = Math.pow(r(), 0.6) * 70;
      ctx.globalAlpha = 0.06 + r() * 0.1;
      ctx.beginPath();
      ctx.arc(96 + Math.cos(a) * d, 96 + Math.sin(a) * d * 0.92, 0.8 + r() * 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  });
}

/** Market clutter: a barrel and two crates that live behind a stall. */
export function crateBarrelTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(160, 112, seed, (ctx, r) => {
    // the barrel
    fillPoly(ctx, [[16, 104], [14, 58], [52, 58], [50, 104]], '#a08050', 0.4);
    stroke(ctx, [[16, 104], [12, 80], [14, 58]], r, { width: 1.8, alpha: 0.85 });
    stroke(ctx, [[50, 104], [54, 80], [52, 58]], r, { width: 1.8, alpha: 0.85 });
    stroke(ctx, [[14, 58], [33, 54], [52, 58]], r, { width: 1.6, alpha: 0.8 });
    stroke(ctx, [[16, 104], [33, 108], [50, 104]], r, { width: 1.6, alpha: 0.8 });
    stroke(ctx, [[13, 70], [33, 66], [53, 70]], r, { width: 1.1, alpha: 0.5, passes: 1 });
    stroke(ctx, [[13, 92], [33, 96], [53, 92]], r, { width: 1.1, alpha: 0.5, passes: 1 });
    // two crates, one askew on the other
    fillPoly(ctx, [[66, 104], [66, 68], [126, 68], [126, 104]], '#c9a06a', 0.35);
    poly(ctx, [[66, 104], [66, 68], [126, 68], [126, 104]], r, { width: 1.8, alpha: 0.85 });
    line(ctx, 66, 86, 126, 85, r, { width: 1, alpha: 0.4, passes: 1 });
    line(ctx, 96, 68, 96, 104, r, { width: 1, alpha: 0.4, passes: 1 });
    fillPoly(ctx, [[74, 66], [78, 38], [122, 40], [120, 68]], '#c9a06a', 0.32);
    poly(ctx, [[74, 66], [78, 38], [122, 40], [120, 68]], r, { width: 1.7, alpha: 0.82 });
    line(ctx, 76, 52, 121, 54, r, { width: 1, alpha: 0.4, passes: 1 });
    // straw poking from the top crate
    for (let i = 0; i < 4; i++) {
      line(ctx, 84 + r() * 30, 40, 88 + r() * 30, 32 - r() * 6, r,
        { width: 0.9, alpha: 0.4, passes: 1, color: '#8a6f3a' }, 2);
    }
  });
}

/**
 * An orchard apple tree. form 0 the round one, 1 the leaning one,
 * 2 the young one still learning the job.
 */
export function appleTreeTexture(seed: number, form: 0 | 1 | 2): THREE.CanvasTexture {
  return makeTexture(192, 208, seed, (ctx, r) => {
    const lean = form === 1 ? 22 : 0;
    const scale = form === 2 ? 0.68 : 1;
    const topX = 96 + lean;
    const canR = 58 * scale;
    const canY = 102 + (1 - scale) * 34;
    // canopy stain: soft overlapping damp, never one hard polygon —
    // and NO interior rings (they read as wire hoops through the
    // leaves, critique #1's soap bubbles all over again). The mass is
    // stain; the pen only says where its edge lumps.
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 + r();
      const d = canR * 0.3 * r();
      const bx = topX + Math.cos(a) * d;
      const by = canY + Math.sin(a) * d * 0.7;
      const rad = canR * (0.6 + r() * 0.32);
      const g = ctx.createRadialGradient(bx, by, rad * 0.2, bx, by, rad);
      g.addColorStop(0, 'rgba(147,163,137,0.34)');
      g.addColorStop(0.65, 'rgba(147,163,137,0.2)');
      g.addColorStop(1, 'rgba(147,163,137,0)');
      ctx.fillStyle = g;
      ctx.fillRect(bx - rad, by - rad, rad * 2, rad * 2);
    }
    // a broken, lumpy outer contour drawn in three or four open runs
    const lobes: [number, number][] = [];
    const steps = 15;
    for (let i = 0; i <= steps; i++) {
      const a = (i / steps) * Math.PI * 2 - Math.PI / 2;
      const rr = canR * (0.86 + Math.sin(a * 3 + seed) * 0.1 + r() * 0.12);
      lobes.push([topX + Math.cos(a) * rr, canY + Math.sin(a) * rr * 0.86]);
    }
    for (let s = 0; s < lobes.length - 1; s += 4) {
      stroke(ctx, lobes.slice(s, s + 5), r,
        { width: 1.7, alpha: 0.55 + r() * 0.15, jitter: 2.6, passes: 1 });
    }
    // leaf ticks INSIDE the mass, tiny — texture, not outlines
    for (let i = 0; i < 16; i++) {
      const a = r() * Math.PI * 2;
      const d = Math.pow(r(), 0.55) * canR * 0.82;
      const lx = topX + Math.cos(a) * d;
      const ly = canY + Math.sin(a) * d * 0.82;
      line(ctx, lx, ly, lx + 3 + r() * 4, ly - 2 - r() * 3, r,
        { width: 1, alpha: 0.2 + r() * 0.16, passes: 1 }, 2);
    }
    // the apples hang in CLUSTERS on the limbs, never as even measles
    ctx.fillStyle = RED;
    const bunches = 2 + Math.floor(r() * 2);
    for (let b = 0; b < bunches; b++) {
      const a = r() * Math.PI * 2;
      const d = (0.35 + r() * 0.45) * canR;
      const bx = topX + Math.cos(a) * d;
      const by = canY + Math.sin(a) * d * 0.8;
      for (let i = 0; i < 3 + Math.floor(r() * 3); i++) {
        ctx.globalAlpha = 0.5 + r() * 0.3;
        ctx.beginPath();
        ctx.arc(bx + (r() - 0.5) * 14, by + (r() - 0.5) * 12, 2.4 + r() * 0.8, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
    // ONE trunk, filled and tapering — two parallel strokes read as a
    // pair of stilts under a pom-pom (critique #2 r2/r3)
    const footX = 96 - lean * 0.3;
    const crotchY = canY + canR * 0.5;
    fillPoly(ctx, [
      [footX - 11, 204], [footX - 7, 172], [topX - 5, crotchY],
      [topX + 5, crotchY], [footX + 8, 174], [footX + 12, 204],
    ], '#6b5a48', 0.45);
    stroke(ctx, [[footX - 11, 204], [footX - 7, 172], [topX - 5, crotchY]], r,
      { width: 3.4, alpha: 0.9 });
    stroke(ctx, [[footX + 12, 204], [footX + 8, 174], [topX + 5, crotchY]], r,
      { width: 3, alpha: 0.86 });
    // the limbs forking up into the crown
    stroke(ctx, [[topX - 3, crotchY], [topX - 16, crotchY - 16], [topX - 24, crotchY - 30]], r,
      { width: 2.2, alpha: 0.72 });
    stroke(ctx, [[topX + 3, crotchY], [topX + 15, crotchY - 14], [topX + 26, crotchY - 28]], r,
      { width: 2, alpha: 0.7 });
    // bark grain hugging the trunk's own curve, and root flare
    stroke(ctx, [[footX - 3, 198], [footX - 2, 180], [topX - 2, crotchY + 6]], r,
      { width: 1, alpha: 0.24, passes: 1 });
    for (const dx of [-14, -4, 8, 15]) {
      stroke(ctx, [[footX + dx * 0.5, 196], [footX + dx, 204], [footX + dx * 1.3, 207]], r,
        { width: 2, alpha: 0.6, passes: 1 });
    }
    // one low branch with a prop under it on the old forms
    if (form !== 2) {
      stroke(ctx, [[topX + 2, canY + canR * 0.5], [topX + 26, canY + canR * 0.42], [topX + 40, canY + canR * 0.52]], r,
        { width: 2, alpha: 0.7 });
      if (form === 0) {
        line(ctx, topX + 38, canY + canR * 0.54, topX + 40, 200, r, { width: 1.6, alpha: 0.6, passes: 1 });
      }
    }
    hatch(ctx, topX - canR * 0.8, canY + canR * 0.3, canR * 0.9, canR * 0.45, 0.7, 6, r, { alpha: 0.14 });
    // windfalls at the foot
    for (let i = 0; i < 3; i++) {
      ctx.globalAlpha = 0.4;
      ctx.fillStyle = RED;
      ctx.beginPath();
      ctx.arc(80 + r() * 40, 198 + r() * 6, 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  });
}

/** A town pigeon, round and unbothered. */
export function pigeonTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(64, 48, seed, (ctx, r) => {
    fillBlob(ctx, 30, 26, 12, r, PENCIL, 0.35, 0.85);
    // body + head in one contented line
    stroke(ctx, [[14, 30], [16, 20], [28, 15], [40, 17], [45, 12], [50, 15], [48, 20], [42, 24], [40, 32], [26, 36], [16, 33]], r,
      { width: 1.6, alpha: 0.85, jitter: 0.9 });
    // folded wing
    stroke(ctx, [[22, 24], [34, 22], [41, 27]], r, { width: 1.2, alpha: 0.6, passes: 1 });
    // beak tick + legs
    line(ctx, 50, 15, 55, 16, r, { width: 1.1, alpha: 0.7, passes: 1 }, 2);
    line(ctx, 26, 36, 25, 43, r, { width: 1.1, alpha: 0.7, passes: 1 }, 2);
    line(ctx, 33, 35, 34, 43, r, { width: 1.1, alpha: 0.7, passes: 1 }, 2);
  });
}

/**
 * The Wood Gate: Brim's east door, one square tower over an arch,
 * built for carts of timber, ivy taking the north side.
 */
export function woodGateTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(288, 288, seed, (ctx, r) => {
    // the tower
    fillPoly(ctx, [[74, 280], [80, 74], [208, 74], [214, 280]], WASH.castle, 0.55);
    stroke(ctx, [[74, 280], [80, 74]], r, { width: 2.6, alpha: 0.9 });
    stroke(ctx, [[214, 280], [208, 74]], r, { width: 2.6, alpha: 0.9 });
    line(ctx, 76, 76, 212, 74, r, { width: 2.2, alpha: 0.85 });
    // battlements
    let x = 84;
    while (x < 200) {
      const mw = 16 + r() * 8;
      const mh = 17 + r() * 6;
      line(ctx, x, 74, x + 1, 74 - mh, r, { width: 1.6, alpha: 0.8, passes: 1, jitter: 0.7 }, 3);
      line(ctx, x + 1, 74 - mh, x + mw, 74 - mh - 1, r, { width: 1.6, alpha: 0.8, passes: 1, jitter: 0.7 }, 3);
      line(ctx, x + mw, 74 - mh - 1, x + mw + 1, 74, r, { width: 1.6, alpha: 0.8, passes: 1, jitter: 0.7 }, 3);
      x += mw + 9 + r() * 7;
    }
    // string course + slits
    line(ctx, 78, 148, 210, 146, r, { width: 1.3, alpha: 0.4, passes: 1 });
    line(ctx, 116, 100, 117, 126, r, { width: 2.8, alpha: 0.65 });
    line(ctx, 170, 104, 171, 128, r, { width: 2.8, alpha: 0.6 });
    // the arch, cut out, with its raised portcullis
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.moveTo(104, 280);
    ctx.lineTo(104, 208);
    ctx.quadraticCurveTo(144, 158, 184, 208);
    ctx.lineTo(184, 280);
    ctx.fill();
    ctx.restore();
    stroke(ctx, [[104, 280], [104, 208], [116, 182], [144, 170], [172, 182], [184, 208], [184, 280]], r,
      { width: 2.6, alpha: 0.9 });
    for (let px = 116; px <= 172; px += 11) {
      const top = 178 + Math.abs(px - 144) * 0.32;
      line(ctx, px, top, px, top + 8, r, { width: 1.5, alpha: 0.5, passes: 1, jitter: 0.5 }, 2);
    }
    hatch(ctx, 94, 216, 12, 60, 1.25, 6, r, { alpha: 0.25 });
    hatch(ctx, 182, 216, 12, 60, 1.25, 6, r, { alpha: 0.25 });
    // masonry + the ivy claiming one side
    for (let i = 0; i < 16; i++) {
      const mx = 84 + r() * 116;
      const my = 86 + r() * 180;
      line(ctx, mx, my, mx + 11 + r() * 8, my + (r() - 0.5) * 3, r, { width: 0.9, alpha: 0.26, passes: 1 });
    }
    fillBlob(ctx, 92, 220, 26, r, WASH.forest, 0.3, 1.3);
    for (let i = 0; i < 3; i++) {
      scribbleCircle(ctx, 88 + (r() - 0.5) * 22, 200 - r() * 60, 8 + r() * 6, r,
        { width: 1.1, alpha: 0.32, jitter: 2 }, 1.4);
    }
    // the timber-mark over the arch: two crossed logs scratched in
    stroke(ctx, [[132, 190], [156, 200]], r, { width: 1.6, alpha: 0.6, passes: 1 });
    stroke(ctx, [[156, 190], [132, 200]], r, { width: 1.6, alpha: 0.6, passes: 1 });
  });
}

/** Cobbled square underfoot: worn smooth in the middle, cobbles at the rim. */
export function cobblePlazaDecal(seed: number): THREE.CanvasTexture {
  return makeTexture(384, 384, seed, (ctx, r) => {
    // the polish: soft stone-toned stains, brightest center
    for (let i = 0; i < 5; i++) {
      const bx = 192 + (r() - 0.5) * 120;
      const by = 192 + (r() - 0.5) * 120;
      const rad = 70 + r() * 60;
      const g = ctx.createRadialGradient(bx, by, 4, bx, by, rad);
      g.addColorStop(0, 'rgba(150,146,138,0.16)');
      g.addColorStop(0.7, 'rgba(150,146,138,0.07)');
      g.addColorStop(1, 'rgba(150,146,138,0)');
      ctx.fillStyle = g;
      ctx.fillRect(bx - rad, by - rad, rad * 2, rad * 2);
    }
    // cobbles: little arc rows near the rim, worn to nothing centerward
    for (let i = 0; i < 130; i++) {
      const a = r() * Math.PI * 2;
      const d = 90 + Math.pow(r(), 0.5) * 95;
      const x = 192 + Math.cos(a) * d;
      const y = 192 + Math.sin(a) * d * 0.94;
      if (x < 10 || x > 374 || y < 10 || y > 374) continue;
      const fade = Math.min(1, (d - 80) / 90);
      ctx.strokeStyle = INK;
      ctx.globalAlpha = 0.1 + fade * 0.16;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x, y, 3.4 + r() * 2.4, Math.PI * (0.9 + r() * 0.3), Math.PI * (1.9 + r() * 0.3));
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    // two long wear lines where carts cut the corner
    stroke(ctx, [[60, 330], [160, 240], [280, 180], [350, 150]], r,
      { width: 1.4, alpha: 0.14, passes: 1, jitter: 2.6 });
    stroke(ctx, [[80, 344], [180, 258], [300, 196]], r,
      { width: 1.2, alpha: 0.1, passes: 1, jitter: 2.6 });
    // stipple
    ctx.fillStyle = INK;
    for (let i = 0; i < 46; i++) {
      const a = r() * Math.PI * 2;
      const d = Math.pow(r(), 0.6) * 170;
      ctx.globalAlpha = 0.06 + r() * 0.1;
      ctx.beginPath();
      ctx.arc(192 + Math.cos(a) * d, 192 + Math.sin(a) * d * 0.94, 0.9 + r() * 1.3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  });
}

/* ================== GREYWEATHER ================== */

/**
 * The keep itself, at full pressure — the drawing the meadow's pencil
 * ghost promised: central mass, two cone-capped towers, banners
 * mid-snap. The heaviest line work in the game.
 */
export function greyweatherKeepTexture(seed: number): THREE.CanvasTexture {
  /*
   * WIDE, not tall. The shipping camera only shows ~10-16 world units
   * of height at avenue range, so a keep drawn as a tall tower can
   * only ever hide behind its own gatehouse (critique #2 r1/r2). Drawn
   * 2:1, the castle's flanking towers stand OUTSIDE the gatehouse
   * silhouette and its crown clears the gate's: the mass reads as the
   * biggest thing on the sheet by spread and weight, which is what the
   * frame can actually carry.
   */
  return makeTexture(640, 320, seed, (ctx, r) => {
    const GROUND = 310;
    const merlons = (x0: number, x1: number, y: number, s = 1) => {
      let x = x0;
      while (x < x1 - 10 * s) {
        const mw = (11 + r() * 6) * s;
        const mh = (11 + r() * 5) * s;
        line(ctx, x, y, x + 1, y - mh, r, { width: 1.7, alpha: 0.85, passes: 1, jitter: 0.6 }, 3);
        line(ctx, x + 1, y - mh, x + mw, y - mh - 1, r, { width: 1.7, alpha: 0.85, passes: 1, jitter: 0.6 }, 3);
        line(ctx, x + mw, y - mh - 1, x + mw + 1, y, r, { width: 1.7, alpha: 0.85, passes: 1, jitter: 0.6 }, 3);
        x += mw + (6 + r() * 5) * s;
      }
    };
    const corbels = (x0: number, x1: number, y: number) => {
      line(ctx, x0, y, x1, y - 1, r, { width: 1.8, alpha: 0.8 });
      for (let x = x0 + 4; x < x1 - 4; x += 9 + r() * 4) {
        line(ctx, x, y, x + 2, y + 6, r, { width: 1.4, alpha: 0.6, passes: 1 }, 2);
      }
    };

    /* the curtain returns: the castle runs off both edges of the sheet */
    for (const [cx0, cx1] of [[8, 96], [544, 632]] as [number, number][]) {
      fillPoly(ctx, [[cx0, GROUND], [cx0, 214], [cx1, 212], [cx1, GROUND]], WASH.castle, 0.5);
      line(ctx, cx0, 214, cx1, 212, r, { width: 2, alpha: 0.8 });
      merlons(cx0 + 4, cx1 - 4, 212, 0.85);
      hatch(ctx, cx0 + 4, 240, cx1 - cx0 - 8, 62, 0.95, 8, r, { alpha: 0.14 });
    }

    /* the central mass, battered at the foot */
    fillPoly(ctx, [[196, GROUND], [206, 96], [434, 96], [444, GROUND]], WASH.castle, 0.62);
    stroke(ctx, [[196, GROUND], [201, 210], [206, 96]], r, { width: 3, alpha: 0.92 });
    stroke(ctx, [[444, GROUND], [439, 210], [434, 96]], r, { width: 3, alpha: 0.92 });
    corbels(200, 440, 104);
    line(ctx, 202, 96, 438, 94, r, { width: 2.4, alpha: 0.9 });
    merlons(208, 432, 94, 1.05);
    line(ctx, 201, 216, 439, 214, r, { width: 1.4, alpha: 0.42, passes: 1 });
    line(ctx, 200, 158, 440, 156, r, { width: 1.4, alpha: 0.4, passes: 1 });

    /* the flanking towers: cone-capped, banners at the apex — the
     * silhouette the meadow's pencil ghost promised */
    for (const tx of [110, 530]) {
      fillPoly(ctx, [[tx - 40, GROUND], [tx - 32, 84], [tx + 32, 84], [tx + 40, GROUND]], WASH.castle, 0.64);
      stroke(ctx, [[tx - 40, GROUND], [tx - 36, 200], [tx - 32, 84]], r, { width: 2.9, alpha: 0.92 });
      stroke(ctx, [[tx + 40, GROUND], [tx + 36, 200], [tx + 32, 84]], r, { width: 2.9, alpha: 0.92 });
      corbels(tx - 34, tx + 34, 92);
      fillPoly(ctx, [[tx - 40, 86], [tx, 22], [tx + 40, 86]], '#5f6672', 0.5);
      line(ctx, tx - 40, 86, tx, 22, r, { width: 2.5, alpha: 0.9, jitter: 0.8 }, 4);
      line(ctx, tx, 22, tx + 40, 86, r, { width: 2.5, alpha: 0.9, jitter: 0.8 }, 4);
      for (let k = 1; k < 3; k++) {
        stroke(ctx, [[tx - 40 + k * 11, 86 - k * 2], [tx - k * 3, 28 + k * 18]], r,
          { width: 1, alpha: 0.26, passes: 1 });
      }
      line(ctx, tx, 22, tx, 4, r, { width: 1.7, alpha: 0.88, passes: 1 });
      fillPoly(ctx, [[tx + 1, 5], [tx + 34, 11], [tx + 22, 16], [tx + 32, 22], [tx + 1, 25]], RED, 0.78);
      stroke(ctx, [[tx + 1, 5], [tx + 34, 11], [tx + 22, 16], [tx + 32, 22], [tx + 1, 25]], r,
        { width: 1.3, alpha: 0.8, passes: 1 });
      for (let wy = 120; wy < 290; wy += 52) {
        line(ctx, tx - 6 + (r() - 0.5) * 10, wy, tx - 5 + (r() - 0.5) * 10, wy + 18, r,
          { width: 2.8, alpha: 0.62 });
      }
      hatch(ctx, tx - 36, 244, 24, 62, 1.15, 7, r, { alpha: 0.18 });
    }

    /* lancets high and low, so the wall is lived on at every level */
    for (const [wx, wy, wh] of [[248, 128, 40], [312, 116, 46], [376, 128, 40],
      [276, 196, 34], [352, 196, 34], [228, 240, 28], [400, 240, 28]] as [number, number, number][]) {
      stroke(ctx, [[wx, wy + wh], [wx, wy + 7], [wx + 8, wy], [wx + 16, wy + 7], [wx + 16, wy + wh]], r,
        { width: 1.9, alpha: 0.88 });
      hatch(ctx, wx + 2, wy + 5, 13, wh - 7, 1.25, 4.5, r, { alpha: 0.3 });
    }
    /* an oriel corbelled off the east face */
    stroke(ctx, [[392, 206], [396, 194], [424, 193], [428, 206]], r, { width: 1.7, alpha: 0.8 });
    poly(ctx, [[396, 194], [396, 170], [424, 169], [424, 193]], r, { width: 1.7, alpha: 0.85 });
    line(ctx, 410, 170, 410, 193, r, { width: 1, alpha: 0.45, passes: 1 }, 2);
    fillPoly(ctx, [[392, 171], [410, 158], [428, 170]], '#5f6672', 0.45);
    line(ctx, 392, 171, 410, 158, r, { width: 1.4, alpha: 0.8, passes: 1 }, 2);
    line(ctx, 410, 158, 428, 170, r, { width: 1.4, alpha: 0.8, passes: 1 }, 2);
    /* putlog holes the builders never filled */
    for (const [hx, hy] of [[226, 176], [262, 160], [390, 172], [244, 262], [412, 268], [320, 254]] as [number, number][]) {
      ctx.globalAlpha = 0.4;
      ctx.fillStyle = INK;
      ctx.fillRect(hx, hy, 5, 4);
      ctx.globalAlpha = 1;
    }

    /* the great door: porch hood, deep arch, steps — shut, barred,
     * and not expecting anyone */
    stroke(ctx, [[286, 250], [294, 236], [320, 231], [346, 236], [354, 250]], r,
      { width: 2, alpha: 0.85 });
    stroke(ctx, [[294, GROUND], [294, 268], [304, 250], [320, 244], [336, 250], [346, 268], [346, GROUND]], r,
      { width: 2.9, alpha: 0.92 });
    hatch(ctx, 298, 252, 44, 56, 1.35, 5, r, { alpha: 0.36 });
    for (const hy of [274, 292]) {
      line(ctx, 297, hy, 343, hy - 1, r, { width: 1.8, alpha: 0.55, passes: 1 });
      scribbleCircle(ctx, 320, hy - 1, 2, r, { width: 1, alpha: 0.5 });
    }
    stroke(ctx, [[300, 264], [316, 262]], r, { width: 1.4, alpha: 0.5, passes: 1 });
    stroke(ctx, [[340, 265], [326, 263]], r, { width: 1.4, alpha: 0.5, passes: 1 });
    scribbleCircle(ctx, 320, 282, 3.6, r, { width: 1.2, alpha: 0.55 }, 1.3);
    stroke(ctx, [[286, GROUND], [288, 303], [352, 302], [354, GROUND]], r, { width: 1.7, alpha: 0.72 });
    stroke(ctx, [[278, 318], [280, 310], [360, 309], [362, 318]], r, { width: 1.5, alpha: 0.6 });

    /* masonry: heavier and more of it than anywhere else */
    for (let i = 0; i < 44; i++) {
      const x = 206 + r() * 228;
      const y = 108 + r() * 190;
      line(ctx, x, y, x + 13 + r() * 11, y + (r() - 0.5) * 3, r, { width: 1.1, alpha: 0.24, passes: 1 });
    }
    /* damp streaks under the crown */
    for (const sx of [238, 322, 402]) {
      stroke(ctx, [[sx, 108], [sx + 2, 132], [sx - 1, 152]], r,
        { width: 1.2, alpha: 0.2, passes: 1, color: PENCIL });
    }
    hatch(ctx, 202, 236, 34, 70, 1.1, 7, r, { alpha: 0.16 });
  });
}

/**
 * Greyweather's gatehouse: twin square towers battered at the foot,
 * a machicolation row, the arch's dark and its raised portcullis.
 */
export function greyweatherGateTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(384, 384, seed, (ctx, r) => {
    const merlons = (x0: number, x1: number, y: number) => {
      let x = x0;
      while (x < x1 - 12) {
        const mw = 15 + r() * 8;
        const mh = 17 + r() * 7;
        line(ctx, x, y, x + 1, y - mh, r, { width: 1.7, alpha: 0.85, passes: 1, jitter: 0.7 }, 3);
        line(ctx, x + 1, y - mh, x + mw, y - mh - 1, r, { width: 1.7, alpha: 0.85, passes: 1, jitter: 0.7 }, 3);
        line(ctx, x + mw, y - mh - 1, x + mw + 1, y, r, { width: 1.7, alpha: 0.85, passes: 1, jitter: 0.7 }, 3);
        x += mw + 8 + r() * 6;
      }
    };
    for (const tx of [70, 314]) {
      fillPoly(ctx, [[tx - 56, 374], [tx - 44, 96], [tx + 44, 96], [tx + 56, 374]], WASH.castle, 0.6);
      stroke(ctx, [[tx - 56, 374], [tx - 49, 250], [tx - 44, 96]], r, { width: 3, alpha: 0.92 });
      stroke(ctx, [[tx + 56, 374], [tx + 49, 250], [tx + 44, 96]], r, { width: 3, alpha: 0.92 });
      // machicolation row then the crown
      line(ctx, tx - 48, 106, tx + 48, 104, r, { width: 2, alpha: 0.8 });
      for (let x = tx - 44; x < tx + 44; x += 12 + r() * 5) {
        line(ctx, x, 105, x + 2, 114, r, { width: 1.6, alpha: 0.6, passes: 1 }, 2);
      }
      line(ctx, tx - 50, 96, tx + 50, 94, r, { width: 2.4, alpha: 0.88 });
      merlons(tx - 46, tx + 48, 94);
      // arrow slits
      line(ctx, tx - 12, 140, tx - 11, 168, r, { width: 3.2, alpha: 0.7 });
      line(ctx, tx + 10, 210, tx + 11, 238, r, { width: 3.2, alpha: 0.65 });
      line(ctx, tx - 8, 290, tx - 7, 316, r, { width: 3.2, alpha: 0.6 });
      // masonry + shade toward the passage
      for (let i = 0; i < 20; i++) {
        const x = tx - 40 + r() * 72;
        const y = 110 + r() * 240;
        line(ctx, x, y, x + 12 + r() * 10, y + (r() - 0.5) * 3, r, { width: 1, alpha: 0.28, passes: 1 });
      }
      const shadeX = tx < 192 ? tx + 30 : tx - 46;
      hatch(ctx, shadeX, 160, 16, 190, 1.25, 6.5, r, { alpha: 0.16 });
    }
    // the span: lower than the towers, its own merlons
    fillPoly(ctx, [[114, 250], [114, 132], [270, 132], [270, 250]], WASH.castle, 0.55);
    line(ctx, 114, 134, 270, 132, r, { width: 2.4, alpha: 0.88 });
    merlons(120, 266, 132);
    // murder holes over the arch: three dark mouths
    for (const mx of [162, 192, 222]) {
      scribbleCircle(ctx, mx, 158, 4, r, { width: 1.3, alpha: 0.6 }, 1.2);
      hatch(ctx, mx - 3, 155, 7, 7, 0.8, 2.6, r, { alpha: 0.3 });
    }
    // the arch and its raised portcullis
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.moveTo(138, 374);
    ctx.lineTo(138, 268);
    ctx.quadraticCurveTo(192, 200, 246, 268);
    ctx.lineTo(246, 374);
    ctx.fill();
    ctx.restore();
    stroke(ctx, [[138, 374], [138, 268], [154, 232], [192, 218], [230, 232], [246, 268], [246, 374]], r,
      { width: 3, alpha: 0.92 });
    for (let x = 154; x <= 230; x += 12) {
      const top = 228 + Math.abs(x - 192) * 0.3;
      line(ctx, x, top, x, top + 10, r, { width: 1.7, alpha: 0.55, passes: 1, jitter: 0.5 }, 2);
    }
    hatch(ctx, 126, 280, 16, 90, 1.25, 6, r, { alpha: 0.28 });
    hatch(ctx, 244, 280, 16, 90, 1.25, 6, r, { alpha: 0.28 });
    // the proclamation nailed by the arch, too weathered to read
    poly(ctx, [[104, 300], [104, 268], [128, 268], [128, 300]], r, { width: 1.4, alpha: 0.7 });
    for (let i = 0; i < 4; i++) {
      line(ctx, 108, 276 + i * 6, 122 + (r() - 0.5) * 4, 277 + i * 6, r,
        { width: 0.9, alpha: 0.3, passes: 1 }, 2);
    }
  });
}

/**
 * The ridge wall: heavier and more broken than Brim's — merlons
 * chipped, footing buried in scree, one variant with a resident rook.
 */
export function ridgeWallTexture(seed: number, w = 512, h = 176): THREE.CanvasTexture {
  return makeTexture(w, h, seed, (ctx, r) => {
    const lw = 2.4;
    const parapetY = 52 + (r() - 0.5) * 8;
    fillPoly(ctx, [[6, h - 8], [6, parapetY], [w - 6, parapetY - 4], [w - 6, h - 8]], WASH.castle, 0.56);
    line(ctx, 6, h - 10, w - 6, h - 10, r, { width: lw, alpha: 0.85 });
    line(ctx, 6, parapetY + 2, w - 6, parapetY - 2, r, { width: lw, alpha: 0.9 });
    hatch(ctx, 10, parapetY + 4, w - 20, 12, 0.05, 4.5, r, { alpha: 0.16 });
    // battlements: straight segments at low jitter (the Session 2
    // tower lesson — round jitter reads as croquet hoops up close),
    // with more of them chipped than whole
    let x = 12 + r() * 10;
    while (x < w - 30) {
      const mw = 18 + r() * 14;
      const mh = 22 + r() * 12;
      const state = r();
      if (state > 0.72) {
        // chipped to a stump: two hard little strokes
        line(ctx, x, parapetY, x + 2, parapetY - mh * 0.35, r,
          { width: lw * 0.85, alpha: 0.8, passes: 1, jitter: 0.8 }, 2);
        line(ctx, x + 2, parapetY - mh * 0.35, x + mw, parapetY - mh * 0.12, r,
          { width: lw * 0.85, alpha: 0.78, passes: 1, jitter: 1.2 }, 3);
        line(ctx, x + mw, parapetY - mh * 0.12, x + mw + 1, parapetY, r,
          { width: lw * 0.85, alpha: 0.8, passes: 1, jitter: 0.8 }, 2);
      } else {
        const leanTop = state > 0.6 ? 5 : (r() - 0.5) * 3;
        line(ctx, x, parapetY, x + 1, parapetY - mh, r,
          { width: lw * 0.9, alpha: 0.85, passes: 1, jitter: 0.7 }, 3);
        line(ctx, x + 1, parapetY - mh, x + mw, parapetY - mh + leanTop, r,
          { width: lw * 0.9, alpha: 0.85, passes: 1, jitter: 0.7 }, 3);
        line(ctx, x + mw, parapetY - mh + leanTop, x + mw + 1, parapetY, r,
          { width: lw * 0.9, alpha: 0.85, passes: 1, jitter: 0.7 }, 3);
      }
      x += mw + 12 + r() * 12;
    }
    // heavier masonry
    for (let i = 0; i < w / 18; i++) {
      const mx = 14 + r() * (w - 40);
      const my = parapetY + 16 + r() * (h - parapetY - 42);
      line(ctx, mx, my, mx + 14 + r() * 12, my + (r() - 0.5) * 3, r, { width: 1.1, alpha: 0.26, passes: 1 });
    }
    // a long crack, and the damp
    if (r() > 0.4) {
      const cx = 60 + r() * (w - 140);
      stroke(ctx, [[cx, parapetY + 8], [cx + (r() - 0.5) * 16, parapetY + (h - parapetY) * 0.5],
        [cx + (r() - 0.5) * 26, h - 14]], r, { width: 1.4, alpha: 0.4, passes: 1 });
    }
    hatch(ctx, 12, h - 46, w - 24, 34, 0.9, 7, r, { alpha: 0.16 });
    // scree: two or three irregular piles of angular stones, half
    // buried in the footing — never a metronome row of humps
    const piles = 2 + Math.floor(r() * 2);
    for (let p = 0; p < piles; p++) {
      const sx = 30 + r() * (w - 90);
      const n = 2 + Math.floor(r() * 3);
      for (let k = 0; k < n; k++) {
        const kx = sx + k * (7 + r() * 9) + (r() - 0.5) * 6;
        const kh = 5 + r() * 7;
        stroke(ctx, [[kx, h - 9], [kx + 2 + r() * 3, h - 9 - kh],
          [kx + 8 + r() * 4, h - 10 - kh * 0.4], [kx + 11 + r() * 4, h - 9]], r,
          { width: 1.2, alpha: 0.45 + r() * 0.15, passes: 1, jitter: 0.9 });
      }
    }
    // one variant keeps a rook on the parapet
    if (seed % 3 === 0) {
      const bx = 80 + r() * (w - 160);
      fillBlob(ctx, bx, parapetY - 26, 8, r, INK, 0.55, 0.8);
      stroke(ctx, [[bx - 8, parapetY - 22], [bx, parapetY - 32], [bx + 10, parapetY - 26], [bx + 16, parapetY - 27]], r,
        { width: 1.5, alpha: 0.8, passes: 1 });
      line(ctx, bx - 2, parapetY - 20, bx - 2, parapetY - 12, r, { width: 1.1, alpha: 0.6, passes: 1 }, 2);
    }
  });
}

/**
 * A tall swallowtail banner on its dark pole — the avenue's rhythm and
 * the land's only color. Drawn mid-snap; the field's wind does the rest.
 */
export function tallBannerTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(96, 256, seed, (ctx, r) => {
    line(ctx, 30, 248, 31, 18, r, { width: 2.6, alpha: 0.9 });
    line(ctx, 22, 24, 44, 23, r, { width: 2, alpha: 0.85 });
    // the banner: long, forked, caught mid-snap to the right
    const sway = 8 + r() * 14;
    fillPoly(ctx, [[33, 28], [62, 32], [66 + sway, 84], [58, 120], [70 + sway, 158],
      [52, 150], [40, 158], [34, 120]], RED, 0.75);
    stroke(ctx, [[33, 28], [62, 32], [66 + sway, 84], [58, 120], [70 + sway, 158]], r,
      { width: 1.6, alpha: 0.85 });
    stroke(ctx, [[70 + sway, 158], [52, 150], [40, 158], [34, 120], [33, 28]], r,
      { width: 1.6, alpha: 0.85 });
    // the device: a pale diagonal
    stroke(ctx, [[38, 52], [58 + sway * 0.4, 96]], r,
      { width: 2.6, alpha: 0.6, passes: 1, color: CREAM });
    // fray at the fork
    for (let i = 0; i < 3; i++) {
      line(ctx, 64 + sway + (r() - 0.5) * 6, 154 + r() * 4, 70 + sway + r() * 5, 162 + r() * 5, r,
        { width: 1, alpha: 0.5, passes: 1 }, 2);
    }
    // the pole's foot, staked
    stroke(ctx, [[24, 246], [30, 238], [37, 246]], r, { width: 1.6, alpha: 0.7, passes: 1 });
  });
}

/** A crag outcrop for the ridge — the "high seat" drawn, not modeled. */
export function cragTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(288, 176, seed, (ctx, r) => {
    const pts: [number, number][] = [[16, 168], [10, 118], [46, 96], [70, 52], [126, 30],
      [178, 44], [216, 88], [262, 104], [276, 168]];
    fillPoly(ctx, pts, WASH.castle, 0.5);
    poly(ctx, pts, r, { width: 2.6, alpha: 0.88, jitter: 2.2 });
    // strata pulling one way, like the whole ridge slid
    for (let s = 0; s < 4; s++) {
      const y = 70 + s * 26;
      stroke(ctx, [[30 + s * 8, y + 14], [110, y - 4 + s * 3], [230 - s * 10, y + 10]], r,
        { width: 1.3, alpha: 0.32, passes: 1, jitter: 2 });
    }
    // one deep crack
    stroke(ctx, [[126, 34], [138, 84], [130, 132], [140, 166]], r, { width: 1.6, alpha: 0.45, passes: 1 });
    hatch(ctx, 170, 70, 96, 92, 1.05, 8, r, { alpha: 0.22 });
    // tufts holding on where nothing should
    for (const [gx, gy] of [[74, 54], [180, 46], [240, 100]] as [number, number][]) {
      for (let i = 0; i < 3; i++) {
        stroke(ctx, [[gx + i * 3, gy], [gx + i * 3 + (r() - 0.5) * 5, gy - 7 - r() * 5]], r,
          { width: 1, alpha: 0.5, passes: 1 });
      }
    }
  });
}

/** The toppled king: a plinth still standing, a monarch who is not. */
export function toppledStatueTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(224, 128, seed, (ctx, r) => {
    // the plinth, upright, with the break at its top
    fillPoly(ctx, [[26, 120], [30, 64], [74, 62], [78, 120]], WASH.castle, 0.55);
    poly(ctx, [[26, 120], [30, 64], [74, 62], [78, 120]], r, { width: 2.2, alpha: 0.9 });
    stroke(ctx, [[32, 64], [42, 58], [56, 62], [66, 56], [74, 62]], r, { width: 1.8, alpha: 0.8, jitter: 1.6 });
    // the inscription, worn to scratches
    for (let i = 0; i < 3; i++) {
      line(ctx, 36, 84 + i * 9, 66 + (r() - 0.5) * 6, 85 + i * 9, r, { width: 1, alpha: 0.3, passes: 1 }, 3);
    }
    hatch(ctx, 30, 100, 22, 18, 1, 5, r, { alpha: 0.16 });
    // the king, lying where he landed: posture and crown, no face
    fillPoly(ctx, [[96, 108], [206, 100], [208, 114], [98, 120]], WASH.castle, 0.5);
    // body: one long committed line, arms crossed on the chest as cast
    stroke(ctx, [[96, 112], [120, 104], [168, 102], [200, 104], [208, 108]], r, { width: 2.6, alpha: 0.9 });
    stroke(ctx, [[98, 118], [140, 118], [190, 114], [208, 112]], r, { width: 2.4, alpha: 0.85 });
    // the head end, crowned: a circle and its zigzag
    scribbleCircle(ctx, 196, 106, 9, r, { width: 1.8, alpha: 0.85 }, 1.15);
    stroke(ctx, [[204, 100], [208, 92], [212, 99], [216, 91], [220, 100]], r, { width: 1.6, alpha: 0.85 });
    // the sceptre, flung a body's length away
    line(ctx, 130, 90, 156, 84, r, { width: 1.8, alpha: 0.75 });
    scribbleCircle(ctx, 158, 83, 3.4, r, { width: 1.2, alpha: 0.7 });
    // grass reclaiming the seam
    for (const gx of [100, 148, 186]) {
      for (let i = 0; i < 3; i++) {
        stroke(ctx, [[gx + i * 4, 120], [gx + i * 4 + (r() - 0.5) * 6, 108 - r() * 6]], r,
          { width: 1.1, alpha: 0.5, passes: 1 });
      }
    }
  });
}

/**
 * THE KING, BACK ON HIS PLINTH (Session 15, `THE-FUN-PASS` §6 — the
 * second door at Greyweather). The same plinth as `toppledStatueTexture`
 * — same canvas, same footing, same worn inscription — with the figure
 * standing on it instead of lying beside it, so the two drawings swap
 * in place. Posture and crown, no face; the sceptre is in his hand,
 * because somebody picked that up too. The seam where he broke off is
 * still there at his feet: a thing put back is not a thing unbroken.
 */
export function standingKingTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(224, 256, seed, (ctx, r) => {
    // the plinth, exactly where the toppled drawing has it (y offset
    // by the taller canvas)
    const oy = 128;
    fillPoly(ctx, [[26, 120 + oy], [30, 64 + oy], [74, 62 + oy], [78, 120 + oy]], WASH.castle, 0.55);
    poly(ctx, [[26, 120 + oy], [30, 64 + oy], [74, 62 + oy], [78, 120 + oy]], r, { width: 2.2, alpha: 0.9 });
    for (let i = 0; i < 3; i++) {
      line(ctx, 36, 84 + oy + i * 9, 66 + (r() - 0.5) * 6, 85 + oy + i * 9, r, { width: 1, alpha: 0.3, passes: 1 }, 3);
    }
    hatch(ctx, 30, 100 + oy, 22, 18, 1, 5, r, { alpha: 0.16 });
    // the break, mended: a crooked line across the plinth's top
    stroke(ctx, [[32, 64 + oy], [42, 60 + oy], [56, 63 + oy], [66, 58 + oy], [74, 62 + oy]], r,
      { width: 1.6, alpha: 0.7, jitter: 1.6 });
    // the king, standing: one long committed line for the body, the
    // robe as a wash, arms crossed on the chest as cast
    const cx = 52;
    fillPoly(ctx, [[cx - 14, 62 + oy], [cx - 10, 96], [cx + 10, 94], [cx + 15, 62 + oy]], WASH.castle, 0.5);
    stroke(ctx, [[cx - 14, 62 + oy], [cx - 11, 130], [cx - 10, 96]], r, { width: 2.6, alpha: 0.9 });
    stroke(ctx, [[cx + 15, 62 + oy], [cx + 12, 132], [cx + 10, 94]], r, { width: 2.4, alpha: 0.85 });
    stroke(ctx, [[cx - 12, 118], [cx + 12, 112]], r, { width: 2, alpha: 0.7, passes: 1 });
    stroke(ctx, [[cx - 11, 128], [cx + 11, 124]], r, { width: 1.6, alpha: 0.5, passes: 1 });
    // the head, crowned: a circle and its zigzag
    scribbleCircle(ctx, cx, 78, 10, r, { width: 1.8, alpha: 0.85 }, 1.15);
    stroke(ctx, [[cx - 10, 70], [cx - 6, 60], [cx - 2, 68], [cx + 2, 59], [cx + 6, 68], [cx + 10, 60], [cx + 11, 70]], r,
      { width: 1.6, alpha: 0.85 });
    // the sceptre, in his hand again
    line(ctx, cx + 16, 108, cx + 24, 66, r, { width: 1.8, alpha: 0.75 });
    scribbleCircle(ctx, cx + 25, 63, 3.4, r, { width: 1.2, alpha: 0.7 });
    // the grass that had reclaimed the seam is still there, at the
    // foot of the plinth, on the side he used to lie
    for (let i = 0; i < 4; i++) {
      stroke(ctx, [[96 + i * 6, 120 + oy], [96 + i * 6 + (r() - 0.5) * 6, 108 + oy - r() * 6]], r,
        { width: 1.1, alpha: 0.5, passes: 1 });
    }
  });
}

/**
 * A BARE POLE (Session 15). The avenue with the banners down: the pole,
 * its cross-bar, the halyard hanging slack, and nothing on it. Same
 * canvas as `tallBannerTexture` so it swaps in place, and drawn a shade
 * lighter, because a pole with nothing on it is a thing you stop seeing.
 */
export function barePoleTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(96, 256, seed, (ctx, r) => {
    line(ctx, 30, 248, 31, 18, r, { width: 2.6, alpha: 0.82 });
    line(ctx, 22, 24, 44, 23, r, { width: 2, alpha: 0.78 });
    // the halyard, slack, knocking the pole
    stroke(ctx, [[42, 24], [40 + r() * 4, 90], [34, 150], [33, 200]], r,
      { width: 1, alpha: 0.5, passes: 1, jitter: 1.5 });
    stroke(ctx, [[24, 246], [30, 238], [37, 246]], r, { width: 1.6, alpha: 0.7, passes: 1 });
  });
}

/**
 * THIS WEEK'S RED (Session 15; `THE-WAITS` §1, `THE-STRANGERS` U5). The
 * moat pool is a dye vat — it is the only standing water inside the
 * walls and it is why it was dug — and the water in it carries the last
 * banner Wick re-dyed. A stain lying on the pool, the banner's own red
 * gone thin in water, ragged where the reeds are. It clears when he is
 * relieved of duty, and nothing anywhere says why the water was red.
 */
export function dyeStainDecal(seed: number): THREE.CanvasTexture {
  return makeTexture(256, 192, seed, (ctx, r) => {
    const blob = (cx: number, cy: number, rad: number, a: number) => {
      const pts: [number, number][] = [];
      for (let i = 0; i < 16; i++) {
        const t = (i / 16) * Math.PI * 2;
        const rr = rad * (0.7 + r() * 0.5);
        pts.push([cx + Math.cos(t) * rr, cy + Math.sin(t) * rr * 0.7]);
      }
      fillPoly(ctx, pts, RED, a);
    };
    blob(128, 96, 92, 0.16);
    blob(112, 90, 62, 0.14);
    blob(150, 104, 48, 0.12);
    // the swirl where the cloth went in
    stroke(ctx, [[96, 100], [120, 84], [150, 92], [162, 112], [140, 122]], r,
      { width: 1.4, alpha: 0.22, passes: 1, color: RED, jitter: 2 });
  });
}

/** The moat pool's hawthorn: grown in one wind, keeping the record of it. */
export function gnarledHawthornTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(224, 224, seed, (ctx, r) => {
    // canopy streamed east: the blob sits far off the trunk
    fillBlob(ctx, 146, 84, 52, r, WASH.forest, 0.32, 0.62);
    fillBlob(ctx, 168, 96, 34, r, WASH.forest, 0.24, 0.7);
    // streaming contour: open strokes, all pointing the same way
    for (let i = 0; i < 5; i++) {
      const y = 58 + i * 16;
      stroke(ctx, [[96 + i * 6, y + 10], [140 + i * 4, y - 2 + r() * 6], [196 + r() * 10, y + 4]], r,
        { width: 1.3, alpha: 0.4, passes: 1, jitter: 2 });
    }
    scribbleCircle(ctx, 148, 84, 50, r, { width: 1.8, alpha: 0.55, jitter: 3 }, 0.85);
    // the trunk: leaning hard, twisted — two lines that wrap each other
    stroke(ctx, [[74, 216], [80, 176], [96, 140], [118, 112], [134, 100]], r, { width: 3.6, alpha: 0.9 });
    stroke(ctx, [[88, 216], [90, 180], [104, 146], [124, 118], [138, 106]], r, { width: 2.8, alpha: 0.85 });
    stroke(ctx, [[82, 196], [94, 186], [92, 168], [104, 158]], r, { width: 1.4, alpha: 0.5, passes: 1 });
    // one dead branch pointing back into the wind
    stroke(ctx, [[104, 132], [82, 120], [68, 122]], r, { width: 1.8, alpha: 0.7 });
    line(ctx, 82, 120, 78, 110, r, { width: 1.2, alpha: 0.5, passes: 1 }, 2);
    // roots gripping the bank
    for (const dx of [-14, -2, 12]) {
      stroke(ctx, [[81 + dx * 0.4, 208], [81 + dx, 216], [81 + dx * 1.5, 220]], r,
        { width: 2, alpha: 0.65 });
    }
    hatch(ctx, 110, 92, 52, 30, 0.75, 6.5, r, { alpha: 0.15 });
  });
}

/**
 * The pale pine band behind the keep — pencil, massed. Two or three
 * CLUMPS with gaps, each a soft stain with a broken serrated top and
 * a few leaders standing proud; never a picket of triangles.
 */
export function farPinesTexture(seed: number, w = 512, h = 128): THREE.CanvasTexture {
  return makeTexture(w, h, seed, (ctx, r) => {
    const baseY = h - 8;
    const clumps = 2 + Math.floor(r() * 2);
    let x = 6 + r() * 30;
    for (let c = 0; c < clumps && x < w - 80; c++) {
      const cw = 90 + r() * 130;
      const x1 = Math.min(x + cw, w - 8);
      const top = 34 + r() * 26;
      // the mass first: one soft stain the trees share
      fillPoly(ctx, [[x, baseY], [x + 8, baseY - top * 0.55], [(x + x1) / 2, baseY - top],
        [x1 - 10, baseY - top * 0.6], [x1, baseY]], WASH.castle, 0.14);
      // a broken serrated contour over it, drawn in two or three runs
      let sx = x + 4;
      const contour: [number, number][] = [[sx, baseY - 10 - r() * 8]];
      while (sx < x1 - 12) {
        sx += 10 + r() * 16;
        const mid = 1 - Math.abs((sx - x) / (x1 - x) - 0.5) * 1.6;
        contour.push([sx, baseY - (14 + mid * (top - 14)) + (r() - 0.5) * 12]);
      }
      for (let s = 0; s < contour.length - 1; s += 3) {
        stroke(ctx, contour.slice(s, s + 4), r,
          { width: 1.1, alpha: 0.3, passes: 1, color: PENCIL, jitter: 2.2 });
      }
      // leaders standing well proud of the mass: without these the
      // clump is just a dome on the horizon (critique #2 r2)
      for (let k = 0; k < 3 + Math.floor(r() * 3); k++) {
        const lx = x + 10 + r() * (x1 - x - 20);
        const mid = 1 - Math.abs((lx - x) / (x1 - x) - 0.5) * 1.6;
        const lh = (14 + mid * (top - 14)) + 16 + r() * 26;
        // the leader has to WIN over the stain or the clump reads as a
        // dome on the horizon: taller, darker, narrower than the mass
        stroke(ctx, [[lx - 6, baseY - lh * 0.5], [lx - 2, baseY - lh * 0.78], [lx, baseY - lh]], r,
          { width: 1.3, alpha: 0.44, passes: 1, color: PENCIL, jitter: 1 });
        stroke(ctx, [[lx, baseY - lh], [lx + 2, baseY - lh * 0.78], [lx + 6, baseY - lh * 0.5]], r,
          { width: 1.3, alpha: 0.44, passes: 1, color: PENCIL, jitter: 1 });
        line(ctx, lx, baseY - lh * 0.5, lx, baseY - 8, r,
          { width: 0.9, alpha: 0.22, passes: 1, color: PENCIL }, 2);
      }
      x = x1 + 30 + r() * 60; // the gap is part of the drawing
    }
  });
}

/** A rook — heavier than the swallow, blunt-tailed, up to no good. */
export function rookTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(64, 48, seed, (ctx, r) => {
    fillBlob(ctx, 32, 26, 8, r, INK, 0.5, 0.7);
    stroke(ctx, [[8, 30], [22, 16], [32, 24]], r, { width: 2.4, alpha: 0.85, passes: 1 });
    stroke(ctx, [[32, 24], [44, 14], [56, 26]], r, { width: 2.4, alpha: 0.85, passes: 1 });
    // the blunt tail
    stroke(ctx, [[30, 28], [26, 38], [34, 37]], r, { width: 1.6, alpha: 0.75, passes: 1 });
  });
}

/** Scree spilling down the ridge under the wall. */
export function screeDecal(seed: number): THREE.CanvasTexture {
  return makeTexture(256, 128, seed, (ctx, r) => {
    hatch(ctx, 12, 14, 232, 60, 0.9, 8, r, { alpha: 0.1 });
    for (let i = 0; i < 26; i++) {
      const x = 14 + r() * 228;
      const y = 20 + Math.pow(r(), 0.6) * 96;
      const s = 2 + r() * 4;
      poly(ctx, [[x, y], [x + s, y - s * 0.6], [x + s * 1.8, y + s * 0.3], [x + s, y + s * 0.7]], r,
        { width: 1, alpha: 0.2 + r() * 0.2, passes: 1 });
    }
    // a few stones that rolled further
    for (let i = 0; i < 4; i++) {
      const x = 30 + r() * 200;
      scribbleCircle(ctx, x, 100 + r() * 18, 2.4 + r() * 1.6, r, { width: 1, alpha: 0.3 }, 1.3);
    }
  });
}

/* ================================================================== *
 * MARGET'S STALL — the one wait this session authors end to end.
 *
 * THE-WAITS.md §2. Marget sets the stall out at dawn, lays the cloth,
 * DOES NOT OPEN, and packs it away at dusk. She is not waiting for
 * buyers and she is not waiting for a market: market day is called
 * from the cross when the bell strikes the hour, and Brim's belfry has
 * two hands that disagree, so nobody in this town has been able to
 * agree what hour the bell struck for longer than anybody remembers.
 * She is waiting for one other person in the world to agree with her
 * about what time it is.
 *
 * So the stall gets TWO drawings and the difference between them is
 * the whole of the wait, in one silhouette:
 *
 *   CLOSED  a trestle and a cloth. Two units tall, flat-topped, cream,
 *           and there is nothing on it. It is the shape of a thing
 *           that has been made ready and not used
 *   OPEN    the cloth bunched at one end, the counter under goods, and
 *           an AWNING — which nearly doubles the height and puts the
 *           town's red back over the square
 *
 * QUESTS §4: a piece of content ends with the world visibly and
 * permanently different near where you are standing. Two units to four,
 * and cream to red, from thirty units away, at a glance.
 * ================================================================== */
export function margetStallTexture(seed: number, open: boolean): THREE.CanvasTexture {
  return makeTexture(224, 224, seed, (ctx, r) => {
    const lean = (r() - 0.5) * 4;

    if (open) {
      /* the awning goes up first so the counter's line crosses in front
         of its posts, the way a near thing does */
      line(ctx, 34, 140, 30 + lean, 46, r, { width: 2.6, alpha: 0.9 });
      line(ctx, 190, 138, 194 + lean, 44, r, { width: 2.6, alpha: 0.9 });
      fillPoly(ctx, [[18, 50], [112 + lean, 28], [206, 48], [206, 72], [18, 76]], CREAM, 0.62);
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = RED;
      for (let i = 0; i < 4; i++) {
        const x0 = 28 + i * 44;
        ctx.beginPath();
        ctx.moveTo(x0, 74);
        ctx.lineTo(x0 + 9 + lean * 0.4, 42);
        ctx.lineTo(x0 + 28 + lean * 0.4, 40);
        ctx.lineTo(x0 + 19, 74);
        ctx.closePath();
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      stroke(ctx, [[18, 50], [112 + lean, 30], [206, 48]], r, { width: 2.2, alpha: 0.9 });
      for (let i = 0; i < 5; i++) {
        const x0 = 18 + i * 38;
        stroke(ctx, [[x0, 72], [x0 + 19, 82], [x0 + 38, 72]], r,
          { width: 1.8, alpha: 0.85, passes: 1 });
      }
    }

    // the trestle: two splayed pairs and a board across
    for (const bx of [46, 178]) {
      line(ctx, bx - 13, 208, bx + 2, 140, r, { width: 2.4, alpha: 0.88 });
      line(ctx, bx + 13, 208, bx - 2, 140, r, { width: 2.4, alpha: 0.88 });
      line(ctx, bx - 8, 178, bx + 8, 178, r, { width: 1.4, alpha: 0.55, passes: 1 });
    }
    fillPoly(ctx, [[22, 138], [202, 134], [202, 146], [22, 150]], '#c9a06a', 0.4);
    poly(ctx, [[22, 138], [202, 134], [202, 146], [22, 150]], r, { width: 2, alpha: 0.9 });

    if (!open) {
      /* THE CLOTH, LAID. It hangs over the front and over both ends,
         squared off, because it was laid by somebody who lays it every
         day. Nothing is on it. */
      fillPoly(ctx, [[16, 132], [208, 128], [210, 190], [14, 194]], CREAM, 0.72);
      poly(ctx, [[16, 132], [208, 128], [210, 190], [14, 194]], r, { width: 1.8, alpha: 0.72 });
      // the hem, and two folds where it was creased in the putting away
      stroke(ctx, [[14, 194], [62, 190], [110, 193], [160, 189], [210, 190]], r,
        { width: 1.5, alpha: 0.6, passes: 1 });
      for (const fx of [74, 148]) {
        line(ctx, fx, 132, fx + 3, 192, r, { width: 1.1, alpha: 0.3, passes: 1 });
      }
      // a crate under the trestle: her own, and it stays packed
      stroke(ctx, [[96, 206], [98, 176], [136, 176], [138, 206]], r, { width: 1.7, alpha: 0.8 });
      line(ctx, 97, 190, 137, 190, r, { width: 1, alpha: 0.45, passes: 1 });
      return;
    }

    /* OPEN. The cloth is not gone — it is bunched at the near end,
       which is what a cloth does when somebody finally pulls it back. */
    fillBlob(ctx, 44, 122, 20, r, CREAM, 0.68, 0.62);
    stroke(ctx, [[26, 128], [40, 112], [58, 120], [66, 132]], r, { width: 1.6, alpha: 0.6 });

    // two baskets of apples, and the town's red is the orchard's red
    for (const bx of [96, 158]) {
      stroke(ctx, [[bx - 18, 134], [bx - 14, 114], [bx + 14, 114], [bx + 18, 134]], r,
        { width: 1.7, alpha: 0.82 });
      line(ctx, bx - 15, 121, bx + 15, 120, r, { width: 1, alpha: 0.4, passes: 1 });
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = RED;
      for (let g = 0; g < 5; g++) {
        ctx.beginPath();
        ctx.arc(bx - 11 + g * 5.6 + (r() - 0.5) * 3, 111 + (r() - 0.5) * 4, 3.6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    // a stack of something flat, and a string hung off the near post
    for (let i = 0; i < 4; i++) {
      line(ctx, 186, 132 - i * 5, 204, 131 - i * 5, r, { width: 1.5, alpha: 0.6, passes: 1 });
    }
    stroke(ctx, [[32, 56], [30, 78], [32, 98]], r, { width: 1, alpha: 0.55, passes: 1 });
    for (let g = 0; g < 3; g++) {
      scribbleCircle(ctx, 31 + (r() - 0.5) * 3, 68 + g * 12, 3.6, r, { width: 1, alpha: 0.55 });
    }
  });
}

/**
 * MARGET. A posture, a place, a routine and a name (STORY §7) — and
 * nothing about her ever changes, including on the day the market
 * opens. She is an apron and a pair of hands held in front of her, and
 * she has no face, because nobody in this world has one but the walker.
 */
export function margetTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(96, 176, seed, (ctx, r) => {
    scribbleCircle(ctx, 48, 32, 14, r, { width: 2, alpha: 0.85 }, 1.1);
    // hair pinned back, which is one line and is not a face
    stroke(ctx, [[35, 26], [40, 16], [58, 16], [62, 27]], r, { width: 1.6, alpha: 0.7 });
    // the body: a working dress, long
    poly(ctx, [[38, 48], [26, 128], [70, 128], [58, 48]], r, { width: 2, alpha: 0.85 });
    // THE APRON — the whole of her costume, and the only thing that
    // tells you she is behind the stall rather than in front of it
    fillPoly(ctx, [[40, 62], [32, 124], [64, 124], [56, 62]], CREAM, 0.55);
    poly(ctx, [[40, 62], [32, 124], [64, 124], [56, 62]], r, { width: 1.4, alpha: 0.6 });
    line(ctx, 40, 62, 44, 50, r, { width: 1.2, alpha: 0.55, passes: 1 });
    line(ctx, 56, 62, 52, 50, r, { width: 1.2, alpha: 0.55, passes: 1 });
    // hands held in front, one over the other. Waiting is a posture
    stroke(ctx, [[38, 58], [30, 84], [44, 92]], r, { width: 1.8, alpha: 0.82 });
    stroke(ctx, [[58, 58], [66, 84], [52, 92]], r, { width: 1.8, alpha: 0.82 });
    line(ctx, 30, 128, 34, 164, r, { width: 1.8, alpha: 0.82 });
    line(ctx, 66, 128, 62, 164, r, { width: 1.8, alpha: 0.82 });
  });
}

/**
 * THE MARKET BOARD — chalked at the cross the day the market is called,
 * and it never comes down again.
 *
 * QUESTS §3.3, and it is the channel this project has left unused for
 * six sessions: *the world can be WRITTEN ON.* We hand-letter
 * everything and have only ever spent it on UI. This is a notice
 * actually standing in the square rather than described on a card — and
 * it is the permanent half of Brim's change, the half that is there at
 * every hour, including the ones the stall is packed away for.
 */
export function marketBoardTexture(seed: number): THREE.CanvasTexture {
  return makeTexture(224, 160, seed, (ctx, r) => {
    // two short legs and a whitewashed board
    line(ctx, 46, 156, 52, 108, r, { width: 2.4, alpha: 0.85 });
    line(ctx, 178, 156, 172, 108, r, { width: 2.4, alpha: 0.85 });
    fillPoly(ctx, [[20, 14], [204, 10], [206, 116], [18, 120]], PLASTER, 0.86);
    poly(ctx, [[20, 14], [204, 10], [206, 116], [18, 120]], r, { width: 2.4, alpha: 0.9, color: TIMBER });
    // written on it, by a hand, at world scale
    letteringFit(ctx, 'MARKET', 34, 60, 156, 40, r, { alpha: 0.9, crooked: 0.55 });
    letteringFit(ctx, 'EVERY DAY', 34, 88, 156, 20, r, { alpha: 0.75, crooked: 0.6 });
    letteringFit(ctx, 'FROM THE BELL', 34, 110, 156, 18, r, { alpha: 0.72, crooked: 0.6 });
    // and the chalk it was written with, left on the ledge
    line(ctx, 150, 122, 166, 121, r, { width: 3, alpha: 0.5, passes: 1, color: CREAM });
  });
}
