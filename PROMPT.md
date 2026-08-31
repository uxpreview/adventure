# PROMPT — Session 14: THE 8:15

You are continuing INKLANDS in `uxpreview/adventure`. Read, in order:
`design/QUALITY-BAR.md` (binding), `design/THE-LINE.md` **§4 and §5**
(Act IV and the ending, which is SETTLED and is not yours to re-open),
`design/THE-WAITS.md` **§12** (DENNIS), `design/THE-STRANGERS.md` **S8**,
`design/WORLD-SYSTEMS.md` §4 and §7, then `PLAN.md`, `README.md`,
`SESSIONS.md`.

**Session 13's handoff first.** It built the two lands either side of
your border, and one of them — MAPLE COURT — is where Act III's
composition lives.

---

## 0. THIS IS THE PAYOFF SESSION AND THE LAST DRAFT IN THE WORLD

**THE CUBICLE MILE is the only land left that has never faced a gate.**
Ten hold verdicts; this one is still Session 1's scatter — glass towers
on a twenty-six-unit `for` loop, hedges every nine units, a bus stop and
twelve planters.

And the reward for finishing it is the biggest beat this project has:
**you draw the 8:15 into existence and it arrives.** `THE-LINE.md` §5 is
settled on it and §4 has it beat by beat. Do not spend the reveal early
and do not re-open the ending — it was argued once, in writing, and the
story gate (`critique-story-2.md`) did not object to it.

**Two things from `THE-LINE` §3.4 are law and they constrain the whole
land:** nobody in this world may hold Act III's fact — *Dennis does not
know what the road is, because knowing would require crossing* — and
nothing takes the controls. If you find yourself writing a camera move,
you have taken the wrong turn.

---

## 1. THE JOB

1. **THE CUBICLE MILE** (`office`, rect x 230..380, z 130..280), to
   `design/LAND-SPEC-TEMPLATE.md`, with 4–7 named places and THE SHOT.
2. **DENNIS** (`THE-WAITS` §12): the desk plate says D. HALL, he has the
   timetable by heart, and **the timetable is a survey schedule** — the
   times are the hours the surveyors were due at each point down the
   line, and the last entry on it is this stop. His permanent change is
   Session 6's lamp code with a different condition: come to the stop
   holding `route:the-line` and **the shelter's light comes on at dusk,
   and at every dusk afterwards.**
3. **THE 8:15 ITSELF** (`THE-LINE` §4), and it is the mount's reward and
   the ending's instrument. Read §4.2 and §4.3 before you design
   anything.
4. **The gauntlet, and it is longer than it was:** `check-terrain`,
   `check-audio`, `check-fields`, `check-camera`, **`check-sightline`**
   (Session 13 — `THE-LINE` §3.2's corridor is asserted now, and your
   land is at the far end of the same road), `diff-sheets`,
   `shoot-mobile`, and the art director on both viewports.
5. **Write the spec** and log the verdict.

**And the mount is still owed.** `PLAN.md` row 15 is THE PAPER PLANE,
deferred in writing twice with its brief. If this session has room it
takes it; if it does not, it says so in writing the way Session 11 did.

---

## 2. WHAT SESSION 13 LEFT YOU, AND ONE OF IT IS A NEW GATE

- **`node tools/check-sightline.mjs`** — `THE-LINE` §3.2's protected
  corridor, asserted rather than trusted. It reads every prop in the
  world (one-off standees from their own geometry, instanced fields
  straight off their instance matrices) and **a drawing is IN the
  corridor if any part of the DRAWING is, not its origin.** The shipped
  draft broke that rule twice and nothing else in this repository would
  have said so.
- **`node tools/shoot-now.mjs`** — twenty framings over the two new
  lands on the harness clock, both viewports. Point it at yours by
  editing its list; the two framings that need knowledge are LAST on
  purpose (a `learn` is for the rest of the page, and round 4's sheet
  had a man sitting on a bench in the shot that was supposed to show him
  standing).
- **`tools/diff-sheets.mjs` sweeps the chrome now**, in both passes. Its
  writing pass used to report the six-second control hint fading at a
  different wall-clock instant as a moved composition.
- **`window.__inklands.world`** — the World, and therefore Session 9's
  skyline grid, exposed to the harness.
- **`src/world/textures-now.ts`** — thirty-one drawings for the two
  present-day lands, and the pair of rules that make them work.

---

## 3. THE THREE THINGS NEXT DOOR THAT YOUR LAND HAS TO AGREE WITH

