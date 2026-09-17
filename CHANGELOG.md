# CHANGELOG

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
