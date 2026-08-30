# THE HARROW DOWNS — land spec

*Session 10. Farm country: the only land in the world whose wait has a
date on it, and the only register in the game that is not wry.
`THE-WAITS.md` §10 is binding on everything below — **do not be clever
in the Downs.***

Rect: x 60 → 230, z −100 → 130. Wash `WASH.downs`. Voice: the plucked
string, second register, undamped — *the same wood out in the open
light* (`Audio.ts`, `LAND_VOICE`).

---

## 1. THE SHOT

**Stand on the mill lane at (144, 24), just north of the ford, and look
north.** It is the one frame that contains this session's whole thesis —
field patchwork against pine dark — and every other decision in this
file is made to serve it.

| layer | what |
|---|---|
| **foreground** | the ford at the bottom of the frame: two cart ruts going down into the water and coming out again, the stepping stones beside them, and the river running left to right under the lens |
| **near left** | **THE HEADLAND** — a trestle table on the unploughed strip at the field's edge, laid for two, with one thorn tree over it. It is small in the frame and it is the first thing anybody's eye lands on, because it is the only rectangle in a land made of stripes |
| **subject** | **THE HOME FIELD**, right of the lane: standing corn in stooks, and four bent figures working it who do not straighten (`THE-STRANGERS` C16) |
| **far** | **THE MILL** on the mill rise, dead north up the lane, sails mid-turn |
| **horizon** | the Penwood's south edge, a hundred and twenty units out and half-eaten by haze: the pine dark, and it is a real wood and not a painted flat |
| **accent** | none. The Downs have no accent colour, on purpose — Brim has the red cloth and Longshore has the huts, and this land's whole argument is that nothing here is remarkable. The eye is carried by VALUE (the dark of the wood, the dark of the stooks' shadow side) and never by hue |
| **moving** | the sails, one revolution in ten minutes of game time; a gust crossing the standing corn left to right; and the sheep in the drove, off to the west, if the walker went that way first |

**Why it composes.** The mill lane runs dead north–south, so it is a
thing you walk ALONG and the mill is a thing you LOOK AT, which is the
camera's law obeyed rather than fought. The river crosses the frame just
under the lens and gives it a floor. The land rolls in stripes that run
with the lane, so the recession is drawn by the ground itself.

---

## 2. PLACES

| place | centre | r | what it is, and why walk to it |
|---|---|---|---|
| **THE MILL** | 150, −8 | 9 | *built; has a note.* A windmill on the highest ground in the land. The wait's second place: **a building that is used**, and the only wait in the world whose date comes round. Its sails turn — really turn, a quarter every few minutes, which is the joke in the note made literal and made checkable |
| **THE HEADLAND** | 136, 8 | 8 | **JOAN HARROW's**, and the wait. A trestle laid for two on the strip of grass the plough turns on. You sit down. The second setting stays out |
| **THE HOME FIELD** | 176, −2 | 14 | the field being worked. Stooks in rows that are not rows, four hands bent in it, and Joan among them at working hours. **It does not become anything. That is the point of the Downs** |
| **THE FORD** | 147, 19 | 8 | where the mill lane crosses the river. Ruts down into the water, stones for anybody on foot, a shed axle nobody has moved. The seam of the land, and its midpoint |
| **THE DROVE** | 96, 76 | 11 | a sunken lane between two hedges, running north, with the flock in it. They part when you walk into them and close up behind you. The land's player-responsive motion, and its one enclosed space |
| **THE SCARECROW** | 122, 84 | 6 | *built; has a note.* Left where it was, given a coat with a Brim maker's mark inside the collar that nothing will ever mention (`THE-STRANGERS` U8) |

**Seams.** The east road comes over the crease from THE COMMON at
(60, 46) and crosses the river on the bridge at (110, 45) — both built,
both left alone. The mill lane is EXTENDED north this session from the
east road across the ford to the mill yard, which is what gives the land
its north–south spine. The canyon trail leaves at (225, 8).

```
   z −100 ────────────── the Penwood's edge, the pine dark ───────────
          rough grazing, thin soil, one stone trough          VOID
              ▲
   z −20   [THE MILL]────┐ the mill rise
              │          │   [THE HOME FIELD]  stooks, four bent backs
   z 0     [THE HEADLAND]│      ▓▓▓▓▓▓▓▓▓
              the picnic │      ▓▓▓▓▓▓▓▓▓
   z 20   ~~~~~~~[THE FORD]~~~~~~~~~~~~~~~~~~ the river
   z 45   ═══bridge═══════╪════ the east road ═══════════▶ canyon trail
                          │ the mill lane, running south
   z 76   ║[THE DROVE]║   │            VOID: sour ground, a gate to
            the flock     │            nowhere, and then the city
   z 84       [SCARECROW] │
   z 130 ────────────── GREYLINE CITY ─────────────────────────────
        x 60      96   122 147   176        230
```

