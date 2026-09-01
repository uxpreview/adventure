# PROMPT — Session 15: THE VERBS AND THE LAW

You are continuing INKLANDS in `uxpreview/adventure`. Read, in order:
**`design/THE-FUN-PASS.md` in full** (it is the owner's brief and it is
binding), `design/QUALITY-BAR.md` §3 (the five amendments and the
permission to regress), `design/QUESTS.md` §3, §6 Tier 1 and §8,
`design/specs/controls.md`, then `PLAN.md`, `README.md`, `SESSIONS.md`.

**The owner's direction of 2026-09-01 first.** The owner played all
twelve lands and said the game is beautiful and not fun. That is what
makes this session what it is.

---

## 0. THE GAME WAS BUILT TO BE READ, AND THIS IS THE FIRST SESSION THAT BUILDS IT TO BE PLAYED

Twelve lands hold a verdict. The ending exists. And the owner's verdict
on the whole of it, in their words:

> *"I read things but that's not fun. I wish I had choices like
> Fallout, and those choices did things."*

> *"It almost feels like a chore going from one place to another."*

This is a **foundations session**, by the ordering rule in `PLAN.md`:
the verbs and the choice card change how every land is authored, so
they land before any land is re-opened. Nothing in this session is a
land. Everything in it is a system that every later session in the fun
pass stands on.

---

## 1. THE JOB

### 1. THE VERBS — touch, carry, sit, throw, on one key

`THE-FUN-PASS.md` §5 is the spec. One context key: the one the game
already uses to look (`E`, or tap). What it does depends on what is in
reach, and the prompt says which, hand-lettered, in the house voice.

| verb | ships as |
|---|---|
| **touch** | a `touch` field on a standee or decal, and the world's answer: a sound, a motion, a change. One-shot |
| **carry** | one carried-object slot on the walker, drawn in hand; pick up, walk, put down; never more than one; no inventory anywhere |
| **sit** | a `sit` field; a walker pose; the camera does not move; time passes and routines go by. Joan's wait already resolves on it, so it must not regress her |
| **throw** | the one carried thing, underarm, a few units, with an arc, a landing and a sound |

**What it must never become:** an inventory, a hotbar, crafting, a
weapon, or anything you can hold two of. And **the walk must not get
worse**: the key that touches is the key that looks, and a player who
never touches anything should not notice the game changed.

### 2. THE CHOICE CARD

`THE-FUN-PASS.md` §2.2 and §6. A hand-lettered card, in the note card's
own system (`src/ui/`), with two or three options. It appears at a
moment that matters and nowhere else. Both doors are visible before
either is taken. It is drawn on a canvas, so **it is measured at every
width `shoot-mobile` shoots** and it is added to the chrome that tool
asserts.

**No faces, no talking heads, no wheel.** It is a card, it says what
the two things are, and choosing one changes the world.

### 3. A SCHEDULED-EVENT CLOCK

`THE-FUN-PASS.md` §9. `daylight.ts` has one clock and everything reads
it. This session adds the thing that lets a land say *at this hour, in
this place, this happens* without every land builder rolling its own:
an event registered against an hour and a place, that fires whether or
not the walker is there, with a `platform`-shaped export so a land can
know an event is in progress. It is the plumbing for Session 17.

### 4. THE THREE PROOFS

A system session ships proof that the systems are worth having, and
each proof is a thing the owner can play in the play sheet:

1. **A toy on the Common.** THE WELL answers a shout (`THE-STRANGERS`
   U7 says it already does, on too long a delay); make the shout a
   touch. And **THE HAY CART can be pushed**: it rolls, it stops at the
   border of the Common, and it stays where you left it. The first
   local rule in the game and the first thing the walker has ever
   moved.
2. **A choice card at the toppled king.** GREYWEATHER's second door
   (`THE-FUN-PASS` §6): put him back on the plinth, or leave him. Both
   doors built. Put him back and Wick is relieved: the banners come
   down, the avenue goes quiet, the moat pool clears, and it stays that
   way in every later save. Leave him and nothing changes, which is
   also a choice. **Nothing says which was right.**
3. **One scheduled event.** THE DROVE moves at dawn: the thirteen
   sheep that already part for the walker walk the lane from the fold
   to the field at first light, whether anybody is there or not, and
   stand in the field all day. Session 10 built the sheep; this session
   gives them an hour.

### 5. THE LAW, EXECUTED

The five amendments are written into `QUALITY-BAR.md` §3 already. This
session executes them where they live in the source and the specs:
`design/specs/controls.md` gains the verbs; `QUESTS.md` §3's four ways
a quest starts get their loudness back; and **the local-rule tier is a
tier** (`QUESTS.md` §8), with the well and the cart as its first two
entries.

### 6. THE PLAY SHEET

`THE-FUN-PASS.md` §13. Ten minutes for the owner, written as *stand
here, do this, then this*, with the build link. This session's is:
wake, shout down the well, push the cart to the Brim border, walk to
the toppled king, choose, watch the avenue tomorrow, and be in the
Downs at dawn. **Say in the log that the gate was handed over and not
run.**

---

## 2. WHAT SESSION 14 LEFT YOU

- **`src/engine/Eight15.ts`** — the last mount and the ending's
  instrument. **It exports `platform`**, module scope, which is how a
  land knows not to draw its own person while they are on a platform.
  The scheduled-event clock wants the same shape.
- **`src/world/knowledge.ts`** — a NAME, a FACT, a ROUTE, a REASON, and
  `WAIT_ANSWERS` with four entries missing on purpose. **A door is a
  piece of knowledge with a name a human could read**, the same as a
  fact, so the choice card writes to this and nothing else.
