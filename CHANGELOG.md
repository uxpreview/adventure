# CHANGELOG

## Buildings are paper boxes (2026-09-23)

Follow-up to the entry below. Holding solid buildings on their line had
one cost: a house seen exactly along its face showed as a thin line. The
owner chose the real fix: give the buildings players walk round actual
sides, a back and a roof.

**What is boxed:** every Maple Court house (the court's twenty and
June's), Val's house, Marget's house, and the keep at Greyweather.
`regions/box.ts` (`boxUp`) takes the front the land already stood up and
builds the rest round it: a side wall from each drawn corner going back
`depth`, a back wall with the front's gable on it and no door, and two
sloped roof sheets laid from the front's own eave corners to its own
ridge (the keep gets a flat roof behind battlements, and a cone-capped
tower at each far corner). The walls are solid and fixed, so the
footprint you see from any bearing is the footprint that stops you.
`textures-box.ts` draws the new walls in the same pen, at the same pixels
per unit as each front, from a small description of where the front's
walls, eaves and ridge fall on its canvas. The court's houses are three
drawings, so their box textures are made once per kind.

**Paper inside the wash.** Every drawing is a wash at about 60%, so a
box of cards was a glass box, its far corners drawn through its front.
Each sheet of a box is backed on its inside by its own silhouette in
plain paper, drawn first and writing depth, so a house is solid to the
eye as well as the foot. The backing follows its sheet's opacity and
stops writing depth the moment the sheet fades, so a house between the
lens and the walker still clears (roof included: a roof fades as far as
its faintest wall), and a room's front still goes to pencil.

**Rooms.** A house with a room is the room's box: its side walls stand
on the room's walls, and `room.ts` fades the whole box with the front as
the walker goes in. Two fronts were narrower than their rooms, which
would have put a wall through the kitchen: **Val's house is redrawn
wider** (walls at canvas x 10–246, was 40–214; same standee size, same
windows, door and porch), and **Marget's standee is 9.75 wide, was 8.2**
(same height).

**Played on the harness.** `tools/check-solid.mjs` now also walks into a
court house's side and back (both stop you) and along the lane beside it
(still open), from two bearings: 29 of 29 with the gates and doors.
Walker checked visible behind a house with the lens south of it; Val's
kitchen checked from inside at two bearings. Contact sheets at Maple
Court (0°, 45°, 90°, 200°, 270°, and from 48° pitch), Val's, Marget's
and the keep. `check-roads` green. `check-sightline` reports four small
things (grass fields and a 2-unit prop); nothing boxed is among them.

**Not boxed** (still one card, held on its line): Brim's terraces, the
beach huts, the loft, Holt's house, Greyline's towers and the office
blocks. `boxUp` takes any of them with a spec. The keep's curtain
returns, drawn running off both edges of its front, still stand out past
the box as flat walls.

## Solid things hold still when the camera turns (2026-09-23)

Owner: "when the camera shifts, certain items rotate, which makes it very
hard to play." The items were every **solid** standee: town walls,
gatehouses, towers, houses, huts, the keep. Each one turned to face the
lens while its barrier stayed on the authored line, so after a drag a
wall broke into a staircase of cards, a gate's arch slid off the gap you
actually walk through, and a house was drawn somewhere other than where
it stopped you. Same bug as the meadow fence on 2026-09-17, everywhere
else.

Now a standee that is solid across its whole width (`solid: true`, or
`{ gap }` without a narrower `hw`) defaults to `face: 'fixed'`
(`regions/index.ts`, `standee`). Things with a narrow core (`solid: 1.2`:
wells, trunks, crates, the fountain, the mill) still turn, because a
round thing turned to the lens has not moved. An explicit `face` still
wins. A house's pencil ghost follows its house (`billboardLike` no longer
falls back to turning on its own). `npm run build` green; checked on the
harness at Brim's south gate at 0°, 35° and 70°. `check-camera.mjs` shows
the same 4 failures before and after (recentre and held-key spring-back,
not this change).

**Played on the harness** (`tools/check-solid.mjs`, new): Brim's south and
east gates and Greyweather's gate let you through, and the walls beside
them stop you, with the lens at 0°, 60°, −60° and 150°; Val's, Marget's
and the loft's doors still let you into their rooms. 23 of 23. Contact
sheets before and after at Brim, the keep, Maple Court, Greyline and
Longshore: walls read as one line and towers no longer swing across the
view. A house seen exactly along its face now shows as a thin line, like
the room walls always have.

## Tier 2 promises: Val, Brack, Holt (2026-09-19)

`PROMPT.md` §3 item 3, and round 6's two leftovers before it.
`npm run build` green; all three promises played end to end on the
desktop harness from the title; the gate's round 7 below.

### Round 6's two leftovers

**THE LIST, inside the first minute.** T1 was a 6 at sixty seconds
because the notebook opened at about 130. Played by hand on the harness
this session it opened at **two hundred**, and the reason was three
things at once: the "the list always comes" fallback was fifty seconds,
firing it was the same call as hearing Nell out — so the fallback marked
her heard out and took her conversation off the page before the walker
had got back round the hedge to her — and the notebook then waited on
two whole walks of Morrow's, neither of which he was seen on. Now:

- Nell's own line about the book is moved up out of the repeat-press
  pile into the conversation she has after the gate, and it names the
  twelve: *"You had twelve things written down when you went. Twelve
  people. It'll still be in that book under your coat."* **No new voice:
  one moved.**
- Morrow's walk is released after twenty seconds, not fifty, and
  releasing it is no longer the same call as hearing her out
  (`releaseMorrow` / `heardNellOut`). She keeps her mark and her
  conversation until the walker actually comes back. A talk waits.
- He asks from twenty-four units rather than sixteen, and the notebook
  does not wait on a second walk once the stage has run forty-five
  seconds.

Played end to end after the change: **the twelve are named at 81 s and
the list opens at 82.**

**Round 6's fixes, played by hand.** Brim Square → the king's road north
→ the chain → Wick, on foot, no teleports. The board at the mouth of the
road, the trodden way, THE CHAIN reading from forty units and the South
Gate arch all do their job; the promise starts at the chain without
meeting the man; Wick's ask-twice turn plays. Two things the same walk
found, both fixed:

- **A called horse gave up silently.** Left standing in a hedge or a
  gate's pier, every step at the whistle was refused and it stopped
  coming, with no message; H did nothing at all, twice. It steps
  sideways out of the thing first, either way round, and if it still
  cannot come it says so. A mount never fails silently.
- **A note card beat a person who was waving.** Nell stood at the field
  gate with the mark over her head and E read the gate's card. Somebody
  wearing the mark is nearer than they stand now (`bias`), so their talk
  prompt wins where they are.

### Tier 2 (`design/foundation/08` §9, promises 4 to 6)

Built the way Tier 1 is: `jobs/tier2.ts` hangs each promise on its own
line of THE LIST with `promise: true`, `tier2.ts` is what the three of
them say by the step of their promise, and `tier2-state.ts` is where the
lands and the promises meet, with no imports either way. The old steps
on those three lines are gone — Val's said to ride to the keep, Brack's
to stand at the water, Holt's to walk to the riverhead — and so are the
two cards that stood in for them.

**Every task here is a played verb.** You pick a pair of clippers out of
three years of grass and cut a gap in a hedge with them; you carry a
lantern the length of a wood road; you walk a man out of his own land.
Nothing in this tier is a wait.

**4. VAL. THE GAP IN THE HEDGE.** The clippers are in the grass at the
foot of her steps where they went down the week the hedge was planted
shut. THE TURN: the gap is not a view, it is a sightline, and a sightline
is two streets able to see each other argue. THE CHOICE, at the three
chairs, is not the cutting — the cutting is done with a pair of clippers
at the hedge — it is who takes the overflow now: the court, and her
porch light stays on; the green, and it goes off and the street follows,
a house a day. HER PART is June, who holds the far end and stays up a
road she has not walked in three years. THE REVEAL: from the cut gap,
down on the Common, the first faded footprints, going west.

**5. BRACK. THE LAKE.** He has watched the tarn for forty years and will
not go within forty paces of it. THE TURN is on the shingle at the north
end: the prints go down it into black water and none come out, and there
is nobody in the water. He waded across and went on through the wood in
the dark, and the wood gate's lantern is lying on the bank where he set
it down because he was not coming back for it. THE CHOICE: hang it on
its own bracket and light it, which is how the Penwood calls and is seen
from the Brim road, or keep it — a light of your own in the only land in
the world that has a dark. HIS PART is coming down to the last tree,
which is thirty-eight units and further than he has been in three years.

