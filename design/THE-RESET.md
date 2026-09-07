# THE RESET — review, diagnosis, and the plan from here

*Written 2026-09-07 after Session 23, at the owner's request: step back,
review what was built, say how to improve it, and plan the sessions that
do so. The owner's words: "we've gone off the rails and it's no longer a
fun or understandable game. It should feel like an open world game
that's alive and immersive. Don't feel like we need to adhere to the
rules that are currently in place."*

*This file supersedes the ladder in `PLAN.md`, the law list in
`design/QUALITY-BAR.md` §3, and every "must never" in `design/`. Those
files stay as history. Nothing in them binds a session any more unless
this file says so.*

---

## 1. The verdict

INKLANDS is a beautiful diorama that refuses to talk to the player.

The art, the engine, the world simulation and the premise are real and
worth keeping. What is broken is everything that sits between a player
and that world:

- a camera that only ever looks north, so you cannot look around;
- a content system that is forbidden, by its own rules, from telling
  you what you learned, what you did, or what your choice changed;
- no goal a player can see, ever;
- a world about two running minutes wide, cut into twelve yards by a
  border rule that stops every mount, animal and toy at a line;
- a cast of ninety-odd people who never say a word;
- and a development process that optimised for what a headless sandbox
  could assert (212 assertions, 92 bit-identical framings) instead of
  what a person could feel (three owner gates unrun for eight sessions,
  112 sounds nobody has heard).

The owner diagnosed this on 2026-09-01: *"the game was built to be read.
It has to be built to be played."* That was right. The eight sessions
since answered it with more things to read: second doors whose
consequences are hidden by rule, rooms, errands, a cast, all authored as
literature and all undiscoverable without a walkthrough URL.

## 2. What is worth keeping

These are assets. Nothing below proposes touching them except to use
them harder.

- **The look.** Procedural ballpoint over watercolour wash, zero image
  assets, every word hand-lettered. It is distinctive and it is the
  identity of the project. Keep it absolute.
- **The engine.** Elevation as a paper vocabulary, a forty-minute day,
  weather as a pure function of time, sixty-three NPC routines on a
  clock, animals that react, procedural audio with a voice per land,
  five mounts, cutaway interiors, collision, footprints as ink, save.
  Performance is 55 to 61 fps on the owner's Mac at 332 KB gzipped.
- **The premise.** THE 8:15: a world organised around a train with no
  track, twelve lands on one road, and an ending where the train comes
  and stops twelve times. This is a good idea and it has not yet been
  played by anyone.
- **The cast the owner asked for.** Vikings, aliens, surfers, a
  barista, a design studio, monsters, a bull, a goat, a dachshund.
- **The opening instinct.** Bull, run, gate, four things on the horizon.
- **The tools that earn their keep.** `npm run build`, `check-terrain`,
  `diff-sheets` (as a tool, not a gate), the Playwright harness, and
  the `?debug` hooks.

## 3. Why it stopped being fun or understandable

Ranked by how much each one hurts.

### R1. The game is forbidden from telling you anything

Counted across `design/` and `src/`: "nothing says" 29 times, "nobody
says" 18, "nothing anywhere says" 15, "no count" 15, "nothing counts"
12, "nothing announces" 10. The knowledge system's own header lists
three things it must never become: a checklist, a gate, and a
notification. There are seventeen distinct facts a player can learn in
the whole game and not one of them is ever shown. A choice card's
consequence lands "in every later save", often in a different land at a
different hour, and "nothing says which was right".

From the player's chair this is indistinguishable from nothing
happening. Fallout's choices feel consequential because the game tells
you they were: people react, reputation moves, the ending reads it back
out loud. Silence was chosen here as a house style. It reads as a bug.

### R2. The camera only looks north

A stopped walker is due north "to the pixel". Walking may not turn the
frame. A held key leans it 26 degrees and it snaps back. Everything
behind you does not exist; the bull chase had to be staged east to west
so the pursuer could be seen at all, and the rule forbids laying a land
out east to west. An open world you cannot look around in is a
tabletop model with a walking figure on it.

