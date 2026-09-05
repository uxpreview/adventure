# PROMPT — Session 21: THE SECOND DOOR

You are continuing INKLANDS in `uxpreview/adventure`. Read, in order:
**`design/THE-FUN-PASS.md` in full** (the owner's brief; binding), §6
twice (the second door: every wait, both doors, who loses, and *the
ending reads the doors*), §14 (Session 21's row), `design/THE-LINE.md`
§4 and §5 (the 8:15 and the ending — what a platform is, who stands on
one, what is in the windows), `design/THE-WAITS.md` (every wait's
BUILT and SECOND DOOR notes; §2, §4, §7, §10 are the ones whose second
doors are not built), `src/engine/Eight15.ts` (the train, the
platforms, `waiting()`, `ending`), `src/world/knowledge.ts`
(`WAIT_ANSWERS`, `WAITS_FOR_THE_LINE`, the doors as knowledge),
`src/world/regions/coast.ts` and `civic.ts` (Session 19's and 20's
cards are the pattern: a getter on the POI that exists once the
knowledge does, two doors, a permanent visible cost, the land reading
the door back every frame), `PLAN.md`, `README.md`, `SESSIONS.md`.
**Play sheets first:** `design/play-sheets/session-20.md`, `-19.md`,
`-18.md`, `-17.md`, `-16.md` are what the owner was handed; if they
have played any of them, the verdict is in `SESSIONS.md` above Session
20's entry and it governs this session. If they have not, the sheets'
questions are still open. **Sheet 18 §0** (the fifteen-second rule's
measure) is still the owner's to answer.

---

## 0. WHAT SESSION 20 LEFT YOU

- **The owner's four sketches are in the game, as drawn**
  (`src/world/textures-cast.ts`): THE LOW DOG on the green, THE SQUARE
  FLOCK in the overflow, THE VISITORS in the Pale, THE BARISTA'S DOG at
  the junction. Each has an eye because the owner's pen gave it one;
  the law that only the walker has a face is bent there, on the
  owner's hand, and nowhere else. If the owner says a drawing is not
  theirs, that drawing changes; nothing else about them does.
- **Seven waits have two doors on a card now**: Nell (16), Wick, Pye,
  Wren (19), Val, the man at the junction, Dennis (20). **Five do
  not**: Marget (set the clock yourself), Holt (tell him the sea has no
  bottom — S5), Amos (fill the cistern yourself), Brack (the tarn
  boat's oar to Hallows), Joan (clear the second setting away). §6 has
  each door and who loses.
- **The doors are knowledge and nothing reads them but their own
  land.** `door:the-cart-pushed`, `door:the-king-restored`,
  `door:the-pots-hauled`, `door:the-fleet-finished`,
  `door:the-light-off`, `door:the-walked-round`,
  `door:the-board-wiped`, `door:the-corner-pressed` are all in saves
  and none of them changes a platform. `WAIT_ANSWERS` says which door
  answers (Val's is `door:the-gap-cut` since 20).
- **A seat can move and can answer being sat on** (`sit.onSit`, getters
  on `sit.x/z`, `App` follows both axes): the office chair. **A
  carriable can roll** (`ThingDef.rolls`): the ball. **A land can lay
  its own prints** (`Footprints` takes a `map`): the paws.
  **`knowledge.first(prefix)`** reads one id back by prefix: the day
  Val's light went off. **`UI.chrome.open`** says a card is up.
- **`check-verbs` §11 runs on a fresh page** like §10, and asserts the
  cast: the lights never inside twelve, the poke, the barista's hours,
  the bin, the pavement's card and the lane, the intercept, the peel,
  the flock's scatter and the one that does not, the chair rolling with
  the walker on it, the board's card, the low dog to the ball and to
  the green's edge, Val's card and which door answers.

## 1. THE JOB (`THE-FUN-PASS` §14, Session 21)

1. **The five remaining second doors**, on cards, on the pattern:
   Marget's clock (either hand; half the town's routines shift to your
   hour — `LIGHT_AT`, the market, the lamplighter; Marget or the
   lamplighter is permanently wrong), Holt's (S5's bottomless sea told
   to him; he stops oiling and the marks weather), Amos's (fill the
   cistern from the oasis once in daylight — a carry, the can is the
   thing; he stops carrying and the track grows over), Brack's (the
   tarn boat's one oar carried to Hallows; the twelfth tree is right,
   the tarn boat has none), Joan's (clear the second setting away; it
   is not laid again, and nobody loses but the player). Both doors
   visible, a permanent visible cost, nothing says which was right.
