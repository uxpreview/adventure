# THE FUN PASS — the owner's brief, 2026-09-01

*Owner direction after Session 14 merged, recorded in one place so no
session re-derives it. This file is binding the way `STORY.md` is. It
amends five laws (§2), sets a new bar for every land (§3), re-keys the
story's four categories by tone (§4), adds a cast (§10), proposes an
opening (§11), and re-cuts the ladder (§14). `PLAN.md` carries the
ladder; this is the reasoning.*

*The one-line version: **the game was built to be read. It has to be
built to be played.** The spine survives that. Several of the laws
around it do not, and they are amended below with the owner's words.*

---

## 0. WHAT THE OWNER SAID

Recorded close to verbatim, because the project's habit is to write the
owner's reasoning into the law rather than paraphrase it.

**On the state of the world:**

> *"I'd like to continue to build out the world — making it more
> diverse, alive, and immersive. There are a few areas that are good
> (the forest place) but others fall flat."*

> *"The parts between sections feel empty."*

> *"It almost feels like a chore going from one place to another."*

> *"I read things but that's not fun. I wish I had choices like Fallout,
> and those choices did things."*

> *"The starting point is bland and expected but also confuses users
> because they don't know where to go or what to do."*

> *"There needs to be more regions and activity to fill the gap."*

> *"Think of aliens, Vikings, UX designers, surfers, baristas, monsters,
> other types of animals, etc."*

> *"More interaction and motion."*

> *"The story is ambiguous and light but I don't think we focus on the
> right now."*

**On tone:**

> *"The inspiration games are a mix of types all in the same game —
> serious, emotional, funny, frightening, etc. We need to think about it
> with this lens."*

> *"Think of Saints Row or Goat Simulator too."*

**Decisions, same day:**

- The five law amendments in §2: **confirmed.**
- The new cast in §10: **keep all of it.**
- The opening: the three options first proposed were not enough. *"Think
  of other ideas. Look at how other leading games start."* §11 does.
- Sequencing: **the fun pass comes first, the story rewrite comes after
  it**, on top of what turns out to be fun.

---

## 1. THE DIAGNOSIS

**Why the Penwood works and most lands do not.** The Penwood is the
only land with tension. A man is afraid of something, the ground obeys
his fear (every pine leans away from the water), a goat runs from you,
the ambient sound stops near him, and there is a black pool you are not
supposed to go near. You feel something before you understand anything.

Most other lands are exquisite arrangements. Someone is in a pose, an
object is placed with meaning, and nothing happens until you bring the
right fact back. That is a museum with a good curator. It rewards
reading, not being there.

**Three laws were quietly producing the flatness**, and all three
overreached the way the count law did (`QUESTS.md` §7.1):

| law | what it was for | what it did |
|---|---|---|
| *nothing is urgent, there is no villain* | no combat, no timers, no fail states | read as "nothing is at stake and nothing threatens." The game had zero fear in it |
| *the verb is looking* | knowledge as progression | the walker could not touch, push, carry, ring, sit or throw. Goat Simulator is on the list and the only thing you can mess with is where you stand |
| *at least one responsive motion per land* | a floor | a ceiling. A world feels alive in proportion to how much of it notices you |

**And one structural fact:** all twelve waits are in the same emotional
key. Quiet loss, withheld, wry. The four Calvino categories differ in
subject but not in feel. §4 fixes that.

**And one geometric fact:** the sheet is 760 × 560 and fully tiled by
twelve rects. Each land is roughly the footprint of a small town and
holds four to seven places. That is why the walks feel empty. More
sheet is still parked; the fix is inside the rects (§7).

---

## 2. THE FIVE AMENDMENTS — owner confirmed, 2026-09-01

Each one names the old law, the amendment, and where it is executed.
The project's rule is that an amendment is written into the law file
with the owner's reasoning, not split quietly.

### 2.1 The verbs

**Was:** *the verb is looking.* (`WORLD-SYSTEMS` §0, §6)

