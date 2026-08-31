# The INKLANDS quality bar

*Binding on every session. Adapted from margins' `design/QUALITY-BAR.md`,
which earned its verdicts — but margins is a **reference, not an
authority**: this is a different game, and its inherited laws hold only
where INKLANDS has ratified them (§3). If a session cannot meet the bar,
the session ships less scope — never a lower bar.*

---

## 1. The target

INKLANDS is being built to win: **Awwwards Site of the Day and upward**,
and to be the walk people send each other the way they send *Alto's
Odyssey*, *Journey*, *Sable*, and *A Short Hike* — a drawn open world
that feels authored in every frame.

**Every work this project is learning from is listed, scoped and
credited in `design/INSPIRATION.md`** — the small open worlds above, the
six big ones the owner named (RDR2, GTA, Fallout, Skyrim, The Witcher 3,
Goat Simulator), the knowledge games behind the hours argument, and
Calvino's *Invisible Cities*, which is the story's structure. Each entry
names the one thing we take and the one thing we refuse. Read it before
citing anything as a model.

**The world comes first, then the systems, then the story.** Owner
decision, 2026-08-28: the foundations that change how a land is authored
(elevation, camera, traversal, time) land before the remaining lands do.

**The story is now PICKED** (owner, 2026-08-29): **THE 8:15**, and it is
binding. `design/STORY.md` is the bible and `design/QUESTS.md` is its
content architecture — read both before authoring anything with a person
or a place-name in it. Two standing rules come out of them and apply to
every session, not only story ones:

- **The medium is the STYLE. It is never the SUBJECT.** No content about
  the paper, the pen, the drawing or whoever drew it. The ballpoint and
  the sheet's terrain vocabulary are CRAFT and stay exactly as they are.
- **Nobody crosses a border but the walker.** It is the engine of the
  whole story, so it constrains every land: no inhabitant may ever be
  placed, animated or written as leaving their own land.

`design/WORLD-SYSTEMS.md` remains the standing plan for everything that
is not a land, and `DIRECTION.md` is now the record of how the story was
chosen rather than an open question.

**And from Session 7 the story is MAPPED as well as locked.**
`design/THE-LINE.md` holds the four acts beat by beat and **settles the
ending**, which `STORY.md` §6 had flagged as a proposal;
`design/THE-WAITS.md` holds the twelve fables, each with its turn;
`design/THE-STRANGERS.md` holds the eight cross-land strangers and the
errand, encounter and unmarked inventories. All three are binding the
way `STORY.md` is, and a session authoring content reads them before it
invents any.

## 2. The verdict gates

Nothing is "done" because it is placed. It is done when it survives its
critic, judged on **real screenshots from the running game** — never on
specs, never on intentions.

- **The art director** — rejects anything that looks procedural,
  placeholder, or like a tech demo wearing a style. Reviews a contact
  sheet of the session's lands (wide, mid, and detail shots per land,
  from the shipping camera, **desktop and portrait**) blind against
  *Gris*, *Sable*, and margins itself. The bar: *they cannot tell which
  world had an art budget.*
- **The Awwwards juror** — scores design, usability, creativity,
  content on the whole build: title, first minute, one full land
  crossing, the map. The bar: Site of the Day contention, not "nice".

A gate returns **WOWED** or **NOT YET**. NOT YET comes with the fewest,
deepest mandatory fixes — never polish notes. Iterate until WOWED.
Critiques are saved to `design/critiques/` (numbered, dated, verbatim),
and a land that earned a WOWED may not be regressed by a later session.

