# TRAVERSAL & TIME — the Session 6 systems

*Session 6, 2026-08-29. Not a land spec: four cross-cutting systems that
change how all six built lands feel, and how the remaining five will be
authored. `QUALITY-BAR.md` governs how any of it is judged;
`WORLD-SYSTEMS.md` §3, §4, §7 and §9 are what asked for it.*

---

## 1. SPRINT AS INK WEIGHT

**The claim:** *your speed is legible in the marks you leave behind you.*

WORLD-SYSTEMS §3 called traversal the game's weakest verb — twelve
lands and one constant walking speed — and this is the cheapest fix on
the list, because the walker's whole verb is already that **walking is
drawing**.

It is **one continuous scalar**, `Character.effort`, and there is no
sprint state anywhere in the game. Everything is a lerp on it:

| what | at a walk | flat out |
|---|---|---|
| speed | 4.1 | ×1.5 |
| stride | 0.62 units | ×1.34 |
| the print's ink | the shipped mark, exactly | darker, wider, and dragged out 1.4× along the line of travel |
| the step's level | 0.42 | 1.0 |
| the score | `setMoodIntensity(0.45)` | `setMoodIntensity(1.35)` |

**The middle of the range is the shipped mark.** At `press` 0.5 the
print's gamma is 1.0 and its weight is 1.0, so a walk lays exactly the
print four lands earned a WOWED with, and the system spends its range
either side of that and never through it. That is not caution: a day
where the walk changed would be a regression wearing a feature's
clothes.

**Damp paper is not wet paper.** Wet refuses the print outright (that
gate is older than this session). Damp takes it and lets it *bloom*, so
running the tide line leaves a heavier, softer trail than running the
king's road does, for one line of code and no new art.

**Running has no button and no stamina.** Shift on a keyboard, ramped;
on a phone, **how far past the ring you dragged** — the stick already
reaches a full walk at forty-eight pixels and the next forty are the
run. Nothing is urgent (WORLD-SYSTEMS §0 rule 2), so a run is a texture
and never a resource. The UI never mentions it. What says it is the
trail behind you.

## 2. A ROAD THAT CARRIES

**The claim:** *a line you are already on.*

Nine authored roads have been decoration since Session 1. A road that
carries turns the web into infrastructure for two numbers per road, and
STORY.md §4 is what authors those numbers: the king's road leaves
Greyweather's gate, comes down through Brim, crosses the Common, runs up
Maple Court as **main street** and ends, as the **commuter spur**, in a
car park. Twelve names, one road, castle to car park, and Act III's
reveal is that it was surveyed as a railway. The player walks that line
for fifteen hours before anybody tells them what it is, so it has to
*feel* like following something laid down on purpose.

| road | carry |
|---|---|
| **the king's road / main street / the commuter spur** — THE LINE | 1.0 |
| east road | 0.55 |
| coast road, mill lane | 0.5 |
| market lane | 0.42 |
| forest track | 0.34 |
| canyon trail | 0.30 |

**It rotates; it never pulls.** The only thing the carry does is take a
fixed share of the angle between where you are pointed and where the
road goes. There is no term anywhere in it that points at the
centreline, so walking off a road is exactly as free as it was before
this session, and stepping across one costs nothing at all.

**It is gated on alignment**, over about fifty-six to twenty-three
degrees, so it can only tidy a walk that was *already* down the road.

**The strength was authored, not guessed.** Measured on the king's road,
holding a direction N degrees off it, at a run:

| aimed | travels (on the line) | travels (on grass) | speed |
|---|---|---|---|
| 10° off | **4°** | 10° | +10% |
| 20° off | **8°** | 20° | +18% |
| 35° off | **18°** | 35° | +15% |
| 55° off | 55° | 55° | — |
| 90° off (crossing) | 90° | 90° | — |

The instrument earned its keep twice. The first build applied a
per-second rotation to the raw input every frame, and a rotation applied
to a value re-read from scratch every frame does not accumulate — it
deflected a walk by **half a degree** and the feature was, in practice,
switched off. The second build had the sign inverted: aimed ten degrees
off the king's road, the walker travelled sixteen. Neither would have
been caught by looking.