**Is:** looking stays primary and knowledge stays the inventory. The
walker also gets **touch, carry, sit and throw** (§5). One context key.
No inventory screen: the walker holds at most one thing, visibly, in
their hands.

**Executed in:** `WORLD-SYSTEMS.md` §6, `design/specs/controls.md`,
Session 15.

### 2.2 The choice card

**Was:** *no dialogue trees.* (`QUESTS.md` §0, `INSPIRATION.md`)

**Is:** still no faces, no talking heads, no dialogue wheel. But a
**choice card** is allowed: a hand-lettered prompt with two or three
options, at a moment that matters, whose options do different things to
the world. That is the whole Fallout mechanism without the wheel. The
card is drawn in the house voice and it is rare (§6).

**Executed in:** `QUESTS.md` §3 and §4, `src/ui/`, Session 15.

### 2.3 Threat without a villain

**Was:** *nothing is urgent. There is no villain.* (`STORY.md` §8
rule 4)

**Is:** still no villain, no combat, no fail state, no timer. **Local
stakes are allowed**: weather, the dark, water, a bull in a field, a
thing on a beach that chases you off it, a sound in a wood that stops.
Fear is a sound, a distance, and a thing that moved while you were not
looking. It never kills you and it never needs an enemy.

**Executed in:** `STORY.md` §8 rule 4 (annotated), `QUALITY-BAR.md`
§3, Sessions 17 and 19.

### 2.4 Districts

**Was:** *twelve lands; expanding the sheet is parked.*

**Is:** the sheet stays 760 × 560 and twelve rects stay the shared truth
of terrain, map and audio. **Every land is subdivided into two to four
DISTRICTS**, each with its own name, its own card, and its own reason to
exist, so that crossing a land is three arrivals instead of one (§7).
More regions, no more sheet.

**Executed in:** `layout.ts` (districts as a sub-rect layer under the
twelve), the region card, the map, Session 18.

### 2.5 Telling the player things

**Was:** *the world never explains itself* and *nobody says the turn.*
(`STORY.md` §8 rules 2 and 5)

**Is:** **kept absolutely for the turn and for the ending.** Relaxed
for everything else. A world where nothing tells you anything is a
world where you do not know where to go. People may point. Signs may
say what they are for. A note may contain an instruction when the
instruction is the joke or the invitation. The four ways a quest starts
(`QUESTS.md` §3) stay in their order; what changes is that the first
three are allowed to be LOUD.

**Executed in:** `STORY.md` §8 (annotated), `QUESTS.md` §3, every
session from 16.

### What is NOT amended, and stays absolute

- **The medium is the style, never the subject.** No content about the
  paper or the pen. Aliens, Vikings and baristas are all subject; the
  ballpoint is still craft.
- **Nobody crosses a border but the walker.** The engine of the story
  and the ending. Every new inhabitant in §10 is funnier and sadder
  because they cannot cross either.
- **The ending** (`THE-LINE.md` §5). Nothing counts the platforms.
- **Zero image assets, no faces, everything hand-lettered.**
- **A number may record where the player has been and may never grade
  what they did.**

---

## 3. THE BAR FOR A PLAYABLE LAND

`QUALITY-BAR.md` §4 says what a land has to LOOK like. This is what it
has to PLAY like, and from Session 15 a land is not done without all
seven. It sits beside THE SHOT, not instead of it.

1. **A creature.** At least one animal that is of this land and reacts
   to the walker.
2. **An absurdity.** One thing in the land that is ridiculous and played
   completely straight.
3. **A toy.** One LOCAL RULE (`QUESTS.md` §8, ratified below): a place
   where the world does something it does nowhere else, repeatable,
   with no score.
4. **A choice with two doors.** The land's wait has a second door with a
   real cost (§6), offered on a choice card at the moment it matters.
5. **Motion.** At least five idle motions and three that respond to the
   player. The old floor of one is the new minimum for a district.
6. **Districts.** Two to four, each named, each with a reason.
7. **Nothing empty for fifteen seconds.** On any road across the land,
   at a walk, something is in frame or in earshot at every point.

