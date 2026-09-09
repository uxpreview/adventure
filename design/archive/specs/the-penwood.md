# THE PENWOOD — land spec

*Session 10. Pine dark, and the one land in the world whose geography is
a single person's caution. `THE-WAITS.md` §7 is binding: **Brack's forty
units are a behaviour and a road, never a note.***

Rect: x 60 → 230, z −280 → −100. Wash `WASH.forest`. Voice: the plucked
string, first register, damped — *pine is what a string is made of, and
the wood eats the top of it* (`Audio.ts`, `LAND_VOICE`).

---

## 1. THE SHOT

**Stand on the track at (150, −153) and look north.** You are forty
units due south of the water, which is the closest the road ever comes
to it, and that is not a coincidence — it is the whole land.

| layer | what |
|---|---|
| **foreground** | one pine trunk at the frame's left edge, cropped, drawn at full pressure, close enough that you cannot see its top. It is the only thing in the frame with weight |
| **near** | the track's inner verge, worn deeper on the tarn side than on the other (`THE-STRANGERS` U18) |
| **subject** | **BRACK**, twelve units up the road, small, dark, seen from behind — a man standing on a path with his face to a pond. He is between you and it, and he does not move out of the way |
| **middle** | the ground falling away through a colonnade of old trunks. There is no undergrowth inside the forty units, because there is no light down there, and the trees are the biggest in the wood because nobody has ever cut them |
| **far** | **THE TARN**: black, flat, closed, with a one-oared boat drawn up on the near shore. It is the only dark shape in a pale world |
| **horizon** | the far side's trees standing straight up out of the water and going to haze |
| **accent** | none, and none anywhere in this land |
| **moving** | almost nothing, and that is the composition. The tops move; the trunks do not. Brack paces four steps and comes back, facing the water the whole way |

**After you have been to the water,** the same frame has one difference
and one only: Brack is turned a quarter, in profile, looking down the
road. **It is the largest thing that has happened in the Penwood in
forty years and nothing in the game will ever say so.**

---

## 2. PLACES

| place | centre | r | what it is, and why walk to it |
|---|---|---|---|
| **THE WOOD ROAD** | 78, −124 | 10 | where the track leaves Brim's light and the canopy shuts over it. Twelve units of transition authored as a place: the last hawthorn, the first pine, the litter changing underfoot, and the sky going out |
| **THE OARS** | 100, −158 | 8 | **HALLOWS'**, off the track (`THE-STRANGERS` S1 beat 1). A woodcutter's stand, a block, and a lean of finished oars against a trunk. Every one of them is the wrong shape. He has never seen an oar, and he will not walk forty units to look at the one that is right there |
| **THE ROUND** | 150, −153 | 12 | the track's closest approach to the water, and where Brack is. THE SHOT stands here |
| **THE TARN** | 150, −195 | 13 | *built; has a note.* Still, black, forty units inside the road that everybody uses. There is nothing in it |
| **THE DEEP PINES** | 188, −246 | 12 | *built; label only — gains a note.* Off the road entirely, north-east, where the wood is oldest: ninety units of vertical, no floor plants, and the light between the trunks goes green (`THE-STRANGERS` S7 beat 2) |

**AND THE ROAD IS THE SIXTH PLACE, THOUGH IT IS NEVER LABELLED.**

```
        z −280 ═══ the page's north margin, curling ═══════════════
                        VOID: the wood at its emptiest
                            ╭─────────╮
        z −237            ╭─╯         ╰─╮        [THE DEEP PINES]
                        ╭─╯             ╰─╮
        z −195        ╭─╯   ( THE TARN )  ╰─╮
                      │      ● boat        │
                      ╰─╮                ╭─╯
        z −158  [THE OARS] ╰─╮        ╭─╯
        z −153              ╰[THE ROUND]╯   ← 42 units, all the way round
                          ╱
        z −124   [THE WOOD ROAD]
        z −110  ← the Wood Gate, Brim
        z −100 ─────────── THE HARROW DOWNS ─────────────────────
              x 60    100   129 150 171   192      230
```

**THE PENWOOD HAS ONE ROAD AND IT IS A CIRCLE.** The track comes in from
Brim's Wood Gate, arrives at the ring's south-west, and there is no
other way out. Everybody who has ever crossed this wood has walked part
of a circle round a pond and gone back the way they came, and not one of
them has ever thought that strange. The map draws roads; the map will
say this, in a shape, and nothing anywhere will explain it.

**Border seams.** West: the Wood Gate at (55, −110), built in Session 3
on Brim's side; the Penwood's half is THE WOOD ROAD. South: the Downs'
rough grazing runs up to the wood's edge, so the treeline is a real edge
with rank grass under it and not a wall — **and it is the far silhouette
of THE HARROW DOWNS' shot**, so it is authored from the south as well as
from the north. East: the pines thin onto stony ground toward Splitrock
and stop being drawn.