**And the band is the road plus a shoulder** (`width/2 + 4.2`): full
carry over the paint, letting go across four units of verge. At a run,
four units of half-width is under a second of walking, and a player
angling onto a road left it again before anything could happen.

## 3. THE ROWBOAT — the first mount

WORLD-SYSTEMS §4's rules, unaltered: **fast on its own ground, refuses
every other ground; found in the world and left in the world; no menu,
ever.** STORY §8 rule 1 adds the one that is not negotiable either:
**mounts are the PLAYER'S ALONE.** No inhabitant may ever be shown using
a boat to leave their own land — the two boats already drawn on this
coast belong to people who row out and come back, and they never move.

- **Where she lives:** THE RIVER MOUTH, drawn up on the north bank
  beside the footbridge and the mooring post that have both been on this
  map since Session 1. A river boat lives where the river is.
- **Her ground:** water. 5.4 units to a walk's 4.1, and the run is only
  ×1.3, because the point of the boat is that it opens a route and not
  that it shortens one.
- **What she opens:** the river. It crosses the entire page and has been
  a wall along its whole length except at three bridges; under oar it is
  the only road in this world that runs east–west across every land at
  once, from the salt to the source in the canyon, under all three
  bridges.
- **Taking her:** one prompt, TAKE THE OARS, the same prompt every note
  in the world uses. Stepping out is the same prompt again, and it finds
  the nearest bank; mid-river there is nowhere to put a foot and the
  world says so.
- **Leaving her:** wherever you left her, saved.

### WHERE THE BOAT STOPS — and it is a decision, not an oversight

**She does not leave the shore.** The river, wherever the river is; and
the sea within **thirty-four units of dry paper** — which is the whole
coast, the bight, Shelter Cove, the river mouth, and the long shallow
water either side of the sandbar. Past that the sea gets up and a
rowboat's business is over.

The open sea and the torn west edge **refuse**, and "you can row to the
torn west edge of the page" was the real question. It is the thing that
breaks it, for two reasons that have nothing to do with cost:

1. **THE WIDE BLUE is a land because the sandbar makes it walkable**,
   and it took Session 5 a whole session to earn that. A boat that goes
   anywhere wet deletes it: the bar stops being a route and becomes a
   strip of sand you could have rowed past. **A mount must open a route
   the walk did not have, never repeal one the walk worked for.**
2. **The torn west edge is the biggest reward the sheet has left.** It
   is not this session's to spend on a rowboat found beside a footbridge
   in the first ten minutes.

**The bar counts as shore**, deliberately: its crest is dry paper, which
is the whole of what it is, so an oar works either side of it and the
boat can run the shelf between the beach and the bar. That is the
reverse of deleting Session 5's work — the bar is the only reason a boat
can be out there at all, exactly as it is the only reason a walker can.

The player never has to be told where the boundary is, because they can
see it: **it is wherever they can still see the sand.**

## 4. THE DAY CYCLE

**One hour of the world is one hundred seconds. A full day is forty
minutes.** A crossing of the sheet is about ten minutes, so a player who
walks from the castle to the office park arrives in a different light
than they set out in; and a session is measured in hours, so nobody is
ever stuck in one light. Faster and the sky is weather, not time.
Slower and the day cycle is a thing you read about in the patch notes.

A fresh page starts at **nine in the morning** — the shipped neutral
light — so the player's first dusk is something that *happens to them*
rather than something they booted into.

### The three laws it obeys, all older than it

1. **Washes come only from `palette.ts`.** So the hour never touches the
   wash field and never invents a colour: `palette.LIGHT` holds its
   tints and the grade is one multiply in the paper post-pass.
2. **A fold is DRAWN, not shaded.** So dusk may not become a gradient
   down a hillside. The terrain shader's marks are not touched at all.
3. **The terrain's lamp is BEHIND the page.** That lamp is a direction
   in a vertex attribute and this system does not move it. **The desk
   lamp is a different object** — it is the light in the ROOM, it lives
   in the post-pass where the room already was, and the two never meet.

### And one rule decides the curve

