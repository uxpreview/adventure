# PROMPT — Session 16: THE FIRST HOUR

You are continuing INKLANDS in `uxpreview/adventure`. Read, in order:
**`design/THE-FUN-PASS.md` in full** (the owner's brief; binding), §11
twice (the opening the owner chose), `design/specs/controls.md` (the
verbs, as built), `design/QUESTS.md` §3 and §8, `design/THE-WAITS.md`
§9 (NELL), `design/critiques/critique-story-2.md` MANDATORY 1 (the
co-walker), `design/specs/the-common.md` with its Session 15 addendum,
then `PLAN.md`, `README.md`, `SESSIONS.md`. **Play sheet first:**
`design/play-sheets/session-15.md` is what the owner was handed; if
they have played it, their verdict is in `SESSIONS.md` above Session
15's entry and it governs this session. If they have not, the sheet's
questions are still open and you build on the assumption that the
verbs are right until told otherwise.

---

## 0. THE VERBS EXIST. THE FIRST HOUR DOES NOT.

Session 15 built the systems: touch, carry, sit, throw on one key; the
choice card; the scheduled-event clock; the things registry. It proved
them with a well, a cart, a stone, a swing, a king and a flock. **It
did not touch the first minute**, on purpose, because the ordering rule
says systems land before the lands are re-opened, and the Common is
the land that is about to be re-opened hardest.

The owner's words, which this session exists to answer:

> *"The starting point is bland and expected but also confuses users
> because they don't know where to go or what to do."*

And the decision, made 2026-09-01 and not re-opened without them:
**THE BULL + THE FOUR LURES + THE COMMON AS THE PLATEAU**, with the
cart as the first toy and the goat as the second co-walker.

---

## 1. THE JOB

### 1. THE BULL (`THE-FUN-PASS` §11, candidate 5)

You wake in long grass. A bull is already looking at you. You run —
taught by necessity, in ten seconds, which retires Session 12's *hold
shift to run* hint for a fresh page — it chases, **Nell holds the field
gate and slams it, and the bull stops at the fence.** You are standing
at the crossroads, breathing, with everything visible. Funny, and
frightening for exactly ten seconds.

What it needs: a bull (the first creature of the Common, `THE-FUN-PASS`
§3 item 1); a chase that is a local stake and not a fail state (§2.3 —
it never touches you; it stops at the fence because the fence is a
rule); Nell at the gate, moving for the first time; and a spawn point
in the long grass rather than at the signpost. **The title poster's
verdict is held on a frame that includes the spawn**: say which
framing moves and by how much, re-shoot the title at both hours, and
re-earn the verdict (`QUALITY-BAR` §3, permission to regress).

### 2. THE FOUR LURES (candidate 2)

The castle on the ridge, smoke from the mill, the glint of the sea,
the city's towers — **all four in frame from the crossroads**, so the
signpost points at things you can already see. The keep vista already
does one of the four (`meadow.ts`, false perspective). Build the other
three the same way: pencil-pale, fogged, and fading before the walker
can catch them working. The camera is due north and the frame is
68.6° across on desktop and 26.5° in portrait: **measure which lures
portrait can hold, and say so.** A lure that only works in landscape
is not done.

### 3. THE COMMON AS THE PLATEAU (candidate 10)

One of everything, before the world opens. Session 15 put in a thing
to shout down, a thing to push, a thing to throw, a thing to sit on
and a stone. This session adds: **an animal** (the bull, and the goat
that follows you — the second co-walker, `critique-story-2`
MANDATORY 1, which stops at the border), **one choice card** (Nell's,
below), **one stranger's opening beat** (S1 or S2's Common end), and
**the Common's districts** as the first land to have them — the
crossroads, the river bend, the fair ground (new) and the well
(`THE-FUN-PASS` §7). Districts are a `DISTRICTS` layer under the
twelve rects in `layout.ts`, a card that can say a district's name
under its land's, and the map. Build the layer generally; populate it
for the Common only.

