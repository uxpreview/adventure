# PROMPT — Session 19: THE NEW CAST, WEST AND NORTH

You are continuing INKLANDS in `uxpreview/adventure`. Read, in order:
**`design/THE-FUN-PASS.md` in full** (the owner's brief; binding), §10
twice (the cast — the Vikings, the surfers, the monsters; *none of them
explains anything*), §6 (the second door: WICK, PYE and WREN's rows),
§3 (the seven things a playable land needs; every re-opened land is
judged on all seven), `design/THE-WAITS.md` §1, §5 and §6 (WICK, PYE,
WREN as designed), `design/THE-STRANGERS.md` (S4, S7, and the errands
on the coast), `src/world/regions/coast.ts` and the castle half of
`civic.ts` (the four lands you re-open), `src/world/events.ts`,
`src/world/life.ts`, `src/world/company.ts`, `src/world/things.ts`,
`src/world/earshot.ts` (Session 18's placed voices — every new sound
with a place goes in it), `PLAN.md`, `README.md`, `SESSIONS.md`.
**Play sheets first:** `design/play-sheets/session-18.md`, `-17.md`,
`-16.md` are what the owner was handed; if they have played any of
them, the verdict is in `SESSIONS.md` above Session 18's entry and it
governs this session. If they have not, the sheets' questions are still
open, and you build on the assumption that the roads are right until
told otherwise — **except §0 of the Session 18 sheet**, which asks
whether the fifteen-second rule as measured is the rule the owner
meant. If they answered that, `tools/check-roads.mjs`'s definition of
*in frame* changes first, before any land is opened.

---

## 0. THE ROADS ARE MEASURED. FOUR LANDS ARE STILL DIORAMAS.

Session 18 built the roads: the tool, fifteen encounters, forty-five
districts, the bicycle, the plane, the daily 8:15. The tool found the
world more alive at noon than the owner felt, which means either the
measure or the walk is wrong, and the sheet asks which. What has not
changed since Session 14 is that CASTLE GREYWEATHER, LONGSHORE and THE
WIDE BLUE have their named person in a pose and one door or none: WICK,
PYE and WREN's waits are unbuilt, and three of the owner's cast are
still a table in a brief.

**This session is THE NEW CAST, WEST AND NORTH** (`THE-FUN-PASS` §14):
the Vikings on the Holdfast, the surfers at the Cut, the monsters (the
moat pool, under the Wide Blue, the deep pines at night), WICK, PYE and
WREN's waits with two doors from the start, toys in the old world and
on the coast, and an art gate on the four re-opened lands.

---

## 1. THE JOB

### 1. THE VIKINGS ON THE HOLDFAST (§10)

A longship beached on the headland — Session 18 drew the district and
called it THE HOLDFAST in `layout.DISTRICTS` for this — and a raiding
party that has been waiting for a wind for four hundred years. **Every
day they row out to the mark and compete in the regatta** (`the-
regatta` is registered at noon; their boat joins the fleet, and the
fleet is drawn by `coast.ts`). They roar at the shore. **They cannot
land on it**: they are inhabitants of THE WIDE BLUE and the beach is
LONGSHORE, and the border is the rule that makes them funny. Threat
first, then comedy: the first time you see them from the promenade
they are a longship coming in; the tenth time they are four men in a
boat going round a buoy. A toy: something on the Holdfast you can
touch, in the house voice.

### 2. THE SURFERS AT THE CUT (§10)

Board racks, a van, a wetsuit on a line, and a coast that only has a
tide. **They check the water at first light every day** — a routine on
`events.ts`, like everybody now — and go back to the van. The wait,
played for laughs. They carry an errand from `THE-STRANGERS` Part Two.
THE CUT is a district already.

### 3. THE MONSTERS (§10) — never seen whole

Three, and every one of them is a sound, a distance, and a thing that
moved while you were not looking (`THE-FUN-PASS` §2.3):

- **the moat pool**: the water goes red for two days — Wick's dye, or
  not. On the clock (`weather.ts` has a day counter; a thing that
  happens for two days in every nine is a pure function of `clock.day`).
- **under the Wide Blue**: `the-deep` surfaces once at dusk (Session
  17). It does not need more. What it needs is a CONSEQUENCE that is
  not an explanation: the seals do not haul out the day after; the
  regatta's fleet gives the long water a wider berth; a pot comes up
  empty. Pick one.
- **the deep pines at night**: the pine-tick stops (Session 17) and a
  branch goes a long way off. Add the one thing Session 17 declined:
  something that is drawn, once, at the edge of the frame, and is not
  there when you look — and it is drawn by the same law as everything
  else, and it has no face.

### 4. WICK, PYE AND WREN'S WAITS, WITH TWO DOORS FROM THE START (§6)

`THE-WAITS` §1, §5, §6 are the design; §6 of the brief is the second
door for each. **Wick gets his drawing this session** — `THE-STRANGERS`
C12 (*Wick, halfway up the avenue, resting, at dawn*) was the one
encounter Session 18 deferred, and it is his first routine: it is how
the walker first sees him, before his wait. Both doors visible before
either is taken, on a choice card, at the moment it matters (Session
15's card; Nell's in `meadow.ts` is the pattern). The cost is a
visible, permanent change. Nothing says which door was right.

### 5. TOYS IN THE OLD WORLD AND ON THE COAST (§3 item 3, §5)

`QUESTS` §8's register: skim a stone off the sandbar (the Common's
stone has a twin on the bar; `things.ts` and the river's ring), ring
the belfry early and watch the town react, row into the fleet and
scatter it. At least one per re-opened land, repeatable, no score.

### 6. THE ART GATE ON FOUR RE-OPENED LANDS, AND THE PLAY SHEET

Greyweather, Longshore, the Wide Blue, and Brim's belfry if the bell
is touched. `QUALITY-BAR` §3: a protected framing may move when the
land inside it is the scope; say which and by how much; re-earn the
verdicts in a critique. The play sheet: ten minutes, the longship
first.

---

## 2. WHAT SESSION 18 LEFT YOU

- **`tools/check-roads.mjs`** walks every road at 4.1 u/s on both
  rigs from any hour (`HOUR=`), and fails on fifteen seconds with
  nothing in frame or in earshot. **Run it before you push.** What
  counts as *in frame* is written at the top of the file and it is the
  owner's to change (sheet §0). `VERBOSE=1 ROAD=coast-road` prints
  every sample.
- **`src/world/earshot.ts`** — the placed voices as data, and
  `App.ts`'s ambient table reads its distances from it (`hears`).
  Every new sound with a place is a row here first; every scheduled
  event with a `place` counts as in earshot while it is on. The
  land-wide filler does not count, on purpose.
- **Encounters are routines with a turn**: `civic.ts`'s WRIGHT (the
  broken cart, mended at three, pushed home), `coast.ts`'s fire (lit,
  sat at, cold ash), `wilds.ts`'s FELLED (a pine, then two lengths) are
  the patterns — a drawing that changes with the hour, and the
  aftermath authored. `meadow.ts`'s `dawnDog` is a `Follower` on a
  rect that is not a land, with its hours on an event.
