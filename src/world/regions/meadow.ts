import * as THREE from 'three';
import { ringTexture, loopsTexture } from '../../engine/ink';
import { hayBaleTexture, doodleFolkTexture, logTexture, wheatDecal } from '../textures';
import {
  leanGrassTexture, tallGrassTexture, driftFlowersTexture, commonOakTexture,
  wornGroundDecal, wheelRutsDecal, commonWellTexture, crossroadsSignTexture,
  milestoneTexture, hayCartTexture, hedgerowTexture, longFenceTexture,
  fistStoneTexture,
  leafLitterDecal, reedsTexture, ropeSwingTexture, swallowTexture,
  keepVistaTexture,
} from '../textures-common';
import { things } from '../things';
import { events } from '../events';
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
const well = { answerAt: -1, kind: 'shout' as 'shout' | 'stone', lift: false };

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
  const fenceRun: { x: number; kind: 0 | 1 | 2 | 3 }[] = [
    { x: -12, kind: 0 }, { x: -5, kind: 1 }, { x: 2, kind: 0 },
    { x: 9, kind: 2 }, { x: 16, kind: 0 }, { x: 23, kind: 3 },
    { x: 30, kind: 0 }, { x: 37, kind: 1 },
  ];
  fenceRun.forEach((seg, i) =>
    ctx.standee(longFenceTexture(440 + i, seg.kind), 7, 2.6, seg.x + 3.5,
      64.5 + Math.sin(i * 1.7) * 0.8));
  // the fence dies out east of the gate: one leaning post, then nothing
  ctx.standee(milestoneTexture(449), 1.1, 1.5, 45, 66);
  ctx.decal(wornGroundDecal(450), 5, 4, 9.5, 62.5, 0.4, 0.5);
  // the implied field beyond: the hay cart, bales, a stand of wheat
  /* THE CART IS A THING NOW (things.ts): the registry moves it and this
   * builder draws it where the registry says. Its refusals are the
   * river and the roads' cousins, the steep; the border is the
   * registry's own. */
  const cartThing = things.get('hay-cart')!;
  cartThing.def.refuse = (x, z) => terrain.waterAt(x, z) > 0.04 || terrain.slopeAt(x, z) > 0.5;
  const cart = ctx.standee(hayCartTexture(451), 5.6, 4.0, cartThing.x, cartThing.z, { rotY: -0.25 });
  cartThing.mesh = cart;
  /* AND THE STONE, by the gate it props. The mesh is only drawn when the
   * stone is on the ground or in the air; in the hand it is the walker's
   * own drawing of it (`Character.hold`). */
  const stoneThing = things.get('fist-stone')!;
  const stone = ctx.standee(fistStoneTexture(452), 0.5, 0.5, stoneThing.x, stoneThing.z);
  stoneThing.mesh = stone;
  // bales stand clear of the cart: beside its wheel they read as spares
  ctx.standee(hayBaleTexture(452), 3.2, 2.4, 33, 81);
  ctx.standee(hayBaleTexture(453), 2.7, 2.0, 37.5, 77);
  for (let i = 0; i < 5; i++) {
    ctx.decal(wheatDecal(454 + i), 10, 6.6, -2 + i * 9 + r() * 3, 76 + r() * 8, r() * 0.4, 0.55);
  }
  // someone leaning at the field gate, watching the road
  ctx.standee(doodleFolkTexture(459), 1.15, 1.9, 26.6, 63.8);

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

  return (dt: number, t: number, _px: number, pz: number) => {
    // the swing: a slow pendulum nobody is sitting in
    swing.rotation.z = Math.sin(t * 0.9) * 0.07 + Math.sin(t * 0.37) * 0.03;

    /* ---- THE CART, where the registry has it ------------------------ */
    cart.position.set(cartThing.x, ctx.groundY(cartThing.x, cartThing.z), cartThing.z);
    // a cart going west is the same cart drawn the other way round
    if (Math.abs(cartThing.vx) > 0.3) cart.scale.x = cartThing.vx < 0 ? -1 : 1;

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
    stoneWasFlying = flying;

    /* ---- THE WELL ANSWERS, on a delay that is too long -------------- */
    /* The swallows lift at the shout itself — a visible answer at the
     * instant of the press, for a phone on silent — and lift higher
     * when the well answers. */
    if (well.lift) {
      well.lift = false;
      flinch = Math.max(flinch, 1.2);
    }
    if (well.answerAt === -2) well.answerAt = t + WELL_ANSWER_DELAY;
    if (well.answerAt >= 0 && t >= well.answerAt) {
      well.answerAt = -1;
      say(well.kind === 'stone' ? 'well-plink' : 'well-answer');
      flinch = Math.max(flinch, 2.2);
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
  };
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
    // the plank hangs three units up the leaning oak (the drawing's
    // own y, 100 of 128, on a quad hung from 5.6 to 2.6); the hip is
    // half a unit above the feet, so the lift is the difference
    sit: { x: -90.6, z: 30.4, lift: 2.6 },
  },
  {
    /* THE CART. A pushable, so the place follows the thing: it is
     * wherever the registry left it, and the prompt is wherever the
     * cart is. */
    get x() { return things.get('hay-cart')!.x; },
    get z() { return things.get('hay-cart')!.z; },
    radius: 4.6,
    prompt: 'PUSH THE CART',
    touch: (px: number, pz: number) => {
      if (things.push('hay-cart', px, pz)) say('cart-wheels');
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
    x: 12, z: 63, radius: 6, label: 'THE LONG FENCE',
    prompt: 'LEAN ON THE STILE',
    note: {
      title: 'the long fence',
      body: 'a fence with one stile, one gate, and several strong opinions about which side is the field. the hay cart has been almost done being loaded for as long as anyone at this gate can remember.',
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
