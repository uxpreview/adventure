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
| MAPLE COURT | the neighborhood | the court and its one lit porch, the three chairs, the green, the end of the survey |
| THE PENWOOD | under the pines | the tarn, the round, the deep pines |
| SPLITROCK CANYON | the deep cut | the mouth, the Needle Arch, the marks on the wall |
| THE HARROW DOWNS | farm country | the mill, the headland, the ford, the drove |
| THE BLEACH FLATS | the desert | the Hands, the Pale, the track, the oasis |
| GREYLINE CITY | downtown | the junction, the worn pavement, the hollow, the north end |
| THE CUBICLE MILE | the office park | the barrier, the 8:15 stop, the atrium, the overflow, the car park at the end of the line, the muster point |

A river rises at the mouth of the canyon, crosses the whole sheet and
meets the sea past the boardwalk; three plank bridges carry the roads
over it, and one farm lane simply goes through it at a ford, where the
water shallows and goes light over a gravel bar. On the coast, a strip
the wash never took runs a hundred and eighty units out into the sea —
dry paper, so you can walk it, out past the surf and back ashore at the
foot of the cliff path. In the pine dark there is a road that goes
round. And in the canyon there is a road that is a riverbed: the only
way in is round the top of the water, and then a hundred and twelve
units north along the floor of the tear, ending at a wall.

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
- **The 8:15.** There is a stop in the office park with a timetable on
  it and no track, and the timetable has twelve names on it in order.
  Walk the whole road it names — the castle gate to the car park, and
  you will be the only thing in this world that ever has — and the next
  quarter past eight in the morning, something comes down it. It stops
  twelve times. At the far end it stands in a car park, which is where
  the line ends, and nobody who parks there has ever thought of it that
  way. You can get on. Getting on is not an ending.
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
- **And the walker can touch things now** (Session 15, the first of the
  fun pass). One key — the one that looks — and what it does depends on
  what is in reach: **shout down the well** and it answers, on a delay
  that is too long; **push the hay cart** and it rolls, and stops at the
  Common's edge, and is there tomorrow; pick up a stone and **throw
  it**, underarm, into the river or down the well; **sit** in the swing
  or at Joan's table and the day goes by while you watch, and the
  camera does not move. No inventory: one thing in the hand, drawn
  there. And the first **choice card**: set your shoulder to the
  toppled king at Greyweather and a hand-lettered card offers two
  doors. Put him back, and the banners come down, the avenue goes
  quiet and the moat pool clears, in every later save. Leave him, and
  nothing changes. Nothing says which was right.
- **And you wake in long grass with a bull looking at you** (Session
  16, THE FIRST HOUR). It charges; you run — the one hint the game
  prints prints now, because now is when you need it — and it pulls up
  two strides short every time and never touches you; you get through
  the gate in the hedge and **Nell shuts it behind you**, and the bull
  stops at the hedge because the hedge is a rule. From the crossroads
  four things are on the horizon: the castle, the mill's smoke, the
  glint of the sea and the city's towers, and the signpost points at
  three of them. **A goat falls in beside you and stops dead at the
  Common's edge**, on whichever road you take, which is the rule of
  this world shown before it is ever read. The Common has four named
  **districts** now and a fair ground where the fair is not on; a fence
  refuses a foot for the first time; and Nell's wait is built with two
  doors: bring her the fourth name, or keep it and push the cart to a
  border yourself.
- **And the world keeps its own hours.** The thirteen sheep in the
  Downs walk the lane from the fold to the field at first light and
  back at dusk, whether or not anybody is there to see it — the first
  scheduled event, and the plumbing for one in every land.