**The two composed voids.** The north-west strip (x 88–128, z −92 to
−48) is rough grazing going up to the wood: no fence, no crop, one stone
trough and nothing else, and it is what makes the wood read as an EDGE
rather than as a wall. The south-east quarter (x 182–226, z 58–124) is
ground going sour toward the city: stubble that was never cut, one field
gate standing open in a hedge that has gone, and no second thing.

---

## 3. COMPOSITION PLAN

**What defeats the array-look here is the same thing that made the
array-look in the first place: a field is a repeating unit.** The draft
in `wilds.ts` had seventy wheat decals on a Poisson scatter, fourteen
bales, thirty fence panels on three straight runs, and two identical
barns. Every one of those is cut.

The replacement is one rule: **NOTHING IN THIS LAND IS SCATTERED. IT IS
ENCLOSED.** Farm country is not props on grass, it is a set of shapes
with edges, and the edges are hedges.

- **THE FIELD PLAN.** Eleven named fields, authored as polygons, tiling
  the workable ground. Each one carries exactly one state — standing
  corn, stooked, stubble, ploughed, fallow, grazed — and the states are
  distributed so that no two fields sharing a hedge are in the same
  state, which is what makes a patchwork a patchwork. A field's content
  is grown inward from its own boundary, so the crop stops where the
  hedge is and never within four units of it.
- **THE HEDGES ARE THE DRAWING.** Every field boundary gets a hedge run
  with four silhouette variants, gaps where a gate is or was, and a
  scatter of standards (single grown-out trees left in the line, which
  is what hedges actually do). The hedge lines run mostly north–south
  along the harrow's grain and cross east–west only where a field ends,
  so the frame is striped and not gridded.
- **DENSITY GRADIENT.** Densest at the mill and the home field (the
  worked centre), thinning west toward the crease and north toward the
  wood, and giving up entirely in the two voids. The south-east goes to
  nothing over about forty units rather than stopping at a line.
- **OCCLUSION.** Every framing gets a hedge or a stook group inside
  fifteen units, the subject at thirty to fifty, and either the mill or
  the wood beyond. In the drove the hedges are the occlusion on both
  sides at once, which is why the drove is the only place in the land
  where you cannot see out.
- **CUT:** the two barns (one survives, re-drawn, at the mill yard where
  a barn belongs), the fourteen scattered bales, the thirty fence panels,
  the seventy wheat decals, and the loose grass field.

---

## 4. INK TECHNIQUE

**THE DOWNS' SIGNATURE IS THE STRIPE, AND ITS SUBJECT IS WORK.** Every
mark in this land is either a run of short parallel strokes laid across
the fall of the ground — furrow, stubble, thatch, hedge, sheep's fleece —
or a single upright standing against them. Nothing here is drawn with an
outline and then filled: the Downs are drawn the way a field is made, in
passes, and the pen goes back and forth.

The one exception is THE HEADLAND, and it is the land's whole point: the
picnic is the only thing in the Downs drawn as a closed rectangle with a
line all the way round it. It is a made thing in a worked place.

| texture | canvas | seed | primitives | variants |
|---|---|---|---|---|
| `stubbleDecal` | 256×256 | field id + index | `stroke` short verticals in ranks that wander | 4 |
| `ploughDecal` | 256×256 | as above | `stroke` long furrow pairs, `hatch` at 0.12 alpha in the trough | 3 |
| `standingCornTexture` | 128×96 | index | `stroke` clumped heads, drawn leaning ONE way | 5 |
| `stookTexture` | 128×160 | index | `stroke` a bound sheaf: eight stems, one band, one shadow side | 4 |
| `downsHedgeTexture` | 512×160 | run + index | `scribbleCircle` lobes + `stroke` a base line + `hatch` shade side | 4, plus 2 gapped |
| `hedgeStandardTexture` | 192×256 | index | a grown-out tree in a hedge line: one trunk, no roots showing | 3 |
| `millTexture` | 320×420 | — | tower, cap, stage, and the sails on their OWN canvas so they can turn | 1 + `millSailsTexture` |
| `millSailsTexture` | 320×320 | — | four sweeps, cloth on two of them and bare lattice on two, because a miller reefs what he does not need | 1 |
| `picnicTexture` | 256×192 | — | trestle, cloth, two settings. `picnicTexture(seed, both)` — the second setting present or put away | 2 states |
| `joanTexture` | 96×176 | — | a woman standing in corn with a hook, back three-quarters on, drawn WORKING and never resting | 1 |
| `fieldHandTexture` | 96×160 | pose | bent, three poses, none of them looking up | 3 |
| `sheepTexture` | 128×96 | pose | fleece as one continuous scribble, four heads: down, down, down, up | 4 |
| `stoneTroughTexture` | 160×96 | — | the void's one silhouette | 1 |
| `fieldGateTexture` | 192×128 | shut/open | five bars, one hinge post, one that is not | 2 |
| `fordStonesDecal` | 256×128 | — | eight stones, the ruts, and the water's own scour | 1 |
| `shedAxleTexture` | 160×96 | — | at the ford, and nobody has moved it | 1 |

