# WORLD SYSTEMS — how INKLANDS becomes a world

*Owner decision, 2026-08-28 (after Session 3). This file is the standing
plan for everything that is not a land: what makes an open world worth
living in, in this game's own idiom. `QUALITY-BAR.md` still governs how
anything here is judged. `PLAN.md` holds the order.*

---

## 0. What kind of open world this is

**THE MEDIUM IS THE STYLE. IT IS NEVER THE SUBJECT.** *(Owner
direction, 2026-08-29.)* This world is drawn in ballpoint the way a
comic is drawn in ink: it is how the thing looks. A story about the
paper, the pen, the drawing or the person who drew it is not on the
table, and every candidate DIRECTION.md carried before that date was
one — which is how three sessions of design drifted into mistaking the
technique for the plot. The ballpoint, the washes, the hand-lettering
and the sheet's terrain vocabulary (§1) all stay exactly as they are:
that is CRAFT, and craft is where the medium belongs. The story is
about the world — its history, its regions, its people, and what they
want.

*(Every work named in this file is scoped and credited in
`design/INSPIRATION.md`, which is the canonical list.)*

The bar names *Alto's Odyssey*, *Journey*, *Sable* and *A Short Hike*.
Those are **small open worlds**, and they shine for nearly the opposite
reasons Skyrim and GTA do: no quest log, no markers, no urgency, and a
map you could cross in ten minutes.

We take **principles** from the big ones — RDR2's world having business
of its own, GTA's density of incidental activity, Skyrim's "see a thing,
go to it", **Fallout's habit of telling whole stories with nothing but
the objects left in a room** (§10) — and never their breadth. A
thousand-person-year simulation is not the competition; a world that
feels authored in every frame is.

### A small map is not a short game

**Owner correction, 2026-08-29, and it matters enough to write in
capitals somewhere: TEN MINUTES IS THE CROSSING, NOT THE GAME.** The
target is a world people play for HOURS.

Those two facts are not in tension, and every game on the benchmark list
proves it — Skyrim's map is a twenty-minute run and people give it three
hundred hours; Outer Wilds' entire solar system is smaller than this
sheet and it is a twenty-hour game; *Obra Dinn* is one ship. A small map
is a decision about **density**, and this project's whole bar is density:
every mark authored, nothing generated, nothing filler.

So the hours do not come from more sheet. **Expanding the world is still
parked** (see the audit) and gets more expensive every session, because
at this bar a new land costs a full session. The hours come from **depth
— reasons to walk the same ground again** — and there are exactly four
engines for that, all of them already half-built or already planned:

1. **The world changes without you** (§7 — time, then weather). The
   cheapest hours in this file by a wide margin: it multiplies every
   land already built by the number of states it can be in, at no
   authoring cost per land. Session 6.
2. **You change how you move** (§4 — the mounts). Each mount re-opens
   the whole map, because a map you row is not the map you walked.
   Five are designed; the rowboat is Session 6.
3. **Knowledge as progression.** Nothing gets stronger; *you* get
   better at reading the page, and the world was always open. This is
   how Outer Wilds, Obra Dinn, Tunic and Chants of Sennaar all run long
   with no combat and no levelling — and it is the one engine this
   project has never considered. It costs **no new system class**: the
   verb is looking, which is the only verb we have. See DIRECTION.md.
4. **Routine you learn** (§5). You come to know people by where they
   are at a given hour. Enormous texture for a small cast.

