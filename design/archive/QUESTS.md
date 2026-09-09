# QUESTS — the six tiers

*Companion to `design/STORY.md`. That file says what the story is; this
one says what a quest IS in a game that has no quest log, no markers,
no dialogue trees, no faces, no combat and no fail states — and how the
levels stack, which is the thing every open world the owner named gets
right and most games get wrong.*

*Written 2026-08-29 at the owner's request. A future session maps the
actual content; this file is the architecture it hangs on, plus the
counts, so nobody has to invent the shape while also inventing the
stories.*

---

## 0. The problem, stated honestly

Every game on the benchmark list tracks its content with UI we have
banned: a log, a marker, a compass, a dialogue wheel. WORLD-SYSTEMS §0
rule 1 is **no UI where the world can say it**, and rule 2 is **nothing
is urgent**. So "quest" cannot mean here what it means there.

What it means here: **a thing you can be doing, which you found by
looking, which you hold in your own head, and which ends with the world
visibly different.**

*(Amended 2026-09-01: "no dialogue trees" now reads "no faces, no
talking heads, no dialogue wheel." A choice card is allowed. And "the
verb is looking" now reads "looking is the first verb"; touch, carry,
sit and throw are the others. `THE-FUN-PASS.md` §2.)*

That is not a limitation to be worked around. Fallout's best content is
its *unmarked* quests, the ones that are only quests if you notice
them — and we get to make the whole game out of those.

---

## 1. What each benchmark actually contributes

*All six named by the owner, 2026-08-29. The standing record of every
reference this project uses — these plus Calvino, the small open worlds
and the knowledge games — is `design/INSPIRATION.md`.*

| game | what we take | what we refuse |
|---|---|---|
| **RDR2** | Strangers: multi-part, self-contained, tonally distinct from the main story. And roadside encounters, the cheapest magic in open worlds | its mission design — scripted corridors with a fail state |
| **GTA** | density of incidental activity; side content in a different genre from the main story (comedy against crime) | collectibles-as-content; icons everywhere |
| **Fallout** | environmental storytelling as the atom (WORLD-SYSTEMS §10), and the **unmarked quest** — content that only exists if you notice | the log, the markers, the "miscellaneous objectives" list |
| **Skyrim** | faction lines as parallel campaigns, completable in any order; the memorable-weird tier (Daedric quests) | **radiant quests** — procedurally generated filler, and Skyrim's own worst content. We generate nothing |
| **Goat Simulator** | that a world should reward messing about; that some content should exist only to delight; that a secret is allowed to just be a joke | everything else, obviously |
| **The Witcher 3** | **every side quest has a TURN** — a reveal that recontextualises what you were doing. This is the single highest bar on the list and it is the one we hold ourselves to | the "?" map icons, which CDPR themselves call the weak part |
| **RuneScape** *(added 2026-08-30)* | that a quest is **a piece of writing with a name people remember**, hand-authored, unrepeatable, gated by knowledge rather than by level, and permanently world-changing — and the largest proof anywhere that a world made almost entirely of authored content runs for decades. Plus the **local rule** (§8, proposed) and, for the endgame, that the last hours are **the map you already have, read differently** | **quest points, the quest journal, and the completion cape.** RuneScape keeps a literal counter and sells you something to wear for finishing them all, which is exactly what §7 forbids — from the game that otherwise agrees with us most |

---

## 2. The six tiers

