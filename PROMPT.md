# PROMPT — Session 13: THE NOW

You are continuing INKLANDS in `uxpreview/adventure`. Read, in order:
`design/QUALITY-BAR.md` (binding), `design/THE-LINE.md` **§3.2** (which
is an authoring brief addressed to this session and is the riskiest
un-shot frame in the game), `design/THE-WAITS.md` **§3 and §11**,
`design/THE-STRANGERS.md` **S3**, `design/WORLD-SYSTEMS.md` §5 and §10,
then `PLAN.md`, `README.md`, `SESSIONS.md`.

**Session 12's handoff first.** It was not a land session and it changed
the camera every one of your compositions is framed through.

---

## 0. YOU ARE THE FIRST LAND SESSION SINCE THE CAMERA STOPPED LEANING

Session 12 ran THE FEEL GATE — the owner played the game — and it
returned NOT YET. The automatic yaw is gone from both rigs. **Walking no
longer turns the frame at all**, and `check-camera.mjs` asserts it at
1°/s, which is how you write zero and survive an easing term.

Three consequences, and none of them is optional:

1. **Every composition you author is judged dead north, and now it is
   dead north when the player is MOVING too.** The old envelope gave a
   walker a 26° lean; there was always an argument that a thing slightly
   off-axis would swing into frame. **There is no longer any such
   argument.** A place staged east of its viewpoint is 90° out and stays
   there. `QUALITY-BAR` §3's layout law was already binding; it is now
   the only thing there is.
2. **The astern opening survived and it is the term you author against.**
   Walking south the rig gives ground and drops its aim: 17.4 units of
   page in front of the walker instead of 3.5. **Maple Court is where
   the line's southward walk ENDS** — the king's road runs down the
   sheet and the rim is at the bottom of it, so the approach to §3.2's
   composition is the exact motion that opening exists for. No land
   session has authored into it yet. Use it.
3. **`diff-sheets` came back 92/92 bit-identical on the page**, so
   nothing you inherit has moved. If a protected framing moves this
   session, it moved because of you.

---

## 1. THE JOB: TWO LANDS, TWO WAITS, TWO PEOPLE

The shape every land session since 10 has held. `PLAN.md` row 13.

### 1a. MAPLE COURT — `neighborhood`, rect x −150..60, z 120..280

**VAL** (`THE-WAITS` §3). She leaves the porch light on, and the turn is
that it is not for the people who left — **it is for the street**, so
the road still counts as lived on. Her three places are the porch light,
THE GREEN (built, has a note), and **the three chairs facing a hedge**,
which is the `WORLD-SYSTEMS` §10 tableau and is a joke about suburbia
until you notice the hedge closed over a **gap**.

**The permanent change:** come back holding `name:greyweather` and the
gap is cut back open, and Greyweather's ridge is on the skyline of a
back garden, **north, in frame**, and it stays cut.

> **The chairs face north.** `THE-WAITS` §3's authoring note says it in
> capitals and Session 12 removed the last excuse for ignoring it: *a
> vista you cannot look along is not a vista.* Do not put the gap on the
> east side toward the city however much the fiction wants it.

### 1b. GREYLINE CITY — `city`, rect x 60..230, z 130..280

**THE MAN AT THE JUNCTION** (`THE-WAITS` §11). He stands still in the
one land where standing still is shameful. **He has no name, nothing in
this game will ever name him, and the map will never mark him.** His
three places are THE JUNCTION (built, has a note — four lights, all
green), **the pavement worn into paths that curve around him**, and a
bench twenty units off that nobody has ever used.

**The turn:** he is not waiting for somebody to arrive, he is waiting
**to be asked**, and asking costs four seconds of standing still, which
is why nobody has in years. **The permanent change has no knowledge
gate: you stop walking.** Stand near him long enough that it is
unmistakably a choice and he goes and sits on the bench, and stays there
in every later save. **The worn paths stay worn**, curving round a place
where nobody is standing any more.

> **The worn paths are the whole wait and they are a DRAWING, not a
> note.** They are the shape of about a million small decisions and they
> have to read as ground wear at this camera. `SurfaceZones.ts` and the
> footprint system are both already in the engine; neither has ever been
> asked to draw a permanent path. Solve this before you place a single
> tower — if the wear does not read, the land has no wait.

### 1c. AND S3 CROSSES BETWEEN THEM, so build both halves of it

`THE-STRANGERS` S3 — **THE ELEVEN UNITS**, the upsetting one. **JUNE**
leaves her gate on the latch in the last house before the border; the
latch plate is worn bright from being lifted and set back every night
for years. Bring back what you saw at the junction and she walks to the
fence at the end of the road and **stays there** — a second person
standing still, forty units from the first, on the other side of a line
neither of them can cross.

**Never says** who they are to each other, that they are waiting for
each other, or that forty units is nothing. **Especially not that.**

This is the only stranger whose two ends are both in this session's
scope, so it is cheap here and expensive anywhere else.