**And a tone.** Every land declares which of the four keys in §4 it is
in, and the contact sheet is judged for whether it lands in that key.

---

## 4. THE TONAL RE-KEY

`STORY.md` §2 sorts the twelve waits into four categories of three. The
categories keep their subjects and each one now OWNS A TONE, so that
fifteen hours of a game about waiting is four different kinds of hour.

| category | lands | tone | what that means on the ground |
|---|---|---|---|
| **WAITS & MEMORY** | Greyweather, Brim, Maple Court | **emotional** | return visits that pay off routine. Seeing someone at an hour nobody else sees them. Interiors, when they come, live here first |
| **WAITS & WEATHER** | Splitrock, the Flats, Longshore | **awe, the elemental** | these lands wait on indifferent forces and none of them ever acts. Rain, wind, fog, storm and tide arrive. First rain on the Flats with the lid off is a scene the game already earned |
| **WAITS & THE UNSEEN** | the Penwood, the Wide Blue, the Common | **frightening** | the deep pines at night when the pine-tick stops. The sea at the torn edge after dark. A light on the water that is not the mark. The tarn stays empty; that turn is good |
| **WAITS & WORK** | the Downs, Greyline, the Cubicle Mile | **funny** | the Vault-Tec voice lives here. Muster point signage for nobody. A barrier that raises for you because you are the only vehicle that has ever arrived. A city walking round one man |

The Downs stays the counterweight and is allowed to be the one land in
its category that is not a joke. Everything else in WORK is.

**The tiers keep their tones too** (`QUESTS.md` §2): the line is
melancholy, the waits are fables, the strangers are short stories with
a turn, the errands are warm, the encounters are texture, the unmarked
are funny, and the local rules are play.

---

## 5. THE VERBS

One context key (`E` on a keyboard, tap on a phone, the same key the
game already uses to look). What it does depends on what is in reach,
and the prompt says which, in the house voice.

| verb | what it is | what it needs |
|---|---|---|
| **look** | the existing prompt. Reads a place | nothing new |
| **touch** | ring, knock, push, lift, shout down, set. A one-shot on a thing in reach | a `touch` field on a standee or decal, and the world's answer |
| **carry** | pick up one thing, walk with it visibly in hand, put it down. Never more than one. No inventory | a carried-object slot on the walker, a drop rule, and the errands (`THE-STRANGERS.md` Part Two) finally buildable |
| **sit** | any bench, chair, wall, swing, kerb, or the toppled king. The camera does not move. Time passes. Routines go by | a `sit` field, a walker pose, and the fact that Joan's wait already resolves on it |
| **throw** | the one carried thing, underarm, a few units. Stones skim. The paper plane is this verb from height | a short arc, a landing, a sound |

**What the verbs are for, in order:**

- **Toys** (§3 item 3): skim a stone off the sandbar, shout down the
  well, ring the belfry early and watch the town react, ride the office
  chair down the mile, kick a ball on the green, push the wheelie bin
  into the junction, push the hay cart, sit on the toppled king, throw
  the plane, honk the 8:15, row into the fleet and scatter it.
- **Errands** (Tier 3): every one of the twenty needs carry or touch.
- **Choices** (§6): a choice is often a touch. Set the clock. Lift the
  lid. Put the king back.
- **Chaos** (Saints Row, Goat Simulator): the reactions are the reward.
  Gulls explode off a wall. Sheep scatter. A bin goes over and stays
  over. The world remembers what you knocked down.

**Refused, still:** an inventory, crafting, currency, a weapon, a health
bar, and anything you have to hold more than one of.

---

## 6. THE SECOND DOOR — choices that do things

Every wait currently has one door: do it or do not. That reads as
completion, not choice. **From here every wait has a second door with a
real cost**, the two doors are offered on a choice card at the moment
it matters, and the 8:15 reads back which door you took. There are no
right answers. Fallout's rule: every choice has a loser.