And one that must never be the spine: **collection**. It is the cheapest
to author, it caps out fast, and it turns into a checklist — which is
the exact failure the bar already refuses ("Skyrim's caves are its
weakest content because they are generated"). Collection is a texture.
It is never the reason anybody is still here at hour six.

Three rules fall out of that, and they govern every system below:

1. **No UI where the world can say it.** No quest markers, no objective
   list, no fast-travel menu, no dialogue trees. If the player needs to
   know something, a drawing tells them.
2. **Nothing is urgent.** No timers, no fail states, no combat.
3. **Curiosity runs on sightlines.** The reason to walk somewhere is
   that you can see it from here.

---

## 1. Terrain — the paper has a shape

**The flat ground was never a design decision. It was inherited** from
margins (a book of flat pages) and then written into the quality bar as
if it were law. It is the single biggest thing holding the world back:
it is why Session 3 lost a full critique round to the keep hiding
behind its own gatehouse, and why Greyweather's "high seat" and its
"wall riding the crags" are *drawn* rather than *modelled*.

Paper is flat. Paper is not rigid. The sheet gives us a better terrain
vocabulary than generic hills, and every term is more on-brand, not
less:

| feature | what it is | where it belongs |
|---|---|---|
| **the crease** | a hard fold with a shadow in it | a valley; a road that dives |
| **the curl** | the sheet's margins lift, as paper always does | the world's rim — a boundary that is also a vista |
| **the buckle** | where the wash was wet, the paper cockled | rolling ground: the downs, the common |
| **the tear** | the page ripped; you can see down to the desk | SPLITROCK CANYON, which should *be* a tear; and the coast, where the wet margin tore away round THE HOLDFAST |
| **the miss** | the wash ran over the page and left a dry streak | THE SANDBAR — how open water became a land you can walk |
| **what's under the sheet** | a book, a pencil, another sheet | hills, mesas, the castle ridge |

Rules: **low amplitude** (roughly 0–12 units across the sheet) with two
or three authored exceptions. **Author landforms with PLANAR FACES**
(Session 5): the terrain draws a cliff in strokes down its fall line,
and a doubly-curved landform has no constant fall line to draw down — it
comes out as a thumb print, and then, if you wobble it, as herringbone.
Paper tears in straight runs and turns at corners, so a landform is a
polygon with faces, not an ellipse. Standees stay **vertical** on slopes —
they are paper cutouts standing on a warped page, they do not tilt with
the ground. Steep is impassable, which is free traversal gating.

What it costs: a subdivided terrain mesh with a height function, and a
`heightAt(x, z)` query. The good news is placement is centralised —
`ctx.standee()`, `ctx.decal()` and the field setters in
`src/world/regions/index.ts` are the only places props meet the ground,
so twelve region builders do **not** each need editing. Footprints, the
camera and the character controller each need one lift.

**This must land before any more lands are authored.** Every land built
flat is a land re-opened later.

## 2. The camera — the height pass is DONE, and so is the BEARING

### The first pass — BUILT, Session 4 ✓

Session 3 established the **frame-top ceiling**: the shipping camera
shows roughly 10 world units of height at 33 units out and 16 at 82, so
any tall near object fills the upper frame and hides everything behind
it. That is why Greyweather's keep is drawn wide (640×320) and its
gatehouse is only 9.5 units. That ceiling was a camera constant nobody
chose on purpose.

*Session 4 fixed it. The camera is a designed system now — `back`,
`up`, `look`, the three `rise*` terms and `fogPerUnit`, each a decision
with a reason, all documented in `App.CAM`. Rising ground reveals more
by RETREATING rather than by pitching, because pitching throws the
walker out of the bottom of the frame. Height buys distance. All three
rise terms are zero on flat ground, which is what protected the WOWED
compositions of Sessions 2 and 3.*

### The second question — BUILT, Session 9 ✓

The owner asked it on 2026-08-30:

> **Can the camera shift, on desktop and on mobile, so the player can
> always see where they are headed?**

**The complaint was exact and it was real.** The camera only ever looked
north. Walk north and you are walking into the frame; walk EAST or WEST
and you are crossing it; **walk SOUTH and you are walking backwards out
of it, into ground you cannot see.** That is not an edge case: the
king's road runs north–south for four hundred and eighty units and
**Act III's whole walk — the castle gate down to the car park — was done
facing away from where you were going** (`design/THE-LINE.md` §3).

*What follows is the section as it was written before the session, and
then what the session actually found — because the recommendation below
was right about half the question and wrong about the half it was
written for, and a plan that gets corrected is worth more written down
than quietly replaced.*

#### The technical fact that decides the shape of the answer

**Standees are not billboards.** `makeStandee` builds a `PlaneGeometry`
with a fixed `rotation.y`; nothing in this engine turns to face the
camera. At the shipped bearing every cutout is square to the lens, and
that is the entire reason the paper metaphor reads.

Rotate the camera and they are seen off-axis. The arithmetic is the
whole design constraint:

| yaw | a standee's apparent width | verdict |
|---|---|---|
| 0° | 100% | the shipped page |
| 12° | 98% | **portrait's envelope** |
| 20° | 94% | free |
| 26° | 90% | **desktop's envelope** |
| 30° | 87% | survivable |
| 35° | 82% | the wall |
| 45° | 71% | visibly card |
| 90° | 0% | the world is edges |

**So a free camera is fatal and a bounded one is not.** Anything past
about thirty-five degrees turns this world into a stack of paper seen
sideways, which is a bug that looks exactly like the metaphor failing.

#### The four candidates, and the standing recommendation

1. **A free orbit.** Refused. It re-opens every land, breaks the layout
   law, and hits the standee wall above.
2. **BOUNDED YAW THAT EASES TOWARD TRAVEL** — the camera swings a
   limited amount toward the direction the walker is actually going,
   inside an authored envelope of roughly ±30°, and eases back to due
   north whenever they stop. *This was the recommendation.*
3. **A PEEK GESTURE** — hold a key, or two-finger drag on a phone, to
   look, springing back on release. Bearing is a gesture and never a
   state.
4. **A LEAD OFFSET rather than a rotation** — aim further along the
   direction of travel without changing bearing.

#### AND WHAT SESSION 9 FOUND, WHICH CORRECTS THIS SECTION

**A bounded yaw cannot help the walk south, and the geometry is not
close.** This section said candidate 2 would mean that "walking south
you get enough of a turn to see what is coming". It does not. The
camera trails the walker on the +Z side; yawing the rig twenty-six
degrees about the walker leaves it on the +Z side. **Southward travel is
travel AT THE LENS, and no bounded rotation puts a lens behind itself.**
Only a free orbit does, and a free orbit is refused.

So the shipped answer is TWO components, split by what the walker's
travel is actually doing to the frame — and the split is not tidiness,
it is what removes the wobble:

> **The part of your travel that CROSSES the frame turns the camera.
> The part that comes AT THE LENS opens the ground at your feet.**

- **THE YAW** runs off the crossing component of travel, inside an
  envelope of **26° on desktop and 12° in portrait**. Full deflection by
  due east or west; nothing at all due north — *and nothing at all due
  south either*, which is the point below.
- **THE ASTERN OPENING** runs off the toward-the-lens component: the
  camera **gives ground**, trailing 5.5 units further back and dropping
  its aim by 1.6, which pitches the page up and lays the road the walker
  is entering out below them. It is `riseBack`'s trick — reveal by
  DISTANCE, never by pitching the subject out of frame — pointed the
  other way.

**The defect, and the fix, in units of page.** With the camera 6 up and
13 back aiming at 3.4, the bottom edge of the frame meets the ground 9.5
units in front of the lens, which is **three and a half units in front
of the walker** — eight tenths of a second of warning about the ground
you are walking into. Live, that is **17.5 units**, or three and a half
seconds. That number is what the session is for, and
`tools/check-camera.mjs` measures it by firing the frame's own bottom
edge at the terrain rather than by asserting the arithmetic that
produced it.

**And why there is no coin toss at due south.** The obvious way to build
"ease toward travel" is to point the camera at the travel bearing and
clamp it — and then due south is a fifty-fifty between +26° and −26°,
and a walker weaving either side of the king's road flips a
fifty-two-degree pan back and forth. That is not a tuning problem, it is
a discontinuity, and no spring constant fixes it. Splitting travel into
its two components removes it outright: both terms are continuous
everywhere on the circle, and both are **exactly zero for a walker
standing still**.

**Portrait's envelope is half of desktop's, and not because of the
standees** — 12° costs a cutout two per cent. Because the two viewports
have different frames to spend a turn in: desktop is 42° vertical at
16:9, which is **68.6° across**; portrait is 54° vertical at 390×844,
which is **26.5° across**. A yaw of φ slides a distant thing across the
page by tan φ / tan(½ hfov) — so 26° is a third of desktop's width and
the whole of portrait's. §8's rule closes it: the joystick must never
sit under the thing the player is steering toward, and neither may the
turn carry that thing off the page.

**The peek shipped too** — `,` and `.` held on a keyboard, two fingers
dragged on a phone, springing back on release. It **takes the yaw over
rather than adding to it**, so nothing in this game — travel, gesture,
a road that carries, all at once — can put the camera past its rig's
envelope. **The lead shipped too**, capped in units per rig rather than
held at a number of seconds, because portrait's frame is three and a
half units wide where the walker stands.

#### What any version of this must not break — and what proves it

- **The resting bearing is due north**, and a stopped walker is always
  in the composition the land was authored for. Shipped as an ARRIVAL
  and not an asymptote: under a sixth of a degree of ask, the bearing is
  set to exactly zero. Measured at **2.5 game seconds** from full
  deflection to exact zero.
- **Every protected framing must be reproducible exactly.** ✓ The shoot
  harness pins the bearing (`shoot({ bearing: true })` is opt-in and
  every existing sheet gets the pin), and **`tools/diff-sheets.mjs`
  is the diff**: it builds a base git ref and the working tree, shoots
  the twenty-three framings that carry the six WOWED verdicts at two
  hours in both viewports through an identical protocol, and counts the
  pixels that moved.
- **The envelope is authored, not free** — one number per rig in
  `App.CAM`, with the standee table written beside it as the reason.
- **Portrait gets its own envelope.** ✓ 12°, for the reason above.

*The whole system, with its arithmetic, its second-order effects and the
harness clock that proves it, is `design/specs/camera.md`.*

#### AND THE LAW THIS DOES NOT TOUCH, WHICH THE NEXT SESSION WILL BE TEMPTED BY

**THE CAMERA'S RESTING BEARING IS STILL DUE NORTH, AND IT STILL DECIDES
LAYOUT.** A thing the player walks ALONG runs north–south; a thing they
LOOK at is north of where they stand. Nothing in Session 9 licenses a
land to be laid out east–west, and the arithmetic says why:

- a stopped walker is at yaw zero, always, by contract — so **every
  composition in this game is still judged due north**;
- the envelope is 26° and 12°, so the most a *moving* walker ever sees
  is a quarter-turn's worth of lean. A place staged to the east of its
  viewpoint is still 64° out of frame;
- and past 35° the standees fail, so the envelope cannot grow.

Session 5 lost two rounds to a boardwalk laid east–west and a regatta
staged west of its viewpoint. **The turning camera does not buy those
rounds back**, and the first land session after this one is exactly
where somebody will assume it does.

## 3. Traversal — BUILT, Session 6 ✓

*All three items below shipped in Session 6. `design/specs/traversal.md`
is the record — what was built, what was measured, and the numbers.
This section is kept as the brief it was, so a later session can see
what was asked for.*

Twelve lands connected by one constant walking speed is the likeliest
thing to cap us at "gorgeous tech demo". Every benchmark game has a
traversal verb with texture and mastery.

- **Ink weight as speed.** ✓ Sprint and the footprints press darker and
  wetter; walk and they feather. Your speed is legible in the marks you
  leave behind you. *Built as ONE continuous scalar (`Character.effort`)
  which speed, stride, the print, the step and the score's intensity are
  all readouts of — and whose MIDDLE is the shipped mark, so a walk is
  exactly the walk four lands earned their verdicts with.*
- **The line pulls the pen.** ✓ Roads *carry* you — faster, gently
  auto-steering — because a pen likes following a line it already drew.
  *Built as a BEND (a fixed share of the angle between where you are
  pointed and where the road goes), never a pull toward the centreline,
  and gated on alignment so crossing a road is free. Authored per road
  and MEASURED: on the king's road, aimed twenty degrees off, you travel
  eight. STORY §4's line — king's road, main street, commuter spur —
  carries hardest.*
- **The river as a route.** ✓ It used to only say no. *The rowboat lives
  at THE RIVER MOUTH and the river is now the only east–west road in the
  world, from the salt to the source, under all three bridges.*

## 4. Mounts — one per quadrant, each refusing the others

The RDR2 lesson is not "add a horse", it is that the horse is a
**relationship with a cost**. The Skyrim lesson is inverted: fast travel
is the thing that most damages Skyrim's world.

**The rule: every mount is fast on its own ground and refuses every
other ground.** Walking stays the universal verb; a mount is a
*place-feeling*, never a menu. Mounts are **found in the world and left
in the world** — yours is where you left it.

Each is the reward for finishing its quadrant, which marries the mount
system to the content system (§6) and to the geography DIRECTION.md
already established: walking east-by-south is growing up.

| mount | quadrant | earned | refuses |
|---|---|---|---|
| **the horse** | the old world (Brim, Greyweather) | finishing the keep | the city — it is drawn in ballpoint and balks at the straightedge world |
| **the bicycle** | Maple Court — the childhood one | finishing the neighborhood | sand, and stairs |
| **the rowboat** ✓ S6 | the river and the coast | *found, not earned — see below* | dry land, and the open sea |
| **the 8:15** | GREYLINE CITY → THE CUBICLE MILE | finishing the office park | everywhere the line is not drawn |
| **the paper plane** | the wilds | launched from height | being steered, mostly |

**THE ROWBOAT SHIPPED FIRST, and it broke one line of this table on
purpose** (Session 6). Every other mount is the reward for finishing its
quadrant; the rowboat is simply THERE, drawn up at the river mouth, from
the first minute. That is not a shortcut — it is what makes the rule
above legible before anything has been earned. A player who finds a boat
in hour one and discovers it refuses dry land has learned what a mount
IS in this world, and every later mount inherits the lesson for free.
The thing it opens is a route the walk did not have (the river), and
`design/specs/traversal.md` §3 records the decision that matters: **she
does not leave the shore**, because a boat that goes anywhere wet would
delete the sandbar that cost Session 5 a whole session, and because the
torn west edge is not this session's to spend.

**The 8:15 is the best payoff available to us and it is already set up.**
The existing office-park note reads: *"the timetable says the 8:15 is
coming. the 8:15 is drawn nowhere on this sheet. everyone waiting knows
both of these things and has made their peace."* The reward for
finishing that land is that **you draw the 8:15 into existence and it
arrives.** A railway is a ruled line across a page, in the one quadrant
described as the only part of the world drawn with a straightedge.

## 5. Inhabitants — behavior, not dialogue

The no-faces rule is a gift: doodle-folk cannot emote, so they must
express through posture, placement and routine.

- **Routine over time.** The ferryman actually crosses. The shepherd's
  flock actually moves. Shutters open in the morning and shut at dusk.
  You come to recognise people by where they are at a given hour.
- **One visible want each.** Not a dialogue tree — someone standing at
  the gate *looking north* tells you what they want. You learn wants by
  looking, which is the verb the game already has.
- **And a name** (§10). A name costs one line and converts a prop into
  a person; nothing else about them changes.
- **The co-walker.** Someone falls in beside you for a stretch and then
  stops dead at their land's border, because they are drawn in that
  land's ink and cannot leave it.
- **Road encounters** (RDR2's cheapest magic): a cart with a broken
  wheel, someone lost, a funeral you should not interrupt. Authored,
  never generated.
- **Animals** are the cheapest life-per-byte in any world, and ours
  respond: sheep part, fish scatter in the shallows, a dog follows you
  for half a land, a cat on a wall wakes if you run past.

## 6. The content system — knowledge, not collection

*Rewritten 2026-08-29. This section used to be "the unfinished sheet":
stand in pencil-ghost ground, hold to ink it in, and that is the
side-quest system. It was a story about the drawing, so it is gone
under the standing rule in §0 — and it was also the wrong SHAPE for a
game that has to run for hours, which is the more useful half of the
lesson.*

**A collection loop caps at about two hours.** Whatever the thing being
collected is, the player learns nothing doing the ninth one that they
did not know at the third, and past that point it is a checklist — the
exact failure the bar already refuses. Collection is a texture. It is
never the reason anybody is still here at hour six (§0).

**What runs long is knowledge**, and this world is unusually well set
up for it:

- **You already only have one verb: looking.** No faces, no dialogue
  trees, no combat. Everything the player will ever learn, they learn by
  going somewhere and noticing. That is a constraint on every other
  system and a gift to this one.
- **Knowledge is the inventory.** Not an item, not a journal entry — a
  NAME, a FACT, a ROUTE, a REASON. Places open because you now know
  where to go and what you are looking at, not because a flag flipped.
  Chants of Sennaar and Obra Dinn both run ten-plus hours on this and
  nothing else.
- **The map is the record** — this part survives from the old section
  and is still right. Pencil for what you have heard about, ink for what
  you have seen. It fixes the map's current problem (a reference tool
  that should be the record of your own walk) and it is the artifact
  people screenshot.
- **The cascade stays, as an EFFECT.** The world inking itself in around
  your arrival is one of the best things this engine does. It is no
  longer a verb the player performs; it is what noticing looks like.
- **One authored errand per land, underneath.** DIRECTION.md's COURIER
  demoted from spine to texture: a cart with a broken wheel, someone
  lost, something to carry two lands east. Authored, never generated,
  and never the reason to keep playing — the reason is what you find out.

## 7. Time and weather — the world changes without you

### Time — BUILT, Session 6 ✓

**Time of day has the highest return of anything in this file**, because
every land already built improves for free: washes shift, lamps light in
Brim, the city's windows come on, moods change, routines move. The
metaphor supports it — the desk lamp comes on.

*It does. `src/world/daylight.ts` is the clock and the one authority on
the hour; the grade is one multiply in the paper post-pass and the fog
colour; and the whole of `design/specs/traversal.md` §4 is the record.
Four things a later session must not undo:*

- ***eight in the morning to four in the afternoon is BIT-FOR-BIT the
  shipped page*** *(the neutral tint is pure white and the neutral haze
  is `PAPER_HEX`), which is what makes the day cycle additive rather
  than a re-grade of six earned verdicts;*
- ***the haze takes the hour's colour; the paper takes a little of it,
  weighted by its own brightness; the INK takes none.*** *Round 1 of the
  gate rejected a flat grade in one word — SEPIA — and it was right;*
- ***the horizon goes darker than the page does.*** *That single move is
  the difference between a filter and a desk lamp;*
- ***the hour is readable by anyone*** *(`import { clock }`), which is
  the seam STORY §7's routines and §9's mixer both need.*

### Weather — still to come

**Rain** is nearly gift-wrapped: the ink library's smudge pass is
already documented as weather ("her smear as weather"), so rain in this
world runs the drawing.

## 8. Mobile and desktop are both first-class

Not a session — **a standing law, enforced at the gate.** The joystick
and a portrait FOV switch already exist and have never been judged.
From now on every contact sheet shoots **portrait (390×844) as well as
desktop (1280×720)**, and the art director reviews both. A composition
that only works in landscape is not done.

Portrait implications to design for, not patch later: less horizontal
frame means vistas must be *taller* compositions; touch targets and POI
prompts need thumb-reach placement; the joystick must never sit under
the thing it is steering toward.

**And the number behind all three of those** (Session 9, while sizing
the camera's envelope): portrait's frame is **26.5° wide** and desktop's
is **68.6°**. Not "less horizontal frame" — *a third of it*. Every rule
in this section is a consequence of that one figure, and any future
system that spends horizontal frame — a turn, a lead, a lean, a
shoulder-cam — needs its own portrait number rather than a scaled
desktop one.

---

## 9. The score — one music box, twelve rooms

*Owner direction, 2026-08-29: each region should have its own
background music. This section is the standing plan for it.*

### Where we actually are

`Audio.MOODS` already carries twelve per-region entries, and each one
sets a **scale**, a **gap** and a **level**. That is real — the melody
genuinely wanders a different mode in every land — but it is all played
on the **same instrument**, over the **same room tone**, and the
difference between two lands is a handful of semitones. A player can
cross a border blind and hear the footstep change; they cannot hear the
*music* change. That is the gap.

### The five moves, in order of return

1. **A land's music is its INSTRUMENT, not its scale.** This is
   nine-tenths of the effect and it is the thing we do not have. Five
   synthesised voices cover twelve lands with deliberate doubling:
   - **the music box** — what exists: a fast-decay pitched ping;
   - **the plucked string** — Karplus–Strong (a noise burst into a
     short delay line with a lowpass in its feedback). About twenty
     lines, costs almost nothing, and sounds *nothing* like a sine.
     This is the single highest-value addition to the instrument box;
   - **the bowed/held voice** — a saw through a resonant lowpass with a
     slow attack, for the ceremonial lands;
   - **struck metal** — an inharmonic partial stack with a long tail.
     `bell-buoy` (Session 5) is already this instrument;
   - **air** — filtered noise with a moving resonant peak. `surge`
     (Session 5) is already this instrument.
   Two of the five were therefore already written, and **this section's
   own arithmetic was off by one**: what was left was the plucked
   string and the bowed voice, which is TWO, not three. ✓ *Session 8*
   — both built, the count corrected, and the assignment authored as a
   table beside `MOODS` (`LAND_VOICE`: instrument, register, loudness
   trim, and the REASON, one line per land). The doubling is by family:
   what you wake to (box), what grows (string), what was cast and hung
   up (bell), what stands still (bowed), and what moves without being
   touched (air).

   One thing found in the building of it, and it is why the string is
   rendered into a buffer rather than wired: **a feedback cycle in Web
   Audio is floored at one render quantum**, 128 samples, so a
   DelayNode Karplus–Strong cannot play a note above about 340 Hz —
   and half this world's scales live above that.
2. **A bed per land, not one room tone everywhere.** ✓ *Session 8.*
   `BEDS`, twelve rooms, each with what it is made of (the filter),
   whether it breathes (a slow LFO on the cutoff — the sea does, a
   machine does not) and how much of it there is. Every one of them
   measured BELOW the land it is the room of, which is what "the
   quietest thing in the mix" has to mean if it is to mean anything;
   the canyon is 14 dB under the sea.
   The long tail is not a bed, it is what a place does to a sound after
   you have made it, so it is `TAILS` — one delay with feedback, shared,
   mixed per land. Two lands answer back: the cut and the empty keep.
3. **A border is a CROSSFADE, not a cut.** ✓ *Session 8.* Equal power
   (cos/sin of the quarter circle) over three and a half seconds, on the
   bed AND on the instrument: for those seconds the phrase is played on
   BOTH lands' instruments at the crossfade's own weights, which is a
   crossfade of instruments rather than of tunes. Two tunes at once is a
   mistake; one tune changing what it is played on is a border.
   **And the thing that would have shipped un-noticed:** two beds built
   from the same noise buffer at the same offset are the same SIGNAL,
   and an equal-power fade between two identical signals swells 3 dB in
   the middle. Every border in the game had a bump in it until the
   renderer was pointed at one. Each bed now enters the world's noise
   at its own offset.
4. **The score answers the player.** ✓ *Session 6.* `setMoodIntensity`
   had existed since the port and nothing in this game had ever called
   it; traversal calls it now, twice a second and only when the number
   has moved (every call schedules a 1.5-second ramp, so one a frame is
   a mixer that never arrives anywhere). Standing still is 0.45; flat
   out is 1.35. **The seam is open: the mixer is told how hard the
   player is going and decides what to do about it.**
5. **The score answers the hour.** ✓ *the seam, at least.* `Audio.hour`
   is public and `Audio.setHour` is called from the day cycle. Today it
   thins the room tone after dark and lengthens the melody's gaps; the
   score session will find the number already there and correct, and
   **does not have to re-open the day cycle.**

### Where the music comes from

Fallout's radio works because the music has a **source**: somebody is
broadcasting and you are receiving, and the fiction does the work that
a hundred lines of mixing code cannot.

*(A source was proposed here on 2026-08-29 — that the music is playing
in the room where the page is — and retired the same day under §0's
standing rule. It was the medium as the subject again, in the one
system where it would have been hardest to take back out.)*

The source, if there is one, should come from the STORY, and the story
is picked at Session 7. Until then the score is built diegetically
neutral: a per-land instrument, a per-land bed, and crossfades — none
of which presume where the music is coming from. Two candidates worth
holding on to for whoever picks:

- **the world plays it.** Each land's instrument is a thing that is
  actually there: Brim's is the belfry and the market; Greyweather's is
  wind in a stone building with nobody in it; the office park's is two
  notes of hold music; the coast's is the sea. Nothing is "scored" —
  you are simply hearing where you are. This is the cheapest to justify
  and it costs no fiction at all.
- **somebody is playing it.** One instrument, carried, moving around
  the world on its own schedule — you hear it far off in one land and
  come across it in another. That is a character, a routine (§5) and a
  score in one object, and it would be the best use of the mount system
  nobody has thought of yet.

### The proof that this is worth a whole session

*Added 2026-08-30 with the RuneScape entry (`INSPIRATION.md`).*

**RuneScape's soundtrack is the most-remembered thing about it after
the map.** Every area has its own short, strange track played on a
handful of voices, and a player who has not opened the game in a decade
can name the area from four bars. **Hearing it IS knowing where you
are** — which is the map-as-record, in sound, and it is the exact gap
this section identifies in our own mix. Twelve moods on one instrument
is a world with one voice; twelve instruments is a world with twelve
places.

**And it names the thing to refuse, from the same game.** RuneScape
posts *"You have unlocked a new music track"* and keeps a music player
with a list in it, which turns a soundtrack into a collection with a
count. Session 7 spent itself refusing exactly that
(`src/world/knowledge.ts`). **A land's voice arrives because you are
standing there. Nothing announces it and nothing lists it.**

### And the source is decided by the story now

The two candidates parked above were *the world plays it* and *somebody
is playing it — one instrument, carried, moving around the world on its
own schedule*.

**The second one is dead, and the story killed it.** `STORY.md` §8 rule
1: *nobody crosses a border but the walker.* A musician who moves from
land to land is the one thing this fiction cannot contain, and it would
break the engine of the whole story in the service of a nice touch.

So it is **the world plays it**, and that is now the cheapest and
truest option rather than merely the cheaper one: each land's instrument
is a thing that is actually there. Brim's is the belfry and a market
that finally opened; Greyweather's is wind in a stone building with
nobody in it; the office park's is two notes of hold music; the coast's
is the sea. Nothing is scored. You are hearing where you are.

**Law, unchanged:** zero assets, so every voice is synthesis; the whole
graph stays a handful of nodes; and nothing outside `Audio.ts` invents
an instrument, exactly as nothing outside `palette.ts` invents a colour.

### And how anybody knows — BUILT, Session 8 ✓

*The part of this section nobody had written down, because it is the
first product in this project that cannot be screenshotted.*

- **`tools/check-audio.mjs`** renders every land offline through an
  `OfflineAudioContext` and asserts what a listener would notice:
  twelve lands are twelve sounds (pairwise spectral distance, closest
  pair reported and it is always a family); each land renders at the
  level `MOODS` says (all twelve within 1.07× of one another); the bed
  is under the land; the fade follows its own curve and never leaves it
  by more than the rooms' own weather; the mix is monotone in both the
  walk and the hour; the cut answers and the field does not; and
  nothing clips, with 22 dB of headroom left for the steps.
  **The enabling move is that every voice is a FUNCTION of the context
  it is built in** — `(ctx, dest, freq, t0, opts)` — because an
  OfflineAudioContext renders a graph and not a system: anything that
  waits on `setTimeout` or on `currentTime` advancing renders silence.
  The melody is driven from a clock passed in, so what is asserted is
  the phrase the player hears and not a stand-in for it.
- **`tools/verify-score.mjs`** does the half that cannot be rendered:
  the class's own wiring, in the running game, with a real context —
  fifteen crossings, and then five crossings inside one three-and-a-half
  second fade, which is the case that puts an AudioParam into a state
  Web Audio refuses.
- **`tools/shoot-sound.mjs`** is the contact sheet: every land's
  waveform and spectrum drawn with `src/engine/ink.ts`, on one shared
  decibel window so a quiet land looks quiet, with the room in pencil
  under the land in ink. **Twelve lands are visibly twelve sounds**, and
  if they ever stop being, the sheet says so in one glance.
- **`tools/render-wavs.mjs`** hands over the gate this project cannot
  run. Nineteen files at one uniform gain — twelve lands, three
  borders, one land at four hours — because **a session that claims a
  sound is good is lying, and a session that hands over the evidence is
  not.**

---

## 10. What we take from Fallout, and what we refuse

*(Summarised with every other reference in `design/INSPIRATION.md`.)*

*Owner direction, 2026-08-29. Fallout is a strange benchmark for a game
with no combat — which is the point. It is on this list for exactly one
thing it does better than anything else, and that one thing is the thing
INKLANDS is structurally forced into. It is also the benchmark that best
answers "how does a world stay interesting for hours without fighting in
it", which is now the standing target (§0).*

### The one thing

**Fallout tells whole stories with nothing but the objects left in a
room.** Two skeletons in a bathtub and a teddy bear. A chair, a chain
and a cage. You are never told; you read the room and you are certain.

INKLANDS has **no faces, no dialogue trees, no quest log and no
cutscenes** — every channel Fallout could have used and chose not to,
we do not have at all. So the vignette is not an influence here, it is
the native mode, and Fallout is the best available teacher of it.

**The rule that falls out:** every land carries **two or three authored
TABLEAUX** — small groups of props that tell one complete story and are
never explained. Not decoration, not "misc props" (which the bar
already forbids): a composition with a subject.

Ours are about the WORLD, not about how it was drawn (§0):

- a picnic laid for two on the downs, with one place setting put away
  again;
- a rowboat pulled up past the wrack line and chained to a post, with
  the chain long enough to have been unlocked every day for years and
  the padlock rusted shut;
- a market stall in Brim set out perfectly, under bunting, with the
  cloth still folded on it — the trader got everything ready and did
  not open;
- three chairs facing a hedge at Maple Court, and the gap in the hedge
  where there used to be a view of the city.

Each of those is one composition, tells one complete story, is never
explained, and needs no dialogue, no faces and no text.

### The other four

2. **Deadpan institutional cheer, not grimness.** Vault-Tec is funny
   because an upbeat voice describes something bleak and never breaks.
   We already do this and have not admitted it — the office park's
   standing note is pure Fallout: *"the timetable says the 8:15 is
   coming. the 8:15 is drawn nowhere on this sheet. everyone waiting
   knows both of these things and has made their peace."* That is the
   house voice. Name it, keep it, and never let it become jokes.
3. **The world can be WRITTEN ON.** Fallout speaks through terminals,
   posters and notes. We hand-letter everything (`ink.lettering`,
   `legibleCaps`) and currently use it only for the UI and the map,
   which leaves an entire channel unused. Signs, a chalked board, a
   notice actually nailed to Greyweather's gate rather than only
   described on a card, a tide table, a timetable. Cheap, on-brand, and
   it is how a land argues without a narrator.
4. **A region has a THESIS, not just a biome.** Fallout's regions are
   ideological before they are geographic. Ours vary by wash and by
   landform; DIRECTION.md's east-by-south gradient (walking is growing
   up) is a thesis we have written down and barely used. From the story
   session on, a land spec's §1 should be able to say what its land
   *argues*, not only what it looks like.
5. **A name is free, and it turns a prop into a person.** Fallout is
   full of people you meet once who are entirely one thing. Our
   doodle-folk cannot have faces, so they get one posture, one place,
   one routine (§5) — and a NAME. Nothing else about them changes.

### What we refuse, explicitly

Combat, weapons, damage, enemies. A quest log, objective markers, a
compass. Dialogue trees and speech checks. Loot, inventory, crafting,
encumbrance. Karma and reputation. Levelling. **The Pip-Boy** — a
diegetic menu is still a menu, and rule 1 of §0 is that the world says
it or it does not get said. And the ash: Fallout is post-apocalyptic
and this is a sheet of paper with a lark on it. **We take the
archaeology and the deadpan. We do not take the apocalypse.**

---

## 11. Interiors — the roofless cutaway

*Added 2026-08-30. `DIRECTION.md` has had interiors on the un-numbered
queue since before the story was picked, with the right argument and no
model. RuneScape is the model (`INSPIRATION.md`).*

**Interiors are the cheapest square footage in games.** They multiply
the map without expanding the sheet — which matters here more than
almost anywhere, because expanding the sheet is parked (see the audit)
and gets more expensive every session, while a doorway costs a drawing.

### What RuneScape settles

- **You walk in, and the roof comes off.** No loading screen, no door
  transition, no separate scene. On a sheet of paper that is not a
  camera trick — **it is a drawing convention.** A plan and an elevation
  on the same page is what a draughtsman does, which puts the cutaway
  squarely in CRAFT and nowhere near SUBJECT (§0).
- **An interior is three or four objects, not a simulated room.** A
  table, a range, a bed, a person. That is Fallout's vignette (§10) at
  domestic scale, and it is the same rule the cast already runs on: a
  person is a posture, a place, a routine and a name (STORY §7), and a
  ROOM is a place and two or three objects.
- **And it is where the waits live indoors.** Wick's banner loft. Teg's
  sealed complaint. Val's lit window seen from inside it. Half of
  `THE-WAITS.md` and most of `THE-STRANGERS.md` want a doorway.

### What it must not become

**Construction** — RuneScape's player-owned house, the building skill,
and every decorating menu attached to it. *A room you furnish is an
inventory wearing wallpaper*, there is no crafting in this game, and
rule 1 of §0 forbids the menu it would need.

### What it costs, honestly

The camera. Everything else here is a texture and a collision edit, but
the camera only ever looks north (QUALITY-BAR) and it trails thirteen
units, which is wider than most rooms. **A cutaway interior is a camera
problem before it is an art problem**, and any session that takes this
on budgets for that first.

---

## The inheritance audit

*The flat ground was inherited, not chosen. So the standing question for
every rule in this codebase is: did INKLANDS choose this, or did it
arrive from margins? Anything inherited must be re-ratified on its own
merits or dropped. Session 4 executed the first pass; keep auditing.*

### Dropped — Session 4, 2026-08-28 ✓

| what | where | why | outcome |
|---|---|---|---|
| **`AudioDirector`** (739 lines) | `src/core/AudioDirector.ts` | margins' Chapter 10 finale score. `director()` was never called from anywhere in INKLANDS. | File deleted; `director()`, `releaseDirector()` and the `holdSilence` hook into it gone from `Audio.ts`. |
| **59 of 66 `Audio.event` cases** | `src/core/Audio.ts` | margins chapter hooks (`wo-tape-boom`, `blot-edge`, `xray-taught`, `mom-underline`, `ghost-raised`…). | Deleted. The seven that survive are the ones the world actually says: `lark`, `well-plink`, `brim-bell`, `market-murmur`, `pigeon-flap`, `banner-snap`, `rook-caw`. Every synthesis helper kept — they are the instrument, not the score. |
| **The two-blues forgery contract** | `src/engine/palette.ts` | WARM_BLUE vs COLD_BLUE, the paling curves, the greyscale-separation requirement and the "nothing may write a blue" law all encoded margins' plot (a 1996 Bic vs a 1999 forging pen). INKLANDS has no forger. | Gone, with `warmBlueA`/`coldBlueA`, the four paling tokens, `PRINTED_RULE`, `DAWN_WARM` and `INK_PALE_HEX`. One `BLUE` remains as a colour. |
| **Smudge auto-on for WARM_BLUE** | `src/engine/ink.ts` | the drag-ghost is a left-handed character's hand in margins. | The rule is gone; the *effect* is kept and is now opt-in and off by default. It is a true ballpoint behaviour and it is how this world will draw rain (§7). |
| **The flat sheet** | `terrain.ts` and the quality bar | see §1. | Gone. `src/world/elevation.ts` is the page's shape and the one authority on where the ground is. |

Net: ~900 lines of another game's story removed, and the bundle is
~14 kB smaller than it was before elevation was added to it.

### Keep, but re-ratified on INKLANDS' own merits

- **Zero image assets / all-procedural ink.** This is the moat. Not
  inherited so much as the whole point.
- **The typeset glyph kit** (`legibleCaps`, `typeGlyph`) — still used by
  `ui/lettering.ts`. The *comments* about receipts and savings bonds are
  stale; the code earns its place.
- **The paper post-pass, hand-lettering, footprints, region streaming,
  the ink-in cascade.** All load-bearing.
- **No faces on doodle-folk** — kept, because it forces expression
  through posture and that is what makes the folk work. The rule as
  written was already violated by `characterSheet()`'s two dot eyes, so
  Session 4 re-worded it in QUALITY-BAR §3: *the walker has two dots;
  nobody else has a face.* ✓

### Parked

- **Blots as caves** (owner decision, 2026-08-28: skip until the story
  needs them). The `BLOT` palette (black ground, white marks) is
  unused and would give us a spectacular inversion — but *skip it until
  a story gives it a reason*. Skyrim's caves are its weakest content
  because they are generated; if we ever ship blots, every one is
  hand-authored or we do not ship them.
- **Character skins** (`skin: 'b'`, the flat cap) — margins' second
  character. Harmless; revisit when the story picks its protagonist.
- **Expanding the sheet.** 760×560 is more than we can fill at this bar.
  When the time comes it needs its own design conversation, because the
  one-sheet metaphor is doing real work.
