# THE LINE — the four acts, beat by beat

*Session 7. `design/STORY.md` says what the story IS and is the bible;
this file says where every beat of it LIVES — the place on the sheet,
the thing the player sees, what fires it, and the column that matters
most, **what it does not say**.*

*Two things here are decisions rather than notes, and both were this
session's to make. §3 fixes **where a person stands for Act III**, and
it is not where anybody assumed. §5 **settles the ending**, which
`STORY.md` §6 flagged as a proposal and handed to the session that maps
the stories. It is law now.*

---

## 0. How to read the tables

Every beat has five columns and the fifth is the point.

| column | what goes in it |
|---|---|
| **where** | a place on the sheet, with coordinates where they exist |
| **sees** | what is in frame. If nothing is, it is not a beat |
| **fires on** | arriving, an hour, a knowledge the player holds, or a look |
| **says** | the words, if any. Most beats have none |
| **DOES NOT SAY** | the thing a worse game would put here |

Rule 5 of `STORY.md` §8 governs the last column and it is absolute:
**nobody says the turn.** Not the narrator, not a note, not a person,
not the ending. Every beat below has been checked against it, and three
early drafts of Act III were thrown away for failing it.

---

## 1. ACT I — *You are the one they were waiting for. You are not.*

**Length:** the first thirty to fifty minutes, and it is not gated —
a player who walks straight east never formally "finishes" it. It is
finished when three facts have landed, and the facts land by repetition,
not by beat.

**The three facts, none of them ever stated:** everybody here is
waiting; nobody here can leave; **you can**.

| # | where | sees | fires on | says | DOES NOT SAY |
|---|---|---|---|---|---|
| I.1 | THE COMMON, the crossroads (−45, 58) | four names on a signpost. Three are places. One is **8:15** | waking | nothing | that one of them is a time. The signpost is hand-lettered and level; the player either reads all four or does not |
| I.2 | THE COMMON, the long fence (−12, 34) | **NELL**, leaning on the gate, facing north up the road | walking within sight | she straightens when you come up the road, and settles again when you are not who it is | who she is waiting for, or that she is waiting |
| I.3 | THE COMMON, the field gate | Nell falls in beside you and walks the road as far as the Brim border, then stops dead | leaving north with Nell met | nothing at all | why she stopped. She does not explain and does not follow. **This is the co-walker's first appearance and it is the whole of fact two** |
| I.4 | BRIM, the south gate (−45, −27) | the portcullis up, the guard's post empty, the square beyond it set for a market | crossing the border | the region card, which is all it ever says | that the market is not on |
| I.5 | BRIM SQUARE (−45, −81) | **MARGET** at her stall. Cloth laid. Nothing on it | arriving in the square between dawn and dusk | she looks up when you come into the square, once. She does not do it twice | that she thought you were the buyer |
| I.6 | GREYWEATHER, the avenue (−45, −190) | **WICK** carrying a rolled banner up an avenue with nobody on it | arriving on the avenue | nothing | that the king is not coming |
| I.7 | anywhere, the second co-walker | somebody else stops at their own border | the second time it happens | nothing | **that it is a rule.** It is a rule, and the player works it out on the second or third one, which is the correct number |

**The comedy is in I.5 and I.6 and it is deadpan** (STORY §8 rule 3):
two people, a century apart, both briefly certain you are the thing that
was coming, both wrong, neither of them saying so. It is funny the first
time. By Wick it is not.

**What Act I must not do:** open with a person telling you the rules.
The signpost, Nell's shoulders and the border she will not cross are
the whole tutorial, and every one of them is a drawing.

---

## 2. ACT II — *The twelve waits.*

Open, any order, no gates. `design/THE-WAITS.md` is the whole of Act II,
twelve fables long — this section only records how Act II TALKS to the
line, which is the part `THE-WAITS.md` cannot own on its own.

Three structural rules:

1. **Every wait resolves into one FACT the player now holds**, in that
   land's own words, and the fact is about *that land only*. Nobody
   generalises. (The knowledge system, `src/world/knowledge.ts`, is what
   holds them.)
2. **The facts rhyme and nothing points at the rhyme.** Twelve answers
   in twelve registers, all of them a version of *it is coming from
   somewhere else*. Reading two is a coincidence. Reading six is the
   story, and the player does the reading.
3. **No land's wait may reference another land's wait.** Nobody has
   compared notes, because nobody can. The only object in the world that
   holds more than one land's answer at a time is the **player**, and the
   only surface that shows it is the **map**.

**The Act II hinge, already built:** the fourth name on the Common's
signpost. It has been on the sheet since Session 1 as a place-name that
is not a place. The moment a player has been to the Cubicle Mile and
seen the timetable, the signpost re-reads by itself, with no code, no
trigger and no line of text — because **8:15** was always a departure
board and not a destination. That is the cheapest and best beat in the
game and it costs nothing because it is already there.

---

## 3. ACT III — *The line.*

*This act is one realisation and it has no dialogue in it anywhere.*

### 3.1 What actually happens

