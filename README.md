# INKLANDS

*A world in one sheet — twelve lands, one pen.*

**Walk it: [adventure.ryankm.com](https://adventure.ryankm.com)**

An open-world adventure drawn entirely in procedural ballpoint, built on
the engine from [margins](https://github.com/uxpreview/margins). The
whole world is a single enormous page lying on a desk: the sea runs off
the torn west edge, and past every margin lies the next sheet down and
then wood. **There is not one image asset in this repository** — every
tree, tower, cactus and traffic light is drawn onto an offscreen canvas
by a seeded wobbly-stroke library at load, and every word the player
reads is hand-lettered by the same pen.

Sketch-like, but real: under the line work sits a field of muted
watercolor washes — one stain per land, ragged at the borders — with
roads, a river and an animated sea painted into it. The same painted
pixels the shader reads also answer the game: whether you can wade
here, what a footstep sounds like, whether the page takes your ink.

## The twelve lands

| | | |
|---|---|---|
| THE WIDE BLUE | open water | the sandbar, the regatta, the bell buoy |
| LONGSHORE | the coast | the promenade, the painted huts, the cut, the point |
| CASTLE GREYWEATHER | the high seat | the keep, the gatehouse, banner avenue |
| THE KINGDOM OF BRIM | the walled town | cottages, Brim Square, the market |
| THE COMMON | where you woke | the crossroads, the old well, three oaks |
| MAPLE COURT | the neighborhood | porch lights, picket fences, the green |
| THE PENWOOD | under the pines | the tarn, the round, the deep pines |
| SPLITROCK CANYON | the deep cut | the dry channel, the marks, the boat, the lip |
| THE HARROW DOWNS | farm country | the mill, the headland, the ford, the drove |
| THE BLEACH FLATS | the desert | the pan, the track, the oasis, the catch |
| GREYLINE CITY | downtown | hatched towers, lit windows, the Junction |
| THE CUBICLE MILE | the office park | ruled glass, hedges, the 8:15 stop |

The page is torn down the middle of SPLITROCK — nine straight runs with
eight corners, because paper tears along its fibres — and the cut is ten
and a half units deep with walls that refuse you. It has exactly two ways
in and neither of them was designed: a rip is shallow where it starts and
shallow where it runs out, so you walk in at the head or at the mouth,
and the mouth is where the river rises. The walk up SPLITROCK therefore
begins at the exact point the water begins, and goes up the bed the water
is not in.

A river rises in the canyon, crosses the whole sheet and meets the sea
past the boardwalk; three plank bridges carry the roads over it, and one
farm lane simply goes through it at a ford, where the water shallows and
goes light over a gravel bar. On the coast, a strip the wash never took
runs a hundred and eighty units out into the sea — dry paper, so you can
walk it, out past the surf and back ashore at the foot of the cliff
path. And in the pine dark there is a road that goes round.

Every border crossing changes the music's mood, the footstep underfoot,
and deals a region card — nothing else, because the sheet is continuous.

## What's here so far

- **Walking is drawing, and your speed is in the ink.** Footprints are
  ink; wet paper refuses them; damp paper lets them bloom. Run and the
  print presses darker, wider and dragged out along the line of travel;
  walk and it feathers. It is one continuous number — the walk cycle,
  the step and the score all read the same one. Shift on a keyboard;
  on a phone, drag past the ring.
- **The land inks itself in.** Each region's furniture is born as faint
  pencil under-drawing and re-inks in a radial wave from wherever you
  first cross its border.
- **Vistas.** The camera sits low enough that the keep reads from the
  meadow and the city towers from across the downs; the fog is a
  horizon, not a curtain.
- **And it answers where you are going.** Not a free camera — a paper
  cutout seen thirty-five degrees off-axis stops reading as paper, so
  the envelope is authored and hard: the crossing part of your travel
  turns the frame, the toward-the-lens part makes it give ground, and a
  stopped walker is due north to the pixel. Two fingers, or `,` and `.`,
  lean it further, and let go and it comes home.
- **Roads that carry.** The nine authored roads are infrastructure now:
  a little faster along them, and they take a share of the angle off a
  walk that is already going their way. The king's road, main street and
  the commuter spur carry hardest, because they are one road under
  twelve names. Crossing a road costs nothing and walking off one is
  free — it bends you, it never pulls you.
- **The rowboat**, drawn up at the river mouth, and the first mount:
  fast on water, refuses dry land, found in the world and left where you
  leave it. The river crosses the whole sheet and has been a wall its
  whole length except at three bridges; under oar it is the only
  east–west road in the world. She does not go past the shallows —
  the open sea is not a rowboat's business.
- **A day**, forty minutes long. The washes warm, the haze takes the
  hour, Brim's lamps and windows come on, two fires are lit at
  Greyweather's gate, and the horizon goes darker than the page does,
  because the world is a sheet of paper on a desk and at night **the
  desk lamp comes on**.
- **A hand-drawn map** (`M`) that only names the lands you have walked.
- **35 places worth a look**, each with a note in the world's voice.
- **All-procedural audio**: pen-scratch steps in six surface timbres
  (sand, grass, stone, planks, water, paper) and a handful of voices the
  lands own — a lark, a bell, rooks, and, on the coast, surf that comes
  at shorter intervals the nearer you stand to the water.
- **And every land has its own VOICE and its own ROOM.** Five
  synthesised instruments across twelve lands — a music box, a plucked
  string, a bowed voice, struck metal and moving air — and the
  instrument is a thing that is actually there: Brim's is the belfry,
  Greyweather's is wind in a stone building with nobody in it, the
  office park's is two notes of hold music, the coast's is the sea.
  Under each of them a room you notice only when it stops, and a border
  is a three-and-a-half second equal-power crossfade rather than a cut.
  The mix answers how hard you are walking and what time it is: after
  dark the room thins, the phrases come further apart, and every
  instrument's top closes. **Nothing announces a land's voice and
  nothing lists it** — it arrives because you are standing there.
- **A map that is the record of your own walk**, in three hands: a
  question mark for a place you have never heard of, its name in pencil
  for one somebody named to you, its name in ink for one you stood in.
  And if you have walked the king's road, main street and the commuter
  spur end to end, the map stops dashing them and draws one line.
- **A market that opens**, once you have worked out what the belfry
  clock actually says — the first piece of this world that changes
  because of something the walker knows.
- **A table laid for two on the edge of a field.** The second setting is
  put away every evening and laid out again every morning. Sit down
  once and it stays out, at every hour, in every save.
- **A wood with one road in it, and the road is a circle.** Nothing
  anywhere says why. The map draws roads.
- Position, discovered lands, strides walked, the boat, the hour and
  what you know saved to `localStorage`.

The story is **THE 8:15** — see `design/STORY.md` for the bible and
`design/QUESTS.md` for how content is tiered in a game with no quest
log. It is mapped as well as locked: `design/THE-LINE.md` (the four
acts, and the ending), `design/THE-WAITS.md` (twelve lands, twelve
fables, twelve turns) and `design/THE-STRANGERS.md` (the cross-land
tier, and the errand / encounter / unmarked inventories).
`design/INSPIRATION.md` credits everything this project is learning
from, from Calvino to Goat Simulator, and scopes each to the one thing
it contributes. `DIRECTION.md` is the record of how the story was
chosen.

## Run it

```sh
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build in dist/
```

Desktop: WASD or arrows, **hold Shift to run**, `E` to look, **`,` and
`.` to lean the camera**, `M` for the map. Mobile: drag in the lower part
of the screen to steer (the top is the vista and the joystick is kept
off it), **drag further past the ring to run**, **two fingers to lean**,
tap to interact.

The camera answers where you are going, inside an envelope you cannot
leave: the part of your travel that CROSSES the frame turns it (26° on
desktop, 12° on a phone), and the part that comes AT THE LENS makes it
give ground — walking south it trails further back and lowers its aim,
so the road you are walking into is laid out below you instead of
arriving from behind. **Stand still and it is due north, exactly**, which
is the composition every land in this world was drawn for.

Append `?debug` to expose `window.__inklands` (teleport, region query,
terrain probes, frame cost, audio, and the harness clock — `setTime`,
`step`, `setBearing`) for testing.

```sh
node tools/check-terrain.mjs   # assert the height field, off-screen
node tools/check-fields.mjs    # no instanced field is ever half inked in
node tools/check-camera.mjs    # assert the BEARING: the envelope, the
                               #   continuity, the walk home, the walk south
node tools/diff-sheets.mjs     # A REGRESSION IS A DIFF AND NOT AN OPINION
node tools/shoot-bearing.mjs   # the walk south, shot twice: shipped, then now
node tools/shoot-shape.mjs     # every landform, both viewports
node tools/shoot-first-minute.mjs
node tools/shoot-oldworld.mjs
node tools/shoot-coast.mjs      # LONGSHORE + THE WIDE BLUE
node tools/shoot-traversal.mjs # the ink weight, the roads, the boat, the day
node tools/shoot-farm-forest.mjs  # THE HARROW DOWNS + THE PENWOOD
node tools/shoot-dry.mjs       # SPLITROCK CANYON + THE BLEACH FLATS
node tools/shoot-textures.mjs  # THE PROP BOX, at actual size, on paper
node tools/montage.mjs DIR OUT.png a.png b.png …   # a land on one sheet
HOUR=19.6 node tools/shoot-first-minute.mjs   # any sheet, at any hour
node tools/shoot.mjs           # all twelve lands, walkability smoke test
node tools/shoot-mobile.mjs    # the CHROME, at 320/360/390/430 points
node tools/shoot-fps.mjs       # frame cost, draw calls, triangles

node tools/check-audio.mjs     # RENDER THE SCORE OFFLINE AND ASSERT IT
node tools/verify-score.mjs    # the same score, wired, in the running game
node tools/shoot-sound.mjs     # the sound sheet: twelve lands, plotted in ink
node tools/render-wavs.mjs     # nineteen WAVs, for the one gate a tool cannot run
```

`design/specs/camera.md` is the camera written up — the two components,
the envelope's arithmetic, the walk south in units of page, every
second-order effect checked, and the harness clock.

**A regression used to mean a person looking at two contact sheets a
week apart**, and it was never a claim anybody could check: two shots of
one framing in this project were never the same picture. Five clocks
move between two shutter presses and every one of them is in every pixel
— the paper pass's grain and its hand-drawn wobble (a one-pixel random
resample of every ink edge, re-seeded three times a second), the standee
wind, the ink-in cascade at 34 units a second, the walker's own quiet
breath (a third of a pixel, and exactly enough to redraw an outline) and
the water. The last two were found BY the diff and by nothing else.
Since Session 9 the harness pins all five and steps the
world in GAME seconds instead of waiting in milliseconds, so twelve
seconds of settle costs a third of a second instead of seventy and two
runs of a framing come back **bit-identical**. `diff-sheets.mjs` builds
a base git ref and the working tree, shoots the framings that carry the
verdicts through the same protocol on both, and counts the pixels that
moved — separating THE PAGE, which may not move at all, from THE WRITING
OVER IT, which moves when a label is deliberately re-placed.

**The score is the first thing in this project that cannot be
screenshotted**, so it is measured instead: `check-audio.mjs` renders
every land through an `OfflineAudioContext` and asserts that twelve
lands are twelve sounds, that a border never leaves its equal-power
curve, that the mix is monotone in the hour and in the walk, and that
nothing clips. `shoot-sound.mjs` draws the result with the same
ballpoint everything else in this world is drawn with. And
`render-wavs.mjs` exists because **a session that claims a sound is
good is lying, and a session that hands over the evidence is not.**

Every shoot script renders **desktop (1280×720) and portrait (390×844)**
through `tools/shoot-lib.mjs`; portrait is a gated viewport, not a
courtesy check. Since Session 6 every protected framing is also judged
at **two hours of the day** (`HOUR=`), because the day cycle is not done
until dusk is as good as noon.

## How it's made

Ported whole from margins: the ink library (`src/engine/ink.ts`), paper
grain, hand-lettering and handwriting synthesis, footprints, the walk
cycle, the paper post-pass, the audio engine. New for the open world:

- `src/world/layout.ts` — the twelve rects, roads, river, bridges;
  the one authored truth the terrain, map and audio all read.
- `src/world/elevation.ts` — **the shape of the page.** The world is a
  sheet of paper on a desk, and paper is flat but not rigid: it creases
  (one fold, north to south, that the east road dives through), curls at
  its margins, buckles where the wash went on wet, tears (SPLITROCK),
  rides over what is under it (Castle Greyweather's ridge), and on the
  west coast its wet margin tore away in two bites around one tongue of
  fibre that held — THE HOLDFAST, which a ledge somebody chiselled is
  the only way onto. One height grid; the mesh, the shading, the walker,
  every prop and all collision read it and nothing else invents a
  height. Steep is impassable, which is free traversal gating.
- `src/world/terrain.ts` — the whole world as one sheet: wash field
  painted at load (1 texel per world unit), domain-warped borders,
  animated water, the displaced mesh, and the shading that DRAWS the
  page's shape rather than rendering it — tone where the page leans out
  of the light, ink pooled down the bottom of a crease, pen hatching
  down the fall line of anything that is genuinely a cliff. Plus CPU
  queries for collision, step timbre and height.
- `src/world/daylight.ts` — **what time it is.** One clock, module
  scope, readable by anything (`import { clock }`) — the story runs on
  routine, so a region builder that wants to know whether the shutters
  are open asks in one import. A day is forty minutes. The hour never
  touches the wash field: it grades the finished frame once, in the
  paper post-pass, and sets the colour of the haze. Eight in the morning
  to four in the afternoon is bit-for-bit the shipped page.
- `src/world/regions/` — a builder per land placing instanced standee
  fields and one-off drawings; streaming keeps first-visit cost off
  the walk. It also keeps **the skyline**: every stand-up records its
  top into a four-unit grid as it is built, which is how a place's name
  knows to be written above the thing it names rather than across it.
- `src/world/textures.ts` — the prop box: forty-odd seeded drawings,
  ink outline over a light wash stain. `textures-common.ts`,
  `textures-oldworld.ts` and `textures-coast.ts` add a box per session,
  each with its own stated ink technique.
- `src/core/App.ts` — the loop, and **the camera**, which is a designed
  system rather than a pile of constants: the resting framing, the rise
  terms that reveal a landform by RETREATING instead of pitching the
  walker out of frame, and since Session 9 the bearing — a yaw off the
  crossing part of your travel, an astern opening off the part that
  comes at the lens, both zero when you stand still.