**6. HOLT. THE WATER.** He rigged the canyon a channel so it could spare
water for the feast; it was his alone, and when he went nobody knew
which board went where, and it dried. THE TURN: what the canyon needs is
the Flats, who have an oasis, and the two lands have not spoken since.
THE CHOICE: rig it yourself — it works this afternoon and nobody else
ever learns it — or walk him down there, which is an hour on foot.
**He stops dead at his own border like every companion in this world
(`company.ts`), and he is the first one anybody has ever asked twice.**
THE REVEAL is Amos's, said with Holt standing in front of him: *"I
offered, you know. That morning, at the bridge. Cans in the cart and
both hands free. You said you'd handle it."*

**THE THREAD** is the faded footprints. They are drawn on the Common
from the first minute of the game and nothing points at them; Val's gap
is cut on a line that looks straight down at them; they come out again
on Brack's shingle. One man, one night, two hundred and eighty units
apart. Nobody explains them.

**The unlocks ship small:** the clippers (kept, and one overgrown way in
the Penwood opens with them — and it is not the only way down, and
Brack's line says so), the lantern, and the boat off its trestles with
water under it.

**Direction lives in the world.** A board at the mouth of the canyon
road (SPLITROCK — THE CHANNEL, NORTH), a board where the Flats begin
(THE BLEACH FLATS — THE CATCH, SOUTH), and the wood gate itself is a
board: two posts and a bar with THE PENWOOD cut into it, with the
bracket on the west post.

### What the playing found, and what it changed

- **An offer is made in its person's own conversation.** A job can be
  given by a place now, and Val offered to fetch June at a hedge two
  hundred units from her, to a walker who had not met her. Offers wait
  for the talk — and are not made at all when the part they offer is
  already done (`JobSpec.offer.while`).
- **A place with a note AND a touch read its note and did nothing
  else** (`App.act` takes the note first and returns), so LOOK IN THE
  WATER and SET THE BOARD opened cards about the shingle and the slot.
  The note waits for the verb.
- **A person inside four units wins every prompt there is**, because a
  talk place leans to within a third of a stride of the walker's feet.
  Nothing interactable may stand within `4 + its own radius` of anybody:
  the clippers could not be picked up, twice.
- **`things.consume` was undone every morning**, so a lantern hung on a
  bracket for good was back on the shingle at first light (`forGood`).
- **Val was out of doors three and a half hours a day.** A line of the
  twelve that says ASK VAL needs her on her step while it is open; she
  takes her own two hours back once the hedge is settled.
- The head of Holt's channel was a filled panel standing against a cliff
  and read as a crate. It is the cut itself now: a dark slot, two
  grooves, a sill, the spoil that came out of it, and the tide line
  where the water used to stand.

### The gate, round 7

One cold player from the title on the desktop rig, then the FIRST HOUR
critic on the strip, blind, against *A Short Hike*. Reports in
`design/reset/rounds/round-7/`.

| | |
|---|---|
| **T1** | **7/10 at sixty seconds — holds.** (Round 6: 6.) *"I'd have said: I'm someone who walked out of this place three years ago and came back with no memory; I have a notebook and I'm meant to walk twelve lands and put right the things I left undone."* What they still did not have at sixty was whether twelve meant places, chores or people; that landed at 92. |
| **T2** | **Holds.** Two sentences, and four things they wanted to do next when three were asked for. |
| **T3** | **0 of 1. VERDICT: REFERENCE.** |

**And a Tier 2 promise was kept cold, first time out.** They found Val,
took I'LL HANDLE IT over asking June, found the clippers in the grass,
cut the gap, sat in the chairs and gave the overflow to the green
knowing it puts her light out, and told her to her face. *"Cutting the
hedge left a visible gap in the geometry. I could see the thing I'd done
from twenty paces away. That is the single best piece of feedback in the
game."* Their best moment was not ours: they crossed Marget out of the
notebook on a whim and, six game-minutes later on a beach, got
*SOMEWHERE, MORROW WRITES MARGET INTO HIS OWN LIST.*

Scores: understandable 8, alive 8, fun 7, beautiful 9.

**Fixed after round 7**, the three both of them named first:

- **The name card took keys that were not meant for it.** Three E-presses
  meant for Nell's dialogue landed in the field and named the walker
  "eeeWren" for the whole game, and there was no way back. The field is
  *disabled* until it is ready, so the key that was down goes nowhere;
  the act key is not a letter here for a second and a half after that,
  because the card opens on the last press of a conversation and a
  player still tapping E is the whole failure; and there is now **RUB IT
  OUT** beside THAT'LL DO. Three strays produce one character instead of
  three, and one press clears it. (Backspace could not be tested through
  the harness, which had no key for it until this session added one.)
- **Three lines drawn on top of one another at the foot of the page.**
  Two answer buttons, a DONE toast and a control hint, all unreadable
  (the critic: *"frame 012 smears four toasts and a two-option choice
  into one illegible pile; 022 does it again"*). ONE VOICE AT A TIME now
  counts answers as a card: while somebody is waiting to be answered,
  the answer line and the control line hold their tongues.
- **A prompt that said LEAN and read a card.** LEAN ON THE GATE WITH HER
  gave the gate's description three times; the cold player wrote it down
  as the thing they wanted most and could not have — *"the only prompt
  in the game that isn't a task, it's just standing next to someone"*.
  It leans. The card is what you notice while you are leaning, so it is
  not offered until you have.

And three smaller ones the same two found:

- **The walker read the HUD out loud.** A near miss used to say *"Closer,
  and it says GET ON THE HORSE."* Nobody in this world talks about the
  screen: he names the thing.
- **Two toasts for one act, contradicting each other**: YOURS: THE
  CLIPPERS and then THE CLIPPERS — GONE. A thing put where it belongs
  for good says nothing; the act that consumed it has already spoken.
- **"a hundred and eighty units of common"** in the three chairs' card.
  Units is a game term wearing a costume. (The older notes that say it
  are left alone; that is a pass of its own.)

**And one thing the portrait pass found**: a man who cannot pass a broken
thing, standing at a hedge with clippers in his hand, was refused the cut
because he had not gone back across the court to ask permission first.
He cuts. The first step takes the cut as its answer.

**Named and not fixed**, both pillar-sized and both written into
`PROMPT.md` §3: nothing in the world points at a named place (*"I
navigated by reading x/z off the status line, which a real player can't
do"*, and forty game-seconds pressed against one invisible fence), and
near-camera drawings are still grey slabs across the whole frame.

## A talk waits for you (2026-09-18)

The owner, by hand: "There's something to be said for the player
clicking the dialog to continue, so they have time to fully read what
they are saying. The same thing for choosing to interact and have a
conversation with someone. [...] I was heading north and I saw a chat
bubble in the corner of my screen but wasn't sure where it was coming
from but the conversation continued and I was completely lost on what
this new objective was. Think of how this is handled in all other
games." `npm run build` green; played on the harness, desktop and the
portrait rig, from the title through the list; not yet played cold.

**Two kinds of talk, the way other games have them.** A BARK
(`say()`): one short line over a head, on a timer; colour, a call
across a green, RUN. A CONVERSATION (`ui/converse.ts`): the player
starts it, the walker stops, and the lines come one at a time in one
panel at the foot of the page under the speaker's name, each waiting
for a press (E, Space, Enter, a click, a tap on the panel or anywhere
on the page). A mark in the corner says more to come or that is all.
Answers on the last line have no clock. **The rule: anything that
hands over a job, a name or a choice is a conversation; a bark is
never the only copy of anything the player has to know.**

**Somebody wants a word** (`speech.beckon`). A drawn "!" over a head,
seen from across a land; when the person is off the page it sits at
the edge they are past, so it is also the way to them. It comes down
when they have been heard out.

**TALK is a conversation** (`npc.talk`). One talk walks a stranger all
the way to what they want: the hello, the grumble, the ask, a press
each. It used to be three separate presses of timed bubbles, and the
job was given a press BEFORE the ask was heard. The job, its pin and
the objective now arrive when the last line has been read
(`npcs.onTalked`). Unnamed folk answer in the panel too. `NpcDef` has
`converse` (a person's own conversation for their state) and `barks`
(no time to stand and talk: one line over the head, as before).

**The bench waits.** Nell calls once ("Oh. You're back."), the mark
goes up, the objective reads NELL — GO AND TALK TO HER, and the
controls print because now there is somewhere to walk to. She calls
twice more, a while apart, then leaves it. Asked, she says the rest
("Do I know you?" is the walker's, from the story of record), the name
card comes when the last line has been read, and the bull after that.
While the bull is loose her TALK is a bark and nothing stops.

**After the gate, the same.** One line called over the gate and the
mark; "I was beginning to think..." and "Keep the horse" are a
conversation when he goes and asks, and Morrow's walk waits for it
(fifty seconds or sixty units away and it comes anyway: the list
always comes). Morrow only asks when he is in the frame. The notebook
no longer opens itself over whatever the player is doing: the walker
says it, the objective says N OPENS IT (TAP NOTEBOOK), and it opens
itself only after thirty seconds of being ignored.

**Whose bubble is that.** Every person's bark has their name lettered
small over the words. A speaker behind the lens is pinned to the side
of the page they are on, not top-centre. A bark from beyond earshot
(42 units) is not said at all, and `say()` tells the caller so: the
bell line falls back to the world's own line when Nell is a field
away.

**Offers** (`handle.offer`): `live: true` is the old shape (a bark and
answers on a clock: Nell's gate from the saddle, Morrow who does not
stop). The default is now a conversation with answers that wait; every
job's `offer` gets that.

**Tier 1, on the same rule** (merged after it was built on timed
bubbles). Wick's why ("Three years I've lit them...") and Marget's ask
("Pay it the other way...") are the next page of the talk, not a
seven-second bubble; "Tell Marget the castle's lit" is read; the chain
and the bell are offered as conversations with answers that wait, the
question over the answers; Hob's turn is not said at a man walking
past: he calls ("Here. A word."), wears the mark, and tells it when
asked. Nell's answer to the well carries across the green (`far`).

Named and not done: a monster does not wait for a conversation to end
(night, outdoors); the panel's words are written at once, not
letter by letter; `readBack` and the door reactions are still barks,
which is right for feedback, but they are the next place to look if a
cold player misses a consequence.
## Tier 1 promises: Wick, Nell, Marget (2026-09-17)

Branch `claude/tier-1-promises`. `PROMPT.md` §3 item 2, on the story of
record (`design/foundation/08` §9, promises 1 to 3). `npm run build`
green. Played on the harness from the title, desktop and `--rig
portrait`; what was checked on which is at the end.

### What changed

**The registry hangs on the twelve lines.** Every job in
`src/world/jobs/` carries the id of its line of THE LIST (`JobSpec.line`)
and the registry is kept in the list's order. Once the first page has
been read, the JOBS page heads a job with its line verbatim, in his
hand ("Marget. I owe her. Pay it."), and the steps under it are what
keeping it takes. Nell's job (the opening's) hangs on line 2 the same
way. Tier 1 is `jobs/tier1.ts`: a PROMISE is the job from the first word
its person says to him (or from a place that starts it: reading the
chain starts Wick's), and only doing it keeps it; an old card's door no
longer counts a Tier 1 land as kept. The other nine hang on their lines
with the steps they had until their tier's session. What the Tier 1
people say and do is `world/tier1.ts`; what the lands draw is
`regions/civic.ts`; the two meet in `world/tier1-state.ts`.

**1. WICK. The old road.** A chain across the king's road below the
avenue, bollard to bollard, with a board in his hand: ROAD CLOSED. IT IS
NOTHING. — W. Grass has come up through the road beyond it, and the
pilgrims come up as far as the chain, stand, and go back. Wick is at his
post by the west brazier all day now (he was only on the page for his
two banner rounds), and out in front of the fires from dusk to his
morning round. Ask him: "It's nothing." Ask again: be at the fires at
dusk. WAIT FOR DUSK at the braziers; he comes out under the gate, lights
west then east, stands out in front facing down the hill, "There. Lit."
"Now the bell." "...No. Well. Not tonight." THE TURN, asked: the fires
are not for the king; they are the castle's call to Brim, the bell was
to ring back, it never has, and he chained the road so nobody would see
him wait. THE CHOICE is a card taken at the man: OPEN THE ROAD, or LEAVE
IT CHAINED. CARRY HIS WORD YOURSELF. Open: he offers to walk down and
unhook it (YOU TAKE IT DOWN, WICK. / I'LL HANDLE IT: he sits down on the
mounting block for good and the chain is yours, E at the chain). The
chain lies in the road, the grass goes, the pilgrims climb to the gate
again, and the two fires show large from Brim and the Common after dark
(the castle to Brim, by sight). Chained: "Tell Marget the castle's lit",
and the job ends at her stall: "You, on foot. Same as ever." Either way
THE HALL opens: the keep has a door, a fire that is in, a settle to sit
at, a pallet (SLEEP TILL MORNING). If Marget's bell has been rung and he
has told you what the fires are for, he hears it: "That's the bell. At
an hour."

**2. NELL. The bull** is the opening, unchanged. Her turn ("I could
always pen him myself, you know. I stopped when you started.") is said
on either road now, not only after I'LL HANDLE IT. The Common's call is
the well: SHOUT DOWN THE WELL letters HELLO? over the walker, ". . .
hello?" comes up out of the well three seconds late, and once the bull
is home Nell answers it from her line ("I heard that. The whole Common
heard that. That's what it's for.").

**3. MARGET. The debt.** "You owe me for five stalls." Asked again he
turns his pockets out (half a sandwich) and she sets the price: get the
market called. WAIT in the belfry yard till the lamps come on (the
bench in the yard waits too); SAY WHICH HAND IS RIGHT is a card with two
doors, and somebody in Brim is wrong for good under either: EIGHT, and
Dorrie the baker keeps her cover on with AT ELEVEN chalked on it;
ELEVEN, and Fenn the lamplighter lights the square at four in the
afternoon. TELL MARGET THE HOUR: she offers to ring it (YOU RING IT,
MARGET: she walks down the king's road to the yard, rings it, walks
back; I'LL HANDLE IT: she sits down on a crate behind her stall for good
and the rope is yours). BONG. BONG. BONG. The covers that have been tied
over the five stalls for three years come off, the board is chalked,
and the bell rings at that hour every day after. YOURS: WAIT (T, or the
HUD's new button, passes the time anywhere). THE TURN is not hers to
say: a few seconds after, Hob, sweeping by her stall, says it. "She did
your rounds the week before, you know. The ones you couldn't get to.
Never said. That's the debt."

**Brim's bystanders** (round 4, item 3). Six people in the square have
names, drawings of their own and lines that turn on the bell: HOB (the
broom), DORRIE (the baker who keeps eleven), PELL (the cheese), BRYN
(blue cloth), CASS (twelve, a hoop), TOLLY (came for the gathering, has
not gone home). The lamplighter is FENN.

**One voice at a time.** A promise's bookkeeping (`promise:*`) is never
a YOU LEARNED toast. A touch that answers itself on the page (the well,
the rope, the chain) is not ticked back as a toast as well
(`WorldPOI.answers`). A promise kept in front of its person is theirs to
say and the world's shout stays quiet. The bell's strokes have the page
to themselves before what they change is said. Wick's dusk lines wait
for each other. A bubble is not carried along the top of the page after
a walker who has gone out of earshot.

**The two leftovers, and three things the play found.** Seated, the
prompt says STAND UP whatever is nearest (it read READ THE NOTE over a
key that stood him up). Nell and her washing line are 2.6 nearer the
bench: inside the portrait frame at rest, her bubbles over her and not
pinned to the edge (Morrow's path goes west of the line). On a phone the
answers to a person are lettered at the foot of the page, one over the
other, and the prompt lifts above them (they were across the rider).
The whistled horse wins the prompt over the note on the bench and the
stile it jumps beside. A foot sliding along the chain comes off its end.

**Harness.** Nothing new; `__inklands.setHour(h, true)` runs the clock
from `h` (without `true` it pins it, and a WAIT never ends).

### The gate, round 6 (2026-09-17/18, build `39fdf1e`, desktop, from the title)

One cold player, then one critic (THE FIRST HOUR), in sequence. Reports
in `design/reset/rounds/round-6/`.

**Before (round 5):** T1 9/10, T2 yes, critics 0 of 1.
**After (round 6):** **T1 6/10 at sixty seconds, 9/10 at 134** (when the
list opened): below the line at the minute, by one. It said: "I left
three years ago saying I'd be back in an hour, there are twelve things I
owe, and I'm to go round and put them right." **T2 holds:** "You wake on
a bench in a pencil-drawn world, three years late for a note you left
yourself, with a list of twelve people you owe things to, and you go
round putting each thing right with a horse, a notebook and a fence with
a sense of humour. Every job is small (get a bull home; settle a debt by
waiting for the lamps and ringing a bell) but each leaves the town
visibly different, and the writing on the little cards is the good kind
of dry." Three next: skim a stone at the tarn; find Wick and the closed
old road; stay out at night to see the monsters and try a door. Scores:
understandable 6, alive 8, fun 6, beautiful 9. **T3: THE FIRST HOUR —
VERDICT: REFERENCE** (0 of 1). The loop is not done.

It penned the bull at 41 seconds (Nell shut the gate), rode to Brim, and
kept **Marget's promise end to end with no help**: owed for five stalls,
waited in the yard, chose EIGHT, said I'LL HANDLE IT, rang the bell
itself, pressed T through the night, and came back to the market on.
Best moment: "finding the market actually on: bread on the trestles, a
cart rolling, the signs changed, Marget sitting down as promised, then
Hob's 'She did them. She'd kill me for saying.'" It never reached Wick:
it could not find the way north out of the square and left by the Wood
Gate. Worst moment: "sitting on a horse that would not move, in front of
a fence, with no message", twice; and it rode into Marget's house three
times. The critic: forty seconds that teach like A Short Hike, then a
horse that fails silently, a second job that is literally WAIT, a KEPT
counter that moved for arriving at the tarn, and direction that lives on
a map whose labels float off their pins.

### Fixed after round 6

**The horse.** Called, it does not come to rest on a fence's own line;
if it ever stands where a rider cannot ride, he mounts where he stands
and the horse is brought to him. It refuses rooms. A rider pushing at
something is told it is the horse that will not. **KEPT is one rule**
(`jobs.landKept`): the toast's count and the strikes on THE LIST agree.
**Direction in the world:** the king's road north out of Brim Square is
trodden dark to the North Gate with a board at its mouth (KING'S ROAD ·
NORTH GATE · GREYWEATHER) and a name over it; a board at the mouth of
the belfry yard; THE BELFRY's name reads from forty-four units. **A lamp
stands in the belfry yard**, lit with the square's first. The answers to
a person are under the walker's feet on desktop too. Letting somebody do
their part is written under CHOICES, quietly. On a phone WAIT sits by
the right thumb (the HUD's row was full).

**Named and not done:** the second job is a wait (it is 08's, and what it
unlocks is WAIT; the critic wants a played verb); the camera "turns as I
walk" in town (occlusion, not a recentre: the CAMERA pillar); map labels
off their pins; NIGHT. THE MONSTERS ARE OUT with no monster in Brim and
no door that answers; the skim board is at the tarn and the stone at the
fence; a pigeon does not flinch at a stone; place banner over a bubble;
HUD buttons faint over buildings; a NELL label pinned to one screen spot
during the chase. T1 at sixty seconds: the list still arrives at ~130.

### Checked, and on which rig

Desktop harness, from the title, no parameters. **Without teleports:**
bench, name, bull, horse, gate, over the stile, H, the horse jumps the
fence and wins the prompt, ride to Brim through the South Gate, Marget
twice, run to the yard; and after round 6, the square to the chain up
the king's road on foot, round the chain's end, Wick. **With teleports
between places:** both of Marget's doors and both answers to her offer,
Hob's turn, the covers, WAIT; Wick from the chain, both doors, all three
ends (he unhooks it; I take it down and he sits; chained, the word
carried to Marget), the hall; the well and Nell. The chain from north,
east, south and west. A click on the belfry rang the bell
(`App.thingUnder`, no extra code). **Portrait rig:** the bench's frame
with Nell in it, the answers at the foot of the page, Marget's two
talks, the chain, Wick's two talks and the turn, the road card, the
WAIT button. **Not checked:** Wick's I'LL HANDLE IT and the hall on the
portrait rig; the bell's daily ring and Wick hearing it; Fenn's
afternoon lamps, the pilgrims turning back at the chain and the fires
seen from Brim were read in the code, not watched; round 6's fixes have not been played cold; sound.

## One voice at a time (2026-09-17)

The owner, on a phone, five screenshots: "In the first 10 seconds of
playing, a ton of things pop up and it makes it really hard to
understand what to do and what's going on. I think this isn't just an
issue for mobile either." The bench's first three seconds were a land's
card, two FOUND lines lettered across it, an objective, two place
names, a prompt, the control line and Nell. The job's start said GET ON
THE HORSE four ways at once (Nell's bubble, NEW JOB, the step as a
toast, "E — GET ON THE HORSE" on a phone with no E), under a bubble
written over all of it. `npm run build` green; checked on the harness's
portrait rig from the title; not yet played cold.

**The answer line is one line** (`ui/toast.ts`). Three used to stack.
Now one is up and the rest wait their turn (four at most, a repeat is
dropped, a line gives way sooner when others wait), and the line holds
its tongue while a card, the map, the name card or a land's name has
the page (`holdToasts`). A job says one thing per event: NEW JOB; DONE
(a step); DONE and YOURS on one line. What is next is the objective
line's to say, and it already did.

**Nothing is written over anything.** A bubble on a phone stops under
the objective and the answer line instead of over them
(`speech.place`); a place's name is not lettered under a bubble
(`speechEls` into `POI.reserved`); the name card hides the prompt, the
names and the hint, and comes after Nell has finished asking, not over
her.

**The bench's minute is Nell's** (`opening.quiet`). The land's card has
the page for its three seconds, alone; then her three lines, one at a
time; then the name. No FOUND lines (`notebook.hush`; the places are
still written down), no place names, no objective. The controls come
after the name, when there is about to be a bull, on their own. Her job
line is half the length; the gate is hers to say when he is up and the
lens is on it.

## The owner's four, played by hand (2026-09-17)

Branch `claude/next-session-r4gate`. The owner's notes after playing:
cannot find the gate to get the bull through (the fence's position, a
camera that faces one way, and a fence that rotates when the camera is
moved); the note by the bench floats; it is not clear the words GET ON
THE HORSE are the button and the horse is not. `npm run build` green.
Checked on the harness from the title; not yet played cold.

**The hedge is one line with one gap.** It was five hedgerow cards
twelve units wide, each turning to the lens about its own middle: a fan
of blobs with a gap between every pair from any bearing, the gate's
frame drawn east-west across a hedge that runs north-south, a leaf
under three units wide in a six-unit gap. Now: round bushes shoulder to
shoulder on the barrier's own line (a round thing turned to the lens
has not moved), two capped gateposts taller than the hedge, a worn
track through the gap on the ground, and a five-bar leaf that is a
fixed plane: swung into the field while open, across the posts when
shut. (`regions/meadow.ts`, `textures-opening.ts`: `hedgeBushTexture`,
`gatePostTexture`, `gateLeafTexture`.)

**The long fence does not turn.** Its panels were `run` standees that
lean up to fifty degrees toward the lens, each about its own middle, so
an orbit opened a louvre of false gaps. They are fixed planes now, with
a post at every joint so the fence seen end-on is a row of posts. Only
the field's fence; every other `run` in the world is as it was.

**The lens turns to the gate, once.** At the press that puts him in the
saddle the look eases round to the field gate through the same capped
recentre R uses (`OpeningCtx.lookAt`, `Look.recentre`); a hand on the
lens cancels it; it never happens twice. The walk is relative to the
lens, so forward is the gate: on the harness, one held W from the
saddle penned the bull. This is the one exception to "never a turn the
player did not ask for", and it is the owner's.

**The note is tacked to the bench.** It stood 0.7 past the bench's end,
a unit up, on nothing. It is the bench's child now, on the east upright.

**A click on the thing is the key.** A click or tap that does not
travel, landing on the drawing the prompt is about, fires the same
press as the prompt (`App.thingUnder`). A drag is still a look.

## The three verbs the arc stands on (2026-09-17)

Branch `claude/next-session-r4gate`. `PROMPT.md` §3 item 1, on the story
of record (`design/foundation/08` §2, §8). `npm run build` green.

### What changed

**SIT is a held press.** E at a seat puts him on it and he will not
stay: down, half up, a look either way, a knee going, and a ballpoint
line drawing itself under the prompt (HOLD IT. STAY SAT.). Hold the key
through it (2.2 s; 4.4 s anywhere on the Downs) and he is sat, and the
day runs six times faster as before. Let go early and he is up again
where he stood, with a reason ("In a minute." / "Can't. Not yet." /
"There's things to do." / "I'll sit when it's done.") and the hint
"hold E to stay sat". Under a thumb the prompt is pressed, not
clicked, and held the same way. A seat that moves (the swing, the
office chair) is a toy and takes no effort. `knowledge 'end:sat-down'`
makes every seat free: the gathering sets it, later. Waking on the
bench and a card's SIT DOWN door are not presses and are unchanged.
(`App.trySit/tickSitTry`, `Character.fidget`, `Input.interactHeld`,
`UI.setHold`.)

**"I'LL HANDLE IT."** A person offers to do their part, and two
answers are lettered along the bottom of the page: theirs, and I'LL
HANDLE IT. 1 and 2 on the keys, or a thumb. Nothing stops while they
are up; unanswered, they expire into the person doing their part. It
always works, and it costs somebody something you can see; the notebook
keeps the count (`notebook.handled`) and hands it to the cost so it can
rise. CHOICES records each one with what it cost. (`world/handle.ts`,
`ui/replies.ts`; `JobSpec.offer` so every promise can hang one.)
Two are live, both inside the first five minutes:
- **Nell, the gate.** As you get on the horse: "Bring him in through
  this gate, well in. I'll shut it behind him." GO ON, THEN and she
  shuts it as before. I'LL HANDLE IT: "Course you will." She leaves the
  gate, sits down on her upturned basket by the line and stays sat
  (saved). The gate is yours: lead the bull past the posts, then E at
  the gate shuts it, from the saddle or off it (the horse's prompt
  yields to it there). "Not yet. He's not in." if he is not. Read back:
  "There. That's more like you." / "All of it, on your own. Same as
  ever." and, asked again, "I used to pen him myself, you know. I
  stopped when you started." (08 §9.2's turn.)
- **Morrow, the bridge.** "Did you fix the bridge?" NOT YET: "Didn't
  think so." I'LL HANDLE IT: "Already handled." He does not look
  round, and the dog does not stop for you.

**Crossing a line out.** On THE LIST, hold a line down and the pen
draws across it; let go early and it lifts. At the end it is struck
twice, pressed, and stays struck. The notebook does not object
(CROSSED OUT: BRACK. THE NOTEBOOK DOES NOT OBJECT.). Its pin comes off
the map if you have never stood there, the objective line stops naming
it, and nothing is locked: the person is where they were and the job
can still be done. Within twenty seconds the world says what it did:
SOMEWHERE, MORROW WRITES BRACK INTO HIS OWN LIST. The next time you
talk to that person they have heard, once, in their own words ("You
crossed the lake out. Sensible. I would."). Joan's line is already
crossed; a line whose job is done cannot be crossed again.
(`world/crossout.ts`, `thelist.ts` `crossed`, `ui/notebook.ts`.)

**Small.** Enter on the title is no longer a press in the world (it
said "Closer, and it says READ THE SIGNPOST." over the title). The
prompt under a thumb goes through the same path as the key, so STAND
UP under a thumb stands you up. `check-verbs` reload timeout reads
`RELOAD_TIMEOUT`; the check itself has not been touched since Session
23 (2026-09-06) and is stale against the reset and the rebuilt opening
(the walker wakes seated on the bench; it fails 112 clauses on this
build, from its first section on). Not a gate; rewrite or retire it.

**Harness.** `__inklands.replies()`, `.reply(i)`, `.handled()`,
`.crossed()`, `.crossOut(id)`, `.holdE(on)`, `.sitTry()`.
`node tools/play.mjs hold e 3` is a held E.

### The scripted play (desktop, from the title, no parameters)

At 36 s: on the horse, Nell's offer and the two answers. 2: "I'll handle
it.", YOU CHOSE: I'LL HANDLE IT — THE GATE, NELL SITS DOWN ON HER
BASKET. THE GATE IS YOURS. E at the gate with the bull outside: "Not
yet. He's not in." Rode in, galloped out, E from the saddle with the
bull six units inside: gate shut, 1 OF 12 KEPT, "All of it, on your
own. Same as ever." Morrow: the two answers, 2, MORROW DOES NOT LOOK
ROUND. THE DOG GOES WITH HIM. The list opened itself; Brack's row held
down: struck, toast, and the shout after. E tapped at the bench: "In a
minute.", hold E to stay sat. E held: fidget at 0.5, sat at 2.2 s,
STAND UP. No page errors.

### The gate, round 5 (2026-09-17, build `ec600b2`, desktop, from the title)

One cold player, then one critic (THE FIRST HOUR), in sequence. Reports
in `design/reset/rounds/round-5/`.

**Before (round 4):** T1 7/10, T2 yes, critics 0 of 6.
**After (round 5):** **T1 holds, 9/10** at sixty seconds ("lead the bull
through the field gate and shut it"; the large goal 4/10). **T2 holds**:
"It's a pencil-drawn little open world where you wake up on a park
bench three years after you said you'd be back in an hour, and
everyone's a bit short with you about it. The writing is dry and lovely
and the world notices what you do, but the first job, getting a bull
through a gate, had me going in circles for more than two minutes and I
never did shut the thing." Three next: press 1 and watch Nell shut the
gate; ride north through Brim's gate; follow the signpost's 8:15 arm.
Scores: understandable 5, alive 8, fun 4, beautiful 8. **T3: THE FIRST
HOUR — VERDICT: REFERENCE** (1 critic run; 0 of 1). The loop is not done.

The cold player chose I'LL HANDLE IT at thirty seconds and then spent
gameSec 44 to 189 failing to shut the gate: ten tries, "Not yet. He's
not in." under a "✓ SHUT THE GATE" toast every time, the bull glued to
it on foot and keeping pace with a gallop, HE IS IN and "Not with me
stood in it" in the same second. It never saw Morrow, the list, the
held sit or the cross-out. Best moment: the note, and Nell's next line
being about the note.

### Fixed after round 5

**The gate always works, if he does it.** "In" is the bull at the posts
or past them, not five units beyond; a walker stood in the gap is
stepped aside by the leaf instead of refused; the refusal says what is
missing ("Not yet. He's this side of it. Through the gate first, him
behind me.") and is no longer ticked as done (the gate's key is its own
`onInteract`, not a `touch`). Replayed the cold player's own way, on
foot with the bull alongside: shut on the first press.

**Fail forward.** Ask Nell twice with the gate still yours and she
offers again: "Shall I get the gate after all?" GO ON, NELL. YOU GET
IT: "There. That wasn't hard to say.", she gets up and stands in the
gate, and the pen is hers as before. Unanswered, nothing changes
(`Offer.unanswered`).

**The answers say what they are.** YOU SHUT IT, NELL. / I'LL HANDLE IT.
(I SHUT THE GATE MYSELF). An answer hushes the line it answers, so her
old bubble is not left up.

**A press is answered now.** A talk line replaces whatever the speaker
was in the middle of (`say(..., { now })`, `hush`): the first two E's on
Nell read as a dead key because her answer queued behind her timed
lines. "What do I call you?" is said now and Nell takes no other talk
until the name is given, so it cannot arrive after it. A stray E typed
into the name card in its first second is dropped.

**The bull keeps off.** After two knocks it has said what it had to
say and stands a stride and a half off, not on the walker.

**Round 4's first two, built.** THE SOUTH GATE: the passage is trodden
dark from well out on the Common to well in (`gatePassageDecal`), the
gate thins to half, not to 8%, its name reads from forty-six units, and
the wall nudge says LEFT / RIGHT / AHEAD / BEHIND by the screen, only
from fourteen units off the gate ("BRIM'S GATE IS RIGHT ALONG THE WALL,
UNDER ITS NAME"). THE MAP: labels are placed nearest-first, search
outward in rings for clear room with a pencil leader, stay inside the
frame, and one with no room goes without; THE COMMON / THE BENCH / THE
NOTE / THE FIELD GATE each read at the start.

**Named and not done:** hedges as see-through blobs with no drawn edge
(the PEN's occluders, again); world labels far from their owners and
over each other; the carter and the handcart man have no prompt; the
well answers a shout with a sound and nothing on screen; the large goal
is a guess until the list (the cold player never reached it); the map
button keeps its focus ring.

### Left for the tiers

Every promise hangs its own offer on `JobSpec.offer` (none of the old
eleven jobs has one). Joan's SIT DOWN card door still sits at once; the
held sit at her table is Tier 4's. The cost does not yet compound at
the gathering. The crossed-out hold is wall-clock (a page, not the
world), so the harness cannot show a short hold being refused.

## The first five minutes — the story of record (2026-09-16)

Branch `claude/game-storyline-concepts-i7imu0`, after PR #27 merged the
story. The opening is rebuilt on `design/foundation/08` §7; nothing else
in the game moved. `npm run build` green.

### What changed

**You wake on a bench.** `SPAWN` is the bench on the green (−26, 92),
south of Nell's gate so the gate, the washing and the bull are all in the
frame that looks north. The walker is put on the seat at SET OUT (a
step stands you up). A note is pinned to the bench's end: READ THE NOTE
is "back in an hour. — you", rained on; after the list it is the second
note under the first (YOU DON'T HAVE TO DO ALL TWELVE / YES, I DO).

**Nell at her washing line.** Moved from the gate to a line a few steps
west of it, in the bench's frame. Her opening lines come from
`opening.ts` by stage: "Oh. You're back." / "You said you'd only be gone
an hour." / "It's been three years." / "What do I call you? — You don't
know. Course you don't." Her registry lines (`lines.ts`) are the
after-lines: three years, the bull, Morrow's copy, Joan's two plates.

**The name.** The one thing in the game you type. A card with a text
field whose own letters are invisible; what you type is lettered in the
hand above it as you type. Enter or "that'll do". The name goes on the
notebook's cover ("Ryan's notebook"), Nell says it once, and it is saved
(`SaveData.name`, `NotebookSave.name`). Keys typed into the field are
never steps or interacts (`Input.typing`).

**The bull is loose, and it knows you.** `common.bull.loose`: its ground
is the whole green (the river bend refused), it grazes at (−34, 74) and
does not look up until the name is chosen (`hold`). Then it charges, and
loose and on foot it reaches you: the knock (`inklands:bull-knock`) rocks
the walker, takes the hat if there is one, and the walker says "Oof. It
knows me." (three lines, then it has said what it has to say). Loose, it
stands over you two seconds, goes once more, and backs off to watch for
six. Nell shouts RUN and whistles the horse to you.

**GET IT HOME.** Two steps: GET ON THE HORSE, LEAD THE BULL THROUGH THE
GATE. Mounted, the bull follows the horse three strides off and never
balks (`follow`, set by App before the land ticks, so the frame you mount
is a following frame). Ride through the gate and out again: when it is
east of the hedge line and you are west of it, Nell slams the gate
(`common.pen()`), the field is its ground again, the job completes,
"There. That's more like you." / "I was beginning to think you weren't
coming back." / "Keep the horse. You always did." The gate's gap is two
units either side now (a rider can thread it).

**Morrow goes past.** Fifteen, a copied notebook under his arm, the
dachshund behind him. From the coast road's end past the bench and the
gate and away down the king's road; "Did you fix the bridge?" at sixteen
units, and he does not stop. The dog stops when it notices you, sits and
looks, and goes after him. Drawn by the meadow (`morrowTexture`,
`dachshundTexture`), moved by the opening (`common.walkby`).

**THE LIST.** The notebook's first tab. "the first page is stuck to the
cover" until the walk-by; then the notebook opens itself to it: TWELVE
THINGS. THEN I CAN GO HOME and the twelve lines verbatim
(`src/world/thelist.ts`), a line struck when he crossed it out (Joan) or
when its land's job is done (Nell's, after the opening). Close it and
the twelve places are pinned, the bell rings the wrong hour, Nell says
Morrow rings it, and the objective line falls back to the nearest line
of the list ("THE LIST — VAL, THE THREE CHAIRS").

**Gone.** THE FOURTH NAME, the milestone as a job step, Nell's card at
the gate and its two doors, "THE 8:15 WILL STOP FOR n OF 12" (now "n OF
12 KEPT" on the JOBS page and as the toast). The milestone stays as a
place with a note.

**Harness.** `node tools/play.mjs type TEXT` types into a field.
`window.__inklands.opening.stage` for the stage.

### The scripted play (desktop, from the title, no parameters)

At 3.5 s: the bench, STAND UP, "Oh. You're back." At 14.5: the name
card. At 20: RUN and "hold shift to run"; the bull crosses the frame.
At 24: "Oof. It knows me.", NEW JOB: GET IT HOME. At 27: on the horse.
At 33: through the gate with the bull three strides behind. At 38: the
gate shut, YOURS: THE HORSE, "There. That's more like you." At 48:
"Keep the horse." At 62: Morrow and the dog on the green. At 84: the
list. At 88: twelve pins, the bell, "THE LIST — VAL, THE THREE CHAIRS".
No page errors.

### What the cold player said (round 3, `design/reset/rounds/round-3/REPORT.md`)

Played cold from the title with no source, to game-second 183. T1 held:
at sixty seconds it could say what the game wanted (confidence 8/10).
Scores: understandable 5, alive 8, fun 6, beautiful 9. Its one sentence
to a friend: "a quiet hand-drawn walking game where you come back to a
village three years late with no memory, a notebook and a list of twelve
small favours you owe people, one per land, and you go round doing them
in any order". Best moment: the stuck first page coming loose into
TWELVE THINGS, and "Oof. It knows me." Worst: seventy seconds riding
the same fifteen metres of fence not knowing which gap was the gate or
which side was home, while Nell's talk prompt stole the horse's.

### Fixed after round 3

**Nell gets out of the horse's way.** `npcs.mute(id, on)` takes a
person's talk prompt off the page. Nell is muted from the whistle until
you are on the horse, so GET ON THE HORSE is the only prompt near it.

**Nell stands at the gate.** At the whistle she walks from the washing
line to the gate post (`common.nellAtGate`), so "this gate" is the one
she is standing at, and THE FIELD GATE's label reads from thirty units.
Her lines say which side: "Bring it in through this gate, and I'll shut
it behind it." / "In through the gate, well in. I'll do the rest."

**The pen rule.** The gate shuts when the bull is five units inside the
hedge line and not in the gap, whichever side you are on. If you are
still inside with it, she says the stile is on the long fence, north.

**The name card** clears itself and takes focus a quarter-second after
it opens, so the E that opened it is not the first letter of your name.

Replayed on the harness: the same beats at the same seconds, the gate
shut at 33, no page errors.

### Played by hand (2026-09-16, desktop, from the title, no parameters)

Played in a real browser with a GPU rather than the harness. The opening
holds end to end: bench, Nell's four lines, the name card, the knock,
the horse, the gate shut at the second try, "1 OF 12 KEPT", the list
opening itself, twelve pins, the objective falling back to Val. Found:

- **The list's strikes were off the page.** `strike()` appends an
  absolute canvas to a static host, so on THE LIST the ink line was
  measured against the page and drew nowhere near the row (JOBS was
  fine because `.nb-jobhead` is relative). The host is now made
  relative when it is static. Nell's and Joan's lines are struck.
- **Thirty seconds of fence, again.** With the bull following, the gap
  was found on the third pass; the first two rode along the hedge
  past Nell, and the walker ended up shut inside the field with the
  bull, and the stile line was painted over by Nell's next line.
  **Fixed:** the gate's gap is three units either side (the drawn
  frame's width); riding the hedge mounted for more than two seconds
  prints THE GAP IS WHERE NELL STANDS; the stile line is Nell's last
  and holds; the shut-gate nudge covers the whole field, not five
  units of it. On the harness the pen now lands on the first pass.
- **Morrow was missed.** The walk-by ran while the walker was inside
  the field facing the fence; the notebook opened itself to the list
  mid-ride with no sign of him or the dog. **Fixed:** the walk waits
  until the walker is out of the field and within fifty units of the
  bench with the notebook shut, and if he gets to the end of the road
  unseen he goes past once more. The list opens after that.
- Small, not fixed: WHOA and THE FIELD GATE letter over each other at
  the gate; the toasts stack over the horse; on a 674-pixel-tall
  window lines 11 and 12 of the list are below the fold with no sign
  the page scrolls. (The bull knocking a sitting walker stands them
  up, and "Right. The horse." is the third knock's line, not an answer
  to E; both are as designed.)

### After — the gate, round 4 (2026-09-16, desktop, from the title, no parameters)

Reports in `design/reset/rounds/round-4/`. The cold player played to
game-second 368 (its command budget), in-game 9:00 to 20:23.

**T1 holds:** at sixty seconds it could say what the game wants
(confidence 7/10): "walk the twelve lands on the map and put right the
small things I left undone — twelve of them, one per land, each kept
in a notebook." Scores: understandable 6, alive 8, fun 7, beautiful 9.

**T2 holds.** To a friend: "It's a hand-drawn, one-sheet walking game
where you come back to a village after three years and everyone's
slightly hurt about it, and you go land by land putting right the
little things you left undone — a gate, a clock — by leaning on
things, waiting, and reading the notes. Nothing attacks you except a
bull that remembers you, and the writing on every card is dry and
kind." Next time: wait for the bell and tell Marget which hand; get
the horse over the fence and ride to the third land; find whoever
said "I was beginning to think you weren't coming back."

**T3 fails, 0 of 6:**

| pillar | verdict |
|---|---|
| THE CAMERA | REFERENCE |
| THE VOICE OF THE WORLD | REFERENCE |
| THE FIRST HOUR | REFERENCE |
| SCALE AND MOTION | REFERENCE |
| THINGS TO DO | REFERENCE |
| THE PEN | REFERENCE |

What they name most: the South Gate arch is drawn as faint as its wall
and the player walked under it twice (3 critics); the whistled horse
stood on the far side of the long fence (3); the map's labels pile
into one smudge (2); E on TALK TO NELL did nothing twice at the start
(2); the controls line arrives after the name box (2); the square's
bystanders have no names and no lines (2); the moving figure is drawn
without legs (PEN); the hedge wash overprints Nell, the gate and the
bull (PEN). And one the critics could not see: **the cold player never
got THE LIST** — it left the green before Morrow's walk, and the
walk-by wait added this session waited for ever.

### Fixed after round 4

- **The list always comes.** Morrow waits at most thirty seconds for
  the walker to be on the green; he does not go past a second time
  for a walker who has left it altogether. A walker in Brim gets the
  list about a minute after the pen.
- **A called horse jumps a fence.** Whistled, it refuses only what
  the terrain refuses; ridden, it refuses what a walker does.
- **E at the bench is answered.** Nell's TALK lines while you are on
  the bench are lines her timers do not say ("Don't look at me like
  that." / "Three years, and you just stand there." / "Well. Go on.").
- **The controls line prints at the bench**, two seconds after "Oh.
  You're back.", not after the name.

Left for the next session, in order of how many named them: the South
Gate arch (and the wall hint's timing); the map's stacked labels;
names and a line for Brim's bystanders; legs on the moving figure; the
hedge wash.

## The reset — Sessions 24 to 27 (2026-09-07 → 2026-09-09)

One branch, `claude/inklands-open-world-va3lgx`, PR #23. Six pillar engineers
worked in parallel on their own branches and were merged by hand in the order
camera → voice → scale → pen → first hour → things. 136 files, +9,818 / −917.
`npm run build` is green at every merge. Nothing in `design/archive/` binds
any more; `design/THE-RESET.md` is the diagnosis and `GAME.md` is the game.

### What changed

**You can always look (THE CAMERA).** Drag orbits, vertical drag pitches,
the wheel or a pinch dollies; `,` `.` turn; `R` recentres behind you. The walk
is relative to the lens (W is away from the camera). Nothing turns on its
own, ever. Every standee, field, figure, animal, horse and traffic sprite
faces the lens; things between the lens and the walker fade. The rig is
closer, so the walker reads. `check-camera.mjs` asserts the new invariants.

**The world talks back (THE VOICE).** Hand-lettered speech bubbles with a
tail to the speaker; twelve named people with lines by state, every unnamed
figure with a line; an answer line for every verb (READ, YOU LEARNED, YOU
CHOSE, FOUND, PINNED, 3 SKIPS…); a notebook on N with JOBS, HEARD, PLACES,
FOUND, CHOICES; an objective line top-left; choices read back by the person
within a minute or shouted across the top; pins on the map.

**The first hour (THE FIRST HOUR).** The bull charges every time. Nell shouts
"RUN. THE GATE. NOW.", slams it, and gives THE FOURTH NAME: read the signpost,
take the south road into Maple Court, read the milestone, bring the name
back; reward NELL'S CAP; then three pins and the horse. The keys are named
once, on screen, when they matter.

**Scale and motion (SCALE).** The sheet is not scaled; the walker's pace is
(walk 2.3, run 4.4). The Common takes ~80 s at a walk; coast to coast ~2¼
minutes at a run. A horse at the crossroads gallops at 10 u/s and comes to a
whistle (`H`). The bicycle goes anywhere flat and dry; the boat rows the
whole river; followers and things cross borders. Traffic: carts, cars with
horns, sails, gulls, larks, pigeons that scatter, a crowd in Brim's square,
sheep, a sentry, a rambler, tumbleweed, kites, bats, a rain curtain you see
coming, mill smoke, a snapping flag, sea glints, tower lamps at night.

**Things to do (THINGS).** A job registry with triggers; eleven more named
jobs from the eleven other named people, each with steps in the notebook, a
reward and a consequence said out loud; twelve stamps, one per land, counted
in the notebook; four toys with a score and an ink scoreboard (skimming, the
paper plane, the main-street time trial, the office chair); three monsters
that growl, chase, take your hat and are stopped by lamps and doors; night
falls with a shout. The 8:15 reads the jobs back: "WILL STOP FOR n OF 12".

**The pen (THE PEN).** Digits and punctuation in the hand; a 60-char line
letters in 2.5 ms and a 40-line page in 45 ms; `check-fps.mjs` with a
budget (the Common went from ~390 draw calls to ~135, terrain −130k
triangles, nothing out of view is a draw call); an adaptive render scale on
real frame time; the verbs' sounds (speech chatter in the land's voice,
toast, learned, found, done, score, page, pin, hooves, car-horn, crowd,
growl, roar, chase, night-falls, fanfare); a pen-drawn favicon; a loader
whose bar is the lands being drawn.

**Tools.** `tools/play-server.mjs` + `tools/play.mjs`: a stepped Playwright
session so an agent can play in game-time without a GPU. Cold-player and
critic prompts in `design/reset/`.

### What the cold player said

**Before (Session 23 build, `design/archive/critiques/cold-play-1.md`):**
understandable 3, alive 5, fun 3, beautiful 8. *"Nothing in the game says
this. There's no objective, no 'go to X', no reward when a land counts."*
*"After the fence, the only direction is a long wall with no visible
opening… I never actually got into the town on the box art."* *"Reading
cards was the only reliably rewarding action and there were two of them."*

**After (this build, integrator's harness run from the title, no
parameters):** at 0:04 the bull looks and Nell's bubble reads "RUN. THE
GATE. NOW." with "hold shift to run"; through the gate at 0:40 Nell says
"That bull is mine. It went for you because you looked at it. It does
that."; four presses of E later: "Read it. Bring me the fourth name and I'll
owe you.", the objective line reads NELL — READ THE SIGNPOST AT THE
CROSSROADS, and N shows THE FOURTH NAME with four steps and "for: NELL'S
CAP", ASKED, and THE 8:15 WILL STOP FOR 0 OF 12. **A full ten-minute cold
play and the six blind critiques have not been run on the merged build**:
the sessions that would have run them hit usage limits. That is the first
job of the next session (see `PROMPT.md`).

### The gate — round 1 (2026-09-10, the merged build, desktop)

The cold player stopped at game-second 216 (its ~90-command budget went
on Brim's back streets). At sixty seconds: *"I think it wants me to walk
to all twelve lands, talk to people and do small jobs for them, so that
the 8:15 will stop for each of them. Confidence: 6/10."* Scores:
understandable 5, alive 7, fun 5, beautiful 9.

**To a friend:** *"It's a walking-and-talking game drawn entirely in
pencil and watercolour, where you're a stick figure crossing a sheet of
paper split into twelve little lands, doing one small favour for each
so that a train called the 8:15 will stop there. Every sign and fence
and fountain has a paragraph of dry, lovely writing, and the world is
busy with bulls and pigeons and people, but at the moment it's easy to
get physically stuck and hard to tell who you can talk to."* Next time:
find the market cross and wait at the belfry to dusk; go and find Nell
("she's the one who shouted at me and I never met her"); walk west to
Longshore.

What actually happened: the first E read the crossroads signpost from
the middle of the bull's field (the prompt was the poster's, left over
from the title's cut); the bull charged and Nell shouted while the
player was behind an open note and the map; the player ran **north** to
the long fence, pressed E on the drawing of a shut gate, found the stile
by wandering and left the field that way; the gate never slammed, the
opening stayed on its first line for the whole session, no job landed,
the controls line (drag to look) never printed, and Nell was never met.
In Brim: E on a carter, a townsperson and a banner did nothing; the
market cross was never found (nearest approach 10 units, not pinned);
WAIT FOR THE BELL re-opened the note.

| pillar | verdict | the three changes named |
|---|---|---|
| THE CAMERA | REFERENCE | let the camera orbit or flip south · fade or cut foreground buildings · name the far skyline and the clock arch when they enter view |
| THE VOICE | REFERENCE | every drawn figure a line, or mark the mute ones · Marget or Nell reference one thing the player did · one real choice in the first ten minutes |
| THE FIRST HOUR | REFERENCE | market cross visible and on the map, a key on every prompt · Nell's command opens the gate she points at, drawn gaps walkable · WAIT FOR THE BELL passes time, a tell on talkable people |
| SCALE AND MOTION | REFERENCE | every drawn figure a line · WAIT FOR THE BELL advances the clock · moving things on the empty common, and the camera swings |
| THINGS TO DO | REFERENCE | bull, pigeons, crowd each pokeable · WAIT FOR THE BELL passes time · a visible mark on every talkable figure and prop |
| THE PEN | REFERENCE | depth-sort the walker and people against props · near buildings opaque, off the HUD · the figure whole at every distance |

Reports: `design/reset/rounds/round-1/`.

**Fixed after round 1** (named most: figures answer ×4, the wait ×3, the
opening/camera ×3):
- The opening survives any exit. Nell slams the gate when you are out of
  the field by any way (stile, gate, the fence's end), not only when the
  bull reaches the hedge; her shout pins THE FIELD GATE and the objective
  line reads NELL — RUN. THE GATE IS WEST, then NELL — AT THE FIELD GATE.
  E TO TALK; the fence nudges in the first minute and says which way the
  stile really is. The spawn's prompt is the spawn's (no signpost from
  the field).
- E is always answered. Unnamed figures reach 4.8 units and carry their
  role over their head as you come near (CARTER, SWEEPER…); E with nothing
  in reach has the walker say what is a step off ("Closer, and it says
  PUSH THE CART.") or that nothing is.
- WAIT is a verb. WAIT FOR THE BELL runs the day forty-eight times faster
  with the walker in the yard until the lamps are up (about twenty
  seconds from mid-morning), a step stops it, and the fact lands as
  before. Marget's line says "wait at THE BELFRY".
- A job step pins its own place: THE MARKET CROSS while it is the next
  step, then THE BELFRY.
- Hints hold in game time (they timed out on the wall clock, which on the
  stepped harness was before the next frame); a player who has not turned
  the lens in seventy seconds is told once how.
- The harness reports what a player sees: a read settles 750 ms for the
  fades, and a faded note's words are no longer listed as on screen.

### The gate — round 2 (2026-09-10, after the round-1 fixes, desktop)

The cold player stopped at game-second 245 (command budget). At sixty
seconds: *"walk around a hand-drawn world, read the things written on it,
carry what I read back to people, and slowly work out what 8:15 is…
the long goal is to get all twelve lands ready for something that comes
at 8:15. Sureness: 8/10."* Scores: understandable 7, alive 7, fun 6,
beautiful 9. **T1 holds. T2 holds.**

**To a friend:** *"It's a walk-and-read game drawn like a sketchbook: you
cross a paper world of twelve little lands, press E on signposts and
gates to read a paragraph of very good prose, and carry names and
errands between a handful of quiet people while a mystery about 'the
8:15' ticks up in your notebook. It feels like A Short Hike's gentleness
with Wind Waker's map-filling, and a bit of Kentucky Route Zero in the
writing."* Next time: get past Brim's south gate and find Marget; find
Val and see what "N of 12" means when a second land is done; reload and
choose "push the cart yourself".

What happened: the opening played through in 75 seconds — the shout,
the run west, TALK TO NELL, M, the signpost, the milestone, the choice
card, the cap on the figure's head, Nell and her cart gone from the
gate and standing in Brim. Then the player rode to Brim and could not
get in: the south gate's collision gap was 3.2 units in a 13-unit arch,
the player pushed at the wall four units off the road for forty
game-seconds, and nothing said so. Then the Downs: Joan's field, two
figures who would not talk, a "look" label floating in the margin.
Nell's lines, called from off-screen, were drawn over the walker's head.

| pillar | verdict | the three changes named |
|---|---|---|
| THE CAMERA | REFERENCE | a crane on every border crossing and an opening vista · Brim's gate visibly open and admitting · occluders dolly or line-fade, not grey slabs; teach mouse-look in ten seconds |
| THE VOICE | REFERENCE | the wall and the sheaves answer a push · Joan and the field workers say one sentence on E · bubbles anchored to the speaker, never the player |
| THE FIRST HOUR | REFERENCE | Brim's gate passable · a generous horse mount band · TALK TO JOAN, and the "look" label gone |
| SCALE AND MOTION | REFERENCE | Marget, Joan and Val walk, work and answer like Nell · open Brim · each land its own moving life |
| THINGS TO DO | REFERENCE | the "push the cart yourself" branch as a physics toy · one verb every drawn object answers · the horse as a toy with a generous mount |
| THE PEN | REFERENCE | Brim's gate passable and every blocked step a bump or a line · opaque ink drawings for the grey occluder slabs, z-ordered under the HUD · ink the bare terrain and hedges at distance |

Reports: `design/reset/rounds/round-2/`.

**Fixed after round 2** (named most: the gate ×5, silent pushes ×3, Joan
and the field ×3, the bubbles ×2):
- Brim's south gate admits 5.2 units (the north gate, the wood gate and
  Greyweather's widened in proportion); the wall nudge fires on the wall
  itself (the region line is the wall) and says EAST or WEST, ON THE ROAD.
- Pushing at anything solid for a second is answered by the walker
  ("Solid." · "Not through there." · "That's a wall. Round it, then.").
- A named person's name reads from fourteen units, so JOAN HARROW shows
  across her sheaves; the ask's pin is the middle of the row she reaps.
- A place with a card and no verb prompts LOOK AT THE SOUTH GATE, not
  "look".
- A speaker behind the lens is pinned at the top of the page, not over
  the walker's head.
- The horse's mount reach is six units. The harness settles 900 ms
  before a read.

### Known and open

- Coast to coast is 2¼ minutes at a run; the brief wanted 4–5. One constant
  (`App.WALK`) if the owner wants the slower world.
- The east road runs through the river for ~20 units east of its bridge
  (`layout.ts`); you leave the road on the south side to pass.
- The canyon is the stillest land (tumbleweed and a kite only).
- Rain curtain, gusts, horn, hooves, whistle and the new one-shots are
  unheard: the sandbox has no speaker. `tools/render-wavs.mjs` renders them.
- Reports exist for VOICE and SCALE (`design/reset/reports/`); the CAMERA,
  PEN, FIRST HOUR and THINGS sessions were cut off before writing theirs.
  Their commits are on `wt/camera-2`, `wt/pen-2`, `wt/first-hour`, `wt/things`.
- Mobile portrait was exercised by the pillar sessions, not by a cold player.
- The horse's mount prompt was "narrow" for round 2's player twice; the
  reach is six units now but the cause was not found (the horse wanders;
  a nearer place may take the prompt).
- Brim's back streets have drawn gaps that are solid (round 1, sixty
  seconds wedged against a house block).
- The field workers in the Home Field are not talkable figures; only
  routines (`life.ts` Figures) get a TALK prompt.
