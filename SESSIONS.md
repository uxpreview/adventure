# SESSIONS — the handoff log

## 2026-08-31 — owner direction, after Session 11 merged (no code)

**THE FEEL GATE WAS RUN AND IT RETURNED NOT YET.**

`QUALITY-BAR.md` §2 has listed two gates as the owner's since Sessions 8
and 9, on the grounds that no tool in this repository can perform them.
The owner played the merged build and reported, verbatim:

> *"the desktop camera movements make it hard to play — makes me kind of
> sick — and you can also the mobile controls exists on desktop as well,
> and the keyboard controls lack the ability to run."*

All three were reproduced against `bc174a5` before this entry was
written. They are diagnosed in full in `PROMPT.md` §1; the short form:

| defect | measured |
|---|---|
| **the camera** | driven round a normal circuit from the spawn, the frame swings **43°** for one change of mind about which way to walk, at up to **20°/second**, while the camera dollies **8 units** in and out and its height wanders |
| **the joystick** | a mouse drag at 1280×720 raises the touch stick's ring under the cursor (`joy active running`, 96×96, opacity 1). The only guard in `Input.ts` is an ASPECT-RATIO test, and aspect ratio is not the question — pointer type is |
| **the run** | the wiring is intact. Shift is read, `input.run` climbs, and the walker measurably goes **1.46×** faster. What is broken is that the only place the game says Shift exists is a six-second hint fired once, and the only *visible* run affordance in the game is the phone stick's ring — which on desktop is the defect above |

### AND THE THING WORTH MORE THAN THE FIX

**Every automated check stayed green while all of that was true.**
`check-camera.mjs` still asserts, correctly, that the envelope never
leaks, that the bearing is continuous round the whole circle of travel,
and that a stopped walker comes home to exactly zero in 2.5 game
seconds. Session 9 wrote in its own log that none of those was the
question. It was right, and then the question went unasked for three
sessions.

What no check ever measured is **the RATE** — how fast the frame can
rotate, in degrees a second, under an input a player can produce. That
is the number the owner felt. It is the assertion Session 12 owes.

`QUALITY-BAR.md` §2 now carries the corollary this earned:

> **A system whose gate has not been run is not done. It is SHIPPED AND
> UNJUDGED, and those are two different words.** A green check is
> evidence that the thing does what its author described. It is not
> evidence that what its author described is worth doing.

And the cheaper half of the lesson: this was found in an afternoon of
play by the one person who had never been asked to play, three sessions
after it shipped. **The gates this project cannot run should be handed
over the week they are owed, not carried in a list.** The EAR GATE is
still in that state, and it is now twenty-five WAVs and an authored
silence deep.

### THE LADDER IS RE-CUT, BY THIS PROJECT'S OWN LAW

`PLAN.md`'s ordering rule — *systems that change how a land is authored
must land before the lands are authored* — decides it. The camera is the
most load-bearing example of that rule in the file: every composition in
this game is framed through it, and THE SHOT of all eight built lands
was chosen by looking down it. Three more lands built on a camera that
has to change is three lands re-opened, which is the exact mistake the
rule was written after Session 3 to prevent.

- **12 — THE HANDS AND THE EYE** (was: three lands). Fix all three
  defects, assert the missing rate, prove the resting composition did
  not move.
- **13 — THE NOW**: MAPLE COURT + GREYLINE CITY.
- **14 — THE 8:15**: THE CUBICLE MILE, its wait, and the mount.
- 15 the paper plane, 16 motion & life, 17 the juror.

Session 11 had already recommended splitting 12 on scope grounds; that
split is taken as well.

**One constraint makes Session 12's work checkable and it should be
stated here because it is easy to miss:** a stopped walker is due north
by contract, and **every protected framing is shot standing still with
the bearing pinned.** A correct fix to the MOVING camera should
therefore come back from `diff-sheets.mjs` at **92 of 92 bit-identical.**

## Session 11 — 2026-08-31 — the dry lands

*Two lands, two waits, two named inhabitants — and the first session in
this project to MOVE A LANDFORM. The tear was a good cut in the wrong
place, and the land named after it had been built round the fact that it
was somewhere else.*

### THE ONE THING TO KNOW: THE LIST IS A SIGHTLINE

`THE-WAITS.md` §4 gives HOLT a boat, upside down on trestles, oiled, at
the top of a dry channel, and a set of marks up the wall behind it — and
the turn is that **they are not flood records. They are a list, in the
order things would float**, and he has written it where he can check it,
and he keeps the boat oiled at the bottom of it where it would go first.

A session before Session 10 would have written that in a note. It is a
composition instead. Stand on the channel floor and look north:

| you see | at | which is |
|---|---|---|
| **the boat**, keel up, oiled | 1.2 up | the lowest chalk mark |
| **the trestles** under it | 2.3 up | the second |
| **the shed's ridge**, forty units down the channel | 4.8 up | the third |
| **the lip of the canyon**, which is in the frame | 12.6 up | the fourth |
| **a fifth mark**, chalked on the rock ABOVE the wall | ~16 up | `THE-STRANGERS` U20: *one mark is above the lip, which means it is not a flood mark* |
| **HOLT'S HOUSE**, on the rim behind it | | what the fifth mark is the height of |

**Four heights that line up with four things you can see from where the
marks are read, and a fifth that lines up with a roof.** There is no
note on the marks, no number, no scale and no label anywhere in the
land. The art director assembled the list before reading a word, and
there is not a word to read.

And the ink technique is what makes it legible: **everything in
SPLITROCK is drawn in strokes down the page** — the terrain hatches a
cliff down its fall line and a torn edge has fibres rather than strata —
so the five chalk strokes are the only marks in a hundred and fifty
units of canyon that go ACROSS anything. In a land of verticals, a
horizontal reads as writing. **THE BLEACH FLATS next door are drawn
entirely in level broken dashes**, for the same reason from the other
end: the pair is a hole in the page against the flattest ground in the
world and they are drawn at right angles to each other.

### THE DECISION THIS SESSION TOOK FIRST, BEFORE A SINGLE PROP

**THE TEAR WAS REAL AND IT WAS IN THE WRONG PLACE**, and the prompt was
right that doing neither of the two available things is what the draft
already did.

Session 4 cut it at `tearX(z) ≈ 338`. The world's curled east margin
starts lifting at x = 344, so the rip ran six units from the foot of the
rim; the tear only existed between z ≈ −272 and −132; and the canyon
trail — the only way into that land — ran at x = 255..305 and never came
within thirty units of it. **The land called SPLITROCK had its split
jammed into its own east gutter.**

It is at **x = 300** now, the middle of its own rect, and every
consequence was audited rather than assumed:

- **the mouth is a sixty-two-unit RAMP and the head is a fourteen-unit
  WALL.** A tear starts shallow and deepens, so there is **no stair to
  author anywhere in this land** — you walk in at the shallow end, the
  walls rise either side of you, and the walk ends in front of you at a
  face of rock. That is the metaphor paying for a traversal design, and
  it is the third time the sheet's vocabulary has paid this project back
  and the first time it has paid in traversal.
- **the floor went from twelve units wide to eighteen**, which is the
  narrowest a slot can be and still hold a boat, a shed, a man and a
  walker without any of them standing on a cliff.
- **the amplitude went from −13.0 to −13.75**, and the third decimal is
  load-bearing: `check-terrain` measures the floor at the axis and the
  accumulated `smax` bias and the local cockle differ at x = 300. **It
  still prints −10.8.** `THE-STRANGERS` S5 is an errand about that
  number — *ten point eight units from lip to floor, taken twice, with a
  line* — and it was not this session's to spend.
- **`RIVER[0]` moved from (318, −108) to (296, −116)**, so the water
  still rises at the canyon's MOUTH, six units south of where the rip
  begins. That relationship is `THE-WAITS` §4 already true in the height
  field and it was never a bug. It cost eighty-eight pixels on a
  protected framing — see the regression section, which measures it.
- **`tearFloorK` → `terrain.ts`**, the twin of Session 5's `holdfastK`:
  the channel floor is painted as a dry bed rather than as canyon, so a
  walker on the west lip can see that the channel is a channel.

**What did not change: the depth, the vocabulary, the bearing.** `tearX`
is a function of z, so the canyon runs north–south and the camera's law
is obeyed by the ground itself. That is most of why the landform was
worth moving rather than re-cutting.

### THE ONLY ROAD IN SPLITROCK IS A RIVERBED

The Penwood said its fable in `layout.ROADS` and this land says its own
in the same place. The canyon trail comes up out of the Flats, **rounds
the head of the river** — there is no bridge on this water and a river
with no bridge is a wall, so going round the top of it six units from
where it comes out of the ground is the only way into this land on foot
— drops down the mouth, and then **every point from z = −136 north is
`tearX(z)` sampled at eight-unit intervals.** It is not following a
route; it is lying in the bottom of a channel, and paper does not tear
straight. It ends, dead, at a wall.

And the geography teaches one thing by making you walk it: **the east
bench is thirty units away across the channel and the only way onto it
is all the way back to the mouth and round.**

### WHAT SHIPPED

**SPLITROCK CANYON** — `design/specs/splitrock-canyon.md`. Six places:
THE RIVERHEAD, THE TOP OF THE CLIMB (somebody's boots, side by side —
`THE-STRANGERS` C20), THE MOUTH, THE OVERLOOK, THE NEEDLE ARCH, THE
TRESTLES. Three placement registers and every drawing knows which it is
in: the wall's toe, the skyline, the floor.

**THE BLEACH FLATS** — `design/specs/the-bleach-flats.md`. Six places:
THE HANDS (a signpost with four arms and **every one of them points out
of this land**), THE PALE, THE OASIS, THE TRACK, THE CATCH, WHERE THE
ROAD STOPS.

**THE GROUND, authored not sprinkled** (`elevation.ts`): the tear moved
and reshaped (above), and **THE PAN** — the Flats' one shape, a dish
ninety units across and a unit and three quarters deep, bounded hard on
all four sides at x = 332. The oasis sits at the bottom of it and
**Amos's cistern sits on its rim**, which is what makes the forty units
he carries every night forty units UPHILL, both ways. Nobody will ever
measure that and it is true anyway.

**THE TWO WAITS, END TO END.**
- **HOLT** (`THE-WAITS` §4) is at the boat from six to eight, oiling,
  with a stretch in the middle of the day at the foot of the wall with
  his head back; at night he is not there and there is a light on up on
  the rim. **He straightens when you come inside fifteen units**, which
  is the land's one player-responsive motion and is a man stopping work
  because somebody is walking up his channel, which out here has not
  happened in a while. Hold `route:the-river` — rowed salt to source,
  under all three bridges, which nothing else in this world has done —
  and the boat is off the trestles and right way up on the dry floor,
  bow north, in every later save. The game never says whether that is
  madness or readiness and neither does the drawing.
- **AMOS** (`THE-WAITS` §5) is on the track from half past eight in the
  evening to half past four, the whole time: down empty, back with two
  full cans, and again. `THE-STRANGERS` C21 is a player meeting him
  going the other way and **the only way to make that happen is for it
  to be true.** In the day he maintains a machine that has never worked:
  the gutter runs downhill FROM the cistern (U23), so it could not have
  delivered a drop, and the board beside it is ruled into columns with
  nothing in any of them (U22). Hold `fact:the-fold` and the lid comes
  off and stays off.

**`fact:the-fold`, AND IT DID NOT EXIST.** `THE-WAITS` §0 has said since
Session 7 that THE BLEACH FLATS turn on it, *earned by walking the
crease, both faces* — and there was no such id anywhere in the source
and nothing that taught it. **Amos's wait had a dependency nobody had
built.** It is a two-post route in `knowledge.ts` now, on the crease's
two shoulders at the place the east road dives through it, reach eleven.
The kind is a FACT and the mechanism is a ROUTE, which is the one id in
that file whose prefix does not match its mechanism and it is on
purpose: a fold has two sides and the whole of the fact is that you have
been on both of them, which a proximity test cannot say. **It adds no
geometry to THE COMMON and none to THE HARROW DOWNS**, which is
deliberate twice over — both hold verdicts, and `crease-east-road`
stands sixteen units from the southern post.

