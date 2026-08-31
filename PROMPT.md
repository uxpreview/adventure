# PROMPT — Session 11: THE DRY LANDS

You are continuing INKLANDS in `uxpreview/adventure`. Read, in order:
`design/QUALITY-BAR.md` (binding), `design/LAND-SPEC-TEMPLATE.md`,
`design/WORLD-SYSTEMS.md` §1 and §4, **`design/THE-WAITS.md` §4 (HOLT)
and §5 (AMOS), which are the two waits this session authors**,
`design/THE-STRANGERS.md` (S5 lives in both of these lands and is the
only three-land stranger in the game), then `PLAN.md`, `README.md`,
`SESSIONS.md`.

**Session 10's handoff especially.** It is the first land session that
worked against a page it could prove had not moved, and the second half
of its entry is a list of things it got wrong first and the rule each
one produced. Every one of them will bite here.

---

## The job

### 1. SPLITROCK CANYON and THE BLEACH FLATS

Two lands, and they are each other's opposite the way the last two were:
**a hole in the page against the flattest ground in the world.** One is
the most vertical thing on the sheet; the other is the only land whose
whole thesis is that the answer is somewhere else.

The scope, from the ladder: **corridor drama, and the oasis as reward.**
Read `design/specs/` for how the seven finished lands are written up and
write these two the same way.

**Every land ships its places AND its wait AND its named inhabitant:**

- **HOLT** and the boat on the trestles (`THE-WAITS.md` §4). He keeps a
  boat, upside down, oiled, at the top of a dry channel. The marks up
  the wall are not flood records — **they are a list, in the order
  things would float**, and the boat is at the bottom of it. His
  permanent change is that the boat comes off the trestles and goes
  right way up on the dry channel floor, and **the game never says
  whether that is madness or readiness.**
- **AMOS** and the cistern (`THE-WAITS.md` §5). The rain-catch is in
  good order and the cistern is full and it has always been full,
  because he carries the water forty units from the oasis by hand, at
  night, and there is nobody out here to fool. He is not faking a
  rainfall — **he is keeping the thing that catches rain in working
  order.** His permanent change is that the lid comes off.

Both authored *in the world* — in geometry, placement and routine. No
dialogue trees, nothing announced, no count and no list (QUALITY-BAR).
**Session 10's lesson is the one to carry in:** a turn that can be built
into the GEOGRAPHY should never be written into a note. The Penwood's
whole fable is a polyline, and Splitrock has at least as much geometry
to say things with.

### 2. THREE FACTS ABOUT THE GROUND YOU ARE INHERITING, AND ONE OF THEM IS A PROBLEM

Read these before you draw anything. They are all measurable today with
`node tools/check-terrain.mjs`.

