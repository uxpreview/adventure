# PROMPT — Session 17: LIFE

You are continuing INKLANDS in `uxpreview/adventure`. Read, in order:
**`design/THE-FUN-PASS.md` in full** (the owner's brief; binding), §9
twice (the four multipliers, which are this session), §3 (the bar for a
playable land — seven things, and item 5 is *five idle motions and
three that respond*, per land), `design/specs/the-common.md` with its
Session 15 and 16 addenda (the one land that has all seven, as the
model), `src/world/events.ts` and `src/world/company.ts` (the two
systems this session multiplies), then `PLAN.md`, `README.md`,
`SESSIONS.md`. **Play sheet first:** `design/play-sheets/session-16.md`
is what the owner was handed; if they have played it, their verdict is
in `SESSIONS.md` above Session 16's entry and it governs this session.
If they have not, the sheet's questions are still open — the bull's ten
seconds, the goat's stop, the lures on a phone — and you build on the
assumption that the opening is right until told otherwise.

---

## 0. THE FIRST HOUR EXISTS. THE OTHER ELEVEN LANDS ARE STILL DIORAMAS.

Session 16 built the opening: a bull, a gate, a goat that stops at the
border, four lures, districts, Nell with two doors. It is one land with
all seven of §3's things in it. The owner's words, which this session
exists to answer:

> *"The parts between sections feel empty."*
> *"More interaction and motion."*
> *"Think of aliens, Vikings, UX designers, surfers, baristas, monsters,
> other types of animals, etc."*

The cast (§10) is Sessions 19 and 20. **This session is the four
multipliers in §9** — the things that raise all twelve lands at once —
and it is bigger than it was on the old ladder, on purpose.

---

## 1. THE JOB

### 1. UNNAMED INHABITANTS, WITH ROUTINES (§9 item 1)

Five to twelve per land, none of them named, all of them somewhere at
a given hour. Shutters that open. A lamplighter four lamps behind.
Children on the green. A delivery that finds the stall shut. **On
`events.ts`, every one of them** — *at this hour, in this place, this
happens* — so that a land not built when the routine started still
draws it right when the walker arrives. The named cast stays exactly as
it is. And **the hand-rolled routines** (Brim's lamps, the shelter's
light, Amos's night walk, Joan's working day) move onto `events.ts`
this session, which was owed from 15.

### 2. THE ANIMALS (§9 item 2)

The cheapest life per byte in any world. A fox and bats at night; seals
on the sandbar; cows in the Downs (the bull is the Common's; the Downs
gets a herd that parts); a heron at the tarn; pigeons in Greyline that
lift as one; crabs on the wrack; a cat on a wall that wakes if you run
past; rooks at Greyweather and on the scarecrow; something under the
Wide Blue that surfaces once at dusk. **At least one creature per land
that reacts to the walker** (§3 item 1), and **the second co-walker** —
`critique-story-3` RECOMMENDED: not another goat, on a road the goat
did not take. A dog on the Downs' lane that stops at the Downs' edge is
the obvious one, and `company.ts` is built for it: one `Follower` and
four drawings.

### 3. WEATHER (§9 item 3)

Rain (the smudge pass runs the drawing, and it is nearly free); wind
that turns the mill and fills the sails; fog that closes the vistas —
**and the four lures with them, which is a thing the Common's opening
now depends on**; a storm once in a while at night. Weather is a
system, not a land's: one clock, like the day, readable by anything.

### 4. NIGHT AS A DIFFERENT GAME (§9 item 4)

Night is a colour grade today. It should be where the frightening
content lives (WAITS & THE UNSEEN: the deep pines when the pine-tick
stops; the sea at the torn edge; the moat pool), where lit windows are
navigation, and where certain people and animals only exist. Amos and
Kay already do. **The bull lies down at dusk and gets up at dawn** —
one `events.register` call, as Session 15 said.

### 5. THE PLAY SHEET, AND `check-fields` EXTENDED TO ROUTINES

Ten minutes at three hours of the day. And `tools/check-fields.mjs`
drives at every creature that changes posture; extend it to every
routine that changes drawing, because the owner found the last such
bug and no contact sheet could have.

---

## 2. WHAT SESSION 16 LEFT YOU

- **`src/world/company.ts`** — the co-walker rule. `new Follower({ rect,
  home, gap, notice, walk, trot })`, `tick(dt, px, pz, blocked)`, poses
  `stand | walk | trot | stopped`, `justStopped` on the frame the border
  holds it. The goat is the instance; the drawing is the land's.
- **`src/world/barriers.ts`** — fences that refuse a foot, with gaps
  that open and shut. App asks it beside the terrain. **Every barrier
  is a drawing standing in the same place.**
- **`layout.DISTRICTS`, `districtAt`** — the layer is general; the
  Common is populated. The card and the map read it. Session 18 fills
  the other eleven; if a routine this session wants a district to be in,
  add the district.
- **`layout.POSTER` and `SPAWN`** are two places now. The title stands at
  the poster; SET OUT wakes you in the field, through a blink of paper.
  A saved walk opens where it was left.
- **The bull** in `meadow.ts` is a six-state machine on `common.bull`;
  its rect is `FIELD`; its stop at the hedge is a clamp before the
  move. **It grazes all night today**; §9 item 4 is one register call.
- **The four lures** stand in every north-facing framing of the Common
  and are measured (`tools/check-lures.mjs`). **Fog that closes the
  vistas must close them** — they are `fog = false` standees and fade
  on the walker's z; a weather system needs a hand on their opacity.
- **Nell** watches the cart through a getter. Her card is offered only
  with `fact:the-timetable`; `WAITS_FOR_THE_LINE` is six.
- **`tools/shoot-session16.mjs`** is the pattern for a stateful proofs
  sheet: `fresh: true` on a framing re-opens the page, because the
  opening is stateful and a bull that has already charged is a
  different picture.
- **The gates that moved**, and by how much: `SESSIONS.md` Session 16
  has the `diff-sheets` numbers; the lures are the reason, and
  `critique-art-10.md` re-earned the verdict on the new frame.

---

## 3. THREE THINGS THAT CONSTRAIN THE WHOLE SESSION

1. **IT FIRES WHETHER OR NOT THE WALKER IS THERE.** Every routine is a
   pure function of the hour (`events.progress`). A routine that only
   runs when somebody is watching is a diorama with a motor.
2. **NOBODY CROSSES A BORDER BUT THE WALKER — and birds do** (§9's one
   free thematic layer). Every inhabitant and every animal is drawn in
   its land's ink; the rooks cross and nobody looks up. Record it, do
   not fix it.
3. **A PROTECTED FRAMING MAY MOVE WHEN THE LAND INSIDE IT IS THE
   SCOPE** (`QUALITY-BAR` §3). This session opens every land. Say which
   framings moved and by how much; `diff-sheets` reports; the verdicts
   are re-earned in a critique, not assumed.

---

## 4. THE GATES THAT ARE THE OWNER'S

1. **THE PLAY GATE** — Session 16's sheet may have come back. Read it
   first. This session's sheet is a day in the life of three lands.
2. **THE EAR GATE** — sixty-two WAVs in `out/sound/`, unheard. Every
   animal and every weather adds a voice.
3. **THE FEEL GATE** — owed since Session 12, plus sitting, plus the run
   taught by a bull. `check-camera` still has to pass.

---

## Law (short form — QUALITY-BAR.md is the long form)

Zero image assets and zero audio assets; every voice is synthesis and
nothing outside `Audio.ts` invents an instrument, exactly as nothing
outside `palette.ts` invents a colour; all marks via `src/engine/ink.ts`;
`elevation.ts` is the only authority on where the ground is; **the
resting bearing is due north, walking does not turn the frame, and a
stopped walker (seated or standing) is always in the shipped
composition**; the medium is the style and never the subject; **nobody
crosses a border but the walker — and no thing does either, and no
companion**; 60fps mobile with DPR capped at 2; the chrome is shot too,
on the desktop as well as the phone, and the choice card is chrome;
build green before every push; the walker has two dots and nobody else
has a face; nothing reads as an array; nothing is generated, ever; no
fifth reward; a number may record where the player has been and may
never grade what they did, and the ending stays absolute; portrait is
judged, not checked; looking is the first verb and not the only one; a
choice card is allowed and a dialogue wheel is not; local stakes are
allowed and a villain is not; districts are allowed and more sheet is
not; the world may point the way and may never say the turn; a
protected framing may move when the land inside it is the scope,
measured; **every barrier is a drawing, and there are no invisible
walls**. End the session: pushed, `SESSIONS.md` handoff updated,
verdicts logged, **play sheet written**.

## Standing debts, carried forward

- **THE ENDING HAS NO CONSEQUENCE THAT LASTS** — Session 21, owner's call.
- **THE PAPER PLANE** — Session 18; the throw exists and it is the
  plane's first half.
- **The rowboat's first-meeting composition at THE RIVER MOUTH** — nine
  gates have passed it.
- **THE HARROW DOWNS' stooked field**, **THE PENWOOD's east arc**, **THE
  BLEACH FLATS' `WHERE THE ROAD STOPS`**, **GREYLINE CITY's THE HOLLOW**.
- **Holt's lit window** is one warm pixel at forty units.
- **Brim Square is full**, and this session puts a crowd in it.
- **READ THE PROCLAMATION** and **THE 8:15 STOP's label** in the SKYLINE.
- **`critique-story-2` RECOMMENDED 2** — Session 22's.
- **The oaks' argument going by while you sit** (`QUESTS` §8, L5) —
  Session 16 did not build it; it is a routine, and it is this
  session's.
- **The Common's fifteen-second rule is not measured** — Session 18's
  tool; the Common is the first land it should walk.
- **The bull's chase is heard more than seen on a phone**: at 13° off
  the lens in portrait the bull is at the frame's edge at the wake and
  behind it for most of the run. The east–west chase was the fix for
  desktop; the owner's phone decides whether it is enough.

## Not this session's job

- **Districts in the other eleven lands** — 18.
- **The twenty-eight encounters and the fifteen-second tool** — 18.
- **The cast** — 19 and 20. Not one Viking this session.
- **Second doors for the other ten waits** — 19 to 21.
- **THE JUROR** — last.