---

## 2. §3.2's RIM IS SHOT FIRST, AND THE DRAFT ALREADY BREAKS ITS RULE

**THE END OF THE SURVEY**, at (−45, 262) to (−45, 278). Two hundred
units of dead straight empty road running north into haze, three units
below your feet, and **you cannot see where it ends — you can see that
it does not stop.** There is no note. It is the one place in the game
important enough to leave unlettered.

`THE-LINE.md` §3.2 puts one constraint on you and writes it in the file
because *later is too late*:

> **Nothing tall may stand within about eight units of x = −45 anywhere
> between z = 120 and z = 278.**

**AND THE SHIPPED DRAFT ALREADY VIOLATES IT.** Do not go looking; it is
one line, and it is the kind of thing that survives four sessions
because nobody measured it:

```
src/world/regions/civic.ts, buildNeighborhood:
  ctx.standee(signpostTexture(1113), 3.4, 4.1, -40, 196);
```

x = −40 is **five units** off the axis, z = 196 is in range, and it is
4.1 tall. It stands in the corridor. **There is a second, subtler one:**
the street trees are `ctx.scatter(30, { minDist: 10 })`, and `scatter`
only avoids the road's own paint by default — the corridor is eight
units and the paint is narrower than that, so a tree may legally land
beside the road and inside the sightline. Bound them explicitly with
`avoid`.

**Shoot the rim FIRST, before you place anything**, and shoot it again
at the end. It is also the first framing in the game to be judged
through a camera that no longer leans, and the approach to it is a walk
south — the one motion Session 12 kept and improved — so it is the
frame most exposed to what that session did.

---

## 3. WHAT THESE TWO LANDS ARE, AS DRAFTS, AND IT IS THE SAME WORD BOTH TIMES

`ctx.scatter`. `buildNeighborhood` lays houses on a 24-unit `for` loop
down two fixed offsets; `buildCity` lays towers on a 21-unit loop; the
shopfronts are `76 + i * 15`; the lamps are `78 + i * 30`. That is
**even spacing, repeated silhouettes and uniform density**, which is the
three-part definition of "reads as an array" in `QUALITY-BAR` §4, and it
is what every land session since 5 has had to throw away first.

**Places, not coverage: 4–7 NAMED places per land with walks between
them.** Both lands currently have two POIs each and neither has a SHOT.

**And these two are the hardest pair in the world for one specific
reason:** they are the only lands whose subject is **the present day**.
Every other land is old, weathered or empty, and the ballpoint flatters
all three. A suburb and a downtown drawn in the same pen will look like
a tech demo the instant the drawing is generic — and `INSPIRATION.md`'s
whole refusal is games that are filled rather than authored. **The
medium is the style and never the subject** (`WORLD-SYSTEMS` §0): no
content about the paper, the pen, or whoever drew it, however tempting a
suburb makes it.

---

## 4. AND THE GATES

Same discipline, no exceptions:

1. **Shoot `tools/shoot-textures.mjs` first, always.** Two full rounds
   of Session 11's gate never rendered the world at all and found twelve
   classes of fault between them.
2. **The art director** on a contact sheet of both lands, wide / mid /
   detail, **desktop and portrait**, at two hours. Iterate to WOWED. Log
   the verdict in `design/critiques/`.
3. **`node tools/diff-sheets.mjs` BEFORE you think you are finished** —
   it takes about half an hour, so start it and write your specs while
   it runs. Session 10 found a corrugation running across two lands it
   never opened, and only the diff could have. **You are next to THE
   COMMON, and `common-wide` and `common-THE-SHOT` both look south into
   your land.**
4. **The whole gauntlet**, because two new lands touch all of it:
   `check-terrain`, `check-audio`, `check-fields`, `check-camera`,
   `diff-sheets`, `shoot-mobile`.
5. **Write the specs** — `design/specs/maple-court.md` and
   `design/specs/greyline-city.md`, per `LAND-SPEC-TEMPLATE.md`.

**If a machine on your desk is not the build sandbox**, every tool takes
`$PW_CHROMIUM` (`tools/pw.mjs`, Session 12). Nineteen tools used to
hard-code one absolute path and fail at their first line anywhere else.

---

## 5. THE TWO GATES THAT ARE STILL THE OWNER'S, AND ONE IS OWED TWICE

`QUALITY-BAR` §2, and Session 12 is the whole argument for taking this
seriously:

> **A system whose gate has not been run is not done. It is SHIPPED AND
> UNJUDGED, and those are two different words.**

1. **THE FEEL GATE, AGAIN.** Session 12 fixed what a person felt and
   **no tool it left behind can say whether the fix feels better** — nor
   whether 4.1 is the right walk, 1.5× the right run, or whether an
   eleven-degree lean reads at forty pixels on a real screen. It is owed
   the week it is owed, not carried in a list. That is the lesson that
   cost three sessions.
