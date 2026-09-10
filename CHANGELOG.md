# CHANGELOG

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