| # | tier | count | length | what it is | what completing it changes |
|---|---|---|---|---|---|
| 0 | **THE LINE** | 1 | ~3 h | the main story: the 8:15, across all twelve lands | the world, permanently, once |
| 1 | **THE WAITS** | 12 | ~25 min | one per land: what this place is waiting for, who is waiting, and why. The "faction line" tier | that land, visibly and forever, plus one piece of the turn |
| 2 | **THE STRANGERS** | ~8 | ~15 min | multi-beat and **cross-land**: met in one place, resolved in another. The tier that makes the map feel like one world | two places at once, which is the point |
| 3 | **THE ERRANDS** | ~18 | ~5 min | local, single-beat, warm. One or two per land | one thing, small, near |
| 4 | **THE ENCOUNTERS** | ~24 | ~1 min | authored roadside moments: a cart with a broken wheel, someone lost, a funeral you should not interrupt | nothing. They are weather |
| 5 | **THE UNMARKED** | ~30 | seconds | things that are only content if you notice them. Some are secrets, some are jokes, none are rewarded | nothing, and that is the reward |
| 6 | **THE LOCAL RULES** *(ratified 2026-09-01; §8)* | ~12, one per land at least | as long as you like | a place where the world does something it does nowhere else, repeatable, with no score. What the verbs are for | nothing permanent — and sometimes something small and permanent, which is a choice and not a reward |

**Total ≈ 105 authored pieces**, which is roughly what twelve to sixteen
hours costs at this bar, and which is why DIRECTION.md says the ladder
needs about five sessions beyond Session 14.

Two properties of that table matter more than the numbers:

- **Every tier has a distinct FUNCTION**, not just a size. THE LINE
  gives the world a shape; THE WAITS give each land an argument; THE
  STRANGERS stitch the lands together; THE ERRANDS make people feel
  like neighbours; THE ENCOUNTERS make the road feel inhabited; THE
  UNMARKED make the player feel clever. Take any tier out and something
  specific breaks.
- **The tiers are tonally distinct.** THE LINE is melancholy. THE WAITS
  are fables. THE STRANGERS are short stories with a turn. THE ERRANDS
  are warm. THE ENCOUNTERS are texture. THE UNMARKED are funny. THE
  LOCAL RULES are play. That
  spread is what stops fifteen hours of a game about waiting from
  becoming ponderous — and it is why Goat Simulator is on the benchmark
  list and is not a joke entry.

---

## 3. How a quest STARTS, with no log

Four ways, in descending order of how often they should be used:

1. **You see it.** A thing is visible from somewhere you were already
   going. This is the primary and it is why THE SHOT and the sightline
   rules exist (QUALITY-BAR §4). Curiosity runs on sightlines.
2. **Somebody's posture tells you.** No faces, so a person is a
   posture, a place and a routine — and someone standing at a gate
   *looking north* has told you what they want without a word
   (WORLD-SYSTEMS §5).
3. **A place is written on.** Signs, boards, notices, timetables. We
   hand-letter everything and currently use it only for UI, which
   leaves a whole channel unused (§10). A notice actually nailed to
   Greyweather's gate, not merely described on a card.
4. **A note tells you.** The POI note cards, which already exist. The
   weakest of the four because it is the most like a UI, so it should
   carry the *voice* and rarely the *instruction*.

**AND FROM 2026-09-01 THE FIRST THREE ARE ALLOWED TO BE LOUD**
(`THE-FUN-PASS.md` §2.5, owner-confirmed; executed Session 15). *The
world never explains itself* and *nobody says the turn* are kept
absolutely for the turn and for the ending, and relaxed for everything
else. The owner's words: *"the starting point is bland and expected
but also confuses users because they don't know where to go or what to
do."* A world where nothing tells you anything is a world where you do
not know where to go. So:

- **You see it** may be a thing that is visibly HAPPENING, not only a
  thing that is visibly there: a cart rolling, a flock on the move, a
  banner coming down. Motion is the loudest sightline there is.
- **Somebody's posture** may point. A person at a gate may look up the
  road and raise an arm. Nobody speaks; everybody may indicate.
- **A place is written on** may say what it is for. A sign may say
  WELL. A notice may contain an instruction when the instruction is the
  joke or the invitation.
- **A note** stays what it was: the voice, and rarely the instruction.
  The one thing that did not get louder is the one that is a UI.

