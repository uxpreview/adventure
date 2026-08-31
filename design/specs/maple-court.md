# MAPLE COURT — the land spec

*Session 13. `neighborhood`, rect x −150..60, z 120..280. Built to
`design/LAND-SPEC-TEMPLATE.md`, under `design/QUALITY-BAR.md` §4,
`design/THE-WAITS.md` §3 (VAL), `design/THE-STRANGERS.md` S3 (JUNE) and
`design/THE-LINE.md` §3.2, which is an authoring brief addressed to this
session and the one constraint in it that could not be got wrong twice.*

**What this land argues** (`WORLD-SYSTEMS` §10 rule 4): *that leaving is
temporary.* Everything here is maintained — the verges mown, the hedges
clipped, the bins out on the right day — for a street with more empty
houses on it than full ones. Nobody in Maple Court would ever say so.

---

## 1. THE SHOT

**Walking north up the court at dusk with one porch light on.**

| layer | what |
|---|---|
| **stands** | (−78, 150), on the court's own street, walking north |
| **foreground** | the last two houses of the court, one either side, cropped by the frame — a car on a drive, a picket fence, the pillar box on the corner |
| **subject** | **VAL'S HOUSE at (−78, 128)**, dead north, closing the street: the porch light on over the door, a warm pool on the boards under it, and one room lit behind a net curtain |
| **far** | the Common over the back hedge, and on the horizon a hundred and eighty units out, the pencil ridge over Brim |
| **accent** | the single warm mark in the frame is the porch. Every other window on the street is dark |
| **moving** | nothing but Val herself, out at her gate between six and nine, looking up her own street |

The whole land is staged around this: the court is the only closed
street in the world, the drawing rule of the land is that every mark
comes back to itself, and the thing at the top of it is a light left on.
`THE-WAITS` §3's turn is that the light is not for the people who left —
**it is for the street**, so the road still counts as lived on — and the
shot says that by showing eleven dark houses and one lit porch in the
same frame.

**And the second composition, which is the wait's other half:** THE
THREE CHAIRS at (−61, 134), from (−61, 142), looking north through the
hedge. See §2.

---

## 2. PLACES

| place | centre | r | why it is worth the walk |
|---|---|---|---|
| **MAPLE COURT** *(the street)* | −78, 140 | 9 | eleven houses round a circle you can walk the whole of and end up where you started. Val's is the one at the top with the light on |
| **THE THREE CHAIRS** | −61, 139 | 8 | three chairs facing a hedge, which is a joke about suburbia until you notice the hedge closed over a gap. Bring the castle's name back and it is cut open, and Greyweather is on the skyline of a back garden |
| **THE GREEN** *(kept from Session 1, with its note)* | 2, 178 | 8 | a swing moving with nobody on it, by the river, and a sprinkler you never find the lawn of |
| **THE GATE ON THE LATCH** | 50, 193 | 7 | June's, the last house before the border. The latch plate is worn down to bright metal |
| **THE RIVER BRIDGE** *(kept)* | −45, 170 | 7 | the king's road's own crossing, and the one structure allowed to stand in the protected corridor |
| **THE END OF THE SURVEY** | −45, 262..278 | — | **unlettered, unmarked, and it has no POI.** See §7 |

```
        z=120  ┌──────────────────────────────────────────────┐  THE COMMON
               │      hedge▄▄▄▄  ▄▄▄▄        (the border)      │
               │  VAL ▟   chairs                               │
        z=140  │   ○ the court        ·          THE           │
               │  ▟ ▟   ▟                        GREEN         │
               │        │                    ~~~~~~~~~~~~      │
        z=170  │   (west void)  ═╪═ bridge  ~~~     ▟   ▟      │
               │                 │              ~~~~~~   ▟     │
        z=200  │ ▟   ▟  ▟ ══════╪══════════════════════════▟   │ main street →
               │                 │                     june ▐  │  GREYLINE
        z=230  │    ▟      [plot] │  [plot]        ▟           │
               │              ▟   │        ▟                   │
        z=260  │                  │   ▟                        │
               │        the pegs  ┊  (the survey stops)        │
        z=280  └──────────────────┴──────────────────────────────┘  the world's rim

   ▟ house   ○ turning circle   ═ road   │ the king's road (PROTECTED)
   [plot] kerbs and a drive and no house   ~ the river   · the chairs
```

**The seams.** North is THE COMMON and the border is a line of back
hedges — the suburb's last fence, and beyond it the old open field.
East is GREYLINE CITY across the border fence at x ≈ 57, which is where
June stands once you have brought her what you saw. South is the edge of
the world.

---

## 3. COMPOSITION PLAN

**What was cut:** the entire draft. It was two `for` loops — houses
every twenty-four units down two fixed offsets, a picket fence every
fourteen, thirty street trees and eighty tufts of grass on a Poisson
scatter, and one signpost. Even spacing, repeated silhouettes, uniform
density: the three-part definition of "reads as an array".