2. **THE EAR GATE.** Twenty-five WAVs and one authored silence, handed
   over unperformed since Session 8. **Nobody has heard this game.**
   `node tools/render-wavs.mjs`.

---

## 6. ONE DECISION THAT IS NOT YOURS TO MAKE ALONE

Session 12 found a live contradiction while reading and deliberately did
not fix it, because the map earned a WOWED in `critique-story-1` and
un-writing a judged composition needs its own gate rather than a
drive-by:

```
src/ui/map.ts:246
  `${found} of ${REGION_SPECS.length} lands walked — ${walked} strides of ink`
```

That is a count and a total. The law's short form says **no count, no
list, no percentage, anywhere, for anything**, and `Save.ts`'s own
comment claims it does not exist — *"there is no count kept anywhere and
nothing reads `.length`"* — on the line above one that reads `.length`.
**Somebody has to decide which of the two rules is real.** Put it to the
owner; do not quietly delete a judged composition and do not quietly
keep breaking the law.

---

## Law (short form — QUALITY-BAR.md is the long form)

Zero image assets and zero audio assets; every voice is synthesis and
nothing outside `Audio.ts` invents an instrument, exactly as nothing
outside `palette.ts` invents a colour; all marks via `src/engine/ink.ts`;
`elevation.ts` is the only authority on where the ground is; **the
resting bearing is due north, walking does not turn the frame, and a
stopped walker is always in the shipped composition**; the medium is the
style and never the subject; nobody crosses a border but the walker;
60fps mobile with DPR capped at 2; the chrome is shot too, **on the
desktop as well as the phone**; build green before every push; the
walker has two dots and nobody else has a face; nothing reads as an
array; nothing is generated, ever; no fifth reward; no count, no list,
no percentage, anywhere, for anything; portrait is judged, not checked.
End the session: pushed, `SESSIONS.md` handoff updated, verdicts logged.

---

## What Session 12 left you

- **`node tools/shoot-mobile.mjs`** shoots FIVE rigs now, including
  1280×720 with a mouse, and its joystick step is an **assertion** with
  the opposite expectation on each: a thumb must raise the stick, a
  mouse must raise nothing. `RIG=<name>` runs one.
- **`node tools/check-camera.mjs`** asserts three RATES as well as the
  envelope: walking may not turn the frame (1°/s), a held peek is capped
  at 45°/s and a reversed one at 80, and **the rig may never give ground
  faster than the walker covers it** (4.1 u/s).
- **`node tools/shoot-session12.mjs`** — THE SHOT of all nine built
  framings, both viewports, on the harness clock with the chrome swept.
  Point it at your two lands by editing its list; it is the cheapest
  "did I break anybody else's land" sheet in the repository.
- **`tools/pw.mjs`** — the browser path, resolved instead of asserted.
- **`design/specs/controls.md`** — what each device gets and why.

## Standing debts, carried forward

They live in `PLAN.md` too, because this file is overwritten every
session.

- **The rowboat's first-meeting composition at THE RIVER MOUTH.** Five
  gates have passed it and pointedly not praised it, and `route:the-river`
  is what resolves HOLT, so that boat is the front door of a wait.
- **THE HARROW DOWNS' stooked field**, **THE PENWOOD's east arc** and
  **THE BLEACH FLATS' `WHERE THE ROAD STOPS`**: all passed, none
  praised. The last is two posts and some cracked ground at the end of
  the longest road in the world.
- **Holt's lit window** is one warm pixel at forty units. It is the only
  lit window in the east half of the world and it deserves a glow.
- **Brim Square is full.** The next authored thing in that plaza
  displaces something Session 3 earned.
- **READ THE PROCLAMATION** on Greyweather's barbican is a compromise
  (`critique-camera-1.md`, round 3, noted-not-blocking).

## Not this session's job, and recorded so nobody re-derives them

- **THE 8:15 is Session 14**: THE CUBICLE MILE, DENNIS, and the mount —
  **you draw the 8:15 into existence and it arrives.** Do not spend the
  reveal early. Maple Court and the city are Act III's *approach*, and
  §3.4 is explicit that **no character may ever hold Act III's fact** —
  Dennis does not know what the road is, because knowing would require
  crossing. **Nobody in your two lands may know either.**
- **THE PAPER PLANE**, deferred in writing by Session 11 with its brief
  and its reason (`PLAN.md`, `WORLD-SYSTEMS` §4). It launches from
  Splitrock's east lip or the curled rim; it refuses being steered
  *mostly*; and it must not trivialise the walk back round the canyon's
  mouth.
- **The story gate returned NOT YET** (`critique-story-2.md`), with two
  mandatory findings belonging to the sessions that build Acts I and IV.
  Neither is yours, but the second one — the ending's default witness —
  is about the 8:15 arriving already carrying the lands above you, and
  **GREYLINE CITY is one of the lands it would be carrying.**
- The remaining WAITS, the eight STRANGERS and the three inventories are
  the authoring queue.
