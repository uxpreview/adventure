# PROMPT — Session 7: THE STORIES

You are continuing INKLANDS in `uxpreview/adventure` on `main` — the
default branch, and what Vercel project `adventure` deploys to
production (https://adventure.ryankm.com). Read, in order:
`design/QUALITY-BAR.md` (binding), **`design/STORY.md` and
`design/QUESTS.md` (both binding, and this session is the one they were
written for)**, `design/WORLD-SYSTEMS.md`, `PLAN.md`, `README.md`,
`SESSIONS.md` — plus `design/INSPIRATION.md` whenever you are about to
cite another game as a model, because every entry there is scoped to
one thing we take and one thing we refuse.

**Session 6's handoff especially.** It shipped four systems this
session is built on top of, and it also found the one gotcha that will
decide whether your text survives contact with a phone.

Six lands hold the bar: THE COMMON, the Brim south face, the Brim
interior, CASTLE GREYWEATHER, LONGSHORE, THE WIDE BLUE. **None of them
may regress.** This session touches almost no geometry, so that is a
lower risk than usual — but it rewrites the words in all six, and the
words are half the game.

---

## The standing rule, which this session is the hardest test of

> **The medium is the STYLE. It is never the SUBJECT.** Nothing about
> the paper, the pen, the drawing or whoever drew it. The ballpoint and
> the sheet's terrain vocabulary are CRAFT and stay exactly as they are.

Every previous session obeyed this in *code* and quietly broke it in
*prose*. Item 5 below is the reckoning, and it is not a tidy-up: it is
the single most delicate piece of writing in the project's history,
because the sentence the whole story hangs on is one of the offenders.

---

## What you are inheriting

The story is **LOCKED** (`design/STORY.md` — THE 8:15) and its content
architecture is **WRITTEN** (`design/QUESTS.md` — six tiers, ~93
pieces, counts and functions and refusals all settled). **You are not
inventing either.** You are mapping the first, building the one system
the second requires, and fixing the voice.

Session 6 handed you four things, and three of them are load-bearing
here:

- **The hour is readable by anything.** `import { clock } from
  '../daylight'` — `clock.hour`, `clock.phase`, `clock.clockText`
  ("twenty past six"). No plumbing, no context, no App. **Routine is
  now buildable** (STORY §7, WORLD-SYSTEMS §5), and QUESTS Tier 5's
  belfry secret — *the clock's two hands disagree and if you sit through
  an hour you find out which one is right* — is authorable today.
- **The road CARRIES, and the line carries hardest.** The king's road /
  main street / commuter spur chain is one road under twelve names and
  the walker can now FEEL it. Act III's reveal has a body under it
  before anybody says a word. Do not squander that by having somebody
  say it.
- **Brim's lamps come on at dusk.** That is the first piece of this
  world that changes *visibly and permanently on a condition*, which is
  exactly QUESTS §4's ending test ("a shutter opens, a light comes
  on"). The mechanism exists and has a precedent. Copy it.
- (And the rowboat, which is the first mount and made the mount rule
  legible in hour one. It is not needed here.)

---

## The job

### 0. SCOPE FIRST, AND BE HONEST ABOUT IT

PLAN.md's line for this session asks for ~93 authored pieces, a new
content system, the map rework and a full voice pass. **That is not one
session and you should not pretend otherwise.** The ladder rule is *a
session may swap scope up the ladder, never skip the gate.*

So the shape is: **map everything, build the system, author one
vertical slice, fix the voice.** Specifically —

- items 1–3 are DOCUMENTS. Map all of it. Nothing rendered.
- item 4 is CODE. Build it, and prove it with **one WAIT authored end
  to end** — pick THE KINGDOM OF BRIM, because Marget, the market that
  has been "next week" for a long time, the belfry clock and the lamps
  are all already standing there.
- item 5 is a TEXT PASS over all 33 existing notes, and it ships.

If you finish early, author a second WAIT. Do not author twelve badly.

### 1. Map THE LINE — four acts, beat by beat

`STORY.md` §4 has the acts. Turn them into beats: where each one lives
on the sheet, what the player SEES, what triggers it, and — the column
that matters most — **what it does not say.** Rule 5 of §8: nobody says
the turn, ever.

Act III is the one to get right. The road has been under the player's
feet for fifteen hours and Session 6 made it pull at them. The reveal
is not a speech; it is the moment the player can see the whole line at
once. Work out where a person can stand to have that happen.

`STORY.md` §6 flags the ending as **a proposal, not law**, and says the
session that maps the stories owns it. **You own it. Settle it.**

### 2. The twelve WAITS

One per land (`STORY.md` §3 has what each waits for and what that makes
it believe). Each needs the four things QUESTS §6 Tier 1 lists: one
named person, two or three places that mean something different once you
know, **a TURN**, and a visible permanent change.

The turn is the bar and it is the highest one on the list — Witcher's
bar, twelve times. A wait without a turn is a description.

### 3. THE STRANGERS, and the three inventories

Eight strangers (QUESTS Tier 2): met in one land, resolved in another,
because **you are the only thing that crosses** and this tier exists to
make that felt rather than stated. One must be very funny. One must be
genuinely upsetting.

Then the lists — ~18 errands, ~24 encounters, ~30 unmarked. **These are
inventories, not prose.** One line each. Resist writing them up.

### 4. KNOWLEDGE AS THE CONTENT SYSTEM — the code

WORLD-SYSTEMS §6. Not an item, not a journal entry, not a flag: a
**NAME**, a **FACT**, a **ROUTE**, a **REASON**. Places open because
the player now knows what they are looking at, not because a boolean
flipped.

Two things it has to do, and one it must not:

- **The map is the record.** Pencil for what you have heard about, ink
  for what you have seen. Today the map is a reference tool; it should
  be the artifact people screenshot. `src/ui/map.ts` already knows
  which lands you have walked and already draws in both registers.
- **Save it.** `Save.data` gained `boat` and `hour` last session
  without ceremony; knowledge goes the same way.
- **It must not become a checklist.** QUESTS §7: no count, no list, no
  way to know you have them all. If the player can see a completion
  percentage anywhere, you have built the thing this project refuses.

Then prove it: **one WAIT, end to end, in Brim.** Marget sets the stall
out at dawn, lays the cloth, does not open, packs it away at dusk — you
have a clock now, so that is a routine and not a description. It ends
with something visibly, permanently different in Brim Square.

### 5. THE VOICE PASS — and the number is worse than STORY.md thought

`STORY.md` §8 rule 7 says *the wry narrator stays; the winking stops*,
and estimates "about a third of the thirty-five existing notes need
this pass."

**It is 17 of 33.** Over half. Counted, not estimated:

> `grep -rn "body: '" src/world/regions/*.ts | grep -ciE "the sheet|the page|whoever drew|a drawing|the pen\b|drawn "`

They are not all equal. Some are throwaway ("the apples are red because
the pen only brought one other colour"). Some are the best lines in the
game. And one of them is this:

> *"the timetable says the 8:15 is coming. **the 8:15 is drawn nowhere
> on this sheet.** everyone waiting knows both of these things and has
> made their peace."*

That is the premise. It has been in the game since Session 1, STORY.md
§1 calls it the best sentence anybody has written for this project, and
it is the spine of the entire story — **and it points straight at the
medium.**

**Solve that line first, before you touch the other sixteen.** If you
cannot keep what it does while obeying the rule, say so plainly and put
the question to the owner rather than quietly mangling it. Everything
else in this session is downstream of getting that one sentence right.

The rest of the pass: keep the deadpan (STORY §8 rule 3), keep the
register per land (rule 6), stop the winking. A note carries the VOICE
and rarely the INSTRUCTION (QUESTS §3.4).

---

## The constraint that will bite you, and it is new

**Hand-lettering is drawn onto a CANVAS, and a canvas does not reflow.**
Session 6 fixed the note card to wrap and size itself to the phone it is
on — but there is still a ceiling, and you are about to write ninety
pieces of text.

**Measured, on a 320×568 phone:** the longest note in the game today
(THE CUT, ~230 characters) renders a 359px card against a 488px budget
and does not scroll. **Keep a note under ~300 characters.** Past ~340 it
scrolls, and a note you have to scroll has stopped being a note and
become a document (QUESTS §3.4).

`node tools/shoot-mobile.mjs` shoots the chrome at 320/360/390/430
points. **Run it with your longest note in the game.** QUALITY-BAR §3
now makes this law: *the chrome is shot too* — five sessions of world
screenshots never once opened a note card, and a player's phone found
text running off the side of the screen that had been doing it since
Session 1.

---

## The gate

This session ships mostly documents, one system and a text pass, so the
usual contact sheet is not the whole judgement. Three parts:

1. **The art director** (QUALITY-BAR §2) on what is actually visible:
   the reworked map, the Brim WAIT's visible change at both its states,
   and the chrome at both viewports. Protected framings re-shot at two
   hours (`HOUR=12` and `HOUR=19.6`) and unregressed.
2. **Read every note aloud.** All 33, in one sitting, in order. Winking
   is inaudible on a screen and unmissable in the mouth.
3. **A new critic, and this one is a proposal — flag it to the owner
   rather than assuming it:** a **STORY EDITOR** who reads the twelve
   waits blind and has to be able to say, for each land, *what it
   believes* — without being told, and without the word "waiting"
   appearing. If they cannot, the wait is a description and not a fable.
   Log it beside the art director's verdict in
   `design/critiques/critique-story-1.md`.

Iterate to WOWED. Log the verdicts verbatim.

---

## Law (short form — QUALITY-BAR.md is the long form)

Zero image assets; all marks via `src/engine/ink.ts`; washes only from
`palette.ts`; `elevation.ts` is the only authority on where the ground
is and water may never climb a hill; layout rects move only with a
layout-wide audit; standees stay vertical, decals follow the surface; a
fold is drawn, not shaded; hatching is for cliffs; the camera only ever
looks north and that decides layout; author landforms with planar
faces; **the medium is the style and never the subject**; **nobody
crosses a border but the walker**; 60fps mobile with DPR capped at 2;
the chrome is shot too; build green before every push; `node
tools/check-terrain.mjs` before you look at anything; the walker has two
dots and nobody else has a face; nothing reads as an array; nothing is
generated, ever; **no fifth reward** (QUESTS §5); portrait is judged,
not checked. End the session: pushed, `SESSIONS.md` handoff updated,
verdicts logged.

---

## Two standing debts, carried forward — fix if convenient, do not derail

- **The rowboat's first-meeting composition** at THE RIVER MOUTH is a
  lot of sand. Session 6's gate passed it and pointedly did not praise
  it.
- **POI labels have no collision logic.** "THE CROSSROADS" overlaps the
  signpost it names. Pre-existing, visible in the mobile sheet, and
  bigger than it looks — it probably wants its own slice.