**Eight in the morning to four in the afternoon is the shipped page,
exactly.** `LIGHT.day` is pure white, which is the identity for a
multiplier, so for eight hours of every day the grade is a no-op and the
page is bit-for-bit the page four lands earned their WOWED on. The day
departs from neutral at its two ends and nowhere in between.

### Where the hour's colour actually lives

Round 1 of the gate rejected the first build in one word — **SEPIA**.
Grading the whole frame by the light's colour at full strength is a
photo filter: at half past seven the greens went brown, the greys went
brown, the ink went brown, and the page lost every bit of colour
separation it had.

The fix is not a weaker filter. It is putting the colour where it is:

- **THE HAZE TAKES THE SUNSET.** The horizon is the only part of the
  frame that *is* light rather than a thing with light on it, so the fog
  colour carries the hour and it is the fog that says what time it is
  from across a land. And **the horizon goes darker than the page
  does** — a page in a dim room is dim; the room beyond it is dark. That
  single move is what makes this a desk lamp rather than a filter.
- **THE PAPER TAKES A LITTLE OF IT**, weighted by how bright it already
  is. Warm light warms what it lands on; it does not repaint a dark
  green hedge.
- **THE INK TAKES NONE OF IT.** Ballpoint is ballpoint at every hour,
  and the moment the line work goes brown the medium is gone.

Round 2 rejected the second build for the other half of the same
mistake: the haze at full tint was a **tangerine slab** and the town
read as a cut-out on a poster. `Key.sky` is that round written down as a
number — the sheet is paper, and a page under evening light goes
cream-gold, not tangerine.

### The lamps come on

The day cycle's whole argument is that **every land already built
improves for free**, and a session has to cash that somewhere or it is
a promise. Brim is where it is cashed, because it is a built, WOWED land
with four lampposts already standing in its square and ten terraces
already leaning over its high street:

- **the four lamps in Brim Square** light, hung at the lantern;
- **the windows over the high street** come on — *the row records its
  own casements as it draws them and the lit version reads the record*,
  because a second drawing cannot guess where a first drawing put its
  windows, and round 2 of the gate had warm rectangles floating over the
  roofs;
- **two braziers at Greyweather's gate**, which are the castle's only
  lit things. Wick changes the banners every day and nobody has told him
  the king is not coming back (STORY §7), so somebody keeps a fire in at
  the gate, for a road nobody rides up. The whole land argues in one
  drawing that only exists after dark.

Never all the windows: a run where every window is lit is a run nobody
lives in.

### The two seams, left open on purpose

- **The mixer** (WORLD-SYSTEMS §9 move 5). `Audio.setHour` takes the
  hour as a plain number and `Audio.hour` is public. Today it thins the
  room tone after dark and lengthens the melody's gaps; Session 8 will
  find the number already there and already correct, and will not have
  to re-open the day cycle.
- **The world builders** (STORY §7 — the story runs on routine).
  Anything may `import { clock } from '../daylight'` and ask what time
  it is, in one import, with no plumbing. `civic.ts` already does. The
  clock also answers `clock.phase` and `clock.clockText` ("twenty past
  six"), which is what a belfry with two disagreeing hands will want.

## 5. THE GATES STILL HOLD

Steep ground and deep water are this world's only traversal gating, and
`tools/check-terrain.mjs` now proves this session did not delete them:

- the carry is **bounded** (never > 1) and **zero everywhere outside the
  roads' own band**;
- **the line carries hardest** — asserted, so a later session cannot
  quietly flatten STORY §4's spine;
- **a full-speed carried step lands on walkable ground everywhere**, at
  every point along every road and both shoulders, in both directions;
- the boat **floats where she is left** and the river is **rowable end
  to end under all three bridges**;
- the open sea **refuses** past thirty-four units off dry paper, and the
  **torn west margin is unreachable**;
- and the strongest one: **every place the boat can put you ashore is
  already reachable on foot** — the whole water flooded, a landing tried
  from every square unit of it, each one checked against the walker's
  own flood fill from the spawn. Neither gated place (the Holdfast
  plateau, the castle ridge) has navigable water within fifteen units.