- **A barrier may be a creature**: the gull on the crest
  (`coast.ts`) registers a two-unit barrier and is the drawing standing
  in it.
- **`src/engine/Bicycle.ts`** — a mount on the boat's pattern with a
  `bell` export the land reads. `App.bicycleRefuses` is the refusal
  (sand, stairs, water, the border). `check-camera` has not been run on
  it; the feel gate has it.
- **`things.ts` `glide`** — a carriable that goes down the air from
  the hand; `throw_`'s last argument says whether it was thrown or set
  down. The plane is registered in `wilds.ts` and drawn there.
- **`Eight15.ending`** — the first run is the ending and writes
  `fact:the-8-15-ran`; after it, `waiting()` is always false. The
  harness can set `I.train.ending` before `warpTrain`.
- **`I.waitAnswers`** on the harness qualifies a walker for the 8:15
  in a test. `I.layout`, `I.earshot`, `I.world.skylineWithin`,
  `I.bicycle`, `I.takeBicycle`, `I.putBicycle`.
- **`check-verbs` section 9** asserts the bicycle at its border, the
  bell answered, the plane's glide and set-down, the 8:15's two kinds
  of run, the dawn dog's line, the hat's border, forty-five districts,
  earshot pure, and every encounter registered.
- **What moved, and by how much:** `SESSIONS.md` Session 18 has the
  `diff-sheets` numbers.

