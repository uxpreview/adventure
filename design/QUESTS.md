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

That is not a limitation to be worked around. Fallout's best content is
its *unmarked* quests, the ones that are only quests if you notice
them — and we get to make the whole game out of those.

---

## 1. What each benchmark actually contributes

| game | what we take | what we refuse |
|---|---|---|
| **RDR2** | Strangers: multi-part, self-contained, tonally distinct from the main story. And roadside encounters, the cheapest magic in open worlds | its mission design — scripted corridors with a fail state |
| **GTA** | density of incidental activity; side content in a different genre from the main story (comedy against crime) | collectibles-as-content; icons everywhere |
| **Fallout** | environmental storytelling as the atom (WORLD-SYSTEMS §10), and the **unmarked quest** — content that only exists if you notice | the log, the markers, the "miscellaneous objectives" list |
| **Skyrim** | faction lines as parallel campaigns, completable in any order; the memorable-weird tier (Daedric quests) | **radiant quests** — procedurally generated filler, and Skyrim's own worst content. We generate nothing |
| **Goat Simulator** | that a world should reward messing about; that some content should exist only to delight; that a secret is allowed to just be a joke | everything else, obviously |
| **The Witcher 3** | **every side quest has a TURN** — a reveal that recontextualises what you were doing. This is the single highest bar on the list and it is the one we hold ourselves to | the "?" map icons, which CDPR themselves call the weak part |

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

**Total ≈ 93 authored pieces**, which is roughly what twelve to sixteen
hours costs at this bar, and which is why DIRECTION.md says the ladder
needs about five sessions beyond Session 13.

Two properties of that table matter more than the numbers:

- **Every tier has a distinct FUNCTION**, not just a size. THE LINE
  gives the world a shape; THE WAITS give each land an argument; THE
  STRANGERS stitch the lands together; THE ERRANDS make people feel
  like neighbours; THE ENCOUNTERS make the road feel inhabited; THE
  UNMARKED make the player feel clever. Take any tier out and something
  specific breaks.
- **The tiers are tonally distinct.** THE LINE is melancholy. THE WAITS
  are fables. THE STRANGERS are short stories with a turn. THE ERRANDS
  are warm. THE ENCOUNTERS are texture. THE UNMARKED are funny. That
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

## 8. Budget, and where it goes on the ladder

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