- **And the world is alive in every land now** (Session 17, LIFE — the
  four multipliers of `THE-FUN-PASS` §9). **Sixty-three unnamed
  inhabitants with routines**, on `events.ts`, every one of them
  somewhere at a given hour and indoors otherwise: a lamplighter who
  does Brim's four lamps in order at dusk and puts them out at dawn,
  and each lamp comes on as he reaches it; shutters that go over row by
  row at nine; a delivery that finds the stall shut; a car in Maple
  Court that backs out at ten past eight, drives to the end of the
  survey because there is nowhere else a car in this world can go, and
  comes back at ten to six; the nine o'clock in the Cubicle Mile, from
  three cars to one door; a sentry on Greyweather's wall; cutters in the
  Penwood who never go inside the forty; and three people arguing under
  the oaks while you sit in the swing. Brim's lamps, the shelter's
  light, Amos's night walk and Joan's working day moved onto the clock
  with them. **The animals**: a dog at the Downs' field gate that falls
  in beside you and stops dead at the Downs' edge on every road — the
  second co-walker, and the one that teaches the rule; a herd of cows
  that parts; a heron at the tarn that goes up when you come; seals on
  the sandbar that slip in; seven pigeons in Greyline that lift as one;
  crabs on the wrack that go sideways; a cat on Brim's wall and another
  on Val's fence that sit up if you RUN past; three rooks that roost on
  the keep and spend the day on a scarecrow in the Downs — birds cross
  borders and nobody looks up, and it is recorded so nobody fixes it;
  and after dark a fox on the Common, a fox across the car park, bats
  over the well, the moat pool, the slot and the deep pines, and
  **something under the Wide Blue that surfaces once at dusk.** **The
  weather**: one clock like the day, a pure function of the day and the
  hour, so a shower falling for ten minutes when you arrive has been
  falling for ten minutes — rain that runs the drawing (the ink bleeds
  down the page), wind that leans every field harder and actually turns
  the mill, fog that closes the vistas and the four lures with them, and
  a storm once in a while at night with the whole frame flashing and
  the thunder a second behind. Day zero is the shipped page: calm at
  noon and at dusk, one shower in the afternoon; day one has a fog at
  first light and the first storm. **And night is a different game**:
  the bull lies down at dusk and gets up if you come within twelve
  units; in the deep pines after dark the pine-tick stops and nothing
  fires but the bed and, once in a long while, a branch a long way off;
  Holt's window is a light you can steer by. `?hour=19.4`, `?day=1` and
  `?weather=storm` on the address bar set the page up before the title.
- **And the roads are not a chore, or the tool says which one still
  is** (Session 18, THE ROADS — `THE-FUN-PASS` §8). **The
  fifteen-second rule is measured**: `tools/check-roads.mjs` walks
  every road at a walk on both rigs and fails on fifteen seconds with
  nothing in frame and nothing in earshot, and `src/world/earshot.ts`
  is the placed voices as data so the tool and the ambient agree on a
  number. **Fifteen encounters** from `THE-STRANGERS` Part Three, every
  one a routine with a turn on the clock: a broken cart on the king's
  road that is mended by three, a dog that falls in at dawn for half a
  land, a ladder carried round the well, a hat going the other way
  faster than you, combers at low water, a fire on the sand with nobody
  at it yet, a light in Shelter Cove that is not the mark, a gull on the
  crest you go round, a felled pine with the saw in it, rings on the
  tarn at dusk, a funeral up the mill lane, a flock that parts round you
  and closes behind, an oasis that is not there, a car with its lights
  on. **Forty-five districts** across all twelve lands, on the card and
  the map. **THE BICYCLE** on the verge at the mouth of Maple Court:
  get on, ring the bell on the move (the cat sits up, the children stop
  and look), fast downhill, and it stops dead at the Common's edge with
  you on it, because it is a thing and no thing crosses a border.
  **THE PAPER PLANE** on the overlook's rock in Splitrock: thrown off
  the lip it glides the whole cut and lands on the far rim, which is
  about an hour. **And after the ending the 8:15 runs every day at
  8:15** and stops twelve times for nobody, and you can get on.