**SIX VOICES** (`Audio.event`, App's ambient scheduler), and between
them they say the one thing the beds cannot: **the canyon is a ROOM and
the Flats are not.** `slot-wind` (a slot is a pipe with one end open, so
the wind has a NOTE rather than a hiss), `hull-rag` (the only made sound
in SPLITROCK, and the only evidence at forty units that anybody is doing
anything), `stone-fall` (C19 — *a rockfall you hear and do not see*, and
it is never drawn); `palm-rattle` (the only sound in the Flats made by
something alive, and **you hear the oasis before you can see the
water**), `can-knock`, `grit-run` (which arrives from one side and
leaves by the other and does not come back).

**AND ONE PLACEMENT RULE THAT IS THE WHOLE OF C22.** The oasis's palms
are massed on the NORTH shore, so a player who walks off the east road
and comes at it from the north finds a stand of trees with nothing under
them and no water anywhere. `THE-STRANGERS` C22 is *the oasis, from the
wrong direction, and it is not there*, and it costs nothing but a
decision about which side the trees are on. **The land teaches you that
you came at it from the wrong side**, which is the belief of the place
said without a note.

### THE GATE

- `check-terrain.mjs` ✓ · `check-audio.mjs` ✓ · `check-camera.mjs` ✓
- `check-fields.mjs` ✓ — **and it gained both new lands**, because both
  carry a field whose instances are re-set from an update loop every
  frame (the grit, the tumbleweeds), which is the exact shape of the bug
  that file was written for.
- `diff-sheets.mjs` — see below, and read it before you assume anything.
- **critique-art-7: WOWED at round 6.**

### THE REGRESSION NUMBER, AND WHAT IT ACTUALLY SAYS

`node tools/diff-sheets.mjs`, ninety-two framings against `origin/main`
(c853988), bearing pinned, twelve game seconds of settle:

```
THE PAGE (the world, writing hidden):
  80/92 bit-identical, 12 over 0.000%
   72.0117%  max 235  desktop/tear-lip@12           at 0,0,1280,720
   66.1272%  max 197  desktop/tear-lip@19.6         at 0,0,1280,720
   53.5029%  max 232  portrait/tear-lip@12          at 0,161,390,683
   46.8414%  max 187  portrait/tear-lip@19.6        at 0,161,390,683
    4.1897%  max 105  desktop/curl-rim@19.6         at 0,126,1255,456
    3.5014%  max 129  desktop/curl-rim@12           at 0,126,1280,519
    3.1438%  max 104  portrait/curl-rim@19.6        at 0,221,383,264
    2.5948%  max 116  portrait/curl-rim@12          at 0,221,390,300
    0.0095%  max  39  desktop/crease-east-road@19.6 at 632,190,648,347
    0.0093%  max  30  desktop/crease-east-road@12   at 631,190,649,347
    0.0052%  max  33  portrait/crease-east-road@12  at 184,529,18,27
    0.0046%  max  27  portrait/crease-east-road@19.6 at 186,311,16,245
```

**Nineteen of the twenty-three protected framings did not move by a
single pixel, at either hour, in either viewport.** Three moved and each
one is named, measured and accounted for:

- **`tear-lip` (312, −140): 72%, the whole frame, and there is no honest
  way to make that a small number.** The framing stands INSIDE
  SPLITROCK, and this session moved the thing it is named after. Its
  verdict is `critique-art-3`'s — the sheet's ELEVATION, awarded on the
  tear reading as a torn page with proud lips and a floor. Shot side by
  side: the base stands beside a mesa cutout with the old tear mostly
  out of frame; the head stands on the **east lip** of the new one with
  the cut falling away on the left, its floor visible the whole length,
  the arch spanning it forty units north. **It is still a lip, it is the
  same landform in the same vocabulary at the same depth, and the
  framing's own name is finally true.**
- **`curl-rim` (370, 16): 4.19%, and its own ground is untouched.**
  Nothing in `elevation.ts` reaches it — THE PAN is bounded hard at
  x = 332, thirty-eight units short of the walker's footing, and the
  curl terms are not touched. What moved is what is drawn ON it and
  BEYOND it, and both are THE BLEACH FLATS: the draft's sixty dune
  decals and forty-two cacti deleted and the land's ground script laid
  in their place, and the old canyon's mesas off the horizon replaced by
  the new one's stacks a hundred and forty units north.
- **`crease-east-road` (62, 62): eighty-eight pixels, and the cause is
  provable.** It is the ONLY change in this session that reaches west of
  x = 230, because every prop either land authored is east of x = 236.
  It is the river: moving `RIVER[0]` shortened the polyline from **753.0
  units to 750.0**, which re-parameterises `riverBed(t)` along its whole
  length by **sixteen thousandths of a unit at its worst** (the east
  road bridge), falling to four at the sea, still monotonic. What that
  framing can see of it is the channel forty-eight units away at the
  right edge of frame. **The verdict was awarded on the FOLD**, and the
  fold is at x = 85 under the walker's feet and is pixel-for-pixel what
  it was.

Four more moved only in THE WRITING (`portrait/tide-line@19.6`,
`portrait/curtain-wall` at both hours, `portrait/common-THE-SHOT@19.6`),
which is the DOM card mid-fade — the one clock the harness does not own,
and the same four-frame class Session 10 reported.

### THE PAPER PLANE IS DEFERRED, IN WRITING, AND HERE IS THE WRITING

`WORLD-SYSTEMS` §4 gives the wilds the paper plane and `PLAN.md` says
mounts arrive with their quadrant's land session. Session 10 built the
wilds' northern half and did not take it; **this session built the
wilds' eastern half, which contains the two best launch heights in the
world, and did not take it either.** That is two sessions, and the
prompt was right that a third silent slip is not acceptable.

**Why:** the scope was two lands, two waits, two named inhabitants, a
MOVED LANDFORM (a layout-wide audit across elevation, the road web, the
river, the reachability proof, two protected framings and the map), and
one piece of missing content-system plumbing the design had been
assuming for four sessions. A mount is a traversal system with a launch,
a flight model, a refusal rule and a camera; the rowboat was half of
Session 6. **The bar says a session that cannot meet it ships less
scope, never a lower bar**, so this is less scope, said out loud.

**The brief it is handed with**, so nobody re-derives it: it launches
from the east lip of the tear or from the curled rim above it (both are
authored ground now and both hold about eight units of drop into open
air); it refuses being steered *mostly*, which means one input and it is
not a rudder; it is found in the world and left in the world; and **the
one thing it must not do is trivialise the walk back round the canyon's
mouth**, which is the geography lesson SPLITROCK teaches by making you
walk it.

**It goes to Session 12b or Session 13, not to Session 12** — see the
next section.

### AND SESSION 12 IS THREE LANDS, WHICH SOMEBODY HAD TO SAY

`PLAN.md`'s own rule is that *the session that notices should say so
rather than the one that runs out of room.* Session 10 and Session 11
were two lands and two waits each, and both spent a full third of their
budget on the gate rather than on the building — this one ran six rounds
and threw away an entire placement plan in the middle of them. Session
12 as written is three lands, three waits, three named inhabitants,
THE LINE's riskiest un-shot framing, and **the 8:15 drawn into
existence**, which is a mount and the payoff of the whole story.

`PLAN.md` now carries a proposed split (12: MAPLE COURT + GREYLINE CITY;
12b: THE CUBICLE MILE and the 8:15) with the reason for the cut.

### For the next land session — read this part

- **THE TEXTURE SHEET FIRST, THE WORLD SECOND, AND IT IS NOT CLOSE.**
  Round 1 of this gate never rendered the world at all and found six
  classes of fault in four seconds. Round 2 found six more. The world
  sheet then cost seven minutes a round.
- **`stroke()` ROUNDS EVERY CORNER YOU GIVE IT.** It draws quadratics
  through the midpoints of its points — right for a hedge, a hull and a
  tree, and it turns any polygon of straight runs into a lozenge. The
  first texture sheet was a canyon full of domes, a shed like a haystack
  and a cistern like an egg. Both new texture files carry a `hardPoly()`
  that draws an edge as an edge. **Paper does not tear along a curve is
  a rule about the DRAWING as much as about the height field.**
- **NOTHING STANDS ON A SCARP, INCLUDING THE THING THE SCARP IS MADE
  OF.** Round 3 stood wall panels up both faces of the canyon at half
  their height and built a tunnel with the ends bricked up. The terrain
  hatches a cliff down its own fall line and does it better than a
  cutout can; what the floor needs from the prop box is the near layer
  the ground cannot give it.
- **THE CAMERA IS FOURTEEN UNITS BEHIND THE WALKER, SO EVERYTHING
  BEHIND THE WALKER IS IN FRONT OF THE CAMERA.** The Bleach Flats' rain
  catch stood on the track's line eight units north of the cistern and
  THE SHOT came back as a close-up of a boarded deck.
- **A FADE DRAWN AFTER A MARK ERASES THE MARK.** The doorstep — the
  highest of the four chalk marks and the one the whole fable turns on —
  disappeared into the crown gradient that softens the slab's top edge,
  and it is the one fault on this sheet that would have SHIPPED, because
  it is a thing that is missing rather than a thing that is ugly.
- **A PERSON CROUCHING READS AS AN ANIMAL AT FORTY UNITS** if their head
  goes below their hips. And a figure in this world is CLOTH FIRST: a
  filled coat, a real head, limbs with pen in them. Two stick figures
  went into round 1 and neither survived it.
- **A RADIAL STAIN ON A TILE THAT REPEATS ALONG ITS OWN LENGTH DRAWS A
  ROW OF DISCS.** Session 10's `stain()` rule has a second half: a
  worn path is a strip, so its colour is a linear gradient across it and
  uniform along it.
- **CHECK WHICH WAY YOU ARE FACING BEFORE YOU BOOK THE FRAMING.** North
  is −Z. Two framings on the first sheet photographed the back of the
  walker's head.
- **AND SOME CONTENT CANNOT BE PHOTOGRAPHED STANDING STILL.**
  `THE-STRANGERS` C22 is a thing that happens while you walk AWAY from
  something with the camera looking the way it always looks. It is a
  DRIVEN framing or it is nothing.

### Standing debts, carried

- **WHERE THE ROAD STOPS** (THE BLEACH FLATS) passed and was not
  praised: two posts and some cracked ground at the end of the longest
  road in the world. It is the sixth place in a land that had five.
- **The stooked field** and **the Penwood's east arc** (Session 10).
- **The rowboat's first meeting at THE RIVER MOUTH** — **five** gates
  have now passed it without praising it. *(It matters more than it did:
  `route:the-river` is what resolves Holt, so that boat is now the front
  door of a wait.)*
- **Brim Square is full.**
- **READ THE PROCLAMATION** on Greyweather's barbican is a compromise.
- **Holt's lit window** is one warm pixel at forty units; it is the only
  lit window in the east half of the world and it deserves a glow.
- **THE EAR GATE and THE FEEL GATE are still the owner's**, and this
  session added six more sounds nobody has heard to the first of them.

## Session 10 — 2026-08-30 — farm & forest

*The first of five land sessions in a row with nothing structural left
to interrupt them, and the first session in this project that could
build a land against a page it could prove had not moved. Two lands,
two waits, two named inhabitants, and one geometry that says the whole
of one of them without a word.*

### THE ONE THING TO KNOW: THE PENWOOD HAS ONE ROAD AND IT IS A CIRCLE

`THE-WAITS.md` §7 gives BRACK a fear and a fact about it: he will not go
within forty units of the tarn, he has walked its circumference for
forty years, and *the forest track is his path — worn by one man's
caution, hardened into a road, then used by everybody after him, none of
whom were afraid of anything.* The turn is that **the geography of a
whole land is one person's superstition that outlived being a
superstition and became the way things are done.**

Sessions before this one would have written that in a note. It is in
`layout.ROADS` instead:

- the track from Brim's Wood Gate runs in and **stops** at the ring's
  south-west corner;
- **BRACK'S ROUND** is a closed polyline at forty-two units' radius
  around the tarn (forty-two, because the chords sag: the road's
  centreline is at forty and a half at its nearest, which
  `check-terrain.mjs` now asserts);
- and there is no other road in the Penwood at all.

Everybody who has ever crossed this wood has walked part of a circle
round a pond and gone back the way they came, and not one of them has
ever thought that strange. **The map draws roads. The map says it.**
Nothing else does — not a note, not a label, not a line of prose. The
art director's round 5 read the shape off the map unprompted and called
it the best thing in the project.

Four more facts carry it and none of them is written down either:
**the wear on the track is heavier on the water side** (U18, implemented
as an asymmetric decal turned to face the tarn); **the pines lean away
from the tarn, all of them, everywhere in the land** (U17, implemented
as a placement rule — a pine's flip is decided by its bearing from the
water, so the lean is perfectly radial round one pond and perfectly
consistent across a hundred and seventy units of wood); **the biggest
trees in the wood are the ones inside the forty**, because nobody has
ever dared cut them; and **inside twenty units of Brack the ambient
stops**, which is the only silence in the game.

### What shipped

**THE HARROW DOWNS** — `design/specs/harrow-downs.md`. Six places: THE
MILL (rebuilt as a tower mill with its sails on their own quad so they
can turn), THE HEADLAND (Joan's table, laid for two), THE HOME FIELD,
THE FORD, THE DROVE, THE SCARECROW. Eleven authored FIELDS as polygons,
each carrying exactly one state — standing corn, stooked, stubble,
ploughed, fallow, grazed — with no two neighbours matching, hedged along
the harrow's grain.

**THE PENWOOD** — `design/specs/the-penwood.md`. Five places: THE WOOD
ROAD, THE OARS (Hallows, and the game will never say eleven), THE ROUND,
THE TARN, THE DEEP PINES. Four authored stands of different ages with
the voids between them doing as much work as the trees.

**THE GROUND, authored not sprinkled** (`elevation.ts`):
- **THE HARROW** — the land is named for a thing that rakes a field into
  parallel lines, and until this session that was a word on a signpost.
  It is now the ground: five or six low ridges forty-six units apart
  running north–south with a wander in them. It gives the land a GRAIN
  that runs the way the camera looks, it lets the field plan be laid one
  field per fold, and you crest one every forty paces. **It starts east
  of the crease**, which makes the fold the Downs' west wall and keeps
  every unit of it clear of the protected `crease-east-road` framing's
  own ground.
- **THE MILL RISE** — a windmill stands on the highest ground it can
  find, because that is what a windmill is for, and this one stood on a
  swell whose crest was forty units west of it.
- **THE TARN'S BOWL** — three and a half units of fall from the ring
  road down to the water over twenty-six units. Without it the tarn was
  invisible from anywhere but its own rim, which is fatal for a land
  whose one composition is a look at it from forty units away.

**THE FORD** (`layout.FORDS`, `Terrain.blockedAt`) — the mill lane
crosses the river. Deliberately **not** a fourth bridge: a ford changes
the BED (raised, so the water shallows and pales over it) and what the
page REFUSES, and **not the waterness** — because `rowableAt` reads that
number and `route:the-river` is salt to source under every crossing.
Reduce the water at a ford and the rowboat runs aground in the middle of
the Downs. You can see exactly where it is: it is where the river goes
light.

**THE TWO WAITS, END TO END.**
- **JOAN HARROW** (`THE-WAITS` §10) works her field from six to eight,
  stands at the headland over the middle of the day with her hands at
  the small of her back, and the second setting is **put away every
  evening and laid out again every morning**. Sit down once
  (`fact:the-place-kept`) and it is laid at every hour, in every save,
  forever. The register is the point and it is the only one in the game
  that is not wry: there is no joke anywhere in that land, and the
  drawings obey it as well as the notes do.
- **BRACK** (`THE-WAITS` §7) paces about twenty units of the ring's south
  arc facing the water the whole way, in one of two drawings. Go to the
  tarn — inside twenty units of it, which is inside his forty, which is
  the one line in this world nobody but the walker crosses — and he
  turns a quarter. One figure, one quarter turn, permanent.

**SIX VOICES AND ONE SILENCE** (`Audio.event`, `App`'s ambient
scheduler): `mill-creak` (louder the nearer the mill, the way the sea is
on the coast), `sheep`, `field-work` (**no voices anywhere in the Downs
— nobody in that land is talking**), `axe-far` (and the wood ANSWERS it,
at a tenth the level, 340 ms behind: the Penwood is the only land
besides the canyon that repeats you), `tarn-drip`, `pine-tick`.

**ONE ENGINE ADDITION, and it is four lines:** `StandeeField`'s `wave` —
one gust crossing a whole field, west to east, one-sided so it arrives
and passes rather than oscillating. The existing `wind` term is
per-instance noise on a spatial hash, which is what grass does; corn
does the opposite and moves in one piece.

### Three tools this session built for itself, and two of them are keepers

- **`tools/shoot-textures.mjs`** — every drawing in a prop box, at
  actual size, on paper, with no camera and no land in the way. Four
  seconds. **This is the single most useful thing in this handoff.**
  Round 1 of the gate had four separate faults in it and it took three
  world re-shoots to work out which drawing was causing which; the
  texture sheet answered all four in one look. Any session that authors
  new art should shoot this FIRST and the world second.
- **`tools/montage.mjs`** — a land on one sheet instead of one frame at
  a time. A fault invisible in one frame (every hedge the same height,
  three brown things in a row, a drove that fords a river) is obvious
  across ten.
- `tools/shoot-farm-forest.mjs` — this session's own sheet, including
  **both states of both waits**, which the harness hands over with
  `learn` rather than making the sheet play the game to get them.

### The gate

- `check-terrain.mjs` ✓ (and it grew two proofs: **THE FORD** — a walker
  crosses, an oar still passes, and it is the only dry-shod crossing for
  forty units either way; and **BRACK'S ROUND** — nearest the water 40.6
  units, it closes, and the bowl is walkable from every side)
- `check-audio.mjs` ✓ · `check-camera.mjs` ✓ · `check-fields.mjs` ✓ (new —
  see the owner's bug below)
- `diff-sheets.mjs` — see below, and read it before you assume anything
- **critique-art-6: WOWED at round 5.**

### THE REGRESSION NUMBER, AND WHAT IT ACTUALLY SAYS

`node tools/diff-sheets.mjs`, ninety-two framings against `origin/main`,
bearing pinned, twelve game seconds of settle:

```
THE PAGE (the world, writing hidden):
  73/92 bit-identical, 19 over 0.000%
    3.2518%  desktop/crease-east-road@12    at 2,139,1278,398
    2.4360%  desktop/crease-east-road@19.6  at 159,149,1121,388
    1.6041%  portrait/crease-east-road@12   at 3,239,387,355
    0.7704%  portrait/crease-east-road@19.6 at 71,239,319,353
    0.1173%  desktop/gate-detail@12         at 1156,159,124,46
    0.0807%  desktop/tear-lip@12            at 0,138,37,74
    0.0171%  desktop/gate-detail@19.6       at 1228,168,52,24
    0.0158%  desktop/common-THE-SHOT@19.6   at 1046,194,149,5
    0.0120%  desktop/common-THE-SHOT@12     at 1055,195,140,4
    0.0095%  desktop/crossroads@19.6        at 1069,196,149,4
    0.0092%  desktop/common-wide@19.6       at 1045,192,112,4
    0.0072%  desktop/crossroads@12          at 1069,196,149,4
```

**Read the bounding boxes, because they are the whole answer.** Every
one of the small ones is four or five pixels TALL: they are strips of
horizon. THE COMMON's protected framings can see to about x = 74 at the
fog limit, and x = 74 is inside the Penwood's south-east corner, so the
Penwood's own edge trees now show on their skyline as a four-pixel band.
`tear-lip` is the same thing from the other side — its left edge reaches
x ≈ 193, which is inside the Penwood. `gate-detail` is a forty-six-pixel
block in the top-right corner, which is the same horizon lower in frame.

**And the big one, `crease-east-road`, was always going to move.** That
framing stands at (62, 62) and looks north, and the right half of what
it sees at distance **is the Harrow Downs**. Its own ground is untouched
by construction: the harrow term starts at x = 96, and Session 4's
`downsA` swell was deliberately KEPT for exactly this reason. Shot
side by side, the fold, both shoulders, the walker's ground, Brim's wall
and the grass at the crease's foot are pixel-for-pixel what they were.
What changed is beyond the crease: **eleven identical cartoon oaks and a
red barn have become the Penwood's edge and a hedged patchwork.**

**Two more moved only in the WRITING pass and not on the page**
(`common-wide@12`, `portrait/common-THE-SHOT@12`), which is the DOM card
mid-fade — the one clock in this game the harness does not own.

**THE RULE IS UNCHANGED, AND THIS IS NOT A LICENCE.** A protected
framing may not move for a session's convenience. When it moves because
the land inside it was the session's scope, the session says which
framing, by how much, where in the frame, and what the verdict was
actually awarded on. Two things were cut from this session to keep that
list honest and short: the harrow's missing east bound (below), and the
Downs' western pasture, which put four-hundred-pixel slivers of new
grass on four of THE COMMON's framings and has been pulled back east of
x = 96 — where the spec said the Downs' west third was a composed void
in the first place.

### AND THE TOOL EARNED ITS KEEP THE FIRST TIME A LAND SESSION RAN IT

The first run came back with **eight per cent of `curl-rim` moved** —
the world's east margin, in THE BLEACH FLATS, a land this session never
opened. The cause: `harrowK = smoothstep(96, 130, x)` and no east bound,
which is **1 at x = 370**. A corrugation authored for one land ran clean
across two others and out onto the curled rim of the page.

Nothing in this session's own contact sheet could have shown that, and
no person comparing two contact sheets a week apart would ever have
found it. **Bound every term in `elevation.ts` on all four sides**, and
run the tool BEFORE you think you are finished, not after.

### AND ONE BUG THE OWNER FOUND THAT NINE SESSIONS OF CONTACT SHEETS COULD NOT

> *"The animals in other locations disappear when you approach them.
> The only ones that seem to be working are in Brim."*

Correct, and it had been true since Session 5.

**Every creature with more than one posture is drawn as one instanced
field per pose with a single instance showing at a time**, and the way
the world hid the other poses was `set(i, x, -4000, 0.001)` — park it
four thousand units away at a thousandth of its size. But `set` RECORDS
the position, `positions` is the field's answer to *where is instance
i*, and `cascadeFrom` reads it to decide when the ink wave gets there.
Four thousand units at the wave's thirty-four a second is a birth
**ninety-seven seconds in the future**, and until its birth the shader
draws an instance at `uGhost` — sixteen per cent — which against paper
is nothing at all.

So every animal in the game went invisible the moment it changed
posture, for the first hundred seconds in each land, which is all the
time anybody spends near one. **Brim's pigeons, Brim's swallows and
Greyweather's rooks were immune only because they are one-off
`ctx.standee` meshes with no birth attribute to get wrong** — which is
exactly the shape of the report.

Nothing in this project could have caught it. A contact sheet
photographs a walker standing still; the bug only fires when a creature
changes pose, and a creature changes pose because you walked at it. It
was found by asking the running page what its births actually were.

**The fix is `StandeeField.hide(i, x, z)`** — drop the instance straight
down under its own feet at zero scale and keep telling the truth about
where it is. Five call sites: the gulls (Longshore), the sheep, the
goat, the field hands and the fallen pines. Plus two things that made
the invariant exact rather than nearly true: unused field capacity is
parked at zero scale instead of merely a thousand units down, and
`cascadeFrom` births the seats nobody sits in.

**And it ships with an assertion, because a bug that survives nine
sessions gets a check and not a comment:** `tools/check-fields.mjs`
drives the walker AT the animals in seven lands and asserts that **no
field is half inked in** — a field is cascaded all at once, so after
thirteen game seconds one with some instances born and some stranded is
the bug itself, wherever it is. Verified both ways: green on the fix,
red at ninety-five seconds on the old idiom.

### For the next land session — read this part

- **AUTHOR THE GROUND FIRST AND THE PROPS SECOND.** THE HARROW took
  twenty minutes and it is why both of these lands compose: it gives the
  camera something to recede along before a single drawing is placed.
- **A DECAL IS A FLAT QUAD AT ONE HEIGHT.** Lay a nineteen-unit floor
  tile on ground that falls five units over twenty-six and one side of
  it buries itself, and the intersection draws a hard straight edge
  across your land. Eleven or twelve units is the ceiling on curved
  ground. Round 4's sheet had the Penwood's foreground faceted with
  them and it took two rounds to work out what they were.
- **NEVER USE A FILLED POLYGON AS A COLOUR.** `fillBlob` is sixteen
  sides and on a decal that TILES you can count all sixteen from a
  hundred units. Both texture files now carry a `stain()` — a radial
  gradient — and every ground colour in both lands goes through it.
- **SHARE DRAWINGS. INSTANCE PLACEMENTS.** Round 4 of the gate was a
  performance round and it was fair: a hundred and forty hedge panels
  each with their own 512×160 canvas is thirty-two megabytes of texture
  for the hedges of one land. Variety comes from the plan and from
  placement. After the fix, the Downs' worst framing is **272 draws /
  3.4 ms** on desktop against **THE COMMON's 350 / 6.4 ms** — the new
  lands are LIGHTER than the oldest one.
- **FULL BALLPOINT PRESSURE BELONGS TO THE FOREGROUND LAYER AND
  NOTHING ELSE.** A twenty-one-unit tree at register 0 that ends up ten
  units from the lens is a hundred individual scratches across a third
  of the frame. The three registers exist so a stand can be built from
  all three at once; the near register is for the eight trunks you
  authored by hand.
- **A CUTOUT RUN NEEDS ITS ENDS ERASED.** A hedge panel is a rectangle
  and a run of them is a row of cards until you fade forty pixels off
  each end with `destination-out`. The same trick fixed the near trunk,
  which was reading as a dark board with a straight top.
- **A HIDDEN INSTANCE MUST STILL SAY WHERE IT IS.** Use
  `StandeeField.hide(i, x, z)`, never `set(i, x, -4000, …)`. And place
  every instance of a field at least once — an instance that has never
  been placed has no position, and anything that reasons about position
  (the cascade, `wakeNear`, `awakeCount`) skips it.
- **AND THE CAMERA'S LAW IS STILL THE LAW.** Every framing that failed
  in this session failed it: a hedge five units in front of the lens, a
  drove laid across a river, a label at a ford printed on a mill forty
  units behind it. That last one is worth remembering — **Session 9's
  skyline lifts a name above what is standing UNDER it, and cannot know
  what is standing BEHIND it.** Height does not solve that. Angle does:
  the ford's POI moved a stride west, to the end of the stones you
  actually step on, and is now twelve to nineteen degrees clear of the
  mill from every viewpoint on the lane.

### Standing debts, carried

- **The stooked field** is the weakest composition in either land, and
  **the Penwood's east arc** is a road through a wood. Both passed,
  neither praised.
- **The rowboat's first meeting at THE RIVER MOUTH** — **four** gates
  have now passed it without praising it.
- **Brim Square is full.**
- **READ THE PROCLAMATION** on Greyweather's barbican is a compromise.
- **THE EAR GATE and THE FEEL GATE are still the owner's**, and this
  session added six sounds nobody has heard to the first of them.

## Session 9 — 2026-08-30 — the bearing

*The last foundations item on the board, taken before the five remaining
lands because building them on a camera you are going to change
afterwards is the elevation mistake a second time. It shipped a camera
that answers travel — and it spent its other half building the thing
`WORLD-SYSTEMS` §2 asked for two sessions ago and nobody had built: a
way to know, by a number, that a protected framing has not moved.*

### The owner's question, and the answer that is not the one on the board

> **Can the camera shift, on desktop and on mobile, so the player can
> always see where they are headed?**

`WORLD-SYSTEMS` §2's standing recommendation was a **bounded yaw easing
toward travel**. It is right about east and west and **wrong about
south, which is the case it was written for**, and the geometry is not
close: the camera trails the walker on the +Z side, and yawing the rig
twenty-six degrees about the walker leaves it on the +Z side. Southward
travel is travel **at the lens**, and no bounded rotation puts a lens
behind itself. Only a free orbit does, and a free orbit is refused
because a paper cutout seen forty-five degrees off-axis is 71% of its
width and this world stops being paper.

So the shipped answer is two components, split by what the walker's
travel is doing to the frame:

> **The part of your travel that CROSSES the frame turns the camera.
> The part that comes AT THE LENS opens the ground at your feet.**

And the split is not tidiness — **it is what removes the wobble.** Point
a camera at the travel bearing and clamp it and due south is a coin toss
between +26° and −26°: a walker weaving either side of the king's road
flips a fifty-two-degree pan back and forth, and no spring constant
fixes a discontinuity. Both components here are continuous everywhere on
the circle, and both are exactly zero for a walker standing still —
which is the clause six WOWED verdicts hang on.

### Shipped

- **THE YAW, and its envelope, which is a number with a reason beside
  it.** 26° desktop, 12° portrait, in `App.CAM` with the standee table
  written above it: a cutout narrows by its cosine, 26° is 90%, 30° is
  survivable, and past about 35° the paper metaphor does not degrade, it
  FAILS, and it fails looking exactly like a bug. **Portrait's is half
  for a different reason** — its frame is **26.5° wide across** against
  desktop's **68.6°**, so the same yaw slides the page nearly three
  times as far. That figure is now written into §8, because every
  portrait rule in this project is a consequence of it and none of them
  had ever stated it.
- **THE ASTERN OPENING, which is what actually answers the walk south.**
  Travel toward the lens makes the camera **give ground**: 5.5 units
  further back and 1.6 lower on the aim, which pitches the page up and
  lays the road the walker is entering out below them. It is
  `riseBack`'s own trick — reveal by DISTANCE, never by pitching the
  subject out of frame — pointed the other way. **The defect in units of
  page:** the bottom edge of the shipped frame meets the ground three
  and a half units in front of the walker, which is eight tenths of a
  second of warning. Live it is **17.5 units**, or three and a half
  seconds.
- **THE PEEK** — `,` and `.` held (the only pair on a keyboard already
  engraved as left and right, and clear of the walking hand, so E stays
  interact), two fingers dragged on a phone, springing back on release.
  **It takes the yaw over rather than adding to it**, so nothing in this
  game — travel, gesture, a road that carries, all at once — can put the
  camera past its rig's envelope. A second finger on the glass cancels
  the walk outright: two fingers are a look, one is a walk, and nothing
  on screen has to say so.
- **THE LEAD**, capped in UNITS per rig rather than held at a number of
  seconds, because portrait's frame is three and a half units wide where
  the walker stands and a lead written in seconds walks them off the
  side of it at a run.
- **`riseAhead` now probes up the LENS's bearing**, which is the first
  session in which "ahead" and "north" are different questions. Probe up
  the walker's travel instead and somebody crossing a valley sideways
  retreats from a hill that is off-camera.
- **AND THE OLDEST VISIBLE DEFECT IN THE GAME IS CLOSED.** It landed
  here because a turning camera moves every label relative to the thing
  it labels: fix it anywhere else and you are fixing it against a
  relationship that is about to change.
  - **THE SKYLINE.** Every standee records its top into a four-unit grid
    as it is built — `ctx.standee` is the single choke point all 163
    one-off stand-ups in this game go through — so a name is written
    above the tallest thing under it instead of at a flat 3.4 units over
    the dirt. "THE CROSSROADS" had been printing across the middle of
    its own 4.7-unit signpost since Session 1. **It is a system and not
    thirty authored numbers**, so it fixes the labels five unbuilt lands
    have not authored yet.
  - **And a screen-space pass.** Labels never land on each other, on the
    prompt, or on the chrome (the HUD buttons and the region card, which
    the world's writing had never heard of — in portrait THE MARKET
    CROSS was lettered straight through `map` and `sound: on`). When two
    collide the FARTHER one goes **up, never sideways**: a caption slid
    sideways is a caption on a different place. And **a name with
    nowhere legible to go is not written at all**, which is the right
    answer and also the honest one.
  - **The prompt moved too** — beside the thing, past its edge as the
    skyline reports it, on whichever side the walker is not. Not toward
    the lens: the thing between the lens and a place you are interacting
    with is usually the walker, and the first version of the fix
    lettered LOOK DOWN THE WELL across their chest.

### And the proof, which was the other half of the session

- **`tools/diff-sheets.mjs` — A REGRESSION IS A DIFF AND NOT AN
  OPINION.** §2 has asked for this since 2026-08-30 and it is a tooling
  requirement nobody had built. It builds a base git ref and the working
  tree, serves both, shoots the twenty-three framings that carry the six
  WOWED verdicts at two hours in both viewports through an identical
  protocol, and counts the pixels that moved — **separating THE PAGE,
  which may not move at all, from THE WRITING OVER IT**, which moves
  whenever a label is deliberately re-placed. One run says both "nothing
  in the world moved" and "these names moved, on purpose, and here they
  are".
- **THE HARNESS OWNS THE CLOCK, and that is the part that makes it
  work.** Two shots of one framing in this project were never the same
  picture, and the reason is not the renderer. FOUR clocks move between
  two shutter presses and every one of them is in every pixel: the paper
  pass's grain and its hand-drawn wobble (hashed off `uTime`, re-seeded
  three times a second — **a one-pixel random resample of every ink edge
  in the frame**), the standee wind, and the ink-in cascade at 34 units a
  second.
  **And then the diff found the two nobody would have guessed.** The
  first run came back with fifty-three differing pixels in a
  fourteen-by-thirty-seven box in the middle of an otherwise identical
  frame, and the box was **the walker's own quiet breath** — eight parts
  in a thousand of its height, a third of a pixel, exactly enough to
  redraw an outline. The second came back with eighty-three of
  ninety-two framings bit-identical and the nine that were not were **all
  four coast framings at both hours**: the sheet's own shader animates
  **the water** off a clock that accumulates from page load and is reset
  by nothing. Neither is visible. Both make a pixel comparison
  meaningless. All five are pinned by `__inklands.setTime`, and
  `__inklands.step` runs a stated number of fixed ticks and renders only
  the last.
  **The settle is now stated in GAME SECONDS and costs one frame**:
  twelve game seconds takes 130–400 ms instead of seventy seconds of
  wall clock, and two runs of a framing come back **bit-identical**.
  That single change is worth more to this project than the camera is:
  every sheet from here can settle past the ink-in cascade, drive the
  walker hundreds of units, and still be repeatable.
- **`tools/check-camera.mjs`** asserts what a photograph cannot: the
  envelope never leaks (72 readings per viewport, travel and peek
  together); the bearing is continuous round the whole circle of travel;
  due south picks no side; a stopped walker reaches **exactly** zero in
  2.5 game seconds; the walk south is measured **in units of page**, by
  firing the frame's own bottom edge at the terrain; and
  `setBearing(false)` pins everything, which is what keeps every
  protected sheet reproducible.
- **`tools/shoot-bearing.mjs`** — the first contact sheet in this
  project that is not a set of stand-stills. Every walk is shot TWICE
  from the same start: PINNED, which is the page as it shipped, then
  LIVE. The pairs sit next to each other in the listing on purpose.

### State
- Build green. `check-terrain` passes, unchanged. `check-audio` passes,
  unchanged. `check-camera` passes (new). `diff-sheets` — see the
  numbers in `critique-camera-1.md`.
- **No geometry, no layout, no elevation, no texture, no region file was
  touched**, except `regions/index.ts` gaining the skyline recorder.
- `shoot-lib.mjs` now **pins the bearing by default**; a sheet opts in
  with `shoot({ bearing: true })`.
- **Gate: WOWED** after 3 rounds (`design/critiques/critique-camera-1.md`,
  verbatim), plus the two machine gates.
- **AND THE NUMBER THE WHOLE SESSION IS FOR: `diff-sheets` returns
  92 OF 92 FRAMINGS BIT-IDENTICAL ON THE PAGE.** Not within a threshold
  — zero pixels moved, in the twenty-three compositions that carry six
  WOWED verdicts, across six lands, at noon and at dusk, on a monitor
  and on a phone. Fifty of the ninety-two differ once the world's own
  writing is put back, and every one of those is a name or a control
  that moved on purpose.
  **The baseline is a CONTROL BUILD** — a local commit off `2ed1147`
  with the shipped camera, the shipped labels and every clock pinned —
  because the pins are part of this session's own change and a base
  without them could never have proved the four coast framings anything.
  The recipe is in the critique. **From Session 10 it is unnecessary:**
  `origin/main` will carry all five pins, so `node tools/diff-sheets.mjs`
  with no arguments is the tight run from here on.
- **AND ONE GATE IS THE OWNER'S, and this session could not run it.**
  A camera is not a picture. Every number above can be asserted and not
  one of them is the question, which is **whether it helps or whether
  the world wobbles** — a thing a person feels over minutes of walking.
  The walk-south capture is the evidence, every station shot twice so it
  is a comparison rather than a cold judgement. QUALITY-BAR §2 now
  carries this as a standing rule beside the ear gate.

### And what the sheet and the diff sent back

Three findings came off the first bearing sheet and the first regression
run, and all three are logged in `critique-camera-1.md` with the fixes:
**the water clock** (above); **the prompt could be lettered off the edge
of the frame** — "READ THE SIGNPOST" read "D THE SIGNPOST", because the
screen-space nudge was applied after the viewport clamp; and **the clamp
is a nudge and not a parking space** — it had been taking places BEHIND
the camera and lettering their names into the corner of the frame, so
THE CUT sat across the bottom-right of the coast sheet like a watermark.
A label that is not really in the picture is no longer written, which is
the rule the collision pass already followed.

**And the last unseeded randomness in the drawn world went with them:**
one `Math.random` deciding how far down the beach LONGSHORE's gull flock
settles. Every flight still carries them a different distance; it is now
the same different distance every time you walk it.

### Gotchas (new; Sessions 1–8 all still apply)
- **THE GRAIN IS A CLOCK.** `PaperPass`'s `uTime` drives a per-pixel
  hash that resamples the frame by up to a pixel and re-seeds three
  times a second. Any pixel comparison between two frames is meaningless
  until it is pinned. It is the single largest source of noise in this
  renderer and nothing had ever noticed, because nothing had ever
  compared two frames.
- **AND SO IS THE WALKER.** `Character.idleT` accumulates from page
  load, not from anything the harness controls. Anything that has to be
  reproducible resets it (`Character.setClock`).
- **A SETTLE IN MILLISECONDS IS A LIE IN THIS SANDBOX.** Three and a
  half frames a second with `dt` clamped at 0.05 means a 900 ms settle
  is four frames — a sixth of a second of game time, against an ink-in
  cascade that takes eight seconds to cross a land. Every framing shot
  before Session 9 was shot on a page that was still drawing itself.
- **`check-terrain.mjs` DELETES `.tmp/` WHEN IT FINISHES.** Anything
  else keeping scratch files there loses them mid-session. (The
  `.tmp/`-can-vanish note in Session 8 was this, and now it has a
  cause.)
- **A CAMERA THAT EASES TOWARD A BEARING HAS A DISCONTINUITY AT THE
  ANTIPODE**, and it is not a tuning problem. If a later session ever
  reopens this: the fix is not a spring, a deadband or hysteresis, it is
  not asking the question that way.
- **AN EXPONENTIAL EASE NEVER ARRIVES**, and neither does a
  decelerating walker: the snap-to-zero has to test what the camera is
  being ASKED for, not whether the ask is exactly nothing, or it never
  fires and a stopped walker is never quite in the shipped composition.
- **A PINNED CONTROL MUST NOT BE NUDGED.** The interact prompt is
  floated on a wide screen and PINNED centre-bottom on a tall one; the
  first version of the prompt-placement fix applied its screen-space
  offset to both, and moved a thumb target.
- **`getComputedStyle(el).opacity` is how you ask whether a faded-out
  overlay is really there.** A hidden HUD still has a bounding box.
- **AND A CSS SELECTOR IN A HARNESS IS UNTESTED CODE.** The first
  regression run hid `#labels` — which is a CLASS, not an id — so it
  matched nothing, and every deliberately re-placed label was silently
  scored as a regression of the world. A hiding selector that matches
  nothing looks exactly like a hiding selector that works.
- **THE ONLY HONEST BASELINE IS A CONTROL BUILD.** The regression diff's
  base has to differ from the head in ONE thing. `2ed1147` could not pin
  the water clock, because that pin is part of this session's own change,
  so the four coast framings could never have been proved unchanged
  against it. The final run is against a local commit off `2ed1147`
  carrying the clock pins and nothing else — the shipped camera and the
  shipped labels, fully pinned.

## Session 8 — 2026-08-30 — the score

*A systems session, and the first one whose product cannot be
photographed. `WORLD-SYSTEMS.md` §9 was the architecture and this
session did not re-open it: it built the two missing voices, gave
twelve lands an instrument and a room, made the border a crossfade —
and then spent its second half on the part nobody had ever done in this
project, which is WORKING OUT HOW ANYBODY KNOWS.*

### Shipped

- **THE INSTRUMENT BOX IS FIVE VOICES AND THEY ARE FUNCTIONS.** The
  enabling refactor, taken first exactly as the brief advised: a voice
  is `(ctx, dest, freq, t0, opts)` and never touches `this.ctx`,
  `currentTime` or a timer. That is what makes an offline render
  possible at all, and it is half an hour done in that order.
  - **THE PLUCKED STRING** — Karplus–Strong, and it is **rendered into
    a buffer rather than wired as a delay fed back on itself**, for one
    hard reason: *a feedback cycle in Web Audio is floored at one render
    quantum (128 samples), so a wired version cannot play a note above
    about 340 Hz* — and half this world's scales live above that. It is
    also cheaper: half-rate, one buffer per pitch, seeded FROM the pitch,
    so every string is its own string and it is the same string every
    time you pluck it. Variation comes from the hand: a few cents of
    playback rate and a different body.
  - **THE BOWED VOICE** — a saw through a resonant lowpass, and the
    ATTACK is the whole instrument. Everything else in this box starts
    at its loudest; this one arrives.
  - **And §9's own arithmetic was off by one** — two voices left, not
    three. Fixed in §9 while passing.
- **TWELVE LANDS, FIVE INSTRUMENTS, FIVE FAMILIES** (`LAND_VOICE`,
  authored as a table beside `MOODS` with instrument, register, trim and
  **the reason in one line each**). What you wake to is the music box
  (THE COMMON and MAPLE COURT, an octave apart); what grows is the
  plucked string (THE PENWOOD damped and dark, THE HARROW DOWNS the same
  wood out in the light); what was cast and hung up is struck metal
  (BRIM'S belfry, the buoy on the mark, and struck stone in SPLITROCK);
  what stands still is the bowed voice (GREYWEATHER, and THE CUBICLE
  MILE, which is the same held voice **on hold**); and what moves
  without being touched is air (the sea at LONGSHORE, warm air off a
  grating in GREYLINE CITY, and the top of the page in THE BLEACH
  FLATS). **The world plays it** — §9's decided source — so every one of
  those is a thing that is actually there.
- **A BED PER LAND** (`BEDS`): the room, with what it is made of, whether
  it breathes, and how much of it there is. The canyon is **14 dB below
  the sea** and every bed measures under the land it is the room of,
  which is what "the quietest thing in the mix" has to mean to mean
  anything. Plus `TAILS` — one shared delay, mixed per land: **the cut
  answers you back and a field does not.**
- **A BORDER IS A CROSSFADE**, equal power, three and a half seconds, on
  the room AND on the instrument: for those seconds the phrase is played
  on both lands' instruments at the fade's own weights. **A crossfade of
  instruments, not of tunes** — two tunes at once is a mistake, one tune
  changing what it is played on is a border. The card, the footstep and
  the mood fire exactly as they did.
- **THE MIX IS A PURE FUNCTION** (`mixLevels`), so the two seams Session
  6 left open have somewhere to arrive: how hard the player is going and
  what time it is, in one place, and the class ramps toward it. **The
  day cycle was not re-opened**; eight in the morning to four in the
  afternoon is still bit-for-bit the shipped page and `check-audio`
  asserts that it is.
- **AND THE PROOF, WHICH WAS THE HARD HALF AND THE INTERESTING ONE:**
  - **`tools/check-audio.mjs`** renders every land through an
    `OfflineAudioContext` in headless Chromium and asserts what a
    listener would notice. **It found four real defects** (§1 of the
    critique), and one of them is the reason the tool was worth
    building: **every border in the game had a 3 dB swell in the middle
    of it**, because two beds built from the same noise buffer at the
    same offset are not two rooms, they are one signal played twice, and
    an equal-power fade between two identical signals peaks at √2.
    Inaudible as a fault, obvious as a wrongness, and nothing but a
    meter was ever going to find it.
  - **`tools/verify-score.mjs`** does the half a renderer cannot: the
    class's own wiring, live, with a real context — fifteen crossings,
    then **five crossings inside one three-and-a-half-second fade**,
    which is the case that puts an AudioParam into a state Web Audio
    throws on.
  - **`tools/shoot-sound.mjs`** — **SHOOT THE SOUND.** Every land's
    waveform and spectrum drawn with `src/engine/ink.ts`, the room in
    pencil under the land in ink (the map's own two registers), on ONE
    shared decibel window so a quiet land looks quiet. Twelve lands are
    visibly twelve sounds, and a second sheet plots three borders
    against the curve the fade is supposed to follow.
  - **`tools/render-wavs.mjs`** — nineteen files, one uniform gain,
    never a per-file normalisation, plus `WHAT-TO-LISTEN-FOR.txt`.
- **AND THE GATE THIS SESSION COULD NOT RUN.** The score has been
  rendered, measured, plotted and asserted. **IT HAS NOT BEEN HEARD, by
  anybody.** A spectrum is not a listen and a plot is not a judgement.
  The ear gate is the owner's, the evidence is in `out/sound/`, and this
  is now written into QUALITY-BAR §2 as the standing rule for any system
  whose product is not a picture.

### State
- Build green. `node tools/check-terrain.mjs` passes, unchanged.
  `node tools/check-audio.mjs` passes (new). `node tools/verify-score.mjs`
  passes (new, needs `vite preview`).
- **No geometry, no layout, no elevation, no texture, no region file was
  touched.** The diff is `src/core/Audio.ts` plus four new tools and the
  documents. Six protected lands re-shot at **two hours** (`HOUR=12`,
  `HOUR=19.6`) in both viewports and unregressed — and this session's
  regression pass is supposed to be boring, because the world did not
  change and nothing ambient draws.
- Two dead private helpers went with the rewrite (`thump`, `burst` —
  inherited from margins, never called by anything INKLANDS ships).
- **Gate: WOWED** after 3 rounds on the sound sheet
  (`design/critiques/critique-score-1.md`, verbatim), plus the machine
  gate, and the ear gate **handed to the owner unperformed**.
- **AND THE STORY GATE RAN, beside this session, because there was room
  at the end and it needs no build** (`critique-story-2.md`). It
  returned **NOT YET** with two mandatory findings, and both are about
  delivery rather than about the story: **Act I's second and third facts
  have one teacher between them and it is optional and directional**
  (everything downstream of *nobody can leave* and *you can* hangs on
  Nell stopping at the Brim border, which only happens to a player who
  walks north having met her — the co-walker wants to be a rule of the
  world on any road, not a scripted beat on one); and **the ending's
  default witness sees exactly one of the twelve stops**, with nothing
  guaranteeing it is a land they answered, so the likeliest single
  ending in the game is a train stopping at an empty platform. The
  8:15 stops in ORDER from the north, so it can arrive already carrying
  the lands above you, visible through the windows — no new content, no
  clause of `THE-LINE.md` §5 touched. Three more findings are
  recommended rather than mandatory, including that **§3.2's rim
  composition is the riskiest un-shot frame in the game and Session 11
  should shoot it FIRST, not last.** The critic is a proposal until the
  owner rules, like the STORY EDITOR before it.

### And one thing the owner found, which was not this session's
- **BRIM'S PIGEONS HAVE BEEN FLYING UNDER THE SQUARE SINCE SESSION 4.**
  Owner, 2026-08-30: *"the birds in the kingdom of brim are disappearing
  when you move close to them, whereas they used to fly away from you."*
  They were. `civic.ts` keyed the flight arc to **y = 0** — correct in
  Session 3, when the sheet was flat and zero was the flagstones.
  Session 4 gave the page a shape and **Brim Square went up to y = 3.55**
  (measured at all five roost positions: 3.50 to 3.62). The arc peaks at
  2.3. So from the instant a bird was put up it was below the paving for
  the whole of its flight: down three and a half units through the
  square, along underneath it, and back up on landing. One term fixes
  it — the arc is above the GROUND, not above zero — and every other
  flying thing in the game (the swifts, the rooks, the swallows, the
  gulls) was already ground-relative.
  **Photographed both ways**, same framing, same drive: before, nothing
  in the air; after, a bird above the paving.
  **And why five sessions of contact sheets never caught it: every
  framing this project owns is a STAND-STILL, and this bird is only
  wrong while it is moving.** The old-world sheet gains
  `07b-pigeons-put-up`, driven into the roost — worked numbers, not
  guessed ones: east of the market cross, because at x −44 the camera
  ends up inside the fountain, and an eleven-second hold, because a
  1.5-second flight at a sixth of game speed needs nine.

### Gotchas (new; Sessions 1–7 all still apply)
- **AN OFFLINE CONTEXT RENDERS A GRAPH, NOT A SYSTEM.** Anything that
  reads `performance.now()`, schedules off `setTimeout` or waits on
  `currentTime` advancing renders SILENCE. That is why `phrase()` takes
  its start time as an argument and why the class's scheduler is never
  involved in a render.
- **AND A SUSPENDED CONTEXT'S CLOCK DOES NOT ADVANCE.** A live audio
  check in headless Chromium needs
  `--autoplay-policy=no-user-gesture-required`, or every ramp sits at
  its start value and every assertion is a lie that passes.
- **A FEEDBACK CYCLE IN WEB AUDIO IS FLOORED AT 128 SAMPLES.** Any
  DelayNode inside a loop cannot be shorter than one render quantum, so
  wired Karplus–Strong is capped at about 340 Hz. Render it instead.
- **A GLSL COMMENT INSIDE A JS TEMPLATE LITERAL STILL MAY NOT CONTAIN A
  BACKTICK — AND NEITHER MAY A JS ONE.** Sessions 5 and 6 did it in
  shaders; this session did it in the in-page render harness, in a file
  whose header comment warns about it. **Third time.**
- **MEASURE LIKE WITH LIKE, OR THE METER LIES.** Half the first round of
  `check-audio` failures were the test's fault, not the score's: the RMS
  of fifty milliseconds of noise bounces two decibels on its own, so
  comparing a windowed minimum against a long average reads a hole that
  is not there. Every reading in that file is now a half-second average,
  which is also about how long an ear takes to decide something got
  quieter.
- **A ROOM THAT BREATHES MOVES ON ITS OWN.** The sea's bed swells 3.7 dB
  over its own seven-second count, so a crossfade assertion has to
  measure each land's solo wander first and allow it. That much is
  weather; the crossfade does not answer for it.
- **A "LEVEL" IN A TABLE IS A SOURCE GAIN, NOT A LOUDNESS.** A bandpass
  passes a fraction of what you put in it, and the fraction depends on
  the filter — so `air` at the same nominal gain as `box` was 18 dB
  quieter. Every number in `LAND_VOICE` and `BEDS` was MEASURED into
  place, and `check-audio` re-measures them so they cannot drift.
- **`.tmp/` can vanish mid-session.** A background command redirecting
  into it dies instantly; every tool here `mkdir`s it, but a shell
  redirect will not.
- **AN ANIMATION WRITTEN BEFORE THE PAGE HAD A SHAPE IS A BUG NOW.**
  The pigeons are the second time this has bitten (the flat ground was
  the first, and it cost a critique round). Anything positioned with a
  bare number for y was written against a flat sheet: **grep the region
  files for a `position.y` or a `position.set` with no `groundY` or
  `heightAt` term in it before trusting any of them.** Today exactly one
  line was wrong, and it had been wrong for four sessions.
- **EVERY FRAMING THIS PROJECT OWNS IS A STAND-STILL**, and a whole
  class of defect only exists while something is moving. Session 6 had
  to drive the sprint and the oars to photograph them at all; the
  pigeons are the first time a stand-still sheet actively HID one. A
  land with motion in it wants at least one driven framing.
- `Audio.ts` gained ~15 exports (`MOODS`, `VOICES`, `LAND_VOICE`,
  `BEDS`, `TAILS`, `phrase`, `buildBed`, `mixLevels`, `equalPower`,
  `crossfade`, `XFADE`, `srand`, `nightnessAt`, `playedBy`, `toneAt`).
  `setAmbientLevel` changed meaning: it is now a 0..1 multiplier over
  the bed's own level rather than an absolute gain. Nothing calls it
  yet (it is the Blot's, parked).

## Session 7 — 2026-08-30 — the stories

*The story was LOCKED before this session started (`design/STORY.md` —
THE 8:15) and its architecture was WRITTEN (`design/QUESTS.md`, six
tiers). This session did not invent either. It MAPPED the first, BUILT
the one system the second requires, AUTHORED one vertical slice of it,
and FIXED THE VOICE — which turned out to be the biggest job in the
session and the one the whole project had been quietly failing at since
Session 1.*

### Shipped

- **THE LINE, MAPPED BEAT BY BEAT** (`design/THE-LINE.md`). Four acts,
  every beat with where it lives, what the player sees, what fires it,
  and the column that matters — **what it does not say**. Two things in
  it are decisions rather than notes, and both were this session's to
  make:
  - **Where a person stands for Act III**, and the honest version of it.
    The line is 480 units end to end; the camera only ever looks north;
    the highest walkable ground on the line's own axis is the south curl
    at (−45, 278), y 7.3, which opens the haze to 201 units. **So the
    whole line cannot be seen at once, and that is better** — from the
    best seat in the world you get two hundred units of dead straight
    empty road going away into haze. *You cannot see where it ends. You
    can see that it does not stop.* The king's road's last authored
    point is z 262 and the rim's crest is z 284: **the road has stopped
    sixteen units short of the edge of the world since Session 1 and
    nobody ever said why.** Now it has a reason, and nothing in the game
    will ever mention it.
  - **THE ENDING, settled.** `STORY.md` §6 flagged it as a proposal and
    handed it to the session that maps the stories. Three changes, all
    argued in `THE-LINE.md` §4.5: the 8:15 **stops twelve times** rather
    than gathering everyone on one platform (they cannot reach it —
    rule 1 of §8 is the engine of the whole story and an ending that
    broke it would retract the game in its last minute); **there is no
    final choice**, because whether anybody is on each platform is the
    consequence of fifteen hours; and the turn lands **on the train, in
    silence**, which is the only frame in the game that can hold two
    lands at once. Joan Harrow is not on it, exactly as proposed.
- **THE TWELVE WAITS** (`design/THE-WAITS.md`). One per land, each with
  its named person, its two or three places that mean something
  different once you know, **its turn**, and its visible permanent
  change. Four were thrown away and rewritten because the first draft
  was a mood rather than a turn. Four new names — VAL, HOLT, AMOS,
  WREN — in the east-by-south register. And **one mechanism for all
  twelve**: a wait resolves when the player, holding the right
  knowledge, arrives at the right place. Nothing asks them, nothing
  confirms it, the world simply does the thing.
- **THE EIGHT STRANGERS AND THE THREE INVENTORIES**
  (`design/THE-STRANGERS.md`). Cross-land, met in one place and resolved
  in another; the very funny one is **THE STANDING COMPLAINT** (a sealed
  grievance about the belfry clock, carried to Greyweather, received
  with total ceremony and nailed up beside a proclamation already
  weathered past reading — the procedure followed exactly, everybody
  satisfied, nothing whatsoever having happened) and the genuinely
  upsetting one is **THE ELEVEN UNITS**. Then ~20 errands, ~28
  encounters and 31 unmarked, as **one-line inventories**, which is the
  format and not a placeholder.
- **KNOWLEDGE AS THE CONTENT SYSTEM** (`src/world/knowledge.ts`,
  WORLD-SYSTEMS §6). A **NAME**, a **FACT**, a **ROUTE**, a **REASON**,
  every id a phrase a human could read out, and a region asks
  `knowledge.has(...)` in the present tense — *does the walker know
  this* — rather than being told which stage of which quest is done.
  **There is no count anywhere**: the class has no `size`, nothing
  computes a length, and the only reader of the raw set is the save
  file. Saved as `Save.data.known`, the way `boat` and `hour` were added
  last session.
- **ROUTES are the one kind of knowledge nobody in this world could
  tell you**, because nobody crosses a border and the line crosses
  eleven. So they are walked off authored posts — on foot or under oar,
  because rowing the river IS walking it for this purpose — and the
  progress survives closing the tab.
- **THE MAP IS THE RECORD.** Three registers instead of two: a question
  mark for what you have never heard of, the name in **pencil** with a
  rule under it for a place somebody named to you, the name in **ink**
  for a place you stood in. The crossroads signpost names three lands in
  its first sentence and has done since Session 1; it is worth something
  now. **And the line:** walk the king's road, main street and the
  commuter spur end to end and the map stops dashing them and draws one
  continuous stroke from a castle gate to a car park, with the other
  eight roads still dashes around it. **There is no caption.** That is
  Act III's reveal, delivered by cartography.
- **BRIM'S WAIT, END TO END** — the vertical slice. **MARGET** sets the
  stall out at dawn, lays the cloth, does not open, and packs it away at
  dusk, straight off Session 6's clock. The belfry's two hands have
  disagreed for as long as anybody can remember and **now they disagree
  about something specific**: one points at eight, which is the hour
  Brim's lamps actually come on, and one points at eleven. Stand in the
  yard while the lamps are lit and one of them agrees with them. Take
  that to the market cross and the bell rings the hour it actually is:
  **the cloth comes off, the awning goes up, and a board is chalked at
  the cross that stays there at every hour afterwards, forever.**
- **AND BRIM GOES HOME.** `StandeeField.setDim` — one multiply over a
  whole field — takes the square's sixteen folk off the page overnight.
  A square with sixteen people standing in it at three in the morning
  makes one woman packing her stall away look like a bug rather than a
  day. Last session's lamps made the LIGHT change; this makes the PLACE
  change, and it costs six lines.
- **THE VOICE PASS, and the number was worse than anybody had said.**
  `STORY.md` estimated a third of thirty-five. The session brief counted
  17 of 33 with a grep. **Read aloud it is 24 of 34** — the grep looked
  for six phrasings and the offence has more ways to say itself than
  that (`a scribble`, `six lines old`, `the second stroke`, `the
  artist`, `the wash went over this page`). **Anybody auditing this rule
  again should read, not grep.**
- **AND THE SENTENCE THE WHOLE STORY HANGS ON:**

  > the timetable says the 8:15 is coming. **there is no track here, and
  > there is no track anywhere.** everyone waiting knows both of these
  > things and has made their peace.

  Same three beats, same cadence, third sentence verbatim. What changed
  is where the impossibility comes from — *"the 8:15 is drawn nowhere on
  this sheet"* is a claim only the narrator can make and no player can
  check; *"there is no track here"* is an absence at the player's own
  feet, and *"and there is no track anywhere"* is only knowable by
  somebody who has been everywhere, which in this world is exactly one
  person. **The line quietly became about the walker and nobody says
  so.** The full defence is in `design/critiques/critique-story-1.md`.
- **THE SIGNPOST'S FOURTH NAME.** It said HOME. `STORY.md` §4 says the
  Common's crossroads has four names on it and one of them is a TIME,
  and calls it the hinge Act II turns on — so the built game and the
  locked story disagreed and the story is binding. It says **8:15**, on
  the same board, in the same hand, at the same size, with no emphasis
  of any kind, and nothing anywhere refers to it.

### State
- Build green. `node tools/check-terrain.mjs` passes, unchanged.
- **`node tools/verify-story.mjs` — twenty checks, and it PLAYS the
  wait rather than poking it.** The contact sheet reaches both of a
  wait's states with `__inklands.learn(...)`, which is legitimate for
  photography and proves nothing about the game; this walks the chain a
  player walks. A fresh page knows only where it is standing; reading
  the signpost puts three lands into pencil and standing in one puts it
  into ink; the belfry yard at NOON teaches nothing and at DUSK teaches
  the hour; carrying that to the cross calls the market, and exactly one
  of the two stalls is on the page, and the board is chalked, and Marget
  is at her counter; **and all of it survives a reload.** Plus the line,
  walked post by post, because a route is the one kind of knowledge
  nobody can be told.
- **Frame cost unchanged.** Brim Square is 210 draws / 214k triangles
  with four more standees in it than Session 6 left (Session 6 recorded
  217 from a slightly different stand). THE COMMON is still the worst
  frame in the game.
- **No layout change**: no rect, no road geometry, no river, no bridge,
  no mood, no step zone. `Road` gained one authored flag (`line?: true`)
  on the three roads STORY §4 makes one road.
- **No elevation change.** This session added four standees to Brim
  Square and edited two textures.
- Six protected lands re-shot at **two hours** (`HOUR=12`,
  `HOUR=19.6`) in both viewports and unregressed. Session 3's
  square-wide framing now contains Marget's stall and is the better for
  it.
- New: `src/world/knowledge.ts`, `design/THE-LINE.md`,
  `design/THE-WAITS.md`, `design/THE-STRANGERS.md`,
  `design/critiques/critique-story-1.md`, `tools/shoot-story.mjs`,
  `tools/shoot-map.mjs`.
- **Gate: WOWED** after 3 rounds (`design/critiques/critique-story-1.md`,
  verbatim), plus the note read-aloud (PASS) and a **new critic, the
  STORY EDITOR, which is a PROPOSAL for the owner** — it read the twelve
  waits blind and named what each land believes, twelve for twelve,
  without once using the word.

### Gotchas (new; Sessions 1–6 all still apply)
- **KNOWLEDGE IS STICKY WITHIN A PAGE, AND A CONTACT SHEET IS ONE
  PAGE.** The first sheet of this session shot "Marget shut" with the
  awning already up, because the frame before it had learned why. Any
  script that photographs a wait at both states shoots **every** shut
  frame before the first open one.
- **A SILENT SYSTEM STILL HAS TO BE VISIBLE.** The map's pencil and ink
  registers were first separated by transparency alone, and the map is
  drawn at 940 and shown at about 690 — the difference did not survive
  the scale. Three signals, not one: the ink goes heavier, the pencil
  goes lighter AND greyer AND thinner. If a register does not read, the
  system does not exist.
- **A FACT THE PLAYER IS HANDED FOR BEING SOMEWHERE IS A FLAG. A FACT
  THEY CAN LOOK AT IS KNOWLEDGE.** Brim's belfry had two hands pointing
  at roughly one o'clock and roughly twelve, which is a wobble and not a
  disagreement. They point at eight and eleven now, and eight is the
  hour the lamps come on, and the whole of Brim's wait is two lines of
  geometry. **A stopped clock is right twice a day** — which is why
  fixed hands are the correct drawing and moving ones would have been
  wrong.
- **BRIM SQUARE HAS THREE RUNS OF BUNTING AND THE CAMERA TRAILS
  THIRTEEN UNITS.** Every framing that stands within about eight units
  of z −65, −81 or −96 hangs two enormous translucent triangles down the
  middle of the frame. Work out where the camera lands before shooting,
  not after.
- **A PROSE CHANGE CAN FALSIFY A DRAWING.** The crossroads note was
  rewritten to say "one arm pointing south", and the signpost has four
  arms, none of which points south. Either the note or the drawing has
  to move, and it is cheaper to check than to ship a game whose card and
  whose sign disagree.
- **`vite preview` started with `&` inside a compound bash command dies
  with the command.** Use `setsid` and a separate call, or every shoot
  after the first one hits a dead port.
- **ASSERTION VERSUS SIMILE**, and it is the line the medium rule
  actually draws. A note that says the world IS drawn has broken the
  rule; a note that compares a thing in the world to handwriting is a
  figure of speech, and this world has ink and pens in it as ordinary
  objects. Two lines survive on that distinction (riverbend's cursive,
  the tarn's "black as the good ink") and both are flagged to the owner
  in the critique as one-line changes if the ruling goes the other way.
- `layout.ts` gained `Road.line`. `Save` gained `known` and `passed`.
  `StandeeField` gained `setDim`. `POI` note defs gained `learns`.
  `shoot-lib` gained `opts.learn`.

## Session 6 — 2026-08-29 — traversal & time

*A systems session. Nothing here adds a land; everything here changes
how all six built lands FEEL, and two of the four items change how the
remaining five will be authored. `design/specs/traversal.md` is the
full record — this is the handoff.*

### Shipped

- **SPRINT AS INK WEIGHT** (WORLD-SYSTEMS §3). One continuous scalar,
  `Character.effort`, and there is no sprint state anywhere in the game:
  speed, stride, the print's ink, the step's level and the score's
  intensity are all readouts of it. **The middle of its range is the
  shipped mark** — at press 0.5 the print's gamma is 1.0 and its weight
  is 1.0, so a walk lays exactly the print four lands earned a WOWED
  with, and the system spends its range either side and never through
  it. A run's print is darker, wider and **dragged out 1.4× along the
  line of travel**, which is the part that actually reads at this
  camera. Damp paper (which is not wet paper — wet still refuses the
  print outright) lets it bloom, so running the tide line leaves a
  heavier trail than running the king's road, for one line of code.
  **No button and no stamina**: Shift, ramped, on a keyboard; on a
  phone, HOW FAR PAST THE RING YOU DRAGGED — the stick reaches a full
  walk at forty-eight pixels and the next forty are the run.
- **ROADS THAT CARRY** (§3, and STORY §4 is what authors the numbers).
  Nine roads that had been decoration since Session 1 are infrastructure.
  The carry **BENDS**: it takes a fixed share of the angle between where
  you are pointed and where the road goes, and there is no term anywhere
  in it that points at the centreline — so walking off a road is exactly
  as free as it was, and crossing one is free. Gated on alignment
  (56°–23°), so it can only tidy a walk that was already down the road.
  **Authored per road**: the king's road / main street / commuter spur
  chain carries 1.0, because STORY §4 makes them one road under twelve
  names surveyed as a railway; the canyon trail carries 0.3, because a
  trail does.
- **THE ROWBOAT — the first mount** (§4). Drawn up at THE RIVER MOUTH,
  found in the world and left in the world (saved), taken with one
  prompt and no menu ever. Fast on water, **refuses every other ground**.
  It turns the river — a wall along its whole length except at three
  bridges since Session 1 — into the only east–west road in the world,
  navigable from the salt to the source under all three bridges. And
  **where she STOPS is a decision, written down**: she does not leave
  the shore (34 units off dry paper), because a boat that goes anywhere
  wet would delete the sandbar Session 5 spent a session earning, and
  because the torn west edge is not this session's to spend. The bar
  counts as shore — its crest is dry paper — so the boat works the shelf
  either side of it.
- **THE DAY CYCLE** (§7). Forty minutes; one hundred seconds an hour;
  a fresh page starts at nine in the morning. `src/world/daylight.ts` is
  the clock and the one authority on the hour. **Eight in the morning to
  four in the afternoon is BIT-FOR-BIT the shipped page** — the neutral
  tint is pure white and the neutral haze is `PAPER_HEX`, so the grade
  is provably a no-op and six earned verdicts cannot be re-graded. The
  hour's colour lives at the HORIZON (the fog and clear colour); the
  paper takes a little of it weighted by its own brightness; **the ink
  takes none**. The horizon goes DARKER than the page does, which is the
  whole difference between a filter and a desk lamp. Brim's four square
  lamps light, its high-street windows come on (a third of them stay
  dark), and two braziers burn at Greyweather's gate — the castle's only
  lit things, for a road nobody rides up.
- **`Audio.setMoodIntensity` is called for the first time in this
  game's life** (§9 move 4), and `Audio.setHour` / `Audio.hour` are the
  seam §9 move 5 asked for. Session 8 will not have to re-open the day
  cycle. Two new voices: `oar` (a dip, a rowlock, and a pull, built out
  of the coast's own `surge`) and `oar-ship`.
- **The proof grew two whole sections** (`tools/check-terrain.mjs`):
  the carry is bounded and zero outside the roads' band, **the line
  carries hardest** (asserted, so nobody can quietly flatten STORY §4's
  spine), and a full-speed carried step lands on walkable ground at
  every point on every road and both shoulders in both directions; the
  boat floats where she is left, the river is rowable end to end, the
  open sea and the torn west margin refuse, and — the strongest one —
  **every place the boat can put you ashore is already reachable on
  foot**, checked by flooding the whole water and trying a landing from
  every square unit of it against the walker's own flood fill.
- **Gate: WOWED** after 4 rounds — `design/critiques/critique-art-5.md`
  (verbatim). All six protected lands re-shot at TWO hours and intact.

### State
- Build green. **Frame cost and draw counts unchanged.** THE COMMON is
  still the worst frame in the game at 293 draws / 214k triangles,
  exactly as Session 5 left it; Brim Square is 217. The day cycle is
  five instructions in a post-pass that already existed, the carry is
  one polyline query per frame, and every lit drawing is
  `visible = false` for sixteen hours a day.
- `node tools/check-terrain.mjs` passes, with the two new sections.
- **A protected framing is now protected at TWO HOURS** (QUALITY-BAR §2).
  `HOUR=19.6 node tools/shoot-first-minute.mjs` pins the clock; the
  neutral pass is the same regression check it always was, because the
  neutral hours are bit-identical.
- New: `src/world/daylight.ts`, `src/engine/Boat.ts`,
  `design/specs/traversal.md`, `tools/shoot-traversal.mjs`.

### Session 6.1 — mobile QA (same day, after a player's phone screenshot)

*The owner opened a note card on an actual phone and the text ran off
the side of the screen. It had been doing that since Session 1.*

**The gap it exposed is the important part: NO SHOOT SCRIPT HAD EVER
OPENED A NOTE CARD.** Five sessions of contact sheets photograph the
WORLD; the note, the region card, the hint and the interact prompt are
the half of this game the player READS, and they were being judged by
nobody. `tools/shoot-mobile.mjs` is the fix — the chrome, at 320, 360,
390 and 430 points, with the longest note and the longest land name in
the game — and it found six more defects on its first run.

- **The note card's text is wrapped to the CARD, measured.** It was
  lettered to a constant 380 points; `max-width: min(460px, 92vw)` on a
  390-point phone is 359 less padding, so every line but the last ran
  off the screen mid-word. Hand-lettering is drawn to a canvas and a
  canvas does not reflow, so the wrap width is a MEASUREMENT, not a
  style — and it must measure the space available, not the card, which
  is a flex item that shrinks to its contents (measuring the card wrapped
  every note to the width of the words "put it back").
- **And the type is sized so the longest note fits the narrowest phone
  without scrolling.** Wrapping alone just turned the overflow
  vertical: at 320 the same note became eleven lines and ran off the
  bottom. A note is one card you read at a glance; the moment it needs
  a scrollbar it is a document.
- **Nothing from the world draws through an open card.** `POI.suppressed`:
  the interact prompt was being lettered across the walker *underneath*
  the note veil — it is in the owner's screenshot.
- **On a tall screen the interact prompt is PINNED low and centred**,
  not floated over its subject. Session 4 floored it at 42% for thumb
  reach; the other half only shows on a device — the walker sits two
  thirds down a tall frame and a POI you are standing on projects to
  exactly there, so the prompt landed on the walker's head and on the
  POI's own label. Labels still float; a label is a caption, the prompt
  is a control.
- **The region card and the hint wrap to the viewport.** CASTLE
  GREYWEATHER in 24pt display caps is wider than a 320-point phone.
- **The map's lettering is sized for its DELIVERED size.** The map is
  drawn at 940 and CSS-scaled to `min(92vw, …)`; at 320 that is a 3.2×
  reduction and eleven-point land names arrived at three and a half.
  Capped at 2.2× — writing bigger than the geography is a legend, not a
  map — and the boast line is clamped to the sheet it is written on.
- **The title gets a margin**, the note card a `max-height`, and the
  joystick's RUN state now reads on the ring rather than by inking the
  nub, because the nub is under the thumb and the thumb drags up toward
  the walker.
- **`showTitle` no longer fires over a game already begun.** A loader
  tween that finishes late (this sandbox, at 3.5fps) lettered the title
  back over a running game.

### Gotchas (new; Sessions 1–5 all still apply)
- **THE CHROME IS HALF THE GAME AND IT WAS NEVER IN A CONTACT SHEET.**
  Everything the player reads — note, region card, hint, prompt, map —
  lives in the DOM as lettered canvases, and a canvas does not reflow.
  Every one of them needs a width that is MEASURED at the size it will
  be delivered at. Shoot them (`tools/shoot-mobile.mjs`) or they break
  in silence.
- **THIS SANDBOX RENDERS AT ABOUT 3.5 FRAMES A SECOND** (no GPU, 213k
  terrain triangles), and App clamps `dt` at 0.05 — so **one second of
  wall clock is about a sixth of a second of GAME time**. Any harness
  that drives the walker must hold six times as long as it looks like it
  should. A 2.4-second hold walks two units and lays four footprints,
  which is exactly why the first contact sheet of "sprint as ink weight"
  showed a walk and a run that were identical. `frameCost` is still the
  right way to measure cost; rAF cadence is still meaningless here.
- **A ROTATION APPLIED TO AN INPUT THAT IS RE-READ EVERY FRAME DOES NOT
  ACCUMULATE.** The road carry was first written as a per-second turn
  rate applied to the raw input vector; measured, it deflected a walk by
  **half a degree** and the whole feature was switched off. Anything
  that steers a player must take a SHARE OF THE ANGLE, not a rate.
- **Instrument the things the eye cannot judge.** The carry cost two
  rounds — a rate that did nothing, then a sign that steered people into
  the verge — and neither would ever have been found by looking at a
  screenshot. `window.__inklands.drive(mx, mz, run)` / `carryAt` /
  `release` exist for this; the measured table is in the spec.
- **A DAY CYCLE THAT MULTIPLIES THE WHOLE FRAME BY THE LIGHT'S COLOUR IS
  A SEPIA FILTER**, and it takes the LINE WORK with it. The hour belongs
  at the HORIZON (fog + clear colour), on the paper weighted by its own
  luminance, and on the ink not at all. Then it went the other way and
  the haze at full tint was a tangerine slab; `Key.sky` in daylight.ts
  is that round written down as a number.
- **Make the neutral hours the IDENTITY, not "close to it."** `#ffffff`
  and `PAPER_HEX` mean the grade is provably a no-op for eight hours a
  day, which turns "did the day cycle regress anything?" from a
  screenshot diff into arithmetic.
- **A generated overlay cannot guess where a drawing put its windows.**
  Brim's lit windows were first a separately generated run of panes hung
  in front of each terrace, and they floated over roofs and party walls.
  `townRowTexture` now RECORDS its own casements as it draws them and
  `townRowLitTexture` reads the record.
- **A boat is a cutout like everything else on this sheet.** A hull lying
  flat on the water is Session 5's invisible quad; a hull drawn broadside
  and mirrored by travel direction is the house style. It must sit HALF
  A UNIT SOUTH of whoever is in it (the camera only looks north, so
  south is toward the lens) or the hull does not hide their legs and
  they read as standing ON the boat — and nobody walks in a boat, so the
  walk cycle is held and the stroke goes into a lean.
- **A dinghy is short and DEEP.** The first redraw was long, shallow and
  pointed at both ends and came out a gondola; the freeboard is most of
  what you see of a small boat and it is what hides the legs.
- **The harness must put the walker ashore between framings**, or the
  boat follows them across the world — the first contact sheet had a
  rowboat parked in the middle of THE COMMON, in Session 2's protected
  composition.
- **A GLSL comment inside a JS template literal still may not contain a
  backtick.** Session 5 wrote this down and Session 6 did it again.
- `layout.ts` gained `Road.carry` (a number per road, authored),
  `roadCarryAt`, `riverAt` / `pondAt` / `waterFieldAt` (the river and
  the ponds moved out of `terrain.ts` for the same reason the sea moved
  in Session 5 — the proof has to be able to walk them off-screen),
  `rowableAt` / `offshoreDist` / `ROW_REACH`, and `BOAT_HOME`. No rect,
  road geometry, river, bridge, mood or step-zone change.

## Session 5 — 2026-08-29 — the coast

*The first land session authored on real ground, and the test of whether
Session 4's foundation was worth building.*

### Shipped

- **THE COAST'S OWN GROUND, authored first.** `elevation.ts` had the
  dune line and a sea floor; it now has the three things that make a
  coast a coast, and all three are in the sheet's vocabulary rather
  than a landscape's:
  - **THE HOLDFAST** — the headland. The wet margin tore away in two
    bites and one tongue of fibre held; the point is what the tear went
    ROUND. Eleven and a half units up, ringed by twelve of cliff that
    holds ∇h past the walk limit for more than a stride. **It is a
    POLYGON, not an ellipse**, and that was the session's hardest-won
    lesson: paper tears along its fibres, in straight runs, so the point
    has eight planar faces and a fall line that stays put on each of
    them. A radial headland is a dome, and a pen cannot draw down a dome
    (see the critique — it cost four rounds).
  - **THE CUT** — the ledge somebody chiselled across its seaward face,
    and the only way up. Not a ramp bolted on: the page is GRADED along
    an authored spine, so the ledge is a cut where the page was high and
    its own spoil where the page was low. The floor's profile is built
    from the ground itself at load (sample, make monotone, cap the
    grade at one in three and a half, lift the tail so it still
    arrives) — a fixed formula stopped matching the hill the moment the
    hill changed.
  - **SHELTER COVE** — the bite behind the point, with the dune standing
    up into a bank behind it so the cove opens only to its own water.
  - **THE SANDBAR** — the answer to THE WIDE BLUE, and it comes out of
    the metaphor rather than out of a boat: a wash leaves misses, and
    this one left a dry streak running a hundred and eighty units out to
    sea. It is authored in `layout.ts` (`SANDBAR`, `barDist`, `seaAt`)
    so the height field, the wash field and collision cannot disagree
    about it, and it is a ROUTE — out from the boardwalk, round the
    regatta's mark, back ashore at the foot of the cut.
  - **The shoreline is a LINE.** The sea's ramp went from forty-two
    units to twenty-four; over forty-two a coast is a gradient between
    two beiges and no amount of wrack saves it.
- **LONGSHORE, six places** (`design/specs/longshore.md`): the
  boardwalk, the painted huts, the cut, the holdfast, shelter cove, the
  river mouth, with two composed voids carrying one midpoint each.
  **The boardwalk is a PROMENADE running north** — the camera only ever
  looks north, so a boardwalk laid east–west is two handrails across the
  middle of the frame and nothing else.
- **THE WIDE BLUE, five places**, four of them on the bar. A regatta on
  a real closed course staged so its southern extremity sits twenty
  units due north of where the player stands.
- **New prop box** `src/world/textures-coast.ts` (~20 drawings). Two
  techniques, both stated before a line was drawn: *the dry brush and
  the horizontal* on land (every mark is a long low horizontal or a
  vertical stab against it — nothing is diagonal except the cut, which
  is why the cut reads as made), and *the waterline* at sea (every
  floating drawing stops flat with one hatch of reflection and nothing
  below).
- **Sound is place, and the sea gets louder as you approach it.** Four
  new `Audio.event` voices — `surf-break`, `gull-cry`, `bell-buoy`,
  `halyard` — and the gap between breakers is a function of the walker's
  distance from the water. Two new synthesis helpers: **`surge`** (a
  noise band whose centre sweeps as the wave collapses — the first
  non-sine instrument in the game) and **`glide`** (a pitched sweep, for
  a gull's mew and a halyard's slap). **The step timbre changes when you
  cross onto the bar**, because `ocean`'s step zone is now `sand` and
  the shallows override themselves to `wet`: the player learns the bar
  is paper without being told.
- **Motion.** LONGSHORE: marram in a sea wind that never gusts, the
  windsock, and a gull flock that puts up when you walk into it, wheels
  out over the water and comes down FURTHER ALONG the beach each time.
  THE WIDE BLUE: the fleet sails its course and heels into the turns,
  the bell buoy works the swell and rings, and a shoal breaks and
  scatters when you wade into it.
- **Shared shading, re-audited.** Three changes to `terrain.ts` were
  needed to make a cliff read, and all three were re-shot against the
  four protected lands: the fall line's DIRECTION is taken over a wide
  stencil while its magnitude stays the grid's; the magnitude is scaled
  by the fall line's COHERENCE, so brows and corners take no strokes;
  and **the hatch gate moved from 0.36 to 0.62, which is Session 4's own
  law implemented at a number that means it** ("hatching is for cliffs").
  Greyweather's scarp is better for it.
- **Gate: WOWED** after 6 rounds — `design/critiques/critique-art-4.md`
  (verbatim). The four protected lands are intact.

### State
- Build green. Worst coastal frame is the boardwalk at 176 draws,
  against THE COMMON's 293; 213k terrain triangles in one static call,
  unchanged.
- `node tools/check-terrain.mjs` now proves the coast off-screen: the
  bar is dry the whole way out, the open water refuses everywhere with
  the bar erased, the ledge is walkable end to end, and **with the ledge
  fenced the point is unreachable** while Shelter Cove still is.
- Protected now, in both viewports: everything Sessions 2–4 protected,
  plus the promenade walked north (portrait is the better of the two),
  THE CUT from the lower ledge, the Holdfast from the bight, the bar at
  its middle bend, and THE MARK with the fleet rounding it.

### Gotchas (new; Sessions 1–4 all still apply)
- **THE CAMERA ONLY EVER LOOKS NORTH, and that is a LAYOUT constraint,
  not a camera note.** Anything the player is meant to walk ALONG has to
  run north–south or it crosses the frame; anything they are meant to
  LOOK at has to be north of where they stand. This session laid a
  boardwalk east–west, staged a regatta west of the bar and put a
  viewpoint west of a cliff, and all three had to be rebuilt. Check the
  bearing before you place a thing, not after.
- **A flat quad that runs away from the camera is invisible.** There is
  no such thing as a handrail along a north–south walk in this engine.
  Use a receding line of small standees (the promenade's bollards) and
  put the rails where they face south (the jetty head).
- **A radial landform cannot be hatched.** The shader draws down the
  fall line; on anything doubly curved the fall line rotates, and
  `dot(worldXZ, across)` with a rotating `across` produces caustics —
  thumb prints, then herringbone. Author landforms with PLANAR FACES.
  The paper vocabulary already said so: a tear runs straight and turns
  at corners.
- **Hatching is for cliffs, and 0.36 was never that.** A five-unit dune
  over seventeen clears the old gate comfortably, which is where every
  chevron on this coast was coming from. The gate is 0.62 now.
- **Nothing in the height field may be finer than ~12 units — including
  the things you CARVE.** The ledge's inner wall was five units wide and
  aliased into chevrons until it was widened to eleven.
- **`smax`'s k is measured in HEIGHT, and a generous k rounds a cliff's
  TOE into a walkable ramp.** The Holdfast leaked at k = 2 (a four-unit
  ramp at two thirds of the walk limit, all the way round); it holds at
  0.8.
- **A pale standee within ~16 units is a grey slab — including in front
  of a cliff, especially in front of a cliff.** Four rounds of the gate
  killed four generations of cut wall. If the ground can say it, let the
  ground say it; give the drawings only what the height field cannot.
- **A GLSL comment inside a JS template literal may not contain a
  backtick.** Two of them silently broke the build mid-session and the
  screenshots came back from a stale `dist`.
- `layout.ts` gained `SANDBAR`/`barDist`/`seaAt`, `PLANKS`, one point on
  the coast road (it now reaches the promenade), a reshaped `coastX`,
  and `ocean`'s step zone changed `wet` → `sand`. `Terrain.nearBridge`
  became `Terrain.onPlanks` and answers for the boardwalk too. No rect,
  river, bridge or mood change.
- The `?debug` frame-cost harness now covers five coastal framings.

## Session 4 — 2026-08-28 — the paper has a shape

*A foundations session. Nothing here adds a land; everything here
changes how every future land is authored.*

### Shipped

- **THE SHEET HAS A SHAPE.** `src/world/elevation.ts` is new and is the
  ONE authority on where the ground is. It is authored in the sheet's
  own vocabulary (WORLD-SYSTEMS §1), not in generic hills:
  - **the crease** — the page was folded once, north to south. The fold
    wanders (`foldX`), the east road dives through it between the common
    and the downs, and the forest track crosses it at the Wood Gate.
  - **the curl** — the east, north and south margins lift in their last
    thirty units and then the page ENDS: a two-unit drop to the next
    sheet and then the desk. The west margin is where the sea runs off
    the torn edge, so it sags instead — wet paper does not curl.
  - **the buckle** — value-noise cockle at ±1.5 units, weighted per land
    by how wet that land's wash went on (`COCKLE`). The downs roll; the
    office park does not. This is texture underfoot, NOT landform: round
    1 of the gate rejected it at four times this amplitude.
  - **the tear** — SPLITROCK is a rip with a ragged fibre-scale lip,
    thirteen units deep, and you can see the desk through the bottom of
    it. Session 9 builds the land on ground that already exists.
  - **what's under the sheet** — a book under the page lifts CASTLE
    GREYWEATHER onto a real scarp with a flat top.
  - **water has beds.** The river's falls monotonically from its source
    in the canyon to its mouth in the sea, so it cuts a notch through the
    crease instead of riding over it; the sea and the ponds are level.
- **`heightAt` routed through the CENTRALISED placement helpers** —
  `ctx.standee`, `ctx.decal`, `ctx.field` (via `StandeeField`'s new
  `ground` option) and the new `ctx.groundY` / `ctx.hang`. Twelve region
  builders needed no placement edits, exactly as WORLD-SYSTEMS predicted;
  only the dozen things HUNG in the air (pennants, bunting, the swing,
  birds) needed a line each. **Standees stay vertical**; decals and
  footprints lie along the surface normal and carry a polygon offset.
- **The walker, footprints, POI labels, bridges and collision lifted.**
  Uphill costs speed and downhill gives a little back (`Character.grade`).
  **Steep is impassable** (`MAX_WALK_SLOPE`), which is what makes the
  banner avenue the only frontal way onto Greyweather's ridge.
- **A fold is DRAWN, not shaded.** The terrain shader gained three marks,
  each keyed off geometry the vertex buffer already carries: tone where
  the page leans out of the light (lamp BEHIND the page, so the face you
  are looking at is the shaded one), a pooled ink line down the bottom of
  a crease, and pen hatching that runs DOWN THE FALL LINE of anything
  that is actually a cliff, at a pitch that keeps the stroke the same
  size on the page at every distance.
- **The camera is a designed system** (`App.CAM`), not three constants.
  Elevation, pitch and fog are parameters with reasons. The frame-top
  ceiling is gone: when the ground ahead rises the camera **retreats**
  — distance is how you reveal a hill, pitching up throws the subject
  out of the bottom of the frame — and climbing pulls the fog back, so
  the curled rim and the castle ridge are vistas.
- **CASTLE GREYWEATHER rebuilt on the real ridge.** The avenue climbs;
  the barbican sits low on the ramp; the curtain wall is placed by asking
  the page where its brow is (`lipZ`) and steps forward around the gate;
  the keep stands on the plateau. Three beats, each clearing the one in
  front, at three real heights. **The four crag stand-ups are gone** —
  they were the high seat drawn, standing in front of the ridge they
  stood in for. What is at the ridge's foot now is fallen stone. The
  king's road climbs the ramp and through the barbican.
- **Portrait is a first-class gated viewport.** `tools/shoot-lib.mjs`
  renders every framing at 1280×720 AND 390×844 and every shoot script
  uses it. Portrait fixes it exposed: the poster's SET OUT sat on Brim's
  keep and out of thumb reach (it now owns the bottom third on its own
  scrap of paper), the interact prompt could land in the top half (it is
  floored at 42%), and the drag-to-walk joystick could be planted on the
  vista it was steering toward (the walk band is now the lower 62%).
- **The margins inheritance audit EXECUTED** (WORLD-SYSTEMS, "The
  inheritance audit"): `AudioDirector` deleted (739 lines, never called),
  59 of 66 `Audio.event` cases deleted (the seven live ones are the
  world's own voices), the two-blues forgery contract and its paling
  tokens retired from `palette.ts`, and the smudge auto-on rule dropped
  from `ink.ts` with the effect kept and made opt-in. ~900 lines of
  another game's story gone.
- **New tools.** `tools/check-terrain.mjs` asserts the height field
  off-screen — amplitude envelope, no road severed, every standing place
  reachable on foot from the spawn by flood fill, Greyweather's south
  face still refuses. `tools/shoot-shape.mjs` photographs every landform.
  `tools/shoot-fps.mjs` reports frame cost and draw/triangle counts.
- **Gate: WOWED** after 7 rounds — `design/critiques/critique-art-3.md`
  (verbatim). The four protected lands are intact; THE COMMON and the
  castle approach are better than they were.

### State
- Build green. 210k terrain triangles in one static draw call, no
  per-frame CPU, no new draw call per prop. Worst frame is still THE
  COMMON at 280 draws, unchanged by elevation.
- **The world has an address: https://adventure.ryankm.com.** Set up
  2026-08-29, after the session shipped. The whole arrangement, so no
  future session has to rediscover it:
  - **`main` is the branch.** The four per-session branches were all
    strictly linear, so they were consolidated: `main` created at the
    Session 4 tip, then made the repo default.
  - **Vercel's production branch is a project setting that does NOT
    follow the GitHub default.** It lives under Settings →
    Environments → Production → Branch Tracking (it is no longer under
    Settings → Git, which is where every stale guide says it is). It is
    now `main`, so every push to `main` deploys to production.
  - **A branch created through the GitHub API fires no push event**, so
    Vercel will not even list the branch until something is genuinely
    pushed to it. That is why `main` was invisible in the dashboard at
    first.
  - **The domain is registered at Squarespace but its DNS points at
    Vercel** — `adventure.ryankm.com` is a CNAME to a per-domain
    `*.vercel-dns-017.com` target added as a Squarespace custom record.
    Adding another subdomain later is the same two steps: add it in
    Vercel, paste the CNAME Vercel gives you into Squarespace.
  - "Auto-assign Custom Production Domains" is on, so the domain
    follows every future production deploy with no action.
  - The `.vercel.app` aliases still work and still serve the same
    build; `adventure-three-flax.vercel.app` is the auto-generated
    production one. Prefer the custom domain when sharing.
- Protected now, in BOTH viewports: everything Sessions 2–3 protected,
  plus the castle-reveal / avenue-foot / avenue-climb stack and the
  portrait poster.

### Gotchas (new; Sessions 1–3 all still apply, except where noted)
- **The frame-top ceiling gotcha from Session 3 is RETIRED.** "Height
  contests are won by spread, not by scale" was a rule about a flat
  world. They are won by GROUND now: put the near thing lower down the
  slope and the far thing on the plateau. The keep is 34×17 as before
  and it wins its own gatehouse by thirteen units of ridge.
- **The camera retreats, so things BEHIND the walker get into frame.**
  Anything the walker has walked past can only obstruct — the camera
  only ever looks north. Brim's north wall run and Greyweather's curtain
  wall both fade to ZERO (and `visible = false`), not to a tenth: a
  six-unit wall at ten per cent opacity one unit from the lens is a grey
  rectangle across the whole frame.
- **Amplitude is relative to the FRAME, not to the sheet.** The player's
  frame is about fifty-five units wide. A five-unit swell over ninety
  units is a hill, not cockle. Author landforms big and deliberate;
  author texture small.
- **Nothing in the height field may be finer than ~12 units.** The grid
  pitch is 4 and the mesh samples the same nodes; finer features alias.
- **Hatching is for cliffs.** On gentle ground it reads as corduroy, and
  in world space along the contours it reads as drapery. It runs down
  the fall line (`aShade.zw` carries the gradient) and its pitch scales
  with depth so the stroke is constant on the page.
- **Run `node tools/check-terrain.mjs` before shooting anything.** It is
  three seconds and it catches severed roads, unreachable lands and a
  scarp that stopped refusing.
- **The sandbox has no GPU.** `window.__inklands.fps()` reported 1 fps
  for a scene that renders in 2 ms; `frameCost` replaced it. Frame-rate
  claims from this environment are only ever comparative.
- `layout.ts` gained three points on the king's road (up the castle ramp
  and through the barbican) and `coastX` moved from `terrain.ts` to
  `layout.ts` (re-exported, so importers are unchanged). No rect, river,
  bridge, mood or step-zone change.

## Session 3.5 — 2026-08-28 — owner direction (no code)

Design conversation after the Session 3 gate, baked into the repo as
`design/WORLD-SYSTEMS.md` plus re-cut `PLAN.md` / `QUALITY-BAR.md` /
`PROMPT.md`. Decisions, so nobody re-litigates them:

- **The flat ground was an inheritance, not a decision** — and it goes.
  Paper is flat but not rigid: the sheet creases, curls, buckles and
  tears. Session 4 is a foundations session that gives the page a shape.
- **The ordering rule:** systems that change how a land is authored
  (elevation, camera, traversal, time) ship BEFORE the remaining lands.
  The ladder was re-cut around this; the coast moved to Session 5 so it
  can be authored with elevation rather than re-opened after it.
- **margins is a reference, not an authority.** Every inherited rule is
  now re-ratified or dropped; WORLD-SYSTEMS carries the running audit.
  First pass found `AudioDirector` (739 lines, never called), ~60 dead
  `Audio.event` cases, and the two-blues forgery contract in
  `palette.ts` — all margins plot, none of it ours.
- **Mobile and desktop are both first-class**, enforced at the gate:
  every contact sheet now shoots portrait as well as desktop.
- **Mounts are rewards, one per quadrant, each refusing the others'
  ground** (horse / bicycle / rowboat / the 8:15 / paper plane). Walking
  stays the universal verb; no fast-travel menu, ever.
- **Blots-as-caves parked** until the story gives them a reason.
- **Story is picked at Session 7**, not before.

## Session 3 — 2026-08-28 — the old world

### Shipped
- **THE KINGDOM OF BRIM interior rebuilt to spec**
  (`design/specs/kingdom-of-brim.md`): six places — the south gate
  inside, the high street, Brim Square, the belfry yard, the orchard
  close, the Wood Gate. Terrace runs of half-timbered houses
  (`townRowTexture`, 6 seeds, front- AND side-gabled roofs mixed)
  replace the 14 scattered cottage stamps; the square gets a
  two-tier fountain, market cross, five stalls, bunting, crates,
  cobble-wear; the belfry is now full-pressure with a clock whose
  hands disagree. East + north walls rebuilt in the Session 2 wall
  register with drum towers and a new north gate.
- **CASTLE GREYWEATHER rebuilt to spec**
  (`design/specs/castle-greyweather.md`): the banner avenue tightens
  toward a low gatehouse, the ridge wall rides its crags, the bailey
  keeps a toppled king and the castle well, the moat pool gets reeds
  and a wind-flagged hawthorn, and a pencil pine treeline closes the
  north horizon.
- **The Session 2 vista placeholder is gone.** The pale roofline rank
  is replaced by the real town plus a new `backStreetTexture` far
  rank (long ridges + chimneys, never a picket of triangles) that
  fades as the walker closes on it.
- **New prop box** `src/world/textures-oldworld.ts` (~20 textures).
- **Motion**: bunting breathing, swifts round the belfry, pigeons that
  scatter when you walk into them, rooks circling the keep and a
  parliament on the statue that breaks when you approach, banner-field
  wind. **Sound**: `brim-bell`, `market-murmur`, `pigeon-flap`,
  `banner-snap`, `rook-caw`, wired per region in App's ambience.
- **Gate: WOWED** after 4 rounds — `design/critiques/critique-art-2.md`
  (verbatim). Protected now: the north-gate reveal, the banner avenue
  with the keep clearing its gatehouse, and Brim Square under bunting.

### State
- Build green; `tools/shoot-oldworld.mjs` is the Session 3 contact
  sheet; Session 2's protected framings re-shot and verified richer,
  not regressed.
- Four lands hold the bar (Common, Brim south face + interior,
  Greyweather). Ladder re-cut after this session: Session 4 = THE PAPER
  HAS A SHAPE (foundations), coast moves to Session 5.

### Gotchas (new; Sessions 1–2 all still apply)
- **The frame-top ceiling decides all architecture.** The shipping
  camera shows only ~10 world units of height at 33 units out and
  ~16 at 82. Anything taller crops, and a tall near building fills
  the upper frame so nothing behind it can be seen at all. That is
  why Greyweather's keep is drawn WIDE (640×320, 34×17 units) and its
  gatehouse is only 9.5: height contests are won by spread, not by
  scale. Do not "fix" a hidden landmark by making it taller.
- Gate arches need `passFade(px, pz, gx, lo, hi)` — the camera trails
  12 units behind the walker, so a fade keyed to the walker alone
  pops while the camera is still inside the arch. Both Brim gates,
  the Greyweather gatehouse and the whole ridge wall use it.
- The pale/failing-pressure register is a DISTANCE register only: any
  pale standee within ~16 units reads as a flat grey slab. Fade them.
- Region builders can fire audio without plumbing: dispatch
  `inklands:event` on window (App bridges it to `Audio.event`).
- `layout.ts` gained one road (the market lane, Brim Square → Wood
  Gate). No rect, river, bridge, mood or step-zone change; terrain and
  map pick roads up automatically.
- `bannerTexture(seed, 'red'|'blue')` now takes a forced color — the
  coin-flip was putting blue banners in a land whose accent is red.

## Session 2 — 2026-08-28 — the first minute

### Shipped
- **THE COMMON rebuilt to spec** (`design/specs/the-common.md`, the
  first land spec): six named places (crossroads, well, oaks, gate
  fields, long fence, riverbend), cluster-scattered grass in six
  drawings + tall seedheads + three one-species flower drifts, worn
  ground under every place, two composed voids. New prop box in
  `src/world/textures-common.ts` (~25 textures).
- **The Brim vista** (kingdom south face, in `buildKingdom`): varied
  wall segments + drum towers, the rebuilt south gatehouse
  (`brimGateTexture`) with red pennants (animated), town rooflines +
  belfry stacked behind the battlements, and the false-perspective
  pencil keep (`keepVistaTexture`, a meadow standee) that fades before
  the walker reaches the wall. Roof/belfry layer fades once inside the
  town. East wall stays draft for Session 3.
- **The title poster**: pulled-back pre-start camera, loader now fully
  lets go before the title letters in (title-veil starts `gone` +
  0.75 s delay), portrait subtitle clamped.
- **Engine**: `hatch()` clips itself (was spraying streaks from every
  wide box); StandeeField wind sway + player-bend (`wind` opt,
  `setPlayer`); region updates receive `(dt, t, px, pz)`; meadow
  ambience (`lark`, `well-plink` events + App ticker); swallows,
  rope-swing pendulum.
- **Gate: WOWED** after 6 rounds — `design/critiques/critique-art-1.md`
  (verbatim, all rounds). Title framing, gate stack, and well/poppy
  cluster are now protected compositions.

### State
- Build green; all 12 lands verified walkable (`tools/shoot.mjs`);
  first-minute framings in `tools/shoot-first-minute.mjs`.
- THE COMMON + the Brim south face hold the bar. Kingdom interior,
  castle, and everything else remain scatter drafts — ladder says
  Session 3 = CASTLE GREYWEATHER + KINGDOM interior.

### Gotchas (new; Session 1's all still apply)
- The keep vista is FALSE PERSPECTIVE (meadow-owned standee at
  z≈−52, fog off). Session 3 must keep its fade (gone by z<12) or
  players catch it standing inside the town.
- The camera passes through the gate arch entering Brim — reads as
  "walking under", but Session 3 should add a proximity fade.
- Meadow lean-grass is never x-flipped: the wind lean is drawn in.
- Headless screenshot pages that aren't foregrounded get rAF-throttled
  (the loader tween never finishes) — `bringToFront()` in shoot
  scripts, and close the desktop page before the portrait one.
- Rooflines/belfry and the vista keep are placeholders the Session 3
  town must REPLACE seamlessly from the south approach: re-shoot
  `09/10` framings and diff against the WOWED sheet before removing.

## Session 1 — 2026-08-28 — the sheet

### Shipped
- The whole engine, ported from `uxpreview/margins` branch
  `claude/margins-s13-quality-bar-ulkjig`: ink library, paper, hand
  lettering + handwriting synthesis, footprints, character, paper
  post-pass, all-procedural audio.
- One continuous 760×560 sheet with twelve walkable lands, roads, a
  river with three bridges, ocean/ponds/oasis; painted wash terrain
  whose pixels double as collision, step timbre and print suppression.
- Region streaming with the ink-in cascade; the vista camera (replacing
  margins' steep page camera — that change is what made landmarks
  visible at distance); per-land music moods; three new step surfaces;
  the hand-drawn map (M); 24 POI notes; localStorage save.
- Hosted: Vercel project `adventure` (imported by owner; the connector
  cannot create projects — 403). **Superseded after Session 4** — the
  world now lives at **https://adventure.ryankm.com**, production
  tracks `main`, and Deployment Protection is off. See Session 4's
  State note.

### State
- Build green (`npm run build` = tsc + vite). All twelve lands verified
  walkable under Playwright with real keys (`tools/shoot.mjs`).
- **Quality: everything is a scatter draft.** No land has faced a gate;
  design/QUALITY-BAR.md now governs; PLAN.md is the ladder; Session 2
  is THE FIRST MINUTE (see PROMPT.md).

### Gotchas
- ~~**Deployment Protection is still ON**~~ — resolved 2026-08-29: no
  password, no Vercel Authentication, no IP allowlist. The link is
  genuinely shareable.
- The sandbox egress proxy blocks the hosted origins — `*.vercel.app`
  AND `ryankm.com` both come back 403 from the CONNECT tunnel. Verify
  deploys through the Vercel MCP tools (`web_fetch_vercel_url`, which
  reaches the custom domain too, plus build logs), never the browser
  and never plain `curl`.
- Commits must be authored `Claude <noreply@anthropic.com>` — the
  owner's iCloud email is push-rejected by GitHub email privacy.
- `?debug` exposes `window.__inklands` (goto, region, terrain probes,
  audio); `tools/shoot.mjs` (all-lands contact sheet),
  `tools/verify-live.mjs` (hosted smoke test) depend on it.
- The camera decides everything: standees taller than ~4 units vanish
  above the frame if you steepen it back toward margins' angle. The
  terrain fog cap eases to full fog past ~2.6× fogFar so the desk never
  bands the horizon — keep that if touching fog.
- StandeeField ghost/cascade is the "world inks itself in" mechanic;
  region builders run once per land at stream-in and must stay
  one-frame cheap.