- **THE TEAR IS REAL AND IT IS IN THE WRONG PLACE.** Session 4 authored
  it: `tearX(z) ≈ 338 ± 11`, a floor at −10.8 and lips standing proud,
  walls that refuse a walker. But 338 is **forty units from the world's
  curled east margin** (`curlE` starts at x = 344), the tear only exists
  between about z = −272 and z = −132, and **the canyon trail runs at
  x = 255–305 and never goes near it.** So the land called SPLITROCK is
  currently a scatter of mesas with the split off in the corner.
  **Decide this first**, before a single prop: either the tear moves
  west into the middle of its own land — which is a layout-wide audit
  (elevation, the trail, the river's source, the map) and is allowed —
  or the land is re-laid along the tear where it is and the trail is
  brought to it. Either is defensible. Doing neither is what the draft
  already does.
- **THE CANYON IS TEN POINT EIGHT UNITS DEEP AND A STRANGER'S WHOLE
  ERRAND TURNS ON THAT NUMBER.** `THE-STRANGERS.md` S5: *"ODD has
  measured the canyon: ten point eight units from lip to floor, taken
  twice, with a line."* `check-terrain` prints `floor -10.8`. If you
  change the tear's depth, **you change S5 and you say so in the file**;
  if you keep it, it is the most satisfying coincidence in this project
  and it should be left exactly alone.
- **THE RIVER RISES AT THE CANYON'S MOUTH AND THE CHANNEL ABOVE IT IS
  DRY. THIS IS NOT A BUG.** `RIVER[0]` is (318, −108), just inside the
  canyon's southern edge; the tear runs north of it. That is Holt's wait
  already true in the height field — *the river that cut this canyon is
  now somebody else's river* — and the dry channel he keeps his boat
  above is the tear itself. **Do not "fix" it.**

### 3. AND ONE THING THE FLATS' WAIT NEEDS THAT DOES NOT EXIST

`THE-WAITS.md` §0 says THE BLEACH FLATS turns on **`fact:the-fold`**,
earned by *walking the crease, both faces*. Grep the source: the ids
actually wired today are `fact:brim-hour`, `fact:the-place-kept`,
`fact:the-tarn`, `name:beach`, `name:downs`, `name:kingdom`,
`name:ocean`, `reason:brim`, `route:the-line`. **There is no
`fact:the-fold` and nothing teaches it.**

So Amos's wait cannot resolve until this session authors the EARNING as
well as the spending — and the crease is at `foldX(z) ≈ 78 ± 13`, which
is on the Common/Downs border, in two lands this session is not
building. That is fine and it is the point of the whole content system
(`WORLD-SYSTEMS` §6: you carry a fact across a border), but it means
**the Flats' wait has a dependency in somebody else's land and you must
budget for it.** Session 10's Penwood earned its fact by ARRIVAL —
twenty units of proximity, no note, no prompt — and that is the cheapest
honest mechanism available; the crease has two faces, so *both* is the
condition, which is a two-post route rather than a proximity test.

**Whatever you do there must not move THE COMMON's protected framings.**
Session 10 got caught putting grass on their horizon and had to pull it
back east of x = 96. Read that part of `SESSIONS.md`.

---

## The things Session 10 paid for and you get free

- **`node tools/shoot-textures.mjs`** — every drawing in a prop box, at
  actual size, on paper, with no camera and no land in the way, in four
  seconds. **Shoot this FIRST and the world second.** Session 10's first
  gate round had four separate faults in it and it took three full world
  re-shoots to work out which drawing caused which; the texture sheet
  answered all four in one look.
- **`node tools/montage.mjs <dir> <out.png> a.png b.png …`** — a land on
  one sheet instead of one frame at a time. A fault invisible in one
  frame (every hedge the same height; a drove that fords a river) is
  obvious across ten.
- **`node tools/check-fields.mjs`** — new, and it exists because the
  owner found that every animal in the game had been invisible the
  moment it changed posture since Session 5. Run it whenever anything is
  drawn as an instanced field and **especially anything that moves.**
- **`node tools/diff-sheets.mjs`** — run it BEFORE you think you are
  finished. It found a corrugation that had run out of its own land onto
  the world's rim, in a land that session never opened, and nothing else
  would have.
- **The harness owns the clock.** `__inklands.setTime` / `step(dt, n)` /
  `drive` / `learn`. Shoot settled PAST the ink-in cascade (thirteen
  game seconds), drive at least one framing per land, and **photograph
  both states of each wait** — `learn` hands the walker the knowledge so
  a sheet does not have to play the game to get it.

## The laws that will bite these two lands in particular

- **THE CAMERA'S RESTING BEARING IS DUE NORTH AND IT DECIDES LAYOUT.**
  A thing you walk ALONG runs north–south; a thing you LOOK at is north
  of where you stand. **The tear already obeys this** — `tearX` is a
  function of z, so the canyon runs the right way — which is most of why
  it is worth keeping rather than re-cutting. The trail comes in from
  the south-west and that is the part to watch.
- **PLANAR FACES.** This is the land the rule was written for. A canyon
  wall is the biggest run of cliff in the game and the terrain hatches
  down the fall line: keep the walls in straight runs with corners
  between them, the way `HOLD_PLAN` does for the Holdfast, and the way
  paper actually tears.
- **BOUND EVERY TERM IN `elevation.ts` ON ALL FOUR SIDES.** Session 10's
  harrow shipped with no east bound and ran across two other lands.
  These two lands sit against the curled east rim and against each
  other; you will be authoring next to three protected framings
  (`curl-rim`, `tear-lip`, `crease-east-road`).
- **A DECAL IS A FLAT QUAD AT ONE HEIGHT.** Eleven or twelve units is
  the ceiling on curved ground; nineteen buries one side and draws a
  hard straight edge across your land.
- **NEVER USE A FILLED POLYGON AS A COLOUR.** Use the `stain()` helper
  both new texture files carry.
- **SHARE DRAWINGS, INSTANCE PLACEMENTS.** Variety comes from the plan
  and from placement, not from giving every instance its own canvas.
- **A HIDDEN INSTANCE MUST STILL SAY WHERE IT IS** —
  `StandeeField.hide(i, x, z)`, never `set(i, x, -4000, …)`.
- **Nobody crosses a border but the walker.** Holt cannot leave
  Splitrock; Amos cannot leave the Flats — **and Amos's whole wait is a
  forty-unit walk he makes every night**, so his track must stay inside
  his own land and must not touch the oasis's border.
- **`ctx.standee` is the choke point** for the skyline. And Session 10
  found its limit the hard way: **the skyline lifts a name above what is
  standing UNDER it and cannot know what is standing BEHIND it.** In a
  land of tall thin mesas that will happen constantly. Height does not
  solve it; angle does.

---

## One thing that is owed and is your call

**THE PAPER PLANE.** `WORLD-SYSTEMS` §4: one mount per quadrant, *"the
paper plane — the wilds — launched from height — refuses being steered,
mostly"*, and `PLAN.md` says mounts arrive with their quadrant's land
session. The wilds are the east half, Session 10 did not take it, and
**Splitrock's lip and the curled east rim are the two best launch
heights in the world.** So it is overdue and this is its natural home.

It is also a mount, on top of two lands and two waits, and the bar is
explicit that a session that cannot meet it **ships less scope, never a
lower bar**. So: take it, or defer it **in writing** in `SESSIONS.md`
with the reason and the session you are handing it to. What is not
acceptable is it quietly not happening for a third session.

---

## The gate

1. `node tools/check-terrain.mjs`, `node tools/check-audio.mjs`,
   `node tools/check-camera.mjs` and `node tools/check-fields.mjs` all
   pass.
2. `node tools/diff-sheets.mjs` — and **say what moved and why, with the
   bounding boxes.** Session 10 could not hold 92 of 92 because a
   protected framing looks into a land it was building; it said which,
   by how much, where in the frame, and what the verdict was actually
   awarded on. That is the standard: not silence, and not a shrug.
3. **The art director**, on a new sheet: both lands, both viewports, two
   hours, at least one driven framing each, **both states of both
   waits**, and **each land's SHOT**. A land with no composition people
   would share unprompted is not done.
4. Iterate to WOWED. Log the verdicts verbatim in
   `design/critiques/critique-art-7.md`.

---

## Law (short form — QUALITY-BAR.md is the long form)

Zero image assets and zero audio assets; every voice is synthesis and
nothing outside `Audio.ts` invents an instrument, exactly as nothing
outside `palette.ts` invents a colour; all marks via `src/engine/ink.ts`;
`elevation.ts` is the only authority on where the ground is; **the
resting bearing is due north and a stopped walker is always in the
shipped composition**; the medium is the style and never the subject;
nobody crosses a border but the walker; 60fps mobile with DPR capped at
2; the chrome is shot too; build green before every push; the walker has
two dots and nobody else has a face; nothing reads as an array; nothing
is generated, ever; no fifth reward; no count, no list, no percentage,
anywhere, for anything; portrait is judged, not checked. End the
session: pushed, `SESSIONS.md` handoff updated, verdicts logged.

---

## Standing debts, carried forward

They live in `PLAN.md` as well as here, because this file is overwritten
every session.

- **The rowboat's first-meeting composition at THE RIVER MOUTH** is a
  lot of sand. **Four** gates have now passed it and pointedly not
  praised it. *(Note for this session: the rowboat is how
  `route:the-river` is earned, and `route:the-river` is what resolves
  Holt. You will be in that machinery anyway.)*
- **THE HARROW DOWNS' stooked field** and **THE PENWOOD's east arc**
  (Session 10, `critique-art-6`): both passed, neither praised.
- **Brim Square is full.** The next authored thing in that plaza
  displaces something Session 3 earned.
- **The prompt on a very wide subject is still on the subject.** READ
  THE PROCLAMATION is legible on Greyweather's barbican and it is a
  compromise (`critique-camera-1.md`, round 3, noted-not-blocking).

## Not this session's job, and recorded so nobody re-derives them

- **§3.2's rim composition is the riskiest un-shot frame in the game**
  and **Session 12 shoots it FIRST, not last.** Act III is a
  two-hundred-unit look north up an empty straight road from the world's
  south rim, and nothing tall may stand within about eight units of
  x = −45 between z = 120 and z = 278.
- **SESSION 12 IS THREE LANDS** (Maple Court, Greyline City, the Cubicle
  Mile) plus the 8:15 drawn into existence, against Session 10's and 11's
  two apiece. If that is going to be split, the session that notices
  should say so in `PLAN.md` rather than the one that runs out of room.
- **The story gate returned NOT YET** (`critique-story-2.md`), with two
  mandatory findings belonging to the sessions that build Acts I and IV.
- The remaining WAITS, the eight STRANGERS and the three inventories are
  the authoring queue.

## Waiting on the owner, and none of it blocks you

1. **THE EAR GATE on the score.** Nineteen WAVs handed over unperformed
   (`critique-score-1.md` §4), and Session 10 added six more voices and
   one authored silence to them. **Nobody has heard the game.**
2. **THE FEEL GATE on the camera.** Session 9 shipped a bearing it could
   measure and could not judge. The evidence is `shots-s9/`: the walk
   south, every station shot twice. **Does it help, or does the world
   wobble?**
3. **Whether the STORY GATE becomes a standing critic**, and whether its
   NOT YET blocks Acts I and IV or merely annotates them.
4. **The STORY EDITOR**, proposed as a third standing critic.
5. **The premise line's rewrite** and **two surviving similes**.
6. **A seventh content tier, THE LOCAL RULE** (`QUESTS.md` §8),
   proposed and explicitly not ratified.