- Position, discovered lands, strides walked, the boat, the bicycle,
  the hour, what you know, what you chose, and where you left the
  cart, saved to `localStorage`. (The gate, the bull and the goat are not: a fresh
  page has the gate open, and a save that wakes elsewhere finds the
  bull grazing.)

The story is **THE 8:15** — see `design/STORY.md` for the bible and
`design/QUESTS.md` for how content is tiered in a game with no quest
log. It is mapped as well as locked: `design/THE-LINE.md` (the four
acts, and the ending), `design/THE-WAITS.md` (twelve lands, twelve
fables, twelve turns) and `design/THE-STRANGERS.md` (the cross-land
tier, and the errand / encounter / unmarked inventories).
`design/INSPIRATION.md` credits everything this project is learning
from, from Calvino to Goat Simulator, and scopes each to the one thing
it contributes. `DIRECTION.md` is the record of how the story was
chosen. **`design/THE-FUN-PASS.md` is what comes next**: the owner's
brief after playing all twelve lands, five laws amended, a second bar
for what a land has to play like, a wider cast, a new opening, and the
ladder from Session 15 on.

## Run it

```sh
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build in dist/
```

Desktop: WASD or arrows, **hold Shift to run**, `E` to look — and to
touch, pick up, throw and sit, whichever the prompt says — **`,` and
`.` to lean the camera**, `M` for the map, `1` `2` `3` on a choice card. Mobile: drag in the lower part
of the screen to steer (the top is the vista and the joystick is kept
off it), **drag further past the ring to run**, **two fingers to lean**,
tap to interact.

The camera answers where you are going, inside an envelope you cannot
leave: the part that comes AT THE LENS makes it give ground — walking
south it trails further back and lowers its aim, so the road you are
walking into is laid out below you instead of arriving from behind.
**Stand still and it is due north, exactly**, which is the composition
every land in this world was drawn for.

**AND WALKING NEVER TURNS THE FRAME** (Session 12). It used to: the
crossing part of your travel leaned the camera up to 26°, and the owner
played it and it made them sick — 51° of swing at 35°/s for one change
of mind about which way to walk. That envelope is still 26° on desktop
and 12° on a phone, and it belongs to **the peek** now: hold `,` or `.`
(two fingers on a phone) and the world turns, and it springs back when
you let go. **Rotation in this game is a thing you ask for.** The lean
went to the walker instead, who leans into a crossing at a run.

Append `?debug` to expose `window.__inklands` (teleport, region query,
terrain probes, frame cost, audio, and the harness clock — `setTime`,
`step`, `setBearing`) for testing.