**Verdicts earned so far:** THE COMMON + the Brim south face + the
title poster (WOWED, critique-art-1); THE KINGDOM OF BRIM interior +
CASTLE GREYWEATHER (WOWED, critique-art-2); the sheet's ELEVATION, the
redesigned camera, and all four of those lands re-audited on the new
ground with Greyweather moved onto a real ridge (WOWED,
critique-art-3 — the first sheet judged in both viewports); LONGSHORE
and THE WIDE BLUE, the first two lands authored ON that ground (WOWED,
critique-art-4); TRAVERSAL AND TIME — sprint as ink weight, roads that
carry, the rowboat, and the day cycle, with all six built lands judged
at **two hours of the day** and none of them regressed (WOWED,
critique-art-5); **THE STORIES** — knowledge as the content system, the
map made the record in three registers with the line inked once you have
walked it, Brim's wait authored end to end, and the voice pass over all
thirty-four notes including the premise line itself (WOWED,
critique-story-1, and the same file logs a new critic — see below);
**THE SCORE** — five instruments over twelve lands with a bed apiece and
an equal-power border, proved by a renderer instead of a camera and
drawn as a contact sheet in ink (WOWED, critique-score-1, and see the
gate below that this project could not run); **THE BEARING** — the
camera answers travel inside an authored envelope, the walk south has
ground in front of it for the first time, and the oldest visible defect
in the game (a name printed across the thing it names) is closed
(WOWED, critique-camera-1 — and see the second owner's gate below);
**FARM & FOREST** — THE HARROW DOWNS and THE PENWOOD, the first two
lands built on ground authored for them (THE HARROW, the mill rise, the
tarn's bowl) and the first land session whose "unregressed" is a number,
with both waits shipped end to end and **the Penwood's whole fable told
in a polyline: one road, and it is a circle** (WOWED, critique-art-6);
**THE DRY LANDS** — SPLITROCK CANYON and THE BLEACH FLATS, and the first
session to MOVE A LANDFORM: Session 4's tear was a good cut in the wrong
place (six units from the foot of the world's curled margin, with the
land's only trail thirty units clear of it) and it is in the middle of
its own rect now, audited across elevation, the road web, the river's
source and two protected framings, with **the depth tuned until
`check-terrain` printed −10.8 again** because a stranger's errand stands
on that number. **HOLT's four chalk marks are a sightline, not a note** —
four heights that line up with four things you can see from where they
are read, and a fifth that lines up with a roof — and AMOS carries water
forty units uphill both ways every night on a track that is not a road
(WOWED, critique-art-7); **THE NOW** — MAPLE COURT and GREYLINE CITY,
the only two lands in this world whose subject is the present day and
therefore the two the ballpoint does not flatter for free. They are
drawn AT RIGHT ANGLES TO EACH OTHER: **in Maple Court every mark closes**
(a hedge is a loop, a lawn is a kerb that comes back to itself, and the
street is a dead end with a turning circle on the end of it) and **in
Greyline City every mark leaves the frame** — which is also the first
land in this game to make the FRAME-TOP CEILING its subject rather than
its constraint, because a downtown is the one place where a building
cropped by the top of the picture is the correct picture. **THE END OF
THE SURVEY** is built and left unlettered, and `THE-LINE` §3.2's
protected corridor is an ASSERTION now (`tools/check-sightline.mjs`)
rather than a paragraph — the shipped draft broke it twice, in a
signpost and in a scatter, and nothing in this repository would ever
have said so. Plus two waits, both ends of one stranger, and **a fable
told in a paving slab** (WOWED, critique-art-8). **THE CUBICLE MILE is
the last scatter draft in the world** and is presumed NOT YET.

**AND FROM SESSION 9 A REGRESSION IS A DIFF AND NOT AN OPINION.**
"Unregressed" has meant a person looking at two contact sheets a week
apart, and it was never a claim anybody could check — two shots of one
framing in this project were never the same picture, because **five
clocks** (the paper grain, the standee wind, the ink-in cascade, the
walker's own breath and the water) move between two shutter presses and
every one of them is in every pixel. The last two were found BY the
diff, not before it. `tools/diff-sheets.mjs` pins all five, builds a
base git ref and the working tree, shoots the framings that carry the
verdicts through an identical protocol, and counts the pixels that
moved — separating THE PAGE (which may not move at all) from THE
WRITING OVER IT (which moves when a label is deliberately re-placed).
**A session that says a protected land is unregressed now says it with
a number.**

**AND IT EARNED ITS KEEP THE FIRST TIME A LAND SESSION RAN IT**
(Session 10). A corrugation authored for THE HARROW DOWNS shipped with
no east bound on it and ran clean across two other lands and out onto
the world's curled rim: eight per cent of the protected `curl-rim`
framing had moved, in a land the session never opened, and not one thing
in that session's own contact sheet could have shown it. **A regression
is now a thing a session finds in itself before anybody else does.**
The corollary is the honest half: a land session's own scope WILL touch
a protected framing that looks into it — `crease-east-road` stands at
(62, 62) and the right half of what it sees at distance is the Downs —
and the rule is unchanged. A framing may not move for a session's
convenience. When it moves because the land inside it was the scope, the
session says which framing, by how much, and what the verdict was
awarded on (`crease-east-road` was awarded on the fold, and the fold is
pixel-for-pixel what it was).

**AND ONE GATE IS THE OWNER'S, because no tool in this repository can
run it** (Session 8). The score can be rendered, measured, plotted and
asserted, and not one of those is a listen. `tools/check-audio.mjs`
proves that twelve lands are twelve sounds, that a border does not dip
and that nothing clips; it cannot say whether any of it is any good.
So a system whose product is not a picture ships with its evidence
handed over — `tools/render-wavs.mjs` writes nineteen files — and the
session states in its log that it could not perform the gate. **A
session that claims a sound is good is lying; a session that hands over
the evidence is not.**

**AND THE SECOND OF THOSE GATES HAS NOW BEEN RUN, AND IT FAILED**
(owner, 2026-08-31, after Session 11 shipped). The owner played the game
and reported that **the desktop camera makes them feel sick**, that the
phone's joystick appears on the desktop, and that they could not run on
a keyboard. All three were reproduced.

**Every automated check stayed green while that was true.**
`check-camera.mjs` still asserts, correctly, that the envelope never
leaks, that the bearing is continuous round the whole circle of travel,
and that a stopped walker comes home to exactly zero. What no check
asked was **how fast the frame rotates, in degrees a second, under an
input a player can produce** — and the answer is up to twenty, with a
forty-three-degree swing for one change of mind about which way to walk,
coupled to an eight-unit dolly. That is the number the owner felt and
there was no assertion anywhere near it.

So the rule Session 8 wrote for the ear and Session 9 generalised for
the camera gets the corollary it has now earned the hard way:

> **A system whose gate has not been run is not done. It is SHIPPED AND
> UNJUDGED, and those are two different words.** A green check is
> evidence that the thing does what its author described. It is not
> evidence that what its author described is worth doing.

It also cost less than it might have, and that is the other half of the
lesson: the defect was found in an afternoon of play by the one person
who had never been asked to play, three sessions after it shipped. **The
gates this project cannot run should be handed over the week they are
owed, not carried in a list.**

**AND A SECOND GATE IS THE OWNER'S, FOR THE SAME REASON** (Session 9).
A camera is not a picture. The bearing can be asserted — the envelope
never leaks, the bearing is continuous round the whole circle of travel,
a stopped walker comes home to exactly zero in 2.5 game seconds, the
walk south sees three times the page it did — and **not one of those is
the question, which is whether it HELPS or whether the world wobbles.**
That is a thing a person feels over minutes of walking and no tool in
this repository can perform it. So the rule Session 8 wrote for the ear
generalises: **a system whose product is not a picture ships with its
evidence handed over and the session states plainly that it could not
run the gate.** For the score that was nineteen WAVs; for the camera it
is the walk-south capture, every station shot twice — the shipped page,
then this one — so the owner is comparing rather than judging cold.

**AND THE MAIN STORYLINE HAS NEVER BEEN READ BY A CRITIC** (owner,
2026-08-30). Every gate this project has run has judged **pictures**.
Session 7 mapped THE LINE — four acts, the ending settled, the whole
spine of the game — and the only thing that read it was the session
that wrote it. The twelve WAITS at least got a blind read (§3 of
`critique-story-1.md`); **the acts got nothing.**

So a story gate is owed, and it is not the same job as the art
director's. What it should ask, and none of it is about how anything
looks:

- **Does Act I teach its three facts without stating them** — everybody
  is waiting, nobody can leave, you can?
- **Does the turn survive not being said?** Read the twelve waits'
  contributions cold (`THE-WAITS.md` §13) and see whether a reader
  assembles *they were all waiting for each other* — and whether they
  can do it WITHOUT having been told there is something to assemble.
- **Does the ending land, or is it a shrug?** `STORY.md` §6 flagged
  that risk in the file itself and `THE-LINE.md` §5 settled the beat;
  neither has been tested on anybody.
- **Is Act III a reveal or an anticlimax?** The player cannot see the
  whole line — 480 units against 201 units of haze — and that was
  argued as a strength. It has never been checked against a reader who
  did not make the argument.
- **And does any of it work if the player does the acts out of order?**
  Nothing is gated. A player who walks straight to the Cubicle Mile in
  the first ten minutes is supposed to find that none of it means
  anything yet, and that is either the game working or a hole.

**Run it as an adversarial read, not a review.** A critic who is trying
to find the shrug is worth ten who are trying to enjoy it.

**IT HAS NOW RUN ONCE, and it returned NOT YET**
(`design/critiques/critique-story-2.md`, Session 8, beside the score
because it needs no build). Two mandatory findings and three
recommended, none of which re-open `THE-LINE.md` §5:
- **Act I's second and third facts have one teacher between them**, and
  it is optional and directional — everything downstream of *nobody can
  leave* and *you can* hangs on Nell stopping at the Brim border, which
  only happens to a player who walks north having met her. The
  co-walker wants to be a rule of the world on any road out of any
  land, rather than a scripted beat on one.
- **The ending's default witness sees one stop**, and nothing
  guarantees it is a land they answered — so the likeliest single
  ending in the game is a train stopping at an empty platform, which is
  the shrug arrived at from a direction `STORY.md` §6 did not consider.
  The 8:15 stops in order from the north, so it can **arrive already
  carrying the lands above you**, visible through the windows, for no
  new content and no change to the ending.
Like the STORY EDITOR, this critic is **a proposal until the owner says
otherwise** — unlike the art director it judges something that does not
exist yet, and whether NOT YET blocks the acts or merely annotates them
is the owner's call.

**A third critic is PROPOSED and awaiting the owner** (Session 7): the
**STORY EDITOR**, who reads a wait blind — the person, the places, the
turn, the change, nothing else — and has to be able to say what that
land BELIEVES, without being told and without the word "waiting"
appearing in the answer. If they cannot, the wait is a description and
not a fable. It has been run once and logged
(`design/critiques/critique-story-1.md` §3); it is not binding until the
owner says so.

**And from Session 6 on, a protected framing is protected at TWO HOURS.**
The day cycle is not done until dusk is as good as noon, so every
contact sheet shoots its protected framings at a neutral hour and at
one of the two ends (`HOUR=19.6 node tools/shoot-first-minute.mjs`).
Eight in the morning to four in the afternoon is bit-for-bit the
shipped page by construction, so the neutral pass is the same
regression check it always was.

## 3. The permanent constraints

- **Three.js + GLSL. Zero image assets.** Every mark via
  `src/engine/ink.ts` on canvases; every word hand-lettered. No binary
  art, ever.
- **Sketch-like but real.** Ballpoint line work over muted watercolor
  wash. Washes come only from `palette.ts` `WASH`; nothing outside that
  file invents a color.
- **One sheet, and the sheet has a shape.** The world is a single page
  on a desk. The rects in `src/world/layout.ts` are the shared truth of
  terrain, map, audio and collision — move content freely, move borders
  only with a layout-wide audit (map, roads, river, moods, step zones).
  The page is **not flat**: it creases, curls, buckles and tears (see
  `design/WORLD-SYSTEMS.md` §1). `src/world/elevation.ts` is the ONE
  authority on where the ground is — the mesh, the shading, the walker,
  every prop and all collision read the same grid, and nothing else may
  invent a height. Elevation is drawn from the paper vocabulary, never
  from generic hills, and standees stay vertical on slopes — they are
  cutouts standing on a warped page. **A fold is DRAWN, not shaded:**
  tone where the page leans out of the light, a pooled ink line down the
  bottom of a crease, and pen hatching down the fall line of anything
  that is actually a cliff. A smooth gradient on a hillside is an
  airbrush, and it cost this project two critique rounds to learn it.
- **Water cannot climb a hill.** The river, the sea and the ponds have
  BEDS (elevation.ts), and the river's falls monotonically from source
  to mouth. Anything blue that goes uphill is a bug, always.
- **`node tools/check-camera.mjs` whenever the camera is touched.** The
  envelope is the one number standing between this world and a stack of
  card seen sideways, so it is asserted rather than trusted: nothing —
  travel, a peek, a road that carries, all at once — gets past it; and a
  stopped walker arrives at EXACTLY zero rather than approaching it.
  **AND SINCE SESSION 12 IT ASSERTS A RATE AND NOT ONLY A PLACE**, which
  is the assertion whose absence let a system that made people sick pass
  six green checks: **walking may not turn the frame at all** (1°/s,
  which is how you write zero and survive an easing term), a peek — a
  rotation the player is holding a key to get — is bounded at 45°/s held
  and 80°/s reversed mid-gesture, and **the rig may never give ground
  faster than the walker covers it** (4.1 units a second, the walk
  itself). A camera's defects live in the JOURNEY between two framings
  and every check before Session 12 asked only about the framings.
- **`node tools/check-fields.mjs` whenever anything is drawn as an
  instanced field, and especially anything that MOVES.** The owner
  found, after nine sessions, that every animal in the game went
  invisible the moment it changed posture — a hidden pose was parked
  four thousand units away and the ink wave scheduled its birth ninety-
  seven seconds out, so it drew at ghost opacity. **No contact sheet in
  this project could ever have caught it**, because a contact sheet
  photographs a walker standing still and the bug only fires when a
  creature changes pose. The check drives the walker AT the animals and
  asserts that no field is half inked in.
- **`node tools/check-terrain.mjs` before you look at anything.** It
  bundles the height field and asserts the amplitude envelope, that no
  road is severed, that every standing place is reachable on foot from
  the spawn, and that Greyweather's south face still refuses. Cheaper
  than a screenshot and it catches what a screenshot cannot.
- **THE CAMERA'S RESTING BEARING IS DUE NORTH, AND IT DECIDES LAYOUT.**
  A thing the player walks ALONG runs north–south; a thing they LOOK at
  is north of where they stand. Session 5 lost two rounds to a boardwalk
  laid east–west and a regatta staged west of its viewpoint: check the
  bearing before placing, not after.
  **Session 9 gave the camera a bearing and did NOT change this law.**
  A stopped walker is at yaw zero by contract, so every composition in
  this game is still judged due north; the envelope is 26° on desktop
  and 12° in portrait, so the most a *moving* walker ever gets is a
  quarter-turn's lean, and a place staged east of its viewpoint is still
  sixty-four degrees out of frame. The envelope cannot grow, either —
  past about 35° a paper cutout seen off-axis stops reading as paper
  (`WORLD-SYSTEMS` §2 has the table). **Nothing licenses a land to be
  laid out east–west.**
- **60fps on mid-range mobile**, portrait playable, DPR capped at 2.
  A land that cannot hold frame rate is redesigned, not shipped slow.
- **The build stays green.** `npm run build` (tsc + vite) passes before
  any commit; pushes auto-deploy, so never push what fails locally.
- **No faces.** The walker has two dots; nobody else has a face.
  Doodle-folk are posture, placement and clothing — which is exactly why
  they must express through routine instead (WORLD-SYSTEMS §5).
- **Mobile and desktop are both first-class.** Every contact sheet is
  shot in portrait (390×844) as well as desktop (1280×720), and the art
  director reviews both. A composition that only works in landscape is
  not done.
- **AND THE CHROME IS SHOT TOO** (added after Session 6, when a player's
  phone screenshot found a note card whose text had been running off the
  side of the screen since Session 1). Everything the player READS — the
  note card, the region card, the hint, the interact prompt, the map —
  is hand-lettered onto a CANVAS, and a canvas does not reflow: every
  one of them needs a width measured at the size it will be delivered
  at. `node tools/shoot-mobile.mjs` shoots all of it at 320, 360, 390
  and 430 points, with the longest note and the longest land name in the
  game. Five sessions of world screenshots could not have caught it,
  because not one of them ever opened a card.
  **AND FROM SESSION 12 THE RULE HAS A DESKTOP HALF, because "the chrome
  is shot" had only ever meant "the chrome is shot on a phone."** The
  owner found the phone's joystick raising its ring under a mouse cursor
  at 1280×720 — a control from the wrong device, on screen, in the
  shipped build, for three sessions — and **no tool in this repository
  had ever pointed a mouse at this game.** `shoot-mobile.mjs` shoots
  five rigs now, and its joystick step is an ASSERTION with the opposite
  expectation on each: a touch drag must raise the stick, a mouse drag
  must raise nothing. A control is a thing that can be on the wrong
  device, and that is a defect class no world screenshot can hold.
- **Inherited rules must be re-ratified or dropped.** This engine was
  ported whole from margins, and some of its laws are margins' story
  rather than our design — the flat ground was one, and it cost us a
  critique round before anyone noticed. When a rule blocks the world,
  ask first whether INKLANDS ever chose it. `design/WORLD-SYSTEMS.md`
  keeps the running audit.

## 4. What "good" means for a land

The margins environment bar, promoted to law for an open world:

- **THE SHOT.** Every land owns one composition people share
  unprompted, reachable by walking, framed by the real camera. If a
  land has no shot, the land is not done — density is not the fix,
  composition is.
- **Nothing reads as an array.** No even spacing, no repeated
  silhouettes in one frame, no uniform density, no dead symmetry, no
  "misc props". Scatter is a starting fluid, not a finish: every land
  gets authored clusters, deliberate voids, occlusion layers
  (foreground element / subject / haze), and edges that decay rather
  than stop.
- **Places, not coverage.** A land is 4–7 NAMED places with walks
  between them, not a filled rectangle. The walks earn their length
  with midpoints — a bend in the road, a lone silhouette, a change
  underfoot — or they shrink.
- **Depth is staged.** Every frame has a near thing, a subject, and a
  far silhouette in fog. The vista camera exists for this; use it.
- **Motion is life.** Each land has at least two idle motions (banners,
  gulls, smoke, sails, weeds, water) and one that responds to the
  player. A still frame should still imply the wind.
- **Sound is place.** Crossing a border must be audible blind, and from
  Session 8 that is four things and not one: the land's **instrument**
  and **register** (`LAND_VOICE`, with the reason written in one line —
  a land whose voice cannot be justified in a line has not been given
  one), its **bed** (`BEDS` — the room, and the quietest thing in the
  mix), its **step timbre**, and at least one land-specific ambient
  event (`Audio.event`). Five instruments cover twelve lands and the
  doubling is by FAMILY: two lands on the plucked string in different
  registers is a family, twelve lands on twelve unrelated instruments is
  a sound library. **Nothing announces a land's voice and nothing lists
  it** (INSPIRATION, RuneScape §6): there is no track name anywhere in
  this game.
- **The seams are art.** Border zones, road junctions, bridge
  approaches and the coastline are compositions of their own — the
  places players actually linger.

## 5. Session cadence (how the world grows)

Every session is one of two shapes, and both end: build green,
committed, pushed, `SESSIONS.md` handoff updated, contact sheet shot.

1. **A land session:** take 1–2 lands. Write or update their spec
   (`design/specs/`, per `LAND-SPEC-TEMPLATE.md`) — cheap, one pass,
   the spec serves the build. Rebuild the land to spec. Shoot the
   contact sheet with `tools/shoot.mjs` + walked framings. Run the art
   director gate on the screenshots. Fix until WOWED. Log the verdict.
2. **A systems session:** a cross-cutting pass (motion & ambient audio,
   performance & mobile, UI & map polish, the Awwwards juror on the
   whole build) that raises every land at once. Same gate discipline.

`PLAN.md` holds the ladder. Judge screenshots by LOOKING at them; a
session that never rendered its own work has not reviewed it.
