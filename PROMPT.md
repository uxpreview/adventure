# PROMPT — Session 12: THE NOW

You are continuing INKLANDS in `uxpreview/adventure`. Read, in order:
`design/QUALITY-BAR.md` (binding), `design/LAND-SPEC-TEMPLATE.md`,
`design/WORLD-SYSTEMS.md` §1, §5 and §10, **`design/THE-WAITS.md` §3
(VAL) and §11 (THE MAN AT THE JUNCTION), which are the two waits this
session authors**, **`design/THE-LINE.md` §3.2, which is the riskiest
un-shot frame in the game and is in your rect**, then `PLAN.md`,
`README.md`, `SESSIONS.md`.

**Session 11's handoff especially.** It moved a piece of the sheet six
verdicts had been awarded on, and the second half of its entry is a list
of things it got wrong first with the rule each one produced. Four of
them will bite here and one of them — the size of a person — will bite
in the first hour.

---

## The job

### 0. THE SESSION WAS THREE LANDS AND IT IS NOW TWO

`PLAN.md` had Session 12 as MAPLE COURT + GREYLINE CITY + THE CUBICLE
MILE *plus the 8:15 drawn into existence*. **Session 11 split it, in
writing, in `PLAN.md`, which is what the ladder asked the session that
noticed to do.** THE CUBICLE MILE and the 8:15 are Session 13, because
the 8:15 is not a land's worth of work — it is a MOUNT, an ACT, and the
payoff the whole road has been walking toward since the first minute,
and putting it third on a list is how it gets built in the last hour of
something.

So: **two lands, two waits, two named inhabitants, one gate.** That is
the shape that has now held twice.

### 1. SHOOT §3.2's FRAME FIRST. NOT LAST.

`design/THE-LINE.md` §3.2 and `PLAN.md` have both said for five sessions
that **Act III is a two-hundred-unit look north up an empty straight
road from the world's south rim, and nothing tall may stand within about
eight units of x = −45 between z = 120 and z = 278.** That corridor runs
up the middle of MAPLE COURT, which is one of your two lands, and it has
**never been photographed.**

Stand at (−45, 262) and look north before you place anything. Then
place, and shoot it again after every round. Session 5 lost two rounds
to a boardwalk laid the wrong way; this is the same mistake available
one more time, in the one composition that cannot afford it. Main
street's houses, trees, cars and hedges go BESIDE the king's road, never
on its axis.

### 2. TWO LANDS, AND THEY ARE BOTH ABOUT A STREET

The scope from the ladder is **street rhythm, lit windows at dusk, the
junction.** Read `design/specs/` for how the nine finished lands are
written up and write these two the same way.

**Every land ships its places AND its wait AND its named inhabitant:**

- **VAL** and the porch light (`THE-WAITS.md` §3). The light is on at
  every hour, including the ones nobody is awake for, and it is not on
  for the people who left — **it is on for the STREET**, because a dark
  house on this road means the family went. Her permanent change is
  that a gap in a hedge is cut back open and Greyweather's ridge is on
  the skyline of a back garden. **§3 carries an authoring note written
  for you: the three chairs face NORTH, because the whole beat is a
  sightline and the castle is three hundred units up the sheet on the
  same axis as the line.** Do not put the gap on the east side toward
  the city however much the fiction wants it.
- **THE MAN AT THE JUNCTION** (`THE-WAITS.md` §11). He stands still in
  the one land where standing still is shameful, and the pavement round
  him is worn into the paths everybody takes to avoid him. He is not
  waiting to be met. **He is waiting to be ASKED**, and asking costs
  four seconds of stopping, which nobody in this city will spend. His
  wait needs no knowledge at all: **you stop walking**, near him, long
  enough that it is unmistakably a choice, and he goes and sits on the
  bench. **The worn paths stay worn**, curving round a place where
  nobody is standing any more. **He has no name and the map never marks
  him.**

Both authored *in the world* — in geometry, placement and routine. No
dialogue trees, nothing announced, no count and no list (QUALITY-BAR).

### 3. THE THING SESSION 11 WOULD TELL YOU IF IT COULD ONLY SAY ONE

**AUTHOR THE GROUND FIRST, AND SIZE EVERYTHING AGAINST A PERSON.**

