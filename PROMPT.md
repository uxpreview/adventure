# PROMPT — Session 10: FARM & FOREST

You are continuing INKLANDS in `uxpreview/adventure`. Read, in order:
`design/QUALITY-BAR.md` (binding), `design/LAND-SPEC-TEMPLATE.md`,
`design/WORLD-SYSTEMS.md` §1 and §5, **`design/THE-WAITS.md` §7 (BRACK)
and §10 (JOAN HARROW), which are the two waits this session authors**,
`design/THE-STRANGERS.md` (the errands and encounters in these two
lands), then `PLAN.md`, `README.md`, `SESSIONS.md`.

**Session 9's handoff especially, and this time for the tools rather
than for the camera.** It left you a harness that pins every clock in
the game and steps the world in game seconds, and a regression gate that
returns a number. Both change how a land session should work, and the
second half of this file is mostly about that.

---

## The good news, and it has not been true before

**There is nothing structural left.** Elevation, the camera, traversal,
time, the score, the story and the bearing are all built. This is the
first of **five land sessions in a row** with nothing on the board that
can displace them, and the ordering rule is finally satisfied: every
system that changes how a land is authored has landed.

So the ladder is what it says it is. Build the lands.

---

## The job

### 1. THE HARROW DOWNS and THE PENWOOD

Two lands, and they are each other's opposite, which is the whole
reason they share a session: **field patchwork against pine dark.** One
is worked, open, in daylight, and has a date on it; the other is closed,
still, and has a forty-year silence in the middle of it.

The scope, from the ladder: **the field patchwork, the tarn, the forest
track**, plus THE MILL, which is built and has a note. Read
`design/specs/` for how the five finished lands are written up and write
these two the same way.

**And from Session 7 the shape of a land session is fixed:** every land
ships **its places AND its wait AND its named inhabitant.** So:

- **JOAN HARROW** and the picnic laid for two (`THE-WAITS.md` §10). She
  is the counterweight of the whole story — the only person in this
  world waiting for something that arrives — and her register is the
  only one in the game that is not wry. **Do not be clever in the
  Downs.** Her permanent change is that **you sit down**, and the second
  setting stays out afterwards.
- **BRACK** and the tarn (`THE-WAITS.md` §7). He will not go within
  forty units of it and never has his back to it, and **the forest track
  is his forty-year circle worn into the ground until it became a
  road everybody else uses.** The turn is that the geography of a whole
  land is one man's caution outliving the fear that made it. His
  permanent change is one figure and one quarter turn.

Both waits are authored *in the world*, in postures and placement and
routine — no dialogue trees, nothing announced, no count and no list
(QUALITY-BAR). Brack's forty units is a behaviour, not a note.

### 2. THE THINGS THAT ARE NOW EASY AND WERE NOT

Take them, because they were expensive in every previous land session
and they are nearly free now:

- **The elevation is authored, not sprinkled.** These two lands are the
  BUCKLE (the downs roll — `WORLD-SYSTEMS` §1) and whatever the Penwood
  needs. `src/world/elevation.ts` is the only authority; re-run
  `node tools/check-terrain.mjs`.
- **The voices are already assigned** (`Audio.ts`, `LAND_VOICE`): both
  lands are the plucked string, the Penwood damped and dark and the
  Downs the same wood out in the light. The bed and the ambient events
  are yours to author; `node tools/check-audio.mjs` will re-measure them
  and will fail if a level drifts.
- **Both lands have a wait, an inhabitant, four errands and a handful
  of encounters already written.** You are not inventing content, you
  are staging it.

### 3. AND THE TOOLING SESSION 9 LEFT YOU — USE IT, IT CHANGES THE WORK

- **`node tools/diff-sheets.mjs` with no arguments** now diffs the
  working tree against `origin/main` with every clock pinned, and says
  in a number whether the six protected lands moved. **Run it before you
  push, not after somebody asks.** A land session that touches
  `elevation.ts` is exactly the kind that regresses a neighbour's
  composition by a unit of ground, and this is the first session that
  can catch it.
- **The harness owns the clock.** `__inklands.setTime` pins the world's,
  the paper's, the walker's, the water's; `__inklands.step(dt, n)` runs
  fixed ticks and renders one frame. **A twelve-game-second settle now
  costs a third of a second instead of seventy**, so:
  - shoot your sheets settled PAST the ink-in cascade (it takes eight
    seconds of game time to cross a land — every framing shot before
    Session 9 was shot on a page still drawing itself);
  - and drive the walker properly. `tools/shoot-bearing.mjs` walks four
    hundred and eighty units and finishes in minutes. Copy its `frame`
    helper rather than holding keys for fourteen seconds.
