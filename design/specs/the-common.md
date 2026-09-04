# THE COMMON — land spec

*Session 2. Rect `{-150..60, -10..120}` (210×130), wash `WASH.meadow`,
step `grass`, mood `meadow`. The spawn land: the first thirty seconds of
every playthrough happen inside this rectangle, and the title screen is
a photograph of it. It is allowed to be the plainest page in the book —
it is not allowed to be an unconsidered one.*

## 1. THE SHOT

Standing on the king's road three strides south of the crossroads
(≈ −45, 66), facing north — which is exactly where the title camera
stands, so THE SHOT and the poster are the same composition:

- **Foreground:** cart-ruts in the road, trodden ground at the
  junction, wind-leaned grass tufts at both road edges. The walker
  stands at the crossroads in the lower third.
- **Subject:** the signpost and the old well cluster left of the road;
  the king's road runs straight up the frame between hedgerow
  shoulders and through the south gate of Brim.
- **Far silhouette:** the town wall of Brim bands the frame in the
  haze — gatehouse over the road, drum towers flanking, town rooflines
  and the belfry stacked behind the battlements — and above them,
  palest of all, the keep of Greyweather ghosts in the fog.
- **Accent color:** the red gate banner over the arch, echoed low by a
  drift of rust-red poppies at the well.
- **Moving:** the gate pennants, the grass leaning in the wind, two
  swallows looping the field.

The whole land is staged around this north sightline. Nothing may
stand inside the road's view-corridor between crossroads and gate.

## 2. PLACES

Six named places, three of them on the land's borders (the seams are
art):

| place | center | r | purpose |
|---|---|---|---|
| THE CROSSROADS | −45, 58 | 7 | spawn; the signpost that names the world; every road leaves from here |
| THE OLD WELL | −57, 45 | 6 | first landmark off the road; the accent-color drift; the first note worth reading |
| THE ARGUING OAKS | −98, 26 | 13 | destination walk W-NW; three old oaks, a rope swing, shade void |
| THE GATE FIELDS | −45, 12 | 11 | the approach seam to Brim: hedgerows funnel the road, ruts deepen, the wall fills the sky |
| THE LONG FENCE | 10, 62 | 10 | the east road seam: fence line with a stile, hay cart and bales, the downs implied beyond |
| RIVERBEND | 44, 102 | 8 | SE corner where the river clips the land: reeds, a quiet place to stand |

```
z=-10 ═════════╦═[GATE]═╦═══════════ wall of BRIM (kingdom side)
               ║ hedge ▒▒║hedge
     (void:    ║  GATE  ║              (void: open grass,
      open     ║ FIELDS ║               thins to nothing)
      west     ║  ruts  ║
      run)     ║        ║         LONG FENCE
  OAKS         ║        ║       ┌x─x─x┬x─x…      river
 (o)(o)        ║        ║       │stile │hay      ~ ~
   (o)~swing   ╚═WELL═╗ ║       └──────┘      ~ RIVERBEND
               poppies╚═╬══════════════════════ east road →
        ← coast road ═══╬═ CROSSROADS (spawn ✳)
z=120 ── Maple Court ───║── king's road south ↓
```

Deliberate voids: (a) the west run −150..−115 — open grass, one
milestone as the walk's midpoint, nothing else; (b) the shade circle
under the oaks — bare worn earth, no tufts; (c) the road view-corridor
to the gate.

## 3. COMPOSITION PLAN

- **Clusters, not coverage.** All grass/flower placement goes through a
  cluster scatter: 10–16 cluster hearts, 8–24 tufts each, radius 4–9
  with jitter; single strays fill between at 1/6 density. Density
  gradient: heaviest along the fence line and south of the oaks,
  thinnest at the west void and inside places' worn floors.
- **One species per drift.** Flowers come in three species; each drift
  is one species only (poppies at the well, oxeye along the coast
  road, buttercups by the fence). No mixed confetti.
- **Occlusion layers.** Every framing gets near/mid/far: tall-grass
  seedheads scatter as a near layer at road edges; oaks and hedgerows
  are mid; the wall+roofline+keep stack is far.
- **Worn ground.** Every place stands on a trodden-earth decal; ruts
  run the last 25 units of the king's road to the gate; a foot-path
  scuff line links crossroads → well.