- **`src/world/daylight.ts`** — one clock, module scope, forty minutes
  a day. Brim's lamps, the shelter's light and Amos's night walk all
  read it; none of them is registered anywhere, which is what §1.3
  fixes.
- **`src/engine/Character.ts`** — the walker, the walk cycle, the ink
  weight, the lean. The carried thing and the sit pose go here.
- **`src/ui/UI.ts`, `lettering.ts`** — the note card, the region card,
  the hint, the prompt. The choice card is a fifth thing they letter.
- **`tools/shoot-mobile.mjs`** — five rigs, every piece of chrome at
  every width. The choice card joins the list.
- **`design/THE-STRANGERS.md` Part Two** — twenty errands, one line
  each, every one of which needs carry or touch. Do not build them;
  they are Session 18's. Do make them buildable.

---

## 3. THREE THINGS THAT CONSTRAIN THE WHOLE SESSION

1. **NOBODY CROSSES A BORDER BUT THE WALKER.** The cart stops at the
   Common's edge. A thrown thing that lands in another land is a bug.
   The sheep walk a lane inside the Downs. The border rule was not
   amended and it is the engine of the ending.
2. **THE MEDIUM IS THE STYLE, NEVER THE SUBJECT.** A well, a cart and a
   king are subject. The prompt for the well says SHOUT, not anything
   about ink.
3. **THE FIRST MINUTE HOLDS A VERDICT AND THE COMMON IS THE MOST-SHOT
   LAND IN THE GAME.** `QUALITY-BAR` §3 now gives permission to move a
   protected framing when the land inside it is the scope. The cart is
   in the spawn framing. **Say which framing moved and by how much, and
   re-shoot the title.** Permission to regress is not permission to
   not measure.

---

## 4. THE GATES THAT ARE THE OWNER'S

`QUALITY-BAR` §2. Three now.

1. **THE PLAY GATE** — new, and this session's whole point. The play
   sheet is the handover.
2. **THE EAR GATE** — fifty-three WAVs in `out/sound/`, unheard. Any
   new sound this session (the well's answer, the cart's wheels, the
   thrown thing landing) goes into the pack for free.
3. **THE FEEL GATE** — owed since Session 12. The verbs add input; the
   camera must not move for any of them. `check-camera` still has to
   pass, and sitting is the one new state where a stopped walker is
   still due north.

---

## Law (short form — QUALITY-BAR.md is the long form)

Zero image assets and zero audio assets; every voice is synthesis and
nothing outside `Audio.ts` invents an instrument, exactly as nothing
outside `palette.ts` invents a colour; all marks via `src/engine/ink.ts`;
`elevation.ts` is the only authority on where the ground is; **the
resting bearing is due north, walking does not turn the frame, and a
stopped walker is always in the shipped composition**; the medium is the
style and never the subject; **nobody crosses a border but the walker**;
60fps mobile with DPR capped at 2; the chrome is shot too, on the
desktop as well as the phone, **and the choice card is chrome**; build
green before every push; the walker has two dots and nobody else has a
face; nothing reads as an array; nothing is generated, ever; no fifth
reward; a number may record where the player has been and may never
grade what they did, and the ending stays absolute; portrait is judged,
not checked. **AND FROM 2026-09-01:** looking is the first verb and not
the only one; a choice card is allowed and a dialogue wheel is not;
local stakes are allowed and a villain is not; districts are allowed
and more sheet is not; the world may point the way and may never say
the turn; **a protected framing may move when the land inside it is
the scope, measured**. End the session: pushed, `SESSIONS.md` handoff
updated, verdicts logged, **play sheet written**.

## Standing debts, carried forward

They live in `PLAN.md` too, because this file is overwritten every
session.

- **THE ENDING HAS NO CONSEQUENCE THAT LASTS** — the departure is not
  permanent. It is the owner's call and it is executed either way in
  Session 21.
- **THE PAPER PLANE** — Session 18, and the fourth deferral is the
  last. It is a throw from height, so the throw verb this session
  builds is its first half.
- **The rowboat's first-meeting composition at THE RIVER MOUTH.** Seven
  gates have passed it and not praised it, and it is the front door of
  HOLT's wait.
- **THE HARROW DOWNS' stooked field**, **THE PENWOOD's east arc**, **THE
  BLEACH FLATS' `WHERE THE ROAD STOPS`** and **GREYLINE CITY's THE
  HOLLOW**: all passed, none praised. The last one belongs to
  `elevation.ts`.
- **Holt's lit window** is one warm pixel at forty units.
- **Brim Square is full**, and it is about to get a crowd (Session 17)
  and a second door (Session 21). Whoever opens it next opens it once.
- **READ THE PROCLAMATION** on the barbican and **THE 8:15 STOP's
  label** are both compromises in the SKYLINE. Whoever next opens it
  takes both.
- **`critique-story-2` RECOMMENDED 2** — the timetable should mean
  nothing until some of the names on it do. Session 22's, beside the
  story gate.

## Not this session's job, and recorded so nobody re-derives them

- **The opening** (`THE-FUN-PASS` §11: the bull, the four lures, the
  Common as the plateau) is Session 16's. This session makes the cart
  pushable; Session 16 makes it get away.
- **The co-walker as a rule of the world** is Session 16's, with NELL.
- **Districts** are Session 18's. Do not add a layer to `layout.ts`
  this session; the scheduled-event clock is enough new plumbing.
- **The cast** (`THE-FUN-PASS` §10) is Sessions 19 and 20. Not one
  Viking this session.
- **Second doors for the other eleven waits** are Sessions 19 to 21.
  This session builds one, at the king, as the proof.
- **THE JUROR** (`PLAN.md` row 24) wants a game whose first hour works,
  which is why it is last.