---

## 3. COMPOSITION PLAN

**A forest is the single easiest place in this project to break the
no-array rule, and the draft broke it comprehensively:** two hundred
pines on a Poisson scatter at 5.5 units minimum spacing, one silhouette
each, uniform density from border to border, and a hatch that sprays
outside the drawing so the whole wood reads as falling rain.

The replacement is a STAND STRUCTURE. Real wood is not evenly spaced —
it is a mosaic of stands of different ages, with the gaps between them
doing as much work as the trees.

- **FOUR STANDS, AUTHORED.**
  **The thicket** (x 84–128, z −200 to −140): young pine, close, small,
  head height on the eye — the part of the wood you cannot see through.
  **The old ring** (inside 42 units of the tarn): the biggest trees in
  the land, widely spaced, no undergrowth, high canopy. Nobody has ever
  cut them, and the untouched stand is exactly the shape of one man's
  fear. **The deep pines** (x 168–212, z −268 to −224): tallest,
  darkest, drawn with the crown cropped off the top of the quad so they
  read as taller than the frame. **The failing edge** (z > −126, and
  x > 206): thin, leaning, gappy, with birch and hawthorn in it, going
  to rank grass.
- **THE VOIDS ARE THE POINT.** The whole north-west quarter (x 70–124,
  z −258 to −196) has nine trees in it and eleven fallen ones. It is
  where the wood stops being a wood.
- **THE PINES LEAN AWAY FROM THE TARN. ALL OF THEM**
  (`THE-STRANGERS` U17). Implemented as a placement rule and not as a
  drawing: every pine's flip and lean is decided by its bearing from
  (150, −195), so the lean is consistent across the entire land and
  perfectly consistent around the water. It reads first as wind, then,
  eventually, as something else. Nothing says it.
- **OCCLUSION IS FREE HERE AND IS THE LAND'S WHOLE DEPTH BUDGET.** Three
  layers, always: a full-pressure trunk inside eight units, the stand at
  twenty-five to sixty, and the haze. The rule for every framing is that
  ONE near trunk crops the frame — the wood is a place you look out of.
- **CUT:** the two Poisson pine fields, the thirty oaks, the forty
  mushrooms on a three-unit spacing, the forty edge bushes, and the pine
  drawing itself, which is replaced.

---

## 4. INK TECHNIQUE

**THE PENWOOD'S DARKNESS IS LAYERED HATCH DENSITY, AND ITS SIGNATURE IS
THE VERTICAL.** The Downs are drawn in stripes across the fall of the
ground; the Penwood is drawn in strokes straight up the page. Every mark
here is vertical or it is the ground.

Three things make the wood dark without making it black:

1. **The needle mass is hatched INSIDE its own silhouette**, clipped,
   three passes at 0.16–0.22 alpha crossing at fifteen degrees. The old
   drawing's `hatch` call had no clip and sprayed diagonal lines fifty
   pixels past the tree, which is why the wood looked like weather.
2. **Pressure falls with distance in three fixed registers** — near
   trunks at width 4.5 and alpha 0.9, the stand at 2.4 / 0.62, the far
   trees at 1.4 / 0.34 and PENCIL rather than INK. A stand is built from
   all three at once, which is what makes it a stand and not a row.
3. **The floor is drawn.** Needle litter under every stand, at low alpha,
   dense under the old ring and absent in the voids.

| texture | canvas | seed | primitives | variants |
|---|---|---|---|---|
| `penwoodPineTexture` | 192×384 | index, register 0/1/2 | trunk `stroke` full height, whorls of `stroke` down-and-out, `hatch` CLIPPED per whorl, one broken lower limb | 6 per register |
| `pineCropTexture` | 224×384 | index | the near trunk: bark grain, one branch stub, crown off the top of the quad | 4 |
| `youngPineTexture` | 128×192 | index | the thicket: dense, head-height, no visible trunk | 4 |
| `fallenPineTexture` | 320×128 | index | a trunk down, root plate up, drawn as a horizontal in a vertical land | 4 |
| `needleFloorDecal` | 256×256 | index | short strokes, all one way, `scribbleFill` at 0.1 in the shade | 4 |
| `tarnSkinDecal` | 512×512 | index | **the tarn's blackness, drawn.** Pooled INK at 0.82, the far trees' reflection as vertical strokes going DOWN, and one flat highlight that never moves | 3, tiled to the rim |
| `brackTexture` | 96×176 | pose | **watching** (from behind, square, hands down) and **turned** (three-quarter, face down the road, a stick) | 2 states |
| `hallowsTexture` | 112×176 | — | a woodcutter mid-cut, back to the road | 1 |
| `oarLeanTexture` | 224×256 | — | finished oars leaning on a trunk. Every blade a different wrong shape, and none of them is an oar | 1 |
| `choppingBlockTexture` | 128×96 | — | a block with the axe in it | 1 |
| `stumpTexture` | 128×80 | index | cut stumps, only ever OUTSIDE the forty units | 3 |
| `birchTexture` | 160×288 | index | the failing edge's other tree: horizontal bark marks, the one place a stroke lies down | 3 |
| `bracketFungusTexture` | 96×64 | index | on the fallen trunks and nowhere else | 2 |
| `wornRoundDecal` | 256×160 | index | the track's wear, **asymmetric**: heavier on the inner edge | 3 |