| land | door one (as designed) | door two | who loses |
|---|---|---|---|
| **GREYWEATHER** | bring Brim's red; a fifth banner goes up | **put the fallen king back on his plinth.** Wick is relieved of duty: the banners come down, the avenue goes quiet, the moat pool clears | Wick has nothing to do. His platform is empty at the end for a different reason |
| **BRIM** | learn which hand the lamps agree with; the bell rings it; the market opens | **set the clock yourself, to either hand.** Half the town's routines shift to your hour. The market opens either way, at a different time | one person in Brim is now permanently wrong, and it is Marget or it is the lamplighter |
| **MAPLE COURT** | bring the castle's name; the hedge is cut open | **turn Val's light off.** The street goes dark one house at a time over the following days | the street. Val was holding its line |
| **SPLITROCK** | row the river; Holt rights the boat | **tell Holt the sea has no bottom** (from S5). He stops oiling the boat and the marks weather | Holt, who was ready |
| **THE FLATS** | walk the fold; the lid comes off | **fill the cistern yourself from the oasis, once, in daylight.** Amos stops carrying. The track grows over | Amos, whose forty units were the point |
| **LONGSHORE** | bring the mark's name; an eighth pot | **haul the pots.** They are empty. Pye stops setting them | the shape of Pye's day |
| **THE PENWOOD** | go to the tarn; Brack turns | **take the tarn boat's one oar to Hallows.** His twelfth is finally right; the tarn boat has none | the boat on the water, and Brack, who now has a reason |
| **THE WIDE BLUE** | walk the bar; a second mark | **do not set it.** Or set it and watch the fleet finish, once, and stop racing | the fleet, either way |
| **THE COMMON** | bring the fourth name; the cart is loaded and turned north | **push the cart yourself, down any of the other three roads.** It stops at the border. Nell does not follow it | Nell, who had the option and now has a cart at a border |
| **THE DOWNS** | sit down; the second setting stays out | **clear the second setting away.** It is not laid again | you. It is the one choice with no loser but the player |
| **GREYLINE** | stand still; he sits | **walk past.** After the third pass the wear on the pavement gains one more lane, and it is yours | him |
| **THE CUBICLE MILE** | walk the line; the light comes on | **wipe the board clean yourself**, or leave the grime. **Board the train, or watch it go** | Dennis, if you wipe it: the one line he had learned is now one of twelve |

**Rules for a second door:**

- Both doors are visible before either is taken. A choice the player
  did not know they were making is not a choice.
- The cost is a visible, permanent change, the same as the reward.
- Nothing ever says which door was right. Rule 5 of `STORY.md` §8
  still holds for the turn; it holds for the doors too.
- **The ending reads the doors.** Which platforms have somebody on
  them, what is visible through the windows, and who is in the
  carriage, are consequences of doors and not of completion.

---

## 7. DISTRICTS — more regions, no more sheet

