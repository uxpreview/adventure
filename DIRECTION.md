# DIRECTION — what the game becomes

The maps came first, on purpose: every land is walkable, sounds like
itself, and has room left in it for a story. This file is the standing
question of what that story is. Nothing here is built yet; the world
was laid out so that any of these fit without moving a wall.

**Owner direction, 2026-08-29: the target is HOURS of play, not a
short walk** (`design/WORLD-SYSTEMS.md` §0, "A small map is not a short
game"). That is a real change to this file, because the three candidates
below were written for a two-hour game and it shows. A story that has to
carry fifteen hours is a different object from a story that has to carry
two, and the difference is not length — it is what kind of engine is
underneath it. Everything from "What hours actually require" down is new
and is the ideation the owner asked for.

## What the sheet already implies

Decisions already drawn into the world, which a story should use
rather than fight:

- **One sheet, one pen.** Everything is one drawing. Whoever drew it
  had one black pen, one blue, and a box of washes — and drew a castle,
  a suburb and an office park on the same page, which is exactly what a
  kid's (or a bored adult's) sheet actually looks like. The
  anachronism is the setting's truth, not a bug.
- **The geography argues time.** Old world in the north-west (castle,
  walled town), the player's "now" in the center (meadow, neighborhood),
  the grown-up world in the south-east (city, office park). Walking
  east-by-south reads as growing up. The river crosses all of it and
  ends at the sea.
- **The world inks itself in where you walk.** The re-ink cascade is
  already the mechanic of noticing. A story about attention, memory,
  or finishing something half-drawn gets this for free.
- **Notes in the margins.** The POI note cards speak in a wry narrator
  voice that already hints somebody drew all this and left.
- **The world can only speak through objects.** No faces, no dialogue
  trees, no quest log, no cutscenes — every channel a normal game would
  use is missing on purpose. So a story here is told the way Fallout
  tells its best ones: in what is left lying in a room
  (`design/WORLD-SYSTEMS.md` §10). Any candidate below has to work in
  that mode or it does not work at all.

## What hours actually require

Fifteen hours with **no combat, no fail states, no timers, no quest log,
no dialogue trees and no faces** is not a small ask. It has been done,
repeatedly, and the games that did it did not do it the same way. Sorted
by what actually keeps a person walking:

| engine | who proves it | what it costs us | hours it buys |
|---|---|---|---|
| **knowledge** — you get better at reading, the world was always open | Outer Wilds, Obra Dinn, Tunic, Chants of Sennaar | **no new system class**: the verb is looking | scales with authored instances; this is the one that goes long |
| **the world changes** — hours, weather, seasons | Stardew, Animal Crossing, RDR2 | one system, then free per land | multiplies everything already built |
| **traversal changes** — you move differently, so the map is new | Sable, Breath of the Wild | the mount system (§4, designed) | one re-read of the whole map per mount |
| **routine** — you learn where people are, and when | RDR2, Stardew | NPC schedules (§5, designed) | texture, not spine, but it is what makes a world feel inhabited |
| **collection** — find all the things | everything, unfortunately | almost nothing | 2 hours, then it is a checklist |

Two conclusions fall out, and they should govern the pick.

**First: the spine has to be KNOWLEDGE, not collection.** This is the
thing the three candidates below all get wrong, in the same way, because
they were sized for two hours. "Find the pencil areas and ink them in",
"carry the letter to twelve places", "hold back the white" are all
*collection loops wearing different hats*: the player learns nothing by
doing the ninth one that they did not know at the third. A collection
loop is a fine texture and a terrible spine. What runs long is a loop
where **the ninth one means something different because of the first
eight** — where the content is in the player's head and the world just
holds the evidence.

**Second: this engine has a knowledge loop nobody else could build, and
it has been sitting in plain sight since Session 1.** The world is drawn
by `ink.ts`, and `ink.ts` has a *hand*: jitter, pressure, passes, bow,
mis-registration, a seeded wobble. Those parameters ARE a person's
handwriting. Change them and it is a different person's line — and the
player can see it, because seeing it is what human eyes are best at.
**The thing to be read is the drawing itself.** No other game can do
this, because no other game's world is procedurally drawn by a library
whose parameters are the character of a hand.