**The order is unchanged.** Loud is a licence, not a requirement, and a
land that points at everything has told the player there is nothing to
find.

**And a fifth way, from Session 15: THE PROMPT SAYS THE VERB.** SHOUT
DOWN THE WELL is an invitation and PUSH THE CART is one; the interact
prompt has always been the loudest hand-lettered thing in the frame, and
now that the key does five things (`design/specs/controls.md`), the
verb on it is how a player learns a place is a toy.

## 4. How a quest ENDS, with no log

**The world changes, visibly, permanently, near where you are standing.**

A shutter opens. A light comes on. Somebody who was standing is now
sitting. A stall opens. The banners come down. A gate that was shut is
open, and stays open in every later session and every later save.

If a piece of content cannot end with a visible change in the world, it
is not content, it is a note. That is the test.

## 5. The reward law

There is **no XP, no loot, no currency, no levelling, ever**. Four
rewards exist and they are enough:

1. **The world changes** (above). The primary, and the reason it is the
   ending rather than a side effect.
2. **You understand something**, which makes a place you have already
   been legible in a way it was not. Knowledge is the inventory
   (WORLD-SYSTEMS §6).
3. **A mount**, rarely — one per quadrant, each refusing the others'
   ground (§4).
4. **The map fills in.** Pencil for heard-about, ink for seen. The map
   is the record and the artifact people screenshot.

If a future session finds itself designing a fifth, it has drifted.

---

## 6. The tiers in detail

### Tier 0 — THE LINE

One story, four acts, twelve lands, documented in `STORY.md`. Gated
only by knowledge: you cannot finish Act III before you have understood
enough of the waits for the road to mean anything. **No hard locks** —
the world is open from the first minute and stays open. If a player
walks straight to the Cubicle Mile in the first ten minutes they should
find a stop, a timetable and a man called Dennis, and none of it should
mean anything yet. That is not a failure state; that is the game
working.

### Tier 1 — THE WAITS *(12, one per land)*

The substantial tier and the one that carries the hours. Each is a
short fable in that land's own century's register, with:

- **one named person** who is the wait made visible (the cast in
  `STORY.md` §7);
- **two or three places** in that land that mean something different
  once you know;
- **a turn** — the moment the wait turns out to be about something
  other than what it said. Witcher's bar, applied twelve times;
- **a visible, permanent change** to the land when it resolves.

They are completable in **any order**, like Skyrim's guild lines, and
each contributes one piece of the story's turn without ever naming it.

**AND FROM 2026-09-01 EVERY WAIT HAS A SECOND DOOR** (`THE-FUN-PASS.md`
§6). One door reads as completion, not choice — the owner's words were
*"I wish I had choices like Fallout, and those choices did things."*
Each wait's second door has a real cost, both doors are visible before
either is taken, the choice is offered on a **choice card** (§3 rule 2
amended: a hand-lettered prompt with two or three options, no faces, no
wheel), nothing ever says which door was right, and **the 8:15 reads the
doors back**. Fallout's rule: every choice has a loser.

### Tier 2 — THE STRANGERS *(~8, cross-land)*

RDR2's word and RDR2's shape, with our own constraint doing the work:
**a stranger is somebody who needs something from a land they cannot
reach.** You are the only one who crosses, so you are the only possible
solution, and the tier exists to make that fact *felt* rather than
stated.

Met in one land, resolved in another, two or three beats apart, and
tonally the most varied tier: one should be very funny and one should
be genuinely upsetting.

### Tier 3 — THE ERRANDS *(~18, local)*

DIRECTION.md's COURIER OF BRIM, demoted from spine to texture, which is
where it was always strongest. Single-beat, five minutes, warm, no turn
required. Carry a thing four hundred units. Find where the goat got to.
Tell Marget what the belfry clock actually says.

**They do not need to be clever.** A world where every single piece of
content has a twist is exhausting; the errands are the level ground
between the turns.

