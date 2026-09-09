# PROMPT — Session 24: THE PLAY GATE AND THE JUROR

You are continuing INKLANDS in `uxpreview/adventure`. Read, in order:
**`design/THE-FUN-PASS.md` in full** (the owner's brief; binding), §14
(the ladder: 24 is the last row), `design/QUALITY-BAR.md` (the whole
bar; §2 names the juror and what it scores, §3's law list has two new
clauses from 22 and 23), `design/WORLD-SYSTEMS.md` §11 (the roofless
cutaway, BUILT, and what it must not become), `design/STORY.md` §8,
`design/THE-LINE.md` §5, `design/critiques/critique-story-4.md`
(PASSED, NOT WOWED, both RECOMMENDED now built), `design/critiques/
critique-art-16.md` (the interiors' gate), `design/THE-STRANGERS.md`
(Part One: S3, S5 and S8 built; Part Two: E5, E6, E18, E19, E21 and the
can built; the rest one line each), `src/world/rooms.ts`,
`src/world/regions/room.ts`, `src/core/App.ts` (`App.CAM.room`, and the
room block in `tick`), `PLAN.md`, `README.md`, `SESSIONS.md`. **Play
sheets first:** `design/play-sheets/session-23.md`, `-22.md`, `-21.md`,
`-20.md`, `-19.md`, `-18.md`, `-17.md`, `-16.md` are what the owner was
handed; if they have played any of them, the verdict is in
`SESSIONS.md` above Session 23's entry and it governs this session. If
they have not, **this session is the one where they do**: §14 row 24
is the owner playing the whole thing, and no tool can stand in for it.

---

## 0. WHAT SESSION 23 LEFT YOU

- **THE ROOFLESS CUTAWAY IS BUILT** (`rooms.ts`, `regions/room.ts`,
  `textures-rooms.ts`, `App.CAM.room`). A room is a section: a plan on
  the ground, an elevation at the north edge, two side walls edge-on,
  and the house's own front with a door in its footprint. Walk in and
  the front goes to a whisper of pencil and the room draws up; walk
  out and the house is the house, to the pixel. Four rules: a room
  opens south, is inside its land, is flat ground to the camera, and
  every wall is a drawing and a barrier. The rig closes by four units
  and never faster than the walk; `check-verbs` §15 measures it.
- **Three rooms**, one per MEMORY land: Val's kitchen, Marget's house
  (a new front in Brim's back streets), the loft (a new lean-to
  inside Greyweather's wall, against the east tower — not on the ramp,
  whose slope is a third). Each with three or four things and a
  person at the hours they are home.
- **Three errands as carry**: E5 the crate (light, and that is the
  errand), E6 the wet banner (the first HEAVY thing — `things.ts`
  `heavy`: no run, two thirds of a walk), E18 the small bike (a
  pushable that leans on its own wall once it is home).
- **`critique-story-4` RECOMMENDED 1 and 2 built**: THE SHALLOWS in
  the frightening key; the longship's note under the mark door says
  what the bow man did not do.
- **Three voices** (`latch`, `crate-down`, `cloth-hung`) under
  `the-interiors` in `render-wavs`; indoors the weather's beds come
  down by two thirds.
- **Not built:** the studio, the van and the longship as rooms (the
  system is there; each is an afternoon), the lit window seen from
  inside (the porch light is in the front wall, which is the cut one),
  and the seventeen errands still one line each.

## 1. THE JOB (`THE-FUN-PASS` §14, Session 24)

1. **THE PLAY GATE.** The owner plays the whole thing. If the verdicts
   on sheets 16 to 23 are in `SESSIONS.md`, every one of them is this
   session's first job, in the owner's words, before anything below.
   If they are not, the session's first deliverable is a single sheet
   that plays the game from the bull to the train in an hour, with the
   build link, and the log says it handed the gate over.
2. **THE AWWWARDS PASS** on the whole build: the title, the first
   minute, the map, the UI's feel, mobile portrait, a performance
   audit (`shoot-fps`; the Penwood and the Downs dip under 55 on the
   owner's Mac), then the full-gauntlet critique. `QUALITY-BAR` §2
   names what the juror scores and the bar is Site of the Day
   contention, not nice.
3. **THE DEPARTURE, IF THE OWNER SAYS SO** — §2 below.
4. **What the juror finds**, fixed, in the order it hurts.

## 2. THE LARGER DEPARTURE-PERMANENCE — written, not built

Unchanged from Session 21's prompt, and still the single thing between
the story gate's PASSED and its WOWED (`critique-story-4` Q4). If the
owner's answer is yes:

- **The rule.** After `fact:the-8-15-ran`, a person who got on is gone
  from their land — not drawn, at any hour, in any save — and their
  routine with them. The train writes `fact:left-from-<land>` as it
  pulls away with somebody aboard, and each land reads that one id
  every frame the way it reads `platform.land` now. One clause per
  land, twelve clauses — and from Session 23, one more each for Val
  and Marget, whose rooms draw them home.
- **What each land loses, and what stays.** Marget: the stall stays
  laid, open, with nobody behind it; the house's table bare at every
  hour. Wick: the banners stay up and nobody changes them; the bank
  dry. Val: the porch light stays on with nobody in the house, and the
  kitchen's chair stays out. Holt: the boat on the floor, the house
  dark at night. Amos: the lid off, the track growing over. Pye: the
  eighth pot and no rows. Brack: the round with nobody on it, and the
  goat. Wren: the bell not rung at noon. Nell: the cart turned north
  at a gate nobody leans on. The man: gone from the junction, the wear
  still curving round nothing. Dennis: the desk plate, the shelter
  light at dusk, nobody at the board. Joan: never leaves.
- **What it must not do.** Nothing says they left. Nothing counts them.
  Nobody remarks on an absence. The daily train still stops thirteen
  seconds at every platform and takes nobody.
- **Cost.** One session-half. If the answer is no, delete this section
  and record the no in `THE-LINE.md` §5 with the owner's words.

## 3. WHAT CONSTRAINS IT

1. **NOBODY CROSSES A BORDER BUT THE WALKER.** A room is inside its
   land; `check-verbs` §15 asserts every room's four corners.
2. **NOTHING SAYS WHICH DOOR WAS RIGHT**, and a room reads the doors
   the way a land does (the loft under the king restored; the kitchen
   under the light off) and grades none of them.
3. **NOBODY SAYS THE TURN.** The loft has four pegs. It does not have
   the word *spare* in it, and `check-verbs` asserts the note never
   does.
4. **A NUMBER MAY RECORD AND MAY NEVER GRADE.**
5. **A PROTECTED FRAMING MAY MOVE WHEN THE LAND INSIDE IT IS THE SCOPE**
   (`QUALITY-BAR` §3). Session 23 moved the bailey's (the loft) and
   said by how much.
6. **A ROOM IS A SECTION AND ITS WALLS ARE BARRIERS** (`QUALITY-BAR` §3,
   new). No furnishing, no menu, no room that opens any way but south.

## 4. THE GATES THAT ARE THE OWNER'S

1. **THE PLAY GATE** — sheets 16 to 23, eight of them, may have come
   back. This is the session they are for.
2. **THE EAR GATE** — a hundred and twelve WAVs in `out/sound/`.
3. **THE FEEL GATE** — owed since 12, and the room rig is new on it.

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
owner's four animals excepted, on the owner's hand), and the walker may
wear one thing, taken off the world at a cost; nothing reads as an
array; nothing is generated, ever; no fifth reward; a number may record
where the player has been and may never grade what they did, and the
ending stays absolute; portrait is judged, not checked; looking is the
first verb and not the only one; a choice card is allowed and a
dialogue wheel is not; local stakes are allowed and a villain is not;
districts are allowed and more sheet is not; the world may point the
way and may never say the turn; a protected framing may move when the
land inside it is the scope, measured; every barrier is a drawing,
there are no invisible walls, and every building is a barrier; **a room
is a section, opens south, is inside its land, and every wall in it is
a barrier, and the rig closes on it no faster than the walk**; a
routine is a pure function of the hour, and the weather is a pure
function of the day and the hour; a sound with a place is a row in
`earshot.ts`, and no road is silent for fifteen seconds; every wait has
two doors, both visible before either is taken, and the ending reads
them. End the session: pushed, `SESSIONS.md` handoff updated, verdicts
logged, **play sheet written**.

## Standing debts, carried forward

- **THE LARGER DEPARTURE-PERMANENCE** — §2, the owner's yes or no.
- **THE ERRANDS AS CARRY** — six of twenty-one built (E5, E6, E18, E19,
  E21, the can); the pattern is a carriable with a home, a `hand`
  drawing, a place that takes it, a fact it writes.
- **THE STRANGERS** — S3, S5 and S8 built; S1, S2, S4, S6, S7 one
  table each. S2 (Teg's sealed complaint) wants a room and now has a
  system to be in.
- **THE ROOMS NOT BUILT** — the studio, the van, the longship (§14's
  own list), and the keep's hall, a Brim tavern, an office lobby
  (`DIRECTION.md`'s older list). A room is an afternoon now.
- **THE LIT WINDOW FROM INSIDE** — the section cuts the wall the
  light is in. Val's other window could carry it; declined this
  session as a second light for one house.
- **THE SCARECROW'S HAT** — sheet 22 §7 asks the owner.
- **The king's road runs through Brim's fountain** (B2).
- **The rowboat's first-meeting composition at THE RIVER MOUTH** —
  sixteen gates have passed it.
- **THE HARROW DOWNS' stooked field**, **GREYLINE CITY's THE HOLLOW**.
- **Brim Square's market-day crowd.**
- **READ THE PROCLAMATION** and **THE 8:15 STOP's label** in the
  SKYLINE; **MAPLE COURT's label prints on Val's roof** from the court
  (pre-existing; the skyline writes it over the porch).
- **The fifteen-second rule's measure** — sheet 18 §0; the owner's.
- **The bicycle, the chair and the carries on the feel gate**;
  **`check-camera` on a bicycle**; **the room rig on the feel gate**.
- **The lamplighter is a dim figure at dusk** — the owner's call.
- **A wash tint per district** — declined three times.
- **The Penwood and the Downs dip under 55 fps** on the owner's Mac.
- **Wick, Pye, Wren, the barista and the designers at dusk are small**:
  scale 1.15 if the owner cannot find them.
- **THE CART's label sits high** on Greyline's shop row.
- **The pavement's card and the tarn's card are skippable by standing
  still and by walking in** (both kept).
- **The barista's dog's paws fade in fifteen minutes.**
- **The can's water is not saved.**
- **Marget's board says nothing about the hour** under either clock
  door.
- **The hat's three runs are still registered events** after it is
  taken; harmless.
- **A thrown crate or bike can be left anywhere in its land**; the
  morning does not put a placed thing back, on purpose.

## Not this session's job

- Nothing. This is the last row of the ladder. What the juror finds
  is the next ladder.