## Three candidate stories

*(Written for a two-hour game. Read them with the table above in hand —
each is scored for the hours target underneath.)*


### 1. THE UNFINISHED SHEET *(recommended)*

The sheet was abandoned mid-drawing. Some lands are complete; others
fray at the edge into pencil under-drawing, construction lines, and
white paper. The walker — the first doodle, who woke up alone — goes
looking for the pen.

- **Verb:** the interact verb becomes *finish the drawing*: stand in a
  pencil-ghost area and hold to ink it in (the cascade system, made
  diegetic and player-driven). Finishing a land wakes what lives there.
- **Structure:** open — any land can be finished in any order; each
  finished land adds an instrument/voice to its mood and a drawn NPC
  with one want. The last thing to finish is the drawer's own empty
  chair at a desk drawn on the far side of the office park: the sheet
  turns out to be office paper, and the whole world was drawn in the
  margins of a workday. Ties the office park in as the thesis instead
  of the joke.
- **Why it fits:** uses cascade, ghost fields, the wry notes, and the
  kid-to-grown-up geography without adding a single new system class.
- **Why the Fallout direction strengthens it** (owner input,
  2026-08-29): the thing Fallout does better than anyone is
  ARCHAEOLOGY — every room legible as what it was before you got
  there. This story makes archaeology the *verb*: pencil under-drawing
  is the "before", inking it in is the reading of it, and every
  unfinished thing on the sheet is a room with the objects still in it.
  It also gives §9's score proposal an ending: the last thing you
  finish is the desk, and you find out what has been playing.
- **Against the hours target: the ending is excellent, the middle is a
  checklist.** "Stand here and hold to ink it in" is a collection loop,
  and it will be lovely for two hours and a chore at four. The premise
  and the ending are the best in the file and should be kept. **The
  middle needs an engine, and candidate 4 is that engine.**

### 2. THE COURIER OF BRIM

A letter needs carrying from the castle to a name nobody knows, and
every land claims the addressee is theirs. A picaresque: one fetch
chain per land, each told entirely in drawings and margin notes, no
dialogue trees. Lighter than margins; pure adventure-serial tone.
Cheapest to build (POIs + inventory of one item), but uses the world
as backdrop rather than as subject.

**Against the hours target: structurally capped.** Twelve fetch beats is
about three hours and the thirteenth would be padding, because a fetch
chain teaches you nothing cumulative. Its real value is as a **side
structure inside a bigger story** — one good errand per land is exactly
the kind of texture an hours-long game wants. Demote from spine to
texture.

### 3. THE TIDE OF WHITE

Paling, played forward: the sheet is fading from the west (the sea
grows; the beach thins) and the walker herds the world's drawings
east while looking for a way to stop it. Urgent and mechanical
(territory control against a timer), strongest systemic hook, but
tonally heavier and needs the most new simulation.

**Against the hours target: retire it.** It was always in tension with
WORLD-SYSTEMS §0 rule 2 (*nothing is urgent; no timers, no fail
states*), and the hours target makes that fatal rather than awkward:
urgency sustained over fifteen hours is not tension, it is grind, and a
territory-control timer is the one shape on this list that actively
punishes the thing this world is for, which is dawdling. Keep the
IMAGE — the sea eating the west edge of the page is a beautiful,
terrifying picture — and use it as a place or an act, never as a clock.

### 4. THE OTHER HAND *(new, 2026-08-29 — and the recommended engine)*

**There are two hands on this page.**

Most of the world is one person's line. The wobble is theirs, the
pressure is theirs, the particular way they draw a roof or give up on a
crowd is theirs — and after twenty minutes you know it without being
told, the way you know a friend's handwriting.

Some of it is not. A fence that runs true for forty units and then, all
at once, becomes four wobbles and stops. A tree drawn three times in a
row, getting better. A castle that is too good — traced off something.
A whole land drawn at the wrong scale by somebody who had not learned
scale yet. A gate drawn twice, the second one over the first, because
the first was wrong and could not be erased.

The game is **learning to see the line.** And once you can, you cannot
stop, and the entire world you already walked re-reads itself.