- **Shoot at least one DRIVEN framing per land.** Session 8's pigeons
  were wrong for four sessions because every framing this project owned
  was a stand-still. The Downs have sails and sheep; the Penwood has a
  man who turns.

---

## The laws that will bite a land session, and one of them is new

- **THE CAMERA'S RESTING BEARING IS DUE NORTH AND IT STILL DECIDES
  LAYOUT.** Session 9 gave the camera a bearing and **did not change
  this.** A stopped walker is at yaw zero by contract; the envelope is
  26° on desktop and 12° in portrait and only while MOVING; a place
  staged east of its viewpoint is still sixty-four degrees out of frame;
  and the envelope cannot grow, because past 35° a paper cutout stops
  reading as paper. **A thing you walk ALONG runs north–south. A thing
  you LOOK at is north of where you stand.** Session 5 lost two rounds
  to this and the turning camera does not buy them back.
- **Author landforms with PLANAR FACES.** A doubly-curved landform has
  no constant fall line to hatch down and comes out as a thumb print.
- **Nothing reads as an array**, and a forest is the single easiest
  place in this project to break that rule. Authored clusters,
  deliberate voids, occlusion layers, edges that decay.
- **Nobody crosses a border but the walker.** Brack cannot leave the
  Penwood; Joan cannot leave the Downs.
- **A name is written above what it names** now (Session 9's skyline).
  You get that for free — but if you author a tall thing that a POI sits
  under, check the label in the sheet rather than assuming.
- **`ctx.standee` is the choke point.** Anything hung in the air uses
  `ctx.groundY` / `ctx.hang`; a bare `position.y` is a Session-3 bug
  waiting to be found in Session 12.

---

## The gate

1. `node tools/check-terrain.mjs`, `node tools/check-audio.mjs` and
   `node tools/check-camera.mjs` all pass.
2. `node tools/diff-sheets.mjs` — **the page does not move.** Session 9
   left it at 92 of 92 framings bit-identical; anything less than that
   is a regression and it now has a name and a number.
3. **The art director**, on a new sheet: both lands, both viewports, two
   hours, at least one driven framing each, and **each land's SHOT**.
   A land with no composition people would share unprompted is not done.
4. Iterate to WOWED. Log the verdicts verbatim in
   `design/critiques/critique-art-6.md`.

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
  lot of sand. **Three** gates have now passed it and pointedly not
  praised it.
- **Brim Square is full.** The next authored thing in that plaza
  displaces something Session 3 earned.
- **The prompt on a very wide subject is still on the subject.** READ
  THE PROCLAMATION is legible on Greyweather's barbican and it is a
  compromise (`critique-camera-1.md`, round 3, noted-not-blocking).

## Not this session's job, and recorded so nobody re-derives them

- **§3.2's rim composition is the riskiest un-shot frame in the game**
  and **Session 12** shoots it FIRST, not last. Session 9 re-checked its
  numbers against the new camera and none of them moved — the rim is a
  stand-still and a stopped walker is due north.
- **The story gate returned NOT YET** (`critique-story-2.md`), with two
  mandatory findings belonging to the sessions that build Acts I and IV.
- The twelve WAITS, the eight STRANGERS and the three inventories are
  the authoring queue.

## Waiting on the owner, and none of it blocks you

1. **THE EAR GATE on the score.** Nineteen WAVs handed over unperformed
   (`critique-score-1.md` §4). Nobody has heard the game.
2. **THE FEEL GATE on the camera.** Session 9 shipped a bearing it could
   measure and could not judge (`critique-camera-1.md`, and QUALITY-BAR
   §2 now carries the rule for both gates). The evidence is `shots-s9/`:
   the walk south, every station shot twice — the shipped page, then
   this one. **Does it help, or does the world wobble?**
3. **Whether the STORY GATE becomes a standing critic**, and whether its
   NOT YET blocks Acts I and IV or merely annotates them.
4. **The STORY EDITOR**, proposed as a third standing critic.
5. **The premise line's rewrite** and **two surviving similes**.
6. **A seventh content tier, THE LOCAL RULE** (`QUESTS.md` §8),
   proposed and explicitly not ratified.
