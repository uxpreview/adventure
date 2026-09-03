import * as THREE from 'three';
import { ringTexture, loopsTexture, rng } from '../../engine/ink';
import { hayBaleTexture, doodleFolkTexture, logTexture, wheatDecal } from '../textures';
import {
  leanGrassTexture, tallGrassTexture, driftFlowersTexture, commonOakTexture,
  wornGroundDecal, wheelRutsDecal, commonWellTexture, crossroadsSignTexture,
  milestoneTexture, hayCartTexture, hedgerowTexture, longFenceTexture,
  fistStoneTexture, wellRopeTexture, wellBucketTexture,
  leafLitterDecal, reedsTexture, ropeSwingTexture, swallowTexture,
  keepVistaTexture,
  nellTexture, fieldGateTexture, bullTexture, seaGlintTexture, millSmokeTexture,
  cityTowersTexture, maypoleTexture, fairBoardTexture,
} from '../textures-common';
import { goatTexture } from '../textures-wood';
import { things } from '../things';
import { events } from '../events';
import { barriers } from '../barriers';
import { Follower } from '../company';
import { knowledge } from '../knowledge';
import { SPEC_BY_ID } from '../layout';
import { platform } from '../../engine/Eight15';
import type { RegionBuilder, WorldPOI } from './index';

function say(name: string) {
  window.dispatchEvent(new CustomEvent('inklands:event', { detail: name }));
}

/* ================================================================== *
 * THE COMMON AS THE PLATEAU — the first two local rules in the game
 * (Session 15, `QUESTS.md` §8, `THE-FUN-PASS` §3 item 3 and §5).
 *
 * THE WELL ANSWERS A SHOUT. `THE-STRANGERS` U7 has said since Session
 * 7 that it does, once, on a delay that is too long; it was a note you
 * read. It is a touch now: shout, and the shaft takes it, and nothing
 * comes back for long enough that you have stopped waiting — and then
 * it does, thinner and lower, and a drop reaches the water after it.
 * Repeatable, because a local rule is a thing you can keep doing
 * (§8), which supersedes U7's *once*.
 *
 * THE HAY CART CAN BE PUSHED. It rolls, it slows, it stops at the edge
 * of the Common, and it stays where you left it in every later save.
 * It is the first thing the walker has ever moved. Session 16 makes
 * it get away; NELL's second door (`THE-FUN-PASS` §6) is pushing it
 * down a road to a border. Nobody crosses a border but the walker:
 * `things.ts` clamps it to this rect and no path in that file can put
 * it outside one.
 *
 * AND A STONE, so carry and throw have something to be about. It props
 * the field gate. Pick it up, walk with it in hand, throw it: at the
 * river it plops, on the page it knocks, down the well it is gone —
 * and the well answers that too — until the morning, when it is back
 * by the gate and nothing says who put it there.
 * ================================================================== */
const WELL_ANSWER_DELAY = 3.4;
/** The shout, and when the answer is due. Module scope, because the
 *  touch lives on the POI list and the answer lives in the builder. */
const well = {
  answerAt: -1, kind: 'shout' as 'shout' | 'stone', lift: false,
  /** THE BUCKET, which is the answer you can see: at rest on its rope;
   *  dropping into the shaft at the shout; down in the dark while the
   *  well takes its time; rising and swinging when it answers. */
  bucket: 'rest' as 'rest' | 'drop' | 'down' | 'rise' | 'bob',
  bt: 0,
  /** A refused shove rocks the cart; a stone in the river rings. Both
   *  are the owner's rule of 2026-09-02: a visual cue, not just audio. */
  cartRock: 0,
  ripple: { t: -1, x: 0, z: 0 },
};

things.register({
  id: 'hay-cart', kind: 'pushable', land: 'meadow', name: 'THE CART',
  home: { x: 20, z: 76.5 }, shove: 5.5,
});
/* THE STONE'S HOME IS OUTSIDE EVERY OTHER PLACE'S REACH. The first
 * position (13.6, 68.2) was five units from THE LONG FENCE's POI, inside
 * its reach of six, so the moment the stone was in the hand the key
 * offered LEAN ON THE STILE instead of the throw — a thing in reach
 * beats the thing in the hand, which is the rule, and the rule is why a
 * carriable must not live inside anybody's reach. Ten from the fence,
 * six from the cart at rest. */
things.register({
  id: 'fist-stone', kind: 'carriable', land: 'meadow', name: 'THE STONE',
  home: { x: 18.5, z: 70.5 },
});
things.addCatcher('the-well', -57.6, 44.6, 1.9);

/* ================================================================== *
 * THE FIRST HOUR (Session 16, `THE-FUN-PASS` §11) — THE BULL, THE FOUR
 * LURES, THE COMMON AS THE PLATEAU. The owner's words this answers:
 * *"the starting point is bland and expected but also confuses users
 * because they don't know where to go or what to do."*
 *
 * You wake in the wheat south of the long fence. A bull is already
 * looking at you. You run — taught by necessity, in ten seconds — it
 * chases, NELL slams the field gate, and the bull stops at the fence,
 * because the fence is a rule. Then you are on the east road with the
 * crossroads forty units west and four things on the horizon: the
 * castle, the mill's smoke, the glint of the sea, the city's towers.
 * A goat falls in beside you. Whichever road you take, it stops dead
 * at the Common's edge, and you go on.
 *
 * Nothing here is a fail state, a timer or a villain. The bull never
 * touches you: it stops two strides short, every time, and snorts. Fear
 * is a sound, a distance and a thing that moved (`THE-FUN-PASS` §2.3).
 * ================================================================== */

/** THE FIELD, which is the bull's whole land. The long fence is its
 *  north edge, the hedge return its west, and the bull is drawn in
 *  this rect's ink and cannot leave it — `company.ts`'s rule, applied
 *  to a thing that chases rather than follows. */
const FIELD = { minX: -10, maxX: 46, minZ: 65.6, maxZ: 112 };
/** How far inside the field's edge the bull stops: its nose at the
 *  rails. */
const BULL_MARGIN = 0.7;
const FENCE_Z = 64.5;
/** THE FIELD GATE IS IN THE WEST HEDGE, not the north fence — and the
 *  reason is the camera. It only ever looks north, so a bull chasing
 *  you north is behind the lens the whole way and its stop at the rails
 *  happens behind your back. A chase that CROSSES the frame is seen:
 *  you wake at the field's east end, the bull comes at you from the
 *  east, you run west with it beside you in the picture, through the
 *  gate in the hedge, and it stops at the hedge to your right — in
 *  frame — while Nell shuts the gate. The hedge is the fence it stops
 *  at; the long fence keeps its stile and its old gate stays shut. */
const HEDGE_X = -12;
const GATE = { x: HEDGE_X, z: 82 };
const STILE = { x: 12.6, z: 63.8 };
/** In frame from the spawn on both rigs: nine units east and ten north
 *  of where you wake, on the edge of portrait's frame and well inside
 *  desktop's. The gate is due west, so the run is away from it and it
 *  comes at you from your right and stays there. */
const BULL_HOME = { x: 33, z: 80 };

/* THE FENCE IS A RULE FOR THE WALKER, since Session 16 (`barriers.ts`).
 * One segment the length of the drawn run, a stile you can always get
 * over, and a gate that is open until Nell shuts it. */