### 4. NELL'S WAIT, WITH TWO DOORS

`THE-WAITS` §9. She leans on the field gate watching the road, already
drawn (the doodle-folk at 26.6, 63.8). Door one: bring the fourth name
from the timetable and the cart is loaded and turned north. Door two
(`THE-FUN-PASS` §6): **push the cart yourself, down any of the other
three roads; it stops at the border; Nell does not follow it.** The
cart is already pushable and already stops at the border
(`src/world/things.ts`). What is new is that Nell notices: she
straightens when the cart moves, and where it ends up is what she is
looking at from then on. `WAIT_ANSWERS.meadow` goes in, and
`WAITS_FOR_THE_LINE` goes to six.

### 5. THE CO-WALKER AS A RULE OF THE WORLD

`critique-story-2` MANDATORY 1: Act I's second and third facts have one
optional teacher between them. The fix is a co-walker who stops at the
border — the goat (from the Penwood, on the Common for the opening) —
so the rule *nobody crosses a border but the walker* is SEEN in the
first ten minutes rather than read in the third hour. It follows; it
stops dead at the Brim gate; you go on. That is I.7's repetition and it
arrives whichever road you take.

### 6. THE PLAY SHEET, AND THE STORY GATE ON ACT I

Ten minutes: wake, run, the gate slams, look at four things, pick a
road, be followed, be left at the border. The story gate re-run on
Act I (`design/critiques/critique-story-3.md`): can a reader who has
only played the first hour say what the Common believes? Log it.
**Say in the log that the play gate was handed over and not run.**

---

## 2. WHAT SESSION 15 LEFT YOU

- **`src/world/things.ts`** — pushable and carriable things, one slot,
  the border clamp. The cart is `hay-cart`; the stone is `fist-stone`.
  A thing has a `home` and the morning puts lost things back. A new
  thing is one `register` call and a mesh the land moves.
- **`src/world/events.ts`** — *at this hour, in this place, this
  happens.* `events.register`, `events.progress(id)` (a pure function
  of the hour), `happening.ids`. The drove and the Common's morning are
  registered at module scope in their lands' files. **A bull that gets
  up at dawn and lies down at dusk is one register call.**
- **`WorldPOI`** (`regions/index.ts`) — `touch`, `sit`, `choice`,
  `weak`, a `prompt` that may be a function, a `note.body` that may
  be a function. App dispatches choice → note → touch → sit.
  **Nell's card is a `choice` on her POI**, exactly like the king's.
- **`src/ui/UI.ts` `openChoice`** — the card, measured at every width,
  asserted in `shoot-mobile`. The longest door in the game is LEAVE HIM
  WHERE HE LANDED; if Nell's is longer, `shoot-mobile` will tell you.
- **`Character.hold` / `setSitting`** — the hand and the pose.
- **`tools/check-verbs.mjs`** — the law around the verbs. It shoves the
  cart at the border; it will shove it wherever you move it.
- **`tools/shoot-session15.mjs`** — the pattern for a proofs sheet:
  `do` scripts on the harness, both states, both viewports.
- **The POI constructor no longer spreads its definition**, so a live
  getter stays live. The rowboat's prompt follows the boat now, which
  it had not done since Session 6. Nell's cart-watching can be a getter.
- **`fact:the-place-kept` is taught by sitting** and by nothing else,
  and was taught by nothing at all before Session 15. Check every wait's
  id is actually learned somewhere; that one was not.

---

## 3. THREE THINGS THAT CONSTRAIN THE WHOLE SESSION

1. **NOBODY CROSSES A BORDER BUT THE WALKER.** The bull stops at the
   fence. The goat stops at the gate. The cart stops at the edge. It is
   the engine of the ending and this session is the first time the
   player SEES it.
