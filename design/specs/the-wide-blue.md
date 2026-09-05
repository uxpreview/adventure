# THE WIDE BLUE — land spec

*Session 5. Rect `{−380..−250, −280..280}`, wash `WASH.seaShallow`,
step `sand` (see below), mood `ocean` (bare fifths and ninths, nine
seconds between phrases). The hardest land on the sheet, because its
whole surface is a thing you cannot stand on.*

## 0. THE PROBLEM, AND THE ANSWER

**A land you cannot walk is not a land, it is a backdrop.** Session 1
shipped THE WIDE BLUE as three sailboats and six buoys placed at
x ≈ −330, which is forty units past the point where the water refuses
the walker. Nobody has ever seen them at any size. The land had no
reason to be entered and no shot.

The answer is not a boat, and it is not a swimming verb. It is in the
metaphor: **when a wash runs across a sheet it leaves misses.** This
one left a long curved miss running out from the shore below the
boardwalk — **THE SANDBAR**, a hundred and eighty units of dry paper
through open water, authored in `layout.ts` (`SANDBAR`, `seaAt`) so the
height field, the wash field and collision all agree it is dry.

So the question the bar has to answer is the one the session set:
**what do you see from the water that you cannot see from the sand?**

1. **The coast, as a drawn coastline.** From the bar's far end the
   Holdfast presents its whole seaward face at once — eleven units of
   cliff, hatched down its own fall line, with the cut visible as a
   single thread across it and a cairn on top. From the sand you are
   either on that cliff or behind it; you can never see it.
2. **The regatta at scale.** From the beach the fleet is four specks in
   the haze. From the bar they round the mark thirty units away,
   heeled, sails overlapping, close enough that the halyards ring.
3. **The emptiest frame in the world.** *(Revised in build: the sheet's
   torn west margin is ninety units west of the bar's far bend, and this
   game's camera only ever looks NORTH, so it can never be in the
   frame. What is deliverable, and turned out to be better, is the
   absence:)* from the bar's westernmost bend there is not one drawn
   mark between you and the fog. On a page that is drawings all the way
   down, a frame with nothing in it is an event.

## 1. THE SHOT

Standing on the bar at ≈ (−303, −16), facing north:

- **Foreground:** a barnacled mooring post leaning out of the wet sand
  with a rope trailing off frame, and the bar's own ripple decals.
- **Subject:** the regatta rounding **THE MARK** — four boats on
  overlapping headings, the two nearest heeled hard with their sails
  crossing each other's silhouette (never four boats abreast: that is
  an array with sails on it), the bell buoy nodding between them.
- **Far silhouette:** THE HOLDFAST's cliff face, pale in haze, the cut
  a thread, the cairn a nick on the skyline.
- **Accent color:** three burgees and one red hull stripe. Small doses,
  far apart.
- **Moving:** the boats sail a real course (they round the mark and
  bear away); the buoy nods and rings; gulls sit on the water and lift
  as the fleet comes through.

## 2. PLACES

Five places, four of them ON the bar, which is the land's whole spine.

| place | center | r | why it is worth the walk |
|---|---|---|---|
| THE SHALLOWS | −262, 92 | 10 | where you first go in. Knee-deep, and the fish scatter |
| THE SANDBAR | −272, 58 | 12 | the bar's root: where the wash stops and the walking starts. The step timbre changes |
| THE LONG WATER | −299, 16 | 12 | the bar's westernmost bend, and the emptiest frame in the world |
| THE MARK | −300, −8 | 13 | THE SHOT. The regatta's turning buoy twenty units due north, and its bell |
| THE SEAWARD FACE | −277, −32 | 12 | on the bar's RETURN leg: the Holdfast's west cliff, whole, fifty units north |

**The bar is a route, not a pier.** It leaves the beach below the
boardwalk, bends west to the long water, turns north past the mark and
comes back ashore in the bight at the foot of the cliff path. Two ends,
both on the coast, and the sea in between — which is what makes walking
it a decision rather than an errand.