A doodle-folk figure is **1.7 units wide and 2.75 tall** — Brack, Joan,
Hallows, Holt and Amos all are. Nothing wrote that down until Session
11's handoff, and round 2 of its gate was one finding: the whole of both
its lands had been drawn half again life size, and the first framing of
its flagship land was a sixteen-unit wireframe hoop filling half the
screen. **Scale first, then place.** A car is about 4.5 × 1.6. A
two-storey house is about 8 wide and 6 to the ridge. A tower in Greyline
is the only thing in either land allowed to break that, and it should
break it on purpose.

And the ground: MAPLE COURT and GREYLINE CITY have `COCKLE` of 0.75 and
0.22, which is most of what their terrain is today. The Downs got a
harrow, the Penwood got a bowl and the Flats got a pan, and in every
case twenty minutes of `elevation.ts` is why the land composes. **A city
grid on dead flat paper is the one land in this game that might be
right to leave flat — but that has to be a DECISION, written down, not
the absence of one.**

---

## The things Sessions 10 and 11 paid for and you get free

- **`node tools/shoot-textures.mjs`** — every drawing in a prop box, at
  actual size, on paper, with no camera and no land in the way, in four
  seconds. **Shoot this FIRST and the world second.** Session 11 ran its
  entire first gate round on it and it found six faults in one look,
  four of which would have cost a world re-shoot each to isolate. *(It
  needs the DEV server — `npx vite --port 4173` — because it imports
  `/src/...`, not `dist`.)*
- **`node tools/montage.mjs <dir> <out.png> a.png b.png …`** — a land on
  one sheet. Three of Session 11's five mandatory findings are invisible
  in any single frame and obvious across six.
- **`node tools/check-fields.mjs`** — run it whenever anything is drawn
  as an instanced field and **especially anything that moves.** Add your
  two lands to its `CASES`.
- **`node tools/diff-sheets.mjs`** — run it BEFORE you think you are
  finished.
- **The harness owns the clock.** `__inklands.setTime` / `step(dt, n)` /
  `drive` / `learn`. Shoot settled PAST the ink-in cascade (thirteen
  game seconds), drive at least one framing per land, and **photograph
  both states of each wait**.

## The laws that will bite these two lands in particular

- **THE CAMERA'S RESTING BEARING IS DUE NORTH AND IT DECIDES LAYOUT** —
  and this session has the two lands where that is hardest, because a
  city is a GRID and half a grid runs east–west. Main street runs
  east–west across your rect today (`layout.ROADS`) and it is part of
  THE LINE. **A cross street is a thing you look ALONG only if it runs
  north.** Session 11 lost a round to a place that was right at a
  standing point that was ninety degrees wrong; a city can lose four.
- **THE PROTECTED CORRIDOR** (§3.2, above). It is not a guideline.
- **BOUND EVERY TERM IN `elevation.ts` ON ALL FOUR SIDES.** Bumps are
  bounded by construction; smoothsteps are not, and Session 10's harrow
  ran across two lands because of one missing bound.
- **A DECAL IS A FLAT QUAD AT ONE HEIGHT** on flat ground — but on a
  slope it lies along the page's NORMAL, which is what makes it work on
  a wall (Session 11). Eleven or twelve units is the ceiling on curved
  ground.
- **NEVER USE A FILLED POLYGON AS A COLOUR.** Use `stain()`. The one
  exception Session 11 found: a filled polygon IS allowed as a
  SILHOUETTE, because rock is opaque and a stain fades to nothing
  exactly where a solid thing needs to be solid.
- **SHARE DRAWINGS, INSTANCE PLACEMENTS.** A city is the land where this
  matters most and where it is most dangerous: a street of identical
  houses is a bar violation, and a street of unique canvases is thirty
  megabytes. Variety comes from the PLAN.
- **A HIDDEN INSTANCE MUST STILL SAY WHERE IT IS** —
  `StandeeField.hide(i, x, z)`.
- **Nobody crosses a border but the walker.**
- **AND THE SKYLINE CANNOT KNOW WHAT IS BEHIND A LABEL.** In a city of
  towers that will happen constantly. Height does not solve it; angle
  does.

---

## What is owed, and what this session should decide