You reach THE CUBICLE MILE. There is a stop, a timetable, and **no
track**. Then the thing you have been walking on for fifteen hours:
the king's road leaves Greyweather's gate, comes down through Brim,
crosses the Common, runs up Maple Court as **main street** and ends, as
the **commuter spur**, in a car park. Twelve names, one road. It was
surveyed as a railway and built as a road by people who were waiting
for it to become the other thing.

Session 6 already put the body under this. The three roads of the line
carry **1.0** — the hardest in the world, and the proof
(`tools/check-terrain.mjs`) now asserts it so no later session can
quietly flatten it. A player who has walked the line has been *pulled
along it* for fifteen hours without being told why. **Do not squander
that by having somebody say it.**

### 3.2 Where a person stands — and the honest version of it

The brief for this session asked where a player can stand to see the
whole line at once. **They cannot, and that is better.** The numbers:

- the line is **480 units** end to end (the castle gate at z −218, the
  road head at z +262);
- the camera **only ever looks north** (QUALITY-BAR, and it decides
  layout), so the only leg that can be seen along is the north–south
  one — the east–west legs through Maple Court and the city are
  crossings, not vistas;
- height buys distance, and the highest walkable ground on the line's
  own axis is the **south curl** at (−45, 278), y = **7.3**. That opens
  the haze to **201 units**.

So from the best seat in the world you see two hundred units of dead
straight road running away from you into the haze, three units below
your feet, with nothing standing on it. **You cannot see where it ends.
You can see that it does not stop.** A game that showed you the castle
from the car park would have answered the question; this one leaves it
open at exactly the distance a survey line disappears at.

**THE END OF THE SURVEY** *(new place, MAPLE COURT, to be built at
Session 11 — this is its authoring brief)*

| | |
|---|---|
| **where** | (−45, 262) to (−45, 278). The king's road's last authored point is z 262; the rim's crest is z 284. **The road stops sixteen units short of the edge of the world and no session has ever said why.** Now it has a reason: that is where the survey ran out |
| **sees** | north: the road, two hundred units of it, straight, empty, into haze. Behind you: sixteen units of unmade ground and then the page's curled rim, which is the edge of everything |
| **fires on** | standing there. Nothing else |
| **says** | nothing. **There is no note at the end of the survey.** It is the one place in the game important enough to leave unlettered |
| **DOES NOT SAY** | that it is a railway. That it is the same road as the castle's. That anything is coming |

**The authoring constraint this puts on Session 11, written down now
because later is too late:** the line's sightline from the rim is a
**protected corridor**. Nothing tall may stand within about eight units
of x = −45 anywhere between z = 120 and z = 278. Maple Court's houses,
trees, cars and hedges go beside main street and beside the corner, and
the road's own axis stays clear to the haze. Session 5 lost two rounds
to a boardwalk laid east–west; this is the same mistake, available one
more time, in the one composition that cannot afford it.

### 3.3 And then the map does the rest

The rim gives the player the **body** of the line. Only one surface in
this game holds the **whole** of it, and this session built it: the map
is the record (WORLD-SYSTEMS §6), it draws in two registers, and it only
records where you have actually been.

**The beat:** the map has drawn nine roads as nine identical hand-dashed
lines since Session 1. When the player holds the route — which means
they have *walked* the line, castle gate to car park, not read about
it — the map draws it as **one continuous inked line**, and leaves the
other eight as dashes.

| | |
|---|---|
| **fires on** | holding `route:the-line`, which is earned by walking all three of its roads. No dialogue, no note, no trigger volume |
| **says** | nothing. The map has no caption and gains none |
| **DOES NOT SAY** | that it is a railway; that it is one road; that anything changed. It is simply drawn differently the next time the player opens it, and the player is the one who notices |

That is Act III complete: **the road pulls, the rim shows, the map
records.** Three systems that already exist, one beat, no speech.

### 3.4 The two things Act III must never grow

- **A character who explains it.** Dennis knows the timetable by heart
  and would be embarrassed for you; he does not know what the road is,
  because knowing would require crossing. Nobody in this world can hold
  Act III's fact. Only the walker can, which is the point.
- **A cutscene.** Nothing takes the controls. If a session finds itself
  writing a camera move here it has taken the wrong turn.

---

## 4. ACT IV — *The 8:15.*

### 4.1 What starts it

**Knowledge, and nothing else** (QUESTS Tier 0: no hard locks). Two
things must be true, and both are things the player DID rather than
things they were given:

1. they hold **`route:the-line`** — they have walked it, all three roads,
   end to end;
2. they hold the answers to **enough** of the twelve waits. Not all
   twelve, and **the number is never shown anywhere** (QUESTS §7 — no
   count, no list, no percentage). Proposed: **seven**, and seven is an
   implementation constant, not a fact about the fiction.

Then the next time the world's clock passes **8:15 in the morning**, it
comes. The day cycle is forty minutes long; a player who is playing at
all will meet the next 8:15 within forty minutes of qualifying, and
never at a moment somebody chose for them.

### 4.2 What it does

It comes down the line from the north, from the gate, and **it stops
twelve times.**