2. **THE 8:15 READS THE DOORS** (§6's last rule): which platforms have
   somebody on them, what is in the windows, and who is in the carriage
   are consequences of doors and not of completion. `Eight15.ts`'s
   `waiting()` asks `knowledge.answered(land)`; from this session it
   asks the doors — a wait answered by door one puts its person on the
   platform; a wait taken by door two puts something else there, or
   nobody, per §6's *who loses* column, and the windows carry it.
3. **THE ENDING HAS NO CONSEQUENCE THAT LASTS — the owner's call,
   executed either way.** `THE-LINE.md` §5 and `SESSIONS.md`'s standing
   debt. If the owner has decided, build it; if not, build the smaller
   one (the platforms stay as the doors left them the morning after)
   and write the larger in `PROMPT.md` for 22.
4. **The ending re-shot** (`shoot-8-15`), both rigs, with the doors
   driven, and the art gate on it.
5. **The play sheet.**

## 2. WHAT CONSTRAINS IT

1. **NOBODY CROSSES A BORDER BUT THE WALKER.** A person on a platform
   is on their own land's platform. Nothing a door does moves anybody.
2. **NOTHING SAYS WHICH DOOR WAS RIGHT.** Not the card, not the note,
   not the ending. The windows show; they do not judge.
3. **A NUMBER MAY RECORD AND MAY NEVER GRADE.** `WAITS_FOR_THE_LINE`
   stays a threshold the player never sees. The doors are not counted
   anywhere a player can read.
4. **A PROTECTED FRAMING MAY MOVE WHEN THE LAND INSIDE IT IS THE
   SCOPE** (`QUALITY-BAR` §3). Say which and by how much.
5. **B2's rule stands**: every new building registers its footprint;
   nothing new puts the camera inside a drawing.

## 3. THE GATES THAT ARE THE OWNER'S

1. **THE PLAY GATE** — sheets 16 to 20 may have come back.
2. **THE EAR GATE** — ninety-five WAVs in `out/sound/`, unheard.
3. **THE FEEL GATE** — owed since 12, plus the bicycle, the chair and a
   thumb on the joystick.

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
in `earshot.ts`, and no road is silent for fifteen seconds. End the
session: pushed, `SESSIONS.md` handoff updated, verdicts logged, **play
sheet written**.

## Standing debts, carried forward

- **THE ENDING HAS NO CONSEQUENCE THAT LASTS** — this session, the
  owner's call.
- **The king's road runs through Brim's fountain** (B2): the fountain
  keeps its footprint and you go round it. Session 22's, or the
  owner's.
- **The rowboat's first-meeting composition at THE RIVER MOUTH** —
  thirteen gates have passed it.
- **THE HARROW DOWNS' stooked field**, **THE BLEACH FLATS' `WHERE THE
  ROAD STOPS`**, **GREYLINE CITY's THE HOLLOW**.
- **Brim Square's market-day crowd** — Session 22's.
- **READ THE PROCLAMATION** and **THE 8:15 STOP's label** in the
  SKYLINE.
- **`critique-story-2` RECOMMENDED 2** — Session 22's.
- **The fifteen-second rule's measure** — sheet 18 §0; the owner's.
- **The bicycle and the chair on the feel gate**; **`check-camera` on a
  bicycle**.
- **The lamplighter is a dim figure at dusk** — the owner's call.
- **A wash tint per district** — declined three times.
- **The Penwood and the Downs dip under 55 fps** on the owner's Mac.
- **Wick, Pye, Wren, the barista and the designers at dusk are small**:
  the folk's size, and the dusk grade takes half of them. If the owner
  cannot find them, scale 1.15.
- **THE CART's label sits high** on Greyline's shop row rather than
  over the cart (the skyline's nearest top is the row's); the label
  anchor wants a `labelHeight` or the cart wants its own cell.
- **The pavement's card is skippable by standing still**: four seconds
  by the man without reading the stone still answers the wait (Session
  13's mechanic, kept). If the owner wants both doors seen before
  either is taken, the four seconds wait on `fact:the-pavement`.
- **The barista's dog's paws fade in fifteen minutes** (`Footprints`
  fade 900); a pavement that kept them for good wants the prints laid
  as a decal on the routine's line instead.

## Not this session's job

- **The tonal re-key and the story rewrite** — 22.
- **Interiors** — 23 (the van, the longship, the studio are on the
  list).
- **THE JUROR** — last.