The scarecrow keeps its drawing and gains one mark: a maker's stamp
inside the coat collar, at pencil weight, four pixels across. Nothing
will ever mention it.

---

## 5. MOTION & LIFE

- **THE SAILS** (idle). One revolution in about ten game minutes — slow
  enough that "they were mid-turn when you came over the rise" is still
  true, fast enough that a player who comes back finds them a quarter
  round (`THE-STRANGERS` U24). Per-frame rotation on the sails' own quad.
- **THE GUST** (idle). A wave of lean crossing the standing corn west to
  east every eleven seconds, driven from the field shader's wind phase
  plus a travelling term — one field, one gust, the whole land at once.
- **THE FLOCK** (player-responsive). Thirteen sheep in the drove. Walk
  into them and they part — not a scatter, a PARTING: they move square
  off the lane's axis to whichever hedge is nearer, hold while you pass,
  and close up behind you. Two of them never move, because two of them
  never do.
- **THE HANDS** (idle, and it is the point). Four figures in the home
  field on a slow bend-and-straighten, out of phase, and the phase never
  reaches the top. Joan is among them at working hours and at the
  headland at noon, off the same clock Marget's day runs on.

---

## 6. SOUND

Bed and voice are already assigned and are not re-opened. Step zone
stays `grass`; the ford is `wet` for free.

| event | trigger | synthesis |
|---|---|---|
| `mill-creak` | within forty units of the mill, every 12–20 s | the shaft taking the load: a low knock, a `glide` from 96 to 74 Hz over half a second, and a second knock a beat and a half later. The only sound in this land made by a machine |
| `sheep` | within thirty units of the drove, every 7–14 s | two `glide`s a tone apart, the second falling further than it should, at about 480 Hz, thin and nasal — a `bandpass` `surge` under it for the breath |
| `field-work` | anywhere in the worked ground, every 14–26 s | somebody's tool going into the ground a long way off: one soft `knock` at 210 Hz and its dry answer. **No voices.** Nobody in the Downs is talking |

---

## 7. POIS & NOTES

| label | pos | prompt | on the road? |
|---|---|---|---|
| THE MILL | 150, −8 | WATCH THE SAILS | at the lane's head |
| THE HEADLAND | 136, 8 | **SIT DOWN** | off it, 10 units |
| THE HOME FIELD | 176, −2 | *(none)* | off it |
| THE FORD | 147, 19 | CROSS ON THE STONES | on it |
| THE DROVE | 96, 76 | *(none)* | off it |
| THE SCARECROW | 122, 84 | STARE BACK | off it |

**THE HEADLAND's prompt is the wait.** `SIT DOWN` is the only interact
in the game that resolves a wait by itself, with nothing carried and
nothing worked out (`THE-WAITS` §10). The second setting stays out
afterwards, in every save, forever.

Note bodies stay in the region module. **The Downs' notes are the only
ones in the game with no joke in them.** Two sentences, plain, and the
second one is never the punchline.

---

## 8. PERFORMANCE BUDGET

Eleven fields, six crop fields plus hedges: about eighteen
`StandeeField`s at 40–90 instances, so **eighteen draw calls for the
whole land** and no per-field geometry. Unique standees: the mill (two
quads), the picnic (two, one hidden), Joan, four hands, the trough, two
gates, the axle — about fourteen. Texture memory ≈ 4.1 MB at load,
disposed with the region group. The flock is one field of four pose
textures × 13, updated per frame with two `Math.hypot` calls each.
Build-time cost is one frame at stream-in, same as LONGSHORE.

## 9. NEW ENGINE NEEDS

**THE FORD** — `layout.FORDS`, and `Terrain.blockedAt` consults it. A
ford is not a bridge: the water stays water, so the river's waterness is
untouched and a rowboat still passes through it (which keeps
`route:the-river` intact). What changes is the BED — a gravel bar the
river runs a hand deep over — so the page lets a walker across without
pretending there is a plank. Generic, named for the thing, and the dry
lands will want it.

Nothing else. The field/standee/decal primitives carry the rest.
