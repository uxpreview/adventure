# PROMPT — Session 22: THE STORY, REWRITTEN

You are continuing INKLANDS in `uxpreview/adventure`. Read, in order:
**`design/THE-FUN-PASS.md` in full** (the owner's brief; binding), §4
twice (the tonal re-key: four categories, four tones, and the Downs is
the one land in WORK that is not a joke), §6 (the second door — every
wait has two now, and the ending reads them), §12 (the story, parked
and rewritten on top of what is fun), `design/STORY.md` (the bible —
§2's four categories, §5 *they were waiting for each other*, §8's
rules, of which 1, 2-for-the-turn and 5 are absolute), `design/THE-LINE.md`
§4 and §5 (the ending, settled, and what this session's decision does
to it), `design/THE-WAITS.md` (twelve fables, every one with a
SECOND DOOR note now), `design/THE-STRANGERS.md` (Part One's strangers,
Part Two's errands — the twenty that needed carry — Part Three's
encounters, and the table of which are built), `design/critiques/
critique-story-1.md`, `-2.md`, `-3.md` (the story gate's three runs;
`-2` RECOMMENDED 2 is a standing debt), `src/world/knowledge.ts`
(`WAIT_ANSWERS`, `WAIT_DOORS`, `decided`), `src/engine/Eight15.ts`
(`onPlatform`, `leftAt`, the residue), `PLAN.md`, `README.md`,
`SESSIONS.md`. **Play sheets first:** `design/play-sheets/session-21.md`,
`-20.md`, `-19.md`, `-18.md`, `-17.md`, `-16.md` are what the owner
was handed; if they have played any of them, the verdict is in
`SESSIONS.md` above Session 21's entry and it governs this session. If
they have not, the sheets' questions are still open. **Sheet 21 §7**
(does the departure last) and **sheet 18 §0** (the fifteen-second
rule's measure) are the owner's to answer.

---

## 0. WHAT SESSION 21 LEFT YOU

- **Every one of the twelve waits has two doors on a card.** The five
  that did not: the belfry (three doors — `door:the-bell-rings-it`,
  `door:the-clock-set-to-eight`, `door:the-clock-set-to-eleven`), the
  trestles (`door:the-boat-righted`, `door:the-sea-has-no-bottom`),
  the catch (`door:the-lid-off`, `door:the-cistern-yours` → a carry →
  `fact:the-cistern-filled`), the tarn (`door:the-water-stood`,
  `door:the-oar-taken` → a carry → `fact:the-twelfth-oar`), the table
  (`door:the-seat-taken`, which `sits`, and `door:the-setting-cleared`).
  `WAIT_DOORS` in `knowledge.ts` is the whole list against its lands,
  and `knowledge.decided(land)` is *answered or a door taken*.
- **Three answers moved from a knowledge to a door**: SPLITROCK's is
  `door:the-boat-righted` (was `route:the-river`), THE FLATS' is
  `door:the-lid-off` (was `fact:the-fold`); BRIM's stays `reason:brim`
  and two of the three belfry doors learn it. The older shoot lists
  that learned the old answers learn the doors now.
- **The 8:15 reads the doors** (`Eight15.onPlatform`): a door that
  relieved somebody empties their platform whatever else the walker
  holds (Wick, Marget-at-eight, Brack, Holt, Nell, Wren, Val, the man,
  Dennis); a door that produced a thing puts the thing there — two cans
  on the Flats' platform, seven pots on Longshore's
  (`platformThingTexture`). **It qualifies on waits decided** —
  `decidedWaits() >= 7` — so a walker who chose the other way
  everywhere still gets the ending, and the ending reads it.
- **THE SMALLER DEPARTURE-PERMANENCE IS BUILT, THE LARGER IS BELOW.**
  As the train pulls away from a stop with a thing on it, it writes
  `fact:left-at-<land>-<thing>`; twelve residue standees, placed off
  that prefix, draw the thing where it stood for good. The people who
  got on are back where they stand when the doors shut, as before.
- **Engine**: a card option may `sits` (App seats the walker the frame
  the door is written); `things.place(id, x, z)` and
  `things.consume(id)`; the harness exposes `onPlatform` and
  `qualified()`. Five voices (`clock-set`, `can-fill`, `can-pour`,
  `oar-set`, `plate-clear`).
- **`check-verbs` §12 runs on two fresh pages**: every second door
  taken, the two carries end to end, the 8:15's platforms at four
  stops, the run from the gate leaving the cans and the pots and
  nothing else, the residue drawn; then every first door.
- **S5 (HOW DEEP) is still unbuilt.** Holt's second door offers the
  sea off the river route because the walker has been to the salt;
  S5's own fact and its chalk mark below the floor are Part One's.

## 1. THE JOB (`THE-FUN-PASS` §14, Session 22)

1. **THE TONAL RE-KEY** (§4). Four categories, four tones, and the
   contact sheet judged for whether each land lands in its key:
   MEMORY emotional (Greyweather, Brim, Maple Court), WEATHER awe
   (Splitrock, the Flats, Longshore), THE UNSEEN frightening (the
   Penwood, the Wide Blue, the Common), WORK funny (the Downs excepted,
   Greyline, the Cubicle Mile). Every note in a land re-read in its
   key; the voice pass over every note written since Session 15.
2. **THE STRANGERS DOUBLED** (`THE-STRANGERS` Part One): S5 first,
   because Session 21 leaned on it without building it.
3. **THE ERRANDS AS CARRY** (Part Two): the twenty needed carry or
   touch and both exist; the can and the oar are the pattern (a
   carriable with a home, a `hand` drawing, a place that takes it and
   a fact it writes).
4. **`critique-story-2` RECOMMENDED 2**, three sessions carried.
5. **The story gate, run to WOWED** (`critique-story-4`).
6. **THE DEPARTURE, IF THE OWNER SAYS SO** — §2 below.
7. **The play sheet.**

## 2. THE LARGER DEPARTURE-PERMANENCE — written, not built

`THE-LINE` §5 does not require it, `PLAN.md` has called it the single
largest thing left in the story since Session 14, and sheet 21 §7 asks
the owner in one line. If the answer is yes, this is the build:

- **The rule.** After the ending has run (`fact:the-8-15-ran`), a
  person who got on is gone from their land — not drawn, at any hour,
  in any save — and their routine with them. Who got on is exactly
  `onPlatform(land) === 'person'` on the morning it ran, so it is
  recorded the way the things are: the train writes
  `fact:left-from-<land>` as it pulls away with somebody aboard, and
  each land reads that one id every frame the way it reads
  `platform.land` now. One clause per land, twelve clauses.
- **What each land loses, and what stays.** Marget: the stall stays
  laid, open, with nobody behind it, and the delivery finds it open
  and unattended. Wick: the banners stay up and nobody changes them;
  the red goes through pink and stays there. Val: the porch light
  stays on with nobody in the house. Holt: the boat on the floor, the
  house dark at night. Amos: the lid off, the track growing over
  (the same decal as the second door). Pye: the eighth pot and no
  rows. Brack: the round with nobody on it, and the goat. Wren: the
  bell not rung at noon; the fleet still round the first mark. Nell:
  the cart turned north at a gate nobody leans on. The man: gone from
  the junction, the wear still curving round nothing. Dennis: the
  desk plate, the shelter light at dusk, nobody at the board. Joan:
  never leaves.
- **What it re-opens.** Seven lands that hold verdicts (`diff-sheets`'
  protected set is on a page that has not run the ending, so the
  framings do not move; the verdict is on the new page). Every routine
  in `check-fields` that belongs to a named person needs a `gone`
  branch. `Eight15`'s `platform` export becomes redundant with the
  fact and should go.
- **What it must not do.** Nothing says they left. Nothing counts them.
  Nobody in a land remarks on an absence. The daily train still stops
  at every platform for thirteen seconds and takes nobody.
- **Cost.** One session-half. Do it before the re-key, because the
  re-key's notes will want to know who is there.

If the answer is no, delete this section and record the no in
`THE-LINE.md` §5 with the owner's words.

## 3. WHAT CONSTRAINS IT

1. **NOBODY CROSSES A BORDER BUT THE WALKER.** A person who got on is
   gone, not elsewhere.
2. **NOTHING SAYS WHICH DOOR WAS RIGHT**, and the re-key may not
   editorialise a door: a note in the funny key about a door taken is
   still a note that does not grade it.
3. **NOBODY SAYS THE TURN.** `STORY.md` §8 rule 5 for the turn and the
   ending, absolute; the doors' notes stay under it.
4. **A NUMBER MAY RECORD AND MAY NEVER GRADE.** `decidedWaits` is read
   by the train and by the harness and by nothing else.
5. **A PROTECTED FRAMING MAY MOVE WHEN THE LAND INSIDE IT IS THE SCOPE**
   (`QUALITY-BAR` §3). Say which and by how much.
6. **B2's rule stands**: every new building registers its footprint;
   nothing new puts the camera inside a drawing.

## 4. THE GATES THAT ARE THE OWNER'S

1. **THE PLAY GATE** — sheets 16 to 21 may have come back.
2. **THE EAR GATE** — a hundred WAVs in `out/sound/`, unheard.
3. **THE FEEL GATE** — owed since 12, plus the bicycle, the chair, the
   two carries and a thumb on the joystick.

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
every push; the walker has two dots and nobody else has a face (the
owner's four animals excepted, on the owner's hand); nothing reads as
an array; nothing is generated, ever; no fifth reward; a number may
record where the player has been and may never grade what they did,
and the ending stays absolute; portrait is judged, not checked;
looking is the first verb and not the only one; a choice card is
allowed and a dialogue wheel is not; local stakes are allowed and a
villain is not; districts are allowed and more sheet is not; the world
may point the way and may never say the turn; a protected framing may
move when the land inside it is the scope, measured; **every barrier is
a drawing, there are no invisible walls, and every building is a
barrier**; a routine is a pure function of the hour, and the weather is
a pure function of the day and the hour; a sound with a place is a row
in `earshot.ts`, and no road is silent for fifteen seconds; **every
wait has two doors, both visible before either is taken, and the
ending reads them**. End the session: pushed, `SESSIONS.md` handoff
updated, verdicts logged, **play sheet written**.

## Standing debts, carried forward

- **THE LARGER DEPARTURE-PERMANENCE** — §2, the owner's yes or no.
- **S5, HOW DEEP** — Session 21 leaned on it; build it first.
- **The king's road runs through Brim's fountain** (B2): the fountain
  keeps its footprint and you go round it. This session's, or the
  owner's.
- **The rowboat's first-meeting composition at THE RIVER MOUTH** —
  fourteen gates have passed it.
- **THE HARROW DOWNS' stooked field**, **THE BLEACH FLATS' `WHERE THE
  ROAD STOPS`**, **GREYLINE CITY's THE HOLLOW**.
- **Brim Square's market-day crowd** — this session's, with the re-key.
- **READ THE PROCLAMATION** and **THE 8:15 STOP's label** in the
  SKYLINE.
- **`critique-story-2` RECOMMENDED 2** — this session's.
- **The fifteen-second rule's measure** — sheet 18 §0; the owner's.
- **The bicycle, the chair and the two carries on the feel gate**;
  **`check-camera` on a bicycle**.
- **The lamplighter is a dim figure at dusk** — the owner's call; and
  under `door:the-clock-set-to-eleven` he is a dim figure at four in
  the afternoon, which the art gate passed and did not praise.
- **A wash tint per district** — declined three times.
- **The Penwood and the Downs dip under 55 fps** on the owner's Mac.
- **Wick, Pye, Wren, the barista and the designers at dusk are small**:
  scale 1.15 if the owner cannot find them.
- **THE CART's label sits high** on Greyline's shop row.
- **The pavement's card is skippable by standing still** (kept; the
  owner may want the four seconds to wait on `fact:the-pavement`).
- **The tarn's card is skippable by walking in** (kept, the same way:
  a walker who steps inside the twenty without pressing earns the
  fact as they have since Session 10, and the card is gone).
- **The barista's dog's paws fade in fifteen minutes.**
- **The can's water is not saved**: close the tab with a full can in
  hand and it is an empty can at your feet. One id if it matters.
- **Marget's board says nothing about the hour** under either clock
  door; `marketBoardTexture` could letter it.

## Not this session's job

- **Interiors** — 23 (the van, the longship, the studio are on the
  list).
- **THE JUROR** — last.
