# QA — the first local pass, 2026-09-04

*Sessions 13 to 18 were built in remote sandboxes at three and a half
frames a second. This is the first time the shipped build was played
on a real machine with a GPU, in real time, with real keys, on both
rigs. It is a QA report and not a gate: it says what is broken, what
is below the bar, and what the next sessions should do about it. It
does not award or withdraw a verdict.*

**Build:** `main` at `8a8bf8d` (Session 18 merged). `npm run build`
green. Played through `vite preview` on the owner's Mac in headed
Chromium (Playwright's `chromium-1228`), 1280×720 and 390×844, with
`tools/qa-play-local.mjs` and `tools/qa-play-local-2.mjs`; the
evidence is in `shots/qa-local-1/` (git-ignored, like every shot dir).

---

## 0. The verdict in one paragraph

The world is beautiful at a distance and broken up close. Every
automated gate in the repository passes on this machine, the frame
rate is 55–61 fps on both rigs, there are zero console errors, and the
contact sheet at noon holds up against the WOWED critiques. But the
first minute traps a player who does exactly what the game tells them
to do; nothing in the world except three fences and one gull has
collision, so the walker walks through every cottage, wall, keep,
fountain and tree and the camera goes inside them; and the writing
over the picture — labels, prompts, cards — is placed by rules that
put it far from the thing it names. None of the three is a land
problem. All three are systems, and all three stand between the build
and an Awwwards juror.

---

## 1. What was run

| gate | result |
|---|---|
| `npm run build` (tsc + vite) | green; 1.08 MB JS, 332 KB gzipped |
| `check-terrain` | all pass |
| `check-camera` | all pass, both rigs |
| `check-fields` | 81 figures through their hours, all drawn right |
| `check-verbs` | 80 assertions, all pass |
| `check-lures` | measured; the keep holds at rest on a phone, the rest with a peek |
| `check-sightline` | corridor clear |
| `check-audio` | renders, every assertion holds, unheard |
| `check-roads` | 22 road walks, none silent for fifteen seconds |
| play-through, desktop | title, first hour, verbs, bicycle, twelve lands at noon, six at dusk, night, rain, storm, fog, wind, map, save/continue |
| play-through, portrait | the same |
| the ear gate, the feel gate, touch input | **not run** — no tool can, and this pass had no thumb and no speaker |

Two things about running the gates on the owner's machine:

- Playwright 1.62 wants `chromium_headless_shell-1234`, which is not
  installed. Every tool fails at its first line until
  `PW_CHROMIUM` points at an installed Chrome, exactly as `pw.mjs`
  warns. `npx playwright install chromium` fixes it for good.
- `shoot-lib.mjs` waits up to fifteen seconds per viewport for the
  words *set out* in `document.body.innerText`, and they are never
  there: every word in the chrome is lettered onto a canvas with an
  `aria-label`. The wait has silently timed out on every sheet since
  Session 2. Wait for `.title-veil:not(.gone)` instead and every
  shoot gets thirty seconds faster.

## 2. Performance, measured

Real `requestAnimationFrame` rate over two seconds, standing in each
land, plus `frameCost` (twenty frames rendered back to back on the
GPU).

| land | desktop fps | portrait fps | frame cost (ms) | draw calls |
|---|---|---|---|---|
| the Common (after the bull) | 60.5 | 60.5 | 9.2 | 389 |
| Brim gate | 60.5 | 60.5 | 8.3 | 361 |
| the Common, crossroads | 58 | 56 | 10.9 | 367 |
| Brim square | 57 | 55 | 9.0 | 305 |
| Greyweather | 61 | 59 | 3.9 | 164 |
| the Penwood | **51** | **49** | 4.6 | 184 |
| Splitrock | 61 | 57 | 4.3 | 182 |
| the Flats | 61 | 59 | 5.3 | 210 |
| the Downs | **55** | **52** | 8.1 | 304 |
| Longshore | 61 | 61 | 6.4 | 195 |
| the Wide Blue | 61 | 61 | 5.8 | 163 |
| Maple Court | 61 | 61 | 7.8 | 315 |
| Greyline | 61 | 59 | 7.3 | 275 |
| the Cubicle Mile | 61 | 61 | 6.5 | 216 |
| on the bicycle at the border | 60.5 | 60.5 | 10.7 | 469 |

Load to title: 5.6 s on both rigs, of which 2.65 s is the loader's
own tween and delay. The Penwood and the Downs dip under 55 with a
low frame cost, which says the drop is CPU (the instanced fields'
per-frame work, the pine field's wind) and not the GPU. This is a
desktop-class Mac; a phone will be lower everywhere and the two dips
are where it will show first. Console: one Canvas2D
`willReadFrequently` warning, nothing else, on both rigs, across every
scene.

## 3. Bugs, ranked

### B1 — THE FIRST MINUTE TRAPS THE PLAYER (blocking)

You wake at (24, 90). The bull charges from the east. The hint says
*hold shift to run*. You run — due west, straight away from it, which
is what every player will do. The gate is at (−12, 82), eight units
north of the row you are running along. `meadow.ts`'s slam fires on
`elsewhere && toHedge < 5` — *elsewhere* meaning the walker is more
than six units off the gate's row — and at z = 90 you are. **The gate
shuts when you are at x = −9.4, one and a half units short of the
hedge, still inside the field, with the bull behind you.** Measured
on the harness clock, reproduced in real time on both rigs
(`shots/qa-local-1/01`, `02`). You are then pinned against the
hedge at x = −10.5; the only way out is the stile at (12.6, 63.8),
twenty-six units back past the bull, which nothing has named and no
prompt points at. The diagonal the shoot script drives, (−1, −0.22),
gets through; a player does not drive diagonals.

The *elsewhere* clause was written for a walker who went over the
stile or is being chased along the north fence. It also fires for the
spawn row itself. **Fix before Session 19 opens anything:** either
put the spawn on the gate's row, or make *elsewhere* exclude a
walker who is still east of the hedge and south of the fence (that
walker is heading for the gate, by definition), or widen the gap's
tolerance so the slam waits for `through` in that case. Then re-run
`check-verbs` section on the opening with a due-west run, because
the current assertion drives the diagonal and cannot see this.

Second finding in the same minute: **on desktop the charge is not
in the frame.** The camera looks north; the bull comes from the east
and stays behind and to the right, off the bottom edge, for the whole
run (`qa-shots/desktop/05–08`). In portrait it is visible. The
README's *the bull's chase is heard more than seen on a phone* is
backwards on this machine.

### B2 — NOTHING HAS COLLISION BUT THREE FENCES AND A GULL (major)

`barriers.register` is called three times in the whole world. Every
other refusal is deep water and steep ground. So the walker walks
through Brim's town wall off-road (20 units, straight through),
through the cottage row, into Greyweather's keep, through a Maple
Court house, through a Greyline tower, through the Cubicle Mile's
atrium, through the oak's trunk, and into Brim's fountain — measured,
`qa-play-local-2` section B. When it does, **the camera goes inside
the standee**: the frame fills with one cottage's drawing scaled to
the whole screen, blurred, with the district card lettered across the
roof lines and unreadable (`shots/qa-local-1/03`, `04`, `05`). The
Downs' mill and Brim's fountain do it on the road, at a walk, to a
player who is not trying.

The law says *every barrier is a drawing, and there are no invisible
walls*. The converse has been shipping: every drawing is invisible to
the foot. Recommendation in §6.

### B3 — THE WRITING IS PLACED FAR FROM WHAT IT NAMES (major, art)

Three separate placement rules, all wrong in the same direction:

- **Place labels** climb the skyline to avoid crossing the thing they
  name and end up 200–300 px above it: *THE OLD WELL* sits on
  Greyweather's wall, *THE FIELD GATE* on the castle, *THE THREE
  CHAIRS* against the sky (`06`, `07`). Session 9's fix for a name
  printed across its subject over-corrected into a name printed
  nowhere near it.
- **Prompts** sit at a fixed screen position (left or bottom-right of
  the walker) regardless of where the reachable thing is: *SHOUT DOWN
  THE WELL* at the left edge, *LOOK AT THE HEDGE* bottom-right,
  *LISTEN TO THE FOUNTAIN* bottom-left, with the subject on the other
  side of the frame.
- **The region card** has no backing and no halo, so it is illegible
  over Brim's bunting, the Penwood's pines, Splitrock's rock and
  Greyline's towers (`11`, panels 2, 4, 5, 11). And a place label
  stacks directly on top of it when both fire together (`09`).
- **The map's district labels** collide with the land names and with
  each other at portrait scale (`08`: *THE WOOD GATE*, *THE ORCHARD
  CLOSE*, *THE BACK STREETS* on top of *THE KINGDOM OF BRIM*; *THE
  FAIR GROUND* on *THE RIVER BEND*), and the footer overlaps the map's
  frame.

### B4 — smaller

- **The run hint prints on the bicycle** (`10`: *hold shift to run*
  while riding). The six-seconds rule does not know about mounts.
- **The rider floats above the bicycle** — the figure's feet are at
  saddle height, not on the pedals (`09`). Same for the seated
  posture on the train, unverified here.
- **The wake card says *the crossroads*** while you are sixty-six
  units east of it, outside every district rect — the card's sub-line
  falls back to something when `districtAt` returns nothing.
- **Standees blur at close range**: every one-off drawing is a
  fixed-resolution canvas and the camera is allowed within two units
  of it (`03`, `04`, the mill in `11` panel 7, the bunting in `05`).
- **The tarn is a faceted polygon**: at the shipping camera the water
  is a hard-edged dark shape with visible triangle edges, the one
  thing in the frame that reads as a 3D mesh (`11` panel 4).
- **The three chairs' note stays open across a border**, which only
  the harness can do, but a note that is open while the walker
  teleports is a note with no owner.

Not bugs, checked and clear: save/continue (position, hour, lands,
knowledge restore; *keep walking* appears only with a save), the
well's shout and answer, the swing and the due-north seat, the cart's
push, the choice card (both rigs, wraps correctly on a phone), the
bicycle's bell on the move and its stop at the Common's edge, the
goat's fall-in and stop, the district cards on a walk, the peek and
its spring home, night, rain, storm, fog, wind. The 8:15 was not
reached by play (it needs the line walked end to end); `check-verbs`
section 9 covers both kinds of run.

## 4. Against the bar — the art director's read of the local sheet

Judged on `shots/qa-local-1/11` (twelve lands, noon), `12` (six at
dusk), `13` (night and the four weathers), blind against the WOWED
critiques.

**Holds, and would still WOW:** Splitrock (the best single frame in
the game — the tear, the hatching down the fall line, the arch),
Brim Square (bunting, stalls, figures, the fountain), Greyline (the
frame-top ceiling as subject works exactly as critique-art-8 said),
the Flats' palms, the Cubicle Mile's ruled lines, the Common from the
crossroads with the four lures, the swing (`14`), the choice card
(`15`), and the night with the desk lamp.

**Below the bar, in order:**

1. **Castle Greyweather is cardboard.** Flat grey rectangles with
   hard vertical edges standing on empty grey ground; the keep's face
   is a plate (`11` panel 3, `13` panel 6). It earned its WOWED in
   critique-art-2 at a distance from the meadow, which is where it
   still works; stood in, it is the one land that looks like a tech
   demo wearing a style. Session 19 re-opens it; this is the
   priority inside that scope.
2. **The Common's hedges are green blobs.** The translucent flat
   washes with a loose outline stack into a muddy mass wherever two
   overlap, and one always sits in front of the lens at the field
   gate (`01`, `02`). The first minute is played inside this.
3. **Near-camera occlusion.** Bunting, the fountain's rim, a hedge, a
   cottage — anything within four units of the lens becomes a blurred
   shape across the frame. This is the same fault as B2 seen from the
   art side; a fade or a push-out fixes both.
4. **Longshore at dusk is a blank** (`12` panel 2): a field of sand
   with a walker in it and nothing for a hundred units.
5. **The dusk grade is one sepia over everything** — six lands at
   19.4 are the same colour. The lit windows in the office and the
   lamps in Maple Court save it; the coast and the castle have
   nothing to light.

## 5. The story, read in the build

Every note in the world was read (63 bodies across `civic.ts`,
`coast.ts`, `meadow.ts`, `wilds.ts`) against `STORY.md` and
`THE-LINE.md`.

**The voice is the best thing in the project** and it is consistent:
short, exact, dry, never explaining the joke. *The bins go out on
the right day.* *The step has not been stood on in living memory.*
*Nobody has ever won, and the bell keeps the time anyway, which is
roughly what a race is.* The twelve waits are legible in their notes
without a single line saying what anybody is waiting for, which is
the Calvino rule held.

**Where it drifts from its own law.** `STORY.md` §0: *the medium is
the style, never the subject.* Five notes touch it: *the river
practices its cursive on this corner of the common*; *still water,
black as the good ink*; *the page is only scratched here. walk north
and it opens*; *past the last kerb the page begins to lift*; *the
edge and the next sheet down*. The last three are the sheet's terrain
vocabulary, which the bar allows. The first two are the pen writing
about the pen. Small, and Session 22's rewrite is the place.

**Where it does not read yet.** The premise is a wait with a
timetable, and the build gives the player one line about it (the
signpost's *one that says 8:15, which is not a place*) and one stop
four hundred units away. Nothing between the crossroads and the
Cubicle Mile makes the 8:15 a question the player is carrying. That
is by design (no quest log, the world may point and never say the
turn), but three of the twelve waits are still a person in a pose
(Wick, Pye, Wren — Session 19's), the ending needs a route no note
names, and the fun pass's own diagnosis stands: outside the bull, the
Penwood and the fallen king, the lands are still museums with good
curators. The stakes the owner asked for are one bull deep.

**One structural note for Session 21's debt.** The ending's
consequence — whether the people who left are gone — is still open,
and the daily 8:15 stopping at empty platforms is currently the only
after. That is a fine answer if it is the chosen one; it should be
chosen, not defaulted into.

## 6. Recommendations, by session

**Before Session 19 opens a land (a day, and it is not optional):**

1. Fix B1. Spawn on the gate's row, or exclude the field's east side
   from *elsewhere*. Add the due-west run to `check-verbs` so it
   cannot come back. Move the bull's approach so the desktop frame
   sees it — a start position north-east of the spawn instead of
   east would put it in the picture on both rigs.
2. Fix the two label rules and the prompt anchor. A place label
   belongs within one line-height of the top of its drawing, clamped
   to the frame; a prompt belongs beside the thing in reach, not
   beside the walker; the region card wants a paper halo (the note
   card's own wash, at 60 percent) so it reads over any skyline; the
   map hides district labels below a scale or nudges them off
   collisions.
3. Fix the `shoot-lib` title wait and document `PW_CHROMIUM` in the
   README's run section as the first line, because the owner's gates
   depend on it.

**Session 19 (THE NEW CAST, WEST AND NORTH), inside its scope:**

4. Greyweather's re-art is the art gate's real job. The keep needs
   what Brim's cottages have — drawn stone, a ground that is not a
   void, and the bailey's furniture — before a Viking is drawn.
5. Longshore at dusk needs its fire visible from the promenade and
   one more light. The regatta fleet and the longship will do the
   rest.

**A systems session (proposed Session 19.5 or folded into 20):
COLLISION AND THE LENS.**

6. Every one-off standee registers a footprint barrier as it is
   built, the same way it already records its top into the skyline.
   The law becomes literally true: a drawing is a barrier. Fields
   (trees, grass) stay walkable; buildings, walls, the fountain, the
   mill, the keep, the towers do not. `barriers.blocks` is already the
   one call the walker, the goat, the dog and the bicycle all make.
7. Anything within four units of the camera fades to a quarter and
   stops occluding, or the rig pushes in past it. Standees get a
   second, larger canvas for the near range, or the camera is not
   allowed nearer than their width. Either closes the blur.
8. The tarn's water wants the sea's shader, not a polygon.
9. The rider sits on the saddle; the six-seconds hint knows about
   mounts; the wake card's fallback is the land, not a district.

**Owner's gates, still owed:** the ear gate (eighty WAVs), the feel
gate on the bicycle and the run taught by a bull, and — new from this
pass — a thumb on the joystick, which this pass could not fake and
`shoot-mobile` only photographs. The two frame-rate dips (Penwood,
Downs) want a phone before anybody optimises them.

**Story, for Session 22:** the two pen-about-the-pen lines; a second
line somewhere in Act I that carries the 8:15 forward (the timetable
Nell has, or Dennis's schedule seen early); and the Session 21
decision written down as a decision.

---

*Everything above is measured where it could be — `tools/qa-play-local.mjs`
and `tools/qa-play-local-2.mjs` reproduce the play-through and the
harness assertions, and the check tools were run as listed — and
photographed both ways. What it is not is a verdict on fun. That
gate is still the owner's.*