```sh
node tools/check-terrain.mjs   # assert the height field, off-screen
node tools/check-camera.mjs    # assert the BEARING: the envelope, the walk
                               #   home, the walk south — AND THE RATE, in
                               #   degrees a second, which is what nobody
                               #   asserted until a player felt it
node tools/diff-sheets.mjs     # A REGRESSION IS A DIFF AND NOT AN OPINION
node tools/shoot-bearing.mjs   # the walk south, shot twice: shipped, then now
node tools/shoot-shape.mjs     # every landform, both viewports
node tools/shoot-first-minute.mjs
node tools/shoot-oldworld.mjs
node tools/shoot-coast.mjs      # LONGSHORE + THE WIDE BLUE
node tools/shoot-traversal.mjs # the ink weight, the roads, the boat, the day
node tools/shoot-farm-forest.mjs # THE HARROW DOWNS + THE PENWOOD
node tools/shoot-dry-lands.mjs  # SPLITROCK CANYON + THE BLEACH FLATS
node tools/shoot-now.mjs       # MAPLE COURT + GREYLINE CITY (ONLY=… for one)
node tools/check-sightline.mjs # THE LINE'S CORRIDOR: nothing tall within eight
                               #   units of x = −45 between z = 120 and 278, and
                               #   a DRAWING is in it if any part of it is
node tools/shoot-textures.mjs  # EVERY DRAWING IN A PROP BOX, AT ACTUAL SIZE
node tools/montage.mjs <dir> <out.png> a.png b.png …   # a land on one sheet
node tools/check-fields.mjs    # no instanced field is ever half inked in —
                               #   and every routine is drawn when it is out
                               #   and not when it is in, at every hour it
                               #   changes at (Session 17)
node tools/check-verbs.mjs     # THE VERBS: the cart stops at the border, the
                               #   stone lands inside it, one thing in hand, a
                               #   seated walker is due north, the drove keeps
                               #   its hours, a door is knowledge
node tools/shoot-session15.mjs # the proofs, both states, both viewports
node tools/shoot-session16.mjs # THE FIRST HOUR: the bull, the gate, the goat,
                               #   the lures, Nell's doors, both viewports
node tools/check-lures.mjs     # which of the four lures each rig can hold,
                               #   and that a fog closes all four
node tools/shoot-session17.mjs # LIFE: a day in the life of twelve lands, at
                               #   the hours the routines are out, the moment
                               #   the animals react, and in every weather
node tools/check-roads.mjs     # THE FIFTEEN-SECOND RULE: walks every road at
                               #   4.1 u/s on both rigs and fails on fifteen
                               #   seconds with nothing in frame or in earshot
                               #   (HOUR=19 ROAD=east-road RIG=portrait VERBOSE=1)
node tools/shoot-session18.mjs # THE ROADS: the encounters at their hours and
                               #   after, the districts' cards, the bicycle,
                               #   the plane over the cut, the 8:15 the day after
HOUR=19.6 node tools/shoot-first-minute.mjs   # any sheet, at any hour
node tools/shoot.mjs           # all twelve lands, walkability smoke test
node tools/shoot-mobile.mjs    # the CHROME, at 320/360/390/430 points AND at
                               #   1280×720 with a mouse — and its stick step
                               #   is an assertion: a thumb raises the stick,
                               #   a mouse raises nothing (RIG=… for one rig)
node tools/shoot-fps.mjs       # frame cost, draw calls, triangles

node tools/check-audio.mjs     # RENDER THE SCORE OFFLINE AND ASSERT IT
node tools/verify-score.mjs    # the same score, wired, in the running game
node tools/shoot-sound.mjs     # the sound sheet: twelve lands, plotted in ink
node tools/render-wavs.mjs     # nineteen WAVs, for the one gate a tool cannot run
```

`design/specs/camera.md` is the camera written up — §0 is Session 12's
correction (which component was making people sick, and how that was
measured), then the two components, the envelope's arithmetic, the walk
south in units of page, every second-order effect checked, and the
harness clock. `design/specs/controls.md` is the hands: what each device
gets, why the joystick is a thumb's control only, why the run is
taught once at the moment it becomes worth having, and (Session 15)
what the one key does when there is a well, a cart, a stone, a swing or
a fallen king in reach.

Every tool takes `$PW_CHROMIUM` if Playwright's own Chromium is not
where it expects (`tools/pw.mjs`).

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
- `src/world/events.ts` — **what is happening.** A land registers *at
  this hour, in this place, this happens*, reads it back as a number
  that is a pure function of the clock, and anything can ask whether it
  is on. It fires whether or not the walker is there.
- `src/world/things.ts` — **what the walker has moved.** A pushable cart
  and a carriable stone, one slot for the hand, and the border rule
  written into the file: no path in it can put a thing outside its own
  land.
- `src/world/company.ts` — **who walks with you.** A companion has a
  land, follows the walker inside it and stops dead at its edge on every
  road; the clamp is before the move, so nothing in the file can put one
  past a border. The goat is the first.
- `src/world/barriers.ts` — **what refuses a foot besides the page.** A
  fence with a stile and a gate that shuts. Every barrier is a drawing
  standing in the same place; there are no invisible walls.
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