```
   x −380      −340        −300        −270      −250 │ LONGSHORE
      │  the torn edge      │            │           │
z−100 │   ~ ~ ~ ~ ~ ~       │            ███████ THE HOLDFAST
z−36  │    ~ ⛵⛵ ●bell                  ╱
z−32  │        ~ ~ ▪SEAWARD FACE══════╱ (the bar comes ASHORE here,
z−8   │      ~ ▪ THE MARK              at the foot of the cut)
z+16  │       ~ ▪ THE LONG WATER ╲
z+58  │      ~ ~ ~ ╲ THE SANDBAR ▪
z+92  │      ~ ~ ~ ~ ╲ THE SHALLOWS ▪
z+140 │      ~ ~ ~ ~ ~ ~ ~ ~ ~ ~     ═══ boardwalk
```

The void is composed and enormous: everything south of z 140 and west
of the bar is open water with two moored boats and nothing else, which
is correct — the sea's job is to be big.

## 3. COMPOSITION PLAN

- **The fleet is a fleet, never a row.** Four boats on ONE course, at
  four sizes, four points along it and four speeds, so which two overlap
  changes as you watch. Round 6 of the gate also settled how a boat is
  DRAWN at this distance: **a dinghy is nearly all rig.** The first pass
  gave them hulls as long as their masts were tall and the fleet read as
  canoes with leaves stuck in them.
- **Buoys are working buoys.** Three, at the mark and its approaches,
  each a different size and pitch on the swell. The Session 1 line of
  six evenly spaced down the shore is cut.
- **Occlusion in an empty land** comes from three layers of WATER
  drawing: the bar's near ripple decals, the fleet at mid, and the
  Holdfast's face in haze. There is no other way to stage depth over
  a flat surface, so the bar must always have a near mark on it.
- **Edges decay:** the bar's crest fades into wet sand, then ripple,
  then wash. Nothing on this land has a hard edge except a hull.
- **CUT from the current draft:** all five deep-water sailboats at
  x < −300 placed on a fixed spot list, the six-buoy line, and the
  ten-gull field that patrolled the whole 560-unit shore at one speed.

## 4. INK TECHNIQUE

**The sea is drawn by what floats on it.** There is not one mark on the
water itself from this prop box — the swell, the crests and the surf
are already the terrain shader's, and adding pen strokes to open water
would fight it. So the technique here is *the waterline*: every drawing
in this land is cut off flat at its own waterline, with a small
reflection hatch under it and nothing below that. A boat is a sheer
line, a sail, and a shadow that stops.

Second: **the bar is drawn as PAPER, not as sand.** Its ripples are
drawn with the same broken hatch the page's own tooth uses, at a
whisper of alpha — the point being that you are walking on the part
the wash missed.

| texture | canvas | seeds | primitives | variants |
|---|---|---|---|---|
| `regattaBoatTexture` | 192×224 | 4 | fillPoly, poly, hatch; heel baked in | 4 hulls × 2 heels |
| `bellBuoyTexture` | 96×160 | 1 | poly, scribbleCircle, hatch | 1 (it is THE mark) |
| `smallBuoyTexture` | 64×96 | 3 | poly, line | 3 |
| `mooringPostTexture` | 64×160 | 3 | stroke, scribbleCircle (barnacles) | 3 |
| `barRippleDecal` | 192×192 | 4 | stroke at low alpha | 4 |
| `mooredBoatTexture` | 208×176 | 2 | poly, line (bare mast) | 2 |
| `fishShoalDecal` | 128×128 | 3 | short strokes | 3 |
| `seaMarkTexture` | 96×192 | 2 | line, poly (a withy with a topmark) | 2 |

## 5. MOTION & LIFE

- **Idle 1 — the regatta sails.** Four boats on a slow closed course
  round the mark: they carry along a spline, heel INTO the turn, and
  swap their flip at the gybe. This is the land's headline motion and
  it is a real course, not four bobbing sprites.
- **Idle 2 — the bell buoy works the swell.** It nods, rolls, and every
  few seconds rings (`bell-buoy`). The moored boat's halyards slap its
  mast on the same swell (`halyard`).
- **Player-responsive — the shoal.** A shoal of fish holds in the
  shallows over the bar's root. Walk into it and it breaks and scatters
  away from you, re-forming thirty units off. (WORLD-SYSTEMS §5 names
  this exactly: *fish scatter in the shallows.*)

## 6. SOUND

Mood unchanged (`ocean`). **Step zone changed in `layout.ts` from `wet`
to `sand`** — the only places a foot can land in THE WIDE BLUE are the
bar's dry crest and the shallows, and the shallows are already
overridden to `wet` by the water underfoot. So crossing onto the bar
CHANGES THE STEP TIMBRE from wading to dry sand, which is how a player
learns, without a word, that the bar is paper and not sea.