The twelve rects stay. Under them, a layer of **districts**: two to
four per land, each a named sub-rect with its own card, its own wash
tint (a shade of the land's), and its own reason.

A first cut, from the places that already exist:

| land | districts |
|---|---|
| THE COMMON | the crossroads · the river bend · the fair ground (new) · the well |
| BRIM | the square · the back streets · the orchard close · the wood gate |
| GREYWEATHER | the avenue · the bailey · the moat · the ridge |
| MAPLE COURT | the court · the green · the end of the survey |
| THE PENWOOD | the wood road · the round · the deep pines |
| SPLITROCK | the mouth · the floor · the east bench |
| THE DOWNS | the harrow · the mill rise · the drove · the ford |
| THE FLATS | the pale · the pan · the catch · where the road stops |
| LONGSHORE | the promenade · the huts · the cut · the point |
| THE WIDE BLUE | the shallows · the bar · the mark · the Holdfast |
| GREYLINE | the junction · the hollow · the north end · the yards (new) |
| THE CUBICLE MILE | the barrier · the atrium · the overflow · the car park |

**What a district is for:** it gives the region card three more chances
per land, it gives the map more to draw, it gives the seams (which
`QUALITY-BAR` §4 already calls art) a name, and it gives every one of
the §10 cast somewhere of their own to be. The Vikings are a district.
The surfers are a district. The design studio is a district.

**What it costs:** a `DISTRICTS` layer in `layout.ts`, a card that can
say a district's name under its land's, the map, and one audit of the
step zones. It does not touch the terrain, the score's twelve voices,
or a single protected framing.

---

## 8. THE ROADS — nothing empty for fifteen seconds

The owner's word was *chore*. Three fixes, and they stack.

1. **Encounters, built.** `THE-STRANGERS.md` Part Three lists
   twenty-eight and almost none exist in the source. Build them, and
   add the ambient life that needs no authoring: birds that lift,
   sheep that scatter, a dog that runs alongside, weather rolling
   through (§9).
2. **Midpoints.** Every walk between two places has a thing at the
   halfway mark: a bend, a bridge, a person, an animal, a sound. The
   bar already says this (*the walks earn their length with midpoints,
   or they shrink*). It has not been enforced. From Session 18 it is
   measured: a walk along any road at 4.1 units a second with nothing
   in frame or earshot for fifteen seconds fails.
3. **Mounts as fun, not just speed.** The **bicycle** (Maple Court: a
   bell you can ring, fast downhill, refuses sand and stairs). The
   **paper plane** (thrown off the tear or the rim; deferred four times
   and now Session 18's). The **horse** (the old world, gravity). And
   after the ending **the 8:15 runs every day at 8:15** and stops
   twelve times, which is in-fiction fast travel the whole world was
   waiting for.

**Also: the walk itself.** 4.1 units a second across a 480-unit line is
two minutes of holding a key. Roads carry, the run is taught, and that
is still a lot of straight road. Districts (§7) are the real fix, and
the owner's play gate (§13) decides whether the walk speed is too.

---

## 9. LIFE — the four multipliers

Systems that raise all twelve lands at once, in order of return.

1. **Unnamed inhabitants, with routines.** One named person per land is
   a diorama. No faces makes crowds cheap: shutters that open,
   a lamplighter four lamps behind, children on the green, a delivery
   that finds the stall shut, the whole field working. Five to twelve
   per land, none of them named, all of them somewhere at a given
   hour. The named cast stays exactly as it is.
2. **Animals.** The cheapest life per byte in any world. A fox and bats
   at night, seals on the sandbar, cows in the Downs with one bull that
   means it, a heron at the tarn, pigeons in Greyline that lift as one,
   crabs on the wrack, a cat on a wall that wakes if you run past,
   rooks at Greyweather and on the scarecrow in the Downs, and
   something under the Wide Blue that surfaces once at dusk.
3. **Weather.** Rain (the smudge pass runs the drawing, and it is
   nearly free), wind that actually turns the mill and fills the sails,
   fog that closes the vistas, a storm once in a while at night.
4. **Night as a different game.** Night is a colour grade today. It
   should be where the frightening content lives, where lit windows are
   navigation, and where certain people and animals only exist (Amos
   and Kay already do).

**And scheduled events.** RDR2's *a world with business of its own* is
on the take list and mostly absent. Things that happen on the clock
whether the walker is there or not: the regatta start at noon, the
drove moving at dawn, Greyline's rush at eight, the lamplighter's round
at dusk, the mill turning when the wind gets up, the surfers checking
the water at first light. The 8:15 is the only event in the game today
and it happens once.

**One free thematic layer:** birds cross borders and nobody looks up.
The rooks are at Greyweather and on the scarecrow in the Downs. Nothing
remarks on it. It is eerie or lovely depending on when you notice, and
it costs nothing. Recorded here so no session removes it as a bug.

---

## 10. THE NEW CAST — all kept

The world's central fact is already *twelve centuries on one landmass
and nobody finds it odd.* Every one of these fits, and every one is
funnier and sadder because they cannot cross either.

| who | where | tone | the bit, played straight |
|---|---|---|---|
| **THE VIKINGS** | the Holdfast, THE WIDE BLUE | threat, then comedy | a longship beached on the headland and a raiding party that has been waiting for a wind for four hundred years. Every day they row out to the mark and compete in the regatta, because it is the only thing to do. They roar at the shore. They cannot land on it |
| **THE ALIENS** | the Pale, THE BLEACH FLATS | frightening at night, absurd by day | something landed in the flattest ground in the world and burned ruled patterns into it. At night there are lights over the pan. The Flats' thesis is *the answer is elsewhere*, and this is the one land where something actually came from elsewhere, and it is stuck too |
| **THE SURFERS** | the Cut, LONGSHORE | comedy | board racks, a van, a wetsuit on a line, and a coast that only has a tide. They check the water at first light every day. The wait, played for laughs |
| **THE BARISTA** | the junction, GREYLINE CITY | comedy, then something else | a coffee cart, and a person calling out names for orders nobody collects. A second list of names in the world. The only person in the city who stands still on purpose |
| **THE DESIGN STUDIO** | the atrium, THE CUBICLE MILE | deadpan | a UX research sprint on the timetable. Sticky notes on the shelter glass. A persona pinned up called DENNIS. A journey map of a journey nobody has taken. Accurate, because the owner's field |
| **THE MONSTERS** | the deep pines at night; under the Wide Blue; the moat pool | frightening | never seen whole. The pine-tick stops. Something big surfaces once at dusk. The water goes red for two days. The tarn stays empty |
| **THE ANIMALS** | everywhere | life | §9 item 2 |

Each of these is a district (§7), has a toy (§3), and can carry an
errand, an encounter, or a stranger. None of them gets a wait; the
twelve waits stay twelve. **None of them explains anything.**

---

## 11. THE OPENING — how leading games start, and ten candidates

The owner: *"the starting point is bland and expected but also confuses
users because they don't know where to go or what to do."* And:
*"look at how other leading games start."* Eight patterns, from the
games that do it best.

| pattern | who does it | what it does |
|---|---|---|
| **A. The door opens on the world** | Breath of the Wild (the Shrine of Resurrection, then the plateau), Elden Ring (the graveyard, then Limgrave), Fallout 3 (the vault door), Skyrim (the cave out of Helgen) | enclosure first, then the vista as the first real frame. The world arrives all at once |
| **B. The teaching microcosm** | Breath of the Wild (the Great Plateau), The Witcher 3 (White Orchard), Fallout: New Vegas (Goodsprings), Outer Wilds (Timber Hearth) | one small complete place where every verb and every kind of content happens once, with a soft exit |
| **C. One visible goal** | Journey (the mountain), A Short Hike (the peak), Elden Ring (the Erdtree), Shadow of the Colossus | something on the horizon you can name from the first frame |
| **D. Something is already happening** | GTA V, Saints Row, Subnautica (the burning pod), Fallout 4 (the bombs) | motion or trouble in the first thirty seconds. The player reacts before they decide |
| **E. Arrival by transit** | Half-Life 2 (the train into City 17), Skyrim (the cart), Stardew Valley (the bus), Animal Crossing | you are delivered, and the ride shows the tone before you have control |
| **F. A person hands you a tiny first job** | A Short Hike, Stardew, Outer Wilds (the launch codes), New Vegas (Doc Mitchell), Untitled Goose Game (the list) | the first ten minutes have a named target and everything else is optional |
| **G. The clock imposes the first goal** | Minecraft (the first night), Don't Starve | the world, not a person, tells you what to do first |
| **H. Immediately physical** | Goat Simulator, Untitled Goose Game, every Mario | the first input is play, not a walk |

**What INKLANDS does today:** none of them. You wake in a meadow at a
signpost with four words on it. That is a puzzle, not an invitation,
and it is the exact failure the owner named.

### Ten candidates

| # | name | patterns | the first thirty seconds |
|---|---|---|---|
| 1 | **THE CART GETS AWAY** | D, F | the hay cart rolls downhill, a dog bolts after it, Nell shouts. You chase it north into Brim. Run, follow, cross a border, watch Nell stop dead at it |
| 2 | **THE FOUR LURES** | C | the castle on the ridge, smoke from the mill, the glint of the sea, the city's towers. All four in frame from the spawn. The signpost points at things you can already see |
| 3 | **WAKE IN THE CROWD** | B inverted | wake in Brim square on market-not-day, crowd everywhere, and walk out into the quiet |
| 4 | **THE WELL** | A | you climb out of the old well on the Common. Twelve seconds of stone and rope, then the meadow, then the castle dead north. The well that answers a shout becomes the door |
| 5 | **THE BULL** | D, H | you wake in long grass. A bull is already looking at you. You run (taught by necessity, in ten seconds), it chases, Nell holds the field gate and slams it, the bull stops at the fence. You are standing at the crossroads, breathing, with everything visible. Funny, and frightening for exactly ten seconds |
| 6 | **WASHED UP** | E inverted | you wake in the rowboat, drifting in on the tide at the river mouth. You come from the sea, the one place nobody in this world can go, which is why you can cross. Pye sees you first. **Changes Act I entirely**; the Common stops being the spawn |
| 7 | **THE 8:15 ARRIVES, ONCE, FOR YOU** | E | you arrive on a train at the car park at 8:15 and it leaves. **Rejected**: the train is the ending, and *the 8:15 is drawn nowhere on this sheet* is the premise. Recorded so nobody re-proposes it |
| 8 | **THE FIRST DUSK** | G | you wake late afternoon. The day goes. The first goal is a light: Val's porch to the south, Brim's lamps to the north. **Rejected as the first minute** (a dark first minute on a phone reads as broken, and the title holds a verdict at noon); kept as the second thing that happens |
| 9 | **THE GOAT** | H, then the rule | the Penwood's goat is on the Common. It follows you. It is the first co-walker, and it stops at the border. A joke first, the rule later |
| 10 | **THE COMMON AS THE PLATEAU** | B | not a beat, a structure: the Common holds one of everything. A thing to push, a thing to ring, a thing to sit on, an animal, one choice card, one stranger, and a border somebody will not cross. Everything the game does happens once in the first land |

### The recommendation

**5 + 2 + 10, with 1 as the first toy and 9 as the second co-walker.**

- **THE BULL** teaches the run and the fear in the first ten seconds
  and is the thing a player tells somebody about.
- **THE FOUR LURES** answer *where do I go* without a word: four roads,
  four things you can see, pick one.
- **THE COMMON AS THE PLATEAU** answers *what do I do*: everything,
  once, before the world opens.
- The cart is the first thing you can push. The goat is the second
  co-walker, so I.7's repetition arrives whichever way you leave.

**THE WELL** is the alternative first frame if the title poster's
verdict needs the meadow untouched: twelve seconds of enclosure, then
the same crossroads. **WASHED UP** is the bold alternative and it is
worth a real conversation, because it explains the walker and it moves
the spawn to the coast, and Act I would be rebuilt around Pye instead
of Nell. It is not recommended for the fun pass; it is recorded because
it is the best of the rejected ones.

---

## 12. THE STORY — parked, then rewritten on top

The owner: *"the story is ambiguous and light but I don't think we
focus on the right now."* Read as: the story is fine but subtle, and it
is not the priority. Agreed. The story is a spine for a game that is
not fun yet, and rewriting it before the world is fun means rewriting
it twice.

**So:** the fun pass first (Sessions 15 to 20), then the story rewrite
(Session 22) on top of what turns out to be fun, with the tonal re-key
(§4), the second doors (§6) feeding the ending, and the strangers
doubled. The four unbuilt waits (WICK, PYE, WREN, NELL) are built inside
the cast sessions with two doors from the start rather than one door
now and a second one later.

What stays absolute through the rewrite: the medium rule, the border
rule, and the ending.

---

## 13. THE PLAY GATE, and permission to regress

**A third owner's gate.** The ear gate asks whether it sounds good and
the feel gate asks whether it moves well. **The play gate asks whether
it is fun**, and no tool in this repository can run it. From Session 15
every session ships a **play sheet**: a ten-minute script for the owner
(*stand here, do this, then this*), with the build link, and the log
says plainly that the gate was handed over and not run.

**And permission to regress, written down.** The docs are extremely
good at protecting what is built. Every law has a check and a critic.
A fun pass will move protected framings on purpose: the Common's spawn
gets a bull and a cart, Brim's square gets a crowd, the Holdfast gets a
longship. **A session in the fun pass may move a protected framing when
the land inside it is the scope**, says which framing and by how much
(`diff-sheets` still reports), and re-earns the verdict on the new
frame. The rule that a framing may not move for a session's
CONVENIENCE stands. The rule that it may not move at all does not.

---

## 14. THE LADDER, RE-CUT

`PLAN.md` carries this. The ordering rule still governs: **systems that
change how a land is authored land before the lands are re-opened**,
which is why the verbs and the choice card go first.

| # | session | scope | ends with |
|---|---|---|---|
| **15** | **THE VERBS AND THE LAW** | touch, carry, sit, throw on one key; the choice card; a scheduled-event clock; the local-rule tier ratified; the five amendments executed in the law files; permission to regress written into `QUALITY-BAR`. Three proofs: a toy on the Common (the well, the cart), a choice card at the toppled king with both doors built, and one scheduled event (the drove at dawn) | the first play sheet |
| **16** | **THE FIRST HOUR** | the opening (§11: the bull, the four lures, the Common as the plateau); the co-walker as a rule of the world (`critique-story-2` MANDATORY 1); the goat as the second co-walker; the Common's districts; NELL's wait with two doors; the first minute re-shot and its verdict re-earned | play sheet; the story gate re-run on Act I |
| **17** | **LIFE** | unnamed inhabitants with routines in every land; the animals; weather (rain, wind, fog); night as a different game; scheduled events on the clock in every land | play sheet; `check-fields` extended to routines |
| **18** | **THE ROADS** | the twenty-eight encounters built; districts in all twelve lands; the fifteen-second rule measured; the bicycle and the paper plane; the 8:15 as daily transit after the ending | play sheet; a tool that walks every road and fails on silence |
| **19** | **THE NEW CAST, WEST AND NORTH** | the Vikings on the Holdfast; the surfers at the Cut; the monsters (the moat pool, under the Wide Blue, the deep pines at night); WICK, PYE and WREN's waits with two doors; toys in the old world and on the coast | play sheet; art gate on four re-opened lands |
| **20** | **THE NEW CAST, EAST AND SOUTH** | the aliens in the Pale; the barista at the junction; the design studio in the atrium; the office chair, the bin, the ball; second doors for the present-day lands | play sheet; art gate |
| **21** | **THE SECOND DOOR** | every remaining wait gets its second door; the 8:15 reads the doors back; the departure-permanence decision (owner's) executed either way | play sheet; the ending re-shot |
| **22** | **THE STORY, REWRITTEN** | on top of what is fun: the tonal re-key by category; strangers doubled; the errands as carry; the voice pass over every new note | the story gate, run to WOWED |
| **23** | **INTERIORS** | the roofless cutaway (`WORLD-SYSTEMS` §11), camera first; one per Memory land to start, then the studio, the van, the longship | art gate |
| **24** | **THE PLAY GATE AND THE JUROR** | the owner plays the whole thing; the Awwwards pass; the full gauntlet | the verdict |

**What moved:** the old Session 15 (the co-walker and four waits) is
split across 16, 19 and 20. The paper plane is in 18 and is not
deferred again. Motion & life is 17 and is bigger than it was. The
juror is last, where it wants a game whose first hour works.

**What did not move:** the ordering rule, the gates, the diff, the
build staying green, and the two owner's gates already owed (the ear
and the feel), which are still owed and still handed over each session.
