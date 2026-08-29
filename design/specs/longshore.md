# LONGSHORE — land spec

*Session 5. Rect `{−250..−150, −280..280}` (100×560 — the tallest, thinnest
land on the sheet), wash `WASH.sand`, step `sand`, mood `beach` (major
add6, unhurried). The first land authored ON elevation rather than
before it. Its fiction: **the page's wet margin cockled and tore, and
one tongue of fibre held.* Everything here is placed against that fact.*

## 1. THE SHOT

*(Revised after round 5 of the gate; the original said (−228, −46),
which is where the traverse still runs north-WEST and the ledge leaves
the frame to the left. The camera only ever looks north, so the shot is
where the ledge does.)*

Standing on **the cut** at ≈ (−237, −49), where the traverse turns and
runs north along the Holdfast's seaward face:

- **Foreground:** the ledge's outer edge — three tarred posts with a
  slack rope between them, the nearest one cropped by the frame, and
  the worn chalk of the path underfoot.
- **Subject:** the cut itself, threading north with the chiselled rock
  standing over the right hand of the frame, hatched down its own fall
  line by the terrain shader (this is the one place in the world where
  that mark is the SUBJECT). **The rock is the GROUND, not a drawing.**
  Four rounds of the gate went into learning that: every stand-up wall
  put along this ledge read as a pale slab hung in front of the cliff it
  was standing in for. The only drawn thing on the ledge is the chisel
  marks, and they lie flat.
- **Far silhouette:** the point's crest with the sea-mark cairn on it,
  and past it nothing but haze — the sheet's own west margin.
- **Below left:** the sea, thirty feet down, breaking white on the
  rocks at the cliff's foot. The drop is real: the height field falls
  away on that side because the cut is CARVED, never built out.
- **Accent color:** the red caps of the ledge posts and the cairn's
  flag — the only red on this coast, and it marks a way.
- **Moving:** the rope breathes; gulls cross below eye level, which is
  the whole point of standing above them; surf works the rocks.

Portrait's version is better than desktop's, because the composition is
already vertical: sea / ledge / wall / crest stack up the frame.

## 2. PLACES

Six places on a 560-unit strip. The land's authored spine runs
z −170 .. +230; both ends decay into composed void with one midpoint
each, because a 560-unit rect filled end to end is coverage, not places.

| place | center | r | why it is worth the walk |
|---|---|---|---|
| THE BOARDWALK | −224, 58 | 10 | a PROMENADE running north, and a stub of jetty west where the coast road ends. The only place on this coast with paint on it |
| THE PAINTED HUTS | −205, 3 | 11 | four huts on stilts at the promenade's north end, backs to the wind |
| THE CUT | −228, −46 | 12 | THE SHOT. The ledge somebody chiselled — the only way up |
| THE HOLDFAST | −237, −80 | 12 | the point: eleven units up, the sea on three sides, the cairn |
| SHELTER COVE | −221, −134 | 13 | behind the point: water that is never rough, a boat drawn up on its own waterline, the dune closed behind it |
| THE RIVER MOUTH | −203, 204 | 11 | the river crosses the whole sheet and ENDS here, under the plank footbridge, in salt |

```
              z−280 ┌──────────── the north void ─────────────
                    │   . the last groyne (−226,−210)
              z−170 │  ╭────╮
    SHELTER COVE ───┼─▒▒▒▒▒▒│  dune closes behind ▓ (cove back, +4.4)
              z−134 │ ▒▒▒▒▒▒╯
              z−116 │  ╲___
                    │   ███████  THE HOLDFAST  +11.0, cliff-ringed
              z−78  │ ~~███████             ★ cairn
                    │  ╱███████
              z−46  │ ╱ ← THE CUT (carved ledge, the only way up)
              z−32  │╱
              z−6   │▒▒▒▒  THE SOUTH BIGHT — the sea eats 18 units in
              z+2   │  ⌂⌂⌂⌂  THE PAINTED HUTS (on the dune)
              z+58  ║══ jetty ══╬═ THE BOARDWALK ═ coast road ═►
                    │           ║ (the promenade runs NORTH: the
                    │           ║  camera never looks any other way)
                    │  ╲
                    │   ╲ the sandbar leaves the beach (THE WIDE BLUE)
              z+108 │  ▪ a boat, resting
              z+204 │ ≈≈≈ THE RIVER MOUTH ≈ footbridge (−200,210) ≈≈
              z+280 └──────────── the south void ─────────────
   x:      −250          −210          −174 (dune)      −150
```