New `Audio.event` cases:

- **`bell-buoy`** — a struck bronze clank with a long inharmonic tail
  and a second, softer strike a beat later as the swell rolls back.
- **`halyard`** — three or four bright metallic slaps against an
  aluminium mast, irregularly spaced, dying away.

Both are this land's alone. `surf-break` is shared with LONGSHORE but
plays here at longer gaps — out on the bar the surf is behind you.

## 7. POIS & NOTES

| label | pos | prompt |
|---|---|---|
| THE SHALLOWS | −266, 96 | WADE OUT (note kept from Session 1) |
| THE SANDBAR | −276, 52 | FEEL THE GROUND CHANGE |
| THE LONG WATER | −304, 2 | LOOK WEST |
| THE MARK | −304, −30 | WATCH THEM ROUND IT |
| THE SEAWARD FACE | −288, −64 | LOOK UP |

## 8. PERFORMANCE BUDGET

Fields: ripples ×4, fish ×1, gulls-on-water ×1 = 6 draws. Standees:
4 regatta boats, 3 buoys, 2 moored boats, 5 mooring posts, 3 withies
≈ 17. Total ≈ 23 draws — the cheapest land in the world, which is
right for the emptiest. The regatta's course is six lerps a frame.

## 9. NEW ENGINE NEEDS

`Audio.surge()` and `Audio.glide()`, shared with LONGSHORE. No new
placement or field primitives: the bar is ground like any other ground,
because `elevation.ts` says so.

## Session 19 addendum — the Vikings, Wren and the stone (2026-09-04)

- **THE LONGSHIP ON THE HOLDFAST** (`THE-FUN-PASS` §2's first stranger).
  `longshipTexture` in three poses (beached, rowing, roaring), a
  `Creature` fourteen wide. Her day is `shipAt(h)`, pure: rows in from
  the offing (−334, −96) from six to seven and beaches at the berth
  (−264, −46); out at a quarter to twelve; **in the regatta from noon
  to half past one**, round the mark with the fleet under a striped
  sail; back on the Holdfast by a quarter to two. Registered as
  `the-longship-in` / `-out` on `events.ts`, so the map and the tool
  know where she is.
- **THEY ROAR AND CANNOT LAND.** Beached, with the walker on the sand
  east of x −250 and within forty-six of the berth, seven until eight
  at night, they roar every nine to fifteen seconds (`viking-roar`,
  an `earshot.ts` row on the Holdfast, r 46). A threat the first time
  and a joke by the third: the berth is this land's and the sand is
  LONGSHORE's, and `check-verbs` §10 asserts her eastmost x stays
  under −252 through the whole day. Nothing says so in the world.
  Blow the horn on the point and they answer, from wherever they are.
- **WREN** (`THE-WAITS` §6), drawn (`wrenTexture`, `wrenBoatTexture`).
  Her punt is drawn up at the bar's root on sand, not in the water;
  she mends beside it in the morning, **rows out to the mark at 11.6**
  (`wren-rows`, `oar` row at (−282, 34)) and sits by the bell through
  the race, and rows out again at six. **The wait, with two doors**,
  on `route:the-bar`: THE PUNT is a card. *A second mark* —
  `door:the-second-mark` — puts a buoy at (−266, −16), inside the bar's
  arm, and she rows to that one, and the fleet's course turns at it.
  *The fleet finished* — `door:the-fleet-finished` — and there is no
  race: the four boats lie at anchor by the second mark and Wren's
  afternoon row is a stop at 24.5 that never comes (`WREN_NEVER`).
  Either answers the wait.
- **THE FLEET MINDS ITS OWN RACE.** Row the rowboat into the regatta
  (`rowboat` in `Boat.ts` is read by the land): the nearest racer
  within nine bears away and its halyard rattles. Nothing collides
  and nothing stops.
- **THE STONE.** `bar-stone` is a carriable on the crest (`skims: 3`).
  Thrown at the water at a run it skips — `things.skip`, each hop
  sixty-two hundredths of the last — three times and in
  (`stone-skip`; rings from `things.splashes`). The morning puts it
  back on the crest.
- **THE THING UNDER THE WIDE BLUE.** The-deep surfaces every third
  dusk (`day % 3 === 0`) and on no other; **the morning after, the
  seals do not haul out on the bar**, and nothing says why. It is
  never in frame whole and it has no note.