The owner's motion sickness came from an automatic yaw, not from
rotation. The fix removed player-controlled rotation too. The rule that
"a paper cutout past 35 degrees stops reading as paper" is an untested
aesthetic assumption; standees that always face the camera (Paper
Mario, Octopath, Don't Starve) read as paper from every angle.

### R3. There is no goal a player can see

No objective line, no journal, no marker, no quest with a name. The
signpost has four words on it. Progression is "knowledge" and nothing
shows what you know. The content is so hard to find that every session
since 15 has shipped a scripted play sheet with `?hour=12` in the URL so
the owner could locate what was built. A game whose author needs a
walkthrough to find its content has not shipped that content.

### R4. The world is one running minute wide

The sheet is 760 by 560 units. The walk is 4.1 units a second and the
run 6.2. Coast to coast at a run is about two minutes; across a land,
thirty to fifty seconds. Twelve "lands" are twelve neighbourhoods.
Then the border rule takes the meaning out of the mounts: the bicycle,
the dog, the goat and the cart all stop at a line under a minute away.
"Hours from depth, not map" produced hours of authored text nobody can
find, not hours of play.

### R5. Nobody in the world talks

"No faces, so no dialogue" does not follow. Ninety-odd people with
routines, twelve with names and a wait each, and not one of them says a
word to you. Speech is the cheapest and densest source of life, goals
and humour a game has, and hand-lettered bubbles in the house voice
would fit the style exactly. This is the biggest wall between the player
and the world and it was built on purpose.

### R6. The process outran the product

22,800 lines of design documents against 43,600 of source. Sixteen art
critiques, four story critiques, a law list of about thirty clauses, a
315 KB session log, and a next-session prompt that lists twenty files to
read before opening the code. Sessions were built in a sandbox at three
and a half frames a second with no GPU and no sound, so they built what
could be asserted rather than what could be felt. The critic agents
judged contact sheets of a walker standing still. Nobody, agent or
owner, has played a minute of it as a player since Session 18's local
QA pass, and that pass found the walker could walk through every
building in the world.

### R7. The first hour has one beat, then nothing

The bull works. After the gate nothing hands you a job, nothing names a
destination as a destination, and the four lures are things to look at,
not things to do. The cold playtest in §7 is the evidence.

## 4. The six pillars that replace the laws

Everything in `QUALITY-BAR.md` §3 is retired except the last pillar.

1. **You can always look.** A free orbit camera under the player's
   hand (right-drag, two fingers, or a stick), movement relative to the
   camera, gentle auto-follow behind the walker, never an automatic
   yaw on its own. The world is drawn to be seen from every side.
2. **The world talks back.** Every action gets an immediate visible
   and audible answer. People speak, hand-lettered, in the house
   voice. Learning something is shown as it happens. A choice shows its
   consequence within a minute and is written down.
3. **You always know something you could do next.** A notebook in the
   walker's hand: who asked for what, what you have heard, where things
   are, what you have found. A map with pins. A first job in the first
   minute. Never one mandatory path; always three visible options.
4. **The world is big and busy.** A land is a place, not a yard. Mounts
   go anywhere. Something moves in every frame: traffic on the roads,
   birds, crowds, weather you can see coming.
5. **Play, not reading.** Toys, chases, races, collections, hats, a
   scoreboard wherever a scoreboard is funny. Progression the owner
   asked for: things to find, and a count of them.
6. **Keep the pen.** Zero image assets, procedural ballpoint and wash,
   hand lettering, procedural sound, 60 fps on a phone. This is the one
   rule that stays absolute, because it is the identity.

### Retired on purpose

- The due-north camera and every composition rule that depends on it.
- "Nothing says", "nobody says", "nothing announces", "no notification".
- No dialogue.
- "No thing crosses a border." Keep it only as a story fact about the
  twelve named people who are waiting, if the story still wants it.
  Animals, mounts, toys and the walker's companions go where the
  player goes.
- Protected framings and `diff-sheets` as a gate. Keep as a tool.
- The play sheet with `?hour=` parameters. The only play instruction
  from here is the URL.
- The twenty-file reading list. A session reads `GAME.md` and this file.

## 5. The plan

Six phases. Every phase ends the same way: a fresh agent that has read
no design document plays the build cold for ten minutes and reports;
a second agent judges that play blind against a named reference game;
and the owner plays with nothing but the URL. Sessions are numbered
from 24 and each is roughly one working session; a phase may take
more if the cold player says so.

### Phase 0, Session 24: the reset

- Move `design/` to `design/archive/`. Write `GAME.md` (two pages: what
  the game is, the six pillars, what exists today, how to run and test
  it), `CHANGELOG.md`, and `TODO.md`. Cut `PROMPT.md` to one page.
- Build the cold-player harness: a Playwright script that plays in real
  time (headed where a GPU exists, the harness clock where not), records
  a screenshot every few game seconds into a strip, and a rubric the
  critic scores against. This is the gate for every later phase.
- Fix the three faults the last local QA pass ranked first if any are
  still open: the first-minute trap, collision, label placement.

### Phase 1, Sessions 24 to 25: the camera and the hands

- Free orbit camera. Standees face the camera. Movement relative to the
  camera. Follow behind the walker with easing capped for comfort.
  Rotation only ever under the player's hand. A recentre key.
- Collision that holds, a run that reads, a phone rig with a stick and
  a look gesture.
- Gate: the cold player says "I can look around and go where I want."

### Phase 2, Sessions 26 to 27: the voice of the world

- Speech bubbles, hand-lettered. Every named person has lines by state
  (idle, met, asked, done). Unnamed people get one line each.
- A notebook (`N` or a button) in the walker's hand: jobs, things
  heard, places named, things found, choices made and what they did.
- A "you learned" line when knowledge lands. Map pins for anything a
  person names. Choice consequences visible within a minute.
- Gate: the cold player can state the goal and two things to do next.

### Phase 3, Sessions 28 to 29: the first hour as a teaching plateau

- Keep the bull. Then Nell gives you a job with a name that crosses one
  border, teaches talk, map, notebook and one choice, and comes back to
  her for a reward you can wear. The map opens the next three jobs.
- The first ten minutes are directed. After that the world opens.
- Gate: the cold player describes the game in two sentences and names
  three things they want to do.

### Phase 4, Sessions 30 to 32: scale and motion

- Recommended: scale the sheet two times with the existing streaming,
  spread the twelve lands with wild ground between them, and give the
  bicycle and a horse the whole map. Alternative: keep the sheet and
  halve the walk speed with mounts everywhere. The owner decides; the
  first is better and costs more.
- Traffic: carts on the king's road, cars on main street, boats on the
  water, birds, a crowd in Brim's square, weather visible at distance.
- Gate: the critic picks INKLANDS against A Short Hike for "does the
  world feel inhabited".

### Phase 5, Sessions 33 to 35: things to do

- The twelve waits rewritten as twelve jobs with a name, a giver, steps
  the notebook shows, a reward, and a consequence the world says out
  loud. The 8:15 stays the finale and reads them back.
- One collection counted in the notebook (twelve hats, or the
  timetable's twelve names stamped).
- Four repeatable toys with a score: stone skimming, the paper plane's
  distance, a bicycle time trial down main street, the office chair.
- The monsters as chases. Night as a reason to get indoors.
- Gate: the critic picks INKLANDS against Untitled Goose Game for
  "did I want to keep messing with it".

### Phase 6, Session 36 on: polish and the juror

- Mobile portrait, the title, load time, the two lands under 55 fps.
- Sound heard: an agent analyses every rendered voice against a
  reference and the owner listens to the pack once.
- The Awwwards pass, last, on a game that is already fun.

## 6. Decisions that are the owner's

Each has a default so no session blocks on it.

| decision | default if unanswered |
|---|---|
| Scale the sheet two times, or slow the walker | scale the sheet |
| Do the twelve named people still stop at their border | yes, they alone |
| Speech in full sentences or fragments | short sentences, house voice |
| Keep the interiors | yes, as rooms you can talk in |
| Archive `design/` now | yes, at the start of Session 24 |

## 7. The evidence

The cold playtest and the contact sheet that ground this review are
recorded below, verbatim where they are quotes.

### 7.1 The cold playtest

An agent that had read none of the design documents, the README or the
source played the Session 23 build from the title screen for about
fifteen minutes with keys, mouse and touch only. The full report is
`design/critiques/cold-play-1.md`. Its scores:

| understandable | alive | fun | beautiful |
|---|---|---|---|
| 3 / 10 | 5 / 10 | 3 / 10 | 8 / 10 |

What it said, in its own words:

- On the goal: *"nothing in the game says this. There's no objective,
  no 'go to X', no reward when a land counts."* It inferred the goal
  from the map's footer and gave itself confidence 6 of 10.
- On the prompts: *"PUSH THE CART names an action, gives no key, and no
  key I tried did it."* *"LEAN ON THE STILE was actively misleading"*
  because the hint had called the camera key "lean". It spent five
  experiments on the stile before walking through it by accident.
- On the wall: *"After the fence, the only direction is a long wall
  with no visible opening. I ran west along it for a long time... then
  could not get into the gate."* It ended the session outside Brim,
  having read the card that says the gate is permanently open.
- On the map: *"the most useful screen in the game: the only place the
  goal is implied. But the wall that blocked me for 5 minutes is not
  drawn on it."*
- On what worked: *"the cow walking up to stand beside me while I did
  nothing: the first thing the world did unprompted, and it was
  funny."* *"Reading cards was the only reliably rewarding action and
  there were two of them."*
- To a friend: *"It's a gorgeous ink-on-paper walking game... Right now
  it doesn't tell you what to do or how, so I spent most of my time
  walking into a fence and then a wall and never actually got into the
  town on the box art."*

Two things in that report are worth more than the scores. The bull did
not charge (it stood beside the walker like a cow), so the one scripted
beat in the opening did not fire in the sandbox and nobody knew,
because every check that guards it passes. And the player never found
the crossroads from the title screen, so the four lures, the signpost
and the whole "where do I go" answer were never seen. R3 and R7 are
that report.

### 7.2 The contact sheet

`tools/shoot.mjs` at noon, both rigs, standing still and facing north
in each of the twelve lands. What it shows, land by land, is the same
thing: a beautifully drawn place with a pea-sized figure in the middle
of a lot of empty ground and a prompt floating in a corner away from
the thing it names. Specific defects visible without playing:

- Brim Square: the walker stands inside the fountain's drawing and the
  prompt "LISTEN TO THE FOUNTAIN" sits in the bottom-right corner.
- The Common: three labels ("THE OLD WELL", "the common", "THE WELL")
  stack over the keep in the background rather than over the well.
- The Downs: the mill fills the frame from the walker's feet to the top
  edge; the camera cannot back off or look up because it cannot turn.
- The Cubicle Mile and Greyline: a car park and a crossing, empty at
  noon, with the cast that Sessions 19 to 20 authored not in frame.
- The Penwood's tarn is the one frame that holds a mood on its own,
  and it is the land the owner singled out as good.

The desktop sheet and the first-minute sheet are reproducible with
`OUT=<dir> node tools/shoot.mjs` and `node tools/shoot-first-minute.mjs`.

## 8. What this session did not do

- It did not change game code. Every finding above is a finding; the
  fixes are Session 24's and later.
- It did not archive `design/`. That is destructive and the owner's
  call; §6 records the default.
- It did not run the ear gate or the feel gate. Nothing in a sandbox
  with no speaker and no GPU can.