### Tier 4 — THE ENCOUNTERS *(~24, roadside)*

WORLD-SYSTEMS §5's list: a cart with a broken wheel, someone lost, a
funeral you should not interrupt. **Authored, never generated** — this
is the exact place Skyrim went wrong and the reason radiant quests are
its worst content.

Each fires once, at a place, possibly at an hour. You can walk past all
of them and lose nothing, which is what makes them feel like a world
rather than a checklist.

### Tier 5 — THE UNMARKED *(~30, secrets and jokes)*

Fallout's unmarked quests and Goat Simulator's entire philosophy, in
one tier. Things that are only content because you noticed them, and
which nothing in the game will ever acknowledge:

- the belfry clock's two hands disagree, and if you sit through an hour
  of the day cycle you find out which one is right;
- there is a fourth name on the Common's signpost;
- one of the Wide Blue's fleet has been in last place since the world
  began and is gaining;
- something in Brim moves when nobody is in the square.

**No reward, no acknowledgement, no achievement.** The delight is the
whole payload. This is the cheapest tier to author and the one players
will tell each other about, which is exactly the Awwwards-share
mechanic the bar is aiming at (QUALITY-BAR §1).

---

## 7. What we refuse

- **Radiant / procedural quests.** We generate nothing. Skyrim's worst
  content is its generated content and this project's whole moat is
  that everything is authored.
- **Markers, a compass, an objective list, a quest log.** The map is
  the record and it only records where you have actually been.
- **Fail states, timers and urgency** (§0 rule 2).
- **Fetch chains as a spine.** As texture, yes — Tier 3. As the game,
  no; it caps at three hours and teaches nothing cumulative.
- **Collectibles.** Tier 5 is not a collection: there is no count, no
  list, and no way to know you have them all, on purpose.
- **Mutually exclusive factions.** Fallout and Skyrim make you choose;
  we have no factions and nobody to betray. Every land can be answered.

---

### 7.1 THE COUNT — AMENDED BY THE OWNER, 2026-08-31, executed Session 14

The short form of the law, repeated in every session prompt since
Session 7, read: ***no count, no list, no percentage, anywhere, for
anything.*** Session 12 found the shipped build breaking it
(`src/ui/map.ts` prints *"N of 12 lands walked — N strides of ink"*) and
did not fix it. Session 13 put it to the owner with four options. **The
owner picked none of them and challenged the law instead:**

> *"I don't understand why that law exists. Progression, collection, and
> advancements are part of what makes games fun."*

**The law is amended, and this is the amendment.** It is not a quiet
split of the difference — the count on the map stays, and the rule that
was written to protect the design is rewritten to say what it was
actually protecting.

**What the law was for, and it was never a taste argument.** It came out
of §0's sizing: *a collection caps at about two hours*, because the
player learns nothing doing the ninth one that they did not know at the
third, and the target is HOURS of play (`WORLD-SYSTEMS` §0). That is an
argument against **collections**. It was written as an argument against
**numbers**, and those are not the same thing, and eleven sessions never
noticed because the shipped build had been breaking it since Session 1
and nobody minded.

**The owner is right about the half the law overreached on.** A number
that says *you have walked eleven of these* is a RECORD OF WHERE YOU
HAVE BEEN, not a checklist of things to fetch. This game already keeps
that record and is proud of it: the map draws in three registers and
inks the line once you have walked the whole of it, which is Act III's
entire beat and is *progression the player can see* by any honest
reading. Arguing that the inked line is fine and the sentence under it
is a violation was the law protecting its own wording rather than its
own reason.

**So the rule from here is:**

> **A NUMBER MAY RECORD WHERE THE PLAYER HAS BEEN. A NUMBER MAY NEVER
> GRADE WHAT THEY DID.**
>
> Allowed: what you have walked, what you have seen, how far you have
> gone — the map's own record, in the map's own place.
>
> Refused, exactly as before: a completion percentage; a checklist of
> anything the player is meant to go and get; a count of the twelve
> WAITS or of the answers to them, anywhere, in any form; a score, a
> grade, a rank, or any number that appears at the moment the player
> does something, to tell them they did it.