**What replaces it is a sentence about the survey.** The street thins to
nothing as it goes south:

| band | density | what is there |
|---|---|---|
| z 122–160 | densest | the court: eleven houses round a circle, the back gardens, the chairs |
| z 160–195 | the river | the green, the bridge, two houses on the far bank — the land's composed void is the river's valley |
| z 196–215 | main street | frontage both sides, set back, seven houses and a pillar box |
| z 215–255 | thinning | four houses on big plots, and then **two plots with kerbs, dropped kerbs and driveways and no houses at all** |
| z 255–278 | nothing | the tarmac goes to gravel, three survey pegs, the rim |

That gradient does three jobs at once: it is a density that means
something rather than a density that fills; it is `THE-LINE` §3.2's
protected corridor obeyed by the land's own story instead of by a
constraint; and it is what the walk SOUTH sees, which is the one motion
Session 12 kept and improved.

**Cluster rules.** Houses are authored one line each, never looped —
position, rotation, which of three drawings, whether anybody is in at
dusk, and what is out the front. No two neighbours share a rotation and
no two adjacent plots share a drawing. Front gardens are a lawn and a
drive; a drive only exists where there is a car or a bin.

**THE CORRIDOR, and it is the hard rule of this land.** Nothing tall may
stand within eight units of x = −45 between z = 120 and z = 278
(`THE-LINE` §3.2). Every house is authored at least thirteen units off
the axis so its DRAWING clears the corridor and not merely its origin;
mailboxes go on the side of the plot away from the road; the street
trees are authored in verges rather than scattered, and every one of
them is bounded by `offLine`. **`node tools/check-sightline.mjs` asserts
the whole run** — see §9.

---

## 4. INK TECHNIQUE

> **MAPLE COURT: EVERY MARK CLOSES.**

A hedge is a loop. A lawn is a kerb that comes back to itself. A fence
is a rectangle round a garden. A hopscotch is a closed figure, a pillar
box is a closed cylinder, and the street itself is a road that returns
you to where you started. **Nothing in Maple Court runs off the edge of
its own drawing** — which is the street's belief drawn rather than said,
and it is the exact opposite of GREYLINE CITY next door, where every
mark leaves the frame. The pair is drawn at right angles to each other
the way SPLITROCK and THE BLEACH FLATS are.

The one exception is authored and it is one mark: the crack in a
concrete drive. It is a crack.

| texture | canvas | variants | notes |
|---|---|---|---|
| `courtHouseTexture` | 256×192 | 3 (gable / bungalow / chalet) | siding and roof colour chosen per seed; hard corners via `hardPoly` |
| `courtHouseLitTexture` | 256×192 | 3 | warm panes only, stood over the house and faded at dusk |
| `valHouseTexture` | 256×208 | 1 | the porch: roof, posts, three steps, a rail, net curtains |
| `valPorchLitTexture` | 256×208 | 1 | the bulb, the wall stain, the pool on the boards, one room |
| `clippedHedgeTexture` | 512×96 | 2 (shut / cut) | flat clipped top, closed leaf scribbles, square cut faces and clippings on the ground |
| `gardenChairTexture` | 96×128 | 3 | one closed outline each; one has a cushion that has been rained on |
| `latchGateTexture` | 192×128 | 1 | the latch plate is drawn by TAKING THE INK OUT (`destination-out`) |
| `valTexture` / `juneTexture` | 80×144 | 2 each | posture only, no faces |
| `pillarBoxTexture`, `binTexture` | 96×160, 80×112 | 1 each | |
| `surveyPegTexture` | 64×64 | 2 (up / down) | |
| `mownLawnDecal` | 256×256 | 2 | kerb closed, stripes inside it, heavily feathered |
| `drivewayDecal` | 192×256 | 2 | one has the crack and an oil stain |
| `emptyPlotDecal` | 256×192 | 1 | kerb, dropped kerb, apron, and grass |
| `kerbRunDecal` | 192×512 | 2 | **two converging lines are what make a hundred units of empty road read as a road.** See §9 |
| `roadEndDecal` | 256×192 | 1 | tarmac to gravel to nothing |
| `hopscotchDecal` | 128×256 | 1 | chalk, mostly rained off |

Reused unchanged: `carTexture`, `mailboxTexture`, `picketFenceTexture`,
`streetTreeTexture`, `swingSetTexture`, `benchTexture`, `grassTexture`,
`doodleFolkTexture`.

---

## 5. MOTION & LIFE

- **the swing on the green**, a slow pendulum with nobody in it (per
  frame, two summed sines so it never repeats visibly);
- **the porch light**, which is the only light in the game that never
  goes fully out: it sits at 0.3 in daylight and comes up to 1 at dusk,
  and the region says in a comment why;
