# PROMPT — Session 20: THE NEW CAST, EAST AND SOUTH

You are continuing INKLANDS in `uxpreview/adventure`. Read, in order:
**`design/THE-FUN-PASS.md` in full** (the owner's brief; binding), §10
twice (the cast — the aliens, the barista, the design studio; *none of
them explains anything*), §6 (the second door: the present-day lands'
rows — Maple Court, Greyline, the Cubicle Mile, and the Downs, the
Flats and Splitrock), §3 (the seven things a playable land needs),
`design/THE-WAITS.md` §3, §5, §10, §11, §12 (the waits whose second
doors you build), `design/THE-STRANGERS.md` (S2, S4, and the errands
in the east and south), `src/world/regions/wilds.ts` (the Flats' half)
and `civic.ts` (Greyline and the Cubicle Mile), `src/world/events.ts`,
`src/world/life.ts`, `src/world/things.ts`, `src/world/earshot.ts`,
`src/world/regions/coast.ts` (**Session 19's Vikings, surfers, Pye and
Wren are the patterns for a cast member: a drawing of their own on a
`Figure` with `maps`, a routine as a pure function of the hour, a card
with two doors as a getter, a door read back every frame**), `PLAN.md`,
`README.md`, `SESSIONS.md`.
**Play sheets first:** `design/play-sheets/session-19.md`, `-18.md`,
`-17.md`, `-16.md` are what the owner was handed; if they have played
any of them, the verdict is in `SESSIONS.md` above Session 19's entry
and it governs this session. If they have not, the sheets' questions
are still open. **Sheet 18 §0** (the fifteen-second rule's measure) is
still the owner's to answer, and `tools/check-roads.mjs`'s definition
of *in frame* changes first if they have.

---

## 0. WHAT SESSION 19 LEFT YOU

- **The local QA pass's fixes are in.** The spawn is on the gate's row
  (`layout.SPAWN` is (24, 82)); a due-west run goes through the gate,
  and `check-verbs` drives it and projects the bull through the
  shipping camera. **A drawing is a barrier**: `ctx.standee(…, {
  solid })` registers the footprint as it is built (`true` for the
  width, a number for a trunk's half-width, `{ gap }` for an arch, `{
  keep }` to stand across a road on purpose — only the fountain does),
  clipped off any road's own line so no road is ever severed; 140-odd
  buildings, walls, towers, huts, the keep, the mill, the oaks' trunks
  have one. Anything within four and a half units of the lens fades to
  a quarter (`World.nearFade`). Labels sit a line-height over their
  own drawing (`World.nearTopAt`, the exact footprint, not the grid's
  disc); the prompt goes beside the walker when the thing is off the
  frame; the region card has a paper halo; the map hides district
  names under 560 points and keeps them off each other. The tarn's
  skin is draped on its bowl. `shoot-lib` waits for the title veil.
- **Session 19's cast is built the way the next one should be**:
  `coast.ts`'s longship (`shipAt(h)`, a pure function), Pye and Wren
  (`Figure` with `maps`, routines whose stops are re-written in place
  when a door is taken), the two cards (getters that exist once the
  knowledge does, Nell's pattern), the horn answered across a border
  (a module-scope flag between two builders). `things.skims` and
  `things.splashes` for a thing that skips. `Boat.rowboat` for a land
  that wants to answer the rowboat.
- **`WAITS_FOR_THE_LINE` is seven.** Eleven waits exist; Joan's never
  puts her on a platform. `WAIT_ANSWERS` has castle, beach and ocean.
- **Three protected framings moved, measured** — see `SESSIONS.md`
  Session 19's `diff-sheets` numbers, and `critique-art-13.md`.

## 1. THE JOB (`THE-FUN-PASS` §14, Session 20)

1. **THE ALIENS in the Pale** (§10): something landed in the flattest
   ground in the world and burned ruled patterns into it; at night
   there are lights over the pan. Frightening at night, absurd by
   day. Stuck too. THE PALE is a district already. A toy.
2. **THE BARISTA at the junction** (§10): a coffee cart, and a person
   calling out names for orders nobody collects — a second list of
   names in the world. The only person in the city who stands still on
   purpose. Comedy, then something else. An earshot row.
3. **THE DESIGN STUDIO in the atrium** (§10): a UX research sprint on
   the timetable, sticky notes on the shelter glass, a persona pinned
   up called DENNIS, a journey map of a journey nobody has taken.
   Deadpan, and accurate.
4. **The office chair, the bin, the ball** (§5's toys): ride the chair
   down the mile; push the wheelie bin into the junction; kick a ball
   on the green. `QUESTS` §8 L8, L9, L10.
5. **Second doors for the present-day lands** (§6): Maple Court (turn
   Val's light off), Greyline (walk past), the Cubicle Mile (wipe the
   board / board the train). Cards, both doors visible, a permanent
   visible cost, nothing says which was right.
6. **The art gate on the three re-opened lands, and the play sheet.**

## 2. WHAT CONSTRAINS IT

1. **NOBODY CROSSES A BORDER BUT THE WALKER.** The aliens are stuck
   too. Nothing of theirs leaves the Flats.
2. **A MONSTER IS NEVER SEEN WHOLE, AND NEVER EXPLAINED.** The lights
   over the pan are lights.
3. **A PROTECTED FRAMING MAY MOVE WHEN THE LAND INSIDE IT IS THE
   SCOPE** (`QUALITY-BAR` §3). Say which and by how much.
4. **B2's rule stands**: every new building registers its footprint,
   and nothing new puts the camera inside a drawing.

## 3. THE GATES THAT ARE THE OWNER'S

1. **THE PLAY GATE** — sheets 16 to 19 may have come back.
2. **THE EAR GATE** — eighty-six WAVs in `out/sound/`, unheard.
3. **THE FEEL GATE** — owed since 12, plus the bicycle and a thumb on
   the joystick.

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
move when the land inside it is the scope, measured; **every barrier is
a drawing, there are no invisible walls, and every building is a
barrier**; a routine is a pure function of the hour, and the weather is
a pure function of the day and the hour; a sound with a place is a row
in `earshot.ts`, and no road is silent for fifteen seconds. End the
session: pushed, `SESSIONS.md` handoff updated, verdicts logged, **play
sheet written**.

## Standing debts, carried forward

- **THE ENDING HAS NO CONSEQUENCE THAT LASTS** — Session 21, owner's
  call.
- **The king's road runs through Brim's fountain** (found by B2): the
  fountain keeps its footprint and you go round it. Either the road
  bends or the fountain moves, and the square holds a WOWED framing —
  Session 22's, or the owner's.
- **The rowboat's first-meeting composition at THE RIVER MOUTH** —
  twelve gates have passed it.
- **THE HARROW DOWNS' stooked field**, **THE BLEACH FLATS' `WHERE THE
  ROAD STOPS`**, **GREYLINE CITY's THE HOLLOW**.
- **Brim Square's market-day crowd** — the belfry was not touched in
  19; Session 22's.
- **READ THE PROCLAMATION** and **THE 8:15 STOP's label** in the
  SKYLINE.
- **`critique-story-2` RECOMMENDED 2** — Session 22's.
- **The fifteen-second rule's measure** — sheet 18 §0; the owner's.
- **The bicycle on the feel gate**; **`check-camera` on a bicycle**.
- **The bull's chase is heard more than seen on a phone** — re-check:
  it now runs at the walker's north shoulder on both rigs.
- **The lamplighter is a dim figure at dusk** — the owner's call.
- **A wash tint per district** — declined three times.
- **The Penwood and the Downs dip under 55 fps** on the owner's Mac:
  CPU, the instanced fields' per-frame work. A phone first.
- **Wick, Pye and Wren at dusk are small**: their drawings are the
  folk's size and the dusk grade takes half of them. If the owner
  cannot find Wick on the avenue at dawn, scale them 1.15.

## Not this session's job

- **The 8:15 reading the doors back** — 21.
- **The tonal re-key and the story rewrite** — 22.
- **Interiors** — 23 (the van and the longship are on the list).
- **THE JUROR** — last.