- **Verb: unchanged.** Walk and look. There is nothing to unlock,
  nothing to collect, nothing to fight. The gate is in your head, which
  is the only kind of gate this game is allowed to have.
- **Progression is knowledge.** Hour one you notice that *something*
  about the Penwood is off. Hour three you can name it. Hour six you
  walk into Brim and realise the whole south wall is the second hand
  and the town behind it is not, and you know what that means, and
  nobody has said a word to you.
- **Why it goes long:** every authored instance is content, and the
  reveals are *cumulative* rather than additive — the moment you work
  out that the castle was traced is worth an hour of walking, and it is
  only worth it because of the forty small things you noticed first.
- **Why only this engine can do it:** `ink.ts` already parameterises a
  hand. `stroke()` has jitter, passes, alpha, taper and a deliberate
  mis-registration between passes; `line()` has a single-sign bow whose
  depth grows with length, *because a wrist is a compass*. A second hand
  is a second parameter set — perhaps thirty lines of code — and the
  entire world can then be authored in either. **That is a moat. Nobody
  can copy this game's mystery without rebuilding this game's engine.**
- **The risk, stated honestly:** abstraction. "Two drawing styles" is a
  puzzle, not a story, and puzzles do not make anybody cry. It needs a
  human anchor — *who* the two hands are and why one of them was
  drawing on the other's page — and it needs the reveal to be about
  people rather than about line weight.

### The recommendation: one game, not four

THE UNFINISHED SHEET has the best premise, the best verb and much the
best ending in this file. What it lacks is a middle that survives four
hours. THE OTHER HAND is a middle that survives fifteen and has no
ending at all.

**They are the same game.** The sheet was abandoned mid-drawing; you
walk it looking for the pen; the ink-in verb is your moment-to-moment
texture and the thing that makes finishing feel good — and the reason to
keep going is that **finishing something shows you who drew it.** Every
inked-in place is evidence. The second hand is why the sheet was
abandoned. The desk at the far side of the office park is where you find
out what happened to both of them.

That gives us, in one object: a verb (ink it in), a loop (read the
line), a spine (two people, one page), an ending (the desk), a reason
for the geography we already drew (east-by-south is growing up — and
one of the hands got older while the other did not), and a use for every
system already planned. Nothing here needs a system class we have not
already designed.

**Sizing it honestly.** Twelve lands × six places, three unfinished
things, two Fallout tableaux (§10) and one or two inhabitants with a
routine; eight interiors; five mounts; a day cycle and weather. First
pass ≈ 4–6 hours. Second pass, with mounts and hours and the ink-in
verb changing what is walkable and what is visible ≈ 4–6 more. The
reading layer ≈ 4, if it is authored with the same discipline as the
terrain. **Call it twelve to sixteen hours**, and note that it needs
roughly five sessions beyond the current ladder — interiors,
inhabitants and routine, weather, and one authoring pass for the
evidence. That is the real cost of the owner's target and it should be
on the ladder before anybody promises it.

## Either way, next sessions

1. **The score** — one instrument per land rather than one music box
   for the world, a bed per land instead of one room tone, borders that
   crossfade, and a mix that answers both the hour and how you are
   moving. See `design/WORLD-SYSTEMS.md` §9; it is Session 8 on the
   ladder, ahead of the remaining land sessions, because a land's voice
   is part of authoring the land.
2. **Interiors** — one per civic land to start: the keep's hall, a
   Brim tavern, an office lobby (gloss steps already wait for it).
   Small sub-sheets entered by door POI, same engine.
3. **NPCs with one want each** — the doodle-folk field graduates a few
   instances into placed characters with a two-line note economy.
4. **Story pick** — **ideation opened 2026-08-29 at the owner's
   request**, and this file now carries a fourth candidate and a
   recommendation (THE UNFINISHED SHEET as the spine, THE OTHER HAND as
   its engine). The pick itself is still the owner's and still
   **scheduled for Session 7**; STORY.md gets written before a line of
   it is built, the way margins did. See `PLAN.md`.

Note: blots-as-caves (the `BLOT` inverted palette) stay parked until a
story needs them — a cave system with no reason to exist is Skyrim's
weakest content, not something to copy.