barriers.register({
  id: 'the-long-fence', x0: -12, z0: FENCE_Z, x1: 44, z1: FENCE_Z, half: 0.9,
  gaps: [{ id: 'the-stile', x: STILE.x, z: STILE.z, r: 1.15, open: true }],
});
barriers.register({
  id: 'the-hedge-return', x0: HEDGE_X, z0: FENCE_Z, x1: HEDGE_X, z1: 104, half: 1.5,
  gaps: [{ id: 'the-field-gate', x: GATE.x, z: GATE.z, r: 1.4, open: true }],
});

/** THE GOAT — the second co-walker, and the first thing in the game to
 *  show the rule rather than say it. Drawn in the Common's ink; it
 *  follows you anywhere on the Common and stops dead at the edge, on
 *  every road. (The Penwood's goat runs away; `THE-STRANGERS` E12 says
 *  a goat gets out. This is the one that did.) */
const goat = new Follower({
  id: 'the-common-goat', rect: SPEC_BY_ID.meadow.rect, home: { x: -22, z: 72 },
  gap: 3.2, notice: 18, walk: 3.6, trot: 8.6, margin: 2,
  // it will not go in with the bull, and it does not follow you in
  keepOut: { minX: -14, maxX: 46, minZ: 63, maxZ: 112 },
});

/** THE OPENING'S STATE, for the builder, the POIs and the harness. */
export const common = {
  bull: { x: BULL_HOME.x, z: BULL_HOME.z, state: 'graze' as 'graze' | 'watch' | 'charge' | 'balk' | 'fence' | 'home', t: 0, face: -1, stride: 0, balks: 0 },
  gate: { shut: false },
  nell: { pose: 0 as 0 | 1 | 2, t: 0, straightFor: 0 },
  goat,
  /** Put the opening back where a fresh page has it: the harness's. */
  reset() {
    this.bull.x = BULL_HOME.x; this.bull.z = BULL_HOME.z; this.bull.state = 'graze';
    this.bull.t = 0; this.bull.balks = 0;
    this.gate.shut = false;
    barriers.gap('the-field-gate')!.open = true;
    this.nell.pose = 0; this.nell.t = 0;
    goat.reset();
  },
};

/* THE MORNING PUTS THINGS BACK — the Common's own scheduled event, and
 * the smallest one in the game: at first light anything the walker
 * lost (down the well, in the river) is at its home again. It fires
 * whether or not anybody is there, which is the whole point. */
events.register({
  id: 'the-common-morning', land: 'meadow', at: 5.9, hours: 0.2,
  place: { x: 18.5, z: 70.5 },
  onStart: () => things.morning(),
});

/**
 * THE COMMON — rebuilt to design/specs/the-common.md (Session 2).
 *
 * Six places, three seams, two composed voids. Everything green goes
 * through the cluster scatter so nothing reads as an array; every
 * place stands on worn ground; the north edge is the poster's horizon
 * (the keep vista here, the wall itself on the kingdom's side).
 */

const OAKS = { x: -98, z: 26 };
const WELL = { x: -57, z: 45 };