2. **THE FIRST MINUTE HOLDS A VERDICT AND YOU ARE ABOUT TO MOVE IT.**
   Permission to regress is written (`QUALITY-BAR` §3). It is
   permission to measure, not to skip: `diff-sheets` on every Common
   framing, the title re-shot at both hours, the numbers in the log,
   and the verdict re-earned in a critique.
3. **FUNNY, AND FRIGHTENING FOR EXACTLY TEN SECONDS.** The Common is
   WAITS & THE UNSEEN (§4: frightening), and the bull is the first
   local stake in the game (§2.3). No villain, no fail state, no timer.
   Fear is a sound, a distance, and a thing that moved. It never
   touches you.

---

## 4. THE GATES THAT ARE THE OWNER'S

1. **THE PLAY GATE** — Session 15's sheet may have come back. Read it
   first. This session's sheet is the first hour.
2. **THE EAR GATE** — fifty-eight WAVs in `out/sound/`, unheard. The
   bull, the gate slamming and the goat all go in.
3. **THE FEEL GATE** — owed since Session 12, plus sitting since 15,
   plus the run taught by a bull. `check-camera` still has to pass; the
   chase is the first time anything in the game asks the walker to run
   somewhere specific, and the camera may not help by turning.

---

## Law (short form — QUALITY-BAR.md is the long form)

Zero image assets and zero audio assets; every voice is synthesis and
nothing outside `Audio.ts` invents an instrument, exactly as nothing
outside `palette.ts` invents a colour; all marks via `src/engine/ink.ts`;
`elevation.ts` is the only authority on where the ground is; **the
resting bearing is due north, walking does not turn the frame, and a
stopped walker (seated or standing) is always in the shipped
composition**; the medium is the style and never the subject; **nobody
crosses a border but the walker — and no thing does either**; 60fps
mobile with DPR capped at 2; the chrome is shot too, on the desktop as
well as the phone, and the choice card is chrome; build green before
every push; the walker has two dots and nobody else has a face; nothing
reads as an array; nothing is generated, ever; no fifth reward; a
number may record where the player has been and may never grade what
they did, and the ending stays absolute; portrait is judged, not
checked; looking is the first verb and not the only one; a choice card
is allowed and a dialogue wheel is not; local stakes are allowed and a
villain is not; districts are allowed and more sheet is not; the world
may point the way and may never say the turn; a protected framing may
move when the land inside it is the scope, measured. End the session:
pushed, `SESSIONS.md` handoff updated, verdicts logged, **play sheet
written**.

## Standing debts, carried forward

- **THE ENDING HAS NO CONSEQUENCE THAT LASTS** — Session 21, owner's call.
- **THE PAPER PLANE** — Session 18; the throw exists now and it is the
  plane's first half.
- **The rowboat's first-meeting composition at THE RIVER MOUTH** — eight
  gates have passed it. (Its prompt follows the boat now, at least.)
- **THE HARROW DOWNS' stooked field**, **THE PENWOOD's east arc**, **THE
  BLEACH FLATS' `WHERE THE ROAD STOPS`**, **GREYLINE CITY's THE HOLLOW**.
- **Holt's lit window** is one warm pixel at forty units.
- **Brim Square is full**, and Session 17 puts a crowd in it.
- **READ THE PROCLAMATION** and **THE 8:15 STOP's label** in the SKYLINE.
- **`critique-story-2` RECOMMENDED 2** — Session 22's.
- **The hand-rolled routines** (Brim's lamps, the shelter, Amos, Joan)
  are not on `events.ts` yet — Session 17 moves them.
- **The well's note is gone** (it was a description of the toy). If the
  owner misses it, the answer is a sign on the well, not a note.

## Not this session's job

- **Districts in the other eleven lands** — 18.
- **Life** (unnamed inhabitants, weather, night) — 17.
- **Second doors for the other ten waits** — 19 to 21.
- **The cast** — 19 and 20. Not one Viking this session.
- **THE JUROR** — last.