The tarn's boat keeps its drawing and gains the one detail
`THE-STRANGERS` U19 asks for: it has one oar, and the oar is drawn at
lighter, cleaner pressure than the boat, because it is newer.

---

## 5. MOTION & LIFE

- **THE CANOPY** (idle). Wind amplitude on the pine fields is 0.03 —
  a sixth of the Common's — and the near-trunk quads have none at all.
  A wood does not move at the bottom, and getting that wrong is what
  makes a drawn forest look like a screensaver.
- **BRACK** (idle, and it is the land's clock). He paces about thirty
  units of the ring's south arc and comes back, one lap in ninety
  seconds, **facing the tarn the whole way**. He never has his back to
  it and he is never inside forty units of it — both of those are
  geometry, not notes. Which drawing is up depends on `fact:the-tarn`,
  asked in the present tense every frame, the way Brim asks about its
  market.
- **THE GOAT** (player-responsive). One goat, somewhere in the wood
  (`THE-STRANGERS` E12 says it gets out, so it is already canon). Walk
  toward it and it moves twenty units off, stops, and looks back. It is
  never catchable and nothing ever remarks on it.

---

## 6. SOUND

Bed and voice assigned, not re-opened. Step zone stays `grass` — a
needle floor is the quietest ground in the world and `grass` is already
the quietest timbre we have.

| event | trigger | synthesis |
|---|---|---|
| `axe-far` | anywhere in the wood, every 16–30 s | Hallows, a long way off: one hard `knock` at 300 Hz, a second at 250 a beat later, and then the wood's answer — the same knock at a tenth the level, 340 ms behind. The Penwood is the only land besides the canyon that repeats you |
| `tarn-drip` | within thirty units of the water, every 9–16 s | one `tone` at 700 Hz for 60 ms into a 260 Hz `tone` held two seconds. Something small landing on flat water and the whole pond taking a moment about it |
| `pine-tick` | anywhere, every 5–11 s, and never within twenty units of Brack | a cone or a needle coming down through the branches: three `knock`s at 1500/1100/800 Hz over 180 ms, falling and getting quieter. The cheapest possible proof that there is something above you |

**And one silence.** Within twenty units of Brack nothing fires but the
bed. It is not stated anywhere and it is the only place in the game
where the ambient stops.

---

## 7. POIS & NOTES

| label | pos | prompt | on the road? |
|---|---|---|---|
| THE WOOD ROAD | 78, −124 | *(none)* | on it |
| THE OARS | 100, −158 | COUNT THEM | off it, 14 units |
| THE ROUND | 150, −153 | *(none)* | on it |
| THE TARN | 150, −195 | TRY THE ROWBOAT | inside the forty |
| THE DEEP PINES | 188, −246 | LOOK UP | off it entirely |

`THE OARS`' prompt is a joke that is not funny and is not supposed to
be: you can count them, and the note does not, and neither does the
game, ever, anywhere.

**THE TARN teaches `fact:the-tarn` by ARRIVAL, not by reading.** The
walker learns it by being inside twenty units of the water, which is
inside Brack's forty, which is the one line in this world nobody but the
walker crosses. Reading the note is not required and never was.

---

## 8. PERFORMANCE BUDGET

The wood is the heaviest instanced land in the game and it has to be the
cheapest per tree. Eighteen `StandeeField`s (6 pine variants × 3
registers = the stands; 4 young; 4 fallen; 4 floor decals), 40–110
instances each, **eighteen draw calls for about six hundred trees.**
Unique standees: eight cropped near-trunks, Brack (two quads, one
hidden), Hallows, the oar lean, the block, the boat, three stumps —
about eighteen. The tarn's skin is nine decals. Texture memory ≈ 4.6 MB.

Mobile: the near-trunk quads are the only overdraw risk, and there are
eight of them in the land and never more than two in a frame. If frame
rate moves, the thicket's young-pine field drops to two variants before
anything else is touched.

## 9. NEW ENGINE NEEDS

**None.** Everything in this land is `ctx.field`, `ctx.standee`,
`ctx.decal` and the ring in `layout.ROADS`. The one thing worth
recording for a later session: `ctx.standee` is still the choke point
for the skyline, and the near-trunk quads are eleven units tall, so any
POI written under one gets its name pushed up — which is correct, and is
why THE ROUND's label has nothing standing within its own radius.