That single decision fixes the hole in `STORY.md` §6's proposal, which
had everyone gathered on one platform in the office park — **which they
cannot be**, because nobody crosses a border and rule 1 of §8 is the
engine of the entire story. The train does not gather them. **The train
goes to them**, the whole length of the world, once, past everybody's
door, on the road they all live on.

| beat | where | sees | DOES NOT SAY |
|---|---|---|---|
| IV.1 | wherever the player is standing | the light goes first: it is a quarter past eight and the page is the shipped page, and then something is coming down the road | that anything is different |
| IV.2 | any of the twelve | it stops. The doors open. It waits about half a minute | anything. **There is no announcement.** A world organised around a timetable does not need one |
| IV.3 | each land in turn | **somebody gets on** — at every land whose wait the player answered. At the lands they did not, the platform is empty, the doors stand open the same half minute, and it goes on | that the difference is the player's doing |
| IV.4 | THE HARROW DOWNS | **JOAN HARROW is not on the platform.** She is in the field, working, because her harvest came in and she never needed a train | why. It is the only wait in the world that was ever answered, and she is the only person who does not have to leave to get what she was waiting for |
| IV.5 | anywhere | it goes on south and east, down the spur, and stops at the car park, which is where the line ends | anything |

**IV.3 is the ending, and it is the ending because it is a consequence
and not a choice.** You do not decide anything at the end of this game.
You spent fifteen hours deciding, one land at a time, and the train
reads back what you did. Nobody grades it, nothing counts it, and no
screen anywhere tells you how many platforms had somebody on them.

### 4.3 Where the turn lands

**On the train, in silence, if the player rides it.**

The 8:15 is a mount (WORLD-SYSTEMS §4) and it refuses everywhere the
line is not drawn — so it carries you along a road you have already
walked and puts you down at the far end of a world you have already
crossed. Ride it the whole way and you watch eleven other lands' people
get on, one century at a time, all of them having waited for something
that was coming from somewhere else, all of them now sitting in the same
carriage.

**Nobody says it. Nobody in the carriage says anything at all.** That
is `STORY.md` §5, made true rather than stated, and it is the only place
in the game where more than one land is in frame at once.

### 4.4 And the walker

The doors are open at whatever stop you are standing at. **Getting on is
allowed, and getting on is not an ending.** It is a mount: it is fast on
its own ground and refuses every other, and at the far end you step off
into the car park and the world is still there and you can still walk.

**You were always the thing that could leave. That is exactly why you
were never the thing they were waiting for.**

The 8:15 is the world's ending. It is not the walker's. Nothing takes
the controls, no credits roll, the save keeps saving, and the twelve
lands are twelve lands with the trains gone through them. A player who
wants a last image walks back to the crossroads where they woke up and
reads the signpost again, and **8:15** now means something, and there is
nobody there to tell them so.

### 4.5 What was rejected, and why — the record

`STORY.md` §6 flagged its own ending as a proposal and said the session
that maps the stories owns it. It is owned. Three changes:

| §6 said | settled as | why |
|---|---|---|
| everyone is on the platform in the office park | the train stops **twelve times** and goes to them | they cannot reach the office park. Rule 1 of §8 is the engine of the story and an ending that breaks it would retract the whole game in its last minute |
| "the last thing the player does is decide whether to get on" | **there is no final choice.** Whether anybody is on each platform is the consequence of fifteen hours | a binary at the end of a game with no fail states is a quiz. And the walker has never wanted anything — that is the design — so a choice framed around the walker's desire is a choice for a character who has none. The decisions were already made, twelve of them, slowly |
| (unstated) how the turn is delivered | **riding the train, in silence** | it is the only frame in the game that can hold two lands at once, and it needs no words at all |

**Kept exactly as proposed:** Joan Harrow is not on it. She is the
counterweight and the conscience and she stays put.

---

## 5. THE ENDING — settled

> **The 8:15 comes down the line, once, and stops twelve times. At every
> land whose wait you answered, somebody gets on. At the ones you did
> not, the doors stand open the same half minute and it goes on. Joan
> Harrow is in the field, because her harvest came in. Nothing is
> counted, nothing is announced, and nothing is explained. You may ride
> it, and riding it is not an ending — it is a mount, and it refuses
> everywhere the line is not drawn. You keep walking, because that was
> always the only thing about you that mattered.**

Binding from here, the way `STORY.md` is binding. A later session may
build it; no session may re-open it without the owner.

---

## 6. What this act map costs, and when

| act | what has to exist | earliest session |
|---|---|---|
| I | Nell (a standee that straightens); the **co-walker**; the signpost's fourth name lettered legibly | inhabitants pass — I.1 is already on the sheet |
| II | the twelve waits, one per land session | now (Brim shipped this session) |
| III | the road head at the south rim, kept clear; the map's inked line | the map's line **this session**; the rim with Maple Court, Session 11 |
| IV | the 8:15 itself: one drawing, one route, twelve stops | Session 11, with the office park |

Everything in Act III's map beat is built and shipped in Session 7. Act
I's beats I.1, I.4, I.5 and I.6 stand on the sheet today. **Nothing in
this file needs a system class that is not already designed**, which was
true of `STORY.md` and stays true here.