export const buildMeadow: RegionBuilder = (ctx) => {
  const { r, terrain } = ctx;

  /* ---- cluster scatter: hearts, then jittered members ------------- */
  const dropAt = (x: number, z: number, avoidOakShade = true) => {
    if (x < ctx.rect.minX + 4 || x > ctx.rect.maxX - 4) return false;
    if (z < ctx.rect.minZ + 4 || z > ctx.rect.maxZ - 4) return false;
    if (terrain.waterAt(x, z) > 0.04 || terrain.roadAt(x, z)) return false;
    // the shade void under the oaks stays bare
    if (avoidOakShade && Math.hypot(x - OAKS.x, z - OAKS.z) < 9) return false;
    // the worn floors of the places stay bare too
    if (Math.hypot(x + 45, z - 58) < 6) return false;
    if (Math.hypot(x - WELL.x, z - WELL.z) < 4) return false;
    return true;
  };
  const clustered = (
    hearts: [number, number][], per: [number, number], rad: number
  ): [number, number][] => {
    const out: [number, number][] = [];
    for (const [hx, hz] of hearts) {
      const n = per[0] + Math.floor(r() * (per[1] - per[0]));
      for (let i = 0; i < n; i++) {
        const a = r() * Math.PI * 2;
        const d = Math.pow(r(), 0.6) * rad;
        const x = hx + Math.cos(a) * d;
        const z = hz + Math.sin(a) * d * 0.85;
        if (dropAt(x, z)) out.push([x, z]);
      }
    }
    return out;
  };

  /* ---- the grass: six drawings, wind-swayed, clustered ------------ */
  // hearts thin toward the west void and stay out of the gate corridor
  const grassHearts: [number, number][] = [
    [-70, 30], [-84, 56], [-62, 82], [-95, 92], [-30, 100], [-18, 42],
    [-2, 74], [16, 22], [26, 54], [40, 92], [48, 32], [-110, 22],
    [-128, 62], [8, 100],
  ];
  const grassPts = clustered(grassHearts, [9, 17], 8);
  // strays between clusters, sparse
  ctx.scatter(40, { minDist: 5 }).forEach(([x, z]) => {
    if (x > -112 && dropAt(x, z)) grassPts.push([x, z]);
  });
  const perVariant = Math.ceil(grassPts.length / 6);
  for (let v = 0; v < 6; v++) {
    const pts = grassPts.slice(v * perVariant, (v + 1) * perVariant);
    if (!pts.length) continue;
    const f = ctx.field(leanGrassTexture(300 + v), pts.length,
      { w: 1.7, h: 1.15, wind: { amp: 0.06, freq: 1.15 } });
    // the lean is drawn in: never flipped, so the wind stays one wind
    pts.forEach(([x, z], i) => f.set(i, x, z, 0.7 + r() * 0.6, 0, false));
  }

  /* ---- the near layer: tall seedheads at the road shoulders ------- */
  const tallPts: [number, number][] = [];
  for (let z = 66; z < 116; z += 3.5 + r() * 3) {
    tallPts.push([-51 - r() * 2.5, z], [-38.5 + r() * 2.5, z + 1.7]);
  }
  for (let x = -30; x < 52; x += 4 + r() * 3.5) {
    tallPts.push([x, 52 - 4.2 - r() * 2.5]);
  }
  /* THE LONG GRASS YOU WAKE IN (Session 16): a stand of seedheads round
   * the spawn, south of the wheat, so the first frame is grass at eye
   * level with a bull's horns over it. Its own seed, not the land's
   * stream, so nothing built after it moves (Session 15's gotcha). */
  {
    const gr = rng(1601);
    for (let i = 0; i < 26; i++) {
      const a = gr() * Math.PI * 2;
      const d = 1.6 + Math.pow(gr(), 0.7) * 6.5;
      tallPts.push([24 + Math.cos(a) * d, 90 + Math.sin(a) * d * 0.7]);
    }
  }
  for (let i = 0; i < 3; i++) {
    const pts = tallPts.filter((_, k) => k % 3 === i).filter(([x, z]) => dropAt(x, z, false));
    if (!pts.length) continue;
    const f = ctx.field(tallGrassTexture(320 + i), pts.length,
      { w: 1.9, h: 1.9, wind: { amp: 0.11, freq: 0.95 } });
    pts.forEach(([x, z], k) => f.set(k, x, z, 0.75 + r() * 0.5, 0, false));
  }

  /* ---- the drifts: one species each --------------------------------- */
  const drifts: { hearts: [number, number][]; species: 0 | 1 | 2; seed: number }[] = [
    // poppies at the well — the accent color kept low and close
    { hearts: [[-62, 41], [-53, 50]], species: 0, seed: 340 },
    // oxeye trailing west along the coast road into the void
    { hearts: [[-82, 65], [-108, 55], [-134, 62]], species: 1, seed: 342 },
    // buttercups along the long fence
    { hearts: [[4, 70], [22, 72], [34, 64]], species: 2, seed: 344 },
  ];
  for (const d of drifts) {
    const pts = clustered(d.hearts, [6, 12], 6);
    if (!pts.length) continue;
    for (let v = 0; v < 2; v++) {
      const sub = pts.filter((_, k) => k % 2 === v);
      if (!sub.length) continue;
      const f = ctx.field(driftFlowersTexture(d.seed + v, d.species), sub.length,
        { w: 1.9, h: 1.45, wind: { amp: 0.05, freq: 1.3 } });
      sub.forEach(([x, z], i) => f.set(i, x, z, 0.7 + r() * 0.45, 0, false));
    }
  }

  /* ---- THE CROSSROADS --------------------------------------------- */
  ctx.decal(wornGroundDecal(400), 13, 13, -45, 58, 0.3, 0.75);
  ctx.decal(ringTexture(), 4, 4, -45, 58, 0, 0.5);
  ctx.standee(crossroadsSignTexture(401), 4.0, 4.7, -42, 52);
  ctx.standee(milestoneTexture(402), 1.1, 1.4, -49.5, 63);
  // the surviving warm-up loops: the pen tried the pen here, once
  ctx.decal(loopsTexture(), 7, 2.6, -37, 63.5, 0.35, 0.22);
  // the foot-path scuffs toward the well
  ctx.decal(wornGroundDecal(403), 6, 3.6, -50, 52, 0.85, 0.45);
  ctx.decal(wornGroundDecal(404), 5, 3.2, -54, 48, 0.8, 0.4);

  /* ---- THE OLD WELL ----------------------------------------------- */
  ctx.decal(wornGroundDecal(410), 9, 8, WELL.x, WELL.z, 1.2, 0.6);
  ctx.standee(commonWellTexture(411), 4.4, 5.5, WELL.x - 1, WELL.z - 1);
  /* THE ROPE AND THE BUCKET (Session 15), the visible half of the
   * well's answer. Hung from the windlass — 95 of 240 down the well's
   * canvas, which is 3.32 units up on a 5.5-unit standee — a hair
   * behind the well's own plane so the shaft's dark reads over them as
   * they go down. The rope's pivot is its top, so its length is a scale;
   * the bucket hangs off the rope's end. */
  const WINDLASS = 3.32;
  const BUCKET_H = 0.46;
  const ROPE_REST = 0.94;
  const wellY = ctx.groundY(WELL.x - 1, WELL.z - 1);
  const rope = ctx.standee(wellRopeTexture(412), 0.37, 1, WELL.x - 1, WELL.z - 1.06);
  rope.geometry.translate(0, -1, 0);
  rope.position.y = wellY + WINDLASS;
  rope.scale.y = ROPE_REST;
  const bucket = ctx.standee(wellBucketTexture(413), 0.46, BUCKET_H, WELL.x - 1, WELL.z - 1.06);
  bucket.geometry.translate(0, -BUCKET_H, 0);
  bucket.position.y = wellY + WINDLASS - ROPE_REST;
  const bucketMat = bucket.material as THREE.MeshBasicMaterial;
  const ropeMat = rope.material as THREE.MeshBasicMaterial;
  for (const m of [bucketMat, ropeMat]) m.transparent = true;

  /* ---- THE ARGUING OAKS ------------------------------------------- */
  ctx.standee(commonOakTexture(420, 0), 11.5, 12.9, OAKS.x - 6, OAKS.z - 3);
  ctx.standee(commonOakTexture(421, 1), 10.2, 11.5, OAKS.x + 8, OAKS.z + 3.5);
  ctx.standee(commonOakTexture(422, 2), 10.8, 12.2, OAKS.x - 1, OAKS.z + 10);
  ctx.decal(leafLitterDecal(423), 9, 5.5, OAKS.x - 3, OAKS.z + 2, 0.4, 0.7);
  ctx.decal(leafLitterDecal(424), 7, 4.5, OAKS.x + 5, OAKS.z + 6, 1.7, 0.6);
  ctx.decal(wornGroundDecal(425), 6, 5, OAKS.x + 7.5, OAKS.z + 1.5, 0.2, 0.5);
  ctx.standee(logTexture(426), 3.1, 1.4, OAKS.x - 4, OAKS.z + 5.5, { rotY: 0.35 });
  // the rope swing hangs from the leaning oak; pivot re-seated to the top
  const swing = ctx.standee(ropeSwingTexture(427), 1.5, 3.0, OAKS.x + 7.4, OAKS.z + 3.2);
  swing.geometry.translate(0, -3.0, 0);
  ctx.hang(swing, 5.6);

  /* ---- THE GATE FIELDS: hedgerows funnel the king's road ---------- */
  ctx.standee(hedgerowTexture(430), 15, 6.6, -55, 22);
  ctx.standee(hedgerowTexture(431, true), 15, 6.6, -56, 7);
  ctx.standee(hedgerowTexture(432), 14, 6.2, -35, 17);
  ctx.standee(hedgerowTexture(433), 15, 6.6, -34, 2);
  ctx.decal(wheelRutsDecal(434), 12, 6, -45, 24, Math.PI / 2, 0.7);
  ctx.decal(wheelRutsDecal(435), 12, 6, -45, 10, Math.PI / 2, 0.8);
  ctx.decal(wheelRutsDecal(436), 11, 5.5, -45, 38, Math.PI / 2, 0.5);

  /* ---- THE LONG FENCE --------------------------------------------- */
  /* The long fence as Session 2 drew it: its gate (the sixth panel) is
   * a drawing of a shut gate, and the stile is the way over. */
  const fenceRun: { x: number; kind: 0 | 1 | 2 | 3 | 4 }[] = [
    { x: -12, kind: 0 }, { x: -5, kind: 1 }, { x: 2, kind: 0 },
    { x: 9, kind: 2 }, { x: 16, kind: 0 }, { x: 23, kind: 3 },
    { x: 30, kind: 0 }, { x: 37, kind: 1 },
  ];
  fenceRun.forEach((seg, i) =>
    ctx.standee(longFenceTexture(440 + i, seg.kind), 7, 2.6, seg.x + 3.5,
      FENCE_Z + Math.sin(i * 1.7) * 0.8));
  /* THE HEDGE RETURN: the field's west side, so the bull's stop there
   * is a thing you can see and not a line you cannot. Hedgerow masses
   * stepped south, the way the gate fields' hedges are stepped north —
   * a hedge that runs away from the camera is a column of hedge, and it
   * reads — with the gate in the gap between the second and the third. */
  ctx.standee(hedgerowTexture(1612), 12, 5.6, HEDGE_X, 69);
  ctx.standee(hedgerowTexture(1613), 11, 5.2, HEDGE_X - 0.4, 76.5);
  ctx.standee(hedgerowTexture(1615, true), 11, 5.2, HEDGE_X + 0.3, 88);
  ctx.standee(hedgerowTexture(1614), 12, 5.6, HEDGE_X, 96);
  ctx.standee(hedgerowTexture(1616), 11, 5.0, HEDGE_X - 0.3, 103);
  /* THE GATE: its frame — two posts and a rail either side, one fence
   * panel's worth — and the leaf, open and shut, two drawings, one
   * showing. */
  ctx.standee(longFenceTexture(1609, 4), 7, 2.6, GATE.x, GATE.z + 0.3);
  const gateOpen = ctx.standee(fieldGateTexture(1610, false), 2.6, 2.6, GATE.x, GATE.z + 0.35);
  const gateShut = ctx.standee(fieldGateTexture(1611, true), 2.6, 2.6, GATE.x, GATE.z + 0.35);
  gateShut.visible = false;
  // the fence dies out east of the gate: one leaning post, then nothing
  ctx.standee(milestoneTexture(449), 1.1, 1.5, 45, 66);
  ctx.decal(wornGroundDecal(450), 5, 4, 9.5, 62.5, 0.4, 0.5);
  // the implied field beyond: the hay cart, bales, a stand of wheat
  /* THE CART IS A THING NOW (things.ts): the registry moves it and this
   * builder draws it where the registry says. Its refusals are the
   * river and the roads' cousins, the steep; the border is the
   * registry's own. */
  const cartThing = things.get('hay-cart')!;
  cartThing.def.refuse = (x, z) =>
    terrain.waterAt(x, z) > 0.04 || terrain.slopeAt(x, z) > 0.5 || barriers.blocks(x, z);
  const cart = ctx.standee(hayCartTexture(451), 5.6, 4.0, cartThing.x, cartThing.z, { rotY: -0.25 });
  cartThing.mesh = cart;
  /* THE CART LOADED AND TURNED NORTH — NELL's first door, drawn from
   * behind, at the cart's home. Shown instead of the cart once
   * `door:the-cart-turned-north` is known; the registry pins the cart
   * home and the push is retired. */
  const cartLoaded = ctx.standee(hayCartTexture(1620, true), 5.4, 4.2, cartThing.def.home.x, cartThing.def.home.z);
  cartLoaded.visible = false;
  /* AND THE STONE, by the gate it props. The mesh is only drawn when the
   * stone is on the ground or in the air; in the hand it is the walker's
   * own drawing of it (`Character.hold`). */
  const stoneThing = things.get('fist-stone')!;
  const stone = ctx.standee(fistStoneTexture(452), 0.5, 0.5, stoneThing.x, stoneThing.z);
  stoneThing.mesh = stone;
  /* THE RIPPLE: a stone into the river rings once, the crossroads'
   * own ring drawing spreading and fading on the water. Hidden until a
   * landing in water asks for it. */
  const ripple = ctx.decal(ringTexture(), 1, 1, 44, 100, 0, 0.5);
  ripple.visible = false;
  const rippleMat = ripple.material as THREE.MeshBasicMaterial;
  // bales stand clear of the cart: beside its wheel they read as spares
  ctx.standee(hayBaleTexture(452), 3.2, 2.4, 33, 81);
  ctx.standee(hayBaleTexture(453), 2.7, 2.0, 37.5, 77);
  for (let i = 0; i < 5; i++) {
    ctx.decal(wheatDecal(454 + i), 10, 6.6, -2 + i * 9 + r() * 3, 76 + r() * 8, r() * 0.4, 0.55);
  }
  /* NELL, at the gate, watching the road — three drawings, one showing
   * (`THE-WAITS` §9; the doodle-folk figure that stood here since
   * Session 2 is retired, because she has a name now and a name is
   * three drawings). She stands a step east of the leaf's hinge, on
   * the fence line, and she faces WEST, up the east road toward the
   * crossroads, because that is the road people come down. */
  const NELL = { x: HEDGE_X - 2.4, z: 82.6 };
  const nellPoses = [0, 1, 2].map((p) =>
    ctx.standee(nellTexture(1630 + p, p as 0 | 1 | 2), 1.15, 1.9, NELL.x, NELL.z));

  /* THE BULL: three drawings, one showing, mirrored to face its way. */
  const bullPoses = [0, 1, 2].map((p) =>
    ctx.standee(bullTexture(1640 + p, p as 0 | 1 | 2), 3.6, 2.4, BULL_HOME.x, BULL_HOME.z));
  // its own trodden ground, where it has stood the longest
  ctx.decal(wornGroundDecal(1643), 7, 6, BULL_HOME.x, BULL_HOME.z + 0.5, 0.6, 0.45);

  /* THE GOAT: the Penwood's four postures, as one-off standees rather
   * than a field, because a standee has no birth to get wrong
   * (`StandeeField.hide`'s note) and there is one of it. */
  const goatPoses = [0, 1, 2, 3].map((p) =>
    ctx.standee(goatTexture(1650 + p, p as 0 | 1 | 2 | 3), 2.2, 1.65, goat.x, goat.z));

  void doodleFolkTexture;

  /* ---- RIVERBEND --------------------------------------------------- */
  const reedSpots: [number, number, number][] = [
    [44, 96, 1.0], [50.5, 91, 0.85], [38, 104, 1.1], [47, 103, 0.8],
    [33, 111, 0.95], [42, 111.5, 0.7],
  ];
  reedSpots.forEach(([x, z, s], i) =>
    ctx.standee(reedsTexture(460 + (i % 2)), 2.6 * s, 2.6 * s, x, z));

  /* ---- the west void's one midpoint ------------------------------- */
  ctx.standee(milestoneTexture(470), 1.4, 1.8, -118, 62.5);

  /* ---- the north horizon: Greyweather ghosted above Brim ----------- *
   * False perspective: the real keep is 180 units further out, fogged
   * to nothing. This pencil stand-in gives the poster its third layer
   * and fades away before the walker can catch it working.            */
  const vista = ctx.standee(keepVistaTexture(480), 48, 32, -52, -52, { opacity: 0.8 });
  (vista.material as THREE.MeshBasicMaterial).fog = false;
  const vistaMat = vista.material as THREE.MeshBasicMaterial;

  /* ---- THE FOUR LURES (Session 16, `THE-FUN-PASS` §11 candidate 2) --- *
   * The keep is one of the four and has stood here since Session 2.
   * The other three are built the same way — false perspective with
   * `fog = false`, pencil-pale, and fading before the walker can catch
   * them working — and PLACED WHERE THE FRAME CAN HOLD THEM rather than
   * at their true bearings, because the camera is due north and the
   * frame is 68.6° across on desktop and 26.5° in portrait. The sea IS
   * north-west of here, and the mill north-east; the towers are the
   * lie, drawn to the right of the mill's smoke because the city is
   * further off than the mill and reached past it. The map tells the
   * truth. The angles, from the crossroads, off north:
   *
   *   the keep      −4°     the sea    −25°
   *   the mill      +24°    the towers +30°
   *
   * so desktop holds all four at rest; portrait holds the keep at rest
   * and the sea and the mill on a full peek (12°), and never the towers.
   * `tools/check-lures.mjs` measures it. */
  const seaGlint = ctx.standee(seaGlintTexture(1660), 40, 15, -92, -44, { opacity: 0.7 });
  ctx.hang(seaGlint, 7);
  const millSmoke = ctx.standee(millSmokeTexture(1661), 7, 18, 0, -44, { opacity: 0.7 });
  ctx.hang(millSmoke, 4.5);
  const towers = ctx.standee(cityTowersTexture(1662), 30, 17.5, 28, -70, { opacity: 0.55 });
  ctx.hang(towers, 4);
  const lures = [seaGlint, millSmoke, towers].map((m) => {
    const mat = m.material as THREE.MeshBasicMaterial;
    mat.fog = false;
    mat.transparent = true;
    return { m, mat, base: mat.opacity };
  });

  /* ---- THE FAIR GROUND (a district, new) --------------------------- *
   * The open grass south-west of the crossroads was a composed void.
   * It is where the fair is held, and the fair is not on: a ring in
   * the grass where the roundabout goes, a maypole nobody has taken
   * down, a board that says THE FAIR and, under it, NEXT. */
  ctx.decal(wornGroundDecal(1670), 13, 12, -95, 99, 0.3, 0.42);
  ctx.decal(ringTexture(), 11, 11, -95, 99, 0, 0.26);
  const maypole = ctx.standee(maypoleTexture(1671), 1.3, 4.3, -95, 96.5);
  ctx.standee(fairBoardTexture(1672), 2.6, 2.6, -104, 104);
  ctx.standee(hayBaleTexture(1673), 2.6, 2.0, -86, 104.5);
  ctx.standee(hayBaleTexture(1674), 2.2, 1.7, -103, 92);

  /* ---- the swallows ------------------------------------------------ */
  const swallows = [
    { m: ctx.standee(swallowTexture(490), 1.6, 0.8, -70, 40), cx: -72, cz: 44, rx: 16, rz: 9, w: 0.42, ph: 0 },
    { m: ctx.standee(swallowTexture(491), 1.4, 0.7, -55, 60), cx: -58, cz: 62, rx: 13, rz: 11, w: 0.55, ph: 2.4 },
  ];

  /* THE SWALLOWS FLINCH when the well is shouted down: for a few
   *  seconds they loop faster and higher, which is the one visible
   *  answer the shout gets and the only one a player with the sound
   *  off will see. */
  let flinch = 0;
  let stoneWasFlying = false;
  const cartRest = cart.rotation.z;
  let goatBleat = 0;
  let prevPx = 0;
  let prevPz = 0;
  let firstFrame = true;
  const gateGap = barriers.gap('the-field-gate')!;
  const inField = (x: number, z: number) =>
    x >= FIELD.minX && x < FIELD.maxX && z >= FIELD.minZ && z < FIELD.maxZ;

  return (dt: number, t: number, px: number, pz: number) => {
    // the swing: a slow pendulum nobody is sitting in
    swing.rotation.z = Math.sin(t * 0.9) * 0.07 + Math.sin(t * 0.37) * 0.03;
    const walkerSpeed = firstFrame ? 0 : Math.hypot(px - prevPx, pz - prevPz) / Math.max(1e-3, dt);
    firstFrame = false;
    prevPx = px;
    prevPz = pz;

    /* ================================================================ *
     * THE BULL — a local stake, never a fail state.
     *
     *   graze   head down, at home
     *   watch   head up, facing you: it has noticed
     *   charge  at you, faster than you can run, and it pulls up two
     *           strides short every time
     *   balk    stopped in your face, snorting; then again
     *   fence   it ran at you and the field's edge held it. It stands
     *           at the fence and looks; after a while it goes home
     *   home    walking back
     * ================================================================ */
    const B = common.bull;
    const bd = Math.hypot(px - B.x, pz - B.z);
    const walkerIn = inField(px, pz);
    const leash = Math.hypot(B.x - BULL_HOME.x, B.z - BULL_HOME.z);
    B.t += dt;
    const clampField = (x: number, z: number): [number, number] => [
      Math.max(FIELD.minX + BULL_MARGIN, Math.min(FIELD.maxX - BULL_MARGIN, x)),
      Math.max(FIELD.minZ + BULL_MARGIN, Math.min(FIELD.maxZ - BULL_MARGIN, z)),
    ];
    if (B.state === 'graze') {
      if (walkerIn && bd < 26) { B.state = 'watch'; B.t = 0; }
    } else if (B.state === 'watch') {
      B.face = px < B.x ? -1 : 1;
      if (!walkerIn || bd > 36) { B.state = 'graze'; B.t = 0; B.balks = 0; }
      else if ((B.t > 1.1 || walkerSpeed > 1.2) && B.t > 0.35 && leash < 40) {
        B.state = 'charge'; B.t = 0; B.stride = 0;
        say('bull-snort');
        /* THE RUN IS TAUGHT BY NECESSITY. App prints the one hint the
         * game is allowed to print, now, if this player has never been
         * told; Session 12's six-seconds-of-walking rule is what an old
         * save still gets. */
        window.dispatchEvent(new CustomEvent('inklands:run-now'));
      }
    } else if (B.state === 'charge') {
      const speed = 8.4;
      const ux = (px - B.x) / Math.max(1e-3, bd);
      const uz = (pz - B.z) / Math.max(1e-3, bd);
      B.face = ux < 0 ? -1 : 1;
      /* IT NEVER TOUCHES YOU: it will not step inside two strides. */
      const step = Math.min(speed * dt, Math.max(0, bd - 2.3));
      const [nx, nz] = clampField(B.x + ux * step, B.z + uz * step);
      const moved = Math.hypot(nx - B.x, nz - B.z);
      B.stride += moved;
      if (B.stride > 2.6) { B.stride = 0; say('bull-hooves'); }
      B.x = nx; B.z = nz;
      if (!walkerIn && moved < step - 1e-3) {
        /* THE FENCE IS A RULE. The walker is out and the edge held it:
         * it stops dead, and says so. */
        B.state = 'fence'; B.t = 0;
        say('bull-snort');
      } else if (bd <= 2.35) {
        B.state = 'balk'; B.t = 0; B.balks++;
        say('bull-snort');
      } else if (!walkerIn && bd > 14) {
        B.state = 'fence'; B.t = 0;
      } else if (leash > 44) {
        B.state = 'home'; B.t = 0;
      }
    } else if (B.state === 'balk') {
      B.face = px < B.x ? -1 : 1;
      if (B.t > 1.1) {
        if (walkerIn && bd < 30 && B.balks < 3) { B.state = 'charge'; B.t = 0; B.stride = 0; }
        else if (walkerIn && bd < 30) { B.state = 'watch'; B.t = -3; B.balks = 0; }
        else { B.state = 'home'; B.t = 0; B.balks = 0; }
      }
    } else if (B.state === 'fence') {
      B.face = px < B.x ? -1 : 1;
      if (walkerIn && bd < 26) { B.state = 'watch'; B.t = 0; }
      else if (B.t > 6) { B.state = 'home'; B.t = 0; B.balks = 0; }
    } else if (B.state === 'home') {
      const hd = Math.hypot(BULL_HOME.x - B.x, BULL_HOME.z - B.z);
      if (hd < 0.4) { B.state = 'graze'; B.t = 0; B.face = -1; }
      else {
        const k = Math.min(hd, 2.4 * dt);
        B.face = BULL_HOME.x < B.x ? -1 : 1;
        B.x += ((BULL_HOME.x - B.x) / hd) * k;
        B.z += ((BULL_HOME.z - B.z) / hd) * k;
        if (walkerIn && bd < 20) { B.state = 'watch'; B.t = 0; }
      }
    }
    const bullPose = B.state === 'graze' ? 0 : B.state === 'charge' ? 2 : 1;
    for (let p = 0; p < 3; p++) {
      const m = bullPoses[p];
      m.visible = p === bullPose;
      m.position.set(B.x, ctx.groundY(B.x, B.z), B.z);
      // the drawing faces right; a bull going west is the same bull mirrored
      m.scale.x = B.face < 0 ? 1 : -1;
      // a charge rocks the mass; at rest it is exactly still
      m.rotation.z = B.state === 'charge' ? Math.sin(B.t * 18) * 0.05 : 0;
    }

    /* ================================================================ *
     * NELL, AND THE GATE. She leans. She straightens when somebody
     * comes up the road and settles when they are not who it is. When
     * the bull comes at the fence she slams the gate — the first thing
     * anybody in this world has done on purpose in front of the walker
     * — and when the cart moves she stands, and faces wherever it went,
     * from then on.
     * ================================================================ */
    const N = common.nell;
    N.t += dt;
    const cartMoved = Math.hypot(cartThing.x - cartThing.def.home.x, cartThing.z - cartThing.def.home.z) > 2;
    const turned = knowledge.has('door:the-cart-turned-north');
    const nearRoad = Math.hypot(px - NELL.x, pz - NELL.z) < 15 && px < HEDGE_X;
    const coming = B.state === 'charge' || (B.state === 'fence' && B.t < 2.5);
    const through = px < HEDGE_X - 0.6;
    const elsewhere = Math.abs(pz - GATE.z) > 6;
    const toHedge = B.x - HEDGE_X;
    if (!common.gate.shut && coming && toHedge > 0
      && ((through && toHedge < 16) || (elsewhere && toHedge < 5))) {
      /* THE SLAM: once you are through and it is coming — never in your
       * face — or, if you went over the stile or are being chased along
       * the fence, when it is all but at the rails. Never with anybody
       * standing in the gap: a gate shut on the walker would leave them
       * inside a rule with no way out. */
      const inGap = Math.abs(pz - GATE.z) < gateGap.r + 0.6 && Math.abs(px - HEDGE_X) < 2.2;
      if (!inGap) {
        common.gate.shut = true;
        gateGap.open = false;
        say('gate-slam');
        N.pose = 2; N.t = 0; N.straightFor = 7;
      }
    }
    if (N.pose === 2 && N.t > 0.7) { N.pose = 1; N.t = 0; }
    else if (N.pose === 1) {
      N.straightFor -= dt;
      if (N.straightFor <= 0 && !cartMoved && !turned) { N.pose = 0; N.t = 0; }
    } else if (N.pose === 0) {
      if (cartMoved || turned) { N.pose = 1; N.straightFor = Infinity; }
      else if (nearRoad && N.t > 2.5) { N.pose = 1; N.straightFor = 4; N.t = 0; }
    }
    gateOpen.visible = !common.gate.shut;
    gateShut.visible = common.gate.shut;
    // where her feet point: the crossroads, or the cart, or up the king's road
    const nellFace = turned ? 1 : cartMoved ? (cartThing.x < NELL.x ? -1 : 1) : -1;
    const nellOff = N.pose === 0 ? 0 : 0.45;
    const nellGone = platform.land === 'meadow';
    for (let p = 0; p < 3; p++) {
      const m = nellPoses[p];
      m.visible = p === N.pose && !nellGone;
      m.position.x = NELL.x + nellOff * -nellFace;
      m.scale.x = nellFace < 0 ? 1 : -1;
    }

    /* ================================================================ *
     * THE GOAT — `company.ts`'s rule, drawn. It follows; it stops at
     * the Common's edge; it bleats when it notices you and when the
     * border takes you away from it.
     * ================================================================ */
    const wasFollowing = goat.following;
    goat.tick(dt, px, pz, (x, z) => terrain.blockedAt(x, z) || barriers.blocks(x, z));
    if (!wasFollowing && goat.following) say('goat-bleat');
    if (goat.justStopped) say('goat-bleat');
    goatBleat -= dt;
    if (goat.following && goat.pose === 'trot' && goatBleat <= 0) { say('goat-bleat'); goatBleat = 9 + (t % 5); }
    const gp = goat.pose === 'walk' || goat.pose === 'trot' ? 1 : goat.pose === 'stopped' ? 2 : goat.atBorder ? 3 : 0;
    for (let p = 0; p < 4; p++) {
      const m = goatPoses[p];
      m.visible = p === gp;
      m.position.set(goat.x, ctx.groundY(goat.x, goat.z), goat.z);
      m.scale.x = goat.face < 0 ? 1 : -1;
    }

    /* ---- THE CART, where the registry has it ------------------------ */
    if (turned) {
      // the first door: loaded, roped, turned north, at home, and never
      // pushed again. The registry keeps it there.
      cartThing.x = cartThing.def.home.x;
      cartThing.z = cartThing.def.home.z;
      cartThing.vx = 0; cartThing.vz = 0;
    }
    cart.visible = !turned;
    cartLoaded.visible = turned;
    cart.position.set(cartThing.x, ctx.groundY(cartThing.x, cartThing.z), cartThing.z);
    // a cart going west is the same cart drawn the other way round
    if (Math.abs(cartThing.vx) > 0.3) cart.scale.x = cartThing.vx < 0 ? -1 : 1;
    // and a refused shove rocks it, arriving back at exactly rest
    if (well.cartRock > 0) {
      well.cartRock = Math.max(0, well.cartRock - dt);
      const k = well.cartRock / 0.5;
      cart.rotation.z = cartRest + Math.sin(k * Math.PI * 3) * 0.06 * k;
      if (well.cartRock === 0) cart.rotation.z = cartRest;
    }

    /* ---- THE STONE: on the ground, in the air, or nowhere ----------- */
    const fp = things.flyPos(stoneThing);
    if (fp) {
      stone.visible = true;
      stone.position.set(fp.x, fp.y, fp.z);
    } else if (stoneThing.state === 'ground') {
      stone.visible = true;
      stone.position.set(stoneThing.x, ctx.groundY(stoneThing.x, stoneThing.z), stoneThing.z);
    } else {
      stone.visible = false;
    }
    // a stone that has just gone down the well is the well's to answer
    const flying = stoneThing.state === 'flying';
    if (stoneWasFlying && stoneThing.state === 'gone') {
      well.answerAt = t + WELL_ANSWER_DELAY * 1.4;
      well.kind = 'stone';
    }
    // and a stone that has just landed in the river rings the water
    if (stoneWasFlying && stoneThing.state === 'ground'
      && terrain.waterAt(stoneThing.x, stoneThing.z) > 0.12) {
      well.ripple = { t: 0, x: stoneThing.x, z: stoneThing.z };
    }
    stoneWasFlying = flying;
    if (well.ripple.t >= 0) {
      well.ripple.t += dt;
      const k = well.ripple.t / 1.5;
      if (k >= 1) {
        well.ripple.t = -1;
        ripple.visible = false;
      } else {
        ripple.visible = true;
        const sc = 0.6 + k * 3.2;
        ripple.scale.set(sc, 1, sc);
        ripple.position.set(well.ripple.x, ctx.groundY(well.ripple.x, well.ripple.z) + 0.06, well.ripple.z);
        rippleMat.opacity = 0.5 * (1 - k);
      }
    }

    /* ---- THE WELL ANSWERS, on a delay that is too long -------------- */
    /* The swallows lift at the shout itself — a visible answer at the
     * instant of the press, for a phone on silent — and lift higher
     * when the well answers. */
    if (well.lift) {
      well.lift = false;
      flinch = Math.max(flinch, 1.2);
      // the shout sends the bucket down
      if (well.bucket === 'rest' || well.bucket === 'rise') {
        well.bucket = 'drop';
        well.bt = 0;
      }
    }
    if (well.answerAt === -2) well.answerAt = t + WELL_ANSWER_DELAY;
    if (well.answerAt >= 0 && t >= well.answerAt) {
      well.answerAt = -1;
      say(well.kind === 'stone' ? 'well-plink' : 'well-answer');
      flinch = Math.max(flinch, 2.2);
      // and the answer brings it back up — or, for a stone, jiggles
      // the bucket on its rope, so the plink is seen as well as heard
      if (well.bucket === 'down' || well.bucket === 'drop') {
        well.bucket = 'rise';
        well.bt = 0;
      } else if (well.bucket === 'rest') {
        well.bucket = 'bob';
        well.bt = 0;
      }
    }
    /* THE BUCKET'S FOUR STATES. Down is fast — a bucket let go — and it
     * fades into the shaft's dark as it passes the ring; up is slow and
     * swings, because somebody is winding. The rest pose is exactly the
     * drawing the well had before the bucket was its own. */
    {
      const DROP = 2.4;
      let len = ROPE_REST;
      let fade = 1;
      let swing = 0;
      if (well.bucket === 'drop') {
        well.bt += dt;
        const k = Math.min(1, well.bt / 0.55);
        len = ROPE_REST + (DROP - ROPE_REST) * k * k;
        fade = 1 - Math.max(0, (k - 0.45) / 0.55);
        if (k >= 1) well.bucket = 'down';
      } else if (well.bucket === 'down') {
        len = DROP;
        fade = 0;
      } else if (well.bucket === 'rise') {
        well.bt += dt;
        const k = Math.min(1, well.bt / 1.7);
        const e = 1 - (1 - k) * (1 - k);
        len = DROP + (ROPE_REST - DROP) * e;
        fade = Math.min(1, k / 0.45);
        swing = Math.sin(well.bt * 7.5) * 0.16 * (1 - k);
        if (k >= 1) well.bucket = 'rest';
      } else if (well.bucket === 'bob') {
        well.bt += dt;
        const k = Math.min(1, well.bt / 1.3);
        swing = Math.sin(well.bt * 9) * 0.12 * (1 - k);
        len = ROPE_REST + Math.sin(well.bt * 11) * 0.06 * (1 - k);
        if (k >= 1) well.bucket = 'rest';
      }
      rope.scale.y = len;
      rope.rotation.z = swing * 0.5;
      bucket.position.y = wellY + WINDLASS - len;
      bucket.position.x = WELL.x - 1 + Math.sin(swing) * len * 0.5;
      bucket.rotation.z = swing;
      bucketMat.opacity = fade;
      ropeMat.opacity = Math.max(fade, 0.35 + 0.65 * Math.min(1, ROPE_REST / len));
    }
    flinch = Math.max(0, flinch - dt);
    const quick = 1 + Math.min(1, flinch) * 1.6;

    // swallows loop crossing ellipses, always banking into the turn
    for (const s of swallows) {
      const a = t * s.w * quick + s.ph;
      s.m.position.x = s.cx + Math.cos(a) * s.rx;
      s.m.position.z = s.cz + Math.sin(a * 2) * s.rz * 0.5;
      s.m.position.y = ctx.groundY(s.cx, s.cz) + 4.6 + Math.sin(a * 3.1) * 1.2 + Math.min(1, flinch) * 2.4;
      s.m.scale.x = Math.sin(a) > 0 ? -Math.abs(s.m.scale.x) : Math.abs(s.m.scale.x);
    }
    /* THE KEEP VISTA HOLDS ONLY AT MEADOW DISTANCE — and until Session 13
     * that sentence was only half true, because the fade had a near
     * bound and no far one.
     *
     * This standee is FALSE PERSPECTIVE with `fog = false`: a pencil
     * keep at (−52, −52) standing in for a castle a hundred and eighty
     * units further out. It ramps in as the walker comes south down the
     * Common and then never lets go, so from the world's SOUTH RIM —
     * three hundred and twenty-four units away, in a land this file has
     * never heard of — Greyweather stood on the horizon at full
     * opacity, at the vanishing point of the king's road.
     *
     * That is the one thing `THE-LINE.md` §3.2 says the end of the
     * survey must not do. *"You cannot see where it ends. You can see
     * that it does not stop."* A game that shows you the castle from
     * the south rim has answered the question, and this one had been
     * answering it since Session 2 in a frame nobody had ever shot.
     *
     * So it lets go over the first forty units of MAPLE COURT: full
     * through the whole Common and over its border (the three chairs
     * look north through their hedge at z ≈ 132 and this is what they
     * see), gone by z = 168, which is the near side of the river. No
     * framing north of there has moved by a pixel — `diff-sheets`
     * carries eleven of them and every one is at z ≤ 120. */
    const near = Math.max(0, Math.min(1, (pz - 12) / 22));
    const far = 1 - Math.max(0, Math.min(1, (pz - 136) / 32));
    vistaMat.opacity = 0.8 * near * far;
    /* The three new lures fade on the same law as the keep, and a
     * little sooner going north — they are further off than it and go
     * first. The mill's smoke leans on the wind. */
    for (const l of lures) l.mat.opacity = l.base * Math.max(0, Math.min(1, (pz - 18) / 22)) * far;
    millSmoke.rotation.z = Math.sin(t * 0.31) * 0.03 - 0.02;
    maypole.rotation.z = Math.sin(t * 0.7) * 0.012;
  };
};