1. **GREYLINE CITY is drawn so that every mark leaves the frame** and
   MAPLE COURT so that every mark closes. THE CUBICLE MILE is the third
   present-day land and it needs its own rule, and it should not be
   either of those two. `WORLD-SYSTEMS` §10 already tells you what the
   land argues — *a timetable is a promise, and a promise is enough* —
   and `layout.ts` already says the one thing about it nobody has drawn:
   **it is the only corner of the world anybody ever laid out with a
   straightedge.**
2. **The commuter spur is the line's last leg** and it carries 1.0, the
   hardest in the world, and it ends in a car park. The player has been
   pulled along that road for fifteen hours.
3. **THE MAN AT THE JUNCTION is twenty units from your border**, sitting
   on a bench if the player stopped for him. Nothing in your land may
   name him or mention him.

---

## 4. THE GATES THAT ARE STILL THE OWNER'S, AND ONE IS OWED THREE TIMES

`QUALITY-BAR` §2, and Session 12 is the whole argument for taking this
seriously:

> **A system whose gate has not been run is not done. It is SHIPPED AND
> UNJUDGED, and those are two different words.**

1. **THE EAR GATE.** Twenty-five WAVs, one authored silence, and now
   five more voices from Session 13 — a sprinkler nobody can find, a dog
   two streets over, a crossing box ticking for people who never stop,
   and six footsteps that are not yours going away. **Nobody has heard
   this game.** `node tools/render-wavs.mjs`.
2. **THE FEEL GATE, AGAIN.** Session 12 fixed what a person felt and no
   tool it left behind can say whether the fix feels better. Session 13
   added two lands to walk through it.
3. **AND THE LAW ITSELF IS OPEN NOW.** The owner was asked about the
   count on the map and did not pick an option — they challenged the
   rule: *"I don't understand why that law exists. Progression,
   collection, and advancements are part of what makes games fun."* The
   argument both ways is written out in `PLAN.md`'s standing debts.
   **Do not split the difference quietly.** Either the law holds and the
   map's line loses its numbers, or `QUALITY-BAR.md` and `QUESTS.md` §7
   are amended with the owner's reasoning written into them.

---

## Law (short form — QUALITY-BAR.md is the long form)

Zero image assets and zero audio assets; every voice is synthesis and
nothing outside `Audio.ts` invents an instrument, exactly as nothing
outside `palette.ts` invents a colour; all marks via `src/engine/ink.ts`;
`elevation.ts` is the only authority on where the ground is; **the
resting bearing is due north, walking does not turn the frame, and a
stopped walker is always in the shipped composition**; the medium is the
style and never the subject; nobody crosses a border but the walker;
60fps mobile with DPR capped at 2; the chrome is shot too, on the
desktop as well as the phone; build green before every push; the walker
has two dots and nobody else has a face; nothing reads as an array;
nothing is generated, ever; no fifth reward; **no count, no list, no
percentage, anywhere, for anything — AND THAT ONE IS UNDER APPEAL BY THE
OWNER, see §4.3**; portrait is judged, not checked. End the session:
pushed, `SESSIONS.md` handoff updated, verdicts logged.

## Standing debts, carried forward

They live in `PLAN.md` too, because this file is overwritten every
session.

- **The rowboat's first-meeting composition at THE RIVER MOUTH.** Six
  gates have passed it and pointedly not praised it, and
  `route:the-river` is what resolves HOLT — so that boat is the front
  door of a wait.
- **THE HARROW DOWNS' stooked field**, **THE PENWOOD's east arc**, **THE
  BLEACH FLATS' `WHERE THE ROAD STOPS`** and now **GREYLINE CITY's THE
  HOLLOW**: all passed, none praised. The last one is a fold too shallow
  for the terrain to draw and too deep to ignore, and the fix belongs to
  `elevation.ts` rather than to a land.
- **Holt's lit window** is one warm pixel at forty units. It is the only
  lit window in the east half of the world and it deserves a glow.
- **Brim Square is full.** The next authored thing in that plaza
  displaces something Session 3 earned.
- **READ THE PROCLAMATION** on Greyweather's barbican is a compromise
  (`critique-camera-1.md`, round 3, noted-not-blocking).

## Not this session's job, and recorded so nobody re-derives them

- **The story gate returned NOT YET** (`critique-story-2.md`) with two
  mandatory findings. One of them is yours by accident: **the ending's
  default witness sees one stop**, and the fix is that the 8:15 arrives
  already carrying the lands above you, visible through the windows, for
  no new content and no change to the ending. Act IV is this session.
- **Interiors, weather, inhabitants-and-routine, and one authoring pass
  for the story's evidence** are the four un-numbered sessions
  `PLAN.md` sizes at the end, and they are what takes this from six
  hours to twelve.