---

## 3. THREE THINGS THAT CONSTRAIN THE WHOLE SESSION

1. **NOBODY CROSSES A BORDER BUT THE WALKER, and the Vikings are the
   joke about it.** A longship is a thing (`things.ts` clamps things)
   and a crew is a routine (stops inside the rect). The Holdfast is in
   THE WIDE BLUE's rect; the sand they roar at is LONGSHORE's. If a
   Viking's foot touches LONGSHORE the ending is broken.
2. **A MONSTER IS NEVER SEEN WHOLE, AND NEVER EXPLAINED.** No face, no
   name, no note that says what it was. Fear is a sound, a distance,
   and a thing that moved while you were not looking.
3. **A PROTECTED FRAMING MAY MOVE WHEN THE LAND INSIDE IT IS THE SCOPE**
   (`QUALITY-BAR` §3). Three of the four lands hold verdicts. Say which
   framing and by how much; re-earn the verdict in a critique.

---

## 4. THE GATES THAT ARE THE OWNER'S

1. **THE PLAY GATE** — Session 18's sheet may have come back, and 17's
   and 16's. Read them first. Sheet 18 §0 changes the tool before
   anything else.
2. **THE EAR GATE** — eighty WAVs in `out/sound/`, unheard.
3. **THE FEEL GATE** — owed since 12, plus sitting, the run taught by
   a bull, and the bicycle, which is the fastest thing the walker has
   ever steered.

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
drawing, and there are no invisible walls; a routine is a pure function
of the hour, and the weather is a pure function of the day and the
hour; **a sound with a place is a row in `earshot.ts`, and no road is
silent for fifteen seconds** (`check-roads`). End the session: pushed,
`SESSIONS.md` handoff updated, verdicts logged, **play sheet written**.

## Standing debts, carried forward

- **THE ENDING HAS NO CONSEQUENCE THAT LASTS** — Session 21, owner's
  call. The daily 8:15 stops at empty platforms; whether the people who
  left are gone from their lands is that decision.
- **The rowboat's first-meeting composition at THE RIVER MOUTH** —
  eleven gates have passed it. This session opens LONGSHORE; close it.
- **THE HARROW DOWNS' stooked field**, **THE BLEACH FLATS' `WHERE THE
  ROAD STOPS`**, **GREYLINE CITY's THE HOLLOW** — the Penwood's east
  arc is CLOSED (the tool found it on the south-west, and there is a
  woodpile there now).
- **Brim Square is full**; a market day's crowd is Session 19's if the
  belfry is touched, else 22's.
- **READ THE PROCLAMATION** and **THE 8:15 STOP's label** in the
  SKYLINE.
- **`critique-story-2` RECOMMENDED 2** — Session 22's.
- **The fifteen-second rule's measure** — sheet 18 §0; the owner's.
- **The bicycle on the feel gate**; **`check-camera` on a bicycle** has
  not been written.
- **The Wide Blue and the Flats have two and three unnamed**, under the
  brief's five, on purpose; the tool did not find them too empty.
- **The bull's chase is heard more than seen on a phone**; **the rain
  on a phone may be mud** — the owner's phone decides.
- **The lamplighter is a dim figure at dusk** — the owner's call.
- **A wash tint per district** — declined a third time in 18; a
  district is a name and not a wash by the layer's own definition, and
  a tint would move every protected framing in every land at once.

## Not this session's job

- **The aliens, the barista, the design studio** — 20.
- **Second doors for the other nine waits** — 21.
- **The tonal re-key and the story rewrite** — 22.
- **Interiors** — 23. **THE JUROR** — last.