Seams: the coast road arrives at the boardwalk (a place, not an edge);
the river mouth is shared with the river's own web; the sandbar's root
is the seam with THE WIDE BLUE and is the only one the player crosses
on purpose.

## 3. COMPOSITION PLAN

The array-look is this land's biggest risk: a beach is a strip, and a
strip invites a row. Rules:

- **Marram is clustered, never scattered.** Hearts on the dune's
  landward shoulder and in its blowouts; four drawings; density falls
  to zero on the seaward face of the dune, because sand that moves
  holds nothing. Deliberate bare sand between clusters.
- **The tide line is a LINE, and a line is drawn once.** Wrack, weed
  and shell fragments follow `coastX(z)` at a wandering offset, thicken
  in the bight (where the surf runs up), thin to nothing on the
  Holdfast's rock foreshore, and pile in the cove's crescent. Gaps are
  authored, not random.
- **Occlusion.** Every framing on this coast wants: a near thing (a
  post, a hull, marram), a subject, and a far silhouette in haze (the
  point from the south; the huts from the cove; the boardwalk rail
  from the sandbar).
- **Density gradient.** Busy at the boardwalk (the only paint), sparse
  on the bight, EMPTY on the Holdfast's crest but for the cairn — the
  point earns its silence — and quietly domestic in the cove.
- **CUT from the current draft:** the 30 scattered palms (a temperate
  wrack-and-marram coast has no palms; they were Session 1's shorthand
  for "beach"), the 7 umbrellas scattered by rand, the 4 huts placed on
  a fixed z-stride, the 130-instance uniform grass field, and the four
  deck decals that were the whole boardwalk.

## 4. INK TECHNIQUE

**The coast's signature is the DRY BRUSH AND THE HORIZONTAL.** Every
mark on this land is either (a) a long low horizontal — plank, rail,
wrack line, hull sheer, the sea's own swell — or (b) a vertical stab
standing against it: a post, a marram blade, a mast, the cairn. Nothing
here is diagonal except the cut, which is why the cut reads.

Second technique: **the paint is peeling.** The huts and the boardwalk
are the only painted things on the sheet, and their paint is drawn as
broken fill with the paper showing through the wear — salt does that,
and it lets one hut carry colour without becoming a cartoon.

| texture | canvas | seeds | primitives | variants |
|---|---|---|---|---|
| `marramTexture` | 96×128 | 4 | stroke (single-sign lean) | 4, never x-flipped — one wind |
| `wrackDecal` | 160×96 | 3 | stroke, scribbleCircle, hatch | 3 |
| `beachHutTexture` (rebuild) | 192×192 | 4 | fillPoly, poly, hatch, broken fill | 4 + 3 paints |
| `groyneTexture` | 320×96 | 3 | line, stroke, hatch | 3, plus a decayed variant |
| `boardwalkDecal` | 256×160 | 3 | line, hatch | 3 |
| `boardwalkRailTexture` | 512×112 | 2 | line, stroke | 2 |
| `cutPostTexture` | 48×128 | 3 | stroke, red cap | 3 |
| ~~`cutWallTexture`~~ | — | — | **CUT after four rounds of the gate.** The cliff is the ground; a stand-up in front of it is a slab | — |
| `chiselMarksDecal` | 192×160 | 6 | line (paired grooves), stroke, hatch | 6 — lies FLAT, which is why it survives |
| `cutRopeRunTexture` | 384×128 | 3 | stroke (catenary), peeledPoly | 3 |
| `seaStackTexture` | 224×256 | 3 | poly, hatch, fillPoly | 3 |
| `cairnTexture` | 128×192 | 1 | poly ×7, a bleached flag | 1 |
| `beachedBoatTexture` | 224×112 | 2 | stroke, poly, hatch | 2 |
| `lobsterPotTexture` | 96×80 | 3 | scribbleCircle, hatch | 3 |
| `windsockTexture` | 128×160 | 1 | poly, stroke | 1 |
| `gullTexture` (rebuild) | 96×64 | 4 | stroke | 4 postures: glide, flap, stand, call |
| `shoreRockTexture` | 160×96 | 4 | poly, hatch | 4 |