1. **THE STORY GATE'S SECOND MANDATORY FINDING IS ACT IV's AND IT IS
   SESSION 13's** (`critique-story-2.md`): the ending's default witness
   sees one stop, so the likeliest single ending in the game is a train
   stopping at an empty platform. The fix is that the 8:15 **arrives
   already carrying the lands above you**. Do not build it here; do not
   build anything that makes it harder.
2. **THE STORY GATE'S FIRST FINDING IS ACT I's**: everything downstream
   of *nobody can leave* and *you can* hangs on Nell stopping at the
   Brim border, which only happens to a player who walks north having
   met her — and the co-walker wants to be a rule of the world on any
   road out of any land. **MAPLE COURT is on the line and has roads out
   of it in three directions**, so if you want to take that finding,
   this is the cheapest session in which to prove the rule.
3. **`design/QUESTS.md` §8's seventh content tier, THE LOCAL RULE**, is
   still proposed and not ratified. Not yours unless the owner rules.

---

## The gate

1. `node tools/check-terrain.mjs`, `node tools/check-audio.mjs`,
   `node tools/check-camera.mjs` and `node tools/check-fields.mjs` all
   pass.
2. `node tools/diff-sheets.mjs` — and **say what moved and why, with the
   bounding boxes and the sentence each verdict was actually awarded
   on.** Session 11 moved four framings by up to seventy-five per cent
   and said exactly which, by how much, where in the frame, and what was
   still intact. That is the standard: not silence, and not a shrug.
3. **The art director**, on a new sheet: both lands, both viewports, two
   hours (and a city wants **dusk** more than any land in this world —
   `HOUR=19.6`), at least one driven framing each, **both states of both
   waits**, **each land's SHOT**, and **§3.2's corridor**.
4. Iterate to WOWED. Log the verdicts verbatim in
   `design/critiques/critique-art-8.md`.

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

- **THE MARKS in SPLITROCK reads as a standing stone rather than as a
  face of the wall**, and **the west bench is a place a player can stand
  inside a cluster of rock and see four flat cutouts overlapping**
  (Session 11, `critique-art-7`). The second is the oldest problem this
  engine has and that land avoids it rather than solving it.
- **The rowboat's first-meeting composition at THE RIVER MOUTH** is a
  lot of sand. **Five** gates have now passed it and pointedly not
  praised it — and it matters more than it did, because
  `route:the-river` is what resolves HOLT two hundred units away.
- **THE HARROW DOWNS' stooked field** and **THE PENWOOD's east arc**
  (Session 10): both passed, neither praised.
- **Brim Square is full.** The next authored thing in that plaza
  displaces something Session 3 earned.
- **The prompt on a very wide subject is still on the subject.** READ
  THE PROCLAMATION on Greyweather's barbican is a compromise.

## Not this session's job, and recorded so nobody re-derives them

- **SESSION 13 IS THE CUBICLE MILE AND THE 8:15**: a land, DENNIS's
  wait, the mount, and Act IV's machinery including the story gate's
  ending fix.
- **SESSION 14 IS MOTION & LIFE, AND IT OWNS THE PAPER PLANE.** Session
  11 deferred it in writing with its reason (`PLAN.md`, `SESSIONS.md`):
  a mount that *refuses being steered, mostly* is a motion system before
  it is a vehicle, and by then SPLITROCK's lip will have held a verdict
  for three sessions, so the launch height is settled ground.
- The remaining WAITS, the eight STRANGERS and the three inventories are
  the authoring queue.

## Waiting on the owner, and none of it blocks you

1. **THE EAR GATE on the score.** Nineteen WAVs handed over unperformed
   (`critique-score-1.md` §4); Sessions 10 and 11 have added twelve more
   voices and one authored silence to them. **Nobody has heard the
   game.**
2. **THE FEEL GATE on the camera.** The evidence is `shots-s9/`: the
   walk south, every station shot twice. **Does it help, or does the
   world wobble?**
3. **Whether the STORY GATE becomes a standing critic**, and whether its
   NOT YET blocks Acts I and IV or merely annotates them.
4. **The STORY EDITOR**, proposed as a third standing critic.
5. **The premise line's rewrite** and **two surviving similes**.
6. **A seventh content tier, THE LOCAL RULE** (`QUESTS.md` §8),
   proposed and explicitly not ratified.