**And ONE thing is out of scope of the amendment and stays absolute,
because it is not a UI rule — it is the ending** (`THE-LINE.md` §4.2,
settled, and §5 is binding): *nobody grades it, nothing counts it, and
no screen anywhere tells you how many platforms had somebody on them.*
The 8:15 reads back fifteen hours of decisions by stopping twelve times.
A number at the end of that would retract the whole game in its last
minute, and no amendment to a UI law reaches it.

The count in `knowledge.ts` that the 8:15 asks (`answeredWaits`) is
bookkeeping and has exactly one caller, and no path from it to a pixel.
That is the same bargain §0 of that file already struck for route posts.

---

## 8. THE SEVENTH TIER — RATIFIED, 2026-09-01

*Raised by the owner adding RuneScape to `INSPIRATION.md` on
2026-08-30 and written down as a question. **Ratified by the owner on
2026-09-01** as part of the fun pass (`design/THE-FUN-PASS.md` §3 and
§5): every land gets at least one, it is the third of the seven things
a land has to have to play, and it is what the new verbs (touch, carry,
sit, throw) are mostly for. The text below is the proposal as it stood,
kept because its refusals still hold.*

### THE LOCAL RULE *(~10, place-bound, repeatable)*

RuneScape's minigames — Barbarian Assault, Castle Wars, Gnome Ball, the
Rat Pits — have nothing in common with each other except the one thing
that matters: **each is a place where the world behaves by rules that
apply nowhere else on the map**, you can just wander in and do it, and
it is over when you leave.

Ours would be the same shape with the scoreboard cut off:

> **One place in a land where the world does something it does nowhere
> else, available to anybody who walks in, repeatable for as long as you
> like, and worth doing because it is good to do.**

Candidates that already exist as drawings: the well that answers a shout
on too long a delay; the bell that splits the difference; skimming a
stone off the sandbar; the swing on the leaning oak; the echo in
Splitrock that comes back wrong.

**Why it might be a tier rather than more Tier 5.** THE UNMARKED is
things you NOTICE — the payload is the noticing and it happens once. A
local rule is something you DO, and the payload is that you can keep
doing it. Those are different appetites and a world wants both:
`WORLD-SYSTEMS` §0 lists four engines for depth and this is closest to
none of them, which is either an argument that it is missing or an
argument that it is not needed.

**Why it might not be.** Every tier in the table above has a distinct
FUNCTION and a distinct TONE, and the honest question is whether this
one's function is already covered by Tier 5 plus "motion is life"
(QUALITY-BAR §4). If a local rule turns out to be an idle animation you
can trigger, it is not a tier.

**What it may never become, whichever way the owner rules:** a score, a
timer, a leaderboard, a reward shop, or a currency. RuneScape has all
five and **every one of them is a meter** (§7, and the reward law in
§5). Take the room; refuse the scoreboard.

### THE TIER, AS A TIER — executed Session 15

The owner ruled, and the question above is answered: **a local rule is
something you DO, and the payload is that you can keep doing it.** It
is row 6 of the table in §2, it is the third of the seven things a land
has to have to play (`THE-FUN-PASS` §3), and the verbs (`specs/controls.md`)
are mostly for it. The rule for an entry, so nobody argues one in that
is not one:

> **A local rule is a TOUCH (or a carry, a sit, a throw) at a place,
> whose answer is a change in the world that you can see or hear, that
> you can do again, and that nothing counts.** If it is an idle motion
> you can trigger, it is not one. If it has a score, it is not one. If
> you can only do it once, it is an unmarked or an errand, not this.

**The register**, one line each, in the format the errands use:

| # | land | the local rule | ships |
|---|---|---|---|
| L1 | THE COMMON | **the well answers a shout**, on a delay that is too long — and it answers a stone thrown down it, later still. U7 said *once*; a local rule is repeatable, and this supersedes it | **Session 15** |
| L2 | THE COMMON | **the hay cart can be pushed.** It rolls, it slows, it stops at the border of the Common, and it stays where you left it in every later save. The first thing the walker ever moved | **Session 15** |
| L3 | BRIM | the bell rung early, and the town reacting | 17 / 19 |
| L4 | THE WIDE BLUE | **skimming a stone off the sandbar.** The Common's stone has a twin on the bar's crest; thrown at a run it skips three times off the water, a ring at each, and goes in, and the morning puts it back | **Session 19** |
| L13 | LONGSHORE / THE WIDE BLUE | **the horn on the point.** Blow it, and the longship answers from wherever it is, a beat and a half later, and the gulls go up. Every time | **Session 19** |
| L14 | GREYWEATHER | **the portcullis comes down a foot** when rattled, and thinks better of it, and the braziers gutter while it is down | **Session 19** |
| L15 | THE WIDE BLUE | **row into the fleet and scatter it**: a boat with the rowboat inside nine units bears away and the halyards run | **Session 19** |
| L5 | THE COMMON | the swing on the leaning oak — a sit, and the oaks' argument going by | (the sit ships Session 15; the argument is 16's) |
| L6 | SPLITROCK | the echo that comes back wrong | 19 |
| L7 | GREYWEATHER | sitting on the toppled king — while he is toppled | 15 (the sit exists; the king is a seat in 19) |
| L8 | THE CUBICLE MILE | **riding the office chair down the mile.** Sit on it and it rolls the way you were facing, on castors, with you on it, and stops where the floor lets it — a block, the shelter, the atrium's doors, the mile's edge. It stays where it stopped. Sit again | **Session 20** |
| L9 | GREYLINE CITY | **pushing the wheelie bin into the junction.** It has gone over (E19); right it, and then it rolls; into the crossing and the pigeons go up and the box ticks for it, which is the most the city has ever done for a bin | **Session 20** |
| L10 | MAPLE COURT | the bicycle's bell (18); **kicking a ball on the green** (20): a throw at a run is a kick, the ball rolls on, and the low dog goes after it and noses it back to your feet, and does not stop doing that | **Session 18 / 20** |
| L16 | THE BLEACH FLATS | **POKE IT.** The big one in the pattern blinks, the two small ones hop, and it makes a noise, and you can do it again. By day only; after dark there is nothing there to poke | **Session 20** |
| L17 | THE CUBICLE MILE | **peel a sticky off the shelter's glass.** It comes down and lies on the apron; the sprint puts the wall back in the morning | **Session 20** |
| L11 | THE HARROW DOWNS | the sheep scatter and close up — and now they go somewhere at dawn | 15 (the drove moves on the clock) |
| L12 | LONGSHORE | honking the 8:15 | 21 |

**And the two that ship this session are measured**, because a rule
about the border is a law and not a feeling: `tools/check-verbs.mjs`
shoves the cart at the Common's east edge fifteen times and asserts it
stops inside, and throws the stone at the south edge at a run and
asserts it lands inside.

---

## 9. Budget, and where it goes on the ladder

| tier | pieces | rough session cost |
|---|---|---|
| THE LINE | 1 | ~1 session to build the spine, then a beat inside each land session |
| THE WAITS | 12 | 1 per land, authored inside that land's session |
| THE STRANGERS | 8 | ~1 session |
| THE ERRANDS | 18 | folded into land sessions |
| THE ENCOUNTERS | 24 | ~1 session, plus opportunistic |
| THE UNMARKED | 30 | free — every session adds two or three and never says so |

Which is roughly the "about five sessions beyond the current ladder"
that DIRECTION.md already committed to, and it is now itemised rather
than estimated.