## 5. MOTION & LIFE

- **Idle 1 — the marram.** `StandeeField` wind on every dune field
  (amp 0.09, freq 0.85): slower and wider than the meadow's grass,
  because this is a sea wind and it does not gust.
- **Idle 2 — the windsock.** The one instrument on this coast, at the
  jetty head, swinging on the same wind the marram is leaning in. It
  never stops, and it is how you know the wind is real rather than a
  shader.
- **Player-responsive — the gulls put up.** A working flock stands on
  the tide line. Walk into them and they lift, wheel out over the
  water and come back down further along, with `gull-cry`. (Same
  contract as Brim's pigeons; different bird, different distance —
  gulls go further and take longer to settle, because gulls do.)

All three are per-frame region updates except the marram, which is
vertex-stage and free.

## 6. SOUND

Mood unchanged (`beach`). Step `sand` — except on planks. `layout.ts`
gained `PLANKS`, a list of decked ground the boardwalk and the road's
three bridges share, and `Terrain.onPlanks` (which replaced
`nearBridge`) does both of that list's jobs: the planks knock HOLLOW,
and they carry the walker over water the page would otherwise refuse.
So the promenade is audible before it is legible, and its jetty head
stands out over the first of the sea.

New `Audio.event` cases (the file is only what the world says, so both
of these are added deliberately):

- **`surf-break`** — LONGSHORE's voice, and the first NOISE event in
  the game. A band-passed noise swell that rises over ~0.5 s and falls
  away over ~1.4 s, centre frequency sweeping 900 → 260 Hz: a wave
  standing up, breaking, and running out. Needs one new synthesis
  helper, `surge()`.
- **`gull-cry`** — two or three descending mews, each a sine gliding
  down a fourth with a hard front. Needs `glide()`.

Ambience: `surf-break` every 4–9 s, with the gap SHORTER the closer the
walker is to the water — the sea gets louder as you approach it, which
is the cheapest and truest place-sound in the world.

## 7. POIS & NOTES

| label | pos | prompt | on road |
|---|---|---|---|
| THE BOARDWALK | −212, 56 | WALK THE PLANKS | yes |
| THE PAINTED HUTS | −192, 2 | LOOK IN A WINDOW | no |
| THE CUT | −228, −46 | READ THE CHISEL MARKS | no |
| THE HOLDFAST | −238, −78 | STAND AT THE POINT | no |
| SHELTER COVE | −212, −134 | — | no |
| THE RIVER MOUTH | −203, 204 | WATCH THE INK GO OUT | near the bridge |
| A BOAT, RESTING | −230, 108 | — | no |

## 8. PERFORMANCE BUDGET

Fields (one draw call each): marram ×4, wrack ×3, gulls ×1, shore rock
×2, lobster pots ×1 = 11. One-off standees: 4 huts, boardwalk rail ×4,
boardwalk deck ×6, 9 cut posts, 3 cut walls, 3 sea stacks, cairn,
beached boat ×2, groynes ×5, windsock ≈ 38. Total ≈ 50 draws — well
under THE COMMON's 280. Textures: 15 new drawings at ≤ 512×192, one
canvas each, disposed with the group.

## 9. NEW ENGINE NEEDS

None. `ctx.standee` / `ctx.decal` / `ctx.field` already stand
everything on the height field, and `lieOnGround` already lays the deck
decals along the ledge and the dune. The only shared need is with THE
WIDE BLUE: both lands want `Audio.surge()` and `Audio.glide()`, which
are instruments, not scores.