- **the street's windows**, six of twenty-one houses lit at dusk and
  fifteen dark;
- **Val**, two postures on a clock: at the gate 18:12–20:48, the bin
  07:12–08:24, and not in shot otherwise;
- **June**, at her gate in the evening — until you have been to the
  junction, after which she is at the fence in the east, always;
- **player-responsive:** the hedge. Come back holding `name:castle` and
  the gap is cut, and it stays cut in every later save.

---

## 6. SOUND

Voice and bed unchanged (`Audio.ts`: music box at register 1, *a wind
chime on a porch two doors down*; bed *a mower three streets over and
the rest of the afternoon doing nothing at all*). Step zone `grass`.

Two new ambient events, and **neither of them has anything drawn
anywhere in this land that could be making it**:

| event | trigger | synthesis |
|---|---|---|
| `sprinkler` | every 13–28 s in the land, daylight only | a swept band of noise for the sweep, then seven ticks as the head comes back. THE GREEN's note has promised this sound since Session 1 — *you never do find the lawn it is on* |
| `far-dog` | every 26–56 s | two falling triangle glides, and then it stops |
| `screen-door` | available, unused by this land's update | a knock and its second bounce |

---

## 7. POIS & NOTES

| label | at | prompt | note |
|---|---|---|---|
| MAPLE COURT | −78, 140 | LOOK UP THE STREET | *"eleven houses round a circle… one porch light on, at four in the afternoon, and it has not been off in a long time."* |
| THE THREE CHAIRS | −61, 139 | — | *"facing a hedge. somebody set them out at this angle on purpose, and somebody has gone on cutting the hedge ever since, and both of those are true."* |
| THE GREEN | 2, 178 | SIT A WHILE | kept verbatim from Session 1 |
| THE GATE ON THE LATCH | 50, 193 | LOOK AT THE LATCH | *"never locked, never left open. the plate under the bar is worn down to bright metal."* |
| THE RIVER BRIDGE | −45, 170 | — | label only |

**And THE END OF THE SURVEY has no POI, no label, no prompt and no
note.** `THE-LINE` §3.2: *"There is no note at the end of the survey. It
is the one place in the game important enough to leave unlettered."*
What is there is three pegs, a road that goes to gravel, and two hundred
units of straight empty road running north into haze. Nothing in this
game will ever say that it was surveyed as a railway.

**None of these notes says who left, or where they went, or that they
are not coming back.** Nobody in Maple Court would be so rude.

---

## 8. PERFORMANCE BUDGET

Twenty-one houses × (1 + lit) + Val's two + the hedges, chairs, gate,
pillar box, bins and pegs = about **sixty unique standees**, each its own
draw call, which is the same order as Brim's high street. Fields: trees
(26), grass (60), fences (24), folk (3) — four instanced draws. Decals:
lawns, drives, plots, kerbs, the road end and the hopscotch, about
thirty-five, all `renderOrder −6`.

Texture memory: **fourteen drawings, made once each at build**, reused
across every placement — three house canvases carry twenty-one houses.
Session 10's costing stands: a fresh canvas per placement would be tens
of megabytes for one street.

Stream-in stays one frame: no per-frame allocation, the update writes
opacities and visibilities only.

**Measured** (`node tools/shoot-fps.mjs`, software rasteriser, so the
ratio is the number and not the milliseconds): standing on the court,
**336 draw calls at 9.4 ms/frame** against THE COMMON's 261 at 9.5 —
the highest draw count in the world and the same frame time as the land
it is next to. The survey end is 183 draws at 5.3 ms, which is what a
land that thins to nothing costs.

---

## 9. NEW ENGINE NEEDS

Two, and both were built:

1. **`tools/check-sightline.mjs`** — `THE-LINE` §3.2's corridor,
   asserted rather than trusted. It walks the axis and reads every prop
   in the world: one-off standees from their own geometry, instanced
   fields from their instance matrices, and a drawing counts as being IN
   the corridor if any part of the DRAWING is, not its origin. The
   shipped draft broke the rule twice — a 4.1-unit signpost five units
   off the axis, and thirty street trees on a scatter whose only bound
   was the road's own paint — and neither would have failed any check in
   this repository or shown up in any contact sheet of this land.
2. **`window.__inklands.world`** — the World, exposed to the harness, so
   the skyline grid (Session 9) can be read from outside.

And one drawing that is really a piece of engineering: **`kerbRunDecal`**.
Round 1 of this session's gate produced §3.2's two hundred units of road
as a tan smear that gave up at sixty, because a road at distance is not
read from its surface — the surface is four pixels wide by then — it is
read from its EDGES. Two converging lines are the whole of one-point
perspective. They are a decal, so they may lie in the corridor where
nothing is allowed to stand, and they stop where the survey did.