- **Edges decay.** Fence line loses rails toward its east end; hedgerow
  breaks into bushes then singles; the west void's last grass cluster
  trails off into strays.
- **CUT from the draft:** the five floating loop decals (one survives,
  deliberately, at the spawn ring — the pen's warm-up); the three
  identical fences in a row; the even-scatter grass/flowers/bushes; the
  three same-drawing oaks.

## 4. INK TECHNIQUE

Signature: **the lean and the wear** — every blade of the Common leans
with the sea wind (drawn lean + shader sway), and every place is a
patch the feet have polished. Distance is drawn as failing pressure:
the wall band draws lighter than the meadow line work, the roofline
lighter than the wall, the keep in pencil-pale line only.

| texture | canvas | variants | primitives |
|---|---|---|---|
| grassTuft (leaning) | 96×64 | 6 | stroke tufts, shared lean direction, per-seed lean amount |
| tallGrass seedheads | 96×96 | 3 | stroke stems + tick heads |
| meadowFlowers (per species) | 96×72 | 3 species × 2 | stroke stems, ellipse petals; species color fixed |
| commonOak (named forms) | 256×288 | 3 forms | fillBlob canopy stain, scribbled masses, hatch shade side, root flare — broad / leaning / split-trunk |
| wornGround decal | 192×192 | 3 | stipple dots, broken contour, flattened ticks |
| wheelRuts decal | 256×128 | 2 | twin broken lines + splash strokes |
| commonWell | 192×240 | 1 | stone courses, roof shakes, rope+bucket, trough |
| crossroadsSign | 192×224 | 1 | 4 arms, hand-lettered BRIM/SEA/DOWNS/HOME |
| milestone | 64×80 | 2 | half-buried stone, hatched base |
| hayCart / hayBale | 224×160 | 1+2 | wheel scribbles, plank lines, straw ticks |
| hedgerow | 256×112 | 3 | long blob mass, scribble crowns, gap variant |
| fence w/ stile & gaps | 256×96 | 4 | posts+rails, one broken, one stile |
| leafLitter decal | 160×96 | 2 | scattered tick-leaves |
| reeds | 128×128 | 2 | tall strokes + cattail heads |
| ropeSwing | 64×128 | 1 | two ropes + plank seat (pivot at top for sway) |
| swallow | 96×48 | 2 | two-arc bird, small |
| brimWall (south face) | 512×192 | 4 | battlement variance, masonry, stain hatch, ivy patch |
| wallTower drum | 224×288 | 2 | round tower, cap, arrow slits |
| gatePennant | 48×96 | 2 | triangle flags, red accent |
| roofline silhouettes | 512×160 | 3 | gable rows + chimneys, pale line |
| belfry | 128×256 | 1 | tower + bell arch, pale line |
| keepVista | 384×256 | 1 | PENCIL-pale keep silhouette, no interior detail |

Repeated silhouettes rule: any field with >8 instances on screen uses
≥3 texture variants; the oaks are three different drawings.

## 5. MOTION & LIFE

- **Idle 1 — the wind (shader):** StandeeField gains a wind sway
  (per-instance phase, amplitude scaled by quad height). Grass,
  seedheads, flowers, reeds all breathe with it.
- **Idle 2 — the swallows (per-frame):** two swallow standees loop
  crossing ellipses over the field between oaks and crossroads.
- **Idle 3 — the swing & pennants (per-frame):** the rope swing
  pendulums gently; the gate pennants flutter (scale-x wobble).
- **Player-responsive — the grass parts (shader):** field instances
  within ~1.7 units of the walker bend away, radius falloff, top-only.
- The keep vista fades as the walker nears the wall (false perspective
  must never be caught working), gone by z < 10.

## 6. SOUND

- Mood: `meadow` stays as is (brightest scale in the game).
- Steps: `grass` zone (already wired via layout).
- Ambient events (new, wired in App's region ambience):
  - `lark` — every 9–22 s in the Common: three quick high chirps,
    reusing the tone vocabulary, pitch-jittered.
  - `well-plink` — within 8 units of the well: an occasional deep
    water plink (low knock + dropping tone), the well's one joke.

## 7. POIS & NOTES

| label | pos | prompt | road? |
|---|---|---|---|
| THE CROSSROADS | −42, 52 | READ THE SIGNPOST | on |
| THE OLD WELL | −57, 45 | LOOK DOWN THE WELL | off |
| THE ARGUING OAKS | −98, 26 | SIT IN THE SWING | off |
| THE LONG FENCE | 12, 63 | LEAN ON THE STILE | on |
| RIVERBEND | 44, 102 | WATCH THE WATER | off |

Existing crossroads/well note bodies stay; oaks, stile and riverbend
gain bodies in the wry voice. Note ids = labels (Save keys off label).

## 8. PERFORMANCE BUDGET

- Fields: grass 6 variants ≈ 300 instances total, tallgrass 3 × 60,
  flowers 6 × ~90, leaf/reed small — ≈ 16 field draw calls (each one
  instanced call). Unique standees ≈ 30, decals ≈ 20. Well under the
  scatter draft's per-quad cost since draws stay instanced.
- Texture memory: ≈ 30 small canvases ≤ 512×288 ≈ well under 8 MB.
- Build at stream-in: one pass, canvas drawing only, measured target
  < 16 ms on desktop (one frame; the loader covers spawn's build).
- Dispose: all via disposeGroup + field.dispose (unchanged paths).
- The wind/bend shader adds 2 uniforms + ~6 ALU in the vertex stage —
  no fragment cost; mobile-safe.

## 9. NEW ENGINE NEEDS

1. **StandeeField wind + player-bend** (`wind?: {amp, freq}` opt,
   `setPlayer(x,z)`): generic — every later land's fields want it
   (wheat, palms, hedges). Vertex-stage only.
2. **Region update signature gains player position** `(dt, t, x, z)` —
   needed by any land that stages false-perspective vistas or
   proximity motion. One-line World.tick change.
3. **Ambient event ticker in App** keyed by region id — Session 8 will
   generalize it into the score; the Common just needs its lark.


---

## Session 15 addendum — the Common as the plateau begins (2026-09-02)

`THE-FUN-PASS` §11 chose THE COMMON AS THE PLATEAU for Session 16: one
of everything, before the world opens. Session 15 put the first three
of everything in it, as the proofs of the verbs it built.

- **THE OLD WELL is a touch.** The prompt says SHOUT DOWN THE WELL and
  the note is gone — it was a description of a toy, and the toy is
  here now. Shout, and three and a half seconds later (too long, on
  purpose: `THE-STRANGERS` U7) the well answers, thinner and lower, and
  a drop reaches the water after it. **And the answer is seen:** the
  bucket, its own drawing on its own rope since the owner tapped the
  prompt on a phone and got a sound they could not hear, drops into the
  shaft at the shout and winds back up, swinging, when the well
  answers. The walker rocks back at the press and the swallows lift
  twice. At rest the well is the drawing it was. Repeatable: it is the
  first entry in the local-rule register (`QUESTS` §8, L1). Its reach
  shrank from five units to three and a half — the lip, not the yard —
  so a stone can be thrown into it from the path.
- **THE HAY CART can be pushed** (L2). PUSH THE CART at its side and it
  rolls away from you, about five and a half units, slowing; it refuses
  the river and the steep; **it stops two units inside the Common's
  edge and stays there**, in every later save (`src/world/things.ts`,
  `save.things`). It is drawn where the registry says, by this land's
  own update. **Nell's wait** (`THE-WAITS` §9) and Session 16's opening
  both stand on it.
- **A STONE between the stile and the cart** at (18.5, 70.5), the size
  of a fist — outside every other place's reach, because a thing in
  reach beats the thing in the hand and a carriable that lives inside a
  note's reach cannot be thrown from where you pick it up. PICK
  UP THE STONE and it is in the walker's hand, drawn there; THROW it
  (or PUT IT DOWN, standing still) and it goes underarm, a stride to
  six units, and lands with a knock on the page or a plop in the
  river. Down the well it is gone, the well answers later still, and
  **at first light it is back by the gate**: `the-common-morning`, the
  Common's own scheduled event (`events.ts`), puts back anything the
  walker lost. Nothing says who.
- **THE SWING is a sit.** SIT IN THE SWING has been the oaks' prompt
  since Session 2 and it opened a note; it sits you in the swing now.
  The oaks' note moved six units west, to (−101, 25), under TAKE A
  SIDE.

**What moved, measured.** None of the four is inside a protected
framing at rest: the cart at (20, 76.5) is sixty-five units east of THE
SHOT and behind it; the stone is six units from the cart; the well's
drawing did not move and its label did not either. `diff-sheets`
reports the Common's seven framings in its own log entry (SESSIONS.md,
Session 15). The one deliberate change in the WRITING pass is THE
ARGUING OAKS' label, re-placed six units west.

**Not this session's:** the bull, the four lures, the goat, Nell's
straightening, the cart getting away (Session 16). The Common's
districts (16).


---

## Session 16 addendum — THE FIRST HOUR (2026-09-03)

The opening the owner chose (`THE-FUN-PASS` §11): THE BULL + THE FOUR
LURES + THE COMMON AS THE PLATEAU. The Common is the land re-opened
hardest in the fun pass, and this is what changed in it.

**The spawn moved and the poster did not.** `layout.POSTER` (−45, 58)
is where the title camera stands on a fresh page — THE SHOT, to the
unit. `layout.SPAWN` (24, 90) is where SET OUT puts you: in the wheat at
the east end of the field beyond the long fence, with a bull at
fourteen units. The cut between them is a blink of paper.

**THE BULL.** The Common's first creature (§3 item 1). It grazes at
(33, 80); it looks up when you are within twenty-six units in its
field; it charges a second later, or the moment you move; it runs at
8.4 units a second against your 6.15 and **pulls up two strides short,
every time**, and snorts, and comes again — three times, then it loses
interest. It is drawn in the field's ink (`FIELD` in `meadow.ts`) and
clamped to it before it moves, so at the hedge it stops dead, whatever
you do. No fail state, no timer, no villain: fear is a sound (the
snort, the hooves on its stride), a distance (two strides), and a thing
that moved.

**THE CHASE RUNS EAST TO WEST, and the reason is the camera.** The
camera only looks north; a bull chasing you north is behind the lens
the whole way and its stop at the rails happens at your back. A chase
that crosses the frame is seen. So the field gate is in the field's
**west hedge** at (−12, 82), not in the long fence, and the run is from
the wheat to the gate with the bull on your right the whole way and at
the hedge, in frame, once you are through. The long fence keeps its
stile and its old gate stays shut in the drawing.

**THE FENCE IS A RULE FOR THE WALKER** (`src/world/barriers.ts`). For
fourteen sessions a fence was a drawing you could walk through. The
long fence and the hedge return refuse a foot now, everywhere but the
stile and the gate, and the gate shuts. Every barrier is a drawing
standing in the same place: there are no invisible walls, and a land
that registers one without drawing it has broken the file's rule.

**NELL, at the gate, in three drawings** (`THE-WAITS` §9, and
`critique-story-2`'s note that her straighten needs two or three
signals). Leaning on the gate; straight; reaching for the leaf. She
straightens when somebody comes up to the gate and settles when they
are not who it is; **she slams the gate when the bull comes at it**,
once the walker is through — the first thing anybody in this world has
done on purpose in front of them; and when the cart moves she stands,
steps off the post, and faces wherever it went, from then on. Three
signals: the posture, the half-unit off the post, and which way her
feet point.

**HER WAIT, WITH TWO DOORS.** Without the fourth name the gate is a note
in the plainest register in the game. With `fact:the-timetable` the
prompt is TELL HER THE FOURTH NAME and a card is offered, once: TELL
HER THE FOURTH NAME (`door:the-cart-turned-north` — the cart is loaded,
roped, turned north at its home, drawn from behind, and never pushed
again; `WAIT_ANSWERS.meadow`; her platform has somebody on it) or KEEP
IT, AND PUSH THE CART YOURSELF (`door:the-cart-pushed` — nothing
happens to the cart but what you do to it; it stops at any border; she
does not follow it, and she has stopped watching the road).
`WAITS_FOR_THE_LINE` is six.

**THE FOUR LURES.** The keep vista was one. The other three are built
the same way — false perspective, `fog = false`, pencil-pale, fading on
the keep's own law — and placed where the frame can hold them rather
than at true bearings: the sea's glint at (−92, −44), hung seven up,
above the oaks; the mill's smoke at (0, −44), the mill itself behind
Brim's wall and only its plume showing; the city's towers at (28, −70),
faintest, to the right of the smoke, **which is the one lie** — the
city is south-east, and the towers are drawn north-east because the
city is further off than the mill and reached past it. The map tells
the truth. Measured (`tools/check-lures.mjs`): desktop holds all four
at rest; **portrait holds the keep at rest, the sea and the smoke on a
full peek, and never the towers.** Said, as the brief asked.

**THE GOAT** (`src/world/company.ts`, the co-walker as a rule of the
world). Drawn in the Common's ink with the Penwood's four postures, at
(−22, 72) on the way from the gate to the crossroads. It notices you at
eighteen units, follows at three and a bit, trots when left behind,
and **stops two units inside the Common's rect on every road**, stands
looking after you, and stays until you come back. It bleats when it
falls in and when the border takes you.

**DISTRICTS** (`layout.DISTRICTS`, the layer built generally and
populated here only): THE CROSSROADS, THE WELL, THE FAIR GROUND (new),
THE RIVER BEND. A crossing between two deals a smaller card — the
land's name over the district's — and the map draws them dashed inside
a land you have stood in.

**THE FAIR GROUND** is the plateau's absurdity (§3 item 2), played
straight: a ring in the grass where the roundabout goes, a maypole
nobody has taken down, and a board that says THE FAIR and, under it,
NEXT, with several dates rubbed out beneath.

**What moved, measured.** The lures stand in every north-facing framing
of the Common: `common-wide`, `common-THE-SHOT`, `crossroads`,
`gate-fields` and the title poster all gained pencil at their edges.
The spawn's own frames are new. `diff-sheets` reports the numbers in
Session 16's log entry, and `critique-art-10.md` re-earns the verdict
on the new frame under `QUALITY-BAR` §3's permission to regress.

**The plateau, counted against §3's seven:** a creature (the bull); an
absurdity (the fair ground); a toy (the well, the cart, the stone, the
swing — Session 15's); a choice with two doors (Nell's); motion (the
swallows, the swing, the pennants, the wind, the bull, the goat, Nell,
the smoke, the maypole — nine idle and five responsive); districts
(four); nothing empty for fifteen seconds — **not measured; Session
18's tool.** And a tone: WAITS & THE UNSEEN, frightening — for exactly
ten seconds, and then it is the plainest land in the game again.

**Not this session's:** THE-STRANGERS' *the Common hosts no stranger,
on purpose* stands; the prompt's *one stranger's opening beat* is
declined for that reason, and the plateau's *one stranger* is Nell.
Life in the other eleven lands (17). Districts elsewhere (18).


---

## Session 17 addendum — LIFE (2026-09-04)

The Common was the model land — the one with all seven of §3's things
— and this session gave every land what it had, so what it gained is
the same multipliers everybody gained, at the Common's own scale.

**The unnamed** (`events.ts` routines, drawn by `life.ts`): the three
arguing under the oaks at ten and at four, and whoever has the floor is
a stride nearer the swing than the other two — sit in the swing and the
argument goes by (`QUESTS` §8 L5, owed from 16); the fisher at the bend
before seven; water drawn at the well at nine; the cart down from
Brim's gate to the well and back at a quarter to eight; two children
running the fair ground's ring after three. Nobody argues in the rain.

**The night**: `the-bull-lies-down` at 20.0 for 9.6 hours — the one
register call Session 15 said it was — and a seventh bull state,
`lying`, drawn as a mass with no legs. It gets up for a walker inside
twelve units and at dawn. A fox on a round from the fair ground to the
well and back from nine, which stops when it sees you and is gone; two
bats over the well at dusk.

**The weather, and the lures.** Fog closes the vistas and the four
lures go with it: their opacity and the keep's take `(1 − fog)(1 −
0.35 rain)` from `weather.state`. In a fog the signpost points at
nothing you can see, which is the correct picture of a fog and the
reason day zero has none: the first hour depends on the lures, so the
shipped day is calm at noon and at 19.6 with one shower at 14.2. The
mill's smoke leans on the wind.

**What moved, measured.** `diff-sheets` reports the Common's seven
framings in Session 17's log entry. At noon and at 19.6 on day zero the
weather is calm by law and no routine stands in the seven; the bull is
grazing at both hours and lying at neither.
