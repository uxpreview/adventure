# PROMPT — Session 18: THE ROADS

You are continuing INKLANDS in `uxpreview/adventure`. Read, in order:
**`design/THE-FUN-PASS.md` in full** (the owner's brief; binding), §8
twice (the roads — nothing empty for fifteen seconds, midpoints,
mounts as fun), §7 (districts, the layer built in 16 and populated for
one land), §3 (the seven things, and item 7 is this session's tool),
`design/THE-STRANGERS.md` Part Three (the twenty-eight encounters,
almost none of them in the source), `src/world/events.ts` and
`src/world/life.ts` (routines and the drawers Session 17 built — an
encounter is a routine with a turn), `src/world/weather.ts`, `PLAN.md`,
`README.md`, `SESSIONS.md`. **Play sheets first:**
`design/play-sheets/session-17.md` and `session-16.md` are what the
owner was handed; if they have played either, the verdict is in
`SESSIONS.md` above Session 17's entry and it governs this session. If
they have not, the sheets' questions are still open, and you build on
the assumption that the life is right until told otherwise.

---

## 0. TWELVE LANDS ARE ALIVE. THE WALKS BETWEEN THEM ARE STILL A CHORE.

Session 17 put sixty-three unnamed inhabitants, an animal that reacts
in every land, a weather and a night into the world. Every land now
has a creature and a crowd. The owner's words this session exists to
answer:

> *"It almost feels like a chore going from one place to another."*
> *"There needs to be more regions and activity to fill the gap."*

**This session is the roads** (`THE-FUN-PASS` §8): the twenty-eight
encounters built, districts in all twelve lands, the fifteen-second
rule measured by a tool that walks every road and fails on silence,
the bicycle and the paper plane, and the 8:15 as daily transit after
the ending.

---

## 1. THE JOB

### 1. THE TWENTY-EIGHT ENCOUNTERS (§8 item 1)

`THE-STRANGERS.md` Part Three. Almost none of them exist in the
source. **Every one of them is a routine with a turn**: `life.ts`'s
`Figure` on a `RoutineDef`, with the thing that makes it an encounter
(a cart with a broken wheel that is mended by the afternoon; somebody
lost who is found by dusk; a funeral you should not interrupt) as its
stops. Authored, never generated; on the clock, so a walker who comes
at the wrong hour finds the aftermath and not nothing. **Nobody
crosses a border but the walker.** An encounter that needs to cross
one is two encounters.

### 2. DISTRICTS IN ALL TWELVE LANDS (§7)

`layout.DISTRICTS` is general and populated for the Common only. The
first cut is in `THE-FUN-PASS` §7's table: two to four per land, each
named, each with a reason. The region card and the map already read
the layer. **A wash tint per district** was declined in 16 for scope;
decide it here, and if you take it, `diff-sheets` says what moved.

### 3. THE FIFTEEN-SECOND RULE, MEASURED (§3 item 7, §8 item 2)

**A tool that walks every road at 4.1 units a second and fails on
fifteen seconds with nothing in frame or in earshot.** In frame is the
skyline grid (`World.skylineAt`) and the life registry (`life.drawn`)
projected through the shipping camera on both rigs; in earshot is the
land's ambient table in `App.ts` and the events that would fire. The
Common is the first land it should walk — its fifteen-second rule has
been unmeasured since 16. Where it fails, a MIDPOINT: a bend, a
bridge, a person, an animal, a sound. **The walks earn their length
with midpoints, or they shrink.**

### 4. THE BICYCLE AND THE PAPER PLANE (§8 item 3)

The bicycle in Maple Court: a bell you can ring (a touch), fast
downhill, refuses sand and stairs. **The paper plane**, deferred four
times, is not deferred again: the throw exists (`things.ts`), and the
plane is that verb from height — thrown off the tear's lip or the
Holdfast, it glides, it lands, and it is where you left it. Both are
mounts in the sense `WORLD-SYSTEMS` §4 means: found in the world,
left in the world, fast on their own ground and refusing every other.

### 5. THE 8:15 AS DAILY TRANSIT (§8 item 3)

After the ending, **the 8:15 runs every day at 8:15** and stops twelve
times. `Eight15.ts` runs once; make it a scheduled event
(`events.register`, like everything else now) that recurs once the
ending has happened, so the in-fiction fast travel the whole world was
waiting for exists. The ending stays absolute; this is after it.

### 6. THE PLAY SHEET, AND THE TOOL

The tool in 3 is the session's gate and its handover: its output is a
list of every fifteen-second silence on every road, and the sheet asks
the owner to walk the three worst.

---

## 2. WHAT SESSION 17 LEFT YOU

- **`src/world/events.ts`** — `registerRoutine(def)`, `routineAt(def,
  hour)`, `routine(id)`, `events.between(a, b)`. A routine is stops in
  hour order; the figure leaves each as late as it can and arrives on
  the hour; before the first and after the last it is indoors. Every
  leg is a registered event; `happening.ids` knows who is walking.
- **`src/world/life.ts`** — `Figure` (one standee, the drawing swapped
  by posture, faded in over two seconds) and `Creature` (an animal with
  postures), both reporting to `drawn` for the harness. `stops(rows)`
  writes a routine as `[at, x, z, pose, face?, hold?]`.
  `textures-life.ts` has the three kinds of folk in seven postures,
  cached and shared, and every animal.
- **`src/world/weather.ts`** — `weather.state` (`rain wind fog storm
  flash`), a pure function of `clock.day` and `clock.hour`;
  `weather.pin(kind)` for the harness; `PRESETS`. `windK` is exactly
  one at the shipped calm and every field's sway takes it.
- **`src/world/rooks.ts`** — the crossing, drawn by whichever land it
  is nearer. Recorded as the one free thematic layer, not a bug.
- **The dog** is `Follower` on the Downs, home at the field gate on the
  east road **north of the river** — a follower cannot find a bridge,
  and the first home was in the water. Put a companion where every road
  out of its land is reachable without crossing water. Both followers
  are on the harness as `__inklands.company.goat` and `.dog`, and the
  border tests place them and drive the walker out: the rule is tested
  at the border, not by path-finding a thing built not to path-find.
- **`tools/check-fields.mjs`** drives every routine through every hour
  it changes at; **`tools/check-verbs.mjs`** section 8 asserts the dog
  at both borders, the night's bull, the calm page at the protected
  hours, the counts; **`tools/check-lures.mjs`** asserts the fog closes
  all four. **`tools/shoot-session17.mjs`** is the proofs sheet, with
  `hour`, `day` and `weather` per framing.
- **`?hour=`, `?day=`, `?weather=`** on the address bar, for the play
  sheet.
- **What moved, and by how much:** `SESSIONS.md` Session 17 has the
  `diff-sheets` numbers.

---

## 3. THREE THINGS THAT CONSTRAIN THE WHOLE SESSION

1. **AN ENCOUNTER IS A ROUTINE WITH A TURN, AND IT IS ON THE CLOCK.**
   A thing that only happens when the walker triggers it is a diorama
   with a motor. If a stranger's beat must be triggered, the trigger
   is the walker being somewhere at an hour, which is the only kind of
   knowing this world deals in.
2. **NOBODY CROSSES A BORDER BUT THE WALKER — and birds do.** The
   bicycle and the plane are things: `things.ts` clamps them to their
   land. A bicycle that could ride into Brim is a bicycle that has
   broken the ending.
3. **A PROTECTED FRAMING MAY MOVE WHEN THE LAND INSIDE IT IS THE SCOPE**
   (`QUALITY-BAR` §3). Districts open every land; a midpoint on a road
   in a protected frame moves the frame. Say which and by how much;
   the verdicts are re-earned in a critique, not assumed.

---

## 4. THE GATES THAT ARE THE OWNER'S

1. **THE PLAY GATE** — Session 17's sheet may have come back, and
   Session 16's. Read them first.
2. **THE EAR GATE** — seventy-eight WAVs in `out/sound/`, unheard.
3. **THE FEEL GATE** — owed since 12, plus sitting, the run taught by
   a bull, and now a bicycle. `check-camera` still has to pass.

---

## Law (short form — QUALITY-BAR.md is the long form)

Zero image assets and zero audio assets; every voice is synthesis and
nothing outside `Audio.ts` invents an instrument, exactly as nothing
outside `palette.ts` invents a colour; all marks via `src/engine/ink.ts`;
`elevation.ts` is the only authority on where the ground is; the
resting bearing is due north, walking does not turn the frame, and a
stopped walker is always in the shipped composition; the medium is the
style and never the subject; **nobody crosses a border but the walker —
and no thing does either, and no companion, and birds do**; 60fps
mobile with DPR capped at 2; the chrome is shot too; build green before
every push; the walker has two dots and nobody else has a face; nothing
reads as an array; nothing is generated, ever; no fifth reward; a
number may record where the player has been and may never grade what
they did, and the ending stays absolute; portrait is judged, not
checked; looking is the first verb and not the only one; a choice card
is allowed and a dialogue wheel is not; local stakes are allowed and a
villain is not; districts are allowed and more sheet is not; the world
may point the way and may never say the turn; a protected framing may
move when the land inside it is the scope, measured; every barrier is a
drawing, and there are no invisible walls; **a routine is a pure
function of the hour, and the weather is a pure function of the day and
the hour**. End the session: pushed, `SESSIONS.md` handoff updated,
verdicts logged, **play sheet written**.

## Standing debts, carried forward

- **THE ENDING HAS NO CONSEQUENCE THAT LASTS** — Session 21, owner's call.
- **The rowboat's first-meeting composition at THE RIVER MOUTH** — ten
  gates have passed it.
- **THE HARROW DOWNS' stooked field**, **THE PENWOOD's east arc**, **THE
  BLEACH FLATS' `WHERE THE ROAD STOPS`**, **GREYLINE CITY's THE HOLLOW**.
- **Brim Square is full**: 17 put a delivery, a sweeper, a lamplighter
  and children in it, and the crowd goes in out of the rain; a market
  day's crowd is still Session 19's or 22's.
- **READ THE PROCLAMATION** and **THE 8:15 STOP's label** in the SKYLINE.
- **`critique-story-2` RECOMMENDED 2** — Session 22's.
- **Splitrock and the Flats have three and two unnamed**, under the
  brief's five, on purpose (their thesis is emptiness); recorded in
  17's log. If the fifteen-second tool says they are too empty, that
  is the tool's call and not this note's.
- **The bull's chase is heard more than seen on a phone** — the owner's
  phone decides.
- **The rain on a phone may be mud** — the owner's phone decides.
- **The lamplighter is a dim figure at dusk**: his round is 19.05–19.45
  so the protected 19.6 framings keep all four lamps lit; the lamps'
  own glow (`clock.lamp`) is low while he is out. Moving the round
  later moves two protected framings; the owner's call.

## Not this session's job

- **The cast** — 19 and 20. Not one Viking this session.
- **Second doors for the other ten waits** — 19 to 21.
- **The tonal re-key and the story rewrite** — 22.
- **Interiors** — 23. **THE JUROR** — last.