/** NELL'S CARD — both doors visible before either is taken, each with
 *  a cost, and nothing anywhere says which was right. Door one is the
 *  wait's answer; door two is the cart, yours, and Nell has a cart at
 *  a border. The card is offered once. */
const NELL_CARD: NonNullable<WorldPOI['choice']> = {
  body: 'you came back up the road with the fourth name, and for once she does not settle. the cart is behind her. it has been almost loaded for years, and it was only ever waiting on which way it was going.',
  options: [
    { label: 'TELL HER THE FOURTH NAME', door: 'door:the-cart-turned-north' },
    { label: 'KEEP IT, AND PUSH THE CART YOURSELF', door: 'door:the-cart-pushed' },
  ],
};

export const MEADOW_POIS: WorldPOI[] = [
  {
    x: -42, z: 52, radius: 7, label: 'THE CROSSROADS',
    prompt: 'READ THE SIGNPOST',
    note: {
      title: 'the crossroads',
      body: 'brim, to the north. the sea, west. the downs, east. and one that says 8:15, which is not a place. every road in the world starts here, which is another way of saying you are nowhere in particular.',
      /* THREE LANDS GO INTO PENCIL ON THE MAP FROM THE FIRST NOTE IN
       * THE GAME. The signpost has named them since Session 1 and it
       * has never been worth anything, because the map had nothing to
       * do with what the walker had been told. Now it has. */
      learns: ['name:kingdom', 'name:beach', 'name:downs'],
    },
  },
  {
    /* THE FIRST TOUCH IN THE GAME. It used to be a note — *you look
     * down. the dark looks back, politely. a long way below, something
     * lands in water, and it takes longer to do it than it should* —
     * and the note was a description of a toy. Now it is the toy. The
     * prompt says SHOUT, not anything about ink: the medium is the
     * style, never the subject. */
    /* The reach is the lip, not the yard (five units until Session 15):
     * a thing in reach beats the thing in the hand, so a stone can only
     * go down the well from outside the well's own reach — three and a
     * half units, which is a throw from the path at a walk. */
    x: -57, z: 45, radius: 3.4, label: 'THE OLD WELL',
    prompt: 'SHOUT DOWN THE WELL',
    touch: () => {
      say('well-shout');
      well.answerAt = -2; // set by the builder off its own clock, below
      well.kind = 'shout';
      well.lift = true;   // the swallows lift at the shout, not only at the answer
      /* The builder's clock is `t`; the POI has no clock. So the touch
       * asks for an answer and the builder schedules it on the next
       * frame: −2 means "due, not yet timed". */
    },
  },
  {
    x: -101, z: 25, radius: 6, label: 'THE ARGUING OAKS',
    prompt: 'TAKE A SIDE',
    note: {
      title: 'the arguing oaks',
      body: 'three oaks, one argument, four hundred years. the subject is who stands furthest from the other two. the swing takes no side; it was hung on the leaning one because the leaning one was losing.',
    },
  },
  {
    /* THE FIRST SIT. The swing hangs from the leaning oak at
     * (−90.6, 29.2); the seat is under it. The oaks' note moved six
     * units west to make room, and the prompt that used to open the
     * note now does what it always said. */
    x: -90.6, z: 30.5, radius: 3.6,
    prompt: 'SIT IN THE SWING',
    /* THE SEAT MOVES. The same pendulum the builder swings the plank on
     * (`swing.rotation.z` below, off the world's elapsed seconds), and
     * the plank is 2.44 units below the pivot, so the figure rides the
     * arc instead of sitting rigid beside it. */
    // the plank hangs three units up the leaning oak (the drawing's
    // own y, 100 of 128, on a quad hung from 5.6 to 2.6); the hip is
    // half a unit above the feet, so the lift is the difference
    sit: {
      x: -90.6, z: 30.4, lift: 2.6,
      follow: (t: number) => {
        const rot = Math.sin(t * 0.9) * 0.07 + Math.sin(t * 0.37) * 0.03;
        const L = 2.44;
        return { dx: Math.sin(rot) * L, dy: (1 - Math.cos(rot)) * L, rot };
      },
    },
  },
  {
    /* THE CART. A pushable, so the place follows the thing: it is
     * wherever the registry left it, and the prompt is wherever the
     * cart is. */
    get x() { return things.get('hay-cart')!.x; },
    get z() { return things.get('hay-cart')!.z; },
    // loaded and turned north, it is not pushed again
    get enabled() { return !knowledge.has('door:the-cart-turned-north'); },
    set enabled(_v: boolean) { /* the door decides */ },
    radius: 4.6,
    prompt: 'PUSH THE CART',
    touch: (px: number, pz: number) => {
      const r = things.push('hay-cart', px, pz);
      if (r === 'moved') say('cart-wheels');
      else if (r === 'refused') {
        /* The border, the river or the steep: the cart does not roll
         * and the wheels do not sound. It rocks on its axle instead,
         * and the axle knocks — a refusal you can see. */
        say('cart-stuck');
        well.cartRock = 0.5;
      }
    },
  } as unknown as WorldPOI,
  {
    /* THE STONE, where it lies. Off while it is in the hand or in the
     * air; App re-enables it on landing. */
    get x() { return things.get('fist-stone')!.x; },
    get z() { return things.get('fist-stone')!.z; },
    get enabled() { return things.get('fist-stone')!.state === 'ground'; },
    set enabled(_v: boolean) { /* the registry decides */ },
    radius: 2.6,
    prompt: 'PICK UP THE STONE',
    touch: () => { things.pickUp('fist-stone'); },
  } as unknown as WorldPOI,
  {
    x: 12.6, z: 62.4, radius: 4.2, label: 'THE LONG FENCE',
    prompt: 'LEAN ON THE STILE',
    note: {
      title: 'the long fence',
      body: 'a fence with one stile, one gate, and several strong opinions about which side is the field. the bull is on the field side. the stile is for people who have met it.',
    },
  },
  {
    /* NELL (Session 16, `THE-WAITS` §9, `THE-FUN-PASS` §6). Her place
     * is the gate. Before you have the fourth name it is a note in the
     * plainest register in the game; with it, it is a card with two
     * doors, and it is offered once. The `choice` is a getter so the
     * card does not exist until the name does. */
    /* Reachable from both sides of the fence — the road, where you meet
     * her, and the field, where the camera can see her — so the reach
     * is six, centred on where she stands. */
    x: HEDGE_X - 1.2, z: 82.2, radius: 6, label: 'THE FIELD GATE',
    get prompt() {
      const done = knowledge.has('door:the-cart-turned-north') || knowledge.has('door:the-cart-pushed');
      if (!done && knowledge.has('fact:the-timetable')) return 'TELL HER THE FOURTH NAME';
      return 'LEAN ON THE GATE WITH HER';
    },
    get choice() {
      if (!knowledge.has('fact:the-timetable')) return undefined;
      return NELL_CARD;
    },
    note: {
      title: 'the field gate',
      body: () => {
        if (knowledge.has('door:the-cart-turned-north')) {
          return 'the cart is loaded and roped and its shafts point up the king\'s road. it has not moved. she is not leaning on anything any more, and she looks at it the way you look at a bag by the door.';
        }
        if (knowledge.has('door:the-cart-pushed')) {
          return 'the cart is wherever you left it. she can see it from here. she has not gone to fetch it, and she is not going to, and she has stopped watching the road.';
        }
        return 'nell. she leans here most days and watches whoever comes up the road: straightens, and settles again. the cart behind her has been nearly loaded for as long as the fence has been a fence. it will be loaded, she says, the day she knows which way it is going, and three of the four names on the signpost she could go to tomorrow.';
      },
    },
  } as unknown as WorldPOI,
  {
    x: -95, z: 101, radius: 7, label: 'THE FAIR GROUND',
    prompt: 'READ THE BOARD',
    note: {
      title: 'the fair ground',
      body: 'the board says the fair, and under that it says next, and under that it has said several dates, each rubbed out with more care than the last. the ring in the grass is where the roundabout goes. nobody has taken the maypole down, because taking it down is what you do after.',
    },
  },
  {
    x: 44, z: 102, radius: 7, label: 'RIVERBEND',
    prompt: 'WATCH THE WATER',
    note: {
      title: 'riverbend',
      body: 'the river practices its cursive on this corner of the common. the reeds lean in to read it. so far it has written the same word the whole way to the sea.',
    },
  },
];
